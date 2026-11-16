// ================================================================= HOST — THE WALKED TUBE, THE GATHERED CAVES AND THE HORNITOS (station 2): core/terrain's KCAVERN, KSTACKS
// stationBuild() (88-host-build.js calls it after the kit's pass, before the bake; the pass keeps off the skylight's hole by the host's fields):
//   THE PLAN     KCAVERN.create on the station's ground: tube_god_07 under the walked skylight (WALK, 45b), 380 m up the tube and 460 m down it,
//                48 m wide and 28 m high on the floor KRELIEF.tube gave it (its crown 55 m under the plain), drawn as a chain of short tubes
//                (twins' pyroduct: one long tube's box is its whole run's); the skylight a collapse through the roof (C.shaft, a C.opening
//                'well'), its breakdown a ramp of fallen roof the Talovolci climb (C.monolith tiers), a ladder on its last step; THE GATHERED
//                CAVES (PLAN.md section 5) as side halls off the bore near the mouth: the fungus beds' cave, the ice cave (a cold trap a few
//                metres lower, the winter's ice kept into summer), the guano ledges on the bore's curb, gypsum crusts on its wall; the tube
//                beyond them dark, a worn path and cairned turnings down it toward the next skylight. Cell 1.5 m
//   THE LIGHT    the skylight's sky and sun (its patch on the breakdown), the gatherers' lamps at the caves, the eye's headlamp
//   THE HORNITOS KSTACKS chimneys (form pipe, a few metres high, weathered: some broken) over the roofed tube where it ran full
//   THE PITS     the chain's skylights (KRELIEF.tube's and tubeRille's) as dark holes in the plain (only the walked one is drawn below)
// GROUND_HOLE (84) reads the walked skylight's well: the ground mesh leaves it to the cavern.
const CAVE={meshes:[],counts:{},C:null,lamps:[],props:[],caves:[]};
/* the kit's pass (55) reads these: the stream's box and record (its wet field), the fields' raster and the rows' bearing */
GSTEP.RILLE_SURFACES=[STREAM_FLOW];GSTEP.RILLE_FIELD=FIELDS.at;GSTEP.RILLE_ROWS=Math.atan2(DOWN[1],DOWN[0]);
GSTEP.RILLE_WATERBOX=(function(){const b=FIELDS.box;let x0=b[0],z0=b[1],x1=b[2],z1=b[3];STREAM.pts.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);});
 return[Math.floor(x0-100),Math.floor(z0-100),Math.ceil(x1+100),Math.ceil(z1+100)];})();
function GROUND_HOLE(x,z){return Math.hypot(x-WALK.x,z-WALK.z)<WALK.r+WALK.rim;}
const TFLOOR=s=>TLINE.at(s).y;
const WALKED={from:WALK.s-380,to:WALK.s+460};
// the gathered caves: [name, s along the tube, side (-1 left of the bore, +1 right), rx, rz, h, floor drop]
const CAVES=[['The fungus beds\' cave (the Talovolci\'s dark-grown crops: pale fungi and alecap on beds of guano and straw)',WALK.s-150,-1,13,18,9,0,'fungus'],
 ['The ice cave (a cold trap below the bore: the winter\'s ice kept into summer, cut in blocks)',WALK.s+210,1,12,16,8,3.5,'ice'],
 ['The guano ledges (bat and bird guano scraped from the bore\'s curb for the fields)',WALK.s-260,1,10,14,7,0,'guano'],
 ['The gypsum crusts (cut back from the bore\'s wall: gypsum and the iron and sulphur salts)',WALK.s+70,-1,9,12,7,0,'gypsum']];
