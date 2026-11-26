const express = require('express');
const prisma = require('../db');
const { parseId } = require('../validation');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

// GET /api/pros/:id  - public profile of a pro with the average rating
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) throw new HttpError(400, 'id must be a positive whole number');

  const pro = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, trade: true, role: true, createdAt: true },
  });
  if (!pro || pro.role !== 'pro') throw new HttpError(404, `Pro ${id} not found`);

  // The average is calculated from the reviews of this pro's jobs
  const stats = await prisma.review.aggregate({
    where: { job: { proId: id } },
    _avg: { rating: true },
    _count: true,
  });

  const reviews = await prisma.review.findMany({
    where: { job: { proId: id } },
    include: { job: { select: { service: { select: { name: true } }, customer: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const jobsDone = await prisma.job.count({ where: { proId: id, status: 'done' } });

  res.json({
    data: {
      id: pro.id,
      name: pro.name,
      trade: pro.trade,
      memberSince: pro.createdAt,
      averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
      reviewCount: stats._count,
      jobsDone,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        service: r.job.service.name,
        customer: r.job.customer.name.split(' ')[0],
      })),
    },
  });
});

module.exports = router;
