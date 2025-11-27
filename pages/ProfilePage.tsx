
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import { UserIcon, ClipboardIcon, PhoneIcon, SaveCheckIcon } from '../components/icons/ProfileIcons';

const TabButton: React.FC<{ 
    active: boolean; 
    onClick: () => void; 
    icon: React.ReactNode; 
    label: string 
}> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 flex-1 sm:flex-none justify-center sm:justify-start ${
            active 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; icon?: React.ReactNode }> = 
  ({ label, name, value, onChange, type = 'text', placeholder, icon }) => (
    <div className="relative">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <div className="relative rounded-lg shadow-sm">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`block w-full border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2.5 transition-all ${icon ? 'pl-10' : 'pl-3'}`}
            />
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = 
  ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg"
        >
            {children}
        </select>
    </div>
);

export const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        height: '',
        allergies: [''],
        currentMedications: [''],
        emergencyContact: { name: '', relationship: '', phone: '' },
    });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'emergency'>('personal');
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                if (!parsedProfile.allergies || parsedProfile.allergies.length === 0) parsedProfile.allergies = [''];
                if (!parsedProfile.currentMedications || parsedProfile.currentMedications.length === 0) parsedProfile.currentMedications = [''];
                setProfile(parsedProfile);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const handleSave = useCallback((updatedProfile: UserProfile) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaveStatus('saving');
        
        try {
            const profileToSave = {
                ...updatedProfile,
                allergies: updatedProfile.allergies.filter(item => item.trim() !== ''),
                currentMedications: updatedProfile.currentMedications.filter(item => item.trim() !== ''),
            };
            localStorage.setItem('userProfile', JSON.stringify(profileToSave));
            
            saveTimeoutRef.current = window.setTimeout(() => {
                setSaveStatus('saved');
                saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
            }, 800);
        } catch (error) {
            console.error("Failed to save profile", error);
            setSaveStatus('idle');
        }
    }, []);
    
    useEffect(() => {
      if (!isLoaded) return;
      handleSave(profile);
      return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); }
    }, [profile, handleSave, isLoaded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            emergencyContact: { ...prev.emergencyContact, [name]: value }
        }));
    };

    const handleMedicalListChange = (index: number, value: string, field: 'allergies' | 'currentMedications') => {
        const newList = [...profile[field]];
        newList[index] = value;
        setProfile(prev => ({ ...prev, [field]: newList }));
    };

    const addMedicalListItem = (field: 'allergies' | 'currentMedications') => {
        setProfile(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeMedicalListItem = (index: number, field: 'allergies' | 'currentMedications') => {
        if (profile[field].length <= 1) {
            // Don't remove the last one, just clear it
            const newList = [...profile[field]];
            newList[index] = '';
            setProfile(prev => ({ ...prev, [field]: newList }));
            return;
        }
        const newList = profile[field].filter((_, i) => i !== index);
        setProfile(prev => ({ ...prev, [field]: newList }));
    };

    const getInitials = () => {
        if (!profile.fullName) return 'U';
        return profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                         <div className={`flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${saveStatus === 'saving' ? 'text-teal-600' : saveStatus === 'saved' ? 'text-green-600' : 'opacity-0'}`}>
                            {saveStatus === 'saved' && <SaveCheckIcon className="w-5 h-5" />}
                            <span>{saveStatus === 'saving' ? 'Saving changes...' : 'Saved'}</span>
                         </div>
                    </div>

                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
                        {getInitials()}
                    </div>
                    
                    <div className="text-center md:text-left flex-grow">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Welcome, User'}</h1>
                        <p className="text-gray-500 mt-1">Complete your health profile to receive personalized AI recommendations and track your wellness accurately.</p>
                        
                        {/* Simple Completion Bar */}
                        <div className="mt-4 max-w-xs mx-auto md:mx-0">
                             <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                 <span>Profile Completion</span>
                                 <span>
                                     {Math.round(
                                        (Object.values(profile).filter(Boolean).length / 7) * 100
                                     )}%
                                 </span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${(Object.values(profile).filter(Boolean).length / 7) * 100}%` }}
                                 ></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Form Container */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        <TabButton 
                            active={activeTab === 'personal'} 
                            onClick={() => setActiveTab('personal')} 
                            icon={<UserIcon className="w-5 h-5" />}
                            label="Personal Details"
                        />
                        <TabButton 
                            active={activeTab === 'medical'} 
                            onClick={() => setActiveTab('medical')} 
                            icon={<ClipboardIcon className="w-5 h-5" />}
                            label="Medical History"
                        />
                        <TabButton 
                            active={activeTab === 'emergency'} 
                            onClick={() => setActiveTab('emergency')} 
                            icon={<PhoneIcon className="w-5 h-5" />}
                            label="Emergency Contact"
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8 min-h-[400px]">
                        <form onSubmit={(e) => e.preventDefault()}>
                            
                            {/* Personal Details Tab */}
                            {activeTab === 'personal' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField 
                                            label="Full Name" 
                                            name="fullName" 
                                            value={profile.fullName} 
                                            onChange={handleChange} 
                                            placeholder="e.g., John Doe"
                                            icon={<UserIcon className="w-5 h-5" />}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Date of Birth" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} type="date"/>
                                            <InputField label="Height (cm)" name="height" value={profile.height} onChange={handleChange} type="number" placeholder="175"/>
                                        </div>
                                        <SelectField label="Gender" name="gender" value={profile.gender} onChange={handleChange}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </SelectField>
                                        <SelectField label="Blood Type" name="bloodType" value={profile.bloodType} onChange={handleChange}>
                                            <option value="">Select Blood Type</option>
                                            <option value="A+">A+</option> <option value="A-">A-</option>
                                            <option value="B+">B+</option> <option value="B-">B-</option>
                                            <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                            <option value="O+">O+</option> <option value="O-">O-</option>
                                            <option value="Unknown">I don't know</option>
                                        </SelectField>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Your personal information is stored locally on your device for AI context and BMI calculations.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Medical History Tab */}
                            {activeTab === 'medical' && (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="bg-white">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Used for AI warnings</span>
                                        </div>
                                        <div className="space-y-3">
                                            {profile.allergies.map((item, index) => (
                                                <div key={`alg-${index}`} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => handleMedicalListChange(index, e.target.value, 'allergies')}
                                                        placeholder="e.g., Peanuts, Penicillin"
                                                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicalListItem(index, 'allergies')}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Remove item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addMedicalListItem('allergies')}
                                                className="mt-2 text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Add Allergy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Dosage & frequency</span>
                                        </div>
                                        <div className="space-y-3">
                                            {profile.currentMedications.map((item, index) => (
                                                <div key={`med-${index}`} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => handleMedicalListChange(index, e.target.value, 'currentMedications')}
                                                        placeholder="e.g., Metformin 500mg, 2x daily"
                                                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicalListItem(index, 'currentMedications')}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Remove item"
                                                    >
                                                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addMedicalListItem('currentMedications')}
                                                className="mt-2 text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Add Medication
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Emergency Contact Tab */}
                            {activeTab === 'emergency' && (
                                <div className="animate-fadeIn max-w-2xl">
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-5 mb-6 flex items-start gap-4">
                                        <div className="bg-red-100 p-2 rounded-full text-red-600">
                                             <PhoneIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-900 text-sm">In Case of Emergency (ICE)</h3>
                                            <p className="text-red-800 text-sm mt-1">This contact information is vital for first responders. Please ensure this is up to date.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <InputField 
                                            label="Contact Name" 
                                            name="name" 
                                            value={profile.emergencyContact.name} 
                                            onChange={handleEmergencyContactChange} 
                                            placeholder="e.g., Jane Doe"
                                            icon={<UserIcon className="w-5 h-5" />}
                                        />
                                        <InputField 
                                            label="Relationship" 
                                            name="relationship" 
                                            value={profile.emergencyContact.relationship} 
                                            onChange={handleEmergencyContactChange} 
                                            placeholder="e.g., Spouse, Parent"
                                        />
                                        <InputField 
                                            label="Phone Number" 
                                            name="phone" 
                                            value={profile.emergencyContact.phone} 
                                            onChange={handleEmergencyContactChange} 
                                            type="tel" 
                                            placeholder="e.g., (555) 123-4567"
                                            icon={<PhoneIcon className="w-5 h-5" />}
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
