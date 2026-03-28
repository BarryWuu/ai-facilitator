"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Hall() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("room-001");
  const [isHost, setIsHost] = useState(false);
  const [password, setPassword] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // 安全检查：只有密码正确才能以 Host 身份进入
    if (isHost && password !== "baigezuishuai") {
      alert("🚫 ACCESS DENIED: Incorrect Host Password.");
      return;
    }
    
    const params = new URLSearchParams();
    params.set("name", name);
    if (isHost) params.set("role", "host");
    
    router.push(`/room/${room}?${params.toString()}`);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#000_100%)]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 w-full max-w-lg p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2 tracking-tighter">
              AI FACILITATOR
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">Collaborative Intelligence Hall</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold ml-1">Your Identity</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-700"
                placeholder="Enter your name..."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold ml-1">Select Hall / Room</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {['room-001', 'room-002', 'vip-lounge', 'dev-team'].map((r) => (
                  <div 
                    key={r}
                    onClick={() => setRoom(r)}
                    className={`cursor-pointer p-3 rounded-lg border text-xs font-mono text-center transition-all ${room === r ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-500"}`}
                  >
                    #{r}
                  </div>
                ))}
              </div>
              <input 
                type="text" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-xs text-gray-400 focus:text-white outline-none"
                placeholder="Or type custom room ID..."
              />
            </div>

            <div className="pt-2">
              <div 
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isHost ? "bg-purple-900/20 border-purple-500/50" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                onClick={() => setIsHost(!isHost)}
              >
                <div>
                  <div className={`text-sm font-bold ${isHost ? "text-purple-400" : "text-gray-300"}`}>Facilitator Mode</div>
                  <div className="text-[10px] text-gray-500">Enable AI synthesis controls</div>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${isHost ? "bg-purple-600" : "bg-gray-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isHost ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>

              <AnimatePresence>
                {isHost && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <div className="text-red-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder-red-300/50"
                        placeholder="Enter Host Password"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={!name}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl ${
                isHost 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-900/20" 
                : "bg-white text-black"
              }`}
            >
              {isHost ? "Authenticate & Enter" : "Join Session"}
            </button>
          </form>
          
        </motion.div>
      </div>
    </div>
  );
}