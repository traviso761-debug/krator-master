// ================================================================= HOST — the ground: a paved plain, BIO.init  [web]
// A test bed, not a place: flat, so that nothing but the buildings is measured. The valley's ground comes with the valley.
BIO.init({tags:'metropolis',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>1,obstacles:[],ticks:tick,seed:73,origin:[[0,0]],center:[0,0],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:300,mid:1000,far:3200,floor:[200,480]},windows:{}});
BIO.setSun(SUN_POS);BIO.LOD.fade=.15;
const GROUND=(function(){const P=KMAT.packed('metropolis','pave'),g=new THREE.PlaneGeometry(16000,16000);g.rotateX(-Math.PI/2);
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*16000/12,uv.getY(i)*16000/12);
 const T=P?KMAT.textures(P,{aniso:8}):{},m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,roughness:.95,metalness:0,color:0x9a9a92}));m.name='ground';scene.add(m);return m;})();
