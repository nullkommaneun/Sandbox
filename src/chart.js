export function renderDual(container, yTrue, yPred){
  container.innerHTML='';
  if(!yTrue || yTrue.length===0){ container.textContent='Keine OOS-Daten'; return; }
  const W = container.clientWidth || 800, H = 320, P=24;
  const svgNS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width','100%'); svg.setAttribute('height',H);

  const all = yTrue.concat(yPred);
  const minV = Math.min(...all), maxV = Math.max(...all);
  const x = (i)=> P + (W-2*P)* (i/(yTrue.length-1));
  const y = (v)=> H-P - (H-2*P)* ((v - minV) / Math.max(1e-9, (maxV-minV)));

  const mkPath = (arr)=>{
    let d = `M ${x(0)} ${y(arr[0])}`;
    for(let i=1;i<arr.length;i++){ d += ` L ${x(i)} ${y(arr[i])}`; }
    return d;
  };

  const ax = document.createElementNS(svgNS,'line');
  ax.setAttribute('x1', P); ax.setAttribute('y1', y(0));
  ax.setAttribute('x2', W-P); ax.setAttribute('y2', y(0));
  ax.setAttribute('stroke','#2b3b52'); svg.appendChild(ax);

  const pTrue = document.createElementNS(svgNS,'path');
  pTrue.setAttribute('d', mkPath(yTrue)); pTrue.setAttribute('fill','none'); pTrue.setAttribute('stroke','#7fb3ff'); pTrue.setAttribute('stroke-width','2');
  svg.appendChild(pTrue);

  const pPred = document.createElementNS(svgNS,'path');
  pPred.setAttribute('d', mkPath(yPred)); pPred.setAttribute('fill','none'); pPred.setAttribute('stroke','#ffb37f'); pPred.setAttribute('stroke-width','2');
  svg.appendChild(pPred);

  const legend = document.createElementNS(svgNS,'text');
  legend.setAttribute('x', P); legend.setAttribute('y', P);
  legend.setAttribute('fill','#a3b3c7');
  legend.textContent = 'Blau: Ist-Return • Orange: Prognose-Return';
  svg.appendChild(legend);

  container.appendChild(svg);
}
