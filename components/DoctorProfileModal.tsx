
import React, { useState } from 'react';
import { Doctor, Review } from '../types';
import { StarIcon } from './icons/StarIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { ClockIcon } from './icons/ClockIcon';
import { useData } from '../contexts/DataContext';

interface DoctorProfileModalProps {
  doctor: Doctor;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
  canReview?: boolean;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({ doctor, onClose, onBook, canReview }) => {
  const { reviews, addReview } = useData();
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  const doctorReviews = reviews.filter(r => r.doctorId === doctor.id);

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      const newReview: Review = {
          id: Date.now(),
          doctorId: doctor.id,
          userName: userName || 'Anonymous User',
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
      };
      addReview(newReview);
      setComment('');
      setRating(5);
      alert('Review submitted successfully!');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Header / Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 h-32 w-full rounded-t-xl relative"></div>

        <div className="px-8 pb-8">
          {/* Avatar & Key Info */}
          <div className="flex flex-col sm:flex-row items-start gap-6 -mt-12 mb-6">
            <div className={`w-28 h-28 ${doctor.avatarColor} rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold flex-shrink-0`}>
              {doctor.name.split(' ').map(n => n[0]).slice(1,3).join('')}
            </div>
            
            <div className="flex-grow mt-2 sm:mt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                  <p className="text-teal-700 font-semibold text-lg">{doctor.specialty}</p>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-1.5" />
                    <span className="font-bold text-gray-800">{doctor.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm ml-1">({doctorReviews.length} Reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
              <button 
                onClick={() => setActiveTab('info')}
                className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'info' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Overview
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'reviews' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Reviews & Ratings
              </button>
          </div>

          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <LocationMarkerIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-sm">{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <span className={`font-medium text-sm ${doctor.availability.includes('Available Today') ? 'text-green-600' : 'text-orange-600'}`}>{doctor.availability}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="font-medium text-sm">{doctor.experience || 'Experienced'}</span>
                    </div>
                </div>

                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">About Doctor</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {doctor.about || `Dr. ${doctor.name} is a dedicated ${doctor.specialty} committed to providing excellent medical care at ${doctor.location}.`}
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Education & Training</h3>
                        <ul className="space-y-2">
                            {doctor.education && doctor.education.length > 0 ? (
                                doctor.education.map((edu, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>
                                        <span className="text-sm">{edu}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 text-sm italic">Medical School & Residency verified.</li>
                            )}
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Languages Spoken</h3>
                        <div className="flex flex-wrap gap-2">
                            {doctor.languages && doctor.languages.length > 0 ? (
                                doctor.languages.map((lang, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {lang}
                                    </span>
                                ))
                            ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">English</span>
                            )}
                        </div>
                    </section>
                </div>
            </div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fadeIn">
                  {/* List Reviews */}
                  <div>
                      {doctorReviews.length > 0 ? (
                          <div className="space-y-4">
                              {doctorReviews.map(review => (
                                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center text-teal-800 font-bold text-xs">
                                                  {review.userName.charAt(0)}
                                              </div>
                                              <span className="font-semibold text-gray-900">{review.userName}</span>
                                          </div>
                                          <span className="text-xs text-gray-500">{review.date}</span>
                                      </div>
                                      <div className="flex items-center mb-2">
                                          {[1,2,3,4,5].map(star => (
                                              <StarIcon key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                          ))}
                                      </div>
                                      <p className="text-gray-700 text-sm">{review.comment}</p>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
                      )}
                  </div>

                  {/* Add Review Form - Only if canReview is true */}
                  {canReview ? (
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                          <h3 className="font-bold text-gray-800 mb-4">Write a Review</h3>
                          <form onSubmit={handleSubmitReview} className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                  <input 
                                    required
                                    value={userName} 
                                    onChange={e => setUserName(e.target.value)} 
                                    placeholder="Enter your name" 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                  <div className="flex items-center gap-1">
                                      {[1,2,3,4,5].map(star => (
                                          <button 
                                            type="button" 
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transform transition-transform hover:scale-110"
                                          >
                                              <StarIcon className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                          </button>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600 font-medium">{rating} Stars</span>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience</label>
                                  <textarea 
                                    required
                                    rows={3}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="How was your appointment?"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                  />
                              </div>
                              <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded-lg font-bold text-sm hover:bg-teal-800 shadow-md">
                                  Submit Review
                              </button>
                          </form>
                      </div>
                  ) : (
                      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 text-center border border-blue-100">
                          You can write a review after you have booked an appointment with this doctor.
                      </div>
                  )}
              </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
             >
                Close
             </button>
             <button 
                onClick={() => onBook(doctor)}
                className="px-8 py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 shadow-md transition-transform active:scale-95 font-semibold"
             >
                Book Appointment
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
