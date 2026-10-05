// ================================================================= HYKKOUSOI — the Pharos crown (the beacon's lantern room)
// Grown onto the top of a host in the G frame (origin on the face at the floor datum, +z out of the face): a bedded
// nacre chamber (the keeper's room, the way in from the host's plate through its back door), a lily-pad gallery on
// its crown with a rail, held by ribs rooted in the chamber's shell, and on the gallery the lantern: a drum of
// lenses under a lens dome, the beacon pearl on a pedestal inside, reached by a helical stair up the chamber's wall.
// THE BEAM: a long thin cone of additive glow hung on the beacon, swept round once every five seconds by a tick on
// window.YS_TICKS (fn(dt,t), created by the scene before any builder runs; made here if the scene has not).
// Seeds 30680–30699. Uses 74c's hykTide* helpers.
// an elliptical fillet: like hykFlare (c the contact centre, n the face normal toward the shell, f the reach) but the
// contact is an ellipse Rx × Ry in the face (E1 along the face's horizontal, E2 up), so a tall hole in a host's wall
// can be collared by a pod that is wider than it is high without the collar's edge floating off the pod's top
function hykPharosFlare(c,n,Rx,Ry,f,o){o=o||{};const N=new THREE.Vector3(n[0],n[1],n[2]).normalize();let E2=new THREE.Vector3(0,1,0);E2.sub(N.clone().multiplyScalar(E2.dot(N))).normalize();const E1=new THREE.Vector3().crossVectors(E2,N);
 const fn=(u,v)=>{const th=u*TAU;const s=v*Math.PI/2;const g=f*(1-Math.sin(s)),off=f*(1-Math.cos(s));const wob=1+(o.wobble!=null?o.wobble:.03)*Math.sin(th*5+v*3);const rx=(Rx+g)*wob,ry=(Ry+g)*wob;
  return [c[0]+E1.x*rx*Math.cos(th)+E2.x*ry*Math.sin(th)+N.x*off,c[1]+E1.y*rx*Math.cos(th)+E2.y*ry*Math.sin(th)+N.y*off,c[2]+E1.z*rx*Math.cos(th)+E2.z*ry*Math.sin(th)+N.z*off];};
 return hykSurf(fn,o.nu||48,o.nv||8,{col:o.col,uS:TAU*Rx/4,vS:f/4,flip:o.flip!==undefined?o.flip:true});}
// the beam: a cone of additive glow, bright at the lamp and dark (invisible) at its far end, along the group's +x
function hykPharosBeam(len,r1){const g=new THREE.CylinderGeometry(r1,.35,len,18,6,true);g.translate(0,len/2,0);const P=g.attributes.position,C=new Float32Array(P.count*3);
 for(let i=0;i<P.count;i++){const k=Math.pow(1-P.getY(i)/len,1.6);C[i*3]=k;C[i*3+1]=k*.94;C[i*3+2]=k*.8;}g.setAttribute('color',new THREE.BufferAttribute(C,3));g.rotateZ(-Math.PI/2);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.userData.probeSkip=true;m.renderOrder=3;return m;}
