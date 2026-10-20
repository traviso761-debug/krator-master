// prefix: ip
// ================================================================= THE PALACE OF KAUTOA: courts in sequence behind coral-stone walls
// The owner's "palace" reference (a central audience hall whose roof rises from a broad base in curved, ribbed sweeps to one
// very tall spire, side pavilions with smaller spires, low ranges round lawns and paved courts, terraces and steps) and the
// "sumba - square" (a paved court shut in by long colonnaded galleries with spire towers at their corners, a tusked monument
// in the middle). The compound runs along its axis from the front (+z) to the back:
//   the GATE COURT       the gatehouse with its spire in the front wall, guard galleries along that wall, the parade ground
//   the CEREMONIAL COURT the processional way, the plaza and its monument, galleries down both sides, the council pavilions,
//                        and the GREAT AUDIENCE HALL on its stepped stone platform with the grand stair
//   the INNER COURT      the king's house (three spires) on its terrace, the houses of the queen and the heir, gardens
//   the SIDE COURTS      west: the kitchens and granaries, the ancestors' shrine and its megalith tombs; east: the treasury
//                        and the tribute stores, the royal garden with its pool and pavilion
// Coral-stone walls with spire-roofed towers at the corners, gates with small spires between the courts. Every part is a
// def placed with place(); the plants are fl-* defs. Frame: origin on the ground at the compound's centre, +z the front.
/* ---------------------------------------------------------------- helpers */
/* a coral-stone wall from (x0,z0) to (x1,z1), h high, t thick: a stone footing, a coping, piers on both faces every ~6 m;
   gaps [[s, w]] (s the gap's centre measured along the run from its start, w its width) are left open */
function ipWall(x0,z0,x1,z1,h,t,gaps){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0)-PI/2;
 W((x0+x1)/2,0,(z0+z1)/2,ry,()=>{const cuts=(gaps||[]).map(g=>[g[0]-L/2-g[1]/2,g[0]-L/2+g[1]/2]).sort((a,b)=>a[0]-b[0]);
  let x=-L/2;const segs=[];for(const c of cuts){if(c[0]>x)segs.push([x,c[0]]);x=Math.max(x,c[1]);}if(x<L/2-.01)segs.push([x,L/2]);
  for(const [a,b] of segs){const l=b-a,cx=(a+b)/2;box('coral',cx,0,0,l,h,t,P('coral'));box('stone',cx,h,0,l+.1,.2,t+.24,P('stone'));box('stone',cx,0,0,l+.04,.4,t+.16,P('stoneD'));
   box('plain',cx,h-.55,0,l+.02,.16,t+.04,P('red'));
   const n=Math.max(1,Math.round(l/6));for(let i=0;i<=n;i++){const px=a+.35+(l-.7)*i/n;box('coral',px,0,0,.8,h+.3,t+.5,P('coral'));box('stone',px,h+.3,0,.95,.16,t+.62,P('stone'));}}});}
/* a paved field of slabs (x0..x1, z0..z1) at height y, slabs about s across, jittered in tone */
function ipPave(x0,x1,z0,z1,y,s,mk,key){const nx=Math.max(1,Math.round((x1-x0)/s)),nz=Math.max(1,Math.round((z1-z0)/s)),sx=(x1-x0)/nx,sz=(z1-z0)/nz;
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)box(mk,x0+sx*(i+.5),y,z0+sz*(j+.5),sx-.06,.12+rr(0,.03),sz-.06,P(key));}
/* the Kautoan spire roof on its own: a low skirt from the eave (eY, half-extents hw x hd), the tall tower out of its middle to a
   short ridge, finials at the ridge's ends. o: skirtH, skirtS, towerH, towerS, topSx, topSz, sq, mk, col, th, finial
   'figure' | 'horns' | 'moon' | 'none', fs (the finials' scale), facade (a woven key on the tower's front). Returns the top. */
function ipSpire(hw,hd,eY,o){o=o||{};const col=o.col||P('thatchE'),mk=o.mk||'thatchR',th=o.th||.3,sq=o.sq||7,skH=o.skirtH||1.4,skS=o.skirtS||.5,tH=o.towerH||6,bs=o.towerS||.42,sk=eY+skH,fs=o.fs||1;
 isSpire({hw,hd,sq,mk,col,th,cap:false,prof:[[1,1,eY],[skS,skS,sk],[skS*.62,skS*.6,sk+.6]]});
 const sp=isSpire({hw,hd,sq,mk,col,th,nu:28,sub:4,prof:[[bs*1.05,bs*1.05,sk-.4],[bs,bs*.92,sk+.3],[bs*.72,bs*.6,sk+tH*.4],[bs*.5,bs*.34,sk+tH*.75],[o.topSx||.2,(o.topSz||.05)+.02,sk+tH]]});
 if(o.facade){const zf=hd*bs*.92+.05;psurf(o.facade,(u,v)=>{const y=sk+.5+v*(tH*.32),t=(y-(sk+.3))/(tH*.4-.3),sx=lerp(bs,bs*.72,clamp(t,0,1))*hw*.86,sz=lerp(bs*.92,bs*.6,clamp(t,0,1))*hd+th*.3+.05;return [(u-.5)*2*sx*(1-v*.25),y,sz];},4,6,WHITE,{flip:false});}
 for(const s of [-1,1]){const fx=s*sp.topW*.85,fy=sp.top+.15;
  if(o.finial==='horns')isHorns(fx,fy,0,s>0?-PI/2:PI/2,.9*fs);else if(o.finial==='moon'){if(s>0)isMoonDisc(0,fy+.55*fs,0,0,.45*fs);}
  else if(o.finial!=='none')isFigure(fx,fy,0,0,.8*fs,{mk:'carved'});}
 return sp.top;}
/* ---------------------------------------------------------------- the great sweep (the audience hall's roof) */
/* a many-sided roof rising from a broad rounded-rectangle eave in curved, fluted sweeps to a slender spire (the palace
   reference). o: hw, hd (the eave's half-extents), eY, topY (where the sweep ends), rTop (its radius there), p (the curve:
   2 a gentle cone, 3 a deep sweep), N (ribs; the front axis falls mid-panel), dip (the flutes' depth), lift (the rib tips'
   upturn at the eave), arch (the front eave's lift over the doors), archP (its narrowness), sq (the eave's squareness).
   Returns {f(u,v), rib(a), at(a,v)}: u runs round from +x (a = u * TAU, +z is a = PI/2), v from the eave up. */
