// ================================================================= HOST — the way's details: the patches, the lamps, the crown fittings, the vein
// PLAN.md section 3. The guideways, their buffer stops, the crossovers' beams, the invert, the strip, the road, its barrier and footway and the
// walkway are the line kind's (KTRANSIT.draw.line, drawn by 85 with this page as its host). Here what the kind does not draw: the Tungangs' plate
// patches on the kept beams, the walkway's grating, posts and mid rail and the cyan strips on the barrier and the walkway's edge (lit where
// LINE.cyanLit says), the crossovers' switch machines, the lamps of the code on their posts and masts, the Ancients' crown fittings, the vein's working.
const WAY=(function(){const W=LINE.WIN,G=SEC.guide,B=LB.B(100),rg=LB.rgb,STEP=50,ST=STATION.state||'kept';
 /* the cyan strips lit where LINE.cyanLit says (true, or a function of z: the hot door lights them only past its inner door) */
 const cyLit=z=>typeof LINE.cyanLit==='function'?!!LINE.cyanLit(z):!!LINE.cyanLit,CYL=rg(0x5ee0f0),CYD=rg(0x24474a),cyanAt=z=>cyLit(z)?CYL:CYD;
 const C={guide:rg(0x9c9a92),guideTop:rg(0x8a8984),slot:rg(0x2a2826),power:rg(0x5a5c5e),conc:rg(0x8e8a82),invert:rg(0x6e6a64),strip:rg(0x84807a),
  road:rg(0x4a4846),line:rg(0xcfc7a8),barrier:rg(0x9a978e),walk:rg(0x6a6c68),rail:rg(0x5c5e5a),post:rg(0x3a3e3c),plate:rg(0x6e4a32),plateG:rg(0x3f5a43),
  cyan:rg(0x24474a),crown:rg(0x3a4040),green:rg(0x7dffa8),greenDead:rg(0x2a3a30),amber:rg(0xffb060),red:rg(0xff4a3a),dark:rg(0x262a2a),rubble:rg(0x6e6458),rope:rg(0xa08a60)};
 /* the Tungangs' plate patches on the kept beams' tops, by hash */
 SEC.tracks.forEach(T=>{const RUNS=LINE.trackRuns(T.id);RUNS.forEach((run)=>{const [z0,z1,state]=run,h=G.h,hw=G.w/2,sl=G.slot/2;
  if(state==='kept')for(let za=Math.ceil(z0/STEP)*STEP;za<z1-STEP;za+=STEP){const hp=KRAND.unit(KRAND.hash(SITE.world,Math.floor(za),Math.round(T.x*10)));
   if(hp<.35){const pz=za+5+hp*30,x=LINE.trackX(T.id,pz);B.box('metal',x-hw+.15,x-sl-.05,h,h+.02,pz,pz+1.6,C.plate);}}
});});
 /* the gallery's details over each span: the walkway's grating, posts and mid rail; the cyan strips on the barrier and the walkway's edge */
 (LINE.gallerySpans||[]).forEach(([s0,s1])=>{for(let z=s0;z<s1;z+=STEP){const za=z,zb=Math.min(s1,z+STEP),[b0,b1]=SEC.road.barrier,bh=SEC.road.y+SEC.road.barrierH;
  B.quad('glow',[b0+.04,bh+.004,za],[b0+.04,bh+.004,zb],[b1-.04,bh+.004,zb],[b1-.04,bh+.004,za],cyanAt(za));
  B.quad('grate',[SEC.walk.x0,SEC.walk.y+.004,za],[SEC.walk.x0,SEC.walk.y+.004,zb],[SEC.walk.x1,SEC.walk.y+.004,zb],[SEC.walk.x1,SEC.walk.y+.004,za],C.walk);
  B.quad('glow',[SEC.walk.x0-.004,SEC.walk.y-.12,za],[SEC.walk.x0-.004,SEC.walk.y-.12,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,za],cyanAt(za));
  for(let p=za;p<zb-1e-6;p+=2.5)B.box('metal',SEC.walk.x0+.03,SEC.walk.x0+.07,SEC.walk.y,SEC.walk.y+1.0,p,p+.06,C.rail);
  B.box('metal',SEC.walk.x0+.03,SEC.walk.x0+.07,SEC.walk.y+.5,SEC.walk.y+.54,za,zb,C.rail);}});
 /* THE CROSSOVERS' switch machines at each end (the beam is the kind's) */
 (LINE.crossovers||[]).forEach(X=>{const a=LINE.trackX(X.a,X.z0),b=LINE.trackX(X.b,X.z1);
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
 const g=B.finish("the way's details",{label:{grate:'The walkway (grating over the cable trough)',metal:"Steel: the walkway's posts and mid rail, the switch machines, the lamps' posts, the Fixers' patches",
  glow:'The lamp code: green the Line, white hooded danger, amber work; the cyan strips',paint:'Paint: the rope',rubble:"Spoil from the vein's working"}});
 g.userData.way=true;scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=LINE.lamps.flatMap(l=>[l.x,l.y,l.z]);
 return {group:g,tris:B.tris};})();
