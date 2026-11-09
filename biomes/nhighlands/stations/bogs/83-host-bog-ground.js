// ================================================================= HOST — station 5, the bog country: the ground's colours and layers (84-host-ground.js's hooks)
// The kit's ground (84) paints by the kit's zones; on the mire it takes these instead, by the station's `bog` field (45-host-stage.js):
//   STATION_PAINT   the paint: sphagnum lawns (green, with red and ochre hummock patches by noise), black peat on the steep (the hags along the
//                   stream and the pools' cut lips), the dark wet of the lagg, the kit's forest floor kept on the knolls
//   STATION_GL      the three layer weights, per ground vertex: x the sphagnum (the open mire), y the peat (hags and pool lips), z the meadow (lagg)
//   STATION_GLY     the three KGROUND layers on them: the library's ground.sphagnum and ground.peat.black (materials.json; both in the library, owed to
//                   this station by PLAN-STATIONS.md; the sphagnum set is full colour, so it is drawn untinted), and the kit's meadow for the lagg's sedge
// No texture unit beyond station 1's three layers.
const STATION_PAINT=(function(){const SG=new THREE.Color(0x5e7a34),SG2=new THREE.Color(0x76863c),SR=new THREE.Color(0x8a3e2c),SO=new THREE.Color(0x9a7c40),
  PEAT=new THREE.Color(0x231a12),LAGG=new THREE.Color(0x3e4a2a),q=new THREE.Color();
 return(c,x,z,n,n2,n3,sl)=>{const b=FIELD.bog(x,z);if(b<=0)return;
  q.copy(SG).lerp(SG2,clamp(.5+n2*2.4,0,1)).lerp(SR,smooth(.14,.3,n3+n*.5)*.38).lerp(SO,smooth(.16,.34,-n3)*.25);   /* green-gold lawns, the red and ochre in patches (the first look read as an orange carpet) */
  c.lerp(q,smooth(.25,.7,b));
  c.lerp(LAGG,smooth(.2,.4,b)*(1-smooth(.45,.65,b))*.6);
  c.lerp(PEAT,smooth(.18,.45,sl)*.85);
  if(poolAt(x,z,1.5))c.lerp(PEAT,.9);};})();   /* the pools' floors black peat (a pale floor showed through the shallow water as grey) */
const STATION_GL=(x,z)=>{const b=FIELD.bog(x,z),s=FC.at(FC.a.slope,x,z);return[smooth(.4,.75,b)*(1-smooth(.2,.4,s)),smooth(.18,.4,s),smooth(.2,.4,b)*(1-smooth(.45,.7,b))];};
const STATION_GLY=()=>{const A=KGROUND.layer('nhighlands','ground.sphagnum',{w:'vGL.x',amt:.8,gain:.95}),
  B=KGROUND.layer('nhighlands','ground.peat',{w:'vGL.y',amt:.9,gain:1.0})   /* ground.peat.hag, the cut face (in the library since 2026-10-26) */,Cm=KGROUND.layer('nhighlands','ground.meadow',{w:'vGL.z',amt:.6,gain:1.1,tint:'diffuse'});
 return [A,B,Cm].filter(Boolean);};
// the steep on the mire is cut peat (the hags, the pools' lips), not station 1's granite: a GLSL colour (linear) for 84's steep faces
const STATION_STEEP='vec3(0.020,0.014,0.009)*(0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r)';
