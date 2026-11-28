// ================================================================= SOUTHERN HIGHLANDS — STATION 4: SHUMAR, BASALT GORGE AND DRY PLATEAU (species, items, passes, floor)  [web]
// PLAN-STATIONS.md station 4 (5.1 px 737,1201, 3,308 m, Dsb, 424 mm/yr, 1.06 atm): Shumar's dry western rain-shadow bench cut by the stepped
// basalt-and-limestone gorge of r287 Qappu-Narun. Read after 55 and 60 (it is 62), before 70: every plant carries tags.spiral and obeys SHIGH.HAND
// (+1, right-handed, with 1/320 mirror-handed trees via T.hand). Reuses ropepine and coiljuniper on the rim, spiral aloe and corkscrew cereus on
// sunny basalt ledges, fiddlehead fern on canyon seeps, swirl tussocks + card.ichu bunchgrass on the bench, and adds three dry-country plants:
//   HELIX POPLAR     fastigiate canyon-floor gallery tree (14-25 m) along Qappu-Narun's gravel terraces; pale grey-white furrowed bark wound in a
//                    gentle right-handed helix, steep ascending branches spiralling up the bole, golden-olive to autumn-gold foliage
//   TWIST-APRICOT    low gnarled stone-fruit tree (4-8 m) on sheltered canyon shelves and bench rims; dark reddish twisted trunk, five-ranked
//                    whorled leaf and pink-white blossom spurs (harvest.edible: apricots, sweet kernels)
//   WHORL-WORMWOOD   knee-high silvery-grey aromatic steppe subshrub across the dry Dsb bench between the ichu hummocks (card.sage geometry-cut
//                    sprigs set at the golden angle on a twisted woody stock)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=SHIGH.C,GOLD=SHIGH.GOLD,{shade,bright,vary,tint}=BIO.col;
const {twistTrunk,corkscrew,along,dirOf,joint,clumpAt,regTree,hs,leafCol,rodCol,nearW,blocked}=SHIGH.TOOLS;
const PAL=SHIGH.PAL;
const AUT=typeof STATION_LAND!=='undefined'&&STATION_LAND.autumn!=null?STATION_LAND.autumn:.38;
Object.assign(PAL,{
 ropeBark:[0x7a4a32,0x86553a,0x6e422c,0x925e40],pineNeedle:[0x48623c,0x526e42,0x3f5835,0x5c7646],coneAmber:[0xc07a3a,0xb06a2e,0xd08a44],
 juniperBark:[0x8a6a54,0x7a5c48,0x967660],juniperLeaf:[0x5a7062,0x667a6a,0x4e6658],
 poplarBark:[0xc8c5bc,0xbab7ae,0xd4d1c8,0xa6a49c],poplarFoot:[0x585650,0x4c4a45],
 poplarSummer:[0x7e8e42,0x8c9844,0x6e823e,0x9aa042],poplarGold:[0xd4a634,0xc8962c,0xe0b640,0xba8828],
 apricotBark:[0x5e342a,0x6c3c30,0x4e2b22,0x784436],apricotLeaf:[0x5e7c3c,0x6c8a44,0x527036,0x7a9248],
 apricotBlossom:[0xf8dce4,0xfbe8ee,0xf2ccd8],apricotFruit:[0xe4882e,0xdc7626,0xec9a38],
 sageLeaf:[0x96a89c,0xa4b4a8,0x889c90,0xb0beb2],dryTussock:[0xc8b272,0xbca464,0xd4be80,0xae985a],
 basaltRock:[0x3a3c42,0x303238,0x44464e,0x2b2d33],limeRock:[0xc2b092,0xb49e80,0xccbba0,0xa88262]
});
SHIGH.KOPPEN=Object.assign({},SHIGH.KOPPEN,{Dsb:.56,Dfb:.21,Dsc:.11,Csb:.06});
SHIGH.STATION='shumar';

// ---------------------------------------------------------------- the library (station 4's "own" families in materials.json)
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('shigh',n):null;
const libMap=n=>{const L=LIBP(n);if(!L)return null;return{t:KMAT.textures(L,{aniso:4}).map,scale:L.scale,mean:L.mean};};
const card=n=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;return t;};
const lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
const BARKS={};
[['barkR','bark.rope','Rope pine bark (three strands)',0],
 ['barkJ','bark.juniper','Coil juniper bark',0],
 ['barkP','bark.poplar','Helix poplar bark (pale helical furrows)',1],
 ['barkA','bark.apricot','Twist-apricot gnarled bark',0]].forEach(([b,fam,lab,fb])=>{
 const L=libMap(fam),m=BIO.barkMat(L?L.t:SHIGH.BARKTEX[fb]);BARKS[b]={mean:L&&L.mean!=null?lin(L.mean):BIO.col.texMean(SHIGH.BARKTEX[fb])};
 BIO.bucket(b,m,{label:lab,uvScale:L?L.scale:[3,4]});});
