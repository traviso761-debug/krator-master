// ================================================================= EASTERN HIGH DESERT — fauna
// The first fauna layer on the biome contract. Four kinds, each placed from
// the same climate fields the flora reads, and animated by the biome itself
// through BIO.tick (the core makes the dynamic instanced meshes, BIO.dynamic):
//   KITES      big broad-winged raptors circling in thermals over the mesas,
//              the butte and the canyon: a few birds per thermal, banked into
//              the turn, climbing and sinking slowly, wingspan 3 m
//   SWIFTS     flocks of small fast birds over the pond and the canyon's water,
//              a flat swarm that never quite settles
//   STRIDERS   long-legged flightless walkers in small bands on the canyon
//              floor and at the pond, pacing the river; sand-coloured, 2.4 m
//   LIZARDS    basking on the floor's boulders (SEDESERT.ROCKS), banded, still
// Tags follow the project rule. No fauna is ever part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SEDESERT.PAL,zones=SEDESERT.zones,C=SEDESERT.C,{bright,vary}=SEDESERT;
const T3=BIO.host.THREE;
SEDESERT.FAUNA=[
 {key:'kite',name:'Desert kite',span:[2.6,3.4],tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'both'}},
 {key:'swift',name:'Wadi swift',span:[.6,.8],tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'yes'}},
 {key:'strider',name:'Sand strider',H:[2.0,2.7],tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'both'}},
 {key:'lizard',name:'Rock lizard',L:[.25,.45],tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
];
// ---------------------------------------------------------------- geometries (unit, vertex-coloured)
const G={};
// a gliding bird: a body spindle and two swept wings, span 1 along x, facing +z, vertex-coloured (pale underside)
G.bird=function(){const pos=[],nor=[],col=[];
 const tri=(a,b,c,cc)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;
  [a,b,c].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(nx/l,ny/l,nz/l);col.push(cc,cc,cc);});};
 const body=[[0,0,.16],[.03,.02,0],[-.03,.02,0],[0,-.03,0],[0,0,-.14]];
 tri(body[0],body[1],body[3],.9);tri(body[0],body[3],body[2],.9);tri(body[0],body[2],body[1],.55);
 tri(body[4],body[3],body[1],.9);tri(body[4],body[2],body[3],.9);tri(body[4],body[1],body[2],.55);
 for(let s=-1;s<=1;s+=2){const root=[s*.03,.02,.03],mid=[s*.28,.04,.0],tip=[s*.5,.0,-.06],back=[s*.2,.02,-.1];
  // top (dark) and underside (pale), both faces
  tri(root,mid,back,.5);tri(mid,tip,back,.5);tri(root,back,mid,.95);tri(mid,back,tip,.95);}
 const tail=[[0,0,-.12],[.06,0,-.24],[-.06,0,-.24]];tri(tail[0],tail[1],tail[2],.6);tri(tail[0],tail[2],tail[1],.9);
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// a strider's body: a plump spindle with a long neck and a small head, facing +z, legs are rods
G.striderBody=function(){const g=new T3.SphereGeometry(.5,8,6);g.scale(.55,.6,1);
 const neck=new T3.CylinderGeometry(.06,.1,1.0,5).translate(0,.5,0).rotateX(-.7).translate(0,.4,.4);
 const head=new T3.SphereGeometry(.15,6,5).scale(1,.8,1.6).translate(0,1.12,1.06);
 const parts=[g,neck,head],pos=[],nor=[],col=[];
 parts.forEach((p,i)=>{const q=p.toNonIndexed(),a=q.attributes.position.array,n=q.attributes.normal.array;for(let k=0;k<a.length;k+=3){pos.push(a[k],a[k+1],a[k+2]);nor.push(n[k],n[k+1],n[k+2]);const sh=i===0?(a[k+1]<-.1?.98:.8):.75;col.push(sh,sh,sh);}});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// a lizard: a flat body, a tapering tail, a wedge head; length 1 along +z, banded by vertex colour
G.lizard=function(){const pos=[],nor=[],col=[];const P=[];
 const W=u=>u<.35?.16*Math.sin(u/.35*Math.PI*.5+.4):u<.62?.16:.16*(1-(u-.62)/.38);
 const H=u=>u<.62?.07:.07*(1-(u-.62)/.38)+.005;
 const n=12;for(let i=0;i<=n;i++){const u=i/n,z=u-.45,w=W(u),h=H(u),band=(i%3===0)?.55:1;P.push([[-w,0,z,band],[0,h,z,band*1.1],[w,0,z,band]]);}
 const push=(p,nn)=>{pos.push(p[0],p[1],p[2]);nor.push(nn[0],nn[1],nn[2]);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<n;i++){const a=P[i],b=P[i+1];for(let s=0;s<2;s++){const a0=a[s],a1=a[s+1],b0=b[s],b1=b[s+1],nn=s===0?[-.6,.8,0]:[.6,.8,0];push(a0,nn);push(b1,nn);push(b0,nn);push(a0,nn);push(a1,nn);push(b1,nn);}}
 for(let k=0;k<4;k++){const s=k<2?-1:1,z=k%2?.05:-.25,leg=[[s*.1,.03,z,.7],[s*.3,.0,z-.06*s,.7],[s*.3,.0,z+.06,.7]];push(leg[0],[0,1,0]);push(leg[1],[0,1,0]);push(leg[2],[0,1,0]);}
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// ---------------------------------------------------------------- materials
const M={
 bird:BIO.leafMat(null,'fauna-bird',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 body:BIO.leafMat(null,'fauna-body',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
BIO.def('lizard',G.lizard(),M.body,{label:'Rock lizards'});
// ---------------------------------------------------------------- the pass
// Static fauna is put like any item; the moving kinds are laid out here and
// driven by one tick.
SEDESERT.buildFauna=function(R,q){
 reseed(700021);q=q==null?1:q;R=R||3000;const T=T3,st={kites:0,swifts:0,striders:0,lizards:0,thermals:0,flocks:0,bands:0};
 const LOD=BIO.LOD(),Y=(x,z)=>BIO.terrainH(x,z);
 // ---- lizards: on the boulders the floor left, where the ground is dry and rocky
 SEDESERT.ROCKS.forEach(r=>{if(rng()>.28*q)return;const Z=zones(r[0],r[2]);if(Z.scrub+Z.bad+Z.rim+Z.mtn<.3)return;
  const L=rr(.25,.45),c=bright(vary(pick([0x8a7a5a,0x9a8a6a,0x6a5a4a,0xa0805a]),.03,.1,.06),1.1);
  BIO.put('lizard',[r[0]+rr(-.3,.3)*r[3],r[1],r[2]+rr(-.3,.3)*r[3]],qEuler(0,rr(0,TAU),0),[L,L,L],c);st.lizards++;});
 // ---- kites: thermals over high ground, the canyon and the butte, a few birds each
 const therm=[];
 BIO.grid(380,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.far)return 0;const Z=zones(x,z);return (Z.rim*.8+Z.bad*.5+Z.up*1.2+Z.scrub*.15)*q;},(x,y,z)=>{
  therm.push({x,z,y0:y+rr(60,140),r:rr(40,90),n:ri(2,5),w:rr(.12,.2)*(rng()<.5?1:-1),ph:rr(0,TAU),climb:rr(20,45)});},{patch:.3,pad:0,noMask:true});
 const kites=[];therm.forEach(t=>{for(let i=0;i<t.n;i++)kites.push({t,a:rr(0,TAU),dr:rr(.8,1.15),dy:rr(-8,8),span:rr(2.6,3.4),ph:rr(0,TAU)});st.thermals++;});
 st.kites=kites.length;
 // ---- swifts: flocks over the pond and the river's water
 const flocks=[];
 BIO.grid(90,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.oasis*.9+Z.bank*.7)*q;},(x,y,z)=>{
  flocks.push({x,z,y0:BIO.waterH(x,z)>-1e8?BIO.waterH(x,z)+rr(6,14):y+rr(6,14),n:ri(14,30),r:rr(18,40),ph:rr(0,TAU),w:rr(.5,.9)});},{patch:.4,pad:0,noMask:true,depth:[-3,3],box:BIO.window('water')});
 const swifts=[];flocks.forEach(f=>{for(let i=0;i<f.n;i++)swifts.push({f,p:rr(0,TAU),q:rr(0,TAU),k:rr(.7,1.3),span:rr(.6,.8)});st.flocks++;});
 st.swifts=swifts.length;
 // ---- striders: bands on the canyon floor and at the pond, walking the river's way and back
 const bands=[];
 BIO.grid(110,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.rip*.6+Z.oasis*.5)*q*smooth(.4,.15,Z.slope);},(x,y,z)=>{
  bands.push({x,z,n:ri(4,9),ph:rr(0,TAU),dir:rr(0,TAU),len:rr(40,80),sp:rr(.9,1.4)});},{patch:.2,pad:3});
 const striders=[];bands.forEach(b=>{for(let i=0;i<b.n;i++)striders.push({b,ox:rr(-9,9),oz:rr(-9,9),H:rr(2.0,2.7),ph:rr(0,TAU),c:bright(vary(pick([0xa88858,0x987848,0xb09060,0x8a6a40]),.02,.08,.05),.9).convertSRGBToLinear()});st.bands++;});   // an instance colour is LINEAR (BIO.put converts; a dynamic mesh must itself)
 st.striders=striders.length;
 // ---- the dynamic meshes
 const kiteM=kites.length?BIO.dynamic('kite',G.bird(),M.bird,kites.length,{label:'Desert kites'}):null;
 const swiftM=swifts.length?BIO.dynamic('swift',G.bird(),M.bird,swifts.length,{label:'Wadi swifts'}):null;
 const bodyM=striders.length?BIO.dynamic('strider',G.striderBody(),M.body,striders.length,{label:'Sand striders'}):null;
 const legM=striders.length?BIO.dynamic('striderleg',BIO.geo.rod(5),M.solid,striders.length*2,{label:'Sand striders'}):null;
 const m=new T.Matrix4(),p=new T.Vector3(),qq=new T.Quaternion(),s=new T.Vector3(),e=new T.Euler(),c=new T.Color();
 const setI=(im,i,x,y,z,rx,ry,rz,sx,sy,sz,col)=>{p.set(x,y,z);e.set(rx,ry,rz,'YXZ');qq.setFromEuler(e);s.set(sx,sy,sz);m.compose(p,qq,s);im.setMatrixAt(i,m);if(col)im.setColorAt(i,col);};
 const kiteCol=C(0x4a3a2c).convertSRGBToLinear(),swiftCol=C(0x3a3a3c).convertSRGBToLinear();
 // the first frame lays everyone out; the colours are set once
 let first=true;
 BIO.tick((dt,t)=>{
  if(kiteM){kites.forEach((k,i)=>{const th=k.t,a=k.a+t*th.w,r=th.r*k.dr,x=th.x+Math.cos(a)*r,z=th.z+Math.sin(a)*r,y=th.y0+k.dy+th.climb*Math.sin(t*.05+k.ph);
   const sg=Math.sign(th.w),heading=Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg);   // along the circle's tangent
   setI(kiteM,i,x,y,z,.06*Math.sin(t*.7+k.ph),heading,-.45*sg,k.span,k.span,k.span,first?kiteCol:null);});kiteM.instanceMatrix.needsUpdate=true;if(first)kiteM.instanceColor.needsUpdate=true;}
  if(swiftM){swifts.forEach((w,i)=>{const f=w.f,u=t*f.w*w.k,x=f.x+Math.cos(u+w.p)*f.r*Math.sin(u*.37+w.q),z=f.z+Math.sin(u*1.13+w.q)*f.r*.8,y=f.y0+4*Math.sin(u*1.7+w.p)+2*Math.cos(u*.6);
   const vx=-Math.sin(u+w.p)*f.r*Math.sin(u*.37+w.q),vz=Math.cos(u*1.13+w.q)*f.r*.8,heading=Math.atan2(vx,vz);
   setI(swiftM,i,x,y,z,0,heading,.3*Math.sin(u*2+w.p),w.span,w.span,w.span,first?swiftCol:null);});swiftM.instanceMatrix.needsUpdate=true;if(first)swiftM.instanceColor.needsUpdate=true;}
  if(bodyM){striders.forEach((sd,i)=>{const b=sd.b,u=(t*b.sp+sd.ph*20)%(b.len*2),along=u<b.len?u:b.len*2-u,fwd=u<b.len?1:-1;
   const x=b.x+Math.cos(b.dir)*(along-b.len/2)+sd.ox,z=b.z+Math.sin(b.dir)*(along-b.len/2)+sd.oz,g=Y(x,z),legH=sd.H*.5,step=t*b.sp*2.4+sd.ph,bob=.06*Math.abs(Math.sin(step));
   const heading=Math.atan2(Math.cos(b.dir)*fwd,Math.sin(b.dir)*fwd),y=g+legH+bob;
   setI(bodyM,i,x,y,z,0,heading,0,sd.H*.62,sd.H*.62,sd.H*.62,first?sd.c:null);
   const dz=Math.sin(step)*.35,cd=Math.cos(heading),sn=Math.sin(heading);
   for(let l=0;l<2;l++){const sg=l?1:-1,swing=dz*sg,lx=x+cd*.18*sg*-1+sn*swing*legH,lz=z-sn*.18*sg*-1+cd*swing*legH;
    setI(legM,i*2+l,(x+lx)/2,g+legH*.55,(z+lz)/2,swing*.9,heading,0,.11,legH*1.1,.11,first?sd.c:null);}});   // the swing is fore-aft: about the local x
   bodyM.instanceMatrix.needsUpdate=true;legM.instanceMatrix.needsUpdate=true;if(first){bodyM.instanceColor.needsUpdate=true;legM.instanceColor.needsUpdate=true;}}
  first=false;});
 SEDESERT.FAUNA_LAYOUT={thermals:therm,flocks:flocks,bands:bands};   // a world's camera may want to find them
 therm.forEach(t=>BIO.register({name:'Kite thermal',x:t.x,z:t.z,y:t.y0-60,r:t.r*1.2+6,h:t.climb+80}));
 bands.forEach(b=>BIO.register({name:'Sand striders',x:b.x,z:b.z,y:Y(b.x,b.z)-4,r:b.len/2+14,h:10}));
 return{fauna:st};};
})();
BIO.kitEnd(SEDESERT);   // its exports run in its registry; the default kit is current again
