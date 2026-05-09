import { useState, useEffect, useRef } from "react";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const STAGES = [
  { id: "new",       label: "Neu",         color: "#6366f1" },
  { id: "screening", label: "Vorauswahl",  color: "#f59e0b" },
  { id: "interview", label: "Interview",   color: "#3b82f6" },
  { id: "offer",     label: "Angebot",     color: "#10b981" },
  { id: "hired",     label: "Eingestellt", color: "#22c55e" },
  { id: "rejected",  label: "Abgelehnt",   color: "#ef4444" },
];

const EMAIL_TEMPLATES = [
  { id: "eingang",    label: "Eingangsbestätigung",  subject: "Ihre Bewerbung ist eingegangen – {{job}}", body: "Sehr geehrte/r {{name}},\n\nvielen Dank für Ihre Bewerbung auf die Stelle als {{job}}.\n\nWir haben Ihre Unterlagen erhalten und melden uns innerhalb von 5–7 Werktagen.\n\nMit freundlichen Grüßen\nIhr Recruiting-Team" },
  { id: "interview",  label: "Interview-Einladung",  subject: "Einladung zum Vorstellungsgespräch – {{job}}", body: "Sehr geehrte/r {{name}},\n\nwir freuen uns, Sie zu einem Vorstellungsgespräch für die Stelle als {{job}} einzuladen.\n\nBitte teilen Sie uns Ihre Verfügbarkeit für die kommende Woche mit.\n\nMit freundlichen Grüßen\nIhr Recruiting-Team" },
  { id: "absage",     label: "Absage",               subject: "Ihre Bewerbung als {{job}}", body: "Sehr geehrte/r {{name}},\n\nvielen Dank für Ihre Bewerbung als {{job}}. Nach sorgfältiger Prüfung haben wir uns für einen anderen Kandidaten entschieden.\n\nWir wünschen Ihnen alles Gute.\n\nMit freundlichen Grüßen\nIhr Recruiting-Team" },
  { id: "angebot",    label: "Angebot",              subject: "Stellenangebot – {{job}}", body: "Sehr geehrte/r {{name}},\n\nwir freuen uns, Ihnen ein Angebot für die Stelle als {{job}} zu unterbreiten. Bitte melden Sie sich bis Ende der Woche.\n\nMit freundlichen Grüßen\nIhr Recruiting-Team" },
  { id: "unterlagen", label: "Unterlagen anfordern", subject: "Unterlagen erbeten – {{job}}", body: "Sehr geehrte/r {{name}},\n\nfür Ihre Bewerbung als {{job}} benötigen wir noch: Lebenslauf, Zeugnisse, Zertifikate.\n\nBitte senden Sie diese als Antwort auf diese E-Mail.\n\nMit freundlichen Grüßen\nIhr Recruiting-Team" },
];

// Initial global state stored in memory (simulates a backend)
const INITIAL_CLIENTS = [
  { id: "admin",    name: "Admin",              role: "admin",  password: "admin123",   color: "#6366f1", company: "Meine Recruiting-Agentur" },
  { id: "c1",       name: "TechVentures GmbH",  role: "client", password: "kunde1",     color: "#10b981", company: "TechVentures GmbH" },
  { id: "c2",       name: "HealthPlus AG",       role: "client", password: "kunde2",     color: "#f59e0b", company: "HealthPlus AG" },
  { id: "c3",       name: "RetailGroup KG",      role: "client", password: "kunde3",     color: "#3b82f6", company: "RetailGroup KG" },
];

const INITIAL_JOBS = {
  c1: [
    { id: "j1", title: "Senior Frontend Developer", department: "Tech",      location: "Berlin (Remote)" },
    { id: "j2", title: "DevOps Engineer",            department: "Tech",      location: "München"         },
  ],
  c2: [
    { id: "j3", title: "Medizinische Fachangestellte", department: "Klinik",   location: "Hamburg"         },
    { id: "j4", title: "Pflegefachkraft",               department: "Pflege",   location: "Köln"            },
  ],
  c3: [
    { id: "j5", title: "Store Manager",  department: "Retail", location: "Frankfurt" },
  ],
};

const INITIAL_APPLICANTS = {
  c1: [
    { id: "a1", name: "Laura Schreiber", email: "l.schreiber@email.de", phone: "+49 151 1234567", jobId: "j1", stage: "interview", rating: 4, skills: ["React","TypeScript","Node.js"], source: "LinkedIn",    appliedAt: "2025-04-28", notes: "5 Jahre Erfahrung, top Kommunikation", avatar: "LS" },
    { id: "a2", name: "Markus Heller",   email: "m.heller@email.de",   phone: "+49 172 9876543", jobId: "j1", stage: "screening", rating: 3, skills: ["Vue.js","CSS","Figma"],          source: "Stepstone",   appliedAt: "2025-05-01", notes: "Portfolio überdurchschnittlich",     avatar: "MH" },
    { id: "a3", name: "Felix Braun",     email: "f.braun@email.de",    phone: "+49 151 9988776", jobId: "j2", stage: "new",       rating: 2, skills: ["AWS","Docker","CI/CD"],          source: "Jobware",     appliedAt: "2025-05-02", notes: "",                                  avatar: "FB" },
  ],
  c2: [
    { id: "a4", name: "Sarah Köhler",    email: "s.koehler@email.de",  phone: "+49 160 4455667", jobId: "j3", stage: "offer",  rating: 5, skills: ["Patientenversorgung","EKG"],        source: "Empfehlung",  appliedAt: "2025-04-25", notes: "Sofort verfügbar",                  avatar: "SK" },
    { id: "a5", name: "Anna Weber",      email: "a.weber@email.de",    phone: "+49 155 6677889", jobId: "j4", stage: "hired", rating: 5, skills: ["Intensivpflege","Palliativ"],        source: "Stepstone",   appliedAt: "2025-04-20", notes: "Eingestellt ab 01.06.",              avatar: "AW" },
  ],
  c3: [
    { id: "a6", name: "Daniel Müller",   email: "d.mueller@email.de",  phone: "+49 176 2233445", jobId: "j5", stage: "new",    rating: 2, skills: ["Retail","Führung","CRM"],           source: "Indeed",      appliedAt: "2025-05-05", notes: "",                                  avatar: "DM" },
  ],
};

