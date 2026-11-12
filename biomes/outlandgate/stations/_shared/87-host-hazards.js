// ================================================================= HOST — the hazards of a later station (PLAN.md section 6, on core/hazard: KHAZ)
// Each a core/tags record carrying tags.hazard (registered before anything is drawn); its kind's row in KTAGS.VOCAB.hazardKinds fills what the
// record leaves out. The stage gives:
//   STAGE.hazards(H)   its own: H.add({kind, key, name, x, y, z, r, h, shape, danger, dose, cycle}) -> the record (drown in its lake and river,
//                      slip on wet travertine, fall off a scarp, crush under a coulee wall, hunter on the spiders' ground)
//   STAGE.heat         {mean, amp, peakH, y0}: THE AMBIENT TEMPERATURE (KHAZ.provide('temperature')): mean +- amp by the clock's hour
//                      (warmest at peakH), falling 6.5 K a km above y0
//   STAGE.flood        {name, box [x0, z0, x1, z1], y, h, level, depth}: THE OUTBURST FLOOD on KHAZ's own cycle (the page's clock, compressed:
//                      the first warning 20 min after load, so a long verify's views stay dry; ?flood=now at once, ?flood=0 none); 89zw raises its surface with k
const HAZ=(function(){const out={list:[],byKind:{},flood:null,ambient:false};
 const H={add(o){const t={kind:o.kind,shape:o.shape};if(o.danger!=null)t.danger=o.danger;if(o.dose!=null)t.dose=o.dose;if(o.cycle)t.cycle=o.cycle;
   const r=BIO.record({kind:'hazard',key:o.key,name:o.name,x:o.x,y:o.y,z:o.z,r:o.r,h:o.h,tags:{hazard:t}});if(r){out.list.push(r);(out.byKind[o.kind]=out.byKind[o.kind]||[]).push(r);}return r;}};
 if(STAGE.hazards){try{STAGE.hazards(H);}catch(e){reportErr('hazards: '+e.stack);}}
 const Q=new URLSearchParams(location.search),fq=Q.get('flood'),F=STAGE.flood;
 out.cycle={period:1800,warn:45,ramp:90,on:150,after:120,afterK:.3,offset:fq==='now'?-5:1800-1200};   /* the page opens idle: the first warning 20 min in */
 if(F&&fq!=='0'){const b=F.box,w=b[2]-b[0],d=b[3]-b[1];
  out.flood=BIO.record({kind:'hazard',key:'flood.outburst',name:F.name,x:(b[0]+b[2])/2,y:F.y,z:(b[1]+b[3])/2,r:Math.hypot(w,d)/2,h:F.h,
   tags:{hazard:{kind:'drown',danger:1,dose:.6,cycle:out.cycle,shape:{type:'box',w,d,h:F.h}}}});}
 const T=STAGE.heat;
 if(T&&typeof KHAZ!=='undefined'&&KHAZ.provide){KHAZ.provide('temperature',(x,y,z,t)=>{const c=typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock,h=c?c.hour:11;
   return T.mean+T.amp*Math.cos((h-(T.peakH==null?15:T.peakH))/24*2*Math.PI)-6.5*Math.max(0,(y==null?T.y0:y)-T.y0)/1000;});out.ambient=true;}
 return out;})();
const FLOOD_T0=performance.now();
const floodT=()=>(performance.now()-FLOOD_T0)/1000;
const floodK=t=>HAZ.flood&&typeof KHAZ!=='undefined'?KHAZ.state(HAZ.flood,t==null?floodT():t).k:0;
window._hazards=(function(){const o={flood:!!HAZ.flood,ambient:HAZ.ambient};for(const k in HAZ.byKind)o[k]=HAZ.byKind[k].length;return o;})();
