import { ExpressContext } from 'apollo-server-express'
import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import { UserServices, User } from '../../../../implementations'
import { Authorization } from '../../middlewares/Auhorization'

@Service()
@Resolver()
export class UserInfoResolver {
  constructor(private readonly userServices: UserServices) {}

  @UseMiddleware(Authorization)
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: ExpressContext): Promise<User | null> {
    const user = await this.userServices.getUser({
      id: ctx.req.session.userId!
    })

    return user
  }
}
