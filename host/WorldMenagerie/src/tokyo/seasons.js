// ---------- Tokyo's seasons: cherry blossom and the ginkgo ----------
// The trees Tokyo turns out to look at. Cherries (Somei-yoshino) line both banks of the Meguro river, the path along
// the Chidorigafuchi moat, Ueno Park's main avenue and Sumida Park; four rows of ginkgo make Icho Namiki at Gaien.
// The season picks how they look:
//   spring  the cherries in full bloom, pale pink, petals on the ground, and after dark lit from below (yozakura)
//   summer  everything green
//   autumn  the ginkgo gold with a gold carpet under them, the cherry leaves turned rust
// It comes from the date (late March to mid-April is spring, mid-November to mid-December autumn), from #season= in
// the address, or from the button at the bottom left, which goes round the three.
// C.seasons: {cherries: {name: [[lat, lon], ...] or "river:<name>"}, ginkgo: [[lat, lon], [lat, lon]], spacing}.
export function seasons(api){
  const {THREE,C,scene,animHooks,camera,nightF,hour,groundH}=api;const K=C.seasons;if(!K)return;
  const core=(C.metro&&C.metro.core||[])[0],inCore=(x,z)=>{if(!core)return true;const [la,lo]=api.toLatLon(x,z);return la>core[0]&&la<core[2]&&lo>core[1]&&lo<core[3];};
  const ground=(x,z)=>inCore(x,z)?groundH(x,z):(api.METRO_GH?api.METRO_GH(x,z):groundH(x,z));
  const SP=K.spacing||8;let seed=17;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // a line of trees along a polyline, offset to one side (metres), one every SP metres, a little irregular
  const trees=[];
  const along=(pts,off,kind,step=SP)=>{for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.5)continue;const ux=(bx-ax)/L,uz=(bz-az)/L;
      for(let u=R()*step;u<L;u+=step*(0.85+R()*0.3)){const x=ax+ux*u-uz*off,z=az+uz*u+ux*off;trees.push({x,z,kind,s:0.8+R()*0.45,ry:R()*6.28,y:null});}}};
  const line=v=>typeof v==='string'&&v.startsWith('river:')?((C.rivers||{})[v.slice(6)]||[]).map(p=>api.P(p)):v.map(p=>api.P(p));
  for(const [name,spec] of Object.entries(K.cherries||{})){if(name==='_')continue;const pts=line(spec.line||spec),offs=spec.offsets||[0];for(const o of offs)along(pts,o,'cherry',spec.spacing||SP);}
  if(K.ginkgo){const pts=K.ginkgo.map(p=>api.P(p));for(const o of [-13,-6,6,13])along(pts,o,'ginkgo',9);}
  // ---- the meshes: trunks, canopies (a cherry's round and wide, a ginkgo's a tall cone), and the carpet under them ----
  const nC=trees.filter(t=>t.kind==='cherry').length,nG=trees.length-nC;
  const trunkG=new THREE.CylinderGeometry(0.22,0.32,3.2,6).translate(0,1.6,0),cherryG=new THREE.IcosahedronGeometry(1,1).scale(4.2,2.6,4.2).translate(0,4.6,0),ginkgoG=new THREE.ConeGeometry(2.8,9,8).translate(0,7,0),carpetG=new THREE.CircleGeometry(4.6,10).rotateX(-Math.PI/2).translate(0,0.06,0);
  const trunkM=new THREE.MeshLambertMaterial({color:0x4a3a30}),cherryM=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x000000}),ginkgoM=new THREE.MeshLambertMaterial({color:0xffffff}),carpetM=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const mk=(g,m,n,cast)=>{const im=new THREE.InstancedMesh(g,m,Math.max(1,n));im.castShadow=!!cast;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);return im;};
  const trunks=mk(trunkG,trunkM,trees.length,true),cher=mk(cherryG,cherryM,nC,true),ging=mk(ginkgoG,ginkgoM,nG,true),carpet=mk(carpetG,carpetM,trees.length,false);
  const d=new THREE.Object3D(),FAR=K.far||2500;
  function place(){const cx=camera.position.x,cz=camera.position.z;let it=0,ic=0,ig=0,ip=0;const showCarpet=SEASON!=='summer';
    for(const t of trees){if((t.x-cx)**2+(t.z-cz)**2>FAR*FAR)continue;const y=ground(t.x,t.z);d.position.set(t.x,y,t.z);d.rotation.set(0,t.ry,0);d.scale.setScalar(t.s);d.updateMatrix();
      trunks.setMatrixAt(it++,d.matrix);if(t.kind==='cherry')cher.setMatrixAt(ic++,d.matrix);else ging.setMatrixAt(ig++,d.matrix);
      if(showCarpet&&(SEASON==='spring'?t.kind==='cherry':t.kind==='ginkgo'))carpet.setMatrixAt(ip++,d.matrix);}
    trunks.count=it;cher.count=ic;ging.count=ig;carpet.count=ip;for(const im of [trunks,cher,ging,carpet])im.instanceMatrix.needsUpdate=true;}
  // ---- the season ----
  const LOOK={spring:{cherry:'#f6cdd8',ginkgo:'#7aa04a',carpet:'#f8d8e2'},summer:{cherry:'#4f7a3e',ginkgo:'#6a9a42',carpet:'#000000'},autumn:{cherry:'#b4602e',ginkgo:'#f2c418',carpet:'#f0c020'}};
  const fromDate=()=>{const d0=new Date(),m=d0.getMonth()+1,day=d0.getDate(),md=m*100+day;return md>=320&&md<=415?'spring':md>=1110&&md<=1215?'autumn':'summer';};
  let SEASON=((/(^|&)season=(spring|summer|autumn|sakura)/.exec(api.HASH0||'')||[])[2]||fromDate()).replace('sakura','spring');
  const setSeason=s=>{SEASON=s;const L=LOOK[s];cher.material.color.set(L.cherry);ging.material.color.set(L.ginkgo);carpet.material.color.set(L.carpet);place();
    btn.textContent={spring:'🌸 Spring: sakura',summer:'🌿 Summer',autumn:'🍂 Autumn: ginkgo'}[s];api.ctx.details.season=s;};
  const btn=document.createElement('button');btn.type='button';
  btn.style.cssText='position:fixed;left:12px;bottom:12px;z-index:11;background:rgba(8,14,22,.82);color:#e8eef2;border:1px solid #5a7088;border-radius:4px;padding:5px 10px;font:12px Georgia,serif;cursor:pointer';
  btn.onclick=()=>setSeason({spring:'summer',summer:'autumn',autumn:'spring'}[SEASON]);document.body.appendChild(btn);
  setSeason(SEASON);
  // re-placed as the camera moves and the streamed ground arrives under them; the blossom lit after dark in spring
  let last=0;animHooks.push(now=>{if(now-last>1500){last=now;place();}const n=SEASON==='spring'?nightF(hour()):0;cher.material.emissive.setRGB(n*0.42,n*0.3,n*0.34);});
  api.ctx.details=Object.assign(api.ctx.details||{},{cherryTrees:nC,ginkgoTrees:nG});
}
