// ---------------------------------------------------------------- v4: concrete, brick, glass panes
// Board-formed concrete: horizontal boards ~0.65 m deep, each poured a shade
// different, with the joint standing proud, a form-tie hole grid, a rust weep
// below each tie, and damp running down from every joint.
const BOARD=42;
TEX.concrete=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const bi=Math.floor(y/BOARD),fy=y%BOARD;
  let v=186+(h3(bi*3.1,0,2.2)-.5)*13;                       // board-to-board pour variation
  v+=(fbm(x/40,y/40,5.5,3)-.5)*24;                          // slow blotching
  v+=(fbm(x/4,y/4,8.1,1)-.5)*13;                            // aggregate speckle
  v+=Math.sin(x/9+bi*2.1)*2.2;                              // grain of the board itself
  if(fy<2)v-=46; else if(fy<4)v-=15; else if(fy>BOARD-3)v+=9;   // joint groove + lit lip
  const tx=(x+28)%128,ty=y%(BOARD*2),td=Math.hypot(tx-64,ty-BOARD);
  if(td<3.4)v-=44; else if(td<5)v-=16;                      // recessed form-tie hole
  if(td<10&&ty>BOARD)v-=clamp((10-td)/10,0,1)*15;           // rust weep below it
  v-=clamp((fbm(x/26,y/200,2.2,2)-.52)*4,0,1)*clamp(fy/BOARD*1.3,0,1)*30;   // damp under the joint
  d[i]=v;d[i+1]=v-2;d[i+2]=v-7;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.concreteRM=rmTex(256,256,(x,y)=>{const B=BOARD/2,fy=y%B;
 let r=.90+(fbm(x/20,y/20,4.1,2)-.5)*.10;
 if(fy<1)r=.97;                                             // the joint holds dirt
 return[clamp(r-clamp((fbm(x/13,y/100,2.2,2)-.52)*4,0,1)*clamp(fy/B*1.3,0,1)*.24,0,1),0];});
// Brick in common bond: five stretcher courses, then a header course. The old
// map was a plain running bond of randomly-toned rectangles with the background
// showing through as "mortar".
TEX.brick=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const CH=16,MJ=2.5;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const course=Math.floor(y/CH),header=(course%6)===5,BW=header?16:32;
  const off=header?((course%2)?8:0):((course%2)*BW/2);
  const bx=(x+off)%BW,by=y%CH,grain=(fbm(x/3,y/3,9.9,1)-.5);
  let r,gg,b;
  if(bx<MJ||by<MJ){const m=176+(fbm(x/5,y/5,7.7,1)-.5)*16;r=m;gg=m-4;b=m-10;}   // mortar
  else{const t=h3(Math.floor((x+off)/BW)*1.3,course*2.7,4.4);
   r=118+t*46+grain*16;gg=70+t*28+grain*10;b=54+t*22+grain*8;
   if(Math.min(bx-MJ,BW-1-bx,by-MJ,CH-1-by)<1.5){r*=.9;gg*=.9;b*=.9;}}          // arris shadow
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.concrete=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd2cec6,roughness:1,metalness:0,side:DS});
MAT.concreteR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7c746c,roughness:1,metalness:0,side:DS});
MAT.brick=new THREE.MeshStandardMaterial({map:TEX.brick,color:0xffffff,roughness:.95,metalness:0,side:DS});
const CONC=d=>d>0?MAT.concreteR:MAT.concrete;
kdef('boxC',new THREE.BoxGeometry(1,1,1),MAT.concrete);kdef('boxCR',new THREE.BoxGeometry(1,1,1),MAT.concreteR);
kdef('brick',new THREE.BoxGeometry(1,1,1),MAT.brick);
kdef('pane',new THREE.BoxGeometry(1,1,.12),MAT.glass);kdef('paneD',new THREE.BoxGeometry(1,1,.12),MAT.winDead);
kdef('slabC',new THREE.CylinderGeometry(1,1,1,48),MAT.concrete);kdef('slabCR',new THREE.CylinderGeometry(1,1,1,48),MAT.concreteR);
const BOXC=d=>d>0?'boxCR':'boxC', SLABC=d=>d>0?'slabCR':'slabC';
function se(th,n){return 1/Math.pow(Math.pow(Math.abs(Math.cos(th)),n)+Math.pow(Math.abs(Math.sin(th)),n),1/n);}
// Only a TOPPLED tower (d===2) is cut at cutY; every other level stands at full
// height. The test used to be `d<2`, which sent decay 3 down the toppled branch
// without the fallen upper body that is the only reason to cut it, so every
// rehabilitated tower was a three-storey stump. `stand` predates the fix (the
// Projects, decay 4, pass it) and is now redundant but harmless.
function bodyGroup(G,y0,d,dd,build,cutY,topR,stand){const P=new THREE.Group();P.position.set(0,y0,0);G.add(P);useGroupXF(P);if(d!==2||stand)build(P,dd,y0,null,false);else build(P,1,y0,cutY,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,cutY,topR,(U)=>build(U,1,cutY,null,true),d,1,null,(U,a,b)=>build(U,1,a,b,b==null));}

