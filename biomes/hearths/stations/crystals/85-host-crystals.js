// ================================================================= HOST — the crystals: KSPELEO's records, instanced
// Draws CAVE.beams and CAVE.floor (48: KSPELEO's records) and decides nothing: each record is placed where KSPELEO put it.
//   THE SELENITE   every beam and every block's part is one instance of a six-sided prism, flattened as selenite's blades are, with a chisel tip:
//                  one InstancedMesh (one draw). A beam's foot is set into the floor it rose from; its length is KSPELEO's (it ends at the rock).
//   THE BLADES     every druse point is one instance of a thin bladed point (the floor's "shark teeth", the roof's hanging blades): one draw.
//   THE LIGHT IN THEM (no refraction): a cheap fake scattering in the shader (KHOOK layer 'selenite'): a glow that grows with the path through the
//                  crystal (the grazing view), lit by the visitor's lamp by distance, by the vents' daylight and the wells' glow per instance (aGlow,
//                  from where the instance stands), over a faint ambient; the beams are drawn translucent. ?mood=gold for the golden light.
const GOLD=Q.get('mood')==='gold';
const CRY_U={uLamp:{value:LAMP?1:0},uAmb:{value:.05},uVent:{value:.9},uTint:{value:new THREE.Color(GOLD?0xffc860:0xd8eadc).convertSRGBToLinear()}};
function crystalHook(mat,key,k){KHOOK.add(mat,'selenite',{uniforms:()=>Object.assign({uK:{value:k}},CRY_U),
 vertex:{head:'attribute float aGlow;varying float vGlow;\n',at:[{at:'begin_vertex',after:'vGlow=aGlow;'}]},
 fragment:{head:'uniform float uLamp;uniform float uAmb;uniform float uVent;uniform vec3 uTint;uniform float uK;varying float vGlow;\n',
  at:[{at:'emissivemap_fragment',after:'{vec3 nV=normalize(normal);vec3 vV=normalize(vViewPosition);float th=1.0-abs(dot(nV,vV));float dist=length(vViewPosition);'+
   'float lamp=uLamp*exp(-dist/26.0);float sss=(uAmb+1.4*lamp+vGlow*uVent)*(0.3+0.7*th*th)+0.8*lamp*pow(th,5.0);totalEmissiveRadiance+=uTint*sss*uK;}'}]}},{key});}
