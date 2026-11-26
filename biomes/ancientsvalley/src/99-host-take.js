// ================================================================= HOST — the station's views, inspector words and checks, handed to core/host
// [web] The camera, the loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the page has. The
// views are the station's (STAGE.views(), made after the build). The kit's own checks run under verify.py --assert, each with a broken
// input that must fail (hostNegatives): the brief's rule first (PLAN.md section 1: the hand of man in every view).
const VIEWS=(function(){const V=STAGE.views?STAGE.views():{},out={};for(const k in V)out[k]=V[k].cam||V[k];return out;})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y==null?0:r.y)-3&&p.y<=(r.y==null?0:r.y)+(r.h==null?40:r.h)+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=lab==='ground'?STAGE.floorLabel(p.x,p.z,p.y):isItem?lab+(best?'  (in '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const F=STAGE.F,fe=F.feral(p.x,p.z),ta=F.taint(p.x,p.z),sc=F.scar(p.x,p.z),de=F.density(p.x,p.z);
 return name+'\nzone '+F.zone(p.x,p.z)+' · density '+de.toFixed(2)+' · feral '+fe.toFixed(2)+' · taint '+ta.toFixed(2)+(sc>0?' · scar '+sc.toFixed(2):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+STAGE.base).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets
const BUDGET={showcase:{tris:STAGE.budgetTris==null?9000000:STAGE.budgetTris,calls:STAGE.budgetCalls==null?700:STAGE.budgetCalls,rendered:7500000},
 cls:{pass:8000000,host:1200000},   /* the trees' pass 7 M -> 8 M on 2026-11-09: the roof perches copy a wrapped tree's span onto the ruins' tops (7.31 M on the RTX lane) */
 type:{'lowlands/trees':'pass','lowlands/floor':'pass','nwlow/trees':'pass','nwlow/floor':'pass','host':'host'}};
// ---------------------------------------------------------------- the kit's own checks (verify.py --assert)
const HCHK={
 // the brief's rule: from every view's eye, an artificial structure stands within 1.5 km in the direction looked (a tower's or a line's record)
 handOfMan(views,recs){const bad=[];for(const k in views){const v=views[k],dx=v[3]-v[0],dz=v[5]-v[2],l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;
   const ok=recs.some(r=>(r.kind==='tower'||r.kind==='line')&&(()=>{const ex=r.x-v[0],ez=r.z-v[2],d=Math.hypot(ex,ez);return d<Math.max(1500,r.r)&&(ex*fx+ez*fz)/Math.max(d,1)>.2||d<r.r;})());
   if(!ok)bad.push(k);}return{ok:!bad.length,detail:bad.length?'no structure ahead in: '+bad.join('; '):Object.keys(views).length+' views, each with a structure in reach ahead'};},
 // every tower stands on dry ground on its plinth (the drowned city is the lake's and comes later), and none on dead ground
 standing(T){let wet=0,dead=0;for(const t of T){if(t.y<STAGE.lakeY+1.5)wet++;if(STAGE.F.scar(t.x,t.z)>.5)dead++;}return{ok:T.length>60&&!wet&&!dead,detail:T.length+' towers; '+wet+' under the lake, '+dead+' on dead ground'};},
 // the ruin share (PLAN-ANOMALIES.md 13; the owner, 2026-11-04: far too intact at first): intact towers 5-15% of the plan, and under half standing tall at all
 ruinShare(T){const n=T.length,i=T.filter(t=>t.state==='intact').length,tall=T.filter(t=>t.state==='intact'||t.state==='gutted'||t.state==='crown').length,f=i/Math.max(n,1);return{ok:n>60&&f>=.01&&f<=.15&&tall/Math.max(n,1)<.35,detail:Math.round(f*100)+'% intact, '+Math.round(tall/Math.max(n,1)*100)+'% standing tall of '+n};},
 // the war damage on the ground: the craters are there, each a scar with nothing standing in it
 craters(C,T){let inside=0;for(const t of T)for(const c of C)if(Math.hypot(t.x-c.x,t.z-c.z)<c.r)inside++;return{ok:C.length>=8&&!inside,detail:C.length+' craters, '+inside+' towers standing in one'};},
 // the lean: a leaning tower leans no more than 5 degrees (further and the shell's trace would leave its pad), none that stands whole or lies fallen
 lean(T){let bad=0,n=0;for(const t of T){if(t.lean){n++;if(t.lean>5.01||t.state==='intact'||t.state==='fallen')bad++;}}return{ok:n>20&&!bad,detail:n+' towers lean, '+bad+' wrongly'};},
 // the grid runs between the buildings (the owner, 2026-11-08): no plinth's centre on a street, and the street under no plinth
 /* the kerb lines (the owner, 2026-11-09; 41 AV.kerbPlace): most towers front a street, their plinths 3 m behind its pavement, and no plinth reaches into
    a roadway or a pavement (the plinth's extent across each of the cell's half lines against the line's half width plus its pavement, inside the network) */
 /* the oily rain (the owner, 2026-11-09: a weather mode, oily rain over the polluted portions; 89x): the mode offered, its curtains standing over the
    foul half only, the wall off in any other mode, the dose dirty under it and clean elsewhere */
 radiation(Z){if(!Z||!Z.zones||!Z.zones.length)return{ok:false,detail:'no radiation zones'};const F=STAGE.F,on=Z.zones.filter(z=>F.scar(z.x,z.z)>.3).length,n=Z.n?Z.n():0;
  return{ok:on===Z.zones.length&&n>0,detail:Z.zones.length+' zones ('+Z.zones.map(z=>z.id+' r '+z.r).join(', ')+'), '+on+' on a scar; '+n+' materials glow'};},
 oilRain(O){if(!O||!O.R)return{ok:false,detail:'no oily rain'};const R=O.R,F=STAGE.F,cells=R.cells||[];let foul=0;cells.forEach(q=>{if(O.field(q.x,q.z)>=.3&&F.foul(q.x,q.z)>.45)foul++;});
  const W=ATMOS.W,offered=W.MODES.indexOf(O.mode)>=0,off=W.mode===O.mode?true:R.off;
  const ok=offered&&cells.length>=30&&foul===cells.length&&off;return{ok,detail:(offered?'offered':'not offered')+'; '+cells.length+' curtains, '+foul+' over the foul half'+(off?'':'; the wall stands in mode '+W.mode)};},
 /* the cosmetic distortions (89y): the three records registered, the warp installed on the scene's materials, the bend and the time pocket switched on
    inside their zones and off outside (the state read at each zone's centre and 5 km away) */
 anomalies(A){if(!A||!A.records||!A.records.length)return{ok:false,detail:'no anomaly records'};const r=A.warp?A.warp.report():null,n=r?r.warped:0,kinds=A.records.map(a=>a.kind).join(', ');
  return{ok:n>=40&&A.records.length>=3,detail:A.records.length+' records ('+kinds+'), '+n+' programs warped'+(r?', '+r.left.length+' left out':'')};},
 /* the House (41c, 75): the hut and the spaces registered, the walker's registry holding the House's floors, and the hut's door leading onto a floor the
    walker can stand on (the crossing run on the records, then the walker's own floor query at the landing) */
 house(S){if(!S||!S.H)return{ok:false,detail:'no House'};const H=S.H,D=H.door,a=[D.x,D.y,D.z-2],b=[D.x,D.y,D.z-1.45],st={},r=AV.houseCross(H,a,b,st);
  const land=r?[b[0]+r.d[0],b[1]+r.d[1],b[2]+r.d[2]]:null,f=land?KWALK.floorsAt(land[0],land[2]+.5):[],onF=f.some(q=>Math.abs(q[0]-land[1])<.05);
  return{ok:!!r&&r.id==='in'&&onF&&S.blocks>20,detail:H.spaces.length+' spaces, '+H.thresholds.length+' thresholds, '+S.blocks+' wall blocks; the hut door '+(onF?'lands on the foyer floor':'lands on nothing')+'; the west hallway '+H.tape.toFixed(2)+' m'};},
 /* the impostors hide where their tower stands as a hero or a shell (2026-11-09: the lookup by position never matched, so every billboard stood inside its
    tower): every impostor instance finds its tower (key) and none is drawn whose tower is a hero, a shell or fallen */
 impHidden(key){if(!AVC.impMeshes)return{ok:false,detail:'no impostors'};const G=AVC.tierGroups,ex=[];let n=0,lost=0,shown=0;
  AVC.impMeshes.forEach(o=>{const A=o.instanceMatrix.array,F=o.userData.full;for(let i=0;i<F.length/16;i++){n++;const t=AVC.towerAt[key(F[i*16+12],F[i*16+14])];if(!t){lost++;continue;}
   const drawn=A[i*16]!==0||A[i*16+5]!==0||A[i*16+10]!==0,f=Math.min(1,16/Math.max(1,avH(t.skey||t.key))),heap=t.state==='fallen'&&!G.has(t.id)&&!(t.shelled&&t.d<AV_IMPFAR)&&Math.abs(A[i*16+5]-F[i*16+5]*f)<=1e-3*Math.abs(F[i*16+5])+1e-6;
   if(drawn&&(t.shell||G.has(t.id)||(t.state==='fallen'&&!heap))){shown++;if(ex.length<4)ex.push(t.family+' '+t.state+' '+Math.round(t.d)+' m'+(t.shell?' shell':'')+(G.has(t.id)?' hero':''));}}});   /* a fallen tower past its rubble stands as its billboard squashed to the heap */
  return{ok:n>0&&!lost&&!shown,detail:n+' impostor instances, '+lost+' matched to no tower, '+shown+' drawn over a hero, a shell or a heap'+(ex.length?' ('+ex.join('; ')+')':'')};},
 kerb(T){const L=STAGE.lattice,p=L.pitch,th=Math.atan2(L.s,L.c),R=STAGE.R-110;let on=0,bad=0,ex0=null,gaps=[];
  for(const t of T){if(t.kerb)on++;if(t.rx==null)continue;const lx=t.x*L.c+t.z*L.s,lz=-t.x*L.s+t.z*L.c,ang=t.yaw-th,ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang)),ex=[ca*t.rx+sa*t.rz,sa*t.rx+ca*t.rz];
   [lx,lz].forEach((v,a)=>{if(Math.hypot(t.x,t.z)>R)return;const k=Math.round(v/p-.5),d=Math.abs(v-(k+.5)*p),av=((k%3)+3)%3===1,hw=av?16.5:9,g=d-ex[a]-hw;if(Math.abs((k+.5)*p)>STAGE.R-140)return;if(g<-.5){bad++;if(!ex0)ex0=t.id+' '+g.toFixed(1)+' m';}else if(t.kerb&&g<10)gaps.push(g);});}
  const share=T.length?on/T.length:0,mg=gaps.length?gaps.reduce((s,v)=>s+v,0)/gaps.length:0;
  return{ok:share>=.6&&!bad,detail:on+' of '+T.length+' towers on a kerb ('+Math.round(share*100)+'%), plinths a mean '+mg.toFixed(1)+' m behind the pavement; '+bad+' reach into a street'+(STAGE.plan.kerbDropped?' ('+STAGE.plan.kerbDropped+' not built: no room off the street)':'')+(ex0?' ('+ex0+')':'')};},
 grid(T){let on=0;for(const t of T)if(STAGE.streetK(t.x,t.z)>.05)on++;return{ok:T.length>60&&!on,detail:T.length+' towers, '+on+' standing on a street'};},
 lamps(L){const up=L.filter(l=>l.state==='up').length;return{ok:L.length>100&&up>L.length*.3&&up<L.length*.7,detail:L.length+' lamp standards, '+up+' standing'};},
 // the ruined vehicles (41b, 73): at least 150 records, none on a plinth or under the lake, most of those on scorched ground burnt
 wrecks(W){let plinth=0,wet=0,hot=0,burnt=0;for(const w of W){if(STAGE.built(w.x,w.z)>.5)plinth++;if(w.y<STAGE.lakeY+1)wet++;if(STAGE.scorch(w.x,w.z)>.6){hot++;if(w.state==='burnt')burnt++;}}
  return{ok:W.length>=150&&!plinth&&!wet&&(hot<8||burnt>hot*.6),detail:W.length+' wrecks, '+plinth+' on a plinth, '+wet+' under the lake; '+burnt+' of '+hot+' on scorched ground burnt'};},
 // the forest went feral: the read-in trees were grown, and the taint's tint reached the baked foliage
 feral(W,tinted){return{ok:W.trees>50&&W.grown>20&&tinted>0,detail:W.trees+' read-in trees wrapped, '+W.grown+' grown, '+W.floor+' floor plants grown, '+W.dropped+' not this station\'s; '+tinted+' materials tinted'};},
 // no tree stands on a street, a plinth or dead ground
 // (the kits decide a foot on the mask's probability, so a tree can land where the mask is half: two in a hundred is the allowance). The streets are
 // overgrown by design (the owner, 2026-11-08: a destroyed, overgrown grid), so a tree on one is counted apart and allowed to a sixth of the forest
 clear(recs){let bad=0,st=0,n=0;for(const r of recs){if(r.kind!=='tree')continue;n++;if(STAGE.built(r.x,r.z)>.8||STAGE.F.scar(r.x,r.z)>.8)bad++;else if(STAGE.street(r.x,r.z)>.8)st++;}return{ok:n>50&&bad<=n*.02&&st<=n/6,detail:n+' trees, '+bad+' on a plinth or a scar, '+st+' on a street (overgrown)'};},
 // the lines: the viaduct's deck never dips under the lake and every pier reaches the ground
 // the steam on the water, the keepers on their rounds (each round four corners on dry ground), the halves (the owner, 2026-11-08: about half
 // the dry land wild, the forest mask far denser there than in the foul half)
 steam(S){return{ok:S.banks>=20&&S.plumes>=1,detail:S.banks+' banks of mist, '+S.plumes+' plumes of steam'};},
 keepers(K){let bad=0;for(const k of K){if(!k.route||k.route.length<4)bad++;else for(const p of k.route)if(terrainH(p[0],p[1])<STAGE.lakeY+2)bad++;}return{ok:K.length>=3&&!bad,detail:K.length+' keepers on their rounds, '+bad+' faults'};},
 halves(F,forest){let n=0,hi=0,fw=0,ff=0,nw=0,nf=0;for(let x=-2900;x<=2900;x+=100)for(let z=-2900;z<=2900;z+=100){if(Math.hypot(x,z)>STAGE.R||terrainH(x,z)<STAGE.lakeY+.5)continue;n++;if(F.wild(x,z)>.5){hi++;fw+=forest(x,z);nw++;}else{ff+=forest(x,z);nf++;}}
  const s=n?hi/n:0,a=nw?fw/nw:0,b=nf?ff/nf:0;return{ok:s>.4&&s<.78&&a>b*3,detail:Math.round(s*100)+'% of the dry land wild; the forest mask '+a.toFixed(2)+' there, '+b.toFixed(2)+' in the foul half'};},
 // the overgrowth of the wild half (the owner, 2026-11-09: Midgar at the end of FF7): trees on the ruins' tops and creepers on the towers
 overgrown(F,recs,CR){let roof=0,bad=0;for(const r of recs){if(r.kind!=='rooftree')continue;roof++;if(F.wild(r.x,r.z)<.5)bad++;}const c=CR?CR.curtains:0;return{ok:roof>=60&&bad<=roof*.03&&c>=1500,detail:roof+" ruins' tops with trees ("+bad+" outside the wild half), "+c+" curtains of creeper and moss on "+(CR?CR.towers:0)+" towers"};},
 /* the transit (PLAN.md 14): the grid's junctions, the highway's ramps, the cargo line's crossings, the subway's stations, the trains; the war rising
    toward the lake (the mean damage of the streets whose nearer end is in the lakeward third against the rest) */
 /* the cards' cut-outs (the owner, 2026-11-09: "an audit of cards not getting cut out properly"): every material on the page whose map carries alpha
    (over 3% of a 32x32 read under 128) must test it (alphaTest, coverage or transparency), and no alpha test may run on a map with none; also the
    curtains' (71) and the kits' card materials by name */
 /* a card cut from a sheet's cells (BIO.geo.cells: geometry.userData.cells) draws in the library's convention, v down the sheet, so its texture must
    load unflipped unless the cells were cut flipped (o.flipY, a canvas-made texture): the Terraces' crops loaded with three's default flip stood
    upside down (the owner, 2026-11-10: "cotton is upside down"). flip: the negative's lever */
 cardsUp(flip){const seen=new Set(),bad=[];let n=0;scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||!o.geometry.userData||!o.geometry.userData.cells)return;
   (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{const t=m&&m.map;if(!t||seen.has(o.geometry.uuid+m.uuid))return;seen.add(o.geometry.uuid+m.uuid);n++;
    const lib=t.image&&!t.image.data&&!t.image.getContext,want=!!o.geometry.userData.cellsFlipY,got=!!t.flipY!==!!flip;if(lib&&got!==want)bad.push(o.name||m.name||'?');});});
  return{ok:n>0&&!bad.length,detail:n+' cut cards, '+bad.length+' loaded the wrong way up'+(bad.length?' ('+[...new Set(bad)].slice(0,4).join(', ')+')':'')};},
 cardsCut(){const seen=new Set(),bad=[],c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');let maps=0,unread=0;
  const share=img=>{try{g.clearRect(0,0,32,32);g.drawImage(img,0,0,32,32);const d=g.getImageData(0,0,32,32).data;let lo=0;for(let i=3;i<d.length;i+=4)if(d[i]<128)lo++;return lo/1024;}catch(e){return -1;}};
  scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh))return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||seen.has(m))return;seen.add(m);const map=m.map||(m.uniforms&&m.uniforms.map&&m.uniforms.map.value);if(!map||!map.image||!map.image.width)return;maps++;
   const at=m.alphaTest!=null?m.alphaTest:(m.uniforms&&m.uniforms.alphaTest?m.uniforms.alphaTest.value:0),s=share(map.image);if(s<0||s>.98){unread++;return;}   /* a read that comes back empty (a bitmap the 2D canvas will not draw, the headless lane) is no verdict */
   if(s>.03&&!(at>0)&&!m.transparent&&!m.alphaToCoverage)bad.push((o.name||o.userData.inspectLabel||m.type)+': alpha in the map ('+Math.round(s*100)+'%), no cut');else if(s<.005&&at>0)bad.push((o.name||o.userData.inspectLabel||m.type)+': a cut on a map with no alpha');});});
  return{ok:!bad.length&&maps-unread>20,detail:maps+' mapped materials of '+seen.size+(unread?' ('+unread+' unreadable here)':'')+(bad.length?'; '+bad.slice(0,5).join('; '):'; every alpha map tested, no test without alpha')};},
 /* the lake-front property values (the owner, 2026-11-09): the towers' mean tip height within lakeK .6 of the shore against the towers under .35 */
 lakeFront(T){if(!T||!T.lakeK)return{ok:false,detail:'no lake'};const tip=t=>{const F=MP.FAMILY[t.family]||MP.DESIGNS[t.family];return F&&F.height?(F.height.tip||F.height.roof||0):0;};let hs=0,hn=0,ls=0,ln=0;
  STAGE.plan.towers.forEach(t=>{const k=T.lakeK(t.x,t.z),h=tip(t);if(!h)return;if(k>.6){hs+=h;hn++;}else if(k<.35){ls+=h;ln++;}});const mh=hn?hs/hn:0,ml=ln?ls/ln:0;
  return{ok:hn>=20&&ln>=20&&mh>ml*1.2,detail:hn+' towers by the lake at a mean tip of '+Math.round(mh)+' m, '+ln+' inland at '+Math.round(ml)+' m'};},
 transit(T,n){if(!T)return{ok:false,detail:'no transit'};const J=T.net.junctions.length,kinds={};T.net.junctions.forEach(j=>{kinds[j.kind]=(kinds[j.kind]||0)+1;});
  const ok=J>=300&&T.highway.ramps.length>=3&&T.highway.spans.length>=80&&T.cargo.crossings.length>=8&&T.subway.stations.length>=3&&T.trains.length>=4&&(n?n.dressed>=20:true);
  const rj=T.net.junctions.filter(j=>j.ramp).length;
  return{ok,detail:J+' junctions ('+Object.keys(kinds).map(k=>kinds[k]+' '+k).join(', ')+'; '+rj+' where a ramp lands'+(T.rampJoinErr?', join failed: '+T.rampJoinErr:'')+'), the highway '+T.highway.spans.length+' spans and '+T.highway.ramps.length+' ramps, the cargo line '+T.cargo.crossings.length+' crossings, the subway '+T.subway.stations.length+' stations, '+T.trains.length+' trains, '+(n?n.dressed:0)+' streets dressed'};},
 warToLake(T){if(!T)return{ok:false,detail:'no transit'};let hi=[],lo=[];T.wars.forEach((W,i)=>{const Rd=T.net.roads[i],q0=Rd.path.at(0),q1=Rd.path.at(Rd.L),k=Math.max(T.lakeK(q0.x,q0.z),T.lakeK(q1.x,q1.z)),d=(W.damageAt(0)+W.damageAt(Rd.L*.5)+W.damageAt(Rd.L))/3;(k>.6?hi:lo).push(d);});
  const m=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0,mh=m(hi),ml=m(lo);return{ok:hi.length>=4&&lo.length>=4&&mh>ml*1.6,detail:hi.length+' lakeward streets at mean damage '+mh.toFixed(2)+', '+lo.length+' inland at '+ml.toFixed(2)};},
 lines(V){let low=0,short=0;for(const d of V.decks)if(d.y<STAGE.lakeY+20)low++;for(const p of V.piers)if(p.y1-p.y0<2)short++;return{ok:V.decks.length>50&&!low&&!short,detail:V.decks.length+' decks, '+V.piers.length+' piers; '+low+' low, '+short+' short'};},
 /* the extraplanars (75; PLAN.md 6 and the themes table of 9: city3's theme reaches this shore). The hunters: two or more on rounds of four dry corners,
    the Stilter among them, each standing at a finite place and walking or attacking (the kit's state). The phenomena and the portals: every one registered
    before it was drawn (the kit's registry says so) and each phenomenon's weather bound on core/atmos (a void's mist, a solid's plume, a presence's glow);
    the void on the water (its `at` on the surface, water under its whole drift), the solid and the presence on dry ground, every drowned portal's floor
    under the lake and its arch above it (the lake's line cuts the arch), the tear on dry ground: nothing under the lake that should not be */
 /* the walkers keep clear (the owner, 2026-11-09: "robots need to respect collision with things eg highway pillars"): no keeper or hunter stands
    within half its body of a pier, a fallen deck, a train car, an Engine, a wreck or a tower's plinth (72, AV_AVOID), and the obstacle set is there */
 /* no green sky (the owner, 2026-11-09: "still getting the green shader during storms"): the clouds' mood over 200 episodes with the page's own
    palette (46z STAGE.cloudMood) tints nothing green-dominant; the air (89v) carries the clouds' colour onto the far towers in a storm */
 /* the flora held by the drawn ruins (the owner, 2026-11-10: "still seeing a fair amount of floating foliage"): every roof tree's foot (88) has the
    hero's surface under it within 0.6 m, and every creeper's head (71) a wall within 1.5 m, by rays at the hero in the tower's frame (70, avSurface) */
 floraHeld(TOPS,TW,lift,mins){const mF=mins?mins[0]:40,mC=mins?mins[1]:500;if(typeof avSurface==='undefined')return{ok:false,detail:'no avSurface'};let feet=0,fbad=0,cur=0,cbad=0;const dy=lift||0;
  for(const P of TOPS||[]){const sf=avSurface(P.t.key);for(const f of P.feet||[]){feet++;const y=sf.down(f[0],f[2],f[1]+dy+1,f[1]+dy-1.5);if(y==null||Math.abs(y-f[1]-dy)>.6)fbad++;}}
  for(const t of TW||[]){if(!t.curtains)continue;const sf=avSurface(t.key);for(const c of t.curtains){cur++;const r=Math.hypot(c[0],c[2])-.35,rw=sf.side(c[1]+dy,c[3],r+12);if(rw==null||Math.abs(rw-r)>1.5)cbad++;}}
  return{ok:feet>=mF&&cur>=mC&&!fbad&&!cbad,detail:feet+' roof trees, '+fbad+' with no roof under the foot; '+cur+' curtains, '+cbad+' with no wall behind the head'};},
 moodHues(o){if(typeof ATMOS==='undefined'||!ATMOS.moodAt)return{ok:false,detail:'no ATMOS.moodAt'};let worst=-1,n=0;
  for(let k=0;k<200;k++){const m=ATMOS.moodAt(k*(o.period==null?300:o.period)+1,o);if(!(m.tintK>0))continue;n++;const t=m.tint,g=t[1]-Math.max(t[0],t[2]);if(g>worst)worst=g;}
  return{ok:n>=40&&worst<=.02,detail:n+' tinted episodes of 200; the greenest leans '+worst.toFixed(2)+' to green (0.02 at most)'};},
 clearOf(W){if(typeof AV_AVOID==='undefined')return{ok:false,detail:'no AV_AVOID'};AV_AVOID.index();let bad=[];const acc=[];
  for(const k of W){const x=k.g.position.x,z=k.g.position.z,R=k.R==null?3:k.R;AV_AVOID.near(x,z,R+2,acc);for(const [px,pz,r] of acc)if(Math.hypot(x-px,z-pz)-r<R*.5){bad.push(k.key);break;}}
  return{ok:W.length>=4&&AV_AVOID.discs>=50&&!bad.length,detail:W.length+' walkers, '+AV_AVOID.discs+' obstacles (piers, fallen decks, cars, Engines, wrecks) and the plinths; '+(bad.length?'inside one: '+bad.join(', '):'none inside one')};},
 hunters(H){let bad=0;for(const k of H){if(!k.route||k.route.length<4)bad++;else for(const p of k.route)if(terrainH(p[0],p[1])<STAGE.lakeY+2)bad++;
   const p=k.g&&k.g.position;if(!p||!isFinite(p.x)||!isFinite(p.y)||!isFinite(p.z))bad++;else if(typeof KratorExtraplanar!=='undefined'){const s=KratorExtraplanar.state(k.g);if(!s||!(s.mode==='walk'||s.mode==='idle'||s.attacking))bad++;}}
  return{ok:H.length>=2&&H.some(k=>k.key==='xp_stilter')&&!bad,detail:H.length+' hunters on their rounds ('+H.map(k=>k.key.replace('xp_','')).join(', ')+'), '+bad+' faults'};},
 extraplanar(X){if(!X||!X.registry)return{ok:false,detail:'no registry'};const RG=X.registry,c=RG.check(),P=RG.phenomena(),O=RG.portals(),LY=STAGE.lakeY,bad=[];
  if(!c.ok||c.drawn!==X.drawn.length)bad.push('drawn before registered ('+(c.fails&&c.fails[0]?c.fails[0]:c.drawn+' drawn of '+X.drawn.length)+')');
  for(const g of X.drawn){if(g.userData.kind!=='phenomenon')continue;const w=g.userData.weather,r=g.userData.rec;if(!w||(r.key==='void'&&!w.mist)||(r.key==='solid'&&!w.plume)||(r.key==='presence'&&!w.glow))bad.push(r.key+': no weather on core/atmos');}
  const drawnWater=r=>typeof LAKE==='undefined'||!LAKE.contains||LAKE.contains(r.at[0],r.at[2]);   /* the near lake's own record (89w): its flood reaches the point */
  let voids=0,drowned=0;for(const r of P){if(r.key==='void'){voids++;if(Math.abs(r.at[1]-LY)>.05)bad.push('the void is not on the water');if(!drawnWater(r))bad.push('no lake drawn under the void');const d=r.drift.r+r.r;for(let a=0;a<12;a++)if(STAGE.rawGround(r.at[0]+Math.cos(a/12*TAU)*d,r.at[2]+Math.sin(a/12*TAU)*d)>LY-1){bad.push("land under the void's drift");break;}}
   else if(terrainH(r.at[0],r.at[2])<LY+1)bad.push(r.key+' under the lake');}
  for(const r of O){if(r.key==='drowned'){drowned++;if(!(r.at[1]<LY-1&&r.at[1]+r.h>LY+1))bad.push("a drowned portal's arch is not cut by the lake's line");if(!drawnWater(r))bad.push('no lake drawn at a drowned portal');}else if(STAGE.rawGround(r.at[0],r.at[2])<LY+1)bad.push('the '+r.key+' under the lake');}
  return{ok:P.length>=3&&O.length>=3&&voids>=1&&drowned>=2&&!bad.length,detail:P.length+' phenomena ('+voids+' over the water), '+O.length+' portals ('+drowned+' drowned halls), '+c.drawn+' drawn after registering'+(bad.length?'; '+bad.slice(0,4).join('; '):'; the weather bound on core/atmos; the void on the water, the drowned arches cut by the lake')};}};
