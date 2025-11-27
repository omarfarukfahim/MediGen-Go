// Fix: Create the BookingModal component for appointment booking.
import React, { useState } from 'react';
import { Doctor } from '../types';

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor, time: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onBookAppointment }) => {
  const timeSlots = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'];
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleConfirmBooking = () => {
    if (selectedTime) {
      onBookAppointment(doctor, selectedTime);
      alert(`Appointment with ${doctor.name} booked for ${selectedTime}!`);
      onClose();
    } else {
      alert('Please select a time slot.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h2>
        <p className="text-gray-600 mb-4">You are booking an appointment with:</p>

        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className={`w-16 h-16 ${doctor.avatarColor} rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0`}>
            {doctor.name.split(' ').map(n => n[0]).slice(1,3).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mb-3">Select a Time Slot</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {timeSlots.map(time => (
            <button 
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${selectedTime === time ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
            >
              {time}
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={!selectedTime}
            className="px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};