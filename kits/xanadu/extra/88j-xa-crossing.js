// ================================================================= XANADU KIT (opt-in) — river crossings: the paved ford, the ferry raft
// settlements/opal-ford/PLAN.md section 3 ("Missing: a paved ford", 2026-11-23; KNOWN_ISSUES.md). Opt-in: a page takes this file
// through its kit.json "external" (Ōpal-Phōrḍ's). Its origin is the water's surface: a page places the ford at the slack water's
// height over the shoal (o.y), the raft at the water's (it floats).
//   xa_ford        a paved causeway across a shoal of the river, its top a hand under the water, dressed kerbs either side,
//                  a row of stepping stones on its upstream side for the dry-shod, and a marker post at each end with its
//                  cairn; 96 m by 8 (o.len another length; the causeway runs along the piece's width, x)
//   xa_ferry_raft  a raft of lashed logs with a plank deck, a rail on its two long sides, a steering sweep and a pole; for the
//                  high water when the ford is shut; 8 m by 4.5
//   xa_weir        a mill's weir across the river: a dressed stone wall, its crest 0.5 m over the water, a sluice at one end; 56 m
//   xa_fish_weir   stake fences in a V down the current with a basket trap at its tip; 44 m across, 30 m deep, centred (the tip at -z)
// (the weirs: settlements/opal-ford KNOWN_ISSUES.md, "boxes drawn from the plan's records", 2026-11-23)
function buildXaFord(G,o){reseed(33721+(o.v|0));const L=o.len==null?96:o.len,W=5,stone=xC(0x9a9484),kerb=xC(0x8a8476),post=xC(0x6b5640);
 vnReg('Paved ford',0,0,L/2,1.6);
 /* all on its lot (L by 8: kits/xanadu/tests/test-footprints.js): the causeway 3.6 m short of the lot's ends, the marker posts
    and their cairns on its ends, the stepping stones inside its upstream side */
 const C=L-3.6;vB('vStone',0,-.75,0,C,1.2,W,0,stone);                     /* the causeway: its top 0.15 m under the water */
 for(const s of[-1,1])vB('vStone',0,-.6,s*(W/2+.2),C,1.1,.4,0,kerb);      /* its kerbs, a hand proud of the paving */
 for(let x=-C/2+1;x<C/2-1;x+=1.3){const j=rr(-.12,.12);vB('vStone',x+j,-.13,W/2+.85,rr(.8,.95),.7,rr(.8,.9),rr(0,.5),stone);}   /* the stepping stones, 0.22 m over the water */
 for(const s of[-1,1]){const px=s*(L/2-1);vB('vWood',px,.9,-W/2-.6,.25,3.2,.25,0,post);kput('xConeP',[px,2.6,-W/2-.6],null,[.4,.5,.4],xC(XPAL.red));   /* the marker posts, a red cap */
  for(let k=0;k<5;k++)vB('vStone',px+rr(-.4,.4),-.4+k*.12,-W/2-.6+rr(-.4,.4),rr(.4,.6),.3,rr(.4,.6),rr(0,1),kerb);}}   /* their cairns */
function buildXaFerryRaft(G,o){reseed(33731+(o.v|0));const L=6.4,W=4.5,wood=xC(0x6a4a2a),deck=xC(0x8a6a48),dark=xC(0x4a3a28);   /* 6.4 m long: its sweep over the stern inside the 8 m lot */
 vnReg('Ferry raft',0,0,4.5,1.6);
 for(let i=0;i<6;i++){const x=-W/2+W*(i+.5)/6;vB('vWood',x,-.32,0,W/6-.06,.36,L-rr(0,.4),0,wood);}   /* the logs, squared and lashed */
 vB('vWood',0,.12,0,W-.3,.08,L-.6,0,deck);                                   /* the plank deck */
 for(const s of[-1,1]){vB('vWood',s*(W/2-.2),.75,0,.1,.08,L-.8,0,dark);for(const z of[-2.6,0,2.6])vB('vWood',s*(W/2-.2),.45,z,.1,.6,.1,0,dark);}   /* the rails */
 xnMember('vWood',[0,.55,L/2-1.6],[0,.3,3.85],.08,.06,[0,1,0],dark);        /* the steering sweep over the stern, its blade inside the lot */
 xnMember('vWood',[1.2,.2,-1],[1.6,3.8,-1.6],.05,.04,[1,0,0],deck);          /* the pole */
 xnFolk(0,.16,0,2,1.2);}
