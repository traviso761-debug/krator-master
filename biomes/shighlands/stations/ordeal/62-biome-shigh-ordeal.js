// ================================================================= SOUTHERN HIGHLANDS — STATION 5: THE ORDEAL RAMP (species, items, passes, floor)  [web]
// PLAN-STATIONS.md station 5 (5.1 px 782,1194, 4,426 m, ET / Dsc, 235-329 mm/yr, 0.92 atm): the bleak wind-scoured basalt-and-impactite ramp
// climbing south-east out of Shumar directly under Godthrone's 9.5 km dark flank. Every plant carries tags.spiral and obeys SHIGH.HAND (+1, with
// 1/320 mirror-handed coil junipers). Reuses wind-combed coiljuniper krummholz in sheltered rock lees, spiral cushion domes (surface.cushion),
// snail rosettes (card.rosette.snail), coiled crustose lichens and sparse card.ichu tufts, and adds:
//   THORN-WHORL CUSHION (thornwhorl, whorl, ET/Dsc/BSk): spiny hemispherical tragacanth/Astragalus highland cushion armed with pale straw-ivory
//                       thorns radiating in Fibonacci spirals and small crimson-violet calyxes in the crown (harvest.wood: resinous hearth fuel)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=SHIGH.C,GOLD=SHIGH.GOLD,{shade,bright,vary,tint}=BIO.col;
const {twistTrunk,corkscrew,dirOf,joint,clumpAt,regTree,leafCol,rodCol,nearW,blocked}=SHIGH.TOOLS;
const PAL=SHIGH.PAL;
Object.assign(PAL,{
 juniperBark:[0x826450,0x725644,0x8e705a],juniperLeaf:[0x52685a,0x5e7262,0x485e50],
 dome:[0x648038,0x728e3e,0x808038,0x587432],domeRed:[0x925438,0x824632],
 thornBody:[0x788462,0x848e6c,0x6c7858,0x8e9270],
 snail:[0x8aa898,0x9ab4a4,0x7a9a8a],snailRed:[0xb86a5a,0xa85a50],
 rampBasalt:[0x383a42,0x2e3038,0x444650,0x282a31],dryIchu:[0xc2ae70,0xb49e62,0xcCBA7c]
});
SHIGH.KOPPEN=Object.assign({},SHIGH.KOPPEN,{Dfc:.32,Dsc:.28});
SHIGH.STATION='ordeal';

const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('shigh',n):null;
const libMap=n=>{const L=LIBP(n);if(!L)return null;return{t:KMAT.textures(L,{aniso:4}).map,scale:L.scale,mean:L.mean};};
const card=n=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;return t;};
const lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};

// coil juniper bark & scale-sprays
const BARKS={};
{const L=libMap('bark.juniper'),m=BIO.barkMat(L?L.t:SHIGH.BARKTEX[0]);
 BARKS.barkJ={mean:L&&L.mean!=null?lin(L.mean):BIO.col.texMean(SHIGH.BARKTEX[0])};
 BIO.bucket('barkJ',m,{label:'Coil juniper bark',uvScale:L?L.scale:[3,4]});}
const bcol=(S,k)=>tint(S.bark[k%S.bark.length],BARKS.barkJ.mean,rr(.9,1.08));
{const t=card('needle.juniper'),m=t?BIO.leafMat(t,'njuniper',{aN:true,swayW:'1.0',swayA:.035,alphaTest:.42}):SHIGH.MAT.small;
 BIO.def('njuniper',t?BIO.geo.cells(BIO.geo.clump(),{n:3}):BIO.geo.clump(),m,{attrs:['aN'],label:'Coil juniper scale sprays'});}

// dark basalt & impactite boulders and stones (for the ramp, the dry boulder gulch and the frost-sorted stone spirals)
const RBAS=(function(){const L=libMap('rock.basalt'),mat=BIO.solidMat(L?L.t:SHIGH.ROCKTEX),
 mean=L&&L.mean!=null?lin(L.mean):SHIGH.means().rock;return{mat,mean};})();
