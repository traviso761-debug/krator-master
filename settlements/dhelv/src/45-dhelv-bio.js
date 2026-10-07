// prefix: dhb
// ================================================================= DHELV: THE BIOME HOST (P5b). The kipuka's old growth is the HYPERJUNGLE kit's, read
// in place (biomes/hyperjungle/src, wrapped by build.py so its helper globals stay its own). Bound here, before the kit
// loads (it reads BIO.host.THREE then); the scene arrives with the page (BIO.setScene in 90) and the build runs with the world.
// Where it may root (the MASK): the kipuka's floor, less the outpost's clearing inside its palisade, the stream's banks, the
// pasture, and the foot of the old cone's cliff (no tree on a cliff); every outpost building is an obstacle (none in a building).
const DHB={obstacles:[],seed:41};
DHB.mask=function(x,z){const K=DH.KIPUKA,dk=Math.hypot(x-K.c[0],(z-K.c[1])*1.3)/K.r;if(dk>.97)return 0;
 if(x>DH.CONE.cliffX-8)return 0;   /* the cliff's foot and the cliff itself */
 const P=DH.PAL;if(Math.hypot(x-P.c[0],z-P.c[1])<P.r+10||(x>P.c[0]&&Math.abs(z)<P.r+10))return 0;   /* the clearing, to the cliff */
 for(let i=1;i<DH.STREAM.length;i++){const a=DH.STREAM[i-1],b=DH.STREAM[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));
  if(Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z)<6)return 0;}
 const Q=DH.PASTURE;let inside=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){if(((Q[i][1]>z)!==(Q[j][1]>z))&&(x<(Q[j][0]-Q[i][0])*(z-Q[i][1])/(Q[j][1]-Q[i][1])+Q[i][0]))inside=!inside;}
 if(inside)return 0;
 return Math.min(1,(.97-dk)/.06);};
for(const s of DH.SITES){if(s.district!=='outpost')continue;const F=DH.FOOT[s.key];if(!F)continue;DHB.obstacles.push({x:s.x,z:s.z,r:Math.hypot(F[0],F[1])/2+2,y0:s.y-2,y1:s.y+40});}
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>DH.groundY(x,z),mask:(x,z)=>DHB.mask(x,z),obstacles:DHB.obstacles,seed:DHB.seed,
 origin:[DH.KIPUKA.c.slice()],center:DH.KIPUKA.c.slice(),err:m=>console.warn('biome: '+m),lod:{hero:280,mid:760,far:2400,floor:[250,620]}});
/* the forest planted with the world (90's buildWorld, after the buildings): the kit's trees, saplings and floor over the kipuka,
   baked once into the scene. ?noforest leaves it out, ?q= scales its counts */
function dhbForest(){if(typeof HYPERJUNGLE==='undefined'||new URLSearchParams(location.search).has('noforest'))return null;
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1.8,t0=performance.now();BIO.setScene(scene);   /* 1.8: a few giants round the clearing (the kit's 165 m spacing) and a dense understory */
 try{DHB.out=HYPERJUNGLE.build({R:470,quality:q,heroR:265,fauna:false});}catch(e){reportErr('hyperjungle: '+(e.stack||e));return null;}
 const b=BIO.bake();DHB.out.instances=b.inst;DHB.out.calls=b.calls;DHB.out.ms=Math.round(performance.now()-t0);return DHB.out;}
/* every tree's foot: on the kipuka's floor where the mask lets it root, not on the cliff or a slope, not in a building */
function dhbTreesOk(trees){const bad=[];for(const T of trees){const m=DHB.mask(T.x,T.z),g=DH.groundY,sl=Math.max(Math.abs(g(T.x+1,T.z)-g(T.x-1,T.z)),Math.abs(g(T.x,T.z+1)-g(T.x,T.z-1)))/2;
  const ob=DHB.obstacles.find(o=>Math.hypot(T.x-o.x,T.z-o.z)<o.r);if(m<=0||sl>.6||ob)bad.push(T.x.toFixed(0)+','+T.z.toFixed(0)+(m<=0?' (off its ground)':sl>.6?' (on a slope)':' (in a building)'));}
 return bad;}
