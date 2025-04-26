// src/pages/HomeFeed.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import PostCard from '../components/PostCard';

const HomeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at'); // 'created_at' or 'upvotes'

    useEffect(() => {
        fetchPosts();
    }, [sortBy]); // Refetch when sortBy changes

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('posts')
                .select('*')
                .order(sortBy, { ascending: false }); // Default descending

            if (searchTerm.trim() !== '') {
                // Use ilike for case-insensitive search on the title
                query = query.ilike('title', `%${searchTerm.trim()}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setPosts(data || []);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message || "Failed to fetch posts.");
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Optional: Fetch immediately on type, or wait for explicit search button click
    };

    // Handle search submission (e.g., pressing Enter or clicking a button)
    const handleSearchSubmit = (event) => {
        event.preventDefault(); // Prevent form submission if inside a form
        fetchPosts(); // Trigger fetch with the current search term
    };

     // Handle sorting change
    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        // useEffect will trigger refetch
    };


    return (
        <div>
            <h2>Discover Software Engineering Insights</h2>

            <div className="feed-controls">
                <form onSubmit={handleSearchSubmit} style={{ flexDirection: 'row', alignItems: 'center', background: 'none', padding: 0, border: 'none', marginBottom: 0 }}>
                    <input
                        type="text"
                        placeholder="Search posts by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button type="submit">Search</button>
                </form>
                 <div>
                    <span>Sort by:</span>
                    <button onClick={() => handleSortChange('created_at')} disabled={sortBy === 'created_at'}>
                        Newest
                    </button>
                    <button onClick={() => handleSortChange('upvotes')} disabled={sortBy === 'upvotes'}>
                        Most Popular
                    </button>
                </div>
            </div>


            {loading && <p className="loading">Loading posts...</p>}
            {error && <p className="error">Error: {error}</p>}

            {!loading && !error && posts.length === 0 && (
                <p>No posts found. Create the first one!</p>
            )}

            {!loading && !error && posts.length > 0 && (
                <div className="post-feed">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeFeed;