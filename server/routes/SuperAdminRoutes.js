import express from "express";
import {
  approveCourse,
  rejectCourse,
} from "../controllers/SuperAdminController.js";

const superAdminRouter = express.Router();

superAdminRouter.put("/approve-course/:id", approveCourse);
superAdminRouter.put("/reject-course/:id", rejectCourse);
export default superAdminRouter;
