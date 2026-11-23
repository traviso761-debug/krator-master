#!/usr/bin/env python3
"""Headless verification of Laitwal, the Light Wall. The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the town's own:

  town-laid           the bench laid on core/city with no error (frontage-courts on the built blocks), the landmarks placed
                      (the assay house, the factor's house, the bazaar, the quays, the caravanserai, the monastery)
  wall-drawn          every Glazier site drawn through TG.gz.draw (none missing, no TG error), the carved quarter's rock carved
                      (KCAVERN) and the outer wall's sites as fronts on whole rock; the main stair climbs three bands
  wall-carved         at each carved site the rock is open at its first room's centre and solid behind its back wall
                      (TG.gz.check.carved): the void plan is the one source
  wall-tags           every Glazier site registered in core/tags with culture glazier before it was drawn
  half-and-half       the people: about 2,500 in the wall and about 2,500 on the bench (PLAN.md 2), each within 25 %
                      (reported as a budget until the owner calibrates it)
  lights-of-the-wall  the Glaziers' lamps as light records (the moonglass and the lamp code), over 200
  ix-bench            L4: the houses round the Stair Foot built with the Xanadu kit's interiors (hollow walls, planned and
                      furnished rooms), over half of those within its radius, with rooms and pieces
  ix-glazier          L4: from each carved home's front room a walker reaches its first carved room (core/walk: the front's
                      floor from the walked draw, the doorway, the cavern's floor); the carved rooms furnished
  bench-ground        the blocks' open ground is kitchen gardens, orchards and yards, not bare (the owner, 2026-11-16)
  opal-lode           the Great Potch Line (L0): opal nodes (kits/resources, TG.res) at the wall's foot, registered and drawn,
                      on dry ground, some of high grade; every adit, dark adit and vein gallery of the wall takes one by the
                      kit's nearest-node rule (a mine, 400 m)
  wall-scree          the wall's screes (core/terrain KRUBBLE): a talus cone at each band's two ends and heaps in the gaps on
                      the ledges, each on its ground (the bench or the ledge), the ledges' heaps walkable (core/walk)
  opal-flora          the bench grows Opal Valley's middle terrace (biomes/opalvalley 'middlebed', sealed in LW_FLORA): its kin
                      trees in the orchards and yards, its own floor plants, every species found, none on a street or a building
  lake-water          the great lake is core/water's open water with its shore grid: wet out on the lake and at the quays'
                      heads, dry on the bench above the shore; WATER.heightAt within a metre of the lake's level there
  bench-stairs        every building on the bench whose floor stands over the street has a podium and a flight of steps
                      up to it, and a walker climbs from the flight's foot onto the podium's front and, in a furnished
                      house, through the door onto its floor (core/walk; the owner, 2026-11-16: "podiums / stairs / walk test")

    KRATOR_GL=gpu python3 verify.py dist/lightwall.html --assert --views "Overview,From the lake,The Stair Foot"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
{const T=window._lightwall||{},W=T.wall||{},by=T.byKind||{};
 const marks=['assay','factor','bazaar','quay','caravanserai','monastery'].filter(k=>!by[k]);
 R.push({name:'town-laid',ok:!T.err&&T.lots>150&&!marks.length,detail:T.err?('the bench did not lay: '+T.err):(T.lots+' lots on '+(T.blocks-T.fields)+' built blocks ('+T.fields+' fields), '+T.placed+' placed ('+JSON.stringify(by)+')'+(marks.length?'; missing '+marks.join(', '):''))});
 const stairs=(typeof LW_WALL!=='undefined'?LW_WALL:[]).filter(s=>s.key==='gz-stair'&&s.band>=0&&s.band<3&&Math.abs(s.x)<1).length;
 R.push({name:'wall-drawn',ok:W.drawn===W.sites&&!Object.keys(W.missing||{}).length&&!(W.errors||[]).length&&W.carved>40&&W.facade>100&&W.rock&&W.rock.cavern&&W.rock.cavern.tris>1000&&stairs===3,
  detail:(W.drawn||0)+' of '+(W.sites||0)+' sites drawn ('+(W.carved||0)+' carved, '+(W.facade||0)+' fronts on whole rock), '+(W.tris||0)+' triangles of fronts, the rock '+(W.rock?W.rock.tris+' triangles ('+(W.rock.cavern?W.rock.cavern.chunks+' cavern chunks, built '+W.rock.buildMs+' ms':'no cavern')+')':'none')+', the main stair '+stairs+' flights of bands'+((W.errors||[]).length?'; TG errors: '+W.errors.join(' | '):'')});
 const C=(typeof LW_ROCK!=='undefined'&&LW_ROCK.C)?TG.gz.check.carved(LW_ROCK.C,LW_CARVED):{ok:false,bad:['no cavern'],n:0};
 R.push({name:'wall-carved',ok:C.ok,detail:C.n+' carved sites: open in the first room, rock behind its back wall'+(C.bad.length?'; '+C.bad.slice(0,4).join(' | '):'')});
 const tg=KTAGS.page?KTAGS.page.query({'class':'building',tags:{culture:'glazier'}}):[];
 R.push({name:'wall-tags',ok:tg.length===(W.sites||-1),detail:tg.length+' records of culture glazier for '+(W.sites||0)+' sites'});
 const P=T.people||{},ok=k=>Math.abs((P[k]||0)-2500)<=625;
 R.push({name:'half-and-half',ok:ok('wall')&&ok('bench'),budget:true,detail:'the wall '+(P.wall||0)+', the bench '+(P.bench||0)+' (each ~2,500), total '+(P.total||0)});
 R.push({name:'lights-of-the-wall',ok:(W.lights||0)>200,detail:(W.lights||0)+' light records from the Glaziers\' lamps'});
 const IX=(typeof LW_IX!=='undefined')?LW_IX:{};
 R.push({name:'ix-bench',ok:IX.on&&IX.houses>=IX.near*.5&&IX.rooms>IX.houses&&IX.pieces>300,detail:(IX.houses||0)+' of '+(IX.near||0)+' houses within '+IX.radius+' m of the Stair Foot built with interiors: '+(IX.rooms||0)+' rooms, '+(IX.pieces||0)+' pieces'});
 const homes=(typeof LW_CARVED!=='undefined'?LW_CARVED:[]).filter(s=>/^gz-(cell|front|house)$/.test(s.key)),gz=s=>{const PL=TG.gz.plan(s.key,{v:s.v}),V=PL.voids.find(q=>q.kind==='room'&&!q.pass),out=TG.gz.BOX[s.key].out;const dr=PL.voids.find(q=>q.pass&&q.z+q.d/2>0&&q.y===0);return {V,p:[s.x+(dr?dr.x:V?V.x:0),s.y+.06,s.z+out*.45]};};   /* the walker starts on its doorway's line in the front room */
 const walkTo=(s,dy)=>{const g=gz(s),P=[g.p[0],g.p[1]+dy,g.p[2]];if(!g.V)return false;const r=KWALK.reach([P],{box:[s.x-16,s.x+16,s.z-20,s.z+8],cell:.2});   /* a .95 m doorway between its jambs leaves a .45 m band for a .25 m walker: the default .4 m grid can miss it */return r.reached.some(F=>F.name===s.id+'.'+g.V.id);};
 const got=homes.filter(s=>walkTo(s,0)),neg=homes.slice(0,12).filter(s=>walkTo(s,40));
 const furn=(typeof LW_DRAW!=='undefined'?LW_DRAW:[]).reduce((a,D)=>a+((D.group&&D.group.userData.furniture)|0),0);
 R.push({name:'ix-glazier',ok:homes.length>40&&got.length===homes.length&&!neg.length&&furn>200,detail:got.length+' of '+homes.length+' carved homes walked from the front room into the first carved room; '+furn+' catalog pieces in the carved rooms; from 40 m up: '+neg.length+' (none)'+(got.length<homes.length?'; not reached: '+homes.filter(s=>!got.includes(s)).slice(0,6).map(s=>s.id+' '+s.key).join(', '):'')});
 let n=0,bare=0,kinds={};for(const b of (typeof LW_BLOCKS!=='undefined'?LW_BLOCKS:[]))if(b.kind!=='field'){const xs=b.poly.map(p=>p[0]),zs=b.poly.map(p=>p[1]);
  for(let x=Math.min(...xs)+2;x<Math.max(...xs);x+=9)for(let z=Math.min(...zs)+2;z<Math.max(...zs);z+=9){const pl=lwPlot(x,z);if(pl==null)continue;n++;kinds[pl]=(kinds[pl]||0)+1;if(pl==='dooryard')bare++;}}
 R.push({name:'bench-ground',ok:n>500&&bare<n*.35&&(kinds.garden||0)>n*.15&&(kinds.orchard||0)>n*.15,detail:n+' samples of the blocks\' open ground: '+JSON.stringify(kinds)});
 {const N=typeof LW_OPAL!=='undefined'?LW_OPAL:[],Lk=typeof LW_OPAL_LINKS!=='undefined'?LW_OPAL_LINKS:[],Dw=window._lightwallOpalDraw||{};
  const reg=KTAGS.page?KTAGS.page.query({'class':'prop',kind:'res-node'}).length:0,wet=N.filter(n=>!(terrainH(n.x,n.z)>LW.LAKE+1)).length,unl=Lk.filter(w=>!w.link);
  R.push({name:'opal-lode',ok:N.length>=8&&N.some(n=>n.grade==='high')&&reg===N.length&&Dw.recs===N.length&&!Object.keys(Dw.missing||{}).length&&!wet&&Lk.length>=10&&!unl.length,
   detail:N.length+' opal nodes ('+JSON.stringify(N.reduce((a,n)=>{a[n.grade]=(a[n.grade]||0)+1;return a;},{}))+'), '+reg+' registered, '+(Dw.recs||0)+' drawn; on the water '+wet+'; '+(Lk.length-unl.length)+' of '+Lk.length+' workings take a node'
    +(Lk.length?' (nearest '+Math.round(Math.max(...Lk.filter(w=>w.link).map(w=>w.link.dist)))+' m at most)':'')});}
 {const SC=typeof LW_SCREE!=='undefined'?LW_SCREE:[],off=SC.filter(H=>{const g=H.walk?null:terrainH(H.x,H.z);return g!=null&&Math.abs(g-H.y0)>.6;}),
   unwalked=SC.filter(H=>H.walk&&!KWALK.floorsAt(H.x,H.z).some(f=>f[1].tag==='lightwall:scree'));
  R.push({name:'wall-scree',ok:SC.length>=15&&SC.filter(H=>/end/.test(H.id)).length===2*LW.BANDS&&!off.length&&!unwalked.length,
   detail:SC.length+' heaps ('+SC.filter(H=>/end/.test(H.id)).length+' talus cones at the ends of the bands,'+SC.filter(H=>H.walk).length+' walked on the ledges); off their ground '+off.length+'; ledge heaps not walkable '+unwalked.length});}
 {const FL=typeof LW_FL!=='undefined'?LW_FL:{},K=(FL.stats&&FL.stats.kin)||{},own=FL.stats?(FL.stats.tussock||0)+(FL.stats.ferns||0)+(FL.stats.pads||0):0;
  /* the rooted floor plants (the prism ferns, the tussock: an instance is a plant at its root; the trees' leaf instances spread
     with their crowns, and the lake's pads are on the water) read from their matrices: on the mask */
  let bad=0,n=0;const G=typeof LW_FLORA!=='undefined'?LW_FLORA.BIO:null;for(const m of (G&&G.baked)||[]){if(!m.isInstancedMesh||!/opfern|optuss/.test(m.name))continue;const A=m.instanceMatrix.array,c=m.count,st=Math.max(1,Math.floor(c/300));
   for(let i=0;i<c;i+=st){const x=A[i*16+12],z=A[i*16+14];if(z>LW.SHORE-2)continue;n++;if(lwBioMask(x,z)<=0)bad++;}}
  R.push({name:'opal-flora',ok:!!FL.on&&(K.trees||0)>150&&(FL.stats.orchard||0)>300&&!(K.missing||[]).length&&!K.errors&&own>5000&&!bad,
   detail:'kin trees '+(K.trees||0)+', orchard and yard trees '+((FL.stats&&FL.stats.orchard)||0)+'; '+' '+JSON.stringify(Object.fromEntries(Object.entries(K).filter(([k])=>!/^(trees|errors|missing)$/.test(k))))+'; floor plants '+own+'; trees off the mask '+bad+' of '+n+' read; '+(FL.ms||0)+' ms'});}
 {const LK=typeof LW_LAKE!=='undefined'?LW_LAKE:null,wet=(x,z)=>!!(LK&&LK.wetAt&&LK.wetAt(x,z)),out=[0,LW.SHORE+400],bench=[0,LW.SHORE-40],h=LK?WATER.heightAt(out[0],out[1],0):null;
  R.push({name:'lake-water',ok:!!LK&&!!LK.bed&&wet(...out)&&!wet(...bench)&&h!=null&&Math.abs(h-LW.LAKE)<1,
   detail:LK?('level '+LW.LAKE+'; heightAt out on the lake '+(h==null?'none':h.toFixed(2))+'; wet out on the lake '+wet(...out)+', on the bench '+wet(...bench)+'; shore grid '+(LK.bed&&LK.bed.nx)+' x '+(LK.bed&&LK.bed.nz)):'no core/water lake'});}
 /* the foot street: level with the first band's floor before every front at the wall's foot (the owner, 2026-11-22), from the
    face out to 6 m, and no higher than the floor for 20 m out (the street never rises in front of a door) */
 {const F0=LW_WALL.filter(s=>s.band===0),hi=[],lo=[];for(const s of F0){const B=TG.gz.BOX[s.key];for(const dz of [.5,2,4,6]){const g=terrainH(s.x,s.z+B.out+dz);if(g>s.y+.05)hi.push(s.id);if(g<s.y-.3)lo.push(s.id);}
   for(let dz=6;dz<=20;dz+=2)if(terrainH(s.x,s.z+B.out+dz)>s.y+.05)hi.push(s.id);}
  const uniq=a=>[...new Set(a)];
  R.push({name:'wall-foot',ok:F0.length>50&&!hi.length&&!lo.length,detail:F0.length+' fronts at the foot; the street above the floor before '+uniq(hi).length+(hi.length?' ('+uniq(hi).slice(0,4).join(', ')+')':'')+', below it before '+uniq(lo).length+(lo.length?' ('+uniq(lo).slice(0,4).join(', ')+')':'')});}
 const bsSP=(typeof LW_PLACE!=='undefined'?LW_PLACE:[]).filter(p=>p.kind!=='quay'&&VERN.defs[p.key]),bsFlights=bsSP.filter(p=>p.stair);
 const bsDoorH=p=>{const D=VERN.defs[p.key],n=D.d/2+.15+.7;return p.o.y-terrainH(p.x+Math.sin(p.ry)*n,p.z+Math.cos(p.ry)*n);};
 const bsOwed=bsSP.filter(p=>!p.stair&&bsDoorH(p)>=.3),bsNoPod=bsSP.filter(p=>p.o.y-lwPodiumLo(p,VERN.defs[p.key])>.25&&!p.podium);
 const bsClimb=(p,dy)=>{const S=p.stair,D=VERN.defs[p.key],t=.15/Math.max(S.L,.15),x=S.x0+(S.x1-S.x0)*t,z=S.z0+(S.z1-S.z0)*t,y=S.y0+(S.y1-S.y0)*t+.05+dy;
  const R=Math.max(D.w,D.d)/2+S.L+4,r=KWALK.reach([[x,y,z]],{box:[p.x-R,p.x+R,p.z-R,p.z+R],cell:.25});
  const apron=r.reached.some(F=>F.tag==='lightwall:podium:'+p.id),fw=lwD(D.fw,D.w)/2,fd=lwD(D.fd,D.d)/2,co=Math.cos(p.ry),si=Math.sin(p.ry);
  /* inside: a floor of the built house (not its doorway's entry strip), its middle within the house's footprint */
  const inside=r.reached.some(F=>{if(!/^built:/.test(F.tag||'')||F.kind==='strip')return false;const bb=F.bbox||F.rect;if(!bb)return false;const cx=(bb[0]+bb[1])/2-p.x,cz=(bb[2]+bb[3])/2-p.z,a=cx*co-cz*si,c=cx*si+cz*co;return Math.abs(a)<fw+.5&&Math.abs(c)<fd+.5;});
  return {apron,inside};};
 /* a walker opens an unlocked door (the Xanadu kit locks most of its houses' doors: those stay shut); the doors' blocks off for
    the climb, back on after */
 const bsOpen=(typeof KDOOR!=='undefined'?KDOOR.list:[]).filter(d=>!d.locked&&d.blocks&&d.blocks.length);bsOpen.forEach(d=>KWALK.setBlock(d.blocks,false));
 const bsDoorOf=p=>{const D=VERN.defs[p.key],fw=lwD(D.fw,D.w)/2+1,fd=lwD(D.fd,D.d)/2+1,co=Math.cos(p.ry),si=Math.sin(p.ry);
  return (typeof KDOOR!=='undefined'?KDOOR.list:[]).filter(d=>{const dx=d.at[0]-p.x,dz=d.at[2]-p.z;return Math.abs(dx*co-dz*si)<fw&&Math.abs(dx*si+dz*co)<fd;});};
 const bsW=bsFlights.map(p=>({p,c:bsClimb(p,0)})),bsOnApron=bsW.filter(w=>w.c.apron),bsIx=bsW.filter(w=>w.p.ix&&bsDoorOf(w.p).some(d=>!d.locked)),bsLocked=bsW.filter(w=>w.p.ix&&!bsIx.includes(w)),bsInDoor=bsIx.filter(w=>w.c.inside),bsUp=bsFlights.slice(0,10).filter(p=>bsClimb(p,40).apron);
 bsOpen.forEach(d=>KWALK.setBlock(d.blocks,true));
 const bsPast=bsFlights.filter(p=>p.stair.past).length,bsSteps=bsFlights.reduce((a,p)=>a+p.stair.n,0);
 R.push({name:'bench-stairs',ok:bsFlights.length>100&&!bsOwed.length&&!bsNoPod.length&&bsOnApron.length===bsFlights.length&&bsInDoor.length>=bsIx.length*.9&&!bsUp.length,
  detail:bsFlights.length+' flights ('+bsSteps+' steps; '+bsPast+' run past the sides of their podiums) on '+bsSP.length+' buildings; '+bsOnApron.length+' climbed to the podium; '+bsInDoor.length+' of '+bsIx.length+' furnished houses with an unlocked door entered through it ('+bsLocked.length+' with only locked doors); doors over the street with no flight: '+bsOwed.length+'; podiums owed: '+bsNoPod.length+'; from 40 m up: '+bsUp.length+' (none)'
   +(bsOnApron.length<bsFlights.length?'; not bsClimbed: '+bsW.filter(w=>!w.c.apron).slice(0,5).map(w=>w.p.id).join(', '):'')+(bsInDoor.length<bsIx.length?'; not entered: '+bsIx.filter(w=>!w.c.inside).slice(0,5).map(w=>w.p.id+' '+w.p.key).join(', '):'')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + TOWN_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}

if __name__ == '__main__':
    import argparse, asyncio
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--strict-budget", dest="strict_budget", action="store_true")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append")
    ap.add_argument("--size", default="1280x800")
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--interiors", action="store_true")
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
