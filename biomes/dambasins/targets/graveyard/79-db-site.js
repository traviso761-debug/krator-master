// TARGET: graveyard - station 2 of the dam basins (biomes/dambasins/PLAN.md, section 3): the ship graveyard at the west notch.
// THE SITE (read by 80-db-bed.js, which sorts after this). When the west dam broke, the lake ran out through the notch it
// stood in, and everything afloat was drawn down the lake toward the breach: the ships under way, the barges, the lake's
// boats. The outflow scoured a channel along the old floor, deepening and narrowing into the gap, and the ships jammed in
// its throat, the first ones broadside across it, the rest driven onto them, until the water had gone (nsemiarid/PLAN.md
// section 5, the hulks' second population). This page is that approach, upstream of the dam.
//   the frame   y = 0 is the old full level (900 m: scale model dams.json, the west dam: crest 950, foot 700, cut 460); +z runs
//               down the old lake toward the notch, which stands at z = 0; x across the valley
//   the valley  the old floor at -200 at the dam's face (its foot, 700 m), rising upstream; its flanks climb past the old line
//               (y = 0) into the abutment hills, the bathtub ring a white band on both, converging on the dam
//   the channel the outflow's scour along the floor, 650 m wide and nothing deep 3.2 km upstream, 170 m wide and 240 m deep at
//               the gap (the cut: 460 m), a U with grooves along the flow; the basin's marks (strandlines, ring) stay off it:
//               it was cut after the lake's levels were left
//   the dam     a ridge across the valley at z -60..300, the old crest 50 m over the line, the abutments rising to the pass
//               (1,160 m: 260 m over it); the breach a gap down to the channel's floor, its walls the dam's broken concrete
//               (91y-db-dam.js draws the stubs)
// SCALE MODEL 5.1 (checked 2026-11-08): the dams keep their 4.21 numbers (dams.json), but the beds no longer close under their
// full levels on 5.1's ground (a fill from either lake's seed spreads over most of the map), so the station is an ideal type
// on the plan's numbers, as station 1 is; openworld/north-basin is on biomes/STATIONS-MAP-5.1.md's re-cut list.
const GY={floor:-200,rise:.022,cut:-440,chanZ0:-3200,chanW0:1100,chanW1:300,chanNarrow:-1500,damZ0:-60,damZ1:300,crest:50,pass:260,gap:130};
const gySm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function gyAxis(z){return 60*Math.sin(z/1900+.7)+25*Math.sin(z/610);}
// the valley's half-width at the old line (the flanks cross y = 0 there): wide upstream, narrowing on the dam
function gyW(z){return z<0?900+.32*(-z):900-1.2*Math.min(z,300);}
// the channel's depth under the floor and its half-width (it began where the outflow first gathered, chanZ0)
// (it deepens all the way down; it narrows only over its last 1.5 km, into the gap: the throat where the ships jammed)
function gyChan(z){const t=gySm(GY.chanZ0,0,z);return{depth:(GY.floor-GY.cut)*t,w:lerp(GY.chanW0,GY.chanW1,gySm(GY.chanNarrow,0,z))*.5};}
function gyFloor(z){return GY.floor+GY.rise*Math.max(0,-z)-(z>GY.damZ1?.012*(z-GY.damZ1):0);}
// the scour's share at (x, z): 1 in the channel, 0 on the old floor (the basin's marks lie only where it is 0)
function gyChanK(x,z){const C=gyChan(Math.min(z,0)),d=Math.abs(x-gyAxis(z));return z<GY.chanZ0?0:1-gySm(C.w*.7,C.w*1.15,d);}
function gyBase(x,z){const ax=gyAxis(z),d=Math.abs(x-ax),W=gyW(Math.min(z,GY.damZ1)),fl=gyFloor(z);
 // the old floor and its flanks, up past the line into the hills (their tops the abutments' height on the dam)
 const flat=W*.42,side=-fl*gySm(flat,W,d),hill=(GY.pass*.7+GY.pass*.3*fbm(x/900,z/900,3.1,3))*gySm(W,W+1500,d)+(fbm(x/260,z/260,5.7,2)-.5)*16*gySm(W*.6,W*1.3,d);
 let h=fl+side+hill+(fbm(x/120,z/120,2.2,2)-.5)*2.4;
 // the dam's ridge: everything across the valley at least the old crest, the abutments its pass
 const damK=gySm(GY.damZ0-160,GY.damZ0,z)*(1-gySm(GY.damZ1,GY.damZ1+220,z));
 if(damK>0)h=Math.max(h,lerp(h,GY.crest+(GY.pass-GY.crest)*gySm(GY.gap*2,W*1.4,d),damK));
 // the channel: a U along the flow, grooved, through the gap and on down the far side
 // its floor: the old floor less the scour upstream, the cut through the gap, falling on gently below the dam
 const C=gyChan(Math.min(z,0)),cw=z>0?GY.gap:C.w,bottom=z<=0?fl-C.depth:GY.cut-.008*z;
 const k=1-gySm(cw*.55,cw*1.05,d);if(k>0){const groove=(fbm(x/22,z/260,8.3,2)-.5)*3.5*k;h=Math.min(h,lerp(h,bottom,Math.pow(k,.7)))+groove;}
 return h;}
