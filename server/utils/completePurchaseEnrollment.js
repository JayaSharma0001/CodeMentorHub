import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

// Marks a paid purchase as completed and enrolls the user (safe to call more than once).
export const completePurchaseEnrollment = async (purchaseId) => {
  const purchaseData = await Purchase.findById(purchaseId);

  if (!purchaseData) {
    throw new Error("Purchase not found");
  }

  if (purchaseData.status === "completed") {
    return purchaseData;
  }

  const userData = await User.findById(purchaseData.userId);
  const courseData = await Course.findById(purchaseData.courseId.toString());

  if (!userData || !courseData) {
    throw new Error("User or course not found for purchase");
  }

  const userId = String(userData._id);
  const courseId = courseData._id;

  if (!courseData.enrolledStudents.map(String).includes(userId)) {
    courseData.enrolledStudents.push(userId);
    await courseData.save();
  }

  if (!userData.enrolledCourses.map(String).includes(String(courseId))) {
    userData.enrolledCourses.push(courseId);
    await userData.save();
  }

  purchaseData.status = "completed";
  await purchaseData.save();

  return purchaseData;
};

export default completePurchaseEnrollment;
