import Redis from 'ioredis'
import { changePasswordPrefix, confirmationPrefix } from './constants'

export const redis = new Redis(8002)

const redisPrefixes = [confirmationPrefix, changePasswordPrefix] as const
type redisPrefixesType = typeof redisPrefixes[number]

export const setRedisRegister = async ({
  redisPrefix,
  token,
  userId,
  expirationInHours,
}: {
  redisPrefix: redisPrefixesType
  token: string
  userId: string
  expirationInHours: number
}) => {
  await redis.set(
    redisPrefix + token,
    userId,
    'EX',
    60 * 60 * expirationInHours
  )
}
