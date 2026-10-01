// ================================================================= SKYSCRAPERS — three variants, d: 0 intact, 1 ruined, 2 toppled
// each variant = plinth(G,d) + body(P,d,y0,y1) in local coords (local y=0 ⇔ absolute y0)
// `dir` is which way the upper body goes down: +1 (default) east, -1 west. It
// matters when a tower shares its plinth with something else — Skyscraper G's
// drum used to fall straight into its own block stack.
function toppledUpper(G,cx,cz,hc,r0,bodyFn,d,dir){const s=dir===-1?-1:1;const U=new THREE.Group();const ang=rr(-.5,.5);
 U.position.set(cx+s*Math.cos(ang)*(r0*1.6),r0*.82,cz+s*Math.sin(ang)*(r0*1.6));U.rotation.set(0,-ang,-s*Math.PI/2*.94);G.add(U);useGroupXF(U);bodyFn(U,1,hc,null,true);endGroupXF();
 rubbleRing(cx+s*Math.cos(ang)*(r0*2),0,cz+s*Math.sin(ang)*(r0*2),r0*.5,r0*3,140,3.5);}
function skyPlinth(G,d,R){mesh(lathe({rFn:()=>R,H:5,nu:96,nv:1}),SHELL(d),G);kput('slab',[0,5,0],null,[R,.6,R],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<48;k++){const th=k/48*TAU,r=R*.93;if(d>0&&rng()<.2)continue;kput(d>0?'colR':'colW',[r*Math.cos(th),5,r*Math.sin(th)],null,[1.8,12,1.8],null);}
 kput(d>0?'ringR':'ringW',[0,17.3,0],qEuler(Math.PI/2,0,0),[R*.94,R*.94,8],null);
 apron(G,0,0,R*1.02,R*1.5,d,1.4);   // graded skirt: the plinth met the ground on a hard line
 if(d>0){mossOnRing(0,5.3,0,R*.85,120,3);vinesOnRing(0,17.3,0,R*.94,40,14);scatterMoss(0,0,0,R+2,R+100,220,3.5);rubbleRing(0,0,0,R+2,R+80,120,3);trees(0,0,R+30,R+160,30);}}
// --- A: the Conocylinder (Soleri Babel IID) ---------------------------------------------------
function buildSkyA(scene,gx,gz,d){reseed(9100+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=420,Y0=64;const rFn=y=>{const t=clamp((y-Y0)/(H-Y0),0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);};
 REGISTER({name:'Skyscraper A — the Conocylinder ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:130,h:H+60});
 skyPlinth(G,dd,120);
 mesh(lathe({rFn:y=>22-4*y/Y0,H:Y0,nu:48,nv:6,hole:holeFn(dd*.5,3,null,1.5)}),skin,G,0,5,0);
 const NS=24;for(let k=0;k<NS;k++){const th=(k+.5)/NS*TAU;const gone=dd>0&&(k===5||k===13||k===19);
  const a=[Math.cos(th)*98,5,Math.sin(th)*98],b=[Math.cos(th)*rFn(Y0)*.96,Y0+6,Math.sin(th)*rFn(Y0)*.96];
  if(!gone)beam(dd>0?'strutR':'strutW',a,b,5.5,4);else{beam('strutR',[a[0],2.6,a[2]],[(a[0]+b[0])/2+rr(-8,8),3.2,(a[2]+b[2])/2+rr(-8,8)],5.5,4);}
  kput(dd>0?'strutR':'strutW',[b[0],b[1]-3,b[2]],qEuler(0,-th,0),[7,9,6],null);}
 kput('slab',[0,Y0+1,0],null,[rFn(Y0)*.97,3,rFn(Y0)*.97],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,Y0+3,0],qEuler(Math.PI/2,0,0),[rFn(Y0),rFn(Y0),10],null);
 const body=(P,dx,y0,y1,upper)=>{const top=y1!=null?y1:H;const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.86:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,7+(upper?1:0),cut!=null?L:null,1.1);
  const oo={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut!=null?10:0,flutes:32,amp:.07,sharp:2.5,nu:160,nv:110,hole,seed:7};
  mesh(lathe(oo),SHELL(dx),P,0,0,0);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.9,H:H-y0,cut:oo.cut,jag:oo.jag,nu:64,nv:40,seed:7}),MAT.guts,P);for(let y=8;y<L-2;y+=8)kput('slab',[0,y,0],null,[rFn(y+y0)*.93,.5,rFn(y+y0)*.93],new THREE.Color(0x2a2c30));
   for(let k=0;k<60;k++){const th=rng()*TAU,yy=rr(10,L-10),r=rFn(yy+y0)*.86;kput('pipeR',[r*Math.cos(th),yy,r*Math.sin(th)],null,[.5,rr(8,30),.5],null);}}
  for(let y=6;y<L-14;y+=4.2){for(let k=0;k<32;k++){const u=(k+.5)/32;if(hole&&hole(u,y))continue;if(rng()<.1)continue;const th=u*TAU,r=rFn(y+y0)+.1;
   const lit=dx>0?rng()<.03:rng()<.85;kput('cell',[r*Math.cos(th),y,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2.8,2.3,1],lit?WARM.clone().multiplyScalar(rr(.5,1)):(dx>0?DEAD:new THREE.Color(0x14283c)));}}
  for(let yy=25;yy<L-20;yy+=25)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,32);
  [.3,.62].forEach(f=>{const ya=Y0+(H-Y0)*f;const yl=ya-y0;if(yl<8||yl>L-10)return;glassBand(P,y=>rFn(y+y0),yl,7,dx,0,0,0,48);});
  if(cut==null){const NR=32;for(let k=0;k<NR;k++){const th=k/NR*TAU;const r0=rFn(H)*1.02;beam(dx>0?'strutR':'strutW',[Math.cos(th)*r0,L-6,Math.sin(th)*r0],[Math.cos(th)*(r0+25),L-6+41,Math.sin(th)*(r0+25)],3.2,2.4);}
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*(1+.35*y/40)*(1-.15*Math.pow(y/40,3)),H:40,nu:64,nv:12}),MAT.glass,P,0,L-4,0);mesh(lathe({rFn:y=>12*Math.sqrt(clamp(1-Math.pow(y/16,2),0,1)),H:16,nu:32,nv:8}),SHELL(dx),P,0,L+34,0);kput('finial',[0,L+56,0],null,[5,9,5],null);}}
  else if(!upper){for(let k=0;k<32;k++){const th=k/32*TAU;if(rng()<.5)continue;beam('strutR',[Math.cos(th)*rFn(cut)*1.02,L-6,Math.sin(th)*rFn(cut)*1.02],[Math.cos(th)*rFn(cut)*1.3,L-6+rr(8,26),Math.sin(th)*rFn(cut)*1.3],3.2,2.4);}}};
 const P=new THREE.Group();P.position.set(0,Y0,0);G.add(P);useGroupXF(P);
 if(d<2)body(P,dd,Y0,null,false);else body(P,1,Y0,Y0+70,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,Y0+70,rFn(Y0+70),(U,dx,y0)=>body(U,1,Y0+70,null,true),d);
 if(dd>0)vinesOnRing(0,Y0,0,rFn(Y0)*.98,60,40);
 figures(-110,140,7,6);KOFF=[0,0,0];return G;}
