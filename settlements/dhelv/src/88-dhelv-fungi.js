// prefix: dhu
// ================================================================= DHELV: THE TUNNELS' FUNGI (the owner: "add some fungal flora to the tunnels"). [web]
// The Throne kit's own cave pass (THRONE.buildCave: the lava tube station's dark floor: glow mushrooms, specimen and alien
// mushroom cards, scale cones, lichen, a stone), planted along every carved way (the tubes, the braid, the ramps, the scouts'
// ways) in a band along each wall's foot (DHU.band: metres in from the floor's edge, past the reach of a clump's spread into the wall's
// fillet), the middle left to the walkers, and off each way's
// ends (its junctions). One pass a way, the kit's host swapped for it: its ground the way's floor (the layout's line, as the
// cavern carves it), its 'cave' field the band. Baked with the wells' floors and drawn as the underground is (89, 90).
const DHU={band:[1.4,3.4],end:6,kinds:{tube:1,braid:1,ramp:1,secret:1},out:null};
function dhFungi(tq){if(typeof THRONE==='undefined'||!THRONE.buildCave)return null;const t0=performance.now(),H=BIO.host,B=DH.byId;
 const keep={t:H.terrainH,m:H.mask,f:H.fields,o:H.origin,c:H.center,ob:H.obstacles},out={ways:0,m:0,ms:0};
 const lit=(x,z)=>Math.hypot(x-DH.HALL.c[0],z-DH.HALL.c[1])<DH.HALL.rx+5&&Math.hypot((x-DH.HALL.c[0])/DH.HALL.rx,(z-DH.HALL.c[1])/DH.HALL.rz)<1.03||DH.PITS.some(P=>Math.hypot(x-P.c[0],z-P.c[1])<P.r+4);
 H.obstacles=[];
 try{for(const e of DH.EDGES){if(!DHU.kinds[e.kind]||e.door)continue;const a=B[e.a],b=B[e.b];if(DH.plateauD(a.x,a.z)<0&&DH.plateauD(b.x,b.z)<0&&e.kind!=='tube')continue;   /* the apron's paths: on the ground */
   const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);if(L<2*DHU.end+4)continue;const ux=dx/L,uz=dz/L,hw=Math.max(.8,((e.w||4)-.6)/2);
   /* where a point is on this way: its run along it (t, metres) and its offset across it */
   const at=(x,z)=>{const t=(x-a.x)*ux+(z-a.z)*uz,o=-(x-a.x)*uz+(z-a.z)*ux;return [t,o];};
   const band=(x,z)=>{const [t,o]=at(x,z),f=hw-Math.abs(o);return t>DHU.end&&t<L-DHU.end&&f>DHU.band[0]&&f<Math.min(DHU.band[1],hw*.7)&&!lit(x,z);};
   H.terrainH=(x,z)=>{const t=Math.max(0,Math.min(L,at(x,z)[0]));return a.y+(b.y-a.y)*t/L;};
   H.mask=(x,z)=>band(x,z)?1:0;H.fields={cave:(x,z)=>band(x,z)?1:0,slope:()=>.4,rock:()=>.7,humid:()=>1,wet:()=>.9};
   const c=[(a.x+b.x)/2,(a.z+b.z)/2];H.center=c;H.origin=[c];BIO.cur='throne/floor';THRONE.buildCave(L/2+hw+2,tq*6);   /* a narrow band: six times the kit's density (the owner: denser) */out.ways++;out.m+=L;}}
 catch(e){reportErr('the tunnels’ fungi: '+(e.stack||e));}
 finally{BIO.cur=null;H.terrainH=keep.t;H.mask=keep.m;H.fields=keep.f;H.origin=keep.o;H.center=keep.c;H.obstacles=keep.ob;}
 out.m=Math.round(out.m);out.ms=Math.round(performance.now()-t0);return DHU.out=out;}
/* the page's check (91): every fungus (an instance of the underground's bake, the wells' hills' plants apart) stands on a carved
   floor, within 0.6 m of the walk map's floor under it; lift raises them all (the negative) */
function dhuOnFloors(lift){const bad=[],v=new THREE.Vector3(),M=new THREE.Matrix4();let n=0;
 scene.traverse(m=>{if(!m.isInstancedMesh||!m.userData.under)return;for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);v.setFromMatrixPosition(M);v.y+=lift||0;
   if(DH.HILLS.some(H=>Math.hypot(v.x-H.c[0],v.z-H.c[1])<H.r+15))continue;n++;   /* (the hills' pass plants their rims' walls too) */
   const f=KWALK.floorBelow(v.x,v.z,v.y+.5,.6);if(!f||Math.abs(f[0]-v.y)>.6)bad.push(v.x.toFixed(0)+' '+v.y.toFixed(1)+' '+v.z.toFixed(0));}});
 return {n,bad};}
