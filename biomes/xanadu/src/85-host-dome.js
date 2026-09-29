// ================================================================= HOST — the pleasure dome (a test structure)
// A ruin on the promontory where the map puts the palace and the pleasure
// dome: a round podium with steps, a ring of columns, a drum pierced by
// arches and a dome with one sector fallen in. Plain three.js, pale stone.
// It is a TEST STRUCTURE for XANADU.dress(): the host merges its shells and
// hands them over; the biome samples their faces itself. Host-only. No plant
// is placed in this file.
const DOME={x:-1000,z:-400,R:22};
function buildTestDome(){
 const X=DOME.x,Z=DOME.z,R=DOME.R;let top=-1e9,bot=1e9;
 for(let a=0;a<TAU;a+=TAU/24)for(const r of [0,R*.5,R+6]){const h=terrainH(X+Math.cos(a)*r,Z+Math.sin(a)*r);top=Math.max(top,h);bot=Math.min(bot,h);}
 const y0=top+1.2,stone=[],ice=[];
 const cyl=(list,x,y,z,r0,r1,h,seg,open)=>{const g=new THREE.CylinderGeometry(r1,r0,h,seg||24,1,!!open);g.translate(x,y+h/2,z);list.push(g);};
 // the podium: three rings of steps down into the ground
 [[R+6,y0-(y0-bot)-2],[R+4,y0-1.6],[R+2,y0-.8]].forEach((s,i)=>cyl(stone,X,s[1],Z,s[0],s[0],y0-s[1],40));
 cyl(stone,X,y0-.4,Z,R+1,R+1,.4,40);
 // the colonnade: 20 columns with bases and capitals, an architrave ring over them (broken over three bays)
 const NC=20,CR=R-1.2,CH=11;
 for(let i=0;i<NC;i++){const a=i/NC*TAU,x=X+Math.cos(a)*CR,z=Z+Math.sin(a)*CR;if(i===7)continue;const h=i===8?CH*.55:CH;
  cyl(stone,x,y0,z,.95,.95,.6,10);cyl(stone,x,y0+.6,z,.62,.55,h-1.4,12);if(h===CH)cyl(stone,x,y0+CH-.8,z,.6,1.0,.8,10);}
 for(let i=0;i<NC;i++){if(i>=6&&i<=8)continue;const a0=i/NC*TAU,a1=(i+1)/NC*TAU,g=new THREE.CylinderGeometry(CR+1.2,CR+1.2,1.6,6,1,true,a0,a1-a0);
  g.translate(X,y0+CH+.8,Z);stone.push(g);const g2=new THREE.CylinderGeometry(CR-1.2,CR-1.2,1.6,6,1,true,a0,a1-a0);g2.translate(X,y0+CH+.8,Z);stone.push(g2);
  const t=new THREE.RingGeometry(CR-1.2,CR+1.2,6,1,a0,a1-a0);t.rotateX(-Math.PI/2);t.translate(X,y0+CH+1.6,Z);stone.push(t);}
 // the drum: a wall with arched windows (the wall is built as panels between the arches)
 const DR=R*.62,DH=8,NA=12,dy=y0;
 for(let i=0;i<NA;i++){const a0=i/NA*TAU,span=TAU/NA,w=span*.38;
  [[a0,span*.5-w/2],[a0+span*.5+w/2,span*.5-w/2]].forEach(p=>{const g=new THREE.CylinderGeometry(DR,DR,DH,4,1,true,p[0],p[1]);g.translate(X,dy+DH/2,Z);stone.push(g);
   const g2=new THREE.CylinderGeometry(DR-1.4,DR-1.4,DH,4,1,true,p[0],p[1]);g2.translate(X,dy+DH/2,Z);stone.push(g2);});
  const g=new THREE.CylinderGeometry(DR,DR,DH*.25,3,1,true,a0+span*.5-w/2,w);g.translate(X,dy+DH*.875,Z);stone.push(g);}
 const rim=new THREE.RingGeometry(DR-1.4,DR,48);rim.rotateX(-Math.PI/2);rim.translate(X,dy+DH,Z);stone.push(rim);
 // the dome: a hemisphere with one sector fallen in; its inside glazed pale blue (the caves of ice)
 const dm=new THREE.SphereGeometry(DR,40,16,.6,TAU-1.3,0,Math.PI/2);dm.translate(X,dy+DH,Z);stone.push(dm);
 const di=new THREE.SphereGeometry(DR-.8,40,16,.6,TAU-1.3,0,Math.PI/2);di.scale(1,1,1);di.translate(X,dy+DH,Z);ice.push(di);
 // rubble where the sector fell
 for(let i=0;i<14;i++){const a=rr(-.1,.7),r=rr(DR*.3,R+3),g=new THREE.BoxGeometry(rr(1,3),rr(.6,1.6),rr(1,3));g.rotateY(rr(0,TAU));g.rotateX(rr(-.3,.3));g.translate(X+Math.cos(a)*r,y0+.3,Z+Math.sin(a)*r);stone.push(g);}
 const merge=list=>{let n=0;list.forEach(g=>{n+=(g.index?g.index.count:g.attributes.position.count);});const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
  list.forEach(g=>{const G=g.index?g.toNonIndexed():g;G.computeVertexNormals();pos.set(G.attributes.position.array,o*3);nor.set(G.attributes.normal.array,o*3);o+=G.attributes.position.count;});
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(pos,3));m.setAttribute('normal',new THREE.BufferAttribute(nor,3));return m;};
 const gS=merge(stone),gI=merge(ice);
 const mS=new THREE.Mesh(gS,new THREE.MeshLambertMaterial({color:0xe6ddcc,side:THREE.DoubleSide}));mS.userData.inspectLabel='The pleasure dome (ruin)';scene.add(mS);
 const mI=new THREE.Mesh(gI,new THREE.MeshLambertMaterial({color:0xcfe6f0,emissive:0x284450,side:THREE.BackSide}));mI.userData.inspectLabel='The caves of ice (the dome, inside)';scene.add(mI);
 OBSTACLES.push({x:X,z:Z,r:R+7,y0:bot-2,y1:y0+DH+DR+2});
 REGISTER({name:'The pleasure dome',x:X,z:Z,y:y0,r:R+7,h:DH+DR+4});
 DOME.y0=y0;
 return [gS];}
