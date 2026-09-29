// ================================================================ SEGMENTS: drydocks and boat manufacturing (prefix dd)
// Three 110 m segments, seeds 20100-20124 (agent block 20100-20199):
//   ddDock  20100+d  (this file) an UNCOVERED graving dock cut through a dock
//                    mole: a stepped-wall (altar) pit dug to -14 m, a caisson
//                    gate at the sea end, pump house, a travelling gantry crane
//                    on rails along both sides, keel blocks, a hull under repair
//   ddShed  20110+d  (82-dd-shed.js) the same kind of pit under a long white
//                    parabolic hall with a glazed clerestory, open at the sea end
//   ddYard  20120+d  (82-dd-yard.js) boat manufacturing: a slipway into a
//                    launch channel, a hull on its cradle, sheds, a plate-rolling
//                    hall, stacked hull modules, a jib crane
// This file also holds what the three share: the dry-pit materials and kit
// twins, ddBar, ddPit (the stepped pit), ddHull (a plain generic hull we model
// ourselves - no registered vessel is needed), ddGantry, ddMoleSides.
//
// THE DRY PIT. The port's underwater fade (71-port-terrain.js) darkens every
// MAT material by WORLD y < 0 - right for anything under the sea, wrong for a
// pumped-dry dock whose floor is 14 m below sea level. So everything that
// stands in a DRY pit is drawn with an unpatched twin: DDM[k] is a clone of
// MAT[k] made here at top level, kept OUT of MAT, so portUnderwaterPatch()
// never sees it; kit items come in pairs (name / name+'D'). A flooded pit
// (ruined, reclaimed) uses the ordinary MAT set and fades like any water.
// The terrain itself is faded too, so a dry pit is floored with our own slab.
const DD={FLOOR:-14};
MAT.ddAnti=new THREE.MeshStandardMaterial({color:0x8c3026,roughness:.7,metalness:.15,side:DS});    // antifouling red
MAT.ddTop=new THREE.MeshStandardMaterial({color:0x3c4652,roughness:.5,metalness:.35,side:DS});     // topsides, slate
MAT.ddPrimer=new THREE.MeshStandardMaterial({color:0x9a5c3e,roughness:.85,metalness:.2,side:DS});  // red-oxide primer
MAT.ddGrey=new THREE.MeshStandardMaterial({color:0x8d918f,roughness:.7,metalness:.3,side:DS});     // grey shop primer
MAT.ddDeck=new THREE.MeshStandardMaterial({color:0x55534e,roughness:.9,metalness:.15,side:DS});
const DDM={};
for(const k of ['concrete','concreteR','white','rust','dark','fig','timber','pkSteel','pkPaint','ddAnti','ddTop','ddPrimer','ddGrey','ddDeck'])DDM[k]=MAT[k].clone();
// kit twins: `name` fades under water, `name`+'D' does not (dry pit)
function ddKdef(name,geo,mk){kdef(name,geo,MAT[mk]);kdef(name+'D',geo,DDM[mk]);}
const ddK=(name,dry)=>dry?name+'D':name;
const DD_BOX=new THREE.BoxGeometry(1,1,1);                  // unit box: kput-scaled, or aimed with beam()
ddKdef('ddSteel',DD_BOX,'pkSteel');ddKdef('ddPaint',DD_BOX,'pkPaint');ddKdef('ddRustB',DD_BOX,'rust');
ddKdef('ddConc',DD_BOX,'concrete');ddKdef('ddTimb',DD_BOX,'timber');ddKdef('ddPrim',DD_BOX,'ddPrimer');
ddKdef('ddFigB',KIT.defs.figB.geo,'fig');ddKdef('ddFigH',KIT.defs.figH.geo,'fig');
ddKdef('ddLadder',KIT.defs.pkLadder.geo,'pkSteel');

// ---------------------------------------------------------------- small helpers
// A world-UV box whose long axis runs from a to b (w and h across it), into the batch.
function ddBar(P,mat,a,b,w,h,noRep){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<.01)return;
 const g=boxUV(w,L,h,8);   // r128 BufferGeometry has no applyQuaternion
 g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx/L,dy/L,dz/L))));
 g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);pbAdd(g,mat,P,noRep);}
// People; in a dry pit they must not fade, so they use the twins.
function ddFigures(x,y,z,n,sx,sz,dry){for(let i=0;i<n;i++){const px=x+rr(-sx,sx),pz=z+rr(-sz,sz);
 const py=y==null?portH(px,pz):y;const c=new THREE.Color().setHSL(rr(0,.12),rr(.2,.55),rr(.22,.5));
 kput(ddK('ddFigB',dry),[px,py,pz],qEuler(0,rng()*TAU,0),1,c);kput(ddK('ddFigH',dry),[px,py,pz],null,1,new THREE.Color(0xc9a17e));}}
// A light: the Ancients' cyan when intact, warm salvage light when reclaimed.
function ddLight(x,y,z,d,s){if(d===1)return;kput('dot',[x,y,z],null,s||[.9,.5,.9],d===0?CYAN:WARM);}
// ShapeGeometry UVs are raw metres; the kit's textures want ~8 m a tile.
function ddShapeUV(g,t){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/(t||8),uv.getY(i)/(t||8));return g;}

