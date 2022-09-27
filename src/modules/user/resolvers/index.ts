import { NonEmptyArray } from 'type-graphql'
import { ChangePasswordResolver } from './ChangePassword/ChangePasswordResolver'
import { ConfirmAccountResolver } from './ConfirmAccount/ConfirmAccountResolver'
import { LoginResolver } from './Login/LoginResolver'
import { LogoutResolver } from './Logout/LogoutResolver'
import { RegisterUserResolver } from './RegisterUser/RegisterUserResolver'
import { RequestPasswordChangeResolver } from './RequestPasswordChange/RequestPasswordChangeResolver'
import { ResendConfirmationEmailResolver } from './ResendConfirmationEmail/ResendConfirmationEmailResolver'
import { UpdateUserResolver } from './UpdateUser/UpdateUserResolver'
import { UserInfoResolver } from './UserInfo/UserInfoResolver'

export const userResolvers = [
  RegisterUserResolver,
  LoginResolver,
  UserInfoResolver,
  LogoutResolver,
  UpdateUserResolver,
  ConfirmAccountResolver,
  RequestPasswordChangeResolver,
  ChangePasswordResolver,
  ResendConfirmationEmailResolver
] as NonEmptyArray<Function>
