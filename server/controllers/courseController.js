import Course from "../models/Course.js";
import ensureUserExists from "../utils/ensureUser.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ status: "published" }).select([
      "-courseContent",
      "-enrolledStudents",
    ]);

    // Sync missing educator users so populate does not return null
    await Promise.all(
      courses.map(async (course) => {
        try {
          await ensureUserExists(course.educator);
        } catch {
          // Keep course visible even if educator sync fails
        }
      })
    );

    await Course.populate(courses, {
      path: "educator",
      select: "-password",
    });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Course by Id
export const getCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = await Course.findById(id);

    if (!courseData) {
      return res.json({ success: false, message: "Course not found" });
    }

    try {
      await ensureUserExists(courseData.educator);
    } catch {
      // Course details can still load without educator sync
    }
    await courseData.populate({ path: "educator" });

    // Remove lectureUrl if isPreviewFree is false
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Pending Courses
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "pending" }).select([
      "-enrolledStudents",
    ]);

    await Promise.all(
      courses.map(async (course) => {
        try {
          await ensureUserExists(course.educator);
        } catch {
          // Keep pending course visible even if educator sync fails
        }
      })
    );

    await Course.populate(courses, {
      path: "educator",
      select: "-password",
    });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
