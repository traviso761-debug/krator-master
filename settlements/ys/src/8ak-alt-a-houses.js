// ================================================================= ALT DOMESTIC (1 of 3): helpers, two houses, one apartment block
// From-scratch ALTERNATES of the kit's domestic types, drawn from the user's
// arco1 / arco2 reference sets (targets/alt-domestic/NOTES.md lists the images
// each one draws on). Nothing here is a reproduction of a named building: each
// takes one idea from the references and makes it Ancient.
//
//   THE UNDULANT HOUSE   (adWave)  a three-storey villa whose stone skin rolls
//                        in horizontal waves at every floor line, deep-set
//                        windows, an attic that swells into a roofscape of
//                        twisted chimney cowls.
//   THE BRIDGE HOUSE     (adBridge) a chamfered concrete tube lifted on two
//                        splayed wall-legs, glazed at both ends, with a low
//                        wing and a terrace behind it.
//   THE FIN APARTMENTS   (adFins)  a concave twelve-storey slab whose bays are
//                        divided by tall shark-fin blades that rise past the
//                        roof, with a balcony tray in every bay.
//
// Decay, for every builder in the three 8ak-alt fragments:
//   0 intact · 1 ruined · 2 RECLAIMED (the ruin, overgrown and then lived in by
//   a later people: shacks, tarps, gardens, fire at night) · 3 rehabilitated
//   (standing whole on worn fabric; the scene's HOLES and repairPass do the
//   rest, as for every kit type).
// `brk` = the structure has come down in places (1 and 2). `dd` = the fabric is
// old (1, 2, 3) and drives materials and holes, as everywhere in the kit.
// Seeds 9850-9899: five per builder, `reseed(98x0+d)` / `reseed(98x5+d)`.

// ---------------------------------------------------------------- helpers
// Box-projected UVs in world metres / 8, the kit's tile size, so board-formed
// concrete and panel seams keep their scale on any extruded or boxed shape.
function adUV(g){if(!g.attributes.normal)g.computeVertexNormals();const P=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(P.count*2);
 for(let i=0;i<P.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i)),x=P.getX(i),y=P.getY(i),z=P.getZ(i);
  let u,v;if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}uv[i*2]=u/8;uv[i*2+1]=v/8;}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
// A box for a merge list: centre, size, then optional Euler rotation.
function adBox(acc,cx,cy,cz,sx,sy,sz,ry,rx,rz){const g=new THREE.BoxGeometry(sx,sy,sz);
 if(rx||rz)g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)));else if(ry)g.rotateY(ry);
 g.translate(cx,cy,cz);adUV(g);if(acc)acc.push(g);return g;}
function adShape(pts){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));return s;}
// A vertical prism over a plan polygon [[x,z],...] from y0 to y1, capped.
function adPrism(acc,pts,y0,y1){const g=new THREE.ExtrudeGeometry(adShape(pts.map(p=>[p[0],-p[1]])),{depth:y1-y0,bevelEnabled:false,curveSegments:6});
 g.rotateX(-Math.PI/2);g.translate(0,y0,0);adUV(g);if(acc)acc.push(g);return g;}
// A section [[x,y],...] (optionally with holes) extruded along z from z0 to z1.
function adExtZ(acc,pts,z0,z1,holes){const s=adShape(pts);if(holes)for(const h of holes)s.holes.push(adShape(h));
 const g=new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:6});g.translate(0,0,z0);adUV(g);if(acc)acc.push(g);return g;}
// Rubble banked against a wall along an arc of a plan: `rf(th)` is the wall's
// radius at bearing th; blocks are biggest at the foot and thin outward.
function adRubbleArc(cx,cz,th0,th1,rf,out,n,sMax){for(let i=0;i<n;i++){const th=rr(th0,th1),q=Math.pow(rng(),2),r=rf(th)+q*out,s=rr(.4,sMax)*(1.2-.6*q);
 kput('rubble',[cx+r*Math.cos(th),s*.35+(1-q)*sMax*.4,cz+r*Math.sin(th)],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.32,.55)));}}
// Rubble along a straight foot, from a to b, spilling `out` metres toward n.
function adRubbleLine(a,b,nx,nz,out,n,sMax){for(let i=0;i<n;i++){const t=rng(),q=Math.pow(rng(),2),s=rr(.4,sMax)*(1.2-.6*q);
 kput('rubble',[lerp(a[0],b[0],t)+nx*q*out,s*.35+(1-q)*sMax*.4,lerp(a[1],b[1],t)+nz*q*out],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.32,.55)));}}
