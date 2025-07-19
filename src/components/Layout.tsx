
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';

export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100 dark:bg-gray-950">
        <AppSidebar />
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
