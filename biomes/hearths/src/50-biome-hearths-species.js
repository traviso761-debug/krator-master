// ================================================================= HEARTHS — the shared life of the vent fields on cold high ground (biomes/hearths/PLAN.md)
// No page of its own: read in place by its hosts' stations (oidong --station hearths first, 2026-11-03; riftrim, godstep and geyser's Stills later), each
// naming these fragments in its station.json ("kin"), so they load in their own registry (BIO.kit('hearths')). Section 7's flora, the parts drawn on the
// core: the fans fold on BIO.animMat's breath (35-core-anim.js, shape 'fold', key 'hearths'), the stalks and feet are BIO.fung parts (33-core-fungoid.js),
// the stalks lean toward the sun's mean bearing (39-core-lean.js), the heat is KTHERM's (core/terrain/47-core-therm.js). Working names (section 17).
//
//   HEARTH.SPECIES, PLANTS, HARVEST, byKey   the records, tagged as every kit's (BIOME-API.md); a host's inspector reads them
//   HEARTH.work(t, W, atm)   the engine's state, 0 (folded spindles) .. 1 (fans open flat): the night (the sun's altitude under the horizon), the eclipse
//                            (ATMOS.sunHidden at the host's site), cloud closing it (W.cloud), thin air working less (atm); one write a frame to
//                            BIO.breathState('hearths')
//   HEARTH.DRESS             the two countries' dress (section 7a): 'cold' (Oidong's rim: many narrow fans low on short stalks) and 'rim' (broad, few, high)
//   HEARTH.parts(dress)      defines the items in the current registry (BIO.def), once per page
// [G data] but for parts(), which builds geometry (BIO.def): the host's 47 slot runs it.
const HEARTH=(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible,medicinal:!!medicinal,note:note||''});
const SPECIES=[
 {key:'hearth',name:'Hearth tree',how:'a limpet foot on the warm ground, a heat-pipe stalk, a crown of black ribbed fans that open flat to the night sky and fold into a silver spindle by day',
  tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[25,60]})},
 {key:'stalkdead',name:'Dead stalk',how:'a hearth tree whose ground went cold: the foot gone, the stalk hollow and white; on the Cold Hearths snapped by the wind and lying in rings',
  tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[-30,10]})},
 /* THE STILLS (section 7b; the owner, 2026-11-02: at all three geyser sites): the hot-country cousin, on boiling water and the sea wind; the geyser kit's
    station is the first to draw them (biomes/geyser --station stills, 2026-11-03), 57-biome-hearths-stills.js places them */
 {key:'still',name:'Still tree',how:'a foot in a boiling spring or on a geyser\'s cone, a 30 cm heat-pipe stalk 15-30 m, black fans held across the sea wind in a sail and turned edge-on to the sun; the ring round a geyser folds its sails on the warning and opens them as the column falls',
  tags:K('tropical','humid','no',['XA','Af','Aw','XV'],{heat:[95,120],kin:'hearth'})},
 {key:'stillglass',name:'Glass still',how:'a still tree whose spring went cold: silicified where it stood, white and glassy, hollow, ringing when struck',
  tags:K('tropical','humid','no',['XA','Af','Aw','XV'],{heat:[33,70],kin:'stalkdead'})}];
const PLANTS={
 ember:{name:'Ember mat',items:['hember'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[60,95]})},
 coal:{name:'Coal moss',items:['hcoal'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[20,40]})},
 stoker:{name:'Stoker',items:['hstoker','hfin'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[10,25]})},
 tallow:{name:'Tallow bead',items:['htallow'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[25,60]})},
 sailcup:{name:'Sail cup',items:['scup','scupfan'],tags:K('tropical','humid','no',['XA','Af','Aw','XV'],{heat:[40,80]})},
 spraymat:{name:'Spray mat',items:['sspray'],tags:K('tropical','humid','no',['XA','Af','Aw','XV'],{heat:[60,100]})}};
const HARVEST={hearth:HV('pipes (a fallen stalk, cut: the Tungangs\')',['wax (the tallow beads)'],true,'The hearth wax is food and light; nobody fells a living hearth.'),
 stalkdead:HV('pipes, fuel',[],false,'A fallen stalk is a pipe ready-made.'),ember:HV('none',[],false,''),coal:HV('stuffing (dried: bedding)',[],false,'Warm to lie on; the animals sleep on it.'),
 stoker:HV('none',[],false,'The stokers point the way the heat is moving.'),
 still:HV('pipes (a glass still, cut: a horn)',['wax (runs in the heat, pooled at the foot)'],true,'Proposed: the isles\' lamp oil.'),stillglass:HV('pipes (cut into horns)',[],false,'Hollow; it rings when struck.'),
 sailcup:HV('none',[],false,'The run-off\'s one native.'),spraymat:HV('none',[],false,'Regrows after each eruption.'),tallow:HV('none',['wax (eaten, burned)'],true,'Sets hard on cold nights; gathered at dawn.')};
