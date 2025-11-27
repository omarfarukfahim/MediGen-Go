
// Fix: Create the Header component with navigation and login/logout functionality.
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  setCurrentPage: (page: Page) => void;
  isLoggedIn: boolean;
  handleLogout: () => void;
  isAdmin?: boolean;
}

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
  <button onClick={onClick} className={`text-gray-600 hover:text-teal-700 font-medium transition-colors ${className}`}>
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ setCurrentPage, isLoggedIn, handleLogout, isAdmin }) => (
  <header className="bg-white shadow-sm sticky top-0 z-40">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage(Page.Home)}>
        <svg className="w-8 h-8 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/>
        </svg>
        <span className="text-2xl font-bold text-gray-800">MediGen</span>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <NavLink onClick={() => setCurrentPage(Page.Home)}>Home</NavLink>
        <NavLink onClick={() => setCurrentPage(Page.Doctors)}>Find a Doctor</NavLink>
        {isLoggedIn && (
          <>
            <NavLink onClick={() => setCurrentPage(Page.Appointments)}>My Appointments</NavLink>
            <NavLink onClick={() => setCurrentPage(Page.Wellness)}>Wellness</NavLink>
            <NavLink onClick={() => setCurrentPage(Page.SocialForum)}>Social Forum</NavLink>
          </>
        )}
        <NavLink onClick={() => setCurrentPage(Page.Articles)}>Articles</NavLink>
        <NavLink 
          onClick={() => setCurrentPage(Page.MediGenPlus)}
          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
        >
          MediGen+
        </NavLink>
      </nav>
      <div className="flex items-center space-x-4">
        {isAdmin && (
            <button
                onClick={() => setCurrentPage(Page.AdminDashboard)}
                className="px-3 py-1 bg-gray-800 text-white text-xs rounded uppercase tracking-wider font-bold hover:bg-gray-700"
            >
                Admin Panel
            </button>
        )}

        {isLoggedIn ? (
          <>
            <button onClick={() => setCurrentPage(Page.Profile)} className="font-medium text-gray-600 hover:text-teal-700">Profile</button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={() => setCurrentPage(Page.Login)}
            className="px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-semibold"
          >
            Login
          </button>
        )}
      </div>
    </div>
  </header>
);
