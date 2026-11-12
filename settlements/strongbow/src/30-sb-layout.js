// ================================================================= STRONGBOW TODAY — the layout (records; builds nothing)
// Strongbow as it stands now (PLAN.md): the Ancients' arcology on the Xanadu-Oidong scarp, held below by the Sultanate (the foot,
// the Spine to its third terrace, the elevator's lifts to the lip and the post there), above by the Order (the tower, the Nock's
// centre), and in between by no one or by the outcasts. Every part, way and lift is a record keyed by a stable id; the rules
// (31-sb-rules.js) check them; the sheets (strongbow_blueprint.py) and AREAS.md are drawn from them. The arcology's own records
// (kits/ancients/targets/strongbow, STRONGBOW.plan and .ruin) are read in place: a part's place is the target's, its state and
// holder are this layout's.
//
// THE FRAME   the target's: x east along the face, y up from the foot (the page's floor), z SOUTH out of the rock; the face line
//             z = 0 at the foot. The sheets draw u = x, v = -z (the cliff at the top of the sheet).
// SHAPES      ['box', x0, x1, z0, z1] | ['circ', x, z, r] | ['ring', x, z, r0, r1] (an annulus round a core)
// A PART      {id, name, zone, kind, by, state, shape, y, h, st, sheets, people, use, in, note}
//             by: 'xanadu' | 'order' | 'outcasts' | 'ancient' (no one's) ; state: see SB_STATES
// A WAY       {id, kind, a, b, by, open, gated, y0, y1, pts, note}; a lift is a way of kind 'lift' with its frame's span y0..y1
//
// [G data]: no three.js, no DOM. Terraces are numbered here FROM THE BOTTOM (T1 the lowest, 108 m); the target counts from the
// top (sb.ter.6 is T1). Numbers not given by the owner are proposals (PLAN.md).
const SB_STATES=['reclaimed','kept','squatted','damaged','sealed','cutoff','gone'];
const SB_ZONES=['Z0','Z1','Z2','Z3','Z4','Z5','Z6','Z7','Z8','Z9','town'];
const SB_BY=['xanadu','order','outcasts','ancient'];

