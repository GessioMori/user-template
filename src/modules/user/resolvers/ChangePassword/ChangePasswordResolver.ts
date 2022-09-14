import { hash } from 'argon2'
import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { changePasswordPrefix } from '../../../../constants'
import { SessionService, UserServices } from '../../../../implementations'
import { ChangePasswordInputs } from './ChangePasswordInputs'

@Service()
@Resolver()
export class ChangePasswordResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly sessionService: SessionService
  ) {}

  @Mutation(() => Boolean)
  async changePassword(
    @Arg('data') { token, password }: ChangePasswordInputs
  ): Promise<boolean> {
    const userId = await this.sessionService.get({
      token,
      options: { prefix: changePasswordPrefix },
    })

    if (!userId) {
      throw new Error('Password change request not found')
    }

    const hashedPassword = await hash(password)

    try {
      await this.userServices.updateUser({
        id: userId,
        userData: { password: hashedPassword },
      })
      await this.sessionService.delete({
        token,
        options: { prefix: changePasswordPrefix },
      })
      return true
    } catch {
      throw new Error('Some error occurred, try again')
    }
  }
}
