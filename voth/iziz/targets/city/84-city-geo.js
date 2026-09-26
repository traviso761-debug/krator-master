// ================================================================= IZIZ CITY — geometry (target: city)
// Everything about WHERE things are: the wall, the gates, the three hills, the precinct discs, the terrain function.
// Metres; x east, z south (+z is toward the painting's viewer, the south gate is the painting's approach).
window.CITY=true;
const CITY={
 WORLD:1900,                 // side of the terrain plane
 PLATEAU:18,CHASM:-16,       // the plateau stands 34 m above the moat floor
 R:470,                      // mean wall radius: 4x the old map's area
 GATES:[90,200,315,30].map(d=>d*Math.PI/180),
 // the three hills: palace (largest), temple, arena. Each is a MESA: a level top of radius r0 standing H above the
 // plateau, an escarpment E metres wide (rock, unbuildable), then a gentle skirt. `ring` is the ring road's radius,
 // just past the escarpment's foot; `gate` is the bearing (rad) of the ramp up, toward the city centre.
 HILLS:{
  palace:{x:200,z:-130,H:40,r0:96,E:34,ring:144},
  temple:{x:266,z:168,H:27,r0:94,E:26,ring:134},
  arena:{x:-240,z:20,H:23,r0:92,E:26,ring:130}},
 SPACEPORT_A:315*Math.PI/180,SPACEPORT_R:760,SPACEPORT_H:4,SPACEPORT_RAD:94,
 QUALITY:1,                  // scales counts (biome, folk); 1 = the artifact
};
const GATES=CITY.GATES;
const FRAME_HOOKS_PRE=[];   // per-frame fns registered before 90-scene defines FRAME_HOOKS (the biome's wind tick); 90b moves them over
const SEED_CITY=424242;
function polar(x,z){return{r:Math.hypot(x,z),t:Math.atan2(z,x)};}
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
// the wall: the old Iziz outline, doubled, straight and flush around each gatehouse
function wallRaw(t){return CITY.R+44*Math.sin(3*t+1)+20*Math.sin(7*t+2)+12*Math.sin(11*t);}
function wallR(t){let r=wallRaw(t);for(const g of GATES){const d=angDiff(t,g);if(d<.18){const k=1-smoothstep(.03,.18,d);r=r*(1-k)+wallRaw(g)*k;}}return r;}
function gatePos(g){const R=wallR(g);return[R*Math.cos(g),R*Math.sin(g)];}
// hills: mesa profile (1 on top, S-curve down the escarpment) or the skirt, whichever is higher; plus the ramp
// corridor up the gate bearing (20 m wide, rising over ~E+40 m so the road is steep but walkable)
for(const k in CITY.HILLS){const H=CITY.HILLS[k];H.gate=Math.atan2(-H.z,-H.x);H.top=CITY.PLATEAU+H.H;}
function hillProfile(H,x,z){const dx=x-H.x,dz=z-H.z,r=Math.hypot(dx,dz);
 const u=1-smoothstep(H.r0,H.r0+H.E,r);const skirt=.30*Math.exp(-Math.pow(Math.max(0,r-H.r0-H.E*.5)/85,2));
 let f=Math.max(u,skirt);
 // ramp: along the gate bearing, from the skirt (r0+E+36) up to the top (r0-4)
 const along=dx*Math.cos(H.gate)+dz*Math.sin(H.gate),perp=Math.abs(-dx*Math.sin(H.gate)+dz*Math.cos(H.gate));
 if(along>0&&perp<16){const t=clamp((H.r0+H.E+36-r)/(H.E+40),0,1);const ramp=Math.max(skirt,t);const w=1-smoothstep(10,16,perp);f=Math.max(f,ramp*w+f*(1-w));}
 return f;}
function hillH(x,z){let h=0;for(const k in CITY.HILLS)h+=CITY.HILLS[k].H*hillProfile(CITY.HILLS[k],x,z);return h;}
function hillTop(x,z){let u=0;for(const k in CITY.HILLS){const H=CITY.HILLS[k];u=Math.max(u,1-smoothstep(H.r0-6,H.r0,Math.hypot(x-H.x,z-H.z)));}return u;}
// level platforms blended into the base (pads for the amphitheatre etc.); filled in by 87-city-layout via cityFlat()
const FLATS=[];
const FLATCELL=64,FLATGRID={};
function cityFlat(x,z,r,apron,h){const f=[x,z,r,apron,h];FLATS.push(f);const R=r+apron;
 for(let i=Math.floor((x-R)/FLATCELL);i<=Math.floor((x+R)/FLATCELL);i++)for(let j=Math.floor((z-R)/FLATCELL);j<=Math.floor((z+R)/FLATCELL);j++)(FLATGRID[i+','+j]||(FLATGRID[i+','+j]=[])).push(f);}
// the terrain function. Replaces the kit's flat one (a function binding is reassignable; build.py sees no redeclaration).
const SPORT={x:CITY.SPACEPORT_R*Math.cos(CITY.SPACEPORT_A),z:CITY.SPACEPORT_R*Math.sin(CITY.SPACEPORT_A)};
function terrainBase(x,z){const p=polar(x,z),R=wallR(p.t),ro=p.r-R;
 const jungle=1+4*fbm(x*.006,z*.006,1.3,3)+1.5*fbm(x*.025,z*.025,4.1,2);
 let h;
 if(ro<4){h=CITY.PLATEAU+hillH(x,z)*(1-smoothstep(-12,4,ro))+.8*fbm(x*.03,z*.03,2.2,2)*(1-hillTop(x,z));}
 else{const down=smoothstep(4,11,ro),up=smoothstep(30,48,ro);h=CITY.PLATEAU*(1-down)+CITY.CHASM*down*(1-up)+jungle*up;h+=(down*(1-up))*3*fbm(x*.08,z*.08,5.5,2);}
 for(const g of GATES){const along=x*Math.cos(g)+z*Math.sin(g),perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g));
  if(perp<16&&along>R+38){const ramp=CITY.PLATEAU*(1-smoothstep(R+40,R+190,along))+jungle*smoothstep(R+40,R+190,along);const w=1-smoothstep(11,16,perp);h=Math.max(h,ramp*w+h*(1-w));}}
 {const d=Math.hypot(x-SPORT.x,z-SPORT.z);if(d<CITY.SPACEPORT_RAD+24){const f=1-smoothstep(CITY.SPACEPORT_RAD+2,CITY.SPACEPORT_RAD+24,d);h=h*(1-f)+CITY.SPACEPORT_H*f;}}
 return h;}
terrainH=function(x,z){let h=terrainBase(x,z);const L=FLATGRID[Math.floor(x/FLATCELL)+','+Math.floor(z/FLATCELL)];if(L)for(const f of L){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]+f[3]){const k=1-smoothstep(f[2],f[2]+f[3],d);h=h*(1-k)+f[4]*k;}}return h;};
// inside the wall (with a margin), on the plateau
function insideWall(x,z,margin){const p=polar(x,z);return p.r<wallR(p.t)-(margin||0);}
function nearestHill(x,z){let best=null,bd=1e9;for(const k in CITY.HILLS){const H=CITY.HILLS[k];const d=Math.hypot(x-H.x,z-H.z)-H.ring;if(d<bd){bd=d;best=k;}}return{key:best,d:bd};}
// a point on the hill's ring road / top at bearing a
function hillPt(H,a,r){return[H.x+r*Math.cos(a),H.z+r*Math.sin(a)];}
// a point at a fraction of the wall radius along bearing a (rad)
function radial(a,frac){return[wallR(a)*frac*Math.cos(a),wallR(a)*frac*Math.sin(a)];}
