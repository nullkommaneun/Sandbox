import { loadCsv, mergeOnDate } from './data.js';
import { buildFeatures } from './features.js';
import { ridgeFitPredict, walkForwardEval } from './model.js';
import { renderDual } from './chart.js';

const nf = new Intl.NumberFormat('de-DE',{maximumFractionDigits:4});
function q(id){ return document.getElementById(id); }

export class App {
  async init(){
    this.ui = {
      goldCsv: q('goldCsv'), macroCsv: q('macroCsv'),
      horizon: q('horizon'), train: q('train'), test: q('test'),
      run: q('run'), diag: q('diag'),
      pred_ret: q('pred_ret'), pred_price: q('pred_price'), pred_conf: q('pred_conf'), last_close: q('last_close'),
      m_rmse: q('m_rmse'), m_mae: q('m_mae'), m_r2: q('m_r2'), m_n: q('m_n'),
      chart: q('chart')
    };
    this.bind();
  }

  bind(){
    this.ui.run.onclick = async () => {
      try{
        this.ui.diag.textContent='';
        this.ui.run.disabled=true;

        const gold = await loadCsv(this.ui.goldCsv.value);   // [{date, close}]
        const macro = await loadCsv(this.ui.macroCsv.value); // [{date, dxy, vix, oil, y10, yc_10_2}]
        const merged = mergeOnDate(gold, macro);             // forward-fill, as-of join
        const H = Number(this.ui.horizon.value);
        const rows = buildFeatures(merged, H);

        // Eval via walk-forward
        const cfg = { horizonDays: H, trainMonths: Number(this.ui.train.value), testMonths: Number(this.ui.test.value) };
        const ev = walkForwardEval(rows, cfg); // {oos_y, oos_pred, rmse, mae, r2, n, lastModel}
        this.ui.m_rmse.textContent = nf.format(ev.rmse);
        this.ui.m_mae.textContent  = nf.format(ev.mae);
        this.ui.m_r2.textContent   = nf.format(ev.r2);
        this.ui.m_n.textContent    = String(ev.n);

        renderDual(this.ui.chart, ev.oos_y, ev.oos_pred);

        // Next-day prediction using last train window model
        const last = rows[rows.length-1];
        const lastClose = last.close;
        this.ui.last_close.textContent = nf.format(lastClose);
        const fvec = last.features; // features at t for predicting t+H
        const pred_next = ev.lastModel.predictOne(fvec);
        const conf = Math.min(1, Math.max(0, Math.abs(pred_next) * 50)); // crude scale for demo
        this.ui.pred_ret.textContent = nf.format(pred_next);
        const nextPrice = lastClose * (1 + pred_next);
        this.ui.pred_price.textContent = nf.format(nextPrice);
        this.ui.pred_conf.textContent = nf.format(conf);

      }catch(e){
        this.ui.diag.textContent = e && e.message ? e.message : String(e);
        console.error(e);
      }finally{
        this.ui.run.disabled=false;
      }
    };
  }
}
