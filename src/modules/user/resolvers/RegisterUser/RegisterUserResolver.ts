import { hash } from 'argon2'
import crypto from 'crypto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import {
  confirmationEmailExpiresIn,
  confirmationPrefix
} from '../../../../constants'
import {
  MailService,
  SessionService,
  User,
  UserServices
} from '../../../../implementations'
import { confirmAccountEmailModel } from '../../utils/emailSender/confirmAccountEmail'
import { RegisterUserInputs } from './RegisterUserInputs'

@Service()
@Resolver()
export class RegisterUserResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: MailService,
    private readonly sessionService: SessionService
  ) {}

  @Mutation(() => User)
  async createUser(
    @Arg('data') { email, name, password }: RegisterUserInputs
  ): Promise<User> {
    const userExists = await this.userServices.getUserByEmail({ email })

    if (userExists) {
      throw new Error('User already exists')
    }

    const hashedPassword = await hash(password)

    const user = await this.userServices.createUser({
      email,
      name,
      password: hashedPassword
    })

    const registrationToken = crypto.randomUUID()

    await this.sessionService.set({
      token: registrationToken,
      value: user.id,
      options: {
        expirationTime: confirmationEmailExpiresIn,
        prefix: confirmationPrefix
      }
    })

    await this.emailService.sendMail({
      to: user.email,
      subject: 'Confirm registration',
      body: confirmAccountEmailModel(user.name, registrationToken)
    })

    return user
  }
}
