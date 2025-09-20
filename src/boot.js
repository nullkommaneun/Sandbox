import { App } from './app.js';
window.addEventListener('error', e => { const el=document.getElementById('diag'); if(el) el.textContent='Fehler: '+(e&&e.message?e.message:e); });
window.addEventListener('unhandledrejection', e => { const el=document.getElementById('diag'); if(el) el.textContent='Promise-Fehler: '+(e&&e.reason&&e.reason.message?e.reason.message:e.reason); });
(async()=>{ const app=new App(); await app.init(); })();
