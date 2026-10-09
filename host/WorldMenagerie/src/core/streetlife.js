// ---------- the life of the streets: shopfronts, cafés, the dress of the façades, and smoke from the chimneys ----------
// In the historic centre (C.streetlife.centre: [lat, lon, radius m]) every wall that fronts a street gets:
//   the dress of a Roman palazzo - a plinth of darker stone at its foot, a string course over the ground floor, quoins
//   up the corners, here and there an iron balcony under a first-floor window and flower boxes on the sills;
//   and on the ground floor, shops: a glazed front in a stone frame (warm-lit after dark), an awning in the shop's
//   colour or striped, a sign over it, now and then the green cross of a farmacia; and where the street is a
//   pedestrian one or the wall fronts a piazza, a café's tables and chairs and its parasols out on the stones.
// The windows of the wall texture fall every C.facade.bay metres along a footprint's perimeter (from its first
// vertex) and every C.facade.floor metres up; balconies and shops are set on that grid so they meet the windows.
// Across the city a few of the chimneys smoke (C.streetlife.smoke, a share of them): puffs rising and drifting with
// the wind, drawn as points, every one moved on the graphics card - nothing to do here each frame but set the time.
//
// Built by tile and coloured by vertex - and only near the camera: a tile is built when the camera comes within
// C.streetlife.far metres of it, one tile a frame, nearest first (so a pan never stalls on it), and thrown away again
// when the camera is well past. All of the centre at once would be millions of triangles held for nothing. Map data (c)
// OpenStreetMap contributors, ODbL.
export function streetlife(api){
  const {THREE,C,scene,FOOTPRINTS,AREAS,ROADS,P,groundH,inPoly,inWater,buildingsAt,roadsNear,animHooks,camera,nightF,hour,renderer}=api;const K=C.streetlife;if(!K)return;
  const FAR=K.far||550,TILE=K.tile||300,BAY=(C.facade&&C.facade.bay)||4.8,FLOOR=(C.facade&&C.facade.floor)||4.4;
  const hsh=(x,z,k)=>{const v=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return v-Math.floor(v);};   // by place, so a tile built twice is built the same
  const [CX,CZ]=P(K.centre||[41.8995,12.4785]),CR=(K.centre&&K.centre[2])||2200;
  let cur=null;const tileOf=(x,z,kind)=>cur[kind];   // everything a wall puts out goes into the tile being built
  const col=new THREE.Color(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3();
  const geoCache=new Map();const flat=g=>{let f=geoCache.get(g);if(!f){f=g.index?g.toNonIndexed():g;geoCache.set(g,f);}return f;};
  function put(geo,colour,x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0,kind='main'){const g=flat(geo),p=g.attributes.position,n=g.attributes.normal,t=tileOf(x,z,kind);
    m4.compose(ps.set(x,y,z),q.setFromEuler(e.set(rx,ry,rz,'YXZ')),sc.set(sx,sy,sz));nm.getNormalMatrix(m4);col.set(colour);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);t.p.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();t.n.push(v.x,v.y,v.z);t.c.push(col.r,col.g,col.b);}}
  const QUAD=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(0.5,0.5,1,8),CONE=new THREE.ConeGeometry(0.5,1,8,1,true),SPH=new THREE.IcosahedronGeometry(0.5,0);
  const area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q2=r[(i+1)%r.length];a+=p[0]*q2[1]-q2[0]*p[1];}return a/2;};
  const SKIP=new Set(['church','chapel','cathedral','basilica','ruins','temple','arch','triumphal_arch','roof','shed','garage','garages','train_station','tower']);
  const WALKC=new Set(['residential','unclassified','living_street','pedestrian','tertiary','secondary','primary','trunk']),PEDC=new Set(['pedestrian','living_street']);
  const AWN=['#2f4a36','#6a2228','#e8e0cc','#23304a','#8a5a2a','#3a3a3a','#7a1e1e','#c8b47a'],STRIPE=['#f2ece0','#e8e0cc'],SIGN=['#1e2a24','#2a1e1a','#e6dcc4','#1a2230','#5a1a1a'];
  // a city's style: 'venice' dresses in white Istrian stone, has no quoins, balconies of stone balusters, and pointed
  // Gothic frames on the piano nobile where a wall fronts a campo or the water
  const VEN=K.style==='venice',TOK=K.style==='tokyo';
  const TKSIGN=['#e8202a','#f0c020','#2a8ae8','#f2f2f2','#18b060','#e83a9a','#ff7a1a','#7a3ae8','#20c8d8','#1a1a1e'];
  const PLINTH=VEN?'#e2ddd0':'#8f8574',STRING=VEN?'#ebe6da':'#d9cfba',QUOIN='#ddd2bc',IRON='#26262a',GLASS='#30383c',FLOWER=['#c8283a','#e85a8a','#f0f0f0','#e8b020','#b04ac0'];
  const PLAZ=(AREAS||[]).filter(a=>a.kind==='plaza');
  const onPlaza=(x,z)=>PLAZ.some(a=>x>a.bb.x0&&x<a.bb.x1&&z>a.bb.z0&&z<a.bb.z1&&inPoly(x,z,a.o));
  let nShops=0,nCafe=0,nBalc=0,nBoxes=0,nWalls=0,nFarm=0;
  // a Venetian Gothic window on the piano nobile: stone jambs, a sill, the pointed (ogee) head, the dark opening, and
  // with a balcony of balusters under it when asked
  function gothic(x,z,y,ry,ox,oz,ex,ez,balc){const W2=1.3,H2=2.4;put(BOX,'#202426',x+ox*0.06,y+0.9+H2/2,z+oz*0.06,ry,W2,H2,0.04);
    for(const sd of [-1,1]){put(BOX,STRING,x+ex*sd*(W2/2+0.08)+ox*0.1,y+0.9+H2/2,z+ez*sd*(W2/2+0.08)+oz*0.1,ry,0.16,H2,0.14);
      put(BOX,STRING,x+ex*sd*0.36+ox*0.1,y+0.9+H2+0.32,z+ez*sd*0.36+oz*0.1,ry,0.86,0.14,0.14,0,sd*0.72);}   // the two halves of the point
    put(BOX,'#202426',x+ox*0.06,y+0.9+H2+0.22,z+oz*0.06,ry,0.7,0.36,0.04,0,0.785);put(BOX,STRING,x+ox*0.12,y+0.85,z+oz*0.12,ry,W2+0.5,0.12,0.24);
    if(balc){put(BOX,STRING,x+ox*0.45,y+0.75,z+oz*0.45,ry,W2+1.0,0.14,0.8);put(BOX,STRING,x+ox*0.82,y+1.75,z+oz*0.82,ry,W2+1.0,0.1,0.14);for(let b2=-3;b2<=3;b2++)put(CYL,STRING,x+ox*0.82+ex*b2*0.3,y+1.28,z+oz*0.82+ez*b2*0.3,0,0.11,0.86,0.11);}}
  // the convenience stores where the map has them (api.OSM.konbini, by brand): a shop bay within 10 m of one is that
  // store, in its brand's colours - base and three stripes - and each store is used once
  const BRAND={seven:['#f2f2f0','#e8740a','#1a8a4a','#d8202a'],family:['#f2f4f6','#1a7ac8','#3ab04a','#f2f2f0'],lawson:['#2a6ac8','#f2f2f2','#2a6ac8','#2a6ac8'],
    ministop:['#1e3a8a','#f2d020','#1e3a8a','#f2f2f2'],daily:['#f2f2f0','#d8202a','#f2f2f0','#d8202a'],other:['#f2f2f0','#2a8a4a','#2a8a4a','#f2f2f0']};
  const KGRID=new Map(),MAPPEDK=!!(api.OSM&&api.OSM.konbini&&api.OSM.konbini.length);
  if(MAPPEDK)for(const k of api.OSM.konbini){const x=k.x/10,z=k.z/10,key=Math.floor(x/20)+','+Math.floor(z/20);let a=KGRID.get(key);if(!a)KGRID.set(key,a=[]);a.push({x,z,b:k.b,used:false});}
  const konbiniAt=(x,z)=>{const gx=Math.floor(x/20),gz=Math.floor(z/20);let best=null,bd=100;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const k of KGRID.get((gx+i)+','+(gz+j))||[]){const d=(k.x-x)**2+(k.z-z)**2;if(!k.used&&d<bd){bd=d;best=k;}}if(best){best.used=true;return BRAND[best.b]||BRAND.other;}return null;};
  const WALLS=new Map();   // tile key -> the walls in it, each a function that builds it
  for(const f of FOOTPRINTS){const r=f.ring,H=f.h-f.g;if(f.tall||SKIP.has(f.t)||H<7||r.length<3)continue;
    const fx0=r[0][0],fz0=r[0][1];if((fx0-CX)**2+(fz0-CZ)**2>CR*CR)continue;
    const sgn=Math.sign(area(r))||1,top=f.h;let per=0;
    for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)continue;const p0=per;per+=L;if(L<4)continue;
      const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ox=ez*sgn,oz=-ex*sgn,ry=-Math.atan2(ez,ex),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      // does this wall front a street? the road's edge within a few metres of it
      const near=roadsNear(mx+ox*1.5,mz+oz*1.5,2.5,rd=>WALKC.has(rd.c)),wet=!!K.water&&inWater(mx+ox*2.5,mz+oz*2.5)&&inWater(mx+ox*5,mz+oz*5);   // a wall on a canal
      if(!near.length&&!wet)continue;nWalls++;
      const key=Math.floor(mx/TILE)+','+Math.floor(mz/TILE);let list=WALLS.get(key);if(!list){list=[];WALLS.set(key,list);}
      list.push(()=>{
      const ped=near.some(n=>PEDC.has(n.road.c))||onPlaza(mx+ox*5,mz+oz*5),g=groundH(mx+ox*1.2,mz+oz*1.2),W=(x,y,z0,wd,ht,dp,c,kind,dx=0)=>put(BOX,c,x+ox*dp/2,y+ht/2,z0+oz*dp/2,ry,wd,ht,dp,0,0,kind);
      // ---- a wall standing in the water: the green band the tide leaves, a course of Istrian stone over it, water
      // gates on the ground floor, and on the piano nobile pointed windows framed in stone over a balcony ----
      if(wet){const w0=f.g;W(mx,w0-0.8,mz,L+0.1,1.5,0.1,'#3c4834');W(mx,w0+0.7,mz,L+0.1,0.28,0.16,STRING);W(mx,g+FLOOR-0.15,mz,L+0.2,0.24,0.2,STRING);
        for(let k=Math.ceil(p0/BAY-0.5);(k+0.5)*BAY<p0+L;k++){const s=(k+0.5)*BAY-p0;if(s<1.4||s>L-1.4)continue;const x=a[0]+ex*s,z=a[1]+ez*s,h1=((Math.abs(x*3.7+z*1.3))%1);
          if(h1<0.18){put(BOX,'#1a1c1c',x+ox*0.07,w0+1.5,z+oz*0.07,ry,2.0,2.6,0.05);put(BOX,STRING,x+ox*0.1,w0+2.9,z+oz*0.1,ry,2.6,0.3,0.14);for(const sd of [-1,1])put(BOX,STRING,x+ex*sd*1.15+ox*0.1,w0+1.5,z+ez*sd*1.15+oz*0.1,ry,0.25,2.8,0.14);}   // a water gate
          if(H>8&&h1>0.35&&h1<0.75)gothic(x,z,g+FLOOR,ry,ox,oz,ex,ez,h1>0.62);}
        return;}
      // ---- Tokyo: no plinths or quoins - shopfronts with their fascias (a konbini now and then), vertical kanban off
      // the upper floors, vending machines, lanterns at the izakaya, the air-conditioners on the walls ----
      if(TOK){const KON=[['#f2f2f0','#e8740a','#1a8a4a','#d8202a'],['#f2f4f6','#1a7ac8','#3ab04a','#f2f2f0'],['#2a6ac8','#f2f2f2','#2a6ac8','#2a6ac8']];
        for(let k=Math.ceil(p0/BAY-0.5);(k+0.5)*BAY<p0+L;k++){const s=(k+0.5)*BAY-p0;if(s<1.4||s>L-1.4)continue;const x=a[0]+ex*s,z=a[1]+ez*s,h1=((Math.abs(x*3.7+z*1.3))%1),h2=((Math.abs(x*1.9+z*5.3))%1);
          if(g-f.g<2.5&&h1<(K.shops||0.7)){nShops++;const wd=Math.min(3.2,BAY-0.4),ht=2.8,kon=MAPPEDK?konbiniAt(x+ox*4,z+oz*4):h2<(K.konbini||0.05)?KON[Math.floor(h2*600)%3]:null;
            put(BOX,GLASS,x+ox*0.06,g+0.2+ht/2,z+oz*0.06,ry,wd,ht,0.04,0,0,'glass');
            if(kon){for(let b2=0;b2<3;b2++)put(BOX,kon[b2+1],x+ox*0.12,g+ht+0.35+b2*0.22,z+oz*0.12,ry,wd+0.4,0.2,0.1,0,0,'sign');put(BOX,kon[0],x+ox*0.1,g+ht+1.05,z+oz*0.1,ry,wd+0.4,0.5,0.08,0,0,'sign');}
            else put(BOX,TKSIGN[Math.floor(h2*977)%TKSIGN.length],x+ox*0.12,g+ht+0.55,z+oz*0.12,ry,wd+0.2,0.8,0.12,0,0,'sign');   // the fascia
            if(h2>0.86){for(const sd of [-1,1])put(SPH,'#d8282a',x+ex*sd*(wd/2-0.3)+ox*0.45,g+ht-0.4,z+ez*sd*(wd/2-0.3)+oz*0.45,0,0.45,0.6,0.45,0,0,'sign');}   // red lanterns: an izakaya
            else if(h2>0.7){for(let v2=0;v2<2;v2++)put(BOX,['#e8e8ea','#2a6ad8','#d82a2a','#f2f2f2'][Math.floor(h2*91+v2)%4],x+ex*(wd/2+0.5+v2*0.95)+ox*0.45,g+0.92,z+ez*(wd/2+0.5+v2*0.95)+oz*0.45,ry,0.9,1.83,0.75,0,0,'sign');}}   // vending machines
          // vertical signs off the upper floors, in a commercial street (most bays where the shops are)
          if(H>9&&h2<(K.kanban||0.45)){const sh=Math.min(H-FLOOR-1,4+h1*8),sy=g+FLOOR+0.5;put(BOX,TKSIGN[Math.floor(h1*523)%TKSIGN.length],x+ox*0.65,sy+sh/2,z+oz*0.65,ry+Math.PI/2,1.0,sh,0.28,0,0,'sign');
            put(BOX,'#2a2a2e',x+ox*0.2,sy+0.3,z+oz*0.2,ry,0.15,0.15,0.4);put(BOX,'#2a2a2e',x+ox*0.2,sy+sh-0.3,z+oz*0.2,ry,0.15,0.15,0.4);}
          for(let fl=1;fl*FLOOR+1<H-1;fl++){if(((Math.abs(x*2.3+z*7.1+fl*3.3))%1)>0.25)continue;put(BOX,'#d6d6d2',x+ex*1.1+ox*0.25,g+fl*FLOOR+0.4,z+ez*1.1+oz*0.25,ry,0.85,0.6,0.32);}}   // the air-conditioners
        return;}
      // ---- the dress: plinth, string course, quoins at the corners ----
      W(mx,f.g-0.3,mz,L+0.1,g-f.g+1.2,0.12,PLINTH);
      W(mx,g+FLOOR-0.15,mz,L+0.2,0.28,0.22,STRING);
      if(H>12)W(mx,top-1.6,mz,L,0.18,0.12,STRING);   // a second course under the cornice
      {const tn=r[(i+2)%r.length],nx2=tn[0]-b[0],nz2=tn[1]-b[1],l2=Math.hypot(nx2,nz2)||1,turn=Math.abs(ex*nz2/l2-ez*nx2/l2);
        if(turn>0.6&&!VEN)for(let y=g+0.9,k=0;y<top-1.2;y+=0.9,k++){const w=k%2?0.7:1.1;put(BOX,QUOIN,b[0]-ex*w/2+ox*0.05,y+0.42,b[1]-ez*w/2+oz*0.05,ry,w,0.84,0.12);}}
      // ---- the bays: windows every BAY metres along the perimeter, centred at (k+0.5)*BAY ----
      for(let k=Math.ceil(p0/BAY-0.5);(k+0.5)*BAY<p0+L;k++){const s=(k+0.5)*BAY-p0;if(s<1.6||s>L-1.6)continue;
        const x=a[0]+ex*s,z=a[1]+ez*s,h1=((Math.abs(x*3.7+z*1.3))%1);
        // the ground floor: a shop, most bays on a street in the centre
        if(h1<(K.shops||0.62)&&g-f.g<2.5){nShops++;const wd=Math.min(3.4,BAY-1.0),ht=3.0;
          put(BOX,'#cfc4ad',x+ox*0.06,g+ht/2+0.15,z+oz*0.06,ry,wd+0.5,ht+0.4,0.12);                     // the stone frame
          put(BOX,GLASS,x+ox*0.13,g+0.25+ht/2-0.1,z+oz*0.13,ry,wd,ht-0.2,0.04,0,0,'glass');               // the glass, lit at night
          put(BOX,'#3a2a20',x+ox*0.14,g+1.15,z+oz*0.14,ry,0.9,2.3,0.04);                                   // the door
          const ac=AWN[Math.floor(h1*97%AWN.length)],striped=h1*13%1<0.3,aw=wd+0.3,ad=1.3;
          if(h1*7%1<0.7){if(striped)for(let j=0;j<6;j++)put(BOX,j%2?STRIPE[0]:ac,x+ox*(ad/2+0.1)+ex*(j-2.5)*aw/6,g+ht+0.2,z+oz*(ad/2+0.1)+ez*(j-2.5)*aw/6,ry,aw/6,0.06,ad+0.1);
            else put(BOX,ac,x+ox*(ad/2+0.1),g+ht+0.2,z+oz*(ad/2+0.1),ry,aw,0.06,ad+0.1);
            put(BOX,ac,x+ox*(ad+0.12),g+ht,z+oz*(ad+0.12),ry,aw,0.35,0.04);}                             // the awning and its valance
          else put(BOX,SIGN[Math.floor(h1*53%SIGN.length)],x+ox*0.16,g+ht+0.55,z+oz*0.16,ry,wd*0.8,0.55,0.06);   // a sign board instead
          if(h1*31%1<(K.farmacie||0.012)){nFarm++;const cx=x+ex*(wd/2+0.6)+ox*0.6,cz=z+ez*(wd/2+0.6)+oz*0.6;   // the green cross of a farmacia, standing out from the wall
            put(BOX,'#18c040',cx,g+ht+1.0,cz,ry+Math.PI/2,0.7,0.22,0.08,0,0,'neon');put(BOX,'#18c040',cx,g+ht+1.0,cz,ry+Math.PI/2,0.22,0.7,0.08,0,0,'neon');}
          // a café's tables out on a pedestrian street or a piazza
          if(ped&&h1*17%1<0.55){nCafe++;for(let tbl=0;tbl<2;tbl++){const d2=2.4+tbl*1.9,lx=(hsh(x,z,tbl)-0.5)*1.4,tx=x+ox*d2+ex*lx,tz=z+oz*d2+ez*lx,tg=groundH(tx,tz);
              put(CYL,'#e8e4dc',tx,tg+0.74,tz,0,0.7,0.04,0.7);put(CYL,IRON,tx,tg+0.37,tz,0,0.06,0.74,0.06);
              for(const sd of [-1,1]){const cx=tx+ex*sd*0.6,cz=tz+ez*sd*0.6;put(BOX,'#4a3a2e',cx,tg+0.45,cz,ry,0.42,0.05,0.42);put(BOX,'#4a3a2e',cx+ex*sd*0.2,tg+0.7,cz+ez*sd*0.2,ry+Math.PI/2,0.42,0.5,0.05);}
              if(tbl===0||hsh(x,z,tbl+5)<0.5){put(CYL,'#d8d0c0',tx,tg+1.2,tz,0,0.05,2.4,0.05);put(CONE,h1<0.3?'#f0ead8':ac,tx,tg+2.45,tz,0,2.4,0.7,2.4);}}}}
        // above: a balcony under a first-floor window here and there; flower boxes on some sills
        if(H>9&&h1>0.78&&h1<0.9){nBalc++;const y=g+FLOOR+0.35;put(BOX,'#cfc4ad',x+ox*0.45,y,z+oz*0.45,ry,2.2,0.16,0.9);
          if(VEN){put(BOX,STRING,x+ox*0.85,y+0.95,z+oz*0.85,ry,2.2,0.12,0.16);for(let b2=-3;b2<=3;b2++)put(CYL,STRING,x+ox*0.85+ex*b2*0.32,y+0.5,z+oz*0.85+ez*b2*0.32,0,0.12,0.8,0.12);}
          else{put(BOX,IRON,x+ox*0.88,y+0.55,z+oz*0.88,ry,2.2,0.9,0.03);for(const sd of [-1,1])put(BOX,IRON,x+ox*0.45+ex*sd*1.09,y+0.55,z+oz*0.45+ez*sd*1.09,ry,0.03,0.9,0.9);}
          if(h1>0.84){put(BOX,TERRA_POT,x+ox*0.75,y+0.25,z+oz*0.75,ry,1.8,0.3,0.25);put(SPH,'#3f6a34',x+ox*0.75,y+0.55,z+oz*0.75,ry,1.9,0.5,0.5);}}
        if(VEN&&ped&&H>8&&h1>0.4&&h1<0.6)gothic(x,z,g+FLOOR,ry,ox,oz,ex,ez,false);
        for(let fl=1;fl*FLOOR+1.2<H-1;fl++){const hb=((Math.abs(x*5.1+z*2.9+fl*1.7))%1);if(hb>(K.flowerBoxes||0.12))continue;nBoxes++;const y=g+fl*FLOOR+0.95;
          put(BOX,TERRA_POT,x+ox*0.22,y,z+oz*0.22,ry,1.3,0.22,0.3);put(SPH,'#3f6a34',x+ox*0.25,y+0.25,z+oz*0.25,ry,1.3,0.35,0.42);
          put(SPH,FLOWER[Math.floor(hb*911%FLOWER.length)],x+ox*0.3,y+0.35,z+oz*0.3,ry,1.1,0.25,0.3);}}});}}
  // a piece of street furniture, built with the tile it stands in
  const addJob=(x,z,fn)=>{const key=Math.floor(x/TILE)+','+Math.floor(z/TILE);let list=WALLS.get(key);if(!list){list=[];WALLS.set(key,list);}list.push(fn);};
  // ---- Tokyo's apartment blocks: real balconies near the camera - each floor's slab standing out, its railing panel,
  // the dividers between the flats - on the faces turned south (Japanese flats face the sun) ----
  let nBal=0;if(TOK&&K.balconies!==false){const AT=new Set(K.balconyTypes||['apartments','residential','dormitory']),FL=K.balconyFloor||3.0;
    for(const f of FOOTPRINTS){const r=f.ring,H=f.h-f.g;if(!AT.has(f.t)||H<8||H>(K.balconyMaxH||60)||r.length<3)continue;if((r[0][0]-CX)**2+(r[0][1]-CZ)**2>CR*CR)continue;
      const sgn=Math.sign(area(r))||1;
      for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<7)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ox=ez*sgn,oz=-ex*sgn;
        if(oz<0.45)continue;nBal++;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,ry=-Math.atan2(ez,ex),rail=((f.hsh*91)%1)<0.6?'#c8d2d6':'#eeeeea';
        addJob(mx,mz,()=>{const g=f.g;for(let fl=1;fl*FL<H-1.5;fl++){const y=g+fl*FL;put(BOX,'#f0eee8',mx+ox*0.55,y,mz+oz*0.55,ry,L-0.6,0.16,1.1);
          put(BOX,rail,mx+ox*1.08,y+0.6,mz+oz*1.08,ry,L-0.6,1.05,0.05);for(let d=3.4;d<L-1;d+=6.8)put(BOX,'#e2e0da',a[0]+ex*d+ox*0.55,y+0.75,a[1]+ez*d+oz*0.55,ry,0.06,1.5,1.1);}});}}}
  // ---- Tokyo's back streets: the concrete utility poles and the tangle of wires between them, along every narrow
  // street (the main roads have theirs underground). A pole every ~30 m on one side, crossarms, a transformer now and
  // then; three wires and a bundle of cable from pole to pole ----
  let nPole=0;if(TOK&&K.poles!==false){const PC=new Set(['residential','unclassified','living_street','tertiary']);
    for(const rd of ROADS||[]){if(!PC.has(rd.c))continue;const pts=rd.pts;let prev=null,run=0,acc=12;
      for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.5)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,off=(rd.w||6)/2+0.4;
        for(let s0=acc;s0<L;s0+=30){const x=a[0]+ex*s0-ez*off,z=a[1]+ez*s0+ex*off;if((x-CX)**2+(z-CZ)**2>CR*CR||buildingsAt(x,z,0).some(bb=>inPoly(x,z,bb.ring))){prev=null;continue;}
          const here=[x,z],last=prev,ry=-Math.atan2(ez,ex),k=nPole++;prev=here;
          addJob(x,z,()=>{const g=groundH(x,z);put(CYL,'#a8a8a4',x,g+5.5,z,0,0.32,11,0.32);put(BOX,'#7a7a76',x,g+9.6,z,ry+Math.PI/2,1.8,0.12,0.12);put(BOX,'#7a7a76',x,g+8.8,z,ry+Math.PI/2,1.4,0.12,0.12);
            if(k%3===0)put(CYL,'#8a8e8a',x-ez*0.4,g+7.4,z+ex*0.4,0,0.7,1.2,0.7);
            if(last){const [lx,lz]=last,dx=x-lx,dz=z-lz,len=Math.hypot(dx,dz);if(len<45)for(const [dy,side] of [[9.7,0.8],[9.7,-0.8],[8.9,0.5],[7.6,0]]){const ox2=-dz/len*side*0,oz2=dx/len*side*0;
              const mx=(x+lx)/2,mz=(z+lz)/2,sy=g+dy-0.5;put(BOX,'#1c1c1e',mx-ez*side,sy,mz+ex*side,-Math.atan2(dz,dx),len,dy===7.6?0.09:0.03,dy===7.6?0.09:0.03);}}});}
        acc=(acc-L%30+30)%30||30;}}}
  // ---- Tokyo's junctions: a zebra across every arm of every junction of real streets, the signals on the corners of
  // the main ones (Japan's horizontal heads: blue, yellow, red), and white guardrails along the main roads' kerbs,
  // broken at the junctions ----
  let nJn=0;if(TOK&&K.junctions!==false){const JC=new Set(['primary','secondary','tertiary','trunk','residential','unclassified']),BIG=new Set(['primary','secondary','tertiary','trunk']);
    const NODES=new Map(),key=(x,z)=>Math.round(x)+','+Math.round(z);
    for(const rd of ROADS||[]){if(!JC.has(rd.c))continue;const pts=rd.pts;for(let i=0;i<pts.length;i++){const k=key(pts[i][0],pts[i][1]);let n=NODES.get(k);if(!n)NODES.set(k,n={x:pts[i][0],z:pts[i][1],arms:[],big:false,w:0});
      for(const j of [i-1,i+1]){if(j<0||j>=pts.length)continue;const dx=pts[j][0]-pts[i][0],dz=pts[j][1]-pts[i][1],l=Math.hypot(dx,dz);if(l<3)continue;n.arms.push({dx:dx/l,dz:dz/l,w:rd.w||6,big:BIG.has(rd.c),len:l});}
      if(BIG.has(rd.c))n.big=true;n.w=Math.max(n.w,rd.w||6);}}
    const JN=[...NODES.values()].filter(n=>n.arms.length>=3&&(n.x-CX)**2+(n.z-CZ)**2<CR*CR);nJn=JN.length;
    const zebra=(cx,cz,ax,az,across,wide,len)=>{const n=Math.floor(across/0.9);for(let k=0;k<n;k++){const s=-across/2+(k+0.5)*0.9,x=cx-az*s,z=cz+ax*s;put(QUAD,'#eeeeea',x,groundH(x,z)+0.08,z,-Math.atan2(az,ax),len,1,0.45);}};
    for(const n of JN)addJob(n.x,n.z,()=>{
      for(const a of n.arms){if(a.w<6||a.len<n.w/2+6)continue;const d=n.w/2+2.6,cx=n.x+a.dx*d,cz=n.z+a.dz*d;zebra(cx,cz,a.dx,a.dz,a.w-0.6,a.w,3.6);}   // the zebra across each arm, beyond the junction box
      if(n.big){const g0=groundH(n.x,n.z);for(const a of n.arms.filter(a=>a.big).slice(0,2)){const sx=n.x+a.dx*(n.w/2+1.5)+(-a.dz)*(a.w/2+0.8),sz=n.z+a.dz*(n.w/2+1.5)+a.dx*(a.w/2+0.8),g=groundH(sx,sz),ry=-Math.atan2(a.dz,a.dx);
          put(CYL,'#8a8c8a',sx,g+3.3,sz,0,0.24,6.6,0.24);put(BOX,'#8a8c8a',sx+a.dz*1.6,g+6.0,sz-a.dx*1.6,ry+Math.PI/2,3.4,0.16,0.16);
          const hx=sx+a.dz*3.0,hz=sz-a.dx*3.0;put(BOX,'#2a2c2e',hx,g+5.75,hz,ry+Math.PI/2,1.3,0.4,0.32);   // the signal head, across the road, facing the oncoming traffic
          ['#1fb08a','#e8b020','#d8282a'].forEach((c,k)=>put(SPH,c,hx-a.dx*0.17+(-a.dz)*0,g+5.75,hz-a.dz*0.17,0,0.28,0.28,0.12,0,0,'sign'));
          put(BOX,'#2a2c2e',sx-a.dx*0.25,g+2.6,sz-a.dz*0.25,ry,0.32,0.62,0.22);put(BOX,'#3ab0e0',sx-a.dx*0.37,g+2.75,sz-a.dz*0.37,ry,0.02,0.22,0.16,0,0,'sign');}}});   // a pedestrian signal on the pole
    // the guardrails along the main roads' kerbs: a rail and its posts, both sides, stopping short of the junctions
    const near=(x,z)=>{const nd=NODES.get(key(x,z));return nd&&nd.arms.length>=3;};
    for(const rd of ROADS||[]){if(!BIG.has(rd.c)||(rd.w||0)<8||rd.bridge)continue;const pts=rd.pts;
      for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<8)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,s0=near(a[0],a[1])?14:2,s1=L-(near(b[0],b[1])?14:2);if(s1-s0<4)continue;
        const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if((mx-CX)**2+(mz-CZ)**2>CR*CR)continue;
        for(const sd of [-1,1]){const off=rd.w/2-0.35,px=-ez*sd*off,pz=ex*sd*off;
          addJob(a[0]+ex*(s0+s1)/2+px,a[1]+ez*(s0+s1)/2+pz,()=>{const ry=-Math.atan2(ez,ex);for(let s=s0;s<=s1;s+=Math.max(4,(s1-s0)/Math.ceil((s1-s0)/12))){const x=a[0]+ex*s+px,z=a[1]+ez*s+pz,g=groundH(x,z);
              const seg=Math.min(12,s1-s);if(seg<0.5)break;put(BOX,'#eeeeea',x+ex*seg/2,g+0.85,z+ez*seg/2,ry,seg,0.08,0.06);put(BOX,'#eeeeea',x+ex*seg/2,g+0.55,z+ez*seg/2,ry,seg,0.05,0.05);
              for(let q=0;q<seg;q+=6)put(BOX,'#e2e2de',x+ex*q,g+0.45,z+ez*q,ry,0.06,0.9,0.06);}});}}}}
  // ---- the parks and gardens: along their paths, benches and lamps (and on the Pincio its marble busts, in a garden
  // box hedges); on their lawns, people sitting out on blankets. Each piece goes to the tile it stands in.
  const GREENK=new Set(['park','garden','grass','recreation_ground']),GREEN=(AREAS||[]).filter(a=>GREENK.has(a.kind));
  const greenAt=(x,z)=>GREEN.find(a=>x>a.bb.x0&&x<a.bb.x1&&z>a.bb.z0&&z<a.bb.z1&&inPoly(x,z,a.o));
  const PK=K.parks||{},[PX,PZ]=P(PK.busts||[41.9112,12.4790]),PR=(PK.busts&&PK.busts[2])||420;
  const LAMP='#2c3a30',WOOD='#7a5a3a',HEDGE='#3d5a30',MARBLE='#ece6da';
  let nBench=0,nLamp=0,nBust=0,nPicnic=0;
  for(const rd of ROADS||[]){if(rd.c!=='trail'&&rd.c!=='pedestrian')continue;const pts=rd.pts;let run=0;
    for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.5)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ry=-Math.atan2(ez,ex),half=(rd.w||3)/2;
      for(let s0=(run>0?(12-run%12):6);s0<L;s0+=12){const x=a[0]+ex*s0,z=a[1]+ez*s0,ar=greenAt(x,z);if(!ar)continue;const step=Math.round((run+s0)/12),garden=ar.kind==='garden',pinc=(x-PX)**2+(z-PZ)**2<PR*PR;
        addJob(x,z,()=>{for(const sd of [-1,1]){const ox=-ez*sd,oz=ex*sd,d=half+0.9,bx=x+ox*d,bz=z+oz*d,g=groundH(bx,bz);if(inWater(bx,bz))continue;
          if(pinc){nBust++;put(BOX,'#d8cfbc',bx,g+0.65,bz,ry,0.42,1.3,0.42);put(BOX,MARBLE,bx,g+1.42,bz,ry,0.5,0.24,0.32);put(SPH,MARBLE,bx,g+1.7,bz,ry,0.26,0.32,0.26);}   // a herm: a bust of an Italian worthy on its pillar
          else if((step+(sd>0?1:0))%3===0){nBench++;const hx=bx+ox*0.2,hz=bz+oz*0.2;put(BOX,WOOD,hx,g+0.45,hz,ry,1.8,0.07,0.45);put(BOX,WOOD,hx+ox*0.22,g+0.72,hz+oz*0.22,ry,1.8,0.4,0.05);   // a bench, facing the path
            for(const e2 of [-0.75,0.75])put(BOX,'#2a2a2c',hx+ex*e2,g+0.22,hz+ez*e2,ry,0.06,0.45,0.42);}
          else if(sd<0&&step%4===1){nLamp++;put(CYL,LAMP,bx,g+1.8,bz,0,0.12,3.6,0.12);put(BOX,LAMP,bx,g+3.65,bz,ry,0.34,0.08,0.34);put(BOX,'#e8dcb0',bx,g+3.88,bz,ry,0.26,0.38,0.26,0,0,'glass');put(CONE,LAMP,bx,g+4.17,bz,0,0.44,0.22,0.44);}
          if(garden){put(BOX,HEDGE,x+ox*(half+0.35),groundH(x,z)+0.32,z+oz*(half+0.35),ry,12.1,0.64,0.5);}}});}
      run+=L;}}
  // people sitting out on the grass: a blanket, two or three of them sitting on it (in the parks near the centre)
  for(const ar of GREEN){if(ar.kind==='garden')continue;const cx=(ar.bb.x0+ar.bb.x1)/2,cz=(ar.bb.z0+ar.bb.z1)/2;if((cx-CX)**2+(cz-CZ)**2>(CR*1.4)**2)continue;
    const A=(ar.bb.x1-ar.bb.x0)*(ar.bb.z1-ar.bb.z0),n=Math.min(140,Math.floor(A/(PK.picnicArea||2600)));
    for(let k=0,tries=0;k<n&&tries<n*6;tries++){const x=ar.bb.x0+hsh(cx,cz,tries*2)*(ar.bb.x1-ar.bb.x0),z=ar.bb.z0+hsh(cx,cz,tries*2+1)*(ar.bb.z1-ar.bb.z0);
      if(!inPoly(x,z,ar.o)||inWater(x,z)||roadsNear(x,z,2).length||buildingsAt(x,z,2).some(b=>inPoly(x,z,b.ring)))continue;k++;nPicnic++;
      const ry=hsh(x,z,3)*Math.PI*2,c=Math.cos(ry),sn=Math.sin(ry),at=(dx,dz)=>[x+dx*c+dz*sn,z-dx*sn+dz*c],np=2+(hsh(x,z,4)<0.4?1:0);
      addJob(x,z,()=>{const g=groundH(x,z);put(BOX,['#b8302a','#2a5a9a','#e8d8a0','#3a7a4a','#d87a2a'][Math.floor(hsh(x,z,5)*5)],x,g+0.03,z,ry,2.0,0.03,1.6);
        for(let j=0;j<np;j++){const [px,pz]=at(-0.6+j*0.6,0.25*(j%2?-1:1)),shirt=['#e8e4dc','#c8402a','#3a6aa8','#e0b030','#2a2a30','#5aa060'][Math.floor(hsh(px,pz,6)*6)],face=ry+(j%2?Math.PI:0)+0.3;
          put(BOX,shirt,px,g+0.42,pz,face,0.26,0.52,0.36);put(SPH,'#c89a78',px,g+0.82,pz,0,0.24,0.27,0.24);   // a body, sitting up; a head
          const [lx,lz]=[px+Math.cos(-face)*0.3,pz+Math.sin(-face)*0.3];put(BOX,'#2a3348',lx,g+0.12,lz,face,0.6,0.16,0.34);}});}}   // the legs out in front
  // ---- into meshes: the dress, the glass (lit after dark) and the neon, a tile each, drawn only near ----
  const mats={main:new THREE.MeshLambertMaterial({vertexColors:true}),glass:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0xffb85a,emissiveIntensity:0}),
    neon:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x22ff55,emissiveIntensity:0.5}),sign:new THREE.MeshLambertMaterial({vertexColors:true})};
  // a sign glows in its own colour: the vertex colour, as emission, scaled by the dark (always a little, as a lit sign is)
  const SIGN_GLOW={value:0.25};mats.sign.onBeforeCompile=sh=>{sh.uniforms.uGlow=SIGN_GLOW;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGlow;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*uGlow;');};
  const BUILT=new Map();let tris=0;
  // a tile is built a few milliseconds at a time (K.budgetMs a frame), so no single frame stalls on a dense one
  let job=null,maxMs=0;const BUDGET=K.budgetMs||4;
  function step(){const T0=performance.now(),list=WALLS.get(job.key);cur=job.buf;
    while(job.i<list.length&&performance.now()-T0<BUDGET)list[job.i++]();cur=null;maxMs=Math.max(maxMs,performance.now()-T0);
    if(job.i<list.length)return;const ms=[];
    for(const kind of ['main','glass','neon','sign']){const b=job.buf[kind];if(!b.p.length)continue;const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.computeBoundingSphere();
      const m=new THREE.Mesh(g,mats[kind]);m.receiveShadow=kind==='main';m.userData.wireCat='buildings';scene.add(m);ms.push(m);tris+=b.p.length/9;}
    BUILT.set(job.key,ms);job=null;api.ctx.details.streetlifeSliceMaxMs=Math.round(maxMs);}
  function drop(key){for(const m of BUILT.get(key)){scene.remove(m);m.geometry.dispose();tris-=m.geometry.attributes.position.count/3;}BUILT.delete(key);}
  // ---- chimney smoke: a share of the chimneys, ten puffs each, rising and drifting, all moved in the vertex shader ----
  let nSmoke=0;{const CH=(api.chimneys||[]).filter(c=>((c[3]*7919)%1)<(K.smoke||0.05));nSmoke=CH.length;
    if(CH.length){const N=14,pos=new Float32Array(CH.length*N*3),aux=new Float32Array(CH.length*N*2);
      CH.forEach((c,i)=>{const ph=(c[3]*13.7)%1;for(let k=0;k<N;k++){const j=(i*N+k);pos.set([c[0],c[1],c[2]],j*3);aux.set([ph,k/N],j*2);}});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aux',new THREE.BufferAttribute(aux,2));
      g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e6);
      const U={uT:{value:0},uScale:{value:400},uWind:{value:new THREE.Vector2(0.8,0.35)},uCol:{value:new THREE.Color(0xbdbab4)},uDay:{value:1}};
      const sm=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
        vertexShader:`#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec2 aux;uniform float uT,uScale;uniform vec2 uWind;varying float vA;
          void main(){float t=fract(uT*0.045+aux.x+aux.y);vec3 p=position+vec3(uWind.x*t*22.0+sin(t*6.0+aux.x*40.0)*1.2,t*16.0,uWind.y*t*22.0+cos(t*5.0+aux.x*30.0)*1.2);
            vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;float sz=3.0+t*17.0;gl_PointSize=sz*uScale/max(1.0,-mv.z);
            #include <logdepthbuf_vertex>

            vA=smoothstep(0.0,0.08,t)*(1.0-t)*0.75*(1.0-smoothstep(1200.0,3000.0,-mv.z));}`,
        fragmentShader:`#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 uCol;uniform float uDay;varying float vA;void main(){
#include <logdepthbuf_fragment>
vec2 c=gl_PointCoord-0.5;float d=dot(c,c);if(d>0.25)discard;gl_FragColor=vec4(uCol*mix(0.35,1.0,uDay),vA*(1.0-d*4.0)*(1.0-d*2.0));}`});
      const pts=new THREE.Points(g,sm);pts.frustumCulled=false;pts.renderOrder=5;scene.add(pts);
      animHooks.push(now=>{U.uT.value=now/1000;U.uScale.value=(renderer?renderer.domElement.height:800)*0.6;U.uDay.value=1-(nightF?nightF(hour()):0);});}}
  // ---- every frame: at most one tile built, the nearest the camera wants; every so often, the far ones thrown away.
  // At dusk the shops light up.
  const centre=key=>{const [a,b]=key.split(',').map(Number);return [(a+0.5)*TILE,(b+0.5)*TILE];},KEYS=[...WALLS.keys()].map(k=>[k,...centre(k)]),HALF=TILE*0.71;
  let last=-1e9,want=[];
  animHooks.push(now=>{const n=nightF?nightF(hour()):0;mats.glass.emissiveIntensity=n*0.95;SIGN_GLOW.value=0.22+n*0.9;mats.neon.emissiveIntensity=0.45+n*0.6;const cx=camera.position.x,cz=camera.position.z;
    if(now-last>250){last=now;want=[];for(const [k,x,z] of KEYS){const d=Math.hypot(x-cx,z-cz)-HALF;if(d<FAR&&!BUILT.has(k))want.push([d,k]);else if(d>FAR+250&&BUILT.has(k))drop(k);}want.sort((a,b)=>a[0]-b[0]);}
    if(!job)while(want.length){const [,k]=want.shift();if(!BUILT.has(k)){job={key:k,i:0,buf:{main:{p:[],n:[],c:[]},glass:{p:[],n:[],c:[]},neon:{p:[],n:[],c:[]},sign:{p:[],n:[],c:[]}}};break;}}
    if(job)step();
    api.ctx.details.streetlifeTiles=BUILT.size;api.ctx.details.streetlifeTris=Math.round(tris);});
  api.ctx.details=Object.assign(api.ctx.details||{},{balconyWalls:nBal,mappedKonbini:MAPPEDK,junctions:nJn,utilityPoles:nPole,parkBenchesEtc:'built with the tiles',streetWalls:nWalls,shops:nShops,cafes:nCafe,farmacie:nFarm,balconies:nBalc,flowerBoxes:nBoxes,smokingChimneys:nSmoke,streetlifeTileCount:WALLS.size});
}
const TERRA_POT='#a8573a';
