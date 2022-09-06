import 'reflect-metadata'

import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'
import { RegisterUserResolver } from './modules/user/resolvers/RegisterUser/RegisterUserResolver'
import { context } from './prismaContext'

const main = async () => {
  const schema = await buildSchema({
    resolvers: [RegisterUserResolver],
    container: Container,
  })

  const server = new ApolloServer({ schema, context })

  server.listen({ port: 4000 }, () => console.log('Server running!'))
}

main()
