// ---------- Sarajevo: the socialist blocks, and the bars on the windows ----------
// Between 1960 and 1990 Sarajevo grew west along the valley in concrete: Grbavica, Hrasno, Čengić Vila, Alipašino
// Polje, the blocks round Marijin Dvor and up Koševo. Yugoslav, not Soviet - the country was non-aligned, its
// architects trained in Ljubljana and Zagreb - but the same grammar: a slab or a point block of ten to twenty
// floors, its long faces banded with loggias floor over floor (a cantilevered slab, a solid parapet, often painted),
// the stair core standing proud of one end, a machine room and aerials on the roof. Skenderija's halls are the same
// raw concrete. The siege left the faces pitted; a lot of them still are.
//   blocks   C.blocks: every footprint of the listed types and at least `minH` tall, in the `where` boxes, gets its
//            loggias on its two longest faces, a stair core, and a roof box (a share of them; by the footprint's hash)
//   grilles  C.blocks.grilles: iron bars on the ground-floor windows of houses and blocks - common in the city, on
//            the windows to a yard or a lane more than on a shop street - set on the facade's window grid
//            (C.facade.bay along the perimeter, centred at (k + 0.5) * bay, as streetlife does)
// Instanced boxes and grilles per 400 m tile, built the first time the camera comes within `near` m, hidden past it.
import {hash3} from '../core/rng.js';

