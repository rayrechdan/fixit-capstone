// One shared Prisma client for the whole app.
// Prisma reads the connection string from DATABASE_URL in .env
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
