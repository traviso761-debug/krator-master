// The starship hull primitives, checked for the one thing that is invisible in a silhouette and ruins
// everything else: which way the faces point.
//
// An inside-out closed hull has exactly the same outline as a solid one. Back-face culling throws away the
// near wall instead of the far one, so you see through the ship - and that is how every saucer, engineering
// hull and nacelle on these pages shipped for two months without anybody noticing from the shape alone.
// The check is blunt: build the thing, and for every triangle take the face normal against the vector from
// the body's centroid out to that face. On a convex-ish solid all of them should agree.
//
// `tube` and `sweep` build their own index buffers, so this tests the real code. `lathe` hands the work to
// three.js, so what is tested there is our end of the contract: that the profile arrives in ascending y,
// which is the order three.js winds outward from.
import {tube,sweep,lathe,discHull,SECT,flipV} from '../src/starship/parts.js';
import {eq,ok} from './assert.js';

// just enough of three.js for the primitives to build against
const lathePoints=[];
const THREE={
  BufferGeometry:class{constructor(){this.attributes={};this.index=null;}
    setAttribute(n,a){this.attributes[n]=a;}
    setIndex(a){this.index=a;}
    computeVertexNormals(){}computeBoundingSphere(){}},
  Float32BufferAttribute:class{constructor(a,i){this.array=a;this.itemSize=i;this.count=a.length/i;}},
  Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set(){}};
    this.rotation={};this.scale={set(){}};}},
  Vector2:class{constructor(x,y){this.x=x;this.y=y;}},
  LatheGeometry:class{constructor(pts,seg){lathePoints.push(pts);this.attributes={};this.index=[];
    this.computeVertexNormals=()=>{};}},
};

const facing=mesh=>{
  const P=mesh.geometry.attributes.position.array, I=mesh.geometry.index;
  const n=P.length/3;
  const c=[0,0,0];
  for(let i=0;i<n;i++)for(let k=0;k<3;k++)c[k]+=P[i*3+k]/n;
  let out=0,inn=0;
  for(let t=0;t<I.length;t+=3){
    const p=[0,1,2].map(j=>[0,1,2].map(k=>P[I[t+j]*3+k]));
    const e1=[0,1,2].map(k=>p[1][k]-p[0][k]), e2=[0,1,2].map(k=>p[2][k]-p[0][k]);
    const N=[e1[1]*e2[2]-e1[2]*e2[1], e1[2]*e2[0]-e1[0]*e2[2], e1[0]*e2[1]-e1[1]*e2[0]];
    const fc=[0,1,2].map(k=>(p[0][k]+p[1][k]+p[2][k])/3);
    const d=N[0]*(fc[0]-c[0])+N[1]*(fc[1]-c[1])+N[2]*(fc[2]-c[2]);
    if(d>0)out++;else if(d<0)inn++;
  }
  return {out,inn};
};

const SAUCER=[{x:234,rz:3,ry:2.4,ryb:2.2},{x:0,rz:232,ry:31,ryb:26},{x:-197,rz:132,ry:23,ryb:18}];