// ================================================================= SKYSCRAPER D — "the Monolith" (bare concrete, Torre Velasca head)
// DECAY 4 IS "PROJECT D": rehabilitated and still standing, the same idea as
// Project A in src/52-sky-abc.js. The Monolith has no window cells at all — its
// openings are a glazed ribbon in the recess of every twelfth metre — so its
// fire grid is 28 bays x one storey per ribbon, and it burns the RIBBON rather
// than individual panes. The mask itself is the shared one (fireMask).
function buildSkyD(scene,gx,gz,d){reseed(9130+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark();
 const H=340,Y0=14;REGISTER({name:(PROJ?'Project D — the Monolith reoccupied whole (rehabilitated)':'Skyscraper D — the Monolith ('+(d===2?'toppled':STATE(d))+')'),x:0,z:0,r:120,h:H+20});
 // PLINTH. Nothing at all stands on this podium except the tower: the shell at
 // its foot is rFn(14)*se(th,3.2) = 34 m at the corners of the superellipse and
 // the lift-core spine reaches 32. 110 was more than three times the building.
 // 48 puts skyPlinth's column ring at 44.6, clear of both.
 const PR=48;
 skyPlinth(G,dd,PR);
 const rFn=y=>{const t=clamp(y/H,0,1);return 30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.76:null);const L=(cut!=null?cut:H)-y0;let hole=holeFn(dx,47+(upper?1:0),cut!=null?L:null,1.2);if(d===1&&!upper)hole=skyScarHole(hole,.3,.13,L*.38,L,47);   // the collapse scar (52-sky-abc.js)
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const fy=((y+y0)%12)/12;const rec=fy>.62&&fy<.92?.94:1;const r=rFn(y+y0)*se(th,3.2)*rec;return[r*Math.cos(th),y,r*Math.sin(th)];},96,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){
   // the cut section, as fixed on Skyscraper A: the lining takes the SAME hole
   // predicate as the outer skin (it had none, so it stood behind every tear
   // and hid the floors) at a grid fine enough to line up with it, and the
   // plates are pale with a dark soffit instead of dark on dark
   mesh(lathe({rFn:y=>rFn(y+y0)*.86,H:H-y0,cut:cut!=null?L:null,jag:6,nu:64,nv:Math.max(8,Math.round(L/6)),hole,seed:47}),MAT.guts,P);
   for(let y=6;y<L-2;y+=6){const rp=rFn(y+y0);
    kput('slab',[0,y,0],null,[rp*.9,.6,rp*.9],new THREE.Color(0xbdb7ad));
    kput('slab',[0,y-1.3,0],null,[rp*.87,.7,rp*.87],new THREE.Color(0x191b1f));}
   skyRooms({rFn:y=>rFn(y+y0)*.84,y0:6,y1:L-2,step:6,soff:1.3,hole,d,seed:47});}   // interiors behind the openings (52-sky-abc.js)
  const NB=28,burns=PROJ?fireMask('D',NB,Math.ceil(L/12),9134,9):null;
  const dRib=[];   // the ruined ribbons merge; the intact ones are glass, which does not
  for(let y=12-((y0)%12);y<L-4;y+=12){const yy=y+y0;const r0=rFn(yy)*.95; // glass ribbon in each recess
   if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2);return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{}),MAT.glass,P);
   else dRib.push(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2)*.98;return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{hole:(u,v)=>hole&&hole(u,y)}));
   if(PROJ){const sy=Math.round(y/12);
    for(let k=0;k<NB;k++){const u=(k+.5)/NB,th=u*TAU;if(hole&&hole(u,y))continue;
     if(!burns(k,sy))continue;
     const r=r0*se(th,3.2)+.15,nrm=[Math.cos(th),0,Math.sin(th)];
     fireWindow([r*Math.cos(th),y+9.2,r*Math.sin(th)],nrm,qFacing(nrm),TAU*r/NB*.8,3.2);}}
   else if(((yy/12)|0)%3===0&&!(d===1&&!upper&&y>L*.38))stripRing(0,y+9,0,r0*.9,dx,28);}
  meshMerged(dRib,MAT.dark,P);
  // the floors behind the ribbon burn too, so the fire shows through the tears
  if(PROJ)for(let y=12,sy=1;y<L-8;y+=12,sy++){if(!burns.raw((sy*5)%NB,sy))continue;if(rng()<.45)continue;
   const th=((sy*5)+.5)/NB*TAU+rr(-.1,.1),r=rFn(y+y0)*se(th,3.2)*rr(.35,.7);
   firePit('D',r*Math.cos(th),Math.floor((y+6)/6)*6+.6,r*Math.sin(th),rr(1.6,3));}
  // lift-core spine on +x, Velasca props under the head
  kput(BOXC(dx),[rFn(y0+L*.5)*.9+2.5,L/2,0],null,[5,L,9],null);
  if(cut==null){const yh=H*.84-y0;for(let k=0;k<16;k++){const th=(k+.5)/16*TAU;const r1=rFn(H*.8)*se(th,3.2),r2=rFn(H*.9)*se(th,3.2)*1.02;
    beam(dx>0?'strutR':'strutW',[Math.cos(th)*r1*.98,yh-14,Math.sin(th)*r1*.98],[Math.cos(th)*r2,yh+8,Math.sin(th)*r2],2.4,2);}
   mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(rFn(H)+1.2)*se(th,3.2)*(1-v*.02);return[r*Math.cos(th),L+v*4,r*Math.sin(th)];},96,1,{uS:16}),CONC(dx),P);
   kput(BOXC(dx),[0,L+2,0],null,[rFn(H)*1.9,.8,rFn(H)*1.9],null);
   for(let k=0;k<6;k++){const a=k/6*TAU;kput(BOXC(dx),[Math.cos(a)*14,L+7,Math.sin(a)*14],qEuler(0,-a,0),[3,10,8],null);}
   if(dx===0)mesh(lathe({rFn:y=>9*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:6}),MAT.glass,P,0,L+4,0);}};
 bodyGroup(G,Y0,d,dd,build,Y0+60,rFn(Y0+60),PROJ);
 if(dd>0)vinesOnRing(0,Y0+12,0,rFn(Y0)*1.0,30,20);
 // Project D's exposed decks: the Velasca head's cap slab at the top, which is
 // the one floor on this building open to the sky, and the podium.
 if(PROJ){const hy=Y0+(H-Y0)+2.6;
  for(let k=0;k<6;k++){const a=rng()*TAU,r=rFn(H)*rr(.25,1.5);firePit('D',r*Math.cos(a),hy,r*Math.sin(a),rr(1.8,3.4));}
  for(let k=0;k<8;k++){const a=rng()*TAU,r=rr(34,PR*.9);firePit('D',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.6,3));}}
 if(d===3)skyHoist((y,a)=>rFn(y)*se(a,3.2),H-4,5,9130);
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 figures(-PR,PR*1.28,6,6);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}

