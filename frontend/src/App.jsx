// import React, { useState, useRef } from 'react';
// import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Download, Wifi, Eye, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';

// const DefectoMCUDashboardV7 = () => {
//   // --- States ---
//   const [systemState, setSystemState] = useState('idle');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
//   const [notification, setNotification] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- Handlers ---

//   const handleSensorTrigger = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSelectedImage(imageUrl);
//       setVerificationStatus(null);
//       startAnalysis(imageUrl, file);
//     }
//   };

//   // This function now calls the Python Backend
//   const startAnalysis = async (imageUrl, file) => {
//     setSystemState('capturing');
//     showNotification("Sensor Detected Object. Capturing Image...");

//     setTimeout(async () => {
//         setSystemState('analyzing');
//         showNotification("Sending to Neural Engine (best.pt)...");

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             // API CALL TO PYTHON BACKEND
//             const response = await fetch('http://127.0.0.1:8000/predict', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Backend connection failed");

//             const resultData = await response.json();
            
//             // Add image URL for display
//             resultData.imageUrl = imageUrl; 
            
//             processResult(resultData);

//         } catch (error) {
//             console.error(error);
//             showNotification("Backend Error: Ensure 'main.py' is running!");
//             // Fallback Simulation for demo
//             simulateFallbackResult(imageUrl); 
//         }
//     }, 1500);
//   };

//   const processResult = (resultData) => {
//     setCurrentResult(resultData);
//     setSystemState('result');
    
//     const isGood = resultData.color === 'green';
    
//     setStats(prev => ({
//       total: prev.total + 1,
//       passed: isGood ? prev.passed + 1 : prev.passed,
//       defective: !isGood ? prev.defective + 1 : prev.defective
//     }));
    
//     setLogs(prev => [resultData, ...prev].slice(0, 10));
//     showNotification(`Analysis Complete: ${resultData.status}`);
//   };

//   // Fallback if Python backend is not running
//   const simulateFallbackResult = (imageUrl) => {
//       const fallbackData = {
//           id: `DEMO-${Math.floor(Math.random()*1000)}`,
//           status: 'BACKEND ERROR',
//           details: 'Check Python Server',
//           color: 'red',
//           timestamp: new Date().toLocaleTimeString(),
//           confidence: 0,
//           imageUrl: imageUrl,
//           boundingBox: null
//       };
//       processResult(fallbackData);
//   };

//   // --- Utility Functions ---
//   const handleDownloadLabel = () => {
//     if (!currentResult) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = 400; canvas.height = 200;
//     const ctx = canvas.getContext('2d');
    
//     ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,200);
//     ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,190);
    
//     ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
//     ctx.fillText('DefectoMCU Inspection System', 20, 35);
//     ctx.font = '14px monospace'; ctx.fillStyle = '#333';
//     ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
//     ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
//     ctx.font = 'bold 32px Arial'; 
//     ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
//     ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
//     ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
//     ctx.fillText(`Detected Class:`, 140, 95); 
//     ctx.font = '16px Courier New'; 
//     const displayClass = currentResult.details.length > 25 ? currentResult.details.substring(0,24)+'...' : currentResult.details;
//     ctx.fillText(`${displayClass}`, 140, 115);
    
//     ctx.font = 'italic 12px Arial'; ctx.fillStyle = '#555';
//     ctx.fillText(`Confidence: ${currentResult.confidence}%`, 140, 135);

//     ctx.fillStyle = '#000'; 
//     for(let i=20; i<370; i+=6) if(Math.random() > 0.1) ctx.fillRect(i, 160, 3, 25);
    
//     const link = document.createElement('a');
//     link.download = `${currentResult.id}_label.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   const handleExportCSV = () => {
//     if (logs.length === 0) { showNotification("No data to export."); return; }
//     const headers = ["ID", "Time", "Status", "Class", "Confidence"];
//     const csvContent = [
//         headers.join(","),
//         ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.confidence}%`)
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `logs.csv`;
//     link.click();
//   };

//   const handleReset = () => {
//     setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     showNotification("System Reset. Sensor Active.");
//   };

//   const handleVerification = (isCorrect) => {
//       setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
//       showNotification(isCorrect ? "Verified: Correct" : "Flagged: Model Error");
//   }

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-6 overflow-hidden flex flex-col">
//       <header className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
//         <div className="flex items-center gap-3">
//           <div className="bg-blue-600 p-2 rounded-lg shadow-blue-500/20 shadow-lg"><Cpu size={24} className="text-white" /></div>
//           <div><h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">DefectoMCU Monitor V7 (Live AI)</h1><p className="text-xs text-slate-400 flex items-center gap-1"><Wifi size={10} className="text-green-400" /> Connected to Neural Engine</p></div>
//         </div>
//         <div className="flex items-center gap-6"><div className="text-right"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div><div className="flex items-center justify-end gap-2"><span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span><span className="font-mono text-sm font-bold text-blue-200">{systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}</span></div></div><div className="h-8 w-[1px] bg-slate-700"></div><Power size={20} className="text-slate-500 hover:text-white cursor-pointer transition-colors" /></div>
//       </header>

//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
//         <section className="lg:col-span-8 flex flex-col gap-6">
//           <div className="bg-black rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl relative aspect-video flex items-center justify-center group">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black z-0">
//                {systemState === 'idle' && (<div className="w-full h-full flex flex-col items-center justify-center opacity-30"><Eye size={64} className="text-green-500/50 animate-pulse mb-4" /><div className="text-green-500/50 font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR SEARCHING...</div><div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.05)_50%)] bg-[length:100%_4px]"></div></div>)}
//             </div>
//             {selectedImage && (<img src={selectedImage} alt="Captured PCB" className={`w-full h-full object-contain z-10 transition-opacity duration-500 ${systemState === 'capturing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} />)}
//             {systemState === 'capturing' && (<div className="absolute inset-0 bg-white/10 z-20 flex items-center justify-center"><div className="absolute inset-0 border-[20px] border-white/20 animate-pulse"></div><Camera size={48} className="text-white animate-bounce" /></div>)}
//             {systemState === 'analyzing' && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"><div className="relative w-64 h-64 border-2 border-blue-500/50 rounded-lg overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] animate-[scan_1.5s_linear_infinite]"></div></div><div className="mt-4 flex items-center gap-2 text-blue-300 font-mono"><Activity size={16} className="animate-spin" /><span>YOLOv8 Inference Running...</span></div></div>)}
            
//             {/* Real Bounding Box Result */}
//             {systemState === 'result' && currentResult && (
//                <div className="absolute inset-0 z-20">
//                    {currentResult.boundingBox && (
//                       <div className="absolute border-4 border-red-500 shadow-[0_0_20px_red] transition-all duration-500"
//                            style={{
//                             top: currentResult.boundingBox.top,
//                             left: currentResult.boundingBox.left,
//                             width: currentResult.boundingBox.width,
//                             height: currentResult.boundingBox.height
//                            }}>
//                          <span className="absolute -top-8 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 shadow-md">
//                              {currentResult.details} ({currentResult.confidence}%)
//                          </span>
//                       </div>
//                    )}
//                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border ${currentResult.color === 'green' ? 'bg-green-900/60 border-green-500' : 'bg-red-900/60 border-red-500'}`}>
//                        <div className="flex items-center gap-3">{currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}<div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div><div className="text-xs text-slate-300 font-mono flex items-center gap-2"><span>Class: {currentResult.details}</span></div></div></div>
//                        <div className="text-right"><div className="text-[10px] text-slate-400 uppercase tracking-widest">Confidence</div><div className={`text-xl font-black ${currentResult.confidence > 90 ? 'text-green-400' : 'text-yellow-400'}`}>{currentResult.confidence}%</div></div>
//                    </div>
//                </div>
//             )}
//             <div className="absolute top-4 left-4 bg-red-600/80 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//              <div className="relative group"><input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" disabled={systemState !== 'idle'} /><label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${systemState === 'idle' ? 'bg-blue-600 border-blue-500 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25' : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'}`}><Scan size={24} className="text-white mb-2" /><span className="font-bold text-white text-sm">Trigger Sensor</span><span className="text-[10px] text-blue-200">(Upload Image)</span></label></div>
//              <button onClick={handleReset} className="bg-slate-800 border border-slate-700 hover:border-red-500 hover:bg-red-500/10 rounded-xl p-4 flex flex-col items-center justify-center transition-colors group"><RotateCcw size={24} className="text-slate-400 group-hover:text-red-400 transition-transform group-hover:-rotate-180" /><span className="mt-2 text-sm font-medium text-slate-300 group-hover:text-red-300">Reset System</span></button>
//              <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border-2 transition-all ${systemState === 'result' ? 'bg-emerald-900/30 border-emerald-500 cursor-pointer hover:bg-emerald-900/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}><Printer size={24} className={systemState === 'result' ? 'text-emerald-400' : 'text-slate-500'} /><span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-300' : 'text-slate-500'}`}>Print Label</span></button>
//           </div>
//         </section>

