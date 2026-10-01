import {createLcg,makeNoise,clamp,smooth,hash3,mkRng} from '../src/core/rng.js';
import {eq,near,ok} from './assert.js';
export const tests={
  'Park–Miller stream is deterministic and in (0,1)'(){const a=createLcg(1337),b=createLcg(1337);for(let i=0;i<1000;i++){const x=a.rnd();eq(x,b.rnd());ok(x>=0&&x<1);}},
  'first draws of seed 1337 are the known values'(){const L=createLcg(1337);near(L.rnd(),0.010464,1e-6);near(L.rnd(),0.866023,1e-6);near(L.rnd(),0.244316,1e-6);},
  'seed state is exposed'(){const L=createLcg(5);L.rnd();eq(L.seed,5*16807%2147483647);},
  'rr and pick draw from the same stream'(){const L=createLcg(9),M=createLcg(9);const v=L.rr(10,20);near(v,10+10*M.rnd());eq(L.pick(['a','b','c']),['a','b','c'][Math.floor(M.rnd()*3)]);},
  'noise takes exactly 512 draws and is smooth in [0,1]'(){const L=createLcg(1337),N=makeNoise(L.rnd);eq(N.perm.length,512);const after=createLcg(1337);for(let i=0;i<512;i++)after.rnd();eq(L.rnd(),after.rnd());
    for(let i=0;i<200;i++){const v=N.fbm(i*0.37,i*0.11);ok(v>=0&&v<=1);}near(N.vn(3.5,3.5),N.vn(3.5,3.5));near(N.fbm(3.3,4.4),0.652061,1e-6);},
  'hash3 is position-keyed, order-sensitive and stable'(){eq(hash3(1,2,3),hash3(1,2,3));ok(hash3(1,2,3)!==hash3(2,1,3));near(hash3(1,2,3),0.759070,1e-6);for(let i=0;i<100;i++){const v=hash3(i*1.7,-i*0.3,i);ok(v>=0&&v<1);}},
  'mkRng streams are independent'(){const a=mkRng(42),b=mkRng(42),c=mkRng(43);near(a(),0.601104,1e-6);a();eq(a(),(b(),b(),b()));ok(a()!==c());},
  'clamp and smooth'(){eq(clamp(5,0,1),1);eq(clamp(-5,0,1),0);eq(smooth(0,1,0),0);eq(smooth(0,1,1),1);near(smooth(0,1,0.5),0.5);ok(smooth(0,1,0.25)<0.25);},
};
