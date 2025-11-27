
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, Hospital, Article, Product, BloodRequest, InsurancePlan, Book, Course, WellnessPlan, Donor, PrescriptionRequest, Review } from '../types';
import { DOCTORS, NEARBY_HOSPITALS, ARTICLES, PRODUCTS, INSURANCE_PLANS, MEDICAL_BOOKS, HEALTH_COURSES, WELLNESS_PLANS, REVIEWS } from '../constants';

interface DataContextType {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  hospitals: Hospital[];
  setHospitals: React.Dispatch<React.SetStateAction<Hospital[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  bloodRequests: BloodRequest[];
  setBloodRequests: React.Dispatch<React.SetStateAction<BloodRequest[]>>;
  insurancePlans: InsurancePlan[];
  setInsurancePlans: React.Dispatch<React.SetStateAction<InsurancePlan[]>>;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  wellnessPlans: WellnessPlan[];
  setWellnessPlans: React.Dispatch<React.SetStateAction<WellnessPlan[]>>;
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  prescriptionRequests: PrescriptionRequest[];
  setPrescriptionRequests: React.Dispatch<React.SetStateAction<PrescriptionRequest[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  
  // Helper methods
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: number) => void;
  
  addHospital: (hospital: Hospital) => void;
  updateHospital: (hospital: Hospital) => void;
  deleteHospital: (id: number) => void;

  addArticle: (article: Article) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: number) => void;

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;

  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: number) => void;

  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: number) => void;

  addInsurance: (plan: InsurancePlan) => void;
  updateInsurance: (plan: InsurancePlan) => void;
  deleteInsurance: (id: number) => void;

  addWellnessPlan: (plan: WellnessPlan) => void;
  updateWellnessPlan: (plan: WellnessPlan) => void;
  deleteWellnessPlan: (id: string) => void;

  addDonor: (donor: Donor) => void;
  updateDonor: (donor: Donor) => void;
  deleteDonor: (id: number) => void;
  
  addPrescriptionRequest: (req: PrescriptionRequest) => void;
  updatePrescriptionRequest: (req: PrescriptionRequest) => void;

  addReview: (review: Review) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Initialize state ---
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('admin_doctors');
    return saved ? JSON.parse(saved) : DOCTORS;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem('admin_hospitals');
    return saved ? JSON.parse(saved) : NEARBY_HOSPITALS;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('admin_articles');
    return saved ? JSON.parse(saved) : ARTICLES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('admin_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });
  
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() => {
      const saved = localStorage.getItem('bloodRequests'); 
      return saved ? JSON.parse(saved) : [];
  });

  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>(() => {
      const saved = localStorage.getItem('admin_insurance');
      return saved ? JSON.parse(saved) : INSURANCE_PLANS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
      const saved = localStorage.getItem('admin_books');
      return saved ? JSON.parse(saved) : MEDICAL_BOOKS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
      const saved = localStorage.getItem('admin_courses');
      return saved ? JSON.parse(saved) : HEALTH_COURSES;
  });

  const [wellnessPlans, setWellnessPlans] = useState<WellnessPlan[]>(() => {
      const saved = localStorage.getItem('admin_wellness_plans');
      return saved ? JSON.parse(saved) : WELLNESS_PLANS;
  });

  const [donors, setDonors] = useState<Donor[]>(() => {
      const saved = localStorage.getItem('admin_donors');
      // Initial mock donors
      return saved ? JSON.parse(saved) : [
          { id: 1, name: "John Smith", bloodType: "O+", location: "Downtown", phone: "555-0101", status: "Active" },
          { id: 2, name: "Emma Wilson", bloodType: "A-", location: "Westside", phone: "555-0102", status: "Active" }
      ];
  });

  const [prescriptionRequests, setPrescriptionRequests] = useState<PrescriptionRequest[]>(() => {
      const saved = localStorage.getItem('admin_prescriptions');
      return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
      const saved = localStorage.getItem('medigen_reviews');
      return saved ? JSON.parse(saved) : REVIEWS;
  });

  // --- Persist to LocalStorage ---
  useEffect(() => localStorage.setItem('admin_doctors', JSON.stringify(doctors)), [doctors]);
  useEffect(() => localStorage.setItem('admin_hospitals', JSON.stringify(hospitals)), [hospitals]);
  useEffect(() => localStorage.setItem('admin_articles', JSON.stringify(articles)), [articles]);
  useEffect(() => localStorage.setItem('admin_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('bloodRequests', JSON.stringify(bloodRequests)), [bloodRequests]);
  useEffect(() => localStorage.setItem('admin_insurance', JSON.stringify(insurancePlans)), [insurancePlans]);
  useEffect(() => localStorage.setItem('admin_books', JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem('admin_courses', JSON.stringify(courses)), [courses]);
  useEffect(() => localStorage.setItem('admin_wellness_plans', JSON.stringify(wellnessPlans)), [wellnessPlans]);
  useEffect(() => localStorage.setItem('admin_donors', JSON.stringify(donors)), [donors]);
  useEffect(() => localStorage.setItem('admin_prescriptions', JSON.stringify(prescriptionRequests)), [prescriptionRequests]);
  useEffect(() => localStorage.setItem('medigen_reviews', JSON.stringify(reviews)), [reviews]);

  // --- Helper Methods ---
  const addDoctor = (item: Doctor) => setDoctors(prev => [...prev, item]);
  const updateDoctor = (item: Doctor) => setDoctors(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteDoctor = (id: number) => setDoctors(prev => prev.filter(i => i.id !== id));

  const addHospital = (item: Hospital) => setHospitals(prev => [...prev, item]);
  const updateHospital = (item: Hospital) => setHospitals(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteHospital = (id: number) => setHospitals(prev => prev.filter(i => i.id !== id));

  const addArticle = (item: Article) => setArticles(prev => [item, ...prev]);
  const updateArticle = (item: Article) => setArticles(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteArticle = (id: number) => setArticles(prev => prev.filter(i => i.id !== id));

  const addProduct = (item: Product) => setProducts(prev => [...prev, item]);
  const updateProduct = (item: Product) => setProducts(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteProduct = (id: number) => setProducts(prev => prev.filter(i => i.id !== id));

  const addBook = (item: Book) => setBooks(prev => [...prev, item]);
  const updateBook = (item: Book) => setBooks(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteBook = (id: number) => setBooks(prev => prev.filter(i => i.id !== id));

  const addCourse = (item: Course) => setCourses(prev => [...prev, item]);
  const updateCourse = (item: Course) => setCourses(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteCourse = (id: number) => setCourses(prev => prev.filter(i => i.id !== id));

  const addInsurance = (item: InsurancePlan) => setInsurancePlans(prev => [...prev, item]);
  const updateInsurance = (item: InsurancePlan) => setInsurancePlans(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteInsurance = (id: number) => setInsurancePlans(prev => prev.filter(i => i.id !== id));

  const addWellnessPlan = (item: WellnessPlan) => setWellnessPlans(prev => [...prev, item]);
  const updateWellnessPlan = (item: WellnessPlan) => setWellnessPlans(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteWellnessPlan = (id: string) => setWellnessPlans(prev => prev.filter(i => i.id !== id));

  const addDonor = (item: Donor) => setDonors(prev => [...prev, item]);
  const updateDonor = (item: Donor) => setDonors(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteDonor = (id: number) => setDonors(prev => prev.filter(i => i.id !== id));

  const addPrescriptionRequest = (item: PrescriptionRequest) => setPrescriptionRequests(prev => [item, ...prev]);
  const updatePrescriptionRequest = (item: PrescriptionRequest) => setPrescriptionRequests(prev => prev.map(i => i.id === item.id ? item : i));

  const addReview = (review: Review) => {
      setReviews(prev => {
          const updatedReviews = [review, ...prev];
          
          // Calculate new average rating for doctor
          const docReviews = updatedReviews.filter(r => r.doctorId === review.doctorId);
          const avgRating = docReviews.reduce((acc, r) => acc + r.rating, 0) / docReviews.length;
          
          // Update doctor in state
          setDoctors(currentDoctors => 
              currentDoctors.map(d => d.id === review.doctorId ? { ...d, rating: Number(avgRating.toFixed(1)) } : d)
          );

          return updatedReviews;
      });
  };

  return (
    <DataContext.Provider value={{
      doctors, setDoctors, addDoctor, updateDoctor, deleteDoctor,
      hospitals, setHospitals, addHospital, updateHospital, deleteHospital,
      articles, setArticles, addArticle, updateArticle, deleteArticle,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      bloodRequests, setBloodRequests,
      insurancePlans, setInsurancePlans, addInsurance, updateInsurance, deleteInsurance,
      books, setBooks, addBook, updateBook, deleteBook,
      courses, setCourses, addCourse, updateCourse, deleteCourse,
      wellnessPlans, setWellnessPlans, addWellnessPlan, updateWellnessPlan, deleteWellnessPlan,
      donors, setDonors, addDonor, updateDonor, deleteDonor,
      prescriptionRequests, setPrescriptionRequests, addPrescriptionRequest, updatePrescriptionRequest,
      reviews, setReviews, addReview
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
