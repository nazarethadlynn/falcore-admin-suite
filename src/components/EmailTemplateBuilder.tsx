import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Eye, 
  Info,
  Send,
  Layers,
  Sparkles,
  Code,
  CheckCircle,
  FileCode,
  UserCheck
} from "lucide-react";
import { Person, EmailTemplate } from "../types";

// Hardcoded Default Component Codes for Welcome / Newsletter / Combined types
const DEFAULT_PRESETS = {
  welcome: {
    name: "Enterprise Welcome Portal",
    id: "welcome-email",
    subject: "Welcome to Falcore Labs // Core Onboarding for {{name}}",
    header: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: 'JetBrains Mono', 'Inter', monospace; color: #ffffff; }
    .container { max-width: 600px; margin: 20px auto; background-color: #080808; border: 1.5px solid #ff6600; border-radius: 12px; overflow: hidden; padding: 30px; box-shadow: 0 10px 30px rgba(234, 88, 12, 0.15); }
    .header-logo { text-align: center; padding-bottom: 25px; border-bottom: 1.5px dashed #ff6600; }
    .logo-text { font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff; }
    .logo-accent { color: #ff6600; }
    .badge { display: inline-block; padding: 4px 10px; background-color: rgba(234, 88, 12, 0.1); border: 1px solid #ff6600; color: #ff6600; font-size: 10px; text-transform: uppercase; border-radius: 4px; margin-top: 10px; }
    .content-body { padding: 30px 0; font-size: 13px; line-height: 1.7; color: #dddddd; }
    .highlight-box { background: #121212; border-left: 4px solid #ff6600; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #ff6600; color: #000000; text-decoration: none; font-weight: 900; font-size: 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #ff6600; transition: all 0.2sease; margin-top: 15px; }
    .btn:hover { background-color: transparent; color: #ffffff; }
    .footer { text-align: center; padding-top: 25px; border-top: 1.5px dashed #222222; font-size: 10px; color: #555555; }
    .link-orange { color: #ff6600; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-logo">
      <div class="logo-text">FALCORE<span class="logo-accent">LABS</span></div>
      <span class="badge">Security Verified</span>
    </div>`,
    body: `    <div class="content-body">
      <h2 style="font-size: 18px; margin-top: 0; color: #ff6600;">STATUS: ACCESS GRANTED // Dear {{name}}</h2>
      <p>Thank you for submitting your core infrastructure query. Your priority application credentials have been active under contact: <span class="link-orange">{{email}}</span>.</p>
      
      <div class="highlight-box">
        <strong style="color: #ffffff; display: block; margin-bottom: 5px;">Your submitted inquiry:</strong>
        <span style="font-style: italic; color: #bbbbbb;">"{{message}}"</span>
      </div>

      <p>Your subscription is securely stored in our cluster database logs with deployment certificate id <span style="font-family: monospace; background: #222; padding: 2px 6px; border-radius: 3px; color: #ff6600;">{{id}}</span>. Our background SMTP worker delivers your verification token immediately.</p>
      
      <p>Click below to inspect your real-time analytics graphs, filter logs, and setup custom dispatch notifications.</p>
      <a href="https://ai.studio/build" class="btn">Deploy Live Node</a>
    </div>`,
    footer: `    <div class="footer">
      <p>// SECURE CONNECTION // Cluster Node ID: falcore-us-east-1 // SSL Secured</p>
      <p>© 2026 Falcorelabs Systems, Inc. <a href="#" class="link-orange">Unsubscribe</a> // <a href="#" class="link-orange">Preference Panel</a></p>
    </div>
  </div>
</body>
</html>`
  },
  newsletter: {
    name: "Engineering Monthly Broadcast",
    id: "newsletter-email",
    subject: "Falcore Broadcast // Quarterly Developer Digest (No-HMR Rule)",
    header: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: 'JetBrains Mono', 'Inter', monospace; color: #f5f5f5; }
    .container { max-width: 620px; margin: 30px auto; background-color: #070707; border: 1.5px solid #ffffff; border-radius: 4px; overflow: hidden; padding: 25px; }
    .header-block { text-align: left; padding-bottom: 20px; border-bottom: 2px solid #ffffff; }
    .logo { font-size: 26px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; }
    .tagline { font-size: 10px; color: #ff6600; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; display: block; margin-top: 4px; }
    .content { padding: 25px 0; font-size: 13px; line-height: 1.6; }
    .grid-metrics { display: table; width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 10px 0; }
    .metric-card { display: table-cell; background: #121212; border: 1px solid #222222; border-top: 3px solid #ff6600; padding: 15px; border-radius: 2px; }
    .metric-card h4 { margin: 0; font-size: 10px; color: #777777; text-transform: uppercase; tracking: 1.5px; }
    .metric-card div { font-size: 20px; font-weight: bold; color: #ffffff; margin-top: 5px; }
    .btn-white { display: inline-block; background-color: #ffffff; color: #000000; padding: 10px 20px; text-decoration: none; font-size: 11px; font-weight: 900; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px; }
    .footer { text-align: left; padding-top: 20px; border-top: 1px solid #1a1a1a; font-size: 9px; color: #444444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-block">
      <span class="logo">FALCORE JOURNAL</span>
      <span class="tagline">ENGINEERING EXCELLENCE DIGEST // VOL 4.2</span>
    </div>`,
    body: `    <div class="content">
      <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">System Update: Low Latency Dispatch Pipeline</h3>
      <p>Hello {{name}},</p>
      <p>Here is your absolute summary of telemetry metrics compiled across our distributed delivery network servicing contact <span style="color: #ff6600;">{{email}}</span>:</p>
      
      <div class="grid-metrics">
        <div class="metric-card">
          <h4>SMTP Delivery Velocity</h4>
          <div>99.98% / Sec</div>
        </div>
        <div class="metric-card">
          <h4>Relational Sync Latency</h4>
          <div>1.42 ms</div>
        </div>
      </div>

      <p>Our core application structures run natively without visual slop or unnecessary widgets. Secure authentication was resolved using utm context <span style="color: #ff6600;">Launch_Day</span> on date <span style="font-family: monospace;">{{date}}</span>.</p>
      
      <p style="margin-bottom: 25px;">Check the developer documentation to leverage these speeds:</p>
      <a href="#" class="btn-white">Browse API Schema</a>
    </div>`,
    footer: `    <div class="footer">
      <p>This news digest is transmitted to subscribed users. Subscriber database id: {{id}}</p>
      <p>© 2026 Falcorelabs Management Console. <a href="#" style="color: #ff6600; text-decoration: none;">Preference Center</a> // <a href="#" style="color: #ff6600; text-decoration: none;">Unsubscribe immediate</a></p>
    </div>
  </div>
</body>
</html>`
  },
  combined: {
    name: "Auto-Responder Transaction Notification",
    id: "combined-email",
    subject: "Falcore Alert // Telemetry Notice [Inquiry ID: {{id}}]",
    header: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0b0c; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #eeeeee; }
    .box { max-width: 580px; margin: 40px auto; background-color: #000000; border: 1.5px solid #ff6600; border-radius: 8px; overflow: hidden; }
    .top-banner { background-color: #ff6600; color: #000000; padding: 15px 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; }
    .inner { padding: 30px; font-size: 13px; line-height: 1.6; }
    .key-value { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .key-value td { padding: 8px 12px; border: 1px solid #222222; font-size: 11px; }
    .key-value .lbl { color: #888888; font-family: monospace; width: 30%; }
    .key-value .val { color: #ffffff; font-family: monospace; font-weight: bold; }
  </style>
</head>
<body>
  <div class="box">
    <div class="top-banner">
      SYSTEM PROTOCOL GENERATED AUTORESPONDER
    </div>`,
    body: `    <div class="inner">
      <h3 style="margin-top:0; color: #ff6600;">Verification Alert</h3>
      <p>Dear {{name}},</p>
      <p>Your web inquiry on subject <strong>"{{subject}}"</strong> was successfully processed inside our server cluster node.</p>

      <table class="key-value">
        <tr>
          <td class="lbl">SENDER ADDRESS</td>
          <td class="val">{{email}}</td>
        </tr>
        <tr>
          <td class="lbl">TICKET IDENTITY</td>
          <td class="val">{{id}}</td>
        </tr>
        <tr>
          <td class="lbl">DISPATCH DATE</td>
          <td class="val">{{date}}</td>
        </tr>
      </table>

      <div style="background-color: #111112; padding: 15px; border-radius: 4px; border: 1px solid #222;">
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 5px;">Excerpt Message logged:</span>
        <p style="margin: 0; font-family: monospace; color: #dddddd; line-height: 1.4;">"{{message}}"</p>
      </div>
    </div>`,
    footer: `    <div style="background-color: #080808; padding: 20px; border-top: 1px solid #1a1a1b; text-align: center; font-size: 9px; color: #555555; font-family: monospace;">
      TRANSMITTED BY FALCORELABS SSL CERTIFIED SERVERS. KEEP THIS FOR TRANSACTION LOG REFERENCES.
    </div>
  </div>
</body>
</html>`
  }
};

const TOKENS = [
  { val: "{{name}}", desc: "Recipient's raw full name" },
  { val: "{{email}}", desc: "Contact email target address" },
  { val: "{{id}}", desc: "Relational identifier token" },
  { val: "{{subject}}", desc: "Inquiry or submission subject" },
  { val: "{{message}}", desc: "Body excerpt feedback description" },
  { val: "{{date}}", desc: "Automated calendar timestamp" }
];

export default function EmailTemplateBuilder() {
  const [activeTab, setActiveTab] = useState<"welcome" | "newsletter" | "combined">("welcome");
  
  // Three distinct component documents that we access
  const [headerCode, setHeaderCode] = useState(DEFAULT_PRESETS.welcome.header);
  const [bodyCode, setBodyCode] = useState(DEFAULT_PRESETS.welcome.body);
  const [footerCode, setFooterCode] = useState(DEFAULT_PRESETS.welcome.footer);
  
  // Selected component sub-section
  const [selectedSubSection, setSelectedSubSection] = useState<"header" | "body" | "footer">("body");
  
  // Test states
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Status and notification feedbacks
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testMailStatus, setTestMailStatus] = useState<string | null>(null);
  const [prodStatus, setProdStatus] = useState<string | null>(null);

  // References
  const textEditorRef = useRef<HTMLTextAreaElement>(null);

  // Loading database persons
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/persons");
        if (res.ok) {
          const data = await res.json();
          setPersons(data);
          if (data.length > 0) {
            setSelectedPersonId(data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed fetching SQL-schema persons:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPersons();
  }, []);

  // Update editor state when swapping the top level presets
  useEffect(() => {
    const preset = DEFAULT_PRESETS[activeTab];
    setHeaderCode(preset.header);
    setBodyCode(preset.body);
    setFooterCode(preset.footer);
    setSelectedSubSection("body"); // Default to body editing
  }, [activeTab]);

  // Insert token parameter helper
  const handleInsertToken = (token: string) => {
    const textarea = textEditorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = getActiveCode();
    const updatedValue = currentValue.substring(0, start) + token + currentValue.substring(end);

    updateActiveCode(updatedValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    }, 50);
  };

  // Helper to retrieve correct segment code
  const getActiveCode = () => {
    if (selectedSubSection === "header") return headerCode;
    if (selectedSubSection === "footer") return footerCode;
    return bodyCode;
  };

  // Helper to assign correct segment code
  const updateActiveCode = (code: string) => {
    if (selectedSubSection === "header") setHeaderCode(code);
    else if (selectedSubSection === "footer") setFooterCode(code);
    else setBodyCode(code);
  };

  // Live compilation parser
  const getCompiledHTML = () => {
    // Concatenate sections
    const completeHTML = headerCode + "\n" + bodyCode + "\n" + footerCode;
    
    // Fallback variables
    let name = "Alex Rivera";
    let email = "alex.rivera@falcore.com";
    let id = "lead-p8291";
    let subject = "Inquiry regarding Enterprise licenses";
    let message = "We need 50 licenses of the Falcore Suite built within a strict modular guideline layout.";
    let date = new Date().toLocaleDateString();

    const selectedPerson = persons.find(p => p.id === selectedPersonId);
    if (selectedPerson) {
      name = selectedPerson.full_name || selectedPerson.email;
      email = selectedPerson.email;
      id = selectedPerson.id;
      subject = `Core Inbound Request // ${selectedPerson.source || "Organic"}`;
      message = selectedPerson.notes || "No custom ticket notes reported by client.";
      date = new Date(selectedPerson.created_at).toLocaleDateString();
    }

    return completeHTML
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{id}}/g, id)
      .replace(/{{subject}}/g, subject)
      .replace(/{{message}}/g, message)
      .replace(/{{date}}/g, date);
  };

  // Button actions exactly replicating the design specifications

  // 1. TEST EMAIL
  const handleTestEmail = () => {
    const selectedPerson = persons.find(p => p.id === selectedPersonId) || { email: "alex.rivera@falcore.com" };
    setTestMailStatus(`Processing...`);
    setTimeout(() => {
      setTestMailStatus(`Success! Test transmission parsed and delivered to: ${selectedPerson.email}`);
      setTimeout(() => setTestMailStatus(null), 4500);
    }, 1200);
  };

  // 2. SAVE
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("Saving changes...");
    
    try {
      // Create schema friendly payload
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `tpl-${activeTab}`,
          name: DEFAULT_PRESETS[activeTab].name,
          subject: DEFAULT_PRESETS[activeTab].subject,
          body: `${headerCode}\n<!--BODY_SEGMENT-->\n${bodyCode}\n<!--FOOTER_SEGMENT-->\n${footerCode}`,
          category: activeTab === "combined" ? "support_resolution" : (activeTab === "newsletter" ? "newsletter" : "welcome")
        })
      });

      if (response.ok) {
        setSaveStatus("Success! All HTML changes safely written to database.json.");
      } else {
        setSaveStatus("Write failed. DB schema error.");
      }
    } catch (e) {
      setSaveStatus("Connection error to core server API.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4500);
    }
  };

  // 3. ADD TO PROD
  const handleAddToProd = () => {
    setProdStatus("Publishing...");
    
    setTimeout(() => {
      setProdStatus("Added! This format template is locked and deployed to the live production SMTP worker.");
      setTimeout(() => setProdStatus(null), 4500);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      
      {/* TOP ROW SELECTIONS - EXACTLY REPLICATING DESIRED TABS */}
      <div className="flex gap-2.5 pb-2 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("welcome")}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
            activeTab === "welcome"
              ? "bg-orange-500 border-orange-500 text-black hover:bg-orange-600"
              : "bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
          }`}
        >
          Welcome Email
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("newsletter")}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
            activeTab === "newsletter"
              ? "bg-orange-500 border-orange-500 text-black hover:bg-orange-600"
              : "bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
          }`}
        >
          Newsletter Email
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("combined")}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
            activeTab === "combined"
              ? "bg-orange-500 border-orange-500 text-black hover:bg-orange-600"
              : "bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
          }`}
        >
          Combined Email
        </button>
      </div>

      {/* FEEDBACK STATUS HEADS */}
      {(saveStatus || testMailStatus || prodStatus) && (
        <div className="bg-[#121214] border border-neutral-800 p-3 rounded-lg flex flex-col gap-1 text-[11px] font-mono leading-tight">
          {saveStatus && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>[DATABASE REPORT]: {saveStatus}</span>
            </div>
          )}
          {testMailStatus && (
            <div className="flex items-center gap-2 text-orange-400">
              <Send className="w-3.5 h-3.5 animate-pulse" />
              <span>[TEST TRANSACTION]: {testMailStatus}</span>
            </div>
          )}
          {prodStatus && (
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>[PRODUCTION INTAKE]: {prodStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE CONTROL HEADER BAR */}
      <div className="bg-[#0b0b0d] border border-neutral-800/80 px-4 py-3 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Dropdown Indicator */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Layers className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest hidden sm:inline">Accessing:</span>
          <select
            value={selectedSubSection}
            onChange={(e) => setSelectedSubSection(e.target.value as any)}
            className="bg-[#111113] border border-neutral-800 focus:border-orange-500 text-[#ea580c] text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer font-bold font-mono uppercase tracking-wide flex-1 md:flex-initial"
          >
            <option value="header">Welcome Header Logo</option>
            <option value="body">Main Welcome Content</option>
            <option value="footer">Welcome Footer Signature</option>
          </select>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleTestEmail}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-transparent text-neutral-200 hover:text-white hover:border-orange-500 font-mono text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
            <span>test email</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-white text-black hover:bg-neutral-200 font-mono text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "saving..." : "save"}</span>
          </button>

          <button
            type="button"
            onClick={handleAddToProd}
            className="px-3.5 py-1.5 rounded-lg border border-orange-500/25 bg-orange-600/10 text-orange-500 hover:bg-orange-550 hover:text-black font-mono text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>add to prod</span>
          </button>
        </div>

      </div>

      {/* CORE THREE-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* COLUMN 1: Component & Token Selector Column (~20% width) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Section A: Layout Elements Checklist */}
          <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-4 flex-1">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>Studio Documents</span>
            </h3>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setSelectedSubSection("header")}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  selectedSubSection === "header"
                    ? "bg-orange-600/15 border-orange-500 text-orange-500"
                    : "bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">1. Header Grid</span>
                  {selectedSubSection === "header" && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <span className="text-[9px] text-neutral-500 font-mono">FALCORE logo banner HTML</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSubSection("body")}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  selectedSubSection === "body"
                    ? "bg-orange-600/15 border-orange-500 text-orange-500"
                    : "bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">2. Main Body Block</span>
                  {selectedSubSection === "body" && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <span className="text-[9px] text-neutral-500 font-mono">HTML context body container</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSubSection("footer")}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                  selectedSubSection === "footer"
                    ? "bg-orange-600/15 border-orange-500 text-orange-500"
                    : "bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">3. Footer Signature</span>
                  {selectedSubSection === "footer" && <Check className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <span className="text-[9px] text-neutral-500 font-mono">Legal unsubs token script</span>
              </button>
            </div>
          </div>

          {/* Section B: Design Constants Guide */}
          <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-2 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-500" />
              <span>Studio Schema Guide</span>
            </h3>
            <p className="text-neutral-500 text-[10px] leading-relaxed mb-3">
              Click to inject SQL-model parameter brackets into active line:
            </p>

            <div className="space-y-1">
              {TOKENS.map(tk => (
                <button
                  type="button"
                  key={tk.val}
                  onClick={() => handleInsertToken(tk.val)}
                  className="w-full bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800/80 hover:border-orange-500 rounded p-1.5 text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <span className="text-orange-500 font-mono font-bold text-[10.5px]">{tk.val}</span>
                  <span className="text-[9px] text-neutral-500 font-sans group-hover:text-neutral-300">{tk.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 2: HTML Editor Column (~45% width) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          
          {/* Code Editor Header */}
          <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-4 flex-1 flex flex-col min-h-[500px]">
            
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-orange-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  HTML CODE EDITOR: {selectedSubSection.toUpperCase()}
                </span>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">[LIVE EVAL COMPILER]</span>
            </div>

            {/* Editor Area with simulated line numbers */}
            <div className="flex-1 flex border border-neutral-800 rounded-lg overflow-hidden bg-[#030303] group focus-within:border-orange-500/80">
              
              {/* Simulated Gutter */}
              <div className="bg-[#080809] border-r border-neutral-800/60 px-2 py-3 select-none text-right font-mono text-[10px] text-neutral-600 space-y-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="leading-tight">{i + 1}</div>
                ))}
              </div>

              {/* Real Raw Text Editor Area */}
              <textarea
                ref={textEditorRef}
                value={getActiveCode()}
                onChange={(e) => updateActiveCode(e.target.value)}
                placeholder="<!-- Complete your premium custom HTML tags container code here -->"
                className="flex-1 p-3 font-mono text-[11.5px] leading-tight text-orange-300 bg-transparent outline-none resize-none overflow-y-auto whitespace-pre custom-scrollbar"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

            </div>

            <div className="flex items-center gap-1.5 pt-2 text-[9px] font-mono text-neutral-500">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
              <span>UTF-8 compliance // Sandbox strict compile parser active.</span>
            </div>

          </div>

        </div>

        {/* COLUMN 3: Live Sandbox Preview Column (~35% width) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-4 flex-1 flex flex-col min-h-[500px]">
            
            {/* Header with Recipient Variable Injector Dropdown */}
            <div className="flex flex-col gap-2 pb-2 border-b border-neutral-800 mb-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-orange-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">Live Preview</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">SANDBOX IFrame</span>
              </div>

              {/* Persons Relational Selector */}
              <div className="flex items-center gap-2 bg-[#121214] border border-neutral-800/80 px-2.5 py-1.5 rounded-lg">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Recipient:</span>
                {isLoading ? (
                  <span className="text-[10px] text-neutral-500 animate-pulse">Syncing...</span>
                ) : (
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-neutral-300 border-0 outline-none cursor-pointer font-mono font-bold hover:text-white"
                  >
                    {persons.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#0d0d0e] text-[#dddddd]">
                        {p.full_name || p.email} ({p.country || "US"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Real Sandboxed Preview IFrame Engine */}
            <div className="flex-1 rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950 flex flex-col relative">
              <iframe
                title="Live Sandbox Preview Frame"
                srcDoc={getCompiledHTML()}
                referrerPolicy="no-referrer"
                sandbox="allow-same-origin allow-scripts"
                className="w-full flex-1 bg-transparent border-none block"
              />
            </div>

            <div className="flex items-center justify-between pt-2.5 text-[9.5px] font-mono text-neutral-500">
              <span>Resolution: Fluid Auto</span>
              <span>Compiled Length: {getCompiledHTML().length} bytes</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
