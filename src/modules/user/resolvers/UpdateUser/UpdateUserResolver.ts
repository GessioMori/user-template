import { ExpressContext } from 'apollo-server-express'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'
import { UpdateUserInputs } from './UpdateUserInputs'

@Service()
@Resolver()
export class UpdateUserResolver {
  constructor(private readonly userServices: UserServices) {}

  @Mutation(() => User)
  async updateUser(
    @Arg('data') data: UpdateUserInputs,
    @Ctx() ctx: ExpressContext
  ): Promise<User> {
    if (!ctx.req.session.userId) {
      throw new Error('Unauthorized')
    }
    const user = await this.userServices.getUser({ id: ctx.req.session.userId })
    if (!user) {
      throw new Error('Unauthorized')
    }

    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null)
    )

    const updatedUser = await this.userServices.updateUser({
      id: ctx.req.session.userId,
      userData: cleanedData,
    })

    if (!updatedUser) {
      throw new Error('Error on update')
    }

    return updatedUser
  }
}
