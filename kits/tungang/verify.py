#!/usr/bin/env python3
"""Headless check for the Tungang kit (its Fellgang and Glazier sets).

  python3 verify.py dist/tungang.html [--views "Opening|Sample village"] [--cut] [--night] [--worn] [--cam cx,cy,cz,tx,ty,tz]
                                      [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Serves the page over HTTP on tools/harness.py (the Chromium launcher, the local three.js r128, the GPU lanes and the
watchdog: KRATOR_GL=gpu for the real GPU), waits for window._ready and the library textures (window._texPending), prints
the error panel and the build counters, runs the invariants with --assert, and screenshots each view. --only builds just
those def keys (?only=); --cut opens the buildings (the cut-away), --night lights the lamps, --worn shoots the worn state.
The clock is pinned (?t=4).

--assert: every check runs on the page and again on a broken input that must FAIL (its negative); a check whose negative
passes is a failure too. The checks (kits/tungang/README.md, "Checks"):
  box-within-contract   every def builds within 0.5 m of its box (riftrim's stand-ins' w, d, h), in both states
  tags-vocabulary       the core/tags audit is clean (no unknown value or key, every building with a culture and types)
  error-panel           the error panel and the console are empty
  meethall-variants     the Fowlers' rope wall (a peg a family, coils, an empty peg) and the Ice-cutters' tally board
  plinth-on-slope       on the sloped pad: the floor at the highest corner, the plinth to the lowest, the byre down-slope
  fixed-line-follows    the ropes on the test wall follow their records (no vertex strays, no point is left short)
  host-api              TG.fg.draw draws every record of the sample village (core/hamlet's fellgang row, fowling)
  gz-box-within         every Glazier site within its box (TG.gz.BOX: w, d with its out, h) and filling its share, kept, worn, abandoned
  gz-void-plans         every def's void plan (8 seeds) inside its box, its rooms kept apart by rock
  gz-rock-carved        the rows' and the scarp's rock carved from the plans (open in each first room, solid behind it)
  gz-lights-by-state    the lamps as light records: the kept scarp lit, the abandoned rows dark
  gz-host-api           TG.gz.draw draws every site of the sample scarp
  gz-loj-rooms          the Register's plaques (one per vein, and the hold's own), the wheel walks' wheels, the tea halls' count wall
  gz-walk-carved        a walker finds the cavern's floor in a carved room (core/walk from the plan)
  coverage, no-nan, furniture-keys, material-records
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import parse_views, verify_page
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

ASSERT_JS = r"""()=>{const A=window._api,R=[],S=window._fgSheet||{},C=TG.fg.check;
 const add=(name,pass,neg,detail)=>R.push({name,ok:!!pass.ok&&!neg.ok,detail:(pass.ok?'':'FAILED ')+(pass.detail||'')+(neg.ok?'  [its negative did not fail: '+(neg.detail||'')+']':'  (negative fails: '+(neg.detail||'')+')')});
 const top=()=>REG.filter(r=>!r.parent);
 /* box: the 14 buildings against their stand-in boxes, the pieces against their declared ones, kept then worn */
 const boxOf=recs=>{const B=C.box(recs.filter(r=>TG.fg.BOX[r.key]));const P=C.box(recs.filter(r=>!TG.fg.BOX[r.key]&&r.key!=='fg-fixed-line'&&/^fg-/.test(r.key)));return {ok:B.ok&&P.ok,detail:B.rows.length+' buildings, '+P.rows.length+' pieces'+(B.bad.concat(P.bad).length?': '+B.bad.concat(P.bad).join(' | '):'')};};
 const kept=boxOf(top());const wr=[];for(const S0 of SITES.filter(S0=>/^fg-/.test(S0.key))){const p=TG.fg.proto(S0.key,Object.assign({},S0.o,{state:FG_STATE==='worn'?'kept':'worn'}));wr.push(...p.recs);p.forEach(m=>m.geometry.dispose());}
 const worn=boxOf(wr),wornRecs=wr.length;
 const hut=top().find(r=>r.key==='fg-hut');
 add('box-within-contract',{ok:kept.ok&&worn.ok&&wornRecs>0,detail:'kept: '+kept.detail+'; worn: '+worn.detail},
  (()=>{const q=C.box([Object.assign({},top().find(r=>r.key==='fg-meethall'),{key:'fg-hut'})]);return {ok:q.ok,detail:'too big: a meeting hall checked against the hut\'s box: '+q.bad.join('')};})());
 add('box-fills-its-share',{ok:kept.ok,detail:'every building fills 65 % of its box\'s w and d and 75 % of its h (the families: '+[...new Set(top().filter(r=>r.fg&&r.fg.family).map(r=>r.key.slice(3)+':'+r.fg.family))].length+' key-family pairs on the sheet)'},
  (()=>{const q=C.box([Object.assign({},hut,{key:'fg-meethall'})]);return {ok:q.ok,detail:'too small: a hut checked against the meeting hall\'s box: '+q.bad.join('')};})());
 /* each def within its triangle budget (the def's own, kept and worn); the sample village's total */
 const budgetOf=(recs,k)=>{const over=recs.filter(r=>DEFS[r.key]&&DEFS[r.key].budget&&r.tris>DEFS[r.key].budget*k);return {ok:!over.length&&recs.length>0,detail:over.slice(0,6).map(r=>r.key+'#'+r.v+' '+r.tris+' > '+Math.round(DEFS[r.key].budget*k)).join(' | ')};};
 const bk=budgetOf(top(),1),bw2=budgetOf(wr,1),heavy=top().slice().sort((a,b)=>b.tris-a.tris).slice(0,3).map(r=>r.key+' '+r.tris).join(', '),vt=(S.villageDraw&&S.villageDraw.tris)||0;
 add('triangle-budget',{ok:bk.ok&&bw2.ok&&vt<130000,detail:'every def within its budget, kept and worn (heaviest '+heavy+'); the sample village '+vt+' triangles'+(bk.detail||bw2.detail?': '+bk.detail+' '+bw2.detail:'')},
  (()=>{const q=budgetOf(top(),.25);return {ok:q.ok,detail:'the budgets cut to a quarter: '+q.detail.slice(0,160)};})());
 /* tags */
 const T=A.tags().audit;const scratch=KTAGS.create({build:'neg'});scratch.add({'class':'building',kind:'x',key:'x',name:'x',at:[0,0,0],ry:0,size:[1,1,1],tags:{culture:'nonesuch',types:['spaceport']}});const TN=scratch.audit();
 add('tags-vocabulary',{ok:T.unknown===0&&T.missingCulture===0&&T.missingTypes===0&&T.records>100,detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues)+JSON.stringify(T.unknownKeys):'')},
  {ok:TN.unknown===0,detail:'a record of culture nonesuch, type spaceport: unknown '+TN.unknown});
 /* the meeting hall's variants (the sheet's, the sample village's, and the town double hall holding both customs in one) */
 const fow=r=>!!r.fg&&r.fg.variant==='fowlers'&&r.fg.pegs>0&&r.fg.empty>=1&&r.fg.coils===r.fg.pegs-r.fg.empty&&!r.fg.slats,
  ice=r=>!!r.fg&&r.fg.variant==='icecut'&&r.fg.slats>0&&r.fg.notches>=r.fg.slats*3&&!r.fg.pegs,
  dbl=r=>!!r.fg&&r.fg.variant==='double'&&r.fg.pegs>0&&r.fg.empty>=1&&r.fg.coils===r.fg.pegs-r.fg.empty&&r.fg.slats>0&&r.fg.notches>=r.fg.slats*3;
 const halls=top().filter(r=>r.key==='fg-meethall'),hf=halls.filter(r=>r.fg&&r.fg.variant==='fowlers'),hi=halls.filter(r=>r.fg&&r.fg.variant==='icecut'),hd=top().filter(r=>r.key==='fg-doublehall');
 const vh=(S.villageDraw&&S.villageDraw.recs||[]).filter(r=>r.key==='fg-meethall'),pop=S.village&&S.village.census?S.village.census.pop:0,hh=Math.max(6,Math.round((pop||140)/5));
 add('meethall-variants',{ok:hf.length===3&&hi.length===2&&hd.length===3&&hf.every(fow)&&hi.every(ice)&&hd.every(dbl)&&vh.length===1&&fow(vh[0])&&vh[0].fg.pegs===hh,
   detail:'rope wall: '+hf.map(r=>r.fg.pegs+' pegs, '+r.fg.coils+' coils, '+r.fg.empty+' empty').join('; ')+'; tally board: '+hi.map(r=>r.fg.slats+' slats, '+r.fg.notches+' notches').join('; ')+'; double hall: '+hd.map(r=>r.fg.pegs+' pegs & '+r.fg.slats+' slats').join('; ')+'; the sample village\'s hall: '+(vh[0]&&vh[0].fg?vh[0].fg.variant+', '+vh[0].fg.pegs+' pegs for '+hh+' households':'none')},
  {ok:hi.length>0&&hi.every(dbl),detail:'the single tally-board hall checked as a double hall'});
 /* the sloped pad */
 const pad=S.pad&&S.pad.recs||[],pl=C.plinth(pad,FG_PAD.ground),lh=pad.find(r=>r.key==='fg-longhouse'),flatLh=top().find(r=>r.key==='fg-longhouse');
 const byreOk=lh&&lh.fg&&lh.fg.byre===-1&&flatLh&&flatLh.fg&&flatLh.fg.byre===1;
 const pn=C.plinth(pad,(x,z)=>FG_PAD.ground(x,z)-3);
 add('plinth-on-slope',{ok:pl.ok&&pad.length===5&&pl.fall>1&&byreOk,detail:pad.length+' buildings on the pad, the greatest fall under one '+pl.fall.toFixed(2)+' m; byre '+(lh&&lh.fg?lh.fg.byre:'?')+' (down-slope is -1) on the pad, '+(flatLh&&flatLh.fg?flatLh.fg.byre:'?')+' on the flat'+(pl.bad.length?'; '+pl.bad.join(' | '):'')},
  {ok:pn.ok,detail:'the pad\'s buildings checked against ground 3 m lower: '+pn.bad.length+' short'});
 /* the ropes */
 const ropes=S.ropes||[],rm=S.ropeDraw||[],rc=C.rope(ropes,rm),rn=C.rope(ropes.map(r=>Object.assign({},r,{pts:r.pts.map(p=>[p[0]+3,p[1],p[2]])})),rm);
 const rr=(S.ropeDraw&&S.ropeDraw.recs)||[];
 add('fixed-line-follows',{ok:rc.ok&&ropes.length===6&&rr.length===6&&rr.every(r=>r.fg&&r.fg.rungs>20&&r.fg.pegs>=1),detail:ropes.length+' ropes, '+rc.verts+' vertices: the farthest from its record '+rc.far+' m, the record\'s farthest point from the line '+rc.gap+' m; pegs '+rr.map(r=>r.fg&&r.fg.pegs).join(',')+', rungs '+rr.map(r=>r.fg&&r.fg.rungs).join(',')},
  {ok:rn.ok,detail:'the records moved 3 m east: farthest '+rn.far+' m'});
 /* walls block a walker (core/walk, from the boxes a building draws), an open door lets one through */
 const wd=KDOOR.list.find(d=>d.key==='fg-hut'&&!d.locked),walkOk=(p,h)=>!KWALK.blocked(p[0],p[1]+.02,p[2],.3,h==null?1.5:h);
 let walk={ok:false,detail:'no hut door'},walkNeg={ok:true,detail:'n/a'};
 if(wd){const ux=Math.cos(wd.yaw),uz=-Math.sin(wd.yaw),wall=[wd.at[0]+ux*1.35,wd.at[1],wd.at[2]+uz*1.35],shut=walkOk(wd.at);
  KDOOR.open(wd.id,{by:'verify'});for(let k=0;k<40;k++)KDOOR.step(.1);const open=walkOk(wd.at),wallBlocked=!walkOk(wall),blk=KWALK.blocked(wall[0],wall[1]+.02,wall[2],.3,1.5);
  KDOOR.close(wd.id,{by:'verify'});for(let k=0;k<40;k++)KDOOR.step(.1);
  walk={ok:open&&!shut&&wallBlocked,detail:'a hut\'s door ('+wd.id+'): shut it blocks '+(!shut)+', open a walker passes '+open+'; 1.35 m along its wall a walker is stopped '+wallBlocked+' (by '+(blk&&blk.tag)+'); '+KWALK.export().blocks.length+' blocks, '+KWALK.export().floors.length+' floors'};
  walkNeg={ok:walkOk(wall),detail:'a walker put in the wall itself, checked as passing'};}
 add('walls-block-doors-pass',walk,walkNeg);
 /* the host API on the sample village */
 const V=S.village||{},vd=S.villageDraw||[],neg=TG.fg.draw({records:[{key:'fg-nonesuch',x:0,z:0,ry:0}]},{ground:()=>0});
 add('host-api',{ok:!V.error&&V.records&&V.records.length>=8&&vd.recs&&vd.recs.length===V.records.length&&!Object.keys(vd.missing).length&&vd.length>3,
   detail:(V.records?V.records.length:0)+' records (KHAMLET.village, fellgang, fowling: '+(V.census?V.census.pop:0)+' people), '+(vd.recs?vd.recs.length:0)+' drawn into '+vd.length+' meshes, '+vd.tris+' triangles'},
  {ok:!Object.keys(neg.missing).length,detail:'a record of a key the kit lacks: missing '+JSON.stringify(neg.missing)});
 /* coverage: every def drawn, on the rows or by the host API */
 const drawn=new Set(REG.map(r=>r.key));for(const k of ['pad','villageDraw','ropeDraw','wall','road'])for(const r of (S[k]&&S[k].recs||[]))drawn.add(r.key);
 const miss=Object.keys(DEFS).filter(k=>!drawn.has(k));
 add('coverage',{ok:!miss.length,detail:miss.length?'not drawn: '+miss.join(', '):Object.keys(DEFS).length+' defs drawn'},{ok:!Object.keys(DEFS).concat(['fg-nonesuch']).filter(k=>!drawn.has(k)).length,detail:'fg-nonesuch'});
 add('no-nan',{ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()},(()=>{const g=new THREE.Group(),b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute([0,NaN,0,1,0,0,0,0,1],3));g.add(new THREE.Mesh(b));let n=0;g.traverse(m=>{if(m.geometry){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){n++;break;}}});return {ok:n===0,detail:n+' nan mesh'};})());
 const fu=A.furniture(),fm=Object.keys(fu.missing);
 add('furniture-keys',{ok:!fm.length&&fu.placed>100,detail:fm.length?'missing from the catalog: '+fm.join(', '):fu.placed+' pieces from '+fu.keys+' catalog keys'},{ok:KratorFurniture.has('fellgang_nonesuch'),detail:'fellgang_nonesuch'});
 /* THE GLAZIERS (gz): their boxes kept, worn and abandoned; the void plans; the rock carved from them; the lamps by state; the
    host API on the sample scarp; the loj's rooms (the count wall, the Register's plaques, the wheels); a walker on a carved floor */
 const GZ=TG.gz.check,gzS=window._gzSheet||{},gzTop=top().filter(r=>/^gz-/.test(r.key)),gzWr=[],gzAb=[];let gzLw=0,gzLa=0;
 for(const S0 of SITES.filter(S0=>/^gz-/.test(S0.key))){for(const st of ['worn','abandoned']){const p=TG.gz.proto(S0.key,Object.assign({},S0.o,{state:st}));(st==='worn'?gzWr:gzAb).push(...p.recs);
  if(st==='worn')gzLw+=p.lights.length;else gzLa+=p.lights.length;p.forEach(m=>m.geometry.dispose());}}
 const gzB=GZ.box(gzTop),gzBw=GZ.box(gzWr),gzBa=GZ.box(gzAb),gzHall=gzTop.find(r=>r.key==='gz-tea-hall');
 add('gz-box-within',{ok:gzB.ok&&gzBw.ok&&gzBa.ok&&gzTop.length===39&&gzWr.length===39&&gzAb.length===39,detail:gzTop.length+' Glazier sites kept, '+gzWr.length+' worn, '+gzAb.length+' abandoned, each within its box and filling its share'+(gzB.bad.concat(gzBw.bad,gzBa.bad).length?': '+gzB.bad.concat(gzBw.bad,gzBa.bad).slice(0,6).join(' | '):'')},
  (()=>{const q=GZ.box([Object.assign({},gzHall,{key:'gz-cell'})]);return {ok:q.ok,detail:'the tea hall measured against the cell\'s box: '+q.bad.join('')};})());
 const gzP=GZ.plans(),gzPn=GZ.plans(4);
 add('gz-void-plans',{ok:gzP.ok,detail:gzP.voids+' voids over 8 seeds of '+Object.keys(TG.gz.PLANS).length+' defs: each inside its box, rooms kept .6 m of rock apart'+(gzP.bad.length?': '+gzP.bad.slice(0,6).join(' | '):'')},{ok:gzPn.ok,detail:'4 m of rock asked between rooms: '+gzPn.bad.length+' too close'});
 const gzSites=(gzS.rows||[]).reduce((a,r)=>a.concat(r.sites),[]).concat(gzS.scarp?gzS.scarp.sites:[]),gzC=gzS.cavern?GZ.carved(gzS.cavern,gzSites):{ok:false,bad:['no cavern'],n:0},
  gzCn=gzS.cavern?GZ.carved(gzS.cavern,gzSites.map(q=>Object.assign({},q,{z:q.z+2000}))):{ok:false,bad:[]};
 add('gz-rock-carved',{ok:gzC.ok&&gzS.prims>100&&gzS.rock&&gzS.rock.tris>1000,detail:gzC.n+' sites: open at the first room\'s centre, rock behind its back wall; '+gzS.prims+' primitives, the rock '+(gzS.rock?gzS.rock.tris+' triangles in '+gzS.rock.chunks+' chunks, built in '+gzS.buildMs+' ms, meshed in '+gzS.rock.ms+' ms':'none')+(gzC.bad.length?': '+gzC.bad.slice(0,5).join(' | '):'')},
  {ok:gzCn.ok,detail:'every site moved 2 km north, off the rock: '+(gzCn.bad||[]).length+' fail'});
 const gzK=(gzS.draw&&gzS.draw.lights||[]).length;
 add('gz-lights-by-state',{ok:gzK>20&&gzLw>0&&gzLa===0,detail:'the scarp (kept) '+gzK+' light records ('+GZ.lights(gzS.draw).kinds.join(', ')+'), the rows worn '+gzLw+', abandoned '+gzLa},{ok:gzK===0,detail:'the kept scarp checked as abandoned (no lamp lit)'});
 const gzD=gzS.draw||{recs:[],missing:{}},gzNeg=TG.gz.draw([{key:'gz-nonesuch',x:0,z:0}],{});
 add('gz-host-api',{ok:gzS.scarp&&gzD.recs.length===gzS.scarp.sites.length&&!Object.keys(gzD.missing).length&&gzD.length>3,detail:(gzS.scarp?gzS.scarp.sites.length:0)+' scarp sites, '+gzD.recs.length+' drawn into '+gzD.length+' meshes, '+gzD.tris+' triangles'},
  {ok:!Object.keys(gzNeg.missing).length,detail:'a site of a key the kit lacks: missing '+JSON.stringify(gzNeg.missing)});
 const gzRegs=gzTop.filter(r=>r.key==='gz-register-room'),gzWalks=gzTop.filter(r=>r.key==='gz-wheel-walk'),gzHalls=gzTop.filter(r=>r.key==='gz-tea-hall');
 const gzCiv=k=>gzRegs.every(r=>r.fg&&r.fg.plaques===r.fg.register+1+k)&&gzWalks.every(r=>r.fg&&r.fg.wheels>=8&&r.fg.wheels<=12)&&gzHalls.every(r=>r.fg&&r.fg.countWall===1&&r.fg.timetable===1&&r.fg.benches>=4&&r.fg.countLamps===8);
 add('gz-loj-rooms',{ok:gzRegs.length===3&&gzWalks.length===3&&gzHalls.length===3&&gzCiv(0),detail:'the Register: '+gzRegs.map(r=>r.fg&&(r.fg.register+' veins, '+r.fg.plaques+' plaques')).join('; ')+'; the wheel walks: '+gzWalks.map(r=>r.fg&&r.fg.wheels).join(', ')+' wheels; the tea halls: '+gzHalls.map(r=>r.fg&&(r.fg.benches+' benches, '+r.fg.countLamps+' count lamps')).join('; ')},
  {ok:gzCiv(1),detail:'one plaque more asked of every Register'});
 /* a walker on a carved floor: the scarp's household fronts, the hearth room's centre (the cavern wrote its floor from the plan) */
 const gzFr=(gzS.scarp?gzS.scarp.sites:[]).filter(q=>q.key==='gz-front'),gzOnF=(q,dz)=>{const H=TG.gz.plan('gz-front',{v:q.v}).H,x=q.x+H.x+(dz?H.w/2-.35:0),z=q.z+H.z+(dz?-H.d/2-.45:0);return KWALK.floorsAt(x,z).some(f=>Math.abs(f[0]-(q.y+H.y))<.15);};
 add('gz-walk-carved',{ok:gzFr.length===2&&gzFr.every(q=>gzOnF(q,0)),detail:gzFr.length+' household fronts on the scarp: a floor at the hearth room\'s centre, at its height'},{ok:gzFr.length>0&&gzFr.every(q=>gzOnF(q,1)),detail:'a point in the rock behind the hearth room\'s back wall, at its end'});
 const M=A.materials();add('material-records',{ok:!!(M&&M.records&&M.records.length>15&&M.records.filter(r=>r.lib).length>15),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from the library':'none'},{ok:false,detail:'n/a'});
 return R;}"""


def panel_ok(text, errs):
    """the error panel check: clean text and no page or console error"""
    return not (text or '').strip() and not errs


async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    q = ['t=4']
    if a.only: q.append('only=' + a.only)
    if a.worn: q.append('state=worn')
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query='?' + '&'.join(q), settle_ms=0) as V:
        pg, fails = V.page, V.fails
        if not V.ready: print('never ready'); fails.append('build timeout')
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)'); print('build:', json.dumps(await pg.evaluate("window._build||null")))
        for x in errs[:8]: print('pageerror:', x)
        ok = panel_ok(e, errs); neg = panel_ok('build fg-hut: TypeError', [])
        print(('PASS ' if ok and not neg else 'FAIL ') + 'error-panel - ' + ('clean' if ok else 'not clean') + ('  (negative fails: a panel with an error)' if not neg else '  [its negative did not fail]'))
        bad |= not ok or neg
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:900]); bad |= not r['ok']
        if a.cut: await pg.evaluate("cutSet(true)")
        if a.night: await pg.evaluate("nightSet(true)")
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>setView(...v)", v); await pg.wait_for_timeout(900); await V.shot(os.path.join(a.out, 'cam.png'), view='cam'); print('shot cam.png')
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views: views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            okv = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not okv: print('no view', vn); continue
            await pg.wait_for_timeout(900); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await V.shot(fn, view=vn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        if bad: fails.append('kit checks (error panel, page errors or an assert)')
    sys.exit(V.exit())
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true'); ap.add_argument('--worn', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
