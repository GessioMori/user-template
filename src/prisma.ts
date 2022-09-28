import { PrismaClient } from '@prisma/client'

if (process.env.NODE_ENV === 'test') {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
}

export const prisma = new PrismaClient()
