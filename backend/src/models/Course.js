const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    duration_minutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    image: { type: DataTypes.STRING(255), allowNull: true },
    tutorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    tableName: "courses",
    timestamps: true,
  },
);

module.exports = Course;
