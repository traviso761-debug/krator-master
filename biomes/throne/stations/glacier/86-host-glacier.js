// ================================================================= HOST — the glacier's ice, waters and caves
// As RECORDS first (README.md), then drawn. The lake (milky with rock flour) and the river's braids (flowing DOWN the
// flank); the icefall's seracs and the icebergs in the lake; on the shelf the ice towers (frozen steam round the
// fumaroles), the ice caves (shells of ice the steam has hollowed: a mouth toward the valley, lit blue through their walls,
// warm inside: the mat, moss, glow mushrooms, a few lamp caps: the warm living spots) and an ice arch; and the steam.
// 2026-11-03: the drawing is core/terrain's (KGLACIER.drawer, host/44h-core-glacier-draw.js, lifted from this file). The
// seracs, bergs and towers keep this station's own draws (BIO.fn, in their order), so the page draws what it drew; a new
// glacier places them with KGLACIER's (KRAND per index).
const GLACIER={lake:{level:LAKE.level},caves:CAVES.map(C=>({x:C.x,z:C.z,R:C.R,H:C.H,face:C.face,life:0})),towers:TOWERS.length,fumaroles:FUMS.length,seracs:0,bergs:0,arch:{x:ARCH.x,z:ARCH.z,span:ARCH.span}};
const lin=h=>new THREE.Color(h).convertSRGBToLinear();

// ---------------------------------------------------------------- the waters
// 2026-10-26: the proglacial lake and the river's braids are core/water's (89w-host-water.js: a WATER.open over the lake's basin, a
// WATER.flow per braid), drawn after core/atmos is bound (89). The page's own lake and river shaders are gone.

// ---------------------------------------------------------------- the ice: seracs, icebergs, ice towers
const ICECLEAR=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.iceclear');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const ICE_MAT=BIO.solidMat(ICECLEAR);   // the owner's clear ice (the instance colour tints it)
const ICEC=[0xd8e8f4,0xc4dcee,0xb0d0ea,0xe4eef6,0x9cc4e4];
const GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:_onLight,camera,renderer,map:ICECLEAR});
// a serac: a block of ice, its faces broken, its top chiselled to a slant; an ice tower: a rough chimney of frozen steam
GD.defSerac(ICE_MAT);GD.defTower(ICE_MAT);
(function(){reseed(8612);
 // the seracs: blocks and towers of ice tumbling down the icefall, standing on the ice
 const flow=Math.atan2(DN[1],DN[0]);
 for(let u=1300;u<1725&&GLACIER.seracs<340;u+=rr(11,17))for(let aw=-.84;aw<.84;aw+=rr(.025,.06)){if(rng()<.35)continue;const uu=u+rr(-2,2),c=upAt(uu,GL.pg(uu)+aw*GL.W(uu));if(iceAt(c[0],c[1])<8)continue;
  const s=rr(4,11)*(1-.4*Math.abs(aw)),h=s*rr(.8,1.8);BIO.put('serac',[c[0],terrainH(c[0],c[1])-h*.3,c[1]],qEuler(rr(-.12,.12),-flow+rr(-.35,.35),rr(-.45,.15)),[s,h,s*rr(.5,.9)],C3(pick(ICEC)));GLACIER.seracs++;}
 // the icebergs: calved from the snout, floating near it
 for(let k=0;k<400&&GLACIER.bergs<16;k++){const u=rr(GL.SNOUT-160,GL.SNOUT-10),p=TERM.p0+rr(-1,1)*TERM.W0*.8,c=upAt(u,p);if(lakeAt(c[0],c[1])<.6||terrainH(c[0],c[1])>LAKE.level-1)continue;
  const s=rr(2,7);BIO.put('serac',[c[0],LAKE.level-s*.35,c[1]],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*rr(.5,.9),s*rr(.6,1)],C3(pick(ICEC)));GLACIER.bergs++;}
 // the ice towers
 TOWERS.forEach(T=>{const y=terrainH(T.x,T.z);BIO.put('icetower',[T.x,y-.4,T.z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[T.r,T.h,T.r],C3(pick(ICEC)).multiplyScalar(rr(.95,1.05)));});
})();
function C3(h){return new THREE.Color(h);}

