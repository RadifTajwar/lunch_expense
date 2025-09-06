import { OAuth2Client } from "google-auth-library";
import User from "~/server/models/user"; // lowercase 'user' folder for consistency
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { credential } = body;

  if (!credential) {
    throw createError({
      statusCode: 400,
      statusMessage: "No credential provided",
    });
  }

  // 🔥 Verify Google credential
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid Google credential",
    });
  }

  const { email, name } = payload;

  // 🔍 Check if user exists in DB (using static method)
  let user = await User.findByEmail(email);

  if (!user) {
    user = await User.create({
      email,
      name,
      role: "member", // default role
    });
  }

  // 🎟️ Generate JWT
  if (!process.env.JWT_SECRET) {
    throw createError({ statusCode: 500, statusMessage: "JWT_SECRET not set" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user,
  };
});