SPECIES.forEach((S,i)=>{S.i=i;S.tags.harvest=HARVEST[S.key];});for(const k in PLANTS)PLANTS[k].tags.harvest=HARVEST[k];
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);
// the two countries (section 7a): fan count and length, the stalk's height range, the crown's height over the stalk, the fans' rib count
const DRESS={cold:{fans:[14,22],fanL:[.7,1.2],stalk:[1.2,3.2],ribs:9,spindle:0xd8dde4,green:.08,dead:'fallen'},
 rim:{fans:[8,12],fanL:[1.2,2.0],stalk:[4,11],ribs:6,spindle:0xb8c0bc,green:.25,dead:'broken'},
 hot:{fans:[12,20],fanL:[2,4],stalk:[15,30],ribs:6,spindle:0x1c1c1e,green:.05,dead:'glass'}};
// THE ENGINE'S STATE: open by night and in eclipse, shut by day; cloud shuts it (no cold sky to radiate to), thin air a little. t the host clock's days,
// sunAlt the sun's altitude (degrees) or null, hidden the eclipse's share (ATMOS.sunHidden), W the weather {cloud 0..1}
function work(t,o){o=o||{};const alt=o.sunAlt==null?0:o.sunAlt,hid=o.hidden||0,cloud=o.W&&o.W.cloud!=null?o.W.cloud:0;
 const night=smooth(4,-6,alt),open=Math.max(night,hid);return clamp(open*(1-.7*smooth(.3,.9,cloud))*(o.atm==null?1:mix(.85,1,clamp(o.atm,0,1))),0,1);}
// THE PARTS (BIO.def in the current registry). The fan: a ribbed blade 1 long, its hinge at the origin, lying UP the y axis and across z (so the breath's
// fold, a turn about local z, lays it flat along +x); its ribs are ridges in the vertex shade. The rest are BIO.fung parts.
function fanGeo(ribs){const T=BIO.host.THREE,pos=[],nor=[],col=[],idx=[],NL=6,NW=ribs*2;
 for(let j=0;j<=NL;j++)for(let i=0;i<=NW;i++){const v=j/NL,u=i/NW-.5,w=.42*Math.sin(Math.PI*Math.min(1,v*1.15+.05))*(1-.35*v),rib=i%2?0:1,y=v,z=u*w*2,x=.012*rib*(1-v);
  pos.push(x,y,z);nor.push(1,0,0);const s=(rib?1.15:.8)*(.75+.35*v);col.push(s,s,s);}
 for(let j=0;j<NL;j++)for(let i=0;i<NW;i++){const a=j*(NW+1)+i,b=a+NW+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(pos.map((v,k)=>k%3===1?v:0).filter((v,k)=>k%3!==2),2));g.setIndex(idx);return g;}
let DONE=false;
function parts(dress){if(DONE)return;DONE=true;const D=DRESS[dress||'cold'],T=BIO.host.THREE;
 const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;};
 /* the fans fold on the breath: 1.45 rad from upright (the spindle) to flat (open); the spindle's silver is the albedo at a closed state, the fan's black open */
 const fan=BIO.animMat('hearths:fan',{mode:'breath',vertexColors:true,breath:{key:'hearths',shape:'fold',amp:-1.45,albedo:.35}});
 BIO.def('hfan',fanGeo(D.ribs),fan,{label:'Hearth tree (fans)'});
 BIO.def('hstalk',BIO.fung.stalk({r0:.09,r1:.06,ribs:5,ribA:.1,seg:7,rings:5}),solid(),{label:'Hearth tree (stalk)'});
 BIO.def('hfoot',BIO.fung.cap({form:'dome',h:.32,seg:12,rings:3,lump:.12,under:'none',seed:7101}),solid(),{label:'Hearth tree (foot)'});
 BIO.def('hdead',BIO.fung.stalk({r0:.09,r1:.07,ribs:5,ribA:.08,seg:6,rings:3}),solid(),{label:'Dead stalk'});
 BIO.def('hember',BIO.fung.crust({lobes:7,lobeA:.3,seg:18,rings:2,seed:7102}),solid(),{label:'Ember mat'});
 BIO.def('hcoal',BIO.fung.crust({lobes:5,lobeA:.4,seg:12,rings:2,seed:7103}),solid(),{label:'Coal moss'});
 BIO.def('hstoker',BIO.fung.stalk({r0:.05,r1:.035,bend:.1,seg:5,rings:4}),solid(),{label:'Stoker'});
 BIO.def('hfin',BIO.fung.comb({w:.08,d:.05,tilt:.6,lobes:2,seg:4}),solid(),{label:'Stoker (fins)'});
 BIO.def('htallow',BIO.fung.bladder({swell:.9,neck:.4,pleats:0,seg:6,rings:3,h:1}),solid(),{label:'Tallow bead'});}
