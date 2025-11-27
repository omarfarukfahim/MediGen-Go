
import React from 'react';
import { Page } from '../types';

interface AiFabProps {
  setCurrentPage: (page: Page) => void;
}

export const AiFab: React.FC<AiFabProps> = ({ setCurrentPage }) => (
  <button 
    onClick={() => setCurrentPage(Page.AiAssistant)}
    className="fixed bottom-6 right-6 w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all transform hover:scale-110"
    aria-label="Open AI Assistant"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12.5 14.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75V12h-1.5v2.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75V12h-1.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.5V9.75c0-.41.34-.75.75-.75s.75.34.75.75V11h1.5V9.75c0-.41.34-.75.75-.75s.75.34.75.75V11h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5v2.25z"/>
        <circle cx="9.5" cy="9.5" r="1.5"/>
        <circle cx="14.5" cy="9.5" r="1.5"/>
        <path d="M12 16.5c-1.5 0-2.75-1-3-2.25h6c-.25 1.25-1.5 2.25-3 2.25z"/>
    </svg>
  </button>
);
