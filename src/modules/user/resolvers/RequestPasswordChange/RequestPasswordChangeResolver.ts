import crypto from 'crypto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import {
  changePasswordEmailExpiresIn,
  changePasswordPrefix,
} from '../../../../constants'
import {
  MailService,
  SessionService,
  UserServices,
} from '../../../../implementations'
import { recoverPasswordEmail } from '../../utils/emailSender/recoverPasswordEmail'

@Service()
@Resolver()
export class RequestPasswordChangeResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: MailService,
    private readonly sessionService: SessionService
  ) {}

  @Mutation(() => Boolean)
  async requestPasswordChange(@Arg('email') email: string): Promise<boolean> {
    const user = await this.userServices.getUserByEmail({ email })

    if (!user) {
      throw new Error('Email not found')
    }

    const changePasswordToken = crypto.randomUUID()

    try {
      await this.sessionService.set({
        token: changePasswordToken,
        value: user.id,
        options: {
          expirationTime: changePasswordEmailExpiresIn,
          prefix: changePasswordPrefix,
        },
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
