// ================================================================= QIBLAI — the site, the ground and the plan (PLAN.md, Q7b-Q7d)
// Runs after every kit def is registered (89q*) and before the scene (90-scene). The city is core/city's nested-squares site
// (KCITY.squares, core/city/35-city-squares.js: the rings, blocks, avenues, the kora and its chortens, walls, gates and towers,
// the terraces built up, the monasteries by spoke, the gate markets) laid on a core/city instance, its lay, kora and clergy
// blocks filled by frontage-courts with the kits' keys; this fragment makes the plan only (records), 90r draws it.
// Metres; x east, z south (north is -z); the origin is the Temple Mountain's centre. [G data] records, no drawing.
const QC={SEED:33950,EAST_GHATS:1000,RIVER_W:70};
// the country before the terraces: the bench at the cataracts, nearly flat, falling gently east to the river (PLAN.md 1:
// 37 m of relief over the square); a plane, no noise
const qcCountry=(x,z)=>-.016*x+.007*z;
const QC_S=KCITY.squares.plan({id:'qiblai',h:qcCountry});
const qcGround=KCITY.squares.ground(QC_S,qcCountry);
// the river, Nahr ash-Shalālāt, a kilometre east of the east gate (PLAN.md 1; the ghat way runs to it: the owner, 2026-11-11):
// its channel cut into the country (only outside the square), its water a few metres down
// the outer square's bounds (S.zone is its four corners)
const QC_B={x0:Math.min(...QC_S.zone.map(p=>p[0])),x1:Math.max(...QC_S.zone.map(p=>p[0])),z0:Math.min(...QC_S.zone.map(p=>p[1])),z1:Math.max(...QC_S.zone.map(p=>p[1]))};
const QC_RIVER={x:QC_B.x1+QC.EAST_GHATS+QC.RIVER_W/2+30,w:QC.RIVER_W};
QC_RIVER.y=qcCountry(QC_RIVER.x,0)-3.2;
const qcChannel=x=>{const t=Math.max(0,1-Math.abs(x-QC_RIVER.x)/(QC_RIVER.w/2+30));return t*t*(3-2*t)*5.5;};
// the ground every builder and the camera read: the terraces inside the outer square, the country (and the river's
// channel) outside it
terrainH=function(x,z){return qcGround(x,z)-qcChannel(x);};
// the core/tags registry under this city's name (91t-xanadu-tags.js takes it up rather than making Erewhon's)
KTAGS.page=KTAGS.page||KTAGS.create({build:'qiblai'});

// ---------------------------------------------------------------- the kits' keys for each kind of block (frontage-courts' pools)
// a key's lot is its def's plot (w x d, yard included); weights are how often it is drawn. A third of the houses in the lay
// rings are the Xanadu kit's (the owner, 2026-11-11: 33 %, spread): rich 3 of 9, middle 3 of 9, poor 3 of 9 by weight.
const QC_POOLS={
 clergy:[['qb_college',2],['qb_granary',1],['qb_shrine',1]],
 kora:[['qb_hostel',3],['qb_shop_row',3],['qb_guild_gold',1],['qb_guild_mason',1],['qb_guild_spice',1],['qb_guild_lodge',1],['qb_wheel_house',1],['qb_bath',1]],
 rich:[['qb_row_rich',4],['qb_court_house',1],['xa_rich_a',2],['xa_rich_c',2]],
 middle:[['qb_row_mid',5],['qb_corner_house',1],['xa_mid_a',2],['xa_mid_b',1],['xa_mid_c',2],['qb_bakery',1],['qb_butcher',1],['qb_weaver',1],['qb_brewhouse',1],['qb_shop_row',1]],
 poor:[['qb_row_poor',6],['xa_poor_a',2],['xa_poor_b',1],['xa_poor_c',2],['qb_workshop',1],['qb_tannery',1]],
};
const QC_SMALL={clergy:[['qb_shrine',1]],kora:[['qb_shrine',1]],rich:[['qb_row_mid',1]],middle:[['qb_row_poor',1],['qb_shrine',1]],poor:[['qb_row_poor',1],['qb_shrine',1]]};
const QC_GAPS={clergy:[8,16],kora:[3,7],rich:[10,18],middle:[7,13],poor:[6,12]};
const qcDims=(key,v)=>{const D=VERN.defs[key];return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;};

