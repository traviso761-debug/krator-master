// ---------- Lake Atitlán: what covers the land the map leaves bare ----------
// OpenStreetMap maps the towns round the lake closely and the land between them hardly at all, so the caldera's walls
// came out as bare ground. What is there: pine and oak forest on the steep and the high ground and up the volcanoes
// to near their tops; the milpas, the cornfields with beans and squash among the corn, in small plots on every slope
// a man can stand on, pale green or straw-coloured after the harvest; coffee under its shade trees low on the slopes
// above the shore; bare ash on Atitlán's cone. C.cover:
//   the colour  the ground's vertex colours outside the towns (C.cover.towns, [lat, lon, radius]) are repainted by
//               that rule, from the height over the lake, the slope and a hash of a field grid turned to the slope,
//               mixed by a value noise so the edge of the forest wanders; the mapped areas draw over it as before
//   the trees   on the forest cells, pines and broadleaves, a tile at a time (`tile` m) within `near` m of the camera
// None of it is in the layout fingerprint.
import {hash3} from '../core/rng.js';

export function cover(api){
  const {THREE,C,scene,P,groundH,inWater,animHooks,camera}=api;const K=C.cover;if(!K)return;
  const TOWNS=(K.towns||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];});
  const townK=(x,z)=>{let k=0;for(const [tx,tz,r] of TOWNS){const d=Math.hypot(x-tx,z-tz);if(d<r*1.25)k=Math.max(k,d<r?1:1-(d-r)/(r*0.25));}return k;};
  const vn=(x,z,s)=>{const X=x/s,Z=z/s,i=Math.floor(X),j=Math.floor(Z),fx=X-i,fz=Z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),
    a=hash3(i,j,91),b=hash3(i+1,j,91),c=hash3(i,j+1,91),d=hash3(i+1,j+1,91);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};
  const TL=C.treeLine||1800,FIELD=K.field||70,BARE=(C.bareGround||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];});
  const col=h=>new THREE.Color(h),FOREST=[col('#2a4a26'),col('#30522a'),col('#26442a')],COFFEE=col('#35602e'),
    MILPA=[col('#7a9044'),col('#8a9a4c'),col('#9a925a'),col('#6e8640'),col('#a49a62'),col('#5e7a3a')],CLIFF=col('#5e5848'),ASH=col('#6a645a'),SCRUB=col('#5a6a3a');
  // the cover at a point: 0 forest, 1 coffee, 2 milpa, 3 cliff, 4 bare, 5 scrub
  function kind(x,z,h,slope){if(BARE.some(([bx,bz,r])=>Math.hypot(x-bx,z-bz)<r)||h>TL+80)return 4;if(h>TL)return 5;if(slope>1.5)return 3;
    const n=vn(x,z,420)*0.7+vn(x,z,130)*0.3,steep=Math.min(1,slope/1.1);
    let forest=0.32+steep*0.45+Math.min(0.35,Math.max(0,(h-700)/1600));if(n<forest*0.85)return 0;
    if(h<380&&vn(x+911,z-377,260)<0.45)return 1;return 2;}
  // a field's colour: the plots are a grid of FIELD m cells, sheared by a hash so they do not line up across a slope
  const fieldCol=(x,z)=>{const i=Math.floor(x/FIELD+vn(x,z,300)*0.8),j=Math.floor(z/(FIELD*0.7)+vn(z,x,300)*0.8);return MILPA[Math.floor(hash3(i,j,92)*MILPA.length)];};
  const tmp=new THREE.Color();
  // inside a town the open ground is yards, gardens and beaten earth, not a lawn
  const TOWN=[col('#6a7444'),col('#7a7256'),col('#5e6a3e'),col('#86785a')];
  const paint=(x,z,y,slope,c)=>{if(y<0.5)return false;const t=townK(x,z),k=kind(x,z,y,slope);
    tmp.copy(k===0?FOREST[Math.floor(hash3(Math.floor(x/40),Math.floor(z/40),93)*3)]:k===1?COFFEE:k===2?fieldCol(x,z):k===3?CLIFF:k===4?ASH:SCRUB);
    if(t>0)tmp.lerp(TOWN[Math.floor(hash3(Math.floor(x/25),Math.floor(z/25),90)*TOWN.length)],t);
    tmp.multiplyScalar(0.92+vn(x,z,60)*0.16);c.lerp(tmp,K.strength===undefined?0.9:K.strength);return true;};
  // repaint every ground mesh the engine drew from the heightfield (and its levels of detail)
  let painted=0;const c=new THREE.Color();
  scene.traverse(m=>{if(!m.isMesh||!(m.name==='terrain'||/^terrain/.test(m.name))||!m.geometry.attributes.color)return;const g=m.geometry,p=g.attributes.position,cl=g.attributes.color,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=n?Math.max(0.05,Math.abs(n.getY(i))):1,slope=Math.sqrt(1-ny*ny)/ny;c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i));
      if(paint(x,z,y,slope,c)){cl.setXYZ(i,c.r,c.g,c.b);painted++;}}
    cl.needsUpdate=true;});
  // ---- the trees, near the camera ----
  const TILE=K.tile||400,NEAR=K.near||1300,SP=K.spacing||11;
  const pine=(()=>{const a=new THREE.CylinderGeometry(0.18,0.28,4,5).translate(0,2,0),b=new THREE.ConeGeometry(2.2,7,6).translate(0,7,0),c2=new THREE.ConeGeometry(1.6,5,6).translate(0,9.5,0);
      return merge([[a,'#5a4636'],[b,'#2e4e2a'],[c2,'#34562e']]);})(),
    broad=(()=>{const a=new THREE.CylinderGeometry(0.22,0.32,4.5,5).translate(0,2.25,0),b=new THREE.IcosahedronGeometry(3.2,0).scale(1,0.8,1).translate(0,6.5,0),c2=new THREE.IcosahedronGeometry(2.2,0).translate(1.4,7.8,0.6);
      return merge([[a,'#5a4a3a'],[b,'#3a5e2e'],[c2,'#426a34']]);})();
  function merge(list){const pos=[],cl=[];for(const [g,h] of list){const a=g.toNonIndexed().attributes.position.array,cc=new THREE.Color(h);for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);cl.push(cc.r,cc.g,cc.b);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));ge.computeVertexNormals();return ge;}
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),o=new THREE.Object3D(),tiles=new Map();let nTrees=0;
  const slopeAt=(x,z)=>{const e=6,a=groundH(x+e,z)-groundH(x-e,z),b=groundH(x,z+e)-groundH(x,z-e);return Math.hypot(a,b)/(2*e);};
  function build(T){const A=[],B=[];
    for(let j=0;j<TILE/SP;j++)for(let i=0;i<TILE/SP;i++){const x=T.x0+(i+hash3(i,j,T.k))*SP,z=T.z0+(j+hash3(j,i,T.k+1))*SP;
      if(townK(x,z)>0.2||inWater(x,z))continue;const h=groundH(x,z);if(h<1.5)continue;const k=kind(x,z,h,slopeAt(x,z));if(k!==0&&!(k===1&&hash3(x,z,94)<0.18)&&!(k===2&&hash3(x,z,95)<0.012))continue;
      const s=0.7+hash3(x,z,96)*0.7,hi=h>650||hash3(x,z,97)<0.4;o.position.set(x,h-0.3,z);o.rotation.set(0,hash3(x,z,98)*6.28,0);o.scale.set(s,s*(0.85+hash3(z,x,99)*0.4),s);o.updateMatrix();(hi?A:B).push(o.matrix.clone());}
    const g=new THREE.Group();for(const [list,geo] of [[A,pine],[B,broad]]){if(!list.length)continue;const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=true;im.userData.noFingerprint=true;g.add(im);nTrees+=list.length;}
    scene.add(g);T.g=g;}
  let next=0;
  animHooks.push(now=>{if(now<next)return;next=now+250;const p=camera.position,ci=Math.floor(p.x/TILE),cj=Math.floor(p.z/TILE),R=Math.ceil(NEAR/TILE),hh=p.y-groundH(p.x,p.z);let built=0;
    for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const k=(ci+di)+','+(cj+dj);if(!tiles.has(k)){const d=Math.hypot(di,dj)*TILE;if(d>NEAR+TILE||hh>NEAR*1.6||built>=2)continue;tiles.set(k,{x0:(ci+di)*TILE,z0:(cj+dj)*TILE,k:(ci+di)*7919+(cj+dj)*104729,g:null});build(tiles.get(k));built++;}}
    for(const T of tiles.values())if(T.g){const d=Math.hypot(T.x0+TILE/2-p.x,T.z0+TILE/2-p.z);T.g.visible=d<NEAR+TILE&&hh<NEAR*1.6;}
    api.ctx.details.cover={painted,tiles:tiles.size,trees:nTrees};});
  api.ctx.details=Object.assign(api.ctx.details||{},{cover:{painted,tiles:0,trees:0}});
}
