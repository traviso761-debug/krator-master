// prefix: gz
// ================================================================= THE GLAZIERS' SET: THE WORKS AND THE WAYS (PLAN.md 1.4, 3.4)
// They follow the potch lines into the dark by hand and lamp, wet-drilling with tarn water against the prism-lung of dry silica
// dust, in wax-cloth masks; they slice the potch into moonglass in the glass shop; they grow pale fungi and alecap in the old
// adits and the opal water-lotus on the tarn's edge. Work is lit amber (the code), the surface's edge white and hooded.
//   gz-glass-shop     the moonglass workshop: the slicing saws and polishing wheels, the lens lathe, the racks of panes
//   gz-adit           an adit's mouth: a plate-framed portal, the Register's plaque, a spoil heap of potch, the wet-drilling flume
//   gz-vein-gallery   the working: a narrow gallery following a potch line in, the face lit, the floor wet
//   gz-dark-adit      an old adit turned to dark beds (pale fungi, alecap), a glow-cap lamp at its curtain
//   gz-lotus-pond     terraced basins on the tarn's edge for the opal water-lotus, a sluice from the rock
//   gz-stair          the switchback stairs and ledges up the scarp: a masonry flight, timber flights on iron brackets, railed
/* the glass bench (glazier_common_glass_bench, job 'glazier'): a slicing saw (a disc on its arbor and treadle), a polishing wheel,
   a water tray, a block of potch half sliced, panes stacked */
function gzGlassBench(x,z,ry,C){W(x,0,z,(ry==null?0:ry),()=>{const tc=gzCol('timber',C),ic=P('iron');box('carved',0,.85,0,1.8,.06,.8,tc);for(const sx of [-1,1])for(const sz of [-1,1])box('carved',sx*.82,0,sz*.33,.08,.85,.08,tc);
 box('carved',0,.25,0,1.6,.05,.65,tc);WX(-.45,1.08,0,0,0,PI/2,()=>cyl('iron',0,-.01,0,.24,.02,ic,16));box('iron',-.45,.91,0,.5,.1,.1,ic);
 WX(.4,1.0,0,0,0,PI/2,()=>cyl('hewn',0,-.04,0,.16,.08,gzCol('rhyo',C),12));box('carved',.1,.91,.25,.5,.05,.25,tc);
 if(!C.aband){box('plain',.1,.96,.25,.44,.01,.2,gzCol('tarn',C));box('potch',-.45,.91,-.25,.3,.18,.2,P('potch'));for(let i=0;i<4;i++)box('potch',.62,.91+i*.012,-.22,.3,.008,.24,P('potch'));}});fgNote('benches');}
/* a rack of finished panes standing in a carved frame, the milky light through them */
function gzPaneRack(x,z,ry,C){W(x,0,z,(ry==null?0:ry),()=>{const tc=gzCol('timber',C);box('carved',0,0,0,1.4,.12,.5,tc);for(const s of [-1,1])box('carved',s*.66,0,0,.06,1.3,.5,tc);box('carved',0,1.24,0,1.4,.06,.5,tc);
 const n=C.aband?2:9;for(let i=0;i<n;i++)box('potch',-.55+i*.14,.12,0,.012,1.05,.42,P('potch'),0,0,(i%3-1)*.03);});}
/* timber sets in a working (a cap on two posts), every ~2 m from z0 to z1 (along -z), w wide, h high */
function gzSets(x,z0,z1,w,h,C){const tc=gzCol('timber',C);for(let z=z0;z>z1;z-=2){for(const s of [-1,1])beam('carved',[x+s*(w/2-.08),0,z],[x+s*(w/2-.1),h,z],.07,tc);box('carved',x,h,z,w,.14,.16,tc);}}
/* a small mouth on the face: a carved timber frame with a trefoil head and a plaque beside it */
function gzMouth(x,w,h,C,num){const tc=gzCol('timber',C);for(const s of [-1,1])box('carved',x+s*(w/2+.08),0,.12,.16,h+.15,.24,tc);
 gzArch(x,h-.4,0,w,.4,.55,.24,3,'carved',tc);box('carved',x,h+.15,.12,w+.5,.16,.28,tc);if(num!=null)gzPlaque(num,x+w/2+.55,1.05,.06,0,C);}
