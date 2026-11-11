// ================================================================= HOST — STATION gills: the life on the Reḍ Gīl (biomes/gills, read in place: 44-gills-life.js)
// PORTED from biomes/xanadu/stations/gills/87-host-gills.js (the White Gill's drawing, the worked example BIOME-API.md names) to the Godthrone's
// frame and the RED dress (biomes/gills/PLAN.md section 7: rust, iron oxide and carbonate; the Red form TALL and single-mouthed, a flare at the
// lip: HANDOFF-REBUILD.md "Taking it, the Gills"): the same records (GILLS.life), the same breath (one state, BIO.breathState('gills')), the
// same hazards; the differences are marked RED. The drawing is now in two hosts' copies: lifting it into biomes/gills as one host fragment both
// read is owed (KNOWN_ISSUES.md). stationBuild() runs from 88-host-build.js after the kit's pass, before the bake.
// THE COLLAR'S CRUST on the Red dress is mineral.crust.ferromanganese (delivered for the Red country, wired here: the godthrone pack's ferroCrust),
// in place of the White's brucite.
const XQ_ON=k=>new URLSearchParams(location.search).get(k)!=='0';
const drawnH=(x,z)=>terrainH(x,z);
const LAND={snowH:STN.iceH==null?7000:STN.iceH};   /* the ice pipes begin at ~7 km (biomes/gills/PLAN.md section 5's table) */
/* the page's clock in days (the sky's): the breath runs on it (GILLS.breath) */
const gillsClockT=()=>{const c=typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;const d0=typeof GDAY==='function'?GDAY():0;
 const h=c&&c.state?c.state().hour:(ATMOS.SKY&&ATMOS.SKY.viewHour)||6;return d0+h/24;};
