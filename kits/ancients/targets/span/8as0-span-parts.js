// ================================================================= SPAN — the arcology's own pieces (settlements/span)
// Span, the ruined arcology in Pan Riba's canyon (settlements/span/PLAN.md section 6), needs seven pieces the kit did not
// have: the BENCH GALLERY (a terraced building on a canyon bench, its back to the wall), the RIM RANGE (the white curved
// band on a rim, its lower storeys hung over the edge), the RING-WALLED DOME, the PAD ON A DRUM, the CROSS (the habitable
// bridge where the highways cross the canyon), the WEIR and its SLUICE STAIR, and the ROAD TUNNEL PORTAL (one broad way
// with a guideway down its middle). Each is a builder on the kit's contract (scene, gx, gz, d) plus a record `o` of its
// size, base height `y` and turn `ry`, so settlements/span's page places them from its layout records; this target shows
// each at every state (intact, ruined, toppled, rehabilitated, worn).
//
// RANDOMNESS: each opens with reseed(N) (the kit's rule: the shared decor helpers draw from the stream), but every
// decision of its own (which bay breaks, which gate hangs, where a fallen piece lies) is a KRAND hash of the piece's
// seed and the bay's index, so a bay breaks the same way however long the run (CLAUDE.md, "New placement draws from
// core/rand"). Everything is registered in core/tags before it is drawn (targets/span takes the core: build.py
// TAGS_TARGETS). Seeds 12300-12379.
//
// FRAME: a piece is drawn in its own frame, origin on its base, turned by o.ry about +Y; the kit's instances follow it
// (useGroupXF). +z is its front: the canyon side of a gallery or range, downstream of a weir, out of a portal's cliff.

kdef('spWinI',new THREE.BoxGeometry(1,1,1),MAT.winIntact); kdef('spWinD',new THREE.BoxGeometry(1,1,1),MAT.winDead);
kdef('spVoid',new THREE.BoxGeometry(1,1,1),MAT.guts);
kdef('spRoad',new THREE.BoxGeometry(1,1,1),MAT.darkSurf);
kdef('spCopper',new THREE.BoxGeometry(1,1,1),MAT.verdigris);
kdef('spLawn',new THREE.BoxGeometry(1,1,1),MAT.lawn);

const SPAN_SEED={gallery:12300,range:12310,dome:12320,pad:12330,cross:12340,weir:12350,portal:12360,stage:12370};
function spanU(sd,a,b,c){return KRAND.unit(KRAND.hash(sd>>>0,a|0,b|0,c|0));}
// the share of bays a ruin breaks: HOLES is .55 for the rehabilitated (90-scene.js), so a patched ruin breaks fewer
function spanBreak(d){return d===0?0:(d===2?.22:.16)*HOLES;}
function spanStateName(d){return d===0?'intact':d===2?'toppled':d===3?'rehab':'ruined';}

// A SUB-FRAME (the Cross's faces and towers) is set by saving KXF, putting the sub-group's matrix in the site group's frame
// in it, and restoring it: never through useGroupXF / endGroupXF, which a page may have turned into a stack (Dalab's
// 69c-vern-helpers.js composes nested groups), so a hand-set frame between them would leak.
// ---- the frame: G at the site, P at the base turned by ry; kit instances follow P -----------------------------------
function spanFrame(scene,gx,gz,o){const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const P=new THREE.Group();P.position.set(0,o.y||0,0);P.rotation.y=o.ry||0;G.add(P);
 KOFF=[gx,0,gz];useGroupXF(P);return {G:G,P:P,y:o.y||0,ry:o.ry||0};}
function spanDone(){endGroupXF();KOFF=[0,0,0];}
// an inspector volume at a point in the piece's frame (REGISTER takes the site's frame: turn the point by ry)
function spanReg(F,name,lx,ly,lz,r,h){const c=Math.cos(F.ry),s=Math.sin(F.ry);
 REGISTER({name:name,x:lx*c+lz*s,z:-lx*s+lz*c,y:F.y+ly,r:r,h:h});}
// one core/tags record per piece, before it is drawn
function spanTag(kind,name,gx,gz,F,d,o,size){const T=KTAGS.span||(KTAGS.span=KTAGS.create({build:'ancients-span'}));
 return T.add({id:(o.id||kind)+'/'+Math.round(gx)+'/'+Math.round(gz),'class':kind==='portal'||kind==='weir'||kind==='pad'?'infrastructure':'building',
  kind:kind,key:'ancients:span-'+kind,name:name,at:[gx,F.y,gz],ry:F.ry,size:size,
  tags:{culture:'ancient',state:spanStateName(d),types:o.types||(kind==='portal'||kind==='weir'||kind==='pad'?['infrastructure']:['dwelling-multi'])}});}
// a stand-in rock block for the showcase (the canyon walls and benches are the biome kit's in a real page)
function spanRock(P,x0,x1,y0,y1,z0,z1){const m=mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),MAT.rock,P,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
 m.userData.probeSkip=true;return m;}
