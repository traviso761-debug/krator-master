// ================================================================ SMALL-CRAFT HARBOURS (hb): shared kit + fishing harbour
// Agent 4's area: the small-craft harbours - `hbFish` (this file), `hbMarina`
// (85-hb-2-marina.js), `hbHaven` (85-hb-3-haven.js). Seed block 20400-20499:
// hbFish 20400+d, hbMarina 20410+d, hbHaven 20420+d. This file sorts first, so
// it also holds the hb kit every harbour uses (top-level kdefs, which must
// exist before 90-scene.js bakes):
//   BOATS  four instanced small-craft types, each built from ONE procedural
//          hull (hbHullGeo) plus a superstructure, windows and rig, all in the
//          vessel frame (origin midship on the waterline, bow +z):
//            Trawl  22 m stern trawler: shelter deck, wheelhouse, A-frame, net drum
//            Launch 10 m fishing launch: wheelhouse aft of midship, short mast
//            Yacht  12 m sloop: cabin trunk, 17 m mast, boom, stays, fin keel
//            Motor  14 m motor cruiser: saloon, flybridge, radar arch
//          hbBoat() places one (tilted, sunk, capsized, rusted as asked);
//          hbBoatHouse() turns one into a house (reclaimed).
//   LIFE   hbStilt (stilt house over the water), hbRope (rope bridge), hbRaft
//          (garden / fish / shack raft on drums), hbFishRack, hbNetRack,
//          hbCrates, hbJetty (low timber finger jetty on piles), hbLight
//          (a small harbour light).
// Everything takes LOCAL coordinates and the calling builder's rng().
MAT.hbDeck=new THREE.MeshStandardMaterial({color:0x8a8478,roughness:.85,metalness:.1,side:DS});
MAT.hbPlastic=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,metalness:0});
MAT.hbFishM=new THREE.MeshStandardMaterial({color:0xc4ccd0,roughness:.35,metalness:.5,side:DS});
const HB_RUST=new THREE.Color(0x6a3a22).convertSRGBToLinear(),HB_RUST2=new THREE.Color(0x6e5e4e).convertSRGBToLinear();   // instance colours are linear: keep them dark
const hbPick=a=>a[(rng()*a.length)|0];
const hbCols=a=>a.map(c=>new THREE.Color(c));
// ---------------------------------------------------------------- the hull
// o = {L length, B beam, F freeboard midship, R bow sheer rise, T draft,
//      tw transom half-width fraction, a section fullness (<1 fuller),
//      bw bulwark height (deck below sheer), fore forefoot start, sk stern keel}
function hbHullGeo(o){const L=o.L,B=o.B,nu=o.nu||18,nv=o.nv||10,a=o.a;
 const sm=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
 const hb=u=>u<.5?B/2*lerp(o.tw,1,Math.sin(u/.5*Math.PI/2)):B/2*Math.pow(Math.max(0,1-Math.pow((u-.5)/.5,2)),.5*(o.fine||1.1));
 const ys=u=>o.F+o.R*Math.pow(u,2.4);
 const kl=u=>-o.T*(1-.88*sm(o.fore,1,u))*lerp(o.sk,1,sm(0,.3,u));
 const Z=u=>(u-.5)*L;
 const P=(u,s)=>{const th=s*Math.PI/2,b=hb(u),y0=kl(u),y1=ys(u),sn=Math.sin(th);
  return[b*Math.sign(sn)*Math.pow(Math.abs(sn),a),y0+(y1-y0)*(1-Math.cos(th)),Z(u)];};
 const hull=gridSurface((u,v)=>P(u,v*2-1),nu,nv,{uS:L/4,vS:1});
 const dW=u=>{const H=ys(u)-kl(u),c=clamp(o.bw/H,0,1);return hb(u)*Math.pow(Math.sqrt(1-c*c),a)*.985;};
 const deckY=u=>ys(u)-o.bw;
 const deck=gridSurface((u,v)=>[dW(u)*(v*2-1),deckY(u),Z(u)],nu,2,{uS:L/4,vS:B/4});
 const cy=(kl(0)+ys(0))/2;
 const tr=gridSurface((u,v)=>{const p=P(0,u*2-1);return[p[0]*v,cy+(p[1]-cy)*v,-L/2];},nv,1,{});
 return {hull:pkMergeGeo([hull,tr]),deck,deckY,dW,Z,u:z=>z/L+.5};}
// a box from its bottom-centre, and a thin bar between two points, for merged boat parts
const hbBx=(w,h,dp,x,y,z)=>new THREE.BoxGeometry(w,h,dp).translate(x,y+h/2,z);
function hbBar(a,b,w){const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=v.length();
 const g=new THREE.BoxGeometry(w,L,w);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_UP,v.normalize())));
 return g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);}
function hbCylX(r,len,x,y,z){return new THREE.CylinderGeometry(r,r,len,10).rotateZ(Math.PI/2).translate(x,y,z);}
// window band on the two sides (and optionally the front) of a box house
function hbWins(w,z0,z1,y,h,front){const g=[],L=z1-z0;
 for(const s of [-1,1])g.push(new THREE.BoxGeometry(.06,h,L*.82).translate(s*(w/2+.02),y,(z0+z1)/2));
 if(front)g.push(new THREE.BoxGeometry(w*.84,h,.06).translate(0,y,z1+.02));return g;}
// ---------------------------------------------------------------- the four boat types
// HB_BT[type] = {L,B,T,top:[x,y,z] masthead light, deckY(u), cols, hcols}
const HB_BT={};
function hbDefBoat(type,o,parts,cols,hcols){const H=hbHullGeo(o);
 const P=parts(H,o);
 kdef('hb'+type+'Hull',H.hull,MAT.pkHull);kdef('hb'+type+'Deck',H.deck,MAT.hbDeck);
 kdef('hb'+type+'House',pkMergeGeo(P.house),MAT.pkPaint);
 const wg=pkMergeGeo(P.win);kdef('hb'+type+'WinI',wg,MAT.winIntact);kdef('hb'+type+'WinD',wg,MAT.winDead);
 kdef('hb'+type+'Rig',pkMergeGeo(P.rig),MAT.pkSteel);
 HB_BT[type]={L:o.L,B:o.B,T:o.T,F:o.F,top:P.top,deckY:H.deckY,dW:H.dW,cols:hbCols(cols),hcols:hbCols(hcols)};}
hbDefBoat('Trawl',{L:22,B:6.4,F:1.9,R:1.5,T:2.6,tw:.78,a:.55,bw:1,fore:.7,sk:.8,fine:1.1},(H)=>{
 const y0=H.deckY(H.u(0))-.1,yb=H.deckY(H.u(-10))-.05;
 return {house:[hbBx(4.8,2.3,9,0,y0,3.5),hbBx(3.8,2.6,3.5,0,y0+2.3,4.2),hbBx(4.3,.16,4.1,0,y0+4.9,4.2),hbBx(1,2.4,1.2,0,y0+2.3,.4),
   hbBx(2.4,.9,1.4,0,y0+2.3,7.2)],
  win:hbWins(3.8,2.45,5.95,y0+3.95,.8,true),
  rig:[hbBx(.2,6.6,.2,0,y0+5,4.2),hbBx(3,.12,.12,0,y0+9.6,4.2),hbBx(.16,4,.16,0,y0+2.3,8.9),
   hbBar([-2.6,yb,-10],[-2.2,yb+6,-9.6],.28),hbBar([2.6,yb,-10],[2.2,yb+6,-9.6],.28),hbBx(4.8,.3,.3,0,yb+5.9,-9.6),
   hbCylX(.95,3.4,0,yb+1.2,-6.4),hbBx(.2,1.2,.6,-1.6,yb,-6.4),hbBx(.2,1.2,.6,1.6,yb,-6.4),
   hbBar([0,y0+5,3],[0,yb+.6,-4.5],.14)],
  top:[0,y0+11.7,4.2]};},
 [0x2a4a6a,0x9a2e22,0x2e5a44,0x1e2226,0xe0dcd2,0x3a6a8a,0xb86a2a],[0xf2f0ea,0xe8e4da,0xf2f0ea]);