const bcol=(S,k,bk)=>tint(S.bark[k%S.bark.length],BARKS[bk].mean,rr(.92,1.08));

[['npine','needle.pine','Rope pine needle tufts'],
 ['njuniper','needle.juniper','Coil juniper scale sprays'],
 ['lpoplar','leaf.poplar','Helix poplar foliage'],
 ['lapricot','leaf.apricot','Twist-apricot leaf whorls']].forEach(([it,fam,lab])=>{
 const t=card(fam),m=t?BIO.leafMat(t,it,{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4}):SHIGH.MAT.small;
 BIO.def(it,t?BIO.geo.cells(BIO.geo.clump(),{n:3}):BIO.geo.clump(),m,{attrs:['aN'],label:lab});});

// whorl-wormwood sprigs: card.sage (leaf.small, "sheet": "geometry") under its own item name so the inspector names Whorl-wormwood cleanly
{const sageT=card('leaf.small'),sageM=sageT?BIO.leafMat(sageT,'ssage',{aN:true,swayW:'1.0',swayA:.045,alphaTest:.4}):SHIGH.MAT.small;
 BIO.def('ssage',sageT?BIO.geo.cells(BIO.geo.clump(),{n:3}):BIO.geo.clump(),sageM,{attrs:['aN'],label:'Whorl-wormwood sprigs'});}

// basalt and iron-stained limestone boulders & stones for the ablaq gorge
const ROCKM={};
[['basalt','rock.basalt',PAL.basaltRock],['lime','rock.limestone',PAL.limeRock]].forEach(([k,fam,pal])=>{
 const L=libMap(fam),mat=BIO.solidMat(L?L.t:SHIGH.ROCKTEX),mn=L&&L.mean!=null?lin(L.mean):SHIGH.means().rock;
 ROCKM[k]={mat,mean:mn,pal};});
BIO.def('bboulder',new T3.IcosahedronGeometry(1,1),ROCKM.basalt.mat,{label:'Polygonal basalt boulders'});
BIO.def('bstone',new T3.IcosahedronGeometry(1,0),ROCKM.basalt.mat,{label:'Basalt cobbles'});
BIO.def('lboulder',new T3.IcosahedronGeometry(1,1),ROCKM.lime.mat,{label:'Iron-stained limestone blocks'});
BIO.def('lstone',new T3.IcosahedronGeometry(1,0),ROCKM.lime.mat,{label:'Limestone float'});
const rCol=(k,v)=>tint(vary(pick(ROCKM[k].pal),.02,.05,.05),ROCKM[k].mean,v==null?rr(.55,.82):v);

