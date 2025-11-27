
import React from 'react';

export const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 mt-12 py-8">
    <div className="container mx-auto px-4 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} MediGen. All rights reserved.</p>
      <p className="mt-2">This platform provides AI-generated health information and is not a substitute for professional medical advice.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <button className="hover:text-teal-700">Privacy Policy</button>
        <span>&bull;</span>
        <button className="hover:text-teal-700">Terms of Service</button>
        <span>&bull;</span>
        <button className="hover:text-teal-700">Contact Us</button>
      </div>
    </div>
  </footer>
);
