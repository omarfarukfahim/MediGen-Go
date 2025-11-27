
import { Doctor, ForumTopic, Article, Hospital, Product, InsurancePlan, Book, Course, WellnessPlan, Review } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Amina Rahman',
    specialty: 'Cardiologist',
    location: 'City Hospital',
    rating: 4.7,
    availability: 'Available Today',
    avatarColor: 'bg-blue-100 text-blue-800',
    about: 'Dr. Amina Rahman is a highly experienced Cardiologist with over 15 years of practice. She specializes in preventive cardiology, heart failure management, and interventional procedures. Dr. Rahman is dedicated to providing patient-centered care and utilizing the latest medical technologies to improve heart health.',
    experience: '15+ Years',
    education: ['MD - Cardiology, Johns Hopkins University', 'Residency at Massachusetts General Hospital', 'Fellowship at Cleveland Clinic'],
    languages: ['English', 'Bengali', 'Spanish']
  },
  {
    id: 2,
    name: 'Dr. Laila Chowdhury',
    specialty: 'Dermatologist',
    location: 'SkinCare Clinic',
    rating: 4.9,
    availability: 'Next: Mon 10 AM',
    avatarColor: 'bg-pink-100 text-pink-800',
    about: 'Dr. Laila Chowdhury is a board-certified Dermatologist known for her expertise in both medical and cosmetic dermatology. She treats a wide range of skin conditions including acne, eczema, and psoriasis, and offers advanced aesthetic treatments.',
    experience: '10 Years',
    education: ['MBBS - Dhaka Medical College', 'Diploma in Dermatology (UK)', 'Board Certified Dermatologist'],
    languages: ['English', 'Bengali']
  },
  {
    id: 3,
    name: 'Dr. Ken Thompson',
    specialty: 'Pediatrician',
    location: 'Child Health Center',
    rating: 4.8,
    availability: 'Available Today',
    avatarColor: 'bg-green-100 text-green-800',
    about: 'Dr. Ken Thompson loves working with children and helping families navigate their health journey. With a friendly and approachable demeanor, he specializes in general pediatrics, childhood development, and immunizations.',
    experience: '12 Years',
    education: ['MD - Pediatrics, University of Toronto', 'Pediatric Residency at SickKids Hospital'],
    languages: ['English', 'French']
  },
  {
    id: 4,
    name: 'Dr. Sarah Chen',
    specialty: 'Orthopedist',
    location: 'Metro Orthopedics',
    rating: 4.6,
    availability: 'Next: Tue 2 PM',
    avatarColor: 'bg-purple-100 text-purple-800',
    about: 'Dr. Sarah Chen is a leading Orthopedic Surgeon specializing in sports medicine and joint replacement. She works with athletes of all levels to recover from injuries and regain peak performance.',
    experience: '8 Years',
    education: ['MD - Stanford University School of Medicine', 'Orthopedic Surgery Residency at UCSF'],
    languages: ['English', 'Mandarin']
  },
];

