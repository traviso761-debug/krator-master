// ---------- the plan of the Ring ----------
// The same lines tools/make-isengard.py lays out - the Isen's cut round the east of the plain, the eight roads to
// the centre, the two ring roads, the way from the gate - so that what the page puts on the plain (works.js,
// treegarth.js, events.js) keeps off them. Keep the numbers in step with the generator's.
export const RI=790,RO=860,FLOOR=480,BOWL=14;
export const GATE_A=Math.PI/2,INFLOW_A=-Math.PI/4;
export const ROAD_A=[...Array(8)].map((_,k)=>GATE_A+(k+0.5)/8*Math.PI*2);
export const RINGS=[520,300];
export function channel(){const pts=[],a0=INFLOW_A,a1=GATE_A-0.11;
  for(let i=0;i<=24;i++){const t=i/24,a=a0+(a1-a0)*t,r=RI-60-40*Math.sin(t*Math.PI);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}return pts;}
const CH=channel();
const angDist=(a,b)=>Math.abs(((a-b)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);
export function nearChannel(x,z){let b=1e9;for(const [cx,cz] of CH)b=Math.min(b,Math.hypot(x-cx,z-cz));return b;}
// is (x, z) on open plain, clear of the roads, the cut, the centre and the wall by `pad` metres?
export function clearOfPlan(x,z,pad){
  const d=Math.hypot(x,z);if(d<190||d>RI-40-pad)return false;
  if(nearChannel(x,z)<30+pad)return false;
  const a=Math.atan2(z,x);
  for(const ra of ROAD_A)if(angDist(a,ra)*d<12+pad)return false;
  if(angDist(a,GATE_A)*d<18+pad)return false;
  for(const r0 of RINGS)if(Math.abs(d-r0)<9+pad)return false;
  return true;}
// the height of the plain at a radius: a shallow bowl
export const plainY=d=>FLOOR-BOWL*(1-Math.min(1,(d/RI))**2);
// Saruman's dam across the Isen above the Ring, and its reservoir (tools/make-isengard.py digs the basin and
// builds the rock shoulders; dam.js draws the dam and the water). x is the river's at the dam.
export const DAM={x:653,z:-1700,crest:576,base:520,span:560,level:568,bed:548,resZ:[-2200,-1712],resW:760};
