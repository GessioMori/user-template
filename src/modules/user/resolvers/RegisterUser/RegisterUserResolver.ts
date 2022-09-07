import { hash } from 'argon2'
import crypto from 'crypto'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import {
  confirmationEmailExpiresIn,
  confirmationPrefix,
} from '../../../../constants'
import { setRedisRegister } from '../../../../redis'
import { EtherealMailProvider } from '../../../../utils/providers/emailProvider/EtherealMailProvider'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'
import { confirmAccountEmailModel } from '../../utils/emailSender/confirmAccountEmail'
import { RegisterUserInputs } from './RegisterUserInputs'

@Service()
@Resolver()
export class RegisterUserResolver {
  constructor(
    private readonly userServices: UserServices,
    private readonly emailService: EtherealMailProvider
  ) {}

  @Query(() => String)
  async hello2() {
    return 'Hello2!'
  }

  @Mutation(() => User)
  async createUser(
    @Arg('data') { email, name, password }: RegisterUserInputs
  ): Promise<User> {
    const hashedPassword = await hash(password)

    const userExists = await this.userServices.getUserByEmail({ email })

    if (userExists) {
      throw new Error('User already exists')
    }

    const user = await this.userServices.createUser({
      email,
      name,
      password: hashedPassword,
    })

    const registrationToken = crypto.randomUUID()

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

    return user
  }
}
