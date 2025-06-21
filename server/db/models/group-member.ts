import { Sequelize } from "sequelize";

export default (sequelize: Sequelize, DataTypes: any) => {
  const GroupMember = sequelize.define("GroupMember", {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "group_id",
      references: {
        key: "id",
        model: "groups"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        key: "id",
        model: "users"
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  }, {
    modelName: "GroupMember",
    tableName: "group_members",
    updatedAt: false
  });

  return GroupMember;
};
