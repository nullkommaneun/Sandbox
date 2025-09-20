export const State = {
  data: {
    running: false,
    gen: 0,
    best: { fitness: -Infinity, genome: null },
    target: [0.2, 0.8, 0.5],
    mutationRate: 0.07,
    version: '1.2.0'
  },
  load(){
    try{
      const raw = localStorage.getItem('evolab_state');
      if(raw){ this.data = { ...this.data, ...JSON.parse(raw) }; }
    }catch(e){ /* ignore */ }
  },
  save(){ try { localStorage.setItem('evolab_state', JSON.stringify(this.data)); } catch {} },
  reset(){ this.data.gen=0; this.data.best={ fitness:-Infinity, genome:null }; this.save(); }
};