//         <section className="lg:col-span-4 flex flex-col gap-6">
//            <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center justify-center shadow-lg transition-colors duration-500 min-h-[220px] ${!currentResult ? 'bg-slate-800 border-slate-700' : currentResult.color === 'green' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
//                 {!currentResult ? (<div className="flex flex-col items-center gap-2 text-slate-500"><Activity size={32} /><span>Waiting for Sensor...</span></div>) : (
//                      <><h2 className="text-slate-400 text-xs uppercase tracking-widest mb-1">AI Classification</h2><div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-400' : 'text-red-500'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div><div className="bg-slate-900/50 px-3 py-1 rounded text-xs text-blue-200 border border-slate-700 mb-2">{currentResult.details}</div><div className="w-full mt-2 mb-4"><div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Confidence</span><span>{currentResult.confidence}%</span></div><div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden"><div className={`h-full ${currentResult.confidence > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${currentResult.confidence}%` }}></div></div></div>
//                      <div className="w-full pt-4 border-t border-slate-600/50"><p className="text-[10px] uppercase text-slate-500 mb-2 font-bold">Operator Verification</p>{!verificationStatus ? (<div className="flex justify-center gap-3"><button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-green-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors"><ThumbsUp size={14} /> Correct</button><button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-orange-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors"><ThumbsDown size={14} /> Incorrect</button></div>) : (<div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-400' : 'text-orange-400'}`}>{verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}{verificationStatus === 'correct' ? 'Verified by Operator' : 'Feedback Recorded'}</div>)}</div></>)}
//            </div>
//            <div className="grid grid-cols-2 gap-4"><div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div><div className="text-3xl font-mono text-white">{stats.total}</div></div><div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div><div className="text-3xl font-mono text-red-400">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div></div></div>
//            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
//               <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between"><div className="flex items-center gap-2"><Database size={16} className="text-blue-400" /><span className="text-sm font-bold text-slate-200">Database Logs</span></div><button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-blue-900 text-blue-300 hover:text-blue-100 px-2 py-1 rounded border border-slate-700 transition-colors"><FileText size={12} />Export CSV</button></div>
//               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">{logs.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50"><Server size={32} className="mb-2" /><p className="text-xs">Database Empty</p></div>) : (logs.map((log, i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-500 transition-colors"><div className="flex items-center gap-3"><div className={`w-2 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div><div><div className="text-xs font-bold text-white">{log.id}</div><div className="text-[10px] text-slate-400 flex items-center gap-1"><span>{log.details.split('_').slice(0, 2).join('_')}...</span><span className="text-slate-600">•</span><span>{log.confidence}%</span></div></div></div><div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{log.color === 'green' ? 'PASS' : 'FAIL'}</div></div>)))}</div>
//            </div>
//         </section>
//       </main>
//       {notification && (<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-blue-100 px-6 py-3 rounded-full shadow-2xl border border-slate-600 flex items-center gap-3 z-50 animate-bounce"><Wifi size={16} className="text-green-400" /><span className="text-xs font-bold tracking-wide">{notification}</span></div>)}
//       <style>{`@keyframes scan {0% { top: 0%; } 100% { top: 100%; }} .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }`}</style>
//     </div>
//   );
// };
// export default DefectoMCUDashboardV7;




// import React, { useState, useRef } from 'react';
// import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Wifi, Eye, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';

// const DefectoMCUDashboardV7 = () => {
//   // --- States ---
//   const [systemState, setSystemState] = useState('idle');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
//   const [notification, setNotification] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- Handlers ---
//   const handleSensorTrigger = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSelectedImage(imageUrl);
//       setVerificationStatus(null);
//       startAnalysis(imageUrl, file);
//     }
//   };

//   const startAnalysis = async (imageUrl, file) => {
//     setSystemState('capturing');
//     showNotification("Sensor Detected Object. Capturing Image...");

//     setTimeout(async () => {
//         setSystemState('analyzing');
//         showNotification("Sending to Neural Engine (best.pt)...");

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/predict', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Backend connection failed");

//             const resultData = await response.json();
//             resultData.imageUrl = imageUrl; 
//             processResult(resultData);

//         } catch (error) {
//             console.error(error);
//             showNotification("Backend Error: Check Console");
//         }
//     }, 1500);
//   };

//   const processResult = (resultData) => {
//     setCurrentResult(resultData);
//     setSystemState('result');
    
//     const isGood = resultData.color === 'green';
    
//     setStats(prev => ({
//       total: prev.total + 1,
//       passed: isGood ? prev.passed + 1 : prev.passed,
//       defective: !isGood ? prev.defective + 1 : prev.defective
//     }));
    
//     setLogs(prev => [resultData, ...prev].slice(0, 10));
//     showNotification(`Analysis Complete: Found ${resultData.all_detections?.length || 0} objects`);
//   };

//   // --- Utility Functions ---
//   const handleDownloadLabel = () => {
//     if (!currentResult) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = 400; canvas.height = 250; // Increased height for list
//     const ctx = canvas.getContext('2d');
    
//     ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,250);
//     ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,240);
    
//     ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
//     ctx.fillText('DefectoMCU Inspection System', 20, 35);
//     ctx.font = '14px monospace'; ctx.fillStyle = '#333';
//     ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
//     ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
//     ctx.font = 'bold 32px Arial'; 
//     ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
//     ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
//     // List all detected defects on Label
//     ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
//     ctx.fillText(`Detected Items:`, 20, 140); 
    
//     ctx.font = '12px Courier New'; 
//     ctx.fillStyle = '#000';
    
//     const detections = currentResult.all_detections || [];
//     let yPos = 160;
    
//     if (detections.length === 0) {
//         ctx.fillText("No Objects Detected", 20, yPos);
//     } else {
//         detections.slice(0, 4).forEach((det) => { // Show max 4 items on label
//             const text = `${det.class} (${det.confidence}%)`;
//             ctx.fillStyle = det.color === 'red' ? '#dc2626' : '#166534';
//             ctx.fillText(text, 20, yPos);
//             yPos += 15;
//         });
//         if (detections.length > 4) {
//              ctx.fillStyle = '#000';
//              ctx.fillText(`...and ${detections.length - 4} more`, 20, yPos);
//         }
//     }

//     // Barcode
//     ctx.fillStyle = '#000'; 
//     for(let i=20; i<370; i+=6) if(Math.random() > 0.1) ctx.fillRect(i, 220, 3, 20);
    
//     const link = document.createElement('a');
//     link.download = `${currentResult.id}_label.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   const handleExportCSV = () => {
//     if (logs.length === 0) { showNotification("No data to export."); return; }
//     const headers = ["ID", "Time", "Status", "Primary_Class", "Total_Objects", "Confidence"];
//     const csvContent = [
//         headers.join(","),
//         ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.all_detections?.length},${log.confidence}%`)
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `logs.csv`;
//     link.click();
//   };

//   const handleReset = () => {
//     setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     showNotification("System Reset. Sensor Active.");
//   };

//   const handleVerification = (isCorrect) => {
//       setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
//       showNotification(isCorrect ? "Verified: Correct" : "Flagged: Model Error");
//   }

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-6 overflow-hidden flex flex-col">
//       <header className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
//         <div className="flex items-center gap-3">
//           <div className="bg-blue-600 p-2 rounded-lg shadow-blue-500/20 shadow-lg"><Cpu size={24} className="text-white" /></div>
//           <div><h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">DefectoMCU Monitor </h1><p className="text-xs text-slate-400 flex items-center gap-1"><Wifi size={10} className="text-green-400" /> Connected to Neural Engine</p></div>
//         </div>
//         <div className="flex items-center gap-6"><div className="text-right"><div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div><div className="flex items-center justify-end gap-2"><span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span><span className="font-mono text-sm font-bold text-blue-200">{systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}</span></div></div><div className="h-8 w-[1px] bg-slate-700"></div><Power size={20} className="text-slate-500 hover:text-white cursor-pointer transition-colors" /></div>
//       </header>

//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
//         <section className="lg:col-span-8 flex flex-col gap-6">
//           <div className="bg-black rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl relative aspect-video flex items-center justify-center group">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black z-0">
//                {systemState === 'idle' && (<div className="w-full h-full flex flex-col items-center justify-center opacity-30"><Eye size={64} className="text-green-500/50 animate-pulse mb-4" /><div className="text-green-500/50 font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR SEARCHING...</div></div>)}
//             </div>
//             {selectedImage && (<img src={selectedImage} alt="Captured PCB" className={`w-full h-full object-contain z-10 transition-opacity duration-500 ${systemState === 'capturing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} />)}
            
//             {/* --- MULTIPLE BOUNDING BOX RENDERING --- */}
//             {systemState === 'result' && currentResult && currentResult.all_detections && (
//                <div className="absolute inset-0 z-20">
//                    {currentResult.all_detections.map((det, index) => (
//                       <div key={index} 
//                            className={`absolute border-2 ${det.color === 'green' ? 'border-green-500 shadow-[0_0_10px_green]' : 'border-red-500 shadow-[0_0_10px_red]'} transition-all duration-500`}
//                            style={{
//                             top: det.box.top,
//                             left: det.box.left,
//                             width: det.box.width,
//                             height: det.box.height
//                            }}>
//                          <span className={`absolute -top-6 left-0 ${det.color === 'green' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md whitespace-nowrap`}>
//                              {det.class} {det.confidence}%
//                          </span>
//                       </div>
//                    ))}
                   
//                    {/* Footer Summary */}
//                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border ${currentResult.color === 'green' ? 'bg-green-900/60 border-green-500' : 'bg-red-900/60 border-red-500'}`}>
//                        <div className="flex items-center gap-3">{currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}<div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div><div className="text-xs text-slate-300 font-mono flex items-center gap-2"><span>Detected: {currentResult.all_detections.length} Items</span></div></div></div>
//                    </div>
//                </div>
//             )}
            
//             <div className="absolute top-4 left-4 bg-red-600/80 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//              <div className="relative group"><input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" disabled={systemState !== 'idle'} /><label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${systemState === 'idle' ? 'bg-blue-600 border-blue-500 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25' : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'}`}><Scan size={24} className="text-white mb-2" /><span className="font-bold text-white text-sm">Trigger Sensor</span><span className="text-[10px] text-blue-200">(Upload Image)</span></label></div>
//              <button onClick={handleReset} className="bg-slate-800 border border-slate-700 hover:border-red-500 hover:bg-red-500/10 rounded-xl p-4 flex flex-col items-center justify-center transition-colors group"><RotateCcw size={24} className="text-slate-400 group-hover:text-red-400 transition-transform group-hover:-rotate-180" /><span className="mt-2 text-sm font-medium text-slate-300 group-hover:text-red-300">Reset System</span></button>
//              <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border-2 transition-all ${systemState === 'result' ? 'bg-emerald-900/30 border-emerald-500 cursor-pointer hover:bg-emerald-900/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}><Printer size={24} className={systemState === 'result' ? 'text-emerald-400' : 'text-slate-500'} /><span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-300' : 'text-slate-500'}`}>Print Label</span></button>
//           </div>
//         </section>

