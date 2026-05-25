import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createBlog, getAllBlog, updateBlog, deleteBlog } from "../services/blogService";
import type { Blog } from "../types";

const BlogPage = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  // Create modal state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  // Edit state
  const [editingPost, setEditingPost] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState("");

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async (pageNumber = 1) => {
    try {
      const data = await getAllBlog(pageNumber, 6);
      setPosts(data?.data ?? []);
      setTotalPage(data?.pagination?.totalPages ?? 10);
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleOpenCreate = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPreview("");
    setIsCreating(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleSavePost = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await createBlog(formData);
      setIsCreating(false);
      await fetchData(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (post: Blog) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImage(null);
    setEditPreview(post.imageURL ?? "");
  };

  const handleUpdatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("content", editContent);
      if (editImage) formData.append("image", editImage);

      await updateBlog(editingPost._id, formData);
      setEditingPost(null);
      await fetchData(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteBlog(id);
      setDeletingId(null);
      const newPage = posts.length === 1 && page > 1 ? page - 1 : page;
      await fetchData(newPage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Blogs</h1>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Blog
        </button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSavePost}
            className="bg-white shadow-xl rounded-xl p-6 space-y-4 border w-full max-w-lg"
          >
            <h2 className="text-xl font-semibold mb-2">Create New Blog</h2>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-lg p-2 h-24 focus:ring focus:ring-blue-300"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 rounded-lg"
            />

            {preview && (
              <div className="w-full mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUpdatePost}
            className="bg-white shadow-xl rounded-xl p-6 space-y-4 border w-full max-w-lg"
          >
            <h2 className="text-xl font-semibold mb-2">Edit Blog</h2>

            <input
              type="text"
              placeholder="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            />

            <textarea
              placeholder="Content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border rounded-lg p-2 h-24 focus:ring focus:ring-blue-300"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              className="w-full border p-2 rounded-lg"
            />

            {editPreview && (
              <div className="w-full mt-3">
                <img
                  src={editPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Update Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl rounded-xl p-6 space-y-4 border w-full max-w-sm">
            <h2 className="text-lg font-semibold">Delete Blog?</h2>
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeletePost(deletingId)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post._id}
            className="bg-white shadow-md rounded-xl overflow-hidden border p-3"
          >
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{post.content}</p>
            {post.imageURL && (
              <img
                src={post.imageURL}
                alt={post.title}
                className="w-full h-48 object-cover mt-3 rounded-lg"
              />
            )}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleEditClick(post)}
                className="flex-1 py-1.5 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50 transition"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(post._id)}
                className="flex-1 py-1.5 rounded-lg border border-red-500 text-red-600 text-sm hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={() => void fetchData(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        <div className="text-sm text-gray-600">
          Page {page} of {totalPage}
        </div>
        <button
          type="button"
          onClick={() => void fetchData(page + 1)}
          disabled={page === totalPage}
          className="px-4 py-2 rounded bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogPage;