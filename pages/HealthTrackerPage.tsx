import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HealthMetric, MetricType, UserProfile, WellnessPlan } from '../types';
import { HeartIcon, ScaleIcon, DropIcon, ActivityIcon, PlusIcon, DumbbellIcon } from '../components/icons/HealthIcons';
import { DiamondIcon, BrainIcon, KidneyIcon, ScanIcon, CameraLensIcon, SeniorIcon, LockOpenIcon, UtensilsIcon } from '../components/icons/WellnessPlusIcons';
import { analyzeHealthImage, generateMealPlan, generateHealthInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useData } from '../contexts/DataContext';

// --- Type Definitions for Charts & Props ---
interface MetricStatus {
  status: 'Normal' | 'Elevated' | 'High' | 'Low' | 'Good' | 'Unknown';
  color: string;
  message: string;
  textColor: string;
}

interface ChartPoint {
    date: Date;
    value: number;
    value2?: number; // For BP diastolic
}

// --- Status Logic Helper ---
const getHealthStatus = (type: MetricType, value: string): MetricStatus => {
  if (!value) return { status: 'Unknown', color: 'bg-gray-100', textColor: 'text-gray-600', message: 'No data' };

  const num = parseFloat(value);
  
  switch (type) {
    case 'Blood Pressure':
      const [sys, dia] = value.split('/').map(Number);
      if (!sys || !dia) return { status: 'Unknown', color: 'bg-gray-100', textColor: 'text-gray-600', message: 'Invalid format' };
      if (sys < 120 && dia < 80) return { status: 'Normal', color: 'bg-green-100', textColor: 'text-green-800', message: 'Healthy Range' };
      if (sys < 130 && dia < 80) return { status: 'Elevated', color: 'bg-yellow-100', textColor: 'text-yellow-800', message: 'Slightly Elevated' };
      return { status: 'High', color: 'bg-red-100', textColor: 'text-red-800', message: 'Consult Doctor' };
    
    case 'Heart Rate':
      if (num >= 60 && num <= 100) return { status: 'Normal', color: 'bg-green-100', textColor: 'text-green-800', message: 'Normal RHR' };
      return { status: 'High', color: 'bg-orange-100', textColor: 'text-orange-800', message: 'Outside Range' }; // Simple check
      
    case 'Glucose':
      // Assuming random glucose for simplicity, or we can assume fasting. 
      // 70-140 is generally safe "random" range for non-diabetics.
      if (num >= 70 && num <= 140) return { status: 'Normal', color: 'bg-green-100', textColor: 'text-green-800', message: 'Normal Range' };
      if (num > 140) return { status: 'High', color: 'bg-orange-100', textColor: 'text-orange-800', message: 'Elevated' };
      return { status: 'Low', color: 'bg-red-100', textColor: 'text-red-800', message: 'Low Sugar' };

    case 'Temperature':
      if (num >= 36.1 && num <= 37.2) return { status: 'Normal', color: 'bg-green-100', textColor: 'text-green-800', message: 'Normal Temp' };
      if (num > 37.5) return { status: 'High', color: 'bg-red-100', textColor: 'text-red-800', message: 'Fever Detected' };
      return { status: 'Unknown', color: 'bg-gray-100', textColor: 'text-gray-600', message: 'Check Reading' };

    case 'Exercise Activity':
        if (num >= 30) return { status: 'Good', color: 'bg-green-100', textColor: 'text-green-800', message: 'Daily Goal Met' };
        return { status: 'Low', color: 'bg-yellow-100', textColor: 'text-yellow-800', message: 'Keep Moving' };
      
    default:
      return { status: 'Unknown', color: 'bg-gray-100', textColor: 'text-gray-600', message: 'Tracked' };
  }
};

// --- Helper to map string icons to components ---
const getPlanIcon = (iconName: string) => {
    switch (iconName) {
        case 'drop': return <DropIcon className="w-8 h-8 text-blue-600" />;
        case 'heart': return <HeartIcon className="w-8 h-8 text-rose-600" />;
        case 'kidney': return <KidneyIcon className="w-8 h-8 text-amber-600" />;
        case 'senior': return <SeniorIcon className="w-8 h-8 text-indigo-600" />;
        case 'brain': return <BrainIcon className="w-8 h-8 text-purple-600" />;
        default: return <DiamondIcon className="w-8 h-8 text-teal-600" />;
    }
};