// spiral pine cones (as station 2)
function coneGeo(n,sides){const pos=[],col=[],uv=[];const tri=(a,b,c,ca,cb,cc)=>{pos.push(...a,...b,...c);col.push(...ca,...cb,...cc);uv.push(0,0,1,0,.5,1);};
 const rAt=t=>.5*Math.pow(Math.sin(Math.PI*Math.min(1,.06+t*.94)),.75)*(1-.25*t);
 const R=[];for(let i=0;i<=6;i++){const t=i/6;R.push([rAt(t)*.62,t]);}
 for(let i=0;i<6;i++)for(let s=0;s<sides;s++){const a0=s/sides*TAU,a1=(s+1)/sides*TAU,p=(r,y,a)=>[r*Math.cos(a),y,r*Math.sin(a)],d=[.32,.22,.14];
  tri(p(R[i][0],R[i][1],a0),p(R[i+1][0],R[i+1][1],a0),p(R[i+1][0],R[i+1][1],a1),d,d,d);tri(p(R[i][0],R[i][1],a0),p(R[i+1][0],R[i+1][1],a1),p(R[i][0],R[i][1],a1),d,d,d);}
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

// five-ranked whorled blossom cluster for the twist-apricot: five blossoms spiralling up a short spur, each five cupped petals round a rose-gold eye
function blossomWhorlGeo(){const pos=[],col=[],uv=[];
 const tri=(a,b,c,ca,cb,cc)=>{pos.push(...a,...b,...c);col.push(...ca,...cb,...cc);uv.push(0,0,1,0,.5,1);};
 const step=TAU*2/5-.05;
 for(let f=0;f<5;f++){const fa=f*step,fy=(f/4-.5)*.22,cx=Math.cos(fa)*.14,cz=Math.sin(fa)*.14;
  const eye=[.88,.42,.48],petB=[.95,.76,.82],petT=[1,.95,.97];
  for(let p=0;p<5;p++){const a=fa+p*TAU/5+.18,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const b0=[cx+ca*.02,fy,cz+sa*.02],l=[cx+ca*.13+px*.075,fy+.055,cz+sa*.13+pz*.075],
    r=[cx+ca*.13-px*.075,fy+.04,cz+sa*.13-pz*.075],tip=[cx+ca*.24,fy+.075,cz+sa*.24];
   tri(b0,l,tip,eye,petB,petT);tri(b0,tip,r,eye,petT,petB);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
BIO.def('apblossom',blossomWhorlGeo(),SHIGH.MAT.vcol,{label:'Twist-apricot five-ranked blossom whorls'});

// twisted woody stock for the whorl-wormwood subshrub
function sageStockGeo(){const pos=[],col=[],uv=[];
 const tri=(a,b,c,ca,cb,cc)=>{pos.push(...a,...b,...c);col.push(...ca,...cb,...cc);uv.push(0,0,1,0,.5,1);};
 for(let s=0;s<3;s++){const a0=s*TAU/3;
  for(let i=0;i<5;i++){const t0=i/5,t1=(i+1)/5,f=t=>{const a=a0+t*TAU*.65,r=.055+.08*t;return[Math.cos(a)*r,t*.34,Math.sin(a)*r];};
   const p=f(t0),q=f(t1),w0=.038*(1-.45*t0),w1=.038*(1-.45*t1),c0=[.36,.31,.25],c1=[.48,.43,.36];
   tri([p[0]-w0,p[1],p[2]],[q[0]-w1,q[1],q[2]],[q[0]+w1,q[1],q[2]],c0,c1,c1);
   tri([p[0]-w0,p[1],p[2]],[q[0]+w1,q[1],q[2]],[p[0]+w0,p[1],p[2]],c0,c1,c0);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
BIO.def('ssagewood',sageStockGeo(),SHIGH.MAT.vcol,{label:'Whorl-wormwood woody stock'});

// ---------------------------------------------------------------- the species (appended: ropepine, coiljuniper, helixpoplar, whorlapricot)
const K=(c,a,r,kp,spiral)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,spiral});
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
const poplarPalette=()=>{const out=[];for(let i=0;i<4;i++){const s=C(PAL.poplarSummer[i]),g=C(PAL.poplarGold[i]);out.push(s.clone().lerp(g,AUT).getHex());}
 out.push(PAL.poplarGold[0]);return out;};
const NEW=[
 {key:'ropepine',name:'Rope pine',H:[7,16],rb:[.34,.75],crownR:[2.8,5.6],barkK:0,bark:PAL.ropeBark,leaf:PAL.pineNeedle,
  how:'its bole is three strands wound like a rope, a turn every two or three metres; the branch whorls turn a ninth of a turn each tier, so the limbs climb in three helices along the canyon rim',
  far:{poleU:.6,taper:.4,blobs:[[.62,.9,.22,'L0','L1'],[.82,.65,.14,'L2','L3']]},tags:K('montane','semiarid','no',['Dsb','Dsc','Dfb'],'twist'),
  harvest:HV('timber (turned and coopered work), resin',['seeds (pine nuts)'],true,'Rimrock pine of Shumar; its nuts and pitch provision the cliff fortresses.')},
 {key:'coiljuniper',name:'Coil juniper',H:[1.1,3.0],rb:[.1,.24],crownR:[1.8,3.8],barkK:0,bark:PAL.juniperBark,leaf:PAL.juniperLeaf,
  how:'wind-combed canyon-lip juniper: corkscrew limbs sprawling low from a short bole, all wound right-handed, grey-green scale-sprays along them',
  far:{poleU:.2,taper:.2,blobs:[[.4,.95,.35,'L0','L2']]},tags:K('montane','semiarid','no',['Dsb','Dsc','ET'],'coil'),
  harvest:HV('fuel (dense, aromatic)',['berries (flavouring)'],true,'Burned on hearth stones and mausoleum braziers across the plateau.')},
 {key:'helixpoplar',name:'Helix poplar',H:[14,25],rb:[.28,.56],crownR:[2.3,4.2],barkK:1,bark:PAL.poplarBark,leaf:poplarPalette(),
  how:'fastigiate canyon-gallery poplar along Qappu-Narun: pale grey-white furrowed bark wound in a gentle right-handed helix, steep ascending branches spiralling up the bole in a golden-olive to bright gold spire',
  far:{poleU:.92,taper:.65,blobs:[[.46,.68,.32,'L0','L1'],[.74,.56,.26,'L2','L3'],[.92,.36,.14,'L4','L1']]},tags:K('montane','semiarid','yes',['Dsb','BSk'],'twist'),
  harvest:HV('straight canyon rafters, roof poles, fuel',[],true,'The tall riparian timber of Shumar: grown along every snowmelt gorge floor.')},
 {key:'whorlapricot',name:'Twist-apricot',H:[4,8],rb:[.16,.34],crownR:[2.2,4.0],barkK:0,bark:PAL.apricotBark,leaf:PAL.apricotLeaf,
  how:'gnarled canyon-shelf stone-fruit tree with dark reddish twisted bark; its leaves, pink-white blossoms and golden fruit sit in five-ranked spiral whorls along corkscrew spurs',
  far:{poleU:.48,taper:.35,blobs:[[.66,.95,.26,'L0','L1'],[.84,.72,.18,0xf2d4dc,'L2']]},tags:K('montane','semiarid','both',['Dsb','Csb'],'twist'),
  harvest:HV('hard carving wood, fuel',['apricots','sweet kernels'],true,'Wild canyon ancestor of the Shumari terrace orchards; dried apricots and kernels keep through winter.')}
];
NEW.forEach(S=>{S.i=SHIGH.SPECIES.length;S.spiral=S.tags.spiral;S.tags.harvest=S.harvest;SHIGH.HARVEST[S.key]=S.harvest;SHIGH.SPECIES.push(S);SHIGH.byKey[S.key]=S;});
const SPI=k=>SHIGH.byKey[k].i;

const PK=(name,c,a,r,kp,spiral,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,spiral),{harvest:hv||HV('none')}),items});
Object.assign(SHIGH.PLANTS,{
 spiralsage:PK('Whorl-wormwood','montane','semiarid','no',['Dsb','BSk','Dsc'],'whorl',['ssage','ssagewood'],
  HV('tinder',[],true,'Aromatic silvery-grey steppe subshrub whose feathery shoots spiral at the golden angle; steeped as a bitter tonic.')),
 cone:PK('Fallen spiral cones','montane','semiarid','no',['Dsb','Dsc'],'whorl',['scone','sconelo'],
  HV('fuel',['seeds'],false,'Fallen cones under the rimrock rope pines.'))
});
if(SHIGH.PLANTS.tussock.items.indexOf('bunch')<0)SHIGH.PLANTS.tussock.items.push('swirllo','bunch');
if(SHIGH.PLANTS.rosette.items.indexOf('rosettelo')<0)SHIGH.PLANTS.rosette.items.push('rosettelo');

// ---------------------------------------------------------------- zones (from 44s-host-land.js fields)
function zonesM(x,z){const F=n=>BIO.field(n,x,z);
 const rock=F('rock'),slope=F('slope'),bench=F('bench'),terrace=F('terrace'),shelf=F('shelf'),rim=F('rim'),seep=F('seep'),north=F('north');
 const cliff=smooth(.78,.94,slope)*smooth(.28,.58,rock),live=cliff>.5?0:1-cliff;
 const crag=smooth(.35,.65,rock)*live*(1-terrace*.6);
 return{rock,slope,cliff,live,crag,bench:bench*live,terrace:terrace*live,shelf:shelf*live,rim:rim*live,seep:seep*live,sunny:(1-north)*live,north};}
SHIGH.zonesM=zonesM;

// ---------------------------------------------------------------- the builders (wrapped in BIO.tree so every tree has one LOD key & attached cards)
const B=SHIGH.B;

B[SPI('ropepine')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR,Hb=H*.86;
 let reach=R*.5,top=T.y0+Hb;
 BIO.tree(T.x,T.z,()=>{
  const rAt=u=>rb*(1-.55*u)*(1+.5*smooth(.1,0,u));
  const C0=twistTrunk(T,S,'barkR',Hb,rAt,3,.24,rr(2.2,3.2),lv,()=>bcol(S,ri(0,9),'barkR'),{st,lean:rr(.02,.1),du:.05,seg:12});
  const tiers=lv===2?ri(5,8):4,a0=rr(0,TAU),hc=C(pick(S.leaf));
  for(let k=0;k<tiers;k++){const u=mix(.32,.96,k/(tiers-1)),p=along(C0,u);
   for(let j=0;j<3;j++){const la=a0+T.hand*(k*TAU/9+j*TAU/3)+rr(-.1,.1),L=R*rr(.7,1.05)*(1.15-u*.6),el=rr(.05,.35);
    const lp=corkscrew(p,dirOf(la,el),L,p.r*.5,.04,lv===2?5:2,L*.06,rr(.3,.6),T.hand,.04);
    if(lv===2)st.limb+=BIO.tube('barkR',joint(lp,p.r,true),bcol(S,k+j,'barkR'),{seg:lp[0].r>.12?5:4,cap:true});
    else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],lp[0].r*1.6,.05,rodCol(S.bark[0]));
    const e=lp[lp.length-1];
    for(const f of(lv===2?[1,.66]:[1])){const q=lp[Math.min(lp.length-1,Math.round(f*(lp.length-1)))],n=lv===2?2:1;
     for(let c=0;c<n;c++){clumpAt('npine',q.x+rr(-.12,.12),q.y+rr(0,.14),q.z+rr(-.12,.12),R*.28*rr(.85,1.15)*(lv===2?1:1.45),.7,hc,T.x,T.y0+Hb*.8,T.z,R,H*.3);st.clumps++;}}
    if(rng()<.32){const s=rr(.24,.38);BIO.put(coneIt(lv),[e.x,e.y-s*.08,e.z],qEuler(rr(2.4,3.0),la,0),hs(T,s),bright(C(pick(PAL.coneAmber)),1.1));}
    reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);top=Math.max(top,e.y+.5);}}});
 regTree(T,S,reach,top-T.y0+1);};