// debris where a run fell: torn slabs and rubble on the ground at fy, spread in front of the face
function spanDebris(sd,x0,x1,fy,z0,depth,n,d){
 for(let i=0;i<n;i++){const u=spanU(sd,i,1),v=spanU(sd,i,2),w=spanU(sd,i,3);
  const x=x0+(x1-x0)*u,z=z0+depth*v;
  if(i%3===0)kput(PLATE(1),[x,fy+.6,z],qEuler((w-.5)*.9,u*TAU,(v-.5)*.7),[4+6*w,.6,3+4*v],null);
  else kput('rubble',[x,fy+.4,z],qEuler(u*3,v*3,w*3),1+2.2*w,null);}}

// ---- the terraced band: storeys stepping back up a face, white bullnosed slabs, ribbon windows -----------------------
// Along +x from 0 to L in bays of B, its front facing +z. levels: [{y (floor), h (storey), zb (back), zf (front)}] from the
// bottom; each slab's nose is a white bullnose, the storey above steps back to its own front, so every slab under a
// step-back is a terrace. gap: [x0, x1] dropped whole (a toppled run); back: close the back with a wall (no rock behind).
function spanBand(sd,L,B,levels,d,o){o=o||{};const nb=Math.max(1,Math.round(L/B)),bw=L/nb,p=spanBreak(d),lit=d===0;
 const sk=d>0?'postR':'postW',pier=d>0?'pierR':'pierW',inGap=x=>o.gap&&x>o.gap[0]&&x<o.gap[1];
 const top=levels[levels.length-1];
 for(let i=0;i<nb;i++){const x0=i*bw,xc=x0+bw/2;if(inGap(xc))continue;
  levels.forEach((lv,k)=>{const r=spanU(sd,i,k,7),hole=r<p*.45,dead=r<p;
   const fy=lv.y,front=lv.zf,back=lv.zb;
   // the floor slab under this storey and its bullnose (the storey below's ceiling and its terrace)
   if(!hole){kput(PLATE(d),[xc,fy-.35,(front+back)/2],null,[bw,.7,front-back],null);
    kput(sk,[xc,fy-.35,front],qEuler(0,0,Math.PI/2),[.72,bw,.72],null);
    kput('strip',[xc,fy-.9,front+.35],null,[bw*.9,1,1],lit?CYAN:DEAD);}
   // the ribbon window, recessed; behind a broken pane the dark of the room
   const wz=front-1.6,wh=lv.h-1.2;
   if(!hole){kput(dead||d>0&&spanU(sd,i,k,9)<.5?'spWinD':'spWinI',[xc,fy+wh/2+.3,wz],null,[bw-.7,wh,.18],null);
    if(dead)kput('spVoid',[xc,fy+wh/2+.3,wz-2.5],null,[bw-.7,wh,.3],null);}
   else kput('spVoid',[xc,fy+lv.h/2,wz-3],null,[bw,lv.h,.3],null);
   kput(pier,[x0,fy+lv.h/2,wz+.1],null,[.7,lv.h,.7],null);
   // the back wall when nothing stands behind
   if(o.back)kput(PLATE(d),[xc,fy+lv.h/2,back+.2],null,[bw,lv.h,.4],null);
   // the balustrade along a terrace: the slab's front where the storey above has stepped back
   if(k>0&&!hole&&levels[k-1].zf>front+1){const below=levels[k-1];
    kput(PLATE(d),[xc,fy+.55,below.zf-.3],null,[bw,1.1,.25],null);
    if(d>0&&spanU(sd,i,k,11)<.6)kput('moss',[xc+(spanU(sd,i,k,12)-.5)*bw*.6,fy+.2,(below.zf+front)/2],null,[1.6,.6,1.4],null);}
   if(d>0&&!hole&&spanU(sd,i,k,13)<.35)kput('vine',[xc+(spanU(sd,i,k,14)-.5)*bw*.8,fy-.6,front+.5],null,[1.6,2+spanU(sd,i,k,15)*(lv.h*1.4),1.6],null);});
  // the roof slab over the top storey, its bullnose and a copper band
  const ry=top.y+top.h,r=spanU(sd,i,99,7);
  if(!(r<p*.45)){kput(PLATE(d),[xc,ry-.35,(top.zf+top.zb)/2],null,[bw,.7,top.zf-top.zb],null);
   kput(sk,[xc,ry-.35,top.zf],qEuler(0,0,Math.PI/2),[.8,bw,.8],null);
   kput('spCopper',[xc,ry+.25,top.zf-.4],null,[bw,.5,.3],null);
   if(o.lawn&&d===0)kput('spLawn',[xc,ry+.05,(top.zf+top.zb)/2-1],null,[bw-1,.2,top.zf-top.zb-4],null);
   if(d>0&&spanU(sd,i,99,8)<.5)kput('moss',[xc,ry+.2,(top.zf+top.zb)/2],null,[2.4,.7,2],null);}}
 // the two ends close every storey (a band is a sandwich: Enclosure in API.md)
 [0,L].forEach(x=>{if(inGap(x))return;levels.forEach(lv=>kput(PLATE(d),[x,lv.y+lv.h/2,(lv.zf+lv.zb)/2],null,[.6,lv.h+.7,lv.zf-lv.zb],null));});
 if(o.gap){[o.gap[0],o.gap[1]].forEach(x=>levels.forEach(lv=>{if(x>0&&x<L)kput('spVoid',[x,lv.y+lv.h/2,(lv.zf+lv.zb)/2],null,[.4,lv.h,lv.zf-lv.zb-1],null);}));}}

