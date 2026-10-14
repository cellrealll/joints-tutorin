// Simple models index: import models that already call sequelize.define()
// then define associations and export them.

const { sequelize } = require("../config/db");

const Course = require("./Course");
const Tutor = require("./Tutor");
const Enrollment = require("./Enrollment");
const User = require("./User");
const CareerProfile = require("./CareerProfile");
CareerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(CareerProfile, { foreignKey: "userId", as: "careerProfile" });

// Define associations (pastikan nama foreignKey sama dengan yang ada di models)
if (Course && Tutor && typeof Course.belongsTo === "function") {
  Course.belongsTo(Tutor, { foreignKey: "tutorId", as: "tutor" });
  if (typeof Tutor.hasMany === "function") {
    Tutor.hasMany(Course, { foreignKey: "tutorId", as: "courses" });
  }
}

if (Enrollment && Course && typeof Enrollment.belongsTo === "function") {
  Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });
  if (typeof Course.hasMany === "function") {
    Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });
  }
}

if (Enrollment && User && typeof Enrollment.belongsTo === "function") {
  Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });
  if (typeof User.hasMany === "function") {
    User.hasMany(Enrollment, { foreignKey: "userId", as: "enrollments" });
  }
}

module.exports = {
  sequelize,
  Course,
  Tutor,
  Enrollment,
  User,
  CareerProfile,
};
