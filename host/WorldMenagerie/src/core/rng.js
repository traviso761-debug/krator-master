// Deterministic randomness and noise. The city layout comes from one Park–Miller stream (createLcg); everything
// laid on top uses position-keyed hashes (hash3) or its own mulberry32 stream (mkRng), so the seeded layout never shifts.
export function createLcg(seed0){let seed=seed0;
  function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  return {rnd,rr:(a,b)=>a+(b-a)*rnd(),pick:arr=>arr[Math.floor(rnd()*arr.length)],get seed(){return seed;},set seed(v){seed=v;}};}
export function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
export function smooth(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
// value noise over a 512-entry permutation drawn from the given stream (the first 512 draws)
export function makeNoise(rnd){const perm=[];for(let i=0;i<512;i++)perm[i]=Math.floor(rnd()*256);
  function vn(x,z){
    const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi;
    const h=(a,b)=>perm[(perm[a&255]+(b&255))&255]/255;
    const u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
    return h(xi,zi)*(1-u)*(1-v)+h(xi+1,zi)*u*(1-v)+h(xi,zi+1)*(1-u)*v+h(xi+1,zi+1)*u*v;
  }
  function fbm(x,z){return vn(x,z)*0.5+vn(x*2.1+7,z*2.1+3)*0.25+vn(x*4.3+1,z*4.3+9)*0.125;}
  return {perm,vn,fbm};}
export function hash3(a,b,c){let h=Math.imul(Math.round(a*997)|0,374761393)^Math.imul(Math.round(b*991)|0,668265263)^Math.imul(Math.round(c*983)|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
export function mkRng(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
