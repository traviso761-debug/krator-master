// ================================================================= SOUTHERN HIGHLANDS — STATION 2: THE SPIRAL CONIFERS (species, items, passes, floor)  [web]
// PLAN-STATIONS.md station 2: "a subalpine forest where the conifers grow in spirals too: trunks twisted like rope (the Bristlecone's and the
// wind-twisted pines' grain, taken to a rule), whorled branches climbing in a helix, cones in strict spirals made large and showy; snowbeds
// lingering in the shade; the same handedness as the cloud forest, with the rare mirror tree." Read after 55 and 60 (it is 62), before 70 (the kit's
// registry): it appends three species to SHIGH.SPECIES and their builders to SHIGH.B (the cloud forest's eleven stay, with no pass), and puts
// the station's own PASSES and floor in place of the kit's. Every turn is by the tree's hand (T.hand), as in 55.
//   12 ROPE PINE    a squat pine whose bole is three strands wound like a rope (a turn every 2-3 m), the bark red and furrowed along the
//                   strands; its branch whorls (three limbs) turn a ninth of a turn each tier, so the limbs climb the trunk in three helices;
//                   tufted needles at the limbs' ends and big amber cones, each its scales in the two crossing spiral families
//   13 HELIX FIR    a spire: one branch at a time, each a seventh of a turn round from the last, so the branches are a single helical stair
//                   up the trunk, longest at the foot; blue cones standing upright on the top third in strict rows
//   14 COIL JUNIPER the krummholz of the wind-shorn crest: corkscrew limbs sprawling low from a short bole, juniper scale-sprays along them
// The floor: needle litter and moss under the forest, the cones fallen, dwarf cushions; the meadows' swirl tussocks, spiral-eye daisies and
// silver rosettes; snowbeds bare but for rosettes on their melting edges; granite boulders round the tors, lichen on them.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=SHIGH.C,GOLD=SHIGH.GOLD,{shade,bright,vary,tint}=BIO.col;
const {twistTrunk,corkscrew,along,dirOf,joint,clumpAt,regTree,hs,leafCol,rodCol,nearW,blocked}=SHIGH.TOOLS;
const PAL=SHIGH.PAL;
Object.assign(PAL,{ropeBark:[0x7a4a32,0x86553a,0x6e422c,0x925e40],ropeDead:[0xb8b0a4,0xa8a094],pineNeedle:[0x46603a,0x506c40,0x3e5634,0x5a7444],
 coneAmber:[0xc07a3a,0xb06a2e,0xd08a44],helixBark:[0x5a5048,0x4e4640,0x645a50],firNeedle:[0x34504a,0x3a5a54,0x2e4842,0x42645a],
 coneBlue:[0x5a5a9a,0x4e5090,0x6a62a8],coneRed:[0x9a3a4a,0x8a3042],juniperBark:[0x8a6a54,0x7a5c48,0x967660],juniperLeaf:[0x5a7062,0x667a6a,0x4e6658],
 dwarf:[0x5a7a3a,0x6a8a42,0x7a6a3a]});
SHIGH.KOPPEN=Object.assign({},SHIGH.KOPPEN,{Dsc:.37,Dsb:.23,Dfc:.09});
SHIGH.STATION='conifers';

// ---------------------------------------------------------------- the library (this station's families: materials.json, "own", packed into this page only)
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('shigh',n):null;
const libMap=n=>{const L=LIBP(n);if(!L)return null;return{t:KMAT.textures(L,{aniso:4}).map,scale:L.scale,mean:L.mean};};
const card=n=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;return t;};
const lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
const BARKS={};
[['barkR','bark.rope','Rope pine bark (three strands)',0],['barkH','bark.helix','Helix fir bark',2],['barkJ','bark.juniper','Coil juniper bark',0]].forEach(([b,fam,lab,fb])=>{
 const L=libMap(fam),m=BIO.barkMat(L?L.t:SHIGH.BARKTEX[fb]);BARKS[b]={mean:L&&L.mean!=null?lin(L.mean):BIO.col.texMean(SHIGH.BARKTEX[fb])};
 BIO.bucket(b,m,{label:lab,uvScale:L?L.scale:[3,4]});});
