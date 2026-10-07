// ================================================================= HOST — the land (after the lava), the fields, the binding
// The showcase's lava: where each flow came from and how old it is (FLOW_SRC). The kit's flow model (46) lays it over
// the land 45 made; then the pit crater, the tube's skylights and the hot pools are cut, and the ground is final.
// Then the fields the kit reads (cached), and BIO.init.
const FLOW_SRC=(function(){const C=k=>CONES.find(c=>c.key===k),foot=(c,f,l)=>[c.x+DN[0]*c.r*(f||.95)+PERP[0]*(l||0),c.z+DN[1]*c.r*(f||.95)+PERP[1]*(l||0)];
 const S=(key,name,p,o)=>Object.assign({key,name,x:p[0],z:p[1]},o);
 return[
  S('ancient','An ancient sheet flow',[1150,-2560],{age:5200,len:5200,w:[380,720],th:[6,9],veer:.25,wander:.45,seed:9101}),
  S('sentinel','The Sentinel\'s flow (the tube runs under it)',foot(C('sentinel'),.9,-60),{age:2600,len:4300,w:[230,520],th:[7,10],veer:-.55,wander:.5,seed:9102}),
  S('lower','The Lower cone\'s flow',foot(C('lower')),{age:780,len:1300,w:[220,380],th:[6,8],veer:.35,wander:.4,seed:9103}),
  S('fissure','The fissure flow',riftPt(-520,150),{age:140,len:3400,w:[170,430],th:[4,7],veer:.75,wander:.5,seed:9104}),
  S('pair','The spatter pair\'s flow',foot(C('pair'),1.0,-40),{age:38,len:3000,w:[130,310],th:[4,6],veer:-.95,wander:.45,seed:9105}),
  S('new','The new flow (two years old)',foot(C('newcone')),{age:2,len:3000,w:[140,320],th:[6,9],veer:.3,wander:.4,seed:9106}),
  // the shoulder's own flows, from vents up the flank off the map: the ground falls south-south-east, so lava from the
  // rift never reaches the west; these come in over the north and west edges
  S('westold','An old flow on the shoulder',[-1750,-2560],{age:900,len:4300,w:[300,560],th:[6,9],veer:-.2,wander:.45,seed:9107}),
  S('westyoung','A young flow on the shoulder',[-2640,-1300],{age:95,len:3600,w:[200,380],th:[5,7],veer:-.3,wander:.5,seed:9108}),
 ];})();
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:8,baseH:landH0,flows:FLOW_SRC,old:THRONE.OLD});
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';

// ---------------------------------------------------------------- what is cut after the lava
// the pit crater's floor: flat, a few metres of rubble rising to its walls; the acid lake stands on it
PIT.floor=slopeH(PIT.x,PIT.z)-PIT.depth;PIT.lake=PIT.floor+6.5;
// THE TUBE: under the Sentinel's flow, along its middle third; open to the sky where its roof fell in
const TUBE=(function(){const F=FLOWS.flows.find(f=>f.key==='sentinel'),P=F.path,a=Math.floor(P.length*.16),b=Math.floor(P.length*.86),pts=P.slice(a,b).map(p=>[p.x,p.z]);
 reseed(4701);const sky=[];let acc=0;
 for(let i=1;i<pts.length;i++){acc+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc>rr(260,420)){acc=0;sky.push({x:pts[i][0],z:pts[i][1],r:rr(9,21),d:rr(9,15)});}}
 return{pts,sky};})();
// THE HOT POOLS: on the new cone's plume side, hot springs where the ground water meets the dyke
const POOLS=(function(){const C=CONES.find(c=>c.key==='newcone');
 return[[1.35,-.2,14],[1.55,.25,11],[1.3,.6,16]].map(([k,s,r])=>({x:C.x+PERP[0]*C.r*k+DN[0]*C.r*s,z:C.z+PERP[1]*C.r*k+DN[1]*C.r*s,r}));})();
