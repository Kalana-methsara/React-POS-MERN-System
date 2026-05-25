import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware"; // admin ඉවත් කර, requireRole පමණක් තබා ගන්න
import { requireRole } from "../middleware/requireRole";
import { UserRole } from "../models/enums/userRole";
import { 
  registerUser, 
  loginUser, 
  getMyDetails, 
  registerAdmin, 
  getUsers,
  registerManager 
} from "../controller/userController"; 
import { validate } from "../middleware/validateMiddleware";
import { loginSchema, registerSchema } from "../schemas/authSchema";
 
const router = Router();
 
// Public routes
router.post("/register", validate(registerSchema), registerUser);
// router.post("/register", registerUser);
router.post("/login", validate(loginSchema), loginUser);
// router.post("/login", loginUser);
 
// Protected routes (Logged in users)
router.get("/profile", authenticate, getMyDetails); 

// Admin only
router.post("/admin/register", authenticate, requireRole([UserRole.ADMIN]), registerAdmin);

// Admin & Manager access
router.post("/manager/register", authenticate, requireRole([UserRole.ADMIN, UserRole.MANAGER]), registerManager);

// Admin only (මෙයද admin middleware එක වෙනුවට requireRole යොදන්න)
router.get("/admin/users", authenticate, requireRole([UserRole.ADMIN]), getUsers); 
 
export default router;


