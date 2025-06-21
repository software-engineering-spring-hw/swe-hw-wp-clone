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
  }
  type SidebarUser implements UserInterface {
    id: ID!
    firstName: String!
    lastName: String!
    username: String
    password: String
    image: String!
    latestMessage: Message!
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
  type GroupMessage {
    id: ID!
    groupId: ID!
    senderId: ID
    content: String!
    createdAt: String!
    sender: User
  }
  type Query {
    getAllUsersExceptLogged(id: ID! offset: String! limit: String!): SidebarUsers!
    getUser(id: ID!): User!
    getMessages(otherUserId: ID!): [Message]!
    getGroups: [Group!]!
    getGroup(id: ID!): Group
    getGroupMessages(groupId: ID!): [GroupMessage]!
  }
  type Mutation {
    login(username: String! password: String!): AuthOperationResponse!
    register(firstName: String! lastName: String! username: String! password: String!): AuthOperationResponse!
    sendMessage(recipientId: ID! content: String!): Message!
    createGroup(name: String!, memberIds: [ID!]!): Group!
    addGroupMember(groupId: ID!, userId: ID!): GroupMember!
    removeGroupMember(groupId: ID!, userId: ID!): Boolean!
    sendGroupMessage(groupId: ID!, content: String!): GroupMessage!
  }
  type Subscription {
    newMessage: Message!
    groupMemberChanged(groupId: ID!): GroupMemberChangePayload!
    newGroupMessage(groupId: ID!): GroupMessage!
  }
  type Group {
    id: ID!
    name: String!
    members: [User!]!
    createdAt: String!
  }
  type GroupMember {
    id: ID!
    group: Group!
    user: User!
    createdAt: String!
  }
  type GroupMemberChangePayload {
    groupId: ID!
    user: User!
    action: String!
  }
`;