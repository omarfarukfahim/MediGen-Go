
import React, { useState, useEffect } from 'react';
import { SocialPost, SocialComment, BloodRequest } from '../types';
import { ThumbUpIcon, ChatBubbleIcon, ShareIcon } from '../components/icons/SocialIcons';
import { SendIcon } from '../components/icons/SendIcon';
import { BloodDropIcon, HospitalIcon, MapPinIcon, PhoneIcon } from '../components/icons/BloodIcons';
import { CameraIcon } from '../components/icons/ProfileIcons';
import { useData } from '../contexts/DataContext'; // Import context for donors

// --- Mock Data ---
const INITIAL_POSTS: SocialPost[] = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    authorAvatarColor: 'bg-purple-100 text-purple-800',
    time: '2 hours ago',
    category: 'Mental Health',
    content: 'Just finished my morning meditation session. It’s amazing how 10 minutes of mindfulness can change your entire day\'s perspective! 🧘‍♀️✨ #MentalHealth #Mindfulness',
    likes: 24,
    isLiked: false,
    comments: [
      { id: 101, author: 'Mark Peterson', text: 'Totally agree! I started last week and feel great.', time: '1 hour ago' },
      { id: 102, author: 'Dr. Lisa (Verified)', text: 'Great habit to build, Sarah! Consistency is key.', time: '30 mins ago' }
    ]
  },
  {
    id: 2,
    author: 'David Chen',
    authorAvatarColor: 'bg-blue-100 text-blue-800',
    time: '5 hours ago',
    category: 'Fitness',
    content: 'Finally ran my first 5k today! My legs are jelly but my heart is happy. 🏃‍♂️💨',
    likes: 56,
    isLiked: true,
    comments: []
  },
  {
    id: 3,
    author: 'Emily Rodriguez',
    authorAvatarColor: 'bg-green-100 text-green-800',
    time: '1 day ago',
    category: 'Nutrition',
    content: 'Does anyone have good recipes for low-sugar smoothies? Trying to cut down on processed sugar but I have a sweet tooth!',
    likes: 12,
    isLiked: false,
    comments: [
      { id: 103, author: 'Alex C.', text: 'Try using berries and spinach with almond milk. No added sugar needed!', time: '20 hours ago' }
    ]
  }
];

interface SocialForumPageProps {
    user: any; 
}

