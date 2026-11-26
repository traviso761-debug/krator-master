// ================================================================= HOST — the cove's own (station 7): the dike's sulphur, the blast's breccia, the bay's boils
// Placed before the one bake (88 calls STATION_BUILD), each from KRAND by index (nothing hangs on draw order), each a registry record first:
//   SULPHUR CHIMNEYS  native sulphur grown round the dike's fumaroles on the rib's crest, yellow to orange, 0.8-3.4 m (the kit's geyserite bead, drawn
//                     tall: one item, one draw call), each a gas hazard
//   EXPLOSION BRECCIA tibasalt blocks the phreatic blast threw out, strewn over the apron, the bench and the rim and awash at the tide line
//   THE BAY'S BOILS   vents in the bay's floor where the sea boils: each core/water's geyser kind as a spouter at the sea's surface (the boiling dome is its
//                     drops) and WATER.drawPlume over it (the steam standing, as on the kit's big columns, 65), leaning in on the sea breeze; each a heat
//                     hazard, and the inner bay's hot water one more
// The skiffs that work the sulphur (the spec's Port Goto trade) are not drawn: KNOWN_ISSUES.md.
function STATION_BUILD(){const U=(i,s)=>KRAND.unit(KRAND.hash(884716,i,s)),G=typeof KHAZ!=='undefined'&&KHAZ.GROUND,out={chimneys:[],blocks:0,vents:[]};
 const prevKit=BIO.kit('geyser'),prevCur=BIO.cur;BIO.cur='cove/station';
 try{const qE=BIO.fn.qEuler,a=DIKE.a,b=DIKE.b,vx=b[0]-a[0],vz=b[1]-a[1],L=Math.hypot(vx,vz),px=-vz/L,pz=vx/L;
  // the dike's rib in the registry: one record a 30 m stretch (the inspector names the rock under the pointer)
  for(let t=0;t<L;t+=30){const x=a[0]+vx/L*(t+15),z=a[1]+vz/L*(t+15);REGISTER({name:DIKE.name,dike:true,ground:true,x,z,y:terrainH(x,z)-5,r:16,h:14});}   /* ground: the rib is the ground mesh (the probe skips it) */
  // SULPHUR CHIMNEYS on the crest, above the water
  const SC=[0xd8c234,0xe0cc48,0xcfa82c,0xc48a2a,0xe8d860];
  for(let i=0;i<60&&out.chimneys.length<14;i++){const t=.04+.82*U(i,1),off=(U(i,2)-.5)*DIKE.w*.6,x=a[0]+vx*t+px*off,z=a[1]+vz*t+pz*off,y=terrainH(x,z);
   if(y<.8||out.chimneys.some(c=>Math.hypot(c.x-x,c.z-z)<4))continue;
   const h=.8+2.6*U(i,3),r=.3+.45*U(i,4),col=SC[i%SC.length];
   REGISTER({name:'A sulphur chimney (native sulphur round a fumarole on the dike)',chimney:out.chimneys.length,x,z,y:y-1,r:r+1.5,h:h+2,
    tags:{hazard:G?G.gasVent(r+3,{danger:.55}):{kind:'gas',danger:.55}}});
   BIO.put('bead',[x,y+h*.42,z],qE((U(i,5)-.5)*.16,U(i,6)*TAU,(U(i,7)-.5)*.16),[r,h*.5,r*(.8+.3*U(i,8))],col);
   for(let k=0;k<3;k++){const an=U(i*5+k,9)*TAU,d=r*(1.2+U(i*5+k,10)),bx=x+Math.cos(an)*d,bz=z+Math.sin(an)*d;   /* the crust round its foot */
    BIO.put('bead',[bx,terrainH(bx,bz)+.03,bz],qE(0,an,0),[.25+.3*U(i*5+k,11),.1,.25+.3*U(i*5+k,12)],SC[(i+k+1)%SC.length]);}
   out.chimneys.push({x,z,y,h,r});}
  // EXPLOSION BRECCIA round the rim's sector (none on the Stair, in the springs, on the geysers' mounds or deep in the bay)
  const BC=[0x1e1d1f,0x25232a,0x2a2826,0x383431,0x433c37,0x2f2b2a];
  for(let i=0;i<900&&out.blocks<170;i++){const br=-150+250*U(i,21),d=RS-8+(RC+70-RS+8)*Math.pow(U(i,22),.8),p=covePt(br,d),x=p[0],z=p[1];
   const{n}=craterN(x,z);if(rimK(n)<.6||stairK(x,z)>.2||terraceMask(x,z)>.05)continue;
   const g=GEYSER.at(x,z);if(g.spring>.01||g.heat>.55||g.terr>.05||g.film>.3)continue;const y=terrainH(x,z);if(y<-1.2)continue;
   const big=U(i,23)<.12,s=big?1.6+1.6*U(i,24):.35+1.1*U(i,24);
   BIO.put('bead',[x,y+s*.22,z],qE(U(i,25)*TAU,U(i,26)*TAU,U(i,27)*TAU),[s*(.8+.4*U(i,28)),s*(.55+.35*U(i,29)),s*(.8+.4*U(i,30))],BC[i%BC.length]);out.blocks++;}
  REGISTER({name:'Explosion breccia (tibasalt blocks the blast threw out)',breccia:true,x:CC[0],z:CC[1],y:-4,r:RC+70,h:60});
  // THE BAY'S BOILS
  const SH=GEYSER.SHOW,BAY_PLUMES=new URLSearchParams(location.search).get('bayplume')!=='0';
  if(SH&&WATER.geyser&&WATER.drawGeyser){const WO={THREE,scene:null,uniforms:SH.U,fog:scene.fog,wind:WIND,mats:new Map(),onMaterial:m=>SH.mats.push(m)};
   BAY_VENTS.forEach((v,i)=>{const S=WATER.geyser({key:'bay:'+v.key,name:v.name,x:v.x,z:v.z,top:SEA+.05,H:2+1.4*U(500+i,1),style:'spouter',pool:3+2*U(500+i,2),wob:i*2.3,world:884716});
    const D=WATER.drawGeyser(S,Object.assign({},WO,{scene,gravity:GEYSER.GRAV}));D.points.userData.inspectLabel=v.name;
    /* the plume always stands (a spouter's steam never stops), so it is raymarched every frame where the showcase's mostly discard at rest: 8 steps,
       not 12; ?bayplume=0 keeps the records and draws none (the software verify: SwiftShader stalled on six standing volumes under a loaded CPU) */
    const po={height:v.H,radius:6+v.H*.22,density:1.3,lean:[WIND[0]*.4,WIND[1]*.4],base:.4,noise:.45};
    const P=!WATER.drawPlume?null:BAY_PLUMES?WATER.drawPlume(S,Object.assign({},WO,{scene,steps:8,plume:po})):{record:S.plume=WATER.plumeOf(S,po)};
    const fl=terrainH(v.x,v.z);
    REGISTER({name:v.name,bay:v.key,x:v.x,z:v.z,y:fl-1,r:14,h:SEA-fl+7,tags:{hazard:{kind:'heat',danger:.85,dose:2.5,shape:{type:'cyl',r:14,h:4,y0:SEA-fl},tell:{sign:'the sea heaving and steaming over the vent'}}}});
    out.vents.push({key:v.key,name:v.name,x:v.x,z:v.z,floor:fl,plume:P?P.record:null,drops:D.count});});
   /* the boils at the surface as the probe's points (core/host 95: an object's userData.probePoints; the drops and the plumes are probeSkip) */
   const pp=new THREE.Object3D();pp.name='The bay\'s boils (the probe\'s points)';pp.userData.probePoints=[].concat(...out.vents.map(v=>[v.x,SEA+.5,v.z]));scene.add(pp);}
  REGISTER({name:'The boiling bay (65-106 degC at its surface over the vents)',bayWater:true,x:CC[0],z:CC[1]-40,y:-18,r:RS*.75,h:21,
   tags:{hazard:{kind:'heat',danger:.6,dose:1.2,shape:{type:'cyl',r:RS*.75,h:3,y0:17}}}});
 }finally{BIO.cur=prevCur;BIO.kit(prevKit);}
 window._cove=out;return out;}
