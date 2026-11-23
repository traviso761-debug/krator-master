/* node settlements/theodiga/test-th-town-rooms.js: the town's interiors (src/46-th-town-rooms.js) from the Scrap Xanadu set
   (kits/interiors sets/xanadu-scrap.js on dist/interiors-core.js), on placements of every scrap def turned and raised as the town
   places them, each check with a negative (tools/ktest.js): every room lies inside its building's footprint as placed; every
   storey stands at the plot's base plus its level's height; a building's street door is the planned one turned onto its plot;
   a furnished piece lands in its room as turned; one plan a kind; the skipped defs and the Qiblai buildings have no rooms; the
   sites are the quarters, their boxes hold their buildings; the same twice. */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const IX=global.KratorInteriors=require(path.join(ROOT,'kits/interiors/dist/interiors-core.js'));
(0,eval)(fs.readFileSync(path.join(ROOT,'kits/interiors/sets/xanadu-scrap.js'),'utf8'));
(0,eval)(fs.readFileSync(path.join(ROOT,'settlements/theodiga/src/46-th-town-rooms.js'),'utf8'));
const KEYS=['xa_scrap_house','xa_scrap_row','xa_scrap_court','xa_scrap_bazaar','xa_scrap_serai','xa_scrap_gate','xa_scrap_tower','xa_scrap_shrine','xa_scrap_pavilion',
 'xa_scrap_granary','xa_scrap_store','xa_scrap_bath','xa_scrap_tank_house','xa_scrap_silos','xa_scrap_hull','xa_scrap_glint','xa_scrap_shacks','xa_scrap_farm','qb_house_mid'];
const Q=['square','bazaar','gate','poor'];
const placed=[];KEYS.forEach((k,i)=>{for(let v=0;v<2;v++)placed.push({id:'t.'+i+'.'+v,key:k,v,x:300+i*60,z:-200+v*90,ry:(i*1.3+v*2.1)%6.283,y:438+(i%5)*.7,quarter:Q[(i+v)%4],name:k});});
/* a stub furnisher: one piece a room at its first door's opposite side, so the test sees placements turned (the page uses IX.furnishRoom) */
const furnish=R=>{const n=R.poly.length,c=R.poly.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n],[0,0]);return {placements:[{key:'stub',variant:0,x:c[0],z:c[1],y:R.y,ry:0}]};};
const O={placed,IX,furnish,name:q=>'quarter '+q};
const M=TH_TOWN_ROOMS.make(O);
const n=M.sites.reduce((s,S)=>s+S.buildings.length,0),rooms=M.sites.reduce((s,S)=>s+S.buildings.reduce((k,B)=>k+B.storeys.reduce((j,st)=>j+st.rooms.length,0),0),0);
console.log(M.sites.length+' sites, '+n+' buildings, '+rooms+' rooms, '+M.kinds+' kinds; skipped '+JSON.stringify(M.skipped));
const at=TH_TOWN_ROOMS.at,inPoly=TH_TOWN_ROOMS.inPoly;
const byId={};for(const r of placed)byId[r.id]=r;
const src=B=>byId[B.id.split('.').slice(0,3).join('.')];
const CHECKS={
 'every room lies inside its building as placed':X=>{let bad=0;for(const S of X.sites)for(const B of S.buildings)for(const st of B.storeys)for(const R of st.rooms)if(R.poly.some(p=>!B.inside(p[0],p[1],st.y)))bad++;return [bad===0,bad+' rooms outside'];},
 'every storey stands at its plot\'s base plus its level\'s height':X=>{let bad=0;const SET=IX.sets.byName['xanadu-scrap'];
   for(const S of X.sites)for(const B of S.buildings){const r=src(B),it=SET.forDef(r.key,r.v),inst=IX.sets.instantiate(it,0,0,0,{baseY:0,register:false,seed:0}),bi=B.id.split('.').length>3?+B.id.split('.')[3]:0;
    B.storeys.forEach((st,k)=>{if(Math.abs(st.y-(r.y+inst.buildings[bi].levels[k].y))>.002)bad++;});}return [bad===0,bad+' storeys off'];},
 'a building\'s street door is the planned one turned onto its plot':X=>{let bad=0;const SET=IX.sets.byName['xanadu-scrap'];
   for(const S of X.sites)for(const B of S.buildings){const r=src(B),it=SET.forDef(r.key,r.v),inst=IX.sets.instantiate(it,r.x,r.z,r.ry,{baseY:r.y,register:false,seed:0}),bi=B.id.split('.').length>3?+B.id.split('.')[3]:0;
    /* the STREET doors (the planner snaps its interior cuts in world metres, so an inner door may sit a hand's width apart
       on a turned plot; the street door is the building's own, which the kit's leaf hangs in) */
    const st=R=>(R.doors||[]).filter(d=>d.to==='street'||d.kind==='street'||d.into==='street');
    const want=inst.buildings[bi].rooms.flatMap(st).map(d=>d.at),got=B.storeys.flatMap(s=>s.rooms).flatMap(st).map(d=>d.at);
    if(!want.length||want.length!==got.length||want.some(p=>!got.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<.05)))bad++;}return [bad===0,bad+' buildings with a street door off'];},
 'a furnished piece lands in its room as turned':X=>{let bad=0;for(const S of X.sites)for(const r of S.furniture.rooms)for(const p of r.placements)if(!inPoly([p.x,p.z],r.R.poly)||Math.abs(p.y-r.R.y)>.002)bad++;return [bad===0,bad+' pieces out of their rooms'];},
 'the sites are the quarters, their boxes hold their buildings':X=>{let bad=0;for(const S of X.sites){if(S.id!=='town/'+S.quarter)bad++;for(const B of S.buildings)for(const p of B.outer)if(p[0]<S.box[0]-1e-6||p[0]>S.box[1]+1e-6||p[1]<S.box[2]-1e-6||p[1]>S.box[3]+1e-6)bad++;
   for(let k=1;k<S.storeys.length;k++)if(S.storeys[k].y<S.storeys[k-1].y)bad++;}return [bad===0&&X.sites.length===4,X.sites.length+' sites, '+bad+' off'];}};
