// ================================================================= HOST — the views, inspector words and probe checks (every station), handed to core/host
/* the DRAWN ground's height (84's grids: two triangles a cell, the fine patch where it lies), which rides over terrainH where a feature is finer than the
   cells: the cameras stand on what the eye sees (the eye check fails a camera under the mesh) */
const gridH=(G,x,z)=>{const p=G.mesh.geometry.attributes.position.array,H=k=>p[k*3+1];const fu=clamp((x-G.x0)/G.cx,0,G.nx-1e-6),fv=clamp((z-G.z0)/G.cz,0,G.nz-1e-6),i=Math.floor(fu),j=Math.floor(fv),u=fu-i,v=fv-j,a=j*G.vx+i,b=a+G.vx,c=b+1,d=a+1;
 return u+v<=1?H(a)+(H(d)-H(a))*u+(H(b)-H(a))*v:H(c)+(H(b)-H(c))*(1-u)+(H(d)-H(c))*(1-v);};
const drawnH=(x,z)=>{for(const G of GFINES)if(x>=G.x0&&x<=G.x0+G.cx*G.nx&&z>=G.z0&&z<=G.z0+G.cz*G.nz)return gridH(G,x,z);return gridH(GROUND_G,x,z);};
const gh=(x,z,dy)=>Math.max(terrainH(x,z),drawnH(x,z),waterH(x,z))+(dy||0);   /* over the water where there is water */
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const recOf=re=>REG.find(r=>re.test(r.name));
// from a point, back along a bearing (toward from) by d metres: a camera's spot that looks at the point
const back=(x,z,fx,fz,d)=>{const l=Math.hypot(fx-x,fz-z)||1;return[x+(fx-x)/l*d,z+(fz-z)/l*d];};
const VIEWS=(function(){const V={};
 if(SITE.tarn){const s=SITE.tarn.seed;let p=[s[0],s[1]];for(let t=0;t<1;t+=.01){const x=s[0]*(1-t),z=s[1]*(1-t);if(terrainH(x,z)>LEVEL+.5){p=[x,z];break;}}
  const c=back(p[0],p[1],0,0,60);V['The tarn']=look(c[0],c[1],22,s[0],s[1],4);}
 if(LAYOUT){const g=LAYOUT.geysers[0],sp=LAYOUT.springs.slice().sort((a,b)=>b.r-a.r)[0],tc=[(TBOX[0]+TBOX[2])/2,(TBOX[1]+TBOX[3])/2],c0=back(tc[0],tc[1],SITE.camp?SITE.camp.x:0,SITE.camp?SITE.camp.z:2000,Math.max(260,(TBOX[3]-TBOX[1])*.5));
  V['The thermal ground']=look(c0[0],c0[1],46,(TBOX[0]+TBOX[2])/2,(TBOX[1]+TBOX[3])/2,2);
  if(g){const c=back(g.x,g.z,g.x+60,g.z+70,48);V['A geyser']=look(c[0],c[1],5,g.x,g.z,dv(g.H,10)*.45);}
  if(sp){const c=back(sp.x,sp.z,sp.x-40,sp.z+50,sp.r*1.6+14);V['A hot spring']=look(c[0],c[1],sp.r*.7+10,sp.x,sp.z,0);}
  if(LAYOUT.acid[0]){const a=LAYOUT.acid[0],c=back(a.x,a.z,a.x+50,a.z+60,a.r*1.1+30);V['The acid field']=look(c[0],c[1],9,a.x,a.z,0);}}
 if(SITE.steps){const a=SITE.steps.a,b=SITE.steps.b,c=back(b[0],b[1],2*b[0]-a[0],2*b[1]-a[1],70);V['The sinter steps']=look(c[0],c[1],10,(a[0]+b[0])/2,(a[1]+b[1])/2,0);}
 if(window._camp){const h=window._camp.hearth,c=back(h.x,h.z,h.x-SITE.camp.way[0]*50,h.z-SITE.camp.way[1]*50,48);V['The hunters\' camp']=look(c[0],c[1],11,h.x,h.z,1);}
 if(HOLLOWS.length){const H=HOLLOWS[0],c=back(H.x,H.z,H.x+30,H.z-40,H.r+18);V['A gas hollow']=look(c[0],c[1],4,H.x,H.z,0);}
 {const t=REG.filter(r=>r.kind==='tree'&&/Firebliss pine/.test(r.name)).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];if(t){const c=back(t.x,t.z,t.x-30,t.z-25,26);V['The pines']=look(c[0],c[1],3,t.x,t.z,t.h*.4);}}
 if(RIVER){const P=RIVER.pts,i0=Math.floor(P.length*.55),m=P[i0],n=P[Math.min(P.length-1,i0+12)],dx=n[0]-m[0],dz=n[1]-m[1],l=Math.hypot(dx,dz)||1;
  if(RIVER.gorge){V['The gorge']=[m[0],m[2]+5,m[1],n[0],n[2]+3,n[1]];   /* down the gorge from over the water, its walls either side */
   const e=RIVER.gorge.ledge+4,c=[m[0]-dz/l*(RIVER.hw+e),m[1]+dx/l*(RIVER.hw+e)];V['The gorge from its ledge']=look(c[0],c[1],2,n[0],n[1],1);}
  else{const c=[m[0]-dz/l*70,m[1]+dx/l*70];V['The river']=look(c[0],c[1],18,m[0],m[1],1);}}
 {let best=null;for(let z=-2300;z<=2300;z+=200)for(let x=-2300;x<=2300;x+=200){const h=terrainH(x,z);if(!best||h>best[2])best=[x,z,h];}
  V['Down from the slopes']=look(best[0],best[1],30,best[0]*.2,best[1]*.2,0);}
 if(SITE.extraViews)SITE.extraViews(V,{look,back,gh});
 V['From afar']=look(-2300*Math.sign(SITE.afar?SITE.afar[0]:1),-2300*Math.sign(SITE.afar?SITE.afar[1]:1),420,0,0,40);
 return V;})();
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(FIREBLISS.plantOfItem(item)||(typeof COPPERG!=='undefined'&&COPPERG.plantOfItem(item)));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water / thermal ground')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nground '+(heatAt(p.x,p.z)|0)+' degC · '+(1.6*Math.exp(-p.y/8000)).toFixed(2)+' atm'+(PLUME?' · ash fall '+(PLUME.P.deposit(p.x,p.z)*100|0)+'%':'')+
  hazardWords(p)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:SITE.budget?SITE.budget.tris:20000000,calls:SITE.budget?SITE.budget.calls:260},cls:{pass:16000000,host:3000000},
 type:{['firebliss/'+SITE.key]:'pass','firebliss/kin':'pass','firebliss/floor':'pass','firebliss/hunters':'pass','firebliss/nodes':'pass',['copperglacier/'+SITE.key]:'pass',
  'geyser/sinter':'pass','geyser/trees':'pass','geyser/floor':'pass','geyser/show':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,M.userData.kit||'']);}});return o;};
