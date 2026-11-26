// ================================================================= SW HIGHLANDS — Span's tableland's flora (station 3): species, pass, sheet
// Span's tableland (PLAN.md section 7, station 3; ~2.5-3 km): slot canyons in the pillar sandstone, hanging swamps on the seepage
// ledges, beehive domes. The hanging swamps: CELL LAMPS (refs/18, a hand of yellow cells in the seep pools, its offspring the gold
// spheres floating round it), WING REEDS (refs/03, dark stalks under patterned wing leaves, in stands), BULB TRUMPETS (refs/20 E,
// purple spotted trumpets on red bulbs). The open tableland: torch spikes, bead coral and cushion sponges (57, station 4's), anemone
// trees on the domes. DRIP CAPS (refs/19) are an item for the dress pass on posts, piers and ruins (Span's arcology), not placed here.
// Not yet (PLAN.md section 3): the tier cedar and the flayed madrone, read in place from biomes/swlowlands when the station's page
// carries its fragments (as the treeline reads ehighlands').
// The host's fields (station 3's stage owes them): table (the open tableland), swamp (a hanging swamp's ledge), pool (its seep pools),
// dome (a beehive dome's top), wet, slope. KRAND by cell.
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PICK=SWHI.PICK,FL=SWHI.FL,QE=FL.QE,B=SWHI.BUILD,PF=SWHI.FLOOR_PILLARS;
const {lin3,VA,VG,armInto,blobInto,leafInto,lerpC}=SWHI.GB;
const Y=(x,z)=>BIO.terrainH(x,z);
const tag=(o,h)=>Object.assign({},SWHI.TAGS,o,{harvest:Object.assign({wood:'none',edible:[],medicinal:false,notes:''},h||{})});
SWHI.PLANTS.push(
 {label:'Cell lamp',name:'Cell lamp',tags:tag({riparian:'yes'},{notes:'a hand of yellow cells in a seep pool; the gold spheres round it are its offspring'})},
 {label:'Wing reed',name:'Wing reed',tags:tag({riparian:'yes'},{notes:'dark stalks with patterned wing-shaped leaves, in stands'})},
 {label:'Bulb trumpets',name:'Bulb trumpets',tags:tag({riparian:'yes'},{notes:'purple spotted trumpets on red bulbs: the swamps\' meat-eaters'})},
 {label:'Drip cap',name:'Drip cap (on structures)',tags:tag({},{notes:'an orange cap that grows on posts, piers and ruins and drips (the dress pass)'})});
const M=SWHI.MAT,TINT=[0xffffff,0xf4f4f0,0xf0f4ff];
M.lamp=BIO.barkMat(SWHI.TX.flesh);M.lamp.emissive=new T3.Color(0x3a3000);   /* the cells' yellow lit a little from within */
M.lampSeed=BIO.barkMat(null);M.lampSeed.emissive=new T3.Color(0x6a5a10);
// ---------------------------------------------------------------- geometries
// a lathe of rings along a bent axis, coloured per vertex: col(a, t) for the angle round it and the height along it
function latheInto(A,base,bend,H,rf,col,seg,rings){for(let i=0;i<rings;i++){const t0=i/rings,t1=(i+1)/rings;
  const ring=t=>{const c=[base[0]+bend[0]*t*t*H,base[1]+t*H,base[2]+bend[1]*t*t*H],r=rf(t);return a=>({p:[c[0]+Math.cos(a)*r,c[1],c[2]+Math.sin(a)*r],n:[Math.cos(a),.2,Math.sin(a)],c:col(a,t)});};
  const R0=ring(t0),R1=ring(t1);for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,q=[R0(a0),R0(a1),R1(a1),R1(a0)];
   [0,2,1,0,3,2].forEach(k=>{const Q=q[k];A.pos.push(Q.p[0],Q.p[1],Q.p[2]);A.nor.push(Q.n[0],Q.n[1],Q.n[2]);A.uv.push((s+(k===1||k===2?1:0))/seg,k>1?t1:t0);A.col.push(Q.c[0],Q.c[1],Q.c[2]);});}}}
// THE CELL LAMP: a hand of four fingers, thick and rounded, yellow cells divided by dark lines (1 tall)
function lampGeo(){const A=VA(),Yc=lin3(0xe8d020),Dk=lin3(0x1a1a10);
 [[0,0,1,[.15,.05]],[.18,.05,.75,[.35,.1]],[-.16,.06,.6,[-.4,.15]],[.05,-.17,.45,[.1,-.45]]].forEach((f,k)=>{
  latheInto(A,[f[0],0,f[1]],f[3],f[2],t=>.11*(1-.25*t)*(t>.92?Math.sqrt(Math.max(0,1-(t-.92)/.08)):1)+.01,(a,t)=>{const u=a/TAU*7+Math.floor(t*f[2]*14)*.5,v=t*f[2]*14;
   const e=Math.min(Math.abs(u-Math.round(u)),Math.abs(v-Math.round(v)));return e<.13?Dk:Yc;},14,22);});
 return VG(A);}
