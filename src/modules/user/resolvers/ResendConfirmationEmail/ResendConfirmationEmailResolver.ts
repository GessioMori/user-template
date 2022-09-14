import { ExpressContext } from 'apollo-server-express'
import crypto from 'crypto'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import {
  confirmationEmailExpiresIn,
  confirmationPrefix,
} from '../../../../constants'
import { setRedisRegister } from '../../../../redis'
import { EtherealMailProvider } from '../../../../utils/providers/emailProvider/EtherealMailProvider'
import { Authorization } from '../../middlewares/Auhorization'
import { UserServices } from '../../services/prisma/UserServices'
import { confirmAccountEmailModel } from '../../utils/emailSender/confirmAccountEmail'

@Service()
@Resolver()
export class ResendConfirmationEmailResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: EtherealMailProvider
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
      await setRedisRegister({
        redisPrefix: confirmationPrefix,
        expirationInHours: confirmationEmailExpiresIn,
        token: registrationToken,
        userId: user.id,
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
