// ================================================================= HOST — the Yards' checks (verify.py --assert reads them through 99's hostChecks)
// [web] The Overlook's list (99) is its own content: the lake, the House, the extraplanars, the war toward the lake. This station names its own:
// the industry placed, nothing in a street, the yard on the line, the wagons, the pieces as records, the dead ground and the heaps, the oily rain
// and the smog, the factory keepers, the Engines; and the general ones it shares (the hand of man, dry ground, the impostors, the transit, the
// craters, the lean, the forest, the cards). Each has a negative: the same check on a record broken on purpose must fail.
{const Y=STAGE.yards,FACTORY=['an_porter','an_lifter','an_mender','an_courier'];
 const YC={
  /* the twelve industrial buildings: every key once or more, each in a superblock of the industrial zone (its plinth inside the block's kerbs), on dry
     ground off the dead ground, each family made at the boot and drawn by the city's machinery (a hero, a shell or an impostor look) */
  industry(I){const want=['datacenter','stacks','robotics','rig','foundry','works','well','tankyard','coolers','gantry','furnace','spheres'],have=new Set(I.map(t=>t.family)),miss=want.filter(k=>!have.has(k));let out=0,bad=0;
   for(const t of I){const ca=Math.abs(Math.cos(t.yaw)),sa=Math.abs(Math.sin(t.yaw)),ex=ca*t.rx+sa*t.rz,ez=sa*t.rx+ca*t.rz,bi=Math.floor((t.x-Y.IZ.u0)/495),u0=Y.IZ.u0+bi*495,row=t.z<0?[Y.IZ.w0,Y.MR.w0]:[Y.MR.w1,Y.IZ.w1],m=16.5+2.5;
    if(bi<0||t.x-ex<u0+m||t.x+ex>u0+495-m||t.z-ez<row[0]+m||t.z+ez>row[1]-m)out++;if(t.y<STAGE.lakeY+2||STAGE.F.scar(t.x,t.z)>.5)bad++;}
   const looks=(AVC.dkeys||[]).filter(k=>want.indexOf(k.split('.')[0])>=0).length,fams=want.filter(k=>MP.FAMILY[k]).length;
   return{ok:!miss.length&&!out&&!bad&&looks>=12&&fams>=10,detail:I.length+' industrial buildings of '+have.size+' kinds'+(miss.length?' (missing '+miss.join(', ')+')':'')+'; '+out+' outside their superblock, '+bad+' wet or on dead ground; '+fams+' families made, '+looks+' looks with impostors'+(AV_YARDS.noShell.length?'; no shell: '+AV_YARDS.noShell.join(', '):'')};},
  /* nothing stands in a street: no plinth reaches into a roadway or a pavement of a street that runs there (STREETS: the superblocks have none inside),
     no bent, trestle, chimney, tank farm or dish array on one, no Engine's pad across one */
  streets(T,P){let towers=0,pieces=0;const ex=[];for(const t of T){if(Y.inStreet(t)){towers++;if(ex.length<3)ex.push(t.family+' at '+Math.round(t.x)+','+Math.round(t.z));}}
   const on=(x,z)=>!Y.offStreet(x,z);for(const Q of P){let hit=false;
    if(Q.kind==='piperack')hit=Q.bents.some(b=>on(b.x,b.z));else if(Q.kind==='conveyor')hit=Q.trestles.some(b=>on(b.x,b.z));else if(Q.kind==='tankfarm')hit=Q.bund.corners.some(c=>on(c[0],c[1]))||Q.tanks.some(t=>on(t.x,t.z));
    else if(Q.kind==='disharray')hit=Q.dishes.some(d=>on(d.x,d.z));else if(Q.kind==='chimney'||Q.kind==='pool'||Q.kind==='turntable'||Q.kind==='gantry')hit=on(Q.x,Q.z);if(hit){pieces++;if(ex.length<5)ex.push(Q.kind+' at '+Math.round(Q.x)+','+Math.round(Q.z));}}
   let eng=0;for(const E of STAGE.engines){for(let k=0;k<16;k++){const a=k/16*Math.PI*2;if(on(E.x+Math.cos(a)*E.r*.9,E.z+Math.sin(a)*E.r*.9)){eng++;break;}}}
   return{ok:T.length>60&&!towers&&!pieces&&!eng,detail:T.length+' buildings, '+towers+' reaching into a street; '+P.length+' pieces, '+pieces+' on one; '+eng+' Engines across one'+(ex.length?' ('+ex.join('; ')+')':'')};},
  /* the yard is on the line: every siding leaves the cargo line (its first point on the line), runs parallel to it at its spacing, ends at a buffer stop;
     no street crosses the yard (it lies between the two crossings); the turntable at the yard's east end; the gantries span the tracks */
  yard(T,Yd,P){const C=T.cargo,lineAt=x=>{let best=1e9;for(let s=0;s<=C.L;s+=10){const q=C.path.at(s);best=Math.min(best,Math.hypot(q.x-x[0],q.z-x[1]));}return best;};let off=0,wide=0;
   (T.sidings||[]).forEach((R,i)=>{const S=Yd.sidings[i],a=S.pts[0],e=S.pts[S.pts.length-1];if(lineAt(a)>1.5)off++;if(Math.abs(Math.abs(e[1]-STAGE.yards.LINE_Z)-S.d)>2)wide++;});
   let crossed=0;for(let a=0;a<2;a++)for(const k in Y.STREETS[a])for(const q of Y.STREETS[a][k]){const v=(+k+.5)*165;for(let t=q[0];t<=q[1];t+=10){const x=a?t:v,z=a?v:t;if(MP.yards.inside(Yd.outline,x,z,0)){crossed++;break;}}}
   const tt=P.find(Q=>Q.kind==='turntable'),endX=Math.max(...Yd.stops.map(s=>s.x)),tOk=tt&&Math.abs(tt.x-endX)<260,gan=P.filter(Q=>Q.kind==='gantry'&&Q.span>=Yd.width).length;
   return{ok:(T.sidings||[]).length>=6&&!off&&!wide&&!crossed&&tOk&&gan>=2,detail:(T.sidings||[]).length+' sidings ('+off+' off the line, '+wide+' out of spacing), '+crossed+' streets across the yard, the turntable '+(tOk?'at the yard\'s end':'astray')+', '+gan+' gantries over the tracks'};},
  /* the wagons: trains on the sidings, standing and derailed (the overturned) */
  wagons(TR){const yard=TR.filter(t=>/^siding/.test(t.line&&t.line.id||'')||/^yard/.test(t.id)),st=yard.filter(t=>t.state==='standing').length,dr=yard.filter(t=>t.state==='derailed').length,cars=yard.reduce((s,t)=>s+t.cars.length,0);
   return{ok:yard.length>=4&&st>=2&&dr>=1&&cars>=40,detail:yard.length+' trains in the yard ('+st+' standing, '+dr+' derailed), '+cars+' wagons'};},
  /* the pieces are records first: each registered before the yard is drawn, the kinds all there */
  pieces(P,drawn){const n={};P.forEach(Q=>n[Q.kind]=(n[Q.kind]||0)+1);const unreg=P.filter(Q=>!Q.registered).length,need={tankfarm:2,piperack:3,disharray:1,chimney:4,conveyor:2,turntable:1,gantry:2,pool:3},short=Object.keys(need).filter(k=>(n[k]||0)<need[k]);
   return{ok:!unreg&&!short.length&&drawn,detail:Object.keys(n).map(k=>n[k]+' '+k).join(', ')+'; '+unreg+' drawn unregistered'+(short.length?'; short of '+short.join(', '):'')+(drawn?'':'; not drawn')};},
  /* the ground: every pool and spill on dead ground (the scar), every slag heap standing proud of its foot */
  ground(Y2){let live=0,flat=0;Y2.SPILL.forEach(s=>{if(STAGE.F.scar(s.x,s.z)<.6)live++;});Y2.SLAG.forEach(h=>{const top=terrainH(h.x,h.z),foot=terrainH(h.x+h.rx*1.3*Math.cos(h.yaw),h.z+h.rx*1.3*Math.sin(h.yaw));if(top-foot<h.h*.5)flat++;});
   return{ok:Y2.SPILL.length>=6&&!live&&Y2.SLAG.length>=3&&!flat,detail:Y2.SPILL.length+' spills and pools ('+live+' on live ground), '+Y2.SLAG.length+' slag heaps ('+flat+' flat)'};},
  /* the oily rain is the day's weather and the smog is the valley's thickest (fog and mist past the Overlook's .00036 and .0011) */
  air(O,S){const mode=typeof ATMOS!=='undefined'&&ATMOS.W?ATMOS.W.mode:null,thick=S.fogDensity>.00036&&S.smog&&S.smog.mist&&S.smog.mist.density>.0011;
   return{ok:!!O&&mode===O.mode&&thick,detail:'the weather '+mode+'; fog '+S.fogDensity+', mist '+(S.smog&&S.smog.mist?S.smog.mist.density:0)};},
  /* the keepers are the factory kinds, each on a round of four dry corners */
  keepers(K){let bad=0,odd=0;for(const k of K){if(FACTORY.indexOf(k.key)<0)odd++;if(!k.route||k.route.length<4)bad++;else for(const p of k.route)if(terrainH(p[0],p[1])<STAGE.lakeY+2)bad++;}
   return{ok:K.length>=4&&!bad&&!odd,detail:K.length+' keepers ('+K.map(k=>k.key.replace('an_','')).join(', ')+'), '+odd+' not of the factory kinds, '+bad+' faults'};},
  /* the Engines: built, each on its pad in a superblock, no building or piece inside its reach */
  engines(L,E,T){let near=0;for(const e of E)for(const t of T)if(Math.hypot(t.x-e.x,t.z-e.z)<e.r+Math.min(t.rx,t.rz))near++;let inYard=E.filter(e=>Math.abs(e.z-STAGE.yards.LINE_Z)<200).length;
   return{ok:L.length===E.length&&E.length>=3&&!near&&!inYard,detail:L.length+' of '+E.length+' Engines built ('+E.map(e=>e.name).join(', ')+'), '+near+' buildings in their reach, '+inYard+' in the yard\'s row; '+AV_YARDS.mergedEngines+' meshes merged'};},
  /* the ruined vehicles: on the streets only (none in a superblock or the yard's row, which have none; the airliner and the helicopters lie
     on the plazas, and past the streets' ends at the page's rim the lattice's lines run on without a street), none on a plinth or under the lake, most on
     scorched ground burnt; fewer than the Overlook's (an industrial district has a street every 495 m, not every 165) */
  wrecks(W){let plinth=0,wet=0,off=0,hot=0,burnt=0;for(const w of W){if(STAGE.built(w.x,w.z)>.5)plinth++;if(w.y<STAGE.lakeY+1)wet++;if(!w.air&&Math.hypot(w.x,w.z)<STAGE.R-150&&STAGE.streetD(w.x,w.z)>30)off++;if(STAGE.scorch(w.x,w.z)>.6){hot++;if(w.state==='burnt')burnt++;}}
   return{ok:W.length>=60&&!plinth&&!wet&&!off&&(hot<8||burnt>hot*.6),detail:W.length+' wrecks, '+plinth+' on a plinth, '+wet+' under the lake, '+off+' off the streets; '+burnt+' of '+hot+' on scorched ground burnt'};},
  transit(T){if(!T)return{ok:false,detail:'no transit'};const J=T.net.junctions.length,tee=T.net.junctions.filter(j=>j.kind==='tee').length;
   const ok=J>=120&&tee>=10&&T.highway.ramps.length>=3&&T.cargo.crossings.length>=2&&T.subway.stations.length>=3&&(T.sidings||[]).length>=6;
   return{ok,detail:J+' junctions ('+tee+' tees where a road stops at a superblock), the highway '+T.highway.ramps.length+' ramps, the cargo line '+T.cargo.crossings.length+' crossings, the subway '+T.subway.stations.length+' stations, '+(T.sidings||[]).length+' sidings'};}};
 STAGE.checkList=function(add,H,VIEWS){const T=STAGE.plan.towers,I=Y.INDUSTRY;
  add('the hand of man in every view',H.handOfMan(VIEWS,REG));add('the buildings stand on dry ground',H.standing(T));add('the impostors hide behind their heroes and shells',H.impHidden((x,z)=>x+','+z));
  add('the twelve industrial buildings are placed, on the city\'s machinery',YC.industry(I));add('nothing stands in a street',YC.streets(T,Y.PIECES));
  add('the yard is on the line',YC.yard(STAGE.transit,Y.YARD,Y.PIECES));add('wagons stand and lie overturned in the yard',YC.wagons(STAGE.transit.trains));
  add('the new pieces are records first, then drawn',YC.pieces(Y.PIECES,AV_YARDS.ready&&AV_YARDS.drawn>0));add('spills and pools are dead ground; the slag heaps stand',YC.ground(Y));
  add('the oily rain is the day\'s weather, the smog the thickest',YC.air(typeof AV_OIL!=='undefined'?AV_OIL:null,STAGE));if(typeof AV_OIL!=='undefined'&&AV_OIL)add('the oily rain stands over the foul ground',H.oilRain(AV_OIL));
  add('the keepers are the factory kinds',YC.keepers(AV_KEEPERS));add('the Engines stand among the industry',YC.engines(AV_ENGINES,STAGE.engines,T));
  add('the transit stands: the grid, the highway, the lines, the yard, the subway',YC.transit(STAGE.transit));
  add('the craters are struck and empty',H.craters(STAGE.craters,T));add('the broken buildings lean, a little',H.lean(T));
  add('the forest is feral and tinted',H.feral(AV.FERAL,window._tinted||0));add('no tree on a street, a plinth or a scar',H.clear(REG));add('the cards are cut: every alpha map is tested',H.cardsCut());
  add('the ruined vehicles stand in the streets',YC.wrecks(AVW.records));};
 STAGE.negativeList=function(add,H,VIEWS){const T=STAGE.plan.towers,I=Y.INDUSTRY,TR=STAGE.transit;
  add('a view with nothing built anywhere',H.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower')));
  add('an industrial building missing',YC.industry(I.filter(t=>t.family!=='foundry')));
  add('a hall moved into the yard\'s row',YC.industry(I.map((t,i)=>i?t:Object.assign({},t,{z:0}))));
  add('a hall standing in an avenue',YC.streets(T.concat([Object.assign({},I[0],{x:-742.5,z:-495})]),Y.PIECES));
  add('a rack\'s bent in a street',YC.streets(T,Y.PIECES.map(Q=>Q.kind==='piperack'?Object.assign({},Q,{bents:Q.bents.concat([{x:-742.5,z:-705}])}):Q)));
  add('a siding 40 m off the line',YC.yard(TR,Object.assign({},Y.YARD,{sidings:Y.YARD.sidings.map((S,i)=>i?S:Object.assign({},S,{pts:S.pts.map(p=>[p[0],p[1]+40])}))}),Y.PIECES));
  add('the yard laid across an avenue',YC.yard(TR,Object.assign({},Y.YARD,{outline:Y.YARD.outline.map(p=>[p[0]+1500,p[1]])}),Y.PIECES));
  add('no wagon derailed',YC.wagons(TR.trains.map(t=>Object.assign({},t,{state:'standing'}))));
  add('a piece drawn before it was registered',YC.pieces(Y.PIECES.map((Q,i)=>i?Q:Object.assign({},Q,{registered:false})),true));
  add('a pool on live ground',YC.ground(Object.assign({},Y,{SPILL:Y.SPILL.concat([{x:0,z:-1800}])})));
  add('the clear day\'s weather and the Overlook\'s air',YC.air(typeof AV_OIL!=='undefined'?Object.assign({},AV_OIL,{mode:'clear?'}):null,Object.assign({},STAGE,{fogDensity:.00036})));
  add('a keeper of the park\'s kinds',YC.keepers(AV_KEEPERS.map((k,i)=>i?k:Object.assign({},k,{key:'an_gardener'}))));
  add('an Engine in the yard',YC.engines(AV_ENGINES,STAGE.engines.map((e,i)=>i?e:Object.assign({},e,{z:STAGE.yards.LINE_Z})),T));
  add('no transit at all',YC.transit(null));
  add('a tower in a crater',H.craters(STAGE.craters,T.concat([{x:STAGE.craters[0].x,z:STAGE.craters[0].z}])));
  add('impostors looked up by the float64 key',H.impHidden((x,z)=>(x+1e-3)+','+z));
  add('a wreck in a superblock',YC.wrecks(AVW.records.map((w,i)=>i?w:Object.assign({},w,{x:-990,z:-495}))));};}