// ================================================================= the BENCH GALLERY
// o: {L (160), D (22: the bench's depth), n (3 storeys), sh (4.5), step (2.4: each storey steps back), y, ry,
//     fall (how far below its base the floor is, for a toppled run's debris: 40), stage}
function buildSpanGallery(scene,gx,gz,d,o){reseed(SPAN_SEED.gallery+d);o=o||{};
 const L=o.L==null?160:o.L,D=o.D==null?22:o.D,n=o.n==null?3:o.n,sh=o.sh==null?4.5:o.sh,st=o.step==null?2.4:o.step;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.gallery,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('gallery','Bench gallery',gx,gz,F,d,o,[L,D,n*sh]);
 spanReg(F,'Span — bench gallery ('+STATE(d)+')',L/2,0,0,L/2,n*sh+2);
 const levels=[];for(let k=0;k<n;k++)levels.push({y:k*sh,h:sh,zb:-D/2,zf:D/2-k*st});
 const gap=d===2?[L*(.34+.1*spanU(sd,1,1)),L*(.62+.1*spanU(sd,1,2))]:null;
 spanBand(sd,L,8,levels,d,{gap:gap,back:!o.stage});
 if(gap)spanDebris(sd,gap[0]-6,gap[1]+6,-(o.fall==null?0:o.fall),D/2+2,16,Math.round((gap[1]-gap[0])*1.1),d);
 if(o.stage){spanRock(F.P,-20,L+20,-(o.fall||0)-1,n*sh+16,-D/2-24,-D/2);
  if(o.fall)spanRock(F.P,-20,L+20,-o.fall-1,0,-D/2-24,D/2+1);}
 spanDone();return F.G;}

// ================================================================= the RIM RANGE
// The white curved band on a rim: two storeys over the rim, a great rounded nose over the edge, and two storeys hung on
// the cliff face below it ("stepping over the edge"). o: {L (160), D (38: rim depth), up (2), down (2), sh (4.5), y, ry, stage}
function buildSpanRange(scene,gx,gz,d,o){reseed(SPAN_SEED.range+d);o=o||{};
 const L=o.L==null?160:o.L,D=o.D==null?38:o.D,up=o.up==null?2:o.up,dn=o.down==null?2:o.down,sh=o.sh==null?4.5:o.sh;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.range,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('range','Rim range',gx,gz,F,d,o,[L,D,(up+dn)*sh]);
 spanReg(F,'Span — rim range ('+STATE(d)+')',L/2,-dn*sh,0,L/2,(up+dn)*sh+3);
 const gap=d===2?[L*(.5+.1*spanU(sd,2,1)),L+1]:null;
 // over the rim: the storeys step back from the edge; under it: hung on the face, each a little further out
 const above=[];for(let k=0;k<up;k++)above.push({y:k*sh,h:sh,zb:-D/2,zf:D/2-k*3});
 const below=[];for(let k=dn;k>=1;k--)below.push({y:-k*sh,h:sh,zb:D/2-1,zf:D/2+4+(dn-k)*2.5});
 spanBand(sd,L,8,above,d,{gap:gap,lawn:true,back:true});
 spanBand(KRAND.hash(sd,5),L,8,below,d,{gap:gap,back:!o.stage});
 // the great rounded nose along the roof's edge, and the land-side face's windows
 const nb=Math.round(L/8),bw=L/nb,ry=up*sh;
 for(let i=0;i<nb;i++){const xc=(i+.5)*bw;if(gap&&xc>gap[0])continue;if(d>0&&spanU(sd,i,50)<spanBreak(d)*.5)continue;
  kput(d>0?'postR':'postW',[xc,ry-1.4,D/2-.6],qEuler(0,0,Math.PI/2),[2.4,bw,2.4],null);
  kput('strip',[xc,ry-3.6,D/2+1.2],null,[bw*.9,1,1],d===0?CYAN:DEAD);
  for(let k=0;k<up;k++)kput(d>0&&spanU(sd,i,k,51)<.6?'spWinD':'spWinI',[xc,k*sh+2.3,-D/2-.05],null,[bw-1,sh-1.4,.18],null);}
 if(gap)spanDebris(sd,gap[0]-4,L,-(o.fall==null?0:o.fall),D/2+6,26,Math.round((L-gap[0])*.9),d);
 if(o.stage){spanRock(F.P,-20,L+20,-(o.fall||40),0,-D/2-30,D/2);}
 spanDone();return F.G;}

