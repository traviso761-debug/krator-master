// ================================================================= 3. LABORATORY — "the Reliquary"
function buildLab(scene,gx,gz,d){reseed(d>0?9301:9300);KOFF=[gx,0,gz];REGISTER({name:'Laboratory — the Reliquary ('+STATE(d)+')',x:0,z:0,r:40,h:125});REGISTER({name:'Laboratory — reactor hut',x:104,z:0,r:12,h:17});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const SH=4.4,NS=6;const phase=s=>s*.55;
 const rW=(th,s)=>30+2.6*Math.sin(7*th+phase(s))+1.1*Math.sin(3*th-phase(s)*.7);
 const lSkin=[],lGuts=[];   // the six storeys become one mesh, not three or four each
 for(let s=0;s<NS;s++){const y0=s*SH;const hole=holeFn(d*(s>=4?1:.35),61+s,null,2);
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s);return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},112,6,{uS:28,vS:.6,hole:hole?(u,v)=>hole(u,y0+v*SH+s*40):null}));
  if(d>0)lGuts.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s)*.9;return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},64,2,{}));
  // undulating balcony: floor annulus + fascia band
  const rB=th=>rW(th,s)+2.4+.9*Math.sin(7*th+phase(s)+1.2);
  const bHole=d>0?(u,v)=>fbm(u*9+s,3,61+s)<.22*d:null;
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rW(th,s)-.3,rB(th),v);return[r*Math.cos(th),y0+.3,r*Math.sin(th)];},112,3,{hole:bHole}));
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rB(th);return[r*Math.cos(th),y0+.3-.5+v*1.6,r*Math.sin(th)];},112,2,{uS:28,hole:bHole}));
  // windows / ground-floor arcade
  const n=s===0?14:21;for(let k=0;k<n;k++){const th=(k+.3)/n*TAU;const u=th/TAU;if(hole&&hole(u,y0+2+s*40))continue;const r=rW(th,s)+.1;
   if(s===0)kput('archOpen',[r*Math.cos(th),4.6,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.7,1],null);
   else kput(d>0?'winBigD':'winBigI',[r*Math.cos(th),y0+2.3,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);}
  if(s>0)stripRing(0,y0+3.9,0,rW(0,s)*.88,d,28);
  }
 meshMerged(lSkin,skin,G);meshMerged(lGuts,MAT.guts,G);
 apron(G,0,0,32,50,d,1.1);
 // Decay read off the building's own geometry rather than sprayed in rings:
 // moss only where a surface faces the sky, vines and staining only off the
 // outer edge of those surfaces, which is where the balcony ledges are.
 if(d>0){mossOnSurface(lSkin,0,0,0,150,2.0);vinesFromLedge(lSkin,0,0,0,54,16);stainsFromLedge(lSkin,0,0,0,44,13);}
 // roof slab + parapet
 const RY=NS*SH;const roofPts=[];for(let i=0;i<112;i++){const th=i/112*TAU,r=rW(th,NS-1);roofPts.push(new THREE.Vector2(r*Math.cos(th),-r*Math.sin(th)));}
 const roof=new THREE.ShapeGeometry(new THREE.Shape(roofPts));roof.rotateX(-Math.PI/2);mesh(roof,skin,G,0,RY+.3,0);
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,NS-1)+.4;return[r*Math.cos(th),RY+.3+v*(1.3+.6*Math.sin(5*th)),r*Math.sin(th)];},112,2,{uS:28}),skin,G);
 if(d>0)mossOnRing(0,RY+.5,0,18,40,2.4);
 // twisted chimney sculptures with helmet caps
 for(let i=0;i<6;i++){const a=i/6*TAU+.4,r=22,cx=r*Math.cos(a),cz=r*Math.sin(a);const fallen=d>0&&(i===2||i===4);
  const ch=lathe({rFn:y=>1.4*(1-.25*y/7)+.6*clamp((y-5)/2,0,1),H:7,flutes:4,amp:.35,sharp:1.5,twist:.5,nu:24,nv:14});
  const m=mesh(ch,skin,G);
  if(!fallen){m.position.set(cx,RY+.3,cz);mesh(lathe({rFn:y=>2.2*Math.sqrt(clamp(1-Math.pow(y/2.4,2),0,1)),H:2.4,nu:16,nv:6}),skin,G,cx,RY+7.2,cz);}
  else{m.position.set(cx*1.1,RY+1.2,cz*1.1);m.rotation.set(0,-a,Math.PI/2*.95);dropFragment(m,RY+.3,.1);}}
 // lattice dome: ribbed outer shell with open panels, blue glass inner (intact)
 const R=17,Hd=22;const dR=y=>R*Math.pow(clamp(1-Math.pow(y/Hd,2),0,1),.62);
 const collapse=d>0?(u,y)=>fbm(u*3+.7,y*.06,77,2)>.62:null;
 const domeHole=(u,y)=>{const panel=Math.cos(u*TAU*24)<.35&&y<Hd*.82&&y>1.5;return panel||(collapse&&collapse(u,y));};
 mesh(lathe({rFn:dR,H:Hd,flutes:24,amp:.07,sharp:2,nu:120,nv:36,hole:domeHole}),skin,G,0,RY+.3,0);
 if(d===0)mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24}),MAT.glass,G,0,RY+.3,0);
 else{mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24,hole:(u,y)=>collapse(u,y)||fbm(u*5,y*.1,78,2)<.55}),MAT.dark,G,0,RY+.3,0);}
 kput('slab',[0,RY+.6,0],null,[R*.95,.4,R*.95],new THREE.Color(0x24262a));
 stripRing(0,RY+2,0,R*.85,d,32);stripRing(0,RY+9,0,dR(9)*.85,d,32);
 // antenna spire (Moebius needle) with rings
 const AH=72;const aR=y=>2.4*Math.pow(clamp(1-y/AH,0,1),.75)+.3;const acut=d>0?AH*.55:null;
 mesh(lathe({rFn:aR,H:AH,cut:acut,jag:acut?2:0,flutes:6,amp:.25,sharp:1.5,nu:24,nv:30,hole:holeFn(d*.6,81,acut,1)}),skin,G,0,RY+Hd-2,0);
 for(let yy=12;yy<AH-8;yy+=12){if(acut&&yy>acut-3)break;kput(d>0?'ringR':'ringW',[0,RY+Hd-2+yy,0],qEuler(Math.PI/2,0,0),[aR(yy)*2.2,aR(yy)*2.2,6],null);}
 if(d===0)kput('finial',[0,RY+Hd-2+AH+2,0],null,[1.8,2.8,1.8],null);
 else{const fm=mesh(lathe({rFn:y=>aR(acut+y),H:AH-acut,flutes:6,amp:.25,sharp:1.5,nu:20,nv:12}),MAT.rust,G,44,1.2,-38);fm.rotation.set(0,.8,Math.PI/2*.9);dropFragment(fm,0,.3);rubbleRing(46,0,-40,2,12,26,1.6);}
 // colonnaded porch → reactor hut
 for(let i=0;i<7;i++)for(let sgn=-1;sgn<=1;sgn+=2){const x=36+i*8.5,z=sgn*5.5;const gone=d>0&&i===3&&sgn>0;
  if(!gone)kput(d>0?'colR':'colW',[x,0,z],null,[.9,6.5,.9],null);else kput('colR',[x+2,.5,z+3],qEuler(Math.PI/2,.4,0),[.9,6.5,.9],null);}
 mesh(gridSurface((u,v)=>[34+u*56,6.6+.7*Math.sin(u*14)+.3*Math.sin(v*6),(v-.5)*14],40,8,{uS:6,vS:2,hole:d>0?(u,v)=>fbm(u*6,v*3,88,2)<.3:null}),skin,G);
 const hut=new THREE.Group();hut.position.set(104,0,0);G.add(hut);
 mesh(lathe({rFn:()=>10,H:5,nu:40,nv:2,hole:holeFn(d*.5,90,null,2)}),skin,hut);
 mesh(lathe({rFn:y=>10*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,flutes:12,amp:.08,nu:48,nv:16,hole:d>0?(u,y)=>fbm(u*3,y*.1,91,2)>.6:null}),skin,hut,0,5,0);
 if(d>0)mesh(lathe({rFn:y=>9.2*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,nu:32,nv:8}),MAT.dark,hut,0,5,0);
 kput('archOpen',[104-10,4.5,0],qFacing([-1,0,0]),[.6,.6,1],null);
 stripRing(104,7,0,7,d,20);
 if(d>0){scatterMoss(0,0,0,34,120,160,2.4);rubbleRing(0,0,0,34,70,50,1.6);trees(0,0,70,150,18);}
 figures(-50,55,5,5);figures(60,22,3,3);KOFF=[0,0,0];
 return G;}

