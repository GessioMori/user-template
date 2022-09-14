import 'reflect-metadata'

import { ApolloServer, ExpressContext } from 'apollo-server-express'
import connect from 'connect-redis'
import * as dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'
import { SessionService } from '../implementations'
import { ChangePasswordResolver } from '../modules/user/resolvers/ChangePassword/ChangePasswordResolver'
import { ConfirmAccountResolver } from '../modules/user/resolvers/ConfirmAccount/ConfirmAccountResolver'
import { LoginResolver } from '../modules/user/resolvers/Login/LoginResolver'
import { LogoutResolver } from '../modules/user/resolvers/Logout/LogoutResolver'
import { RegisterUserResolver } from '../modules/user/resolvers/RegisterUser/RegisterUserResolver'
import { RequestPasswordChangeResolver } from '../modules/user/resolvers/RequestPasswordChange/RequestPasswordChangeResolver'
import { ResendConfirmationEmailResolver } from '../modules/user/resolvers/ResendConfirmationEmail/ResendConfirmationEmailResolver'
import { UpdateUserResolver } from '../modules/user/resolvers/UpdateUser/UpdateUserResolver'
import { UserInfoResolver } from '../modules/user/resolvers/UserInfo/UserInfoResolver'

dotenv.config()
jest.setTimeout(20000)
export const testUrl = 'http://localhost:5000/graphql'

export const createTestServer = async () => {
  const schema = await buildSchema({
    resolvers: [
      RegisterUserResolver,
      LoginResolver,
      UserInfoResolver,
      LogoutResolver,
      UpdateUserResolver,
      ConfirmAccountResolver,
      RequestPasswordChangeResolver,
      ChangePasswordResolver,
      ResendConfirmationEmailResolver
    ],
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
      origin: 'http://localhost',
      credentials: true
    }
  })

  app.listen(5000)

  return server
}
