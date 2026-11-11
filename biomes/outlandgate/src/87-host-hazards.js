// ================================================================= HOST — THE HAZARDS (PLAN.md section 6, on core/hazard: KHAZ)
// Each a core/tags record carrying tags.hazard (registered before anything is drawn); its kind's row in KTAGS.VOCAB.hazardKinds fills what the
// record leaves out. On this page:
//   THE RIVER         `drown` along Hau-Gel's main channel (a reach every 400 m, its shape the channel's outline over the reach): deep,
//                     fast, cold off the walls
//   THE OUTBURST FLOOD `drown` over the whole floor ON A CYCLE (the shared gorge-flood amendment, PLAN.md section 8, amendment 2: here kit
//                     work on KHAZ's own cycle): the N Outlands' lake (2,345 m) breaking through. warn (the river rising, the roar up the
//                     gap: a tell, k 0), the rise, the flood, the fall, its leavings (k .3), then idle. ON THE PAGE the water rises over
//                     the floor with k (one still surface, raised and lowered each frame); the floor's lowest ground goes under first.
//                     The page's flood clock is its own (seconds since load, compressed: the real flood is decades apart): ?flood=now
//                     starts one at once, ?flood=0 none
//   THE SUMMER HEAT   ambient (KHAZ.provide('temperature')): the floor's warm month 29 °C mean, 37 °C on the hottest afternoons (the
//                     model's, PLAN.md section 3), by the hour and falling 6.5 K a km up the walls
//   The rockfall, avalanche and cliffs are the walls' (the far field: no ground of theirs on this page); the wall's guards (the toll, the
//   seed law) are not a KHAZ kind: the open world's faction rules.
const HAZ=(function(){const out={drown:[],flood:null,ambient:false};
 // ---- the river: a reach every 400 m, its shape the main channel's own outline over that reach (a poly round the record's point)
 for(let z=-3200;z<3200;z+=400){const x0=rivX(z+200),L=[],Rt=[];
  for(let k=0;k<=10;k++){const zz=z+k*40,xx=rivX(zz);L.push([xx-MAIN_W/2-x0,zz-(z+200)]);Rt.push([xx+MAIN_W/2-x0,zz-(z+200)]);}
  out.drown.push(BIO.record({kind:'hazard',key:'drown.river:'+z,name:'Hau-Gel (deep, fast, cold off the walls: drowning)',x:x0,y:LVL(z+200)-4,z:z+200,r:200,h:6,
   tags:{hazard:{kind:'drown',shape:{type:'poly',pts:L.concat(Rt.reverse()),h:6}}}}));}
 // ---- the outburst flood: a box over the floor (the page's square), on its cycle
 const Q=new URLSearchParams(location.search),fq=Q.get('flood');
 const CYC={period:900,warn:45,ramp:90,on:150,after:120,afterK:.3,offset:fq==='now'?-5:900-240};   /* the page opens idle: the first flood's warning 4 min in, at once with ?flood=now */
 if(fq!=='0')out.flood=BIO.record({kind:'hazard',key:'flood.outburst',name:'The outburst flood (the N Outlands\' lake breaking through: the gap\'s floor under water)',x:0,y:LVL(0)-3,z:0,r:TERR.R*1.42,h:14,
  tags:{hazard:{kind:'drown',danger:1,dose:.6,cycle:CYC,shape:{type:'box',w:TERR.R*2,d:TERR.R*2,h:14}}}});
 out.cycle=CYC;
 // ---- the summer heat: the ambient temperature at a point (the clock's hour; the height)
 if(typeof KHAZ!=='undefined'&&KHAZ.provide){KHAZ.provide('temperature',(x,y,z,t)=>{const c=KHOST&&KHOST.host&&KHOST.host.clock,h=c?c.hour:11;
   return 24+8*Math.cos((h-15)/24*2*Math.PI)-6.5*Math.max(0,(y==null?1423:y)-1423)/1000;});out.ambient=true;}
 return out;})();
// the flood's clock (seconds since load) and its state now
const FLOOD_T0=performance.now();
const floodT=()=>(performance.now()-FLOOD_T0)/1000;
const floodK=t=>HAZ.flood&&typeof KHAZ!=='undefined'?KHAZ.state(HAZ.flood,t==null?floodT():t).k:0;
/* the flood is drawn in 89zw (core/water needs the atmosphere first) */
window._hazards={drown:HAZ.drown.filter(Boolean).length,flood:!!HAZ.flood,ambient:HAZ.ambient};
