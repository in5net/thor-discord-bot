import { PrismaClient } from 'database';
import { PrismaClient as CacheClient } from 'database/cache';

const prisma = new PrismaClient();
export default prisma;

export const cache = new CacheClient();