export const FORUM_TOPICS: ForumTopic[] = [
  {
    id: 1,
    title: 'Managing anxiety and stress in a busy work life',
    author: 'Sarah J.',
    time: '2 hours ago',
    category: 'Mental Health',
    replies: 15,
    lastActivity: 'by Mark P. • 5 minutes ago'
  },
  {
    id: 2,
    title: 'Tips for starting a healthy, sustainable diet?',
    author: 'Alex C.',
    time: '1 day ago',
    category: 'Nutrition',
    replies: 8,
    lastActivity: 'by Emily R. • 45 minutes ago'
  },
  {
    id: 3,
    title: 'Good exercises for relieving chronic back pain',
    author: 'John D.',
    time: '3 days ago',
    category: 'Fitness',
    replies: 22,
    lastActivity: 'by Dr. Lisa (Verified) • 1 hour ago'
  }
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'The Future of Medicine: AI and Personalized Health',
    category: 'Innovation',
    excerpt: 'Artificial Intelligence is revolutionizing healthcare, from early diagnosis to personalized treatment plans tailored to your genetic makeup.',
    image: 'https://picsum.photos/seed/aihealth/800/400',
    author: 'Dr. James Wilson',
    publishedDate: 'Oct 24, 2023',
    readTime: '6 min read'
  },
  {
    id: 2,
    title: 'The Importance of a Balanced Diet for a Healthy Life',
    category: 'Nutrition',
    excerpt: 'Discover how a balanced diet with the right nutrients can boost your immune system, improve your energy levels, and help prevent chronic diseases.',
    image: 'https://picsum.photos/seed/nutrition/400/300',
    author: 'Sarah Jenkins, RD',
    publishedDate: 'Oct 22, 2023',
    readTime: '5 min read'
  },
  {
    id: 3,
    title: '5 Simple Mindfulness Exercises for a Calmer Day',
    category: 'Mental Health',
    excerpt: 'In our busy lives, taking a moment to pause is crucial. Learn five simple mindfulness exercises you can do anywhere to reduce stress and increase focus.',
    image: 'https://picsum.photos/seed/mentalhealth/400/300',
    author: 'Dr. Emily Chen',
    publishedDate: 'Oct 20, 2023',
    readTime: '4 min read'
  },
  {
    id: 4,
    title: 'How to Start a Fitness Routine You\'ll Actually Stick With',
    category: 'Fitness',
    excerpt: 'Starting a new fitness routine can be challenging. We provide practical tips on setting realistic goals and finding activities you enjoy to build a lasting habit.',
    image: 'https://picsum.photos/seed/fitness/400/300',
    author: 'Mark Peterson',
    publishedDate: 'Oct 18, 2023',
    readTime: '7 min read'
  },
  {
    id: 5,
    title: 'Understanding Sleep Cycles: Why You Feel Tired',
    category: 'Wellness',
    excerpt: 'Sleep isn’t just about the number of hours. It’s about cycles. Learn how REM and deep sleep affect your mood and productivity.',
    image: 'https://picsum.photos/seed/sleep/400/300',
    author: 'Dr. Lisa Ray',
    publishedDate: 'Oct 15, 2023',
    readTime: '5 min read'
  },
  {
    id: 6,
    title: 'Hydration Hacks: More Than Just Water',
    category: 'Nutrition',
    excerpt: 'Electrolytes, fruits, and timing. How to stay truly hydrated for peak athletic and mental performance.',
    image: 'https://picsum.photos/seed/water/400/300',
    author: 'Alex Carter',
    publishedDate: 'Oct 12, 2023',
    readTime: '3 min read'
  }
];

export const NEARBY_HOSPITALS: Hospital[] = [
  { id: 1, name: 'City General Hospital', type: 'General', distance: '1.2 km' },
  { id: 2, name: 'St. Mary\'s Medical Center', type: 'Specialty', distance: '3.5 km' },
  { id: 3, name: 'Community Clinic', type: 'Clinic', distance: '0.8 km' },
];

export const TOP_RATED_DOCTORS: Pick<Doctor, 'id' | 'name' | 'rating'>[] = [
  { id: 2, name: 'Dr. Laila Chowdhury', rating: 4.9 },
  { id: 3, name: 'Dr. Ken Thompson', rating: 4.8 },
  { id: 1, name: 'Dr. Amina Rahman', rating: 4.7 },
];