// --- Components ---

const MetricCard: React.FC<{ title: string; value: string; unit: string; icon: React.ReactNode; type: MetricType; date?: string; notes?: string }> = ({ title, value, unit, icon, type, date, notes }) => {
  const { status, color, textColor, message } = getHealthStatus(type, value);
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-transform hover:-translate-y-1 duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-50`}>
             <div className="text-gray-700">{icon}</div>
        </div>
        {value && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${color} ${textColor}`}>
                {status}
            </span>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline space-x-1">
          <h3 className="text-2xl font-bold text-gray-800">{value || '--'}</h3>
          <span className="text-sm text-gray-500 font-medium">{unit}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex justify-between items-center">
             <span>{date ? `Last: ${date}` : 'No data yet'}</span>
        </p>
        {type === 'Exercise Activity' && notes ? (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{notes.split('. ')[0]}</p>
        ) : (
            value && <p className={`text-xs mt-1 ${textColor}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

const BMICard: React.FC<{ weight?: string, height?: string }> = ({ weight, height }) => {
    const bmi = useMemo(() => {
        if (!weight || !height) return null;
        const w = parseFloat(weight);
        const h = parseFloat(height) / 100; // cm to m
        if (h <= 0 || w <= 0) return null;
        return (w / (h * h)).toFixed(1);
    }, [weight, height]);

    let status = 'Unknown';
    let color = 'text-gray-600';
    let bgColor = 'bg-gray-100';
    let percentage = 0;

    if (bmi) {
        const val = parseFloat(bmi);
        if (val < 18.5) { status = 'Underweight'; color = 'text-blue-600'; bgColor = 'bg-blue-100'; }
        else if (val < 25) { status = 'Normal Weight'; color = 'text-green-600'; bgColor = 'bg-green-100'; }
        else if (val < 30) { status = 'Overweight'; color = 'text-orange-600'; bgColor = 'bg-orange-100'; }
        else { status = 'Obese'; color = 'text-red-600'; bgColor = 'bg-red-100'; }
        
        // Calculate percentage for slider position. Range 15 to 40 covers most use cases.
        // 15 represents 0%, 40 represents 100%
        percentage = Math.max(0, Math.min(100, ((val - 15) / 25) * 100));
    }

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-transform hover:-translate-y-1 duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-teal-50">
                    <ScaleIcon className="w-6 h-6 text-teal-700"/>
                </div>
                 {bmi && <span className={`px-2 py-1 rounded-full text-xs font-bold ${bgColor} ${color}`}>{status}</span>}
            </div>
             <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Body Mass Index (BMI)</p>
                <div className="flex items-baseline space-x-1">
                    <h3 className="text-2xl font-bold text-gray-800">{bmi || '--'}</h3>
                </div>
                
                {bmi ? (
                    <div className="mt-4">
                        {/* Gauge Bar */}
                        <div className="relative h-3 rounded-full overflow-hidden flex w-full">
                            <div className="h-full bg-blue-300 w-[14%]" title="Underweight (<18.5)"></div> 
                            <div className="h-full bg-green-400 w-[26%]" title="Normal (18.5-25)"></div> 
                            <div className="h-full bg-orange-300 w-[20%]" title="Overweight (25-30)"></div> 
                            <div className="h-full bg-red-400 w-[40%]" title="Obese (>30)"></div>
                        </div>
                        
                        {/* Indicator */}
                        <div className="relative w-full h-3 -mt-3 mb-1">
                            <div 
                                className="absolute top-0 h-4 w-1 bg-gray-800 rounded-full border border-white -ml-0.5 shadow transition-all duration-700 ease-out -translate-y-0.5" 
                                style={{ left: `${percentage}%` }}
                            ></div>
                        </div>
                        
                        {/* Scale Ticks */}
                        <div className="relative h-4 w-full text-[10px] text-gray-400 font-medium mt-1">
                            <span className="absolute left-0">15</span>
                            <span className="absolute left-[14%] -translate-x-1/2">18.5</span>
                            <span className="absolute left-[40%] -translate-x-1/2">25</span>
                            <span className="absolute left-[60%] -translate-x-1/2">30</span>
                            <span className="absolute right-0">40</span>
                        </div>
                    </div>
                ) : (
                     !height ? (
                        <div className="mt-3 bg-orange-50 p-2 rounded border border-orange-100">
                            <p className="text-xs text-orange-700 font-medium">Add height in Profile to see your BMI.</p>
                        </div>
                    ) : (
                         <p className="text-xs text-gray-400 mt-2">Log your weight to calculate.</p>
                    )
                )}
            </div>
        </div>
    )
}

const TrendChart: React.FC<{ data: HealthMetric[], type: MetricType }> = ({ data, type }) => {
    const chartData = useMemo(() => {
        return data
            .filter(d => d.type === type)
            .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
            .map(d => {
                const date = new Date(`${d.date} ${d.time}`);
                if (type === 'Blood Pressure') {
                    const [sys, dia] = d.value.split('/').map(Number);
                    return { date, value: sys, value2: dia };
                }
                return { date, value: parseFloat(d.value) };
            })
            .slice(-10); // Last 10 points
    }, [data, type]);

    if (chartData.length < 2) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Log at least 2 entries to see trends.</p>
            </div>
        );
    }

    // Chart Dimensions
    const width = 600;
    const height = 250;
    const padding = 40;

    // Scaling
    const allValues = chartData.flatMap(d => d.value2 ? [d.value, d.value2] : [d.value]);
    const minVal = Math.min(...allValues) * 0.9;
    const maxVal = Math.max(...allValues) * 1.1;
    
    const xScale = (index: number) => padding + (index / (chartData.length - 1)) * (width - padding * 2);
    const yScale = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);

    const generatePath = (values: number[]) => {
        return values.map((val, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(val)}`).join(' ');
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                     {/* Grid Lines */}
                     {[0, 0.25, 0.5, 0.75, 1].map(t => {
                         const y = padding + t * (height - padding * 2);
                         return <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4" />;
                     })}

                     {/* Lines */}
                    <path 
                        d={generatePath(chartData.map(d => d.value))} 
                        fill="none" 
                        stroke="#0f766e" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                    />
                    {type === 'Blood Pressure' && (
                        <path 
                            d={generatePath(chartData.map(d => d.value2!))} 
                            fill="none" 
                            stroke="#f43f5e" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeDasharray="5,5"
                        />
                    )}

                    {/* Data Points */}
                    {chartData.map((d, i) => (
                        <g key={i}>
                            <circle cx={xScale(i)} cy={yScale(d.value)} r="4" fill="white" stroke="#0f766e" strokeWidth="2" />
                            <text x={xScale(i)} y={yScale(d.value) - 10} textAnchor="middle" fontSize="10" fill="#374151">{d.value}</text>
                            
                            {d.value2 && (
                                <>
                                    <circle cx={xScale(i)} cy={yScale(d.value2)} r="4" fill="white" stroke="#f43f5e" strokeWidth="2" />
                                    <text x={xScale(i)} y={yScale(d.value2) + 15} textAnchor="middle" fontSize="10" fill="#374151">{d.value2}</text>
                                </>
                            )}
                            
                            {/* X Axis Labels */}
                            <text x={xScale(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">
                                {d.date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="flex justify-center mt-4 gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-700 rounded-full"></div>
                    <span className="text-gray-600">{type === 'Blood Pressure' ? 'Systolic' : 'Value'}</span>
                </div>
                {type === 'Blood Pressure' && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                        <span className="text-gray-600">Diastolic</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Wellness Plus Component ---
const WellnessPlusTab: React.FC = () => {
    const { wellnessPlans } = useData(); // Get dynamic plans from context
    const [activePlan, setActivePlan] = useState<WellnessPlan | null>(null);
    const [imgAnalysisResult, setImgAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<'food' | 'barcode'>('food');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Meal Plan Generator State
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [mealPlanResult, setMealPlanResult] = useState<string | null>(null);

    const handlePlanClick = (plan: WellnessPlan) => {
        setActivePlan(plan);
        // Reset generator state when opening a new plan
        setMealPlanResult(null);
        setIsGeneratingPlan(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024 * 4) { 
                alert("Image size should be less than 4MB");
                return;
            }
            setIsAnalyzing(true);
            setImgAnalysisResult(null);
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await analyzeHealthImage(base64, analysisMode);
                setImgAnalysisResult(result);
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateMealPlan = async () => {
        if (!activePlan) return;
        setIsGeneratingPlan(true);
        setMealPlanResult(null);
        
        const plan = await generateMealPlan(activePlan.title, activePlan.dietYes, activePlan.dietNo);
        setMealPlanResult(plan);
        setIsGeneratingPlan(false);
    };

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Banner */}
            <div className="bg-gradient-to-r from-teal-800 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <DiamondIcon className="w-8 h-8 text-yellow-300" />
                        Wellness Plus
                    </h2>
                    <p className="text-teal-100 max-w-xl">
                        Unlock advanced AI lifestyle management tailored for specific health conditions. 
                        Get personalized diet plans, AI food analysis, and barcode scanning.
                    </p>
                </div>
                <div className="mt-6 md:mt-0">
                    <button className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-300 transition-colors transform hover:scale-105">
                        Upgrade Now
                    </button>
                </div>
            </div>

            {/* AI Tools Section */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BrainIcon className="w-6 h-6 text-teal-600" />
                    AI Health Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Food Lens */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-full text-green-700">
                                <CameraLensIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Smart Food Lens</h4>
                                <p className="text-sm text-gray-500">Snap a photo to get calories & macros.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setAnalysisMode('food'); fileInputRef.current?.click(); }}
                            className="w-full py-2 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                        >
                            {isAnalyzing && analysisMode === 'food' ? 'Analyzing...' : 'Upload Food Image'}
                        </button>
                    </div>

                    {/* Barcode Scanner */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-purple-100 p-3 rounded-full text-purple-700">
                                <ScanIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Barcode Scout</h4>
                                <p className="text-sm text-gray-500">Scan product labels for instant insights.</p>
                            </div>
                        </div>
                        <button 
                             onClick={() => { setAnalysisMode('barcode'); fileInputRef.current?.click(); }}
                            className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                        >
                             {isAnalyzing && analysisMode === 'barcode' ? 'Reading...' : 'Scan Barcode / Label'}
                        </button>
                    </div>
                </div>
                
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />

                {/* Analysis Result */}
                {imgAnalysisResult && (
                    <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border-l-4 border-teal-500 animate-fadeIn">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <BrainIcon className="w-5 h-5 text-teal-600"/>
                            AI Analysis Result
                        </h4>
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {imgAnalysisResult}
                            </ReactMarkdown>
                        </div>
                        <button 
                            onClick={() => setImgAnalysisResult(null)}
                            className="mt-4 text-sm text-gray-500 underline hover:text-teal-600"
                        >
                            Clear Result
                        </button>
                    </div>
                )}
            </section>

            {/* Personalized Plans Grid */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Select Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wellnessPlans.map(plan => (
                        <div 
                            key={plan.id}
                            onClick={() => handlePlanClick(plan)}
                            className={`bg-white rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${activePlan?.id === plan.id ? 'border-teal-500 shadow-lg' : 'border-transparent shadow-sm'}`}
                        >
                            <div className={`${plan.color} p-6 rounded-t-xl flex flex-col items-center text-center gap-3`}>
                                <div className="p-3 bg-white bg-opacity-60 rounded-full shadow-sm backdrop-blur-sm">
                                    {getPlanIcon(plan.iconName)}
                                </div>
                                <h4 className="font-bold text-xl">{plan.title}</h4>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 text-sm mb-4 text-center">{plan.description}</p>
                                <button className="w-full py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2">
                                    <LockOpenIcon className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Active Plan Detail Modal */}
            {activePlan && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative my-8">
                        <button 
                            onClick={() => setActivePlan(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 bg-white rounded-full shadow-sm"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className={`${activePlan.color} p-8 rounded-t-2xl flex items-center gap-6`}>
                            <div className="p-4 bg-white bg-opacity-80 rounded-full shadow-lg">
                                {getPlanIcon(activePlan.iconName)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{activePlan.title} Plan</h2>
                                <p className="opacity-90 font-medium">Wellness Plus Premium</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <section>
                                <h4 className="font-bold text-gray-800 text-lg mb-2">Lifestyle Approach</h4>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {activePlan.lifestyle}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        What to Eat
                                    </h4>
                                    <ul className="space-y-2">
                                        {activePlan.dietYes.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        What to Avoid
                                    </h4>
                                    <ul className="space-y-2">
                                        {activePlan.dietNo.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Meal Plan Generator Section */}
                            <section className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                            <UtensilsIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Daily Meal Plan Generator</h4>
                                            <p className="text-xs text-gray-500">Get a 1-day menu with macros tailored to this plan.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleGenerateMealPlan}
                                        disabled={isGeneratingPlan}
                                        className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white font-bold rounded-lg shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isGeneratingPlan ? 'Generating...' : 'Generate Plan'}
                                    </button>
                                </div>
                                
                                {mealPlanResult && (
                                    <div className="mt-4 bg-white p-4 rounded-lg border border-orange-200 animate-fadeIn">
                                        <div className="prose prose-sm max-w-none text-gray-700">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {mealPlanResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                                <div>
                                    <p className="font-bold text-indigo-900">Subscribe to {activePlan.title}</p>
                                    <p className="text-xs text-indigo-700">$9.99/month - Cancel anytime</p>
                                </div>
                                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Page Component ---
export const HealthTrackerPage: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'history' | 'plus'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trendMetric, setTrendMetric] = useState<MetricType>('Blood Pressure');
  
  // Insights State
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightResult, setInsightResult] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<MetricType>('Blood Pressure');
  const [value1, setValue1] = useState(''); // e.g., Systolic, simple value, or duration
  const [value2, setValue2] = useState(''); // e.g., Diastolic (only for BP)
  const [activityType, setActivityType] = useState(''); // For Exercise
  const [intensity, setIntensity] = useState('Moderate'); // For Exercise
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const storedMetrics = localStorage.getItem('userHealthMetrics');
      if (storedMetrics) setMetrics(JSON.parse(storedMetrics));
      
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('userHealthMetrics', JSON.stringify(metrics));
    } catch (error) {
      console.error("Failed to save metrics", error);
    }
  }, [metrics]);

  const getLatestMetric = (type: MetricType): HealthMetric | undefined => {
    return metrics
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())[0];
  };

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalValue = value1;
    let finalNotes = notes;

    if (selectedType === 'Blood Pressure') {
      if (!value1 || !value2) return;
      finalValue = `${value1}/${value2}`;
    } else if (selectedType === 'Exercise Activity') {
        if (!value1 || !activityType) return;
        // Construct notes to include activity details
        const activityDetails = `Type: ${activityType}, Intensity: ${intensity}.`;
        finalNotes = finalNotes ? `${activityDetails} ${finalNotes}` : activityDetails;
    }

    const now = new Date();
    const newMetric: HealthMetric = {
      id: Date.now(),
      type: selectedType,
      value: finalValue,
      unit: getUnit(selectedType),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: finalNotes
    };

    setMetrics(prev => [newMetric, ...prev]);
    closeModal();
  };

  const handleDeleteMetric = (id: number) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
  };

  const handleGenerateInsights = async () => {
      setIsGeneratingInsights(true);
      setInsightResult(null);

      // Gather latest metrics
      const metricTypes: MetricType[] = ['Blood Pressure', 'Heart Rate', 'Glucose', 'Weight', 'Temperature', 'Exercise Activity'];
      const latestMetrics = metricTypes.map(type => getLatestMetric(type)).filter(Boolean);

      const result = await generateHealthInsights(userProfile || {}, latestMetrics);
      setInsightResult(result);
      setIsGeneratingInsights(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setValue1('');
    setValue2('');
    setActivityType('');
    setIntensity('Moderate');
    setNotes('');
    setSelectedType('Blood Pressure');
  };

  const getUnit = (type: MetricType) => {
    switch (type) {
      case 'Blood Pressure': return 'mmHg';
      case 'Heart Rate': return 'bpm';
      case 'Glucose': return 'mg/dL';
      case 'Weight': return 'kg';
      case 'Temperature': return '°C';
      case 'Exercise Activity': return 'mins';
      default: return '';
    }
  };

  const latestBP = getLatestMetric('Blood Pressure');
  const latestHR = getLatestMetric('Heart Rate');
  const latestGlucose = getLatestMetric('Glucose');
  const latestWeight = getLatestMetric('Weight');
  const latestTemp = getLatestMetric('Temperature');
  const latestExercise = getLatestMetric('Exercise Activity');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wellness</h1>
           <p className="text-gray-600">Monitor your vital signs and keep a log of your wellness progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors flex items-center gap-2 font-semibold shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          Log New Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-2xl overflow-x-auto">
         {['overview', 'trends', 'history'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
             </button>
         ))}
         <button
            onClick={() => setActiveTab('plus')}
            className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'plus' ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:bg-indigo-50'}`}
         >
             <DiamondIcon className="w-4 h-4" />
             Wellness+
         </button>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
            {/* Personal Health Insights Section */}
            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-100 p-2 rounded-full text-teal-700">
                            {/* Sparkles/Lightbulb Icon */}
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Personalized AI Insights</h3>
                            <p className="text-sm text-gray-500">Get tips based on your recent vitals.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerateInsights}
                        disabled={isGeneratingInsights}
                        className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isGeneratingInsights ? 'Analyzing...' : 'Analyze My Health'}
                    </button>
                </div>
                
                {insightResult && (
                    <div className="bg-white p-5 rounded-lg border border-teal-100 animate-fadeIn">
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {insightResult}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <MetricCard 
                title="Blood Pressure" 
                value={latestBP?.value || ''} 
                unit="mmHg" 
                date={latestBP?.date}
                type="Blood Pressure"
                icon={<ActivityIcon className="w-6 h-6 text-rose-600"/>}
                />
                <MetricCard 
                title="Heart Rate" 
                value={latestHR?.value || ''} 
                unit="bpm" 
                date={latestHR?.date}
                type="Heart Rate"
                icon={<HeartIcon className="w-6 h-6 text-pink-600"/>}
                />
                <MetricCard 
                title="Glucose Level" 
                value={latestGlucose?.value || ''} 
                unit="mg/dL" 
                date={latestGlucose?.date}
                type="Glucose"
                icon={<DropIcon className="w-6 h-6 text-blue-600"/>}
                />
                <BMICard weight={latestWeight?.value} height={userProfile?.height} />
                <MetricCard 
                    title="Weight" 
                    value={latestWeight?.value || ''} 
                    unit="kg" 
                    date={latestWeight?.date}
                    type="Weight"
                    icon={<ScaleIcon className="w-6 h-6 text-teal-600"/>}
                />
                 <MetricCard 
                    title="Temperature" 
                    value={latestTemp?.value || ''} 
                    unit="°C" 
                    date={latestTemp?.date}
                    type="Temperature"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
                <MetricCard 
                    title="Exercise Activity" 
                    value={latestExercise?.value || ''} 
                    unit="mins" 
                    date={latestExercise?.date}
                    type="Exercise Activity"
                    notes={latestExercise?.notes}
                    icon={<DumbbellIcon className="w-6 h-6 text-indigo-600"/>}
                />
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                 <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <div>
                     <h3 className="text-sm font-bold text-blue-800">Health Tip</h3>
                     <p className="text-sm text-blue-700 mt-1">Consistent monitoring is key. Try to log your vitals at the same time each day for the most accurate trend analysis.</p>
                 </div>
            </div>
        </div>
      )}

      {/* --- TRENDS TAB --- */}
      {activeTab === 'trends' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-lg font-bold text-gray-800">Trends Over Time</h2>
                  <select 
                    value={trendMetric}
                    onChange={(e) => setTrendMetric(e.target.value as MetricType)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                      <option value="Blood Pressure">Blood Pressure</option>
                      <option value="Heart Rate">Heart Rate</option>
                      <option value="Glucose">Glucose</option>
                      <option value="Weight">Weight</option>
                      <option value="Temperature">Temperature</option>
                      <option value="Exercise Activity">Exercise Activity</option>
                  </select>
              </div>
              <TrendChart data={metrics} type={trendMetric} />
          </div>
      )}

      {/* --- HISTORY TAB --- */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Full History Log</h2>
                <span className="text-xs text-gray-500">{metrics.length} entries found</span>
            </div>
            <div className="overflow-x-auto">
            {metrics.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="font-medium text-gray-900">{metric.date}</div>
                        <div className="text-xs text-gray-400">{metric.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${metric.type === 'Blood Pressure' ? 'bg-rose-100 text-rose-800' : 
                            metric.type === 'Glucose' ? 'bg-blue-100 text-blue-800' :
                            metric.type === 'Heart Rate' ? 'bg-pink-100 text-pink-800' :
                            metric.type === 'Weight' ? 'bg-teal-100 text-teal-800' : 
                            metric.type === 'Exercise Activity' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-orange-100 text-orange-800'}`}>
                            {metric.type}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        {metric.value} <span className="text-xs font-normal text-gray-500">{metric.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell max-w-xs truncate">
                        {metric.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => handleDeleteMetric(metric.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <div className="p-12 text-center text-gray-500 bg-white">
                    <p className="mb-4">No health logs found.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-teal-700 font-semibold hover:underline"
                    >
                        Log your first entry now
                    </button>
                </div>
            )}
            </div>
        </div>
      )}

      {/* --- WELLNESS PLUS TAB --- */}
      {activeTab === 'plus' && <WellnessPlusTab />}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative transform transition-all scale-100">
             <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 mb-6">Log Health Metric</h2>
            
            <form onSubmit={handleAddMetric} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Metric Type</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => {
                    setSelectedType(e.target.value as MetricType);
                    setValue1('');
                    setValue2('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Glucose">Glucose</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Weight">Weight</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Exercise Activity">Exercise Activity</option>
                </select>
              </div>

              {selectedType === 'Blood Pressure' ? (
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Systolic</label>
                      <div className="relative">
                        <input 
                            type="number" 
                            required
                            value={value1}
                            onChange={(e) => setValue1(e.target.value)}
                            placeholder="120"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                         <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">mmHg</span>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Diastolic</label>
                      <div className="relative">
                        <input 
                            type="number" 
                            required
                            value={value2}
                            onChange={(e) => setValue2(e.target.value)}
                            placeholder="80"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                         <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">mmHg</span>
                      </div>
                   </div>
                 </div>
              ) : selectedType === 'Exercise Activity' ? (
                 <>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Activity Type</label>
                        <input 
                            type="text" 
                            required
                            value={activityType}
                            onChange={(e) => setActivityType(e.target.value)}
                            placeholder="e.g. Running, Yoga, Cycling"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    required
                                    value={value1}
                                    onChange={(e) => setValue1(e.target.value)}
                                    placeholder="30"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <span className="absolute right-3 top-2 text-sm text-gray-500 font-medium">mins</span>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1">Intensity</label>
                             <select
                                value={intensity}
                                onChange={(e) => setIntensity(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                             >
                                 <option value="Low">Low</option>
                                 <option value="Moderate">Moderate</option>
                                 <option value="High">High</option>
                             </select>
                        </div>
                    </div>
                 </>
              ) : (
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
                   <div className="relative">
                        <input 
                            type="number" 
                            step="any"
                            required
                            value={value1}
                            onChange={(e) => setValue1(e.target.value)}
                            placeholder="Enter value"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="absolute right-3 top-2 text-sm text-gray-500 font-medium">{getUnit(selectedType)}</span>
                   </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., After breakfast"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                 <button 
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-semibold shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};