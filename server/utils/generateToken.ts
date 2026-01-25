import jwt from "jsonwebtoken";
import { IUserDocument } from "../models/user.model";
import { Response } from "express";

export const generateToken = (res:Response, user:IUserDocument ) => {
    const token = jwt.sign({userId:user._id}, process.env.SECRET_KEY!, {expiresIn:'1d'});
    // Use secure, cross-site cookie settings in production when frontend and backend are on different domains
    const isProd = (process.env.NODE_ENV === 'production');
    res.cookie("token", token, {
        httpOnly: true,
        // In production, allow cross-site cookies for separate frontend/backend origins
        sameSite: isProd ? 'none' : 'strict',
        // Secure must be true for SameSite=None; Render serves over HTTPS
        secure: isProd ? true : false,
        maxAge: 24 * 60 * 60 * 1000,
    });
    return token;
}