hbDefBoat('Launch',{L:10,B:3.5,F:1.05,R:.8,T:1,tw:.8,a:.65,bw:.55,fore:.68,sk:.8},(H)=>{
 const y0=H.deckY(H.u(-1))-.05;
 return {house:[hbBx(2.3,2,3,0,y0,-.9),hbBx(2.6,.1,3.5,0,y0+2,-1.1),hbBx(1.6,.5,1.2,0,y0,2.4)],
  win:hbWins(2.3,-2.4,.6,y0+1.45,.6,true),
  rig:[hbBx(.12,4,.12,0,y0+2.1,-.2),hbBx(1.6,.08,.08,0,y0+5.1,-.2),hbBar([0,y0,-4.4],[0,y0+2.6,-3.9],.12),
   hbBar([0,y0+2.6,-3.9],[0,y0+2.4,-2.6],.08),hbBx(.5,.5,.5,1.1,y0,1.4)],
  top:[0,y0+6.2,-.2]};},
 [0x2f6f9a,0xb8442e,0x3a7a5a,0xd8b04a,0xe8e4dc,0x2a3a5a,0xc86a3a],[0xf2f0ea,0xe8e4da,0xd8e4ea]);
hbDefBoat('Yacht',{L:12,B:3.9,F:1.05,R:.35,T:.75,tw:.85,a:.9,bw:.12,fore:.62,sk:.9,fine:1},(H)=>{
 const y0=H.deckY(H.u(.4))-.04,m=[0,y0+.7,2.2],mt=[0,y0+16.6,2.2];
 return {house:[hbBx(2.3,.75,4.4,0,y0,.4),hbBx(2.6,.35,.08,0,y0,-1.9),hbBx(1.9,.12,4,0,y0+.75,.4)],
  win:hbWins(2.3,-1.4,2.2,y0+.45,.25,false),
  rig:[hbBx(.16,15.9,.2,0,y0+.7,2.2),hbBar([0,y0+2.3,2.1],[0,y0+2.5,-3.8],.12),hbBar(mt,[0,H.deckY(.98)+.2,5.8],.03),
   hbBar(mt,[0,H.deckY(.02)+.2,-5.8],.03),hbBx(3.2,.06,.06,0,y0+11,2.2),hbBx(.22,1.5,1.7,0,-2.2,.4),hbBx(.1,1.1,.8,0,-1.5,-4.3),
   hbBx(.08,.5,.08,-1.2,y0+.1,-5),hbBx(.08,.5,.08,1.2,y0+.1,-5)],
  top:[0,y0+16.8,2.2]};},
 [0xf4f2ee,0xf4f2ee,0xeef0f2,0x1e2a44,0xf4f2ee,0x8a2a2a],[0xf4f2ee,0xe8e0d0]);
hbDefBoat('Motor',{L:14,B:4.5,F:1.6,R:.9,T:1.1,tw:.95,a:.75,bw:.3,fore:.66,sk:.85,fine:1.3},(H)=>{
 const y0=H.deckY(H.u(0))-.05,y1=y0+1.9;
 return {house:[hbBx(3.7,1.9,5.6,0,y0,-.4),hbBx(4,.12,6.6,0,y1,-.6),hbBx(3,.8,3,0,y1+.12,-1.3),hbBx(3,.9,1.8,0,y0,3.3),
   hbBx(2.6,.6,.12,0,y1+.9,.2)],
  win:hbWins(3.7,-3,2.4,y0+1.2,.72,true).concat(hbWins(3,2.4,4.2,y0+.55,.3,true)),
  rig:[hbBar([-1.3,y1+.1,-3.4],[-1.1,y1+1.6,-2.6],.12),hbBar([1.3,y1+.1,-3.4],[1.1,y1+1.6,-2.6],.12),hbBx(2.4,.14,.3,0,y1+1.55,-2.6),
   hbBx(.1,2.6,.1,0,y1+1.6,-2.6),hbBx(1.4,.08,.35,0,y1+1.75,-2.6),hbBx(3.2,.05,.05,0,y1+1.8,-.5),hbBx(3.2,.05,.05,0,y1+1.8,-2.2)],
  top:[0,y1+4.3,-2.6]};},
 [0xf6f4f0,0xf6f4f0,0xe8e2d4,0x243a5a,0xf6f4f0],[0xf6f4f0,0xeeeae0]);
// ---------------------------------------------------------------- small kit items
kdef('hbCrate',new THREE.BoxGeometry(.8,.34,.55).translate(0,.17,0),MAT.hbPlastic);
kdef('hbFish',new THREE.OctahedronGeometry(.5,0).scale(.12,.9,.32).translate(0,-.45,0),MAT.hbFishM);   // hangs from its tail
kdef('hbParasol',pkMergeGeo([new THREE.ConeGeometry(1.6,.55,10,1,true).translate(0,2.55,0),new THREE.CylinderGeometry(.04,.04,2.5,5).translate(0,1.25,0)]),MAT.pkCloth);
kdef('hbPedestal',pkMergeGeo([new THREE.BoxGeometry(.3,.9,.3).translate(0,.45,0),new THREE.BoxGeometry(.38,.08,.38).translate(0,.94,0)]),MAT.pkPaint);
// ---------------------------------------------------------------- place a boat
// hbBoat(type, x,y,z, yaw, d, o): o = {col, houseCol, pitch, roll, ruin (default d===1),
//   bare (hull and deck only), noRig, lit (1 cyan-white, 2 warm)} -> the quaternion.
// y is the waterline height: 0 afloat, negative sunk. roll PI capsizes it.
function hbBoat(type,x,y,z,yaw,d,o){o=o||{};const T=HB_BT[type];
 const q=qEuler(0,yaw,0).multiply(qEuler(o.pitch||0,0,o.roll||0));
 const ru=o.ruin!==undefined?o.ruin:d===1;
 let hc=(o.col||hbPick(T.cols)).clone();if(ru)hc=HB_RUST.clone().lerp(hc,rr(.02,.08)).lerp(HB_RUST2,rr(0,.6)).multiplyScalar(rr(.7,1.15));else if(d>=3)hc.lerp(HB_RUST2,rr(.45,.72));
 let hs=(o.houseCol||hbPick(T.hcols)).clone();if(ru)hs=HB_RUST2.clone().lerp(hs,rr(.1,.25)).multiplyScalar(rr(.8,1.3));else if(d>=3)hs.lerp(HB_RUST2,rr(.1,.3));
 const p=[x,y,z];
 kput('hb'+type+'Hull',p,q,1,hc);kput('hb'+type+'Deck',p,q,1,ru?new THREE.Color(0x5a4a3a):null);
 if(!o.bare){kput('hb'+type+'House',p,q,1,hs);kput('hb'+type+(ru||o.dark?'WinD':'WinI'),p,q,1,null);
  if(!o.noRig)kput('hb'+type+'Rig',p,q,1,ru?new THREE.Color(0x7a4a32):null);
  if(o.lit&&!o.noRig){const v=new THREE.Vector3(T.top[0],T.top[1],T.top[2]).applyQuaternion(q);
   kput('dot',[x+v.x,y+v.y,z+v.z],null,[.32,.32,.32],o.lit===2?WARM:new THREE.Color(0xe8fbff));}}
 return q;}
