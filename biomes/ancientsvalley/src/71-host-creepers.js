// ================================================================= HOST - the creepers on the wild half's towers
// [web] The owner, 2026-11-09: "at least some of Ancient's Valley overgrown like Midgar at the end of FF7": the ruins themselves swallowed. In
// the wild half (AV.fields' wild over a half) every standing tower wears creepers: curtains of vine and hanging moss down its faces, hung
// from the broken top and from the storeys below it, more the deeper the feral field. Two library cards (materials.json: creeper =
// card.creeper.beach, mosshang = card.moss.hanging) on crossed quads, one InstancedMesh each (a few thousand curtains, two triangles a quad),
// each curtain placed by a hash of (tower, index), never by a draw count; tinted by instance colour toward the taint's purple-green, and marked
// `biome` so AV.tint (88) reaches them like the kits' foliage. The trees on the ruins' tops are the feral wrap's perches (46, 88); this is
// the skin. A curtain hangs on the DRAWN ruin's face: the look's measured profile (70, avProfile: the hero's extent in 6 m bands), in the
// tower's frame turned by its yaw and lean (avQuat), never the family's footprint, which is the base of a shaft that tapers (the owner,
// 2026-11-09: curtains 30 m off a spindle's break, floating at the Overlook). The shells are inset 1.2 m, so a curtain hangs a little off a
// far face: unseen past 300 m.
const AV_CREEPERS=(function(){const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ancientsvalley',n):null;
 const geo=(function(){const g=new THREE.BufferGeometry();const P=[],U=[],N=[],I=[];const quad=(ax,az,nx,nz)=>{const b=P.length/3;P.push(-ax,0,-az, ax,0,az, ax,-1,az, -ax,-1,-az);U.push(0,1,1,1,1,0,0,0);for(let i=0;i<4;i++)N.push(nx,0,nz);I.push(b,b+2,b+1,b,b+3,b+2);};
  quad(.5,0,0,1);quad(0,.5,1,0);g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);return g;})();
 /* the core's leaf material (Lambert, two-sided light, the alpha held up with distance; core/biome 30) on the library card refilled through
    BIO.alphaTex: the card's transparent texels are near black (14, 13, 7 on the creeper), so its mipmaps bled a black fringe round every leaf
    and the far curtains read as dark speckled rectangles (the owner, 2026-11-09: "not cut out right"). The fill is the card's own leaf colour,
    measured from its opaque texels (creeper 94, 108, 60; hanging moss 118, 98, 82) */
 const FILL={creeper:[94,108,60],mosshang:[118,98,82]};
 const matOf=(fam)=>{const P=lib(fam),T=P?KMAT.textures(P,{aniso:4}):{};const m=BIO.leafMat(null,'av.creeper.'+fam,{});
  if(!T.map){m.color.setHex(0x3f5a2a);m.alphaTest=0;return m;}
  const take=img=>{const S=512,t=BIO.alphaTex(S,g=>g.drawImage(img,0,0,S,S),FILL[fam]||[90,100,60]);t.flipY=true;t.needsUpdate=true;m.map=t;m.needsUpdate=true;};
  if(T.map.image)take(T.map.image);else(T.map._onImage=T.map._onImage||[]).push(take);return m;};
 const towers=STAGE.plan.towers.filter(t=>t.state!=='skeleton'&&t.state!=='fallen'&&STAGE.F.wild(t.x,t.z)>.5),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Pv=new THREE.Vector3(),Sv=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),C=new THREE.Color();
 const put=[[],[]];   /* [creeper, mosshang]: matrices and colours */
 towers.forEach(t=>{const F=MP.FAMILY[t.family]||MP.DESIGNS[t.family];if(!F)return;let top;if(t.state==='intact'||t.state==='gutted')top=F.height&&F.height.tip?F.height.tip*.92:120;else{try{top=MP.ruin(F,t.state).top;}catch(e){top=40;}}
  let PR=null;try{PR=avProfile(t.key);}catch(e){reportErr('creepers '+t.key+': '+(e.message||e));return;}top=Math.min(top,PR.top);
  if(!(top>8))return;const fe=STAGE.F.feral(t.x,t.z),wild=STAGE.F.wild(t.x,t.z),Qt=avQuat(t);
  const n=Math.max(3,Math.min(26,Math.round((top/11)*(.6+.9*fe)*wild)));
  for(let i=0;i<n;i++){const h=KRAND.hash(STAGE.seed+67,t.id|0,i,0),u1=KRAND.unit(h),u2=KRAND.unit(KRAND.hash(h,1,0,0)),u3=KRAND.unit(KRAND.hash(h,2,0,0)),u4=KRAND.unit(KRAND.hash(h,3,0,0)),u5=KRAND.unit(KRAND.hash(h,4,0,0));
   /* hung from a height on the face (the top itself a third of the time), down a length the feral field allows; the face is the profile's band there */
   const h0=u3<.34?top-.5:top*(.25+.7*u3),len=Math.min(h0-1,6+(10+14*fe)*u4),wd=3.2+4.5*u5;if(len<4)continue;const b=PR.at(h0);if(!b)continue;
   /* a direction round the tower (its frame), the curtain on the wall that direction at that height: the band's outermost radius that way (70, avProfile's
      rAt; Gemini's review, 8c). No wall that way there (a courtyard's side, the Crescent's chord, the Pods' gap, under the Yoke's arch): no curtain */
   const ang=u1*TAU,r=PR.rAt(h0,ang);if(!(r>2))continue;const lx=Math.cos(ang)*(r+.35),lz=Math.sin(ang)*(r+.35);
   /* in the tower's frame, then turned with it (yaw and lean) */
   Pv.set(lx,h0,lz).applyQuaternion(Qt);const x=t.x+Pv.x,y=t.y+Pv.y,z=t.z+Pv.z,yawC=ang+(t.yaw||0)+Math.PI/2;
   Pv.set(x,y,z);Q.setFromAxisAngle(Y,yawC);Sv.set(wd,len,wd);M.compose(Pv,Q,Sv);const kind=u2<.3?1:0;
   C.setHSL(.26+.1*u4-.06*u1,.35+.3*u5,.18+.17*u3);put[kind].push({m:M.clone(),c:C.clone()});}});
 const meshes=[];['creeper','mosshang'].forEach((fam,k)=>{const L=put[k];if(!L.length)return;const im=new THREE.InstancedMesh(geo,matOf(fam),L.length);
  L.forEach((e,i)=>{im.setMatrixAt(i,e.m);im.setColorAt(i,e.c);});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;
  im.userData.biome=true;im.userData.host=true;im.userData.inspectLabel=k?'hanging moss on a tower':'creepers on a tower';im.castShadow=false;im.receiveShadow=false;im.name='av.creepers.'+fam;scene.add(im);meshes.push(im);});
 const n=put[0].length+put[1].length;if(n)REGISTER({name:'the creepers of the wild half',kind:'creeper',x:0,z:0,r:STAGE.R,h:300,tags:{kind:'creeper',curtains:n,towers:towers.length}});
 return{towers:towers.length,curtains:n,meshes};})();
