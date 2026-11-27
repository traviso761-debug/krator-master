// ================================================================= SOUTHWEST BAY & CRATER DRYLANDS N — giant mound-termites
// Giant (cat-to-wolf-sized in ~1.9-2.0 atm air) cathedral-mound termites strictly for SW Bay's upland Aw savanna
// (biomes/swbay) and northern Crater Drylands' savanna edge (biomes/crater-drylands station `edge`).
// Given a list of KSTACKS.mounds records `mounds`, SWBAY.buildTermites(mounds, opt):
//   1. Inoculates damp basal skirts and flue vents with monoculture hive-fungus crops (`mound-cap` gilled titan-caps
//      and spongy amber `hive-comb` vent shelves; kits/crops/src/21-crop-termites.js);
//   2. Animates radial foraging columns of cat-sized pale-amber workers (~0.68 m) stripping grass/crops and patrolling
//      rings of wolf-sized rust-chitin mandibulate & nasute glue-soldiers (~1.34 m) via BIO.dynamic + BIO.phaseAnimMat;
//   3. Registers KHAZ.PREDATOR.lair hazards (bleed + nasute acid corrode) on active cathedral mounds so cattle, standing
//      crops, and desperate or dry-season passers-by face a real data-driven hazard.
(function(){
 if(typeof SWBAY==='undefined')return;
 const {TAU,clamp,mix,qEuler}=BIO.fn;
 const T3=BIO.host.THREE;

 // Vertex-coloured hexapod unit geometry (head along -z to match grazerGeo / BIO.phaseAnimMat('grazer'), legs under y=0.5
 // swinging in diagonal pairs down to y=0). Scale by caste height H (~0.34 m worker, ~0.64 m wolf-sized soldier).
 function termiteGeo(soldier){
  const parts=[],c=new T3.Color();
  const lin=h=>{c.setHex(h).convertSRGBToLinear();return c.clone();};
  const abd=lin(soldier?0xb8844c:0xdcbf8c),abdDark=abd.clone().multiplyScalar(.76);
  const thx=lin(soldier?0x8e3b1c:0xc69c62),hd=lin(soldier?0x7c2610:0xb58344);
  const jaw=lin(0x18100c),legC=lin(soldier?0x682c16:0xa67c48),tipC=lin(0x241610);
  const pushGeo=(g,colTop,colBot,yMid,hSpan)=>{
   const gi=g.index?g.toNonIndexed():g,a=gi.attributes.position.array,n=gi.attributes.normal.array;
   for(let i=0;i<a.length;i+=3){
    const useBot=colBot&&a[i+1]<yMid-hSpan*.18,cc=useBot?colBot:colTop;
    parts.push(a[i],a[i+1],a[i+2],n[i],n[i+1],n[i+2],cc.r,cc.g,cc.b);}};
  // Segmented tergite abdomen (+z aft), narrow petiole waist, saddle pronotum/thorax
  pushGeo(new T3.SphereGeometry(.34,7,5).scale(.82,.72,1.38).translate(0,.64,.52),abd,abdDark,.64,.48);
  pushGeo(new T3.SphereGeometry(.22,6,4).scale(.78,.68,.88).translate(0,.60,.02),thx,abdDark,.60,.30);
  pushGeo(new T3.SphereGeometry(.26,6,4).scale(.92,.62,.95).translate(0,.68,-.22),thx,abdDark,.68,.32);
  // Bulbous armored head capsule (-z forward)
  const hScale=soldier?[1.08,.96,1.18]:[.76,.72,.84],hz=soldier?-.66:-.52;
  pushGeo(new T3.SphereGeometry(.29,7,5).scale(hScale[0],hScale[1],hScale[2]).translate(0,.66,hz),hd,thx,.66,.42);
  // Mandibles & nasute fontanelle nozzle
  for(const s of [-1,1]){
   if(soldier){
    const m1=new T3.ConeGeometry(.075,.48,5).rotateX(-Math.PI*.52).rotateY(-s*.38).translate(s*.15,.56,hz-.42);
    pushGeo(m1,jaw,null,0,1);
   }else{
    const m0=new T3.ConeGeometry(.045,.22,4).rotateX(-Math.PI*.5).rotateY(-s*.28).translate(s*.09,.56,hz-.24);
    pushGeo(m0,jaw,null,0,1);
   }
   // Forward-swept moniliform antennae
   const ant=new T3.CylinderGeometry(.012,.022,.38,4).rotateX(-Math.PI*.38).rotateZ(-s*.42).translate(s*.22,.76,hz-.26);
   pushGeo(ant,tipC,null,0,1);
  }
  if(soldier){
   // Dorsal nasute/fontanelle ridge crest so both soldier subcastes read silhouetted from 25 m
   pushGeo(new T3.ConeGeometry(.055,.32,5).rotateX(-Math.PI*.46).translate(0,.78,hz-.34),hd,null,0,1);
  }
  // Six jointed hexapod legs (all vertices under y = 0.50 so BIO.phaseAnimMat('grazer') swings diagonal pairs!)
  const zPairs=[-.30,.04,.38];
  for(let p=0;p<3;p++){
   const zp=zPairs[p];
   for(const s of [-1,1]){
    const femur=new T3.CylinderGeometry(.036,.028,.30,4).rotateZ(s*.68).translate(s*.24,.38,zp);
    const tibia=new T3.CylinderGeometry(.026,.014,.38,4).rotateZ(-s*.18).translate(s*.36,.18,zp+(p===0?-.05:p===2?.05:0));
    pushGeo(femur,legC,null,0,1);
    pushGeo(tibia,legC,tipC,.18,.38);
   }
  }
  const nV=parts.length/9,pos=new Float32Array(nV*3),nor=new Float32Array(nV*3),col=new Float32Array(nV*3),uv=new Float32Array(nV*2);
  for(let i=0;i<nV;i++){
   pos[i*3]=parts[i*9];pos[i*3+1]=parts[i*9+1];pos[i*3+2]=parts[i*9+2];
   nor[i*3]=parts[i*9+3];nor[i*3+1]=parts[i*9+4];nor[i*3+2]=parts[i*9+5];
   col[i*3]=parts[i*9+6];col[i*3+1]=parts[i*9+7];col[i*3+2]=parts[i*9+8];
  }
  return BIO.geo._make(pos,nor,uv,col);
 }

 let defsKit=null;
 function ensureFungusDefs(){
  const curKit=BIO.kitName||'';
  const R=BIO.kits&&BIO.kits[curKit];
  if(R&&R.defs&&R.defs.moundcap&&R.defs.hivecomb)return;
  if(defsKit===curKit)return;
  defsKit=curKit;
  const mat=BIO.solidMat(null);
  const capGeo=BIO.fung
   ?BIO.fung.cap({form:'dome',h:.34,seg:8,rings:2,wav:5,wavA:.03,lump:.03,under:'gills',gillN:8,stem:{h:1.32,r:.14,r1:.09,seg:5,k:1.38},seed:761}).scale(.56,.56,.56)
   :new T3.ConeGeometry(.42,.72,8).translate(0,.36,0);
  const combGeo=BIO.fung
   ?BIO.fung.bracket({arc:Math.PI*1.15,seg:6,thick:.42,droop:.12,wav:5,wavA:.05,lump:.10,seed:762})
   :new T3.IcosahedronGeometry(.45,0);
  BIO.def('moundcap',capGeo,mat,{cls:'flora',kind:'fungus',label:'Cathedral titan-cap (Termitomyces mound-cap crop)',
   tags:{koppen:'Aw',harvest:{wood:0,edible:['mound-cap'],medicinal:false}}});
  BIO.def('hivecomb',combGeo,mat,{cls:'flora',kind:'fungus',label:'Termite hive-comb (subterranean fungus garden)',
   tags:{koppen:'Aw',harvest:{wood:0,edible:['hive-comb'],medicinal:true}}});
 }

 SWBAY.buildTermites=function(mounds,opt){
  opt=opt||{};
  const list=Array.isArray(mounds)?mounds:[];
  const st={mounds:list.length,activeColonies:0,workers:0,soldiers:0,caps:0,combs:0,hazards:0};
  if(!list.length||typeof KRAND==='undefined')return st;
  const worldSeed=opt.world==null?0x57ba7:opt.world;
  const biomeName=opt.biome||'swbay';
  const Y=opt.ground||BIO.terrainH;
  const regFn=opt.register||BIO.register;
  const lodRange=opt.lodRange==null?1200:opt.lodRange;

  ensureFungusDefs();
  // BIO.put converts sRGB Color -> linear internally, so keep palette colours in sRGB space
  const cCap1=new T3.Color(0xe8d9b8),cCap2=new T3.Color(0xcfa86e);
  const cComb1=new T3.Color(0xdca854),cComb2=new T3.Color(0xb67c32);
  const cTmp=new T3.Color();

  // Sort mounds by proximity to LOD spine so the nearest/most visible cathedrals get animated foraging columns & soldiers
  const ranked=list.slice().sort((a,b)=>(BIO.lodD?BIO.lodD(a.x,a.z):Math.hypot(a.x,a.z))-(BIO.lodD?BIO.lodD(b.x,b.z):Math.hypot(b.x,b.z)));
  const maxActive=opt.maxActive==null?18:opt.maxActive;
  const activeSet=new Set(ranked.slice(0,maxActive));
  const fruitSet=new Set(ranked.slice(0,Math.min(list.length,48)));

  const workerAgents=[],soldierAgents=[];
  const prevRange=BIO.lodRange;
  BIO.lodRange=lodRange;

  for(let mi=0;mi<list.length;mi++){
   const M=list[mi],mx=Math.round(M.x*10),mz=Math.round(M.z*10),mH=Math.max(2,M.top-M.y0);
   const Rnd=KRAND.stream(KRAND.hash(worldSeed,mx,mz,0x7e41));
   const rf=(a,b)=>a+(b-a)*Rnd.next();
   const hasFruit=fruitSet.has(M);

   if(hasFruit){
    // 1. Fruiting Cathedral titan-caps (`mound-cap`) erupting in damp clusters around the clay basal skirt
    const nClusters=2+Math.floor(Rnd.next()*2);
    for(let cl=0;cl<nClusters;cl++){
     const a0=rf(0,TAU),r0=M.R*rf(.84,1.18),nIn=2+Math.floor(Rnd.next()*3);
     for(let k=0;k<nIn;k++){
      const ang=a0+rf(-.22,.22),rad=r0+rf(-.42,.52);
      const fx=M.x+Math.cos(ang)*rad,fz=M.z+Math.sin(ang)*rad,fy=Y(fx,fz)-.05;
      const sc=rf(.62,1.22)*clamp(mH/5.5,.78,1.25);
      cTmp.copy(cCap1).lerp(cCap2,Rnd.next()*.65);
      BIO.put('moundcap',[fx,fy,fz],qEuler(rf(-.14,.14),rf(0,TAU),rf(-.14,.14)),[sc,sc*rf(.85,1.15),sc],cTmp);
      st.caps++;
     }
    }

    // 2. Spongy golden-amber `hive-comb` fungus shelves tucked in the lower air-conditioning flue vents
    const nCombs=2+Math.floor(Rnd.next()*3);
    for(let k=0;k<nCombs;k++){
     const ang=rf(0,TAU),rad=M.R*rf(.48,.68),vy=M.y0+mH*rf(.08,.24);
     const vx=M.x+Math.cos(ang)*rad,vz=M.z+Math.sin(ang)*rad,sc=rf(.34,.60);
     cTmp.copy(cComb1).lerp(cComb2,Rnd.next()*.75);
     BIO.put('hivecomb',[vx,Math.max(Y(vx,vz)+.12,vy),vz],qEuler(rf(-.12,.12),ang,rf(-.12,.12)),[sc,sc*.78,sc*.85],cTmp);
     st.combs++;
    }
   }

   // 3. Active colonies: radial foraging worker trails + perimeter wolf-sized soldiers + KHAZ predator/acid hazard
   const isActive=activeSet.has(M);
   const nW=isActive?(14+Math.floor(Rnd.next()*10)):0;
   const nS=isActive?(6+Math.floor(Rnd.next()*5)):0;
   if(isActive){
    st.activeColonies++;
    const trailA0=rf(0,TAU),nTrails=2+Math.floor(Rnd.next()*2);
    for(let w=0;w<nW;w++){
     const tr=w%nTrails,baseAng=trailA0+tr*(TAU/nTrails)+rf(-.09,.09);
     workerAgents.push({
      mx:M.x,mz:M.z,rMin:M.R*.82,rMax:M.R+rf(6.5,14.5),
      ang:baseAng,side:rf(-.45,.45),spd:rf(.28,.46),ph:rf(0,TAU),
      sc:rf(.32,.40)   // cat-sized (~0.64-0.74 m body length)
     });
    }
    for(let s=0;s<nS;s++){
     const orbit=(s%2===0);
     soldierAgents.push({
      mx:M.x,mz:M.z,r0:M.R+rf(1.4,6.2),rAmp:orbit?rf(.8,2.4):rf(2.2,5.5),
      ang0:rf(0,TAU),w:(Rnd.next()<.5?1:-1)*rf(.14,.26),ph:rf(0,TAU),orbit:orbit,
      sc:rf(.58,.70)   // wolf-sized (~1.25-1.45 m body + crossed scythe mandibles)
     });
    }
   }

   // 4. Data-driven KHAZ hazard on all fruited/active cathedrals (registered before bake)
   if(hasFruit&&typeof KHAZ!=='undefined'&&KHAZ.make&&KHAZ.PREDATOR&&regFn){
    const hazR=+(M.R+9.5).toFixed(2),hazH=+(mH+3.5).toFixed(2);
    const haz=KHAZ.make(KHAZ.PREDATOR.lair(hazR,{
     fauna:['mound-termite'],
     count:isActive?(nW+nS):12,
     note:'wolf-sized mandibulate and nasute glue-soldiers attack straying cattle, strip crops for hive-comb gardens, and swarm desperate or dry-season passers-by',
     danger:isActive?.82:.72,
     falloff:'linear',
     shape:{type:'cyl',r:hazR,h:hazH,y0:-1},
     effects:[{effect:'bleed',dose:1.25,danger:.80},{effect:'corrode',dose:.85,danger:.82}],
     nav:{travel:9,enter:24,avoid:true},
     tell:{colour:'#c84a20',fx:'dust',sound:'click',
      sign:'Giant termite cathedral: stripped grass trails, bleached cattle bones, and clicking wolf-sized soldiers at the flue mouths'}
    }));
    regFn({
     name:'Giant termite cathedral mound',
     key:'termite-mound',
     x:M.x,y:M.y0-1,z:M.z,r:hazR,h:hazH,
     tags:{biome:biomeName,koppen:'Aw',role:'termite-hive',
      harvest:{wood:0,edible:['hive-comb','mound-cap'],medicinal:true},
      hazard:haz}
    });
    st.hazards++;
   }
  }
  BIO.lodRange=prevRange;

  // Build dynamic InstancedMeshes for workers & soldiers (2 draw calls total across the entire stage!)
  const LODR=1650;
  const nearEye=(x,z)=>{const e=BIO.eye&&BIO.eye();return !e||Math.hypot(x-e[0],z-e[2])<LODR;};
  let firstPose=true;

  if(workerAgents.length&&BIO.dynamic&&BIO.phaseAnimMat){
   const nW=workerAgents.length,wGeo=termiteGeo(false),wPh=new Float32Array(nW);
   for(let i=0;i<nW;i++)wPh[i]=7.5+(i%5)*.7;
   const wIm=BIO.dynamic('fauna:termite-worker',wGeo,BIO.phaseAnimMat('grazer'),nW,{
    cls:'life',kind:'mound-termite',
    label:'Cathedral mound-termite worker (cat-sized)',
    tags:{biome:biomeName,koppen:'Aw',variant:'worker'},
    motion:{period:()=>48,hz:5}
   });
   wIm.geometry.setAttribute('aPh',new T3.InstancedBufferAttribute(wPh,1));
   const M4=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),Sc=new T3.Vector3(),UP=new T3.Vector3(0,1,0);
   const updW=t=>{
    for(let i=0;i<nW;i++){
     const a=workerAgents[i];if(!firstPose&&!nearEye(a.mx,a.mz))continue;
     // Outbound & inbound foraging march along radial grass-stripping trail (triangle wave u in 0..1)
     const cyc=(t*a.spd/(a.rMax-a.rMin)+a.ph/TAU)%2,outward=cyc<1,u=outward?cyc:2-cyc;
     const r=mix(a.rMin,a.rMax,u),ca=Math.cos(a.ang),sa=Math.sin(a.ang);
     const x=a.mx+ca*r-sa*a.side,z=a.mz+sa*r+ca*a.side,y=Y(x,z);
     // Model's head is at -z: yaw = atan2(-dx, -dz)
     const dir=outward?1:-1,hd=Math.atan2(-ca*dir,-sa*dir)+Math.sin(t*2.8+a.ph)*.08;
     P.set(x,y+.02,z);Q.setFromAxisAngle(UP,hd);Sc.set(a.sc,a.sc,a.sc*1.12);
     M4.compose(P,Q,Sc);wIm.setMatrixAt(i,M4);
    }
    wIm.instanceMatrix.needsUpdate=true;
   };
   updW(BIO.WIND?BIO.WIND.t.value:0);
   BIO.host.ticks(()=>updW(BIO.WIND?BIO.WIND.t.value:0));
   st.workers=nW;
  }

  if(soldierAgents.length&&BIO.dynamic&&BIO.phaseAnimMat){
   const nS=soldierAgents.length,sGeo=termiteGeo(true),sPh=new Float32Array(nS);
   for(let i=0;i<nS;i++)sPh[i]=5.2+(i%4)*.6;
   const sIm=BIO.dynamic('fauna:termite-soldier',sGeo,BIO.phaseAnimMat('grazer'),nS,{
    cls:'life',kind:'mound-termite',
    label:'Cathedral mound-termite soldier (wolf-sized)',
    tags:{biome:biomeName,koppen:'Aw',variant:'soldier'},
    motion:{period:()=>48,hz:5}
   });
   sIm.geometry.setAttribute('aPh',new T3.InstancedBufferAttribute(sPh,1));
   const M4=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),Sc=new T3.Vector3(),UP=new T3.Vector3(0,1,0);
   const updS=t=>{
    // Dry-season scarcity widens soldier patrol arcs outward into grazing land
    const dryK=(BIO.SEASON&&BIO.SEASON.uDry)?BIO.SEASON.uDry.value:0;
    for(let i=0;i<nS;i++){
     const a=soldierAgents[i];if(!firstPose&&!nearEye(a.mx,a.mz))continue;
     const th=a.ang0+a.w*t,r=a.r0+dryK*3.5+Math.sin(t*.7+a.ph)*a.rAmp;
     const x=a.mx+Math.cos(th)*r,z=a.mz+Math.sin(th)*r,y=Y(x,z);
     const tx=-Math.sin(th)*a.w,tz=Math.cos(th)*a.w,hd=Math.atan2(-tx,-tz)+Math.sin(t*3.4+a.ph)*.14;
     P.set(x,y+.03,z);Q.setFromAxisAngle(UP,hd);Sc.set(a.sc,a.sc,a.sc*1.16);
     M4.compose(P,Q,Sc);sIm.setMatrixAt(i,M4);
    }
    sIm.instanceMatrix.needsUpdate=true;
   };
   updS(BIO.WIND?BIO.WIND.t.value:0);
   BIO.host.ticks(()=>updS(BIO.WIND?BIO.WIND.t.value:0));
   st.soldiers=nS;
  }

  firstPose=false;
  SWBAY.TERMITES=st;
  return st;
 };
})();