function ipSweepF(o){const N=o.N||16,p=o.p||2.8,H=o.topY-o.eY,sq0=o.sq||5,rT=o.rTop||.35,ph=PI/2+PI/N;
 const rib=a=>Math.abs(Math.cos((a-ph)*N/2));
 const sup=(a,A,B,q)=>{const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c/A,q)+Math.pow(s/B,q),1/q);};
 const at=(a,v)=>{const s=Math.pow(1-v,p),A=rT+(o.hw-rT)*s,B=rT+(o.hd-rT)*s,q=lerp(2,sq0,Math.min(1,s*1.6));
  const rb=rib(a),pk=Math.pow(rb,10),fa=Math.pow(Math.max(0,Math.sin(a)),o.archP||10),e=1-v;
  const r=sup(a,A,B,q)*(1-(o.dip||.05)*(1-rb)*(1-v*.7))*(1+.035*pk*e*e*e)*(1+.07*fa*e*e);
  const y=o.eY+H*v+(o.lift||0)*pk*Math.pow(e,5)+(o.arch||0)*fa*Math.pow(e,2.2);
  return [Math.cos(a)*r,y,Math.sin(a)*r];};
 return {f:(u,v)=>at(u*TAU,v),rib,at,N,ph};}
/* draw the sweep as a thatch shell (the top sheet, the underside th inside it, the eave's edge), its ribs as rolls of
   thatch bound with carved caps, a carved collar where it narrows into the spire, the arch board over the front */
function ipSweep(o){const S=ipSweepF(o),f=S.f,th=o.th||.4,col=o.col||P('thatchE'),mk=o.mk||'thatchR',nu=S.N*8,nv=o.nv||36;
 const g=(u,v)=>{const p=f(u,v),r=Math.hypot(p[0],p[2]),k=Math.max(.15,(r-th*.9)/Math.max(r,1e-3));return [p[0]*k,p[1]-th*.55,p[2]*k];};
 const out=(p,n)=>p[0]*n[0]+p[2]*n[2]>0;
 psurf(mk,f,nu,nv,col,{flip:isFlipFor(f,out)});psurf(mk,g,nu,nv,o.underCol||col,{flip:isFlipFor(g,(p,n)=>!out(p,n))});
 const edge=(u,t)=>{const a=f(u,0),b=g(u,0);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];};psurf(mk,edge,nu,1,col);psurf(mk,edge,nu,1,col,{flip:true});
 /* the ribs: a roll of black palm fibre (the West's ijuk) along each crest, tapering up, a carved knob at the eave */
 for(let k=0;k<S.N;k++){const a=S.ph+k*TAU/S.N,v1=.9;
  tube('thatch',t=>{const p=S.at(a,t*v1),r=Math.hypot(p[0],p[2]),q=(r+th*.35)/Math.max(r,1e-3);return [p[0]*q,p[1]+th*.25,p[2]*q];},t=>{const w=lerp(.5,.08,Math.pow(t,.6));return [w,w*.8];},26,6,o.ribCol||P('thatchW'),{caps:true});
  const tip=S.at(a,0);ellip('carved',tip[0]*1.01,tip[1]+.15,tip[2]*1.01,.32,.32,.32,P('carvN'),0,8);}
 /* the collar: a carved drum with a band of woven diamonds where the sweep narrows into the spire */
 const vc=o.collarV||.6;for(const [v0,v1,m,c] of [[vc,vc+.03,'carved',P('carvN')],[vc+.03,vc+.07,'patGableE',WHITE],[vc+.07,vc+.09,'carved',P('carvN')]])
  psurf(m,(u,t)=>{const p=S.at(u*TAU,lerp(v0,v1,t)),r=Math.hypot(p[0],p[2]),q=(r+th*.6)/Math.max(r,1e-3);return [p[0]*q,p[1],p[2]*q];},40,2,c,{flip:isFlipFor((u,t)=>{const p=S.at(u*TAU,lerp(v0,v1,t));return [p[0]*1.05,p[1],p[2]*1.05];},out)});
 /* the arch board: a carved roll along the lifted front eave */
 tube('carved',t=>{const a=PI/2+(t-.5)*1.5,p=S.at(a,0),r=Math.hypot(p[0],p[2]),q=(r+.1)/r;return [p[0]*q,p[1]-.15,p[2]*q];},()=>[.22,.3],24,6,P('carvN'),{caps:true});
 return S;}
/* on the sweep, the height at ground point (x,z) (the roof's own frame): the v whose radius along that bearing reaches it */
function ipSweepAt(S,x,z){const a=Math.atan2(z,x),r=Math.hypot(x,z);let lo=0,hi=1;for(let i=0;i<28;i++){const m=(lo+hi)/2,p=S.at(a,m);if(Math.hypot(p[0],p[2])>r)lo=m;else hi=m;}return S.at(a,(lo+hi)/2)[1];}
/* ---------------------------------------------------------------- the great audience hall */
/* the room 20 x 14 at floor 2.8 behind verandas on carved pillars; three tiers of stone (34 x 29.5 at the foot), the grand
   stair; the roof the great sweep (eave 7.3, the spire's end at 40, the moon at ~44). Drawn shifted back 3.25 m so the
   declared box sits on the def's origin. */
