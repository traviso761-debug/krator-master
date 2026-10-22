// ================================================================= THE PODIUM — the Podium kept by the True Heirs (deltas)
// The Eternal State's retrofit of the Podium (LORE.md §6.19; kits/eternian/palace/BLUEPRINT.md is the program; this is
// the part of it a passer-by sees). A live/work arcology for a hundred thousand, kept, not patched, by a caste of about
// a thousand, and made a forbidden city on the Qing pattern turned on end: HEIGHT IS RANK. The ladder of thresholds the
// Forbidden City lays out south to north is laid out here from the moat to the crown:
//
//   the moat and the wall    the Outer City's edge; the six stairs cross the moat between pylons
//   the podium               the Household Department below, the Halls of Petition (the talking heads) above, the
//                            Outer Court's empty terraces on top
//   the six stairs' heads    the Outer Court: the three great halls in a triangle (Supreme, Middle and Preserved
//                            Accord) and three small doors, each kept for one rite
//   staircase levels 1-3     from the Gate of the Closed Eye: the Wardens' Council, the Hall of the Screen, Seals,
//                            the Hall of the Call, Abstinence, Ancestors, Records: where the State is actually run
//   levels 4-6               the lineage courts of the four metals
//   levels 7-9               the Palace of Tranquil Longevity: the Withdrawn's, blind with onyx; the Sealed House
//   the crown                the colossus: a titanium face, eyes closed, looking south over the capital
//
// [G data]: no three.js, no DOM. PODIUM.podium(P) returns {set: {id: fields}, add: [records], state}; PODIUM.apply merges
// it. Every number is KRAND-hashed from (seed, salt, index), and the dressing is records the drawing reads.
// This file is the Eternians', not the Ancients': it moves to kits/eternian at its P0 (kits/eternian/PLAN.md §7).
PODIUM.METAL={gold:0xd8b24a,silver:0xc9ccd2,bronze:0x9c7a3c,gunmetal:0x4a5058,titanium:0x9aa1a8,stone:0xd8d0bf};
PODIUM.RANKS=['gold','silver','bronze','gunmetal'];

// the program: what each gate and bay is, by its id (BLUEPRINT.md, "The ladder in one table")
PODIUM.PROGRAM={
 // the six entrances. The three great arches are the Outer Court's three great halls, set in a triangle instead of a
 // line; the three small doors between them are each kept for one rite
 'podium.gate.0':{name:'The Hall of Supreme Accord',role:'accession',level:'outer',note:'on the axis. An Heir comes up the Imperial Way and in by it twice: at accession, and at withdrawal, to be carved. Edicts are read from its landing; its staircase climbs to the State'},
 'podium.gate.2':{name:'The Hall of Middle Accord',role:'robing',level:'outer',note:"north-west, toward Farport: an Heir is robed and waits in it before a rite, and the sea's tribute is received in it"},
 'podium.gate.4':{name:'The Hall of Preserved Accord',role:'banquet',level:'outer',note:"north-east: the banquets, and the palace examination's last paper. Once a year the Heirs go out by it to plough the first furrow"},
 'podium.gate.1':{name:'The Gate of the Valley',role:'expedition',level:'outer',note:'the Restorers go out by it for the Valley, south, and come back by it; those who do not come back are veiled in the gallery'},
 'podium.gate.3':{name:'The North Gate',role:'departure',level:'outer',note:'the dead leave by it, and it opens for nothing else'},
 'podium.gate.5':{name:'The Gate of Petitions',role:'petition',level:'outer',note:"the human city's: the examination's graduates are named in it, and petitioners climb to it to address the faces"}};