// wing reed: three dark stalks swelling into green bulb segments at the foot, each under a pair of wing leaves, dark with a gold vein (1.2 tall)
function reedGeo(){const A=VA(),St=lin3(0x3a2a44),Bu=lin3(0x5a7a3a),Wd=lin3(0x2a1e2a),Wg=lin3(0xd0a030);
 for(let k=0;k<3;k++){const a=k/3*TAU+.3,d=.06,b=[Math.cos(a)*d,0,Math.sin(a)*d],h=.85+.2*k,top=[b[0]*2,h,b[2]*2];
  for(let j=0;j<3;j++)blobInto(A,[b[0],.06+j*.09,b[2]],.055-j*.008,1.2,0,.08,141+j,()=>Bu);
  armInto(A,[b[0],.2,b[2]],top,.025,.018,5,St);
  for(let w=0;w<2;w++){const c=a+(w?1.2:-1.2)+Math.PI*.5,ca=Math.cos(c),sa=Math.sin(c),L=.3,W=.16,P=[[0,0],[L*.35,W],[L,W*.6],[L*.8,-W*.1],[L*.35,-W*.5]];
   const Q=P.map(p=>[top[0]+ca*p[0],top[1]+p[0]*.4+p[1]*.6,top[2]+sa*p[0]]),cen=[top[0]+ca*L*.45,top[1]+L*.2,top[2]+sa*L*.45];
   for(let i=0;i<Q.length;i++){const p=Q[i],q=Q[(i+1)%Q.length];[[cen,Wg],[p,Wd],[q,Wd]].forEach(v=>{A.pos.push(v[0][0],v[0][1],v[0][2]);A.nor.push(-sa,.3,ca);A.uv.push(.5,.5);A.col.push(v[1][0],v[1][1],v[1][2]);});}}}
 return VG(A);}
// bulb trumpets: three red bulbs, from each a purple trumpet spotted pale, widening to a dark mouth with a cream spike in it (1 tall)
function trumpetGeo(){const A=VA(),Rd=lin3(0xd04838),Pu=lin3(0xc87ac8),Sp=lin3(0xe8c8e8),Mo=lin3(0x2a1030),Cr=lin3(0xe8e0b0);
 for(let k=0;k<3;k++){const a=k/3*TAU+.2,b=[Math.cos(a)*.13,0,Math.sin(a)*.13];blobInto(A,[b[0],.08,b[2]],.14,.75,1,.06,145+k,y=>lerpC(lin3(0x8a2a20),Rd,y));
  const h=.55+.15*k;latheInto(A,[b[0],.15,b[2]],[b[0]*.6,b[2]*.6],h,t=>.035+.1*Math.pow(t,2.2),(an,t)=>t>.94?Mo:(Math.cos(an*9)*Math.cos(t*30)>.6?Sp:Pu),8,8);
  armInto(A,[b[0]*1.3,.15+h*.85,b[2]*1.3],[b[0]*1.5,.15+h*1.25,b[2]*1.5],.035,.005,5,Cr);}
 return VG(A);}
// a drip cap: a lumpy orange cap, drips hanging from its rim (radius 1; its foot at 0, it sits on a post's top)
function dripGeo(){const A=VA(),O0=lin3(0x8a3a10),O1=lin3(0xe07a30);blobInto(A,[0,.25,0],.55,.7,1,.3,148,y=>lerpC(O0,O1,y));
 for(let k=0;k<6;k++){const a=k/6*TAU+.3,r=.45;blobInto(A,[Math.cos(a)*r,-.05-.08*(k%3),Math.sin(a)*r],.09,2.2,0,.1,149,()=>O0);}return VG(A);}
