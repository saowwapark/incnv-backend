const Sequelize = require('sequelize/index');

const sequelize = new Sequelize('inCNV', 'root', 'glk;4k8', {
    dialect: 'mysql',
    host: 'localhost'
  });
  

module.exports = sequelize;