// ---------------------------------------------------------------- the gardens: the people, not the blocks, set the density
// Qiblai's ~6,000 lay folk want ~1,200-1,500 houses (PLAN.md Q7d); the lay rings' blocks would hold three times that. The
// density fades from the centre in one pattern, symmetric about both axes and both diagonals (the owner, 2026-11-11: "a 4-way
// symmetrical pattern of squares with mostly gardens on the edge and some gardens placed like enclosed courtyards in the more
// built up area"). A block's place is its ring r (max(|a|,|b|)) and its step t along the side from the avenue (min(|a|,|b|):
// 0 the avenue's half blocks, r the corner). QC_GARDEN: whole blocks left to the temple estates' gardens (a chahar-bagh; the
// infill leaves them, KCITY.squares.courtBlocks takes only 'quarter' blocks); QC_COURT: blocks built on their frontage round
// an enclosed courtyard garden, the infill's inner houses cleared from it (below, after the infill). The half blocks at the
// avenues stay built (the gate quarters), and so does t = 1 beside them.
const qcD=(x,d)=>x==null?d:x;   // a numeric default: 0 is a value
const qcHash=(s)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
const QC_GARDEN={7:[2,3,5,6,7],6:[2,4,6],5:[3]},QC_COURT={7:[4],6:[5],5:[1,5],4:[1,3]};
const qcCentre=b=>[(b.box[0]+b.box[2])/2,(b.box[1]+b.box[3])/2];
const qcRT=b=>[Math.max(Math.abs(b.a),Math.abs(b.b)),Math.min(Math.abs(b.a),Math.abs(b.b))];
for(const b of QC_S.blocks){if(b.kind!=='lay'||b.use!=='quarter'||b.half)continue;const[r,t]=qcRT(b);
 if((QC_GARDEN[r]||[]).includes(t))b.use='garden';else if((QC_COURT[r]||[]).includes(t))b.courtyard=true;}
// ---------------------------------------------------------------- the instance: the site's steps, then the blocks filled
const QC_TUNE={cell:2.5,rasterHalf:1000,maxSlope:.35,exact:true,width:{avenue:12,main:8,side:5.5,alley:3,highway:10,lane:4.5},
 lot:{side:1.6,setback:1.4,rear:3,inset:1.0,step:3},classes:{middle:[['qb_row_mid',0]],poor:[['qb_row_poor',0]]},fallback:{middle:'poor',poor:null}};
let QC_PLAN=null,QC_ERR=null;
try{
 const steps=KCITY.squares.steps(QC_S).concat([{name:'the blocks: frontage and courts',run(){
  const P=KCITY.lib.plan();P.courts=KCITY.squares.infill(QC_S,{step:6,pools:QC_POOLS,small:QC_SMALL,gaps:QC_GAPS});}}]);
 const C=KCITY.create({name:'qiblai',tune:QC_TUNE,seed:QC.SEED,rand:'krand',index:{order:'insertion'},ground:{h:qcGround},kit:{dims:qcDims},steps});
 QC_PLAN=C.run();QC.instance=C;
}catch(e){QC_ERR=e;reportErr('qiblai: the site did not lay: '+(e&&e.stack||e));}

