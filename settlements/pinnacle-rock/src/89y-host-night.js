// ================================================================= HOST — the night's fires and lamps (core/atmos), on the world hour
// PLAN.md P4's night without the life (owner, 2026-10-19: "add night mode alone ... full sim to come later"): what is lit
// is placed from the records, and each light keeps core/atmos's hours (lit from dusk to dawn, the glow layer following):
//   the Crown       braziers round its square and before the assembly hall's door (the fires on the Crown)
//   the roosts      a lamp at every stall's head (its front on the deck's edge), a lantern at every keeper's shelter door,
//                   at the Stair's gates and the lifts' capstans
//   the beacons     a turning beacon on each beacon tower (the south nose, the north-east rim)
//   the bands       a fire before each band's chief's pavilion
//   the Deep Root   braziers either side of its door; its lamp niches and the twelve tribes' niches lit day and night, and
//                   one warm light in the hall (a floodLight on at every hour)
//   the farms       dark (the palisade's gates keep a lantern)
// The light, the fog and the dome are the night fragment's (89n-host-night.js); ATMOS is bound in 89w-host-water.js.
const NIGHT_LIGHTS=(function(){if(typeof ATMOS==='undefined'||!ATMOS.h||!ATMOS.brazier)return null;try{
 const A=ATMOS,n={braziers:0,lamps:0,beacons:0,halls:0},WARM=[1,.72,.38],FIRE=[1,.55,.2];
 const fwd=ry=>[Math.sin(ry),Math.cos(ry)];   // a catalog piece's front (+z turned by ry)
 const brz=(x,z,y)=>{A.brazier(x,y==null?terrainH(x,z):y,z);n.braziers++;};
 const lamp=(x,y,z,s,c,on,off)=>{A.glowAdd(x,y,z,c||WARM,s||3,on,off);n.lamps++;};
 // THE CROWN: its square's corners and the middles of its sides, 3 m in; two before the hall's door
 if(TOWN){const sq=(TOWN.squares||[]).find(S=>S.name==='the Crown');
  if(sq){const P=sq.poly,cx=P.reduce((a,q)=>a+q[0],0)/P.length,cz=P.reduce((a,q)=>a+q[1],0)/P.length;
   P.forEach((q,i)=>{const r=P[(i+1)%P.length];[[q[0],q[1]],[(q[0]+r[0])/2,(q[1]+r[1])/2]].forEach(p=>{const dx=cx-p[0],dz=cz-p[1],l=Math.hypot(dx,dz)||1;brz(p[0]+dx/l*3,p[1]+dz/l*3);});});}
  const hall=(TOWN.lots||[]).find(L=>L.role==='hall');
  if(hall){const f=fwd(hall.ry),s=[f[1],-f[0]],o=hall.d/2+3;[-1,1].forEach(k=>brz(hall.x+f[0]*o+s[0]*k*(hall.w/2-2),hall.z+f[1]*o+s[1]*k*(hall.w/2-2)));}
  // THE BEACONS: on each beacon tower's top
  (TOWN.lots||[]).filter(L=>L.role==='beacon').forEach(L=>{A.beacon(L.x,L.y+L.h-.6,L.z,{len:120,rad:5});n.beacons++;});}
 // THE ROOSTS: a lamp at each stall's head (its front centre, 2.2 m up, a metre in from the edge); a lantern at each keeper's
 // shelter door, 2.4 m up; the Stair's gates either side; the lifts' capstans
 (ROOST.roosts||[]).forEach(S=>{if(S.fx==null)return;const dx=S.x-S.fx,dz=S.z-S.fz,l=Math.hypot(dx,dz)||1;lamp(S.fx+dx/l,S.y+2.2,S.fz+dz/l,2.2);n.stalls=(n.stalls||0)+1;});
 (ROOST.shelters||[]).forEach(S=>{const f=fwd(S.ry||0),o=(S.d||3)/2+.3;lamp(S.x+f[0]*o,S.y+2.4,S.z+f[1]*o,2.6);});
 ((ROOST.stair&&ROOST.stair.gates)||[]).forEach(G=>{const f=fwd(G.ry||0),s=[f[1],-f[0]],o=(G.w||4)/2+.6;[-1,1].forEach(k=>lamp(G.x+s[0]*k*o,G.y+3,G.z+s[1]*k*o,3.2,FIRE));});
 (ROOST.lifts||[]).forEach(L=>{if(L.capstan)lamp(L.capstan.x,L.capstan.y+3.2,L.capstan.z,3.2,FIRE);if(L.foot)lamp(L.foot.x,L.foot.y+3,L.foot.z,3.2,FIRE);});
 // THE BANDS: a fire 6 m before each band's chief's (or council) pavilion
 if(CAMPS)CAMPS.grounds.forEach(G=>{const c=(G.items||[]).find(it=>/chief|council/.test(it.key));if(!c)return;const f=fwd(c.ry),o=c.d/2+6;
  const x=c.x+f[0]*o,z=c.z+f[1]*o;brz(x,z,terrainH(x,z));});
 // THE FARMS: dark; the palisade's gates keep a lantern
 if(FARMS&&FARMS.palisade)(FARMS.palisade.gates||[]).forEach(G=>lamp(G.x,terrainH(G.x,G.z)+4.5,G.z,3,FIRE));
 // THE DEEP ROOT: braziers either side of its door; the niches' lamps (lit at every hour: on 0, off 30); one light in the hall
 if(CAVERN){const D=CAVERN.door,t=[-D.n[1],D.n[0]];[-1,1].forEach(k=>brz(D.x+D.n[0]*4+t[0]*k*4.5,D.z+D.n[1]*4+t[1]*k*4.5,CAVERN.y.door));
  CAVERN.dress.filter(r=>/niche/.test(r.key)).forEach(r=>{const f=fwd(r.ry);lamp(r.x+f[0]*.4,r.y+r.h*.45,r.z+f[1]*.4,/lamp/.test(r.key)?2.4:1.4,FIRE,0,30);});
  const H=CAVERN.hall,P=H.poly,hx=P.reduce((a,q)=>a+q[0],0)/P.length,hz=P.reduce((a,q)=>a+q[1],0)/P.length;
  A.floodLight(hx,H.y+6,hz,{dist:40,decay:1.4,intensity:1.6,on:0,off:30,glow:0});n.halls++;}
 A.finish();
 return n;}catch(e){reportErr('night lights: '+(e&&e.stack||e));return null;}})();
_mark('night lights');