// THE RECLAIMED DRESSING (decay 2), the later people's half of the state: it
// runs on the finished ruin, like repairPass, but where repairPass patches a
// building that was put back into use, this is a camp inside one that was not.
// Shacks and gardens stand on the flat surfaces the ruin offers, rain butts and
// planks lie about, cook fires burn on floors (night only: FIREKIT), and a few
// figures. `o.fires` is the builder's own list of openings that burn
// [[x,y,z,nx,nz,w,h],...], because only the builder knows where its windows are.
// `o.minY` keeps the camp up on the structure (0 lets it use the ground too);
// `o.ok(p)` lets a builder say which of its flat surfaces are really floors.
function adReclaim(G,o){o=o||{};const up=upFaces(G,o.up||40,.82),minY=o.minY!=null?o.minY:1.2;
 for(const f of up){const p=f.p;if(p[1]<minY||(o.ok&&!o.ok(p)))continue;const r=rng();
  if(r<.30){const w=rr(2.2,5),hh=rr(2,3.2),dp=rr(2.2,4.5),yaw=rng()*TAU;
   kput('shantyBox',[p[0],p[1]+hh/2,p[2]],qEuler(0,yaw,0),[w,hh,dp],null);
   kput('shantyRoof',[p[0],p[1]+hh+.2,p[2]],qEuler(rr(.08,.24),yaw,0),[w*1.3,1,dp*1.3],null);
   if(rng()<.4)kput('spipe',[p[0]+w*.25,p[1]+hh+1.3,p[2]],null,[.25,2.8,.25],null);}
  else if(r<.52){kput('planter',[p[0],p[1]+.35,p[2]],qEuler(0,rng()*TAU,0),[rr(1.6,4),.7,rr(1,2)],null);
   for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.2,1.2),p[1]+.95,p[2]+rr(-.8,.8)],null,[.8,.55,.8],new THREE.Color().setHSL(rr(.24,.34),.55,rr(.24,.34)));}
  else if(r<.64)kput('waterButt',[p[0],p[1]+1.1,p[2]],null,[1.1,2.2,1.1],null);
  else if(r<.78)firePit('adReclaim',p[0],p[1],p[2],rr(.7,1.3));
  else if(r<.92)kput('plank',[p[0],p[1]+.12,p[2]],qEuler(0,rng()*TAU,0),[rr(2,5),.2,rr(.5,1.2)],null);
  else kput('dot',[p[0],p[1]+1.6,p[2]],qEuler(0,rng()*TAU,0),[1,1,1],WARM);}
 for(const w of (o.fires||[])){const n=[w[3],0,w[4]];fireWindow([w[0],w[1],w[2]],n,qFacing(n),w[5],w[6]);}
 if(o.trees)trees(o.cx||0,o.cz||0,o.trees[0],o.trees[1],o.trees[2]);
 if(o.treeBox)adTreesBox(...o.treeBox);
 if(o.figs)figures(o.cx||0,o.cz||0,o.figs,o.spread||12);}
// A tarp stretched over a break: a sloped patch from a to b (local points),
// `w` wide, with two timber props under its low edge.
function adTarp(a,b,w){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
 const t=new THREE.Vector3(dx,dy,dz).normalize(),side=new THREE.Vector3(-dz,0,dx).normalize(),n=new THREE.Vector3().crossVectors(t,side).normalize();
 if(n.y<0)n.negate();const m=new THREE.Matrix4().makeBasis(side,t,n);
 kput('patchTarp',c,new THREE.Quaternion().setFromRotationMatrix(m),[w,L,1],null);
 const lo=a[1]<b[1]?a:b;for(const s of[-1,1])if(lo[1]>1)beam('plank',[lo[0]+side.x*s*w*.4,0,lo[2]+side.z*s*w*.4],[lo[0]+side.x*s*w*.4,lo[1],lo[2]+side.z*s*w*.4],.22,.22);}
// Trees in a rectangle (local), for sites where a ring round the origin would
// plant them inside the building.
function adTreesBox(x0,x1,z0,z1,n){n=biomeN(n);for(let i=0;i<n;i++){const x=rr(x0,x1),z=rr(z0,z1);VEG.tree(x,terrainH(x+KOFF[0],z+KOFF[2]),z,i%3,rr(6,14));}}
const AD_STATE=['intact','ruined','reclaimed','rehabilitated'];