const clone=()=>{const X=TH_TOWN_ROOMS.make(O);return X;};
const NEG={
 'every room lies inside its building as placed':X=>{const R=X.sites[0].buildings[0].storeys[0].rooms[0];R.poly=R.poly.map(p=>[p[0]+50,p[1]]);},
 'every storey stands at its plot\'s base plus its level\'s height':X=>{X.sites[1].buildings[0].storeys[0].y+=1;},
 'a building\'s street door is the planned one turned onto its plot':X=>{const R=X.sites[0].buildings[0].storeys[0].rooms.find(R=>(R.doors||[]).some(d=>d.to==='street'||d.kind==='street'||d.into==='street'));
   const d=R.doors.find(d=>d.to==='street'||d.kind==='street'||d.into==='street');d.at=[d.at[0]+2,d.at[1]];},
 'a furnished piece lands in its room as turned':X=>{const p=X.sites[0].furniture.rooms[0].placements[0];p.x+=40;},
 'the sites are the quarters, their boxes hold their buildings':X=>{X.sites[2].box[1]-=30;}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](M);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,Y=>CHECKS[name](Y)[0],(()=>{const X=clone();NEG[name](X);return X;})(),clone());}
T.ok('one plan a kind ('+M.kinds+' for '+new Set(placed.filter(r=>/^xa_/.test(r.key)&&!/pavilion|granary/.test(r.key)).map(r=>r.key+'|'+r.v)).size+' kinds placed)',
 M.kinds===new Set(placed.filter(r=>/^xa_/.test(r.key)&&!/pavilion|granary/.test(r.key)).map(r=>{const it=IX.sets.byName['xanadu-scrap'].forDef(r.key,r.v);return it.key+'|'+r.v;})).size);
T.ok('the skipped defs and the Qiblai buildings have no rooms',M.skipped.xa_scrap_pavilion===2&&M.skipped.xa_scrap_granary===2&&!M.sites.some(S=>S.buildings.some(B=>/^qb_/.test(B.key))));
T.ok('the plans rerun the same',JSON.stringify(clone().sites.map(S=>S.buildings.map(B=>B.storeys)))===JSON.stringify(M.sites.map(S=>S.buildings.map(B=>B.storeys))));
T.done();