BIO.def('bboulder',new T3.IcosahedronGeometry(1,1),RBAS.mat,{label:'Basalt and impactite boulders'});
BIO.def('bstone',new T3.IcosahedronGeometry(1,0),RBAS.mat,{label:'Basalt and impactite stones'});
const basCol=v=>tint(vary(pick(PAL.rampBasalt),.02,.05,.05),RBAS.mean,v==null?rr(.55,.82):v);

// spiral cushion domes (surface.cushion, as station 3)
function domeGeo(nu,nv,n){const g=new T3.SphereGeometry(.5,nu,nv,0,TAU,0,Math.PI/2),p=g.attributes.position,uv=g.attributes.uv,R=[];
 for(let k=0;k<n;k++){const t=(k+.5)/n,ph=Math.acos(1-t*.98),th=k*GOLD;R.push([Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)]);}
 for(let i=0;i<p.count;i++){const x=p.getX(i)*2,y=p.getY(i)*2,z=p.getZ(i)*2;let best=0;
  for(const r of R){const d=(x-r[0])*(x-r[0])+(y-r[1])*(y-r[1])+(z-r[2])*(z-r[2]);best=Math.max(best,Math.exp(-d/.012));}
  const k=1+.07*best;p.setXYZ(i,x*.5*k,y*.5*k*.75,z*.5*k);uv.setXY(i,uv.getX(i)*4,uv.getY(i)*2);}
 g.computeVertexNormals();return g;}
const cushionL=LIBP('surface.cushion'),cushionMap=cushionL?KMAT.textures(cushionL,{aniso:4}).map:null;
if(cushionMap)cushionMap.wrapS=cushionMap.wrapT=T3.RepeatWrapping;
const MDOME=BIO.solidMat(cushionMap,0xffffff);
BIO.def('sdome',domeGeo(28,10,89),MDOME,{label:'Spiral cushions'});
BIO.def('sdomelo',domeGeo(12,5,34),MDOME,{label:'Spiral cushions (mid distance)'});

// snail-shell rosette wired onto card.rosette.snail (leaf.snail cell in materials.json)
const MSNAIL=(function(){const L=LIBP('leaf.snail');if(!L||!L.cell)return SHIGH.MAT.gsilver;
 const box=L.cell,c=document.createElement('canvas');c.width=c.height=256;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const src=KMAT.textures(L,{aniso:4,flipY:false}).map;
 const draw=img=>{const w=img.width,h=img.height,g=c.getContext('2d');
  g.drawImage(img,box[0]*w,box[1]*h,(box[2]-box[0])*w,(box[3]-box[1])*h,0,0,256,256);t.needsUpdate=true;};
 if(src.image)draw(src.image);else(src._onImage||(src._onImage=[])).push(draw);
 return BIO.leafMat(t,'msnail',{swayW:'(position.y)',swayA:.025,alphaTest:.4,vertexColors:true});})();
BIO.def('snail',SHIGH.G.whorl({uv:1,n:28,div:TAU*.27,len:t=>1-.75*t,wid:t=>.34,wid0:.55,el:t=>mix(.15,1.5,Math.pow(t,.8)),curl:.55,
 cB:[.62,.72,.64],cM:[.82,.9,.84],cT:[.96,.96,.92]}),MSNAIL,{label:'Snail-shell rosettes'});
BIO.def('snaillo',SHIGH.G.whorl({uv:1,n:9,div:TAU*.27,len:t=>1-.75*t,wid:t=>.38,wid0:.58,el:t=>mix(.15,1.5,Math.pow(t,.8)),curl:.5,
 cB:[.62,.72,.64],cM:[.82,.9,.84],cT:[.96,.96,.92]}),MSNAIL,{label:'Snail-shell rosettes (mid distance)'});

