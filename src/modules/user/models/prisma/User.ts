import { Field, ID, ObjectType } from 'type-graphql'
import { IUser } from '../IUser'

@ObjectType()
export class PrismaUser implements IUser {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field()
  email: string

  password: string

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field()
  confirmed: boolean
}
