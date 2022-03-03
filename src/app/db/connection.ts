import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

/**
 * Adds two numbers together.
 * @returns {int} The sum of the two numbers.
 */
export default prisma;
