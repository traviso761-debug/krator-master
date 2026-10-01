// ================================================================= YS CITY — the layout as DATA (PLAN.md P3 step 3; no geometry here)
// The old city is ONE square lattice, pitch 200 m, rotated 12 degrees, anchored on the head of the bay: it starts on
// the land quarter and runs straight on under the water to ~800 m beyond the shoreline (DESIGN §2). The shore crosses
// it diagonally, so a street is dry, then awash, then a canal, then open water between towers. Every block gets a
// kind from the sink (land, awash, canal, open), a use (a landmark by name, a harbour, the market, the foreign quarter,
// industry, aquaculture, farms, neighbourhoods, or a drowned block's host or home-grown mole), a wealth ring about the
// Amphitriton, and the drowned 75/25 split. The placer (88) reads this and nothing else decides where things go.
// Prototyped in Python first (NOTES.md phase 3) and ported here number for number.
const LAYOUT={P:200,TH:12*Math.PI/180,HEAD:CITY.HEAD,blocks:[],by:{},A:null,N:null,T:null,U:null,V:null,landmarks:{}};
LAYOUT.U=[Math.cos(LAYOUT.TH),Math.sin(LAYOUT.TH)];LAYOUT.V=[-Math.sin(LAYOUT.TH),Math.cos(LAYOUT.TH)];
// the old city plane by signed shore distance: the natural land inland, the sink at sea (1.5 degrees plus a 4 m step)
function ysPlaneY(s){if(s>=0){if(s<60){const t=s/60;return .5+3.2*t*t*(3-2*t);}return 3.7+(s-60)*.018;}
 const d=-s;const st=clamp((d-260)/80,0,1);return 1-d*.026-4*st*st*(3-2*st);}
