import 'reflect-metadata'

import { ApolloServer, ExpressContext } from 'apollo-server-express'
import connect from 'connect-redis'
import * as dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'

import { SessionService } from '../implementations'
import { userResolvers } from '../modules/user/resolvers'

dotenv.config()
jest.setTimeout(20000)

export class TestServer {
  static server: ApolloServer<ExpressContext>
  static app: ReturnType<typeof express>

  static async getServer() {
    if (!TestServer.app) {
      const schema = await buildSchema({
        resolvers: [...userResolvers],
        container: Container
      })

      TestServer.app = express()

      const RedisStore = connect(session)

      TestServer.app.use(
        session({
          store: new RedisStore({ client: SessionService.getInstance() }),
          name: 'qid',
          saveUninitialized: false,
          resave: false,
          secret: process.env.SESSION_PASSWORD || '1234',
          proxy: true,
          cookie: {
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
          }
        })
      )

      TestServer.server = new ApolloServer({
        schema,
        context: ({ req, res }: ExpressContext) => {
          return { req, res }
        }
      })

      await TestServer.server.start()

      TestServer.server.applyMiddleware({
        app: TestServer.app
      })

      return TestServer.app
    }
    return TestServer.app
  }
}
