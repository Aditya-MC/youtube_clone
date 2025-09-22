# 🎬 YouTube Clone (MERN Stack)

A full-stack YouTube Clone application built with the **MERN Stack (MongoDB, Express, React, Node.js)**.  
This project replicates core YouTube functionalities such as **video browsing, authentication, channel management, likes/dislikes, and comments**.

---

## 🚀 Features

### Frontend (React + Vite)
- **Home Page**
  - YouTube-style header with search bar.
  - Sidebar toggle with filter categories.
  - Grid display of video thumbnails (Title, Thumbnail, Channel Name, Views).
- **User Authentication**
  - Register/Login with username, email & password.
  - Secure authentication using **JWT**.
  - Display logged-in user’s name on header after login.
- **Search & Filter**
  - Search videos by title.
  - Filter videos by categories (minimum 6 filters).
- **Video Player Page**
  - Video playback with title, description, and channel details.
  - Like/Dislike buttons with count.
  - Comment section with **CRUD (Create, Read, Update, Delete)**.
- **Channel Page**
  - Create your own channel (post-login).
  - Upload, edit, and delete videos.
  - View channel-specific content.
- **Responsive Design**
  - Works seamlessly across **mobile, tablet, and desktop**.

---

### Backend (Node.js + Express)
- **Authentication**
  - Register, login, JWT token-based authentication.
- **Channel Management**
  - Create, edit, delete channels.
- **Video Management**
  - Upload, fetch, update, and delete videos.
- **Comment Management**
  - Add, edit, delete, and fetch comments.
- **MongoDB Database**
  - Stores users, videos, channels, and comments.
  - File metadata such as video URL & thumbnail URL stored.

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Axios, Vite, TailwindCSS (optional for styling)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas or local instance)
- **Authentication**: JSON Web Tokens (JWT)
- **Version Control**: Git & GitHub

---


---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas or MongoDB Compass (local)
- Git

### Steps
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/yt-clone.git
   cd yt-clone
   
**Setup Backend**
cd backend
npm install
npm run seed
npm run dev

Create a .env file in /backend with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

**Setup Frontend**

cd frontend
npm install
npm run dev

Author
Aditya MC
