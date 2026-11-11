// ================================================================= NEOW — the cauldron's own: the tree fern and the warm shore's reeds (data + kit items + passes)
// PLAN.md section 4: the kit reads its flora in place where a kit has it (the NW outer wall's conifers and floor, 48a-48d) and adds only
// what the cauldrons need. At station 1 that is two plants:
//   the STEAM TREE FERN (Dicksonia antarctica, the soft tree fern of Tasmania's and New Zealand's cool rainforest, which takes frost to
//     about -10 °C and grows to 1,000 m and more): a trunk of matted roots under a crown of arching fronds, on the warm, wet apron round the
//     springs where the ground stays over the soil's mean (KTHERM) and under the dikes' shelter; the kit's signature at this station
//   the WARM-SHORE REED (Phragmites australis, which lines the warm margins of hot-spring lakes as well as cold ones): beds along the
//     tarn's shore and round the mats' cool edge
// The podocarps of the plan (the sketch's "tree ferns and podocarps") are not drawn yet: the NW outer wall's stone pine and larch stand in
// for the conifers (KNOWN_ISSUES.md). Placement is by cell on core/rand (KRAND), as the NW outer wall's (NWOW.place).
BIO.kit('neouterwall');   // this kit's own registry of items and buckets (core/biome: kits); 70 closes it (BIO.kitEnd)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick}=BIO.fn;const qEuler=BIO.qEuler||BIO.fn.qEuler;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),SEED=0x4E45;NEOW.C=C;
const {bright,vary}=BIO.col;
const SEASON_K=typeof SEASON==='string'?SEASON:'autumn';NEOW.season=SEASON_K;
// ---------------------------------------------------------------- palettes (sRGB)
const PAL=NEOW.PAL={
 frond:[0x4e7a30,0x5a8638,0x46702a,0x66903e],frondDead:[0x7a6a48,0x6e5e40,0x86744e],fernTrunk:[0x4a3a2c,0x54422e,0x403226],
 reed:{winter:[0xb8a888,0xaca07e,0xc4b494],autumn:[0xb8a874,0xc4b07c,0xaa9a68],summer:[0x6e8a44,0x7a944a,0x64803c],spring:[0x7e9450,0x88a058,0x748a48]}[SEASON_K]};
// ---------------------------------------------------------------- the species and the plants, tagged
const K=(o)=>Object.assign({},NEOW.TAGS,o);
const HV=(wood,edible,medicinal,notes)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:null,crop:null});
NEOW.SPECIES=[
 {key:'treefern',name:'Steam tree fern',H:[2.5,7.5],rb:[.16,.3],crownR:[1.8,3.2],leaf:PAL.frond,barkC:PAL.fernTrunk,
  tags:K({climate:'cold',aridity:'humid',riparian:'both',koppen:['WH','Cfb','Dfb'],zone:'grove',earth:'Dicksonia antarctica',
   harvest:HV('fibre (the trunk\'s root mantle: planters, walls, kindling)',['young croziers (boiled twice)','the pith (starch, a famine food)'],false,
   'A soft tree fern of the warm cauldrons: a trunk of matted roots a man\'s height or three under a crown of arching fronds, on the springs\' warm, wet apron where the snow does not lie. Dicksonia antarctica of Tasmania takes frost to -10 °C; here the ground\'s heat keeps its roots from freezing.')})}];
NEOW.SPECIES.forEach((S,i)=>S.i=i);
NEOW.PLANTS={
 reed:{name:'Warm-shore reed',items:['reed'],tags:K({climate:'cold',aridity:'humid',riparian:'yes',koppen:['WH','Dfb','Dfc'],zone:'shore',earth:'Phragmites australis',
  harvest:HV('thatch, mats, arrow shafts',['young shoots','the rhizome (starch)'],false,'Common reed in dense beds along the tarn\'s warm shore and round the springs\' cooling run-off: green to the autumn, then straw-gold plumes.')})},
 fernfrond:{name:'Steam tree fern (its fronds)',items:['frond'],tags:null}};
