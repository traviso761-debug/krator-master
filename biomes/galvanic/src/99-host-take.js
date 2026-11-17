// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The checks are the plan's invariants (PLAN.md section 16, G4), each with a negative: the masts stand in acid water, nothing native grows where the acid
// never reaches and no Rift tree where it does, the living skins keep above the flood line the store can bridge, every jar lies below the year's highest
// water, the terraces lie where the stream's pH has crossed 2.8, nothing glows, the sea stands at the season's level.
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
// the views: station 1's own; stations 2 and 3 theirs from their shapes (a jar's view at the jar nearest the page's centre)
const nearJar=()=>{let b=null;for(const r of GALV.PLACED)if(r[0]==='jar'&&(!b||Math.hypot(r[1],r[3])<Math.hypot(b[1],b[3])))b=r;return b||['jar',0,0,0];};
const treadMid=(S,k)=>{const t=S.T.length?S.T[Math.min(k,S.T.length-1)]:null;return S.F.point(t?(t.s0+t.s1)/2:S.F.L*.6);};
const VIEWS=SKEY==='deep'?(function(){const C=SITE.smokers,j=nearJar(),N=STREAMS[0],ne=N.F.point(N.F.L-30);
 return{'The brine edge':look(-150,-985,1.8,100,-760,0),'The chimneys on the rim':look(-660,-1010,3,-560,-860,6),'The bathtub ring':look(300,-845,2.5,450,-560,0),
  'Across the Deep':look(900,-300,18,-300,-200,0),'The north stream falls in':look(ne[0]+18,ne[1]-22,3,ne[0]-4,ne[1]+30,0),
  'The flood line (the store jars)':look(j[1]+5,j[3]-6,1.2,j[1]-4,j[3]+5,0),'The rim and the sea':look(700,330,8,200,1200,0),'From afar':look(-1500,-1700,300,0,-150,0)};})():
 SKEY==='gossan'?(function(){const hp=ORE.F.point(ORE.sx*.55),sx=ORE.F.point(ORE.sx),j=nearJar(),t0=treadMid(STREAMS[0],3),t1=treadMid(STREAMS[1],3);
 return{'The iron hat':look(hp[0]+70,hp[1]+45,6,hp[0],hp[1],4),'The seeps on the line':look(sx[0]+55,sx[1]-30,2.4,sx[0]-10,sx[1]+10,0),
  'The seep stream (the drowned ore)':look(t0[0]+16,t0[1]-14,2.2,t0[0]-6,t0[1]+10,0),'The footwall seep terraces':look(t1[0]+14,t1[1]-16,2.2,t1[0]-6,t1[1]+10,0),
  'The flood line (the store jars)':look(j[1]+5,j[3]-6,1.2,j[1]-4,j[3]+5,0),'Up the hill':look(300,1300,6,100,-500,30),'Down the hill':look(260,-1400,25,0,800,0),
  'From afar':look(-1900,1500,300,0,0,0)};})():(function(){const S1=STREAMS[1],m=s=>S1.F.point(s),M0=MOUNDS[2],tt=S1.T.length?S1.T[Math.min(3,S1.T.length-1)]:null,tp=tt?m((tt.s0+tt.s1)/2):m(S1.F.L*.6);
 const sp=m(Math.min(60,S1.F.L*.1)),jarZ=(function(){for(let z=-1300;z<2600;z+=10)if(FLOOD_T(terrainH(-400,z)-SITE.sea)>0)return z;return 0;})();
 return{'The strand at noon':look(-1250,-1150,22,-150,150,0),'A stream\'s iron terraces':look(tp[0]+14,tp[1]-16,2.2,tp[0]-6,tp[1]+10,0),
  'An acid spring and its masts':look(sp[0]+10,sp[1]-12,1.7,sp[0],sp[1]+8,0),'A sulfide mound':look(M0.x+M0.r*1.8,M0.z+M0.r*1.4,4,M0.x,M0.z,M0.h*.6),
  'The Deep':look(DP.x-DP.r*1.3,DP.z-DP.r*.9,45,DP.x,DP.z,-5),'The flood line (the store jars)':look(-400+5,jarZ-6,1.2,-400-4,jarZ+5,0),
  'The shore':look(-200,1300,6,300,2400,0),'From the hills':look(-300,-2300,60,200,600,0),'From afar':look(-2400,-2000,320,400,600,0)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&GALV.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 const c=GALV_PHYS.cell({pH:Math.min(PH_AT(p.x,p.z),6),o2:GALV_PHYS.season(DAY).o2At(OVER(p.x,terrainH(p.x,p.z),p.z)),pump:window._tide?window._tide.pump:0});
 return name+'\n'+(isItem?(PLT?'native · the battery\'s':'flora')+' · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' ')+' · partner: '+tg.partner:'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\npH '+PH_AT(p.x,p.z).toFixed(1)+' · the couple here '+c.ocv.toFixed(2)+' V, '+c.p.toFixed(1)+' mW/m2 (the tidal pump at '+((window._tide?window._tide.pump:0)*100|0)+'%) · flooded '+FLOOD_AT(p.x,p.z)+' days a year · '+HEAT_AT(p.x,p.z).toFixed(0)+' degC'+(ORE?' · self-potential '+SP_AT(p.x,p.z).toFixed(2)+' V'+(HAT_AT(p.x,p.z)>.5?' (the iron hat: no couple left)':''):'')+'\n'+
  p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:8000000,calls:120},cls:{life:3000000,kin:3000000,host:2500000},type:{'galvanic/strand':'life','galvanic/kin':'kin','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const LIVE_DAYS=60;
// station 3: the self-potential on the surface (GALV_PHYS.sp) from the ore's oxidised top (the outcrop above the line); past the line, the distance to it
const SP_AT=(x,z)=>{const q=ORE.F.at(x,z),d=q.s>ORE.sx?Math.hypot(q.d,q.s-ORE.sx):q.d;return GALV_PHYS.sp(d,{pH:ORE.pH,depth:ORE.depth});};
const FLOODY=r=>FLOOD_T(OVER(r[1],r[2],r[3]));   /* a placed record's flood days, read against the site's datum */
const HCHK={
 placed(st){const need=['runners','crusts','masts','reefs','jars'],zero=need.filter(k=>!(st&&st[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};},
 // the masts stand in acid water (pH under 4, in the stream: GALV_PHYS.stream)
 masts(R){const bad=R.filter(r=>r[0]==='mast'&&!(PH_AT(r[1],r[3])<4&&waterH(r[1],r[3])>r[2]));const n=R.filter(r=>r[0]==='mast').length;
  return{ok:n>0&&!bad.length,detail:bad.length?bad.length+' of '+n+' out of acid water (first at '+bad[0].slice(1,4).map(v=>v|0)+')':n+' masts, all in water under pH 4'};},
 // the battery's life only on acid ground (its items: gv*), the Rift's trees only off it
 acidLine(P,K){const bad=P.filter(p=>/^biome:gv/.test(p[3])&&PH_AT(p[0],p[2])>=5.4),badK=(K||[]).filter(k=>PH_AT(k[0],k[1])<KIN_PH);
  return{ok:!bad.length&&!badK.length,detail:(bad.length?bad.length+' battery items past the acid (first '+bad[0][3]+')':'every battery item on acid ground')+'; '+(badK.length?badK.length+' Rift trees on acid ground':(K||[]).length+' Rift trees, all past pH '+KIN_PH)};},
 // living skins above the line a 60-day flood reaches; dead ones below it
 floodLine(R){const bad=R.filter(r=>(r[0]==='mast'||r[0]==='reef')&&(r[4]?FLOODY(r)>LIVE_DAYS:FLOODY(r)<=LIVE_DAYS));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong side of the flood line (first '+bad[0][0]+' live='+bad[0][4]+' at '+OVER(bad[0][1],bad[0][2],bad[0][3]).toFixed(2)+' m)':'living skins above the 60-day line, dead ones below'};},
 // the jars: only where the sea lies some days a year (below its highest), alive where the store bridges the flood
 jars(R){const J=R.filter(r=>r[0]==='jar'),bad=J.filter(r=>{const d=FLOODY(r);return d<=0||(r[4]?!GALV_PHYS.store(OVER(r[1],r[2],r[3]),{amp:SWING}).alive:false);});
  return{ok:J.length>0&&!bad.length,detail:bad.length?bad.length+' of '+J.length+' jars off the flood line':J.length+' jars, every one under the year\'s highest water'};},
 // the terraces start where the stream's pH has crossed 2.8 (GALV_PHYS.streamAtPH)
 terraces(SS){const bad=[];let n=0;SS.forEach(S=>{S.T.forEach(t=>{n++;const p=GALV_PHYS.stream(Object.assign({},S,{s:t.s0})).pH;if(p<2.79||p>4.05)bad.push(S.name+' at '+t.s0.toFixed(0)+' m (pH '+p.toFixed(2)+')');});});
  return{ok:n>0&&!bad.length,detail:bad.length?'out of the 2.8-4 band: '+bad.slice(0,3).join('; '):n+' treads, all where the water runs pH 2.8-4'};},
 // nothing glows: no emissive colour or map on any lit material but the sky's
 noGlow(list){const bad=[];list.forEach(m=>{if(m&&m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b>.003||m.emissiveMap))bad.push(m.name||m.type);});return{ok:!bad.length,detail:bad.length?'glowing: '+bad.slice(0,4).join(', '):list.length+' materials, none emissive'};},
 // the page's pump is the sky's clock: GALV_PHYS.tide on ATMOS.libration at the page's own time
 tide(T){if(!T||!ATMOS.libration)return{ok:false,detail:'no pump on the page (window._tide) or no ATMOS.libration'};const want=GALV_PHYS.tide(ATMOS.libration(T.t));
  return{ok:Math.abs(T.pump-want)<1e-6,detail:'the pump '+(+T.pump).toFixed(3)+' at day '+(+T.t).toFixed(3)+' (the libration gives '+want.toFixed(3)+'); its peak at '+(+T.peakHour).toFixed(2)+' h today'};},
 sea(level){const want=SITE.sea+GALV_PHYS.level(DAY);return{ok:Math.abs(level-want)<1e-6,detail:'the sea at '+(+level).toFixed(3)+' m (day '+DAY+': '+want.toFixed(3)+')'};},
 // station 2: the chimneys stand on the lowest ground under their feet (none in the air, none sunk past a metre and a half)
 chimneys(C){if(!C||!C.length)return{ok:false,detail:'no chimneys'};const bad=C.filter(c=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH(c.x+Math.cos(a)*c.r,c.z+Math.sin(a)*c.r));}lo=Math.min(lo,terrainH(c.x,c.z));return c.y0>lo-.05||c.y0<lo-1.5-c.r*Math.sin(c.lean)*1.3;});
  return{ok:!bad.length,detail:bad.length?bad.length+' of '+C.length+' chimneys off their ground (first at '+bad[0].x+','+bad[0].z+')':C.length+' chimneys, each seated on the lowest ground of its foot'};},
 // station 2: the steam rises only off the hot brine (inside the Deep, where KTHERM's field is over SITE.steam.hot)
 steam(P){if(!P||!P.length)return{ok:false,detail:'no steam'};const bad=P.filter(p=>!(DP&&Math.hypot(p[0]-DP.x,p[2]-DP.z)<DP.r&&HEAT_AT(p[0],p[2])>=SITE.steam.hot));
  return{ok:!bad.length,detail:bad.length?bad.length+' steam columns off the hot brine (first at '+bad[0][0].toFixed(0)+','+bad[0][2].toFixed(0)+')':P.length+' steam columns, all over brine at '+SITE.steam.hot+' degC or more'};},
 // station 2: the season's brine stands on the shelf (the bathtub ring between its two heights)
 shelf(level){const a=SITE.sea+DP.shelf[0],b=SITE.sea+DP.shelf[1];return{ok:level>a&&level<b,detail:'the brine at '+(+level).toFixed(2)+' m on the shelf\'s '+a.toFixed(1)+' to '+b.toFixed(1)+' m'};},
 // station 3: no battery life on the iron hat (its sulfides are leached: no couple)
 hat(P){const bad=P.filter(p=>/^biome:gv/.test(p[3])&&HAT_AT(p[0],p[2])>.5);return{ok:!bad.length,detail:bad.length?bad.length+' battery items on the iron hat (first '+bad[0][3]+')':'nothing of the battery\'s on the iron hat'};},
 // station 3: the seeps lie where the water table's swing reaches the surface (flooded 1-364 days a year on the slope)
 seeps(S){const bad=S.filter(m=>{const d=FLOOD_T(OVER(m.x,terrainH(m.x,m.z),m.z));return d<=0||d>=365;});
  return{ok:S.length>0&&!bad.length,detail:bad.length?bad.length+' seeps off the table\'s line (first at '+bad[0].x+','+bad[0].z+')':S.length+' seeps, each where the table reaches the surface ('+S.map(m=>FLOOD_T(OVER(m.x,terrainH(m.x,m.z),m.z))).join(', ')+' days a year)'};},
 // station 3: the self-potential, negative over the oxidised top, near zero far off (Sato and Mooney's anomaly)
 sp(top,far){return{ok:top<-.15&&top>-.8&&far>-.06,detail:'over the hat '+top.toFixed(3)+' V, 800 m off '+far.toFixed(3)+' V'};},
 // station 3: the table at the season's level (the flood's datum, as the sea on the strand)
 table(level){const want=GALV_PHYS.level(DAY,{amp:SWING});return{ok:Math.abs(level-want)<1e-6,detail:'the table '+(+level).toFixed(3)+' m off its mean (day '+DAY+': '+want.toFixed(3)+')'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const litMats=()=>{const out=[];scene.traverse(o=>{if(!o.isMesh||o.userData.farField)return;const m=o.material;if(!m||(o.userData.sky))return;(Array.isArray(m)?m:[m]).forEach(x=>{if(x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial)out.push(x);});});return out;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),G=GALV.PLACED;
 add('the battery\'s life placed',HCHK.placed(window._station));
 add('the masts stand in acid water (pH under 4)',HCHK.masts(G));
 add('the battery on acid ground, the Rift\'s trees off it',HCHK.acidLine(P,window._kinTrees));
 add('living skins above the flood line the store bridges',HCHK.floodLine(G));
 add('the store jars on the flood line',HCHK.jars(G));
 add('the iron terraces where the pH has crossed 2.8',HCHK.terraces(STREAMS));
 add('nothing glows',HCHK.noGlow(litMats()));
 if(SITE.shore!==false)add('the sea at the season\'s level',HCHK.sea(window._water?window._water.sea:NaN));
 else add('the water table at the level of its season',HCHK.table(window._water?window._water.table:NaN));
 if(SITE.smokers){add('the chimneys seated on their ground',HCHK.chimneys(CHIMNEYS));add('the steam only off the hot brine',HCHK.steam(GALV_STEAM?GALV_STEAM.plumes:null));
  add('the brine on the shelf in its season (the bathtub ring)',HCHK.shelf(SEA_LEVEL));}
 if(ORE){const hp=ORE.F.point(ORE.sx*.5),q=ORE.F.point(ORE.sx*.5);add('no battery life on the iron hat',HCHK.hat(P));add('the seeps on the line of the water table',HCHK.seeps(SEEPS));
  add('the self-potential over the ore (the geobattery)',HCHK.sp(SP_AT(hp[0],hp[1]),SP_AT(q[0]+800,q[1])));}
 add('the tidal pump on the giant\'s clock (ATMOS.libration)',HCHK.tide(window._tide));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no masts',HCHK.placed(Object.assign({},window._station,{masts:0})));
 {const S=STREAMS[0],p=S.F.point(10);add('a mast on dry ground',HCHK.masts([['mast',p[0]+300,terrainH(p[0]+300,p[1]),p[1],1]]));}
 add('a crust on the hills',HCHK.acidLine([[0,0,-2400,'biome:gvcrust']],[]));
 {const M0=MOUNDS[0]||SEEPS[0];add('a Rift tree beside a spring',HCHK.acidLine([],[[M0.x+M0.r,M0.z]]));}
 add('a living reef drowned 200 days a year',HCHK.floodLine([['reef',0,DATUM(0,0)-CUT(0,0)-.2,0,1]]));
 add('a jar above the highest water',HCHK.jars([['jar',0,DATUM(0,0)-CUT(0,0)+SWING+.2,0,1]]));
 add('a terrace at the spring',HCHK.terraces([Object.assign({},STREAMS[0],{T:[{s0:0,s1:20,y:0,w:8}]})]));
 add('a glowing material',HCHK.noGlow([new THREE.MeshStandardMaterial({emissive:0x404020})]));
 if(SITE.shore!==false)add('the sea at the wrong season',HCHK.sea(SITE.sea+GALV_PHYS.level(DAY+180)));
 else add('the table at the wrong season',HCHK.table(GALV_PHYS.level(DAY+180,{amp:SWING})));
 if(SITE.smokers){const c=CHIMNEYS[0];add('a chimney 2 m in the air',HCHK.chimneys([Object.assign({},c,{y0:c.y0+2.3})]));
  add('a steam column over the cold strand',HCHK.steam([[DP.x,SEA_LEVEL,DP.z-DP.r-500,'steam']]));add('the brine over the rim',HCHK.shelf(SITE.sea+DP.shelf[1]+2));}
 if(ORE){const hp=ORE.F.point(ORE.sx*.5);add('a crust on the iron hat',HCHK.hat([[hp[0],terrainH(hp[0],hp[1]),hp[1],'biome:gvcrust']]));
  {const p=ORE.F.point(Math.max(0,ORE.sx-260));add('a seep up the hill',HCHK.seeps([{x:p[0]+60,z:p[1],r:3}]));}
  add('a self-potential with no ore under it',HCHK.sp(GALV_PHYS.sp(0,{ehDeep:2}),0));}
 add('a pump a quarter-day out',HCHK.tide(window._tide?{t:window._tide.t,pump:GALV_PHYS.tide(window._tide.t+.25)+(Math.abs(GALV_PHYS.tide(window._tide.t+.25)-window._tide.pump)<1e-6?.5:0),peakHour:0}:null));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
// THE REFLECTIONS SWITCH (core/water ext/58) on the sea, OFF at load: the button cycles off, probe, live (?mirror=probe|live asks at load)
const MIRROR=WATER.mirrorSwitch&&BIG_DRAW?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[BIG_DRAW.mesh.material],
 level:BIGW.level,center:[0,1800],radius:2600,far:2400,hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
const HINT=SKEY==='deep'?"Station 2 of the Rift battery, the Deep (scale model 5.1, px 801,1573: the vent itself, its crater 100 m under the eastern terminal sea; ideal type, the crater drawn 1.6 km across): "+
 "hot metal brine (~60 degC, the Atlantis II Deep's kind) to the sea's level, steaming faintly, thickest over the vent; round its edge a shelf of the brine's own muds in bands (red-brown oxide, black sulfide, green silicate, pale anhydrite at the top), "+
 "which the season bares and drowns (?day=0-364); the relict black-smoker chimneys of the old vent field standing dead on the rim and in the shallows, rusted, brass at the mouth; cell reefs crowding their feet, sulfur runners lacing the rubble, "+
 "a stream off the hills laying its iron terraces before it falls into the Deep; the sea past the south rim. Day "+DAY+". Nothing glows.":
 SKEY==='gossan'?"Station 3 of the Rift battery, the Gossan Hills (scale model 5.1, px 800,1568: the hills 10 km north of the vent, -2,211 m, 2.11 atm, +34 degC; ideal type): "+
 "Sato and Mooney's battery at a hill's scale. A sulfide lens strikes down the slope: above the water table it is oxidised to the iron hat, a rust-red gossan rib with no couple left in it and nothing of the battery's on it; "+
 "at the slope's foot, where it crosses the table, acid seeps (pH ~2) and the brass masts in them, on the line between the air and the reducing water; below, the ore lies drowned under the footslope, its stream lined with stumps and dead reefs; "+
 "the footwall seep's stream runs off the ore, alive, laying orange terraces. The table swings with the season (?day=0-364) and the store jars keep to its reach. The inspector reads the self-potential a prospector would. "+
 "The Rift's baobabs and dragon trees on the dry slope, past the acid and off the footslope's seasonal wet. Day "+DAY+". Nothing glows.":
 "Station 1 of the Rift battery (scale model 5.1, px 801,1573: the eastern terminal sea's north strand, -2,597 m, 2.21 atm, +36 degC; ideal type, the strand compressed): "+
 "metal-rich sulfide mud oxidising into its own acid, three wine-red streams laying orange iron terraces down to the brine sea, gossan-capped sulfide mounds with acid springs, "+
 "the vent's crater (the Deep) full of hot metal brine. The life lives on the current between pyrite and sphalerite: sulfur runners, wire crusts, brass masts, cell reefs, "+
 "store jars on the flood line. Day "+DAY+" (?day=0-364 moves the sea and the jars). Once a day, at the top of the giant's nod, the tidal pump opens the ore: the springs rise and the current swells to 1.6x (the inspector shows it). Nothing glows. The Rift's baobabs and dragon trees on the hills, past the acid.";
KHOST.take({build:'galvanic'+(SKEY==='strand'?'':'-'+SKEY),title:'Krator biome — the Rift battery: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),physics:()=>({format:'krator-galvanic',version:0,site:SITE,day:DAY,sea:SEA_LEVEL,placed:GALV.PLACED.length,tide:Object.assign({},GALV_PHYS.TIDE,window._tide)})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,placed:()=>GALV.PLACED,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:SITE.exportBox||[-200,-400,200,0],   /* a station's own (its life and its water), else the strand's */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),pH:PH_AT(x,z),flood:FLOOD_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
