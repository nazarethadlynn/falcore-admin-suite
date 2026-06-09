import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Search, 
  Filter, 
  Clock, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  Send, 
  User, 
  Mail, 
  Inbox, 
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Star,
  PlusCircle,
  Database,
  Users,
  Activity,
  Terminal,
  Globe,
  Settings,
  Shield,
  Layers,
  HeartCrack,
  Check
} from "lucide-react";
import { WebsiteSubmission, EmailTemplate, Person, EmailJob, EmailEvent, Subscription } from "../types";

// Palette settings
const COLORS = ["#ea580c", "#f97316", "#ffffff", "#525252", "#a3a3a3"];
const STATUS_COLORS = {
  new: "#f97316",       // Orange
  in_progress: "#ea580c", // Deep Orange
  replied: "#ffffff",     // White
  archived: "#404040"     // Charcoal Gray
};

interface SubmissionAnalyzerProps {
  outerSearch?: string;
}

export default function SubmissionAnalyzer({ outerSearch = "" }: SubmissionAnalyzerProps) {
  // Main database tables data states
  const [submissions, setSubmissions] = useState<WebsiteSubmission[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [emailJobs, setEmailJobs] = useState<EmailJob[]>([]);
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"submissions" | "persons" | "smtp">("submissions");
  
  // Filtering and Searching
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // ACTIVE SELECTIONS FOR DETAILED INSPECTION PANELS
  const [selectedSub, setSelectedSub] = useState<WebsiteSubmission | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedJob, setSelectedJob] = useState<EmailJob| null>(null);

  // Notes editor sub-states
  const [subNotes, setSubNotes] = useState("");
  const [personNotes, setPersonNotes] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);

  // Simulation form fields for inserting an administrator lead
  const [simName, setSimName] = useState("");
  const [simEmail, setSimEmail] = useState("");
  const [simSource, setSimSource] = useState("Direct Input");
  const [simCountry, setSimCountry] = useState("United States");
  const [simCity, setSimCity] = useState("San Francisco");
  const [simBrowser, setSimBrowser] = useState("Chrome");
  const [simOS, setSimOS] = useState("macOS");
  const [simNotes, setSimNotes] = useState("");
  const [simStatusMsg, setSimStatusMsg] = useState<string | null>(null);

  // Add person-to-job dispatcher fields
  const [dispJobType, setDispJobType] = useState("welcome_onboarding");
  const [dispPriority, setDispPriority] = useState("1");
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Auto Reply draft states
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState(false);
  
  // SMTP queue simulation triggers
  const [queueProcessing, setQueueProcessing] = useState(false);
  const [queueProcMsg, setQueueProcMsg] = useState<string | null>(null);

  // Sync outer headers search
  useEffect(() => {
    if (outerSearch !== undefined) {
      setSearch(outerSearch);
    }
  }, [outerSearch]);

  const loadAllDatabaseTables = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch original submissions
      const subRes = await fetch("/api/submissions");
      if (subRes.ok) {
        const subs = await subRes.json();
        setSubmissions(subs);
        if (subs.length > 0 && !selectedSub) {
          setSelectedSub(subs[0]);
          setSubNotes(subs[0].notes || "");
        }
      }

      // 2. Fetch custom SQLite relational tables
      const personsRes = await fetch("/api/persons");
      if (personsRes.ok) {
        const pers = await personsRes.json();
        setPersons(pers);
        if (pers.length > 0 && !selectedPerson) {
          setSelectedPerson(pers[0]);
          setPersonNotes(pers[0].notes || "");
        }
      }

      const jobsRes = await fetch("/api/email_jobs");
      if (jobsRes.ok) {
        const jbs = await jobsRes.json();
        setEmailJobs(jbs);
        if (jbs.length > 0 && !selectedJob) {
          setSelectedJob(jbs[0]);
        }
      }

      const eventsRes = await fetch("/api/email_events");
      if (eventsRes.ok) {
        setEmailEvents(await eventsRes.json());
      }

      const subscriptionsRes = await fetch("/api/subscriptions");
      if (subscriptionsRes.ok) {
        setSubscriptions(await subscriptionsRes.json());
      }

      const tplRes = await fetch("/api/templates");
      if (tplRes.ok) {
        setTemplates(await tplRes.json());
      }

    } catch (err) {
      console.error("Failed to compile SQLite relational database sync:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDatabaseTables();
  }, []);

  // Update notes value when changing selected submissions
  useEffect(() => {
    if (selectedSub) {
      setSubNotes(selectedSub.notes || "");
      setSelectedTemplateId("");
      setDraftSubject("");
      setDraftBody("");
      setMailSentSuccess(false);
    }
  }, [selectedSub]);

  // Update notes value when changing selected persons
  useEffect(() => {
    if (selectedPerson) {
      setPersonNotes(selectedPerson.notes || "");
    }
  }, [selectedPerson]);

  // Hoisted Recharts calculation data blocks
  const typeCounts = submissions.reduce((acc: Record<string, number>, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});
  
  const typeChartData = Object.entries(typeCounts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const sortedDates = [...submissions].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return da - db;
  });
  const dateCounts = sortedDates.reduce((acc: Record<string, number>, s) => {
    const dStr = new Date(s.createdAt || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    acc[dStr] = (acc[dStr] || 0) + 1;
    return acc;
  }, {});

  const trendChartData = Object.entries(dateCounts).slice(-6).map(([date, count]) => ({
    date,
    count
  }));


  // HANDLERS FOR WEBSITE INBOUND LEADS
  const handleSaveSubNotes = async () => {
    if (!selectedSub) return;
    try {
      setUpdatingNotes(true);
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: subNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSub(updated);
      }
    } catch (err) {
      console.error("Notes updating error:", err);
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleSubStatusChange = async (status: "new" | "in_progress" | "replied" | "archived") => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSub(updated);
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleApplyTemplateDraft = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!selectedSub) return;

    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) {
      setDraftSubject("");
      setDraftBody("");
      return;
    }

    // Strip static elements headers first
    let rawTemplateBody = tpl.body;
    if (rawTemplateBody.includes("<!--BODY_SEGMENT-->")) {
      const split = rawTemplateBody.split("<!--BODY_SEGMENT-->");
      if (split.length > 1) {
        const temp = split[1].split("<!--FOOTER_SEGMENT-->");
        rawTemplateBody = temp[0];
      }
    }

    let subj = tpl.subject
      .replace(/{{name}}/g, selectedSub.name)
      .replace(/{{subject}}/g, selectedSub.subject)
      .replace(/{{email}}/g, selectedSub.email)
      .replace(/{{id}}/g, selectedSub.id);

    let bdy = rawTemplateBody
      .replace(/{{name}}/g, selectedSub.name)
      .replace(/{{subject}}/g, selectedSub.subject)
      .replace(/{{email}}/g, selectedSub.email)
      .replace(/{{message}}/g, selectedSub.message)
      .replace(/{{id}}/g, selectedSub.id)
      .replace(/{{date}}/g, new Date(selectedSub.createdAt).toLocaleDateString());

    setDraftSubject(subj);
    setDraftBody(bdy);
  };

  const handleAIEnhanceResponse = async () => {
    if (!selectedSub) return;
    try {
      setGeneratingDraft(true);
      const res = await fetch("/api/gemini/draft-ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          templateId: selectedTemplateId || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Extract raw body or strip HTML comments for tidy reading
        let cleanBody = data.body || "";
        if (cleanBody.includes("<!--BODY_SEGMENT-->")) {
          const split = cleanBody.split("<!--BODY_SEGMENT-->");
          if (split.length > 1) {
            const temp = split[1].split("<!--FOOTER_SEGMENT-->");
            cleanBody = temp[0];
          }
        }
        setDraftSubject(data.subject || "");
        setDraftBody(cleanBody);
      } else {
        alert("Gemini AI API model is currently starting up or key is absent. Ensure GEMINI_API_KEY is correctly set in environment settings.");
      }
    } catch (e) {
      console.error("AI Generation failed:", e);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleDisptachSimulatedEmail = async () => {
    if (!selectedSub) return;
    try {
      setMailSentSuccess(true);
      
      const logStamp = `[SIMULATED DISPATCH DETECTED: "${draftSubject}" on ${new Date().toUTCString()}]\nNotes: ${subNotes}`;
      
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "replied",
          notes: logStamp
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSub(updated);
        
        // Push a simulated queue task to email jobs too to mirror real operations!
        const matchPerson = persons.find(p => p.email.toLowerCase() === selectedSub.email.toLowerCase());
        if (matchPerson) {
          await fetch("/api/email_jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              person_id: matchPerson.id,
              job_type: "manual_auto_reply",
              priority: 2
            })
          });
          const updatedJobsRes = await fetch("/api/email_jobs");
          if (updatedJobsRes.ok) {
            setEmailJobs(await updatedJobsRes.json());
          }
        }
      }
      
      setTimeout(() => {
        setMailSentSuccess(false);
        setDraftSubject("");
        setDraftBody("");
        setSelectedTemplateId("");
      }, 4000);
    } catch (e) {
      console.error("Send mail error:", e);
    }
  };

  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you certain you wish to purge this website lead transaction?")) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        if (selectedSub?.id === id) {
          setSelectedSub(null);
        }
      }
    } catch (err) {
      console.error("Purging submission failed:", err);
    }
  };


  // HANDLERS FOR PERSONS / LEADS DATABASE
  const handleAddNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail) return;

    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: simEmail,
          full_name: simName || simEmail.split("@")[0],
          source: simSource,
          country: simCountry,
          city: simCity,
          browser: simBrowser,
          os: simOS,
          consent_given: true,
          notes: simNotes || "Manually seeded administrative operational record"
        })
      });

      if (res.ok) {
        const newLead = await res.json();
        
        // Refresh local lists
        const updatePersons = await fetch("/api/persons");
        if (updatePersons.ok) {
          const freshPers = await updatePersons.json();
          setPersons(freshPers);
          setSelectedPerson(newLead);
        }

        const updateSubs = await fetch("/api/subscriptions");
        if (updateSubs.ok) {
          setSubscriptions(await updateSubs.json());
        }

        setSimEmail("");
        setSimName("");
        setSimNotes("");
        setSimStatusMsg("Lead written directly into SQL schema collections!");
        setTimeout(() => setSimStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error("Adding lead error:", err);
    }
  };

  const handleUpdatePersonNotes = async () => {
    if (!selectedPerson) return;
    try {
      setUpdatingNotes(true);
      const res = await fetch(`/api/persons/${selectedPerson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: personNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setPersons(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedPerson(updated);
      }
    } catch (e) {
      console.error("Updating person notes failed:", e);
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDeletePerson = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("This will execute cascading drop operations on subscriptions & queued email jobs for this lead. Proceed?")) return;
    try {
      const res = await fetch(`/api/persons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPersons(prev => prev.filter(p => p.id !== id));
        if (selectedPerson?.id === id) {
          setSelectedPerson(null);
        }
        // reload databases
        const jobs = await (await fetch("/api/email_jobs")).json();
        setEmailJobs(jobs);
        const evts = await (await fetch("/api/email_events")).json();
        setEmailEvents(evts);
        const subsc = await (await fetch("/api/subscriptions")).json();
        setSubscriptions(subsc);
      }
    } catch (e) {
      console.error("Failed to cascading delete person:", e);
    }
  };

  const handleDispatchEmailJob = async () => {
    if (!selectedPerson) return;
    try {
      const res = await fetch("/api/email_jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: selectedPerson.id,
          job_type: dispJobType,
          priority: Number(dispPriority)
        })
      });

      if (res.ok) {
        setDispatchSuccess(true);
        // Refresh jobs status
        const jobs = await (await fetch("/api/email_jobs")).json();
        setEmailJobs(jobs);
        
        setTimeout(() => setDispatchSuccess(false), 3500);
      }
    } catch (e) {
      console.error("E-mail job dispatch error:", e);
    }
  };


  // BACKGROUND QUEUE SCHEMATIC SIMULATOR WORKER
  const handleSimulateSMTPQueueRun = async () => {
    try {
      setQueueProcessing(true);
      setQueueProcMsg("Locking scheduled jobs... Contacting providers Sendgrid/Postmark/AWS SES...");
      
      const res = await fetch("/api/simulate-background-queue", { method: "POST" });
      if (res.ok) {
        const resData = await res.json();
        
        // Reload all data streams
        const updatedJobs = await (await fetch("/api/email_jobs")).json();
        setEmailJobs(updatedJobs);
        const updatedEvts = await (await fetch("/api/email_events")).json();
        setEmailEvents(updatedEvts);

        setQueueProcMsg(`Queue Process Completed successfully! Processed ${resData.processedCount} pending jobs.`);
        setTimeout(() => setQueueProcMsg(null), 5000);
      }
    } catch (e) {
      console.error("Worker simulation error:", e);
    } finally {
      setQueueProcessing(false);
    }
  };


  // CALCULATIONS / ANALYTICS METRICS FOR THE DATABASE DIAGNOSTICS SCREEN
  
  // A. Total submissions
  const totalInboundCount = submissions.length;
  // B. Subscriptions
  const totalSubscribers = persons.length;
  const newsletterActive = subscriptions.filter(s => s.is_newsletter).length;
  const waitlistActive = subscriptions.filter(s => s.is_waitlist).length;
  
  // C. SMTP queue health
  const totalJobs = emailJobs.length;
  const pendingJobs = emailJobs.filter(j => j.status === "pending").length;
  const failedJobs = emailJobs.filter(j => j.status === "failed").length;
  const successJobs = emailJobs.filter(j => j.status === "success").length;
  const smtpHealthRatio = totalJobs ? Math.round((successJobs / (successJobs + failedJobs || 1)) * 100) : 100;

  // D. Event status logs
  const totalEvents = emailEvents.length;
  const deliverySent = emailEvents.filter(e => e.status === "sent").length;
  const deliveryBounce = emailEvents.filter(e => e.status === "failed").length;

  // Recharts metric chart 1: UTMS Source distribution from Persons database
  const utmSourceCounts = persons.reduce((acc: Record<string, number>, p) => {
    const src = p.source || "Direct link";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  const utmChartData = Object.entries(utmSourceCounts).map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 15) + "..." : name,
    value
  }));

  // Recharts metric chart 2: Country demographics from Persons database
  const countryCounts = persons.reduce((acc: Record<string, number>, p) => {
    const country = p.country || "Other";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countryChartData = Object.entries(countryCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Recharts metric chart 3: SMTP events timeline by Provider (Sendgrid, AWS SES, Postmark)
  const providerCounts = emailEvents.reduce((acc: Record<string, number>, e) => {
    const prov = e.provider || "Unknown";
    acc[prov] = (acc[prov] || 0) + 1;
    return acc;
  }, {});

  const providerChartData = Object.entries(providerCounts).map(([name, value]) => ({
    name,
    value
  }));


  // FILTERING SENDER/MESSAGE SUBMISSIONS
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.subject.toLowerCase().includes(search.toLowerCase()) ||
      sub.message.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || sub.type === filterType;
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // FILTERING REGISTRANT PERSONS LIST
  const filteredPersons = persons.filter(p => {
    const matchesSearch = 
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.country && p.country.toLowerCase().includes(search.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(search.toLowerCase())) ||
      (p.source && p.source.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* SECTION 1: MASTER BENTO KPI METRICS SUMMARY */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric A: Inquiries Inflow */}
        <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-orange-650/10 text-orange-500 group-hover:scale-110 transition-transform">
            <Inbox className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest block font-bold">Client Inquiries (Inbox)</span>
          <span className="text-3xl font-black text-white mt-1 block">
            {totalInboundCount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-mono text-neutral-500 leading-none">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
            <span>Active listeners mapped to /api/submissions</span>
          </div>
        </div>

        {/* Metric B: Custom Persons Table */}
        <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-orange-650/10 text-orange-500 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest block font-bold">Persons Database Table</span>
          <span className="text-3xl font-black text-white mt-1 block">
            {totalSubscribers.toLocaleString()}
          </span>
          <div className="flex items-center gap-2 mt-2.5 text-[9.5px] font-mono leading-none">
            <span className="text-orange-500 font-bold">NEWSLETTER: {newsletterActive} active</span>
            <span className="text-neutral-600">|</span>
            <span className="text-white font-medium">WAITLIST: {waitlistActive}</span>
          </div>
        </div>

        {/* Metric C: SMTP Jobs Queue */}
        <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-orange-650/10 text-orange-500 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest block font-bold">SMTP Job Queue Health</span>
          <span className="text-3xl font-black text-orange-500 mt-1 block">
            {smtpHealthRatio}% <span className="text-xs font-mono text-neutral-550 font-normal">Success</span>
          </span>
          <div className="flex items-center gap-2 mt-2.5 text-[9px] font-mono text-neutral-500 leading-none">
            <span>Jobs: {totalJobs} total</span>
            <span>•</span>
            <span className="text-orange-400 font-bold">{pendingJobs} pending</span>
            <span>•</span>
            <span className="text-red-500 font-bold">{failedJobs} failed</span>
          </div>
        </div>

        {/* Metric D: SMTP Events delivered logs */}
        <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-orange-650/10 text-orange-500 group-hover:scale-110 transition-transform">
            <Database className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest block font-bold">Delivery Receipts (Events)</span>
          <span className="text-3xl font-black text-white mt-1 block">
            {totalEvents.toLocaleString()}
          </span>
          <div className="flex items-center gap-2.5 mt-2.5 text-[9.5px] font-mono text-neutral-500 leading-none">
            <span className="text-green-400 font-bold">✓ {deliverySent} SENT</span>
            <span>|</span>
            <span className="text-red-500 font-bold">✕ {deliveryBounce} BOUNCED</span>
          </div>
        </div>

      </section>

      {/* THREE-TAB MENU PANEL AT THE TOP OF WORKSPACE */}
      <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-1.5 flex gap-1.5 shrink-0 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "submissions"
              ? "bg-orange-500 text-black shadow shadow-orange-500/10"
              : "bg-transparent text-neutral-450 hover:text-white"
          }`}
        >
          submissions log
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("persons")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "persons"
              ? "bg-orange-500 text-black shadow shadow-orange-500/10"
              : "bg-transparent text-neutral-450 hover:text-white"
          }`}
        >
          persons database
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("smtp")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "smtp"
              ? "bg-orange-500 text-black shadow shadow-orange-500/10"
              : "bg-transparent text-neutral-450 hover:text-white"
          }`}
        >
          smtp queue engines
        </button>
      </div>

      {/* CORE CONTENT CONTROLLER PANEL */}
      
      {/* TAB A: WEBSITE SUBMISSIONS AND GENERAL AI RESPONSE MANAGER */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          
          {/* Recharts Analytics curve blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>Conversion Acquisition timeline</span>
              </h3>
              <div className="h-[180px]">
                {submissions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData}>
                      <defs>
                        <linearGradient id="curveColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" stroke="#666" fontSize={9} tickLine={false} />
                      <YAxis stroke="#666" fontSize={9} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0b0b0d", border: "1px solid #333", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff", fontSize: "11px" }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#curveColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-500 text-xs font-mono">Telemetry database state is clean.</div>
                )}
              </div>
            </div>

            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>acquisition categories percentage</span>
              </h3>
              <div className="h-[180px] flex items-center justify-between">
                {typeChartData.length > 0 ? (
                  <>
                    <div className="w-[50%] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {typeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#0b0b0d", border: "1.5px solid #222" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-[45%] text-left space-y-1.5">
                      {typeChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-[10px] text-neutral-350 font-mono font-extrabold">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-neutral-500 text-xs">Awaiting datasets.</div>
                )}
              </div>
            </div>
          </div>

          {/* Submissions Layout split workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Table side (7 columns) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-[#0b0b0d] border border-neutral-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 bg-[#121214] border border-neutral-800 px-3 py-1.5 rounded-lg flex-1 min-w-[200px]">
                  <Search className="text-neutral-500 w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search logs by name / message..."
                    className="bg-transparent text-xs text-white w-full outline-none placeholder:text-neutral-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-[#121214] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 text-neutral-350 outline-none cursor-pointer focus:border-orange-500 font-mono"
                  >
                    <option value="all">Types (All)</option>
                    <option value="contact">Contact</option>
                    <option value="support">Support</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="feedback">Feedback</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#121214] border border-neutral-800 rounded-lg text-xs py-1.5 px-2.5 text-neutral-350 outline-none cursor-pointer focus:border-orange-500 font-mono"
                  >
                    <option value="all">Statuses (All)</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400 font-extrabold uppercase">Durable Submission Rows</span>
                  <span className="text-[9px] font-mono text-neutral-600">[database.json]</span>
                </div>

                <div className="divide-y divide-neutral-800/80 max-h-[380px] overflow-y-auto custom-scrollbar">
                  {filteredSubmissions.map(sub => {
                    const isSelected = selectedSub?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className={`p-4 text-left transition-all cursor-pointer flex items-start gap-3 group ${
                          isSelected ? "bg-orange-500/10 border-l-4 border-orange-500" : "hover:bg-neutral-900/30"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border ${
                          isSelected ? "bg-orange-500 border-orange-550 text-black" : "bg-neutral-900 border-neutral-800 text-orange-500"
                        }`}>
                          <User className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white group-hover:text-orange-500 truncate">{sub.name}</span>
                            <span className="text-[9px] font-mono text-neutral-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs text-neutral-300 font-bold block truncate mt-1">Subject: {sub.subject}</span>
                          <span className="text-[11px] text-neutral-500 line-clamp-1 italic font-mono mt-1">"{sub.message}"</span>

                          <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded border bg-neutral-900 text-neutral-300 border-neutral-800 uppercase tracking-widest font-mono">
                              {sub.type}
                            </span>
                            <span 
                              className="text-[8.5px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                              style={{ 
                                backgroundColor: `${STATUS_COLORS[sub.status]}10`, 
                                borderColor: `${STATUS_COLORS[sub.status]}20`,
                                color: STATUS_COLORS[sub.status] 
                              }}
                            >
                              {sub.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSubmission(sub.id, e)}
                            className="p-1 hover:text-orange-500 font-mono text-neutral-600 font-black cursor-pointer text-sm"
                            title="Purge transaction"
                          >
                            ×
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Response & inspector pane (5 columns) */}
            <div className="lg:col-span-5 bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 flex flex-col justify-between min-h-[500px]">
              {selectedSub ? (
                <div className="space-y-5">
                  <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest font-bold text-orange-500 bg-orange-550/10 px-2 py-0.5 rounded uppercase border border-orange-500/20">
                        {selectedSub.id}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 leading-none">{selectedSub.name}</h3>
                      <p className="text-[11px] text-neutral-450 mt-1 font-mono">{selectedSub.email}</p>
                    </div>

                    <select
                      value={selectedSub.status}
                      onChange={(e) => handleSubStatusChange(e.target.value as any)}
                      className="bg-[#121214] border border-neutral-800 rounded-lg text-[10px] py-1 px-2 text-white outline-none cursor-pointer focus:border-orange-500 font-mono uppercase font-bold"
                    >
                      <option value="new">🔴 unread</option>
                      <option value="in_progress">🟠 processing</option>
                      <option value="replied">⚪ replied</option>
                      <option value="archived">⚫ archived</option>
                    </select>
                  </div>

                  {/* Message box */}
                  <div className="bg-[#030303] border border-neutral-800 rounded-lg p-3.5 space-y-1.5 text-xs">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold leading-none">INQUIRY SUBJECT DETAIL</span>
                    <div className="text-white font-extrabold pb-1.5 border-b border-neutral-850/60 font-mono">"{selectedSub.subject}"</div>
                    <p className="text-neutral-400 italic pt-1 font-sans">"{selectedSub.message}"</p>
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">INTERNAL ACTION NOTES</span>
                      <button
                        type="button"
                        onClick={handleSaveSubNotes}
                        disabled={updatingNotes}
                        className="text-[9px] text-orange-500 font-mono font-bold hover:text-orange-400 cursor-pointer"
                      >
                        {updatingNotes ? "[ SAVING... ]" : "[ COMMIT CHANGES ]"}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={subNotes}
                      onChange={(e) => setSubNotes(e.target.value)}
                      placeholder="Add system notes for telemetry logs..."
                      className="w-full bg-[#030303] border border-neutral-805 rounded-lg p-2.5 text-xs text-neutral-300 placeholder:text-neutral-700 outline-none font-mono"
                    />
                  </div>

                  {/* Reply Workspace */}
                  <div className="border-t border-neutral-800 pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-mono text-neutral-450 uppercase tracking-widest font-bold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        <span>DISPATCH RESPONSE EDITOR</span>
                      </span>

                      {templates.length > 0 && (
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => handleApplyTemplateDraft(e.target.value)}
                          className="bg-[#121214] border border-neutral-800 rounded-lg text-[9px] py-1 px-1.5 text-neutral-300 cursor-pointer outline-none max-w-[130px] font-mono uppercase font-bold"
                        >
                          <option value="">Apply schema tpl...</option>
                          {templates.map(tpl => (
                            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="bg-[#030303] border border-neutral-800/80 rounded-lg p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase">Tidy Rich Output</span>
                        
                        <button
                          type="button"
                          onClick={handleAIEnhanceResponse}
                          disabled={generatingDraft}
                          className="text-[8.5px] bg-orange-600/10 text-orange-500 hover:bg-orange-550 hover:text-black hover:border-orange-500 px-1.5 py-0.5 rounded border border-orange-500/15 font-sans font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>MOCK AI REPLY</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Subject header line..."
                        value={draftSubject}
                        onChange={(e) => setDraftSubject(e.target.value)}
                        className="w-full bg-[#0d0d0e]/60 border border-neutral-850 rounded-md px-2 py-1 text-xs text-white placeholder:text-neutral-700 outline-none focus:border-orange-500/60 font-mono"
                      />

                      <textarea
                        rows={3}
                        placeholder="Draft response content..."
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        className="w-full bg-[#0d0d0e]/60 border border-neutral-850 rounded-md p-2 text-[11px] text-neutral-300 placeholder:text-neutral-700 outline-none focus:border-orange-500/60 font-sans resize-none leading-relaxed"
                      />
                    </div>

                    {draftBody && (
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-850">
                        {mailSentSuccess ? (
                          <span className="text-[10px] text-orange-400 font-mono font-bold animate-pulse flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Simulated transaction complete!
                          </span>
                        ) : (
                          <span className="text-[9px] text-neutral-500 font-mono">Simulates actual SMTP relay logs.</span>
                        )}

                        <button
                          type="button"
                          onClick={handleDisptachSimulatedEmail}
                          className="bg-white hover:bg-neutral-250 border-0 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer uppercase font-mono"
                        >
                          <Send className="w-3 h-3 text-black" />
                          <span>SEND</span>
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600 text-xs">No active submission row selected.</div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB B: PERSONS MASTER DATABASE & SUBSCRIPTIONS SURVEYS */}
      {activeTab === "persons" && (
        <div className="space-y-6">
          
          {/* Recharts Analytics on Channels/Consent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-orange-500" />
                <span>leads geographic demographics</span>
              </h3>
              <div className="h-[180px]">
                {countryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryChartData} margin={{ left: -25, right: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={9} tickLine={false} />
                      <YAxis stroke="#666" fontSize={9} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0d", border: "1px solid #333" }} />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-550 text-xs font-mono">demographics queue empty.</div>
                )}
              </div>
            </div>

            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>acquisition source channels</span>
              </h3>
              <div className="h-[180px]">
                {utmChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utmChartData} layout="vertical" margin={{ left: 10, right: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                      <XAxis type="number" stroke="#666" fontSize={9} />
                      <YAxis dataKey="name" type="category" stroke="#666" fontSize={8} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0d", border: "1px solid #333" }} />
                      <Bar dataKey="value" fill="#ffffff" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-550 text-xs text-center font-mono">No marketing metrics logged yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Lead list datatable (7 columns) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-[#0b0b0d] border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 bg-[#121214] border border-neutral-800 px-3 py-1.5 rounded-lg flex-1">
                  <Search className="text-neutral-500 w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search master list by name / email / source / location..."
                    className="bg-transparent text-xs text-white w-full outline-none placeholder:text-neutral-500 font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-850 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">
                    Registrants Persons list ({filteredPersons.length})
                  </h3>
                  <span className="text-[9px] text-[#ff6600] uppercase font-bold tracking-widest">NATIVE SQL SCHEMA</span>
                </div>

                <div className="divide-y divide-neutral-850 h-[380px] overflow-y-auto custom-scrollbar">
                  {filteredPersons.map(p => {
                    const isSelected = selectedPerson?.id === p.id;
                    const subInfo = subscriptions.find(s => s.person_id === p.id);
                    
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPerson(p)}
                        className={`p-4 text-left transition-all cursor-pointer flex items-start gap-3 justify-between group ${
                          isSelected ? "bg-orange-500/10 border-l-4 border-orange-500" : "hover:bg-neutral-900/30"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-lg border ${
                            isSelected ? "bg-orange-500 border-orange-550 text-black" : "bg-neutral-900 border-neutral-800 text-orange-500"
                          }`}>
                            <Users className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white group-hover:text-orange-500 truncate">{p.full_name || p.email}</span>
                              <span className="text-[9px] font-mono text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono block truncate mt-0.5">{p.email}</span>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[8px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-neutral-900 text-white font-bold">
                                📍 {p.city || "Unknown"}, {p.country || "US"}
                              </span>
                              
                              <span className="text-[8px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-[#101012] text-neutral-400">
                                Source: {p.source || "Organic"}
                              </span>

                              {subInfo && (
                                <div className="flex items-center gap-1 text-[8.5px] font-mono">
                                  {subInfo.is_newsletter ? (
                                    <span className="px-1 bg-green-950 text-green-400 border border-green-900 rounded font-bold uppercase">newsletter</span>
                                  ) : (
                                    <span className="px-1 bg-neutral-900 text-neutral-500 border border-neutral-800 rounded font-mono uppercase">unsubscribed</span>
                                  )}
                                  {subInfo.is_waitlist && (
                                    <span className="px-1 bg-orange-950 text-orange-400 border border-orange-900 rounded font-bold uppercase">waitlist</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center self-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleDeletePerson(p.id, e)}
                            className="p-1 hover:text-orange-500 text-neutral-600 font-bold font-mono text-sm leading-none"
                            title="Cascading delete person record"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Addition & details console (5 columns) */}
            <div className="lg:col-span-5 bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 flex flex-col justify-between min-h-[500px]">
              
              <div className="space-y-5">
                <div className="border-b border-neutral-800 pb-2.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Lead Actions Control</h3>
                  <span className="text-[9.5px] text-neutral-500 font-mono">Coordinate transaction queues and notes</span>
                </div>

                {selectedPerson ? (
                  <div className="space-y-4">
                    <div className="bg-[#030303] border border-neutral-800 p-3 rounded-lg text-xs leading-relaxed">
                      <span className="text-[8.5px] font-mono text-neutral-500 font-bold tracking-widest uppercase block leading-none">REGISTRATION RECORD METADATA</span>
                      <h4 className="text-white font-extrabold mt-1.5 block leading-none">{selectedPerson.full_name}</h4>
                      <p className="text-neutral-350 font-mono text-[10px] mt-1">{selectedPerson.email}</p>
                      
                      <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-neutral-850/60 font-mono text-[9px] text-neutral-400">
                        <div>ID: <span className="text-white text-[10px] font-bold">{selectedPerson.id}</span></div>
                        <div>KEY: <span className="text-orange-500 font-bold">{selectedPerson.deployment_key || "N/A"}</span></div>
                        <div>IP: <span className="text-neutral-300">{selectedPerson.ip_address}</span></div>
                        <div>OS: <span className="text-neutral-300">{selectedPerson.os} / {selectedPerson.browser}</span></div>
                        <div className="col-span-2 truncate">UTM: <span className="text-[#ea580c]">{selectedPerson.utm_campaign || "N/A"} // {selectedPerson.utm_medium || "N/A"}</span></div>
                      </div>
                    </div>

                    {/* Subscription survey details */}
                    {subscriptions.find(s => s.person_id === selectedPerson.id) && (() => {
                      const sub = subscriptions.find(s => s.person_id === selectedPerson.id)!;
                      const hasFeedback = sub.newsletter_unsubscribe_reason || sub.waitlist_unsubscribe_reason;
                      return (
                        <div className="p-3 bg-[#0a0a0c] border border-neutral-800 rounded-lg text-xs leading-tight">
                          <span className="text-[8px] font-mono tracking-widest font-bold text-neutral-500 uppercase block mb-1">SURVEY FEEDBACK / REASONS</span>
                          {hasFeedback ? (
                            <div className="space-y-1 mt-1 font-mono text-[10px] text-neutral-400 italic">
                              {sub.newsletter_unsubscribe_reason && (
                                <p>• Unsubscribed: <span className="text-orange-500 font-extrabold">"{sub.newsletter_unsubscribe_reason}"</span></p>
                              )}
                              {sub.newsletter_unsubscribe_feedback && (
                                <p className="pl-2 border-l border-neutral-800 mt-1">"{sub.newsletter_unsubscribe_feedback}"</p>
                              )}
                              {sub.waitlist_unsubscribe_reason && (
                                <p>• Unsubscribed: <span className="text-orange-500 font-extrabold">"{sub.waitlist_unsubscribe_reason}"</span></p>
                              )}
                              {sub.waitlist_unsubscribe_feedback && (
                                <p className="pl-2 border-l border-neutral-800 mt-1">"{sub.waitlist_unsubscribe_feedback}"</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Opted into system communications cleanly with zero opt-outs.</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Private review notes */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[8.5px] font-mono text-neutral-400 font-bold uppercase tracking-widest">LEAD REVIEW NOTES</span>
                        <button
                          type="button"
                          onClick={handleUpdatePersonNotes}
                          disabled={updatingNotes}
                          className="text-[9px] text-[#ea580c] font-mono font-bold hover:text-orange-500 cursor-pointer"
                        >
                          {updatingNotes ? "[ SAVING... ]" : "[ COMMIT NOTES ]"}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={personNotes}
                        onChange={(e) => setPersonNotes(e.target.value)}
                        placeholder="Type notes specific to the SQL lead registry..."
                        className="w-full bg-[#030303] border border-neutral-805 rounded-lg p-2.5 text-xs text-neutral-300 placeholder:text-neutral-700 outline-none resize-none font-mono"
                      />
                    </div>

                    {/* Dispatch custom job right from subscriber console */}
                    <div className="border-t border-neutral-850 pt-3 space-y-2">
                      <span className="text-[8.5px] font-mono text-neutral-400 font-bold uppercase tracking-widest block mb-1">DISPATCH TASK QUEUE TRIGGER</span>
                      
                      <div className="flex gap-2 items-center">
                        <select
                          value={dispJobType}
                          onChange={(e) => setDispJobType(e.target.value)}
                          className="bg-[#030303] border border-neutral-800 rounded-lg text-[10px] py-1.5 px-2 text-white outline-none cursor-pointer focus:border-orange-500 font-mono flex-1 uppercase font-bold"
                        >
                          <option value="welcome_onboarding">welcome_onboarding</option>
                          <option value="newsletter_broadcast">newsletter_broadcast</option>
                          <option value="verification_code">verification_code</option>
                          <option value="priority_alert">priority_alert</option>
                          <option value="weekly_digest">weekly_digest</option>
                        </select>

                        <select
                          value={dispPriority}
                          onChange={(e) => setDispPriority(e.target.value)}
                          className="bg-[#030303] border border-neutral-800 rounded-lg text-[10px] py-1.5 px-2 text-white outline-none cursor-pointer focus:border-orange-500 font-mono width-[60px] uppercase font-bold"
                        >
                          <option value="0">P0 (LOW)</option>
                          <option value="1">P1 (MED)</option>
                          <option value="2">P2 (HIGH)</option>
                          <option value="3">P3 (CRIT)</option>
                        </select>

                        <button
                          type="button"
                          onClick={handleDispatchEmailJob}
                          className="bg-orange-600 hover:bg-orange-550 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer"
                        >
                          dispatch
                        </button>
                      </div>

                      {dispatchSuccess && (
                        <div className="text-[9px] text-green-400 font-mono font-bold animate-pulse">
                          ✓ Successfully added SMTP pending job reference in queue!
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="text-neutral-500 text-xs font-mono py-12 text-center">No subscriber entry row chosen.</div>
                )}

                {/* Sub-Section B: Fast simulated lead creator */}
                <div className="border-t border-neutral-800 pt-4.5">
                  <div className="bg-[#070708] border border-neutral-800/80 rounded-xl p-4 space-y-4">
                    <span className="text-[9px] font-mono text-orange-500 font-bold uppercase tracking-widest block leading-none">Administrator Lead Seeds Creator</span>
                    <form onSubmit={handleAddNewLead} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          required
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          placeholder="Contact Email (Required)"
                          className="w-full bg-[#030303] border border-neutral-805 rounded-md px-2 py-1.5 text-xs text-white placeholder:text-neutral-700 outline-none"
                        />
                        <input
                          type="text"
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          placeholder="Full Name (optional)"
                          className="w-full bg-[#030303] border border-neutral-805 rounded-md px-2 py-1.5 text-xs text-white placeholder:text-neutral-700 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="text"
                          value={simSource}
                          onChange={(e) => setSimSource(e.target.value)}
                          placeholder="Marketing Source"
                          className="w-full bg-[#030303] border border-neutral-805 rounded-md px-2 py-1 text-[10px] text-white outline-none"
                        />
                        <input
                          type="text"
                          value={simCountry}
                          onChange={(e) => setSimCountry(e.target.value)}
                          placeholder="Country"
                          className="w-full bg-[#030303] border border-neutral-805 rounded-md px-2 py-1 text-[10px] text-white outline-none"
                        />
                        <input
                          type="text"
                          value={simCity}
                          onChange={(e) => setSimCity(e.target.value)}
                          placeholder="City"
                          className="w-full bg-[#030303] border border-neutral-805 rounded-md px-2 py-1 text-[10px] text-white outline-none"
                        />
                      </div>

                      <textarea
                        rows={1}
                        value={simNotes}
                        onChange={(e) => setSimNotes(e.target.value)}
                        placeholder="Private client telemetry notes..."
                        className="w-full bg-[#030303] border border-neutral-805 rounded-md p-2 text-[10.5px] text-white placeholder:text-neutral-700 resize-none outline-none font-mono"
                      />

                      <div className="flex items-center justify-between">
                        {simStatusMsg ? (
                          <span className="text-[9px] text-green-400 font-mono font-bold animate-pulse">{simStatusMsg}</span>
                        ) : (
                          <span className="text-[8px] text-neutral-500 font-mono">Simulates incoming signup webhooks</span>
                        )}
                        <button
                          type="submit"
                          className="px-3 py-1 bg-white hover:bg-neutral-200 text-black font-extrabold text-[10px] rounded uppercase font-mono cursor-pointer"
                        >
                          save lead
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB C: SMTP PIPELINE QUEUES AND TIMELINE LOGS */}
      {activeTab === "smtp" && (
        <div className="space-y-6">
          
          {/* SMTP Delivery metrics graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-orange-500" />
                <span>SMTP API dispatch counts by provider</span>
              </h3>
              <div className="h-[180px]">
                {providerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={providerChartData} margin={{ left: -25, right: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={9} tickLine={false} />
                      <YAxis stroke="#666" fontSize={9} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0d", border: "1px solid #333" }} />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]}>
                        {providerChartData.map((e, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-550 text-xs font-mono">No SMTP delivery logs timeline. Run queue worker!</div>
                )}
              </div>
            </div>

            <div className="bg-[#0b0b0d] border border-neutral-800 rounded-xl p-5 flex flex-col justify-center items-center">
              <div className="text-center space-y-3.5 max-w-sm px-4">
                <Terminal className="w-10 h-10 text-orange-500 mx-auto animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Background Relational SMTP Daemon</h3>
                <p className="text-neutral-450 text-[11px] leading-relaxed font-mono">
                  Incoming signups create 'pending' entries in our email_jobs table. Click the daemon trigger below to simulate background queue workers checking headers, routing parameters, compiling HTML templates, and logging delivery events in real-time.
                </p>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateSMTPQueueRun}
                    disabled={queueProcessing}
                    className="p-3 bg-orange-500 hover:bg-orange-600 font-mono text-[11px] font-black text-black uppercase tracking-wider rounded-lg shadow-md shadow-orange-500/10 flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${queueProcessing ? "animate-spin" : ""}`} />
                    <span>{queueProcessing ? "Daemons Running..." : "Execute SMTP Worker Daemons"}</span>
                  </button>
                </div>

                {queueProcMsg && (
                  <span className="text-[10px] text-orange-400 font-mono font-bold animate-pulse block">
                    ✓ {queueProcMsg}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Email Jobs list (6 columns) */}
            <div className="lg:col-span-6 bg-[#0b0b0d] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">scheduled email_jobs table Logs</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">Dynamic queue state telemetry tracking</span>
                  </div>
                  <span className="text-[10px] bg-[#121214] border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-mono font-bold">
                    JOBS: {emailJobs.length}
                  </span>
                </div>

                <div className="divide-y divide-neutral-850 max-h-[420px] overflow-y-auto custom-scrollbar">
                  {emailJobs.map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-3.5 text-left transition-all cursor-pointer flex justify-between items-center group font-mono text-[11px] ${
                          isSelected ? "bg-orange-500/10 border-l-4 border-orange-500" : "hover:bg-neutral-900/25"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-white truncate">{job.id}</span>
                            <span className="text-[8.5px] uppercase font-bold text-neutral-500 bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">
                              P{job.priority}
                            </span>
                          </div>
                          
                          <div className="text-[10.5px] text-neutral-450 mt-1 truncate">
                            Email: <span className="text-neutral-300 font-bold">{job.email}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-1">
                            Type: <span className="text-orange-500">{job.job_type}</span> // Provider: <span className="text-white">{job.provider || "PENDING"}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span 
                            className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border block"
                            style={{ 
                              backgroundColor: job.status === "success" ? "rgba(34, 197, 94, 0.1)" : (job.status === "failed" ? "rgba(239, 68, 68, 0.1)" : "rgba(249, 115, 22, 0.1)"),
                              borderColor: job.status === "success" ? "rgba(34, 197, 94, 0.2)" : (job.status === "failed" ? "rgba(239, 68, 68, 0.2)" : "rgba(249, 115, 22, 0.2)"),
                              color: job.status === "success" ? "#22c55e" : (job.status === "failed" ? "#ef4444" : "#f97316")
                            }}
                          >
                            {job.status}
                          </span>
                          <span className="text-[8.5px] text-neutral-500 block mt-1.5 leading-none">
                            Attempts: {job.attempts}/{job.max_attempts}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Job inspector footer component */}
              {selectedJob && (
                <div className="bg-[#030303] border-t border-neutral-850 p-4 font-mono text-[11px] space-y-1.5 leading-tight">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase tracking-widest font-bold">SMTP ERRORS LOG CONPOSE:</span>
                    <span className="text-red-500 font-bold">{selectedJob.status.toUpperCase()}</span>
                  </div>
                  {selectedJob.last_error ? (
                    <div className="bg-red-950/10 border border-red-900/30 text-red-400 p-2.5 rounded font-mono italic text-[10.5px]">
                      "{selectedJob.last_error}"
                    </div>
                  ) : (
                    <span className="text-neutral-450 italic">No task compilation error reported. Core delivery process state optimal.</span>
                  )}
                </div>
              )}

            </div>

            {/* Timelines events table (6 columns) */}
            <div className="lg:col-span-6 bg-[#0b0b0d] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
              
              <div>
                <div className="pb-3 border-b border-neutral-850 mb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">delivery records timeline events</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">Durable audit transactions receipts</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">[email_events]</span>
                </div>

                <div className="divide-y divide-neutral-850 max-h-[460px] overflow-y-auto custom-scrollbar">
                  {emailEvents.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500 font-mono text-xs">No delivery receipts logged yet. Trigger daemons stream!</div>
                  ) : (
                    emailEvents.map(evt => (
                      <div key={evt.id} className="p-3 text-left font-mono text-[10.5px] flex justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-white uppercase truncate">{evt.id}</span>
                            <span className="text-[8px] bg-neutral-900 text-neutral-400 border border-neutral-850 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                              {evt.provider}
                            </span>
                          </div>

                          <div className="text-neutral-350 truncate mt-1">
                            To: <span className="font-extrabold">{evt.email}</span>
                          </div>
                          <div className="text-[9.5px] text-neutral-500 mt-0.5 truncate uppercase">
                            template: <span className="text-orange-500">{evt.email_type}</span>
                          </div>
                          {evt.provider_message_id && (
                            <div className="text-[9px] text-neutral-600 truncate mt-1.5 opacity-80">
                              MSG_ID: {evt.provider_message_id}
                            </div>
                          )}
                          {evt.error_message && (
                            <div className="text-[9.5px] text-red-500 italic mt-1 leading-normal">
                              ✕ Error: {evt.error_message}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span 
                            className={`text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${
                              evt.status === "sent" 
                                ? "bg-green-950/10 text-green-400 border-green-900/30" 
                                : "bg-red-950/10 text-red-400 border-red-900/30"
                            }`}
                          >
                            {evt.status}
                          </span>
                          <span className="text-[8px] text-neutral-500 block mt-2">
                            {evt.sent_at ? new Date(evt.sent_at).toLocaleTimeString() : new Date(evt.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
