import { useState, useEffect, useRef, createContext, useContext } from "react";
import { supabase } from "./supabase";

/* ====== CONTEXT ====== */
const Ctx = createContext(null);

function Store({ children }) {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [oposiciones, setOposiciones] = useState([]);
  const [results, setResults] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState({ penaltyEnabled: false, penaltyValue: 0.33, penaltyMode: "fraction", reportEmail: "" });
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    async function load() {
      try {
        // Load users with their assigned oposiciones
        var { data: usersData } = await supabase.from("users").select("*");
        var { data: userOpos } = await supabase.from("user_oposiciones").select("*");
        var usersWithOpos = (usersData || []).map(function(u) {
          var opoIds = (userOpos || []).filter(function(uo) { return uo.user_id === u.id; }).map(function(uo) { return uo.opo_id; });
          return {
            id: u.id, username: u.username, password: u.password, role: u.role,
            name: u.name, email: u.email, createdAt: u.created_at,
            streak: u.streak || 0, lastStudyDate: u.last_study_date,
            assignedOpos: opoIds
          };
        });
        setUsers(usersWithOpos);

        // Load oposiciones
        var { data: oposData } = await supabase.from("oposiciones").select("*");
        var oposMapped = (oposData || []).map(function(o) {
          return { id: o.id, name: o.name, commonTopics: o.common_topics || [], specificTopics: o.specific_topics || [] };
        });
        setOposiciones(oposMapped);

        // Load questions
        var { data: qData } = await supabase.from("questions").select("*");
        var qMapped = (qData || []).map(function(q) {
          return { id: q.id, opoId: q.opo_id, topic: q.topic, type: q.type, text: q.text, options: q.options, correct: q.correct, justification: q.justification };
        });
        setQuestions(qMapped);

        // Load results
        var { data: resData } = await supabase.from("results").select("*");
        var resMapped = (resData || []).map(function(r) {
          return {
            id: r.id, userId: r.user_id, opoId: r.opo_id, date: r.date, score: r.score,
            correct: r.correct, incorrect: r.incorrect, blank: r.blank,
            doubtOk: r.doubt_ok, doubtFail: r.doubt_fail, doubtBlank: r.doubt_blank,
            totalQuestions: r.total_questions, timeSeconds: r.time_seconds,
            topics: r.topics || [], details: r.details || [],
            penaltyApplied: r.penalty_applied, penaltyValue: r.penalty_value
          };
        });
        setResults(resMapped);

        // Load bookmarks
        var { data: bmData } = await supabase.from("bookmarks").select("*");
        var bmMapped = (bmData || []).map(function(b) { return b.user_id + "_" + b.question_id; });
        setBookmarks(bmMapped);

        // Load reports
        var { data: repData } = await supabase.from("reports").select("*");
        var repMapped = (repData || []).map(function(r) {
          return { id: r.id, userId: r.user_id, questionId: r.question_id, reason: r.reason, date: r.date, resolved: r.resolved, resolvedAt: r.resolved_at };
        });
        setReports(repMapped);

        // Load settings
        var { data: setData } = await supabase.from("settings").select("*").eq("id", 1).single();
        if (setData) {
          setSettings({ penaltyEnabled: setData.penalty_enabled, penaltyValue: Number(setData.penalty_value), penaltyMode: setData.penalty_mode, reportEmail: setData.report_email || "" });
        }
      } catch(e) {
        console.error("Error loading data:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Wrapper functions that persist to Supabase
  async function updateUsers(newUsers) {
    setUsers(newUsers);
  }
  async function updateQuestions(newQuestions) {
    setQuestions(newQuestions);
  }
  async function updateOposiciones(newOpos) {
    setOposiciones(newOpos);
  }
  async function updateResults(newResults) {
    setResults(newResults);
  }
  async function updateBookmarks(newBm) {
    setBookmarks(newBm);
  }
  async function updateReports(newRep) {
    setReports(newRep);
  }
  async function updateSettings(newSet) {
    setSettings(newSet);
    await supabase.from("settings").update({
      penalty_enabled: newSet.penaltyEnabled,
      penalty_value: newSet.penaltyValue,
      penalty_mode: newSet.penaltyMode,
      report_email: newSet.reportEmail || ""
    }).eq("id", 1);
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>CierzoTest</div>
        <div style={{ fontSize: 14, color: "var(--tx3)" }}>Cargando datos...</div>
      </div>
    </div>;
  }

  var value = {
    users: users, setUsers: updateUsers,
    questions: questions, setQuestions: updateQuestions,
    oposiciones: oposiciones, setOposiciones: updateOposiciones,
    results: results, setResults: updateResults,
    bookmarks: bookmarks, setBookmarks: updateBookmarks,
    reports: reports, setReports: updateReports,
    settings: settings, setSettings: updateSettings,
    supabase: supabase
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useStore() { return useContext(Ctx); }

/* ====== ICONS ====== */
const IC = {
  Logo: () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="var(--accent)" /><path d="M8 10h16M8 16h12M8 22h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /><circle cx="24" cy="22" r="4" fill="#fff" opacity=".9" /><path d="M22.5 22l1 1 2-2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Dash: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" /></svg>,
  Test: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M6 7h8M6 10h6M6 13h7" strokeLinecap="round" /></svg>,
  Bar: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17V9M7.5 17V5M12 17V8M16.5 17V3" strokeLinecap="round" /></svg>,
  Ppl: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" /></svg>,
  Up: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13V3M6 7l4-4 4 4M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Out: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M13 14l4-4-4-4M17 10H7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Chk: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>,
  Clk: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="7" /><path d="M9 5v4l2.5 2.5" strokeLinecap="round" /></svg>,
  Fire: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2c0 3-3 5-3 8a5 5 0 0010 0c0-3-3-5-3-8-1 2-3 3-4 0z" fill="#f59e0b" /></svg>,
  Bm: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h10a1 1 0 011 1v13l-6-3-6 3V3a1 1 0 011-1z" /></svg>,
  BmF: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h10a1 1 0 011 1v13l-6-3-6 3V3a1 1 0 011-1z" /></svg>,
  Rt: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Hist: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" strokeLinecap="round" /></svg>,
  Cup: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h8v5a4 4 0 01-8 0V3zM6 5H3v2a3 3 0 003 3M14 5h3v2a3 3 0 01-3 3M8 14h4M10 12v2M7 16h6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>,
  Del: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V3h4v1M4 4v9a1 1 0 001 1h6a1 1 0 001-1V4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Pen: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2l4 4-9 9H1v-4l9-9z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Lt: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 10H5M9 6l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Src: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3.5 3.5" strokeLinecap="round" /></svg>,
  Warn: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5M8 11v.5" strokeLinecap="round" /></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 6l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="3.5" /><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" /></svg>,
  Gear: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="2.5" /><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" strokeLinecap="round" /></svg>,
  Flag: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2v12M3 2h8l-2 3 2 3H3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" strokeLinecap="round" /></svg>,
  Bot: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="12" height="9" rx="2" /><circle cx="7" cy="10.5" r="1" fill="currentColor" stroke="none" /><circle cx="11" cy="10.5" r="1" fill="currentColor" stroke="none" /><path d="M9 3v3M6 3h6" strokeLinecap="round" /><path d="M1 10h2M15 10h2" strokeLinecap="round" /></svg>,
};

/* ====== CSS ====== */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--accent:#1A6B8A;--accent-l:#2BB5C6;--accent-s:#D4F1F7;--accent-bg:#EBF8FB;--ok:#059669;--ok-s:#d1fae5;--err:#dc2626;--err-s:#fee2e2;--warn:#d97706;--warn-s:#fef3c7;--bg:#F4F8FA;--sf:#fff;--sf2:#EDF2F6;--bd:#D8E2EA;--bd2:#B8C8D6;--tx:#0F1E2E;--tx2:#4A6275;--tx3:#8CA3B5;--r:10px;--rs:6px;--rl:14px;--f:'DM Sans',sans-serif;--m:'JetBrains Mono',monospace}
*{margin:0;padding:0;box-sizing:border-box}body,#root{font-family:var(--f);background:var(--bg);color:var(--tx);min-height:100vh}
.lp{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e3a5f,#0f172a);padding:20px}
.lc{background:var(--sf);border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 25px 60px rgba(0,0,0,.3)}
.lc h1{font-size:26px;font-weight:700;margin-bottom:6px}.lc>p{color:var(--tx2);margin-bottom:32px;font-size:14.5px}
.ll{display:flex;align-items:center;gap:10px;margin-bottom:28px}.ll span{font-size:20px;font-weight:700;color:var(--accent)}
.fd{margin-bottom:18px}.fd label{display:block;font-size:13px;font-weight:600;color:var(--tx2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.fd input,.fd select,.fd textarea{width:100%;padding:11px 14px;border:1.5px solid var(--bd);border-radius:var(--rs);font-size:15px;font-family:var(--f);background:var(--sf);color:var(--tx);outline:none}
.fd input:focus,.fd select:focus,.fd textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-s)}.fd textarea{min-height:80px;resize:vertical}
.le{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--err-s);border:1px solid #fca5a5;border-radius:var(--rs);margin-bottom:16px;color:var(--err);font-size:14px;font-weight:500;animation:shake .4s}
@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
.b{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:var(--rs);font-size:14.5px;font-weight:600;font-family:var(--f);cursor:pointer;border:none;transition:all .15s;white-space:nowrap}
.bp{background:var(--accent);color:#fff}.bp:hover{background:var(--accent-l)}.bs{background:var(--sf);color:var(--tx);border:1.5px solid var(--bd)}.bs:hover{background:var(--sf2)}
.bk{background:var(--ok);color:#fff}.bg{background:transparent;color:var(--tx2);padding:8px 12px}.bg:hover{background:var(--sf2);color:var(--tx)}
.bl{background:none;border:none;color:var(--accent);font-size:13.5px;cursor:pointer;font-family:var(--f);font-weight:500;padding:0}.bl:hover{text-decoration:underline}
.bsm{padding:7px 14px;font-size:13px}.bw{width:100%;justify-content:center}.b:disabled{opacity:.5;cursor:not-allowed}
.bdanger{background:var(--err);color:#fff}.bdanger:hover{opacity:.9}
.al{display:flex;min-height:100vh}
.sb{width:260px;background:var(--sf);border-right:1px solid var(--bd);padding:20px 0;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.sbl{display:flex;align-items:center;gap:10px;padding:0 20px 20px;border-bottom:1px solid var(--bd);margin-bottom:8px}.sbl span{font-weight:700;font-size:17px;color:var(--accent)}
.sbn{flex:1;padding:8px 10px}
.ni{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--rs);color:var(--tx2);cursor:pointer;font-size:14.5px;font-weight:500;transition:all .15s;margin-bottom:2px}
.ni:hover{background:var(--sf2);color:var(--tx)}.ni.ac{background:var(--accent-bg);color:var(--accent);font-weight:600}
.sbf{padding:12px 20px;border-top:1px solid var(--bd)}.sbu{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.av{width:36px;height:36px;border-radius:50%;background:var(--accent-s);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.mc{flex:1;margin-left:260px;padding:28px 36px;max-width:1200px}
.ph{margin-bottom:28px}.ph h2{font-size:24px;font-weight:700;margin-bottom:4px}.ph p{color:var(--tx2);font-size:14.5px}
.cd{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:24px}.ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.ct{font-size:16px;font-weight:600}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px}
.sc{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:20px;display:flex;align-items:center;gap:14px}
.si{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sv{font-size:24px;font-weight:700}.sl{font-size:13px;color:var(--tx3);font-weight:500}
table{width:100%;border-collapse:collapse}th{text-align:left;padding:10px 14px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--tx3);border-bottom:1px solid var(--bd)}
td{padding:12px 14px;font-size:14px;border-bottom:1px solid var(--bd)}tr:hover td{background:var(--sf2)}
.bg2{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.bgk{background:var(--ok-s);color:var(--ok)}.bgd{background:var(--err-s);color:var(--err)}.bgw{background:var(--warn-s);color:var(--warn)}.bgi{background:var(--accent-s);color:var(--accent)}
.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.tc{padding:12px 16px;border:1.5px solid var(--bd);border-radius:var(--rs);cursor:pointer;font-size:14px;transition:all .15s;display:flex;align-items:center;gap:8px}
.tc:hover{border-color:var(--accent);background:var(--accent-bg)}.tc.sel{border-color:var(--accent);background:var(--accent-s);color:var(--accent);font-weight:600}
.ck{width:20px;height:20px;border-radius:4px;border:1.5px solid var(--bd2);display:flex;align-items:center;justify-content:center;flex-shrink:0}.tc.sel .ck{background:var(--accent);border-color:var(--accent);color:#fff}
.qc{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:32px;margin-bottom:20px}
.qn{font-size:13px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.qt{font-size:17px;font-weight:500;line-height:1.5;margin-bottom:24px}
.ol{display:grid;gap:10px}
.ob{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid var(--bd);border-radius:var(--r);cursor:pointer;font-size:15px;font-family:var(--f);background:var(--sf);text-align:left;transition:all .15s;width:100%;color:var(--tx)}
.ob:hover{border-color:var(--accent);background:var(--accent-bg)}.ob.sel{border-color:var(--accent);background:var(--accent-s)}.ob.ok{border-color:var(--ok);background:var(--ok-s)}.ob.no{border-color:var(--err);background:var(--err-s)}
.olet{width:30px;height:30px;border-radius:8px;background:var(--sf2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--tx2);flex-shrink:0}
.ob.sel .olet{background:var(--accent);color:#fff}.ob.ok .olet{background:var(--ok);color:#fff}.ob.no .olet{background:var(--err);color:#fff}
.tp{display:flex;align-items:center;gap:16px;padding:16px 24px;background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);margin-bottom:20px}
.pbw{flex:1;height:6px;background:var(--sf2);border-radius:3px;overflow:hidden}.pbf{height:100%;background:var(--accent);border-radius:3px;transition:width .3s}
.tmr{display:flex;align-items:center;gap:6px;font-family:var(--m);font-size:15px;font-weight:500;color:var(--tx2)}
.rh{text-align:center;padding:40px;background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);margin-bottom:24px}
.rs{font-size:64px;font-weight:700;letter-spacing:-2px;margin-bottom:4px}.rs.g{color:var(--ok)}.rs.m{color:var(--warn)}.rs.bad{color:var(--err)}
.jb{background:var(--accent-bg);border:1px solid var(--accent-s);border-radius:var(--rs);padding:14px 18px;margin-top:14px;font-size:14px;line-height:1.5}
.tpi{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--bd)}.tpi:last-child{border-bottom:none}
.tpn{flex:1;font-size:14px;font-weight:500}.tpb{width:120px;height:6px;background:var(--sf2);border-radius:3px;overflow:hidden}.tpfl{height:100%;border-radius:3px}
.tpp{width:48px;text-align:right;font-size:14px;font-weight:600;font-family:var(--m)}
.dz{border:2px dashed var(--bd2);border-radius:var(--r);padding:40px;text-align:center;cursor:pointer;transition:all .2s}.dz:hover{border-color:var(--accent);background:var(--accent-bg)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px)}
.md{background:var(--sf);border-radius:var(--rl);padding:32px;width:100%;max-width:560px;max-height:85vh;overflow-y:auto}.md h3{font-size:20px;font-weight:700;margin-bottom:20px}
.ma{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}
.tabs{display:flex;gap:4px;background:var(--sf2);padding:4px;border-radius:var(--rs);margin-bottom:20px}
.tab{padding:8px 18px;border-radius:var(--rs);font-size:14px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--tx2);font-family:var(--f)}.tab.ac{background:var(--sf);color:var(--tx);font-weight:600}
.es{text-align:center;padding:48px 20px;color:var(--tx3)}.es p{font-size:15px;margin-top:8px}
.f{display:flex}.fw{flex-wrap:wrap}.g8{gap:8px}.g12{gap:12px}.g16{gap:16px}.ic{align-items:center}.jb2{justify-content:space-between}
.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb20{margin-bottom:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fi{animation:fi .25s ease}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.stk{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--warn-s);border-radius:20px;font-size:14px;font-weight:600;color:var(--warn)}
.qmg{display:flex;flex-wrap:wrap;gap:6px}
.qm{width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--bd);background:var(--sf);color:var(--tx2);font-family:var(--f)}
.qm.aw{background:var(--accent-s);border-color:var(--accent);color:var(--accent)}.qm.cu{background:var(--accent);border-color:var(--accent);color:#fff}
.profile-field{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--bd)}.profile-field:last-child{border-bottom:none}
.profile-label{font-size:13px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px}
.profile-value{font-size:15px;font-weight:500}
.toggle{position:relative;width:44px;height:24px;border-radius:12px;cursor:pointer;border:none;transition:all .2s;padding:0}
.toggle.on{background:var(--accent)}.toggle.off{background:var(--bd2)}
.toggle-knob{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle.on .toggle-knob{left:22px}.toggle.off .toggle-knob{left:2px}
.report-badge{position:relative}.report-badge .rbcount{position:absolute;top:-6px;right:-6px;background:var(--err);color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.success-msg{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--ok-s);border:1px solid #6ee7b7;border-radius:var(--rs);color:var(--ok);font-size:14px;font-weight:500;margin-bottom:16px}
@media(max-width:768px){.sb{display:none}.mc{margin-left:0;padding:16px}.sg{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.tg{grid-template-columns:1fr}.qc{padding:20px}.lc{padding:32px 24px}}
@keyframes pulse-ai{0%,100%{opacity:1}50%{opacity:.5}}.ai-loading{animation:pulse-ai 1.5s infinite}`;

/* ====== LOGIN ====== */
function Login({ onLogin }) {
  const { users } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  function handleClick() {
    if (!username.trim() || !password.trim()) {
      setError("Introduce usuario y contraseña");
      return;
    }
    var user = users.find(function(u) { return u.username === username && u.password === password; });
    if (user) {
      onLogin(user);
      return;
    }
    var exists = users.find(function(u) { return u.username === username; });
    if (exists) {
      setError("Contraseña incorrecta. Revísala e inténtalo de nuevo.");
    } else {
      setError("El usuario no existe. Verifica tus credenciales.");
    }
  }

  return (
    <div className="lp">
      <div className="lc fi">
        <div className="ll"><img src="/logo-cierzo.png" alt="CierzoTest" style={{height:60}} /></div>
        <h1>Bienvenido</h1>
        <p>Accede a tu plataforma de oposiciones</p>
        {error && <div className="le"><IC.Warn />{error}</div>}
        <div onKeyDown={function(e) { if (e.key === "Enter") handleClick(); }}>
          <div className="fd">
            <label>Usuario</label>
            <input value={username} onChange={function(e) { setUsername(e.target.value); setError(""); }} placeholder="Tu usuario" />
          </div>
          <div className="fd">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={function(e) { setPassword(e.target.value); setError(""); }} placeholder="Tu contraseña" />
          </div>
          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <button type="button" className="bl" onClick={function() { setShowRecovery(true); }}>¿Olvidaste tu contraseña?</button>
          </div>
          <button type="button" className="b bp bw" onClick={handleClick}>Iniciar sesión</button>
        </div>
        <p style={{marginTop:20,color:"var(--tx3)",fontSize:13,textAlign:"center"}}>Hecho con <span style={{color:"#E25555"}}>&#10084;</span> por Cierzo Formación</p>
      </div>

      {showRecovery && (
        <div className="mo" onClick={function() { setShowRecovery(false); }}>
          <div className="md fi" onClick={function(e) { e.stopPropagation(); }}>
            <h3><IC.Mail /> Recuperar contraseña</h3>
            {recoverySent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>✉️</p>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Correo enviado</p>
                <p style={{ color: "var(--tx2)", fontSize: 14 }}>Si tu email está registrado, recibirás instrucciones.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-s)", borderRadius: "var(--rs)", padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: "var(--tx2)" }}>Introduce tu email y te enviaremos un enlace de recuperación.</p>
                </div>
                <div className="fd"><label>Email</label><input type="email" placeholder="tu@email.com" /></div>
                <div className="ma">
                  <button className="b bs" onClick={function() { setShowRecovery(false); }}>Cancelar</button>
                  <button className="b bp" onClick={function() { setRecoverySent(true); setTimeout(function() { setRecoverySent(false); setShowRecovery(false); }, 3000); }}>Enviar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== SIDEBAR ====== */
function Side({ user, view, setView, logout }) {
  const { reports } = useStore();
  var isA = user.role === "admin";
  var pendingReports = reports.filter(function(r) { return !r.resolved; }).length;
  var nav = isA
    ? [["dashboard", "Dashboard", IC.Dash], ["students", "Alumnos", IC.Ppl], ["oposiciones", "Oposiciones", IC.Test], ["questions", "Preguntas", IC.Up], ["generate", "Generar con IA", IC.Bot], ["reports", "Reportes", IC.Flag], ["settings", "Ajustes", IC.Gear]]
    : [["dashboard", "Mi Panel", IC.Dash], ["test", "Hacer Test", IC.Test], ["stats", "Estadísticas", IC.Bar], ["history", "Historial", IC.Hist], ["bookmarks", "Guardadas", IC.Bm], ["profile", "Mi Perfil", IC.User]];

  return (
    <div className="sb">
      <div className="sbl"><img src="/logo-cierzo.png" alt="Cierzo" style={{height:36,filter:"brightness(0) invert(1)",opacity:0.9}} /></div>
      <div className="sbn">
        {nav.map(function(item) {
          var id = item[0], label = item[1], Icon = item[2];
          var showBadge = isA && id === "reports" && pendingReports > 0;
          return <div key={id} className={"ni " + (view === id ? "ac" : "")} onClick={function() { setView(id); }}>
            {showBadge ? <span className="report-badge"><Icon /><span className="rbcount">{pendingReports}</span></span> : <Icon />}
            {label}
          </div>;
        })}
      </div>
      <div className="sbf">
        <div className="sbu">
          <div className="av">{user.name[0]}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "var(--tx3)" }}>{isA ? "Admin" : "Alumno"}</div>
          </div>
        </div>
        <div className="ni" onClick={logout}><IC.Out />Cerrar sesión</div>
      </div>
    </div>
  );
}

/* ====== ADMIN DASHBOARD ====== */
function ADash() {
  const { users, questions, results } = useStore();
  const stu = users.filter(function(u) { return u.role === "student"; });
  const avg = results.length ? Math.round(results.reduce(function(s, r) { return s + r.score; }, 0) / results.length) : 0;
  const l7 = results.filter(function(r) { return new Date(r.date) > Date.now() - 604800000; });

  return (
    <div className="fi">
      <div className="ph"><h2>Panel de Administración</h2><p>Resumen general</p></div>
      <div className="sg">
        <div className="sc"><div className="si" style={{ background: "var(--accent-s)", color: "var(--accent)" }}><IC.Ppl /></div><div><div className="sv">{stu.length}</div><div className="sl">Alumnos</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--ok-s)", color: "var(--ok)" }}><IC.Test /></div><div><div className="sv">{questions.length}</div><div className="sl">Preguntas</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--warn-s)", color: "var(--warn)" }}><IC.Bar /></div><div><div className="sv">{results.length}</div><div className="sl">Tests</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--err-s)", color: "var(--err)" }}><IC.Cup /></div><div><div className="sv">{avg}%</div><div className="sl">Media</div></div></div>
      </div>
      <div className="g2">
        <div className="cd">
          <div className="ch"><span className="ct">Actividad (7 días)</span><span className="bg2 bgi">{l7.length}</span></div>
          {l7.length === 0 ? <p style={{ color: "var(--tx3)", fontSize: 14 }}>Sin actividad</p> : (
            <table><thead><tr><th>Alumno</th><th>Nota</th><th>Fecha</th></tr></thead><tbody>
              {l7.slice(0, 8).map(function(r, i) {
                var s = users.find(function(u) { return u.id === r.userId; });
                return <tr key={i}><td>{s ? s.name : "—"}</td><td><span className={"bg2 " + (r.score >= 70 ? "bgk" : r.score >= 50 ? "bgw" : "bgd")}>{r.score}%</span></td><td style={{ color: "var(--tx3)", fontSize: 13 }}>{new Date(r.date).toLocaleDateString("es-ES")}</td></tr>;
              })}
            </tbody></table>
          )}
        </div>
        <div className="cd">
          <div className="ch"><span className="ct">Por alumno</span></div>
          {stu.map(function(s) {
            var sr = results.filter(function(r) { return r.userId === s.id; });
            var a = sr.length ? Math.round(sr.reduce(function(x, r) { return x + r.score; }, 0) / sr.length) : 0;
            return <div key={s.id} className="tpi"><div className="av" style={{ width: 32, height: 32, fontSize: 12 }}>{s.name[0]}</div><span className="tpn">{s.name}</span><div className="tpb"><div className="tpfl" style={{ width: a + "%", background: a >= 70 ? "var(--ok)" : a >= 50 ? "var(--warn)" : "var(--err)" }} /></div><span className="tpp">{a}%</span></div>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ====== ADMIN STUDENTS ====== */
function AStudents() {
  const { users, setUsers, oposiciones, results, supabase } = useStore();
  const [show, setShow] = useState(false);
  const [ed, setEd] = useState(null);
  const [fm, setFm] = useState({ name: "", username: "", password: "", email: "", assignedOpos: [] });
  const stu = users.filter(function(u) { return u.role === "student"; });

  function open(s) { setEd(s || null); setFm(s ? { name: s.name, username: s.username, password: s.password, email: s.email || "", assignedOpos: s.assignedOpos || [] } : { name: "", username: "", password: "", email: "", assignedOpos: [] }); setShow(true); }
  async function save() {
    if (!fm.name || !fm.username || !fm.password) return;
    if (ed) {
      await supabase.from("users").update({ name: fm.name, username: fm.username, password: fm.password, email: fm.email }).eq("id", ed.id);
      await supabase.from("user_oposiciones").delete().eq("user_id", ed.id);
      if (fm.assignedOpos.length) { await supabase.from("user_oposiciones").insert(fm.assignedOpos.map(function(oid) { return { user_id: ed.id, opo_id: oid }; })); }
      setUsers(users.map(function(u) { return u.id === ed.id ? Object.assign({}, u, fm) : u; }));
    } else {
      var { data } = await supabase.from("users").insert({ username: fm.username, password: fm.password, role: "student", name: fm.name, email: fm.email }).select().single();
      if (data) {
        if (fm.assignedOpos.length) { await supabase.from("user_oposiciones").insert(fm.assignedOpos.map(function(oid) { return { user_id: data.id, opo_id: oid }; })); }
        setUsers(users.concat([{ id: data.id, role: "student", streak: 0, lastStudyDate: null, createdAt: data.created_at, name: fm.name, username: fm.username, password: fm.password, email: fm.email, assignedOpos: fm.assignedOpos }]));
      }
    }
    setShow(false);
  }
  async function delUser(id) {
    await supabase.from("users").delete().eq("id", id);
    setUsers(users.filter(function(u) { return u.id !== id; }));
  }

  return (
    <div className="fi">
      <div className="ph f jb2 ic"><div><h2>Alumnos</h2><p>Gestiona alumnos</p></div><button className="b bp" onClick={function() { open(null); }}><IC.Plus /> Nuevo</button></div>
      <div className="cd"><table><thead><tr><th>Nombre</th><th>Usuario</th><th>Email</th><th>Oposiciones</th><th>Tests</th><th>Media</th><th></th></tr></thead><tbody>
        {stu.map(function(s) {
          var sr = results.filter(function(r) { return r.userId === s.id; });
          var a = sr.length ? Math.round(sr.reduce(function(x, r) { return x + r.score; }, 0) / sr.length) : 0;
          return (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.name}</td>
              <td><code style={{ fontSize: 13, background: "var(--sf2)", padding: "2px 8px", borderRadius: 4 }}>{s.username}</code></td>
              <td style={{ fontSize: 13, color: "var(--tx2)" }}>{s.email || "—"}</td>
              <td><div className="f fw g8">{(s.assignedOpos || []).map(function(id) { var o = oposiciones.find(function(x) { return x.id === id; }); return o ? <span key={id} className="bg2 bgi">{o.name}</span> : null; })}</div></td>
              <td>{sr.length}</td>
              <td><span className={"bg2 " + (a >= 70 ? "bgk" : a >= 50 ? "bgw" : "bgd")}>{a}%</span></td>
              <td><div className="f g8"><button className="b bg bsm" onClick={function() { open(s); }}><IC.Pen /></button><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { delUser(s.id); }}><IC.Del /></button></div></td>
            </tr>
          );
        })}
      </tbody></table></div>
      {show && (
        <div className="mo" onClick={function() { setShow(false); }}>
          <div className="md fi" onClick={function(e) { e.stopPropagation(); }}>
            <h3>{ed ? "Editar" : "Nuevo"} alumno</h3>
            <div className="fd"><label>Nombre</label><input value={fm.name} onChange={function(e) { setFm(Object.assign({}, fm, { name: e.target.value })); }} /></div>
            <div className="fd"><label>Email</label><input type="email" value={fm.email} onChange={function(e) { setFm(Object.assign({}, fm, { email: e.target.value })); }} placeholder="alumno@email.com" /></div>
            <div className="g2">
              <div className="fd"><label>Usuario</label><input value={fm.username} onChange={function(e) { setFm(Object.assign({}, fm, { username: e.target.value })); }} /></div>
              <div className="fd"><label>Contraseña</label><input value={fm.password} onChange={function(e) { setFm(Object.assign({}, fm, { password: e.target.value })); }} /></div>
            </div>
            <div className="fd"><label>Oposiciones</label>
              <div className="tg" style={{ marginTop: 6 }}>
                {oposiciones.map(function(o) {
                  var sel = fm.assignedOpos.indexOf(o.id) >= 0;
                  return <div key={o.id} className={"tc " + (sel ? "sel" : "")} onClick={function() { setFm(Object.assign({}, fm, { assignedOpos: sel ? fm.assignedOpos.filter(function(x) { return x !== o.id; }) : fm.assignedOpos.concat([o.id]) })); }}><span className="ck">{sel && <IC.Chk />}</span>{o.name}</div>;
                })}
              </div>
            </div>
            <div className="ma"><button className="b bs" onClick={function() { setShow(false); }}>Cancelar</button><button className="b bp" onClick={save}>{ed ? "Guardar" : "Crear"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== ADMIN OPOSICIONES ====== */
function AOpos() {
  const { oposiciones, setOposiciones, questions, supabase } = useStore();
  const [show, setShow] = useState(false);
  const [ed, setEd] = useState(null);
  const [fm, setFm] = useState({ name: "", ct: "", st: "" });

  function open(o) { setEd(o || null); setFm(o ? { name: o.name, ct: o.commonTopics.join("\n"), st: o.specificTopics.join("\n") } : { name: "", ct: "", st: "" }); setShow(true); }
  async function save() {
    if (!fm.name) return;
    var c = fm.ct.split("\n").map(function(t) { return t.trim(); }).filter(Boolean);
    var s = fm.st.split("\n").map(function(t) { return t.trim(); }).filter(Boolean);
    if (ed) {
      await supabase.from("oposiciones").update({ name: fm.name, common_topics: c, specific_topics: s }).eq("id", ed.id);
      setOposiciones(oposiciones.map(function(o) { return o.id === ed.id ? Object.assign({}, o, { name: fm.name, commonTopics: c, specificTopics: s }) : o; }));
    } else {
      var { data } = await supabase.from("oposiciones").insert({ name: fm.name, common_topics: c, specific_topics: s }).select().single();
      if (data) { setOposiciones(oposiciones.concat([{ id: data.id, name: fm.name, commonTopics: c, specificTopics: s }])); }
    }
    setShow(false);
  }
  async function delOpo(id) {
    await supabase.from("oposiciones").delete().eq("id", id);
    setOposiciones(oposiciones.filter(function(x) { return x.id !== id; }));
  }

  return (
    <div className="fi">
      <div className="ph f jb2 ic"><div><h2>Oposiciones</h2><p>Temarios</p></div><button className="b bp" onClick={function() { open(null); }}><IC.Plus /> Nueva</button></div>
      <div style={{ display: "grid", gap: 16 }}>
        {oposiciones.map(function(o) {
          var qc = questions.filter(function(q) { return q.opoId === o.id; }).length;
          return (
            <div key={o.id} className="cd">
              <div className="ch">
                <div><span className="ct">{o.name}</span><div style={{ marginTop: 4 }}><span className="bg2 bgi">{qc} preguntas</span></div></div>
                <div className="f g8"><button className="b bg bsm" onClick={function() { open(o); }}><IC.Pen /> Editar</button><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { delOpo(o.id); }}><IC.Del /></button></div>
              </div>
              <div className="g2">
                <div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--tx3)", marginBottom: 8 }}>COMÚN</p>{o.commonTopics.map(function(t, i) { return <div key={i} style={{ fontSize: 14, padding: "4px 0", color: "var(--tx2)" }}>• {t}</div>; })}</div>
                <div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--tx3)", marginBottom: 8 }}>ESPECÍFICO</p>{o.specificTopics.map(function(t, i) { return <div key={i} style={{ fontSize: 14, padding: "4px 0", color: "var(--tx2)" }}>• {t}</div>; })}</div>
              </div>
            </div>
          );
        })}
      </div>
      {show && (
        <div className="mo" onClick={function() { setShow(false); }}>
          <div className="md fi" onClick={function(e) { e.stopPropagation(); }}>
            <h3>{ed ? "Editar" : "Nueva"} oposición</h3>
            <div className="fd"><label>Nombre</label><input value={fm.name} onChange={function(e) { setFm(Object.assign({}, fm, { name: e.target.value })); }} /></div>
            <div className="fd"><label>Temas comunes (uno por línea)</label><textarea value={fm.ct} onChange={function(e) { setFm(Object.assign({}, fm, { ct: e.target.value })); }} rows={5} /></div>
            <div className="fd"><label>Temas específicos (uno por línea)</label><textarea value={fm.st} onChange={function(e) { setFm(Object.assign({}, fm, { st: e.target.value })); }} rows={5} /></div>
            <div className="ma"><button className="b bs" onClick={function() { setShow(false); }}>Cancelar</button><button className="b bp" onClick={save}>{ed ? "Guardar" : "Crear"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== ADMIN QUESTIONS ====== */
function AQuestions() {
  const { questions, setQuestions, oposiciones, supabase } = useStore();
  const [fo, setFo] = useState("all");
  const [sr, setSr] = useState("");
  const [imp, setImp] = useState(false);
  const [ir, setIr] = useState(null);
  const ref = useRef();

  var fq = questions.filter(function(q) { if (fo !== "all" && q.opoId !== fo) return false; if (sr && q.text.toLowerCase().indexOf(sr.toLowerCase()) < 0) return false; return true; });

  async function doCSV(text) {
    try {
      var ls = text.split("\n").filter(function(l) { return l.trim(); });
      if (ls.length < 2) { setIr({ e: "Archivo vacío" }); return; }
      var h = ls[0].split(";").map(function(x) { return x.trim().toLowerCase(); });
      var need = ["oposicion_id", "tema", "tipo", "pregunta", "opcion_a", "opcion_b", "respuesta_correcta", "justificacion"];
      var miss = need.filter(function(c) { return h.indexOf(c) < 0; });
      if (miss.length) { setIr({ e: "Faltan: " + miss.join(", ") }); return; }
      var n = 0; var nq = [];
      for (var i = 1; i < ls.length; i++) {
        var v = ls[i].split(";").map(function(x) { return x.trim(); });
        if (v.length < h.length) continue;
        var row = {}; h.forEach(function(k, j) { row[k] = v[j]; });
        var opts = [row.opcion_a, row.opcion_b];
        if (row.opcion_c) opts.push(row.opcion_c);
        if (row.opcion_d) opts.push(row.opcion_d);
        var cm = { a: 0, b: 1, c: 2, d: 3 };
        var ci = cm[row.respuesta_correcta ? row.respuesta_correcta.toLowerCase() : ""];
        if (ci === undefined || ci >= opts.length) continue;
        nq.push({ opo_id: row.oposicion_id, topic: row.tema, type: row.tipo || "common", text: row.pregunta, options: opts, correct: ci, justification: row.justificacion || "" });
        n++;
      }
      if (nq.length) {
        var { data } = await supabase.from("questions").insert(nq).select();
        if (data) {
          var mapped = data.map(function(q) { return { id: q.id, opoId: q.opo_id, topic: q.topic, type: q.type, text: q.text, options: q.options, correct: q.correct, justification: q.justification }; });
          setQuestions(questions.concat(mapped));
        }
      }
      setIr({ n: n });
    } catch (e) { setIr({ e: e.message }); }
  }
  async function delQuestion(id) {
    await supabase.from("questions").delete().eq("id", id);
    setQuestions(questions.filter(function(x) { return x.id !== id; }));
  }

  return (
    <div className="fi">
      <div className="ph f jb2 ic"><div><h2>Banco de Preguntas</h2><p>{questions.length} preguntas</p></div><button className="b bp" onClick={function() { setImp(true); }}><IC.Up /> Importar CSV</button></div>
      <div className="cd mb20">
        <div className="f g12 ic fw">
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--tx3)" }}><IC.Src /></div>
            <input placeholder="Buscar..." value={sr} onChange={function(e) { setSr(e.target.value); }} style={{ width: "100%", padding: "9px 14px 9px 38px", border: "1.5px solid var(--bd)", borderRadius: "var(--rs)", fontSize: 14, fontFamily: "var(--f)" }} />
          </div>
          <select value={fo} onChange={function(e) { setFo(e.target.value); }} style={{ padding: "9px 14px", border: "1.5px solid var(--bd)", borderRadius: "var(--rs)", fontSize: 14, fontFamily: "var(--f)", background: "var(--sf)" }}>
            <option value="all">Todas</option>
            {oposiciones.map(function(o) { return <option key={o.id} value={o.id}>{o.name}</option>; })}
          </select>
        </div>
      </div>
      <div className="cd">
        <table><thead><tr><th style={{ width: 40 }}>#</th><th>Pregunta</th><th>Tema</th><th>Tipo</th><th style={{ width: 50 }}></th></tr></thead><tbody>
          {fq.slice(0, 50).map(function(q, i) {
            return (
              <tr key={q.id}>
                <td style={{ color: "var(--tx3)" }}>{i + 1}</td>
                <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.text}</td>
                <td><span className="bg2 bgi">{q.topic}</span></td>
                <td><span className={"bg2 " + (q.type === "common" ? "bgk" : "bgw")}>{q.type === "common" ? "Común" : "Espec."}</span></td>
                <td><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { delQuestion(q.id); }}><IC.Del /></button></td>
              </tr>
            );
          })}
        </tbody></table>
        {fq.length === 0 && <div className="es"><p>Sin resultados</p></div>}
      </div>
      {imp && (
        <div className="mo" onClick={function() { setImp(false); setIr(null); }}>
          <div className="md fi" onClick={function(e) { e.stopPropagation(); }} style={{ maxWidth: 640 }}>
            <h3>Importar CSV</h3>
            <p style={{ marginBottom: 16, color: "var(--tx2)", fontSize: 14 }}>Separador: punto y coma. opcion_c y opcion_d opcionales.</p>
            <div style={{ background: "var(--sf2)", borderRadius: "var(--r)", padding: 14, fontFamily: "var(--m)", fontSize: 12, overflow: "auto", whiteSpace: "pre", marginBottom: 16, color: "var(--tx2)" }}>oposicion_id;tema;tipo;pregunta;opcion_a;opcion_b;opcion_c;opcion_d;respuesta_correcta;justificacion</div>
            <div className="dz" onClick={function() { if (ref.current) ref.current.click(); }} style={{ marginBottom: 16 }}>
              <IC.Up />
              <p style={{ color: "var(--tx2)", marginTop: 8, fontSize: 14 }}>Arrastra o haz clic</p>
              <input ref={ref} type="file" accept=".csv,.txt" onChange={function(e) { var f = e.target.files[0]; if (f) { var r = new FileReader(); r.onload = function(ev) { doCSV(ev.target.result); }; r.readAsText(f); } }} style={{ display: "none" }} />
            </div>
            {ir && <div style={{ padding: 16, borderRadius: "var(--rs)", background: ir.e ? "var(--err-s)" : "var(--ok-s)", marginBottom: 16 }}>{ir.e ? <p style={{ color: "var(--err)", fontSize: 14 }}>{ir.e}</p> : <p style={{ color: "var(--ok)", fontSize: 14, fontWeight: 600 }}>Importadas: {ir.n} preguntas</p>}</div>}
            <div className="ma"><button className="b bs" onClick={function() { setImp(false); setIr(null); }}>Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== ADMIN REPORTS ====== */
function AReports() {
  const { reports, setReports, questions, users, supabase } = useStore();
  const [filter, setFilter] = useState("pending");
  var fr = filter === "pending" ? reports.filter(function(r) { return !r.resolved; }) : filter === "resolved" ? reports.filter(function(r) { return r.resolved; }) : reports;

  async function resolveReport(id) {
    var now = new Date().toISOString();
    await supabase.from("reports").update({ resolved: true, resolved_at: now }).eq("id", id);
    setReports(reports.map(function(x) { return x.id === id ? Object.assign({}, x, { resolved: true, resolvedAt: now }) : x; }));
  }
  var fr = filter === "pending" ? reports.filter(function(r) { return !r.resolved; }) : filter === "resolved" ? reports.filter(function(r) { return r.resolved; }) : reports;

  return (
    <div className="fi">
      <div className="ph"><h2>Reportes de Preguntas</h2><p>{reports.filter(function(r) { return !r.resolved; }).length} pendientes</p></div>
      <div className="tabs mb20">
        <button className={"tab " + (filter === "pending" ? "ac" : "")} onClick={function() { setFilter("pending"); }}>Pendientes</button>
        <button className={"tab " + (filter === "resolved" ? "ac" : "")} onClick={function() { setFilter("resolved"); }}>Resueltos</button>
        <button className={"tab " + (filter === "all" ? "ac" : "")} onClick={function() { setFilter("all"); }}>Todos</button>
      </div>
      {fr.length === 0 ? (
        <div className="cd"><div className="es"><IC.Flag /><p>{filter === "pending" ? "No hay reportes pendientes" : "Sin reportes"}</p></div></div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {fr.map(function(r) {
            var q = questions.find(function(x) { return x.id === r.questionId; });
            var u = users.find(function(x) { return x.id === r.userId; });
            return (
              <div key={r.id} className="cd" style={{ padding: 20 }}>
                <div className="f jb2 ic mb12">
                  <div className="f ic g8">
                    <span className={"bg2 " + (r.resolved ? "bgk" : "bgd")}>{r.resolved ? "Resuelto" : "Pendiente"}</span>
                    <span style={{ fontSize: 13, color: "var(--tx3)" }}>{new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {!r.resolved && (
                    <button className="b bk bsm" onClick={function() { resolveReport(r.id); }}><IC.Chk /> Marcar resuelto</button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--tx2)", marginBottom: 8 }}>Reportado por: <b>{u ? u.name : "—"}</b></div>
                {q && (
                  <div style={{ background: "var(--sf2)", borderRadius: "var(--rs)", padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{q.topic}</div>
                    <div style={{ fontSize: 14 }}>{q.text}</div>
                    <div style={{ fontSize: 13, color: "var(--tx2)", marginTop: 6 }}>Respuesta correcta: <b>{String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</b></div>
                  </div>
                )}
                <div style={{ background: "var(--warn-s)", borderRadius: "var(--rs)", padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warn)", marginBottom: 4 }}>MOTIVO DEL REPORTE</div>
                  <div style={{ fontSize: 14 }}>{r.reason}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ====== ADMIN SETTINGS ====== */
function ASettings() {
  const { settings, setSettings } = useStore();
  const [saved, setSaved] = useState(false);

  function togglePenalty() {
    setSettings(Object.assign({}, settings, { penaltyEnabled: !settings.penaltyEnabled }));
  }
  function setPenaltyValue(val) {
    var n = parseFloat(val);
    if (!isNaN(n) && n >= 0 && n <= 1) {
      setSettings(Object.assign({}, settings, { penaltyValue: n }));
    }
  }

  function showSaved() { setSaved(true); setTimeout(function() { setSaved(false); }, 2000); }

  return (
    <div className="fi">
      <div className="ph"><h2>Ajustes</h2><p>Configuración general de la plataforma</p></div>

      {saved && <div className="success-msg"><IC.Chk /> Ajustes guardados correctamente</div>}

      <div className="cd mb20">
        <div className="ct mb16">Penalización por fallos</div>
        <p style={{ fontSize: 14, color: "var(--tx2)", marginBottom: 20, lineHeight: 1.6 }}>
          Cuando está activada, cada respuesta incorrecta resta puntuación al resultado final del test. Las preguntas en blanco no penalizan.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--bd)" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Activar penalización</div>
            <div style={{ fontSize: 13, color: "var(--tx3)", marginTop: 2 }}>Los fallos restarán puntuación</div>
          </div>
          <button className={"toggle " + (settings.penaltyEnabled ? "on" : "off")} onClick={togglePenalty}>
            <span className="toggle-knob" />
          </button>
        </div>

        {settings.penaltyEnabled && (
          <div style={{ padding: "20px 0" }} className="fi">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Valor de penalización</div>
            <p style={{ fontSize: 13, color: "var(--tx2)", marginBottom: 16, lineHeight: 1.5 }}>
              Cada fallo resta este valor por cada pregunta del test. Ejemplo: con 0.33, cada fallo descuenta 1/3 del valor de una pregunta.
            </p>
            <div className="f g8 fw mb16">
              {[
                { label: "1/3 (0.33)", v: 0.33 },
                { label: "1/4 (0.25)", v: 0.25 },
                { label: "1/2 (0.50)", v: 0.50 },
                { label: "Sin penalización", v: 0 },
              ].map(function(opt) {
                var sel = Math.abs(settings.penaltyValue - opt.v) < 0.01;
                return <button key={opt.v} className={"b " + (sel ? "bp" : "bs") + " bsm"} onClick={function() { setSettings(Object.assign({}, settings, { penaltyValue: opt.v })); }}>{opt.label}</button>;
              })}
            </div>
            <div className="fd">
              <label>Valor personalizado (0 a 1)</label>
              <input type="number" min="0" max="1" step="0.01" value={settings.penaltyValue} onChange={function(e) { setPenaltyValue(e.target.value); }} style={{ maxWidth: 160 }} />
            </div>
            <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-s)", borderRadius: "var(--rs)", padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>Vista previa del cálculo</div>
              <div style={{ fontSize: 14, color: "var(--tx2)", lineHeight: 1.6 }}>
                Test de 50 preguntas: 35 aciertos, 10 fallos, 5 en blanco<br />
                Nota sin penalización: <b>{Math.round(35 / 50 * 100)}%</b><br />
                Nota con penalización ({settings.penaltyValue}): <b>{Math.round(Math.max(0, (35 - 10 * settings.penaltyValue) / 50 * 100))}%</b>
              </div>
            </div>
          </div>
        )}

        <div style={{ paddingTop: 20 }}>
          <button className="b bp" onClick={showSaved}>Guardar ajustes</button>
        </div>
      </div>

      <div className="cd mb20">
        <div className="ct mb16">Email de reportes</div>
        <p style={{ fontSize: 14, color: "var(--tx2)", marginBottom: 16, lineHeight: 1.6 }}>
          Dirección de email donde se notificarán los reportes de preguntas erróneas enviados por los alumnos.
        </p>
        <div className="fd">
          <label>Email de notificaciones</label>
          <input value={settings.reportEmail || ""} onChange={function(e) { setSettings(Object.assign({}, settings, { reportEmail: e.target.value })); }} placeholder="test@cierzoformacion.com" style={{ maxWidth: 360 }} />
        </div>
      </div>
    </div>
  );
}

/* ====== ADMIN AI GENERATOR ====== */
function AGenerate() {
  const { oposiciones, questions, setQuestions, supabase } = useStore();
  const [mode, setMode] = useState("tema");
  const [so, setSo] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [nq, setNq] = useState(10);
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  var selOpo = oposiciones.find(function(o) { return o.id === so; });
  var allTopics = selOpo ? selOpo.commonTopics.concat(selOpo.specificTopics) : [];

  function handlePdf(e) {
    var file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      // For txt files, use directly
      if (file.name.endsWith(".txt")) {
        setPdfText(text);
        return;
      }
      // For PDF, we extract what we can (basic text extraction)
      setPdfText(text);
    };
    if (file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else {
      // For PDFs, read as text (will work for text-based PDFs)
      reader.readAsText(file);
    }
  }

  async function generate() {
    if (!so) { setError("Selecciona una oposición"); return; }
    if (mode === "tema" && !topic && !customTopic) { setError("Selecciona o escribe un tema"); return; }
    if (mode === "pdf" && !pdfText) { setError("Sube un archivo primero"); return; }
    setError("");
    setLoading(true);
    setGenerated([]);

    var themeName = topic || customTopic;
    var opoName = selOpo ? selOpo.name : "";
    var prompt = "";

    if (mode === "tema") {
      prompt = "Eres un experto en oposiciones españolas. Genera exactamente " + nq + " preguntas tipo test para la oposición '" + opoName + "', tema '" + themeName + "'.\n\n" +
        "REGLAS ESTRICTAS:\n" +
        "- Cada pregunta debe tener entre 3 y 4 opciones de respuesta\n" +
        "- Solo una respuesta es correcta\n" +
        "- Las preguntas deben ser precisas, basadas en legislación vigente española\n" +
        "- Incluir justificación legal (artículo, ley) para cada respuesta correcta\n" +
        "- Nivel de dificultad variado (fácil, medio, difícil)\n" +
        "- No repetir preguntas obvias\n\n" +
        "FORMATO OBLIGATORIO - Responde SOLO con un JSON array, sin markdown, sin ```json, sin explicaciones previas ni posteriores:\n" +
        '[{"text":"pregunta","options":["opA","opB","opC","opD"],"correct":0,"justification":"explicación"}]\n\n' +
        "Donde 'correct' es el índice (0,1,2,3) de la respuesta correcta. Genera exactamente " + nq + " objetos.";
    } else {
      var truncated = pdfText.substring(0, 12000);
      prompt = "Eres un experto en oposiciones españolas. A partir del siguiente texto de temario, genera exactamente " + nq + " preguntas tipo test.\n\n" +
        "TEXTO DEL TEMARIO:\n" + truncated + "\n\n" +
        "REGLAS ESTRICTAS:\n" +
        "- Cada pregunta debe tener entre 3 y 4 opciones de respuesta\n" +
        "- Solo una respuesta es correcta\n" +
        "- Las preguntas deben extraerse del contenido proporcionado\n" +
        "- Incluir justificación basada en el texto para cada respuesta\n" +
        "- Nivel de dificultad variado\n\n" +
        "FORMATO OBLIGATORIO - Responde SOLO con un JSON array, sin markdown, sin ```json, sin explicaciones:\n" +
        '[{"text":"pregunta","topic":"tema detectado","options":["opA","opB","opC","opD"],"correct":0,"justification":"explicación"}]\n\n' +
        "Donde 'correct' es el índice (0,1,2,3) de la respuesta correcta. Genera exactamente " + nq + " objetos.";
    }

    try {
      var res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.REACT_APP_GEMINI_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      var data = await res.json();
      var rawText = "";
      try { rawText = data.candidates[0].content.parts[0].text; } catch(e) { setError("Error al generar. Inténtalo de nuevo."); setLoading(false); return; }

      // Clean response - remove markdown fences if present
      rawText = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      var parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) { setError("Formato incorrecto de la IA. Inténtalo de nuevo."); setLoading(false); return; }

      var qs = parsed.map(function(q, i) {
        return {
          _idx: i,
          _selected: true,
          text: q.text || "",
          topic: q.topic || themeName || "General",
          type: allTopics.indexOf(q.topic || themeName) >= 0 ? (selOpo.commonTopics.indexOf(q.topic || themeName) >= 0 ? "common" : "specific") : "common",
          options: q.options || [],
          correct: typeof q.correct === "number" ? q.correct : 0,
          justification: q.justification || ""
        };
      }).filter(function(q) { return q.text && q.options.length >= 2; });

      setGenerated(qs);
    } catch(e) {
      setError("Error al procesar la respuesta: " + e.message);
    }
    setLoading(false);
  }

  function toggleQ(idx) {
    setGenerated(generated.map(function(q) { return q._idx === idx ? Object.assign({}, q, { _selected: !q._selected }) : q; }));
  }

  function editQ(idx, field, value) {
    setGenerated(generated.map(function(q) { return q._idx === idx ? Object.assign({}, q, (function() { var o = {}; o[field] = value; return o; })()) : q; }));
  }

  async function saveAll() {
    var toSave = generated.filter(function(q) { return q._selected; });
    if (!toSave.length) return;
    var rows = toSave.map(function(q) {
      return { opo_id: so, topic: q.topic, type: q.type, text: q.text, options: q.options, correct: q.correct, justification: q.justification };
    });
    var { data } = await supabase.from("questions").insert(rows).select();
    if (data) {
      var mapped = data.map(function(q) { return { id: q.id, opoId: q.opo_id, topic: q.topic, type: q.type, text: q.text, options: q.options, correct: q.correct, justification: q.justification }; });
      setQuestions(questions.concat(mapped));
    }
    setSaved(true);
    setTimeout(function() { setSaved(false); setGenerated([]); }, 2000);
  }

  var selectedCount = generated.filter(function(q) { return q._selected; }).length;

  return (
    <div className="fi">
      <div className="ph"><h2>Generar Preguntas con IA</h2><p>Crea preguntas automáticamente con inteligencia artificial</p></div>

      {saved && <div className="success-msg"><IC.Chk /> {selectedCount} preguntas guardadas correctamente</div>}
      {error && <div className="le"><IC.Warn />{error}</div>}

      {generated.length === 0 ? (
        <div>
          <div className="cd mb20">
            <div className="ct mb16">1. Modo de generación</div>
            <div className="tabs">
              <button className={"tab " + (mode === "tema" ? "ac" : "")} onClick={function() { setMode("tema"); }}>Desde tema / ley</button>
              <button className={"tab " + (mode === "pdf" ? "ac" : "")} onClick={function() { setMode("pdf"); }}>Desde archivo (PDF/TXT)</button>
            </div>

            <div className="ct mb16" style={{ marginTop: 16 }}>2. Oposición</div>
            <div className="tg mb16">
              {oposiciones.map(function(o) {
                return <div key={o.id} className={"tc " + (so === o.id ? "sel" : "")} onClick={function() { setSo(o.id); setTopic(""); }}><span className="ck">{so === o.id && <IC.Chk />}</span>{o.name}</div>;
              })}
            </div>

            {so && mode === "tema" && (
              <div className="fi">
                <div className="ct mb16">3. Tema</div>
                <div className="tg mb16">
                  {allTopics.map(function(t) {
                    var isCommon = selOpo.commonTopics.indexOf(t) >= 0;
                    return <div key={t} className={"tc " + (topic === t ? "sel" : "")} onClick={function() { setTopic(t); setCustomTopic(""); }}>
                      <span className="ck">{topic === t && <IC.Chk />}</span>
                      <div><div>{t}</div><div style={{ fontSize: 11, color: "var(--tx3)" }}>{isCommon ? "Común" : "Específico"}</div></div>
                    </div>;
                  })}
                </div>
                <div className="fd">
                  <label>O escribe un tema personalizado</label>
                  <input value={customTopic} onChange={function(e) { setCustomTopic(e.target.value); setTopic(""); }} placeholder="Ej: Ley 9/2017 de Contratos del Sector Público" />
                </div>
              </div>
            )}

            {so && mode === "pdf" && (
              <div className="fi">
                <div className="ct mb16">3. Sube el temario</div>
                <div className="dz" onClick={function() { if (fileRef.current) fileRef.current.click(); }} style={{ marginBottom: 16 }}>
                  <IC.Up />
                  <p style={{ color: "var(--tx2)", marginTop: 8, fontSize: 14 }}>{pdfName || "Arrastra o haz clic para subir PDF o TXT"}</p>
                  <p style={{ color: "var(--tx3)", fontSize: 12, marginTop: 4 }}>Se extraerá el texto para generar preguntas</p>
                  <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handlePdf} style={{ display: "none" }} />
                </div>
                {pdfText && <div style={{ background: "var(--ok-s)", borderRadius: "var(--rs)", padding: "10px 14px", fontSize: 13, color: "var(--ok)" }}><IC.Chk /> Archivo cargado: {pdfText.length} caracteres extraídos</div>}
              </div>
            )}

            {so && (
              <div className="fi" style={{ marginTop: 16 }}>
                <div className="ct mb16">{mode === "tema" ? "4" : "4"}. Cantidad de preguntas</div>
                <div className="f g8 fw">
                  {[5, 10, 15, 20, 25, 30].map(function(n) {
                    return <button key={n} className={"b " + (nq === n ? "bp" : "bs") + " bsm"} onClick={function() { setNq(n); }}>{n}</button>;
                  })}
                </div>
                <div style={{ marginTop: 24 }}>
                  <button className="b bp" onClick={generate} disabled={loading} style={{ background: loading ? "var(--tx3)" : "linear-gradient(135deg, #4285F4, #34A853)", border: "none", fontSize: 16, padding: "14px 32px" }}>
                    <IC.Bot /> {loading ? "Generando preguntas..." : "Generar " + nq + " preguntas con IA"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="f jb2 ic mb20">
            <div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{generated.length} preguntas generadas</span>
              <span style={{ fontSize: 14, color: "var(--tx3)", marginLeft: 8 }}>({selectedCount} seleccionadas)</span>
            </div>
            <div className="f g8">
              <button className="b bs" onClick={function() { setGenerated([]); }}>Volver a configurar</button>
              <button className="b bp" onClick={saveAll} disabled={!selectedCount} style={{ background: "linear-gradient(135deg, #4285F4, #34A853)", border: "none" }}>
                <IC.Chk /> Guardar {selectedCount} preguntas
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {generated.map(function(q) {
              return (
                <div key={q._idx} className="cd fi" style={{ padding: 20, opacity: q._selected ? 1 : 0.5, border: q._selected ? "1.5px solid var(--accent)" : "1px solid var(--bd)" }}>
                  <div className="f jb2 ic mb12">
                    <div className="f ic g8">
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>#{q._idx + 1}</span>
                      <span className={"bg2 " + (q.type === "common" ? "bgk" : "bgw")}>{q.type === "common" ? "Común" : "Espec."}</span>
                      <span className="bg2 bgi">{q.topic}</span>
                    </div>
                    <div className="f ic g8">
                      <button className={"b bsm " + (q._selected ? "bp" : "bs")} onClick={function() { toggleQ(q._idx); }}>
                        {q._selected ? <span><IC.Chk /> Seleccionada</span> : "Excluida"}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, lineHeight: 1.5 }}>{q.text}</div>
                  <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                    {q.options.map(function(opt, oi) {
                      return <div key={oi} style={{ padding: "8px 14px", borderRadius: "var(--rs)", fontSize: 14, background: oi === q.correct ? "var(--ok-s)" : "var(--sf2)", color: oi === q.correct ? "var(--ok)" : "var(--tx2)", fontWeight: oi === q.correct ? 600 : 400 }}>
                        {String.fromCharCode(65 + oi)}. {opt} {oi === q.correct && <IC.Chk />}
                      </div>;
                    })}
                  </div>
                  {q.justification && <div className="jb"><b>Justificación:</b> {q.justification}</div>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }} className="f g8 jb2">
            <button className="b bs" onClick={function() { setGenerated([]); }}>Descartar y volver</button>
            <button className="b bp" onClick={saveAll} disabled={!selectedCount} style={{ background: "linear-gradient(135deg, #4285F4, #34A853)", border: "none" }}>
              <IC.Chk /> Guardar {selectedCount} preguntas en la base de datos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== STUDENT PROFILE ====== */
function SProfile({ user }) {
  const { users, setUsers, oposiciones, results, supabase } = useStore();
  var cu = users.find(function(u) { return u.id === user.id; }) || user;
  var mr = results.filter(function(r) { return r.userId === user.id; });
  var my = oposiciones.filter(function(o) { return (cu.assignedOpos || []).indexOf(o.id) >= 0; });

  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdOk, setPwdOk] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(cu.email || "");
  const [emailOk, setEmailOk] = useState(false);

  async function saveEmail() {
    if (!newEmail.trim()) return;
    await supabase.from("users").update({ email: newEmail.trim() }).eq("id", user.id);
    setUsers(users.map(function(u) { return u.id === user.id ? Object.assign({}, u, { email: newEmail.trim() }) : u; }));
    setEditEmail(false);
    setEmailOk(true);
    setTimeout(function() { setEmailOk(false); }, 2000);
  }

  function changePwd() {
    setPwdError("");
    if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) {
      setPwdError("Completa todos los campos");
      return;
    }
    if (pwdForm.current !== cu.password) {
      setPwdError("La contraseña actual no es correcta");
      return;
    }
    if (pwdForm.newPwd.length < 4) {
      setPwdError("La nueva contraseña debe tener al menos 4 caracteres");
      return;
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdError("Las contraseñas no coinciden");
      return;
    }
    supabase.from("users").update({ password: pwdForm.newPwd }).eq("id", user.id);
    setUsers(users.map(function(u) { return u.id === user.id ? Object.assign({}, u, { password: pwdForm.newPwd }) : u; }));
    setPwdOk(true);
    setPwdForm({ current: "", newPwd: "", confirm: "" });
    setTimeout(function() { setPwdOk(false); setShowPwd(false); }, 2000);
  }

  return (
    <div className="fi">
      <div className="ph"><h2>Mi Perfil</h2><p>Tus datos y configuración</p></div>

      {pwdOk && <div className="success-msg"><IC.Chk /> Contraseña actualizada correctamente</div>}
      {emailOk && <div className="success-msg"><IC.Chk /> Email actualizado correctamente</div>}

      <div className="g2">
        <div className="cd">
          <div className="f ic g12 mb20">
            <div className="av" style={{ width: 56, height: 56, fontSize: 22 }}>{cu.name[0]}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{cu.name}</div>
              <div style={{ fontSize: 13, color: "var(--tx3)" }}>Alumno</div>
            </div>
          </div>
          <div className="profile-field">
            <span className="profile-label">Email</span>
            {editEmail ? (
              <div className="f ic g8">
                <input value={newEmail} onChange={function(e) { setNewEmail(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") saveEmail(); }} style={{ padding: "6px 10px", border: "1.5px solid var(--bd)", borderRadius: "var(--rs)", fontSize: 14, fontFamily: "var(--f)", width: 200 }} />
                <button className="b bp bsm" onClick={saveEmail}>Guardar</button>
                <button className="b bg bsm" onClick={function() { setEditEmail(false); setNewEmail(cu.email || ""); }}>Cancelar</button>
              </div>
            ) : (
              <div className="f ic g8">
                <span className="profile-value">{cu.email || "No configurado"}</span>
                <button className="b bg bsm" onClick={function() { setEditEmail(true); }}><IC.Pen /></button>
              </div>
            )}
          </div>
          <div className="profile-field">
            <span className="profile-label">Usuario</span>
            <span className="profile-value"><code style={{ fontSize: 14, background: "var(--sf2)", padding: "2px 8px", borderRadius: 4 }}>{cu.username}</code></span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Fecha de alta</span>
            <span className="profile-value">{cu.createdAt ? new Date(cu.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Tests realizados</span>
            <span className="profile-value">{mr.length}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Racha actual</span>
            <span className="profile-value"><span className="stk"><IC.Fire />{cu.streak || 0} días</span></span>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="b bs" onClick={function() { setShowPwd(!showPwd); }}><IC.Lock /> {showPwd ? "Cancelar" : "Cambiar contraseña"}</button>
          </div>
        </div>

        <div>
          <div className="cd mb16">
            <div className="ct mb16">Mis Oposiciones</div>
            {my.length === 0 ? <p style={{ color: "var(--tx3)", fontSize: 14 }}>Sin oposiciones asignadas</p> : (
              <div style={{ display: "grid", gap: 8 }}>
                {my.map(function(o) {
                  var or2 = mr.filter(function(r) { return r.opoId === o.id; });
                  var oa = or2.length ? Math.round(or2.reduce(function(s, r) { return s + r.score; }, 0) / or2.length) : 0;
                  return (
                    <div key={o.id} style={{ padding: "12px 16px", background: "var(--sf2)", borderRadius: "var(--rs)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{o.name}</span>
                      <div className="f ic g8"><span className={"bg2 " + (oa >= 70 ? "bgk" : oa >= 50 ? "bgw" : "bgi")}>{oa}%</span><span style={{ fontSize: 12, color: "var(--tx3)" }}>{or2.length} tests</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showPwd && (
            <div className="cd fi">
              <div className="ct mb16"><IC.Lock /> Cambiar contraseña</div>
              {pwdError && <div className="le" style={{ marginBottom: 16 }}><IC.Warn />{pwdError}</div>}
              <div className="fd"><label>Contraseña actual</label><input type="password" value={pwdForm.current} onChange={function(e) { setPwdForm(Object.assign({}, pwdForm, { current: e.target.value })); setPwdError(""); }} /></div>
              <div className="fd"><label>Nueva contraseña</label><input type="password" value={pwdForm.newPwd} onChange={function(e) { setPwdForm(Object.assign({}, pwdForm, { newPwd: e.target.value })); setPwdError(""); }} /></div>
              <div className="fd"><label>Confirmar nueva contraseña</label><input type="password" value={pwdForm.confirm} onChange={function(e) { setPwdForm(Object.assign({}, pwdForm, { confirm: e.target.value })); setPwdError(""); }} /></div>
              <button className="b bp" onClick={changePwd}>Actualizar contraseña</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== STUDENT DASHBOARD ====== */
function SDash({ user }) {
  const { results, oposiciones, questions, users } = useStore();
  var mr = results.filter(function(r) { return r.userId === user.id; });
  var tt = mr.length;
  var avg = tt ? Math.round(mr.reduce(function(s, r) { return s + r.score; }, 0) / tt) : 0;
  var tq = mr.reduce(function(s, r) { return s + (r.totalQuestions || 0); }, 0);
  var best = tt ? Math.max.apply(null, mr.map(function(r) { return r.score; })) : 0;
  var cu = users.find(function(u) { return u.id === user.id; }) || user;
  var stk = cu.streak || 0;
  var my = oposiciones.filter(function(o) { return (user.assignedOpos || []).indexOf(o.id) >= 0; });

  return (
    <div className="fi">
      <div className="ph">
        <div className="f ic g16">
          <div><h2>¡Hola, {user.name.split(" ")[0]}!</h2><p>Tu resumen de estudio</p></div>
          {stk > 0 && <div className="stk"><IC.Fire />{stk} días</div>}
        </div>
      </div>
      <div className="sg">
        <div className="sc"><div className="si" style={{ background: "var(--accent-s)", color: "var(--accent)" }}><IC.Test /></div><div><div className="sv">{tt}</div><div className="sl">Tests</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--ok-s)", color: "var(--ok)" }}><IC.Cup /></div><div><div className="sv">{avg}%</div><div className="sl">Media</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--warn-s)", color: "var(--warn)" }}><IC.Bar /></div><div><div className="sv">{tq}</div><div className="sl">Preguntas</div></div></div>
        <div className="sc"><div className="si" style={{ background: "var(--err-s)", color: "var(--err)" }}><IC.Fire /></div><div><div className="sv">{best}%</div><div className="sl">Mejor</div></div></div>
      </div>
      <div className="cd">
        <div className="ch"><span className="ct">Mis Oposiciones</span></div>
        {my.length === 0 ? <p style={{ color: "var(--tx3)", fontSize: 14 }}>Sin oposiciones asignadas.</p> : (
          <div style={{ display: "grid", gap: 12 }}>
            {my.map(function(o) {
              var or2 = mr.filter(function(r) { return r.opoId === o.id; });
              var oa = or2.length ? Math.round(or2.reduce(function(s, r) { return s + r.score; }, 0) / or2.length) : 0;
              return (
                <div key={o.id} style={{ padding: "16px 20px", background: "var(--sf2)", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 15 }}>{o.name}</div><div style={{ color: "var(--tx3)", fontSize: 13, marginTop: 2 }}>{questions.filter(function(q) { return q.opoId === o.id; }).length} preguntas</div></div>
                  <div className="f ic g12"><span className={"bg2 " + (oa >= 70 ? "bgk" : oa >= 50 ? "bgw" : "bgi")}>{oa}%</span><span style={{ color: "var(--tx3)", fontSize: 13 }}>{or2.length} tests</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== STUDENT TEST ====== */
function STest({ user, setView }) {
  const { oposiciones, questions: allQ, results, setResults, users, setUsers, bookmarks, setBookmarks, reports, setReports, settings, supabase } = useStore();
  var my = oposiciones.filter(function(o) { return (user.assignedOpos || []).indexOf(o.id) >= 0; });

  const [step, setStep] = useState("setup");
  const [so, setSo] = useState(null);
  const [stps, setStps] = useState([]);
  const [tf, setTf] = useState("all");
  const [nq, setNq] = useState(10);
  const [tqs, setTqs] = useState([]);
  const [ci, setCi] = useState(0);
  const [ans, setAns] = useState({});
  const [doubts, setDoubts] = useState({});
  const [t0, setT0] = useState(null);
  const [el, setEl] = useState(0);
  const [done, setDone] = useState(false);
  const [ri, setRi] = useState(null);
  const [showReport, setShowReport] = useState(null);
  const [reportText, setReportText] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponses, setAiResponses] = useState({});

  function askGemini(question, selectedAnswer, correctAnswer, justification, idx) {
    if (aiResponses[idx] || aiLoading) return;
    setAiLoading(true);
    var prompt = "Eres un tutor experto en oposiciones españolas. Un alumno ha fallado esta pregunta de test. Explícale de forma clara, breve (máximo 4-5 frases) y didáctica por qué la respuesta correcta es la que es y por qué la que eligió es incorrecta. Usa un tono cercano y motivador.\n\n" +
      "PREGUNTA: " + question.text + "\n" +
      "OPCIONES: " + question.options.map(function(o, i) { return String.fromCharCode(65 + i) + ") " + o; }).join(" | ") + "\n" +
      "RESPUESTA DEL ALUMNO: " + (selectedAnswer !== undefined ? String.fromCharCode(65 + selectedAnswer) + ") " + question.options[selectedAnswer] : "En blanco") + "\n" +
      "RESPUESTA CORRECTA: " + String.fromCharCode(65 + question.correct) + ") " + question.options[question.correct] + "\n" +
      "JUSTIFICACIÓN OFICIAL: " + (justification || "No disponible");

    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.REACT_APP_GEMINI_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var text = "";
      try { text = data.candidates[0].content.parts[0].text; } catch(e) { text = "No se pudo obtener la explicación. Inténtalo de nuevo."; }
      setAiResponses(function(prev) { var n = Object.assign({}, prev); n[idx] = text; return n; });
    })
    .catch(function() {
      setAiResponses(function(prev) { var n = Object.assign({}, prev); n[idx] = "Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo."; return n; });
    })
    .finally(function() { setAiLoading(false); });
  }

  useEffect(function() {
    if (step === "test" && t0) {
      var t = setInterval(function() { setEl(Math.floor((Date.now() - t0) / 1000)); }, 1000);
      return function() { clearInterval(t); };
    }
  }, [step, t0]);

  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }

  function getTopics() {
    if (!so) return [];
    var o = oposiciones.find(function(x) { return x.id === so; });
    if (!o) return [];
    if (tf === "common") return o.commonTopics.map(function(t) { return { n: t, tp: "common" }; });
    if (tf === "specific") return o.specificTopics.map(function(t) { return { n: t, tp: "specific" }; });
    return o.commonTopics.map(function(t) { return { n: t, tp: "common" }; }).concat(o.specificTopics.map(function(t) { return { n: t, tp: "specific" }; }));
  }

  function getPool() {
    var p = allQ.filter(function(q) { return q.opoId === so; });
    if (stps.length) p = p.filter(function(q) { return stps.indexOf(q.topic) >= 0; });
    else if (tf !== "all") p = p.filter(function(q) { return q.type === tf; });
    return p;
  }

  function start() {
    var pool = getPool();
    var sh = pool.slice().sort(function() { return Math.random() - 0.5; }).slice(0, nq);
    if (!sh.length) return;
    setTqs(sh); setAns({}); setDoubts({}); setCi(0); setT0(Date.now()); setEl(0); setStep("test");
  }

  async function sendReport(questionId) {
    if (!reportText.trim()) return;
    var { data } = await supabase.from("reports").insert({
      user_id: user.id, question_id: questionId, reason: reportText.trim()
    }).select().single();
    if (data) {
      setReports(reports.concat([{ id: data.id, userId: user.id, questionId: questionId, reason: reportText.trim(), date: data.date, resolved: false }]));
    }
    setReportSent(true);
    setReportText("");
    setTimeout(function() { setReportSent(false); setShowReport(null); }, 2000);
  }

  async function finish() {
    var tt2 = Math.floor((Date.now() - t0) / 1000);
    var correct = 0;
    var incorrect = 0;
    var blank = 0;
    var doubtOk = 0;
    var doubtFail = 0;
    var doubtBlank = 0;
    tqs.forEach(function(q, i) {
      var answered = ans[i] !== undefined;
      var isRight = ans[i] === q.correct;
      var isDoubt = !!doubts[i];
      if (isDoubt) {
        if (!answered) doubtBlank++;
        else if (isRight) doubtOk++;
        else doubtFail++;
      } else {
        if (!answered) blank++;
        else if (isRight) correct++;
        else incorrect++;
      }
    });

    // Calculate score with penalty
    var totalCorrect = correct + doubtOk;
    var totalIncorrect = incorrect + doubtFail;
    var sc;
    if (settings.penaltyEnabled && settings.penaltyValue > 0) {
      var penalizedScore = totalCorrect - (totalIncorrect * settings.penaltyValue);
      sc = Math.max(0, Math.round(penalizedScore / tqs.length * 100));
    } else {
      sc = Math.round(totalCorrect / tqs.length * 100);
    }

    var tops = []; tqs.forEach(function(q) { if (tops.indexOf(q.topic) < 0) tops.push(q.topic); });
    var details = tqs.map(function(q, i) {
      var answered = ans[i] !== undefined;
      var isRight = ans[i] === q.correct;
      var isDoubt = !!doubts[i];
      var status = "incorrect";
      if (isDoubt && !answered) status = "doubt-blank";
      else if (isDoubt && isRight) status = "doubt-ok";
      else if (isDoubt && !isRight) status = "doubt-fail";
      else if (!answered) status = "blank";
      else if (isRight) status = "correct";
      return { questionId: q.id, topic: q.topic, selected: ans[i], correct: q.correct, isCorrect: isRight, doubt: isDoubt, status: status };
    });

    // Save result to Supabase
    var { data: resData } = await supabase.from("results").insert({
      user_id: user.id, opo_id: so, score: sc, correct: correct, incorrect: incorrect,
      blank: blank, doubt_ok: doubtOk, doubt_fail: doubtFail, doubt_blank: doubtBlank,
      total_questions: tqs.length, time_seconds: tt2, topics: tops, details: details,
      penalty_applied: settings.penaltyEnabled, penalty_value: settings.penaltyValue
    }).select().single();

    var newResult = {
      id: resData ? resData.id : Date.now().toString(), userId: user.id, opoId: so, date: resData ? resData.date : new Date().toISOString(), score: sc, correct: correct, incorrect: incorrect, blank: blank, doubtOk: doubtOk, doubtFail: doubtFail, doubtBlank: doubtBlank, totalQuestions: tqs.length, timeSeconds: tt2, topics: tops, details: details,
      penaltyApplied: settings.penaltyEnabled, penaltyValue: settings.penaltyValue
    };
    setResults(results.concat([newResult]));

    // Update streak
    var today = new Date().toDateString();
    var cu = users.find(function(u) { return u.id === user.id; });
    var y = new Date(Date.now() - 86400000).toDateString();
    var ns = cu ? (cu.streak || 0) : 0;
    if (!cu || cu.lastStudyDate !== today) ns = (cu && cu.lastStudyDate === y) ? ns + 1 : 1;
    await supabase.from("users").update({ streak: ns, last_study_date: new Date().toISOString().split("T")[0] }).eq("id", user.id);
    setUsers(users.map(function(u) {
      if (u.id !== user.id) return u;
      return Object.assign({}, u, { streak: ns, lastStudyDate: today });
    }));
    setDone(true);
  }

  async function togB(id) {
    var k = user.id + "_" + id;
    if (bookmarks.indexOf(k) >= 0) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("question_id", id);
      setBookmarks(bookmarks.filter(function(b) { return b !== k; }));
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, question_id: id });
      setBookmarks(bookmarks.concat([k]));
    }
  }
  function isB(id) { return bookmarks.indexOf(user.id + "_" + id) >= 0; }

  // SETUP
  if (step === "setup") {
    var topics = getTopics();
    var av = getPool().length;
    return (
      <div className="fi">
        <div className="ph"><h2>Configurar Test</h2><p>Elige oposición, temas y preguntas</p></div>
        {settings.penaltyEnabled && (
          <div style={{ background: "var(--warn-s)", border: "1px solid var(--warn)", borderRadius: "var(--rs)", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <IC.Warn />
            <span style={{ fontSize: 14, color: "var(--warn)", fontWeight: 500 }}>Penalización activa: cada fallo resta {settings.penaltyValue} puntos</span>
          </div>
        )}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="cd"><div className="ct mb16">1. Oposición</div><div className="tg">{my.map(function(o) { return <div key={o.id} className={"tc " + (so === o.id ? "sel" : "")} onClick={function() { setSo(o.id); setStps([]); }}><span className="ck">{so === o.id && <IC.Chk />}</span>{o.name}</div>; })}</div></div>
          {so && (
            <div className="cd fi">
              <div className="ct mb16">2. Temario</div>
              <div className="tabs">
                <button className={"tab " + (tf === "all" ? "ac" : "")} onClick={function() { setTf("all"); setStps([]); }}>Todo</button>
                <button className={"tab " + (tf === "common" ? "ac" : "")} onClick={function() { setTf("common"); setStps([]); }}>Común</button>
                <button className={"tab " + (tf === "specific" ? "ac" : "")} onClick={function() { setTf("specific"); setStps([]); }}>Específico</button>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Temas concretos (opcional)</div>
              <div className="tg">{topics.map(function(t) { var sel = stps.indexOf(t.n) >= 0; return <div key={t.n} className={"tc " + (sel ? "sel" : "")} onClick={function() { setStps(sel ? stps.filter(function(x) { return x !== t.n; }) : stps.concat([t.n])); }}><span className="ck">{sel && <IC.Chk />}</span><div><div>{t.n}</div><div style={{ fontSize: 11, color: "var(--tx3)" }}>{t.tp === "common" ? "Común" : "Específico"}</div></div></div>; })}</div>
            </div>
          )}
          {so && (
            <div className="cd fi">
              <div className="ct mb16">3. Preguntas</div>
              <div className="f g8 fw">{[25, 50, 75, 100, 125, 150].map(function(n) { return <button key={n} className={"b " + (nq === n ? "bp" : "bs") + " bsm"} onClick={function() { setNq(n); }}>{n}</button>; })}</div>
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--tx3)" }}>{av} disponibles</p>
              <div style={{ marginTop: 20 }}><button className="b bp" onClick={start} disabled={!av}>Comenzar ({Math.min(nq, av)})</button></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  var q = tqs[ci];
  var ac = Object.keys(ans).length;

  // RESULTS
  if (done) {
    var lastRes = results[results.length - 1] || {};
    var sc2 = lastRes.score || 0;
    var nCorrect = lastRes.correct || 0;
    var nIncorrect = lastRes.incorrect || 0;
    var nBlank = lastRes.blank || 0;
    var nDoubtOk = lastRes.doubtOk || 0;
    var nDoubtFail = lastRes.doubtFail || 0;
    var nDoubtBlank = lastRes.doubtBlank || 0;

    if (ri !== null) {
      var rq = tqs[ri]; var ua = ans[ri]; var isDoubt = !!doubts[ri]; var answered = ua !== undefined; var isRight = ua === rq.correct;
      var statusLabel = "✗ Incorrecta"; var statusClass = "bgd";
      if (isDoubt && !answered) { statusLabel = "⚠ Dudosa (en blanco)"; statusClass = "bgw"; }
      else if (isDoubt && isRight) { statusLabel = "⚠ Dudosa (correcta)"; statusClass = "bgk"; }
      else if (isDoubt && !isRight) { statusLabel = "⚠ Dudosa (fallada)"; statusClass = "bgw"; }
      else if (!answered) { statusLabel = "— En blanco"; statusClass = "bgw"; }
      else if (isRight) { statusLabel = "✓ Correcta"; statusClass = "bgk"; }

      var alreadyReported = reports.some(function(r) { return r.questionId === rq.id && r.userId === user.id; });

      return (
        <div className="fi">
          <button className="b bg" onClick={function() { setRi(null); }} style={{ marginBottom: 20 }}><IC.Lt /> Volver</button>
          <div className="qc">
            <div className="f jb2 ic mb12">
              <span className="qn">Pregunta {ri + 1}/{tqs.length}</span>
              <div className="f ic g8">
                <span className={"bg2 " + statusClass}>{statusLabel}</span>
                <button className="b bg bsm" onClick={function() { togB(rq.id); }}>{isB(rq.id) ? <IC.BmF /> : <IC.Bm />}</button>
                {!alreadyReported && (
                  <button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { setShowReport(rq.id); }}><IC.Flag /> Reportar</button>
                )}
                {alreadyReported && (
                  <span style={{ fontSize: 11, color: "var(--tx3)", fontStyle: "italic" }}>Reportada</span>
                )}
              </div>
            </div>
            <div className="qt">{rq.text}</div>
            <div className="ol">
              {rq.options.map(function(o, oi) {
                var cl = "ob";
                if (oi === rq.correct) cl += " ok";
                else if (answered && oi === ua && !isRight) cl += " no";
                return <div key={oi} className={cl}><span className="olet">{String.fromCharCode(65 + oi)}</span><span>{o}</span>{oi === rq.correct ? <span style={{ marginLeft: "auto" }}><IC.Chk /></span> : null}{answered && oi === ua && !isRight ? <span style={{ marginLeft: "auto" }}><IC.X /></span> : null}</div>;
              })}
            </div>
            {(!isRight || (isDoubt && !answered)) && rq.justification ? <div className="jb"><b>Justificación:</b> {rq.justification}</div> : null}
            {(!isRight || (isDoubt && !answered)) && (
              <div style={{ marginTop: 14 }}>
                {!aiResponses[ri] ? (
                  <button className="b bp bsm" onClick={function() { askGemini(rq, ua, rq.correct, rq.justification, ri); }} disabled={aiLoading} style={{ background: "linear-gradient(135deg, #4285F4, #34A853)", border: "none" }}>
                    <IC.Bot /> {aiLoading ? "Pensando..." : "Explicar con IA"}
                  </button>
                ) : (
                  <div className="fi" style={{ background: "linear-gradient(135deg, #EEF4FF, #F0FFF4)", border: "1px solid #C6DBEF", borderRadius: "var(--rs)", padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <IC.Bot />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#4285F4" }}>Tutor IA</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--tx)", whiteSpace: "pre-wrap" }}>{aiResponses[ri]}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="f g8 jb2"><button className="b bs" disabled={ri === 0} onClick={function() { setRi(ri - 1); }}>Anterior</button><button className="b bs" disabled={ri === tqs.length - 1} onClick={function() { setRi(ri + 1); }}>Siguiente</button></div>

          {/* Report Modal */}
          {showReport && (
            <div className="mo" onClick={function() { setShowReport(null); setReportText(""); }}>
              <div className="md fi" onClick={function(e) { e.stopPropagation(); }}>
                {reportSent ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Reporte enviado</p>
                    <p style={{ color: "var(--tx2)", fontSize: 14 }}>El equipo de Cierzo revisará tu reporte. ¡Gracias!</p>
                  </div>
                ) : (
                  <div>
                    <h3><IC.Flag /> Reportar pregunta errónea</h3>
                    <div style={{ background: "var(--sf2)", borderRadius: "var(--rs)", padding: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>{rq.topic}</div>
                      <div style={{ fontSize: 14 }}>{rq.text}</div>
                    </div>
                    <div className="fd">
                      <label>¿Qué problema tiene la pregunta?</label>
                      <textarea value={reportText} onChange={function(e) { setReportText(e.target.value); }} placeholder="Ej: La respuesta correcta debería ser la B según el Art. 27 CE..." rows={4} />
                    </div>
                    <div className="ma">
                      <button className="b bs" onClick={function() { setShowReport(null); setReportText(""); }}>Cancelar</button>
                      <button className="b bdanger" onClick={function() { sendReport(rq.id); }} disabled={!reportText.trim()}><IC.Flag /> Enviar reporte</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="fi">
        <div className="rh">
          <p style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 8 }}>Tu resultado</p>
          <div className={"rs " + (sc2 >= 70 ? "g" : sc2 >= 50 ? "m" : "bad")}>{sc2}%</div>
          <p style={{ fontSize: 16, color: "var(--tx2)" }}>{sc2 >= 80 ? "¡Excelente!" : sc2 >= 60 ? "¡Bien, sigue así!" : "Necesitas repasar"}</p>
          {lastRes.penaltyApplied && (
            <p style={{ fontSize: 12, color: "var(--warn)", marginTop: 8 }}>⚠ Penalización aplicada ({lastRes.penaltyValue} por fallo)</p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--ok)" }}>{nCorrect}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Aciertos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--err)" }}>{nIncorrect}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Fallos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--tx3)" }}>{nBlank}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>En blanco</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--ok)" }}>{nDoubtOk}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Dudosa OK</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--warn)" }}>{nDoubtFail}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Dudosa Mal</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "var(--warn)" }}>{nDoubtBlank}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Dudosa Blanco</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(el)}</div><div style={{ fontSize: 12, color: "var(--tx3)" }}>Tiempo</div></div>
          </div>
        </div>
        <div className="cd mb20">
          <div className="ct mb16">Revisa respuestas</div>
          <div className="qmg">{tqs.map(function(qq, i) {
            var answered2 = ans[i] !== undefined;
            var isRight2 = ans[i] === qq.correct;
            var isDoubt2 = !!doubts[i];
            var bg = "var(--err-s)"; var bc = "var(--err)"; var co = "var(--err)";
            if (isDoubt2 && !answered2) { bg = "var(--warn-s)"; bc = "var(--warn)"; co = "var(--warn)"; }
            else if (isDoubt2 && isRight2) { bg = "var(--ok-s)"; bc = "var(--ok)"; co = "var(--ok)"; }
            else if (isDoubt2) { bg = "var(--warn-s)"; bc = "var(--warn)"; co = "var(--warn)"; }
            else if (!answered2) { bg = "var(--sf2)"; bc = "var(--bd2)"; co = "var(--tx3)"; }
            else if (isRight2) { bg = "var(--ok-s)"; bc = "var(--ok)"; co = "var(--ok)"; }
            return <button key={i} className="qm" style={{ background: bg, borderColor: bc, color: co }} onClick={function() { setRi(i); }}>{i + 1}</button>;
          })}</div>
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--tx3)" }}>🟢 Acierto · 🔴 Fallo · ⚪ Blanco · 🟡 Dudosa — Clic para ver detalle</p>
        </div>
        <div className="f g12"><button className="b bp" onClick={function() { setStep("setup"); setDone(false); setTqs([]); }}>Nuevo test</button><button className="b bs" onClick={function() { setView("dashboard"); }}>Volver</button></div>
      </div>
    );
  }

  // ACTIVE TEST
  return (
    <div className="fi">
      <div className="tp">
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tx2)", whiteSpace: "nowrap" }}>{ac}/{tqs.length}</span>
        <div className="pbw"><div className="pbf" style={{ width: (ac / tqs.length * 100) + "%" }} /></div>
        <div className="tmr"><IC.Clk />{fmt(el)}</div>
      </div>
      <div className="qc">
        <div className="f jb2 ic mb12">
          <span className="qn">Pregunta {ci + 1}/{tqs.length}</span>
          <div className="f ic g8">
            <span className="bg2 bgi">{q.topic}</span>
            <button type="button" style={{padding:"4px 10px",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",border:doubts[ci]?"1.5px solid var(--warn)":"1.5px solid var(--bd)",background:doubts[ci]?"var(--warn-s)":"var(--sf)",color:doubts[ci]?"var(--warn)":"var(--tx3)",fontFamily:"var(--f)"}} onClick={function(){var nd=Object.assign({},doubts);if(nd[ci])delete nd[ci];else nd[ci]=true;setDoubts(nd);}}>⚠ {doubts[ci]?"Dudosa":"Marcar dudosa"}</button>
            <button className="b bg bsm" onClick={function() { togB(q.id); }}>{isB(q.id) ? <IC.BmF /> : <IC.Bm />}</button>
          </div>
        </div>
        <div className="qt">{q.text}</div>
        <div className="ol">
          {q.options.map(function(o, oi) {
            return <button key={oi} className={"ob " + (ans[ci] === oi ? "sel" : "")} onClick={function() { if (!done) { var newAns = Object.assign({}, ans); newAns[ci] = oi; setAns(newAns); } }}><span className="olet">{String.fromCharCode(65 + oi)}</span><span>{o}</span></button>;
          })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
        <button className="b bs" disabled={ci === 0} onClick={function() { setCi(ci - 1); }}><IC.Lt /> Ant.</button>
        <div className="qmg">{tqs.map(function(_, i) { return <button key={i} className={"qm " + (i === ci ? "cu" : ans[i] !== undefined ? "aw" : "")} onClick={function() { setCi(i); }}>{i + 1}</button>; })}</div>
        {ci < tqs.length - 1
          ? <button className="b bp" onClick={function() { setCi(ci + 1); }}>Sig. <IC.Rt /></button>
          : <button className="b bk" onClick={finish}>Finalizar</button>
        }
      </div>
    </div>
  );
}

/* ====== STUDENT STATS ====== */
function SStats({ user }) {
  const { results, oposiciones } = useStore();
  var mr = results.filter(function(r) { return r.userId === user.id; });
  const [so, setSo] = useState("all");
  var fl = so === "all" ? mr : mr.filter(function(r) { return r.opoId === so; });

  var tm = {};
  fl.forEach(function(r) { (r.details || []).forEach(function(d) { if (!tm[d.topic]) tm[d.topic] = { c: 0, t: 0 }; tm[d.topic].t++; if (d.isCorrect) tm[d.topic].c++; }); });
  var ts = Object.keys(tm).map(function(n) { return { n: n, p: Math.round(tm[n].c / tm[n].t * 100), t: tm[n].t }; }).sort(function(a, b) { return a.p - b.p; });

  return (
    <div className="fi">
      <div className="ph"><h2>Estadísticas</h2><p>Rendimiento y evolución</p></div>
      <div className="f g12 mb20">
        <button className={"b " + (so === "all" ? "bp" : "bs") + " bsm"} onClick={function() { setSo("all"); }}>Todas</button>
        {oposiciones.filter(function(o) { return (user.assignedOpos || []).indexOf(o.id) >= 0; }).map(function(o) {
          return <button key={o.id} className={"b " + (so === o.id ? "bp" : "bs") + " bsm"} onClick={function() { setSo(o.id); }}>{o.name}</button>;
        })}
      </div>
      <div className="g2">
        <div className="cd">
          <div className="ct mb16">Por tema</div>
          {ts.length === 0 ? <div className="es"><p>Haz tests para ver datos</p></div> : ts.map(function(t) {
            return <div key={t.n} className="tpi"><span className="tpn">{t.n} <span style={{ fontSize: 12, color: "var(--tx3)" }}>({t.t})</span></span><div className="tpb"><div className="tpfl" style={{ width: t.p + "%", background: t.p >= 70 ? "var(--ok)" : t.p >= 50 ? "var(--warn)" : "var(--err)" }} /></div><span className="tpp" style={{ color: t.p >= 70 ? "var(--ok)" : t.p >= 50 ? "var(--warn)" : "var(--err)" }}>{t.p}%</span></div>;
          })}
        </div>
        <div className="cd">
          <div className="ct mb16">Evolución</div>
          {fl.length === 0 ? <div className="es"><p>Sin datos</p></div> : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, padding: "10px 0" }}>
              {fl.slice(-10).map(function(r, i) {
                return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: r.score >= 70 ? "var(--ok)" : r.score >= 50 ? "var(--warn)" : "var(--err)" }}>{r.score}%</span><div style={{ width: "100%", height: Math.max(r.score, 5) + "%", background: r.score >= 70 ? "var(--ok)" : r.score >= 50 ? "var(--warn)" : "var(--err)", borderRadius: "4px 4px 0 0", opacity: 0.7, minHeight: 4 }} /><span style={{ fontSize: 10, color: "var(--tx3)" }}>{new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}</span></div>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== STUDENT HISTORY ====== */
function SHist({ user }) {
  const { results, oposiciones } = useStore();
  var mr = results.filter(function(r) { return r.userId === user.id; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  return (
    <div className="fi">
      <div className="ph"><h2>Historial</h2><p>Todos tus tests</p></div>
      <div className="cd">
        {mr.length === 0 ? <div className="es"><IC.Hist /><p>Sin tests</p></div> : (
          <table><thead><tr><th>Fecha</th><th>Oposición</th><th>Resultado</th><th>Tiempo</th><th></th></tr></thead><tbody>
            {mr.map(function(r) {
              var o = oposiciones.find(function(x) { return x.id === r.opoId; });
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>{o ? o.name : "—"}</td>
                  <td>
                    <span style={{ color: "var(--ok)" }}>{r.correct}</span>/{r.totalQuestions} <span className={"bg2 " + (r.score >= 70 ? "bgk" : r.score >= 50 ? "bgw" : "bgd")}>{r.score}%</span>
                    {r.penaltyApplied && <span style={{ fontSize: 10, color: "var(--warn)", marginLeft: 4 }}>⚠</span>}
                  </td>
                  <td style={{ fontFamily: "var(--m)", fontSize: 13 }}>{Math.floor(r.timeSeconds / 60)}:{String(r.timeSeconds % 60).padStart(2, "0")}</td>
                  <td>{r.penaltyApplied && <span style={{ fontSize: 11, color: "var(--warn)" }}>pen. {r.penaltyValue}</span>}</td>
                </tr>
              );
            })}
          </tbody></table>
        )}
      </div>
    </div>
  );
}

/* ====== STUDENT BOOKMARKS ====== */
function SBookmarks({ user }) {
  const { bookmarks, setBookmarks, questions, supabase } = useStore();
  var ids = bookmarks.filter(function(b) { return b.indexOf(user.id + "_") === 0; }).map(function(b) { return b.split("_")[1]; });
  var bqs = questions.filter(function(q) { return ids.indexOf(q.id) >= 0; });

  async function removeBm(qid) {
    await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("question_id", qid);
    setBookmarks(bookmarks.filter(function(b) { return b !== user.id + "_" + qid; }));
  }

  return (
    <div className="fi">
      <div className="ph"><h2>Guardadas</h2><p>Preguntas marcadas</p></div>
      {bqs.length === 0 ? <div className="cd"><div className="es"><IC.Bm /><p>Marca preguntas en los tests</p></div></div> : (
        <div style={{ display: "grid", gap: 12 }}>
          {bqs.map(function(q) {
            return (
              <div key={q.id} className="cd" style={{ padding: 20 }}>
                <div className="f jb2 ic mb12"><span className="bg2 bgi">{q.topic}</span><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { removeBm(q.id); }}><IC.Del /></button></div>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>{q.text}</p>
                <div style={{ display: "grid", gap: 6 }}>
                  {q.options.map(function(o, i) {
                    return <div key={i} style={{ padding: "8px 14px", borderRadius: "var(--rs)", fontSize: 14, background: i === q.correct ? "var(--ok-s)" : "var(--sf2)", color: i === q.correct ? "var(--ok)" : "var(--tx2)", fontWeight: i === q.correct ? 600 : 400 }}>{String.fromCharCode(65 + i)}. {o}</div>;
                  })}
                </div>
                {q.justification && <div className="jb" style={{ marginTop: 10 }}>{q.justification}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ====== INNER APP ====== */
function Inner() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");

  if (!user) {
    return <Login onLogin={function(u) { setUser(u); setView("dashboard"); }} />;
  }

  var Page;
  if (user.role === "admin") {
    if (view === "students") Page = AStudents;
    else if (view === "oposiciones") Page = AOpos;
    else if (view === "questions") Page = AQuestions;
    else if (view === "generate") Page = AGenerate;
    else if (view === "reports") Page = AReports;
    else if (view === "settings") Page = ASettings;
    else Page = ADash;
  } else {
    if (view === "test") Page = function() { return <STest user={user} setView={setView} />; };
    else if (view === "stats") Page = function() { return <SStats user={user} />; };
    else if (view === "history") Page = function() { return <SHist user={user} />; };
    else if (view === "bookmarks") Page = function() { return <SBookmarks user={user} />; };
    else if (view === "profile") Page = function() { return <SProfile user={user} />; };
    else Page = function() { return <SDash user={user} />; };
  }

  return (
    <div className="al">
      <Side user={user} view={view} setView={setView} logout={function() { setUser(null); setView("dashboard"); }} />
      <div className="mc"><Page /></div>
    </div>
  );
}

/* ====== MAIN ====== */
export default function App() {
  return (
    <Store>
      <style>{CSS}</style>
      <Inner />
    </Store>
  );
}