defBuilding({key:'ip-hall',name:'Great audience hall (Kautoa)',seed:6502,cut:true,w:36,d:37,h:46,budget:400000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'audience hall'},
 note:'the king\'s audience hall: three tiers of stone, a grand stair between carved guardians, verandas on carved pillars, and the great roof sweeping up in sixteen ribbed flutes from a broad eave lifted in an arch over the doors to a single spire crowned with horns and the white moon',
 build(o){W(0,0,-3.25,0,()=>{const yf=2.8,wh=4.4,top=yf+wh,cz=.75;
  /* the platform: three tiers, coral faces with a stone coping, the grand stair cut through them */
  isNoCut(()=>{for(const [w,d,y0,h] of [[34,29.5,0,.8],[31,26.5,.8,.8],[28,23.5,1.6,.8]]){box('coral',0,y0,cz,w,h-.14,d,P('coral'));box('stone',0,y0+h-.14,cz,w+.2,.14,d+.2,P('stone'));
    box('plain',0,y0+.3,cz,w+.03,.12,d+.03,P('red'));}
   const n=12,rise=.2,go=.62,z0=12.5;for(let i=0;i<n;i++){const za=z0+go*(n-1-i),zb=za+go;box('stone',0,0,(za+zb)/2-(i===0?0:0),9,(i+1)*rise,go+.02,P('stone'));}
   for(const s of [-1,1]){beam('stone',[s*4.95,.75,z0+n*go+.2],[s*4.95,3.0,z0],.8,P('stoneD'),false,undefined,.9);box('stone',s*4.95,0,z0+n*go+.45,1.2,1.3,1.2,P('stoneD'));
    isPou(s*4.95,1.3,z0+n*go+.45,2.4,.3,{mk:'carved',top:'figure',n:2});isFigure(s*4.95,2.4,z0-.3,0,1.5,{mk:'stone',col:P('stoneD')});}
   /* the deck on the top tier, a step down to the stair's head */
   box('planks',0,2.4,cz,26,.4,21.5,P('planks'));box('planks',0,2.4,12.0,9,.2,1.0,P('planks'));});
  isCutFloor(yf);
  /* the room: plank walls, the front woven in nested diamonds, three doors in front and one behind, windows down the sides */
  const win=[-6,-2,2,6].map(x=>({x,w:1.2,y:1.1,h:1.7}));
  isWalls(20,14,yf,wh,'planks',P('woodL'),{front:[{x:0,w:3,h:3.4,door:true},{x:-6,w:1.6,h:2.8,door:true},{x:6,w:1.6,h:2.8,door:true}],back:[],
   left:win.slice(1,3).concat([{x:-5,w:1.2,y:1.1,h:1.7},{x:5,w:1.2,y:1.1,h:1.7}]),right:[{x:-5,w:1.2,y:1.1,h:1.7},{x:-1.6,w:1.2,y:1.1,h:1.7},{x:1.6,w:1.2,y:1.1,h:1.7},{x:5,w:1.2,y:1.1,h:1.7}],frame:P('woodD'),shutMk:'planks',shutCol:P('woodD')});
  for(const [x,w] of [[-8.35,2.9],[-3.35,3.3],[3.35,3.3],[8.35,2.9]])box('patGableE',x,yf+.1,7.03,w,3.3,.03,WHITE);
  box('patGableE',0,yf+3.55,7.03,19.8,.8,.03,WHITE);
  for(const s of [-1,1])W(s*10.03,0,0,s*PI/2,()=>{box('patWeave',0,yf+3.6,0,13.8,.75,.03,WHITE);box('patWeave',0,yf+.05,0,13.8,.9,.03,WHITE);});
  /* the four great posts of the spire, carved with the ancestors, tied at the top */
  for(const [x,z] of [[-4.5,-3.5],[4.5,-3.5],[-4.5,3.5],[4.5,3.5]])isPou(x,yf,z,13,.34,{mk:'carved',n:5,ry:isFace(x,z)});
  for(const z of [-3.5,3.5])box('carved',0,yf+12.6,z,9.6,.5,.45,P('carvN'));for(const x of [-4.5,4.5])box('carved',x,yf+12.1,0,.45,.5,7.6,P('carvN'));
  /* the verandas' carved pillars, the ring beam they carry, the brackets out to the eave */
  isNoCut(()=>{const P0=[];for(const x of isSpan(-12.7,12.7,8))P0.push([x,11.2,0]);for(const x of isSpan(-12.7,12.7,8))P0.push([x,-9.7,PI]);
   for(const z of isSpan(-9.7,11.2,7).slice(1,-1))for(const s of [-1,1])P0.push([s*12.7,z,s*PI/2]);
   for(const [x,z,ry] of P0){isPou(x,yf,z,wh,.3,{mk:'carved',n:3,ry});if(z>10&&Math.abs(x)<7)continue;const r=Math.hypot(x,z-cz),q=(r+1.6)/r;beam('carved',[x,top-.9,z],[x*q,top+.15,cz+(z-cz)*q],.2,P('carvN'));}
   for(const [a,b] of [[[-12.7,11.2],[12.7,11.2]],[[-12.7,-9.7],[12.7,-9.7]],[[-12.7,-9.7],[-12.7,11.2]],[[12.7,-9.7],[12.7,11.2]]])beam('carved',[a[0],top+.15,a[1]],[b[0],top+.15,b[1]],.42,P('carvN'),false,undefined,.55);
   for(const s of [-1,1])isRail([s*13,-10],[s*13,11.5],yf,{h:.8,panel:'lattice'});});
  /* the roof */
  W(0,0,cz,0,()=>{const S=ipSweep({hw:14.8,hd:12.6,eY:top+.1,topY:40,rTop:.38,p:2.75,N:16,dip:.1,lift:1.3,arch:4.4,archP:9,sq:5,th:.45});
   /* four small spires rising out of the sweep at the corners (the reference's side pavilions) */
   for(const [x,z] of [[-9.6,-7.6],[9.6,-7.6],[-9.6,8.4],[9.6,8.4]]){const y0=ipSweepAt(S,x,z);W(x,0,z,0,()=>{
    isSpire({hw:1.5,hd:1.5,sq:4,mk:'thatchR',col:P('thatchE'),th:.2,nu:24,sub:3,prof:[[1.05,1.05,y0-.7],[.85,.85,y0+.9],[.5,.48,y0+3.2],[.24,.2,y0+5.2],[.06,.04,y0+7]]});
    beam('carved',[0,y0+6.6,0],[0,y0+8.2,0],.07,P('carvN'),true,6,.02);});}
   /* the spire's end: a carved mast, buffalo horns, the white moon */
   beam('carved',[0,38.6,0],[0,42.4,0],.36,P('carvN'),true,10,.12);ring('brass',0,39.6,0,.4,.07,P('brass'));isHorns(0,41.4,0,0,2.0);isMoonDisc(0,43.1,0,0,.75);});
  /* the court: the throne on its stone dais against the back wall, the ancestors' cloths behind it, carpets down the aisle,
     divans and low tables along both walls, lamps hung on cords from the great posts' ties */
  box('stone',0,yf,-4.8,6,.45,3,P('stone'));box('stone',0,yf,-3.05,4,.22,.5,P('stoneD'));
  FURNISH('islander_court_throne',0,yf+.45,-5.4,0);FURNISH('islander_court_tapestry',0,yf+1.2,-6.86,0);
  for(const s of [-1,1]){FURNISH('islander_court_banner',s*3.6,yf,-6.86,0,{v:s>0?1:0});FURNISH('islander_court_painted_hanging',s*7.2,yf+.4,-6.86,0);
   FURNISH('islander_court_statue',s*3.6,yf,-4.4,0);FURNISH('islander_court_lamp',s*2.4,yf,-2.6,0);
   for(const z of [-4.2,-1.2,1.8,4.8])FURNISH('islander_court_divan',s*9.35,yf,z,-s*PI/2,{v:z>0?1:0});
   for(const z of [-2.7,3.3])FURNISH('islander_court_low_table',s*7.9,yf,z,-s*PI/2);
   FURNISH('islander_court_table',s*6.6,yf,5.7,0);}
  for(const z of [-1.4,1.6,4.6])FURNISH('islander_court_carpet',0,yf,z,PI/2);
  FURNISH('islander_common_kava_bowl',0,yf,-2.2,0);
  for(const [x,z] of [[0,0],[-4.5,0],[4.5,0]]){FURNISH_HANG('islander_court_hanging',x,yf+6.2,z,0);cord('rope',[[x,yf+6.2,z],[x,yf+12.3,z]],.02,P('rope'));}
  door(0,yf,7.1,0,3);});}});
