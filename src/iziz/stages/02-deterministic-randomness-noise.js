// ---------- deterministic randomness & noise (src/core/rng.js) ----------
// the whole layout comes from this seed; #seed=N in the address builds a different city
const SEED0=(()=>{try{const v=parseInt(new URLSearchParams(location.search).get('seed')||new URLSearchParams(location.hash.slice(1)).get('seed'),10);return v>0&&v<2147483647?v:1337;}catch(e){return 1337;}})();
const LCG=createLcg(SEED0);const rnd=LCG.rnd,rr=LCG.rr,pick=LCG.pick;
const {perm,vn,fbm}=makeNoise(rnd);   // takes the first 512 draws of the seed, as it always has
