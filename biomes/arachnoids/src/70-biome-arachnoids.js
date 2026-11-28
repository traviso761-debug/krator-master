// ================================================================= ARACHNOID CANYONS — BIOME-API canopy query & kit closure ([G data])
// Pure [G data] canopy stand-height query across the 4.1 km vertical inversion gradient:
//   - Zone 1 (+660-1,250 m 1.43-1.47 atm Cfa slotfloor): 22.5 m gorgehemlock/slotmulberry/bamboo canopy (5.4 m on warm fumarole aprons; 0.25 m on >= 58 C throats)
//   - Zone 2 (+1,150-2,600 m 1.31 atm Csa ledgewood/dryrim): 14.5 m columnarpine/ledgeoak/amberpistache woods (9.5 m spokedikejuniper on chilled vitrophyre ribs)
//   - Zone 3 (+3,800-4,800 m 0.88 atm ET frostrim): strictly prostrate <= 1.40 m updraft-sheared rimkrummholz & snowbeddwarfbirch mat
ARACHNOIDS.canopyH=function(x,z,opt){
 var xx=x==null?0:x,zz=z==null?0:z;
 var skey=(opt&&typeof opt==='string')?opt:(opt&&opt.station)?opt.station:(typeof SKEY!=='undefined'?SKEY:'nexus');
 var site=(opt&&opt.px)?opt:(typeof ARACH_SITES!=='undefined'&&ARACH_SITES[skey])?ARACH_SITES[skey]:(typeof SITE!=='undefined'?SITE:null);
 var tFn=(opt&&opt.terrainH)?opt.terrainH:(typeof BIO!=='undefined'&&BIO.host&&typeof BIO.host.terrainH==='function')?BIO.host.terrainH:null;
 var y=(opt&&opt.y!=null)?opt.y:tFn?tFn(xx,zz):(site&&site.key==='frostrim'?site.rimY:site?site.bedY+6.0:0.0);
 if(typeof ARACH_PHYS==='undefined'||!site)return skey==='frostrim'?1.2:skey==='ledges'?14.5:22.5;
 var inv=ARACH_PHYS.inversionAt(xx,zz,y,site);
 if(inv.zoneBand==='frostrim'||skey==='frostrim'){
  var sh=ARACH_PHYS.krummholzShearAt(xx,zz,site);
  return +(Math.min(1.4,Math.max(0.35,sh.prostrateH*0.72))).toFixed(2);
 }
 var fum=ARACH_PHYS.fumaroleAt(xx,zz,site);
 if(fum.hazardScald)return 0.25;
 if(fum.groundTempC>=46.0)return 5.4;
 if(inv.zoneBand==='dryrim'||inv.zoneBand==='ledgewood'||skey==='ledges'){
  var fn=ARACH_PHYS.fissureNetAt(xx,zz,site);
  return fn.vitrophyre01>0.45?9.5:14.5;
 }
 return 22.5;
};
if(typeof BIO!=='undefined'&&typeof BIO.kitEnd==='function')BIO.kitEnd(ARACHNOIDS);
