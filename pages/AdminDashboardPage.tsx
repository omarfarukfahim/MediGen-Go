
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Doctor, Hospital, Article, Product, BloodRequest, InsurancePlan, Book, Course, WellnessPlan, Donor, PrescriptionRequest } from '../types';
import { DashboardIcon, EditIcon, TrashIcon, UsersIcon } from '../components/icons/AdminIcons';
import { PlusIcon, HeartIcon } from '../components/icons/HealthIcons';
import { HospitalIcon, BloodDropIcon, PhoneIcon } from '../components/icons/BloodIcons';
import { DocumentTextIcon, ShoppingCartIcon, ShieldCheckIcon, BookOpenIcon, AcademicCapIcon, ClipboardListIcon } from '../components/icons/EcommerceIcons';
import { DiamondIcon } from '../components/icons/WellnessPlusIcons';

type Tab = 'doctors' | 'hospitals' | 'articles' | 'bloodbank' | 'medigen' | 'wellness';
type SubTab = 'donors' | 'requests' | 'store' | 'books' | 'courses' | 'insurance' | 'prescriptions';

export const AdminDashboardPage: React.FC = () => {
    const { 
        doctors, addDoctor, updateDoctor, deleteDoctor,
        hospitals, addHospital, updateHospital, deleteHospital,
        articles, addArticle, updateArticle, deleteArticle,
        products, addProduct, updateProduct, deleteProduct,
        bloodRequests, setBloodRequests,
        books, addBook, updateBook, deleteBook,
        courses, addCourse, updateCourse, deleteCourse,
        insurancePlans, addInsurance, updateInsurance, deleteInsurance,
        wellnessPlans, addWellnessPlan, updateWellnessPlan, deleteWellnessPlan,
        donors, addDonor, updateDonor, deleteDonor,
        prescriptionRequests, updatePrescriptionRequest
    } = useData();

    const [activeTab, setActiveTab] = useState<Tab>('doctors');
    const [activeSubTab, setActiveSubTab] = useState<SubTab | null>(null); // Dynamically set based on main tab
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewImageModalOpen, setIsViewImageModalOpen] = useState(false);
    const [viewImageSrc, setViewImageSrc] = useState('');
    const [editItem, setEditItem] = useState<any | null>(null);

    // Form States
    const [formData, setFormData] = useState<any>({});

    // Helper to determine effective subtab
    const currentSubTab = (() => {
        if (activeTab === 'bloodbank' && !activeSubTab) return 'requests';
        if (activeTab === 'medigen' && !activeSubTab) return 'store';
        return activeSubTab;
    })();

    const openAddModal = () => {
        setEditItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditItem(item);
        
        // Special handling for array-based fields in forms (convert to comma string)
        let formInit = { ...item };
        if (activeTab === 'wellness') {
            formInit.dietYes = item.dietYes.join(', ');
            formInit.dietNo = item.dietNo.join(', ');
        }
        if (currentSubTab === 'insurance') {
            formInit.features = item.features.join(', ');
        }

        setFormData(formInit);
        setIsModalOpen(true);
    };

    const handleViewPrescription = (req: PrescriptionRequest) => {
        setViewImageSrc(req.image);
        setIsViewImageModalOpen(true);
    };

    const handlePrescriptionStatus = (req: PrescriptionRequest, status: 'Processed' | 'Rejected') => {
        updatePrescriptionRequest({ ...req, status });
    };

    const handleDelete = (id: number | string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        if (activeTab === 'doctors') deleteDoctor(id as number);
        else if (activeTab === 'hospitals') deleteHospital(id as number);
        else if (activeTab === 'articles') deleteArticle(id as number);
        else if (activeTab === 'bloodbank') {
            if (currentSubTab === 'donors') deleteDonor(id as number);
            else setBloodRequests(prev => prev.filter(r => r.id !== id));
        }
        else if (activeTab === 'medigen') {
            if (currentSubTab === 'store') deleteProduct(id as number);
            else if (currentSubTab === 'books') deleteBook(id as number);
            else if (currentSubTab === 'courses') deleteCourse(id as number);
            else if (currentSubTab === 'insurance') deleteInsurance(id as number);
        }
        else if (activeTab === 'wellness') deleteWellnessPlan(id as string);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const id = editItem ? editItem.id : (activeTab === 'wellness' ? `plan-${Date.now()}` : Date.now());
        let newItem = { ...formData, id };

        // Process specific fields
        if (activeTab === 'wellness') {
            newItem.dietYes = formData.dietYes.split(',').map((s: string) => s.trim());
            newItem.dietNo = formData.dietNo.split(',').map((s: string) => s.trim());
            // Default color classes if not set (simplified logic)
            if (!editItem) {
                newItem.color = 'bg-gray-50 text-gray-800';
                newItem.borderColor = 'border-gray-200';
            }
        }
        if (currentSubTab === 'insurance') {
            newItem.features = formData.features.split(',').map((s: string) => s.trim());
        }

        // --- Dispatch ---
        if (activeTab === 'doctors') {
            editItem ? updateDoctor(newItem) : addDoctor({ ...newItem, rating: 5.0, avatarColor: 'bg-teal-100 text-teal-800' });
        } else if (activeTab === 'hospitals') {
            editItem ? updateHospital(newItem) : addHospital(newItem);
        } else if (activeTab === 'articles') {
            editItem ? updateArticle(newItem) : addArticle({ ...newItem, publishedDate: new Date().toLocaleDateString(), readTime: '5 min read', author: 'Admin' });
        } else if (activeTab === 'bloodbank') {
            if (currentSubTab === 'donors') editItem ? updateDonor(newItem) : addDonor(newItem);
            else setBloodRequests(prev => prev.map(r => r.id === id ? newItem : r));
        } else if (activeTab === 'medigen') {
            if (currentSubTab === 'store') editItem ? updateProduct(newItem) : addProduct({ ...newItem, rating: 0, inStock: true });
            else if (currentSubTab === 'books') editItem ? updateBook(newItem) : addBook({ ...newItem, rating: 0 });
            else if (currentSubTab === 'courses') editItem ? updateCourse(newItem) : addCourse({ ...newItem, rating: 0, lessons: 10, duration: '5 Hours' });
            else if (currentSubTab === 'insurance') editItem ? updateInsurance(newItem) : addInsurance(newItem);
        } else if (activeTab === 'wellness') {
            editItem ? updateWellnessPlan(newItem) : addWellnessPlan(newItem);
        }

        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const SidebarItem = ({ id, label, icon }: { id: Tab, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => { setActiveTab(id); setActiveSubTab(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === id ? 'bg-teal-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white shadow-md z-10 p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6 px-2 flex items-center gap-2">
                    <DashboardIcon className="w-6 h-6 text-teal-600" />
                    Admin Panel
                </h2>
                <nav className="space-y-2">
                    <SidebarItem id="doctors" label="Doctors" icon={<UsersIcon className="w-5 h-5" />} />
                    <SidebarItem id="hospitals" label="Hospitals" icon={<HospitalIcon className="w-5 h-5" />} />
                    <SidebarItem id="articles" label="Articles" icon={<DocumentTextIcon className="w-5 h-5" />} />
                    <SidebarItem id="medigen" label="MediGen+" icon={<ShoppingCartIcon className="w-5 h-5" />} />
                    <SidebarItem id="bloodbank" label="Blood Bank" icon={<BloodDropIcon className="w-5 h-5" />} />
                    <SidebarItem id="wellness" label="Wellness+" icon={<DiamondIcon className="w-5 h-5" />} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-8 overflow-x-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize flex items-center gap-2">
                        {activeTab === 'medigen' ? 'MediGen+ Ecosystem' : activeTab + ' Management'}
                    </h1>
                    
                    {/* Add Button (Hidden for requests/prescriptions view only) */}
                    {!(activeTab === 'bloodbank' && currentSubTab === 'requests') && 
                     !(activeTab === 'medigen' && currentSubTab === 'prescriptions') && (
                        <button 
                            onClick={openAddModal}
                            className="bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-800 transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add New
                        </button>
                    )}
                </div>

                {/* Sub-Navigation for complex tabs */}
                {activeTab === 'bloodbank' && (
                    <div className="flex space-x-2 mb-6 bg-white p-1 rounded-lg shadow-sm w-fit">
                        <button onClick={() => setActiveSubTab('requests')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'requests' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-50'}`}>Requests</button>
                        <button onClick={() => setActiveSubTab('donors')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'donors' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-50'}`}>Donors</button>
                    </div>
                )}

                {activeTab === 'medigen' && (
                    <div className="flex flex-wrap gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
                        <button onClick={() => setActiveSubTab('store')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'store' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-50'}`}>Products</button>
                        <button onClick={() => setActiveSubTab('books')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'books' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-50'}`}>Books</button>
                        <button onClick={() => setActiveSubTab('courses')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'courses' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-50'}`}>Courses</button>
                        <button onClick={() => setActiveSubTab('insurance')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'insurance' ? 'bg-teal-100 text-teal-800' : 'text-gray-600 hover:bg-gray-50'}`}>Insurance</button>
                        <button onClick={() => setActiveSubTab('prescriptions')} className={`px-4 py-2 rounded-md text-sm font-medium ${currentSubTab === 'prescriptions' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-50'}`}>Prescriptions</button>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">ID</th>
                                    <th className="px-6 py-3 font-semibold">Primary Info</th>
                                    <th className="px-6 py-3 font-semibold">Secondary Info</th>
                                    <th className="px-6 py-3 font-semibold">Status / Detail</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'doctors' && doctors.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{doc.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{doc.specialty} - {doc.location}</td>
                                        <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{doc.availability}</span></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(doc)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'wellness' && wellnessPlans.map(plan => (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">{plan.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{plan.title}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{plan.description}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">Icon: {plan.iconName}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(plan)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'bloodbank' && currentSubTab === 'donors' && donors.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{d.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{d.name}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{d.bloodType} - {d.location}</td>
                                        <td className="px-6 py-4"><span className="text-xs font-mono">{d.phone}</span></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(d)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'bloodbank' && currentSubTab === 'requests' && bloodRequests.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{r.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{r.patientName} (Req: {r.requesterName})</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{r.bloodType} - {r.hospital}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(r)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {/* MediGen Sub-tabs */}
                                {activeTab === 'medigen' && currentSubTab === 'store' && products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{p.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{p.category}</td>
                                        <td className="px-6 py-4 font-bold text-gray-700">${p.price}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'medigen' && currentSubTab === 'books' && books.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{b.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{b.title}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">Auth: {b.author}</td>
                                        <td className="px-6 py-4 font-bold text-gray-700">${b.price}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(b)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'medigen' && currentSubTab === 'courses' && courses.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{c.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{c.title}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{c.category}</td>
                                        <td className="px-6 py-4 font-bold text-gray-700">${c.price}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(c)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'medigen' && currentSubTab === 'insurance' && insurancePlans.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{p.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{p.type}</td>
                                        <td className="px-6 py-4 font-bold text-teal-700">${p.monthlyPremium}/mo</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'medigen' && currentSubTab === 'prescriptions' && prescriptionRequests.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{p.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.userName}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{p.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                p.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                                                p.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                            <button onClick={() => handleViewPrescription(p)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs border border-indigo-200 px-2 py-1 rounded bg-indigo-50">
                                                <ClipboardListIcon className="w-4 h-4" /> View
                                            </button>
                                            {p.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handlePrescriptionStatus(p, 'Processed')} className="text-green-600 hover:text-green-800 text-xs border border-green-200 px-2 py-1 rounded bg-green-50">Accept</button>
                                                    <button onClick={() => handlePrescriptionStatus(p, 'Rejected')} className="text-red-600 hover:text-red-800 text-xs border border-red-200 px-2 py-1 rounded bg-red-50">Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Empty State Logic */}
                        {((activeTab === 'doctors' && doctors.length === 0) || 
                          (activeTab === 'medigen' && currentSubTab === 'prescriptions' && prescriptionRequests.length === 0)) && (
                            <div className="p-12 text-center text-gray-500">
                                <div className="mb-2 opacity-20 text-6xl">∅</div>
                                No items found in this section.
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* General Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editItem ? 'Edit' : 'Add New'} {activeTab === 'medigen' && currentSubTab ? currentSubTab.slice(0,-1) : activeTab.slice(0, -1)}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* DOCTORS FORM */}
                            {activeTab === 'doctors' && (
                                <>
                                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Doctor Name" className="w-full border p-2 rounded" required />
                                    <input name="specialty" value={formData.specialty || ''} onChange={handleInputChange} placeholder="Specialty" className="w-full border p-2 rounded" required />
                                    <input name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="Location" className="w-full border p-2 rounded" required />
                                    <input name="availability" value={formData.availability || ''} onChange={handleInputChange} placeholder="Availability" className="w-full border p-2 rounded" required />
                                </>
                            )}

                            {/* HOSPITALS FORM */}
                            {activeTab === 'hospitals' && (
                                <>
                                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Hospital Name" className="w-full border p-2 rounded" required />
                                    <input name="type" value={formData.type || ''} onChange={handleInputChange} placeholder="Type" className="w-full border p-2 rounded" required />
                                    <input name="distance" value={formData.distance || ''} onChange={handleInputChange} placeholder="Distance" className="w-full border p-2 rounded" required />
                                </>
                            )}

                            {/* BLOOD BANK - DONORS FORM */}
                            {activeTab === 'bloodbank' && currentSubTab === 'donors' && (
                                <>
                                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Donor Name" className="w-full border p-2 rounded" required />
                                    <select name="bloodType" value={formData.bloodType || ''} onChange={handleInputChange} className="w-full border p-2 rounded" required>
                                        <option value="">Select Type</option>
                                        <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                                    </select>
                                    <input name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="Location" className="w-full border p-2 rounded" required />
                                    <input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="Phone Number" className="w-full border p-2 rounded" required />
                                </>
                            )}

                            {/* MEDIGEN - BOOKS FORM */}
                            {activeTab === 'medigen' && currentSubTab === 'books' && (
                                <>
                                    <input name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Book Title" className="w-full border p-2 rounded" required />
                                    <input name="author" value={formData.author || ''} onChange={handleInputChange} placeholder="Author" className="w-full border p-2 rounded" required />
                                    <input name="category" value={formData.category || ''} onChange={handleInputChange} placeholder="Category (Textbook, Ref)" className="w-full border p-2 rounded" required />
                                    <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} placeholder="Price" className="w-full border p-2 rounded" required />
                                    <input name="image" value={formData.image || ''} onChange={handleInputChange} placeholder="Image URL" className="w-full border p-2 rounded" required />
                                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Description" className="w-full border p-2 rounded" rows={2} />
                                </>
                            )}

                            {/* MEDIGEN - COURSES FORM */}
                            {activeTab === 'medigen' && currentSubTab === 'courses' && (
                                <>
                                    <input name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Course Title" className="w-full border p-2 rounded" required />
                                    <input name="instructor" value={formData.instructor || ''} onChange={handleInputChange} placeholder="Instructor" className="w-full border p-2 rounded" required />
                                    <input name="category" value={formData.category || ''} onChange={handleInputChange} placeholder="Category (Yoga, Mental Health)" className="w-full border p-2 rounded" required />
                                    <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} placeholder="Price" className="w-full border p-2 rounded" required />
                                    <input name="image" value={formData.image || ''} onChange={handleInputChange} placeholder="Image URL" className="w-full border p-2 rounded" required />
                                </>
                            )}

                            {/* MEDIGEN - INSURANCE FORM */}
                            {activeTab === 'medigen' && currentSubTab === 'insurance' && (
                                <>
                                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Plan Name" className="w-full border p-2 rounded" required />
                                    <input name="provider" value={formData.provider || ''} onChange={handleInputChange} placeholder="Provider Name" className="w-full border p-2 rounded" required />
                                    <input name="type" value={formData.type || ''} onChange={handleInputChange} placeholder="Type (Health, Dental)" className="w-full border p-2 rounded" required />
                                    <input type="number" name="monthlyPremium" value={formData.monthlyPremium || ''} onChange={handleInputChange} placeholder="Monthly Premium ($)" className="w-full border p-2 rounded" required />
                                    <input name="coverageLimit" value={formData.coverageLimit || ''} onChange={handleInputChange} placeholder="Coverage Limit" className="w-full border p-2 rounded" required />
                                    <textarea name="features" value={formData.features || ''} onChange={handleInputChange} placeholder="Features (comma separated)" className="w-full border p-2 rounded" rows={2} required />
                                </>
                            )}

                            {/* MEDIGEN - PRODUCTS FORM (Store) */}
                            {activeTab === 'medigen' && currentSubTab === 'store' && (
                                <>
                                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Product Name" className="w-full border p-2 rounded" required />
                                    <select name="category" value={formData.category || ''} onChange={handleInputChange} className="w-full border p-2 rounded" required>
                                        <option value="">Select Category</option>
                                        <option value="Pharmacy">Pharmacy</option><option value="Beauty">Beauty</option><option value="Equipment">Equipment</option><option value="Supplements">Supplements</option>
                                    </select>
                                    <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} placeholder="Price" className="w-full border p-2 rounded" required />
                                    <input name="image" value={formData.image || ''} onChange={handleInputChange} placeholder="Image URL" className="w-full border p-2 rounded" required />
                                </>
                            )}

                            {/* WELLNESS PLANS FORM */}
                            {activeTab === 'wellness' && (
                                <>
                                    <input name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Plan Title (e.g. Diabetes)" className="w-full border p-2 rounded" required />
                                    <input name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Short Description" className="w-full border p-2 rounded" required />
                                    <select name="iconName" value={formData.iconName || 'default'} onChange={handleInputChange} className="w-full border p-2 rounded" required>
                                        <option value="default">Default Icon</option>
                                        <option value="drop">Blood Drop (Diabetes)</option>
                                        <option value="heart">Heart</option>
                                        <option value="kidney">Kidney</option>
                                        <option value="brain">Brain</option>
                                        <option value="senior">Senior</option>
                                    </select>
                                    <textarea name="lifestyle" value={formData.lifestyle || ''} onChange={handleInputChange} placeholder="Lifestyle Guidelines..." className="w-full border p-2 rounded" rows={3} required />
                                    <textarea name="dietYes" value={formData.dietYes || ''} onChange={handleInputChange} placeholder="Foods to Eat (comma separated)" className="w-full border p-2 rounded" rows={2} required />
                                    <textarea name="dietNo" value={formData.dietNo || ''} onChange={handleInputChange} placeholder="Foods to Avoid (comma separated)" className="w-full border p-2 rounded" rows={2} required />
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {isViewImageModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setIsViewImageModalOpen(false)}>
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img src={viewImageSrc} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" />
                        <button className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black font-bold" onClick={() => setIsViewImageModalOpen(false)}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};