// ---------------------------------------------------------------- the crown
function buildHykPharosCrown(G,o){reseed(30680+(o.v|0));
 const R=7.5,way=o.way;const A=7.5,B=5.6,C=9.0,cy=B*.52,cz=way?-R*.2:R*.3;   // the chamber: an oval pod, its floor on the datum, bedded a fifth into the face
 const cNac=hC(hPick(HPAL.nacre)),cBone=hC(hPick(HPAL.bone)),cIn=hC(hPick(HPAL.shell),.86),cFloor=hC(hPick(HPAL.floor)),cLens=hC(hPick(HPAL.lens)),cShell=hC(hPick(HPAL.shell));
 const openings=[{th:0,el:-.22,r:1.2,ky:1.3,kind:'door'},{th:.78,el:.12,r:.75,kind:'window'},{th:-.78,el:.12,r:.75,kind:'window'},{th:1.35,el:.3,r:.6,kind:'window'},{th:-1.35,el:.3,r:.6,kind:'window'}];
 if(way)openings.push({th:Math.PI,el:-.22,r:1.2,ky:1.3,kind:'door',back:true});
 openings.push({th:0,el:1.3,r:3.2,kind:'top'});   // the crown is open under the lantern deck: the stair arrives through it
 const pod=hykPod({a:A,b:B,c:C,e1:.9,e2:.94,cy,nu:72,nv:36,noise:{amp:.022,su:4,sv:3,seed:6},col:cNac,openings,hollow:{t:.07,col:cIn}});
 pod.geo.translate(0,0,cz);hykPut('hkNacre',pod.geo);pod.inner.translate(0,0,cz);hykPut('hkIn',pod.inner,true);
 const floorY=.05;hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;return [A*.84*v*Math.cos(th),floorY,cz+C*.84*v*Math.sin(th)];},48,3,{col:cFloor,flip:true}),true);
 let door=null,back=null;for(const op of pod.openings){op.p=[op.p[0],op.p[1],op.p[2]+cz];
  if(op.kind==='door'&&op.back){back=op;hykDoor(op,{level:o.level,nacre:true,name:o.host.n+' way in',into:o.host.n});}
  else if(op.kind==='door'){door=op;hykDoor(op,{level:o.level,nacre:true});}else if(op.kind==='window')hykWin(op,{nacre:true,lit:true});}
 // rooted into the face: an elliptical collar that covers the way-in hole (1.8 R wide, 1.76 R tall, centred .447 R up)
 hykPut('hkNacre',hykPharosFlare([0,cy+.5,0],[0,0,1],way?6.5:6.8,way?4.6:5.0,way?2.3:2.8,{col:cNac}));
 // drips under the chamber, read off the pod so every spike is rooted
 for(let i=0;i<22;i++){const px=rr(-A*.8,A*.8),pz=cz+rr(.3,C*.8);const under=hykPodUnder(A,B,C,.9,.94,px,pz-cz);if(under==null)continue;const h=rr(.4,1.3),w=h*.3;kput('hkDrip',[px,cy-under-h/2+.22,pz],qEuler(Math.PI,0,0),[w,h,w],cNac);}
 // ---- the gallery: a lily pad on the chamber's crown, its rim held by eight ribs rooted in the shell, a rail round it
 const yL=cy+B,zL=.8,RG=6.0;
 // the helix hugs the inner skin (.75 inside it) and, where the crown is open, holds a radius of 2.6; it climbs with
 // the azimuth falling from the right side, so it passes over the back door at +4 and the front door near the top
 const hxTop=.3,hxDir=-1;const rIn=y=>Math.max(2.6,A*.93*Math.pow(Math.max(0,1-Math.pow(Math.abs(y-cy)/B,2/.9)),.45)-.75);
 const hx={a:0};{let a=hxTop;const n=Math.round((yL-floorY)/.19);for(let i=1;i<=n;i++)a+=hxDir*.64/rIn(floorY+i*.19);hx.a=a;}   // where it arrives (the deck opens there)
 const padHole=(u,v,p)=>{const ang=Math.atan2(p[2]-cz,p[0]);const r=Math.hypot(p[0],p[2]-cz);return r>.9&&r<4.2&&Math.abs(hykTideAng(ang,hx.a-hxDir*.55))<.62;};
 kput('hkLipN',[0,yL-1.0,cz+2.4],qEuler(Math.PI/2,0,0),[3.1,3.1,1.4],cNac);   // the collar on the crown's cut edge, under the deck
 hykPut('hkNacre',hykSurf((u,v)=>{const th=u*TAU;const r=RG*v*(1+.07*Math.cos(9*th)*v);return [r*Math.cos(th),yL+.02,zL+r*Math.sin(th)];},72,8,{col:cFloor,flip:true,hole:padHole}),true);
 hykPut('hkNacre',hykSurf((u,v)=>{const th=u*TAU;const r=RG*.98*v*(1+.07*Math.cos(9*th)*v);return [r*Math.cos(th),yL-.25-.7*(1-v*v),zL+r*Math.sin(th)];},72,6,{col:cNac,hole:padHole}));
 kput('hkLipN',[0,yL+.02,zL],qEuler(Math.PI/2,0,0),[RG,RG,.9],cNac);
 for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;if(Math.abs(hykTideAng(a,1.5*Math.PI))<.5)continue;   // no rib into the face
  const u=(((Math.PI/2-a)/TAU)%1+1)%1,v=clamp(.42/Math.PI+.5,.02,.98);const s=pod.surf(u,v);const Sp=[s[0],s[1],s[2]+cz];const vx=Sp[0],vy=Sp[1]-cy,vz=Sp[2]-cz;const vl=Math.hypot(vx,vy,vz)||1;const nn=[vx/vl,vy/vl,vz/vl];
  hykPut('hkBone',hykRib([Sp[0]-nn[0]*.5,Sp[1]-nn[1]*.5,Sp[2]-nn[2]*.5],[(RG-.5)*Math.cos(a),yL-.4,zL+(RG-.5)*Math.sin(a)],{rise:.6,r0:.42,r1:.28,knuckles:3,n:12,seg:8,col:cBone}));
  hykPut('hkBone',hykFlare([Sp[0]+nn[0]*.04,Sp[1]+nn[1]*.04,Sp[2]+nn[2]*.04],nn,.42,.6,{col:cBone}));kput('hkBall',[Sp[0]+nn[0]*.55,Sp[1]+nn[1]*.55,Sp[2]+nn[2]*.55],null,[.5,.44,.5],cBone);}
 hykTideRail(0,zL,RG-.45,yL+1.15,0,TAU,{col:cBone});
 // ---- the lantern: a nacre drum of eight lenses, a lens dome, a spire; the beacon on its pedestal inside
 const LR=4.0,LH=4.4;const LL={H:LH,yBase:yL,cx:0,cz:zL,rFn:y=>LR*(1+.04*Math.sin(y*1.6)),nu:64,nv:12,rings:{n:3,amp:.02},col:cNac};
 const lops=[];for(let i=0;i<8;i++){const q=hykTideAt(LL,i/8*TAU+Math.PI/8,2.3);q.r=.95;q.ky=1.1;lops.push(q);}LL.ops=lops;
 hykPut('hkNacre',hykLathe(LL));hykPut('hkIn',hykLathe(Object.assign({},LL,{rFn:y=>LL.rFn(y)*.9,flip:true,col:cIn,ops:lops.map(q=>({p:[q.p[0]*.95,q.p[1],zL+(q.p[2]-zL)*.95],r:q.r,ky:q.ky}))})),true);
 for(const q of lops){hykWin(q,{nacre:true,open:true,depth:.7});kput('hkLens',[q.p[0]-q.n[0]*.2,q.p[1],q.p[2]-q.n[2]*.2],qFacing(q.n),[q.r*.9,q.r*.9*q.ky,.42],cLens);}
 kput('hkLipN',[0,yL+.03,zL],qEuler(Math.PI/2,0,0),[LR*1.07,LR*1.07,1.1],cNac);
 const CY=yL+LH-.1,CH=3.0;const cap=y=>LR*Math.sqrt(Math.max(0,1-Math.pow(y/CH,2.2)))+.05;
 hykPut('hkNacre',hykLathe({H:CH,yBase:CY,cx:0,cz:zL,rFn:cap,nu:48,nv:14,col:cNac}));hykPut('hkIn',hykLathe({H:CH,yBase:CY-.05,cx:0,cz:zL,rFn:y=>cap(y)*.92,nu:48,nv:14,col:cIn,flip:true}),true);
 for(let ring=0;ring<2;ring++){const n=ring?6:12,y=ring?1.8:.85;const r=cap(y);for(let i=0;i<n;i++){const a=i/n*TAU+ring*.26;kput('hkLens',[r*Math.cos(a)*.97,CY+y,zL+r*Math.sin(a)*.97],null,ring?.36:.44,cLens);}}
 hykPut('hkNacre',hykLathe({H:4.5,yBase:CY+CH-.4,cx:0,cz:zL,rFn:y=>.7*Math.pow(1-y/4.5,.8)+.04,nu:16,nv:10,flute:{n:7,amp:.14,sharp:1.3},twist:.9,col:cNac}));
 hykPut('hkNacre',hykLathe({H:1.5,yBase:yL,cx:0,cz:zL,rFn:y=>.85-.3*(y/1.5)+.06*Math.sin(y*9),nu:20,nv:8,col:cNac}),true);   // the pedestal
 const beacon=hykLight(0,yL+1.5+1.05,zL,{r:1.0,nacre:true,level:o.level,kind:'beacon',bracket:[0,yL+1.5,zL]});
 // ---- the stair: a helix up the chamber's wall, arriving through the gallery's opening beside the drum
 hykTideHelix(0,cz,rIn,floorY,yL,hxTop,hxDir,1.2,{col:cBone,rail:'in',inside:true});
 // ---- the landing in front of the door, on a rib from the face. Drawn in the LOCAL frame (hykPad through hykPut and
 // kput takes the group transform); its deck record and the host's landing are set to world coordinates here.
 const padY=door.p[1]-door.r*door.ky+.12,padZ=door.p[2]+2.7,padR=3.0;
 hykPad(0,padY,padZ,padR,{col:cShell,own:o.host.n,rail:{a0:-Math.PI/2,gap:1.35,col:cBone}});
 {const w=hykW(0,padY,padZ);const dk=NAV_EXTRA[NAV_EXTRA.length-1];if(dk&&dk.kind==='pad')Object.assign(dk,{x0:w[0]-padR,z0:w[2]-padR,x1:w[0]+padR,z1:w[2]+padR,y:w[1]});o.host.landings.push({x:w[0],y:w[1],z:w[2],r:padR,level:o.level,a:o.a});}
 hykPut('hkBone',hykRib([0,-3.6,.1],[0,padY-.45,padZ],{rise:-1.4,r0:.4,r1:.28,knuckles:3,col:cBone}));
 // ---- lamps: at the door on the shell, two on the gallery rail, one inside by the way in
 {const u=((.34/TAU)%1+1)%1,v=clamp(.34/Math.PI+.5,.02,.98);const s=pod.surf(u,v);const Sp=[s[0],s[1],s[2]+cz];const vl=Math.hypot(Sp[0],Sp[1]-cy,Sp[2]-cz)||1;hykLight(Sp[0]+Sp[0]/vl*.5,Sp[1]+(Sp[1]-cy)/vl*.5+.12,Sp[2]+(Sp[2]-cz)/vl*.5,{r:.2,nacre:true,level:o.level,bracket:Sp});}
 for(const a of [Math.PI/4,3*Math.PI/4]){const r=RG-.45;hykLight(r*Math.cos(a),yL+1.5,zL+r*Math.sin(a),{r:.2,nacre:true,level:o.level,bracket:[r*Math.cos(a),yL+1.15,zL+r*Math.sin(a)]});}
 {const u=(((Math.PI+.5)/TAU)%1+1)%1,v=clamp(.5/Math.PI+.5,.02,.98);const s=pod.surf(u,v,.93);const Sp=[s[0],s[1],s[2]+cz];const vl=Math.hypot(Sp[0],Sp[1]-cy,Sp[2]-cz)||1;hykLight(Sp[0]-Sp[0]/vl*.5,Sp[1]-(Sp[1]-cy)/vl*.5,Sp[2]-(Sp[2]-cz)/vl*.5,{r:.18,cool:true,level:o.level,bracket:Sp});}
 // ---- the beam, hung on the beacon under the building's group, and its tick
 const beam=new THREE.Group();beam.position.set(0,beacon?yL+1.5+1.05:yL+2.5,zL);beam.userData.probeSkip=true;beam.add(hykPharosBeam(110,4.2));G.add(beam);
 // Travis (Oct 5 2026): the beam clear of the tower: when the crown stands under the spire's top, the beam is hoisted to
 // 6 m over the spire's finial (rec.spireY, else the host's top), straight up from the crown on a nacre mast from the
 // lantern's finial, so it sweeps over the spire, not through it
 {const rec=o.host&&o.host.rec;const top=rec?(rec.spireY!=null?rec.spireY:rec.top):null;if(top!=null){G.updateMatrixWorld(true);const bw=new THREE.Vector3();beam.getWorldPosition(bw);
  if(bw.y<top+5){const t=G.worldToLocal(new THREE.Vector3(bw.x,top+6,bw.z));const f=[0,CY+CH+4.0,zL];
   hykPut('hkNacre',hykTube([f,[(f[0]+t.x)/2,(f[1]+t.y)/2,(f[2]+t.z)/2],[t.x,t.y,t.z]],u=>.5-.25*u,{seg:8,col:cNac}));
   for(let i=1;i<=3;i++){const u=i/4;hykPut('hkNacre',hykDisc(f[0]+(t.x-f[0])*u,f[1]+(t.y-f[1])*u,f[2]+(t.z-f[2])*u,1.1,{col:cNac,lobes:{n:5,amp:.1},sag:.1,nu:12}));}   /* three collars up the mast */
   beam.position.copy(t);}}}
 let ang=rng()*TAU;const mat=beam.children[0].material;
 window.YS_TICKS=window.YS_TICKS||[];window.YS_TICKS.push(function(dt){ang+=(dt||.016)*TAU/5;beam.rotation.y=ang;mat.opacity=(typeof YS_NIGHT!=='undefined'&&YS_NIGHT)?.55:.2;});
 // ---- rooms and spots: the keeper's chamber (clear of the stair's foot on the left), the lantern room
 const poly=[];for(let i=0;i<16;i++){const a=i/16*TAU;poly.push([A*.8*Math.cos(a),cz+C*.8*Math.sin(a)]);}
 const doors=[[door.p[0],door.p[2],2.4,'landing']];if(back)doors.push([back.p[0],back.p[2],2.4,'host']);
 const room=hykRoom('hall',poly,floorY,B*1.3,{doors,wealth:.95});
 hykSpot(room,'work',3.6,cz+1.0,Math.PI/2,1.4,.8);hykSpot(room,'store',3.2,cz-3.6,Math.PI/2,1.2,.7);hykSpot(room,'seat',-1.4,cz+2.0,0,1.2,.9);
 const lant=hykRoom('hall',hykCirclePoly(0,zL,LR*.88,12),yL+.02,LH-.4,{wealth:.95});hykSpot(lant,'work',2.3,zL-.4,-Math.PI/2,1.2,.8);
 hykReg('The Pharos crown',0,cz,RG+3.5,yL+LH+CH+4.5);}
HYK.def({key:'hyk_pharos_crown',name:'The Pharos crown',family:'civic',row:'Civic',grown:true,into:true,w:15,d:19,h:21,landmark:true,inside:true,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:buildHykPharosCrown});
