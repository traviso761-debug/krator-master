// ================================================================= HOST — the ground model: THE AIRLESS RIM (station 5)
// PLAN.md section 4 ("On the airless rim": the crater's crest in megabreccia and its overturned flap; tafoni and honeycomb; ventifacts
// and desert pavement; sand-wedge polygons in the regolith; blockfields; relic debris-covered ice in the cirques; hoarfrost) on map
// 5.1's site (px 532,1285: 10,859 m, a crest cell). Its own frame (x east, z south, origin on the crest):
//   THE CREST     a rounded ridge running north-north-west (along ACROSS), its top a blockfield of megabreccia frost-heaved into
//                 blocks, the overturned flap's beds capping it
//   THE OUTER SIDE west: the raster's ~0.05 fall away from the crater, the regolith sorted by the thin wind into desert pavement,
//                 sand-wedge polygons where it is flat, ventifacts on it
//   THE INNER SIDE east, into the crater: two slump scarps (KRELIEF.scarp, the wall's collapse terraces), the slumped blocks' benches
//                 tilted back toward the wall, talus at each foot
//   THE CIRQUE    a bowl bitten into the upper scarp facing south-east (shaded: the noon sun stands north), a lobe of relic
//                 debris-covered ice on its floor
// The rock (KSTRATA): `megabreccia` (no beds: blocks of every rock in a grey matrix, flecked with impact glass), and over it the
// overturned flap: the crater's own beds (`canyon`, the red sandstones and shales the impact dug up) folded back, upside down
// (formation flip). Above the dry-cold line: nothing weathers to a new colour; no varnish.
const OUT=[-.985,.17],ACROSS=[.17,.985],RM={y0:10859,out:.05,crest:260};
const cOf=(x,z)=>x*OUT[0]+z*OUT[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzCA=(c,a)=>[c*OUT[0]+a*ACROSS[0],c*OUT[1]+a*ACROSS[1]];
const xzDA=(d,a)=>xzCA(-d,a);   /* d: metres into the crater (east) */
// the crest's line wanders a little; c' the distance from it, outward positive
const crestOff=a=>140*Math.sin(a*.00045+.6)+60*Math.sin(a*.0013+2.1);
function rimH(x,z){const a=aOf(x,z),c=cOf(x,z)-crestOff(a);
 const top=RM.y0+40-14*Math.pow(c/RM.crest,2)*smooth(RM.crest*1.6,0,Math.abs(c));   /* the rounded crest, 40 m over the site's cell at its top */
 const outer=c>0?-RM.out*Math.max(0,c-RM.crest*.6)-12*smooth(RM.crest*.4,RM.crest*1.6,c):0;
 const inner=c<0?-.1*Math.max(0,-c-RM.crest*.5)-18*smooth(-RM.crest*.4,-RM.crest*1.4,c):0;
 return top+outer+inner+18*(fb(x*.0005,z*.0005,2,WORLD+80)-.5)+2.5*(fb(x*.006,z*.006,2,WORLD+81)-.5);}
// THE SLUMP SCARPS: two, on the inner side, their benches tilted back (the slumped blocks rotated toward the wall)
const SLUMPS=[[700,170,120],[2200,240,160]].map((s,i)=>KRELIEF.scarp({pts:[-6400,-4200,-2000,0,2100,4300,6400].map((a,k)=>xzDA(s[0]+crestOff(a)*-1+70*Math.sin(k*1.9+i),a)),side:1,h:s[1],run:s[2],power:1.2,drop:true,
 benches:{n:1,w:14},ravines:{n:4,w:[35,70],head:[60,200],depth:[25,70],fan:{r:120,h:10}},buttresses:{sp:380,w:.3,amp:30},talus:{h:s[1]*.09,reach:s[2]*.45},rough:.035,warp:{amp:25,scale:1/700},ends:900,seed:KR.hash(WORLD,51,i,0x5103)}));
const tilt=(x,z)=>{const d=-cOf(x,z);let t=0;for(const [d0,w] of [[700+120,600],[2200+160,900]]){const u=(d-d0)/w;if(u>0&&u<1)t-=18*Math.sin(Math.PI*u)*(1-u);}return t;};   /* the bench dips back toward its scarp's foot */
// THE CIRQUE: a bowl in the upper scarp, opening south-east, its floor 110 m under the crest; a relic ice lobe on it
const CIRQUE=(function(){const p=xzDA(820,1500);return{x:p[0],z:p[1],r:520,D:115,open:[.57,.82],name:'The cirque (relic ice under rubble on its floor)'};})();
function cirqueAt(x,z,o){const dx=x-CIRQUE.x,dz=z-CIRQUE.z,q=Math.hypot(dx,dz)/CIRQUE.r,fw=(dx*CIRQUE.open[0]+dz*CIRQUE.open[1])/CIRQUE.r;
 /* a bowl: steep head wall behind (against the open side), the floor a lip to the open side */
 const k=smooth(1.15,.7,q)*smooth(-.1,.35,.65-fw);o.k=k;o.floor=smooth(.75,.35,q)*k;o.q=q;
 const lobe=smooth(.62,.38,Math.hypot(dx-CIRQUE.open[0]*CIRQUE.r*.15,dz-CIRQUE.open[1]*CIRQUE.r*.15)/CIRQUE.r);o.ice=lobe;
 o.cut=CIRQUE.D*k*(1-.45*Math.pow(q,2))-lobe*(16+1.5*Math.sin((dx*CIRQUE.open[0]+dz*CIRQUE.open[1])/22));return o;}
const _cq={};
function preH(x,z){cirqueAt(x,z,_cq);return rimH(x,z)+tilt(x,z)-Math.max(0,_cq.cut);}
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,5,0x57A7),formations:[{recipe:'megabreccia',top:10805},{recipe:'canyon',flip:true}],range:[9200,11000],
 dip:[OUT[0],OUT[1],.06],warp:[6,1.5],wash:{m:1.5},regolith:.4,dust:0x5d5852});
