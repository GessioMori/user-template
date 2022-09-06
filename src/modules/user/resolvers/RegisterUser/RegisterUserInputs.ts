import { IsEmail, MaxLength, MinLength } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export class RegisterUserInputs {
  @Field()
  @MinLength(5, {
    message:
      'Name is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(50, {
    message:
      'Name is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  name: string

  @Field()
  @IsEmail()
  email: string

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
}
