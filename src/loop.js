function clamp01(x){ return Math.min(1, Math.max(0, x)); }

export function randomGenome(){ return { a:Math.random(), b:Math.random(), c:Math.random() }; }

export function mutate(g, rate=0.07){
  const d = () => (Math.random()*2 - 1) * rate;
  return { a:clamp01(g.a+d()), b:clamp01(g.b+d()), c:clamp01(g.c+d()) };
}

export function fitness(g, target=[0.2,0.8,0.5]){
  const d = Math.abs(g.a-target[0]) + Math.abs(g.b-target[1]) + Math.abs(g.c-target[2]);
  return 1 - (d/3);
}

export function step(state){
  const parent = state.best.genome ?? randomGenome();
  const child = mutate(parent, state.mutationRate);
  const f = fitness(child, state.target);
  state.gen += 1;
  if (f > state.best.fitness) { state.best = { fitness:f, genome:child }; }
}
