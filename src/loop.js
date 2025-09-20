function clamp01(x){return Math.min(1,Math.max(0,x));}
export function randomGenome(n){ return Array.from({length:n}, ()=> Math.random()); }
export function mutate(g, rate){
  const d = ()=> (Math.random()*2-1) * rate;
  const out = new Array(g.length);
  for(let i=0;i<g.length;i++){ out[i] = clamp01(g[i] + d()); }
  return out;
}
export function fitness(g, target){
  let sum=0;
  for(let i=0;i<g.length;i++){ sum += Math.abs(g[i]-target[i]); }
  return 1 - (sum / g.length); // 1 = perfekt
}
export function step(state){
  const parent = state.best.genome ?? randomGenome(state.nDims);
  const child = mutate(parent, state.mutationRate);
  const f = fitness(child, state.target);
  state.gen += 1;
  if (f > state.best.fitness) { state.best = { fitness:f, genome: child }; }
}