// ================================================================= the RING-WALLED DOME
// The concept's motif: a white dome on a drum with a band of windows, inside a low ring wall with a terrace between.
// o: {R (28), H (.74 R over the drum), wall (1.32 R), y, ry}
function buildSpanDome(scene,gx,gz,d,o){reseed(SPAN_SEED.dome+d);o=o||{};
 const R=o.R==null?28:o.R,H=o.H==null?R*.74:o.H,RW=o.wall==null?R*1.32:o.wall,DR=4.2;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.dome,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('dome','Ring-walled dome',gx,gz,F,d,o,[2*RW,2*RW,DR+H]);
 spanReg(F,'Span — ring-walled dome ('+STATE(d)+')',0,0,0,RW+1,DR+H+4);
 const SH=[],DK=[],prof=y=>R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.55);
 const bite=d===1||d===3?{u:spanU(sd,3,1),w:.12+.06*spanU(sd,3,2),y0:.08}:null;
 const bitten=(u,v)=>bite&&Math.abs(((u-bite.u+1.5)%1)-.5)<bite.w*(.35+.65*v)&&v>bite.y0;
 const hf=holeFn(d*.7,sd%997,null,1.3);
 // the drum with its window band, the dome over it (a toppled dome is its lower third, jagged)
 SH.push(lathe({rFn:()=>R*1.01,H:1.2,nu:64,nv:1}));
 const band=lathe({rFn:()=>R*.995,H:DR-1.8,nu:64,nv:1}).translate(0,1.2,0);
 mesh(band,d>0?MAT.winDead:MAT.winIntact,F.P);
 SH.push(lathe({rFn:()=>R*1.01,H:.6,nu:64,nv:1}).translate(0,DR-.6,0));
 const cut=d===2?H*(.28+.12*spanU(sd,3,3)):null;
 SH.push(lathe({rFn:prof,H:H,cut:cut==null?undefined:cut,jag:cut==null?undefined:H*.08,seed:sd%251,nu:72,nv:22,
  hole:d>0?(u,y)=>bitten(u,y/H)||(hf?hf(u,y):false):null}).translate(0,DR,0));
 if(bite||d===2)DK.push(lathe({rFn:y=>prof(y)*.96,H:H*.98,cut:cut==null?undefined:cut*.95,nu:40,nv:12,hole:(u,y)=>bite?bitten(u,y/H):false}).translate(0,DR,0));
 if(bite||d===2)floorSlabs(0,DR,0,y=>prof(Math.max(0,y)),4.5,(cut||H)*.8,4.5,d,null);
 // the lantern, copper rings, the strips
 if(d!==2){kput(SLABC(d),[0,DR+H*.995,0],null,[R*.16,.6,R*.16],null);
  kput(d>0?'postR':'postW',[0,DR+H+1.2,0],null,[R*.1,2.4,R*.1],null);}
 kput('ringR',[0,DR+.1,0],qEuler(Math.PI/2,0,0),[R*1.02,R*1.02,R*.04],null);
 stripRing(0,DR-.2,0,R*1.02,d,24);
 // the terrace and the ring wall, open on the front (+z) for the way in
 const gapA=.07;
 SH.push(new THREE.RingGeometry(R,RW,64,1).rotateX(-Math.PI/2).translate(0,.25,0));
 SH.push(lathe({rFn:()=>RW,H:3.6,nu:72,nv:3,hole:(u,y)=>Math.abs(u-.25)<gapA||(d>0&&hf?hf(u*3,y+40):false)}));
 SH.push(lathe({rFn:()=>RW-1,H:3.6,nu:72,nv:3,hole:(u,y)=>Math.abs(u-.25)<gapA}));
 SH.push(new THREE.RingGeometry(RW-1,RW,72,1,.75*TAU+gapA*TAU,(1-2*gapA)*TAU).rotateX(-Math.PI/2).translate(0,3.6,0));
 // the toppled dome's shell lies round it
 if(d===2)for(let i=0;i<14;i++){const a=spanU(sd,4,i)*TAU,r=R*(.7+.6*spanU(sd,5,i));
  kput(PLATE(1),[Math.cos(a)*r,1,Math.sin(a)*r],qEuler((spanU(sd,6,i)-.5)*1.2,a,(spanU(sd,7,i)-.5)*.8),[6+8*spanU(sd,8,i),.5,4+5*spanU(sd,9,i)],null);}
 if(d>0){mossOnRing(0,DR+.2,0,R*1.02,Math.round(R*.4),1.8);vinesOnRing(0,DR+H*.4,0,prof(H*.4)*1.02,Math.round(R*.25),H*.5);
  rubbleRing(0,0,0,R*1.05,RW-1.5,Math.round(R*.5),1.4);}
 meshMerged(SH,SHELL(d),F.P);if(DK.length)meshMerged(DK,MAT.guts,F.P);
 spanDone();return F.G;}