function ysKindOf(y){return y>1?'land':y>-1.2?'awash':y>-6?'canal':'open';}
function ysBlockXZ(i,j){const U=LAYOUT.U,V=LAYOUT.V,P=LAYOUT.P;return [LAYOUT.HEAD[0]+U[0]*i*P+V[0]*j*P,LAYOUT.HEAD[1]+U[1]*i*P+V[1]*j*P];}
function ysBlockIJ(x,z){const U=LAYOUT.U,V=LAYOUT.V,P=LAYOUT.P;const dx=x-LAYOUT.HEAD[0],dz=z-LAYOUT.HEAD[1];return [(dx*U[0]+dz*U[1])/P,(dx*V[0]+dz*V[1])/P];}
function ysBlock(i,j){return LAYOUT.by[i+','+j]||null;}
function ysHash(i,j){let h=2166136261;const s=i+','+j;for(let k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;}
(function layout(){
 // the shore tangent at the head (south -> north-east along the polyline) and the seaward normal
 let best=null;const P=CITY.SHORE;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);
  const t=clamp(((LAYOUT.HEAD[0]-ax)*dx+(LAYOUT.HEAD[1]-az)*dz)/(L*L),0,1);const d=Math.hypot(LAYOUT.HEAD[0]-(ax+dx*t),LAYOUT.HEAD[1]-(az+dz*t));if(!best||d<best.d)best={d,t:[dx/L,dz/L]};}
 const T=best.t;let N=[-T[1],T[0]];if(ysShoreDist(LAYOUT.HEAD[0]+N[0]*200,LAYOUT.HEAD[1]+N[1]*200)>0)N=[T[1],-T[0]];LAYOUT.T=T;LAYOUT.N=N;
 const gstep=v=>{const du=v[0]*LAYOUT.U[0]+v[1]*LAYOUT.U[1],dv=v[0]*LAYOUT.V[0]+v[1]*LAYOUT.V[1];return Math.abs(du)>Math.abs(dv)?[du>0?1:-1,0]:[0,dv>0?1:-1];};
 const sN=gstep(N),sT=gstep(T);LAYOUT.sN=sN;LAYOUT.sT=sT;
 for(let i=-9;i<=9;i++)for(let j=-9;j<=9;j++){const c=ysBlockXZ(i,j);if(Math.abs(c[0])>1500||Math.abs(c[1])>1500)continue;const s=ysShoreDist(c[0],c[1]);if(s>820||s<-800)continue;
  const y=ysPlaneY(s);const b={i,j,x:c[0],z:c[1],s,y,kind:ysKindOf(y),use:null,tag:null};LAYOUT.blocks.push(b);LAYOUT.by[i+','+j]=b;}
 const lineDist=(x,z)=>Math.abs((x-LAYOUT.HEAD[0])*N[1]-(z-LAYOUT.HEAD[1])*N[0]);
 const drowned=LAYOUT.blocks.filter(b=>b.kind==='canal'||b.kind==='open');
 const A=drowned.reduce((m,b)=>{const sc=Math.abs(b.s+450)+.5*lineDist(b.x,b.z);return (!m||sc<m.sc)?{b,sc}:m;},null).b;A.use='amphitriton';A.tag='A';LAYOUT.A=A;
 const set=(i,j,use,tag)=>{const b=ysBlock(i,j);if(b&&!b.use){b.use=use;b.tag=tag;return b;}return null;};
 const ai=A.i,aj=A.j;
 set(ai-sN[0],aj-sN[1],'temple_tides','B');set(ai+sT[0],aj+sT[1],'grown_plaza','Pl');set(ai-sN[0]+sT[0],aj-sN[1]+sT[1],'library','Lib');
 // the seaward edge: drowned blocks with nothing drowned beyond them; the Winds on the +T side of A's line, the Pharos on the -T side
 const edge=LAYOUT.blocks.filter(b=>b.kind!=='land'&&!ysBlock(b.i+sN[0],b.j+sN[1]));const tside=b=>(b.x-A.x)*T[0]+(b.z-A.z)*T[1];
 const Db=edge.filter(b=>tside(b)>60).sort((a,b)=>tside(a)-tside(b))[0];if(Db)set(Db.i,Db.j,'temple_winds','D');
 const Pb=edge.filter(b=>tside(b)<-60).sort((a,b)=>tside(b)-tside(a))[0];if(Pb)set(Pb.i,Pb.j,'pharos','Ph');
 set(ai-sT[0]*3,aj-sT[1]*3,'citadel','E');
 for(const m of [1,2])set(ai-sN[0]*m-sT[0],aj-sN[1]*m-sT[1],'military_harbour','MH');set(ai-sN[0]*2-sT[0]*2,aj-sN[1]*2-sT[1]*2,'wet_cells','WC');
 set(0,0,'main_market','M');for(const m of [1,2])set(-sT[0]*m,-sT[1]*m,'civilian_harbour','CH');set(-sT[0]*3,-sT[1]*3,'fishing_docks','FD');
 set(-sT[0]*4,-sT[1]*4,'river_mouth','R');set(-sT[0]*5,-sT[1]*5,'headland_military','Bk');
 for(const m of [1,2])for(const q of [-1,0,1])set(-sN[0]*m+sT[0]*q,-sN[1]*m+sT[1]*q,'foreign','FQ');
 for(const m of [1,2,3]){set(-sN[0]-sT[0]*m,-sN[1]-sT[1]*m,'industry','I');set(-sN[0]+sT[0]*m,-sN[1]+sT[1]*m,'industry','I');}
 for(const m of [3,4,5,6])for(let n=0;n<4;n++){const b=ysBlock(sT[0]*m+sN[0]*n,sT[1]*m+sN[1]*n);if(b&&b.kind!=='land'){set(b.i,b.j,'aquaculture','Aq');break;}}
 // the rest: wealth by distance from A (wider rings on land), neighbourhoods and farms, hosts and home-grown moles (75/25)
 for(const b of LAYOUT.blocks){const d=Math.hypot(b.x-A.x,b.z-A.z);b.dA=d;const L=b.kind==='land';b.wealth=d<(L?520:300)?'rich':d<(L?900:620)?'middle':'poor';
  if(b.use)continue;
  if(L){b.use=b.s>560?'farm':'neighbourhood';b.tag=b.use==='farm'?'f':'n';}
  else{const r=ysHash(b.i,b.j);b.use=r<.75?'host':'homegrown';b.tag=r<.75?'H':'g';if(b.use==='host')b.host=b.kind==='open'?'tall':b.kind==='canal'?'mid':'low';}}
 for(const b of LAYOUT.blocks)if(b.use&&!/^(host|homegrown|neighbourhood|farm|foreign|industry|aquaculture)$/.test(b.use))LAYOUT.landmarks[b.use]=b;
})();
// the sink under the drowned grid: the old city plane where the grid lies, blended into the natural seabed over the
// grid's outer streets. Read by YS_NAT (84-city-geo.js) through this hook.
function ysSinkMix(x,z){const g=ysBlockIJ(x,z);const i=Math.round(g[0]),j=Math.round(g[1]);const b=ysBlock(i,j);if(!b||b.kind==='land')return 0;
 let w=1;const fx=g[0]-i,fz=g[1]-j;   // fractional position in the block, -.5..+.5
 for(const [di,dj,f] of [[1,0,.5-fx],[-1,0,.5+fx],[0,1,.5-fz],[0,-1,.5+fz]]){const nb=ysBlock(i+di,j+dj);if(!nb||nb.kind==='land')w=Math.min(w,clamp(f*LAYOUT.P/40,0,1));}
 return w*w*(3-2*w);}
