import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { confirmationPrefix } from '../../../../constants'
import { UserServices, User, SessionService } from '../../../../implementations'

@Resolver()
@Service()
export class ConfirmAccountResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly sessionService: SessionService
  ) {}

  @Mutation(() => User)
  async confirmAccount(@Arg('token') token: string) {
    const userId = await this.sessionService.get({
      token,
      options: { prefix: confirmationPrefix },
    })

    if (!userId) {
      throw new Error('Token expired or invalid')
    }

    const isAlreadyConfirmed = await this.userServices.getUser({ id: userId })

    if (isAlreadyConfirmed?.confirmed) {
      throw new Error('Account alredy confirmed')
    }

    const user = await this.userServices.updateUser({
      id: userId,
      userData: { confirmed: true },
    })

    return user
  }
}
