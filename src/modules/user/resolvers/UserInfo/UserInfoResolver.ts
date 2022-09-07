import { ExpressContext } from 'apollo-server-express'
import { Ctx, Query, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'

@Service()
@Resolver()
export class UserInfoResolver {
  constructor(private readonly userServices: UserServices) {}
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: ExpressContext): Promise<User | undefined | null> {
    if (!ctx.req.session.userId) {
      return undefined
    }

    const user = await this.userServices.getUser({ id: ctx.req.session.userId })

    return user
  }
}