const STATION_GILLS=SG;
const GILLS_DRAW={pipes:[],steam:null,lampMat:null,meshes:[],counts:{}};
function stationBuild(){const SG=STATION_GILLS,D=GILLS.dress('red'),T3=THREE,t0=performance.now();
 const L=GILLS.life(SG.L,{ground:drawnH,iceH:LAND.snowH,treeH:STN.treeH==null?5300:STN.treeH,lip:[3,10],step:STN.pipeStep||20,wind:[.6,.8],seed:0x8E12});GILLS_DRAW.life=L;
 const k0=BIO.kit('gills'),r0=BIO.range,c0=BIO.cur;BIO.cur='godthrone/gills';
 // ---- the gills as volumes, the pipes as chimney records (core/tags before the draw)
 SG.L.gills.forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r;
  REGISTER({name:GILLS.NAMES.red+': '+g.id+(g.alive?' (breathing)':' (closed: a pipe field, Phlū-phīlḍ)'),kind:'gill',x,z,y:terrainH(x,z)-g.d,r:g.r*(g.a1-g.a0)/2,h:g.d+60});});
 const recs=[];
 L.pipes.forEach(p=>{let B=null;try{/* RED: tall and single-mouthed, a flare at the lip (the White's squat, bulbous, branching form is the life's default) */
  const RH=Math.min(85,p.H*1.7+8),RR=Math.max(1.2,p.r*.72);p.H=RH;p.r=RR;p.mouths=1;
  B=KSTACKS.make({kind:'chimney',id:p.id,x:p.x,z:p.z,y0:p.y0-.6,seed:p.seed,form:'pipe',H:RH,r:RR,taper:1.1,lobes:.06,
   flare:{from:.8,k:1.35,p:1.5},mouths:1,fork:.62,spread:.38,lean:p.lean,toward:p.toward,state:p.state,ice:p.ice?{from:0,thick:.45}:undefined,fan:p.state==='standing'?false:undefined});}catch(e){return;}
  BIO.record({name:(p.state==='standing'?GILLS.NAMES.pipe:GILLS.NAMES.dead)+' '+p.id,kind:'chimney',x:p.x,z:p.z,y:p.y0,r:B.R,h:B.top-p.y0});recs.push({p,B});});
 GILLS_DRAW.pipes=recs;
 // ---- their meshes, merged by chunk (the record's own mesh: what the eye sees is what at() and surface() answer)
 const lin=c=>{const q=new T3.Color(c[0],c[1],c[2]);return q.convertSRGBToLinear();},cW=lin(D.pipe),cB=lin(D.band),cI=lin([.82,.9,.96]);
 /* THE LAMINAE (core/terrain 35b, KSTRATA.lamina; LAMINA.md "Adopting it"): four columns, one per variant (a pipe keeps its variant), the White
    country's bone and grey-green couplets, the thin years (Thin Yīr) 300 years down; drawn by KSTRATA.laminaShade at the depth from the pipe's lip (aD).
    The outside weathers toward the crust colour (the vertex colour); the bore and a broken lip show them clean (occ). ?lamina=0 the banded colour alone */
 const NV=4,LAM=(typeof KSTRATA!=='undefined'&&KSTRATA.lamina&&KSTRATA.laminaShade&&XQ_ON('lamina'))?[0,1,2,3].map(v=>{const Lc=KSTRATA.lamina({seed:KRAND.hash(23,v,0x1a),H:90,country:'red',markers:[{name:'the summit\'s glass (an eruption\'s bead lamina)',kind:'glass',age:120},{name:GILLS.NAMES.thin,kind:'thin',age:300}]});return{L:Lc,S:KSTRATA.laminaShade(Lc,{THREE:T3})};}):null;
 GILLS_DRAW.lamina=LAM;
 const PK=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('gills',n):null,PG=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('godthrone',n):null,
  PL={lam:PK('pipe.lamina'),collar:PG('ferroCrust')||PK('collar'),fringe:PK('fringe'),turf:null};   /* RED: the ferromanganese crust on the collars; no limed turf (the Red meadow is crust and stained ice) */
 const PT=k=>PL[k]?KMAT.textures(PL[k],{aniso:8}).map:null,LT=PT('lam'),LK=PL.lam?1/(PL.lam.scale&&PL.lam.scale[0]||1.5):0;GILLS_DRAW.lib=Object.keys(PL).filter(k=>PL[k]);
 const pipeMat=v=>{const m=new T3.MeshLambertMaterial({vertexColors:true});m.userData.gills='pipe';if(!LAM)return m;const S=LAM[v].S;
  m.extensions={derivatives:true};m.customProgramCacheKey=()=>'gills-pipe-lamina-'+v+(LT?'-t':'');
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,S.uniforms);if(LT){sh.uniforms.gLamT={value:LT};sh.uniforms.gLamK={value:LK};}
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aD;varying vec2 vD;varying vec2 vLW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvD=aD;vLW=(modelMatrix*vec4(transformed,1.0)).xz;');
   /* the couplets: the pack's grey (mean 0.5 in sRGB, decoded: 0.218 linear, so x4.59 is a ratio about 1) across the pipe (its plan diagonal) and
      down it (the depth from the lip), so a bed's day lines run round the pipe */
   const det=LT?'lc*=mix(1.0,pow(texture2D(gLamT,vec2((vLW.x+vLW.y)*0.7071,vD.x)*gLamK).r,2.2)*4.59,0.5);':'';
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vD;varying vec2 vLW;\n'+(LT?'uniform sampler2D gLamT;uniform float gLamK;\n':'')+S.glsl).replace('#include <color_fragment>','#include <color_fragment>\n{vec3 lc=laminaColor(vD.x,fwidth(vD.x));'+det+'diffuseColor.rgb=mix(lc,diffuseColor.rgb,vD.y<0.0?0.94:mix(0.5,0.1,vD.y));}');};
  return m;};
 const MATS=[0,1,2,3].map(pipeMat);
 const CH={};recs.forEach(o=>{const v=(o.p.seed>>>0)%NV,key=Math.floor(o.p.x/600)+','+Math.floor(o.p.z/600)+','+v;o.v=v;(CH[key]||(CH[key]=[])).push(o);});
 let tris=0;Object.keys(CH).forEach(key=>{const pos=[],col=[],idx=[],dd=[],v=+key.split(',')[2];
  CH[key].forEach(o=>{const m=KSTACKS.mesh(o.B,{step:2.2,bore:'open'}),n0=pos.length/3,nv=m.pos.length/3;
   for(let i=0;i<nv;i++){const y=m.pos[i*3+1];pos.push(m.pos[i*3],y,m.pos[i*3+2]);const b=m.bed?m.bed[i]:0,occ=m.occ?m.occ[i]:0,ice=m.ice?m.ice[i]:0,man=(b%3===0)?.32:0;
    const r=(cW.r*(1-man)+cB.r*man)*(1-.75*occ),g=(cW.g*(1-man)+cB.g*man)*(1-.75*occ),bb=(cW.b*(1-man)+cB.b*man)*(1-.75*occ);
    col.push(r+(cI.r-r)*ice,g+(cI.g-g)*ice,bb+(cI.b-bb)*ice);dd.push(Math.max(0,o.B.top-y),ice>.5?-1:Math.min(1,occ*1.6+ice));   /* RED: an iced pipe (the ladder's ice towers) keeps the ice's colour (-1: the lamina under it) */}
   for(let i=0;i<m.idx.length;i++)idx.push(m.idx[i]+n0);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setAttribute('aD',new T3.Float32BufferAttribute(dd,2));g.setIndex(idx);g.computeVertexNormals();
  const me=new T3.Mesh(g,MATS[v]);me.userData.host=true;me.userData.inspectLabel='Breath pipes (Phlū) of the Reḍ Gīl: rust and carbonate, one lamina a day, a glass band for each of the summit\'s eruptions';scene.add(me);GILLS_DRAW.meshes.push(me);tris+=idx.length/3;});
 BIO.tally&&BIO.tally(tris,0,0);
 // ---- the items: unit geometries with a white vertex colour (the put's colour is the dress)
 const white=g=>{const n=g.attributes.position.count,c=new Float32Array(n*3).fill(1);g.setAttribute('color',new T3.BufferAttribute(c,3));return g;};
 const lathe=(pts,seg)=>white(new T3.LatheGeometry(pts.map(p=>new T3.Vector2(p[0],p[1])),seg||12));
 const collarG=lathe([[1.0,-.15],[1.18,0],[1.22,.18],[1.08,.32],[.92,.3]],14);
 if(PL.collar){const uv=collarG.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*8,uv.getY(i)*1.5);}   /* the crust about a metre and a half a tile round a 2-5 m collar */
 /* a card's cell [x0,y0,x1,y1] (fractions from the sheet's top left; the map's v is 1 at the top) at (u, w) inside it, w up from the cell's bottom */
 const cellUV=(c,u,w)=>[c[0]+(c[2]-c[0])*u,1-(c[3]-(c[3]-c[1])*w)];
 /* the fringe: with the card a tuft (knob at the mouth, the filaments along the card's length: the cell's x along y, its height across), else a strip */
 const fringeG=(function(){const g=new T3.PlaneGeometry(PL.fringe?.45:.12,1,1,4);g.translate(0,.5,0);
  if(PL.fringe){const uv=g.attributes.uv,c=PL.fringe.cell||[0,0,1,1];for(let i=0;i<uv.count;i++){const q=cellUV(c,uv.getY(i),uv.getX(i));uv.setXY(i,q[0],q[1]);}}return white(g);})();
 /* the turf: two crossed quads, base at 0, one clump of the sheet's cell */
 const turfG=PL.turf?(function(){const c=PL.turf.cell||[0,0,1,1],pos=[],uv=[],idx=[];[0,Math.PI/2].forEach(a=>{const ca=Math.cos(a)*.5,sa=Math.sin(a)*.5,n0=pos.length/3;
   [[-1,0],[1,0],[-1,1],[1,1]].forEach(([u,h])=>{pos.push(u*ca,h,u*sa);const q=cellUV(c,(u+1)/2,h);uv.push(q[0],q[1]);});idx.push(n0,n0+1,n0+2,n0+2,n0+1,n0+3);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return white(g);})():null;
 const padG=(function(){const g=new T3.SphereGeometry(1,14,6,0,Math.PI*2,0,Math.PI*.42);g.scale(1,.35,1);g.translate(0,-.25,0);return white(g);})();
 const beadG=white(new T3.IcosahedronGeometry(1,1));
 const dewG=(function(){const g=new T3.CircleGeometry(1,10);g.rotateX(-Math.PI/2);g.translate(0,.03,0);return white(g);})();
 const cupG=lathe([[.0,0],[.7,.05],[1,.35],[.95,.5],[.85,.45],[.6,.2],[0,.15]],12);
 const trunkG=white(new T3.CylinderGeometry(.8,1,1,7,1));trunkG.translate(0,.5,0);
 const capG=(function(){const g=new T3.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI*.55);g.scale(1,.45,1);return white(g);})();
 const lampG=(function(){const g=new T3.CircleGeometry(1,10);g.rotateX(-Math.PI/2);return white(g);})();
 const BM=(key,o)=>BIO.animMat('gills:'+key,Object.assign({mode:'breath',vertexColors:true},o));
 BIO.def('gcollar',collarG,BM('collar',{tex:PT('collar'),breath:{key:'gills',shape:'bulge',amp:.05,albedo:1.55}}),{attrs:['aP0','aP1'],label:'Rust collar (Qolar): black-brown charged, rust-red and wet as it discharges on the Bhlo'});
 BIO.def('gfringe',fringeG,BM('fringe',{side:T3.DoubleSide,tex:PT('fringe'),alphaTest:PL.fringe?.4:0,breath:{key:'gills',shape:'stream',amp:1.3,top:1}}),{attrs:['aP0','aP1'],label:'Breath fringe: streams out on the Bhlo, sucked flat on the Suq'});
 BIO.def('gpad',padG,BM('pad',{breath:{key:'gills',shape:'bulge',amp:.45}}),{attrs:['aP0','aP1'],label:'Bellows pad: swells on the out-breath'});
 BIO.def('gbead',beadG,BM('bead',{breath:{key:'gills',shape:'stream',amp:1}}),{attrs:['aP0','aP1'],label:'Tide beads: rolled out on the Bhlo and back on the Suq (roasted, they are food)'});
 if(turfG)BIO.def('gturf',turfG,new T3.MeshLambertMaterial({map:PT('turf'),alphaTest:.5,side:T3.DoubleSide,vertexColors:true}),{label:'Limed turf: steppe grass and mat crusted with the breath\'s lime'});
 BIO.def('gdew',dewG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Dew mat, rusted by the mist\'s iron'});
 BIO.def('gcup',cupG,new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),{label:'Salt cup: the breath-water (Bhlo-wāṭar), iron-bitter'});
 BIO.def('gtrunk',trunkG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Rustwood'});
 BIO.def('gcap',capG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Rustwood: caps crusted with rust'});
 GILLS_DRAW.lampMat=new T3.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,fog:false});
 BIO.def('glamp',lampG,GILLS_DRAW.lampMat,{label:'Throat lamp: faint blue, on the in-breath only',free:true});
 const C=c=>new T3.Color(c[0],c[1],c[2]),q=new T3.Quaternion(),e=new T3.Euler(),Q=(x,y,z)=>{e.set(x,y,z);return q.setFromEuler(e);};   /* BIO.put takes a Quaternion (compose copies it) */
 const n={};const put=(it,p,r,s,c,x)=>{BIO.put(it,p,r,s,c,x);n[it]=(n[it]||0)+1;};
 BIO.range=1200;L.collars.forEach(c=>{BIO.owner=[c.x,c.z];put('gcollar',[c.x,c.y,c.z],null,[c.r,c.r*.8,c.r],C(D.collar),{aP0:[0,0,0,1],aP1:[c.lag,0,0,0]});});
 BIO.range=700;L.fringes.forEach(f=>{BIO.owner=[f.x,f.z];const dx=Math.cos(f.yaw),dz=Math.sin(f.yaw);put('gfringe',[f.x,f.y,f.z],Q(0,-f.yaw,0),[1,f.len,1],C(D.fringe),{aP0:[dx*.5,.85,dz*.5,1],aP1:[f.lag,0,0,0]});});
 BIO.range=900;L.pads.forEach(p=>{BIO.owner=[p.x,p.z];put('gpad',[p.x,p.y,p.z],Q(0,p.yaw,0),[p.r,p.r,p.r*.6],C([.86,.84,.78]),{aP0:[0,0,0,1],aP1:[p.lag,0,0,0]});});
 BIO.range=400;L.beads.forEach(b=>{const y=drawnH(b.x,b.z);BIO.owner=[b.x,b.z];put('gbead',[b.x,y+b.r*.8,b.z],null,b.r,C(D.bead),{aP0:[b.dir[0]*1.6,0,b.dir[1]*1.6,1],aP1:[b.lag,0,0,0]});});
 BIO.range=800;L.dew.forEach(d=>{BIO.owner=[d.x,d.z];put('gdew',[d.x,drawnH(d.x,d.z),d.z],Q(0,d.yaw,0),[d.r,1,d.r*.8],C(D.dew));});
 if(turfG)(L.turf||[]).forEach(t=>{BIO.owner=[t.x,t.z];put('gturf',[t.x,drawnH(t.x,t.z)-.03,t.z],Q(0,t.yaw,0),[t.h*1.1,t.h,t.h*1.1],C([1,1,1]));});
 L.cups.forEach(c=>{BIO.owner=[c.x,c.z];put('gcup',[c.x,drawnH(c.x,c.z)-.02,c.z],null,[c.r,c.r,c.r],C(D.cup));});
 L.wood.forEach(w=>{BIO.owner=[w.x,w.z];const y=drawnH(w.x,w.z),s=KRAND.stream(w.seed);put('gtrunk',[w.x,y-.2,w.z],null,[w.r,w.H,w.r],C(D.wood));
  for(let k=0;k<w.caps;k++){const a=s.next()*Math.PI*2,h=w.H*(.55+.45*s.next()),off=w.r*(1+2*s.next())*(k?1:0),cr=.5+.9*s.next();put('gcap',[w.x+Math.cos(a)*off,y+h,w.z+Math.sin(a)*off],null,[cr,cr,cr],C(D.cap));}});
 BIO.range=600;L.lamps.forEach(l=>{BIO.owner=[l.x,l.z];put('glamp',[l.x,l.y,l.z],null,[l.r,1,l.r],C([.45,.7,1]));});
 BIO.owner=null;BIO.range=r0;BIO.cur=c0;BIO.kitEnd(GILLS);BIO.kit(k0);
 /* the steam, the hazards and the breath's tick run once core/atmos is bound (89y-host-gills-late.js calls GILLS_DRAW.late): on this page the
    station's pass runs before it (88), on xanadu's after */
 GILLS_DRAW.late=function(){
 // ---- the steam at the live mouths and over the milky pools (their thermal plans), one group scaled by the breath (ATMOS.smokeGroups)
 const em=L.steam.map(s=>[s.x,s.y,s.z,'steam']).concat((typeof GILL_POOLS!=='undefined'?GILL_POOLS:[]).map(P=>[P.x,P.y+.5,P.z,'steam']));
 GILLS_DRAW.steam=em.length&&ATMOS.smokeGroups?ATMOS.smokeGroups({breath:{emitters:em,k:0}}):null;
 // ---- THE HAZARDS (core/hazard; each a core/tags record before it is drawn: REGISTER): the throats' in-breath, a grab that pulls toward the mouth while the
 // Suq draws ('GILLS.suck': 1 - the breath); the live gills' sumps, where the Bhlo's gas pools on the floor (gas, the floor's 4 m)
 if(typeof KHAZ!=='undefined'){KHAZ.STATES=KHAZ.STATES||{};KHAZ.STATES['GILLS.suck']=(r,h,t)=>{const k=1-GILLS.breath(gillsClockT());return{state:k>0?'drawing':'still',k,on:k>0};};
  SG.L.gills.filter(g=>g.alive).forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r,y=terrainH(x,z),d=8;
   REGISTER({name:'A throat drawing on the Suq ('+g.id+'): "Suq-ān na-sṭãḍ", do not stand on the suck',x,z,y:y-2,r:Math.max(6,g.w*.5),h:d+14,   /* RED: the record's volume the crack's floor across; the hazard's shape stays the 6 m throat */
    /* the throat is a place on the crack's drawn floor (y is drawnH there), and the floor is the ground mesh, which the probe skips: the
       volume's content is the ground (ground:true, as the field's own record), not whatever pipe happens to stand inside it. The great
       gill (gill0: 300 m deep, 60 m across) has no pipe within 30 m of its throat, so its volume read empty on the GPU verify (2026-11-08) */
    ground:true,

    tags:{hazard:{kind:'grab',danger:.7,falloff:'linear',shape:{type:'cyl',r:6,h:d+4,y0:-d},move:{speed:.5,pull:1.2,to:[0,-d,0]},stateFn:'GILLS.suck',tell:{sign:'dust streaming into the mouth'}}}});
   const pts=[];for(let k=0;k<=8;k++){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r-g.w*.2),g.c[1]+Math.sin(an)*(g.r-g.w*.2)]);}
   for(let k=8;k>=0;k--){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r+g.w*.2),g.c[1]+Math.sin(an)*(g.r+g.w*.2)]);}
   REGISTER({name:'The sump of '+g.id+': the out-breath\'s gas pools on the floor',x,z,y,r:g.r*(g.a1-g.a0)*.2,h:6,
    tags:{hazard:{kind:'gas',danger:1,falloff:'none',shape:{type:'poly',pts:pts.map(p=>[p[0]-x,p[1]-z]),h:4,pool:2},tell:{sign:'dead beads and no dew on the floor'}}}});});}
 // ---- the one tick: the breath state, the lamps, the steam, from the page's clock
 TICKS.push(()=>{const b=GILLS.breath(gillsClockT());BIO.breathState('gills').value=b;GILLS_DRAW.b=b;if(GILLS_DRAW.lampMat)GILLS_DRAW.lampMat.opacity=.75*(1-b);if(GILLS_DRAW.steam)GILLS_DRAW.steam.set('breath',gillsSteamOn(b)?b:0);});
 };
 GILLS_DRAW.counts=Object.assign({pipes:recs.length,standing:recs.filter(o=>o.p.state==='standing').length,ice:recs.filter(o=>o.p.ice).length,live:recs.filter(o=>o.p.live).length,steam:L.steam.length,pipeTris:tris,ms:Math.round(performance.now()-t0)},n);
 return GILLS_DRAW.counts;}