const bcol=(S,k,bk)=>tint(S.bark[k%S.bark.length],BARKS[bk].mean,rr(.9,1.08));
// the needles: the library's nine-sprig sheets cut a sprig a quad (BIO.geo.cells; "sheet": "geometry"), the kit's crown card without them
const NM={};
[['npine','needle.pine','Rope pine needle tufts'],['nspruce','needle.spruce','Helix fir needle sprays'],['njuniper','needle.juniper','Coil juniper scale sprays']].forEach(([it,fam,lab])=>{
 const t=card(fam),m=t?BIO.leafMat(t,it,{aN:true,swayW:'1.0',swayA:.04,alphaTest:.42}):SHIGH.MAT.small;NM[it]=m;
 BIO.def(it,t?BIO.geo.cells(BIO.geo.clump(),{n:3}):BIO.geo.clump(),m,Object.assign({attrs:['aN'],label:lab},it==='nspruce'?{cap:340000,capWhy:'the helix firs needle sprays, the spiral-conifer forest of station 2 (14,291 firs): 289,784 at 2026-11-09, a spray a whorl tip'}:{}));});
// THE SPIRAL CONE: an ovoid of woody scales set at the golden angle (the two crossing spiral families, 8 and 13, as in a real cone), right-handed;
// vertex-coloured (a base colour per instance tints it: dark at each scale's root, pale at its lip). n scales; `lo` for the mid distance
function coneGeo(n,sides){const pos=[],col=[],uv=[];const tri=(a,b,c,ca,cb,cc)=>{pos.push(...a,...b,...c);col.push(...ca,...cb,...cc);uv.push(0,0,1,0,.5,1);};
 const rAt=t=>.5*Math.pow(Math.sin(Math.PI*Math.min(1,.06+t*.94)),.75)*(1-.25*t);
 // the core: a lathe
 const R=[];for(let i=0;i<=6;i++){const t=i/6;R.push([rAt(t)*.62,t]);}
 for(let i=0;i<6;i++)for(let s=0;s<sides;s++){const a0=s/sides*TAU,a1=(s+1)/sides*TAU,p=(r,y,a)=>[r*Math.cos(a),y,r*Math.sin(a)],d=[.32,.22,.14];
  tri(p(R[i][0],R[i][1],a0),p(R[i+1][0],R[i+1][1],a0),p(R[i+1][0],R[i+1][1],a1),d,d,d);tri(p(R[i][0],R[i][1],a0),p(R[i+1][0],R[i+1][1],a1),p(R[i][0],R[i][1],a1),d,d,d);}
 // the scales: each a pointed shield standing out and down from the core
 for(let k=0;k<n;k++){const t=.04+.92*(k+.5)/n,a=k*GOLD,r=rAt(t),ca=Math.cos(a),sa=Math.sin(a),w=.11+.1*Math.sin(Math.PI*t),L=.16+.14*Math.sin(Math.PI*t);
  const o=[r*.6*ca,t,r*.6*sa],tx=-sa,tz=ca,out=[ca,-.35,sa],tip=[o[0]+out[0]*L+ca*r*.4,o[1]+out[1]*L,o[2]+out[2]*L+sa*r*.4];
  const l=[o[0]+tx*w,o[1]+.03,o[2]+tz*w],rr_=[o[0]-tx*w,o[1]+.03,o[2]-tz*w],up=[o[0]+ca*r*.25,o[1]+.08,o[2]+sa*r*.25];
  const dk=[.38,.27,.17],md=[.78,.62,.44],lt=[1,.9,.72];
  tri(l,tip,up,dk,lt,md);tri(up,tip,rr_,md,lt,dk);tri(l,rr_,tip,dk,dk,lt);}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
BIO.def('scone',coneGeo(55,7),SHIGH.MAT.vcol,{label:'Spiral cones'});
BIO.def('sconelo',coneGeo(21,5),SHIGH.MAT.vcol,{label:'Spiral cones (mid distance)'});
const coneIt=lv=>lv===2?'scone':'sconelo';

// ---------------------------------------------------------------- the species (appended: 12, 13, 14)
const K=(c,a,r,kp,spiral)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,spiral});
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
const NEW=[
 {key:'ropepine',name:'Rope pine',H:[7,17],rb:[.35,.8],crownR:[3,6],barkK:0,bark:PAL.ropeBark,leaf:PAL.pineNeedle,
  how:'its bole is three strands wound like a rope, a turn every two or three metres; the branch whorls turn a ninth of a turn each tier, so the limbs climb in three helices; big amber cones, every scale in the two crossing spirals',
  far:{poleU:.6,taper:.4,blobs:[[.62,.9,.22,'L0','L1'],[.82,.65,.14,'L2','L3']]},tags:K('subalpine','subhumid','no',['Dsc','Dsb','Dfc'],'twist'),
  harvest:HV('timber (it splits along its twist: turned and coopered work), resin',['seeds (the cones\' pine nuts)'],true,'The cones take three years on the tree; their nuts are the station\'s winter food. The resin is a wound pitch.')},
 {key:'helixfir',name:'Helix fir',H:[12,28],rb:[.28,.6],crownR:[2,3.8],barkK:2,bark:PAL.helixBark,leaf:PAL.firNeedle,
  how:'a spire whose branches leave the trunk one at a time, each a seventh of a turn round from the last: one helical stair of branches from the foot to the tip; its blue cones stand upright on the top third in strict rows',
  far:{poleU:.95,taper:.85,blobs:[[.45,.55,.45,'L0','L1'],[.8,.3,.22,'L2','L3']]},tags:K('subalpine','humid','both',['Dsc','Dfc'],'whorl'),
  harvest:HV('timber (straight: poles, roof trees)',[],false,'The only straight timber of the Wall\'s top: hauled down for the cloud-forest towns\' roof trees.')},
 {key:'coiljuniper',name:'Coil juniper',H:[1,3],rb:[.1,.25],crownR:[2,4],barkK:0,bark:PAL.juniperBark,leaf:PAL.juniperLeaf,
  how:'krummholz of the wind-shorn crest: corkscrew limbs sprawling low from a short bole, all wound one way, scale-sprays along them',
  far:{poleU:.2,taper:.2,blobs:[[.4,.95,.35,'L0','L2']]},tags:K('subalpine','subhumid','no',['Dsc','Dfc','ET'],'coil'),
  harvest:HV('fuel (dense, slow)',['berries (flavouring)'],true,'The berries are steeped as a bitter; the wood is the herders\' fire.')},
];
NEW.forEach(S=>{S.i=SHIGH.SPECIES.length;S.spiral=S.tags.spiral;S.tags.harvest=S.harvest;SHIGH.HARVEST[S.key]=S.harvest;SHIGH.SPECIES.push(S);SHIGH.byKey[S.key]=S;});
const SPI=k=>SHIGH.byKey[k].i;
const PK=(name,c,a,r,kp,spiral,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,spiral),{harvest:hv||HV('none')}),items});
Object.assign(SHIGH.PLANTS,{
 cone:PK('Fallen spiral cones','subalpine','subhumid','no',['Dsc','Dsb','Dfc'],'whorl',['scone','sconelo'],HV('fuel',['seeds'],false,'Gathered for their nuts, then burned: they flare in a spiral.')),
 dwarf:PK('Dwarf whorl-heath','subalpine','subhumid','no',['Dsc','Dfc','ET'],'whorl',['lobe'],HV('none',['berries'],false,'Leaves in tight whorls up every shoot.')),
});