// ---------------------------------------------------------------- the sea over a dry pit (WORKAROUND)
// A `dry` stamp makes portBuildTerrain (71-port-terrain.js) emit the sea as
// one run of quads per terrain row, split round the dry cells. The rows next
// to a pit's z edges then meet in T-junctions: a row-long edge (23 km) against
// the split edges of its neighbour. They render as hairline cracks right
// across the open sea along the pit's z lines (seen and confirmed: the lines
// go when the pit is not dry). Until the shared sea is fixed (request in
// notes/drydocks.md) the first dry-pit builder re-meshes it once: every row is
// cut at the UNION of all rows' wet/dry boundaries, so neighbouring rows share
// every vertex. Same sheet, same material, same UVs; a no-op without dry stamps.
let DD_SEAFIXED=false;
function ddSeaFix(){if(DD_SEAFIXED)return;DD_SEAFIXED=true;
 const T=(typeof PORT_TERRAIN!=='undefined')?PORT_TERRAIN:null,Gd=PORT_ST.grid;if(!T||!T.sea||!Gd)return;
 const dry=PORT_ST.list.filter(s=>s.dry);if(!dry.length)return;
 const {xs,zs,nx,nz}=Gd,zlo=Math.min(...dry.map(s=>s.z0))-1,zhi=Math.max(...dry.map(s=>s.z1))+1;
 const wet=new Map(),cut=new Set([0,nx-1]);
 for(let j=0;j<nz-1;j++){const zc=(zs[j]+zs[j+1])/2;if(zc<zlo||zc>zhi)continue;const row=new Uint8Array(nx-1);
  for(let i=0;i<nx-1;i++){row[i]=portDry((xs[i]+xs[i+1])/2,zc)?0:1;if(i>0&&row[i]!==row[i-1])cut.add(i);}wet.set(j,row);}
 const B=[...cut].sort((a,b)=>a-b),P=[],I=[],U=[],N=[];
 for(let j=0;j<nz-1;j++){const row=wet.get(j);
  for(let k=0;k<B.length-1;k++){if(row&&!row[B[k]])continue;const xa=xs[B[k]],xb=xs[B[k+1]],za=zs[j],zb=zs[j+1],b=P.length/3;
   P.push(xa,0,za, xb,0,za, xa,0,zb, xb,0,zb);I.push(b,b+2,b+1,b+1,b+2,b+3);
   U.push(xa/46,za/46, xb/46,za/46, xa/46,zb/46, xb/46,zb/46);N.push(0,1,0,0,1,0,0,1,0,0,1,0);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 g.setIndex(P.length/3>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeBoundingSphere();
 const old=T.sea.geometry;T.sea.geometry=g;old.dispose();}

// ---------------------------------------------------------------- the stepped pit
// ddPit(G,o): the altar walls, the head and the floor of a graving dock, as
// solid boxes (n steps of rise h and tread T from the deck down to o.floor).
// The pit stamp is a `dig` over exactly [x0,x1] x [z0,z1]; the top step's
// coping box reaches 1.2 m outside it and hides the ground's 0.3 m cliff.
// Side boxes run the full length; head boxes fit between the side steps of the
// same level, so no two box tops ever share a height (no z-fighting).
// The sea end (z1) is left open: the segment builds its gate there.
// Returns {fx0,fx1,fz0,h,T,n,tread(i)->[xa,xb] (west side), y(i)}.
function ddPit(G,o){const D=PORT.DECK,n=o.n||5,T=o.T||2,fl=o.floor,h=(D-fl)/n;
 const mat=o.dry?DDM.concrete:CONC(o.d),nr=!o.dry,yb=fl-1;
 for(let i=0;i<n;i++){const top=D-i*h+(i===0?.2:0),hh=top-yb,out=i===0?1.2:.6;
  for(const s of [-1,1]){const xe=s<0?o.x0:o.x1,xin=xe-s*i*T,xout=xe+s*out;
   pbBox(G,mat,(xin+xout)/2,(top+yb)/2,(o.z0-out+o.z1)/2,Math.abs(xout-xin),hh,o.z1-o.z0+out,0,8,nr);}
  const xa=o.x0+i*T,xb=o.x1-i*T,za=o.z0-out,zb=o.z0+i*T;
  pbBox(G,mat,(xa+xb)/2,(top+yb)/2,(za+zb)/2,xb-xa,hh,zb-za,0,8,nr);}
 const fx0=o.x0+(n-1)*T,fx1=o.x1-(n-1)*T,fz0=o.z0+(n-1)*T;
 pbBox(G,mat,(fx0+fx1)/2,fl-.3,(fz0+o.z1)/2,fx1-fx0,.7,o.z1-fz0,0,8,nr);
 // ladders down the altars, every ~30 m along each side
 const lk=ddK('ddLadder',o.dry),lc=o.d>0?new THREE.Color(0x8a5a3a):null;
 for(let z=o.z0+14;z<o.z1-6;z+=30)for(const s of [-1,1])for(let i=0;i<n;i++){
  if(o.d===1&&rng()<.4)continue;const x=(s<0?o.x0+i*T:o.x1-i*T)+s*-.12;
  kput(lk,[x,D-i*h+(i===0?.2:0),z+i*.9],qEuler(0,s<0?Math.PI/2:-Math.PI/2,0),[1,(h+.2)/10,1],lc);}
 return {fx0,fx1,fz0,h,T,n,y:i=>D-i*h,tread:i=>[o.x0+(i-1)*T,o.x0+i*T]};}

// ---------------------------------------------------------------- the hull
// ddHull(P,o): a plain generic steel hull. Hull frame: origin on the keel at
// midship, bow toward +z, deck ~o.D above the keel; it is placed with
// (x,y,z) = where that origin goes in P, yaw (0 = bow +z), pitch (+ raises the
// bow) and roll. Parameters: u 0 stern -> 1 bow along the length, a section
// angle th from -PI/2 (port deck edge) through 0 (keel) to PI/2 (starboard),
// shaped as a superellipse that is boxy amidships, V-ish at the bow.
// o.plate=[u0,u1] is the plated stretch (end bulkheads close it), o.frames=
// [u0,u1] bare frames (a hull being built), o.paint 'new'|'primer'|'rust',
// o.holes 0..1 punches the plating, o.sup a stern superstructure, o.blocks=y
// sets keel and bilge blocks from ground y up to the keel, o.dry the twins.
// Returns {xf(p)->[x,y,z] in P, sec(u,th), deck(u), hb(u), zAt(u,y)}.
function ddHull(P,o){o=Object.assign({L:100,B:18,D:12,x:0,y:0,z:0,yaw:0,pitch:0,roll:0,dry:false,d:0,paint:'new',
  plate:[0,1],frames:null,sup:true,holes:0,wl:.46,nr:false,seed:1,blocks:null},o);
 const L=o.L,B=o.B,Dh=o.D;
 const bow=u=>clamp((u-.6)/.4,0,1),st=u=>clamp((.12-u)/.12,0,1);
 const hb=u=>{const t=bow(u);return B/2*Math.pow(Math.max(0,1-t*t),.62)*(1-.2*st(u)*st(u));};
 const keel=u=>{const t=clamp((u-.84)/.16,0,1),s=st(u);return Dh*(.4*t*t+.34*s*s);};
 const deck=u=>Dh+1.8*Math.pow(bow(u),2)+.5*st(u);
 const nx=u=>lerp(lerp(7,3,st(u)),1.6,bow(u));
 const zAt=(u,y)=>(u-.5)*L+(y/Dh)*L*.04*Math.pow(bow(u),1.4)-(y/Dh)*L*.012*st(u);
 const sec=(u,th)=>{const e=2/nx(u),s=Math.sin(th),c=Math.abs(Math.cos(th)),k=keel(u),dk=deck(u);
  const x=hb(u)*Math.sign(s)*Math.pow(Math.abs(s),e),y=dk-(dk-k)*Math.pow(c,e);return [x,y,zAt(u,y)];};
 const thW=u=>{const k=keel(u),dk=deck(u),yw=Dh*o.wl;if(k>=yw)return 0;const e=2/nx(u);return Math.acos(clamp(Math.pow((dk-yw)/(dk-k),1/e),0,1));};
 const M=new THREE.Matrix4().compose(new THREE.Vector3(o.x,o.y,o.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(-o.pitch,o.yaw,o.roll,'YXZ')),new THREE.Vector3(1,1,1));
 const xf=p=>{const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(M);return [v.x,v.y,v.z];};
 const add=(g,m)=>{g.applyMatrix4(M);pbAdd(g,m,P,o.nr);};
 const T=o.dry?DDM:MAT;
 const pal={new:[T.ddAnti,T.ddTop,T.ddDeck,T.white],primer:[T.ddPrimer,T.ddGrey,T.ddDeck,T.ddGrey],rust:[T.rust,T.rust,T.rust,T.rust]}[o.paint];
 const sd=o.seed*1.37;
 const hf=o.holes>0?(u,v)=>fbm(u*L/14+sd,v*3.2,sd*.7,3)<.1+.3*o.holes*fbm(u*L/40,v,sd+3,2)*1.4:null;
 const [u0,u1]=o.plate;
 if(u1>u0){const nu=Math.max(3,Math.round((u1-u0)*L/2.6)),U=a=>lerp(u0,u1,a),uS=L*(u1-u0)/8;
  add(gridSurface((a,v)=>{const u=U(a),w=thW(u);return sec(u,lerp(-w,w,v));},nu,10,{uS,vS:B*1.3/8,hole:hf?(a,v)=>hf(U(a),v*.5+.25):null}),pal[0]);
  for(const s of [-1,1])add(gridSurface((a,v)=>{const u=U(a),w=thW(u);return sec(u,s*lerp(w,Math.PI/2,v));},nu,5,
   {uS,vS:Dh/8,hole:hf?(a,v)=>hf(U(a)+.3*s,v*.3+(s>0?.8:.1)):null}),pal[1]);
  add(gridSurface((a,v)=>{const u=U(a),dk=deck(u);return [(v*2-1)*hb(u)*.995,dk,zAt(u,dk)];},nu,2,
   {uS,vS:B/8,hole:hf?(a,v)=>hf(U(a)+.7,v+2):null}),pal[2]);
  for(const ue of [u0,u1]){if(ue>.995)continue;
   add(gridSurface((a,v)=>{const p=sec(ue,lerp(-Math.PI/2,Math.PI/2,v));return [p[0]*a,p[1],p[2]];},2,12,{uS:B/8,vS:Dh/8}),ue===0?pal[1]:o.paint==='rust'?T.rust:T.ddPrimer);}}
 // bare frames: a ring every ~3 m, the keel and two deck-edge stringers
 if(o.frames){const [fa,fb]=o.frames,n=Math.max(1,Math.round((fb-fa)*L/3)),kk=ddK(o.paint==='rust'?'ddRustB':'ddPrim',o.dry);
  for(let i=0;i<=n;i++){const u=lerp(fa,fb,i/n);if(o.d===1&&i>0&&rng()<.18)continue;
   let q=xf(sec(u,-Math.PI/2));for(let k=1;k<=10;k++){const p=xf(sec(u,-Math.PI/2+Math.PI*k/10));beam(kk,q,p,.32,.55,null);q=p;}
   if(i%2===0){const a=xf(sec(u,-Math.PI/2)),b=xf(sec(u,Math.PI/2));beam(kk,a,b,.3,.4,null);}}   // deck beam
  for(const th of [0,-Math.PI/2,Math.PI/2]){const a=xf(sec(fa,th)),b=xf(sec(fb,th));beam(kk,a,b,.5,.5,null);}}
 // the stern superstructure: stacked white tiers with dark window bands, a funnel, a mast
 if(o.sup&&u0<=.02){const za=zAt(.05,Dh),zb=zAt(.2,Dh),zc=(za+zb)/2,dp=zb-za;let y=deck(.12);
  const th=Math.min(3.2,Dh*.5),big=L>=50;   // tiers scale with the hull: a 30 m boat gets two low ones
  const tiers=o.d===1?[[B*.84,th],[B*.74,th*.94]]:big?[[B*.84,th],[B*.74,th*.94],[B*.62,th*.94],[B*.96,th*.88]]:[[B*.84,th],[B*.96,th*.9]];
  tiers.forEach(([w,h],i)=>{const dd=i===tiers.length-1&&tiers.length===4?dp*.5:dp*(1-i*.1);
   add(pgeo(boxUV(w,h,dd,8),0,y+h/2,zc+(dp-dd)/2),pal[3]);
   add(pgeo(boxUV(w+.12,1.05,dd+.12,8),0,y+h*.6,zc+(dp-dd)/2),T.dark);y+=h;});
  const fh=th*1.9,mh=th*2.8;add(pgeo(boxUV(B*.16,fh,Math.min(3.4,dp*.3),8),0,y+fh/2,za+Math.min(2.6,dp*.25)),o.paint==='rust'?pal[3]:T.ddTop);
  if(o.d!==1)add(pgeo(boxUV(.4,mh,.4,8),0,y+mh/2,zb-Math.min(3,dp*.25)),pal[3]);}
 // keel and bilge blocks, from ground y o.blocks up to the hull
 if(o.blocks!=null){const kc=ddK('ddConc',o.dry),kt=ddK('ddTimb',o.dry);
  const blk=(u,th)=>{const p=xf(sec(u,th)),hh=p[1]-o.blocks-.3;if(hh<.2)return;
   kput(kc,[p[0],o.blocks+hh/2,p[2]],qEuler(0,o.yaw,0),[1.6,hh,1.2],null);kput(kt,[p[0],o.blocks+hh+.15,p[2]],qEuler(0,o.yaw,0),[1.7,.3,1.3],null);};
  const ua=Math.max(.06,u0),ub=Math.min(.9,Math.max(u1,o.frames?o.frames[1]:0));
  for(let u=ua;u<ub;u+=2.4/L)blk(u,0);
  for(let u=Math.max(.28,ua);u<Math.min(.72,ub);u+=6/L){blk(u,-.95);blk(u,.95);}}
 return {xf,sec,deck,hb,zAt,M};}

// ---------------------------------------------------------------- the travelling gantry
// ddGantry(G,o): a portal crane spanning a pit on rails at x = xa and xb, at
// z = o.z: A-frame legs on bogie sills, twin box girders at D+H with an
// overhang, a trolley, hoist ropes down to a hook block (at o.hookY, carrying
// o.load [w,h,dp] if given), a driver's cab. d=1: COLLAPSED across the pit -
// the west frame down, one girder slewed diagonally from the east leg into
// the flooded pit, the other broken on the deck, the trolley in the water.
function ddGantry(G,o){const D=PORT.DECK,d=o.d,H=o.H,top=D+H,z=o.z,xa=o.xa,xb=o.xb;
 const mat=d>0?MAT.rust:MAT.pkPaint,dk=d>0?MAT.rust:MAT.ddTop,g0=xa-8,g1=xb+8;
 const frame=(x,lean)=>{pbBox(G,dk,x,D+1.3,z,2.6,2.6,24,0,8);
  for(const s of [-1,1])ddBar(G,mat,[x,D+2.4,z+s*10],[x+lean,top-2.2,z+s*1.6],2.2,2.2);
  const t=.45;pbBox(G,mat,x+lean*t,D+2.4+(H-4.6)*t,z,1.3,1.3,2*(10-8.4*t),0,8);
  pbBox(G,mat,x+lean,top-1.2,z,3,3.2,5.6,0,8);};
 if(d!==1){frame(xa,0);frame(xb,0);
  for(const s of [-1,1])pbBox(G,mat,(g0+g1)/2,top+2.2,z+s*2.1,g1-g0,4.4,1.7,0,8);
  for(let x=g0+3;x<g1;x+=6)pbBox(G,dk,x,top+.1,z,.5,.4,5.9,0,8);                // cross ties under the girders
  const xt=lerp(xa+6,xb-6,o.trolley==null?.5:o.trolley);
  pbBox(G,dk,xt,top+6,z,8,3.2,7.4,0,8);pbBox(G,mat,xt+2,top+8.4,z,3.4,1.8,4,0,8);
  const hy=o.hookY==null?D+H*.5:o.hookY,dry=!!o.dry&&hy<0;
  for(const a of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])beam(ddK('ddSteel',dry),[xt+a[0],top+4.4,z+a[1]],[xt+a[0]*.6,hy+1.6,z+a[1]*.6],.07,.07,null);
  kput(ddK('ddPaint',dry),[xt,hy+.9,z],null,[1.6,1.4,1.2],new THREE.Color(0xd8a630));
  if(o.load){const [w,h,dp]=o.load;for(const s of [-1,1])beam(ddK('ddSteel',dry),[xt,hy,z],[xt+s*w*.4,hy-1.4,z],.05,.05,null);
   kput(ddK('ddPrim',dry),[xt,hy-1.4-h/2,z],null,[w,h,dp],null);}
  pbBox(G,MAT.white,xa+5,top-1.8,z+3.3,3.4,3,3.2,0,8);
  kput(d===0?'pane':'paneD',[xa+5,top-1.4,z+4.95],null,[3,1.2,1],null);
  if(d===0){for(const x of [g0+2,(g0+g1)/2,g1-2])ddLight(x,top-.3,z,d,[.8,.3,.8]);ddLight(xt,top+7.8,z,d,[.6,.6,.6]);}
  else ddLight(xa+5,top-.1,z+3.3,d,[.7,.7,.7]);}
 else{
  // the east frame still stands, leaning; the west frame lies on the deck
  frame(xb,-1.6);
  pbBox(G,dk,xa,D+1.3,z,2.6,2.6,24,.05,8);
  for(const s of [-1,1])ddBar(G,mat,[xa-2+s*.8,D+1.2,z+s*10],[xa-8+s*1.5,D+1.1,z+s*40+rr(-2,2)],2.2,2.2);
  // girder one: from the east leg head down across the pit into the water
  ddBar(G,mat,[xb-1.6,top-3,z-2],[xa+3,-4,z-15],4.4,1.7);
  // girder two: broken - the west half on the deck, a piece sunk in the pit
  ddBar(G,mat,[xa-4,D+2.3,z+2],[xa-13,D+2.1,z+30],1.7,4.4);
  ddBar(G,mat,[xb+10,D+2.3,z+6],[xb+2,D+2,z+15],1.7,4.4);
  const g=boxUV(8,3.2,7.4,8);g.rotateZ(.5);g.rotateX(.3);g.translate((xa+xb)/2+4,-3,z+8);pbAdd(g,MAT.rust,G);   // the trolley, in the water
  portRubble(xa-10,D,z,6,14);}
 REGISTER({name:'Travelling gantry crane',x:(xa+xb)/2,z,r:Math.min((xb-xa)/2+8,38),h:H+10,y:D});}

// ---------------------------------------------------------------- sides of a segment that stands out to sea
// ddMoleSides(G,nb,d,z0,z1): finish both x sides of a deck that runs from z0
// (land) to z1, past this segment's own quay line (z=0) - a mole. A flush or
// set-back neighbour's water lies against the side from max(z0, dz) to z1, so
// a quay wall faces it there; one that stands out past z1 needs nothing;
// open sea: wall all the way and riprap at the back corner; natural land: a
// wall from just inshore of the beach to z1 and riprap round the root.
function ddMoleSides(G,nb,d,z0,z1){const out={};
 for(const side of ['W','E']){const s=side==='W'?-1:1,xe=s*portCurW()/2,N=(nb&&nb[side])||{kind:'land',dz:0};
  const wo={face:[s,0],ladders:40,bollards:24};
  if(N.kind==='seg'){if(N.dz<z1-.5){portQuayWall(G,xe,Math.max(z0,N.dz),xe,z1,d,wo);out[side]='wall';}else out[side]='none';}
  else if(N.kind==='sea'){portQuayWall(G,xe,z0,xe,z1,d,wo);portRevetment(G,xe,z0+12,xe,z0-34,d,{face:[s,0],width:28,top:PORT.DECK+.4});out[side]='wall';}
  else{portQuayWall(G,xe,-24,xe,z1,d,Object.assign({},wo,{fenders:0,ladders:0}));
   portRevetment(G,xe,z1+10,xe,-50,d,{face:[s,0],width:30,top:PORT.DECK+.4});out[side]='coast';}}
 return out;}

// ================================================================ SEGMENT: ddDock
// An uncovered graving dock. The pit (46 m across the coping, 30 m floor,
// 156 m long, floor at -14) runs from the land apron out through a full-width
// dock MOLE to a caisson gate; beyond the gate a short walled entrance opens
// onto dredged water. A travelling gantry spans the pit on rails at x=+/-29.
//   d=0 pumped dry (dry stamp): a 124 m hull on keel blocks under repair,
//       breast shores from the altars, scaffolding, a block on the hook
//   d=1 gate breached, pit flooded and silted, the gantry collapsed across it,
//       the hull a holed rust hulk listing on the silt
//   d=3 a sheltered harbour: the head of the pit filled as a garden terrace,
//       houseboats and fish pens on the water, container houses along the
//       dock walls and up on the gantry girder, a pontoon boom at the mouth
const DDK={LAND:110,SEA:130,X0:-23,X1:23,Z0:-96,Z1:60,ZM:72,XE0:-17,XE1:17,N:5,T:2,RAIL:29,GZ:-8,GY:1.6};
function ddDockStamps(o){const d=o.d,D=PORT.DECK,K=DDK,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-K.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:K.SEA,y:d===1?-7:-12,soft:30},
  {kind:'fill',x0:-h,z0:-2,x1:h,z1:K.ZM,y:D,paint:d>=1?'soil':'pave'},                     // the dock mole
  {kind:'dig',x0:K.X0,z0:K.Z0,x1:K.X1,z1:K.Z1,y:DD.FLOOR,dry:d===0,paint:'mud'},           // the pit
  {kind:'dig',x0:K.XE0,z0:K.Z1,x1:K.XE1,z1:K.ZM,y:d===1?-6:-12,paint:'mud'}];              // the entrance
 if(d===1){s.push({kind:'fill',poly:[[-14,-82],[6,-88],[14,-40],[12,30],[-4,56],[-15,16]],y:-7,soft:6,paint:'mud'});
  s.push({kind:'fill',poly:[[-40,80],[10,76],[44,92],[20,112],[-30,104]],y:-1.6,soft:14,paint:'sand'});}
 if(d===3)s.push({kind:'fill',x0:K.X0,z0:K.Z0,x1:K.X1,z1:K.Z0+34,y:DDK.GY,paint:'grass'});      // the garden terrace
 return s.concat(portEdgeStamps(o,{LAND:K.LAND,SEA:K.SEA}));}