// A point in a boat's frame (yaw only) -> local coordinates.
function hbAt(x,z,yaw,lx,lz){const c=Math.cos(yaw),s=Math.sin(yaw);return[x+lx*c+lz*s,z-lx*s+lz*c];}
const HB_SHC=hbCols([0x6a8aa0,0x9a5a3a,0x7a8a5a,0xb89a5a,0x8a4a3a,0x5a6a7a,0xa8a090,0x4a7a7a,0xc07a4a]);
// ---------------------------------------------------------------- a boat turned into a house
// The hull stays; the rig goes; shacks of corrugated sheet and boards are
// built along the deck, with a tarp awning, a stovepipe, lit windows, a
// planter on the bow, a washing line and a plank gangway.
function hbBoatHouse(type,x,z,yaw,d,o){o=o||{};const T=HB_BT[type],y=o.y||0;
 hbBoat(type,x,y,z,yaw,d,{bare:true,ruin:false,col:o.col});
 const dy=T.deckY(.5)+y,L=T.L,wd=T.dW(.5)*1.7;
 const n=L>18?3:L>11?2:1,seg=L*.62/n;
 for(let i=0;i<n;i++){const lz=-L*.3+seg*(i+.5)-(L>18?1:0),hh=rr(2.1,2.7)+(i===1&&n===3?2.4:0);
  const p=hbAt(x,z,yaw,rr(-.2,.2),lz),c=hbPick(HB_SHC);
  kput('shantyBox',[p[0],dy+hh/2,p[1]],qEuler(0,yaw+rr(-.06,.06),0),[wd*rr(.78,.95),hh,seg*rr(.82,.95)],c);
  kput('shantyRoof',[p[0],dy+hh+.1,p[1]],qEuler(rr(-.12,.12),yaw,rr(-.1,.1)),[wd*1.1,1,seg*1.05],hbPick(HB_SHC));
  const w=hbAt(x,z,yaw,wd*.47*(i%2?1:-1),lz),lit=rng()<.6;
  kput(lit?'dot':'cellD',[w[0],dy+hh*.55,w[1]],qEuler(0,yaw+Math.PI/2,0),lit?[.7,.5,.2]:[.9,.7,.2],lit?WARM:null);
  if(i===0){const sp=hbAt(x,z,yaw,wd*.25,lz);kput('spipe',[sp[0],dy+hh+.9,sp[1]],null,[.12,1.8,.12],null);}}
 const aw=hbAt(x,z,yaw,0,L*.28);kput('pkAwn',[aw[0],dy+2.3,aw[1]],qEuler(0,yaw,0).multiply(qEuler(.12,0,0)),[wd*1.1,1,3],hbPick(HB_SHC));
 const bw=hbAt(x,z,yaw,0,L*.38);kput('planter',[bw[0],dy+.3,bw[1]],qEuler(0,yaw,0),[wd*.5,.6,1.2],null);
 for(let k=0;k<3;k++)kput('leafCard',[bw[0]+rr(-.6,.6),dy+.9,bw[1]+rr(-.6,.6)],qEuler(0,rng()*TAU,0),[rr(.4,.7),rr(.35,.55),rr(.4,.7)],new THREE.Color().setHSL(rr(.22,.32),.45,rr(.4,.58)));
 if(L>11&&rng()<.7){const a=hbAt(x,z,yaw,-wd*.4,L*.18),b=hbAt(x,z,yaw,-wd*.4,L*.44);portWashLine(a[0],a[1],b[0],b[1],dy+2,4);}
 if(rng()<.5){const s=hbAt(x,z,yaw,0,-L*.4);kput('pkSolar',[s[0],dy+1.4,s[1]],qEuler(0,yaw,0).multiply(qEuler(-.5,0,0)),1,null);}
 portFigures(x,dy,z,Math.round(rr(1,3)),L*.2);
 if(!o.noReg)REGISTER({name:o.name||'Boat house',x,z,r:L*.55,h:9,y:-3});}
// ---------------------------------------------------------------- stilt house
// hbStilt(x,z,d,o): a hut on timber piles over the water or the mud, floor at
// o.floor (3.6), footprint o.w x o.dp, o.yaw; a verandah deck round it, a
// pitched roof, lit windows, a ladder to the water, sometimes a second room
// on top and a skiff tied under. Returns the floor height.
function hbStilt(x,z,d,o){o=Object.assign({floor:3.6,w:rr(4.5,6.5),dp:rr(4,5.5),yaw:rr(-.3,.3),up:rng()<.35},o||{});
 const f=o.floor,w=o.w,dp=o.dp,yw=o.yaw,q=qEuler(0,yw,0),P=(lx,lz)=>hbAt(x,z,yw,lx,lz);
 for(const sx of [-1,0,1])for(const sz of [-1,1]){if(sx===0&&rng()<.5)continue;
  const p=P(sx*(w/2+.6),sz*(dp/2+.6)),gy=portH(p[0],p[1])-1;
  kput('pkPile',[p[0],gy,p[1]],qEuler(rr(-.03,.03),0,rr(-.03,.03)),[.17,f-gy,.17],null);}
 for(let k=0;k<2;k++){const a=P(-w/2-.6,(k?1:-1)*(dp/2+.6)),b=P(w/2+.6,(k?-1:1)*(dp/2+.6));
  beam('plank',[a[0],f-2.2,a[1]],[b[0],f-.3,b[1]],.09,.09,null);}                  // cross bracing
 const c0=P(0,0);
 kput('plank',[c0[0],f-.09,c0[1]],q,[w+1.8,.18,dp+1.8],new THREE.Color(0xa89478));
 const hh=2.5,col=hbPick(HB_SHC);
 kput('shantyBox',[c0[0],f+hh/2,c0[1]],q,[w,hh,dp],col);
 for(const s of [-1,1]){const r=P(0,s*dp/4);
  kput('shantyRoof',[r[0],f+hh+dp/4*.36+.08,r[1]],q.clone().multiply(qEuler(s*.34,0,0)),[w+.9,1,dp/2*1.1+.3],hbPick(HB_SHC));}
 const dw=P(-w*.2,dp/2+.03);kput('pkDoor',[dw[0],f+1.05,dw[1]],q,[.9,2,1],hbPick(HB_SHC));
 for(const s of [-1,1]){const wp=P(s*(w/2+.02),0),lit=rng()<.6;
  kput(lit?'dot':'cellD',[wp[0],f+1.5,wp[1]],qEuler(0,yw+Math.PI/2,0),lit?[.9,.6,.2]:[1.1,.8,.2],lit?WARM:null);}
 const fw=P(w*.22,dp/2+.03),lf=rng()<.6;kput(lf?'dot':'cellD',[fw[0],f+1.5,fw[1]],q,lf?[.9,.6,.2]:[1.1,.8,.2],lf?WARM:null);
 for(let i=0;i<4;i++){const rp=P((i-1.5)*(w+1.6)/4,dp/2+.85);kput('plank',[rp[0],f+.5,rp[1]],q,[(w+1.6)/4-.1,.08,.08],null);}
 const lp=P(w/2+.85,dp*.2);kput('pkLadder',[lp[0],f,lp[1]],qEuler(0,yw+Math.PI/2,0),[1,(f+.6)/10,1],new THREE.Color(0x7a6a58));
 if(o.up){const u=P(rr(-.6,.6),rr(-.4,.4)),w2=w*.6,d2=dp*.7;
  kput('shantyBox',[u[0],f+hh+.6+1.1,u[1]],qEuler(0,yw+rr(-.1,.1),0),[w2,2.2,d2],hbPick(HB_SHC));
  kput('shantyRoof',[u[0],f+hh+2.95,u[1]],qEuler(rr(-.15,.15),yw,.08),[w2+.8,1,d2+.8],hbPick(HB_SHC));
  const lit=rng()<.7;const uw=P(0,dp*.35+.05);kput(lit?'dot':'cellD',[uw[0],f+hh+1.9,uw[1]],q,[.8,.5,.2],lit?WARM:null);}
 if(rng()<.5){const s=P(0,-dp/2-.3);kput('pkSolar',[s[0],f+hh+.4,s[1]],qEuler(0,yw,0).multiply(qEuler(.5,0,0)),1,null);}
 if(rng()<.35){const s=P(w/3,0);kput('pkDish',[s[0],f+hh+.9,s[1]],qEuler(0,rng()*TAU,0),1,null);}
 if(rng()<.6){const a=P(-w/2-.7,dp/2+.8),b=P(-w/2-.7,-dp/2-.8);portWashLine(a[0],a[1],b[0],b[1],f+2,4);}
 if(rng()<.5){const s=P(w/2+2.6,rr(-1,1));if(portH(s[0],s[1])<-.8)portSkiff(s[0],s[1],yw+rr(-.2,.2));}
 kput('waterButt',[P(-w/2-.4,-dp/2-.3)[0],f+.5,P(-w/2-.4,-dp/2-.3)[1]],null,[.45,1,.45],null);
 if(rng()<.6)portFigures(c0[0],f,c0[1]+dp/2+.5,1,1.2);
 if(!o.noReg)REGISTER({name:o.name||'Stilt house',x,z,r:Math.max(w,dp)/2+1.4,h:f+hh+4,y:-3});
 return f;}
