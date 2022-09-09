import { IsUUID, MaxLength, MinLength } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class ChangePasswordInputs {
  @Field()
  @MinLength(5, {
    message:
      'Password is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(50, {
    message:
      'Password is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  password: string

  @Field()
  @IsUUID(4, { message: 'Invalid token' })
  token: string
}
