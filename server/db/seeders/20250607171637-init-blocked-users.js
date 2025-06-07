'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    // Add some blocked relationships for testing
    await queryInterface.bulkInsert("blocked_users", [
      {
        blocker_id: 1, // guy blocks david
        blocked_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        blocker_id: 1, // guy blocks aaron
        blocked_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        blocker_id: 2, // david blocks harry
        blocked_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        blocker_id: 3, // aaron blocks guy (mutual block with user 1)
        blocked_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        blocker_id: 5, // victor blocks luke
        blocked_id: 6,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("blocked_users", null, {});
  }
};
