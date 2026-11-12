// ================================================================= WILDCAT ON THE SHEET: the great house on its knoll, the two hamlets (after 91t-fg-sheet.js)
// Drawn the way a world draws them, through the host API (82-wc-host.js): the knoll's ground first (its top flattened under
// the house, falling to the stockade's ring and past it), the records registered in core/tags (TG.fg.puebloRegister), then
// TG.fg.pueblo. The hamlets stand below on the flat, the pens' L beside two Fellgang pens and a smokehouse (TG.fg.draw).
// window._fgSheet.wildcat / .hamlets hold the draws; window._wcChecks() the page checks verify.py --assert runs. Host-only.
const FG_KNOLL={x:600,z:-170,H:6,P:null,
 /* the signed distance outside the house's hull (local, convex: the largest edge distance) */
 out(lx,lz){const H=FG_KNOLL.P.hull;let m=-1e9;for(let i=0;i<H.length;i++){const p=H[i],q=H[(i+1)%H.length],dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz)||1;m=Math.max(m,((lx-p[0])*dz-(lz-p[1])*dx)/L);}return m;},
 ground(x,z){const K=FG_KNOLL,P=K.P;if(!P)return 0;const lx=x-K.x,lz=z-K.z,d=K.out(lx,lz),m=P.enclosure?P.enclosure.margin:20,a=4,b=m+6;if(d>b+30)return 0;
  const t=Math.max(0,Math.min(1,(d-a)/(b-a))),s=t*t*(3-2*t);return fgWcCarve(P,lx,lz,K.H*(1-s)+(d>a?(KRAND.vnoise(x*.08,0,z*.08,4410)-.5)*.6*Math.min(1,(d-a)/6)*(1-s*.5):0));}};
/* a pueblo's ground carved for it (local plan coordinates): under its plazas .35 m below the paving (the house draws the plaza's
   packed earth), down to each kiva's floor out to 1.5 m past its rim (its pit), and a culvert's river channel 1.2 m deep */
function fgWcCarve(P,lx,lz,g){for(const k of P.kivas)if(Math.hypot(lx-k.x,lz-k.z)<k.r+1.5)return g-k.depth-.35;
 for(const q of (P.passages||[]))if(q.kind==='culvert'&&Math.abs(lx-q.x)<(q.x1-q.x0)/2-1.8)return g-1.2;
 for(const pl of P.plazas)if(KPUEBLO.inPoly(pl.pts,lx,lz))return g-.35;return g;}
/* a low pad for a hamlet: its top H over the hull, falling to the flat over all metres, carved */
function fgWcPad(P,x0,z0,ry,H,fall){const c=Math.cos(ry),s=Math.sin(ry),HL=P.hull;return (x,z)=>{const dx=x-x0,dz=z-z0,lx=dx*c-dz*s,lz=dx*s+dz*c;
  let m=-1e9;for(let i=0;i<HL.length;i++){const p=HL[i],q=HL[(i+1)%HL.length],ex=q[0]-p[0],ez=q[1]-p[1],L=Math.hypot(ex,ez)||1;m=Math.max(m,((lx-p[0])*ez-(lz-p[1])*ex)/L);}
  const t=Math.max(0,Math.min(1,(m-2)/fall));return fgWcCarve(P,lx,lz,H*(1-t*t*(3-2*t)));};}
/* BARRICADE'S GORGE: the Weyt Warra's narrows on the sheet, running along z; its floor 5 m up, 180 m across at the wall and
   opening out both ways, its walls of rock rising 70 m; the river down the culvert's line; the wall across it */
const FG_GORGE={x:-480,z:-170,H:5,P:null,
 half(z){const P=FG_GORGE.P,zw=FG_GORGE.z+(P?P.bounds.z1-9.2:0);return 91+Math.max(0,Math.abs(z-zw)-24)*.45;},
 ground(x,z){const K=FG_GORGE,P=K.P,dx=Math.abs(x-K.x),hw=K.half(z);let g=K.H;
  if(dx>hw){const e=dx-hw;g=K.H+Math.min(70,e*1.35+e*e*.004)+KRAND.fbm(x*.05,z*.05,1,3,4420)*3*Math.min(1,e/6);}
  if(!P)return g;return dx>hw?g:fgWcCarve(P,x-K.x,z-K.z,g);},
 rock(x,z){return Math.abs(x-FG_GORGE.x)>FG_GORGE.half(z)-.5;}};
