import { ExpressContext } from 'apollo-server-express'
import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import { UserServices, User } from '../../../../implementations'
import { ConfirmedAccount } from '../../middlewares/ConfirmedAccount'

@Service()
@Resolver()
export class UserInfoResolver {
  constructor(private readonly userServices: UserServices) {}

  @UseMiddleware(ConfirmedAccount)
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: ExpressContext): Promise<User | undefined | null> {
    const user = await this.userServices.getUser({
      id: ctx.req.session.userId!,
    })

    return user
  }
}