// ---------------------------------------------------------------- what 90r places: one record per building, in chunks
// {key, x, z, ry, o: {v, y, ends}, h, kind}; the lots from the infill, then the site's own buildings
const QC_PLACE=[];
const qcV=(key,id)=>{const n=qcD(VERN.defs[key]&&VERN.defs[key].nv,3);return qcHash(String(id)+key)%Math.min(n,3);};
if(QC_PLAN&&QC_PLAN.courts){
 // the courtyards: in a QC_COURT block a square about the block's centre, one size a ring so the pattern keeps its symmetry
 // (QC_COURT_S: half its side; 48 m in the rich ring, 44 m beyond), is cleared of every house standing in it, 2 m clear; the
 // frontage round it stays. b.court is that square, for the garden (below), the ground and the flora
 const qcFoot=L=>{const q=Math.abs(Math.sin(L.ry))>.7,hx=(q?L.d:L.w)/2,hz=(q?L.w:L.d)/2;return[L.x-hx,L.z-hz,L.x+hx,L.z+hz];};
 const qcHit=(A,B,m)=>A[0]<B[2]+m&&A[2]>B[0]-m&&A[1]<B[3]+m&&A[3]>B[1]-m;
 const QC_COURT_S={4:24,5:22,6:22,7:22},inCourt={},byBlock={};
 for(const L of QC_PLAN.courts.lots)(byBlock[L.court]=byBlock[L.court]||[]).push(L);
 for(const b of QC_S.blocks){if(!b.courtyard)continue;const c=qcCentre(b),s=qcD(QC_COURT_S[qcRT(b)[0]],22);
  b.court=[c[0]-s,c[1]-s,c[0]+s,c[1]+s];
  for(const L of byBlock[b.id]||[])if(qcHit(qcFoot(L),b.court,2))inCourt[L.id]=true;}
 const lots=QC_PLAN.courts.lots.filter(L=>VERN.defs[L.key]&&!inCourt[L.id]);
 for(const L of lots)QC_PLACE.push({key:L.key,x:L.x,z:L.z,ry:L.ry,o:{v:qcV(L.key,L.id),y:L.y},kind:'lot',cls:L.cls,id:'lot:'+L.id,w:VERN.defs[L.key].w,h:qcD(VERN.defs[L.key].h,10)});
 // row houses on party walls: a neighbour of the same row kind, the same yaw, touching on a side, closes that side (o.ends)
 const rows=QC_PLACE.filter(p=>/^qb_row_/.test(p.key)),grid={},cell=40,gk=(x,z)=>Math.floor(x/cell)+','+Math.floor(z/cell);
 for(const p of rows){(grid[gk(p.x,p.z)]=grid[gk(p.x,p.z)]||[]).push(p);}
 for(const p of rows){const ux=Math.cos(p.ry),uz=-Math.sin(p.ry);let l=false,r=false;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const q of(grid[(Math.floor(p.x/cell)+i)+','+(Math.floor(p.z/cell)+j)]||[])){
   if(q===p||Math.abs(q.ry-p.ry)>.05)continue;const dx=q.x-p.x,dz=q.z-p.z,along=dx*ux+dz*uz,across=Math.abs(dz*ux-dx*uz);
   if(across>1.5||Math.abs(Math.abs(along)-(p.w+q.w)/2)>1.2)continue;if(along<0)l=true;else r=true;}
  p.o.ends=(l?'':'l')+(r?'':'r');}
}
// the Temple Mountain on its landmark lot (unturned: the Rainbow Temple's banners face true bearings)
const QC_LM=QC_S.landmark;
QC_PLACE.push({key:'qb_temple_mountain',x:QC_LM.x,z:QC_LM.z,ry:0,o:{v:0,y:QC_LM.level},kind:'landmark',id:'landmark',h:52});
// the eight great monasteries on their spoke blocks: a whole block faces the centre along its north-south axis; an axial
// spoke's two halves face their avenue (qb_monastery_half), the avenue between them (the owner, 2026-11-11)
const qcBlock={};for(const b of QC_S.blocks)qcBlock[b.id]=b;
const QC_FACE={w:Math.PI/2,e:-Math.PI/2,n:0,s:Math.PI};   // a half block's front toward its avenue
for(const M of QC_S.monasteries){const bl=M.blocks.map(id=>qcBlock[id]).filter(Boolean);
 if(bl.length===1&&!bl[0].half){const b=bl[0],c=qcCentre(b);QC_PLACE.push({key:'qb_monastery',x:c[0],z:c[1],ry:c[1]<0?0:Math.PI,o:{v:M.spoke,y:b.level},kind:'monastery',spoke:M.spoke,id:M.id,h:28});}
 else for(const b of bl){const c=qcCentre(b);QC_PLACE.push({key:'qb_monastery_half',x:c[0],z:c[1],ry:qcD(QC_FACE[b.half],0),o:{v:M.spoke,y:b.level},kind:'monastery',spoke:M.spoke,id:M.id+':'+b.half,h:24});}}