/* ---------------------------------------------------------------- gates, towers and galleries */
defBuilding({key:'ip-gatehouse',name:'Palace gatehouse (Kautoa)',seed:6503,w:19,d:11,h:21,budget:120000,
 tags:{types:['military','civic'],wealth:'rich',style:'east',role:'gatehouse'},
 note:'the palace\'s front gate: two coral-stone piers and a carved lintel hung with buffalo horns, a guardroom above under a tall spire, carved guardians either side, the moon\'s flags',
 build(o){isNoCut(()=>{
  for(const s of [-1,1]){box('coral',s*5.6,0,0,6.8,5,8,P('coral'));box('stone',s*5.6,0,0,7,.5,8.2,P('stoneD'));box('plain',s*5.6,3.9,0,6.83,.16,8.03,P('red'));}
  box('carved',0,4.3,0,4.6,.7,8.2,P('carvN'));box('stone',0,5,0,18.4,.22,8.4,P('stone'));ipPave(-2.2,2.2,-4,4,0,1.4,'stone','stone');
  for(const s of [-1,1])WX(s*2.0,0,-3.6,s*.9,0,0,()=>box('planks',-s*1.05,0,0,2.1,4.2,.12,P('woodD')));
  door(0,0,4,0,4.4);
  for(const s of [-1,1]){isPou(s*3.0,0,4.7,4.2,.28,{mk:'carved',top:'figure',ry:0});isFlag(s*8.6,4.6,9.5,{ry:s>0?0:PI});}
  isHorns(0,5.05,4.15,0,2.8);isMoonDisc(0,6.0,4.35,0,.55);
  for(const [z,w] of [[4.3,7.2],[4.9,7.8]])box('stone',0,0,z,w,.15*(z<4.5?2:1),.6,P('stone'));
  /* the guardroom on the piers, its veranda to the front, the spire over it */
  box('planks',0,5.22,0,16.4,.25,8.4,P('planks'));
  isWalls(13,5.4,5.47,2.2,'bamboo',P('bamboo'),{front:[-4.5,-1.5,1.5,4.5].map(x=>({x,w:.9,y:.8,h:.7})),back:[{x:-4,w:.9,h:1.8,door:true},{x:2,w:.9,y:.8,h:.7}],left:[{x:0,w:.7,y:.8,h:.7}],right:[{x:0,w:.7,y:.8,h:.7}],shutMk:'bamboo',shutCol:P('bamboo')});
  for(const x of [-3,3])box('patGableE',x,5.55,2.73,2.3,1.95,.03,WHITE);
  for(const x of isSpan(-7.9,7.9,6))isPou(x,5.47,3.9,2.2,.13,{mk:'carved',n:2});for(const x of isSpan(-7.9,7.9,6))cyl('wood',x,5.47,-3.9,.11,2.2,P('wood'),8);
  isRail([-8.1,4.1],[8.1,4.1],5.47,{h:.7,panel:'lattice'});isLadder(-6.6,-4.15,PI,5.47,{lean:.9});
  ipSpire(9.2,5.0,7.6,{skirtH:1.6,skirtS:.46,towerH:9.5,towerS:.4,topSx:.2,finial:'horns',facade:'patGableE'});});}});
defBuilding({key:'ip-gate',name:'Court gate (Kautoa)',seed:6504,w:10,d:5,h:12,budget:60000,
 tags:{types:['infrastructure'],wealth:'rich',style:'east',role:'gate'},
 note:'a gate between two courts: coral piers, a carved lintel, a small spire of golden thatch over it, carved guardians before it',
 build(o){isNoCut(()=>{for(const s of [-1,1]){box('coral',s*3.3,0,0,2.6,3.6,3.4,P('coral'));box('stone',s*3.3,0,0,2.8,.4,3.6,P('stoneD'));}
  box('carved',0,3.6,0,9.4,.55,3.6,P('carvN'));box('plain',0,3.75,1.81,9.4,.22,.02,P('red'));ipPave(-2,2,-1.7,1.7,0,1.3,'stone','stone');
  for(const z of [-1.6,1.6])for(const x of [-1.8,1.8])isPou(x,0,z,3.6,.14,{mk:'carved',n:2,ry:z>0?0:PI});
  for(const s of [-1,1])isPou(s*2.4,0,2.05,3.1,.17,{mk:'carved',top:'figure',ry:0});
  door(0,0,1.7,0,3.6);isMoonDisc(0,3.0,1.9,0,.4);
  ipSpire(5.0,2.5,4.2,{skirtH:1.0,skirtS:.5,towerH:4.4,towerS:.44,topSx:.24,finial:'figure',fs:.8});});}});
defBuilding({key:'ip-tower',name:'Wall tower (Kautoa)',seed:6505,w:8,d:8,h:18,budget:80000,
 tags:{types:['military'],wealth:'rich',style:'east',role:'wall tower'},
 note:'a corner tower of the palace wall: a coral-stone base, a watch room of bamboo on carved posts, a spire with horns on its ridge',
 build(o){isNoCut(()=>{box('stone',0,0,0,6.8,.6,6.8,P('stoneD'));box('coral',0,.6,0,6.2,4.9,6.2,P('coral'));box('plain',0,4.2,0,6.23,.18,6.23,P('red'));box('stone',0,5.5,0,6.6,.2,6.6,P('stone'));
  box('planks',0,1,3.12,1.1,2,.1,P('woodD'));door(0,0,3.15,0,1.1);
  box('planks',0,5.7,0,7.2,.2,7.2,P('planks'));
  for(const [x,z] of [[-3.3,-3.3],[3.3,-3.3],[-3.3,3.3],[3.3,3.3]])isPou(x,5.9,z,2.3,.14,{mk:'carved',n:2,ry:isFace(-x,-z)});
  for(const [ry,len] of [[0,6.6],[PI,6.6],[PI/2,6.6],[-PI/2,6.6]])W(0,0,0,ry,()=>{if(ry===0){box('bamboo',-1.1,5.9,3.3,4.4,1.0,.1,P('bamboo'));box('bamboo',2.8,5.9,3.3,1.0,1.0,.1,P('bamboo'));}else box('bamboo',0,5.9,3.3,len,1.0,.1,P('bamboo'));   /* the front parapet is open at the ladder */box('patWeave',0,5.95,3.36,len-.4,.85,.02,WHITE);});
  isLadder(1.7,3.6,0,5.9,{lean:.4});   /* the way up: the watch room had none (the door is painted on a solid base) */
  ipSpire(4.0,4.0,8.2,{skirtH:1.1,skirtS:.55,towerH:6.2,towerS:.44,topSx:.22,finial:'horns',fs:.9});});}});
