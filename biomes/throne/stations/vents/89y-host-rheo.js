// ================================================================= HOST — the Rheoliths at the fissure (biomes/rheolith, read in place: its PLAN.md section 8, step 3)
// The kit's deep mineral-siloxane life lives only where RHEO_PHYS.windowAt says it can (180-550 degC, water activity under .15, pH 3.8 or less): inside
// hot, dry, acid throats. Here the throat is the fissure's (four years quiet, its crack still glowing at night): a skylight on its middle into the conduit,
// where the kit lays its living guilds round the throat's walls and in the hottest satellite mouths (the fissure's own steam points nearest it), and
// its dead byproducts (collars, shed skins, etch halos, plugs, blisters, comb plates, star-eggs) round the mouths, downwind and on a bench beside it.
//   THE HEAT    KTHERM's surface heat (89x, THERM) plus the conduit's at the mouths: the throat breathes ~430 degC at its walls, a satellite ~240 degC
//               at its own (the rock's heat at the depth the guilds line, which KTHERM, a surface field, does not hold)
//   THE WATER   dry at the hot mouths (water activity .06), rising to the country's .55 away from them
//   THE ACID    pH 1.6 at the mouths, 5.5 a hundred metres off (the vents' acid rain and fog fall on all of it: 89-host-atmos)
// Before the build (89z: the Throne's flora after it, then the one bake). ?rheo=0 none
const RHEO_SITE=(function(){if(typeof RHEO==='undefined'||!RHEO.build||(typeof CORE_Q!=='undefined'&&CORE_Q.get('rheo')==='0'))return null;
 const um=(FISS.u0+FISS.u1)/2,c=fissPt(um),pit={x:c[0],z:c[1],r:18,throatR:5,floor:-14,rim:2.4};
 /* the satellite mouths: the fissure's steam points nearest the throat (STEAM's first ten are the fissure's, 47) */
 const sat=STEAM.slice(0,10).map(S=>({x:S.x,z:S.z,s:S.s,d:Math.hypot(S.x-pit.x,S.z-pit.z)})).filter(S=>S.d>pit.r*2.5).sort((a,b)=>a.d-b.d).slice(0,4);
 const vents=[{x:pit.x,z:pit.z,s:1}].concat(sat.map(S=>({x:S.x,z:S.z,s:S.s})));
 /* the bench: across the fissure from the throat, 70 m off, where the shed skins and comb plates gather */
 const a=fissPt(um+20),fx=a[0]-c[0],fz=a[1]-c[1],fl=Math.hypot(fx,fz)||1,bench={x:pit.x-fz/fl*70,z:pit.z+fx/fl*70,rx:40,rz:28};
 const mouthK=(x,z)=>{let k=Math.exp(-Math.pow(Math.hypot(x-pit.x,z-pit.z)/(pit.throatR*1.6),2)),s=0;
  for(let i=1;i<vents.length;i++)s=Math.max(s,Math.exp(-Math.pow(Math.hypot(x-vents[i].x,z-vents[i].z)/2.5,2)));return{k,s};};
 const temp3=(x,y,z)=>{const m=mouthK(x,z),T0=THERM?THERM.heatAt(x,z):26;return T0+430*m.k+240*m.s;};
 const aw=(x,y,z)=>{const m=mouthK(x,z);return .06+.49*(1-Math.max(m.k,m.s));};
 const near=(x,z)=>Math.min(...vents.map(V=>Math.hypot(x-V.x,z-V.z)));
 const ph=(x,z)=>1.6+3.9*smooth(4,100,near(x,z));
 const st=(function(){const cur=BIO.cur;BIO.cur='rheolith/fissure';try{return RHEO.build({R:TERR.R-150,quality:1,temp3,aw,ph,pit,vents,bench,wind:[.71,.71]});}
  catch(e){reportErr('rheolith: '+e.stack);return null;}finally{BIO.cur=cur;}})();
 REGISTER({name:'The fissure\'s throat (the Rheoliths\' breach: mineral life in the conduit, hot, dry and acid)',x:pit.x,z:pit.z,y:terrainH(pit.x,pit.z)-pit.r,r:pit.r*1.4,h:pit.r*2,rheo:true});
 return{pit,vents,bench,temp3,aw,ph,counts:st};})();
