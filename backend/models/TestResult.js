const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const TestResult = sequelize.define('TestResult', {
  framework: {
    type: DataTypes.STRING,
    allowNull: false
  },
  suite: {
    type: DataTypes.STRING,
    allowNull: true
  },
  testName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('passed', 'failed', 'skipped'),
    allowNull: false
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  run_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  extra: {
    type: DataTypes.JSON,
    allowNull: true
  },
  htmlReportPath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { timestamps: true });

module.exports = TestResult;
