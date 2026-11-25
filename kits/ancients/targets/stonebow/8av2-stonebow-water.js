// ================================================================= STONEBOW — Ching-Ma river & porphyry cataract on core/water
// [G data]: plain core/water records per site in world coordinates, drawn in 90w-stonebow-water.js after ATMOS.init.
// Models the perennial karst-fed Ching-Ma River (river 9109, ~330 m3/s) entering through the upstream porphyry cataract
// step (z = -562), plunging into a clear pool, and winding beneath Stonebow's 900 m arch and suspended Tourist Center.
const SBWATER={sites:[]};

SBWATER.canyon=function(d,cfg){
 const gx=cfg.gx,gz=cfg.gz,mode=cfg.mode==null?'intact':cfg.mode;
 const W=(x,z,y)=>[x+gx,z+gz,y];
 const site={d:d,mode:mode,gx:gx,gz:gz,still:[],flow:[],fall:[]};

 // 1. Upstream headwater reach above the porphyry cataract sill (z = -730 .. -558, y = 35.0)
 const upPts=[],upWid=[];
 for(let z=-730;z<=-558;z+=21.5){
  upPts.push(W(STONEBOW.riverX(z),z,35.0));
  upWid.push(STONEBOW.riverW(z)*0.82);
 }
 site.flow.push(WATER.flow({name:'Ching-Ma upper porphyry reach',pts:upPts,width:upWid,speed:1.7}));

 // 2. Upstream porphyry shut-in cataract fall (33.4 m drop onto the gorge floor)
 const rxLip=STONEBOW.riverX(-556),hwLip=15;
 site.fall.push(WATER.fall({
  name:'Ching-Ma Shut-In Cataract',
  lip:[W(rxLip-hwLip,-556,34.8),W(rxLip+hwLip,-556,34.8)],
  dir:[0,1],speed:2.9,drop:33.4,spread:6.5
 }));

 // 3. Cataract plunge pool (level = 1.45 m)
 const rxPool=STONEBOW.riverX(-536),poolPoly=[];
 for(let i=0;i<20;i++){
  const a=(i/20)*Math.PI*2;
  poolPoly.push([gx+rxPool+Math.cos(a)*27,gz-536+Math.sin(a)*22]);
 }
 site.still.push(WATER.still({name:'Cataract plunge pool',level:1.45,poly:poolPoly}));

 // 4. Main Ching-Ma River flow down the canyon floor beneath Stonebow (z = -528 .. +732)
 const rivPts=[],rivWid=[];
 for(let z=-528;z<=732;z+=28){
  rivPts.push(W(STONEBOW.riverX(z),z,1.35));
  rivWid.push(STONEBOW.riverW(z));
 }
 site.flow.push(WATER.flow({name:'Ching-Ma River (9109)',pts:rivPts,width:rivWid,speed:1.45}));

 SBWATER.sites.push(site);
 return site;
};

// Ground height in world space for core/ruins (KRUINS.watch on the ruined Stonebow site)
SBWATER.ground=function(site,x,z){
 const lx=x-site.gx,lz=z-site.gz;
 if(Math.abs(lx)>820||Math.abs(lz)>800)return 0;
 return Math.max(0,STONEBOW.groundAt(lx,lz));
};
