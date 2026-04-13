import { useState, useEffect, useRef, createContext, useContext } from "react";

/* ====== DATA ====== */
const INIT_OPOS = [
  { id:"opo1", name:"Administrativo del Estado", commonTopics:["Constitución Española","Organización del Estado","Derecho Administrativo","Procedimiento Administrativo","Hacienda Pública"], specificTopics:["Gestión de Personal","Contratación Pública","Gestión Financiera","Ofimática","Atención al Ciudadano"] },
  { id:"opo2", name:"Auxiliar Administrativo", commonTopics:["Constitución Española","Organización del Estado","Derecho Administrativo"], specificTopics:["Ofimática Básica","Atención al Público","Archivo y Documentación"] },
];
const INIT_USERS = [
  { id:"admin1", username:"admin", password:"admin123", role:"admin", name:"Administrador" },
  { id:"stu1", username:"alumno1", password:"1234", role:"student", name:"María García", assignedOpos:["opo1"], streak:3, lastStudyDate:null },
  { id:"stu2", username:"alumno2", password:"1234", role:"student", name:"Carlos López", assignedOpos:["opo1","opo2"], streak:7, lastStudyDate:null },
];
const INIT_QS = [
  { id:"q1", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿En qué año se aprobó la Constitución Española vigente?", options:["1975","1978","1982","1986"], correct:1, justification:"Aprobada en referéndum el 6 de diciembre de 1978." },
  { id:"q2", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿Cuántos títulos tiene la CE (incluyendo el Preliminar)?", options:["8","10","11"], correct:2, justification:"Título Preliminar + 10 Títulos = 11." },
  { id:"q3", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿Cuál es la forma política del Estado español?", options:["República parlamentaria","Monarquía absoluta","Monarquía parlamentaria","Estado federal"], correct:2, justification:"Art. 1.3 CE: Monarquía parlamentaria." },
  { id:"q4", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿Qué artículo recoge el derecho a la educación?", options:["Art. 14","Art. 27","Art. 35","Art. 43"], correct:1, justification:"Art. 27 CE." },
  { id:"q5", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿Qué Título de la CE regula la Corona?", options:["Título I","Título II","Título III","Título IV"], correct:1, justification:"Título II (Arts. 56-65)." },
  { id:"q6", opoId:"opo1", topic:"Constitución Española", type:"common", text:"¿Cuántos artículos tiene la CE?", options:["155","169","178","201"], correct:1, justification:"169 artículos." },
  { id:"q7", opoId:"opo1", topic:"Organización del Estado", type:"common", text:"¿Quién ejerce la potestad legislativa?", options:["El Gobierno","Las Cortes Generales","El TC","El Rey"], correct:1, justification:"Art. 66.2 CE." },
  { id:"q8", opoId:"opo1", topic:"Organización del Estado", type:"common", text:"¿Cuántos diputados tiene el Congreso?", options:["300","350","400","450"], correct:1, justification:"350 actualmente (Art. 68.1 CE)." },
  { id:"q9", opoId:"opo1", topic:"Organización del Estado", type:"common", text:"¿Quién nombra al Presidente del Gobierno?", options:["Las Cortes","El Congreso","El Rey","El TC"], correct:2, justification:"Art. 62.d CE." },
  { id:"q10", opoId:"opo1", topic:"Organización del Estado", type:"common", text:"¿Órgano de gobierno del Poder Judicial?", options:["Tribunal Supremo","CGPJ","Minist. Justicia","TC"], correct:1, justification:"Art. 122.2 CE." },
  { id:"q11", opoId:"opo1", topic:"Derecho Administrativo", type:"common", text:"¿Ley del Procedimiento Administrativo Común?", options:["Ley 30/1992","Ley 39/2015","Ley 40/2015","Ley 29/1998"], correct:1, justification:"Ley 39/2015." },
  { id:"q12", opoId:"opo1", topic:"Derecho Administrativo", type:"common", text:"¿Plazo máximo general para resolver un procedimiento?", options:["1 mes","3 meses","6 meses","1 año"], correct:1, justification:"Art. 21.3 Ley 39/2015." },
  { id:"q13", opoId:"opo1", topic:"Derecho Administrativo", type:"common", text:"¿Recurso contra actos que agotan la vía administrativa?", options:["Alzada","Reposición","Revisión","Queja"], correct:1, justification:"Art. 123 Ley 39/2015." },
  { id:"q14", opoId:"opo1", topic:"Procedimiento Administrativo", type:"common", text:"¿Plazo del recurso de alzada contra acto expreso?", options:["10 días","15 días","1 mes","3 meses"], correct:2, justification:"Art. 122 Ley 39/2015." },
  { id:"q15", opoId:"opo1", topic:"Procedimiento Administrativo", type:"common", text:"¿Qué actos admiten revisión de oficio?", options:["Anulables","Nulos de pleno derecho","Cualquier acto","Solo firmes"], correct:1, justification:"Art. 106 Ley 39/2015." },
  { id:"q16", opoId:"opo1", topic:"Hacienda Pública", type:"common", text:"¿Ley General Presupuestaria vigente?", options:["Ley 47/2003","Ley 58/2003","Ley 38/2003","Ley 11/2020"], correct:0, justification:"Ley 47/2003." },
  { id:"q17", opoId:"opo1", topic:"Hacienda Pública", type:"common", text:"¿Quién elabora los PGE?", options:["Las Cortes","El Gobierno","Tribunal de Cuentas","Banco de España"], correct:1, justification:"Art. 134.1 CE." },
  { id:"q18", opoId:"opo1", topic:"Gestión de Personal", type:"specific", text:"¿Norma que regula el TREBEP?", options:["Ley 7/2007","RDL 5/2015","Ley 30/1984","Ley 39/2015"], correct:1, justification:"RDL 5/2015." },
  { id:"q19", opoId:"opo1", topic:"Gestión de Personal", type:"specific", text:"¿Grupos de clasificación del TREBEP?", options:["A1, A2, B, C1, C2","A, B, C, D, E","I a V","Superior/Medio/Aux"], correct:0, justification:"Art. 76 TREBEP." },
  { id:"q20", opoId:"opo1", topic:"Gestión de Personal", type:"specific", text:"¿Días de vacaciones de un funcionario?", options:["20 hábiles","22 hábiles","30 naturales","25 hábiles"], correct:1, justification:"Art. 50 TREBEP." },
  { id:"q21", opoId:"opo1", topic:"Contratación Pública", type:"specific", text:"¿Umbral contratos menores de servicios?", options:["15.000 eur","18.000 eur","40.000 eur","50.000 eur"], correct:0, justification:"Art. 118 Ley 9/2017." },
  { id:"q22", opoId:"opo1", topic:"Contratación Pública", type:"specific", text:"¿Umbral contratos menores de obras?", options:["15.000 eur","40.000 eur","50.000 eur","80.000 eur"], correct:1, justification:"Art. 118 Ley 9/2017." },
  { id:"q23", opoId:"opo1", topic:"Contratación Pública", type:"specific", text:"¿Ley de Contratos del Sector Público?", options:["Ley 30/2007","Ley 9/2017","Ley 3/2011","RDL 3/2020"], correct:1, justification:"Ley 9/2017." },
  { id:"q24", opoId:"opo1", topic:"Gestión Financiera", type:"specific", text:"¿Principio de anualidad presupuestaria?", options:["Gastos en año natural","Presupuestos bienales","Créditos se trasladan","Ingresos mensuales"], correct:0, justification:"Art. 34 LGP." },
  { id:"q25", opoId:"opo1", topic:"Ofimática", type:"specific", text:"¿Función Excel que busca en primera columna?", options:["BUSCARH","BUSCARV","INDICE","COINCIDIR"], correct:1, justification:"BUSCARV." },
  { id:"q26", opoId:"opo1", topic:"Ofimática", type:"specific", text:"¿Extensión estándar de Word?", options:[".doc",".docx",".odt",".rtf"], correct:1, justification:".docx desde 2007." },
  { id:"q27", opoId:"opo2", topic:"Constitución Española", type:"common", text:"¿Idioma oficial del Estado?", options:["Español y cooficiales","El castellano","El español","Todas las lenguas"], correct:1, justification:"Art. 3.1 CE." },
  { id:"q28", opoId:"opo2", topic:"Constitución Española", type:"common", text:"¿Artículo de libertad de expresión?", options:["Art. 14","Art. 18","Art. 20","Art. 24"], correct:2, justification:"Art. 20 CE." },
  { id:"q29", opoId:"opo2", topic:"Organización del Estado", type:"common", text:"¿Cámaras de las Cortes Generales?", options:["Una","Dos","Tres","Cuatro"], correct:1, justification:"Congreso y Senado (Art. 66.1 CE)." },
  { id:"q30", opoId:"opo2", topic:"Derecho Administrativo", type:"common", text:"¿Qué es un acto administrativo?", options:["Ley parlamentaria","Declaración de voluntad de la Administración","Contrato privado","Sentencia judicial"], correct:1, justification:"Declaración de voluntad de la Administración." },
  { id:"q31", opoId:"opo2", topic:"Ofimática Básica", type:"specific", text:"¿Atajo para copiar en Windows?", options:["Ctrl+V","Ctrl+C","Ctrl+X"], correct:1, justification:"Ctrl+C." },
  { id:"q32", opoId:"opo2", topic:"Ofimática Básica", type:"specific", text:"¿Atajo para deshacer?", options:["Ctrl+Z","Ctrl+Y","Ctrl+D","Ctrl+R"], correct:0, justification:"Ctrl+Z." },
  { id:"q33", opoId:"opo2", topic:"Ofimática Básica", type:"specific", text:"¿Programa de hojas de cálculo?", options:["Word","PowerPoint","Excel","Access"], correct:2, justification:"Excel." },
  { id:"q34", opoId:"opo2", topic:"Atención al Público", type:"specific", text:"¿Ley de relación electrónica con la Administración?", options:["Ley 11/2007","Ley 39/2015","Ley 40/2015","Ley 59/2003"], correct:1, justification:"Art. 14 Ley 39/2015." },
  { id:"q35", opoId:"opo2", topic:"Atención al Público", type:"specific", text:"¿Qué es el registro electrónico?", options:["Archivo físico","Plataforma documental ante la Adm.","BD de funcionarios","Libro contable"], correct:1, justification:"Art. 16 Ley 39/2015." },
  { id:"q36", opoId:"opo2", topic:"Archivo y Documentación", type:"specific", text:"¿Qué es el ENI?", options:["Archivo físico","Marco interoperabilidad AAPP","Software","Protocolo seguridad"], correct:1, justification:"RD 4/2010." },
  { id:"q37", opoId:"opo2", topic:"Archivo y Documentación", type:"specific", text:"¿Conservación de expedientes?", options:["1 año","5 años","Según normativa","Indefinidamente"], correct:2, justification:"Depende de tablas de valoración." },
];
const INIT_RES = [
  { id:"r1", userId:"stu1", opoId:"opo1", date:new Date(Date.now()-172800000).toISOString(), score:72, correct:7, incorrect:3, totalQuestions:10, timeSeconds:420, topics:["Constitución Española","Organización del Estado"], details:[] },
  { id:"r2", userId:"stu1", opoId:"opo1", date:new Date(Date.now()-86400000).toISOString(), score:80, correct:8, incorrect:2, totalQuestions:10, timeSeconds:380, topics:["Derecho Administrativo"], details:[] },
  { id:"r3", userId:"stu2", opoId:"opo1", date:new Date(Date.now()-259200000).toISOString(), score:60, correct:6, incorrect:4, totalQuestions:10, timeSeconds:500, topics:["Constitución Española"], details:[] },
  { id:"r4", userId:"stu2", opoId:"opo2", date:new Date(Date.now()-86400000).toISOString(), score:90, correct:9, incorrect:1, totalQuestions:10, timeSeconds:300, topics:["Ofimática Básica","Atención al Público"], details:[] },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

/* ====== CONTEXT ====== */
const Ctx = createContext(null);

function Store({ children }) {
  const [users, setUsers] = useState(INIT_USERS);
  const [questions, setQuestions] = useState(INIT_QS);
  const [oposiciones, setOposiciones] = useState(INIT_OPOS);
  const [results, setResults] = useState(INIT_RES);
  const [bookmarks, setBookmarks] = useState([]);

  const value = { users, setUsers, questions, setQuestions, oposiciones, setOposiciones, results, setResults, bookmarks, setBookmarks };
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
};

/* ====== CSS ====== */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--accent:#1A6B8A;--accent-l:#2BB5C6;--accent-s:#D4F1F7;--accent-bg:#EBF8FB;--ok:#059669;--ok-s:#d1fae5;--err:#dc2626;--err-s:#fee2e2;--warn:#d97706;--warn-s:#fef3c7;--bg:#F4F8FA;--sf:#fff;--sf2:#EDF2F6;--bd:#D8E2EA;--bd2:#B8C8D6;--tx:#0F1E2E;--tx2:#4A6275;--tx3:#8CA3B5;--r:10px;--rs:6px;--rl:14px;--f:'DM Sans',sans-serif;--m:'JetBrains Mono',monospace}--ok:#059669;--ok-s:#d1fae5;--err:#dc2626;--err-s:#fee2e2;--warn:#d97706;--warn-s:#fef3c7;--bg:#f8fafc;--sf:#fff;--sf2:#f1f5f9;--bd:#e2e8f0;--bd2:#cbd5e1;--tx:#0f172a;--tx2:#475569;--tx3:#94a3b8;--r:10px;--rs:6px;--rl:14px;--f:'DM Sans',sans-serif;--m:'JetBrains Mono',monospace}
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
@media(max-width:768px){.sb{display:none}.mc{margin-left:0;padding:16px}.sg{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.tg{grid-template-columns:1fr}.qc{padding:20px}.lc{padding:32px 24px}}`;

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
        <div>
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
        <p style={{ marginTop: 20, fontSize: 12, color: "var(--tx3)", textAlign: "center", lineHeight: 1.6 }}>
          Demo: <b>admin / admin123</b> | <b>alumno1 / 1234</b> | <b>alumno2 / 1234</b>
        </p>
      </div>
      <p style={{marginTop:16,color:"rgba(255,255,255,0.4)",fontSize:11,textAlign:"center"}}>Hecho con <span style={{color:"#E25555"}}>&#10084;</span> por Cierzo Formación</p>

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
  const isA = user.role === "admin";
  const nav = isA
    ? [["dashboard", "Dashboard", IC.Dash], ["students", "Alumnos", IC.Ppl], ["oposiciones", "Oposiciones", IC.Test], ["questions", "Preguntas", IC.Up]]
    : [["dashboard", "Mi Panel", IC.Dash], ["test", "Hacer Test", IC.Test], ["stats", "Estadísticas", IC.Bar], ["history", "Historial", IC.Hist], ["bookmarks", "Guardadas", IC.Bm]];

  return (
    <div className="sb">
      <div className="sbl"><img src="/logo-cierzo.png" alt="Cierzo" style={{height:36,filter:"brightness(0) invert(1)",opacity:0.9}} /></div>
      <div className="sbn">
        {nav.map(function(item) {
          var id = item[0], label = item[1], Icon = item[2];
          return <div key={id} className={"ni " + (view === id ? "ac" : "")} onClick={function() { setView(id); }}><Icon />{label}</div>;
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
  const { users, setUsers, oposiciones, results } = useStore();
  const [show, setShow] = useState(false);
  const [ed, setEd] = useState(null);
  const [fm, setFm] = useState({ name: "", username: "", password: "", assignedOpos: [] });
  const stu = users.filter(function(u) { return u.role === "student"; });

  function open(s) { setEd(s || null); setFm(s ? { name: s.name, username: s.username, password: s.password, assignedOpos: s.assignedOpos || [] } : { name: "", username: "", password: "", assignedOpos: [] }); setShow(true); }
  function save() { if (!fm.name || !fm.username || !fm.password) return; if (ed) { setUsers(users.map(function(u) { return u.id === ed.id ? Object.assign({}, u, fm) : u; })); } else { setUsers(users.concat([Object.assign({ id: uid(), role: "student", streak: 0, lastStudyDate: null }, fm)])); } setShow(false); }

  return (
    <div className="fi">
      <div className="ph f jb2 ic"><div><h2>Alumnos</h2><p>Gestiona alumnos</p></div><button className="b bp" onClick={function() { open(null); }}><IC.Plus /> Nuevo</button></div>
      <div className="cd"><table><thead><tr><th>Nombre</th><th>Usuario</th><th>Oposiciones</th><th>Tests</th><th>Media</th><th></th></tr></thead><tbody>
        {stu.map(function(s) {
          var sr = results.filter(function(r) { return r.userId === s.id; });
          var a = sr.length ? Math.round(sr.reduce(function(x, r) { return x + r.score; }, 0) / sr.length) : 0;
          return (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.name}</td>
              <td><code style={{ fontSize: 13, background: "var(--sf2)", padding: "2px 8px", borderRadius: 4 }}>{s.username}</code></td>
              <td><div className="f fw g8">{(s.assignedOpos || []).map(function(id) { var o = oposiciones.find(function(x) { return x.id === id; }); return o ? <span key={id} className="bg2 bgi">{o.name}</span> : null; })}</div></td>
              <td>{sr.length}</td>
              <td><span className={"bg2 " + (a >= 70 ? "bgk" : a >= 50 ? "bgw" : "bgd")}>{a}%</span></td>
              <td><div className="f g8"><button className="b bg bsm" onClick={function() { open(s); }}><IC.Pen /></button><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { setUsers(users.filter(function(u) { return u.id !== s.id; })); }}><IC.Del /></button></div></td>
            </tr>
          );
        })}
      </tbody></table></div>
      {show && (
        <div className="mo" onClick={function() { setShow(false); }}>
          <div className="md fi" onClick={function(e) { e.stopPropagation(); }}>
            <h3>{ed ? "Editar" : "Nuevo"} alumno</h3>
            <div className="fd"><label>Nombre</label><input value={fm.name} onChange={function(e) { setFm(Object.assign({}, fm, { name: e.target.value })); }} /></div>
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
  const { oposiciones, setOposiciones, questions } = useStore();
  const [show, setShow] = useState(false);
  const [ed, setEd] = useState(null);
  const [fm, setFm] = useState({ name: "", ct: "", st: "" });

  function open(o) { setEd(o || null); setFm(o ? { name: o.name, ct: o.commonTopics.join("\n"), st: o.specificTopics.join("\n") } : { name: "", ct: "", st: "" }); setShow(true); }
  function save() {
    if (!fm.name) return;
    var c = fm.ct.split("\n").map(function(t) { return t.trim(); }).filter(Boolean);
    var s = fm.st.split("\n").map(function(t) { return t.trim(); }).filter(Boolean);
    if (ed) { setOposiciones(oposiciones.map(function(o) { return o.id === ed.id ? Object.assign({}, o, { name: fm.name, commonTopics: c, specificTopics: s }) : o; })); }
    else { setOposiciones(oposiciones.concat([{ id: uid(), name: fm.name, commonTopics: c, specificTopics: s }])); }
    setShow(false);
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
                <div className="f g8"><button className="b bg bsm" onClick={function() { open(o); }}><IC.Pen /> Editar</button><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { setOposiciones(oposiciones.filter(function(x) { return x.id !== o.id; })); }}><IC.Del /></button></div>
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
  const { questions, setQuestions, oposiciones } = useStore();
  const [fo, setFo] = useState("all");
  const [sr, setSr] = useState("");
  const [imp, setImp] = useState(false);
  const [ir, setIr] = useState(null);
  const ref = useRef();

  var fq = questions.filter(function(q) { if (fo !== "all" && q.opoId !== fo) return false; if (sr && q.text.toLowerCase().indexOf(sr.toLowerCase()) < 0) return false; return true; });

  function doCSV(text) {
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
        nq.push({ id: uid(), opoId: row.oposicion_id, topic: row.tema, type: row.tipo || "common", text: row.pregunta, options: opts, correct: ci, justification: row.justificacion || "" });
        n++;
      }
      setQuestions(questions.concat(nq));
      setIr({ n: n });
    } catch (e) { setIr({ e: e.message }); }
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
                <td><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { setQuestions(questions.filter(function(x) { return x.id !== q.id; })); }}><IC.Del /></button></td>
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
  const { oposiciones, questions: allQ, results, setResults, users, setUsers, bookmarks, setBookmarks } = useStore();
  var my = oposiciones.filter(function(o) { return (user.assignedOpos || []).indexOf(o.id) >= 0; });

  const [step, setStep] = useState("setup");
  const [so, setSo] = useState(null);
  const [stps, setStps] = useState([]);
  const [tf, setTf] = useState("all");
  const [nq, setNq] = useState(10);
  const [tqs, setTqs] = useState([]);
  const [ci, setCi] = useState(0);
  const [ans, setAns] = useState({});
  const [t0, setT0] = useState(null);
  const [el, setEl] = useState(0);
  const [done, setDone] = useState(false);
  const [ri, setRi] = useState(null);

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
    setTqs(sh); setAns({}); setCi(0); setT0(Date.now()); setEl(0); setStep("test");
  }

  function finish() {
    var tt2 = Math.floor((Date.now() - t0) / 1000);
    var c = 0; tqs.forEach(function(q, i) { if (ans[i] === q.correct) c++; });
    var sc = Math.round((c / tqs.length) * 100);
    var tops = []; tqs.forEach(function(q) { if (tops.indexOf(q.topic) < 0) tops.push(q.topic); });
    var details = tqs.map(function(q, i) { return { questionId: q.id, topic: q.topic, selected: ans[i], correct: q.correct, isCorrect: ans[i] === q.correct }; });
    setResults(results.concat([{ id: uid(), userId: user.id, opoId: so, date: new Date().toISOString(), score: sc, correct: c, incorrect: tqs.length - c, totalQuestions: tqs.length, timeSeconds: tt2, topics: tops, details: details }]));
    var today = new Date().toDateString();
    setUsers(users.map(function(u) {
      if (u.id !== user.id) return u;
      var y = new Date(Date.now() - 86400000).toDateString();
      var ns = u.streak || 0;
      if (u.lastStudyDate !== today) ns = u.lastStudyDate === y ? ns + 1 : 1;
      return Object.assign({}, u, { streak: ns, lastStudyDate: today });
    }));
    setDone(true);
  }

  function togB(id) { var k = user.id + "_" + id; setBookmarks(bookmarks.indexOf(k) >= 0 ? bookmarks.filter(function(b) { return b !== k; }) : bookmarks.concat([k])); }
  function isB(id) { return bookmarks.indexOf(user.id + "_" + id) >= 0; }

  // SETUP
  if (step === "setup") {
    var topics = getTopics();
    var av = getPool().length;
    return (
      <div className="fi">
        <div className="ph"><h2>Configurar Test</h2><p>Elige oposición, temas y preguntas</p></div>
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
              <div className="f g8 fw">{[5, 10, 15, 20].map(function(n) { return <button key={n} className={"b " + (nq === n ? "bp" : "bs") + " bsm"} onClick={function() { setNq(n); }}>{n}</button>; })}</div>
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
    var c2 = 0; tqs.forEach(function(qq, i) { if (ans[i] === qq.correct) c2++; });
    var sc2 = Math.round((c2 / tqs.length) * 100);

    if (ri !== null) {
      var rq = tqs[ri]; var ua = ans[ri]; var ok = ua === rq.correct;
      return (
        <div className="fi">
          <button className="b bg" onClick={function() { setRi(null); }} style={{ marginBottom: 20 }}><IC.Lt /> Volver</button>
          <div className="qc">
            <div className="f jb2 ic mb12">
              <span className="qn">Pregunta {ri + 1}/{tqs.length}</span>
              <div className="f ic g8"><span className={"bg2 " + (ok ? "bgk" : "bgd")}>{ok ? "✓ Correcta" : "✗ Incorrecta"}</span><button className="b bg bsm" onClick={function() { togB(rq.id); }}>{isB(rq.id) ? <IC.BmF /> : <IC.Bm />}</button></div>
            </div>
            <div className="qt">{rq.text}</div>
            <div className="ol">
              {rq.options.map(function(o, oi) {
                var cl = "ob"; if (oi === rq.correct) cl += " ok"; else if (oi === ua && !ok) cl += " no";
                return <div key={oi} className={cl}><span className="olet">{String.fromCharCode(65 + oi)}</span><span>{o}</span>{oi === rq.correct && <span style={{ marginLeft: "auto" }}><IC.Chk /></span>}{oi === ua && !ok && <span style={{ marginLeft: "auto" }}><IC.X /></span>}</div>;
              })}
            </div>
            {!ok && rq.justification && <div className="jb"><b>Justificación:</b> {rq.justification}</div>}
          </div>
          <div className="f g8 jb2"><button className="b bs" disabled={ri === 0} onClick={function() { setRi(ri - 1); }}>Anterior</button><button className="b bs" disabled={ri === tqs.length - 1} onClick={function() { setRi(ri + 1); }}>Siguiente</button></div>
        </div>
      );
    }

    return (
      <div className="fi">
        <div className="rh">
          <p style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 8 }}>Tu resultado</p>
          <div className={"rs " + (sc2 >= 70 ? "g" : sc2 >= 50 ? "m" : "bad")}>{sc2}%</div>
          <p style={{ fontSize: 16, color: "var(--tx2)" }}>{sc2 >= 80 ? "¡Excelente!" : sc2 >= 60 ? "¡Bien, sigue así!" : "Necesitas repasar"}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: "var(--ok)" }}>{c2}</div><div style={{ fontSize: 13, color: "var(--tx3)" }}>Aciertos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: "var(--err)" }}>{tqs.length - c2}</div><div style={{ fontSize: 13, color: "var(--tx3)" }}>Fallos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(el)}</div><div style={{ fontSize: 13, color: "var(--tx3)" }}>Tiempo</div></div>
          </div>
        </div>
        <div className="cd mb20">
          <div className="ct mb16">Revisa respuestas</div>
          <div className="qmg">{tqs.map(function(qq, i) { var ok2 = ans[i] === qq.correct; return <button key={i} className="qm" style={{ background: ok2 ? "var(--ok-s)" : "var(--err-s)", borderColor: ok2 ? "var(--ok)" : "var(--err)", color: ok2 ? "var(--ok)" : "var(--err)" }} onClick={function() { setRi(i); }}>{i + 1}</button>; })}</div>
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
          <div className="f ic g8"><span className="bg2 bgi">{q.topic}</span><button className="b bg bsm" onClick={function() { togB(q.id); }}>{isB(q.id) ? <IC.BmF /> : <IC.Bm />}</button></div>
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
          <table><thead><tr><th>Fecha</th><th>Oposición</th><th>Resultado</th><th>Tiempo</th></tr></thead><tbody>
            {mr.map(function(r) {
              var o = oposiciones.find(function(x) { return x.id === r.opoId; });
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>{o ? o.name : "—"}</td>
                  <td><span style={{ color: "var(--ok)" }}>{r.correct}</span>/{r.totalQuestions} <span className={"bg2 " + (r.score >= 70 ? "bgk" : r.score >= 50 ? "bgw" : "bgd")}>{r.score}%</span></td>
                  <td style={{ fontFamily: "var(--m)", fontSize: 13 }}>{Math.floor(r.timeSeconds / 60)}:{String(r.timeSeconds % 60).padStart(2, "0")}</td>
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
  const { bookmarks, setBookmarks, questions } = useStore();
  var ids = bookmarks.filter(function(b) { return b.indexOf(user.id + "_") === 0; }).map(function(b) { return b.split("_")[1]; });
  var bqs = questions.filter(function(q) { return ids.indexOf(q.id) >= 0; });

  return (
    <div className="fi">
      <div className="ph"><h2>Guardadas</h2><p>Preguntas marcadas</p></div>
      {bqs.length === 0 ? <div className="cd"><div className="es"><IC.Bm /><p>Marca preguntas en los tests</p></div></div> : (
        <div style={{ display: "grid", gap: 12 }}>
          {bqs.map(function(q) {
            return (
              <div key={q.id} className="cd" style={{ padding: 20 }}>
                <div className="f jb2 ic mb12"><span className="bg2 bgi">{q.topic}</span><button className="b bg bsm" style={{ color: "var(--err)" }} onClick={function() { setBookmarks(bookmarks.filter(function(b) { return b !== user.id + "_" + q.id; })); }}><IC.Del /></button></div>
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
    else Page = ADash;
  } else {
    if (view === "test") Page = function() { return <STest user={user} setView={setView} />; };
    else if (view === "stats") Page = function() { return <SStats user={user} />; };
    else if (view === "history") Page = function() { return <SHist user={user} />; };
    else if (view === "bookmarks") Page = function() { return <SBookmarks user={user} />; };
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
