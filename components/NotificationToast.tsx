
import React, { useEffect } from 'react';

interface NotificationToastProps {
  message: string;
  subMessage?: string;
  type: 'reminder' | 'email';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, subMessage, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000); // Auto dismiss after 6 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed right-4 z-50 flex items-start p-4 mb-4 bg-white rounded-lg shadow-lg border-l-4 w-80 transition-all duration-500 transform translate-x-0 animate-slideIn ${type === 'reminder' ? 'border-teal-500 top-24' : 'border-blue-500 top-48'}`}>
      <div className={`flex-shrink-0 p-2 rounded-full ${type === 'reminder' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'}`}>
        {type === 'reminder' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-bold text-gray-900">
          {type === 'reminder' ? 'Appointment Reminder' : 'Email Sent'}
        </h3>
        <div className="mt-1 text-sm text-gray-600">
          {message}
        </div>
        {subMessage && (
            <div className="mt-1 text-xs text-gray-400 italic">
                {subMessage}
            </div>
        )}
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
