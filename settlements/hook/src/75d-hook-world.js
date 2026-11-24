/* ============================== HOOK: THE GROUND FROM THE SCALE MODEL ([G data]) ============================== */
/* Hook stands on the Krator Scale Model's ground at 1:1, through the open world's own land: core/world/41-world-fields.js
   (WORLD.H, read in place as settlements/pinnacle-rock reads it), initialised here on the cut round Hook's pin
   (settlements/hook/world: cut.py, region.json and the rasters, decoded at build time by core/world/world_data.py into
   WORLD_DATA and WORLD_R, 75c). The kit's frame (x along the coast, +z the sea) is laid on the model here: the origin at
   the 1:1 shoreline nearest Hook's pin and the frame turned to the coast's bearing there, so the P0 waterfront (kit
   z ~ 0) stands on the shelf's edge with the sea before it. Heights are the kit's: sea level 0, so natH = the model's
   ground less the Ring Sea's level. PORT.natH (kits/port/src/71-port-terrain.js) takes it in place of the kit's own
   coast; hookGroundH (76-hook-ground.js) reads it through portNatH. No three.js, no DOM.
     HOOK_WORLD.SEA          the Ring Sea's level in the model (m): the level of the cut's largest water body
     HOOK_WORLD.origin       the kit's origin in the cut's metres (x east, z south, 0,0 at Hook's pin), .ex/.ez its axes,
                             .bearing the coast's bearing
     HOOK_WORLD.toWorld(x,z) / .toLocal(wx,wz)   the frame, both ways
     HOOK_WORLD.natH(x,z)    the kit's natural ground: the model's at 1:1, sea level 0
     HOOK_WORLD.modelH(x,z)  the same, as the model has it (not lowered to the kit's sea level)
     HOOK_WORLD.report       the numbers the README quotes (the shoreline's offset, the bearing, the ground behind) */