// ---------------------------------------------------------------- rope bridge between two points
function hbRope(a,b,sag,w){w=w||1.3;const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);if(L<1)return;
 const yaw=Math.atan2(dx,dz),n=Math.max(2,Math.round(L/.6)),c=Math.cos(yaw),s=Math.sin(yaw);
 const P=t=>[a[0]+dx*t,lerp(a[1],b[1],t)-sag*Math.sin(Math.PI*t),a[2]+dz*t];
 for(let i=0;i<=n;i++){const t=i/n,p=P(t),p1=P(Math.max(0,t-.02)),p2=P(Math.min(1,t+.02));
  const sl=Math.atan2(p2[1]-p1[1],Math.hypot(p2[0]-p1[0],p2[2]-p1[2]));
  kput('plank',p,qEuler(0,yaw,0).multiply(qEuler(-sl,0,0)),[w,.06,.38],null);}
 for(const sd of [-1,1])for(let i=0;i<n;i+=3){const t0=i/n,t1=Math.min(1,(i+3)/n),p0=P(t0),p1=P(t1),ox=sd*w/2*c,oz=-sd*w/2*s;
  beam('plank',[p0[0]+ox,p0[1]+1,p0[2]+oz],[p1[0]+ox,p1[1]+1,p1[2]+oz],.04,.04,new THREE.Color(0x6a5a44));
  kput('plank',[p0[0]+ox,p0[1]+.5,p0[2]+oz],null,[.04,1,.04],new THREE.Color(0x6a5a44));}}
// ---------------------------------------------------------------- raft on drums
// kind: 'garden' (planters, crops, a tree), 'fish' (drying racks), 'shack'
function hbRaft(x,z,w,dp,yaw,kind){const q=qEuler(0,yaw,0),P=(lx,lz)=>hbAt(x,z,yaw,lx,lz);
 for(let i=0;i<Math.max(2,Math.round(w/1.4));i++)for(const s of [-1,1]){const p=P((i+.5)*w/Math.max(2,Math.round(w/1.4))-w/2,s*dp*.3);
  kput('waterButt',[p[0],.15,p[1]],qEuler(0,yaw,Math.PI/2).multiply(qEuler(0,0,0)),[.42,dp*.36,.42],hbPick(HB_SHC));}
 kput('plank',[x,.62,z],q,[w,.14,dp],new THREE.Color(0xb09a7a));
 if(kind==='garden'){for(let i=0;i<Math.round(w*dp/7);i++){const p=P(rr(-w/2+.8,w/2-.8),rr(-dp/2+.6,dp/2-.6));
   kput('planter',[p[0],.95,p[1]],q,[rr(1.2,2),.5,rr(.8,1.1)],null);
   for(let k=0;k<2;k++)kput('leafCard',[p[0]+rr(-.4,.4),1.45,p[1]+rr(-.3,.3)],qEuler(0,rng()*TAU,0),[rr(.4,.7),rr(.35,.6),rr(.4,.7)],new THREE.Color().setHSL(rr(.2,.33),rr(.4,.6),rr(.4,.6)));}
  if(w*dp>24)VEG.tree(x,.7,z,1,rr(3,5));}
 else if(kind==='fish'){for(let i=0;i<2;i++){const p=P(0,(i-.5)*dp*.5);hbFishRack(p[0],.69,p[1],yaw+Math.PI/2*0,w*.8,Math.round(w*2.2));}}
 else{kput('shantyBox',[x,.69+1.1,z],q,[w*.6,2.2,dp*.7],hbPick(HB_SHC));kput('shantyRoof',[x,.69+2.3,z],qEuler(.1,yaw,0),[w*.7,1,dp*.85],hbPick(HB_SHC));}
 REGISTER({name:kind==='garden'?'Garden raft':kind==='fish'?'Fish-drying raft':'Raft shack',x,z,r:Math.max(w,dp)/2+.5,h:4,y:-1});}
// ---------------------------------------------------------------- racks and crates
// drying rack: two posts, two lines, n fish hanging along local x (yaw)
function hbFishRack(x,y,z,yaw,len,n){const q=qEuler(0,yaw,0),P=lx=>hbAt(x,z,yaw,lx,0);
 for(const s of [-1,1]){const p=P(s*len/2);kput('plank',[p[0],y+1.1,p[1]],q,[.1,2.2,.1],null);}
 for(const ly of [2.05,1.35])kput('pkLine',[x,y+ly,z],q,[len,1,1],null);
 for(let i=0;i<n;i++){const ly=i%2?1.35:2.05,p=P((i+.5)/n*len-len/2+rr(-.05,.05));
  kput('hbFish',[p[0],y+ly,p[1]],qEuler(0,yaw+rr(-.3,.3),rr(-.08,.08)),[rr(.8,1.2),rr(.8,1.2),1],new THREE.Color().setHSL(rr(.06,.12),rr(.1,.35),rr(.5,.75)));}}
// net rack: posts every 3 m along local x, a top rail, nets hung over it
function hbNetRack(x,y,z,yaw,len,d){const q=qEuler(0,yaw,0),n=Math.max(1,Math.round(len/3)),P=lx=>hbAt(x,z,yaw,lx,0);
 const NC=hbCols([0x2e4a3a,0x2a3a5a,0xa84a2a,0x5a4a3a,0x3a5a6a,0x7a6a3a]);
 for(let i=0;i<=n;i++){const p=P(i*len/n-len/2);
  if(d===1&&rng()<.25){kput('plank',[p[0],y+.1,p[1]],qEuler(0,rng()*TAU,Math.PI/2),[.12,2.8,.12],null);continue;}
  kput('plank',[p[0],y+1.4,p[1]],d===1?qEuler(rr(-.12,.12),yaw,rr(-.12,.12)):q,[.12,2.8,.12],null);}
 kput('plank',[x,y+2.75,z],q,[len,.1,.1],null);
 for(let i=0;i<n;i++){if(d===1&&rng()<.45)continue;const p=P((i+.5)*len/n-len/2);const c=hbPick(NC).clone();if(d===1)c.lerp(HB_RUST,.5);
  for(const s of [-1,1])kput('pkCloth',[p[0]+s*.06*Math.sin(yaw),y+2.72,p[1]+s*.06*Math.cos(yaw)],qEuler(s*.1,yaw,0),[len/n*rr(.8,.98),d===1?rr(.8,1.6):rr(1.8,2.5),1],c);}}
function hbCrates(x,y,z,n,yaw){const C=hbCols([0x2a6aa8,0xc8402a,0x3a8a5a,0xe8c84a,0xe8e8e0]);
 for(let i=0;i<n;i++){const p=hbAt(x,z,yaw||0,(i%3-1)*.85,Math.floor(i/9)*.6);kput('hbCrate',[p[0],y+(Math.floor(i/3)%3)*.34,p[1]],qEuler(0,(yaw||0)+rr(-.05,.05),0),1,hbPick(C));}}
