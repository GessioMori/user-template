import 'reflect-metadata'

import { ApolloServer, ExpressContext } from 'apollo-server-express'
import connect from 'connect-redis'
import * as dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'

import { SessionService } from './implementations'
import { userResolvers } from './modules/user/resolvers'

dotenv.config()

const main = async () => {
  const schema = await buildSchema({
    resolvers: [...userResolvers],
    container: Container
  })

  const app = express()

  const RedisStore = connect(session)

  app.set('trust proxy', 1)

  app.use(
    session({
      store: new RedisStore({ client: SessionService.getInstance() }),
      name: 'qid',
      saveUninitialized: false,
      resave: false,
      secret: process.env.SESSION_PASSWORD || '1234',
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  )

  const server = new ApolloServer({
    schema,
    context: ({ req, res }: ExpressContext) => {
      return { req, res }
    },
    csrfPrevention: true
  })

  await server.start()

  server.applyMiddleware({
    app,
    cors: {
      origin:
        process.env.NODE_ENV === 'prod'
          ? process.env.FRONT_DOMAIN_PROD
          : process.env.FRONT_DOMAIN_DEV,
      credentials: true
    }
  })

  const PORT = process.env.PORT || 4000

  app.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  )
}

main()
