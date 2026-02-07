const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('report_portal', 'admin', 'admin', {
  host: 'db',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
