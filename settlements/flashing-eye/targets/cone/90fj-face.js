// ================================================================= THE FLASHING EYE — the band's colonnade in relief
// The band's face is a heightfield wearing the library's rock.columnar (90fe); here the columns themselves stand a little proud of it,
// so the coulee's front reads as a colonnade from the apron and the Way of Shrines: hexagonal basalt columns from the talus's head
// to the Lip, each broken into drums at its joints, some snapped off below the top, every one along the face's own lean
// (FLASHING_EYE.ground's batter) and turned with the Lip's curve. Not where the spur joins the face (the Way of Shrines), and only
// below the aprons under the Lip Range and the corner towers on the Lip. Same map and scale as the face (6 m). [web]: three.js.
reseed(34469);
{const B=FE.L.band,pos=[],uv=[],nor=[],idx=[],T=6,h=(i,k)=>KRAND.unit(KRAND.hash(34470,i,k));
 const lipAt=v=>FLASHING_EYE.lipU(FE.L,v),dTalus=(B.talusH-B.h+B.talusH*B.batter/B.talusRun)/(B.talusH/B.talusRun-B.h/B.batter);   /* where the face meets its talus (31-fe-rules: F = G; 22.5 m) */
 /* a hexagonal drum from (x0, y0, z0) to (x1, y1, z1), radius r, turned by rot; its top capped */
 const drum=(x0,y0,z0,x1,y1,z1,r,rot)=>{const b=pos.length/3;
  for(let k=0;k<6;k++){const a=rot+k*Math.PI/3,a2=rot+(k+1)*Math.PI/3,nx=Math.cos(rot+(k+.5)*Math.PI/3),nz=Math.sin(rot+(k+.5)*Math.PI/3),i0=pos.length/3,s0=k*r/T,s1=(k+1)*r/T;
   for(const [ca,s,yy,xx,zz] of[[a,s0,y0,x0,z0],[a2,s1,y0,x0,z0],[a2,s1,y1,x1,z1],[a,s0,y1,x1,z1]]){pos.push(xx+Math.cos(ca)*r,yy,zz+Math.sin(ca)*r);uv.push(s,yy/T);nor.push(nx,0,nz);}
   idx.push(i0,i0+2,i0+1,i0,i0+3,i0+2);}
  const c0=pos.length/3;pos.push(x1,y1,z1);uv.push(x1/T,z1/T);nor.push(0,1,0);
  for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;pos.push(x1+Math.cos(a)*r,y1,z1+Math.sin(a)*r);uv.push((x1+Math.cos(a)*r)/T,(z1+Math.sin(a)*r)/T);nor.push(0,1,0);}
  for(let k=0;k<6;k++)idx.push(c0,c0+1+((k+1)%6),c0+1+k);};
 let cols=0,drums=0;
 for(let i=0,v=-548;v<=548;i++,v+=2.6+.5*h(i,1)){
  if(v>-215&&v<-45)continue;   /* the spur joins the face here */
  const lu=lipAt(v),top=terrainH(v,lu-.6),capped=Math.abs(v)<=97,yTop0=capped?-36:top-.4,yFoot=terrainH(v,lu+dTalus)-2;
  if(yTop0-yFoot<25||FLASHING_EYE.spurY(FE.L,lu+12,v,yFoot)>yFoot+2)continue;
  /* the face's line: z from the Lip by the batter, outward along the Lip's normal (2Kv, 1), the column 0.5-0.9 m proud of it */
  const nl=Math.hypot(2*B.lipK*v,1),nx=2*B.lipK*v/nl,nz=1/nl,out=.5+.4*h(i,2),r=.95+.5*h(i,3),rot=h(i,4)*Math.PI;
  const at=y=>{const d=Math.max(.2,(top-y)/B.h*B.batter);return[v+nx*(d+out),lu+nz*(d+out)];};
  const yTop=yTop0-(h(i,5)<.35?2+10*h(i,6):0);let y=yFoot;
  while(y<yTop-1){const y1=Math.min(yTop,y+8+7*h(i,10+drums%17)),p0=at(y),p1=at(y1);drum(p0[0],y,p0[1],p1[0],y1-.12,p1[1],r,rot);y=y1;drums++;}
  cols++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const map=MAT.feColumnar&&MAT.feColumnar.map;
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:map||null,color:0xe8e4e0,roughness:.95,metalness:0}));
 m.name='the band: its colonnade';m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel='The band: columns of the coulee\'s basalt';scene.add(m);
 window._feColonnade={columns:cols,drums,tris:idx.length/3};}