export const PRODUCTS: Product[] = [
  // Equipment
  {
    id: 101,
    name: 'GlucoCheck Digital Diabetes Monitor',
    category: 'Equipment',
    price: 49.99,
    image: 'https://picsum.photos/seed/gluco/300/300',
    description: 'Advanced blood glucose monitoring system with 50 test strips included.',
    rating: 4.8,
    inStock: true
  },
  {
    id: 102,
    name: 'CardioSense BP Monitor',
    category: 'Equipment',
    price: 35.50,
    image: 'https://picsum.photos/seed/bpmonitor/300/300',
    description: 'Digital upper arm blood pressure monitor with arrhythmia detection.',
    rating: 4.7,
    inStock: true
  },
  {
    id: 103,
    name: 'ThermoPro Digital Thermometer',
    category: 'Equipment',
    price: 19.99,
    image: 'https://picsum.photos/seed/thermo/300/300',
    description: 'Instant read infrared fever thermometer for adults and children.',
    rating: 4.6,
    inStock: true
  },
  {
    id: 104,
    name: 'Portable Digital Dialysis Unit',
    category: 'Equipment',
    price: 4999.00,
    image: 'https://picsum.photos/seed/dialysis/300/300',
    description: 'Compact home hemodialysis system. Prescription required.',
    rating: 5.0,
    inStock: false
  },
  // Pharmacy
  {
    id: 201,
    name: 'MediPain Relief Extra Strength',
    category: 'Pharmacy',
    price: 12.99,
    image: 'https://picsum.photos/seed/pills/300/300',
    description: 'Fast acting pain relief for headaches and muscle aches. 100 count.',
    rating: 4.5,
    inStock: true
  },
  {
    id: 202,
    name: 'Daily Multi-Vitamin Complex',
    category: 'Supplements',
    price: 24.50,
    image: 'https://picsum.photos/seed/vitamins/300/300',
    description: 'Essential vitamins and minerals for overall health and immunity.',
    rating: 4.8,
    inStock: true
  },
  {
    id: 203,
    name: 'AllergyDefend Antihistamine',
    category: 'Pharmacy',
    price: 18.25,
    image: 'https://picsum.photos/seed/allergy/300/300',
    description: '24-hour relief from sneezing, runny nose, and itchy eyes.',
    rating: 4.6,
    inStock: true
  },
  // Beauty
  {
    id: 301,
    name: 'DermaGlow Hydrating Serum',
    category: 'Beauty',
    price: 45.00,
    image: 'https://picsum.photos/seed/serum/300/300',
    description: 'Hyaluronic acid serum for intense hydration and glowing skin.',
    rating: 4.9,
    inStock: true
  },
  {
    id: 302,
    name: 'SunShield SPF 50+',
    category: 'Beauty',
    price: 22.00,
    image: 'https://picsum.photos/seed/sunscreen/300/300',
    description: 'Broad spectrum protection. Non-greasy and water resistant.',
    rating: 4.7,
    inStock: true
  },
  {
    id: 303,
    name: 'Revive Night Cream',
    category: 'Beauty',
    price: 38.50,
    image: 'https://picsum.photos/seed/cream/300/300',
    description: 'Restorative anti-aging cream with retinol and vitamin E.',
    rating: 4.8,
    inStock: true
  }
];

export const INSURANCE_PLANS: InsurancePlan[] = [
    {
        id: 1,
        name: 'MediShield Basic',
        provider: 'MediGen Assurance',
        type: 'Health',
        monthlyPremium: 29.99,
        coverageLimit: '$50,000',
        features: ['Doctor Consultation Coverage', 'Emergency Room Visits', 'Prescription Discounts'],
        popular: false
    },
    {
        id: 2,
        name: 'Total Care Premier',
        provider: 'MediGen Assurance',
        type: 'Health',
        monthlyPremium: 79.99,
        coverageLimit: '$500,000',
        features: ['Full Hospitalization', 'Surgery & OT Charges', 'International Coverage', 'Maternity Benefits'],
        popular: true
    },
    {
        id: 3,
        name: 'Critical Illness Protection',
        provider: 'LifeGuard',
        type: 'Critical Illness',
        monthlyPremium: 19.50,
        coverageLimit: '$100,000 Lump Sum',
        features: ['Covers Cancer, Heart Attack, Stroke', 'Immediate Payout upon Diagnosis', 'No Hospitalization Required'],
        popular: false
    },
    {
        id: 4,
        name: 'Golden Years Senior Plan',
        provider: 'MediGen Assurance',
        type: 'Senior Care',
        monthlyPremium: 55.00,
        coverageLimit: '$200,000',
        features: ['Pre-existing Conditions Covered', 'Home Nursing Care', 'Annual Health Checkup included'],
        popular: false
    },
    {
        id: 5,
        name: 'Smile & Sight Plus',
        provider: 'BrightView',
        type: 'Dental & Vision',
        monthlyPremium: 15.00,
        coverageLimit: '$2,000 / Year',
        features: ['2 Cleanings Per Year', 'Cavity Fillings', 'Glasses & Contact Lens Allowance'],
        popular: false
    }
];

