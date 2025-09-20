function transpose(A){ const m=A.length,n=A[0].length; const T=Array.from({length:n},()=>Array(m)); for(let i=0;i<m;i++) for(let j=0;j<n;j++) T[j][i]=A[i][j]; return T; }
function matmul(A,B){ const m=A.length,n=A[0].length,p=B[0].length; const C=Array.from({length:m},()=>Array(p).fill(0)); for(let i=0;i<m;i++) for(let k=0;k<n;k++){ const a=A[i][k]; for(let j=0;j<p;j++) C[i][j]+=a*B[k][j]; } return C; }
function ridge(X, y, lambda=1e-3){
  const XT = transpose(X);
  const XTX = matmul(XT, X);
  const n = XTX.length;
  for(let i=0;i<n;i++) XTX[i][i] += lambda;
  const XTy = matmul(XT, y.map(v=>[v]));
  // Solve XTX w = XTy via Gauss-Jordan (small n assumption)
  const A = Array.from({length:n}, (_,i)=> XTX[i].concat(XTy[i]));
  for(let i=0;i<n;i++){
    let piv = A[i][i]; if(Math.abs(piv)<1e-12) piv = 1e-12;
    const invp = 1/piv;
    for(let j=0;j<=n;j++) A[i][j]*=invp;
    for(let k=0;k<n;k++) if(k!==i){
      const f=A[k][i];
      for(let j=0;j<=n;j++) A[k][j]-=f*A[i][j];
    }
  }
  return A.map(r=>r[n]);
}

export function ridgeFitPredict(Xtr, ytr, Xte){
  const w = ridge(Xtr, ytr, 1e-2);
  const pred = Xte.map(row => row.reduce((s,xi,i)=> s + xi*w[i], 0));
  return { w, pred, predictOne:(row)=> row.reduce((s,xi,i)=> s + xi*w[i], 0) };
}

function toMonthIndex(d){ return d.getFullYear()*12 + d.getMonth(); }

export function walkForwardEval(rows, cfg){
  const { horizonDays=1, trainMonths=36, testMonths=6 } = cfg;
  const dates = rows.map(r=>r.date);
  const X = rows.map(r=>r.features);
  const y = rows.map(r=>r.y);

  if(rows.length<100) throw new Error('Zu wenige Daten nach Feature-Bau.');

  let startM = toMonthIndex(dates[0]);
  let endM   = toMonthIndex(dates[dates.length-1]);

  const oos_y=[], oos_pred=[];
  let lastModel = null;

  for(let m=startM+trainMonths; m+testMonths<=endM; m+=testMonths){
    const trS = dates.findIndex(d=> toMonthIndex(d) >= m - trainMonths);
    const trE = dates.findIndex(d=> toMonthIndex(d) >= m);
    const teE = dates.findIndex(d=> toMonthIndex(d) >= m + testMonths);
    const TRS = trS>=0?trS:0, TRE = trE>=0?trE:X.length, TES = TRE, TEE = teE>=0?teE:X.length;
    if(TRE-TRS<60 || TEE-TES<10) continue;

    const Xtr = X.slice(TRS, TRE), ytr = y.slice(TRS, TRE);
    const Xte = X.slice(TES, TEE), yte = y.slice(TES, TEE);
    const mdl = ridgeFitPredict(Xtr, ytr, Xte);
    lastModel = mdl;
    oos_y.push(...yte);
    oos_pred.push(...mdl.pred);
  }

  // Metrics (returns scale)
  const n = oos_y.length;
  const mae = n? oos_y.map((v,i)=>Math.abs(v - oos_pred[i])).reduce((s,x)=>s+x,0)/n : 0;
  const rmse = n? Math.sqrt(oos_y.map((v,i)=>{const e=v-oos_pred[i]; return e*e;}).reduce((s,x)=>s+x,0)/n) : 0;
  const r2 = n? 1 - (oos_y.map((v,i)=>{const e=v-oos_pred[i]; return e*e;}).reduce((s,x)=>s+x,0) /
                    (oos_y.map((v)=>{const m=oos_y.reduce((s,x)=>s+x,0)/n; return (v-m)*(v-m);}).reduce((s,x)=>s+x,0) || 1e-12)) : 0;

  return { oos_y, oos_pred, rmse, mae, r2, n, lastModel };
}
