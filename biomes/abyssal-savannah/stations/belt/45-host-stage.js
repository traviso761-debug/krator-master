// ================================================================= HOST — stage: the floor's belt (station 2)
// The ABYSSAL SAVANNAH on the abyss floor (PLAN.md section 8, station 2): renderer, lights, the belt's terrain and terrainH(), the
// fields the kit asks for (wet / salt / upland / flow / rock), the clay ants' mounds, the far country's data. The kit (src/50-70) and the
// eastern abyss read in place (47a-47c) are station 1's; this stage, the ground (80), the water (89w), the build (89z) and the take (99) are
// the station's own (build.py build_main: stations/belt/ over src/).
//
// THE SITE (map 5.1, surveyed 2026-11-09; the px is on the old canvas, as every kit's and the sky's frame are): the XV clump at px 1031,515,
// -1,878 m, 2.0 atm, ~800 mm, +35 degC. The plan (4.22) had ~1,050 mm; 5.1 is drier here and wetter east (1,050 mm from px 1035).
// Round it on 5.1: the abyssal salt lake (WX, level -2,474 m) in its pit 6 km south (px 1031-1032, rows 518-519), the lake jungle (XA) in
// the basins 10 km north-east (px 1033-1036, rows 506-510) and 12 km south-east (px 1036-1039, rows 519-522), the floor rising west to the
// salt steppe and the hot desert (XS, BWh, px 999-1014).
// THE MAP (x east, z south; y 0 is -1,880 m on the model): 6.4 by 5 km on the model's own heights (GRID51: 5.1's 2 km cells, Catmull-Rom),
// with the page's detail on them (the plan's "the jungle's edge one side and the salt's the other", closer than 5.1 draws them):
//   the PARKLAND   the belt's middle: the umbrella trees at their tallest, thatch over 3 m, rope araucarias, the clay ants' spires
//   the STREAM     a seasonal stream from the north edge south-west across the belt, dying in a salt flat (the lake has no outlet)
//   the SALT       the south and south-west, falling toward the salt lake's pit: salt flats, pan-grass, saltbush, the stub steppe
//   the JUNGLE     the north-east corner: a seep-fed hollow falling toward the jungle's basin, its edge the eastern abyss's trees
// Nothing here draws from a random stream: the terrain is KRAND's noise (core/rand) on the model's grid, baked once to a 12.5 m grid.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
// the eastern abyss's lake hue (its kit, read in place for the jungle's edge, reads it before its species load): 0, as station 1's
var EASTABYSS_LAKE={hue:0.0};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   /* BIO.record: the volume as a core/tags record too */
const SITE={px:1031,py:515,y0abs:-1880,model:'Krator Scale Model 5.1',station:'belt'};
const atmAt=y=>1.6*Math.exp(-(y+SITE.y0abs)/8000);   /* the model's pressure (atm0 1.6, scale 8 km): 2.03 atm at y 0 */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4cdb4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00013);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
const HEMI=new THREE.HemisphereLight(0xd4d8cc,0x5a4a36,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const sun=new THREE.DirectionalLight(0xfff0d0,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0a8,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the model's ground (data: [G data] arithmetic on the grid and KRAND)
const SEED=10315152;                       /* the world seed of this station (px 1031, row 515, station 2) */
const KF=(x,z,o,salt)=>KRAND.fbm(x,z,0,o,SEED+salt);   /* [0,1] */
const TERR={X:3200,Z:2500,cell:12.5};
const CENTER=[0,0];
// GRID51: the scale model 5.1's heights (m over y 0) and classes on its 2 km cells, 41 x 41 round the site (tools/scale-model/model/data:
// h.png, c.png; written 2026-11-09). K: v XV, A XA, s XS, w XW, ~ water (the WX salt lakes), a Aw, b BSh, c Cfa, C Csa
const GRID51={px0:1011,py0:495,n:41,cell:2000,
 H:[309,237,196,187,169,186,192,190,172,148,138,125,90,48,12,42,106,142,125,119,119,-133,-483,-580,-549,-366,-105,-10,-2,124,312,283,140,-172,70,72,73,73,73,73,-28,339,247,198,187,185,185,186,182,166,145,130,94,51,20,-5,-5,174,190,188,168,132,5,-142,-183,-170,-112,-32,-6,-10,42,74,74,64,67,70,72,73,73,-282,-94,37,356,254,200,188,169,182,180,172,160,140,120,70,18,12,-5,-5,227,229,184,136,52,1,-142,-142,83,74,32,7,-9,-12,-10,62,64,66,69,71,73,73,-42,101,99,358,257,202,189,184,180,174,166,154,144,114,66,-5,-5,12,188,240,213,137,-27,-229,-356,-720,-720,-207,92,72,46,15,2,-3,61,63,65,67,70,71,72,-42,110,118,367,267,208,192,184,178,169,162,152,143,114,73,-5,-5,204,260,272,223,102,-143,-416,-619,-720,-720,-229,72,112,78,43,25,16,-226,62,63,65,67,69,70,-20,118,140,381,282,217,194,185,176,169,162,154,146,128,105,104,152,223,267,372,227,69,-179,-424,-644,-702,-565,-329,-103,79,95,80,72,68,-191,61,62,63,65,-283,-95,53,138,189,392,293,223,197,185,177,171,167,163,158,147,146,163,208,268,296,373,187,35,-201,-370,-542,-613,-546,-398,-195,47,101,96,107,117,-165,-576,61,62,63,-20,106,116,157,220,391,292,224,198,188,181,176,175,175,180,186,202,233,275,325,418,343,154,5,-227,-327,-398,-424,-380,-297,-207,-57,11,35,89,100,-165,-576,-548,-285,-96,53,119,141,205,294,382,285,222,196,188,189,195,201,210,221,232,253,281,314,350,414,308,128,-25,-248,-342,-372,-371,-338,-287,-232,-162,-94,-37,33,88,-127,-482,-374,-20,113,118,145,205,290,387,361,273,214,191,183,216,272,296,306,315,324,322,316,332,359,404,271,109,-55,-267,-355,-383,-380,-351,-306,-252,-185,-108,-33,49,104,9,-142,-97,54,127,152,209,302,394,469,338,260,205,191,197,253,332,355,350,364,384,371,343,346,480,395,244,87,-82,-286,-366,-392,-388,-363,-323,-268,-197,-113,-25,68,133,133,122,124,133,168,208,290,393,467,498,316,245,193,213,265,308,346,321,268,300,370,378,356,354,472,385,241,79,-102,-300,-375,-399,-395,-373,-338,-279,-182,-80,0,70,135,153,161,179,207,257,296,364,435,471,475,297,232,171,225,313,328,316,270,212,267,362,383,368,359,461,372,238,85,-88,-286,-377,-401,-398,-380,-352,-289,-172,-57,23,79,127,154,186,224,263,310,355,399,429,435,427,280,214,158,213,296,264,189,192,238,304,374,385,376,471,441,353,235,115,14,-176,-360,-389,-390,-380,-363,-297,-139,-14,53,108,150,191,232,275,313,355,386,395,391,388,388,259,196,137,196,279,219,107,148,261,322,370,384,381,467,418,333,234,144,95,-75,-304,-365,-370,-365,-353,-289,-93,21,84,135,181,231,280,323,356,384,393,375,351,388,388,236,169,113,173,270,217,64,64,259,311,359,381,495,458,396,320,241,161,119,14,-115,-186,-234,-236,-227,-136,-19,58,114,159,214,268,316,362,391,399,383,347,313,388,388,214,153,94,160,266,216,64,64,239,294,350,373,485,443,371,304,243,175,120,83,23,-27,-71,-71,-50,-9,41,90,141,187,247,303,350,395,417,401,366,314,279,260,388,195,135,84,152,266,217,102,107,168,243,334,363,464,419,345,287,238,179,128,100,47,11,-17,-31,-37,1,60,111,156,209,272,333,381,423,436,397,327,275,255,250,234,169,118,75,145,272,235,134,121,152,229,326,442,437,389,316,265,224,173,127,105,59,39,33,14,-10,20,76,126,172,229,293,361,417,454,453,384,297,258,250,250,250,157,105,66,139,278,286,243,239,256,291,330,415,401,351,283,234,194,146,110,84,38,42,69,69,57,69,92,129,183,242,298,384,467,489,469,378,279,251,170,170,251,148,97,58,126,250,287,289,293,299,308,389,381,364,312,246,200,162,123,106,51,2,20,74,83,48,57,89,127,176,240,309,417,516,524,489,386,271,243,170,170,388,158,99,52,79,140,163,174,191,211,240,304,322,323,274,205,164,134,106,60,2,-28,-21,14,-48,-180,-127,37,108,130,201,341,474,561,552,458,337,266,234,168,170,388,160,105,54,43,49,70,93,120,151,194,252,286,296,238,161,124,105,89,18,-46,-85,-96,-92,-201,-364,-269,0,94,106,187,381,522,593,550,407,293,238,219,157,170,387,168,108,69,56,62,72,101,129,161,188,276,304,302,210,112,98,70,44,-2,-143,-598,-598,-370,-383,-371,-231,4,104,135,246,450,561,607,546,372,267,170,157,154,170,458,177,129,81,70,66,89,110,140,175,216,312,336,324,202,116,60,26,-4,-51,-243,-598,-598,-561,-466,-346,-169,14,116,172,319,509,585,612,549,353,241,156,145,170,170,546,189,143,101,87,87,100,121,151,168,253,360,390,386,250,106,66,18,-75,-208,-356,-497,-529,-506,-369,-164,-40,41,129,247,414,555,596,609,528,319,218,154,170,266,454,700,187,155,114,101,100,113,133,161,191,291,407,443,448,288,103,51,-1,-129,-308,-402,-449,-448,-415,-256,-23,61,76,153,340,496,586,602,604,500,288,203,155,170,352,607,846,189,161,125,113,113,126,140,167,206,317,440,485,502,271,50,-38,-69,-139,-226,-290,-340,-334,-300,-170,-14,80,133,253,443,551,600,599,574,470,301,245,224,311,458,735,959,194,162,133,114,125,131,141,155,220,339,469,521,543,313,47,-43,-67,-100,-136,-174,-211,-204,-174,-92,16,116,212,373,524,587,605,577,524,448,346,334,360,471,635,803,1081,200,158,135,129,129,131,141,160,225,349,484,542,565,500,297,170,108,77,16,-33,-73,-69,-44,24,114,191,336,469,565,597,588,539,479,426,394,428,495,576,696,883,1152,205,159,135,129,114,131,142,165,229,356,496,557,580,575,558,500,384,248,137,110,69,68,87,122,208,330,457,540,588,594,565,499,448,424,425,467,515,600,773,973,1193,212,161,132,126,126,129,132,161,225,355,499,562,588,590,581,561,519,442,342,265,208,202,221,284,373,458,531,564,557,583,540,473,430,427,432,469,529,638,806,990,1182,212,161,125,118,114,120,122,153,218,349,497,565,594,602,601,590,576,558,522,480,437,424,431,466,509,546,572,556,509,443,390,420,373,378,420,468,556,680,853,1027,1212,207,156,112,102,100,99,102,138,201,333,484,562,593,606,608,604,596,585,572,560,542,532,531,542,559,572,570,523,450,377,301,247,239,331,353,423,553,701,907,1069,1227,200,149,99,79,74,77,96,101,136,240,412,551,591,606,613,613,611,605,598,590,583,578,577,579,583,585,559,490,398,369,245,205,231,261,302,394,490,734,941,1104,1240,192,139,88,63,51,57,27,12,38,116,242,443,581,601,609,611,611,607,601,595,589,585,582,574,556,526,539,457,371,276,215,199,211,237,254,388,477,684,1135,1303,1511,156,98,44,20,11,5,-22,-48,-23,44,129,284,520,551,563,569,572,571,580,595,593,588,575,545,513,469,415,373,316,252,201,199,205,219,189,388,498,702,1217,1473,1889,85,25,-20,-41,-48,-65,-85,-114,-168,-168,-35,120,305,386,410,426,439,445,476,538,582,572,546,502,450,398,341,282,254,212,191,194,201,229,213,388,559,849,1220,1832,2374,34,-19,-69,-88,-93,-118,-153,-166,-169,-168,-165,-29,21,249,270,285,299,328,369,452,546,546,502,453,391,328,276,242,210,191,186,193,205,235,234,388,555,887,1421,1912,2694,-168,-168,-168,-168,-168,-168,-175,-183,-186,-186,-185,-168,-168,-168,-168,-168,-168,-168,294,392,497,504,452,389,327,271,231,202,185,181,185,195,213,217,245,390,575,935,1343,1868,2746,-171,-177,-182,-185,-188,-192,-194,-197,-199,-199,-198,-196,-193,-175,-168,-168,-168,-168,239,355,453,455,399,337,276,229,200,179,175,177,182,193,199,216,380,401,616,1054,1451,2051,2780],
 K:'vvvvvvvvvvvvvvwvvvvvvv~~~~~~AAAAAAvvAA~~Avvvvvvvvvvvvvw~~vvvvvvvvvv~~~~~~~~vAAAAAAvvvvvvvvvvvvww~~vvvvvvvvvv~~~~~~~~AAAAAAAvvvvvvvvvvvv~~vvvvvvvv~~vvvv~~~~~~AAA~AAAvvvvvvvvvvvv~~vvvvvwvv~~vvAv~~~~~~~AA~AAAvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAA~~~~AAAAAvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAA~~~~AAAAAvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAA~~AAAAAAAvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAA~~AAAAAAAvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAAAAAAAAAAAvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAAAAAAAAAAAvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAAAAAAAAAAAvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAAAAAAAAAAAvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAAAvvvvvAAvvvvvvvvvvvvvvvvvvvvvvvvvAAvAAAAvvvvvAAAAvvvvvv~~vvvvvvvvvvvvvvvvvvAAAAAvvvvAAAAAAvvwvvv~~vvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAvvwvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAvvwvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAvvwvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAA~~AvvwvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAA~~AvvwvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAA~~AvvvsvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAA~~Avvvvvvvvvvvvvvvvvvvv~~vvvvvAvvvvvvvA~~~~Avvvvvvvvvvvvvvvvvvvv~~vvvvvAAvvvvvvA~~~~AvvvvvvvvvvvvvvvvvvvvvvvvvAAAAvvvvvvA~~AAvvvvvvvvvvvvvvvvvvvvvvvvvAAAAvvvvvAAA~~AAvvvvvvvvvvvvvvvvvvvvvvvvvAAAAvvvvvAAAAAAvavvvvvvvvvvvvvvvvvvvvvvvAAAAvvvvvvvAAAAAvavvvvvvvvvvvvvvvvvvvvvvvvAvvvvvvAAAAAAAvvavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvvaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAvvaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvaaavvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvaacvvvvvvvvvvvvvvvvvvvvvvvvvvvvvAAAAAAAAvabcvvvvvvvv~~vvvvvvvvvvvvvvvvvAAAAAAAAAAvabCvvvvvvvv~~vvvvvvvvvvvvvvvvAAAAAAAAAAvvabC~~~~~~~~~~~~~~~~~~vvvvvvvAAAAAAAAAAAAaabC~~~~~~~~~~~~~~~~~~vvvvvvAAAAAAAAAAAAvaacC'};
// the model's height at a page point: Catmull-Rom across the cells (a cell's value is at its pixel)
function crm(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
const gH=(i,j)=>GRID51.H[clamp(j,0,GRID51.n-1)*GRID51.n+clamp(i,0,GRID51.n-1)];
const gUV=(x,z)=>[SITE.px+x/GRID51.cell-GRID51.px0,SITE.py+z/GRID51.cell-GRID51.py0];
function modelH(x,z){const q=gUV(x,z),i=Math.floor(q[0]),j=Math.floor(q[1]),fu=q[0]-i,fv=q[1]-j,r=[];
 for(let k=-1;k<=2;k++)r.push(crm(gH(i-1,j+k),gH(i,j+k),gH(i+1,j+k),gH(i+2,j+k),fu));return crm(r[0],r[1],r[2],r[3],fv);}
// the share of the model's cells of a class (chars) round a point: bilinear over the four nearest cells
function classW(x,z,chars){const q=gUV(x,z),i=Math.floor(q[0]),j=Math.floor(q[1]),fu=q[0]-i,fv=q[1]-j,n=GRID51.n,K=GRID51.K;
 const w=(a,b)=>{a=clamp(a,0,n-1);b=clamp(b,0,n-1);return chars.indexOf(K[b*n+a])>=0?1:0;};
 return w(i,j)*(1-fu)*(1-fv)+w(i+1,j)*fu*(1-fv)+w(i,j+1)*(1-fu)*fv+w(i+1,j+1)*fu*fv;}
// THE STREAM: from the north edge south-west across the belt to the salt flat, meandering; strX(z) its line
const STR={x0:-420,A:[250,64],k:[.00108,.0043],ph:[.7,2.1],W:24,D:4.2,head:-2780,end:1880};
const strX=z=>STR.x0+STR.A[0]*Math.sin(z*STR.k[0]+STR.ph[0])+STR.A[1]*Math.sin(z*STR.k[1]+STR.ph[1])-300*smooth(-600,1800,z);
// the SALT FLAT the stream dies in (the salt lake's rim, 4 km short of its pit): a flat floor 6 m down; panK 0..1
const PAN={c:[strX(STR.end)-60,STR.end+120],r:520,floor:170};
const panK=(x,z)=>smooth(PAN.r,PAN.floor,Math.hypot(x-PAN.c[0],(z-PAN.c[1])*1.3));
// THE JUNGLE'S HOLLOW: the north-east corner, seep-fed, falling toward the lake jungle's basin (5.1: 10 km north-east); jungK 0..1
const JUNG={c:[2950,-2250],r:1750,d:34};
const jungK=(x,z)=>smooth(JUNG.r*1.02,JUNG.r*.3,Math.hypot((x-JUNG.c[0])*.9,z-JUNG.c[1]));
// toward the salt lake's rim: south and south-west (0 in the belt's middle .. 1 at the south edge)
const saltW=(x,z)=>smooth(-250,2350,z-.35*x);
// the stream's bed: the model's grade along the line, never climbing downstream (a running minimum from the head), less the channel
const BED=(function(){const pts=[];let lo=1e9;
 for(let z=STR.head;z<=STR.end+40;z+=10){const x=strX(z),g=modelH(x,z)+1.2*(KF(x*.0021,z*.0021,3,21)-.5)*2;lo=Math.min(lo,g);pts.push(lo-STR.D);}
 return{pts,at:z=>pts[clamp(Math.round((z-STR.head)/10),0,pts.length-1)]};})();
function strCut(x,z){if(z<STR.head-60||z>STR.end+60)return null;const d=Math.abs(x-strX(z)),fade=smooth(STR.end+60,STR.end-120,z),W=STR.W*(.8+.4*KF(z*.004,1.7,2,24));
 return{d,W,fade,bed:BED.at(z)};}
// the height, as arithmetic (the bake below samples it once)
function heightFn(x,z){let h=modelH(x,z);
 h+=5*(KF(x*.0019,z*.0019,3,21)-.5)*2+2.2*(KF(x*.0065,z*.0065,2,22)-.5)*2+.8*(KF(x*.021,z*.021,2,23)-.5)*2;
 h-=JUNG.d*Math.pow(jungK(x,z),1.25);
 h-=6*panK(x,z);
 const s=strCut(x,z);if(s&&s.d<s.W*2.2){const t=smooth(s.W*2.2,s.W*.25,s.d),bank=mix(h,s.bed+.2*(s.d/s.W),Math.pow(t,1.6));h=Math.min(h,mix(h,bank,s.fade));}
 return h;}
// ---------------------------------------------------------------- the bake: heights on a 12.5 m grid, the fields on 25 m
const HG=(function(){const c=TERR.cell,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,a=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=heightFn(-TERR.X+i*c,-TERR.Z+j*c);
 return{c,nx,nz,a};})();
function gridH(x,z){const u=clamp((x+TERR.X)/HG.c,0,HG.nx-1.0001),v=clamp((z+TERR.Z)/HG.c,0,HG.nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=HG.a,n=HG.nx;
 return a[j*n+i]*(1-fu)*(1-fv)+a[j*n+i+1]*fu*(1-fv)+a[(j+1)*n+i]*(1-fu)*fv+a[(j+1)*n+i+1]*fu*fv;}
const inMap=(x,z)=>Math.abs(x)<=TERR.X&&Math.abs(z)<=TERR.Z;
function terrainH(x,z){return inMap(x,z)?gridH(x,z):heightFn(x,z);}
function slopeAt(x,z){const e=TERR.cell;return Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);}
// the fields (PLAN.md section 4, read on the floor): upland is the belt's dryness toward the salt (the kit's bands: the jungle's edge under .2,
// the parkland .2-.65, the salt steppe over .7), wet the jungle's seep and the stream, salt the flat and the salt lake's rim
const FC=(function(){const c=25,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,N=nx*nz;
 const a={up:new Float32Array(N),wet:new Float32Array(N),flow:new Float32Array(N),rock:new Float32Array(N),salt:new Float32Array(N),jung:new Float32Array(N)};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-TERR.X+i*c,z=-TERR.Z+j*c,k=j*nx+i,jk=jungK(x,z),sw=saltW(x,z),pk=panK(x,z),s=strCut(x,z);
  const fl=s?smooth(s.W*2,5,s.d)*s.fade:0,n=KF(x*.0013,z*.0013,2,25)-.5;
  a.jung[k]=jk;a.flow[k]=fl;
  a.up[k]=clamp(.46+.38*sw-.44*jk+.12*n,0,1);
  a.wet[k]=clamp(.52-.3*sw+.48*jk+.42*fl+.2*pk,0,1);
  a.rock[k]=clamp(smooth(.32,.7,slopeAt(x,z)),0,1);
  a.salt[k]=clamp(Math.max(pk,.48*smooth(1250,2650,z-.3*x)*(1-fl)),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x+TERR.X)/c,0,nx-1.0001),v=clamp((z+TERR.Z)/c,0,nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*nx+i]*(1-fu)*(1-fv)+arr[j*nx+i+1]*fu*(1-fv)+arr[(j+1)*nx+i]*(1-fu)*fv+arr[(j+1)*nx+i+1]*fu*fv;};
 return{c,nx,nz,a,at};})();
const FIELD={
 upland:(x,z)=>inMap(x,z)?FC.at(FC.a.up,x,z):clamp(.46+.38*saltW(x,z)-.44*jungK(x,z),0,1),
 wet:(x,z)=>inMap(x,z)?FC.at(FC.a.wet,x,z):.45,
 flow:(x,z)=>inMap(x,z)?FC.at(FC.a.flow,x,z):0,
 rock:(x,z)=>inMap(x,z)?FC.at(FC.a.rock,x,z):0,
 salt:(x,z)=>inMap(x,z)?FC.at(FC.a.salt,x,z):0};
// ---------------------------------------------------------------- the clay ants' spires (core/terrain 37, KSTACKS.mounds; PLAN.md section 8)
// The floor's clay ants build fluted spires 5-14 m in the dense air over the open parkland, by cell (each cell's hashes alone, so a tile
// window gives the same mounds), never on the stream, the salt or a slope. Placed here, before the kit: nothing roots in a mound's skirt
// (the mask below) and the trees keep off them (OBSTACLES). Drawn in 89z on the library's earth.termite
const MOUNDS=(typeof KSTACKS!=='undefined'&&KSTACKS.mounds)?KSTACKS.mounds({id:'absav-belt-mound',world:SEED,cell:64,x0:-TERR.X+60,z0:-TERR.Z+60,x1:TERR.X-60,z1:TERR.Z-60,
 per:1,p:.17,H:[5,14],gap:8,ground:terrainH,soil:[.6,.38,.26],
 accept:(x,z,r)=>{const up=FIELD.upland(x,z);return up>.24&&up<.66&&FIELD.flow(x,z)<.04&&FIELD.salt(x,z)<.08&&jungK(x,z)<.15&&slopeAt(x,z)<.12;}}):[];
const MOUND_S=KSPACE.create({cell:40});MOUNDS.forEach(B=>MOUND_S.insert(B,B.x,B.z,(B.R==null?4:B.R)+1));
const inMound=(x,z,pad)=>MOUND_S.some(x,z,pad+16,B=>Math.hypot(x-B.x,z-B.z)<(B.R==null?4:B.R)+pad);
// ---------------------------------------------------------------- the water's levels (core/water draws them: 89w-host-water.js)
// the stream along its line at its bed plus a hand (the bed never climbs downstream); the salt flat's seasonal sheet; the jungle's seep pool
const STREAM=(function(){const pts=[];for(let z=STR.head+30;z<=STR.end;z+=12){const x=strX(z);let lo=1e9;for(let o=-12;o<=12;o+=3)lo=Math.min(lo,terrainH(x+o,z));pts.push([x,z,lo]);}
 for(let i=1;i<pts.length;i++)pts[i][2]=Math.min(pts[i][2],pts[i-1][2]);pts.forEach(p=>{p[2]+=.22;});return{pts};})();
const PAN_WATER={name:'The salt flat (a sheet of brine a few weeks a year)',x:PAN.c[0],z:PAN.c[1],r:250,level:terrainH(PAN.c[0],PAN.c[1])+.16};
const SEEP=(function(){let b=null;for(let a=0;a<24;a++)for(let r=0;r<=600;r+=50){const x=JUNG.c[0]+Math.cos(a/24*TAU)*r,z=JUNG.c[1]+Math.sin(a/24*TAU)*r;if(!inMap(x,z)||Math.abs(x)>TERR.X-140||Math.abs(z)>TERR.Z-140)continue;
  const y=terrainH(x,z);if(!b||y<b.y)b={x,z,y};}
 let lo=1e9;for(let a=0;a<12;a++)lo=Math.min(lo,terrainH(b.x+Math.cos(a/12*TAU)*40,b.z+Math.sin(a/12*TAU)*40));
 return{name:'The jungle\'s seep pool',x:b.x,z:b.z,r:52,level:Math.min(lo,b.y+1.2)+.1};})();
function waterH(x,z){let w=-1e9;
 if(Math.hypot(x-PAN_WATER.x,(z-PAN_WATER.z)*1.3)<PAN_WATER.r)w=Math.max(w,PAN_WATER.level);
 if(Math.hypot(x-SEEP.x,z-SEEP.z)<SEEP.r)w=Math.max(w,SEEP.level);
 if(z>STR.head&&z<STR.end&&Math.abs(x-strX(z))<4.5){const i=clamp(Math.round((z-STR.head-30)/12),0,STREAM.pts.length-1);w=Math.max(w,STREAM.pts[i][2]);}
 return w;}
// ---------------------------------------------------------------- the host binding
const OBSTACLES=MOUNDS.map(B=>({x:B.x,z:B.z,r:(B.R==null?4:B.R)+.5,name:'mound'}));
// the LOD spine: down the stream, across the parkland, out to the jungle's edge and the salt
const SPINE=[[-420,-2400],[-300,-1600],[-500,-800],[-700,0],[-800,800],[-700,1700],[-2400,0],[-1600,-600],[600,-500],[1500,-900],[2400,-1700],[1400,700],[2600,1400],[-2400,1800]];
BIO.init({tags:'abyssal-savannah',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{const d=terrainH(x,z)-waterH(x,z);if(inMound(x,z,.6))return 0;return d<.15?0:d<.6?(d-.15)/.45:1;},   /* nothing roots under water or in a mound's skirt */
 obstacles:OBSTACLES,ticks:tick,seed:31,
 origin:SPINE,center:CENTER,lod:{hero:900,mid:1700,far:3200,floor:[480,1200]},
 fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],register:REGISTER,err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh on the 12.5 m grid, painted by zone and burn age from the fields, the library's soil detail multiplied in (materials.json
// groundDetail, groundRock), its layers on KGROUND; built by 80-host-ground.js once the kit is on the page (the paint reads ABSAV.burn)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('abyssal-savannah',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,y/9,0,2,77)-.5)*40+(KRAND.h3(x,y,9,78)-.5)*22;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the ground's colour by zone (the floor's: deeper gold than the rim's, a red clay under the jungle, white salt toward the lake)
const GROUND={gold:0xb89650,gold2:0xa2824a,green:0x6a7a38,char:0x2a241e,ash:0x8c8478,jung:0x3e3022,jungG:0x44482a,steppe:0xbaa46e,steppe2:0xa89262,
 rock:0x8a6a56,rock2:0x6e5446,salt:0xdcd2bc,saltO:0xc4a676,bed:0x5c4630,clay:0x9a5a40};
function groundColour(x,z,c,t){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),sa=FIELD.salt(x,z),jk=jungK(x,z);
 const n=KF(x*.011,z*.011,2,31)-.5,age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8;
 c.set(GROUND.gold).lerp(t.set(GROUND.gold2),clamp(.5+n*1.6,0,1));
 c.lerp(t.set(GROUND.green),age<=3?(age<=0?0:mix(.75,.25,(age-1)/2)):0);
 c.lerp(t.set(GROUND.steppe).lerp(new THREE.Color(GROUND.steppe2),clamp(.5+n*1.5,0,1)),smooth(.62,.82,up));
 c.lerp(t.set(GROUND.jung).lerp(new THREE.Color(GROUND.jungG),clamp(.5+n*1.5,0,1)),smooth(.35,.75,jk)*smooth(.5,.75,wet));
 if(age<=0)c.lerp(t.set(GROUND.char).lerp(new THREE.Color(GROUND.ash),clamp(.3+n*2,0,1)*.5),.85*(1-rk));
 c.lerp(t.set(GROUND.bed),fl*.6);
 c.lerp(t.set(GROUND.clay),.35*smooth(.35,0,Math.abs(n))*smooth(.3,.5,up)*smooth(.7,.55,up)*(1-fl));   /* the clay ants' red earth in patches */
 c.lerp(t.set(GROUND.rock).lerp(new THREE.Color(GROUND.rock2),clamp(.5-n*1.8,0,1)),rk*.8);
 c.lerp(t.set(GROUND.saltO).lerp(new THREE.Color(GROUND.salt),smooth(.4,.95,sa)),sa*.9);
 return c;}
// THE LIBRARY LAYERS ON KGROUND (43-core-ground.js; station 1's four surfaces, on this ground's masks), per vertex in aGL:
//   soil    aGL.x  the red soil: the stream's bed (flow) and the jungle's wet trampled ground (jungK over wet .6)
//   burn    aGL.y  this year's burns (ABSAV.burn 0), off the stream's gallery
//   salt    aGL.z  the salt flat and the salt lake's rim (the salt field)
//   gravel  aGL.w  the salt steppe's stony crust (upland over .65, a macro patch ~400 m)
//   wet     aWet   the water's wet band: WATER.fieldAt's shore distance from the water the eye sees (89z)
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
function groundMasks(x,z,o){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),sa=FIELD.salt(x,z),jk=jungK(x,z);
 const age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8,off=1-smooth(.35,.7,rk),pat=KF(x*.0025,z*.0025,2,51);
 o[0]=clamp(Math.max(smooth(.35,.75,fl),smooth(.55,.85,wet)*smooth(.3,.7,jk)*smooth(.4,.62,pat)),0,1)*off;
 o[1]=(age<=0?1:0)*off*(1-smooth(.3,.6,fl));
 o[2]=smooth(.3,.85,sa);
 o[3]=clamp(smooth(.65,.85,up)*smooth(.42,.62,pat)*(1-o[2]),0,1)*(1-o[1]);
 return o;}