// --- B: the Scallop Stack (Goldberg lobes, widening upward) -------------------------------------
function buildSkyB(scene,gx,gz,d){reseed(9110+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=300,NL=12;const rFn=y=>26+10*Math.pow(clamp(y/H,0,1),1.4);const lobe=(th,y)=>rFn(y)*(1+.3*(.5+.5*Math.cos(NL*th)));
 REGISTER({name:'Skyscraper B — the Scallop Stack ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:120,h:H+40});
 skyPlinth(G,dd,110);
 // core + 12 lobed legs spreading out to the plinth
 mesh(lathe({rFn:y=>16,H:30,nu:32,nv:2}),skin,G,0,5,0);
 for(let k=0;k<NL;k++){const th=k/NL*TAU;const gone=dd>0&&(k===3||k===8);const a=[Math.cos(th)*70,5,Math.sin(th)*70],b=[Math.cos(th)*rFn(30)*1.15,32,Math.sin(th)*rFn(30)*1.15];
  if(!gone){kput(dd>0?'colR':'colW',[a[0],5,a[2]],null,[4.5,27,4.5],null);beam(dd>0?'strutR':'strutW',[a[0],31,a[2]],b,5,4);}else rubbleRing(a[0],5,a[2],2,16,30,2.2);}
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.8:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,17+(upper?1:0),cut!=null?L:null,1.5);
  mesh(lathe({rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,flutes:NL,amp:.3,sharp:1,nu:144,nv:60,hole,seed:17}),SHELL(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.85,H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,nu:48,nv:12,seed:17}),MAT.guts,P);for(let y=5;y<L-2;y+=5)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  const bands=[];   // one mesh for the whole stack, not two per storey
  for(let s=0;s*5<L-4;s++){const y=s*5;const bh=dx>0?(u,v)=>fbm(u*10+s,2,18+s,2)<.25*dx:null;
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th,y+y0)*.97,lobe(th,y+y0)*1.1,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},144,2,{hole:bh}));
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lobe(th,y+y0)*1.1;return[r*Math.cos(th),y+3.2+v*1.1,r*Math.sin(th)];},144,1,{uS:30,hole:bh}));
   for(let k=0;k<NL;k++)for(let j=-1;j<=1;j+=2){const th=k/NL*TAU+j*.13;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y))continue;const r=lobe(th,y+y0)+.1;
    kput(dx>0?'winSmD':'winSmI',[r*Math.cos(th),y+2,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2.6,2.2,1],null);}
   if(s%4===0)stripRing(0,y+2.6,0,rFn(y+y0)*.85,dx,36);}
  meshMerged(bands,SHELL(dx),P);
  if(cut==null){const Q=new THREE.Group();Q.position.set(0,L,0);P.add(Q);kput('slab',[0,L,0],null,[rFn(H)*1.1,1,rFn(H)*1.1],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));
   const CX=KXF;useGroupXF(Q);KXF={m:CX.m.clone().multiply(Q.matrix),q:CX.q.clone().multiply(Q.quaternion)};petalRing(Q,NL,rFn(H)*.75,42,16,6,1,0,dx,19,SHELL(dx),dx>0?(i=>i%4===1):null);endGroupXF();/*Iziz: was KXF=CX, which left an entry on the nested-transform stack*/
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.72*Math.pow(clamp(1-Math.pow(y/30,2),0,1),.6),H:30,nu:48,nv:14}),MAT.glass,P,0,L+1,0);kput('finial',[0,L+38,0],null,[4,7,4],null);}}};
 const P=new THREE.Group();P.position.set(0,32,0);G.add(P);useGroupXF(P);if(d<2)body(P,dd,32,null,false);else body(P,1,32,32+55,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,87,rFn(87)*1.3,(U,dx,y0)=>body(U,1,87,null,true),d);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}
