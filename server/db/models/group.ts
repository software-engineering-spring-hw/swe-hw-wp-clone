import { Sequelize } from "sequelize";

export default (sequelize: Sequelize, DataTypes: any) => {
  const Group = sequelize.define("Group", {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  }, {
    modelName: "Group",
    tableName: "groups",
    updatedAt: false
  });

  return Group;
};
