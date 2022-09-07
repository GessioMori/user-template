import { ExpressContext } from 'apollo-server-express'
import { Ctx, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'

@Service()
@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: ExpressContext): Promise<boolean> {
    return new Promise((resolve, reject) =>
      ctx.req.session.destroy((err) => {
        if (err) {
          console.log(err)
          return reject(false)
        }
        ctx.res.clearCookie('qid')
        return resolve(true)
      })
    )
  }
}
