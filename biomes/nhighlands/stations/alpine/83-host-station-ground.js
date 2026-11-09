// ================================================================= HOST — station 4, the alpine: the ground's colours and layers (84-host-ground.js's hooks)
// Replaces station 2's file of the same name. The paint: the fell-field's grey-green lichen and stone, the tree line's heath, the talus's grey blocks, the
// snowbeds white (84's own snow by `cold` adds the rest). Four KGROUND layers: x fell-field (ground.tundra), y scree (ground.gravel042), z snowbed
// (ground.snow.drift), and the crater wall's megabreccia on the steep (station 1's `clast` layer, with the library's rock.megabreccia as its grain):
// this station stands on the impact province (44z).
const STATION_PAINT=(function(){const FELL=new THREE.Color(0x7a7c66),FELL2=new THREE.Color(0x8a8670),HEATH=new THREE.Color(0x5a5a3e),SCREE=new THREE.Color(0x8a8780),SNOW=new THREE.Color(0xe8eef4),q=new THREE.Color();
 return(c,x,z,n,n2,n3,sl)=>{const tl=FIELD.talus(x,z),sb=FIELD.snowbed(x,z),fe=FIELD.fell(x,z);
  q.copy(FELL).lerp(FELL2,clamp(.5+n2*2.4,0,1)).lerp(HEATH,smooth(.9,.82,FIELD.cold(x,z))*.6);c.lerp(q,.8);
  c.lerp(SCREE,smooth(.3,.7,tl)*.85);c.lerp(SNOW,smooth(.35,.7,sb)*.9);void fe;};})();
const STATION_GL=(x,z)=>{const tl=FIELD.talus(x,z),sb=FIELD.snowbed(x,z);return[(1-smooth(.3,.6,tl))*(1-smooth(.3,.6,sb))*.85,smooth(.3,.7,tl),smooth(.35,.7,sb)];};
const STATION_GLY=()=>{const L=[KGROUND.layer('nhighlands','ground.fell',{w:'vGL.x',amt:.75,gain:1.0}),KGROUND.layer('nhighlands','ground.scree',{w:'vGL.y',amt:.85,gain:1.0}),
  KGROUND.layer('nhighlands','ground.snowbed',{w:'vGL.z',amt:.9,gain:1.0})].filter(Boolean);
 const BRG=KGROUND.layer('nhighlands','rock.megabreccia',{});
 L.push({map:BRG?BRG.map:undefined,k:BRG?BRG.k:undefined,kind:'clast',w:'smoothstep(0.42,0.75,1.0-clamp(normalize(vGWN).y,0.0,1.0))',amt:.9,gain:.82,size:7,matrix:.07,sub:.2,fleck:.05,fleckDensity:.25,
  palette:BRECCIA_KINDS.blocks,matrixColor:BRECCIA_KINDS.matrix,vary:.12,seed:KRAND.hash(86078,0,1,7)%997,name:'megabreccia (clast)'});
 return L;};