//         <section className="lg:col-span-4 flex flex-col gap-6">
//            <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center justify-center shadow-lg transition-colors duration-500 min-h-[220px] ${!currentResult ? 'bg-slate-800 border-slate-700' : currentResult.color === 'green' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
//                 {!currentResult ? (<div className="flex flex-col items-center gap-2 text-slate-500"><Activity size={32} /><span>Waiting for Sensor...</span></div>) : (
//                      <><h2 className="text-slate-400 text-xs uppercase tracking-widest mb-1">AI Classification</h2><div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-400' : 'text-red-500'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div>
//                      <div className="bg-slate-900/50 px-3 py-1 rounded text-xs text-blue-200 border border-slate-700 mb-2">Primary: {currentResult.details}</div>
//                      <div className="w-full mt-2 mb-4 text-left px-4">
//                         <p className="text-[10px] text-slate-400 mb-1">Detected Objects:</p>
//                         <div className="max-h-24 overflow-y-auto custom-scrollbar">
//                            {currentResult.all_detections.map((d,i) => (
//                                <div key={i} className="flex justify-between text-xs mb-1 border-b border-slate-700/50 pb-1">
//                                    <span className={d.color==='red'?'text-red-400':'text-green-400'}>{d.class}</span>
//                                    <span className="text-slate-500">{d.confidence}%</span>
//                                </div>
//                            ))}
//                         </div>
//                      </div>
//                      <div className="w-full pt-4 border-t border-slate-600/50"><p className="text-[10px] uppercase text-slate-500 mb-2 font-bold">Operator Verification</p>{!verificationStatus ? (<div className="flex justify-center gap-3"><button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-green-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors"><ThumbsUp size={14} /> Correct</button><button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-orange-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors"><ThumbsDown size={14} /> Incorrect</button></div>) : (<div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-400' : 'text-orange-400'}`}>{verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}{verificationStatus === 'correct' ? 'Verified by Operator' : 'Feedback Recorded'}</div>)}</div></>)}
//            </div>
//            <div className="grid grid-cols-2 gap-4"><div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div><div className="text-3xl font-mono text-white">{stats.total}</div></div><div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div><div className="text-3xl font-mono text-red-400">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div></div></div>
//            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
//               <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between"><div className="flex items-center gap-2"><Database size={16} className="text-blue-400" /><span className="text-sm font-bold text-slate-200">Database Logs</span></div><button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-blue-900 text-blue-300 hover:text-blue-100 px-2 py-1 rounded border border-slate-700 transition-colors"><FileText size={12} />Export CSV</button></div>
//               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">{logs.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50"><Server size={32} className="mb-2" /><p className="text-xs">Database Empty</p></div>) : (logs.map((log, i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-500 transition-colors"><div className="flex items-center gap-3"><div className={`w-2 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div><div><div className="text-xs font-bold text-white">{log.id}</div><div className="text-[10px] text-slate-400 flex items-center gap-1"><span>{log.all_detections ? log.all_detections.length : 0} items</span><span className="text-slate-600">•</span><span>{log.confidence}%</span></div></div></div><div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{log.color === 'green' ? 'PASS' : 'FAIL'}</div></div>)))}</div>
//            </div>
//         </section>
//       </main>
//       {notification && (<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-blue-100 px-6 py-3 rounded-full shadow-2xl border border-slate-600 flex items-center gap-3 z-50 animate-bounce"><Wifi size={16} className="text-green-400" /><span className="text-xs font-bold tracking-wide">{notification}</span></div>)}
//       <style>{`@keyframes scan {0% { top: 0%; } 100% { top: 100%; }} .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }`}</style>
//     </div>
//   );
// };
// export default DefectoMCUDashboardV7;


// import React, { useState, useRef } from 'react';
// import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Wifi, Eye, FileText, ThumbsUp, ThumbsDown, Sun, Moon } from 'lucide-react';

// const DefectoMCUDashboardLight = () => {
//   // --- States ---
//   const [systemState, setSystemState] = useState('idle');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
//   const [notification, setNotification] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- Handlers ---
//   const handleSensorTrigger = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSelectedImage(imageUrl);
//       setVerificationStatus(null);
//       startAnalysis(imageUrl, file);
//     }
//   };

//   const startAnalysis = async (imageUrl, file) => {
//     setSystemState('capturing');
//     showNotification("Sensor Detected Object. Capturing Image...");

//     setTimeout(async () => {
//         setSystemState('analyzing');
//         showNotification("Sending to Neural Engine (best.pt)...");

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             // HOSTING NOTE: Upload korar por nicher Link ta change korte hobe
//             const response = await fetch('http://127.0.0.1:8000/predict', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Backend connection failed");

//             const resultData = await response.json();
//             resultData.imageUrl = imageUrl; 
//             processResult(resultData);

//         } catch (error) {
//             console.error(error);
//             showNotification("Backend Error: Check Console");
//         }
//     }, 1500);
//   };

//   const processResult = (resultData) => {
//     setCurrentResult(resultData);
//     setSystemState('result');
    
//     const isGood = resultData.color === 'green';
    
//     setStats(prev => ({
//       total: prev.total + 1,
//       passed: isGood ? prev.passed + 1 : prev.passed,
//       defective: !isGood ? prev.defective + 1 : prev.defective
//     }));
    
//     setLogs(prev => [resultData, ...prev].slice(0, 10));
//     showNotification(`Analysis Complete: Found ${resultData.all_detections?.length || 0} objects`);
//   };

//   // --- Label Generator ---
//   const handleDownloadLabel = () => {
//     if (!currentResult) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = 400; canvas.height = 250;
//     const ctx = canvas.getContext('2d');
    
//     ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,250);
//     ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,240);
    
//     ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
//     ctx.fillText('DefectoMCU Inspection System', 20, 35);
//     ctx.font = '14px monospace'; ctx.fillStyle = '#333';
//     ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
//     ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
//     ctx.font = 'bold 32px Arial'; 
//     ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
//     ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
//     ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
//     ctx.fillText(`Detected Items:`, 20, 140); 
    
//     ctx.font = '12px Courier New'; ctx.fillStyle = '#000';
//     const detections = currentResult.all_detections || [];
//     let yPos = 160;
    
//     if (detections.length === 0) {
//         ctx.fillText("No Objects Detected", 20, yPos);
//     } else {
//         detections.slice(0, 4).forEach((det) => {
//             const text = `${det.class} (${det.confidence}%)`;
//             ctx.fillStyle = det.color === 'red' ? '#dc2626' : '#166534';
//             ctx.fillText(text, 20, yPos);
//             yPos += 15;
//         });
//         if (detections.length > 4) {
//              ctx.fillStyle = '#000';
//              ctx.fillText(`...and ${detections.length - 4} more`, 20, yPos);
//         }
//     }
    
//     const link = document.createElement('a');
//     link.download = `${currentResult.id}_label.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   const handleExportCSV = () => {
//     if (logs.length === 0) { showNotification("No data to export."); return; }
//     const headers = ["ID", "Time", "Status", "Primary_Class", "Total_Objects", "Confidence"];
//     const csvContent = [
//         headers.join(","),
//         ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.all_detections?.length},${log.confidence}%`)
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `logs.csv`;
//     link.click();
//   };

//   const handleReset = () => {
//     setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     showNotification("System Reset. Sensor Active.");
//   };

//   const handleVerification = (isCorrect) => {
//       setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
//       showNotification(isCorrect ? "Verified: Correct" : "Flagged: Model Error");
//   }

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // --- THEME COLORS (Main BG: #EBF4DD, Buttons & Logs: #ABE7B2) ---
//   return (
//     <div className="min-h-screen bg-[#EBF4DD] text-slate-800 font-sans p-4 md:p-6 overflow-hidden flex flex-col transition-colors duration-500">
      
//       {/* Header */}
//       <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-[#ABE7B2]/50 shadow-sm">
//         <div className="flex items-center gap-3">
//           {/* Custom Color Background */}
//           <div className="p-2 rounded-lg shadow-md shadow-[#ABE7B2]/40 bg-[#ABE7B2]">
//             <Cpu size={24} className="text-slate-800" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 tracking-tight">DefectoMCU Monitor</h1>
//             <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
//               <Wifi size={10} className="text-[#7A9B45]" /> Connected to Neural Engine
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-6">
//            <div className="text-right">
//               <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div>
//               <div className="flex items-center justify-end gap-2">
//                  <span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-[#ABE7B2] animate-pulse' : 'bg-amber-400'}`}></span>
//                  <span className="font-mono text-sm font-bold text-slate-700">
//                     {systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}
//                  </span>
//               </div>
//            </div>
//            <div className="h-8 w-[1px] bg-gray-200"></div>
//            <button title="System Power" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//               <Power size={20} className="text-slate-400 hover:text-red-500" />
//            </button>
//         </div>
//       </header>

//       {/* Main Grid */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
//         {/* LEFT: Vision & Controls */}
//         <section className="lg:col-span-8 flex flex-col gap-6">
          
//           {/* Monitor Screen */}
//           <div className="bg-black rounded-2xl overflow-hidden border-4 border-[#ABE7B2]/50 shadow-2xl relative aspect-video flex items-center justify-center group">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black z-0">
//                {systemState === 'idle' && (
//                   <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
//                      <Eye size={64} className="text-[#ABE7B2] animate-pulse mb-4" />
//                      <div className="text-[#ABE7B2] font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR STANDBY...</div>
//                   </div>
//                )}
//             </div>
            
//             {selectedImage && (<img src={selectedImage} alt="Captured PCB" className={`w-full h-full object-contain z-10 transition-opacity duration-500 ${systemState === 'capturing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} />)}
            