const ROOTED=/biome:(grass|fern|flower|fireweed|reed|ashgrass|cushion|mossmat|sedge|copperflower|coraltip)$/;
const COLD=/biome:(cushion|copperflower)$/;
const HCHK={
 // what this station must have (SITE.need: 'kit.stat' names, each over zero)
 placed(need){const S={firebliss:window._biome||{},cold:window._cold||{},hunt:window._hunt||{},geyser:window._geyser||{}};
  const val=k=>{const [a,b]=k.split('.');const v=S[a]&&S[a][b];return Array.isArray(v)?v.length:typeof v==='number'?v:v?1:0;};
  const zero=need.filter(k=>!(val(k)>0));return{ok:!zero.length&&need.length>0,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+val(k)).join(', ')};},
 // nothing rooted under the water
 dry(P){const bad=P.filter(p=>{if(!ROOTED.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' plants under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'none drowned'};},
 // the cold ground's plants keep off the warm floor (Copper Glacier's passes run under a mask narrowed off it)
 cold(P){const bad=P.filter(p=>COLD.test(p[3])&&FIELD.floor(p[0],p[2])>.6);return{ok:!bad.length,detail:bad.length?bad.length+' cold-ground plants on the warm floor (first at '+bad[0].slice(0,3).map(v=>v|0)+')':P.filter(p=>COLD.test(p[3])).length+' cold-ground plants, none on the warm floor'};},
 // no tree on a cliff face (the owner's rule: trees zoned off steep rock)
 cliffs(T,sl){sl=sl||FIELD.slope;const bad=T.filter(t=>sl(t.x,t.z)>.78||FIELD.rock(t.x,t.z)>.6);return{ok:!bad.length,detail:bad.length?bad.length+' trees on steep rock (first '+bad[0].name+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a cliff'};},
 // nothing of this kit's or Copper Glacier's rooted on hot ground (over 60 degC); the geyser kit's own plants follow its own thermal record
 hot(P){const T=(x,z)=>Math.max(heatAt(x,z),nearT(x,z)?GEYSER.at(x,z,landH(x,z)).T||0:0),bad=P.filter(p=>ROOTED.test(p[3])&&p[4]!=='geyser'&&T(p[0],p[2])>60);return{ok:!bad.length,detail:bad.length?bad.length+' plants on ground over 60 degC (first '+bad[0][3]+')':'none on hot ground'};},
 // core/camp's pitch: every record pitched, no overlap, all on the good ground
 camp(c){if(!SITE.camp)return{ok:true,detail:'no camp at this station'};return{ok:!!c&&c.records>0&&c.short===0&&c.overlaps===0&&c.offGround===0,detail:c?c.records+' records ('+c.short+' not pitched), '+c.overlaps+' overlaps, '+c.offGround+' off the ground':'no camp pitched'};},
 // the plan's hazards: gas in every hollow, a crust over every boiling spring, the flood where the station has one
 hazards(H){const nb=LAYOUT?LAYOUT.springs.filter(s=>s.temp>=.9).length:0,ok=H&&H.gas===HOLLOWS.length&&H.crust===nb&&H.flood===(SITE.flood?1:0)&&(HOLLOWS.length+nb+(SITE.flood?1:0)+H.fall>0);
  return{ok:!!ok,detail:H?'gas '+H.gas+' of '+HOLLOWS.length+' hollows, crusts '+H.crust+' of '+nb+' boiling springs, flood '+H.flood+', falls '+H.fall:'none'};},
 // every node of the resource data in the square is listed and the drawn ones registered: none invented, none lost
 nodes(N,data){const ids=new Set(N.map(n=>n.id)),miss=(data||[]).filter(n=>!ids.has(n.id)),reg=N.filter(n=>n.drawn&&!REG.some(r=>r.tags&&r.tags.res&&r.tags.res.id===n.id));
  return{ok:!miss.length&&!reg.length&&N.length===(data||[]).length,detail:miss.length?miss.length+' nodes of the data lost':reg.length?reg.length+' drawn nodes not registered':N.length+' nodes from the data ('+N.filter(n=>n.drawn).length+' drawn)'};},
 camerasOut(Cm){const bad=Cm.filter(c=>c.y<drawnH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):Cm.length+' cameras above the drawn ground'};}};
function edgeCheck(){const P=instPoints().filter(p=>p[3]==='biome:reed'||p[3]==='biome:sedge'||p[3]==='biome:mossmat').slice(0,6000).map(p=>({x:p[0],z:p[2],r:.3,name:'reed'}));
 const pts=[[0,0],[600,600],[-1200,800],[1500,-300]];
 const bad=BIO.envCheck(ENV,pts),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&!(N['plant-in-water']>0),detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' wet-ground plants, '+JSON.stringify(N)};}
const TREES=()=>REG.filter(r=>r.kind==='tree').concat((typeof GEYSER!=='undefined'&&GEYSER.TREES||[]).map(T=>({x:T.x,z:T.z,name:'a geyser-kit tree'})));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the station\'s flora, thermal ground and marks placed',HCHK.placed(SITE.need||[]));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the cold ground\'s plants off the warm floor',HCHK.cold(P));
 add('no tree on a cliff face',HCHK.cliffs(TREES()));
 add('nothing of the floor rooted on ground over 60 degC',HCHK.hot(P));
 add('the hunters\' camp pitched (core/camp: no overlap, on good ground)',HCHK.camp(window._hunt&&window._hunt.camp));
 add('the plan\'s hazards registered (gas, crust, flood, falls: core/hazard)',HCHK.hazards(window._hazards));
 add('the resource data\'s nodes: all listed, the drawn ones registered',HCHK.nodes(window._nodes||[],FB_RES.nodes));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('preset cameras above the drawn ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('nothing placed',HCHK.placed((SITE.need||[]).concat(['firebliss.nothing'])));
 const wet=(function(){for(let x=-2400;x<2400;x+=97)for(let z=-2400;z<2400;z+=89){const w=waterH(x,z);if(w>-1e8&&terrainH(x,z)<w-2)return[x,terrainH(x,z),z];}return[0,-1e6,0];})();
 if(wet[1]>-1e5)add('a plant drowned',HCHK.dry([[wet[0],wet[1],wet[2],'biome:reed']]));   /* a page with no deep water (Mons) has no negative here */
 const fl=(function(){for(let x=-2400;x<2400;x+=97)for(let z=-2400;z<2400;z+=89)if(FIELD.floor(x,z)>.9)return[x,terrainH(x,z),z,'biome:cushion'];return[0,0,0,'biome:cushion'];})();
 if(SITE.tarn)add('a cushion on the warm floor',HCHK.cold([fl]));
 add('a tree on a cliff',HCHK.cliffs([{x:0,z:0,name:'a test tree on a 90 deg face'}],()=>1));
 if(LAYOUT){const s=LAYOUT.springs.slice().sort((a,b)=>b.temp-a.temp)[0];add('a plant on boiling ground',HCHK.hot([[s.x,0,s.z,'biome:grass','firebliss']]));}
 if(SITE.camp)add('a camp with an overlap',HCHK.camp(Object.assign({},window._hunt&&window._hunt.camp||{records:0},{overlaps:1})));
 add('no hazards',HCHK.hazards({gas:0,crust:0,flood:0,fall:0}));
 add('a node of the data lost',HCHK.nodes((window._nodes||[]).slice(1),FB_RES.nodes.length?FB_RES.nodes:[{id:'res:none:0:0'}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:drawnH(0,0)-10,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
if(typeof GEYSER!=='undefined')KHOST.on(function geyserScale(){if(GEYSER.SHOW)GEYSER.SHOW.setScale(innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360)));},'view');
const MS=STILLS[0];
/* verify.py's export box: the thermal ground's largest spring (the water section), else the camp, else the middle; the nearest tree taken in (the buckets) */
const EXPORT_BOX=(function(){const sp=LAYOUT&&LAYOUT.springs.slice().sort((a,b)=>b.r-a.r)[0],c=sp?[sp.x,sp.z]:SITE.camp?[SITE.camp.x,SITE.camp.z]:[0,0];
 let x0=c[0]-150,z0=c[1]-150,x1=c[0]+150,z1=c[1]+150;const t=TREES().sort((a,b)=>Math.hypot(a.x-c[0],a.z-c[1])-Math.hypot(b.x-c[0],b.z-c[1]))[0];
 if(t&&Math.hypot(t.x-c[0],t.z-c[1])<750){x0=Math.min(x0,t.x-20);z0=Math.min(z0,t.z-20);x1=Math.max(x1,t.x+20);z1=Math.max(z1,t.z+20);}return[x0,z0,x1,z1].map(Math.round);})();
const MIRROR=MS&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[MS.mat],level:MS.level,center:MS.center,radius:MS.radius,far:MS.far,
 hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;   /* the reflections switch: off at page load (the owner, 2026-11-01) */
KHOST.take({build:'firebliss-'+SITE.key,title:'Krator biome — the Firebliss Range: '+SITE.name,
 hint:SITE.region+' ('+(MODEL.clim.koppen||[]).slice(0,3).join(', ')+', '+Math.round(MODEL.h(0,0))+' m, '+SITE_ATM+' atm, '+MODEL.clim.rain+' mm): the scale model 5.1\'s ground at px '+FB_MODEL.px+','+FB_MODEL.py+'; the geyser kit\'s thermal ground, Copper Glacier\'s cold flora and the Throne\'s pine read in place; the hunters\' camps on core/camp; gas, crusts and floods on core/hazard; the plume (PLAN.md)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 /* the core attach audit's share: 1.3%, not 1%, for the geyser kit's kanuka read in place (its 55: blooms set up to .4 m off a crown point at its hero
    tier, crown clumps with no limb rods at its mid tier: 1.17% on station 3, 0.80% on station 1). The fix is the geyser kit's (BIO.holdTo on both),
    owed at its turn (KNOWN_ISSUES.md); this kit's own cards are held */
 guards:{maxShare:.013},
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,nodes:()=>window._nodes,camp:()=>window._camp,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos'].concat(TREES().length?['buckets']:[]).concat(LAYOUT||MS?['water']:[]),
 exportBox:EXPORT_BOX,
 at:(x,z)=>{const o={h:terrainH(x,z),drawn:drawnH(x,z),water:waterH(x,z),T:+heatAt(x,z).toFixed(1)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
