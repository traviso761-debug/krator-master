// ================================================================= HOST — station 6, the Tiguantin cloud-terraces and the entombed First Monastery tube
// After the build (88: the forest, the bake, the ground), before the sky. Every place below is a core/tags record (REGISTER) made before it is drawn.
//   THE NEAR PATCH   the gully's showcase stretch at 1.67 m (the ground mesh's 6.7 m cells, split four ways): the coarse ground's cells there are
//                    dropped from its index and the patch takes their place, its rim on the coarse cells' own edges (no crack). Its gentle faces draw
//                    with the ground's own material (the paint, KGROUND, the horizon, the wet); its steep faces draw THE COLUMN: KSTRATA's stack
//                    (44z TIG.STACK: megabreccia, carbonate-shelf, the baked red paleosol, the welded ignimbrite with its fiamme, the tibasalt),
//                    its contacts dipping with the shoulder so the gully's walls, the terraces' risers and the stream's banks read one column
//   THE TUBE         core/terrain's KCAVERN: tube_lesser_06 (15 x 10 m, ESE: the scale model's line) as a chain of tubes in the tibasalt, the
//                    archive vault cav_monks_archive (C.hall 140 x 90 x 22 m) on it, the skylight a 16 m collapse through its roof (C.shaft with a
//                    C.opening well: the patch leaves the well's cells to the cavern), the fallen roof a breakdown cone (C.monolith tiers);
//                    drawn by KCAVERN.drawRock with this page's cave light (the skylight, the monks' lanterns, the eye's lamp underground)
//   THE TERRACES     the Tiguantin cloud-terraces: four drystone walls of carbonate-shelf ashlar on the SW flank (courses 0.5 m, a running bond), broken
//                    and fallen in stretches, their stones lying on the treads below them (seated by their rotated extents), four spring cisterns;
//                    KRUINS.watch (core/ruins: nothing floats, every wreck lies on the ground)
//   THE VAULT        the First Monastery's cells, fallen to their footings and waist-high walls on the vault's floor (KRUINS.watch on the floor),
//                    the archive's stone racks with the brass-leaf chronicles and vellum rolls the History Monks come for
//   THE MONKS        three rope-winches (shear legs, a windlass, the rope down to the breakdown cone) on the skylight's lip, brass survey lanterns on
//                    the ropes and in the vault
// STATION_FLOOR (98z hands it to the host's camera guard): the eye may stand on the vault's floor and the breakdown cone.
const TIGX={meshes:[],counts:{},C:null,lamps:[],probe:[]};
function STATION_FLOOR(x,z){const C=TIGX.C,g=terrainH(x,z);if(!C||!C.holeAt||Math.hypot(x-TIG.V.x,z-TIG.V.z)>260)return g;
 let air=false;for(let y=g-.3;y>g-90;y-=.5){if(C.sdf(x,y,z)>0)air=true;else if(air)return y+.5;}return g;}
