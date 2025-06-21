module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("group_messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "group_id",
        references: {
          key: "id",
          model: "groups"
        },
        onDelete: "CASCADE"
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "sender_id",
        references: {
          key: "id",
          model: "users"
        },
        onDelete: "CASCADE"
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at"
      }
    });
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable("group_messages");
  }
};
