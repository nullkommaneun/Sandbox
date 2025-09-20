import { State } from './state.js';
import { step } from './loop.js';
import { selfTests } from './tests.js';
import { download, sha256, fmtArr } from './util.js';

function q(id){ return document.getElementById(id); }

export class App {
  constructor(){
    this.ui = {
      status: q('status'), gen: q('gen'), fit: q('fit'), log: q('log'),
      toggle: q('toggle'), step: q('step'), export: q('export'), reset: q('reset'),
      dims: q('dims'), mut: q('mut'), mutv: q('mutv'), targetPreview: q('targetPreview'),
      randTarget: q('randTarget'), diag: q('diag')
    };
    this.timer = null;
  }

  async init(){
    State.load();
    this.bind();
    const t = await selfTests();
    this.setStatus(t.ok ? 'Bereit.' : 'Selbsttest fehlgeschlagen');
    // UI Werte initialisieren
    this.ui.dims.value = State.data.nDims;
    this.ui.mut.value = State.data.mutationRate;
    this.ui.mutv.textContent = State.data.mutationRate.toFixed(3);
    this.renderTarget();
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

    this.ui.dims.onchange = () => {
      const n = Number(this.ui.dims.value);
      State.setDims(n);
      this.renderTarget();
      this.refresh();
      this.log('Dimensionen gesetzt: ' + n);
    };
    this.ui.mut.oninput = () => {
      const m = Number(this.ui.mut.value);
      State.setMutation(m);
      this.ui.mutv.textContent = m.toFixed(3);
    };
    this.ui.randTarget.onclick = () => {
      State.randomizeTarget();
      this.renderTarget();
      this.refresh();
      this.log('Zielvektor zufällig neu gesetzt.');
    };

    this.ui.export.onclick = () => this.exportBest();
  }

  run(){ clearInterval(this.timer); this.timer = setInterval(()=>{ step(State.data); this.afterTick(); }, 50); }

  async exportBest(){
    const best = State.data.best;
    if(!best.genome){ this.log('Kein Ergebnis vorhanden.'); return; }
    const payload = {
      ts: new Date().toISOString(),
      fitness: Number(best.fitness.toFixed(6)),
      genome: best.genome,
      target: State.data.target,
      nDims: State.data.nDims,
      mutationRate: State.data.mutationRate,
      version: State.data.version
    };
    const line = JSON.stringify(payload);
    const h = await sha256(line);
    const name = `best-${payload.ts.replace(/[:.]/g,'-')}-${h.slice(0,8)}.jsonl`;
    download(name, line + '\n');
    this.log(`Exportiert: ${name}`);
  }

  renderTarget(){ this.ui.targetPreview.textContent = fmtArr(State.data.target); }

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
