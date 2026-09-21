// Minas Tirith: the three things on the top of the rock that the whole city is arranged around. Fan work -
// every shape is this project's own low-poly geometry, modelled from the description, and no assets from any
// book, film or game are used. Tolkien's world belongs to the Tolkien Estate.
//
// None of this appears in any other city, so it travels with this page rather than living in the shared
// engine, and src/minastirith/main.js hands it to build() as ctx.models.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  keel(L,x,z){
    // ---- the rock the city is built round ----
    // "A tall bastion of rock, whose sheer front looks east": a shoulder of Mindolluin that comes out
    // through the middle of the city, level with the Citadel the whole way, and stops dead in mid-air over
    // the lower circles with its point overhanging. The seven circles are horseshoes because of it.
    //
    // Every picture of the place agrees on the one thing that matters and that a heightfield cannot do: it
    // is a BLADE. One unbroken sheer face on each side, smooth, fluted vertically, coming to a point - not
    // a ridge, and not a row of crags, which is what the first two versions of this were and why they read
    // as rubble tipped through the middle of the city. So the faces are one continuous mesh built to the
    // same half-width function the terrain uses (keel_half in tools/make-minastirith.py), the striations
    // are thin flutes laid on it, and the prow leans out over its own foot.
    const A=L.turn||0, TOP=L.top||286, W=L.width||80, EAST=L.east||450, WEST=L.west||-1100;
    const parts=[], KR=mkRng(1447);
    const rock=new THREE.MeshLambertMaterial({color:0x7c7972,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x5f5d58,flatShading:true});
    const pale=new THREE.MeshLambertMaterial({color:0x928d84,flatShading:true});
    const stone=new THREE.MeshLambertMaterial({color:0xe6e0cd,flatShading:true});
    const shadow=new THREE.MeshLambertMaterial({color:0x3f3d39});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // half the width of the blade, its foot, and its crest, along the run
    const HW=u=>{const t=Math.max(0,Math.min(1,(u-120)/(EAST-120)));
      let h=W/2*(1-0.62*t*t);
      if(u<-520)h+=Math.min(60,(-520-u)*0.09);
      return h;};
    const FOOT=u=>26+150*(1-Math.max(0,Math.min(1,(u-WEST)/(EAST-WEST))));
    const CREST=u=>TOP+3*Math.sin(u*0.0062)+2*Math.sin(u*0.017);
    // the overhang: over the last hundred metres the top edge stands out past the foot, so the point of the
    // rock hangs over the circles under it instead of sitting on a slope
    const OVER=u=>{const t=Math.max(0,Math.min(1,(u-(EAST-120))/120));return 74*t*t;};

    // ---- the faces, as one mesh ----
    {
      const N=120,P=[],NR=[],IDX=[];
      const push=(p,n)=>{P.push(p[0],p[1],p[2]);NR.push(n[0],n[1],n[2]);return P.length/3-1;};
      const cols=[];                                   // [sd][i] = {foot, crest} vertex indices
      for(const sd of [-1,1]){
        const c=[];
        for(let i=0;i<=N;i++){
          const u=WEST+(EAST-WEST)*(i/N), w=HW(u), f=FOOT(u), cr=CREST(u);
          const nx=Math.sin(A)*0, nz=0;                 // the face normal, turned with the rock
          const n=[Math.sin(A)*sd,0.06,Math.cos(A)*sd];
          const nl=Math.hypot(n[0],n[1],n[2]);n[0]/=nl;n[1]/=nl;n[2]/=nl;
          c.push({f:push(at(u,sd*w,f-40),n),c:push(at(u+OVER(u),sd*w,cr),n)});
        }
        cols.push(c);
      }
      for(let q=0;q<2;q++){const c=cols[q],flip=q===0;
        for(let i=0;i<N;i++){
          const a=c[i],b=c[i+1];
          if(flip)IDX.push(a.f,b.f,b.c, a.f,b.c,a.c);
          else    IDX.push(a.f,b.c,b.f, a.f,a.c,b.c);
        }}
      // the top of it: bare rock east of the Citadel, and the court's own pavement west of that
      for(let i=0;i<N;i++){
        const l0=cols[0][i].c,l1=cols[0][i+1].c,r0=cols[1][i].c,r1=cols[1][i+1].c;
        IDX.push(l0,r0,r1, l0,r1,l1);
      }
      // the end cap under the point
      {const a=cols[0][N],b=cols[1][N];IDX.push(a.f,b.f,b.c, a.f,b.c,a.c);}
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
      g.setAttribute('normal',new THREE.Float32BufferAttribute(NR,3));
      g.setIndex(IDX);
      const face=new THREE.Mesh(g,rock);face.castShadow=true;face.receiveShadow=true;
      face.userData.wireCat='landmark';parts.push(face);
    }

    // ---- the striations ----
    // Thin flutes down the face, which is what a cliff of this stuff actually looks like and what tells the
    // eye its scale. Narrow and tall: anything chunky here turns back into rubble.
    for(let k=0;k<340;k++){
      const u=WEST+(EAST-WEST)*Math.pow(KR(),0.7), w=HW(u), f=FOOT(u), cr=CREST(u);
      if(cr-f<24)continue;
      const sd=KR()<0.5?-1:1;
      const y0=f+KR()*(cr-f)*0.35, hh=(cr-y0)*(0.45+KR()*0.55);
      const bw=3+KR()*13, bd=1.6+KR()*3.4;
      const m=new THREE.Mesh(new THREE.BoxGeometry(bw,hh,bd).translate(0,hh/2,0),
        KR()<0.34?dark:(KR()<0.6?pale:rock));
      const [px,py,pz]=at(u+OVER(u)*((y0-f)/Math.max(1,cr-f)),sd*(w+bd*0.4),y0);
      m.position.set(px,py,pz);m.rotation.set(0,-A+(KR()-0.5)*0.05,(KR()-0.5)*0.03);parts.push(m);
    }
    // a handful of bigger fracture slabs, and the scree at the foot
    for(let k=0;k<26;k++){
      const u=WEST+(EAST-WEST)*KR(), w=HW(u), f=FOOT(u), cr=CREST(u);
      if(cr-f<50)continue;
      const sd=KR()<0.5?-1:1, hh=(cr-f)*(0.3+KR()*0.4);
      const m=new THREE.Mesh(new THREE.BoxGeometry(18+KR()*40,hh,5+KR()*7).translate(0,hh/2,0),dark);
      const [px,py,pz]=at(u,sd*(w+3),f+KR()*(cr-f)*0.3);
      m.position.set(px,py,pz);m.rotation.set(0,-A+(KR()-0.5)*0.12,sd*(0.03+KR()*0.05));parts.push(m);
    }
    for(let k=0;k<180;k++){
      const u=WEST+(EAST-WEST)*KR(), w=HW(u), f=FOOT(u);
      const sd=KR()<0.5?-1:1, sz=2+KR()*7;
      const m=new THREE.Mesh(new THREE.BoxGeometry(sz*1.6,sz,sz*1.3),KR()<0.5?dark:rock);
      const [px,py,pz]=at(u+(KR()-0.5)*20,sd*(w+2+KR()*9),f+KR()*14);
      m.position.set(px,py,pz);m.rotation.set(KR(),KR()*3,KR());parts.push(m);
    }

    // ---- the prow ----
    // Under the point, where the rock hangs over the circles: the underside of the overhang, and the
    // parapet on top of it that everyone who has ever described this city has stood on.
    {
      const cr=CREST(EAST), w=HW(EAST);
      const lip=new THREE.Mesh(new THREE.BoxGeometry(56,10,w*2.1),dark);
      const [lx,ly,lz]=at(EAST+OVER(EAST)-20,0,cr-13);
      lip.position.set(lx,ly,lz);lip.rotation.set(0,-A,0.05);parts.push(lip);
      const walk=new THREE.Mesh(new THREE.BoxGeometry(60,3,w*1.9),stone);
      const [wx,wy,wz]=at(EAST+OVER(EAST)-26,0,cr);walk.position.set(wx,wy,wz);walk.rotation.y=-A;parts.push(walk);
      for(let k=0;k<15;k++){
        const th=k/14*Math.PI-Math.PI/2;
        const [mx,my,mz]=at(EAST+OVER(EAST)-26+Math.sin(th)*30,Math.cos(th)*w*0.92,cr+1.5);
        parts.push(box(mx,my,mz,4.5,6,4.5,stone));
      }
    }

    // ---- the tunnels ----
    // Where the Way crosses, at the level of the tier it belongs to and out at the face of the rock.
    for(const [u,tier] of (L.tunnels||[])){
      const y=(L.base||76)+tier*(L.lift||30), tw=HW(u);
      for(const sd of [-1,1]){
        const [px,py,pz]=at(u,sd*(tw+2),y);
        const mouth=new THREE.Mesh(new THREE.CylinderGeometry(9,9,16,10,1,true).rotateZ(Math.PI/2),shadow);
        mouth.position.set(px,py+9,pz);mouth.rotation.y=-A+Math.PI/2;parts.push(mouth);
        const arch=new THREE.Mesh(new THREE.BoxGeometry(6,26,26),stone);
        arch.position.set(px,py+13,pz);arch.rotation.y=-A+Math.PI/2;parts.push(arch);
      }
    }

    // ---- the wall along the top ----
    // The Citadel's own wall runs out along the crest of the rock to the prow, which is what makes the
    // seventh circle a horseshoe rather than a ring.
    for(let i=0;i<30;i++){
      const u=EAST-40-i*18;
      if(Math.hypot(...at(u,0,0).filter((_,q)=>q!==1))<150)continue;
      const w=HW(u), cr=CREST(u);
      for(const sd of [-1,1]){
        const [px,py,pz]=at(u,sd*(w-3),cr);
        const b=box(px,py,pz,19,13,7,stone);b.rotation.y=-A;parts.push(b);
        if(i%5===0){const t2=box(px,py,pz,12,20,12,stone);t2.rotation.y=-A;parts.push(t2);}
      }
    }

    const byMat=new Map();
    for(const m of parts){if(m.isBufferGeometry)continue;let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  whitetower(L,x,z){
    // ---- the Tower of Ecthelion ----
    // Fifty fathoms of white stone on the Citadel, and the Citadel is seven hundred feet over the Pelennor,
    // so the standard at the top of it stands a thousand feet above the fields. What makes it read at any
    // distance is not the height - the city is a kilometre across and the tower is a hundred metres - but
    // that it is ten times as tall as it is wide, whiter than anything else on the hill, and that it does
    // not stop flat: it corbels out over the shaft, steps back twice and goes to a point.
    const H=L.height||118,base=L.base!==undefined?L.base:gh(x,z),parts=[];
    const W=L.width||H*0.1;                             // half the width of the shaft at its foot
    const white=new THREE.MeshLambertMaterial({color:0xf6f2e6});
    const shade=new THREE.MeshLambertMaterial({color:0xdfd9c7});
    const lead=new THREE.MeshLambertMaterial({color:0x6c7278});
    const dark=new THREE.MeshLambertMaterial({color:0x1b1a1f});
    const oct=(w,h,mat)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,8,1).rotateY(Math.PI/8).translate(0,0.5,0),mat);
      m.scale.set(w/0.9239,h,w/0.9239);return m;};

    // the court it stands on, and the plinth
    const court=oct(W*3.4,H*0.03,shade);court.position.set(x,base,z);parts.push(court);
    const plinth=oct(W*2.5,H*0.055,shade);plinth.position.set(x,base+H*0.03,z);parts.push(plinth);

    // the shaft: an octagon tapering a fifth over its height, in courses
    const FOOT=base+H*0.085, SH=H*0.78, SEG=11;
    for(let k=0;k<SEG;k++){
      const t0=k/SEG,t1=(k+1)/SEG;
      const w=W*2*(1-0.2*t0);
      const seg=oct(w,SH*(t1-t0)*1.02,k%4===3?shade:white);
      seg.position.set(x,FOOT+SH*t0,z);parts.push(seg);
    }
    // the flutes up each face, and the slit windows, which are the only openings in the whole thing
    for(let k=0;k<8;k++){
      const a=k/8*Math.PI*2+Math.PI/8;
      const b=new THREE.Mesh(new THREE.BoxGeometry(W*0.22,SH*0.97,W*0.3).translate(0,SH*0.485,0),white);
      b.position.set(x+Math.cos(a)*W*0.92,FOOT,z+Math.sin(a)*W*0.92);b.rotation.y=-a;parts.push(b);
      for(let w2=0;w2<7;w2++){
        const win=new THREE.Mesh(new THREE.BoxGeometry(W*0.1,SH*0.045,W*0.05),dark);
        win.position.set(x+Math.cos(a)*W*1.06,FOOT+SH*(0.1+w2*0.12),z+Math.sin(a)*W*1.06);
        win.rotation.y=-a;parts.push(win);
      }
    }

    // the crown: out over the shaft, back in twice, and a point on top
    const CW=FOOT+SH;
    {const c1=oct(W*2.6,H*0.03,shade);c1.position.set(x,CW,z);parts.push(c1);
     const c2=oct(W*2.9,H*0.025,white);c2.position.set(x,CW+H*0.03,z);parts.push(c2);
     const c3=oct(W*2.1,H*0.045,white);c3.position.set(x,CW+H*0.055,z);parts.push(c3);
     const c4=oct(W*1.5,H*0.03,shade);c4.position.set(x,CW+H*0.1,z);parts.push(c4);}
    for(let k=0;k<8;k++){
      const a=k/8*Math.PI*2+Math.PI/8;
      const p=new THREE.Mesh(new THREE.ConeGeometry(W*0.2,H*0.11,6),white);
      p.position.set(x+Math.cos(a)*W*1.3,CW+H*0.09,z+Math.sin(a)*W*1.3);parts.push(p);
    }
    const spike=new THREE.Mesh(new THREE.ConeGeometry(W*0.72,H*0.17,8).translate(0,H*0.085,0),lead);
    spike.position.set(x,CW+H*0.13,z);spike.rotation.y=Math.PI/8;parts.push(spike);
    const staff=box(x,CW+H*0.3,z,W*0.07,H*0.16,W*0.07,lead);parts.push(staff);

    // the banner: black, because Denethor is Steward and there is no king to fly a white tree
    const flagM=new THREE.MeshLambertMaterial({color:0x14131a,side:THREE.DoubleSide});
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(H*0.09,H*0.05,6,1),flagM);
    flag.position.set(x+H*0.045,CW+H*0.38,z);scene.add(flag);
    const pos=flag.geometry.attributes.position,base0=pos.array.slice();

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    const g=group(L,merged);
    animHooks.push(now=>{
      const t=now*0.0016;
      for(let i=0;i<pos.count;i++){const px=base0[i*3];
        pos.array[i*3+2]=base0[i*3+2]+Math.sin(t+px*0.55)*Math.max(0,px+H*0.05)*0.16;}
      pos.needsUpdate=true;
    });
    return g;},

  whitetree(L,x,z){   // the Court of the Fountain: the sward, the fountain, and the dead tree standing in it
    const base=L.base!==undefined?L.base:gh(x,z),parts=[],TR=mkRng(2931);
    const white=new THREE.MeshLambertMaterial({color:0xe6e0ce});
    const bone=new THREE.MeshLambertMaterial({color:0xd9d3c4});
    const sward=new THREE.MeshLambertMaterial({color:0x5f7a46});
    const waterM=new THREE.MeshPhongMaterial({color:0xaecad8,specular:0xffffff,shininess:90,transparent:true,opacity:0.8});
    // the court itself, walled round, and the pavement of it
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(72,72,1.2,40),white);
    floor.position.set(x,base,z);parts.push(floor);
    const grass=new THREE.Mesh(new THREE.CylinderGeometry(52,52,0.6,36),sward);
    grass.position.set(x,base+1.1,z);parts.push(grass);
    for(let k=0;k<36;k++){const a=k/36*Math.PI*2;
      parts.push(box(x+Math.cos(a)*71,base+1,z+Math.sin(a)*71,3,2.6,3,white));}
    // the fountain: a basin, a jet, and the spray coming off it
    const basin=new THREE.Mesh(new THREE.CylinderGeometry(9,9.6,2.4,20),white);
    basin.position.set(x,base+1.4,z);parts.push(basin);
    const water=new THREE.Mesh(new THREE.CylinderGeometry(8.4,8.4,0.5,20),waterM);
    water.position.set(x,base+3.3,z);parts.push(water);
    const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.9,7,8),waterM);
    jet.position.set(x,base+6.6,z);scene.add(jet);
    // the tree: dead, white, and left standing
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,2.1,16,7).translate(0,8,0),bone);
    trunk.position.set(x+13,base+2,z+2);parts.push(trunk);
    const limbs=[],tips=[];
    const grow=(px,py,pz,ax,ay,az,len,rad,depth)=>{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(rad*0.45,rad,len,6).translate(0,len/2,0),bone);
      m.position.set(px,py,pz);m.rotation.set(ax,ay,az);limbs.push(m);
      if(depth<=0){tips.push([px+Math.sin(az)*len*0.9,py+Math.cos(az)*Math.cos(ax)*len*0.92,pz-Math.sin(ax)*len*0.9]);return;}
      const ex=px+Math.sin(az)*len*0.9,ey=py+Math.cos(az)*Math.cos(ax)*len*0.92,ez=pz-Math.sin(ax)*len*0.9;
      for(let k=0;k<2;k++)grow(ex,ey,ez,ax+(TR()-0.5)*0.9,ay+(TR()-0.5)*1.4,az+(TR()-0.5)*1.0,
        len*(0.62+TR()*0.16),rad*0.6,depth-1);
    };
    for(let k=0;k<4;k++)grow(x+13,base+17,z+2,(TR()-0.5)*0.5,TR()*6.28,(TR()-0.5)*0.7,9,1.1,3);
    parts.push(...limbs);
    // ---- and what it does when the war is over ----
    // The tree is dead and left standing because nobody will cut it down; it comes into flower when the
    // King comes back. The page's peace mode is as close to that as this model gets, so the blossom is
    // built here and hidden, and src/minastirith/war.js turns it on. Leaves under it, because a tree in
    // flower with bare wood under the blossom reads as snow on a dead tree.
    {
      const blossomM=new THREE.MeshLambertMaterial({color:0xfdf6ee,emissive:0x2a2426,flatShading:true});
      const leafM=new THREE.MeshLambertMaterial({color:0x6f8f52,flatShading:true});
      const bl=[];
      for(const [tx,ty,tz] of tips){
        for(let k=0;k<7;k++){
          const r=0.55+TR()*0.8;
          const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),TR()<0.72?blossomM:leafM);
          m.position.set(tx+(TR()-0.5)*4.5,ty+(TR()-0.5)*4.2,tz+(TR()-0.5)*4.5);
          m.rotation.set(TR()*3,TR()*3,TR()*3);bl.push(m);
        }
      }
      const byB=new Map();
      for(const m of bl){let a=byB.get(m.material);if(!a){a=[];byB.set(m.material,a);}a.push(m);}
      const P2=ctx.peaceParts=ctx.peaceParts||[];
      for(const [mat,list] of byB){const g2=mergeParts(list,mat);g2.visible=false;scene.add(g2);P2.push(g2);}
    }
    // the guard of the Citadel, one at each end of the court
    const mail=new THREE.MeshLambertMaterial({color:0x2a2c33});
    for(const s of [-1,1])for(const q of [-1,1]){
      parts.push(box(x+q*40,base+1.7,z+s*40,1,1.9,0.7,mail));
      parts.push(box(x+q*40+0.5,base+2.6,z+s*40,0.16,3.4,0.16,mail));}
    const g=group(L,parts);
    animHooks.push(now=>{const t=now*0.002;jet.scale.y=0.92+0.12*Math.sin(t);jet.position.y=base+6.6+0.4*Math.sin(t);});
    return g;},

  greatgate(L,x,z){   // the gate in the first wall: black stone, and the steel doors standing open
    const H=L.height||34,a=L.turn||0,g0=gh(x,z),parts=[];
    const black=new THREE.MeshLambertMaterial({color:0x3c3b3f});
    const steel=new THREE.MeshPhongMaterial({color:0x585f66,specular:0xaab0b8,shininess:40,flatShading:true});
    const ux=Math.cos(a),uz=Math.sin(a);           // out through the gate
    const vx=-uz,vz=ux;                            // along the wall
    // the two towers either side of the opening, and the arch over it
    for(const s of [-1,1]){
      const tx=x+vx*s*17,tz=z+vz*s*17;
      const t=box(tx,g0-6,tz,22,H+14,20,black);t.rotation.y=-a;parts.push(t);
      const cap=box(tx,g0+H+8,tz,26,4,24,black);cap.rotation.y=-a;parts.push(cap);
      for(let k=0;k<5;k++){const m=box(tx+vx*s*(k-2)*4.6,g0+H+12,tz+vz*s*(k-2)*4.6,3,4,3,black);
        m.rotation.y=-a;parts.push(m);}
    }
    const lintel=box(x,g0+H-6,z,14,10,20,black);lintel.rotation.y=-a;parts.push(lintel);
    // the doors, thrown back against the wall inside
    for(const s of [-1,1]){
      const dx=x-ux*7+vx*s*8.5,dz=z-uz*7+vz*s*8.5;
      const d=new THREE.Mesh(new THREE.BoxGeometry(1.6,H-8,15).translate(0,(H-8)/2,0),steel);
      d.position.set(dx,g0,dz);d.rotation.y=-a+s*0.5;parts.push(d);
    }
    return group(L,parts);},

  };
}
