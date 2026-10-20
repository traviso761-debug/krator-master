// ================================================================= HOST — Longsong's water on core/water (and core/atmos)
// [draw] core/water/README.md is the contract: this page names its water and writes no water shader of its own (2026-10-19:
// it had one, and its stream sat at the model's cell levels, which climb and fall along it and clipped into the banks).
//   the Longsong stream   a FLOW down the stage's line on its falling level (45: STREAM, its bed cut by streamCut)
//   the leat, the race     FLOWs down the canal's line on its falling levels (45: CANAL; its stonework 85)
//   the Mirror, the rice pools, the court's reflecting pools, the reservoir, the held fountain's basin
//                          STILL water: one record each (WATER.still), drawn together as one mesh on WATER.stillMaterial
// core/atmos is bound for its clock, its wave chunk and the sky's light, which only the water takes (as sedesert's page:
// the page's own materials keep their lighting). The CPU twins (WATER.heightAt, WATER.flowAt) and core/export carry it.
ATMOS.init({THREE,scene,camera,hour:()=>LS_CLOCK.hour,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5153,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
{const env=new THREE.Scene();env.add(new THREE.Mesh(sky.geometry,sky.material));
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x6a7050)});}
const LSWATER=(function(){const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={flows:[],stills:[]};
 // ---- the flows
 STREAM.forEach(R=>{const pts=R.pts.filter(p=>Math.abs(p[0])<TERR.R&&Math.abs(p[1])<TERR.R).map(p=>[p[0],p[1],p[2]]);if(pts.length<2)return;
  const S=WATER.flow({name:'The Longsong stream ('+R.name+')',pts,width:R.width,speed:1.1});
  const D=WATER.drawFlow(S,{shallow:lin(0x5a7a6a),deep:lin(0x2e4a46),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,step:6,across:6,margin:1.5});
  D.mesh.userData.inspectLabel=S.name;out.flows.push({S,D});});
 for(const [P,w,name] of [[CANAL.leat,CANAL.w,LS.FARMS.LEAT.name],[CANAL.tail,CANAL.wt,LS.FARMS.TAIL.name]]){
  const S=WATER.flow({name,pts:P.map(p=>[p[0],p[1],p[3]]),width:w,speed:.8});
  const D=WATER.drawFlow(S,{shallow:lin(0x6a8a7a),deep:lin(0x3a5650),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:1.5,across:2,margin:.05});
  D.mesh.userData.inspectLabel=name;out.flows.push({S,D});}
 // ---- the still water: the records, then one mesh of them all
 const disc=(x,z,r,n)=>{const P=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2;P.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return P;};
 const add=(name,level,poly)=>{out.stills.push(WATER.still({name,level,poly}));};
 {const P=LS.POND;add(P.name,P.y,disc(P.x,P.z,P.r+3,64));}
 POOLS.cells.forEach((s,i)=>add('A rice pool ('+(i+1)+')',poolLevel(s),[[s.x0,s.z0],[s.x1,s.z0],[s.x1,s.z1],[s.x0,s.z1]]));
 {const C=LS.COURT,y=LS.wardY(C.z);C.pools.forEach((Pq,i)=>add('A reflecting pool of the Chapterhouse Court',y+.24,disc(Pq.x,Pq.z,Pq.r+.25,40)));}
 {const R=LS.RESERVOIR;add(R.name,R.y+5.2,[[R.x-R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z+R.d/2],[R.x-R.w/2,R.z+R.d/2]]);}
 {const F=LS.HELD.fountain;add('The held fountain\'s basin',LS.ROCK.top+.55,disc(F.x,F.z,F.r,32));}
 const pos=[],nor=[],idx=[];
 out.stills.forEach(S=>{const o=pos.length/3,P=S.poly;let cx=0,cz=0;P.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=P.length;cz/=P.length;
  pos.push(cx,S.level,cz);nor.push(0,1,0);P.forEach(p=>{pos.push(p[0],S.level,p[1]);nor.push(0,1,0);});
  for(let k=0;k<P.length;k++)idx.push(o,o+1+(k+1)%P.length,o+1+k);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.computeBoundingSphere();
 const m=WATER.stillMaterial({color:lin(0x2c4a46),roughness:.06,metalness:.12,envMapIntensity:.5});
 const mesh=new THREE.Mesh(g,m);mesh.name='water:still';mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Still water (the Mirror, the rice pools, the court\'s pools, the reservoir, the fountain)';mesh.renderOrder=1;scene.add(mesh);
 out.stillMesh=mesh;return out;})();
_mark('water');

// ---------------------------------------------------------------- the water's checks (verify.py --assert; 64's monasteryChecks calls them)
// water runs downhill: the stream's level never rises downstream, the canal's falls from the intake (under the stream's
// level there) to the pond, every wheel stands in the canal's water, and the stream's banks stand over it
const WCHK={
 falls(L,name){let up=0,worst=0;for(let i=1;i<L.length;i++){const d=L[i]-L[i-1];if(d>1e-6){up++;worst=Math.max(worst,d);}}
  return{ok:L.length>2&&!up,detail:name+': '+L.length+' points, '+(up?up+' rise downstream (worst '+worst.toFixed(2)+' m)':'falling all the way, '+L[0].toFixed(2)+' to '+L[L.length-1].toFixed(2)+' m')};},
 canal(C,intakeY){const L=C.leat.map(p=>p[3]).concat(C.tail.map(p=>p[3])),r=WCHK.falls(L,'the leat and the tail race');
  const ok=r.ok&&C.y0<=intakeY&&C.tail[C.tail.length-1][3]>=C.yP-.01;return{ok,detail:r.detail+'; intake '+C.y0.toFixed(2)+' under the stream\'s '+intakeY.toFixed(2)+'; into the Mirror at '+C.yP};},
 wheels(W){const bad=W.filter(w=>w.dist>.5||w.y-w.r>w.water||w.y-w.r<w.water-.8);
  return{ok:W.length>0&&!bad.length,detail:W.length+' wheels'+(bad.length?'; not in the canal\'s water: '+bad.map(w=>w.id).join(', '):', each on the canal\'s line with its lowest paddles 0.45 m in its water')};},
 banks(){let bad=0,n=0;for(const R of STREAM){const P=R.pts;for(let i=2;i<P.length-2;i+=3){if(Math.abs(P[i][0])>TERR.R-60||Math.abs(P[i][1])>TERR.R-60||LS.inGrounds(P[i][0],P[i][1],30))continue;
   const a=P[i-1],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L,hw=R.width/2+2;n++;
   for(const s of [-1,1])if(terrainH(P[i][0]+nx*hw*s,P[i][1]+nz*hw*s)<P[i][2]-.05){bad++;break;}}}
  return{ok:n>20&&bad/n<.05,detail:n+' sections: the banks over the water in '+(n-bad)+(bad?' ('+bad+' low)':'')};}};
function waterChecks(add){const R=STREAM[0];add('the stream only falls downstream',WCHK.falls(R.pts.map(p=>p[2]),'the stream'));
 add('the canal falls from the stream to the Mirror',WCHK.canal(CANAL,streamNear(CANAL.leat[0][0],CANAL.leat[0][1]).y));
 add('the mills\' wheels stand in the canal\'s water',WCHK.wheels(FARMDRAW.wheels));
 add('the stream\'s banks stand over its water',WCHK.banks());}
function waterNegatives(add){add('a stream that rises downstream (the model\'s own levels)',WCHK.falls(STREAM[0].model,'the model\'s levels'));
 add('a wheel set 3 m off the canal',WCHK.wheels([{id:'off',dist:3,y:0,r:1,water:-.6}]));}
