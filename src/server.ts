import 'reflect-metadata'

import { ApolloServer, ExpressContext } from 'apollo-server-express'
import connect from 'connect-redis'
import * as dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'
import { ChangePasswordResolver } from './modules/user/resolvers/ChangePassword/ChangePasswordResolver'
import { ConfirmAccountResolver } from './modules/user/resolvers/ConfirmAccount/ConfirmAccountResolver'
import { LoginResolver } from './modules/user/resolvers/Login/LoginResolver'
import { LogoutResolver } from './modules/user/resolvers/Logout/LogoutResolver'
import { RegisterUserResolver } from './modules/user/resolvers/RegisterUser/RegisterUserResolver'
import { RequestPasswordChangeResolver } from './modules/user/resolvers/RequestPasswordChange/RequestPasswordChangeResolver'
import { UpdateUserResolver } from './modules/user/resolvers/UpdateUser/UpdateUserResolver'
import { UserInfoResolver } from './modules/user/resolvers/UserInfo/UserInfoResolver'
import { ResendConfirmationEmailResolver } from './modules/user/resolvers/ResendConfirmationEmail/ResendConfirmationEmailResolver'
import { SessionService } from './implementations'

dotenv.config()

const main = async () => {
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
      origin:
        process.env.NODE_ENV === 'prod'
          ? process.env.FRONT_DOMAIN_PROD
          : process.env.FRONT_DOMAIN_DEV,
      credentials: true
    }
  })

  app.listen(4000, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  )
}

main()