/* ---------------------------------------------------------------- the glass shop */
TG.gz.PLANS['gz-glass-shop']=function(o){const k='gz-glass-shop',v=o.v,f=gzU(k,v,1)<.5?-1:1,R=gzRoom('shop',-1.2*f,-3.3,5.4,4.6,0,{finish:'hewn',use:'workshop',h:2.6,rise:.5,doors:[{side:'s',at:1.2*f,w:1.2},{side:f>0?'e':'w',at:0,w:.8}]});
 const S=gzRoom('store',3.3*f,-3.3,2.2,2.8,0,{finish:'hewn',use:'store',h:2.2,rise:.3,doors:[{side:f>0?'w':'e',at:0,w:.8}]});
 return {voids:[gzPass('door',0,-1.15,.4,1.2,0),R,gzPass('r-s',-3.3,-1.2*f+f*2.65,3.3*f-f*1.05,.8,0,{ax:'x'}),S],f,R,S};};
defBuilding({key:'gz-glass-shop',name:'The moonglass workshop',seed:9421,cut:true,w:10.4,d:12,h:5.8,front:{x:0,z:3.4},budget:20000,
 tags:{culture:'glazier',types:['industry','shop'],wealth:'middle',style:'carved',role:'works',job:'lampmaking'},note:TG.gz.BOX['gz-glass-shop'].what,
 build(o){const C=gzCx(o),k='gz-glass-shop',PL=TG.gz.plan(k,o),f=PL.f,R=PL.R,S=PL.S;
  /* the shop front: three wide moonglass windows (the wares in them), the door with the work's amber lamp, a carved awning */
  gzTier({y:0,h:3.8,w:9.6,out:2.9,floor:true,ops:[{t:'door',x:0,w:1.2,top:2.1,lamp:'amber'},{t:'win',x:-3.2,w:1.5,sill:.8,top:2.6,lobes:5},{t:'win',x:3.2,w:1.5,sill:.8,top:2.6,lobes:5}]},C);
  W(0,2.95,gzFaceZ(2.9,2.95,0,.07),0,()=>{const tc=gzCol('timber',C);box('carved',0,0,.45,9.2,.08,.95,tc);for(const x of [-4.4,-2,2,4.4])beam('carved',[x,-.75,0],[x,0,.85],.05,tc);});
  /* the counter inside the windows: panes and lenses set out */
  for(const s of [-1,1]){box('carved',s*3.2,0,1.9,2.2,.85,.6,gzCol('timber',C));if(!C.aband)for(let i=0;i<4;i++)box('potch',s*3.2-.75+i*.5,.85,1.9,.3,.38,.012,P('potch'),0,-.25);}
  gzRooms(PL,C);
  /* the workshop: two glass benches, the lens lathe, the racks of panes, the crate of potch blocks, plate frames, the wet trough */
  gzGlassBench(R.x-1.3,R.z-R.d/2+.6,0,C);gzGlassBench(R.x+1.4,R.z-R.d/2+.6,0,C);
  W(R.x-f*(R.w/2-.55),0,R.z+.4,f>0?PI/2:-PI/2,()=>{const tc=gzCol('timber',C);box('carved',0,0,0,1.6,.85,.6,tc);beam('iron',[-.6,.95,0],[.4,.95,0],.03,P('iron'));box('iron',-.65,.85,0,.15,.22,.18,P('iron'));
   if(!C.aband)ellip('potch',.15,.95,0,.06,.06,.02,hc(0xe8f4f8),0,10);});fgNote('lathe');
  gzPaneRack(R.x+f*(R.w/2-.4),R.z+.5,f>0?-PI/2:PI/2,C);gzPaneRack(R.x,R.z+1.6,PI,C);
  W(R.x-1.4,0,R.z+1.2,0,()=>{box('carved',0,0,0,.8,.45,.6,gzCol('timber',C));if(!C.aband)for(let i=0;i<5;i++)box('potch',-.25+(i%3)*.25,.45,(i>2?.12:-.12),.22,.14,.18,P('potch'));});
  box('hewn',R.x+.2,0,R.z+.9,1.2,.5,.5,gzCol('rock',C));if(!C.aband)box('plain',R.x+.2,.45,R.z+.9,1.05,.02,.38,gzCol('tarn',C));
  for(let i=0;i<3;i++)box('plate',S.x,.05+i*.04,S.z-.6,1.2,.035,.8,gzCol('wash',C),0,0,i*.02);gzFurn('generic_crate',S.x,null,S.z+.6,0,{v:0},C);
  gzLight('amber',R.x,2.2,R.z-R.d/2+.15,C);gzLantern(R.x+1.4,1.9,R.z-.3,C,{hang:R.h+.5-1.9});gzMaskRack(R.x-.2,R.z-R.d/2+.08,0,C);}});