const gillsSteamOn=b=>b>.08;
// ---- the checks (biomes/gills/PLAN.md section 16, G6, as far as this page goes), each with a negative; 99-host-take.js reads STATION_CHECKS
const GCHK={
 tall(R){const bad=R.filter(o=>o.B.top-o.p.y0>=90);return{ok:R.length>20&&!bad.length,detail:R.length+' pipes, the tallest '+Math.max(...R.map(o=>o.B.top-o.p.y0)).toFixed(1)+' m'};},
 red(R){const multi=R.filter(o=>o.p.state==='standing'&&o.p.mouths!==1).length,mean=R.reduce((a,o)=>a+(o.B.top-o.p.y0),0)/Math.max(1,R.length);
  return{ok:R.length>20&&!multi&&mean>25,detail:'the Red form: '+multi+' standing pipes with more than one mouth; mean height '+mean.toFixed(1)+' m'};},
 steam(fn,day){day=typeof GDAY==='function'?GDAY():day;const tp=day+GILLS.peakHour(day)/24,out=gillsSteamOn(fn(tp)),inn=gillsSteamOn(fn(tp+.5)),n=GILLS_DRAW.life?GILLS_DRAW.life.steam.length:0;
  return{ok:n>0&&out&&!inn,detail:n+' steaming mouths; at the Bhlo ('+GILLS.peakHour(day).toFixed(2)+' h) '+(out?'on':'OFF')+', twelve hours on '+(inn?'ON':'off')};},
 gill(g,drop){const ok=Math.abs(g.w-60)<1&&Math.abs(g.d-300)<1&&Math.abs(g.r*(g.a1-g.a0)-1600)<5&&drop>200;return{ok,detail:'the great gill: '+(g.r*(g.a1-g.a0)).toFixed(0)+' m long, '+g.w+' m across, '+g.d+' m deep on its record; the drawn floor '+drop.toFixed(0)+' m under its lips'};},
 live(R,ice){const bad=R.filter(o=>(o.p.live&&(o.p.ice||!SG.L.gills.find(g=>g.id===o.p.gill).alive))||(o.p.ice&&o.p.y0<=ice));return{ok:!bad.length,detail:bad.length+' pipes alive where they cannot be (on ice, on a closed gill), or iced under '+ice+' m'};}};
