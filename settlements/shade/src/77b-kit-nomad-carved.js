// ================================================================= EASTERN NOMAD KIT — the carved family (Petra)
// Everything here is cut from the cliff: the back plane is z = 0 and the host
// sets it ~1 m inside the face, so the rock closes round it. The stone is the
// strata material (77a), so the bands of the cliff run across the carving.
//
//   buildTreasury({width,height,seed})      the Khazneh: a two-storey temple front in a niche
//   buildCrowTomb({width,height,ledge,seed})  a Hegra-style house front: pilasters, crow-steps
//   buildRockStair({run,rise,width,dir,seed}) steps cut along the face, rising toward +x (dir 1) or -x
//   buildLedge({length,depth,seed})           the gallery an upper row stands on
(function(){
const K0=NOMAD.kit,MAT=NOMAD.MAT;
// a column: base, shaft (slight entasis), a flared capital and its abacus
function column(K,x,z,y0,h,r){K.color(null,1);K.cyl('stone',x,y0,z,r*1.32,r*1.4,h*.04,12);K.cyl('stone',x,y0+h*.04,z,r*.9,r,h*.82,12);
 K.cyl('stone',x,y0+h*.86,z,r*1.5,r*.95,h*.1,12);K.block('stone',x,y0+h*.96,z,r*3.2,h*.04,r*3.2);}
function buildTreasury({width=24,height=36,seed=1}={}){
 const W=Math.max(10,width),H=Math.max(14,height),u=W/24,K=K0(seed),D=3.4*u;   // D: how far the niche's mouth stands out from its back
 // the niche: the rock bulges round a recess. Cheeks and a hood, wedge-shaped so
 // their outer edges die back into the face (a box would read as a crate).
 const m=2.6*u;
 K.color(null,.94);
 K.prism('stone',[[-W/2,0],[-W/2,D],[-W/2-m,0]],0,H+2.6*u);
 K.prism('stone',[[W/2,0],[W/2+m,0],[W/2,D]],0,H+2.6*u);
 K.extrudeX('stone',[[0,H],[D,H],[D,H+.8*u],[0,H+4.2*u]],-W/2-m*.6,W/2+m*.6);
 K.color(null,.8);K.block('stone',0,0,.15,W,H,.3);                              // the niche's back, a shade darker
 // LOWER ORDER: steps, a portico of six columns, entablature, pediment
 const h1=H*.46,cz=D-.9*u,cr=.52*u;
 K.color(null,1);for(let s=0;s<3;s++)K.block('stone',0,s*.35*u,D-.2*u-s*.35*u,W*(1-s*.02),.35*u,1.1*u+(2-s)*.35*u);
 const y1=1.05*u;
 for(const fx of [-.42,-.27,-.09,.09,.27,.42])column(K,fx*W,cz,y1,h1*.8,cr);
 K.color(null,.86);K.block('stone',0,y1,cz-1.6*u,W*.98,h1*.8,.4);                // the portico's back wall
 K.color(null,1);
 // doors: the great door in the middle, side chambers left and right
 K.block('dark',0,y1,cz-1.35*u,W*.13,h1*.58,.1);K.block('stone',0,y1+h1*.58,cz-1.3*u,W*.17,.5*u,.4);
 for(const sx of [-1,1]){K.block('dark',sx*W*.35,y1,cz-1.35*u,W*.07,h1*.4,.1);K.block('stone',sx*W*.35,y1+h1*.4,cz-1.3*u,W*.1,.35*u,.35);}
 const ye=y1+h1*.8;K.block('stone',0,ye,cz,W,.9*u,2.2*u);K.block('stone',0,ye+.9*u,cz+.2*u,W*1.02,.35*u,2.5*u);   // architrave and cornice
 for(let i=0;i<14;i++){const x=(-.46+i*.92/13)*W;K.cyl('stone',x,ye+.25*u,cz+1.1*u,.22*u,.22*u,.4*u,8);}     // the frieze's rosettes
 K.pediment('stone',-W*.31,W*.31,ye+1.25*u,H*.09,cz-1*u,cz+1.1*u);
 // UPPER ORDER: an attic, the tholos between two broken half-pediments
 const ya=ye+1.25*u+H*.09,yt=ya+.9*u;K.color(null,.95);K.block('stone',0,ya,cz-.4*u,W*.96,.9*u,1.6*u);
 const ht=H-yt-H*.07,rt=W*.11;K.color(null,1);
 K.cyl('stone',0,yt,cz-1.6*u,rt,rt,ht*.82,20);                                     // the drum
 for(let i=0;i<7;i++){const a=-Math.PI/2+i*Math.PI/6,x=Math.sin(a)*rt*1.12,z=cz-1.6*u+Math.cos(a)*rt*1.12;column(K,x,z,yt,ht*.82,.36*u);}
 K.cyl('stone',0,yt+ht*.82,cz-1.6*u,rt*1.25,rt*1.25,.5*u,20);
 K.lathe('stone',0,yt+ht*.82+.5*u,cz-1.6*u,[[rt*1.15,0],[rt*.75,H*.04],[rt*.2,H*.065]],16);                       // the tholos roof
 K.lathe('stone',0,yt+ht*.82+.5*u+H*.065,cz-1.6*u,[[.5*u,0],[.85*u,.7*u],[.6*u,1.4*u],[.25*u,1.9*u],[0,2.1*u]],12); // the urn
 for(const sx of [-1,1]){const px=sx*W*.33,pw=W*.24;
  column(K,px-pw*.32,cz-.4*u,yt,ht*.7,.38*u);column(K,px+pw*.32,cz-.4*u,yt,ht*.7,.38*u);
  K.color(null,.86);K.block('stone',px,yt,cz-1.9*u,pw,ht*.7,.4);K.block('dark',px,yt,cz-1.65*u,pw*.24,ht*.36,.1);K.color(null,1);
  K.block('stone',px,yt+ht*.7,cz-.4*u,pw*1.08,.7*u,1.7*u);
  // the broken pediment: each half rises toward the tholos
  const x0=sx<0?px-pw*.54:px+pw*.54,x1=sx<0?px+pw*.2:px-pw*.2;K.pediment('stone',Math.min(x0,x1),Math.max(x0,x1),yt+ht*.7+.7*u,H*.06,cz-1.3*u,cz+.4*u,x1);}
 return K.finish({kind:'building',name:'Rock-cut temple front (the Treasury)',culture:'eastern-nomad',types:['religious','civic'],
  footprint:NOMAD.rect(W+2*m,D,true),height:H+2.6*u,family:'treasury',seed:seed>>>0});}
function buildCrowTomb({width=7,height=10,ledge=false,seed=1}={}){
 const W=Math.max(4,width),H=Math.max(6,height),K=K0(seed),r=K.rnd,dp=.9,sh=.9+r()*.12;
 // the panel, cut a little proud, framed by pilasters
 K.color(null,.9*sh);K.block('stone',0,0,dp*.5,W,H*.74,dp);
 K.color(null,sh);for(const sx of [-1,1]){K.block('stone',sx*(W/2-.35),0,dp+.15,.7,H*.7,.4);K.block('stone',sx*(W/2-.35),H*.7,dp+.2,1,.4,.6);}
 // the cornice in two steps, then two rows of crow-steps (each a little stepped merlon)
 K.block('stone',0,H*.74,dp+.25,W+.3,H*.05,.6);K.block('stone',0,H*.79,dp+.3,W+.5,H*.035,.7);
 const n=Math.max(2,Math.round(W/3.4)),cw=W/n,y0=H*.825,hh=(H-y0)/2;
 for(let i=0;i<n;i++){const x=-W/2+cw*(i+.5);K.block('stone',x,y0,dp*.6,cw*.82,hh,dp);K.block('stone',x,y0+hh,dp*.5,cw*.46,hh,dp*.8);}
 // the door: jambs, lintel, a small pediment, the dark of the room behind
 const dw=Math.min(1.6,W*.24),dh=Math.min(2.8,H*.32);
 K.block('dark',0,0,dp+.02,dw,dh,.1);
 K.color(null,1.05*sh);for(const sx of [-1,1])K.block('stone',sx*(dw/2+.18),0,dp+.15,.36,dh+.2,.3);K.block('stone',0,dh,dp+.17,dw+.9,.32,.34);
 K.pediment('stone',-dw*.75,dw*.75,dh+.32,.7,dp+.05,dp+.35);
 // a recessed panel above the door, and two small windows for the upper room
 K.color(null,.78*sh);K.block('stone',0,dh+1.4,dp+.01,W*.42,H*.18,.05);
 for(const sx of [-1,1])K.block('dark',sx*W*.3,H*.48,dp+.02,.55,.7,.08);
 if(ledge){K.color(null,.92);K.block('stone',0,-.5,1.1,W+1,.5,2.2);}
 return K.finish({kind:'building',name:'Rock-cut house front (crow-step)',culture:'eastern-nomad',types:['multi-family dwelling'],
  footprint:NOMAD.rect(W+(ledge?1:.5),ledge?2.2:1.6,true),height:H,family:'tomb',seed:seed>>>0});}
// the steps rise along the face (toward +x for dir 1); a parapet on the open side
function buildRockStair({run=12,rise=12,width=1.8,dir=1,seed=1}={}){
 const K=K0(seed),n=Math.max(4,Math.round(rise/.3)),tr=run/n,s=dir<0?-1:1;
 K.color(null,.92);
 for(let i=0;i<n;i++){const x=s*(-run/2+tr*(i+.5)),y=(i+1)*rise/n;K.block('stone',x,0,width/2,tr+.02,y,width);}
 K.color(null,.84);for(let i=0;i<n;i+=2){const x=s*(-run/2+tr*(i+.5)),y=(i+1)*rise/n;K.block('stone',x,y,width-.15,tr*2.02,.7,.3);}
 return K.finish({kind:'building',name:'Rock-cut stair',culture:'eastern-nomad',types:['infrastructure'],
  footprint:NOMAD.rect(run,width,true),height:rise+.7,family:'stair',seed:seed>>>0});}
function buildLedge({length=18,depth=2.2,seed=1}={}){
 const K=K0(seed);K.color(null,.9);K.block('stone',0,-.6,depth/2,length,.6,depth);
 K.color(null,.84);K.block('stone',0,0,depth-.15,length,.75,.3);for(let x=-length/2+.4;x<length/2;x+=2.2)K.block('stone',x,.75,depth-.15,.4,.25,.4);
 return K.finish({kind:'building',name:'Rock-cut gallery',culture:'eastern-nomad',types:['infrastructure'],
  footprint:NOMAD.rect(length,depth,true),height:1.6,family:'ledge',seed:seed>>>0});}
window.buildTreasury=buildTreasury;window.buildCrowTomb=buildCrowTomb;window.buildRockStair=buildRockStair;window.buildLedge=buildLedge;
})();