//             {/* Animations */}
//             {systemState === 'capturing' && (<div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center"><div className="absolute inset-0 border-[20px] border-white/30 animate-pulse"></div><Camera size={48} className="text-white animate-bounce" /></div>)}
//             {systemState === 'analyzing' && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]"><div className="relative w-64 h-64 border-2 border-[#ABE7B2]/50 rounded-lg overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-[#ABE7B2] shadow-[0_0_15px_#ABE7B2] animate-[scan_1.5s_linear_infinite]"></div></div><div className="mt-4 flex items-center gap-2 text-[#ABE7B2] font-mono"><Activity size={16} className="animate-spin" /><span>Running AI Inference...</span></div></div>)}
            
//             {/* Results Overlay */}
//             {systemState === 'result' && currentResult && currentResult.all_detections && (
//                <div className="absolute inset-0 z-20">
//                    {currentResult.all_detections.map((det, index) => (
//                       <div key={index} 
//                            className={`absolute border-2 ${det.color === 'green' ? 'border-green-500 shadow-[0_0_15px_green]' : 'border-red-500 shadow-[0_0_15px_red]'} transition-all duration-500`}
//                            style={{top: det.box.top, left: det.box.left, width: det.box.width, height: det.box.height}}>
//                          <span className={`absolute -top-6 left-0 ${det.color === 'green' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md whitespace-nowrap rounded-sm`}>
//                              {det.class} {det.confidence}%
//                          </span>
//                       </div>
//                    ))}
//                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border ${currentResult.color === 'green' ? 'bg-green-900/80 border-green-500' : 'bg-red-900/80 border-red-500'}`}>
//                        <div className="flex items-center gap-3">{currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}<div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div></div></div>
//                    </div>
//                </div>
//             )}
//             <div className="absolute top-4 left-4 bg-red-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40 text-white shadow-lg"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
//           </div>

//           {/* Controls */}
//           <div className="grid grid-cols-3 gap-4">
//              <div className="relative group">
//                 <input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" disabled={systemState !== 'idle'} />
//                 {/* Custom Color Button */}
//                 <label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer shadow-sm ${systemState === 'idle' ? 'bg-[#ABE7B2]/20 border-[#ABE7B2] hover:bg-[#ABE7B2]/30 hover:border-[#98D799]' : 'bg-[#EBF4DD]/50 border-gray-300 opacity-50 cursor-not-allowed'}`}>
//                     <Scan size={24} className="text-[#7A9B45] mb-2" />
//                     <span className="font-bold text-slate-700 text-sm">Upload Image</span>
//                     <span className="text-[10px] text-slate-500">(Trigger Sensor)</span>
//                 </label>
//              </div>
//              <button onClick={handleReset} className="bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-sm">
//                  <RotateCcw size={24} className="text-slate-400 group-hover:text-red-500 transition-transform group-hover:-rotate-180" />
//                  <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-red-600">Reset System</span>
//              </button>
//              <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border transition-all shadow-sm ${systemState === 'result' ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300' : 'bg-[#EBF4DD]/50 border-gray-300 opacity-50'}`}>
//                  <Printer size={24} className={systemState === 'result' ? 'text-emerald-600' : 'text-slate-400'} />
//                  <span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-700' : 'text-slate-400'}`}>Print Label</span>
//              </button>
//           </div>
//         </section>

//         {/* RIGHT: Stats & Logs */}
//         <section className="lg:col-span-4 flex flex-col gap-6">
           
//            {/* Status Card */}
//            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center justify-center shadow-md transition-all duration-500 min-h-[220px] bg-white ${!currentResult ? 'border-gray-200' : currentResult.color === 'green' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
//                 {!currentResult ? (
//                      <div className="flex flex-col items-center gap-2 text-slate-400">
//                          <Activity size={32} />
//                          <span>Ready for Inspection...</span>
//                      </div>
//                 ) : (
//                      <>
//                         <h2 className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Inspection Result</h2>
//                         <div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div>
//                         <div className="bg-white/60 px-3 py-1 rounded text-xs text-slate-600 border border-black/5 mb-3 font-medium shadow-sm">Primary: {currentResult.details}</div>
                        
//                         <div className="w-full text-left px-2 bg-white/50 rounded-lg py-2 border border-black/5 mb-3">
//                            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Defects Found ({currentResult.all_detections.length})</p>
//                            <div className="max-h-20 overflow-y-auto custom-scrollbar pr-1">
//                                {currentResult.all_detections.map((d,i) => (
//                                    <div key={i} className="flex justify-between text-xs mb-1 border-b border-black/5 pb-1 last:border-0">
//                                        <span className={d.color==='red'?'text-red-600 font-medium':'text-green-600 font-medium'}>{d.class}</span>
//                                        <span className="text-slate-500">{d.confidence}%</span>
//                                    </div>
//                                ))}
//                            </div>
//                         </div>

//                         {/* Human Verification */}
//                         <div className="w-full pt-3 border-t border-black/10">
//                             {!verificationStatus ? (
//                                 <div className="flex justify-center gap-2">
//                                     <button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-green-500 hover:text-green-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsUp size={14} /> Correct
//                                     </button>
//                                     <button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsDown size={14} /> Incorrect
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
//                                     {verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} Recorded
//                                 </div>
//                             )}
//                         </div>
//                      </>
//                 )}
//            </div>

//            {/* Stats Cards */}
//            <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div>
//                   <div className="text-3xl font-mono text-slate-800">{stats.total}</div>
//               </div>
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div>
//                   <div className="text-3xl font-mono text-red-500">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div>
//               </div>
//            </div>

//            {/* Logs - Light Table */}
//            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
//               <div className="p-3 bg-[#ABE7B2] border-b border-gray-200 flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                       <Database size={16} className="text-slate-800" />
//                       <span className="text-sm font-bold text-slate-800">Database Logs</span>
//                   </div>
//                   {/* Custom Color Button Hover */}
//                   <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-white hover:bg-white/80 text-slate-700 border border-gray-200 px-2 py-1 rounded transition-colors shadow-sm">
//                       <FileText size={12} /> CSV
//                   </button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//                   {logs.length === 0 ? (
//                       <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
//                           <Server size={32} className="mb-2" />
//                           <p className="text-xs">Database Empty</p>
//                       </div>
//                   ) : (
//                       logs.map((log, i) => (
//                           <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-[#ABE7B2] hover:shadow-md transition-all group">
//                               <div className="flex items-center gap-3">
//                                   <div className={`w-1.5 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                                   <div>
//                                       <div className="text-xs font-bold text-slate-800">{log.id}</div>
//                                       <div className="text-[10px] text-slate-500 flex items-center gap-1">
//                                           <span>{log.all_detections ? log.all_detections.length : 0} items</span>
//                                           <span className="text-slate-300">•</span>
//                                           <span>{log.confidence}%</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
//                                   {log.color === 'green' ? 'PASS' : 'FAIL'}
//                               </div>
//                           </div>
//                       ))
//                   )}
//               </div>
//            </div>
//         </section>
//       </main>

//       {/* Notification Toast */}
//       {notification && (
//         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
//             <Wifi size={16} className="text-[#ABE7B2]" />
//             <span className="text-xs font-bold tracking-wide">{notification}</span>
//         </div>
//       )}

//       <style>{`
//         @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//       `}</style>
//     </div>
//   );
// };

// export default DefectoMCUDashboardLight;

// import React, { useState, useRef } from 'react';
// import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Wifi, Eye, FileText, ThumbsUp, ThumbsDown, Sun, Moon, CheckCheck, XCircle } from 'lucide-react';

// const DefectoMCUDashboardLight = () => {
//   // --- States ---
//   const [systemState, setSystemState] = useState('idle');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
//   const [notification, setNotification] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- Handlers ---
//   const handleSensorTrigger = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSelectedImage(imageUrl);
//       setVerificationStatus(null);
//       startAnalysis(imageUrl, file);
//     }
//   };

//   const startAnalysis = async (imageUrl, file) => {
//     setSystemState('capturing');
//     showNotification("Sensor Detected Object. Capturing Image...");

//     setTimeout(async () => {
//         setSystemState('analyzing');
//         showNotification("Sending to Neural Engine (best.pt)...");

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             // HOSTING NOTE: Upload korar por nicher Link ta change korte hobe
//             const response = await fetch('http://127.0.0.1:8000/predict', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Backend connection failed");

//             const resultData = await response.json();
//             resultData.imageUrl = imageUrl; 
//             processResult(resultData);

//         } catch (error) {
//             console.error(error);
//             showNotification("Backend Error: Check Console");
//         }
//     }, 1500);
//   };

//   const processResult = (resultData) => {
//     setCurrentResult(resultData);
//     setSystemState('result');
    
//     const isGood = resultData.color === 'green';
    
//     setStats(prev => ({
//       total: prev.total + 1,
//       passed: isGood ? prev.passed + 1 : prev.passed,
//       defective: !isGood ? prev.defective + 1 : prev.defective
//     }));
    
//     // Add new log
//     setLogs(prev => [resultData, ...prev].slice(0, 10));
//     showNotification(`Analysis Complete: Found ${resultData.all_detections?.length || 0} objects`);
//   };

//   // --- Label Generator ---
//   const handleDownloadLabel = () => {
//     if (!currentResult) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = 400; canvas.height = 250;
//     const ctx = canvas.getContext('2d');
    
//     ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,250);
//     ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,240);
    
//     ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
//     ctx.fillText('DefectoMCU Inspection System', 20, 35);
//     ctx.font = '14px monospace'; ctx.fillStyle = '#333';
//     ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
//     ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
//     ctx.font = 'bold 32px Arial'; 
//     ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
//     ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
//     ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
//     ctx.fillText(`Detected Items:`, 20, 140); 
    
//     ctx.font = '12px Courier New'; ctx.fillStyle = '#000';
//     const detections = currentResult.all_detections || [];
//     let yPos = 160;
    
//     if (detections.length === 0) {
//         ctx.fillText("No Objects Detected", 20, yPos);
//     } else {
//         detections.slice(0, 4).forEach((det) => {
//             const text = `${det.class} (${det.confidence}%)`;
//             ctx.fillStyle = det.color === 'red' ? '#dc2626' : '#166534';
//             ctx.fillText(text, 20, yPos);
//             yPos += 15;
//         });
//         if (detections.length > 4) {
//              ctx.fillStyle = '#000';
//              ctx.fillText(`...and ${detections.length - 4} more`, 20, yPos);
//         }
//     }
    
