import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import { TestServer } from '../../../testServer'
import { prisma } from '../../../../prisma'
import { IUser } from '../../../../modules/user/models/IUser'
import request from 'supertest'
import express from 'express'

const createUserData = {
  name: faker.name.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password()
}

const loginMutation = `
  mutation Login($data: LoginInputs!) {
    login(data: $data) {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`
describe('Login resolver', () => {
  let app: ReturnType<typeof express>
  let user: IUser

  beforeAll(async () => {
    app = await TestServer.getServer()
    user = await prisma.user.create({
      data: { ...createUserData, password: await hash(createUserData.password) }
    })
  })

  it('Should be able to login with correct credentials', async () => {
    const { header, body } = await request(app)
      .post('/graphql')
      .send({
        query: loginMutation,
        variables: {
          data: {
            email: createUserData.email,
            password: createUserData.password
          }
        }
      })
    const cookiesArr = header['set-cookie'] as string[]
    expect(
      cookiesArr.filter((cookie) => cookie.startsWith('qid='))
    ).toHaveLength(1)
    expect(body.data.login.name).toEqual(createUserData.name)
    expect(body.data.login.email).toEqual(createUserData.email)
  })

  it('Should be not able to login with an incorrect password', async () => {
    const { body } = await request(app)
      .post('/graphql')
      .send({
        query: loginMutation,
        variables: {
          data: {
            email: createUserData.email,
            password: createUserData.password + 'wrong'
          }
        }
      })

    expect(body.data).toBeFalsy()
    expect(body.errors).toContainEqual(
      expect.objectContaining({ message: 'Invalid credentials.' })
    )
  })

  it('Should be throw an error when data is invalid', async () => {
    const { body } = await request(app)
      .post('/graphql')
      .send({
        query: loginMutation,
        variables: {
          data: {
            email: createUserData.email
          }
        }
      })
    expect(body.data).toBeFalsy()
    expect(body.errors).toContainEqual(
      expect.objectContaining({ extensions: { code: 'BAD_USER_INPUT' } })
    )
  })
})