/* a colonnaded gallery L 30 along x, open to the front (+z) on posts (every other one carved), its back against a wall, a long
   hip of golden thatch and a spire tower at each end (the "sumba - square" reference). o.guard: the guards' benches and racks */
defBuilding({key:'ip-gallery',name:'Palace gallery (Kautoa)',seed:6506,w:31,d:6,h:12,budget:90000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'gallery'},
 note:'a long colonnade round a court: a stone plinth, carved posts, woven panels on the back wall, a long low thatch with a spire tower at each end',
 build(o){isNoCut(()=>{const L=30,D=4.6,eY=3.5;box('stone',0,0,0,L,.45,D,P('stone'));box('planks',0,.45,0,L-.2,.06,D-.2,P('planks'));
  for(const z of [D/2+.25])box('stone',0,0,z,L-2,.22,.5,P('stoneD'));
  box('coral',0,.45,-D/2+.18,L,eY-.45,.36,P('coral'));for(const x of isSpan(-12,12,5))box('patWeave',x,.9,-D/2+.37,4.2,2.1,.02,WHITE);
  const xs=isSpan(-L/2+.35,L/2-.35,11);xs.forEach((x,i)=>{if(i%2===0)isPou(x,.45,D/2-.35,eY-.45,.16,{mk:'carved',n:2});else cyl('wood',x,.45,D/2-.35,.13,eY-.45,P('wood'),8);});
  for(const x of xs)cyl('wood',x,.45,-D/2+.55,.11,eY-.45,P('wood'),8);
  for(const z of [D/2-.35,-D/2+.55])box('carved',0,eY,z,L,.3,.3,P('carvN'));
  isHip({hw:L/2+.8,hd:D/2+.9,eaveY:eY+.15,topY:eY+2.5,topS:.93,topS2:.2,sq:14,mk:'thatchR',col:P('thatchE'),th:.25});
  for(const s of [-1,1])W(s*(L/2-2.4),0,0,0,()=>{isSpire({hw:2.7,hd:2.7,sq:6,mk:'thatchR',col:P('thatchE'),th:.25,nu:24,sub:3,prof:[[1,1,eY+.5],[.8,.74,eY+2.6],[.56,.42,eY+4.8],[.24,.06,eY+7.0]]});
   for(const k of [-1,1])isFigure(k*.55,eY+7.1,0,0,.7,{mk:'carved'});});
  if(o.guard){for(const x of [-8,0,8])FURNISH('islander_common_bench',x,.45,-1.5,0,{setting:'outdoor'});for(const x of [-12,12])FURNISH('islander_common_rack',x,.45,-2.0,0,{setting:'outdoor'});
   FURNISH('islander_common_jug',-4,.45,-1.8,0,{setting:'outdoor'});}
  else{for(const x of [-9,0,9])FURNISH('islander_common_bench',x,.45,-1.6,0,{setting:'outdoor'});FURNISH('islander_court_banner',-4.5,.45,-2.0,0,{setting:'outdoor'});FURNISH('islander_court_banner',4.5,.45,-2.0,0,{setting:'outdoor',v:1});}
  door(0,.45,D/2,0,2.6);});}});
/* ---------------------------------------------------------------- the houses of the courts */
defBuilding({key:'ip-pavilion',name:'Council pavilion (Kautoa)',seed:6507,cut:true,w:11,d:14,h:17,budget:90000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'council pavilion'},
 note:'a pavilion beside the audience hall where the council waits on the king: a woven facade, carved posts hung with horns, a spire with carved figures on its ridge',
 build(o){W(0,0,-1.2,0,()=>{ieHouse({w:6,d:5.2,floorY:1.8,wallH:2.4,ver:1.2,verFront:1.8,roof:{over:.8,skirtH:1.5,skirtS:.5,towerH:9,towerS:.42,topSx:.2,topSz:.05},
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',stair:'stair',stairW:1.6,finial:'figure',hornPosts:true});
  FURNISH('islander_court_carpet',0,1.8,0,0);FURNISH('islander_court_low_table',0,1.8,0,0);FURNISH('islander_common_kava_bowl',0,1.8,1.0,0);
  for(const s of [-1,1])FURNISH('islander_court_divan',s*2.35,1.8,-.2,-s*PI/2,{v:s>0?1:0});FURNISH('islander_court_lamp',2.2,1.8,1.7,0);FURNISH_HANG('islander_court_hanging',0,1.8+3.2,0,0);});}});
defBuilding({key:'ip-residence',name:'King\'s house (Kautoa)',seed:6508,cut:true,w:24,d:20,h:27,budget:220000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'east',role:'royal residence'},
 note:'the king\'s house: a great room on high piles behind deep verandas, one skirt of golden thatch and three spires out of it, the tallest crowned with the moon, the facades woven in nested diamonds, the royal tombs before the steps',
 build(o){W(0,0,-.4,0,()=>ieHouse({w:16,d:10,floorY:2.2,wallH:2.8,ver:2,verFront:2.8,roof:{over:1.2,skirtH:2.3,skirtS:.6,towerH:17,towerS:.28,topSx:.13,topSz:.04,sq:9,th:.4},
  towers:[[-5.4,0,.7],[0,0,1],[5.4,0,.7]],front:[{x:0,w:1.6,h:2.2,door:true},{x:-5.4,w:1.0,h:2.0,door:true},{x:5.4,w:1.0,h:2.0,door:true}],
  left:[{x:-2,w:.8,y:1,h:.8},{x:2,w:.8,y:1,h:.8}],right:[{x:-2,w:.8,y:1,h:.8},{x:2,w:.8,y:1,h:.8}],back:[{x:-4,w:.8,y:1,h:.8},{x:4,w:.8,y:1,h:.8}],
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',towerFacade:true,stair:'stair',stairW:2.4,finial:'moon',hornPosts:true,tier:'rich',beds:2,
  furn:[['islander_court_throne',0,-2.4,0],['islander_court_statue',-3.0,-3.9,0],['islander_court_statue',3.0,-3.9,0],['islander_court_banner',-2.2,-4.66,0],['islander_court_banner',2.2,-4.66,0,{v:1}],
   ['islander_common_kava_bowl',0,2.6,0],['islander_court_lamp',-7.2,3.6,0],['islander_court_lamp',7.2,3.6,0],['islander_court_divan',-4.2,2.6,PI/2],['islander_court_divan',4.2,2.6,-PI/2]],
  tombs:[[-5.5,9.6,0,1.15,true],[5.5,9.6,0,1.15,true]]}));}});