// ---------------------------------------------------------------- zones (the station's fields: 44s-host-land.js)
function zonesS(x,z){const F=n=>BIO.field(n,x,z),rock=F('rock'),slope=F('slope'),snow=F('snow'),exposed=F('exposed'),meadow=F('meadow');
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),live=1-cliff,crag=smooth(.35,.65,rock)*live,rest=(1-crag)*live,bed=smooth(.4,.65,snow);
 const krumm=smooth(.3,.6,exposed)*rest*(1-bed),open=meadow*(1-krumm)*rest*(1-bed),forest=(1-meadow)*(1-exposed)*rest*(1-bed);
 return{rock,slope,snow,bed,exposed,meadow,cliff,crag,krumm,open,forest,north:F('north')};}
SHIGH.zonesS=zonesS;

// ---------------------------------------------------------------- the builders
const B=SHIGH.B;
// 12 the ROPE PINE
B[SPI('ropepine')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR,Hb=H*.86;
 const rAt=u=>rb*(1-.55*u)*(1+.5*smooth(.1,0,u));
 const C0=twistTrunk(T,S,'barkR',Hb,rAt,3,.24,rr(2.2,3.2),lv,()=>bcol(S,ri(0,9),'barkR'),{st,lean:rr(.02,.1),du:.05,seg:12});
 const tiers=lv===2?ri(5,8):4,a0=rr(0,TAU),hc=C(pick(S.leaf));let reach=R*.5,top=T.y0+Hb;
 for(let k=0;k<tiers;k++){const u=mix(.32,.96,k/(tiers-1)),p=along(C0,u);
  for(let j=0;j<3;j++){const la=a0+T.hand*(k*TAU/9+j*TAU/3)+rr(-.1,.1),L=R*rr(.7,1.05)*(1.15-u*.6),el=rr(.05,.35);
   const lp=corkscrew(p,dirOf(la,el),L,p.r*.5,.04,lv===2?5:2,L*.06,rr(.3,.6),T.hand,.04);
   if(lv===2)st.limb+=BIO.tube('barkR',joint(lp,p.r,true),bcol(S,k+j,'barkR'),{seg:lp[0].r>.12?5:4,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],lp[0].r*1.6,.05,rodCol(S.bark[0]));
   const e=lp[lp.length-1];
   // the needle tufts: at the limb's end and two-thirds along it
   for(const f of(lv===2?[1,.66]:[1])){const q=lp[Math.min(lp.length-1,Math.round(f*(lp.length-1)))],n=lv===2?2:1;
    for(let c=0;c<n;c++){clumpAt('npine',q.x+rr(-.3,.3),q.y+rr(0,.3),q.z+rr(-.3,.3),R*.28*rr(.8,1.15)*(lv===2?1:1.5),.7,hc,T.x,T.y0+Hb*.8,T.z,R,H*.3);st.clumps++;}}
   // the cones: one in three limbs, at the end, hanging a little; large (25-40 cm)
   if(rng()<.34){const s=rr(.25,.4);BIO.put(coneIt(lv),[e.x,e.y-s*.1,e.z],qEuler(rr(2.4,3.0),la,0),hs(T,s),bright(C(pick(PAL.coneAmber)),1.1));st.cones=(st.cones||0)+1;}
   reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);top=Math.max(top,e.y+.5);}}
 regTree(T,S,reach,top-T.y0+1);};