// ---------------------------------------------------------------- the ice caves
// A shell of ice: a dome (its outer face ice-white, rough), hollow, its mouth an arch cut on the side toward the valley; the
// inner face lit blue through the ice (deeper blue away from the mouth, scalloped as melt-caves are), a rim where the two meet
CAVES.forEach(C=>GD.cave(Object.assign({},C,{reg:{cave:CAVES.indexOf(C)}})));
// the warm floors inside: the mat, moss, glow mushrooms (the pack's), brain caps and a few small lamp caps: Krator's own
// life at -30 outside, warm and lit inside
(function(){reseed(8630);const P=THRONE.PAL,GS=THRONE.LIB.cardsOf('glowshroom'),prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';   // the kit's items: in its registry
 CAVES.forEach((C,ci)=>{let n=0;const used=[];   // each thing on the floor clear of the others (they clipped)
  const inside=(r)=>{r=r||.6;for(let k=0;k<12;k++){const a=rr(0,TAU),d=C.R*.72*Math.sqrt(rng()),x=C.x+Math.cos(a)*d,z=C.z+Math.sin(a)*d;if(used.every(q=>Math.hypot(q[0]-x,q[1]-z)>q[2]+r)){used.push([x,z,r]);return[x,z];}}const a=rr(0,TAU),d=C.R*.72;return[C.x+Math.cos(a)*d,C.z+Math.sin(a)*d];};
  for(let k=0;k<12;k++){const [x,z]=inside(),R=rr(1.2,3);BIO.put('mat',[x,C.floor+.04,z],qEuler(0,rr(0,TAU),0),[R,1,R],C3(pick(P.mat)));n++;}
  for(let k=0;k<24;k++){const s=rr(.5,1.1),[x,z]=inside(s);BIO.put('mossclump',[x,C.floor+s*.12,z],qEuler(0,rr(0,TAU),0),[s,s*.4,s],THRONE.LIB.mossclump?null:C3(pick(P.moss||[0x3a5a2a])),{n:[0,1,0]});n++;}
  for(let k=0;k<16;k++){const s=rr(.3,.7),[x,z]=inside(s*1.2);BIO.put('brain',[x,C.floor-.05,z],qEuler(0,rr(0,TAU),0),[s,s*.7,s],C3(pick(P.brain)));n++;}
  if(GS.length)for(let k=0;k<36;k++){const s=rr(.3,.65),[x,z]=inside(s*.8);BIO.put(pick(GS),[x,C.floor,z],qEuler(0,rr(0,TAU),0),[s,s,s],null);n++;}
  for(let k=0;k<9;k++){const h=rr(.8,1.8),s=rr(.3,.55),[x,z]=inside(s*1.1);BIO.beam('rod',[x,C.floor-.1,z],[x,C.floor+h,z],.04,.03,C3(pick(P.lampStem)));BIO.put('lamp',[x,C.floor+h,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s,s],C3(pick(P.lamp)));n++;}
  GLACIER.caves[ci].life=n;});BIO.cur=cur;BIO.kit(prev);})();
// the ice arch: a bowed span of ice over the shelf (the owner's reference board, refs/02)
GD.arch(ARCH);

// ---------------------------------------------------------------- the steam
// the fumaroles breathe tall plumes (they freeze into the towers); a wisp from each tower's top; a little at the caves' mouths
GD.steam([...FUMS.map(F=>({x:F.x,z:F.z,y:terrainH(F.x,F.z),n:Math.round(14+16*F.s),size:5+4*F.s,rise:30+30*F.s,rate:.06})),
 ...TOWERS.filter(T=>T.fum).map(T=>({x:T.x,z:T.z,y:terrainH(T.x,T.z)+T.h,n:4,size:1.6,rise:8,rate:.1})),
 ...CAVES.map(C=>({x:C.x+Math.cos(C.face)*C.R*.95,z:C.z+Math.sin(C.face)*C.R*.95,y:C.floor+C.H*.55,n:6,size:2.5,rise:10,rate:.07}))],8650);
GD.bindClock();
OBSTACLES.push(...CAVES.map(C=>({x:C.x,z:C.z,r:C.R*1.1})),...TOWERS.map(T=>({x:T.x,z:T.z,r:T.r*1.2})),{x:ARCH.x,z:ARCH.z,r:ARCH.span*.6});
_mark('layout');