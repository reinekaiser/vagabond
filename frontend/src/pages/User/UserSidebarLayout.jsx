import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from '../../components/MainHeader';
import Footer from '../../components/Footer';
import UserSidebar from '../../components/UserSidebar';

const UserSidebarLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <MainHeader />
    <div className="flex flex-1">
      <UserSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

export default UserSidebarLayout; 