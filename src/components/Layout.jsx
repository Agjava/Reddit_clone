// src/components/Layout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div>
            <nav>
                <h1><Link to="/">Software Engineering Corner</Link></h1>
                <div className="nav-links">
                    <Link to="/">Home Feed</Link>
                    <Link to="/new">Create New Post</Link>
                </div>
            </nav>
            <main>
                <Outlet /> {/* Nested routes will render here */}
            </main>
        </div>
    );
};

export default Layout;