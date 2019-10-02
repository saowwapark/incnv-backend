const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const File_Normalized = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.NUMBER,
    allowNull: false,
    unique: true
  },
  fileName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cnvToolName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  samplesetId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tags: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

module.exports = File_Normalized;
