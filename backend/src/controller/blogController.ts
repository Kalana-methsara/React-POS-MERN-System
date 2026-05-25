import { Request, Response } from "express"
import cloudinary from "../config/cloudinary"
import { BlogModel } from "../models/blogModel"
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler"

// ─── CREATE BLOG (ADMIN, MANAGER) ─────────────────────────
// POST /api/v1/blog/create
export const saveBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body
  let imageUrl = ''

  // If file uploaded → stream to Cloudinary
  if (req.file) {
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blog",
          transformation: [ // මෙය මගින් upload වෙන ගමන්ම compress කරන්න පුළුවන්
          { width: 800, crop: "scale", quality: "auto", fetch_format: "auto" }
        ]
         },
        (error, result) => (error ? reject(error) : resolve(result))
      )
      uploadStream.end(req.file?.buffer)
    })
    imageUrl = result.secure_url
  }

  // Save blog to MongoDB
  const newBlog = await BlogModel.create({
    title,
    content,
    imageURL: imageUrl,
    author: req.user?._id,
  })

  res.status(201).json({ message: "Blog created successfully!", data: newBlog })
})

// ─── GET ALL BLOGS (PUBLIC, Paginated) ─────────────────────
// GET /api/v1/blog/
export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const [blogs, totalDataCount] = await Promise.all([
    BlogModel.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit),
    BlogModel.countDocuments()
  ])

  res.status(200).json({
  data: blogs,
  pagination: {
    totalData: totalDataCount,
    totalPages: Math.ceil(totalDataCount / limit),
    currentPage: page,
    limit,
  },
})
})

// ─── GET MY BLOGS (ADMIN, MANAGER — own blogs) ─────────────
// GET /api/v1/blog/me
export const getMyBlogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const [blogs, totalDataCount] = await Promise.all([
    BlogModel.find({ author: req.user?._id })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit),
    BlogModel.countDocuments({ author: req.user?._id })
  ])

res.status(200).json({
  data: blogs,
  pagination: {
    totalData: totalDataCount,
    totalPages: Math.ceil(totalDataCount / limit),
    currentPage: page,
    limit,
  },
})
})

// ─── UPDATE BLOG ──────────────────────────────────────────
// PUT /api/v1/blog/:id
export const updateBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Find the blog first to verify ownership
  const blog = await BlogModel.findById(id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  // Ensure the user owns this blog (assuming Admin can update anything, 
  // otherwise keep strictly to blog.author === req.user._id)
  if (blog.author.toString() !== req.user?._id.toString()) {
    return res.status(403).json({ message: "Unauthorized to update this blog" });
  }

  let imageUrl = blog.imageURL;

  // If a new image is uploaded, update it on Cloudinary
  if (req.file) {
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blog" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(req.file?.buffer);
    });
    imageUrl = result.secure_url;
  }

  const updatedBlog = await BlogModel.findByIdAndUpdate(
    id,
    { title, content, imageURL: imageUrl },
    { returnDocument: 'after' }

  );

  res.status(200).json({ message: "Blog updated successfully!", data: updatedBlog });
});

// ─── DELETE BLOG ──────────────────────────────────────────
// DELETE /api/v1/blog/:id
export const deleteBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const blog = await BlogModel.findById(id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  // Ownership check
  if (blog.author.toString() !== req.user?._id.toString()) {
    return res.status(403).json({ message: "Unauthorized to delete this blog" });
  }

  await BlogModel.findByIdAndDelete(id);

  res.status(200).json({ message: "Blog deleted successfully!" });
});

// ─── SEARCH BLOGS ─────────────────────────────────────────
// GET /api/v1/blog/search?q=keyword

export const searchBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { query, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    $or: [
      { title: { $regex: query as string, $options: "i" } },
      { content: { $regex: query as string, $options: "i" } },
    ],
  };

  const [blogs, totalDataCount] = await Promise.all([
    BlogModel.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    BlogModel.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: blogs,
    pagination: {
      totalData: totalDataCount,
      totalPages: Math.ceil(totalDataCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    },
  });
});