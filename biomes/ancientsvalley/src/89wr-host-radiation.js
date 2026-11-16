// ================================================================= HOST - radiation over the scars (core/atmos fx radiation)
// [web] The owner's radiation effect (core/atmos, 2026-11-10: "a subtle warm glow and heat-haze-like shimmer ... it should not obscure anything
// but should be noticeable from a fair distance"; PLAN.md 9 "Radiation": the tell is the dead-ground shimmer and the geiger click). On this page
// the irradiated ground is its scars (STAGE.scars, 46z): the dead lobe on the ridge's east end and the blast craters. core/atmos takes four zones
// at most, so the dead lobe and the three largest craters glow, each a ball of warm air on its scar (centre on the ground, so it reads as a dome),
// the lobe the strongest. The glow goes on every lit material once the city and the transit are built and again every few seconds for what is
// built later (the heroes, the transit cells), as the warp's sweep does (89y). core/hazard's `radiation` field is registered by the fx when the
// page's KHAZ takes one. Godot: the zones are records; the glow is the fx's .gdshaderinc (core/atmos/GODOT.md).
const AV_RAD=(function(){if(typeof ATMOS==='undefined'||typeof ATMOS.radiation!=='function')return null;
 const S=STAGE.scars||[],lobe=S[0],cr=(STAGE.craters||[]).slice().sort((a,b)=>b.r-a.r).slice(0,3),zones=[];
 if(lobe)zones.push({x:lobe.x,z:lobe.z,y:STAGE.ground(lobe.x,lobe.z),r:Math.round(.85*Math.max(lobe.rx,lobe.rz)),strength:.16,shimmer:.35,id:'rad.lobe'});
 cr.forEach((c,i)=>zones.push({x:c.x,z:c.z,y:STAGE.ground(c.x,c.z),r:Math.round(Math.max(120,1.6*c.r)),strength:.12,shimmer:.35,id:'rad.crater'+(i+1)}));
 if(!zones.length)return null;
 let R=null;try{R=ATMOS.radiation({zones});}catch(e){reportErr('radiation: '+(e.message||e));return null;}
 let n=ATMOS.radiationScene(scene),last=0,live=false;const S2={R,zones,n:()=>n};
 tick(function(){const ready=(typeof AVC==='undefined'||AVC.ready)&&(typeof AVTR==='undefined'||AVTR.ready);if(!ready)return;
  const now=performance.now();if(live&&now-last<3000)return;live=true;last=now;try{n=ATMOS.radiationScene(scene);}catch(e){}});
 return S2;})();
