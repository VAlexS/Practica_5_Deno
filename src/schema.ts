import { gql } from "graphql_tag";

export const typeDefs = gql`
  scalar Date

  type User {
    _id: ID!
    username: String!
    password: String!
    idiom: String!
    createdAt: Date!
  }

  type Message {
    _id: ID!
    content: String!
    createdAt: String!
    usersender: User!
    userreceiver: User!
  }

  type Query {
    getMessages(page: Int!, perPage: Int!): [Message!]!
  }

  type Mutation {
    login(username: String!, password: String!): String!
    deleteUser: User!
    sendMessage(userreceiver: String!, content: String!): Message!
    createUser(username: String!, password: String!): User!
  }
`;
