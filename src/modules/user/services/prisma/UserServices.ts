import { Service } from 'typedi'
import { prisma } from '../../../../server'
import { IUser } from '../../models/IUser'
import { IUserServices } from '../IUserServices'

@Service()
export class UserServices implements IUserServices {
  async createUser({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }): Promise<IUser> {
    const user = await prisma.user.create({
      data: { email, name, password },
    })
    return user
  }
  async getUser({ id }: { id: string }): Promise<IUser | null> {
    const user = await prisma.user.findUnique({ where: { id } })
    return user
  }
  async getUserByEmail({ email }: { email: string }): Promise<IUser | null> {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
  }
  async updateUser({
    id,
    userData,
  }: {
    id: string
    userData: { name?: string; confirmed?: boolean }
  }): Promise<IUser | undefined> {
    const user = await prisma.user.update({
      where: { id },
      data: { ...userData },
    })
    return user
  }
}