B[SPI('coiljuniper')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 let reach=R*.5;
 BIO.tree(T.x,T.z,()=>{
  const C0=twistTrunk(T,S,'barkJ',H*.35,u=>rb*(1-.3*u),4,.18,rr(.8,1.4),lv,()=>bcol(S,ri(0,9),'barkJ'),{st,lean:rr(.1,.3),du:.2,seg:7});
  const e=C0[C0.length-1],n=lv===2?ri(3,6):3,a0=rr(0,TAU),hc=C(pick(S.leaf));
  for(let k=0;k<n;k++){const la=a0+T.hand*k*GOLD,L=R*rr(.7,1.1),lp=corkscrew(e,dirOf(la,rr(-.05,.2)),L,rb*.7,.03,lv===2?6:3,L*.12,rr(.8,1.4),T.hand,-.06);
   lp.forEach(p=>{const g=BIO.terrainH(p.x,p.z)+p.r+.05;if(p.y<g)p.y=g;});
   if(lv===2)st.limb+=BIO.tube('barkJ',joint(lp,e.r),bcol(S,k,'barkJ'),{seg:5,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],rb*1.2,.06,rodCol(S.bark[0]));
   for(let i=1;i<lp.length;i+=lv===2?1:2){const q=lp[i];clumpAt('njuniper',q.x,q.y+.1,q.z,R*.3*rr(.85,1.18)*(lv===2?1:1.45),.5,hc,T.x,T.y0+H*.5,T.z,R,H);st.clumps++;}
   const t=lp[lp.length-1];reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+.6);}});
 regTree(T,S,reach,H+.5);};

