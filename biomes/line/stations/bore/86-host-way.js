// ================================================================= HOST — the way: the guideways, the strip, the walkway, the road, the lamps
// PLAN.md section 3. Across the gallery from the west wall: the road's footway and cable trough, the access road (two lanes, a dashed line), its
// barrier, T4 and T3 (northbound), the central strip with its masts and the Tungangs' lamp posts, T2 and T1 (southbound), the walkway on the east
// wall with its handrail and trough; the invert between. Each guideway a concrete beam 2.8 m wide and 0.6 m high with its guide slot and the
// power strip in it; the kept beams patched here and there with plate. The crossover between T2 and T3 (the flexing beams' run, the strip cleared
// over it, the switch machines). The lamp code (green: the Line) on posts; the Ancients' crown fittings dead, their cyan strips dead along the
// walkway's edge and the barrier's top. The Fixers' vein working at its niche: an amber lamp, a heap of spoil, a rope.
const WAY=(function(){const W=LINE.WIN,G=SEC.guide,B=LB.B(100),rg=LB.rgb,z0=W.z0,z1=W.z1,STEP=50;
 const C={guide:rg(0x9c9a92),guideTop:rg(0x8a8984),slot:rg(0x2a2826),power:rg(0x5a5c5e),conc:rg(0x8e8a82),invert:rg(0x6e6a64),strip:rg(0x84807a),
  road:rg(0x4a4846),line:rg(0xcfc7a8),barrier:rg(0x9a978e),walk:rg(0x6a6c68),rail:rg(0x5c5e5a),post:rg(0x3a3e3c),plate:rg(0x6e4a32),plateG:rg(0x3f5a43),
  cyanDead:rg(0x24474a),crown:rg(0x3a4040),green:rg(0x7dffa8),amber:rg(0xffb060),red:rg(0xff4a3a),dark:rg(0x262a2a),rubble:rg(0x6e6458),rope:rg(0xa08a60)};
 const xo=LINE.crossover,inXO=(a,b)=>b>xo.z0-10&&a<xo.z1+10;
 /* the invert between the works, at y 0 */
 const iv=[SEC.road.barrier[1]].concat(SEC.tracks.slice().reverse().map(T=>[T.x-G.w/2,T.x+G.w/2]).flat(),[SEC.walk.x0]);
 iv.splice(iv.indexOf(SEC.tracks[2].x+G.w/2)+1,0,SEC.strip.x0,SEC.strip.x1);
 for(let z=z0;z<z1;z+=STEP){const za=z,zb=Math.min(z1,z+STEP);
  for(let i=0;i+1<iv.length;i+=2)B.quad('conc',[iv[i],0,za],[iv[i],0,zb],[iv[i+1],0,zb],[iv[i+1],0,za],C.invert);
  /* the guideways: the beam's sides, its top either side of the slot, the slot's walls and the power strip at its bottom */
  SEC.tracks.forEach(T=>{const xa=T.x-G.w/2,xb=T.x+G.w/2,s0=T.x-G.slot/2,s1=T.x+G.slot/2,h=G.h;
   B.quad('guide',[xa,0,za],[xa,0,zb],[xa,h,zb],[xa,h,za],C.guide);B.quad('guide',[xb,0,zb],[xb,0,za],[xb,h,za],[xb,h,zb],C.guide);
   B.quad('guide',[xa,h,za],[xa,h,zb],[s0,h,zb],[s0,h,za],C.guideTop);B.quad('guide',[s1,h,za],[s1,h,zb],[xb,h,zb],[xb,h,za],C.guideTop);
   B.quad('metal',[s0,h,za],[s0,h,zb],[s0,h-.35,zb],[s0,h-.35,za],C.slot);B.quad('metal',[s1,h-.35,za],[s1,h-.35,zb],[s1,h,zb],[s1,h,za],C.slot);
   B.quad('metal',[s0,h-.35,za],[s0,h-.35,zb],[s1,h-.35,zb],[s1,h-.35,za],C.power);
   /* the Tungangs' patches: a plate bolted over a cracked stretch of the beam's top, by hash */
   const hp=KRAND.unit(KRAND.hash(SITE.world,Math.floor(za),T.x*10|0));if(hp<.35){const pz=za+5+hp*30;B.box('metal',xa+.15,s0-.05,h,h+.02,pz,pz+1.6,C.plate);}});
  /* the central strip, cleared over the crossover */
  if(!inXO(za,zb))B.box('conc',SEC.strip.x0,SEC.strip.x1,0,SEC.strip.y,za,zb,C.strip);
  /* the road: the asphalt, its dashed line, the barrier (a Jersey profile), the footway and its kerb */
  B.quad('road',[SEC.road.x0,SEC.road.y,za],[SEC.road.x0,SEC.road.y,zb],[SEC.road.x1,SEC.road.y,zb],[SEC.road.x1,SEC.road.y,za],C.road);
  for(let d=za;d<zb;d+=9)B.quad('paint',[SEC.road.lane-.07,SEC.road.y+.005,d],[SEC.road.lane-.07,SEC.road.y+.005,d+3],[SEC.road.lane+.07,SEC.road.y+.005,d+3],[SEC.road.lane+.07,SEC.road.y+.005,d],C.line);
  const [b0,b1]=SEC.road.barrier,bh=SEC.road.y+SEC.road.barrierH,by=SEC.road.y;
  B.quad('conc',[b0,by,za],[b0,by,zb],[b0+.12,bh,zb],[b0+.12,bh,za],C.barrier);B.quad('conc',[b1,by,zb],[b1,by,za],[b1-.12,bh,za],[b1-.12,bh,zb],C.barrier);
  B.quad('conc',[b0+.12,bh,za],[b0+.12,bh,zb],[b1-.12,bh,zb],[b1-.12,bh,za],C.barrier);
  B.quad('glow',[b0+.14,bh+.004,za],[b0+.14,bh+.004,zb],[b1-.14,bh+.004,zb],[b1-.14,bh+.004,za],C.cyanDead);
  B.quad('road',[SEC.road.x0,0,za],[SEC.road.x0,0,zb],[SEC.road.x0,SEC.road.y,zb],[SEC.road.x0,SEC.road.y,za],C.conc);
  B.box('conc',SEC.road.foot[0],SEC.road.foot[1],0,SEC.road.footY,za,zb,C.conc);
  /* the walkway: its deck (grating), its front face, the cable trough's lid along the front, the handrail, the dead cyan strip on its edge */
  B.box('conc',SEC.walk.x0,SEC.walk.x1,0,SEC.walk.y-.05,za,zb,C.conc,true);
  B.quad('grate',[SEC.walk.x0,SEC.walk.y,za],[SEC.walk.x0,SEC.walk.y,zb],[SEC.walk.x1,SEC.walk.y,zb],[SEC.walk.x1,SEC.walk.y,za],C.walk);
  B.quad('glow',[SEC.walk.x0-.004,SEC.walk.y-.12,za],[SEC.walk.x0-.004,SEC.walk.y-.12,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,zb],[SEC.walk.x0-.004,SEC.walk.y-.07,za],C.cyanDead);
  for(let p=za;p<zb-1e-6;p+=2.5)B.box('metal',SEC.walk.x0+.08,SEC.walk.x0+.14,SEC.walk.y,SEC.walk.y+1.05,p,p+.06,C.rail);
  B.box('metal',SEC.walk.x0+.06,SEC.walk.x0+.16,SEC.walk.y+1.0,SEC.walk.y+1.06,za,zb,C.rail);
  B.box('metal',SEC.walk.x0+.08,SEC.walk.x0+.14,SEC.walk.y+.5,SEC.walk.y+.54,za,zb,C.rail);}
 /* THE CROSSOVER: the diagonal beam from T2 to T3 (its run), the switch machines at each end, the pits' plates */
 {const a=SEC.tracks.find(t=>t.id===xo.a).x,b=SEC.tracks.find(t=>t.id===xo.b).x,h=G.h,hw=G.w/2,n=12;
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,za=xo.z0+(xo.z1-xo.z0)*t0,zb=xo.z0+(xo.z1-xo.z0)*t1,
   ease=t=>t<.5?2*t*t:1-2*(1-t)*(1-t),xa=a+(b-a)*ease(t0),xb=a+(b-a)*ease(t1);
   B.quad('guide',[xa-hw,h,za],[xb-hw,h,zb],[xb+hw,h,zb],[xa+hw,h,za],C.guideTop);
   B.quad('guide',[xa-hw,0,za],[xb-hw,0,zb],[xb-hw,h,zb],[xa-hw,h,za],C.guide);B.quad('guide',[xa+hw,0,za],[xb+hw,0,zb],[xb+hw,h,zb],[xa+hw,h,za],C.guide);
   B.quad('metal',[xa-.15,h+.004,za],[xb-.15,h+.004,zb],[xb+.15,h+.004,zb],[xa+.15,h+.004,za],C.slot);}
  for(const [x,z] of [[a+(a>b?-1:1)*2.2,xo.z0+4],[b+(b>a?-1:1)*2.2,xo.z1-4]])B.box('metal',x-.4,x+.4,0,.7,z-.6,z+.6,C.plateG);}
 /* THE LAMPS: the posts and their heads (the code's green), the strip's masts with a signal aspect; the crown's dead fittings */
 const glows=[];
 LINE.lamps.forEach(l=>{const strip=l.x===0,base=strip?SEC.strip.y:l.x>0?SEC.walk.y:SEC.road.footY;
  B.box('metal',l.x-.06,l.x+.06,base,l.y-.1,l.z-.06,l.z+.06,C.post);
  B.box('metal',l.x-.14,l.x+.14,l.y-.16,l.y+.1,l.z-.14,l.z+.14,C.dark);
  B.box('glow',l.x-.09,l.x+.09,l.y-.12,l.y+.06,l.z-.15,l.z+.15,C.green);
  if(strip){B.box('metal',l.x+.3,l.x+.62,l.y-1.6,l.y-.9,l.z-.12,l.z+.12,C.dark);B.box('glow',l.x+.4,l.x+.52,l.y-1.2,l.y-1.08,l.z-.13,l.z+.13,C.red);}
  glows.push(l);});
 LINE.crown.forEach(c=>B.box('metal',c.x-.6,c.x+.6,c.y,c.y+.18,c.z-.15,c.z+.15,C.crown));
 /* THE VEIN'S WORKING at its niche: the amber lamp on its stand, spoil heaped on the walkway beside the niche, a coil of rope */
 {const V=LINE.vein,x=SEC.walk.x0+1.4,z=V.z;
  B.box('metal',x-.05,x+.05,SEC.walk.y,SEC.walk.y+1.7,z-1.6,z-1.5,C.post);B.box('glow',x-.12,x+.12,SEC.walk.y+1.62,SEC.walk.y+1.82,z-1.67,z-1.43,C.amber);
  const sp=[[.4,2.2,.55],[.9,3.1,.4],[.2,3.6,.35],[.7,1.5,.3]];sp.forEach((s,i)=>{const cx=SEC.walk.x0+.6+s[0],cz=z+s[1];B.box('rubble',cx-s[2],cx+s[2],SEC.walk.y,SEC.walk.y+s[2]*.9,cz-s[2]*1.2,cz+s[2]*1.2,C.rubble);});
  B.box('paint',SEC.walk.x0+1.6,SEC.walk.x0+2.0,SEC.walk.y,SEC.walk.y+.12,z+.8,z+1.2,C.rope);}
 const g=B.finish('the way',{label:{guide:'A guideway: a concrete beam 2.8 m wide, 0.6 m high, its guide slot and power strip (kept)',conc:'The invert, the central strip, the footway and the barrier (concrete)',
  road:'The access road (two lanes for the Ancients\' service vehicles)',grate:'The walkway (grating over the cable trough)',metal:'Steel: the handrail, the posts, the slot\'s lips, the Fixers\' patches',
  glow:'The lamp code: green, the Line (a kept track); the cyan strips dead',paint:'Paint: the road\'s line',rubble:'Spoil from the vein\'s working'}});
 g.userData.way=true;scene.add(g);
 /* the probe's points: one a lamp (its head), so the merged way's pieces count where they stand (core/host's regOccupancy) */
 if(g.children[0])g.children[0].userData.probePoints=LINE.lamps.flatMap(l=>[l.x,l.y,l.z]);
 return {group:g,tris:B.tris,glows:glows.length};})();