// THORN-WHORL CUSHION (Astragalus / tragacanth spiny cushion): a compact sage-olive dome bossed in golden-angle parastichies, armed with stiff
// pale straw-ivory thorns radiating in Fibonacci spirals and small crimson-violet five-lobed calyxes nestled in the upper crown
function thornWhorlGeo(nu,nv,nSpines,nCalyx){const pos=[],col=[],uv=[];
 const tri=(a,b,c,ca,cb,cc)=>{pos.push(...a,...b,...c);col.push(...ca,...cb,...cc);uv.push(0,0,1,0,.5,1);};
 const R=[];for(let k=0;k<nSpines;k++){const t=(k+.5)/nSpines,ph=Math.acos(1-t*.94),th=k*GOLD;
  R.push([Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)]);}
 const pt=(iu,iv)=>{const u=iu/nu*TAU,v=iv/nv*(Math.PI*.48),sx=Math.sin(v)*Math.cos(u),sy=Math.cos(v),sz=Math.sin(v)*Math.sin(u);
  let bump=0;for(let k=0;k<R.length;k++){const r=R[k],d=(sx-r[0])*(sx-r[0])+(sy-r[1])*(sy-r[1])+(sz-r[2])*(sz-r[2]);if(d<.08)bump=Math.max(bump,Math.exp(-d/.018));}
  const rad=.46*(1+.08*bump),c=mix(.34,.58,sy)+.1*bump;
  return{p:[sx*rad,sy*rad*.72,sz*rad],c:[c*.92,c*1.04,c*.76]};};
 for(let iv=0;iv<nv;iv++)for(let iu=0;iu<nu;iu++){const a=pt(iu,iv),b=pt(iu+1,iv),c=pt(iu+1,iv+1),d=pt(iu,iv+1);
  tri(a.p,b.p,c.p,a.c,b.c,c.c);tri(a.p,c.p,d.p,a.c,c.c,d.c);}
 /* radiating pale straw-ivory Fibonacci thorns (3-sided tapering spines) */
 const spBase=[.74,.68,.50],spTip=[1.04,.99,.84];
 for(let k=0;k<nSpines;k++){const n=R[k],bx=n[0]*.44,by=n[1]*.33,bz=n[2]*.44,L=.14+.07*(1-k/nSpines),w=.018;
  const tx=-n[2],tz=n[0],tl=Math.hypot(tx,tz)||1,ux=tx/tl*w,uz=tz/tl*w;
  const vx=n[1]*uz,vy=n[2]*ux-n[0]*uz,vz=-n[1]*ux;
  const tip=[bx+n[0]*L,by+n[1]*L*.92+.02,bz+n[2]*L];
  const p0=[bx+ux,by,bz+uz],p1=[bx-ux*.5+vx*.866,by+vy*.866,bz-uz*.5+vz*.866],p2=[bx-ux*.5-vx*.866,by-vy*.866,bz-uz*.5-vz*.866];
  tri(p0,p1,tip,spBase,spBase,spTip);tri(p1,p2,tip,spBase,spBase,spTip);tri(p2,p0,tip,spBase,spBase,spTip);}
 /* small crimson-violet calyxes tucked into the Fibonacci spiral interstices of the upper crown */
 const calB=[.46,.14,.32],calT=[.86,.28,.54];
 for(let k=0;k<nCalyx;k++){const t=.12+.72*(k+.5)/nCalyx,ph=Math.acos(1-t*.75),th=(k+.5)*GOLD,
  nx=Math.sin(ph)*Math.cos(th),ny=Math.cos(ph),nz=Math.sin(ph)*Math.sin(th),
  cx=nx*.47,cy=ny*.35,cz=nz*.47,tx=-nz,tz=nx,tl=Math.hypot(tx,tz)||1,px=tx/tl,pz=tz/tl,
  qx=ny*pz,qy=nz*px-nx*pz,qz=-ny*px;
  for(let p=0;p<3;p++){const a=p/3*TAU+th,a2=a+.95,c1=Math.cos(a),s1=Math.sin(a),c2=Math.cos(a2),s2=Math.sin(a2);
   tri([cx,cy,cz],[cx+nx*.044+(px*c1+qx*s1)*.032,cy+ny*.044+qy*s1*.032,cz+nz*.044+(pz*c1+qz*s1)*.032],
    [cx+nx*.044+(px*c2+qx*s2)*.032,cy+ny*.044+qy*s2*.032,cz+nz*.044+(pz*c2+qz*s2)*.032],calB,calT,calT);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
BIO.def('twhorl',thornWhorlGeo(16,6,46,18),SHIGH.MAT.vcol,{label:'Thorn-whorl cushions'});
BIO.def('twhorllo',thornWhorlGeo(8,3,13,5),SHIGH.MAT.vcol,{label:'Thorn-whorl cushions (mid distance)'});

// ---------------------------------------------------------------- species & floor tags
const K=(c,a,r,kp,spiral)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,spiral});
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
const CJ={key:'coiljuniper',name:'Coil juniper',H:[.6,1.7],rb:[.09,.21],crownR:[1.5,3.2],barkK:0,bark:PAL.juniperBark,leaf:PAL.juniperLeaf,
 how:'prostrate wind-combed krummholz crouching in the dark basalt lees of the Ordeal ramp: corkscrew limbs hugging the slabs, all wound right-handed',
 far:{poleU:.18,taper:.2,blobs:[[.35,.95,.32,'L0','L2']]},tags:K('cold','semiarid','no',['ET','Dsc','Dfc'],'coil'),
 harvest:HV('fuel (dense, slow-burning)',['berries (bitter steep)'],true,'The highest woody plant on the Ordeal ramp; never cut along the marked way.')};
