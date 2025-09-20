// Build features and supervised target: y = return_{t+H}
function rolling(arr, w, fn){
  const out = new Array(arr.length).fill(null);
  let buf=[];
  for(let i=0;i<arr.length;i++){
    buf.push(arr[i]); if(buf.length>w) buf.shift();
    if(buf.length===w) out[i] = fn(buf);
  }
  return out;
}
const mean = a => a.reduce((s,x)=>s+x,0)/a.length;
const std  = a => { const m=mean(a); return Math.sqrt(mean(a.map(x=>(x-m)*(x-m)))); };

function rsi(close, period=14){
  const out = new Array(close.length).fill(null);
  let gains=0, losses=0;
  for(let i=1;i<close.length;i++){
    const ch = close[i]-close[i-1];
    if(i<=period){
      if(ch>=0) gains += ch; else losses += -ch;
      if(i===period){
        const rs = (losses===0) ? 100 : (gains/period)/(losses/period);
        out[i] = 100 - (100/(1+rs));
      }
    }else{
      const up = ch>0?ch:0, down = ch<0?-ch:0;
      gains = (gains*(period-1) + up)/period;
      losses = (losses*(period-1) + down)/period;
      const rs = (losses===0) ? 100 : gains/losses;
      out[i] = 100 - (100/(1+rs));
    }
  }
  return out;
}

export function buildFeatures(rows, H){
  const dates = rows.map(r=>r.date);
  const close = rows.map(r=>r.close);
  const ret1 = [null]; for(let i=1;i<close.length;i++){ ret1.push(close[i]/close[i-1]-1); }

  // Macro series (may be undefined initially)
  const dxy = rows.map(r=>r.dxy ?? null);
  const vix = rows.map(r=>r.vix ?? null);
  const oil = rows.map(r=>r.oil ?? null);
  const y10 = rows.map(r=>r.y10 ?? null);
  const yc  = rows.map(r=>r.yc_10_2 ?? null);

  const ma5  = rolling(close,5,mean);
  const ma20 = rolling(close,20,mean);
  const vol20 = rolling(ret1.slice(1),20,std); vol20.unshift(null);

  // Macro changes (5-day)
  const chg = (arr,w=5)=>{
    const out = new Array(arr.length).fill(null);
    for(let i=w;i<arr.length;i++){
      const a = arr[i], b = arr[i-w];
      if(a!=null && b!=null && b!==0) out[i] = (a/b - 1);
    }
    return out;
  };
  const dxy5 = chg(dxy,5), vix5 = chg(vix,5), oil5 = chg(oil,5), y105 = chg(y10,5), yc5 = chg(yc,5);
  const rsi14 = rsi(close,14);

  const out = [];
  for(let i=20;i<close.length-H;i++){
    const f = [
      1,                               // Bias
      ret1[i] ?? 0,
      ma5[i]!=null && ma5[i]!=0 ? (close[i]-ma5[i])/ma5[i] : 0,
      ma20[i]!=null && ma20[i]!=0 ? (close[i]-ma20[i])/ma20[i] : 0,
      vol20[i] ?? 0,
      (rsi14[i]!=null ? rsi14[i]/100 : 0),
      dxy5[i] ?? 0, vix5[i] ?? 0, oil5[i] ?? 0, y105[i] ?? 0, yc5[i] ?? 0
    ];
    const y = close[i+H]/close[i] - 1; // next-day (or 5-day) return
    out.push({ date: dates[i], close: close[i], y, features: f });
  }
  return out;
}
