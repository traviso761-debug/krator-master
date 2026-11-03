// ================================================================= HOST — STATION gills: the life on the Wāiṭ Gīl (biomes/gills, read in place: 44-gills-life.js)
// stationBuild() (89z calls it after the kit's pass, before the bake) draws GILLS.life's records on this land:
//   THE PIPES (Phlū)   each a KSTACKS chimney record (core/terrain 37, kind 'chimney': the White form, squat, bulbous, branching to three mouths; the
//                      dead field's broken, fallen and rubble; the ice pipes over the glacier's edge in their ice dress), registered in core/tags
//                      (BIO.record) before it is drawn, its mesh KSTACKS.mesh's own, merged by 600 m chunk; banded bone-white and cream with grey-green
//                      manganese every third bed (the lamina recipe is owed: KSTRATA.lamina is on claude/core-gills-hearths-c44212, not merged)
//   ON THE BREATH      BIO.animMat mode 'breath' (core/biome 35) on one state, BIO.breathState('gills'), written once a frame from GILLS.breath(t):
//                      the collars (Qolar) brighten from the charged grey-green to tan as they discharge on the out-breath (albedo), the fringes
//                      stream out of the mouths (stream), the bellows pads swell over the narrow cracks (bulge), the tide beads roll out from the
//                      floors (stream along each bead's own vector); the throat lamps glow faint blue on the in-breath only (the owner, 2026-11-02)
//   THE MEADOW         downwind (south-east): the dew mat, the salt cups at its edge, the limewood inside
//   THE STEAM          core/atmos's steam (ATMOS.smoke, kind 'steam') at the live mouths, drawn through the out-breath only
// The checks (99 calls stationChecks / stationNegatives): PLAN.md section 16 G6's invariants that apply on this page, each with a negative.
const GILLS_DRAW={pipes:[],steam:null,lampMat:null,meshes:[],counts:{}};
function stationBuild(){const SG=STATION_GILLS,D=GILLS.dress('white'),T3=THREE,t0=performance.now();
 const L=GILLS.life(SG.L,{ground:drawnH,iceH:LAND.snowH,treeH:4750,lip:[3,10],step:22,wind:[.7,.7],seed:0x6A12});GILLS_DRAW.life=L;
 const k0=BIO.kit('gills'),r0=BIO.range,c0=BIO.cur;BIO.cur='xanadu/dress';
 // ---- the gills as volumes, the pipes as chimney records (core/tags before the draw)
 SG.L.gills.forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r;
  REGISTER({name:GILLS.NAMES.white+': '+g.id+(g.alive?' (breathing)':' (closed: a pipe field, Phlū-phīlḍ)'),kind:'gill',x,z,y:terrainH(x,z)-g.d,r:g.r*(g.a1-g.a0)/2,h:g.d+60});});
 const recs=[];
 L.pipes.forEach(p=>{let B=null;try{B=KSTACKS.make({kind:'chimney',id:p.id,x:p.x,z:p.z,y0:p.y0-.6,seed:p.seed,form:'pipe',H:p.H,r:p.r,taper:1.05,lobes:.12,
   flare:{from:.55,k:1.55,p:1.5},mouths:p.mouths,fork:.62,spread:.38,lean:p.lean,toward:p.toward,state:p.state,ice:p.ice?{from:0,thick:.45}:undefined,fan:p.state==='standing'?false:undefined});}catch(e){return;}
  BIO.record({name:(p.state==='standing'?GILLS.NAMES.pipe:GILLS.NAMES.dead)+' '+p.id,kind:'chimney',x:p.x,z:p.z,y:p.y0,r:B.R,h:B.top-p.y0});recs.push({p,B});});
 GILLS_DRAW.pipes=recs;
 // ---- their meshes, merged by chunk (the record's own mesh: what the eye sees is what at() and surface() answer)
 const lin=c=>{const q=new T3.Color(c[0],c[1],c[2]);return q.convertSRGBToLinear();},cW=lin(D.pipe),cB=lin(D.band),cI=lin([.82,.9,.96]);
 /* THE LAMINAE (core/terrain 35b, KSTRATA.lamina; LAMINA.md "Adopting it"): four columns, one per variant (a pipe keeps its variant), the White
    country's bone and grey-green couplets, the thin years (Thin Yīr) 300 years down; drawn by KSTRATA.laminaShade at the depth from the pipe's lip (aD).
    The outside weathers toward the crust colour (the vertex colour); the bore and a broken lip show them clean (occ). ?lamina=0 the banded colour alone */
 const NV=4,LAM=(typeof KSTRATA!=='undefined'&&KSTRATA.lamina&&KSTRATA.laminaShade&&XQ_ON('lamina'))?[0,1,2,3].map(v=>{const Lc=KSTRATA.lamina({seed:KRAND.hash(23,v,0x1a),H:90,country:'white',markers:[{name:GILLS.NAMES.thin,kind:'thin',age:300}]});return{L:Lc,S:KSTRATA.laminaShade(Lc,{THREE:T3})};}):null;
 GILLS_DRAW.lamina=LAM;
 const pipeMat=v=>{const m=new T3.MeshLambertMaterial({vertexColors:true});m.userData.gills='pipe';if(!LAM)return m;const S=LAM[v].S;
  m.extensions={derivatives:true};m.customProgramCacheKey=()=>'gills-pipe-lamina-'+v;
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,S.uniforms);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aD;varying vec2 vD;').replace('#include <begin_vertex>','#include <begin_vertex>\nvD=aD;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vD;\n'+S.glsl).replace('#include <color_fragment>','#include <color_fragment>\n{vec3 lc=laminaColor(vD.x,fwidth(vD.x));diffuseColor.rgb=mix(lc,diffuseColor.rgb,mix(0.5,0.1,vD.y));}');};
  return m;};
 const MATS=[0,1,2,3].map(pipeMat);
 const CH={};recs.forEach(o=>{const v=(o.p.seed>>>0)%NV,key=Math.floor(o.p.x/600)+','+Math.floor(o.p.z/600)+','+v;o.v=v;(CH[key]||(CH[key]=[])).push(o);});
 let tris=0;Object.keys(CH).forEach(key=>{const pos=[],col=[],idx=[],dd=[],v=+key.split(',')[2];
  CH[key].forEach(o=>{const m=KSTACKS.mesh(o.B,{step:2.2,bore:'open'}),n0=pos.length/3,nv=m.pos.length/3;
   for(let i=0;i<nv;i++){const y=m.pos[i*3+1];pos.push(m.pos[i*3],y,m.pos[i*3+2]);const b=m.bed?m.bed[i]:0,occ=m.occ?m.occ[i]:0,ice=m.ice?m.ice[i]:0,man=(b%3===0)?.32:0;
    const r=(cW.r*(1-man)+cB.r*man)*(1-.75*occ),g=(cW.g*(1-man)+cB.g*man)*(1-.75*occ),bb=(cW.b*(1-man)+cB.b*man)*(1-.75*occ);
    col.push(r+(cI.r-r)*ice,g+(cI.g-g)*ice,bb+(cI.b-bb)*ice);dd.push(Math.max(0,o.B.top-y),Math.min(1,occ*1.6+ice));}
   for(let i=0;i<m.idx.length;i++)idx.push(m.idx[i]+n0);});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setAttribute('aD',new T3.Float32BufferAttribute(dd,2));g.setIndex(idx);g.computeVertexNormals();
  const me=new T3.Mesh(g,MATS[v]);me.userData.host=true;me.userData.inspectLabel='Breath pipes (Phlū) of the Wāiṭ Gīl: one lamina a day, the oldest older than the Ancients';scene.add(me);GILLS_DRAW.meshes.push(me);tris+=idx.length/3;});
 BIO.tally&&BIO.tally(tris,0,0);
 // ---- the items: unit geometries with a white vertex colour (the put's colour is the dress)
 const white=g=>{const n=g.attributes.position.count,c=new Float32Array(n*3).fill(1);g.setAttribute('color',new T3.BufferAttribute(c,3));return g;};
 const lathe=(pts,seg)=>white(new T3.LatheGeometry(pts.map(p=>new T3.Vector2(p[0],p[1])),seg||12));
 const collarG=lathe([[1.0,-.15],[1.18,0],[1.22,.18],[1.08,.32],[.92,.3]],14);
 const fringeG=(function(){const g=new T3.PlaneGeometry(.12,1,1,4);g.translate(0,.5,0);return white(g);})();
 const padG=(function(){const g=new T3.SphereGeometry(1,14,6,0,Math.PI*2,0,Math.PI*.42);g.scale(1,.35,1);g.translate(0,-.25,0);return white(g);})();
 const beadG=white(new T3.IcosahedronGeometry(1,1));
 const dewG=(function(){const g=new T3.CircleGeometry(1,10);g.rotateX(-Math.PI/2);g.translate(0,.03,0);return white(g);})();
 const cupG=lathe([[.0,0],[.7,.05],[1,.35],[.95,.5],[.85,.45],[.6,.2],[0,.15]],12);
 const trunkG=white(new T3.CylinderGeometry(.8,1,1,7,1));trunkG.translate(0,.5,0);
 const capG=(function(){const g=new T3.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI*.55);g.scale(1,.45,1);return white(g);})();
 const lampG=(function(){const g=new T3.CircleGeometry(1,10);g.rotateX(-Math.PI/2);return white(g);})();
 const BM=(key,o)=>BIO.animMat('gills:'+key,Object.assign({mode:'breath',vertexColors:true},o));
 BIO.def('gcollar',collarG,BM('collar',{breath:{key:'gills',shape:'bulge',amp:.05,albedo:1.55}}),{attrs:['aP0','aP1'],label:'Lime collar (Qolar): grey-green charged, tan as it discharges on the Bhlo'});
 BIO.def('gfringe',fringeG,BM('fringe',{side:T3.DoubleSide,breath:{key:'gills',shape:'stream',amp:1.3,top:1}}),{attrs:['aP0','aP1'],label:'Breath fringe: streams out on the Bhlo, sucked flat on the Suq'});
 BIO.def('gpad',padG,BM('pad',{breath:{key:'gills',shape:'bulge',amp:.45}}),{attrs:['aP0','aP1'],label:'Bellows pad: swells on the out-breath'});
 BIO.def('gbead',beadG,BM('bead',{breath:{key:'gills',shape:'stream',amp:1}}),{attrs:['aP0','aP1'],label:'Tide beads: rolled out on the Bhlo and back on the Suq (roasted, they are food)'});
 BIO.def('gdew',dewG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Dew mat, crusted with the mist\'s lime'});
 BIO.def('gcup',cupG,new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),{label:'Salt cup: the breath-water (Bhlo-wāṭar), drinkable'});
 BIO.def('gtrunk',trunkG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Limewood'});
 BIO.def('gcap',capG,new T3.MeshLambertMaterial({vertexColors:true}),{label:'Limewood: caps crusted with lime'});
 GILLS_DRAW.lampMat=new T3.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,fog:false});
 BIO.def('glamp',lampG,GILLS_DRAW.lampMat,{label:'Throat lamp: faint blue, on the in-breath only',free:true});
 const C=c=>new T3.Color(c[0],c[1],c[2]),q=new T3.Quaternion(),e=new T3.Euler(),Q=(x,y,z)=>{e.set(x,y,z);q.setFromEuler(e);return[q.x,q.y,q.z,q.w];};
 const n={};const put=(it,p,r,s,c,x)=>{BIO.put(it,p,r,s,c,x);n[it]=(n[it]||0)+1;};
 BIO.range=1200;L.collars.forEach(c=>{BIO.owner=[c.x,c.z];put('gcollar',[c.x,c.y,c.z],null,[c.r,c.r*.8,c.r],C(D.collar),{aP0:[0,0,0,1],aP1:[c.lag,0,0,0]});});
 BIO.range=700;L.fringes.forEach(f=>{BIO.owner=[f.x,f.z];const dx=Math.cos(f.yaw),dz=Math.sin(f.yaw);put('gfringe',[f.x,f.y,f.z],Q(0,-f.yaw,0),[1,f.len,1],C(D.fringe),{aP0:[dx*.5,.85,dz*.5,1],aP1:[f.lag,0,0,0]});});
 BIO.range=900;L.pads.forEach(p=>{BIO.owner=[p.x,p.z];put('gpad',[p.x,p.y,p.z],Q(0,p.yaw,0),[p.r,p.r,p.r*.6],C([.86,.84,.78]),{aP0:[0,0,0,1],aP1:[p.lag,0,0,0]});});
 BIO.range=400;L.beads.forEach(b=>{const y=drawnH(b.x,b.z);BIO.owner=[b.x,b.z];put('gbead',[b.x,y+b.r*.8,b.z],null,b.r,C(D.bead),{aP0:[b.dir[0]*1.6,0,b.dir[1]*1.6,1],aP1:[b.lag,0,0,0]});});
 BIO.range=800;L.dew.forEach(d=>{BIO.owner=[d.x,d.z];put('gdew',[d.x,drawnH(d.x,d.z),d.z],Q(0,d.yaw,0),[d.r,1,d.r*.8],C(D.dew));});
 L.cups.forEach(c=>{BIO.owner=[c.x,c.z];put('gcup',[c.x,drawnH(c.x,c.z)-.02,c.z],null,[c.r,c.r,c.r],C(D.cup));});
 L.wood.forEach(w=>{BIO.owner=[w.x,w.z];const y=drawnH(w.x,w.z),s=KRAND.stream(w.seed);put('gtrunk',[w.x,y-.2,w.z],null,[w.r,w.H,w.r],C(D.wood));
  for(let k=0;k<w.caps;k++){const a=s.next()*Math.PI*2,h=w.H*(.55+.45*s.next()),off=w.r*(1+2*s.next())*(k?1:0),cr=.5+.9*s.next();put('gcap',[w.x+Math.cos(a)*off,y+h,w.z+Math.sin(a)*off],null,[cr,cr,cr],C(D.cap));}});
 BIO.range=600;L.lamps.forEach(l=>{BIO.owner=[l.x,l.z];put('glamp',[l.x,l.y,l.z],null,[l.r,1,l.r],C([.45,.7,1]));});
 BIO.owner=null;BIO.range=r0;BIO.cur=c0;BIO.kitEnd(GILLS);BIO.kit(k0);
 // ---- the steam at the live mouths and over the milky pools (their thermal plans), one group scaled by the breath (ATMOS.smokeGroups)
 const em=L.steam.map(s=>[s.x,s.y,s.z,'steam']).concat((typeof GILL_POOLS!=='undefined'?GILL_POOLS:[]).map(P=>[P.x,P.y+.5,P.z,'steam']));
 GILLS_DRAW.steam=em.length&&ATMOS.smokeGroups?ATMOS.smokeGroups({breath:{emitters:em,k:0}}):null;
 // ---- THE HAZARDS (core/hazard; each a core/tags record before it is drawn: REGISTER): the throats' in-breath, a grab that pulls toward the mouth while the
 // Suq draws ('GILLS.suck': 1 - the breath); the live gills' sumps, where the Bhlo's gas pools on the floor (gas, the floor's 4 m)
 if(typeof KHAZ!=='undefined'){KHAZ.STATES=KHAZ.STATES||{};KHAZ.STATES['GILLS.suck']=(r,h,t)=>{const k=1-GILLS.breath(gillsClockT());return{state:k>0?'drawing':'still',k,on:k>0};};
  SG.L.gills.filter(g=>g.alive).forEach(g=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r,y=terrainH(x,z),d=8;
   REGISTER({name:'A throat drawing on the Suq ('+g.id+'): "Suq-ān na-sṭãḍ", do not stand on the suck',x,z,y,r:6,h:d+4,
    tags:{hazard:{kind:'grab',danger:.7,falloff:'linear',shape:{type:'cyl',r:6,h:d+4,y0:-d},move:{speed:.5,pull:1.2,to:[0,-d,0]},stateFn:'GILLS.suck',tell:{sign:'dust streaming into the mouth'}}}});
   const pts=[];for(let k=0;k<=8;k++){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r-g.w*.2),g.c[1]+Math.sin(an)*(g.r-g.w*.2)]);}
   for(let k=8;k>=0;k--){const an=g.a0+(g.a1-g.a0)*(.3+.4*k/8);pts.push([g.c[0]+Math.cos(an)*(g.r+g.w*.2),g.c[1]+Math.sin(an)*(g.r+g.w*.2)]);}
   REGISTER({name:'The sump of '+g.id+': the out-breath\'s gas pools on the floor',x,z,y,r:g.r*(g.a1-g.a0)*.2,h:6,
    tags:{hazard:{kind:'gas',danger:1,falloff:'none',shape:{type:'poly',pts:pts.map(p=>[p[0]-x,p[1]-z]),h:4,pool:2},tell:{sign:'dead beads and no dew on the floor'}}}});});}
 // ---- the one tick: the breath state, the lamps, the steam, from the page's clock
 TICKS.push(()=>{const b=GILLS.breath(gillsClockT());BIO.breathState('gills').value=b;GILLS_DRAW.b=b;if(GILLS_DRAW.lampMat)GILLS_DRAW.lampMat.opacity=.75*(1-b);if(GILLS_DRAW.steam)GILLS_DRAW.steam.set('breath',gillsSteamOn(b)?b:0);});
 GILLS_DRAW.counts=Object.assign({pipes:recs.length,standing:recs.filter(o=>o.p.state==='standing').length,ice:recs.filter(o=>o.p.ice).length,live:recs.filter(o=>o.p.live).length,steam:L.steam.length,pipeTris:tris,ms:Math.round(performance.now()-t0)},n);
 return GILLS_DRAW.counts;}