const SEL_TEX=(function(){const e=KMAT.mode==='lib'&&KMAT.packed&&KMAT.packed('hearths','crystal.selenite');return e?KMAT.textures(e,{aniso:4}).map:null;})();
const CRYSTALS=(function(){const t0=performance.now();
 // ---- the unit pieces: a flattened hexagonal prism with a chisel tip (y 0..1), and a thin bladed point (y 0..1)
 /* a closed piece from triangles, each wound to face out from the axis point (0, mid, 0): a closed convex piece needs no other rule, and a
    triangle wound inward would be culled (the tips went missing so, 2026-11-09) */
 function piece(mid){const P=[],U=[];
  const tri=(a,b,c,ua,ub,uc)=>{const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];
   const ox=(a[0]+b[0]+c[0])/3,oy=(a[1]+b[1]+c[1])/3-mid,oz=(a[2]+b[2]+c[2])/3;
   if(nx*ox+ny*oy+nz*oz<0){P.push(...a,...c,...b);U.push(...ua,...uc,...ub);}else{P.push(...a,...b,...c);U.push(...ua,...ub,...uc);}};
  const geo=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();return g;};
  return {tri,geo};}
 /* the prism: six sides to a shoulder at 0.86, then a chisel tip on a short ridge along x: the shoulder's corners on +x close to the ridge's +x
    end, those on -x to its -x end, and where a side's corners part, two triangles bridge to the ridge (the tip is closed all round) */
 function prism(){const n=6,fl=.62,K=piece(.5);const ring=y=>{const r=[];for(let i=0;i<n;i++){const a=i/n*TAU;r.push([.5*Math.cos(a),y,.5*fl*Math.sin(a)]);}return r;};
  const b=ring(0),m=ring(.86),tA=[-.18,1,0],tB=[.18,1,0],T=i=>m[i][0]>=0?tB:tA;
  for(let i=0;i<n;i++){const j=(i+1)%n,u0=i/n,u1=(i+1)/n,um=(u0+u1)/2;
   K.tri(b[i],m[i],b[j],[u0,0],[u0,3.4],[u1,0]);K.tri(b[j],m[i],m[j],[u1,0],[u0,3.4],[u1,3.4]);K.tri(b[j],[0,0,0],b[i],[u1,0],[um,0],[u0,0]);
   K.tri(m[i],T(i),m[j],[u0,3.4],[um,4],[u1,3.4]);if(T(i)!==T(j))K.tri(m[j],T(i),T(j),[u1,3.4],[um,4],[u1,4]);}
  return K.geo();}
 function blade(){const w=.5,dp=.11,P=[[-w,0,0],[0,0,dp],[w,0,0],[0,0,-dp]],A=[0,1,0],K=piece(.45);
  [[0,1],[1,2],[2,3],[3,0]].forEach(([i,j])=>K.tri(P[i],P[j],A,[i/4,0],[j/4,0],[.5,1]));K.tri(P[0],P[2],P[1],[0,0],[1,0],[.5,0]);K.tri(P[0],P[3],P[2],[0,0],[.5,0],[1,0]);
  return K.geo();}
 // ---- where the light falls: the vents' daylight down each throat (a cone widening as it falls), the wells' glow round their mouths
 const glowAt=(x,y,z)=>{let g=0;for(const T of CAVE.throats){const d=Math.hypot(x-T.c[0],z-T.c[1]),fall=Math.max(0,T.ground-y);g=Math.max(g,smooth(3+fall*.32,.5,d)*smooth(-2,6,fall));}
  for(const W of CAVE.wells)g=Math.max(g,.45*smooth(14,1,Math.hypot(x-W.c[0],y-W.mouth,z-W.c[1])));return g;};
 const up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),q2=new THREE.Quaternion(),m4=new THREE.Matrix4(),v=new THREE.Vector3(),s=new THREE.Vector3(),dir=new THREE.Vector3();
 const hash=(id,k)=>{let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;return KRAND.unit(KRAND.hash(SITE.world,h,k));};
 const place=(L,x,y,z,dx,dy,dz,sx,sy,sz,spin)=>{dir.set(dx,dy,dz).normalize();q.setFromUnitVectors(up,dir);q2.setFromAxisAngle(dir,spin);q.premultiply(q2);
  m4.compose(v.set(x,y,z),q,s.set(sx,sy,sz));L.push(m4.toArray(),glowAt(x+dx*sy*.5,y+dy*sy*.5,z+dz*sy*.5));};
 // ---- the selenite: beams and blocks' parts
 const SEL=[],SELREC=[];
 CAVE.beams.concat(CAVE.floor).forEach(r=>{
  if(r.kind==='beam'){const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az),sink=r.r*.9;
   place(SEL,r.x-dx*sink,r.y+r.r*.5-dy*sink-.2,r.z-dz*sink,dx,dy,dz,r.r*2,r.len+sink,r.r*2,hash(r.id,1)*TAU);SELREC.push(r);}
  else if(r.kind==='block')r.parts.forEach((p,i)=>{const dx=Math.sin(p.tilt)*Math.cos(p.az),dz=Math.sin(p.tilt)*Math.sin(p.az),dy=Math.cos(p.tilt);
   place(SEL,r.x+p.dx,p.y-.25,r.z+p.dz,dx,dy,dz,p.r*2,p.len+.25,p.r*2,hash(r.id,10+i)*TAU);SELREC.push(r);});});
 // ---- the blades: every druse point, up from its floor or down from its roof, leaning a little
 const BL=[],BLREC=[];
 CAVE.beams.concat(CAVE.floor).forEach(r=>{if(r.kind!=='druse')return;r.pts.forEach((p,i)=>{const a=hash(r.id,100+i)*TAU,t=.45*hash(r.id,200+i),sg=p.up?1:-1;
  place(BL,r.x+p.dx,p.y-sg*.06,r.z+p.dz,Math.sin(t)*Math.cos(a),sg*Math.cos(t),Math.sin(t)*Math.sin(a),p.len*.6,p.len*1.15,p.len*.6,hash(r.id,300+i)*TAU);BLREC.push(r);});});
 const inst=(geo,mat,L,name,label)=>{const im=new THREE.InstancedMesh(geo,mat,L.length/2|0),gl=new Float32Array(im.count);
  for(let i=0;i<im.count;i++){im.instanceMatrix.array.set(L[i*2],i*16);gl[i]=L[i*2+1];}im.instanceMatrix.needsUpdate=true;
  geo.setAttribute('aGlow',new THREE.InstancedBufferAttribute(gl,1));im.computeBoundingSphere&&im.computeBoundingSphere();
  im.name=name;im.userData.host=true;im.userData.crystal=true;im.userData.inspectLabel=label;scene.add(im);return im;};
 const matSel=new THREE.MeshStandardMaterial({color:GOLD?0xf0d890:0xdfe8da,map:SEL_TEX,roughness:.2,metalness:0,transparent:true,opacity:.8,flatShading:true});
 crystalHook(matSel,'selenite-beam',1);
 const matBl=new THREE.MeshStandardMaterial({color:GOLD?0xc8b07a:0xa9a49a,map:SEL_TEX,roughness:.34,metalness:0,flatShading:true});
 crystalHook(matBl,'selenite-blade',.55);
 const gSel=prism(),gBl=blade();
 const selM=SEL.length?inst(gSel,matSel,SEL,'selenite','Selenite (gypsum megacrystals)'):null;if(selM)selM.renderOrder=2;
 const blM=BL.length?inst(gBl,matBl,BL,'blades','Bladed gypsum (the floor\'s "shark teeth", the roof\'s blades)'):null;
 if(selM)selM.userData.recs=SELREC;if(blM)blM.userData.recs=BLREC;
 const n=k=>CAVE.beams.concat(CAVE.floor).filter(r=>r.kind===k).length;
 return {sel:selM,blades:blM,beams:n('beam'),blocks:n('block'),druse:n('druse'),parts:SEL.length/2-n('beam'),points:BL.length/2,
  tris:{selenite:(SEL.length/2)*gSel.attributes.position.count/3,blades:(BL.length/2)*gBl.attributes.position.count/3},ms:Math.round(performance.now()-t0)};})();
window._crystals={beams:CRYSTALS.beams,blocks:CRYSTALS.blocks,parts:CRYSTALS.parts,druse:CRYSTALS.druse,points:CRYSTALS.points,tris:CRYSTALS.tris,ms:CRYSTALS.ms};