// ---------------------------------------------------------------- low timber finger jetty
// hbJetty(G, x, z0, z1, w, y, d, o): a timber deck at y on pairs of piles every 4 m, running
// along +z from the quay face at z0; stairs up to the quay (DECK) at its root; small
// posts with lights. o.lost = [section indices] gone (d=1: the deck boards lie tilted
// into the water there), o.lamps.
function hbJetty(G,x,z0,z1,w,y,d,o){o=o||{};const n=Math.max(1,Math.round((z1-z0)/4)),sl=(z1-z0)/n,lost=new Set(o.lost||[]);
 for(let i=0;i<n;i++){const za=z0+i*sl,zm=za+sl/2;
  if(lost.has(i)){if(d===1&&rng()<.7){const t=rr(.3,.7)*(rng()<.5?1:-1);kput('plank',[x+rr(-1,1),rr(-.3,.6),zm],qEuler(rr(-.4,.4),rr(-.4,.4),t),[w*rr(.5,.9),.16,sl*rr(.6,.9)],new THREE.Color(0x7a6650));}continue;}
  pbBox(G,MAT.timber,x,y-.1,zm,w,.2,sl-.06,0,4,true);                          // noRepair: the jetties get our own dressing
  for(const s of [-1,1])pbBox(G,MAT.timber,x+s*(w/2-.1),y-.35,zm,.2,.3,sl,0,4,true);}
 for(let i=0;i<=n;i++){const z=z0+i*sl;if(i===0)continue;if(lost.has(i-1)&&(i===n||lost.has(i)))continue;
  for(const s of [-1,1]){const px=x+s*(w/2+.1),gy=portH(px,z)-1;
   kput('pkPile',[px,gy,z],d===1?qEuler(rr(-.06,.06),0,rr(-.06,.06)):null,[.16,y+.5-gy,.16],d===1?new THREE.Color(0x6a5a48):null);}}
 // stairs from the jetty up to the quay deck
 kput('pkStair',[x,y,z0+4.9],qEuler(0,Math.PI,0),[Math.min(1.4,w-.2),(PORT.DECK-y)/2,2],null);
 if(o.lamps&&d!==1)for(let i=1;i<n;i+=3){const z=z0+i*sl+sl/2;if(lost.has(i))continue;const px=x+w/2-.15;
  kput('postW',[px,y+.9,z],null,[.06,1.8,.06],d>0?new THREE.Color(0x9a8a78):null);
  if(d===0||rng()<.5)kput('dot',[px,y+1.85,z],null,[.2,.2,.2],d===0?CYAN:WARM);}
 REGISTER({name:o.name||'Timber jetty',x,z:(z0+z1)/2,r:Math.max(3,(z1-z0)/2),h:6,y:y-6});
 return {n,sl,lost};}
// ---------------------------------------------------------------- rubble-mound breakwater slopes
// A soft stamp ring inside a basin dig is flattened by the dig's hard shape
// (rings are applied before every hard shape), so a mound standing in dredged
// water would show a sheer cliff. The mound's slopes are therefore our own
// geometry: from the crown edge (a line at o.top) outward along (nx,nz), 1:1,
// down to o.bot (-8, under any seabed), a rough rock skin with boulders on it
// and a weed band at the waterline. The terrain's cliff stands inside it.
MAT.hbRock=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x746c62,roughness:1,metalness:0,side:DS});
function hbMound(G,ax,az,bx,bz,nx,nz,d,o){o=Object.assign({top:PORT.DECK-.04,bot:-8,n:1},o||{});const run=o.run||(o.top-o.bot);
 const L=Math.hypot(bx-ax,bz-az);if(L<.5)return;
 const P=(u,v)=>{const x=ax+(bx-ax)*u+nx*run*v,z=az+(bz-az)*u+nz*run*v,j=(fbm(x/3.5,z/3.5,3.3,2)-.5)*1.6*Math.sin(Math.PI*Math.min(1,v*1.3));
  return[x+nx*j,o.top+(Math.max(o.bot,o.top-run)-o.top)*v+j*.4,z+nz*j];};
 pbAdd(gridSurface(P,Math.max(2,Math.round(L/2.5)),7,{uS:L/6,vS:run/6}),MAT.hbRock,G,true);
 hbBoulders(P,L*run*.05*o.n,d);}
function hbMoundCone(G,cx,cz,r0,a0,a1,d,o){o=Object.assign({top:PORT.DECK-.04,bot:-8,n:1},o||{});const run=o.top-o.bot;
 const P=(u,v)=>{const a=a0+(a1-a0)*u,r=r0+run*v,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,j=(fbm(x/3.5,z/3.5,3.3,2)-.5)*1.6*Math.sin(Math.PI*Math.min(1,v*1.3));
  return[x+Math.cos(a)*j,o.top-run*v+j*.4,z+Math.sin(a)*j];};
 const arc=(a1-a0)*(r0+run/2);pbAdd(gridSurface(P,Math.max(3,Math.round(arc/2.5)),7,{uS:arc/6,vS:run/6}),MAT.hbRock,G,true);
 hbBoulders(P,arc*run*.05*o.n,d);}
function hbBoulders(P,n,d){for(let i=0;i<n;i++){const v=Math.pow(rng(),.9)*.62,p=P(rng(),v),s=rr(.7,2.1);
 if(p[1]<-3.5)continue;
 const wet=p[1]<.9&&p[1]>-1.2;
 kput('rubble',[p[0],p[1]+s*.3,p[2]],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.9,1.4),s*rr(.55,.85),s*rr(.9,1.3)],
  wet?new THREE.Color().setHSL(rr(.12,.2),rr(.2,.35),rr(.06,.1)):new THREE.Color().setHSL(rr(.07,.1),rr(.05,.12),rr(.07,.15)));
 if(d>=1&&!wet&&rng()<.22)kput('moss',[p[0],p[1]+s*.6,p[2]],null,[s*.8,s*.2,s*.8],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.14)));}}
// ---------------------------------------------------------------- small harbour light
// A white tapered column with a lantern: green (d=0), fallen across the rocks
// (d=1), relit warm with a fire basket and a hut at its foot (d=3).
function hbLight(G,x,y,z,d,h,col){h=h||8;
 if(d===1){kput('pkCol',[x+1,y+.6,z+2],qEuler(.2,rng()*TAU,Math.PI/2*.94),[.9,h*.7,.9],new THREE.Color(0x9a948a));
  kput('pkCol',[x,y,z],null,[1,h*.25,1],new THREE.Color(0xa09a90));portRubble(x+2,y,z+3,4,10);return;}
 kput('pkCol',[x,y,z],null,[1.1,1.2,1.1],d>0?new THREE.Color(0xb0aaa0):null);
 kput('pkCol',[x,y+1.2,z],null,[.75,h,.75],d>0?new THREE.Color(0xc8c2b8):new THREE.Color(0xf6f4ee));
 kput('slab',[x,y+h+1.3,z],null,[1.3,.25,1.3],d>0?new THREE.Color(0x8a8078):new THREE.Color(0xf2efe8));
 kput('pane',[x,y+h+2.1,z],null,[1.2,1.3,1.2],null);
 kput('dot',[x,y+h+2.1,z],null,[.9,.9,.9],d===0?(col||new THREE.Color(0x6aff8a)):WARM);
 kput('finial',[x,y+h+3.1,z],null,.6,null);
 REGISTER({name:'Harbour light',x,z,r:2.5,h:h+4,y});}

// ================================================================ SEGMENT: hbFish - fishing harbour
// A 110 m fishing harbour. The basin (dredged to -6) is closed on the east by
// a rubble-mound BREAKWATER at deck level, crowned with a paved walk and a
// parapet, that turns west at z 148-156 and ends in a round head with a green
// harbour light; the mouth opens west, off the head. On the west a solid FISH
// PIER (14 x 96 m, quay walls) takes the trawlers; three low TIMBER FINGER
// JETTIES (deck at y 2, stairs up to the quay) take the launches. On the
// apron: the FISH MARKET HALL (four white shell vaults on slim columns, open
// to the sea), the drum-shaped ICE HOUSE with its conveyor gallery to the
// quay, net racks, crates and launches hauled out on cradles.
//   d=0 intact   trawlers at the pier, launches at the fingers, one coming in
//   d=1 ruined   basin silted to -2.2 with mud flats; a trawler sunk at its
//                berth, one heeled on the mud, one capsized; finger decks gone;
//                vaults holed and one fallen; breakwater breached, light down
//   d=3 reclaimed a stilt village over the basin tied by rope bridges, hulls
//                turned into houses, garden and fish-drying rafts, fish on
//                every rail, the market alive again, the light relit
const HBF={LAND:70,SEA:200,PX0:-46,PX1:-32,PZ:96,BX0:34,BX1:42,AZ0:148,AZ1:156,AX0:-16,HX:-16,HZ:152,HR:8,FY:2,
 FING:[[-14,64],[2,70],[16,58]],BR:[0,8]};