// HELIX POPLAR: tall fastigiate spire along Qappu-Narun's gravel bars; pale grey-white bark with dark fissured foot, steep ascending helical limbs
B[SPI('helixpoplar')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR,Hb=H*.93;
 let reach=R*.55,top=T.y0+Hb;
 BIO.tree(T.x,T.z,()=>{
  const rAt=u=>rb*(1-.78*u)*(1+.42*smooth(.12,0,u));
  const footCol=u=>u<.14?tint(pick(PAL.poplarFoot),BARKS.barkP.mean,rr(.85,1)):bcol(S,Math.floor(u*9),'barkP');
  const C0=twistTrunk(T,S,'barkP',Hb,rAt,5,.11,rr(3.6,5.4),lv,footCol,{st,lean:rr(0,.035),wig:.02,du:.045,seg:11});
  const nB=lv===2?Math.round(H*1.45):Math.round(H*.55),a0=rr(0,TAU);
  const goldMix=clamp(AUT+(rng()-.5)*.45,0,1),cSum=C(pick(PAL.poplarSummer)),cGld=C(pick(PAL.poplarGold)),hc=cSum.clone().lerp(cGld,goldMix);
  for(let k=0;k<nB;k++){const u=mix(.18,.95,k/Math.max(1,nB-1)),p=along(C0,u),la=a0+k*GOLD*T.hand;
   const env=Math.sin(Math.PI*clamp((u-.12)/.88,0,1)),L=R*(.42+.68*env)*rr(.82,1.12),el=mix(.72,1.12,u)+rr(-.06,.06);
   const lp=corkscrew(p,dirOf(la,el),L,Math.max(.035,p.r*.42),.025,lv===2?4:2,L*.07,rr(.35,.65),T.hand,.03);
   if(lv===2)st.limb+=BIO.tube('barkP',joint(lp,p.r,true),bcol(S,k,'barkP'),{seg:4,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],Math.max(.04,lp[0].r*1.3),.03,rodCol(S.bark[0],-.1));
   const stops=lv===2?[1,.58]:[1];
   for(const f of stops){const q=lp[Math.min(lp.length-1,Math.round(f*(lp.length-1)))],sz=R*(.34+.18*env)*rr(.85,1.15)*(lv===2?1:1.45);
    clumpAt('lpoplar',q.x,q.y,q.z,sz,.85,vary(hc,.02,.06,.05),T.x,T.y0+H*.58,T.z,R,H*.42);st.clumps++;}
   const e=lp[lp.length-1];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);top=Math.max(top,e.y+.6);}
  const tp=C0[C0.length-1];clumpAt('lpoplar',tp.x,tp.y,tp.z,R*.38*(lv===2?1:1.35),1.1,hc,T.x,T.y0+H*.6,T.z,R,H*.4);st.clumps++;});
 regTree(T,S,reach,top-T.y0+.8);};