CJ.i=SHIGH.SPECIES.length;CJ.spiral=CJ.tags.spiral;CJ.tags.harvest=CJ.harvest;SHIGH.HARVEST[CJ.key]=CJ.harvest;
SHIGH.SPECIES.push(CJ);SHIGH.byKey[CJ.key]=CJ;
const SPI=k=>SHIGH.byKey[k].i;

const PK=(name,c,a,r,kp,spiral,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,spiral),{harvest:hv||HV('none')}),items});
Object.assign(SHIGH.PLANTS,{
 thornwhorl:PK('Thorn-whorl cushion','cold','semiarid','no',['ET','Dsc','BSk'],'whorl',['twhorl','twhorllo'],
  HV('fuel (resinous winter hearth fuel)',[],true,'Spiny tragacanth cushion with pale straw-ivory thorns in Fibonacci spirals and crimson-violet calyxes.')),
 dome:PK('Spiral cushion','cold','subhumid','no',['ET','Dfc'],'whorl',['sdome','sdomelo'],
  HV('none',[],false,'A dome of rosettes packed in the two crossing spiral families; a century to grow a metre.')),
 snail:PK('Snail-shell rosette','cold','semiarid','no',['ET','Dsc','Dfc'],'shell',['snail','snaillo'],
  HV('none',[],false,'Fleshy bloom-dusted leaves winding up a narrowing cone in the basalt scree.'))
});
if(SHIGH.PLANTS.tussock.items.indexOf('bunch')<0)SHIGH.PLANTS.tussock.items.push('swirllo','bunch');
if(SHIGH.PLANTS.rosette.items.indexOf('rosettelo')<0)SHIGH.PLANTS.rosette.items.push('rosettelo');

// ---------------------------------------------------------------- zones
function zonesO(x,z){const F=n=>BIO.field(n,x,z);
 const rock=F('rock'),slope=F('slope'),snow=F('snow'),scree=F('scree'),sorted=F('sorted'),gulch=F('gulch'),lee=F('lee'),north=F('north');
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),live=1-cliff,crag=smooth(.35,.65,rock)*live,bed=smooth(.42,.68,snow);
 return{rock,slope,snow,bed,cliff,live,crag,scree:scree*live*(1-crag),sorted:sorted*live,gulch:gulch*live,lee:lee*live*(1-bed),
  pavement:(1-scree)*(1-crag)*(1-bed)*(1-gulch)*live,north};}
SHIGH.zonesO=zonesO;

