// ================================================================= RHEOLITH — guilds, byproducts, and procedural geometry (PLAN.md sections 3, 4, 7)
// Registered as BIO.kit('rheolith') -> global RHEO.
// Four subsurface guilds (viable strictly inside 180-550 degC, aw < 0.15, pH <= 3.8) and eight surface mineral byproducts.
// Nothing bioluminesces: zero emissive colour and zero emissiveMap on every material. Iridescence on metallic bismuth/GeSe
// and thin-film lava blisters is pure dielectric/oxide interference (BIO.iridBarkMat).
BIO.kit('rheolith');
var RHEO={PHYS:RHEO_PHYS,SITES:RHEO_SITES,REAGENTS:RHEO_PHYS.REAGENTS};
(function(){
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);RHEO.C=C;
 const TAG_BASE={
  climate:'hypertropic..cold',aridity:'arid..humid',abyssal:false,riparian:'no',
  koppen:['BWh','BSk','XV','Cwb','ET','O'],holy:false,shared:null,alien:true,native:false,
  origin:'four-day-panspermia',energy:'thermogalvanic-siloxane'
 };
 const K=(o)=>Object.assign({},TAG_BASE,o||{});
 const HV=(note,reagent)=>({wood:'none (mineral-siloxane)',edible:[],medicinal:false,reagent:reagent||'none',note:note||''});

 RHEO.TAGS=TAG_BASE;

 // ---------------------------------------------------------------- palettes (sRGB hex)
 const PAL=RHEO.PAL={
  coral:[0xc8bea8,0xbcb09a,0xd6ccb6,0xa89c88],
  coralDead:[0x8c867e,0x7a756e],
  wire:[0xb8b2a6,0x9e9890,0xcac4b8],
  foam:[0xb4aa96,0xc2b8a4,0x9e9482],
  creeper:[0x8c3b1e,0xa44a24,0x742e18,0xb85a28],
  eggShell:[0x2a2624,0x36302c,0x221e1c],
  eggCore:[0x9a8c78,0xb4a48c,0x867a68],
  collar:[0xd4cab4,0xc4ba9e,0xe0d8c4,0xafa48c],
  scar:[0x4a2e1b,0x5c3820,0x382214],
  blister:[0x282c36,0x323846,0x222630],
  skinLive:[0xc89e62,0xd8b074,0xb48a50],
  skinShard:[0x9a9284,0xafa89a,0x867e72],
  frost:[0xeeece6,0xf6f4ee,0xe0ddd4],
  selRime:[0x9e2418,0xb82e1e,0x7e1c14]
 };

 // ---------------------------------------------------------------- the 4 subsurface guilds (RHEO.SPECIES)
 const SPECIES=RHEO.SPECIES=[
  {
   key:'chokecoral',name:'Choke-Coral',guild:'autotroph-baffle',
   vernacular:{geomancer:'Bore-Knit / First-Order Accretion',zeijani:'Hearth-Gag',andaru:'Throat-Teeth'},
   how:'5-fluted kalsilite-zeolite chimney baffles accreting in the narrowest 260-420 degC gas throats; constricts vent apertures until steam pressure ticks or blows out',
   items:['rh_chokecoral'],
   tags:K({zone:'throat-wall',heat:'220-480C',harvest:HV('Crushed sinter holds fugitive throat vapours in Ranj mulch; responds to Brimstone-Iron Cake.',RHEO_PHYS.REAGENTS.gagCake.name)})
  },
  {
   key:'wirevein',name:'Wire-Vein',guild:'thermoelectric-autotroph',
   vernacular:{geomancer:'Thermogalvanic Seam',zeijani:'Silver-Root',andaru:'Spark-Sinew'},
   how:'dendritic silver-telluride and pyrite-siloxane needle fans bridging 480 degC conduit rock to 200 degC outer fissure walls across a 50-180 mV Seebeck potential',
   items:['rh_wirevein'],
   tags:K({zone:'fissure-bridge',heat:'190-520C',harvest:HV('Cold surface needles snap brittle; conducts Seebeck current across fracture walls.',RHEO_PHYS.REAGENTS.gagCake.name)})
  },
  {
   key:'foamreef',name:'Foam-Reef',guild:'buoyancy-autotroph',
   vernacular:{geomancer:'Vesicular Sole',zeijani:'Bell-Comb',andaru:'Hollow-Stone'},
   how:'closed-cell hexagonal zeolite-siloxane foam rafts clinging under cooling pahoehoe roofs at 240-460 degC, trapping SO2/CO2 gas cushions that buoy thin lava crusts',
   items:['rh_foamreef'],
   tags:K({zone:'sub-crust',heat:'220-460C',harvest:HV('Dead rafts shed onto lava benches as lightweight porous Comb-Plates.',RHEO_PHYS.REAGENTS.fluxSalt.name)})
  },
  {
   key:'fluxcreeper',name:'Flux-Creeper',guild:'heterotroph-grazer',
   vernacular:{geomancer:'Vitriol-Leech / Second-Order Solver',zeijani:'Collar-Rot',andaru:'Salt-Eater'},
   how:'slow amoeboid poly-metallosiloxane cushions secreting fluoride-alkali flux to dissolve Choke-Coral baffles and Foam-Reef rafts, exhaling white SiF4 silica frost',
   items:['rh_fluxcreeper'],
   tags:K({zone:'throat-grazer',heat:'180-390C',harvest:HV('Frenzy-grazes silicate plugs when fed Alkali-Fluorite Salt.',RHEO_PHYS.REAGENTS.fluxSalt.name)})
  }
 ];
 SPECIES.forEach((S,i)=>{S.i=i;S.liveGuild=true;});

 // ---------------------------------------------------------------- the 8 surface byproducts (RHEO.BYPRODUCTS)
 const BYPRODUCTS=RHEO.BYPRODUCTS=[
  {
   key:'staregg',name:'Star-Egg',byproduct:true,
   vernacular:{geomancer:'Quenched Propagule Core',zeijani:'Star-Stone',andaru:'Throne-Seed',yuni:'Peacock Geode'},
   how:'fist-sized volcanic bomb cracked open on impact to reveal a 5-fold spiral vortex of bronze-violet germanium-selenide alloy encased in mullite',
   items:['rh_staregg_shell','rh_staregg_core'],
   tags:K({zone:'ballistic-apron',heat:'ambient-quenched',harvest:HV('Dormant propagule; wakes only in a 260 degC Hot Vitriol Bath.',RHEO_PHYS.REAGENTS.vitriolBath.name)})
  },
  {
   key:'throatcollar',name:'Throat-Collar',byproduct:true,
   vernacular:{geomancer:'Hex-Baffle Ring',zeijani:'Chimney-Lip',andaru:'Pipe-Crown'},
   how:'6-fold spiral-ribbed kalsilite and zeolite sinter rings constricting fumarole mouths with unnaturally regular polygonal apertures',
   items:['rh_collar'],
   tags:K({zone:'vent-lip',heat:'90-240C',harvest:HV('Microporous zeolite sinter prized as Ranj vapour-retaining mulch.',RHEO_PHYS.REAGENTS.gagCake.name)})
  },
  {
   key:'bismuthnest',name:'Bismuth Hair-Nest',byproduct:true,
   vernacular:{geomancer:'Telluride Whisker Tangling',zeijani:'Fumarole-Fleece',andaru:'Demon-Hair'},
   how:'tangled metallic silver-bismuth-telluride whisker fans extruded from fumarole seams beside abiotic hopper-crystal pockets',
   items:['rh_bismuthwire'],
   tags:K({zone:'fumarole-pocket',heat:'110-240C',harvest:HV('Used in geomancer compasses and thermocouple bridges; zero glow, pure oxide tarnish.','none')})
  },
  {
   key:'scarplug',name:'Glassy Scar-Plug',byproduct:true,
   vernacular:{geomancer:'Siloxane Callus',zeijani:'Amber-Seam',andaru:'Pitch-Weld'},
   how:'dark amber ropey silicate-siloxane weld ridges sealing cooling basalt fault cracks; snaps into conchoidal glass below 150 degC',
   items:['rh_scarplug'],
   tags:K({zone:'fault-seam',heat:'60-190C',harvest:HV('Seals borehole casings while hot; turns brittle when poisoned with Heavy Dross.',RHEO_PHYS.REAGENTS.heavyDross.name)})
  },
  {
   key:'bellblister',name:'Ringing Lava Blister',byproduct:true,
   vernacular:{geomancer:'Buoyed Pahoehoe Dome',zeijani:'Bell-Stone',andaru:'Singing-Shield'},
   how:'hollow blue-tarnished pahoehoe dome buoyed over a gas cavity by dead Foam-Reef underpinnings; rings at 140-180 Hz under a shod staff',
   items:['rh_blister'],
   tags:K({zone:'lava-bench',heat:'40-120C',harvest:HV('A high bell-ring (~160 Hz) marks safe load-bearing crust; a dull thud (~65 Hz) warns of foundering.',RHEO_PHYS.REAGENTS.fluxSalt.name)})
  },
  {
   key:'combplate',name:'Comb-Plate',byproduct:true,
   vernacular:{geomancer:'Shed Zeolite Raft',zeijani:'Pumice-Comb',andaru:'Wasp-Slag'},
   how:'lightweight hexagonal-celled ceramic slab heaved up at lava-crust margins when basal Foam-Reef mats die and vitrify',
   items:['rh_combplate'],
   tags:K({zone:'lava-bench',heat:'30-95C',harvest:HV('Fireproof refractory tile and moisture-free vapour trap for Ranj rootstocks.','none')})
  },
  {
   key:'throatskin',name:'Shed Throat-Skin',byproduct:true,
   vernacular:{geomancer:'Exfoliated Siloxane Cuticle',zeijani:'Vent-Parchment',andaru:'Snake-Mica'},
   how:'translucent amber polysiloxane sheets peeled from fumarole walls; supple and fluttering above 110 degC in steam, shattering into mica-like shards downslope',
   items:['rh_throatskin'],
   tags:K({zone:'steam-halo',heat:'25-230C',harvest:HV('Supple only in live steam (>110 degC); hydrolyses and cracks in cool rain.','none')})
  },
  {
   key:'etchhalo',name:'Etch-Halo & Selenium Rime',byproduct:true,
   vernacular:{geomancer:'Fluoride Exhaust Ring',zeijani:'Rot-Rime',andaru:'Blood-Salt'},
   how:'snow-white amorphous silica frost (from SiF4 gas hydrolysis) rimmed with blood-red native selenium around vents grazed by Flux-Creepers',
   items:['rh_etchfrost','rh_selrime'],
   tags:K({zone:'rotting-vent',heat:'45-185C',harvest:HV('Diagnostic surface tell of subsurface Flux-Creeper grazing and imminent blowout.',RHEO_PHYS.REAGENTS.fluxSalt.name)})
  }
 ];
 BYPRODUCTS.forEach((B,i)=>{B.i=i;});

 const ALL=RHEO.ALL=SPECIES.concat(BYPRODUCTS);
 const byKey={};ALL.forEach(S=>{byKey[S.key]=S;});RHEO.byKey=byKey;
 RHEO.speciesOfItem=it=>{for(const S of ALL)if(S.items.indexOf(it)>=0)return S;return null;};
 RHEO.plantOfItem=RHEO.speciesOfItem;

 // ---------------------------------------------------------------- materials (strictly non-emissive, porous mineral grain)
 const TEX_SINTER=BIO.canvasTex(256,256,(g,w,h)=>{
  const id=g.createImageData(w,h),d=id.data,fbm=BIO.fn.fbm,h3=BIO.fn.h3;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const n1=fbm(x/18,y/18,3.1,3)-.5,n2=fbm(x/6,y/6,7.4,2)-.5,pit=h3(x,y,19)<.09?-26:0;
   const v=Math.max(150,Math.min(255,228+n1*46+n2*28+pit));
   d[i]=v;d[i+1]=Math.max(145,v-3);d[i+2]=Math.max(140,v-7);d[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
 const mkStd=(rough,metal,dbl,tex,bump)=>new T3.MeshStandardMaterial({
  color:0xffffff,roughness:rough,metalness:metal,vertexColors:true,
  map:tex||null,bumpMap:tex||null,bumpScale:bump==null?.022:bump,
  side:dbl?T3.DoubleSide:T3.FrontSide
 });
 const M=RHEO.M={
  sinter:mkStd(.82,.03,false,TEX_SINTER,.028),
  creeper:mkStd(.44,.06,false,TEX_SINTER,.018),
  scar:mkStd(.24,.06,false,null,0),
  skin:mkStd(.46,.03,true,TEX_SINTER,.016),
  frost:mkStd(.90,.0,false,TEX_SINTER,.032),
  shell:mkStd(.86,.04,true,TEX_SINTER,.030),
  metalIrid:BIO.iridBarkMat(null,'rh-metal-irid',[1.18,1.02,.76],[.58,.72,1.62]),
  blisterIrid:BIO.iridBarkMat(null,'rh-blister-irid',[.86,.94,1.15],[.55,.82,1.42])
 };

 // ---------------------------------------------------------------- deterministic static BufferGeometry builders (zero rng() stream touch)
 function lcg(seed){
  let s=(seed>>>0)||1;
  return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 }
 function buildGeo(pos,uvs,idx){
  const g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('uv',new T3.BufferAttribute(new Float32Array(uvs),2));
  const col=new Float32Array(pos.length);for(let i=0;i<col.length;i++)col[i]=1;
  g.setAttribute('color',new T3.BufferAttribute(col,3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
 }
 function addTube(pos,uvs,idx,pts,rFn,seg,flutes,fluteA,phase){
  const base=pos.length/3,rings=pts.length;
  for(let j=0;j<rings;j++){
   const p=pts[j],v=j/(rings-1),pPrev=pts[Math.max(0,j-1)],pNext=pts[Math.min(rings-1,j+1)];
   let tx=pNext[0]-pPrev[0],ty=pNext[1]-pPrev[1],tz=pNext[2]-pPrev[2];
   const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
   let ux=Math.abs(ty)<.92?0:1,uy=Math.abs(ty)<.92?1:0,uz=0;
   let nx=uy*tz-uz*ty,ny=uz*tx-ux*tz,nz=ux*ty-uy*tx;
   const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
   const bx=ty*nz-tz*ny,by=tz*nx-tx*nz,bz=tx*ny-ty*nx;
   const r0=rFn(v);
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2+(phase==null?0:phase)+v*1.1*(flutes?1:0);
    const rr=r0*(1+(flutes?fluteA*Math.cos(flutes*a):0));
    const ca=Math.cos(a),sa=Math.sin(a);
    pos.push(p[0]+(nx*ca+bx*sa)*rr,p[1]+(ny*ca+by*sa)*rr,p[2]+(nz*ca+bz*sa)*rr);
    uvs.push(u,v);
   }
  }
  const row=seg+1;
  for(let j=0;j<rings-1;j++){
   for(let i=0;i<seg;i++){
    const a=base+j*row+i,b=a+row,c=b+1,d=a+1;
    idx.push(a,b,d,b,c,d);
   }
  }
  // tip cap
  const tip=pts[rings-1],cIdx=pos.length/3;
  pos.push(tip[0],tip[1],tip[2]);uvs.push(.5,1);
  const last=base+(rings-1)*row;
  for(let i=0;i<seg;i++)idx.push(last+i,cIdx,last+i+1);
 }

 // 1. Choke-Coral: cluster of 5-fluted inward-curving kalsilite baffle fingers with rooted holdfast (y = -0.24..+0.82)
 function geoChokeCoral(seed){
  const R=lcg(seed),pos=[],uvs=[],idx=[];
  const n=5;
  for(let k=0;k<n;k++){
   const a0=k/n*Math.PI*2+R()*.35,rad=k===0?0:.13+.07*R(),h=.56+.34*R(),lean=.17+.13*R();
   const pts=[];
   for(let j=0;j<=7;j++){
    const t=j/7,y=-.24+t*(h+.24),vt=Math.max(0,(j-1)/6);
    const bend=Math.sin(vt*Math.PI*.85)*lean;
    pts.push([Math.cos(a0)*(rad*(.85+.15*vt)+bend),y,Math.sin(a0)*(rad*(.85+.15*vt)+bend)]);
   }
   addTube(pos,uvs,idx,pts,v=>.14*(1-.54*v)*(.88+.2*Math.sin(v*9)),10,5,.22,a0);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 2. Wire-Vein & Bismuth Hair-Nest: dendritic fan of sharp metallic needles rooted at y = -0.14
 function geoWireFan(seed,branches,spread){
  const R=lcg(seed),pos=[],uvs=[],idx=[];
  for(let k=0;k<branches;k++){
   const a=(k/(branches-1||1)-.5)*spread+(R()-.5)*.22,pitch=.22+.52*R(),len=.44+.52*R();
   const pts=[[0,-.14,0]];
   for(let j=0;j<=4;j++){
    const t=j/4,zig=(j%2===1?1:-1)*.022*t;
    pts.push([Math.sin(a)*Math.cos(pitch)*len*t+zig,Math.sin(pitch)*len*t-.02,Math.cos(a)*Math.cos(pitch)*len*t]);
   }
   addTube(pos,uvs,idx,pts,v=>.027*(1-.76*v),4,0,0,a);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 3. Foam-Reef & Comb-Plate: packed hexagonal-prism cellular raft slab with rooted mineral sole (y = -0.20..+h)
 function geoHexComb(seed,rings,cellR,h){
  const R=lcg(seed),pos=[],uvs=[],idx=[];
  const dx=cellR*1.72,dz=cellR*1.5,yBase=-.20;
  for(let q=-rings;q<=rings;q++){
   for(let r=-rings;r<=rings;r++){
    if(Math.abs(q+r)>rings)continue;
    const cx=(q+r*.5)*dx,cz=r*dz,ch=h*(.72+.48*R()),ri=cellR*.80;
    const b0=pos.length/3;
    for(let s=0;s<6;s++){
     const a=s/6*Math.PI*2;
     pos.push(cx+Math.cos(a)*(cellR*1.04),yBase,cz+Math.sin(a)*(cellR*1.04));uvs.push(s/6,0);
     pos.push(cx+Math.cos(a)*cellR,ch,cz+Math.sin(a)*cellR);uvs.push(s/6,1);
     pos.push(cx+Math.cos(a)*ri,ch,cz+Math.sin(a)*ri);uvs.push(s/6,.85);
     pos.push(cx+Math.cos(a)*ri,ch*.26,cz+Math.sin(a)*ri);uvs.push(s/6,.3);
    }
    const cPit=pos.length/3;pos.push(cx,ch*.22,cz);uvs.push(.5,.5);
    for(let s=0;s<6;s++){
     const n=(s+1)%6,A=b0+s*4,B=b0+n*4;
     idx.push(A,A+1,B+1,A,B+1,B);
     idx.push(A+1,A+2,B+2,A+1,B+2,B+1);
     idx.push(A+2,A+3,B+3,A+2,B+3,B+2);
     idx.push(A+3,cPit,B+3);
    }
   }
  }
  return buildGeo(pos,uvs,idx);
 }

 // 3b. Encrusting mineral cushion / frost pad with rounded lobes and downturned rock-wrapping skirt (replaces flat star polygon)
 function geoCrustPad(seed,lobes,lobeA,hTop,skirtD){
  const R=lcg(seed),pos=[],uvs=[],idx=[],seg=24;
  const ph1=R()*6.28,ph2=R()*6.28;
  const radAt=a=>.62*(1+lobeA*Math.cos(lobes*a+ph1)+.08*Math.cos((lobes+3)*a+ph2));
  // center crown, mid dome ring, rim lip, and buried downturned skirt
  pos.push(0,hTop,0);uvs.push(.5,.5);
  const rMid=1,rLip=rMid+seg+1,rSkirt=rLip+seg+1;
  for(let ring=0;ring<3;ring++){
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2,rad=radAt(a);
    const rr=ring===0?rad*.56:ring===1?rad:rad*1.06;
    const yy=ring===0?hTop*.68:ring===1?.015:-skirtD;
    pos.push(Math.cos(a)*rr,yy,Math.sin(a)*rr);
    uvs.push(.5+Math.cos(a)*.5*(ring===0?.55:1),.5+Math.sin(a)*.5*(ring===0?.55:1));
   }
  }
  for(let i=0;i<seg;i++){
   idx.push(0,rMid+i+1,rMid+i);
   const a1=rMid+i,b1=rLip+i,c1=b1+1,d1=a1+1;
   idx.push(a1,d1,b1,b1,d1,c1);
   const a2=rLip+i,b2=rSkirt+i,c2=b2+1,d2=a2+1;
   idx.push(a2,d2,b2,b2,d2,c2);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 4. Star-Egg: thick-walled split mullite bomb craterlet (buried skirt y = -0.22) + nestled 5-fold spiral GeSe core
 function geoEggShell(seed){
  const R=lcg(seed),pos=[],uvs=[],idx=[],seg=18;
  const prof=[[0.52,-0.22],[0.50,0.05],[0.45,0.20],[0.36,0.18],[0.22,0.05]];
  const rings=prof.length-1;
  for(let j=0;j<=rings;j++){
   const r0=prof[j][0],y0=prof[j][1],v=j/rings;
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2;
    const wob=1+.07*Math.cos(5*a+.4)+.03*(R()-.5);
    const lip=(j===2||j===3)?.055*Math.cos(5*a)+.02*Math.sin(10*a):0;
    pos.push(Math.cos(a)*r0*wob,y0+lip,Math.sin(a)*r0*wob);
    uvs.push(u,v);
   }
  }
  const row=seg+1;
  for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){
   const a=j*row+i,b=a+row,c=b+1,d=a+1;
   idx.push(a,b,d,b,c,d);
  }
  const cBot=pos.length/3,last=rings*row;
  pos.push(0,.02,0);uvs.push(.5,1);
  for(let i=0;i<seg;i++)idx.push(last+i,cBot,last+i+1);
  return buildGeo(pos,uvs,idx);
 }
 function geoEggCore(){
  const pos=[],uvs=[],idx=[],seg=25,rings=10;
  for(let j=0;j<=rings;j++){
   const v=j/rings,th=v*Math.PI*.88+.06;
   const rBase=Math.sin(th)*.28,y=Math.cos(th)*.20+.13;
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2;
    const spiral=.22*Math.cos(5*a+v*4.2);
    const r=rBase*(1+spiral);
    pos.push(Math.cos(a)*r,y,Math.sin(a)*r);uvs.push(u,v);
   }
  }
  const row=seg+1;
  for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){
   const a=j*row+i,b=a+row,c=b+1,d=a+1;
   idx.push(a,d,b,b,d,c);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 5. Throat-Collar: 6-fold spiral-ribbed polygonal chimney ring with deep basal sinter skirt (y = -0.38..+0.50)
 function geoCollar(){
  const pos=[],uvs=[],idx=[],seg=18,rings=7;
  for(let j=0;j<=rings;j++){
   const v=j/rings,y=-.38+v*.88;
   const vt=Math.max(0,(v-.32)/.68);
   const rOut=(.68-.06*Math.min(1,v/.32))-.22*vt;
   const rIn=.32-.09*vt;
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2+vt*.52;
    const hex=1+.10*Math.cos(6*a);
    pos.push(Math.cos(a)*rOut*hex,y,Math.sin(a)*rOut*hex);uvs.push(u,v);
    pos.push(Math.cos(a)*rIn*hex,y-.04,Math.sin(a)*rIn*hex);uvs.push(u,v);
   }
  }
  const row=(seg+1)*2;
  for(let j=0;j<rings;j++){
   for(let i=0;i<seg;i++){
    const A=j*row+i*2,B=A+row,C2=B+2,D=A+2;
    idx.push(A,B,D,B,C2,D);
    idx.push(A+1,D+1,B+1,B+1,D+1,C2+1);
   }
  }
  const top=rings*row;
  for(let i=0;i<seg;i++){
   const A=top+i*2,D=A+2;
   idx.push(A,A+1,D+1,A,D+1,D);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 6. Shed Throat-Skin: curled peeling siloxane sheet with rooted basal hinge (y = -0.10..+0.72)
 function geoThroatSkin(seed){
  const R=lcg(seed),pos=[],uvs=[],idx=[],nx=5,ny=8;
  const curl=.52+.32*R(),w=.32+.12*R(),h=.68+.22*R();
  for(let j=0;j<=ny;j++){
   const v=j/ny,ang=v*curl*1.6,y=-.10+Math.sin(v*Math.PI*.66)*(h+.10),z=v*.38*(1+.28*Math.cos(ang));
   const taper=(1-.55*v*v)*(.68+.32*Math.sin(v*Math.PI*.85+.25));
   for(let i=0;i<=nx;i++){
    const u=i/nx-.5,arch=Math.cos(u*Math.PI)*.05*v;
    pos.push(u*w*taper,y+arch,z+Math.abs(u)*.06*v);
    uvs.push(i/nx,v);
   }
  }
  const row=nx+1;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const a=j*row+i,b=a+row,c=b+1,d=a+1;
   idx.push(a,b,d,b,c,d);
  }
  return buildGeo(pos,uvs,idx);
 }

 // 7. Scar-Plug & Blister: fracture-hugging callus ridge (ends plunge into rock) and skirted pahoehoe dome
 function geoScarPlug(seed){
  const R=lcg(seed),pos=[],uvs=[],idx=[],pts=[];
  for(let j=0;j<=8;j++){
   const t=j/8-.5;
   pts.push([t*1.45,-.12+.22*Math.cos(t*Math.PI),(R()-.5)*.14]);
  }
  addTube(pos,uvs,idx,pts,v=>.15*Math.sin(v*Math.PI*.88+.18)*(1+.16*Math.sin(v*18)),7,3,.12,.3);
  return buildGeo(pos,uvs,idx);
 }
 function geoBlisterDome(seed){
  const R=lcg(seed),pos=[],uvs=[],idx=[],seg=20,rings=5;
  const ph=R()*6.28;
  pos.push(0,.30,0);uvs.push(.5,.5);
  for(let j=1;j<=rings;j++){
   const v=j/rings,isSkirt=j===rings;
   const rBase=isSkirt?1.04:Math.sin(v*Math.PI*.52);
   const y=isSkirt?-.22:Math.cos(v*Math.PI*.52)*.30;
   for(let i=0;i<=seg;i++){
    const u=i/seg,a=u*Math.PI*2,wob=1+.08*Math.cos(3*a+ph)+.05*Math.sin(5*a-ph);
    const rr=rBase*wob;
    pos.push(Math.cos(a)*rr,y,Math.sin(a)*rr);
    uvs.push(.5+Math.cos(a)*.5*v,.5+Math.sin(a)*.5*v);
   }
  }
  const row=seg+1;
  for(let i=0;i<seg;i++)idx.push(0,1+i+1,1+i);
  for(let j=0;j<rings-1;j++){
   const r0=1+j*row,r1=r0+row;
   for(let i=0;i<seg;i++){
    const a=r0+i,b=r1+i,c=b+1,d=a+1;
    idx.push(a,d,b,b,d,c);
   }
  }
  return buildGeo(pos,uvs,idx);
 }

 // ---------------------------------------------------------------- register BIO.def items & expose reusable geometries on RHEO.GEO
 const GEO=RHEO.GEO={
  chokecoral:geoChokeCoral(5101),
  fluxcreeper:geoCrustPad(5104,6,.18,.11,.22),
  throatskin:geoThroatSkin(5110),
  etchfrost:geoCrustPad(5111,7,.16,.07,.20)
 };
 BIO.def('rh_chokecoral',GEO.chokecoral,M.sinter,{label:'Choke-Coral (kalsilite-zeolite throat baffle)'});
 BIO.def('rh_wirevein',geoWireFan(5102,9,1.9),M.metalIrid,{label:'Wire-Vein (silver-telluride thermoelectric needles)'});
 BIO.def('rh_foamreef',geoHexComb(5103,2,.14,.16),M.sinter,{label:'Foam-Reef (hexagonal gas-vesicle raft)'});
 BIO.def('rh_fluxcreeper',GEO.fluxcreeper,M.creeper,{label:'Flux-Creeper (siloxane fluoride grazer)'});

 BIO.def('rh_staregg_shell',geoEggShell(5105),M.shell,{label:'Star-Egg (cracked mullite volcanic bomb)'});
 BIO.def('rh_staregg_core',geoEggCore(),M.metalIrid,{label:'Star-Egg Core (5-fold spiral GeSe propagule)'});
 BIO.def('rh_collar',geoCollar(),M.sinter,{label:'Throat-Collar (6-fold sinter chimney ring)'});
 BIO.def('rh_bismuthwire',geoWireFan(5106,11,2.3),M.metalIrid,{label:'Bismuth Hair-Nest (extruded metallic whiskers)'});
 BIO.def('rh_scarplug',geoScarPlug(5107),M.scar,{label:'Glassy Scar-Plug (siloxane fracture weld)'});
 BIO.def('rh_blister',geoBlisterDome(5108),M.blisterIrid,{label:'Ringing Lava Blister (buoyed pahoehoe dome)'});
 BIO.def('rh_combplate',geoHexComb(5109,2,.13,.11),M.sinter,{label:'Comb-Plate (shed hexagonal zeolite slab)'});
 BIO.def('rh_throatskin',GEO.throatskin,M.skin,{label:'Shed Throat-Skin (exfoliated polysiloxane sheet)'});
 BIO.def('rh_etchfrost',GEO.etchfrost,M.frost,{label:'Etch-Halo (white SiF4 silica frost)'});
 BIO.def('rh_selrime',geoCrustPad(5112,5,.20,.08,.20),M.frost,{label:'Selenium Rime (red sublimate crust)'});
})();
