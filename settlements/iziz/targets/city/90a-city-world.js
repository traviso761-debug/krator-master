// ================================================================= IZIZ CITY — the world: terrain, moat, sky, the wall, the three hills' landmarks
// Runs after 90-scene (renderer/scene/camera/lights exist; the showcase block was skipped because window.CITY).
reseed(SEED_CITY+5);
const CITY_T0=performance.now();
// ---------------------------------------------------------------- terrain: one plane, 4 m cells, the painted albedo
const CITYSKY={hour:15.6,day:200,dens:1.5};
// (built at the END of 90b, once every placement has levelled its plot with cityFlat)
function cityTerrainMesh(){const N=Math.round(CITY.WORLD/4);const g=new THREE.PlaneGeometry(CITY.WORLD,CITY.WORLD,N,N);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,terrainH(lx,-ly));}   // local y -> world -z after the -90° X rotation
 g.computeVertexNormals();
 const tex=new THREE.CanvasTexture(gcv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.96,metalness:0});
 groundM=new THREE.Mesh(g,m);groundM.rotation.x=-Math.PI/2;groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 window._terrainTex=tex;}
// the moat water: an annulus just above the chasm floor
{const n=240,pos=[],idx=[];for(let i=0;i<=n;i++){const t=i/n*TAU,R=wallR(t);pos.push((R+6)*Math.cos(t),CITY.CHASM+7,(R+6)*Math.sin(t),(R+44)*Math.cos(t),CITY.CHASM+7,(R+44)*Math.sin(t));}
 for(let i=0;i<n;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const w=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x1a3532,roughness:.18,metalness:.15,transparent:true,opacity:.9,side:THREE.DoubleSide}));w.userData.probeSkip=true;w.name='moat';scene.add(w);}
// ---------------------------------------------------------------- the Krator sky and its lighting
KratorSky.attach(scene,5000);
scene.fog.density=.00034;
const cityHemi=scene.children.find(o=>o.isHemisphereLight);
function citySkyTick(){KratorSky.update(camera.position,CITYSKY.hour,CITYSKY.day,CITYSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(cityHemi)cityHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);
 if(typeof BIO!=='undefined'&&BIO.host)BIO.setSun([L.sunDir.x,L.sunDir.y,L.sunDir.z]);
 // the window schedule (Round 1 issue: lit panes read as bright glazing by day): electric panes and bulbs are glass in
 // daylight and glow from dusk; the Ancients' lights (MAT.dot: strips, lamps) dim by day
 const day=clamp(L.dayF,0,1);MAT.warmPane.color.copy(CITY_GLOW.pane).lerp(CITY_GLOW.paneDay,day);MAT.bulb.color.copy(CITY_GLOW.bulb).lerp(CITY_GLOW.bulbDay,day);
 if(MAT.dot)MAT.dot.color.setScalar(1-.45*day);}
const CITY_GLOW={pane:new THREE.Color(0xffcf8a),paneDay:new THREE.Color(0x5a5244),bulb:new THREE.Color(0xfff3d6),bulbDay:new THREE.Color(0xb8b0a0)};
FRAME_HOOKS.push(citySkyTick);for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
citySkyTick();
// ---------------------------------------------------------------- the outer wall, the gates and their bridges
TSTAT.cur='iziz_wall/0';
izOuterWall(scene,wallR,0,0,Math.round(216*CITY.WALL_K),26,10,7,t=>GATES.some(g=>angDiff(t,g)<.105),6);
TSTAT.cur='iziz_gate/0';
GATES.forEach((g,i)=>{izGate(scene,g,wallR(g),CITY.PLATEAU,i);const R=wallR(g);BIO_OBSTACLES.push({x:(R+62)*Math.cos(g),z:(R+62)*Math.sin(g),r:30});});
// ---------------------------------------------------------------- the palace hill: palace (old Iziz), Ancient curtain wall, barracks, the triumphal statue
{const H=HILL.palace,g=H.gate,gx=Math.cos(g),gz=Math.sin(g),top=H.top;
 TSTAT.cur='trans_palace/0';
 TRANS.place(scene,'palace','orig',H.x-20*gx,H.z-20*gz,Math.atan2(gx,gz),1,SEED_CITY+11,{role:'palace',wealth:'civic'},top);
 occAdd({x:H.x-20*gx,z:H.z-20*gz,hx:53,hz:48,ry:Math.atan2(gx,gz)});
 // the grand entrance on the base tier (built by the palace builder, 78-transplant.js): its own inspector volume
 REG.push({name:'Palace — grand entrance',x:H.x+25*gx,y:top,z:H.z+25*gz,r:13,h:17,cls:'building',key:'iziz_palace_entrance',tags:{culture:'iziz-old',type:['civic'],wealth:'civic',lit:true,role:'palace entrance',place:'outdoor'}});
 TSTAT.cur='iziz_curtain/0';
 izCurtainWall(scene,t=>84,H.x,H.z,72,14,[g],9,null);
 // two barracks blocks inside the curtain, either side of the court, doors to the palace; drill yard between them and the wall
 for(const [k,a] of[[1,g+1.32],[2,g-1.32]]){const bx=H.x+64*Math.cos(a),bz=H.z+64*Math.sin(a);izBarracks(bx,bz,a,k);occAdd({x:bx,z:bz,hx:17,hz:9,ry:Math.atan2(-Math.cos(a),-Math.sin(a))});}
 TSTAT.cur='iziz_statue/0';
 izStatue(H.x+46*gx,H.z+46*gz,14,2,g+Math.PI,top-.3);   // the orb bearer: raised arms and the orb (Travis)
 for(let k=-1;k<=1;k+=2){const a=g+k*.42;izLampColumn(H.x+60*Math.cos(a),H.z+60*Math.sin(a));izLampColumn(H.x+34*Math.cos(g+k*.75),H.z+34*Math.sin(g+k*.75));}
 REG.push({name:'Triumphal plaza',x:H.x+46*gx,y:top,z:H.z+46*gz,r:30,h:3,cls:'furniture',key:'iziz_plaza',tags:{culture:'iziz-old',type:['plaza'],place:'outdoor',wealth:'civic'}});}