/* ---------------------------------------------------------------- the adit's mouth */
TG.gz.PLANS['gz-adit']=function(o){const k='gz-adit',v=o.v,x=(gzU(k,v,1)-.5)*1.2;
 return {voids:[gzRoom('adit',x,-4.3,1.8,9.4,0,{finish:'hewn',use:'adit',h:2.05,ceil:'vault',rise:.3,doors:[{side:'s',at:0,w:1.8}],noFloor:true,join:true}),
  gzRoom('face',x+.4,-10.3,3,2.8,0,{finish:'hewn',use:'face',h:2.1,ceil:'vault',rise:.4,noFloor:true,join:true})],x,num:10+Math.floor(gzU(k,v,2)*40)};};
defBuilding({key:'gz-adit',name:'An adit\'s mouth (the Register\'s plaque, the potch heap, the flume)',seed:9422,cut:true,w:8.6,d:18,h:5,front:{x:0,z:0},budget:12000,
 tags:{culture:'glazier',types:['industry'],style:'salvage',role:'works',job:'mining'},note:TG.gz.BOX['gz-adit'].what,
 build(o){const C=gzCx(o),k='gz-adit',PL=TG.gz.plan(k,o),x=PL.x,pc=gzCol('wash',C),tc=gzCol('timber',C);
  /* the plate-framed portal: Ancient white plate faced on two posts and a lintel, riveted; the plaque; the amber lamp, the white
     hooded lamp over it (the surface's danger: the edge, the dust) */
  for(const s of [-1,1]){box('plate',x+s*1.08,0,.1,.36,2.5,.3,gzCol('wash',C));for(let r=0;r<4;r++)cyl('iron',x+s*1.08,.4+r*.55,.27,.025,.02,P('iron'),6);}box('plate',x,2.5,.1,2.6,.38,.32,pc);
  gzPlaque(PL.num,x+1.62,1.25,.04,0,C,{w:.42,h:.6});fgSet('plaque',PL.num);gzLamp('amber',x-1.5,2.1,.3,C,{wall:true});gzLamp('white',x,2.95,.35,C,{wall:true});
  /* the floor of the working, wet; timber sets every 2 m */
  box('hewn',x,0,-4.5,1.7,.05,9,gzCol('rock',C));if(!C.aband)box('plain',x+.3,.055,-4.5,.6,.006,9,gzCol('tarn',C));box('hewn',x+.4,0,-10.3,2.9,.05,2.7,gzCol('rock',C));
  gzSets(x,-.8,-9,1.75,1.95,C);
  /* the flume: a carved timber trough on trestles from the tarn side (east) along the face into the portal, then along the floor */
  const fl=[[4,1.15,5.4],[2.6,1,3.2],[x+.65,.75,.6],[x+.65,.1,-.8]];
  for(let i=0;i<fl.length-1;i++){const a=fl[i],b=fl[i+1];W(0,0,0,0,()=>{beam('carved',[a[0],a[1],a[2]],[b[0],b[1],b[2]],.12,tc,false);if(!C.aband)beam('plain',[a[0],a[1]+.05,a[2]],[b[0],b[1]+.05,b[2]],.06,gzCol('tarn',C),false);});}
  for(const p of fl.slice(0,3))for(const s of [-1,1])beam('carved',[p[0]+s*.25,0,p[2]],[p[0],p[1]-.05,p[2]],.04,tc);
  if(!C.aband)box('plain',x+.65,.06,-5,.18,.04,8.4,gzCol('tarn',C));
  /* the spoil heap of potch below the portal (west): a mound of milky fragments; a stack of cut slabs; a bucket */
  const sx=-2.9;ellip('potch',sx,0,3.2,1.6,.7,2,P('potch'),.3,10);for(let i=0;i<14;i++){const a=i*2.4,r=1+(i%4)*.35;ellip('potch',sx+Math.cos(a)*r,.12,3.2+Math.sin(a)*r*1.1,.13,.07,.1,hc(SVPAL.potch[i%3]),a,5);}
  for(let i=0;i<5;i++)box('potch',-1.6,i*.06,1.2,.5,.05,.35,P('potch'),i*.2);
  cyl('carved',x+.2,0,-1.4,.18,.3,tc,10);gzMaskRack(x-.62,-2.2,PI/2,C);
  /* the face, lit: amber and wax; a wet-drill (a long steel and a mallet) leaning on it */
  gzLight('amber',x+.4,1.7,-11.4,C);gzLight('wax',x-.3,1.2,-8,C);beam('iron',[x+1.2,0,-11.2],[x+1.45,1.4,-11.55],.02,P('iron'));
  if(C.worn)fgRubble(x,.6,4,{gl:()=>0,worn:true,v:C.v});}});