function buildDdDock(scene,gx,gz,d,opt){reseed(20100+d);ddSeaFix();
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,K=DDK,h=opt.W/2,dry=d===0,FL=DD.FLOOR;
 // ---- paving round the pit and the entrance; walls; the mole's sides
 const pv=(a,b,c,e)=>portPaving(G,a,b,c,e,d);
 pv(-h,-K.LAND,K.X0-1.2,K.ZM-1.2);pv(K.X1+1.2,-K.LAND,h,K.ZM-1.2);pv(K.X0-1.2,-K.LAND,K.X1+1.2,K.Z0-1.2);
 pv(K.X0-1.2,K.Z1+3,K.XE0-2.5,K.ZM-1.2);pv(K.XE1+2.5,K.Z1+3,K.X1+1.2,K.ZM-1.2);
 const wE1=portQuayWall(G,-h,K.ZM,K.XE0,K.ZM,d,{ladders:24});
 const wE2=portQuayWall(G,K.XE1,K.ZM,h,K.ZM,d,{ladders:24});
 portQuayWall(G,K.XE0,K.Z1,K.XE0,K.ZM,d,{face:[1,0],fenders:6,ladders:0,bollards:0});
 portQuayWall(G,K.XE1,K.Z1,K.XE1,K.ZM,d,{face:[-1,0],fenders:6,ladders:0,bollards:0});
 ddMoleSides(G,opt.nb,d,-K.LAND,K.ZM);
 // ---- the pit, its gate-end sill walls and the gate
 const pit=ddPit(G,{x0:K.X0,x1:K.X1,z0:K.Z0,z1:K.Z1,d,dry,n:K.N,T:K.T,floor:FL});
 const cm=dry?DDM.concrete:CONC(d);
 for(const [a,b] of [[K.X0-1.2,K.XE0],[K.XE1,K.X1+1.2]])pbBox(G,cm,(a+b)/2,(D+.2+FL-1)/2,K.Z1+1.5,b-a,D+.2-FL+1,3,0,8,!dry);
 ddGate(G,K.XE0,K.XE1,K.Z1,FL,d,dry);
 REGISTER({name:'Graving dock',x:0,z:(K.Z0+K.Z1)/2,r:24,h:D-FL+2,y:FL-1});
 REGISTER({name:'Graving dock — head',x:0,z:K.Z0+22,r:22,h:D-FL+2,y:FL-1});
 // ---- rails for the gantry, the gantry, the pump house, lamps
 for(const x of [-K.RAIL,K.RAIL])for(let z=-K.LAND+10;z<K.ZM-10;z+=20)
  if(!(d===1&&rng()<.2))kput('pkRail',[x,D,z],qEuler(0,Math.PI/2,0),1,d>0?new THREE.Color(0x7a4a32):null);
 const gz0=d===3?-40:K.GZ;
 ddGantry(G,{xa:-K.RAIL,xb:K.RAIL,z:gz0,H:44,d,dry,trolley:.42,hookY:d===0?16:D+18,load:d===0?[12,3,9]:null});
 portShed(G,37,-86,12,18,7,d,{name:'Dock pump house',doorSide:-1});
 for(const s of [-1,1])for(let z=-K.LAND+16;z<K.ZM-6;z+=34)portLamp(s*(h-9),D,z,s<0?Math.PI/2:-Math.PI/2,d);
 // the dockmaster's drum by the gate: a white drum, a blue glass band
 ddDrum(G,-40,K.Z1+2,4.2,d);
 // ---- per decay
 if(d===0){
  const H=ddHull(G,{L:124,B:20,D:14,x:0,y:FL+.05+1.9,z:-14,yaw:Math.PI,dry:true,d,paint:'new',sup:true,blocks:FL+.05,seed:3});
  // breast shores from the third and fourth altars to the hull's sides
  for(let u=.24;u<.78;u+=8/124)for(const s of [-1,1]){
   const pick=th=>{let p=H.xf(H.sec(u,th));if(p[0]*s<0)p=H.xf(H.sec(u,-th));return p;};   // the side facing this altar
   const hp=pick(1.18),y3=pit.y(3),xt=s*(-K.X0-3*K.T+.8);beam('ddTimbD',[xt,y3+.2,hp[2]],[hp[0]+s*.15,hp[1],hp[2]],.35,.35,null);
   const hp2=pick(1.42),y2=pit.y(2),xt2=s*(-K.X0-2*K.T+.8);beam('ddTimbD',[xt2,y2+.2,hp2[2]],[hp2[0]+s*.1,hp2[1],hp2[2]],.3,.3,null);}
  ddScaffold(G,-11.6,-44,6,FL+.05,D-3,true,d);
  ddFigures(0,FL+.05,-14,14,13,50,true);ddFigures(-12.2,-9.9,-22,4,.3,18,true);ddFigures(-12.2,-5.9,-22,3,.3,18,true);
  // plate stacks and a container block on the mole
  for(let i=0;i<4;i++){const x=-44+i*4.6,z=-50+rr(-2,2);for(let k=0;k<5;k++)kput('ddPrim',[x,D+.15+k*.28,z],qEuler(0,rr(-.05,.05),0),[3.2,.25,9],null);}
  REGISTER({name:'Steel plate stacks',x:-37,z:-50,r:9,h:3,y:D});
  portContainerStack(38,D,20,Math.PI/2,3,3,d,{big:true});REGISTER({name:'Container block',x:38,z:20,r:8,h:9,y:D});
  portFigures(-40,D,0,10,6);portFigures(38,D,-40,6,6);portFigures(0,D,K.ZM-10,6,20);
  portBuoy(-30,110);portBuoy(34,104);}
 if(d===1){
  ddHull(G,{L:124,B:20,D:14,x:1.5,y:-9.6,z:-16,yaw:Math.PI+.03,roll:.16,pitch:-.012,d,paint:'rust',sup:true,holes:.75,seed:5});
  REGISTER({name:'Hulk in the flooded dock',x:0,z:-16,r:22,h:24,y:-10});
  portWeeds(-h+4,-K.LAND+4,K.X0-3,K.ZM-4,120,D);portWeeds(K.X1+3,-K.LAND+4,h-4,K.ZM-4,120,D);portWeeds(K.X0,-K.LAND+4,K.X1,K.Z0-3,30,D);
  portTrees(-h+8,-90,-34,-20,5,D,5,11);portTrees(34,-60,h-8,40,4,D,4,10);
  for(let i=0;i<40;i++){const s=rng()<.5?-1:1,st=1+Math.floor(rng()*2),z=rr(K.Z0,K.Z1);  // moss on the altars above the water
   kput('moss',[s*(-K.X0-(st-.5)*K.T),pit.y(st)+.1,z],null,[rr(.6,1.2),.2,rr(.8,2.4)],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.14)));}
  portContainerStack(38,D,20,Math.PI/2,3,2,d,{big:true});REGISTER({name:'Container block',x:38,z:20,r:8,h:9,y:D});
  portContainer(33,D+1.2,4,1.9,true,1,null,[Math.PI/2*.97,.05]);
  kput('pkSkiff',[8,-.7,40],qEuler(0,.6,Math.PI*.9),1,new THREE.Color(0x5a4636));
  portRubble(-26,D,30,4,10);portRubble(27,D,-66,5,12);}
 if(d===3){
  // the garden terrace at the head of the pit, its retaining wall, planting
  const zt=K.Z0+34,GY=K.GY;portQuayWall(G,K.X0,zt,K.X1,zt,d,{top:GY,cope:true,fenders:0,ladders:0,bollards:0});
  for(let i=0;i<5;i++)portGarden(-14+i*7,GY,K.Z0+10+rr(-2,4),6,14,d);
  portTrees(-18,K.Z0+4,18,zt-6,5,GY,4,8);portFigures(0,GY,K.Z0+20,10,14);
  REGISTER({name:'Dock garden terrace',x:0,z:K.Z0+17,r:17,h:8,y:1});
  // houseboats (container houses on rafts), fish pens, skiffs, the boom
  const hbz=[-40,-14,12,38];hbz.forEach((z,i)=>{const x=i%2?7:-7;
   pbBox(G,MAT.timber,x,.25,z,14.5,.9,6.4,0,4,true);for(const s of [-1,1])kput('pkTyre',[x+s*7.3,.4,z],qEuler(0,Math.PI/2,0),1,null);
   portContainerHouse(G,x,.7,z,0,d,{levels:i===1?2:1});});
  for(const [x,z] of [[9,-30],[-9,0],[9,24]]){for(const s of [-1,1]){kput('ddTimb',[x+s*4,.25,z],null,[.5,.5,8.5],null);kput('ddTimb',[x,.25,z+s*4],null,[8.5,.5,.5],null);}
   kput('stain',[x,.2,z],qEuler(-Math.PI/2,0,0),[7.4,7.4,1],new THREE.Color(0x1a2a24));}
  REGISTER({name:'Fish pens',x:0,z:-2,r:14,h:3,y:-1});
  for(let i=0;i<8;i++)portSkiff(rr(-11,11),rr(zt+4,K.Z1-4),rr(-.3,.3)+Math.PI*(i%2));
  for(let x=K.XE0+2;x<K.XE1-6;x+=3.2)pbBox(G,MAT.timber,x,.3,K.Z1+6,2.8,.8,1.6,rr(-.08,.08),4,true);   // the boom, a gap to the east
  // container houses along both dock walls, and up on the gantry girder
  for(const s of [-1,1])for(let z=-K.LAND+18;z<K.ZM-16;z+=17){if(s>0&&z>-100&&z<-72)continue;if(Math.abs(z-gz0)<14)continue;
   portContainerHouse(G,s*38+rr(-1,1),D,z,Math.PI/2+rr(-.12,.12),d);}
  for(const x of [-26,-12,6])portContainerHouse(G,x,D+44+4.4,gz0-.4,rr(-.06,.06),d,{levels:1,big:false});
  for(const s of [-1,1])kput('pkLadder',[s*(K.RAIL+1.6),D+44,gz0-2.6],null,[1,4.4,1],new THREE.Color(0x8a5a3a));
  portWashLine(-30,gz0+2,30,gz0+2,D+42,16);
  // pontoon walkway along the west altar, stalls on the mole end
  for(let z=zt+4;z<K.Z1-3;z+=4.2)pbBox(G,MAT.timber,-16.4,.35,z,2.2,.5,4,0,4,true);
  for(let x=-44;x<-24;x+=6.5)portStall(x,D,K.ZM-12,Math.PI+rr(-.1,.1));
  for(const L of wE1.ladders.concat(wE2.ladders))portSkiff(L[0]+rr(-3,3),L[1]+3,Math.PI/2+rr(-.2,.2));
  portFigures(-36,D,-20,18,10);portFigures(36,D,10,14,10);portFigures(0,D,K.ZM-10,10,20);
  portWeeds(-h+4,-K.LAND+4,h-4,K.ZM-4,60,D);}
 KOFF=[0,0,0];return G;}

