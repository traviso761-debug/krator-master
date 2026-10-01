// ================================================================= YUNI VARIANTS (3 of 5): the roofed terrace stack
// Apartments A (the midrise terrace stack in 82-apartments.js: eight lobed
// trays, each shifted and shrunk, on a hyperboloid stem) as Yuni patched it:
// every tray's terrace gets a parapet, a coping and a soffit, the gap up to the
// next tray is closed, and the top tray is capped by a fluted lobed roof, so
// the stack reads as roofed storeys rather than eight open floor plates.
// Upgrades over Yuni's: Yuni kept the kit's ruin (tray 6 simply gone, tray 7
// left hanging over the hole); here every tray stands and the ruin is in the
// roof instead: the lid has caved in on the side facing the row camera, its
// slab bitten out, a shell of it lying on the terrace below, and the top tray
// opened up under it. Dead windows keep teeth of glass (civWin); the rooms
// behind the holes are furnished (domRoom); one draw call per material.
function buildYvTerrace(scene,gx,gz,d){reseed(9975+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Apartments — terrace stack, roofed ('+STATE(d)+')',x:0,z:0,r:40,h:58});
 mesh(lathe({rFn:y=>7*Math.sqrt(1+1.5*Math.pow((y-20)/20,2)),H:40,nu:32,nv:12}),skin,G);
 const RS=Math.PI/2,NS=8;                   // RS: the bearing the roof caved in on (+z, toward the row camera)
 const cave=(th,yy)=>d>0&&civDA(th,RS)<.95-.06*yy+.35*(fbm(th*5,yy*.2,9976,2)-.5);   // yy: height up the lid
 const aSkin=[],aDark=[];
 const SLC=new THREE.Color(d>0?0x4a4038:0xcfcac2);
 for(let s=0;s<NS;s++){const y=6+s*5.4,ox=Math.sin(s*1.3)*5,oz=Math.cos(s*.9)*5,R=24-s*1.6,top=s===NS-1;
  const lobe=th=>R*(1+.28*(.5+.5*Math.cos(6*th)));
  const h0=holeFn(d*.7,760+s,null,2.5);
  // the top tray is opened up where the roof came down on it
  const hole=h0||top&&d>0?(u,yy)=>(h0?h0(u,yy):false)||top&&d>0&&yy>1.2&&civDA(u*TAU,RS)<.42+.2*(fbm(u*9,yy*.3,9977,2)-.5):null;
  kput('slab',[ox,y,oz],null,[R*.99,.35,R*.99],SLC);
  if(!top||d===0)kput('slab',[ox,y+4.6,oz],null,[R*.99,.35,R*.99],SLC);
  aSkin.push(lathe({rFn:()=>R,H:4.6,flutes:6,amp:.28,sharp:1,nu:72,nv:3,hole}).translate(ox,y,oz));
  if(d>0)aDark.push(lathe({rFn:()=>R*.9,H:4.6,nu:24,nv:1,hole:top?(u,yy)=>civDA(u*TAU,RS)<.36:null}).translate(ox,y,oz));
  // the terrace deck, then Yuni's parapet, coping and soffit round its lobed edge
  aSkin.push(gridSurface((u,v)=>{const th=u*TAU;const r=lobe(th)*(1+v*.1);return[ox+r*Math.cos(th),y+4.6+.4*v,oz+r*Math.sin(th)];},72,1,{}));
  aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)*1.1;return[ox+r*Math.cos(th),y+5.0+v*1.15,oz+r*Math.sin(th)];},72,2,{uS:14,vS:.4}));       // parapet
  aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)*1.1-v*.45;return[ox+r*Math.cos(th),y+6.15,oz+r*Math.sin(th)];},72,1,{}));                  // coping
  aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.98,lobe(th)*1.1,v);return[ox+r*Math.cos(th),y+4.5-.25*v,oz+r*Math.sin(th)];},72,1,{}));    // soffit under the deck
  if(!top)aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.99,(R-1.6)*.99,v);const ox2=lerp(ox,Math.sin((s+1)*1.3)*5,v),oz2=lerp(oz,Math.cos((s+1)*.9)*5,v);
   return[ox2+r*Math.cos(th),y+4.95+v*.45,oz2+r*Math.sin(th)];},72,1,{}));                                                                             // closes the gap up to the next tray
  for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;const r=lobe(th)+.1;if(hole&&hole(k/18,2.3))continue;civWin(d>0?'winSmD':'winSmI',[ox+r*Math.cos(th),y+2.3,oz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2,1.7,1],null);}
  if(hole)for(let k=0;k<36;k++){const th=(k+.5)/36*TAU;if(!hole((k+.5)/36,2.3))continue;const r=lobe(th);
   domRoom([ox+r*.97*Math.cos(th),y+.2,oz+r*.97*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],r*.97-R*.9,4.2,d,760+s);}
  if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);
  // planting along the parapet (whole) or gone wild over it (ruin)
  for(let k=0;k<12;k++){const th=(k+.5)/12*TAU,r=lobe(th)*1.04,hh=h3(s,k,9978);if(hh>.5)continue;
   kput('hedge',[ox+r*Math.cos(th),y+5.25,oz+r*Math.sin(th)],qEuler(0,-th,0),[1.4,.7+hh,3.2],new THREE.Color().setHSL(.27+hh*.08,.45,d>0?.13:.2));}}
 // THE ROOF on the top tray: a fluted lobed lid, a slab under it, a finial; the ruin's has caved in
 {const s=NS-1,ty=6+s*5.4,tR=24-s*1.6,tox=Math.sin(s*1.3)*5,toz=Math.cos(s*.9)*5,LH=7.4;
  const rF=yy=>tR*1.03*Math.pow(clamp(1-Math.pow(yy/LH,2),0,1),.55);
  const rh=holeFn(d*.5,9979,null,2);
  aSkin.push(lathe({rFn:rF,H:LH,flutes:6,amp:.13,sharp:1.4,nu:56,nv:12,hole:(u,yy)=>(rh?rh(u,yy):false)||cave(u*TAU,yy)}).translate(tox,ty+4.95,toz));
  if(d===0){kput('slab',[tox,ty+4.9,toz],null,[tR*1.02,.4,tR*1.02],SLC);kput('finial',[tox,ty+12.6,toz],null,[1.2,2,1.2],null);}
  else{// the slab with the fallen sector bitten out, a dark attic under what stands, and the shell of the lid on the terrace below
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=v*tR*1.02;return[tox+r*Math.cos(th),ty+4.9,toz+r*Math.sin(th)];},64,4,{hole:(u,v)=>v>.25&&civDA(u*TAU,RS)<.7-.25*v}));
   aDark.push(lathe({rFn:yy=>rF(yy)*.9,H:LH*.8,nu:24,nv:3}).translate(tox,ty+4.95,toz));
   const s6=NS-2,y6=6+s6*5.4,R6=24-s6*1.6,o6x=Math.sin(s6*1.3)*5,o6z=Math.cos(s6*.9)*5,F=new THREE.Group();
   mesh(gridSurface((u,v)=>{const th=RS-.5+u*1.0,yy=v*LH*.8,r=rF(yy);return[r*Math.cos(th),yy,r*Math.sin(th)-tR*.8];},12,6,{uS:3,vS:2}),skin,F);
   F.position.set(o6x+Math.cos(RS)*R6*.95,y6+5.2,o6z+Math.sin(RS)*R6*.95);F.rotation.set(.9,.25,.15);G.add(F);dropFragment(F,y6+5.0,.3);
   for(let k=0;k<14;k++){const hh=h3(k,7,9979),th=RS+(hh-.5)*1.2,r=R6*(.95+hh*.15);
    kput('rubble',[o6x+r*Math.cos(th),y6+5.3+hh*.6,o6z+r*Math.sin(th)],qEuler(hh*3,hh*5,hh*2),[1+hh*1.6,.6+hh,1+hh*1.2],null);}}}
 meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);
 if(d>0){mossOnSurface(aSkin,0,0,0,90,1.8);vinesFromLedge(aSkin,0,0,0,40,12);stainsFromLedge(aSkin,0,0,0,30,9);rubbleRing(0,0,0,26,40,30,2);}
 kput('archOpen',[7,3.5,0],qFacing([1,0,0]),[.5,.5,1],null);
 figures(0,0,5,30);civFlatten(G);KOFF=[0,0,0];return G;}
