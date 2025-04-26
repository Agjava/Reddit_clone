// src/pages/EditPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../client';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState({ title: '', content: '', image_url: '' });
    const [loading, setLoading] = useState(true); // Loading for fetching initial data
    const [updating, setUpdating] = useState(false); // Loading for the update action
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPostData();
    }, [id]);

    const fetchPostData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('posts')
                .select('title, content, image_url')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            if (!data) throw new Error("Post not found to edit.");

            setPost({
                title: data.title || '',
                content: data.content || '',
                image_url: data.image_url || ''
            });

        } catch (err) {
            console.error("Error fetching post for edit:", err);
            setError(err.message || "Failed to load post data.");
            // Optionally navigate back or show a persistent error
             navigate(`/post/${id}`); // Go back if post can't be fetched
        } finally {
            setLoading(false);
        }
    };

     const handleChange = (event) => {
        const { name, value } = event.target;
        setPost((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        setUpdating(true);
        setError(null);

         if (!post.title) {
            setError("Post title is required.");
            setUpdating(false);
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    title: post.title.trim(),
                    content: post.content.trim() || null,
                    image_url: post.image_url.trim() || null,
                 })
                .eq('id', id);

            if (updateError) throw updateError;

            console.log("Post updated successfully");
            navigate(`/post/${id}`); // Navigate back to the post detail page

        } catch (err) {
             console.error("Error updating post:", err);
             setError(err.message || "Failed to update post.");
        } finally {
            setUpdating(false);
        }
    };

     // Add a delete handler here as well, similar to PostDetail
     const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
             setUpdating(true); // Reuse updating state for loading indication
             setError(null);
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
                setUpdating(false); // Only stop loading on error here
            }
        }
    };


    if (loading) return <p className="loading">Loading post data for editing...</p>;
    // Show form even if there was a fetch error initially, allowing retry via submit
    // But maybe better to show error prominently if initial fetch failed

    return (
        <div>
            <h2>Edit Post</h2>
            {error && !updating && <p className="error" style={{textAlign: 'center'}}>{error}</p>}
            <form onSubmit={handleUpdate}>
                 {/* Display initial fetch error if it occurred */}
                 {error && !loading && !updating && <p className="error">Error loading data: {error}. You can still try to save changes.</p>}

                <div>
                    <label htmlFor="title">Title <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        required
                        disabled={updating}
                    />
                </div>
                <div>
                    <label htmlFor="content">Content (Optional)</label>
                    <textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleChange}
                        disabled={updating}
                    />
                </div>
                <div>
                    <label htmlFor="image_url">Image URL (Optional)</label>
                    <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        placeholder="e.g., https://example.com/image.png"
                        value={post.image_url}
                        onChange={handleChange}
                        disabled={updating}
                    />
                </div>

                {/* Display update-specific errors */}
                {error && updating && <p className="error" style={{textAlign: 'center'}}>{error}</p>}


                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                     <button type="submit" className="primary" disabled={updating || loading}>
                        {updating ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                     {/* Add Delete button on Edit page too */}
                     <button type="button" onClick={handleDeletePost} className="danger" disabled={updating || loading}>
                         Delete Post
                     </button>
                </div>
            </form>
        </div>
    );
};

export default EditPost;