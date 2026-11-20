// ---------- Barcelona: the palms ----------
// The plane trees are the engine's (treeSpecies); the palms are the city's own, and they stand where they were
// planted, not scattered: the Canary date palms and the tall Washingtonias along the seafront promenade, the Passeig
// de Colom and the Moll de la Fusta, the Passeig de Lluís Companys up to the Arc de Triomf, and in the Plaça Reial.
// Config "palms": {"roads": [names], "squares": [names], "spacing": m, "far": m}: along each named road both sides at
// the spacing, where the ground is clear (not water, a building or another road); in each named square, a grid.
// Drawn as instances of two palms (date and fan), in tiles so the far ones are culled. Map data (c) OpenStreetMap
// contributors, ODbL.
import {mkRng} from '../core/rng.js';

export function palms(api){
  const {THREE,C,scene,ROADS,AREAS,buildingsAt,inPoly,inWater,roadsNear,groundH}=api;const K=C.palms;if(!K)return;
  const R=mkRng(1888),SP=K.spacing||11,ROADSET=new Set(K.roads||[]),SQ=new Set(K.squares||[]);
  // one unit tall: a trunk, ringed, and a head of fronds drooping out from the crown (date palm: long, arching,
  // many; Washingtonia: a tight round fan head on a slim trunk); coloured by vertex, trunk and crown in one geometry
  function palm(kind){const parts=[];const add=(g,c)=>{g=g.toNonIndexed();g.deleteAttribute('uv');const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(c,i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
    const fan=kind==='fan',tr=fan?[0.022,0.03]:[0.035,0.045],TH=fan?0.92:0.8,bark=fan?[0.5,0.44,0.36]:[0.46,0.37,0.27],leaf=fan?[0.3,0.42,0.22]:[0.33,0.46,0.2];
    add(new THREE.CylinderGeometry(tr[0],tr[1],TH,6).translate(0,TH/2,0),bark);
    add(new THREE.SphereGeometry(fan?0.05:0.065,6,4).translate(0,TH,0),[0.42,0.36,0.22]);
    const n=fan?14:11;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+(k%2)*0.2,len=fan?0.1:0.22,droop=fan?(k%3?0.15:-0.5):-0.35-(k%3)*0.18;
      const g=new THREE.IcosahedronGeometry(0.5,0).scale(len*2,0.012,fan?0.07:0.05).translate(len,0,0).rotateZ(droop).translate(0,TH+0.01,0).rotateY(a);add(g,leaf.map(v=>v*(0.88+(k%3)*0.08)));}
    if(fan)add(new THREE.CylinderGeometry(0.045,0.03,0.12,6).translate(0,TH-0.08,0),[0.6,0.52,0.34]);
    let N=0;for(const g of parts)N+=g.attributes.position.count;const P=new Float32Array(N*3),Nn=new Float32Array(N*3),Cc=new Float32Array(N*3);let o=0;
    for(const g of parts){P.set(g.attributes.position.array,o*3);Nn.set(g.attributes.normal.array,o*3);Cc.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(Nn,3));G.setAttribute('color',new THREE.BufferAttribute(Cc,3));return G;}
  // a plane tree for the promenades' rows: a pale mottled trunk, a broad crown of four lobes (one unit tall)
  function plane(){const parts=[];const add=(g,c)=>{g=g.toNonIndexed();g.deleteAttribute('uv');const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(c,i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
    add(new THREE.CylinderGeometry(0.022,0.032,0.5,6).translate(0,0.25,0),[0.66,0.63,0.52]);
    for(const [r,x,y,z,k] of [[0.3,0,0.66,0,1],[0.22,0.2,0.58,0.08,0.92],[0.22,-0.17,0.62,-0.13,0.96],[0.2,0.03,0.82,0.05,1.04]])add(new THREE.IcosahedronGeometry(r,1).scale(1,0.85,1).translate(x,y,z),[0.36*k,0.5*k,0.23*k]);
    let N=0;for(const g of parts)N+=g.attributes.position.count;const P=new Float32Array(N*3),Nn=new Float32Array(N*3),Cc=new Float32Array(N*3);let o=0;
    for(const g of parts){P.set(g.attributes.position.array,o*3);Nn.set(g.attributes.normal.array,o*3);Cc.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(Nn,3));G.setAttribute('color',new THREE.BufferAttribute(Cc,3));return G;}
  const GEO={date:palm('date'),fan:palm('fan'),plane:plane()},M=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const clear=(x,z)=>!inWater(x,z)&&!buildingsAt(x,z,1.5).some(b=>inPoly(x,z,b.ring))&&!roadsNear(x,z,0.3,r=>r.c!=='trail'&&r.c!=='pedestrian').length;
  const spots=[];const taken=new Map(),key=(x,z)=>Math.round(x/4)+','+Math.round(z/4);
  const HT={fan:[14,8],date:[8,5],plane:[15,7]};
  const plant=(x,z,kind)=>{const k=key(x,z);if(taken.has(k)||!clear(x,z))return;taken.set(k,1);spots.push([x,z,kind,HT[kind][0]+R()*HT[kind][1]]);};
  // the rows of plane trees ("rows": [{roads, classes, kind, spacing, offset}]): offset from the way's edge, negative
  // inside it (La Rambla's two rows stand just inside the central promenade's edges); "centre" plants on the line
  for(const row of K.rows||[]){const RS=new Set(row.roads),CL=row.classes?new Set(row.classes):null,sp=row.spacing||8;
    for(const r of ROADS){if(!RS.has(r.name)||(CL&&!CL.has(r.c)))continue;
      for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<1)continue;const ux=(bx-ax)/L,uz=(bz-az)/L;
        const offs=row.offset==='centre'?[0]:[-(r.w/2+row.offset),r.w/2+row.offset];
        for(let u=sp/2;u<L;u+=sp)for(const o of offs)plant(ax+ux*u-uz*o,az+uz*u+ux*o,row.kind||'plane');}}}
  for(const r of ROADS){if(!ROADSET.has(r.name))continue;const kind=/Marítim|Lluís Companys/.test(r.name)?'date':R()<0.5?'fan':'date';
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<1)continue;const ux=(bx-ax)/L,uz=(bz-az)/L,off=r.w/2+1.6;
      for(let u=SP/2;u<L;u+=SP)for(const s of [-1,1])plant(ax+ux*u-uz*off*s,az+uz*u+ux*off*s,kind);}}
  for(const a of AREAS||[]){if(!SQ.has(a.name))continue;const {x0,x1,z0,z1}=a.bb;for(let x=x0+5;x<x1-4;x+=9)for(let z=z0+5;z<z1-4;z+=9)if(inPoly(x,z,a.o))plant(x,z,'fan');}
  // instanced, by kind and by 600 m tile
  const groups=new Map(),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),p=new THREE.Vector3(),s=new THREE.Vector3();
  for(const sp of spots){const k=sp[2]+':'+Math.floor(sp[0]/600)+','+Math.floor(sp[1]/600);(groups.get(k)||groups.set(k,[]).get(k)).push(sp);}
  for(const [k,list] of groups){const kind=k.split(':')[0],im=new THREE.InstancedMesh(GEO[kind],M,list.length);
    list.forEach(([x,z,,h],i)=>{q.setFromAxisAngle(Y,R()*6.28);m4.compose(p.set(x,groundH(x,z),z),q,s.set(h*(0.9+R()*0.2),h,h*(0.9+R()*0.2)));im.setMatrixAt(i,m4);});
    im.castShadow=true;im.frustumCulled=false;im.userData.noFingerprint=true;scene.add(im);}
  api.ctx.details=Object.assign(api.ctx.details||{},{palms:spots.filter(q=>q[2]!=='plane').length,rowTrees:spots.filter(q=>q[2]==='plane').length});
}