const INITIAL_EMAILS = { c1: [], c2: [], c3: [] };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const avatarColors = ["#6366f1","#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#14b8a6"];
function getColor(name) {
  let h = 0; for (let c of name) h = (h * 31 + c.charCodeAt(0)) % avatarColors.length; return avatarColors[h];
}
function applyTemplate(tpl, applicant, job) {
  return tpl.replace(/{{name}}/g, applicant?.name||"").replace(/{{job}}/g, job?.title||"");
}
function uid() { return Math.random().toString(36).slice(2,9); }

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Global state
  const [clients, setClients]         = useState(INITIAL_CLIENTS);
  const [allJobs, setAllJobs]         = useState(INITIAL_JOBS);
  const [allApplicants, setAllApplicants] = useState(INITIAL_APPLICANTS);
  const [allEmails, setAllEmails]     = useState(INITIAL_EMAILS);

  // Auth
  const [currentUser, setCurrentUser] = useState(null); // null = logged out
  const [loginId, setLoginId]         = useState("");
  const [loginPw, setLoginPw]         = useState("");
  const [loginError, setLoginError]   = useState("");

  // Navigation
  const [view, setView]               = useState("dashboard");
  const [adminTab, setAdminTab]       = useState("clients"); // clients | overview
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedEmail, setSelectedEmail]         = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);

  // Forms
  const [newApplicant, setNewApplicant] = useState({ name:"",email:"",phone:"",jobId:"",skills:"",source:"LinkedIn",notes:"" });
  const [newJob, setNewJob]             = useState({ title:"",department:"",location:"" });
  const [newClient, setNewClient]       = useState({ name:"",company:"",password:"",color:"#6366f1" });

  // Email compose
  const [emailModal, setEmailModal]       = useState(false);
  const [emailTo, setEmailTo]             = useState("");
  const [emailToName, setEmailToName]     = useState("");
  const [emailApplicantId, setEmailApplicantId] = useState(null);
  const [emailSubject, setEmailSubject]   = useState("");
  const [emailBody, setEmailBody]         = useState("");
  const [emailSending, setEmailSending]   = useState(false);
  const [emailAiLoading, setEmailAiLoading] = useState(false);

  // AI chat
  const [aiMessages, setAiMessages] = useState([{ role:"assistant", content:"Hallo! Ich bin dein KI-Recruiting-Assistent. Wie kann ich helfen?" }]);
  const [aiInput, setAiInput]       = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const aiEndRef = useRef(null);

  // ── Derived data for current client ──
  const cid        = currentUser?.id;
  const isAdmin    = currentUser?.role === "admin";
  const jobs       = isAdmin ? [] : (allJobs[cid] || []);
  const applicants = isAdmin ? [] : (allApplicants[cid] || []);
  const emails     = isAdmin ? [] : (allEmails[cid] || []);

  const enriched = applicants.map(a => ({
    ...a,
    job: jobs.find(j => j.id === a.jobId),
    stageInfo: STAGES.find(s => s.id === a.stage),
  }));
  const filtered = enriched.filter(a => {
    const mJob    = selectedJob ? a.jobId === selectedJob.id : true;
    const mSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const mStage  = filterStage === "all" || a.stage === filterStage;
    return mJob && mSearch && mStage;
  });
  const stats = {
    total: applicants.length,
    active: applicants.filter(a => !["hired","rejected"].includes(a.stage)).length,
    hired:  applicants.filter(a => a.stage === "hired").length,
    interviews: applicants.filter(a => a.stage === "interview").length,
    emails: emails.length,
  };

  // ── Notifications ──
  function notify(msg, type="success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  // ── Auth ──
  function login() {
    setLoginError("");
    const user = clients.find(c => (c.id === loginId.trim() || c.name.toLowerCase() === loginId.trim().toLowerCase()) && c.password === loginPw);
    if (user) {
      setCurrentUser(user);
      setView("dashboard");
      setLoginId(""); setLoginPw("");
    } else {
      setLoginError("Benutzername oder Passwort falsch.");
    }
  }
  function logout() {
    setCurrentUser(null);
    setView("dashboard");
    setSelectedJob(null);
    setSelectedApplicant(null);
    setSelectedEmail(null);
    setAiMessages([{ role:"assistant", content:"Hallo! Ich bin dein KI-Recruiting-Assistent. Wie kann ich helfen?" }]);
  }

  // ── Client CRUD (admin) ──
  function addClient() {
    if (!newClient.name || !newClient.password) return;
    const id = "c" + uid();
    const c  = { id, role:"client", ...newClient };
    setClients(prev => [...prev, c]);
    setAllJobs(prev => ({ ...prev, [id]: [] }));
    setAllApplicants(prev => ({ ...prev, [id]: [] }));
    setAllEmails(prev => ({ ...prev, [id]: [] }));
    setNewClient({ name:"", company:"", password:"", color:"#6366f1" });
    notify("Kunde angelegt ✓");
  }
  function deleteClient(id) {
    if (id === "admin") return;
    setClients(prev => prev.filter(c => c.id !== id));
    setAllJobs(prev => { const n={...prev}; delete n[id]; return n; });
    setAllApplicants(prev => { const n={...prev}; delete n[id]; return n; });
    setAllEmails(prev => { const n={...prev}; delete n[id]; return n; });
    notify("Kunde gelöscht", "info");
  }
  function loginAsClient(client) {
    setCurrentUser(client);
    setView("dashboard");
  }

  // ── Jobs ──
  function addJob() {
    if (!newJob.title) return;
    const j = { id: "j"+uid(), ...newJob };
    setAllJobs(prev => ({ ...prev, [cid]: [...(prev[cid]||[]), j] }));
    setNewJob({ title:"",department:"",location:"" });
    setView("dashboard");
    notify("Stelle angelegt ✓");
  }

  // ── Applicants ──
  function addApplicant() {
    if (!newApplicant.name || !newApplicant.email || !newApplicant.jobId) return;
    const a = {
      id: "a"+uid(),
      ...newApplicant,
      skills: newApplicant.skills.split(",").map(s=>s.trim()).filter(Boolean),
      stage:"new", rating:0,
      appliedAt: new Date().toISOString().split("T")[0],
      avatar: newApplicant.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
    };
    setAllApplicants(prev => ({ ...prev, [cid]: [a, ...(prev[cid]||[])] }));
    setNewApplicant({ name:"",email:"",phone:"",jobId:"",skills:"",source:"LinkedIn",notes:"" });
    setView("list");
    notify("Bewerber hinzugefügt ✓");
  }
  function moveApplicant(id, stage) {
    setAllApplicants(prev => ({ ...prev, [cid]: (prev[cid]||[]).map(a => a.id===id?{...a,stage}:a) }));
    notify("Status aktualisiert");
  }
  function updateNotes(id, notes) {
    setAllApplicants(prev => ({ ...prev, [cid]: (prev[cid]||[]).map(a => a.id===id?{...a,notes}:a) }));
  }
  function updateRating(id, rating) {
    setAllApplicants(prev => ({ ...prev, [cid]: (prev[cid]||[]).map(a => a.id===id?{...a,rating}:a) }));
  }
  function deleteApplicant(id) {
    setAllApplicants(prev => ({ ...prev, [cid]: (prev[cid]||[]).filter(a => a.id!==id) }));
    setView("list"); notify("Bewerber entfernt","info");
  }

  // ── Email ──
  function openCompose(applicant) {
    setEmailTo(applicant?.email||"");
    setEmailToName(applicant?.name||"");
    setEmailApplicantId(applicant?.id||null);
    setEmailSubject(""); setEmailBody("");
    setEmailModal(true);
  }
  function applyTpl(tplId) {
    const tpl = EMAIL_TEMPLATES.find(t=>t.id===tplId); if(!tpl) return;
    const a = applicants.find(x=>x.id===emailApplicantId);
    const j = a ? jobs.find(j=>j.id===a.jobId) : null;
    setEmailSubject(applyTemplate(tpl.subject,a,j));
    setEmailBody(applyTemplate(tpl.body,a,j));
  }
  async function generateAiEmail() {
    if (!emailApplicantId) return;
    const a = applicants.find(x=>x.id===emailApplicantId);
    const j = a ? jobs.find(j=>j.id===a.jobId) : null;
    setEmailAiLoading(true);
    const prompt = `Schreibe eine professionelle Recruiting-E-Mail auf Deutsch an ${a?.name} für die Stelle "${j?.title}". Status: ${STAGES.find(s=>s.id===a?.stage)?.label}. Notizen: ${a?.notes||"keine"}. Nur der E-Mail-Text ab der Anrede.`;
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{ method:"POST",headers:{"Content-Type":"application/json"}, body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]}) });
      const data = await res.json();
      setEmailBody(data.content?.map(c=>c.text||"").join("").trim()||"");
    } catch { setEmailBody("Fehler beim Generieren."); }
    setEmailAiLoading(false);
  }
  function sendEmail() {
    if (!emailTo||!emailSubject||!emailBody) return;
    setEmailSending(true);
    setTimeout(()=>{
      const mail = { id:"m"+uid(), to:emailTo, toName:emailToName, subject:emailSubject, body:emailBody, sentAt:new Date().toLocaleString("de-DE"), applicantId:emailApplicantId };
      setAllEmails(prev=>({ ...prev,[cid]:[mail,...(prev[cid]||[])] }));
      setEmailModal(false); setEmailSending(false);
      notify("E-Mail gespeichert ✓");
    },800);
  }

  // ── AI Chat ──
  async function sendAiMessage() {
    if (!aiInput.trim()||aiLoading) return;
    const msg = aiInput.trim(); setAiInput("");
    setAiMessages(prev=>[...prev,{role:"user",content:msg}]);
    setAiLoading(true);
    const ctx = `Du bist Recruiting-Assistent für ${currentUser?.company||"eine Agentur"}. ${applicants.length} Bewerber, ${jobs.length} Stellen. Antworte auf Deutsch.`;
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:ctx,messages:[...aiMessages.slice(-6).map(m=>({role:m.role,content:m.content})),{role:"user",content:msg}]})});
      const data = await res.json();
      setAiMessages(prev=>[...prev,{role:"assistant",content:data.content?.map(c=>c.text||"").join("")||"Keine Antwort."}]);
    } catch { setAiMessages(prev=>[...prev,{role:"assistant",content:"Verbindungsfehler."}]); }
    setAiLoading(false);
  }
  useEffect(()=>{ aiEndRef.current?.scrollIntoView({behavior:"smooth"}); },[aiMessages]);

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    app:     { display:"flex", height:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'DM Sans','Segoe UI',sans-serif", overflow:"hidden" },
    sidebar: { width:sidebarOpen?240:64, background:"#161b27", borderRight:"1px solid #1e2535", display:"flex", flexDirection:"column", transition:"width 0.3s", overflow:"hidden", flexShrink:0 },
    navItem: (a)=>({ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, cursor:"pointer", marginBottom:2, background:a?"rgba(99,102,241,0.15)":"transparent", color:a?"#818cf8":"#94a3b8", border:a?"1px solid rgba(99,102,241,0.2)":"1px solid transparent", transition:"all 0.15s", fontSize:14, fontWeight:a?600:400, whiteSpace:"nowrap" }),
    navTxt:  { opacity:sidebarOpen?1:0, transition:"opacity 0.2s" },
    card:    { background:"#161b27", border:"1px solid #1e2535", borderRadius:12, padding:20 },
    btn:     (v="primary")=>({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:v==="primary"?"#6366f1":v==="danger"?"#ef4444":v==="success"?"#10b981":v==="ghost"?"transparent":"#1e2535", color:v==="ghost"?"#94a3b8":"#fff", transition:"all 0.15s", display:"inline-flex", alignItems:"center", gap:6, flexShrink:0 }),
    input:   { background:"#0f1117", border:"1px solid #1e2535", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
    badge:   (c)=>({ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:c+"22", color:c, border:`1px solid ${c}44` }),
    tag:     { display:"inline-block", padding:"2px 8px", borderRadius:6, fontSize:11, background:"#1e2535", color:"#94a3b8", marginRight:4, marginBottom:4 },
    avatar:  (nm)=>({ width:36, height:36, borderRadius:"50%", background:getColor(nm), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }),
    overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" },
    modal:   { background:"#161b27", border:"1px solid #1e2535", borderRadius:16, padding:28, width:"100%", maxWidth:640, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" },
  };

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ minHeight:"100vh", background:"#0f1117", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🎯</div>
            <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#e2e8f0" }}>TalentBoard</h1>
            <p style={{ color:"#64748b", margin:"6px 0 0", fontSize:14 }}>Recruiting Suite · Anmelden</p>
          </div>

          {/* Login card */}
          <div style={{ background:"#161b27", border:"1px solid #1e2535", borderRadius:16, padding:32 }}>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Benutzername / Kunden-ID</label>
              <input style={S.input} placeholder="z. B. admin oder c1" value={loginId} onChange={e=>setLoginId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Passwort</label>
              <input style={S.input} type="password" placeholder="••••••••" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
            </div>
            {loginError && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#f87171", marginBottom:16 }}>{loginError}</div>}
            <button style={{ ...S.btn("primary"), width:"100%", justifyContent:"center", padding:"12px 0", fontSize:15 }} onClick={login}>Anmelden →</button>

            {/* Demo hint */}
            <div style={{ marginTop:24, padding:16, background:"#0f1117", borderRadius:10, border:"1px solid #1e2535" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#64748b", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>Demo-Zugänge</div>
              {[
                { id:"admin",  pw:"admin123", role:"🔧 Admin"  },
                { id:"c1",     pw:"kunde1",   role:"🏢 TechVentures GmbH" },
                { id:"c2",     pw:"kunde2",   role:"🏥 HealthPlus AG"     },
                { id:"c3",     pw:"kunde3",   role:"🛍️ RetailGroup KG"    },
              ].map(d=>(
                <div key={d.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:12, color:"#94a3b8" }}>{d.role}</div>
                  <div style={{ display:"flex", gap:6" }}>
                    <code style={{ fontSize:11, background:"#161b27", padding:"2px 7px", borderRadius:5, color:"#818cf8" }}>{d.id}</code>
                    <code style={{ fontSize:11, background:"#161b27", padding:"2px 7px", borderRadius:5, color:"#64748b" }}>{d.pw}</code>
                    <button style={{ ...S.btn("secondary"), fontSize:11, padding:"2px 8px" }} onClick={()=>{ setLoginId(d.id); setLoginPw(d.pw); }}>Einfügen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADMIN SCREEN ─────────────────────────────────────────────────────────────
  if (isAdmin) {
    const allAppCount = Object.values(allApplicants).flat().length;
    const allHiredCount = Object.values(allApplicants).flat().filter(a=>a.stage==="hired").length;
    const realClients = clients.filter(c=>c.role==="client");

    return (
      <div style={{ ...S.app, flexDirection:"column" }}>
        {/* Admin topbar */}
        <div style={{ height:60, background:"#161b27", borderBottom:"1px solid #1e2535", display:"flex", alignItems:"center", padding:"0 28px", gap:16, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🎯</div>
            <div>
              <span style={{ fontWeight:700, fontSize:15 }}>TalentBoard</span>
              <span style={{ marginLeft:10, fontSize:12, background:"rgba(99,102,241,0.15)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.3)", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>Admin</span>
            </div>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:"flex", gap:8 }}>
            {[{ id:"clients",label:"👥 Kunden"}, {id:"overview",label:"📊 Übersicht"}].map(t=>(
              <button key={t.id} style={{ ...S.btn(adminTab===t.id?"primary":"secondary"), fontSize:13 }} onClick={()=>setAdminTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div style={{ width:1, height:28, background:"#1e2535" }} />
          <button style={S.btn("secondary")} onClick={logout}>Abmelden</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          {adminTab === "overview" && (
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 20px" }}>📊 Gesamtübersicht</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
                {[
                  { label:"Kunden",         value:realClients.length,                                         color:"#6366f1", icon:"🏢" },
                  { label:"Bewerber gesamt",value:allAppCount,                                                color:"#3b82f6", icon:"👥" },
                  { label:"Eingestellt",    value:allHiredCount,                                              color:"#10b981", icon:"✅" },
                  { label:"E-Mails gesamt", value:Object.values(allEmails).flat().length,                    color:"#8b5cf6", icon:"✉"  },
                ].map(s=>(
                  <div key={s.label} style={{ ...S.card, padding:18 }}>
                    <div style={{ fontSize:22 }}>{s.icon}</div>
                    <div style={{ fontSize:28, fontWeight:800, color:s.color, marginTop:4 }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card }}>
                <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:600 }}>Kunden & Aktivität</h3>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                  <thead>
                    <tr style={{ background:"#0f1117" }}>
                      {["Kunde","Unternehmen","Stellen","Bewerber","Eingestellt","E-Mails","Aktion"].map(h=>(
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {realClients.map(c=>(
                      <tr key={c.id} style={{ borderTop:"1px solid #1e2535" }}>
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:10, height:10, borderRadius:"50%", background:c.color, flexShrink:0 }} />
                            <span style={{ fontWeight:600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px", color:"#94a3b8" }}>{c.company}</td>
                        <td style={{ padding:"12px 14px", color:"#94a3b8" }}>{(allJobs[c.id]||[]).length}</td>
                        <td style={{ padding:"12px 14px" }}><span style={S.badge("#6366f1")}>{(allApplicants[c.id]||[]).length}</span></td>
                        <td style={{ padding:"12px 14px" }}><span style={S.badge("#10b981")}>{(allApplicants[c.id]||[]).filter(a=>a.stage==="hired").length}</span></td>
                        <td style={{ padding:"12px 14px", color:"#94a3b8" }}>{(allEmails[c.id]||[]).length}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex", gap:6 }}>
                            <button style={{ ...S.btn("primary"), fontSize:12, padding:"5px 10px" }} onClick={()=>loginAsClient(c)}>Als Kunde ansehen</button>
                            <button style={{ ...S.btn("danger"), fontSize:12, padding:"5px 10px" }} onClick={()=>deleteClient(c.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === "clients" && (
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 20px" }}>👥 Kundenverwaltung</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {/* Add client */}
                <div style={S.card}>
                  <h3 style={{ margin:"0 0 18px", fontSize:15, fontWeight:600 }}>Neuen Kunden anlegen</h3>
                  {[
                    { label:"Ansprechpartner / Anzeigename *", key:"name",    ph:"z. B. Max Mustermann" },
                    { label:"Unternehmen",                     key:"company", ph:"Firmenname GmbH" },
                    { label:"Passwort *",                      key:"password",ph:"Sicheres Passwort" },
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:12 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>{f.label}</label>
                      <input style={S.input} placeholder={f.ph} type={f.key==="password"?"password":"text"} value={newClient[f.key]} onChange={e=>setNewClient(p=>({...p,[f.key]:e.target.value}))} />
                    </div>
                  ))}
                  <div style={{ marginBottom:18 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:8 }}>Kundenfarbe</label>
                    <div style={{ display:"flex", gap:8 }}>
                      {["#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899","#ef4444","#8b5cf6","#14b8a6"].map(col=>(
                        <div key={col} onClick={()=>setNewClient(p=>({...p,color:col}))}
                          style={{ width:28, height:28, borderRadius:"50%", background:col, cursor:"pointer", border: newClient.color===col?"3px solid #fff":"3px solid transparent", transition:"border 0.15s" }} />
                      ))}
                    </div>
                  </div>
                  <button style={{ ...S.btn("primary"), padding:"10px 20px" }} onClick={addClient}>Kunde anlegen</button>
                </div>

                {/* Client list */}
                <div style={S.card}>
                  <h3 style={{ margin:"0 0 18px", fontSize:15, fontWeight:600 }}>Bestehende Kunden</h3>
                  {realClients.map(c=>(
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #1e2535" }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:c.color+"22", border:`1px solid ${c.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏢</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14 }}>{c.name}</div>
                        <div style={{ fontSize:12, color:"#64748b" }}>{c.company} · ID: <code style={{ background:"#0f1117", padding:"1px 5px", borderRadius:4, fontSize:11, color:"#818cf8" }}>{c.id}</code></div>
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        <button style={{ ...S.btn("secondary"), fontSize:12, padding:"5px 10px" }} onClick={()=>loginAsClient(c)}>Öffnen</button>
                        <button style={{ ...S.btn("danger"), fontSize:12, padding:"5px 10px" }} onClick={()=>deleteClient(c.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {realClients.length===0 && <div style={{ color:"#475569", fontSize:14, textAlign:"center", padding:"20px 0" }}>Noch keine Kunden angelegt.</div>}
                </div>
              </div>

              {/* Login info box */}
              <div style={{ ...S.card, marginTop:20, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ fontSize:24 }}>💡</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>So teilst du Zugänge mit Kunden</div>
                    <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>
                      Teile jedem Kunden seine <strong style={{ color:"#818cf8" }}>Kunden-ID</strong> und sein <strong style={{ color:"#818cf8" }}>Passwort</strong> mit — zum Beispiel per E-Mail. Der Kunde öffnet die App-URL, gibt seine Zugangsdaten ein und sieht <strong>ausschließlich seine eigenen Bewerber</strong> und Stellen. Andere Kundendaten sind vollständig getrennt.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && <div style={{ position:"fixed", top:20, right:20, background:"#10b981", color:"#fff", padding:"10px 20px", borderRadius:10, zIndex:300, fontSize:14, fontWeight:600 }}>{notification.msg}</div>}
      </div>
    );
  }

  // ─── CLIENT SCREEN ────────────────────────────────────────────────────────────

  const navItems = [
    { id:"dashboard", icon:"⬡", label:"Dashboard"     },
    { id:"kanban",    icon:"⊞", label:"Pipeline"       },
    { id:"list",      icon:"≡", label:"Bewerber"       },
    { id:"emails",    icon:"✉", label:"E-Mails", badge:emails.length },
    { id:"aiAssist",  icon:"✦", label:"KI-Assistent"  },
  ];

  return (
    <div style={S.app}>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{ padding:sidebarOpen?"24px 20px 20px":"24px 12px 20px", borderBottom:"1px solid #1e2535" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>setSidebarOpen(o=>!o)}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🎯</div>
            <div style={{ opacity:sidebarOpen?1:0, transition:"opacity 0.2s" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", whiteSpace:"nowrap" }}>TalentBoard</div>
              <div style={{ fontSize:10, color:"#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:140 }}>{currentUser.company||currentUser.name}</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"14px 10px", flex:1, overflowY:"auto" }}>
          <div style={{ fontSize:10, fontWeight:600, color:"#475569", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 10px 8px", opacity:sidebarOpen?1:0 }}>Navigation</div>
          {navItems.map(item=>(
            <div key={item.id} style={S.navItem(view===item.id)} onClick={()=>setView(item.id)}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <span style={S.navTxt}>{item.label}</span>
              {item.badge>0 && <span style={{ ...S.navTxt, marginLeft:"auto", background:"#6366f1", color:"#fff", borderRadius:10, fontSize:10, padding:"1px 7px", fontWeight:700 }}>{item.badge}</span>}
            </div>
          ))}
          <div style={{ marginTop:14, borderTop:"1px solid #1e2535", paddingTop:14 }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#475569", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 10px 8px", opacity:sidebarOpen?1:0 }}>Stellen</div>
            {jobs.map(job=>(
              <div key={job.id} style={{ ...S.navItem(selectedJob?.id===job.id&&view==="list"), fontSize:12 }}
                onClick={()=>{ setSelectedJob(selectedJob?.id===job.id?null:job); setView("list"); }}>
                <span style={{ fontSize:14, flexShrink:0 }}>💼</span>
                <span style={{ ...S.navTxt, overflow:"hidden", textOverflow:"ellipsis" }}>{job.title}</span>
              </div>
            ))}
            <div style={{ ...S.navItem(view==="addJob"), fontSize:12, color:"#6366f1" }} onClick={()=>setView("addJob")}>
              <span style={{ fontSize:16, flexShrink:0 }}>+</span>
              <span style={S.navTxt}>Stelle anlegen</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <div style={{ height:60, background:"#161b27", borderBottom:"1px solid #1e2535", display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#475569" }}>🔍</span>
            <input style={{ ...S.input, paddingLeft:34 }} placeholder="Bewerber suchen…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          {selectedJob && <div style={S.badge("#6366f1")}>{selectedJob.title}<span style={{ marginLeft:6, cursor:"pointer" }} onClick={()=>setSelectedJob(null)}>×</span></div>}
          <div style={{ flex:1 }} />
          <button style={S.btn("secondary")} onClick={()=>openCompose(null)}>✉ Verfassen</button>
          <button style={S.btn("primary")} onClick={()=>setView("addApplicant")}>+ Bewerber</button>
          {/* User badge */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:"#0f1117", border:"1px solid #1e2535", borderRadius:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:currentUser.color||"#6366f1" }} />
            <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{currentUser.name}</span>
            <span style={{ fontSize:11, color:"#475569", cursor:"pointer", marginLeft:4 }} onClick={logout}>Abmelden</span>
          </div>
        </div>

        {/* Notification */}
        {notification && <div style={{ position:"fixed", top:20, right:20, background:"#10b981", color:"#fff", padding:"10px 20px", borderRadius:10, zIndex:300, fontSize:14, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>{notification.msg}</div>}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:24 }}>

          {/* DASHBOARD */}
          {view==="dashboard" && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Dashboard</h1>
                <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>{currentUser.company||currentUser.name} · Recruiting-Übersicht</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
                {[
                  { label:"Bewerber",   value:stats.total,      icon:"👥", color:"#6366f1" },
                  { label:"Aktiv",      value:stats.active,     icon:"🔄", color:"#f59e0b" },
                  { label:"Interviews", value:stats.interviews, icon:"🗣️", color:"#3b82f6" },
                  { label:"Eingestellt",value:stats.hired,      icon:"✅", color:"#10b981" },
                  { label:"E-Mails",    value:stats.emails,     icon:"✉",  color:"#8b5cf6" },
                ].map(s=>(
                  <div key={s.label} style={{ ...S.card, padding:16 }}>
                    <div style={{ fontSize:20 }}>{s.icon}</div>
                    <div style={{ fontSize:26, fontWeight:800, color:s.color, marginTop:4 }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                <div style={S.card}>
                  <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:600 }}>Offene Stellen</h3>
                  {jobs.length===0 && <div style={{ color:"#475569", fontSize:13 }}>Noch keine Stellen.</div>}
                  {jobs.map(job=>{
                    const cnt = applicants.filter(a=>a.jobId===job.id).length;
                    return (
                      <div key={job.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1e2535", cursor:"pointer" }}
                        onClick={()=>{ setSelectedJob(job); setView("kanban"); }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600 }}>{job.title}</div>
                          <div style={{ fontSize:11, color:"#64748b" }}>{job.department} · {job.location}</div>
                        </div>
                        <div style={S.badge("#6366f1")}>{cnt}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={S.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <h3 style={{ margin:0, fontSize:14, fontWeight:600 }}>Letzte E-Mails</h3>
                    <button style={{ ...S.btn("ghost"), fontSize:12, padding:"4px 8px" }} onClick={()=>setView("emails")}>Alle →</button>
                  </div>
                  {emails.length===0 && <div style={{ color:"#475569", fontSize:13 }}>Noch keine E-Mails.</div>}
                  {emails.slice(0,4).map(mail=>(
                    <div key={mail.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #1e2535", cursor:"pointer" }}
                      onClick={()=>{ setSelectedEmail(mail); setView("emails"); }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:"#1e2535", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>✉</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{mail.toName}</div>
                        <div style={{ fontSize:11, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{mail.subject}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.card}>
                <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:600 }}>Pipeline Übersicht</h3>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {STAGES.map(stage=>{
                    const cnt = applicants.filter(a=>a.stage===stage.id).length;
                    const pct = applicants.length?Math.round((cnt/applicants.length)*100):0;
                    return (
                      <div key={stage.id} style={{ flex:"1 1 100px", background:"#0f1117", borderRadius:10, padding:12, border:`1px solid ${stage.color}33` }}>
                        <div style={{ fontSize:11, color:"#64748b", marginBottom:3 }}>{stage.label}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:stage.color }}>{cnt}</div>
                        <div style={{ height:3, background:"#1e2535", borderRadius:2, marginTop:8 }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:stage.color, borderRadius:2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* KANBAN */}
          {view==="kanban" && (
            <div>
              <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Pipeline</h1>
                {selectedJob && <div style={S.badge("#6366f1")}>{selectedJob.title}</div>}
              </div>
              <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:16 }}>
                {STAGES.map(stage=>{
                  const cards = filtered.filter(a=>a.stage===stage.id);
                  return (
                    <div key={stage.id} style={{ minWidth:210, flexShrink:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"8px 12px", background:stage.color+"15", borderRadius:8, border:`1px solid ${stage.color}30` }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:stage.color }} />
                        <span style={{ fontSize:13, fontWeight:600, color:stage.color }}>{stage.label}</span>
                        <span style={{ marginLeft:"auto", fontSize:12, color:"#64748b" }}>{cards.length}</span>
                      </div>
                      {cards.map(a=>(
                        <div key={a.id} style={{ background:"#161b27", border:"1px solid #1e2535", borderRadius:10, padding:14, marginBottom:8, cursor:"pointer" }}
                          onClick={()=>{ setSelectedApplicant(a); setView("detail"); }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=stage.color+"66"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="#1e2535"}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                            <div style={S.avatar(a.name)}>{a.avatar}</div>
                            <div><div style={{ fontSize:13, fontWeight:600 }}>{a.name}</div><div style={{ fontSize:11, color:"#64748b" }}>{a.job?.title}</div></div>
                          </div>
                          <div>{(a.skills||[]).slice(0,3).map(s=><span key={s} style={S.tag}>{s}</span>)}</div>
                          {a.rating>0 && <div style={{ marginTop:6, fontSize:11 }}>{"⭐".repeat(a.rating)}</div>}
                          <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontSize:10, color:"#475569" }}>{a.source}</span>
                            <button style={{ ...S.btn("secondary"), padding:"3px 8px", fontSize:11 }} onClick={e=>{e.stopPropagation();openCompose(a);}}>✉</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIST */}
          {view==="list" && (
            <div>
              <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <h1 style={{ fontSize:22, fontWeight:700, margin:0, flex:1 }}>Bewerber</h1>
                <select style={{ ...S.input, width:"auto" }} value={filterStage} onChange={e=>setFilterStage(e.target.value)}>
                  <option value="all">Alle Status</option>
                  {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                  <thead>
                    <tr style={{ background:"#0f1117" }}>
                      {["Bewerber","Stelle","Status","Bewertung","Quelle","Datum","Aktion"].map(h=>(
                        <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a=>(
                      <tr key={a.id} style={{ borderTop:"1px solid #1e2535", cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#1e2535"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        onClick={()=>{ setSelectedApplicant(a); setView("detail"); }}>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={S.avatar(a.name)}>{a.avatar}</div>
                            <div><div style={{ fontWeight:600 }}>{a.name}</div><div style={{ fontSize:12, color:"#64748b" }}>{a.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding:"11px 14px", color:"#94a3b8", fontSize:13 }}>{a.job?.title||"—"}</td>
                        <td style={{ padding:"11px 14px" }}><span style={S.badge(a.stageInfo?.color||"#666")}>{a.stageInfo?.label}</span></td>
                        <td style={{ padding:"11px 14px", fontSize:12 }}>{a.rating>0?"⭐".repeat(a.rating):"—"}</td>
                        <td style={{ padding:"11px 14px", color:"#94a3b8", fontSize:13 }}>{a.source}</td>
                        <td style={{ padding:"11px 14px", color:"#64748b", fontSize:12 }}>{a.appliedAt}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                            <select style={{ ...S.input, width:"auto", fontSize:12, padding:"4px 8px" }} value={a.stage} onChange={e=>moveApplicant(a.id,e.target.value)}>
                              {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            <button style={{ ...S.btn("secondary"), padding:"4px 10px", fontSize:12 }} onClick={()=>openCompose(a)}>✉</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length===0&&<div style={{ padding:40, textAlign:"center", color:"#475569" }}>Keine Bewerber gefunden.</div>}
              </div>
            </div>
          )}

          {/* DETAIL */}
          {view==="detail" && selectedApplicant && (()=>{
            const appEmails = emails.filter(m=>m.applicantId===selectedApplicant.id);
            return (
              <div>
                <button style={S.btn("secondary")} onClick={()=>setView("list")}>← Zurück</button>
                <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 290px", gap:16 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <div style={S.card}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                        <div style={{ width:54, height:54, borderRadius:"50%", background:getColor(selectedApplicant.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>{selectedApplicant.avatar}</div>
                        <div style={{ flex:1 }}>
                          <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{selectedApplicant.name}</h2>
                          <div style={{ color:"#64748b", fontSize:13 }}>{selectedApplicant.email} · {selectedApplicant.phone}</div>
                        </div>
                        <button style={S.btn("primary")} onClick={()=>openCompose(selectedApplicant)}>✉ E-Mail</button>
                        <button style={S.btn("danger")} onClick={()=>deleteApplicant(selectedApplicant.id)}>Löschen</button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
                        {[{l:"STELLE",v:selectedApplicant.job?.title||"—"},{l:"QUELLE",v:selectedApplicant.source},{l:"BEWORBEN AM",v:selectedApplicant.appliedAt}].map(f=>(
                          <div key={f.l} style={{ background:"#0f1117", borderRadius:8, padding:10 }}>
                            <div style={{ fontSize:10, color:"#64748b", marginBottom:3 }}>{f.l}</div>
                            <div style={{ fontSize:13, fontWeight:600 }}>{f.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:6, textTransform:"uppercase" }}>Status</label>
                        <select style={{ ...S.input, maxWidth:220, fontSize:13 }} value={selectedApplicant.stage}
                          onChange={e=>{ moveApplicant(selectedApplicant.id,e.target.value); setSelectedApplicant({...selectedApplicant,stage:e.target.value}); }}>
                          {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:6, textTransform:"uppercase" }}>Skills</label>
                        {(selectedApplicant.skills||[]).map(s=><span key={s} style={S.tag}>{s}</span>)}
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:6, textTransform:"uppercase" }}>Notizen</label>
                        <textarea style={{ ...S.input, minHeight:80, resize:"vertical" }} placeholder="Notizen…" defaultValue={selectedApplicant.notes} onBlur={e=>updateNotes(selectedApplicant.id,e.target.value)} />
                      </div>
                    </div>
                    <div style={S.card}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                        <h3 style={{ margin:0, fontSize:14, fontWeight:600 }}>✉ E-Mail Verlauf ({appEmails.length})</h3>
                        <button style={{ ...S.btn("primary"), fontSize:12, padding:"5px 12px" }} onClick={()=>openCompose(selectedApplicant)}>+ Neue E-Mail</button>
                      </div>
                      {appEmails.length===0
                        ? <div style={{ fontSize:13, color:"#475569", textAlign:"center", padding:"16px 0" }}>Noch keine E-Mails.</div>
                        : appEmails.map(mail=>(
                          <div key={mail.id} style={{ background:"#0f1117", borderRadius:10, padding:"12px 14px", marginBottom:8, border:"1px solid #1e2535" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                              <div style={{ fontSize:13, fontWeight:600 }}>{mail.subject}</div>
                              <div style={{ fontSize:11, color:"#475569" }}>{mail.sentAt}</div>
                            </div>
                            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{mail.body.slice(0,160)}{mail.body.length>160?"…":""}</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={S.card}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Bewertung</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3,4,5].map(r=>(
                          <div key={r} onClick={()=>{ updateRating(selectedApplicant.id,r); setSelectedApplicant({...selectedApplicant,rating:r}); }}
                            style={{ fontSize:20, cursor:"pointer", opacity:r<=selectedApplicant.rating?1:0.25, transition:"opacity 0.15s" }}>⭐</div>
                        ))}
                      </div>
                    </div>
                    <div style={S.card}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Pipeline</div>
                      {STAGES.map(stage=>(
                        <div key={stage.id} onClick={()=>{ moveApplicant(selectedApplicant.id,stage.id); setSelectedApplicant({...selectedApplicant,stage:stage.id}); }}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, marginBottom:3, cursor:"pointer", background:selectedApplicant.stage===stage.id?stage.color+"20":"transparent", border:selectedApplicant.stage===stage.id?`1px solid ${stage.color}44`:"1px solid transparent" }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:stage.color, flexShrink:0 }} />
                          <span style={{ fontSize:13, color:selectedApplicant.stage===stage.id?stage.color:"#94a3b8" }}>{stage.label}</span>
                        </div>
                      ))}
                    </div>
                    <button style={{ ...S.btn("primary"), justifyContent:"center", padding:12 }}
                      onClick={()=>{ setAiMessages(prev=>[...prev,{role:"user",content:`Analysiere Bewerber: ${selectedApplicant.name}, Stelle: ${selectedApplicant.job?.title}, Skills: ${(selectedApplicant.skills||[]).join(", ")}, Notizen: ${selectedApplicant.notes||"keine"}. Kurze Einschätzung + 3 Interviewfragen.`}]); setView("aiAssist"); }}>
                      ✦ KI-Analyse
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* EMAILS */}
          {view==="emails" && (
            <div style={{ display:"flex", gap:16, height:"calc(100vh - 140px)" }}>
              <div style={{ width:320, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>✉ E-Mails</h1>
                  <button style={S.btn("primary")} onClick={()=>openCompose(null)}>+ Verfassen</button>
                </div>
                <div style={{ ...S.card, padding:0, flex:1, overflowY:"auto" }}>
                  {emails.length===0&&<div style={{ padding:32, textAlign:"center", color:"#475569" }}>Noch keine E-Mails.</div>}
                  {emails.map(mail=>(
                    <div key={mail.id} style={{ padding:"14px 16px", borderBottom:"1px solid #1e2535", cursor:"pointer", background:selectedEmail?.id===mail.id?"rgba(99,102,241,0.08)":"transparent" }}
                      onClick={()=>setSelectedEmail(mail)}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{mail.toName||mail.to}</div>
                        <div style={{ fontSize:11, color:"#475569" }}>{mail.sentAt.split(",")[0]}</div>
                      </div>
                      <div style={{ fontSize:13, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{mail.subject}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex:1 }}>
                {!selectedEmail
                  ? <div style={{ ...S.card, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#475569" }}>
                      <div style={{ fontSize:48, opacity:0.3 }}>✉</div>
                      <div>E-Mail auswählen oder neu verfassen</div>
                      <button style={S.btn("primary")} onClick={()=>openCompose(null)}>+ Neue E-Mail</button>
                    </div>
                  : <div style={S.card}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, gap:12 }}>
                        <div>
                          <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>{selectedEmail.subject}</h2>
                          <div style={{ fontSize:13, color:"#64748b", marginTop:5 }}>An: <strong>{selectedEmail.toName}</strong> &lt;{selectedEmail.to}&gt;</div>
                          <div style={{ fontSize:12, color:"#475569", marginTop:3 }}>Gesendet: {selectedEmail.sentAt}</div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          {selectedEmail.applicantId && <button style={S.btn("secondary")} onClick={()=>{ const a=enriched.find(x=>x.id===selectedEmail.applicantId); if(a){setSelectedApplicant(a);setView("detail");} }}>Bewerber öffnen</button>}
                          <button style={S.btn("primary")} onClick={()=>{ const a=applicants.find(x=>x.id===selectedEmail.applicantId); openCompose(a||null); setEmailSubject("Re: "+selectedEmail.subject); }}>↩ Antworten</button>
                        </div>
                      </div>
                      <div style={{ background:"#0f1117", borderRadius:10, padding:20, fontSize:14, lineHeight:1.8, color:"#e2e8f0", whiteSpace:"pre-wrap", minHeight:200 }}>{selectedEmail.body}</div>
                    </div>
                }
              </div>
            </div>
          )}

          {/* ADD APPLICANT */}
          {view==="addApplicant" && (
            <div>
              <button style={S.btn("secondary")} onClick={()=>setView("list")}>← Zurück</button>
              <div style={{ ...S.card, maxWidth:520, marginTop:20 }}>
                <h2 style={{ margin:"0 0 18px", fontSize:18 }}>Neuen Bewerber anlegen</h2>
                {[{l:"Name *",k:"name",ph:"Max Mustermann"},{l:"E-Mail *",k:"email",ph:"max@email.de"},{l:"Telefon",k:"phone",ph:"+49 151 …"},{l:"Skills (kommagetrennt)",k:"skills",ph:"React, TypeScript, …"},{l:"Notizen",k:"notes",ph:"Interne Notizen…"}].map(f=>(
                  <div key={f.k} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>{f.l}</label>
                    <input style={S.input} placeholder={f.ph} value={newApplicant[f.k]} onChange={e=>setNewApplicant(p=>({...p,[f.k]:e.target.value}))} />
                  </div>
                ))}
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>Stelle *</label>
                  <select style={S.input} value={newApplicant.jobId} onChange={e=>setNewApplicant(p=>({...p,jobId:e.target.value}))}>
                    <option value="">Stelle wählen…</option>
                    {jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>Quelle</label>
                  <select style={S.input} value={newApplicant.source} onChange={e=>setNewApplicant(p=>({...p,source:e.target.value}))}>
                    {["LinkedIn","XING","Stepstone","Indeed","Empfehlung","Direktbewerbung","Jobware","Sonstige"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button style={{ ...S.btn("primary"), padding:"10px 24px" }} onClick={addApplicant}>Bewerber anlegen</button>
              </div>
            </div>
          )}

          {/* ADD JOB */}
          {view==="addJob" && (
            <div>
              <button style={S.btn("secondary")} onClick={()=>setView("dashboard")}>← Zurück</button>
              <div style={{ ...S.card, maxWidth:460, marginTop:20 }}>
                <h2 style={{ margin:"0 0 18px", fontSize:18 }}>Neue Stelle anlegen</h2>
                {[{l:"Stellentitel *",k:"title",ph:"Senior Frontend Developer"},{l:"Abteilung",k:"department",ph:"Tech, Marketing, …"},{l:"Standort",k:"location",ph:"Berlin, Remote, …"}].map(f=>(
                  <div key={f.k} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:5 }}>{f.l}</label>
                    <input style={S.input} placeholder={f.ph} value={newJob[f.k]} onChange={e=>setNewJob(p=>({...p,[f.k]:e.target.value}))} />
                  </div>
                ))}
                <button style={{ ...S.btn("primary"), padding:"10px 24px", marginTop:8 }} onClick={addJob}>Stelle anlegen</button>
              </div>
            </div>
          )}

          {/* AI ASSISTANT */}
          {view==="aiAssist" && (
            <div style={{ height:"100%", display:"flex", flexDirection:"column", maxHeight:"calc(100vh - 110px)" }}>
              <div style={{ marginBottom:14 }}>
                <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>✦ KI-Assistent</h1>
                <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>Analysiere Bewerber, generiere Interviewfragen & E-Mails</p>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                {["Erstelle 5 Interviewfragen für einen React Developer","Welche Bewerber priorisieren?","Schreibe eine Absagemail","Tipps zur Candidate Experience"].map(p=>(
                  <button key={p} style={{ ...S.btn("secondary"), fontSize:12 }} onClick={()=>setAiInput(p)}>{p}</button>
                ))}
              </div>
              <div style={{ flex:1, overflowY:"auto", background:"#0f1117", borderRadius:12, border:"1px solid #1e2535", padding:20, marginBottom:12, display:"flex", flexDirection:"column", gap:14 }}>
                {aiMessages.map((msg,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", flexDirection:msg.role==="user"?"row-reverse":"row" }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:msg.role==="user"?"#6366f1":"#1e2535", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{msg.role==="user"?"👤":"✦"}</div>
                    <div style={{ background:msg.role==="user"?"rgba(99,102,241,0.15)":"#161b27", border:`1px solid ${msg.role==="user"?"rgba(99,102,241,0.3)":"#1e2535"}`, borderRadius:12, padding:"10px 14px", maxWidth:"82%", fontSize:14, lineHeight:1.65, color:"#e2e8f0", whiteSpace:"pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {aiLoading && <div style={{ display:"flex", gap:10 }}><div style={{ width:30, height:30, borderRadius:"50%", background:"#1e2535", display:"flex", alignItems:"center", justifyContent:"center" }}>✦</div><div style={{ background:"#161b27", border:"1px solid #1e2535", borderRadius:12, padding:"10px 14px", color:"#64748b", fontSize:13 }}>Analysiere…</div></div>}
                <div ref={aiEndRef} />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <input style={{ ...S.input, flex:1 }} placeholder="Frage stellen…" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAiMessage()} />
                <button style={{ ...S.btn("primary"), padding:"10px 20px" }} onClick={sendAiMessage} disabled={aiLoading}>{aiLoading?"…":"Senden →"}</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* EMAIL COMPOSE MODAL */}
      {emailModal && (
        <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget)setEmailModal(false); }}>
          <div style={S.modal}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>✉ E-Mail verfassen</h2>
                {emailToName && <div style={{ fontSize:13, color:"#64748b", marginTop:3 }}>An: {emailToName}</div>}
              </div>
              <button style={{ ...S.btn("ghost"), fontSize:20, padding:"4px 8px" }} onClick={()=>setEmailModal(false)}>×</button>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.08em" }}>Vorlage</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {EMAIL_TEMPLATES.map(t=><button key={t.id} style={{ ...S.btn("secondary"), fontSize:12, padding:"5px 11px" }} onClick={()=>applyTpl(t.id)}>{t.label}</button>)}
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Empfänger</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <input style={S.input} placeholder="Name" value={emailToName} onChange={e=>setEmailToName(e.target.value)} />
                <input style={S.input} placeholder="E-Mail" value={emailTo} onChange={e=>setEmailTo(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Betreff</label>
              <input style={S.input} placeholder="Betreff…" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>Nachricht</label>
                <button style={{ ...S.btn(emailApplicantId?"primary":"secondary"), fontSize:12, padding:"5px 12px" }} onClick={generateAiEmail} disabled={emailAiLoading||!emailApplicantId}>
                  {emailAiLoading?"✦ Generiere…":"✦ KI-Entwurf"}
                </button>
              </div>
              {emailAiLoading
                ? <div style={{ background:"#0f1117", borderRadius:8, padding:20, fontSize:13, color:"#64748b", border:"1px solid #1e2535", minHeight:180, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>✦ KI formuliert E-Mail…</div>
                : <textarea style={{ ...S.input, minHeight:200, resize:"vertical", lineHeight:1.7 }} placeholder="E-Mail-Text…" value={emailBody} onChange={e=>setEmailBody(e.target.value)} />
              }
            </div>
            <div style={{ fontSize:12, color:"#475569", marginBottom:18, padding:"10px 14px", background:"#0f1117", borderRadius:8, border:"1px solid #1e2535" }}>
              💡 Demo-Modus: E-Mails werden im Postausgang gespeichert. Für echten Versand SMTP-Dienst (SendGrid / Mailgun) anbinden.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button style={S.btn("secondary")} onClick={()=>setEmailModal(false)}>Abbrechen</button>
              <button style={{ ...S.btn("primary"), padding:"10px 28px" }} onClick={sendEmail} disabled={emailSending||!emailTo||!emailSubject||!emailBody}>
                {emailSending?"Speichere…":"✉ E-Mail speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