//     const link = document.createElement('a');
//     link.download = `${currentResult.id}_label.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   const handleExportCSV = () => {
//     if (logs.length === 0) { showNotification("No data to export."); return; }
//     const headers = ["ID", "Time", "Status", "Primary_Class", "Verification", "Total_Objects", "Confidence"];
//     const csvContent = [
//         headers.join(","),
//         ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.verification || 'Pending'},${log.all_detections?.length},${log.confidence}%`)
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `logs.csv`;
//     link.click();
//   };

//   const handleReset = () => {
//     setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     showNotification("System Reset. Sensor Active.");
//   };

//   // --- UPDATED LOGIC: Update Logs on Verification ---
//   const handleVerification = (isCorrect) => {
//       const status = isCorrect ? 'Correct' : 'Incorrect';
//       setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
      
//       // Update the specific log entry in the database (state)
//       if (currentResult) {
//           setLogs(prevLogs => prevLogs.map(log => 
//               log.id === currentResult.id 
//                   ? { ...log, verification: status } 
//                   : log
//           ));
//       }
      
//       showNotification(isCorrect ? "Verified: Correct - Log Updated" : "Flagged: Model Error - Log Updated");
//   }

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // --- THEME COLORS (Main BG: #B8DB80) ---
//   return (
//     <div className="min-h-screen bg-[#B8DB80] text-slate-800 font-sans p-4 md:p-6 overflow-hidden flex flex-col transition-colors duration-500">
      
//       {/* Header */}
//       <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-white/50 shadow-sm">
//         <div className="flex items-center gap-3">
//           {/* Logo Box */}
//           <div className="p-2 rounded-lg shadow-md bg-[#7A9B45]">
//             <Cpu size={24} className="text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 tracking-tight">DefectoMCU Monitor</h1>
//             <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
//               <Wifi size={10} className="text-[#556B2F]" /> Connected to Neural Engine
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-6">
//            <div className="text-right">
//               <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div>
//               <div className="flex items-center justify-end gap-2">
//                  <span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-[#7A9B45] animate-pulse' : 'bg-amber-400'}`}></span>
//                  <span className="font-mono text-sm font-bold text-slate-700">
//                     {systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}
//                  </span>
//               </div>
//            </div>
//            <div className="h-8 w-[1px] bg-gray-200"></div>
//            <button title="System Power" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//               <Power size={20} className="text-slate-400 hover:text-red-500" />
//            </button>
//         </div>
//       </header>

//       {/* Main Grid */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
//         {/* LEFT: Vision & Controls */}
//         <section className="lg:col-span-8 flex flex-col gap-6">
          
//           {/* Monitor Screen - Remains Dark */}
//           <div className="bg-black rounded-2xl overflow-hidden border-4 border-[#7A9B45]/50 shadow-2xl relative aspect-video flex items-center justify-center group">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black z-0">
//                {systemState === 'idle' && (
//                   <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
//                      <Eye size={64} className="text-[#B8DB80] animate-pulse mb-4" />
//                      <div className="text-[#B8DB80] font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR STANDBY...</div>
//                   </div>
//                )}
//             </div>
            
//             {selectedImage && (<img src={selectedImage} alt="Captured PCB" className={`w-full h-full object-contain z-10 transition-opacity duration-500 ${systemState === 'capturing' ? 'opacity-50 blur-sm' : 'opacity-100'}`} />)}
            
//             {/* Animations */}
//             {systemState === 'capturing' && (<div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center"><div className="absolute inset-0 border-[20px] border-white/30 animate-pulse"></div><Camera size={48} className="text-white animate-bounce" /></div>)}
//             {systemState === 'analyzing' && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]"><div className="relative w-64 h-64 border-2 border-[#B8DB80]/50 rounded-lg overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-[#B8DB80] shadow-[0_0_15px_#B8DB80] animate-[scan_1.5s_linear_infinite]"></div></div><div className="mt-4 flex items-center gap-2 text-[#B8DB80] font-mono"><Activity size={16} className="animate-spin" /><span>Running AI Inference...</span></div></div>)}
            
//             {/* Results Overlay */}
//             {systemState === 'result' && currentResult && currentResult.all_detections && (
//                <div className="absolute inset-0 z-20">
//                    {currentResult.all_detections.map((det, index) => (
//                       <div key={index} 
//                            className={`absolute border-2 ${det.color === 'green' ? 'border-green-500 shadow-[0_0_15px_green]' : 'border-red-500 shadow-[0_0_15px_red]'} transition-all duration-500`}
//                            style={{top: det.box.top, left: det.box.left, width: det.box.width, height: det.box.height}}>
//                          <span className={`absolute -top-6 left-0 ${det.color === 'green' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md whitespace-nowrap rounded-sm`}>
//                              {det.class} {det.confidence}%
//                          </span>
//                       </div>
//                    ))}
//                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border ${currentResult.color === 'green' ? 'bg-green-900/80 border-green-500' : 'bg-red-900/80 border-red-500'}`}>
//                        <div className="flex items-center gap-3">{currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}<div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div></div></div>
//                    </div>
//                </div>
//             )}
//             <div className="absolute top-4 left-4 bg-red-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40 text-white shadow-lg"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
//           </div>

//           {/* Controls */}
//           <div className="grid grid-cols-3 gap-4">
//              <div className="relative group">
//                 <input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" disabled={systemState !== 'idle'} />
                
//                 {/* Upload Button */}
//                 <label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer shadow-sm ${systemState === 'idle' ? 'bg-white/80 border-white hover:border-[#556B2F] hover:bg-white' : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'}`}>
//                     <Scan size={24} className="text-[#556B2F] mb-2" />
//                     <span className="font-bold text-slate-700 text-sm">Upload Image</span>
//                     <span className="text-[10px] text-slate-500">(Trigger Sensor)</span>
//                 </label>
//              </div>
             
//              {/* Reset Button (Custom Base Color) */}
//              <button onClick={handleReset} className="bg-slate-200 border border-slate-300 hover:border-red-400 hover:bg-red-100 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-sm">
//                  <RotateCcw size={24} className="text-slate-500 group-hover:text-red-600 transition-transform group-hover:-rotate-180" />
//                  <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-red-700">Reset System</span>
//              </button>
             
//              <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border transition-all shadow-sm ${systemState === 'result' ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
//                  <Printer size={24} className={systemState === 'result' ? 'text-emerald-600' : 'text-slate-400'} />
//                  <span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-700' : 'text-slate-400'}`}>Print Label</span>
//              </button>
//           </div>
//         </section>

//         {/* RIGHT: Stats & Logs */}
//         <section className="lg:col-span-4 flex flex-col gap-6">
           
//            {/* Status Card */}
//            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center justify-center shadow-md transition-all duration-500 min-h-[220px] bg-white ${!currentResult ? 'border-gray-200' : currentResult.color === 'green' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
//                 {!currentResult ? (
//                      <div className="flex flex-col items-center gap-2 text-slate-400">
//                          <Activity size={32} />
//                          <span>Ready for Inspection...</span>
//                      </div>
//                 ) : (
//                      <>
//                         <h2 className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Inspection Result</h2>
//                         <div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div>
//                         <div className="bg-white/60 px-3 py-1 rounded text-xs text-slate-600 border border-black/5 mb-3 font-medium shadow-sm">Primary: {currentResult.details}</div>
                        
//                         <div className="w-full text-left px-2 bg-white/50 rounded-lg py-2 border border-black/5 mb-3">
//                            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Defects Found ({currentResult.all_detections.length})</p>
//                            <div className="max-h-20 overflow-y-auto custom-scrollbar pr-1">
//                                {currentResult.all_detections.map((d,i) => (
//                                    <div key={i} className="flex justify-between text-xs mb-1 border-b border-black/5 pb-1 last:border-0">
//                                        <span className={d.color==='red'?'text-red-600 font-medium':'text-green-600 font-medium'}>{d.class}</span>
//                                        <span className="text-slate-500">{d.confidence}%</span>
//                                    </div>
//                                ))}
//                            </div>
//                         </div>

//                         {/* Human Verification */}
//                         <div className="w-full pt-3 border-t border-black/10">
//                             {!verificationStatus ? (
//                                 <div className="flex justify-center gap-2">
//                                     <button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-green-500 hover:text-green-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsUp size={14} /> Correct
//                                     </button>
//                                     <button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsDown size={14} /> Incorrect
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
//                                     {verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} Recorded
//                                 </div>
//                             )}
//                         </div>
//                      </>
//                 )}
//            </div>

//            {/* Stats Cards */}
//            <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div>
//                   <div className="text-3xl font-mono text-slate-800">{stats.total}</div>
//               </div>
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div>
//                   <div className="text-3xl font-mono text-red-500">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div>
//               </div>
//            </div>

//            {/* Logs - Updated Header Color & Logic */}
//            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
//               <div className="p-3 bg-[#ABE7B2] border-b border-gray-200 flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                       <Database size={16} className="text-slate-800" />
//                       <span className="text-sm font-bold text-slate-800">Database Logs</span>
//                   </div>
//                   <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-white hover:bg-white/80 text-slate-700 border border-gray-200 px-2 py-1 rounded transition-colors shadow-sm">
//                       <FileText size={12} /> CSV
//                   </button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//                   {logs.length === 0 ? (
//                       <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
//                           <Server size={32} className="mb-2" />
//                           <p className="text-xs">Database Empty</p>
//                       </div>
//                   ) : (
//                       logs.map((log, i) => (
//                           <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-[#ABE7B2] hover:shadow-md transition-all group">
//                               <div className="flex items-center gap-3">
//                                   <div className={`w-1.5 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                                   <div>
//                                       <div className="text-xs font-bold text-slate-800">{log.id}</div>
//                                       <div className="text-[10px] text-slate-500 flex items-center gap-1">
//                                           {/* Show Verification Status in Log */}
//                                           {log.verification && (
//                                               <span className={`flex items-center gap-0.5 ${log.verification === 'Correct' ? 'text-green-600' : 'text-orange-500'}`}>
//                                                   {log.verification === 'Correct' ? <CheckCheck size={10}/> : <AlertTriangle size={10}/>}
//                                               </span>
//                                           )}
//                                           <span>{log.all_detections ? log.all_detections.length : 0} items</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
//                                   {log.color === 'green' ? 'PASS' : 'FAIL'}
//                               </div>
//                           </div>
//                       ))
//                   )}
//               </div>
//            </div>
//         </section>
//       </main>