// ================================================================= SKYSCRAPER E — "the Sail" (shaped glass lens, diagrid, twisting)
// NON-GROUND PLACEMENT. gy lifts the whole tower, noPlinth drops the ground
// plinth and apron, and hcut (decay 1) cuts the body at that fraction of H
// instead of 0.8. kput adds all three components of KOFF and bodyGroup already
// routes the instanced pieces through useGroupXF, so lifting both KOFF and the
// group moves merged meshes and instances together. See buildPerch for a
// worked example -- a tower standing on a podium 90 m up.
function buildSkyE(scene,gx,gz,d,gy,noPlinth,hcut){reseed(9140+d);gy=gy||0;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=360,Y0=10;REGISTER({name:'Skyscraper E — the Sail ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:120,h:H+40});
 // PLINTH. The lens is 68 m across its long axis (aF(0)=34) and 26 deep; its
 // concrete edge fins add 3. Nothing else reaches the podium. 105 was a circle
 // three times the width of the building it carried; 48 puts the column ring at
 // 44.6, just outboard of the fins.
 const PR=48;
 if(!noPlinth)skyPlinth(G,dd,PR);
 const aF=y=>34*(1-.45*Math.pow(clamp(y/H,0,1),1.3)),bF=y=>13*(1-.3*clamp(y/H,0,1)),rot=y=>.8*clamp(y/H,0,1);
 const PT=(u,y,s)=>{const a=aF(y),b=bF(y),r=rot(y);const x=(u-.5)*2*a,z=s*b*(1-Math.pow(u*2-1,2));return[x*Math.cos(r)-z*Math.sin(r),y,x*Math.sin(r)+z*Math.cos(r)];};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.82:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.8,57+(upper?1:0),cut!=null?L:null,1.5);
  for(const s of [-1,1]){if(dx===0)mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0],v*L,p[2]];},40,Math.round(L/6),{}),MAT.glass,P);
   else mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0]*.93,v*L,p[2]*.93];},40,Math.round(L/6),{hole:(u,v)=>hole&&hole(u+s,v*L)}),MAT.guts,P);
   // diagrid mullions
   const step=12;for(let y=0;y<L-1;y+=step){const y2=Math.min(y+step,L);for(let j=0;j<8;j++){const u1=j/8,u2=(j+1)/8;if(dx>0&&hole&&hole((u1+u2)/2+s,y))continue;
    const A=PT(u1,y+y0,s),B=PT(u2,y2+y0,s),C=PT(u2,y+y0,s),D=PT(u1,y2+y0,s);
    beam(dx>0?'strutR':'strutW',[A[0],y,A[2]],[B[0],y2,B[2]],1.1,.9);beam(dx>0?'strutR':'strutW',[C[0],y,C[2]],[D[0],y2,D[2]],1.1,.9);}}}
  // concrete edge fins and floor slabs
  for(let y=0;y<L;y+=8){const y2=Math.min(y+8,L);const A=PT(0,y+y0,1),B=PT(0,y2+y0,1),C=PT(1,y+y0,1),D=PT(1,y2+y0,1);
   beam(BOXC(dx),[A[0],y,A[2]],[B[0],y2,B[2]],3.5,6);beam(BOXC(dx),[C[0],y,C[2]],[D[0],y2,D[2]],3.5,6);}
  for(let y=4;y<L-1;y+=4){const yy=y+y0;if(hole&&rng()<.15*dx)continue;kput('slab',[0,y,0],qEuler(0,-rot(yy),0),[aF(yy)*.95,.35,bF(yy)*.92],new THREE.Color(dx>0?0x2a2c30:0x8a8f98));if(y%24===4)stripRing(0,y+1.5,0,bF(yy)*.6,dx,12);}
  if(cut==null){for(const uu of [0,1]){const A=PT(uu,H,1);beam(BOXC(dx),[A[0],L,A[2]],[A[0]*1.1,L+34,A[2]*1.1],3,5);}
   if(dx===0){mesh(gridSurface((u,v)=>{const p=PT(u,H,1);const q=PT(u,H,-1);const z=lerp(q[2],p[2],v),x=lerp(q[0],p[0],v);return[x,L+.5,z];},20,6,{}),MAT.glass,P);kput('finial',[0,L+36,0],null,[3,6,3],null);}}};
 bodyGroup(G,Y0,d,dd,build,Y0+70,aF(Y0+70));
 if(!noPlinth)figures(-PR,PR*1.28,6,6);
 KOFF=[0,0,0];return G;}

