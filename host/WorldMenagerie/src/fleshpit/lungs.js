// ---------- the lungs: what the bronchial forests actually are ----------
// The first version of the forests was a red ellipsoid either side of the shaft with trees stuck in it, and
// from outside - which is how the section view shows it - that read as a ball with bristles. What the park
// sold as a forest is a lung: the shaft is the windpipe, and at the carina a main bronchus leaves the wall on
// each side and divides, and divides again, until every twig ends in a bunch of glossy air sacs. The "trees"
// were the airways, seen from inside by people who had never seen a lung from inside.
//
// So each side is built as a lung and nothing else:
//
//   the tissue    a sphere pushed into a lung's shape - a rounded apex, a broad base domed up over the
//                 diaphragm, a flattened medial face where it meets the shaft, fissures cut between the lobes
//                 (three on the right, two on the left, and the left has the notch the heart sits in) - drawn
//                 back-face only, like the shaft, so from outside it is its own cutaway
//   the pleura    the same shape, front-faced and nearly clear, so the outline still reads from outside
//   the airways   a real branching tree: each airway splits in two, unequally, the branching plane turning a
//                 quarter turn each generation, steered to stay inside the lobe; the big ones carry cartilage
//                 rings, and every terminal twig ends in an acinus, the bunch of alveoli the park called
//                 bulbules
//   the vessels   the pulmonary artery (blue, it carries the spent blood) and vein (red) running either side
//                 of every large airway, as they do
//
// Everything is built in the lung's own frame, with the origin at the hilum - where the bronchus leaves the
// shaft - so that the whole lung can inflate about that point on the breath without anything tearing loose.

