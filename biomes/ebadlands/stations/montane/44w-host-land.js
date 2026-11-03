// ================================================================= HOST — STATION 3, the montane forest (PLAN-STATIONS.md; the final rebuild, 2026-11-02)
// Scale model 5.1 at px 1356,1016 (old canvas 1084,686): Dfb at 3,630 m (Dsb, Dfc and Dsc round it), 690 mm, +7 degC (20/-6), 2 km of relief within 30 km.
// The page compresses the montane belt into 6 km, rising east:
//   west          PONDEROSA AND ASPEN: park-like pine over grass, aspen groves in the draws, gambel oak at the foot
//   the middle    THE MEADOW, a wet flat in a basin (grass and flowers, no trees: the trees' records are kept off it, 89z LAND.build), and
//                 THE BURN, a hillside the fire took: charred ground, standing snags and fallen logs, no living tree
//   east          SPRUCE-FIR climbing to a CIRQUE with its tarn (the reflections switch) and the stream it feeds down the valley
// granite: no bedded rock (no strata on the ground); crags on the steepest ground
const STATION=(function(){const R=3000;
 const MEADOW={x:-500,z:700,r:430},BURN={x:200,z:-1300,r:620},TARN={x:2150,z:-700,r:170,name:'The cirque tarn',colour:0x2e5a68};
 const line=x=>-700+260*Math.sin(x*.0008+2.2)+70*Math.sin(x*.0029);
 const meadowK=(x,z)=>smooth(1.15,.8,blobD(x,z,MEADOW.x,MEADOW.z,MEADOW.r,4));
 const burnK=(x,z)=>smooth(1.1,.8,blobD(x,z,BURN.x,BURN.z,BURN.r*(1+.25*(fbm(x*.003+2,z*.003,151,2)-.5)),5));   /* one burn scar, its edge ragged */
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>{const xm=x+150*Math.sin(z*.0012)+50*Math.sin(z*.004);return 900+800*Math.pow(smooth(-3400,3600,xm),1.2)+smooth(-500,2500,xm)*(ridge(x,z,.0011,23)-.55)*260+28*(fbm(x*.006,z*.006,29,2)-.5);};
 const ground=(x,z)=>{let h=base(x,z);const mk=meadowK(x,z);if(mk>0)h=mix(h,base(MEADOW.x,MEADOW.z)-4+1.5*(fbm(x*.01,z*.01,152,2)-.5),mk);return h;};
 // the stream: from below the tarn, west down the valley to the map's edge, its floor a little under the valley's
 const bedY=x=>{let lo=1e9;for(let xx=x;xx<=R*1.1+40;xx+=40)lo=Math.min(lo,base(xx,line(xx))-3);return lo;};
 const BED=[];for(let x=-R*1.15;x<=R*1.15;x+=20)BED.push(bedY(x));const bed=x=>{const t=(x+R*1.15)/20,i=clamp(Math.floor(t),0,BED.length-2),f=clamp(t-i,0,1);return BED[i]*(1-f)+BED[i+1]*f;};
 const L=stationLand({R,ground,groundN:540,tarn:TARN,
  river:{line,bed,W:x=>mix(14,7,smooth(-2500,1800,x)),uo:x=>4,name:'The stream',width:10,speed:1.8,look:[0x6aa0a0,0x3a6870]},
  cold:(x,z,h)=>.3+(h-900)/1450+.04*(fbm(x*.002,z*.002,133,2)-.5),
  wet:(x,z,h)=>.32+.12*smooth(900,1600,h)+.08*fbm(x*.0016,z*.0016,139,2)+.4*meadowK(x,z),
  rockAt:(x,z,h,sl)=>smooth(.55,.85,sl)*smooth(.5,.66,fbm(x*.005+5,z*.005-7,135,2)),strataK:()=>0,
  barren:(x,z,h)=>smooth(1720,1800,h)*.6,char:burnK,upland:h=>(h-900)/900,
  snowAt:(x,z,h,sl)=>smooth(1650,1760,h)*smooth(.7,.35,sl)*smooth(.45,.6,fbm(x*.004,z*.004,134,2)),
  spine:[[-2600,0],[-1500,-1200],[-1500,1200],[MEADOW.x,MEADOW.z],[BURN.x,BURN.z],[600,1400],[1200,-200],[1800,1200],[TARN.x,TARN.z],[2700,-1800],[2700,800],[-300,-200]]});
 L.MEADOW=MEADOW;L.BURN=BURN;L.meadowK=meadowK;L.burnK=burnK;L.line=line;return L;})();
