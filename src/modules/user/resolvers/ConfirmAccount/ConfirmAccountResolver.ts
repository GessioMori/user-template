import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { confirmationPrefix } from '../../../../constants'
import { redis } from '../../../../redis'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'

@Resolver()
@Service()
export class ConfirmAccountResolver {
  constructor(private readonly userServices: UserServices) {}

  @Mutation(() => User)
  async confirmAccount(@Arg('token') token: string) {
    const userId = await redis.get(confirmationPrefix + token)

    if (!userId) {
      throw new Error('Token expired or invalid')
    }

    const user = await this.userServices.updateUser({
      id: userId,
      userData: { confirmed: true },
    })

    return user
  }
}
