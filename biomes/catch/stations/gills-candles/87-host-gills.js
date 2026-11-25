// ================================================================= HOST — STATION gills-candles: the life on the lowest Wāiṭ Gīl (biomes/gills, read in place)
// PORTED from biomes/godthrone/stations/gills/87-host-gills.js (itself a port of xanadu's, the worked example BIOME-API.md names) to the Catch's
// frame and the WHITE dress (biomes/gills/PLAN.md section 7: bone-white carbonate and brucite, the White form SQUAT, BULBOUS and BRANCHING into
// one to three mouths, 15-35 m at this field: section 18.2). The same records (GILLS.life), the same breath (one state, BIO.breathState('gills')),
// the same hazards; what is NEW here is marked CANDLES and SITES. The drawing is now in three hosts' copies: lifting it into biomes/gills as one
// host fragment all three read is owed (biomes/gills/KNOWN_ISSUES.md). stationBuild() runs from 88-host-build.js after the kit's pass, before the bake.
// THE COLLAR'S CRUST on the White dress is mineral.crust.brucite (the gills pack's `collar`), and this country HAS the limed turf (card.turf.limed).
const XQ_ON=k=>new URLSearchParams(location.search).get(k)!=='0';
const LAND_ICE=1e9;   /* no ice line on this page: the ice pipes begin 2.9 km higher, at Lasso and the pass (station gills-pass) */
/* the page's clock in days (the sky's): the breath runs on it (GILLS.breath) */
const gillsClockT=()=>{const c=typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;const d0=GDAY();
 const h=c&&c.state?c.state().hour:(STAGE.hour==null?18.6:STAGE.hour);return d0+h/24;};
const gillsHour=()=>{const c=typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
 return c&&c.state?c.state().hour:(STAGE.hour==null?18.6:STAGE.hour);};
