import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAiHealthResponse, checkSymptoms } from '../services/geminiService';
import { SendIcon } from '../components/icons/SendIcon';
import { TextSizeIncreaseIcon } from '../components/icons/TextSizeIncreaseIcon';
import { TextSizeDecreaseIcon } from '../components/icons/TextSizeDecreaseIcon';
import { StethoscopeIcon } from '../components/icons/HealthIcons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

export const AiAssistantPage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your AI Health Assistant. How can I help you today? Please remember, I am an AI assistant and not a medical professional. The information I provide is for general guidance and educational purposes only. It should not be considered a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health."
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Symptom Checker State
  const [symptomForm, setSymptomForm] = useState({
      age: '',
      gender: 'Male',
      symptoms: '',
      duration: ''
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: userInput
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const aiResponseText = await getAiHealthResponse(userInput);

    const aiMessage: ChatMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: aiResponseText
    };

    setChatMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSymptomModalOpen(false);
      
      // Construct user message
      const userText = `**Symptom Checker Request**\n- Age: ${symptomForm.age}\n- Gender: ${symptomForm.gender}\n- Duration: ${symptomForm.duration}\n- Symptoms: ${symptomForm.symptoms}`;
      
      const userMessage: ChatMessage = {
          id: Date.now(),
          sender: 'user',
          text: userText
      };
      setChatMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Call specialized service
      const result = await checkSymptoms(symptomForm);

      const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: result
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Reset form
      setSymptomForm({ age: '', gender: 'Male', symptoms: '', duration: '' });
  };
  
  const textSizes: Array<'sm' | 'base' | 'lg'> = ['sm', 'base', 'lg'];
    
  const handleTextSizeChange = (increase: boolean) => {
      const currentIndex = textSizes.indexOf(textSize);
      if (increase) {
          const nextIndex = Math.min(currentIndex + 1, textSizes.length - 1);
          setTextSize(textSizes[nextIndex]);
      } else {
          const prevIndex = Math.max(currentIndex - 1, 0);
          setTextSize(textSizes[prevIndex]);
      }
  };

  const textSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[textSize];

  const proseSizeClass = {
    sm: 'prose-sm',
    base: 'prose',
    lg: 'prose-lg',
  }[textSize];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-[calc(100vh-12rem)] relative">
          <div className="p-4 border-b border-gray-200 text-center relative bg-gray-50 rounded-t-lg">
            <div className="flex flex-col items-center">
                <h1 className="text-xl font-bold text-gray-800">AI Health Assistant</h1>
                <p className="text-xs text-gray-500">For informational purposes only. Not medical advice.</p>
            </div>
            
            {/* Left: Symptom Checker Button */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <button 
                    onClick={() => setIsSymptomModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-sm font-bold shadow-sm"
                >
                    <StethoscopeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Symptom Checker</span>
                </button>
            </div>

            {/* Right: Text Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                 <button
                    onClick={() => handleTextSizeChange(false)}
                    className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrease text size"
                    disabled={textSize === 'sm'}
                >
                    <TextSizeDecreaseIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => handleTextSizeChange(true)}
                    className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase text size"
                    disabled={textSize === 'lg'}
                >
                    <TextSizeIncreaseIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {chatMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                )}
                <div 
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.sender === 'user' 
                      ? 'bg-teal-700 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.sender === 'ai' ? (
                     <div
                      className={`prose ${proseSizeClass} max-w-none text-gray-800 
                      prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 
                      prose-strong:text-gray-800 prose-code:bg-gray-200 prose-code:p-0.5 prose-code:rounded
                      prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-3 prose-pre:rounded-md`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className={`whitespace-pre-wrap break-words ${textSizeClass}`}>
                        {message.text.includes('**Symptom Checker Request**') ? (
                            <div className="text-sm">
                                <div className="font-bold border-b border-teal-600 pb-1 mb-1 flex items-center gap-2">
                                    <StethoscopeIcon className="w-4 h-4" /> Symptom Check
                                </div>
                                <div className="opacity-90">
                                    {message.text.split('\n').slice(1).map((line, i) => <div key={i}>{line}</div>)}
                                </div>
                            </div>
                        ) : message.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                 <div className="max-w-[80%] p-3 rounded-xl bg-gray-100 text-gray-800 rounded-bl-none">
                    <TypingIndicator />
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a health question..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center hover:bg-teal-800 disabled:bg-gray-400 transition-colors shadow-sm"
                aria-label="Send message"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Checker Modal */}
      {isSymptomModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
                  <button 
                    onClick={() => setIsSymptomModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                          <StethoscopeIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">Symptom Checker</h2>
                          <p className="text-xs text-gray-500">AI-powered differential diagnosis tool</p>
                      </div>
                  </div>

                  <form onSubmit={handleSymptomSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                              <input 
                                  type="number" 
                                  required 
                                  value={symptomForm.age}
                                  onChange={(e) => setSymptomForm({...symptomForm, age: e.target.value})}
                                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                                  placeholder="e.g. 30"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                              <select 
                                  value={symptomForm.gender}
                                  onChange={(e) => setSymptomForm({...symptomForm, gender: e.target.value})}
                                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                              >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">How long?</label>
                          <input 
                              type="text" 
                              required 
                              value={symptomForm.duration}
                              onChange={(e) => setSymptomForm({...symptomForm, duration: e.target.value})}
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                              placeholder="e.g. 2 days, 1 week"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Describe Symptoms</label>
                          <textarea 
                              required 
                              rows={4}
                              value={symptomForm.symptoms}
                              onChange={(e) => setSymptomForm({...symptomForm, symptoms: e.target.value})}
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                              placeholder="e.g. Headache, fever, sore throat..."
                          ></textarea>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                          <strong>Disclaimer:</strong> This tool is for informational purposes only and does not replace professional medical advice. In emergencies, call 911 immediately.
                      </div>

                      <button 
                          type="submit"
                          className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-md flex justify-center items-center gap-2"
                      >
                          Run Analysis
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};