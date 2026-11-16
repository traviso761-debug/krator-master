// ================================================================= HOST — stage: the bench's edge (station 3)
// The ABYSSAL SAVANNAH at the top of the climb (PLAN.md section 8, station 3): renderer, lights, the cliffs, the bench and the faulted climb
// to the plateau, terrainH(), the fields the kit asks for (wet / salt / upland / flow / rock), the far country's data. The kit (src/50-70) and
// the eastern abyss read in place (47a-47c) are station 1's, ebadlands is read in place (47d: its pinyon, juniper and chaparral yucca); this
// stage, the ground (80), the water (89w), the build (89z) and the take (99) are the station's own (build.py build_main: stations/bench/).
//
// THE SITE (map 5.1, surveyed 2026-11-09; old-canvas px): row 414, px 1038, -282 m (BSh, ~1,240 mm, +28 degC). The transect: XV on the floor's
// bench at -1,110 m (px 1031-1035), the climb breaking at px 1036-1038 (-1,015 -> -579 -> -282 m: 730 m in 4 km, Aw), the bench (BSh, px
// 1038-1039, -280 to -116 m), the climb to the plateau (Cfa, px 1040-1041: +178, +603), the plateau (Csa, +800 to +1,000 m, `e badlands`).
// THE MAP (x east, z south; y 0 is -280 m on the model), 6.4 by 5 km; the model's 2 km cells give the grade, the cliffs are the page's:
//   the LOWER SLOPE  x < -1350: the climb's foot (Aw), the eastern abyss's jungle in its hollows and up the ravines, y -660 .. -470
//   the CLIFFS       the rim at x ~ -1000: KRELIEF.scarp (core/terrain 38), 360 m over a 320 m run, one bench, five ravines (three on the page) cut back into
//                    the bench, buttresses, a talus apron and a lipped rim; the beds are KSTRATA's (the caprock's canyon column)
//   the BENCH        x -1000 .. 1500: the BSh steppe, y -110 .. +10, a few granite kopjes, a seasonal stream into the middle ravine
//   the FAULTS       KRELIEF.relay (core/terrain 38c): two en-echelon fault scarps (150 m throws, the north one at x ~ 1550, the south
//                    at ~ 2250) with a relay ramp between them, a sag pond at the north fault's foot; above them the plateau's first
//                    blocks and ebadlands' pinyon-juniper country, y +150 .. +340
// Nothing here draws from a random stream: KRAND's noise (core/rand) and KRELIEF's hashed records, baked once to a 12.5 m grid.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
var EASTABYSS_LAKE={hue:0.0};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   /* BIO.record: the volume as a core/tags record too */
const SITE={px:1038,py:414,y0abs:-280,model:'Krator Scale Model 5.1',station:'bench'};
const atmAt=y=>1.6*Math.exp(-(y+SITE.y0abs)/8000);   /* the model's pressure (atm0 1.6, scale 8 km): 1.66 atm at y 0 */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd2cdb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0001);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
const HEMI=new THREE.HemisphereLight(0xd4d8cc,0x5a4a36,.62);scene.add(HEMI);   /* the shared sky (89s-host-sky.js) sets it by the hour */
const sun=new THREE.DirectionalLight(0xfff0d0,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0a8,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the land as functions (data: [G data] arithmetic on KRAND and KRELIEF)
const SEED=10384143;                       /* the world seed of this station (px 1038, row 414, station 3) */
const KF=(x,z,o,salt)=>KRAND.fbm(x,z,0,o,SEED+salt);   /* [0,1] */
const TERR={X:3200,Z:2500,cell:12.5};
const CENTER=[0,0];
// GRID51: the scale model 5.1's heights (m over y 0) and classes on its 2 km cells, 41 x 41 round the site (tools/scale-model/model/data:
// h.png, c.png; written 2026-11-09): the far country's ground and colour. K: v XV, A XA, m Am, f Af, a Aw, b BSh, c Cfa, C Csa, ~ water
const GRID51={px0:1018,py0:394,n:41,cell:2000,
 H:[-1733,-1791,-1801,-1796,-1791,-1587,-1556,-1482,-1199,-1181,-826,-419,-109,210,530,806,942,1022,1082,1137,1184,1218,1233,1244,1270,1284,1288,1288,1287,1290,1302,1325,1362,1413,1477,1549,1620,1685,1739,1783,1821,-1725,-1791,-1798,-1794,-1791,-1611,-1562,-1475,-1195,-1110,-868,-349,-58,234,525,752,908,989,1043,1099,1162,1223,1244,1268,1289,1301,1303,1300,1296,1295,1302,1321,1355,1403,1465,1537,1598,1666,1719,1757,1783,-1725,-1791,-1797,-1794,-1791,-1633,-1579,-1499,-1193,-1058,-858,-337,-46,203,421,686,836,873,905,954,1016,1103,1157,1199,1247,1284,1297,1305,1304,1299,1302,1313,1339,1381,1438,1497,1531,1579,1628,1701,1747,-1723,-1791,-1796,-1795,-1791,-1650,-1602,-1539,-1325,-1075,-861,-459,-71,131,312,574,684,713,721,741,732,779,849,896,979,1095,1155,1200,1232,1243,1261,1279,1299,1336,1382,1381,1443,1528,1618,1656,1704,-1717,-1791,-1795,-1799,-1791,-1659,-1623,-1583,-1438,-1130,-933,-631,-122,49,191,387,498,519,504,488,466,520,596,642,726,817,859,967,1043,1087,1142,1186,1212,1225,1218,1260,1350,1444,1528,1602,1670,-1707,-1791,-1794,-1800,-1791,-1658,-1632,-1607,-1507,-1245,-1043,-761,-369,-68,40,180,279,297,266,259,210,210,265,304,400,503,525,667,775,848,949,1038,1077,1072,1121,1204,1255,1305,1397,1521,1648,-1697,-1791,-1793,-1800,-1791,-1649,-1629,-1607,-1540,-1424,-1162,-889,-706,-208,-128,-25,46,74,45,25,13,4,34,49,138,249,300,382,533,619,736,865,905,974,1089,1125,1156,1190,1278,1436,1623,-1688,-1791,-1793,-1799,-1791,-1638,-1626,-1611,-1571,-1496,-1122,-1004,-870,-410,-299,-221,-160,-123,-116,-102,-82,-52,-56,-72,-9,95,151,190,377,466,610,759,827,910,1040,1076,1111,1134,1211,1422,1539,-1680,-1791,-1793,-1794,-1791,-1631,-1627,-1619,-1597,-1535,-1224,-1090,-983,-798,-466,-414,-346,-285,-236,-184,-153,-120,-93,-80,-20,74,126,196,281,410,573,723,799,887,1019,1073,1113,1125,1168,1340,1454,-1669,-1791,-1791,-1791,-1791,-1628,-1627,-1624,-1589,-1394,-1269,-1146,-1055,-919,-623,-569,-475,-379,-315,-255,-203,-137,-85,-41,-10,85,126,265,299,396,523,713,792,899,995,1089,1127,1137,1154,1283,1393,-1657,-1669,-1648,-1632,-1627,-1627,-1627,-1600,-1571,-1387,-1279,-1171,-1094,-982,-854,-659,-584,-481,-385,-304,-228,-138,-58,-25,21,96,137,243,360,399,515,712,836,941,994,1088,1140,1153,1195,1276,1386,-1647,-1667,-1646,-1630,-1627,-1627,-1601,-1574,-1433,-1380,-1272,-1179,-1109,-1007,-899,-757,-662,-562,-459,-322,-196,-44,54,122,169,227,262,362,479,563,634,811,911,1011,1087,1146,1156,1176,1195,1312,1391,-1628,-1674,-1653,-1630,-1627,-1601,-1574,-1521,-1432,-1379,-1271,-1177,-1110,-1008,-908,-847,-742,-634,-547,-348,-118,105,214,289,362,429,478,572,682,766,837,991,1053,1116,1200,1184,1190,1200,1200,1292,1405,-1589,-1658,-1645,-1623,-1599,-1574,-1521,-1503,-1432,-1327,-1271,-1164,-1110,-998,-903,-808,-788,-724,-585,-370,-31,223,410,499,594,690,754,850,950,1010,1097,1158,1190,1228,1280,1261,1240,1260,1269,1361,1470,-1518,-1578,-1594,-1579,-1560,-1516,-1518,-1484,-1432,-1379,-1272,-1163,-1110,-1008,-922,-851,-796,-749,-609,-340,8,349,590,701,821,936,1017,1102,1170,1205,1239,1266,1289,1325,1367,1370,1365,1376,1401,1473,1574,-1434,-1487,-1519,-1529,-1497,-1489,-1464,-1466,-1422,-1375,-1272,-1160,-1105,-1010,-928,-852,-793,-739,-590,-330,17,446,735,881,999,1112,1193,1262,1284,1288,1296,1312,1342,1387,1441,1486,1522,1547,1589,1660,1733,-1351,-1407,-1450,-1464,-1455,-1445,-1418,-1422,-1387,-1351,-1262,-1137,-1087,-1005,-924,-869,-798,-760,-527,-296,22,485,800,982,1097,1190,1253,1288,1287,1285,1294,1319,1360,1416,1477,1542,1605,1663,1718,1772,1821,-1257,-1320,-1369,-1410,-1408,-1378,-1368,-1369,-1338,-1308,-1192,-1141,-1058,-987,-917,-875,-814,-772,-570,-247,25,443,830,1027,1142,1211,1261,1287,1282,1281,1297,1327,1374,1433,1497,1561,1625,1689,1747,1798,1840,-1148,-1221,-1280,-1330,-1332,-1325,-1310,-1300,-1270,-1192,-1174,-1096,-1015,-954,-897,-865,-824,-799,-688,-189,43,350,772,1025,1157,1234,1276,1296,1289,1281,1300,1332,1378,1434,1493,1553,1616,1680,1739,1777,1803,-1073,-1132,-1191,-1250,-1274,-1269,-1238,-1214,-1183,-1156,-1098,-1026,-960,-912,-872,-849,-829,-821,-719,-200,49,278,646,988,1142,1237,1283,1299,1298,1284,1296,1326,1366,1415,1466,1522,1582,1646,1708,1725,1769,-1043,-1056,-1101,-1159,-1196,-1204,-1150,-1113,-1083,-1059,-1010,-948,-904,-872,-847,-831,-819,-811,-715,-279,18,184,478,903,1097,1219,1274,1292,1298,1294,1287,1299,1338,1375,1417,1463,1518,1581,1629,1658,1713,-920,-942,-974,-1024,-1067,-1086,-1038,-1005,-982,-959,-923,-875,-853,-837,-825,-815,-807,-801,-724,-471,-46,88,331,754,1022,1173,1242,1263,1276,1284,1287,1294,1306,1326,1326,1348,1410,1471,1518,1559,1618,-659,-771,-805,-834,-881,-928,-921,-908,-901,-884,-861,-825,-820,-814,-810,-806,-800,-795,-747,-674,-280,-1,195,547,895,1091,1176,1206,1224,1236,1245,1256,1264,1274,1294,1311,1280,1332,1393,1442,1493,-267,-419,-489,-525,-618,-731,-795,-827,-846,-834,-819,-790,-793,-795,-799,-800,-797,-794,-767,-730,-571,-92,87,351,708,996,1103,1150,1178,1192,1198,1200,1208,1229,1256,1280,1296,1244,1293,1338,1380,294,181,72,-30,-209,-418,-586,-743,-803,-796,-787,-765,-751,-784,-794,-800,-800,-798,-786,-769,-689,-328,5,198,470,859,1023,1099,1139,1155,1156,1147,1148,1164,1230,1282,1274,1227,1204,1232,1253,637,566,451,307,106,-110,-359,-626,-737,-756,-761,-748,-742,-780,-795,-805,-808,-807,-803,-797,-737,-613,-94,92,305,701,946,1045,1093,1106,1092,1066,1040,1037,1084,1212,1183,1103,1028,1032,1073,686,643,562,458,326,192,-97,-454,-634,-714,-744,-744,-745,-786,-801,-813,-820,-822,-816,-808,-776,-731,-432,16,204,520,913,1022,1047,1033,988,942,892,860,878,1040,987,841,716,683,739,720,694,639,564,477,397,128,-226,-472,-664,-736,-749,-756,-791,-809,-824,-834,-839,-833,-823,-809,-793,-665,-49,135,340,888,1027,986,915,832,752,686,636,614,658,692,537,361,298,346,733,711,670,609,532,455,298,93,-221,-604,-744,-766,-781,-809,-828,-843,-855,-861,-855,-843,-833,-822,-711,-231,75,271,578,806,882,751,634,530,447,386,327,326,432,231,71,27,61,749,728,702,657,594,523,423,319,-2,-436,-641,-737,-791,-833,-854,-867,-877,-884,-879,-866,-857,-851,-752,-485,15,188,323,661,661,532,391,263,176,81,48,-23,9,3,-62,-59,-44,771,751,729,690,627,560,475,383,175,-95,-367,-638,-778,-856,-888,-898,-906,-910,-904,-892,-884,-881,-805,-690,-293,57,164,373,373,222,111,-35,-170,-243,-328,-280,-234,-146,-136,-118,-59,761,778,754,713,651,587,516,442,319,165,-126,-478,-691,-843,-910,-931,-937,-938,-930,-919,-922,-939,-894,-823,-468,-320,-109,81,41,-113,-230,-338,-433,-454,-442,-402,-351,-251,-209,-151,-77,708,797,776,739,678,611,547,503,399,289,63,-217,-490,-765,-908,-962,-972,-967,-958,-959,-982,-1015,-1004,-973,-894,-575,-366,-410,-344,-450,-567,-620,-608,-609,-579,-513,-425,-354,-252,-194,-94,674,793,792,767,717,658,593,534,458,386,215,1,-309,-670,-881,-977,-1002,-998,-995,-1012,-1051,-1097,-1110,-1108,-1071,-930,-781,-645,-707,-729,-798,-810,-758,-680,-640,-536,-461,-357,-302,-208,-85,654,776,793,780,743,681,608,549,487,439,312,152,-158,-543,-812,-975,-1028,-1037,-1046,-1070,-1121,-1181,-1193,-1193,-1194,-1178,-984,-878,-901,-917,-937,-896,-845,-800,-686,-586,-483,-409,-310,-167,-10,650,765,780,773,743,686,620,567,514,478,380,254,-53,-445,-749,-961,-1043,-1094,-1124,-1146,-1207,-1276,-1195,-1197,-1200,-1200,-1069,-1039,-1054,-1019,-986,-911,-893,-842,-730,-506,-406,-329,-246,-94,96,699,777,772,766,739,686,630,588,536,495,402,282,-15,-400,-705,-929,-1042,-1152,-1214,-1233,-1292,-1353,-1372,-1384,-1207,-1208,-1197,-1153,-1139,-1105,-1021,-973,-917,-804,-641,-359,-267,-197,-99,36,200,811,811,792,776,743,690,640,603,554,510,418,303,9,-372,-679,-908,-1041,-1198,-1286,-1309,-1365,-1407,-1422,-1433,-1439,-1216,-1216,-1192,-1183,-1099,-1081,-985,-866,-721,-575,-389,-294,-81,12,124,259,867,847,820,793,754,701,650,611,563,518,423,304,8,-374,-676,-906,-1057,-1222,-1324,-1370,-1408,-1431,-1439,-1444,-1447,-1447,-1221,-1219,-1192,-1153,-1082,-973,-814,-657,-529,-402,-325,-100,-9,97,206,888,869,840,806,763,710,658,616,569,525,427,304,2,-388,-677,-912,-1069,-1237,-1352,-1403,-1429,-1443,-1447,-1447,-1445,-1441,-1394,-1215,-1206,-1164,-1075,-934,-760,-613,-553,-504,-387,-274,-174,-67,14,886,870,844,812,769,715,662,618,572,529,428,301,-13,-421,-707,-928,-1077,-1240,-1368,-1422,-1445,-1500,-1500,-1500,-1510,-1532,-1500,-1205,-1219,-1174,-1044,-892,-737,-677,-643,-644,-573,-492,-392,-290,-223],
 K:'A~~~~AAAAvvaabcccCbcccbbbbbbcccccbbbbbbbbA~~~~AAAvvvabbccccbbbcbbbbbbcccccbbbbbbbbA~~~~vvvvvvabbbcccbbbbbbbbbbcccccbbcbbbbbA~~~~vvvvAvabbbcccbbbbcccccbccccccbccbbbbA~~~~vvvvvAaabbcCCCCCbbbCcccccccccccbbbbbv~~~~vvvvvAvabbbcCCCCCCCCCCbCbccccccccbbbv~~~~AAAvvvvaaabbCCCCCCCCCCCCbbbcccccccbbv~~~~AAAAvvAvaaaaCCCCCCCCCCCCCbbbbcccccbbv~~~~AAAAAAAAvaaaaCCCCCCCCCCCbbbbbcccccbcv~~~~AAAAAAAAvaaaaaCCCCCCCCCCbbbbcccccccbvAAAAAAAAAAAAvvaaaaCCCCCCCCCCbbbbcccccccbvAAAAAAAAAAAAAvvaaaaCCCCCCCCCbbbccccccccbvAAAAAAAAAAAAAAvvaaaCCCCCCCbbCccccccccccbvAAAAAAAAAAAAAAvvvaaCCCCCbcccccccccccccccvvAAAAAAAAAAAAAvvvaaCcCcccccccccccccccccbvvvAAAAAAAAAAAAvvvaabccccccbCcccccccccbbbvvvvAAAAAAAAAAAvvvaabcccccbCCCcccbccbbbbbvvvvvvAAAAAAAAAvvvaabbccccCCCCcccbccbbbbbvvvvvvvvvvAAAAvvvvaabbcCCCCCCCcccbccbbbbbvvvvvvvvvAAAAvvvvvaabbcCCCCCCCcccbbcbbbbbvvvvvvAAAAAmvvvvvvaabbccCcCCCCccccbbcbbbbmmAAAAAAAAAmvvvvvvvabbbcCCcbbbbccccbbbbbbammmmAAmAmmfvvvvvvvaabbcccccbbbbbbcccbbbbaaaaammfmmffvvvvvvvvaabbcCcccbbbbbbbbbbbbccCaammmmmfffvvvvvvvaabbccccbbbbbbbbbbbbbcccccammfffffvvvvvvvvaabbcccbbbbbbbbbbbbbccccccammmffmvvvvvvvvvabbcccbbbbbbbbbbbCbbbcccccamfffmvvvvvvvvvabbbccbbbbbCCCCCCCCbbbcccccmffffvvvvvvvvvaabbcccbCCCCCCCCCCCbbbbcccccmffmvvvvvvvvvvabbccbCCCCCCCCCCCCbbbbbcccacmmmvvvvvvvvAvabbbCCCCCCCCCCCCCCbbbbbCccccaaavvvvvvvAAvvaaaCCCCCCCCCCCCCCbbbbbbCccccaaavvvvvvAAAvvaaaCCCCCCCCCCCCCbbbbbbbCcccCaavvvvvAAAvvvvaaaCvvvvCCCCCCCbbbbbbbbcccCaavvvvvAAvAvAAvvvvvvvvCCCCCCCbbbbbbbbbccCCavvvvvAAAAAAAAvAvvvvvvCCCCCCbbbbbbbbbbcCCaavvvvAAAAAAAAAAAvvvvCCCCCCCbbbbbbbbbbCCCaavvvvAAAAAAAAAAAAvvvCCCCCCCbbbbbbbbbbCCCaavvvAAAAAAAAAAAAAvvCCCCCCCCbbbbbbbbbbCCCabvvvAAAAAAAAAAAAAvvCCCCCCCCbbbbbbbbbbCCCabvvvAAA~~~~~~AAAAvvCCCCCCCC'};
function crm(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
const gH=(i,j)=>GRID51.H[clamp(j,0,GRID51.n-1)*GRID51.n+clamp(i,0,GRID51.n-1)];
const gUV=(x,z)=>[SITE.px+x/GRID51.cell-GRID51.px0,SITE.py+z/GRID51.cell-GRID51.py0];
function modelH(x,z){const q=gUV(x,z),i=Math.floor(q[0]),j=Math.floor(q[1]),fu=q[0]-i,fv=q[1]-j,r=[];
 for(let k=-1;k<=2;k++)r.push(crm(gH(i-1,j+k),gH(i,j+k),gH(i+1,j+k),gH(i+2,j+k),fu));return crm(r[0],r[1],r[2],r[3],fv);}
function classW(x,z,chars){const q=gUV(x,z),i=Math.floor(q[0]),j=Math.floor(q[1]),fu=q[0]-i,fv=q[1]-j,n=GRID51.n,K=GRID51.K;
 const w=(a,b)=>{a=clamp(a,0,n-1);b=clamp(b,0,n-1);return chars.indexOf(K[b*n+a])>=0?1:0;};
 return w(i,j)*(1-fu)*(1-fv)+w(i+1,j)*fu*(1-fv)+w(i,j+1)*(1-fu)*fv+w(i+1,j+1)*fu*fv;}
// THE RIM LINE (the cliffs' top), gently arcuate north to south; xs: the across-slope coordinate measured from it (-1000 on the rim)
const rimX=z=>-1000+130*Math.sin(z*.00062+.5)+40*Math.sin(z*.0019+1.3);
const xsOf=(x,z)=>x-rimX(z)-1000;
// THE CLIFFS (core/terrain 38, KRELIEF.scarp; SCARP.md): the plateau (the bench) east of the rim (side -1: the line runs north to south)
const SCARP=KRELIEF.scarp({pts:(function(){const p=[];for(let z=-3800;z<=3800;z+=380)p.push([rimX(z),z]);return p;})(),side:-1,h:360,run:320,power:1.5,drop:false,
 benches:{n:1,w:44},ravines:{n:5,w:[55,85],head:[150,260],depth:[30,70],fan:{r:130,h:7}},buttresses:{sp:360,amp:42},talus:{h:30,reach:200},rim:{lip:3,w:24},
 warp:{amp:30},rough:.014,ends:600,seed:KRAND.hash(SEED,0x5ca)});
// THE FAULTS (core/terrain 38c, KRELIEF.relay; LANDFORMS.md): the climb to the plateau broken by two en-echelon fault scarps, a relay ramp where
// they overlap (z -900 .. 900); the downthrown side west (side 1 on a line run north to south). The base ground carries their throw (RELAY.T)
// and the relay lowers the bench by it, so the bench sits where the base says
const RELAY_T=150;
const RELAY=KRELIEF.relay({faults:[{pts:[[1520,-9000],[1590,-3000],[1560,900]],throw:RELAY_T,side:1,tip:.12,face:70},
 {pts:[[2230,-900],[2300,3000],[2270,9000]],throw:RELAY_T,side:1,tip:.12,face:70}],tilt:.1,tiltW:480,lip:.05,lipW:110,seed:KRAND.hash(SEED,0x7e1)});
// the base ground: the lower slope rising to the cliffs' foot, the bench's grade, the climb east; plus the relay's throw (the relay takes it off)
function baseH(x,z){const xs=xsOf(x,z);
 return -660+190*smooth(-3300,-1380,xs)+120*smooth(-900,1400,xs)+190*smooth(1300,3700,xs)+RELAY_T
  +7*(KF(x*.0019,z*.0019,3,21)-.5)*2+2.6*(KF(x*.0068,z*.0068,2,22)-.5)*2+1*(KF(x*.021,z*.021,2,23)-.5)*2;}
// the KOPJES: a few granite tors on the bench (the kit draws their piles: ABSAV.build({kopjes}))
const KOPJES=(function(){const out=[],S=KRAND.stream(KRAND.hash(SEED,0x4b0f));
 for(let i=0;i<160&&out.length<9;i++){const x=S.range(-700,1300),z=S.range(-TERR.Z+250,TERR.Z-250),r=S.range(24,40),h=S.range(7,18);
  if(xsOf(x,z)<-650)continue;
  if(out.some(k=>Math.hypot(k.x-x,k.z-z)<k.r+r+260))continue;
  out.push({id:'kopje-'+out.length,x,z,r,h,seed:S.u32()});}
 return out;})();
const KOP_S=KSPACE.create({cell:100});KOPJES.forEach(k=>KOP_S.insert(k,k.x,k.z,k.r));
// THE STREAM: seasonal, from the bench's middle west into the middle ravine's head (it goes over the cliff in the rains: its fall is dry now),
// and from that ravine's fan at the cliffs' foot down the lower slope to the map's west edge. Two channels, each a bed that never climbs
const RAV=SCARP.ravines.slice().sort((a,b)=>Math.abs(a.z-200)-Math.abs(b.z-200))[0];
const CH=(function(){const top=[],low=[],hx=RAV.x-RAV.nx*RAV.head*.85,hz=RAV.z-RAV.nz*RAV.head*.85,mx=RAV.x+RAV.nx*(SCARP.run+60),mz=RAV.z+RAV.nz*(SCARP.run+60);
 for(let t=0;t<=1;t+=.004){const x=mix(1150,hx,t),z=mix(RAV.z+520,hz,t)+90*Math.sin(t*5.3+.4)*(1-t);top.push([x,z]);}
 for(let t=0;t<=1;t+=.003){const x=mix(mx,-TERR.X-40,t),z=mz+150*Math.sin(t*4.1+.9)*t+50*Math.sin(t*13+.2)*t;low.push([x,z]);}
 return{top,low,head:[hx,hz],mouth:[mx,mz]};})();
// a channel: its points every ~8 m, the ground's running minimum along it less D (the bed), indexed by core/space
function channel(pts,D,W,ground){const P=[];let lo=1e9;
 for(let i=0;i<pts.length;i++){const p=pts[i],g=ground(p[0],p[1]);lo=Math.min(lo,g);P.push({x:p[0],z:p[1],bed:lo-D,i});}
 const S=KSPACE.create({cell:32});P.forEach(p=>S.insert(p,p.x,p.z,0));
 const near=(x,z,R)=>{let b=null,bd=R;S.some(x,z,R,p=>{const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;b=p;}return false;});return b?{p:b,d:bd}:null;};
 return{P,W,D,near};}
const preH=(x,z)=>{let h=KRELIEF.shape(SCARP,x,z,baseH(x,z));h=KRELIEF.shape(RELAY,x,z,h);
 KOP_S.some(x,z,0,k=>{const d=Math.hypot(x-k.x,z-k.z);if(d<k.r)h+=k.h*Math.pow(1-d/k.r,1.35);return false;});return h;};
const CH_TOP=channel(CH.top,2.6,20,preH),CH_LOW=channel(CH.low,3.2,24,preH);
function chCut(C,x,z,h){const q=C.near(x,z,C.W*2.4);if(!q)return h;const t=smooth(C.W*2.4,C.W*.25,q.d);return Math.min(h,mix(h,q.p.bed+.2*(q.d/C.W),Math.pow(t,1.6)));}
// the height, as arithmetic (the bake below samples it once)
function heightFn(x,z){let h=preH(x,z);h=chCut(CH_TOP,x,z,h);h=chCut(CH_LOW,x,z,h);return h;}
// ---------------------------------------------------------------- the bake: heights on a 12.5 m grid, the fields on 25 m
const HG=(function(){const c=TERR.cell,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,a=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=heightFn(-TERR.X+i*c,-TERR.Z+j*c);
 return{c,nx,nz,a};})();
function gridH(x,z){const u=clamp((x+TERR.X)/HG.c,0,HG.nx-1.0001),v=clamp((z+TERR.Z)/HG.c,0,HG.nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=HG.a,n=HG.nx;
 return a[j*n+i]*(1-fu)*(1-fv)+a[j*n+i+1]*fu*(1-fv)+a[(j+1)*n+i]*(1-fu)*fv+a[(j+1)*n+i+1]*fu*fv;}
const inMap=(x,z)=>Math.abs(x)<=TERR.X&&Math.abs(z)<=TERR.Z;
function terrainH(x,z){return inMap(x,z)?gridH(x,z):farBlend(x,z);}
function slopeAt(x,z){const e=TERR.cell;return Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);}
// the plateau's blocks: 1 above the faults, 0 on the bench (the relay's lowering, read back), and the climb east
const hiK=(x,z)=>clamp(1+(KRELIEF.shape(RELAY,x,z,0)-RELAY_T*.05)/RELAY_T,0,1);
// the fields (PLAN.md section 4): upland by height (the foot under .2, the lower slope's parkland, the bench's steppe over .7), wet the climb's
// foot and the channels, rock the cliffs (KRELIEF.scarpRock), the fault faces and any steep ground
const FC=(function(){const c=25,nx=Math.round(2*TERR.X/c)+1,nz=Math.round(2*TERR.Z/c)+1,N=nx*nz;
 const a={up:new Float32Array(N),wet:new Float32Array(N),flow:new Float32Array(N),rock:new Float32Array(N),salt:new Float32Array(N),hi:new Float32Array(N)};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-TERR.X+i*c,z=-TERR.Z+j*c,k=j*nx+i,y=terrainH(x,z),s=slopeAt(x,z);
  const q1=CH_TOP.near(x,z,60),q2=CH_LOW.near(x,z,70),fl=Math.max(q1?smooth(CH_TOP.W*2,5,q1.d):0,q2?smooth(CH_LOW.W*2,5,q2.d):0);
  const rv=KRELIEF.at(SCARP,x,z),inRav=rv&&rv.part==='ravine'?1:0,ra=KRELIEF.at(RELAY,x,z),fault=ra&&ra.part==='scarp'?1:0,kop=KOP_S.some(x,z,0,K=>Math.hypot(x-K.x,z-K.z)<K.r*.8);
  a.hi[k]=hiK(x,z);a.flow[k]=Math.max(fl,inRav*.55);
  a.up[k]=clamp(smooth(-660,-430,y)*.62+.38*smooth(-300,-120,y),0,1);
  a.wet[k]=clamp(mix(.9,.3,smooth(-640,-250,y))+.42*a.flow[k]-.06*a.hi[k],0,1);
  a.rock[k]=clamp(Math.max(smooth(.5,.95,s),KRELIEF.scarpRock(SCARP,x,z)*.95,fault*.85,kop?.85:0),0,1);
  a.salt[k]=0;}
 const at=(arr,x,z)=>{const u=clamp((x+TERR.X)/c,0,nx-1.0001),v=clamp((z+TERR.Z)/c,0,nz-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*nx+i]*(1-fu)*(1-fv)+arr[j*nx+i+1]*fu*(1-fv)+arr[(j+1)*nx+i]*(1-fu)*fv+arr[(j+1)*nx+i+1]*fu*fv;};
 return{c,nx,nz,a,at};})();
