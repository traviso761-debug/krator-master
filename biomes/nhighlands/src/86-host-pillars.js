// ================================================================= HOST — the crag pillars
// A few free-standing rock pillars below the crag steps, the reference's pines-
// on-a-pillar: grey granite stacked in irregular, ledged drums, rust-stained,
// flat-topped. Host geometry like the tower: they are handed to NHL.dress(...,
// {kind:'crag'}) so the biome grows its crag pines, heath and lichen on them.
// Host-only. No plant is placed in this file.
const PILLARS=[];
function buildPillars(){const geos=[],rock=[],pal=[0x8a8c86,0x7a7c76,0x9a9a92,0x6e706a];reseed(86031);
 // the spots: just under each scarp's foot, away from the stream, where the step is tall
 for(const Sc of SCARPS){for(let t=-1500;t<=1500;t+=270){const k=scarpAt(Sc,Sc.s0,t);if(k.a<Sc.amp*.7)continue;if(Math.abs(t-tStream(k.sc))<190)continue;if(rng()<.45)continue;
  const s=k.sc-rr(35,70),p=xzOf(s,t+rr(-60,60));if(Math.abs(p[0])>3000||Math.abs(p[1])>3000)continue;if(PILLARS.some(q=>Math.hypot(q.x-p[0],q.z-p[1])<220))continue;
  PILLARS.push({x:p[0],z:p[1],H:rr(28,62),R:rr(7,13)});if(PILLARS.length>=6)break;}}
 PILLARS.forEach((P,pi)=>{let y0=1e9;for(let a=0;a<TAU;a+=.5)y0=Math.min(y0,terrainH(P.x+Math.cos(a)*P.R,P.z+Math.sin(a)*P.R));y0-=2;P.y0=y0;
  const ns=9,drums=Math.round(P.H/7),pos=[],col=[],c=new THREE.Color();let y=y0,rc=P.R;const rad=[];for(let k=0;k<ns;k++)rad.push(rr(.75,1.15));
  const ring=(yy,r,ph)=>{const o=[];for(let k=0;k<=ns;k++){const a=k/ns*TAU+ph,rk=rad[k%ns]*(1+.12*Math.sin(a*3+yy*.07));o.push([P.x+Math.cos(a)*r*rk,yy,P.z+Math.sin(a)*r*rk]);}return o;};
  const quad=(a,b,cc,d,col0)=>{[a,b,cc,a,cc,d].forEach(q=>{pos.push(q[0],q[1],q[2]);});for(let i=0;i<6;i++)col.push(col0.r,col0.g,col0.b);};
  for(let dI=0;dI<drums;dI++){const h=P.H/drums*rr(.8,1.2),r0=rc,r1=r0*rr(.96,1),ph=0,ledge=r1*rr(.9,.96);rc=Math.min(r1*.995,ledge*rr(1.02,1.08));   // each drum within the one below: no overhang shows its hollow underside
   const A=ring(y,r0,ph),Bq=ring(y+h,r1,ph),L=ring(y+h,ledge,ph);
   c.set(pick(pal)).lerp(new THREE.Color(0x8a5a3a),rr(0,.25));c.convertSRGBToLinear();
   for(let k=0;k<ns;k++){quad(A[k],Bq[k],Bq[k+1],A[k+1],c);quad(Bq[k],L[k],L[k+1],Bq[k+1],c);}
   y+=h;if(dI<drums-1)for(let k=0;k<=ns;k++)rad[k%ns]*=rr(.97,1.03);}
  // the flat top
  const top=ring(y,rc,0);c.set(0x6a6c64).convertSRGBToLinear();for(let k=0;k<ns;k++){[top[k],[P.x,y+.4,P.z],top[k+1]].forEach(q=>pos.push(q[0],q[1],q[2]));for(let i=0;i<3;i++)col.push(c.r,c.g,c.b);}
  P.top=y;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const uvs=[];for(let i=0;i<pos.length;i+=3)uvs.push((pos[i]+pos[i+2])/7,pos[i+1]/7);g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  geos.push(g);
  OBSTACLES.push({x:P.x,z:P.z,r:P.R*1.2+2,y0:y0-5,y1:y+30});
  REGISTER({name:'Crag pillar '+(pi+1),kind:'rock',x:P.x,z:P.z,y:y0,r:P.R*1.2,h:y-y0+20});});
 if(geos.length){const tex=NHL.ROCKTEX,m=new THREE.MeshLambertMaterial({map:tex,vertexColors:true});
  geos.forEach(g=>{const mm=new THREE.Mesh(g,m);mm.userData.inspectLabel='Crag pillar (granite)';mm.userData.host=true;scene.add(mm);});}
 return geos;}
