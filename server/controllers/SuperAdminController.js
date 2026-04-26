import Course from "../models/Course.js";

export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
    } else {
      course.status = "published";
      await course.save();

      res.json({ message: "Course approved successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error approving course" });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
    } else {
      course.status = "rejected";
      await course.save();

      res.json({ message: "Course rejected successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error rejecting course" });
  }
};