const FIELD={
 upland:(x,z)=>inMap(x,z)?FC.at(FC.a.up,x,z):clamp(smooth(-660,-430,terrainH(x,z))*.62+.38*smooth(-300,-120,terrainH(x,z)),0,1),
 wet:(x,z)=>inMap(x,z)?FC.at(FC.a.wet,x,z):.45,
 flow:(x,z)=>inMap(x,z)?FC.at(FC.a.flow,x,z):0,
 rock:(x,z)=>inMap(x,z)?FC.at(FC.a.rock,x,z):0,
 salt:(x,z)=>0};
const plateauK=(x,z)=>inMap(x,z)?FC.at(FC.a.hi,x,z):hiK(x,z);
// ---------------------------------------------------------------- the water's levels (core/water draws them: 89w-host-water.js)
// the two channels' streams at their beds plus a hand; the sag pond against the north fault's foot (the relay's back-tilted bench)
const flowPts=C=>{const pts=[];let lo=1e9;for(let i=0;i<C.P.length;i+=2){const p=C.P[i];let g=1e9;for(let o=-9;o<=9;o+=3)g=Math.min(g,terrainH(p.x+o,p.z));lo=Math.min(lo,g);pts.push([p.x,p.z,lo+.22]);}return pts;};
const STREAM_TOP=flowPts(CH_TOP),STREAM_LOW=flowPts(CH_LOW);
const SAG=(function(){let b=null;for(let z=-2300;z<=-1000;z+=25)for(let x=1250;x<=1540;x+=10){const y=terrainH(x,z);if(!b||y<b.y)b={x,z,y};}
 let lo=1e9;for(let a=0;a<16;a++)lo=Math.min(lo,terrainH(b.x+Math.cos(a/16*TAU)*46,b.z+Math.sin(a/16*TAU)*46));
 return{name:'The sag pond (at the north fault\'s foot)',x:b.x,z:b.z,r:44,level:Math.min(lo-.3,b.y+2.4)};})();
