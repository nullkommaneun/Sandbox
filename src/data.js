export async function loadCsv(path){
  const res = await fetch(path, { cache:'no-cache' });
  if(!res.ok) throw new Error('CSV nicht gefunden: '+path);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const header = lines[0].split(',').map(s=>s.trim());
  const rows = [];
  for(let i=1;i<lines.length;i++){
    const parts = lines[i].split(',');
    const o = {};
    for(let j=0;j<header.length;j++){
      const k = header[j];
      o[k] = (k==='date') ? new Date(parts[j]) : Number(parts[j]);
    }
    rows.push(o);
  }
  rows.sort((a,b)=> a.date - b.date);
  return rows;
}

// As-of merge with forward-fill on right dataset
export function mergeOnDate(left, right){
  const rmap = new Map(right.map(r=>[r.date.toISOString().slice(0,10), r]));
  let last = {};
  const out = [];
  for(const l of left){
    const key = l.date.toISOString().slice(0,10);
    if(rmap.has(key)) last = rmap.get(key);
    out.push({ ...l, ...last });
  }
  return out;
}
