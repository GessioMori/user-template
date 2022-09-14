import { ExpressContext } from 'apollo-server-express'
import crypto from 'crypto'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import {
  confirmationEmailExpiresIn,
  confirmationPrefix,
} from '../../../../constants'
import {
  MailService,
  SessionService,
  UserServices,
} from '../../../../implementations'
import { Authorization } from '../../middlewares/Auhorization'
import { confirmAccountEmailModel } from '../../utils/emailSender/confirmAccountEmail'

@Service()
@Resolver()
export class ResendConfirmationEmailResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: MailService,
    private readonly sessionService: SessionService
  ) {}

  @UseMiddleware(Authorization)
  @Mutation(() => Boolean)
  async resendConfirmationEmail(@Ctx() ctx: ExpressContext): Promise<boolean> {
    const user = await this.userServices.getUser({
      id: ctx.req.session.userId!,
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.confirmed) {
      throw new Error('Account alredy confirmed')
    }

    const registrationToken = crypto.randomUUID()

    try {
      await this.sessionService.set({
        token: registrationToken,
        value: user.id,
        options: {
          expirationTime: confirmationEmailExpiresIn,
          prefix: confirmationPrefix,
        },
      })

      await this.emailService.sendMail({
        to: user.email,
        subject: 'Confirm registration',
        body: confirmAccountEmailModel(user.name, registrationToken),
      })
      return true
    } catch {
      throw new Error('Some error happened, try again.')
    }
  }
}
