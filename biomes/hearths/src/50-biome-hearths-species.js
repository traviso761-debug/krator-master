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
  tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[-30,10]})}];
const PLANTS={
 ember:{name:'Ember mat',items:['hember'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[60,95]})},
 coal:{name:'Coal moss',items:['hcoal'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[20,40]})},
 stoker:{name:'Stoker',items:['hstoker','hfin'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[10,25]})},
 tallow:{name:'Tallow bead',items:['htallow'],tags:K('polar','semiarid','no',['ET','Dsc','Dfc'],{heat:[25,60]})}};
const HARVEST={hearth:HV('pipes (a fallen stalk, cut: the Tungangs\')',['wax (the tallow beads)'],true,'The hearth wax is food and light; nobody fells a living hearth.'),
 stalkdead:HV('pipes, fuel',[],false,'A fallen stalk is a pipe ready-made.'),ember:HV('none',[],false,''),coal:HV('stuffing (dried: bedding)',[],false,'Warm to lie on; the animals sleep on it.'),
 stoker:HV('none',[],false,'The stokers point the way the heat is moving.'),tallow:HV('none',['wax (eaten, burned)'],true,'Sets hard on cold nights; gathered at dawn.')};
SPECIES.forEach((S,i)=>{S.i=i;S.tags.harvest=HARVEST[S.key];});for(const k in PLANTS)PLANTS[k].tags.harvest=HARVEST[k];
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);
// the two countries (section 7a): fan count and length, the stalk's height range, the crown's height over the stalk, the fans' rib count
const DRESS={cold:{fans:[14,22],fanL:[.7,1.2],stalk:[1.2,3.2],ribs:9,spindle:0xd8dde4,green:.08,dead:'fallen'},
 rim:{fans:[8,12],fanL:[1.2,2.0],stalk:[4,11],ribs:6,spindle:0xb8c0bc,green:.25,dead:'broken'}};
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
return{SPECIES,PLANTS,HARVEST,byKey,DRESS,work,parts,
 plantOfItem:it=>{for(const k in PLANTS)if(PLANTS[k].items.indexOf(it)>=0)return PLANTS[k];return['hfan','hstalk','hfoot'].indexOf(it)>=0?byKey.hearth:it==='hdead'?byKey.stalkdead:null;}};})();