function fgWcSheet(W){const out=window._fgSheet||(window._fgSheet={});
 const P=FG_KNOLL.P=TG.fg.wildcat(),B=P.bounds,m=(P.enclosure?P.enclosure.margin:20)+40;
 W.add(fgSheetMesh(FG_KNOLL.ground,FG_KNOLL.x+B.x0-m,FG_KNOLL.x+B.x1+m,FG_KNOLL.z+B.z0-m,FG_KNOLL.z+B.z1+m,2,0x6e7454));
 const o={x:FG_KNOLL.x,z:FG_KNOLL.z,ry:0,ground:FG_KNOLL.ground};
 if(SVTAGS)out.wildcatReg=TG.fg.puebloRegister(P,SVTAGS,o);
 out.wildcat=TG.fg.pueblo(P,Object.assign({scene:W,label:'Wildcat: the great house (core/pueblo, the scrap pueblo)'},o));
 /* the hamlets: the ford's U and the pens' L, on the flat below the knoll */
 const HP=TG.fg.wildcatHamlets(),at=[{x:560,z:-335,ry:.12},{x:648,z:-342,ry:-.2}];out.hamlets=[];out.hamletRegs=[];
 HP.forEach((Q,i)=>{const G=fgWcPad(Q,at[i].x,at[i].z,at[i].ry,.6,7),B2=Q.bounds,mm=(Q.enclosure?Q.enclosure.margin:0)+14,r2=Math.hypot(B2.w,B2.d)/2+mm;
  W.add(fgSheetMesh(G,at[i].x-r2,at[i].x+r2,at[i].z-r2,at[i].z+r2,1.5,0x6e7454));const oh=Object.assign({ground:G},at[i]);if(SVTAGS)out.hamletRegs.push(TG.fg.puebloRegister(Q,SVTAGS,oh));
  out.hamlets.push(TG.fg.pueblo(Q,Object.assign({scene:W,label:'Wildcat: a scrap-pueblo hamlet ('+Q.id+')'},oh)));});
 const PR=[{key:'fg-pens',x:688,z:-350,ry:-1.6},{key:'fg-pens',x:688,z:-334,ry:-1.6},{key:'fg-smokehouse',x:682,z:-314,ry:-.2}].map((r,i)=>Object.assign({id:'sheet:wcpens:'+i},r));
 PR.forEach(r=>fgSheetRegister(r,0,'Wildcat\'s pens'));out.wildcatPens=TG.fg.draw({id:'wildcat-pens',records:PR},{scene:W,ground:terrainH,seed:8316,character:'stony',label:'Wildcat\'s pens (Fellgang pens and a smokehouse)'});
 /* BARRICADE across its gorge */
 {const PB=FG_GORGE.P=TG.fg.barricade(),K=FG_GORGE,z0=K.z-150,z1=K.z+150;
  /* the floor in two pieces either side of the river's bed, the bed itself of rock (the river is the world's: core/water when Barricade is placed) */
  const q=PB.passages.find(p=>p.kind==='culvert'),cl=q?K.x+q.x-((q.x1-q.x0)/2-1.8):K.x,cr=q?K.x+q.x+((q.x1-q.x0)/2-1.8):K.x;
  W.add(fgSheetMesh(K.ground,K.x-92,cl,z0,z1,2,0x6e7454));W.add(fgSheetMesh(K.ground,cr,K.x+92,z0,z1,2,0x6e7454));if(cr>cl)W.add(fgSheetMesh(K.ground,cl,cr,z0,z1,1,0x7a7468,true));for(const s of [-1,1])W.add(fgSheetMesh(K.ground,s<0?K.x-200:K.x+91.5,s<0?K.x-91.5:K.x+200,z0,z1,3,0x8a8476,true));
  const ob={x:K.x,z:K.z,ry:0,ground:K.ground};if(SVTAGS)out.barricadeReg=TG.fg.puebloRegister(PB,SVTAGS,ob);
  out.barricade=TG.fg.pueblo(PB,Object.assign({scene:W,label:'Barricade: the wall across the pass (core/pueblo, the bar)'},ob));}
 return out;}
const fgWcBW=buildWorld;
buildWorld=function(){const W=fgWcBW();try{fgWcSheet(W);}catch(err){reportErr('Wildcat on the sheet: '+(err.stack||err));}
 if(typeof nightRebuild==='function')nightRebuild();
 const S0=window._fgSheet||{};if(window._build)for(const k of ['wildcat','barricade'])if(S0[k])window._build[k]={rooms:S0[k].plan.census.rooms,pop:S0[k].plan.census.pop,tris:S0[k].tris,furniture:S0[k].furniture};return W;};