const TERR=STATION.TERR,VENTS=null,POOLS=[],POOLL=[],TARN=STATION.TARN,TARNL=STATION.TARNL,RIVER_SPEC=STATION.RIVER_SPEC,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function poolD(x,z){return[1e9,-1];}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
// THE MEADOW AND THE BURN, after the kit's placement and before the variants grow (89z): the tree records inside either are taken out (the floor stays:
// the meadow's grass and flowers, the burn's), and the burn gets its dead: standing snags and fallen logs, charred rods on a KRAND lattice
function montaneOpenings(){const M=STATION,keep=T=>M.meadowK(T.x,T.z)<.3&&M.burnK(T.x,T.z)<.25;const n0=EBADLANDS.TREES.length;
 EBADLANDS.TREES=EBADLANDS.TREES.filter(keep);let snags=0,logs=0;const c0=BIO.cur,pv=BIO.kit('ebadlands');BIO.cur='badlands/floor';
 try{const cell=16,N=Math.ceil((M.BURN.r*1.2)/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(5871,i,j,0x41),u=q=>KRAND.unit(KRAND.hash(h,q,0,0x42)),x=M.BURN.x+(i+u(1))*cell,z=M.BURN.z+(j+u(2))*cell,b=M.burnK(x,z);
   if(b<.4||u(3)>b*.8||BIO.mask(x,z)<=0)continue;const y=terrainH(x,z),H=8+16*u(4),lean=(u(5)-.5)*.12,a=u(6)*TAU,col=u(7)<.5?0x2a2622:0x3a342e;
   if(u(8)<.62){BIO.beam('rod',[x,y-.3,z],[x+Math.cos(a)*lean*H,y+H,z+Math.sin(a)*lean*H],.28+.2*u(9),.06,col);snags++;}
   else{const L=6+10*u(4),ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;BIO.beam('rod',[x,y+.25,z],[ex,terrainH(ex,ez)+.2,ez],.22+.12*u(9),.12,col);logs++;}}}
 finally{BIO.kit(pv);BIO.cur=c0;}
 return{treesTaken:n0-EBADLANDS.TREES.length,snags,logs};}
const LAND={name:'The montane forest (ebadlands station 3)',title:'Krator biome — the eastern badlands: the montane forest',
 hint:'Station 3 of the eastern badlands: ponderosa and aspen, a wet meadow, a burn with its snags, spruce-fir up to a cirque and its tarn (Dfb/Dfc, 3.6 km on the model)',
 region:{name:'The montane forest (station 3)',x:0,z:0,r:TERR.R,h:1200},arcade:false,sky:{px:1084,py:686},
 fog:{falloff:1/600,sun:.3,sky:.3,mist:{density:.0012,y:STATION.MEADOW?900:0,depth:12,noise:.7}},climate:{wet:true,cold:true},snowLine:[1650,1780],wet:true,groundN:540,
 groundLayers:['steppe','needles','tundra'],
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dx=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g+dx*.2-dw*.1+160*(fbm(x*.0009,z*.0009,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[0,700,1150,1600,1750],farLabel:'The mountains past the map',
 exportBox:[TARN.x-150,TARN.z-150,TARN.x+150,TARN.z+150],
 build:()=>montaneOpenings(),
 views:H=>{const {P,look,atTree,nearTree,gh}=H,M=STATION.MEADOW,B=STATION.BURN;
  return{
  'Ponderosa and aspen':atTree(nearTree('ponderosa',P.pine[0],P.pine[1],20),48,3.2,3),
  'Aspen grove':atTree(nearTree('aspen',P.pine[0],P.pine[1]),22,.4,2),
  'The meadow':[M.x-M.r*1.25,gh(M.x-M.r*1.25,M.z,6),M.z,M.x+M.r*.5,gh(M.x+M.r*.5,M.z,1),M.z-80],
  'The burn':[B.x-B.r*.55,gh(B.x-B.r*.55,B.z+120,6),B.z+120,B.x+B.r*.5,gh(B.x+B.r*.5,B.z-60,4),B.z-60],
  'Snags in the burn':[B.x-60,gh(B.x-60,B.z+30,2),B.z+30,B.x+40,gh(B.x+40,B.z,10),B.z],
  'Spruce close-up':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,16,a,3);})(),
  'Spruce-fir forest':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,75,a,12);})(),
  'The cirque tarn':[TARN.x-TARN.r*1.3,Math.max(TARNL+5,gh(TARN.x-TARN.r*1.3,TARN.z+TARN.r*.7,3)),TARN.z+TARN.r*.7,TARN.x+TARN.r*.6,TARNL+30,TARN.z-TARN.r*.5],
  'The stream':(function(){const ln=STATION.line,x=-800;return[x,gh(x,ln(x)+30,4),ln(x)+30,x+300,gh(x+300,ln(x+300),2),ln(x+300)];})(),
  'The valley from the cirque':look(2300,-300,60,-1500,-200,0)};},
 probes:{bed(){const x=-600;return[x,STATION.WL(x)-1.2,STATION.line(x)];}}};