// the channel's flat floor (its walls rise from .55 of its half-width): 1 where a hull may lie, its footprint's disk of radius r inside it
function gyOnFloor(x,z,r){const C=gyChan(Math.min(z,0));return Math.abs(x-gyAxis(z))+(r==null?0:r)<C.w*.6;}
// gravel bars and giant current ripples on the channel's floor (the outflow's): crests across the flow, 60-90 m apart
function gyRipple(x,z){const k=gyChanK(x,z);if(k<=0||z>GY.damZ0)return 0;const s=z/74+.8*Math.sin(x/190);return k*gySm(GY.chanZ0,GY.chanZ0+900,z)*(Math.pow(.5+.5*Math.sin(s*6.2832),3)-.35)*2.2;}
// THE PILE: where the hulks lie (89z-rows.js places them from GY_PILE; the wrecks and debris keep off them)
const GY_PILE={z0:-1300,z1:-130,hulls:[]};
var DB_SITE={levels:{lake:'the west lake (its notch)',sill:-200,drainZ:2800},seed:905,
 base:(x,z)=>gyBase(x,z)+gyRipple(x,z),
 member:(x,z)=>(1-gyChanK(x,z))*(1-gySm(GY.damZ0-200,GY.damZ0,z)),
 // the wrecks: the lake's boats drawn down with the ships, thickest in the channel above the pile, thinning up the flanks
 wrecks:()=>({x0:-2600,x1:2600,z0:-5200,z1:GY.damZ0-40,accept:(x,z,h)=>{if(h>-.5)return 0;const k=gyChanK(x,z);return .06+.5*k*gySm(GY.chanZ0,-1500,z);},
  avoid:(x,z)=>GY_PILE.hulls.some(H=>Math.hypot(x-H.x,z-H.z)<H.L*.55+40)}),
 // the debris: the dam's own concrete and steel and the ships' plating, thickest at the gap and in the pile's lee
 flotsam:()=>({x0:-1800,x1:1800,z0:-3600,z1:GY.damZ0-10,accept:(x,z,h)=>{if(h>-.5)return 0;const k=gyChanK(x,z);return .08+.6*k*gySm(-3000,-200,z);},
  avoid:(x,z)=>GY_PILE.hulls.some(H=>Math.hypot(x-H.x,z-H.z)<H.L*.5+12)}),
 // the verify's window (the ring, the dust) and this station's own checks (verify.py runs each as it is and broken)
 check:{x0:-2400,x1:2400,z0:-4800,z1:-250},
 checks:[
  ['gy-channel-cut',bad=>{const lift=bad?60:0,gap=DB_NAT(gyAxis(0),0)+lift,up=DB_NAT(gyAxis(GY.chanZ0),GY.chanZ0)+lift,want=gyFloor(GY.chanZ0);
    return{ok:Math.abs(gap-GY.cut)<15&&Math.abs(up-want)<25,detail:'the channel at the gap '+gap.toFixed(0)+' m (the cut '+GY.cut+'), '+(-GY.chanZ0)+' m up it '+up.toFixed(0)+' m (the old floor '+want.toFixed(0)+')'};}],
  ['gy-pile-in-the-channel',bad=>{const P=(PORT_LAYOUT.db&&PORT_LAYOUT.db.pile)||[],dx=bad?900:0;let off=0,over=0;
    P.forEach((p,i)=>{if(p.D.some(b=>!gyOnFloor(b[0]+dx,b[1],b[2]*.6)))off++;for(let j=0;j<i;j++)if(P[j].D.some(a=>p.D.some(b=>Math.hypot(a[0]-b[0],a[1]-b[1])<a[2]+b[2]-4)))over++;});
    const across=P.filter(p=>Math.abs(Math.sin(p.h))>.7).length;
    return{ok:P.length>=8&&!off&&!over,detail:P.length+' hulks in the pile ('+across+' broadside), '+off+' out of the channel, '+over+' overlapping'};}]]};