/* ---------------------------------------------------------------- the vein gallery */
TG.gz.PLANS['gz-vein-gallery']=function(o){const k='gz-vein-gallery',v=o.v,s=gzU(k,v,1)<.5?-1:1,x1=s*(2.4+.8*gzU(k,v,2)),zt=-4.6-.8*gzU(k,v,3);
 const A=gzRoom('in',0,(.4+zt)/2-.3,1.3,-zt+.4+.6,0,{finish:'hewn',use:'gallery',h:1.95,ceil:'vault',rise:.25,noFloor:true,join:true});
 const B=gzRoom('turn',x1/2,zt-.3,Math.abs(x1)+1.3,1.3,0,{finish:'hewn',use:'gallery',h:1.95,ceil:'vault',rise:.25,noFloor:true,join:true});
 const Cc=gzRoom('on',x1,(zt-12.6)/2,1.3,12.6-(-zt)+.6,0,{finish:'hewn',use:'gallery',h:1.95,ceil:'vault',rise:.25,noFloor:true,join:true});
 const F=gzRoom('face',x1-s*.3,-13.9,2.6,2.2,0,{finish:'hewn',use:'face',h:2,ceil:'vault',rise:.35,noFloor:true,join:true});
 return {voids:[A,B,Cc,F],s,x1,zt,segs:[[0,.4,0,zt],[0,zt,x1,zt],[x1,zt,x1,-13]],num:50+Math.floor(gzU(k,v,4)*40)};};