export function buildLungs(env){
  const {THREE,RNG,AX,AZ,Y,radiusAt,mergeParts,top,bottom}=env;
  const H2=Math.min(250,(bottom-top)*0.47),A=205,B=168,MED=0.56;   // half height, lateral, front-to-back
  const dC=(top+bottom)/2+10;
  const UP=new THREE.Vector3(0,1,0),ZED=new THREE.Vector3(0,0,1);

  const tissueM=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.BackSide,specular:0x4a2a2e,shininess:16,emissive:0x1c080a});
  const pleuraM=new THREE.MeshPhongMaterial({color:0xe7a2a0,specular:0xffffff,shininess:90,transparent:true,opacity:0.13,
    depthWrite:false,side:THREE.FrontSide});
  const airwayM=new THREE.MeshPhongMaterial({color:0xd6ab9f,specular:0x5a3434,shininess:34,emissive:0x1e0a0a});
  const cartM=new THREE.MeshPhongMaterial({color:0xefe2d6,specular:0x806060,shininess:40,emissive:0x221614});
  const arteryM=new THREE.MeshPhongMaterial({color:0x4d4a92,specular:0x302a60,shininess:30,emissive:0x0c0a22});
  const veinM=new THREE.MeshPhongMaterial({color:0x92232f,specular:0x602028,shininess:30,emissive:0x220406});
  const acinusM=new THREE.MeshPhongMaterial({color:0xd29a92,specular:0xffffff,shininess:75,emissive:0x2a0e10});
  // What the gullet put into them on the night: a flat-topped body of the same shape, clipped in the shader to
  // a level the incident raises. Hidden until then.
  const fluidU={uLevel:{value:-1e4}};
  const fluidM=new THREE.MeshPhongMaterial({color:0x7c6c3e,emissive:0x2a2008,specular:0xd8d0a0,shininess:60,
    transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false});
  fluidM.onBeforeCompile=sh=>{
    sh.uniforms.uLevel=fluidU.uLevel;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uLevel;')
      .replace('#include <begin_vertex>','vec3 transformed=vec3(position);transformed.y=min(transformed.y,uLevel);');
  };
  fluidM.customProgramCacheKey=()=>'fplungfluid';

  // ---- the shape ----
  // A unit sphere, pushed. The grooves are measured on the sphere before it is pushed, so a fissure stays one
  // clean line however the lobe around it bulges. g is how deep in a groove the point is, for its colour.
  function shape(v,left){
    const x0=v.x,y0=v.y,z0=v.z;
    let x=x0,y=y0,z=z0;
    if(y<-0.5){const r2=(x*x+z*z)/0.75;y=-0.5-(-0.5-y)*0.3+0.2*Math.max(0,1-r2);}   // the base, domed up
    const up=(y+1)/2,taper=1-0.5*Math.pow(Math.max(0,up),1.8);                         // the apex, narrower
    x*=taper;z*=taper;
    if(x<0)x*=MED;                                                                       // the medial face
    let s=1,g=0;
    const oblique=y0*0.72+z0*0.7-0.05;                                                   // oblique fissure: both
    g=Math.max(g,Math.exp(-((oblique/0.045)**2)));
    if(!left){const h=y0-0.22;                                                           // horizontal: right only
      if(z0>0&&oblique<0)g=Math.max(g,Math.exp(-((h/0.04)**2)));}
    if(left){const d2=(x0+0.55)**2+(y0+0.25)**2+(z0+0.6)**2;s-=0.24*Math.exp(-d2/0.09);} // the cardiac notch, towards the heart
    s-=0.1*g;
    s*=1+0.016*Math.sin(x0*23+1.3)*Math.sin(y0*19)*Math.sin(z0*21+0.7)+0.01*Math.sin(x0*41)*Math.sin(z0*37+y0*11);
    v.set(x*A*s,y*H2*s,z*B*s);
    return g;
  }
  // Is a point (lung-centre coordinates) comfortably inside? The airways are steered by this.
  function inside(p,margin){
    const ny=p.y/H2;if(ny<-0.46||ny>0.9)return false;
    const up=(ny+1)/2,taper=1-0.5*Math.pow(Math.max(0,up),1.8);
    const nx=p.x/((p.x<0?A*MED:A)*taper),nz=p.z/(B*taper);
    return nx*nx+ny*ny+nz*nz<(margin||0.74);
  }

  function tissue(left,hil){
    const g=new THREE.SphereGeometry(1,72,54),p=g.attributes.position,col=[],v=new THREE.Vector3();
    const base=new THREE.Color(0xb86a6c),groove=new THREE.Color(0x5a2a30),spot=new THREE.Color(0x3a2a30),low=new THREE.Color(0x7a3a58);
    const c=new THREE.Color();
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i);const y0=v.y,gr=shape(v,left);p.setXYZ(i,v.x-hil.x,v.y-hil.y,v.z-hil.z);
      c.copy(base).lerp(low,Math.max(0,-y0-0.2)*0.7);                      // blood settles in the base
      c.lerp(groove,gr*0.8);
      const n=Math.sin(v.x*0.11)*Math.sin(v.y*0.13+1)*Math.sin(v.z*0.12+2);  // the dark mottling of an old lung
      if(n>0.55)c.lerp(spot,(n-0.55)*1.6);
      c.multiplyScalar(0.9+0.2*Math.sin(v.x*0.3+v.z*0.27));
      col.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.computeVertexNormals();g.computeBoundingSphere();
    return g;
  }

  // ---- the tree ----
  function tube(a,b,r0,r1,seg,m){
    const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
    const t=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,len,seg,1,true),m);
    t.position.copy(a).addScaledVector(dir,0.5);t.quaternion.setFromUnitVectors(UP,dir.normalize());return t;
  }
  function tree(hil,start,dir0){
    const air=[],rings=[],art=[],vein=[],acini=[],perches=[];
    const tmp=new THREE.Vector3(),q=new THREE.Quaternion();
    const MAXG=9;
    function grow(p,dir,len,rad,gen,plane){
      let end=null,d=dir.clone();
      for(let tries=0;tries<4;tries++){
        const e=p.clone().addScaledVector(d,len);
        if(gen<1||inside(e)){end=e;break;}
        d.lerp(tmp.copy(p).multiplyScalar(-1).normalize(),0.45).normalize();len*=0.78;   // steer back in
      }
      if(!end){if(gen>2)acinus(p,dir,rad);return;}
      const r1=rad*0.86,seg=gen<2?12:gen<5?8:5;
      const a=p.clone().sub(hil),b=end.clone().sub(hil);
      air.push(tube(a,b,rad,r1,seg,airwayM));
      if(gen<=3){                                              // cartilage rings on the big airways
        const n=Math.floor(len/(rad*2.4));
        for(let k=1;k<n;k++){const u=k/n,rr=rad+(r1-rad)*u;
          const ring=new THREE.Mesh(new THREE.TorusGeometry(rr*1.06,rr*0.13,4,seg),cartM);
          ring.position.copy(a).lerp(b,u);ring.quaternion.setFromUnitVectors(ZED,d);rings.push(ring);}
      }
      if(gen<=5){                                              // the artery and the vein alongside
        const side=new THREE.Vector3().crossVectors(d,plane).normalize();
        const off=rad*1.7;
        art.push(tube(a.clone().addScaledVector(side,off),b.clone().addScaledVector(side,off*0.9),rad*0.55,r1*0.55,seg>5?7:5,arteryM));
        vein.push(tube(a.clone().addScaledVector(side,-off),b.clone().addScaledVector(side,-off*0.9),rad*0.5,r1*0.5,seg>5?7:5,veinM));
      }
      if(gen>=3&&gen<=6)perches.push(a.clone().lerp(b,0.5));
      if(gen>=MAXG){acinus(end,d,r1);return;}
      // two children, unequal, in a plane that turns a quarter turn each generation. The first two splits are
      // the lobar and segmental bronchi, which go steeply up to the apex and down to the base; after that the
      // angles close up and the tree fills in between.
      const wide=gen===0?1.9:gen===1?1.35:1;
      const major=(0.36+RNG()*0.14)*wide,minor=(0.58+RNG()*0.22)*wide,flip=gen===0?1:RNG()<0.5?1:-1;
      for(const [ang,lk,rk] of [[major*flip,0.86,0.8],[-minor*flip,0.7,0.66]]){
        q.setFromAxisAngle(plane,ang);
        const cd=d.clone().applyQuaternion(q);
        const np=new THREE.Vector3().crossVectors(cd,plane).normalize();   // the next plane, a quarter turn on
        grow(end,cd,len*lk*(0.9+RNG()*0.2),r1*rk,gen+1,np.lengthSq()>0.1?np:plane);
      }
    }
    function acinus(p,dir,rad){
      const n=5+Math.floor(RNG()*4),c=p.clone().sub(hil).addScaledVector(dir,2.2+rad);
      for(let k=0;k<n;k++){const R0=1.3+RNG()*2.1+rad*0.5;
        const s=new THREE.Mesh(new THREE.IcosahedronGeometry(R0,1),acinusM);
        s.position.set(c.x+(RNG()-0.5)*4.2,c.y+(RNG()-0.5)*4.2,c.z+(RNG()-0.5)*4.2);acini.push(s);}
    }
    grow(start,dir0,92,11.5,0,ZED.clone());
    return {air,rings,art,vein,acini,perches};
  }

  // ---- the two of them ----
  const out=[];
  for(const [side,left] of [[0,false],[Math.PI,true]]){
    const cr=radiusAt(dC)*0.95+A*MED-12;                        // the medial face just inside the shaft wall
    const hil=new THREE.Vector3(-A*MED*0.92,H2*0.1,0);          // the hilum, in lung-centre coordinates
    const start=new THREE.Vector3(-A*MED-10,H2*0.1,0);          // the bronchus starts in the shaft wall itself
    const T=tree(hil,start,new THREE.Vector3(1,-0.12,0).normalize());
    const g=new THREE.Group();
    const tis=tissue(left,hil);
    const tm=new THREE.Mesh(tis,tissueM);tm.frustumCulled=false;g.add(tm);
    const pl=new THREE.Mesh(tis,pleuraM);pl.scale.setScalar(1.012);pl.userData.noWire=true;g.add(pl);
    const fluid=new THREE.Mesh(tis,fluidM);fluid.scale.setScalar(0.97);fluid.visible=false;fluid.userData.noWire=true;g.add(fluid);
    for(const [list,m] of [[T.air,airwayM],[T.rings,cartM],[T.art,arteryM],[T.vein,veinM]])if(list.length)g.add(mergeParts(list,m));
    const ac=T.acini.length?mergeParts(T.acini,acinusM):null;if(ac)g.add(ac);
    // into the world: the lung's +x is straight out from the axis on its side, and the origin is the hilum
    const hx=cr+hil.x,hy=Y(dC)+hil.y;
    g.position.set(AX+Math.cos(side)*hx,hy,AZ+Math.sin(side)*hx);g.rotation.y=-side;
    g.updateMatrixWorld(true);
    const perches=T.perches.map(p=>g.localToWorld(p.clone()));
    out.push({side,left,g,fluid,acini:ac,perches,hilum:g.position.clone(),
      centre:new THREE.Vector3(AX+Math.cos(side)*cr,Y(dC),AZ+Math.sin(side)*cr),A,H:H2*2,
      base:-H2*0.62-hil.y,apex:H2*0.85-hil.y,segments:T.air.length,acinusCount:T.acini.length});
  }
  return {lungs:out,fluidU,acinusM,airwayM,arteryM,veinM};
}
