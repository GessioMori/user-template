import Redis from 'ioredis'
import { Service } from 'typedi'

@Service()
export class RedisSessionService implements ISessionService {
  static provider: Redis

  static getInstance() {
    if (!RedisSessionService.provider) {
      RedisSessionService.provider = new Redis(8002)
    }
    return RedisSessionService.provider
  }

  async get({
    token,
    options
  }: {
    token: string
    options?: { prefix?: string | undefined } | undefined
  }): Promise<string | null> {
    const result = await RedisSessionService.provider.get(
      options?.prefix ? options?.prefix + token : token
    )
    return result
  }

  async set({
    token,
    value,
    options
  }: {
    token: string
    value: string
    options?:
      | { prefix?: string | undefined; expirationTime?: number | undefined }
      | undefined
  }): Promise<string> {
    let result
    if (options?.expirationTime === undefined) {
      result = await RedisSessionService.provider.set(
        options?.prefix ? options?.prefix + token : token,
        value
      )
    } else {
      result = await RedisSessionService.provider.set(
        options?.prefix ? options?.prefix + token : token,
        value,
        'EX',
        60 * 60 * options.expirationTime
      )
    }
    return result
  }

  async delete({
    token,
    options
  }: {
    token: string
    options?: { prefix?: string | undefined } | undefined
  }): Promise<void> {
    await RedisSessionService.provider.del(
      options?.prefix ? options?.prefix + token : token
    )
  }
}