defBuilding({key:'gz-vein-gallery',name:'A vein gallery (the working on a potch line)',seed:9423,cut:true,w:8,d:17,h:3.6,front:{x:0,z:1},budget:12000,
 tags:{culture:'glazier',types:['industry'],style:'carved',role:'works',job:'mining'},note:TG.gz.BOX['gz-vein-gallery'].what,
 build(o){const C=gzCx(o),k='gz-vein-gallery',PL=TG.gz.plan(k,o);
  gzMouth(0,1.2,1.95,C,PL.num);fgSet('plaque',PL.num);box('wash',0,-.05,.5,3.4,.1,1,gzCol('washOld',C));gzLamp('amber',-.95,1.75,.3,C,{wall:true});
  /* each straight stretch: the wet floor, the potch line along one wall (a pale band at the contact), lamps, sets at the turns */
  PL.segs.forEach(([ax,az,bx,bz],i)=>{const L=Math.hypot(bx-ax,bz-az),mx=(ax+bx)/2,mz=(az+bz)/2,ry=Math.atan2(bx-ax,bz-az);
   W(mx,0,mz,ry,()=>{box('hewn',0,0,0,1.2,.05,L+1.1,gzCol('rock',C));if(!C.aband)box('plain',.15,.052,0,.5,.006,L+.9,gzCol('tarn',C));
    const yv=1.05+.25*Math.sin(i*1.7+C.v);box('potch',.6,yv,0,.06,.12,L+1,P('potch'));box('potch',.6,yv+.16,0,.05,.04,L*.7,hc(0xe8eef0));});fgNote('veinRuns');});
  const F=PL.byId.face;W(F.x,0,F.z,0,()=>{box('hewn',0,0,0,2.5,.05,2.1,gzCol('rock',C));box('potch',0,.5,-1.02,2.2,1.2,.08,P('potch'));for(let i=0;i<7;i++)ellip('potch',-.8+i*.27,.9+((i*3)%4)*.18,-.98,.06,.05,.03,hc(SVPAL.opal[i%4]),i,6);
   beam('iron',[.7,0,-.6],[.85,1.3,-.95],.02,P('iron'));cyl('carved',-.8,0,.4,.18,.3,gzCol('timber',C),10);});
  gzLight('amber',F.x,1.65,F.z-.85,C,{big:true});gzLight('wax',PL.x1,1.5,PL.zt-.1,C);gzMaskRack(.62,-1.6,-PI/2,C);
  gzSets(0,-.6,PL.zt+.6,1.25,1.9,C);}});
/* ---------------------------------------------------------------- the dark adit */
TG.gz.PLANS['gz-dark-adit']=function(o){const k='gz-dark-adit',v=o.v,x=(gzU(k,v,1)-.5)*1.4;
 return {voids:[gzRoom('adit',x,-4.1,1.8,9,0,{finish:'hewn',use:'adit',h:2,ceil:'vault',rise:.3,noFloor:true,join:true}),gzRoom('beds',x,-10.6,4.4,4.6,0,{finish:'hewn',use:'beds',h:2.2,ceil:'vault',rise:.45,doors:[{side:'s',at:0,w:1.8}],join:true})],x};};
defBuilding({key:'gz-dark-adit',name:'An old adit turned to dark beds',seed:9424,cut:true,w:7,d:15,h:3.4,front:{x:0,z:1},budget:12000,
 tags:{culture:'glazier',types:['farm'],wealth:'poor',style:'carved',role:'works',job:'fungiculture'},note:TG.gz.BOX['gz-dark-adit'].what,
 build(o){const C=gzCx(o),k='gz-dark-adit',PL=TG.gz.plan(k,o),x=PL.x,B=PL.byId.beds;
  /* the old mouth: its frame, a wax-cloth curtain to keep the dark in, the glow-cap lamp (the code: the poor) */
  gzMouth(x,1.5,1.95,C,null);W(x,0,.08,0,()=>{const cc=gzCol('timber',C).clone().multiplyScalar(.7);for(let i=0;i<4;i++)box('silk',-.56+i*.375,C.aband?.6:0,0,.36,C.aband?1.3:1.92,.03,cc);});
  gzLamp('glow',x+1.05,1.6,.3,C,{wall:true});
  box('hewn',x,0,-4.1,1.7,.05,8.6,gzCol('rock',C));
  /* the beds: three kerbed beds of dark compost, pale fungi and alecap in clusters; the spawn trays; the water channel */
  const beds=[[-1.2,-1.1],[1.2,-1.1],[-1.2,1]];beds.forEach(([bx,bz],i)=>{W(B.x+bx,0,B.z+bz,0,()=>{const kc=gzCol('rock',C);for(const s of [-1,1]){box('hewn',0,0,s*.75,1.8,.3,.12,kc);box('hewn',s*.95,0,0,.12,.3,1.6,kc);}
    box('plain',0,0,0,1.8,.24,1.4,gzCol('dark',C));if(C.aband&&i)return;
    for(let j=0;j<11;j++){const px=-.7+((j*37)%9)*.17,pz=-.5+((j*53)%7)*.16,al=(j+i)%3===0,cc=gzCol(al?'alecapC':'fungus',C),h=.08+((j*13)%4)*.03;
     cyl('plain',px,.24,pz,.015,h,cc,5);ellip('plain',px,.24+h,pz,al?.05:.06,.025,al?.05:.06,cc,0,6);}});fgNote('beds');});
  gzFurn('tungang_common_fungus_trays',B.x+1.4,null,B.z+1.25,PI,{v:0},C);gzFurn('generic_mushrooms',B.x+.2,null,B.z+1.6,0,{v:0},C);
  box('hewn',B.x+B.w/2-.25,0,B.z,.3,.12,B.d-.4,gzCol('rock',C));if(!C.aband)box('plain',B.x+B.w/2-.25,.1,B.z,.2,.015,B.d-.5,gzCol('tarn',C));
  gzLight('glow',B.x,1.9,B.z-B.d/2+.2,C);gzSets(x,-1,-7.5,1.75,1.95,C);}});
