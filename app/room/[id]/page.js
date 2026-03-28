"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSocket } from "../../../hooks/useSocket";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const BrainIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

function RoomContent({ roomId }) {
  const socket = useSocket();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef(null);
  
  const paramName = searchParams.get("name");
  const isHost = searchParams.get("role") === "host";
  
  const [user, setUser] = useState(null); 
  const [input, setInput] = useState("");
  const [perspectives, setPerspectives] = useState([]);
  const [consensus, setConsensus] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    setUser(paramName || `Agent_${Math.floor(Math.random() * 999)}`);
  }, [paramName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [perspectives, mobileTab]);

  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.emit("join_room", roomId);
    
    socket.on("init_state", (data) => {
      setPerspectives(data.perspectives || []);
      setConsensus(data.latestConsensus);
    });
    
    socket.on("new_perspective", (p) => setPerspectives(prev => [...prev, p]));
    socket.on("perspectives_updated", (data) => setPerspectives(data));
    socket.on("chat_cleared", () => {
      setPerspectives([]);
      setConsensus(null);
    });

    socket.on("ai_thinking", (status) => setIsThinking(status));
    socket.on("consensus_update", (data) => setConsensus(data));
    socket.on("api_error", (err) => alert(`Error: ${err.message}`));
    
    return () => socket.removeAllListeners();
  }, [socket, roomId]);

  const handleDelete = (messageId) => socket.emit("delete_perspective", { roomId, messageId });
  const handleClearChat = () => { if (confirm("Wipe all data?")) socket.emit("clear_chat", roomId); };
  
  const exportPDF = () => {
    if (!consensus) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20; const margin = 20; const contentWidth = pageWidth - margin * 2;
    const writeText = (text, size = 12, style = "normal", color = [0, 0, 0]) => {
      if (!text) return;
      doc.setFontSize(size); doc.setFont("helvetica", style); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentWidth);
      const lineHeight = size * 0.4; const blockHeight = lines.length * lineHeight + 4; 
      if (y + blockHeight > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
      doc.text(lines, margin, y); y += blockHeight; 
    };

    writeText("Campus Innovation Report", 22, "bold", [0, 102, 204]); y += 5;
    writeText("Project Vision", 14, "bold", [100, 100, 100]); writeText(consensus.project_vision || "N/A", 11); y += 5;
    writeText("Innovation Assessment", 14, "bold", [102, 51, 153]); writeText(consensus.innovation_assessment || "N/A", 11); y += 5;
    if ((consensus.task_delegation || []).length > 0) { writeText("Task Delegation", 14, "bold", [0, 153, 76]); (consensus.task_delegation || []).forEach(item => { writeText(`• [${item.owner}] ${item.task}`, 11); }); y += 5; }
    if ((consensus.collaboration_gaps || []).length > 0) { writeText("Collaboration Gaps & Risks", 14, "bold", [204, 0, 0]); (consensus.collaboration_gaps || []).forEach(r => writeText(`! ${r}`, 11)); }
    doc.save(`Innovation_Report_${roomId}.pdf`);
  };

  if (!isMounted) return <div className="h-screen w-full bg-[#0a0a0a]" />;

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0a0a0a] text-white font-sans overflow-hidden fixed inset-0">
      
      <div className={`flex-col border-r border-gray-800 bg-gray-900/50 backdrop-blur-md z-10 transition-all h-full md:w-1/3 md:flex ${mobileTab === 'chat' ? 'flex w-full' : 'hidden'}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-black/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500"}`}></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isConnected ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <div className="text-xs text-blue-400 font-mono italic truncate max-w-[150px]">{user || "..."}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          <AnimatePresence>
            {perspectives.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`flex flex-col max-w-[85%] ${p.user === user ? "ml-auto items-end" : "mr-auto items-start"}`}>
                <div className="text-[10px] text-gray-500 mb-1 px-1 flex gap-2"><span className="font-bold text-gray-400">{p.user}</span><span>{new Date(p.id).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex items-center gap-2 group">
                  {p.user === user && (<button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-full transition-all"><TrashIcon /></button>)}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed border break-words shadow-sm ${p.user === user ? "bg-blue-600 text-white border-blue-500 rounded-tr-sm" : "bg-[#1f1f1f] text-gray-200 border-gray-700 rounded-tl-sm"}`}>{p.text}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-black/80 border-t border-white/5 backdrop-blur shrink-0 pb-safe">
          <form onSubmit={(e) => { e.preventDefault(); if(input.trim()){ socket.emit("submit_perspective", { roomId, text: input, user }); setInput(""); } }} className="flex gap-2">
            <input className="flex-1 bg-gray-800/50 border border-gray-700 text-white rounded-full px-5 py-3 text-sm focus:border-blue-500 focus:bg-gray-800 outline-none transition-all placeholder-gray-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Inject idea..." />
            <button type="submit" disabled={!input.trim()} className="w-11 h-11 bg-blue-600 rounded-full text-white disabled:opacity-50 disabled:bg-gray-700 flex items-center justify-center transition-all active:scale-95 shadow-lg"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </form>
          <div className="h-14 md:hidden"></div> 
        </div>
      </div>

      <div className={`flex-col bg-[#050505] transition-all h-full overflow-hidden md:w-2/3 md:flex ${mobileTab === 'ai' ? 'flex w-full' : 'hidden'}`}>
        <header className="h-14 flex justify-between items-center px-6 border-b border-gray-800 bg-gray-900/30 shrink-0">
          <div className="flex items-center gap-3"><BrainIcon className="text-purple-400" /><h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">AI Facilitator</h1></div>
          <div className="flex gap-2">
            {isHost ? (
              <>
                <button onClick={handleClearChat} className="hidden md:flex items-center px-3 py-1.5 border border-red-500/30 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-xs text-red-400 transition-colors">WIPE DATA</button>
                {consensus && <button onClick={exportPDF} className="hidden md:flex items-center px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 text-xs text-gray-300 transition-colors">PDF</button>}
                
                {}
                <button onClick={() => socket.emit("trigger_consensus", roomId)} disabled={isThinking || perspectives.length === 0}
                  className={`px-5 py-2 rounded-full font-bold text-xs border transition-all shadow-lg ${isThinking ? "bg-gray-800 text-gray-500 border-gray-700 cursor-wait" : "bg-white text-black hover:scale-105 active:scale-95 border-white"}`}>
                  {isThinking ? "EVALUATING..." : "SYNTHESIZE"}
                </button>
              </>
            ) : (<span className="text-[10px] text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">VIEW ONLY</span>)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {consensus ? (
              <motion.div key={JSON.stringify(consensus)} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto space-y-6">
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-900/50 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Project Vision</h3>
                  <p className="text-xl md:text-2xl text-gray-200 font-serif leading-relaxed">"{consensus.project_vision}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-purple-900/10 to-[#0f0f0f] border border-purple-500/20"><h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Innovation Assessment</h3><p className="text-sm text-gray-300 leading-relaxed">{consensus.innovation_assessment}</p></div>
                  <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-gray-800"><h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Task Delegation</h3><div className="space-y-3">{(consensus.task_delegation || []).map((item, i) => (<div key={i} className="flex flex-col p-3 rounded-lg bg-green-900/10 border border-green-900/20"><span className="text-sm font-medium text-white mb-1">{item.task}</span><div className="text-[10px] text-green-400 font-mono">Owner: {item.owner}</div></div>))}</div></div>
                  <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-gray-800"><h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Collaboration Gaps</h3><div className="space-y-3">{(consensus.collaboration_gaps || []).map((r, i) => (<div key={i} className="flex gap-3 text-sm text-gray-300 p-3 bg-orange-900/10 border border-orange-900/20 rounded-lg"><span className="text-orange-500 font-bold">!</span> {r}</div>))}</div></div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 border-2 border-dashed border-gray-700 rounded-full animate-[spin_10s_linear_infinite] mb-6"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Mentor Standby</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center z-50 pb-safe">
        <button onClick={() => setMobileTab("chat")} className={`flex flex-col items-center justify-center w-full h-full gap-1 active:bg-white/5 transition-colors ${mobileTab === 'chat' ? 'text-blue-500' : 'text-gray-500'}`}><ChatIcon /><span className="text-[9px] font-bold uppercase tracking-wider">Chat</span></button>
        <div className="w-px h-8 bg-gray-800/50"></div>
        <button onClick={() => setMobileTab("ai")} className={`flex flex-col items-center justify-center w-full h-full gap-1 active:bg-white/5 transition-colors ${mobileTab === 'ai' ? 'text-purple-500' : 'text-gray-500'}`}><div className="relative"><BrainIcon />{consensus && mobileTab !== 'ai' && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>}</div><span className="text-[9px] font-bold uppercase tracking-wider">Report</span></button>
      </div>
    </div>
  );
}

export default function Room({ params }) {
  return (
    <Suspense fallback={<div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RoomContent roomId={params.id} />
    </Suspense>
  );
}