export const SocialForumPage: React.FC<SocialForumPageProps> = ({ user }) => {
  const { donors, bloodRequests, setBloodRequests } = useData(); // Use context for Donors and shared Requests
  const [activeTab, setActiveTab] = useState<'feed' | 'blood-bank'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  
  // Feed State
  const [newPostContent, setNewPostContent] = useState('');
  const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [userProfileName, setUserProfileName] = useState(user?.displayName || 'User');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);

  // Blood Bank State
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
  const [bloodBankSubTab, setBloodBankSubTab] = useState<'requests' | 'find-donors'>('requests');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');

  // File Upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load local storage for posts (requests handled by DataContext now)
    const storedPosts = localStorage.getItem('socialPosts');
    if (storedPosts) setPosts(JSON.parse(storedPosts));
    else setPosts(INITIAL_POSTS);

    // Load user profile for avatar
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile.fullName) setUserProfileName(parsedProfile.fullName);
        if (parsedProfile.profilePicture) setUserAvatarUrl(parsedProfile.profilePicture);
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem('socialPosts', JSON.stringify(posts));
  }, [posts]);

  // Handle sidebar avatar upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024 * 2) { 
              alert("Image size should be less than 2MB");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setUserAvatarUrl(base64);
              // Update localStorage profile
              const storedProfile = localStorage.getItem('userProfile');
              let profileData = storedProfile ? JSON.parse(storedProfile) : {
                  fullName: user.displayName || 'User',
                  allergies: [], currentMedications: [], emergencyContact: {name: '', relationship: '', phone: ''},
                  dateOfBirth: '', gender: '', bloodType: '', height: ''
              };
              profileData.profilePicture = base64;
              localStorage.setItem('userProfile', JSON.stringify(profileData));
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  // --- Feed Handlers ---
  const handleLike = (postId: number) => {
    setPosts(currentPosts => 
        currentPosts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                };
            }
            return post;
        })
    );
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: SocialPost = {
        id: Date.now(),
        author: userProfileName,
        authorAvatarColor: 'bg-teal-100 text-teal-800',
        authorAvatarUrl: userAvatarUrl, // Attach current avatar
        time: 'Just now',
        category: 'General',
        content: newPostContent,
        likes: 0,
        isLiked: false,
        comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleCommentSubmit = (postId: number) => {
      const text = commentInputs[postId];
      if (!text?.trim()) return;

      const newComment: SocialComment = {
          id: Date.now(),
          author: userProfileName,
          authorAvatarUrl: userAvatarUrl,
          text: text,
          time: 'Just now'
      };

      setPosts(currentPosts => 
        currentPosts.map(post => {
            if (post.id === postId) {
                return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
        })
      );

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleCommentBox = (postId: number) => {
      setActiveCommentBox(activeCommentBox === postId ? null : postId);
  };

  // --- Blood Bank Handlers ---
  const handleBloodRequestSubmit = (request: Omit<BloodRequest, 'id' | 'postedTime' | 'status' | 'requesterName'>) => {
      const newRequest: BloodRequest = {
          id: Date.now(),
          requesterName: userProfileName,
          postedTime: 'Just now',
          status: 'Open',
          ...request
      };
      setBloodRequests(prev => [newRequest, ...prev]);
      setIsBloodModalOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Community Hub</h1>
                    <p className="text-gray-600">Connect, share, and save lives.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-md">
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'feed' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ChatBubbleIcon className="w-4 h-4" />
                    Social Feed
                </button>
                <button 
                    onClick={() => setActiveTab('blood-bank')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'blood-bank' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BloodDropIcon className="w-4 h-4" />
                    Blood Bank
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar - Profile (Shared) */}
                <aside className="lg:w-1/4 hidden lg:block space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative group">
                        <div className="relative inline-block mx-auto mb-3 cursor-pointer" onClick={triggerFileInput}>
                            {userAvatarUrl ? (
                                <img src={userAvatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-teal-100" />
                            ) : (
                                <div className="w-20 h-20 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-3xl font-bold">
                                    {userProfileName.charAt(0).toUpperCase()}
                                </div>
                            )}
                             <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <CameraIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        
                        <h2 className="font-bold text-gray-800 text-lg">{userProfileName}</h2>
                        <p className="text-sm text-gray-500 mb-4">Community Member</p>
                        <div className="flex justify-around text-sm border-t pt-4">
                            <div>
                                <span className="block font-bold text-gray-800">{posts.filter(p => p.author === userProfileName).length}</span>
                                <span className="text-gray-500">Posts</span>
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800">{bloodRequests.filter(r => r.requesterName === userProfileName).length}</span>
                                <span className="text-gray-500">Requests</span>
                            </div>
                        </div>
                    </div>
                    
                    {activeTab === 'blood-bank' && (
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                             <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                <BloodDropIcon className="w-5 h-5"/>
                                Why Donate?
                             </h3>
                             <p className="text-sm text-red-800 mb-3">
                                One donation can save up to 3 lives. Your contribution makes a direct impact on the community.
                             </p>
                             <button className="text-xs font-semibold text-red-700 underline hover:text-red-900">Learn Eligibility Requirements</button>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="lg:w-3/4 space-y-6">
                    
                    {/* === SOCIAL FEED VIEW === */}
                    {activeTab === 'feed' && (
                        <>
                            {/* Create Post Input */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                         {userAvatarUrl ? (
                                            <img src={userAvatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold">
                                                {userProfileName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <form onSubmit={handlePostSubmit}>
                                            <textarea 
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                                                rows={2}
                                                placeholder={`What's on your mind, ${userProfileName.split(' ')[0]}?`}
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end items-center mt-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={!newPostContent.trim()}
                                                    className="px-6 py-2 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Feed Posts */}
                            {posts.map(post => (
                                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {post.authorAvatarUrl ? (
                                                <img src={post.authorAvatarUrl} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-10 h-10 ${post.authorAvatarColor} rounded-full flex items-center justify-center font-bold`}>
                                                    {post.author.charAt(0)}
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{post.author}</h3>
                                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                                    <span>{post.time}</span>
                                                    <span>&bull;</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{post.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-3">
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                    <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-50">
                                        <span>{post.likes} Likes</span>
                                        <span>{post.comments.length} Comments</span>
                                    </div>
                                    <div className="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
                                        <button 
                                            onClick={() => handleLike(post.id)}
                                            className={`py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <ThumbUpIcon className="w-5 h-5" filled={post.isLiked} />
                                            {post.isLiked ? 'Liked' : 'Like'}
                                        </button>
                                        <button 
                                            onClick={() => toggleCommentBox(post.id)}
                                            className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                        >
                                            <ChatBubbleIcon className="w-5 h-5" />
                                            Comment
                                        </button>
                                        <button className="py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                            <ShareIcon className="w-5 h-5" />
                                            Share
                                        </button>
                                    </div>
                                    {activeCommentBox === post.id && (
                                        <div className="bg-gray-50 p-4">
                                            <div className="space-y-4 mb-4">
                                                {post.comments.map(comment => (
                                                    <div key={comment.id} className="flex gap-2">
                                                        <div className="flex-shrink-0">
                                                            {comment.authorAvatarUrl ? (
                                                                <img src={comment.authorAvatarUrl} alt={comment.author} className="w-8 h-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                                    {comment.author.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex-grow">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-xs text-gray-800">{comment.author}</span>
                                                                <span className="text-xs text-gray-400">{comment.time}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-shrink-0">
                                                     {userAvatarUrl ? (
                                                        <img src={userAvatarUrl} alt="Me" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {userProfileName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative flex-grow">
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        placeholder="Write a comment..."
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                                    />
                                                    <button 
                                                        onClick={() => handleCommentSubmit(post.id)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-700 hover:text-teal-800 p-1"
                                                    >
                                                        <SendIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* === BLOOD BANK VIEW === */}
                    {activeTab === 'blood-bank' && (
                        <div className="animate-fadeIn space-y-6">
                            {/* Controls */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                    <button 
                                        onClick={() => setBloodBankSubTab('requests')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm ${bloodBankSubTab === 'requests' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}
                                    >
                                        Requests
                                    </button>
                                    <button 
                                        onClick={() => setBloodBankSubTab('find-donors')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm ${bloodBankSubTab === 'find-donors' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}
                                    >
                                        Find Donors
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                                    <select 
                                        value={bloodTypeFilter}
                                        onChange={(e) => setBloodTypeFilter(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="A+">A+</option> <option value="A-">A-</option>
                                        <option value="B+">B+</option> <option value="B-">B-</option>
                                        <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                        <option value="O+">O+</option> <option value="O-">O-</option>
                                    </select>
                                </div>
                                
                                {bloodBankSubTab === 'requests' && (
                                    <button 
                                        onClick={() => setIsBloodModalOpen(true)}
                                        className="w-full sm:w-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <BloodDropIcon className="w-5 h-5" />
                                        Request Blood
                                    </button>
                                )}
                            </div>

                            {/* Content based on SubTab */}
                            {bloodBankSubTab === 'requests' ? (
                                <div className="space-y-4">
                                    {bloodRequests
                                        .filter(req => bloodTypeFilter === 'All' || req.bloodType === bloodTypeFilter)
                                        .map(req => (
                                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow">
                                            {/* Left: Blood Drop & Type */}
                                            <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:gap-1">
                                                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center relative">
                                                    <BloodDropIcon className="w-8 h-8" />
                                                    <span className="absolute -bottom-1 bg-white border border-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                        {req.bloodType}
                                                    </span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                                    req.urgency === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' : 
                                                    req.urgency === 'Moderate' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                                                    'bg-blue-100 text-blue-800 border-blue-200'
                                                }`}>
                                                    {req.urgency}
                                                </div>
                                            </div>

                                            {/* Middle: Info */}
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-gray-800 text-lg">Patient: {req.patientName}</h3>
                                                    <span className="text-xs text-gray-500">{req.postedTime}</span>
                                                </div>
                                                
                                                <div className="mt-2 space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <HospitalIcon className="w-4 h-4 text-gray-400" />
                                                        {req.hospital}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                        {req.location}
                                                    </div>
                                                    {req.description && (
                                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg italic">
                                                            "{req.description}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Action */}
                                            <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5">
                                                <p className="text-xs text-gray-500 mb-2 text-center md:text-left">Posted by {req.requesterName}</p>
                                                <a 
                                                    href={`tel:${req.contactNumber}`}
                                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
                                                >
                                                    <PhoneIcon className="w-4 h-4" />
                                                    Contact
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {bloodRequests.filter(req => bloodTypeFilter === 'All' || req.bloodType === bloodTypeFilter).length === 0 && (
                                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <BloodDropIcon className="w-6 h-6 text-red-400" />
                                            </div>
                                            <h3 className="text-gray-800 font-medium">No requests found</h3>
                                            <p className="text-sm text-gray-500">Currently no open requests for this blood type.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // DONORS VIEW
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {donors
                                        .filter(d => bloodTypeFilter === 'All' || d.bloodType === bloodTypeFilter)
                                        .map(donor => (
                                        <div key={donor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-600 border border-red-100">
                                                    {donor.bloodType}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{donor.name}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <MapPinIcon className="w-3 h-3"/> {donor.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <a 
                                                href={`tel:${donor.phone}`}
                                                className="bg-teal-700 text-white p-3 rounded-full hover:bg-teal-800 transition-colors shadow-sm"
                                                title="Call Donor"
                                            >
                                                <PhoneIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                    ))}
                                    {donors.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-500">No donors available at the moment.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>

        {/* --- Request Blood Modal --- */}
        {isBloodModalOpen && (
            <BloodRequestModal onClose={() => setIsBloodModalOpen(false)} onSubmit={handleBloodRequestSubmit} />
        )}
    </div>
  );
};

// --- Sub-Components ---
const BloodRequestModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        bloodType: 'A+',
        hospital: '',
        location: '',
        urgency: 'Moderate',
        contactNumber: '',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <BloodDropIcon className="w-5 h-5"/>
                        Request Blood Donation
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                                <input required name="patientName" value={formData.patientName} onChange={handleChange} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Type</label>
                                <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none">
                                    <option value="A+">A+</option> <option value="A-">A-</option>
                                    <option value="B+">B+</option> <option value="B-">B-</option>
                                    <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                    <option value="O+">O+</option> <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name</label>
                            <input required name="hospital" value={formData.hospital} onChange={handleChange} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. City General" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Area</label>
                            <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Downtown District" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                                <input required name="contactNumber" value={formData.contactNumber} onChange={handleChange} type="tel" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="(555) 000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
                                <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none">
                                    <option value="Standard">Standard</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Details (Optional)</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Room number, specific requirements, etc."></textarea>
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors shadow-md">Post Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
