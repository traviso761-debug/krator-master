// ================================================================= HOST — the ground: a paved plain, BIO.init  [web]
// A test bed, not a place: flat, so that nothing but the buildings is measured. The valley's ground comes with the valley.
BIO.init({tags:'metropolis',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>1,obstacles:[],ticks:tick,seed:73,origin:[[0,0]],center:[0,0],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:300,mid:1000,far:3200,floor:[200,480]},windows:{}});
BIO.setSun(SUN_POS);BIO.LOD.fade=.15;
const GROUND=(function(){const P=KMAT.packed('metropolis','pave'),g=new THREE.PlaneGeometry(16000,16000);g.rotateX(-Math.PI/2);
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*16000/12,uv.getY(i)*16000/12);
 const T=P?KMAT.textures(P,{aniso:8}):{},m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,roughness:.95,metalness:0,color:0x9a9a92}));m.name='ground';scene.add(m);return m;})();
// the sun's shadows (core/shadow; the owner, 2026-11-03): one box that follows the view, 90 m round a walker to 600 m from high up. The heroes, the
// open storeys and the near rubble cast and take them; the baked shells and the impostors draw their own light and take none. Off by default (the owner,
// 2026-11-03: toggleable, off, in every build): the panel's 'shadows' button or ?shadow=1 turns them on; ?noshadow leaves the box out altogether
MP.shadow=/[?&]noshadow/.test(location.search)?null:KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
if(MP.shadow)GROUND.receiveShadow=true;
