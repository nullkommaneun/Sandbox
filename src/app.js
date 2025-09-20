import { State } from './state.js';
import { step } from './loop.js';
import { selfTests } from './tests.js';
import { download, sha256 } from './util.js';

export class App{
  constructor(){
    this.ui = {
      status: document.getElementById('status'),
      gen: document.getElementById('gen'),
      fit: document.getElementById('fit'),
      log: document.getElementById('log'),
      toggle: document.getElementById('toggle'),
      step: document.getElementById('step'),
      export: document.getElementById('export'),
      reset: document.getElementById('reset'),
      diag: document.getElementById('diag')
    };
    this.timer = null;
  }

  async init(){
    State.load();
    this.bind();
    const t = await selfTests();
    this.setStatus(t.ok ? 'Bereit.' : 'Selbsttest fehlgeschlagen');
    this.refresh();
    if ('serviceWorker' in navigator && location.protocol.startsWith('https')) {
      try{ await navigator.serviceWorker.register('./sw.js'); }catch(e){ this.diag('SW: '+e.message); }
    }
  }

  bind(){
    this.ui.toggle.onclick = () => {
      State.data.running = !State.data.running;
      this.ui.toggle.textContent = State.data.running ? 'Stop' : 'Start';
      if (State.data.running) this.run(); else clearInterval(this.timer);
      State.save();
    };
    this.ui.step.onclick = () => { step(State.data); this.afterTick(); };
    this.ui.reset.onclick = () => { State.reset(); this.refresh(); this.log('Zurückgesetzt'); };
    this.ui.export.onclick = () => this.exportBest();
  }

  run(){ clearInterval(this.timer); this.timer = setInterval(()=>{ step(State.data); this.afterTick(); }, 100); }

  async exportBest(){
    const best = State.data.best;
    if(!best.genome){ this.log('Kein Ergebnis vorhanden.'); return; }
    const payload = { ts:new Date().toISOString(), fitness:Number(best.fitness.toFixed(6)), genome:best.genome, target:State.data.target, version:State.data.version };
    const line = JSON.stringify(payload);
    const h = await sha256(line);
    const name = `best-${payload.ts.replace(/[:.]/g,'-')}-${h.slice(0,8)}.jsonl`;
    download(name, line + '\n');
    this.log(`Exportiert: ${name}`);
  }

  setStatus(txt){ this.ui.status.textContent = txt; }
  diag(txt){ if(this.ui.diag) this.ui.diag.textContent = txt; }

  refresh(){
    this.ui.gen.textContent = State.data.gen;
    this.ui.fit.textContent = Number.isFinite(State.data.best.fitness) ? State.data.best.fitness.toFixed(6) : '–';
    this.ui.toggle.textContent = State.data.running ? 'Stop' : 'Start';
  }

  afterTick(){
    if (State.data.gen % 50 === 0) { this.log(`Gen ${State.data.gen} | best=${State.data.best.fitness.toFixed(6)}`); State.save(); }
    this.refresh();
  }

  log(msg){ const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`; this.ui.log.textContent = line + this.ui.log.textContent; console.log(msg); }
}