function nearPts(P,x,z,w){let best=null,bd=w;for(let i=0;i<P.length;i++){const d=Math.hypot(x-P[i][0],z-P[i][1]);if(d<bd){bd=d;best=P[i];}}return best;}
const STREAM_S=(function(){const S=KSPACE.create({cell:24});STREAM_TOP.concat(STREAM_LOW).forEach(p=>S.insert(p,p[0],p[1],0));return S;})();
function waterH(x,z){let w=-1e9;
 if(Math.hypot(x-SAG.x,z-SAG.z)<SAG.r&&SAG.level>terrainH(x,z)-3)w=Math.max(w,SAG.level);
 let b=null,bd=4.5;STREAM_S.some(x,z,5,p=>{const d=Math.hypot(x-p[0],z-p[1]);if(d<bd){bd=d;b=p;}return false;});if(b)w=Math.max(w,b[2]);
 return w;}
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: up the climb through the middle ravine, along the cliffs' top, across the bench and up the faults' ramp
const SPINE=[[-3000,300],[-2200,300],[-1500,250],[-950,-1400],[-950,0],[-950,1400],[-300,0],[500,-900],[600,800],[1300,0],[1900,0],[2600,-600],[2700,900]];
BIO.init({tags:'abyssal-savannah',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{const d=terrainH(x,z)-waterH(x,z);return d<.15?0:d<.6?(d-.15)/.45:1;},   /* nothing roots under water */
 obstacles:OBSTACLES,ticks:tick,seed:41,
 origin:SPINE,center:CENTER,lod:{hero:900,mid:1700,far:3200,floor:[480,1200]},
 fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],register:REGISTER,err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('abyssal-savannah',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,y/9,0,2,77)-.5)*40+(KRAND.h3(x,y,9,78)-.5)*22;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const GROUND={foot:0x4a3424,footG:0x4e4a2a,gold:0xb39552,gold2:0x9c8048,green:0x6e7a3a,char:0x2a241e,ash:0x8c8478,bench:0xb8a06a,bench2:0xa48e5c,
 plat:0x8e7a58,plat2:0x7a6a4c,rock:0x8a6a56,rock2:0x6e5446,bed:0x5a4630};
