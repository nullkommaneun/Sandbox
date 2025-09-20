export const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// robustes sha256 mit Fallback, falls crypto.subtle fehlt
export async function sha256(text){
  try{
    if (crypto && crypto.subtle) {
      const buf = new TextEncoder().encode(text);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  }catch{}
  // schwacher Fallback (nicht sicher, reicht für Dateiname)
  let h=0; for(let i=0;i<text.length;i++){ h = (h*31 + text.charCodeAt(i))|0; }
  return ('00000000'+(h>>>0).toString(16)).slice(-8);
}

export function download(filename, text){
  const blob = new Blob([text], { type:'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
