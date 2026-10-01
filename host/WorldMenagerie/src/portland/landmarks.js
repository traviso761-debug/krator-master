// Portland's own landmarks: the bridges the city is named for in all but name - the lift bridge, the bascules
// and the arch - the White Stag sign, the Chinatown gate, the submarine at OMSI, the aerial tram up Marquam Hill,
// and Mount Hood out on the horizon. Only this city uses them, so they travel with this page and not with the
// shared engine; src/portland/main.js hands them to build() as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,P,animHooks,inWater,nightF,hour,box,group,gh,roofAt,riverCrossing}=api;
  return {
  liftbridge(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||50,parts=[],m=new THREE.MeshLambertMaterial({color:0x5a6068});
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.35,tz=c.z+c.uz*sd*c.half*0.35;for(const ss of [-1,1]){parts.push(box(tx-c.uz*ss*(c.w/2+1),0,tz+c.ux*ss*(c.w/2+1),2.2,c.y+H,2.2,m));}
      parts.push(box(tx,c.y+H-2,tz,2.2,2.2,c.w+4,m).rotateY(-Math.atan2(c.uz,c.ux)));}
    const span=box(c.x,c.y+H*0.25,c.z,c.half*0.7,3,c.w+2,m);span.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(span);return group(L,parts);},
  bascule(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const parts=[],m=new THREE.MeshLambertMaterial({color:0xc8bca8}),r=new THREE.MeshLambertMaterial({color:0x5a6a62});
    for(const sd of [-1,1])for(const ss of [-1,1]){const px=c.x+c.ux*sd*c.half*0.3-c.uz*ss*(c.w/2+4),pz=c.z+c.uz*sd*c.half*0.3+c.ux*ss*(c.w/2+4);parts.push(box(px,0,pz,8,c.y+10,8,m));const cap=new THREE.Mesh(new THREE.ConeGeometry(6,4,4).translate(0,2,0),r);cap.rotation.y=Math.PI/4;cap.position.set(px,c.y+10,pz);parts.push(cap);}
    return group(L,parts);},
  arch(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.archH||100,span=L.span||c.half*2,m=new THREE.MeshLambertMaterial({color:0x4f6a8a}),parts=[];
    for(const ss of [-1,1]){const a=new THREE.Mesh(new THREE.TorusGeometry(1,0.012,6,48,Math.PI),m);a.scale.set(span/2,Math.max(10,H-c.y),span/2);a.position.set(c.x-c.uz*ss*(c.w/2),c.y,c.z+c.ux*ss*(c.w/2));a.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(a);
      for(let k=-6;k<=6;k++){const t=k/7,hx=c.x+c.ux*t*span/2-c.uz*ss*(c.w/2),hz=c.z+c.uz*t*span/2+c.ux*ss*(c.w/2),hy=c.y+Math.max(10,H-c.y)*Math.sqrt(Math.max(0,1-t*t));parts.push(box(hx,c.y,hz,0.4,hy-c.y,0.4,m));}}
    return group(L,parts);},
  sign(L,x,z){const top=roofAt(x,z)||gh(x,z)+15,neonR=new THREE.MeshBasicMaterial({color:0xff3a2a}),neonW=new THREE.MeshBasicMaterial({color:0xfff4d0}),frame=new THREE.MeshLambertMaterial({color:0x3a3a3a}),parts=[];
    const W=26,H=12;parts.push(box(x,top,z,0.6,H+4,0.6,frame),box(x-W*0.4,top,z,0.4,H,0.4,frame),box(x+W*0.4,top,z,0.4,H,0.4,frame));
    const face=box(x,top+2,z,W,H*0.55,0.5,frame);parts.push(face);const words=box(x,top+2+H*0.3,z+0.3,W*0.9,1.4,0.2,neonR),words2=box(x,top+2+H*0.1,z+0.3,W*0.6,1.2,0.2,neonW),stag=box(x-W*0.1,top+2+H*0.52,z+0.3,5,3,0.2,neonW);
    parts.push(words,words2,stag);const g=group(L,parts);g.rotation.y=0.35;animHooks.push(()=>{const on=nightF(hour())>0.35;neonR.color.setHex(on?0xff3a2a:0x6a2a24);neonW.color.setHex(on?0xfff4d0:0x8a8478);});return g;},
  gate(L,x,z){const g0=gh(x,z),red=new THREE.MeshLambertMaterial({color:0xb02a24}),roof=new THREE.MeshLambertMaterial({color:0x2a6a4a}),gold=new THREE.MeshLambertMaterial({color:0xd8b040}),parts=[];
    for(const s of [-1,1])parts.push(box(x+s*7,g0,z,1.2,9,1.2,red));parts.push(box(x,g0+7,z,17,1.2,1.4,gold));
    for(const [w,y] of [[20,9],[9,12],[6,14.5]]){const r=new THREE.Mesh(new THREE.BoxGeometry(w,0.8,3.2),roof);r.position.set(x,g0+y,z);parts.push(r);}return group(L,parts);},
  submarine(L,x,z){let best=null;for(let a=0;a<6.28;a+=0.2)for(let d=40;d<220;d+=10){const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(inWater(px,pz)&&inWater(px+40,pz)&&inWater(px-40,pz)){best=[px,pz];break;}}if(!best)return null;
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(4,4,60,14),new THREE.MeshLambertMaterial({color:0x2a2e34}));hull.rotation.z=Math.PI/2;hull.position.set(best[0],0.8,best[1]);hull.scale.y=1;
    const sail=box(best[0]+8,2,best[1],7,6,2.4,new THREE.MeshLambertMaterial({color:0x2a2e34}));return group({name:'USS Blueback',info:'The USS Blueback (SS-581), the last diesel-electric submarine built for the US Navy, moored at OMSI.'},[hull,sail]);},
  tram(L,x,z){const [ux0,uz0]=P(L.upper),[lx0,lz0]=P(L.lower),gU=gh(ux0,uz0),gL=gh(lx0,lz0),uh=gU+Math.max(16,roofAt(ux0,uz0)-gU),parts=[],steel=new THREE.MeshLambertMaterial({color:0x8a9098});
    // the hill is modelled now, so the upper station stands on Marquam Hill itself
    parts.push(box(ux0,gU,uz0,8,uh-gU,8,steel),box(lx0,gL,lz0,10,14,10,steel));const tower=[(ux0*0.4+lx0*0.6),(uz0*0.4+lz0*0.6)],gT=gh(tower[0],tower[1]),tH=Math.max(24,(uh-gT)*0.6);parts.push(box(tower[0],gT,tower[1],3,tH,3,steel));
    const pts=[new THREE.Vector3(lx0,gL+13,lz0),new THREE.Vector3(tower[0],gT+tH,tower[1]),new THREE.Vector3(ux0,uh,uz0)];parts.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x303030})));
    const cabM=new THREE.MeshLambertMaterial({color:0xc8ccd0}),cabs=[0,1].map(()=>{const c=new THREE.Mesh(new THREE.BoxGeometry(6,3.5,4),cabM);parts.push(c);return c;});
    const at=u=>{const a=u<0.65?pts[0].clone().lerp(pts[1],u/0.65):pts[1].clone().lerp(pts[2],(u-0.65)/0.35);a.y-=3;return a;};
    const g=group(L,parts);animHooks.push(now=>{const t=(now/240000)%1,u=t<0.5?t*2:2-t*2;cabs[0].position.copy(at(u));cabs[1].position.copy(at(1-u));});return g;},
  mountain(L){   // far on the horizon, scaled so it looks the right size from the city: placed 22 km out along its true bearing
    const [mx,mz]=P(L.at),d=Math.hypot(mx,mz),k=22000/d,x=mx*k,z=mz*k,h=L.h*k,r=h*2.6,g=new THREE.ConeGeometry(r,h,48,6,true),v=g.attributes.position;
    for(let i=0;i<v.count;i++){const y=v.getY(i)/h+0.5,n=1+0.08*Math.sin(v.getX(i)*0.01+v.getZ(i)*0.013);v.setX(i,v.getX(i)*n);v.setZ(i,v.getZ(i)*n);if(L.crater&&y>0.88)v.setY(i,h*0.38);}
    g.computeVertexNormals();const rock=new THREE.MeshLambertMaterial({color:0x6a7288,fog:false}),snow=new THREE.MeshLambertMaterial({color:0xf4f6fa,fog:false});
    const base=new THREE.Mesh(g,rock);base.position.set(x,h/2-h*0.05,z);const capG=new THREE.ConeGeometry(r*0.38,h*0.38,36,2,true);const cap=new THREE.Mesh(capG,snow);cap.position.set(x,h-h*0.05-h*0.19+(L.crater?-h*0.08:0),z);cap.scale.set(1.02,1,1.02);
    const grp=group(L,[base,cap]);base.castShadow=cap.castShadow=false;return grp;},
  // ---- City 17 (data/cities/city17.json): fan geometry, modelled here from the silhouettes; no game assets ----
  };
}
