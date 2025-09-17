import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { getUser } from "../utils/auth";

export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentTxt, setCommentTxt] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const user = getUser();

  const fetchVideo = async () => {
    setLoadingVideo(true);
    try {
      const res = await api.get(`/videos/${id}`);
      setVideo(res.data);
    } catch {
      setVideo(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/comments/${id}`);
      setComments(res.data);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [id]);

  const addComment = async () => {
    if (!commentTxt.trim()) return;
    await api.post("/comments", { videoId: id, text: commentTxt });
    setCommentTxt("");
    fetchComments();
  };

  const saveEdit = async (cid) => {
    await api.put(`/comments/${cid}`, { text: editText });
    setEditing(null);
    setEditText("");
    fetchComments();
  };

  const deleteComment = async (cid) => {
    if (!window.confirm("Delete comment?")) return;
    await api.delete(`/comments/${cid}`);
    fetchComments();
  };

  const like = async () => {
    await api.post(`/videos/${id}/like`);
    fetchVideo();
  };

  const dislike = async () => {
    await api.post(`/videos/${id}/dislike`);
    fetchVideo();
  };

  if (loadingVideo) return <div className="p-4 text-center">Loading video...</div>;

  if (!video) return <div className="p-4 text-center">Video not found</div>;

  return (
    <div className="flex flex-col lg:flex-row p-4 gap-6">
      <div className="flex-1">
        <video controls src={video.videoUrl} className="w-full max-h-[500px] rounded-lg shadow" />
        <h2 className="mt-3 text-xl font-bold">{video.title}</h2>
        <p className="text-gray-600">{video.views} views</p>

        <div className="flex gap-3 mt-2">
          <button onClick={like} className="px-4 py-2 bg-gray-200 rounded">
            👍 {video.likes}
          </button>
          <button onClick={dislike} className="px-4 py-2 bg-gray-200 rounded">
            👎 {video.dislikes}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg">Comments</h3>
          {user ? (
            <div className="mt-2 flex gap-2">
              <textarea
                className="flex-1 border rounded p-2"
                value={commentTxt}
                onChange={(e) => setCommentTxt(e.target.value)}
                placeholder="Add a comment..."
              />
              <button className="bg-blue-500 text-white px-3 rounded" onClick={addComment}>
                Post
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Login to comment</p>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {loadingComments ? (
              <p className="text-center text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-600">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="border-b pb-2">
                  <div className="font-semibold">{c.userId?.username}</div>
                  <div className="text-gray-700 text-sm">{new Date(c.createdAt).toLocaleString()}</div>

                  {editing === c._id ? (
                    <div className="mt-2">
                      <textarea
                        className="w-full border rounded p-2"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 mt-1">
                        <button className="bg-green-500 text-white px-3 rounded" onClick={() => saveEdit(c._id)}>
                          Save
                        </button>
                        <button className="bg-gray-400 text-white px-3 rounded" onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1">{c.text}</p>
                  )}

                  {user && user.id === c.userId?._id && editing !== c._id && (
                    <div className="flex gap-2 mt-1">
                      <button
                        className="text-blue-600"
                        onClick={() => {
                          setEditing(c._id);
                          setEditText(c.text);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-red-600" onClick={() => deleteComment(c._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80">
        <h3 className="font-semibold mb-2">Recommended</h3>
        <p className="text-gray-500">You can extend this later</p>
      </div>
    </div>
  );
}