const gillsSteamOn=b=>b>.08;
// ---- the checks (PLAN.md section 16, G6, as far as this page goes), each with a negative
const GCHK={
 // every pipe under 90 m, from the drawn records (the KSTACKS body's own top)
 tall(R){const hi=R.reduce((m,o)=>Math.max(m,o.B.top-o.p.y0),0);return{ok:R.length>100&&hi<90,detail:R.length+' pipes, the tallest '+hi.toFixed(1)+' m'};},
 // the out-breath shows steam at every live mouth that steams, the in-breath none: the page's own rule, at the day's peak and twelve hours on
 steam(fn,day){const tp=day+GILLS.peakHour(day)/24,out=gillsSteamOn(fn(tp)),inn=gillsSteamOn(fn(tp+.5)),n=GILLS_DRAW.life?GILLS_DRAW.life.steam.length:0;
  return{ok:n>0&&out&&!inn,detail:n+' steaming mouths; at the Bhlo ('+GILLS.peakHour(day).toFixed(2)+' h) '+(out?'on':'OFF')+', twelve hours on '+(inn?'ON':'off')};},
 // Alph's fountain is forced on the out-breath and not on the in-breath
 fountain(fn,day){const tp=day+GILLS.peakHour(day)/24,a=fn(tp)>.03,b=fn(tp+.5)>.03;return{ok:a&&!b,detail:'the fountain at the Bhlo '+(a?'bursts':'is STILL')+', on the Suq '+(b?'BURSTS':'is still')};},
 // a live pipe only on a breathing gill, never iced; an ice pipe only over the ice line
 live(R,ice){const bad=R.filter(o=>(o.p.live&&(o.p.ice||!STATION_GILLS.L.gills.find(g=>g.id===o.p.gill).alive))||(o.p.ice&&o.p.y0<=ice));return{ok:!bad.length,detail:bad.length+' pipes out of place; '+R.filter(o=>o.p.ice).length+' ice pipes, '+R.filter(o=>o.p.live).length+' live'};},
 // nothing of the Vale's flora over 4,750 m or in a gill (PLAN.md section 7: nothing of it climbs)
 climb(trees){const bad=trees.filter(T=>T.lv>0&&(T.y0>4752||GILLS.gillAt(STATION_GILLS.L,T.x,T.z)));return{ok:!bad.length&&trees.length>0,detail:trees.length+' trees of the Vale, '+bad.length+' over 4,750 m or in a gill'};}};
