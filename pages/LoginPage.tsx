
import React, { useState } from 'react';
// FIX: Use Firebase v9+ modular API for auth methods.
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile } from '../types';
import { UserIcon, PhoneIcon } from '../components/icons/ProfileIcons';
import { DropIcon } from '../components/icons/HealthIcons';
import { LockClosedIcon } from '../components/icons/EcommerceIcons';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.8 0 133.4 105.1 23.3 244 23.3c60.3 0 112.5 22.8 152.1 60.1l-63.8 61.9c-23.3-22-54.1-33.8-92.4-33.8-72.3 0-131.3 58.8-131.3 131.3s59 131.3 131.3 131.3c76.3 0 119.5-51.5 124.5-80.6H244V261.8h244z"></path>
    </svg>
);

interface LoginPageProps {
  onLogin: (user: any, rememberMe: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('Unknown');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Admin Bypass Check
  const checkAdminBypass = () => {
      if (email === 'admin@gmail.com' && password === '778899') {
          const adminUser = {
              uid: 'admin-user-001',
              displayName: 'Administrator',
              email: 'admin@gmail.com',
              photoURL: null,
              isDemo: true,
              isAdmin: true
          };
          onLogin(adminUser, rememberMe);
          return true;
      }
      return false;
  };

  const createDemoUser = () => ({
    uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
    displayName: 'Guest User',
    email: 'guest@example.com',
    photoURL: null,
    isDemo: true
  });

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user, rememberMe);
    } catch (error: any) {
        console.error("Google Sign-In Error:", error.message);
        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/operation-not-allowed') {
          const demoUser = createDemoUser();
          onLogin(demoUser, rememberMe);
        } else {
          setErrorMsg(error.message || "An error occurred during sign in.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      // 1. Check for Admin Bypass first (works in login mode)
      if (!isSignUp && checkAdminBypass()) return;

      // 2. Validation
      if (isSignUp) {
          if (password !== confirmPassword) {
              setErrorMsg("Passwords do not match.");
              return;
          }
          if (password.length < 6) {
              setErrorMsg("Password must be at least 6 characters.");
              return;
          }
          if (!fullName || !phone) {
              setErrorMsg("Please fill in all required fields.");
              return;
          }
      }

      setIsLoading(true);

      try {
          await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

          if (isSignUp) {
              // --- SIGN UP FLOW ---
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;

              // Update standard profile
              await updateProfile(user, {
                  displayName: fullName
              });

              // Save extended profile data to localStorage (simulating a database record)
              const initialProfile: UserProfile = {
                  fullName: fullName,
                  dateOfBirth: '',
                  gender: '',
                  bloodType: bloodType,
                  height: '',
                  allergies: [],
                  currentMedications: [],
                  emergencyContact: {
                      name: '',
                      relationship: '',
                      phone: phone // Storing user phone here for simplicity or emergency
                  }
              };
              localStorage.setItem('userProfile', JSON.stringify(initialProfile));
              
              onLogin(user, rememberMe);

          } else {
              // --- LOGIN FLOW ---
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              onLogin(userCredential.user, rememberMe);
          }

      } catch (error: any) {
          console.error("Auth Error:", error);
          if (error.code === 'auth/email-already-in-use') {
              setErrorMsg("That email is already in use.");
          } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
              setErrorMsg("Invalid email or password.");
          } else {
              setErrorMsg(error.message || "Authentication failed.");
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleDemoLogin = () => {
    onLogin(createDemoUser(), rememberMe);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-700">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 text-sm">
                {isSignUp ? 'Join MediGen for better health management' : 'Sign in to access your health dashboard'}
            </p>
          </div>
          
          <div className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
            >
              {isLoading ? (
                  <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                  <GoogleIcon />
              )}
              {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-3 text-xs font-medium text-gray-400 uppercase bg-white">Or with Email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <form onSubmit={handleAuthAction} className="space-y-4">
               {isSignUp && (
                   <>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="Full Name"
                                required={isSignUp}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Phone"
                                    required={isSignUp}
                                />
                            </div>
                            <div className="relative">
                                <DropIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <select 
                                    value={bloodType}
                                    onChange={(e) => setBloodType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors appearance-none"
                                    required={isSignUp}
                                >
                                    <option value="Unknown">Blood Type</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>
                   </>
               )}

               <div className="relative">
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Email Address"
                        required
                    />
                </div>
              
                <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Password (min 6 chars)"
                        required
                    />
                </div>

                {isSignUp && (
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Confirm Password"
                            required={isSignUp}
                        />
                    </div>
                )}

                {!isSignUp && (
                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                            <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button type="button" className="text-sm font-semibold text-teal-600 hover:text-teal-800">Forgot Password?</button>
                    </div>
                )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            
            <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                        className="ml-2 font-bold text-teal-700 hover:underline"
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>

            <div className="text-center border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs text-gray-500 hover:text-teal-600 transition-colors"
              >
                Continue as Guest (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
