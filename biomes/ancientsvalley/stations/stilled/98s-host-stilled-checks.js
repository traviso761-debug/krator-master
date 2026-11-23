// ================================================================= HOST — the Stilled Ground's checks (verify.py --assert reads them through 99's hostChecks)
// [web] PLAN.md section 17's checks for S1: the hold is a record in core/tags before anything is drawn, zero outside its shape and held at its core;
// the rings of decay (the towers' mean ruin severity rising band by band outward, the held core whole); the ground (no ash, glass or growth in the
// core, glass on the outer floor); and the general ones the stations share. Each has a negative: the same check on a record broken on purpose fails.
{const C=STAGE.core,EL=STAGE.elapsed,coreD=STAGE.coreD,HOLD=STAGE.hold;
 const BANDS=[0,300,800,1300,1800,2300,2800,3300,4200];
 const SC={
  /* the hold: one tags record (feature, anomaly) with its time hazard; elapsed 1 on a ring just outside the shape, 0 at the centre */
  hold(tags,hold,el){const rec=tags&&tags[0],hz=rec&&rec.tags&&rec.tags.hazard;let outside=0;
   for(let k=0;k<64;k++){const a=k/64*Math.PI*2,x=C.x+Math.cos(a)*(hold.shape.r+50),z=C.z+Math.sin(a)*(hold.shape.r+50);if(Math.abs(el(x,z)-1)>1e-9)outside++;}
   const core=el(C.x,C.z);return{ok:!!rec&&tags.length===1&&!!hz&&hz.kind==='time'&&outside===0&&core<1e-6,
    detail:(tags?tags.length:0)+' tags record(s), hazard '+(hz?hz.kind:'none')+'; elapsed at the core '+core.toFixed(4)+', '+outside+' of 64 points just outside not 1'};},
  /* the rings: each band's mean ruin severity (AV.RUINS' index) no less than the band inside it (by 0.15), the held core's towers all intact, the
     outer bands ruined (mean over 1.5) */
  rings(T){const sev=[],n=[];for(let b=0;b+1<BANDS.length;b++){const In=T.filter(t=>{const d=coreD(t.x,t.z);return d>=BANDS[b]&&d<BANDS[b+1];});n.push(In.length);sev.push(In.length?In.reduce((s,t)=>s+AV.RUINS.indexOf(t.state),0)/In.length:null);}
   let drop=0,prev=-1;sev.forEach(v=>{if(v==null)return;if(v<prev-.15)drop++;prev=Math.max(prev,v);});
   const held=T.filter(t=>coreD(t.x,t.z)<BANDS[1]),heldOk=held.every(t=>t.state==='intact'),outer=sev.slice(-2).filter(v=>v!=null),outerOk=outer.length&&outer.every(v=>v>1.5);
   return{ok:drop===0&&heldOk&&outerOk,detail:'mean severity by band '+sev.map((v,i)=>BANDS[i]+'-'+BANDS[i+1]+': '+(v==null?'-':v.toFixed(2))+' ('+n[i]+')').join(', ')+'; '+drop+' band(s) younger than the one inside; '+held.length+' held, '+(heldOk?'all whole':'not all whole')};},
  /* the buildings on the ground: none under the lake's level; on the hold's glass (the outer floor, partly glazed where the strike's time ran part
     way, so its towers are part ruined too) no tower stands whole and clean: at most a tenth intact (a tower's own draw can be young anywhere) */
  standing(T,F){let wet=0,onGlass=0,whole=0;for(const t of T){if(t.y<STAGE.lakeY+2)wet++;if(F.glass(t.x,t.z)>.5){onGlass++;if(t.state==='intact')whole++;}}
   return{ok:wet===0&&whole<=Math.max(2,onGlass*.1),detail:T.length+' towers; '+wet+' under the lake, '+onGlass+' on the glass, '+whole+' of them intact'};},
  /* information, not a check: the ruin tops given trees (88's TOPS, the perches), each with its copies and where its volume stands */
  tops(){const L=(window.AV_TOPS||[]).filter(P=>P.got>0);return{ok:true,detail:L.length+' tops with trees: '+L.map(P=>P.t.key+' at '+Math.round(P.t.x)+','+Math.round(P.t.z)+' cut '+Math.round(P.cut)+' got '+P.got+' feet '+(P.feet?P.feet.length:0)+' grown '+(STAGE.grown?STAGE.grown(P.t.x,P.t.z).toFixed(2):'-')).join('; ')};},
  /* the ground: within 300 m of the core no ash (foul), no glass, no growth (feral, forest); the outer floor (2.2-2.6 km out) mostly glass */
  ground(F,forest){let bad=0,n=0,gl=0,gn=0;for(let k=0;k<200;k++){const a=k*2.399,r=300*Math.sqrt((k+.5)/200),x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;n++;if(F.foul(x,z)>.05||F.glass(x,z)>.05||F.feral(x,z)>.05||forest(x,z)>.05)bad++;}
   for(let k=0;k<200;k++){const a=k*2.399,r=2200+400*((k*.618)%1),x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;if(Math.abs(x)>2750||Math.abs(z)>2750)continue;gn++;gl+=F.glass(x,z);}
   const g=gn?gl/gn:0;return{ok:bad===0&&g>.5,detail:bad+' of '+n+' points in the core with ash, glass or growth; the outer floor '+(g*100).toFixed(0)+'% glass ('+gn+' points)'};}};
 STAGE.checkList=function(add,H,VIEWS){const T=STAGE.plan.towers;
  add('the hand of man in every view',H.handOfMan(VIEWS,REG));add('the buildings stand on dry ground, none whole on the glass',SC.standing(T,STAGE.F));add('the ruin tops given trees (information)',SC.tops());add('the impostors hide behind their heroes and shells',H.impHidden((x,z)=>x+','+z));
  add('the hold is a record with its hazard, zero outside, held at its core',SC.hold(STAGE.holdTags,HOLD,EL));
  add('the rings of decay age outward band by band, the core whole',SC.rings(T));
  add('no ash, glass or growth in the held core; glass on the outer floor',SC.ground(STAGE.F,STAGE.forest));
  add('the craters are struck and empty',H.craters(STAGE.craters,T));add('the broken buildings lean, a little',H.lean(T));
  add('the forest is feral and tinted',H.feral(AV.FERAL,window._tinted||0));add('no tree on a street, a plinth or a scar',H.clear(REG));add('the cards are cut: every alpha map is tested',H.cardsCut());};
 STAGE.negativeList=function(add,H,VIEWS){const T=STAGE.plan.towers;
  add('a view with nothing built anywhere',H.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower')));
  add('the hold never registered',SC.hold(null,HOLD,EL));
  add('whole towers standing on the glass',SC.standing(T.map(t=>STAGE.F.glass(t.x,t.z)>.5?Object.assign({},t,{state:'intact'}):t),STAGE.F));
  add('elapsed leaking past the hold',SC.hold(STAGE.holdTags,HOLD,(x,z)=>Math.min(1,EL(x,z)+(coreD(x,z)<4000?.01:0))));
  add('the rings turned inside out',SC.rings(T.map(t=>{const d=coreD(t.x,t.z),i=Math.min(AV.RUINS.length-1,Math.max(0,Math.round((1-Math.min(1,d/3600))*(AV.RUINS.length-1))));return Object.assign({},t,{state:AV.RUINS[i]});})));
  add('a fallen tower in the held core',SC.rings(T.concat([Object.assign({},T[0]||{},{x:C.x+40,z:C.z,state:'fallen'})])));
  add('the core under the foul ash',SC.ground(Object.assign({},STAGE.F,{foul:()=>1}),STAGE.forest));
  add('a tower in a crater',STAGE.craters.length?H.craters(STAGE.craters,T.concat([{x:STAGE.craters[0].x,z:STAGE.craters[0].z}])):{ok:false,detail:'no crater to test'});
  add('impostors looked up by the float64 key',H.impHidden((x,z)=>(x+1e-3)+','+z));};}
