const { PrismaClient } = require('@prisma/client');
const config = require('../../config');

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