let GROUND_MESH=null,MAT_GROUND=null;
function buildGround(){const S=[2*TERR.X,2*TERR.Z],g=new THREE.PlaneGeometry(S[0],S[1],HG.nx-1,HG.nz-1);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),gl=new Float32Array(p.count*4),c=new THREE.Color(),t=new THREE.Color(),o=[0,0,0,0];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));groundColour(x,z,c,t);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  groundMasks(x,z,o);gl[i*4]=o[0];gl[i*4+1]=o[1];gl[i*4+2]=o[2];gl[i*4+3]=o[3];}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(p.count),1));   /* aWet: 89z fills it from the water's fields */
 g.computeVertexNormals();
 const m=USE_KG?new THREE.MeshStandardMaterial({vertexColors:true,color:0xb0aaa0,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({vertexColors:true,color:0xb0aaa0});
 m.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uRock={value:hostGroundLib('groundRock',TEX_DETAIL)};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRock;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;')
   .replace('#include <color_fragment>','#include <color_fragment>\n'+(USE_KG?'/*KGROUND*/\n':'')+'{vec3 dt=texture2D(uDetail,vGWP.xz*0.16).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'
    +'float st=smoothstep(0.86,0.62,abs(vGWN.y));vec2 ru=abs(vGWN.x)>abs(vGWN.z)?vGWP.zy:vGWP.xy;vec3 rk=texture2D(uRock,ru*0.11).rgb;'
    +'vec3 d=mix(dt*dt2*1.12,rk*1.05,st);diffuseColor.rgb*=mix(vec3(1.0),d,0.85*(1.0-0.55*max(max(vGL.x,vGL.y),max(vGL.z,vGL.w))));'
    +'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
 if(USE_KG)KGROUND.hook(m,{key:'absav-belt-ground',at:'/*KGROUND*/',layers:[
  KGROUND.layer('abyssal-savannah','ground.soil',{w:'vGL.x',amt:.55,gain:1.1,tint:'diffuse',name:'red soil'}),
  KGROUND.layer('abyssal-savannah','ground.burn',{w:'vGL.y',amt:.75,gain:1.0,name:'this year\'s burn'}),
  KGROUND.layer('abyssal-savannah','ground.salt',{w:'vGL.z',amt:.75,gain:1.1,name:'the salt flats'}),
  KGROUND.layer('abyssal-savannah','ground.gravel',{w:'vGL.w',amt:.45,gain:1.05,tint:'diffuse',name:'the salt steppe\'s crust'})]});
 MAT_GROUND=m;
 GROUND_MESH=new THREE.Mesh(g,m);GROUND_MESH.receiveShadow=true;GROUND_MESH.userData.probeSkip=true;GROUND_MESH.userData.inspectLabel='The floor\'s belt';scene.add(GROUND_MESH);}
// ---------------------------------------------------------------- the far country (its config; the mesh is KFAR's: 80-host-ground.js)
// The country past the map to 36 km on 5.1's own cells (GRID51): the salt lake's pit 6 km south, the jungle's basins north-east and south-east,
// the floor rising west to the salt steppe and east toward the second salt lake (-1,708 m, 32 km east). Host-only.
const FAR={x0:-36000,x1:36000,z0:-30000,z1:30000,out:36000};
function farH(x,z){return heightFn(x,z)+18*(KF(x*.0005,z*.0005,3,41)-.5)*2*smooth(3500,9000,Math.max(Math.abs(x),Math.abs(z)));}
// the far lakes from the model's water cells (their levels from wl.png, over y 0): each a still box on its cells' bounds (89w)
const FAR_LAKES=[{name:'The salt lake (WX, -2,474 m)',level:-2474-SITE.y0abs,bounds:[-1000,5000,3000,9000]},
 {name:'The east salt lake (WX, -1,708 m)',level:-1708-SITE.y0abs,bounds:[31000,-3000,36000,7000]},
 {name:'The west salt lake (WX, -1,814 m)',level:-1814-SITE.y0abs,bounds:[-29000,-11000,-25000,-7000]}];
