import userResolvers from "./users";
import messageResolvers from "./messages";
import groupResolvers from "./groups";
import groupMessageResolvers from "./group-messages";

const resolversConfig = {
  Message: {
    createdAt: (parent: any) => parent.createdAt?.toISOString()
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
    ...groupResolvers.Query,
    ...groupMessageResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...groupResolvers.Mutation,
    ...groupMessageResolvers.Mutation
  },
  Subscription: {
    ...messageResolvers.Subscription,
    ...groupResolvers.Subscription,
    ...groupMessageResolvers.Subscription
  },
  Group: groupResolvers.Group,
  GroupMember: groupResolvers.GroupMember,
  GroupMessage: groupMessageResolvers.GroupMessage
};

export default resolversConfig;