import { Sequelize } from "sequelize";

export default (sequelize: Sequelize, DataTypes: any) => {
  const GroupMessage = sequelize.define("GroupMessage", {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "group_id",
      references: {
        key: "id",
        model: "groups"
      }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true, // allow null for system messages
      field: "sender_id",
      references: {
        key: "id",
        model: "users"
      }
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  }, {
    modelName: "GroupMessage",
    tableName: "group_messages",
    updatedAt: false
  });

  return GroupMessage;
};