// ---------------------------------------------------------------- prostrate coiljuniper builder (lee-combed NW, away from Godthrone's katabatic SE wind)
SHIGH.B[SPI('coiljuniper')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 let reach=R*.55;
 BIO.tree(T.x,T.z,()=>{
  const C0=twistTrunk(T,S,'barkJ',H*.32,u=>rb*(1-.32*u),4,.18,rr(.7,1.2),lv,()=>bcol(S,ri(0,9)),{st,lean:rr(.16,.36),du:.2,seg:7});
  const e=C0[C0.length-1],n=lv===2?ri(4,6):3,a0=rr(2.9,4.9),hc=C(pick(S.leaf));
  for(let k=0;k<n;k++){const la=a0+T.hand*(k*GOLD*.55-(n-1)*GOLD*.27),L=R*rr(.72,1.12);
   const lp=corkscrew(e,dirOf(la,rr(-.08,.12)),L,rb*.68,.028,lv===2?6:3,L*.11,rr(.8,1.35),T.hand,-.07);
   lp.forEach(p=>{const g=BIO.terrainH(p.x,p.z)+p.r+.04;if(p.y<g)p.y=g;});
   if(lv===2)st.limb+=BIO.tube('barkJ',joint(lp,e.r),bcol(S,k),{seg:5,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],rb*1.2,.05,rodCol(S.bark[0]));
   for(let i=1;i<lp.length;i+=lv===2?1:2){const q=lp[i];
    clumpAt('njuniper',q.x,q.y+.08,q.z,R*.28*rr(.85,1.18)*(lv===2?1:1.45),.45,hc,T.x,T.y0+H*.45,T.z,R,H);st.clumps++;}
   const t=lp[lp.length-1];reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+.55);}});
 regTree(T,S,reach,H+.5);};

SHIGH.PASSES=[
 {sp:SPI('coiljuniper'),cell:14,accept:(Z,x,z)=>{const W=zonesO(x,z);return W.bed>.5||W.gulch>.65||W.cliff>.5?0:W.lee*.48+W.crag*.14;},
  opt:{pad:1.4,patch:.62,patchScale:.013,small:true,lodK:.45}}
];

// ---------------------------------------------------------------- the floor
const {swirl,rosette,around}=SHIGH.small;
const Y=(x,z)=>BIO.terrainH(x,z);

const lichen=(x,y,z,s)=>BIO.put('lichen',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),s,leafCol(PAL.lichen,1.1,.02));
function thornwhorl(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.45,1.3,(px,pz)=>{const R=rr(.28,.78)*(lv===0?1.25:1);
 BIO.put(lv===2?'twhorl':'twhorllo',[px,Y(px,pz)-.04,pz],qEuler(0,rr(0,TAU),0),[R*2*SHIGH.HAND,R*1.75,R*2],
  bright(vary(C(pick(PAL.thornBody)),.02,.05,.05),1.28));st.thornwhorls++;});}
function dome(x,y,z,lv,st){const R=rr(.3,.95),c=rng()<.16?pick(PAL.domeRed):pick(PAL.dome);
 BIO.put(lv===2?'sdome':'sdomelo',[x,Y(x,z)-.06,z],qEuler(0,rr(0,TAU),0),[R*2,R*2*rr(.78,1.05),R*2],bright(vary(C(c),.02,.06,.05),1.08));st.domes++;}
function snail(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.28,.85,(px,pz)=>{const s=rr(.14,.28)*(lv===0?1.3:1);
 BIO.put(lv===2?'snail':'snaillo',[px,Y(px,pz)-.02,pz],qEuler(0,rr(0,TAU),0),[s*SHIGH.HAND,s*1.2,s],leafCol(rng()<.22?PAL.snailRed:PAL.snail,1.08,.02,.05,.05));st.snails++;});}