// TWIST-APRICOT: gnarled low canyon-shelf fruit tree, dark reddish twisted bole, corkscrew boughs with five-ranked leaf & pink-white blossom whorls
B[SPI('whorlapricot')]=function(T,st,lv){const S=SHIGH.SPECIES[T.sp],H=T.H,rb=T.rb,R=T.crownR,Hb=H*.46;
 let reach=R*.6,top=T.y0+H;
 BIO.tree(T.x,T.z,()=>{
  const rAt=u=>rb*(1-.38*u)*(1+.45*smooth(.15,0,u));
  const C0=twistTrunk(T,S,'barkA',Hb,rAt,4,.22,rr(1.3,2.1),lv,()=>bcol(S,ri(0,9),'barkA'),{st,lean:rr(.08,.24),wig:.06,du:.08,seg:9});
  const nB=lv===2?5:3,a0=rr(0,TAU),hc=C(pick(S.leaf)),inBloom=rng()<.68,step5=TAU*2/5-.05;
  for(let k=0;k<nB;k++){const u=mix(.58,.98,k/Math.max(1,nB-1)),p=along(C0,u),la=a0+T.hand*(k*step5+rr(-.12,.12));
   const L=R*rr(.72,1.08),el=rr(.18,.52),lp=corkscrew(p,dirOf(la,el),L,p.r*.58,.03,lv===2?5:2,L*.13,rr(.55,.95),T.hand,-.05);
   if(lv===2)st.limb+=BIO.tube('barkA',joint(lp,p.r,true),bcol(S,k,'barkA'),{seg:5,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],lp[0].r*1.4,.04,rodCol(S.bark[0]));
   const idxs=lv===2?[2,3,4,5]:[1,2];
   for(const ii of idxs){const q=lp[Math.min(lp.length-1,ii)],wa=la+ii*step5*T.hand;
    clumpAt('lapricot',q.x,q.y+.05,q.z,R*.32*rr(.82,1.15)*(lv===2?1:1.4),.68,vary(hc,.02,.06,.05),T.x,T.y0+H*.65,T.z,R,H*.4);st.clumps++;
    if(lv===2&&inBloom&&rng()<.72){const bs=rr(.26,.42);
     BIO.put('apblossom',[q.x,q.y+.08,q.z],qEuler(rr(-.25,.25),wa,rr(-.25,.25)),hs(T,bs),bright(C(pick(PAL.apricotBlossom)),1.08));}
    else if(lv===2&&!inBloom&&rng()<.55){BIO.put('fruit',[q.x+Math.cos(wa)*.08,q.y-.04,q.z+Math.sin(wa)*.08],null,.065,bright(C(pick(PAL.apricotFruit)),1.1));}}
   const e=lp[lp.length-1];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.32);top=Math.max(top,e.y+R*.25);}});
 regTree(T,S,reach,top-T.y0+.6);};

