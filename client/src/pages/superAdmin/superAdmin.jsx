import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

// ✅ Extract all lecture URLs
const extractAllLectureUrls = (course) => {
  const urls = [];
  course?.courseContent?.forEach((chapter) => {
    chapter?.chapterContent?.forEach((lecture) => {
      if (lecture?.lectureUrl) {
        urls.push(lecture.lectureUrl);
      }
    });
  });
  return urls;
};

const SuperAdminPage = () => {
  const { pendingCourses, fetchPendingCourses, backendUrl } =
    useContext(AppContext);

  const handleApprove = async (courseId) => {
    try {
      await axios.put(`${backendUrl}/api/superadmin/approve-course/${courseId}`);
      fetchPendingCourses();
    } catch (error) {
      console.error("Approve Error:", error);
    }
  };

  const handleReject = async (courseId) => {
    try {
      await axios.put(`${backendUrl}/api/superadmin/reject-course/${courseId}`);
      fetchPendingCourses();
    } catch (error) {
      console.error("Reject Error:", error);
    }
  };

  return (
    <div className="py-16 md:px-40 px-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold text-gray-800">Pending Courses</h2>
      <p className="md:text-base text-sm text-gray-600 mt-2">
        Review and approve or reject pending courses.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {pendingCourses.map((course, index) => {
          const lectureUrls = extractAllLectureUrls(course);

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
            >
              <img
                src={course.courseThumbnail}
                alt={course.courseTitle}
                className="w-full h-48 object-cover rounded-lg"
              />

              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {course.courseTitle}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    Price: ₹{course.coursePrice}
                  </p>

                  <div
                    className="text-sm text-gray-700 mb-3"
                    dangerouslySetInnerHTML={{
                      __html: course.courseDescription,
                    }}
                  ></div>

                  {lectureUrls.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Lecture Videos:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {lectureUrls.map((url, i) => (
                          <li key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Lecture {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                    onClick={() => handleApprove(course._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                    onClick={() => handleReject(course._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuperAdminPage;