/* ---------------------------------------------------------------- the lotus pond */
TG.gz.PLANS['gz-lotus-pond']=function(o){return {voids:[gzRoom('spout',(gzU('gz-lotus-pond',o.v,1)-.5)*4,-.35,.5,1.4,1.2,{h:.4,ceil:'flat',rise:0,noFloor:true})]};};
defBuilding({key:'gz-lotus-pond',name:'The lotus pond (terraces for the opal water-lotus)',seed:9425,w:12.4,d:10.8,h:1.8,front:{x:0,z:9.6},budget:12000,
 tags:{culture:'glazier',types:['farm'],style:'built',role:'works',job:'farming'},note:TG.gz.BOX['gz-lotus-pond'].what,
 build(o){const C=gzCx(o),k='gz-lotus-pond',PL=TG.gz.plan(k,o),sx=PL.voids[0].x,kc=gzCol('wash',C),n=3;
  /* three basins stepping down from the rock toward the tarn, each kerbed in whitewashed stone, its water a little under the kerb */
  for(let i=0;i<n;i++){const z0=.2+i*3.1,z1=z0+3,top=1.4-i*.4,wl=top-.14,w=11.6-i*.6;
   for(const s of [-1,1])box('wash',s*(w/2-.15),0,(z0+z1)/2,.3,top,z1-z0,kc);box('wash',0,0,z1-.15,w,top,.3,kc);if(i===0)box('wash',0,0,z0+.15,w,top,.3,kc);
   box('hewn',0,0,(z0+z1)/2,w-.6,wl-.4,z1-z0-.3,gzCol('rock',C));
   if(!(C.aband&&i))box('plain',0,wl-.42,(z0+z1)/2,w-.62,.4,z1-z0-.32,gzCol('tarn',C));
   /* the lotus: pads floating, flowers on stems (opal-pale petals) */
   if(!C.aband)for(let j=0;j<10;j++){const px=-w/2+.8+((j*41+i*7)%13)/13*(w-1.6),pz=z0+.5+((j*29+i*3)%7)/7*(z1-z0-1);ellip('plain',px,wl+.005,pz,.32,.012,.3,gzCol('pad',C),j,10);
    if(j%3===0){const fc=hc(SVPAL.lotus[j%3]).clone().lerp(hc(SVPAL.opal[(j+i)%4]),.25);cyl('plain',px+.1,wl,pz,.012,.25,gzCol('pad',C),4);
     for(let p=0;p<6;p++)W(px+.1,wl+.25,pz,p*TAU/6,()=>ellip('plain',0,.05,.06,.035,.09,.06,fc,0,5));ellip('plain',px+.1,wl+.3,pz,.04,.03,.04,P('saffron'),0,6);}}
   fgNote('basins');}
  /* the sluice from the rock: a carved spout at the face, a channel over the first kerb */
  box('hewn',sx,1.2,.05,.6,.3,.5,gzCol('rock',C));if(!C.aband)beam('plain',[sx,1.35,0],[sx,1.25,.6],.08,gzCol('tarn',C),false);
  /* a path of flags along the west side, a click wheel at its head */
  for(let i=0;i<6;i++)box('wash',-6,0,.8+i*1.5,.6,.08,.9,gzCol('washOld',C));gzClick(-6,0,.3,.18,.5,C,{chips:6});}});