// The caisson gate: a steel box across the entrance at z1..z1+5. Intact: white
// above the waterline (red below it, the dry-pit twin so the pit face does not
// fade), a railed walkway on top. Ruined: breached - one half torn off and
// lying tilted in the entrance, the other canted. Reclaimed: gone (a boom
// replaces it), only its seating remains.
function ddGate(G,xa,xb,z1,fl,d,dry){const D=PORT.DECK,w=xb-xa+2,xc=(xa+xb)/2;
 if(d===0){pbBox(G,MAT.pkPaint,xc,(D+.8)/2,z1+2.5,w,D+.8,5,0,8);pbBox(G,DDM.ddAnti,xc,fl/2-.25,z1+1.25,w,-fl+.5,2.5,0,8);   // the dry face does not fade...
  pbBox(G,MAT.ddAnti,xc,fl/2-.25,z1+3.75,w,-fl+.5,2.5,0,8,true);                       // ...the sea face does
  pbBox(G,DDM.ddTop,xc,D+.2,z1+2.5,w+.1,.5,5.1,0,8);
  for(const s of [-1,1])for(let x=xa+1.5;x<xb;x+=5)kput('pkGuard',[x,D+.8,z1+2.5+s*2.3],null,1,null);
  REGISTER({name:'Caisson gate',x:xc,z:z1+2.5,r:w/2,h:D-fl+1,y:fl});}
 else if(d===1){const g=boxUV(w*.52,D-fl,5,8);g.translate(0,(D-fl)/2,0);g.rotateX(-.42);g.rotateZ(.12);g.translate(xa+w*.22,fl+1.5,z1+6);pbAdd(g,MAT.rust,G);
  const g2=boxUV(w*.44,D-fl-3,5,8);g2.translate(0,(D-fl-3)/2,0);g2.rotateX(.08);g2.rotateZ(-.05);g2.translate(xb-w*.24,fl,z1+2.5);pbAdd(g2,MAT.rust,G);
  REGISTER({name:'Breached caisson gate',x:xc,z:z1+4,r:w/2,h:D-fl,y:fl});}
 else{pbBox(G,CONC(d),xc,fl+1,z1+2.5,w,2,5,0,8,true);}}