NEOW.PLANTS.fernfrond.tags=NEOW.SPECIES[0].tags;
NEOW.plantOfItem=item=>{for(const k in NEOW.PLANTS)if(NEOW.PLANTS[k].items.indexOf(item)>=0)return NEOW.PLANTS[k];return null;};
// ---------------------------------------------------------------- textures (procedural, greyscale: the fallback when the page carries no pack)
{const RS=KRAND.stream(61301),r=()=>RS.next(),rq=(a,b)=>a+(b-a)*r();
 const G2=v=>{const q=Math.round(clamp(v,0,255));return 'rgb('+q+','+q+','+q+')';};
 /* a frond along v (base at v 1): a rachis and its pinnae */
 const frondTex=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';g.strokeStyle=G2(90);g.lineWidth=3;g.beginPath();g.moveTo(S/2,S);g.lineTo(S/2,S*.04);g.stroke();
  for(let k=0;k<26;k++){const t=k/26,y=S*(.96-.9*t),w=S*.42*Math.sin(Math.PI*Math.min(1,.15+t))*(1-.3*t);g.strokeStyle=G2(lerp(130,230,r()));g.lineWidth=S*.022;
   [-1,1].forEach(sd=>{g.beginPath();g.moveTo(S/2,y);g.quadraticCurveTo(S/2+sd*w*.5,y-S*.02,S/2+sd*w,y-S*.05);g.stroke();});}},[110,140,90]);
 /* reeds: upright blades and a plume, base at v 1 */
 const reedTex=BIO.alphaTex(128,(g,S)=>{g.lineCap='round';for(let k=0;k<22;k++){const x=S*rq(.2,.8),h=S*rq(.55,.95),b=rq(-10,10);g.strokeStyle=G2(lerp(140,230,r()));g.lineWidth=rq(1.2,2.4);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+b*.4,S-h*.5,x+b,S-h);g.stroke();}},[150,150,120]);
 /* the fern's trunk: a fibrous mantle of roots, dark brown, the old frond bases in rings */
 const tc=document.createElement('canvas');tc.width=tc.height=128;{const g=tc.getContext('2d');g.fillStyle='#4a3a2c';g.fillRect(0,0,128,128);
  for(let i=0;i<700;i++){const x=r()*128,y=r()*128,k=r();g.fillStyle=k<.5?'rgba(30,22,16,.55)':k<.8?'rgba(96,78,58,.45)':'rgba(70,90,44,.35)';g.fillRect(x,y,rq(1,3),rq(5,16));}}
 const tt=new T3.CanvasTexture(tc);tt.wrapS=tt.wrapT=T3.RepeatWrapping;tt.encoding=T3.sRGBEncoding;
 const M=NEOW.M={frond:BIO.leafMat(frondTex,'frond',{swayW:'(position.x)',swayA:.09}),reed:BIO.leafMat(reedTex,'reed',{swayW:'(position.y)',swayA:.08}),bark:BIO.barkMat(tt)};
 // the library's cards and bark where the pack has them (materials.json: frond card.treefern, reed card.reed, bark.fern bark.mossy)
 const SW=BIO.libSwap('neouterwall',{frond:M.frond,reed:M.reed,'bark.fern':M.bark});NEOW.LIB={frond:!!SW.frond,reed:!!SW.reed,bark:!!SW['bark.fern']};
 BIO.bucket('fernbark',M.bark,{label:'Tree-fern trunks',uvScale:[1.2,1.6]});
 BIO.def('frond',BIO.geo.frond(4),M.frond,{label:'Steam tree fern (its fronds)'});
 BIO.def('reed',NWOW.G.tuft(),M.reed,{label:'Warm-shore reed'});}
// the cards are greyscale (the pack keeps none of the card's colour: materials.json tint keep 0), so a library card takes the palette too
const libCol=(slot,c)=>c;
// ---------------------------------------------------------------- the tree fern's builder: (T, st, lv) with lv 2 near, 1 mid
// a trunk of matted roots (a tube, widest at its foot), a crown of arching fronds held at its top (each frond's base at the crown), a few
// young croziers curled up in the middle and the dead fronds' skirt hanging under it
function buildFern(T,st,lv){const S=NEOW.SPECIES[0],H=T.H,n=lv===2?6:3,pts=[],la=T.leanA,le=T.lean;
 BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:T.crownR*.6,h:H+1});   /* registered before it is drawn (core/tags) */
 for(let k=0;k<=n;k++){const t=k/n,b=Math.tan(le)*H*t*t*.5;pts.push({x:T.x+Math.cos(la)*b,y:T.y0-.25+(H+.25)*t,z:T.z+Math.sin(la)*b,r:T.rb*(1.3-.35*t)*(t<.1?1.35:1),
  col:bright(C(pick(S.barkC)),rr(.85,1.1))});}
 st.trunk+=BIO.tube('fernbark',pts,pts[0].col,{seg:lv===2?7:5,cap:true});
 const top=pts[n],nF=lv===2?ri(11,16):ri(6,8),a0=rr(0,TAU),hc=libCol('frond',C(pick(S.leaf)));
 for(let k=0;k<nF;k++){const a=a0+k/nF*TAU+rr(-.2,.2),L=T.crownR*rr(.85,1.12),pitch=rr(.18,.5);
  BIO.put('frond',[top.x,top.y-.05,top.z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*rr(1.1,1.4)],bright(hc,rr(.88,1.1)));st.fronds++;}
 if(lv===2){for(let k=0,m=ri(3,6);k<m;k++){const a=rr(0,TAU),L=T.crownR*rr(.5,.8);
   BIO.put('frond',[top.x,top.y-.3,top.z],qEuler(rr(-.1,.1),-a,rr(-1.2,-.8)),[L,L,L*1.1],libCol('frond',C(pick(PAL.frondDead))));st.fronds++;}}}
