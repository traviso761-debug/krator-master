// ================================================================= IZIZ CITY — the evening, the weather and the street dressing (round 5)
// Binds the shared atmosphere module (core/atmos/, ATMOS) to the city and places its pieces. Everything here is a CALL
// into the module with the city's positions; the module itself knows nothing of Iziz. Runs after 90b (all placed and
// baked) and before the views. Order: street furniture, the evening lights, the glow over the city's own lamps,
// particles, weather, the dressing on buildings, the sewer, then finish (bake + glow) and the culling pass.
reseed(SEED_CITY+50);
ATMOS.init({THREE,scene,camera,hour:()=>CITYSKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:SEED_CITY+50,err:reportErr});
const CITY_ATM={t0:performance.now()};
// the top of whatever stands at (x,z): a ray down through the scene, ignoring the ground, the jungle and the module's own
function cityTopAt(x,z,from){const rc=new THREE.Raycaster(new THREE.Vector3(x,from||400,z),new THREE.Vector3(0,-1,0),0,1000);
 const objs=scene.children.filter(o=>o!==groundM&&!(o.userData&&(o.userData.probeSkip||o.userData.biome))&&o.name!=='atmos'&&!(o.name||'').startsWith('biome'));
 const h=rc.intersectObjects(objs,true).find(q=>!(q.object.userData&&(q.object.userData.probeSkip||q.object.userData.biome)));return h?h.point.y:null;}
const cityClear=(x,z,r)=>insideWall(x,z,18)&&!isRoad(x,z)&&!inPrecinct(x,z,0)&&occFree({x,z,hx:r||.5,hz:r||.5,ry:0},.3);
// ---------------------------------------------------------------- 1. street furniture: lamps on the gate roads and thoroughfares, banners, planters, fountains
{let n=0;for(const R of ROADS){const z=R.zone||'';if(!(z.startsWith('gate:')||z==='thoroughfare'))continue;
  const row=ATMOS.lampRow(R.pts,{off:R.w/2+1.6,step:z==='thoroughfare'?20:16,ok:(x,zz)=>cityClear(x,zz,.5)});n+=row.length;
  row.forEach((q,i)=>{if(i%2)return;const px=q[0]+q[4]*4,pz=q[1]+q[5]*4;if(cityClear(px,pz,1.3))ATMOS.planter(px,pz,-Math.atan2(q[5],q[4]));});}
 CITY_ATM.lamps=n;}
{const BAN=[0xe07a2a,0x9c2d2d,0x2f8f8a];for(const g of GATES){const R=wallR(g)-30;for(let k=0;k<3;k++){const r=R-6-k*14;for(const sd of[-1,1]){const x=r*Math.cos(g)-sd*10.5*Math.sin(g),z=r*Math.sin(g)+sd*10.5*Math.cos(g);
  if(cityClear(x,z,.6))ATMOS.banner(x,z,g,BAN[k]);}}}}
{const sites=PARKS.map(p=>[p.x,p.z,4]);for(const k of['temple','arena']){const H=HILL[k],g=H.gate,r=k==='temple'?40:68;sites.push([H.x+r*Math.cos(g),H.z+r*Math.sin(g),3.5,H.top]);}
 let n=0;for(const s of sites){const y=s[3]!=null?s[3]:terrainH(s[0],s[1]);if(!occFree({x:s[0],z:s[1],hx:s[2]+1,hz:s[2]+1,ry:0},.5))continue;const f=ATMOS.fountain(s[0],s[1],{r:s[2],y});occAdd({x:s[0],z:s[1],hx:f.r,hz:f.r,ry:0});
  REG.push({name:'Fountain',x:f.x,y:f.y,z:f.z,r:f.r,h:f.h,cls:'furniture',key:'atmos_fountain',tags:{culture:'iziz-vernacular',type:['fountain'],place:'outdoor',wealth:'civic',lit:true}});n++;}CITY_ATM.fountains=n;}