// THE STILLS' PARTS (section 7b, 14 item 3), once per page. A SAIL is three fans side by side across local z (the fans' width), each hinged on the local z
// axis through the origin, which is the stalk's axis: the breath's fold (a turn about local z) swings the sail down-wind and furls it against the stalk
// (key 'stills:<geyser key>', one a geyser's ring, 'stills' for the springs' rings, which never fold), and the breath's turn (core/biome 35b, key
// 'stills:turn') yaws every sail about the stalk, aP1.y each tree's own heading across the wind. keys: the ring keys a page folds
const SAIL_FOLD=2.5;
function sailGeo(ribs){const T=BIO.host.THREE,one=fanGeo(ribs),P=one.attributes.position.array,N=one.attributes.normal.array,Cc=one.attributes.color.array,U=one.attributes.uv.array,I=one.index.array,
  pos=[],nor=[],col=[],uv=[],idx=[];[-.86,0,.86].forEach((dz,k)=>{const o=pos.length/3,h=k===1?1:.82;
  for(let i=0;i<P.length;i+=3){pos.push(P[i],P[i+1]*h,P[i+2]+dz);nor.push(N[i],N[i+1],N[i+2]);col.push(Cc[i],Cc[i+1],Cc[i+2]);}for(let i=0;i<U.length;i++)uv.push(U[i]);for(let i=0;i<I.length;i++)idx.push(I[i]+o);});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;}
const STILL_KEYS=[];
function stillParts(keys){if(STILL_KEYS.length)return STILL_KEYS;const D=DRESS.hot,T=BIO.host.THREE;
 const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;},geo=sailGeo(D.ribs);
 ['stills'].concat(keys||[]).forEach(k=>{const key=k==='stills'?'stills':'stills:'+k,item=k==='stills'?'ssail':'ssail:'+k;
  BIO.def(item,geo,BIO.animMat('hearths:'+item,{mode:'breath',vertexColors:true,breath:{key,shape:'fold',amp:SAIL_FOLD,turn:{key:'stills:turn',amp:2*Math.PI}}}),{label:'Still tree (sails)'});STILL_KEYS.push(item);});
 BIO.def('sstalk',BIO.fung.stalk({r0:.17,r1:.12,ribs:7,ribA:.08,seg:8,rings:7}),solid(),{label:'Still tree (stalk)'});
 BIO.def('sfoot',BIO.fung.cap({form:'dome',h:.28,seg:14,rings:3,lump:.18,under:'none',seed:7121}),solid(),{label:'Still tree (foot)'});
 BIO.def('sglass',BIO.fung.stalk({r0:.17,r1:.13,ribs:7,ribA:.06,seg:7,rings:4}),solid(),{label:'Glass still'});
 BIO.def('scup',BIO.fung.cap({form:'funnel',h:.6,seg:10,rings:3,lump:.1,under:'none',seed:7122}),solid(),{label:'Sail cup'});
 BIO.def('scupfan',fanGeo(5),solid(),{label:'Sail cup (its fan)'});
 BIO.def('sspray',BIO.fung.crust({lobes:6,lobeA:.35,seg:16,rings:2,seed:7123}),solid(),{label:'Spray mat'});
 BIO.def('stallow',BIO.fung.crust({lobes:4,lobeA:.25,seg:10,rings:2,seed:7124}),solid(),{label:'Still tree (tallow pooled at the foot)'});
 return STILL_KEYS;}
return{SPECIES,PLANTS,HARVEST,byKey,DRESS,work,parts,stillParts,SAIL_FOLD,
 plantOfItem:it=>{for(const k in PLANTS)if(PLANTS[k].items.indexOf(it)>=0)return PLANTS[k];if(/^ssail/.test(it)||it==='sstalk'||it==='sfoot'||it==='stallow')return byKey.still;if(it==='sglass')return byKey.stillglass;
  return['hfan','hstalk','hfoot'].indexOf(it)>=0?byKey.hearth:it==='hdead'?byKey.stalkdead:null;}};})();
