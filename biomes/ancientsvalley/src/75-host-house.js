// ================================================================= HOST - the House, drawn and walked (41c's records)
// [web] A concrete hut on the residential plaza (STAGE.near, nudged off the streets), its door to the south. Walk through it (F to walk, W) and
// the walker is in the House's foyer, far outside the world's coordinates (x 40 km, y 3 km): no terrain, tier, LOD or weather reaches it.
// The House is drawn in one ShaderMaterial that ignores the scene's lights: ash-grey walls lit only by a falloff round the eye (a torch with
// no torch), so the far end of every corridor is black; dim strips in the ceilings. Its floors and walls go into the walker's registry
// (core/walk KWALK, handed to the host's walker in 99), and each frame the walker's move is tested against the House's thresholds
// (AV.houseCross); a crossing moves the target, the feet and the camera by the same offset. A doorway is closed by a black leaf the walker
// passes through, so both sides of a door look alike. The visit count (this browser's, localStorage, a convenience) lengthens the west
// hallway by 4 cm a visit, its end wall moved while it is out of sight; a readout names the room, the level and what the tape reads.
const AV_HOUSE=(function(){if(typeof AV.house!=='function'||typeof KWALK==='undefined')return null;
 const N=STAGE.near,ORIGIN=[40000,3000,0],FAR_X=38000;
 /* the hut: on the plaza, off the streets (a spot 18 m or more from every street's centre line, nearest the plaza's centre) */
 let hx=N.x,hz=N.z;{let best=null;for(let r=0;r<=120&&!best;r+=6)for(let k=0;k<16&&!best;k++){const a=k/16*Math.PI*2,x=N.x+Math.cos(a)*r,z=N.z+Math.sin(a)*r;if(STAGE.streetD(x,z)>18&&STAGE.built(x,z)<.05&&terrainH(x,z)>STAGE.lakeY+2)best=[x,z];}if(best){hx=best[0];hz=best[1];}}
 let visits=0;try{visits=+(localStorage.getItem('av-house-visits')||0)|0;}catch(e){visits=0;}
 const H=AV.house({origin:ORIGIN,door:{x:hx,z:hz,y:terrainH(hx,hz)},seed:(STAGE.seed|0)+211,visits});
 /* one geometry builder: quads with a colour each */
 const P=[],C=[],quad=(a,b,c,d,col)=>{P.push(...a,...b,...c,...a,...c,...d);for(let i=0;i<6;i++)C.push(col[0],col[1],col[2]);};
 const WALL=[.26,.25,.23],FLOOR=[.17,.16,.15],CEIL=[.11,.105,.1],STRIP=[.75,.72,.62],LEAF=[0,0,0];
 /* a wall along an axis from u0 to u1 (at the fixed coordinate w), from y0 to y1, with its doors cut (gaps [a, b] up to h); side tells the axis */
 const blocks=[];
 const wall=(axis,w,u0,u1,y0,y1,gaps,col)=>{const pt=(u,y)=>axis==='x'?[u,y,w]:[w,y,u];let u=u0;const G=(gaps||[]).slice().sort((p,q)=>p.a-q.a);
  const seg=(a,b,lo,hi)=>{if(b-a<=.01||hi-lo<=.01)return;quad(pt(a,lo),pt(b,lo),pt(b,hi),pt(a,hi),col);};
  const blk=(a,b)=>{if(b-a<=.01)return;const t=.4;blocks.push(axis==='x'?KWALK.block([a,b,w-t/2,w+t/2,y0-1,y1]):KWALK.block([w-t/2,w+t/2,a,b,y0-1,y1]));};
  for(const g of G){seg(u,g.a,y0,y1);blk(u,g.a);seg(g.a,g.b,y0+g.h,y1);quad(pt(g.a,y0),pt(g.b,y0),pt(g.b,y0+g.h),pt(g.a,y0+g.h),LEAF);u=g.b;}seg(u,u1,y0,y1);blk(u,u1);};
 const doorsOn=(s,side)=>(s.doors||[]).filter(d=>d.side===side);
 let tapeEnd=null;const marks=[];   /* each space's first vertex: one mesh a space, so each registered space holds its own drawing */
 for(const s of H.spaces){if(s.world)continue;marks.push([s,P.length]);const y0=s.y,y1=s.y+s.h;
  if(s.kind==='descent'){const ramp0=s.z0+s.flat,yb=s.y-(s.z1-ramp0)*s.slope;
   quad([s.x0,y0,s.z0],[s.x1,y0,s.z0],[s.x1,y0,ramp0],[s.x0,y0,ramp0],FLOOR);quad([s.x0,y0,ramp0],[s.x1,y0,ramp0],[s.x1,yb,s.z1],[s.x0,yb,s.z1],FLOOR);
   quad([s.x0,y1,s.z0],[s.x0,y1,ramp0],[s.x1,y1,ramp0],[s.x1,y1,s.z0],CEIL);quad([s.x0,y1,ramp0],[s.x0,yb+s.h,s.z1],[s.x1,yb+s.h,s.z1],[s.x1,y1,ramp0],CEIL);
   /* the side walls: the flat part as a wall with its door (the west), the sloping part as one quad and one block each side */
   wall('z',s.x0,s.z0,ramp0,y0,y1,doorsOn(s,'w'),WALL);wall('z',s.x1,s.z0,ramp0,y0,y1,[],WALL);
   [s.x0,s.x1].forEach(x=>{quad([x,y0,ramp0],[x,yb,s.z1],[x,yb+s.h,s.z1],[x,y1,ramp0],WALL);blocks.push(KWALK.block([x-.2,x+.2,ramp0,s.z1,yb-1,y1]));});
   quad([s.x0,yb,s.z1],[s.x1,yb,s.z1],[s.x1,yb+s.h,s.z1],[s.x0,yb+s.h,s.z1],WALL);blocks.push(KWALK.block([s.x0,s.x1,s.z1-.2,s.z1+.2,yb-1,yb+s.h]));
   quad([s.x0,y0,s.z0],[s.x0,y1,s.z0],[s.x1,y1,s.z0],[s.x1,y0,s.z0],WALL);blocks.push(KWALK.block([s.x0,s.x1,s.z0-.2,s.z0+.2,y0-1,y1]));
   for(let z=s.z0+6;z<s.z1;z+=8){const yy=z<ramp0?y1:y1-(z-ramp0)*s.slope;quad([s.x0+1.5,yy-.02,z],[s.x0+1.5,yy-.02,z+.6],[s.x1-1.5,yy-.02,z+.6],[s.x1-1.5,yy-.02,z],STRIP);}
   KWALK.floor({rect:[s.x0,s.x1,s.z0,ramp0],y:y0,name:s.name,tag:'house'});KWALK.strip({a:[(s.x0+s.x1)/2,ramp0,y0],b:[(s.x0+s.x1)/2,s.z1,yb],w:s.x1-s.x0,name:s.name,tag:'house'});continue;}
  /* the west hallway (the tape) runs east-west: its long walls, floor and ceiling are drawn 10 m past its end, whose wall is its own mesh (below) */
  const xa=s.kind==='tape'?s.x0-10:s.x0;
  quad([xa,y0,s.z0],[s.x1,y0,s.z0],[s.x1,y0,s.z1],[xa,y0,s.z1],FLOOR);quad([xa,y1,s.z0],[xa,y1,s.z1],[s.x1,y1,s.z1],[s.x1,y1,s.z0],CEIL);
  wall('x',s.z0,xa,s.x1,y0,y1,doorsOn(s,'s'),WALL);wall('x',s.z1,xa,s.x1,y0,y1,doorsOn(s,'n'),WALL);wall('z',s.x1,s.z0,s.z1,y0,y1,doorsOn(s,'e'),WALL);
  if(s.kind==='tape')tapeEnd=s;else wall('z',s.x0,s.z0,s.z1,y0,y1,doorsOn(s,'w'),WALL);
  /* the ceiling's strips: every 12 m along a corridor, a grid in a room */
  const lx=s.x1-s.x0,lz=s.z1-s.z0;if(lx<=6||lz<=6){if(lz>lx)for(let z=s.z0+6;z<s.z1;z+=12)quad([s.x0+1,y1-.02,z],[s.x0+1,y1-.02,z+.5],[s.x1-1,y1-.02,z+.5],[s.x1-1,y1-.02,z],STRIP);else for(let x=s.x0+6;x<s.x1;x+=12)quad([x,y1-.02,s.z0+1],[x+.5,y1-.02,s.z0+1],[x+.5,y1-.02,s.z1-1],[x,y1-.02,s.z1-1],STRIP);}
  else for(let x=s.x0+10;x<s.x1;x+=20)for(let z=s.z0+10;z<s.z1;z+=20)quad([x-1,y1-.02,z-.3],[x-1,y1-.02,z+.3],[x+1,y1-.02,z+.3],[x+1,y1-.02,z-.3],STRIP);
  KWALK.floor({rect:[xa,s.x1,s.z0,s.z1],y:y0,name:s.name||s.id,tag:'house'});}
 /* the tape's end wall: its own mesh and block, moved when the count goes up */
 const mat=new THREE.ShaderMaterial({vertexShader:'attribute vec3 color;varying vec3 vC;varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vC=color;vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying vec3 vC;varying float vD;void main(){float k=0.06+0.94*exp(-vD/16.0);vec3 c=vC*k;if(vC.r>0.5)c=vC*(0.25+0.75*exp(-vD/60.0));gl_FragColor=vec4(c,1.0);}',side:THREE.DoubleSide});
 mat.userData.avNoWarp=true;
 marks.forEach(([s,a],i)=>{const b=i+1<marks.length?marks[i+1][1]:P.length;if(b<=a)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P.slice(a,b),3));g.setAttribute('color',new THREE.Float32BufferAttribute(C.slice(a,b),3));
  const mesh=new THREE.Mesh(g,mat);mesh.name='the House: '+(s.name||s.id);mesh.userData.inspectLabel=mesh.name;mesh.frustumCulled=false;scene.add(mesh);});
 const endG=new THREE.PlaneGeometry(4,3.6);endG.rotateY(Math.PI/2);const endM=new THREE.Mesh(endG,new THREE.MeshBasicMaterial({color:new THREE.Color(.05,.048,.045)}));endM.material.userData.avNoWarp=true;endM.name='the west hallway\'s end';scene.add(endM);
 let endBlock=null;const placeEnd=()=>{const s=tapeEnd;if(!s)return;endM.position.set(s.x0,s.y+1.8,(s.z0+s.z1)/2);if(endBlock)KWALK.setBlock(endBlock,false);endBlock=KWALK.block([s.x0-.4,s.x0,s.z0,s.z1,s.y-1,s.y+s.h]);};placeEnd();
 /* the hut, on the valley's ground: concrete outside, black inside, its door to the south */
 {const s=H.space('hut'),hp=[],hc=[],q=(a,b,c,d,col)=>{hp.push(...a,...b,...c,...a,...c,...d);for(let i=0;i<6;i++)hc.push(col[0],col[1],col[2]);};
  const y0=s.y-.6,y1=s.y+s.h,G=[.42,.4,.37],D=s.doors[0];
  q([s.x0,y0,s.z1],[s.x1,y0,s.z1],[s.x1,y1,s.z1],[s.x0,y1,s.z1],G);q([s.x0,y0,s.z0],[s.x0,y0,s.z1],[s.x0,y1,s.z1],[s.x0,y1,s.z0],G);q([s.x1,y0,s.z0],[s.x1,y1,s.z0],[s.x1,y1,s.z1],[s.x1,y0,s.z1],G);
  q([s.x0,y0,s.z0],[D.a,y0,s.z0],[D.a,y1,s.z0],[s.x0,y1,s.z0],G);q([D.b,y0,s.z0],[s.x1,y0,s.z0],[s.x1,y1,s.z0],[D.b,y1,s.z0],G);q([D.a,s.y+D.h,s.z0],[D.b,s.y+D.h,s.z0],[D.b,y1,s.z0],[D.a,y1,s.z0],G);
  q([s.x0,y1,s.z0],[s.x0,y1,s.z1],[s.x1,y1,s.z1],[s.x1,y1,s.z0],G);q([D.a,s.y-.1,s.z0+.02],[D.b,s.y-.1,s.z0+.02],[D.b,s.y+D.h,s.z0+.02],[D.a,s.y+D.h,s.z0+.02],[0,0,0]);
  const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));hg.setAttribute('color',new THREE.Float32BufferAttribute(hc,3));hg.computeVertexNormals();
  const hm=new THREE.Mesh(hg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));hm.name='a concrete hut';hm.userData.host=true;hm.userData.inspectLabel='a concrete hut, its door open on the dark';scene.add(hm);
  [[s.x0,s.x1,s.z1-.2,s.z1+.2],[s.x0-.2,s.x0+.2,s.z0,s.z1],[s.x1-.2,s.x1+.2,s.z0,s.z1],[s.x0,D.a,s.z0-.2,s.z0+.2],[D.b,s.x1,s.z0-.2,s.z0+.2]].forEach(b=>blocks.push(KWALK.block([b[0],b[1],b[2],b[3],s.y-2,y1])));
  REGISTER({name:'a concrete hut: a door into the House',kind:'house',x:(s.x0+s.x1)/2,z:(s.z0+s.z1)/2,y:s.y-1,r:3,h:s.h+2,tags:{kind:'house',door:'hut'}});}
 H.spaces.forEach(s=>{if(s.world)return;const lo=s.kind==='descent'?s.y-(s.z1-s.z0)*s.slope:s.y;REGISTER({name:'the House: '+(s.name||s.id),kind:'house',x:(s.x0+s.x1)/2,z:(s.z0+s.z1)/2,y:lo-1,r:Math.hypot(s.x1-s.x0,s.z1-s.z0)/2,h:s.y+s.h-lo+2,tags:{kind:'house',space:s.id}});});
 /* the readout */
 const el=document.createElement('div');el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);font:13px Georgia,serif;color:#b9b2a6;background:rgba(0,0,0,.45);padding:5px 12px;border-radius:4px;pointer-events:none;display:none;z-index:20';document.body.appendChild(el);
 const st={visit:0,depth:0,inside:false},S={H,st,visits,blocks:blocks.length,crossings:{},moved:0};let prev=null;
 const feet=()=>{const Cm=KHOST.cam;if(Cm&&Cm.ctl&&Cm.ctl.walk&&Cm.walkAt)return[Cm.walkAt[0],Cm.walkAt[2],Cm.walkAt[1]];return[camera.position.x,camera.position.y,camera.position.z];};
 const move=d=>{const Cm=KHOST.cam;if(Cm&&Cm.ctl){Cm.ctl.target.x+=d[0];Cm.ctl.target.y+=d[1];Cm.ctl.target.z+=d[2];if(Cm.walkAt){Cm.walkAt[0]+=d[0];Cm.walkAt[1]+=d[2];Cm.walkAt[2]+=d[1];}}camera.position.x+=d[0];camera.position.y+=d[1];camera.position.z+=d[2];S.moved++;};
 S.cross=(a,b)=>AV.houseCross(H,a,b,st);
 tick(function(){if(typeof KHOST==='undefined'||!KHOST.cam)return;const p=feet();if(!prev){prev=p;return;}
  const r=AV.houseCross(H,prev,p,st);
  if(r){move(r.d);S.crossings[r.id]=(S.crossings[r.id]|0)+1;
   if(r.id==='in'){visits++;try{localStorage.setItem('av-house-visits',String(visits));}catch(e){}if(tapeEnd){tapeEnd.x0=tapeEnd.x1-(18+H.drift*visits);H.tape=18+H.drift*visits;placeEnd();}}
   prev=[p[0]+r.d[0],p[1]+r.d[1],p[2]+r.d[2]];}else prev=p;
  const inH=prev[0]>FAR_X-500;el.style.display=inH?'block':'none';
  if(inH){let room='';for(const s of H.spaces)if(!s.world&&prev[0]>=s.x0&&prev[0]<=s.x1&&prev[2]>=s.z0&&prev[2]<=s.z1){room=s.name||s.id;if(s.kind==='tape')room+=': the tape reads '+H.tape.toFixed(2)+' m';break;}
   el.textContent=(room||'the dark')+(st.depth?'  ·  level -'+st.depth:'');}});
 S.groundAt=(x,z)=>x>FAR_X?ORIGIN[1]-1000:null;S.far=FAR_X;
 return S;})();