function stationBuild(){const t0=performance.now(),C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:1.5,chunk:24,seed:KRAND.hash(WORLD,92,1,0xCA7E),minRock:.8});CAVE.C=C;
 const nrm=s=>{const p=TLINE.at(s);return[-p.dz,p.dx];};
 // ---- the bore: a chain of 30 m tubes on KRELIEF.tube's floor
 const pts=[];for(let s=WALKED.from;s<WALKED.to;s+=30){const p=TLINE.at(s);pts.push([p.x,p.y,p.z]);}{const p=TLINE.at(WALKED.to);pts.push([p.x,p.y,p.z]);}
 for(let i=1;i<pts.length;i++)C.tube({id:'tube_god_07#'+i,owner:'godstep',pts:[pts[i-1],pts[i]],w:TUBE_REC.w,h:TUBE_REC.h,spring:.45,ledge:{v:7,d:2},blend:4,rock:'basalt',finish:'raw'});
 CAVE.pts=pts;
 // ---- the gathered caves: side halls opening off the bore
 CAVES.forEach((K,i)=>{const p=TLINE.at(K[1]),n=nrm(K[1]),off=TUBE_REC.w*.5+K[3]*.55,c=[p.x+n[0]*K[2]*off,p.y-K[6],p.z+n[1]*K[2]*off];
  C.hall({id:'cave-'+K[7],owner:'godstep',c,rx:K[3],rz:K[4],h:K[5],belly:.25,blend:5});CAVE.caves.push({name:K[0],kind:K[7],x:c[0],y:c[1],z:c[2],r:Math.max(K[3],K[4]),h:K[5],s:K[1],side:K[2]});});
 // ---- the skylight: the shaft from under the crown to over the plain, its breakdown ramp's tiers
 const f0=WALK.floor,crown=f0+TUBE_REC.h,gy=plainH(WALK.x,WALK.z);WALK.crown=crown;WALK.y=gy;
 C.shaft({id:'skylight',owner:'godstep',c:[WALK.x,WALK.z],y0:crown-1.5,y1:gy+8,r0:9,r1:WALK.r});
 C.opening({id:'skylight:well',c:[WALK.x,WALK.z],r:WALK.r,rim:WALK.rim,kind:'well'});
 const rise=gy-f0,tiers=Math.max(4,Math.ceil(rise/5)),dS=WALK.d,nS=[-dS[1],dS[0]],box=(s0,s1,h)=>[[s0,-h],[s1,-h],[s1,h],[s0,h]].map(q=>[WALK.x+dS[0]*q[0]+nS[0]*q[1],WALK.z+dS[1]*q[0]+nS[1]*q[1]]);
 WALK.tiers=[];
 for(let k=0;k<tiers;k++){const s0=-34+k*(44/tiers),top=f0+rise*(k+1)/tiers-6;WALK.tiers.push({s0,top});
  C.monolith({id:'breakdown-'+k,owner:'godstep',poly:box(s0,30,TUBE_REC.w*.5+2),y0:f0-2,y1:top,taper:.18,cap:1.4,block:false});}
 C.build();
 // ---- the light: the gatherers' lamps at the caves and down the bore, the skylight, the headlamp
 CAVE.caves.forEach(K=>CAVE.lamps.push([K.x,K.y+2.6,K.z]));
 for(let s=WALKED.from+30;s<WALKED.to-20;s+=140){const p=TLINE.at(s),n=nrm(s);CAVE.lamps.push([p.x+n[0]*(TUBE_REC.w*.5-2),p.y+3,p.z+n[1]*(TUBE_REC.w*.5-2)]);}
 const NL=12;while(CAVE.lamps.length>NL)CAVE.lamps.pop();
 const lamps=CAVE.lamps.map(p=>new THREE.Vector3(p[0],p[1],p[2]));while(lamps.length<NL)lamps.push(new THREE.Vector3(0,-1e6,0));
 const HR=WALK.r+WALK.rim;
 const U={uHole:{value:new THREE.Vector3(WALK.x,WALK.z,HR)},uLamps:{value:lamps},uOpen:{value:new THREE.Vector4(WALK.x,gy,WALK.z,WALK.r)},uSun:{value:new THREE.Vector3(.4,.8,.3)},uSunC:{value:new THREE.Color(1,1,1)},
  uSky:{value:new THREE.Color(.5,.55,.6)},uHead:{value:1}};
 CAVE.U=U;
 tick(()=>{const d=sun.position.clone().normalize();U.uSun.value.copy(d);U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity*1.2);
  U.uHead.value=camera.position.y<terrainH(camera.position.x,camera.position.z)-2?1:0;});
 const vs='attribute float occ;attribute float gnd;attribute vec4 cw;varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;\n'+
  'void main(){\n#ifdef USE_INSTANCING\nmat4 mm=modelMatrix*instanceMatrix;\n#else\nmat4 mm=modelMatrix;\n#endif\nvec4 w=mm*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(mm)*normal);vOcc=occ;vG=gnd;vCw=cw;\n'+
  '#ifdef USE_INSTANCING_COLOR\nvC=instanceColor;\n#else\nvC=vec3(1.0);\n#endif\ngl_Position=projectionMatrix*viewMatrix*w;}';
 const fs='uniform vec3 uHole;uniform vec3 uLamps['+NL+'];uniform vec4 uOpen;uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uSky;uniform float uHead;uniform vec3 uBase;uniform float uSheen;'+
  'varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;'+
  'void main(){'+
  /* THE SEAM: the host's ground (84) leaves out a 2 m cell of the skylight's inset when the cell's centre is in the hole; the cavern's ground
     draws only in those cells, so the two never overlap */
  'if(vG>0.5){vec2 c0=floor(vW.xz*0.5)*2.0+1.0;if(length(c0-uHole.xy)>=uHole.z)discard;}'+
  'vec3 n=normalize(vN);vec3 c=vec3(0.0);'+
  'for(int i=0;i<'+NL+';i++){vec3 l=uLamps[i]-vW;float d=length(l);c+=vec3(1.0,0.7,0.4)*max(dot(n,l/d),0.0)*110.0/(d*d+50.0);}'+
  '{vec3 l=uOpen.xyz-vW;float d=length(l);float R=uOpen.w;c+=uSky*max(dot(n,l/d),0.0)*R*R/(d*d+R*R)*5.0*vOcc;}'+
  '{float t=(uOpen.y-vW.y)/max(uSun.y,0.05);vec2 p=vW.xz+uSun.xz*t-uOpen.xz;float lit=(1.0-smoothstep(uOpen.w*0.85,uOpen.w,length(p)))*step(0.0,t)*step(0.05,uSun.y);c+=uSunC*max(dot(n,uSun),0.0)*lit*1.6;}'+
  'c=mix(c,uSunC*max(dot(n,uSun),0.0)+uSky*(0.55+0.45*n.y),vG);'+
  'vec3 e=cameraPosition-vW;float de=length(e);vec3 v=e/de;c+=uHead*vec3(0.95,0.95,1.0)*max(dot(n,v),0.0)*90.0/(de*de+30.0);'+
  'float sp=pow(max(dot(reflect(-v,n),v),0.0),24.0)*uSheen*uHead*60.0/(de*de+30.0);'+
  'vec3 base=uBase*vC;base=mix(base,base*1.6+vec3(0.02),clamp(vCw.y,0.0,1.0)*0.6);base=mix(base,vec3(0.17,0.15,0.12),vG*smoothstep(0.55,0.85,n.y));'+
  'vec3 col=(base*(c*mix(vOcc,1.0,vG)+0.01)+vec3(0.6,0.62,0.66)*sp)*1.8;col=col/(1.0+col*0.35);gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}';
 const mat=(base,sheen,inst)=>{const m=new THREE.ShaderMaterial({uniforms:Object.assign({uBase:{value:new THREE.Color(base).convertSRGBToLinear()},uSheen:{value:sheen}},U),
  vertexShader:inst?vs.replace('attribute float occ;attribute float gnd;attribute vec4 cw;','').replace('vOcc=occ;vG=gnd;vCw=cw;','vOcc=1.0;vG=0.0;vCw=vec4(0.0);'):vs,fragmentShader:fs,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
  m.userData.noHorizon=true;return m;};
 const rockM=mat(0x2e2b2c,.45,false);
 /* the chunks merged into a few meshes (by 8 chunks: ~630 chunk meshes would be ~630 draw calls from the plain) */
 let tris=0;{const CH=C.meshAll().filter(ch=>ch.idx.length);for(let g0=0;g0<CH.length;g0+=80){const grp=CH.slice(g0,g0+80);let nv=0,ni=0;grp.forEach(ch=>{nv+=ch.pos.length/3;ni+=ch.idx.length;});
  const pos=new Float32Array(nv*3),nrm=new Float32Array(nv*3),occ=new Float32Array(nv),gnd=new Float32Array(nv),cw=new Float32Array(nv*4),idx=new Uint32Array(ni);let v=0,k=0;
  grp.forEach(ch=>{const n=ch.pos.length/3;pos.set(ch.pos,v*3);nrm.set(ch.nrm,v*3);occ.set(ch.occ,v);for(let i=0;i<n;i++)gnd[v+i]=ch.ground[i];cw.set(ch.w,v*4);for(let i=0;i<ch.idx.length;i++)idx[k+i]=ch.idx[i]+v;v+=n;k+=ch.idx.length;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));g.setAttribute('occ',new THREE.BufferAttribute(occ,1));
  g.setAttribute('gnd',new THREE.BufferAttribute(gnd,1));g.setAttribute('cw',new THREE.BufferAttribute(cw,4));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rockM);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel='tube_god_07\'s rock: titanium basalt, glazed where the lava drained, its curb the old flow level (KCAVERN)';scene.add(m);CAVE.meshes.push(m);tris+=ni/3;}}
 // ---- the records (core/tags), before the props are drawn
 {const m=TLINE.at((WALKED.from+WALKED.to)/2);REGISTER({name:TUBE_REC.name+': the walked section under the skylight (the Tuboroda, the tube road to the next step)',x:m.x,z:m.z,y:m.y-4,r:(WALKED.to-WALKED.from)/2,h:TUBE_REC.h+10,kind:'cavern',tags:{culture:'talovolci',use:['transit','gathering']}});}
 REGISTER({name:WALK.name+' and its breakdown ramp',x:WALK.x,z:WALK.z,y:f0-1,r:WALK.r+WALK.rim,h:gy-f0+6,kind:'feature',tags:{culture:'talovolci'}});
 CAVE.caves.forEach(K=>REGISTER({name:K.name,x:K.x,z:K.z,y:K.y-2,r:K.r+2,h:K.h+4,kind:'cavern',tags:{culture:'talovolci',use:['gathering'],cave:K.kind}}));
 // ---- THE PROPS (each set a core/tags record above or below; drawn as instances under the cave's light): fungus beds, guano heaps, gypsum crusts,
 // ice blocks, baskets, the ladder, the gatherers' lamps, cairns at the bore's turnings
 const U01=(i,k,salt)=>KRAND.unit(KRAND.hash(WORLD,i,k,salt));
 const P={bed:[],guano:[],gyp:[],ice:[],basket:[],cairn:[]};
 const floorAt=(x,z,y0)=>{for(let y=y0+6;y>y0-12;y-=.25){if(C.sdf(x,y,z)<=0)return y+.25;}return null;};
 CAVE.caves.forEach((K,ci)=>{const n=K.kind==='fungus'?60:K.kind==='ice'?36:K.kind==='guano'?28:24;
  for(let i=0;i<n;i++){const a=U01(ci,i,0xCA1)*TAU,r=Math.sqrt(U01(ci,i,0xCA2))*K.r*.7,x=K.x+Math.cos(a)*r,z=K.z+Math.sin(a)*r,y=floorAt(x,z,K.y);if(y==null)continue;
   const s=.6+.8*U01(ci,i,0xCA3),yaw=U01(ci,i,0xCA4)*TAU;
   if(K.kind==='fungus')P.bed.push([x,y,z,s*1.4,yaw]);else if(K.kind==='ice')P.ice.push([x,y,z,s,yaw]);else if(K.kind==='guano')P.guano.push([x,y,z,s,yaw]);else P.gyp.push([x,y,z,s,yaw]);}
  for(let i=0;i<4;i++){const a=U01(ci,i,0xBA1)*TAU,r=K.r*.4,x=K.x+Math.cos(a)*r,z=K.z+Math.sin(a)*r,y=floorAt(x,z,K.y);if(y!=null)P.basket.push([x,y,z,.45,0]);}});
 /* gypsum on the bore's wall by its cave and guano on the curb: a few up the wall */
 for(let i=0;i<40;i++){const s=WALK.s+40+60*U01(i,0,0x6A1),n=nrm(s),p=TLINE.at(s),side=-1,h=2+10*U01(i,1,0x6A1),x=p.x+n[0]*side*(TUBE_REC.w*.5-1.5),z=p.z+n[1]*side*(TUBE_REC.w*.5-1.5);
  P.gyp.push([x,p.y+h,z,.5+.6*U01(i,2,0x6A1),U01(i,3,0x6A1)*TAU]);}
 /* the cairned turnings down the bore past the caves, toward the next skylight */
 for(let s=WALK.s+60;s<WALKED.to-20;s+=55){const p=TLINE.at(s),n=nrm(s),x=p.x+n[0]*8,z=p.z+n[1]*8,y=floorAt(x,z,p.y);if(y!=null)P.cairn.push([x,y,z,1,U01(Math.round(s),0,0xCA9)*TAU]);}
 /* the ladder: on the breakdown's last tier up to the shaft's lip (two rails, rungs) */
 const T0=WALK.tiers[WALK.tiers.length-1],lx=WALK.x+dS[0]*(T0.s0+2),lz=WALK.z+dS[1]*(T0.s0+2),ly=floorAt(lx,lz,T0.top)||T0.top;
 CAVE.ladder={x:lx,y:ly,z:lz,len:Math.max(4,gy-ly+1)};
 REGISTER({name:'Fungus beds ('+P.bed.length+') in the fungus beds\' cave: pale fungi and alecap on guano and straw',x:CAVE.caves[0].x,z:CAVE.caves[0].z,y:CAVE.caves[0].y-1,r:CAVE.caves[0].r,h:3,kind:'feature',tags:{crop:['pale fungi','alecap']}});
 REGISTER({name:'Ice blocks ('+P.ice.length+') cut in the ice cave',x:CAVE.caves[1].x,z:CAVE.caves[1].z,y:CAVE.caves[1].y-1,r:CAVE.caves[1].r,h:3,kind:'feature'});
 REGISTER({name:'Guano heaps ('+P.guano.length+') scraped from the ledges',x:CAVE.caves[2].x,z:CAVE.caves[2].z,y:CAVE.caves[2].y-1,r:CAVE.caves[2].r,h:3,kind:'feature'});
 REGISTER({name:'Gypsum crusts ('+P.gyp.length+'), cut back from the wall',x:CAVE.caves[3].x,z:CAVE.caves[3].z,y:CAVE.caves[3].y-1,r:CAVE.caves[3].r+60,h:16,kind:'feature'});
 REGISTER({name:'The gatherers\' baskets ('+P.basket.length+')',x:WALK.x,z:WALK.z,y:f0-8,r:300,h:24,kind:'structure',tags:{culture:'talovolci'}});
 REGISTER({name:'Cairned turnings ('+P.cairn.length+') down the tube road',x:TLINE.at(WALK.s+250).x,z:TLINE.at(WALK.s+250).z,y:f0-8,r:220,h:20,kind:'structure',tags:{culture:'talovolci'}});
 REGISTER({name:'The ladder down the breakdown into the skylight',x:lx,z:lz,y:ly-1,r:4,h:CAVE.ladder.len+2,kind:'structure',tags:{culture:'talovolci'}});
 const inst=(geo,base,sheen,L,label,sc)=>{if(!L.length)return null;const im=new THREE.InstancedMesh(geo,mat(base,sheen,true),L.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  L.forEach((b,i)=>{e.set(0,b[4],0);q.setFromEuler(e);const k=sc?sc(b):[b[3],b[3],b[3]];M.compose(new THREE.Vector3(b[0],b[1],b[2]),q,new THREE.Vector3(k[0],k[1],k[2]));im.setMatrixAt(i,M);});
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.cavern=true;im.userData.inspectLabel=label;scene.add(im);CAVE.meshes.push(im);return im;};
 const lump=(det,flat)=>{const g=new THREE.IcosahedronGeometry(1,det);g.scale(1,flat,1);g.translate(0,flat*.5,0);return g;};
 inst(new THREE.CylinderGeometry(1,1,.25,10).translate(0,.12,0),0xcfc4a8,.05,P.bed,'Fungus beds (pale fungi and alecap: the Talovolci\'s dark-grown crops)',b=>[b[3]*1.4,1,b[3]]);
 inst(lump(0,.45),0x2a2016,.05,P.guano,'Guano (scraped from the ledges for the fields)');
 inst(lump(0,.35),0xe8e2d6,.3,P.gyp,'Gypsum crusts (white, with iron and sulphur salts)');
 inst(new THREE.BoxGeometry(1,.8,1).translate(0,.4,0),0xb8d4e0,.8,P.ice,'Ice (the winter\'s, kept into summer in the cold trap)');
 inst(new THREE.CylinderGeometry(.5,.38,.7,8).translate(0,.35,0),0x8a6a3c,.05,P.basket,'A gatherer\'s basket');
 inst(lump(0,1.3),0x4c4844,.1,P.cairn,'A cairned turning (the tube road)',b=>[.6,1,.6]);
 {const L=CAVE.ladder.len,yaw=Math.atan2(nS[0],nS[1]),rails=[-.25,.25].map(o=>[lx+nS[0]*o,ly,lz+nS[1]*o,1,yaw]),rungs=[];for(let r=.4;r<L;r+=.4)rungs.push([lx,ly+r,lz,1,yaw]);
  inst(new THREE.BoxGeometry(.08,1,.08).translate(0,.5,0),0x6a5232,.05,rails,'The ladder (cut poles, lashed rungs)',()=>[1,L,1]);
  inst(new THREE.BoxGeometry(.6,.05,.05),0x6a5232,.05,rungs,'The ladder\'s rungs');}
 // ---- the lamps drawn (flames, additive)
 {const fl=new THREE.ConeGeometry(.14,.45,6);fl.translate(0,.26,0);const im=new THREE.InstancedMesh(fl,new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}),CAVE.lamps.length),M=new THREE.Matrix4();
  CAVE.lamps.forEach((p,i)=>{M.makeTranslation(p[0],p[1],p[2]);im.setMatrixAt(i,M);});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel='A gatherer\'s lamp';scene.add(im);CAVE.meshes.push(im);}
 CAVE.P=P;
 // ---- THE HORNITOS: over the roofed tube where it ran full (KSTACKS chimneys, form pipe), the rest of the chain's skylights as dark holes
 const HORN=[];for(let k=0;k<14;k++){const h=KRAND.hash(WORLD,k,2,0x4021),u=q=>KRAND.unit(KRAND.hash(h,q)),s=300+k*260+120*u(1);if(s>TLINE.L-100)break;
  if(Math.abs(s-WALK.s)<120||TRIL.spans.some(S=>s>S.s0-80&&s<S.s1+80)||u(2)<.3)continue;const p=TLINE.at(s),n=nrm(s),off=(u(3)-.5)*30,x=p.x+n[0]*off,z=p.z+n[1]*off;
  if(!inMap(x,z))continue;
  const B=KSTACKS.make({kind:'chimney',id:'hornito-'+k,form:'pipe',x,z,H:2.5+4*u(4),r:1.2+1.3*u(5),state:u(6)<.4?'broken':'standing',ground:(x,z)=>terrainH(x,z),seed:h>>>0});
  B.name='A hornito (a rootless spatter chimney over the tube where it ran full: old, crusted)';HORN.push(B);}
 {const pos=[],col=[],idx=[],c=new THREE.Color(),GR=[0x3a2e28,0x4a3226,0x2e2a28];
  HORN.forEach(B=>{REGISTER({name:B.name,x:B.x,z:B.z,y:B.y0-1,r:B.R,h:B.top-B.y0+2,kind:'feature'});const m=KSTACKS.mesh(B,{step:.8}),n0=pos.length/3;
   for(let v=0;v<m.part.length;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);c.setHex(GR[KRAND.hash(B.seed,m.bed[v],77)%GR.length]).multiplyScalar(.6+.4*m.occ[v]);col.push(c.r,c.g,c.b);}
   for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);});
  if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.host=true;m.userData.inspectLabel='Hornitos (rootless spatter chimneys over tube_god_07)';scene.add(m);CAVE.meshes.push(m);}}
 CAVE.horn=HORN;
 const SKYL=[];TUBE.pits.forEach((q,k)=>{if(q&&q.kind==='skylight')SKYL.push({x:q.x,z:q.z,r:q.r,src:'tube'});});TRIL.skylights.forEach(q=>SKYL.push({x:q.x,z:q.z,r:q.r,src:'tuberille'}));
 {const L=SKYL.filter(q=>inMap(q.x,q.z));const im=L.length?new THREE.InstancedMesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x050505}),L.length):null,M=new THREE.Matrix4();
  L.forEach((q,i)=>{M.compose(new THREE.Vector3(q.x,terrainH(q.x,q.z)-.25,q.z),new THREE.Quaternion(),new THREE.Vector3(q.r,1,q.r));im.setMatrixAt(i,M);
   REGISTER({name:'A skylight in tube_god_07\'s roof (a hole to the dark bore 55 m down)',x:q.x,z:q.z,y:terrainH(q.x,q.z)-4,r:q.r+3,h:8,kind:'feature'});});
  if(im){im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel='A skylight (the tube\'s dark bore below)';scene.add(im);CAVE.meshes.push(im);}}
 CAVE.sky=SKYL;
 /* the probe's points for the landforms that are ground (a pit's floor, a hornito's body: the ground mesh is skipped by the probe and the hornitos
    are one merged mesh), so their records are seen to hold something */
 {const o=new THREE.Object3D(),pp=[];TUBE.pits.forEach(q=>{if(q&&q.kind==='collapse'&&inMap(q.x,q.z))pp.push(q.x,q.y-4,q.z);});HORN.forEach(B=>pp.push(B.x,(B.y0+B.top)/2,B.z));
  TRIL.spans.forEach(S=>{const m=TLINE.at((S.s0+S.s1)/2);pp.push(m.x,terrainH(m.x,m.z)+1,m.z);});
  o.userData.probePoints=pp;o.userData.host=true;scene.add(o);}
 CAVE.counts={tris,chunks:C.chunks.length,lamps:CAVE.lamps.length,caves:CAVE.caves.length,beds:P.bed.length,ice:P.ice.length,guano:P.guano.length,gypsum:P.gyp.length,baskets:P.basket.length,cairns:P.cairn.length,
  hornitos:HORN.length,skylights:SKYL.length,tiers,ms:Math.round(performance.now()-t0)};
 window._cavern=CAVE.counts;return CAVE.counts;}
// STATION_FLOOR: where the eye stands: the tube's floor, the breakdown's tiers, else the ground (the host's camera guard: 98z hands it over)
function STATION_FLOOR(x,z){const C=CAVE.C;if(!C)return terrainH(x,z);
 const g=terrainH(x,z);let air=false;for(let y=g-.3;y>g-100;y-=.5){if(C.sdf(x,y,z)>0)air=true;else if(air)return y+.5;}
 return g;}