const _ground=KRELIEF.apply(preH,SLUMPS);
/* past the map the scale model's own relief (station.json "region", src/45a5-host-region.js): the far country is 5.1's */
function baseH(x,z){const g=_ground(x,z);return REGION?REGION.blend(g,x,z,5400,9500,RM.y0):g;}
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
const MODEL={fieldsAt(x,z,sl,hollow,o){const g=preH(x,z),a=aOf(x,z),c=cOf(x,z)-crestOff(a),C=cirqueAt(x,z,{});let part=null;
  for(const S of SLUMPS){const r=KRELIEF.at(S,x,z,g);if(r&&r.part!=='rim'){part=r.part;break;}}
  o.face=part==='face'||part==='ravine'||part==='buttress'?smooth(.45,.8,sl):C.k>.3&&sl>.7?smooth(.7,1.1,sl):0;
  /* the blockfield on the crest; talus under the scarps and the cirque's walls */
  o.talus=part==='talus'||part==='fan'?1:Math.abs(c)<RM.crest*.9&&sl<.35?.75*smooth(.35,.65,vn(x*.008,z*.008,WORLD+82)):C.k>.2&&C.floor<.5?.5:0;
  o.rampart=0;o.vent=0;o.glass=0;o.orange=0;o.halo=0;
  /* the regolith: pavement on the outer side's gentle ground, polygons where it is flattest; thinner on the inner benches */
  o.pave=clamp((c>0?.95:.55)*smooth(.42,.12,sl)*(1-C.ice)*(1-.6*smooth(.4,.8,o.talus)),0,1);
  /* the breccia shows wherever the regolith is thin: the crest, the inner side's ground, the scarps */
  o.breccia=clamp(Math.max(1-o.pave,c<0?.55:0)*(1-C.ice),0,1);
  o.ice=C.ice>0?clamp(.2+.8*smooth(.5,.9,sl),0,1)*smooth(.1,.5,C.ice):0;
  /* hoarfrost in the cirque's shade and on the inner faces: the FC field's frost does the rest */
  o.snow=clamp(C.k*.25*(1-C.ice),0,1);
  return o;},
 farColor(x,z,h,sl,c,K){return K.mixC(c,K.L([104,100,94]),.65);},   /* the breccia's grey, the regolith over it */
 after(){}};
var PORTAL=null;
