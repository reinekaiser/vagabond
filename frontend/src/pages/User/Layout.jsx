import React from 'react'
import { Outlet } from 'react-router-dom';
import { MainHeader } from '../../components/MainHeader';
import Footer from '../../components/Footer';

const Layout = () => {
    return (
        <div>
            <MainHeader />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout;