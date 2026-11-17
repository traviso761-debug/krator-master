// ================================================================= HOST — the cove's words, views and checks (99-host-take.js reads STATION_TAKE)
// The showcase's views are left out (ownViews: no Old Kettle, Prism or basin here); of its checks the cove keeps those that hold on any field and the
// Stair's (the Lime Stair is the showcase's machinery). Its own, each with a negative that must fail: the crescent, the outflows into the sea, the beds
// bound, the sulphur on the dike, the plumes over the boiling bay.
// THE SKIFF'S VIEW (the spec's framing): 35 m off the horns' line at +14 m over the sea, looking north-north-west into the cove.
const COVE_CAM=(function(){const c=[CC[0]+UO[0]*225,CC[1]+UO[1]*225],t=covePt(-22,RS-10);return[c[0],SEA+14,c[1],t[0],12,t[1]];})();
// the crescent's two samples: the ring just inside the crest round the rim's sector (the Lime Stair's notch left out: the travertine fills it), and across
// the breach
const ringSamples=(lo,hi,d)=>{const o=[];for(let b=lo;b<=hi;b+=4){const p=covePt(b,d);if(stairK(p[0],p[1])>.05)continue;o.push({b,x:p[0],z:p[1],h:terrainH(p[0],p[1])});}return o;};
const COVE_HCHK={
 crescent(rim,gap){const lowRim=rim.filter(s=>s.h<10),dryGap=gap.filter(s=>s.h>-.5);
  return{ok:rim.length>=30&&gap.length>=12&&lowRim.length<=rim.length*.08&&!dryGap.length,detail:'rim '+(rim.length-lowRim.length)+'/'+rim.length+' samples over 10 m, breach '+(gap.length-dryGap.length)+'/'+gap.length+' under the sea'};},
 intoSea(R){const feet=R.filter(c=>{const p=c.P[c.P.length-1];return landH(p[0],p[1])<.6;}),stair=R.filter(c=>{const p=c.P[c.P.length-1];return terraceMask(p[0],p[1])>.5;});
  return{ok:feet.length>=8&&stair.length>=2,detail:feet.length+' outflows reach the Ring Sea, '+stair.length+' feed the Lime Stair (of '+R.length+' channels)'};},
 strata(cliff,dike){const badC=cliff.filter(p=>STRATA.at(p[0],p[1],p[2]).recipe!=='carbonate-shelf'),badD=dike.filter(p=>p.rock.at(p[0],p[1],p[2]).recipe!=='tibasalt');
  return{ok:cliff.length>=20&&dike.length>=6&&!badC.length&&!badD.length,detail:badC.length+badD.length?(badC.length+' bluff points and '+badD.length+' dike points off their recipe'):
   cliff.length+' bluff points in the carbonate shelf ('+[...new Set(cliff.map(p=>STRATA.at(p[0],p[1],p[2]).kind))].join(', ')+'), '+dike.length+' dike points in the tibasalt'};},
 sulphur(C){const off=C.filter(c=>dikeAt(c.x,c.z).d>DIKE.w*.6||c.y<.5);
  return{ok:C.length>=8&&!off.length,detail:off.length?off.length+' chimneys off the rib':C.length+' sulphur chimneys on the dike\'s crest'};},
 plumes(V){const dry=V.filter(v=>!(SEA-terrainH(v.x,v.z)>1)),bare=V.filter(v=>!v.plume);
  return{ok:V.length>=3&&!dry.length&&!bare.length,detail:dry.length?dry.length+' boils on dry ground':bare.length?bare.length+' boils with no plume':V.length+' boils in the bay, each with its plume ('+V.map(v=>v.plume.height.toFixed(0)+' m').join(', ')+')'};}};
const coveCliffPts=()=>{const o=[];for(let b=-140;b<=95;b+=5)for(const d of[RS+45,RS+84,RC-6]){const p=covePt(b,d);if(stairK(p[0],p[1])>.05||dikeAt(p[0],p[1]).d<DIKE.w*2)continue;const y=terrainH(p[0],p[1]);if(y>1)o.push([p[0],y-.3,p[1]]);}return o;};
const coveDikePts=rock=>{const o=[];for(let t=.05;t<=.8;t+=.1){const x=DIKE.a[0]+(DIKE.b[0]-DIKE.a[0])*t,z=DIKE.a[1]+(DIKE.b[1]-DIKE.a[1])*t,p=[x,terrainH(x,z)-.3,z];p.rock=rock;o.push(p);}return o;};
const STATION_TAKE={ownViews:true,build:'geyser-cove',title:'Krator biome — the Boiling Bay phreatic cove (the Steampits; Gemini showcase station 4)',
 hint:"The Boiling Bay phreatic cove, on the Steampits' Ring Sea shore (scale model 5.1, px 884,716; -1,500 m, 1.93 atm, +33 °C, 1,600 mm; water boils at ~119 °C). A skiff off the mouth of a crescent explosion crater breached by the sea: the bay boils over its vents under standing steam plumes and turquoise-white silica water drifts out on the ebb; littoral cone geysers, spouters and boiling springs on the opaline geyserite apron at the tide line, their run-off straight into the surf; a raised bench over cream carbonate-shelf bluffs with wave-cut visors, the marl bleached to kaolinite mud pots by the black tibasalt dike, its rib crusted with native sulphur chimneys; the Lime Stair's travertine terraces through a notch in the rim into the sea; pandans and kanuka on the rim's scald line, the hyperjungle behind (ideal type). N for night, R erupts the geyser nearest the view (G flies to the pin)",
 types:{'cove/station':'pass'},
 baseChecks:['nothing lives on the scalding ground','every geyser erupts on its own cycle','the springs brim at their rims','the Stair steps down to the sea','every species and plant tagged','preset cameras clear of the ground','the hyperjungle walls the basin in'],
 baseNegatives:['a fern in the Great Prism','a geyser with no column','a spring 2 m over its rim','a Stair that climbs','a species with no origin','a camera under the ground','a jungle tree on the floor'],
 exportBox:[-245,-420,55,-120],exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
 views:()=>{const F=LAYOUT.geysers.find(g=>g.key==='fountain'),K=LAYOUT.geysers.find(g=>g.key==='kettlehorn'),A=LAYOUT.acid[0],dm=[(DIKE.a[0]*.4+DIKE.b[0]*.6),(DIKE.a[1]*.4+DIKE.b[1]*.6)],
   lk=LAYOUT.springs.find(s=>s.key==='limekettle'),sf=[stairX(shoreZ(STAIR.x0)-40),shoreZ(STAIR.x0)-40],T=nearTree('pandan',covePt(-70,380)[0],covePt(-70,380)[1],5);
  return{'The Boiling Bay from the skiff':COVE_CAM,
   'The Bay Fountain erupting':(function(){const c=covePt(30,150);return[c[0],SEA+6,c[1],F.x,F.level+F.H*.45,F.z];})(),
   'The Kettle Horn':(function(){const c=covePt(-55,170);return[c[0],SEA+5,c[1],K.x,K.top+K.H*.35,K.z];})(),
   'The Lime Stair into the surf':(function(){const c=[sf[0]+70,sf[1]+95];return[c[0],SEA+9,c[1],sf[0],gh(sf[0],sf[1],1),sf[1]-50];})(),
   'The Lime Kettle and the notch':[lk.x+70,lk.level+40,lk.z+120,lk.x,lk.level,lk.z],
   'The sulphur dike':(function(){const q=covePt(70,300);return[q[0],gh(q[0],q[1],6),q[1],dm[0],gh(dm[0],dm[1],1.5),dm[1]];})(),
   'The bleached bluff (acid field)':toward(A.x-40,A.z+40,A.x,A.z,A.r+45,9,0),
   'The scald line on the rim':atTree(T,T.crownR*3+10,1.2,2,.5),
   'The cove from above':[CC[0]+520,420,CC[1]+620,CC[0]-30,0,CC[1]-60]};},
 erupt:{'The Boiling Bay from the skiff':'fountain','The Bay Fountain erupting':'fountain','The Kettle Horn':'kettlehorn'},
 checks:(add,P)=>{const C=window._cove||{chimneys:[],vents:[]};
  add('the cove is a crescent open to the sea',COVE_HCHK.crescent(ringSamples(-140,84,RC-14),ringSamples(130,186,RC-14)));
  add('the springs run into the Ring Sea and the Lime Stair',COVE_HCHK.intoSea(LAYOUT.runoff));
  add('the beds bound (KSTRATA carbonate-shelf bluffs and the tibasalt dike)',STRATA&&DIKE_ROCK?COVE_HCHK.strata(coveCliffPts(),coveDikePts(DIKE_ROCK)):{ok:false,detail:'no KSTRATA on the page'});
  add('sulphur chimneys crust the dike rib',COVE_HCHK.sulphur(C.chimneys));
  add('steam plumes stand over the boiling bay',COVE_HCHK.plumes(C.vents));},
 negatives:(add,P)=>{const C=window._cove||{chimneys:[],vents:[]};
  add('a rim across the breach',COVE_HCHK.crescent(ringSamples(130,186,RC-14),ringSamples(-140,84,RC-14)));
  add('outflows that stop short of the sea',COVE_HCHK.intoSea(LAYOUT.runoff.map(c=>Object.assign({},c,{P:c.P.slice(0,1)}))));
  add('a dike read as limestone',STRATA?COVE_HCHK.strata(coveCliffPts(),coveDikePts(STRATA)):{ok:false,detail:'no KSTRATA'});
  add('a chimney 40 m off the dike',COVE_HCHK.sulphur(C.chimneys.concat([{x:DIKE.b[0]+40,z:DIKE.b[1],y:5}])));
  add('a boil on the bench',COVE_HCHK.plumes(C.vents.concat([Object.assign({},C.vents[0]||{plume:{height:1}},{x:covePt(-95,318)[0],z:covePt(-95,318)[1]})])));}};
