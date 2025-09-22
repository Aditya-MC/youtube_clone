import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    const { data } = await API.get(`/comments/${videoId}`);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await API.post(`/comments/${videoId}`, { text: newComment });
    setNewComment("");
    fetchComments();
  };

  const handleDeleteComment = async (commentId) => {
    await API.delete(`/comments/${videoId}/${commentId}`);
    fetchComments();
  };

  const handleEditStart = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      await API.put(`/comments/${videoId}/${commentId}`, { text: editText });
      setEditingCommentId(null);
      setEditText("");
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      {user && (
        <div className="comment-add">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      )}
      <ul>
        {comments.map((c) => (
          <li key={c._id} className="comment-item">
            <div className="comment-content">
              <strong>{c.userId.username}:</strong>{" "}
              {editingCommentId === c._id ? (
                <div className="comment-edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-buttons">
                    <button 
                      className="btn-save" 
                      onClick={() => handleEditSave(c._id)}
                    >
                      Save
                    </button>
                    <button 
                      className="btn-cancel" 
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span className="comment-text">{c.text}</span>
              )}
            </div>
            {user && user._id === c.userId._id && editingCommentId !== c._id && (
              <div className="comment-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEditStart(c._id, c.text)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteComment(c._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}