import { ApolloServer, ExpressContext } from 'apollo-server-express'
import { faker } from '@faker-js/faker'
import { createTestServer, testUrl } from '../../../testServer'
import gql from 'graphql-tag'
import fetch from 'cross-fetch'
import ApolloClient from 'apollo-boost'
import { prisma } from '../../../../prisma'
import { GraphQLError } from 'graphql'

const createUserData = {
  name: faker.name.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password()
}

const createUserMutation = gql`
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
describe('test', () => {
  let server: ApolloServer<ExpressContext>
  let client: ApolloClient<unknown>

  beforeAll(async () => {
    server = await createTestServer()
    client = new ApolloClient({ uri: testUrl, fetch: fetch })
  })

  afterAll(async () => {
    await prisma.$queryRaw`DELETE FROM users`
    await prisma.$disconnect()
    await server.stop()
  })

  it('Should be able to register a new user', async () => {
    const { data } = await client.mutate({
      mutation: createUserMutation,
      variables: { data: createUserData }
    })
    expect(data.createUser).toMatchObject({
      name: createUserData.name,
      email: createUserData.email
    })
    expect(data.createUser).toHaveProperty('id')
  })

  it('Should not be able to register a new user with existing email', async () => {
    const response = client.mutate({
      mutation: createUserMutation,
      variables: { data: createUserData }
    })
    await expect(response).rejects.toEqual(
      new Error('GraphQL error: User already exists')
    )
  })

  it('Should not be able to register a new user without an email', async () => {
    const response = client.mutate({
      mutation: createUserMutation,
      variables: {
        data: {
          name: createUserData.name,
          password: createUserData.password
        }
      }
    })
    await expect(response).rejects.toBeInstanceOf(Error)
  })
})
