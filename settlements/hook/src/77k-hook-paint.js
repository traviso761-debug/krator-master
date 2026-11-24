/* ============================== HOOK: THE GROUND UNDER THE JUNGLE AND THE MANGROVES ([G data]) ============================== */
/* The Port kit paints its ground by height (seabed, beach sand, dry scrub) and by its stamps' paint; a build may paint the
   rest (kits/port 71, PORT.paint). Hook's (S4 of the owner's site plan, with the flora of 90e): the swamp bands
   (lf_hook_swamp*, core/world 41l) are mangrove mud, and the low ground the jungle has (outside Port Hook's zone, which paints its
   own; the walled peninsula, picked clean, in sparser patches) is the forest floor, broken in patches so it never
   reads as one sheet; steep ground and the shore's sand keep the kit's colours. Read at the terrain grid's nodes, whose
   heights are in PORT_ST.grid by then; the walled ground by the plan's lattice (77), not a ground read a node. */
const HOOK_PAINT=(function(){
 if(typeof HOOK_RUIN==='undefined'||typeof WLAND==='undefined')return null;
 const R=HOOK_RUIN,W=HOOK_WORLD,PITCH=R.PITCH,cx0=R.cx(0),cz0=R.cz(0),walled=new Set();
 for(const b of R.blocks)if(b.ground==='walled')for(let a=0;a<b.si;a++)for(let c=0;c<b.sj;c++)walled.add((b.i+a)+','+(b.j+c));
 const onWalled=(x,z)=>walled.has(Math.round((x-cx0)/PITCH)+','+Math.round((cz0-z)/PITCH));
 const SPIT=WLAND.benches.find(b=>b.id==='lf_hook_spit'),swamps=WLAND.benches.filter(b=>/^lf_hook_swamp/.test(b.id));
 const ZONE=((typeof HOOK_SITE!=='undefined'&&HOOK_SITE.districts||[]).find(d=>d.type==='zone')||{}).poly||null;
 const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 /* the ruin's square (the flora's and a margin): no paint beyond it */
 const BOX=[-4800,-7000,4600,2800];
 const bs=(a,v)=>{let lo=0,hi=a.length-1;if(v<=a[0])return 0;if(v>=a[hi])return hi;while(hi-lo>1){const m=(lo+hi)>>1;if(a[m]<=v)lo=m;else hi=m;}return a[hi]===v?hi:lo;};
 const node=(x,z)=>{const G=PORT_ST.grid;if(!G)return null;const i=bs(G.xs,x),j=bs(G.zs,z),k=j*G.nx+i;
  const h=G.H[k],sx=i<G.nx-1?(G.H[k+1]-h)/(G.xs[i+1]-G.xs[i]):0,sz=j<G.nz-1?(G.H[k+G.nx]-h)/(G.zs[j+1]-G.zs[j]):0;return {h,s:Math.hypot(sx,sz)};};
 const patch=(x,z)=>KRAND.fbm(x/140+11.3,z/140-4.1,0,3,0x4855)+.35*(KRAND.fbm(x/38-2.2,z/38+7.7,0,2,0x4856)-.5);
 function paint(x,z){if(x<BOX[0]||z<BOX[1]||x>BOX[2]||z>BOX[3])return null;
  const n=node(x,z);if(!n||n.h<-.3||n.s>.45)return null;
  if(R.townAt(x,z))return null;   /* the town (its quarters and a margin: 77) paints its own */
  if(n.h<4){const w=W.toWorld(x,z);for(const b of swamps)if(WLAND.benchD(b,w[0],w[1])<20)return 'mud';}
  if(n.h<1.6||n.h>60)return null;   /* the shore's sand; the heights' dry scrub */
  /* the walled peninsula, picked clean, greens in sparser patches (no field: the Glebe's are its own) */
  const pt=patch(x,z);if(onWalled(x,z))return pt>.55?'grass':null;
  if(SPIT&&n.h<12){const w=W.toWorld(x,z);if(WLAND.benchD(SPIT,w[0],w[1])===0)return pt>.55?'grass':null;}
  return pt>.42?'grass':null;}
 if(typeof PORT!=='undefined')PORT.paint=paint;
 return {paint};})();