/* ---------------------------------------------------------------- the page checks (verify.py --assert): each {name, ok, detail} with its negative */
window._wcChecks=function(){const R=[],S=window._fgSheet||{},C=TG.fg.check,add=(name,pass,neg)=>R.push({name,ok:!!pass.ok&&!neg.ok,
  detail:(pass.ok?'':'FAILED ')+(pass.detail||'')+(neg.ok?'  [its negative did not fail: '+(neg.detail||'')+']':'  (negative fails: '+(neg.detail||'')+')')});
 const P=S.wildcat&&S.wildcat.plan,D=S.wildcat||{recs:[]},c=P?C.pueblo(P,D.recs):{ok:false,bad:['no plan'],census:{}};
 /* the plan and its draw: every cell, kiva, door and hatch drawn; 1,000 to 2,000 people */
 const pop=c.census&&c.census.pop,P2=P&&JSON.parse(JSON.stringify(P));
 if(P2){Object.defineProperty(P2,'byId',{value:KPUEBLO.link(P2.cells),enumerable:false});P2.cells.find(q=>q.row===0&&q.block==='arc').storeys=9;}
 add('wildcat-plan',{ok:c.ok&&pop>=1000&&pop<=2000,detail:P?P.census.rooms+' rooms ('+P.census.homes+' dwellings, '+P.census.stores+' stores, '+P.census.hero+' the hero\'s), '+pop+' people, '+P.cells.length+' columns up to '+P.census.maxStoreys+' storeys, '+P.ladders.length+' ladders, '+P.kivas.length+' kivas; drawn: '+JSON.stringify(c.drawn)+(c.bad.length?'; '+c.bad.join(' | '):''):'none'},
  P2?{ok:C.pueblo(P2,D.recs).ok,detail:'a plan with a front room raised to nine storeys over the terrace behind it'}:{ok:true,detail:'n/a'});
 /* on the knoll: the floor at the hull's highest ground, the footings down to the ground, the stockade's stakes on the slope */
 const H=D.recs.find(r=>r.key==='fg-wc-greathouse'),St=D.recs.find(r=>r.key==='fg-wc-stockade');let top=-1e9;if(P)for(const p of P.hull)top=Math.max(top,FG_KNOLL.ground(FG_KNOLL.x+p[0],FG_KNOLL.z+p[1]));
 const low=P?Math.min(...P.cells.map(q=>FG_KNOLL.ground(FG_KNOLL.x+q.cx,FG_KNOLL.z+q.cz))):0;
 add('wildcat-on-knoll',{ok:!!H&&Math.abs(H.y-top)<.02&&H.bbox.mn[1]<=low+.02&&top>FG_KNOLL.H-.5&&!!St&&St.bbox.mn[1]<top-3&&St.fg.stakes>300,
   detail:H?'the floor '+H.y.toFixed(2)+' m on the knoll\'s top ('+top.toFixed(2)+'); the footings to '+H.bbox.mn[1].toFixed(2)+'; the stockade '+(St?St.fg.stakes+' stakes and '+St.fg.panels+' panels down to '+St.bbox.mn[1].toFixed(2)+' m':'missing'):'not drawn'},
  {ok:!!H&&Math.abs(H.y-(top-3))<.02,detail:'the floor checked against the knoll 3 m lower'});
 /* registered: every room, kiva, ladder and plaza of the plan a child of the house's record in core/tags */
 const reg=S.wildcatReg,T=SVTAGS,kids=reg&&T?T.query({parent:reg.house.id}):[],want=P?P.rooms.length+P.kivas.length+P.ladders.length+P.plazas.length:1;
 const rooms=kids.filter(k=>k.kind==='room').length;
 add('wildcat-tags',{ok:!!reg&&rooms===P.rooms.length&&kids.length>=want&&kids.filter(k=>k.kind==='kiva').length===P.kivas.length,detail:reg?kids.length+' records under '+reg.house.id+': '+rooms+' rooms, '+kids.filter(k=>k.kind==='kiva').length+' kivas, '+kids.filter(k=>k.kind==='ladder').length+' ladders, '+kids.filter(k=>k['class']==='fixture'&&k.kind!=='ladder').length+' pieces of dress':'not registered'},
  {ok:!!reg&&rooms===P.rooms.length+1,detail:'the rooms counted against one room more than the plan'});
 /* the dress: the round room, the hero's crest, the Deeds, the slogans */
 const dr=D.dress||{},Hf=H&&H.fg||{};
 add('wildcat-dress',{ok:!!H&&Hf.crest>3&&Hf.trophies===6&&Hf.deeds===1&&Hf.slogans>=3&&Hf.shells>=2&&P.kivas.some(k=>k.great&&k.plaza===P.plazas[0].id),
   detail:'crest '+Hf.crest+', trophy poles '+Hf.trophies+', the Deeds '+Hf.deeds+' ('+(dr.deeds&&dr.deeds[0]?dr.deeds[0].boasts.length+' boasts, '+dr.deeds[0].boasts.filter(b=>b.made).length+' made good':'none')+'), slogans '+Hf.slogans+', shells '+Hf.shells+'; faced '+Hf.faced+' faces ('+Hf.cars+' car shells), '+Hf.vigas+' vigas'},
  {ok:!!H&&Hf.trophies===7,detail:'six trophy poles checked as seven'});
 /* the hamlets: small, every check passing, the U's yard open */
 const hs=(S.hamlets||[]).map(h=>C.pueblo(h.plan,h.recs));
 add('wildcat-hamlets',{ok:hs.length===2&&hs.every(h=>h.ok&&h.census.pop>=40&&h.census.pop<=300)&&S.hamlets.every(h=>h.plan.plazas[0].open),detail:hs.map((h,i)=>S.hamlets[i].plan.id+': '+h.census.rooms+' rooms, '+h.census.pop+' people'+(h.bad.length?' '+h.bad.join('|'):'')).join('; ')},
  {ok:hs.length===2&&hs.every(h=>h.census.pop>=1000),detail:'the hamlets checked against the great house\'s range'});
 /* BARRICADE: the plan and its draw; its gorge */
 const PB=S.barricade&&S.barricade.plan,DB=S.barricade||{recs:[]},cb=PB?C.pueblo(PB,DB.recs):{ok:false,bad:['no plan'],census:{}},HB=DB.recs.find(r=>r.key==='fg-bc-greathouse'),Hb=HB&&HB.fg||{};
 const gate=PB&&PB.passages.find(p=>p.kind==='gate'),culv=PB&&PB.passages.find(p=>p.kind==='culvert');
 add('barricade-plan',{ok:cb.ok&&cb.census.pop>=600&&cb.census.pop<=2000&&!!gate&&!!culv&&Hb.wrecks>=40&&Hb.gates===2&&Hb.lookouts===2&&Hb.pickets>=10&&Hb.slogans>=3,
   detail:PB?PB.census.rooms+' rooms, '+cb.census.pop+' people, '+PB.cells.length+' columns up to '+PB.census.maxStoreys+' storeys; the gate '+(gate?gate.cells.length+' columns, '+gate.clear+' storeys clear':'none')+', the culvert '+(culv?culv.cells.length+' columns':'none')+'; drawn: wrecks '+Hb.wrecks+', gates '+Hb.gates+', lookouts '+Hb.lookouts+', pickets '+Hb.pickets+', slogans '+Hb.slogans+(cb.bad.length?'; '+cb.bad.join(' | '):''):'none'},
  {ok:!!PB&&C.pueblo(PB,D.recs).ok,detail:'Barricade\'s plan checked against Wildcat\'s draw'});
 const K=FG_GORGE,flo=PB?Math.max(...PB.hull.map(p=>K.ground(K.x+p[0],K.z+p[1]))):0,ends=PB?[PB.bounds.x0,PB.bounds.x1].map(x=>K.half(K.z+PB.bounds.z1-9.2)-Math.abs(x)):[9,9];
 const bed=culv?K.ground(K.x+culv.x,K.z+culv.z):0;
 add('barricade-in-the-gorge',{ok:!!HB&&Math.abs(HB.y-flo)<.02&&Math.abs(flo-K.H)<.01&&ends.every(e=>e>=0&&e<4)&&bed<K.H-1,
   detail:HB?'the floor '+HB.y.toFixed(2)+' m on the gorge\'s floor ('+K.H+'); the bastions '+ends.map(e=>e.toFixed(1)).join(' and ')+' m from the gorge\'s walls; the river\'s bed under the culvert at '+bed.toFixed(2)+' m':'not drawn'},
  {ok:ends.every(e=>e>=0&&e<1),detail:'the bastions checked against walls 1 m off'});
 /* INSIDE: every room of both houses drawn hollow, every piece of their furniture placed, the core check on each */
 const houses=[['wildcat',P,D],['barricade',PB,DB]].filter(h=>h[1]),ins=houses.map(h=>{const r=h[2].recs.find(q=>q.fg&&q.fg.plan===h[1].id)||{fg:{}},fc=KPUEBLO.check.furniture(h[1]);
   return {id:h[0],rooms:r.fg.rooms===h[1].rooms.length,placed:h[2].furniture?h[2].furniture.pieces:0,want:h[1].furniture.length+((h[2].dress&&h[2].dress.drums)||[]).length,missing:h[2].furniture?h[2].furniture.missing:-1,fc};});
 add('pueblo-interiors',{ok:ins.length===2&&ins.every(q=>q.rooms&&q.placed===q.want&&q.missing===0&&q.fc.ok&&q.want>500),
   detail:ins.map(q=>q.id+': rooms hollow '+q.rooms+', '+q.placed+' of '+q.want+' pieces placed ('+q.missing+' missing from the catalog)'+(q.fc.bad.length?' '+q.fc.bad.slice(0,3).join('|'):'')).join('; ')},
  (()=>{if(!P)return {ok:true,detail:'n/a'};const Q=JSON.parse(JSON.stringify(P));Object.defineProperty(Q,'byId',{value:KPUEBLO.link(Q.cells),enumerable:false});Q.hatchByCell=P.hatchByCell;
   const f=Q.furniture.find(q=>!q.kiva),F0=KPUEBLO.frame(Q,Q.rooms.find(r=>r.id===f.room));f.lx=F0.hx;f.lz=F0.hz+.3;return {ok:KPUEBLO.check.furniture(Q).ok,detail:'a piece moved onto its room\'s hatch'};})());
 const tbl=fgWcFurnKeys(),bad=Object.keys(tbl).filter(k=>{const A=KratorFurniture.FURN_BY_KEY[k];if(!A)return true;const m=KratorFurniture.entryDims(A,0),q=tbl[k];return Math.abs(m.w-q.w)>.05||Math.abs(m.d-q.d)>.05;});
 add('pueblo-furniture-table',{ok:!bad.length&&Object.keys(tbl).length>=15,detail:Object.keys(tbl).length+' catalog keys in the rooms\' tables, sizes as declared'+(bad.length?'; wrong or missing: '+bad.join(', '):'')},
  {ok:!!KratorFurniture.FURN_BY_KEY.fellgang_nonesuch,detail:'fellgang_nonesuch'});
 /* the section: every house opened at the storey asked, closed after */
 const keep=FG_WC_SECTION;TG.fg.section(2);const s2=FG_WC_CLIPS.every(c=>Math.abs(c.plane.constant-(c.y0+c.h+1.6))<1e-6);TG.fg.section(null);const s0=FG_WC_CLIPS.every(c=>c.plane.constant>1e5);TG.fg.section(keep);
 add('pueblo-section',{ok:s2&&s0&&FG_WC_CLIPS.length>=4,detail:FG_WC_CLIPS.length+' houses clipped at storey 2 ('+s2+'), opened again ('+s0+')'},{ok:FG_WC_CLIPS.length>=4&&FG_WC_CLIPS.every(c=>Math.abs(c.plane.constant-(c.y0+1.6))<1e-6),detail:'storey 2 checked as the ground floor'});
 return R;};