// THE FUMAROLES (steam vents): round the new cone's crater, the pit's rim, along the fissure, by the pools, and a
// few in the old ground under the plume. 84 draws their steam; the kit reads them as the 'vent' field
const STEAM=(function(){reseed(4702);const o=[],C=CONES.find(c=>c.key==='newcone');
 for(let k=0;k<7;k++){const a=k/7*TAU+rr(-.3,.3),d=C.r*C.crater*rr(.7,1.05);o.push({x:C.x+Math.cos(a)*d,z:C.z+Math.sin(a)*d,s:rr(.7,1.2),R:55});}
 for(let k=0;k<4;k++){const a=-.6+k*.55+rr(-.2,.2),d=C.r*rr(.9,1.25);o.push({x:C.x+Math.cos(a)*d,z:C.z+Math.sin(a)*d,s:rr(.4,.8),R:45});}
 for(let k=0;k<6;k++){const a=k/6*TAU+rr(-.3,.3),d=PIT.r*rr(.75,1.0);o.push({x:PIT.x+Math.cos(a)*d,z:PIT.z+Math.sin(a)*d,s:rr(.5,1),R:50});}
 for(let k=0;k<6;k++){const t=mix(FISS.t0,FISS.t1,(k+.5)/6),p=riftPt(t,FISS.l);o.push({x:p[0],z:p[1],s:rr(.3,.6),R:40});}
 POOLS.forEach(P=>o.push({x:P.x,z:P.z,s:.6,R:42}));
 [[1500,-900],[1900,300],[1250,1300],[2050,1700]].forEach(p=>o.push({x:p[0],z:p[1],s:rr(.5,.9),R:60}));
 return o;})();

function poolCut(x,z){let c=0;for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*2)c=Math.max(c,2.6*smooth(P.r*1.6,P.r*.4,d));}return c;}
function skyCut(x,z){let c=0;for(const S of TUBE.sky){const d=Math.hypot(x-S.x,z-S.z);if(d<S.r*1.6)c=Math.max(c,S.d*smooth(S.r*1.15,S.r*.7,d)+1.5*smooth(S.r*1.5,S.r*1.1,d));}return c;}
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH0(x,z);const th=FLOWS.thickAt(x,z);h+=th;
 // the lava's skin: aa rubble and pressure ridges on the flows, sharper the younger
 const fl=smooth(.4,2.2,th);if(fl>0){const a=FLOWS.ageAt(x,z),k=fl*(1-.65*smooth(300,3500,a));h+=k*(1.5*ridged(x*.045,z*.045,4711)+.6*(fbm(x*.17,z*.17,4712,2)-.5)-.6);}
 // the pit crater: steep walls down to a flat rubble floor
 const dp=Math.hypot(x-PIT.x,z-PIT.z);if(dp<PIT.r*1.15)h=mix(h,PIT.floor+5*Math.pow(dp/PIT.r,2)+1.2*(fbm(x*.08,z*.08,4713,2)-.5),smooth(PIT.r*1.06,PIT.r*.8,dp));
 return h-skyCut(x,z)-poolCut(x,z);}
