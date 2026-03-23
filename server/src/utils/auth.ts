import { Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generates a JWT for a given user ID.
 */
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { 
    expiresIn: "30d" // Synchronized with cookie maxAge
  });
};

/**
 * Sets the authentication JWT in a secure HttpOnly cookie.
 */
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};
