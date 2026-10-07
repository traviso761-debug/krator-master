// ================================================================= HOST — the frontier's layout: rows, stumps, slash, walls, traps
// What the colonists and the natives have made of the ground, as RECORDS first (README.md: a world rule lives in data,
// the drawing is only its picture), then drawn:
//   ROWS     the planted spice trees, in rows along the contours of each terrace (THRONE.make + grow: the kit's own
//            builder, T.planted: thin, yellowing, no resin: the tree's fungus has not taken here)
//   STUMPS   the hypertrees felled for the fields and the clearings: sawn stumps metres across, buttressed, ringed tops
//   SLASH    the felled crowns, burnt where the clearing was fired
//   WALLS    stones laid along the terraces' risers
//   TRAPS    the natives' snares and punji pits where their trails meet the plantations (culture: the Throne's natives)
// Runs before 88 builds the kits: the stumps are obstacles the kits plant round (the rows need not be: no tree is planted
// in a field).
const FRONTIER={rows:[],stumps:[],traps:[],walls:0,slash:0};
(function(){const R=BIO.fn.reseed;R(8601);
 const C=h=>new THREE.Color(h),rr2=BIO.fn.rr,ri2=BIO.fn.ri,pk=BIO.fn.pick,rg=BIO.fn.rng;
 const LOD=BIO.radii(),lvAt=(x,z)=>{const d=BIO.lodD(x,z);return d<LOD.hero?2:d<LOD.mid?1:0;};
 // ---- the host's own items and buckets (the default kit's registry; the bake draws every kit's)
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('hyperjungle',n)||KMAT.packed('throne',n):null;
 const tex=n=>{const L=lib(n);return L?KMAT.textures(L,{aniso:4}).map:null;};
 BIO.bucket('stump',BIO.barkMat(tex('bark.mahogany')),{label:'Felled hypertrees (stumps, logs)',uvScale:[6,8]});
 BIO.bucket('char',BIO.barkMat(tex('bark.charred')),{label:'Burnt slash',uvScale:[2,3]});
 BIO.bucket('stake',BIO.barkMat(null),{label:'Stakes and saplings',uvScale:[1,1]});
 // a sawn top: growth rings round a darker heart, the saw's marks across it
 const RINGS=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c8a478';g.fillRect(0,0,w,h);
  for(let r=124;r>2;r-=rr2(2,5)){g.strokeStyle='rgba(120,80,50,'+(.25+rg()*.35).toFixed(2)+')';g.lineWidth=rr2(.6,2);g.beginPath();g.ellipse(128+rr2(-2,2),128+rr2(-2,2),r,r*rr2(.94,1),0,0,Math.PI*2);g.stroke();}
  g.fillStyle='rgba(90,55,35,.6)';g.beginPath();g.arc(128,128,10,0,Math.PI*2);g.fill();
  for(let i=0;i<40;i++){g.strokeStyle='rgba(255,240,210,.12)';g.lineWidth=1;const y=rg()*h;g.beginPath();g.moveTo(0,y);g.lineTo(w,y+rr2(-8,8));g.stroke();}});
 BIO.def('sawtop',new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),BIO.solidMat(RINGS),{label:'Sawn stump tops'});
 BIO.def('wallstone',new THREE.IcosahedronGeometry(1,0),BIO.solidMat(tex('stone.pumice')),{label:'Terrace wall stones'});
 BIO.def('pit',new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),BIO.solidMat(null),{label:'Punji pits'});
 BIO.def('cord',new THREE.TorusGeometry(1,.06,4,12),BIO.solidMat(null),{label:'Snare nooses'});
 BIO.def('leafcover',BIO.geo.mat(),THRONE.MAT?BIO.leafMat(THRONE.TEX.litter,'frontier-litter',{swayW:'0.0',swayA:0,alphaTest:.35}):BIO.solidMat(null),{label:'Leaf cover over a pit'});
 const Y=(x,z)=>terrainH(x,z),qE=(a,b,c)=>BIO.fn.qEuler(a,b,c);

 // ---- ROWS: along the contours (p), one tree every 9 m, a row every 11 m up the field (clove orchards' spacing); mature
 // fields full grown, young short
 for(const F of FIELDS){if(F.kind==='clear')continue;const young=F.kind==='young';
  for(let u=F.u[0]+6;u<F.u[1]-4;u+=11)for(let p=F.p[0]+5;p<F.p[1]-4;p+=9){const pp=p+rr2(-.6,.6),uu=u+rr2(-.6,.6),c=xzOf(uu,pp);
   if(fieldIn(uu,pp,F,3)<.9||riserAt(c[0],c[1])>.15||rg()<.04)continue;   // a gap here and there: a tree that died
   const lv=lvAt(c[0],c[1]),T=THRONE.make(0,c[0],Y(c[0],c[1]),c[1]);
   T.planted=true;T.H=young?rr2(2.2,4):rr2(5,9);T.crownR=young?rr2(1,1.6):rr2(2.2,3.4);T.rb=young?rr2(.06,.1):rr2(.14,.24);
   FRONTIER.rows.push({x:c[0],z:c[1],field:F.i,H:T.H,planted:true});
   THRONE.grow(T,lv);}}
 // (not obstacles: neither kit plants a tree in a field, and BIO.clearOf scans its list linearly: 6,000 entries made
 // both kits' builds 3x slower)

 _mark('rows');
 // ---- STUMPS: the felled hypertrees, in the clearings and along the fields' upper edges
 const stump=(x,z,r,h,burnt)=>{const y=Y(x,z),fins=ri2(4,6),ph=rr2(0,6.3),col=burnt?C(0x2a2622):C(pk([0x6a4a36,0x5e4230,0x765440]));
  const P=[{x,y:y-1.5,z,r:r*1.15,col},{x,y:y+h*.3,z,r:r*1.02,col},{x,y:y+h,z,r,col}];
  BIO.tube(burnt?'char':'stump',P,col,{seg:22,cap:false,rfn:(i,a)=>1+.55*smooth(1.2,0,i)*Math.pow(Math.abs(Math.sin((a+ph)*fins/2)),4)});
  BIO.put('sawtop',[x,y+h+.02,z],qE(rr2(-.03,.03),rr2(0,6.3),rr2(-.03,.03)),r*1.01,burnt?C(0x3a3028):C(0xffffff));
  FRONTIER.stumps.push({x,z,r,h,burnt});OBSTACLES.push({x,z,r:r*1.6});
  REGISTER({name:burnt?'A felled hypertree\'s stump (the clearing was fired)':'A felled hypertree\'s stump',x,z,y:y-2,r:r*1.7,h:h+4});};
 for(const F of FIELDS){const clear=F.kind==='clear',n=clear?ri2(6,9):ri2(1,3);
  for(let k=0;k<n;k++){const u=clear?rr2(F.u[0]+20,F.u[1]-20):F.u[1]+rr2(-10,25),p=rr2(F.p[0]+20,F.p[1]-20),c=xzOf(u,p);
   if(OBSTACLES.some(o=>Math.hypot(o.x-c[0],o.z-c[1])<o.r+6))continue;stump(c[0],c[1],rr2(2.5,6.5),rr2(1.2,3),clear&&rg()<.75);}}

 // ---- SLASH: felled crowns in the clearings (charred), a few logs at the fields' edges
 for(const F of FIELDS){const clear=F.kind==='clear';for(let k=0,n=clear?ri2(14,22):ri2(2,5);k<n;k++){
  const u=clear?rr2(F.u[0]+8,F.u[1]-8):F.u[1]+rr2(0,15),p=rr2(F.p[0]+8,F.p[1]-8),c=xzOf(u,p),a=rr2(0,6.3),L=rr2(8,26),r0=rr2(.4,1.4),burnt=clear&&rg()<.8;
  const col=burnt?C(pk([0x1e1b18,0x2c2824])):C(pk([0x6a5440,0x5e4a38])),P=[];let ok=true;
  for(let i=0;i<=4;i++){const t=i/4,x=c[0]+Math.cos(a)*(t-.5)*L,z=c[1]+Math.sin(a)*(t-.5)*L;if(MASK(x,z)<=0){ok=false;break;}P.push({x,y:Y(x,z)+r0*.6,z,r:mix(r0,r0*.4,t),col});}
  if(!ok)continue;BIO.tube(burnt?'char':'stump',P,col,{seg:6,cap:true});FRONTIER.slash++;
  for(let j=0,m=ri2(2,5);j<m;j++){const q=P[ri2(1,3)],b=rr2(0,6.3),el=rr2(.2,1),Lb=rr2(2,6);BIO.tube(burnt?'char':'stump',[{x:q.x,y:q.y,z:q.z,r:q.r*.4,col},{x:q.x+Math.cos(b)*Lb*Math.cos(el),y:q.y+Math.sin(el)*Lb,z:q.z+Math.sin(b)*Lb*Math.cos(el),r:.06,col}],col,{seg:4});}}}

 // ---- WALLS: stones along the terrace risers in the planted fields, near the cameras' paths (the painted riser carries
 // them farther out)
 for(const F of FIELDS){if(F.kind==='clear')continue;
  for(let u=F.u[0];u<F.u[1];u+=1.4)for(let p=F.p[0];p<F.p[1];p+=2.2){const c=xzOf(u,p);if(fieldIn(u,p,F)<.95||BIO.lodD(c[0],c[1])>LOD.mid)continue;
   if(riserAt(c[0],c[1])<.5||rg()<.25)continue;const s=rr2(.35,.7);BIO.put('wallstone',[c[0],Y(c[0],c[1])+s*.3,c[1]],qE(rr2(-.4,.4),rr2(0,6.3),rr2(-.4,.4)),[s*rr2(1,1.4),s*.75,s],C(pk([0x6a6460,0x5e5854,0x77706a])));FRONTIER.walls++;}}

 // ---- TRAPS: where each trail meets its plantation, in its last 120 m: punji pits on the path, snares just off it
 TRAILS.forEach((T,ti)=>{const P=T.pts,n=P.length;let placed=0;
  for(let i=n-3;i>n*.55&&placed<4;i-=ri2(3,6)){const a=P[i],b=P[Math.min(n-1,i+1)],dir=Math.atan2(b[1]-a[1],b[0]-a[0]);
   const kind=placed%2?'snare':'punji';const off=kind==='snare'?rr2(1.6,2.6)*(rg()<.5?-1:1):0,x=a[0]-Math.sin(dir)*off,z=a[1]+Math.cos(dir)*off,y=Y(x,z),id='trap_'+FRONTIER.traps.length;
   const rec={id,kind,x,z,trail:ti,culture:'throne-natives',faction:'the Throne\'s peoples',owner:T.owner,armed:true,targets:'the colonists'};FRONTIER.traps.push(rec);placed++;
   if(kind==='punji'){const w=rr2(.7,1.0);
    // the pit: a dark earthen hollow (the ground's colour, shaded), stakes of split cane standing out of it, fire-hardened tips
    BIO.put('pit',[x,y+.03,z],qE(0,dir,0),[w,1,w*1.4],C(0x3a2a1e));BIO.put('pit',[x,y+.035,z],qE(0,dir,0),[w*.7,1,w],C(0x1e1610));
    for(let k=0;k<ri2(12,18);k++){const sx=x+rr2(-w,w)*.55,sz=z+rr2(-w,w)*.75,h=rr2(.55,1.0);BIO.tube('stake',[{x:sx,y:y-.3,z:sz,r:.045,col:C(0xa08860)},{x:sx+rr2(-.1,.1),y:y-.3+h*.8,z:sz+rr2(-.1,.1),r:.03,col:C(0xb89a68)},{x:sx+rr2(-.12,.12),y:y-.3+h,z:sz+rr2(-.12,.12),r:.002,col:C(0x3a2a1a)}],C(0xa08860),{seg:4});}
    // half covered over with a mat of leaves on split canes: the stakes show through where it has fallen in
    BIO.put('leafcover',[x+rr2(-.2,.2),y+.06,z+rr2(-.2,.2)],qE(0,dir+rr2(-.3,.3),0),[w*1.1,1,w*.9],C(0x5a4a30));
    REGISTER({name:'A punji pit (sharpened stakes under a leaf mat)',x,z,y:y-1,r:w*1.6,h:2,trap:id,culture:'throne-natives'});}
   else{// a bent sapling tied down to a trigger peg, a cord noose over the path's edge
    const bx=x+Math.cos(dir+1.57)*.8,bz=z+Math.sin(dir+1.57)*.8,top=[x,y+1.1,z];
    BIO.tube('stake',[{x:bx,y:Y(bx,bz)-.2,z:bz,r:.05,col:C(0x6a5a3a)},{x:mix(bx,x,.4),y:y+2.2,z:mix(bz,z,.4),r:.035,col:C(0x6a5a3a)},{x,y:top[1],z,r:.02,col:C(0x6a5a3a)}],C(0x6a5a3a),{seg:4});
    BIO.tube('stake',[{x,y:y-.1,z,r:.025,col:C(0x8a7050)},{x,y:y+.35,z,r:.02,col:C(0x8a7050)}],C(0x8a7050),{seg:3});
    BIO.put('cord',[x,y+.25,z],qE(Math.PI/2,dir,0),.32,C(0xc8b080));
    REGISTER({name:'A snare (a bent sapling, a cord noose)',x,z,y:y-.5,r:1.6,h:3,trap:id,culture:'throne-natives'});}}});
 _mark('walls+traps');
 // the trails and the road as records too
 FRONTIER.paths=[ROAD].concat(TRAILS).map((T,i)=>({id:'path_'+i,kind:T.kind,owner:T.owner,width:T.width,n:T.pts.length,start:T.pts[0],end:T.pts[T.pts.length-1]}));
 FIELDS.forEach(F=>REGISTER({name:F.name,x:F.x,z:F.z,y:Y(F.x,F.z)-30,r:Math.hypot(F.u[1]-F.u[0],F.p[1]-F.p[0])/2,h:60,field:F.i}));
 REGISTER({name:'Zey\'danin (its footprint: a settlement build stands here)',x:CITY.x,z:CITY.z,y:Y(CITY.x,CITY.z)-10,r:CITY.r,h:60,city:true});
})();