// ---------------------------------------------------------------- the passes (no trees on cliff faces: live = 1 - cliff)
SHIGH.PASSES=[
 {sp:SPI('helixpoplar'),cell:13,accept:(Z,x,z)=>{const W=zonesM(x,z);return W.terrace*.74+W.seep*.24;},opt:{pad:2.0,patch:.5,patchScale:.012,lodK:.25}},
 {sp:SPI('whorlapricot'),cell:15,accept:(Z,x,z)=>{const W=zonesM(x,z);return W.shelf*.54+W.terrace*.24+W.rim*.22;},opt:{pad:1.8,patch:.55,patchScale:.011,small:true,lodK:.35}},
 {sp:SPI('ropepine'),cell:22,accept:(Z,x,z)=>{const W=zonesM(x,z);return W.rim*.5+W.crag*.32+W.shelf*.14;},opt:{pad:2.4,patch:.55,patchScale:.009,lodK:.3}},
 {sp:SPI('coiljuniper'),cell:11,accept:(Z,x,z)=>{const W=zonesM(x,z);return W.rim*.4+W.crag*.34+W.shelf*.2;},opt:{pad:1.1,patch:.6,patchScale:.013,small:true,lodK:.45}},
 {sp:SPI('aloe'),cell:13,accept:(Z,x,z)=>{const W=zonesM(x,z);return (W.shelf*.34+W.rim*.22+W.crag*.2)*(.45+.55*W.sunny);},opt:{pad:.8,patch:.6,patchScale:.015,small:true,lodK:.55}},
 {sp:SPI('cereus'),cell:19,accept:(Z,x,z)=>{const W=zonesM(x,z);return (W.shelf*.28+W.crag*.16)*(.4+.6*W.sunny);},opt:{pad:1.3,patch:.58,patchScale:.011,small:true,lodK:.45}}
];

// ---------------------------------------------------------------- the floor
const {swirl,daisies,fern,rosette,around}=SHIGH.small;
const Y=(x,z)=>BIO.terrainH(x,z);
const HND=SHIGH.HAND;

// WHORL-WORMWOOD: a twisted woody foot crowned by 5-7 silvery-grey card.sage sprays stepping outward and upward at the golden angle
function spiralsage(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.45,1.35,(px,pz)=>{const py=Y(px,pz),R=rr(.32,.62)*(lv===0?1.35:1),a0=rr(0,TAU);
 if(lv>=1)BIO.put('ssagewood',[px,py-.03,pz],qEuler(0,a0,0),[R*1.1*HND,R*1.1,R*1.1],nearW(.95));
 const n=lv===2?6:lv===1?3:1,hc=leafCol(PAL.sageLeaf,1.16,.02,.05,.05);
 for(let k=0;k<n;k++){const t=k/Math.max(1,n-1),a=a0+k*GOLD*HND,r=R*.34*(1-.55*t),sy=py+R*(.16+.22*t),sz=R*(.52-.12*t)*(lv===2?1:1.35);
  BIO.put('ssage',[px+Math.cos(a)*r,sy,pz+Math.sin(a)*r],qEuler(rr(-.18,.18),a,rr(-.18,.18)),[sz,sz*.72,sz],vary(hc,.015,.04,.04),{n:[Math.cos(a)*.35,.9,Math.sin(a)*.35]});}
 st.sage++;});}

function albucaF(x,y,z,lv,st){around(x,z,lv===2?ri(1,3):1,.3,.9,(px,pz)=>{const s=rr(.24,.48);
 BIO.put('albuca',[px,Y(px,pz)-.02,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*HND,s,s],nearW());st.albuca++;});}

function rockPiece(x,z,lv,st,kind,big){const nm=big?(kind==='basalt'?'bboulder':'lboulder'):(kind==='basalt'?'bstone':'lstone');
 const Rb=big?rr(.75,2.1):rr(.16,.48);
 around(x,z,lv===2?ri(1,3):1,Rb*.7,Rb*1.4,(px,pz,i)=>{if(BIO.mask(px,pz)<=0)return;
  const r=Rb*(i?rr(.38,.72):1),py=Y(px,pz),h=r*rr(.58,.92);
  BIO.put(nm,[px,py+h*.28,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[r*rr(.9,1.35),h*.82,r*rr(.9,1.35)],rCol(kind));
  if(big)st.boulders++;else st.stones++;
  if(big&&lv===2&&rng()<.4)BIO.put('lichen',[px+rr(-.18,.18)*r,py+h*.98,pz+rr(-.18,.18)*r],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),r*rr(.35,.7),leafCol(PAL.lichen,1.08,.02));});}

function conesF(x,z,lv,st){around(x,z,lv===2?ri(1,3):1,.4,1.5,(px,pz)=>{const s=rr(.14,.28);
 BIO.put(coneIt(lv),[px,Y(px,pz)+s*.28,pz],qEuler(Math.PI/2+rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),s,bright(shade(C(pick(PAL.coneAmber)),-.2),.95));st.cones++;});}

