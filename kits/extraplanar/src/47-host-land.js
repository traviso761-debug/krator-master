// ================================================================= HOST — the ground: a plain with a gentle swell, BIO.init  [web]
// A test bed, not a place. The swell (35 cm over 60 m) is there so the feet check walks over ground that is not flat: a planted
// foot must sit on terrainH wherever it lands. The valley's ground comes with the valley.
function terrainH(x,z){return .35*Math.sin(x*.11)*Math.cos(z*.09)+.12*Math.sin(x*.31+z*.17);}
BIO.init({tags:'extraplanar',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>1,obstacles:[],ticks:tick,seed:4409,origin:[[60,0]],center:[60,0],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:300,mid:1000,far:3200,floor:[200,480]},windows:{}});
/* BIO.setSun is the foliage fragment's (30-core-foliage.js), which this page does not take: no leaves to light */
const GROUND=(function(){const N=160,S=1200,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position;
 /* the mesh is centred on the lanes (x 60); terrainH is read in world x, z, so each vertex is displaced at its world position */
 for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i)+60,p.getZ(i)));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x6f6a62,roughness:.96,metalness:0}));m.name='ground';m.receiveShadow=true;m.position.set(60,0,0);
 scene.add(m);return m;})();
