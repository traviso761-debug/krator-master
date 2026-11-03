// ================================================================= HOST — the views, inspector words and probe checks (every station), handed to core/host
const gh=(x,z,dy)=>Math.max(terrainH(x,z),waterH(x,z))+(dy||0);   /* over the water where there is water */
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const lookUP=(u0,a0,dyc,u1,a1,dyt)=>{const c=upAt(u0,GS.centre(u0)+a0),t=upAt(u1,GS.centre(u1)+a1);return look(c[0],c[1],dyc,t[0],t[1],dyt);};
const recOf=re=>REG.find(r=>re.test(r.name));
const VIEWS=(function(){const V={},sn=GS.snout,W0=G.W(sn+100);
 V['The snout']=TARN?lookUP(sn-420,W0*.9,30,sn+150,0,10):lookUP(sn-260,W0*1.3,25,sn+120,0,8);
 V['The icefall']=lookUP(SITE.icefall[0]-500,G.W(SITE.icefall[0])*1.15,60,(SITE.icefall[0]+SITE.icefall[1])/2,0,20);
 V['Down the ice']=lookUP(Math.min(2300,SITE.icefall[1]+300),0,40,sn,0,0);
 if(CREV.length){const r=CREV[Math.floor(CREV.length/2)];V['Crevasses']=look(r.x-40,r.z-30,14,r.x,r.z,0);}
 if(CAVES.length){const C=CAVES[0],fx=Math.cos(C.face),fz=Math.sin(C.face);V['An ice cave']=look(C.x+fx*C.R*3.2,C.z+fz*C.R*3.2,4,C.x,C.z,C.H*.4);
  V['Inside the ice cave']=[C.x+fx*C.R*.5,C.floor+2.2,C.z+fz*C.R*.5,C.x-fx*C.R,C.floor+3,C.z-fz*C.R];}
 const co=recOf(/frost coral/);if(co)V['A frost coral']=look(co.x+7,co.z+5,2.2,co.x,co.z,1.6);
 const nd=(window._nodes||[]).find(n=>n.drawn&&n.kind==='copper')||(window._nodes||[]).find(n=>n.drawn);
 if(nd)V[(/^[aeiou]/.test(nd.kind)?'An ':'A ')+nd.kind+' node']=look(nd.x+SUN_POS[0]/SUN_POS[0]*-22,nd.z+16,5,nd.x,nd.z,0);   /* from the sun's side (west, south): lit, not backlit */
 if(TARN){const c=upAt(sn-1300,GS.centre(sn-1300)-G.W(sn)*1.2);V['The Copper Tarn']=look(c[0],c[1],25,upAt(sn,0)[0],upAt(sn,0)[1],10);}
 if(POND){const c=upAt(G.termU(TERM.p0)-60,TERM.p0+40);V['The pond and the moraine']=look(c[0],c[1],8,upAt(sn,TERM.p0)[0],upAt(sn,TERM.p0)[1],5);}
 if(RIDGES.length){const r=SITE.ridges[0];V['A nunatak']=look(r.a[0]-300,r.a[1]-250,30,(r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2,r.h*.5);}
 V['From afar']=lookUP(-2300,-900,420,600,0,60);
 return V;})();
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&COPPERG.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / ice / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nice '+(FIELD.ice(p.x,p.z)*100|0)+'% · snow '+(FIELD.snow(p.x,p.z)*100|0)+'% · copper ground '+(FIELD.copper(p.x,p.z)*100|0)+'%'+
  hazardWords(p)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:16000000,calls:160},cls:{pass:15000000,host:2500000},   /* measured 2026-11-03 (Arc, the browser pane): tarn 9.1M, pass 14.2M, icefield 1.1M scene triangles */
 type:{['copperglacier/'+SITE.key]:'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const FLORA=/biome:(coraltip|cushion|copperflower|mossmat|sedge|lichen)/;
const HCHK={
 // what this station must have: its flora and its glacier's things
 placed(st,g){const need=['cushions','boulders'].concat(SITE.coral[1]>SITE.coral[0]?['coral','tips']:[]).concat(SITE.skarn?['flowers','malachite']:[]),gneed=['seracs','crevasses','caves'].concat(TARN||POND?['bergs']:[]);
  const zero=need.filter(k=>!(st&&st[k]>0)).concat(gneed.filter(k=>!(g&&g[k]>0)));
  return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')+'; '+gneed.map(k=>k+' '+g[k]).join(', ')};},
 // nothing grows on the ice
 offIce(P){const bad=P.filter(p=>FLORA.test(p[3])&&iceAt(p[0],p[2])>.5);return{ok:!bad.length,detail:bad.length?bad.length+' plants on the ice (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.filter(p=>FLORA.test(p[3])).length+' plants, none on the ice'};},
 // the copper flower keeps to the copper ground (the resource data's)
 copper(P){const f=P.filter(p=>p[3]==='biome:copperflower'),bad=f.filter(p=>FIELD.copper(p[0],p[2])<.25);
  return{ok:!bad.length&&(!SITE.skarn||f.length>0),detail:bad.length?bad.length+' copper flowers off the copper ground (first at '+bad[0].slice(0,3).map(v=>v|0)+')':f.length+' copper flowers, all on copper ground'};},
 dry(P){const bad=P.filter(p=>{if(!FLORA.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' plants under the water':'none drowned'};},
 // every node of the resource data in the square is registered or listed as not drawn (on the ice or the water): none invented, none lost
 nodes(N,data){const ids=new Set(N.map(n=>n.id)),miss=(data||[]).filter(n=>!ids.has(n.id)),reg=N.filter(n=>n.drawn&&!REG.some(r=>r.tags&&r.tags.res&&r.tags.res.id===n.id));
  return{ok:!miss.length&&!reg.length&&N.length===(data||[]).length,detail:miss.length?miss.length+' nodes of the data lost':reg.length?reg.length+' drawn nodes not registered':N.length+' nodes from the data ('+N.filter(n=>n.drawn).length+' drawn; the rest on the ice, the water or off the square)'};},
 // the crevasses and the ice cliff are hazard records
 hazards(n){const L=typeof KHAZ!=='undefined'?KHAZ.list().filter(r=>{const z=KHAZ.of(r)||r;return z&&(z.kind==='fall'||z.kind==='crush');}):[];return{ok:L.length>=n&&n>0,detail:L.length+' fall and crush hazards for '+n+' crevasses'};},
 // the frost coral's limbs swell into their parents (BIO.flareJoin on the page)
 joints(st){const ok=typeof BIO.flareJoin==='function'&&(SITE.coral[1]<=SITE.coral[0]||st&&st.limbs>st.coral);return{ok,detail:(typeof BIO.flareJoin==='function'?'BIO.flareJoin on the page; ':'no BIO.flareJoin; ')+(st?st.limbs+' limbs on '+st.coral+' corals':'')};},
 camerasOut(Cm){const bad=Cm.filter(c=>c.y<terrainH(c.x,c.z)+.5&&!/Inside/.test(c.view));return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):Cm.length+' cameras above the ground'};}};
function edgeCheck(){const P=instPoints().filter(p=>p[3]==='biome:sedge'||p[3]==='biome:mossmat').slice(0,6000).map(p=>({x:p[0],z:p[2],r:.3,name:'sedge'}));
 const S=STREAMS.find(s=>s.pts.length>2),pts=[[0,0],S?[S.pts[0][0]+20,S.pts[0][1]+20]:[400,400],[-1500,-200],[0,1600]];
 const bad=BIO.envCheck(ENV,pts),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&!(N['plant-in-water']>0),detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' wet-ground plants, '+JSON.stringify(N)};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),st=window._biome;
 add('the station\'s flora and the glacier\'s things placed',HCHK.placed(st,GLACIER));
 add('nothing grows on the ice',HCHK.offIce(P));
 add('copper flowers on the copper ground only (the resource data\'s)',HCHK.copper(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the resource data\'s nodes: all listed, the drawn ones registered',HCHK.nodes(window._nodes||[],CG_RES.nodes));
 add('the crevasses and the ice cliff are hazards (core/hazard)',HCHK.hazards(CREV.length));
 add('the frost coral\'s limbs flared into their parents (BIO.flareJoin)',HCHK.joints(st));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const ip=upAt(SITE.icefall[0],GS.centre(SITE.icefall[0])),c0=[ip[0],terrainH(ip[0],ip[1]),ip[1]];
 add('no seracs',HCHK.placed(window._biome,Object.assign({},GLACIER,{seracs:0})));
 add('a cushion on the ice',HCHK.offIce([[c0[0],c0[1],c0[2],'biome:cushion']]));
 const off=(function(){for(let x=-2400;x<2400;x+=97)for(let z=-2400;z<2400;z+=89)if(FIELD.copper(x,z)<.05&&iceAt(x,z)<.1)return[x,terrainH(x,z),z,'biome:copperflower'];return[0,0,0,'biome:copperflower'];})();
 add('a copper flower off the copper ground',HCHK.copper([off]));
 {const S=STILLS[0];if(S)add('a plant drowned',HCHK.dry([[S.center[0],S.level-3,S.center[1],'biome:sedge']]));}   /* the largest still's middle (the icefield has no water: no negative) */
 add('a node of the data lost',HCHK.nodes((window._nodes||[]).slice(1),CG_RES.nodes.length?CG_RES.nodes:[{id:'res:none:0:0'}]));
 add('no hazards',HCHK.hazards(0));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:c0[0],y:c0[1]-10,z:c0[2]}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const MS=STILLS[0];
const MIRROR=MS&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[MS.mat],level:MS.level,center:MS.center,radius:MS.radius,far:MS.far,
 hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;   /* the reflections switch: off at page load (the owner, 2026-11-01) */
KHOST.take({build:'copperglacier-'+SITE.key,title:'Krator biome — Copper Glacier: '+SITE.name,
 hint:SITE.region+' ('+SITE.koppen.join(', ')+', '+Math.round(PROF(0))+' m, '+SITE.atm+' atm, '+SITE.rain+' mm): the glacier on KGLACIER, its seracs, crevasses and ice caves; frost coral, verdigris cushions, copper flowers on the resource data\'s copper ground; scale model 5.1 px '+SITE.px+','+SITE.py+' (PLAN.md)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,nodes:()=>window._nodes,glacier:()=>GLACIER,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos'].concat(SITE.coral[1]>SITE.coral[0]?['buckets']:[]).concat(MS?['water']:[]),   /* no coral on the icefield: no bucket; no still there: no water */
 exportBox:MS?[Math.round(MS.center[0]-150),Math.round(MS.center[1]-150),Math.round(MS.center[0]+150),Math.round(MS.center[1]+150)]:[-150,-150,150,150],
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),ice:iceAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
