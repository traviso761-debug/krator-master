// ================================================================= ATMOS — sewers: an outfall with its grate, a trickle to the water, a grated drain
// A.outfall(x,y,z,ry,o): a culvert mouth set into a wall face at (x,y,z) (y = the culvert floor), the face's outward
// normal at bearing ry (rotation about y; local +z is out). Jambs, a stepped lintel, an iron grate, a spill lip, and a
// trickle that runs from the lip down the ground (A.ground) until it meets o.waterY. o.lean: the face's batter (m per m).
// A.drain(pts,o): a grated channel along a polyline on the ground; A.inletGrate(): an iron grate over a dark opening.
(function(){const A=ATMOS;
 const dark=()=>A.mat('sewerDark',()=>new A.T.MeshBasicMaterial({color:0x0b0907})),iron=()=>A.lam(0x2f2b28,.55),stone=()=>A.lam(0x8f8272,.95),lintel=()=>A.lam(0xb8a07a,.9);
 const flowTex=()=>A.mat('flowTex',()=>{const cv=document.createElement('canvas');cv.width=64;cv.height=256;const g=cv.getContext('2d');g.fillStyle='rgb(200,210,220)';g.fillRect(0,0,64,256);
  for(let i=0;i<70;i++){const x=A.rnd()*64,w=1+A.rnd()*4,l=30+A.rnd()*60,v=A.rnd()<.5?255:150,y=A.rnd()*256;g.fillStyle=`rgba(${v},${v},${v},${.2+A.rnd()*.5})`;g.fillRect(x,y,w,l);if(y+l>256)g.fillRect(x,y-256,w,l);}
  const t=new A.T.CanvasTexture(cv);t.wrapS=t.wrapT=A.T.RepeatWrapping;A.hook(tt=>{t.offset.y=-tt*.9;});return t;});
 const P=(x,z,ry,lx,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
 const box=(set,mat,x,y,z,ry,lx,ly,lz,w,h,d)=>{A.set(set,'box',mat);const p=P(x,z,ry,lx,lz);A.put(set,[p[0],y+ly,p[1],w,h,d,ry]);};
 A.outfall=(x,y,z,ry,o)=>{o=o||{};const lean=o.lean||0,zf=yy=>-lean*yy;
  box('sewerDark',dark(),x,y,z,ry,0,1.8,zf(1.8)-.9,3.8,3.6,2.4);
  for(const sd of[-1,1])box('sewerStone',stone(),x,y,z,ry,sd*2.55,2.4,zf(2.4)+.15,1.1,4.8,1.7);
  box('sewerLintel',lintel(),x,y,z,ry,0,5.1,zf(5.1)+.25,6.6,.9,2.0);box('sewerStone',stone(),x,y,z,ry,0,6.0,zf(6)+.05,5.2,.7,1.6);box('sewerLintel',lintel(),x,y,z,ry,0,6.7,zf(6.7)-.1,3.6,.55,1.3);
  box('sewerStone',stone(),x,y,z,ry,0,.25,zf(.25)+1.15,5.4,.55,2.7);                                      // the spill lip
  for(let k=-3;k<=3;k++)box('sewerIron',iron(),x,y,z,ry,k*.55,1.8,zf(1.8)+.35,.16,3.5,.16);                // the grate
  for(const yy of[1.1,2.6])box('sewerIron',iron(),x,y,z,ry,0,yy,zf(yy)+.35,3.9,.16,.16);
  // the trickle: a ribbon over the lip and down the ground to the water, widening as it goes
  const T=A.T,pos=[],uv=[],idx=[];let v=0,prev=null;const wy=o.waterY!=null?o.waterY:-1e9;
  for(let k=0;k<200;k++){const out=2.2+k*.5,c=P(x,z,ry,0,out),gy=A.ground(c[0],c[1]),yy=k===0?y+.55:Math.max(gy+.12,wy);if(prev){v+=Math.hypot(.5,yy-prev)/3;}
   const w=1.2+Math.min(1.4,k*.03);for(const sd of[-1,1]){const q=P(x,z,ry,sd*w/2,out);pos.push(q[0],yy,q[1]);uv.push(sd<0?0:1,v);}
   if(k){const b=(k-1)*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}prev=yy;if(gy<=wy+.05||k>8&&yy<=wy+.13)break;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=A.mat('trickle',()=>new T.MeshStandardMaterial({color:0x8fb4c8,map:flowTex(),transparent:true,opacity:.8,roughness:.15,depthWrite:false,side:T.DoubleSide}));
  const mesh=new T.Mesh(g,m);mesh.name='atmos:trickle';mesh.renderOrder=2;A.add(mesh);A.stats.outfalls=(A.stats.outfalls||0)+1;
  const mouth=P(x,z,ry,0,1.5);A.rec('outfall',{at:[x,y,z],ry,lean,waterY:o.waterY,trickle:pos.length/6});return{x:mouth[0],y:y+2,z:mouth[1],r:4,h:7.5};};
 // a grated channel along pts ([[x,z],...]) at the ground: a dark slot, stone kerbs, iron bars across every 0.55 m
 A.drain=(pts,o)=>{o=o||{};const w=o.w||1.3;let n=0;A.rec('drain',{pts:pts.map(p=>[p[0],p[1]]),w});for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.05)continue;
   const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),ry=-ang,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,y=A.ground(mx,mz)+.02;
   A.set('sewerDark','box',dark());A.put('sewerDark',[mx,y,mz,len+.05,.06,w,ry]);A.set('sewerStone','box',stone());
   for(const sd of[-1,1])A.put('sewerStone',[mx-Math.sin(ang)*sd*(w/2+.15),y+.02,mz+Math.cos(ang)*sd*(w/2+.15),len+.05,.12,.3,ry]);
   A.set('sewerIron','box',iron());const nb=Math.floor(len/.55);for(let k=0;k<nb;k++){const f=(k+.5)/nb;A.put('sewerIron',[a[0]+(b[0]-a[0])*f,y+.05,a[1]+(b[1]-a[1])*f,.14,.05,w,ry]);n++;}}
  A.stats.drainBars=(A.stats.drainBars||0)+n;return n;};
 // an inlet grate on a wall foot at (x,y,z), facing ry: a dark opening behind five iron bars
 A.inletGrate=(x,y,z,ry,o)=>{o=o||{};const w=o.w||2.4,h=o.h||1.3;box('sewerDark',dark(),x,y,z,ry,0,h/2-.1,-.05,w,h,.3);for(let k=-2;k<=2;k++)box('sewerIron',iron(),x,y,z,ry,k*w*.19,h/2-.1,.12,.12,h,.12);
  box('sewerStone',stone(),x,y,z,ry,0,h+.05,.05,w+.6,.3,.5);};
})();
