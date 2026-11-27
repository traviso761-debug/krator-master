// ================================================================= STONEBOW — planned interiors & settlement sockets ([G data])
// Plans out Stonebow's interiors during construction on kits/ancients-interiors floor plates (AI.barPlate, AI.gridPlate,
// AI.hallPlate, AI.ringPlate), in the builder's own local frame (x east across the 900 m gorge, z south upstream, y up).
//
// Seven distinct architectural zones, each opened independently in the cut-away UI ("Interior" select, `[` `]` storeys):
//   crown      Cultural Center & Skylight Crown (y 496..536 m): assembly hall, archive gallery, reception, scholar bars
//   bow        Upper Bow Living-Working Terraces (y 428..476 m): residential/studio bars, terrace greenhouses, commons
//   city       City Center Arch & Concourse (y 392..414 m): civic concourse, market/store halls, transit bridge, quarters
//   tourist    Suspended Tourist Center Bridge (y 174..190 m): panorama lounge, river dining hall, watch/botanist suites
//   pylons     Four Gate Pylons & Bulkheads (y 386..458 m): guardhouses, armouries, brigs, garrison & bulkhead lobbies
//   vaults-w   West Rim Automated Industries (y 342..366 m): synthesis bays & control bars (delving ruin in refurb!)
//   vaults-e   East Rim Factories & Mechanical Roots (y 266..366 m): turbine/engine halls & stores (delving ruin in refurb!)
//
// [G data]: no three.js, no DOM, no Math.random.
const STONEBOW_INT=(function(){
 'use strict';
 const cyc=list=>(i=>list[i%list.length]);
 const line=(ax,az,bx,bz)=>(u=>[ax+(bx-ax)*u,az+(bz-az)*u]);
 const rectPoly=(x0,x1,z0,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];

 const ZONE_NAMES={
  crown:'Cultural Center and Skylight Crown',
  bow:'Living-Working Bow Terraces',
  city:'City Center Arch Concourse',
  tourist:'Suspended Tourist Center',
  pylons:'Four Gate Pylons and Bulkheads',
  'vaults-w':'West Automated Industry Vaults',
  'vaults-e':'East Factory and Mechanical Vaults'
 };

 function makeBuildings(AI,mode){
  // mode: 'intact' | 'ruined' | 'refurb'
  const isFullRuin=mode==='ruined';
  const out=[];

  // ---- 1. CROWN: Cultural Center & Skylight Hall (x -74..+74, z -44..+44, y 496..536) ----
  {
   const s0Hall=AI.hallPlate({
    id:'sb.crown.hall',level:0,y:496,h:8.5,
    poly:rectPoly(-28,28,-20,20),kind:'hall',doorEdge:2,doorW:2.4,furnish:true,recipe:'dining-hall'
   });
   const s0GalW=AI.hallPlate({
    id:'sb.crown.galw',level:0,y:496,h:8.5,
    poly:rectPoly(-68,-32,-16,16),kind:'hall',doorEdge:1,doorW:2.0,furnish:true,recipe:'gallery'
   });
   const s0GalE=AI.hallPlate({
    id:'sb.crown.gale',level:0,y:496,h:8.5,
    poly:rectPoly(32,68,-16,16),kind:'hall',doorEdge:3,doorW:2.0,furnish:true,recipe:'reception'
   });
   const s1N=AI.barPlate({
    id:'sb.crown.s1n',level:1,y:508,h:5.2,
    path:line(-64,-30,64,-30),depth:14,side:'both',cw:2.4,roomW:6.4,
    kinds:cyc(['study','library','bedroom','study']),ends:['core','store']
   });
   const s1S=AI.barPlate({
    id:'sb.crown.s1s',level:1,y:508,h:5.2,
    path:line(-64,30,64,30),depth:14,side:'both',cw:2.4,roomW:6.4,
    kinds:cyc(['library','study','bedroom','study']),ends:['core','store']
   });
   const s2Obs=AI.hallPlate({
    id:'sb.crown.obs',level:2,y:520,h:7.5,
    poly:rectPoly(-26,26,-16,16),kind:'hall',doorEdge:2,doorW:2.2,furnish:true,recipe:'officers-hall'
   });
   out.push({
    id:'sb.crown',area:'crown',delve:false,name:ZONE_NAMES.crown,
    storeys:[s0Hall,s0GalW,s0GalE,s1N,s1S,s2Obs],floors:true,hollow:null,
    inside:(x,z,y)=>x>=-78&&x<=78&&z>=-48&&z<=48&&y>=494&&y<=546
   });
  }

  // ---- 2. BOW: Upper Living-Working Truss Galleries & Terrace Greenhouses (y 428..476) ----
  {
   const storeys=[];
   const bowLevels=[[428,220,74],[444,180,68],[460,136,62],[476,92,56]];
   for(let lv=0;lv<bowLevels.length;lv++){
    const [by,hx,zOff]=bowLevels[lv];
    // North and south residential-studio bars running along the X-truss faces, clear of the central spine light wells
    for(const [stag,zs] of [['n',-zOff],['s',zOff]]){
     storeys.push(AI.barPlate({
      id:'sb.bow.l'+lv+stag+'w',level:lv,y:by,h:4.2,
      path:line(-hx,zs,-24,zs),depth:14.4,side:'both',cw:2.4,roomW:6.0,
      kinds:cyc(['bedroom','bedroom','study','kitchen','dormitory','bedroom']),ends:['core','store']
     }));
     storeys.push(AI.barPlate({
      id:'sb.bow.l'+lv+stag+'e',level:lv,y:by,h:4.2,
      path:line(24,zs,hx,zs),depth:14.4,side:'both',cw:2.4,roomW:6.0,
      kinds:cyc(['bedroom','study','bedroom','kitchen','bedroom','dormitory']),ends:['store','core']
     }));
    }
    // Terrace greenhouses & community commons on alternating levels between the spine wells
    if(lv===0||lv===2){
     const gx=lv===0?96:64;
     storeys.push(AI.hallPlate({
      id:'sb.bow.ghw'+lv,level:lv,y:by,h:4.8,
      poly:rectPoly(-gx-22,-gx+22,-18,18),kind:'hall',doorEdge:0,doorW:2.0,furnish:true,recipe:'greenhouse'
     }));
     storeys.push(AI.hallPlate({
      id:'sb.bow.ghe'+lv,level:lv,y:by,h:4.8,
      poly:rectPoly(gx-22,gx+22,-18,18),kind:'hall',doorEdge:2,doorW:2.0,furnish:true,recipe:lv===0?'crew-mess':'greenhouse'
     }));
    }
   }
   out.push({
    id:'sb.bow',area:'bow',delve:false,name:ZONE_NAMES.bow,
    storeys:storeys,floors:true,hollow:null,
    collapse:isFullRuin?(x,z,y)=>(x>116&&x<242&&y>440):null,
    inside:(x,z,y)=>Math.abs(x)<=236&&Math.abs(z)<=88&&y>=426&&y<=486
   });
  }

  // ---- 3. CITY: City Center Arch Concourse & Markets (x -260..+260, z -78..+78, y 390..414) ----
  {
   const storeys=[];
   // Level 0 (y 390, right over the arch crown): central civic reception + flanking market store halls & chart/transit bridge
   storeys.push(AI.hallPlate({
    id:'sb.city.plaza',level:0,y:390,h:6.5,
    poly:rectPoly(-24,24,-18,18),kind:'hall',doorEdge:2,doorW:2.4,furnish:true,recipe:'reception'
   }));
   storeys.push(AI.hallPlate({
    id:'sb.city.mktw',level:0,y:390,h:6.5,
    poly:rectPoly(-88,-40,-18,18),kind:'store',doorEdge:1,doorW:2.4,furnish:true,recipe:'store-hall'
   }));
   storeys.push(AI.hallPlate({
    id:'sb.city.mkte',level:0,y:390,h:6.5,
    poly:rectPoly(40,88,-18,18),kind:'hall',doorEdge:3,doorW:2.4,furnish:true,recipe:'gallery'
   }));
   storeys.push(AI.hallPlate({
    id:'sb.city.ctrl',level:1,y:400,h:5.5,
    poly:rectPoly(-20,20,24,46),kind:'hall',doorEdge:0,doorW:2.0,furnish:true,recipe:'bridge'
   }));
   storeys.push(AI.hallPlate({
    id:'sb.city.chart',level:1,y:400,h:5.5,
    poly:rectPoly(-20,20,-46,-24),kind:'hall',doorEdge:2,doorW:2.0,furnish:true,recipe:'chart-deck'
   }));
   // Commercial & inn bars on y 400 and y 408
   for(const [lv,cy] of [[1,400],[2,408]]){
    for(const [stag,zs] of [['n',-62],['s',62]]){
     storeys.push(AI.barPlate({
      id:'sb.city.b'+lv+stag,level:lv,y:cy,h:4.4,
      path:line(-190,zs,190,zs),depth:15,side:'both',cw:2.4,roomW:6.4,
      kinds:cyc(['study','bedroom','bedroom','kitchen','store','dormitory']),ends:['core','core']
     }));
    }
   }
   out.push({
    id:'sb.city',area:'city',delve:false,name:ZONE_NAMES.city,
    storeys:storeys,floors:true,hollow:null,
    inside:(x,z,y)=>Math.abs(x)<=210&&Math.abs(z)<=82&&y>=388&&y<=418
   });
  }

  // ---- 4. TOURIST: Suspended Lower Tourist Center Overlook (x -178..+178, z -48..+48, y 174..190) ----
  {
   const storeys=[];
   // Level 0 (y 174): Panorama Canyon Lounge (centre), Gorge Dining Hall (west), River Study & Cabins
   storeys.push(AI.hallPlate({
    id:'sb.tour.lounge',level:0,y:174,h:6.0,
    poly:rectPoly(-22,22,-16,16),kind:'hall',doorEdge:0,doorW:2.2,furnish:true,recipe:'stern-lounge'
   }));
   if(!isFullRuin){
    storeys.push(AI.hallPlate({
     id:'sb.tour.dine',level:0,y:174,h:6.0,
     poly:rectPoly(34,82,-16,16),kind:'hall',doorEdge:3,doorW:2.2,furnish:true,recipe:'dining-hall'
    }));
   }
   storeys.push(AI.hallPlate({
    id:'sb.tour.messw',level:0,y:174,h:6.0,
    poly:rectPoly(-82,-34,-16,16),kind:'hall',doorEdge:1,doorW:2.2,furnish:true,recipe:'crew-mess'
   }));
   const txMax=isFullRuin?20:156;
   for(const [stag,zs] of [['n',-32],['s',32]]){
    storeys.push(AI.barPlate({
     id:'sb.tour.b0'+stag,level:0,y:174,h:4.4,
     path:line(-156,zs,txMax,zs),depth:14,side:'both',cw:2.2,roomW:6.0,
     kinds:cyc(['bedroom','bedroom','study','sickbay','bedroom']),ends:['core','store']
    }));
    storeys.push(AI.barPlate({
     id:'sb.tour.b1'+stag,level:1,y:184,h:4.4,
     path:line(-148,zs,isFullRuin?16:148,zs),depth:14,side:'both',cw:2.2,roomW:6.0,
     kinds:cyc(['bedroom','study','bedroom','dormitory']),ends:['core','store']
    }));
   }
   out.push({
    id:'sb.tourist',area:'tourist',delve:false,name:ZONE_NAMES.tourist,
    storeys:storeys,floors:true,hollow:null,
    collapse:isFullRuin?(x)=>x>24:null,
    inside:(x,z,y)=>Math.abs(x)<=186&&Math.abs(z)<=52&&y>=172&&y<=196
   });
  }

  // ---- 5. PYLONS: The Four Gate Pylons & Bulkhead Watch (x +/-350, z +/-118, y 386..458) ----
  {
   const storeys=[];
   const pyCoords=[['nw',-350,-118],['sw',-350,118],['ne',350,-118],['se',350,118]];
   for(const [ptag,px,pz] of pyCoords){
    // Lower bulkhead guard storey (y 386, below highway portal)
    storeys.push(AI.barPlate({
     id:'sb.pylon.'+ptag+'.b0',level:0,y:386,h:5.0,
     path:line(px-18,pz,px+18,pz),depth:15,side:'both',cw:2.2,roomW:6.0,
     kinds:cyc(['armoury','brig','barracks','strongroom']),ends:['core',null]
    }));
    // Upper watch storey above highway portal (y 454)
    storeys.push(AI.barPlate({
     id:'sb.pylon.'+ptag+'.b1',level:1,y:454,h:5.0,
     path:line(px-15,pz,px+15,pz),depth:14,side:'both',cw:2.2,roomW:6.0,
     kinds:cyc(['barracks','study','armoury']),ends:['core',null]
    }));
   }
   out.push({
    id:'sb.pylons',area:'pylons',delve:false,name:ZONE_NAMES.pylons,
    storeys:storeys,floors:true,hollow:null,
    inside:(x,z,y)=>Math.abs(Math.abs(x)-350)<=26&&Math.abs(Math.abs(z)-118)<=24&&y>=384&&y<=466
   });
  }

  // ---- 6. VAULTS-W: West Rim Automated Industries & Warehousing (x -680..-436, z -84..+84, y 342..366) ----
  // Whole & furnished in intact Stonebow; broken delving ruin behind the west pylon bulkhead in refurbished Stonebow!
  {
   const storeys=[
    AI.hallPlate({
     id:'sb.vw.eng0',level:0,y:342,h:9.0,
     poly:rectPoly(-530,-482,-22,22),kind:'workshop',doorEdge:1,doorW:3.0,furnish:true,recipe:'engine-room'
    }),
    AI.hallPlate({
     id:'sb.vw.sto0',level:0,y:342,h:9.0,
     poly:rectPoly(-610,-562,-22,22),kind:'store',doorEdge:1,doorW:3.0,furnish:true,recipe:'store-hall'
    }),
    AI.gridPlate({
     id:'sb.vw.grid0',level:0,y:342,h:9.0,
     x0:-668,x1:-618,z0:-54,z1:54,bay:[14,12],aisle:4,along:'z',
     kinds:(i)=>(i%4===3?'store':'workshop')
    }),
    AI.barPlate({
     id:'sb.vw.bar0n',level:0,y:342,h:5.2,
     path:line(-664,-68,-448,-68),depth:14,side:'both',cw:2.4,roomW:6.5,
     kinds:cyc(['study','store','workshop','armoury','study']),ends:['core','store']
    }),
    AI.barPlate({
     id:'sb.vw.bar1s',level:1,y:358,h:5.2,
     path:line(-664,68,-448,68),depth:14,side:'both',cw:2.4,roomW:6.5,
     kinds:cyc(['store','study','workshop','store']),ends:['core','store']
    })
   ];
   out.push({
    id:'sb.vaults.w',area:'vaults-w',delve:true,name:ZONE_NAMES['vaults-w'],
    storeys:storeys,floors:true,hollow:null,
    inside:(x,z,y)=>x>=-688&&x<=-432&&Math.abs(z)<=88&&y>=340&&y<=374
   });
  }

  // ---- 7. VAULTS-E: East Rim Factories, Utilities & Cliff Mechanical Roots (x +342..+680, y 266..366) ----
  // Whole & furnished in intact Stonebow; broken delving ruin behind the east pylon bulkhead in refurbished Stonebow!
  {
   const storeys=[
    // Cliff-root Mechanical Facilities at y 266 (where the lower Tourist Center struts anchor into the gorge wall)
    AI.hallPlate({
     id:'sb.ve.mech',level:0,y:266,h:8.0,
     poly:rectPoly(348,396,-18,18),kind:'workshop',doorEdge:3,doorW:2.8,furnish:true,recipe:'engine-room'
    }),
    AI.barPlate({
     id:'sb.ve.mechbar',level:0,y:266,h:4.8,
     path:line(348,38,398,38),depth:13,side:'both',cw:2.2,roomW:6.0,
     kinds:cyc(['workshop','store','study','strongroom']),ends:['core',null]
    }),
    // Upper rim factory & utility vaults at y 342 and y 358
    AI.hallPlate({
     id:'sb.ve.eng1',level:1,y:342,h:9.0,
     poly:rectPoly(482,530,-22,22),kind:'workshop',doorEdge:3,doorW:3.0,furnish:true,recipe:'engine-room'
    }),
    AI.hallPlate({
     id:'sb.ve.sto1',level:1,y:342,h:9.0,
     poly:rectPoly(562,610,-22,22),kind:'store',doorEdge:3,doorW:3.0,furnish:true,recipe:'store-hall'
    }),
    AI.barPlate({
     id:'sb.ve.bar1n',level:1,y:342,h:5.2,
     path:line(448,-68,664,-68),depth:14,side:'both',cw:2.4,roomW:6.5,
     kinds:cyc(['workshop','store','study','store','armoury']),ends:['store','core']
    }),
    AI.barPlate({
     id:'sb.ve.bar2s',level:2,y:358,h:5.2,
     path:line(448,68,664,68),depth:14,side:'both',cw:2.4,roomW:6.5,
     kinds:cyc(['store','workshop','study','store']),ends:['store','core']
    })
   ];
   out.push({
    id:'sb.vaults.e',area:'vaults-e',delve:true,name:ZONE_NAMES['vaults-e'],
    storeys:storeys,floors:true,hollow:null,
    inside:(x,z,y)=>x>=338&&x<=688&&Math.abs(z)<=88&&y>=264&&y<=374
   });
  }

  return out;
 }

 function entryIntact(AI){
  return {
   name:'Stonebow',frag:'8av1-stonebow-interiors.js',culture:'ancient',wealth:0.65,
   types:['civic','dwelling-multi','infrastructure','industry','market'],furnish:true,
   buildings:function(d){return makeBuildings(AI,d>0?'ruined':'intact');}
  };
 }

 function entryRefurbKept(AI){
  return {
   name:'Stonebow refurbished',frag:'8av1-stonebow-interiors.js',culture:'ancient',wealth:0.62,
   types:['civic','dwelling-multi','infrastructure','market'],furnish:true,
   buildings:function(){return makeBuildings(AI,'refurb').filter(b=>!b.delve);}
  };
 }

 function entryRefurbDelve(AI){
  return {
   name:'Stonebow delving vaults',frag:'8av1-stonebow-interiors.js',culture:'ancient',wealth:0.45,
   types:['industry','infrastructure'],furnish:false,
   buildings:function(){return makeBuildings(AI,'refurb').filter(b=>b.delve);}
  };
 }

 return {
  ZONE_NAMES:ZONE_NAMES,
  makeBuildings:makeBuildings,
  entryIntact:entryIntact,
  entryRefurbKept:entryRefurbKept,
  entryRefurbDelve:entryRefurbDelve
 };
})();
