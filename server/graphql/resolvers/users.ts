import bcrypt from "bcrypt";
import generateToken from "../../utils/generate-token";
import { UserInputError } from "apollo-server";
import { QueryTypes } from "sequelize";
import { sequelize, User, BlockedUsers } from "../../db/models/models-config";
import { User as UserType, ContextUser, LatestMessage } from "../../types/types";
import { getTotalUsers, getUsersWithLatestMessage } from "../../db/raw-queries/users";
// eslint-disable-next-line
const generateImage = require("../../utils/generate-image");

interface GetUsersWithLatestMessageResponse extends Omit<ContextUser, "username" | "password">, LatestMessage { }

export default {
  Query: {
    getAllUsersExceptLogged: async (_parent: any, args: { id: string; offset: string; limit: string; }, _context: { user: ContextUser; }) => {
      const { id, offset, limit } = args;
      const [totalUsers] = await sequelize.query(getTotalUsers, { type: QueryTypes.SELECT });
      const totalUsersExceptLoggedUser = totalUsers.count > 0 ? totalUsers.count - 1 : 0;

      if (totalUsersExceptLoggedUser === 0) {
        return { users: [], totalUsersExceptLoggedUser };
      }

      const getSidebarUsersChunk = getUsersWithLatestMessage(offset, limit);
      const sidebarUsersChunk = await sequelize.query(getSidebarUsersChunk, { type: QueryTypes.SELECT, replacements: [id, id, id, offset, limit] });

      const formattedSidebarUsersChunk = sidebarUsersChunk.map(({ content, createdAt, ...rest }: GetUsersWithLatestMessageResponse) => ({
        latestMessage: { content, createdAt },
        ...rest
      }));

      return { users: formattedSidebarUsersChunk, totalUsersExceptLoggedUser };
    },
    getUser: async (_parent: any, args: { id: string; }, _context: { user: ContextUser; }) => {
      const { id } = args;
      const user = await User.findOne({ where: { id } });
      return user;
    },
    getBlockedUsers: async (_: any, args: any, { user }: { user: ContextUser }) => {
      try {
        if (!user) throw new Error("Authentication required");
        
        const blockedUsers = await User.findAll({
          include: [{
            model: BlockedUsers,
            as: 'blockedByUsers',
            where: { blocker_id: user.id },
            required: true
          }]
        });
        
        return blockedUsers;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  },
  Mutation: {
    register: async (_parent: any, args: Omit<UserType, "id">) => {
      const { firstName, lastName, username, password } = args;
      const isUserExists = await User.findOne({ where: { username } });

      if (isUserExists) {
        throw new UserInputError("Username already exists");
      }

      const hasedPassword = await bcrypt.hash(password as string, 6);
      const user = await User.create({ firstName, lastName, username, password: hasedPassword, image: generateImage() });
      const { password: _userPassword, ...safeUserData } = user.toJSON();
      return { user: safeUserData, token: generateToken({ id: user.id, firstName, lastName }) };
    },
    login: async (_parent: any, args: Pick<UserType, "username" | "password">) => {
      const { username, password } = args;
      const user = await User.findOne({ where: { username } });

      if (!user) {
        throw new UserInputError("User not found");
      }

      const correctPassword = await bcrypt.compare(password as string, user.password);

      if (!correctPassword) {
        throw new UserInputError("Password is incorrect");
      }

      const { id, firstName, lastName, image } = user;
      return { user: { id, firstName, lastName, username, image }, token: generateToken({ id, firstName, lastName }) };
    },
    blockUser: async (_: any, { userId }: { userId: string }, { user }: { user: ContextUser }) => {
      try {
        if (!user) throw new Error("Authentication required");
        
        if (parseInt(userId) === Number(user.id)) {
          throw new Error("Cannot block yourself");
        }
        
        await BlockedUsers.findOrCreate({
          where: {
            blocker_id: user.id,
            blocked_id: parseInt(userId)
          }
        });
        
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    unblockUser: async (_: any, { userId }: { userId: string }, { user }: { user: ContextUser }) => {
      try {
        if (!user) throw new Error("Authentication required");
        
        await BlockedUsers.destroy({
          where: {
            blocker_id: user.id,
            blocked_id: parseInt(userId)
          }
        });
        
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  },
  User: {
    isBlocked: async (parent: any, _: any, { user }: { user: ContextUser }) => {
      if (!user) return false;
      
      const blocked = await BlockedUsers.findOne({
        where: {
          blocker_id: user.id,
          blocked_id: parent.id
        }
      });
      
      return !!blocked;
    },
    hasBlocked: async (parent: any, _: any, { user }: { user: ContextUser }) => {
      if (!user) return false;
      
      const blocked = await BlockedUsers.findOne({
        where: {
          blocker_id: parent.id,
          blocked_id: user.id
        }
      });
      
      return !!blocked;
    }
  },
  SidebarUser: {
    isBlocked: async (parent: any, _: any, { user }: { user: ContextUser }) => {
      if (!user) return false;
      
      const blocked = await BlockedUsers.findOne({
        where: {
          blocker_id: user.id,
          blocked_id: parent.id
        }
      });
      
      return !!blocked;
    },
    hasBlocked: async (parent: any, _: any, { user }: { user: ContextUser }) => {
      if (!user) return false;
      
      const blocked = await BlockedUsers.findOne({
        where: {
          blocker_id: parent.id,
          blocked_id: user.id
        }
      });
      
      return !!blocked;
    }
  }
};