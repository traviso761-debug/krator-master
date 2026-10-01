// New York's own landmarks: the suspension bridges over the East River, the Statue of Liberty out in the
// harbour, and One World Trade Center - which the map cannot draw, because it is not a footprint pushed upwards.
// Only this city uses them, so they travel with this page rather than with the shared engine; src/nyc/main.js
// hands them to build() as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,animHooks,scene,col,box,group,gh,riverCrossing,steelM,chromeM,towerM,blankM}=api;
  return {
  suspension(L,x,z){   // a suspension bridge: two towers, the main cable slung between them, and the hangers down to the deck
    const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||90,parts=[],m=new THREE.MeshLambertMaterial({color:0x8a8478});
    const cabM=new THREE.LineBasicMaterial({color:0xb0b4b8});
    const towers=[];
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.82,tz=c.z+c.uz*sd*c.half*0.82;towers.push([tx,tz]);
      for(const ss of [-1,1]){const px=tx-c.uz*ss*(c.w/2+2),pz=tz+c.ux*ss*(c.w/2+2);parts.push(box(px,0,pz,6,c.y+H,6,m));}
      for(const y of [c.y+H*0.55,c.y+H*0.85])parts.push(box(tx,y,tz,4,3,c.w+6,m).rotateY(-Math.atan2(c.uz,c.ux)));}
    // the cable: a parabola between the towers, with hangers dropping to the deck
    const pts=[];for(const ss of [-1,1]){const line=[];
      for(let k=-20;k<=20;k++){const t=k/20,cx2=c.x+c.ux*t*c.half*0.82,cz2=c.z+c.uz*t*c.half*0.82;
        const y=c.y+H*(0.18+0.82*t*t);line.push(new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),y,cz2+c.ux*ss*(c.w/2+2)));}
      parts.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),cabM));
      for(let k=-18;k<=18;k+=2){const t=k/20,cx2=c.x+c.ux*t*c.half*0.82,cz2=c.z+c.uz*t*c.half*0.82,y=c.y+H*(0.18+0.82*t*t);
        pts.push(new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),y,cz2+c.ux*ss*(c.w/2+2)),new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),c.y,cz2+c.ux*ss*(c.w/2+2)));}}
    parts.push(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),cabM));
    return group(L,parts);},
  liberty(L,x,z){   // she stands out in the harbour, on her pedestal, facing the sea
    const g0=0,parts=[],cop=new THREE.MeshLambertMaterial({color:0x6fae96}),stone=new THREE.MeshLambertMaterial({color:0x9a8e7c});
    parts.push(box(x,g0,z,28,14,28,stone),box(x,g0+14,z,20,27,20,stone));
    const body=new THREE.Mesh(new THREE.CylinderGeometry(3.4,7,33,10).translate(0,16.5,0),cop);body.position.set(x,g0+41,z);parts.push(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(2.6,10,8),cop);head.position.set(x,g0+77,z);parts.push(head);
    for(let k=0;k<7;k++){const a=k/7*Math.PI-Math.PI/2,sp=new THREE.Mesh(new THREE.ConeGeometry(0.5,6,4),cop);
      sp.position.set(x+Math.sin(a)*3.4,g0+81,z+Math.cos(a)*3.4);sp.rotation.set(Math.cos(a)*0.4,0,-Math.sin(a)*0.4);parts.push(sp);}
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(1,1.4,20,7),cop);arm.position.set(x+5,g0+70,z);arm.rotation.z=-0.32;parts.push(arm);
    const torch=new THREE.Mesh(new THREE.ConeGeometry(2.1,5,8),new THREE.MeshBasicMaterial({color:0xffd870}));torch.position.set(x+9,g0+82,z);parts.push(torch);
    const tab=new THREE.Mesh(new THREE.BoxGeometry(7,10,1.6),cop);tab.position.set(x-4.5,g0+62,z);tab.rotation.z=0.3;parts.push(tab);
    return group(L,parts);},
  onewtc(L,x,z){
    // One World Trade Center. The map carries it as a square with a triangle glued to each side and all five
    // pushed straight up to the parapet, which builds a slab with a pin on top of it. The building is the other
    // thing entirely: a windowless cube for the first twenty storeys, and above that eight isosceles triangles
    // that eat the corners away the whole way up - so the section is a square at the foot, a regular octagon at
    // half height, and a square again at the parapet, turned 45 degrees from the one it started as. Nothing that
    // extrudes a footprint can make that shape, so it is built here and the mapped parts are cleared (see
    // "clear" in 03-blocks.js).
    const g0=gh(x,z),H=L.height||417,pod=L.podium||55,tip=L.tip||541,A=(L.turn||0)*Math.PI/180;
    const Rb=(L.base||65)/Math.SQRT2,Rt=(L.top||46)/Math.SQRT2;                  // squares, by their corners
    const glass=col(L.colour||'#7d9bbc'),pale=col(L.podiumColour||'#9d9a92');
    const at=(r,a)=>[x+Math.cos(a)*r,z+Math.sin(a)*r];
    const B=[0,1,2,3].map(k=>at(Rb,A+k*Math.PI/2));                              // the foot, corners on the axes
    const T=[0,1,2,3].map(k=>at(Rt,A+Math.PI/4+k*Math.PI/2));                    // the parapet, turned 45 degrees
    // two stores: the shaft is glazed and takes the same window grid as every other tower in the city, so it
    // lights at dusk with them; the base and the roofs carry no windows at all.
    const S={p:[],n:[],u:[],c:[],idx:[]},W={p:[],n:[],c:[],idx:[]},BAY=3,FL=3.6;
    function face(st,pts,cl,ax){   // one flat polygon; ax is the horizontal run the window grid follows
      const b0=st.p.length/3,o=pts[0],ux=ax?ax[0]:0,uz=ax?ax[1]:0;
      const e1=[pts[1][0]-o[0],pts[1][1]-o[1],pts[1][2]-o[2]],e2=[pts[2][0]-o[0],pts[2][1]-o[1],pts[2][2]-o[2]];
      let n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
      const l=Math.hypot(n[0],n[1],n[2])||1;n=n.map(v=>v/l);
      let cx=0,cz=0;for(const p of pts){cx+=p[0]/pts.length;cz+=p[2]/pts.length;}
      if(ax&&(n[0]*(cx-x)+n[2]*(cz-z))<0)n=n.map(v=>-v);else if(!ax&&n[1]<0)n=n.map(v=>-v);   // outward, or up
      for(const p of pts){st.p.push(p[0],p[1],p[2]);st.n.push(n[0],n[1],n[2]);st.c.push(cl.r,cl.g,cl.b);
        if(st.u)st.u.push(((p[0]-o[0])*ux+(p[2]-o[2])*uz)/BAY,(p[1]-g0)/FL);}
      for(let i=2;i<pts.length;i++)st.idx.push(b0,b0+i-1,b0+i);}
    const dir=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [dx/l,dz/l];};
    const at3=(p,y)=>[p[0],y,p[1]];
    // the base: a cube, blank on every face, up to where the chamfers start
    for(let k=0;k<4;k++){const a=B[k],b=B[(k+1)%4];
      face(W,[at3(a,g0),at3(b,g0),at3(b,g0+pod),at3(a,g0+pod)],pale,dir(a,b));}
    // the shaft: four triangles standing on the base's sides with their apex at a parapet corner, and four
    // hanging from the parapet's sides with their apex on a corner of the base. Together they are the taper.
    for(let k=0;k<4;k++){const a=B[k],b=B[(k+1)%4],t=T[k],tp=T[(k+3)%4];
      face(S,[at3(a,g0+pod),at3(b,g0+pod),at3(t,g0+H)],glass,dir(a,b));
      face(S,[at3(a,g0+pod),at3(t,g0+H),at3(tp,g0+H)],glass,dir(tp,t));}
    // the roof, and the parapet standing round it
    face(W,[at3(T[0],g0+H),at3(T[1],g0+H),at3(T[2],g0+H),at3(T[3],g0+H)],pale.clone().multiplyScalar(0.72));
    for(let k=0;k<4;k++){const a=T[k],b=T[(k+1)%4],o=1.6/Rt;   // set a little proud of the glass below it
      const ao=[x+(a[0]-x)*(1+o),z+(a[1]-z)*(1+o)],bo=[x+(b[0]-x)*(1+o),z+(b[1]-z)*(1+o)];
      face(W,[at3(ao,g0+H),at3(bo,g0+H),at3(bo,g0+H+3.4),at3(ao,g0+H+3.4)],pale,dir(ao,bo));}
    const parts=[];
    for(const [st,mat,uv] of [[S,towerM,true],[W,blankM,false]]){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(st.p,3));
      g.setAttribute('normal',new THREE.Float32BufferAttribute(st.n,3));
      g.setAttribute('color',new THREE.Float32BufferAttribute(st.c,3));
      if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(st.u,2));
      g.setIndex(st.idx);g.computeBoundingSphere();parts.push(new THREE.Mesh(g,mat));}
    // the spire: 124 m of mast on its ring, which is what takes the building from 417 m to 1,776 feet
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(7.5,9,4,20).translate(0,2,0),steelM);
    ring.position.set(x,g0+H+3.4,z);parts.push(ring);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.45,1.9,tip-H-7.4,12).translate(0,(tip-H-7.4)/2,0),chromeM);
    mast.position.set(x,g0+H+7.4,z);parts.push(mast);
    const coll=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,6,14,1,true),steelM);
    coll.position.set(x,g0+H+26,z);parts.push(coll);
    const g=group(L,parts);
    // the aircraft warning light on the tip, and the beacon under the collar
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),new THREE.MeshBasicMaterial({color:0xff2020}));
    lamp.position.set(x,g0+tip+1,z);scene.add(lamp);
    animHooks.push(now=>{lamp.visible=(now%1600)<800;});
    return g;},
  };
}
