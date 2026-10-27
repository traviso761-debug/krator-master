// ================================================================= HOST — the land: the beds (station 6, the treeline)
// One KSTRATA stack: the folds' `ringfold` beds on the lower ramp under the crest's shattered `megabreccia` (the recipe `crest`,
// PLAN.md section 2) from ~4.6 km up (the cirque's headwall and the crest); the ground's steep faces draw them (84-host-ground.js). No rock bodies and no cave here.
const STRATA=BIO.strata({formations:[{recipe:'ringfold',top:700},{recipe:'megabreccia'}],seed:WORLD,range:[-700,1100],dip:[.3,.95,.004],warp:[7,2],
 fold:{dir:[0,1],wl:1900,amp:110,sharp:.6},dust:0x8a8272,res:.25,private:true});
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swhighlands',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('rockDetail');
