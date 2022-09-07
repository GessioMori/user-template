import { IUser } from '../models/IUser'

export interface IUserServices {
  createUser({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }): Promise<IUser>
  getUser({ id }: { id: string }): Promise<IUser | null>
  getUserByEmail({ email }: { email: string }): Promise<IUser | null>
  updateUser({
    id,
    userData,
  }: {
    id: string
    userData: { name?: string }
  }): Promise<IUser | undefined>
}
