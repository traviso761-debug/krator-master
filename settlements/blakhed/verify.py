#!/usr/bin/env python3
"""Headless verification of Blakhed. The page is built on Xanadu's (build.py), so its probe (window._api), invariants and views
are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py, with the survey's checks: tools/checks_optin.json),
with the town's own:

  blakhed-laid     the town laid on core/city with no error and no refusal: the Market (the double meeting hall holding both
                   customs in one, the market hall, the head's house, the halting houses, the granary, smithy and booths), the
                   Icegarth (8 great + 4 small ice houses), the Ropewalk (5 44-m rope-walk ranges + egg stores + tanneries), the
                   Folds, the Fairfell (pens, stalls, judges' stand, hurdles), the cairn hall; every Fellgang record drawn by
                   TG.fg.draw, no key missing
  people           the 5,000 (the town, the Stairhead, the steadings: PLAN.md section 0) within 15 %
  villages         the four steadings, the Stairhead and the twelve hamlets laid on core/hamlet with no error, each 20+ records
  golden-tears     the Golden Tears' mission (the owner, 2026-11-16): its compound in the Xanadu kit's pieces, 100-200 people, the
                   boxes core/city planned with the same as VERN.defs
  toll-post        Dalab's toll post at the Stairhead (the Dalab set's pieces), 2 fg-stair-hoist gin wheels and the stair drawn
  ix-fellgang      step B6 (interiors): town Fellgang buildings furnished from the catalog, operable KDOOR plate doors (shut blocks,
                   open passes, drystone walls stop a walker), threshold steps climbed onto room floors (KWALK), XA_CUT cutaway units
  ix-golden-tears  step B6 (interiors): the Golden Tears' Xanadui buildings hollowed, planned and furnished, podiums & steps walked
                   through unlocked doors onto built room floors (KWALK)
  on-the-model     at the pin the drawn ground within 3 m of the model's bicubic height, and that within 25 m of the cell
  water-on-core    the Blak Riba a core/water flow whose bed falls all its length, the leat falling, the six ice ponds still water
  fell-flora       the Rift Rim kit's veiled rim grown over the plan's mask

    KRATOR_GL=gpu python3 verify.py dist/blakhed.html --assert --views "Overview,The Market"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
if(typeof BK_PLAN!=="undefined"){const Q=window._blakhed||{},P=BK_PLAN||{records:[],pieces:[]},K={},keys=new Set(P.records.map(r=>r.key)),pkeys=new Set(P.pieces.map(p=>p.key));
 for(const r of P.records)K[r.kind]=(K[r.kind]||0)+1;
 const fg=P.records.filter(r=>r.set==='fg').length+(Q.villages||[]).filter(v=>v.drawn).reduce((n,v)=>n+v.records,0);
 const need={hall:1,markethall:2,head:1,icehouse:12,ropewalk:5,cairnhall:1,halting:3,fairstand:1,booth:10},short=Object.keys(need).filter(k=>(K[k]||0)<need[k]);
 const townKeys=['fg-doublehall','fg-markethall','fg-halting-house','fg-booth','fg-great-icehouse','fg-ropewalk','fg-smithy','fg-tannery','fg-granary','fg-fair-stand'];
 const pieceKeys=['fg-cairn','fg-stone-sign','fg-fair-hurdle','fg-wagon','fg-halt','fg-lantern-post','fg-ice-tools'];
 const dh=(Q.halls||[])[0];
 R.push({name:'blakhed-laid',ok:!Q.err&&P.records.length>=900&&!short.length&&townKeys.every(k=>keys.has(k))&&pieceKeys.every(k=>pkeys.has(k))&&!(Q.refused||[]).length&&(K.folds||0)>=12&&(K.fairpens||0)>=10&&Q.drawn===fg&&!Object.keys(Q.missing||{}).length&&!(Q.errors||[]).length&&!!(dh&&dh.variant==='double'&&dh.pegs===72&&dh.slats===48),
  detail:Q.err?('the site did not lay: '+Q.err):(P.records.length+' records ('+JSON.stringify(K)+'), '+Q.drawn+' / '+fg+' Fellgang drawn in '+Q.draws+' draws, '+Q.tris+' triangles, '+Q.pieces+' pieces'+(short.length?'; SHORT '+short.join(', '):'')+((Q.refused||[]).length?'; REFUSED '+Q.refused.join('; '):'')+(Object.keys(Q.missing||{}).length?'; MISSING '+JSON.stringify(Q.missing):'')+((Q.errors||[]).length?'; ERRORS '+Q.errors.join('; '):'')+'; double hall '+JSON.stringify(dh))});
 const pp=Q.people||{};R.push({name:'people',ok:Math.abs((pp.five||0)-5000)<=.15*5000,
  detail:'the 5,000: the town '+pp.town+', the Stairhead '+pp.stairhead+', the steadings '+pp.steadings+' = '+pp.five+'; beside them the hamlets '+pp.hamlets+', the Golden Tears '+pp.tears+', Dalab\'s toll post '+pp.toll+', the Travellers in the Winterings '+pp.travellers});
 const V=Q.villages||[];R.push({name:'villages',ok:V.length===17&&V.every(v=>!v.error&&v.records>=20)&&V.filter(v=>v.kind==='steading').length===4&&V.filter(v=>v.kind==='hamlet').length===12,
  detail:V.map(v=>v.id.replace(/^bk\.(h|stead)?\.?/,'')+' '+v.records+(v.error?' ('+v.error+')':'')).join(', ')});
 const tk=Q.tears||[],xd=Q.xdims||[];R.push({name:'golden-tears',ok:tk.length>=10&&['xa_serai','xa_rich_c','xa_temple','xa_barracks'].every(k=>tk.includes(k))&&pp.tears>=100&&pp.tears<=200&&xd.length>0&&xd.every(d=>d[1])&&(Q.page||{}).wall>20,
  detail:tk.length+' pieces ('+tk.join(', ')+'), '+pp.tears+' people, the plots against VERN.defs '+JSON.stringify(xd)+', the wall '+(Q.page||{}).wall+' bays'});
 R.push({name:'toll-post',ok:(Q.toll||[]).length===4&&Q.hoists===2&&(Q.page||{}).steps>200,detail:'Dalab\'s pieces '+(Q.toll||[]).join(', ')+'; '+Q.hoists+' fg-stair-hoists; '+JSON.stringify(Q.page)});
 /* step B6 (interiors): Fellgang catalog furniture, KDOOR plate doors, KWALK walls & floors, threshold steps, and XA_CUT cutaway */
 {const IX=window._bkInteriors||{},walkOk=(p,h)=>!KWALK.blocked(p[0],p[1]+.08,p[2],.26,h==null?1.45:h);
  const wd=(typeof KDOOR!=='undefined'?KDOOR.list:[]).find(d=>d.key==='fg-halting-house'&&!d.locked&&d.open===0)||(typeof KDOOR!=='undefined'?KDOOR.list:[]).find(d=>/^fg-/.test(d.key||'')&&!d.locked&&d.open===0);
  let doorPass=false,shutBlk=false,wallBlk=false,climbOk=false,climbNeg=false;
  if(wd){const ux=Math.cos(wd.yaw),uz=-Math.sin(wd.yaw),wall=[wd.at[0]+ux*2,wd.at[1],wd.at[2]+uz*2];
   shutBlk=!walkOk(wd.at);KDOOR.open(wd.id,{by:'verify'});for(let k=0;k<40;k++)KDOOR.step(.1);
   doorPass=walkOk(wd.at);wallBlk=!walkOk(wall);
   KDOOR.close(wd.id,{by:'verify'});for(let k=0;k<40;k++)KDOOR.step(.1);}
  const stRec=(typeof BK_DRAW!=='undefined'&&BK_DRAW.stairs||[]).find(r=>r.key==='fg-house'||r.key==='fg-halting-house')||(typeof BK_DRAW!=='undefined'&&BK_DRAW.stairs||[])[0];
  if(stRec){const S=stRec.stair,openDs=KDOOR.list.filter(d=>!d.locked&&Math.hypot(d.at[0]-stRec.x,d.at[2]-stRec.z)<Math.max(stRec.decl.w,stRec.decl.d));
   openDs.forEach(d=>KWALK.setBlock(d.blocks,false));
   const Reach=dy=>KWALK.reach([[S.x0,S.y0+.06+dy,S.z0]],{ground:dy?null:terrainH,box:[stRec.x-18,stRec.x+18,stRec.z-18,stRec.z+18],cell:.22}).reached.some(F=>F.tag==='step:'+stRec.key);
   climbOk=Reach(0);climbNeg=Reach(40);
   openDs.forEach(d=>KWALK.setBlock(d.blocks,true));}
  R.push({name:'ix-fellgang',ok:!!IX.on&&IX.fgFurn>2500&&IX.fgDoors>800&&IX.fgStairs>40&&IX.cutUnits>800&&shutBlk&&doorPass&&wallBlk&&climbOk&&!climbNeg,
   detail:IX.fgFurn+' catalog pieces in Fellgang buildings, '+IX.fgDoors+' operable plate leaves, '+IX.fgStairs+' threshold stair flights, '+IX.cutUnits+' cutaway units; door shut blocks '+shutBlk+', open passes '+doorPass+', wall stops '+wallBlk+', slope stair climbed into room '+climbOk+' (from 40 m up: '+climbNeg+')'});}
 /* step B6 (interiors): the Golden Tears' Xanadui compound hollowed, furnished and walked */
 {const IX=window._bkInteriors||{},XA=IX.xa||{},list=(typeof BK_TEARS_LIST!=='undefined'?BK_TEARS_LIST:[]).filter(p=>p.ix);
  const openDs=(typeof KDOOR!=='undefined'?KDOOR.list:[]).filter(d=>!d.locked&&d.blocks&&d.blocks.length);openDs.forEach(d=>KWALK.setBlock(d.blocks,false));
  const enter=(bIdx,B,dy)=>{const D=VERN.defs[B.key]||{},rr=Math.max(D.w||30,D.d||30)/2+8,pre='built:xa.'+bIdx+'.',st=[];
   for(const d of KDOOR.list){if(d.locked||Math.abs(d.at[0]-B.x)>rr||Math.abs(d.at[2]-B.z)>rr)continue;
    const ox=d.at[0]+Math.sin(d.yaw)*1.5,oz=d.at[2]+Math.cos(d.yaw)*1.5,fl=KWALK.floorsAt(ox,oz);
    const fy=fl.length?Math.max(...fl.map(q=>q[0])):terrainH(ox,oz);st.push([ox,fy+.05+dy,oz]);}
   if(!st.length)return false;
   const r=KWALK.reach(st,{ground:dy?null:terrainH,box:[B.x-rr,B.x+rr,B.z-rr,B.z+rr],cell:.28});
   return r.reached.some(F=>String(F.tag||'').indexOf(pre)===0&&F.kind!=='strip');};
  const xb=typeof XAF!=='undefined'?XAF.buildings:[],okIn=xb.filter((B,i)=>enter(i,B,0)),negIn=xb.slice(0,4).filter((B,i)=>enter(i,B,40));
  const podStairs=(typeof BK_XA_STAIRS!=='undefined'?BK_XA_STAIRS:[]),podOk=podStairs.filter(S=>KWALK.reach([[S.x0,S.y0+.06,S.z0]],{ground:terrainH,box:[S.x1-16,S.x1+16,S.z1-16,S.z1+16],cell:.28}).reached.some(F=>F.tag==='blakhed:podium:'+S.id));
  openDs.forEach(d=>KWALK.setBlock(d.blocks,true));
  R.push({name:'ix-golden-tears',ok:!!IX.on&&(XA.hollow||0)>=8&&(XA.buildings||0)>=9&&(XA.rooms||0)>=25&&(XA.pieces||0)>=150&&xb.length>=9&&okIn.length===xb.length&&podOk.length===podStairs.length&&!negIn.length,
   detail:(XA.buildings||0)+' Golden Tears buildings furnished ('+(XA.hollow||0)+' hollow bodies, '+(XA.rooms||0)+' rooms, '+(XA.pieces||0)+' catalog pieces, '+(XA.planDoors||0)+' planned doors), '+okIn.length+' / '+xb.length+' entered onto built floors, '+podOk.length+' / '+podStairs.length+' podium flights climbed (from 40 m up: '+negIn.length+')'});}
 const pin=Q.pin||{};R.push({name:'on-the-model',ok:Math.abs((pin.drawn||0)-(pin.model||0))<3&&Math.abs((pin.model||0)-(pin.cell||0))<25,
  detail:'at the pin the model gives '+pin.model+' m, the page draws '+pin.drawn+' m (the cell: '+pin.cell+' m)'});
 const W=window._bkWater||{},RP=BK_GROUND.river.pts,L=BK_GROUND.leat;let falls=RP.length>100,lf=L.length>4;
 for(let i=1;i<RP.length;i++)if(!(RP[i].bed<RP[i-1].bed))falls=false;for(let i=1;i<L.length;i++)if(!(L[i][2]<L[i-1][2]))lf=false;
 R.push({name:'water-on-core',ok:W.flows===2&&W.stills===6&&falls&&lf&&typeof WATER!=='undefined'&&!!WATER.at,
  detail:(W.flows||0)+' flows (the Blak Riba '+W.riverPts+' points, its bed '+(falls?'falling all its length':'NOT falling all its length')+'; the leat '+(lf?'falling':'NOT falling')+'), '+(W.stills||0)+' ice ponds'});
 const fl=window._bkFlora||{};R.push({name:'fell-flora',ok:!!fl.ok,detail:'the Rift Rim kit (rim w) '+(fl.ok?'grown':'NOT grown')+' in '+fl.ms+' ms, '+(fl.tiles||0)+' mask tiles; '+JSON.stringify(fl.build||{}).slice(0,200)});}
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