// --- C: the Tripod (three hyperboloid legs fusing into one fluted shaft) ---------------------------
function buildSkyC(scene,gx,gz,d){reseed(9120+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=380,YM=150;REGISTER({name:'Skyscraper C — the Tripod ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:130,h:H+30});
 skyPlinth(G,dd,115);
 const legR=y=>15*Math.sqrt(1+1.2*Math.pow((y-YM*.5)/(YM*.5),2));
 for(let k=0;k<3;k++){const th=k/3*TAU+Math.PI/6;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*62,5,Math.sin(th)*62);const tilt=Math.atan2(62-20,YM);Lg.rotation.set(0,-th,0);Lg.rotateZ(tilt);G.add(Lg);useGroupXF(Lg);
  const LL=YM/Math.cos(tilt);mesh(lathe({rFn:legR,H:LL,flutes:10,amp:.1,sharp:2,nu:60,nv:30,hole:holeFn(dd*.8,27+k,null,1.5)}),skin,Lg);
  if(dd>0)mesh(lathe({rFn:y=>legR(y)*.85,H:LL,nu:24,nv:4}),MAT.guts,Lg);
  for(let y=8;y<LL-8;y+=6)for(let j=0;j<10;j++){const u=(j+.5)/10;const a=u*TAU,r=legR(y)+.1;kput(dd>0?'winSmD':'winSmI',[r*Math.cos(a),y,r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[1.6,2.4,1],null);}
  for(let yy=20;yy<LL-10;yy+=30)stripRing(0,yy,0,legR(yy)*.9,dd,20);endGroupXF();}
 // sky bridges between legs
 for(const yb of [60,110]){for(let k=0;k<3;k++){const t1=k/3*TAU+Math.PI/6,t2=(k+1)/3*TAU+Math.PI/6;const r=62-42*yb/YM;const gone=dd>0&&yb===60&&k===1;
  const a=[Math.cos(t1)*r,yb+5,Math.sin(t1)*r],b=[Math.cos(t2)*r,yb+5,Math.sin(t2)*r];if(!gone){beam(dd>0?'strutR':'strutW',a,b,3,4);beam('tube',[a[0],a[1]+2.5,a[2]],[b[0],b[1]+2.5,b[2]],2.6,2.6);}}}
 const rFn=y=>{const t=clamp((y-YM)/(H-YM),0,1);return 34*(1-.35*t)*(1+.12*Math.sin(Math.PI*t));};
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.9:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,37+(upper?1:0),cut!=null?L:null,1.2);
  const o={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?8:0,flutes:15,amp:.22,sharp:3,nu:120,nv:80,hole,seed:37};mesh(lathe(o),SHELL(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.88,H:H-y0,cut:o.cut,jag:o.jag,nu:48,nv:16,seed:37}),MAT.guts,P);for(let y=7;y<L-2;y+=7)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  windowsOnLathe({rFn:y=>rFn(y+y0),hole,cut:o.cut},dx,6,L-14,7,15,0,0,0,false);
  for(let yy=14;yy<L-16;yy+=21)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,24);
  [.35,.7].forEach(f=>{const yl=(H-YM)*f-(y0-YM);if(yl<8||yl>L-10)return;glassBand(P,y=>rFn(y+y0),yl,8,dx,0,0,0,36);});
  if(cut==null){mesh(lathe({rFn:y=>rFn(H)*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12,hole:(u,y)=>Math.cos(u*TAU*15)<.2&&y>3}),SHELL(dx),P,0,L-1,0);
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.95*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12}),MAT.glass,P,0,L-1,0);kput('finial',[0,L+30,0],null,[4,8,4],null);}}};
 kput('slab',[0,YM+4,0],null,[42,4,42],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,YM+6,0],qEuler(Math.PI/2,0,0),[42,42,10],null);
 const P=new THREE.Group();P.position.set(0,YM+6,0);G.add(P);useGroupXF(P);if(d<2)body(P,dd,YM+6,null,false);else body(P,1,YM+6,YM+40,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,YM+40,rFn(YM+40),(U,dx,y0)=>body(U,1,YM+40,null,true),d);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}

