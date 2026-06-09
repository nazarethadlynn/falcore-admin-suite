import React, { useState } from "react";
import SubmissionAnalyzer from "./components/SubmissionAnalyzer";
import EmailTemplateBuilder from "./components/EmailTemplateBuilder";
import AdminLogin from "./components/AdminLogin";
import { 
  LayoutDashboard, 
  Mail, 
  Clock, 
  Search, 
  Settings, 
  Shield, 
  Server, 
  UserCheck, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analysis" | "templates">("analysis");
  const [searchVal, setSearchVal] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<{name: string, role: string} | null>(() => {
    const saved = localStorage.getItem("admin_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const utcDateString = new Date().toUTCString().slice(0, 16);

  if (!loggedInUser) {
    return (
      <AdminLogin 
        onLoginSuccess={(user) => {
          setLoggedInUser(user);
          localStorage.setItem("admin_user", JSON.stringify(user));
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-sans flex items-center justify-center p-3 md:p-6 selection:bg-orange-600/30 selection:text-white">
      
      {/* Absolute Professional Frame replicating the high-fidelity mockups of Falcorelabs */}
      <div 
        id="app_canvas"
        className="w-full max-w-[1440px] bg-[#09090b] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl shadow-orange-950/10 flex flex-col lg:flex-row min-h-[90vh]"
      >
        
        {/* LEFT COMPACT SIDEBAR (replicates the images) */}
        <aside className="w-full lg:w-64 bg-[#0d0d0e] border-b lg:border-b-0 lg:border-r border-neutral-800 p-5 flex flex-col justify-between gap-6 shrink-0">
          
          <div className="space-y-6">
            {/* Sidebar Logo Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/65">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20">
                F
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white tracking-tight">Falcorelabs</span>
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] text-neutral-450 uppercase font-mono tracking-widest block leading-none">Console v2.4</span>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-bold block px-2.5 mb-2">
                Administrator Menu
              </span>

              <button
                id="sidebar_tab_analysis"
                onClick={() => setActiveTab("analysis")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === "analysis"
                    ? "bg-orange-600/10 text-orange-500 border-l-2 border-orange-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === "analysis" ? "text-orange-500" : "text-neutral-400"}`} />
                  <span>Dashboard Analytics</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <button
                id="sidebar_tab_templates"
                onClick={() => setActiveTab("templates")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === "templates"
                    ? "bg-orange-600/10 text-orange-500 border-l-2 border-orange-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 ${activeTab === "templates" ? "text-orange-500" : "text-neutral-400"}`} />
                  <span>Email Template Studio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* PROJECT STATUS PANEL (Matching the lower left block of the images) */}
          <div className="space-y-4">
            <div className="bg-[#121214] border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">PROJECT STATUS</span>
                <span className="text-[9px] text-orange-500 font-bold font-mono">ACTIVE</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Falcore NextJS v2.4</h4>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[89%] rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 pt-0.5">
                  <span>Build Progress</span>
                  <span>89% Success</span>
                </div>
              </div>
            </div>

            {/* Quick Session UTC display */}
            <div className="text-[9px] font-mono text-neutral-500 text-center flex items-center justify-center gap-1.5 py-1">
              <Clock className="w-3 h-3 text-orange-600" />
              <span>{utcDateString}</span>
            </div>
          </div>

        </aside>

        {/* RIGHT MASTER DISPLAY PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070708]">
          
          {/* HEADER NAV BOARD (Replicates the top layout of the images) */}
          <header className="border-b border-neutral-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d0d0e]/60 backdrop-blur">
            
            {/* Breadcrumb Title */}
            <div className="text-left w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                <span>Admin</span>
                <span>/</span>
                <span className="text-orange-500">Infrastructure Overview</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {activeTab === "analysis" ? "System Dashboard" : "Corporate Email Templates"}
              </h2>
              <p className="text-[10px] text-neutral-400">Welcome back, Administrator. System database state is optimal.</p>
            </div>

            {/* Search component matching inputs in images */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-60">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-neutral-500" />
                </span>
                <input
                  type="text"
                  placeholder="Search lead records..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-[#121214] border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-600 font-mono"
                />
              </div>

              {/* Personal Avatar Badge */}
              <div className="flex items-center gap-2.5 bg-[#121214] border border-neutral-800/80 px-3 py-1 rounded-lg shrink-0">
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center font-bold text-black text-[10px] uppercase">
                  {loggedInUser?.name ? loggedInUser.name.slice(0, 2) : "NP"}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[10px] font-bold text-white leading-none">{loggedInUser?.name || "Nazareth Prethesh"}</div>
                  <span className="text-[8px] font-medium text-orange-500 font-mono tracking-widest uppercase">{loggedInUser?.role || "Super Admin"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoggedInUser(null);
                    localStorage.removeItem("admin_user");
                  }}
                  className="ml-1.5 px-2 py-1 text-[9px] font-bold font-mono tracking-wider text-neutral-400 hover:text-orange-500 border border-neutral-800 hover:border-orange-500 bg-[#0d0d0e]/60 rounded-lg transition-all cursor-pointer uppercase"
                >
                  Logout
                </button>
              </div>
            </div>

          </header>

          {/* DYNAMIC WORKSPACE */}
          <main className="flex-1 p-5 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {activeTab === "analysis" ? (
              <SubmissionAnalyzer outerSearch={searchVal} />
            ) : (
              <EmailTemplateBuilder />
            )}
          </main>

          {/* DYNAMIC STATUS BAR / FOOTER (replicates lower margin from images) */}
          <footer className="bg-[#09090b] border-t border-neutral-800/80 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
              <span className="text-neutral-350 font-bold uppercase tracking-wider">● SERVER STATUS: ONLINE</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">Cluster: falcore-us-east-1</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500">
              <span>© Falcorelabs Management Console v2.0.12 - 2026</span>
              <span className="text-neutral-700">|</span>
              <span className="text-orange-500/80 flex items-center gap-0.5">
                <Shield className="w-3 h-3 text-orange-500" /> Persistent Secure State
              </span>
            </div>
          </footer>

        </div>
        
      </div>

    </div>
  );
}