NEOW.TREES=[];
// ---------------------------------------------------------------- the passes (data: zone, cell, acceptance by the ground's heat)
// The tree fern: on the apron's grove, densest where the springs warm the ground (2-14 °C over the soil's mean), thinning out across the
// apron and up the wall's lowest slopes; none on the mats, the sinter or a scald (46). Near and mid trees only (lodMax: the grove lies on
// the LOD spine; past it the NW outer wall's far trees carry the woods). The reeds: the shore's band and the mats' cool edge
const warmK=(x,z)=>{const t=NEOW.THERM?NEOW.THERM.excess(x,z):0;return smooth(.5,4,t)*(1-smooth(14,22,t));};
NEOW.PASSES=[{key:'treefern',cell:7,accept:(x,z,Z)=>Z==='grove'?.16+.6*warmK(x,z):Z==='slope'?.03+.2*warmK(x,z):Z==='shore'?.04:0,pad:2.2}];
// the grid is the NW outer wall's (NWOW.place: one candidate a cell, the cell's stream reseeded from a hash of the kit's seed, the salt and
// the cell), with this kit's own salts (900 on); keep-clear between the ferns and from the NW outer wall's trees (core/space). NWOW.place
// runs in the NW outer wall's registry (BIO.kitWrap) and hands its accept the nwouterwall zone: the passes read this kit's own (NEOW.zoneAt)
// and only note the candidates there; the drawing is done after, in this kit's registry
const SPACE=KSPACE.create({cell:16});
NEOW.buildTrees=function(R,q){q=q==null?1:q;const TREES=NEOW.TREES;TREES.length=0;SPACE.clear();const st={trunk:0,fronds:0,trees:0,heroes:0};const LOD=BIO.radii(),S=NEOW.SPECIES[0];
 if(!NEOW.THERM)return {trees:0,heroes:0,fronds:0,tris:{trunk:0},why:'no springs: the steam tree fern lives on their warm ground'};   /* the cauldrons' plant only */
 const ZA=(x,z)=>NEOW.zoneAt?NEOW.zoneAt(x,z):NEOW.at(x,z).zone;
 NEOW.PASSES.forEach((P,pi)=>{NWOW.place(P.cell,900+pi,(x,z)=>P.accept(x,z,ZA(x,z))*q,(x,y,z,_z,i,j)=>{const Z=ZA(x,z);
   if(NWOW.blocked&&NWOW.blocked(x,z,P.pad))return;if(SPACE.some(x,z,P.pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+P.pad))return;
   const F=NEOW.FIELDS(x,z),ZF=NEOW.zoneOf(F);if(F.water||F.g>.7||ZF==='mat'||ZF==='sinter'||ZF==='spring'||ZF==='stair'||ZF==='dike')return;   /* the candidate's own zone, not the raster's nearest point */
   const T={x,z,y0:y-.2,sp:0,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),lean:rr(0,.16),leanA:rr(0,TAU),seed:KRAND.hash(SEED,pi,i,j,7),zone:Z};
   T.lv=BIO.lodD(x,z)<LOD.hero?2:1;TREES.push(T);SPACE.insert({x,z,r:T.crownR*.4+.3},x,z,T.crownR+2);},{R,lodMax:LOD.mid});});
 TREES.forEach(T=>{reseed(T.seed);buildFern(T,st,T.lv);st.trees++;if(T.lv===2)st.heroes++;});
 return {trees:st.trees,heroes:st.heroes,fronds:st.fronds,tris:{trunk:st.trunk}};};
// the reeds: dense in the shore's band, a few in the mats' cool edge, in the floor's band round the LOD spine
NEOW.buildFloor=function(R,q){q=q==null?1:q;let n=0;const LOD=BIO.radii(),far=LOD.floor[1],BOXES=BIO.host.origin.map(o=>[o[0]-far,o[1]-far,o[0]+far,o[1]+far]);
 const ZA=(x,z)=>NEOW.zoneAt?NEOW.zoneAt(x,z):NEOW.at(x,z).zone,ACC=Z=>Z==='shore'?.55:Z==='mat'?.06:0,PTS=[];   /* the warm shore and the mats' edge: no reed on a dry slope (station 4) */
 NWOW.place(1.3,950,(x,z)=>ACC(ZA(x,z))*q,(x,y,z,_z,i,j)=>{PTS.push([x,y,z,ZA(x,z),i,j]);},{R,lodMax:far,boxes:BOXES});
 PTS.forEach(p=>{reseed(KRAND.hash(SEED,950,p[4],p[5]));const h=rr(1.4,2.6)*(p[3]==='shore'?1:.7);
  BIO.put('reed',[p[0],p[1]-.05,p[2]],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*rr(.45,.7),h,h*rr(.45,.7)],libCol('reed',bright(vary(pick(PAL.reed),.03,.08,.06),1)));n++;});
 return {reeds:n};};
NEOW._canopyH=function(x,z){let h=0;for(const T of NEOW.TREES){if(Math.abs(x-T.x)<T.crownR+2&&Math.abs(z-T.z)<T.crownR+2)h=Math.max(h,T.y0+T.H);}return h;};
})();
