import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import ensureUserExists, { resolveAuthUserId } from "../utils/ensureUser.js"
import completePurchaseEnrollment from "../utils/completePurchaseEnrollment.js"



// Get User Data
export const getUserData = async (req, res) => {
    try {

        const userId = await resolveAuthUserId(req)

        if (!userId) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        // Create user in MongoDB if Clerk webhook has not synced yet
        const user = await ensureUserExists(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = await resolveAuthUserId(req)

        const courseData = await Course.findById(courseId)
        const userData = await ensureUserExists(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const amountNumber = Number(
            (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
        )

        const currency = process.env.CURRENCY.toLocaleLowerCase()
        // Stripe requires checkout total to convert to at least ~$0.50 USD.
        const minAmount = currency === 'inr' ? 50 : 0.5

        if (amountNumber > 0 && amountNumber < minAmount) {
            return res.json({
                success: false,
                message: currency === 'inr'
                    ? `Stripe minimum is about ₹${minAmount}. Your course final price is ₹${amountNumber}. Please set price after discount to at least ₹${minAmount}.`
                    : `Stripe minimum is $${minAmount}. Your course final price is $${amountNumber}. Please set price after discount to at least $${minAmount}.`
            })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: amountNumber.toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.round(amountNumber * 100)
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Confirm paid Stripe checkout and enroll user (works locally without Stripe webhook)
export const confirmPurchase = async (req, res) => {
    try {
        const userId = await resolveAuthUserId(req)
        if (!userId) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        const { sessionId } = req.body || {}

        if (sessionId) {
            const session = await stripeInstance.checkout.sessions.retrieve(sessionId)

            if (session.payment_status === 'paid' && session.metadata?.purchaseId) {
                const purchase = await Purchase.findById(session.metadata.purchaseId)

                if (purchase && purchase.userId === userId) {
                    await completePurchaseEnrollment(purchase._id)
                }
            }
        }

        // Recover any pending purchases that Stripe already marked as paid
        const pendingPurchases = await Purchase.find({ userId, status: 'pending' })

        if (pendingPurchases.length > 0) {
            const sessions = await stripeInstance.checkout.sessions.list({ limit: 40 })

            for (const session of sessions.data) {
                if (session.payment_status !== 'paid') continue

                const purchaseId = session.metadata?.purchaseId
                if (!purchaseId) continue

                const matched = pendingPurchases.find(
                    (purchase) => String(purchase._id) === String(purchaseId)
                )

                if (matched) {
                    await completePurchaseEnrollment(matched._id)
                }
            }
        }

        res.json({ success: true, message: 'Enrollment confirmed' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {

    try {

        const userId = await resolveAuthUserId(req)

        if (!userId) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        const userData = await ensureUserExists(userId)

        if (!userData) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        await userData.populate('enrolledCourses')

        res.json({
            success: true,
            enrolledCourses: userData.enrolledCourses || []
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {

    try {

        const userId = await resolveAuthUserId(req)

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {

    try {

        const userId = await resolveAuthUserId(req)

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {

    const userId = await resolveAuthUserId(req);
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};