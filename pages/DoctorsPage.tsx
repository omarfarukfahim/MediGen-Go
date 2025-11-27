
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext'; // Import hook
import { Doctor, Page, Appointment } from '../types';
import { StarIcon } from '../components/icons/StarIcon';
import { BookingModal } from '../components/BookingModal';
import { DoctorProfileModal } from '../components/DoctorProfileModal';
import { LocationMarkerIcon } from '../components/icons/LocationMarkerIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, onViewProfile }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-l-4 border-teal-500 transition-all hover:shadow-md hover:translate-x-1 duration-200">
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      {/* Doctor Info - Clickable area */}
      <div 
        className="flex items-start space-x-4 cursor-pointer flex-grow group" 
        onClick={() => onViewProfile(doctor)}
        title="View Profile"
      >
        <div className={`w-16 h-16 ${doctor.avatarColor} rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 transition-transform group-hover:scale-105 ring-2 ring-transparent group-hover:ring-teal-100`}>
          {doctor.name.split(' ').map(n => n[0]).slice(1,3).join('')}
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-teal-700 transition-colors">{doctor.name}</h3>
          <p className="font-medium text-teal-600">{doctor.specialty}</p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <LocationMarkerIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{doctor.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="font-semibold">{doctor.rating.toFixed(1)} Rating</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Availability & Booking */}
      <div className="flex flex-col items-start sm:items-end justify-between gap-3 flex-shrink-0 sm:min-w-[180px] pt-2 sm:pt-0 border-t sm:border-none border-gray-100">
        <div className={`flex items-center gap-2 text-sm font-semibold mt-3 sm:mt-0 ${doctor.availability.includes('Available Today') ? 'text-green-600' : 'text-orange-600'}`}>
          <ClockIcon className="w-4 h-4" />
          <span>{doctor.availability}</span>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
                onClick={() => onViewProfile(doctor)}
                className="w-full sm:w-auto px-5 py-2 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-sm font-semibold"
            >
                View Profile
            </button>
            <button 
            onClick={() => onBook(doctor)}
            className="w-full sm:w-auto px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-semibold shadow-sm"
            >
            Book Appointment
            </button>
        </div>
      </div>
    </div>
  </div>
);

interface DoctorsPageProps {
  onBookAppointment: (doctor: Doctor, time: string) => void;
  isLoggedIn: boolean;
  setCurrentPage: (page: Page) => void;
  appointments?: Appointment[];
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onBookAppointment, isLoggedIn, setCurrentPage, appointments = [] }) => {
  const { doctors, hospitals } = useData(); // Consume data from context
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  const specialties = useMemo(() => ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))], [doctors]);
  
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesQuery = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
      return matchesQuery && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty, doctors]);

  const handleOpenBookingModal = (doctor: Doctor) => {
    if (viewingDoctor) setViewingDoctor(null);
    
    if (!isLoggedIn) {
      alert("Please log in or sign up to book an appointment.");
      setCurrentPage(Page.Login);
      return;
    }
    setBookingDoctor(doctor);
  };

  const handleCloseBookingModal = () => {
    setBookingDoctor(null);
  };
  
  const handleViewProfile = (doctor: Doctor) => {
      setViewingDoctor(doctor);
  }

  const handleCloseProfile = () => {
      setViewingDoctor(null);
  }

  // Check if logged in user has booked this doctor
  const hasBookedViewingDoctor = viewingDoctor ? appointments.some(app => app.doctor.id === viewingDoctor.id) : false;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
              <p className="text-gray-600">Search our directory of trusted medical professionals.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by name, specialty, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full sm:w-56 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
              </select>
            </div>
            
            <div className="space-y-4">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                    <DoctorCard 
                        key={doctor.id} 
                        doctor={doctor} 
                        onBook={handleOpenBookingModal} 
                        onViewProfile={handleViewProfile}
                    />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-700">No doctors found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
                </div>
              )}
            </div>
          </div>
          
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Nearby Hospitals</h3>
              <ul className="space-y-3">
                {hospitals.map((h) => (
                  <li key={h.id}>
                    <h4 className="font-medium text-gray-800">{h.name}</h4>
                    <p className="text-sm text-gray-600">{h.type} &bull; {h.distance}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Top Rated Doctors</h3>
              <ul className="space-y-3">
                {/* Dynamically filter top rated from live data */}
                {doctors.filter(d => d.rating >= 4.7).slice(0,3).map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{d.name}</span>
                    <div className="flex items-center font-bold text-gray-600">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1"/>
                      {d.rating.toFixed(1)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      
      {bookingDoctor && (
        <BookingModal 
          doctor={bookingDoctor} 
          onClose={handleCloseBookingModal}
          onBookAppointment={onBookAppointment} 
        />
      )}

      {viewingDoctor && (
          <DoctorProfileModal
            doctor={viewingDoctor}
            onClose={handleCloseProfile}
            onBook={handleOpenBookingModal}
            canReview={isLoggedIn && hasBookedViewingDoctor}
          />
      )}
    </>
  );
};
