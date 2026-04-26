import express from "express";
import {
  getAllCourse,
  getCourseId,
  getPendingCourses,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// Get Pending Courses
courseRouter.get("/pending", getPendingCourses);
// Get All Course
courseRouter.get("/all", getAllCourse);

// Get Course Data By Id
courseRouter.get("/:id", getCourseId);

export default courseRouter;