export const tests={
  'a hull whose stations run bow to stern faces outward'(){
    const f=facing(tube(THREE,SAUCER,16,null,true,true,SECT.ring(16)));
    ok(f.out>0,'no faces at all');
    eq(f.inn,0,`${f.inn} of ${f.out+f.inn} faces point into the hull`);
  },
  'and so does one whose stations run stern to bow'(){
    const f=facing(tube(THREE,SAUCER.slice().reverse(),16,null,true,true,SECT.ring(16)));
    eq(f.inn,0,`${f.inn} of ${f.out+f.inn} faces point into the hull`);
  },
  'the end caps agree with the skin'(){
    // the bug was that they did not: the skin was wound for one ordering and the caps for the other, so
    // neither direction gave a solid. Capped and uncapped must both be all-outward.
    for(const caps of [true,false]){
      const f=facing(tube(THREE,SAUCER,16,null,caps,caps,SECT.ring(16)));
      eq(f.inn,0,`caps=${caps}: ${f.inn} faces inward`);
    }
  },
  'every named section profile winds the same way round'(){
    // the sections are interchangeable only if they all have the same handedness; a clockwise one would
    // turn whichever hull used it inside out on its own
    const all={...SECT, 'ring()':SECT.ring(20), 'lens()':SECT.lens(12), 'slabS()':SECT.slabS(9)};
    for(const [name,sec] of Object.entries(all)){
      if(typeof sec==='function')continue;
      let a=0;
      for(let i=0;i<sec.length;i++){
        const p=sec[i],q=sec[(i+1)%sec.length];
        a+=p[0]*q[1]-q[0]*p[1];
      }
      ok(a>0,`SECT.${name} is wound clockwise (signed area ${a.toFixed(3)})`);
    }
  },
  'flipV keeps the handedness it was given'(){
    const f=flipV(SECT.aerofoil);
    let a=0;
    for(let i=0;i<f.length;i++){const p=f[i],q=f[(i+1)%f.length];a+=p[0]*q[1]-q[0]*p[1];}
    ok(a>0,`flipV produced a clockwise section (signed area ${a.toFixed(3)})`);
  },
  'a swept pylon faces outward, caps included'(){
    const path=[];
    for(let i=0;i<=6;i++)path.push({p:[0,0,i*20],dir:[0,0,1],ry:10,rz:10});
    const f=facing(sweep(THREE,path,16,null,SECT.ring(16)));
    ok(f.out>0,'no faces at all');
    eq(f.inn,0,`${f.inn} of ${f.out+f.inn} faces point into the pylon`);
  },
  'a primary hull is a figure of revolution, not a stretched one'(){
    // the bug this primitive exists to kill: built as stations with a fixed section, the old saucer stood
    // 14 m tall measured forward and 25 m tall measured abeam at the same radius, and had a flat plateau
    // across the middle. Sample the built mesh and check the hull is the same depth in both directions.
    const TOP=[[0,30],[114,27],[194,18.6],[232,8.5]], BOT=[[0,-26],[135,-24.2],[211,-14.8],[232,-8.5]];
    const d=discHull(THREE,null,{R:232,cut:-197,top:TOP,bot:BOT,seg:64,rings:16});
    const P=d.mesh.geometry.attributes.position.array;
    const hi=(wantX,wantZ)=>{        // the tallest vertex near a point on the hull
      let best=-1e9;
      for(let i=0;i<P.length;i+=3){
        if(Math.hypot(P[i]-wantX,P[i+2]-wantZ)<14)best=Math.max(best,P[i+1]);
      }
      return best;
    };
    for(const r of [80,120,160,200]){
      const fwd=hi(r,0), abeam=hi(0,r);
      ok(Math.abs(fwd-abeam)<0.6,`at r=${r} the hull is ${fwd.toFixed(1)} m forward and ${abeam.toFixed(1)} m abeam`);
    }
    // and no plateau: the dome must still be falling away 70 m off the centreline
    ok(hi(0,0)-hi(0,70)>1.2,'the saucer top is flat across the middle');
  },
  'a primary hull faces outward, rim included'(){
    const TOP=[[0,30],[114,27],[194,18.6],[232,8.5]], BOT=[[0,-26],[135,-24.2],[211,-14.8],[232,-8.5]];
    const f=facing(discHull(THREE,null,{R:232,cut:-197,top:TOP,bot:BOT,seg:48,rings:10}).mesh);
    ok(f.out>0,'no faces at all');
    eq(f.inn,0,`${f.inn} of ${f.out+f.inn} faces point into the hull`);
  },
  'a lathe profile reaches three.js ascending, however it was written'(){
    const dome=[[0.001,50],[10,49],[17,46.8],[21,42.6],[22,37],[22,32],[0.001,31.4]];
    for(const prof of [dome,dome.slice().reverse()]){
      lathePoints.length=0;
      lathe(THREE,prof,12,null);
      const pts=lathePoints[0];
      ok(pts[pts.length-1].y>pts[0].y,
         `profile handed to three.js runs downward (${pts[0].y} -> ${pts[pts.length-1].y})`);
    }
  },
};
