// Portland's civic and low landmarks, built on their OpenStreetMap outlines (the outlines and heights travel in each
// landmark's entry in data/cities/portland.json, as [lat, lon]): Pioneer Courthouse and its cupola, Pioneer Courthouse
// Square (the brick plaza, the amphitheatre steps, the Weather Machine, the milepost, the fountains), Union Station and
// its clock tower with "Go By Train", Powell's corner sign, the Portland Art Museum's three buildings, the Moda Center,
// the Veterans Memorial Coliseum's glass box with the black bowl inside, the Oregon Convention Center's two glass
// spires, Providence Park's stands and pitch, the Lan Su Chinese Garden (its walls, lake and pavilions) and Mill Ends
// Park. Windows, clock faces and signs light up at night.
//
// Each model is handed (L,x,z) as the engine's own are (src/engine/stages/04-landmarks.js): L is the entry, x and z
// where it stands. src/portland/main.js hands this file to build() in ctx.models.
export function civic(api){
  const {THREE,P,animHooks,nightF,windowF,hour,gh,groundMin,inPoly,areaNamed,mergeParts}=api;
  // every model's static parts merged into one mesh per material (alike materials shared): built part by part, the
  // eleven models were ~450 draw calls and halved the frame rate. A part an animation hook moves (userData.keep), a
  // group, a hidden or multi-material part stays as it is.
  const MKEY=new Map(),mkey=m=>{const c=x=>x&&x.getHex?x.getHex():'',t=x=>x?x.uuid:'',G=GLOW.find(e=>e.m===m);
    return [m.type,c(m.color),c(m.emissive),c(m.specular),m.shininess,t(m.map),t(m.emissiveMap),m.transparent,m.opacity,m.side,m.alphaTest,m.depthWrite,
      m.vertexColors,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,G?G.k+'/'+G.a:''].join('|');};
  const group=(L,parts)=>{const bins=new Map(),out=[];
    for(const p of parts){const m=p.material,g=p.geometry;
      if(!p.isMesh||p.isInstancedMesh||p.children.length||p.userData.keep||!p.visible||Array.isArray(m)||!g||!g.attributes.normal||p.renderOrder){out.push(p);continue;}
      const k=mkey(m);let mat=MKEY.get(k);if(!mat)MKEY.set(k,mat=m);let b=bins.get(mat);if(!b)bins.set(mat,b=[]);b.push(p);}
    for(const [mat,ms] of bins)out.push(ms.length===1&&ms[0].material===mat?ms[0]:mergeParts(ms,mat));
    return api.group(L,out);};
  const ring=ll=>(ll||[]).map(p=>P(p));
  const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  // ---------- lighting: one hook for every lit material. 'win' follows the office hours (windowF), 'night' the dark
  const GLOW=[];let lastKey=-1;
  const glow=(m,k,a)=>{GLOW.push({m,k,a:a==null?1:a});m.emissiveIntensity=0;return m;};
  animHooks.push(()=>{const h=hour(),n=nightF(h),w=windowF(h),key=Math.round(n*200)*1000+Math.round(w*200);if(key===lastKey)return;lastKey=key;
    for(const g of GLOW)g.m.emissiveIntensity=(g.k==='win'?Math.max(w,n*0.55):n)*g.a;});
  // ---------- canvas textures
  function canvasTex(w,h,draw,o){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
    const t=new THREE.CanvasTexture(c);if(!(o&&o.clamp))t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
  // a facade: one bay by one storey per texture repeat; returns a material whose emissive map is its window panes
  // a facade: the texture is four bays by three storeys (u counts bays, v storeys: the material repeats it a
  // quarter and a third), so the panes lit at night can differ from bay to bay; o.on is the share of them lit
  function facade(o){const B=128,NX=4,NY=3,W=B*NX,H=B*NY,wx=B*(1-o.winW)/2,ww=B*o.winW,wy=B*(1-o.winY-o.winH),wh=B*o.winH,on=o.on==null?0.6:o.on;
    const pane=(g,fill,bx,by)=>{const x0=bx+wx,y0=by+wy;g.fillStyle=fill;g.beginPath();if(o.arch){g.moveTo(x0,y0+wh);g.lineTo(x0,y0+ww/2);g.arc(x0+ww/2,y0+ww/2,ww/2,Math.PI,0);g.lineTo(x0+ww,y0+wh);}else g.rect(x0,y0,ww,wh);g.fill();};
    const each=f=>{for(let j=0;j<NY;j++)for(let i=0;i<NX;i++)f(i*B,j*B,i,j);};
    const map=canvasTex(W,H,(g)=>{g.fillStyle=o.wall;g.fillRect(0,0,W,H);
      if(o.brick){g.strokeStyle='rgba(0,0,0,0.12)';g.lineWidth=1;for(let y=0;y<H;y+=6){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}}
      each((bx,by)=>{if(o.band){g.fillStyle=o.band;g.fillRect(bx,by+B*0.93,B,B*0.07);}
        if(o.blank)return;if(o.trim){g.fillStyle=o.trim;g.fillRect(bx+wx-5,by+wy-5,ww+10,wh+10);if(o.arch){g.beginPath();g.arc(bx+wx+ww/2,by+wy+ww/2,ww/2+5,Math.PI,0);g.fill();}}
        pane(g,o.glass,bx,by);if(o.mull){g.fillStyle=o.mull;g.fillRect(bx+wx+ww/2-1.5,by+wy,3,wh);g.fillRect(bx+wx,by+wy+wh*0.55,ww,3);}});});
    // which panes are lit: a fixed scatter, the same on every copy of the tile
    const em=canvasTex(W,H,(g)=>{g.fillStyle='#000';g.fillRect(0,0,W,H);if(!o.blank)each((bx,by,i,j)=>{const k=((i*7+j*5+i*j*3)%10)/10;if(k<on)pane(g,o.lit||'#ffd49a',bx,by);});});
    map.repeat.set(1/NX,1/NY);em.repeat.set(1/NX,1/NY);
    const m=lam(0xffffff,{map,emissive:0xffffff,emissiveMap:em});return glow(m,'win',o.litA);}
  // text on a plate: lines [{t, c, s (size in px), f (font)}]; bg null leaves it transparent (neon letters on their own)
  function textTex(lines,o){const W=o.w||1024,H=o.h||256;return canvasTex(W,H,(g)=>{if(o.bg){g.fillStyle=o.bg;g.fillRect(0,0,W,H);}
      if(o.border){g.strokeStyle=o.border;g.lineWidth=10;g.strokeRect(8,8,W-16,H-16);}
      g.textAlign='center';g.textBaseline='middle';let y=0;const tot=lines.reduce((s,l)=>s+l.s*1.15,0);y=(H-tot)/2;
      for(const l of lines){g.font=(l.f||'bold')+' '+l.s+'px '+(l.ff||'Georgia, serif');g.fillStyle=l.c;y+=l.s*0.575;g.fillText(l.t,W/2,y,W*0.94);y+=l.s*0.575;}},{clamp:true});}
  function signMat(tex,transparent,a){const m=lam(0xffffff,{map:tex,emissive:0xffffff,emissiveMap:tex,transparent:!!transparent,alphaTest:transparent?0.4:0,side:THREE.DoubleSide});return glow(m,'night',a==null?1:a);}
  // a plane facing (nx,nz)
  function plate(m,w,h,px,py,pz,nx,nz){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(px,py,pz);p.rotation.y=Math.atan2(nx,nz);return p;}
  // ---------- geometry
  function MB(){const pos=[],uv=[];const mb={
    tri(a,b,c,ua,ub,uc,want){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(want&&nx*want[0]+ny*want[1]+nz*want[2]<0){[b,c]=[c,b];[ub,uc]=[uc,ub];}
      pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);uv.push(...(ua||[0,0]),...(ub||[0,0]),...(uc||[0,0]));},
    quad(a,b,c,d,ua,ub,uc,ud,want){mb.tri(a,b,c,ua,ub,uc,want);mb.tri(a,c,d,ua,uc,ud,want);},
    get empty(){return pos.length===0;},
    mesh(m){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return new THREE.Mesh(g,m);}};return mb;}
  const fy=(y,p)=>typeof y==='function'?y(p[0],p[1]):y;
  // which way is out: +1 when (dz,-dx) points out of the ring for an edge (dx,dz)
  function outS(r){for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<0.3)continue;
      return inPoly((a[0]+b[0])/2+dz/l*0.05,(a[1]+b[1])/2-dx/l*0.05,r)?-1:1;}return 1;}
  // drop the points that lie within tol of the line through their neighbours
  function simplify(r,tol){r=r.slice();let ch=true;while(ch&&r.length>4){ch=false;for(let i=0;i<r.length&&r.length>4;i++){const p=r[(i-1+r.length)%r.length],c=r[i],q=r[(i+1)%r.length];
      const dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1e-6,d=Math.abs((c[0]-p[0])*dz-(c[1]-p[1])*dx)/l;if(d<tol){r.splice(i,1);i--;ch=true;}}}return r;}
  // the ring moved d inwards (negative: outwards), corners mitred and the mitre capped
  function inset(r,d){const s=outS(r),n=r.length,out=[];const nm=(x,z)=>{const l=Math.hypot(x,z)||1;return [x/l,z/l];};
    for(let i=0;i<n;i++){const p=r[(i-1+n)%n],c=r[i],q=r[(i+1)%n],e1=nm(c[0]-p[0],c[1]-p[1]),e2=nm(q[0]-c[0],q[1]-c[1]);
      const n1=[-s*e1[1],s*e1[0]],n2=[-s*e2[1],s*e2[0]],k=1+n1[0]*n2[0]+n1[1]*n2[1];let bx=n1[0]+n2[0],bz=n1[1]+n2[1];const f=k>0.08?1/k:12;bx*=f;bz*=f;
      const ml=Math.hypot(bx,bz);if(ml>2.6){bx*=2.6/ml;bz*=2.6/ml;}out.push([c[0]+bx*d,c[1]+bz*d]);}return out;}
  const centroid=r=>{let x=0,z=0;for(const p of r){x+=p[0];z+=p[1];}return [x/r.length,z/r.length];};
  // the long axis of a ring: [ux,uz], and its half-lengths along and across it
  function axis(r){const [cx,cz]=centroid(r);let xx=0,zz=0,xz=0;for(const [x,z] of r){xx+=(x-cx)**2;zz+=(z-cz)**2;xz+=(x-cx)*(z-cz);}
    const th=0.5*Math.atan2(2*xz,xx-zz),ux=Math.cos(th),uz=Math.sin(th);let a=0,b=0;for(const [x,z] of r){a=Math.max(a,Math.abs((x-cx)*ux+(z-cz)*uz));b=Math.max(b,Math.abs(-(x-cx)*uz+(z-cz)*ux));}
    return {cx,cz,ux,uz,a,b};}
  // the walls round a ring from y0 to y1 (numbers or functions of x,z); u counts whole bays of bw, v storeys of sh above base
  function walls(mb,r,y0,y1,o){o=o||{};const bw=o.bw==null?4:o.bw,sh=o.sh==null?4:o.sh,base=o.base==null?0:o.base,s=outS(r)*(o.inward?-1:1);
    for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<0.02)continue;
      const n=Math.max(1,Math.round(l/bw)),ya0=fy(y0,a),yb0=fy(y0,b),ya1=fy(y1,a),yb1=fy(y1,b);
      mb.quad([a[0],ya0,a[1]],[b[0],yb0,b[1]],[b[0],yb1,b[1]],[a[0],ya1,a[1]],[0,(ya0-base)/sh],[n,(yb0-base)/sh],[n,(yb1-base)/sh],[0,(ya1-base)/sh],[s*dz,0,-s*dx]);}}
  // a flat (or per-point) lid over a ring, with holes; u,v in metres / uvs
  function cap(r,y,m,o){o=o||{};const sh=new THREE.Shape(r.map(([px,pz])=>new THREE.Vector2(px,-pz)));
    for(const h of o.holes||[])sh.holes.push(new THREE.Path(h.map(([px,pz])=>new THREE.Vector2(px,-pz))));
    const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv,us=o.uvs||1;
    for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);p.setY(i,fy(y,[px,pz]));uv.setXY(i,px/us,pz/us);}
    g.computeVertexNormals();return new THREE.Mesh(g,m);}
  // the band between a ring and its inset, at heights yo (outer) and yi (inner): a roof slope, a wall's coping
  function annulus(mb,ro,ri,yo,yi){for(let i=0;i<ro.length;i++){const j=(i+1)%ro.length;
      mb.quad([ro[i][0],fy(yo,ro[i]),ro[i][1]],[ro[j][0],fy(yo,ro[j]),ro[j][1]],[ri[j][0],fy(yi,ri[j]),ri[j][1]],[ri[i][0],fy(yi,ri[i]),ri[i][1]],null,null,null,null,[0,1,0]);}}
  // a hipped roof: the slopes up from the eaves to the ring set in by d, and its flat top
  function hip(r,y,d,rise,m){const mb=MB(),ri=inset(r,d);annulus(mb,r,ri,y,y+rise);return [mb.mesh(m),cap(ri,y+rise,m)];}
  // a solid slab: walls and a lid
  function slab(r,y0,y1,m,o){const mb=MB();walls(mb,r,y0,y1,o);return [mb.mesh(m),cap(r,y1,m,o)];}
  // a dome over a ring: rings drawn in towards the middle
  function dome(r,y,rise,m,steps){const [cx,cz]=centroid(r),mb=MB();steps=steps||6;let prev=r,py=y;
    for(let k=1;k<=steps;k++){const t=k/steps,s=Math.cos(t*Math.PI/2)*0.92+0.08*(1-t),yy=y+rise*Math.sin(t*Math.PI/2),cur=r.map(([px,pz])=>[cx+(px-cx)*s,cz+(pz-cz)*s]);
      annulus(mb,prev,cur,py,yy);prev=cur;py=yy;}return [mb.mesh(m),cap(prev,py,m)];}
  // a mesh with its corners set (for the turf, the clock)
  const at=(o,m)=>{o.position.set(...m);return o;};
  const cyl=(rt,rb,h,seg,m,px,py,pz)=>at(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg).translate(0,h/2,0),m),[px,py,pz]);
  const boxAt=(w,h,d,m,px,py,pz,ry)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(px,py,pz);b.rotation.y=ry||0;return b;};
  const edges=(mesh,c)=>{const l=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,25),new THREE.LineBasicMaterial({color:c}));l.position.copy(mesh.position);l.rotation.copy(mesh.rotation);return l;};
  // a ring clipped to an axis-aligned cell (Sutherland-Hodgman against the cell's four sides)
    const clip=(poly,x0,z0,x1,z1)=>{for(const [ax2,v,keep] of [[0,x0,1],[0,x1,-1],[1,z0,1],[1,z1,-1]]){const out=[];const ins=p=>(p[ax2]-v)*keep>=0;
        for(let i=0;i<poly.length;i++){const a2=poly[i],b2=poly[(i+1)%poly.length],ia=ins(a2),ib=ins(b2);if(ia)out.push(a2);
          if(ia!==ib){const t=(v-a2[ax2])/(b2[ax2]-a2[ax2]);out.push([a2[0]+(b2[0]-a2[0])*t,a2[1]+(b2[1]-a2[1])*t]);}}poly=out;if(poly.length<3)return poly;}return poly;};
  const partsOf=(L,name)=>(L.parts||[]).filter(p=>!name||p.name===name);
  // distance from a point to a ring's edge
  const ringDist=(x,z,r)=>{let d=1e9;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1e-9,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2));d=Math.min(d,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}return d;};

  // shared materials
  const stoneM=lam(0xcfc6b0),trimM=lam(0xe6dfcc),slateM=lam(0x55595c),brickTrimM=lam(0xd8c8a6),bronzeM=new THREE.MeshPhongMaterial({color:0x8a6a3a,specular:0x887755,shininess:40});
  const graniteM=lam(0x8c8a86),waterM=new THREE.MeshPhongMaterial({color:0x3f6e86,specular:0xffffff,shininess:90,transparent:true,opacity:0.88});

  return {
  // Pioneer Courthouse (1869-75): the oldest federal building in the Pacific Northwest, Italianate, three storeys of
  // pale sandstone with arched windows under a low hipped roof, its octagonal wooden cupola in the middle
  courthouse(L,x,z){const r=simplify(ring(L.outline),0.35);if(r.length<3)return null;const g0=groundMin(r),E=L.eave==null?14.5:L.eave,parts=[];
    const fac=facade({wall:'#cdc4ad',trim:'#e8e1cf',glass:'#2b2f35',winW:0.34,winH:0.6,winY:0.2,arch:true,mull:'#d9d2c0',lit:'#ffdca8'});
    const mb=MB();walls(mb,r,g0-1,g0+E,{base:g0,bw:3.4,sh:E/3});parts.push(mb.mesh(fac));
    for(const [d,y0,y1,m] of [[0.3,g0-1,g0+1.3,graniteM],[0.12,g0+E/3,g0+E/3+0.35,trimM],[0.12,g0+2*E/3,g0+2*E/3+0.35,trimM],[0.7,g0+E-0.3,g0+E+0.9,trimM]])parts.push(...slab(inset(r,-d),y0,y1,m));
    const R0=inset(r,-0.7),RT=g0+E+0.9,rise=L.roofRise==null?4.2:L.roofRise;parts.push(...hip(R0,RT,7,rise,slateM));
    // the cupola: an octagonal drum with round-headed windows, a cornice, a ribbed dome, a lantern and a finial
    const [cx,cz]=centroid(r),cy=RT+rise,wood=lam(0xeae6da),domeM=lam(0x6a6e70),winC=glow(lam(0x2c3036,{emissive:0xffd8a0}),'night',0.9);
    parts.push(cyl(4.2,4.4,1.2,8,trimM,cx,cy,cz),cyl(3.2,3.2,5,8,wood,cx,cy+1.2,cz),cyl(3.25,3.25,2.6,8,winC,cx,cy+2.2,cz));
    for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;parts.push(boxAt(0.5,5,0.5,wood,cx+Math.cos(a)*3.15,cy+1.2,cz+Math.sin(a)*3.15,-a));}
    parts.push(cyl(3.8,3.6,0.6,8,trimM,cx,cy+6.2,cz));
    const dm=new THREE.Mesh(new THREE.SphereGeometry(3.3,8,6,0,Math.PI*2,0,Math.PI/2),domeM);dm.scale.y=0.85;dm.position.set(cx,cy+6.8,cz);parts.push(dm);
    parts.push(cyl(0.8,0.8,1.6,8,wood,cx,cy+9.5,cz),cyl(0.05,0.9,0.4,8,domeM,cx,cy+11.1,cz),cyl(0.03,0.12,2.2,6,bronzeM,cx,cy+11.5,cz));
    return group(L,parts);},

  // Pioneer Courthouse Square (1984): "Portland's living room", a block of red brick laid in the street's grid, stepped
  // down like an amphitheatre towards the Courthouse across Sixth Avenue; the Weather Machine (1988) on its column,
  // the milepost of signs to the sister cities, the waterfall fountain on Broadway, the man with the umbrella
  pioneerSquare(L,x,z){const a=areaNamed(/^Pioneer Courthouse Square$/i,x,z);const r=a&&Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)<80?a.o:null;if(!r)return null;
    const parts=[],ax=axis(r),bb={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9};for(const [px,pz] of r){bb.x0=Math.min(bb.x0,px);bb.x1=Math.max(bb.x1,px);bb.z0=Math.min(bb.z0,pz);bb.z1=Math.max(bb.z1,pz);}
    const brick=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#8a4a3a';g.fillRect(0,0,w,h);for(let j=0;j<16;j++)for(let i=0;i<8;i++){const o=(j%2)*8;g.fillStyle=['#9a5040','#8d4636','#a35a46','#7f4232'][(i*7+j*3)%4];g.fillRect(i*16+o+1,j*8+1,14,6);}});
    const brickM=lam(0xffffff,{map:brick,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16}),stepM=lam(0xffffff,{map:brick});
    // the amphitheatre: steps in a half-ring round a low floor on the east, rising west towards Broadway
    const C=[ax.cx+(L.bowlAt?L.bowlAt[0]:10),ax.cz+(L.bowlAt?L.bowlAt[1]:2)],gb=gh(C[0],C[1])+0.45,R0=9,ST=1.3,N=8,RISE=0.38;
    const inBowl=(px,pz)=>{const dx=px-C[0],dz=pz-C[1],d=Math.hypot(dx,dz);return d<R0+N*ST&&(dx<=0||d<R0);};
    // the plaza: a 1.5 m grid laid on the ground, flat across the bowl's floor, each cell cut to the square's outline
    {const mb=MB(),S=1.5,hy=(px,pz)=>Math.hypot(px-C[0],pz-C[1])<R0?gb:gh(px,pz)+0.45;
      for(let px=bb.x0;px<bb.x1;px+=S)for(let pz=bb.z0;pz<bb.z1;pz+=S){const mx=px+S/2,mz=pz+S/2;if(inBowl(mx,mz)&&Math.hypot(mx-C[0],mz-C[1])>=R0)continue;
        const cell=inPoly(px,pz,r)&&inPoly(px+S,pz,r)&&inPoly(px+S,pz+S,r)&&inPoly(px,pz+S,r)?[[px,pz],[px+S,pz],[px+S,pz+S],[px,pz+S]]:clip(r,px,pz,px+S,pz+S);if(cell.length<3)continue;
        const v=cell.map(([qx,qz])=>[qx,hy(qx,qz),qz]),u=cell.map(([qx,qz])=>[qx/4,qz/4]);for(let i=1;i+1<v.length;i++)mb.tri(v[0],v[i],v[i+1],u[0],u[i],u[i+1],[0,1,0]);}
      parts.push(mb.mesh(brickM));}
    {const mb=MB(),DA=Math.PI/30;for(let k=0;k<N;k++){const r0=R0+k*ST,r1=r0+ST,y=gb+RISE*(k+1);
        for(let t=Math.PI/2;t<Math.PI*1.5-1e-6;t+=DA){const c0=Math.cos(t),s0=Math.sin(t),c1=Math.cos(t+DA),s1=Math.sin(t+DA),mx=C[0]+Math.cos(t+DA/2)*(r0+ST/2),mz=C[1]+Math.sin(t+DA/2)*(r0+ST/2);
          if(!inPoly(mx,mz,r))continue;const yl=Math.min(gb-0.5,gh(mx,mz)-0.6);
          const p=(rr,c,s,yy)=>[C[0]+c*rr,yy,C[1]+s*rr],uvp=(rr,c,s)=>[(C[0]+c*rr)/4,(C[1]+s*rr)/4];
          mb.quad(p(r0,c0,s0,y),p(r1,c0,s0,y),p(r1,c1,s1,y),p(r0,c1,s1,y),uvp(r0,c0,s0),uvp(r1,c0,s0),uvp(r1,c1,s1),uvp(r0,c1,s1),[0,1,0]);
          mb.quad(p(r0,c0,s0,yl),p(r0,c1,s1,yl),p(r0,c1,s1,y),p(r0,c0,s0,y),[0,0],[1,0],[1,RISE*4],[0,RISE*4],[-Math.cos(t+DA/2),0,-Math.sin(t+DA/2)]);
          if(k===N-1)mb.quad(p(r1,c0,s0,yl),p(r1,c1,s1,yl),p(r1,c1,s1,y),p(r1,c0,s0,y),[0,0],[1,0],[1,1],[0,1],[Math.cos(t+DA/2),0,Math.sin(t+DA/2)]);
          // the ends of the half-ring, closed
          for(const [te,sg] of [[Math.PI/2,-1],[Math.PI*1.5,1]])if(Math.abs(t-te)<1e-4||Math.abs(t+DA-te)<1e-4){const ce=Math.cos(te),se=Math.sin(te);
            mb.quad(p(r0,ce,se,yl),p(r1,ce,se,yl),p(r1,ce,se,y),p(r0,ce,se,y),[0,0],[1,0],[1,1],[0,1],[-se*sg,0,ce*sg]);}}}
      parts.push(mb.mesh(stepM));}
    // the Weather Machine: a bronze column on a granite drum, the temperature lights round its neck, a globe and the
    // day's sign on top (the sun, the heron for drizzle, the dragon for storms), turned once at noon
    if(L.weather){const [wx,wz]=P(L.weather),wg=gh(wx,wz)+0.15;parts.push(cyl(1.6,1.8,0.5,16,graniteM,wx,wg,wz),cyl(1.1,1.2,0.5,16,graniteM,wx,wg+0.5,wz),cyl(0.22,0.32,7.2,12,bronzeM,wx,wg+1,wz));
      const lights=glow(lam(0xd0d0d0,{emissive:0xff5030}),'night',1.2);parts.push(cyl(0.55,0.55,0.35,16,lights,wx,wg+7.6,wz));
      const globe=new THREE.Mesh(new THREE.SphereGeometry(0.75,16,12),bronzeM);globe.position.set(wx,wg+8.7,wz);parts.push(globe);
      const sym=new THREE.Group();sym.position.set(wx,wg+9.45,wz);const gold=new THREE.MeshPhongMaterial({color:0xd8b040,specular:0xffffcc,shininess:80,emissive:0x302000});
      sym.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.08,20).rotateX(Math.PI/2).translate(0,0.6,0),gold));
      for(let k=0;k<12;k++){const ray=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.38,0.06),gold);const a2=k*Math.PI/6;ray.position.set(Math.cos(a2)*0.78,0.6+Math.sin(a2)*0.78,0);ray.rotation.z=a2-Math.PI/2;sym.add(ray);}
      sym.userData.keep=true;parts.push(sym);animHooks.push(()=>{const h=hour();sym.rotation.y=(h>11.98&&h<12.08)?(h-11.98)*60:0;});}
    // the milepost: arrows to Portland's sister cities, each pointing along the great circle, the miles worked out here
    if(L.milepost){const [mx,mz]=P(L.milepost),mg=gh(mx,mz)+0.15,post=lam(0x2f3a36);parts.push(cyl(0.12,0.14,6.6,10,post,mx,mg,mz));
      const lat0=L.at[0]*Math.PI/180,lon0=L.at[1]*Math.PI/180;
      (L.signs||[]).forEach(([name,la,lo],k)=>{const p1=la*Math.PI/180,l1=lo*Math.PI/180,dl=l1-lon0;
        const brg=Math.atan2(Math.sin(dl)*Math.cos(p1),Math.cos(lat0)*Math.sin(p1)-Math.sin(lat0)*Math.cos(p1)*Math.cos(dl));
        const mi=Math.round(3958.8*2*Math.asin(Math.sqrt(Math.sin((p1-lat0)/2)**2+Math.cos(lat0)*Math.cos(p1)*Math.sin(dl/2)**2)));
        const tex=textTex([{t:name.toUpperCase()+'  '+mi.toLocaleString('en-US')+' mi',c:'#f4f0e4',s:84,ff:'Arial, sans-serif'}],{w:1024,h:128,bg:['#2f6a4a','#2a4a7a','#8a3a2a','#6a5a2a'][k%4]});
        const m=lam(0xffffff,{map:tex,side:THREE.DoubleSide}),len=1.7,sg=new THREE.Mesh(new THREE.PlaneGeometry(len,0.24),m);
        // an arrow along the bearing (north is -z): its middle half a length out from the post
        const ex=Math.sin(brg),ez=-Math.cos(brg);sg.position.set(mx+ex*(len/2+0.12),mg+5.9-k*0.36,mz+ez*(len/2+0.12));sg.rotation.y=Math.atan2(-ez,ex);parts.push(sg);});}
    // the waterfall fountain's basins on Broadway
    for(const f of L.fountains||[]){const fr=ring(f);if(fr.length<3)continue;const fg=groundMin(fr)+0.15;parts.push(...slab(inset(fr,-0.35),fg-0.3,fg+0.55,graniteM));parts.push(cap(fr,fg+0.5,waterM));}
    // "Allow Me" (1983): the bronze man in a raincoat hailing a cab with his umbrella
    if(L.allowMe){const [sx,sz]=P(L.allowMe),sg=gh(sx,sz)+0.15,b2=lam(0x3a3228);parts.push(cyl(0.22,0.26,1.45,10,b2,sx,sg,sz),cyl(0.13,0.13,0.25,8,b2,sx,sg+1.45,sz));
      const hd=new THREE.Mesh(new THREE.SphereGeometry(0.13,10,8),b2);hd.position.set(sx,sg+1.78,sz);parts.push(hd);
      const um=new THREE.Mesh(new THREE.ConeGeometry(0.62,0.32,10),b2);um.position.set(sx+0.15,sg+2.22,sz);parts.push(um,cyl(0.015,0.015,0.6,4,b2,sx+0.15,sg+1.6,sz));}
    return group(L,parts);},

  // Union Station (1896): brick and stucco under a hipped tile roof, laid along the tracks, and its 150 ft clock tower
  // with UNION STATION and GO BY TRAIN in red neon round it (1948)
  unionStation(L,x,z){const r=simplify(ring(L.outline),0.6);if(r.length<3)return null;const g0=groundMin(r),E=L.eave==null?12.5:L.eave,parts=[],ax=axis(r);
    const fac=facade({wall:'#a65c48',trim:'#ddcfae',glass:'#2a2c30',winW:0.42,winH:0.6,winY:0.2,arch:true,brick:true,mull:'#cfc3a2',lit:'#ffd8a0'});
    const mb=MB();walls(mb,r,g0-1,g0+E,{base:g0,bw:3.6,sh:E/3});parts.push(mb.mesh(fac));
    for(const [d,y0,y1,m] of [[0.25,g0-1,g0+1.0,graniteM],[0.1,g0+E/3,g0+E/3+0.3,brickTrimM],[0.6,g0+E-0.3,g0+E+0.8,brickTrimM]])parts.push(...slab(inset(r,-d),y0,y1,m));
    const roofM=lam(0x9a4e42);parts.push(...hip(inset(r,-0.6),g0+E+0.8,5.5,5.2,roofM));
    // the tower, on the footprint the map gives it, squared to the station
    const tr=ring(L.tower),[tx,tz]=tr.length?centroid(tr):[x,z],S=L.towerSide==null?7:L.towerSide,TH=L.towerH==null?46:L.towerH,ry=-Math.atan2(ax.uz,ax.ux),tg=gh(tx,tz);
    const tfac=facade({wall:'#a65c48',trim:'#ddcfae',glass:'#2a2c30',winW:0.3,winH:0.5,winY:0.3,arch:true,brick:true,lit:'#ffd8a0'});
    const shaft=new THREE.Mesh(new THREE.BoxGeometry(S,30,S).translate(0,15,0),tfac);shaft.position.set(tx,tg-1,tz);shaft.rotation.y=ry;
    const tuv=shaft.geometry.attributes.uv;for(let i=0;i<tuv.count;i++)tuv.setXY(i,tuv.getX(i)*2,tuv.getY(i)*6);parts.push(shaft);
    for(const [w,y0,h,m] of [[S+0.6,tg-1,2,graniteM],[S+0.5,tg+28.5,0.6,brickTrimM],[S-0.2,tg+29.1,6,lam(0xdcceae)],[S+0.6,tg+35.1,0.6,brickTrimM],[S-0.6,tg+35.7,4,lam(0x8e5040)],[S+0.8,tg+39.7,0.6,brickTrimM]])parts.push(boxAt(w,h,w,m,tx,y0,tz,ry));
    const cone=new THREE.Mesh(new THREE.ConeGeometry((S+0.6)/Math.SQRT2,TH-tg-40.3+tg,4).translate(0,(TH-40.3)/2,0),roofM);cone.position.set(tx,tg+40.3,tz);cone.rotation.y=ry+Math.PI/4;parts.push(cone);
    parts.push(cyl(0.04,0.1,2.2,6,bronzeM,tx,tg+TH-0.4,tz));
    // the belfry's open arches: dark recesses on each face
    const dark=lam(0x1c1a18),faceM=glow(lam(0xf4f0e2,{emissive:0xfff2d0}),'night',0.9),handM=lam(0x111111);
    const gbt=textTex([{t:'GO BY TRAIN',c:'#ff3a24',s:150,ff:'Arial, sans-serif'}],{w:1024,h:200}),ust=textTex([{t:'UNION STATION',c:'#ff3a24',s:140,ff:'Arial, sans-serif'}],{w:1024,h:200});
    const neonG=signMat(gbt,true,1.6),neonU=signMat(ust,true,1.6);
    for(let k=0;k<4;k++){const a=ry+k*Math.PI/2,nx=Math.sin(a),nz=Math.cos(a),o=S/2+0.02;
      for(const s2 of [-1,1])parts.push(plate(dark,1.3,2.6,tx+nx*(S/2-0.28)+nz*s2*1.4,tg+37.3,tz+nz*(S/2-0.28)-nx*s2*1.4,nx,nz));
      const cf=new THREE.Mesh(new THREE.CircleGeometry(1.75,28),faceM);cf.position.set(tx+nx*(S/2-0.08),tg+32.1,tz+nz*(S/2-0.08));cf.rotation.y=Math.atan2(nx,nz);parts.push(cf);
      const rim=new THREE.Mesh(new THREE.RingGeometry(1.75,1.95,28),brickTrimM);rim.position.copy(cf.position);rim.rotation.copy(cf.rotation);parts.push(rim);
      // the hands, set to the hour of the model's day
      for(const [len,w,kind] of [[1.0,0.12,'h'],[1.5,0.08,'m']]){const hm=new THREE.Mesh(new THREE.BoxGeometry(w,len,0.04).translate(0,len/2,0),handM);hm.position.set(tx+nx*(S/2-0.02),tg+32.1,tz+nz*(S/2-0.02));hm.rotation.y=Math.atan2(nx,nz);
        hm.userData.keep=true;animHooks.push(()=>{const h=hour();hm.rotation.z=-(kind==='h'?((h%12)/12):(h%1))*Math.PI*2;});parts.push(hm);}
      parts.push(plate(k%2?neonG:neonU,S*0.94,S*0.94*200/1024,tx+nx*o,tg+26.6,tz+nz*o,nx,nz));}
    return group(L,parts);},

  // Powell's City of Books: the whole block between Burnside, Couch, 10th and 11th. The map draws the building; this
  // is the corner sign over the door at 10th and Burnside, the shop windows, and the Pillar of Books at 11th and Couch
  powells(L,x,z){const pts=(L.parts||[]).flatMap(p=>ring(p.outline));if(pts.length<4)return null;const parts=[];
    const ext=f=>pts.reduce((b,p)=>f(p)>f(b)?p:b,pts[0]),SE=ext(p=>p[0]+p[1]),NW=ext(p=>-p[0]-p[1]),SW=ext(p=>p[1]-p[0]),NE=ext(p=>p[0]-p[1]);
    // the shop windows along Burnside (SW to SE) and 10th (SE to NE), lit in the evening
    // the shop windows: the stacks and the coloured spines behind the glass, lit warm in the evening
    const shopTex=canvasTex(256,192,(g,w,h)=>{g.fillStyle='#2a2f34';g.fillRect(0,0,w,h);g.fillStyle='#d8cdb0';g.fillRect(0,0,w,12);
      const cols=['#b8342c','#2a5a8a','#d8a83a','#3a7a4a','#6a3a6a','#e8e0cc','#1e3a5a','#a8582a'];
      for(let row=0;row<3;row++){const y0=34+row*52;g.fillStyle='#5a4030';g.fillRect(8,y0+40,w-16,5);for(let x=10,k=row*5;x<w-12;k++){const bw=5+(k*7)%6;g.fillStyle=cols[(k*5+row)%cols.length];g.fillRect(x,y0+8+(k*3)%6,bw,32-(k*3)%6);x+=bw+1;}}
      g.fillStyle='rgba(200,220,235,0.18)';g.fillRect(0,0,w,h);g.fillStyle='#1a1a1c';g.fillRect(0,0,5,h);g.fillRect(w-5,0,5,h);g.fillRect(0,h-6,w,6);},{clamp:true});
    const shop=glow(lam(0xffffff,{map:shopTex,emissive:0xb88850,emissiveMap:shopTex}),'win',0.75);
    for(const [a,b] of [[SW,SE],[SE,NE]]){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,nx=uz,nz=-ux,o=(nx*(SE[0]-x)+nz*(SE[1]-z))>0?1:-1;
      for(let s=3;s<l-3;s+=4.5){const px=a[0]+ux*s+nx*o*0.12,pz=a[1]+uz*s+nz*o*0.12;parts.push(plate(shop,3.6,2.6,px,gh(px,pz)+1.8,pz,nx*o,nz*o));}}
    // the corner sign: POWELL'S CITY OF BOOKS, white and red on black, across the corner
    const [cx,cz]=SE,cg=gh(cx,cz),ox=(SE[0]-NW[0]),oz=(SE[1]-NW[1]),ol=Math.hypot(ox,oz),nx=ox/ol,nz=oz/ol;
    const tex=textTex([{t:"POWELL'S",c:'#e8322a',s:130,ff:'Georgia, serif'},{t:'CITY OF BOOKS',c:'#f4efe2',s:84,ff:'Georgia, serif'}],{w:1024,h:384,bg:'#1a1a1c',border:'#c8a24a'});
    const sm=signMat(tex,false,0.9),frame=lam(0x1a1a1c);
    // it stands on the low corner building's roof, set back a metre from the corner, on two legs
    const sx=cx-nx*1.0,sz=cz-nz*1.0,rf=Math.max(cg+3,api.roofAt(cx-nx*3,cz-nz*3)||cg+3.9),ry=Math.atan2(nx,nz),tx2=Math.cos(ry),tz2=-Math.sin(ry);
    parts.push(boxAt(6.6,2.6,0.4,frame,sx,rf+0.7,sz,ry));for(const s2 of [1,-1])parts.push(plate(sm,6.4,2.4,sx+nx*s2*0.21,rf+2.0,sz+nz*s2*0.21,nx*s2,nz*s2));
    for(const s2 of [-1,1])parts.push(boxAt(0.2,0.8,0.2,frame,sx+tx2*s2*2.4,rf-0.1,sz+tz2*s2*2.4));
    // the marquee over the corner door
    parts.push(boxAt(5,0.4,2.2,lam(0x2a2a2c),cx+nx*0.9,cg+3.4,cz+nz*0.9,Math.atan2(nx,nz)));
    // the Pillar of Books (2000): eight granite books stacked at the door on 11th and Couch
    {const [px,pz]=NW,pg=gh(px,pz);let y=pg;for(let k=0;k<8;k++){const w=1.25-k*0.05,h=0.22+((k*5)%3)*0.06;parts.push(boxAt(w,h,w*0.72,graniteM,px-nx*1.2,y,pz-nz*1.2,k*0.37));y+=h;}}
    return group(L,parts);},

  // the Portland Art Museum: the 1932 Belluschi building (brick, travertine trim, almost windowless), the Mark Building
  // (the 1924 Masonic Temple, stone, with its windows) and the glass Rothko Pavilion (2023) joining them
  artMuseum(L,x,z){const parts=[];
    for(const p of L.parts||[]){const r=simplify(ring(p.outline),0.3);if(r.length<3)continue;const g0=groundMin(r),H=p.h;
      if(p.kind==='glass'){const mull=canvasTex(64,128,(g,w,h)=>{g.fillStyle='#a8c0c8';g.fillRect(0,0,w,h);g.fillStyle='#3a4448';g.fillRect(0,0,4,h);g.fillRect(0,0,w,4);});
        const gm=glow(new THREE.MeshPhongMaterial({map:mull,color:0xffffff,specular:0xffffff,shininess:90,transparent:true,opacity:0.55,depthWrite:false,emissive:0xd8a868,emissiveMap:mull}),'win',0.35);
        const mb=MB();walls(mb,r,g0-0.5,g0+H,{base:g0,bw:1.8,sh:H/2});const gw=mb.mesh(gm);gw.renderOrder=2;
        parts.push(gw,...slab(inset(r,-0.3),g0+H,g0+H+0.6,lam(0xe8e6e0)),...slab(inset(r,0.6),g0+H/2-0.3,g0+H/2,lam(0xd8d2c4)),cap(inset(r,0.2),g0+0.1,glow(lam(0xc8beac,{emissive:0x806040}),'win',0.6)));continue;}
      const brick=p.kind==='brick',fac=facade(brick?{wall:'#8e4c3c',blank:true,brick:true}:{wall:'#d3c8b0',trim:'#e6dfcc',glass:'#30343a',winW:0.4,winH:0.55,winY:0.22,lit:'#ffe0b0'});
      const mb=MB();walls(mb,r,g0-0.5,g0+H,{base:g0,bw:3.6,sh:brick?H:4.2});parts.push(mb.mesh(fac),cap(r,g0+H,lam(0x6a6866)));
      for(const [d,y0,y1] of [[0.2,g0-0.5,g0+1.2],[0.45,g0+H-1.4,g0+H+0.5]])parts.push(...slab(inset(r,-d),y0,y1,lam(0xe2d9c4)));
      // the banners on the Park Blocks face: the longest east-facing wall of the brick wing
      if(brick){let best=null;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),s=outS(r),nx=s*dz/l,nz=-s*dx/l;if(nx>0.6&&(!best||l>best.l))best={a,dx,dz,l,nx,nz};}
        if(best)[0.3,0.5,0.7].forEach((t,k)=>{const tex=textTex([{t:'PORTLAND ART MUSEUM',c:'#ffffff',s:110,ff:'Arial, sans-serif'}],{w:1024,h:160,bg:['#b8282c','#1f5a6a','#b8282c'][k]});
          tex.center.set(0.5,0.5);tex.rotation=Math.PI/2;const m=signMat(tex,false,0.35),px=best.a[0]+best.dx*t+best.nx*0.5,pz=best.a[1]+best.dz*t+best.nz*0.5;
          parts.push(plate(m,1.6,7.5,px,g0+H-5.5,pz,best.nx,best.nz));});}}
    return parts.length?group(L,parts):null;},

  // the Moda Center (1995): the Trail Blazers' arena, precast stone round glass concourses, under a low white dome
  moda(L,x,z){const r=simplify(ring(L.outline),0.5);if(r.length<3)return null;const g0=groundMin(r),E=L.eave==null?21.3:L.eave,parts=[],ax=axis(r);
    const fac=facade({wall:'#c9bda6',glass:'#3a5260',winW:0.94,winH:0.36,winY:0.1,lit:'#e8b878',band:'#a89c86',on:0.75,litA:0.5});
    const mb=MB();walls(mb,r,g0-1,g0+E,{base:g0,bw:8,sh:E/2});parts.push(mb.mesh(fac));parts.push(...slab(inset(r,-0.6),g0+E-0.4,g0+E+0.8,lam(0xe4ddcc)));
    parts.push(...dome(inset(r,-0.6),g0+E+0.8,L.domeRise==null?14:L.domeRise,lam(0xebece9),7));
    const tex=textTex([{t:'MODA CENTER',c:'#ffffff',s:150,ff:'Arial, sans-serif'}],{w:1024,h:220,bg:'#1c1c20'});const sm=signMat(tex,false,1.0);
    for(const [nx,nz] of [[-ax.uz,ax.ux],[ax.uz,-ax.ux],[ax.ux,ax.uz],[-ax.ux,-ax.uz]]){let best=null;for(const p of r){const d=(p[0]-ax.cx)*nx+(p[1]-ax.cz)*nz;if(!best||d>best.d)best={d,p};}
      parts.push(plate(sm,22,22*220/1024,ax.cx+nx*(best.d+1.2),g0+E-4.2,ax.cz+nz*(best.d+1.2),nx,nz));}
    return group(L,parts);},

  // the Veterans Memorial Coliseum (1960): a glass box under a white roof slab on four columns, the arena's black
  // bowl standing free inside it, seen through the glass
  coliseum(L,x,z){const r=simplify(ring(L.outline),0.5);if(r.length<3)return null;const g0=groundMin(r),H=L.h==null?20:L.h,parts=[],ax=axis(r);
    const mull=canvasTex(64,128,(g,w,h)=>{g.fillStyle='#9cb2ae';g.fillRect(0,0,w,h);g.fillStyle='#2a3234';g.fillRect(0,0,3,h);g.fillRect(0,0,w,3);g.fillRect(0,h/2-1,w,2);});
    const glass=glow(new THREE.MeshPhongMaterial({map:mull,color:0xffffff,specular:0xffffff,shininess:100,transparent:true,opacity:0.42,depthWrite:false,side:THREE.DoubleSide,emissive:0xffd8a0}),'night',0.18);
    const mb=MB();walls(mb,r,g0,g0+H,{base:g0,bw:1.6,sh:H/6});const gl=mb.mesh(glass);gl.renderOrder=2;parts.push(gl);
    parts.push(...slab(inset(r,-1.2),g0+H,g0+H+2.2,lam(0xecece9)),...slab(inset(r,0.4),g0-0.3,g0+0.15,lam(0x9a968e)));
    // the bowl: a black drum, wider at the top, and the lit concourse round its foot
    const RI=ringDist(ax.cx,ax.cz,r),RX=RI*0.8,RZ=RI*0.74,ry=-Math.atan2(ax.uz,ax.ux),bowlM=lam(0x161618),bh=H-5;
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(1,0.78,1,40,1,false).translate(0,0.5,0),bowlM);bowl.scale.set(RX,bh,RZ);bowl.position.set(ax.cx,g0+3,ax.cz);bowl.rotation.y=ry;parts.push(bowl);
    const conc=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,1,40,1,true).translate(0,0.5,0),glow(lam(0x3a3a3a,{emissive:0xfff0d0}),'night',0.9));conc.scale.set(RX,3,RZ);conc.position.set(ax.cx,g0,ax.cz);conc.rotation.y=ry;parts.push(conc);
    for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const px=ax.cx+ax.ux*a*ax.a*0.55-ax.uz*b*ax.b*0.55,pz=ax.cz+ax.uz*a*ax.a*0.55+ax.ux*b*ax.b*0.55;parts.push(boxAt(1.6,H,1.6,lam(0x5a5a58),px,g0,pz,ry));}
    return group(L,parts);},

  // the Oregon Convention Center's twin spires (1990): towers of glass in steps, 250 ft, lit from within at night.
  // The halls themselves are the map's; these are its glass parts, each with the height and sloped glass roof it is mapped with
  occ(L,x,z){const parts=[],gm=glow(new THREE.MeshPhongMaterial({color:0x9cc6d6,specular:0xffffff,shininess:110,transparent:true,opacity:0.8,emissive:0x9ad4ff,side:THREE.DoubleSide}),'night',0.85),steel=0x3a4650;
    for(const p of L.parts||[]){const r=ring(p.outline);if(r.length<3)continue;const g0=groundMin(r),H=p.h;
      if(r.length<=3||H>70){const [cx,cz]=centroid(r),top=g0+H,sp=new THREE.Mesh(new THREE.ConeGeometry(1.1,14,4).translate(0,7,0),gm);sp.position.set(cx,top-14,cz);sp.rotation.y=Math.PI/4;parts.push(sp,edges(sp,steel));continue;}
      // a skillion: the roof rises roofH across the part towards roofDir (NE)
      const dir={N:[0,-1],NE:[0.707,-0.707],E:[1,0],SE:[0.707,0.707],S:[0,1],SW:[-0.707,0.707],W:[-1,0],NW:[-0.707,-0.707]}[p.roofDir||'NE'],pr=r.map(q=>q[0]*dir[0]+q[1]*dir[1]),lo=Math.min(...pr),hi=Math.max(...pr);
      const top=(px,pz)=>g0+H-(p.roofH||0)+(p.roofH||0)*((px*dir[0]+pz*dir[1]-lo)/((hi-lo)||1));
      const mb=MB();walls(mb,r,g0,top);const w=mb.mesh(gm),c=cap(r,top,gm);w.renderOrder=c.renderOrder=2;parts.push(w,c,edges(w,steel),edges(c,steel));}
    return parts.length?group(L,parts):null;},

  // Providence Park (1926, rebuilt 2001, the east stand 2019): the Timbers' and Thorns' ground. Stands raked up from
  // the pitch, roofs over them with the floodlights along their edges, the pitch marked out and lit at night
  providence(L,x,z){const S=ring(L.outline),PT=ring(L.pitch);if(S.length<3||PT.length<3)return null;const parts=[],gp=Math.max(...PT.map(([px,pz])=>gh(px,pz)))+0.3,OFF={polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16};
    // the pitch: a quad on its four corners, marked from its own long and short sides
    {const q=simplify(PT,0.5).slice(0,4),l01=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]),l12=Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1]),long=l01>l12;
      const W=1024,Hh=Math.round(1024*Math.min(l01,l12)/Math.max(l01,l12));
      const tex=canvasTex(W,Hh,(g)=>{for(let i=0;i<12;i++){g.fillStyle=i%2?'#3f7a36':'#467f3a';g.fillRect(i*W/12,0,W/12,Hh);}g.strokeStyle='#f4f4ee';g.lineWidth=4;
        const m=W*0.03;g.strokeRect(m,m,W-2*m,Hh-2*m);g.beginPath();g.moveTo(W/2,m);g.lineTo(W/2,Hh-m);g.stroke();g.beginPath();g.arc(W/2,Hh/2,Hh*0.13,0,Math.PI*2);g.stroke();
        for(const s of [0,1]){const bx=s?W-m:m,d=s?-1:1;g.strokeRect(Math.min(bx,bx+d*W*0.155),Hh/2-Hh*0.3,W*0.155,Hh*0.6);g.strokeRect(Math.min(bx,bx+d*W*0.052),Hh/2-Hh*0.13,W*0.052,Hh*0.26);}},{clamp:true});
      const m=glow(lam(0xffffff,Object.assign({map:tex,emissive:0xffffff,emissiveMap:tex},OFF)),'night',0.45);
      const uv=long?[[0,0],[1,0],[1,1],[0,1]]:[[0,1],[0,0],[1,0],[1,1]],mb=MB(),P3=q.map(p=>[p[0],gp,p[1]]);mb.quad(P3[0],P3[1],P3[2],P3[3],uv[0],uv[1],uv[2],uv[3],[0,1,0]);parts.push(mb.mesh(m));
      parts.push(cap(S,gp-0.06,lam(0x3a5234,OFF)));}
    const seatM=lam(0x22483a),wallM=facade({wall:'#bdb6a8',trim:'#d6cfbf',glass:'#2c3034',winW:0.5,winH:0.45,winY:0.15,arch:true,lit:'#ffe4b8'}),roofM=lam(0xdedcd6),lightM=glow(lam(0xdddddd,{emissive:0xffffff}),'night',1.5);
    for(const st of L.stands||[]){const sr=simplify(ring(st.outline),0.4);if(sr.length<3)continue;const H=st.h,top=(px,pz)=>gp+1.2+Math.min(H-1.2,ringDist(px,pz,PT)*(st.rake==null?0.55:st.rake));
      const mb=MB();walls(mb,sr,gp-1,top,{base:gp,bw:5,sh:H/4});parts.push(mb.mesh(wallM),cap(sr,top,seatM));
      if(st.roof){const RY=gp+H+5,D0=(st.roofFrom==null?0.38:st.roofFrom)*(H-1.2)/(st.rake==null?0.55:st.rake),bb=sr.reduce((q,[px,pz])=>[Math.min(q[0],px),Math.min(q[1],pz),Math.max(q[2],px),Math.max(q[3],pz)],[1e9,1e9,-1e9,-1e9]);
        // the roof covers the back of the stand: a 2 m grid cut to the stand, the cells nearer the pitch than D0 left open
        const mb3=MB(),G=2;for(let px=bb[0];px<bb[2];px+=G)for(let pz=bb[1];pz<bb[3];pz+=G){if(ringDist(px+G/2,pz+G/2,PT)<D0)continue;const c=clip(sr,px,pz,px+G,pz+G);if(c.length<3)continue;
          for(let k=1;k+1<c.length;k++){mb3.tri([c[0][0],RY,c[0][1]],[c[k][0],RY,c[k][1]],[c[k+1][0],RY,c[k+1][1]],null,null,null,[0,1,0]);mb3.tri([c[0][0],RY-0.5,c[0][1]],[c[k][0],RY-0.5,c[k][1]],[c[k+1][0],RY-0.5,c[k+1][1]],null,null,null,[0,-1,0]);}}
        if(!mb3.empty)parts.push(mb3.mesh(roofM));
        // the floodlight banks along the roof's front, every 12 m round the pitch, and the posts at the back
        for(let i=0;i<PT.length;i++){const a=PT[i],b=PT[(i+1)%PT.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=6;t<l;t+=12){const qx=a[0]+(b[0]-a[0])*t/l,qz=a[1]+(b[1]-a[1])*t/l,ox=(b[1]-a[1])/l,oz=-(b[0]-a[0])/l,sg=inPoly(qx+ox,qz+oz,PT)?-1:1,fx=qx+ox*sg*(D0+0.6),fz=qz+oz*sg*(D0+0.6);
          if(inPoly(fx,fz,sr))parts.push(boxAt(3,0.6,0.4,lightM,fx,RY-1.1,fz,Math.atan2(ox,oz)));}}
        for(let i=0;i<sr.length;i+=2){const a=sr[i];if(ringDist(a[0],a[1],PT)>(H-1.2)/0.55)parts.push(boxAt(0.6,RY-gp+1,0.6,lam(0x6a6a68),a[0],gp-1,a[1]));}}}
    return group(L,parts);},

  // the Lan Su Chinese Garden (2000): a walled Suzhou garden, built by craftsmen from Portland's sister city; white
  // walls under grey tile, Zither Lake in the middle, its halls and pavilions on their mapped footprints with
  // up-swept eaves, the rocks from Lake Tai, bamboo against the walls, red lanterns at night
  lanSu(L,x,z){const W=ring(L.outline);if(W.length<3)return null;const parts=[],g0=groundMin(W),tile=lam(0x3c4044),plaster=lam(0xeeeae0),red=lam(0x7a2a22),stone=lam(0xa8a49a);
    // the lake: a lobed ring round its middle (mapped outlines put the pavilions on its shores)
    const LC=L.lake?P(L.lake.at):centroid(W),LR=L.lake?L.lake.r:[13,9],lake=[];for(let k=0;k<28;k++){const t=k/28*Math.PI*2,f=1+0.12*Math.cos(3*t+0.6)+0.07*Math.cos(5*t+1.9);lake.push([LC[0]+Math.cos(t)*LR[0]*f,LC[1]+Math.sin(t)*LR[1]*f]);}
    const pave=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#8e8b82';g.fillRect(0,0,w,h);g.strokeStyle='#6e6b64';g.lineWidth=2;for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(i*16+8,j*16+8,6,0,Math.PI*2);g.stroke();}});
    const WI=inset(W,0.45);const OFF={polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16},lakeM=waterM.clone();Object.assign(lakeM,OFF);
    parts.push(cap(WI,g0+0.4,lam(0xffffff,Object.assign({map:pave},OFF)),{holes:[lake],uvs:2}),cap(lake,g0+0.15,lakeM));
    {const mb=MB();walls(mb,lake,g0-0.3,g0+0.4,{inward:true});parts.push(mb.mesh(stone));}
    // the walls: plaster both sides, a grey tile coping with a ridge
    {const mb=MB();walls(mb,W,g0-0.5,g0+3.4,{});walls(mb,WI,g0,g0+3.4,{inward:true});parts.push(mb.mesh(plaster));
      const mb2=MB(),Wo=inset(W,-0.3),Wi=inset(W,0.75),Wm=inset(W,0.22);annulus(mb2,Wo,Wm,g0+3.4,g0+3.95);annulus(mb2,Wi,Wm,g0+3.4,g0+3.95);
      walls(mb2,Wo,g0+3.3,g0+3.4,{});walls(mb2,Wi,g0+3.3,g0+3.4,{inward:true});parts.push(mb2.mesh(tile));}
    // the halls and pavilions
    const lantern=glow(lam(0xb02a20,{emissive:0xff5a30}),'night',1.2),lattice=facade({wall:'#ece6d8',trim:'#5a3a28',glass:'#6a4a34',winW:0.7,winH:0.55,winY:0.25,mull:'#3a2418',lit:'#ffcc88'});
    for(const pv of L.pavilions||[]){const pr=simplify(ring(pv.outline),0.25);if(pr.length<3)continue;const pg=groundMin(pr),H=pv.h,two=H>=8,open=!!pv.open,eave=pg+(two?6.4:open?3.2:3.6),ax=axis(pr);
      parts.push(...slab(inset(pr,-0.45),pg-0.4,pg+0.45,stone));
      const cols=simplify(inset(pr,0.25),0.6);for(const c of cols)parts.push(cyl(0.16,0.16,eave-pg-0.45,8,red,c[0],pg+0.45,c[1]));
      if(!open){const mb=MB();walls(mb,inset(pr,0.35),pg+0.45,eave,{base:pg,bw:2.2,sh:two?3:eave-pg});parts.push(mb.mesh(lattice));}
      if(two)parts.push(...hip(inset(pr,-1.2),pg+3.4,1.2,0.9,tile),...slab(inset(pr,0.1),pg+3.4,pg+3.6,tile));
      // the roof: hipped, overhanging, its ridge along the long side, the corners swept up
      const ro=inset(pr,-1.1),d=Math.max(0.6,ax.b+1.1-0.4);parts.push(...hip(ro,eave,Math.min(d,ax.a+0.6),pg+H-eave,tile));
      const [cx,cz]=centroid(pr);if(ro.length<=10)for(const c of simplify(ro,0.8)){const dx=c[0]-cx,dz=c[1]-cz,dl=Math.hypot(dx,dz)||1,tip=new THREE.Mesh(new THREE.ConeGeometry(0.16,1.5,5).translate(0,0.75,0),tile);
        tip.position.set(c[0],eave-0.1,c[1]);tip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/dl,0.85,dz/dl).normalize());parts.push(tip);}
      const ln=new THREE.Mesh(new THREE.SphereGeometry(0.32,10,8),lantern);ln.scale.y=1.3;ln.position.set(cx,eave-0.9,cz);parts.push(ln);}
    // the Lake Tai rocks round the shore, and bamboo against the walls
    const rockM=lam(0x9a9890),bam=lam(0x5a8a3a);for(let k=0;k<11;k++){const t=k/11*Math.PI*2+0.3,f=1.05+0.1*Math.cos(k*2.3),rx=LC[0]+Math.cos(t)*LR[0]*f*1.12,rz=LC[1]+Math.sin(t)*LR[1]*f*1.12;if(!inPoly(rx,rz,WI))continue;
      const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(0.7+0.3*((k*7)%3),0),rockM);rk.scale.set(1,1.4+0.5*((k*3)%2),0.8);rk.position.set(rx,g0+0.5,rz);rk.rotation.set(k*0.7,k*1.3,k*0.4);parts.push(rk);}
    for(let k=0;k<WI.length;k+=2){const a=WI[k],[cx,cz]=centroid(WI),dx=cx-a[0],dz=cz-a[1],dl=Math.hypot(dx,dz)||1;for(let j=0;j<6;j++){const bx=a[0]+dx/dl*(1.2+(j%3)*0.4)+((j*5)%3-1)*0.5,bz=a[1]+dz/dl*(1.2+(j%2)*0.5)+((j*7)%3-1)*0.5;
      if(!inPoly(bx,bz,WI))continue;parts.push(cyl(0.05,0.07,4.2+(j%3)*0.9,5,bam,bx,g0,bz));}}
    // a zig-zag bridge across the lake's narrow end
    {const bw=lam(0xb8b0a0);let px=LC[0]+LR[0]*0.35,pz=LC[1]-LR[1]*1.05;for(let k=0;k<4;k++){const a=(k%2?0.6:-0.6)+Math.PI/2,l=LR[1]*0.55,nx2=px+Math.cos(a)*l,nz2=pz+Math.sin(a)*l;
      parts.push(boxAt(1.4,0.18,l,bw,(px+nx2)/2,g0+0.25,(pz+nz2)/2,Math.atan2(Math.cos(a),Math.sin(a))));px=nx2;pz=nz2;}}
    return group(L,parts);},

  // Mill Ends Park (1948): two feet across in the median of Naito Parkway, the smallest park in the world
  millEnds(L,x,z){const g=gh(x,z),parts=[];parts.push(cyl(0.34,0.34,0.32,24,lam(0xc8c4bc),x,g,z),cyl(0.3,0.3,0.34,24,lam(0x4a3a2a),x,g,z));
    parts.push(cyl(0.02,0.03,0.35,5,lam(0x5a4430),x,g+0.34,z));const cr=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),lam(0x3f7a34));cr.position.set(x,g+0.75,z);parts.push(cr);
    for(let k=0;k<6;k++){const a=k*Math.PI/3,f=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,4),lam([0xd84a6a,0xf0d040,0xffffff][k%3]));f.position.set(x+Math.cos(a)*0.22,g+0.38,z+Math.sin(a)*0.22);parts.push(f);}
    const tex=textTex([{t:'MILL ENDS PARK',c:'#f4f0e4',s:120,ff:'Arial, sans-serif'}],{w:1024,h:180,bg:'#2f5a3a'});parts.push(cyl(0.012,0.012,0.5,4,lam(0x333333),x+0.36,g,z),plate(lam(0xffffff,{map:tex,side:THREE.DoubleSide}),0.34,0.06,x+0.36,g+0.5,z,0,1));
    return group(L,parts);},
  };
}
