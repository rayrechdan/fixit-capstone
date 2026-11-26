const express = require('express');
const prisma = require('../db');
const { TRADES, parseId } = require('../validation');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

// GET /api/services?category=plumbing&q=tap  - the public catalogue
router.get('/', async (req, res) => {
  const { category, q } = req.query;

  if (category && !TRADES.includes(category)) {
    throw new HttpError(400, `category must be one of: ${TRADES.join(', ')}`);
  }

  const where = {};
  if (category) where.category = category;
  if (typeof q === 'string' && q.trim()) {
    // case-insensitive search in the name or the description
    where.OR = [
      { name: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  const services = await prisma.service.findMany({ where, orderBy: [{ category: 'asc' }, { fixedPriceUsd: 'asc' }] });
  res.json({ count: services.length, data: services });
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) throw new HttpError(400, 'id must be a positive whole number');

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new HttpError(404, `Service ${id} not found`);

  res.json({ data: service });
});

module.exports = router;
