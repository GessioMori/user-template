import 'reflect-metadata'

import { ApolloServer } from 'apollo-server-express'
import connect from 'connect-redis'
import express from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'
import { LoginResolver } from './modules/user/resolvers/Login/LoginResolver'
import { RegisterUserResolver } from './modules/user/resolvers/RegisterUser/RegisterUserResolver'
import { UserInfoResolver } from './modules/user/resolvers/UserInfo/UserInfoResolver'
import { redis } from './redis'

const main = async () => {
  const schema = await buildSchema({
    resolvers: [RegisterUserResolver, LoginResolver, UserInfoResolver],
    container: Container,
  })

  const app = express()

  const RedisStore = connect(session)

  app.use(
    session({
      store: new RedisStore({ client: redis }),
      name: 'qid',
      saveUninitialized: false,
      resave: false,
      secret: '1234',
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 1000 * 60 * 20, // 20 minutes
      },
    })
  )

  const server = new ApolloServer({
    schema,
    context: ({ req }: any) => ({ req }),
    csrfPrevention: true,
  })

  await server.start()

  server.applyMiddleware({
    app,
    cors: {
      origin: ['https://studio.apollographql.com'],
      credentials: true,
    },
  })

  app.listen(4000, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  )
}

main()
