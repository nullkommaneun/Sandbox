export async function selfTests(){
  let rngOk=true,jsonOk=false,storageOk=false;
  try{const n=Math.random(); rngOk=Number.isFinite(n)&&n>=0&&n<=1;}catch{}
  try{ jsonOk = JSON.parse(JSON.stringify({x:1})).x===1; }catch{}
  try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); storageOk=true; }catch{}
  return { ok: rngOk && jsonOk && storageOk, details:{rngOk,jsonOk,storageOk} };
}