// ================================================================= ROBOTICS FACTORY — "the Assembler"
// THE ROBOT CHASSIS (QA pass 2026-09-29). The test yard's six machines were a
// box, a smaller box and four tubes. Each is now a legged frame: feet, shins,
// thighs, a pelvis, a tapered six-sided torso, a shoulder yoke, two arms with
// clamps, a sensor head; dark actuators at the joints. Built once as merged
// geometry and instanced (civDef): one draw call for all six.
// `arm` false drops the left arm. Feet at y=0, facing +z. The joints are 'tube'
// instances placed by the yard loop.
function civMergeGeo(geos){let nv=0,ni=0;for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
 for(const g of geos){const c=g.attributes.position.count;P.set(g.attributes.position.array,vo*3);N.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)U.set(g.attributes.uv.array,vo*2);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}vo+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.setIndex(new THREE.BufferAttribute(I,1));return G;}
function civRobotGeo(arm){const B=(w,h,dp,x,y,z,rx)=>{const g=new THREE.BoxGeometry(w,h,dp);if(rx)g.rotateX(rx);return g.translate(x,y,z);};
 const g=[];
 for(const s of [-1,1]){g.push(B(2.6,1,4.2,s*2.2,.5,.7),B(1.8,3.6,2.1,s*2.2,2.6,.2,-.08),B(2.3,3.8,2.5,s*2.1,6.2,0,.1));}
 g.push(B(6.2,1.8,3.2,0,8.6,0));
 g.push(new THREE.CylinderGeometry(3.3,2.4,4.6,6).scale(1,1,.72).translate(0,11.5,0));
 g.push(B(9.8,1.6,3.2,0,13.9,0),B(3.8,.8,2.6,0,12.8,1.6));
 for(const s of [-1,1]){if(s<0&&!arm)continue;g.push(B(1.7,4,1.9,s*5.3,12.6,0),B(1.5,3.8,1.7,s*5.3,9,1.2,-.35),B(1.9,1.4,2,s*5.3,6.9,2.2),B(.5,1.4,.5,s*5.3+.6,5.7,2.6),B(.5,1.4,.5,s*5.3-.6,5.7,2.6));}
 g.push(new THREE.CylinderGeometry(1.7,2.1,2.4,8).translate(0,15.8,0),B(2.8,.7,1.2,0,15.9,1.8),B(.3,2.4,.3,1.2,17.9,-.5));
 return civMergeGeo(g);}