const G=SWHI.GEO;
Object.assign(G,{celllamp:lampGeo(),wingreed:reedGeo(),trumpets:trumpetGeo(),dripcap:dripGeo()});
{const A=VA();blobInto(A,[0,0,0],1,1,1,.04,150,()=>lin3(0xe0a810));G.lampseed=VG(A);}
BIO.def('celllamp',G.celllamp,M.lamp,{label:'Cell lamp'});
BIO.def('lampseed',G.lampseed,M.lampSeed,{label:'Cell lamp'});
BIO.def('wingreed',G.wingreed,M.rimBody,{label:'Wing reed'});
BIO.def('trumpets',G.trumpets,M.rimBody,{label:'Bulb trumpets'});
BIO.def('dripcap',G.dripcap,M.rimBody,{label:'Drip cap'});
// ---------------------------------------------------------------- the floor's puts
const FLOOR=SWHI.FLOOR_TABLELAND={
 lamp:(x,y,z,s)=>{const h=s.range(.7,1.4);BIO.put('celllamp',[x,y-.1,z],QE(s.range(-.15,.15),s.range(0,TAU),s.range(-.15,.15)),[h,h,h],PICK(TINT,s.next()),{label:'Cell lamp'});
  const n=s.int(3,7);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(.5,2.2)*h,r=s.range(.05,.16),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;BIO.put('lampseed',[px,Y(px,pz)+r*.4,pz],null,r,0xffffff,{label:'Cell lamp'});}return 1;},
 reed:(x,y,z,s)=>{const n=s.int(3,8);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1.6),h=s.range(.9,1.8),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('wingreed',[px,Y(px,pz)-.04,pz],QE(s.range(-.08,.08),s.range(0,TAU),s.range(-.08,.08)),[h,h,h],PICK(TINT,s.next()),{label:'Wing reed'});}return n;},
 trumpets:(x,y,z,s)=>{const h=s.range(.6,1.2);BIO.put('trumpets',[x,y-.05,z],QE(0,s.range(0,TAU),0),[h,h,h],PICK(TINT,s.next()),{label:'Bulb trumpets'});return 1;},
 drip:(x,y,z,s)=>{const w=s.range(.4,.8),h=s.range(.9,1.6);BIO.put('stone',[x,y+h*.3,z],QE(0,s.range(0,TAU),0),[.35,h,.35],PICK(SWHI.PAL.stone,s.next()),{label:'A post (for the drip cap)'});
  BIO.put('dripcap',[x,y+h*.85,z],QE(0,s.range(0,TAU),0),[w,w,w],PICK(TINT,s.next()),{label:'Drip cap'});return 1;}};
// ---------------------------------------------------------------- the pass (station 3)
SWHI.tableZones=function(x,z){const f=n=>BIO.field(n,x,z),table=f('table'),swamp=f('swamp'),pool=f('pool'),dome=f('dome'),wet=f('wet'),open=smooth(1.05,.6,f('slope'));
 return{table,swamp,pool,dome,wet,open,anem:dome*open,lamp:pool,reed:swamp*(1-pool)*open,trumpets:swamp*(1-pool)*open*.6,
  torch:table*(1-swamp)*open,coral:table*(1-swamp)*open,cushion:(table*.3+dome*.6)*open,turf:table*(1-swamp)*open,moss:(swamp*.7+dome*.4)*open};};
SWHI.buildTableland=function(box,q){q=q==null?1:q;const st={heroes:0,light:0,far:0,trunk:0,root:0,tent:0,blocks:0},TREES=SWHI.TREES;TREES.length=0;const HOLD=KSPACE.create({cell:12}),k=Math.sqrt(1/q);
 const clearOf=(x,z,r)=>!HOLD.some(x,z,r,o=>Math.hypot(o.x-x,o.z-z)<o.r+r),hold=(x,z,r)=>HOLD.insert({x,z,r},x,z,r);
 SWHI.cells(11*k,901,box,(x,z)=>SWHI.tableZones(x,z).anem*.6,(x,y,z,sd)=>{if(!clearOf(x,z,2.5))return false;const T=FL.mk(x,y,z,KEY.anemonetree,sd,FL.lvOf);T.H*=.8;TREES.push(T);hold(x,z,T.crownR*.7);return true;});
 FL.draw(TREES,st,'tableland','impTableland');
 const F=Object.assign({},PF,FLOOR),pass=(item,cell,salt,R,accept)=>{BIO.range=R;BIO.minRange=0;SWHI.cells(cell*k,salt,box,(x,z)=>BIO.lodD(x,z)<R?accept(SWHI.tableZones(x,z)):0,(x,y,z,sd)=>{if(!clearOf(x,z,.4))return false;st[item]=(st[item]||0)+F[item](x,y,z,KRAND.stream(sd));return true;});};
 const L=SWHI.LOD.floor;
 pass('lamp',5,902,L,Z=>Z.lamp*.4);pass('reed',4,903,L,Z=>Z.reed*.45);pass('trumpets',6,904,L,Z=>Z.trumpets*.4);
 pass('torch',4.5,905,L,Z=>Z.torch*.3);pass('coral',8,906,L,Z=>Z.coral*.35);pass('cushion',6,907,520,Z=>Z.cushion*.5);pass('turf',3,908,L,Z=>Z.turf*.7);pass('moss',3.4,909,L,Z=>Z.moss*.7);
 BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,bySpecies:'anemonetree:'+TREES.length,floor:['lamp','reed','trumpets','torch','coral','cushion','turf','moss'].reduce((m,i)=>{m[i]=st[i]||0;return m;},{})};};
// ---------------------------------------------------------------- the preview sheet
SWHI.SHEETS.tableland=(x0,z0,a)=>FL.lay(x0,z0,a,{gap:11,bedGap:10,salt:3,
 trees:[['anemonetree',1],['anemonetree',2]],
 beds:[['cell lamps',FLOOR.lamp,3,3],['wing reeds',FLOOR.reed,4,3],['bulb trumpets',FLOOR.trumpets,7,3.5],['drip caps',FLOOR.drip,3,2.5],['torch spikes',PF.torch,8,4],['bead coral',PF.coral,5,4]]});
})();