function hbFishStamps(o){const d=o.d,h=o.W/2,D=PORT.DECK,F=HBF,pv=d>=1?'soil':'pave';
 const s=[{kind:'flat',x0:-h,z0:-F.LAND,x1:h,z1:0,y:D,soft:40,paint:pv},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:F.SEA,y:d===1?-2.2:-6,soft:30}];
 // silt: each bar is three nested shells (-1.4, -.6, +.25), since a soft ring
 // inside the basin dig would be flattened by it
 if(d===1)for(const [P,top,pt] of [[[[-24,18],[-10,8],[8,12],[12,40],[4,86],[-14,104],[-26,80],[-28,40]],.25,'mud'],
   [[[22,30],[28,40],[28,120],[22,136],[10,128],[16,90]],.15,'mud'],[[[-40,112],[-20,120],[-12,134],[-30,138],[-44,128]],-.3,'sand']]){
  const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length;
  [[1.15,-1.3],[.95,-.5],[.62,top]].forEach(([k,y],i)=>s.push({kind:'fill',poly:P.map(p=>[cx+(p[0]-cx)*k,cz+(p[1]-cz)*k]),y,paint:i===2?pt:'sand'}));}
 s.push({kind:'fill',x0:F.PX0,z0:-2,x1:F.PX1,z1:F.PZ,y:D,paint:pv});
 // the crown is hard-edged: its rubble slopes are geometry (hbMound), not a stamp ring
 s.push({kind:'fill',x0:F.BX0,z0:-2,x1:F.BX1,z1:F.AZ1,y:D,paint:d>=1?'soil':'pave'});
 s.push({kind:'fill',x0:F.AX0,z0:F.AZ0,x1:F.BX1,z1:F.AZ1,y:D,paint:d>=1?'soil':'pave'});
 const c=[];for(let i=0;i<20;i++){const a=i/20*TAU;c.push([F.HX+Math.cos(a)*F.HR,F.HZ+Math.sin(a)*F.HR]);}
 s.push({kind:'fill',poly:c,y:D,paint:'rock'});
 if(d===1)s.push({kind:'dig',x0:F.BR[0],z0:F.AZ0-4,x1:F.BR[1],z1:F.AZ1+4,y:.8,soft:7,paint:'rock'});   // the breach
 return s.concat(portEdgeStamps(o,{LAND:F.LAND,SEA:F.SEA}));}

// The market hall: nb white shell vaults side by side along x, each a barrel
// running land-to-sea, on slim columns; a solid back wall, open to the quay.
function hbHall(G,cx,cz,w,dp,d,nb){const H=6.2,rise=2.6,bw=w/nb,D=PORT.DECK,mat=SHELL(d);
 const drop=d===1?1+((rng()*(nb-1))|0):-1;
 for(let b=0;b<nb;b++){const x0=cx-w/2+b*bw;
  if(b===drop){for(let k=0;k<3;k++){const g=boxUV(bw*rr(.5,.8),.25,dp*rr(.25,.35),8);g.rotateX(rr(-.3,.3));g.rotateZ(rr(-.5,.5));g.translate(x0+bw/2+rr(-2,2),D+rr(.6,2),cz+(k-1)*dp*.3);pbAdd(g,mat,G);}
   portRubble(x0+bw/2,D,cz,bw*.4,14);continue;}
  const hole=d>0?holeFn(d,rr(0,90),null,2.2):null;
  pbAdd(gridSurface((u,v)=>[x0+u*bw,D+H+rise*Math.sin(Math.PI*u),cz-dp/2+v*dp],8,Math.round(dp/3),{uS:bw/8,vS:dp/8,hole:hole?(u,v)=>hole(u,v*dp*1.8):null}),mat,G);
  for(const s of [-1,1])pbAdd(gridSurface((u,v)=>[x0+u*bw,D+H+rise*Math.sin(Math.PI*u)-.7*v,cz+s*dp/2],8,1,{uS:bw/8,vS:.1}),mat,G);   // arched fascia
  pbAdd(gridSurface((u,v)=>[x0+u*bw,D+v*(H+rise*Math.sin(Math.PI*u)),cz-dp/2-.15],8,2,{uS:bw/8,vS:H/8}),mat,G);                    // back wall
  if(d===0)for(let k=0;k<3;k++)kput('pane',[x0+bw*(k+1)/4,D+H+.9+rise*.6*Math.sin(Math.PI*(k+1)/4),cz-dp/2-.05],null,[bw/4-.3,1,.5],null);
  REGISTER({name:'Fish market hall',x:x0+bw/2,z:cz,r:Math.max(bw,dp)/2*1.02,h:H+rise,y:D});}
 for(let b=0;b<=nb;b++)for(const s of [-1,0,1]){const x=cx-w/2+b*bw,z=cz+s*(dp/2-.4);if(s===0&&(b===0||b===nb))continue;
  if(d===1&&(b===drop||b===drop+1)&&rng()<.6){kput('postW',[x+rr(-2,2),D+.4,z+rr(-2,2)],qEuler(rng()*3,rng()*3,Math.PI/2),[.28,H*.7,.28],new THREE.Color(0x8a7a6a));continue;}
  kput(d>0?'postR':'postW',[x,D+H/2,z],null,[.28,H,.28],d>0?new THREE.Color(0xc8b8a8):null);}
 // inside: fish tables, crates, ice
 for(let b=0;b<nb;b++){const x=cx-w/2+(b+.5)*bw;if(b===drop)continue;
  for(const s of [-1,1]){const z=cz+s*dp*.18;
   if(d===1&&rng()<.5){kput('plank',[x,D+.4,z],qEuler(rr(-.3,.3),rr(0,3),rr(1.2,1.5)),[bw*.6,.1,1.6],null);continue;}
   kput('plank',[x,D+.9,z],null,[bw*.6,.1,1.6],d===0?new THREE.Color(0xe8e8e4):null);
   for(const e of [-1,1])kput('plank',[x+e*bw*.27,D+.45,z],null,[.1,.9,1.4],null);
   if(d!==1)for(let k=0;k<4;k++)kput('hbCrate',[x+rr(-bw*.25,bw*.25),D+.95,z+rr(-.4,.4)],qEuler(0,rr(-.2,.2),0),1,new THREE.Color(d===0?0x2a6aa8:0xc8402a));}}}

// The ice house: a white drum with a band of small windows, a flat cap with
// cooling units, a door, and a covered conveyor gallery running to the quay.
function hbIce(G,x,z,d,to){const D=PORT.DECK,r=6,H=9,mat=SHELL(d);
 const hole=d===1?holeFn(d,rr(0,90),null,1.6):null;
 pbAdd(gridSurface((u,v)=>[x+r*Math.cos(u*TAU),D+v*H,z+r*Math.sin(u*TAU)],24,4,{uS:r*TAU/8,vS:H/8,hole:hole?(u,v)=>hole(u,v*H):null}),mat,G);
 kput('slabC',[x,D+H+.3,z],null,[r+.4,.6,r+.4],d>0?new THREE.Color(0x9a9088):null);
 for(let i=0;i<16;i++){const a=i/16*TAU;kput(d===0?'winSmI':'winSmD',[x+Math.cos(a)*(r+.05),D+H-2.4,z+Math.sin(a)*(r+.05)],qEuler(0,Math.PI/2-a,0),[.7,.5,.5],null);}
 kput('pkDoor',[x,D+1.6,z+r+.05],null,[2.6,3.2,1],d===1?new THREE.Color(0x6a3a2a):new THREE.Color(0x2a4a6a));
 if(d!==1)for(let i=0;i<3;i++)kput('tube',[x-2.5+i*2.5,D+H+.6,z-1.5],null,[.9,.9,.9],null);
 // the conveyor gallery: a box on two trestles, falling to the quay
 const a=[x,D+H-1.5,z+r-.5],b=[to[0],D+3.2,to[1]];
 if(d===1){beam('boxR',a,[lerp(a[0],b[0],.45),D+4.2,lerp(a[2],b[2],.45)],1.3,1.3,null);
  const g=boxUV(1.3,1.3,Math.hypot(b[0]-a[0],b[2]-a[2])*.5,8);g.rotateX(.5);g.translate(lerp(a[0],b[0],.75),D+1.2,lerp(a[2],b[2],.75));pbAdd(g,MAT.rust,G);}
 else beam(d>0?'boxR':'boxW',a,b,1.3,1.3,null);
 for(const t of [.35,.72]){const px=lerp(a[0],b[0],t),pz=lerp(a[2],b[2],t),py=lerp(a[1],b[1],t);
  if(d===1&&t>.5)continue;kput(d>0?'postR':'postW',[px,D+(py-D)/2,pz],null,[.2,py-D,.2],null);}
 REGISTER({name:'Ice house',x,z,r:r+.5,h:H+1.5,y:D});
 REGISTER({name:'Ice conveyor',x:(a[0]+b[0])/2,z:(a[2]+b[2])/2,r:Math.hypot(b[0]-a[0],b[2]-a[2])/2,h:8,y:D});}