const GILLS_DRAW={pipes:[],candles:[],steam:null,lampMat:null,flameMat:null,meshes:[],counts:{},tallest:null};
let CATCH_GILLS_SITE=null;
function stationBuild(){const D=GILLS.dress(SG.country),T3=THREE,t0=performance.now();
 const L=GILLS.life(SG.L,{ground:drawnH,iceH:LAND_ICE,treeH:4400,lip:[3,9],step:18,wind:[WIND[0],WIND[1]],seed:0x6112,country:SG.country,
  /* this station widens each pipe by 15 per cent below for the White form, after GILLS.life has kept them clear, so it asks for the gap that
     absorbs that growth rather than letting the kit's default be wrong for everyone */
  gap:3});
 /* THE ROAD IS KEPT CLEAR (PLAN.md section 11 item 3: the caravan road "threading between the pipes"). GILLS.life places pipes on a gill's
    lips from the swarm alone, so without this they stand in the trail - and the caravans have been walking this ground for centuries. The
    same clearance takes the candles: nobody keeps a burning throat in the road. bindStage's `keep` bars only the kits' own planting. */
 const ROAD_CLEAR=11;
 L.pipes=L.pipes.filter(p=>roadD(p.x,p.z)>ROAD_CLEAR);
 const keptIds=new Set(L.pipes.map(p=>p.id));
 L.collars=L.collars.filter(c=>keptIds.has(c.pipe));L.fringes=L.fringes.filter(f=>keptIds.has(f.pipe));
 L.steam=L.steam.filter(s=>keptIds.has(s.pipe));
 GILLS_DRAW.life=L;
 const k0=BIO.kit('gills'),r0=BIO.range,c0=BIO.cur;BIO.cur='catch/gills-candles';
 // ---- the gills as volumes, the pipes as chimney records (core/tags before the draw)
 SG.L.gills.forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r,dry=GILLS.isDry(SG.L,g,GOPT);
  REGISTER({name:GILLS.NAMES.white+' '+g.id+(g.alive?' (breathing)':dry?' (dry, its throats burning)':' (closed: a pipe field, '+GILLS.NAMES.field+')'),
   /* the volume is the crack itself, and what fills it is the GROUND (ground:true, as the field's own record): its floor is the ground
      mesh, which the probe skips, and the pipes stand on its lips outside it - the godthrone station's lesson of 2026-11-08 */
   kind:'gill',ground:true,x,z,y:terrainH(x,z)-g.d,r:g.r*(g.a1-g.a0)/2,h:g.d+60});});
 const recs=[];
 L.pipes.forEach(p=>{let B=null;try{
  /* WHITE: squat, bulbous and branching, 15-35 m at this lowest field (section 18.2), one to three mouths as the life draws them */
  const WH=Math.max(15,Math.min(35,p.H*.8+9)),WR=Math.max(1.7,p.r*1.15);p.H=WH;p.r=WR;
  B=KSTACKS.make({kind:'chimney',id:p.id,x:p.x,z:p.z,y0:p.y0-.5,seed:p.seed,form:'pipe',H:WH,r:WR,taper:.82,lobes:.22,
   flare:{from:.62,k:1.18,p:1.1},mouths:p.mouths,fork:.44,spread:.62,lean:p.lean,toward:p.toward,state:p.state,
   fan:p.state==='standing'?false:undefined});}catch(e){return;}
  BIO.record({name:(p.state==='standing'?GILLS.NAMES.pipe:GILLS.NAMES.dead)+' '+p.id,kind:'chimney',x:p.x,z:p.z,y:p.y0,r:B.R,h:B.top-p.y0});
  recs.push({p,B});});
 GILLS_DRAW.pipes=recs;
 GILLS_DRAW.tallest=recs.filter(o=>o.p.state==='standing').sort((a,b)=>(b.B.top-b.p.y0)-(a.B.top-a.p.y0)).map(o=>({x:o.p.x,z:o.p.z,y0:o.p.y0,H:o.B.top-o.p.y0}))[0]||null;
 // ---- their meshes, merged by chunk (the record's own mesh: what the eye sees is what at() and surface() answer)
 const lin=c=>{const q=new T3.Color(c[0],c[1],c[2]);return q.convertSRGBToLinear();},cW=lin(D.pipe),cB=lin(D.band);
 /* THE LAMINAE (core/terrain 35b, KSTRATA.lamina): four columns, one per variant, the WHITE country's bone and grey-green couplets, the
    Thin Yīr (the band the Monks read as the Cataclysm, PLAN.md section 10) 300 years down. No glass band: the summit's bead glass is the RED
    pipes' alone (section 10 item 1). ?lamina=0 leaves the banded vertex colour. */
 const NV=4,LAM=(typeof KSTRATA!=='undefined'&&KSTRATA.lamina&&KSTRATA.laminaShade&&XQ_ON('lamina'))?[0,1,2,3].map(v=>{
   /* rate .00022 m a day, the SLOW end of the plan's 0.2-0.4 mm (section 10): the alkaline brine "builds slowly and spreads sideways"
      (section 7), against the Red country's fast thin growth on the default .0003, so a 36 m White column holds ~450 years and the
      Thin Yīr of 300 stands two thirds of the way down it - "well up inside the standing pipes" as section 10 asks. */
   const Lc=KSTRATA.lamina({seed:KRAND.hash(51,v,0x1a),H:36,rate:.00022,country:'white',markers:[{name:GILLS.NAMES.thin,kind:'thin',age:300}]});
   return{L:Lc,S:KSTRATA.laminaShade(Lc,{THREE:T3})};}):null;
 GILLS_DRAW.lamina=LAM;
 const PK=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('gills',n):null,
  PL={lam:PK('pipe.lamina'),collar:PK('collar'),fringe:PK('fringe'),turf:PK('turf')};
 const PT=k=>PL[k]?KMAT.textures(PL[k],{aniso:8}).map:null,LT=PT('lam'),LK=PL.lam?1/(PL.lam.scale&&PL.lam.scale[0]!=null?PL.lam.scale[0]:1.5):0;   /* a scale is a real number: no `||` default */
 GILLS_DRAW.lib=Object.keys(PL).filter(k=>PL[k]);
 const pipeMat=v=>{const m=new T3.MeshLambertMaterial({vertexColors:true});m.userData.gills='pipe';if(!LAM)return m;const S=LAM[v].S;
  m.extensions={derivatives:true};m.customProgramCacheKey=()=>'gills-pipe-lamina-'+v+(LT?'-t':'');
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,S.uniforms);if(LT){sh.uniforms.gLamT={value:LT};sh.uniforms.gLamK={value:LK};}
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aD;varying vec2 vD;varying vec2 vLW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvD=aD;vLW=(modelMatrix*vec4(transformed,1.0)).xz;');
   /* the couplets: the pack's grey (mean 0.5 sRGB, decoded 0.218 linear, so x4.59 is a ratio about 1) across the pipe and down it */
   const det=LT?'lc*=mix(1.0,pow(texture2D(gLamT,vec2((vLW.x+vLW.y)*0.7071,vD.x)*gLamK).r,2.2)*4.59,0.5);':'';
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vD;varying vec2 vLW;\n'+(LT?'uniform sampler2D gLamT;uniform float gLamK;\n':'')+S.glsl).replace('#include <color_fragment>','#include <color_fragment>\n{vec3 lc=laminaColor(vD.x,fwidth(vD.x));'+det+'diffuseColor.rgb=mix(lc,diffuseColor.rgb,vD.y<0.0?0.94:mix(0.5,0.1,vD.y));}');};
  return m;};
 const MATS=[0,1,2,3].map(pipeMat);
 const CH={};recs.forEach(o=>{const v=(o.p.seed>>>0)%NV,key=Math.floor(o.p.x/600)+','+Math.floor(o.p.z/600)+','+v;o.v=v;(CH[key]||(CH[key]=[])).push(o);});
 let tris=0;Object.keys(CH).forEach(key=>{const pos=[],col=[],idx=[],dd=[],v=+key.split(',')[2];
  CH[key].forEach(o=>{const m=KSTACKS.mesh(o.B,{step:2.2,bore:'open'}),n0=pos.length/3,nv=m.pos.length/3;
   for(let i=0;i<nv;i++){const y=m.pos[i*3+1];pos.push(m.pos[i*3],y,m.pos[i*3+2]);
    const b=m.bed?m.bed[i]:0,occ=m.occ?m.occ[i]:0,man=(b%4===0)?.28:0;   /* the grey-green manganese bands of the White country */
    col.push((cW.r*(1-man)+cB.r*man)*(1-.72*occ),(cW.g*(1-man)+cB.g*man)*(1-.72*occ),(cW.b*(1-man)+cB.b*man)*(1-.72*occ));
    dd.push(Math.max(0,o.B.top-y),Math.min(1,occ*1.6));}
   for(let i=0;i<m.idx.length;i++)idx.push(m.idx[i]+n0);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
  g.setAttribute('aD',new T3.Float32BufferAttribute(dd,2));g.setIndex(idx);g.computeVertexNormals();
  const me=new T3.Mesh(g,MATS[v]);me.userData.host=true;
  me.userData.inspectLabel='Breath pipes ('+GILLS.NAMES.pipe+') of the '+GILLS.NAMES.white+': brucite and aragonite, one lamina a day, the '+GILLS.NAMES.thin+' well up inside them';
  scene.add(me);GILLS_DRAW.meshes.push(me);tris+=idx.length/3;});
 BIO.tally&&BIO.tally(tris,0,0);
 // ---- the items: unit geometries with a white vertex colour (the put's colour is the dress)
 const white=g=>{const n=g.attributes.position.count,c=new Float32Array(n*3).fill(1);g.setAttribute('color',new T3.BufferAttribute(c,3));return g;};
 const lathe=(pts,seg)=>white(new T3.LatheGeometry(pts.map(p=>new T3.Vector2(p[0],p[1])),seg==null?12:seg));
 const collarG=lathe([[1.0,-.15],[1.18,0],[1.22,.18],[1.08,.32],[.92,.3]],14);
 if(PL.collar){const uv=collarG.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*8,uv.getY(i)*1.5);}
 const cellUV=(c,u,w)=>[c[0]+(c[2]-c[0])*u,1-(c[3]-(c[3]-c[1])*w)];
 const fringeG=(function(){const g=new T3.PlaneGeometry(PL.fringe?.45:.12,1,1,4);g.translate(0,.5,0);
  if(PL.fringe){const uv=g.attributes.uv,c=PL.fringe.cell||[0,0,1,1];for(let i=0;i<uv.count;i++){const q=cellUV(c,uv.getY(i),uv.getX(i));uv.setXY(i,q[0],q[1]);}}return white(g);})();
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
 BIO.def('gcollar',collarG,BM('collar',{tex:PT('collar'),breath:{key:'gills',shape:'bulge',amp:.05,albedo:1.5}}),{attrs:['aP0','aP1'],label:'Lime collar ('+GILLS.NAMES.collar+'): grey-green and matte charged, tan and wet as it discharges on the '+GILLS.NAMES.out});
 BIO.def('gfringe',fringeG,BM('fringe',{side:T3.DoubleSide,tex:PT('fringe'),alphaTest:PL.fringe?.4:0,breath:{key:'gills',shape:'stream',amp:1.3,top:1}}),{attrs:['aP0','aP1'],label:'Breath fringe: streams out on the '+GILLS.NAMES.out+', sucked flat on the '+GILLS.NAMES.in});
 BIO.def('gpad',padG,BM('pad',{breath:{key:'gills',shape:'bulge',amp:.45}}),{attrs:['aP0','aP1'],label:'Bellows pad: swells on the out-breath'});
 BIO.def('gbead',beadG,BM('bead',{breath:{key:'gills',shape:'stream',amp:1}}),{attrs:['aP0','aP1'],label:'Tide beads: rolled out on the '+GILLS.NAMES.out+' and back on the '+GILLS.NAMES.in+' (roasted, they are food)'});
 if(turfG)BIO.def('gturf',turfG,new T3.MeshLambertMaterial({map:PT('turf'),alphaTest:.5,side:T3.DoubleSide,vertexColors:true}),{label:'Limed turf: steppe grass and mat crusted with the breath\'s lime'});
 BIO.def('gdew',dewG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Dew mat, crusted with the mist\'s lime'});
 BIO.def('gcup',cupG,new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),{label:'Salt cup: the breath-water ('+GILLS.NAMES.water+'), the only drinkable water between Bitta and Lasso'});
 BIO.def('gtrunk',trunkG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Limewood'});
 BIO.def('gcap',capG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Limewood: caps crusted with lime'});
 GILLS_DRAW.lampMat=new T3.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,fog:false});
 BIO.def('glamp',lampG,GILLS_DRAW.lampMat,{label:'Throat lamp: faint blue, on the in-breath only',free:true});
 // ---- CANDLES (PLAN.md section 11 item 4): the black heat crust round a burning throat, and the flame itself
 // THE FLAME IS A HOST MESH, not core's: core/atmos has no fire or flame chunk (its smoke kinds are chimney, steam and spray) and
 // core/biome/38-core-fire.js is the burn-mosaic spread model ([G data], no mesh), which PLAN.md section 13 rightly does not take. So the
 // candle is three crossed additive quads, blue at the root and pale at the tip, flickering on ONE shared uniform and dimmed by the hour
 // (invisible at noon, plain at dusk: the plan's picture). A steady-flame chunk in core/atmos is a proposal for the owner (KNOWN_ISSUES.md).
 const crustG=(function(){const g=new T3.CircleGeometry(1,14);g.rotateX(-Math.PI/2);g.translate(0,.04,0);return white(g);})();
 const flameG=(function(){const pos=[],col=[],idx=[];[0,Math.PI/3,2*Math.PI/3].forEach(a=>{const ca=Math.cos(a)*.5,sa=Math.sin(a)*.5,n0=pos.length/3;
   /* a tapered tongue: wide and blue at the root, a pale point at the tip */
   [[-1,0,.18,.30,.95],[1,0,.18,.30,.95],[-.55,.55,.42,.62,1.0],[.55,.55,.42,.62,1.0],[0,1,.80,.86,1.0]].forEach(v=>{
    pos.push(v[0]*ca,v[1],v[0]*sa);col.push(v[2],v[3],v[4]);});
   idx.push(n0,n0+1,n0+2,n0+2,n0+1,n0+3,n0+2,n0+3,n0+4);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;})();
 GILLS_DRAW.flameMat=new T3.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.6,blending:T3.AdditiveBlending,depthWrite:false,fog:false,side:T3.DoubleSide});
 BIO.def('gcrust',crustG,new T3.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2}),{label:'The heat crust round a burning throat: the gas has baked the carbonate black'});
 BIO.def('gflame',flameG,GILLS_DRAW.flameMat,{label:'A candle ('+GILLS.NAMES.candle+'): the dry throat\'s hydrogen and methane burning, pale blue and a metre tall',free:true});
 const CAND=GILLS.candles(SG.L,{ground:drawnH,seed:GOPT.seed,dry:GOPT.dry,step:26}).filter(c=>roadD(c.x,c.z)>ROAD_CLEAR);GILLS_DRAW.candles=CAND;
 const C=c=>new T3.Color(c[0],c[1],c[2]),q=new T3.Quaternion(),e=new T3.Euler(),Q=(x,y,z)=>{e.set(x,y,z);return q.setFromEuler(e);};
 const n={};const put=(it,p,r,s,c,x)=>{BIO.put(it,p,r,s,c,x);n[it]=(n[it]||0)+1;};
 BIO.range=1200;L.collars.forEach(c=>{BIO.owner=[c.x,c.z];put('gcollar',[c.x,c.y,c.z],null,[c.r,c.r*.8,c.r],C(D.collar),{aP0:[0,0,0,1],aP1:[c.lag,0,0,0]});});
 BIO.range=700;L.fringes.forEach(f=>{BIO.owner=[f.x,f.z];const dx=Math.cos(f.yaw),dz=Math.sin(f.yaw);
  put('gfringe',[f.x,f.y,f.z],Q(0,-f.yaw,0),[1,f.len,1],C(D.fringe),{aP0:[dx*.5,.85,dz*.5,1],aP1:[f.lag,0,0,0]});});
 BIO.range=900;L.pads.forEach(p=>{BIO.owner=[p.x,p.z];put('gpad',[p.x,p.y,p.z],Q(0,p.yaw,0),[p.r,p.r,p.r*.6],C([.88,.87,.82]),{aP0:[0,0,0,1],aP1:[p.lag,0,0,0]});});
 BIO.range=400;L.beads.forEach(b=>{const y=drawnH(b.x,b.z);BIO.owner=[b.x,b.z];
  put('gbead',[b.x,y+b.r*.8,b.z],null,b.r,C(D.bead),{aP0:[b.dir[0]*1.6,0,b.dir[1]*1.6,1],aP1:[b.lag,0,0,0]});});
 BIO.range=800;L.dew.forEach(d=>{BIO.owner=[d.x,d.z];put('gdew',[d.x,drawnH(d.x,d.z),d.z],Q(0,d.yaw,0),[d.r,1,d.r*.8],C(D.dew));});
 if(turfG)(L.turf||[]).forEach(t=>{BIO.owner=[t.x,t.z];put('gturf',[t.x,drawnH(t.x,t.z)-.03,t.z],Q(0,t.yaw,0),[t.h*1.1,t.h,t.h*1.1],C([1,1,1]));});
 L.cups.forEach(c=>{BIO.owner=[c.x,c.z];put('gcup',[c.x,drawnH(c.x,c.z)-.02,c.z],null,[c.r,c.r,c.r],C(D.cup));});
 L.wood.forEach(w=>{BIO.owner=[w.x,w.z];const y=drawnH(w.x,w.z),s=KRAND.stream(w.seed);put('gtrunk',[w.x,y-.2,w.z],null,[w.r,w.H,w.r],C(D.wood));
  for(let k=0;k<w.caps;k++){const a=s.next()*Math.PI*2,h=w.H*(.55+.45*s.next()),off=w.r*(1+2*s.next())*(k?1:0),cr=.5+.9*s.next();
   put('gcap',[w.x+Math.cos(a)*off,y+h,w.z+Math.sin(a)*off],null,[cr,cr,cr],C(D.cap));}});
 BIO.range=600;L.lamps.forEach(l=>{BIO.owner=[l.x,l.z];put('glamp',[l.x,l.y,l.z],null,[l.r,1,l.r],C([.45,.7,1]));});
 /* the candles, each registered before it is drawn: the crust first, then the flame over its throat */
 BIO.range=900;CAND.forEach(c=>{BIO.owner=[c.x,c.z];
  REGISTER({name:'A candle ('+GILLS.NAMES.candle+') at a dry throat of '+c.gill,kind:'candle',x:c.x,z:c.z,y:c.y,r:c.crust,h:c.h+1});
  put('gcrust',[c.x,drawnH(c.x,c.z),c.z],Q(0,c.seed%6.283,0),[c.crust,1,c.crust*.9],C([.12,.11,.10]));
  put('gflame',[c.x,c.y+.05,c.z],Q(0,(c.seed>>>3)%6.283,0),[Math.max(.22,c.r*2.6),c.h,Math.max(.22,c.r*2.6)],C([1,1,1]));});
 BIO.owner=null;BIO.range=r0;BIO.cur=c0;BIO.kitEnd(GILLS);BIO.kit(k0);
 // ---- SITES (PLAN.md sections 9 and 11 item 4): published as plain data for a settlement or the Catch bowl region, NOTHING built
 CATCH_GILLS_SITE=GILLS.sites(SG.L,L,{ground:drawnH,seed:GOPT.seed,dry:GOPT.dry,country:SG.country,monks:3});
 if(CATCH_GILLS_SITE){const S=CATCH_GILLS_SITE;
  if(S.hermitage)REGISTER({name:'The History Monks’ hermitage and caravan stop (a site: the two cells are a settlement’s to build)',key:'site.hermitage',x:S.hermitage.x,z:S.hermitage.z,y:S.hermitage.y,r:12,h:6,ground:true});
  if(S.gasHouse)REGISTER({name:'The Yuni Geomancers’ gas-house at a capped throat (a site, proposed)',key:'site.gashouse',x:S.gasHouse.x,z:S.gasHouse.z,y:S.gasHouse.y,r:9,h:6,ground:true});
  if(S.caravanStop)REGISTER({name:'The caravans’ halt at the salt cups (a site)',key:'site.caravanstop',x:S.caravanStop.x,z:S.caravanStop.z,y:S.caravanStop.y,r:S.caravanStop.r,h:3,ground:true});
  S.hearths.forEach(h=>fireRing(h.x,h.z,'A caravan’s smelting hearth and its slag (the pipe crusts worked on the road)',h.id));}
 /* the steam, the hazards and the breath's tick run once core/atmos is bound (89y2-host-gills-late.js calls GILLS_DRAW.late) */
 GILLS_DRAW.late=function(){
 // ---- the steam at the live mouths, one group scaled by the breath (ATMOS.smokeGroups); the candles' thin heat haze is steady
 const em=L.steam.map(s=>[s.x,s.y,s.z,'steam']),ce=CAND.map(c=>[c.x,c.y+c.h*1.1,c.z,'steam']);
 GILLS_DRAW.steam=(em.length||ce.length)&&ATMOS.smokeGroups?ATMOS.smokeGroups({breath:{emitters:em,k:0},candles:{emitters:ce,k:.22}}):null;
 // ---- THE HAZARDS (core/hazard; each a core/tags record before it is drawn): the in-breath's grab at a live throat, the sumps' pooled gas,
 // and the candles' heat (PLAN.md section 9: `heat`, burn, steady - it does not cycle, the flame burns all day)
 if(typeof KHAZ!=='undefined'){KHAZ.STATES=KHAZ.STATES||{};KHAZ.STATES['GILLS.suck']=(r,h,t)=>{const k=1-GILLS.breath(gillsClockT());return{state:k>0?'drawing':'still',k,on:k>0};};
  SG.L.gills.filter(g=>g.alive).forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r,y=terrainH(x,z),d=8;
   REGISTER({name:'A throat drawing on the '+GILLS.NAMES.in+' ('+g.id+'): Suq-ān na-sṭãḍ, do not stand on the suck',
    x,z,y:y-2,r:Math.max(6,g.w*.5),h:d+14,ground:true,
    tags:{hazard:{kind:'grab',danger:.7,falloff:'linear',shape:{type:'cyl',r:6,h:d+4,y0:-d},move:{speed:.5,pull:1.2,to:[0,-d,0]},stateFn:'GILLS.suck',tell:{sign:'dust streaming into the mouth'}}}});
   const pts=[];for(let k=0;k<=8;k++){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r-g.w*.2),g.c[1]+Math.sin(an)*(g.r-g.w*.2)]);}
   for(let k=8;k>=0;k--){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r+g.w*.2),g.c[1]+Math.sin(an)*(g.r+g.w*.2)]);}
   REGISTER({name:'The sump of '+g.id+': the out-breath\'s gas pools on the floor',x,z,y,r:g.r*(g.a1-g.a0)*.2,h:6,
    tags:{hazard:{kind:'gas',danger:1,falloff:'none',shape:{type:'poly',pts:pts.map(p=>[p[0]-x,p[1]-z]),h:4,pool:2},tell:{sign:'dead beads and no dew on the floor'}}}});});
  CAND.forEach(c=>{REGISTER({name:'The heat of a candle ('+GILLS.NAMES.candle+') at '+c.id,x:c.x,z:c.z,y:c.y,r:c.crust,h:c.h+1.5,ground:true,
   tags:{hazard:{kind:'heat',danger:.55,dose:.8,falloff:'linear',shape:{type:'cyl',r:Math.max(1.2,c.crust*.75),h:c.h+1.5,y0:0},
    tell:{sign:'a black heat crust and no dew within a pace of the throat'}}}});});}
 // ---- the one tick: the breath state, the lamps, the steam, the candles' flicker, from the page's clock
 TICKS.push(()=>{const b=GILLS.breath(gillsClockT());BIO.breathState('gills').value=b;GILLS_DRAW.b=b;
  if(GILLS_DRAW.lampMat)GILLS_DRAW.lampMat.opacity=.75*(1-b);
  if(GILLS_DRAW.steam)GILLS_DRAW.steam.set('breath',gillsSteamOn(b)?b:0);
  if(GILLS_DRAW.flameMat){const t=performance.now()*.001;
   GILLS_DRAW.flameMat.opacity=candleAlpha(sunAltNow())*(.82+.18*Math.sin(t*7.3)+.10*Math.sin(t*13.1));}});
 };
 GILLS_DRAW.counts=Object.assign({pipes:recs.length,standing:recs.filter(o=>o.p.state==='standing').length,
  fallen:recs.filter(o=>o.p.state==='fallen'||o.p.state==='rubble').length,live:recs.filter(o=>o.p.live).length,
  steam:L.steam.length,candles:CAND.length,pipeTris:tris,ms:Math.round(performance.now()-t0)},n);
 return GILLS_DRAW.counts;}