function stationChecks(add){add('the breath pipes stand under 90 m (KSTACKS chimney records)',GCHK.tall(GILLS_DRAW.pipes));
 add('steam at the live mouths on the out-breath (Bhlo), none on the in-breath (Suq)',GCHK.steam(GILLS.breath,0));
 add('Alph\'s fountain forced by the out-breath only (Ālph-bi Bhlo)',GCHK.fountain(GILLS.breath,0));
 add('live pipes on breathing gills, ice pipes over the ice line only',GCHK.live(GILLS_DRAW.pipes,LAND.snowH));
 add('the Vale\'s flora does not climb past 4,750 m or into a gill',GCHK.climb(XANADU.TREES));}
function stationNegatives(add){add('a pipe of 120 m',GCHK.tall(GILLS_DRAW.pipes.concat([{p:{y0:0},B:{top:120}}])));
 add('the breath a half day out (steam on the in-breath)',GCHK.steam(t=>GILLS.breath(t+.5),0));
 add('the fountain on a clock half a day out',GCHK.fountain(t=>GILLS.breath(t+.5),0));
 add('a live pipe on a closed gill',GCHK.live(GILLS_DRAW.pipes.concat([{p:{live:true,ice:false,gill:(STATION_GILLS.L.gills.find(g=>!g.alive)||{}).id,y0:0}}]),LAND.snowH));
 add('a Vale tree at 5,000 m',GCHK.climb(XANADU.TREES.concat([{lv:2,y0:5000,x:0,z:0}])));}
