import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'

// update role to educator
export const updateRoleToEducator = async (req, res) => {

    try {

        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req, res) => {

    try {

        const { courseData } = req.body

        const imageFile = req.file

        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = JSON.parse(courseData)

        parsedCourseData.educator = educatorId
        parsedCourseData.status = 'pending'

        // Try Cloudinary first. If Cloudinary credentials are rejected in production,
        // fallback to a data URL so course creation still works.
        const imageBase64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`
        let courseThumbnail = imageBase64
        let usedCloudinaryFallback = true

        try {
            const imageUpload = await cloudinary.uploader.upload(imageBase64, {
                folder: 'coding-ninja/courses'
            })

            courseThumbnail = imageUpload.secure_url
            usedCloudinaryFallback = false
        } catch (uploadError) {
            const cloudinaryStatusCode = uploadError?.http_code || uploadError?.statusCode

            // Unexpected upload errors should still fail to avoid hiding real issues.
            if (cloudinaryStatusCode && cloudinaryStatusCode !== 403) {
                throw uploadError
            }
        }

        parsedCourseData.courseThumbnail = courseThumbnail

        await Course.create(parsedCourseData)

        res.json({
            success: true,
            message: usedCloudinaryFallback
                ? 'Course Added (thumbnail saved using fallback storage)'
                : 'Course Added'
        })

    } catch (error) {

        res.json({ success: false, message: `Course upload failed: ${error.message}` })

    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