// THE CLIFFS' BEDS (core/terrain 35, KSTRATA): the caprock's canyon column over the climb, dipping gently east, its colour on the cliffs' and the
// faults' faces only (on the CPU, per vertex). ?strata=0 for the plain paint
const STRATA=typeof KSTRATA!=='undefined'&&new URLSearchParams(location.search).get('strata')!=='0'?KSTRATA.create({seed:KRAND.hash(SEED,0x57a7),recipe:'canyon',range:[-680,420],dip:[1,0,.004],warp:[7,2.2]}):null;
function groundColour(x,z,c,t){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z),pk=plateauK(x,z);
 const n=KF(x*.011,z*.011,2,31)-.5,age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8;
 c.set(GROUND.gold).lerp(t.set(GROUND.gold2),clamp(.5+n*1.6,0,1));
 c.lerp(t.set(GROUND.green),age<=3?(age<=0?0:mix(.75,.25,(age-1)/2)):0);
 c.lerp(t.set(GROUND.bench).lerp(new THREE.Color(GROUND.bench2),clamp(.5+n*1.5,0,1)),smooth(.62,.82,up));
 c.lerp(t.set(GROUND.plat).lerp(new THREE.Color(GROUND.plat2),clamp(.5+n*1.5,0,1)),.6*pk);
 c.lerp(t.set(GROUND.foot).lerp(new THREE.Color(GROUND.footG),clamp(.5+n*1.5,0,1)),smooth(.2,.05,up)*smooth(.55,.8,wet));
 if(age<=0)c.lerp(t.set(GROUND.char).lerp(new THREE.Color(GROUND.ash),clamp(.3+n*2,0,1)*.5),.85*(1-rk));
 c.lerp(t.set(GROUND.bed),fl*.6);
 c.lerp(t.set(GROUND.rock).lerp(new THREE.Color(GROUND.rock2),clamp(.5-n*1.8,0,1)),rk*.85);
 if(STRATA&&rk>.3){const B=STRATA.at(x,terrainH(x,z),z),q=B.colour;c.lerp(t.setRGB(q[0],q[1],q[2]),smooth(.3,.7,rk)*.82);}
 return c;}
