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
      type: DataTypes.STRING(20),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    }
  }, {
    modelName: "User",
    tableName: "users",
    timestamps: false
  });

  // Add the associate method using Object.assign or direct assignment
  (User as any).associate = (models: any) => {
    // Add existing associations here if you have any
    // For example: User.hasMany(models.Message, { foreignKey: 'sender_id' });
    
    // Add the new block relationships
    User.belongsToMany(models.User, {
      through: models.BlockedUsers,
      as: 'blockedUsers',
      foreignKey: 'blocker_id',
      otherKey: 'blocked_id'
    });
    
    User.belongsToMany(models.User, {
      through: models.BlockedUsers,
      as: 'blockedByUsers',
      foreignKey: 'blocked_id',
      otherKey: 'blocker_id'
    });
  };

  return User;
};