// ---------------------------------------------------------------- 2. the evening: arena floods, temple braziers, wall searchlights, palace sky beams, gate spots, the spaceport
{const ar=REG.find(r=>r.tags&&r.tags.role==='arena');if(ar){const top=ar.y+ar.h;[0,2.1,4.2].forEach((t,k)=>ATMOS.floodLight(ar.x+38*Math.cos(t),top+8,ar.z+31*Math.sin(t),{on:17.05+k*.12,off:22.25+k*.1}));}}
{const te=REG.find(r=>r.tags&&r.tags.role==='temple');if(te){const top=cityTopAt(te.x,te.z);if(top!=null){let k=0;for(const [dx,dz] of[[-3,3],[3,3],[-3,-3],[3,-3]]){const y=cityTopAt(te.x+dx,te.z+dz);if(y!=null&&Math.abs(y-top)<8){ATMOS.brazier(te.x+dx,y,te.z+dz,{on:17.45+k*.08,off:29.9-k*.06});k++;}}
  const L=new THREE.PointLight(0xffa050,0,60,1.8);L.position.set(te.x,top+6,te.z);ATMOS.add(L);ATMOS.hook((t,h)=>{L.intensity=1.2*ATMOS.litAt(h,17.45,29.9);});CITY_ATM.braziers=k;}}}
{let n=0;const towers=REG.filter(r=>r.key==='iziz_wall_tower');towers.forEach((r,i)=>{if(i%3)return;const t=Math.atan2(r.z,r.x);if(GATES.some(g=>angDiff(t,g)<.2))return;
  ATMOS.sweepBeam(r.x,terrainH(r.x,r.z)-3+48.5,r.z,{heading:t,on:17.9+n*.07,off:29.7-n*.05});n++;});CITY_ATM.searchlights=n;}
{const H=HILL.palace,g=H.gate,gx=Math.cos(g),gz=Math.sin(g),ry=Math.atan2(gx,gz),cx=H.x-20*gx,cz=H.z-20*gz;[[-42,-36],[42,-36],[-42,36],[42,36]].forEach((c,k)=>{const p=loc(cx,cz,c[0],c[1],ry);
  ATMOS.sweepBeam(p[0],H.top+14.6,p[1],{sky:true,on:18.3+k*.06,off:29.4+k*.05,len:260,rad:7});});}
{let n=0;GATES.forEach((g,gi)=>{const R=wallR(g);for(const sd of[-1,1]){const x=(R+2)*Math.cos(g)-sd*20*Math.sin(g),z=(R+2)*Math.sin(g)+sd*20*Math.cos(g),top=cityTopAt(x,z);
  const y=(top!=null&&top>CITY.PLATEAU)?top+1.2:CITY.PLATEAU+40;const dir=[Math.cos(g)*60-sd*8*Math.sin(g),-35,Math.sin(g)*60+sd*8*Math.cos(g)];
  ATMOS.spotCone(x,y,z,dir,{on:17.75+gi*.06+(sd>0?.025:0),off:29.8-gi*.04});n++;}});CITY_ATM.gateSpots=n;}
{let best=null;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const x=SPORT.x+i*22,z=SPORT.z+j*22,y=cityTopAt(x,z);if(y!=null&&(!best||y>best[1]))best=[x,y,z];}
 if(best)ATMOS.beacon(best[0],best[1]+1.5,best[2]);for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;ATMOS.lamp(SPORT.x+70*Math.cos(t),SPORT.z+70*Math.sin(t),{h:22,glow:12,y:CITY.SPACEPORT_H,on:17.35+k*.07,off:29.75+k*.04});}}
// the city's own lamps get glow sprites too: the vernacular bulbs, the lamp columns, the transplants' and the palace's lamps
{let n=0;const take=(item,col,size,max)=>{const it=KIT.items[item]||[];const step=Math.max(1,Math.ceil(it.length/max));for(let i=0;i<it.length;i+=step){const p=it[i].p;ATMOS.glowAdd(p[0],p[1],p[2],col,size,-1);n++;}};
 take('vBulb',[1,.82,.45],3.2,2500);take('izGlow',[1,.85,.5],6,400);take('lampI',[1,.8,.4],4,800);CITY_ATM.cityGlows=n;}
// ---------------------------------------------------------------- 3. particles: chimney smoke, steam at the spaceport, fireflies, the moat's mist, fog banks
{const src=(window.CHIMNEYS||[]).slice(0,260);for(let k=0;k<3;k++){const a=k*2.1;src.push([SPORT.x+28*Math.cos(a),CITY.SPACEPORT_H+3,SPORT.z+28*Math.sin(a),1]);}ATMOS.smoke(src);CITY_ATM.smoke=src.length;}
{const c=[];for(const p of PARKS)for(let k=0;k<6;k++){const a=k/6*TAU,r=p.r*.6;c.push([p.x+r*Math.cos(a),terrainH(p.x+r*Math.cos(a),p.z+r*Math.sin(a)),p.z+r*Math.sin(a)]);}
 for(const R of RUIN_RECTS)c.push([R.x,terrainH(R.x,R.z),R.z]);for(let k=0;k<70;k++){const t=k/70*TAU,r=wallR(t)+rr(70,130),x=r*Math.cos(t),z=r*Math.sin(t);c.push([x,terrainH(x,z),z]);}
 ATMOS.fireflies(c,{n:6,spread:6});}
ATMOS.mistRing(t=>wallR(t),{inner:8,outer:40,y0:CITY.CHASM+7.5,y1:CITY.CHASM+13});
{const pts=[];for(let i=0;i<700;i++){const t=rng()*TAU,r=Math.sqrt(rng())*(wallR(t)+30),x=r*Math.cos(t),z=r*Math.sin(t);pts.push([x,Math.max(terrainH(x,z),CITY.CHASM+7),z]);}ATMOS.fogBank(pts);}
// ---------------------------------------------------------------- 4. weather: what it does to the city's own scene (fog, sun, the wet ground, a lightning flash)
{const g0=new THREE.Color(1,1,1),gWet=new THREE.Color(.72,.72,.74);
 ATMOS.weather({apply:W=>{scene.fog.density=.00034*(1+4*W.fog+1.8*W.rain);sun.intensity*=1-.55*W.rain-.3*W.fog;if(cityHemi)cityHemi.intensity+=W.flash*1.4;
  if(groundM){groundM.material.roughness=.96-.5*W.wet;groundM.material.color.copy(g0).lerp(gWet,W.wet);}}});}
