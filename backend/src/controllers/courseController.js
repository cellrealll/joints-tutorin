const { Course, Tutor, Enrollment } = require("../models");

exports.list = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: Tutor, as: "tutor", attributes: ["id", "name", "avatar"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.get = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Tutor,
          as: "tutor",
          attributes: ["id", "name", "bio", "avatar"],
        },
      ],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.enroll = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: req.params.id },
    });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: req.params.id,
    });
    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.myEnrollments = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          as: "course",
          include: [{ model: Tutor, as: "tutor", attributes: ["id", "name"] }],
        },
      ],
    });
    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
