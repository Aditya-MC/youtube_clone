export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }
  // Simple regex for email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: "Email/username and password are required" });
  }
  next();
};

export const validateVideo = (req, res, next) => {
  const { title, videoUrl, category } = req.body;
  if (!title || !videoUrl || !category) {
    return res.status(400).json({ message: "Title, video URL, and category are required" });
  }
  next();
};

export const validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment text cannot be empty" });
  }
  next();
};
