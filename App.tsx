
// Fix: Create the main App component to handle page rendering and state management.
// FIX: Corrected the import statement for React and its hooks to resolve multiple compilation errors.
import React, { useState, useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AiFab } from './components/AiFab';
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { SocialForumPage } from './pages/ForumPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { HealthTrackerPage } from './pages/HealthTrackerPage';
import { MediGenPlusPage } from './pages/MediGenPlusPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotificationToast } from './components/NotificationToast';
import { Page, Appointment, Doctor } from './types';
import { auth } from './firebase/config';
// FIX: Use Firebase v9+ modular API for auth methods.
import { onAuthStateChanged, signOut } from 'firebase/auth';


function App() {
  // FIX: Use User type from Firebase v9+ modular SDK.
  const [user, setUser] = useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  
  // Notification State
  const [notifications, setNotifications] = useState<{id: number, message: string, subMessage?: string, type: 'reminder' | 'email'}[]>([]);

  useEffect(() => {
    // Attempt to recover demo user from local storage (Remember Me = true)
    // OR session storage (Remember Me = false)
    const storedDemoUser = localStorage.getItem('mediGenDemoUser') || sessionStorage.getItem('mediGenDemoUser');
    
    if (storedDemoUser) {
        try {
            setUser(JSON.parse(storedDemoUser));
        } catch (e) {
            console.error("Failed to parse stored user", e);
        }
    }

    // FIX: Use Firebase v9+ onAuthStateChanged method.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Real firebase user logged in
        setUser(currentUser);
        // Clear demo user if we have a real one
        localStorage.removeItem('mediGenDemoUser');
        sessionStorage.removeItem('mediGenDemoUser');
      } else {
        // No firebase user. Check if we are using a demo user.
        setUser((prevUser: any) => {
            if (prevUser?.isDemo) return prevUser;
            
            // Re-check storage in case we missed it or it was set during this render cycle
            const stored = localStorage.getItem('mediGenDemoUser') || sessionStorage.getItem('mediGenDemoUser');
            if (stored) return JSON.parse(stored);
            
            return null;
        });
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const storedAppointments = localStorage.getItem('userAppointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }
    } catch (error) {
      console.error("Failed to load appointments from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('userAppointments', JSON.stringify(appointments));
    } catch (error) {
      console.error("Failed to save appointments to localStorage", error);
    }
  }, [appointments]);

  // --- Reminder Logic ---
  useEffect(() => {
      if (user && appointments.length > 0) {
          // Find the next upcoming appointment (logic simplified to the first one in list for demo)
          const nextAppt = appointments[0]; 
          
          // Check if we already reminded for this appointment in this session to avoid spam
          const hasReminded = sessionStorage.getItem(`reminded_appt_${nextAppt.id}`);
          
          if (!hasReminded) {
              // Trigger reminder after a small delay to simulate background check
              const timer = setTimeout(() => {
                  // 1. Add In-App Notification
                  const reminderId = Date.now();
                  setNotifications(prev => [...prev, {
                      id: reminderId,
                      type: 'reminder',
                      message: `Upcoming: Dr. ${nextAppt.doctor.name}`,
                      subMessage: `Scheduled for ${nextAppt.time}. Don't be late!`
                  }]);

                  // 2. Add Email Simulation Notification (delayed slightly)
                  setTimeout(() => {
                      setNotifications(prev => [...prev, {
                          id: Date.now(),
                          type: 'email',
                          message: `Reminder sent to ${user.email}`,
                          subMessage: 'Check your inbox for details.'
                      }]);
                  }, 1500);

                  // Mark as reminded
                  sessionStorage.setItem(`reminded_appt_${nextAppt.id}`, 'true');
              }, 3000);

              return () => clearTimeout(timer);
          }
      }
  }, [user, appointments]);

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const handleLogout = () => {
    // FIX: Use Firebase v9+ signOut method.
    signOut(auth).finally(() => {
      // Clear both state and storage (local and session)
      setUser(null);
      localStorage.removeItem('mediGenDemoUser');
      sessionStorage.removeItem('mediGenDemoUser');
      setCurrentPage(Page.Home);
    });
  };

  const handleBookAppointment = (doctor: Doctor, time: string) => {
    const newAppointment: Appointment = {
      id: Date.now(),
      doctor,
      time,
    };
    setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleCancelAppointment = (appointmentId: number) => {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
  };
  
  const handleLogin = (loggedInUser: any, rememberMe: boolean) => {
    setUser(loggedInUser);
    if (loggedInUser?.isDemo) {
        if (rememberMe) {
            localStorage.setItem('mediGenDemoUser', JSON.stringify(loggedInUser));
            sessionStorage.removeItem('mediGenDemoUser'); // Ensure session storage is clear
        } else {
            sessionStorage.setItem('mediGenDemoUser', JSON.stringify(loggedInUser));
            localStorage.removeItem('mediGenDemoUser'); // Ensure local storage is clear
        }
    }
    
    // Redirect Admin immediately
    if (loggedInUser.isAdmin) {
        setCurrentPage(Page.AdminDashboard);
    } else {
        setCurrentPage(Page.Home);
    }
  };

  const renderPage = () => {
    if (isAuthLoading) {
      return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
    }

    switch (currentPage) {
      case Page.Home:
        return <HomePage setCurrentPage={setCurrentPage} />;
      case Page.Doctors:
        return <DoctorsPage 
          onBookAppointment={handleBookAppointment} 
          isLoggedIn={!!user} 
          setCurrentPage={setCurrentPage} 
          appointments={appointments}
        />;
      case Page.Appointments:
        if (user) {
          return <AppointmentsPage appointments={appointments} onCancel={handleCancelAppointment} setCurrentPage={setCurrentPage} />;
        }
        setCurrentPage(Page.Login);
        return <LoginPage onLogin={handleLogin} />;
      case Page.Articles:
        return <ArticlesPage />;
      case Page.SocialForum:
        if (user) {
          return <SocialForumPage user={user} />;
        }
        setCurrentPage(Page.Login);
        return <LoginPage onLogin={handleLogin} />;
      case Page.AiAssistant:
        return <AiAssistantPage />;
      case Page.Login:
        if(user) {
           // If already logged in
           if (user.isAdmin) return <AdminDashboardPage />;
           return <HomePage setCurrentPage={setCurrentPage} />;
        }
        return <LoginPage onLogin={handleLogin} />;
      case Page.Profile:
        if (user) {
          return <ProfilePage />;
        }
        setCurrentPage(Page.Login);
        return <LoginPage onLogin={handleLogin} />;
      case Page.Wellness:
        if (user) {
            return <HealthTrackerPage />;
        }
        setCurrentPage(Page.Login);
        return <LoginPage onLogin={handleLogin} />;
      case Page.MediGenPlus:
        return <MediGenPlusPage />;
      case Page.AdminDashboard:
        if (user?.isAdmin) {
            return <AdminDashboardPage />;
        }
        return <LoginPage onLogin={handleLogin} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <DataProvider>
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans relative">
        <Header 
            setCurrentPage={setCurrentPage}
            isLoggedIn={!!user}
            handleLogout={handleLogout}
            isAdmin={user?.isAdmin}
        />
        
        {/* Notification Stack */}
        {notifications.map(n => (
            <NotificationToast 
                key={n.id}
                message={n.message}
                subMessage={n.subMessage}
                type={n.type}
                onClose={() => removeNotification(n.id)}
            />
        ))}

        <main className="flex-grow">
            {renderPage()}
        </main>
        {currentPage !== Page.AiAssistant && <AiFab setCurrentPage={setCurrentPage} />}
        <Footer />
        </div>
    </DataProvider>
  );
}

export default App;