function buildHbFish(scene,gx,gz,d,opt){reseed(20400+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,F=HBF,brk=x=>d===1&&x>F.BR[0]-1&&x<F.BR[1]+1;
 // ---- paving: apron, fish pier, breakwater crown (east arm, cross arm)
 portPaving(G,-h,-F.LAND,h,-1.2,d);
 portPaving(G,F.PX0+1.2,-1.2,F.PX1-1.2,F.PZ-1.2,d);
 portPaving(G,F.BX0+.5,-1.2,F.BX1-.5,F.AZ1-.5,d);
 portPaving(G,F.AX0,F.AZ0+.5,F.BX0+.5,F.AZ1-.5,d,{hole:(x,z)=>brk(x)});
 // ---- walls: the quay line (gaps where the pier and the breakwater root join), the pier
 const qw=portQuayWall(G,-h,0,h,0,d,{ladders:0,gaps:[[F.PX0+h,F.PX1+h],[F.BX0+h,F.BX1+h]]});
 portQuayWall(G,F.PX0,0,F.PX0,F.PZ,d,{face:[-1,0],ladders:0,bollards:0,fenders:16});
 const pE=portQuayWall(G,F.PX1,0,F.PX1,F.PZ,d,{face:[1,0],fenders:9,ladders:24,bollards:13});
 portQuayWall(G,F.PX0,F.PZ,F.PX1,F.PZ,d,{face:[0,1],ladders:0,bollards:0,fenders:7});
 portSideClose(G,opt.nb,d,{z0:-F.LAND,z1:0});
 REGISTER({name:'Fish pier',x:(F.PX0+F.PX1)/2,z:30,r:7,h:10,y:-6});REGISTER({name:'Fish pier',x:(F.PX0+F.PX1)/2,z:72,r:7,h:10,y:-6});
 // ---- the breakwater: riprap on every slope, a crown parapet on the sea side, a kerb inside
 // the rubble mound is our own geometry (see hbMound): a soft stamp ring inside the
 // basin dig would be flattened by the dig's hard shape, leaving a sheer cliff
 const br=d===1?[[F.AX0,F.BR[0]-1],[F.BR[1]+1,F.BX0]]:[[F.AX0,F.BX0]],bro=d===1?[[F.AX0,F.BR[0]-1],[F.BR[1]+1,F.BX1]]:[[F.AX0,F.BX1]];
 hbMound(G,F.BX1,0,F.BX1,F.AZ1,1,0,d);hbMound(G,F.BX0,0,F.BX0,F.AZ0,-1,0,d);
 for(const [a,b] of bro)hbMound(G,a,F.AZ1,b,F.AZ1,0,1,d);
 for(const [a,b] of br)hbMound(G,a,F.AZ0,b,F.AZ0,0,-1,d);
 hbMoundCone(G,F.BX1,F.AZ1,0,0,Math.PI/2,d);hbMoundCone(G,F.HX,F.HZ,F.HR,0,TAU,d);
 kput('slabC',[F.HX,D-.1,F.HZ],null,[F.HR,.3,F.HR],d>0?new THREE.Color(0xa09a90):null);
 if(d===1){hbMound(G,F.BR[0]-1,F.AZ0,F.BR[0]-1,F.AZ1,1,0,d,{run:5});hbMound(G,F.BR[1]+1,F.AZ0,F.BR[1]+1,F.AZ1,-1,0,d,{run:5});}
 const par=(x,z,w,dp)=>pbBox(G,CONC(d),x,D+.7,z,w,1.4,dp,0,8);
 if(d===1){par(F.BX1-.6,40,1.2,80);par(F.BX1-.6,122,1.2,52);par(26,F.AZ1-.6,32,1.2);par(-8,F.AZ1-.6,12,1.2);
  for(let i=0;i<10;i++)kput('pkCope',[rr(-2,10),rr(-1,2),F.AZ0+rr(-6,12)],qEuler(rr(-.6,.6),rng()*3,rr(-.6,.6)),[rr(2,4),rr(.8,1.4),rr(1,1.4)],new THREE.Color(0x8a857c));
  portRubble(F.BX1,D,90,3,8);}
 else{par(F.BX1-.6,(F.AZ1-1)/2,1.2,F.AZ1+1);par((F.AX0+F.BX1)/2,F.AZ1-.6,F.BX1-F.AX0,1.2);}
 pbBox(G,CONC(d),F.BX0+.25,D+.2,F.AZ0/2,.5,.4,F.AZ0,0,8);
 REGISTER({name:'Breakwater',x:38,z:40,r:5,h:9,y:-2});REGISTER({name:'Breakwater',x:38,z:110,r:5,h:9,y:-2});
 REGISTER({name:'Breakwater arm',x:12,z:152,r:6,h:9,y:-2});
 hbLight(G,F.HX,D,F.HZ,d,7);
 for(let z=24;z<F.AZ0;z+=40)portLamp(F.BX0+1.5,D,z,-Math.PI/2,d);
 // ---- the finger jetties
 const fl=[];
 F.FING.forEach((f,i)=>{const lost=d===1?[1,3,4,7,8,9,12,13,15].filter(()=>rng()<.7):[];
  fl.push(hbJetty(G,f[0],0,f[1],2.8,F.FY,d,{lost,lamps:true,name:'Finger jetty'}));});
 // ---- on the apron: the market hall, the ice house, racks, cradles, lamps
 hbHall(G,-12,-24,46,20,d,4);
 hbIce(G,30,-36,d,[30,-3]);
 for(let x=-h+14;x<=h-14;x+=26)if(x<F.PX0-2||x>F.PX1+2)portLamp(x,D,-6.5,0,d);
 for(let z=14;z<F.PZ;z+=28)portLamp(F.PX0+2.5,D,z,Math.PI/2,d);
 hbNetRack(-26,D,-48,0,18,d);hbNetRack(4,D,-48,0,18,d);hbNetRack(-26,D,-54,0,18,d);
 for(let z=18;z<130;z+=22)hbNetRack(F.BX0+4.4,D,z,Math.PI/2,12,d);
 for(const [x,z] of [[-26,-48],[4,-48],[-26,-53]])REGISTER({name:'Net rack',x,z,r:8.5,h:4,y:D});
 // launches on cradles
 for(const [cx,cz] of [[14,-52],[22,-52]]){
  for(const s of [-3,0,3])kput('plank',[cx,D+.5,cz+s],null,[2.6,1,.3],null);
  if(d===1)hbBoat('Launch',cx+.6,D+1.2,cz,.05,d,{roll:.5});else hbBoat('Launch',cx,D+1.3,cz,0,d,{noRig:d===0?false:rng()<.5});
  REGISTER({name:'Launch on its cradle',x:cx,z:cz,r:5.5,h:7,y:D});}
 const bE=pE.bollards;
 // ---- intact
 if(d===0){
  [[20,0],[46,Math.PI],[72,0]].forEach(([z,yw])=>{hbBoat('Trawl',F.PX1+3.5,0,z,yw,d,{lit:1});REGISTER({name:'Trawler',x:F.PX1+3.5,z,r:11,h:14,y:-3});});
  F.FING.forEach(f=>{for(let z=10;z<f[1]-4;z+=12)for(const s of [-1,1]){if(f[0]+s*4>20&&s>0)continue;if(rng()<.25)continue;
   hbBoat('Launch',f[0]+s*(1.4+1.9),0,z+rr(-1,1),rng()<.5?0:Math.PI,d,{lit:rng()<.5?1:0});}});
  hbBoat('Trawl',-24,0,128,-2.4,d,{lit:1});REGISTER({name:'Trawler coming in',x:-24,z:128,r:11,h:14,y:-3});
  hbBoat('Launch',-6,0,176,-1.9,d,{lit:1});
  for(const L of pE.ladders)portSkiff(L[0]+2,L[1]+rr(-2,2),rr(-.1,.1));
  for(let i=0;i<3;i++)portSkiff(rr(-26,-20),rr(84,96),rr(0,TAU));
  hbCrates(-39,D,10,18,Math.PI/2);hbCrates(-39,D,40,12,Math.PI/2);hbCrates(-4,D,-9,15,0);hbCrates(-22,D,-9,12,0);
  portFigures(-12,D,-22,16,18);portFigures(-39,D,40,8,20);portFigures(38,D,70,6,50);portFigures(0,D,-8,8,30);
  portFigures(-14,F.FY,30,3,1);portFigures(2,F.FY,40,3,1);
  portBuoy(-30,110);portBuoy(-4,140);}
 // ---- ruined
 if(d===1){
  hbBoat('Trawl',F.PX1+3.8,-2.6,30,.08,d,{roll:.32,pitch:-.05});REGISTER({name:'Sunken trawler',x:F.PX1+4,z:30,r:11,h:10,y:-4});
  hbBoat('Trawl',-18,-.9,60,.5,d,{roll:-.55,pitch:.04});REGISTER({name:'Trawler heeled on the mud',x:-18,z:60,r:11,h:10,y:-3});
  hbBoat('Trawl',-30,-1.2,120,2.2,d,{roll:Math.PI-.15,noRig:true});REGISTER({name:'Capsized trawler',x:-30,z:120,r:11,h:6,y:-4});
  const W=[[-10,20,.1,.4,-.3],[-2,34,2.9,-.5,-.2],[6,56,.3,.05,-1.1],[16,28,3,.45,-.2],[-4,78,1.6,-.6,.1],[20,70,.2,.3,-.9],[10,100,2.2,Math.PI-.2,-.6]];
  for(const [x,z,yw,rl,y] of W)hbBoat('Launch',x,y,z,yw,d,{roll:rl,noRig:rng()<.4});
  for(let i=0;i<6;i++)kput('pkSkiff',[rr(-30,26),rr(-.6,.1),rr(6,130)],qEuler(rr(-.3,.3),rng()*TAU,rr(-.8,.8)+(rng()<.3?Math.PI:0)),1,new THREE.Color(0x5a4636));
  portWeeds(-h+4,-F.LAND+4,h-4,-3,150,D);portWeeds(F.PX0+2,2,F.PX1-2,F.PZ-2,50,D);portWeeds(F.BX0+1,2,F.BX1-1,F.AZ1-1,60,D);
  portTrees(-h+8,-F.LAND+8,-20,-40,4,D,4,9);portTrees(24,-60,h-10,-48,3,D,4,8);portTrees(F.BX0+2,30,F.BX1-2,120,3,D,3,6);
  portRubble(20,D,-12,4,12);portRubble(F.PX0+6,D,60,3,8);
  for(let i=0;i<8;i++)kput('hbCrate',[rr(-44,-34),D+.1,rr(4,90)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),1,new THREE.Color(0x6a5a4a));}
 // ---- reclaimed
 if(d>=3){
  // the stilt village over the basin, and the rope bridges that tie it together
  const S=[[-5,24],[-5,52],[9,36],[9,66],[-6,86],[10,94],[24,100],[-20,104],[-2,116],[14,126],[-18,130]];
  const fl2=[];S.forEach(([x,z],i)=>{const f=hbStilt(x+rr(-1,1),z+rr(-1,1),d,{floor:3.6+(i%3)*.4,yaw:rr(-.2,.2),name:'Stilt house'});fl2.push([x,f,z]);});
  const link=(a,b)=>{const A=fl2[a],B=fl2[b],dx=B[0]-A[0],dz=B[2]-A[2],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,k=3.4;
   hbRope([A[0]+ux*k,A[1],A[2]+uz*k],[B[0]-ux*k,B[1],B[2]-uz*k],.8);};
  [[0,1],[0,2],[2,3],[1,4],[4,5],[5,6],[4,7],[7,8],[8,9],[8,10],[5,9]].forEach(([a,b])=>link(a,b));
  hbRope([F.FING[0][0]+1.4,F.FY,24],[fl2[0][0]-3.4,fl2[0][1],24],.4);
  hbRope([F.FING[1][0]+1.4,F.FY,62],[fl2[3][0]-3.4,fl2[3][1],64],.4);
  hbRope([F.BX0-6,D-1.4,100],[fl2[6][0]+3.4,fl2[6][1],100],.6);
  kput('pkStair',[F.BX0-5,D-2,100],qEuler(0,-Math.PI/2,0),[1.2,1,1.8],null);
  // hulls turned into houses along the pier, launches still working
  hbBoatHouse('Trawl',F.PX1+3.5,22,0,d,{name:'Trawler house'});hbBoatHouse('Trawl',F.PX1+3.5,48,Math.PI,d,{name:'Trawler house'});
  hbBoatHouse('Launch',F.FING[2][0]-3.3,20,0,d);hbBoatHouse('Launch',F.FING[0][0]-3.3,40,Math.PI,d);
  F.FING.forEach(f=>{for(let z=12;z<f[1]-6;z+=16){if(rng()<.5)continue;hbBoat('Launch',f[0]+3.3,0,z,rng()<.5?0:Math.PI,d,{lit:2});}});
  hbBoat('Trawl',F.PX1+3.5,0,76,0,d,{lit:2});
  // rafts: gardens and fish drying, moored among the stilts
  hbRaft(-16,74,6,4,.2,'garden');hbRaft(20,52,5,4,-.3,'garden');hbRaft(-26,118,7,5,.5,'garden');
  hbRaft(3,104,6,3.6,-.1,'fish');hbRaft(22,84,5,3.4,.3,'fish');hbRaft(-10,140,5,4,.1,'shack');
  // fish drying on the pier, the breakwater and the apron
  for(let z=8;z<F.PZ-6;z+=11)hbFishRack(F.PX0+5,D,z,Math.PI/2,8,18);
  for(let x=-6;x<32;x+=12)hbFishRack(x,D,F.AZ0+4,0,9,20);
  for(let x=-30;x<0;x+=10)hbFishRack(x,D,-58,0,7,14);
  REGISTER({name:'Fish-drying racks',x:F.PX0+5,z:45,r:6,h:5,y:D});
  // the market alive again
  for(let i=0;i<7;i++)portStall(-32+i*6.6,D,-9,Math.PI+rr(-.1,.1));
  portContainerHouse(G,-38,D,-54,Math.PI/2,d,{levels:2});
  portGarden(34,D,-56,16,8,d);portGarden(-4,D,-58,14,6,d);
  for(const L of pE.ladders)portSkiff(L[0]+2.2,L[1]+rr(-3,3),rr(-.15,.15));
  for(let i=0;i<14;i++){const x=rr(-28,26),z=rr(8,140);if(portH(x,z)<-2)portSkiff(x,z,rng()*TAU);}
  hbCrates(-39,D,62,15,Math.PI/2);hbCrates(-8,D,-12,12,0);
  portWashLine(-44,-6,-20,-6,8.5,9);portWashLine(F.BX0+1,60,F.BX0+1,90,8.5,8);
  portFigures(-12,D,-20,24,18);portFigures(-39,D,50,12,30);portFigures(38,D,90,8,40);portFigures(-12,D,-50,8,20);
  portWeeds(-h+4,-F.LAND+4,h-4,-3,40,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'hbFish',name:'Fishing harbour',cls:'seg',W:110,LAND:HBF.LAND,SEA:HBF.SEA,decays:[0,1,3],stamps:hbFishStamps,build:buildHbFish});
