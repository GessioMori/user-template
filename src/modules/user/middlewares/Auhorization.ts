import { ExpressContext } from 'apollo-server-express'
import { ResolverData } from 'type-graphql'
import {
  MiddlewareInterface,
  NextFn,
} from 'type-graphql/dist/interfaces/Middleware'
import { Service } from 'typedi'
import { UserServices } from '../../../implementations'

@Service()
export class Authorization implements MiddlewareInterface<ExpressContext> {
  constructor(private readonly userServices: UserServices) {}

  async use({ context }: ResolverData<ExpressContext>, next: NextFn) {
    if (!context.req.session.userId) {
      throw new Error('Unauthorized')
    }

    const user = await this.userServices.getUser({
      id: context.req.session.userId,
    })

    if (!user) {
      throw new Error('Unauthorized')
    }

    return next()
  }
}