// A white drum office with a blue glass band and a flat roof disc.
function ddDrum(G,x,z,r,d){const D=PORT.DECK;
 pbAdd(pgeo(lathe({rFn:()=>r,H:3,nu:20,nv:1}),x,D,z),SHELL(d),G);
 if(d===0)mesh(lathe({rFn:()=>r*1.03,H:2.4,nu:24,nv:1}),MAT.glass,G,x,D+3,z);
 pbAdd(pgeo(lathe({rFn:()=>r*.97,H:2.4,nu:20,nv:1}),x,D+3,z),MAT.dark,G);
 kput('slab',[x,D+5.6,z],null,[r*1.25,.5,r*1.25],d>0?new THREE.Color(0x6a625a):new THREE.Color(0xf2efe8));
 if(d>0)vinesOnRing(x,D+5.4,z,r+.2,5,5);else ddLight(x,D+6.2,z,d,[.5,.5,.5]);
 REGISTER({name:'Dockmaster’s office',x,z,r:r*1.3,h:7,y:D});}

// Staging along a hull side: two rows of standards at x and x-1.2 over
// z0..z0+n*... (n bays of 3 m), lifts every 4 m from y0 to y1, plank decks.
function ddScaffold(G,x,z0,nb,y0,y1,dry,d){const k=ddK('ddSteel',dry),kt=ddK('ddTimb',dry),z1=z0+nb*7;
 for(let z=z0;z<=z1+.01;z+=3.5)for(const dx of [0,-1.2])kput(k,[x+dx,(y0+y1)/2,z],null,[.09,y1-y0,.09],null);
 for(let y=y0+4;y<=y1;y+=4){kput(kt,[x-.6,y,(z0+z1)/2],null,[1.4,.08,z1-z0],null);
  for(const dx of [0,-1.2])kput(k,[x+dx,y+1,(z0+z1)/2],null,[.07,.07,z1-z0],null);}
 REGISTER({name:'Staging',x:x-.6,z:(z0+z1)/2,r:(z1-z0)/2,h:y1-y0,y:y0});}

PORT_SEG({key:'ddDock',name:'Graving dock',cls:'seg',W:110,LAND:DDK.LAND,SEA:DDK.SEA,decays:[0,1,3],stamps:ddDockStamps,build:buildDdDock});