// the gate markets, either side of the avenue on ring 2's axial blocks
for(const K of QC_S.markets)for(const id of K.blocks){const b=qcBlock[id];if(!b)continue;const c=qcCentre(b);
 QC_PLACE.push({key:b.half?'qb_gate_market_half':'qb_gate_market',x:c[0],z:c[1],ry:qcD(QC_FACE[b.half],0),o:{v:0,y:b.level},kind:'market',id:K.id+':'+id,h:11});}
// the gardens: the Xanadu kit's public garden (a chahar-bagh, 42 x 36 m) at each garden block's centre and in each courtyard,
// its front toward the centre along the block's longer offset, its variant by ring: mirrored blocks get the same garden
const qcToCentre=b=>Math.abs(b.a)>Math.abs(b.b)?(b.a<0?Math.PI/2:-Math.PI/2):(b.b<0?0:Math.PI);
for(const b of QC_S.blocks)if(b.use==='garden'){const c=qcCentre(b);QC_PLACE.push({key:'xa_garden',x:c[0],z:c[1],ry:qcToCentre(b),o:{v:qcRT(b)[0]%3,y:b.level},kind:'garden',id:'garden:'+b.id,h:9});}
const QC_COURTS=QC_S.blocks.filter(b=>b.court);
for(const b of QC_COURTS){const c=qcCentre(b);QC_PLACE.push({key:'xa_garden',x:c[0],z:c[1],ry:qcToCentre(b),o:{v:qcRT(b)[0]%3,y:b.level},kind:'court',id:'court:'+b.id,h:9});}
// ---------------------------------------------------------------- the temple estates' fields round the walls (PLAN.md 3: "outside the
// wall: the chahar-bagh gardens and the temple estates' farms"): a belt of strips 40-620 m out, on a 64 x 150 m pitch, each
// tilled soil, a standing crop or fallow by a hash of its cell; none on the roads, the ghat way or the river's banks
const QC_FIELDS=[];
{const B=QC_B,P=[64,150],near=40,far=620;
 for(let i=Math.floor((B.x0-far)/P[0]);i<=Math.ceil((B.x1+far)/P[0]);i++)for(let j=Math.floor((B.z0-far)/P[1]);j<=Math.ceil((B.z1+far)/P[1]);j++){
  const x0=i*P[0]+3,x1=(i+1)*P[0]-3,z0=j*P[1]+3,z1=(j+1)*P[1]-3,cx=(x0+x1)/2,cz=(z0+z1)/2;
  const dOut=Math.max(B.x0-x1,x0-B.x1,B.z0-z1,z0-B.z1);if(dOut<near||dOut>far)continue;   // the belt only
  if(Math.abs(cx)<P[0]&&cz>B.z1)continue;if(Math.abs(cz)<P[1]*.6&&cx>B.x1)continue;        // the road south, the ghat way
  if(x1>QC_RIVER.x-QC_RIVER.w/2-60)continue;                                               // the river's banks
  const h=qcHash('field:'+i+':'+j)%100;if(h<22)continue;                                   // a meadow left between
  QC_FIELDS.push({box:[x0,z0,x1,z1],kind:h<52?'tilled':h<84?'crop':'fallow',id:'field:'+i+':'+j});}}
