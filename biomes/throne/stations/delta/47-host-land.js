// ================================================================= HOST — the land, the fields, the binding (the lava delta)
// The old flank, the pali, the delta's new land and the sea floor, the fields the kit reads (cached), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:(x,z)=>SEA+PALI.top,flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function lconeAt(x,z){let h=0,k=0;for(const C of LCONES){const d=Math.hypot(x-C.x,z-C.z)/C.r;if(d>1.5)continue;h=Math.max(h,C.h*Math.pow(smooth(1.4,.35,d),1.2)-C.h*.45*smooth(.38,.12,d));k=Math.max(k,smooth(1.3,.8,d));}return{h,k};}
// the old flank above the cliff, rising inland at ~5 %; the cliff's face; the bench at its foot (2-10 m over the sea, falling seaward), the delta's
// front a slumping scarp into the sea; outside the delta the cliff stands in the sea behind a strip of black sand; the sea floor falls away steeply
function terrainH0(x,z){const s=sOf(x,z),t=tOf(x,z),ps=paliS(t),fs=frontS(t),n=fbm(x*.0013,z*.0013,1201,3)-.5,n2=fbm(x*.012,z*.012,1202,2)-.5;
 const flank=SEA+PALI.top+.05*(ps-s)+26*n+4*n2;
 const foot=SEA+1.5+3*n2,bench=SEA+3+8*smooth(fs,ps+20,s)+2.5*n2+1.6*(fbm(x*.04,z*.04,1203,2)-.5);   /* the new land: rough, ropy */
 const lobe=deltaLobe(t),land=s<fs?mix(foot,bench,smooth(.04,.2,lobe)):SEA-8-.35*(s-fs)-40*smooth(fs,fs+200,s);
 const k=smooth(ps-PALI.face,ps,s);let h=mix(flank,Math.max(land,SEA-260),k);   /* the cliff: from the flank's edge down to the land at its foot */
 if(s>ps&&s<fs+40)h+=lconeAt(x,z).h;
 return Math.max(h,SEA-260);}
function waterH(x,z){return terrainH(x,z)<SEA+.3?SEA:-1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The caldera's names, so its ground (84) reads them: floor (the delta's new lava), wall (the cliff's face), rim (the littoral cones), lake 0;
// the station's own: delta, cliff, flank, sand (the black sand), entry (the hot ground by the entry), cone. The kit's: the old flank's dry
// shoulder ground (its trees and shrubs: plume 0, owned 0), barren on the new land, the cliff and the sand
function fieldsAt(x,z,h,slope){const s=sOf(x,z),t=tOf(x,z),ps=paliS(t),fs=frontS(t),lobe=deltaLobe(t),steep=smooth(.45,.8,slope);
 const flank=1-smooth(ps-PALI.face-20,ps-PALI.face+10,s),cliff=smooth(ps-PALI.face,ps-PALI.face*.6,s)*smooth(ps+10,ps-10,s);
 const below=smooth(ps-10,ps+10,s)*(h>SEA-.5?1:0),delta=below*smooth(.04,.2,lobe),sand=below*(1-smooth(.04,.2,lobe)),cone=lconeAt(x,z).k*below;
 const entry=Math.exp(-Math.pow(Math.hypot(x-ENTRY.x,z-ENTRY.z)/90,2)),rock=clamp(Math.max(steep,cliff*.9),0,1);
 return{wet:.15+.3*below,flow:0,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:.4*below,cold:0,geo:entry,barren:Math.max(delta,cliff,sand,cone),humid:.3,plume:0,
  vent:0,acid:0,cinder:cone,skylight:0,ash:0,owned:0,kedge:0,knear:0,field:0,clear:0,coast:sand,edge:0,city:0,path:0,
  wall:cliff,floor:delta,lake:0,pen:0,warm:entry,deathzone:Math.max(delta,cliff,sand)>.5?1:0,cbelt:0,tundra:0,snow:0,out:1,
  delta,cliff,flank,sand,entry,cone};}
const FNAMES=['delta','cliff','flank','sand','entry','cone','wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','wall','floor','lake','pen','warm','deathzone','cbelt','tundra','snow','out'];
const FC=(function(){const N=600,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// nothing roots in the sea, on the new land, the cliff's face or the sand: the old flank alone is planted (the kit's passes read the fields)
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}return 1;};
let MASK=(x,z)=>FIELD.flank(x,z)<.5?0:waterMask(x,z);
// the LOD spine: the cameras' places (the entry, the bench, the cliff's lip over the lava fall, the flank)
const SPINE=[[ENTRY.x,ENTRY.z],xzOf(paliS(DELTA.t0)+120,DELTA.t0+200),xzOf(paliS(DELTA.t0)-PALI.face-60,DELTA.t0-120),xzOf(-1200,-600),xzOf(-1500,900)];BIO.init({tags:'throne-delta',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:52,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