// ================================================================= the PAD ON A DRUM
// o: {R (32), h (8: the drum), y, ry}
function buildSpanPad(scene,gx,gz,d,o){reseed(SPAN_SEED.pad+d);o=o||{};
 const R=o.R==null?32:o.R,h=o.h==null?8:o.h,rd=R*.42,T=2.4;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.pad,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('pad','Landing pad',gx,gz,F,d,o,[2*R,2*R,h+T]);
 spanReg(F,'Span — landing pad ('+STATE(d)+')',0,0,0,R+1,h+T+2);
 const SH=[];
 // the drum: a core of the pad's whole height, a slit window band, a door on the front
 const dh=d===2?h*(.45+.2*spanU(sd,1,1)):h;
 SH.push(lathe({rFn:()=>rd,H:dh,cut:d===2?dh:undefined,jag:d===2?1.4:undefined,seed:sd%97,nu:48,nv:4}));
 mesh(lathe({rFn:()=>rd*1.005,H:1.4,nu:48,nv:1}).translate(0,Math.min(dh,h)*.55,0),d>0?MAT.winDead:MAT.winIntact,F.P);
 kput('archOpen',[0,2.2,rd+.1],null,[.6,.5,1],null);
 const deck=new THREE.Group();F.P.add(deck);
 const DG=[];
 DG.push(new THREE.CylinderGeometry(R,R*.94,T,72,1));
 DG.push(new THREE.CylinderGeometry(R*.5,R*.5,.12,48).translate(0,T/2+.05,0));
 if(d!==2){deck.position.set(0,h+T/2,0);
  meshMerged([DG[0]],SHELL(d),deck);mesh(DG[1],MAT.darkSurf,deck);
  kput('ringW',[0,h+T+.05,0],qEuler(Math.PI/2,0,0),[R*.72,R*.72,.5],null);
  kput(d>0?'ringR':'ringW',[0,h+T*.5,0],qEuler(Math.PI/2,0,0),[R*1.003,R*1.003,R*.03],null);
  stripRing(0,h+T+.1,0,R*.95,d,36);
  // the brackets from the drum to the deck's underside
  for(let k=0;k<10;k++){const a=k/10*TAU;if(d>0&&spanU(sd,2,k)<spanBreak(d))continue;
   beam(PLATE(d),[Math.cos(a)*rd,h*.35,Math.sin(a)*rd],[Math.cos(a)*R*.86,h-.1,Math.sin(a)*R*.86],.9,1.2);}
  if(d>0){mossOnRing(0,h+T+.1,0,R*.8,Math.round(R*.5),1.6);vinesOnRing(0,h+T*.2,0,R*1.0,Math.round(R*.35),h*.9);}}
 else{
  // toppled: the deck broke in two and lies tilted against the stump
  [-1,1].forEach(s=>{const half=new THREE.Group();F.P.add(half);
   half.position.set(s*R*.55,R*.32,(spanU(sd,3,s+1)-.5)*R*.4);half.rotation.set((spanU(sd,4,s+1)-.5)*.5,spanU(sd,5,s+1)*.6,s*.55);
   mesh(new THREE.CylinderGeometry(R,R*.94,T,48,1,false,s>0?0:Math.PI,Math.PI),SHELL(1),half);});
  rubbleRing(0,0,0,rd+1,R*1.3,Math.round(R*.8),1.6);spanDebris(sd,-R,R,0,-R,2*R,Math.round(R*.5),d);}
 meshMerged(SH,SHELL(d),F.P);
 spanDone();return F.G;}