function basPiece(x,z,lv,st,big,k){const nm=big?'bboulder':'bstone',Rb=(big?rr(.8,2.2):rr(.15,.46))*(k==null?1:k);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.35,(px,pz,i)=>{if(BIO.mask(px,pz)<=0||!BIO.clearOf(px,pz,.8))return;
  const r=Rb*(i?rr(.36,.72):1),py=Y(px,pz),h=r*rr(.52,.88);
  BIO.put(nm,[px,py+h*.26,pz],qEuler(rr(-.28,.28),rr(0,TAU),rr(-.28,.28)),[r*rr(.95,1.45),h*.76,r*rr(.95,1.45)],basCol());
  if(big)st.boulders++;else st.stones++;
  if(big&&lv===2&&rng()<.5)lichen(px+rr(-.2,.2)*r,py+h*.94,pz+rr(-.2,.2)*r,r*rr(.35,.75));});}

SHIGH.buildFloor=function(R,q){reseed(600547);q=q==null?1:q;R=R==null?2500:R;SHIGH.means();
 const st={thornwhorls:0,domes:0,snails:0,lichen:0,rosettes:0,tussocks:0,bunch:0,stones:0,boulders:0,sorted:0,sortedCells:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6)||BIO.mask(x,z)<=0||!BIO.clearOf(x,z,.8))return;
  const W=zonesO(x,z);if(W.cliff>.6)return;const t=rng();
  if(W.bed>.58){if(W.snow<.72&&t<.22){rosette(x,y,z,PAL.silver,.85,lv);st.rosettes++;}return;}
  if(W.gulch>.45){if(t<.58)basPiece(x,z,lv,st,false,1.35);else if(t<.78)snail(x,y,z,lv,st);else if(t<.9){lichen(x,y,z,rr(.25,.55));st.lichen++;}return;}
  if(W.crag>.5){if(t<.36)basPiece(x,z,lv,st,false,1.1);else if(t<.68){lichen(x,y,z,rr(.3,.75));st.lichen++;}else if(t<.84)thornwhorl(x,y,z,lv,st);return;}
  if(W.scree>.45){if(t<.34)snail(x,y,z,lv,st);else if(t<.68)basPiece(x,z,lv,st,false,1.25);else if(t<.86)thornwhorl(x,y,z,lv,st);else{lichen(x,y,z,rr(.22,.48));st.lichen++;}return;}
  if(W.sorted>.5){if(t<.28)thornwhorl(x,y,z,lv,st);else if(t<.40)dome(x,y,z,lv,st);return;}
  /* open freeze-thaw basalt pavement: thorn-whorl cushions, spiral cushions, coiled lichens, sparse tussocks & snail rosettes */
  if(t<.34)thornwhorl(x,y,z,lv,st);
  else if(t<.54)dome(x,y,z,lv,st);
  else if(t<.70){lichen(x,y,z,rr(.3,.8));st.lichen++;}
  else if(t<.80){swirl(x,y,z,lv,PAL.dryIchu,.72);st.tussocks++;}
  else if(t<.88)snail(x,y,z,lv,st);
  else if(t<.94){rosette(x,y,z,PAL.silver,.85,lv);st.rosettes++;}
  else basPiece(x,z,lv,st,false,.95);}
 const L=BIO.LOD(),bands=[[7,L.floor[0],0],[14,L.floor[1],L.floor[0]],[28,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .74*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.5,patchScale:.012,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // dark angular basalt & impactite boulders in the dry gulch, round the tors and across the slab risers
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const W=zonesO(x,z);
  return (W.gulch*.65+W.crag*.52+smooth(.16,.38,W.rock)*(1-W.crag)*.28)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;basPiece(x,z,lv,st,true,rr(1.05,1.9));},{patch:.32,pad:1});
 // sparse wind-bitten ichu tufts (card.ichu) in pavement cracks: KRAND per 4.2 m cell
 {const CELLB=4.2,BX=BIO.originBox(L.floor[0]),u=(ix,iz,k)=>KRAND.unit(KRAND.hash(600581,ix,iz,k));
  for(let iz=Math.floor(BX[1]/CELLB);iz<=Math.ceil(BX[3]/CELLB);iz++)for(let ix=Math.floor(BX[0]/CELLB);ix<=Math.ceil(BX[2]/CELLB);ix++){
   const x=(ix+u(ix,iz,1))*CELLB,z=(iz+u(ix,iz,2))*CELLB;if(Math.hypot(x,z)>R||BIO.lodD(x,z)>=L.floor[0])continue;
   const W=zonesO(x,z),a=q*(W.pavement*.22+W.lee*.28)*(1-W.sorted*.7)*(1-W.bed);if(a<=0||u(ix,iz,3)>a)continue;
   if(BIO.mask(x,z)<=0||BIO.depth(x,z)>-.15||!BIO.clearOf(x,z,.7)||blocked(x,z,.5))continue;
   const set=PAL.dryIchu,h=.28+.26*u(ix,iz,4),w=h*(.85+.35*u(ix,iz,6));
   BIO.put('bunch',[x,Y(x,z)-.04,z],qEuler(0,u(ix,iz,5)*TAU,0),[w,h,w],bright(C(set[Math.floor(u(ix,iz,7)*set.length)]),1.02+.22*u(ix,iz,8)));st.bunch++;}}
 // frost-sorted stone spirals laid in dark basalt & impactite stones on the flat treads near the eye
 if(typeof STATION_SORTED!=='undefined'){const S=STATION_SORTED,c=S.cell,BX=BIO.originBox(Math.min(150,L.floor[0])),u=(ix,iz,k,j)=>KRAND.unit(KRAND.hash(600591,ix,iz,k*4096+j));
  for(let iz=Math.floor(BX[1]/c);iz<=Math.ceil(BX[3]/c);iz++)for(let ix=Math.floor(BX[0]/c);ix<=Math.ceil(BX[2]/c);ix++){
   const cx=(ix+.5)*c,cz=(iz+.5)*c;if(Math.hypot(cx,cz)>R||BIO.lodD(cx,cz)>=Math.min(150,L.floor[0]))continue;
   if(BIO.field('sorted',cx,cz)<.45||BIO.mask(cx,cz)<=0||!BIO.clearOf(cx,cz,1.8))continue;
   const ph=S.phase(ix,iz),arms=S.arms(ix,iz);st.sortedCells++;let j=0;
   for(let a=0;a<arms;a++)for(let r=.6;r<=S.rMax;r+=.3,j++){const th=((r/S.pitch-ph)+a)*TAU/arms,x=cx+Math.cos(th)*r,z=cz+Math.sin(th)*r;
    if(BIO.mask(x,z)<=0||!BIO.clearOf(x,z,.45))continue;const s=(.09+.1*u(ix,iz,1,j))*(1+.4*r/S.rMax);
    BIO.put('bstone',[x,Y(x,z)+s*.15,z],qEuler(u(ix,iz,2,j)*.6-.3,u(ix,iz,3,j)*TAU,u(ix,iz,4,j)*.6-.3),
     [s*(1+.4*u(ix,iz,5,j)),s*.58,s*(1+.4*u(ix,iz,6,j))],basCol(.52+.24*u(ix,iz,7,j)));st.sorted++;}
   /* spiny thorn-whorl cushions rooting in the coarse stone border at the cell's outer corners */
   for(let m=0;m<2;m++){if(u(ix,iz,8,m)>.58)continue;const ca=(ph+m*.5+u(ix,iz,9,m)*.25)*TAU,cr=3.45+.45*u(ix,iz,10,m),
    tx=cx+Math.cos(ca)*cr,tz=cz+Math.sin(ca)*cr;if(BIO.mask(tx,tz)<=0||!BIO.clearOf(tx,tz,.7))continue;
    const tr=.38+.42*u(ix,iz,11,m),tc=PAL.thornBody[Math.floor(u(ix,iz,12,m)*PAL.thornBody.length)];
    BIO.put('twhorl',[tx,Y(tx,tz)-.04,tz],qEuler(0,u(ix,iz,13,m)*TAU,0),[tr*2*SHIGH.HAND,tr*1.75,tr*2],bright(C(tc),1.28));st.thornwhorls++;}}}
 return{under:st};};
})();
