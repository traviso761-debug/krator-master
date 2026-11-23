// ================================================================= HOST — the Rheoliths at the hot reach (biomes/rheolith, read in place: its PLAN.md section 8, step 3)
// The kit's deep mineral-siloxane life lives only where RHEO_PHYS.windowAt says it can (180-550 degC, water activity under .15, pH 3.8 or less). In the
// tube that is the hot reach, where a lava stream still runs (45's HOT): a small throat on the floor where the reach begins, its walls breathing the
// stream's heat, and a bench a little downstream on the floor where the shed skins, blisters and comb plates lie. The tube is ~20 m wide, so the throat
// is small (r 5 m) and has no satellite mouths; and while the kit lays its things, waterH reads as flooded outside the tube (the kit lays nothing where
// water stands over the ground), so nothing it scatters (its star-eggs fly 28-171 m) lands on the surface 26 m overhead. Restored at once after.
//   THE HEAT    the cave's air (12 degC) plus the stream's heat over the reach (hotK) plus the conduit's at the throat: ~430 degC at its walls
//   THE WATER   dry across the throat and the hot reach (water activity .05), the cave's damp .6 away from them
//   THE ACID    pH 2 at the throat, 5.5 40 m off
// Before the build (89z). ?rheo=0 none
const RHEO_SITE=(function(){if(typeof RHEO==='undefined'||!RHEO.build||(typeof CORE_Q!=='undefined'&&CORE_Q.get('rheo')==='0'))return null;
 const u0=HOT.u0+10,c=TUBE.P(u0),pit={x:c[0],z:c[1],r:5,throatR:2,floor:-4,rim:.8};
 /* the satellite mouths: three in the tube's walls along the reach, 2.5 m in from each wall by turns (the kit lays its living guilds round its
    satellites; round the throat itself it lays them only in its own page's frame, at -19 to -5 m: biomes/rheolith 60, 1a) */
 const sats=[5,20,35].map((du,i)=>{const u=u0+du,p=TUBE.P(u),t=TUBE.tan(u),l=(i%2?1:-1)*(TUBE.W(u)-2.5);return{x:p[0]-t[1]*l,z:p[1]+t[0]*l,s:.8};});
 const vents=[{x:pit.x,z:pit.z,s:1}].concat(sats);
 const b=TUBE.P(u0-35),bench={x:b[0],z:b[1],rx:5,rz:5};
 const mk=(x,z)=>Math.exp(-Math.pow(Math.hypot(x-pit.x,z-pit.z)/(pit.throatR*1.6),2));
 const sk=(x,z)=>Math.max(0,...sats.map(S=>Math.exp(-Math.pow(Math.hypot(x-S.x,z-S.z)/2.5,2))));
 const reach=(x,z)=>{const t=tubeAt(x,z);return t&&t.T===TUBE?hotK(t.u):0;};
 const temp3=(x,y,z)=>12+260*reach(x,z)+430*mk(x,z)+240*sk(x,z);
 const aw=(x,y,z)=>.05+.55*(1-smooth(.15,.4,Math.max(mk(x,z),sk(x,z),reach(x,z)*.8)));   /* dry across the throat and the mouths */
 const ph=(x,z)=>2+3.5*smooth(3,40,Math.hypot(x-pit.x,z-pit.z));
 const H=BIO.host,w0=H.waterH,inTube=(x,z)=>{const t=tubeAt(x,z);return !!t;};
 H.waterH=(x,z)=>inTube(x,z)?w0(x,z):1e9;   /* outside the tube: as if flooded, so the kit lays nothing there */
 const st=(function(){const cur=BIO.cur;BIO.cur='rheolith/tube';try{return RHEO.build({R:TERR.R-60,quality:1,temp3,aw,ph,pit,vents,bench,wind:[TUBE.d[0],TUBE.d[1]]});}
  catch(e){reportErr('rheolith: '+e.stack);return null;}finally{BIO.cur=cur;H.waterH=w0;}})();
 REGISTER({name:'The hot reach\'s throat (the Rheoliths in the tube: mineral life in the stream\'s hot rock)',x:pit.x,z:pit.z,y:terrainH(pit.x,pit.z)-2,r:pit.r*1.6,h:12,rheo:true});
 return{pit,vents,bench,temp3,aw,ph,counts:st};})();