// 13 the HELIX FIR
B[SPI('helixfir')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.92*u)*(1+.35*smooth(.08,0,u));
 const C0=twistTrunk(T,S,'barkH',H,rAt,6,.04,rr(16,24),lv,()=>bcol(S,ri(0,9),'barkH'),{st,lean:rr(0,.02),wig:.015,du:.04,seg:10});
 const n=lv===2?Math.round(H*2.6):Math.round(H*.8),a0=rr(0,TAU),hc=C(pick(S.leaf)),stepA=T.hand*TAU/7;let reach=R*.4;
 for(let k=0;k<n;k++){const u=mix(.1,.97,k/(n-1)),p=along(C0,u),la=a0+k*stepA*(lv===2?1:3.2),L=R*Math.pow(1-u,.85)*rr(.9,1.1)+.3,d=dirOf(la,-.18+.25*u);
  const e=[p.x+d[0]*L,p.y+d[1]*L,p.z+d[2]*L];
  BIO.beam('rod',[p.x,p.y,p.z],e,Math.max(.03,p.r*.45),.025,rodCol(S.bark[0],-.15));
  // the sprays along the branch: one at its tip, one or two inside (near only), drooping
  const m=lv===2?(L>1.2?3:2):1;for(let c=0;c<m;c++){const f=1-c*.35,q=[p.x+d[0]*L*f,p.y+d[1]*L*f-.1,p.z+d[2]*L*f];
   clumpAt('nspruce',q[0],q[1],q[2],(.45+.35*L/R)*(lv===2?1:1.6),.45,hc,T.x,T.y0+H*.55,T.z,R,H*.5);st.clumps++;}
  // the cones: upright on the top third, on the branch's upper side, in the helix's own rows
  if(u>.66&&(k%2===0)&&rng()<.7){const s=rr(.18,.28);BIO.put(coneIt(lv),[p.x+d[0]*L*.55,p.y+d[1]*L*.55+.06,p.z+d[2]*L*.55],qEuler(0,la,0),hs(T,s),bright(C(pick(PAL.coneBlue)),1.1));st.cones=(st.cones||0)+1;}
  reach=Math.max(reach,L+.5);}
 BIO.put(coneIt(lv),[T.x,T.y0+H,T.z],qEuler(0,0,0),hs(T,.22),bright(C(pick(PAL.coneBlue)),1.1));
 regTree(T,S,reach,H+1);};
