import { Sequelize } from "sequelize";

export default (sequelize: Sequelize, DataTypes: any) => {
  const User = sequelize.define("User", {
    firstName: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "first_name"
    },
    lastName: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "last_name"
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: "Please enter a valid username"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },userNotes: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "user_notes"
    }
  }, {
    modelName: "User",
    tableName: "users",
    timestamps: false
  });

  return User;
};