// ================================================================= the CROSS
// The habitable bridge where the two highways cross the canyon (the Span itself). Local x runs along the canyon (W, its
// faces upstream -x and downstream +x), z across it (the span, abutments at both ends); the roof is the road (y 0).
// o: {W (120), S (300: the span), st (4), sh (4.5), gate (80: the gate towers on the abutments), keel (92: soffit to the
//     river), y, ry, stage}
function buildSpanCross(scene,gx,gz,d,o){reseed(SPAN_SEED.cross+d);o=o||{};
 const W=o.W==null?120:o.W,S=o.S==null?300:o.S,st=o.st==null?4:o.st,sh=o.sh==null?4.5:o.sh,GT=o.gate==null?80:o.gate,KL=o.keel==null?92:o.keel;
 const BH=st*sh,F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.cross,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('cross','The Cross (habitable bridge)',gx,gz,F,d,Object.assign({types:['infrastructure','military']},o),[W,S+2*GT,BH+KL]);
 spanReg(F,'Span — the Cross ('+STATE(d)+')',0,-BH,0,S/2,BH+1);
 spanReg(F,'Span — the Cross, north gate tower',0,0,S/2+GT/2,GT/2,10);
 spanReg(F,'Span — the Cross, south gate tower',0,0,-S/2-GT/2,GT/2,10);
 const gap=d===2?[-S*(.08+.06*spanU(sd,1,1)),S*(.07+.06*spanU(sd,1,2))]:null,inGap=z=>gap&&z>gap[0]&&z<gap[1];
 // the two long faces: storeys hung under the road, each nosed and banded; a face runs along z, so its band is turned
 const levels=[];for(let k=0;k<st;k++)levels.push({y:-BH+k*sh,h:sh,zb:-1,zf:2.2+k*1.2});
 [[-1,'up'],[1,'down']].forEach(([s,nm])=>{
  const P2=new THREE.Group();P2.position.set(s*W/2,0,s>0?S/2:-S/2);P2.rotation.y=s>0?Math.PI/2:-Math.PI/2;F.P.add(P2);
  const keep=KXF;F.G.updateMatrixWorld(true);
  const m=new THREE.Matrix4().copy(F.G.matrixWorld).invert().multiply(P2.matrixWorld),q=new THREE.Quaternion();m.decompose(new THREE.Vector3(),q,new THREE.Vector3());
  KXF={m:m,q:q};
  spanBand(KRAND.hash(sd,s+3),S,8,levels,d,{gap:gap?(s>0?[S/2-gap[1],S/2-gap[0]]:[gap[0]+S/2,gap[1]+S/2]):null,back:false});
  KXF=keep;});
 // the deck (the road) with its guideway, parapets; the soffit and the keel piers; the ends against the abutments
 const SH=[],DK=[],nz=Math.round(S/10);
 for(let i=0;i<nz;i++){const z0=-S/2+i*S/nz,zc=z0+S/(2*nz);if(inGap(zc))continue;
  kput(PLATE(d),[0,-.6,zc],null,[W,1.2,S/nz],null);
  kput('spRoad',[0,.06,zc],null,[18,.2,S/nz],null);
  kput(d>0?'postR':'postW',[0,.4,zc],qEuler(Math.PI/2,0,0),[.35,S/nz,.35],null);
  [-1,1].forEach(s=>kput(PLATE(d),[s*(W/2-.4),.6,zc],null,[.5,1.2,S/nz],null));
  kput(PLATE(d),[0,-BH-.4,zc],null,[W-2,.8,S/nz],null);
  if(d===0&&i%2===0)[-10,10].forEach(x=>kput('strip',[x,.25,zc],null,[1,1,6],CYAN));}
 // the belly: a shallow lens under the body, so the bridge reads as a span and not a slab
 SH.push(gridSurface((u,v)=>{const z=-S/2+u*S,x=-W/2+v*W,sag=8*(1-Math.pow(2*z/S,2))*(1-.35*Math.pow(2*x/W,2));return[x,-BH-.8-sag,z];},48,12,
  {uS:S/8,vS:W/8,hole:gap?(u,v)=>inGap(-S/2+u*S):null}));
 // piers to the river: three pairs, tapering
 [-.3,0,.3].forEach((t,j)=>{const z=t*S;if(inGap(z))return;[-1,1].forEach(s=>{
  if(d>0&&spanU(sd,6,j,s+1)<spanBreak(d)*.6)return;
  beam(PLATE(d),[s*W*.28,-BH-6,z],[s*W*.2,-BH-KL,z],5,7);});});
 // the gate towers on the abutments: two blocks each side of the road, an arch over it
 [-1,1].forEach(s=>{const zc=s*(S/2+GT/2);
  [-1,1].forEach(t=>{const xc=t*(W/4+5),gl=[{y:0,h:sh,zb:-GT/2,zf:GT/2},{y:sh,h:sh,zb:-GT/2+2,zf:GT/2-2}];
   const P3=new THREE.Group();P3.position.set(xc-(W/2-10)/2,0,zc);F.P.add(P3);
   const keep=KXF;F.G.updateMatrixWorld(true);
   const m=new THREE.Matrix4().copy(F.G.matrixWorld).invert().multiply(P3.matrixWorld),q=new THREE.Quaternion();m.decompose(new THREE.Vector3(),q,new THREE.Vector3());
   KXF={m:m,q:q};
   // the tower is a short band along x (its depth along z): turn the levels so its front faces the road end
   spanBand(KRAND.hash(sd,s+11,t+21),W/2-10,8,gl.map(l=>({y:l.y,h:l.h,zb:-l.zf,zf:l.zf})),d,{back:true});
   KXF=keep;});
  kput(d>0?'archR':'arch',[0,0,zc],null,[1.3,.55,1],null);});
 [-1,1].forEach(s=>kput(PLATE(d),[0,-BH/2,s*(S/2-.3)],null,[W,BH,.6],null));
 if(gap){spanDebris(sd,-W/2,W/2,-BH-KL,gap[0]-10,(gap[1]-gap[0])+20,140,d);}
 if(o.stage){[-1,1].forEach(s=>spanRock(F.P,-W/2-30,W/2+30,-BH-KL-2,-.05,s>0?S/2:-S/2-GT-40,s>0?S/2+GT+40:-S/2));}
 meshMerged(SH,SHELL(d),F.P);if(DK.length)meshMerged(DK,MAT.guts,F.P);
 spanDone();return F.G;}

