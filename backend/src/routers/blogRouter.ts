import { Router } from "express"
import { 
  saveBlog, 
  getAllBlogs, 
  getMyBlogs, 
  updateBlog,  // Added
  deleteBlog,  // Added
  searchBlogs  // Added
} from "../controller/blogController"
import { authenticate } from "../middleware/authMiddleware"
import { requireRole } from "../middleware/requireRole"
import { UserRole } from "../models/enums/userRole"
import { upload } from "../middleware/uploadMiddleware"

const router = Router()

// PUBLIC — anyone can read blogs
router.get("/", getAllBlogs)

// PUBLIC — Search blogs (usually via query parameters)
router.get("/search", searchBlogs)

// PROTECTED — ADMIN & MANAGER only
router.post("/create",
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single("image"),
  saveBlog
)

// PROTECTED — own blogs only
router.get("/me",
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  getMyBlogs
)

// PROTECTED — Update specific blog
router.put("/:id",
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single("image"),
  updateBlog
)

// PROTECTED — Delete specific blog
router.delete("/:id",
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.MANAGER]),
  deleteBlog
)

export default router