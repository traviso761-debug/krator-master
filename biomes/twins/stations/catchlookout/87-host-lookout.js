// ================================================================= HOST — CATCH-LOOKOUT SPRING's own structures (station 6)
// stationBuild() (88-host-build.js calls it before the kit's pass and the one bake):
//   THE LOOKOUT CAIRN  a guides' cairn 2.5 m high on the scarp's lip, stacked basalt, its cap daubed with sulphur and a ring of white
//                      travertine stones round its foot (the kit's cairnstones: the Dark-Tube Road's marks, here the Steaming-Stone Dash's
//                      last); a core/tags record before its stones are put
// STATION_TEMP: the oasis's air (89c-host-oasis.js: oasisTemp; PLAN.md section 6: +17 C by the pools, +2 C on the ledge).
// The terraces' water is 89d-host-terraces.js (after the atmosphere is bound).
const STN_BUILT={};
function STATION_TEMP(x,y,z){return oasisTemp(x,y,z);}
function stationBuild(){const t0=performance.now(),out={};
 const C=CAIRN,y=C.y,H=KRAND.hash(WORLD,1056,1462,0xCA1B),u=k=>KRAND.unit(KRAND.hash(H,k));
 REGISTER({name:C.name,x:C.x,z:C.z,y:y-.3,r:3.2,h:3.4,kind:'landmark',tags:{culture:'xanadui',route:'B',use:['cairn','lookout']}});
 let yy=y,n=0;const prevKit=BIO.kit('twins');BIO.cur='twins/ground';BIO.range=2500;   /* the kit's items: its registry (closed after 70) */
 for(let m=0;m<9;m++){const s=mix(1.25,.35,m/8)*mix(.9,1.1,u(m)),top=m===8;
  BIO.put('cairnstone',[C.x+(u(20+m)-.5)*.15,yy+s*.32,C.z+(u(40+m)-.5)*.15],BIO.fn.qEuler((u(60+m)-.5)*.2,u(80+m)*TAU,(u(100+m)-.5)*.2),[s,s*.8,s],top?TWINS.PAL.sulphur[0]:TWINS.PAL.basalt[m%4]);yy+=s*.5;n++;}
 for(let k=0;k<14;k++){const a=k/14*TAU+u(200+k)*.2,r=2.1+u(220+k)*.3,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r,s=.22+.12*u(240+k);
  BIO.put('cairnstone',[x,terrainH(x,z)+s*.25,z],BIO.fn.qEuler(0,u(260+k)*TAU,0),[s,s*.7,s],TWINS.PAL.sinter[k%3]);n++;}
 BIO.range=null;BIO.cur=null;BIO.kit(prevKit);out.cairnStones=n;
 out.cones=(oasisItems()||{}).cones||0;
 REGISTER({name:'Catch-Lookout Spring, Manzar al-Masid (Oasis 5 of Route B: warm ground on the ledge over the Catch)',x:-20,z:0,y:SITE_Y-8,r:440,h:24,kind:'feature',tags:{route:'B',oasis:5}});
 REGISTER({name:LIP.name,x:LIP.c[0],z:LIP.c[1],y:LIP.below-5,r:60,h:LIP.H+14,kind:'feature'});
 REGISTER({name:BREACH.name,x:BREACH.x+EA[0]*40,z:BREACH.z+EA[1]*40,y:terrainH(BREACH.x+EA[0]*90,BREACH.z+EA[1]*90)-4,r:70,h:LIP.H+10,kind:'feature',tags:{route:'B'}});
 out.ms=Math.round(performance.now()-t0);window._station=out;return out;}
function STATION_SMOKE(){return oasisSmoke().concat(TER.treads.filter((t,i)=>i%3===0).map(t=>{const q=TER.line[Math.min(TER.line.length-1,Math.round((t.s0+t.s1)/20))];return[q[0],t.y+.2,q[1],'steam'];}));}