// ================================================================= the WEIR and the SLUICE STAIR
// A barrage across a channel (local x across, the water runs to +z): piers with rounded noses upstream, sluice gates
// between, a walkway deck and a gantry rail over them, an ogee spillway face downstream. o: {L (180), h (10), bays (9),
// steps (1; the Sluice Stair is 4), drop (the fall per step: 17.5), run (36: each step's length downstream), y, ry, stage}
function buildSpanWeir(scene,gx,gz,d,o){reseed(SPAN_SEED.weir+d);o=o||{};
 const L=o.L==null?180:o.L,h=o.h==null?10:o.h,nb=o.bays==null?9:o.bays,ns=o.steps==null?1:o.steps,drop=o.drop==null?17.5:o.drop,run=o.run==null?36:o.run;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.weir,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 const name=ns>1?'The sluice stair':'The weir';
 spanTag('weir',name,gx,gz,F,d,o,[L,ns*run,h+ns*drop]);
 spanReg(F,'Span — '+name.toLowerCase()+' ('+STATE(d)+')',0,-(ns-1)*drop,(ns-1)*run/2,Math.max(L,ns*run)/2,h+(ns-1)*drop+4);
 const bw=L/nb,breach=d===2?[Math.floor(nb*(.3+.2*spanU(sd,1,1))),Math.floor(nb*(.3+.2*spanU(sd,1,1)))+2]:null;
 const SH=[],CN=[];
 for(let s=0;s<ns;s++){const y0=-s*drop,z0=s*run;
  // the spillway: an ogee curve from the crest down the step's face
  CN.push(gridSurface((u,v)=>{const x=-L/2+u*L,z=z0+3+v*(run*.55),y=y0+h*.55-h*(v*v*(3-2*v));return[x,y,z];},Math.max(8,nb*2),10,
   {uS:L/8,vS:run/8,hole:breach?(u,v)=>{const b=Math.floor(u*nb);return b>=breach[0]&&b<=breach[1];}:null}));
  for(let b=0;b<=nb;b++){const x=-L/2+b*bw,broken=breach&&b>=breach[0]&&b<=breach[1]+1;
   const ph=broken?h*(.3+.3*spanU(sd,s,b,2)):h+4;
   kput(d>0?'pierR':'pierW',[x,y0+ph/2,z0],null,[3.4,ph,10],null);
   if(!broken)kput(d>0?'postR':'postW',[x,y0+ph/2,z0-5],null,[1.7,ph,1.7],null);
   if(b<nb){const xc=x+bw/2,bb=breach&&b>=breach[0]&&b<=breach[1];
    if(!bb){const r=spanU(sd,s,b,3),gone=d>0&&r<spanBreak(d)*1.6,hang=d>0&&!gone&&r<spanBreak(d)*3;
     if(!gone)kput(PLATE(d>0?1:0),[xc,y0+h*(hang?.25:.55),z0-1.5],hang?qEuler(.35,0,(spanU(sd,s,b,4)-.5)*.5):null,[bw-3.6,h*.6,.7],null);
     kput(PLATE(d),[xc,y0+h+3.6,z0],null,[bw,.8,4.5],null);
     kput(d>0?'pipeR':'pipe',[xc,y0+h+5,z0-1.6],qEuler(0,0,Math.PI/2),[.35,bw,.35],null);
     kput(d>0?'pipeR':'pipe',[xc,y0+h+5,z0+1.6],qEuler(0,0,Math.PI/2),[.35,bw,.35],null);}}}
  // the gantry: one frame over a bay, parked
  const gb=Math.floor(nb*spanU(sd,s,9,9)),gx0=-L/2+(gb+.5)*bw;
  if(!(breach&&gb>=breach[0]&&gb<=breach[1])){[-1.6,1.6].forEach(dz=>[-1,1].forEach(dx=>beam(PLATE(d),[gx0+dx*(bw/2-1),y0+h+5,z0+dz],[gx0+dx*(bw/2-1),y0+h+12,z0+dz],.6,.6)));
   kput(PLATE(d),[gx0,y0+h+12.4,z0],null,[bw-1,.9,4],null);}
  if(d===0)for(let b=0;b<nb;b++)kput('strip',[-L/2+(b+.5)*bw,y0+h+3.1,z0+2.4],null,[bw*.8,1,1],CYAN);
  if(d>0)for(let i=0;i<nb*3;i++){const u=spanU(sd,s,i,20);kput('moss',[-L/2+u*L,y0+h*.6,z0+4+spanU(sd,s,i,21)*4],null,[1.8,.6,1.4],null);}}
 if(breach)spanDebris(sd,-L/2+breach[0]*bw,-L/2+(breach[1]+1)*bw,-(ns-1)*drop-h*.5,(ns-1)*run+6,30,60,d);
 if(o.stage){spanRock(F.P,-L/2-40,-L/2,-(ns-1)*drop-h-2,h+6,-30,ns*run+20);spanRock(F.P,L/2,L/2+40,-(ns-1)*drop-h-2,h+6,-30,ns*run+20);}
 meshMerged(CN,CONC(d),F.P);if(SH.length)meshMerged(SH,SHELL(d),F.P);
 spanDone();return F.G;}

