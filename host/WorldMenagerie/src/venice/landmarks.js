// Venice: the five things on the skyline that are not a box with a roof on it. Everything else in the city
// is its own mapped footprint - five thousand of them - and the engine draws those; these are the ones a
// massing model gets wrong, because what makes them what they are is a shape rather than a height.
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own, modelled from
// the published dimensions.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  campanile(L,x,z){   // a brick shaft, a belfry, a spire, and on the big one a gilt angel that turns
    const H=L.height||98.6,g0=gh(x,z),parts=[],A=L.turn||0;
    const brick=new THREE.MeshLambertMaterial({color:0x9c5a44,flatShading:true});
    const stone=new THREE.MeshLambertMaterial({color:0xd8d2c2,flatShading:true});
    const roofM=new THREE.MeshLambertMaterial({color:0x5d6a62,flatShading:true});
    const gold=new THREE.MeshPhongMaterial({color:0xc9a23a,specular:0xfff0c0,shininess:80});
    const W=H*0.125;                                    // they are all about eight times as tall as they are wide
    // the shaft: brick, with the flat pilasters that run its whole height
    const sh=box(x,g0,z,W,H*0.72,W,brick);sh.rotation.y=-A;parts.push(sh);
    for(let k=0;k<4;k++){const a=A+k*Math.PI/2;
      for(const off of [-0.28,0.28]){
        const p=box(x+Math.cos(a)*W*0.5-Math.sin(a)*W*off,g0,z+Math.sin(a)*W*0.5+Math.cos(a)*W*off,
          W*0.09,H*0.72,W*0.09,brick);p.rotation.y=-A;parts.push(p);}}
    // the belfry: an open stage with four arches a side, in stone
    const bell=box(x,g0+H*0.72,z,W*1.12,H*0.15,W*1.12,stone);bell.rotation.y=-A;parts.push(bell);
    const dark=new THREE.MeshLambertMaterial({color:0x2e2a26});
    for(let k=0;k<4;k++){const a=A+k*Math.PI/2;
      for(const off of [-0.22,0.22]){
        const o=box(x+Math.cos(a)*W*0.57-Math.sin(a)*W*off,g0+H*0.76,z+Math.sin(a)*W*0.57+Math.cos(a)*W*off,
          W*0.3,H*0.1,W*0.06,dark);o.rotation.y=-A;parts.push(o);}}
    // the attic and the spire
    const att=box(x,g0+H*0.87,z,W*1.0,H*0.07,W*1.0,stone);att.rotation.y=-A;parts.push(att);
    const spire=new THREE.Mesh(new THREE.ConeGeometry(W*0.66,H*0.2,4).translate(0,H*0.1,0),roofM);
    spire.position.set(x,g0+H*0.94,z);spire.rotation.y=A+Math.PI/4;parts.push(spire);
    const g=group(L,parts);
    if(H>90){   // the angel, which is a weathervane and turns with the wind
      const ang=new THREE.Mesh(new THREE.ConeGeometry(W*0.1,H*0.05,6),gold);
      ang.position.set(x,g0+H*1.06,z);scene.add(ang);
      animHooks.push(now=>{ang.rotation.y=now*0.00011;});
    }
    return g;},

  basilica(L,x,z){   // five domes over a Greek cross, which is the one thing an extruded footprint cannot be
    const H=L.height||43,g0=gh(x,z),parts=[],A=L.turn||0.72;
    const stone=new THREE.MeshLambertMaterial({color:0xcfc4ad,flatShading:true});
    const lead=new THREE.MeshLambertMaterial({color:0x7d8a84,flatShading:true});
    const gold=new THREE.MeshPhongMaterial({color:0xb99a44,specular:0xffe9a8,shininess:70});
    const Wd=H*1.7,Dp=H*1.5;
    const body=box(x,g0,z,Wd,H*0.55,Dp,stone);body.rotation.y=-A;parts.push(body);
    // the five domes: one over the crossing and one over each arm
    const dome=(dx,dz,r)=>{
      const c=Math.cos(-A),s=Math.sin(-A),px=x+dx*c-dz*s,pz=z+dx*s+dz*c;
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(r*0.92,r,H*0.14,14),stone);
      drum.position.set(px,g0+H*0.55+H*0.07,pz);parts.push(drum);
      const d=new THREE.Mesh(new THREE.SphereGeometry(r,16,10,0,Math.PI*2,0,Math.PI/2),lead);
      d.scale.y=1.25;d.position.set(px,g0+H*0.69,pz);parts.push(d);
      const fin=new THREE.Mesh(new THREE.ConeGeometry(r*0.12,r*0.5,8),gold);
      fin.position.set(px,g0+H*0.69+r*1.3,pz);parts.push(fin);
    };
    const R0=H*0.32;
    dome(0,0,R0*1.15);dome(Wd*0.3,0,R0);dome(-Wd*0.3,0,R0);dome(0,Dp*0.3,R0);dome(0,-Dp*0.3,R0);
    return group(L,parts);},

  salute(L,x,z){   // the great dome, the small one, and the sixteen scrolls that hold the big one down
    const H=L.height||60,g0=gh(x,z),parts=[],A=L.turn||0;
    const stone=new THREE.MeshLambertMaterial({color:0xd9d3c4,flatShading:true});
    const lead=new THREE.MeshLambertMaterial({color:0x8a938c,flatShading:true});
    const oct=new THREE.Mesh(new THREE.CylinderGeometry(H*0.55,H*0.6,H*0.42,8).translate(0,H*0.21,0),stone);
    oct.position.set(x,g0,z);oct.rotation.y=A;parts.push(oct);
    const drum=new THREE.Mesh(new THREE.CylinderGeometry(H*0.34,H*0.36,H*0.16,16),stone);
    drum.position.set(x,g0+H*0.5,z);parts.push(drum);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(H*0.34,18,12,0,Math.PI*2,0,Math.PI/2),lead);
    dome.scale.y=1.05;dome.position.set(x,g0+H*0.58,z);parts.push(dome);
    const lant=new THREE.Mesh(new THREE.CylinderGeometry(H*0.07,H*0.09,H*0.14,10),stone);
    lant.position.set(x,g0+H*0.92,z);parts.push(lant);
    // the scrolls: sixteen of them, one to each buttress, which is what the building is famous for
    for(let k=0;k<16;k++){const a=A+k/16*Math.PI*2;
      const s=new THREE.Mesh(new THREE.TorusGeometry(H*0.06,H*0.022,5,10,Math.PI),stone);
      s.position.set(x+Math.cos(a)*H*0.46,g0+H*0.44,z+Math.sin(a)*H*0.46);
      s.rotation.set(0,-a,Math.PI/2);parts.push(s);
      parts.push(box(x+Math.cos(a)*H*0.5,g0+H*0.42,z+Math.sin(a)*H*0.5,H*0.05,H*0.1,H*0.05,stone));}
    // the small dome over the sacristy, behind
    const c2=Math.cos(-A),s2=Math.sin(-A),px=x+(-H*0.75)*c2,pz=z+(-H*0.75)*s2;
    parts.push(box(px,g0,pz,H*0.6,H*0.3,H*0.5,stone));
    const d2=new THREE.Mesh(new THREE.SphereGeometry(H*0.2,14,9,0,Math.PI*2,0,Math.PI/2),lead);
    d2.position.set(px,g0+H*0.3,pz);parts.push(d2);
    return group(L,parts);},

  // Piazza San Marco itself: the paving - grey trachyte crossed by bands of white Istrian stone, laid out by Andrea
  // Tirali in 1723, a great grid of panels along the piazza's length - and the cafés' orchestras, Florian's and
  // Quadri's, playing to each other across it from their little stages among the tables. The bands are fitted to
  // the mapped outline of the piazza (its long axis, clipped to its edge).
  piazza(L,x,z){const P=api.P,g0=gh(x,z),parts=[],R=mkRng(1723);
    const white=new THREE.MeshLambertMaterial({color:0xece8de}),dark=new THREE.MeshLambertMaterial({color:0x1c1c1e}),suit=new THREE.MeshLambertMaterial({color:0x22242a}),
      wood=new THREE.MeshLambertMaterial({color:0x6a3a22}),cloth=new THREE.MeshLambertMaterial({color:0xf2efe6}),chair=new THREE.MeshLambertMaterial({color:0x8a7a62}),skin=new THREE.MeshLambertMaterial({color:0xd9b08c});
    const pz=(api.AREAS||[]).filter(a=>a.kind==='plaza'&&x>a.bb.x0&&x<a.bb.x1&&z>a.bb.z0&&z<a.bb.z1&&api.inPoly(x,z,a.o)).sort((a,b)=>(a.bb.x1-a.bb.x0)*(a.bb.z1-a.bb.z0)-(b.bb.x1-b.bb.x0)*(b.bb.z1-b.bb.z0));
    if(pz.length){const o=pz[pz.length-1].o;let mx=0,mz=0;for(const p of o){mx+=p[0];mz+=p[1];}mx/=o.length;mz/=o.length;let a=0,b=0,c=0;for(const p of o){const dx=p[0]-mx,dz=p[1]-mz;a+=dx*dx;b+=dx*dz;c+=dz*dz;}
      const th=0.5*Math.atan2(2*b,a-c),ux=Math.cos(th),uz=Math.sin(th),G=L.grid||9,Wd=0.5;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
      for(const p of o){const dx=p[0]-mx,dz=p[1]-mz,u=dx*ux+dz*uz,v=-dx*uz+dz*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
      // a band along a line, laid in pieces where the line is inside the piazza; proud of the paving, which is drawn pulled forward
      const lay=(px,pz2,dx,dz,len)=>{let run=null;for(let s=0;s<=len;s+=1){const qx=px+dx*s,qz=pz2+dz*s,inside=api.inPoly(qx,qz,o);
          if(inside&&run===null)run=s;if((!inside||s+1>len)&&run!==null){const e=inside?s:s-1;if(e>run){const cx=px+dx*(run+e)/2,cz=pz2+dz*(run+e)/2;const m=box(cx,gh(cx,cz)+0.04,cz,e-run,0.08,Wd,white);m.rotation.y=-Math.atan2(dz,dx);parts.push(m);}run=null;}}};
      for(let v=Math.ceil(v0/G)*G;v<v1;v+=G)lay(mx+ux*u0-uz*v,mz+uz*u0+ux*v,ux,uz,u1-u0);           // along the length
      for(let u=Math.ceil(u0/G)*G;u<u1;u+=G)lay(mx+ux*u-uz*v0,mz+uz*u+ux*v0,-uz,ux,v1-v0);           // across it
      for(let u=Math.ceil(u0/(2*G))*2*G;u<u1;u+=2*G)for(let v=Math.ceil(v0/(2*G))*2*G;v<v1;v+=2*G)for(const sd of [-1,1])   // the diagonals in every other panel
        lay(mx+ux*u-uz*v,mz+uz*u+ux*v,(ux-sd*uz)/Math.SQRT2,(uz+sd*ux)/Math.SQRT2,G*Math.SQRT2);}
    // the orchestras: a stage, a piano, a double bass, four players in dark suits; the café's tables in front
    for(const [la,lo,face] of L.orchestras||[]){const [ox,oz]=P([la,lo]),a=(face||0)*Math.PI/180,fx=Math.sin(a),fz=-Math.cos(a),rx=-fz,rz=fx,ry=Math.atan2(-fz,fx),g=gh(ox,oz);
      const at=(f,r)=>[ox+fx*f+rx*r,oz+fz*f+rz*r],put=(m,f,r,y,rot=ry)=>{const [px,pz2]=at(f,r);m.position.x=px;m.position.z=pz2;m.position.y=g+y;m.rotation.y=rot;parts.push(m);};
      {const m=box(0,0,0,5.2,0.35,3.4,wood);put(m,0,0,0);}
      {const m=box(0,0,0,1.5,1.0,0.6,dark);put(m,-0.6,-1.3,0.35);const lid=box(0,0,0,1.5,0.05,1.4,dark);put(lid,-0.6,-1.3,1.45);}
      {const m=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),wood);m.scale.set(0.55,1.4,0.3);put(m,-0.4,1.5,1.2);}   // the double bass
      for(const [f,r] of [[-0.2,-0.5],[-0.3,0.6],[0.4,1.3],[-0.9,1.6]]){const b2=box(0,0,0,0.42,1.1,0.3,suit);put(b2,f,r,1.0);const h=new THREE.Mesh(new THREE.SphereGeometry(0.13,7,5),skin);put(h,f,r,2.25);
        const l=box(0,0,0,0.32,0.65,0.2,suit);put(l,f,r,0.35);}
      for(let k=0;k<(L.tables||24);k++){const f=4+Math.floor(k/6)*2.6+R()*0.4,r=(k%6-2.5)*2.4+R()*0.4,[px,pz2]=at(f,r),tg=gh(px,pz2);
        const top=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.04,10),cloth);top.position.set(px,tg+0.74,pz2);parts.push(top);
        const leg=box(px,tg,pz2,0.06,0.72,0.06,dark);parts.push(leg);
        for(const sd of [-1,1]){const c=box(px+rx*sd*0.6,tg,pz2+rz*sd*0.6,0.42,0.45,0.42,chair);parts.push(c);const bk=box(px+rx*sd*0.82,tg+0.45,pz2+rz*sd*0.82,0.06,0.5,0.42,chair);bk.rotation.y=ry;parts.push(bk);}}}
    // merged by material: hundreds of bands and chairs, a handful of draws
    ctx.details=Object.assign(ctx.details||{},{piazzaPlaza:pz.length,piazzaParts:parts.length,piazzaBands:parts.filter(m=>m.material===white).length});
    const byM=new Map();for(const m of parts){let l=byM.get(m.material);if(!l)byM.set(m.material,l=[]);l.push(m);}
    return group(L,[...byM].map(([m,l])=>mergeParts(l,m)));},

  rialto(L,x,z){   // one stone arch over the Grand Canal, with two rows of shops standing on it
    const A=L.turn||0,g0=gh(x,z),parts=[];
    const stone=new THREE.MeshLambertMaterial({color:0xd4cdba,flatShading:true});
    const roofM=new THREE.MeshLambertMaterial({color:0x8a5a46,flatShading:true});
    const SPAN=L.span||28,RISE=L.rise||7.5,W=L.width||22;
    const ux=Math.cos(A),uz=Math.sin(A);
    const N=11;
    for(let k=0;k<N;k++){
      const t=(k+0.5)/N,u=(t-0.5)*SPAN;
      const y=g0+RISE*Math.sin(t*Math.PI)*0.9+1.2;
      const seg=box(x+ux*u,y,z+uz*u,SPAN/N*1.02,2.2,W,stone);seg.rotation.y=-A;parts.push(seg);
      // the arch ring under it
      const arc=box(x+ux*u,y-2.4,z+uz*u,SPAN/N*1.02,1.6,W*0.9,stone);arc.rotation.y=-A;parts.push(arc);
      // the two rows of shops, with the open walk between them
      if(k>0&&k<N-1)for(const sd of [-1,1]){
        const sx=x+ux*u-uz*sd*W*0.3,sz=z+uz*u+ux*sd*W*0.3;
        const sh=box(sx,y+2.2,sz,SPAN/N*0.9,4.2,W*0.28,stone);sh.rotation.y=-A;parts.push(sh);
        const rf=box(sx,y+6.4,sz,SPAN/N*0.95,0.8,W*0.32,roofM);rf.rotation.y=-A;parts.push(rf);
      }
    }
    return group(L,parts);},

  ducale(L,x,z){   // the Doge's Palace: two storeys of arcade holding up a wall of pink and white lozenges
    // Built in the palace's own frame: u east along the Molo front, v north along the Piazzetta front, from the
    // south-west corner (L.corner), the fronts turned L.turn from the map's axes. The mapped wings are dropped
    // (clearArea in the config) and this stands on their footprint: the Molo front 74 m, the Piazzetta 77 m, the
    // wing on the Rio di Palazzo back to the Basilica, the courtyard between.
    const g0=gh(x,z),[ox,oz]=ctx.project(L.corner),A=L.turn||0;
    const U=new THREE.Vector3(Math.cos(A),0,-Math.sin(A)),Y=new THREE.Vector3(0,1,0),V=new THREE.Vector3(-Math.sin(A),0,-Math.cos(A));
    const frame=(along,at)=>new THREE.Matrix4().makeBasis(along,Y,along.clone().cross(Y)).setPosition(at);
    const O=new THREE.Vector3(ox,g0,oz),PLAN=frame(U,O);   // the plan frame: x=u, y up, z=-v (the Molo front's own frame too)
    const mats={stone:[0xece5d6],shade:[0xbdb2a0],dark:[0x2a2522],lead:[0x7f8784],bronze:[0x5e5032],floor:[0xd9d0bf]};
    const BK={};const add=(k,geo,m4)=>{geo.applyMatrix4(m4);(BK[k]||(BK[k]=[])).push(new THREE.Mesh(geo));};
    const bx=(k,m4,x0,x1,y0,y1,z0,z1)=>add(k,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),m4);
    const pb=(k,u0,u1,y0,y1,v0,v1)=>bx(k,PLAN,u0,u1,y0,y1,-v1,-v0);   // a box in plan: u, height, v
    const pointed=(w,h,cx=0,y0=0)=>{const s=new THREE.Shape(),sp=y0+h-w*0.72;s.moveTo(cx-w/2,y0);s.lineTo(cx+w/2,y0);s.lineTo(cx+w/2,sp);
      s.quadraticCurveTo(cx+w/2,sp+(y0+h-sp)*0.62,cx,y0+h);s.quadraticCurveTo(cx-w/2,sp+(y0+h-sp)*0.62,cx-w/2,sp);s.lineTo(cx-w/2,y0);return s;};
    const ext=(shape,depth,z0)=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:6}).translate(0,0,z0);
    // the wall's pink and white: Verona marble and Istrian stone laid in lozenges
    const tc=document.createElement('canvas');tc.width=tc.height=128;{const g=tc.getContext('2d'),rng=mkRng(1423);g.fillStyle='#e4b4a0';g.fillRect(0,0,128,128);
      const dia=(cx,cy,r,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r,cy);g.lineTo(cx,cy+r);g.lineTo(cx-r,cy);g.closePath();g.fill();};
      for(const [cx,cy] of [[0,0],[128,0],[0,128],[128,128],[64,64]]){dia(cx,cy,64,'#f1e6d8');dia(cx,cy,52,'#dda08c');dia(cx,cy,14,'#f1e6d8');}
      for(let i=0;i<900;i++){g.fillStyle=`rgba(${rng()<0.5?90:255},${rng()<0.5?60:240},50,0.06)`;g.fillRect(rng()*128,rng()*128,2,2);}}
    const pinkT=new THREE.CanvasTexture(tc);pinkT.wrapS=pinkT.wrapT=THREE.RepeatWrapping;
    const parts=[];

    // ---- a front: the arcade, the loggia, the wall, the crenellation. F is the front's frame (x along it, z out)
    function front(F,Lf,wins,balc,ends){
      const n1=Math.round(Lf/4.4),p1=Lf/n1,n2=n1*2,p2=Lf/n2;
      // the ground arcade: squat columns on bases, piers at the ends, pointed arches in a band over them
      for(let k=0;k<=n1;k++){const xk=k*p1;
        if(k===0||k===n1){const a0=k?Lf-1.4:0;bx('stone',F,a0,a0+1.4,0,5.0,-1.4,0);continue;}
        add('stone',new THREE.CylinderGeometry(0.48,0.54,4.3,10).translate(xk,0.35+2.15,-0.45),F);
        bx('stone',F,xk-0.7,xk+0.7,0,0.35,-1.15,0.25);bx('stone',F,xk-0.75,xk+0.75,4.65,5.0,-1.2,0.3);}
      {const s=new THREE.Shape();s.moveTo(0,4.98);s.lineTo(Lf,4.98);s.lineTo(Lf,7.6);s.lineTo(0,7.6);s.lineTo(0,4.98);
       for(let k=0;k<n1;k++){const x0=k*p1+(k===0?1.4:0.62),x1=(k+1)*p1-(k+1===n1?1.4:0.62);s.holes.push(pointed(x1-x0,1.95,(x0+x1)/2,5.0));}
       add('stone',ext(s,0.7,-0.7),F);}
      // the loggia: its floor over the portico, a balustrade, columns twice as close, arches and quatrefoils
      bx('stone',F,0,Lf,7.6,8.05,-5.0,0);bx('stone',F,0,Lf,7.55,7.8,0,0.25);
      for(let xx=0.6;xx<Lf-0.5;xx+=0.42)bx('stone',F,xx-0.07,xx+0.07,8.05,8.85,-0.3,-0.12);bx('stone',F,0,Lf,8.85,9.0,-0.34,-0.06);
      for(let k=1;k<n2;k++){const xk=k*p2;add('stone',new THREE.CylinderGeometry(0.24,0.27,2.9,8).translate(xk,8.05+1.45,-0.3),F);bx('stone',F,xk-0.38,xk+0.38,10.95,11.2,-0.68,0.08);}
      bx('stone',F,0,1.0,8.05,11.2,-1.0,0);bx('stone',F,Lf-1.0,Lf,8.05,11.2,-1.0,0);
      {const s=new THREE.Shape();s.moveTo(0,11.18);s.lineTo(Lf,11.18);s.lineTo(Lf,14.4);s.lineTo(0,14.4);s.lineTo(0,11.18);
       for(let k=0;k<n2;k++){const x0=k*p2+(k===0?1.0:0.36),x1=(k+1)*p2-(k+1===n2?1.0:0.36);s.holes.push(pointed(x1-x0,1.5,(x0+x1)/2,11.2));}
       for(let k=1;k<n2;k++){const h=new THREE.Path();h.absarc(k*p2,13.55,0.5,0,Math.PI*2,true);s.holes.push(h);}
       add('stone',ext(s,0.6,-0.6),F);}
      bx('stone',F,0,Lf,14.4,14.8,-4.6,0);bx('stone',F,0,Lf,14.4,14.75,0,0.3);
      // the wall: one plane of lozenges, the windows set in it
      {const t=pinkT.clone();t.needsUpdate=true;t.repeat.set(Lf/2.2,9.85/2.2);
       const wall=new THREE.Mesh(new THREE.PlaneGeometry(Lf,9.85).translate(Lf/2,14.75+9.85/2,0.02).applyMatrix4(F),new THREE.MeshLambertMaterial({map:t}));parts.push(wall);}
      for(const wx of wins){add('stone',ext(pointed(3.0,5.6,wx,16.0),0.25,0),F);add('dark',ext(pointed(2.3,4.9,wx,16.35),0.26,0.05),F);
        bx('stone',F,wx-0.06,wx+0.06,16.35,20.1,0.2,0.36);bx('stone',F,wx-1.6,wx+1.6,15.85,16.05,0,0.4);}
      if(balc!=null){add('stone',ext(pointed(4.4,8.0,balc,15.0),0.35,0),F);add('dark',ext(pointed(3.2,6.8,balc,15.4),0.36,0.05),F);
        bx('stone',F,balc-3,balc+3,14.75,15.1,0,1.4);for(let xx=balc-2.8;xx<=balc+2.81;xx+=0.4)bx('stone',F,xx-0.06,xx+0.06,15.1,16.0,1.18,1.3);bx('stone',F,balc-3,balc+3,16.0,16.12,1.1,1.38);
        bx('stone',F,balc-1.6,balc+1.6,23.0,24.6,0,0.7);bx('stone',F,balc-0.4,balc+0.4,24.6,26.6,0.1,0.6);
        add('stone',new THREE.ConeGeometry(0.9,3.2,4).rotateY(Math.PI/4).translate(balc,28.2,0.35),F);
        for(const s of [-1,1])add('stone',new THREE.ConeGeometry(0.35,2.6,4).rotateY(Math.PI/4).translate(balc+s*2.4,24.0,0.35),F);}
      // a row of round windows high up, between the tall ones
      const ws=[...wins,...(balc!=null?[balc]:[])].sort((a,b)=>a-b);
      for(let i=0;i+1<ws.length;i++){const m=(ws[i]+ws[i+1])/2;if(balc!=null&&Math.abs(m-balc)<4)continue;
        add('dark',new THREE.CylinderGeometry(0.55,0.55,0.2,14).rotateX(Math.PI/2).translate(m,23.0,0.1),F);
        add('stone',new THREE.TorusGeometry(0.64,0.1,6,16).translate(m,23.0,0.16),F);}
      // the cornice and the crenellation: white merlons, each with its pointed cap
      bx('stone',F,0,Lf,24.6,25.0,-0.25,0.3);
      for(let xx=0.85;xx<Lf-0.4;xx+=1.7){bx('stone',F,xx-0.42,xx+0.42,25.0,25.85,-0.15,0.18);add('stone',new THREE.ConeGeometry(0.46,0.9,4).rotateY(Math.PI/4).translate(xx,26.3,0.02),F);}
      // the corners: a stone aedicule with its spire on each end asked for
      for(const e of ends){const ex=e?Lf:0;bx('stone',F,ex-0.9,ex+0.9,24.6,27.6,-0.9,0.9);add('stone',new THREE.ConeGeometry(0.85,3.0,4).rotateY(Math.PI/4).translate(ex,29.1,0),F);}
    }
    // the Molo front, west to east; the Piazzetta front, north to south (so its outside faces the Piazzetta)
    front(PLAN,74,[6.5,14.5,23.5,51,59,67.5],37,[0,1]);
    const W0=O.clone().addScaledVector(V,77),PIAZ=frame(V.clone().negate(),W0);
    front(PIAZ,77,[8.5,17.5,26.5,50.5,59.5,68.5],38.5,[]);

    // ---- the wings behind the fronts: the portico's back wall, the loggia's, the wall's block
    pb('shade',5,74,0,7.6,5,20.5);pb('shade',4.6,74,8.05,14.4,4.6,20.5);pb('stone',0,74,14.4,24.6,0,20.5);
    pb('shade',5,18.6,0,7.6,5,77);pb('shade',4.6,18.6,8.05,14.4,4.6,77);pb('stone',0,18.6,14.4,24.6,0,77);
    // the Rio wing: plain Renaissance stone back to the Basilica, four rows of windows on the canal and the courtyard
    pb('stone',53,77,0,24.6,20.5,102);
    for(let v=23.5;v<100;v+=3.4)for(const [y,h] of [[2.4,2.4],[7.6,2.8],[13,2.8],[18.6,2.4]]){pb('dark',77,77.12,y,y+h,v,v+1.3);pb('dark',52.88,53,y,y+h,v,v+1.3);}
    // the courtyard's other faces: windows in rows; the low north range, the Porta della Carta, the giants' stair
    for(let u=21;u<52;u+=3.4)for(const y of [9.5,16,20.5])pb('dark',u,u+1.3,y,y+2.4,20.5,20.62);
    for(let v=24;v<76;v+=3.4)for(const y of [9.5,16,20.5])pb('dark',18.6,18.72,y,y+2.4,v,v+1.3);
    pb('shade',21,52,0.6,4.4,20.5,20.62);pb('shade',18.6,18.72,0.6,4.4,24,76);
    pb('stone',0.5,41.6,0,15,77,85);pb('stone',51,53,0,15,77,85);pb('stone',41.6,51,0,15,83.3,85);
    for(let u=4;u<40;u+=3.4)pb('dark',u,u+1.2,8,10.4,76.88,77);
    // the Porta della Carta: the gate between palace and church, tall and pointed, on the Piazzetta
    add('stone',ext(pointed(5.2,12.5,-4.2,0),0.4,0),PIAZ);add('dark',ext(pointed(3.4,7.0,-4.2,0),0.42,0.04),PIAZ);
    for(const s of [-1,1])add('stone',new THREE.ConeGeometry(0.4,4.5,4).rotateY(Math.PI/4).translate(-4.2+s*2.6,16.5,0.2),PIAZ);
    add('stone',new THREE.ConeGeometry(0.9,4.0,4).rotateY(Math.PI/4).translate(-4.2,16.0,0.2),PIAZ);
    // the Scala dei Giganti: up from the courtyard to the loggia floor, Mars and Neptune at the top
    for(let i=0;i<12;i++)pb('stone',41.6,51,0,(i+1)*0.633,67.9+i*0.92,78.9);
    pb('stone',41.6,51,0,7.6,78.9,83.3);for(const u of [41.6,50.6])pb('stone',u,u+0.4,0,8.4,67.9,83.3);
    for(const u of [42.6,50.0]){pb('stone',u-0.45,u+0.45,7.6,11.0,80.6,81.4);add('stone',new THREE.SphereGeometry(0.42,8,6).translate(u,11.4,-81),PLAN);}
    // the courtyard floor and its two bronze wellheads
    pb('floor',18.6,53,0,0.06,20.5,77);
    for(const u of [28,43])add('bronze',new THREE.CylinderGeometry(1.25,1.35,1.1,14).translate(u,0.55,-48),PLAN);
    // the roofs: lead, hipped, behind the crenellation
    const ridge=(w,h,len)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.lineTo(-w/2,0);return new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});};
    add('lead',ridge(19,5,72).rotateY(Math.PI/2).translate(1,24.6,-10.25),PLAN);
    add('lead',ridge(17.6,4.6,75).translate(9.3,24.6,-76),PLAN);
    add('lead',ridge(23,5.5,81).translate(65,24.6,-101.5),PLAN);
    for(const k in BK){const m=mergeParts(BK[k],new THREE.MeshLambertMaterial({color:mats[k][0],flatShading:true}));parts.push(m);}
    return group(L,parts);},

  };
}