/* built on first use (sbLayout()), so a page that loads this fragment before the arcology's plan still works */
let SB_LAYOUT_=null;
/* a lift car's half width (m): the layout places the frames, src/32-sb-walk.js the cars */
const SB_CAR=3;
function sbLayout(){if(SB_LAYOUT_)return SB_LAYOUT_;SB_LAYOUT_=(function(){
 const P=STRONGBOW.plan({seed:1647}),RU=STRONGBOW.ruin(P),F=P.frame,D=P.dim,FT=P.foot,ST=D.STO;
 const parts=[],ways=[],T={};
 const part=(o)=>{const p=Object.assign({y:0,h:0,st:0,people:0,sheets:[],note:''},o);parts.push(p);return p;};
 const way=(o)=>{const w=Object.assign({open:true,gated:false,by:'xanadu',pts:null,note:''},o);ways.push(w);return w;};
 const drum=id=>P.drums.find(d=>d.id===id),ter=k=>P.spine.terraces.find(t=>t.k===k);
 // the terraces from the bottom: T1..T6 = the target's k 6..1
 for(let i=1;i<=6;i++){const t=ter(7-i);T[i]=t;}
 const L=FT.lobby,H=FT.hall,pz=FT.plaza,cut=RU.foot.hallCut;

 // ---- Z0 the foot: the Ancients' podium, as Xanadu uses it (PLAN.md section 4) ------------------------------------------------
 part({id:'sb.plaza',name:'the plaza',zone:'Z0',kind:'plaza',by:'xanadu',state:'reclaimed',shape:['box',pz.x0,pz.x1,pz.z0,pz.z1],y:pz.y,sheets:['S0','S1'],
  note:'the town\'s market square; the valley\'s caravans unload here'});
 part({id:'sb.plaza.shrine',name:'the Wheel shrine',zone:'Z0',kind:'shrine',by:'xanadu',state:'reclaimed',in:'sb.plaza',shape:['circ',pz.x1-22,(pz.z0+pz.z1)/2,12],y:pz.y,h:14,st:1,sheets:['S1'],people:4,use:'priest',note:'xa_scrap_shrine'});
 part({id:'sb.plaza.pavilion',name:'the Cistern Pavilion',zone:'Z0',kind:'cistern',by:'xanadu',state:'reclaimed',in:'sb.plaza',shape:['circ',pz.pools[0].at[0],pz.pools[0].at[2],pz.pools[0].r+2],y:pz.y,h:10,st:1,sheets:['S1'],note:'over the west pool: the way down to the cisterns\' upper level (xa_scrap_pavilion)'});
 part({id:'sb.plaza.pool',name:'the east pool (dry)',zone:'Z0',kind:'pool',by:'ancient',state:'damaged',in:'sb.plaza',shape:['circ',pz.pools[1].at[0],pz.pools[1].at[2],pz.pools[1].r],y:pz.y,sheets:['S1']});
 part({id:'sb.plaza.gate',name:'the girder gate',zone:'Z0',kind:'gate',by:'xanadu',state:'reclaimed',in:'sb.plaza',shape:['box',pz.x0,pz.x0+12,(pz.z0+pz.z1)/2-14,(pz.z0+pz.z1)/2+14],y:pz.y,h:16,st:2,sheets:['S1'],people:0,use:'watch',note:'where the road from the Xanadu floor enters (xa_scrap_gate)'});
 part({id:'sb.lobby',name:'the lobby: the bazaar',zone:'Z0',kind:'hall',by:'xanadu',state:'reclaimed',shape:['ring',L.at[0],L.at[2],L.core+18,L.r],y:0,h:L.y1-L.y0,st:1,sheets:['S0','S1'],people:0,use:'stallkeeper',
  note:'the stalls on the floor; the glazing mostly gone, re-glazed in scrap glass on its south side'});
 part({id:'sb.lobby.core',name:'the core (the Spine\'s dead lift shafts; lift L1 runs inside)',zone:'Z0',kind:'shaft',by:'xanadu',state:'reclaimed',in:'sb.lobby',shape:['circ',L.at[0],L.at[2],L.core],y:0,h:L.y1,st:0,sheets:['S1','S2']});
 part({id:'sb.lobby.stair',name:'the great stair',zone:'Z0',kind:'stair',by:'xanadu',state:'damaged',in:'sb.lobby',shape:['ring',L.at[0],L.at[2],L.stair.r0,L.stair.r1],y:0,h:L.y1,sheets:['S1','S2'],note:'treads missing in places, mended with girder planks'});
 const galUse=[['money changers and scribes','changer',60],['the cookshops','cook',40],['the stallkeepers\' homes','stallkeeper',140]];
 L.galleries.forEach((g,i)=>part({id:'sb.lobby.gal.'+i,name:'the lobby\'s gallery '+(i+1)+': '+galUse[i][0],zone:'Z0',kind:'gallery',by:'xanadu',state:i===2?'damaged':'reclaimed',in:'sb.lobby',
  shape:['ring',L.at[0],L.at[2],g.r0,g.r1],y:g.y,h:3.6,st:1,sheets:['S2'],people:i===2?0:galUse[i][2],use:galUse[i][1],note:i===2?'broken in places: the stallkeepers sleep on the second':''}));
 part({id:'sb.hall.crushed',name:'the terminus hall\'s west half, crushed by the lower hull',zone:'Z0',kind:'fallen',by:'ancient',state:'gone',shape:['box',H.x0,cut,H.z0,H.z1],y:0,h:H.y1-H.y0,sheets:['S0','S1'],
  note:'the salvagers quarry the hull\'s pieces lying in it (Z8)'});
 part({id:'sb.hall.serai',name:'the terminus serai, built over the platforms',zone:'Z0',kind:'serai',by:'xanadu',state:'reclaimed',shape:['box',cut,cut+90,H.z0,H.z1],y:0,h:12,st:2,sheets:['S0','S1'],people:120,use:'seraikeeper',
  note:'xa_scrap_serai under the surviving vault; customs at its gate'});
 part({id:'sb.hall.yard',name:'the caravans\' yard under the vault',zone:'Z0',kind:'yard',by:'xanadu',state:'reclaimed',shape:['box',cut+90,H.x1,H.z0,H.z1],y:0,sheets:['S1'],use:'porter'});
 const W=FT.wings.find(w=>w.id==='sb.foot.w'),E=FT.wings.find(w=>w.id==='sb.foot.e'),B=FT.wings.find(w=>w.id==='sb.foot.back');
 const wm=(W.x0+W.x1)/2,em=(E.z0+E.z1)/2;
 part({id:'sb.foot.w.gov',name:'the governor\'s hall',zone:'Z0',kind:'office',by:'xanadu',state:'reclaimed',shape:['box',W.x0,wm,W.z0,W.z1],y:0,h:9,st:2,sheets:['S1'],people:40,use:'governor'});
 part({id:'sb.foot.w.customs',name:'customs and the scribes',zone:'Z0',kind:'office',by:'xanadu',state:'reclaimed',shape:['box',wm,W.x1,W.z0,W.z1],y:0,h:9,st:2,sheets:['S1'],people:10,use:'customs'});
 part({id:'sb.foot.w.barracks',name:'the barracks of the Sultan\'s garrison',zone:'Z0',kind:'barracks',by:'xanadu',state:'reclaimed',shape:['box',W.x0,W.x1,W.z0,W.z1],y:9,h:15,st:4,sheets:['S2'],people:220,use:'soldier',
  note:'150 soldiers and their families'});
 part({id:'sb.foot.e.guild',name:'the Salvagers\' Guildhall',zone:'Z0',kind:'guild',by:'xanadu',state:'reclaimed',shape:['box',E.x0,(E.x0+E.x1)/2,E.z0,em],y:0,h:9,st:2,sheets:['S1'],people:30,use:'guildclerk',note:'xa_scrap_guild_salvage'});
 part({id:'sb.foot.e.sheds',name:'the cutting sheds',zone:'Z0',kind:'works',by:'xanadu',state:'reclaimed',shape:['box',(E.x0+E.x1)/2,E.x1,E.z0,E.z1],y:0,h:9,st:2,sheets:['S1'],use:'cutter'});
 part({id:'sb.foot.e.stores',name:'the salvage stores',zone:'Z0',kind:'store',by:'xanadu',state:'reclaimed',shape:['box',E.x0,(E.x0+E.x1)/2,em,E.z1],y:0,h:9,st:2,sheets:['S1'],use:'hauler',note:'xa_scrap_store'});
 part({id:'sb.foot.e.shops',name:'the hull-crafts\' workshops',zone:'Z0',kind:'works',by:'xanadu',state:'reclaimed',shape:['box',E.x0,E.x1,E.z0,E.z1],y:9,h:8,st:2,sheets:['S2'],people:120,use:'bronzesmith'});
 part({id:'sb.foot.e.burned',name:'the burned top floors',zone:'Z0',kind:'burned',by:'ancient',state:'damaged',shape:['box',E.x0,E.x1,E.z0,E.z1],y:17,h:7,st:2,sheets:[],note:'the fire (proposed); stored in, not lived in'});
 part({id:'sb.foot.back.store',name:'the granary and stores in the back block',zone:'Z0',kind:'store',by:'xanadu',state:'reclaimed',shape:['box',B.x0,B.x1,B.z0,B.z1],y:0,h:9,st:2,sheets:['S1'],people:0,use:'fodder',note:'xa_scrap_granary within'});
 part({id:'sb.foot.back.homes',name:'homes over the stores',zone:'Z0',kind:'homes',by:'xanadu',state:'reclaimed',shape:['box',B.x0,B.x1,B.z0,B.z1],y:9,h:15,st:4,sheets:['S2'],people:256});
 part({id:'sb.vaults',name:'the vaults under the podium',zone:'Z0',kind:'cistern',by:'ancient',state:'sealed',shape:['box',H.x0,E.x1,B.z0,pz.z1],y:-12,h:12,st:0,sheets:[],note:'flooded; the cisterns\' upper level is reached from the Cistern Pavilion'});

 // ---- Z1, Z2, Z3, Z4 the Spine: its drums and terraces, run by run -------------------------------------------------------------
 const runZone=['Z4','Z3','Z3','Z3','Z2','Z2','Z1'];
 // the drums' states and people (PLAN.md section 3): Z1 reclaimed; Z2 run 5 reclaimed, run 4 burned and sealed; Z3 run 3 squatted
 // (the soundest), run 2 the salvagers' faces (damaged), run 1 nearest the break (cut off); Z4 gone
 const drumState={'sb.sp.6.0':['reclaimed',575],'sb.sp.6.1':['reclaimed',575],'sb.sp.5.0':['reclaimed',300],'sb.sp.5.1':['reclaimed',300],
  'sb.sp.4.0':['sealed',0],'sb.sp.4.1':['sealed',0],'sb.sp.3.0':['squatted',90],'sb.sp.3.1':['squatted',90],'sb.sp.2.0':['damaged',0],'sb.sp.2.1':['damaged',0],
  'sb.sp.1.0':['cutoff',0],'sb.sp.1.1':['cutoff',0],'sb.sp.1.2':['cutoff',0],'sb.sp.0.0':['gone',0],'sb.sp.0.1':['gone',0]};
 const byOf=s=>s==='reclaimed'?'xanadu':s==='squatted'?'outcasts':'ancient';
 for(const d of P.drums){const [s,n]=drumState[d.id],z=runZone[d.run];
  part({id:d.id,name:'drum '+d.id.slice(6)+' (run '+d.run+')',zone:z,kind:'drum',by:byOf(s),state:s,shape:['circ',d.at[0],d.at[2],d.r],y:d.at[1],h:d.h,st:Math.floor(d.h/ST),
   sheets:z==='Z1'||z==='Z2'?['S3']:z==='Z3'?['S4']:[],people:n,use:s==='reclaimed'?'homes':'',src:d.id,
   note:{sealed:'burned; sealed by the garrison',cutoff:'unsafe, nearest the break; no way reaches it',squatted:'the outcasts\' soundest drums',damaged:'the salvagers\' working faces',gone:'fell with the Spine\'s head'}[s]||''});}
 const terState={1:['reclaimed',250,'xanadu','the market garden; L2\'s foot'],2:['reclaimed',150,'xanadu','homes in the pavilion ring; kitchen gardens'],
  3:['reclaimed',50,'xanadu','the garden terrace (its deck); W1\'s bridge'],4:['squatted',20,'outcasts','the outcasts\' wild garden'],5:['damaged',0,'ancient','L3\'s head; the salvagers\' landing'],6:['gone',0,'ancient','torn off with the Spine\'s head']};
 for(let i=1;i<=6;i++){const t=T[i],[s,n,by,note]=terState[i],z=i<=1?'Z1':i<=3?'Z2':i<=5?'Z3':'Z4';
  part({id:'sb.T'+i,name:'terrace T'+i+(i===3?': the deck':''),zone:z,kind:'terrace',by,state:s,shape:['circ',t.at[0],t.at[2],t.r],y:t.at[1],h:8,st:1,
   sheets:z==='Z1'||z==='Z2'?['S3']:z==='Z3'?['S4']:[],people:n,use:i<=3?'gardener':'',src:t.id,note});}
 part({id:'sb.T3.ring',name:'T3\'s pavilion ring',zone:'Z2',kind:'terrace',by:'ancient',state:'damaged',in:'sb.T3',shape:['ring',T[3].at[0],T[3].at[2],D.SPINE.r+2,T[3].r-12],y:T[3].at[1]+1.6,h:6.4,st:1,sheets:['S3'],
  note:'gutted; T3 is half reclaimed'});

 // ---- Z5 the Nock, Z6 the tower: the Order's ----------------------------------------------------------------------------------
 const N=P.nock,nw=N.parts.find(q=>q.side<0),nc=N.parts.find(q=>q.side===0),zf=x=>N.front(x),lz=P.landing.at;
 part({id:'sb.nock.c',name:'the Nock\'s centre: the Order\'s balloon field',zone:'Z5',kind:'deck',by:'order',state:'kept',shape:['box',nc.x0,nc.x1,F.back,zf(0)],y:N.y,sheets:['S5'],
  note:'cracked round the leaning tower; the Order launches hot-air balloons and signals from it (the owner, 2026-11-11)'});
 part({id:'sb.nock.pad',name:'the landing pad: the balloons\' launch',zone:'Z5',kind:'pad',by:'order',state:'kept',in:'sb.nock.c',shape:['circ',lz[0],lz[2],P.landing.r],y:N.y,sheets:['S5']});
 part({id:'sb.nock.shed',name:'the balloon shed and burner store',zone:'Z5',kind:'shed',by:'order',state:'kept',in:'sb.nock.c',shape:['box',30,80,lz[2]-70,lz[2]-30],y:N.y,h:12,st:1,sheets:['S5'],note:'proposed'});
 part({id:'sb.nock.mast',name:'the signal mast (mirrors and lamps)',zone:'Z5',kind:'mast',by:'order',state:'kept',in:'sb.nock.c',shape:['circ',nc.x0+14,20,5],y:N.y,h:30,sheets:['S5'],note:'sees down onto Xanadu (proposed)'});
 part({id:'sb.nock.w',name:'the Nock\'s west wing',zone:'Z5',kind:'deck',by:'ancient',state:'damaged',shape:['box',nw.x0,nw.x1-26,-8,zf(nw.x0)],y:N.y,sheets:['S5'],note:'still bridging to the rock'});
 part({id:'sb.nock.landing',name:'the elevator\'s transfer landing (W2 to W3)',zone:'Z5',kind:'landing',by:'xanadu',state:'reclaimed',shape:['box',nw.x1-26,nw.x1,-8,40],y:N.y,h:6,st:1,sheets:['S5'],people:0,use:'capstan',
  note:'walled off from the Order\'s centre (proposed)'});
 part({id:'sb.nock.wall',name:'the wall between the landing and the Order\'s field',zone:'Z5',kind:'wall',by:'order',state:'kept',shape:['box',nw.x1-1,nw.x1+1,-8,40],y:N.y,h:4,sheets:['S5']});
 part({id:'sb.tower.low',name:'the tower\'s lower storeys',zone:'Z6',kind:'tower',by:'order',state:'sealed',shape:['box',-F.w(.5),F.w(.5),F.back,F.back+F.d(.5)],y:F.tip,h:100*ST,st:100,sheets:[],note:'empty, sealed by the Order'});
 part({id:'sb.tower.order',name:'the Order\'s sealed house: the upper storeys and the crown',zone:'Z6',kind:'tower',by:'order',state:'kept',shape:['box',-F.w(0),F.w(0),F.back,F.back+F.d(0)],y:F.tip+100*ST,h:F.top-F.tip-100*ST,st:P.storeys.length-100,sheets:['S6'],people:100,
  note:'about 100 monks; the arc ramp from the plateau is its only way in'});

 // ---- Z7 the face: the galleries ------------------------------------------------------------------------------------------------
 for(const g of P.galleries){const low=g.side>0&&g.j<2,s=low?'reclaimed':g.side<0?'damaged':'cutoff',x0=Math.min(g.x0,g.x1),x1=Math.max(g.x0,g.x1);
  part({id:g.id,name:'the '+(g.side<0?'west':'east')+' gallery '+(g.j+1),zone:'Z7',kind:'gallery',by:low?'xanadu':'ancient',state:s,shape:['box',x0,x1,F.faceZ((x0+x1)/2,g.y0)-g.deep,F.faceZ((x0+x1)/2,g.y0)+10],
   y:g.y0,h:g.y1-g.y0,st:D.GALL.storeys,sheets:['S3'],people:low?50:0,use:low?'homes':'',note:low?'reached by a girder bridge':s==='cutoff'?'no way reaches it':'stripped'});}

 // ---- Z8 the lower hull's pieces: the salvagers' quarry -----------------------------------------------------------------------
 for(const q of RU.quiver.pieces)part({id:q.id,name:'the lower hull, piece '+(q.i+1)+': the quarry',zone:'Z8',kind:'quarry',by:'xanadu',state:'damaged',shape:['circ',q.at[0],q.at[2],q.len*.25],y:q.at[1],sheets:['S0','S1'],use:'cutter'});

 // ---- Z9 the top: the Sultanate's post at the lip, the Order's gatehouse, the plateau's ruins --------------------------------
 const ly=F.lipY,lz0=F.faceZ(-140,ly);
 part({id:'sb.lip.post',name:'the Sultanate\'s toll post at the lip',zone:'Z9',kind:'post',by:'xanadu',state:'reclaimed',shape:['box',-150,-104,lz0-40,lz0-6],y:ly,h:10,st:2,sheets:['S6'],people:0,use:'lippost',
  note:'W5 lands here; xa_scrap_gate'});
 part({id:'sb.lip.yard',name:'the caravan yard and stables',zone:'Z9',kind:'yard',by:'xanadu',state:'reclaimed',shape:['box',-196,-104,lz0-150,lz0-46],y:ly,h:8,st:1,sheets:['S6'],use:'lipyard',
  note:'where the valley road from Longsong ends'});
 part({id:'sb.lip.gatehouse',name:'the Order\'s gatehouse: the rim gallery\'s east end, at the ramp\'s foot',zone:'Z9',kind:'gate',by:'order',state:'kept',shape:['box',P.rim.x1-100,P.rim.x1,P.rim.z0,P.rim.z1],y:ly,h:P.rim.y1-P.rim.y0,st:7,sheets:['S6'],note:'proposed'});
 part({id:'sb.rim',name:'the rim gallery',zone:'Z9',kind:'gallery',by:'ancient',state:'damaged',shape:['box',P.rim.x0,P.rim.x1-100,P.rim.z0,P.rim.z1],y:ly,h:P.rim.y1-P.rim.y0,st:7,sheets:['S6'],note:'empty'});
 part({id:'sb.pad',name:'the plateau\'s landing pad and its craft',zone:'Z9',kind:'pad',by:'ancient',state:'damaged',shape:['circ',P.pad.at[0],P.pad.at[2],P.pad.r],y:ly,sheets:['S6']});

 // ---- the elevator's wall landings: ledges on the face west of the bay ------------------------------------------------------
 const WX=-(D.BAY.w/2+12),wl=[[T[3].at[1],'W1\'s foot (from T3 by a girder bridge)'],[380,'between W1 and W2'],[N.y,null],[650,'between W3 and W4'],[780,'between W4 and W5'],[ly,null]];
 wl.forEach((q,i)=>{if(!q[1])return;const z=F.faceZ(WX,q[0]);part({id:'sb.wl.'+i,name:'the wall landing '+q[1],zone:i===0?'Z2':'Z7',kind:'landing',by:'xanadu',state:'reclaimed',shape:['box',WX-10,WX+10,z-4,z+12],y:q[0],h:4,sheets:['S7'],people:0});});
 const landAt=i=>i===2?'sb.nock.landing':i===5?'sb.lip.post':'sb.wl.'+i;

 // ---- the town (rings round the foot, south of the face) and the ground ---------------------------------------------------------
 const tc=[L.at[0],L.at[2]];
 part({id:'sb.town.inner',name:'the inner ring: courtyard houses, guildhalls, the bath',zone:'town',kind:'ring',by:'xanadu',state:'reclaimed',shape:['ring',tc[0],tc[1],200,330],y:0,sheets:['S0'],people:900});
 part({id:'sb.town.middle',name:'the middle ring: panel houses and rows, the granary, the craftsmen',zone:'town',kind:'ring',by:'xanadu',state:'reclaimed',shape:['ring',tc[0],tc[1],330,470],y:0,sheets:['S0'],people:1400});
 part({id:'sb.town.outer',name:'the outer ring: the poor',zone:'town',kind:'ring',by:'xanadu',state:'reclaimed',shape:['ring',tc[0],tc[1],470,600],y:0,sheets:['S0'],people:900});
 part({id:'sb.town.farms',name:'the farms beyond the rings',zone:'town',kind:'farms',by:'xanadu',state:'reclaimed',shape:['ring',tc[0],tc[1],600,900],y:0,sheets:['S0'],people:300,note:'crops owed to the foot\'s climate'});
 part({id:'sb.scree.w',name:'the scree west of the Spine',zone:'Z8',kind:'ground',by:'ancient',state:'damaged',shape:['box',-460,-340,40,160],y:0,sheets:['S0'],note:'the rope ways come down here, out of the town\'s sight'});

 // ---- the ways ----------------------------------------------------------------------------------------------------------------
 const door=(a,b,o)=>way(Object.assign({id:'way.'+a+'~'+b,kind:'door',a,b},o||{}));
 door('sb.plaza','sb.lobby');door('sb.plaza','sb.hall.serai');door('sb.plaza','sb.plaza.shrine');door('sb.plaza','sb.plaza.pavilion');door('sb.plaza','sb.plaza.gate');
 door('sb.hall.serai','sb.hall.yard');door('sb.lobby','sb.hall.yard');
 door('sb.lobby','sb.foot.w.gov');door('sb.foot.w.gov','sb.foot.w.customs');door('sb.foot.w.customs','sb.lobby');door('sb.foot.w.gov','sb.foot.w.barracks',{kind:'stair'});
 door('sb.lobby','sb.foot.e.guild');door('sb.foot.e.guild','sb.foot.e.sheds');door('sb.foot.e.guild','sb.foot.e.stores');door('sb.foot.e.sheds','sb.foot.e.shops',{kind:'stair'});
 door('sb.foot.e.shops','sb.foot.e.burned',{kind:'stair'});
 door('sb.lobby','sb.foot.back.store');door('sb.foot.back.store','sb.foot.back.homes',{kind:'stair'});
 door('sb.lobby','sb.lobby.core');door('sb.lobby','sb.lobby.stair');
 L.galleries.forEach((g,i)=>door(i?'sb.lobby.gal.'+(i-1):'sb.lobby.stair','sb.lobby.gal.'+i,{kind:'stair'}));
 door('sb.plaza.pavilion','sb.vaults',{kind:'stair',open:false,note:'the cisterns\' upper level only; the vaults below are flooded'});
 door('sb.plaza.gate','sb.town.inner',{kind:'road'});door('sb.town.inner','sb.town.middle',{kind:'road'});door('sb.town.middle','sb.town.outer',{kind:'road'});
 door('sb.town.outer','sb.town.farms',{kind:'road'});
 {const qp=RU.quiver.pieces;door('sb.town.middle',qp[0].id,{kind:'road',note:'the quarry spoke'});for(let i=1;i<qp.length;i++)door(qp[i-1].id,qp[i].id,{kind:'road'});}
 door('sb.town.middle','sb.scree.w',{kind:'road',note:'a goat track to the scree'});
 // the Spine: the great stair from the lobby to the first drum, stairs inside each run, stairs between the runs and the terraces
 const chain=[['sb.lobby.stair','sb.sp.6.1'],['sb.sp.6.1','sb.sp.6.0'],['sb.sp.6.0','sb.T1'],['sb.T1','sb.sp.5.1'],['sb.sp.5.1','sb.sp.5.0'],['sb.sp.5.0','sb.T2'],
  ['sb.T2','sb.sp.4.1'],['sb.sp.4.1','sb.sp.4.0'],['sb.sp.4.0','sb.T3'],['sb.T3','sb.T3.ring'],['sb.T3','sb.sp.3.1'],['sb.sp.3.1','sb.sp.3.0'],['sb.sp.3.0','sb.T4'],['sb.T4','sb.sp.2.1'],
  ['sb.sp.2.1','sb.sp.2.0'],['sb.sp.2.0','sb.T5']];
 const closed={'sb.T2~sb.sp.4.1':'sealed: the burned run','sb.sp.4.0~sb.T3':'sealed: the burned run','sb.T3~sb.sp.3.1':'barred by the garrison: the outcasts\' line'};
 for(const [a,b] of chain){const k=a+'~'+b;door(a,b,{kind:'stair',open:!closed[k],note:closed[k]||'',by:a.indexOf('sp.3')>0||a.indexOf('T4')>0||a.indexOf('sp.2')>0?'outcasts':'xanadu'});}
 // the lifts (PLAN.md section 5): L1 inside the core, L2 outside the Spine with a landing at T2, L3 the salvagers' (gated), and
 // the elevator's wall lifts W1 to W5 on the face west of the bay
 const lift=(id,a,b,y0,y1,x,z,o)=>way(Object.assign({id,kind:'lift',a,b,y0,y1,frame:[x,z],by:'xanadu'},o||{}));
 lift('L1','sb.lobby.core','sb.T1',0,T[1].at[1],L.at[0],L.at[2],{note:'inside the dead core shaft'});
 /* the lifts are placed so a car rises clear of every deck it passes and stops beside its landings (the owner, 2026-11-12:
    "move the elevators as necessary"; src/32-sb-walk.js walks them). CAR is a car's half width */
 const CAR=SB_CAR,faceMax=(x,y0,y1)=>{let z=-1e9;for(let y=y0;y<=y1;y+=5)z=Math.max(z,F.faceZ(x,y));return z;};
 /* L2: one frame for L2a and L2b, standing on T1's garden (outside its ring building), outside T3's dish (T2 and T3 share a
    centre, so no frame can stand on T2 and clear T3), clear of the drums above T1, of T3's rotor and its arm, of the girder
    bridges east to the galleries, and either clear of the Spine's pad off T2 or well inside it (then it stops on the pad, a stair
    from there up to T2), and of the pad's struts; of the frames that fit, the one with the shortest gangway to T3 */
 const L2F=(()=>{const c1=[T[1].at[0],T[1].at[2]],c3=[T[3].at[0],T[3].at[2]],dr=['sb.sp.5.1','sb.sp.5.0'].map(id=>P.drums.find(d=>d.id===id));
  const sd=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
  const pad=P.spinePad,rot=P.rotors.find(r=>r.terrace===T[3].id),pdT=pad?P.spine.terraces.find(t=>t.id===pad.terrace):null;
  const struts=pad?[-1,1].map(o=>[[pdT.at[0]+o*pdT.r*.5,pdT.at[2]+pdT.r*.8],[pad.at[0]+o*pad.r*.5,pad.at[2]]]):[];
  const bridges=[[[T[2].at[0]+T[2].r,T[2].at[2]],[180,F.faceZ(255,150)+5]],[[T[3].at[0]+T[3].r,T[3].at[2]],[180,F.faceZ(255,270)+5]]];
  let best=null;for(let x=-140;x<=100;x+=1)for(let z=20;z<=240;z+=1){const p=[x,z],d1=Math.hypot(x-c1[0],z-c1[1]),d3=Math.hypot(x-c3[0],z-c3[1]);
   if(d1<T[1].r-12+CAR+.8||d1>T[1].r-.5-CAR||d3<T[3].r+CAR+.5)continue;
   if(dr.some(d=>Math.hypot(x-d.at[0],z-d.at[2])<d.r+CAR+3))continue;
   if(rot&&(Math.hypot(x-rot.hub[0],z-rot.hub[2])<rot.r+CAR+3||sd(p,[rot.at[0],rot.at[2]],[rot.hub[0],rot.hub[2]])<CAR+4))continue;
   if(bridges.some(b=>sd(p,b[0],b[1])<CAR+3))continue;
   if(pad){const dp=Math.hypot(x-pad.at[0],z-pad.at[2]);if(!(dp<=pad.r-CAR*1.5||dp>=pad.r+CAR+1.5))continue;if(struts.some(s=>sd(p,s[0],s[1])<CAR+3))continue;}
   if(!best||d3<best.d3)best={p,d3};}return best.p;})();
 lift('L2a','sb.T1','sb.T2',T[1].at[1],T[2].at[1],L2F[0],L2F[1],{note:'on the outside of the Spine, on T1 garden; a girder gangway to T2'});
 lift('L2b','sb.T2','sb.T3',T[2].at[1],T[3].at[1],L2F[0],L2F[1],{note:'past the burned run; T3 by permit (the same frame as L2a)'});
 lift('L3','sb.T3','sb.T5',T[3].at[1],T[5].at[1],T[3].at[0]+T[3].r-6,T[3].at[2]+30,{gated:true,note:'the Salvagers\' Guild, guarded by the garrison'});
 way({id:'bridge.T3~sb.wl.0',kind:'bridge',a:'sb.T3',b:'sb.wl.0',pts:[[T[3].at[0]-T[3].r,T[3].at[2]],[WX,F.faceZ(WX,T[3].at[1])+4]],note:'a girder bridge to W1\'s foot'});
 /* the wall lifts alternate 6 m either side of WX, so two cars meeting at a landing do not overlap; each stands 1.5 m in front
    of the face over its whole run (the face batters back as it rises), and the landing ledges grow to hold the cars */
 for(let i=0;i<5;i++){const x=WX+(i%2?-6:6),y0=wl[i][0],y1=wl[i+1][0];lift('W'+(i+1),landAt(i),landAt(i+1),y0,y1,x,faceMax(x,y0,y1+4)+CAR+1.5,{elevator:true});}
 for(const p of parts){if(p.kind!=='landing'||p.id==='sb.nock.landing')continue;const s=p.shape;
  for(const w of ways)if(w.kind==='lift'&&(w.a===p.id||w.b===p.id)){const f=w.frame;s[1]=Math.min(s[1],f[0]-CAR-.5);s[2]=Math.max(s[2],f[0]+CAR+.5);s[3]=Math.min(s[3],f[1]-CAR-.5);s[4]=Math.max(s[4],f[1]+CAR+.5);}}
 way({id:'bridge.T2~sb.gal.e.0',kind:'bridge',a:'sb.T2',b:'sb.gal.e.0',pts:[[T[2].at[0]+T[2].r,T[2].at[2]],[180,F.faceZ(255,150)+5]]});
 way({id:'bridge.T3~sb.gal.e.1',kind:'bridge',a:'sb.T3',b:'sb.gal.e.1',pts:[[T[3].at[0]+T[3].r,T[3].at[2]],[180,F.faceZ(255,270)+5]],note:'a girder bridge and stair'});
 // the outcasts' rope ways: from the scree up the face to their drums
 way({id:'rope.scree~sb.sp.3.1',kind:'rope',a:'sb.scree.w',b:'sb.sp.3.1',by:'outcasts',note:'ropes, ladders, hauled baskets (the owner, 2026-11-11)'});
 // the top: the post, the yard, the valley road; the Order's ramp (gated by the Order) to its house, and its stair down to the Nock
 door('sb.lip.post','sb.lip.yard');way({id:'road.valley',kind:'road',a:'sb.lip.yard',b:'world:valley-road',note:'the valley road from Longsong'});
 door('sb.lip.yard','sb.lip.gatehouse',{kind:'road',note:'along the lip'});
 way({id:'ramp.order',kind:'ramp',a:'sb.lip.gatehouse',b:'sb.tower.order',by:'order',gated:true,note:'the arc ramp; the Order\'s gate is shut to all but its own'});
 way({id:'stair.order~nock',kind:'stair',a:'sb.tower.order',b:'sb.nock.c',by:'order',note:'down through the tower to the Nock'});
 way({id:'seal.order~low',kind:'stair',a:'sb.tower.order',b:'sb.tower.low',by:'order',open:false,note:'sealed'});
 door('sb.nock.c','sb.nock.pad',{by:'order'});door('sb.nock.c','sb.nock.shed',{by:'order'});door('sb.nock.c','sb.nock.mast',{by:'order'});
 way({id:'wall.nock',kind:'wall',a:'sb.nock.landing',b:'sb.nock.c',open:false,note:'walled off'});
 door('sb.nock.landing','sb.nock.w',{note:'the wing beyond the landing, stripped'});
 door('sb.plaza','world:xanadu-road',{kind:'road',note:'the road down to the Xanadu floor'});

 return {frame:{lip:ly,top:F.top,face:'z = faceZ(x, y)'},terraces:Object.fromEntries(Object.entries(T).map(([i,t])=>[i,{src:t.id,y:t.at[1],at:t.at,r:t.r}])),
  wallX:WX,parts,ways,people:SB_CENSUS.people,m2:45,bay:{w:D.BAY.w,d:D.BAY.d},lobby:{at:L.at,r:L.r},hall:{x0:H.x0,x1:H.x1,z0:H.z0,z1:H.z1,cut},
  plaza:{x0:pz.x0,x1:pz.x1,z0:pz.z0,z1:pz.z1},nock:{y:N.y,wx:N.wx,zc:N.zc},stays:P.stays.filter(s=>RU.gone.indexOf(s.id)<0&&s.a!=='mast').map(s=>({id:s.id,a:s.a,b:s.b}))};})();return SB_LAYOUT_;}
