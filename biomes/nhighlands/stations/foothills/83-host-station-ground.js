// ================================================================= HOST — station 3, the Mediterranean foothills: the ground's colours and layers (84-host-ground.js's hooks)
// Replaces station 2's file of the same name. The paint: straw-gold annual grass on the rolling slopes, the chaparral's red-brown soil between dark scrub
// on the sunny steep, green along the creek. Three KGROUND layers (materials.json, this station's page only): x golden grass (ground.withered_grass), y the
// chaparral's soil (ground.redsoil), z the creek's grass (ground.grass.lush).
const STATION_PAINT=(function(){const GOLD=new THREE.Color(0xc0a458),GOLD2=new THREE.Color(0xa88e4a),SOIL=new THREE.Color(0x8a5a3a),CREEK=new THREE.Color(0x5e7e34),q=new THREE.Color();
 return(c,x,z,n,n2,n3,sl)=>{const ch=FIELD.chaparral(x,z),rp=FC.at(FC.a.flow,x,z);
  q.copy(GOLD).lerp(GOLD2,clamp(.5+n2*2.4,0,1));c.lerp(q,.9);
  c.lerp(q.copy(SOIL).lerp(GOLD2,clamp(.5+n3*2,0,.5)),smooth(.3,.7,ch)*.75);
  c.lerp(CREEK,smooth(.35,.8,rp)*.85);};})();
const STATION_GL=(x,z)=>{const ch=FIELD.chaparral(x,z),rp=FC.at(FC.a.flow,x,z);return[(1-smooth(.3,.6,ch))*(1-smooth(.3,.7,rp)),smooth(.3,.7,ch)*(1-rp),smooth(.35,.75,rp)];};
const STATION_GLY=()=>[KGROUND.layer('nhighlands','ground.goldgrass',{w:'vGL.x',amt:.8,gain:1.0}),KGROUND.layer('nhighlands','ground.chaparral',{w:'vGL.y',amt:.75,gain:1.0}),
 KGROUND.layer('nhighlands','ground.lush',{w:'vGL.z',amt:.7,gain:1.0,tint:'diffuse'})].filter(Boolean);
const STATION_STEEP='vec3(0.36,0.27,0.19)*(0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r)';   /* cut banks of the hills' red-brown soil and rock */
