import React, { useState } from "react";
import { Shield, Key, User, Eye, EyeOff, Terminal, ArrowRight } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (user: { name: string; role: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [handle, setHandle] = useState("");
  const [passkey, setPasskey] = useState("");
  const [role, setRole] = useState("Super Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setErrorMsg("Security ID handle cannot be empty.");
      return;
    }
    if (!passkey) {
      setErrorMsg("Cryptographic passkey is required.");
      return;
    }

    // Process Login with simple verification rules
    setIsDecrypting(true);
    setErrorMsg(null);

    setTimeout(() => {
      // Validate credentials (e.g. aditya/Bypass, naz/Bypass, or any custom entered credentials with 'Bypass' or common passkey)
      const validPasswords = ["bypass", "Bypass", "admin", "admin123"];
      const isBypass = validPasswords.includes(passkey.toLowerCase().trim());
      
      if (isBypass || handle.trim().length >= 3) {
        // Authenticate
        onLoginSuccess({
          name: handle.charAt(0).toUpperCase() + handle.slice(1),
          role: role
        });
      } else {
        setErrorMsg("Access Denied. Invalid Cryptographic Sign-in Pair.");
        setIsDecrypting(false);
      }
    }, 1000);
  };

  const handleBypassSelect = (profileHandle: string, profileRole: string) => {
    setHandle(profileHandle);
    setPasskey("Bypass");
    setRole(profileRole);
    setErrorMsg(null);
    
    // Sleek direct decrypt trigger
    setIsDecrypting(true);
    setTimeout(() => {
      onLoginSuccess({
        name: profileHandle.charAt(0).toUpperCase() + profileHandle.slice(1),
        role: profileRole
      });
    }, 850);
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 select-none">
      
      {/* Container echoing the high fidelity aesthetic */}
      <div className="w-full max-w-[480px] bg-[#09090b] border border-neutral-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative shadow-2xl overflow-hidden">
        
        {/* Glow ambient background aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* LOGO AND BRANDING */}
        <div className="flex flex-col items-center text-center mt-2 z-10">
          {/* Replicating the orange winged logo of Falcore Labs using SVG */}
          <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transition-transform hover:scale-105">
            <svg 
              className="w-8 h-8 text-black" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            FALCORE <span className="text-orange-500 font-bold">LABS</span>
          </h2>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-medium mt-1 block">
            SECURE ADM_ PORTAL // v2.4.0
          </span>
        </div>

        {/* ERROR SUMMARY */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-red-400 font-mono text-[11px] leading-relaxed flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
            <span>[SYS_ALERT]: {errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 z-10 text-left">
          
          {/* Security Login Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold">
              <span className="text-neutral-400 uppercase">SECURITY SIGN-IN ID</span>
              <span className="text-orange-600">lowercase only</span>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <User className="h-4 w-4 text-neutral-500" />
              </span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                placeholder="Enter workspace handle..."
                required
                className="w-full bg-[#121214] border border-neutral-800 focus:border-orange-500 hover:border-neutral-700 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none font-mono transition-all"
              />
            </div>
          </div>

          {/* Cryptographic Key Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold">
              <span className="text-neutral-400 uppercase">CRYPTOGRAPHIC KEY</span>
              <span className="text-neutral-600 hover:text-orange-500 cursor-pointer" onClick={() => alert("Please click an authorized profile bypass below to login instantly!")}>forgot key?</span>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Key className="h-4 w-4 text-neutral-500" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter password passkey..."
                required
                className="w-full bg-[#121214] border border-neutral-800 focus:border-orange-500 hover:border-neutral-700 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-1 flex items-center pr-3.5 text-neutral-550 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* ACCESS SCOPE TIER ROLE SELECTOR */}
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 font-mono tracking-wider font-bold uppercase block">
              ACCESS SCOPE TIER
            </span>

            <div className="grid grid-cols-3 gap-2">
              {["Super Admin", "AI Researcher", "System Operator"].map((roleOption) => (
                <button
                  type="button"
                  key={roleOption}
                  onClick={() => setRole(roleOption)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold font-mono tracking-wide uppercase border text-center transition-all ${
                    role === roleOption
                      ? "bg-orange-550/15 border-orange-500 text-orange-500"
                      : "bg-transparent border-neutral-800/80 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            disabled={isDecrypting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest font-mono transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-50"
          >
            {isDecrypting ? (
              <>
                <Terminal className="w-4 h-4 animate-spin text-black" />
                <span>DECRYPTING SECTORS...</span>
              </>
            ) : (
              <>
                <span>DECRYPT & SIGN IN</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>

        </form>

        {/* DIVIDER LINE */}
        <div className="border-t border-neutral-800/80 my-1" />

        {/* AUTHORIZED LABORATORY BYPASS PROFILES (Interactive shortcuts requested) */}
        <div className="flex flex-col gap-2 text-left">
          <span className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase text-center font-bold">
            AUTHORIZED LABORATORY BYPASS PROFILES
          </span>

          <div className="space-y-2">
            {/* profile A: aditya */}
            <div 
              onClick={() => handleBypassSelect("aditya", "Super Admin")}
              className="bg-[#121214] hover:bg-neutral-900 border border-neutral-800/85 hover:border-orange-500/70 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-orange-650/10 text-orange-500 rounded flex items-center justify-center">
                  <Terminal className="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-500 transition-colors">aditya</div>
                  <span className="text-[8px] font-bold text-orange-600 font-mono bg-orange-650/10 px-1 py-0.25 rounded">
                    Super Admin
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono group-hover:text-neutral-300">
                Passkey: Bypass
              </span>
            </div>

            {/* profile B: naz */}
            <div 
              onClick={() => handleBypassSelect("naz", "AI Researcher")}
              className="bg-[#121214] hover:bg-neutral-900 border border-neutral-800/85 hover:border-orange-500/70 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-transparent text-orange-500 rounded flex items-center justify-center">
                  <span className="text-orange-500 font-bold font-mono text-[10px]">●</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-500 transition-colors">naz</div>
                  <span className="text-[8px] font-bold text-orange-600 font-mono bg-orange-650/10 px-1 py-0.25 rounded">
                    AI Researcher
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono group-hover:text-neutral-300">
                Passkey: Bypass
              </span>
            </div>
          </div>
        </div>

        {/* LEGAL DISCLAIMER FOOTER */}
        <p className="text-[9px] text-neutral-600 font-mono leading-relaxed text-center">
          Unauthorized access attempts are logged, geo-located, and indexed under cryptographic protection.
        </p>

      </div>

    </div>
  );
}
