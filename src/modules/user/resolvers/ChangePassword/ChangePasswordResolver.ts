import { hash } from 'argon2'
import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { changePasswordPrefix } from '../../../../constants'
import { redis } from '../../../../redis'
import { UserServices } from '../../services/prisma/UserServices'
import { ChangePasswordInputs } from './ChangePasswordInputs'

@Service()
@Resolver()
export class ChangePasswordResolver {
  constructor(private readonly userServices: UserServices) {}

  @Mutation(() => Boolean)
  async changePassword(
    @Arg('data') { token, password }: ChangePasswordInputs
  ): Promise<boolean> {
    const userId = await redis.get(changePasswordPrefix + token)

    if (!userId) {
      throw new Error('Password change request not found')
    }

    const hashedPassword = await hash(password)

    try {
      await this.userServices.updateUser({
        id: userId,
        userData: { password: hashedPassword },
      })
      await redis.del(changePasswordPrefix + token)
      return true
    } catch {
      throw new Error('Some error occurred, try again')
    }
  }
}
