import crypto from 'crypto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import {
  changePasswordEmailExpiresIn,
  changePasswordPrefix,
} from '../../../../constants'
import { setRedisRegister } from '../../../../redis'
import { EtherealMailProvider } from '../../../../utils/providers/emailProvider/EtherealMailProvider'
import { UserServices } from '../../services/prisma/UserServices'
import { recoverPasswordEmail } from '../../utils/emailSender/recoverPasswordEmail'

@Service()
@Resolver()
export class RequestPasswordChangeResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: EtherealMailProvider
  ) {}

  @Mutation(() => Boolean)
  async requestPasswordChange(@Arg('email') email: string): Promise<boolean> {
    const user = await this.userServices.getUserByEmail({ email })

    if (!user) {
      throw new Error('Email not found')
    }

    const changePasswordToken = crypto.randomUUID()

    try {
      await setRedisRegister({
        expirationInHours: changePasswordEmailExpiresIn,
        redisPrefix: changePasswordPrefix,
        token: changePasswordToken,
        userId: user.id,
      })

      await this.emailService.sendMail({
        to: user.email,
        body: recoverPasswordEmail(user.name, changePasswordToken),
        subject: 'Change password',
      })
      return true
    } catch {
      throw new Error('Some error happened, try again.')
    }
  }
}
