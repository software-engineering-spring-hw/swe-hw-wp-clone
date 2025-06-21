import Sequelize from "sequelize";
import user from "./user";
import message from "./message";
import group from "./group";
import groupMember from "./group-member";
import groupMessage from "./group-message";
// @ts-ignore
import config from "../config/config";

const { NODE_ENV } = process.env;
const environmentConfig = config[NODE_ENV === "production" ? "production" : "development"];

// @ts-ignore
const sequelize = new Sequelize(environmentConfig);

const models: any = {
  User: user(sequelize, Sequelize.DataTypes),
  Message: message(sequelize, Sequelize.DataTypes),
  Group: group(sequelize, Sequelize.DataTypes),
  GroupMember: groupMember(sequelize, Sequelize.DataTypes),
  GroupMessage: groupMessage(sequelize, Sequelize.DataTypes)
};

const { User, Message, Group, GroupMember, GroupMessage } = models;

User.hasMany(Message, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "recipientId" });
Message.belongsTo(User, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "recipientId" });

// Group associations
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId", otherKey: "userId" });
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId", otherKey: "groupId" });
Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

// GroupMessage associations
Group.hasMany(GroupMessage, { foreignKey: "groupId" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });
User.hasMany(GroupMessage, { foreignKey: "senderId" });
GroupMessage.belongsTo(User, { foreignKey: "senderId" });

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export { sequelize, User, Message, Group, GroupMember, GroupMessage };