function buildRobotics(scene,gx,gz,d){reseed(9210+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Robotics factory — the Assembler ('+STATE(d)+')',x:0,z:0,r:230,h:90});
 kput(BOXC(d),[0,2,0],null,[400,4,300],null);
 // main hall: concrete shell with a north-light sawtooth roof of shaped glass
 const HW=200,HD=90,HH=22;
 if(d===0){kput(BOXC(d),[-40,4+HH/2,0],null,[HW,HH,HD],null);kput('boxD',[-40,4+HH/2,0],null,[HW-2,HH-2,HD-2],null);}
 else{// RUIN: the hall is a shell - four walls under the holed roof - and what the
  // holes show is the assembly floor: three conveyor lines, the machines along
  // them, travelling gantries overhead, and the dark of the far wall.
  for(const sz of [-1,1])kput(BOXC(d),[-40,4+HH/2,sz*(HD/2-.8)],null,[HW,HH,1.6],null);
  for(const sx of [-1,1])kput(BOXC(d),[-40+sx*(HW/2-.8),4+HH/2,0],null,[1.6,HH,HD],null);
  kput('boxD',[-40,4+HH-1,0],null,[HW-3,.6,HD-3],null);
  for(const lz of [-24,0,24]){kput('boxD',[-40,5.2,lz],null,[HW-24,1.6,4],null);
   for(let x=-128;x<=48;x+=16){const hh=h3(x,lz,1405);if(hh<.25)continue;const sd=hh<.6?1:-1;
    kput(BOXC(d),[x,6,lz+sd*5],null,[4,3.2,4],null);beam('tube',[x,7.6,lz+sd*5],[x+2,13,lz+sd*2.5],1.1,1.1);beam('tube',[x+2,13,lz+sd*2.5],[x+1,9,lz+.5],.8,.8);
    if(hh>.8)kput('boxD',[x+4,8.2,lz],qEuler(0,hh*3,rr(-.2,.2)),[5,4,3],null);}}
  for(let x=-120;x<=40;x+=40){kput(d>0?'strutR':'strutW',[x,4+HH-3,0],null,[1.6,1.6,HD-4],null);kput('boxD',[x,4+HH-5,rr(-30,30)],null,[3,3,4],null);}}
 const NB=8,roofs=[],darks=[];   // the eight bays' roofs (and ruined glazing) merged: 16 meshes -> 2
 for(let b=0;b<NB;b++){const z0=-HD/2+b*(HD/NB),z1=z0+HD/NB;const gone=d>0&&(b===2||b===5);
  const roof=gridSurface((u,v)=>{const x=-40-HW/2+u*HW;const zz=lerp(z0,z1,v);const y=4+HH+(1-v)*9*(1-.15*Math.pow(u*2-1,2));return[x,y,zz];},40,6,{uS:20,vS:2,hole:holeFn(d*.7,1400+b,null,2)});roofs.push(roof);
  if(!gone&&d===0)mesh(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,4,{}),MAT.glass,G);
  else if(!gone)darks.push(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,2,{hole:(u,v)=>fbm(u*8,b,1410,2)<.4}));
  for(let k=0;k<=10;k++){const x=-40-HW/2+k*HW/10;kput(d>0?'mullR':'mullW',[x,4+HH+4.5,z0+.3],null,[1,9,1],null);}}
 meshMerged(roofs,CONC(d),G);meshMerged(darks,MAT.dark,G);
 for(let k=0;k<13;k++){const x=-40-HW/2+k*HW/12;kput(BOXC(d),[x,4+HH/2,HD/2+.6],null,[2.2,HH,2],null);kput(BOXC(d),[x,4+HH/2,-HD/2-.6],null,[2.2,HH,2],null);
  if(k%3===1){kput('archOpen',[x+8,10,HD/2+1.5],qFacing([0,0,1]),[1.4,1.2,2],null);}}
 for(let k=0;k<6;k++){const x=-120+k*32;const lit=d>0?rng()<.15:true;kput('strip',[x,4+HH-1,0],qEuler(0,Math.PI/2,0),[70,1,1],lit?CYAN:DEAD);}
 // vertical assembly tower: fluted concrete drum with open bays, gantry arm
 const tx=110,tz=-40,TH=70,tcut=d>0?TH*.85:null;
 mesh(lathe({rFn:y=>24+3*Math.sin(y*.3),H:TH,cut:tcut,jag:tcut?3:0,flutes:10,amp:.12,sharp:1.5,nu:64,nv:36,hole:(u,y)=>(Math.abs(((u*10)%1)-.5)<.22&&((y%14)>4&&(y%14)<12)&&y>8)||(holeFn(d*.7,1420,tcut,1.5)||(()=>false))(u,y)}),CONC(d),G,tx,4,tz);
 mesh(lathe({rFn:()=>20,H:TH,cut:tcut,jag:3,nu:24,nv:4}),MAT.dark,G,tx,4,tz);
 for(let y=12;y<(tcut||TH)-6;y+=14)for(let k=0;k<10;k++){const th=(k+.5)/10*TAU;const r=21;kput('boxD',[tx+r*Math.cos(th),4+y+2,tz+r*Math.sin(th)],qEuler(0,-th,0),[6,.6,10],null);
  const lit=d>0?rng()<.15:true;kput('strip',[tx+r*Math.cos(th),4+y+7,tz+r*Math.sin(th)],qEuler(0,-th,0),[5,1,1],lit?WARM:DEAD);}
 if(!tcut){kput(SLABC(d),[tx,4+TH+.4,tz],null,[27,.8,27],null);beam(d>0?'strutR':'strutW',[tx,4+TH,tz],[tx-60,4+TH+6,tz+40],3,3);kput('tube',[tx-50,4+TH+5-20,tz+33.3],null,[.4,40,.4],null);kput('boxD',[tx-50,4+TH+5-41,tz+33.3],null,[3,2.2,3],null);}
 else rubbleRing(tx,4,tz,26,50,50,3);
 // overhead conveyor from tower to hall
 for(let k=0;k<4;k++){const x=70-k*30;kput(d>0?'colR':'colW',[x,4,10],null,[1.2,26,1.2],null);}kput(d>0?'pipeR':'pipe',[40,31,10],qEuler(0,0,Math.PI/2),[2.2,150,2.2],null);
 // test yard: six mount frames (giant robot chassis on stands)
 for(let i=0;i<6;i++){const x=-140+i*50,z=110;const gone=d>0&&(i===1||i===4);kput(SLABC(d),[x,4.6,z],null,[14,1.2,14],null);
  if(gone){rubbleRing(x,5,z,2,12,20,1.6);continue;}const q=qEuler(0,rr(-.4,.4),d>0?rr(-.15,.15):0);
  // mount frame behind the machine, the machine, its actuators
  kput(BOXC(d),[x,12,z-3.4],null,[3,14,1.6],null);kput(BOXC(d),[x,13.9,z-2.2],null,[5,1.2,1.8],null);
  // body: one InstancedMesh per finish (kit meshes are never culled, so every
  // new one is a draw call in every view); actuators are the shared 'tube'
  const bn=civDef('civRobot'+(d>0?'R':'W'),()=>civRobotGeo(true),d>0?MAT.rust:MAT.white);
  kput(bn,[x,5.2,z],q,1,null);const qj=q.clone().multiply(qEuler(0,0,Math.PI/2));
  for(const j of [[2.1,8.2,0,1.2,2.6],[-2.1,8.2,0,1.2,2.6],[2.2,4.3,.2,1.1,2.2],[-2.2,4.3,.2,1.1,2.2],[5.3,10.6,.4,.9,2],[-5.3,10.6,.4,.9,2],[0,13.3,0,1.4,3.6]]){
   const o=new THREE.Vector3(j[0],j[1],j[2]).applyQuaternion(q);kput('tube',[x+o.x,5.2+o.y,z+o.z],qj,[j[3],j[4],j[3]],null);}
  const lit=d>0?rng()<.2:true;const vp=new THREE.Vector3(0,15.9,2.45).applyQuaternion(q);kput('dot',[x+vp.x,5.2+vp.y,z+vp.z],q,[2,.5,.4],lit?CYAN:DEAD);}
 for(let k=0;k<5;k++){const x=-165+k*50;kput(BOXC(d),[x,17,104],null,[2,26,2],null);}kput(BOXC(d),[-40,30.5,104],null,[250,1.6,3],null);
 for(let k=0;k<3;k++){const x=-125+k*80;kput(BOXC(d),[x,30.5,110],null,[3,1.2,14],null);kput('tube',[x,26,116],null,[.25,9,.25],null);kput('boxD',[x,21.2,116],null,[2,1,2],null);}
 // silos of parts, loading dock
 for(let i=0;i<4;i++){const x=-170,z=-90+i*30;mesh(lathe({rFn:y=>7*(1-.05*Math.pow(y/24,6)),H:24,nu:24,nv:6,hole:holeFn(d*.7,1430+i,null,2.5)}),skin,G,x,4,z);kput(d>0?'ringR':'ringW',[x,28,z],qEuler(Math.PI/2,0,0),[7.3,7.3,2],null);}
 kput(BOXC(d),[-40,5.5,-HD/2-14],null,[HW*.6,3,14],null);for(let k=0;k<6;k++)kput('archOpen',[-100+k*24,10,-HD/2-.8],qFacing([0,0,-1]),[.9,.9,1.5],null);
 if(d>0){scatterMoss(0,4,0,0,190,150,2.4);rubbleRing(-40,4,0,30,150,60,2.2);trees(0,0,210,290,22);vinesOnRing(-40,4+HH,0,HD/2,20,10);}
 figures(0,60,5,10);civFlatten(G);KOFF=[0,0,0];return G;}

