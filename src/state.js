export const State = {
  data: {
    running:false,
    gen:0,
    best:{ fitness:-Infinity, genome:null },
    nDims: 8,
    target: Array.from({length:8}, (_,i)=> [0.2,0.8,0.5][i%3]),
    mutationRate: 0.07,
    version:'2.0.0-ndim'
  },
  load(){
    try{ const raw=localStorage.getItem('evolab_nd_state'); if(raw){ this.data={...this.data, ...JSON.parse(raw)}; } }catch{}
  },
  save(){ try{ localStorage.setItem('evolab_nd_state', JSON.stringify(this.data)); }catch{} },
  reset(){ this.data.gen=0; this.data.best={ fitness:-Infinity, genome:null }; this.save(); },
  setDims(n){
    n = Math.max(2, Math.min(128, Math.floor(n||2)));
    this.data.nDims = n;
    const t = new Array(n).fill(0).map((_,i)=> this.data.target[i] ?? Math.random());
    this.data.target = t;
    this.reset();
  },
  setMutation(m){ this.data.mutationRate = Math.max(0, Math.min(0.5, Number(m)||0.07)); this.save(); },
  randomizeTarget(){ this.data.target = Array.from({length:this.data.nDims}, ()=> Math.random()); this.reset(); }
};
