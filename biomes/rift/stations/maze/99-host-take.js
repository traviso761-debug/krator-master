// ================================================================= HOST — the inspector's words and the probe's checks, handed to core/host
// The views are 98v's. Each check has a negative below it (hostNegatives): the same check fed a broken input, which must fail.
// ---------------------------------------------------------------- the inspector
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
const STOREY_NAME=['the lowest storey (wet near the scarp)','the middle storey','the top storey'];
function describe(hit){const p=hit.point,o=hit.object,rec=o.userData.recs&&hit.instanceId!=null?o.userData.recs[hit.instanceId]:null,g=CAVE.ground(p.x,p.z);
 let best=null;for(const r of REG){if(r.r>300||!r.tags||!(r.tags.cave||r.tags.site))continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const under=p.y<g-1,s=under?[0,1,2].map(k=>Math.abs(p.y-CAVE.storeyY(k))).reduce((a,v,k,A)=>v<A[a]?k:a,0):-1;
 return (best?best.name+'  ·  ':'')+(rec?rec.kind:(o.userData.inspectLabel||o.name||'mesh'))+'\n'+SITE.name+' · '+(SITE.G+p.y).toFixed(0)+' m'+
  (under?' ('+(g-p.y).toFixed(0)+' m under the table, '+STOREY_NAME[s]+')':' (in the open)')+hazardWords(p)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's checks
const BUDGET={showcase:{tris:2400000,calls:90},cls:{rock:1300000,dress:600000,host:200000},type:{cavern:'rock',ground:'rock',dress:'dress'}};
const MCHK={
 /* three storeys on the page, each a piece of the maze with passages and at least one mouth on the face */
 storeys(P,Ms){const n=[0,1,2].map(s=>P.filter(p=>p.level===s).length),m=[0,1,2].map(s=>Ms.filter(q=>q.storey===s).length);
  return{ok:n.every(v=>v>=40)&&m.every(v=>v>=1),detail:'passages a storey '+n.join(', ')+'; mouths on the face '+m.join(', ')};},
 /* the perched water stands on the lowest storey only, under the table's cover, within 260 m of the scarp's crest */
 water(W){const L=W.sumps.map(s=>({id:s.id,y:Math.min(s.a[1],s.b[1]),x:(s.a[0]+s.b[0])/2,z:(s.a[2]+s.b[2])/2})).concat(W.pools.map(p=>({id:p.id,y:p.level-1,x:p.c[0],z:p.c[1]})));
  const bad=L.filter(q=>q.y>SITE.net.level+3||q.x>SITE.scarp.x+260);return{ok:L.length>0&&!bad.length,detail:bad.length?'water off the lowest storey or far from the scarp: '+bad[0].id:L.length+' flooded passages and pools, all on the lowest storey near the scarp'};},
 /* every spring stands at the face's foot: its sill under the table, the ground under its pool within 3 m below it */
 springs(L){const bad=L.filter(s=>{const x=s.at[0]+s.dir[0]*2.4,z=s.at[1]+s.dir[1]*2.4,g=CAVE.ground(x,z);return !(s.y<WT+.01)||s.y-g>3||s.y-g<-.5;});
  return{ok:L.length>0&&!bad.length,detail:bad.length?'a spring off the foot: '+bad[0].id:L.length+' springs at the scarp\'s foot (KKARST\'s resurgence among them)'};},
 /* the Ancients' gallery is open from inside it to the maze's passage it broke into (every half metre at 1.2 m over its floor) */
 gallery(A){if(!A)return{ok:false,detail:'no gallery'};let shut=0,n=0;for(let x=A.end[0]+12;x>=A.at[0]-.6;x-=.5){n++;if(CAVE.fast.sdf(x,A.at[1]+1.2,A.end[2])<=.2)shut++;}
  return{ok:shut===0,detail:shut?shut+' of '+n+' points from the gallery to the passage in rock':'open from the cut gallery into the maze ('+n+' points); its far end '+Math.round(A.east[0]-CAVE.box[2])+' m past the page\'s edge'};},
 /* the walled chamber is sealed: rock at every wall's middle, open air in the chamber, a wall on every passage into it */
 walls(Lj){if(!Lj)return{ok:false,detail:'no walled chamber'};const n=CAVE.M[Lj.chamber.replace(/^ch:/,'')],into=CAVE.passages.filter(p=>p.a===n.id||p.b===n.id).length;
  const open=Lj.walls.filter(W=>CAVE.fast.sdf(W.at[0],W.at[1]+W.h*.5,W.at[2])>0),c=CAVE.fast.sdf(Lj.at[0],Lj.at[1]+1.5,Lj.at[2])>0;
  return{ok:!open.length&&c&&Lj.walls.length===into&&into>0,detail:open.length?open.length+' walls open':!c?'the chamber is rock':Lj.walls.length+' walls for '+into+' passages, the chamber open behind them'};},
 /* the dress placed tile by tile is the dress KSPELEO places on the whole cavern (one tile, the middle storey) */
 sameDress(a,b){const ja=JSON.stringify(a),jb=JSON.stringify(b);return{ok:a.length>0&&ja===jb,detail:a.length+' records on the whole cavern, '+b.length+' on the tile\'s: '+(ja===jb?'the same':'DIFFERENT')};},
 /* the hazards KKARST gives and the station's: a fall over every doline and every high mouth, the drowning on the lowest storey only */
 hazards(H){const f=new Set(H.filter(h=>h.tags.hazard.kind==='fall').map(h=>h.id)),dr=H.filter(h=>h.tags.hazard.kind==='drown');
  const missD=CAVE.dolines.filter(D=>!f.has(D.id+':fall')),missM=CAVE.mouths.filter(m=>m.drop>=SITE.fallFrom&&!f.has(m.id+':fall')),high=dr.filter(h=>h.at[1]>SITE.net.level+3);
  return{ok:!missD.length&&!missM.length&&!high.length&&dr.length>0,detail:missD.length?missD.length+' dolines without a fall':missM.length?missM.length+' high mouths without a fall':high.length?high.length+' drownings off the lowest storey':
   f.size+' falls ('+CAVE.dolines.length+' dolines, '+CAVE.mouths.filter(m=>m.drop>=SITE.fallFrom).length+' high mouths, the shafts), '+dr.length+' drownings in the perched water'};},
 /* every view's eye stands in the open */
 eyes(Cm){const bad=Cm.filter(c=>CAVE.fast.sdf(c.x,c.y,c.z)<.3);return{ok:!bad.length&&Cm.length>0,detail:bad.length?'in the rock: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open'};},
 /* no dress in the Ancients' gallery (it was cut long after the crystals grew) */
 galleryBare(R){const A=CAVE.ancients;if(!A)return{ok:false,detail:'no gallery'};const bad=R.filter(r=>r.x>A.end[0]+.5&&Math.abs(r.z-A.end[2])<A.w/2&&r.y>A.at[1]-.5&&r.y<A.at[1]+A.h+.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' dress records in the gallery':'none of '+R.length+' dress records in the cut gallery'};}};
const TILE_CHECK=(function(){const t=CAVE.tiles.map(t=>({t,n:CAVE.N2.nodes.filter(n=>n.level===1&&n.x>=t[0]&&n.x<t[0]+60&&n.z>=t[1]&&n.z<t[1]+60).length})).sort((a,b)=>b.n-a.n)[0];return t?t.t:null;})();
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('three storeys of the maze on the page, each open on the scarp',MCHK.storeys(CAVE.passages,CAVE.mouths));
 add('the perched water stands on the lowest storey only, near the scarp',MCHK.water(CAVE.water));
 add('the springs are at the scarp\'s foot',MCHK.springs(CAVE.water.springs));
 add('the Ancients\' cut gallery is open into the maze',MCHK.gallery(CAVE.ancients));
 add('the walled chamber is sealed (a wall on every passage into it)',MCHK.walls(CAVE.loj));
 {const t=TILE_CHECK,T=SITE.dress.tile;add('the dress placed on a tile\'s cavern is the dress on the whole cavern',t?MCHK.sameDress(CAVE.dressAt(CAVE.C,1,t[0],t[1]),CAVE.dressAt(CAVE.local([t[0],t[1],t[0]+T,t[1]+T],4),1,t[0],t[1])):{ok:false,detail:'no tile'});}
 add('a fall over every doline and every high mouth; the drowning on the lowest storey',MCHK.hazards(CAVE.hazards));
 add('no dress in the Ancients\' cut gallery',MCHK.galleryBare(CAVE.dress));
 add('the views\' cameras stand in the open',MCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a storey with no mouth',MCHK.storeys(CAVE.passages,CAVE.mouths.filter(m=>m.storey!==2)));
 {const s=CAVE.water.sumps[0];add('a flooded passage on the middle storey',MCHK.water(Object.assign({},CAVE.water,{sumps:CAVE.water.sumps.concat([{id:'fake',a:[s.a[0],-17,s.a[2]],b:[s.b[0],-17,s.b[2]],level:WT}])})));}
 {const s=CAVE.water.springs[0];add('a spring up on the table',MCHK.springs([Object.assign({},s,{id:'fake',at:[s.at[0]+80,s.at[1]],y:s.y})]));}
 {const A=CAVE.ancients;add('a gallery ending in the rock',MCHK.gallery(A&&Object.assign({},A,{end:[A.end[0],A.end[1]-6,A.end[2]],at:[A.at[0],A.at[1]-6,A.at[2]]})));}   /* 6 m down: the rock between the storeys */
 {const Lj=CAVE.loj;add('a wall standing in the chamber\'s open middle',MCHK.walls(Lj&&Object.assign({},Lj,{walls:Lj.walls.map((W,i)=>i?W:Object.assign({},W,{at:[Lj.at[0],Lj.at[1],Lj.at[2]]}))})));}
 add('two different dress lists',MCHK.sameDress(CAVE.dress.slice(0,5),CAVE.dress.slice(5,10)));
 add('no fall over the dolines',MCHK.hazards(CAVE.hazards.filter(h=>!/^cenote:.*:fall$/.test(h.id))));
 {const A=CAVE.ancients;add('a crystal in the gallery',MCHK.galleryBare([{id:'fake',kind:'druse',x:A.end[0]+6,y:A.at[1]+1,z:A.end[2]}]));}
 add('a camera in the rock',MCHK.eyes([{view:'rock',x:CAVE.centre[0],y:-25,z:CAVE.centre[1]}]));
 return R;}
KHOST.take({build:'rift-maze',title:'Krator biome — the Rift: the gypsum maze (station 5)',
 hint:SITE.region+': a network maze in the rift fill\'s gypsum (KKARST maze, KSPELEO, KCAVERN), three storeys 35, 18 and 10 m under Cube\'s plateau (at '+(SITE.G+SITE.net.level)+', '+(SITE.G-18)+' and '+(SITE.G-10)+
  ' m), the lowest wet near the scarp, its springs at the face\'s foot; the Ancients\' cut gallery and a walled chamber (sites only); scale model 5.1 px '+SITE.px+','+SITE.py+' (PLAN-STATIONS.md "Station 5")',
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:15.5},inspect:describe,stats:()=>'rock '+ROCK.tris+' · ground '+GROUND.tris+' · dress '+DRESS.tris+' tris',
 layers:{'dress':{match:o=>!!(o.userData&&o.userData.crystal)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'ground':{match:o=>!!(o.userData&&o.userData.ground)},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),cave:()=>CAVE.export()},
 minimap:{title:SITE.name},
 guards:false,   /* the biome core's card guards: no foliage on this page, so their negatives could not fail */
 budget:BUDGET,types:()=>({cavern:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},ground:{tris:GROUND.tris,inst:0,meshes:1},dress:{tris:DRESS.tris,inst:CAVE.dress.length,meshes:DRESS.mesh?1:0}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+GROUND.tris+DRESS.tris,inst:window._instances,meshes:ROCK.meshes+2,registered:REG.length,types:3};},
  cave:()=>({passages:CAVE.passages.length,chambers:CAVE.chambers.length,mouths:CAVE.mouths.length,dolines:CAVE.dolines.length,dress:CAVE.dress.length,hazards:CAVE.hazards.length,
   storeys:[0,1,2].map(s=>CAVE.passages.filter(p=>p.level===s).length)}),
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],   /* no flora: no items, buckets or BIO materials */
  exportBox:[-200,0,-80,120],
  at:(x,z)=>({floor:terrainH(x,z),water:waterH(x,z),table:CAVE.ground(x,z)})}});
