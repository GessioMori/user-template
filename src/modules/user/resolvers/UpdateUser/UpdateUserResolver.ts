import { ExpressContext } from 'apollo-server-express'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import { Authorization } from '../../middlewares/Auhorization'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'
import { UpdateUserInputs } from './UpdateUserInputs'

@Service()
@Resolver()
export class UpdateUserResolver {
  constructor(private readonly userServices: UserServices) {}

  @UseMiddleware(Authorization)
  @Mutation(() => User)
  async updateUser(
    @Arg('data') data: UpdateUserInputs,
    @Ctx() ctx: ExpressContext
  ): Promise<User> {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null)
    )

    const updatedUser = await this.userServices.updateUser({
      id: ctx.req.session.userId!,
      userData: cleanedData,
    })

    if (!updatedUser) {
      throw new Error('Error on update')
    }

    return updatedUser
  }
}
