import { verifyToken } from "@clerk/backend";
import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

// Resolve Clerk user id from middleware or Bearer token.
export const resolveAuthUserId = async (req) => {
  if (req.auth?.userId) return req.auth.userId;

  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;

  try {
    const payload = await verifyToken(header.slice(7), {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload.sub || null;
  } catch {
    return null;
  }
};

// Ensures a Clerk user exists in MongoDB (needed when webhooks are not configured yet).
export const ensureUserExists = async (userId) => {
  if (!userId) return null;

  const existing = await User.findById(userId);
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(userId);
  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@users.local`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    "User";
  const imageUrl = clerkUser.imageUrl || "https://www.gravatar.com/avatar/?d=mp";

  try {
    return await User.create({
      _id: userId,
      email,
      name,
      imageUrl,
      enrolledCourses: [],
    });
  } catch (error) {
    // Another request may have created the same user at the same time.
    if (error?.code === 11000) {
      return User.findById(userId);
    }
    throw error;
  }
};

export default ensureUserExists;