//       {/* Notification Toast */}
//       {notification && (
//         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
//             <Wifi size={16} className="text-[#ABE7B2]" />
//             <span className="text-xs font-bold tracking-wide">{notification}</span>
//         </div>
//       )}

//       <style>{`
//         @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//       `}</style>
//     </div>
//   );
// };

// export default DefectoMCUDashboardLight;

// last one
// import React, { useState, useRef } from 'react';
// import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Wifi, Eye, FileText, ThumbsUp, ThumbsDown, Sun, Moon, CheckCheck, XCircle } from 'lucide-react';

// const DefectoMCUDashboardLight = () => {
//   // --- States ---
//   const [systemState, setSystemState] = useState('idle');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [currentResult, setCurrentResult] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
//   const [notification, setNotification] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- Handlers ---
//   const handleSensorTrigger = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setSelectedImage(imageUrl);
//       setVerificationStatus(null);
//       startAnalysis(imageUrl, file);
//     }
//   };

//   const startAnalysis = async (imageUrl, file) => {
//     setSystemState('capturing');
//     showNotification("Sensor Detected Object. Capturing Image...");

//     setTimeout(async () => {
//         setSystemState('analyzing');
//         showNotification("Sending to Neural Engine (best.pt)...");

//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             // HOSTING NOTE: Upload korar por nicher Link ta change korte hobe
//             const response = await fetch('http://127.0.0.1:8000/predict', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Backend connection failed");

//             const resultData = await response.json();
//             resultData.imageUrl = imageUrl; 
//             processResult(resultData);

//         } catch (error) {
//             console.error(error);
//             showNotification("Backend Error: Check Console");
//         }
//     }, 1500);
//   };

//   const processResult = (resultData) => {
//     setCurrentResult(resultData);
//     setSystemState('result');
    
//     const isGood = resultData.color === 'green';
    
//     setStats(prev => ({
//       total: prev.total + 1,
//       passed: isGood ? prev.passed + 1 : prev.passed,
//       defective: !isGood ? prev.defective + 1 : prev.defective
//     }));
    
//     // Add new log
//     setLogs(prev => [resultData, ...prev].slice(0, 10));
//     showNotification(`Analysis Complete: Found ${resultData.all_detections?.length || 0} objects`);
//   };

//   // --- Label Generator ---
//   const handleDownloadLabel = () => {
//     if (!currentResult) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = 400; canvas.height = 250;
//     const ctx = canvas.getContext('2d');
    
//     ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,250);
//     ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,240);
    
//     ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
//     ctx.fillText('DefectoMCU Inspection System', 20, 35);
//     ctx.font = '14px monospace'; ctx.fillStyle = '#333';
//     ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
//     ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
//     ctx.font = 'bold 32px Arial'; 
//     ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
//     ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
//     ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
//     ctx.fillText(`Detected Items:`, 20, 140); 
    
//     ctx.font = '12px Courier New'; ctx.fillStyle = '#000';
//     const detections = currentResult.all_detections || [];
//     let yPos = 160;
    
//     if (detections.length === 0) {
//         ctx.fillText("No Objects Detected", 20, yPos);
//     } else {
//         detections.slice(0, 4).forEach((det) => {
//             const text = `${det.class} (${det.confidence}%)`;
//             ctx.fillStyle = det.color === 'red' ? '#dc2626' : '#166534';
//             ctx.fillText(text, 20, yPos);
//             yPos += 15;
//         });
//         if (detections.length > 4) {
//              ctx.fillStyle = '#000';
//              ctx.fillText(`...and ${detections.length - 4} more`, 20, yPos);
//         }
//     }
    
//     const link = document.createElement('a');
//     link.download = `${currentResult.id}_label.png`;
//     link.href = canvas.toDataURL();
//     link.click();
//   };

//   const handleExportCSV = () => {
//     if (logs.length === 0) { showNotification("No data to export."); return; }
//     const headers = ["ID", "Time", "Status", "Primary_Class", "Verification", "Total_Objects", "Confidence"];
//     const csvContent = [
//         headers.join(","),
//         ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.verification || 'Pending'},${log.all_detections?.length},${log.confidence}%`)
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `logs.csv`;
//     link.click();
//   };

//   const handleReset = () => {
//     setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     showNotification("System Reset. Sensor Active.");
//   };

//   // --- UPDATED LOGIC: Update Logs on Verification ---
//   const handleVerification = (isCorrect) => {
//       const status = isCorrect ? 'Correct' : 'Incorrect';
//       setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
      
//       // Update the specific log entry in the database (state)
//       if (currentResult) {
//           setLogs(prevLogs => prevLogs.map(log => 
//               log.id === currentResult.id 
//                   ? { ...log, verification: status } 
//                   : log
//           ));
//       }
      
//       showNotification(isCorrect ? "Verified: Correct - Log Updated" : "Flagged: Model Error - Log Updated");
//   }

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // --- THEME COLORS (Main BG: #B8DB80) ---
//   return (
//     <div className="min-h-screen bg-[#B8DB80] text-slate-800 font-sans p-4 md:p-6 overflow-hidden flex flex-col transition-colors duration-500">
      
//       {/* Header */}
//       <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-white/50 shadow-sm">
//         <div className="flex items-center gap-3">
//           {/* Logo Box */}
//           <div className="p-2 rounded-lg shadow-md bg-[#7A9B45]">
//             <Cpu size={24} className="text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 tracking-tight">DefectoMCU Monitor</h1>
//             <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
//               <Wifi size={10} className="text-[#556B2F]" /> Connected to Neural Engine
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-6">
//            <div className="text-right">
//               <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div>
//               <div className="flex items-center justify-end gap-2">
//                  <span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-[#7A9B45] animate-pulse' : 'bg-amber-400'}`}></span>
//                  <span className="font-mono text-sm font-bold text-slate-700">
//                     {systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}
//                  </span>
//               </div>
//            </div>
//            <div className="h-8 w-[1px] bg-gray-200"></div>
//            <button title="System Power" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//               <Power size={20} className="text-slate-400 hover:text-red-500" />
//            </button>
//         </div>
//       </header>

//       {/* Main Grid */}
//       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
//         {/* LEFT: Vision & Controls */}
//         <section className="lg:col-span-8 flex flex-col gap-6">
          
//           {/* Monitor Screen - FIXED: Bounding Box Alignment */}
//           <div className="bg-black rounded-2xl overflow-hidden border-4 border-[#7A9B45]/50 shadow-2xl relative aspect-video flex items-center justify-center group">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black z-0">
//                {systemState === 'idle' && (
//                   <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
//                      <Eye size={64} className="text-[#B8DB80] animate-pulse mb-4" />
//                      <div className="text-[#B8DB80] font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR STANDBY...</div>
//                   </div>
//                )}
//             </div>
            
//             {/* The Image Wrapper: Fits exactly to the image content */}
//             {selectedImage ? (
//                 <div className="relative max-w-full max-h-full z-10 flex justify-center items-center">
//                     <img 
//                         src={selectedImage} 
//                         alt="Captured PCB" 
//                         className="block max-w-full max-h-full"
//                         style={{ maxHeight: '100%', objectFit: 'contain' }}
//                     />
                    
//                     {/* Bounding Boxes are now RELATIVE to this image wrapper */}
//                     {systemState === 'result' && currentResult && currentResult.all_detections && (
//                         <div className="absolute inset-0">
//                             {currentResult.all_detections.map((det, index) => (
//                                 <div key={index} 
//                                     className={`absolute border-2 ${det.color === 'green' ? 'border-green-500 shadow-[0_0_15px_green]' : 'border-red-500 shadow-[0_0_15px_red]'} transition-all duration-500`}
//                                     style={{
//                                         top: det.box.top, 
//                                         left: det.box.left, 
//                                         width: det.box.width, 
//                                         height: det.box.height
//                                     }}>
//                                     <span className={`absolute -top-6 left-0 ${det.color === 'green' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md whitespace-nowrap rounded-sm`}>
//                                         {det.class} {det.confidence}%
//                                     </span>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             ) : null}
            
//             {/* Full Screen Animations (Overlay on top of everything) */}
//             {systemState === 'capturing' && (<div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center"><div className="absolute inset-0 border-[20px] border-white/30 animate-pulse"></div><Camera size={48} className="text-white animate-bounce" /></div>)}
//             {systemState === 'analyzing' && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]"><div className="relative w-64 h-64 border-2 border-[#B8DB80]/50 rounded-lg overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-[#B8DB80] shadow-[0_0_15px_#B8DB80] animate-[scan_1.5s_linear_infinite]"></div></div><div className="mt-4 flex items-center gap-2 text-[#B8DB80] font-mono"><Activity size={16} className="animate-spin" /><span>Running AI Inference...</span></div></div>)}
            
//             {/* Monitor Footer Overlay */}
//             {systemState === 'result' && currentResult && (
//                 <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border border-white/10 z-20 pointer-events-none">
//                     <div className="flex items-center gap-3">
//                         {currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}
//                         <div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div></div>
//                     </div>
//                 </div>
//             )}

//             <div className="absolute top-4 left-4 bg-red-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40 text-white shadow-lg"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
//           </div>

//           {/* Controls */}
//           <div className="grid grid-cols-3 gap-4">
//              <div className="relative group">
//                 <input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" disabled={systemState !== 'idle'} />
                
