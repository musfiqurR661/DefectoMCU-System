import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCheck,
  CheckCircle,
  Cpu,
  Database,
  Eye,
  FileText,
  Printer,
  RotateCcw,
  Scan,
  Server,
  ThumbsDown,
  ThumbsUp,
  Wifi,
} from 'lucide-react';

const DefectoMCUDashboardLight = () => {
  const [systemState, setSystemState] = useState('idle');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, passed: 0, defective: 0 });
  const [notification, setNotification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const fileInputRef = useRef(null);
  const boardFrameRef = useRef(null);
  const boardImageRef = useRef(null);
  const [boardFrame, setBoardFrame] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const defectRate = stats.total > 0 ? ((stats.defective / stats.total) * 100).toFixed(1) : '0.0';
  const detections = currentResult?.all_detections || [];
  const resultIsGood = currentResult?.color === 'green';

  const updateBoardFrame = () => {
    if (!boardFrameRef.current || !boardImageRef.current) return;

    const containerRect = boardFrameRef.current.getBoundingClientRect();
    const imageRect = boardImageRef.current.getBoundingClientRect();

    setBoardFrame({
      left: imageRect.left - containerRect.left,
      top: imageRect.top - containerRect.top,
      width: imageRect.width,
      height: imageRect.height,
    });
  };

  useEffect(() => {
    updateBoardFrame();

    const handleResize = () => updateBoardFrame();
    window.addEventListener('resize', handleResize);

    const observer = typeof ResizeObserver !== 'undefined' && boardImageRef.current
      ? new ResizeObserver(handleResize)
      : null;

    if (observer && boardImageRef.current) {
      observer.observe(boardImageRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [selectedImage, currentResult]);

  const parsePercentValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    return Number.parseFloat(value.replace('%', '')) || 0;
  };

  const getDetectionStyle = (box) => {
    const rawLeftPct = parsePercentValue(box.left);
    const rawTopPct = parsePercentValue(box.top);
    const rawWidthPct = parsePercentValue(box.width);
    const rawHeightPct = parsePercentValue(box.height);

    const leftPct = Math.min(100, Math.max(0, rawLeftPct));
    const topPct = Math.min(100, Math.max(0, rawTopPct));
    const widthPct = Math.min(100 - leftPct, Math.max(0, rawWidthPct));
    const heightPct = Math.min(100 - topPct, Math.max(0, rawHeightPct));

    return {
      left: `${boardFrame.left + (leftPct / 100) * boardFrame.width}px`,
      top: `${boardFrame.top + (topPct / 100) * boardFrame.height}px`,
      width: `${(widthPct / 100) * boardFrame.width}px`,
      height: `${(heightPct / 100) * boardFrame.height}px`,
    };
  };

  const getLabelStyle = () => ({
    bottom: '100%',
    left: '0px',
    transform: 'translateY(-4px)',
    maxWidth: '200px',
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  };

  const processResult = (resultData) => {
    setCurrentResult(resultData);
    setSystemState('result');

    const isGood = resultData.color === 'green';
    setStats((prev) => ({
      total: prev.total + 1,
      passed: isGood ? prev.passed + 1 : prev.passed,
      defective: !isGood ? prev.defective + 1 : prev.defective,
    }));

    setLogs((prev) => [resultData, ...prev]);
    showNotification(`Inspection Complete: ${resultData.status} (${resultData.confidence}%)`);
  };

  const startAnalysis = async (imageUrl, file) => {
    setSystemState('capturing');
    showNotification('Sensor Triggered. Capturing Image...');

    setTimeout(async () => {
      setSystemState('analyzing');
      showNotification('Sending to Neural Engine (best.pt)...');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://mrt661-defectomcu-api.hf.space/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Backend connection failed');

        const resultData = await response.json();
        resultData.imageUrl = imageUrl;
        processResult(resultData);
      } catch (error) {
        console.error(error);
        showNotification('Backend Error: Check Console');
      }
    }, 1400);
  };

  const handleSensorTrigger = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVerificationStatus(null);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    startAnalysis(imageUrl, file);
  };

  const handleReset = () => {
    setSystemState('idle');
    setSelectedImage(null);
    setCurrentResult(null);
    setVerificationStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showNotification('System Reset. Sensor Active.');
  };

  const handleVerification = (isCorrect) => {
    const status = isCorrect ? 'Correct' : 'Incorrect';
    setVerificationStatus(isCorrect ? 'correct' : 'incorrect');

    if (currentResult) {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === currentResult.id
            ? { ...log, verification: status }
            : log,
        ),
      );
    }

    showNotification(isCorrect ? 'Verified: Correct - Log Updated' : 'Flagged: Model Error - Log Updated');
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      showNotification('No data to export.');
      return;
    }

    const headers = ['ID', 'Time', 'Status', 'Primary_Class', 'Verification', 'Total_Objects', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...logs.map(
        (log) =>
          `${log.id},${log.timestamp},${log.status},${log.details},${log.verification || 'Pending'},${log.all_detections?.length || 0},${log.confidence}%`,
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logs.csv';
    link.click();
  };

  const handleDownloadLabel = () => {
    if (!currentResult) return;

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 300);
    ctx.strokeStyle = '#2f3e46';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 484, 284);

    ctx.fillStyle = '#1f2937';
    ctx.font = '700 22px "IBM Plex Sans", sans-serif';
    ctx.fillText('DefectoMCU Inspection Label', 24, 42);

    ctx.font = '600 14px "IBM Plex Sans", sans-serif';
    ctx.fillText(`ID: ${currentResult.id}`, 24, 70);
    ctx.fillText(`Time: ${currentResult.timestamp}`, 24, 92);

    ctx.font = '800 52px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = resultIsGood ? '#1b8f45' : '#d52f2f';
    ctx.fillText(resultIsGood ? 'PASS' : 'FAIL', 24, 152);

    ctx.font = '700 16px "IBM Plex Sans", sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText(`Primary Class: ${currentResult.details}`, 24, 182);
    ctx.fillText(`Confidence: ${currentResult.confidence}%`, 24, 206);

    const link = document.createElement('a');
    link.download = `${currentResult.id}_label.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#edf4e8_0%,_#e8eef1_48%,_#dde5ea_100%)] p-4 text-slate-800 md:p-6 xl:p-8">
      <header className="mb-4 shrink-0 rounded-3xl border border-slate-200 bg-white/95 px-5 py-4 shadow-[0_14px_35px_rgba(61,83,103,0.14)] md:mb-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#3f8f66] p-3 shadow-lg">
              <Cpu size={30} className="text-white" />
            </div>
            <div>
              <h1 className="text-[2rem] font-extrabold tracking-tight text-slate-800">DefectoMCU Monitor</h1>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-600">
                <Wifi size={16} className="text-[#3f8f66]" /> Connected to Neural Engine
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f7faf5] px-5 py-3 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">System Status</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-extrabold text-slate-700">
              <span
                className={`h-3 w-3 rounded-full ${
                  systemState === 'idle' ? 'bg-green-500 animate-pulse' : systemState === 'result' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              ></span>
              {systemState === 'idle'
                ? 'SENSOR ONLINE'
                : systemState === 'capturing'
                  ? 'CAPTURING...'
                  : systemState === 'analyzing'
                    ? 'PROCESSING...'
                    : 'RESULT READY'}
            </p>
          </div>
        </div>
      </header>

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-5 xl:grid-cols-12 2xl:gap-6">
        <section className="flex min-h-0 flex-col xl:col-span-8">
          <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border-2 border-[#9fb9a5] bg-white p-3 shadow-[0_18px_42px_rgba(63,143,102,0.18)] md:p-4">
            <div ref={boardFrameRef} className="relative min-h-[300px] flex-1 overflow-visible rounded-2xl border-[5px] border-[#2f6f4d] bg-slate-900 md:min-h-[360px] xl:min-h-0">
              <div className="absolute inset-0 overflow-hidden rounded-[18px]">
                {!selectedImage && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-[#d8f0dd]">
                    <Eye size={76} className="animate-pulse" />
                    <p className="mt-5 text-2xl font-bold tracking-[0.18em]">SENSOR STANDBY</p>
                  </div>
                )}

                {selectedImage && (
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <img
                      ref={boardImageRef}
                      onLoad={updateBoardFrame}
                      src={selectedImage}
                      alt="Detected board"
                      className={`h-full w-auto max-h-full max-w-full object-contain transition-opacity duration-300 ${
                        systemState === 'capturing' ? 'opacity-45' : 'opacity-100'
                      }`}
                    />
                  </div>
                )}
              </div>

              {systemState === 'result' && detections.length > 0 && (
                <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[18px]">
                  {detections.map((det, idx) => {
                    const boxStyle = getDetectionStyle(det.box);

                    return (
                      <div key={`${det.class}-${idx}`} className="absolute" style={boxStyle}>
                        <div
                          className={`absolute inset-0 rounded-sm border-[3px] ${
                            det.color === 'green'
                              ? 'border-green-500 bg-transparent shadow-[0_0_0_1px_rgba(16,185,129,0.35)]'
                              : 'border-red-500 bg-transparent shadow-[0_0_0_1px_rgba(239,68,68,0.35)]'
                          }`}
                        />
                        <div
                          className={`absolute rounded-sm border border-white/35 px-2.5 py-1.5 text-[12px] font-extrabold tracking-wide text-white shadow-lg ${
                            det.color === 'green' ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={getLabelStyle()}
                        >
                          <span className="block leading-tight">{det.class}</span>
                          <span className="block whitespace-nowrap text-[12px] font-bold leading-tight">{det.confidence}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {systemState === 'capturing' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20">
                  <div className="absolute inset-0 animate-pulse border-[24px] border-white/25"></div>
                  <Camera size={64} className="animate-bounce text-white" />
                </div>
              )}

              {systemState === 'analyzing' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55">
                  <div className="relative h-72 w-72 overflow-hidden rounded-xl border-2 border-[#9cd4ad]/80">
                    <div className="absolute left-0 top-0 h-1 w-full animate-[scan_1.6s_linear_infinite] bg-[#b8f4c5] shadow-[0_0_22px_#b8f4c5]"></div>
                  </div>
                  <p className="mt-6 flex items-center gap-2 text-xl font-bold text-[#d6f6de]">
                    <Activity size={22} className="animate-spin" /> YOLO Inference Running...
                  </p>
                </div>
              )}

              {systemState === 'result' && currentResult && (
                <div className="absolute right-5 top-5 z-30 rounded-xl border border-white/60 bg-white/95 px-5 py-3 shadow-xl">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Inspection Result</p>
                  <p className={`text-3xl font-extrabold ${resultIsGood ? 'text-green-600' : 'text-red-600'}`}>
                    {resultIsGood ? 'PASS' : 'FAIL'}
                  </p>
                  <p className="text-xl font-bold text-slate-700">{currentResult.confidence}% Confidence</p>
                </div>
              )}

              <div className="absolute left-5 top-5 z-30 rounded-full bg-red-600 px-4 py-1 text-sm font-extrabold tracking-[0.12em] text-white shadow-lg">
                LIVE
              </div>
            </div>
          </div>

          <div className="mt-4 shrink-0 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSensorTrigger}
                accept="image/*"
                className="hidden"
                id="sensor-trigger"
              />
              <label
                htmlFor="sensor-trigger"
                className="flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-green-700 bg-green-600 px-4 py-6 text-center shadow-lg transition-all hover:-translate-y-0.5 hover:bg-green-700"
              >
                <Scan size={30} className="text-white" />
                <span className="mt-2 text-xl font-extrabold text-white">Trigger Sensor</span>
                <span className="text-sm font-semibold text-green-100">Upload Board Image</span>
              </label>
            </div>

            <button
              onClick={handleReset}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-400 bg-slate-300 px-4 py-6 text-center shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-400"
            >
              <RotateCcw size={30} className="text-slate-800" />
              <span className="mt-2 text-xl font-extrabold text-slate-800">Reset System</span>
            </button>

            <button
              onClick={handleDownloadLabel}
              disabled={systemState !== 'result'}
              className={`flex flex-col items-center justify-center rounded-2xl border px-4 py-6 text-center shadow-lg transition-all ${
                systemState === 'result'
                  ? 'border-blue-700 bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700'
                  : 'cursor-not-allowed border-slate-300 bg-slate-200 opacity-70'
              }`}
            >
              <Printer size={30} className={systemState === 'result' ? 'text-white' : 'text-slate-500'} />
              <span className={`mt-2 text-xl font-extrabold ${systemState === 'result' ? 'text-white' : 'text-slate-500'}`}>
                Print Label
              </span>
            </button>
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-5 xl:col-span-4">
          <div
            className={`rounded-3xl border-2 p-6 shadow-[0_14px_30px_rgba(33,58,79,0.14)] ${
              !currentResult
                ? 'border-slate-300 bg-white'
                : resultIsGood
                  ? 'border-green-400 bg-[#eefaf1]'
                  : 'border-red-400 bg-[#fff1f1]'
            }`}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500">Inspection Result</p>
            {!currentResult ? (
              <div className="mt-5 flex items-center gap-3 text-lg font-semibold text-slate-500">
                <Activity size={30} /> Waiting for sensor trigger...
              </div>
            ) : (
              <>
                <div className={`mt-3 text-6xl font-black ${resultIsGood ? 'text-green-600' : 'text-red-600'}`}>
                  {resultIsGood ? 'PASS' : 'FAIL'}
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-800">{currentResult.confidence}% CONFIDENCE</p>
                <p className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-700">
                  Class: {currentResult.details}
                </p>

                <div className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-slate-500">
                    Detected Defects ({detections.length})
                  </p>
                  <div className="custom-scrollbar mt-2 max-h-28 space-y-2 overflow-y-auto pr-1">
                    {detections.length === 0 ? (
                      <p className="text-base font-semibold text-green-700">No defect detected</p>
                    ) : (
                      detections.map((d, i) => (
                        <div key={`${d.class}-${i}`} className="flex items-center justify-between text-base">
                          <span className={d.color === 'red' ? 'font-bold text-red-600' : 'font-bold text-green-600'}>{d.class}</span>
                          <span className="font-bold text-slate-600">{d.confidence}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-300 pt-4">
                  {!verificationStatus ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleVerification(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-green-400 bg-white px-3 py-3 text-base font-bold text-green-700 transition-all hover:bg-green-50"
                      >
                        <ThumbsUp size={18} /> Correct
                      </button>
                      <button
                        onClick={() => handleVerification(false)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-orange-400 bg-white px-3 py-3 text-base font-bold text-orange-700 transition-all hover:bg-orange-50"
                      >
                        <ThumbsDown size={18} /> Incorrect
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center gap-2 text-lg font-extrabold ${verificationStatus === 'correct' ? 'text-green-700' : 'text-orange-700'}`}>
                      {verificationStatus === 'correct' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                      Review Recorded
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#8ab59a] bg-white p-5 shadow-md">
              <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-slate-500">Total Scanned</p>
              <p className="mt-2 text-5xl font-black text-slate-800">{stats.total}</p>
            </div>
            <div className="rounded-2xl border-2 border-[#cc8c8c] bg-white p-5 shadow-md">
              <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-slate-500">Defect Rate</p>
              <p className="mt-2 text-5xl font-black text-red-600">{defectRate}%</p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-slate-300 bg-white shadow-[0_14px_30px_rgba(33,58,79,0.1)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#e3efdb] px-5 py-4">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-slate-700" />
                <p className="text-xl font-extrabold text-slate-800">Database Logs</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100"
              >
                <FileText size={15} /> Export CSV
              </button>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              {logs.length === 0 ? (
                <div className="flex min-h-[150px] flex-col items-center justify-center text-slate-400">
                  <Server size={42} />
                  <p className="mt-2 text-lg font-semibold">No records yet</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={`${log.id}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-2 rounded-full ${log.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-base font-bold text-slate-800">{log.id}</p>
                        <p className="text-sm font-semibold text-slate-500">
                          {log.all_detections?.length || 0} detections
                          {log.verification && (
                            <span className={`ml-2 inline-flex items-center gap-1 font-bold ${log.verification === 'Correct' ? 'text-green-700' : 'text-orange-700'}`}>
                              {log.verification === 'Correct' ? <CheckCheck size={14} /> : <AlertTriangle size={14} />}
                              {log.verification}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className={`rounded-lg px-3 py-1 text-base font-extrabold ${log.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.color === 'green' ? 'PASS' : 'FAIL'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {notification && (
        <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-8 py-3 text-lg font-bold text-slate-700 shadow-2xl">
          <span className="mr-2 inline-flex align-middle">
            <Wifi size={20} className="text-[#3f8f66]" />
          </span>
          {notification}
        </div>
      )}

      <style>{`@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}</style>
    </div>
  );
};

export default DefectoMCUDashboardLight;
