const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Tutor = sequelize.define(
  "Tutor",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true },
    avatar: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "tutors",
    timestamps: true,
  },
);

module.exports = Tutor;