//                 {/* Upload Button */}
//                 <label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer shadow-sm ${systemState === 'idle' ? 'bg-white/80 border-white hover:border-[#556B2F] hover:bg-white' : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'}`}>
//                     <Scan size={24} className="text-[#556B2F] mb-2" />
//                     <span className="font-bold text-slate-700 text-sm">Upload Image</span>
//                     <span className="text-[10px] text-slate-500">(Trigger Sensor)</span>
//                 </label>
//              </div>
             
//              {/* Reset Button (Updated Color) */}
//              <button onClick={handleReset} className="bg-slate-200 border border-slate-300 hover:border-red-400 hover:bg-red-100 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-sm">
//                  <RotateCcw size={24} className="text-slate-500 group-hover:text-red-600 transition-transform group-hover:-rotate-180" />
//                  <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-red-700">Reset System</span>
//              </button>
             
//              <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border transition-all shadow-sm ${systemState === 'result' ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
//                  <Printer size={24} className={systemState === 'result' ? 'text-emerald-600' : 'text-slate-400'} />
//                  <span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-700' : 'text-slate-400'}`}>Print Label</span>
//              </button>
//           </div>
//         </section>

//         {/* RIGHT: Stats & Logs */}
//         <section className="lg:col-span-4 flex flex-col gap-6">
           
//            {/* Status Card */}
//            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center justify-center shadow-md transition-all duration-500 min-h-[220px] bg-white ${!currentResult ? 'border-gray-200' : currentResult.color === 'green' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
//                 {!currentResult ? (
//                      <div className="flex flex-col items-center gap-2 text-slate-400">
//                          <Activity size={32} />
//                          <span>Ready for Inspection...</span>
//                      </div>
//                 ) : (
//                      <>
//                         <h2 className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Inspection Result</h2>
//                         <div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div>
//                         <div className="bg-white/60 px-3 py-1 rounded text-xs text-slate-600 border border-black/5 mb-3 font-medium shadow-sm">Primary: {currentResult.details}</div>
                        
//                         <div className="w-full text-left px-2 bg-white/50 rounded-lg py-2 border border-black/5 mb-3">
//                            <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Defects Found ({currentResult.all_detections.length})</p>
//                            <div className="max-h-20 overflow-y-auto custom-scrollbar pr-1">
//                                {currentResult.all_detections.map((d,i) => (
//                                    <div key={i} className="flex justify-between text-xs mb-1 border-b border-black/5 pb-1 last:border-0">
//                                        <span className={d.color==='red'?'text-red-600 font-medium':'text-green-600 font-medium'}>{d.class}</span>
//                                        <span className="text-slate-500">{d.confidence}%</span>
//                                    </div>
//                                ))}
//                            </div>
//                         </div>

//                         {/* Human Verification */}
//                         <div className="w-full pt-3 border-t border-black/10">
//                             {!verificationStatus ? (
//                                 <div className="flex justify-center gap-2">
//                                     <button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-green-500 hover:text-green-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsUp size={14} /> Correct
//                                     </button>
//                                     <button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
//                                         <ThumbsDown size={14} /> Incorrect
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
//                                     {verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} Recorded
//                                 </div>
//                             )}
//                         </div>
//                      </>
//                 )}
//            </div>

//            {/* Stats Cards */}
//            <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div>
//                   <div className="text-3xl font-mono text-slate-800">{stats.total}</div>
//               </div>
//               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//                   <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div>
//                   <div className="text-3xl font-mono text-red-500">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div>
//               </div>
//            </div>

//            {/* Logs - Updated Header Color & Logic */}
//            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
//               <div className="p-3 bg-[#ABE7B2] border-b border-gray-200 flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                       <Database size={16} className="text-slate-800" />
//                       <span className="text-sm font-bold text-slate-800">Database Logs</span>
//                   </div>
//                   <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-white hover:bg-white/80 text-slate-700 border border-gray-200 px-2 py-1 rounded transition-colors shadow-sm">
//                       <FileText size={12} /> CSV
//                   </button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//                   {logs.length === 0 ? (
//                       <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
//                           <Server size={32} className="mb-2" />
//                           <p className="text-xs">Database Empty</p>
//                       </div>
//                   ) : (
//                       logs.map((log, i) => (
//                           <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-[#ABE7B2] hover:shadow-md transition-all group">
//                               <div className="flex items-center gap-3">
//                                   <div className={`w-1.5 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                                   <div>
//                                       <div className="text-xs font-bold text-slate-800">{log.id}</div>
//                                       <div className="text-[10px] text-slate-500 flex items-center gap-1">
//                                           {/* Show Verification Status in Log */}
//                                           {log.verification && (
//                                               <span className={`flex items-center gap-0.5 ${log.verification === 'Correct' ? 'text-green-600' : 'text-orange-500'}`}>
//                                                   {log.verification === 'Correct' ? <CheckCheck size={10}/> : <AlertTriangle size={10}/>}
//                                               </span>
//                                           )}
//                                           <span>{log.all_detections ? log.all_detections.length : 0} items</span>
//                                       </div>
//                                   </div>
//                               </div>
//                               <div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
//                                   {log.color === 'green' ? 'PASS' : 'FAIL'}
//                               </div>
//                           </div>
//                       ))
//                   )}
//               </div>
//            </div>
//         </section>
//       </main>

//       {/* Notification Toast */}
//       {notification && (
//         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
//             <Wifi size={16} className="text-[#ABE7B2]" />
//             <span className="text-xs font-bold tracking-wide">{notification}</span>
//         </div>
//       )}

//       <style>{`
//         @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//       `}</style>
//     </div>
//   );
// };

// export default DefectoMCUDashboardLight;


// final one

import React, { useState, useRef } from 'react';
import { Camera, Printer, RotateCcw, Activity, Server, AlertTriangle, CheckCircle, Database, Cpu, Power, Scan, Wifi, Eye, FileText, ThumbsUp, ThumbsDown, Sun, Moon, CheckCheck, XCircle } from 'lucide-react';