// THE LIBRARY LAYERS ON KGROUND (43-core-ground.js; station 1's four surfaces), per vertex in aGL:
//   soil    aGL.x  the red soil: the channels' beds (flow) and the foot's wet ground
//   burn    aGL.y  this year's burns (ABSAV.burn 0), off rock and the channels
//   salt    aGL.z  none on this page (the layer kept, its mask 0, so the material is station 1's)
//   gravel  aGL.w  the bench's stony steppe (a macro patch ~400 m), the talus apron under the cliffs and the fault scarps' feet
//   wet     aWet   the water's wet band (89z)
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
function groundMasks(x,z,o){const up=FIELD.upland(x,z),wet=FIELD.wet(x,z),fl=FIELD.flow(x,z),rk=FIELD.rock(x,z);
 const age=(typeof ABSAV!=='undefined'&&ABSAV.burn)?ABSAV.burn(x,z):8,off=1-smooth(.35,.7,rk),pat=KF(x*.0025,z*.0025,2,51),sp=KRELIEF.at(SCARP,x,z),fp=KRELIEF.at(RELAY,x,z);
 o[0]=clamp(Math.max(smooth(.35,.75,fl),smooth(.55,.85,wet)*smooth(.16,.06,up)*smooth(.4,.62,pat)),0,1)*off;
 o[1]=(age<=0?1:0)*off*(1-smooth(.3,.6,fl));
 o[2]=0;
 o[3]=clamp(Math.max(smooth(.65,.85,up)*smooth(.42,.62,pat),sp&&(sp.part==='talus'||sp.part==='fan')?.85:0,fp&&fp.part==='foot'?.6:0),0,1)*(1-o[1]);
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
 if(USE_KG)KGROUND.hook(m,{key:'absav-bench-ground',at:'/*KGROUND*/',layers:[
  KGROUND.layer('abyssal-savannah','ground.soil',{w:'vGL.x',amt:.55,gain:1.1,tint:'diffuse',name:'red soil'}),
  KGROUND.layer('abyssal-savannah','ground.burn',{w:'vGL.y',amt:.75,gain:1.0,name:'this year\'s burn'}),
  KGROUND.layer('abyssal-savannah','ground.salt',{w:'vGL.z',amt:.7,gain:1.1,name:'salt (none here)'}),
  KGROUND.layer('abyssal-savannah','ground.gravel',{w:'vGL.w',amt:.55,gain:1.05,tint:'diffuse',name:'the bench\'s gravel and the talus'})]});
 MAT_GROUND=m;
 GROUND_MESH=new THREE.Mesh(g,m);GROUND_MESH.receiveShadow=true;GROUND_MESH.userData.probeSkip=true;GROUND_MESH.userData.inspectLabel='The bench\'s edge';scene.add(GROUND_MESH);}
// ---------------------------------------------------------------- the far country (its config; the mesh is KFAR's: 80-host-ground.js)
// Past the map to 36 km: the page's land blending onto 5.1's own cells (GRID51) over 4 km: the floor's XV bench and the jungle (XA) west and
// below, the climb running on north and south, the plateau (Cfa, Csa, `e badlands`) east. Host-only.
const FAR={x0:-36000,x1:36000,z0:-30000,z1:30000,out:36000};
function farBlend(x,z){const o=Math.max(Math.abs(x)-TERR.X,Math.abs(z)-TERR.Z,0),w=smooth(300,4500,o);return w>=1?modelH(x,z):mix(heightFn(x,z),modelH(x,z),w);}
function farH(x,z){return farBlend(x,z)+16*(KF(x*.0005,z*.0005,3,41)-.5)*2*smooth(3500,9000,Math.max(Math.abs(x),Math.abs(z)));}
const FAR_LAKES=[];