// ---------------------------------------------------------------- the temple hill: the new (Ancients transplant) temple, plaza forward
{const H=HILL.temple,g=H.gate,gx=Math.cos(g),gz=Math.sin(g),top=H.top;
 TSTAT.cur='trans_temple/0';
 TRANS.place(scene,'temple','anc',H.x-18*gx,H.z-18*gz,Math.atan2(gx,gz),.72,SEED_CITY+12,{role:'temple',wealth:'civic'},top);
 occAdd({x:H.x-18*gx,z:H.z-18*gz,hx:44,hz:50,ry:Math.atan2(gx,gz)});   // the stairs run out diagonally past the pyramid's foot
 for(let k=-1;k<=1;k+=2)for(const r of[30,46])izLampColumn(H.x+r*gx+k*14*-gz,H.z+r*gz+k*14*gx);}
// ---------------------------------------------------------------- the arena hill: the new arena, the Ancient amphitheatre (rust, intact) at its foot, the ruined needle
{const H=HILL.arena,g=H.gate,gx=Math.cos(g),gz=Math.sin(g),top=H.top;
 TSTAT.cur='trans_arena/0';
 TRANS.place(scene,'arena','anc',H.x,H.z,Math.atan2(gx,gz),.82,SEED_CITY+13,{role:'arena',wealth:'civic'},top);
 occAdd({x:H.x,z:H.z,hx:56,hz:50,ry:0});
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;izLampColumn(H.x+70*Math.cos(a),H.z+70*Math.sin(a));}
 TSTAT.cur='iziz_needle/0';izNeedle(scene,NEEDLE.x,NEEDLE.z,64);occAdd({x:NEEDLE.x,z:NEEDLE.z,hx:17,hz:17,ry:0});}
// ---------------------------------------------------------------- the escarpments: a crag band on each hill's rock face
// (Round 3 issue: the 4 m terrain cells cannot show a 26-34 m wide, 23-40 m tall S-curve as a cliff; the paint alone read
// as a flat ring on a smooth slope.) A ring surface laid on the face, 2 m cells, pushed out and in by two noise octaves
// into buttresses and crags, lifted a little off the terrain, its board-formed texture running along the contours as
// strata; cut where the ramp climbs.
{const ESC=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x9a8670,roughness:.97,metalness:0,side:THREE.DoubleSide});
 for(const k of HILLKEYS){const H=HILL[k],rm=H.r0+H.E/2,nu=Math.round(TAU*rm/2.2),nv=Math.max(10,Math.round((H.E+4)/2));
  const geo=gridSurface((u,v)=>{const a=u*TAU,r=H.r0-1+v*(H.E+4),bump=Math.sin(Math.PI*v);const n=fbm(a*9+H.x*.01,v*3,7.3,3),cr=fbm(a*33,v*8,5.1,2);
    const dr=((n-.5)*5+(cr-.5)*2.4)*bump,R=r+dr;const x=H.x+R*Math.cos(a),z=H.z+R*Math.sin(a);
    return[x,terrainH(H.x+r*Math.cos(a),H.z+r*Math.sin(a))+.3*bump+(cr-.5)*1.4*bump,z];},nu,nv,{uS:nu/3,vS:(H.E+4)/6,hole:(u,v)=>angDiff(u*TAU,H.gate)*rm<17});
  const m=new THREE.Mesh(geo,ESC);m.name='escarpment:'+k;scene.add(m);TSTAT.by['iziz_escarpment/0']=TSTAT.by['iziz_escarpment/0']||{tris:0,inst:0,meshes:0};TSTAT.by['iziz_escarpment/0'].tris+=geo.index.count/3;TSTAT.by['iziz_escarpment/0'].meshes++;}}
// ---------------------------------------------------------------- the ruined spaceport out along the north-west causeway
TSTAT.cur='iziz_spaceport/0';
izSpaceport(scene,SPORT,CITY.SPACEPORT_A,CITY.SPACEPORT_H);
BIO_OBSTACLES.push({x:SPORT.x,z:SPORT.z,r:CITY.SPACEPORT_RAD+14});
TSTAT.cur=null;
window._worldMs=Math.round(performance.now()-CITY_T0);
