
// Fix: Define the types used across the application.
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  availability: string;
  avatarColor: string;
  about?: string;
  experience?: string;
  education?: string[];
  languages?: string[];
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  time: string;
}

export interface ForumTopic {
  id: number;
  title: string;
  author: string;
  time: string;
  category: string;
  replies: number;
  lastActivity: string;
}

export interface SocialComment {
  id: number;
  author: string;
  authorAvatarUrl?: string; // Base64 string of the user's avatar
  text: string;
  time: string;
}

export interface SocialPost {
  id: number;
  author: string;
  authorAvatarColor: string;
  authorAvatarUrl?: string; // Base64 string of the user's avatar
  time: string;
  category: string;
  content: string;
  likes: number;
  isLiked: boolean;
  comments: SocialComment[];
}

export interface BloodRequest {
  id: number;
  requesterName: string;
  patientName: string;
  bloodType: string;
  hospital: string;
  location: string;
  urgency: 'Critical' | 'Moderate' | 'Standard';
  contactNumber: string;
  postedTime: string;
  status: 'Open' | 'Fulfilled';
  description?: string;
}

export interface Donor {
    id: number;
    name: string;
    bloodType: string;
    location: string;
    phone: string;
    lastDonation?: string;
    status: 'Active' | 'Unavailable';
}

export interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar?: string;
  publishedDate: string;
  readTime: string;
}

export interface Hospital {
  id: number;
  name: string;
  type: string;
  distance: string;
}

export enum Page {
  Home = 'Home',
  Doctors = 'Doctors',
  Appointments = 'Appointments',
  Articles = 'Articles',
  SocialForum = 'Social Forum',
  AiAssistant = 'AI Assistant',
  Login = 'Login',
  Profile = 'Profile',
  Wellness = 'Wellness',
  MediGenPlus = 'MediGen+',
  AdminDashboard = 'Admin Dashboard',
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  height: string; // Height in cm
  profilePicture?: string; // Base64 string
  allergies: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type MetricType = 'Blood Pressure' | 'Heart Rate' | 'Glucose' | 'Weight' | 'Temperature' | 'Exercise Activity';

export interface HealthMetric {
  id: number;
  type: MetricType;
  value: string;
  unit: string;
  date: string;
  time: string;
  notes?: string;
}

export interface Product {
  id: number;
  name: string;
  category: 'Pharmacy' | 'Beauty' | 'Equipment' | 'Supplements';
  price: number;
  image: string;
  description: string;
  rating: number;
  inStock: boolean;
}

export interface Book {
    id: number;
    title: string;
    author: string;
    category: 'Textbook' | 'Reference' | 'General Medical' | 'Research';
    price: number;
    image: string;
    rating: number;
    description: string;
}

export interface Course {
    id: number;
    title: string;
    instructor: string;
    category: 'Weight Loss' | 'Yoga' | 'Bodybuilding' | 'Mental Health' | 'Sports';
    price: number;
    duration: string;
    lessons: number;
    image: string;
    rating: number;
}

export interface EnrolledCourse extends Course {
    progress: number; // Percentage 0-100
    completedLessonsCount: number;
    lastAccessed: string;
    status: 'In Progress' | 'Completed' | 'Not Started';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InsurancePlan {
  id: number;
  name: string;
  provider: string;
  type: 'Health' | 'Critical Illness' | 'Senior Care' | 'Dental & Vision';
  monthlyPremium: number;
  coverageLimit: string;
  features: string[];
  popular: boolean;
}

export interface PrescriptionRequest {
    id: number;
    userId: string;
    userName: string;
    image: string; // Base64
    status: 'Pending' | 'Processed' | 'Rejected';
    date: string;
    notes?: string;
}

export interface WellnessPlan {
    id: string;
    title: string;
    description: string;
    iconName: 'drop' | 'heart' | 'kidney' | 'senior' | 'brain' | 'default'; // Changed from ReactNode for serialization
    color: string;
    borderColor: string;
    lifestyle: string;
    dietYes: string[];
    dietNo: string[];
}

export interface Review {
    id: number;
    doctorId: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}