// the staircases' arches by height, three to a level: levels 1-3 the State, 4-6 the lineage courts, 7-9 the Withdrawn
(function(){const L=[
 ['The Gate of the Closed Eye','threshold',"the line between the Outer and Inner Courts; the Wardens hold the morning audience in it"],
 ['The Council of Wardens','council',"the Grand Council's small rooms: the State is run from here"],
 ['The Hall of the Screen','regent','a proxy in a white mask speaks for a Withdrawn Elder from behind the onyx'],
 ['The Hall of Seals','seals',null],
 ['The Hall of the Call','call',"the caste's own rite; the visors; a woken terminal"],
 ['The Hall of Abstinence','fast','the fast before the Call'],
 ['The Hall of Ancestors','ancestors',"the gallery of heads, the living's among them; the veiled"],
 ['The Hall of Records','records',"the State's record of the present beside the Heirs' of the Ancients"],
 ['The Offices of the Valley and the Sea','offices',"the salvage licences, the Restorers' fitting out, Farport's visitors and what is kept of them"]];
 for(let n=0;n<9;n++)PODIUM.PROGRAM['podium.st.'+n+'.bay']={name:L[n][0],role:L[n][1],level:'inner',note:L[n][2]};
 const ord=['First','Second','Third'];
 for(let n=9;n<18;n++){const m=PODIUM.RANKS[(n-9)%4],c=Math.floor((n-9)/4);
  PODIUM.PROGRAM['podium.st.'+n+'.bay']={name:'The '+ord[Math.min(2,c)]+' Court of '+m[0].toUpperCase()+m.slice(1),role:'lineage',level:'inner',metal:m};}
 const W=[['The Gate of Tranquil Longevity','threshold',"the Withdrawn's palace begins"],['The Hall of the Withdrawn','audience','the whole court in miniature, for an audience nobody attends'],
  ['A Pavilion of the Withdrawn','withdrawn',null],['The Sealed House','sealed','the house nobody names'],['The Sealed House, upper','sealed',null],
  ['A Pavilion of the Withdrawn','withdrawn',null],['A Pavilion of the Withdrawn','withdrawn',null],['A Pavilion of the Withdrawn','withdrawn',null],
  ['The Pavilion of the Last Light','withdrawn','the highest arch']];
 for(let n=18;n<27;n++)PODIUM.PROGRAM['podium.st.'+n+'.bay']={name:W[n-18][0],role:W[n-18][1],level:'withdrawn',note:W[n-18][2]};})();

