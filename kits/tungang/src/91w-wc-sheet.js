// ================================================================= WILDCAT ON THE SHEET: the great house on its knoll, the two hamlets (after 91t-fg-sheet.js)
// Drawn the way a world draws them, through the host API (82-wc-host.js): the knoll's ground first (its top flattened under
// the house, falling to the stockade's ring and past it), the records registered in core/tags (TG.fg.puebloRegister), then
// TG.fg.pueblo. The hamlets stand below on the flat, the pens' L beside two Fellgang pens and a smokehouse (TG.fg.draw).
// window._fgSheet.wildcat / .hamlets hold the draws; window._wcChecks() the page checks verify.py --assert runs. Host-only.
const FG_KNOLL={x:600,z:-170,H:6,P:null,
 /* the signed distance outside the house's hull (local, convex: the largest edge distance) */
 out(lx,lz){const H=FG_KNOLL.P.hull;let m=-1e9;for(let i=0;i<H.length;i++){const p=H[i],q=H[(i+1)%H.length],dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz)||1;m=Math.max(m,((lx-p[0])*dz-(lz-p[1])*dx)/L);}return m;},
 ground(x,z){const K=FG_KNOLL,P=K.P;if(!P)return 0;const lx=x-K.x,lz=z-K.z,d=K.out(lx,lz),m=P.enclosure?P.enclosure.margin:20,a=4,b=m+6;if(d>b+30)return 0;
  const t=Math.max(0,Math.min(1,(d-a)/(b-a))),s=t*t*(3-2*t);return K.H*(1-s)+(d>a?(KRAND.vnoise(x*.08,0,z*.08,4410)-.5)*.6*Math.min(1,(d-a)/6)*(1-s*.5):0);}};
function fgWcSheet(W){const out=window._fgSheet||(window._fgSheet={});
 const P=FG_KNOLL.P=TG.fg.wildcat(),B=P.bounds,m=(P.enclosure?P.enclosure.margin:20)+40;
 W.add(fgSheetMesh(FG_KNOLL.ground,FG_KNOLL.x+B.x0-m,FG_KNOLL.x+B.x1+m,FG_KNOLL.z+B.z0-m,FG_KNOLL.z+B.z1+m,2,0x6e7454));
 const o={x:FG_KNOLL.x,z:FG_KNOLL.z,ry:0,ground:FG_KNOLL.ground};
 if(SVTAGS)out.wildcatReg=TG.fg.puebloRegister(P,SVTAGS,o);
 out.wildcat=TG.fg.pueblo(P,Object.assign({scene:W,label:'Wildcat: the great house (core/pueblo, the scrap pueblo)'},o));
 /* the hamlets: the ford's U and the pens' L, on the flat below the knoll */
 const HP=TG.fg.wildcatHamlets(),at=[{x:560,z:-335,ry:.12},{x:648,z:-342,ry:-.2}];out.hamlets=[];out.hamletRegs=[];
 HP.forEach((Q,i)=>{const oh=Object.assign({ground:terrainH},at[i]);if(SVTAGS)out.hamletRegs.push(TG.fg.puebloRegister(Q,SVTAGS,oh));
  out.hamlets.push(TG.fg.pueblo(Q,Object.assign({scene:W,label:'Wildcat: a scrap-pueblo hamlet ('+Q.id+')'},oh)));});
 const PR=[{key:'fg-pens',x:688,z:-350,ry:-1.6},{key:'fg-pens',x:688,z:-334,ry:-1.6},{key:'fg-smokehouse',x:682,z:-314,ry:-.2}].map((r,i)=>Object.assign({id:'sheet:wcpens:'+i},r));
 PR.forEach(r=>fgSheetRegister(r,0,'Wildcat\'s pens'));out.wildcatPens=TG.fg.draw({id:'wildcat-pens',records:PR},{scene:W,ground:terrainH,seed:8316,character:'stony',label:'Wildcat\'s pens (Fellgang pens and a smokehouse)'});
 return out;}
const fgWcBW=buildWorld;
buildWorld=function(){const W=fgWcBW();try{fgWcSheet(W);}catch(err){reportErr('Wildcat on the sheet: '+(err.stack||err));}
 if(typeof nightRebuild==='function')nightRebuild();
 if(window._build&&window._fgSheet&&window._fgSheet.wildcat)window._build.wildcat={rooms:window._fgSheet.wildcat.plan.census.rooms,pop:window._fgSheet.wildcat.plan.census.pop,tris:window._fgSheet.wildcat.tris};return W;};
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
 return R;};
