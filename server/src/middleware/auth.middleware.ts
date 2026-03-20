import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

interface JwtPayload {
    id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Not authorized" });
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user; 
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalid" });
    }
}
export const requireRole = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
};