// 14 the COIL JUNIPER (krummholz)
B[SPI('coiljuniper')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const C0=twistTrunk(T,S,'barkJ',H*.35,u=>rb*(1-.3*u),4,.18,rr(.8,1.4),lv,()=>bcol(S,ri(0,9),'barkJ'),{st,lean:rr(.1,.3),du:.2,seg:7});
 const e=C0[C0.length-1],n=lv===2?ri(3,6):3,a0=rr(0,TAU),hc=C(pick(S.leaf));let reach=R*.5;
 for(let k=0;k<n;k++){const la=a0+T.hand*k*GOLD,L=R*rr(.7,1.1),lp=corkscrew(e,dirOf(la,rr(-.05,.2)),L,rb*.7,.03,lv===2?6:3,L*.12,rr(.8,1.4),T.hand,-.06);
  /* hug the ground: a limb never dips under it */
  lp.forEach(p=>{const g=BIO.terrainH(p.x,p.z)+p.r+.05;if(p.y<g)p.y=g;});
  if(lv===2)st.limb+=BIO.tube('barkJ',joint(lp,e.r),bcol(S,k,'barkJ'),{seg:5,cap:true});
  else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],rb*1.2,.06,rodCol(S.bark[0]));
  for(let i=1;i<lp.length;i+=lv===2?1:2){const q=lp[i];clumpAt('njuniper',q.x,q.y+.15,q.z,R*.3*rr(.8,1.2)*(lv===2?1:1.5),.5,hc,T.x,T.y0+H*.5,T.z,R,H);st.clumps++;}
  const t=lp[lp.length-1];reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+.6);}
 regTree(T,S,reach,H+.5);};

