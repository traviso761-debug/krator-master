// ================================================================= GOVERNMENT v2 — "the Assembly" (all round)
function buildGovernment(scene,gx,gz,d){reseed(9900+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Government — the Assembly ('+STATE(d)+')',x:0,z:0,r:150,h:120});
 const tiers=[[92,84,14],[66,60,14],[42,38,14]];let y=0;apron(G,0,0,91,104,d,1.4);
 // RUIN (round 2): the upper tiers have SLUMPED in a sector west of the portico,
 // toward the ruin camera, so the stack no longer keeps the intact silhouette.
 // Tier 3 is open almost to its foot, tier 2 above its first floor; the roofs
 // are bitten, the floors inside stand exposed, the spill lies on the terraces
 // below (placed after figures(), so no earlier rng draw moves).
 const COL=2.45,colW=(i,yl,h)=>(i===2?.5:.32)*(.62+.38*clamp(yl/h,0,1))+.07*(fbm(yl*.25,i*3.1,671+i,2)-.5),
  colY=i=>i===2?1.6:6.5,colG=(th,yl,i)=>d>0&&i>0&&yl>colY(i)+1.2*(fbm(th*7,i,672,2)-.5)&&civDA(th,COL)<colW(i,yl,14);
 const govMark={};for(const nm of ['strip','moss','tube','cell','cellD'])govMark[nm]=KIT.items[nm].length;
 const roofs=[];
 tiers.forEach((t,i)=>{const [a,b,h]=t;const hole=holeFn(d*(i===2?1:.5),600+i,null,1.3);
  const wallHole=hole||(d>0&&i>0)?(u,yy)=>colG(u*TAU,yy,i)||(hole?hole(u,yy+i*30)&&(u>.15&&u<.42):false):null;
  mesh(lathe({rFn:yy=>a-(a-b)*yy/h,H:h,flutes:24-i*6,amp:.05,sharp:2,nu:120,nv:6,hole:wallHole}),skin,G,0,y,0);
  // MOULDING (round 2): a flared cornice lip crowns every tier (merged into the skin by civFlatten)
  // (the shared moulding(): a square crown over an ogee, swept round the tier;
  // the path runs clockwise so `1-u` is the lathe's u and the same sectors go)
  {const ch=holeFn(d*.6,640+i,null,2);mesh(moulding(MOULD.cornice(.9,1.3),t=>{const a=-t*TAU;return[(b+.1)*Math.cos(a),0,(b+.1)*Math.sin(a)];},
   {wn:t=>{const a=-t*TAU;return[Math.cos(a),0,Math.sin(a)];},nu:120,up:[0,1,0],hole:d>0?(u,v)=>colG((1-u)*TAU,h,i)||(ch?ch(1-u,v*26):false):null}),skin,G,0,y+h-.25,0);}
  // behind the holes (they are confined to u .15-.42): two floors of rooms per
  // tier, only in that arc, in front of a liner pushed back to .8
  if(d>0){mesh(lathe({rFn:yy=>(a-(a-b)*yy/h)*.8,H:h,nu:48,nv:6,hole:i>0?(u,yy)=>colG(u*TAU,yy+1.5,i):null}),MAT.guts,G,0,y,0);
   civRooms({cy:y,rFn:yy=>a-(a-b)*yy/h,y0:.3,y1:h,step:7,d,seed:620+i,rIn:.8,gap:th=>{const u=th/TAU;return u<.13||u>.44;}});}
  if(d>0&&i>0){const rIn=i===2?26:44;roofs.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rIn,b*.99,v);return[r*Math.cos(th),y+h+.3,r*Math.sin(th)];},96,4,{hole:(u,v)=>civDA(u*TAU,COL)<colW(i,h,h)+.05*v}),
    gridSurface((u,v)=>{const th=u*TAU,r=rIn*v;return[r*Math.cos(th),y+h+.3,r*Math.sin(th)];},48,2,{}));}
  else kput('slab',[0,y+h,0],null,[b*.99,.6,b*.99],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  const n=Math.round(a*.42);for(let k=0;k<n;k++)for(let row=0;row<2;row++){const th=(k+.5)/n*TAU;const yy=y+3.5+row*6;const r=a-(a-b)*(yy-y)/h+.2;const u=th/TAU;if(hole&&hole(u,yy+i*30))continue;if(colG(th,yy-y,i))continue;
   if(i===0&&row===0&&Math.abs(th-Math.PI/2)<.5)continue;civWin(d>0?'winD':'winI',[r*Math.cos(th),yy,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,.9,1],null);
   // MOULDING (round 2): a hood over the arch and a sill under it; a ruin has lost some
   if(!(d>0&&h3(k,row,690+i)<.3))kput(civDef('civHood',()=>civHoodGeo(2.2,4.2),MAT.white),[r*Math.cos(th),yy,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,.9,1],d>0?new THREE.Color(0x8c7466):null);}
  stripRing(0,y+h-1.2,0,b*1.01,d,48);if(d>0)mossOnRing(0,y+h+.2,0,b*.9,Math.round(b*.8),2.2);y+=h;});
 if(roofs.length)meshMerged(roofs,MAT.concreteR,G);
 // what the slump left hanging in air: strips, moss and conduit in the open sector
 if(d>0)civCull(govMark,(x,yy,z)=>{const th=Math.atan2(z,x),r=Math.hypot(x,z);for(const i of [1,2]){const top=14*(i+1);if(yy>top-14+colY(i)&&yy<top+4&&civDA(th,COL)<colW(i,14,14)+.05&&r>(i===2?24:43))return true;}return false;});
 // portico: a fan of leaning struts on the +z face, rising to a ring beam at tier 2, roofed by a curved shell that grows out of the tier wall
 const NP=11;const struts=[];for(let k=0;k<NP;k++){const a=Math.PI/2+(k-(NP-1)/2)*.11;const fallen=d>0&&(k===2||k===7);
  const A=[Math.cos(a)*130,0,Math.sin(a)*130],B=[Math.cos(a)*64,29,Math.sin(a)*64];struts.push([a,A,B]);
  if(!fallen)beam(d>0?'strutR':'strutW',A,B,4.5,3.5);else beam('strutR',[A[0],2,A[2]],[A[0]*.7+rr(-8,8),3,A[2]*.72],4.5,3.5);}
 const a0=Math.PI/2-(NP-1)/2*.11-.05,a1=Math.PI/2+(NP-1)/2*.11+.05;
 // ring beam on the strut tops, a light glass roof back to the tier-2 wall, and a comb of bone fins above the beam
 for(let k=0;k<NP-1;k++){const A=struts[k][2],B=struts[k+1][2];beam(d>0?'strutR':'strutW',[A[0],A[1]+1,A[2]],[B[0],B[1]+1,B[2]],3,3.5);}
 if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(40,64,v);return[Math.cos(a)*r,27+3.5*v,Math.sin(a)*r];},30,4,{}),MAT.glass,G);
 for(let k=0;k<NP-1;k++)for(let j=0;j<3;j++){const A=struts[k][2],B=struts[k+1][2];const t=(j+.5)/3;const x=lerp(A[0],B[0],t),z=lerp(A[2],B[2],t);if(d>0&&rng()<.4)continue;
  const a=Math.atan2(z,x);const h=rr(6,11);beam(d>0?'strutR':'strutW',[x,31,z],[x-Math.cos(a)*2,31+h,z-Math.sin(a)*2],1.2,.9);}
 for(let j=0;j<=6;j++){const a=lerp(a0,a1,j/6);beam(d>0?'strutR':'strutW',[Math.cos(a)*40,27,Math.sin(a)*40],[Math.cos(a)*64,30.5,Math.sin(a)*64],1,1.4);}
 for(let k=0;k<7;k++){const a=lerp(a0,a1,(k+.5)/7);const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*70,29.3,Math.sin(a)*70],qEuler(0,-a+Math.PI/2,0),[20,1,1],lit?CYAN:DEAD);}
 kput('archOpen',[0,8,91],qFacing([0,0,1]),[2.2,2.2,3],null);kput('slab',[0,.6,110],null,[40,1.2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<3;k++)kput(d>0?'boxR':'boxW',[0,.4+k*1.2,88+k*3],null,[30,1.2,3],null);
 // petal council chamber + spire
 const P=new THREE.Group();P.position.set(0,42,0);G.add(P);useGroupXF(P);
 // petalRing's holes scale with d itself, so at decay 3 (d=3: fbm<.9) the petals were
 // all hole and the rehabilitated chamber stood bare; pass the decay-1 amount times HOLES.
 petalRing(P,8,23,36,15,4,1,0,d>0?HOLES:0,650,skin,d>0?(i=>i===1||i===4||i===6):null);
 if(d===0)mesh(lathe({rFn:yy=>19*Math.pow(clamp(1-Math.pow(yy/27,2),0,1),.6),H:27,nu:48,nv:14}),MAT.glass,P,0,1,0);
 else mesh(lathe({rFn:yy=>18*Math.pow(clamp(1-Math.pow(yy/27,2),0,1),.6),H:27,nu:48,nv:14,hole:(u,yy)=>fbm(u*3,yy*.1,660,2)<.5}),MAT.dark,P,0,1,0);
 stripRing(0,4,0,17,d,32);const SH=40,scut=d>0?SH*.45:null;mesh(lathe({rFn:yy=>3*(1-.6*yy/SH)+.4,H:SH,cut:scut,jag:scut?1.5:0,flutes:6,amp:.25,nu:24,nv:16}),skin,P,0,27,0);
 if(!scut)kput('finial',[0,27+SH+2,0],null,[3,5,3],null);endGroupXF();
 if(d>0){const fm=mesh(petalGeo(23,36,15,4,1,holeFn(1,661,null,1.5)),MAT.rust,G,-60,4,70);fm.rotation.set(0,1.2,Math.PI/2*.85);dropFragment(fm);rubbleRing(-60,0,70,5,30,50,2.5);
  scatterMoss(0,0,0,100,190,140,3);rubbleRing(0,0,0,96,150,70,2.5);trees(0,0,120,220,18);}
 figures(0,150,8,10);figures(-70,110,4,5);
 // the slump's spill: on tier 2's exposed floor, on the tier-1 terrace, a talus
 // off its edge, and broken roof slabs lying tilted in it (round 2; drawn last)
 if(d>0){for(let k=0;k<110;k++){const q=rng(),a=COL+rr(-.45,.45)*(1-.4*q),sz=rr(.8,3.2)*(1.2-.5*q);
   const r=q<.3?rr(44,58):q<.85?rr(67,86):rr(93,112),yb=q<.3?21.6:q<.85?14.3:0;
   kput('rubble',[r*Math.cos(a),yb+sz*.35+(q<.3?0:Math.max(0,1-(r-66)/24)*1.4),r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.3,.5)));}
  for(let k=0;k<7;k++){const a=COL+rr(-.35,.35),r=k<3?rr(46,56):rr(64,82),yb=k<3?22:15;
   kput('boxCR',[r*Math.cos(a),yb+rr(.5,1.5),r*Math.sin(a)],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(7,14),.9,rr(5,10)],null);}}
 civFlatten(G);KOFF=[0,0,0];return G;}

