import { UserInputError, withFilter } from "apollo-server";
import { Group, GroupMember, User } from "../../db/models/models-config";
import { pubsub } from "../../app";

const GROUP_MEMBER_CHANGED = "GROUP_MEMBER_CHANGED";

export default {
  Query: {
    getGroups: async (_parent: any, _args: any, { user }: any) => {
      return Group.findAll({
        include: [{
          model: User,
          where: { id: user.id },
          through: { attributes: [] }
        }]
      });
    },
    getGroup: async (_parent: any, { id }: { id: string }) => {
      return Group.findByPk(id, { include: [User] });
    }
  },
  Mutation: {
    createGroup: async (_parent: any, { name, memberIds }: { name: string, memberIds: string[] }, { user }: any) => {
      if (!memberIds.includes(user.id)) memberIds.push(user.id);
      const group = await Group.create({ name, createdAt: new Date() });
      await Promise.all(memberIds.map((userId) => GroupMember.create({ groupId: group.id, userId, createdAt: new Date() })));
      return Group.findByPk(group.id, { include: [User] });
    },
    addGroupMember: async (_parent: any, { groupId, userId }: { groupId: string, userId: string }) => {
      const group = await Group.findByPk(groupId);
      if (!group) throw new UserInputError("Group not found");
      await GroupMember.create({ groupId, userId, createdAt: new Date() });
      const memberWithId = await GroupMember.findOne({ where: { groupId, userId } });
      const userObj = await User.findByPk(userId);
      // SYSTEM MESSAGE: Add system message for join event
      const GroupMessage = require("../../db/models/models-config").GroupMessage;
      await GroupMessage.create({
        groupId,
        senderId: null,
        content: `${userObj.firstName} ${userObj.lastName} joined the group`,
        createdAt: new Date()
      });
      pubsub.publish(GROUP_MEMBER_CHANGED, { groupMemberChanged: { groupId, user: userObj, action: "ADDED" } });
      return memberWithId;
    },
    removeGroupMember: async (_parent: any, { groupId, userId }: { groupId: string, userId: string }) => {
      const member = await GroupMember.findOne({ where: { groupId, userId } });
      if (!member) throw new UserInputError("Member not found");
      await member.destroy();
      const userObj = await User.findByPk(userId);
      // SYSTEM MESSAGE: Add system message for leave event
      const GroupMessage = require("../../db/models/models-config").GroupMessage;
      await GroupMessage.create({
        groupId,
        senderId: null,
        content: `${userObj.firstName} ${userObj.lastName} left the group`,
        createdAt: new Date()
      });
      pubsub.publish(GROUP_MEMBER_CHANGED, { groupMemberChanged: { groupId, user: userObj, action: "REMOVED" } });
      return true;
    }
  },
  Subscription: {
    groupMemberChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GROUP_MEMBER_CHANGED),
        (payload: any, variables: any) => payload.groupMemberChanged.groupId === variables.groupId
      )
    }
  },
  Group: {
    members: async (group: any) => {
      const members = await GroupMember.findAll({ where: { groupId: group.id } });
      const userIds = members.map((m: any) => m.userId);
      return User.findAll({ where: { id: userIds } });
    }
  },
  GroupMember: {
    group: (member: any) => Group.findByPk(member.groupId),
    user: (member: any) => User.findByPk(member.userId)
  }
};