/* ---------------------------------------------------------------- the section key and the furniture's chunks */
/* K steps the storey section (off, the kivas, storeys 1 to 6); a view may carry {section} as its seventh entry */
{const steps=[null,'kiva',1,2,3,4,5,6];let lab=null;
 const show=v=>{if(!lab){lab=document.createElement('div');lab.style.cssText='position:fixed;right:10px;bottom:10px;background:rgba(0,0,0,.6);color:#eee;padding:4px 8px;border-radius:4px;font:12px system-ui;z-index:8';document.body.appendChild(lab);}
  lab.textContent=v==null?'Pueblos: whole (K: section)':'Pueblos: section at '+(v==='kiva'?'the kivas':'storey '+v)+' (K)';};
 window._wcSection=v=>{TG.fg.section(v==null?null:v);show(v);return v;};
 addEventListener('keydown',e=>{if((e.key==='k'||e.key==='K')&&!e.ctrlKey&&!e.metaKey&&!(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))){const i=steps.indexOf(FG_WC_SECTION);window._wcSection(steps[(i+1)%steps.length]);}});
 /* the view hook wraps core/host's setView on the first frame (the page's global setView hands every call to it) */
 const hook=()=>{if(typeof KHOST==='undefined'||!KHOST.setView||KHOST.setView._wc)return;const sv=KHOST.setView;
  KHOST.setView=function(...a){if(a.length>6)window._wcSection(a[6]&&a[6].section!=null?a[6].section:null);else if(FG_WC_SECTION!=null)window._wcSection(null);return sv.apply(this,a.slice(0,6));};KHOST.setView._wc=1;};
 const tick=()=>{try{hook();if(typeof camera!=='undefined')TG.fg.chunksTick(camera);}catch(e){}requestAnimationFrame(tick);};requestAnimationFrame(tick);}
