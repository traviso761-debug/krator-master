// ================================================================= HOST — the ground model: THE RED LADDER (station 8)
// biomes/gills/PLAN.md section 5 (the table's 7.0-8.7 km rows) and section 11 item 2 on map 5.1's site (px 920,1450: 8,538 m, falling south ~0.07):
//   THE FLANK      5.1's relief (REGION) with the flank's detail; the dry-cold line (8,500 m) across the map's middle
//   THE CRACKS     the Red Gills' swarm, radial (running down the flank, north-south), iced: GILLS.layout's records (ring arcs of a 60 km radius:
//                  straight over a map), carved; their pipes (87, read from the Red Gill's station) iced into fumarolic ice towers on the lips
//   THE JETS       over the line, frost jets: the breath coming up through cracks with no pipe, a steam column on the out-breath and a rime fan
//                  frozen on the lee (the wind from the north-west: the fans point south-east)
//   THE RIDGES     under the line the bead glass is palagonite and weathers into knife-edged ridges and gullies (the orange belt's, station 3)
const LD={y0:8538,line:8500};
const LOCAL=(x,z)=>LD.y0+(REGION?(REGION.h(x+260,z)+REGION.h(x-260,z)+REGION.h(x,z+260)+REGION.h(x,z-260))*.25:-.07*z);
function flankH(x,z){return LOCAL(x,z)+18*(fb(x*.0006,z*.0006,3,WORLD+100)-.5)+4*(1-Math.abs(fb(x*.003+fb(z*.001,x*.001,2,WORLD+101),z*.0012,2,WORLD+102)*2-1))+1*(vn(x*.03,z*.03,WORLD+103)-.5);}
const SG=(function(){const C=[-60000,0],L=GILLS.layout({centre:C,band:[56300,63700],arc:[-.055,.055],n:5,dead:2,seed:0x8E21,w:[12,30],d:[30,80],len:[700,2000],form:'radial'});return{L,big:null};})();
// the palagonite ridges under the line (the orange belt's form, station 3): running down the flank, deepening below the line
function ridgeAt(x,z,o){const y=LOCAL(x,z),k=smooth(LD.line-40,LD.line-260,y);o.k=k;const w=x/200+.8*(fb(z*.0011,x*.0004,2,WORLD+104)-.5),f=w-Math.floor(w),t=Math.abs(f-.5)*2;o.t=t;
 o.cut=k*42*(.7+.6*KR.unit(KR.hash(WORLD,Math.floor(w),0,0x52D)))*(1-Math.pow(1-t,1.5));return o;}
// THE FROST JETS: over the line, on a 420 m lattice, one in three cells (KRAND by cell), each a vent in a low mound; the fan downwind
const WIND=[.56,.83];
const JETS=(function(){const o=[];for(let j=-12;j<=12;j++)for(let i=-12;i<=12;i++){const h=KR.hash(WORLD,i,j,0xF0E7),u=k=>KR.unit(KR.hash(h,k));if(u(0)>.36)continue;
  const x=i*420+u(1)*300-150,z=j*420+u(2)*300-150;if(LOCAL(x,z)<LD.line+20||Math.max(Math.abs(x),Math.abs(z))>4500)continue;o.push({id:'jet.'+i+'.'+j,x,z,r:6+8*u(3),fan:60+90*u(4)});}return o;})();
function jetAt(x,z){let m=0,f=0;for(const J of JETS){const dx=x-J.x,dz=z-J.z;if(Math.abs(dx)>J.fan+20||Math.abs(dz)>J.fan+20)continue;const d=Math.hypot(dx,dz);m=Math.max(m,smooth(J.r*2.5,J.r*.4,d));
  const a=dx*WIND[0]+dz*WIND[1],c=Math.abs(-dx*WIND[1]+dz*WIND[0]);if(a>0)f=Math.max(f,smooth(J.fan,J.fan*.2,a)*smooth(J.r+a*.35,J.r*.5+a*.15,c));}return{m,f};}
const _rr={};
function preH(x,z){let h=flankH(x,z);ridgeAt(x,z,_rr);h-=_rr.cut;
 const g=GILLS.gillAt(SG.L,x,z);if(g){const st=Math.round(g.g.d*g.k/6)*6;h-=mix(g.g.d*g.k,st,.35);}
 const J=jetAt(x,z);h+=2.5*J.m+.6*J.f;return h;}
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,8,0x57A7),formations:[{recipe:'palagonite-tuff',top:8380},{recipe:'tibasalt-ash'}],range:[7600,9400],
 dip:[0,1,.02],warp:[4,1.2],wash:{m:2},regolith:.4,dust:0x3c3530});
function baseH(x,z){const g=preH(x,z);return REGION?REGION.blend(g,x,z,5400,9500,LD.y0):g;}
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
// the jets' steam joins the breath's group (87 reads GILL_POOLS: emitters it adds to the out-breath's steam)
const GILL_POOLS=JETS.map(J=>({x:J.x,z:J.z,get y(){return terrainH(J.x,J.z)+1;}}));
const MODEL={fieldsAt(x,z,sl,hollow,o){const y=terrainH(x,z),below=smooth(LD.line+60,LD.line-200,y),R=ridgeAt(x,z,{}),g=GILLS.gillAt(SG.L,x,z),J=jetAt(x,z);
  o.face=g&&g.k>.1?smooth(.5,.85,sl):R.k>.3&&sl>.75?smooth(.75,1.1,sl)*.8:0;o.talus=g&&g.k<.3?.4:R.k>.3?.2*smooth(.4,.9,R.t):0;
  o.rampart=0;o.vent=0;o.glass=0;o.orange=0;
  o.halo=clamp((.2+.8*hollow)*smooth(.95,.4,sl)*(1-below)*.8,0,1);
  o.palag=clamp(below*(.55+.45*hollow),0,1);
  /* the rime fans and the jets' mounds: ice; the snow in the ridges' gullies */
  o.ice=clamp(Math.max(J.f*.95,J.m*.7),0,1);o.snow=clamp(R.k*smooth(.7,.95,R.t)*.7,0,.8);
  o.crust=clamp(smooth(8700,8300,y)*smooth(.8,.3,sl)*(1-o.snow)*(1-o.ice)*smooth(.45,.7,vn(x*.02,z*.02,WORLD+105))*.7,0,.7);
  o.tuff=0;return o;},
 farColor(x,z,h,sl,c,K){return K.mixC(c,K.L([176,122,52]),.65*smooth(LD.line+60,LD.line-260,h));},
 after(){}};
var PORTAL=null;