// ================================================================= the ROAD TUNNEL PORTAL
// One broad way with a guideway down its middle (LORE.md 4), under a white curved hood, in a cliff face at z = 0 facing
// +z. o: {W (16), H (11), depth (70: the bore drawn), hood (12), y, ry, stage}. Ruined: the hood broken, rubble in the
// mouth; toppled: the mouth half collapsed.
function buildSpanPortal(scene,gx,gz,d,o){reseed(SPAN_SEED.portal+d);o=o||{};
 const W=o.W==null?16:o.W,H=o.H==null?11:o.H,DP=o.depth==null?70:o.depth,HD=o.hood==null?12:o.hood,hw=5;
 const F=spanFrame(scene,gx,gz,o),sd=KRAND.hash(SPAN_SEED.portal,o.seed==null?Math.round(gx):o.seed,Math.round(gz));
 spanTag('portal','Road tunnel portal',gx,gz,F,d,o,[W+16,DP+HD,H+8]);
 spanReg(F,'Span — road tunnel portal ('+STATE(d)+')',0,0,HD/2,W/2+9,H+8);
 // the arch: straight walls to hw, a half-ellipse over them; offset outward for the hood's outer skin
 const arch=(t,off)=>{const a=t*Math.PI,rx=W/2+off,ry=H-hw+off;return t<0?[-rx,hw*(1+t*4)]:[-Math.cos(a)*rx,hw+Math.sin(a)*ry];};
 const ring=(u,off)=>u<.15?[-(W/2+off),hw*(u/.15)]:u>.85?[W/2+off,hw*((1-u)/.15)]:arch((u-.15)/.7,off);
 const SH=[],CN=[],DK=[],p=spanBreak(d);
 // the bore's lining, and a dark cap at its far end
 CN.push(gridSurface((u,v)=>{const q=ring(u,0);return[q[0],q[1],-v*DP];},24,Math.round(DP/6),{uS:(W+H*2)/8,vS:DP/8}));
 DK.push(new THREE.PlaneGeometry(W+1,H+1).translate(0,H/2,-DP+.2));
 // the hood: outer and inner skins and its front edge, broken in a ruin
 const hoodHole=d>0?(u,v)=>spanU(sd,Math.floor(u*20),Math.floor(v*4),31)<p*(d===2?3:1.6):null;
 SH.push(gridSurface((u,v)=>{const q=ring(u,2.6);return[q[0],q[1],v*HD*(1-.35*Math.pow(2*u-1,2))];},32,6,{uS:(W+H*2)/8,vS:HD/8,hole:hoodHole}));
 SH.push(gridSurface((u,v)=>{const q=ring(u,.2);return[q[0],q[1],v*HD*(1-.35*Math.pow(2*u-1,2))];},32,6,{uS:(W+H*2)/8,vS:HD/8,hole:hoodHole}));
 SH.push(gridSurface((u,v)=>{const q=ring(u,.2+v*2.4);return[q[0],q[1],HD*(1-.35*Math.pow(2*u-1,2))];},32,1,{uS:(W+H*2)/8,vS:.4,hole:hoodHole?(u,v)=>hoodHole(u,.99):null}));
 // the flanking pylons, the face round the hood, the road and its guideway, the lights in the bore
 [-1,1].forEach(s=>{kput(d>0?'pierR':'pierW',[s*(W/2+6),(H+6)/2,2],null,[4,H+6,5],null);
  kput(d>0?'postR':'postW',[s*(W/2+6),H+6.6,2],null,[2.4,1.2,2.4],null);});
 kput('spCopper',[0,H+3.3,HD*.6],null,[W+3,.5,.4],null);
 kput('spRoad',[0,.1,(HD+20-DP)/2],null,[W-1,.2,DP+HD+20],null);
 kput(d>0?'postR':'postW',[0,.4,(HD+20-DP)/2],qEuler(Math.PI/2,0,0),[.32,DP+HD+20,.32],null);
 for(let z=-4;z>-DP+4;z-=7)kput('strip',[0,H-.3,z],null,[3,1,1],d===0||o.lit?CYAN:DEAD);
 // the ruin: rubble in the mouth; toppled: the mouth half filled, the hood's pieces down the apron
 if(d>0){const n=d===2?220:50,reach=d===2?.85:.35;
  for(let i=0;i<n;i++){const u=spanU(sd,i,40),v=spanU(sd,i,41),w=spanU(sd,i,42),z=HD-(DP*.3+HD)*v,x=(u-.5)*W*.95,
   hgt=d===2?H*reach*(1-Math.abs(2*u-1))*(1-.5*v):1.2;
   kput('rubble',[x,Math.max(.4,hgt*w),z],qEuler(u*4,v*4,w*4),1.2+2.4*w,null);}
  if(d===2)spanDebris(sd,-W/2-4,W/2+4,0,HD,18,24,d);
  mossOnRing(0,H+2.4,HD*.4,W/2+2,24,1.6);}
 if(o.stage){const dep=DP+10,top=H+16;
  spanRock(F.P,-W/2-60,-W/2-.1,0,top,-dep,0);spanRock(F.P,W/2+.1,W/2+60,0,top,-dep,0);spanRock(F.P,-W/2,W/2,H+2.8,top,-dep,0);}
 meshMerged(SH,SHELL(d),F.P);meshMerged(CN,CONC(d),F.P);meshMerged(DK,MAT.guts,F.P);
 spanDone();return F.G;}