defBuilding({key:'ip-shrine',name:'Ancestors\' shrine (Kautoa)',seed:6509,cut:true,w:10,d:12,h:21,budget:80000,
 tags:{types:['religious','funerary'],wealth:'rich',style:'east',role:'royal shrine'},
 note:'the shrine of the royal ancestors: a small dark house on high piles under a very tall spire with horns on its ridge, the kings\' images inside',
 build(o){W(0,0,-.8,0,()=>{ieHouse({w:5,d:5,floorY:2.2,wallH:2.2,ver:1,verFront:1.6,roof:{over:.8,skirtH:1.4,skirtS:.5,towerH:13,towerS:.46,topSx:.22,topSz:.05},
  wallMk:'planks',wallCol:P('woodD'),facade:'patGableE',stair:'stair',stairW:1.2,finial:'horns',hornPosts:true});
  for(const s of [-1,1])FURNISH('islander_court_statue',s*1.4,2.2,-1.7,0,{v:s>0?1:0});FURNISH('islander_common_kava_bowl',0,2.2,0,0);FURNISH('islander_court_banner',0,2.2,-2.32,0);FURNISH('islander_court_lamp',1.9,2.2,1.6,0);});}});
defBuilding({key:'ip-treasury',name:'Treasury (Kautoa)',seed:6510,cut:true,w:10,d:15,h:17,budget:80000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'treasury'},
 note:'the royal treasury: a strong-room of coral stone on a high podium, one barred door up a stone stair, a spire with the moon on its ridge',
 build(o){W(0,0,-1.9,0,()=>{const fy=2.4;isNoCut(()=>{box('coral',0,0,0,9,fy-.15,8,P('coral'));box('stone',0,fy-.15,0,9.2,.15,8.2,P('stone'));box('plain',0,1.2,0,9.03,.14,8.03,P('red'));
   const n=12,go=.3;for(let i=0;i<n;i++)box('stone',0,0,4+go*(n-1-i)+go/2,2.2,(i+1)*fy/n,go+.02,P('stone'));
   for(const s of [-1,1]){beam('stone',[s*1.3,.6,4+n*go],[s*1.3,fy+.6,4],.3,P('stoneD'),false,undefined,.6);isPou(s*1.6,0,4+n*go+.2,2.2,.16,{mk:'carved',top:'figure'});}});
  isCutFloor(fy);box('planks',0,fy,0,6.8,.08,5.8,P('planks'));
  isWalls(7,6,fy,2.6,'coral',P('coral'),{front:[{x:0,w:1.2,h:2.1,door:true}],left:[{x:0,w:.4,y:1.6,h:.5}],right:[{x:0,w:.4,y:1.6,h:.5}],back:[],frame:P('woodD'),shut:false});
  for(const x of isSpan(-.45,.45,4))box('iron',x,fy,3.08,.04,2.1,.04,P('iron'));
  isNoCut(()=>{for(const [x,z] of [[-3.7,-3.2],[3.7,-3.2],[-3.7,3.2],[3.7,3.2]])isPou(x,fy,z,2.6,.15,{mk:'carved',n:2,ry:isFace(-x,-z)});});
  ipSpire(4.6,4.1,fy+2.7,{skirtH:1.3,skirtS:.5,towerH:8,towerS:.42,topSx:.2,finial:'moon',fs:1.1});
  for(const z of [-1.8,0,1.8])FURNISH('islander_common_chest',-2.95,fy,z,PI/2,{v:z>0?1:0});FURNISH('islander_court_cabinet',2.95,fy,-1.2,-PI/2);FURNISH('islander_court_cabinet',2.95,fy,1.2,-PI/2,{v:1});
  FURNISH('islander_court_statue',0,fy,-2.5,0);FURNISH('islander_court_table',0,fy,.2,0);FURNISH('islander_court_bowl',.5,fy+.8,.2,0);FURNISH('islander_court_lamp',-1.6,fy,2.3,0);});}});
defBuilding({key:'ip-kitchen',name:'Palace kitchens (Kautoa)',seed:6511,cut:true,w:18,d:10,h:11,budget:80000,
 tags:{types:['industry'],wealth:'rich',style:'east',role:'palace kitchens'},
 note:'the palace kitchens: a long open-sided house on an earth platform, three hearths under a raised smoke vent in a wide hip of thatch, stores and water jars',
 build(o){isNoCut(()=>{box('earth',0,0,0,17,.5,8.4,P('earth'));box('stone',0,0,0,17.2,.25,8.6,P('stoneD'));
  for(const x of isSpan(-8.1,8.1,7))for(const z of [-3.8,3.8])cyl('wood',x,.5,z,.14,3.4,P('wood'),8);for(const z of [-3.8,3.8])box('wood',0,3.85,z,16.6,.28,.26,P('woodD'));});
  for(const [x,z,ry,L] of [[0,-3.8,0,16.2],[-8.1,0,PI/2,7.6],[8.1,0,-PI/2,7.6]])W(x,0,z,ry,()=>box('bamboo',0,.5,0,L,1.2,.08,P('bamboo')));
  isHip({hw:9.3,hd:5.0,eaveY:3.9,topY:8.4,topS:.55,topS2:.12,mk:'thatchR',col:P('thatchE'),th:.28});
  for(const x of [-3.2,3.2])for(const z of [-.5,.5])cyl('wood',x,8.0,z,.07,.9,P('wood'),6);isHip({hw:4.2,hd:1.5,eaveY:8.7,topY:10.0,topS:.6,topS2:.1,mk:'thatchR',col:P('thatchE'),th:.18});
  for(const x of [-5,0,5]){FURNISH('islander_common_hearth',x,.5,-3.2,0,{v:x>0?1:0});smokeAt(x,9.4,0,{r:.4});}
  FURNISH('islander_common_counter',-4,.5,1.4,0);FURNISH('islander_common_workbench',3.5,.5,1.5,0);FURNISH('islander_common_rack',-7.6,.5,0,PI/2);
  for(const z of [-2.0,-.8])FURNISH('islander_common_store',7.5,.5,z,-PI/2,{v:z>-1?1:0});
  for(const [x,z] of [[6.8,1.6],[7.4,2.5],[6.6,2.9],[-7.2,3.0]])FURNISH('generic_storage_jar',x,.5,z,rr(0,TAU),{v:Math.round(rr(0,3))});
  for(const x of [-4.6,-3.4])FURNISH('islander_common_jug',x,1.55,1.4,0);
  door(0,.5,4.2,0,6);}});