const gillDrop=()=>{let lip=0,fl=1e9;for(let z=-500;z<=500;z+=100){lip=Math.max(lip,terrainH(70,z),terrainH(-70,z));fl=Math.min(fl,terrainH(0,z));}return lip-fl;};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 if(GILLS_DRAW.pipes.length){
 add('the breath pipes stand under 90 m (KSTACKS chimney records)',GCHK.tall(GILLS_DRAW.pipes));
 add('the Red form: tall, one mouth',GCHK.red(GILLS_DRAW.pipes));
 if(GILLS_DRAW.life&&GILLS_DRAW.life.steam.length)add('steam at the live mouths on the out-breath (Bhlo), none on the in-breath (Suq)',GCHK.steam(GILLS.breath,0));
 add('no live pipe on ice or on a closed gill',GCHK.live(GILLS_DRAW.pipes,LAND.snowH));}
 if(STN.key==='gills')add('the great gill: 1.6 km, 60 m, 300 m (its record) and drawn deep',GCHK.gill(SG.big,gillDrop()));
 if(typeof SOUTH_CHECKS==='function')SOUTH_CHECKS().forEach(c=>R.push(c));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 if(GILLS_DRAW.pipes.length){
 add('a pipe of 120 m',GCHK.tall(GILLS_DRAW.pipes.concat([{p:{y0:0},B:{top:120}}])));
 add('the White form (three mouths)',GCHK.red(GILLS_DRAW.pipes.map(o=>({p:Object.assign({},o.p,{mouths:3}),B:o.B}))));
 if(GILLS_DRAW.life&&GILLS_DRAW.life.steam.length)add('the breath a half day out (steam on the in-breath)',GCHK.steam(t=>GILLS.breath(t+.5),0));
 add('a live pipe on a closed gill',GCHK.live(GILLS_DRAW.pipes.concat([{p:{live:true,ice:false,gill:(SG.L.gills.find(g=>!g.alive)||{}).id,y0:0}}]),LAND.snowH));}
 if(STN.key==='gills')add('a gill of 40 m',GCHK.gill(Object.assign({},SG.big,{d:40}),gillDrop()));
 if(typeof SOUTH_NEGATIVES==='function')SOUTH_NEGATIVES().forEach(c=>R.push(c));
 return R;}
