// src/pages/CreatePost.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';

const CreatePost = () => {
    const [post, setPost] = useState({ title: '', content: '', image_url: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPost((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!post.title) {
            setError("Post title is required.");
            setLoading(false);
            return;
        }

        try {
            const { data, error: insertError } = await supabase
                .from('posts')
                .insert([
                    {
                        title: post.title.trim(),
                        content: post.content.trim() || null, // Send null if empty
                        image_url: post.image_url.trim() || null, // Send null if empty
                        // upvotes default to 0 in DB
                    },
                ])
                .select(); // Return the inserted data

            if (insertError) throw insertError;

            console.log("Post created:", data);
            // Optionally navigate to the new post or home
             navigate('/'); // Navigate to home feed after creation
            // or navigate(`/post/${data[0].id}`); // Navigate to the new post detail page

        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.message || "Failed to create post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        required // HTML5 validation
                    />
                </div>
                <div>
                    <label htmlFor="content">Content (Optional)</label>
                    <textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="image_url">Image URL (Optional)</label>
                    <input
                        type="url" // Use type="url" for better semantics/validation
                        id="image_url"
                        name="image_url"
                        placeholder="e.g., https://example.com/image.png"
                        value={post.image_url}
                        onChange={handleChange}
                    />
                </div>

                {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}

                <button type="submit" className="primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;