defBuilding({key:'ip-granary',name:'Palace granary (Kautoa)',seed:6512,w:5,d:5,h:8,budget:30000,
 tags:{types:['farm'],wealth:'rich',style:'east',role:'granary'},
 note:'a raised store of rice and yams: four piles with rat-guard discs, a woven body, a peaked hip of golden thatch',
 build(o){isPiles(isSpan(-1.1,1.1,2),isSpan(-1.1,1.1,2),1.8,{r:.13,beams:false});for(const x of [-1.1,1.1])for(const z of [-1.1,1.1])cyl('wood',x,1.4,z,.34,.06,P('woodD'),10);
  isDeck(2.9,2.9,1.95,{col:P('planks'),beam:false});box('bamboo',0,1.95,0,2.5,1.4,2.5,P('bamboo'));box('patWeave',0,2.1,1.26,1.9,1.0,.02,WHITE);
  box('planks',0,2.2,1.27,.7,.9,.05,P('woodD'));door(0,1.95,1.3,0,.7);isLogLadder(0,1.35,0,1.95);
  isHip({hw:2.1,hd:2.1,eaveY:3.25,topY:6.6,topS:.18,topS2:.06,mk:'thatchR',col:P('thatchE'),th:.2});isFigure(.25,6.6,0,0,.6,{mk:'carved'});}});
defBuilding({key:'ip-bale',name:'Garden pavilion (Kautoa)',seed:6513,w:8,d:8,h:11,budget:40000,
 tags:{types:['park'],wealth:'rich',style:'east',role:'garden pavilion'},
 note:'an open pavilion by the pool of the royal garden: a raised floor on stone, four carved posts, a little spire with the moon on its ridge',
 build(o){for(const x of [-2.3,2.3])for(const z of [-2.3,2.3])box('stone',x,0,z,.6,.3,.6,P('stone'));box('planks',0,.3,0,5.4,.3,5.4,P('planks'));
  for(const [x,z] of [[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]])isPou(x,.6,z,2.8,.15,{mk:'carved',n:2,ry:isFace(-x,-z)});
  isRail([-2.6,-2.6],[2.6,-2.6],.6,{h:.6});isRail([-2.6,-2.6],[-2.6,2.6],.6,{h:.6});isRail([2.6,-2.6],[2.6,2.6],.6,{h:.6});
  for(let i=0;i<3;i++)box('stone',0,0,3.0+.3*(2-i),1.6,.2*(i+1),.32,P('stone'));
  ipSpire(3.3,3.3,3.4,{skirtH:.9,skirtS:.55,towerH:4.4,towerS:.44,topSx:.24,finial:'moon',fs:.8});
  FURNISH('islander_court_carpet',0,.6,0,0,{setting:'outdoor'});for(const s of [-1,1])FURNISH('islander_court_divan',s*1.9,.6,-.2,-s*PI/2,{setting:'outdoor',v:s>0?1:0});
  FURNISH('islander_common_kava_bowl',0,.6,.2,0,{setting:'outdoor'});door(0,.6,2.7,0,1.6);}});
defBuilding({key:'ip-monument',name:'Tusk monument (Kautoa)',seed:6514,w:9,d:9,h:9,budget:40000,
 tags:{types:['statue','religious'],wealth:'rich',style:'east',role:'monument'},
 note:'the monument of the ceremonial court (the "sumba - square" reference): a stepped stone plinth, a pair of great tusks arching over the white moon, stone guardians at the corners, offerings',
 build(o){box('stone',0,0,0,8.4,.35,8.4,P('stoneD'));box('stone',0,.35,0,7,.35,7,P('stone'));box('coral',0,.7,0,5.4,.45,5.4,P('coral'));box('plain',0,.92,0,5.43,.1,5.43,P('red'));
  box('stone',0,1.15,0,2.6,1.1,1.6,P('stoneD'));box('stone',0,2.25,0,3,.2,2,P('stone'));
  for(const k of [-1,1])tube('bone',t=>[k*(1.0+1.5*Math.sin(PI*t*.85)-.3*t),2.4+5.4*t,.35*Math.sin(PI*t)],t=>{const r=.34*(1-.82*t);return [r,r];},20,10,P('bone'),{caps:true});
  cyl('carved',0,2.45,0,.14,1.3,P('carvN'),8);isMoonDisc(0,4.6,0,0,1.0);isHorns(0,1.9,.85,0,2.4);
  for(const [x,z] of [[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]])isFigure(x,1.15,z,isFace(-x,-z)+PI,1.5,{mk:'stone',col:P('stoneD')});
  for(const s of [-1,1])isLamp(s*1.6,1.15,2.3,{});
  FURNISH('islander_common_kava_bowl',0,1.15,1.6,0,{setting:'outdoor'});FURNISH('islander_court_bowl',-.9,1.15,1.7,0,{setting:'outdoor'});FURNISH('islander_court_bowl',.9,1.15,1.7,0,{setting:'outdoor',v:1});
  door(0,0,4.2,0,2);}});
