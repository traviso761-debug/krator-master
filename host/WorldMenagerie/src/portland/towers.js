// Portland's skyline towers, each built from its own mapped outline and parts (OpenStreetMap: the outline and the
// building:part pieces, in metres east and south of the tower's own "at", from data/osm/raw/portland) and dressed in
// its own skin: KOIN's brick under its blue pyramid and spire, Wells Fargo's travertine verticals, Big Pink's rose
// glass, PacWest's black-and-aluminium bands, Fox Tower's glass prow, Park Avenue West's notched top, 1000 Broadway's
// rounded cap, Standard Insurance's white marble, Block 216's dark glass, the Portland Building's Graves facade with
// Portlandia over the door, Moda Tower and Umpqua Bank Plaza.
//
// Each model has the same contract as src/portland/landmarks.js: handed (L,x,z), it draws with the engine's api. The
// tower's landmark entry carries "clearArea" (its mapped outline), so the engine's own extrusion of the same footprints
// is dropped and the model has the site to itself. Every tower is merged into one mesh per material, and its windows
// light at night from the engine's own windowF (the hour the offices are lit), as the engine's own blocks do.
export function towers(api){
  const {THREE,gh,group,animHooks,windowF,nightF,hour}=api;
  const LIT=[],GLOW=[];
  animHooks.push(()=>{const h=hour(),w=windowF(h),n=nightF(h);
    for(const [m,k] of LIT)m.emissive.setRGB(w*k,w*k*0.9,w*k*0.74);
    for(const [m,c] of GLOW)m.emissive.setRGB(c[0]*n,c[1]*n,c[2]*n);});
  // a small seeded generator, so a texture is the same on every load
  const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  // A facade: a tile of `bays` bays by `floors` floors (bw by fh metres each), a window in each cell at win
  // [x0,y0,x1,y1] (fractions of the cell, from its top left). The glow map lights about lit of the windows, each at its
  // own brightness, so no two floors repeat. deco(g,W,H,R) draws on the day map after the windows (piers, bands).
  const facade=o=>{const R=rng(o.seed||7),B=o.bays||8,F=o.floors||12,pw=o.ppb||24,ph=o.ppf||24,W=B*pw,H=F*ph,[x0,y0,x1,y1]=o.win||[0.15,0.2,0.85,0.85];
    const day=document.createElement('canvas'),nt=document.createElement('canvas');day.width=nt.width=W;day.height=nt.height=H;
    const g=day.getContext('2d'),n=nt.getContext('2d');g.fillStyle=o.wall;g.fillRect(0,0,W,H);n.fillStyle='#000';n.fillRect(0,0,W,H);
    if(o.noise){for(let i=0;i<W*H/6;i++){g.fillStyle=R()<0.5?o.noise[0]:o.noise[1];g.fillRect(R()*W|0,R()*H|0,2,1);}}
    if(o.course){g.fillStyle=o.course;for(let y=0;y<H;y+=o.courseStep||3)g.fillRect(0,y,W,1);}
    const glass=new THREE.Color(o.glass),c=new THREE.Color();
    for(let j=0;j<F;j++)for(let i=0;i<B;i++){const x=i*pw,y=j*ph,wx=x+x0*pw,wy=y+y0*ph,ww=(x1-x0)*pw,wh=(y1-y0)*ph;
      const v=0.86+R()*0.26;c.copy(glass).multiplyScalar(v);g.fillStyle='#'+c.getHexString();g.fillRect(wx,wy,ww,wh);
      if(o.sheen){const gr=g.createLinearGradient(wx,wy,wx+ww,wy+wh);gr.addColorStop(0,'rgba(255,255,255,'+o.sheen+')');gr.addColorStop(0.5,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(wx,wy,ww,wh);}
      if(o.mull){g.fillStyle=o.mull;g.fillRect(wx,wy,Math.max(1,pw*0.05),wh);g.fillRect(wx,wy,ww,Math.max(1,ph*0.04));}
      if(R()<(o.lit==null?0.4:o.lit)){const k=0.35+R()*0.65,r=Math.round((205+R()*45)*k),gg=Math.round((172+R()*54)*k),b=Math.round((118+R()*70)*k);
        n.fillStyle='rgb('+r+','+gg+','+b+')';n.fillRect(wx+1,wy+1,ww-2,wh-2);}}
    if(o.deco)o.deco(g,W,H,R,pw,ph);
    const mk=cv=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.repeat.set(1/(B*(o.bw||1.5)),1/(F*(o.fh||3.8)));return t;};
    const M=o.phong?new THREE.MeshPhongMaterial({map:mk(day),emissiveMap:mk(nt),emissive:0x000000,specular:o.spec||0x334050,shininess:o.shine||50})
      :new THREE.MeshLambertMaterial({map:mk(day),emissiveMap:mk(nt),emissive:0x000000});
    LIT.push([M,o.glowK==null?1:o.glowK]);return M;};
  const plain=(c,o={})=>o.phong?new THREE.MeshPhongMaterial({color:c,specular:o.spec||0x445566,shininess:o.shine||60}):new THREE.MeshLambertMaterial({color:c});
  const glowing=(c,e,o)=>{const m=plain(c,o);m.emissive=new THREE.Color(0);GLOW.push([m,e]);return m;};
  const roof=plain(0x6e6c68),dark=plain(0x2a2c2e);

  // ---- a builder: walls, caps, pyramids and stray geometry, gathered one bucket per material ----
  const inR=(x,z,r)=>{let o=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,zi]=r[i],[xj,zj]=r[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)o=!o;}return o;};
  const cen=r=>[r.reduce((a,p)=>a+p[0],0)/r.length,r.reduce((a,p)=>a+p[1],0)/r.length];
  const scaleR=(r,k,c=cen(r))=>r.map(([px,pz])=>[c[0]+(px-c[0])*k,c[1]+(pz-c[1])*k]);
  function builder(base){const B=new Map(),bk=m=>{let o=B.get(m);if(!o){o={p:[],n:[],u:[]};B.set(m,o);}return o;};
    const tri=(m,a,b,c,ua,ub,uc)=>{const o=bk(m),e1=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),e2=new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2]),nn=e1.cross(e2).normalize();
      o.p.push(...a,...b,...c);for(let i=0;i<3;i++)o.n.push(nn.x,nn.y,nn.z);o.u.push(...ua,...ub,...uc);};
    const T={base,
      // the walls of a ring from y0 to y1, each face turned outwards, textured in metres along the ring and up from base
      wall(r,y0,y1,m){let s=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<0.02)continue;
          let nx=dz/len,nz=-dx/len;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(inR(mx+nx*0.05,mz+nz*0.05,r)){nx=-nx;nz=-nz;}
          const A0=[a[0],y0,a[1]],B0=[b[0],y0,b[1]],B1=[b[0],y1,b[1]],A1=[a[0],y1,a[1]],ua0=[s,y0-base],ub0=[s+len,y0-base],ub1=[s+len,y1-base],ua1=[s,y1-base];
          if(-dz*nx+dx*nz>=0){tri(m,A0,B0,B1,ua0,ub0,ub1);tri(m,A0,B1,A1,ua0,ub1,ua1);}else{tri(m,A0,B1,B0,ua0,ub1,ub0);tri(m,A0,A1,B1,ua0,ua1,ub1);}
          s+=len;}},
      // a flat cap, facing up (or down)
      cap(r,y,m,down){const t=THREE.ShapeUtils.triangulateShape(r.map(p=>new THREE.Vector2(p[0],p[1])),[]);
        for(const [i,j,k] of t){const a=r[i],b=r[j],c=r[k],up=(b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1])>0;const A=[a[0],y,a[1]],Bv=[b[0],y,b[1]],Cv=[c[0],y,c[1]];
          if(up!==!!down)tri(m,A,Bv,Cv,[a[0],a[1]],[b[0],b[1]],[c[0],c[1]]);else tri(m,A,Cv,Bv,[a[0],a[1]],[c[0],c[1]],[b[0],b[1]]);}},
      // a block: walls and a roof
      block(r,y0,y1,m,top){T.wall(r,y0,y1,m);T.cap(r,y1,top||roof);},
      // a ring drawn up to a second ring (the same count of points), the faces turned away from the middle
      loft(r0,y0,r1,y1,m){const c=cen(r0);for(let i=0;i<r0.length;i++){const j=(i+1)%r0.length,A0=[r0[i][0],y0,r0[i][1]],B0=[r0[j][0],y0,r0[j][1]],A1=[r1[i][0],y1,r1[i][1]],B1=[r1[j][0],y1,r1[j][1]];
          const out=[(r0[i][0]+r0[j][0])/2-c[0],(r0[i][1]+r0[j][1])/2-c[1]],e1=[B0[0]-A0[0],B0[2]-A0[2]],ok=(-e1[1]*out[0]+e1[0]*out[1])>=0,L0=Math.hypot(e1[0],e1[1]);
          if(ok){tri(m,A0,B0,B1,[0,0],[L0,0],[L0,y1-y0]);tri(m,A0,B1,A1,[0,0],[L0,y1-y0],[0,y1-y0]);}else{tri(m,A0,B1,B0,[0,0],[L0,y1-y0],[L0,0]);tri(m,A0,A1,B1,[0,0],[0,y1-y0],[L0,y1-y0]);}}},
      // any three.js geometry, moved by a matrix
      geo(g,m,mat){g=g.index?g.toNonIndexed():g.clone();if(mat)g.applyMatrix4(mat);if(!g.attributes.normal)g.computeVertexNormals();const o=bk(m),p=g.attributes.position.array,nn=g.attributes.normal.array,uv=g.attributes.uv;
        for(let i=0;i<p.length;i++){o.p.push(p[i]);o.n.push(nn[i]);}for(let i=0;i<p.length/3;i++)o.u.push(uv?uv.getX(i):0,uv?uv.getY(i):0);},
      at(g,m,x,y,z,ry=0,rx=0,rz=0){const q=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx,ry,rz,'YXZ'));q.setPosition(x,y,z);T.geo(g,m,q);},
      done(L){const meshes=[];for(const [m,o] of B){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(o.n,3));
          g.setAttribute('uv',new THREE.Float32BufferAttribute(o.u,2));g.computeBoundingSphere();meshes.push(new THREE.Mesh(g,m));}return group(L,meshes);}};
    return T;}
  // a tower's outline and parts at (x,z), and the lowest ground under them (so no corner floats on a slope)
  const site=(k,x,z)=>{const d=PLANS[k],R=f=>{const r=[];for(let i=0;i+1<f.length;i+=2)r.push([x+f[i],z+f[i+1]]);return r;};
    const o=R(d.o),parts=d.p.map(p=>({b:p.b,t:p.t,r:R(p.r)}));let g0=1e9;for(const [px,pz] of o)g0=Math.min(g0,gh(px,pz));if(!isFinite(g0))g0=gh(x,z);return {o,parts,g0};};
  // an edge's frame: a point s along edge i of ring r, pushed out by d
  const edge=(r,i)=>{const a=r[i],b=r[(i+1)%r.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),t=[(b[0]-a[0])/len,(b[1]-a[1])/len];let n=[t[1],-t[0]];
    if(inR((a[0]+b[0])/2+n[0]*0.05,(a[1]+b[1])/2+n[1]*0.05,r))n=[-n[0],-n[1]];return {a,b,len,t,n,pt:(s,d)=>[a[0]+t[0]*s+n[0]*d,a[1]+t[1]*s+n[1]*d]};};
  // a slab stood out from a face: from s0 to s1 metres along it, d0 to d1 out from it, y0 to y1 up
  const slab=(T,e,s0,s1,d0,d1,y0,y1,m,top)=>{T.block([e.pt(s0,d0),e.pt(s1,d0),e.pt(s1,d1),e.pt(s0,d1)],y0,y1,m,top||m);};
  // a parapet: the last metre or so of a part's walls in a band of its own
  const banded=(T,r,y0,y1,body,band,bh=1.4)=>{T.wall(r,y0,y1-bh,body);T.wall(r,y1-bh,y1,band);};

  return {
  // KOIN Center (1984, Zimmer Gunsul Frasca): 35 floors of red-brown brick with tan stone at every setback, the corners
  // stepped in a sawtooth all the way up, and a pyramid of blue steel and glass for a crown, lit at night, with its
  // spire to 155 m. The mapped parts give the steps; the crown and spire are drawn on the 121 m top.
  koin(L,x,z){const {parts:p,g0}=site('koin',x,z),T=builder(g0),H=(L.height||155)/155;
    const brick=facade({seed:31,bays:8,floors:10,bw:1.6,fh:3.9,wall:'#8a4838',noise:['#7a3c2e','#9a5442'],course:'rgba(60,30,24,0.35)',courseStep:2,glass:'#2c3a4c',win:[0.22,0.16,0.78,0.86],mull:'#4a3a34',lit:0.42,
      deco:(g,W,Hh,R,pw,ph)=>{g.fillStyle='#c8b090';for(let y=ph-3;y<Hh;y+=ph)g.fillRect(0,y,W,2);}});
    const stone=facade({seed:32,bays:6,floors:4,bw:2.2,fh:4.2,wall:'#c8b694',noise:['#bca886','#d4c4a4'],glass:'#34404c',win:[0.18,0.2,0.82,0.8],lit:0.3});
    const store=facade({seed:33,bays:6,floors:2,bw:3,fh:5,wall:'#b8a88a',glass:'#3a4a58',win:[0.08,0.12,0.92,0.94],mull:'#2a2a2a',sheen:0.18,lit:0.6,phong:true});
    const atrium=facade({seed:34,bays:4,floors:2,bw:2,fh:4,wall:'#2a2e32',glass:'#3c5468',win:[0.04,0.04,0.96,0.96],mull:'#1c1e20',sheen:0.25,lit:0.5,phong:true,spec:0x6a7a88});
    const tan=plain(0xc4b08c),crown=glowing(0x4f7fae,[0.18,0.34,0.62],{phong:true,spec:0x9ab8d8,shine:80}),rib=plain(0x2c4058),steel=plain(0xb8c0c8,{phong:true});
    const S=(i,body,band,bh)=>{const q=p[i];banded(T,q.r,g0+q.b*H,g0+q.t*H,body,band,bh);T.cap(q.r,g0+q.t*H,tan);};
    // the podium: stone and shopfronts; the stepped glass atrium on the north-west corner
    S(1,store,tan,1.2);S(0,stone,tan,1);S(16,stone,tan,1);
    for(const i of [2,3,4,5]){const q=p[i];T.wall(q.r,g0,g0+q.t,atrium);T.cap(q.r,g0+q.t,atrium);}
    // the shaft and its setbacks, a stone band at each
    S(11,brick,tan,1.6);S(9,brick,tan,1.2);S(10,brick,tan,1.2);S(8,brick,tan,1.6);S(7,brick,tan,1.4);
    // the crown: the four mapped roof planes' outer corners make its base; a lower tier, a ring of ribs, and the point
    const quads=[12,13,14,15].map(i=>p[i].r),pts=[];for(const q of quads)for(const v of q)pts.push(v);
    const c=cen(p[6].r),ring=[];for(const v of pts){const a=Math.atan2(v[1]-c[1],v[0]-c[0]),d=Math.hypot(v[0]-c[0],v[1]-c[1]);ring.push({a,d,v});}
    ring.sort((u,v)=>u.a-v.a);const far=[];for(let k=0;k<8;k++){const lo=-Math.PI+k*Math.PI/4,hi=lo+Math.PI/4,bin=ring.filter(o=>o.a>=lo&&o.a<hi);if(bin.length)far.push(bin.reduce((m,o)=>o.d>m.d?o:m).v);}
    const y0=g0+121*H,y1=g0+131*H,ya=g0+142*H,mid=scaleR(far,0.62,c);
    T.cap(far,y0,tan);T.loft(far,y0,mid,y1,crown);
    for(let k=0;k<mid.length;k++){const a=mid[k],b=mid[(k+1)%mid.length];const tri=new THREE.BufferGeometry();tri.setAttribute('position',new THREE.Float32BufferAttribute([a[0],y1,a[1],b[0],y1,b[1],c[0],ya,c[1]],3));
      const o=[(a[0]+b[0])/2-c[0],(a[1]+b[1])/2-c[1]],e=[b[0]-a[0],b[1]-a[1]];if(-e[1]*o[0]+e[0]*o[1]<0)tri.setAttribute('position',new THREE.Float32BufferAttribute([b[0],y1,b[1],a[0],y1,a[1],c[0],ya,c[1]],3));
      tri.computeVertexNormals();T.geo(tri,crown);}
    // horizontal ribs round the crown and the ribs up its corners
    for(const f of [0.25,0.5,0.75,1]){const rr=scaleR(far,1-(1-0.62)*f+0.01,c),yy=y0+(y1-y0)*f;T.wall(rr,yy-0.35,yy,rib);}
    for(const v of mid){const top=[c[0],ya,c[1]],bot=[v[0],y1,v[1]],d=new THREE.Vector3(top[0]-bot[0],top[1]-bot[1],top[2]-bot[2]),len=d.length(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
      const m=new THREE.Matrix4().compose(new THREE.Vector3((top[0]+bot[0])/2,(top[1]+bot[1])/2,(top[2]+bot[2])/2),q,new THREE.Vector3(1,1,1));T.geo(new THREE.BoxGeometry(0.5,len,0.5),rib,m);}
    // the spire
    T.at(new THREE.CylinderGeometry(0.18,0.9,g0+155*H-ya+1,8).translate(0,(g0+155*H-ya+1)/2,0),steel,c[0],ya-1,c[1]);
    T.at(new THREE.SphereGeometry(0.4,8,6),glowing(0xff3020,[1,0.2,0.1]),c[0],g0+155*H,c[1]);
    return T.done(L);},

  // Wells Fargo Center (1972, Charles Luckman): 166 m, the tallest building in Oregon, its slab sheathed in
  // white travertine piers running the full height between strips of bronze glass, its corners clipped
  wellsfargo(L,x,z){const {parts:p,g0}=site('wellsfargo',x,z),T=builder(g0),H=(L.height||166)/164;
    const trav=facade({seed:41,bays:10,floors:12,bw:1.5,fh:3.75,wall:'#ece6da',noise:['#e2dccc','#f4f0e6'],glass:'#4a3e30',win:[0.32,0.06,0.94,0.94],lit:0.4,
      deco:(g,W,Hh,R,pw,ph)=>{g.fillStyle='rgba(40,30,20,0.35)';for(let y=0;y<Hh;y+=ph)g.fillRect(0,y+ph*0.94,W,1);}});
    const base=facade({seed:42,bays:6,floors:2,bw:3,fh:5.5,wall:'#e4ddd0',glass:'#3a3228',win:[0.12,0.1,0.88,0.94],mull:'#1e1a16',lit:0.6,phong:true});
    const band=plain(0xefe9de),q=p[0],top=g0+q.t*H;
    T.wall(q.r,g0,g0+11,base);T.wall(q.r,g0+11,top-4,trav);T.wall(q.r,top-4,top,band);T.cap(q.r,top,roof);
    T.block(p[1].r,top,g0+167*H,band);
    // the masts on the roof
    const c=cen(p[1].r);for(const [dx,dz,hh] of [[-3,1,24],[3,-1,18]])T.at(new THREE.CylinderGeometry(0.25,0.6,hh,6).translate(0,hh/2,0),plain(0x9aa0a6),c[0]+dx,g0+167*H,c[1]+dz);
    return T.done(L);},

  // the U.S. Bancorp Tower, "Big Pink" (1983, Skidmore, Owings & Merrill): its mapped parallelogram run up 166 m in a
  // flush skin of rose glass and pink granite, its two sharp ends cut back in chamfers, on a low wing of the same stone
  usbancorp(L,x,z){const {parts:p,g0}=site('usbancorp',x,z),T=builder(g0),H=(L.height||166)/163;
    const rose=facade({seed:51,bays:10,floors:12,bw:1.5,fh:3.8,wall:'#c48a80',glass:'#a8706c',win:[0.1,0.04,0.96,0.92],sheen:0.22,lit:0.35,phong:true,spec:0x806060,shine:70,glowK:0.8,
      deco:(g,W,Hh,R,pw,ph)=>{g.fillStyle='rgba(70,36,36,0.4)';for(let y=0;y<Hh;y+=ph)g.fillRect(0,y+ph*0.92,W,2);}});
    const gran=facade({seed:52,bays:8,floors:3,bw:2.4,fh:4.2,wall:'#c08a82',noise:['#b47e76','#cc968e'],glass:'#5a3a3a',win:[0.2,0.18,0.8,0.82],lit:0.4});
    const pinkM=plain(0xb48078);
    // the tower: chamfer the acute corners of the parallelogram (the short ends of the plan are cut back)
    const r0=p[3].r,ch=[];for(let i=0;i<r0.length;i++){const a=r0[(i+r0.length-1)%r0.length],b=r0[i],cc=r0[(i+1)%r0.length],u=[a[0]-b[0],a[1]-b[1]],v=[cc[0]-b[0],cc[1]-b[1]],lu=Math.hypot(...u),lv=Math.hypot(...v),cos=(u[0]*v[0]+u[1]*v[1])/(lu*lv);
      if(cos>0.15){const k=5;ch.push([b[0]+u[0]/lu*k,b[1]+u[1]/lu*k],[b[0]+v[0]/lv*k,b[1]+v[1]/lv*k]);}else ch.push(b);}
    const top=g0+163*H;T.wall(ch,g0,top-3,rose);T.wall(ch,top-3,top,pinkM);T.cap(ch,top,pinkM);
    T.block(scaleR(ch,0.86),top,top+3.5,plain(0x8a6a64));
    for(const i of [0,1,2]){const q=p[i];T.wall(q.r,g0,g0+q.t,gran);T.cap(q.r,g0+q.t,roof);}
    return T.done(L);},

  // PacWest Center (1984, Hugh Stubbins): 127 m in bands of black glass and aluminium spandrels wrapped round its
  // rounded corners, the lower block at 85 m in the same skin, on a base of red stone
  pacwest(L,x,z){const {parts:p,g0}=site('pacwest',x,z),T=builder(g0);
    const band=facade({seed:61,bays:10,floors:12,bw:1.5,fh:3.8,wall:'#c4c8cc',glass:'#15191e',win:[0,0.38,1,0.98],sheen:0.12,lit:0.36,phong:true,spec:0x8898a8,shine:90,
      deco:(g,W,Hh,R,pw,ph)=>{g.fillStyle='rgba(255,255,255,0.18)';for(let y=0;y<Hh;y+=ph)g.fillRect(0,y+ph*0.06,W,1);g.fillStyle='#0c0e10';for(let x=0;x<W;x+=pw)g.fillRect(x,0,1,Hh);}});
    const base=facade({seed:62,bays:6,floors:2,bw:3,fh:4,wall:'#8e4a46',glass:'#1e2024',win:[0.1,0.15,0.9,0.92],lit:0.6,phong:true});
    const alu=plain(0xc8ccd0,{phong:true});
    for(const i of [3,1]){const q=p[i];T.wall(q.r,g0,g0+8,base);T.wall(q.r,g0+8,g0+q.t-1.5,band);T.wall(q.r,g0+q.t-1.5,g0+q.t,alu);T.cap(q.r,g0+q.t,roof);}
    for(const i of [0,2]){const q=p[i];T.block(q.r,g0,g0+q.t,base);}
    return T.done(L);},

  // Fox Tower (2000, Thompson Vaivoda): 27 floors of grey-green glass, its east face a long curved prow over Director
  // Park, the flat slabs either side stepping down to 100 m, on a stone and glass base of four floors
  fox(L,x,z){const {parts:p,g0}=site('fox',x,z),T=builder(g0);
    const glass=facade({seed:71,bays:10,floors:12,bw:1.5,fh:3.9,wall:'#9aa6a4',glass:'#557478',win:[0.04,0.06,1,0.96],mull:'#a8b4b4',sheen:0.2,lit:0.4,phong:true,spec:0x7a9aa0,shine:80});
    const stone=facade({seed:72,bays:6,floors:4,bw:3,fh:4,wall:'#b8ad98',noise:['#aea28e','#c2b8a4'],glass:'#2e3a40',win:[0.15,0.15,0.85,0.88],lit:0.5});
    const cap=plain(0xb0b8b8,{phong:true});
    for(const i of [0,3,4]){const q=p[i];T.wall(q.r,g0,g0+16,stone);T.wall(q.r,g0+16,g0+q.t-1.2,glass);T.wall(q.r,g0+q.t-1.2,g0+q.t,cap);T.cap(q.r,g0+q.t,roof);}
    for(const i of [1,2]){const q=p[i];T.block(q.r,g0,g0+q.t,stone);}
    return T.done(L);},

  // Park Avenue West (2016, TVA Architects): 152 m of blue glass between white mullions, its top notched: the shaft's
  // last floors pulled back on one side, a glass fin running on past the roof on the other
  parkave(L,x,z){const {o,g0}=site('parkave',x,z),T=builder(g0),H=L.height||152;
    const glass=facade({seed:81,bays:10,floors:12,bw:1.5,fh:3.6,wall:'#e4e8ea',glass:'#6a8aa4',win:[0.06,0.05,1,0.95],sheen:0.22,lit:0.45,phong:true,spec:0x8ab0c8,shine:80});
    const base=facade({seed:82,bays:6,floors:2,bw:3,fh:5,wall:'#d8d4cc',glass:'#34444e',win:[0.06,0.1,0.94,0.94],mull:'#202428',lit:0.6,phong:true});
    const white=plain(0xeef0f0);
    // the long sides of the plan: the notch cuts the back half of the top floors away
    let li=0,ll=0;for(let i=0;i<o.length;i++){const e=edge(o,i);if(e.len>ll){ll=e.len;li=i;}}
    const e=edge(o,li),f=edge(o,(li+2)%o.length),dep=edge(o,(li+1)%o.length).len,yN=g0+H-16;
    T.wall(o,g0,g0+9,base);T.wall(o,g0+9,yN,glass);T.cap(o,yN,roof);
    // the front half rises on to 146, its glass fin to 152
    const front=[e.a,e.b,e.pt(e.len,-dep*0.55),e.pt(0,-dep*0.55)];T.wall(front,yN,g0+H-6,glass);T.cap(front,g0+H-6,roof);
    slab(T,e,ll*0.1,ll*0.9,-0.6,0.4,g0+H-6,g0+H,glass,white);
    // the back steps once, a floor short of the notch
    const back=[f.a,f.b,f.pt(f.len,-dep*0.45),f.pt(0,-dep*0.45)];T.wall(back,yN,yN+7,glass);T.cap(back,yN+7,roof);
    T.wall(o,yN-0.8,yN,white);
    return T.done(L);},

  // 1000 Broadway (1991): rose granite and glass round a cylinder of glass, capped at 101 m by its rounded crown of
  // dark and pale layers, the "ice-cream sandwich", lit from inside at night
  broadway1000(L,x,z){const {parts:p,g0}=site('broadway1000',x,z),T=builder(g0);
    const gran=facade({seed:91,bays:8,floors:10,bw:1.6,fh:3.8,wall:'#a8776c',noise:['#9c6c62','#b48478'],glass:'#3c4048',win:[0.18,0.14,0.82,0.86],lit:0.4});
    const glass=facade({seed:92,bays:12,floors:12,bw:1.4,fh:3.8,wall:'#8a9aa4',glass:'#4c6474',win:[0.05,0.05,1,0.96],mull:'#9aa8b0',sheen:0.22,lit:0.45,phong:true,spec:0x8aa0b0});
    const base=facade({seed:93,bays:6,floors:3,bw:3,fh:4.6,wall:'#9a6a60',glass:'#2a2e34',win:[0.12,0.12,0.88,0.9],lit:0.55});
    for(let i=0;i<11;i++){const q=p[i];banded(T,q.r,g0+q.b,g0+q.t,gran,plain(0xb8988c),1.2);T.cap(q.r,g0+q.t,roof);}
    T.block(p[12].r,g0,g0+14,base);
    // the rotunda and its cap: a dark layer, a pale one, and the rounded top
    const d=p[11],c=cen(d.r),rad=d.r.reduce((a,v)=>a+Math.hypot(v[0]-c[0],v[1]-c[1]),0)/d.r.length,y=g0+92;
    T.wall(d.r,g0+d.b,y,glass);
    const darkW=plain(0x4a3a34),pale=glowing(0xf2ead8,[0.85,0.8,0.62]),lid=glowing(0x5a463e,[0.3,0.2,0.14]);
    T.at(new THREE.CylinderGeometry(rad+0.8,rad+0.8,2.4,40).translate(0,1.2,0),darkW,c[0],y,c[1]);
    T.at(new THREE.CylinderGeometry(rad+0.5,rad+0.5,2.6,40).translate(0,1.3,0),pale,c[0],y+2.4,c[1]);
    T.at(new THREE.SphereGeometry(rad+0.8,40,10,0,Math.PI*2,0,Math.PI/2).scale(1,(g0+101-(y+5))/(rad+0.8),1),lid,c[0],y+5,c[1]);
    return T.done(L);},

  // Moda Tower (2000): 94 m, its curved face of blue-green glass over a stepped base
  moda(L,x,z){const {parts:p,g0}=site('moda',x,z),T=builder(g0);
    const glass=facade({seed:101,bays:10,floors:12,bw:1.5,fh:3.8,wall:'#8ea0a6',glass:'#4e7884',win:[0.05,0.06,1,0.95],mull:'#a0b0b4',sheen:0.2,lit:0.42,phong:true,spec:0x7aa0a8});
    const stone=facade({seed:102,bays:8,floors:4,bw:2,fh:4,wall:'#c4bcb0',noise:['#b8b0a4','#ccc6ba'],glass:'#34404a',win:[0.18,0.16,0.82,0.86],lit:0.45});
    for(let i=0;i<p.length;i++){const q=p[i];T.wall(q.r,g0,g0+q.t,i<2?glass:stone);T.cap(q.r,g0+q.t,roof);}
    return T.done(L);},

  // the Standard Insurance Center (1964): 112 m of white marble, narrow windows in tall strips, a low wing beside it
  standard(L,x,z){const {parts:p,g0}=site('standard',x,z),T=builder(g0);
    const marble=facade({seed:111,bays:8,floors:12,bw:1.6,fh:3.7,wall:'#ecebe6',noise:['#e2e0da','#f6f5f0'],glass:'#3a424a',win:[0.3,0.04,0.78,0.96],lit:0.42});
    const white=plain(0xf0eee8);
    const q=p[0];T.wall(q.r,g0,g0+q.t-3,marble);T.wall(q.r,g0+q.t-3,g0+q.t,white);T.cap(q.r,g0+q.t,roof);
    T.block(p[1].r,g0,g0+5,white);
    return T.done(L);},

  // Block 216 (2023, GBD): 140 m, the Ritz-Carlton and its offices and flats in dark blue-grey glass, on a stepped
  // podium of pale glass
  block216(L,x,z){const {parts:p,g0}=site('block216',x,z),T=builder(g0);
    const dark=facade({seed:121,bays:12,floors:12,bw:1.4,fh:3.7,wall:'#3e4458',glass:'#4a546e',win:[0.05,0.05,1,0.96],mull:'#2a2e3a',sheen:0.18,lit:0.45,phong:true,spec:0x7080a0,shine:80});
    const pale=facade({seed:122,bays:10,floors:6,bw:1.6,fh:4,wall:'#d8dce0',glass:'#8a9aa8',win:[0.05,0.06,1,0.95],mull:'#e8eaec',sheen:0.2,lit:0.5,phong:true});
    const t=p[6];T.wall(t.r,g0,g0+t.t,dark);T.cap(t.r,g0+t.t,roof);
    T.wall(scaleR(t.r,0.995),g0+t.t,g0+t.t+4,plain(0x2a3040));
    for(const i of [0,1,2,3,4,5,7]){const q=p[i];T.wall(q.r,g0,g0+q.t,pale);T.cap(q.r,g0+q.t,roof);}
    return T.done(L);},

  // Umpqua Bank Plaza, One SW Columbia (1974): 80 m of dark bronze precast and glass beside KOIN
  umpqua(L,x,z){const {parts:p,g0}=site('umpqua',x,z),T=builder(g0);
    const pre=facade({seed:131,bays:8,floors:10,bw:1.6,fh:3.8,wall:'#5c5048',noise:['#54483f','#665a50'],glass:'#262a2e',win:[0.2,0.1,0.82,0.86],lit:0.4});
    const q=p[1];T.wall(q.r,g0,g0+q.t,pre);T.cap(q.r,g0+q.t,roof);T.block(p[0].r,g0,g0+p[0].t,pre);
    return T.done(L);},

  // the Portland Building (1982, Michael Graves): a cream cube with small square windows on a stepped base of
  // blue-green tile. On each face two giant maroon pilasters frame a tall field of dark glass; on Fifth and Fourth a
  // maroon keystone tops them, on Main and Madison the band of blue ribbons. Portlandia (Raymond Kaskey, 1985) kneels
  // in hammered copper on the ledge over the Fifth Avenue door, her trident in her left hand, her right reaching down.
  portlandbldg(L,x,z){const {o,g0}=site('portlandbldg',x,z),T=builder(g0),H=L.height||62;
    const cream=facade({seed:141,bays:10,floors:10,bw:2.4,fh:3.9,wall:'#e6d8b8',noise:['#ded0b0','#ecdec0'],glass:'#2e3640',win:[0.32,0.28,0.68,0.66],lit:0.4});
    const teal=facade({seed:142,bays:8,floors:3,bw:2.4,fh:3.6,wall:'#4c8a7e',noise:['#44807a','#569486'],glass:'#1e2a2c',win:[0.3,0.25,0.7,0.75],lit:0.5});
    const tealM=plain(0x4a8679),maroon=plain(0x7a3428),maroonD=plain(0x6a2c22),mirror=facade({seed:143,bays:6,floors:10,bw:1.8,fh:3.9,wall:'#20262c',glass:'#384a58',win:[0.04,0.06,0.96,0.94],sheen:0.2,lit:0.35,phong:true,spec:0x6a8090});
    const ribbon=plain(0x3e7e8a),creamM=plain(0xe8dabc);
    const inner=scaleR(o,0.9),yB=g0+10.5;
    // the base: two tiers of tile
    T.block(o,g0,g0+6,teal,tealM);T.block(scaleR(o,0.95),g0+6,yB,teal,tealM);
    T.wall(inner,yB,g0+H-0.8,cream);T.wall(inner,g0+H-0.8,g0+H,creamM);T.cap(inner,g0+H,roof);
    // which face is on Fifth: the west-most
    let west=0,wx=1e9;for(let i=0;i<inner.length;i++){const e=edge(inner,i),m=(e.a[0]+e.b[0])/2;if(m<wx){wx=m;west=i;}}
    for(let i=0;i<inner.length;i++){const e=edge(inner,i),L2=e.len,mid=L2/2,pw=L2*0.08,gap=L2*0.11,yt=g0+H*0.72,main=(i-west+4)%2===0;
      // the dark glass between the pilasters, the pilasters themselves, their capitals
      slab(T,e,mid-gap,mid+gap,-0.2,0.25,yB+1,yt,mirror,creamM);
      for(const s of [-1,1]){const a=mid+s*(gap+pw/2);slab(T,e,a-pw/2,a+pw/2,-0.2,1.2,yB,yt,maroon);slab(T,e,a-pw/2-0.8,a+pw/2+0.8,-0.2,1.6,yt,yt+2.2,maroonD);}
      if(main){
        // the keystone: a stepped wedge, widest at the top
        for(let k=0;k<4;k++){const w=gap+pw*1.6+k*1.4;slab(T,e,mid-w,mid+w,-0.2,1.0,yt+2.2+k*2.2,yt+2.2+(k+1)*2.2,maroon);}
      }else{
        // the ribbons: a band with swags in blue-green
        slab(T,e,mid-gap-pw*2,mid+gap+pw*2,-0.2,0.5,yt+3,yt+4.2,ribbon);
        for(let k=-3;k<=3;k++){const a=mid+k*(gap+pw*2)/3.4;slab(T,e,a-0.4,a+0.4,-0.2,0.55,yt+0.6,yt+3,ribbon);}
      }}
    // Portlandia on the ledge over the door
    {const e=edge(inner,west),cu=plain(0x8c6646),s=e.len/2,b=e.pt(s,2.6),ry=Math.atan2(e.n[0],e.n[1]),y=yB+0.5,S=1.0;
      T.block([e.pt(s-6,-0.2),e.pt(s+6,-0.2),e.pt(s+6,3.6),e.pt(s-6,3.6)],yB-0.6,yB+0.5,creamM);
      const put=(g,px,py,pz,rx=0,rz=0)=>{const v=new THREE.Vector3(px,py,pz).applyAxisAngle(new THREE.Vector3(0,1,0),ry);T.at(g,cu,b[0]+v.x,y+v.y,b[1]+v.z,ry,rx,rz);};
      put(new THREE.BoxGeometry(1.6*S,1.0*S,3.0*S),0,0.5,-0.4);
      put(new THREE.CylinderGeometry(0.9*S,1.1*S,3.4*S,10),0,2.6,0.1,-0.25);
      put(new THREE.SphereGeometry(0.7*S,12,10),0,4.9,0.6);
      put(new THREE.CylinderGeometry(0.28*S,0.24*S,3.2*S,8),1.2,3.4,1.2,0.9,-0.4);
      put(new THREE.CylinderGeometry(0.28*S,0.24*S,2.6*S,8),-1.1,3.2,0.4,0,0.3);
      put(new THREE.CylinderGeometry(0.1,0.1,9,6),-1.6,4.0,0.4);
      for(const k of [-0.6,0,0.6])put(new THREE.BoxGeometry(0.12,1.2,0.12),-1.6+k,8.6,0.4);
      put(new THREE.BoxGeometry(1.4,0.12,0.12),-1.6,8.0,0.4);}
    return T.done(L);},
  };
}
// the mapped outlines (o) and parts (p: base b, top t, ring r), metres east and south of each tower's "at"
const PLANS={"koin":{"o":[-12.7,23.8,-11.4,20.2,-14.4,19.1,-13.3,16.2,-16.1,15.1,-15.0,12.2,-17.7,11.1,-16.7,8.3,-19.8,7.1,-18.7,4.3,-21.2,3.3,-16.1,-10.0,-14.2,-9.3,-10.5,-7.9,-3.4,-5.2,-1.1,-11.4,1.2,-17.5,-5.5,-20.1,-9.5,-21.6,-11.5,-22.3,-5.9,-36.9,19.3,-27.3,27.8,-24.1,36.2,-21.0,48.3,-16.4,43.6,-4.0,37.2,12.9,27.3,38.9,21.9,36.9,-8.2,25.5],"p":[{"b":15.0,"t":19.0,"r":[-0.6,-33.2,-5.5,-20.1,1.2,-17.5,-1.1,-11.4,-3.4,-5.2,-10.5,-7.9,-15.6,5.4,-12.8,6.5,-10.0,7.6,-7.0,8.7,-8.1,11.5,-9.2,14.4,-10.3,17.3,-5.8,19.0,-8.2,25.5,21.9,36.9,24.4,30.3,28.6,31.9,33.4,19.1,34.1,17.4,35.9,12.4,37.2,12.9,43.6,-4.0,42.4,-4.4,44.5,-9.9,45.0,-11.3,46.6,-15.5,42.4,-17.1,35.7,-19.6,36.2,-21.0,27.8,-24.1,19.3,-27.3,18.7,-25.9,12.2,-28.4]},{"b":0.0,"t":15.0,"r":[-5.9,-36.9,-11.5,-22.3,-9.5,-21.6,-5.5,-20.1,1.2,-17.5,-1.1,-11.4,-3.4,-5.2,-10.5,-7.9,-14.2,-9.3,-16.1,-10.0,-21.2,3.3,-18.7,4.3,-15.6,5.4,-12.8,6.5,-10.0,7.6,-7.0,8.7,-8.1,11.5,-9.2,14.4,-10.3,17.3,-11.4,20.2,-12.7,23.8,-8.2,25.5,21.9,36.9,27.3,38.9,37.2,12.9,43.6,-4.0,48.3,-16.4,36.2,-21.0,27.8,-24.1,19.3,-27.3]},{"b":0.0,"t":20.0,"r":[-8.1,11.5,-11.1,10.4,-10.0,7.6,-7.0,8.7]},{"b":0.0,"t":16.0,"r":[-9.2,14.4,-12.2,13.3,-11.1,10.4,-13.9,9.3,-12.8,6.5,-10.0,7.6,-7.0,8.7,-8.1,11.5]},{"b":0.0,"t":12.0,"r":[-15.6,5.4,-16.7,8.3,-13.9,9.3,-15.0,12.2,-12.2,13.3,-13.3,16.2,-10.3,17.3,-9.2,14.4,-8.1,11.5,-7.0,8.7,-10.0,7.6,-12.8,6.5]},{"b":0.0,"t":8.0,"r":[-18.7,4.3,-19.8,7.1,-16.7,8.3,-17.7,11.1,-15.0,12.2,-16.1,15.1,-13.3,16.2,-14.4,19.1,-11.4,20.2,-10.3,17.3,-9.2,14.4,-8.1,11.5,-7.0,8.7,-10.0,7.6,-12.8,6.5,-15.6,5.4]},{"b":121.0,"t":132.0,"r":[15.0,-1.0,22.0,1.6,24.8,-5.6,17.7,-8.3]},{"b":113.0,"t":121.0,"r":[13.7,-19.1,13.3,-18.1,12.4,-18.5,9.9,-11.9,8.9,-12.2,5.8,-3.9,6.7,-3.5,4.2,3.2,5.1,3.5,4.8,4.5,11.3,6.9,10.9,7.8,19.4,11.0,19.7,10.1,26.0,12.5,26.3,11.5,27.3,11.9,29.8,5.2,30.9,5.6,34.0,-2.8,33.0,-3.2,35.5,-9.8,34.5,-10.1,34.9,-11.1,28.7,-13.5,29.1,-14.6,20.6,-17.8,20.2,-16.7]},{"b":82.0,"t":113.0,"r":[7.8,-16.6,2.1,-1.7,3.5,-1.1,2.2,2.4,3.2,2.8,2.9,3.7,3.8,4.1,3.5,4.9,4.5,5.3,4.1,6.1,7.1,7.2,6.4,8.9,21.6,14.6,22.2,12.9,25.3,14.1,25.7,13.3,26.6,13.7,26.9,12.8,28.0,13.2,28.3,12.3,29.4,12.7,30.7,9.3,32.2,9.9,37.8,-4.9,36.3,-5.5,37.6,-9.0,36.5,-9.4,36.9,-10.4,35.8,-10.8,36.2,-11.8,35.3,-12.2,35.7,-13.2,32.5,-14.4,33.1,-15.8,17.9,-21.5,17.4,-20.1,14.5,-21.2,14.1,-20.2,13.2,-20.6,12.8,-19.5,11.8,-19.9,11.4,-18.8,10.4,-19.2,9.2,-16.1]},{"b":74.0,"t":78.0,"r":[7.3,-23.9,8.6,-23.4,9.1,-24.8,10.6,-24.2,11.2,-25.7,12.6,-25.1,13.1,-26.6,40.4,-16.3,39.8,-14.9,41.3,-14.3,40.8,-12.8,42.2,-12.3,41.7,-10.9,43.1,-10.4,32.8,16.9,31.3,16.4,30.7,18.1,29.3,17.5,28.8,18.8,27.3,18.3,26.7,19.7,-0.5,9.4,0.0,8.0,-1.4,7.5,-0.9,6.1,-2.4,5.6,-1.7,3.9,-3.1,3.4]},{"b":78.0,"t":82.0,"r":[-0.2,4.5,2.1,-1.7,7.8,-16.6,10.1,-22.9,11.5,-22.3,12.0,-23.7,17.9,-21.5,33.1,-15.8,39.3,-13.4,38.8,-12.0,40.3,-11.5,37.8,-4.9,32.2,9.9,29.9,15.9,28.4,15.3,27.8,16.9,21.6,14.6,6.4,8.9,0.5,6.7,1.2,5.0]},{"b":19.0,"t":74.0,"r":[-3.4,-5.2,-1.1,-11.4,1.2,-17.5,2.2,-20.1,3.8,-19.5,5.7,-24.5,6.3,-25.9,7.8,-25.3,8.3,-26.8,9.7,-26.2,10.2,-27.7,11.7,-27.1,12.2,-28.4,18.7,-25.9,19.3,-27.3,27.8,-24.1,36.2,-21.0,35.7,-19.6,42.4,-17.1,41.9,-15.7,43.3,-15.2,42.7,-13.7,44.2,-13.2,43.6,-11.8,45.0,-11.3,44.5,-9.9,42.4,-4.4,43.6,-4.0,37.2,12.9,35.9,12.4,34.1,17.4,33.4,19.1,32.1,18.6,31.6,19.9,30.2,19.4,29.7,20.8,28.2,20.3,27.7,21.7,21.0,19.2,20.4,20.8,3.5,14.5,4.1,12.8,-2.5,10.3,-1.9,8.9,-3.4,8.3,-2.9,6.9,-4.2,6.4,-3.7,5.1,-5.2,4.5,-4.6,2.8,-2.7,-2.2,-4.4,-2.8]},{"b":121.0,"t":132.0,"r":[22.0,1.6,15.0,-1.0,12.3,6.1,19.3,8.8]},{"b":121.0,"t":132.0,"r":[24.8,-5.6,22.0,1.6,29.0,4.2,31.7,-3.0]},{"b":121.0,"t":132.0,"r":[17.7,-8.3,24.8,-5.6,27.5,-12.8,20.5,-15.4]},{"b":121.0,"t":132.0,"r":[15.0,-1.0,17.7,-8.3,10.7,-10.9,7.9,-3.7]},{"b":19.0,"t":23.0,"r":[-2.5,10.3,4.1,12.8,3.5,14.5,20.4,20.8,21.0,19.2,27.7,21.7,24.4,30.3,-5.8,19.0]}]},"wellsfargo":{"o":[8.0,25.3,2.1,28.0,-34.5,14.1,-36.8,9.1,-29.9,-9.1,-23.1,-26.9,-16.9,-29.7,15.2,-17.6,18.9,-16.2,21.5,-10.2,16.9,1.9,16.4,3.3,15.4,5.9,13.9,9.8,12.9,12.5],"p":[{"b":0.0,"t":164.0,"r":[-36.8,9.1,-29.9,-9.1,-23.1,-26.9,-16.9,-29.7,15.2,-17.6,18.9,-16.2,21.5,-10.2,16.9,1.9,16.4,3.3,15.4,5.9,13.9,9.8,12.9,12.5,8.0,25.3,2.1,28.0,-34.5,14.1]},{"b":0.0,"t":167.0,"r":[-0.7,6.0,3.9,-6.3,-13.6,-12.9,-18.3,-0.6]}]},"usbancorp":{"o":[-1.1,-56.4,-14.9,-19.5,-16.1,-16.1,-17.4,-12.6,-27.8,-12.5,-50.5,46.3,-32.6,64.0,-6.2,88.7,18.0,24.5,32.1,-13.1,33.4,-16.6,34.7,-20.0,48.5,-56.6],"p":[{"b":0.0,"t":28.0,"r":[-14.9,-19.5,-16.1,-16.1,-17.4,-12.6,-27.8,-12.5,-50.5,46.3,-32.6,64.0,-6.2,88.7,18.0,24.5,32.1,-13.1,33.4,-16.6,34.7,-20.0]},{"b":0.0,"t":36.0,"r":[-22.3,38.3,-12.6,12.8,0.3,12.9,-12.7,46.9]},{"b":0.0,"t":32.0,"r":[-22.7,3.8,-36.2,38.4,-7.0,65.0,14.5,9.1,16.6,3.4]},{"b":0.0,"t":163.0,"r":[34.7,-20.0,48.5,-56.6,-1.1,-56.4,-14.9,-19.5]}]},"pacwest":{"o":[9.5,-25.0,10.0,-26.3,9.8,-27.1,9.3,-27.7,-20.9,-39.1,-21.4,-39.0,-21.8,-38.7,-34.0,-6.4,-33.9,-5.9,-33.5,-5.4,-32.3,-5.0,-35.8,4.4,-40.3,16.2,-40.1,17.2,-39.6,18.0,-36.0,19.4,3.2,34.2,4.7,34.1,6.2,33.8,7.9,33.1,9.5,32.2,13.1,22.6,12.0,22.2,11.1,21.2,10.9,20.0,11.8,17.8,18.7,-0.5,19.9,-3.5,20.7,-4.2,21.7,-4.6,22.6,-4.5,23.5,-4.1,25.7,-9.8,27.9,-15.5,27.6,-16.9,26.6,-18.2,25.6,-18.9],"p":[{"b":0.0,"t":10.0,"r":[11.8,17.8,18.7,-0.5,2.5,-6.7,-4.4,11.7]},{"b":0.0,"t":85.0,"r":[4.4,-11.5,2.5,-6.7,-4.4,11.7,-5.7,14.9,-6.1,15.3,-6.8,15.4,-33.7,5.2,-36.5,12.6,-36.4,13.2,-36.0,13.6,-7.3,24.5,-6.7,24.4,-6.2,24.1,6.6,-9.8,6.5,-10.4,6.1,-10.8]},{"b":0.0,"t":8.0,"r":[-35.8,4.4,-34.9,4.7,-33.7,5.2,-6.8,15.4,-6.1,15.3,-5.7,14.9,-4.4,11.7,2.5,-6.7,4.4,-11.5,9.5,-25.0,25.6,-18.9,26.6,-18.2,27.6,-16.9,27.9,-15.5,25.7,-9.8,23.5,-4.1,22.6,-4.5,21.7,-4.6,20.7,-4.2,19.9,-3.5,18.7,-0.5,11.8,17.8,10.9,20.0,11.1,21.2,12.0,22.2,13.1,22.6,9.5,32.2,7.9,33.1,6.2,33.8,4.7,34.1,3.2,34.2,-36.0,19.4,-39.6,18.0,-40.1,17.2,-40.3,16.2]},{"b":0.0,"t":127.0,"r":[-37.1,3.9,-37.4,3.4,-37.5,2.9,-34.9,-4.0,-34.0,-6.4,-21.8,-38.7,-21.4,-39.0,-20.9,-39.1,9.3,-27.7,9.8,-27.1,10.0,-26.3,9.5,-25.0,4.4,-11.5,2.5,-6.7,-4.4,11.7,-5.7,14.9,-6.1,15.3,-6.8,15.4,-33.7,5.2,-34.9,4.7,-35.8,4.4]},{"b":0.0,"t":127.0,"r":[-6.1,15.3,-6.8,15.4,-33.7,5.2,-34.9,4.7,-35.8,4.4,-32.3,-5.0,-33.5,-5.4,-33.9,-5.9,-34.0,-6.4,-21.8,-38.7,-21.4,-39.0,-20.9,-39.1,9.3,-27.7,9.8,-27.1,10.0,-26.3,9.5,-25.0,4.4,-11.5,2.5,-6.7,-4.4,11.7,-5.7,14.9]}]},"fox":{"o":[-12.5,-45.6,-34.3,11.4,-24.8,15.1,-18.2,17.6,2.8,25.6,22.5,33.1,44.4,-23.9,20.1,-33.2],"p":[{"b":0.0,"t":113.0,"r":[16.0,-14.8,17.4,-18.2,18.6,-21.5,19.4,-25.2,20.1,-33.2,1.9,-34.6,0.7,-31.3,0.0,-29.3,-8.4,-30.2,-11.3,-22.3,-12.8,-22.8,-23.2,4.7,-26.1,12.5,-17.6,15.8,-13.3,14.5,-8.9,12.6,-5.3,10.5,-4.2,8.2,-2.6,8.9,1.4,5.8,4.8,2.5,7.9,-0.9,10.7,-4.5,12.9,-8.3,14.6,-11.7]},{"b":0.0,"t":16.0,"r":[2.8,25.6,22.5,33.1,44.4,-23.9,20.1,-33.2,19.4,-25.2,18.6,-21.5,17.4,-18.2,16.0,-14.8,17.9,-14.2]},{"b":0.0,"t":16.0,"r":[-18.2,17.6,-17.6,15.8,-26.1,12.5,-23.2,4.7,-26.1,3.6,-11.2,-35.8,0.7,-31.3,1.9,-34.6,20.1,-33.2,-12.5,-45.6,-34.3,11.4,-24.8,15.1]},{"b":0.0,"t":100.0,"r":[0.0,-29.3,0.7,-31.3,-11.2,-35.8,-26.1,3.6,-23.2,4.7,-12.8,-22.8,-11.3,-22.3,-8.4,-30.2]},{"b":0.0,"t":100.0,"r":[17.9,-14.2,16.0,-14.8,14.6,-11.7,12.9,-8.3,10.7,-4.5,7.9,-0.9,4.8,2.5,1.4,5.8,-2.6,8.9,-4.2,8.2,-5.3,10.5,-8.9,12.6,-13.3,14.5,-17.6,15.8,-18.2,17.6,2.8,25.6]}]},"parkave":{"o":[-3.4,-33.9,-25.1,23.0,3.4,33.9,25.1,-23.0],"p":[]},"broadway1000":{"o":[-22.7,23.9,-24.7,19.8,-22.5,14.3,-17.7,1.4,-16.4,-2.0,-15.0,-5.7,-13.5,-9.4,-12.2,-12.8,-7.4,-25.6,-5.3,-31.1,-1.1,-33.0,18.5,-25.5,21.4,-24.4,24.4,-23.3,23.2,-20.3,21.1,-14.8,16.3,-2.0,13.6,5.1,10.8,12.3,6.0,25.1,3.8,30.6,2.7,33.6,-0.3,32.4,-3.2,31.3],"p":[{"b":14.0,"t":39.0,"r":[-0.3,32.4,2.7,33.6,3.8,30.6,0.8,29.5]},{"b":14.0,"t":39.0,"r":[21.4,-24.4,20.3,-21.5,23.2,-20.3,24.4,-23.3]},{"b":14.0,"t":18.2,"r":[-24.7,19.8,-22.7,23.9,-21.6,21.0]},{"b":14.0,"t":18.2,"r":[-5.3,-31.1,-2.2,-30.0,-1.1,-33.0]},{"b":14.0,"t":51.4,"r":[-15.9,-1.8,-16.4,-2.0,-17.7,1.4,-15.7,2.2,-10.3,-12.1,-12.2,-12.8,-13.5,-9.4,-13.1,-9.2]},{"b":14.0,"t":30.6,"r":[-13.5,-9.4,-15.0,-5.7,-16.4,-2.0,-15.9,-1.8,-13.1,-9.2]},{"b":14.0,"t":30.6,"r":[10.8,12.3,8.9,11.5,14.3,-2.7,16.3,-2.0,13.6,5.1]},{"b":14.0,"t":76.5,"r":[-5.3,-31.1,-7.4,-25.6,21.1,-14.8,23.2,-20.3,20.3,-21.5,21.4,-24.4,18.5,-25.5,-1.1,-33.0,-2.2,-30.0]},{"b":14.0,"t":76.5,"r":[-24.7,19.8,-21.6,21.0,-22.7,23.9,-3.2,31.3,-0.3,32.4,0.8,29.5,3.8,30.6,6.0,25.1,-22.5,14.3]},{"b":14.0,"t":89.0,"r":[-17.7,1.4,-22.5,14.3,6.0,25.1,10.8,12.3]},{"b":14.0,"t":89.0,"r":[-12.2,-12.8,-7.4,-25.6,21.1,-14.8,16.3,-2.0]},{"b":30.6,"t":101.0,"r":[13.6,5.1,14.5,1.3,14.3,-2.7,13.2,-6.5,11.1,-9.9,8.2,-12.6,4.7,-14.5,0.8,-15.4,-3.1,-15.3,-6.9,-14.2,-10.3,-12.1,-13.1,-9.2,-15.0,-5.7,-15.9,-1.8,-15.7,2.2,-14.6,6.0,-12.5,9.3,-9.6,12.1,-6.1,14.0,-2.2,14.9,1.7,14.7,5.5,13.6,8.9,11.5,11.7,8.6]},{"b":0.0,"t":14.0,"r":[2.7,33.6,3.8,30.6,10.8,12.3,13.6,5.1,16.3,-2.0,21.1,-14.8,23.2,-20.3,24.4,-23.3,21.4,-24.4,18.5,-25.5,-1.1,-33.0,-5.3,-31.1,-7.4,-25.6,-12.2,-12.8,-13.5,-9.4,-15.0,-5.7,-16.4,-2.0,-17.7,1.4,-22.5,14.3,-24.7,19.8,-22.7,23.9,-3.2,31.3,-0.3,32.4]}]},"moda":{"o":[34.7,-12.1,33.4,-8.8,13.1,44.6,-0.6,39.4,-23.9,30.5,-42.5,23.5,-25.8,-20.4,-20.9,-33.2,-2.3,-26.2,8.0,-22.2,26.9,-15.1],"p":[{"b":0.0,"t":94.0,"r":[8.0,-22.2,6.8,-19.0,-2.4,-22.4,-17.9,18.1,0.7,35.8,5.3,40.2,10.4,34.2,15.5,27.0,20.5,19.1,24.1,12.3,28.4,2.9,33.4,-8.8,25.6,-11.8,26.9,-15.1]},{"b":0.0,"t":64.0,"r":[-17.9,18.1,-2.4,-22.4,6.8,-19.0,8.0,-22.2,-2.3,-26.2,-3.5,-22.9,-19.4,18.7,-23.9,30.5,-0.6,39.4,0.7,35.8]},{"b":0.0,"t":20.0,"r":[-19.4,18.7,-23.4,17.2,-7.6,-24.4,-3.5,-22.9]},{"b":0.0,"t":12.0,"r":[15.5,27.0,20.5,19.1,24.1,12.3,28.4,2.9,33.4,-8.8,13.1,44.6,-0.6,39.4,0.7,35.8,5.3,40.2,10.4,34.2]},{"b":0.0,"t":12.0,"r":[25.6,-11.8,33.4,-8.8,34.7,-12.1,26.9,-15.1]},{"b":0.0,"t":12.0,"r":[-20.9,-33.2,-25.8,-20.4,-42.5,23.5,-23.9,30.5,-19.4,18.7,-23.4,17.2,-7.6,-24.4,-3.5,-22.9,-2.3,-26.2]}]},"standard":{"o":[-14.8,-32.4,15.2,-21.1,26.3,-16.9,8.5,30.0,-2.8,25.8,-32.5,14.6],"p":[{"b":0.0,"t":112.0,"r":[15.2,-21.1,-14.8,-32.4,-32.5,14.6,-2.8,25.8]},{"b":0.0,"t":4.0,"r":[-2.8,25.8,8.5,30.0,26.3,-16.9,15.2,-21.1]}]},"portlandbldg":{"o":[16.4,38.7,-37.9,18.1,-16.4,-38.7,37.9,-18.1],"p":[]},"block216":{"o":[15.5,45.3,30.1,6.9,33.8,-2.7,37.5,-12.4,22.6,-18.0,9.1,-23.1,-12.7,-31.4,-18.5,-22.6,-24.6,-25.0,-42.9,23.1,-35.9,25.8,-14.1,34.0],"p":[{"b":0.0,"t":32.0,"r":[-2.6,16.5,-0.0,17.3,3.0,7.5,4.5,8.1,23.3,15.2,13.5,41.0,-12.3,31.3]},{"b":0.0,"t":24.0,"r":[7.0,-6.7,10.0,-5.6,26.8,0.9,25.2,5.0,8.4,-1.4,4.5,8.1,3.0,7.5,6.6,-3.6]},{"b":0.0,"t":28.0,"r":[15.5,45.3,-14.1,34.0,-12.3,31.3,13.5,41.0,23.3,15.2,4.5,8.1,8.4,-1.4,25.2,5.0,30.1,6.9]},{"b":0.0,"t":20.0,"r":[33.8,-2.7,30.1,6.9,25.2,5.0,26.8,0.9,10.0,-5.6,12.2,-11.0,29.0,-4.5]},{"b":0.0,"t":16.0,"r":[10.0,-5.6,7.0,-6.7,8.3,-17.0,30.5,-8.6,29.0,-4.5,12.2,-11.0]},{"b":0.0,"t":12.0,"r":[9.1,-23.1,22.6,-18.0,37.5,-12.4,33.8,-2.7,29.0,-4.5,30.5,-8.6,8.3,-17.0]},{"b":0.0,"t":140.0,"r":[-26.7,-15.0,-33.4,6.1,-35.9,25.8,-14.1,34.0,-12.3,31.3,-2.6,16.5,-0.0,17.3,3.0,7.5,6.6,-3.6,7.0,-6.7,8.3,-17.0,9.1,-23.1,-12.7,-31.4,-18.5,-22.6,-24.1,-14.2]},{"b":0.0,"t":28.0,"r":[-18.5,-22.6,-24.1,-14.2,-26.7,-15.0,-33.4,6.1,-35.9,25.8,-42.9,23.1,-24.6,-25.0]}]},"umpqua":{"o":[-26.5,-31.9,-31.8,-17.9,-38.2,-1.1,5.0,15.3,3.5,19.3,7.2,20.7,6.6,22.2,12.2,24.3,23.8,-6.4,18.0,-8.6,20.1,-14.2,0.2,-21.7],"p":[{"b":0.0,"t":8.0,"r":[18.0,-8.6,8.4,16.6,5.0,15.3,3.5,19.3,7.2,20.7,6.6,22.2,12.2,24.3,23.8,-6.4]},{"b":0.0,"t":80.0,"r":[8.4,16.6,5.0,15.3,-38.2,-1.1,-26.5,-31.9,0.2,-21.7,20.1,-14.2,18.0,-8.6]}]}};
