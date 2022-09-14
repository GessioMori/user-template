import { PrismaClient } from '@prisma/client'

export const prisma =
  process.env.NODE_ENV !== 'test'
    ? new PrismaClient()
    : new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL_TEST } }
      })
