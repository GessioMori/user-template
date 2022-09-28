import { faker } from '@faker-js/faker'
import { TestServer } from '../../../testServer'
import { prisma } from '../../../../prisma'
import request from 'supertest'
import express from 'express'

const createUserData = {
  name: faker.name.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password()
}

const createUserMutation = `
  mutation CreateUser($data: RegisterUserInputs!) {
    createUser(data: $data) {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`
describe('Register user resolver', () => {
  let app: ReturnType<typeof express>

  beforeAll(async () => {
    app = await TestServer.getServer()
  })

  it('Should be able to register a new user', async () => {
    const {
      body: { data }
    } = await request(app)
      .post('/graphql')
      .send({
        query: createUserMutation,
        variables: { data: createUserData }
      })
    expect(data.createUser).toMatchObject({
      name: createUserData.name,
      email: createUserData.email
    })
    expect(data.createUser).toHaveProperty('id')
  })

  it('Should not be able to register a new user with existing email', async () => {
    const {
      body: { errors }
    } = await request(app)
      .post('/graphql')
      .send({
        query: createUserMutation,
        variables: { data: createUserData }
      })
    expect(errors).toContainEqual(
      expect.objectContaining({ message: 'User already exists' })
    )
  })

  it('Should not be able to register a new user with a valid email', async () => {
    const {
      body: { errors }
    } = await request(app)
      .post('/graphql')
      .send({
        query: createUserMutation,
        variables: { data: { ...createUserData, email: 'invalidemail' } }
      })
    expect(errors).toContainEqual(
      expect.objectContaining({ message: 'Argument Validation Error' })
    )
  })
})