// ================================================================= DOMESTIC HELPERS (QA round 2, 2026-10-01)
// Glass shards for the domestic group's curtain walls and arched openings,
// which are meshes rather than the kit windows `civWin` wraps. An opening is
// cut into panes (`bays` across, `paneH` up to its own height `hFn(x)`), and
// about `frac` of the panes keep a few teeth of glass, chosen by position
// hash like civWin (no rng draw, so nothing else moves). c is the opening's
// bottom centre, q faces out of it; both in KOFF space.
function domShards(c,q,bays,hFn,paneH,frac){const rt=new THREE.Vector3(1,0,0).applyQuaternion(q);
 for(const b of bays){const H=hFn(b[0]);for(let y=0;y<H-.3;y+=paneH){const ph=Math.min(paneH,H-y);if(ph<.6)continue;
  const p=[c[0]+rt.x*b[0],c[1]+y+ph/2,c[2]+rt.z*b[0]];const h=h3(p[0]*.173+.3,p[1]*.291+.7,p[2]*.117+.1);if(h>frac)continue;
  civShardAt(p,q,b[1]*.94,ph*.94,.06,h);}}}
// Furnishing behind an opening, for the domestic types whose openings looked
// onto a flat dark liner: a ceiling light strip (mostly dead in a ruin), a
// cabinet or machine silhouette against the back, now and then a touch panel
// and a conduit drop. p is a point on the floor just inside the skin, n the
// outward normal, `deep` how far back the room goes, `ht` its height. Kit
// instances only; choice by hash, so no rng draw.
function domRoom(p,n,deep,ht,d,seed){const th=Math.atan2(n[2],n[0]);const hh=h3(p[0]*.071+seed,p[1]*.13,p[2]*.057);
 const at=f=>[p[0]-n[0]*deep*f,p[1],p[2]-n[2]*deep*f];
 const s=at(.45);const lit=d>0?hh<.12:hh<.85;
 kput('strip',[s[0],p[1]+ht-.5,s[2]],qEuler(0,-th-Math.PI/2,0),[Math.min(4,deep*1.6),1,1],lit?(d>0?WARM:CYAN):DEAD);
 if(hh<.6){const w=1+hh*2.4,hg=Math.min(ht-1,1.2+hh*2.2),b=at(.88);kput('boxD',[b[0],p[1]+.2+hg/2,b[2]],qEuler(0,-th,0),[Math.min(deep*.3,1+hh),hg,w],null);}
 if(hh>.78){const on=!(d>0&&hh<.92),b=at(.96);kput(on?'cell':'cellD',[b[0],p[1]+1.5,b[2]],qFacing(n),[.5,.7,1],on?CYAN:null);}
 if(hh>.4&&hh<.5){const b=at(.8);kput('tube',[b[0]+n[2]*.6,p[1]+ht/2,b[2]-n[0]*.6],null,[.2,ht,.2],null);}}