/* ---------------------------------------------------------------- the stair up the scarp */
TG.gz.PLANS['gz-stair']=function(o){const n=gzU('gz-stair',o.v,1)<.5?2:3,V=[];
 /* the iron brackets of the timber flights go into the face: shallow pockets */
 for(let i=0;i<n;i++)V.push(gzRoom('pocket'+i,i===1?-.8:.8,-.15,.4,.5,3.4*i+1.2,{h:.4,ceil:'flat',rise:0,noFloor:true}));
 return {voids:V,n};};
defBuilding({key:'gz-stair',name:'The stair up the scarp (switchbacks and ledges)',seed:9426,w:7.6,d:3.8,h:11.6,front:{x:0,z:3.4},budget:12000,
 tags:{culture:'glazier',types:['infrastructure'],style:'carved',role:'way'},note:TG.gz.BOX['gz-stair'].what,
 build(o){const C=gzCx(o),PL=TG.gz.plan('gz-stair',o),n=PL.n,wc=gzCol('wash',C),tc=gzCol('timber',C),rs=3.4;
  /* flight one: solid masonry from the ground, along +x at z 2.7, a parapet on its outer side; landing one on a masonry pier */
  svStair(-3,2.7,0,rs,PI/2,{style:'solid',mk:'wash',col:gzCol('washOld',C),w:1.1,riser:.19,going:.27});
  box('wash',2.5,0,2,1.8,rs,2.8,wc);for(let i=0;i<5;i++){const x=-3+i*1.15;box('wash',x+.57,i*.85*.8,3.33,1.15,.9+.18,.16,wc);}box('wash',2.5,rs,3.33,1.8,.9,.16,wc);box('wash',3.33,rs,2,.16,.9,2.8,wc);
  gzLamp('white',3.3,rs+1.2,3.3,C);fgNote('flights');
  /* flight two: timber on iron brackets from the face, along -x at z 1.2, railed on its outer side; the ledge at the top */
  W(0,rs,0,0,()=>{svStair(1.6,1.2,0,rs,-PI/2,{mk:'carved',col:tc,w:1,riser:.19,going:.27,rail:'right'});for(const x of [1,-.8,-2.6])beam('iron',[x,-.05,-.1],[x,.2+(1.6-x)/4.6*rs-.2,1.6],.03,P('iron'));});fgNote('flights');
  box('wash',-3.4,2*rs-.45,1.5,1.2,.45,3.2,wc);for(const z of [.4,1.5,2.6])box('wash',-3.4,2*rs-1,z,.8,.55,.4,wc);box('wash',-3.4,2*rs,3.05,1.2,.9,.14,wc);gzLamp('white',-3.8,2*rs+1.2,3,C);
  /* flight three (on three-flight stairs): timber over flight one, on brackets and a carved post from landing one's pier */
  if(n===3){W(0,2*rs,0,0,()=>{svStair(-2.8,2.7,0,rs,PI/2,{mk:'carved',col:tc,w:1,riser:.19,going:.27,rail:'left'});});box('wash',2.5,3*rs-.4,2,1.8,.4,2.8,wc);beam('carved',[2.5,rs,2],[2.5,3*rs-.4,2],.12,tc);
   for(const x of [-2,0])beam('iron',[x,2*rs+(x+2.8)/4.6*rs-.25,2.15],[x,2*rs+(x+2.8)/4.6*rs-1.4,-.1],.03,P('iron'));gzLamp('white',3.3,3*rs+1,3.3,C);fgNote('flights');}
  /* a moonglass lantern at the foot, a click wheel on landing one */
  gzLantern(-3.5,1.4,3.3,C);gzClick(2.6,rs,1.2,.16,.45,C,{chips:6});}});