/* a station other than the Overlook names the shared checks it runs (STAGE.shared: the Terraces have no lattice, transit, keepers or wrecks) and
   adds its own (STAGE.checks, STAGE.negatives); the Overlook runs them all, as before */
const HCHK_SHARED={handOfMan:['the hand of man in every view',()=>HCHK.handOfMan(VIEWS,REG)],standing:['the towers stand on dry ground',()=>HCHK.standing(STAGE.plan.towers)],
 impHidden:['the impostors hide behind their heroes and shells',()=>HCHK.impHidden((x,z)=>x+','+z)],feral:['the forest is feral and tinted',()=>HCHK.feral(AV.FERAL,window._tinted||0)],
 clear:['no tree on a street, a plinth or a scar',()=>HCHK.clear(REG)],cardsCut:['the cards are cut: every alpha map is tested',()=>HCHK.cardsCut()],cardsUp:['the cut cards load the right way up',()=>HCHK.cardsUp()],
 floraHeld:['the roof trees and the creepers are held by the drawn ruins',()=>HCHK.floraHeld(window.AV_TOPS,typeof AV_CREEPERS!=='undefined'&&AV_CREEPERS?AV_CREEPERS.tw:[],0,[10,40])]};   /* a station's smaller counts */
const HNEG_SHARED={handOfMan:['a view with nothing built anywhere',()=>HCHK.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower'))],
 standing:['a tower under the lake',()=>HCHK.standing(STAGE.plan.towers.slice(0,80).map((t,i)=>i?t:Object.assign({},t,{y:STAGE.lakeY-5})))],
 impHidden:['impostors looked up by the float64 key',()=>HCHK.impHidden((x,z)=>(x+1e-3)+','+z)],feral:['no tree grown',()=>HCHK.feral({trees:AV.FERAL.trees,grown:0,floor:0,dropped:0},window._tinted||0)],
 cardsUp:['every cut card loaded flipped',()=>HCHK.cardsUp(true)],
 floraHeld:['the roof trees lifted 3 m',()=>HCHK.floraHeld(window.AV_TOPS,typeof AV_CREEPERS!=='undefined'&&AV_CREEPERS?AV_CREEPERS.tw:[],3,[10,40])],
 clear:['a tenth of the trees on the plinths',()=>HCHK.clear(REG.filter(r=>r.kind==='tree').map((r,i)=>i%10?r:Object.assign({},r,{x:STAGE.plan.towers[0].x,z:STAGE.plan.towers[0].z})))]};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=STAGE.plan.towers;
 /* a station with its own content names its own list (STAGE.checkList(add, HCHK, VIEWS): the Yards); the Overlook's follows */
 if(STAGE.checkList){STAGE.checkList(add,HCHK,VIEWS);return R;}
 if(STAGE.shared){STAGE.shared.forEach(k=>{const e=HCHK_SHARED[k];if(e)add(e[0],e[1]());});if(STAGE.checks)STAGE.checks(add);return R;}
 add('the hand of man in every view',HCHK.handOfMan(VIEWS,REG));add('the towers stand on dry ground',HCHK.standing(T));add('the towers front the kerb lines',HCHK.kerb(T));add('the impostors hide behind their heroes and shells',HCHK.impHidden((x,z)=>x+','+z));if(typeof AV_HOUSE!=='undefined'&&AV_HOUSE)add('the House: larger inside than out, its door onto its floor',HCHK.house(AV_HOUSE));if(typeof AV_ANOM!=='undefined'&&AV_ANOM)add('the distortions of space and time are in place',HCHK.anomalies(AV_ANOM));if(typeof AV_RAD!=='undefined'&&AV_RAD)add('radiation glows over the scars',HCHK.radiation(AV_RAD));if(typeof AV_OIL!=='undefined'&&AV_OIL)add('the oily rain stands over the polluted half',HCHK.oilRain(AV_OIL));add('10-15% of the towers stand to full height',HCHK.ruinShare(T));
 add('the forest is feral and tinted',HCHK.feral(AV.FERAL,window._tinted||0));add('no tree on a street, a plinth or a scar',HCHK.clear(REG));add('the cards are cut: every alpha map is tested',HCHK.cardsCut());add('the cut cards load the right way up',HCHK.cardsUp());
if(STAGE.transit){add('the transit stands: the grid, the highway, the lines, the subway',HCHK.transit(STAGE.transit,typeof AVTR!=='undefined'?AVTR.n:null));add('the war rises toward the lake',HCHK.warToLake(STAGE.transit));add('the towers rise toward the lake (the lake-front property values)',HCHK.lakeFront(STAGE.transit));}else add('the viaduct stands',HCHK.lines(AV_LINES.V));
 add('the craters are struck and empty',HCHK.craters(STAGE.craters,T));add('the broken towers lean, a little',HCHK.lean(T));
 add('the grid runs between the buildings',HCHK.grid(T));if(!STAGE.transit)add('the avenues have their lamp standards',HCHK.lamps(AV_LAMPS));
 add('the lake steams',HCHK.steam(AV_STEAM));add('the keepers walk their rounds',HCHK.keepers(AV_KEEPERS));add('the land is half wild, half foul',HCHK.halves(STAGE.F,STAGE.forest));add('the wild half is overgrown: trees on the ruins, creepers on the towers',HCHK.overgrown(STAGE.F,REG,AV_CREEPERS));
 add('the ruined vehicles stand in the streets',HCHK.wrecks(AVW.records));
 add('the extraplanar hunters walk their rounds',HCHK.hunters(AV_XP.hunters));add('the walkers keep clear of the piers, the plinths and the wrecks',HCHK.clearOf(AV_KEEPERS.concat(AV_XP.hunters)));add('the roof trees and the creepers are held by the drawn ruins',HCHK.floraHeld(window.AV_TOPS,AV_CREEPERS.tw));add('no green in the clouds\' mood',HCHK.moodHues(Object.assign({seed:STAGE.seed|0},STAGE.cloudMood||{})));add('the phenomena and the portals: registered, drawn, their weather bound, the water line right',HCHK.extraplanar(AV_XP));
 if(typeof AVL!=='undefined')AVL.checks(add);   /* the lobbies and climbs (76, PLAN.md section 15) */
 if(STAGE.checks)STAGE.checks(add);return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=STAGE.plan.towers;
 if(STAGE.negativeList){STAGE.negativeList(add,HCHK,VIEWS);return R;}
 if(STAGE.shared){STAGE.shared.forEach(k=>{const e=HNEG_SHARED[k];if(e)add(e[0],e[1]());});if(STAGE.negatives)STAGE.negatives(add);return R;}
 add('a view with nothing built anywhere',HCHK.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower')));
 add('a tower under the lake',HCHK.standing(T.slice(0,80).map((t,i)=>i?t:Object.assign({},t,{y:STAGE.lakeY-5}))));
 add('every tower intact',HCHK.ruinShare(T.map(t=>Object.assign({},t,{state:'intact'}))));
 add('no tree grown',HCHK.feral({trees:AV.FERAL.trees,grown:0,floor:0,dropped:0},window._tinted||0));
 add('a tenth of the trees on the plinths',HCHK.clear(REG.filter(r=>r.kind==='tree').map((r,i)=>i%10?r:Object.assign({},r,{x:STAGE.plan.towers[0].x,z:STAGE.plan.towers[0].z}))));
 if(STAGE.transit){add('no transit at all',HCHK.transit(null));add('the war the same everywhere',HCHK.warToLake(Object.assign({},STAGE.transit,{wars:STAGE.transit.wars.map(W=>Object.assign({},W,{damageAt:()=>.3}))})));add('the towers the same height everywhere',HCHK.lakeFront({lakeK:(x,z)=>KRAND.unit(KRAND.hash(x|0,z|0,1,0))}));}
 else add('a deck under the water',HCHK.lines({decks:AV_LINES.V.decks.map((d,i)=>i?d:Object.assign({},d,{y:STAGE.lakeY})),piers:AV_LINES.V.piers}));
 add('a tower in a crater',HCHK.craters(STAGE.craters,T.concat([{x:STAGE.craters[0].x,z:STAGE.craters[0].z}])));
 add('an intact tower leaning twenty degrees',HCHK.lean(T.map((t,i)=>i?t:Object.assign({},t,{lean:20,state:'intact'}))));
 if(typeof AV_RAD!=='undefined'&&AV_RAD){const pk=STAGE.views()['A park gone feral'];add('radiation in the park, off every scar',HCHK.radiation({zones:AV_RAD.zones.map(z=>Object.assign({},z,{x:pk[3],z:pk[5]})),n:AV_RAD.n}));}add('every cut card loaded flipped',HCHK.cardsUp(true));if(typeof AV_OIL!=='undefined'&&AV_OIL)add('oily rain over the wild half',HCHK.oilRain(Object.assign({},AV_OIL,{field:(x,z)=>1-AV_OIL.field(x,z)})));if(typeof AV_ANOM!=='undefined'&&AV_ANOM)add('no anomaly at all',HCHK.anomalies({records:[],warp:null}));if(typeof AV_HOUSE!=='undefined'&&AV_HOUSE)add('a House whose door leads nowhere',HCHK.house({H:Object.assign({},AV_HOUSE.H,{thresholds:[]}),blocks:AV_HOUSE.blocks}));add('impostors looked up by the float64 key',HCHK.impHidden((x,z)=>(x+1e-3)+','+z));add('the towers on their nodes, no kerb',HCHK.kerb(T.map(t=>Object.assign({},t,{kerb:null}))));add('a plinth across a road',HCHK.kerb(T.filter(t=>Math.hypot(t.x,t.z)<1500&&t.rx!=null).slice(0,1).map(t=>{const L=STAGE.lattice,p=L.pitch,v=(Math.round((t.x*L.c+t.z*L.s)/p-.5)+.5)*p,w=-t.x*L.s+t.z*L.c;return Object.assign({},t,{x:v*L.c-w*L.s,z:v*L.s+w*L.c,kerb:{}});}).concat(T)));
 add('a tower standing in an avenue',HCHK.grid(T.concat([{x:(STAGE.avenueLines()[2]||0)*STAGE.lattice.c,z:(STAGE.avenueLines()[2]||0)*STAGE.lattice.s}])));
 if(!STAGE.transit)add('every lamp standing',HCHK.lamps(AV_LAMPS.map(l=>Object.assign({},l,{state:'up'}))));
 add('no steam on the water',HCHK.steam({banks:0,plumes:0}));add('no keeper on a round',HCHK.keepers([]));
 add('the whole land wild',HCHK.halves({wild:()=>1},STAGE.forest));
 add('no tree on a ruin and no creeper',HCHK.overgrown(STAGE.F,REG.filter(r=>r.kind!=='rooftree'),{curtains:0,towers:0}));
 add('a wreck under the lake',HCHK.wrecks(AVW.records.map((w,i)=>i?w:Object.assign({},w,{y:STAGE.lakeY-3}))));
 add('no extraplanar hunter on a round',HCHK.hunters([]));
 add('every roof tree and curtain lifted 6 m off the ruin',HCHK.floraHeld(window.AV_TOPS,AV_CREEPERS.tw,6));
 if(typeof ATMOS!=='undefined'&&ATMOS.MOOD_PALETTE)add('the clouds\' mood on core/atmos\'s whole palette (its sickly green and jaundice)',HCHK.moodHues(Object.assign({seed:STAGE.seed|0},STAGE.cloudMood||{},{palette:ATMOS.MOOD_PALETTE})));
 {const W=AV_KEEPERS.concat(AV_XP.hunters);let pier=null;if(STAGE.transit&&STAGE.transit.highway)pier=(STAGE.transit.highway.piers||[]).find(p=>p.state!=='none');
  if(pier&&W.length)add('a walker standing on a highway pier',HCHK.clearOf(W.map((k,i)=>i?k:Object.assign({},k,{g:{position:{x:pier.x,z:pier.z}}}))));}
 if(AV_XP.hunters.length&&AV_XP.spots.void)add("a hunter's corner under the lake",HCHK.hunters(AV_XP.hunters.map((k,i)=>i?k:Object.assign({},k,{route:k.route.map((p,j)=>j?p:AV_XP.spots.void)}))));
 if(AV_XP.registry){const RG=AV_XP.registry,fake=o=>Object.assign({},AV_XP,{registry:Object.assign({check:RG.check.bind(RG),phenomena:RG.phenomena.bind(RG),portals:RG.portals.bind(RG)},o)});
  add('a phenomenon drawn before it was registered',HCHK.extraplanar(fake({check:()=>({ok:false,fails:['a void drawn unregistered'],records:1,drawn:0})})));
  add('the void hanging over dry ground',HCHK.extraplanar(fake({phenomena:()=>RG.phenomena().map(r=>r.key==='void'?Object.assign({},r,{at:[STAGE.near.x,STAGE.lakeY,STAGE.near.z]}):r)})));
  add('a drowned portal on dry land',HCHK.extraplanar(fake({portals:()=>RG.portals().map(r=>r.key==='drowned'?Object.assign({},r,{at:[r.at[0],STAGE.lakeY+5,r.at[2]]}):r)})));
  add("a phenomenon without its weather",HCHK.extraplanar(Object.assign({},AV_XP,{drawn:AV_XP.drawn.map((g,i)=>i?g:{userData:Object.assign({},g.userData,{weather:null})})})));}
 if(typeof AVL!=='undefined')AVL.negatives(add);
 if(STAGE.negatives)STAGE.negatives(add);return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');if(window.AV_AIR)KHOST.on(AV_AIR.view,'view');   /* the colour of the air after the sky's own update (89v) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'ancientsvalley-'+STAGE.key,title:STAGE.title,hint:STAGE.hint,
 scene,camera,renderer,ground:(typeof AV_HOUSE!=='undefined'&&AV_HOUSE)?((x,z)=>{const g=AV_HOUSE.groundAt(x,z);return g==null?terrainH(x,z):g;}):terrainH,clear:1.8,registry:REG,
 /* the walk: AVL.walk (76) is core/walk less the lobbies' fallen floors, the same registry the House's floors and walls (75) are on */
 walk:typeof AVL!=='undefined'?AVL.walk:((typeof AV_HOUSE!=='undefined'&&AV_HOUSE)?KWALK:undefined),
 views:VIEWS,start:STAGE.start||Object.keys(VIEWS)[0],
 ticks:TICKS,clock:{hour:STAGE.hour==null?9.5:STAGE.hour},draw:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':'')+(AVC.ready?'\ntowers '+AVC.towers.length+(AVC.tierN?': heroes '+AVC.tierN.heroes+', shells '+AVC.tierN.shells+', impostors '+AVC.tierN.impostors:'')+'\nshell bake '+AVC.bakeMs+' ms, all '+AVC.bakeAllMs+' ms':'\nbaking the towers')+(typeof AVW!=='undefined'&&AVW.ok?'\nwrecks '+AVW.drawn+'/'+AVW.records.length+', '+AVW.built+' looks built in '+AVW.buildMs+' ms':'')+(AV_XP.ok?'\nextraplanar: '+AV_XP.hunters.length+' hunters, '+AV_XP.drawn.length+' drawn, hum here '+AV_XP.hum.toFixed(2):''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'water':{match:o=>!!(o.userData&&o.userData.water)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return{rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  get exportBox(){return[-300,-300,300,300];},
  biome:()=>({sw:window._swlow,nw:window._nwlow}),valley:()=>({feral:AV.FERAL,tinted:window._tinted,towers:STAGE.plan.towers.length,wrecks:AVW.records.length,wrecksDrawn:AVW.drawn,wreckLooks:AVW.built,tier:AVC.tierN,bakeMs:AVC.bakeMs,bakeAllMs:AVC.bakeAllMs,imp:AVC.impN,site:STAGE.px,base:STAGE.base,lakeY:STAGE.lakeY,
   extraplanar:{hunters:AV_XP.hunters.map(k=>({key:k.key,name:k.name,at:[Math.round(k.g.position.x),Math.round(k.g.position.z)],lake:Math.round(STAGE.transit?STAGE.transit.lakeK(k.g.position.x,k.g.position.z)*100:0)/100})),phenomena:AV_XP.registry?AV_XP.registry.phenomena().map(r=>({key:r.key,at:r.at.map(Math.round)})):[],portals:AV_XP.registry?AV_XP.registry.portals().map(r=>({key:r.key,state:r.state,at:r.at.map(Math.round),leads:r.leads})):[],spots:AV_XP.spots,views:Object.keys(AV_XP.views)}})}});
