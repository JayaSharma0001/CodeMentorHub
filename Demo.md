# CodeMentorHub — Project Demo Guide

## What is MERN Stack?

**MERN** is a popular way to build full-stack web applications using **JavaScript** for both the frontend and backend.

| Letter | Technology | What it does (in simple words) |
|--------|------------|--------------------------------|
| **M** | **MongoDB** | Stores data (users, courses, enrollments) in a flexible database |
| **E** | **Express.js** | Runs the server and handles API requests (login, courses, payments) |
| **R** | **React** | Builds the UI — buttons, pages, forms — what users see and click |
| **N** | **Node.js** | Lets JavaScript run on the server (not just in the browser) |

### How they work together

```
User (Browser)  →  React (Frontend)  →  Express + Node (Backend)  →  MongoDB (Database)
```

1. User opens the website in the browser (React).
2. React sends requests to the backend (Express on Node).
3. The backend reads or saves data in MongoDB.
4. The response goes back to React, and the page updates.

---

## About CodeMentorHub

**CodeMentorHub** is an **online learning platform** — like a small Udemy or Coursera. People can **learn**, **teach**, and **manage courses** in one place.

### What is it for?

It connects **students** who want to learn with **educators** who create and sell courses. A **super admin** can review and approve courses before they go live.

---

## Main Features

### For Students
- Browse courses on the home page
- Search and filter courses
- View course details (price, description, ratings)
- Enroll in courses (with payment via **Stripe**)
- Watch video lessons in a course player
- See enrolled courses in "My Enrollments"
- Rate courses

### For Educators
- Dashboard with stats (earnings, students, etc.)
- Create courses with chapters and video lectures
- Upload thumbnails (via **Cloudinary**)
- Manage their courses
- See which students enrolled

### For Super Admin
- Login at `/super-admin-login`
- Approve or reject courses before they are published
- Manage the platform

---

## Tech Stack Used in This Project

| Part | Technology |
|------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (with Mongoose) |
| Authentication | Clerk (sign up, login, roles) |
| Payments | Stripe |
| File Storage | Cloudinary (images/thumbnails) |
| Hosting | Vercel (client and server) |

---

## Project Structure

```
CodeMentorHub/
├── client/          → React frontend (what users see)
│   ├── pages/student/     → Home, courses, player, enrollments
│   ├── pages/educator/    → Dashboard, add course, my courses
│   └── pages/superAdmin/  → Admin panel
│
└── server/          → Express backend (API + logic)
    ├── models/          → User, Course, Purchase, CourseProgress
    ├── routes/          → API endpoints
    └── controllers/     → Business logic
```

---

## How Data Flows (Example: Buying a Course)

1. Student opens a course page in **React**.
2. Clicks "Enroll" → **Stripe** handles payment.
3. **Express** API saves the purchase and enrollment in **MongoDB**.
4. Student can open the **Player** and watch lectures (often YouTube videos).

---

## User Roles

| Role | What they do |
|------|--------------|
| **Student** | Learns, enrolls, and watches courses |
| **Educator** | Creates and manages courses, sees earnings |
| **Super Admin** | Approves/rejects courses and oversees the platform |

---

## Summary

**CodeMentorHub** is a MERN-based online course platform where educators publish courses, students enroll and learn, and admins keep quality under control.