/* ---------------------------------------------------------------- THE PALACE */
const IP_FZ=54,IP_BZ=-56,IP_HW=46,IP_C1=38,IP_C2=-20,IP_SX=28;   // the front and back walls, the half-width, the cross walls, the side walls
defBuilding({key:'ip-palace',name:'Palace of Kautoa',seed:6501,cut:true,w:102,d:122,h:47,budget:1200000,
 tags:{types:['civic','dwelling-single'],wealth:'rich',style:'east',role:'palace'},
 note:'the palace of the kings of Kautoa: a walled compound of courts in sequence, the gate court and its parade ground, the ceremonial court before the great audience hall, the inner court of the royal houses, and the side courts of the kitchens, the shrine and its tombs, the treasury and the garden',
 build(o){isNoCut(()=>{const FZ=IP_FZ,BZ=IP_BZ,HW=IP_HW,C1=IP_C1,C2=IP_C2,SX=IP_SX;
  /* the walls: the outer ring (3.8 m), the cross walls and the side walls between the courts (2.8 m) */
  ipWall(-HW,FZ,HW,FZ,3.8,1.0,[[HW,16]]);ipWall(-HW,BZ,HW,BZ,3.8,1.0);ipWall(-HW,BZ,-HW,FZ,3.8,1.0);ipWall(HW,BZ,HW,FZ,3.8,1.0);
  ipWall(-HW,C1,HW,C1,2.8,.8,[[HW-37,9],[HW,9],[HW+37,9]]);ipWall(-HW,C2,HW,C2,2.8,.8,[[HW-21,9],[HW+21,9]]);
  for(const s of [-1,1]){ipWall(s*SX,C1,s*SX,C2,2.8,.8,s<0?[[C1,2.4]]:[]);ipWall(s*SX,C2,s*SX,BZ,2.8,.8,[[C2-(-50.5),9]]);}
  /* the service door from the kitchens into the ceremonial court: a lintel on carved posts */
  W(-SX,0,0,PI/2,()=>{box('carved',0,2.3,0,3.0,.4,1.0,P('carvN'));for(const s of [-1,1])isPou(s*1.25,0,.55,2.3,.12,{mk:'carved',n:2});});
  /* the gates and the towers */
  place('ip-gatehouse',0,FZ,0);door(0,0,FZ+4.2,0,4.4);
  place('ip-gate',0,C1,0);for(const s of [-1,1]){place('ip-gate',s*37,C1,0,{v:1});place('ip-gate',s*21,C2,0,{v:2});place('ip-gate',s*SX,-50.5,s*PI/2,{v:3});}
  for(const [x,z] of [[-HW,FZ],[HW,FZ],[-HW,BZ],[HW,BZ]])place('ip-tower',x,z,z>0?PI:0,{v:(x>0)+2*(z>0)});
  /* the GATE COURT: the parade ground of packed sand, the way in, the guard galleries along the front wall, flags */
  box('sand',0,0,44,52,.06,8.4,P('sandG'));ipPave(-3,3,C1+.5,FZ-4.2,0,1.5,'coral','coral');
  for(const s of [-1,1]){place('ip-gallery',s*25,FZ-.5-2.4,PI,{guard:1,tags:{types:['military','civic'],role:'guard gallery'}});isFlag(s*8.6,48.2,11,{ry:s>0?0:PI});
   isLamp(s*3.8,2.6,C1+3,{post:true});}
  /* the CEREMONIAL COURT: the processional way to the hall's stair, the plaza and the monument, carved posts and flags,
     the galleries down both sides, the council pavilions beside the hall */
  ipPave(-3.2,3.2,15.6,20,0,1.6,'coral','coral');ipPave(-3.2,3.2,34,C1-.5,0,1.6,'coral','coral');ipPave(-10,10,20,34,0,2,'stone','stone');
  for(const [x,z] of [[-10.1,20],[10.1,20],[-10.1,34],[10.1,34]])box('stone',x,0,z,.25,.24,.25,P('stoneD'));
  place('ip-monument',0,27,0);
  for(const s of [-1,1]){for(const z of [21,33])isPou(s*11,0,z,4.6,.26,{mk:'carved',top:'figure',ry:s*PI/2*-1});isFlag(s*4.6,35.6,12,{ry:s>0?0:PI});
   for(const z of [24,30])isLamp(s*4.2,2.4,z,{post:true});
   place('ip-gallery',s*(SX-.4-2.4),21,-s*PI/2,{});
   place('ip-pavilion',s*21.6,-7.4,0,{v:s>0?1:0});
}
  place('ip-hall',0,-1.5,0);
  /* the INNER COURT: the king's house on its terrace, the houses of the queen and the heir, the ways from the gates */
  const tz=-38;box('stone',0,0,tz,24,.85,20,P('stone'));box('coral',0,.85,tz,24.2,.15,20.2,P('coral'));box('plain',0,.35,tz,24.03,.12,20.03,P('red'));
  for(let i=0;i<5;i++)box('stone',0,0,tz+10+.36*(4-i)+.18,8,.2*(i+1),.38,P('stone'));
  place('ip-residence',0,tz+.2,0,{y:1.0});
  for(const s of [-1,1])place('ie-house-wealthy',s*19.6,-36.5,0,{v:s>0?1:0,name:s<0?'Queen\'s house (Kautoa)':'Heir\'s house (Kautoa)',tags:{role:s<0?'queen\'s house':'heir\'s house'}});
  ipPave(-2,2,tz+12,C2-.4,0,1.4,'stone','stone');for(const s of [-1,1])ipPave(s*21-1.5,s*21+1.5,-27,C2-2.6,0,1.4,'stone','stone');
  /* the WEST SIDE COURTS: the kitchens and granaries; the ancestors' shrine and the royal tombs */
  place('ip-kitchen',-37,20,PI/2);for(const [z,v] of [[-1,0],[-7.5,1],[-14,2]])place('ip-granary',-41.5,z,PI/2,{v});place('ip-granary',-33.5,-14,-PI/2,{v:3});
  for(const [x,z] of [[-32,4],[-32.6,4.9],[-31.6,5.4]])FURNISH('generic_storage_jar',x,0,z,rr(0,TAU),{setting:'outdoor',v:Math.round(rr(0,3))});
  place('ip-shrine',-37,-46.5,0);box('stone',-37,0,-30.5,16,.4,6,P('stone'));
  for(const [x,f] of [[-42.5,true],[-37,false],[-31.5,true]])W(0,.4,0,0,()=>isTomb(x,-30.5,0,{s:1.05,figures:f}));
  for(const x of [-44,-30])isMenhir(x,-23.5,3.2,.5,{ry:rr(0,TAU)});for(const x of [-43.5,-30.5])isMenhir(x,-37,2.4,.4,{ry:rr(0,TAU)});
  /* the EAST SIDE COURTS: the treasury and the tribute stores; the royal garden, its pool and pavilion */
  place('ip-treasury',37,12,0);for(const [x,v] of [[32.5,4],[41.5,5]])place('ip-granary',x,-11,0,{v});isFlag(31.5,24,10,{});
  box('earth',37,0,-33,9.4,.08,6.4,0x3a4a40);box('water',37,.06,-33,9.4,.34,6.4,P('water'));
  for(const [x,z,w,d] of [[37,-36.6,10.6,.8],[37,-29.4,10.6,.8],[31.7,-33,.8,6.4],[42.3,-33,.8,6.4]]){box('coral',x,0,z,w,.5,d,P('coral'));box('stone',x,.5,z,w+.06,.1,d+.06,P('stone'));}
  place('ip-bale',37,-46.5,0);
  /* the plants (fl-* defs): palms in the gate court, breadfruit and palms on the ceremonial lawns, the gardens */
  const T=[['fl-coconut',-43,48],['fl-coconut',43,48],['fl-coconut',-31,41.5],['fl-coconut',31,41.5],
   ['fl-breadfruit',-17,31],['fl-breadfruit',17,31],['fl-coconut',-14.5,23],['fl-coconut',14.5,23],['fl-coconut',-20.5,9],['fl-coconut',20.5,9],
   ['fl-breadfruit',-9.5,-23.5],['fl-breadfruit',9.5,-23.5],['fl-coconut',-15,-52],['fl-coconut',15,-52],['fl-coconut',-22,-53],['fl-coconut',22,-53],['fl-banana',-24.5,-24],['fl-banana',24.5,-24],
   ['fl-banana',-42.5,33],['fl-banana',-33,33.5],['fl-taro',-33.5,-3],['fl-coconut',43,29],['fl-coconut',43,-23.5],['fl-coconut',31,-23.5],['fl-banana',42.5,-41],['fl-banana',31.5,-41],['fl-coconut',42.5,-52.5],['fl-breadfruit',-41.5,-52],['fl-coconut',-31,-52.5]];
  T.forEach(([k,x,z],i)=>place(k,x,z,rr(0,TAU),{v:i}));});}});