// ---------------------------------------------------------------- 5. dressing: ivy on walls, cisterns on flat roofs, window boxes under the vernacular panes
{const idx=ATMOS.boxIndex(Object.keys(KIT.meshes).filter(n=>!/Win|Dark|boxD|Cloth|Tarp|Flag|Crop|Fence|Post|Sheet|Board|Plate|Sign|Pipe|Rope|Iron|Bulb|slab|strip|dot|cell|mull/i.test(n)).map(n=>KIT.meshes[n]),{minSize:2});
 let n=0;for(const v of VERN_PLACED){const o=v.o,D=VERN.defs[v.key],w=D&&D.tags.wealth;n+=ATMOS.dressBuilding(idx,{x:o.x,z:o.z,y:terrainH(o.x,o.z),R:Math.max(o.hx,o.hz),ry:o.ry},{ivy:w==='poor'?.22:w==='rich'?.45:.32,cistern:w==='rich'?.15:.35});}
 for(const o of OCC.list){if(!o.built||!/^trans_/.test(o.built))continue;n+=ATMOS.dressBuilding(idx,{x:o.x,z:o.z,y:terrainH(o.x,o.z),R:Math.max(o.hx,o.hz),ry:o.ry||0},{ivy:.25,cistern:.4});}
 CITY_ATM.dressed=n;ATMOS.windowBoxesOnPanes(KIT.meshes.vWinLit,{p:.28});ATMOS.windowBoxesOnPanes(KIT.meshes.vWinGlass,{p:.18});}
// ---------------------------------------------------------------- 6. the sewer: a grated drain down a belt lane in the north, an inlet at the wall's foot, the outfall
// in the wall's outer face with its grate, and a trickle down the moat's bank to the water
{const n=Math.round(TAU*(CITY.R+10)/52),want=257*Math.PI/180,i0=Math.round((want-.013)/TAU*n);
 // the belt lane near 257 deg that lies furthest from a wall tower (izOuterWall: a tower every 6th of its segments)
 const nw=Math.round(216*CITY.WALL_K),towerGap=t=>{let d=1e9;for(let k=0;k<nw;k+=6)d=Math.min(d,angDiff(t,k/nw*TAU));return d;};
 let t=null,bestD=-1;for(let i=i0-3;i<=i0+3;i++){const tt=i/n*TAU+.013,d=towerGap(tt);if(d>bestD&&!GATES.some(g=>angDiff(tt,g)<.25)){bestD=d;t=tt;}}
 const R=wallR(t),c=Math.cos(t),s=Math.sin(t),rin=coreR(t)-20+5,rout=R-6.5;const pts=[];for(let r=rin;r<=rout;r+=2)pts.push([r*c,r*s]);ATMOS.drain(pts,{w:1.3});
 const iy=terrainH((R-5.3)*c,(R-5.3)*s);ATMOS.inletGrate((R-5.3)*c,iy,(R-5.3)*s,Math.atan2(-c,-s),{});
 // the wall's rock foundation stands 1.5 m proud of its face (izOuterWall: wb+3 wide, its top 2.75 m under the wall line's
 // ground), so the outfall is built out on the foundation's face, its floor on the foundation's top or the bank, whichever is higher
 const ro=R+6.6,fy=Math.max(terrainH(R*c,R*s)-2.75,terrainH((ro+1)*c,(ro+1)*s))+.1,f=ATMOS.outfall(ro*c,fy,ro*s,Math.atan2(c,s),{lean:0,waterY:CITY.CHASM+7});
 REG.push({name:'Sewer outfall',x:f.x,y:f.y-2,z:f.z,r:f.r,h:f.h,cls:'building',key:'atmos_outfall',tags:{culture:'iziz-old',type:['infrastructure'],wealth:'civic',lit:false}});
 REG.push({name:'Drain channel (grated)',x:(rin+rout)/2*c,y:terrainH((rin+rout)/2*c,(rin+rout)/2*s),z:(rin+rout)/2*s,r:(rout-rin)/2,h:1.5,cls:'furniture',key:'atmos_drain',tags:{culture:'iziz-old',type:['infrastructure'],place:'outdoor',wealth:'civic'}});
 CITY_ATM.sewer={x:f.x|0,z:f.z|0,bearing:Math.round(t*180/Math.PI),drain:pts.length};}
// ---------------------------------------------------------------- 7. bake, glow, cull
ATMOS.finish();
ATMOS.cull(scene,{keep:m=>!!m.userData.biome,pad:2});
CITY_ATM.ms=Math.round(performance.now()-CITY_ATM.t0);window._atmos=Object.assign({},CITY_ATM,{stats:ATMOS.stats});
