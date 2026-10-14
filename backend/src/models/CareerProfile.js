const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = sequelize.define("CareerProfile", {
  userId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, allowNull: false },
  data: { type: DataTypes.JSON, allowNull: false },
}, { tableName: "career_profiles", timestamps: true });
