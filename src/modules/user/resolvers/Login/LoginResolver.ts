import { ExpressContext } from 'apollo-server-express'
import { verify } from 'argon2'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { UserServices, User } from '../../../../implementations'

import { LoginInputs } from './LoginInputs'

@Service()
@Resolver()
export class LoginResolver {
  constructor(private readonly userServices: UserServices) {}

  @Mutation(() => User)
  async login(
    @Arg('data') { email, password }: LoginInputs,
    @Ctx() ctx: ExpressContext
  ): Promise<User | null> {
    const user = await this.userServices.getUserByEmail({ email })

    if (!user) {
      throw new Error('Invalid credentials.')
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials.')
    }

    ctx.req.session.userId = user.id

    return user
  }
}
