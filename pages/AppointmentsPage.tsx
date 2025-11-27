import React, { useState } from 'react';
import { Appointment, Page } from '../types';

interface AppointmentsPageProps {
  appointments: Appointment[];
  onCancel: (appointmentId: number) => void;
  setCurrentPage: (page: Page) => void;
}

const AppointmentCard: React.FC<{ appointment: Appointment; onCancel: (id: number) => void; }> = ({ appointment, onCancel }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-md">
    <div className="flex items-center space-x-4">
      <div className={`w-16 h-16 ${appointment.doctor.avatarColor} rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0`}>
        {appointment.doctor.name.split(' ').map(n => n[0]).slice(1,3).join('')}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-800">{appointment.doctor.name}</h3>
        <p className="text-sm text-gray-600">
          {appointment.doctor.specialty} &bull; {appointment.doctor.location}
        </p>
        <div className="mt-2 text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full inline-block">
          {appointment.time}
        </div>
      </div>
    </div>
    
    <button 
      onClick={() => onCancel(appointment.id)}
      className="w-full sm:w-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
    >
      Cancel Appointment
    </button>
  </div>
);

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel: closeModal }) => (
    <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={closeModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
    >
        <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 id="cancel-modal-title" className="text-xl font-bold text-gray-800 mb-4">Confirm Cancellation</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                    Keep Appointment
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                    Yes, Cancel
                </button>
            </div>
        </div>
    </div>
);


export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ appointments, onCancel, setCurrentPage }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const handleInitiateCancel = (id: number) => {
    setAppointmentToCancel(id);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    if (appointmentToCancel !== null) {
      onCancel(appointmentToCancel);
    }
    setShowConfirmModal(false);
    setAppointmentToCancel(null);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setAppointmentToCancel(null);
  };
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
            <p className="text-gray-600">Here are your upcoming scheduled appointments.</p>
          </div>
          
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <AppointmentCard key={app.id} appointment={app} onCancel={handleInitiateCancel} />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-700">No upcoming appointments</h3>
                <p className="text-gray-500 mt-2 mb-6">You can book a new appointment from the doctors' page.</p>
                <button 
                  onClick={() => setCurrentPage(Page.Doctors)}
                  className="px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-semibold"
                >
                  Find a Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <ConfirmationModal
          onConfirm={handleConfirmCancel}
          onCancel={handleCloseModal}
        />
      )}
    </>
  );
};