// the mill's weir: a low wall of dressed stone across the river, its crest half a metre over the water above it (its origin
// the water's surface there), a sluice at one end where the race leaves; 56 m by 3
function buildXaWeir(G,o){reseed(33741+(o.v|0));const L=o.len==null?56:o.len,stone=xC(0x9a9484),cap=xC(0x8a8476),wood=xC(0x6b5640);
 vnReg('Weir',0,0,L/2,1.2);
 vB('vStone',0,-1.1,0,L,3.2,2.6,0,stone);vB('vStone',0,.45,0,L,.12,2.8,0,cap);                     /* the wall, its coping */
 for(let x=-L/2+2;x<L/2-2;x+=4)vB('vStone',x+rr(-.4,.4),-.3,1.1+rr(0,.15),rr(.6,.9),.5,rr(.5,.7),rr(0,1),stone);   /* the apron's fallen stones below it (inside the 4 m lot) */
 const sx=L/2-2.2;for(const s of[-1,1])vB('vWood',sx+s*1.1,.3,0,.2,2.2,.3,0,wood);vB('vWood',sx,1.3,0,2.4,.2,.3,0,wood);vB('vWood',sx,-.2,-.05,2,1.2,.08,0,wood);}   /* the race's sluice */
// a fish weir: stake fences in a V pointing down the current, a basket trap at its tip; 44 m across, 30 m from the mouth to the
// tip (the origin the water's surface at the mouth, the tip toward -z)
function buildXaFishWeir(G,o){reseed(33751+(o.v|0));const W=o.wid==null?44:o.wid,D=30,wood=xC(0x6b5640),dark=xC(0x4a3a28);
 vnReg('Fish weir',0,0,W/2,1.6);   /* centred on its origin: the mouth at +D/2, the tip at -D/2 */
 const run=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<=L;s+=.8){const x=a[0]+(b[0]-a[0])*s/L,z=a[1]+(b[1]-a[1])*s/L;vB('vWood',x,-1.3+rr(0,.2),z,.12,3.4+rr(0,.3),.12,rr(0,3),wood);}
  const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];vB('vWood',m[0],.8,m[1],.06,.08,L,Math.atan2(b[0]-a[0],b[1]-a[1]),dark);};   /* the stakes; the withy rail along their tops */
 run([-W/2,D/2],[0,-D/2]);run([W/2,D/2],[0,-D/2]);
 vB('vWood',0,-.4,-D/2+1.3,1.6,1.4,2.2,0,dark);}                                                       /* the basket trap in the tip */
XA.def({key:'xa_weir',name:'Weir',family:'Public',cls:'infrastructure',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:56,d:4,h:2,fw:56,fd:3,build:buildXaWeir});
XA.def({key:'xa_fish_weir',name:'Fish weir',family:'Lake trades',cls:'infrastructure',tags:{type:['industry'],wealth:'poor',lit:false},w:44,d:33,h:2,fw:44,fd:33,build:buildXaFishWeir});
XA.def({key:'xa_ford',name:'Paved ford',family:'Public',cls:'infrastructure',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:96,d:8,h:2,fw:96,fd:5,build:buildXaFord});
XA.def({key:'xa_ferry_raft',name:'Ferry raft',family:'Lake craft',cls:'vessel',tags:{type:['ferry'],propulsion:['pole'],hull:'raft',wealth:'poor',crew:2,role:'carries the ford\'s traffic in the high water',lit:false},w:4.5,d:8,h:1.6,fw:4.5,fd:8,nv:1,build:buildXaFerryRaft});
