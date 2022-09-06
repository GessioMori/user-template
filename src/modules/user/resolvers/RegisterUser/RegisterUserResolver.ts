import { hash } from 'argon2'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { User } from '../../models/prisma/User'
import { UserServices } from '../../services/prisma/UserServices'
import { RegisterUserInputs } from './RegisterUserInputs'

@Service()
@Resolver()
export class RegisterUserResolver {
  constructor(private readonly userServices: UserServices) {}

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
    return user
  }
}
