// ================================================================= CORE — frontier: Carnelian biosphere & rogue ecoforming [G data]
// Engine-neutral physics, substrate crazy-quilt partition law, orbital Bleach-Scar tri-band geometry, and autonomous rogue
// ecoforming machine records/schedules/hazards for the SW->NE Carnelian Ecological Frontier (docs/CARNELIAN-FRONTIER-PLAN.md).
// Strictly [G data]: no THREE, no DOM, no Math.random, no Math.sin/cos hashes, no numeric || defaults. Needs KRAND loaded first.
(function(root){
  'use strict';
  var R=root.KRAND;
  if(!R||!R.hash)throw new Error('core/frontier 18-core-frontier.js: load core/rand/08-core-rand.js first (KRAND)');
  if(root.KFRONTIER)return;

  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sstep(a,b,x){
    if(a===b)return x>=b?1:0;
    var t=clamp((x-a)/(b-a),0,1);
    return t*t*(3-2*t);
  }
  function lerp(a,b,t){return a+(b-a)*t;}

  /* Deterministic 2D value noise on KRAND.hash (zero Math.sin) */
  function vnoise2(seed,x,z,scale,salt){
    var sc=scale==null?64:scale;
    var sx=x/sc,sz=z/sc;
    var xi=Math.floor(sx),zi=Math.floor(sz);
    var fx=sx-xi,fz=sz-zi;
    var u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
    var st=salt==null?0x4B46:salt;
    var a=R.unit(R.hash(seed,xi,zi,st));
    var b=R.unit(R.hash(seed,xi+1,zi,st));
    var c=R.unit(R.hash(seed,xi,zi+1,st));
    var d=R.unit(R.hash(seed,xi+1,zi+1,st));
    return lerp(lerp(a,b,u),lerp(c,d,u),v);
  }

  function fbm2(seed,x,z,baseScale){
    var bs=baseScale==null?90:baseScale;
    return 0.58*vnoise2(seed,x,z,bs,0x4B46)+0.29*vnoise2(seed,x,z,bs*0.43,0x4B47)+0.13*vnoise2(seed,x,z,bs*0.19,0x4B48);
  }

  /* Erythrophyll (605-710 nm) reflectance palette: strictly zero 520-560 nm chlorophyll green */
  var PALETTE={
    carnelian:0xd94826,
    vermilion:0xe2361e,
    crimson:0xa81822,
    arterialRed:0xb82028,
    venousPlum:0x5c162a,
    rubyCore:0xc81d32,
    chalcedony:0xdfd8dc,
    silicaIvory:0xeae2d6,
    chitinDark:0x2c1418,
    bleachBone:0xedeae2,
    mistChartreuse:0xd4dfb8
  };

  var ERYTHRO_SWATCH=[0xd94826,0xe2361e,0xa81822,0xb82028,0xc81d32,0x74182e,0x5c162a];

  function isErythrophyllHex(hex){
    var r=(hex>>16)&255,g=(hex>>8)&255,b=hex&255;
    return r>=72&&r>=g*1.45&&g<=110&&r>=b*1.25;
  }

  var CLADES={
    'carnelian-organpipe':{
      key:'carnelian-organpipe',
      name:'Sanguine Flute-Colony',
      biosphere:'carnelian',
      heightM:[3.0,11.0],
      pigmentNm:[610,705],
      skeleton:'silica-chitin',
      note:'Clustered vertical crimson-and-ivory fluted silica-chitin chimneys exhaling warm spore plumes on ultramafic & porphyry rock.'
    },
    'erythra-veil':{
      key:'erythra-veil',
      name:'Pleated Carnelian Lattice-Fan',
      biosphere:'carnelian',
      heightM:[1.5,4.5],
      pigmentNm:[605,690],
      skeleton:'fenestrated-chitin',
      note:'Perforated scarlet sea-fan solar sail oriented normal to prevailing sun-tracks under blue-rich Rayleigh sky scatter.'
    },
    'bladder-kelp-land':{
      key:'bladder-kelp-land',
      name:'Pneumatophore Ruby Tether-Vine',
      biosphere:'carnelian',
      heightM:[2.0,9.0],
      pigmentNm:[620,710],
      skeleton:'pneumatic-tendon',
      note:'Buoyant translucent ruby H2/CH4-filled spheres (0.75 g) tethered on sinewy rust-black chitinous tendons.'
    },
    'agate-window':{
      key:'agate-window',
      name:'Chalcedony Window-Dome',
      biosphere:'carnelian',
      heightM:[0.2,1.1],
      pigmentNm:[615,700],
      skeleton:'chalcedony-rosette',
      note:'Hemispherical armoured crimson rosette with clear biogenic quartz skylight windows over subterranean Erythrophyll chambers.'
    },
    'blood-strangler':{
      key:'blood-strangler',
      name:'Reactive Chitin-Web',
      biosphere:'carnelian',
      heightM:[0.4,5.5],
      pigmentNm:[625,705],
      skeleton:'calcifying-mycelium',
      note:'Arterial-red chitinous cable-mat calcifying around invading Earth roots along Bleach-Scar and Kill-Line seams.'
    }
  };

  var MACHINES={
    ecof_mist_pylon:{
      key:'ecof_mist_pylon',
      name:'Ancient Atmospheric Defoliant Mist-Pylon',
      faction:'Ancients',
      subfaction:'Rogue Ecoforming Corps',
      heightM:18.0,
      footprintR:4.2,
      hazardKind:'gas',
      hazardRadiusM:28.0,
      schedule:[
        {from:0,to:5,act:'STANDBY_CONDENSE'},
        {from:5,to:9,act:'PULSE_DEFOLIANT_MIST'},
        {from:9,to:18,act:'SOLAR_RECHARGE'},
        {from:18,to:24,act:'STANDBY_CONDENSE'}
      ]
    },
    ecof_soil_auger:{
      key:'ecof_soil_auger',
      name:'Ancient Lime-Phosphate Soil-Auger Rig',
      faction:'Ancients',
      subfaction:'Rogue Ecoforming Corps',
      heightM:11.5,
      footprintR:5.4,
      oasisRadiusM:45.0,
      hazardKind:'crush',
      hazardRadiusM:6.0,
      schedule:[
        {from:0,to:12,act:'AUGER_LIME_DOSE'},
        {from:12,to:14,act:'SLURRY_SLUICE'},
        {from:14,to:24,act:'AUGER_LIME_DOSE'}
      ]
    },
    ecof_swath_burner:{
      key:'ecof_swath_burner',
      name:'Autonomous Perimeter Swath-Burner Crawler',
      faction:'Ancients',
      subfaction:'Rogue Ecoforming Corps',
      heightM:5.8,
      footprintR:4.8,
      hazardKind:'heat',
      hazardRadiusM:24.0,
      schedule:[
        {from:0,to:6,act:'DOCK_RECHARGE'},
        {from:6,to:20,act:'PATROL_ERYTHRO_LANCE'},
        {from:20,to:24,act:'DOCK_RECHARGE'}
      ]
    },
    ecof_canister_train:{
      key:'ecof_canister_train',
      name:'Ruptured Defoliant Canister Sled-Train',
      faction:'Ancients',
      subfaction:'Rogue Ecoforming Corps',
      heightM:3.6,
      footprintR:7.5,
      hazardKind:'poison',
      hazardRadiusM:22.0,
      schedule:[
        {from:0,to:24,act:'SEEP_SALT_PLUME'}
      ]
    }
  };

  function schedule24(kind,hour){
    var m=MACHINES[kind];
    if(!m)return 'IDLE';
    var h=((hour==null?12:hour)%24+24)%24;
    for(var i=0;i<m.schedule.length;i++){
      var s=m.schedule[i];
      if(h>=s.from&&h<s.to)return s.act;
    }
    return m.schedule[0].act;
  }

  function hazardSpec(kind,opt){
    var m=MACHINES[kind];
    if(!m)return null;
    opt=opt||{};
    var state=opt.state==null?'active':opt.state;
    if(state==='inert')return{active:false,kind:m.hazardKind,radiusM:0,severity:0};
    var r=opt.radiusM==null?m.hazardRadiusM:opt.radiusM;
    var sev=opt.severity==null?(kind==='ecof_swath_burner'?0.85:0.55):opt.severity;
    return{
      id:opt.id==null?('frontier:'+kind):opt.id,
      active:true,
      kind:m.hazardKind,
      x:opt.x==null?0:opt.x,
      z:opt.z==null?0:opt.z,
      radiusM:r,
      severity:sev
    };
  }

  /* Orbital-azimuth Bleach-Scar tri-band or Kill-Line cross-section:
   *   swath: {x0, z0, dx, dz, halfWidthM, vanguardWidthM, lengthM, mode:'swath'|'kill-line'}
   *   Note: unit tangent (dx, dz) avoids Math.sin/cos in [G data]; normal is (-dz, dx).
   *   For mode === 'kill-line', signedDistM > +halfWidthM is unbroken Carnelian sky-island upslope;
   *   |signedDistM| <= halfWidthM is bone-white Bleach-Hardpan; signedDistM < -halfWidthM is Earth/defoliated downslope.
   */
  function bleachSwathAt(x,z,swath){
    if(!swath)return{band:'outside',signedDistM:1e6,alongM:0,bleach01:0,skeletonProb01:0,strangler01:0,vanguard01:0,upslopeRed01:0};
    var x0=swath.x0==null?0:swath.x0;
    var z0=swath.z0==null?0:swath.z0;
    var dx=swath.dx==null?0.8:swath.dx;
    var dz=swath.dz==null?0.6:swath.dz;
    var dl=Math.sqrt(dx*dx+dz*dz);
    if(dl<1e-6){dx=1;dz=0;dl=1;}
    dx/=dl;dz/=dl;
    var rx=x-x0,rz=z-z0;
    var alongM=rx*dx+rz*dz;
    var signedDistM=-rx*dz+rz*dx;
    var ad=Math.abs(signedDistM);
    var hw=swath.halfWidthM==null?35:swath.halfWidthM;
    var vw=swath.vanguardWidthM==null?22:swath.vanguardWidthM;
    var halfLen=swath.lengthM==null?4000:swath.lengthM*0.5;
    var endMask=1-sstep(halfLen-35,halfLen+15,Math.abs(alongM));
    if(endMask<=0.001){
      return{band:'outside',signedDistM:signedDistM,alongM:alongM,bleach01:0,skeletonProb01:0,strangler01:0,vanguard01:0,upslopeRed01:0};
    }
    var mode=swath.mode==null?'swath':swath.mode;
    var bleach01=(1-sstep(hw*0.72,hw*1.06,ad))*endMask;
    var seam=Math.exp?0:0;
    /* Polynomial bell peaking right at the edge of the bleach hardpan (ad == hw) */
    var edgeT=clamp(1-Math.abs(ad-hw)/Math.max(4,vw*0.85),0,1);
    var edgeBell=edgeT*edgeT*(3-2*edgeT)*endMask;

    if(mode==='kill-line'){
      var upslopeRed=sstep(hw*0.65,hw*1.55,signedDistM)*endMask;
      var downVanguard=sstep(-hw*1.85,-hw*0.65,-signedDistM)*0;
      var downEarth=sstep(hw*0.65,hw*1.75,-signedDistM)*endMask;
      var bandK=bleach01>=0.48?'bleach':(signedDistM>hw*0.65?'carnelian-wall':(ad<=hw+vw?'vanguard':'outside'));
      return{
        band:bandK,
        signedDistM:signedDistM,
        alongM:alongM,
        bleach01:bleach01,
        skeletonProb01:bleach01*0.65,
        strangler01:signedDistM>0?edgeBell:edgeBell*0.35,
        vanguard01:signedDistM<0?edgeBell:downEarth*0.25,
        upslopeRed01:upslopeRed
      };
    }

    var inVan=(ad>hw*0.82&&ad<=hw+vw);
    var band=bleach01>=0.48?'bleach':(inVan?'vanguard':(ad<=hw+vw*1.9?'carnelian-wall':'outside'));
    return{
      band:band,
      signedDistM:signedDistM,
      alongM:alongM,
      bleach01:bleach01,
      skeletonProb01:bleach01*0.62,
      strangler01:ad>hw?edgeBell*0.85:0,
      vanguard01:inVan?edgeBell:0,
      upslopeRed01:0
    };
  }

  /* Circular 45 m lime-phosphate oasis around a stalled ecof_soil_auger rig */
  function augerDiscAt(x,z,rig){
    if(!rig)return{inOasis:false,distM:1e6,limeDose01:0,rigCore01:0,rimStrangler01:0};
    var rx=x-(rig.x==null?0:rig.x),rz=z-(rig.z==null?0:rig.z);
    var d=Math.sqrt(rx*rx+rz*rz);
    var rad=rig.radiusM==null?45:rig.radiusM;
    var coreR=rig.coreR==null?6.5:rig.coreR;
    var lime=1-sstep(rad*0.78,rad*1.06,d);
    var core=1-sstep(coreR*0.65,coreR*1.15,d);
    var rimT=clamp(1-Math.abs(d-rad)/8.5,0,1);
    var rim=rimT*rimT*(3-2*rimT);
    return{
      inOasis:d<=rad,
      distM:d,
      limeDose01:lime,
      rigCore01:core,
      rimStrangler01:rim
    };
  }

  /* Topographic defoliant mist pooling around an ecof_mist_pylon needle (inverts valley vs hilltop!) */
  function mistInversionAt(x,z,elevM,pylon){
    if(!pylon)return{mistPool01:0,defoliatedFloor01:0,hilltopRefuge01:0,toxicRadius01:0,distM:1e6};
    var dx=x-(pylon.x==null?0:pylon.x),dz=z-(pylon.z==null?0:pylon.z);
    var d=Math.sqrt(dx*dx+dz*dz);
    var poolElev=pylon.poolElevM==null?0:pylon.poolElevM;
    var bandM=pylon.bandM==null?18:pylon.bandM;
    var active=(pylon.state==null?'active':pylon.state)!=='inert';
    var reachM=pylon.reachM==null?950:pylon.reachM;
    var reach01=1-sstep(reachM*0.55,reachM,d);
    var low01=1-sstep(poolElev-bandM*0.5,poolElev+bandM,elevM);
    var high01=sstep(poolElev+bandM*0.35,poolElev+bandM*1.65,elevM);
    var hazR=pylon.hazardRadiusM==null?28:pylon.hazardRadiusM;
    var tox=active?(1-sstep(hazR*0.55,hazR,d)):0;
    return{
      mistPool01:active?low01*reach01:low01*reach01*0.25,
      defoliatedFloor01:low01*reach01,
      hilltopRefuge01:high01,
      toxicRadius01:tox,
      distM:d
    };
  }

  /* Master 4-Axis Crazy-Quilt Partition Law:
   *   env: {seed, edaphicToxicity01, xericExposure01, skyExposure01, baselineRed01, swath, auger, mistPylon, elevM}
   */
  function quiltAt(x,z,env){
    env=env||{};
    var seed=env.seed==null?8100:env.seed>>>0;
    var edaph=clamp(env.edaphicToxicity01==null?0:env.edaphicToxicity01,0,1);
    var xeric=clamp(env.xericExposure01==null?0:env.xericExposure01,0,1);
    var skyEx=clamp(env.skyExposure01==null?0:env.skyExposure01,0,1);
    var baseRed=clamp(env.baselineRed01==null?0.25:env.baselineRed01,0,1);

    var sw=bleachSwathAt(x,z,env.swath);
    var ag=augerDiscAt(x,z,env.auger);
    var mp=mistInversionAt(x,z,env.elevM==null?0:env.elevM,env.mistPylon);

    /* Subtle natural boundary crenulation (never random salt-and-pepper noise!) */
    var n=(fbm2(seed,x,z,110)-0.5)*0.18;
    var score=0.52*edaph+0.22*xeric+0.18*skyEx+0.16*(baseRed-0.25)+n;
    score+=0.42*sw.upslopeRed01+0.28*mp.hilltopRefuge01*(edaph>0.2?1:0.5);
    score-=0.85*ag.limeDose01+0.48*mp.defoliatedFloor01;
    if(env.swath&&(env.swath.mode==='kill-line')&&sw.signedDistM<-env.swath.halfWidthM*0.65){
      score-=0.55;
    }

    var bleach01=clamp(Math.max(sw.bleach01,ag.rigCore01*0.65),0,1);
    var red01=clamp(sstep(0.36,0.58,score)*(1-bleach01)*(1-ag.limeDose01),0,1);
    var strangler01=clamp(Math.max(sw.strangler01,ag.rimStrangler01*(score>0.3?0.75:0)),0,1);
    var bio=bleach01>=0.48?'bleach':(red01>=0.5?'carnelian':'earth');

    return{
      biosphere:bio,
      redDominance01:red01,
      bleachScar01:bleach01,
      augerOasis01:ag.limeDose01,
      stranglerEdge01:strangler01,
      skeleton01:sw.skeletonProb01,
      mistPool01:mp.mistPool01
    };
  }

  root.KFRONTIER={
    PALETTE:PALETTE,
    ERYTHRO_SWATCH:ERYTHRO_SWATCH,
    CLADES:CLADES,
    MACHINES:MACHINES,
    isErythrophyllHex:isErythrophyllHex,
    schedule24:schedule24,
    hazardSpec:hazardSpec,
    bleachSwathAt:bleachSwathAt,
    augerDiscAt:augerDiscAt,
    mistInversionAt:mistInversionAt,
    quiltAt:quiltAt,
    vnoise2:vnoise2,
    fbm2:fbm2
  };
})(typeof window!=='undefined'?window:globalThis);
