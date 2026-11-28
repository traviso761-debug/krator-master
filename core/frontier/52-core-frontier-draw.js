// ================================================================= CORE — frontier: Erythrophyll shader, Carnelian clades & rogue machines [draw]
// Shared visual & geometry helpers for the SW->NE Carnelian Ecological Frontier (docs/CARNELIAN-FRONTIER-PLAN.md):
//   - KFRONTIER.erythrophyllHook(mat, opt): subsurface carnelian agate back-translucency (605-710 nm, zero chlorophyll green;
//     safe on both MeshStandardMaterial and MeshLambertMaterial in Three.js r128 without reading fragment `normal` or `cameraPosition`)
//   - KFRONTIER.defCladeItems(BIO, M, prefix): registers shared BIO instanced items for Carnelian silica-chitin clades & white skeletons
//   - KFRONTIER.growOrganPipe / growErythraVeil / growBladderTether / putAgateWindow / putBloodStrangler
//   - KFRONTIER.placeMachine(ctx, spec): registers rogue ecoforming machines in core/tags BEFORE drawing, reserves KSPACE,
//     binds KHAZ, and builds Ancient titanium-ceramic & bronze 3D geometry using the build's packed library materials.
(function(root){
  'use strict';
  var KF=root.KFRONTIER,R=root.KRAND,KH=root.KHOOK;
  if(!KF||!R)throw new Error('core/frontier 52-core-frontier-draw.js: load 08-core-rand.js and 18-core-frontier.js first');
  if(KF.erythrophyllHook)return;

  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function glf(x){var n=Number(x);if(!isFinite(n))n=0;var s=n.toFixed(4);return s;}
  function H(seed,a,b,salt){return R.unit(R.hash(seed>>>0,a|0,b|0,salt|0));}

  /* Subsurface carnelian back-translucency shader hook (safe for Standard & Lambert in r128) */
  KF.erythrophyllHook=function(mat,opt){
    if(!mat||mat._kfErythro)return mat;
    opt=opt||{};
    var strength=opt.strength==null?0.36:opt.strength;
    var cr=opt.r==null?0.92:opt.r;
    var cg=opt.g==null?0.21:opt.g;
    var cb=opt.b==null?0.11:opt.b;
    var vertPars='varying float vKfGrazing;\n';
    var vertBody='vec3 kfVN = normalize(transformedNormal);\n'
      +'vec3 kfVD = normalize(-mvPosition.xyz);\n'
      +'vKfGrazing = clamp(1.0 - abs(dot(kfVN, kfVD)), 0.0, 1.0);\n';
    var fragPars='varying float vKfGrazing;\n';
    var fragBody='float kfRim = pow(vKfGrazing, 1.65) * '+glf(strength)+';\n'
      +'vec3 kfGlow = vec3('+glf(cr)+', '+glf(cg)+', '+glf(cb)+') * kfRim;\n'
      +'outgoingLight += kfGlow * (0.35 + 0.65 * diffuseColor.r);\n';

    if(KH&&typeof KH.wrap==='function'){
      KH.wrap(mat,'kf-erythro|'+(opt.key||'std'),function(sh){
        sh.vertexShader=sh.vertexShader
          .replace('#include <common>','#include <common>\n'+vertPars)
          .replace('#include <project_vertex>','#include <project_vertex>\n'+vertBody);
        sh.fragmentShader=sh.fragmentShader
          .replace('#include <common>','#include <common>\n'+fragPars)
          .replace('#include <opaque_fragment>',fragBody+'\n#include <opaque_fragment>');
      });
    }else{
      var prev=mat.onBeforeCompile;
      mat.onBeforeCompile=function(sh,rend){
        if(prev)prev(sh,rend);
        sh.vertexShader=sh.vertexShader
          .replace('#include <common>','#include <common>\n'+vertPars)
          .replace('#include <project_vertex>','#include <project_vertex>\n'+vertBody);
        sh.fragmentShader=sh.fragmentShader
          .replace('#include <common>','#include <common>\n'+fragPars)
          .replace('#include <opaque_fragment>',fragBody+'\n#include <opaque_fragment>');
      };
    }
    mat._kfErythro=true;
    return mat;
  };

  /* Register reusable instanced BIO items for Carnelian chitin-silica clades & Bleach-Scar skeletons */
  KF.defCladeItems=function(BIO,mats,prefix){
    var p=prefix==null?'kf':prefix;
    var mChitin=mats.chitin||mats.strangler||mats.rock;
    var mRuby=mats.ruby||mats.chitin||mats.strangler;
    var mLens=mats.chalcedony||mats.bleach||mats.tufa||mats.rock;
    var mBone=mats.bleach||mats.tufa||mats.chalcedony||mats.rock;
    if(mChitin)KF.erythrophyllHook(mChitin,{key:p+'-chitin',strength:0.34});
    if(mRuby&&mRuby!==mChitin)KF.erythrophyllHook(mRuby,{key:p+'-ruby',strength:0.48,r:0.96,g:0.24,b:0.12});

    BIO.def(p+'_flute_collar',BIO.fung.cap({form:'funnel',h:0.42,seg:9,rings:3,lump:0.10,wav:7,wavA:0.06,under:'smooth',uv:'planar',seed:88101}),mRuby,{label:'Carnelian organ-pipe flared silica osculum'});
    BIO.def(p+'_veil_lobe',BIO.fung.cap({form:'shelf',h:0.26,seg:10,rings:4,lump:0.14,wav:8,wavA:0.09,under:'gills',uv:'planar',seed:88102}),mRuby,{label:'Pleated Erythrophyll solar lattice fan'});
    BIO.def(p+'_ruby_bladder',BIO.fung.pod({tip:0.46,h:1.18,seg:10,rings:5,seed:88103}),mRuby,{label:'Buoyant 0.75 g translucent ruby gas-bladder'});
    BIO.def(p+'_agate_rosette',BIO.fung.crust({lobes:8,lobeA:0.22,seg:12,rings:4,seed:88104}),mChitin,{label:'Armoured crimson Erythrophyll cushion dome'});
    BIO.def(p+'_agate_lens',BIO.fung.cap({form:'dome',h:0.32,seg:9,rings:3,lump:0.06,wav:6,wavA:0.02,under:'smooth',uv:'planar',seed:88105}),mLens,{label:'Biogenic chalcedony skylight window'});
    BIO.def(p+'_strangler_rib',BIO.fung.stalk({r0:0.16,r1:0.07,bend:0.34,ribs:6,ribA:0.16,seg:7,rings:5}),mChitin,{label:'Reactive arterial-red chitin-web cable'});
    BIO.def(p+'_bleach_skel',BIO.fung.stalk({r0:0.20,r1:0.11,bend:0.06,ribs:8,ribA:0.22,seg:8,rings:5}),mBone,{label:'Petrified white chitin-silica organ-pipe skeleton'});
    return p;
  };

  /* 1. Sanguine Flute-Colony (carnelian-organpipe, 3-11 m clustered fluted silica-chitin chimneys) */
  KF.growOrganPipe=function(BIO,cfg,x,y,z,seed,scale,opt){
    opt=opt||{};
    var T3=BIO.host.THREE,qEuler=BIO.fn.qEuler,TAU=BIO.fn.TAU;
    var sc=scale==null?1:scale;
    var pet=!!opt.petrified;
    var nPipes=3+Math.floor(H(seed,1,0,0x511)*5);
    var bucket=pet?(cfg.skelBucket||cfg.bucket):cfg.bucket;
    var collarItem=(cfg.prefix||'kf')+'_flute_collar';
    var skelItem=(cfg.prefix||'kf')+'_bleach_skel';
    var pal=pet?[0xe8e4dc,0xded8ce,0xf0ece4]:(cfg.pal||KF.ERYTHRO_SWATCH);
    var tris=0,maxH=3.0;
    var ownPrev=BIO.owner;
    BIO.owner=[x,z];
    try{
      for(var i=0;i<nPipes;i++){
        var az=(i/nPipes)*TAU+0.42*H(seed,10+i,1,0x512);
        var dist=i===0?0:(0.32+0.75*H(seed,10+i,2,0x512))*sc;
        var px=x+Math.cos(az)*dist,pz=z+Math.sin(az)*dist;
        var py=BIO.host.terrainH?BIO.host.terrainH(px,pz):y;
        var hPipe=lerp(3.0,9.6,H(seed,20+i,3,0x512))*sc*(i===0?1.15:0.78+0.32*H(seed,20+i,4,0x512));
        if(pet)hPipe*=0.58;
        if(hPipe>maxH)maxH=hPipe;
        var r0=Math.max(0.11,hPipe*0.052*(0.85+0.3*H(seed,30+i,5,0x512)));
        var colHex=pal[Math.floor(H(seed,40+i,6,0x512)*pal.length)%pal.length];
        if(pet&&opt.useInstSkel){
          BIO.put(skelItem,[px,py-0.28,pz],qEuler(0.08*(H(seed,i,1,0x513)-0.5),az,0),[r0*4.2,hPipe,r0*4.2],new T3.Color(colHex));
          continue;
        }
        var pts=[],nSeg=4;
        var lean=0.06*(H(seed,50+i,7,0x513)-0.5);
        for(var s=0;s<=nSeg;s++){
          var t=s/nSeg;
          var flare=t<0.2?(1+0.45*(1-t/0.2)):(t>0.88?(1+0.28*(t-0.88)/0.12):1.0);
          pts.push({
            x:px+Math.cos(az)*lean*hPipe*t*t,
            y:py-0.48+(hPipe+0.48)*t,
            z:pz+Math.sin(az)*lean*hPipe*t*t,
            r:Math.max(0.06,r0*(1-0.28*t)*flare)
          });
        }
        tris+=BIO.tube(bucket,pts,colHex,{
          seg:6,
          rfn:function(q,ang){return 1+0.18*Math.cos(ang*6);}
        });
        if(!pet&&!opt.impostor){
          var top=pts[pts.length-1];
          var cCol=new T3.Color(KF.PALETTE.carnelian);
          BIO.put(collarItem,[top.x,top.y-0.06,top.z],qEuler(0,az,0),[top.r*3.1,top.r*2.2,top.r*3.1],cCol);
        }
      }
    }finally{
      BIO.owner=ownPrev;
    }
    return{tris:tris,H:maxH};
  };

  /* 2. Pleated Carnelian Lattice-Fan (erythra-veil, 1.5-4.5 m perforated scarlet solar sail) */
  KF.growErythraVeil=function(BIO,cfg,x,y,z,seed,scale){
    var T3=BIO.host.THREE,qEuler=BIO.fn.qEuler;
    var sc=scale==null?1:scale;
    var hFan=lerp(1.6,4.2,H(seed,1,0,0x521))*sc;
    var az=(cfg.sunAzimuthRad==null?0.65:cfg.sunAzimuthRad)+0.35*(H(seed,2,0,0x521)-0.5);
    var lobeItem=(cfg.prefix||'kf')+'_veil_lobe';
    var tris=0;
    var ownPrev=BIO.owner;
    BIO.owner=[x,z];
    try{
      var nRibs=3;
      for(var r=0;r<nRibs;r++){
        var sp=(r-1)*0.52;
        varang: ;
        var a=az+sp;
        var reach=hFan*(0.55+0.2*H(seed,10+r,1,0x522));
        var pts=[
          {x:x,y:y-0.35,z:z,r:0.10*sc},
          {x:x+Math.cos(a)*reach*0.45,y:y+hFan*0.52,z:z+Math.sin(a)*reach*0.45,r:0.065*sc},
          {x:x+Math.cos(a)*reach*0.85,y:y+hFan,z:z+Math.sin(a)*reach*0.85,r:0.035*sc}
        ];
        tris+=BIO.tube(cfg.bucket,pts,KF.PALETTE.chitinDark,{seg:4});
        var cHex=r===1?KF.PALETTE.vermilion:KF.PALETTE.carnelian;
        BIO.put(lobeItem,[pts[1].x,pts[1].y,pts[1].z],qEuler(0.42,a,0),[hFan*0.62,hFan*0.48,hFan*0.62],new T3.Color(cHex));
        BIO.put(lobeItem,[pts[2].x,pts[2].y-0.12,pts[2].z],qEuler(0.32,a+0.2,0),[hFan*0.48,hFan*0.38,hFan*0.48],new T3.Color(KF.PALETTE.crimson));
      }
    }finally{
      BIO.owner=ownPrev;
    }
    return{tris:tris,H:hFan};
  };

  /* 3. Pneumatophore Ruby Tether-Vine (bladder-kelp-land, 2-8.5 m buoyant 0.75 g gas-spheres) */
  KF.growBladderTether=function(BIO,cfg,x,y,z,seed,scale){
    var T3=BIO.host.THREE,qEuler=BIO.fn.qEuler,TAU=BIO.fn.TAU;
    var sc=scale==null?1:scale;
    var bladderItem=(cfg.prefix||'kf')+'_ruby_bladder';
    var nT=2+Math.floor(H(seed,1,0,0x531)*3);
    var tris=0,maxH=2.5;
    var ownPrev=BIO.owner;
    BIO.owner=[x,z];
    try{
      for(var i=0;i<nT;i++){
        var az=(i/nT)*TAU+0.6*H(seed,5+i,1,0x532);
        var hT=lerp(2.4,7.6,H(seed,15+i,2,0x532))*sc;
        if(hT>maxH)maxH=hT;
        var drift=(0.35+0.55*H(seed,25+i,3,0x532))*sc;
        var tx=x+Math.cos(az)*drift,tz=z+Math.sin(az)*drift;
        var pts=[
          {x:x,y:y-0.35,z:z,r:0.07*sc},
          {x:lerp(x,tx,0.45),y:y+hT*0.48,z:lerp(z,tz,0.45),r:0.045*sc},
          {x:tx,y:y+hT,z:tz,r:0.035*sc}
        ];
        tris+=BIO.tube(cfg.bucket,pts,KF.PALETTE.chitinDark,{seg:4});
        var bRad=(0.38+0.34*H(seed,35+i,4,0x532))*sc;
        var bCol=new T3.Color(i%2===0?KF.PALETTE.rubyCore:KF.PALETTE.carnelian);
        BIO.put(bladderItem,[tx,y+hT-bRad*0.25,tz],qEuler(0.06,az,0),[bRad,bRad*1.25,bRad],bCol);
      }
    }finally{
      BIO.owner=ownPrev;
    }
    return{tris:tris,H:maxH};
  };

  /* 4. Chalcedony Window-Dome (agate-window, 0.2-1.1 m armoured crimson rosette with quartz skylight) */
  KF.putAgateWindow=function(BIO,prefix,x,y,z,seed,scale,petrified){
    var T3=BIO.host.THREE,qEuler=BIO.fn.qEuler,TAU=BIO.fn.TAU;
    var p=prefix==null?'kf':prefix;
    var sc=(scale==null?1:scale)*(0.45+0.65*H(seed,1,0,0x541));
    var az=H(seed,2,0,0x541)*TAU;
    var baseCol=new T3.Color(petrified?KF.PALETTE.bleachBone:(H(seed,3,0,0x541)<0.5?KF.PALETTE.crimson:KF.PALETTE.venousPlum));
    BIO.put(p+'_agate_rosette',[x,y-0.06,z],qEuler(0,az,0),[sc*1.15,sc*0.58,sc*1.15],baseCol);
    if(!petrified){
      BIO.put(p+'_agate_lens',[x,y+sc*0.16,z],qEuler(0,az+0.5,0),[sc*0.64,sc*0.42,sc*0.64],new T3.Color(KF.PALETTE.chalcedony));
    }
  };

  /* 5. Reactive Chitin-Web (blood-strangler, arterial-red calcifying root-mat along scar seams) */
  KF.putBloodStrangler=function(BIO,prefix,x,y,z,seed,scale){
    var T3=BIO.host.THREE,qEuler=BIO.fn.qEuler,TAU=BIO.fn.TAU;
    var p=prefix==null?'kf':prefix;
    var sc=scale==null?1:scale;
    for(var k=0;k<3;k++){
      var az=(k/3)*TAU+0.5*H(seed,k,1,0x551);
      var hS=(0.9+1.6*H(seed,k,2,0x551))*sc;
      BIO.put(p+'_strangler_rib',[x+Math.cos(az)*0.35*sc,y-0.18,z+Math.sin(az)*0.35*sc],qEuler(0.32,az,0.18),[0.75*sc,hS,0.75*sc],new T3.Color(KF.PALETTE.arterialRed));
    }
  };

  /* Build & register an Autonomous Rogue Ecoforming Machine (registered in core/tags BEFORE drawing)
   *   ctx: {THREE, scene, tagPage, tagReg, register, space, haz, hazards, groundH, mats:{hull, bronze, ceramic, glow}}
   *   spec: {id, kind, x, z, rotY, state:'active'|'inert', oasisRadiusM, hour}
   */
  KF.placeMachine=function(ctx,spec){
    var T3=ctx.THREE;
    var kind=spec.kind||'ecof_mist_pylon';
    var MDEF=KF.MACHINES[kind]||KF.MACHINES.ecof_mist_pylon;
    var x=spec.x==null?0:spec.x,z=spec.z==null?0:spec.z;
    var y=spec.y==null?(ctx.groundH?ctx.groundH(x,z):0):spec.y;
    var state=spec.state==null?'active':spec.state;
    var rotY=spec.rotY==null?0:spec.rotY;
    var id=spec.id||(kind+'_'+Math.round(x)+'_'+Math.round(z));
    var hM=MDEF.heightM,rM=MDEF.footprintR;
    var fullName=MDEF.name+(state==='inert'?' (Inert)':' (Active)');
    var jobNow=KF.schedule24(kind,spec.hour==null?12:spec.hour);

    /* 1. Register in core/tags BEFORE drawing */
    if(ctx.tagPage&&typeof ctx.tagPage.add==='function'){
      ctx.tagPage.add({
        id:id,
        name:fullName,
        class:'infrastructure',
        at:[x,y,z],
        r:rM,
        h:hM,
        tags:{
          culture:'ancient',
          state:state==='inert'?'ruined':'intact',
          role:'ecoformer:'+kind,
          faction:MDEF.faction,
          subfaction:MDEF.subfaction,
          ecoformer:kind,
          ecoformerJob:jobNow
        }
      });
    }
    if(typeof ctx.register==='function'){
      ctx.register({
        tagId:id+':vol',
        tagClass:'infrastructure',
        name:fullName,
        x:x,y:y-1.0,z:z,r:rM+1.2,h:hM+1.5,
        tags:{culture:'ancient',ecoformer:kind,state:state==='inert'?'ruined':'intact'}
      });
    }
    if(ctx.tagReg&&typeof ctx.tagReg.register==='function'){
      ctx.tagReg.register({
        id:id,
        name:fullName,
        class:'infrastructure',
        category:'machine',
        culture:'ancient',
        faction:MDEF.faction,
        subfaction:MDEF.subfaction,
        job:jobNow,
        schedule:MDEF.schedule,
        state:state,
        tags:['ancient','ecoformer',kind,state],
        box:[x-rM,y-1.5,z-rM,x+rM,y+hM,z+rM],
        pos:[x,y,z]
      });
    }
    if(ctx.space){
      if(typeof ctx.space.insert==='function'){
        ctx.space.insert({id:id,kind:kind,x:x,z:z,r:rM+1.5},x,z,rM+1.5);
      }else if(typeof ctx.space.add==='function'){
        ctx.space.add(x,z,rM+1.5,{id:id,kind:kind});
      }
    }
    if(state!=='inert'){
      var hz=KF.hazardSpec(kind,{id:id+':haz',x:x,z:z,state:state});
      if(hz&&hz.active){
        if(ctx.haz&&typeof ctx.haz.add==='function'){
          ctx.haz.add({id:hz.id,kind:hz.kind,shape:'disc',x:x,z:z,r:hz.radiusM,level:hz.severity,note:MDEF.name});
        }
        if(ctx.tagPage&&typeof ctx.tagPage.add==='function'&&root.KHAZ&&typeof root.KHAZ.make==='function'){
          var hRec={
            id:hz.id,
            name:MDEF.name+' Hazard Envelope',
            class:'feature',
            at:[x,y,z],
            r:hz.radiusM,
            h:hM,
            tags:{ecoformer:kind,hazard:root.KHAZ.make({
              kind:hz.kind,
              effect:hz.kind==='heat'?'burn':hz.kind==='crush'?'bleed':'poison',
              danger:hz.severity,
              dose:0.35,
              falloff:'smooth',
              tell:{colour:'#d8e2bc',fx:hz.kind==='heat'?'shimmer':'dust',sound:'hum',sign:MDEF.name}
            })}
          };
          ctx.tagPage.add(hRec);
          if(Array.isArray(ctx.hazards))ctx.hazards.push(hRec);
        }
      }
    }

    /* 2. Build PBR 3D mesh group using the build's packed library materials (0 untextured lit meshes) */
    var mats=ctx.mats||{};
    var mHull=mats.hull||mats.stone||mats.rock;
    var mBronze=mats.bronze||mats.hull||mHull;
    var mCeramic=mats.ceramic||mats.bleach||mHull;
    var g=new T3.Group();
    g.name=id;
    g.userData.host=true;
    g.position.set(x,y,z);
    g.rotation.y=rotY;

    function addPart(geo,mat,px,py,pz,rx,ry,rz){
      var mesh=new T3.Mesh(geo,mat);
      mesh.position.set(px,py,pz);
      if(rx||ry||rz)mesh.rotation.set(rx||0,ry||0,rz||0);
      mesh.castShadow=true;
      mesh.receiveShadow=true;
      mesh.userData={tagId:id,class:'infrastructure',name:fullName,inspectLabel:fullName,host:true};
      g.add(mesh);
      return mesh;
    }

    if(kind==='ecof_mist_pylon'){
      /* Hexagonal sunken anchor plinth + 18 m tapered tri-fluted ceramic-titanium needle + 3 diffuser collars + solar vanes */
      addPart(new T3.CylinderGeometry(3.4,4.1,2.2,6),mHull,0,0.3,0,0,0,0);
      addPart(new T3.CylinderGeometry(0.42,1.55,17.2,6),mCeramic,0,9.4,0,0,0,0);
      for(var c=0;c<3;c++){
        var cy=6.2+c*4.4,cr=1.85-c*0.28;
        addPart(new T3.TorusGeometry(cr,0.22,8,16),mBronze,0,cy,0,Math.PI*0.5,0,0);
      }
      for(var f=0;f<3;f++){
        var fa=(f/3)*Math.PI*2;
        addPart(new T3.BoxGeometry(0.18,5.6,1.65),mBronze,Math.cos(fa)*1.45,5.8,Math.sin(fa)*1.45,0.18,-fa,0);
      }
      addPart(new T3.OctahedronGeometry(0.75,1),state==='inert'?mHull:mBronze,0,18.2,0,0,0,0);
    }else if(kind==='ecof_soil_auger'){
      /* Stalled 3-legged tripod gantry + central helical lime-phosphate auger stem + cylindrical slurry hopper + 3 dosing booms */
      addPart(new T3.CylinderGeometry(2.6,3.1,1.6,8),mCeramic,0,-0.2,0,0,0,0);
      for(var lg=0;lg<3;lg++){
        var la=(lg/3)*Math.PI*2;
        addPart(new T3.CylinderGeometry(0.24,0.38,11.2,6),mHull,Math.cos(la)*2.65,4.6,Math.sin(la)*2.65,Math.sin(la)*0.24,0,-Math.cos(la)*0.24);
        /* Radial slurry-dosing boom arm */
        addPart(new T3.CylinderGeometry(0.11,0.15,7.4,6),mBronze,Math.cos(la+0.4)*4.2,2.8,Math.sin(la+0.4)*4.2,0,-(la+0.4),Math.PI*0.47);
      }
      /* Central Lime-Phosphate Hopper Drum & Helical Auger Shaft */
      addPart(new T3.CylinderGeometry(1.65,1.45,3.8,10),mCeramic,0,7.2,0,0,0,0);
      addPart(new T3.CylinderGeometry(0.42,0.34,9.8,8),mBronze,0,3.6,0,0,0,0);
      for(var fl=0;fl<6;fl++){
        addPart(new T3.TorusGeometry(0.78,0.14,6,12),mHull,0,0.4+fl*0.85,0,Math.PI*0.42,fl*0.8,0);
      }
    }else if(kind==='ecof_swath_burner'){
      /* 6-legged autonomous perimeter crawler chassis + optical 650 nm sensor turret + twin arc-lances */
      addPart(new T3.CylinderGeometry(2.2,2.6,1.8,8),mHull,0,2.6,0,0,0,0);
      addPart(new T3.SphereGeometry(1.15,10,8),mCeramic,0,3.9,0.4,0,0,0);
      addPart(new T3.CylinderGeometry(0.16,0.24,3.8,6),mBronze,0.85,3.4,2.1,Math.PI*0.45,0,0);
      addPart(new T3.CylinderGeometry(0.16,0.24,3.8,6),mBronze,-0.85,3.4,2.1,Math.PI*0.45,0,0);
      for(var k=0;k<6;k++){
        var ka=(k/6)*Math.PI*2+0.3;
        addPart(new T3.CylinderGeometry(0.18,0.26,3.8,6),mHull,Math.cos(ka)*3.1,1.3,Math.sin(ka)*3.1,Math.sin(ka)*0.36,0,-Math.cos(ka)*0.36);
      }
    }else{
      /* ecof_canister_train: 3 jackknifed cylindrical ceramic defoliant pressure-sleds */
      for(var t=0;t<3;t++){
        var ox=(t-1)*4.6,oz=(t===1?1.1:-0.4),yaw=(t-1)*0.28;
        addPart(new T3.CylinderGeometry(1.15,1.15,4.2,10),mCeramic,ox,1.05,oz,0,yaw,Math.PI*0.5);
        addPart(new T3.BoxGeometry(4.4,0.45,2.2),mHull,ox,0.15,oz,0,yaw,0);
      }
    }

    if(ctx.scene)ctx.scene.add(g);
    return g;
  };
})(typeof window!=='undefined'?window:globalThis);