export function blocks(api){
  const {THREE,C,scene,FOOTPRINTS,roadsNear,animHooks,camera,P,groundH}=api;const K=C.blocks;if(!K||!FOOTPRINTS)return;
  const TILE=400,NEAR=K.near||700,FLOOR=K.floor||2.9,BAY=(C.facade&&C.facade.bay)||3.6,FL=(C.facade&&C.facade.floor)||3.3;
  const boxes=(K.where||[]).map(([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];});
  const inBox=(x,z,B)=>B.some(([x0,z0,x1,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1);
  const G=K.grilles,gBoxes=G?(G.where||[]).map(([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];}):[],gSkip=G?(G.skip||[]).map(([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];}):[];
  const TYPES=new Set(K.types||['apartments','residential','yes','office','commercial','public']),GTYPES=new Set(G?G.types||['house','detached','yes','residential','apartments']:[]);
  const PARA=(K.parapets||['#b8b2a6','#c8a070','#a8603a','#d8c890','#8a8a86','#b07850','#9aa4a8']).map(c=>new THREE.Color(c));
  const SLAB=new THREE.Color(K.slab||'#bdb7aa'),CORE=new THREE.Color(K.core||'#8e8a82'),IRON=[new THREE.Color('#26262a'),new THREE.Color('#2e3a32'),new THREE.Color('#d8d8d2')];
  // the outward walls of a ring, longest first
  const walls=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1];}const sg=a>0?1:-1,out=[];let per=0;
    for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L>=1)out.push({p,q,L,p0:per,ex:(q[0]-p[0])/L,ez:(q[1]-p[1])/L,nx:(q[1]-p[1])/L*sg,nz:-(q[0]-p[0])/L*sg,mx:(p[0]+q[0])/2,mz:(p[1]+q[1])/2});per+=L;}return out;};
  // tiles of footprints, so each tile's work is done once, when it is first wanted
  const tiles=new Map();
  for(const f of FOOTPRINTS){const r=f.ring;if(!r||r.length<3)continue;const [x,z]=r[0],H=f.h-f.g;
    const blk=TYPES.has(f.t||'yes')&&H>=(K.minH||16)&&inBox(x,z,boxes)&&(f.hsh*7.31)%1<(K.share===undefined?0.85:K.share);
    const grl=G&&GTYPES.has(f.t||'yes')&&H<(G.maxH||40)&&inBox(x,z,gBoxes)&&!inBox(x,z,gSkip)&&(f.hsh*3.17)%1<(G.share===undefined?0.45:G.share);
    if(!blk&&!grl)continue;const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);
    if(!tiles.has(k))tiles.set(k,{cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE,list:[],g:null});tiles.get(k).list.push([f,blk,grl]);}
  // a grille: one quad facing +z, its frame and bars cut out of a texture (two triangles each, however many there are)
  const GRILLE=new THREE.PlaneGeometry(1,1);
  const gtex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.fillStyle='#fff';
    c.fillRect(0,0,64,4);c.fillRect(0,60,64,4);c.fillRect(0,0,4,64);c.fillRect(60,0,4,64);c.fillRect(0,31,64,3);for(let i=1;i<=5;i++)c.fillRect(Math.round(i*64/6)-1,0,3,64);
    for(let i=0;i<6;i++){c.beginPath();c.arc(i*64/6+5,47,4,0,Math.PI,true);c.lineWidth=2;c.strokeStyle='#fff';c.stroke();}   // the scrolls along the lower rail
    const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t;})();
  const BOX=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshLambertMaterial({color:0xffffff}),gmat=new THREE.MeshLambertMaterial({color:0xffffff,map:gtex,alphaTest:0.5,transparent:false,side:THREE.DoubleSide});gtex.format=THREE.RGBAFormat;
  const o=new THREE.Object3D();let nBlocks=0,nGrilles=0;
  function build(T){const B=[],R=[];   // [x,y,z,sx,sy,sz,ry,colour]
    for(const [f,blk,grl] of T.list){const ws=walls(f.ring),H=f.h-f.g,top=f.h;
      if(blk){nBlocks++;const long=ws.slice().sort((a,b)=>b.L-a.L),pc=PARA[Math.floor(f.hsh*PARA.length*13)%PARA.length];
        // the loggias: on the two longest faces, a slab and a parapet at every floor
        for(const w of long.slice(0,2)){if(w.L<10)continue;const ry=Math.atan2(w.ex,w.ez)+Math.PI/2,len=w.L-1.2;
          for(let y=f.g+FLOOR;y<top-1.5;y+=FLOOR){B.push([w.mx+w.nx*0.55,y,w.mz+w.nz*0.55,len,0.2,1.1,ry,SLAB]);B.push([w.mx+w.nx*1.08,y+0.6,w.mz+w.nz*1.08,len,1.0,0.12,ry,pc]);}}
        // the stair core, proud of the shortest long-enough face, a floor over the roof
        const sh=ws.slice().sort((a,b)=>a.L-b.L).find(w=>w.L>=5);if(sh){const ry=Math.atan2(sh.ex,sh.ez)+Math.PI/2;B.push([sh.mx+sh.nx*1.1,f.g+(H+3)/2,sh.mz+sh.nz*1.1,3.2,H+3,2.2,ry,CORE]);}
        // the machine room and the aerials
        let cx=0,cz=0;for(const [x,z] of f.ring){cx+=x;cz+=z;}cx/=f.ring.length;cz/=f.ring.length;const ry0=Math.atan2(long[0].ex,long[0].ez);
        B.push([cx,top+1.4,cz,5,2.8,4,ry0,CORE]);for(let a=0;a<3;a++)if(hash3(cx,cz,a)<0.6)B.push([cx+(hash3(cx,cz,a+5)-0.5)*8,top+3,cz+(hash3(cx,cz,a+9)-0.5)*8,0.06,6,0.06,0,IRON[0]]);}
      if(grl){// the ground floor's windows, on the walls not facing a shop street
        for(const w of ws){if(w.L<3)continue;const street=roadsNear(w.mx+w.nx*5,w.mz+w.nz*5,2,r=>r.c!=='trail'&&r.c!=='footway').length>0;
          if(street&&(G.street===undefined?0.25:G.street)<hash3(w.mx,w.mz,31))continue;
          const ry=Math.atan2(w.nx,w.nz),gw=Math.min(1.5,BAY*0.4),gh=Math.min(1.7,FL*0.5),col=IRON[hash3(f.hsh,w.L,3)<0.7?0:hash3(f.hsh,w.L,4)<0.5?1:2];
          for(let k=Math.ceil(w.p0/BAY-0.5);(k+0.5)*BAY<w.p0+w.L;k++){const s=(k+0.5)*BAY-w.p0;if(s<1.2||s>w.L-1.2)continue;const x=w.p[0]+w.ex*s+w.nx*0.06,z=w.p[1]+w.ez*s+w.nz*0.06;
            R.push([x,f.g+FL*0.55,z,gw,gh,1,ry,col]);nGrilles++;}}}}
    const grp=new THREE.Group();grp.name='blocks';
    const fill=(list,geo,m)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,m,list.length);
      list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.set(sx,sy,sz);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,c);});
      im.instanceColor.needsUpdate=true;im.castShadow=geo===BOX;im.receiveShadow=true;im.userData.noFingerprint=true;grp.add(im);};
    fill(B,BOX,mat);const gb=grp.children.length;fill(R,GRILLE,gmat);T.gr=grp.children[gb]||null;scene.add(grp);T.g=grp;}
  let next=0;
  animHooks.push(now=>{if(now<next)return;next=now+350;const p=camera.position,hh=p.y-groundH(p.x,p.z);let built=false;
    for(const T of tiles.values()){const near=Math.hypot(p.x-T.cx,p.z-T.cz)<NEAR+TILE*0.7&&hh<NEAR*1.5;
      if(near&&!T.g&&!built){build(T);built=true;api.ctx.details&&(api.ctx.details.blocks={tiles:tiles.size,blocks:nBlocks,grilles:nGrilles});}   // one tile per tick
      if(T.g){T.g.visible=near;if(T.gr)T.gr.visible=near&&Math.hypot(p.x-T.cx,p.z-T.cz)<(G&&G.near||320)+TILE*0.7&&hh<150;}}});
  api.ctx.details=Object.assign(api.ctx.details||{},{blocks:{tiles:tiles.size,blocks:0,grilles:0}});
}
