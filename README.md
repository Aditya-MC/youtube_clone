**🎥 YouTube Clone – MERN Stack**

Git repo link : https://github.com/Aditya-MC/youtube_clone01/
**📌 Project Overview**

This project is a YouTube Clone built using the MERN stack (MongoDB, Express.js, React, Node.js).
It replicates the core features of YouTube including video browsing, authentication, channels, video player, likes/dislikes, and comments.

The goal of this project is to provide hands-on experience in building a full-stack application with authentication, CRUD operations, and responsive design.

**🚀 Features**
🔹 Frontend (React)

Home Page

Header with sign-in button / user profile after login

Sidebar with toggle

Category filter buttons

Video grid (title, thumbnail, channel, views)

User Authentication

Register & Login using JWT

Validation for email, username, password

Redirect after successful login

Search & Filter

Search bar in header

Filter videos by category

Video Player Page

Play video

Show title, description, channel, views

Like / Dislike functionality

Comment section with full CRUD (Add, Edit, Delete)

Channel Page

Create a channel after login

Upload, edit, and delete videos

Display channel videos and details

Responsive Design

Works across mobile, tablet, and desktop

##🔹 Backend (Node.js + Express)

Authentication APIs (JWT-based)

Register, Login, Protected Routes

Channel Management APIs

Create, update, fetch channel details

Video Management APIs

Upload, update, delete, fetch videos

Comment APIs

Add, update, delete, fetch comments

MongoDB Data Models

Users, Videos, Channels, Comments

**🛠️ Tech Stack**

Frontend: React, React Router, Axios, TailwindCSS (or custom styling)
Backend: Node.js, Express.js
Database: MongoDB (Atlas or local)
Authentication: JSON Web Token (JWT)
Version Control: Git, GitHub

**🎯 Usage**

Open the app in browser (default: http://localhost:5173).

Register/Login using JWT authentication.

Browse videos, filter categories, or search.

Click on a video to watch, like/dislike, and comment.

Create your channel and manage your uploaded videos.

**🧪 Sample Data**

Video Example

{
  "videoId": "video01",
  "title": "Learn React in 30 Minutes",
  "thumbnailUrl": "https://example.com/thumbnails/react30min.png",
  "videoUrl": "https://example.com/videos/react30min.mp4",
  "uploader": "user01",
  "views": 15200,
  "likes": 1023,
  "uploadDate": "2024-09-20"
}


**User Example**

{
  "userId": "user01",
  "username": "JohnDoe",
  "email": "john@example.com",
  "password": "hashedPassword123",
  "channels": ["channel01"]
}

**👨‍💻 Author**

Aditya MC
