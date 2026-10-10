// ---------- Rome: the buildings that are shapes rather than heights ----------
// Everything else in the city is its own mapped footprint, extruded by the engine. These are the ones a massing
// model gets wrong, because what makes them what they are is a shape: an ellipse of arcades, a dome on a drum, a
// colonnade, an obelisk. Each is modelled here from its published dimensions and placed on its mapped site, turned
// to its mapped orientation (the config's "face" is the bearing the front looks toward, or for the Colosseum the
// bearing of its long axis); the mapped footprints it replaces are dropped with "clear" or "clearArea".
//
// The kit (below) is classical: columns in the three orders with bases and capitals, arched wall panels, pediments,
// ribbed domes on drums with lanterns, statues, obelisks. Parts are pooled by material and merged, so a model is a
// handful of draw calls however many columns it has.
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry is this project's own, from published dimensions.
import {mkRng} from '../core/rng.js';
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,group,gh,mergeParts,roofAt,riverCrossing,nightF,hour}=api;
  const V3=THREE.Vector3;
  // the kit (src/core/landkit.js), with Rome's stones
  const {Model,mat,turn,archPanel,ellipseBays,crossing}=landkit(api,{railBrown:0x4a3428,paveGrey:0x77787a});
  return {

  // ================================================================ the Colosseum
  // The Flavian amphitheatre: an ellipse 189 by 156 m and 48.5 m high, eighty bays round. Three storeys of arcades
  // framed by half-columns - Tuscan, Ionic, Corinthian - and a solid attic with Corinthian pilasters, small windows in
  // alternate bays and the corbels that held the masts of the awning. The outer ring stands only on the north side;
  // on the south it fell in the earthquakes of the Middle Ages and was quarried, and the second ring shows, lower and
  // ragged, with the two buttresses (Stern's brick wedge, Valadier's steps) holding the broken ends. Inside: the
  // radial walls that carried the seating, the podium, and the arena with part of its floor rebuilt over the
  // hypogeum, the cellars of corridors and lifts underneath it.
  colosseum(L,x,z){const g0=gh(x,z),A=L.a||94.5,Bm=L.b||78,N=80,M=Model(),R=mkRng(80);
    const keep=bay=>{const wb=((Math.atan2(bay.worldN[0],-bay.worldN[1])*180/Math.PI)+360)%360,[a0,a1]=L.survive;return a0<a1?wb>=a0&&wb<=a1:(wb>=a0||wb<=a1);};
    const rot=turn(L.axis||0)-Math.PI/2;   // the model's x is the long axis
    const STOREYS=[[0,10.5,'tuscan'],[10.5,11.9,'ionic'],[22.4,11.3,'corinthian']],ATTIC=[33.7,14.8];
    const outer=ellipseBays(A,Bm,N),inner=ellipseBays(A-6,Bm-6,N),podium=ellipseBays(41.5+4,24+4,N);
    for(const b of outer){const c=Math.cos(rot),s=Math.sin(rot);b.worldN=[b.n[0]*c+b.n[1]*s,-b.n[0]*s+b.n[1]*c];b.keep=keep(b);}
    // the outer ring where it stands
    for(let i=0;i<N;i++){const b=outer[i];if(!b.keep)continue;const [px,pz]=b.pm,[nx,nz]=b.n,w=b.w*1.015;
      for(const [y0,h,order] of STOREYS){M.put('travertine',archPanel(w,h,2.3,w*0.56,h*0.48),px,y0,pz,b.ry);
        // the half-column on the pier at the start of the bay, the entablature over the bay
        const [qx,qz]=b.p0;M.column('travertine',qx+nx*1.05,y0+0.3,qz+nz*1.05,h-1.9,0.62,order,'travertine');
        M.box('travertine',px+nx*0.55,y0+h-1.9,pz+nz*0.55,w,1.3,3.4,b.ry);M.box('travertineDark',px+nx*0.75,y0+h-0.6,pz+nz*0.75,w,0.6,3.8,b.ry);
        M.box('travertine',px,y0,pz,w*0.98,0.3,3.0,b.ry);}
      // the attic: solid, a pilaster at each pier, a window in alternate bays, three corbels a bay, the cornice
      const [y0,h]=ATTIC;M.box('travertine',px,y0,pz,w,h,2.3,b.ry);const [qx,qz]=b.p0;M.box('travertine',qx+nx*1.3,y0,qz+nz*1.3,1.2,h-1.4,0.5,b.ry);
      if(i%2)M.box('dark',px+nx*1.17,y0+4.2,pz+nz*1.17,1.5,2.4,0.06,b.ry);
      for(const f of [-0.28,0,0.28]){const tx=b.p1[0]-b.p0[0],tz=b.p1[1]-b.p0[1];M.box('travertineDark',px+tx*f+nx*1.35,y0+10.2,pz+tz*f+nz*1.35,0.55,0.75,0.6,b.ry);}
      M.box('travertineDark',px+nx*0.4,y0+h-1.4,pz+nz*0.4,w,1.4,3.2,b.ry);
      // the ambulatory vaults behind, floor by floor, out to the second ring
      for(const y of [10.5,22.4,33.7])M.box('travertineDark',(px+inner[i].pm[0])/2,y-0.9,(pz+inner[i].pm[1])/2,w*0.96,0.9,6.4,b.ry);}
    // the buttresses that hold the broken ends of the outer ring: brick wedges falling to the ground
    for(let i=0;i<N;i++){const a=outer[i],b=outer[(i+1)%N];if(a.keep===b.keep)continue;const end=a.keep?a:b,dir=a.keep?1:-1,[px,pz]=a.keep?end.p1:end.p0;
      const tx=(end.p1[0]-end.p0[0])/end.w*dir,tz=(end.p1[1]-end.p0[1])/end.w*dir,s=new THREE.Shape();s.moveTo(0,0);s.lineTo(15,0);s.lineTo(0,48.5);s.lineTo(0,0);
      M.put('brick',new THREE.ExtrudeGeometry(s,{depth:3.4,bevelEnabled:false}).translate(0,0,-1.7),px,0,pz,Math.atan2(-tz,tx));   /* its x along the ring, outward */
      for(let k=0;k<5;k++)M.box('brickDark',px+tx*(2+k*2.6),0,pz+tz*(2+k*2.6),2.6,48.5*(1-(2+k*2.6)/15)*0.98,3.8,Math.atan2(tx,tz));}
    // the second ring: arcades all the way round; where the outer ring is gone it is the face, ragged at the top
    for(let i=0;i<N;i++){const b=inner[i],[px,pz]=b.pm,w=b.w*1.02,face=!outer[i].keep;
      for(const [y0,h] of [[0,10.5],[10.5,11.9]])M.put(face?'travertine':'travertineDark',archPanel(w,h,2.0,w*0.52,h*0.46),px,y0,pz,b.ry);
      const top=face?26+R()*8*(0.4+0.6*Math.abs(Math.sin(i*1.7))):33.7;M.box(face?'brick':'travertineDark',px,22.4,pz,w,top-22.4,2.0,b.ry);
      if(face&&i%2)M.box('dark',px+b.n[0]*1.01,24,pz+b.n[1]*1.01,w*0.45,top-25.5>1?Math.min(4,top-25.5):0.01,0.04,b.ry);}
    // the cavea: radial walls from the podium up to the second ring, carrying the seating that has gone, and two
    // concentric walls; ragged tops
    for(let i=0;i<N;i++){const a=podium[i].p0,b=inner[i].p0,dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),s=new THREE.Shape(),t0=9.5,t1=28+R()*5;
      s.moveTo(0,0);s.lineTo(len,0);s.lineTo(len,t1);for(let k=5;k>=1;k--){const u=k/6;s.lineTo(len*u,t0+(t1-t0)*u*(0.85+R()*0.25));}s.lineTo(0,t0);s.lineTo(0,0);
      M.put(i%3?'brick':'brickDark',new THREE.ExtrudeGeometry(s,{depth:1.3,bevelEnabled:false}).translate(0,0,-0.65),a[0],0,a[1],Math.atan2(-dz,dx));   /* its x along the radius */}
    for(const [f,h] of [[0.4,16],[0.72,23]]){const ring=ellipseBays(45.5+(A-6-45.5)*f,28+(Bm-6-28)*f,N);for(let i=0;i<N;i++){const b=ring[i];if(i%5===3)continue;M.box('brickDark',b.pm[0],0,b.pm[1],b.w*1.02,h*(0.8+R()*0.3),1.4,b.ry);}}
    // the seating vaults between the radial walls: the brick slopes the stone seats were laid on, sloping up from the
    // podium; broken through in places, a sector of stone seats rebuilt on them
    {const mid=ellipseBays(45.5+(A-6-45.5)*0.78,28+(Bm-6-28)*0.78,N),pos=[];
      for(let i=0;i<N;i++){if(R()<0.22)continue;const a0=podium[i].p0,a1=podium[i].p1,b0=mid[i].p0,b1=mid[i].p1,y0=9.6,y1=24.5+R()*2;
        const rebuilt=i>=N*0.08&&i<N*0.16,k=rebuilt?'marble':'brick',steps=rebuilt?9:1;
        for(let j=0;j<steps;j++){const u0=j/steps,u1=(j+1)/steps,L=(p,q,u)=>[p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u],P0=L(a0,b0,u0),P1=L(a1,b1,u0),Q0=L(a0,b0,u1),Q1=L(a1,b1,u1),ya=y0+(y1-y0)*u0,yb=y0+(y1-y0)*u1;
          const g=new THREE.BufferGeometry(),v=rebuilt?[P0[0],yb,P0[1],P1[0],yb,P1[1],Q1[0],yb,Q1[1],P0[0],yb,P0[1],Q1[0],yb,Q1[1],Q0[0],yb,Q0[1],P0[0],ya,P0[1],P1[0],ya,P1[1],P1[0],yb,P1[1],P0[0],ya,P0[1],P1[0],yb,P1[1],P0[0],yb,P0[1]]
            :[P0[0],ya,P0[1],P1[0],ya,P1[1],Q1[0],yb,Q1[1],P0[0],ya,P0[1],Q1[0],yb,Q1[1],Q0[0],yb,Q0[1]];
          g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();
          const mm=new THREE.Mesh(g);(M.B[k]||(M.B[k]=[])).push(mm);
          const g2=g.clone();const pa=g2.attributes.position;for(let t=0;t<pa.count;t+=3){const x1=pa.getX(t+1),y1_=pa.getY(t+1),z1=pa.getZ(t+1);pa.setXYZ(t+1,pa.getX(t+2),pa.getY(t+2),pa.getZ(t+2));pa.setXYZ(t+2,x1,y1_,z1);}g2.computeVertexNormals();(M.B[k]).push(new THREE.Mesh(g2));}}}
    // the stone tiers: what is left of the seating, the lowest rows round the podium
    for(let k=0;k<4;k++){const ring=ellipseBays(46.5+k*1.6,29+k*1.6,N);for(const b of ring)M.box('marble',b.pm[0],9.5+k*0.75,b.pm[1],b.w*1.02,0.75,1.6,b.ry);}
    // the podium wall round the arena
    for(const b of ellipseBays(41.5,24,N)){M.box('marble',b.pm[0],0,b.pm[1],b.w*1.03,9.5,1.6,b.ry);M.box('travertine',b.pm[0]+b.n[0]*0.6,9.5,b.pm[1]+b.n[1]*0.6,b.w*1.03,0.9,2.6,b.ry);}
    // the arena: the pit of the hypogeum (its corridors and lift shafts) open, a third of the floor rebuilt over it
    M.put('earth',new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),0,0.05,0,0,0,0,[41,1,23.5]);
    for(let k=-6;k<=6;k++){const zz=k*3.4,half=40*Math.sqrt(Math.max(0,1-(zz/23)**2));if(half<4)continue;M.box('brick',0,0,zz,half*2-3,4.8+R()*0.6,0.9);}
    for(const xx of [-24,-12,12,24]){const half=23*Math.sqrt(Math.max(0,1-(xx/40)**2));M.box('brickDark',xx,0,0,0.9,4.6,half*2-3);}
    {const s=new THREE.Shape();s.moveTo(14,-23);s.lineTo(14,23);for(let k=0;k<=16;k++){const t=Math.PI/2-k/16*Math.PI;s.lineTo(41*Math.cos(t),23.5*Math.sin(t));}s.lineTo(14,-23);
      M.put('wood',new THREE.ExtrudeGeometry(s,{depth:0.6,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,5.6,0),0,0,0);}
    // the cross raised in the arena, and the metal ring of the floor's edge
    M.box('wood',36,5.6,0,0.5,4.5,0.5);M.box('wood',36,8.6,0,0.5,0.5,2.4);
    return M.finish(L,x,g0,z,rot);},

  // ================================================================ the Pantheon
  // Hadrian's rotunda: a dome 43.3 m across inside, as high as it is wide, open to the sky at the oculus; outside, a
  // brick drum in three bands under a stepped ring and the low lead dome, the intermediate block, and the portico of
  // sixteen granite columns - eight across the front, two rows of four behind - under its pediment and the
  // inscription naming Agrippa, who built the temple Hadrian replaced.
  pantheon(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0);
    const R0=28.8,cz=-41;   // the rotunda's centre, behind the portico (the model faces +z)
    M.cyl('brick',0,0,cz,R0,R0,30.5,40);for(const y of [11.6,21.6,30.2])M.cyl('travertineDark',0,y,cz,R0+0.3,R0+0.3,0.7,40);
    for(let k=0;k<7;k++)M.cyl('travertine',0,30.5+k*1.25,cz,R0-1-k*1.2,R0-1-k*1.2,1.25,40);
    const top=M.dome('lead',0,38.6,cz,R0-9.4,0.42);M.cyl('dark',0,top-0.1,cz,4.5,4.5,0.25,24);M.cyl('travertine',0,top-0.25,cz,5.0,5.0,0.35,24);
    // the intermediate block, its own pediment ghosted on its face above the portico's
    M.box('brick',0,0,-7.8,33.5,30.5,12.6);M.box('travertine',0,30.5,-7.8,34,1.2,13.2);M.pediment('travertineDark',0,31.7,-1.4,34,7.5,1.2);
    // the portico: the columns, the entablature with the inscription, the pediment, the roof
    const CH=14.15,cr=0.76,px=[-14.4,-10.3,-6.2,-2.05,2.05,6.2,10.3,14.4],front=8.6;
    M.box('travertine',0,0,front-7,36,1.3,17);for(let k=0;k<5;k++)M.box('travertine',0,0,front+3-k*0.45+0.6,24,1.3-k*0.26,0.6);
    for(const xx of px)M.column('granite',xx,1.3,front,CH,cr,'corinthian','marble');
    for(const zz of [front-4.6,front-9.2])for(const xx of [-14.4,-6.2,6.2,14.4])M.column('graniteRed',xx,1.3,zz,CH,cr,'corinthian','marble');
    M.box('marble',0,1.3+CH,front-7,33.6,1.5,16.8);M.put('frieze',new THREE.PlaneGeometry(30,1.5).translate(0,0.75,0),0,1.3+CH+1.5,front+1.05);
    M.box('marble',0,1.3+CH+1.5,front-7,33.6,1.6,16.8);M.box('travertine',0,1.3+CH+3.1,front-7,34.6,0.9,17.6);
    const PY=1.3+CH+4.0;M.pediment('marble',0,PY,front+0.2,34.6,7.4,1.4);
    {const s=new THREE.Shape();s.moveTo(-17.3,0);s.lineTo(17.3,0);s.lineTo(0,7.4);s.lineTo(-17.3,0);M.put('lead',new THREE.ExtrudeGeometry(s,{depth:16,bevelEnabled:false}).translate(0,0.25,-16),0,PY,front-0.6);}
    M.box('dark',0,1.3,front-15.0,6.2,12.5,0.3);   // the bronze doors in their frame
    M.box('bronzeDark',0,1.3,front-15.3,5.6,11.8,0.3);
    // the piazza's fountain and its little obelisk, in front
    const f=L.fountain||[0,58];M.cyl('marble',f[0],0,f[1],6.2,6.0,1.0,24);M.cyl('water',f[0],0.8,f[1],5.6,5.6,0.05,24);M.box('marble',f[0],0,f[1],2.6,2.8,2.6);M.cyl('marble',f[0],2.8,f[1],1.8,1.2,1.4,12);
    M.obelisk('granite',f[0],4.2,f[1],6.3,0.85,0);
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ an obelisk on its pedestal (L.obelisk: [shaft height, foot width, pedestal height])
  obelisk(L,x,z){const g0=gh(x,z),M=Model(),[H,w,ped]=L.obelisk;M.obelisk(L.stone||'granite',0,0,0,H,w,ped,L.pedK||'travertine');
    if(L.fountainRing){const r=L.fountainRing;M.cyl('travertine',0,0,0,r,r*0.97,1.0,28);M.cyl('water',0,0.75,0,r*0.94,r*0.94,0.05,28);for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;M.box('marble',Math.cos(a)*r*0.55,0,Math.sin(a)*r*0.55,2.2,1.8,2.2);}}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ an honorific column: Trajan's, Marcus Aurelius'
  // A spiral frieze winding up the shaft (here a helix of shadow), a statue of a saint on top since the sixteenth
  // century, a pedestal with its door. L.column: [shaft height, diameter, pedestal height].
  column(L,x,z){const g0=gh(x,z),M=Model(),[H,D,ped]=L.column,r=D/2;
    M.box('marble',0,0,0,D*1.55,ped,D*1.55);M.box('marble',0,ped,0,D*1.7,0.8,D*1.7);M.cyl('marble',0,ped+0.8,0,r*1.25,r*1.12,1.4,24);
    M.cyl('marble',0,ped+2.2,0,r,r*0.9,H,28);
    {const pts=[],turns=23;for(let i=0;i<=turns*24;i++){const t=i/(turns*24),a=t*turns*Math.PI*2,rr=r*(1-0.1*t)+0.04;pts.push(new V3(Math.cos(a)*rr,ped+2.2+t*H,Math.sin(a)*rr));}
      M.put('travertineDark',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),turns*24,0.07,3,false));}
    M.box('marble',0,ped+2.2+H,0,D*1.15,1.1,D*1.15);M.cyl('marble',0,ped+3.3+H,0,r*0.7,r*0.7,1.6,16);M.statue('bronzeDark',0,ped+4.9+H,0,4.6);
    M.box('dark',0,0,D*0.78,1.4,2.6,0.05);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a church dome for the skyline
  // L.cupola: {drum radius, drum height, dome height (over its radius), lantern height, base (metres over the
  // ground, or the roof under it), ribs, colour ('lead' or 'tile')}. The drum carries paired pilasters and windows.
  cupola(L,x,z){const c=L.cupola,M=Model(),g0=gh(x,z),base=c.base!=null?c.base:Math.max(14,(roofAt(x,z)||g0+18)-g0),r=c.r,dh=c.drum||r*0.9,dk=c.colour||'lead';
    const wall=c.stone||'travertine';
    M.cyl(wall,0,base-2,0,r+0.4,r+0.4,2,28);M.cyl(wall,0,base,0,r,r,dh,28);M.cyl(wall,0,base+dh,0,r+0.5,r+0.5,0.9,28);
    const nb=c.bays||8;for(let i=0;i<nb;i++){const a=i/nb*Math.PI*2;for(const s of [-1,1]){const aa=a+s*0.06;M.box(wall,Math.cos(aa)*(r+0.25),base,Math.sin(aa)*(r+0.25),0.7,dh,0.6,-aa+Math.PI/2);}
      const w=(i+0.5)/nb*Math.PI*2;M.box('dark',Math.cos(w)*(r+0.02),base+dh*0.25,Math.sin(w)*(r+0.02),r*0.32,dh*0.5,0.12,-w+Math.PI/2);}
    const top=M.dome(dk,0,base+dh+0.9,0,r,c.hs||1.1,{ribs:c.ribs||8,ribK:c.ribK||'travertine'});
    if(c.lantern!==0)M.lantern(wall,0,top-0.3,0,Math.max(1.2,r*0.2),c.lantern||r*0.75);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ St Peter's
  // The basilica faces east (its front is +z here). Maderno's façade, 114.7 m wide and 45.5 m high: a giant
  // Corinthian order, five portals, the Benediction loggia, the attic, the two clocks, and thirteen statues - Christ,
  // John the Baptist and eleven apostles - along the top. Behind it his nave, and then Michelangelo's Greek cross with
  // its three apses, and over the crossing the dome: a drum ringed with sixteen buttresses of paired columns, the
  // shell raised to a point and ribbed, three tiers of dormers, and the lantern, 136.6 m to the top of the cross.
  // Vignola's two lesser domes over the chapels. Built here as massing and detail together; the mapped parts are
  // cleared.
  stpeters(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||90);
    // the body: the façade block, the nave and its chapels, the Greek cross and its apses; lead roofs
    M.box('travertine',0,0,-6,114.7,45.5,12);M.box('travertine',0,0,-53,58,44,82);for(const s of [-1,1])M.box('travertineDark',s*36,0,-53,16,30,78);
    M.box('travertine',0,0,-134,92,44,92);
    for(const [cx,cz] of [[-46,-134],[46,-134],[0,-180]]){M.cyl('travertine',cx,0,cz,26,26,44,28);M.cyl('travertineDark',cx,44,cz,26.4,26.4,1.2,28);M.cyl('lead',cx,45.2,cz,25.5,0.5,8,28);}
    {const s=new THREE.Shape();s.moveTo(-29,0);s.lineTo(29,0);s.lineTo(0,9);s.lineTo(-29,0);M.put('lead',new THREE.ExtrudeGeometry(s,{depth:82,bevelEnabled:false}),0,44,-94);}
    M.box('lead',0,44,-134,92,3,92);
    // the façade: columns and pilasters of the giant order, the entablature, the attic, the pediment, the statues
    const F=0.4,COLS=[-30,-24,-11.5,-4,4,11.5,24,30];
    for(const cx of COLS)M.column('travertine',cx,0,F+1.6,27.5,1.35,'corinthian');
    for(const cx of [-55,-46,-38,38,46,55])M.box('travertine',cx,0,F+0.2,3.2,27.5,1.4);
    M.box('travertine',0,27.5,F,114.7,5.2,3.2);M.box('travertineDark',0,32.7,F+0.4,116,1.0,3.8);
    M.box('travertine',0,33.7,F-0.6,114.7,11.8,2);M.pediment('travertine',0,33.7,F+1.4,30,6.5,2.4);
    for(let i=0;i<13;i++)M.statue('travertine',-36+i*6,45.5,F-0.8,5.7);
    for(const cx of [-36,-24,-12,0,12,24,36])M.box('dark',cx,36.5,F+0.42,2.6,4.0,0.1);
    for(const cx of [-18,-9,0,9,18]){M.box('dark',cx,0,F+0.42,4.2,9.5,0.1);M.box('dark',cx,15,F+0.42,3.6,7.5,0.1);M.box('travertine',cx,13.6,F+1.2,6.0,0.8,2.2);}
    for(const s of [-1,1]){M.box('travertine',s*52,45.5,-2,11,8,8);M.cyl('marble',s*52,49.5,2.05,2.6,2.6,0.25,24,0);M.box('dark',s*52,49.6,2.25,0.25,2.2,0.08);
      M.dome('lead',s*52,53.5,-2,4.2,1.2);}
    // the dome over the crossing
    const DZ=-134;M.cyl('travertine',0,44,DZ,33,33,6,40);M.cyl('travertine',0,50,DZ,29.5,29.5,18,40);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);M.box('travertine',c*31.3,50,DZ+sn*31.3,4.2,18,4.6,-a+Math.PI/2);
      for(const o of [-1.25,1.25])M.column('travertine',c*33.2-sn*o,50,DZ+sn*33.2+c*o,17,0.62,'corinthian');
      const w=(i+0.5)/16*Math.PI*2;M.box('dark',Math.cos(w)*29.55,54,DZ+Math.sin(w)*29.55,4,7.5,0.15,-w+Math.PI/2);M.pediment('travertine',Math.cos(w)*29.9,62.2,DZ+Math.sin(w)*29.9,5.2,1.6,0.8,-w+Math.PI/2);}
    M.box('travertineDark',0,68,DZ,0.1,0.1,0.1);M.cyl('travertineDark',0,68,DZ,34.6,34.6,1.6,40);M.cyl('travertine',0,69.6,DZ,30.5,30.5,5,40);
    const top=M.dome('lead',0,74.6,DZ,30.2,1.4,{ribs:16,ribK:'travertine'});
    for(let t=0;t<3;t++){const el=0.3+t*0.28,yy=74.6+Math.sin(el)*30.2*1.4,rr=Math.cos(el)*30.2+0.4;for(let i=0;i<16;i++){const a=(i+0.5)/16*Math.PI*2;M.box('travertine',Math.cos(a)*rr,yy-1.2,DZ+Math.sin(a)*rr,1.8-t*0.4,2.4-t*0.5,1.4,-a+Math.PI/2);}}
    M.cyl('travertine',0,top-1.2,DZ,7.8,7.6,1.2,24);M.lantern('travertine',0,top,DZ,6.2,17.5,{capK:'lead'});
    // Vignola's lesser domes
    for(const [cx,cz] of [[-37,-97],[37,-97],[-37,-171],[37,-171]]){M.cyl('travertine',cx,44,cz,8.4,8.4,9,20);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box('dark',cx+Math.cos(a)*8.42,46.5,cz+Math.sin(a)*8.42,1.5,3.5,0.1,-a+Math.PI/2);}
      const t2=M.dome('lead',cx,53,cz,8.6,1.25,{ribs:8,ribK:'travertine'});M.lantern('travertine',cx,t2-0.4,cz,1.8,6.5,{capK:'lead'});}
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ St Peter's Square
  // Bernini's colonnades: two arms round an oval 196 m across, each four columns deep (284 columns in all, Tuscan,
  // 16 m with their entablature), a balustrade on top carrying 140 statues of saints; the temple fronts at the arms'
  // ends, the straight corridors running back to the façade; the obelisk in the middle, brought from Egypt by
  // Caligula and moved here in 1586; Maderno's fountain and Bernini's on the cross axis. Built round the obelisk;
  // +z faces away from the basilica, toward the river.
  stpeterssquare(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||90),A=L.a||98,Bv=L.b||74,DEP=[0,5.4,10.8,16.2];
    M.obelisk('granite',0,0,0,25.5,2.7,8.3);M.cyl('travertine',0,0,0,7,7,0.6,24);
    for(const s of [-1,1]){const fx=s*58;M.cyl('travertine',fx,0,0,5.2,5.2,0.9,8);M.cyl('water',fx,0.7,0,4.8,4.8,0.05,24);M.cyl('travertine',fx,0.9,0,0.9,0.7,2.6,10);
      M.cyl('travertine',fx,3.5,0,2.6,1.2,0.7,16);M.cyl('travertine',fx,4.2,0,0.5,0.4,1.4,8);M.cyl('travertine',fx,5.6,0,1.4,0.8,0.5,14);M.box('water',fx,6.1,0,0.25,1.4,0.25);}
    // the arms: each spans the side of the oval, leaving it open toward the river and toward the basilica
    for(const side of [-1,1]){const n=36;for(let k=0;k<=n;k++){const t=-62+124*k/n,a=t*Math.PI/180,c=Math.cos(a),sn=Math.sin(a);
        for(let r=0;r<4;r++){const ax=side*(A+DEP[r])*c,az=(Bv+DEP[r])*sn;M.column('travertine',ax,0,az,13.2,0.75,'tuscan');
          if(k<n){const t2=-62+124*(k+1)/n,a2=t2*Math.PI/180,bx=side*(A+DEP[r])*Math.cos(a2),bz=(Bv+DEP[r])*Math.sin(a2),len=Math.hypot(bx-ax,bz-az);
            if(r===0||r===3)M.box('travertine',(ax+bx)/2,13.2,(az+bz)/2,len*1.06,2.6,1.9,Math.atan2(bx-ax,bz-az)+Math.PI/2);}}
        if(k<n){const t2=-62+124*(k+0.5)/n,a2=t2*Math.PI/180,mx=side*(A+8.1)*Math.cos(a2),mz=(Bv+8.1)*Math.sin(a2),len=Math.hypot(side*(A+8.1)*(Math.cos(-62*Math.PI/180+124*(k+1)/n*Math.PI/180)-Math.cos(-62*Math.PI/180+124*k/n*Math.PI/180)),(Bv+8.1)*(Math.sin(-62*Math.PI/180+124*(k+1)/n*Math.PI/180)-Math.sin(-62*Math.PI/180+124*k/n*Math.PI/180)));
          M.box('travertine',mx,15.8,mz,len*1.06,1.0,19.2,Math.atan2(-side*Math.sin(a2)*(A+8.1),(Bv+8.1)*Math.cos(a2))+Math.PI/2);
          M.box('lead',mx,16.8,mz,len*1.04,0.5,17.5,Math.atan2(-side*Math.sin(a2)*(A+8.1),(Bv+8.1)*Math.cos(a2))+Math.PI/2);}
        if(k%2===0){const ox=side*(A+DEP[3]+0.2)*c,oz=(Bv+DEP[3]+0.2)*sn;M.box('travertine',ox,16.8,oz,0.9,1.2,0.9);M.statue('travertine',ox,18,oz,3.1);}
        if(k%2===1){const ix=side*(A-0.3)*c,iz=(Bv-0.3)*sn;M.statue('travertine',ix,16.8,iz,3.1);}}
      // the temple fronts at the arms' ends
      for(const e of [-1,1]){const a=e*62*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),fx=side*(A+8.1)*c,fz=(Bv+8.1)*sn;M.box('travertine',fx,0,fz,21,16,4,Math.atan2(side*c,sn*0)+(e>0?0:0));M.pediment('travertine',fx,16,fz,21,3.5,4.4);}
      // the corridors back to the façade
      M.box('travertine',side*(A+6),0,-Bv*0.96-60,12,18,120);M.box('lead',side*(A+6),18,-Bv*0.96-60,12.6,0.8,120);
      for(let k=0;k<10;k++)M.box('travertineDark',side*(A+6)-side*6.05,0,-Bv*0.96-6-k*12,0.6,16,1.2);}
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ a temple in ruins (the Forum)
  // L.temple: {cols: [[x,z],...] local, h: column height, r: radius, order, podium: [w,d,h], entab: [[x0,z0,x1,z1],...],
  // stone}. Columns stand on what is left of the podium, carrying fragments of their entablature.
  temple(L,x,z){const T=L.temple,g0=gh(x,z),M=Model(),st=T.stone||'marble',py=T.podium?T.podium[2]:0;
    if(T.podium){const [w,d,h]=T.podium;M.box('travertineDark',0,0,-d/2+4,w,h,d);M.box('travertine',0,h-0.6,-d/2+4,w+0.8,0.6,d+0.8);}
    for(const [cx,cz] of T.cols)M.column(st,cx,py,cz,T.h,T.r,T.order||'corinthian',st);
    for(const [x0,z0,x1,z1] of (T.entab||[])){const len=Math.hypot(x1-x0,z1-z0);M.box(st,(x0+x1)/2,py+T.h,(z0+z1)/2,len+T.r*2.6,T.r*3.2,T.r*2.8,Math.atan2(x1-x0,z1-z0)+Math.PI/2);
      M.box(st,(x0+x1)/2,py+T.h+T.r*3.2,(z0+z1)/2,len+T.r*3.2,T.r*0.9,T.r*3.4,Math.atan2(x1-x0,z1-z0)+Math.PI/2);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a triumphal arch
  // L.arch: {w, d, h, bays (1 or 3), cols (columns on each face), attic statues}. Septimius Severus, Titus, Constantine.
  arch(L,x,z){const A=L.arch,g0=gh(x,z),M=Model(),{w,d,h}=A,st=A.stone||'marble',ah=h*0.27,body=h-ah;
    const mid=A.bays===3?w*0.28:w*0.42,side=w*0.13;
    // the body: the piers round the openings
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,body);s.lineTo(-w/2,body);s.lineTo(-w/2,0);
    const arc=(cx,ow,sh)=>{const p=new THREE.Path();p.moveTo(cx-ow/2,0.05);p.lineTo(cx+ow/2,0.05);p.lineTo(cx+ow/2,sh);p.absarc(cx,sh,ow/2,0,Math.PI,false);p.lineTo(cx-ow/2,0.05);s.holes.push(p);};
    arc(0,mid,body*0.55);if(A.bays===3)for(const sx of [-1,1])arc(sx*w*0.33,side,body*0.42);
    M.put(st,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:10}).translate(0,0,-d/2));
    // columns on both faces, on their pedestals; the entablature; the attic and its inscription panel
    const cx=A.bays===3?[-w*0.45,-w*0.2,w*0.2,w*0.45]:[-w*0.38,w*0.38];
    for(const f of [-1,1])for(const c of cx){M.box(st,c,0,f*(d/2+0.7),1.9,body*0.22,1.9);M.column(A.colK||st,c,body*0.22,f*(d/2+0.7),body*0.72,0.48,'corinthian',st);
      if(A.statues)M.statue('marble',c,body+ah,f*(d/2+0.7),ah*0.62);}
    M.box(st,0,body*0.94,0,w+1.2,body*0.08,d+2.4);M.box(st,0,body,0,w,ah,d);M.box('travertineDark',0,body+ah*0.2,d/2+0.02,w*0.46,ah*0.6,0.1);
    M.box(st,0,body+ah,0,w+0.6,0.5,d+0.6);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Basilica of Maxentius: the three vaults that stand
  maxentius(L,x,z){const g0=gh(x,z),M=Model();
    for(let i=-1;i<=1;i++){M.put('brick',archPanel(23.5,25.5,17,20.5,14.5),i*23.5,0,0);
      for(let k=0;k<6;k++){const a=Math.PI*(k+0.5)/6;M.box('brickDark',i*23.5+Math.cos(a)*10.1,14.5+Math.sin(a)*10.1-0.6,0,1.2,1.2,16.6,0);}}
    M.box('brick',0,0,-8.5,70.5,25.5,1.2);M.box('brickDark',0,25.5,0,70.5,1.0,17);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Vittoriano
  // The monument to Victor Emmanuel II on the Capitoline: 135 m wide, 70 m high, 81 m to the tops of its quadrigas,
  // in white Botticino marble. The stairs from Piazza Venezia, the Altare della Patria, the king on horseback in
  // bronze, and up on top the long curved portico of sixteen Corinthian columns between two temple-fronted
  // propylaea, each carrying a gilded quadriga.
  vittoriano(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0);
    for(let k=0;k<6;k++)M.box('marble',0,0,-k*6,135-k*4,4+k*3.2,6+k*0.1);
    for(let k=0;k<14;k++)M.box('marble',0,0,10-k*1.1,40,0.55*(k+1),1.1);
    M.box('marble',0,0,-30,135,22,40);M.box('marble',0,22,-35,120,6,34);
    M.box('marble',0,22,-12,26,9,4);M.statue('marble',0,31,-12,6);   // the Altare della Patria and the goddess Rome
    // the king on his horse, on its pedestal
    M.box('marble',0,28,-24,10,7,14);{const by=35,bz=-24;M.put('bronzeDark',new THREE.SphereGeometry(1,14,10),0,by+4.6,bz,0,0,0,[2.2,2.4,5.4]);
      for(const [lx,lz] of [[-1.3,-3.6],[1.3,-3.6],[-1.3,3.2],[1.3,3.2]])M.box('bronzeDark',lx,by,bz+lz,0.8,4.6,0.8);
      M.put('bronzeDark',new THREE.CylinderGeometry(1.1,1.4,4.4,10).translate(0,2.2,0),0,by+5.4,bz+4.6,0,0.7,0);M.put('bronzeDark',new THREE.BoxGeometry(1.6,1.8,3.6),0,by+8.8,bz+7.4,0,-0.3,0);
      M.cyl('bronzeDark',0,by+6.8,bz-0.6,1.2,0.9,4.2,10);M.put('bronzeDark',new THREE.SphereGeometry(0.85,10,8),0,by+11.6,bz-0.6);M.put('gold',new THREE.SphereGeometry(0.5,8,6),0,by+12.5,bz-0.6);}
    // the portico: a gentle curve of sixteen columns on its stylobate, the attic over it
    M.box('marble',0,28,-40,100,8,12);const CR=170;
    for(let i=0;i<16;i++){const t=(i/15-0.5)*0.4,cx=Math.sin(t)*CR,cz=-42-CR*(1-Math.cos(t));M.column('marble',cx,36,cz,15,0.95,'corinthian');}
    for(let i=0;i<15;i++){const t=((i+0.5)/15-0.5)*0.4,cx=Math.sin(t)*CR,cz=-42-CR*(1-Math.cos(t));M.box('marble',cx,51,cz,5.6,4.2,4.4,t);M.box('marble',cx,55.2,cz,5.8,1.4,4.8,t);M.box('dark',cx,36,cz-4.6,4.0,13,0.2,t);}
    // the propylaea at either end, and their quadrigas
    for(const s of [-1,1]){const px=s*45.5,pz=-46;M.box('marble',px,36,pz,22,24,16);for(const c of [-7.5,-2.5,2.5,7.5])M.column('marble',px+c,36,pz+8.6,15,0.95,'corinthian');
      M.box('marble',px,51,pz+2,22,6,20);M.pediment('marble',px,57,pz+11,22,4.5,2);
      const qy=61.5;M.box('marble',px,57,pz,12,4.5,8);for(let h=0;h<4;h++){const hx=px-3.3+h*2.2;M.put('gold',new THREE.SphereGeometry(1,10,8),hx,qy+2.4,pz+1.5,0,0,0,[0.7,0.9,2.4]);M.box('gold',hx,qy,pz+3,0.5,2.2,0.5);M.box('gold',hx,qy,pz,0.5,2.2,0.5);M.put('gold',new THREE.BoxGeometry(0.6,1.4,1.2),hx,qy+4.0,pz+3.6,0,-0.5,0);}
      M.box('gold',px,qy,pz-2.5,5,3,3);M.statue('gold',px,qy+3,pz-2.5,5.5);}
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ Castel Sant'Angelo
  // Hadrian's mausoleum: a drum of brick and peperino 64 m across, made a fortress and then a papal palace. The square
  // circuit with its four bastions, named for the evangelists; the drum; the papal apartments on top, their loggias;
  // and over everything the bronze archangel Michael sheathing his sword, as he was seen to over the city in 590 to
  // end a plague.
  castel(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),S=L.side||82;
    for(const s of [-1,1]){M.box('peperino',0,0,s*S/2,S,11,3.4);M.box('peperino',s*S/2,0,0,3.4,11,S);}
    for(const [bx,bz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const s=new THREE.Shape();s.moveTo(0,-11);s.lineTo(14,-6);s.lineTo(20,0);s.lineTo(14,6);s.lineTo(0,11);s.lineTo(-6,0);s.lineTo(0,-11);
      M.put('peperino',new THREE.ExtrudeGeometry(s,{depth:12,bevelEnabled:false}).rotateX(-Math.PI/2),bx*S/2,0,bz*S/2,Math.atan2(bx,bz)-Math.PI/2);}
    M.cyl('peperino',0,0,0,32,32,21,48);M.cyl('travertine',0,21,0,32.4,32.4,1.2,48);M.cyl('brick',0,22.2,0,24,24,6,40);
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2;M.box('travertineDark',Math.cos(a)*32.2,18,Math.sin(a)*32.2,1.5,2.2,0.4,-a+Math.PI/2);}
    // the papal apartments, the loggias, the bell, the angel
    M.box('stucco',-3,28.2,0,30,12,26);M.box('stuccoPale',10,28.2,8,10,15,10);M.box('stucco',0,40.2,0,16,5,16);
    for(let k=0;k<5;k++)M.column('travertine',-14+k*2.6,28.2,13.6,6,0.3,'ionic');M.box('travertine',-8.8,34.2,13.4,13,1.2,2.2);
    M.box('travertine',0,45.2,0,5,1.8,5);M.box('bronze',0,47,0,1.6,4.6,1.2);for(const s of [-1,1])M.put('bronze',new THREE.BoxGeometry(0.25,4.2,2.6).translate(0,2.1,0),s*0.9,48.2,-0.6,0,0.35,s*0.5);
    M.put('bronze',new THREE.SphereGeometry(0.6,8,6),0,52.2,0);M.box('bronze',0.9,49.5,0.6,0.2,0.2,2.6);
    return M.finish(L,x,g0,z,ry);},

  // the angels of Ponte Sant'Angelo, five a side on the parapets, and Peter and Paul at the south end
  bridgeangels(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const M=Model(),parts=[];
    for(let i=0;i<5;i++)for(const s of [-1,1]){const t=-0.78+i*0.39,px=c.x+c.ux*t*c.half-c.uz*s*(c.w/2+0.4),pz=c.z+c.uz*t*c.half+c.ux*s*(c.w/2+0.4);
      M.box('travertine',px,c.y,pz,1.4,1.8,1.4);M.statue('marble',px,c.y+1.8,pz,3.6);for(const w of [-1,1])M.put('marble',new THREE.BoxGeometry(0.15,1.8,1.0).translate(0,0.9,0),px,c.y+3.2,pz,0,0,w*0.5);}
    const e=L.southEnd||1;for(const s of [-1,1]){const px=c.x+c.ux*e*c.half*0.98-c.uz*s*(c.w/2+0.6),pz=c.z+c.uz*e*c.half*0.98+c.ux*s*(c.w/2+0.6);M.box('travertine',px,c.y,pz,2,3,2);M.statue('marble',px,c.y+3,pz,4.2);}
    return M.finish(L,0,0,0,0);},

  // ================================================================ a Tiber bridge's stone: arches and piers under the mapped deck
  // The engine lays the deck where the map puts the road; this puts the masonry under it - L.arches arches across the
  // water, the piers with pointed cutwaters up and down stream, a parapet each side - reaching from the deck down
  // into the river. L.road names the mapped road if it differs from the landmark's name.
  stonebridge(L,x,z){const c=crossing(L.road||L.name,x,z);if(!c)return null;const M=Model(),n=L.arches||3,span=(c.half*2+6)/n,pw=Math.max(2.4,span*0.16),top=c.y-0.3,base=-3,H=top-base,w=c.w+1.2,st=L.stone||'travertine';
    const ry=Math.atan2(-c.uz,c.ux);   // the model's x along the deck
    for(let i=0;i<n;i++){const u=-c.half-3+span*(i+0.5),px=c.x+c.ux*u,pz=c.z+c.uz*u;M.put(st,archPanel(span*1.01,H,w,span-pw,Math.max(1,H-span*0.5+pw*0.5)),px,base,pz,ry);
      // the ring of voussoirs round each arch, a little proud of the face
      for(const sd of [-1,1]){const ox=-c.uz*sd*(w/2+0.12),oz=c.ux*sd*(w/2+0.12),ro=(span-pw)/2,sh=Math.max(1,H-span*0.5+pw*0.5);
        for(let k=0;k<=8;k++){const a=Math.PI*k/8,lx=Math.cos(a)*(ro+0.45),ly=sh+Math.sin(a)*(ro+0.45);M.box('travertineDark',px+c.ux*lx+ox,base+ly-0.45,pz+c.uz*lx+oz,0.9,0.9,0.3,ry);}}}
    // the cutwaters on the piers between the arches
    for(let i=1;i<n;i++){const u=-c.half-3+span*i,px=c.x+c.ux*u,pz=c.z+c.uz*u;for(const sd of [-1,1]){const s2=new THREE.Shape();s2.moveTo(-pw/2,0);s2.lineTo(pw/2,0);s2.lineTo(0,pw*0.9);s2.lineTo(-pw/2,0);
      M.put(st,new THREE.ExtrudeGeometry(s2,{depth:-base+2.2,bevelEnabled:false}).rotateX(-Math.PI/2),px-c.uz*sd*w/2,base,pz+c.ux*sd*w/2,ry+(sd>0?0:Math.PI));}}   /* up to just above the water */
    // the parapets along the deck, past the water to the embankments
    for(const sd of [-1,1]){const len=c.half*2+18;M.box(st,c.x-c.uz*sd*(w/2-0.25),top,c.z+c.ux*sd*(w/2-0.25),len,1.15,0.5,ry);M.box('travertineDark',c.x-c.uz*sd*(w/2-0.25),top+1.15,c.z+c.ux*sd*(w/2-0.25),len,0.18,0.7,ry);}
    return M.finish(L,0,0,0,0);},

  // ================================================================ Ponte Rotto: the broken bridge
  // The Pons Aemilius of 179 BC, the first stone bridge over the Tiber, rebuilt again and again and carried away by
  // the floods; since 1598 one arch alone stands in the river, below the island, going nowhere, trees growing on it.
  pontrotto(L,x,z){const M=Model(),ry=turn(L.face||75.8)-Math.PI/2,base=-3,top=L.top||13,H=top-base,R=mkRng(179);
    M.put('travertine',archPanel(27.7,H,10.4,14.5,H-8.5),0,base,0,0);
    for(const sd of [-1,1])for(const e of [-1,1]){const s2=new THREE.Shape();s2.moveTo(-3,0);s2.lineTo(3,0);s2.lineTo(0,4.5);s2.lineTo(-3,0);
      M.put('travertineDark',new THREE.ExtrudeGeometry(s2,{depth:H*0.6,bevelEnabled:false}).rotateX(-Math.PI/2),e*10.6,base,sd*5.2,sd>0?0:Math.PI);}
    for(const e of [-1,1])M.box('dark',e*10.6,top-6,0,2.2,3.4,10.6);   // the little flood arches through the piers
    for(let k=0;k<9;k++)M.put('bronze',new THREE.IcosahedronGeometry(1,1),(R()-0.5)*24,top+0.8,(R()-0.5)*7,R()*6,0,0,[1.6+R()*1.6,1.2+R(),1.6+R()*1.6]);
    return M.finish(L,x,0,z,ry);},

  // ================================================================ the Trevi Fountain
  // Salvi's fountain on the face of Palazzo Poli: a triumphal arch 49 m wide and 26 m high, Oceanus in the central
  // niche on his shell drawn by two horses, one calm and one wild, led by tritons; Abundance and Health in the side
  // niches; the attic with its statues and the papal arms; the rocks spilling out into the basin. Faces +z.
  trevi(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||180),R=mkRng(1762);
    M.box('travertine',0,0,-3,49,26,4);M.box('travertine',0,26,-3,49,2.2,4.6);
    M.box('travertine',0,0,-1,22,28.2,3.2);   // the central arch, standing forward of the wings
    for(let r=0;r<3;r++)for(const s of [-1,1])for(const c of [12.5,17.8,22.6]){const y=2.5+r*7.6;M.box('travertine',s*c,y-0.4,-0.9,3.4,5.6,0.5);M.box('dark',s*c,y,-0.62,2.4,4.2,0.1);if(r<2)M.pediment('travertine',s*c,y+4.4,-0.7,3.6,1.0,0.6);}
    for(let k=0;k<=24;k++)M.box('travertine',-24+k*2,28.2,-1.6,0.35,1.3,0.35);M.box('travertine',0,29.5,-1.6,49,0.35,0.8);
    for(const c of [-7.2,-4.6,4.6,7.2])M.column('travertine',c,6,2.4,15.6,1.0,'corinthian');
    for(const c of [-21,-14.5,14.5,21])M.box('travertine',c,6,-0.7,1.9,15.6,1.2);
    M.box('travertine',0,21.6,-0.4,24,2.2,3.0);M.box('travertine',0,23.8,-0.6,18,4,2.0);for(const c of [-7,-2.4,2.4,7])M.statue('travertine',c,27.8,-0.6,3.4);
    M.box('travertine',0,28,-0.8,6,4.5,1.4);M.cyl('travertine',0,32.5,-0.8,1.2,0.4,1.6,8);
    M.box('dark',0,6,0.55,7.6,10,0.1);M.box('travertine',0,6,0.45,9.4,0.6,1.4);for(const s of [-1,1])M.box('travertine',s*4.2,6,0.6,1.0,10,1.2);M.cyl('dark',0,15.9,-0.86,0.1,0.1,0.1,4);M.put('dark',new THREE.CircleGeometry(3.8,16,0,Math.PI),0,16,0.56);
    for(const s of [-1,1]){M.box('dark',s*11,8,-0.85,3,6,0.1);M.statue('marble',s*11,8,-0.6,4.4);for(const r of [0,1])M.box('dark',s*(17.8),9+r*6.5,-0.85,2.4,3.6,0.1);}
    M.statue('marble',0,7.2,1.6,5.8);M.put('marble',new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI/2),0,6.4,1.4,0,0,0,[2.6,1.0,1.8]);
    // the sea-horses, the restive one (west) and the calm, each led by a triton
    for(const s of [-1,1]){M.horse('marble',s*4.4,2.0,6.2,-Math.PI/2+s*0.35,s<0?1.6:1.4);M.statue('marble',s*6.6,2.4,7.4,3.4,s*0.4);}
    // the rocks, the basin, the water
    // the scogliera: a reef of carved travertine spilling forward from the façade, highest in the middle
    for(let i=0;i<150;i++){const a=R()*Math.PI,rr=Math.sqrt(R())*14,px=Math.cos(a)*rr*1.5,pz=Math.sin(a)*rr*0.42+0.8,sz=0.6+R()*1.3,hy=Math.max(0,4.5*(1-Math.abs(px)/22)*(1-pz/7))*R();
      M.put('travertineDark',new THREE.IcosahedronGeometry(1,1),px,0.4+hy,pz,R()*6,R()*3,0,[sz,sz*0.7,sz]);}
    // the basin, a broad shallow curve, its water level with the street, its rim a low seat
    {const s=new THREE.Shape();s.moveTo(-24,0);s.lineTo(24,0);s.quadraticCurveTo(24,-18,0,-20);s.quadraticCurveTo(-24,-18,-24,0);   /* drawn toward -y: the rotation lays it out in front */
      M.put('water',new THREE.ShapeGeometry(s).rotateX(-Math.PI/2),0,0.35,0.2);
      const rim=new THREE.Shape();rim.moveTo(-25,0);rim.lineTo(25,0);rim.quadraticCurveTo(25,-19,0,-21);rim.quadraticCurveTo(-25,-19,-25,0);rim.holes.push(new THREE.Path(s.getPoints(24)));
      M.put('travertine',new THREE.ExtrudeGeometry(rim,{depth:0.6,bevelEnabled:false}).rotateX(-Math.PI/2),0,0,0.2);}
    for(const c of [-3,0,3])M.box('marble',c,0.2,4.5,1.6,2.6,0.2);
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ Piazza Navona: Sant'Agnese in Agone and the Four Rivers
  // Borromini's church on the long side of the piazza (the stadium of Domitian, which is why the piazza is that
  // shape): a concave front between two bell towers, the dome behind; and in front of it Bernini's fountain - the
  // Nile, the Ganges, the Danube and the Plata on a hollow rock, an obelisk on top.
  agnese(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||90);
    const n=9;for(let i=0;i<n;i++){const t=(i/(n-1)-0.5)*1.1,cx=Math.sin(t)*30,cz=-30*(1-Math.cos(t))-2;M.box('travertine',cx,0,cz,30*1.1/(n-1)*1.05,24,3,t);}
    for(const c of [-4.5,4.5,-8.5,8.5])M.column('travertine',c,1.2,1.0,16,0.75,'corinthian');M.pediment('travertine',0,24,0,14,3.2,2.4);
    for(let i=0;i<5;i++)M.box('travertine',0,0,3.4-i*0.6,18,0.3*(i+1),0.6);
    for(const s of [-1,1]){const tx=s*20;M.box('travertine',tx,24,-4,8,11,8);M.box('travertine',tx,35,-4,6.4,7,6.4);for(const c of [[-3.2,0],[3.2,0]])M.column('travertine',tx+c[0],35,-4+3.3,7,0.4,'corinthian');
      M.box('dark',tx,37,-0.65,2.0,3.6,0.1);M.cyl('travertine',tx,42,-4,3.4,3.2,2,12);M.cyl('lead',tx,44,-4,3.2,0.3,4.2,12);M.box('gold',tx,48,-4,0.15,1.2,0.15);}
    M.cyl('travertine',0,24,-19,9.4,9.4,4,24);M.cyl('travertine',0,28,-19,8.6,8.6,9,24);for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI*2;M.box('dark',Math.cos(a)*8.62,30,-19+Math.sin(a)*8.62,1.8,4.8,0.1,-a+Math.PI/2);for(const o of [-0.17,0.17])M.column('travertine',Math.cos(i/8*Math.PI*2+o)*9.2,28,-19+Math.sin(i/8*Math.PI*2+o)*9.2,8.6,0.35,'corinthian');}
    const t=M.dome('lead',0,37.6,-19,8.8,1.25,{ribs:8,ribK:'travertine'});M.lantern('travertine',0,t-0.4,-19,2.0,8);
    return M.finish(L,x,g0,z,ry);},
  // ================================================================ the fountain in front of the Pantheon, and the Barcaccia
  // Giacomo della Porta's basin (1575) on its steps, the rock with four dolphins in the middle, and on it Clement XI's
  // obelisk of Rameses II (the Macuteo, 6.34 m) and the papal star on top.
  rotondafountain(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0);
    for(let k=0;k<3;k++)M.box('travertine',0,k*0.18,0,13.6-k*0.8,0.18,10.4-k*0.8);
    {const s=new THREE.Shape(),W=5.4,H=3.9,r=1.6;s.moveTo(-W+r,-H);s.lineTo(W-r,-H);s.quadraticCurveTo(W,-H,W,-H+r);s.lineTo(W,H-r);s.quadraticCurveTo(W,H,W-r,H);s.lineTo(-W+r,H);s.quadraticCurveTo(-W,H,-W,H-r);s.lineTo(-W,-H+r);s.quadraticCurveTo(-W,-H,-W+r,-H);
      const o=new THREE.Shape(s.getPoints(10).map(p=>new THREE.Vector2(p.x*1.06,p.y*1.08)));o.holes.push(new THREE.Path(s.getPoints(10)));
      M.put('marble',new THREE.ExtrudeGeometry(o,{depth:0.8,bevelEnabled:false}).rotateX(-Math.PI/2),0,0.54,0);M.put('water',new THREE.ShapeGeometry(s).rotateX(-Math.PI/2),0,1.1,0);}
    M.cyl('marble',0,0.5,0,1.9,1.6,1.6,12);M.cyl('marble',0,2.1,0,1.3,1.5,0.4,12);
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4;M.put('marble',new THREE.SphereGeometry(1,8,6),Math.cos(a)*1.5,2.0,Math.sin(a)*1.5,-a,0,0.5,[0.9,0.45,0.45]);}   // the dolphins
    M.box('marble',0,2.5,0,1.9,1.4,1.9);M.box('marble',0,3.9,0,1.6,0.3,1.6);M.obelisk('granite',0,4.2,0,6.34,0.9,0);
    return M.finish(L,x,g0,z,ry);},
  // the Barcaccia (Pietro and Gian Lorenzo Bernini, 1629): a leaking boat half sunk in an oval basin below street
  // level - the Acqua Vergine has too little head to make a jet, so the fountain sits low, and the water spills over
  // the boat's sides; the sun of the Barberini on its prow and stern
  barcaccia(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0);
    {const o=new THREE.Shape();o.absellipse(0,0,7.2,5.0,0,Math.PI*2,false);const ip=new THREE.Shape();ip.absellipse(0,0,6.6,4.4,0,Math.PI*2,false);o.holes.push(new THREE.Path(ip.getPoints(36)));
      M.put('travertine',new THREE.ExtrudeGeometry(o,{depth:0.45,bevelEnabled:false,curveSegments:36}).rotateX(-Math.PI/2),0,0,0);M.put('water',new THREE.ShapeGeometry(ip,36).rotateX(-Math.PI/2),0,0.1,0);}
    {const hull=new THREE.Shape();hull.moveTo(-4.4,0);hull.quadraticCurveTo(-3.2,1.8,0,1.9);hull.quadraticCurveTo(3.2,1.8,4.4,0);hull.quadraticCurveTo(3.2,-1.8,0,-1.9);hull.quadraticCurveTo(-3.2,-1.8,-4.4,0);
      const inner=new THREE.Path(hull.getPoints(12).map(p=>new THREE.Vector2(p.x*0.85,p.y*0.78)));hull.holes.push(inner);
      M.put('travertine',new THREE.ExtrudeGeometry(hull,{depth:1.0,bevelEnabled:false}).rotateX(-Math.PI/2),0,0.05,0);
      const deck=new THREE.Shape(hull.getPoints(12).map(p=>new THREE.Vector2(p.x*0.85,p.y*0.78)));M.put('water',new THREE.ShapeGeometry(deck).rotateX(-Math.PI/2),0,0.85,0);}
    for(const s of [-1,1]){M.box('travertine',s*4.2,0.05,0,0.9,1.6,1.2);M.put('travertine',new THREE.CylinderGeometry(0.5,0.5,0.15,12).rotateZ(Math.PI/2),s*4.7,1.25,0);}   // prow and stern, the Barberini suns
    M.cyl('travertine',0,0.4,0,0.35,0.25,1.1,8);M.put('travertine',new THREE.SphereGeometry(0.6,10,6,0,Math.PI*2,0,Math.PI/2),0,1.45,0);   // the jet's cup in the middle
    return M.finish(L,x,g0,z,ry);},

  fourrivers(L,x,z){const g0=gh(x,z),M=Model(),R=mkRng(1651),ry=turn(L.face||0);
    // the basin: a low oval rim (a seat for half of Rome), the water in it, a little below the rim's top
    {const o=new THREE.Shape();o.absellipse(0,0,19,11,0,Math.PI*2,false);const ip=new THREE.Shape();ip.absellipse(0,0,18.2,10.3,0,Math.PI*2,false);o.holes.push(new THREE.Path(ip.getPoints(48)));
      M.put('travertine',new THREE.ExtrudeGeometry(o,{depth:0.75,bevelEnabled:false,curveSegments:48}).rotateX(-Math.PI/2),0,0,0);
      M.put('travertineDark',new THREE.ShapeGeometry(ip,48).rotateX(-Math.PI/2),0,0.02,0);M.put('water',new THREE.ShapeGeometry(ip,48).rotateX(-Math.PI/2),0,0.5,0);}
    // the rock: a hollow mountain of travertine, open through the middle, highest at its shoulders
    for(let i=0;i<70;i++){const a=R()*Math.PI*2,h=R()*8.5,rr=(2.2+R()*3.4)*(1-h/12),sz=1.2+R()*1.6*(1-h/11);
      if(h<4&&Math.abs(Math.sin(a))<0.35)continue;   // the grotto, open east and west
      M.put('travertineDark',new THREE.IcosahedronGeometry(1,0),Math.cos(a)*rr*1.15,0.4+h,Math.sin(a)*rr*0.85,R()*6,R()*3,0,[sz,sz*0.85,sz]);}
    // the four rivers, one at each corner of the rock, facing out
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,rx=Math.cos(a)*5.6,rz=Math.sin(a)*4.2;M.recliner('marble',rx,2.6,rz,-a+Math.PI,1.9);}
    // the horse plunging out of the grotto, the lion coming to drink, the palm, the sea-serpent
    M.horse('marble',-6.2,0.6,0.4,0,1.5);
    {const lx=6.4,lz=-0.6;M.put('marble',new THREE.SphereGeometry(1,8,6),lx,1.6,lz,0,0,0.3,[1.2,0.55,0.5]);M.put('marble',new THREE.SphereGeometry(1,8,6),lx-1.1,1.4,lz,0,0,0,[0.5,0.55,0.55]);M.box('marble',lx+0.6,0.6,lz,0.3,0.9,0.3);}
    {M.cyl('marble',2.0,4,2.4,0.22,0.16,6.2,6);for(let k=0;k<7;k++){const a=k/7*Math.PI*2;M.put('marble',new THREE.BoxGeometry(2.4,0.06,0.5),2.0+Math.cos(a)*1.1,10.1,2.4+Math.sin(a)*1.1,-a,0,-0.4);}}
    M.box('travertine',0,9.2,0,3.4,0.6,3.4);M.box('travertine',0,9.8,0,2.8,0.9,2.8);M.obelisk('granite',0,10.7,0,16.5,1.7,0);M.statue('bronzeDark',0,27.4+1.4,0,1.2);
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ the Theatre of Marcellus
  // Two storeys of arcades round a half-circle, Doric under Ionic, the third storey long gone; the Orsini built their
  // palazzo into the top of it in the sixteenth century, and people still live there. The arcades stand on the
  // curve toward the Tiber and the synagogue; +z is the curve's middle.
  marcellus(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),Rr=L.r||64,N=42,bays=ellipseBays(Rr,Rr,N*2);
    const [a0,a1]=L.arc||[200,340];
    for(const b of bays){const ang=(Math.atan2(b.pm[1],b.pm[0])*180/Math.PI+360)%360;if(ang<a0||ang>a1)continue;const [px,pz]=b.pm,w=b.w*1.02;
      for(const [y0,h,o] of [[0,9.2,'tuscan'],[9.2,9.0,'ionic']]){M.put('travertine',archPanel(w,h,2.2,w*0.58,h*0.5),px,y0,pz,b.ry);M.column('travertine',b.p0[0]+b.n[0]*1.0,y0+0.2,b.p0[1]+b.n[1]*1.0,h-1.6,0.55,o);
        M.box('travertineDark',px+b.n[0]*0.5,y0+h-1.5,pz+b.n[1]*0.5,w,1.5,3.2,b.ry);}
      M.box('stucco',px-b.n[0]*4,18.2,pz-b.n[1]*4,w*1.02,13,10,b.ry);for(let r=0;r<3;r++)M.box('dark',px+b.n[0]*1.02,20+r*4,pz+b.n[1]*1.02,w*0.3,2.2,0.08,b.ry);
      M.box('tile',px-b.n[0]*4,31.2,pz-b.n[1]*4,w*1.04,1.2,10.6,b.ry);}
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ the Pyramid of Cestius
  // ================================================================ Campo de' Fiori
  // The market every morning but Sunday: rows of stalls under white and green canvas - fruit, vegetables, flowers,
  // spices - and in the middle, facing St Peter's, the hooded Giordano Bruno in bronze (Ettore Ferrari, 1889) on his
  // tall pedestal, where he was burned in 1600. The rows run along the piazza's long axis, fitted to its mapped outline.
  campo(L,x,z){const g0=gh(x,z),M=Model(),R=mkRng(1600);
    let th=0,hl=28,hw=14;{const pz=(api.AREAS||[]).filter(a=>a.kind==='plaza'&&x>a.bb.x0&&x<a.bb.x1&&z>a.bb.z0&&z<a.bb.z1&&api.inPoly(x,z,a.o));
      if(pz.length){const o=pz[0].o;let mx=0,mz=0;for(const p of o){mx+=p[0];mz+=p[1];}mx/=o.length;mz/=o.length;let a=0,b=0,c=0;for(const p of o){const dx=p[0]-mx,dz=p[1]-mz;a+=dx*dx;b+=dx*dz;c+=dz*dz;}
        th=0.5*Math.atan2(2*b,a-c);const ux=Math.cos(th),uz=Math.sin(th);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of o){const dx=p[0]-x,dz=p[1]-z,u=dx*ux+dz*uz,v=-dx*uz+dz*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
        hl=Math.min(-u0,u1)-4;hw=Math.min(-v0,v1)-3;}}
    // Bruno: a stepped base, the tall pedestal with its bronze reliefs, the hooded figure holding a book
    M.box('travertine',0,0,0,5.2,0.4,5.2);M.box('travertine',0,0.4,0,4.4,0.4,4.4);M.box('granite',0,0.8,0,3.0,4.2,3.0);M.box('travertine',0,5.0,0,3.4,0.5,3.4);
    for(const s2 of [-1,1]){M.box('bronzeDark',s2*1.52,2.2,0,0.06,1.4,2.0);M.box('bronzeDark',0,2.2,s2*1.52,2.0,1.4,0.06);}
    M.cyl('bronzeDark',0,5.5,0,0.62,0.48,2.4,10);M.cyl('bronzeDark',0,7.9,0,0.38,0.34,0.5,10);M.put('bronzeDark',new THREE.ConeGeometry(0.42,0.8,10),0,8.6,0);   // the robe, the shoulders, the hood
    M.box('bronzeDark',0.42,6.7,0,0.3,0.5,0.6);   // the hands and the book, held before him
    // the stalls: two rows either side of him, a gap round the statue
    const PROD=['pRed','pGreen','pOrange','pYellow','pViolet','pRed','pGreen'];let n=0;
    for(const row of [-1,1])for(let u=-hl+3;u<=hl-3;u+=4.6){if(Math.abs(u)<6&&Math.abs(row*hw*0.45)<6)continue;if(R()<0.15)continue;const v=row*Math.min(hw*0.45,7),canvasK=R()<0.7?'canvas':'canvasGreen';n++;
      for(const [du,dv] of [[-1.7,-1.1],[1.7,-1.1],[-1.7,1.1],[1.7,1.1]])M.cyl('iron',u+du,0,v+dv,0.04,0.04,2.3,4);
      M.put(canvasK,new THREE.BoxGeometry(4.0,0.06,2.9),u,2.45,v,0,row*0.12,0);                 // the canvas, tilted to shed rain
      M.box('crate',u,0,v,3.4,0.8,1.9);
      for(let c=0;c<6;c++){const k=PROD[Math.floor(R()*PROD.length)];M.box(k,u-1.4+c*0.56,0.8,v+(R()-0.5)*0.9,0.5,0.18+R()*0.12,0.5);}   // the produce in its crates
      if(R()<0.4)for(let c=0;c<4;c++)M.box('crate',u-1.2+c*0.8,0,v+row*1.5,0.6,0.4,0.45);}
    api.ctx.details.campoStalls=n;
    return M.finish(L,x,g0,z,-th);},
  // ================================================================ the Ponte degli Annibaldi
  // Francesco Cellini's footbridge (with Insula, 2000s) over Via degli Annibaldi, which was cut through the spur of
  // the Oppian in the last century and broke the old line of Via della Polveriera; the bridge puts it back, from
  // Largo Assen Peikov to Largo Gaetana Agnesi, and is where Rome stands to photograph the Colosseum. A slender
  // steel deck, curved (a 123 m radius) to meet the metre between its two ends, paved, with steel railings and
  // lamps; the cutting under it walled. Placed from its mapped ends (OpenStreetMap way 24167622); the cutting itself
  // is carved in the ground by terrainCuts in rome.json.
  annibaldi(L,x,z){const P=api.P,G0=api.groundH0||gh,M=Model(),[ax,az]=P(L.ends[0]),[bx,bz]=P(L.ends[1]),[ha,hb]=L.deck,g0=gh(x,z);
    const len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,ry=-Math.atan2(uz,ux),W=L.width||4.2,N=12,sag=len*len/(8*(L.radius||123));
    const deckAt=t=>ha+(hb-ha)*t+sag*4*t*(1-t);   // the end heights, and the crest of the curve between them
    for(let k=0;k<N;k++){const t0=k/N,t1=(k+1)/N,tm=(t0+t1)/2,cx=ax+(bx-ax)*tm-x,cz=az+(bz-az)*tm-z,y=deckAt(tm)-g0,seg=len/N+0.05,pitch=Math.atan2(deckAt(t1)-deckAt(t0),len/N);
      M.put('iron',new THREE.BoxGeometry(seg,0.55,W*0.62),cx,y-0.75,cz,ry,0,pitch);                          // the steel box under the deck
      M.put('steelPale',new THREE.BoxGeometry(seg,0.22,W),cx,y-0.32,cz,ry,0,pitch);                          // the deck's edge beams
      M.put('travertine',new THREE.BoxGeometry(seg,0.08,W-0.3),cx,y-0.1,cz,ry,0,pitch);                      // the paving
      for(const sd of [-1,1]){const ox=-uz*sd*(W/2-0.06),oz=ux*sd*(W/2-0.06);
        M.put('railBrown',new THREE.CylinderGeometry(0.03,0.03,seg,10).rotateZ(Math.PI/2),cx+ox,y+1.06,cz+oz,ry,0,pitch);   // the handrail, a brown tube
        M.put('steelPale',new THREE.BoxGeometry(seg,0.04,0.012),cx+ox,y+0.1,cz+oz,ry,0,pitch);                 // the bottom rail
        {const tp=t0,ppx=ax+(bx-ax)*tp-x+ox,ppz=az+(bz-az)*tp-z+oz;M.put('steelPale',new THREE.BoxGeometry(0.07,1.06,0.014).translate(0,0.53,0),ppx,deckAt(tp)-g0-0.05,ppz,ry);}   // a post at each joint
        for(let b=0;b<9;b++){const tb=t0+(t1-t0)*(b+0.5)/9,bxp=ax+(bx-ax)*tb-x+ox,bzp=az+(bz-az)*tb-z+oz;M.cyl('steelPale',bxp,deckAt(tb)-g0-0.05,bzp,0.011,0.011,1.08,6);}}}   // its bars, round

    // the lamps, two each side, and the abutments down to the ground at either end
    // Rome's lamps: the dark post, the crook at the top, the lantern hanging from it over the deck
    for(const t of [0.18,0.82])for(const sd of [-1,1]){const px=ax+(bx-ax)*t-x-uz*sd*(W/2-0.1),pz=az+(bz-az)*t-z+ux*sd*(W/2-0.1),y=deckAt(t)-g0,ix=uz*sd,iz=-ux*sd,ang=Math.atan2(iz,ix);
      M.cyl('iron',px,y,pz,0.07,0.045,4.2,8);M.cyl('iron',px,y,pz,0.11,0.1,0.5,8);
      M.put('iron',new THREE.TorusGeometry(0.28,0.022,6,14,Math.PI*1.25).rotateZ(-Math.PI*0.25),px+ix*0.28,y+4.2,pz+iz*0.28,-ang);
      M.cyl('iron',px+ix*0.56,y+3.6,pz+iz*0.56,0.012,0.012,0.6,4);M.cyl('steelPale',px+ix*0.56,y+3.3,pz+iz*0.56,0.11,0.16,0.32,6);M.cyl('iron',px+ix*0.56,y+3.6,pz+iz*0.56,0.16,0.04,0.12,6);}
    for(const [ex,ez,eh] of [[ax,az,ha],[bx,bz,hb]]){const gl=Math.min(gh(ex,ez),G0(ex,ez))-g0;M.put('travertine',new THREE.BoxGeometry(1.2,eh-g0-gl+0.4,W+0.8).translate(0,(eh-g0-gl+0.4)/2,0),ex-x,gl-0.5,ez-z,ry);}
    // the cutting's walls: either side of the street, from the street up to the ground as it was, a travertine coping
    if(L.cut){const C2=L.cut.line.map(([la,lo,h])=>[...P([la,lo]),h]),hw=(L.cut.width||14)/2;
      for(let k=0;k+1<C2.length;k++){const [px,pz,ph]=C2[k],[qx,qz,qh]=C2[k+1],sl=Math.hypot(qx-px,qz-pz),vx=(qx-px)/sl,vz=(qz-pz)/sl,wr=-Math.atan2(vz,vx);
        for(let s2=0;s2<sl;s2+=4){const t=(s2+2)/sl,mx=px+vx*(s2+2),mz=pz+vz*(s2+2),street=ph+(qh-ph)*t;
          // the floor of the cutting, wall to wall, just under the street (the coarse ground is a V between the walls)
          M.put('cutFloor',new THREE.BoxGeometry(4.05,3,hw*2-0.6).translate(0,-1.5,0),mx-x,street-g0+0.04,mz-z,wr);
          M.put('asphalt',new THREE.BoxGeometry(4.05,0.04,L.cut.road||8),mx-x,street-g0+0.06,mz-z,wr);
          if(Math.round(s2/4)%2===0)M.put('stuccoPale',new THREE.BoxGeometry(2.6,0.02,0.14),mx-x,street-g0+0.09,mz-z,wr);
          for(const sd of [-1,1]){const wx=mx-vz*sd*hw,wz=mz+vx*sd*hw,top=G0(wx,wz);if(top-street<0.8)continue;
            // the wall, and the earth behind it out to where the cut in the ground ends (it would show as a ditch)
            const back=L.cut.back||6.5,bx2=wx-vz*sd*back/2,bz2=wz+vx*sd*back/2;
            M.box('brickDark',bx2-x,street-g0-0.3,bz2-z,4.05,top-street+0.4,back+0.8,wr);M.box('earthTop',bx2-x,top-g0+0.1,bz2-z,4.05,0.04,back,wr);M.box('travertine',wx-x,top-g0+0.1,wz-z,4.1,0.25,1.0,wr);}}}}
    // people at the rail, looking at the Colosseum
    for(const [t,sd] of [[0.35,-1],[0.55,-1],[0.62,1],[0.45,1]]){const px=ax+(bx-ax)*t-x-uz*sd*(W/2-0.5),pz=az+(bz-az)*t-z+ux*sd*(W/2-0.5),y=deckAt(t)-g0;
      M.cyl(['brickDark','granite','dark','stuccoRose'][Math.round(t*7)%4],px,y,pz,0.2,0.17,1.25,8);M.put('stuccoPale',new THREE.SphereGeometry(0.13,8,6),px,y+1.42,pz);}
    return M.finish(L,x,g0,z,0);},
  pyramid(L,x,z){const g0=gh(x,z),M=Model();M.put('marble',new THREE.ConeGeometry(29.5/Math.SQRT2,36.4,4).rotateY(Math.PI/4).translate(0,18.2,0));M.box('travertine',0,0,0,30.5,1.0,30.5);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Spanish Steps and Trinità dei Monti
  // A hundred and thirty-five steps from Piazza di Spagna up the Pincian slope to the church: a wide first flight,
  // the stair dividing round its landings, closing again at the top; the obelisk before the church, the church's
  // two bell towers. Built from the foot (here) toward L.top, rising as the ground does.
  steps(L,x,z){const g0=gh(x,z),[tx,tz]=api.P(L.top),gt=gh(tx,tz),rise=Math.max(12,gt-g0),run=Math.hypot(tx-x,tz-z),M=Model(),ry=Math.atan2(tx-x,tz-z);
    // flights along +z, each as a stack of steps; landings between; balustrades along the sides
    const FL=[[0,0.18,30,22],[0.2,0.36,22,14],[0.4,0.58,30,12],[0.62,0.8,18,16],[0.82,0.98,26,22]];
    for(const [u0,u1,w,_w] of FL){const n=27,z0=u0*run,z1=u1*run,y0=u0*rise,y1=u1*rise;for(let k=0;k<n;k++){const t=k/n;M.box('travertine',0,0,z0+(z1-z0)*t,w-(w-_w)*t,y0+(y1-y0)*(t+1/n),(z1-z0)/n*1.02);}
      for(const s of [-1,1])M.box('travertineDark',s*(w/2+0.3),y0,(z0+z1)/2,0.6,1.1+(y1-y0)*0.5,z1-z0);}
    for(const [u0,u1] of [[0.18,0.2],[0.36,0.4],[0.58,0.62],[0.8,0.82]])M.box('travertine',0,0,(u0+u1)/2*run,34,((u0+u1)/2)*rise+0.05,(u1-u0)*run+0.5);
    // the Barcaccia at the foot: Pietro Bernini's half-sunk boat
    M.put('travertine',new THREE.SphereGeometry(1,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),0,0.9,-9,0,0,0,[4.8,1.0,2.2]);M.cyl('water',0,0.6,-9,5.6,5.6,0.05,20);M.cyl('travertine',0,0,-9,6,6,0.6,20);
    // the top: the obelisk, the church front and its towers
    const TY=rise,TZ=run+6;M.obelisk('granite',0,TY,TZ,13.9,1.2,5);
    M.box('stuccoPale',0,TY,TZ+22,24,22,10);M.pediment('stuccoPale',0,TY+22,TZ+17,24,3.6,1.2);M.box('dark',0,TY,TZ+16.9,3.6,6,0.1);
    for(const s of [-1,1]){const bx=s*13.5;M.box('stuccoPale',bx,TY,TZ+21,7,30,7);M.box('stuccoPale',bx,TY+30,TZ+21,6,6,6);M.box('dark',bx,TY+31.5,TZ+17.95,2.2,3.2,0.1);M.cyl('lead',bx,TY+36,TZ+21,3.2,0.3,4.5,4,Math.PI/4);M.box('gold',bx,TY+40.5,TZ+21,0.12,1.0,0.12);}
    for(let k=0;k<10;k++)M.box('travertine',0,TY,TZ+5+k*0.9,20,0.35*(k+1),0.9);
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ a Romanesque campanile: brick, stage over stage of arcaded openings
  campanile(L,x,z){const c=L.campanile,g0=gh(x,z),M=Model(),w=c.w,H=c.h,stages=c.stages||6,plain=c.plain||H*0.32;
    M.box('brick',0,0,0,w,plain,w);const sh=(H-plain-w*0.6)/stages;
    for(let s=0;s<stages;s++){const y=plain+s*sh;M.box('brick',0,y,0,w,sh,w);M.box('travertine',0,y+sh-0.35,0,w+0.5,0.35,w+0.5);
      const n=s<2?2:3;for(let f=0;f<4;f++){const a=f*Math.PI/2;for(let i=0;i<n;i++){const o=(i-(n-1)/2)*w/(n+0.6);M.box('dark',Math.sin(a)*(w/2+0.02)+Math.cos(a)*o,y+sh*0.25,Math.cos(a)*(w/2+0.02)-Math.sin(a)*o,w/(n+1.6),sh*0.5,0.1,a);}}}
    M.put('tile',new THREE.ConeGeometry(w*0.72,w*0.6,4).rotateY(Math.PI/4).translate(0,w*0.3,0),0,H-w*0.6,0);
    if(c.clock)M.cyl('marble',0,plain*0.7,w/2+0.05,1.6,1.6,0.2,20,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Sant'Ivo alla Sapienza: Borromini's spiral
  santivo(L,x,z){const g0=gh(x,z),M=Model(),base=(roofAt(x,z)||g0+22)-g0;
    M.cyl('stuccoPale',0,base,0,8,8,6,6);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M.box('stuccoPale',Math.cos(a)*8.3,base,Math.sin(a)*8.3,1.2,6,1.2);}
    for(let k=0;k<4;k++)M.cyl('stuccoPale',0,base+6+k*1.3,0,7.2-k*1.4,6.6-k*1.4,1.3,12);
    M.cyl('stuccoPale',0,base+11.2,0,2.4,2.2,4,12);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M.column('stuccoPale',Math.cos(a)*2.5,base+11.2,Math.sin(a)*2.5,4,0.28,'corinthian');}
    {const pts=[];for(let i=0;i<=72;i++){const t=i/72,a=t*Math.PI*6,r=2.2*(1-t)+0.25;pts.push(new V3(Math.cos(a)*r,base+15.2+t*6.2,Math.sin(a)*r));}M.put('stuccoPale',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),72,0.42,6,false));
      M.cyl('stuccoPale',0,base+15.2,0,1.0,0.3,6.2,10);}
    M.box('bronzeDark',0,base+21.4,0,0.15,2.6,0.15);M.put('bronzeDark',new THREE.SphereGeometry(0.7,8,6),0,base+23.6,0);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the Great Synagogue: its square dome, in aluminium
  synagogue(L,x,z){const g0=gh(x,z),M=Model(),base=(roofAt(x,z)||g0+24)-g0;
    M.box('stuccoPale',0,base,0,17,5,17);M.put('lead',new THREE.SphereGeometry(12,4,10,0,Math.PI*2,0,Math.PI/2).rotateY(Math.PI/4).scale(1,1.15,1),0,base+5,0);
    M.box('lead',0,base+5+13.8,0,1.6,2.2,1.6);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Lateran: Galilei's façade and its fifteen colossal statues
  lateran(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||90);
    M.box('travertine',0,0,-4,64,32,8);for(const c of [-8,8])M.column('travertine',c,0,0.8,29,1.25,'corinthian');for(const c of [-30,-20,20,30])M.box('travertine',c,0,0.2,2.4,29,1.2);
    M.box('travertine',0,29,0,66,3,3);M.pediment('travertine',0,32,0.6,22,5.6,2.2);M.box('travertine',0,32,-2,66,4,4.6);
    for(let i=0;i<15;i++){const cx=-30+i*(60/14);M.statue('travertine',cx,36+(Math.abs(cx)<11?4:0),-1,7);}
    for(const c of [-14,0,14]){M.box('dark',c,0,0.42,5,10,0.1);M.box('dark',c,15,0.42,4.6,8,0.1);}
    return M.finish(L,x,g0,z,ry);},

  };
}
