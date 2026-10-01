// ================================================================= HOST — overlays (places, routes, the polygon tool's drawing)
// Flat ribbons drawn over everything (depthTest off), never lines: a line's
// width is ignored by every desktop driver. One group per overlay, hidden
// until its checkbox is ticked (90).
const OVERLAY={};
const KINDCOL={ground:0xffd24a,wall:0xff7a3c,shore:0x3ce0ff,plateau:0xb88cff};
function ribbonPath(pts,w,color,closed,lift){const P=closed?pts.concat([pts[0]]):pts,pos=[],idx=[];lift=lift==null?.6:lift;
 for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=P[i][1]+lift;
  pos.push(P[i][0]+nx,y,P[i][2]+nz,P[i][0]-nx,y,P[i][2]-nz);if(i<P.length-1){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthTest:false,depthWrite:false,side:THREE.DoubleSide,fog:false}));
 m.renderOrder=20;m.userData.probeSkip=true;m.userData.overlay=true;return m;}
// a polygon's edge, sampled every 2 m so it follows the ground
function polyOnGround(poly){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));
 for(let k=0;k<n;k++){const x=mix(a[0],b[0],k/n),z=mix(a[1],b[1],k/n);out.push([x,terrainH(x,z),z]);}}return out;}
function labelSprite(text,color){const c=document.createElement('canvas');c.width=512;c.height=64;const g=c.getContext('2d');
 g.font='bold 30px system-ui,sans-serif';const w=Math.min(508,g.measureText(text).width+24);g.fillStyle='rgba(20,12,8,.78)';g.fillRect(0,8,w,48);
 g.fillStyle=color;g.fillText(text,12,43);const t=new THREE.CanvasTexture(c);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,depthWrite:false,transparent:true,sizeAttenuation:false,fog:false}));
 s.center.set(0,.5);s.scale.set(.32,.04,1);s.renderOrder=21;s.userData.probeSkip=true;s.userData.overlay=true;return s;}
OVERLAY.places=(function(){const G=new THREE.Group();G.visible=false;
 for(const p of PLACES){const col=KINDCOL[p.kind]||0xffffff;G.add(ribbonPath(polyOnGround(p.poly),1.2,col,true));
  const c=polyCentre(p.poly),s=labelSprite(p.name,'#'+col.toString(16).padStart(6,'0'));s.position.set(c[0],terrainH(c[0],c[1])+6,c[1]);G.add(s);}
 G.add(ribbonPath(SWB.pts.map(q=>[q[0],q[2],q[1]]),1.4,0xffffff,false,.4));   // the switchback's centreline
 for(const n in PORTS){const P=PORTS[n],s=labelSprite('port: '+P.name,'#ffffff');s.position.set(P.x,terrainH(P.x,P.z)+8,P.z);G.add(s);}
 scene.add(G);return G;})();
OVERLAY.routes=(function(){const G=new THREE.Group();G.visible=false;
 for(const r of LIFE.ROUTES)G.add(ribbonPath(r.pts,r.key==='commute'?.9:1.6,r.color,false,.9));
 scene.add(G);return G;})();
