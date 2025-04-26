// src/components/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Helper function to format time difference
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

const PostCard = ({ post }) => {
    return (
        <div className="card">
             <Link to={`/post/${post.id}`} className="card-link">
                <h2>{post.title}</h2>
                <p className="card-meta">
                    Created {timeAgo(post.created_at)} • {post.upvotes} Upvotes
                </p>
             </Link>
             {/* Link wraps the content, so actions might need separate handling if placed inside */}
        </div>
    );
};

export default PostCard;