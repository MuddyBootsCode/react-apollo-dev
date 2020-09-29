import { typeDefs } from './graphql-schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import neo4j from 'neo4j-driver'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import dotenv from 'dotenv'


// set environment variables from .env
dotenv.config()

const app = express()


const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'localgraph'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)

const augmentedSchema = makeAugmentedSchema({
  typeDefs,
  config: {
    auth: {
      isAuthenticated: false,
    }
  }
})

const server = new ApolloServer({
  context: ({ req }) => {
    return { req, driver, neo4jDatabase: process.env.NEO4J_DATABASE }
  },
  schema: augmentedSchema,
  introspection: true,
  playground: true,
})

// Specify host, port and path for GraphQL endpoint
const port = process.env.GRAPHQL_SERVER_PORT || 4001
const path = process.env.GRAPHQL_SERVER_PATH || '/graphql'
const host = process.env.GRAPHQL_SERVER_HOST || '0.0.0.0'

server.applyMiddleware({ app, path})

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`)
})