const DefectoMCUDashboardLight = () => {
  // --- States ---
  const [systemState, setSystemState] = useState('idle');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
  const [notification, setNotification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleSensorTrigger = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Reset previous result states immediately for new scan
      setVerificationStatus(null);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      startAnalysis(imageUrl, file);
    }
  };

  const startAnalysis = async (imageUrl, file) => {
    setSystemState('capturing');
    showNotification("Sensor Triggered. Capturing Image...");

    setTimeout(async () => {
        setSystemState('analyzing');
        showNotification("Sending to Neural Engine (best.pt)...");

        const formData = new FormData();
        formData.append('file', file);

        try {
            // HOSTING NOTE: Upload korar por nicher Link ta change korte hobe
            const response = await fetch('https://mrt661-defectomcu-api.hf.space/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Backend connection failed");

            const resultData = await response.json();
            resultData.imageUrl = imageUrl; 
            processResult(resultData);

        } catch (error) {
            console.error(error);
            showNotification("Backend Error: Check Console");
        }
    }, 1500);
  };

  const processResult = (resultData) => {
    setCurrentResult(resultData);
    setSystemState('result');
    
    const isGood = resultData.color === 'green';
    
    setStats(prev => ({
      total: prev.total + 1,
      passed: isGood ? prev.passed + 1 : prev.passed,
      defective: !isGood ? prev.defective + 1 : prev.defective
    }));
    
    // Add new log to the top
    setLogs(prev => [resultData, ...prev]);
    showNotification(`Analysis Complete: Found ${resultData.all_detections?.length || 0} objects`);
  };

  // --- Label Generator ---
  const handleDownloadLabel = () => {
    if (!currentResult) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,250);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(5,5,390,240);
    
    ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
    ctx.fillText('DefectoMCU Inspection System', 20, 35);
    ctx.font = '14px monospace'; ctx.fillStyle = '#333';
    ctx.fillText(`ID: ${currentResult.id}`, 20, 65);
    ctx.font = '12px Arial'; ctx.fillText(`Time: ${currentResult.timestamp}`, 260, 65);
    
    ctx.font = 'bold 32px Arial'; 
    ctx.fillStyle = currentResult.color === 'green' ? '#166534' : '#dc2626'; 
    ctx.fillText(`${currentResult.color === 'green' ? 'PASS' : 'FAIL'}`, 20, 110);
    
    ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#000';
    ctx.fillText(`Detected Items:`, 20, 140); 
    
    ctx.font = '12px Courier New'; ctx.fillStyle = '#000';
    const detections = currentResult.all_detections || [];
    let yPos = 160;
    
    if (detections.length === 0) {
        ctx.fillText("No Objects Detected", 20, yPos);
    } else {
        detections.slice(0, 4).forEach((det) => {
            const text = `${det.class} (${det.confidence}%)`;
            ctx.fillStyle = det.color === 'red' ? '#dc2626' : '#166534';
            ctx.fillText(text, 20, yPos);
            yPos += 15;
        });
        if (detections.length > 4) {
             ctx.fillStyle = '#000';
             ctx.fillText(`...and ${detections.length - 4} more`, 20, yPos);
        }
    }
    
    const link = document.createElement('a');
    link.download = `${currentResult.id}_label.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) { showNotification("No data to export."); return; }
    const headers = ["ID", "Time", "Status", "Primary_Class", "Verification", "Total_Objects", "Confidence"];
    const csvContent = [
        headers.join(","),
        ...logs.map(log => `${log.id},${log.timestamp},${log.status},${log.details},${log.verification || 'Pending'},${log.all_detections?.length},${log.confidence}%`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs.csv`;
    link.click();
  };

  const handleReset = () => {
    setSystemState('idle'); setSelectedImage(null); setCurrentResult(null); setVerificationStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showNotification("System Reset. Sensor Active.");
  };

  const handleVerification = (isCorrect) => {
      const status = isCorrect ? 'Correct' : 'Incorrect';
      setVerificationStatus(isCorrect ? 'correct' : 'incorrect');
      
      if (currentResult) {
          setLogs(prevLogs => prevLogs.map(log => 
              log.id === currentResult.id 
                  ? { ...log, verification: status } 
                  : log
          ));
      }
      
      showNotification(isCorrect ? "Verified: Correct - Log Updated" : "Flagged: Model Error - Log Updated");
  }

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#B8DB80] text-slate-800 font-sans p-4 md:p-6 overflow-hidden flex flex-col transition-colors duration-500">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg shadow-md bg-[#7A9B45]">
            <Cpu size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DefectoMCU Monitor</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Wifi size={10} className="text-[#556B2F]" /> Connected to Neural Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div>
              <div className="flex items-center justify-end gap-2">
                 <span className={`w-2 h-2 rounded-full ${systemState === 'idle' ? 'bg-[#7A9B45] animate-pulse' : 'bg-amber-400'}`}></span>
                 <span className="font-mono text-sm font-bold text-slate-700">
                    {systemState === 'idle' ? 'SENSOR ONLINE' : systemState === 'capturing' ? 'CAPTURING...' : systemState === 'analyzing' ? 'PROCESSING...' : 'RESULT READY'}
                 </span>
              </div>
           </div>
           <div className="h-8 w-[1px] bg-gray-200"></div>
           <button title="System Power" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Power size={20} className="text-slate-400 hover:text-red-500" />
           </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Vision & Controls */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Monitor Screen */}
          <div className="bg-black rounded-2xl overflow-hidden border-4 border-[#7A9B45]/50 shadow-2xl relative aspect-video flex items-center justify-center group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black z-0">
               {systemState === 'idle' && (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
                     <Eye size={64} className="text-[#B8DB80] animate-pulse mb-4" />
                     <div className="text-[#B8DB80] font-mono text-sm tracking-[0.2em] animate-pulse">SENSOR STANDBY...</div>
                  </div>
               )}
            </div>
            
            {/* The Image Wrapper */}
            {selectedImage ? (
                <div className="relative max-w-full max-h-full z-10 flex justify-center items-center">
                    <img 
                        src={selectedImage} 
                        alt="Captured PCB" 
                        className="block max-w-full max-h-full"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                    />
                    
                    {/* Bounding Boxes */}
                    {systemState === 'result' && currentResult && currentResult.all_detections && (
                        <div className="absolute inset-0">
                            {currentResult.all_detections.map((det, index) => (
                                <div key={index} 
                                    className={`absolute border-2 ${det.color === 'green' ? 'border-green-500 shadow-[0_0_15px_green]' : 'border-red-500 shadow-[0_0_15px_red]'} transition-all duration-500`}
                                    style={{
                                        top: det.box.top, 
                                        left: det.box.left, 
                                        width: det.box.width, 
                                        height: det.box.height
                                    }}>
                                    <span className={`absolute -top-6 left-0 ${det.color === 'green' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md whitespace-nowrap rounded-sm`}>
                                        {det.class} {det.confidence}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
            
            {/* Animations */}
            {systemState === 'capturing' && (<div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center"><div className="absolute inset-0 border-[20px] border-white/30 animate-pulse"></div><Camera size={48} className="text-white animate-bounce" /></div>)}
            {systemState === 'analyzing' && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]"><div className="relative w-64 h-64 border-2 border-[#B8DB80]/50 rounded-lg overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-[#B8DB80] shadow-[0_0_15px_#B8DB80] animate-[scan_1.5s_linear_infinite]"></div></div><div className="mt-4 flex items-center gap-2 text-[#B8DB80] font-mono"><Activity size={16} className="animate-spin" /><span>Running AI Inference...</span></div></div>)}
            
            {/* Monitor Footer Overlay */}
            {systemState === 'result' && currentResult && (
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg flex items-center justify-between backdrop-blur-md border border-white/10 z-20 pointer-events-none">
                    <div className="flex items-center gap-3">
                        {currentResult.color === 'green' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-red-400" />}
                        <div><div className={`font-bold text-lg ${currentResult.color === 'green' ? 'text-green-300' : 'text-red-300'}`}>{currentResult.status}</div></div>
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-4 bg-red-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 z-40 text-white shadow-lg"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> LIVE</div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 gap-4">
             <div className="relative group">
                <input type="file" ref={fileInputRef} onChange={handleSensorTrigger} accept="image/*" className="hidden" id="sensor-trigger" />
                
                {/* 1. Updated Trigger Button: Theme Color + Darker Hover */}
                <label htmlFor="sensor-trigger" className={`h-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer shadow-sm bg-[#EBF4DD] border-[#B8DB80] hover:bg-[#8bc598] hover:border-[#7A9B45]`}>
                    <Scan size={24} className="text-[#556B2F] mb-2" />
                    <span className="font-bold text-slate-800 text-sm">Trigger Sensor</span>
                    <span className="text-[10px] text-slate-600">(Upload Image)</span>
                </label>
             </div>
             
             {/* 3. Updated Reset Button: White/Theme Neutral + Red Hover */}
             <button onClick={handleReset} className="bg-white border border-gray-300 hover:bg-red-50 hover:border-red-400 rounded-xl p-4 flex flex-col items-center justify-center transition-all group shadow-sm">
                 <RotateCcw size={24} className="text-slate-500 group-hover:text-red-600 transition-transform group-hover:-rotate-180" />
                 <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-red-700">Reset System</span>
             </button>
             
             <button onClick={handleDownloadLabel} disabled={systemState !== 'result'} className={`rounded-xl p-4 flex flex-col items-center justify-center border transition-all shadow-sm ${systemState === 'result' ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                 <Printer size={24} className={systemState === 'result' ? 'text-emerald-600' : 'text-slate-400'} />
                 <span className={`mt-2 text-sm font-medium ${systemState === 'result' ? 'text-emerald-700' : 'text-slate-400'}`}>Print Label</span>
             </button>
          </div>
        </section>

        {/* RIGHT: Stats & Logs */}
        <section className="lg:col-span-4 flex flex-col gap-6">
           
           {/* Status Card */}
           <div className={`p-6 rounded-2xl border flex flex-col items-center text-center justify-center shadow-md transition-all duration-500 min-h-[220px] bg-white ${!currentResult ? 'border-gray-200' : currentResult.color === 'green' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                {!currentResult ? (
                     <div className="flex flex-col items-center gap-2 text-slate-400">
                         <Activity size={32} />
                         <span>Ready for Inspection...</span>
                     </div>
                ) : (
                     <>
                        <h2 className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Inspection Result</h2>
                        <div className={`text-4xl font-black mb-1 ${currentResult.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>{currentResult.color === 'green' ? 'PASS' : 'FAIL'}</div>
                        <div className="bg-white/60 px-3 py-1 rounded text-xs text-slate-600 border border-black/5 mb-3 font-medium shadow-sm">Primary: {currentResult.details}</div>
                        
                        <div className="w-full text-left px-2 bg-white/50 rounded-lg py-2 border border-black/5 mb-3">
                           <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Defects Found ({currentResult.all_detections.length})</p>
                           <div className="max-h-20 overflow-y-auto custom-scrollbar pr-1">
                               {currentResult.all_detections.map((d,i) => (
                                   <div key={i} className="flex justify-between text-xs mb-1 border-b border-black/5 pb-1 last:border-0">
                                       <span className={d.color==='red'?'text-red-600 font-medium':'text-green-600 font-medium'}>{d.class}</span>
                                       <span className="text-slate-500">{d.confidence}%</span>
                                   </div>
                               ))}
                           </div>
                        </div>

                        {/* Human Verification */}
                        <div className="w-full pt-3 border-t border-black/10">
                            {!verificationStatus ? (
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => handleVerification(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-green-500 hover:text-green-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
                                        <ThumbsUp size={14} /> Correct
                                    </button>
                                    <button onClick={() => handleVerification(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-orange-500 hover:text-orange-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">
                                        <ThumbsDown size={14} /> Incorrect
                                    </button>
                                </div>
                            ) : (
                                <div className={`text-xs font-bold flex items-center justify-center gap-2 ${verificationStatus === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {verificationStatus === 'correct' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} Recorded
                                </div>
                            )}
                        </div>
                     </>
                )}
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Total Scanned</div>
                  <div className="text-3xl font-mono text-slate-800">{stats.total}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Defect Rate</div>
                  <div className="text-3xl font-mono text-red-500">{stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(0) : 0}<span className="text-sm">%</span></div>
              </div>
           </div>

           {/* Logs - Updated Header Color & Logic */}
           <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 bg-[#ABE7B2] border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <Database size={16} className="text-slate-800" />
                      <span className="text-sm font-bold text-slate-800">Database Logs</span>
                  </div>
                  <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] bg-white hover:bg-white/80 text-slate-700 border border-gray-200 px-2 py-1 rounded transition-colors shadow-sm">
                      <FileText size={12} /> CSV
                  </button>
              </div>
              {/* 4. Scrollable Log Box (Max Height) */}
              <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar max-h-[300px] lg:max-h-[calc(100vh-500px)]">
                  {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[100px]">
                          <Server size={32} className="mb-2" />
                          <p className="text-xs">Database Empty</p>
                      </div>
                  ) : (
                      logs.map((log, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-[#ABE7B2] hover:shadow-md transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className={`w-1.5 h-8 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-800">{log.id}</div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                          {/* Show Verification Status in Log */}
                                          {log.verification && (
                                              <span className={`flex items-center gap-0.5 ${log.verification === 'Correct' ? 'text-green-600' : 'text-orange-500'}`}>
                                                  {log.verification === 'Correct' ? <CheckCheck size={10}/> : <AlertTriangle size={10}/>}
                                              </span>
                                          )}
                                          <span>{log.all_detections ? log.all_detections.length : 0} items</span>
                                      </div>
                                  </div>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-1 rounded ${log.color === 'green' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                  {log.color === 'green' ? 'PASS' : 'FAIL'}
                              </div>
                          </div>
                      ))
                  )}
              </div>
           </div>
        </section>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
            <Wifi size={16} className="text-[#ABE7B2]" />
            <span className="text-xs font-bold tracking-wide">{notification}</span>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default DefectoMCUDashboardLight;

