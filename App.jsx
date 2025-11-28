import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Wind, Zap, Thermometer, AlertTriangle, 
  Database, Wifi, Cpu, Map, Terminal, Crosshair, 
  Server, Shield, RefreshCw, ChevronRight, Play, Info, XCircle,
  HardDrive, MemoryStick
} from 'lucide-react';

// Custom Icon defined here to avoid scope issues
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/**
 * ------------------------------------------------------------------
 * 1. VISUAL CORE: PLANET RENDERER (Canvas)
 * โชว์สกิล: Computer Graphics, Math, Optimization
 * ------------------------------------------------------------------
 */
const PlanetCanvas = ({ alertMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let rotation = 0;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // สร้างจุดบนดาว (Terrain Data)
    const particles = [];
    const particleCount = 600;
    
    // คำนวณรัศมีเริ่มต้น
    let radius = 100; 
    if (canvas.width) {
       radius = Math.min(canvas.width, canvas.height) * 0.35;
    }

    for (let i = 0; i < particleCount; i++) {
      // Randomized spherical distribution
      const u = Math.random();
      const v = Math.random();
      const thetaR = 2 * Math.PI * u;
      const phiR = Math.acos(2 * v - 1);
      
      particles.push({
        theta: thetaR,
        phi: phiR,
        size: Math.random() * 1.5 + 0.5,
        alt: Math.random() * 10 // Altitude variation
      });
    }

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      rotation += 0.002;

      // Draw Scanning Ring
      ctx.strokeStyle = alertMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(14, 165, 233, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      // Render Particles
      particles.forEach(p => {
        // Rotate
        const x = radius * Math.sin(p.phi) * Math.cos(p.theta + rotation);
        const y = radius * Math.sin(p.phi) * Math.sin(p.theta + rotation);
        const z = radius * Math.cos(p.phi);

        // Tilt planet slightly
        const tilt = 0.3;
        const y_tilted = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z_tilted = y * Math.sin(tilt) + z * Math.cos(tilt);

        // Projection
        const scale = 300 / (300 - z_tilted);
        const x2d = cx + x * scale;
        const y2d = cy + y_tilted * scale;

        // Draw only front-facing particles
        if (z_tilted < 0) {
           const alpha = (Math.abs(z_tilted) / radius);
           ctx.fillStyle = alertMode 
             ? `rgba(239, 68, 68, ${alpha})` 
             : `rgba(14, 165, 233, ${alpha})`;
           
           ctx.beginPath();
           ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
           ctx.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [alertMode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

/**
 * ------------------------------------------------------------------
 * 2. ALGORITHM CORE: ROVER PATHFINDING (Grid Simulation)
 * โชว์สกิล: Algorithms (BFS/Pathfinding), State Management
 * ------------------------------------------------------------------
 */
const RoverSystem = () => {
  const GRID_SIZE = 5;
  const [roverPos, setRoverPos] = useState(0); // Index 0-24
  const [targetPos, setTargetPos] = useState(24);
  const [path, setPath] = useState([]);
  const [isComputing, setIsComputing] = useState(false);

  // Simple BFS Simulation for visual
  const calculatePath = () => {
    setIsComputing(true);
    // Mock calculation delay to show "Processing" status
    setTimeout(() => {
       const newPath = [];
       let current = roverPos;
       // Simple visual path logic (Right then Down)
       const row = Math.floor(current / GRID_SIZE);
       const col = current % GRID_SIZE;
       const targetRow = Math.floor(targetPos / GRID_SIZE);
       const targetCol = targetPos % GRID_SIZE;

       // Logic to generate steps
       let r = row, c = col;
       while(c < targetCol) { c++; newPath.push(r * GRID_SIZE + c); }
       while(r < targetRow) { r++; newPath.push(r * GRID_SIZE + c); }
       
       setPath(newPath);
       
       // Animate movement
       let step = 0;
       const moveInterval = setInterval(() => {
         if (step < newPath.length) {
           setRoverPos(newPath[step]);
           step++;
         } else {
           clearInterval(moveInterval);
           setIsComputing(false);
         }
       }, 300);

    }, 800);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-cyan-400 font-mono text-sm flex items-center gap-2">
          <Map size={14} /> ROVER_NAV_SYSTEM
        </h3>
        <button 
          onClick={calculatePath}
          disabled={isComputing || roverPos === targetPos}
          className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded disabled:opacity-50 flex items-center gap-1"
        >
          {isComputing ? 'COMPUTING...' : 'START MISSION'} <Play size={10} />
        </button>
      </div>
      
      <div className="grid grid-cols-5 gap-1 aspect-square">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const isRover = i === roverPos;
          const isTarget = i === targetPos;
          const isPath = path.includes(i);
          
          return (
            <div key={i} className={`
              rounded-sm border border-slate-800 relative flex items-center justify-center
              ${isRover ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : ''}
              ${isTarget ? 'bg-orange-500' : ''}
              ${isPath && !isRover ? 'bg-cyan-900/50' : 'bg-slate-900'}
            `}>
              {isRover && <Cpu size={12} className="text-white animate-spin-slow" />}
              {isTarget && <Crosshair size={12} className="text-white" />}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-slate-500 font-mono">
        COORD: [{Math.floor(roverPos / GRID_SIZE)}, {roverPos % GRID_SIZE}]
      </div>
    </div>
  );
};

/**
 * ------------------------------------------------------------------
 * 3. IOT CORE: REAL-TIME DATA MONITOR
 * โชว์สกิล: Handling Streams, Data Visualization
 * ------------------------------------------------------------------
 */
const SensorGraph = ({ label, value, color, unit }) => {
  // Generate fake historical data for the sparkline
  const history = useMemo(() => Array.from({ length: 20 }, () => Math.random() * 100), []);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
        <span>{label}</span>
        <span className={color}>{value.toFixed(1)} {unit}</span>
      </div>
      <div className="h-8 flex items-end gap-[2px]">
        {history.map((h, i) => (
          <div 
            key={i} 
            className={`w-full bg-slate-800 rounded-sm relative overflow-hidden`}
            style={{ height: '100%' }}
          >
             <motion.div 
               initial={{ height: 0 }}
               animate={{ height: `${i === history.length - 1 ? value : Math.random() * 60 + 20}%` }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
               className={`absolute bottom-0 w-full opacity-60 ${color.replace('text-', 'bg-')}`}
             />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ------------------------------------------------------------------
 * MAIN APP COMPONENT
 * ------------------------------------------------------------------
 */
export default function NexusCommand() {
  const [time, setTime] = useState(new Date());
  const [logs, setLogs] = useState([
    { id: 'init-1', text: "SYSTEM INITIALIZED...", type: "info" },
    { id: 'init-2', text: "CONNECTING TO SATELLITE LINK...", type: "info" },
    { id: 'init-3', text: "CONNECTION ESTABLISHED (PING 450ms)", type: "success" }
  ]);
  
  // Simulated Sensor Data
  const [oxygen, setOxygen] = useState(98.5);
  const [temp, setTemp] = useState(-62.0);
  const [energy, setEnergy] = useState(87.4);
  const [alertMode, setAlertMode] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true); // State to control Briefing Modal

  // Clock & Data Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      
      // Simulate fluctuation
      setOxygen(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5))));
      setTemp(prev => prev + (Math.random() - 0.5));
      setEnergy(prev => Math.max(0, prev - 0.05)); // Energy slowly drains

      // Random Event
      if (Math.random() > 0.98) {
         addLog("WARNING: SOLAR FLARE DETECTED", "warning");
         setAlertMode(true);
         setTimeout(() => {
             setAlertMode(false);
             addLog("SOLAR FLARE PASSED. SYSTEMS NORMAL.", "success");
         }, 4000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // FIXED: Use String template with Base36 random string for absolute uniqueness
  const addLog = (text, type) => {
    setLogs(prev => {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return [...prev.slice(-5), { id: uniqueId, text, type }];
    });
  };

  const handleReboot = () => {
    setOxygen(100);
    setEnergy(100);
    addLog("MANUAL SYSTEM REBOOT INITIATED", "info");
    addLog("RESOURCES REPLENISHED", "success");
  };

  return (
    <div className={`min-h-screen bg-black text-slate-200 font-sans overflow-hidden transition-colors duration-500 relative ${alertMode ? 'shadow-[inset_0_0_50px_rgba(220,38,38,0.2)]' : ''}`}>
      
      {/* BRIEFING MODAL */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900/90 border border-cyan-500/50 p-6 rounded-2xl max-w-2xl w-full relative overflow-hidden"
            >
              {/* Background Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

              <button 
                onClick={() => setShowBriefing(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-cyan-500 transition-colors"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Info size={28} className="text-cyan-500" />
                <h2 className="text-2xl font-bold text-white tracking-wide">MISSION BRIEFING: NEXUS CMD</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
                  <p>
                    <strong className="text-cyan-400">ยินดีต้อนรับสู่ศูนย์บัญชาการอาณานิคมดาวอังคาร (Mars Colony Command Center)</strong>
                  </p>
                  <p>
                    นี่คือ Web Application จำลองระบบปฏิบัติการ (Simulator) ที่สร้างขึ้นเพื่อแสดงทักษะขั้นสูงสำหรับ Portfolio
                  </p>
                  <ul className="list-disc list-inside space-y-2 marker:text-cyan-500">
                    <li><strong>Visual Core:</strong> การเรนเดอร์กราฟิก 3D และ Particles ด้วยคณิตศาสตร์ผ่าน Canvas API</li>
                    <li><strong>Algorithm Core:</strong> ระบบนำทาง Rover ด้วย Pathfinding Algorithm บน Grid</li>
                    <li><strong>IoT Core:</strong> การจำลองและแสดงผลข้อมูล Sensor แบบ Real-time</li>
                    <li><strong>System Logic:</strong> การจำลองเหตุการณ์สุ่มและระบบ Logs ที่ซับซ้อน</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-4">
                    *ข้อมูลและเหตุการณ์ทั้งหมดเป็นการจำลองเพื่อการสาธิตเท่านั้น*
                  </p>
                </div>
                
                {/* Image Placeholder / Visual Aid */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 h-48 md:h-auto bg-black flex items-center justify-center group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1619360142538-140063003320?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="relative z-10 text-center p-4">
                    <GlobeIcon className="w-12 h-12 text-cyan-500 mx-auto mb-2 animate-pulse" />
                    <h3 className="text-lg font-bold text-white">MARS COLONY ALPHA</h3>
                    <p className="text-xs text-cyan-300">Visual Concept</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowBriefing(false)}
                className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                เข้าสู่ระบบบัญชาการ (ENTER COMMAND) <ChevronRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="fixed top-0 w-full h-16 border-b border-slate-800 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${alertMode ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
          <h1 className="text-xl font-bold tracking-widest text-slate-100 flex items-center gap-2">
            NEXUS <span className="text-cyan-500 text-xs px-2 py-0.5 border border-cyan-500/30 rounded">CMD_V.4.2</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-slate-500">
           <button onClick={() => setShowBriefing(true)} className="flex items-center gap-2 hover:text-cyan-400 transition-colors"><Info size={14} /> BRIEFING</button>
           <span className="flex items-center gap-2"><Wifi size={14} /> UPLINK: STABLE</span>
           <span>SOL DATE: 4052</span>
           <span className="text-cyan-400">{time.toLocaleTimeString()}</span>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="pt-20 px-4 pb-12 h-screen grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT PANEL: RESOURCES (IoT) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
           {/* Card 1: Environment */}
           <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
              <h2 className="text-cyan-400 font-bold text-sm mb-4 flex items-center gap-2">
                 <Thermometer size={16} /> ENV_TELEMETRY
              </h2>
              <SensorGraph label="OXYGEN LEVEL (O2)" value={oxygen} unit="%" color={oxygen < 95 ? "text-red-500" : "text-cyan-400"} />
              <SensorGraph label="EXT. TEMPERATURE" value={temp} unit="°C" color="text-amber-400" />
              <SensorGraph label="REACTOR OUTPUT" value={energy} unit="MW" color="text-green-400" />
           </div>

           {/* Card 2: Actions */}
           <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex-1 flex flex-col gap-2">
              <h2 className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2">
                 <Server size={16} /> SYSTEM_CTRL
              </h2>
              <button 
                onClick={handleReboot}
                className="group w-full py-3 bg-slate-800 hover:bg-cyan-600/20 border border-slate-700 hover:border-cyan-500 text-xs font-mono transition-all rounded flex items-center justify-between px-4"
              >
                 <span>REPLENISH_RESOURCES()</span>
                 <RefreshCw size={14} className="group-hover:rotate-180 transition-transform" />
              </button>
              <button className="group w-full py-3 bg-slate-800 hover:bg-red-600/20 border border-slate-700 hover:border-red-500 text-xs font-mono transition-all rounded flex items-center justify-between px-4">
                 <span>EMERGENCY_LOCKDOWN()</span>
                 <LockIcon />
              </button>
              
              {/* AI Prediction Box */}
              <div className="mt-auto p-3 bg-blue-900/10 border border-blue-500/20 rounded">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                   <Database size={12} /> <span className="text-[10px] font-bold">AI PREDICTION MODEL</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                   Machine Learning model predicts <span className="text-white">Dust Storm</span> probability at 85% within 48 hours. Suggest rover recall.
                </p>
              </div>
           </div>
        </div>

        {/* CENTER PANEL: VISUALIZER (Graphics) */}
        <div className="lg:col-span-6 relative bg-black border border-slate-800 rounded-xl overflow-hidden group">
           <div className="absolute top-4 left-4 z-10">
              <div className="text-[10px] text-cyan-500 font-mono mb-1">TARGET: MARS_COLONY_ALPHA</div>
              <div className="text-2xl font-black text-white tracking-tighter">SECTOR 7</div>
           </div>
           
           {/* The 3D Canvas */}
           <div className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
              <PlanetCanvas alertMode={alertMode} />
           </div>

           {/* Overlay Interface */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full text-xs font-mono flex gap-2 items-center backdrop-blur">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Feed
              </div>
              <div className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full text-xs font-mono flex gap-2 items-center backdrop-blur">
                 Mode: <span className="text-cyan-400">Scan</span>
              </div>
           </div>
           
           {/* Crosshair Decor */}
           <div className="absolute inset-0 pointer-events-none border-[30px] border-transparent">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-600" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-600" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-600" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-600" />
           </div>
        </div>

        {/* RIGHT PANEL: LOGS & ALGOS */}
        <div className="lg:col-span-3 flex flex-col gap-4">
           
           {/* Algorithm Showcase */}
           <RoverSystem />

           {/* Terminal / Logs */}
           <div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col">
              <h3 className="text-slate-500 mb-3 flex items-center gap-2 border-b border-slate-900 pb-2">
                 <Terminal size={14} /> SYSTEM_LOGS
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                 {logs.map((log) => (
                    <motion.div 
                       key={log.id} 
                       initial={{ opacity: 0, x: -10 }} 
                       animate={{ opacity: 1, x: 0 }}
                       className={`
                         p-2 border-l-2 rounded bg-opacity-10
                         ${log.type === 'error' || log.type === 'warning' ? 'border-red-500 bg-red-900 text-red-400' : ''}
                         ${log.type === 'success' ? 'border-green-500 bg-green-900 text-green-400' : ''}
                         ${log.type === 'info' ? 'border-cyan-500 bg-cyan-900 text-cyan-400' : ''}
                       `}
                    >
                       <span className="opacity-50 mr-2">[{new Date(Date.now()).toLocaleTimeString()}]</span>
                       {log.text}
                    </motion.div>
                 ))}
                 <div className="animate-pulse text-cyan-500">_</div>
              </div>
           </div>

           {/* Security Status */}
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                 <div className="text-[10px] text-slate-500">FIREWALL</div>
                 <div className="text-green-400 font-bold">ACTIVE</div>
              </div>
              <Shield size={24} className="text-green-500" />
           </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full bg-black/90 border-t border-slate-800 py-2 px-6 flex justify-between items-center text-[10px] font-mono text-slate-500 z-40">
        <div className="flex items-center gap-4">
           <span className="flex items-center gap-1 text-green-500"><Activity size={10} /> SYS_OPTIMAL</span>
           <span className="hidden md:inline">| MEM: 42%</span>
           <span className="hidden md:inline">| CPU: 12%</span>
        </div>
        <div className="flex items-center gap-2">
           <span>DEVELOPED FOR COMPUTER SCIENCE PORTFOLIO</span>
           <span className="text-slate-700">|</span>
           <span>© 2025 NEXUS SYSTEMS</span>
        </div>
      </footer>

    </div>
  );
}

// Custom Globe Icon for the modal
const GlobeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);