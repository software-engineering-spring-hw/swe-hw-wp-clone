import { DataTypes, Model, Sequelize } from 'sequelize';

interface BlockedUsersAttributes {
  id?: number;
  blocker_id: number;
  blocked_id: number;
}

interface BlockedUsersCreationAttributes extends Omit<BlockedUsersAttributes, 'id'> {}

class BlockedUsers extends Model<BlockedUsersAttributes, BlockedUsersCreationAttributes> implements BlockedUsersAttributes {
  public id!: number;
  public blocker_id!: number;
  public blocked_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // Define associations
    BlockedUsers.belongsTo(models.User, {
      foreignKey: 'blocker_id',
      as: 'blocker'
    });
    BlockedUsers.belongsTo(models.User, {
      foreignKey: 'blocked_id',
      as: 'blocked'
    });
  }
}

export default (sequelize: Sequelize) => {
  BlockedUsers.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    blocker_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    blocked_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BlockedUsers',
    tableName: 'blocked_users',
    underscored: true
  });
  
  return BlockedUsers;
};