// MOULDING: a bone-like roll swept along a path that lies in a wall (wn is the
// wall's outward normal), thickening into knuckles at the ends and at `knots`
// evenly spaced joints, the way Gaudí's bone-work swells at its joints.
// pathFn(t) -> [x,y,z] for t in 0..1. Returns a geometry for the caller to
// merge into a mesh it already draws, so a moulding costs no draw call.
function domMould(pathFn,wn,r,knots,nu){nu=nu||40;const W=new THREE.Vector3(wn[0],wn[1],wn[2]).normalize();
 const rad=t=>{const e=Math.min(t,1-t);const k=knots?Math.pow(Math.abs(Math.cos(t*Math.PI*knots)),12):0;return r*(1+.55*Math.exp(-e*e*400)+.3*k);};
 return gridSurface((u,v)=>{const p=pathFn(u),q=pathFn(Math.min(1,u+.002)),o=pathFn(Math.max(0,u-.002));
  const T=new THREE.Vector3(q[0]-o[0],q[1]-o[1],q[2]-o[2]).normalize(),B=new THREE.Vector3().crossVectors(T,W).normalize();
  const ph=v*TAU,rr2=rad(u);return[p[0]+rr2*(Math.cos(ph)*W.x+Math.sin(ph)*B.x),p[1]+rr2*(Math.cos(ph)*W.y+Math.sin(ph)*B.y),p[2]+rr2*(Math.cos(ph)*W.z+Math.sin(ph)*B.z)];},nu,8,{});}

