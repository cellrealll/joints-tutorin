const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");

router.get("/", courseController.list);

router.get("/:id", courseController.get);

router.post("/:id/enroll", auth, courseController.enroll);

router.get("/my/enrollments", auth, courseController.myEnrollments);

module.exports = router;
