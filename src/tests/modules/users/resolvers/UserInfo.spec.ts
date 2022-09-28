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

const meQuery = `
  query Me {
    me {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`
describe('Get user info resolver', () => {
  let user: IUser
  let cookie: string

  let app: ReturnType<typeof express>

  beforeAll(async () => {
    app = await TestServer.getServer()

    user = await prisma.user.create({
      data: { ...createUserData, password: await hash(createUserData.password) }
    })

    const { header } = await request(app)
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
    cookie = cookiesArr.filter((cookie) => cookie.startsWith('qid='))[0]
  })

  it('Should be able to get user info with correct credentials', async () => {
    const { body } = await request(app)
      .post('/graphql')
      .set('Cookie', cookie)
      .send({
        query: meQuery
      })
    expect(body.data.me.name).toEqual(createUserData.name)
    expect(body.data.me.email).toEqual(createUserData.email)
  })

  it('Should not be able to get user info without a cookie', async () => {
    const {
      body: { errors }
    } = await request(app).post('/graphql').send({
      query: meQuery
    })
    expect(errors).toContainEqual(
      expect.objectContaining({ message: 'Unauthorized' })
    )
  })
})
