import { UserInputError, withFilter } from "apollo-server";
import { GroupMessage, User } from "../../db/models/models-config";
import { pubsub } from "../../app";

const NEW_GROUP_MESSAGE = "NEW_GROUP_MESSAGE";

export default {
  Query: {
    getGroupMessages: async (_parent: any, { groupId }: { groupId: string }) => {
      return GroupMessage.findAll({
        where: { groupId },
        order: [["createdAt", "ASC"]]
      });
    }
  },
  Mutation: {
    sendGroupMessage: async (_parent: any, { groupId, content }: { groupId: string, content: string }, { user }: any) => {
      if (!content) throw new UserInputError("Message content required");
      const message = await GroupMessage.create({ groupId, senderId: user.id, content, createdAt: new Date() });
      const fullMessage = await GroupMessage.findByPk(message.id);
      pubsub.publish(NEW_GROUP_MESSAGE, { newGroupMessage: fullMessage });
      return fullMessage;
    }
  },
  Subscription: {
    newGroupMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_GROUP_MESSAGE),
        (payload: any, variables: any) => payload.newGroupMessage.groupId === variables.groupId
      )
    }
  },
  GroupMessage: {
    sender: (msg: any) => User.findByPk(msg.senderId),
    createdAt: (msg: any) => msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt
  }
};
