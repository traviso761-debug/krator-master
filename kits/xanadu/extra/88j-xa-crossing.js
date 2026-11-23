// ================================================================= XANADU KIT (opt-in) — river crossings: the paved ford, the ferry raft
// settlements/opal-ford/PLAN.md section 3 ("Missing: a paved ford", 2026-11-23; KNOWN_ISSUES.md). Opt-in: a page takes this file
// through its kit.json "external" (Ōpal-Phōrḍ's). Its origin is the water's surface: a page places the ford at the slack water's
// height over the shoal (o.y), the raft at the water's (it floats).
//   xa_ford        a paved causeway across a shoal of the river, its top a hand under the water, dressed kerbs either side,
//                  a row of stepping stones on its upstream side for the dry-shod, and a marker post at each end with its
//                  cairn; 96 m by 8 (o.len another length; the causeway runs along the piece's width, x)
//   xa_ferry_raft  a raft of lashed logs with a plank deck, a rail on its two long sides, a steering sweep and a pole; for the
//                  high water when the ford is shut; 8 m by 4.5
function buildXaFord(G,o){reseed(33721+(o.v|0));const L=o.len==null?96:o.len,W=5,stone=xC(0x9a9484),kerb=xC(0x8a8476),post=xC(0x6b5640);
 vnReg('Paved ford',0,0,L/2,1.6);
 vB('vStone',0,-.75,0,L,1.2,W,0,stone);                                   /* the causeway: its top 0.15 m under the water */
 for(const s of[-1,1])vB('vStone',0,-.6,s*(W/2+.2),L,1.1,.4,0,kerb);      /* its kerbs, a hand proud of the paving */
 for(let x=-L/2+1;x<L/2-1;x+=1.3){const j=rr(-.12,.12);vB('vStone',x+j,-.13,W/2+1.1,rr(.9,1.15),.7,rr(.9,1.1),rr(0,.6),stone);}   /* the stepping stones, 0.22 m over the water */
 for(const s of[-1,1]){vB('vWood',s*(L/2+.6),.9,-W/2-.6,.25,3.2,.25,0,post);kput('xConeP',[s*(L/2+.6),2.6,-W/2-.6],null,[.4,.5,.4],xC(XPAL.red));   /* the marker posts, a red cap */
  for(let k=0;k<5;k++)vB('vStone',s*(L/2+.6)+rr(-.5,.5),-.4+k*.12,-W/2-.6+rr(-.5,.5),rr(.4,.7),.3,rr(.4,.7),rr(0,1),kerb);}}   /* their cairns */
function buildXaFerryRaft(G,o){reseed(33731+(o.v|0));const L=8,W=4.5,wood=xC(0x6a4a2a),deck=xC(0x8a6a48),dark=xC(0x4a3a28);
 vnReg('Ferry raft',0,0,4.5,1.6);
 for(let i=0;i<6;i++){const x=-W/2+W*(i+.5)/6;vB('vWood',x,-.32,0,W/6-.06,.36,L-rr(0,.4),0,wood);}   /* the logs, squared and lashed */
 vB('vWood',0,.12,0,W-.3,.08,L-.6,0,deck);                                   /* the plank deck */
 for(const s of[-1,1]){vB('vWood',s*(W/2-.2),.75,0,.1,.08,L-.8,0,dark);for(const z of[-3.4,0,3.4])vB('vWood',s*(W/2-.2),.45,z,.1,.6,.1,0,dark);}   /* the rails */
 xnMember('vWood',[0,.5,L/2-.4],[0,.3,L/2+2.6],.08,.06,[0,1,0],dark);       /* the steering sweep over the stern */
 xnMember('vWood',[1.2,.2,-1],[1.6,3.8,-1.6],.05,.04,[1,0,0],deck);          /* the pole */
 xnFolk(0,.16,0,2,1.2);}
XA.def({key:'xa_ford',name:'Paved ford',family:'Public',cls:'infrastructure',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:96,d:8,h:2,fw:96,fd:5,build:buildXaFord});
XA.def({key:'xa_ferry_raft',name:'Ferry raft',family:'Lake craft',cls:'vessel',tags:{type:['ferry'],propulsion:['pole'],hull:'raft',wealth:'poor',crew:2,role:'carries the ford\'s traffic in the high water',lit:false},w:4.5,d:8,h:1.6,fw:4.5,fd:8,nv:1,build:buildXaFerryRaft});
