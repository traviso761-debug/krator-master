// ================================================================= SW HIGHLANDS — the floor
// The small plants, by zone, each pass on its own KRAND cells (SWHI.cells: seeded by world, cell and salt): the native moss
// and club-moss of the cove floor, the ridge turf, and the bald's bulb heath and banded coral. THE BANDS (GRAPHIC-LOAD.md: a
// short far floor band): the moss, club-moss and turf to SWHI.LOD.floor (420 m) round the spine, the bald's plants (larger) to
// 700 m; past each the painted ground carries the colour (R5: the cards take its colour at the root and dissolve into it).
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,PAL=SWHI.PAL,PICK=SWHI.PICK;
const QE=(rx,ry,rz)=>new T3.Quaternion().setFromEuler(new T3.Euler(rx||0,ry||0,rz||0,'YXZ'));
SWHI.buildFloor=function(box,q){q=q==null?1:q;const st={moss:0,club:0,turf:0,heath:0,coral:0};
 const near=R=>(x,z)=>BIO.lodD(x,z)<R;
 const pass=(item,cell,salt,R,accept,put)=>{BIO.range=R;BIO.minRange=0;const inR=near(R),k=Math.sqrt(1/q);
  return SWHI.cells(cell*k,salt,box,(x,z)=>inR(x,z)?accept(SWHI.zones(x,z),x,z):0,(x,y,z,sd)=>{if(BIO.depth(x,z)>-.15)return false;const s=KRAND.stream(sd);put(x,y,z,s);st[item]++;return true;});};
 const L=SWHI.LOD.floor;
 // the cove's floor: moss everywhere under the oaks, club-moss where it is wettest
 pass('moss',3.8,401,L,Z=>Z.forest*(.3+.7*Z.cove)*(1-.5*Z.crest),(x,y,z,s)=>{const w=s.range(.6,1.3);
  BIO.put('moss',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.3,.5),w],PICK(PAL.moss,s.next()),{label:'Native moss'});});
 pass('club',4.5,402,L,Z=>Z.forest*Z.cove*smooth(.7,.95,Z.wet),(x,y,z,s)=>{const w=s.range(.4,.8);
  BIO.put('club',[x,y-.03,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.7,1.2),w],PICK(PAL.clubmoss,s.next()),{label:'Club-moss'});});
 // the turf: the crests' open ground and the bald
 pass('turf',3.4,403,L,Z=>Z.bald*.85+Z.crest*.35*(1-Z.cove)+Z.forest*.06,(x,y,z,s)=>{const w=s.range(.5,1);
  BIO.put('turf',[x,y-.04,z],QE(s.range(-.1,.1),s.range(0,TAU),0),[w,w*s.range(.4,.75),w],PICK(PAL.turf,s.next()),{label:'Ridge turf'});});
 // THE BALD: bulb heath in clumps, banded coral among it (a little of each on the other crests)
 pass('heath',3.6,404,700,Z=>Z.bald*.6+Z.crest*.05*(1-Z.forest*.5),(x,y,z,s)=>{const w=s.range(.6,1.3);
  BIO.put('bheath',[x,y-.05,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.6,.9),w],PICK(PAL.heath,s.next()),{label:'Bulb heath'});});
 pass('coral',6.5,405,700,Z=>Z.bald*.42+Z.crest*.03,(x,y,z,s)=>{const w=s.range(.8,1.6);
  BIO.put('bcoral',[x,y-.08,z],QE(s.range(-.08,.08),s.range(0,TAU),0),[w,w*s.range(.8,1.2),w],null,{label:'Banded coral'});});
 BIO.range=null;BIO.minRange=0;return st;};
})();