SHIGH.buildFloor=function(R,q){reseed(600447);q=q==null?1:q;R=R==null?2500:R;SHIGH.means();
 const st={sage:0,tussocks:0,bunch:0,ferns:0,albuca:0,flowers:0,rosettes:0,lichen:0,cones:0,stones:0,boulders:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6)||BIO.mask(x,z)<=0)return;const W=zonesM(x,z);if(W.cliff>.58)return;const t=rng();
  if(W.seep>.38){if(t<.52){fern(x,y,z,lv,1.05);st.ferns++;}else if(t<.74){daisies(x,y,z,lv,[0xf4f0e0,0xf0c030]);st.flowers++;}else rockPiece(x,z,lv,st,'basalt',false);return;}
  if(W.terrace>.42){if(t<.34){fern(x,y,z,lv,.85);st.ferns++;}else if(t<.56)spiralsage(x,y,z,lv,st);else if(t<.74){swirl(x,y,z,lv,PAL.dryTussock,.9);st.tussocks++;}else rockPiece(x,z,lv,st,rng()<.65?'basalt':'lime',false);return;}
  if(W.shelf>.38){if(t<.32)spiralsage(x,y,z,lv,st);else if(t<.52)albucaF(x,y,z,lv,st);else if(t<.68){swirl(x,y,z,lv,PAL.dryTussock,.85);st.tussocks++;}else if(t<.82){rosette(x,y,z,PAL.silver,.95,lv);st.rosettes++;}else rockPiece(x,z,lv,st,rng()<.5?'basalt':'lime',false);return;}
  if(W.crag>.45||W.rim>.45){if(t<.28)spiralsage(x,y,z,lv,st);else if(t<.44)conesF(x,z,lv,st);else if(t<.58)albucaF(x,y,z,lv,st);else if(t<.74){BIO.put('lichen',[x,y+.03,z],qEuler(0,rr(0,TAU),0),rr(.3,.7),leafCol(PAL.lichen,1.08,.02));st.lichen++;}else rockPiece(x,z,lv,st,rng()<.55?'basalt':'lime',false);return;}
  /* the wind-swept Dsb plateau bench: whorl-wormwood and dry swirl tussocks */
  if(t<.44)spiralsage(x,y,z,lv,st);
  else if(t<.78){swirl(x,y,z,lv,PAL.dryTussock,1);st.tussocks++;}
  else if(t<.88){daisies(x,y,z,lv,[0xf0c030,0xf4e8a0]);st.flowers++;}
  else if(t<.94)albucaF(x,y,z,lv,st);
  else rockPiece(x,z,lv,st,'lime',false);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .72*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.52,patchScale:.013,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // canyon-foot, shelf and tor boulders (alternating dark polygonal basalt and pale iron-stained limestone)
 BIO.grid(11,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>L.far)return 0;const W=zonesM(x,z);if(W.cliff>.65)return 0;
  return (W.terrace*.38+W.shelf*.42+W.crag*.48+W.rim*.22)*q;},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.hero?2:1,kind=Math.sin(y*.21)>0?'lime':'basalt';rockPiece(x,z,lv,st,kind,true);},{patch:.35,pad:1});
 // dry bunchgrass sward (card.ichu) between the whorl-wormwood bushes on the plateau bench: KRAND per 3.1 m cell
 {const CELLB=3.1,BX=BIO.originBox(L.floor[0]),u=(ix,iz,k)=>KRAND.unit(KRAND.hash(600491,ix,iz,k));
  for(let iz=Math.floor(BX[1]/CELLB);iz<=Math.ceil(BX[3]/CELLB);iz++)for(let ix=Math.floor(BX[0]/CELLB);ix<=Math.ceil(BX[2]/CELLB);ix++){
   const x=(ix+u(ix,iz,1))*CELLB,z=(iz+u(ix,iz,2))*CELLB;if(Math.hypot(x,z)>R||BIO.lodD(x,z)>=L.floor[0])continue;
   const W=zonesM(x,z),a=q*(W.bench*.36+W.rim*.22+W.shelf*.16)*(1-W.crag)*(1-smooth(.35,.65,W.cliff));if(a<=0||u(ix,iz,3)>a)continue;
   if(BIO.mask(x,z)<=0||BIO.depth(x,z)>-.15||!BIO.clearOf(x,z,.55)||blocked(x,z,.5))continue;
   const set=PAL.dryTussock,h=.4+.38*u(ix,iz,4),w=h*(.82+.36*u(ix,iz,6));
   BIO.put('bunch',[x,Y(x,z)-.05,z],qEuler(0,u(ix,iz,5)*TAU,0),[w,h,w],bright(C(set[Math.floor(u(ix,iz,7)*set.length)]),1.04+.26*u(ix,iz,8)));st.bunch++;}}
 return{under:st};};
})();