export const MEDICAL_BOOKS: Book[] = [
    {
        id: 401,
        title: 'Gray\'s Anatomy: The Anatomical Basis of Clinical Practice',
        author: 'Susan Standring',
        category: 'Textbook',
        price: 189.99,
        image: 'https://picsum.photos/seed/anatomy/300/400',
        rating: 4.9,
        description: 'The definitive reference on anatomy, essential for medical students and professionals.'
    },
    {
        id: 402,
        title: 'Harrison\'s Principles of Internal Medicine',
        author: 'J. Larry Jameson',
        category: 'Reference',
        price: 210.50,
        image: 'https://picsum.photos/seed/medicinebook/300/400',
        rating: 5.0,
        description: 'The most trusted clinical medicine text, providing comprehensive coverage of disease mechanisms.'
    },
    {
        id: 403,
        title: 'Basic and Clinical Pharmacology',
        author: 'Bertram G. Katzung',
        category: 'Textbook',
        price: 75.00,
        image: 'https://picsum.photos/seed/pharma/300/400',
        rating: 4.7,
        description: 'A comprehensive guide to the concepts of pharmacology and their application to medical practice.'
    },
    {
        id: 404,
        title: 'The Checklist Manifesto: How to Get Things Right',
        author: 'Atul Gawande',
        category: 'General Medical',
        price: 18.00,
        image: 'https://picsum.photos/seed/checklist/300/400',
        rating: 4.8,
        description: 'A compelling argument for the use of checklists to improve medical safety and efficiency.'
    },
];

export const HEALTH_COURSES: Course[] = [
    {
        id: 501,
        title: 'Yoga for Stress Relief & Flexibility',
        instructor: 'Maya Sharma',
        category: 'Yoga',
        price: 49.99,
        duration: '12 Hours',
        lessons: 24,
        image: 'https://picsum.photos/seed/yoga/400/250',
        rating: 4.9
    },
    {
        id: 502,
        title: 'Science-Based Weight Loss Masterclass',
        instructor: 'Dr. Eric Westman',
        category: 'Weight Loss',
        price: 89.00,
        duration: '8 Hours',
        lessons: 15,
        image: 'https://picsum.photos/seed/weightloss/400/250',
        rating: 4.7
    },
    {
        id: 503,
        title: 'Mental Resilience & Mindfulness',
        instructor: 'Sarah Johnson, PhD',
        category: 'Mental Health',
        price: 59.99,
        duration: '6 Hours',
        lessons: 18,
        image: 'https://picsum.photos/seed/mind/400/250',
        rating: 4.8
    },
    {
        id: 504,
        title: 'Complete Bodybuilding: Hypertrophy Guide',
        instructor: 'James "Iron" Miller',
        category: 'Bodybuilding',
        price: 75.00,
        duration: '20 Hours',
        lessons: 40,
        image: 'https://picsum.photos/seed/gym/400/250',
        rating: 4.9
    }
];