WORLD.init(WORLD_R);
const HOOK_WORLD=(()=>{
 /* the sea: the Ring Sea, the cut's largest water body (core/world's own bodies: the cut also holds small lakes) */
 let SEA=-1e9,big=-1;for(const b of WORLD.waterBodies())if(b.cells>big){big=b.cells;SEA=b.level;}
 if(big<0)throw new Error('HOOK_WORLD: the cut holds no water body');
 /* the ground the frame is laid on: the land without its fine terms (minWave SEARCH_WAVE leaves out the roughness,
    the gullies, the channels and the metre-scale noise), so the shoreline is the slope's, not a ripple's */
 const SEARCH_WAVE=400,STEP=50;
 const hs=(x,z)=>WORLD.H(x,z,SEARCH_WAVE)-SEA;
 /* A REAL coast, not a ripple: on 5.1 the model's ground round the pin is a drowned flat (-10 to +5 m for kilometres,
    one body with the Ring Sea), where sea level is crossed everywhere; Hook's land is its spit (world/landforms.json,
    41l's benches, 5 m over the sea). A crossing counts only when the sea 300 m out (-z) is a metre deep or more and the
    land stands DRY_M or more over the sea at every 200 m of the 600 m in (+z): a shore with land behind it.
    shore(x,z0,reach): on the line of constant x, the nearest such crossing to z0 (the sea on its -z side: the sea is
    Hook's north), each 50 m interval bisected to a centimetre; null when there is none within `reach` m */
 const SEA_OUT=300,DRY_M=3;
 const real=(x,z)=>hs(x,z-SEA_OUT)<-1&&hs(x,z+200)>=DRY_M&&hs(x,z+400)>=DRY_M&&hs(x,z+600)>=DRY_M;
 function cross(x,a){let s=a,l=a+STEP;for(let k=0;k<24;k++){const m=(s+l)/2;if(hs(x,m)<0)s=m;else l=m;}return (s+l)/2;}
 function shore(x,z0,reach){
  for(let d=0;d<=reach;d+=STEP)for(const a of [z0-d-STEP,z0+d])if(hs(x,a)<0&&hs(x,a+STEP)>=0){const z=cross(x,a);if(real(x,z))return z;}
  return null;}
 /* the coast's line at x0: the shoreline at five stations 750 m apart along x (the waterfront's three kilometres), a
    least-squares line through them: {st, slope, zc (the line at x0), off (the worst station's distance from it)}, or
    null when a station finds no real coast within 1.5 km of z0 */
 const STATIONS=[-1500,-750,0,750,1500];
 function line(x0,z0){const st=[];for(const dx of STATIONS){const z=shore(x0+dx,z0,1500);if(z==null)return null;st.push([x0+dx,z]);}
  let sx=0,sz=0,sxx=0,sxz=0;for(const p of st){const u=p[0]-x0;sx+=u;sz+=p[1];sxx+=u*u;sxz+=u*p[1];}
  const n=st.length,den=n*sxx-sx*sx,slope=den?(n*sxz-sx*sz)/den:0,zc=(sz-slope*sx)/n;
  let off=0;for(const p of st)off=Math.max(off,Math.abs(p[1]-(zc+slope*(p[0]-x0)))/Math.hypot(1,slope));
  return {st,slope,zc,off};}
 /* the origin: the real crossing nearest the pin, over lines of constant x 250 m apart within SEARCH_R of it, where the
    coast runs straight for the waterfront's length (all five stations found, none more than STRAIGHT m off their
    line). The branch's 4.21 cut had it due seaward of the pixel, 124 m out; on 5.1 the pixel stands in the drowned bay
    and the coast it fronts is the plateau's north face (README.md "The ground") */
 const SEARCH_R=8000,STRAIGHT=250;let best=null;
 for(let x=-SEARCH_R;x<=SEARCH_R;x+=250){const z=shore(x,0,SEARCH_R);if(z==null)continue;const L=line(x,z);
  if(L&&L.off<=STRAIGHT&&(!best||Math.hypot(x,L.zc)<Math.hypot(best.x0,best.L.zc)))best={x0:x,L};}
 if(!best)throw new Error('HOOK_WORLD: no straight real coast (sea north, land rising south) within '+SEARCH_R/1000+' km of Hook\'s pin');
 const x0=best.x0,st=best.L.st,slope=best.L.slope,zc=best.L.zc;
 /* the tangent along the coast and the normal toward the sea (the side where the ground is lower) */
 let tx=1/Math.hypot(1,slope),tz=slope/Math.hypot(1,slope);
 let nx=tz,nz=-tx;if(hs(x0+nx*800,zc+nz*800)>hs(x0-nx*800,zc-nz*800)){nx=-nx;nz=-nz;}
 /* the kit's axes: +z to the sea, +x along the coast on the kit's right-handed side */
 /* the origin on the shoreline found at x0 (the middle station), not on the fitted line, which may stand up to STRAIGHT
    m off it; the fit gives the bearing */
 const ez=[nx,nz],ex=[nz,-nx],O=[x0,st[2][1]];
 const toWorld=(x,z)=>[O[0]+x*ex[0]+z*ez[0],O[1]+x*ex[1]+z*ez[1]];
 const toLocal=(wx,wz)=>{const dx=wx-O[0],dz=wz-O[1];return [dx*ex[0]+dz*ex[1],dx*ez[0]+dz*ez[1]];};
 const modelH=(x,z)=>{const w=toWorld(x,z);return WORLD.H(w[0],w[1],0);};
 const natH=(x,z)=>modelH(x,z)-SEA;
 /* the coast's bearing in degrees from east, positive turning south (the model's +z). With the sea to the north the
    frame is a half turn: the kit's +x (ex) runs west, so the kit's -x end, the Point, lies at the world's EAST end of
    the waterfront (README.md "The ground": the owner keeps it so, 2026-10-19) */
 const bearing=Math.atan2(tz,tx)*180/Math.PI;
 let scarp=0;for(let i=0;i<WORLD_R.scarpW.length;i++)if(WORLD_R.scarpW[i]>scarp)scarp=WORLD_R.scarpW[i];
 const F=WORLD_DATA.meta.frame;
 const report={source:WORLD_DATA.meta.source,sea_m:SEA,origin_m:[Math.round(O[0]),Math.round(O[1])],origin_from_pin_m:Math.round(Math.hypot(O[0],O[1])),
  origin_px:[+(F.origin_px[0]+O[0]/F.m_per_px).toFixed(2),+(F.origin_px[1]+O[1]/F.m_per_px).toFixed(2)],
  coast_bearing_deg:+bearing.toFixed(1),stations:st.map(p=>[p[0],Math.round(p[1])]),
  pixel_over_sea_m:Math.round(hs(0,0)),ex:ex.map(v=>+v.toFixed(4)),ez:ez.map(v=>+v.toFixed(4)),
  behind_m:[300,760,1180,1250,2000,4000].map(d=>[d,Math.round(hs(O[0]-d*ez[0],O[1]-d*ez[1]))]),
  seaward_m:[250,500,1000,2000].map(d=>[d,Math.round(hs(O[0]+d*ez[0],O[1]+d*ez[1]))]),scarp};
 return {SEA,origin:O,ex,ez,bearing,toWorld,toLocal,natH,modelH,report,SEARCH_WAVE};})();
/* the kit's terrain takes the model's ground in place of its own coast (71-port-terrain.js portNatH -> PORT.natH) */
PORT.natH=HOOK_WORLD.natH;