const POOLL=POOLS.map(P=>{let lo=1e9;for(let k=0;k<20;k++){const a=k/20*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.3,P.z+Math.sin(a)*P.r*1.3));}return lo-.3;});
function waterH(x,z){if(Math.hypot(x-PIT.x,z-PIT.z)<PIT.r*.95)return PIT.lake;
 for(let i=0;i<POOLS.length;i++)if(Math.hypot(x-POOLS[i].x,z-POOLS[i].z)<POOLS[i].r*1.5)return POOLL[i];return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland; and the Throne's own (BIOME-API.md):
//   plume     how far under the plume (45)
//   vent      steaming ground: near a fumarole
//   acid      the acid lake's and the hot pools' shores
//   cinder    a cinder cone's loose flanks (not where a younger flow has covered them)
//   skylight  the floor and walls of a skylight into the tube
//   ash       how deep the plume's ash lies (deeper under the plume, shed from steep ground)
function ventAt(x,z){let v=0;for(const S of STEAM){const d=Math.hypot(x-S.x,z-S.z);if(d<S.R*2.2)v=Math.max(v,S.s*Math.exp(-Math.pow(d/S.R,2)));}return clamp(v,0,1);}
function fieldsAt(x,z,h,slope){const G=gullyAt(x,z),pl=plumeAt(x,z),th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z);
 const dp=Math.hypot(x-PIT.x,z-PIT.z);let acid=smooth(PIT.r*1.25,PIT.r*.85,dp);for(const P of POOLS)acid=Math.max(acid,smooth(P.r*3,P.r*1.1,Math.hypot(x-P.x,z-P.z)));
 let sky=0;for(const S of TUBE.sky)sky=Math.max(sky,smooth(S.r*1.7,S.r*.8,Math.hypot(x-S.x,z-S.z)));
 const bare=smooth(.4,2,th)*smooth(380,25,age),walls=smooth(.62,.92,slope)*Math.max(smooth(PIT.r*1.15,PIT.r*.85,dp),coneH(x,z).cin*.7,sky,smooth(.5,2,th));
 const rock=clamp(Math.max(bare,walls*.9),0,1),cin=coneH(x,z).cin*(1-smooth(.5,2,th)*smooth(3000,1500,age));
 return{wet:clamp(.22+.45*G.fl+.3*acid+.12*pl+.25*sky+.05*(fbm(x*.0015,z*.0015,131,2)-.5),0,1),flow:G.fl,upland:clamp((h-1500)/800,0,1),canyon:0,rim:0,rock,dune:0,oasis:0,slope,
  abyss:0,salt:0,cold:clamp((h-1400)/5000,0,1),geo:0,humid:0,barren:coneH(x,z).bare*(1-smooth(.3,.6,ventAt(x,z))),plume:pl,vent:ventAt(x,z),acid,cinder:clamp(cin,0,1),skylight:sky,ash:pl*(1-smooth(.55,.9,slope))};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','plume','vent','acid','cinder','skylight','ash','humid'];
const FC=(function(){const N=560,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the rift, the cones, the pit, the pools, the skylights, the plume's edge and the gullies
const SPINE=[];
for(let t=-2400;t<=2200;t+=550)SPINE.push(riftPt(t,0));
CONES.forEach(C=>SPINE.push([C.x,C.z]));SPINE.push([PIT.x,PIT.z]);POOLS.forEach(P=>SPINE.push([P.x,P.z]));
TUBE.sky.forEach((S,i)=>{if(i%2===0)SPINE.push([S.x,S.z]);});
for(let z=-2000;z<=2000;z+=800){let bx=0,bd=9;for(let x=-2400;x<=2400;x+=40){const d=Math.abs(plumeAt(x,z)-.5);if(d<bd){bd=d;bx=x;}}SPINE.push([bx,z]);}
GULLY.forEach(G=>{for(let s=-1600;s<=1600;s+=800){const x=G.x+DN[0]*s,z=G.z+DN[1]*s;SPINE.push([x+PERP[0]*G.amp*Math.sin(s*G.f+G.ph),z+PERP[1]*G.amp*Math.sin(s*G.f+G.ph)]);}});
const WWIN=(function(){let x0=PIT.x-PIT.r,z0=PIT.z-PIT.r,x1=PIT.x+PIT.r,z1=PIT.z+PIT.r;POOLS.forEach(P=>{x0=Math.min(x0,P.x-P.r*2);z0=Math.min(z0,P.z-P.r*2);x1=Math.max(x1,P.x+P.r*2);z1=Math.max(z1,P.z+P.r*2);});return[x0-20,z0-20,x1+20,z1+20];})();
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:31,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:WWIN}});
BIO.setSun(SUN_POS);
