
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Article } from '../types';
import { TextSizeIncreaseIcon } from '../components/icons/TextSizeIncreaseIcon';
import { TextSizeDecreaseIcon } from '../components/icons/TextSizeDecreaseIcon';
import { ArrowLeftIcon, TextSpacingIcon, BookOpenIcon } from '../components/icons/ArticleIcons';

// Helper to generate mock content since we only have excerpts
const generateMockContent = (article: Article) => {
    return [
        { type: 'paragraph', text: article.excerpt },
        { type: 'heading', text: 'Understanding the Core Concepts' },
        { type: 'paragraph', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam ac odio ante. Sed sed nunc justo. Suspendisse potenti. In eget leo finibus, lacinia enim quis, tincidunt magna. Curabitur convallis ex sit amet nisi facilisis, ut laoreet nisi hendrerit.' },
        { type: 'paragraph', text: 'Health is not just about the absence of disease, but the complete physical, mental, and social well-being. Regular check-ups, a balanced diet, and consistent physical activity are the cornerstones of a healthy lifestyle. However, in our busy world, these basics are often overlooked.' },
        { type: 'heading', text: 'Practical Steps for Improvement' },
        { type: 'paragraph', text: 'Start small. You do not need to overhaul your entire life overnight. Consistency beats intensity when it comes to long-term health. Drinking enough water, getting 7-8 hours of sleep, and managing stress are actionable steps you can take today.' },
        { type: 'quote', text: '“The greatest wealth is health.” – Virgil' },
        { type: 'paragraph', text: 'Furthermore, mental resilience plays a huge role. Mindfulness practices such as meditation or deep breathing can significantly lower cortisol levels. When we reduce stress, our immune system functions better, and our risk for chronic conditions decreases.' },
        { type: 'paragraph', text: 'In conclusion, prioritize your well-being. Listen to your body, consult with professionals like those available on MediGen, and stay informed about the latest health developments.' }
    ];
};

export const ArticlesPage: React.FC = () => {
  const { articles } = useData(); // Use Context Data
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Read Mode State
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');

  const categories = ['All', 'Innovation', 'Nutrition', 'Mental Health', 'Fitness', 'Wellness'];

  // Scroll to top when opening an article
  useEffect(() => {
      if (readingArticle) {
          window.scrollTo(0, 0);
      }
  }, [readingArticle]);

  // Filter logic
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, articles]);

  const featuredArticle = articles[0] || null;
  const gridArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  // Typography Class Mapping
  const fontSizeClasses = {
      'base': 'prose-base',
      'lg': 'prose-lg',
      'xl': 'prose-xl',
      '2xl': 'prose-2xl'
  };

  const lineHeightClasses = {
      'normal': 'leading-normal',
      'relaxed': 'leading-relaxed',
      'loose': 'leading-loose'
  };

  // --- READ MODE VIEW ---
  if (readingArticle) {
      const content = generateMockContent(readingArticle);
      
      return (
          <div className="bg-white min-h-screen animate-fadeIn z-50 relative">
              {/* Reading Toolbar */}
              <div className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 px-4 py-3 shadow-sm transition-all">
                  <div className="max-w-4xl mx-auto flex justify-between items-center">
                      <button 
                        onClick={() => setReadingArticle(null)}
                        className="flex items-center gap-2 text-gray-600 hover:text-teal-700 font-medium transition-colors"
                      >
                          <ArrowLeftIcon className="w-5 h-5" />
                          <span className="hidden sm:inline">Back to Browse</span>
                      </button>

                      <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-1.5">
                           {/* Font Size Controls */}
                           <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
                               <button 
                                    onClick={() => setFontSize(prev => prev === '2xl' ? 'xl' : prev === 'xl' ? 'lg' : 'base')}
                                    disabled={fontSize === 'base'}
                                    className="p-1 hover:text-teal-700 disabled:opacity-30 transition-colors"
                                    title="Decrease Font Size"
                               >
                                   <TextSizeDecreaseIcon className="w-5 h-5" />
                               </button>
                               <span className="text-xs font-bold w-4 text-center select-none">
                                   {fontSize === 'base' ? 'A' : fontSize === 'lg' ? 'A+' : fontSize === 'xl' ? 'A++' : 'A#'}
                               </span>
                               <button 
                                    onClick={() => setFontSize(prev => prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : '2xl')}
                                    disabled={fontSize === '2xl'}
                                    className="p-1 hover:text-teal-700 disabled:opacity-30 transition-colors"
                                    title="Increase Font Size"
                               >
                                   <TextSizeIncreaseIcon className="w-5 h-5" />
                               </button>
                           </div>

                           {/* Line Height Controls */}
                           <div className="flex items-center gap-2">
                               <button
                                    onClick={() => setLineHeight(prev => prev === 'loose' ? 'relaxed' : prev === 'relaxed' ? 'normal' : 'loose')}
                                    className="p-1 hover:text-teal-700 flex items-center gap-1 transition-colors"
                                    title="Toggle Line Spacing"
                               >
                                   <TextSpacingIcon className="w-5 h-5" />
                                   <span className="text-xs font-bold select-none w-12 text-center">
                                       {lineHeight === 'normal' ? 'Normal' : lineHeight === 'relaxed' ? 'Relaxed' : 'Loose'}
                                   </span>
                               </button>
                           </div>
                      </div>
                      
                      <div className="w-20 hidden sm:block"></div> {/* Spacer for balance */}
                  </div>
              </div>

              {/* Article Content */}
              <article className="max-w-3xl mx-auto px-6 py-12">
                  <header className="mb-10 text-center">
                      <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                          {readingArticle.category}
                      </span>
                      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                          {readingArticle.title}
                      </h1>
                      <div className="flex items-center justify-center gap-4 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center text-white font-bold text-xs">
                                  {readingArticle.author.charAt(0)}
                              </div>
                              <span className="font-medium">{readingArticle.author}</span>
                          </div>
                          <span>&bull;</span>
                          <span>{readingArticle.publishedDate}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                               <BookOpenIcon className="w-4 h-4" />
                               {readingArticle.readTime}
                          </span>
                      </div>
                  </header>

                  <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12 shadow-lg">
                      <img src={readingArticle.image} alt={readingArticle.title} className="w-full h-full object-cover" />
                  </div>

                  <div className={`prose ${fontSizeClasses[fontSize]} ${lineHeightClasses[lineHeight]} max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-teal-600 prose-img:rounded-xl`}>
                      {content.map((block, index) => {
                          if (block.type === 'heading') return <h2 key={index} className="mt-8 mb-4">{block.text}</h2>;
                          if (block.type === 'quote') return <blockquote key={index} className="border-l-4 border-teal-500 pl-4 italic text-gray-700 my-6 bg-gray-50 p-4 rounded-r-lg">{block.text}</blockquote>;
                          return <p key={index} className="mb-4">{block.text}</p>;
                      })}
                  </div>

                  {/* Author Bio (Mock) */}
                  <div className="mt-16 pt-8 border-t border-gray-200 flex items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-600">
                           {readingArticle.author.charAt(0)}
                       </div>
                       <div>
                           <h4 className="font-bold text-gray-900">About {readingArticle.author}</h4>
                           <p className="text-gray-500 text-sm">Medical contributor and health enthusiast dedicated to bringing you the latest science-backed wellness advice.</p>
                       </div>
                  </div>
              </article>
          </div>
      );
  }

  // --- BROWSE MODE VIEW ---
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search & Hero Section */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Health Pulse</h1>
                    <p className="text-gray-600 text-lg">Curated insights from top medical experts.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            selectedCategory === cat 
                            ? 'bg-teal-700 text-white shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Hero / Featured Article (Only show if no search/filter active or if it matches) */}
            {selectedCategory === 'All' && !searchQuery && featuredArticle && (
                <div 
                    onClick={() => setReadingArticle(featuredArticle)}
                    className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer h-[400px] md:h-[500px]"
                >
                    <img 
                        src={featuredArticle.image} 
                        alt={featuredArticle.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                        <span className="bg-teal-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            Featured
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-teal-200 transition-colors">
                            {featuredArticle.title}
                        </h2>
                        <p className="text-gray-200 text-lg mb-6 line-clamp-2 md:line-clamp-none">
                            {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-gray-300 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center text-white font-bold text-xs">
                                    {featuredArticle.author.charAt(0)}
                                </div>
                                <span>{featuredArticle.author}</span>
                            </div>
                            <span>&bull;</span>
                            <span>{featuredArticle.publishedDate}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {featuredArticle.readTime}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-4 py-12">
        {gridArticles.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridArticles.map((article) => (
                    <div 
                        key={article.id} 
                        onClick={() => setReadingArticle(article)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                    >
                        <div className="h-56 overflow-hidden relative">
                             <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase">
                                    {article.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2">
                                {article.title}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm line-clamp-3 flex-grow">
                                {article.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {article.author.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-800">{article.author}</span>
                                        <span className="text-[10px] text-gray-500">{article.publishedDate}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {article.readTime}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        ) : (
            <div className="text-center py-20">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                <button 
                    onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                    className="mt-6 text-teal-700 font-semibold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        )}

        {/* Newsletter / CTA Section */}
        <div className="mt-20 bg-teal-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                </svg>
             </div>
             <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Stay Healthy, Stay Informed</h2>
                <p className="text-teal-100 mb-8 text-lg">Join 50,000+ subscribers getting the latest medical insights and wellness tips delivered to their inbox.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input type="email" placeholder="Enter your email address" className="flex-grow px-6 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-500" />
                    <button className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-colors shadow-lg">
                        Subscribe
                    </button>
                </div>
                <p className="text-xs text-teal-300 mt-4">We respect your privacy. Unsubscribe at any time.</p>
             </div>
        </div>
      </div>
    </div>
  );
};
