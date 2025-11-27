
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Product, CartItem, InsurancePlan, Book, Course, EnrolledCourse } from '../types';
import { ShoppingCartIcon, TagIcon, PlusCircleIcon, FilterIcon, ShieldCheckIcon, UmbrellaIcon, BookOpenIcon, AcademicCapIcon, PlayIcon, DocumentTextIcon, ClipboardListIcon, PlayCircleIcon, CheckCircleIcon, LockClosedIcon } from '../components/icons/EcommerceIcons';
import { StarIcon } from '../components/icons/StarIcon';
import { analyzePrescription } from '../services/geminiService';

export const MediGenPlusPage: React.FC = () => {
  const { products, insurancePlans, books, courses, addPrescriptionRequest } = useData(); // Use dynamic data
  const [activeTab, setActiveTab] = useState<'store' | 'insurance' | 'books' | 'courses' | 'learning'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Prescription State
  const [isPrescriptionAnalyzing, setIsPrescriptionAnalyzing] = useState(false);
  const [prescriptionResults, setPrescriptionResults] = useState<{ detected: string[], matched: Product[], unmatched: string[] } | null>(null);
  const prescriptionInputRef = useRef<HTMLInputElement>(null);

  // Insurance State
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);

  // Learning State
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [activeCourse, setActiveCourse] = useState<EnrolledCourse | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const categories = ['All', 'Pharmacy', 'Beauty', 'Equipment', 'Supplements'];

  useEffect(() => {
      // Load Enrolled Courses from local storage
      const storedCourses = localStorage.getItem('mediGenEnrolledCourses');
      if (storedCourses) {
          setEnrolledCourses(JSON.parse(storedCourses));
      } else if (courses.length > 0) {
          // Demo initialization
          const demoCourse: EnrolledCourse = {
              ...courses[0],
              progress: 15,
              completedLessonsCount: 3,
              status: 'In Progress',
              lastAccessed: '2 days ago'
          };
          // Don't overwrite immediately if empty, just set state
          // setEnrolledCourses([demoCourse]); 
      }
  }, [courses]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, products]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, books]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, courses]);

  const addToCart = (item: Product | Book | Course) => {
    // Normalize data for CartItem structure
    let product: Product;
    if ('title' in item) {
        // It's a Book or Course
        product = {
            id: item.id,
            name: item.title,
            category: 'category' in item ? (item.category as any) : 'Education',
            price: item.price,
            image: item.image,
            description: 'description' in item ? item.description : 'Online Course',
            rating: item.rating,
            inStock: true
        };
    } else {
        product = item as Product;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleApplyInsurance = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Application submitted for ${selectedPlan?.name}! An agent will contact you shortly.`);
      setSelectedPlan(null);
  }

  // Course Enrollment Logic (Simulated)
  const handleEnrollCourse = (course: Course) => {
      const isEnrolled = enrolledCourses.some(c => c.id === course.id);
      if (isEnrolled) {
          alert("You are already enrolled in this course!");
          setActiveTab('learning');
          return;
      }
      
      const newEnrollment: EnrolledCourse = {
          ...course,
          progress: 0,
          completedLessonsCount: 0,
          lastAccessed: 'Just now',
          status: 'Not Started'
      };
      
      const updatedList = [...enrolledCourses, newEnrollment];
      setEnrolledCourses(updatedList);
      localStorage.setItem('mediGenEnrolledCourses', JSON.stringify(updatedList));
      alert(`Successfully enrolled in ${course.title}!`);
      setActiveTab('learning');
  };

  const handleResumeCourse = (course: EnrolledCourse) => {
      setActiveCourse(course);
      // Logic to determine active lesson could go here
      setActiveLessonIndex(course.completedLessonsCount); 
  };

  // Prescription Logic
  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsPrescriptionAnalyzing(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          
          // Save to Admin Context
          addPrescriptionRequest({
              id: Date.now(),
              userId: 'current-user', // Ideally from Auth context
              userName: 'Current User',
              image: base64,
              status: 'Pending',
              date: new Date().toLocaleDateString()
          });

          const medicines = await analyzePrescription(base64);
          
          // Match with products
          const matched: Product[] = [];
          const unmatched: string[] = [];

          medicines.forEach(medName => {
              const lowerName = medName.toLowerCase();
              // Simple string inclusion matching against current products
              const found = products.find(p => 
                  p.name.toLowerCase().includes(lowerName) || 
                  lowerName.includes(p.name.toLowerCase())
              );
              if (found) {
                  // Prevent duplicates in matched list if user script repeats or multiple meds map to same product
                  if (!matched.find(m => m.id === found.id)) {
                      matched.push(found);
                  }
              } else {
                  unmatched.push(medName);
              }
          });

          setPrescriptionResults({ detected: medicines, matched, unmatched });
          setIsPrescriptionAnalyzing(false);
      };
      reader.readAsDataURL(file);
  };

  const addAllMatchedToCart = () => {
      if (!prescriptionResults) return;
      
      const newItems: CartItem[] = prescriptionResults.matched.map(p => ({
          ...p,
          quantity: 1
      }));

      setCart(prev => {
          // Merge logic
          const updatedCart = [...prev];
          newItems.forEach(newItem => {
              const existingIndex = updatedCart.findIndex(i => i.id === newItem.id);
              if (existingIndex >= 0) {
                  updatedCart[existingIndex].quantity += 1;
              } else {
                  updatedCart.push(newItem);
              }
          });
          return updatedCart;
      });
      setIsCartOpen(true);
      setPrescriptionResults(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white pt-10 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
                <PlusCircleIcon className="w-10 h-10 text-yellow-400" />
                MediGen+ Store
              </h1>
              <p className="text-indigo-200 text-lg">One-stop solution for Medicine, Education, and Insurance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2 max-w-4xl mb-8">
            <button 
                onClick={() => setActiveTab('store')}
                className={`flex-1 min-w-[140px] py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'store' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <ShoppingCartIcon className="w-5 h-5" />
                Medical Store
            </button>
            <button 
                onClick={() => setActiveTab('books')}
                className={`flex-1 min-w-[140px] py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'books' ? 'bg-amber-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <BookOpenIcon className="w-5 h-5" />
                Bookstore
            </button>
            <button 
                onClick={() => setActiveTab('courses')}
                className={`flex-1 min-w-[140px] py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'courses' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <AcademicCapIcon className="w-5 h-5" />
                Health Courses
            </button>
            <button 
                onClick={() => setActiveTab('learning')}
                className={`flex-1 min-w-[140px] py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'learning' ? 'bg-green-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <PlayCircleIcon className="w-5 h-5" />
                My Learning
            </button>
            <button 
                onClick={() => setActiveTab('insurance')}
                className={`flex-1 min-w-[140px] py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'insurance' ? 'bg-teal-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <ShieldCheckIcon className="w-5 h-5" />
                Insurance
            </button>
        </div>

        {/* --- TAB: STORE --- */}
        {activeTab === 'store' && (
            <div className="animate-fadeIn">
                <div className="flex-grow">
                     {/* Smart Prescription Upload Banner */}
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                                <DocumentTextIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Smart Prescription Fill</h3>
                                <p className="text-gray-600 text-sm max-w-lg">
                                    Upload a photo of your prescription. Our AI will read the medicine names, and our Pharmacist Admin will review the request.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <input 
                                type="file" 
                                ref={prescriptionInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handlePrescriptionUpload}
                             />
                             <button 
                                onClick={() => prescriptionInputRef.current?.click()}
                                disabled={isPrescriptionAnalyzing}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                                 {isPrescriptionAnalyzing ? (
                                     <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sending...
                                     </>
                                 ) : (
                                     <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        Upload Prescription
                                     </>
                                 )}
                             </button>
                        </div>
                     </div>

                    {/* Search & Filters */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-5 py-3 rounded-full text-gray-800 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm"
                            />
                            <svg className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                                activeCategory === cat 
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Out of Stock</span>
                                </div>
                            )}
                            {product.category === 'Equipment' && (
                                <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">Medical Grade</span>
                            )}
                            </div>
                            
                            <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                                    <TagIcon className="w-3 h-3" /> {product.category}
                                </span>
                                <div className="flex items-center text-yellow-400 text-xs font-bold">
                                    <StarIcon className="w-3 h-3 mr-1" />
                                    {product.rating}
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{product.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={!product.inStock}
                                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Add to Cart"
                                >
                                    <PlusCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- TAB: BOOKSTORE --- */}
        {activeTab === 'books' && (
             <div className="animate-fadeIn">
                 <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpenIcon className="w-6 h-6 text-amber-600" />
                            Medical Bookstore
                        </h2>
                        <p className="text-gray-600">Textbooks, reference guides, and medical literature.</p>
                     </div>
                     <input
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBooks.map(book => (
                        <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="h-64 bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden group rounded-t-xl">
                                <img src={book.image} alt={book.title} className="h-full object-contain shadow-md group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                                    {book.category}
                                </div>
                            </div>
                            <div className="p-5 flex-col flex flex-grow">
                                <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">by {book.author}</p>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">{book.description}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xl font-bold text-gray-900">${book.price}</span>
                                    <button 
                                        onClick={() => addToCart(book)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <PlusCircleIcon className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        )}

        {/* --- TAB: COURSES --- */}
        {activeTab === 'courses' && (
             <div className="animate-fadeIn">
                 <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                            Health & Wellness Academy
                        </h2>
                        <p className="text-gray-600">Expert-led courses for a healthier you.</p>
                     </div>
                     <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="h-48 relative">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <button className="bg-white text-purple-600 rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform">
                                        <PlayIcon className="w-8 h-8 ml-1" />
                                    </button>
                                </div>
                                <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    {course.category}
                                </span>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-gray-800 text-xl leading-tight">{course.title}</h3>
                                     <div className="flex items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                                        <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
                                        <span className="text-xs font-bold text-gray-700">{course.rating}</span>
                                     </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-4">Instructor: <span className="text-gray-700 font-medium">{course.instructor}</span></p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 bg-gray-50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {course.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        {course.lessons} Lessons
                                    </span>
                                </div>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                                    <button 
                                        onClick={() => handleEnrollCourse(course)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        )}

        {/* --- TAB: MY LEARNING --- */}
        {activeTab === 'learning' && (
            <div className="animate-fadeIn">
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PlayCircleIcon className="w-6 h-6 text-green-600" />
                        My Courses
                    </h2>
                    <p className="text-gray-600">Track your progress and access your study materials.</p>
                 </div>

                 {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrolledCourses.map(course => (
                             <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-shadow">
                                  <div className="h-40 relative rounded-t-xl overflow-hidden">
                                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                      <span className="absolute bottom-2 left-2 text-white text-xs font-bold px-2 py-1 rounded bg-black bg-opacity-50">
                                          {course.category}
                                      </span>
                                  </div>
                                  <div className="p-5 flex-col flex flex-grow">
                                      <h3 className="font-bold text-gray-800 text-lg mb-1">{course.title}</h3>
                                      <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>
                                      
                                      <div className="mb-4">
                                          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                                              <span>{course.progress}% Complete</span>
                                              <span>{course.completedLessonsCount}/{course.lessons} Lessons</span>
                                          </div>
                                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                              <div 
                                                  className="h-full bg-green-500 rounded-full" 
                                                  style={{ width: `${course.progress}%` }}
                                              ></div>
                                          </div>
                                      </div>

                                      <div className="mt-auto">
                                          <button 
                                              onClick={() => handleResumeCourse(course)}
                                              className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                          >
                                              <PlayIcon className="w-4 h-4" />
                                              {course.progress > 0 ? 'Resume Course' : 'Start Course'}
                                          </button>
                                          <p className="text-center text-xs text-gray-400 mt-2">Last accessed: {course.lastAccessed}</p>
                                      </div>
                                  </div>
                             </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">You haven't enrolled in any courses yet.</h3>
                        <p className="text-gray-500 mb-6">Explore our academy to find courses on fitness, mental health, and more.</p>
                        <button 
                            onClick={() => setActiveTab('courses')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                        >
                            Browse Courses
                        </button>
                    </div>
                 )}
            </div>
        )}

        {/* --- TAB: INSURANCE --- */}
        {activeTab === 'insurance' && (
            <div className="animate-fadeIn">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800">Secure Your Future with MediGen Insurance</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mt-2">
                        Comprehensive medical coverage tailored for individuals, seniors, and families. 
                        Choose from our range of specialized plans designed to give you peace of mind.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {insurancePlans.map(plan => (
                        <div key={plan.id} className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border-2 relative overflow-hidden flex flex-col ${plan.popular ? 'border-teal-500' : 'border-transparent'}`}>
                             {plan.popular && (
                                <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    Most Popular
                                </div>
                             )}
                             <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600">
                                        <ShieldCheckIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{plan.type}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">by {plan.provider}</p>
                             </div>

                             <div className="p-6 flex-grow">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Monthly Premium</p>
                                    <div className="flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">${plan.monthlyPremium}</span>
                                        <span className="text-gray-500 ml-1">/mo</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Coverage Limit</p>
                                    <p className="font-bold text-teal-700">{plan.coverageLimit}</p>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                             </div>

                             <div className="p-6 pt-0 mt-auto">
                                <button 
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.popular ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                                >
                                    Get Quote / Apply
                                </button>
                             </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-indigo-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                     <div className="bg-white p-4 rounded-full shadow-md text-indigo-600">
                        <UmbrellaIcon className="w-10 h-10" />
                     </div>
                     <div className="text-center md:text-left flex-grow">
                        <h3 className="text-xl font-bold text-indigo-900">Need a Custom Enterprise Plan?</h3>
                        <p className="text-indigo-700">We offer specialized bulk insurance packages for medical institutions and corporate wellness.</p>
                     </div>
                     <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 whitespace-nowrap">
                        Contact Sales
                     </button>
                </div>
            </div>
        )}

      </div>

      {/* Cart Float Button (Mobile) */}
      {(activeTab === 'store' || activeTab === 'books' || activeTab === 'courses') && (
        <button 
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl md:hidden"
        >
            <div className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
            </div>
        </button>
      )}

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" /> Your Cart ({cartItemCount})
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Your cart is empty.</p>
                    <button onClick={() => setIsCartOpen(false)} className="text-indigo-600 font-bold mt-2 hover:underline">Start Shopping</button>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-grow">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-indigo-600 font-bold text-sm">${item.price}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-white rounded border flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
                                <span className="text-sm font-medium">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-white rounded border flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                            </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 self-start">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            <button 
                disabled={cart.length === 0}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                Checkout Now
            </button>
        </div>
      </div>
      
      {/* Overlay for Cart */}
      {isCartOpen && (
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      {/* --- Course Player Modal --- */}
      {activeCourse && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row">
              {/* Sidebar (Lessons) */}
              <div className="w-full md:w-80 bg-gray-900 text-gray-300 flex flex-col h-1/3 md:h-full border-r border-gray-800">
                   <div className="p-4 bg-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{activeCourse.title}</h3>
                        <button onClick={() => setActiveCourse(null)} className="md:hidden text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                   </div>
                   <div className="flex-grow overflow-y-auto">
                        <div className="p-4">
                            <p className="text-xs font-bold uppercase text-gray-500 mb-2">Curriculum</p>
                            <div className="space-y-1">
                                {Array.from({ length: activeCourse.lessons }).map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveLessonIndex(idx)}
                                        className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${activeLessonIndex === idx ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800'}`}
                                    >
                                        <div className="mt-0.5">
                                            {idx < activeCourse.completedLessonsCount ? (
                                                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                            ) : idx === activeCourse.completedLessonsCount ? (
                                                <PlayCircleIcon className="w-4 h-4" />
                                            ) : (
                                                <LockClosedIcon className="w-4 h-4 text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold block">Lesson {idx + 1}</span>
                                            <span className={`text-xs ${activeLessonIndex === idx ? 'text-indigo-200' : 'text-gray-500'}`}>15 min</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                   </div>
              </div>

              {/* Main Content (Player) */}
              <div className="flex-grow bg-gray-100 flex flex-col h-2/3 md:h-full relative overflow-y-auto">
                  <div className="bg-black aspect-video w-full flex items-center justify-center relative group">
                        <img src={activeCourse.image} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
                        <button className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <PlayIcon className="w-10 h-10 text-white ml-1" />
                            </div>
                        </button>
                        <div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-600 rounded-full overflow-hidden">
                             <div className="h-full bg-red-600 w-1/3"></div>
                        </div>
                  </div>

                  <div className="p-6 md:p-10">
                       <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Lesson {activeLessonIndex + 1}: Introduction to Health</h1>
                                <p className="text-gray-600">In this lesson, we will cover the fundamentals required to start your journey.</p>
                            </div>
                            <button 
                                onClick={() => setActiveCourse(null)}
                                className="hidden md:flex px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold items-center gap-2"
                            >
                                Exit Course
                            </button>
                       </div>

                       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                                Lesson Resources
                            </h3>
                            <div className="flex gap-4">
                                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">Download Slides (PDF)</button>
                                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">Worksheet</button>
                            </div>
                       </div>
                  </div>
              </div>
          </div>
      )}

       {/* Prescription Analysis Result Modal */}
       {prescriptionResults && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto">
                 <button 
                    onClick={() => setPrescriptionResults(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <ClipboardListIcon className="w-6 h-6 text-indigo-600" />
                    Prescription Request Sent
                </h2>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-6">
                    <p className="text-sm text-indigo-800">
                        Your prescription has been sent to our admin team for verification. You can review the auto-detected items below and add available ones to your cart immediately.
                    </p>
                </div>
                
                {prescriptionResults.detected.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No readable medicine names found by AI.</p>
                        <p className="text-xs">Admin will manually review the image.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {prescriptionResults.matched.length > 0 && (
                            <div>
                                <h3 className="font-bold text-green-700 text-sm uppercase mb-3 border-b border-green-100 pb-1">Available in Stock</h3>
                                <div className="space-y-3">
                                    {prescriptionResults.matched.map(product => (
                                        <div key={product.id} className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-3">
                                                 <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                                 <div>
                                                     <p className="text-sm font-bold text-gray-800">{product.name}</p>
                                                     <p className="text-xs text-gray-500">${product.price}</p>
                                                 </div>
                                            </div>
                                            <button 
                                                onClick={() => { addToCart(product); }}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={addAllMatchedToCart}
                                    className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                                >
                                    Add All Available to Cart
                                </button>
                            </div>
                        )}

                        {prescriptionResults.unmatched.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-600 text-sm uppercase mb-3 border-b border-gray-200 pb-1">Not Found in Store</h3>
                                <ul className="space-y-2">
                                    {prescriptionResults.unmatched.map((name, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-400 mt-2">The pharmacist will contact you regarding these items.</p>
                            </div>
                        )}
                    </div>
                )}
              </div>
          </div>
      )}

      {/* Insurance Application Modal */}
      {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
                 <button 
                    onClick={() => setSelectedPlan(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">Apply for {selectedPlan.name}</h2>
                <p className="text-gray-500 text-sm mb-6">Please confirm your details. An insurance agent will contact you within 24 hours.</p>

                <form onSubmit={handleApplyInsurance} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="(555) 123-4567" />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Monthly Premium</span>
                        <span className="text-lg font-bold text-teal-700">${selectedPlan.monthlyPremium}</span>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                            Submit Application
                        </button>
                    </div>
                </form>
              </div>
          </div>
      )}
    </div>
  );
};
