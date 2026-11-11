// ================================================================= HOST — station 2, the dry-summer montane: the ground's colours and layers (84-host-ground.js's hooks)
// The kit's paint (84) is the wet forest's moss and litter; here: straw-gold bunchgrass in the open park, brown needle litter under the trees (the canopy's
// shade, which 84 bakes, darkens it), green meadows in the wet flats, pale sandstone on the domes and steps, charcoal in the old burns. Three KGROUND
// layers on the three weights (STATION_GL): x needle litter (ground.needles), y golden grass (ground.withered_grass), z sandstone slab (ground.slickrock),
// all from the library (materials.json `ground.needles`, `ground.goldgrass`, `ground.slab`), packed into this station's page only.
// Stations 3 and 4 replace this file (the same name) with their own.
const STATION_PAINT=(function(){const GOLD=new THREE.Color(0xa8904e),GOLD2=new THREE.Color(0x8e7a42),LIT=new THREE.Color(0x6a5232),MEAD=new THREE.Color(0x5e7e34),
  SAND=new THREE.Color(0xb8a486),SAND2=new THREE.Color(0x9a8468),CHAR=new THREE.Color(0x3a3430),q=new THREE.Color();
 return(c,x,z,n,n2,n3,sl)=>{const m=FIELD.meadow(x,z),d=FIELD.dome(x,z),f=FIELD.fire(x,z);
  q.copy(GOLD).lerp(GOLD2,clamp(.5+n2*2.4,0,1)).lerp(LIT,smooth(-.05,.25,n3)*.45);c.lerp(q,.85);
  c.lerp(MEAD,smooth(.25,.6,m)*.9);
  if(f>0)c.lerp(CHAR,f*.45*smooth(-.1,.2,n2));
  c.lerp(q.copy(SAND).lerp(SAND2,clamp(.5+n3*3,0,1)),Math.max(smooth(.3,.7,d),smooth(.6,1.0,sl))*.9);};})();
const STATION_GL=(x,z)=>{const m=FIELD.meadow(x,z),d=FIELD.dome(x,z),s=FC.at(FC.a.slope,x,z),o=FIELD.open(x,z);
 return[(1-m)*(1-d)*smooth(.75,.35,o)*.8,(1-m)*(1-d)*smooth(.25,.65,o),Math.max(smooth(.35,.75,d),smooth(.6,1,s))];};
const STATION_GLY=()=>[KGROUND.layer('nhighlands','ground.needles',{w:'vGL.x',amt:.7,gain:1.0,tint:'diffuse'}),KGROUND.layer('nhighlands','ground.goldgrass',{w:'vGL.y',amt:.75,gain:1.0}),
 KGROUND.layer('nhighlands','ground.slab',{w:'vGL.z',amt:.85,gain:1.05})].filter(Boolean);
// the steep: bare sandstone (a GLSL colour, linear), in place of station 1's granite bands; the slab paint's own colour, so the edge of the steep
// does not draw the ground mesh's triangles as a sawtooth (the first look)
const STATION_STEEP='vec3(0.48,0.38,0.25)*(0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r)';
