#!/usr/bin/env python3
"""Headless verification of Grēṭ-Āil, the Azure Dream's head monastery. The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
page's own:

  azure-laid        every place of the site placed (89zad: over 120), with the Hall of Dreaming, the great monastery in the blue
                    dress, the mole, the three jetties and the boathouse among them
  dream-cots        the Hall's 256 cots, 32 in each of the eight turnings (PLAN.md section 5; the owner: "keep it")
  cove-water        the cove holds water (the ground under the lake 3 m or more, 60-160 m out from the head on its centre line)
                    and its two headlands stand out of it (20 m or more at their records' centres): the records of
                    tools/scale-model/edit_517_azure.py on the 1:1 ground
  terraces-climb    the precinct's four terraces climb the slope in order (the gate court, the monastery, the Lotus Garden, the
                    Hall), all over the lake
  stair-climbs      the Stair of Lowered Eyes zigzags up the scarp in six runs, 20-70 m of rise, its foot on the ground
  hall-walk-in      the Hall of Dreaming walked into (core/walk, 90ag): its two doors unlocked and opened, a walker from the
                    terrace before its steps reaches the kora and both sides of the hall, and one from the shrine the kora
  lotus-ponds       the Lotus Garden's four ponds, their water on core/water (WATER.still)
  lamps             the lamps placed: the Hall's 32 azure lamps and the Damsel's gold one, the wharf's lanterns

The summit's page (dist/azure-dream-summit.html, window.CITY_BUILD 'azure-dream-summit') takes these instead:

  summit-laid       the summit's places: the Summit Chorten, the great wheel, the Station Watch, the pilgrims' shelter, the road's
                    chorten and the High Kora's wheel houses
  high-kora         sixteen wheel houses 240-256 m out, none crowding another, the Dream Road passing between two of them
  summit-crest      the Summit Chorten on the crest: over +250 m, and no lower than the kora's ground less 8 m
  signal-lamp       the Station Watch's one signal lamp, the highest lamp on the page, where AD_SIGNAL (src/89zaa) says it is, and
                    it sees the relay lamp on the isle's page over the 1:1 ground (PLAN.md Q15)

The isle's page also takes:

  signal-relay      the relay lamp by the Dream Road's first chorten, where AD_SIGNAL says it is; it sees the Station Watch's lamp
                    on the summit and the Hall of Dreaming's lantern roof over the 1:1 ground

    KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge"
    KRATOR_GL=gpu python3 verify.py dist/azure-dream-summit.html --assert --views "Overview,On the High Kora"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

SUMMIT_JS = r"""
if(window.CITY_BUILD==='azure-dream-summit'){const Z=window._azure||{},K=Z.byKind||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],has=id=>P.some(p=>p.id===id);
 R.push({name:'summit-laid',ok:Z.placed>=21&&['summit-chorten','great-wheel','station-watch','pilgrims-shelter','road-chorten'].every(has),
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces; the crest +'+Z.crest+' m'});
 const H=P.filter(p=>p.key==='qb_wheel_house'),rr=H.map(p=>Math.hypot(p.x,p.z)),Rd=AD_ROAD;
 let clash=0;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(Math.hypot(H[i].x-H[j].x,H[i].z-H[j].z)<14)clash++;
 const roadGap=Math.min(...H.map(p=>{const s=p.x*Rd.dx+p.z*Rd.dz;return s<0?1e9:Math.abs(p.x*Rd.dz-p.z*Rd.dx);}));
 R.push({name:'high-kora',ok:H.length===16&&rr.every(r=>r>240&&r<256)&&clash===0&&roadGap>9,
  detail:H.length+' wheel houses '+Math.min(...rr).toFixed(0)+'-'+Math.max(...rr).toFixed(0)+' m out, '+clash+' too close, the Dream Road '+roadGap.toFixed(1)+' m clear of the nearest'});
 const ring=[];for(let a=0;a<16;a++){const t=a/16*2*Math.PI;ring.push(terrainH(260*Math.sin(t),260*Math.cos(t)));}
 const C=P.find(p=>p.id==='summit-chorten'),top=Math.max(...ring);
 R.push({name:'summit-crest',ok:!!C&&C.o.y>250&&C.o.y>=top-8,detail:'the Summit Chorten at +'+(C?C.o.y:0)+' m, the kora\'s ground '+Math.min(...ring).toFixed(1)+'-'+top.toFixed(1)+' m'});
 const LA=typeof AD_LAMPS!=='undefined'?AD_LAMPS:[],S=LA.filter(l=>l[3]==='signal'),Wt=AD_SIGNAL.watch,w=adPx(Wt);
 /* the signal's sight line to the relay lamp by the Dream Road's first chorten (on the isle's page), over the 1:1 ground */
 const s=S[0],off=s?Math.hypot(s[0]-w[0],s[2]-w[1],s[1]-Wt[2]):99,rel=[AD_SIGNAL.relay[0],AD_SIGNAL.relay[1],adRelayY()],sight=adSight(Wt,rel);
 R.push({name:'signal-lamp',ok:S.length===1&&s[1]>=Math.max(...LA.map(l=>l[1]))-.01&&off<1&&sight>0,
  detail:S.length+' signal lamp(s) at +'+(s?s[1].toFixed(1):'-')+' m, the highest of '+LA.length+', '+off.toFixed(2)+' m off AD_SIGNAL.watch; it sees the relay lamp (+'+rel[2].toFixed(1)+' m, '+(AD_SIGNAL.len/1000).toFixed(1)+' km road from the gate) with '+sight.toFixed(1)+' m to spare'});}else"""
VILLAGE_JS = r"""
if(/^azure-dream-village-/.test(window.CITY_BUILD||'')){const S=window._adSite||{},T=S.village||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],
  VB=P.filter(p=>/^village:/.test(p.kind)),C=S.census||{},keys=new Set(VB.map(p=>p.key));
 R.push({name:'village-laid',ok:!S.error&&VB.length===S.records&&C.pop>=T.pop*.85&&C.pop<=T.pop&&['qb_shrine','xa_boatshed','qb_ad_smokehouse','qb_ad_racks','xa_warehouse'].every(k=>keys.has(k)),
  detail:(T.name||'?')+': '+(S.error?'ERROR '+S.error+'; ':'')+VB.length+' buildings of '+S.records+' records, '+C.pop+' people of '+T.pop+' ('+C.households+' households, '+C.workers+' workers); '+[...keys].sort().join(', ')});
 const wet=VB.filter(p=>!(p.o.y>=1)||adBase(p.x,p.z)<.5);
 R.push({name:'village-dry',ok:VB.length>0&&wet.length===0,detail:wet.length+' of '+VB.length+' buildings under 1 m over the lake'+(wet.length?': '+wet.slice(0,4).map(p=>p.id+' +'+p.o.y).join(', '):'')});
 const rect=p=>KHAMLET.rect(p.x,p.z,Math.cos(p.ry),-Math.sin(p.ry),p.w,p.d);let hits=[];
 for(let i=0;i<VB.length;i++)for(let j=i+1;j<VB.length;j++)if(KHAMLET.overlap(rect(VB[i]),rect(VB[j]),0))hits.push(VB[i].id+' / '+VB[j].id);
 R.push({name:'village-clear',ok:hits.length===0,detail:hits.length+' footprints overlapping'+(hits.length?': '+hits.slice(0,4).join('; '):'')});
 const J=AD_V.jetty,sh=AD_V.shore,head=J?adBase(J.x+sh.dx*J.len/2,J.z+sh.dz*J.len/2):99,root=sh?adBase(sh.x,sh.z):-99,dug=P.filter(p=>p.key==='qb_ad_dugout').length;
 if(T.herds){const Hd=P.filter(p=>p.kind==='herds'),hh=AD_V.herds;
  R.push({name:'herds',ok:!!hh&&Hd.filter(p=>p.key==='xa_corral').length===1&&Hd.filter(p=>p.key==='xa_pens').length===2&&Hd.every(p=>p.o.y>=1),
   detail:hh?'the Order\'s meadow '+Math.hypot(hh.x-AD_V.v.site.x,hh.z-AD_V.v.site.z).toFixed(0)+' m inland of the green: '+Hd.map(p=>p.id+' +'+p.o.y).join(', '):'no dry gentle meadow found inland'});}
 R.push({name:'landing',ok:!!J&&head<-1&&root>-.6&&dug>=6,detail:'the jetty\'s head over '+(-head).toFixed(1)+' m of water, its root on ground at '+root.toFixed(1)+' m, '+dug+' dugouts'});}
