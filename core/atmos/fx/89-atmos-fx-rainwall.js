// ================================================================= ATMOS — fx: the rain wall (a standing curtain of rain on a windward face)
// [G data] + [web] + [G shader] (biomes/swhighlands/PLAN.md: the west wind off the Ancient's Valley lake drops 2,600-4,000 mm
// at about 2 km on the ramp; station 2, "the rain wall", stands in it). Orographic rain: it does not move with the weather
// front, it stands where wind forced up a face rains out, so it is a FIELD on the ground, not a mode:
//   rain(x, z) = rain * band(ground) * (lee + (1 - lee) * smoothstep(0, slope, windward))
//   band   1 where the ground lies in y0..y1, eased over `edge` metres at both ends (the condensation level below, the rain
//          spent above)
//   the windward rise is ATMOS.windwardAt (89-atmos-0-core.js): how steeply the ground climbs into the wind there
// Two things draw it, both on the weather module (89-atmos-4-weather.js), so the rain cover (fx/89-atmos-fx-raincover.js)
// keeps it off whatever shelters:
//   INSIDE    the field under the eye raises the weather's rain (W.rain, eased): the weather's own streaks fall, the ground
//             wets (W.wet), the sky greys and the fog belt thickens, as in any shower, but only while you stand in the wall
//   OUTSIDE   curtains: tall grey panels of falling streaks, one per cell of the field where it rains, standing on the ground
//             up into the cloud base (o.top), turned to the eye about the vertical, faded out near the eye (where the
//             weather's streaks take over) and far off. Cells are seeded by KRAND.hash(seed, ix, iz, salt), never draw order
//   ATMOS.rainWallMake(o) -> R           the record with its defaults (pure): y0, y1 (m; default 1700, 2600), edge (default
//                                        a quarter of the band), windward [x, z] (where the wind comes from), lee (default .1),
//                                        slope (default .3), reach (m, default 300), rain (0..1 at full, default 1)
//   ATMOS.rainWallAt(R, x, z, ground)    0..1, the rain there (pure: a kit's wet ground, its scars and its plants read it)
//   ATMOS.rainWallCells(R, ground, seed) the curtains' cells over R.extent at R.cell metres: [{x, z, y, w, top, k, phase}] (pure)
//   ATMOS.rainWall(o) -> R               the host: o as above plus centre [x, z] and radius (default 5000 m round the camera)
//                                        or extent [x0, z0, x1, z1], cell (m, default 260), min (the least rain that hangs a
//                                        curtain, default .2), top (m: the curtains' tops, default y1 + 400), max (curtains,
//                                        default 700), alpha (default .5), colour [r, g, b], inside (0..1: how much the wall
//                                        raises W.rain under it, default 1), seed. Needs ATMOS.weather first and core/rand.
//   R.at(x, z)  the field on the page's ground; R.off = true hides it (an A/B check)
// Godot: the field is the record's numbers on the same ground; the curtains are a MultiMesh of quads with this shader
// (GODOT.md, "The rain wall"); inside, the Atmos autoload raises W.rain the same way.
(function(){const A=ATMOS;
 A.rainWallMake=o=>{o=o||{};const y0=o.y0==null?1700:o.y0,y1=o.y1==null?2600:o.y1;
  return{y0,y1,edge:Math.max(1,o.edge==null?(y1-y0)*.25:o.edge),windward:o.windward||[-1,0],lee:o.lee==null?.1:o.lee,slope:o.slope==null?.3:o.slope,
   reach:o.reach==null?300:o.reach,rain:o.rain==null?1:o.rain};};
 A.rainWallAt=(R,x,z,ground)=>{const g=ground(x,z),band=A.ss(R.y0-R.edge,R.y0,g)*(1-A.ss(R.y1,R.y1+R.edge,g));if(band<=0)return 0;
  return R.rain*band*(R.lee+(1-R.lee)*A.ss(0,R.slope,A.windwardAt(ground,x,z,R.windward,R.reach)));};
 A.rainWallCells=(R,ground,seed)=>{const e=R.extent,c=R.cell,out=[],nx=Math.ceil((e[2]-e[0])/c),nz=Math.ceil((e[3]-e[1])/c),s=seed==null?0:seed;
  for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const gx=Math.floor(e[0]/c)+ix,gz=Math.floor(e[1]/c)+iz;   /* world cells: the same curtain from any extent */
   const u=KRAND.unit(KRAND.hash(s,gx,gz,1,0x7261)),v=KRAND.unit(KRAND.hash(s,gx,gz,2,0x7261)),x=(gx+.15+.7*u)*c,z=(gz+.15+.7*v)*c;
   if(x<e[0]||x>e[2]||z<e[1]||z>e[3])continue;const k=A.rainWallAt(R,x,z,ground);if(k<R.min)continue;
   out.push({x,z,y:ground(x,z)-15,w:c*1.7,top:R.top,k,phase:KRAND.unit(KRAND.hash(s,gx,gz,3,0x7261))});}
  out.sort((a,b)=>b.k-a.k);return out.slice(0,R.max);};
 A.rainWall=function(o){o=o||{};const T=A.T,U=A.U,h=A.h||{},cam=h.camera,F=A.glf;if(!A.W)A.err('rainWall: call ATMOS.weather first');
  const w=A.windBase||(U.wind?U.wind.value:null),c=o.centre||(cam?[cam.position.x,cam.position.z]:[0,0]),r=o.radius==null?5000:o.radius;
  const R=A.rainWallMake(Object.assign({windward:w?[-w.x,-w.y]:[-1,0]},o));
  Object.assign(R,{extent:o.extent||[c[0]-r,c[1]-r,c[0]+r,c[1]+r],cell:o.cell==null?260:o.cell,min:o.min==null?.2:o.min,top:o.top==null?R.y1+400:o.top,
   max:o.max==null?700:o.max,alpha:o.alpha==null?.5:o.alpha,colour:o.colour||[.60,.64,.70],inside:o.inside==null?1:o.inside,seed:o.seed==null?(h.seed==null?0:h.seed):o.seed});
  const cells=R.cells=A.rainWallCells(R,A.ground,R.seed),pos=[],pp=[];for(const q of cells){pos.push(q.x,q.y,q.z);pp.push(q.w,q.top,q.k,q.phase);}
  R.k={value:1};
  const m=new T.ShaderMaterial({uniforms:{time:U.time,wind:U.wind,light:U.light,rwK:R.k},transparent:true,depthWrite:false,fog:false,
   vertexShader:`attribute vec3 ipos;attribute vec4 pp;uniform vec2 wind;varying vec2 vUv;varying float vA;varying vec2 vC;
    void main(){vec2 to=cameraPosition.xz-ipos.xz;to=length(to)>1e-3?normalize(to):vec2(0.0,1.0);vec2 rt=vec2(to.y,-to.x);float h=max(1.0,pp.y-ipos.y);
     vec3 p=ipos+vec3(rt.x,0.0,rt.y)*position.x*pp.x+vec3(0.0,(position.y+0.5)*h,0.0);p.xz+=wind*(0.5-position.y)*h*0.06;
     vUv=position.xy+0.5;vC=vec2(pp.x,pp.w);vec4 mv=viewMatrix*vec4(p,1.0);float d=length(ipos-cameraPosition);
     vA=pp.z*smoothstep(${F(80)},${F(260)},d)*(1.0-smoothstep(${F(9000)},${F(14000)},d));gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float time;uniform float light;uniform float rwK;varying vec2 vUv;varying float vA;varying vec2 vC;
    uint rwH(uint x){x^=x>>16u;x*=2146121005u;x^=x>>15u;x*=2221713035u;x^=x>>16u;return x;}
    void main(){float col=floor(vUv.x*vC.x/3.0);float r=float(rwH(uint(col+4096.0)^uint(vC.y*65535.0)))/4294967296.0;
     float s=fract(vUv.y*(14.0+10.0*r)+time*(0.9+0.6*r)+r*7.0);float st=smoothstep(0.0,0.2,s)*(1.0-smoothstep(0.2,1.0,s));
     float edge=smoothstep(0.0,0.3,vUv.x)*(1.0-smoothstep(0.7,1.0,vUv.x)),vert=smoothstep(0.0,0.06,vUv.y)*(1.0-smoothstep(0.75,1.0,vUv.y));
     float a=vA*rwK*edge*vert*(0.6+0.4*st);if(a<0.004)discard;gl_FragColor=vec4(vec3(${R.colour.map(F).join(',')})*(0.4+0.6*light)*(0.8+0.2*vUv.y),a*${F(R.alpha)});}`});
  R.mesh=cells.length?A.sprites('rainwall',{ipos:[3,pos],pp:[4,pp]},m,3):null;
  R.at=(x,z)=>A.rainWallAt(R,x,z,A.ground);R.here=0;
  // inside: the field under the eye lifts the weather's rain (after the weather's own step: the hooks run in order)
  A.hook((t,hr,dt)=>{const W=A.W;R.k.value=R.off?0:1;if(R.mesh)R.mesh.visible=!R.off;if(!W||!cam)return;
   const g=R.off?0:R.inside*R.at(cam.position.x,cam.position.z);R.here+=(g-R.here)*Math.min(1,dt*.5);if(R.here>W.rain)W.rain=R.here;});
  A.rec('rainwall',{y0:R.y0,y1:R.y1,edge:R.edge,windward:R.windward,lee:R.lee,slope:R.slope,reach:R.reach,rain:R.rain,extent:R.extent,cell:R.cell,min:R.min,top:R.top,
   alpha:R.alpha,colour:R.colour,inside:R.inside,seed:R.seed,curtains:cells.length,
   note:'rain(x,z) = rain * band(ground in y0..y1, edge) * (lee + (1-lee) smoothstep(0, slope, windward rise over reach)); a curtain per cell (KRAND.hash(seed, ix, iz, k, 0x7261)) where rain >= min; under the eye it lifts W.rain (fx/89-atmos-fx-rainwall.js)'});
  return R;};
})();