export const WELLNESS_PLANS: WellnessPlan[] = [
    {
        id: 'diabetes',
        title: 'Diabetes Care',
        description: 'Advanced blood sugar management and low-glycemic guidance.',
        iconName: 'drop',
        color: 'bg-blue-50 text-blue-800',
        borderColor: 'border-blue-200',
        lifestyle: 'Focus on regular meal timing, daily foot checks, and moderate exercise (150 mins/week). Monitoring glucose before/after meals is key.',
        dietYes: ['Leafy greens', 'Fatty fish', 'Beans & lentils', 'Whole grains (Quinoa, Oats)', 'Berries'],
        dietNo: ['Sugary drinks', 'White bread/pasta', 'Trans fats', 'Processed snacks', 'Dried fruits with added sugar']
    },
    {
        id: 'heart',
        title: 'Heart Health',
        description: 'Cardiovascular support focusing on cholesterol and blood pressure.',
        iconName: 'heart',
        color: 'bg-rose-50 text-rose-800',
        borderColor: 'border-rose-200',
        lifestyle: 'Engage in aerobic activities like walking or swimming. Manage stress through meditation. Avoid smoking and limit alcohol.',
        dietYes: ['Oats & Barley', 'Salmon/Tuna', 'Avocado', 'Nuts (Walnuts/Almonds)', 'Olive Oil'],
        dietNo: ['Processed meats (Bacon, Sausage)', 'Deep-fried foods', 'Excess salt/sodium', 'Full-fat dairy', 'Sugary baked goods']
    },
    {
        id: 'kidney',
        title: 'Kidney Care',
        description: 'Specialized renal diet tracking potassium, phosphorus, and sodium.',
        iconName: 'kidney',
        color: 'bg-amber-50 text-amber-800',
        borderColor: 'border-amber-200',
        lifestyle: 'Stay hydrated (as per doctor limits), maintain healthy blood pressure, and avoid NSAIDs (painkillers) if possible.',
        dietYes: ['Cauliflower', 'Blueberries', 'Egg whites', 'Garlic', 'Olive oil'],
        dietNo: ['Dark sodas', 'Avocados (High Potassium)', 'Canned foods (High Sodium)', 'Brown rice (High Phosphorus)', 'Bananas']
    },
    {
        id: 'senior',
        title: 'Senior Citizens',
        description: 'Focus on bone health, mobility, and cognitive longevity.',
        iconName: 'senior',
        color: 'bg-indigo-50 text-indigo-800',
        borderColor: 'border-indigo-200',
        lifestyle: 'Prioritize fall prevention, social connection, and gentle resistance training to maintain muscle mass.',
        dietYes: ['Calcium-rich foods', 'Vitamin D sources', 'Fiber (Prunes, Veggies)', 'Lean protein', 'Hydration fluids'],
        dietNo: ['Excessive caffeine', 'Raw/undercooked meats', 'High-sodium frozen meals', 'Unpasteurized dairy', 'Empty calorie sweets']
    },
    {
        id: 'special',
        title: 'Neurodiverse Support',
        description: 'Plans for Autism, ADHD, and developmental support needs.',
        iconName: 'brain',
        color: 'bg-purple-50 text-purple-800',
        borderColor: 'border-purple-200',
        lifestyle: 'Establish comforting routines, use visual schedules, create sensory-friendly environments, and focus on patience.',
        dietYes: ['Omega-3 rich foods', 'Probiotics (Yogurt)', 'Magnesium-rich foods', 'Whole unprocessed foods', 'Water'],
        dietNo: ['Artificial dyes/colorings', 'High sugar snacks', 'Processed additives', 'Foods with textures user dislikes', 'Caffeine']
    }
];

export const REVIEWS: Review[] = [
    { id: 1, doctorId: 1, userName: 'John Doe', rating: 5, comment: 'Dr. Rahman was incredibly attentive and explained everything clearly. Highly recommend!', date: '2023-10-15' },
    { id: 2, doctorId: 1, userName: 'Jane Smith', rating: 4, comment: 'Great doctor, but the wait time was a bit long.', date: '2023-09-20' },
    { id: 3, doctorId: 2, userName: 'Alice Johnson', rating: 5, comment: 'She solved my skin issue in just one visit. Amazing!', date: '2023-10-05' },
];
