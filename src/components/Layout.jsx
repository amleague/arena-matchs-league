import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { db } from '../services/store';

const Layout = () => {
    const navigate = useNavigate();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await db.getCurrentUser();
            if (!user) {
                navigate('/login');
            } else {
                setIsAuth(true);
            }
        };
        checkAuth();
    }, [navigate]);

    if (!isAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', paddingBottom: '70px' }}>
            <Navigation />
            <Outlet />
        </div>
    );
};

export default Layout;
