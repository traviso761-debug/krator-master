// ================================================================= HOST — STATION 3's words, views and checks (read by stations/common/99-host-take.js)
const STATION_TITLE='the spiral fellfield and the ice';
const STATION_HINT="The southern highlands, station 3: the fellfield under the summit ridge (5.25-6.05 km, ET, 0.83 atm). Cushion plants grown as spiral domes, the ground sorted by frost into spirals of stones, coiled lichens, snail-shell rosettes in the scree, a cirque glacier whose icefall's crevasses curve, and the Whorl Crown, a tor whose ledges climb it in a spiral; every spiral right-handed";
const STATION_SPECIES=[];
const STATION_PLANTS=['dome','snail','lichen','rosette'];
function STATION_VIEWS(){const Z=SHIGH.zonesF,F=(x,z)=>Z(x,z);
 const sorted=bestAt((x,z)=>F(x,z).sorted*(1-F(x,z).slope),25),scree=bestAt((x,z)=>F(x,z).scree),fell=bestAt((x,z)=>F(x,z).fell*(1-F(x,z).sorted));
 const WC=TOR[0],I=STATION_LAND.ICE,mid=I[2],top=I[0],snout=I[I.length-1];
 return{
  'The sorted spirals':[sorted[0]+6,gh(sorted[0]+6,sorted[1]+6,7),sorted[1]+6,sorted[0],gh(sorted[0],sorted[1],0),sorted[1]],
  'Spiral cushions':across(fell[0],fell[1],.4,18,1.2,0),
  'Snail rosettes in the scree':across(scree[0],scree[1],-.8,10,1.4,0),
  'The icefall':[mid[0]-260,gh(mid[0]-260,mid[1]+160,60),mid[1]+160,mid[0]+40,gh(mid[0]+40,mid[1]-30,20),mid[1]-30],
  'The crevasses from above':[mid[0]-20,gh(mid[0]-20,mid[1]+10,120),mid[1]+10,mid[0]+10,gh(mid[0]+10,mid[1]-10,30),mid[1]-10],
  'The snout and the tarn':(function(){const x=TARN.x-TARN.r*2.6,z=TARN.z+TARN.r*2.2;return[x,Math.max(gh(x,z,4),TARNL+7),z,snout[0],gh(snout[0],snout[1],8),snout[1]];})(),
  'The Whorl Crown':look(WC.x-WC.r*2.6,WC.z+WC.r*1.3,16,WC.x,WC.z,WC.h*.5),
  'From the summit ridge':look(2300,-200,30,-1500,600,20),
  'The fellfield from below':look(-2100,300,25,1200,-300,60),
 };}
// the station's own checks: the icefall drawn and its crevasses curved, nothing rooted on the ice, the stones laid on the spirals, the crown's
// ledge a spiral, the cushions placed
const ICECHK=I=>({ok:!!I&&I.crevasses>=20&&I.maxThick>20,detail:I?I.length+' m of ice, '+I.crevasses+' crevasses, '+I.maxThick+' m at its thickest, '+I.tris+' triangles':'no ice drawn'});
function STATION_CHECKS(add){const I=window._ice,B=window._biome&&window._biome.under||{};
 add('the icefall drawn, its crevasses curving',ICECHK(I));
 const P=(function(){const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
  scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.z,M.name]);}});return o;})();
 const on=P.filter(p=>{const n=STATION_LAND.iceNear(p[0],p[1]);return n.d<n.w*.5;});
 add('nothing rooted on the ice',{ok:!on.length,detail:on.length?on.length+' on the ice (first '+on[0][2]+')':P.length+' instances, none on the ice'});
 add('the sorted spirals laid in stones',{ok:B.sortedCells>0&&B.sorted>B.sortedCells*8,detail:(B.sorted||0)+' stones on '+(B.sortedCells||0)+' cells'});
 add('the Whorl Crown\'s ledge a spiral',{ok:!!TOR[0].spiral,detail:TOR[0].name+(TOR[0].spiral?': one ledge climbing it':': terraces only')});
 add('the spiral cushions placed',{ok:(B.domes||0)>100&&(B.snails||0)>50,detail:(B.domes||0)+' cushions, '+(B.snails||0)+' snail rosettes'});}
function STATION_NEGATIVES(add){add('a plant on the ice',(function(){const I=STATION_LAND.ICE[2],n=STATION_LAND.iceNear(I[0],I[1]),bad=n.d<n.w*.5;return{ok:!bad,detail:bad?'1 on the ice':'not on the ice'};})());
 add('an icefall with no crevasses',ICECHK(Object.assign({},window._ice,{crevasses:0})));add('no ice drawn',ICECHK(null));}
