// src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../client';

// Re-use timeAgo function or import it
const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
};

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState({ author: '', content: '' });
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);

    useEffect(() => {
        fetchPostAndComments();
    }, [id]); // Refetch if id changes

    const fetchPostAndComments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch post details
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single(); // Expecting only one post

            if (postError) throw postError;
            if (!postData) throw new Error("Post not found.");

            setPost(postData);

            // Fetch comments for the post
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', id)
                .order('created_at', { ascending: true }); // Show oldest comments first

            if (commentsError) throw commentsError;
            setComments(commentsData || []);

        } catch (err) {
            console.error("Error fetching post details or comments:", err);
            setError(err.message || "Failed to load post details.");
            setPost(null); // Ensure post is null on error
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async () => {
        if (!post) return;

         // Optimistic update (optional but improves UX)
         const currentUpvotes = post.upvotes;
         setPost(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));

        try {
            const { error: updateError } = await supabase
                .from('posts')
                .update({ upvotes: post.upvotes + 1 }) // Increment based on the fetched value
                .eq('id', id);

            if (updateError) {
                // Revert optimistic update on error
                setPost(prev => ({ ...prev, upvotes: currentUpvotes }));
                throw updateError;
            }
             // No need to refetch if optimistic update worked,
             // but keep the state update above the try block

        } catch (err) {
            console.error("Error upvoting post:", err);
            alert("Failed to upvote. Please try again."); // Simple feedback
        }
    };

     const handleDeletePost = async () => {
        if (!post) return;

        // Simple confirmation
        if (window.confirm("Are you sure you want to delete this post and its comments?")) {
             setLoading(true); // Show loading indicator during delete
             try {
                const { error: deleteError } = await supabase
                    .from('posts')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;

                console.log("Post deleted successfully");
                navigate('/'); // Navigate home after successful delete
            } catch (err) {
                console.error("Error deleting post:", err);
                setError(err.message || "Failed to delete post.");
                setLoading(false); // Stop loading indicator on error
            }
             // No finally needed as navigate() leaves the page
        }
    };

    const handleCommentChange = (event) => {
        const { name, value } = event.target;
        setNewComment(prev => ({ ...prev, [name]: value }));
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        setCommentLoading(true);
        setCommentError(null);

        if (!newComment.content.trim()) {
            setCommentError("Comment content cannot be empty.");
            setCommentLoading(false);
            return;
        }

        try {
            const { data, error: insertError } = await supabase
                .from('comments')
                .insert([
                    {
                        post_id: id,
                        author: newComment.author.trim() || 'Anonymous', // Default author if empty
                        content: newComment.content.trim(),
                    }
                ])
                .select(); // Return the inserted comment

            if (insertError) throw insertError;

            // Add the new comment to the list without full refetch
            setComments(prev => [...prev, data[0]]);
            setNewComment({ author: '', content: '' }); // Clear form

        } catch (err) {
            console.error("Error adding comment:", err);
            setCommentError(err.message || "Failed to add comment.");
        } finally {
            setCommentLoading(false);
        }
    };


    if (loading) return <p className="loading">Loading post details...</p>;
    if (error) return <p className="error">Error: {error}</p>;
    if (!post) return <p>Post not found.</p>; // Should be caught by error state, but good fallback

    return (
        <div className="post-detail-container">
            <div className="post-detail">
                <h1>{post.title}</h1>
                <p className="post-meta">
                    Created {timeAgo(post.created_at)} • {post.upvotes} Upvotes
                </p>
                {post.content && <p>{post.content}</p>}
                {post.image_url && (
                    <a href={post.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={post.image_url} alt={post.title || 'Post image'} />
                    </a>
                )}

                <div className="post-actions">
                   <div className="upvote-section">
                       <button onClick={handleUpvote}>⬆️ Upvote</button>
                       <span>({post.upvotes})</span>
                   </div>
                    <Link to={`/edit/${post.id}`}>
                         <button className="warning">Edit Post</button>
                    </Link>
                    <button onClick={handleDeletePost} className="danger">Delete Post</button>
                </div>
            </div>

            <div className="comments-section">
                <h3>Comments</h3>
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <div>
                         <label htmlFor="author">Name (Optional)</label>
                         <input
                            type="text"
                            id="author"
                            name="author"
                            placeholder="Your name"
                            value={newComment.author}
                            onChange={handleCommentChange}
                            disabled={commentLoading}
                        />
                    </div>
                     <div>
                         <label htmlFor="comment-content">Leave a Comment</label>
                         <textarea
                            id="comment-content"
                            name="content"
                            placeholder="Share your thoughts..."
                            value={newComment.content}
                            onChange={handleCommentChange}
                            required
                            disabled={commentLoading}
                        />
                    </div>
                    {commentError && <p className="error" style={{textAlign: 'center'}}>{commentError}</p>}
                    <button type="submit" className="primary" disabled={commentLoading}>
                         {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>

                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <p>{comment.content}</p>
                                <div className="comment-meta">
                                    <span>By: {comment.author || 'Anonymous'}</span>
                                    <span>{timeAgo(comment.created_at)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;