// ---------------------------------------------------------------- the passes (the station's own, in place of the cloud forest's)
SHIGH.PASSES=[   /* no tree roots in a snowbed (bed over .55: the snow lies there into summer) */
 {sp:SPI('helixfir'),cell:21,accept:(Z,x,z)=>{const W=zonesS(x,z);return W.bed>.55?0:W.forest*(.32+.25*W.north)+W.open*.03;},opt:{pad:1.6,patch:.45,patchScale:.01,lodK:.3}},
 {sp:SPI('ropepine'),cell:21,accept:(Z,x,z)=>{const W=zonesS(x,z);return W.bed>.55?0:W.forest*(.35-.2*W.north)+W.open*.06+W.krumm*.05+W.crag*.12;},opt:{pad:2.4,patch:.5,patchScale:.008,lodK:.3}},
 {sp:SPI('coiljuniper'),cell:7,accept:(Z,x,z)=>{const W=zonesS(x,z);return W.bed>.55?0:W.krumm*.55+W.crag*.2;},opt:{pad:1,patch:.6,patchScale:.012,small:true,lodK:.5}},
];

// ---------------------------------------------------------------- the floor (the station's own, in place of the kit's)
const {stone,boulder,mossMat,cushion,rosette,swirl,daisies,around,rockTint}=SHIGH.small;
const Y=(x,z)=>BIO.terrainH(x,z);
function cones(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.4,1.6,(px,pz)=>{const s=rr(.12,.3),c=bright(shade(C(pick(rng()<.5?PAL.coneAmber:PAL.coneBlue)),-.25),.9);
 BIO.put(coneIt(lv),[px,Y(px,pz)+s*.3,pz],qEuler(Math.PI/2+rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),s,c);st.cones++;});}
function dwarf(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.5,1.4,(px,pz)=>{const R=rr(.25,.6);BIO.put('lobe',[px,Y(px,pz)-.06,pz],qEuler(0,rr(0,TAU),0),[R,R*rr(.4,.6),R],leafCol(PAL.dwarf,1.05,.03,.08,.06));st.dwarf++;});}
SHIGH.buildFloor=function(R,q){reseed(600247);q=q==null?1:q;R=R==null?2500:R;
 const st={moss:0,cones:0,dwarf:0,tussocks:0,flowers:0,rosettes:0,stones:0,boulders:0,lichen:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const W=zonesS(x,z);if(W.cliff>.6)return;const t=rng();
  if(W.bed>.6){if(W.snow<.75&&t<.25){rosette(x,y,z,PAL.silver,1,lv);st.rosettes++;}return;}   /* the snowbed: bare, rosettes on its melting edge */
  if(W.crag>.5){if(t<.4){stone(x,y,z,lv,st,1,false);}else if(t<.6){BIO.put('lichen',[x,y+.03,z],qEuler(0,rr(0,TAU),0),rr(.3,.7),leafCol(PAL.lichen,1.1,.02));st.lichen++;}return;}
  if(W.open>.5){if(t<.45){swirl(x,y,z,lv,PAL.tussock,1);st.tussocks++;}else if(t<.65){daisies(x,y,z,lv);st.flowers++;}else if(t<.78){rosette(x,y,z,PAL.silver,1,lv);st.rosettes++;}else if(t<.88)dwarf(x,y,z,lv,st);return;}
  if(W.krumm>.5){if(t<.4)dwarf(x,y,z,lv,st);else if(t<.6){stone(x,y,z,lv,st,1,false);}else if(t<.75){BIO.put('lichen',[x,y+.03,z],qEuler(0,rr(0,TAU),0),rr(.3,.6),leafCol(PAL.lichen,1.1,.02));st.lichen++;}return;}
  // the forest floor
  if(t<.3){mossMat(x,y,z,PAL.mossDark,.8);st.moss++;}else if(t<.55)cones(x,y,z,lv,st);else if(t<.72)dwarf(x,y,z,lv,st);else if(t<.82){stone(x,y,z,lv,st,.8,true);}}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .7*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.55,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the tors' boulders
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const W=zonesS(x,z);return (W.crag*.5+smooth(.15,.35,W.rock)*(1-W.crag)*.25)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1;boulder(x,y,z,lv,st,rr(1.1,2),false);},{patch:.3,pad:1});
 return{under:st};};
})();
