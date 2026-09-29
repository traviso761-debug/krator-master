// ================================================================= DAM ARCOLOGY — "Theodiga" (after Soleri)
function buildDam(scene,gx,gz,d){reseed(9260+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const H=400,SPAN=640,CH=440;REGISTER({name:'Dam arcology — Theodiga ('+STATE(d)+')',x:0,z:0,r:520,h:H+40});
 // canyon walls: two rock masses, rough, running upstream (−z) and downstream (+z)
 // The canyon was too smooth — a pair of soft banks rather than cut rock. It
 // now carries bedding planes, vertical gullies and a coarser base noise, at a
 // grid fine enough to show them, plus a talus of fallen blocks at the foot.
 // All six wall meshes merge into one: they always shared a material.
 const ROCK=[];
 for(const s of [-1,1]){const CX=s*(SPAN/2+150);
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300,y=v*CH;
   const strata=9*Math.sin(v*34+fbm(u*4,0,2205,2)*7);                        // bedding planes
   const gully=26*Math.pow(Math.abs(fbm(u*19,v*3,2206+s,3)-.5)*2,1.7);       // vertical gullies
   const inner=-s*(150-32*fbm(u*13,v*7,2200+s,4)-strata-gully-18*(1-v)*(1-v));
   const wob=1+.12*fbm(u*6,v*2,2210,2);return[CX+inner*wob,y,z];},118,38,{uS:40,vS:14}));
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300,x=CX+(v-.5)*2*300;
   return[x,CH+8*fbm(u*7,v*7,2220+s,2)+16*fbm(u*3,v*3,2221+s,2),z];},60,12,{uS:40,vS:20}));
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300;const x=CX+s*300;return[x,v*CH,z];},40,6,{}));
  for(let k=0;k<70;k++){const z=-700+rng()*1300,t=Math.pow(rng(),1.8);
   const bx=CX-s*(150-34*fbm((z+700)/1300*13,.1,2200+s,4))*(1-t*.5)+s*t*70;
   const sc=rr(3,15)*(1-t*.45);
   kput('rubble',[bx,sc*.4+t*4,z],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.26,.44)));}}
 meshMerged(ROCK,MAT.rock,G);
 // the dam: arc in plan bulging upstream; downstream face battered, upstream face vertical
 const zc=x=>-140*(1-Math.pow(x/(SPAN/2),2));const th_=y=>50+110*(1-y/H);
 const dsFace=(u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)+th_(y)];};
 // LIGHT TUNNELS are chosen HERE, before the face is built, because the face
 // has to be punched where they break through it. Generating them afterwards
 // left every shaft behind an unbroken elevation — all that showed was the 2 m
 // of collar that protruded, so they read as blind bosses rather than openings.
 const TUNS=[];
 for(let k=-5;k<=5;k++){const tx=k*52;
  for(let j=0;j<3;j++){
   if(rng()<.18)continue;                                  // not a perfect grid
   TUNS.push({x:tx,y:96+j*82+rr(-9,9),R:rr(7.5,10.5),blocked:d>0&&rng()<.30});}}
 const tunHole=(x,y)=>{for(const t of TUNS){const dx=x-t.x,dy=y-t.y;
  if(dx*dx+dy*dy<t.R*t.R*.86)return true;}return false;};
 const fh=holeFn(d*.5,2300,null,1.6);
 const FACE=[gridSurface(dsFace,160,80,{uS:32,vS:20,hole:(u,v)=>
   tunHole((u-.5)*SPAN,v*H)||(fh?fh(u,v):false)}),
  gridSurface((u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)-2];},96,10,{uS:32,vS:20}),
  gridSurface((u,v)=>{const x=(u-.5)*SPAN;return[x,H,zc(x)+v*th_(H)];},96,4,{uS:32,vS:4})];
 meshMerged(FACE,CONC(d),G);
 if(d>0)mesh(gridSurface((u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)+th_(y)-6];},48,20,{}),MAT.guts,G);
 // crest: light wells (arc of slots), residential arc, public centre dome, cultural domes
 for(let k=-13;k<=13;k++){const x=k*22;const z=zc(x);const gone=d>0&&rng()<.15;kput(BOXC(d),[x,H+9,z+8],null,[15,18,28],null);kput('boxD',[x,H+18.2,z+8],null,[9,.4,20],null);kput(BOXC(d),[x,H+8,z+50],null,[18,16,22],null);for(let r=0;r<2;r++)for(let c=-1;c<=1;c++)kput(d>0?'winSmD':'winSmI',[x+c*5,H+5+r*6,z+61.2],qFacing([0,0,1]),[2,2.4,1],null);
  if(!gone){const lit=d>0?rng()<.12:true;kput('strip',[x,H+12.6,z+10],qEuler(0,Math.PI/2,0),[16,1,1],lit?CYAN:DEAD);}}
 mesh(lathe({rFn:y=>44*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,flutes:24,amp:.06,sharp:2,nu:96,nv:14,hole:(u,y)=>Math.cos(u*TAU*24)<.3&&y>3&&y<22||(d>0&&fbm(u*4,y*.1,2310,2)<.3)}),skin,G,0,H+12,zc(0)+20);
 if(d===0)mesh(lathe({rFn:y=>42*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}),MAT.glass,G,0,H+12,zc(0)+20);else mesh(lathe({rFn:y=>40*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}),MAT.dark,G,0,H+12,zc(0)+20);
 for(const s of [-1,1])for(let k=0;k<3;k++){const x=s*(90+k*40);mesh(lathe({rFn:y=>15*Math.pow(clamp(1-Math.pow(y/12,2),0,1),.5)+.01,H:12,flutes:12,amp:.08,nu:36,nv:8,hole:holeFn(d*.7,2320+k,null,2.5)}),skin,G,x,H+12,zc(x)+40);}
 // the cruciform on the downstream face: upper residential fins, learning-centre beam, lower splayed fins, central spine
 const zf=y=>zc(0)+th_(y);const fins=[];for(let k=-3;k<=3;k++)fins.push([k*46,244,H+10,30,d>0&&(k===2)]);for(let k=-2.5;k<=2.5;k++)fins.push([k*52,50,214,34,d>0&&(k===-1.5)]);
 fins.forEach((f,i)=>{const [x,y0,y1,w,broken]=f;const top=broken?lerp(y0,y1,.45):y1;const L=top-y0;const cy=(y0+top)/2;const zz=zf(cy);const splay=y0<100?.06:0;
  const q=qEuler(0,0,x>0?-splay:splay);const prot=y0<100?50:44;
  kput(BOXC(d),[x+(x>0?1:-1)*splay*20,cy,zz+prot/2-4],q,[w,L,prot],null);kput('boxD',[x+(x>0?1:-1)*splay*20,cy,zz+prot/2-4],q,[w-1.5,L+.5,prot-1.5],null);
  for(let yy=y0+4;yy<top-2;yy+=8)kput(BOXC(d),[x+(x>0?1:-1)*splay*20,yy,zz+prot/2-3],q,[w+1.5,.8,prot+1],null);
  // mosaic of cells on the fin faces (the Soleri hieroglyph texture)
  // MOSAIC. Cells used to be scattered by a flat coin-flip, which reads as
  // noise. Soleri's facades are a hieroglyph: cells clump into patches and run
  // in bands, with occasional double-height openings and whole blank panels.
  // fbm supplies the patches, a sine the banding, and the two are mixed.
  for(let yy=y0+6;yy<top-4;yy+=5)for(const s of [-1,1]){const n=Math.round(prot/5);
   const cv=(yy-y0)/Math.max(1,top-y0);
   for(let c=0;c<n;c++){const cu=(c+.5)/n;
    const patch=fbm(cu*3.4+i*2.3,cv*6.5,2340+i,3);
    const band=Math.abs(Math.sin(cv*Math.PI*5.5+fbm(cu*2.2,0,2341,2)*3.4));
    const m=patch*.70+band*.30;
    if(m<.47)continue;
    const tall=m>.745;                       // a taller opening where the mosaic is densest
    const lit=d>0?rng()<.05:rng()<.55;
    const z=zz-4+(c+.5)*prot/n,cx=x+s*(w/2+.15)+(x>0?1:-1)*splay*20;
    kput('cell',[cx,yy+(tall?1.1:0),z],qFacing([s,0,0]),[3.6,tall?5.2:3,1],
     lit?(m>.62?WARM:CYAN).clone().multiplyScalar(rr(.4,.95)):(d>0?DEAD:new THREE.Color(0x1a2a3a)));}}
  if(broken){rubbleRing(x*1.5,0,zf(0)+40+Math.abs(x)*.3,10,60,60,3);}else{kput(BOXC(d),[x,top+1,zz+prot/2-4],null,[w+2,2,prot+2],null);if(y0>100&&d===0)kput('finial',[x,top+6,zz+prot/2-4],null,[2.5,4,2.5],null);}});
 // LIGHT TUNNELS. A dam this deep has no daylight anywhere behind its face, so
 // shafts are driven back through the mass from the downstream elevation and up
 // to the crest. Each reads as a lit throat ringed by a collar on the face, with
 // its matching slot cut in the crest deck directly above.
 const TUN=[];
 TUNS.forEach(t=>{const tx=t.x,ty=t.y,R0=t.R;
  // the face BULGES: zc(x) runs from -140 at mid-span to 0 at the abutments, so
  // the tunnel z comes from zc(tx), not zf() which is only true at x=0.
  const tz=zc(tx)+th_(ty);
  // An OPEN tube: the kit's 'tube' is a CAPPED CylinderGeometry and built a
  // closed drum whose flat end cap was all you saw. lathe() is open-ended.
  TUN.push(lathe({rFn:()=>R0,H:34,nu:14,nv:2}).rotateX(-Math.PI/2).translate(tx,ty,tz+2));
  kput(d>0?'ringR':'ringW',[tx,ty,tz+1.2],null,[R0*1.22,R0*1.22,2.6],null);
  if(!t.blocked){const lit=d>0?rng()<.14:true;
   // recessed a little way inside the collar: a plate on the axis is only
   // visible looking straight down the bore, and nothing views this face square-on
   kput('dot',[tx,ty,tz-9],qFacing([0,0,1]),[R0*1.14,R0*2.29,1],
    lit?CYAN.clone().multiplyScalar(rr(.55,1)):DEAD);}
  kput('boxD',[tx,H+18.4,zc(tx)+8],null,[7.5,.6,26],null);});   // its slot on the crest
 meshMerged(TUN,d>0?MAT.guts:MAT.dark,G);
 // learning-centre beam (horizontal), and the spine
 const by=228;kput(BOXC(d),[0,by,zf(by)+18],null,[340,26,44],null);kput('boxD',[0,by,zf(by)+18],null,[338,24,42],null);
 for(let k=-16;k<=16;k++){if(k%2)continue;const lit=d>0?rng()<.1:true;kput('strip',[k*10,by+4,zf(by)+40.2],null,[8,1,1],lit?CYAN:DEAD);if(d===0)kput('pane',[k*10,by-3,zf(by)+40.3],null,[9,9,1],null);else if(rng()<.5)kput('paneD',[k*10,by-3,zf(by)+40.3],null,[9,9,1],null);}
 // (an empty loop body used to sit here: it computed a y and discarded it)
 mesh(gridSurface((u,v)=>{const y=v*(by-13);const w=14;return[(u-.5)*w,y,zf(y)+38];},4,40,{uS:2,vS:20,hole:holeFn(d*.7,2330,null,1.5)}),MAT.dark,G);
 for(let y=10;y<by-13;y+=9){const lit=d>0?rng()<.12:true;kput('strip',[0,y,zf(y)+38.3],null,[12,1,1],lit?CYAN:DEAD);}
 for(const s of [-1,1])kput(BOXC(d),[s*8,(by-13)/2,zf((by-13)/2)+36],qEuler(-Math.atan2(110,H),0,0),[2.5,by-13,6],null);
 // base: production/utilities blocks, outlets with waterfalls, the park in the canyon floor
 for(let k=-4;k<=4;k++){const x=k*48;if(Math.abs(k)<2)continue;kput(BOXC(d),[x,14,zf(14)+22],null,[38,28,48],null);kput('boxD',[x,14,zf(14)+22],null,[36,26,46],null);for(let j=0;j<3;j++)kput('archOpen',[x-12+j*12,6,zf(14)+46.5],qFacing([0,0,1]),[1,.9,1.5],null);
  kput(d>0?'pipeR':'pipe',[x,30,zf(30)+30],null,[1.2,40,1.2],null);}
 for(const s of [-1,1]){const x=s*40;kput('tube',[x,26,zf(26)+2],null,[9,12,9],null);
  if(d===0)mesh(gridSurface((u,v)=>{const y=lerp(26,2,v);return[x+(u-.5)*14*(1+v*.8),y,zf(26)+6+v*20+v*v*20];},8,12,{}),MAT.spray,G);}
 mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN-40),z=zf(0)+60+v*500;return[x,1.5+3*fbm(u*6,v*6,2400,2)+(z>zf(0)+120?0:-1.5),z];},40,30,{}),d>0?MAT.mud:MAT.lawn,G);
 mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN-60),z=zf(0)+56+v*520;return[x,-1+0*u,z];},4,4,{}),MAT.water,G).position.y=0;
 for(let i=0;i<60;i++){const x=rr(-280,280),z=zf(0)+rr(90,540);const h=rr(6,14);kput('trunk',[x,1,z],null,[2,h,2],null);kput('moss',[x,h,z],null,[6,3,6],new THREE.Color().setHSL(.3,.5,.2));}
 // reservoir behind (full when intact; drawn down and silted when ruined)
 const WL=d>0?250:378;mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN+80),z=-700+v*(700+zc(x)-6);return[x,WL,z];},32,16,{}),MAT.water,G);
 if(d>0)mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN+40),z=-700+v*(700+zc(x)-2);return[x,WL-6+30*fbm(u*5,v*5,2500,2)*v*v,z];},32,16,{uS:20,vS:20}),MAT.mud,G);
 // ruin: cracks, moss on the face, rubble at the toe
 // decay read off the structure rather than sprayed in rings
 if(d>0){mossOnSurface(FACE,0,0,0,140,2.6);vinesFromLedge(FACE,0,0,0,60,26);stainsFromLedge(FACE,0,0,0,70,22);
  mossOnSurface(ROCK,0,0,0,120,3.4);
  scatterMoss(0,2,zf(0)+200,0,300,120,3);rubbleRing(0,2,zf(0)+70,20,220,120,4);vinesOnRing(0,H+12,zc(0)+10,60,20,60);for(let k=0;k<30;k++)kput('vine',[rr(-300,300),rr(120,H),zf(200)+2],qEuler(rr(-.05,.05),0,0),[1.5,rr(15,60),1.5],null);}
 figures(0,zf(0)+200,10,60);KOFF=[0,0,0];return G;}

