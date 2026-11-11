// ================================================================= HOST — the way: the guideways, the strip, the walkway, the road, the lamps
// PLAN.md section 3. The guideways along every unbroken run of each track (LINE.trackRuns), following the track's x along z (LINE.trackX: a
// track splays into a station): each a concrete beam 2.8 m wide and 0.6 m high, its guide slot and power strip, the kept runs patched with
// plate. Where the window is the plain gallery (LINE.gallerySpans): the invert between, the central strip, the road's footway, the access road
// and its barrier, the walkway on the east wall with its handrail, the dead cyan strips (lit where LINE.cyanLit). The crossovers (the flexing
// beams' run, the switch machines), the lamps of the code on their posts and masts, the Ancients' crown fittings, the vein's working.
const WAY=(function(){const W=LINE.WIN,G=SEC.guide,B=LB.B(100),rg=LB.rgb,STEP=50,ST=STATION.state||'kept';
 /* the cyan strips lit where LINE.cyanLit says (true, or a function of z: the hot door lights them only past its inner door) */
 const cyLit=z=>typeof LINE.cyanLit==='function'?!!LINE.cyanLit(z):!!LINE.cyanLit,CYL=rg(0x5ee0f0),CYD=rg(0x24474a),cyanAt=z=>cyLit(z)?CYL:CYD;
 const C={guide:rg(0x9c9a92),guideTop:rg(0x8a8984),slot:rg(0x2a2826),power:rg(0x5a5c5e),conc:rg(0x8e8a82),invert:rg(0x6e6a64),strip:rg(0x84807a),
  road:rg(0x4a4846),line:rg(0xcfc7a8),barrier:rg(0x9a978e),walk:rg(0x6a6c68),rail:rg(0x5c5e5a),post:rg(0x3a3e3c),plate:rg(0x6e4a32),plateG:rg(0x3f5a43),
  cyan:rg(0x24474a),crown:rg(0x3a4040),green:rg(0x7dffa8),greenDead:rg(0x2a3a30),amber:rg(0xffb060),red:rg(0xff4a3a),dark:rg(0x262a2a),rubble:rg(0x6e6458),rope:rg(0xa08a60)};
 /* the guideways along each track's runs, in 4 m steps on its x */
 SEC.tracks.forEach(T=>{const RUNS=LINE.trackRuns(T.id);RUNS.forEach((run)=>{const [z0,z1,state]=run,h=G.h,hw=G.w/2,sl=G.slot/2;
  /* a run's end is a buffer only where no other run of the track carries on from it (kept into blocked is one track) */
  const carriesOn=ze=>RUNS.some(r=>r!==run&&(Math.abs(r[0]-ze)<.5||Math.abs(r[1]-ze)<.5));
  for(let za=z0;za<z1-1e-6;za+=4){const zb=Math.min(z1,za+4),xa=LINE.trackX(T.id,za),xb=LINE.trackX(T.id,zb);
   B.quad('guide',[xa-hw,0,za],[xb-hw,0,zb],[xb-hw,h,zb],[xa-hw,h,za],C.guide);B.quad('guide',[xb+hw,0,zb],[xa+hw,0,za],[xa+hw,h,za],[xb+hw,h,zb],C.guide);
   B.quad('guide',[xa-hw,h,za],[xb-hw,h,zb],[xb-sl,h,zb],[xa-sl,h,za],C.guideTop);B.quad('guide',[xa+sl,h,za],[xb+sl,h,zb],[xb+hw,h,zb],[xa+hw,h,za],C.guideTop);
   B.quad('metal',[xa-sl,h,za],[xb-sl,h,zb],[xb-sl,h-.35,zb],[xa-sl,h-.35,za],C.slot);B.quad('metal',[xa+sl,h-.35,za],[xb+sl,h-.35,zb],[xb+sl,h,zb],[xa+sl,h,za],C.slot);
   B.quad('metal',[xa-sl,h-.35,za],[xb-sl,h-.35,zb],[xb+sl,h-.35,zb],[xa+sl,h-.35,za],C.power);}
  /* the Tungangs' patches: a plate over a cracked stretch of a kept beam's top, by hash */
  if(state==='kept')for(let za=Math.ceil(z0/STEP)*STEP;za<z1-STEP;za+=STEP){const hp=KRAND.unit(KRAND.hash(SITE.world,Math.floor(za),Math.round(T.x*10)));
   if(hp<.35){const pz=za+5+hp*30,x=LINE.trackX(T.id,pz);B.box('metal',x-hw+.15,x-sl-.05,h,h+.02,pz,pz+1.6,C.plate);}}
  /* buffer stops where a run ends inside the window (a gap's edge, a siding's end) */
  for(const [ze,dir] of [[z0,-1],[z1,1]])if(ze>W.z0+1&&ze<W.z1-1&&!carriesOn(ze)){const x=LINE.trackX(T.id,ze);B.box('metal',x-1.2,x+1.2,h,h+1.1,ze-(dir>0?.9:-.1),ze-(dir>0?.1:-.9),C.plateG);
   B.box('paint',x-1.0,x+1.0,h+.7,h+.95,ze-(dir>0?.92:-.08),ze-(dir>0?.88:-.12),rg(0xd8cfb0));}});});
 /* the plain gallery's works, over each span */
 const iv=LW.invertGaps(SEC,SEC.tracks.map(T=>T.x));
 (LINE.gallerySpans||[]).forEach(([s0,s1])=>{for(let z=s0;z<s1;z+=STEP){const za=z,zb=Math.min(s1,z+STEP),inXO=(LINE.crossovers||[]).some(X=>zb>X.z0-10&&za<X.z1+10);
  for(const [a,b] of iv)B.quad('conc',[a,0,za],[a,0,zb],[b,0,zb],[b,0,za],C.invert);
  if(!inXO)B.box('conc',SEC.strip.x0,SEC.strip.x1,0,SEC.strip.y,za,zb,C.strip);
  B.quad('road',[SEC.road.x0,SEC.road.y,za],[SEC.road.x0,SEC.road.y,zb],[SEC.road.x1,SEC.road.y,zb],[SEC.road.x1,SEC.road.y,za],C.road);
  for(let d=za;d<zb;d+=9)B.quad('paint',[SEC.road.lane-.07,SEC.road.y+.005,d],[SEC.road.lane-.07,SEC.road.y+.005,Math.min(zb,d+3)],[SEC.road.lane+.07,SEC.road.y+.005,Math.min(zb,d+3)],[SEC.road.lane+.07,SEC.road.y+.005,d],C.line);
  const [b0,b1]=SEC.road.barrier,bh=SEC.road.y+SEC.road.barrierH,by=SEC.road.y;
  B.quad('conc',[b0,by,za],[b0,by,zb],[b0+.12,bh,zb],[b0+.12,bh,za],C.barrier);B.quad('conc',[b1,by,zb],[b1,by,za],[b1-.12,bh,za],[b1-.12,bh,zb],C.barrier);
  B.quad('conc',[b0+.12,bh,za],[b0+.12,bh,zb],[b1-.12,bh,zb],[b1-.12,bh,za],C.barrier);
  B.quad('glow',[b0+.14,bh+.004,za],[b0+.14,bh+.004,zb],[b1-.14,bh+.004,zb],[b1-.14,bh+.004,za],cyanAt(za));
  B.quad('road',[SEC.road.x0,0,za],[SEC.road.x0,0,zb],[SEC.road.x0,SEC.road.y,zb],[SEC.road.x0,SEC.road.y,za],C.conc);
  B.box('conc',SEC.road.foot[0],SEC.road.foot[1],0,SEC.road.footY,za,zb,C.conc);
  B.box('conc',SEC.walk.x0,SEC.walk.x1,0,SEC.walk.y-.05,za,zb,C.conc,true);
  B.quad('grate',[SEC.walk.x0,SEC.walk.y,za],[SEC.walk.x0,SEC.walk.y,zb],[SEC.walk.x1,SEC.walk.y,zb],[SEC.walk.x1,SEC.walk.y,za],C.walk);
  B.quad('glow',[SEC.walk.x0-.004,SEC.walk.y-.12,za],[SEC.walk.x0-.004,SEC.walk.y-.12,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,za],cyanAt(za));
  for(let p=za;p<zb-1e-6;p+=2.5)B.box('metal',SEC.walk.x0+.08,SEC.walk.x0+.14,SEC.walk.y,SEC.walk.y+1.05,p,p+.06,C.rail);
  B.box('metal',SEC.walk.x0+.06,SEC.walk.x0+.16,SEC.walk.y+1.0,SEC.walk.y+1.06,za,zb,C.rail);
  B.box('metal',SEC.walk.x0+.08,SEC.walk.x0+.14,SEC.walk.y+.5,SEC.walk.y+.54,za,zb,C.rail);}});
 /* THE CROSSOVERS: the diagonal beam between two tracks (its run), the switch machines at each end */
 (LINE.crossovers||[]).forEach(X=>{const h=G.h,hw=G.w/2,n=12;
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,za=X.z0+(X.z1-X.z0)*t0,zb=X.z0+(X.z1-X.z0)*t1,ease=t=>t<.5?2*t*t:1-2*(1-t)*(1-t),
   a0=LINE.trackX(X.a,za),b0=LINE.trackX(X.b,za),a1=LINE.trackX(X.a,zb),b1=LINE.trackX(X.b,zb),xa=a0+(b0-a0)*ease(t0),xb=a1+(b1-a1)*ease(t1);
   B.quad('guide',[xa-hw,h,za],[xb-hw,h,zb],[xb+hw,h,zb],[xa+hw,h,za],C.guideTop);
   B.quad('guide',[xa-hw,0,za],[xb-hw,0,zb],[xb-hw,h,zb],[xa-hw,h,za],C.guide);B.quad('guide',[xa+hw,0,za],[xb+hw,0,zb],[xb+hw,h,zb],[xa+hw,h,za],C.guide);
   B.quad('metal',[xa-.15,h+.004,za],[xb-.15,h+.004,zb],[xb+.15,h+.004,zb],[xa+.15,h+.004,za],C.slot);}
  const a=LINE.trackX(X.a,X.z0),b=LINE.trackX(X.b,X.z1);
  for(const [x,z] of [[a+(a>b?-1:1)*2.2,X.z0+4],[b+(b>a?-1:1)*2.2,X.z1-4]])B.box('metal',x-.4,x+.4,0,.7,z-.6,z+.6,C.plateG);});
 /* THE LAMPS: the posts and their heads (green: the Line; white hooded: danger, a gap's edge; amber: work), a mast's signal aspect */
 LINE.lamps.forEach(l=>{const base=l.base==null?0:l.base,on=l.on!==false,head=l.kind==='white'?rg(0xfff4dc):l.kind==='amber'?C.amber:l.kind==='red'?C.red:C.green;
  B.box('metal',l.x-.06,l.x+.06,base,l.y-.1,l.z-.06,l.z+.06,C.post);
  B.box('metal',l.x-.14,l.x+.14,l.y-.16,l.y+.1,l.z-.14,l.z+.14,C.dark);
  B.box(on?'glow':'metal',l.x-.09,l.x+.09,l.y-.12,l.y+.06,l.z-.15,l.z+.15,on?head:C.greenDead);
  if(l.kind==='white')B.box('metal',l.x-.2,l.x+.2,l.y+.06,l.y+.1,l.z-.2,l.z+.2,C.dark);          /* the hood */
  if(l.mast){B.box('metal',l.x+.3,l.x+.62,l.y-1.6,l.y-.9,l.z-.12,l.z+.12,C.dark);B.box(on?'glow':'metal',l.x+.4,l.x+.52,l.y-1.2,l.y-1.08,l.z-.13,l.z+.13,on?C.red:C.dark);}});
 (LINE.crown||[]).forEach(c=>B.box(cyLit(c.z)?'glow':'metal',c.x-.6,c.x+.6,c.y,c.y+.18,c.z-.15,c.z+.15,cyLit(c.z)?rg(0xd8f4ff):C.crown));
 /* THE VEIN'S WORKING at its niche: the amber lamp on its stand, spoil heaped on the walkway, a coil of rope */
 if(LINE.vein){const V=LINE.vein,x=SEC.walk.x0+1.4,z=V.z;
  B.box('metal',x-.05,x+.05,SEC.walk.y,SEC.walk.y+1.7,z-1.6,z-1.5,C.post);B.box('glow',x-.12,x+.12,SEC.walk.y+1.62,SEC.walk.y+1.82,z-1.67,z-1.43,C.amber);
  [[.4,2.2,.55],[.9,3.1,.4],[.2,3.6,.35],[.7,1.5,.3]].forEach(s=>{const cx=SEC.walk.x0+.6+s[0],cz=z+s[1];B.box('rubble',cx-s[2],cx+s[2],SEC.walk.y,SEC.walk.y+s[2]*.9,cz-s[2]*1.2,cz+s[2]*1.2,C.rubble);});
  B.box('paint',SEC.walk.x0+1.6,SEC.walk.x0+2.0,SEC.walk.y,SEC.walk.y+.12,z+.8,z+1.2,C.rope);}
 const g=B.finish('the way',{label:{guide:'A guideway: a concrete beam 2.8 m wide, 0.6 m high, its guide slot and power strip',conc:'The invert, the central strip, the footway and the barrier (concrete)',
  road:'The access road (two lanes for the Ancients\' service vehicles)',grate:'The walkway (grating over the cable trough)',metal:'Steel: the handrail, the posts, the slot\'s lips, the buffers, the Fixers\' patches',
  glow:'The lamp code: green the Line, white hooded danger, amber work; the cyan strips',paint:'Paint: the road\'s line, the buffers\' boards',rubble:'Spoil from the vein\'s working'}});
 g.userData.way=true;scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=LINE.lamps.flatMap(l=>[l.x,l.y,l.z]);
 return {group:g,tris:B.tris};})();
