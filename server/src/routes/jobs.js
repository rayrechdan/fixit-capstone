const express = require('express');
const prisma = require('../db');
const { validateJob, validateReview, parseId } = require('../validation');
const { HttpError } = require('../middleware/errors');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every job route needs a logged-in user
router.use(requireAuth);

// What a pro is allowed to move a job to, from each status
const NEXT_STATUS = {
  accepted: 'on_the_way',
  on_the_way: 'done',
};

// Related data we send back with each job
const jobDetails = {
  service: true,
  pro: { select: { id: true, name: true, phone: true } },
  customer: { select: { id: true, name: true, phone: true } },
  review: true,
};

// Loads a job by the :id in the URL, or throws 404
async function findJob(rawId) {
  const id = parseId(rawId);
  if (id === null) throw new HttpError(400, 'id must be a positive whole number');
  const job = await prisma.job.findUnique({ where: { id }, include: { service: true, review: true } });
  if (!job) throw new HttpError(404, `Job ${id} not found`);
  return job;
}

// POST /api/jobs  - a customer books a job
router.post('/', requireRole('customer'), async (req, res) => {
  const { errors, value } = validateJob(req.body);
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);

  const service = await prisma.service.findUnique({ where: { id: value.serviceId } });
  if (!service) throw new HttpError(404, `Service ${value.serviceId} not found`);

  const job = await prisma.job.create({
    data: {
      ...value,
      customerId: req.user.id,
      // the price is copied now, so it cannot change after booking
      priceUsd: service.fixedPriceUsd,
    },
    include: jobDetails,
  });

  res.status(201).json({ data: job });
});

// GET /api/jobs/mine  - customers see the jobs they booked, pros see the jobs they accepted
router.get('/mine', async (req, res) => {
  const where = req.user.role === 'pro' ? { proId: req.user.id } : { customerId: req.user.id };
  const jobs = await prisma.job.findMany({ where, include: jobDetails, orderBy: { createdAt: 'desc' } });
  res.json({ count: jobs.length, data: jobs });
});

// GET /api/jobs/open  - pros see the requested jobs in their own trade
router.get('/open', requireRole('pro'), async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: 'requested', proId: null, service: { category: req.user.trade } },
    include: jobDetails,
    orderBy: { scheduledAt: 'asc' },
  });
  res.json({ count: jobs.length, data: jobs });
});

// PATCH /api/jobs/:id/accept  - a pro takes a job (first to accept gets it)
router.patch('/:id/accept', requireRole('pro'), async (req, res) => {
  const job = await findJob(req.params.id);

  if (job.service.category !== req.user.trade) {
    throw new HttpError(403, 'This job is not in your trade');
  }

  // updateMany with status "requested" in the WHERE: if two pros click at the
  // same time, only the first update matches, the second one changes 0 rows
  const result = await prisma.job.updateMany({
    where: { id: job.id, status: 'requested', proId: null },
    data: { proId: req.user.id, status: 'accepted' },
  });
  if (result.count === 0) throw new HttpError(409, 'This job was already taken');

  const updated = await prisma.job.findUnique({ where: { id: job.id }, include: jobDetails });
  res.json({ data: updated });
});

// PATCH /api/jobs/:id/status  - the assigned pro moves the job forward
router.patch('/:id/status', requireRole('pro'), async (req, res) => {
  const job = await findJob(req.params.id);

  if (job.proId !== req.user.id) throw new HttpError(403, 'This is not your job');

  const allowed = NEXT_STATUS[job.status];
  if (!allowed || req.body.status !== allowed) {
    throw new HttpError(400, `A job that is "${job.status}" cannot move to "${req.body.status}"`);
  }

  const updated = await prisma.job.update({
    where: { id: job.id },
    data: { status: allowed },
    include: jobDetails,
  });
  res.json({ data: updated });
});

// PATCH /api/jobs/:id/cancel  - a customer cancels a job nobody accepted yet
router.patch('/:id/cancel', requireRole('customer'), async (req, res) => {
  const job = await findJob(req.params.id);

  if (job.customerId !== req.user.id) throw new HttpError(403, 'This is not your job');
  if (job.status !== 'requested') {
    throw new HttpError(400, 'Only a job that no pro has accepted yet can be cancelled');
  }

  const updated = await prisma.job.update({
    where: { id: job.id },
    data: { status: 'cancelled' },
    include: jobDetails,
  });
  res.json({ data: updated });
});

// POST /api/jobs/:id/review  - the customer rates the pro after the job is done
router.post('/:id/review', requireRole('customer'), async (req, res) => {
  const job = await findJob(req.params.id);

  if (job.customerId !== req.user.id) throw new HttpError(403, 'This is not your job');
  if (job.status !== 'done') throw new HttpError(400, 'You can only review a finished job');
  if (job.review) throw new HttpError(409, 'This job already has a review');

  const { errors, value } = validateReview(req.body);
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);

  const review = await prisma.review.create({ data: { ...value, jobId: job.id } });
  res.status(201).json({ data: review });
});

module.exports = router;