// ---------------------------------------------------------------- the flora's mask and climate (the Vale of Xanadu biome, Xanadu's page
// carries it: a stand-in until the site's Af lowland biome is bound, KNOWN_ISSUES.md). From the plan's records, never from pixels:
// the country wild (1) but for the fields and a 30 m margin under the walls; inside the square, the gardens planted (.65) and the
// odd tree in a block (.05), never within a building's footprint (core/space's index of what the plan places) or on a way
const qcSpace=KCITY.lib.KSPACE.create({cell:40}),qcBlocks=KCITY.lib.KSPACE.create({cell:120});
for(const p of QC_PLACE){const D=VERN.defs[p.key];if(D)qcSpace.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5);}
for(const b of QC_S.blocks){const c=qcCentre(b);qcBlocks.insert(b,c[0],c[1],Math.hypot(b.box[2]-b.box[0],b.box[3]-b.box[1])/2);}
const qcInBox=(B,x,z,m)=>x>B[0]-qcD(m,0)&&x<B[2]+qcD(m,0)&&z>B[1]-qcD(m,0)&&z<B[3]+qcD(m,0);
const qcFieldAt=(x,z)=>{for(const f of QC_FIELDS)if(qcInBox(f.box,x,z,2))return f;return null;};
function qcBioMask(x,z){const B=QC_B;
 if(x>QC_RIVER.x-QC_RIVER.w/2-6&&x<QC_RIVER.x+QC_RIVER.w/2+6)return 0;                    // the water
 if(x<B.x0-30||x>B.x1+30||z<B.z0-30||z>B.z1+30){if(Math.abs(z)<9&&x>B.x1)return 0;if(Math.abs(x)<8&&z>B.z1)return 0;return qcFieldAt(x,z)?0:1;}
 if(x<B.x0||x>B.x1||z<B.z0||z>B.z1)return 0;                                                  // the walls' margin
 let blk=null;for(const b of qcBlocks.query(x,z,1))if(qcInBox(b.box,x,z,-1)){blk=b;break;}if(!blk)return 0;   // a way, a wall
 for(const p of qcSpace.query(x,z,1)){const D=VERN.defs[p.key],r=Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5;if(Math.hypot(x-p.x,z-p.z)<r)return 0;}
 if(blk.court&&qcInBox(blk.court,x,z,-1))return .65;                                          // a courtyard
 return blk.use==='garden'?.65:.05;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:qcBioMask,origin:[[0,0],[QC_RIVER.x,0],[0,QC_B.z1+300]],center:[400,0],
 fields:{wet:(x,z)=>Math.min(1,.78+(qcFieldAt(x,z)?.0:.06)+Math.max(0,1-Math.abs(x-QC_RIVER.x)/120)*.2),salt:()=>0,upland:()=>0,
  flow:(x,z)=>Math.max(0,1-Math.abs(x-QC_RIVER.x)/(QC_RIVER.w/2+40)),mist:()=>0}});}
// ---------------------------------------------------------------- the people (PLAN.md, kits/qiblai/PLAN.md section 3's table)
// residents a building holds, by key (est.: a household of 6-7, servants in the rich houses, the monks of a monastery, the
// staff of the hostels and halls; pilgrims are not residents); summed by ring and checked against the plan's table in verify
const QC_PEOPLE={qb_row_poor:6,qb_row_mid:7,qb_row_rich:9,qb_corner_house:7,qb_court_house:14,xa_poor_a:6,xa_poor_b:12,xa_poor_c:4,xa_mid_a:7,xa_mid_b:9,xa_mid_c:16,
 xa_rich_a:12,xa_rich_c:11,qb_shop_row:8,qb_bakery:5,qb_butcher:5,qb_weaver:6,qb_brewhouse:5,qb_tannery:5,qb_workshop:5,qb_hostel:25,qb_guild_gold:6,qb_guild_mason:6,
 qb_guild_spice:6,qb_guild_lodge:4,qb_wheel_house:2,qb_bath:6,qb_college:60,qb_granary:4,qb_monastery:300,qb_monastery_half:150,qb_gate_market:30,qb_gate_market_half:15,
 xa_garden:4,qb_temple_mountain:400};
const qcRingOf=(x,z)=>{const c=Math.max(Math.abs(x-QC_LM.x),Math.abs(z-QC_LM.z));for(let k=0;k<QC_S.rings.length;k++)if(c<=QC_S.rings[k].half)return k;return -1;};
const QC_POP={temple:0,clergy:0,kora:0,lay:0,outside:0};
for(const p of QC_PLACE){const k=qcRingOf(p.x,p.z),kind=k<0?'outside':QC_S.rings[k].kind;QC_POP[kind]=qcD(QC_POP[kind],0)+qcD(QC_PEOPLE[p.key],0);}
QC_POP.total=QC_POP.temple+QC_POP.clergy+QC_POP.kora+QC_POP.lay;
window._qiblaiPlan={err:QC_ERR?String(QC_ERR):null,place:QC_PLACE.length,lots:QC_PLAN&&QC_PLAN.courts?QC_PLAN.courts.lots.length:0,
 people:QC_POP,blocks:QC_S.blocks.length,ways:QC_S.ways.length,walls:QC_S.walls.length,monasteries:QC_S.monasteries.length,markets:QC_S.markets.length};