function ysSinkY(x,z){return ysPlaneY(ysShoreDist(x,z));}
// counters for the probe and _api.city
function ysLayoutCensus(){const c={blocks:LAYOUT.blocks.length,kinds:{},uses:{},drowned:0,hosts:0,homegrown:0};
 for(const b of LAYOUT.blocks){c.kinds[b.kind]=(c.kinds[b.kind]||0)+1;c.uses[b.use]=(c.uses[b.use]||0)+1;if(b.kind!=='land'){c.drowned++;if(b.use==='host')c.hosts++;if(b.use==='homegrown')c.homegrown++;}}
 c.A=LAYOUT.A?[Math.round(LAYOUT.A.x),Math.round(LAYOUT.A.z),Math.round(LAYOUT.A.s)]:null;return c;}

// ---------------------------------------------------------------- the layout overlay (CITY.LAYOUT_DEBUG): a quad per block, named blocks labelled
const LAYOUT_COL={land:0xd9c9a1,awash:0xbfe3e8,canal:0x6fb7cf,open:0x2f6f9a,amphitriton:0xffd700,temple_tides:0xff9ad5,library:0xffb347,grown_plaza:0xc3f7a3,temple_winds:0xff9ad5,pharos:0xffffff,
 citadel:0xe07b39,military_harbour:0x9aaaaa,wet_cells:0x555555,main_market:0xff6b6b,civilian_harbour:0x8888aa,fishing_docks:0x8888aa,river_mouth:0x44aadd,headland_military:0xbb5555,foreign:0xd9b3ff,industry:0xaa6688,aquaculture:0x77ffdd,farm:0x99cc66};
const LAYOUT_NAMES={amphitriton:'The Amphitriton',temple_tides:'Temple of the Tides',library:'Library of Ys',grown_plaza:'The grown plaza',temple_winds:'Temple of the Winds',pharos:'The Pharos',citadel:"The Archon's Citadel",military_harbour:'Military harbour',wet_cells:'The Wet Cells',main_market:'Main market',civilian_harbour:'Civilian harbour',fishing_docks:'Fishing docks',river_mouth:'River mouth',headland_military:'The headland: barracks',foreign:'Foreign quarter',industry:'Industry',aquaculture:'Aquaculture pens'};
const YS_BUILD=[];   // the city's build hooks (the scene runs them after the terrain, before the bake); 88 pushes the placer
function ysLayoutOverlay(on){on=!!on;if(window._layoutMesh)window._layoutMesh.visible=on;return on;}
YS_BUILD.push(function(scene){   // built always (a few hundred quads), shown when CITY.LAYOUT_DEBUG or by the Layout button
 const pos=[],col=[],idx=[];const U=LAYOUT.U,V=LAYOUT.V,h=LAYOUT.P*.46;let n=0;
 for(const b of LAYOUT.blocks){const c=new THREE.Color(LAYOUT_COL[b.use]||LAYOUT_COL[b.kind]);const y=Math.max(terrainH(b.x,b.z),0)+.8;
  for(const [du,dv] of [[-1,-1],[1,-1],[1,1],[-1,1]]){pos.push(b.x+U[0]*du*h+V[0]*dv*h,y,b.z+U[1]*du*h+V[1]*dv*h);col.push(c.r,c.g,c.b);}
  idx.push(n,n+2,n+1,n,n+3,n+2);n+=4;
  }   // (no REG entries for the overlay: the labels pack shows buildings only, and an empty volume would fail the probe; the names are in LAYOUT_NAMES for the placer)
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.78,side:THREE.DoubleSide,depthWrite:false,fog:false}));m.renderOrder=3;m.visible=!!CITY.LAYOUT_DEBUG;m.userData.probeSkip=true;scene.add(m);window._layoutMesh=m;
 window._layout=ysLayoutCensus();});
