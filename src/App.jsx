// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomeFeed from './pages/HomeFeed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
// No need to import index.css here, main.jsx does it

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomeFeed />} />
                    <Route path="new" element={<CreatePost />} />
                    <Route path="post/:id" element={<PostDetail />} />
                    <Route path="edit/:id" element={<EditPost />} />
                    {/* Optional: Add a 404 Not Found Route */}
                     <Route path="*" element={<h2>404 Not Found</h2>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;