(function(){const t0=performance.now(),Q=new URLSearchParams(location.search);if(Q.get('tig')==='0')return;
 const {TAU,clamp,lerp,mix,smooth}=BIO.fn,W=61138,U=(a,b,c,d)=>KRAND.unit(KRAND.hash(W,a|0,b|0,c|0,d|0));
 const T=TIG,lin=h=>new THREE.Color(h).convertSRGBToLinear();
 // ---------------------------------------------------------------- the column (KSTRATA on the GPU, its CPU twin for the stones' colours)
 let S=null;try{S=BIO.strata(Object.assign({},T.STACK,{dust:0x8a8676,res:.25,private:true}));}catch(e){reportErr('tiguantin strata: '+e.stack);}
 TIGX.S=S;
 // ---------------------------------------------------------------- THE RECORDS (core/tags) before anything is drawn
 const SKY=T.SKY,V=T.V,VA=T.VAULT,VS=T.sOf(V.x,V.z);
 const gS=terrainH(SKY.x,SKY.z);
 REGISTER({name:'The gully\'s walls: the burial exposed (carbonate-shelf benches, the baked red paleosol line, the Lesser Throne\'s welded ignimbrite with its fiamme, the tibasalt flows)',
  x:T.xzOf(0,T.TS(0))[0],z:T.xzOf(0,T.TS(0))[1],y:T.C(-400)-6,r:420,h:T.sheet+40,kind:'rock',tags:{rock:['carbonate-shelf','outland-tuff','tibasalt'],feature:'exposure'}});
 REGISTER({name:T.TUBE.name+' ('+T.TUBE.id+'): the drawn section, 450 m of a 38 km tube in the tibasalt',x:V.x,z:V.z,y:V.floor-3,r:240,h:T.TUBE.h+30,kind:'cavern',
  tags:{id:T.TUBE.id,rock:'tibasalt',state:'buried_vault'}});
 REGISTER({name:VA.name+' ('+VA.id+'; LORE.md 6.15): the original monastery of the Monks of History, buried under the Lesser Throne\'s welded ignimbrite',
  x:V.x,z:V.z,y:V.floor-2,r:VA.rx+4,h:VA.h+6,kind:'cavern',tags:{id:VA.id,culture:'history-monks',use:['archive','salvage']}});
 REGISTER({name:SKY.name,x:SKY.x,z:SKY.z,y:V.floor-2,r:SKY.r+SKY.rim+2,h:gS-V.floor+10,kind:'feature',tags:{id:SKY.id,of:T.TUBE.id}});
 REGISTER({name:'The breakdown cone (the fallen roof under the skylight)',x:SKY.x,z:SKY.z,y:V.floor-1,r:16,h:9,kind:'feature'});
 REGISTER({name:'The contact springs (perched on the baked paleosol at the cliff\'s foot; they feed the terrace cisterns)',x:T.xzOf(20,T.TS(20)-T.G+3)[0],z:T.xzOf(20,T.TS(20)-T.G+3)[1],
  y:T.C(-400)-4,r:400,h:30,kind:'feature',tags:{water:'spring'}});
 REGISTER({name:'The megabreccia spur (slump blocks of the Inner Wall, standing above the sheet)',x:SITE.knolls[0].x,z:SITE.knolls[0].z,y:T.ramp(-120)+20,r:110,h:80,kind:'rock',tags:{rock:'megabreccia'}});
 // ---------------------------------------------------------------- THE FAR COUNTRY OUT OF THE MAP
 // 82's lattice (KFAR, 110 m cells) runs under the whole map 25 m below terrainH at its nodes; across this gully (90 m deep, 190 m wide) its flat cells
 // stood over the gully's floor. Inside the map's square the ground covers everything, so the lattice's cells wholly inside it are dropped here
 if(typeof FAR!=='undefined'&&FAR&&FAR.mesh&&FAR.mesh.geometry){const g=FAR.mesh.geometry,p=g.attributes.position,E=TERR.R-.5,inside=i=>Math.abs(p.getX(i))<E&&Math.abs(p.getZ(i))<E;
  if(g.index){const a=g.index.array,keep=[];for(let i=0;i<a.length;i+=3)if(!(inside(a[i])&&inside(a[i+1])&&inside(a[i+2])))keep.push(a[i],a[i+1],a[i+2]);
   TIGX.farDropped=(a.length-keep.length)/3;g.setIndex(keep);}
  else{const n=p.count,keep=[];for(let i=0;i<n;i+=3)if(!(inside(i)&&inside(i+1)&&inside(i+2)))keep.push(i,i+1,i+2);TIGX.farDropped=(n-keep.length)/3;g.setIndex(keep);}}
 // ---------------------------------------------------------------- THE NEAR PATCH
 const PATCH=(function(){if(!GROUND)return null;const g=GROUND.geometry,p=g.attributes.position,N=720,SX=TERR.X1-TERR.X0,cs=SX/N,SUB=4,fc=cs/SUB;
  const R0={s0:-420,s1:440,t0:-310,t1:270},inR=(x,z)=>{const s=T.sOf(x,z),t=T.tOf(x,z);return s>R0.s0&&s<R0.s1&&t>R0.t0&&t<R0.t1;};
  const sel=new Uint8Array(N*N);let I0=N,I1=0,J0=N,J1=0;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(inR(TERR.X0+(i+.5)*cs,TERR.Z0+(j+.5)*cs)){sel[j*N+i]=1;I0=Math.min(I0,i);I1=Math.max(I1,i+1);J0=Math.min(J0,j);J1=Math.max(J1,j+1);}}
  const S_=(i,j)=>i>=0&&j>=0&&i<N&&j<N&&sel[j*N+i]===1,vi=(i,j)=>j*(N+1)+i,P3=k=>[p.getX(k),p.getY(k),p.getZ(k)];
  // the coarse ground without the patch's cells
  {const old=g.index.array,keep=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(sel[j*N+i])continue;const o=6*(j*N+i);for(let q=0;q<6;q++)keep.push(old[o+q]);}
   g.setIndex(new THREE.BufferAttribute(new Uint32Array(keep),1));}
  // the patch's nodes: on its rim, on the coarse edges (the coarse vertices as drawn, lerped); inside, the ground's own height
  const NI=(I1-I0)*SUB+1,NJ=(J1-J0)*SUB+1,id=new Int32Array(NI*NJ).fill(-1),pos=[],uv=[],gl=[];
  const holeR=SKY.r+1.1;   /* right at the shaft's rock lip, so the camp's textured ground comes up to the well */
  const node=(a,b)=>{const k=b*NI+a;if(id[k]>=0)return id[k];const fi=I0*SUB+a,fj=J0*SUB+b,ri=fi%SUB,rj=fj%SUB,ci=(fi-ri)/SUB,cj=(fj-rj)/SUB;let q=null;
   if(ri===0&&rj===0){if(!(S_(ci-1,cj-1)&&S_(ci,cj-1)&&S_(ci-1,cj)&&S_(ci,cj)))q=P3(vi(ci,cj));}
   else if(ri===0){if(S_(ci-1,cj)!==S_(ci,cj)){const A=P3(vi(ci,cj)),B=P3(vi(ci,cj+1)),f=rj/SUB;q=[mix(A[0],B[0],f),mix(A[1],B[1],f),mix(A[2],B[2],f)];}}
   else if(rj===0){if(S_(ci,cj-1)!==S_(ci,cj)){const A=P3(vi(ci,cj)),B=P3(vi(ci+1,cj)),f=ri/SUB;q=[mix(A[0],B[0],f),mix(A[1],B[1],f),mix(A[2],B[2],f)];}}
   if(!q){let x=TERR.X0+fi*fc,z=TERR.Z0+fj*fc;const half=fc*.58,ds=Math.hypot(x-SKY.x,z-SKY.z);
    if(Math.abs(ds-holeR)<half&&ds>1){const sc=holeR/ds;x=SKY.x+(x-SKY.x)*sc;z=SKY.z+(z-SKY.z)*sc;}
    else{const sr=streamNear(x,z);if(sr&&sr.d>=.5){const e=sr.w+3.85;if(Math.abs(sr.d-e)<half){const pa=STREAM.P[sr.i],pb=STREAM.P[sr.i+1],nx=pa[0]+(pb[0]-pa[0])*sr.f,nz=pa[1]+(pb[1]-pa[1])*sr.f,sc=e/sr.d;x=nx+(x-nx)*sc;z=nz+(z-nz)*sc;}}}
    q=[x,terrainH(x,z),z];}
   id[k]=pos.length/3;pos.push(q[0],q[1],q[2]);uv.push((q[0]-TERR.X0)/SX,1-(q[2]-TERR.Z0)/(TERR.Z1-TERR.Z0));const w=STATION_GL(q[0],q[2]);gl.push(w[0],w[1],w[2]);return id[k];};
  const iG=[],iS=[];let hole=0;
  for(let cj=J0;cj<J1;cj++)for(let ci=I0;ci<I1;ci++){if(!sel[cj*N+ci])continue;
   for(let b=0;b<SUB;b++)for(let a=0;a<SUB;a++){const A=(ci-I0)*SUB+a,B=(cj-J0)*SUB+b,cx=TERR.X0+((ci*SUB+a)+.5)*fc,cz=TERR.Z0+((cj*SUB+b)+.5)*fc;
    if(Math.hypot(cx-SKY.x,cz-SKY.z)<holeR){hole++;continue;}   /* the skylight's well: the cavern draws its lip */
    const n00=node(A,B),n10=node(A+1,B),n01=node(A,B+1),n11=node(A+1,B+1);
    const y00=pos[n00*3+1],y10=pos[n10*3+1],y01=pos[n01*3+1],y11=pos[n11*3+1],sl=Math.max(Math.abs(y10-y00),Math.abs(y11-y01),Math.abs(y01-y00),Math.abs(y11-y10))/fc;
    const L=sl>1.05&&FIELD.spur(cx,cz)<.4?iS:iG;L.push(n00,n01,n10,n01,n11,n10);}}
  const P=new THREE.BufferAttribute(new Float32Array(pos),3),all=new THREE.BufferGeometry();all.setAttribute('position',P);all.setIndex(iG.concat(iS));all.computeVertexNormals();
  const NRM=all.attributes.normal,UVA=new THREE.BufferAttribute(new Float32Array(uv),2),GLA=new THREE.BufferAttribute(new Float32Array(gl),3);
  const gG=new THREE.BufferGeometry();gG.setAttribute('position',P);gG.setAttribute('normal',NRM);gG.setAttribute('uv',UVA);gG.setAttribute('aGL',GLA);gG.setIndex(iG);gG.computeBoundingSphere();
  const mG=new THREE.Mesh(gG,GROUND.material);if(g.attributes.aKGAO&&KGROUND.cavityMesh)KGROUND.cavityMesh(mG);
  mG.userData.probeSkip=true;mG.userData.inspectLabel='The Tiguantin gully (ground, the near patch)';mG.receiveShadow=true;scene.add(mG);
  // THE COLUMN on the steep: KSTRATA's colour on the ground's grain, lifted slightly in the mist so the shaded tibasalt flows read, and mossed at the lip
  const mS=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.84,metalness:0});
  if(S){mS.onBeforeCompile=sh=>{S.inject(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',
   '#include <color_fragment>\n {vec3 sc=max(strataColor(vSWP,vSWN)*1.35+vec3(0.014,0.015,0.017),vec3(0.0));diffuseColor.rgb=mix(sc,vec3(0.055,0.085,0.038),smoothstep(0.42,0.72,clamp(vSWN.y,0.0,1.0))*0.85);}');};mS.customProgramCacheKey=()=>'tig-column';}
  else mS.color.set(0xb8a888);
  const gS2=new THREE.BufferGeometry();gS2.setAttribute('position',P);gS2.setAttribute('normal',NRM);gS2.setIndex(iS);gS2.computeBoundingSphere();
  const mC=new THREE.Mesh(gS2,mS);mC.userData.host=true;mC.userData.rock=true;mC.userData.probeSkip=true;
  mC.userData.inspectLabel='The gully\'s walls: carbonate-shelf benches, the baked red paleosol, the Lesser Throne\'s welded ignimbrite (fiamme), tibasalt flows (KSTRATA)';scene.add(mC);
  TIGX.patch={nodes:pos.length/3,ground:iG.length/3,steep:iS.length/3,holeCells:hole,coarseDropped:sel.reduce((a,b)=>a+b,0),cell:fc,origin:[TERR.X0,TERR.Z0]};
  return{mG,mC,fc,holeR};})();
 // ---------------------------------------------------------------- THE TUBE AND THE VAULT (KCAVERN)
 const D=T.D,nD=[-D[1],D[0]];
 const C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:1.5,chunk:24,seed:KRAND.hash(W,92,1,0xCA7E),minRock:.8});TIGX.C=C;
 const tubeAt=u=>{const x=V.x+D[0]*u,z=V.z+D[1]*u;return[x,T.ramp(T.sOf(x,z))+3.5,z];};
 {const pts=[];for(let u=T.TUBE.from;u<T.TUBE.to;u+=30)pts.push(tubeAt(u));pts.push(tubeAt(T.TUBE.to));
  for(let i=1;i<pts.length;i++)C.tube({id:T.TUBE.id+'#'+i,owner:'tiguantin',pts:[pts[i-1],pts[i]],w:T.TUBE.w,h:T.TUBE.h,spring:.45,ledge:{v:4,d:1.2},blend:4,rock:'basalt',finish:'raw'});}
 C.hall({id:VA.id,owner:'tiguantin',c:[V.x,V.floor,V.z],rx:VA.rx,rz:VA.rz,h:VA.h,belly:.22,blend:6});
 C.shaft({id:SKY.id,owner:'tiguantin',c:[SKY.x,SKY.z],y0:V.floor+10,y1:gS+8,r0:SKY.r+1.5,r1:SKY.r});
 C.opening({id:SKY.id+':well',c:[SKY.x,SKY.z],r:SKY.r,rim:SKY.rim,kind:'well'});
 const CONE=[];{for(let k=0;k<4;k++){const r=13-k*3.1,top=V.floor+1.4+k*1.6,poly=[];for(let a=0;a<10;a++){const q=a/10*TAU+k*.3,rr=r*(.85+.3*U(k,a,1,0xB1));poly.push([SKY.x+Math.cos(q)*rr,SKY.z+Math.sin(q)*rr]);}
  CONE.push({r,top});C.monolith({id:'breakdown-'+k,owner:'tiguantin',poly,y0:V.floor-2,y1:top,taper:.15,cap:1.2,block:false});}}
 C.build();
 const floorAt=(x,z,y0)=>{for(let y=y0+6;y>y0-10;y-=.25){if(C.sdf(x,y,z)<=0)return y+.25;}return null;};
 // the lanterns: on the ropes (below), on posts by the racks and the cells, at the cone; the twelve brightest light the rock
 const LAMPS=TIGX.lamps;
 // the winches round the lip (three, a third of the circle apart, the first toward the gully)
 const WIN=[];{const a0=Math.atan2(V.z-SKY.z,V.x-SKY.x)+Math.PI;for(let k=0;k<3;k++){const a=a0+k*TAU/3+(U(k,0,2,0xA1)-.5)*.4,c=Math.cos(a),s=Math.sin(a);
  const foot=[SKY.x+c*(SKY.r+3.2),SKY.z+s*(SKY.r+3.2)],apex=[SKY.x+c*(SKY.r-1.6),SKY.z+s*(SKY.r-1.6)],gy=terrainH(foot[0],foot[1]);
  const coneTop=V.floor+1.4+CONE.length*1.6-1;WIN.push({a,c,s,foot,apex,gy,top:gy+6.8,ropeTo:Math.max(coneTop,floorAt(apex[0],apex[1],V.floor+4)||V.floor)});}}
 WIN.forEach((w,k)=>{for(let y=w.top-4;y>w.ropeTo+2;y-=7)LAMPS.push([w.apex[0],y,w.apex[1],'rope']);});
 // ---------------------------------------------------------------- the vault's floor: the First Monastery's cells and the archive's racks
 const CELLS=[],RACKS=[];
 {const ax=[1,0];for(let k=0;k<6;k++){const cx=V.x-42+k*15,row=k%2?1:-1,cz=V.z+row*13;if(Math.hypot(cx-SKY.x,cz-SKY.z)<20)continue;
   const y=floorAt(cx,cz,V.floor);if(y==null)continue;CELLS.push({x:cx,z:cz,y,w:7,d:5.5,door:row});}
  for(let k=0;k<8;k++){const rx=V.x-40+k*11,rz=V.z+(k%2?27:-27),y=floorAt(rx,rz,V.floor);if(y==null||Math.hypot(rx-SKY.x,rz-SKY.z)<18)continue;RACKS.push({x:rx,z:rz,y,side:k%2?1:-1});}}
 CELLS.forEach(c=>LAMPS.push([c.x,c.y+2.2,c.z,'cell']));RACKS.forEach(r=>LAMPS.push([r.x,r.y+2.6,r.z-r.side*1.6,'rack']));
 REGISTER({name:'The First Monastery\'s cells ('+CELLS.length+'), fallen to their footings and waist-high walls on the vault\'s floor',x:V.x,z:V.z,y:V.floor-1,r:VA.rx,h:6,kind:'structure',tags:{culture:'history-monks',state:'ruin',age:'pre-Cataclysm'}});
 REGISTER({name:'The archive\'s racks ('+RACKS.length+'): brass-leaf chronicles and vellum rolls of the First Monastery',x:V.x,z:V.z,y:V.floor-1,r:VA.rx,h:6,kind:'structure',tags:{culture:'history-monks',use:'archive',loot:['brass-leaf chronicles','vellum rolls']}});
 REGISTER({name:'The History Monks\' rope-winches (3) on the skylight\'s lip, from Longsong (LORE.md 6.15)',x:SKY.x,z:SKY.z,y:gS-2,r:SKY.r+12,h:12,kind:'structure',tags:{culture:'history-monks',use:['salvage','descent']}});
 REGISTER({name:'Brass survey lanterns ('+LAMPS.length+') on the ropes and in the vault',x:V.x,z:V.z,y:V.floor-1,r:VA.rx+10,h:gS-V.floor+10,kind:'structure',tags:{culture:'history-monks'}});
 // ---------------------------------------------------------------- the cave's light (godstep's rille: the skylight, the sun's patch through it, the lanterns, the eye's lamp)
 const NL=12,lampsV=LAMPS.slice().sort((a,b)=>(a[3]==='rope')-(b[3]==='rope')).slice(0,NL).map(p=>new THREE.Vector3(p[0],p[1],p[2]));while(lampsV.length<NL)lampsV.push(new THREE.Vector3(0,-1e6,0));
 const UC={uHole:{value:new THREE.Vector3(SKY.x,SKY.z,PATCH?PATCH.holeR:SKY.r+SKY.rim)},uCell:{value:new THREE.Vector3(TERR.X0,TERR.Z0,PATCH?PATCH.fc:2)},uLamps:{value:lampsV},
  uOpen:{value:new THREE.Vector4(SKY.x,gS,SKY.z,SKY.r)},uSun:{value:new THREE.Vector3(.4,.8,.3)},uSunC:{value:new THREE.Color(1,1,1)},uSky:{value:new THREE.Color(.5,.55,.6)},uHead:{value:0},uEye:{value:new THREE.Vector3()}};
 tick(()=>{const d=sun.position.clone().normalize();UC.uSun.value.copy(d);UC.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);UC.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity*1.2);
  UC.uHead.value=camera.position.y<terrainH(camera.position.x,camera.position.z)-2?1:0;UC.uEye.value.copy(camera.position);});   /* the eye as a uniform (check_source CAMPOS) */
 const SU=S?S.uniforms:{};
 const vs=(S?S.parsVertex:'')+'\nattribute float aGnd;varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;\n'+
  'void main(){vec3 transformed=position;vec3 objectNormal=normal;\n#ifdef USE_INSTANCING\nmat4 mm=modelMatrix*instanceMatrix;\n#else\nmat4 mm=modelMatrix;\n#endif\n'+
  'vec4 w=mm*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(mm)*normal);\n#ifdef USE_COLOR\nvOcc=color.r;\n#else\nvOcc=1.0;\n#endif\nvG=aGnd;\n'+(S?S.vertex:'')+'\ngl_Position=projectionMatrix*viewMatrix*w;}';
 const fs=(S?S.parsFragment:'')+'\nuniform vec3 uHole;uniform vec3 uCell;uniform vec3 uLamps['+NL+'];uniform vec4 uOpen;uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uSky;uniform float uHead;uniform vec3 uEye;'+
  'varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;'+
  'void main(){'+
  /* THE SEAM: the near patch snaps its ring onto holeR; the cavern's ground tucks 1.35 m under it via polygonOffset so no corner cell shows sky */
  'if(vG>0.5&&length(vW.xz-uHole.xy)>=uHole.z+1.35)discard;'+
  'vec3 n=normalize(vN);vec3 c=vec3(0.0);'+
  'for(int i=0;i<'+NL+';i++){vec3 l=uLamps[i]-vW;float d=length(l);c+=vec3(1.0,0.72,0.42)*max(dot(n,l/d)*0.8+0.2,0.0)*70.0/(d*d+40.0);}'+
  '{vec3 l=uOpen.xyz-vW;float d=length(l);float R=uOpen.w;c+=uSky*max(dot(n,l/d),0.0)*R*R/(d*d+R*R)*5.0*vOcc;}'+
  '{float t=(uOpen.y-vW.y)/max(uSun.y,0.05);vec2 p=vW.xz+uSun.xz*t-uOpen.xz;float lit=(1.0-smoothstep(uOpen.w*0.85,uOpen.w,length(p)))*step(0.0,t)*step(0.05,uSun.y);c+=uSunC*max(dot(n,uSun),0.0)*lit*1.6;}'+
  'c=mix(c,uSunC*max(dot(n,uSun),0.0)+uSky*(0.55+0.45*n.y),vG);'+
  'vec3 e=uEye-vW;float de=length(e);vec3 v=e/de;c+=uHead*vec3(0.95,0.95,1.0)*max(dot(n,v),0.0)*90.0/(de*de+30.0);'+
  (S?'vec3 base=strataColor(vW,n);':'vec3 base=vec3(0.06,0.055,0.055);')+
  'base=mix(base,vec3(0.09,0.07,0.045),vG*smoothstep(0.55,0.85,n.y));'+   /* the well's rim ground: the camp's trodden earth (83's paint), not the rock's pale dust */
  'vec3 col=(base*(c*mix(vOcc,1.0,vG)+0.008))*1.8;col=col/(1.0+col*0.35);gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}';
 const caveM=new THREE.ShaderMaterial({uniforms:Object.assign({},SU,UC),vertexShader:vs,fragmentShader:fs,vertexColors:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
 caveM.userData.noHorizon=true;
 let caveTris=0;
 {const R=KCAVERN.drawRock(C,{THREE,material:caveM,tile:64,attrs:['aGnd'],weight:(x,y,z,nx,ny,nz,ch,i,out)=>{out[0]=ch.ground[i];},color:oc=>[oc,oc,oc],
   label:'tube_lesser_06\'s rock: the tibasalt flows over the welded tuff (KCAVERN, coloured by the column)',name:'tube_lesser_06'});
  R.group.children.forEach(m=>{m.userData.cavern=true;m.userData.probeSkip=true;});scene.add(R.group);TIGX.meshes.push(R.group);caveTris=R.tris;}
 // ---------------------------------------------------------------- THE TERRACES (records, then the stones)
 const ST={blocks:[],fallen:[],kerb:[]},CH=.5;
 const quarry=k=>{if(!S||!S.strata)return[.86,.82,.72];const b=S.strata.bedAt(T.ZONES.paleosol-2-22*U(k,7,3,0x51));return b&&b.colour?b.colour:[.86,.82,.72];};
 const WALLS=[];
 for(let k=1;k<=T.nTer;k++){const runs=[];let cur=null;
  for(let par=0;par<2;par++){const ds=1.2;for(let s=T.WIN.s0+70+par*ds/2;s<T.WIN.s1-70;s+=ds){
   const hl=T.C(s)-k*T.riser,hu=hl+T.riser,dF=T.dvAt(s,hl+.78*T.riser)-.5,dB=T.dvAt(s,hu)+.7;if(!(dF>28&&dB<T.G))continue;
   const tF=T.TS(s)-dF,tB=T.TS(s)-dB,tm=(tF+tB)/2,P0=T.xzOf(s-ds/2,T.TS(s-ds/2)-(dF+dB)/2),P1=T.xzOf(s+ds/2,T.TS(s+ds/2)-(dF+dB)/2),c=T.xzOf(s,tm);
   if(T.terraceK(s,tm,tm-T.TS(s))<.97)continue;
   const ax=P1[0]-P0[0],az=P1[1]-P0[1],len=Math.hypot(ax,az),yaw=Math.atan2(-az,ax),dep=dB-dF;
   const fa=T.xzOf(s-ds/2,tF),fb=T.xzOf(s+ds/2,tF),yb=Math.min(terrainH(fa[0],fa[1]),terrainH(fb[0],fb[1]),hl)-.35;
   // the ruin: stretches fallen low (a slow noise along the wall), the top courses gone here and there, gaps to the footing
   const n=BIO.fn.fbm(s*.018+k*7.1,k*3.3,6620+k,2),gap=n<.33,cut=gap?99:(U(Math.round(s*10),k,par,0xC0)<.3?1:0)+(n<.45?2:0);
   const i0=Math.floor(yb/CH),i1=Math.ceil((hu+.15)/CH)-1;
   for(let i=i0;i<=i1;i++){if(i%2!==par)continue;const keepTo=gap?i0:i1-cut;if(i>keepTo)continue;
    const y0=i===i0?yb:i*CH,y1=(i+1)*CH,col=quarry(Math.round(s*7)+i*13+k*101),mo=i>=keepTo-0?.3:0,dm=i-i0<2?.15:0;
    ST.blocks.push({x:c[0],y:(y0+y1)/2,z:c[1],sx:len+.02,sy:y1-y0,sz:dep,yaw:yaw+(U(i,k,Math.round(s*10),0xC1)-.5)*.03,col,mo,dm,k});}
   // what fell: on the tread below, seated on its lowest points
   if((gap||cut>=1)&&U(Math.round(s*10),k,par,0xC2)<.45){const nF=1+(U(Math.round(s*10),k,par,0xC3)<.4?1:0);
    for(let f=0;f<nF;f++){const away=1.6+3.2*U(Math.round(s*10),k,f,0xC4),tt=tF+away,sx=.7+.5*U(f,k,Math.round(s*10),0xC5),sy=.42+.12*U(f,k,Math.round(s*10),0xC6),sz=.6+.5*U(f,k,Math.round(s*10),0xC7);
     const pp=T.xzOf(s+(U(f,k,Math.round(s*10),0xC8)-.5)*1.4,tt);ST.fallen.push({x:pp[0],z:pp[1],sx,sy,sz,yaw:U(f,k,Math.round(s*10),0xC9)*TAU,tx:(U(f,k,Math.round(s*10),0xCA)-.5)*.6,tz:(U(f,k,Math.round(s*10),0xCB)-.5)*.6,col:quarry(f*31+k*7+Math.round(s))});}}}}
  WALLS.push(k);}
 // the cisterns: four basins on the bench and the first tread where the springs run, kerbed in the same stone
 const CIST=[];{for(let q=0;q<4;q++){const s=-260+q*170+40*(U(q,0,0,0xD1)-.5),lvl=q%2?1:0,h=T.C(s)-lvl*T.riser,dv=lvl?T.dvAt(s,h+.4*T.riser):T.G-T.bench*.45,t=T.TS(s)-dv,c=T.xzOf(s,t);
   const a=Math.atan2(T.xzOf(s+1,t)[1]-c[1],T.xzOf(s+1,t)[0]-c[0]),w=4.2,d=2.4,yg=terrainH(c[0],c[1]);CIST.push({x:c[0],z:c[1],y:yg,a,w,d,level:yg+.32,name:'A terrace cistern (fed by the contact springs)'});}}
 TIGX.CISTERNS=CIST;
 CIST.forEach(c=>{const ca=Math.cos(c.a),sa=Math.sin(c.a),P=(u,v)=>[c.x+ca*u-sa*v,c.z+sa*u+ca*v];   /* kerb stones round the basin */
  for(let u=-c.w/2;u<c.w/2;u+=.8)[-1,1].forEach(sd=>{const p=P(u+.4,sd*(c.d/2+.2));ST.kerb.push({x:p[0],y:c.y+.2,z:p[1],sx:.8,sy:.62,sz:.4,yaw:-c.a});});
  for(let v=-c.d/2;v<c.d/2;v+=.8)[-1,1].forEach(sd=>{const p=P(sd*(c.w/2+.2),v+.4);ST.kerb.push({x:p[0],y:c.y+.2,z:p[1],sx:.4,sy:.62,sz:.8,yaw:-c.a});});});
 REGISTER({name:'The Tiguantin cloud-terraces: four drystone walls of carbonate-shelf ashlar (Ancient), half-exhumed from the Lesser Throne\'s ignimbrite, broken and fallen in stretches',
  x:T.xzOf(20,T.TS(20)-52)[0],z:T.xzOf(20,T.TS(20)-52)[1],y:T.C(-400)-T.riser*T.nTer-2,r:330,h:T.riser*T.nTer+30,kind:'structure',tags:{culture:'ancients',state:'ruin',material:'carbonate-shelf ashlar',feature:'cloud-terraces'}});
 CIST.forEach(c=>REGISTER({name:c.name,x:c.x,z:c.z,y:c.y-1,r:3.5,h:3,kind:'structure',tags:{culture:'ancients',state:'ruin',water:'cistern'}}));
 // ---------------------------------------------------------------- the stones drawn
 const rockTex=NHL.ROCKTEX||null,stoneM=new THREE.MeshStandardMaterial({color:0xffffff,map:rockTex,roughness:.9,metalness:0});
 const box=new THREE.BoxGeometry(1,1,1),M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),V3=new THREE.Vector3(),SC=new THREE.Vector3(),CL=new THREE.Color();
 const MOSSC=new THREE.Color(0x5a7a34),DAMP=new THREE.Color(0x6a6458);
 const inst=(L,label,mat,set)=>{if(!L.length)return null;const im=new THREE.InstancedMesh(box,mat,L.length);L.forEach((b,i)=>{set(b,i);im.setMatrixAt(i,M4);im.setColorAt(i,CL);});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel=label;return im;};
 const TERR_G=new THREE.Group();TERR_G.name='The Tiguantin cloud-terraces';
 {const im=inst(ST.blocks,'A terrace wall (Ancient drystone: carbonate-shelf ashlar)',stoneM,(b)=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));
   CL.setRGB(b.col[0],b.col[1],b.col[2]).convertSRGBToLinear().lerp(MOSSC,b.mo).lerp(DAMP,b.dm);});if(im)TERR_G.add(im);}
 {const im=inst(ST.kerb,'A cistern\'s kerb (carbonate-shelf ashlar)',stoneM,(b)=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));CL.set(0xc8bea4).convertSRGBToLinear().lerp(MOSSC,.25);});if(im)TERR_G.add(im);}
 // the fallen stones: seated on their lowest points (core/ruins: the ground under the box's corners and centre; |R1j| s_j / 2 above it, 8 cm sunk)
 {const RM=new THREE.Matrix4();ST.fallen.forEach(b=>{E.set(b.tx,b.yaw,b.tz);Qt.setFromEuler(E);RM.makeRotationFromQuaternion(Qt);const e=RM.elements,
   hx=(Math.abs(e[0])*b.sx+Math.abs(e[4])*b.sy+Math.abs(e[8])*b.sz)/2,hy=(Math.abs(e[1])*b.sx+Math.abs(e[5])*b.sy+Math.abs(e[9])*b.sz)/2,hz=(Math.abs(e[2])*b.sx+Math.abs(e[6])*b.sy+Math.abs(e[10])*b.sz)/2;
   const g=Math.min(terrainH(b.x,b.z),terrainH(b.x-hx,b.z-hz),terrainH(b.x+hx,b.z-hz),terrainH(b.x-hx,b.z+hz),terrainH(b.x+hx,b.z+hz));b.y=g+hy-.08;b.q=Qt.clone();});
  const im=inst(ST.fallen,'A fallen stone from the terrace wall above',stoneM,(b)=>{M4.compose(V3.set(b.x,b.y,b.z),b.q,SC.set(b.sx,b.sy,b.sz));CL.setRGB(b.col[0],b.col[1],b.col[2]).convertSRGBToLinear().lerp(MOSSC,.35);});if(im)TERR_G.add(im);}
 scene.add(TERR_G);TIGX.meshes.push(TERR_G);
 KRUINS.watch(TERR_G,{name:'The Tiguantin cloud-terraces',ground:(x,z)=>terrainH(x,z)});
 // ---------------------------------------------------------------- the vault's works drawn (records above)
 const VAULT_G=new THREE.Group();VAULT_G.name='The First Monastery\'s cells';const CB=[];
 CELLS.forEach((c,ci)=>{const segs=[];const hw=c.w/2,hd=c.d/2;
  // four walls as runs of stones; a doorway in the wall facing the vault's aisle; each run fallen to its own height (the footing course always)
  [[-hw,-hd,hw,-hd],[hw,-hd,hw,hd],[hw,hd,-hw,hd],[-hw,hd,-hw,-hd]].forEach((L,wi)=>{const len=Math.hypot(L[2]-L[0],L[3]-L[1]),nB=Math.max(2,Math.round(len/.9)),ax=(L[2]-L[0])/len,az=(L[3]-L[1])/len;
   const hRun=.5+2*U(ci,wi,0,0xE1);for(let b=0;b<nB;b++){const f=(b+.5)/nB,x=c.x+L[0]+(L[2]-L[0])*f,z=c.z+L[1]+(L[3]-L[1])*f;
    const doorWall=(c.door<0&&wi===2)||(c.door>0&&wi===0);if(doorWall&&Math.abs(f-.5)<.18)continue;
    const g=floorAt(x,z,c.y);if(g==null)continue;const nC=Math.max(1,Math.round((hRun*(.6+.8*U(ci,wi,b,0xE2)))/CH));
    for(let i=0;i<nC;i++)CB.push({x,y:g-.25+(i+.5)*CH+(i===0?-.0:0),z,sx:len/nB+.02,sy:i===0?CH+.0:CH,sz:.6,yaw:Math.atan2(-az,ax),col:quarry(ci*97+wi*13+b*3+i)});}});});
 {const im=inst(CB,'The First Monastery: a cell\'s wall (carbonate-shelf ashlar, fallen)',stoneM,(b)=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));
   CL.setRGB(b.col[0],b.col[1],b.col[2]).convertSRGBToLinear().multiplyScalar(.8);});if(im)VAULT_G.add(im);}
 scene.add(VAULT_G);TIGX.meshes.push(VAULT_G);
 KRUINS.watch(VAULT_G,{name:'The First Monastery\'s cells (cav_monks_archive)',ground:(x,z)=>{const y=floorAt(x,z,V.floor);return y==null?V.floor:y;}});
 // the racks: stone shelving (standing), the chronicles' brass leaves and the vellum rolls on them
 const RK=[],LEAF=[],ROLL=[];RACKS.forEach((r,ri)=>{const yaw=r.side>0?Math.PI:0;RK.push({x:r.x,y:r.y+1.15,z:r.z,sx:3.4,sy:2.3,sz:.8,yaw});
  for(let sh=0;sh<3;sh++){const y=r.y+.45+sh*.7;for(let i=0;i<9;i++){const u=-1.5+i*.37,x=r.x+u,z=r.z-r.side*.25;if(U(ri,sh,i,0xF1)<.55)LEAF.push({x,y:y+.17,z,sx:.03,sy:.34,sz:.42,yaw:yaw+(U(ri,sh,i,0xF2)-.5)*.3});else ROLL.push({x,y:y+.06,z,sx:.42,sy:.12,sz:.12,yaw});}}});
 const rackM=new THREE.MeshStandardMaterial({color:0xffffff,map:rockTex,roughness:.92});
 {const G2=new THREE.Group();G2.name='The archive\'s racks';
  const a=inst(RK,'A stone rack of the First Monastery\'s archive',rackM,b=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));CL.set(0x8a8478).convertSRGBToLinear();});if(a)G2.add(a);
  const brass=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.85,emissive:0x2a1a06});
  const l=inst(LEAF,'Brass-leaf chronicles (the First Monastery\'s, what the History Monks come for)',brass,b=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));CL.set(0xc89a48).convertSRGBToLinear();});if(l)G2.add(l);
  const v=inst(ROLL,'Vellum rolls',new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8}),b=>{E.set(0,b.yaw,0);Qt.setFromEuler(E);M4.compose(V3.set(b.x,b.y,b.z),Qt,SC.set(b.sx,b.sy,b.sz));CL.set(0xe0d4b4).convertSRGBToLinear();});if(v)G2.add(v);
  scene.add(G2);TIGX.meshes.push(G2);}
 // ---------------------------------------------------------------- the winches, the ropes and the lanterns
 {const G3=new THREE.Group();G3.name='The History Monks\' rope-winches';const TIM=[],ROPE=[],cyl=new THREE.CylinderGeometry(1,1,1,7);cyl.translate(0,.5,0);
  const beam=(a,b,r,L)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);L.push({a,len,r,q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/len,dy/len,dz/len))});};
  WIN.forEach(w=>{const lat=[-w.s,w.c],A=[w.apex[0],w.top,w.apex[1]];
   [-1.6,1.6].forEach(o=>{const f=[w.foot[0]+lat[0]*o,0,w.foot[1]+lat[1]*o];f[1]=terrainH(f[0],f[2])-.4;beam(f,A,.13,TIM);});   /* the shear legs, footed in the ground */
   const back=[w.foot[0]+w.c*6.5,0,w.foot[1]+w.s*6.5];back[1]=terrainH(back[0],back[2])-.3;beam(back,A,.07,TIM);              /* the back stay to its stake */
   const wd=[w.foot[0]+w.c*2.4,0,w.foot[1]+w.s*2.4];const gw=terrainH(wd[0],wd[2]);
   [-1.1,1.1].forEach(o=>beam([wd[0]+lat[0]*o,gw-.3,wd[2]+lat[1]*o],[wd[0]+lat[0]*o,gw+1.1,wd[2]+lat[1]*o],.1,TIM));                   /* the windlass's posts */
   beam([wd[0]-lat[0]*1.1,gw+.95,wd[2]-lat[1]*1.1],[wd[0]+lat[0]*1.1,gw+.95,wd[2]+lat[1]*1.1],.22,TIM);                                /* its drum */
   beam([wd[0],gw+.95,wd[2]],A,.025,ROPE);beam([w.apex[0],w.ropeTo,w.apex[1]],A,.025,ROPE);});                                       /* the rope over the head, down to the cone */
  const put=(L,label,col)=>{const im=new THREE.InstancedMesh(cyl,new THREE.MeshStandardMaterial({color:col,roughness:.85}),L.length);
   L.forEach((b,i)=>{M4.compose(V3.set(b.a[0],b.a[1],b.a[2]),b.q,SC.set(b.r,b.len,b.r));im.setMatrixAt(i,M4);});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel=label;G3.add(im);};
  put(TIM,'A rope-winch of the History Monks (shear legs, back stay, windlass)',0x6a5034);put(ROPE,'A winch rope (down the skylight to the breakdown cone)',0xb8a47a);
  // the lanterns: brass cages with a flame (additive), on the ropes, by the racks and the cells
  const lg=new THREE.BoxGeometry(.28,.38,.28),la=new THREE.InstancedMesh(lg,new THREE.MeshStandardMaterial({color:0xb08a40,metalness:.8,roughness:.4,emissive:0xffa040,emissiveIntensity:.9}),LAMPS.length);
  LAMPS.forEach((p,i)=>{M4.makeTranslation(p[0],p[1],p[2]);la.setMatrixAt(i,M4);});la.instanceMatrix.needsUpdate=true;la.frustumCulled=false;la.userData.host=true;la.userData.inspectLabel='A brass survey lantern of the History Monks';G3.add(la);
  scene.add(G3);TIGX.meshes.push(G3);}
 // the probe's points for what is ground or merged rock (the patch, the cavern's tiles are probe-skipped): each record is seen to hold something
 {const o=new THREE.Object3D(),pp=[];const at=(s,t,dy)=>{const q=T.xzOf(s,t);pp.push(q[0],terrainH(q[0],q[1])+(dy||0),q[1]);};
  for(let s=-380;s<=380;s+=95){at(s,T.TS(s)-T.G-6,3);at(s,T.TS(s)+T.G+6,3);at(s,T.TS(s)-T.G+3,.5);}
  for(let u=T.TUBE.from+20;u<T.TUBE.to;u+=60){const p=tubeAt(u);pp.push(p[0],p[1]+2,p[2]);}
  pp.push(V.x,V.floor+2,V.z,SKY.x,V.floor+3,SKY.z,SKY.x,gS-4,SKY.z,SITE.knolls[0].x,terrainH(SITE.knolls[0].x,SITE.knolls[0].z)-2,SITE.knolls[0].z);
  o.userData.probePoints=pp;o.userData.host=true;scene.add(o);}
 TIGX.counts={patch:TIGX.patch,caveTris,chunks:C.chunks.length,walls:ST.blocks.length,fallen:ST.fallen.length,kerb:ST.kerb.length,cisterns:CIST.length,cells:CELLS.length,cellStones:CB.length,
  racks:RACKS.length,leaves:LEAF.length,rolls:ROLL.length,winches:WIN.length,lamps:LAMPS.length,ms:Math.round(performance.now()-t0)};
 window._tiguantin=TIGX.counts;})();