// ================================================================= THE UNDULANT HOUSE (adWave)
// A villa of three storeys and an attic on a lobed plan 34 x 23 m. The stone
// skin is one surface that swells into a rolling ridge at every floor line, so
// the window heads and sills wave with it; the attic rolls inward into a roof
// carrying six twisted chimney cowls and two stair heads.
// RUIN: the east end has come down — skin bitten to the first floor, the roof
// and top floor gone over that arc, two cowls on the ground, a talus at the foot.
function buildAltWaveHouse(scene,gx,gz,d){reseed(9850+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,stone=CONC(d);
 REGISTER({name:'The Undulant house ('+AD_STATE[d]+')',x:0,z:0,r:22,h:20});
 const A=17,B=11.5,NF=3,FH=3.6,H=NF*FH+.4,NW=26;
 const lob=th=>1+.045*Math.cos(5*th+.6);
 const rho=th=>se(th,2.6)*lob(th);                         // plan scale, unit superellipse
 const plan=(th,off)=>{const s=rho(th),x=A*s*Math.cos(th),z=B*s*Math.sin(th),L=Math.hypot(x,z)||1;return[x+x/L*off,z+z/L*off];};
 const wav=(th,f)=>f<=0?0:.55*Math.sin(th*6+f*1.7)+.22*Math.sin(th*11+f);
 // the collapse: an arc about the east end, jagged
 const fall=th=>{if(!brk)return 0;let a=((th+Math.PI)%TAU+TAU)%TAU-Math.PI;const w=clamp(1-Math.abs(a+.25)/.95,0,1);return w>0?Math.pow(w,.6):0;};
 const topAt=th=>H-fall(th)*(7.6+1.6*(fbm(th*3,1.1,9850,2)-.5));
 const bulge=(th,y)=>{let b=0;for(let f=1;f<=NF;f++){const t=(y-(f*FH-.25+wav(th,f)))/.85;b+=.95*Math.exp(-t*t);}return b;};
 const skin=[],dark=[];
 const hold=holeFn(dd,9850,null,2.2);const ysh=(typeof ysWallHole==='function')?ysWallHole(null,0):null;   /* YS: a way-in pod's hole */
 const winAt=(u,y)=>{const th=u*TAU,f=Math.floor(y/FH);if(f>=NF)return false;const fu=u*NW%1;
  const fy=y-(f*FH+wav(th,f));return f===0?(fu>.2&&fu<.8&&fy<2.9):(fu>.3&&fu<.7&&fy>1.05&&fy<2.95);};
 skin.push(gridSurface((u,v)=>{const th=u*TAU,y=v*topAt(th),p=plan(th,bulge(th,y));return[p[0],y,p[1]];},NW*6,52,
  {uS:12,vS:H/8,hole:(u,v)=>{const y=v*topAt(u*TAU);return winAt(u,y)||(hold&&hold(u,y))||(ysh&&ysh(u,y));}}));
 // the recess behind the windows, and the floors (holed where the east end fell)
 dark.push(gridSurface((u,v)=>{const th=u*TAU,p=plan(th,-1.5);return[p[0],v*Math.min(topAt(th),H-.4),p[1]];},64,ysh?24:2,{hole:ysh?(u,v)=>ysh(u,v*Math.min(topAt(u*TAU),H-.4)):null}));
 for(let f=1;f<=NF;f++)skin.push(gridSurface((u,v)=>{const th=u*TAU,p=plan(th,-.2);return[p[0]*v,f*FH-.05,p[1]*v];},48,3,
  {hole:(u,v)=>topAt(u*TAU)<f*FH+.6&&v>.18}));
 // ATTIC AND ROOF: the skin's top rolls inward and up to a crown; gone over the fall
 const roofP=(th,v)=>{const p=plan(th,.35*(1-v));const k=1-.55*Math.pow(v,.8)-.45*Math.pow(v,3);
  return[p[0]*k,H+3.3*Math.sin(Math.min(v,1)*Math.PI/2)+.45*Math.sin(th*7+v*3)*(1-v)*Math.min(v*4,1),p[1]*k];};
 skin.push(gridSurface((u,v)=>roofP(u*TAU,v),104,10,{uS:20,vS:3,hole:(u,v)=>fall(u*TAU)>.05||(hold&&hold(u,v*20))}));
 // cowls: twisted fluted cones; two fall in the ruin
 const cowl=(h,r)=>lathe({rFn:y=>r*(.45+.55*Math.pow(clamp(1-y/h,0,1),.7))+.18*Math.sin(y*2.2),H:h,flutes:5,amp:.28,twist:1.3,sharp:1.4,nu:20,nv:8});
 const cowls=[[.9,.5],[1.5,.55],[2.3,.5],[3.1,.45],[4.0,.5],[5.2,.55]];
 cowls.forEach((c,i)=>{const p=roofP(c[0],c[1]),h=i%2?3.4:2.8;
  if(fall(c[0])>.05){const m=mesh(cowl(h,.95),stone,G);m.position.set(p[0]*1.25,0,p[2]*1.25+(i-2)*1.5);m.rotation.set(rr(1.2,1.6),rng()*3,rr(-.4,.4));dropFragment(m,0,.25);return;}
  const g=cowl(h,.95);g.translate(p[0],p[1]-.3,p[2]);skin.push(g);});
 // two stair heads with a ball finial (the ball is glass, the ancients' own touch)
 for(const th of[Math.PI*.62,Math.PI*1.38]){const p=roofP(th,.62);
  const g=lathe({rFn:y=>1.9*Math.sqrt(clamp(1-Math.pow(y/4.2,2),0,1))+.05,H:4.2,flutes:8,amp:.12,nu:24,nv:8});g.translate(p[0],p[1]-.4,p[2]);skin.push(g);
  if(fall(th)<.05)kput('finial',[p[0],p[1]+4.1,p[2]],null,.6,null);}
 meshMerged(skin,stone,G);meshMerged(dark,MAT.dark,G);
 kput(dd?'slabCR':'slabC',[0,.2,0],null,[A+3,.4,B+3],null);
 // PANES, recessed in every opening that still has a wall round it; wrought-iron
 // rails (instance-tinted strut) on the upper floors
 const fires=[];
 for(let f=0;f<NF;f++)for(let i=0;i<NW;i++){const u=(i+.5)/NW,th=u*TAU,yc=f*FH+wav(th,f)+(f?2:1.45);if(yc>topAt(th)-.6||(ysh&&ysh(u,yc)))continue;
  const p=plan(th,-1),n=plan(th,3),nx=(n[0]-p[0])/4,nz=(n[1]-p[1])/4,q=qFacing([nx,0,nz]),w=f?1.3:2.2,h=f?1.8:2.8;
  if(d===0)kput('pane',[p[0],yc,p[1]],q,[w,h,1],null);
  else if(d===3&&rng()<.6)kput('paneD',[p[0],yc,p[1]],q,[w,h,1],null);
  if(d===2&&rng()<.22)fires.push([p[0],yc,p[1],nx,nz,w*.9,h*.9]);
  if(f>0&&i%2===0){const a=plan(th-.05,.85),b=plan(th+.05,.85),yr=f*FH+wav(th,f)+.95;
   beam('strutR',[a[0],yr,a[1]],[b[0],yr,b[1]],.07,.07,new THREE.Color(0x3a3634));
   beam('strutR',[a[0],yr-.6,a[1]],[b[0],yr-.6,b[1]],.05,.05,new THREE.Color(0x3a3634));}}
 // the door: a great arch on the south front
 {const p=plan(Math.PI/2,.2);kput('archOpen',[p[0],1.9,p[1]+.2],qFacing([0,0,1]),[.55,.42,1],null);}
 if(brk){adRubbleArc(0,0,-1.25,.75,th=>Math.hypot(...plan(th,0)),9,70,1.5);
  // the top floor's slab, broken and hinged down into the bitten end
  kput('slabCR',[A*.62,4.6,-1],qEuler(.05,.3,-.42),[6.5,.35,5],null);}
 if(dd){mossOnSurface(G,0,0,0,40,1.1);vinesFromLedge(G,0,0,0,26,7,0,0);}
 if(d===1){scatterMoss(0,0,0,20,34,30,1.4);trees(0,0,24,40,6);}
 if(d===2){adReclaim(G,{up:60,fires,trees:[24,40,8],figs:7,spread:16,
   // the camp is on the roof crown and on the floors laid open by the fall
   ok:p=>(p[1]>H+2.2&&p[1]<H+3.6)||(fall(Math.atan2(p[2]/B,p[0]/A))>.25&&[FH,2*FH].some(y=>Math.abs(p[1]-y+.05)<.08))});
  // a tarp roof over the bitten east end, from the standing wall down onto planks
  const tp=th=>{const p=plan(th,-2);return[p[0],topAt(th)+.4,p[1]];};
  adTarp(tp(-1.12),[A*.5,4.6,-4],8);adTarp(tp(.62),[A*.5,4.6,3],7);
  kput('planter',[0,.35,B+3.5],null,[10,.7,1.6],null);}
 if(d===0||d===3)figures(0,B+5,3,6);
 KOFF=[0,0,0];return G;}

// ================================================================= THE BRIDGE HOUSE (adBridge)
// A chamfered concrete tube 30 m long, its six-sided section deliberately
// lopsided, lifted 4.2 m on two wall-legs that splay outward to the ground.
// Both ends are glazed whole; a ribbon of glass runs the south upper chamfer.
// A glazed entrance box stands under its belly and a low terraced wing lies
// behind it. RUIN: the east leg has burst; the tube has pivoted on the west leg
// and its east end lies on the ground, glass gone, the shell eaten through.
function buildAltBridgeHouse(scene,gx,gz,d){reseed(9855+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d);
 REGISTER({name:'The Bridge house ('+AD_STATE[d]+')',x:0,z:-4,r:20,h:12});
 const L=30,Y0=4.2,SEC=[[-5,0],[5,0],[6.8,2.8],[5.2,6.4],[-4.6,6.4],[-6.6,3.2]];   // (z,y)
 const PX=-8.7,TH=brk?-Math.atan((Y0-.25)/(L/2-PX)):0;
 // THE TUBE, in a group pivoted on the west leg's inner top corner
 const P=new THREE.Group();P.position.set(PX,Y0,0);P.rotation.z=TH;G.add(P);P.updateMatrix();
 const shell=[],inner=[],hold=holeFn(dd,9855,null,2.5);
 const tx=u=>-L/2+u*L-PX;
 for(let e=0;e<6;e++){const a=SEC[e],b=SEC[(e+1)%6],rib=e===2;
  shell.push(gridSurface((u,v)=>[tx(u),lerp(a[1],b[1],v),lerp(a[0],b[0],v)],30,4,{uS:L/8,vS:1,
   hole:(u,v)=>(rib&&v>.18&&v<.86&&u>.06&&u<.94&&(u*10%1)>.08)||(hold&&hold(u+e*.17,v*7))||(brk&&u>.84&&fbm(u*9,v*3+e,9856,2)>.42)}));
  inner.push(gridSurface((u,v)=>[tx(u),lerp(a[1]*.9+.3,b[1]*.9+.3,v),lerp(a[0]*.9,b[0]*.9,v)],6,1));}
 // end frames, 0.8 m deep, so the tube reads as a solid at its mouths
 const ring=x0=>{const sh=adShape(SEC.map(p=>[-p[0],p[1]]));sh.holes.push(adShape(SEC.map(p=>[-p[0]*.88,p[1]*.88+.38])));
  const g=new THREE.ExtrudeGeometry(sh,{depth:.8,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x0,0,0);return adUV(g);};
 shell.push(ring(tx(0)),ring(tx(1)-.8));
 meshMerged(shell,conc,P);meshMerged(inner,MAT.dark,P);
 useGroupXF(P);
 for(const s of[-1,1]){const x0=tx(s<0?0:1)-s*.5;
  if(d===0||(d===3&&s<0)){const sh=new THREE.ShapeGeometry(adShape(SEC.map(p=>[-p[0]*.87,p[1]*.87+.4])));sh.rotateY(Math.PI/2);mesh(sh,MAT.glass,P,x0,0,0);}
  if(!(brk&&s>0))for(let k=-3;k<=3;k++)kput(dd?'strutR':'strutW',[x0,3.3,k*1.4],null,[.14,5.6,.14],null);}
 if(d===0)mesh(gridSurface((u,v)=>[tx(.06+u*.88),lerp(3.1,6.0,v),lerp(6.4,4.9,v)],1,1),MAT.glass,P);
 // the floor plate inside, and lit (or dead) cells along the ribbon
 kput(dd?'boxCR':'boxC',[tx(.5),.7,0],null,[L-1.6,.3,9.6],null);
 for(let i=1;i<10;i++){if(brk&&i>8)continue;kput(d===0?'cell':'cellD',[tx(i/10),4.3,4.6],qFacing([0,.4,1]),[2.2,1.4,1],d===0&&i%3?WARM:DEAD);}
 endGroupXF();
 // LEGS: trapezoid walls splayed outward to the ground; the east one burst in the ruin
 const solid=[];
 for(const s of[-1,1]){const hgt=brk&&s>0?1.1:Y0,t=hgt/Y0;
  const pts=[[s*8.6,0],[s*12.6,0],[s*lerp(12.6,10.2,t),hgt],[s*lerp(8.6,7.2,t),hgt]];
  adExtZ(solid,s<0?pts.slice().reverse():pts,-4.2,4.2);}
 if(brk){const m=mesh(adExtZ(null,[[0,0],[3,0],[2.2,3.1],[-.8,3.1]],-4,4),MAT.concreteR,G);m.position.set(15,0,7.5);m.rotation.set(0,.5,1.35);dropFragment(m,0,.3);}
 // THE WING behind: a long low block, chamfered at its front top edge, with a roof terrace
 {const sec=[[-17,0],[-7,0],[-7,3.2],[-8.2,4.4],[-17,4.4]];
  const sh=adShape(sec.map(p=>[-p[0],p[1]]));const g=new THREE.ExtrudeGeometry(sh,{depth:22,bevelEnabled:false});
  g.rotateY(Math.PI/2);g.translate(-16,0,0);solid.push(adUV(g));}
 meshMerged(solid,conc,G);
 for(let i=0;i<9;i++){const x=-14.5+i*2.3;kput(d===0?'cell':'cellD',[x,1.9,-6.85],null,[1.8,1.5,1],d===0&&i%2?WARM:DEAD);}
 for(let i=0;i<12;i++)kput(dd?'strutR':'strutW',[-15.5+i*1.85,5,-8.4],null,[.08,1.1,.08],null);
 beam(dd?'strutR':'strutW',[-15.6,5.5,-8.4],[4.8,5.5,-8.4],.1,.1);
 // the glazed entrance box under the belly (a dark box with a broken face in the ruin)
 if(!brk){for(const[x,z,ry,w]of[[0,1.6,0,6],[0,-1.6,0,6],[-3,0,Math.PI/2,3.2],[3,0,Math.PI/2,3.2]])
  kput(d===0?'pane':'paneD',[x,1.6,z],qEuler(0,ry,0),[w,3.2,1],null);
  kput(dd?'boxCR':'boxC',[0,3.4,0],null,[6.4,.3,3.6],null);}
 else kput('boxD',[0,1.2,0],qEuler(0,.1,.06),[6,2.4,3.2],null);
 kput(dd?'boxCR':'boxC',[-1,.12,-3],null,[36,.24,26],null);
 if(brk){adRubbleLine([9,-4],[15,4],1,.2,6,40,1.4);adRubbleLine([12,4],[16,-3],0,1,5,20,1.1);}
 if(dd){mossOnSurface(G,0,0,0,26,1);vinesFromLedge(G,0,0,0,14,4,0,0);}
 if(d===1){scatterMoss(0,0,0,12,28,24,1.4);trees(0,0,22,36,6);}
 if(d===2){
  // the later people walled the space under the tube with salvage and live in it
  for(const[x,z,ry,w]of[[-1.5,4.3,0,10],[-1.5,-4.3,0,10],[-6.8,0,Math.PI/2,8.4]])kput('patchSheet',[x,1.3,z],qEuler(0,ry,rr(-.05,.05)),[w,2.6,1],null);
  kput('shantyRoof',[-1.5,2.75,0],qEuler(.05,0,0),[11,1,9],null);
  adTarp([13,1.6,0],[19,0,0],8);
  for(let i=0;i<5;i++)kput('planter',[-14+i*3.4,.35,9],null,[2.6,.7,4],null);
  for(let i=0;i<15;i++)kput('moss',[-14+rr(0,14),.95,9+rr(-1.6,1.6)],null,[.8,.55,.8],new THREE.Color().setHSL(rr(.24,.34),.55,.3));
  const fires=[];for(let i=1;i<8;i++)if(rng()<.5){const v=new THREE.Vector3(tx(i/10),4.3,4.9).applyMatrix4(P.matrix);fires.push([v.x,v.y,v.z,0,1,1.9,1.2]);}
  fires.push([-6.9,1.5,2,-1,0,1.2,1.6]);
  adReclaim(G,{up:16,fires,trees:[22,36,7],figs:6,spread:12,minY:.6});
  firePit('adReclaim',2,.1,6,1.1);}
 if(d===0||d===3)figures(0,8,3,5);
 KOFF=[0,0,0];return G;}

// ================================================================= THE FIN APARTMENTS (adFins)
// A twelve-storey slab 14 m deep on a shallow arc (radius 150 m, about 120 m of
// chord), its concave face to the south. Fifteen shark-fin blades of white
// metal divide that face into bays: each is 7.5 m deep at the ground and tapers
// up the facade, runs free past the roof and ends in a tip leaning outward at
// 50 m. Every bay has a balcony tray on every storey, its soffit warm-tinted.
// RUIN: the east third has come down to about half height in a jagged bite —
// floors exposed in section, fins snapped (two lie on the forecourt), trays
// left hanging at the break, talus on both faces.
function buildAltFinApartments(scene,gx,gz,d){reseed(9860+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d),metal=SHELL(d);
 const Rc=150,CZ=150,DP=14,NS=12,FH=3.2,H=NS*FH,PHI=.4,NB=14,HT=50;
 REGISTER({name:'The Fin apartments ('+AD_STATE[d]+')',x:0,z:-4,r:66,h:52});
 const P=(ph,r)=>[r*Math.sin(ph),CZ-r*Math.cos(ph)];          // r=Rc is the south face
 const phU=u=>-PHI+2*PHI*u;
 const fall=ph=>{if(!brk)return 0;const t=clamp((ph-.06)/.16,0,1);return t*t*(3-2*t);};
 const topY=ph=>H-fall(ph)*H*(.5+.12*(fbm(ph*14,2.2,9860,2)-.5));
 const hold=holeFn(dd,9860,null,1.6),body=[],win=[];
 const cut=(u,y)=>y>topY(phU(u))||(hold&&hold(u,y));
 // faces: the south (window strips between spandrels) and the north (punched)
 const face=(r,winF,nu)=>gridSurface((u,v)=>{const p=P(phU(u),r);return[p[0],v*(H+1.2),p[1]];},nu,NS*4,
  {uS:2*PHI*r/8,vS:H/8,hole:(u,v)=>{const y=v*(H+1.2);return cut(u,y)||(y<H&&winF(u,y));}});
 body.push(face(Rc,(u,y)=>{const fy=y%FH;return fy>.95&&fy<2.85;},NB*6));
 body.push(face(Rc+DP,(u,y)=>{const fy=y%FH,fu=u*NB*3%1;return fy>1.1&&fy<2.6&&fu>.3&&fu<.75;},NB*12));
 for(const r of[Rc+.7,Rc+DP-.7])win.push(gridSurface((u,v)=>{const p=P(phU(u),r);return[p[0],v*H,p[1]];},NB*2,NS,{hole:(u,v)=>v*H>topY(phU(u))-.3}));
 // the two end walls, the roof (with a parapet), and a plate at every storey
 for(const ph of[-PHI,PHI])body.push(gridSurface((u,v)=>{const p=P(ph,Rc+u*DP);return[p[0],v*(H+1.2),p[1]];},6,NS*2,
  {uS:DP/8,vS:H/8,hole:(u,v)=>v*(H+1.2)>topY(ph)||(hold&&hold(u*.3+ph,v*H))}));
 for(let f=1;f<=NS;f++)body.push(gridSurface((u,v)=>{const p=P(phU(u),Rc+.2+v*(DP-.4));return[p[0],f*FH-.05,p[1]];},NB*3,1,
  {hole:(u,v)=>f*FH>topY(phU(u))+.6}));
 // ground-floor lobby recess and plinth
 kput(dd?'boxCR':'boxC',[0,.25,6],qEuler(0,0,0),[2*Rc*Math.sin(PHI)+12,.5,40],null);
 // FINS
 const finGeo=()=>{const pts=[[0,0]];const lean=y=>2.6*Math.pow(y/HT,4);
  for(let k=0;k<=14;k++){const y=HT*k/14;pts.push([1.1+6.4*Math.pow(1-y/HT,1.5)+lean(y),y]);}
  for(let k=5;k>=0;k--){const y=H+(HT-H)*k/6;pts.push([(1.1+lean(HT))*Math.pow((y-H)/(HT-H),1.6),y]);}
  const g=new THREE.ExtrudeGeometry(adShape(pts),{depth:.6,bevelEnabled:false,curveSegments:2});g.translate(0,0,-.3);return g;};
 const fins=[],finCut=[];
 for(let i=0;i<=NB;i++){const ph=-PHI+2*PHI*i/NB,p=P(ph,Rc),g=finGeo();
  const X=new THREE.Vector3(-Math.sin(ph),0,Math.cos(ph)),Y=new THREE.Vector3(0,1,0),Z=new THREE.Vector3(-Math.cos(ph),0,-Math.sin(ph));
  const M=new THREE.Matrix4().makeBasis(X,Y,Z).setPosition(p[0],0,p[1]);
  const t=topY(ph);
  if(t<H-1){// snapped: keep the stump below the break, lay the rest on the forecourt
   const pos=g.attributes.position;for(let k=0;k<pos.count;k++)if(pos.getY(k)>t+2)pos.setY(k,t+2+(pos.getY(k)-t)*.02);
   g.computeVertexNormals();
   if(i%3===1){const m=mesh(adUV(finGeo()),metal,G);m.position.set(p[0]+18-i,0,p[1]+26+i*.8);m.rotation.set(-Math.PI/2+.08,.2+i*.2,.04);dropFragment(m,0,.2);}}
  g.applyMatrix4(M);fins.push(adUV(g));}
 meshMerged(body,conc,G);meshMerged(fins,metal,G);meshMerged(win,WIN(d),G);
 // BALCONIES: a tray and a parapet in every bay on every storey (hanging at the break)
 const soff=new THREE.Color(dd?0x9a7a62:0xf0c8a0);
 for(let b=0;b<NB;b++){const ph=-PHI+2*PHI*(b+.5)/NB,t=topY(ph),q=qFacing([-Math.sin(ph),0,Math.cos(ph)]),bw=2*PHI*Rc/NB-.8;
  for(let f=1;f<=NS;f++){const y=f*FH-.12;if(y>t+.3)continue;
   const hang=brk&&y>t-FH&&t<H-1;const p=P(ph,Rc-1.25),pp=P(ph,Rc-2.45);
   const qq=hang?q.clone().multiply(qEuler(rr(.25,.6),0,rr(-.2,.2))):q;
   kput(dd?'boxCR':'boxC',[p[0],y-(hang?.9:0),p[1]],qq,[bw,.28,2.5],soff);
   if(!hang)kput(dd?'boxCR':'boxC',[pp[0],y+.6,pp[1]],q,[bw,1.05,.16],null);}}
 // roof plant rooms
 for(const ph of[-.28,-.05,.2])if(topY(ph)>=H-.1){const p=P(ph,Rc+DP/2);kput(dd?'boxCR':'boxC',[p[0],H+1.6,p[1]],qFacing([-Math.sin(ph),0,Math.cos(ph)]),[9,3.2,7],null);}
 // lit windows behind the strips (intact), firelight territories (reclaimed)
 const fm=d===2?fireMask('adFins',NB,NS,9862,2):null,fires=[];
 for(let b=0;b<NB;b++)for(let f=0;f<NS;f++){const ph=-PHI+2*PHI*(b+.5)/NB;if(f*FH+2>topY(ph))continue;const p=P(ph,Rc+.45);
  if(d===0&&rng()<.3)kput('cell',[p[0],f*FH+1.9,p[1]],qFacing([-Math.sin(ph),0,Math.cos(ph)]),[2.4,1.4,1],rng()<.5?WARM:CYAN);
  if(fm&&fm(b,f))fires.push([p[0],f*FH+1.9,p[1],-Math.sin(ph),Math.cos(ph),3.2,1.5]);}
 if(brk){const a=P(.07,Rc-3),b=P(PHI,Rc-3),c=P(.07,Rc+DP+3),e=P(PHI,Rc+DP+3);
  adRubbleLine(a,b,-Math.sin(.25),Math.cos(.25),16,150,3);adRubbleLine(c,e,Math.sin(.25),-Math.cos(.25),12,90,2.6);}
 if(dd){mossOnSurface(G,0,0,0,90,1.6);vinesFromLedge(G,0,0,0,50,14,0,CZ);stainsFromLedge(G,0,0,0,40,16,0,CZ);}
 if(d===1){scatterMoss(0,0,20,20,70,50,2);adTreesBox(-75,75,24,80,14);adTreesBox(-75,75,-50,-28,8);}
 if(d===2){
  // laundry strung across balconies, and tarps hung off the trays at the break
  for(let k=0;k<26;k++){const b=(rng()*NB)|0,f=1+((rng()*NS)|0),ph=-PHI+2*PHI*(b+.5)/NB;if(f*FH+1>topY(ph))continue;
   const a=P(ph-.012,Rc-2.3),c=P(ph+.012,Rc-2.3),y=f*FH+1.7;beam('strutR',[a[0],y,a[1]],[c[0],y,c[1]],.04,.04);
   kput('patchTarp',[(a[0]+c[0])/2,y-.5,(a[1]+c[1])/2],qFacing([-Math.sin(ph),0,Math.cos(ph)]),[rr(1,2.4),rr(.6,1),1],new THREE.Color().setHSL(rng(),.45,.6));}
  adReclaim(G,{up:70,fires,treeBox:[-75,75,26,80,16],figs:14,spread:30,cz:40,
   ok:p=>Math.abs(p[1]-(H+.0))<.3||(p[1]>2&&Math.abs((p[1]+.05)%FH)<.1)});}
 if(d===0||d===3)figures(0,30,8,30);
 KOFF=[0,0,0];return G;}
