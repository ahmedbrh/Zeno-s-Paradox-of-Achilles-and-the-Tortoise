import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Info, Calculator, BookOpen, Lightbulb, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

const ZenoParadox = () => {
  // Configuration State
  const [achillesSpeed, setAchillesSpeed] = useState(10);
  const [tortoiseSpeed, setTortoiseSpeed] = useState(2);
  const [headStart, setHeadStart] = useState(40);
  
  // UI State for Sidebar (Arborescence)
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  
  // Simulation State
  const [achillesPos, setAchillesPos] = useState(0);
  const [tortoisePos, setTortoisePos] = useState(40);
  const [time, setTime] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mode, setMode] = useState('continuous'); // 'continuous' or 'zeno'

  // Refs for animation
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  // Constants
  const catchUpDistance = (achillesSpeed - tortoiseSpeed) > 0 
    ? achillesSpeed * (headStart / (achillesSpeed - tortoiseSpeed)) 
    : Infinity;

  // Reset function
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setAchillesPos(0);
    setTortoisePos(headStart);
    setTime(0);
    setSteps([]);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [headStart]);

  // Update Tortoise start pos when slider changes
  useEffect(() => {
    if (!isRunning && steps.length === 0) {
      setTortoisePos(headStart);
    }
  }, [headStart, isRunning, steps.length]);

  // Continuous Animation Loop
  const animate = useCallback((timestamp) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (timestamp - previousTimeRef.current) / 1000;
      
      setTime(prevTime => {
        const newTime = prevTime + deltaTime;
        const newAchillesPos = achillesSpeed * newTime;
        const newTortoisePos = headStart + (tortoiseSpeed * newTime);

        setAchillesPos(newAchillesPos);
        setTortoisePos(newTortoisePos);

        if (newAchillesPos >= newTortoisePos) {
           setIsFinished(true);
           setIsRunning(false);
           return newTime;
        }

        return newTime;
      });
    }
    previousTimeRef.current = timestamp;
    if (!isFinished) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [achillesSpeed, headStart, isFinished, tortoiseSpeed]);

  useEffect(() => {
    if (isRunning && mode === 'continuous') {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, mode, animate]);

  // Zeno Step Logic
  const nextZenoStep = () => {
    const currentAchillesPos = achillesPos;
    const currentTortoisePos = tortoisePos;
    const distanceToCover = currentTortoisePos - currentAchillesPos;
    
    if (distanceToCover < 0.01) {
      setIsFinished(true);
      return;
    }

    const dt = distanceToCover / achillesSpeed;
    const newTime = time + dt;
    const newAchillesPos = currentTortoisePos;
    const newTortoisePos = currentTortoisePos + (tortoiseSpeed * dt);

    setAchillesPos(newAchillesPos);
    setTortoisePos(newTortoisePos);
    setTime(newTime);
    
    setSteps(prev => [...prev, {
      step: prev.length + 1,
      achillesStart: currentAchillesPos.toFixed(2),
      distanceCovered: distanceToCover.toFixed(2),
      timeTaken: dt.toFixed(4),
      tortoiseMoved: (tortoiseSpeed * dt).toFixed(4)
    }]);
  };

  const getPercentage = (pos) => {
    const maxDisplay = Math.max(100, catchUpDistance * 1.2);
    return Math.min((pos / maxDisplay) * 100, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Zeno's Paradox Visualizer</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Achilles & The Tortoise
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Controls & Docs (Organized Arborescence) */}
          <div className="space-y-4">
            
            {/* 1. Parameters (Collapsible) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button 
                onClick={() => setIsParamsOpen(!isParamsOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <h2 className="text-lg font-semibold flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  Parameters
                </h2>
                {isParamsOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
              </button>
              
              {isParamsOpen && (
                <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Achilles Speed (m/s)</label>
                      <span className="text-sm font-bold text-indigo-600">{achillesSpeed}</span>
                    </div>
                    <input 
                      type="range" min="1" max="100" step="1"
                      value={achillesSpeed} 
                      onChange={(e) => { setAchillesSpeed(Number(e.target.value)); reset(); }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Tortoise Speed (m/s)</label>
                      <span className="text-sm font-bold text-emerald-600">{tortoiseSpeed}</span>
                    </div>
                    <input 
                      type="range" min="0.1" max={Math.max(1, achillesSpeed - 1)} step="0.1"
                      value={tortoiseSpeed} 
                      onChange={(e) => { setTortoiseSpeed(Number(e.target.value)); reset(); }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Head Start (m)</label>
                      <span className="text-sm font-bold text-slate-600">{headStart}</span>
                    </div>
                    <input 
                      type="range" min="1" max="100" 
                      value={headStart} 
                      onChange={(e) => { setHeadStart(Number(e.target.value)); reset(); }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => { setMode('continuous'); reset(); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'continuous' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Real-time
                      </button>
                      <button 
                        onClick={() => { setMode('zeno'); reset(); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'zeno' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Zeno Steps
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {mode === 'continuous' ? (
                        <button 
                          onClick={() => isFinished ? reset() : setIsRunning(!isRunning)}
                          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-white transition-colors ${isFinished ? 'bg-indigo-500 hover:bg-indigo-600' : isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                          {isFinished ? <RotateCcw size={18} /> : isRunning ? <Pause size={18} /> : <Play size={18} />}
                          {isFinished ? 'Restart' : isRunning ? 'Pause' : 'Start Race'}
                        </button>
                      ) : (
                        <button 
                          onClick={nextZenoStep}
                          disabled={isFinished}
                          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
                        >
                          <SkipForward size={18} />
                          Next Step
                        </button>
                      )}
                      
                      <button 
                        onClick={reset}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                        title="Reset"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Educational Documentation (Collapsible) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <button 
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-indigo-500" size={20} />
                    <h3 className="font-bold text-slate-800">The Paradox Guide</h3>
                  </div>
                  {isGuideOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
              </button>

              {isGuideOpen && (
                <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  {/* Concept */}
                  <div className="text-sm text-slate-600">
                    <p className="mb-2"><strong className="text-slate-800">The Core Problem:</strong> Zeno argued that before you can reach a destination, you must get halfway there. Before that, you must get a quarter of the way there, and so on.</p>
                    <p className="italic text-slate-500">"Motion is an illusion because you must complete infinite tasks in finite time."</p>
                  </div>

                  {/* SVG Visualization */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-center text-slate-400 mb-1 uppercase font-bold tracking-wider">The "Infinite Halves" Visualization</div>
                    <svg viewBox="0 0 300 80" className="w-full">
                      <line x1="10" y1="60" x2="290" y2="60" stroke="#cbd5e1" strokeWidth="2" />
                      <circle cx="10" cy="60" r="3" fill="#6366f1" />
                      <circle cx="290" cy="60" r="3" fill="#10b981" />
                      <text x="10" y="75" textAnchor="middle" fontSize="9" fill="#64748b">0</text>
                      <text x="290" y="75" textAnchor="middle" fontSize="9" fill="#64748b">1</text>
                      
                      {/* 1/2 */}
                      <path d="M 10 60 Q 150 10 290 60" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="150" y="25" textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">1/2</text>
                      <line x1="150" y1="55" x2="150" y2="65" stroke="#6366f1" strokeWidth="2" />
                      
                      {/* 1/4 */}
                      <path d="M 150 60 Q 220 30 290 60" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                      <text x="220" y="40" textAnchor="middle" fontSize="8" fill="#8b5cf6">1/4</text>
                      
                       {/* 1/8 */}
                      <path d="M 220 60 Q 255 45 290 60" fill="none" stroke="#d946ef" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real Life Examples</h4>
                     
                     <div className="flex gap-3 items-start">
                       <div className="bg-amber-100 p-1.5 rounded text-amber-600 mt-0.5"><Lightbulb size={14} /></div>
                       <div className="text-xs text-slate-600">
                         <strong className="text-slate-800 block mb-0.5">The Doorway Analogy</strong>
                         If you walk halfway to a door, then stop. Then walk half the remaining distance. You will technically never touch the door. However, in reality, your stride length eventually exceeds the remaining distance.
                       </div>
                     </div>

                     <div className="flex gap-3 items-start">
                       <div className="bg-blue-100 p-1.5 rounded text-blue-600 mt-0.5"><Lightbulb size={14} /></div>
                       <div className="text-xs text-slate-600">
                         <strong className="text-slate-800 block mb-0.5">Pixels & Screens</strong>
                         Zeno assumes space is continuous (can be cut forever). But your screen is discrete (made of pixels). You cannot move "half a pixel". Modern physics suggests our universe might also be "pixelated" at the Planck length!
                       </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center/Right: Visualization (Simulation) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* The Track Visualizer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 min-h-[300px] relative">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-slate-200 shadow-sm">
                Time: {time.toFixed(4)}s
              </div>
              
              {isFinished && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none">
                  <div className="bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg transform animate-bounce">
                    <h3 className="text-xl font-bold text-center">Catch Up!</h3>
                    <p className="text-sm opacity-90 text-center">Achilles overtakes at {time.toFixed(4)}s</p>
                  </div>
                </div>
              )}

              {/* Track Container */}
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                
                {/* Distance Markers */}
                <div className="relative w-full h-8 mb-2 border-b border-slate-300">
                  {[0, 20, 40, 60, 80, 100].map((mark) => (
                    <div 
                      key={mark} 
                      className="absolute bottom-0 h-2 border-l border-slate-400 text-[10px] text-slate-400 pl-1"
                      style={{ left: `${getPercentage(mark)}%` }}
                    >
                      {mark}m
                    </div>
                  ))}

                  {/* Catch up Marker */}
                  {catchUpDistance < 150 && (
                    <div 
                      className="absolute bottom-0 h-full border-l-2 border-dashed border-red-400 z-0"
                      style={{ left: `${getPercentage(catchUpDistance)}%` }}
                    >
                      <span className="absolute -top-4 -translate-x-1/2 text-[10px] text-red-500 font-bold whitespace-nowrap">Catch Up Point</span>
                    </div>
                  )}
                </div>

                {/* Lanes */}
                <div className="relative w-full h-32 bg-slate-100 rounded-lg border-inner shadow-inner overflow-visible">
                  
                  {/* Achilles Lane */}
                  <div className="absolute top-4 left-0 w-full h-10 flex items-center">
                    <div 
                      className="absolute transform -translate-x-1/2 transition-all duration-75 flex flex-col items-center"
                      style={{ left: `${getPercentage(achillesPos)}%` }}
                    >
                      <span className="text-2xl" role="img" aria-label="Achilles">🏃</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-white px-1 rounded shadow-sm border border-indigo-100">Achilles</span>
                      <span className="text-[10px] text-slate-500">{achillesPos.toFixed(1)}m</span>
                    </div>

                    {/* Trailing line */}
                    <div 
                      className="absolute left-0 h-1 bg-indigo-400/30 rounded-full" 
                      style={{ width: `${getPercentage(achillesPos)}%` }}
                    />
                  </div>

                  {/* Tortoise Lane */}
                  <div className="absolute bottom-4 left-0 w-full h-10 flex items-center">
                    <div 
                      className="absolute transform -translate-x-1/2 transition-all duration-75 flex flex-col items-center"
                      style={{ left: `${getPercentage(tortoisePos)}%` }}
                    >
                      <span className="text-2xl" role="img" aria-label="Tortoise">🐢</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-white px-1 rounded shadow-sm border border-emerald-100">Tortoise</span>
                      <span className="text-[10px] text-slate-500">{tortoisePos.toFixed(1)}m</span>
                    </div>

                    {/* Trailing line */}
                    <div 
                      className="absolute left-0 h-1 bg-emerald-400/30 rounded-full" 
                      style={{ width: `${getPercentage(tortoisePos)}%` }}
                    />
                  </div>
                </div>

                {/* Zeno Steps Visualization (Only in Zeno Mode) */}
                {mode === 'zeno' && steps.length > 0 && (
                  <div className="mt-4 h-12 relative w-full overflow-hidden">
                    <div className="text-xs text-slate-400 mb-1">Paradox Steps:</div>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                       {steps.slice(-5).map((step, idx) => (
                         <div key={idx} className="flex-shrink-0 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-[10px] text-yellow-800">
                            Step {step.step}: Δt={step.timeTaken}s
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis / Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-[200px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Info size={18} className="text-slate-400" />
                  {mode === 'zeno' ? 'Step-by-Step Analysis' : 'Live Data Stream'}
                </h3>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-600 overflow-y-auto flex-1 border border-slate-100 h-48">
                {mode === 'continuous' ? (
                   <div className="space-y-2">
                     <p>Status: {isRunning ? 'Running...' : isFinished ? 'Finished' : 'Ready'}</p>
                     <p>Time Elapsed: {time.toFixed(4)}s</p>
                     <p>Separation: {Math.max(0, tortoisePos - achillesPos).toFixed(4)}m</p>
                     {isFinished && <p className="text-emerald-600 font-bold mt-2">Simulation Complete: The "real world" solution (calculus) proves they meet.</p>}
                   </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200">
                        <th className="pb-2 font-normal">Step</th>
                        <th className="pb-2 font-normal">Action</th>
                        <th className="pb-2 font-normal">Time Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.length === 0 && (
                        <tr><td colSpan="3" className="pt-4 text-center italic opacity-50">Click "Next Step" to see Zeno's logic in action.</td></tr>
                      )}
                      {steps.map((s, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 text-indigo-600 font-bold">{s.step}</td>
                          <td className="py-2">Achilles runs {s.distanceCovered}m</td>
                          <td className="py-2 text-slate-500">+{s.timeTaken}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ZenoParadox;