const gillsSteamOn=b=>b>.08;
/* THE CANDLES AGAINST THE LIGHT (PLAN.md section 11 item 4: "invisible at noon, plain at dusk"). On the SUN'S ALTITUDE, not the clock: this site
   is at latitude -57.6 and its sun sets about 15.7 h, so an hour-of-day curve calibrated to a 6 a.m. to 6 p.m. day reads the light wrong here and
   would read it wrong again at the Red Gills. A flame shows when the light is low, wherever the page stands. */
const candleAlpha=alt=>.10+.62*smooth(12,-4,alt);
const sunAltNow=(function(){let h0=-999,a0=0;return()=>{const h=gillsHour();if(Math.abs(h-h0)<.02)return a0;h0=h;
  try{const site=ATMOS.skySite||ATMOS.siteAt(STAGE.site.px,STAGE.site.py);a0=ATMOS.skyState(site,h,GDAY()).sunAlt;}catch(e){a0=0;}return a0;};})();
// ---- the checks (biomes/gills/PLAN.md section 16, G6, as far as this page goes), each with a negative; 99-host-take.js reads STATION_CHECKS
const GCHK={
 tall(R){const bad=R.filter(o=>o.B.top-o.p.y0>=90);return{ok:R.length>20&&!bad.length,detail:R.length+' pipes, the tallest '+Math.max(...R.map(o=>o.B.top-o.p.y0)).toFixed(1)+' m'};},
 white(R){const S=R.filter(o=>o.p.state==='standing'),mean=S.reduce((a,o)=>a+(o.B.top-o.p.y0),0)/Math.max(1,S.length),
  over=S.filter(o=>o.B.top-o.p.y0>38).length,branched=S.filter(o=>o.p.mouths>1).length;
  return{ok:S.length>20&&!over&&mean<36&&branched>0,detail:'the White form: mean '+mean.toFixed(1)+' m, '+over+' standing pipes over 38 m, '+branched+' of '+S.length+' branching'};},
 steam(fn,day){day=GDAY();const tp=day+GILLS.peakHour(day)/24,out=gillsSteamOn(fn(tp)),inn=gillsSteamOn(fn(tp+.5)),
  n=GILLS_DRAW.life?GILLS_DRAW.life.steam.length:0;
  return{ok:n>0&&out&&!inn,detail:n+' steaming mouths; at the '+GILLS.NAMES.out+' ('+GILLS.peakHour(day).toFixed(2)+' h) '+(out?'on':'OFF')+', twelve hours on '+(inn?'ON':'off')};},
 burn(CA,Lg){const bad=CA.filter(c=>{const g=Lg.gills.find(q=>q.id===c.gill);return !g||g.alive;});
  return{ok:CA.length>0&&!bad.length,detail:CA.length+' candles, '+bad.length+' of them on a breathing gill (which steams, it does not burn)'};},
 crust(CA){const bad=CA.filter(c=>!(c.crust>c.r)||!(c.h>=.4&&c.h<=1.6));
  return{ok:CA.length>0&&!bad.length,detail:bad.length+' candles whose flame is over 1.6 m or wider than its heat crust'};},
 dusk(){const noon=candleAlpha(35),dusk=candleAlpha(2.4);return{ok:dusk>noon*2.5,detail:'the flames read '+noon.toFixed(2)+' under a high sun against '+dusk.toFixed(2)+' with the sun 2.4 degrees up (this page opens there)'};},
 sites(S){if(!S)return{ok:false,detail:'no site record'};
  const ok=S.format==='gills-field-site'&&!!S.hermitage&&!!S.gasHouse&&S.candleGills.indexOf(S.field)<0&&S.candleGills.indexOf(S.gasHouse.throat)>=0;
  return{ok,detail:'the hermitage in silent '+S.field+', the gas-house on burning '+(S.gasHouse?S.gasHouse.throat:'none')+', '+S.hearths.length+' hearths'};},
 live(R,Lg){const bad=R.filter(o=>o.p.live&&!(Lg.gills.find(g=>g.id===o.p.gill)||{}).alive);
  return{ok:!bad.length,detail:bad.length+' pipes alive on a closed gill'};}};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 if(GILLS_DRAW.pipes.length){
  add('the breath pipes stand under 90 m (KSTACKS chimney records)',GCHK.tall(GILLS_DRAW.pipes));
  add('the White form is squat and branching, under 38 m at this field',GCHK.white(GILLS_DRAW.pipes));
  add('no live pipe on a closed gill',GCHK.live(GILLS_DRAW.pipes,SG.L));
  if(GILLS_DRAW.life&&GILLS_DRAW.life.steam.length)add('steam at the live mouths on the out-breath and none on the in-breath',GCHK.steam(GILLS.breath,0));}
 if(GILLS_DRAW.candles.length){
  add('every candle burns at a dry gill and never at a breathing one',GCHK.burn(GILLS_DRAW.candles,SG.L));
  add('every candle keeps a black heat crust wider than its flame',GCHK.crust(GILLS_DRAW.candles));
  add('the candles are plain at dusk and all but invisible under a high sun',GCHK.dusk());}
 add('the field publishes its sites and builds none of them',GCHK.sites(CATCH_GILLS_SITE));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 if(GILLS_DRAW.pipes.length){
  add('a pipe of 120 m',GCHK.tall(GILLS_DRAW.pipes.concat([{p:{y0:0},B:{top:120}}])));
  add('the Red form (tall and single-mouthed)',GCHK.white(GILLS_DRAW.pipes.map(o=>({p:Object.assign({},o.p,{mouths:1}),B:{top:o.p.y0+70}}))));
  add('a live pipe on a closed gill',GCHK.live(GILLS_DRAW.pipes.concat([{p:{live:true,gill:(SG.L.gills.find(g=>!g.alive)||{}).id}}]),SG.L));
  if(GILLS_DRAW.life&&GILLS_DRAW.life.steam.length)add('the breath a half day out (steam on the in-breath)',GCHK.steam(t=>GILLS.breath(t+.5),0));}
 if(GILLS_DRAW.candles.length){
  add('a candle on a breathing gill',GCHK.burn(GILLS_DRAW.candles.concat([{gill:(SG.L.gills.find(g=>g.alive)||{}).id}]),SG.L));
  add('a flame of 4 m with no crust',GCHK.crust(GILLS_DRAW.candles.concat([{r:2,crust:1,h:4}])));}
 add('a site record with the hermitage in the flames',GCHK.sites(CATCH_GILLS_SITE?Object.assign({},CATCH_GILLS_SITE,{candleGills:[CATCH_GILLS_SITE.field]}):null));
 return R;}
