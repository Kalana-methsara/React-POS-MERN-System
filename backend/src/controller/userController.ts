import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/generateToken";
import { AuthRequest } from "../middleware/authMiddleware";
import { UserRole } from "../models/enums/userRole";
import { asyncHandler } from "../middleware/asyncHandler";

// 1. Register User
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    const existing = await UserModel.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ 
        name, email, password: hashedPassword, userRole: [UserRole.USER] 
    });
    
    const token = signAccessToken(user);
    res.status(201).json({ _id: user._id, name, email, token });
});

// 2. Login User
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(200).json({
        message: "Login successful",
        data: { email: user.email, roles: user.userRole, accessToken, refreshToken }
    });
});

// 3. Get My Details
export const getMyDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserModel.findById(req.user?._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, data: user });
});

// 4. Register Admin (By Admin)
export const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    if (await UserModel.findOne({ email })) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await UserModel.create({
        name, email, password: hashedPassword, userRole: [UserRole.ADMIN], approved: true
    });

    const adminResponse = admin.toObject();
    delete (adminResponse as any).password;
    res.status(201).json({ message: "ADMIN created successfully", data: adminResponse });
});

export const registerManager = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newManager = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        userRole: [UserRole.MANAGER], 
        approved: true
    });

    res.status(201).json({ 
        message: "MANAGER created successfully", 
        data: { id: newManager._id, name: newManager.name, email: newManager.email } 
    });
});

// 5. Get All Users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserModel.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
});