PODIUM.podium=function(P){const D=PODIUM.DIM,S=P.seed+7,TAU=2*Math.PI,set={},add=[];
 const metalC=m=>PODIUM.METAL[m];
 const rank=(a,b)=>PODIUM.RANKS[Math.floor(PODIUM.u(S,a,b)*4)%4];
 const head=(id,at,face,h,metal,o)=>{const r={id:id,kind:'head',at:at,face:face,h:h,metal:metal,color:metalC(metal),eyes:'closed'};
  if(o)Object.assign(r,o);add.push(r);return r;};
 // ---- the balconies: bronze rails; the Machine Talkers have woken about a fifth of the cyan runs under them
 for(const B of P.bays)if(B.balc)set[B.id]={rail:'bronze',alive:.2};
 for(const R of P.ramps)set[R.id]={rail:'bronze',alive:.2};
 // ---- the gates: bronze doors with a face, onyx in the arch over them, banners on the pilasters, the faces flanking
 for(const B of P.gates){const g=PODIUM.PROGRAM[B.id]||{},south=B.k===0;
  set[B.id]=Object.assign(B.great?{back:'onyx',tracery:'gothic',door:{w:Math.min(14,B.Ra*.5),h:Math.min(20,(B.ys-B.yb)*.45)},banners:true}
   :{back:'doors',head:'onyx',tracery:'gothic',banners:true},g);
  if(B.great)head(B.id+'.door.face',PODIUM.bayPt(B,0,(B.yb-B.ys)+Math.min(20,(B.ys-B.yb)*.45)+.6,-B.depth+.9),PODIUM.out(B.thc),Math.min(9,B.Ra*.3),south?'gold':'bronze',{relief:.35});
  else head(B.id+'.door.face',PODIUM.bayPt(B,0,(B.yb-B.ys)*.32,-B.depth+.9),PODIUM.out(B.thc),B.Ra*.55,'bronze',{relief:.35});
  head(B.id+'.key',PODIUM.bayPt(B,0,B.Ra+B.frame*.15,B.proj+.4),PODIUM.out(B.thc),Math.max(5,B.Ra*.34),south?'gold':rank(31,B.k));
  for(const s of [-1,1]){head(B.id+'.jamb.'+(s<0?'w':'e'),PODIUM.bayPt(B,s*(B.Ra+B.frame*.5),.2,B.proj+.3),PODIUM.out(B.thc),3.4,south?'gold':'bronze');
   add.push({id:B.id+'.banner.'+(s<0?'w':'e'),kind:'banner',at:PODIUM.bayPt(B,s*(B.Ra+B.frame*.5),-3.4,B.proj+.25),face:PODIUM.out(B.thc+s*.004),
    w:Math.min(7,B.frame*2.2),h:(B.ys-B.yb)*.62});}}
 // the Ancients' terminals at the gates: kept in bronze surrounds; one in four answers deranged
 for(const T of P.terminals)set[T.id]={frame:'bronze',deranged:PODIUM.u(S,41,T.gate,T.side+1)<.25};
 // ---- the spiral's bays: onyx and Gothic tracery where the glass was lost; the glass kept where it survived; the
 // Sealed House blind behind pierced bronze. A face over every arch in its lineage's metal; heads at the jambs.
 for(const B of P.bays){if(B.kind==='gate')continue;const g=PODIUM.PROGRAM[B.id]||{},lvl=g.level||(B.turn===2?'withdrawn':'inner');
  // the glass survived in some of the lineage courts; every hall of the State is onyx behind bronze
  const sealed=g.role==='sealed',keepGlass=g.role==='lineage'&&PODIUM.u(S,51,B.st)<.5;
  const metal=g.metal||(lvl==='withdrawn'?(B.st%4<2?'silver':'gunmetal'):B.turn===0?'bronze':rank(52,B.st));
  // the alternates (the owner, 2026-10-20: the extra takes appear on different instances of one type): each bay's
  // band takes one of the three circuit-maze takes and each sealed bay one of the two pierced screens, by its own hash
  set[B.id]=Object.assign(set[B.id]||{},{back:sealed?'bronze':keepGlass?'plate':lvl==='withdrawn'?'alabaster':'onyx',tracery:sealed?'screen':keepGlass?null:'gothic',
   lit:sealed?0:lvl==='withdrawn'?.25:.6,metal:metal,level:lvl,maze:'abc'[Math.floor(PODIUM.u(S,58,B.st)*3)],screen:'ab'[Math.floor(PODIUM.u(S,59,B.st)*2)]},g);
  head(B.id+'.key',PODIUM.bayPt(B,0,B.Ra+B.frame*.15,B.proj+.4),PODIUM.out(B.thc),Math.max(3.6,Math.min(8,B.Ra*.32)),metal,
   sealed?{veiled:true}:null);
  for(const s of [-1,1])head(B.id+'.jamb.'+(s<0?'w':'e'),PODIUM.bayPt(B,s*(B.Ra+B.frame*.5),.2,B.proj+.3),PODIUM.out(B.thc),2.6,metal,
   sealed?{veiled:true}:null);
  // inside: the courts are kept almost empty, because there are only a thousand Heirs
  if(lvl==='inner'&&g.role==='lineage')add.push({id:B.id+'.tree',kind:'tree',at:PODIUM.bayPt(B,0,B.yb-B.ys,-B.depth+4),h:7,formal:true});
  if(g.role!=='ancestors'&&g.role!=='sealed'&&lvl!=='withdrawn')head(B.id+'.ancestor',PODIUM.bayPt(B,0,B.yb-B.ys+2.4,-B.depth+2.2),PODIUM.out(B.thc),3,metal,{plinth:2.4});
  if(lvl==='inner'&&PODIUM.u(S,53,B.st)<.6)for(let j=0;j<1+(B.st%3===0?1:0);j++)
   add.push({id:B.id+'.fig.'+j,kind:'figure',mask:g.role==='regent'||PODIUM.u(S,54,B.st,j)<.3,
    at:PODIUM.bayPt(B,PODIUM.rng(S,55,B.st,j,-B.Ra*.5,B.Ra*.5),B.yb-B.ys,-B.depth*.5),ry:B.thc+Math.PI});
  if(g.role==='regent')add.push({id:B.id+'.face',kind:'terminal',at:PODIUM.bayPt(B,-B.Ra*.6,(B.yb-B.ys)*.62,-B.depth+.6),face:PODIUM.out(B.thc),size:5,v:2,frame:'bronze',deranged:false});
  if(g.role==='call')add.push({id:B.id+'.face',kind:'terminal',at:PODIUM.bayPt(B,0,(B.yb-B.ys)*.5,-B.depth+.6),face:PODIUM.out(B.thc),size:Math.min(14,B.Ra*.9),v:3,frame:'bronze',deranged:true});
  // the Hall of Ancestors: the back wall a gallery of heads in rows, by rank; the veiled are the kin who went into
  // the Valley, and the Heirs know whose they are
  if(g.role==='ancestors'){const rows=Math.floor((B.ys-B.yb-2)/3.2),cols=Math.floor((2*B.Ra-4)/2.4);
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const s=-B.Ra+2+(c+.5)*(2*B.Ra-4)/cols,n=r*cols+c;
    head(B.id+'.gal.'+n,PODIUM.bayPt(B,s,B.yb-B.ys+1+r*3.2,-B.depth+1.1),PODIUM.out(B.thc),1.9,r===0?'stone':rank(56,n),
     PODIUM.u(S,57,n)<.12?{veiled:true}:null);}}}
 // ---- the ridges: the Spirit Ways. Heads on plinths along both parapets, facing across the stair; down the middle,
 // the Face Stone: faces carved lying in the slab, the Imperial Way's in gold, that only an Heir is carried over
 for(const R of P.ridges){const south=R.k===0;set[R.id]={face:south?'gold':'bronze',spirit:true};
  for(let j=0;j<7;j++){const s=.14+j*.11,hw=PODIUM.ridgeHW(R,s);
   for(const sd of [-1,1])head(R.id+'.spirit.'+j+(sd<0?'w':'e'),PODIUM.ridgeAt(R,s,sd*(hw-R.park*.5),1.6),
    [sd*Math.sin(R.a),0,-sd*Math.cos(R.a)],4.2,south?'gold':PODIUM.RANKS[(j+R.k)%4],{plinth:2.2});}
  for(let j=0;j<6;j++){const s=.1+j*.15,w=2*PODIUM.ridgeHW(R,s)*R.slab;
   add.push({id:R.id+'.stone.'+j,kind:'facestone',ridge:R.k,s:s,at:PODIUM.ridgeAt(R,s,0,.35),w:w,h:w*1.25,metal:south?'gold':'bronze',
    color:metalC(south?'gold':'bronze')});}
  // the ridge's gate on the moat: two stepped pylons and a lintel, a head on each
  add.push({id:R.id+'.pylons',kind:'pylons',ridge:R.k,s:.93,h:30,metal:south?'gold':'bronze'});}
 // ---- the podium: the wall on the lowest deck's edge, the six notch pavilions (the corner towers, here in the
 // re-entrant corners because the points carry the stairs), the moat round it all, the Halls of Petition's faces
 add.push({id:'podium.wall',kind:'wall',tier:0,h:7,t:3,inset:3});
 add.push({id:'podium.moat',kind:'moat',r0:18,r1:50});
 for(let k=0;k<6;k++){const th=D.TIP0+Math.PI/6+k*Math.PI/3,r=PODIUM.tierR(0,th)-16,metal=PODIUM.RANKS[k%4];
  add.push({id:'podium.pavilion.'+k,kind:'pavilion',at:[r*Math.cos(th),D.TIERS[0][1],r*Math.sin(th)],th:th,metal:metal,color:metalC(metal)});
  for(const s of [-1,1]){const t2=th+s*.05,r1=PODIUM.tierR(1,t2)+.4;
   add.push({id:'podium.petition.'+k+(s<0?'w':'e'),kind:'terminal',at:[r1*Math.cos(t2),27,r1*Math.sin(t2)],face:PODIUM.out(t2),size:6,
    v:Math.floor(PODIUM.u(S,71,k,s+1)*8),frame:'bronze',deranged:PODIUM.u(S,72,k,s+1)<.2});
   add.push({id:'podium.pavilion.'+k+'.banner.'+(s<0?'w':'e'),kind:'banner',at:[(r+8)*Math.cos(th+s*.035),D.TIERS[0][1]+18,(r+8)*Math.sin(th+s*.035)],
    face:PODIUM.out(th),w:4,h:12});}}
 // the Outer Court's terraces: kept empty, formal rows of trees on the top deck only, and the household crossing them
 {const y=D.TIERS[2][1],n=72;for(let i=0;i<n;i++){const th=(i+.5)/n*TAU,ro=PODIUM.tierR(2,th),ri=PODIUM.tierR(3,th);if(ro-ri<14)continue;
   if(P.ridges.some(R=>Math.abs(Math.sin(th-R.a))*ro<PODIUM.ridgeHW(R,.4)+8&&Math.cos(th-R.a)>0))continue;
   const r=ri+(ro-ri)*.5;add.push({id:'podium.tree.court.'+i,kind:'tree',at:[r*Math.cos(th),y,r*Math.sin(th)],h:9,formal:true});}
  for(let i=0;i<24;i++){const th=PODIUM.u(S,81,i)*TAU,ro=PODIUM.tierR(2,th),ri=PODIUM.tierR(3,th),r=ri+(ro-ri)*PODIUM.rng(S,82,i,0,.2,.8);
   add.push({id:'podium.fig.court.'+i,kind:'figure',mask:PODIUM.u(S,83,i)<.2,at:[r*Math.cos(th),y,r*Math.sin(th)],ry:PODIUM.u(S,84,i)*TAU});}}
 // ---- the crown: the colossus on the south rim, the plinth under it, a ring of faceted heads on the rim's piers
 {const C=P.crown,rr=C.r-C.rimW-16,a=D.TIP0;
  set[C.id]={colossus:true,lantern:'cyan'};
  add.push({id:'podium.colossus.plinth',kind:'plinth',at:[rr*Math.cos(a),C.y+C.rim,rr*Math.sin(a)],th:a,w:40,d:30,h:5});
  head('podium.colossus',[rr*Math.cos(a),C.y+C.rim+5,rr*Math.sin(a)],PODIUM.out(a),44,'titanium',{crown:true});
  for(let k=1;k<12;k++){const t=a+k*TAU/12;head('podium.crown.head.'+k,PODIUM.wallPt(t,C.y+C.rim,-3),PODIUM.out(t),6,k%2?'silver':'gunmetal');}}
 return {set:set,add:add,state:'kept'};};