else"""
PAGE_JS = r"""
{const Z=window._azure||{},K=Z.byKind||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],has=id=>P.some(p=>p.id===id);
 R.push({name:'azure-laid',ok:Z.placed>=120&&['hall-of-dreaming','great-monastery','mole','boathouse','jetty:0','jetty:1','jetty:2'].every(has),
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces'});
 const T=Z.cotsByTurning||{},tk=Object.keys(T);
 R.push({name:'dream-cots',ok:Z.cots===256&&tk.length===8&&tk.every(k=>T[k]===32),detail:Z.cots+' cots: '+JSON.stringify(T)});
 const wet=[];for(let d=60;d<=160;d+=20)wet.push(+terrainH(0,d).toFixed(1));
 const arms=AD_ARMS.map(L=>+(terrainH(L.x-AD.WX,L.z-AD.WZ)).toFixed(1));
 R.push({name:'cove-water',ok:wet.every(h=>h<-3)&&arms.every(h=>h>20),detail:'the ground on the centre line 60-160 m out '+wet.join(', ')+' m; the headlands '+arms.join(', ')+' m over the lake'});
 const L=Z.terraces||{},o=['court','monastery','lotus','hall'].map(k=>L[k]);
 R.push({name:'terraces-climb',ok:o.every((y,i)=>y>0&&(i===0||y>o[i-1])),detail:'court '+o[0]+', monastery '+o[1]+', Lotus Garden '+o[2]+', Hall '+o[3]+' m over the lake'});
 const S=Z.stair||{},runs=P.filter(p=>p.key==='qb_terrace_stair'&&/^stair:/.test(p.id)).length,foot=typeof AD_STAIR!=='undefined'?Math.abs(AD_STAIR.fy-terrainH(0,-AD_STAIR.footU)):99;
 R.push({name:'stair-climbs',ok:runs===6&&S.rise>=20&&S.rise<=70&&foot<4,detail:runs+' runs, '+S.rise+' m of rise, its foot '+foot.toFixed(1)+' m off the ground'});
 const LA=typeof AD_LAMPS!=='undefined'?AD_LAMPS:[],n=k=>LA.filter(l=>l[3]===k).length;
 const AW=window._adWalk,WI=AW&&AW.walkIn?AW.walkIn():null;
 R.push({name:'hall-walk-in',ok:!!(WI&&WI.ok),detail:!WI?'window._adWalk missing (targets/isle/90ag-ad-walk.js)':WI.doors+' doors unlocked, '+AW.floors+' floors, '+AW.blocks+' blocks; shut, the walker '+(WI.shutIn.length?'GOT IN to '+WI.shutIn.join(', '):'stayed out')+'; '+WI.routes.map(r=>'from '+r.from+(r.miss.length?' MISSED '+r.miss.join(', '):' reached the kora and both sides')).join('; ')});
 const PW=typeof AD_POND_WATER!=='undefined'?AD_POND_WATER:[];
 R.push({name:'lotus-ponds',ok:PW.length===4&&PW.every(S=>S.level>0),detail:PW.length+' still ponds on core/water at '+PW.map(S=>S.level.toFixed(2)).join(', ')+' m'});
 {const S=LA.filter(l=>l[3]==='signal'),s=S[0],r=adPx(AD_SIGNAL.relay),y=adRelayY(),off=s?Math.hypot(s[0]-r[0],s[2]-r[1],s[1]-y):99,me=[AD_SIGNAL.relay[0],AD_SIGNAL.relay[1],y],toW=adSight(me,AD_SIGNAL.watch),toH=adSight(me,AD_SIGNAL.hall),hy=AD_TERR.hall.y+13;
  R.push({name:'signal-relay',ok:S.length===1&&off<1&&Math.abs(hy-AD_SIGNAL.hall[2])<1&&toW>0&&toH>0,detail:S.length+' relay lamp(s) at +'+(s?s[1].toFixed(1):'-')+' m, '+off.toFixed(2)+' m off AD_SIGNAL.relay; it sees the Station Watch\'s lamp with '+toW.toFixed(1)+' m to spare and the Hall\'s lantern roof (+'+hy.toFixed(1)+') with '+toH.toFixed(1)});}
 {const N=window._adNightly,ok=[],bad=[],t=(h,f,what)=>{const s=N.at(h);(f(s)?ok:bad).push(what+' at '+h+' h');};
  if(N){t(12,s=>!s.doorShut&&s.brake===0&&!s.censers&&s.watch===0&&!s.azure,'the day');t(19.25,s=>s.brake>0&&s.brake<1&&/Lulling/.test(s.phase)&&s.azure&&s.censers,'the Lulling');
   t(21,s=>s.doorShut&&s.brake===1&&s.censers&&s.watch===1,'the first watch');t(.5,s=>s.doorShut&&!s.censers&&s.watch===2,'the second watch');
   t(3,s=>s.doorShut&&s.watch===3&&s.azure,'the third watch');t(6.5,s=>!s.doorShut&&s.brake===0&&s.watch===0&&!s.azure,'after dawn');
   /* applied: at 21 h the Hall's doors shut (core/door) and the keeper's lamp is on the walk; back at the day's hour they open */
   const h0=AD_SKY.hour,L=(window._adWalk||{}).leaves||[],shut=()=>L.length&&L.every(D=>Math.abs(KDOOR.angle(D))<.05);
   AD_SKY.hour=21;N.tick(30);for(let i=0;i<40;i++)KDOOR.step(.1);const sh=shut(),lp=N.lamp?Math.hypot(N.lamp[0]-AD_PLACE.find(p=>p.id==='hall-of-dreaming').x,N.lamp[2]-AD_PLACE.find(p=>p.id==='hall-of-dreaming').z):99;
   AD_SKY.hour=h0;N.tick(0);for(let i=0;i<40;i++)KDOOR.step(.1);const op=!shut();(sh?ok:bad).push('the doors shut at 21 h');(op?ok:bad).push('open again by day');(lp<30?ok:bad).push('the keeper\'s lamp on the walk ('+lp.toFixed(1)+' m from the centre)');
   /* the Station (core/atmos's sky model): the first Station's night in 60 days, its shutters open at its pass and shut at noon;
      the first ordinary night's best pass leaves them shut */
   {const Wh=window._adWheels,b0=N.at(12).brake,bL=N.at(19.25).brake,b1=N.at(21).brake;
    if(!Wh||!Wh.n)bad.push('no turning wheels (window._adWheels)');
    else (Wh.n===97&&Wh.turningAt(b0)===97&&Wh.turningAt(b1)===0&&Wh.turningAt(bL)>0&&Wh.turningAt(bL)<97?ok:bad).push(Wh.n+' wheels: '+Wh.turningAt(b0)+' turning at noon, '+Wh.turningAt(bL)+' halfway through the Lulling, '+Wh.turningAt(b1)+' at 21 h');}
   let fd=-1,nd=-1;for(let d=0;d<60&&(fd<0||nd<0);d++){if(N.festival(d)){if(fd<0)fd=d;}else if(nd<0&&N.night(d).length)nd=d;}
   if(!N.sky)bad.push('no sky model on the page (core/atmos/sky)');else if(fd<0)bad.push('no Station\'s night in 60 days');else{
    const F=N.festival(fd),ph=F.at%24,s1=N.at(ph,ph<12?fd+1:fd),s0=N.at(12,fd);(s1.shutters===1&&s1.stationNight?ok:bad).push('the shutters open at the Station\'s pass on night '+fd+' ('+ph.toFixed(2)+' h, '+F.peak.toFixed(1)+' degrees)');
    (s0.shutters===0?ok:bad).push('shut at noon');
    if(nd>=0){const P=N.night(nd).reduce((b,p)=>!b||p.peak>b.peak?p:b,null),qh=P.at%24,s2=N.at(qh,qh<12?nd+1:nd);(s2.shutters===0&&!s2.stationNight?ok:bad).push('shut at night '+nd+'\'s best pass ('+P.peak.toFixed(1)+' degrees)');}}}
  R.push({name:'night-schedule',ok:!!N&&bad.length===0,detail:!N?'window._adNightly missing (targets/isle/90ah)':(bad.length?'WRONG: '+bad.join('; ')+'; ':'')+ok.length+' right: '+ok.join(', ')+(N&&N.station?'; a Station\'s night':'')});}
 {const O=P.filter(p=>p.key==='qb_ad_orchard'),Hv=P.filter(p=>p.key==='qb_ad_hives'),by=c=>O.filter(p=>p.o.crop===c),
   step=['west','east'].every(s=>{const a=O.find(p=>p.id==='orchard:'+s+':apricot'),b=O.find(p=>p.id==='orchard:'+s+':persimmon');return a&&b&&b.o.y>a.o.y;}),
   named=typeof CROPS!=='undefined'&&CROPS.BY_ID&&CROPS.BY_ID.apricot&&CROPS.BY_ID.persimmon;
  R.push({name:'orchards',ok:O.length===4&&by('apricot').length===2&&by('persimmon').length===2&&step&&Hv.length===6&&!!named,
   detail:O.length+' orchards ('+O.map(p=>p.id+' +'+p.o.y).join(', ')+'), '+Hv.length+' bee walls, the upper terraces '+(step?'above':'NOT above')+' the lower'+(named?', named from kits/crops ('+CROPS.BY_ID.apricot.name+', '+CROPS.BY_ID.persimmon.name+')':', kits/crops MISSING')});}
 {const J0=window._adIx,J=J0&&J0.buildTypes?J0.buildTypes(8):J0,share=J?J.lots/Math.max(1,J.lots+J.noShell+J.noProgram):0;
  R.push({name:'interiors',ok:!!(J&&!J0.error&&J.lots>=20&&share>=.85&&J.built>=6&&!J.fails.length&&J.tex.meshes&&J.tex.mapped===J.tex.meshes),
   detail:!J?'window._adIx missing (targets/isle/90ai-ad-interiors.js)':J0.error?J0.error:J.lots+' buildings with an interior ('+(share*100).toFixed(0)+' %; '+J.noShell+' without a shell, '+J.noProgram+' without a programme, '+J.skipped+' with their own, '+J.noStorey+' with no storey), '+J.ranges+' monks\' ranges, '+J.types+' types; the 8 commonest built in '+J.ms+' ms ('+JSON.stringify(J.byProgram)+'), textured '+J.tex.mapped+'/'+J.tex.meshes+(J.fails.length?'; FAILS '+J.fails.join(' | '):'')});
  const WI=J0&&J0.walkIn?J0.walkIn(6):null,wb=WI&&WI.length?WI.filter(w=>!w.ok):[];
  R.push({name:'walk-in-rooms',ok:!!(WI&&WI.length>=4&&!wb.length),detail:!WI?'window._adIx.walkIn missing':WI.error?WI.error:WI.length+' buildings walked into ('+WI.map(w=>w.key+' '+w.floors+' floors').join(', ')+')'+
   (wb.length?'; FAIL '+wb.map(w=>w.key+(w.shut?'':' door not blocking shut')+(w.open?'':' doorway blocked open')+(w.unreached.length?' unreached '+w.unreached.join(','):'')).join(' | '):'')});}
 {const G0=window._adGreat,G=G0&&G0.buildAll?G0.buildAll():G0,WG=G0&&G0.walkIn?G0.walkIn():null;
  R.push({name:'great-rooms',ok:!!(G&&G.built===2&&G.pieces>=10&&!G.fails.length&&G.tex.meshes&&G.tex.mapped===G.tex.meshes&&WG&&WG.ok&&WG.gate),
   detail:!G?'window._adGreat missing (targets/isle/90aj-ad-great-rooms.js)':G.built+' rooms built ('+G.rooms.map(r=>r.name).join(', ')+'), '+G.pieces+' pieces, textured '+G.tex.mapped+'/'+G.tex.meshes+', '+G.bulbs+' bulbs'+
    (G.fails.length?'; FAILS '+G.fails.join(' | '):'')+(WG?'; from the terrace before the gate ('+(WG.gate?'its door opened':'NO GATE DOOR')+') '+(WG.ok?'the court and both rooms reached':'MISSED '+WG.miss.join(', ')):'')});}
 R.push({name:'lamps',ok:n('azure')===32&&n('gold')===1&&n('oil')>=4,detail:LA.length+' lamps: azure '+n('azure')+', gold '+n('gold')+', oil '+n('oil')+', clerestory panes '+n('pane')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + SUMMIT_JS + VILLAGE_JS + PAGE_JS
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
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
