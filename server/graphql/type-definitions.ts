import { gql } from "apollo-server";

export default gql`
  interface UserInterface {
    id: ID!
    firstName: String!
    lastName: String!
    username: String
    password: String
    image: String!
  }
  type User implements UserInterface {
    id: ID!
    firstName: String!
    lastName: String!
    username: String
    password: String
    image: String!
    isBlocked: Boolean
    hasBlocked: Boolean
  }
  type SidebarUser implements UserInterface {
    id: ID!
    firstName: String!
    lastName: String!
    username: String
    password: String
    image: String!
    latestMessage: Message!
    isBlocked: Boolean
    hasBlocked: Boolean
  }
  type SidebarUsers {
    users: [SidebarUser]!
    totalUsersExceptLoggedUser: String!
  }
  type AuthOperationResponse {
    user: User!
    token: String!
  }
  type Message {
    id: ID!
    senderId: ID!
    recipientId: ID!
    content: String
    createdAt: String
  }
  type Query {
    getAllUsersExceptLogged(id: ID! offset: String! limit: String!): SidebarUsers!
    getUser(id: ID!): User!
    getMessages(otherUserId: ID!): [Message]!
    getBlockedUsers: [User!]!
  }
  type Mutation {
    login(username: String! password: String!): AuthOperationResponse!
    register(firstName: String! lastName: String! username: String! password: String!): AuthOperationResponse!
    sendMessage(recipientId: ID! content: String!): Message!
    blockUser(userId: ID!): Boolean!
    unblockUser(userId: ID!): Boolean!
  }
  type Subscription {
    newMessage: Message!
  }
`;