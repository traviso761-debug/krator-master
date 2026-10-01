// ================================================================= HOST — layout (Shade)
// Everything that says WHERE, and nothing that draws: the map, terrainH,
// waterH, the streams, the switchback and the places. 45-host-stage builds the
// ground and the water from this; the life layer (84) and the probe (91) read it.
//
// COMPASS: x east, z south, north is -z. Metres; a person is 1.75 m. The sun
// stands WNW (azimuth 299, altitude 45; the sky in 82 is painted to match).
//
// THE MAP (TERR.R 1300 is where things grow; the ground runs on to 4.2 km under the haze):
//   the plateau       59-66 m, red desert scrub, five mesas well out
//   THE BASIN         a sunken floor at 10 m, x -95..119, z -80..80, its walls 49-56 m high:
//     west              the LIP (z -45..22): sheer; the upper stream falls over it into the pool
//     south             x -60..0 sheer, facing north into the sun: the carved (Petra) face
//     north             x 30..98: a 64 m talus slope carrying the switchback
//     elsewhere         ~12 m of steep face
//     east              the canyon mouth, walls either side of it
//   THE POOL          (-83,0) r 14, surface 9.3 m, 3.8 m deep, at the foot of the falls
//   THE LOWER STREAM  from the pool east across the basin and out down the canyon
//   THE CANYON        a slot 30-48 m wide from x 100 east to the edge of the map
//   THE SWITCHBACK    six legs up the north slope with hairpins: the only way up
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
const TERR={R:1300,FLOOR:10,GROUND:4200};
const BASIN={x0:-95,x1:119,z0:-80,z1:80,rc:22};
const POOL={x:-83,z:0,r:14,y:9.3,depth:3.8};
const LIPX=-96.6;                       // the top edge of the sheer west lip; its foot is x -95
// ---------------------------------------------------------------- the plateau
// 59 m and up, never lower: the upper stream's banks must stand above its water
// (the Gemini draft's stream ran on a dyke where the plateau's noise dipped)
const MESAS=[[-520,-430,95,32],[360,-560,125,40],[660,470,140,36],[-430,540,100,28],[930,-420,110,46]];
function mesaH(x,z){let h=0;for(let i=0;i<MESAS.length;i++){const M=MESAS[i],dx=x-M[0],dz=z-M[1],d=Math.hypot(dx,dz);if(d>M[2]*1.5)continue;
 const a=Math.atan2(dz,dx),e=M[2]*(1+.07*Math.sin(3*a+i)+.045*Math.sin(7*a+2*i)+.03*Math.sin(13*a)),u=d/e;
 h+=M[3]*(.82*smooth(1.0,.9,u)+.18*smooth(1.22,.96,u));}return h;}
function plateauH(x,z){return 59.4+6*fbm(x*.004+3,z*.004-2,17,3)+.8*(fbm(x*.03,z*.03,29,2)-.5)+mesaH(x,z);}
// ---------------------------------------------------------------- the basin and the canyon
// basinD: signed distance to the edge of the floor (negative on the floor). A
// rounded box for the basin, a half-strip for the canyon, joined by a smooth
// minimum so the mouth has a fillet instead of a notch.
function sdBox(x,z){const cx=(BASIN.x0+BASIN.x1)/2,cz=(BASIN.z0+BASIN.z1)/2,hx=(BASIN.x1-BASIN.x0)/2-BASIN.rc,hz=(BASIN.z1-BASIN.z0)/2-BASIN.rc;
 const qx=Math.abs(x-cx)-hx,qz=Math.abs(z-cz)-hz;return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-BASIN.rc;}
function zC(x){return 9*Math.sin(.0065*(x-119))*smooth(119,200,x)+4*Math.sin(.017*x+.5)*smooth(150,260,x);}   // the canyon's centreline
function cW(x){return 17+4*Math.sin(.011*x+1)+3*Math.sin(.031*x);}                                             // its half-width
function sdCanyon(x,z){return Math.max(Math.abs(z-zC(x))-cW(x),100-x);}
function smin(a,b,k){const h=clamp(.5+.5*(b-a)/k,0,1);return mix(b,a,h)-k*h*(1-h);}
// the faces: how much of each special wall a point is in (0..1, smooth, so no fins where they meet)
function kSouth(x,z){return smooth(-72,-60,x)*(1-smooth(0,12,x))*smooth(40,60,z);}              // the carved face
function kLip(x,z){return smooth(-60,-80,x)*smooth(-52,-40,z)*(1-smooth(20,32,z));}             // the waterfall lip and the shrine
function kSwitch(x,z){return smooth(16,30,x)*(1-smooth(98,110,x))*smooth(-40,-60,z);}           // the switchback slope
// the width of the wall face (floor to plateau, horizontally)
function kRow(x,z){return(1-kSwitch(x,z))*(1-smooth(126,134,x));}                              // the basin's own walls: the cliff dwellings stand against them
function wallW(x,z){let W=12;W=mix(W,2.5,kRow(x,z));W=mix(W,2,kSouth(x,z));W=mix(W,1.6,kLip(x,z));W=mix(W,64,kSwitch(x,z));return W;}
function basinD(x,z){const straight=Math.max(kSouth(x,z),kLip(x,z),kSwitch(x,z)),row=kRow(x,z)*(1-straight);
 return smin(sdBox(x,z),sdCanyon(x,z),10)+(fbm(x*.03+7,z*.03-3,41,2)-.5)*7*(1-straight)*(1-row*.86);}   // the faces the dwellings stand against wander no more than half a metre
// ---------------------------------------------------------------- the water
// the lower stream's surface descends from the pool to the canyon; the floor
// keeps at least 1.1 m above it so its banks always hide the ribbon's edges
function WLL(x){return POOL.y-.0045*Math.max(0,x-POOL.x);}
function floorH(x,z){return Math.min(TERR.FLOOR,WLL(x)+1.3)+.35*(fbm(x*.02,z*.02,88,2)-.5);}
function zS(x){if(x>=119)return zC(x);return mix(4.5*Math.sin(.045*(x-POOL.x))*smooth(POOL.x,POOL.x+25,x),zC(x),smooth(40,119,x));}
// the upper stream: from the west edge of the map to the lip, rising gently westward
function WLU(x){return 55.6+.0015*(LIPX-x);}
function zU(x){return (10*Math.sin(.0045*(x-LIPX))+4*Math.sin(.013*x+2))*smooth(LIPX-10,LIPX-120,x);}
const STREAM={lowHW:2.0,lowBank:4.5,upHW:1.6,upBank:4.5,bed:.7};
// ---------------------------------------------------------------- the switchback
// Six straight legs up the north slope (x 36..90), each at a constant distance
// into the slope, joined by semicircular hairpins, then a short run out onto
// the plateau. The height rises linearly with distance walked. A leg sits where
// the slope's own height is the leg's middle height, so it cuts in at one end
// and is built out at the other by about half a leg's rise; legs are kept at
// least SWB.gap apart so the cut of one never reaches the next.
const SWB={x0:36,x1:90,legs:6,zEdge:BASIN.z0,W:64,half:1.6,bank:3.5,gap:7.4,pts:null,len:0,y0:0,y1:0,grade:0,spacing:[]};
(function(){const F=TERR.FLOOR,xm=(SWB.x0+SWB.x1)/2,W=SWB.W;
 const P=plateauH(xm,SWB.zEdge-W-6);
 const U=d=>F+(P-F)*(t=>t*t*(3-2*t))(clamp(d/W,0,1));              // the slope's height d metres in
 const invU=y=>{const p=clamp((y-F)/(P-F),0,.9999);return W*(.5-Math.sin(Math.asin(1-2*p)/3));};
 // first pass: estimate the length, so each leg's middle height is known
 const pass=L=>{const y0=F+.25,y1=P-.3,g=(y1-y0)/L,ds=[];let s=8,pts=[];   // s: the approach from the floor is ~8 m
  for(let i=0;i<SWB.legs;i++){const yMid=y0+g*(s+(SWB.x1-SWB.x0)/2);let d=invU(yMid);if(i>0)d=Math.max(d,ds[i-1]+SWB.gap);d=Math.min(d,W-2);ds.push(d);
   s+=SWB.x1-SWB.x0;if(i<SWB.legs-1)s+=Math.PI*SWB.gap*.5;}
  return{ds,y0,y1};};
 let L=420,res=null;for(let it=0;it<6;it++){res=pass(L);
  // assemble the polyline for this estimate and measure it
  const P3=[];const add=(x,d)=>P3.push([x,SWB.zEdge-d]);
  add(SWB.x0,-8);                                                     // the foot, on the basin floor
  for(let i=0;i<SWB.legs;i++){const d=res.ds[i],east=i%2===0,xa=east?SWB.x0:SWB.x1,xb=east?SWB.x1:SWB.x0;
   for(let k=0;k<=24;k++)add(mix(xa,xb,k/24),d);
   if(i<SWB.legs-1){const d2=res.ds[i+1],c=(d+d2)/2,r=(d2-d)/2;
    for(let k=1;k<12;k++){const a=k/12*Math.PI;add(xb+(east?1:-1)*Math.sin(a)*r,c-Math.cos(a)*r);}}}
  const last=res.ds[SWB.legs-1],xe=SWB.legs%2===0?SWB.x0:SWB.x1;add(xe,last+6);add(xe,W+12);   // out onto the plateau
  let len=0;for(let k=1;k<P3.length;k++)len+=Math.hypot(P3[k][0]-P3[k-1][0],P3[k][1]-P3[k-1][1]);
  SWB.pts=P3;SWB.len=len;if(Math.abs(len-L)<1)break;L=len;}
 SWB.y0=res.y0;SWB.y1=res.y1;SWB.grade=(res.y1-res.y0)/SWB.len;SWB.ds=res.ds;
 for(let i=1;i<res.ds.length;i++)SWB.spacing.push(+(res.ds[i]-res.ds[i-1]).toFixed(2));
 // heights by distance walked
 let s=0;SWB.pts[0].push(SWB.y0);
 for(let k=1;k<SWB.pts.length;k++){s+=Math.hypot(SWB.pts[k][0]-SWB.pts[k-1][0],SWB.pts[k][1]-SWB.pts[k-1][1]);SWB.pts[k].push(SWB.y0+(SWB.y1-SWB.y0)*s/SWB.len);}
 // a bucket grid of segments (6 m cells) so terrainH asks only the few nearby
 const C=6,B=new Map(),key=(i,j)=>i*4096+j;
 for(let k=0;k<SWB.pts.length-1;k++){const a=SWB.pts[k],b=SWB.pts[k+1],r=SWB.bank+.5;
  for(let i=Math.floor((Math.min(a[0],b[0])-r)/C);i<=Math.floor((Math.max(a[0],b[0])+r)/C);i++)
   for(let j=Math.floor((Math.min(a[1],b[1])-r)/C);j<=Math.floor((Math.max(a[1],b[1])+r)/C);j++){const kk=key(i,j);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);}}
 SWB.cell=C;SWB.bucket=B;SWB.key=key;})();
// nearest point on the switchback: {d, y} (d = horizontal distance to the centreline)
function swNear(x,z){const L=SWB.bucket.get(SWB.key(Math.floor(x/SWB.cell),Math.floor(z/SWB.cell)));if(!L)return null;
 let bd=1e9,by=0;for(const k of L){const a=SWB.pts[k],b=SWB.pts[k+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez;
  const t=l2>0?clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1):0,px=a[0]+ex*t,pz=a[1]+ez*t,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;by=a[2]+(b[2]-a[2])*t;}}
 return{d:bd,y:by};}
// ---------------------------------------------------------------- terrain
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){
 const d=basinD(x,z);let h;
 if(d<=0)h=floorH(x,z);
 else{const P=plateauH(x,z),W=wallW(x,z);if(d>=W)h=P;else{const F=floorH(x,z),t=d/W;h=F+(P-F)*t*t*(3-2*t);}}
 // the switchback: a flat trail 3.2 m wide, cut in or built out to its own height
 if(x>SWB.x0-20&&x<SWB.x1+20&&z<SWB.zEdge+12&&z>SWB.zEdge-SWB.W-20){const n=swNear(x,z);if(n&&n.d<SWB.bank)h=mix(h,n.y,1-smooth(SWB.half,SWB.bank,n.d));}
 // the plunge pool, on the floor only (its hollow must not eat the lip)
 const dp=Math.hypot(x-POOL.x,z-POOL.z);
 if(dp<17&&d<.5)h=Math.min(h,mix(POOL.y-POOL.depth,h,smooth(8,16,dp)));
 // the lower stream's channel
 if(x>POOL.x-2){const dS=Math.abs(z-zS(x));if(dS<STREAM.lowBank)h=Math.min(h,mix(WLL(x)-STREAM.bed,h,smooth(STREAM.lowHW,STREAM.lowBank,dS)));}
 // the upper stream's channel, cut through the plateau and the top of the lip
 if(x<=BASIN.x0){const dU=Math.abs(z-zU(x));if(dU<STREAM.upBank)h=Math.min(h,mix(WLU(x)-STREAM.bed,h,smooth(STREAM.upHW,STREAM.upBank,dU)));}
 return h;}
// the local water surface (-1e9 where there is none)
function waterH(x,z){const dp=Math.hypot(x-POOL.x,z-POOL.z);if(dp<POOL.r+3&&x>BASIN.x0-1)return POOL.y;
 if(x>POOL.x&&Math.abs(z-zS(x))<STREAM.lowBank)return WLL(x);
 if(x<=LIPX+.4&&Math.abs(z-zU(x))<STREAM.upBank)return WLU(x);return -1e9;}
// ---------------------------------------------------------------- the places
// Every place the life layer can send someone to. kind: 'ground' (open basin
// floor; must be flat and dry, nothing grows there), 'wall' (built into a cliff
// face; its facade line must lie on a sheer face), 'shore' (must touch the
// water), 'plateau' (up top). Polygons are [x,z]; capacity is people present.
// Activities are the life layer's (84); a place offers them, a job asks for them.
const PLACES=[
 {id:'shrine',name:'Shrine of the Deep Aquifer',kind:'wall',poly:[[-97,-42],[-80,-42],[-80,-24],[-97,-24]],
  facade:{a:[-95,-40],b:[-95,-26],face:[1,0]},activities:['WORSHIP','SLEEP'],capacity:120,tags:{culture:'eastern-nomad',types:['religious']}},
 {id:'petra',name:'The carved dwellings (Petra face)',kind:'wall',poly:[[-58,66],[-2,66],[-2,82],[-58,82]],
  facade:{a:[-58,80],b:[-2,80],face:[0,-1]},activities:['SLEEP','EAT','CRAFT','SOCIALIZE','REST','PLAY'],capacity:260,tags:{culture:'eastern-nomad',types:['multi-family dwelling']}},
 {id:'pool_shore',name:'The pool shore (watering place)',kind:'shore',poly:[[-72,-12],[-58,-12],[-58,12],[-72,12]],
  activities:['WATER_CAMELS','FETCH_WATER','PLAY'],capacity:60,tags:{types:['infrastructure']}},
 {id:'ford',name:'The stream ford (camel watering)',kind:'shore',poly:[[62,-9],[92,-9],[92,9],[62,9]],
  activities:['WATER_CAMELS','FETCH_WATER'],capacity:80,tags:{types:['infrastructure']}},
 {id:'market',name:'The market grounds',kind:'ground',poly:[[-35,-46],[5,-46],[5,-14],[-35,-14]],
  activities:['TRADE','SOCIALIZE','PLAY'],capacity:160,tags:{culture:'eastern-nomad',types:['market/shop']}},
 {id:'khan',name:'The Khan (caravanserai)',kind:'ground',poly:[[8,18],[52,18],[52,58],[8,58]],
  activities:['TRADE','SLEEP','EAT','SOCIALIZE','REST'],capacity:180,tags:{culture:'eastern-nomad',types:['tavern/inn','market/shop']}},
 {id:'pueblo',name:'The pueblo quarter',kind:'ground',poly:[[58,14],[108,14],[108,66],[58,66]],
  activities:['SLEEP','EAT','CRAFT','SOCIALIZE','REST','PLAY'],capacity:480,tags:{culture:'eastern-nomad',types:['multi-family dwelling']}},
 {id:'tents',name:'The tent grounds',kind:'ground',poly:[[40,-62],[104,-62],[104,-24],[40,-24]],
  activities:['SLEEP','EAT','REST','HERD','SOCIALIZE','PLAY'],capacity:220,tags:{culture:'eastern-nomad',types:['single-family dwelling']}},
 {id:'terraces',name:'The irrigated terraces',kind:'ground',poly:[[-66,18],[-12,18],[-12,62],[-66,62]],
  activities:['FARM'],capacity:220,tags:{types:['farm']}},
 {id:'north_fields',name:'The north bank fields',kind:'ground',poly:[[-66,-60],[-42,-60],[-42,-18],[-66,-18]],
  activities:['FARM'],capacity:90,tags:{types:['farm']}},
 {id:'canyon_watch',name:'The canyon watch',kind:'ground',poly:[[112,-15],[128,-15],[128,-8],[112,-8]],
  activities:['PATROL'],capacity:18,tags:{culture:'eastern-nomad',types:['infrastructure']}},
 {id:'switchback_gate',name:'The switchback gatehouse',kind:'plateau',poly:[[26,-176],[46,-176],[46,-160],[26,-160]],
  activities:['PATROL'],capacity:16,tags:{culture:'eastern-nomad',types:['infrastructure']}},
 {id:'grazing',name:'The plateau grazing',kind:'plateau',poly:[[-40,-262],[80,-262],[80,-192],[-40,-192]],
  activities:['HERD'],capacity:120,tags:{types:['farm']},grows:true},
];
// the cliff dwellings' runs: the foot of each sheer wall the pueblos stand against.
// Each is a 'wall' place, reserved from 3 m inside the face to `out` metres onto the floor;
// its facade line is the foot, its face the outward normal.
const CLIFF_RUNS=[
 {id:'cliff-w',name:'The west cliff dwellings',a:[BASIN.x0,30],b:[BASIN.x0,56],n:[1,0],out:16,rows:3,tower:true,capacity:90},
 {id:'cliff-n',name:'The north cliff dwellings',a:[-71,BASIN.z0],b:[10,BASIN.z0],n:[0,1],out:16,rows:3,tower:true,capacity:220},
 {id:'cliff-s',name:'The south cliff dwellings',a:[95,BASIN.z1],b:[4,BASIN.z1],n:[0,-1],out:13,rows:2,tower:true,capacity:240},
 {id:'cliff-es',name:'The east cliff dwellings, south',a:[BASIN.x1,56],b:[BASIN.x1,34],n:[-1,0],out:10,rows:2,tower:false,capacity:80},
 {id:'cliff-en',name:'The east cliff dwellings, north',a:[BASIN.x1,-34],b:[BASIN.x1,-56],n:[-1,0],out:10,rows:2,tower:false,capacity:80}];
for(const C of CLIFF_RUNS){const n=C.n,a=C.a,b=C.b,P=(p,k)=>[p[0]+n[0]*k,p[1]+n[1]*k];
 PLACES.push({id:C.id,name:C.name,kind:'wall',poly:[P(a,-3),P(b,-3),P(b,C.out),P(a,C.out)],facade:{a,b,face:n.slice()},
  activities:['SLEEP','EAT','CRAFT','SOCIALIZE','REST','PLAY'],capacity:C.capacity,tags:{culture:'eastern-nomad',types:['multi-family dwelling']}});}
// the edges of the settlement a traveller arrives from or leaves by (the life layer's ports)
const PORTS={canyon_east:{x:440,z:zC(440),name:'The canyon, east'},plateau_north:{x:40,z:-270,name:'The plateau, north'}};
function polyHas(poly,x,z){let a=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1];
 if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))a=!a;}return a;}
function polyCentre(poly){let x=0,z=0;for(const p of poly){x+=p[0];z+=p[1];}return[x/poly.length,z/poly.length];}
// distance from a point outside a polygon to its edge (0 inside)
function polyDist(poly,x,z){if(polyHas(poly,x,z))return 0;let b=1e9;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],c=poly[i],ex=c[0]-a[0],ez=c[1]-a[1],l2=ex*ex+ez*ez;
 const t=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1);b=Math.min(b,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return b;}
// ---------------------------------------------------------------- the building plan
// WHAT stands WHERE, as data: family, place, position, facing (yaw: the builder's
// +z front turned by rotation.y), height above the floor (lift), the builder's
// parameters. 80-host-buildings builds from it before the walkable grid exists,
// so the grid blocks the builders' own footprints. Seeded: the same every load.
// A plan that does not fit its place is rejected here and counted (SHADE_PLAN.rejected).
const SHADE_PLAN=(function(){
 let _ps=90210;const R=()=>{_ps|=0;_ps=_ps+0x6D2B79F5|0;let t=Math.imul(_ps^_ps>>>15,1|_ps);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const rr=(a,b)=>a+(b-a)*R(),P=[],rejected={};
 const add=o=>{o.lift=o.lift||0;o.params.seed=o.params.seed||(1+Math.floor(R()*1e6));P.push(o);return o;};
 const place=id=>PLACES.find(p=>p.id===id);
 // a rotated rectangle's corners (centre x,z; w along local x; d along local z)
 const rectAt=(x,z,w,d,yaw)=>{const c=Math.cos(yaw),s=Math.sin(yaw);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(p=>[x+p[0]*c+p[1]*s,z-p[0]*s+p[1]*c]);};
 const inside=(poly,pts)=>pts.every(p=>polyHas(poly,p[0],p[1]));
 // clear of every polygon taken so far by `pad` metres: points every 0.5 m along BOTH outlines
 // (corners alone pass two rectangles crossing in an X: the probe caught exactly that)
 const dense=pts=>{const o=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5));for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;};
 const clearOf=(pts,taken,pad)=>{const A=dense(pts);return taken.every(q=>A.every(p=>polyDist(q,p[0],p[1])>pad)&&dense(q).every(p=>polyDist(pts,p[0],p[1])>pad));};
 // ---- the carved face (south wall): the hall in the middle, a house front each side at the
 //      foot, a rock-cut stair at each end up to a gallery, and a row of house fronts on it
 const FZ=BASIN.z1+1,LIFT=12,N=Math.PI;
 add({id:'hall',family:'treasury',placeId:'petra',x:-30,z:FZ,yaw:N,params:{width:18,height:30}});
 add({id:'house-w0',family:'tomb',placeId:'petra',x:-44,z:FZ,yaw:N,params:{width:5,height:8.5}});
 add({id:'house-e0',family:'tomb',placeId:'petra',x:-16,z:FZ,yaw:N,params:{width:5,height:8.5}});
 // under yaw PI the builder's +x is the world's -x: dir 1 rises westward
 add({id:'stair-w',family:'stair',placeId:'petra',x:-52.5,z:FZ,yaw:N,group:'petra-w',params:{run:11,rise:LIFT,width:1.8,dir:1}});
 add({id:'stair-e',family:'stair',placeId:'petra',x:-7.5,z:FZ,yaw:N,group:'petra-e',params:{run:11,rise:LIFT,width:1.8,dir:-1}});
 add({id:'gallery-w',family:'ledge',placeId:'petra',x:-49.75,z:FZ,yaw:N,lift:LIFT,group:'petra-w',params:{length:16.5,depth:2.2}});
 add({id:'gallery-e',family:'ledge',placeId:'petra',x:-10.75,z:FZ,yaw:N,lift:LIFT,group:'petra-e',params:{length:16.5,depth:2.2}});
 for(const [id,x,g,w] of [['house-w1',-53.5,'petra-w',5.2],['house-w2',-47.5,'petra-w',5.2],['house-e1',-5.3,'petra-e',4.8],['house-e2',-10.6,'petra-e',4.8],['house-e3',-15.9,'petra-e',4.8]])
  add({id,family:'tomb',placeId:'petra',x,z:FZ,yaw:N,lift:LIFT,group:g,access:g==='petra-w'?'stair-w':'stair-e',params:{width:w,height:7.6}});
 // ---- the shrine: a smaller temple front in the lip beside the falls, facing east
 add({id:'shrine',family:'treasury',placeId:'shrine',x:BASIN.x0-1,z:-33,yaw:Math.PI/2,params:{width:12,height:22}});
 // ---- the pueblo quarter: four U compounds, the north pair opening north, the south pair south
 for(const [id,x,z,cx,cz,st,yaw] of [['pueblo-nw',70,26,6,6,3,N],['pueblo-ne',96.5,27,5,5,2,N],['pueblo-sw',70.5,54,5,6,3,0],['pueblo-se',96,54,6,5,3,0]])
  add({id,family:'pueblo',placeId:'pueblo',x,z,yaw,params:{cx,cz,cell:4,storeys:st}});
 // ---- the Khan, its gate toward the market and the stream
 add({id:'khan',family:'khan',placeId:'khan',x:30,z:37.5,yaw:N,params:{w:38,d:32}});
 // ---- the tent grounds: tents scattered, not gridded; each faces roughly south, toward the water
 {const pl=place('tents').poly,taken=[];let tries=0,n=0;
  const doors=[];
  while(n<12&&tries<2000){tries++;const w=rr(7,10.5),d=rr(4.4,5.6),yaw=rr(-.4,.4),x=rr(43,101),z=rr(-59,-27),pts=rectAt(x,z,w+.6,d+3.4,yaw);
   const c=Math.cos(yaw),sn=Math.sin(yaw),dx=-w*.28,dz=d/2+1.1,door=[x+dx*c+dz*sn,z-dx*sn+dz*c];   // the door 80 will record
   if(!inside(pl,pts)){rejected.tent_outside=(rejected.tent_outside||0)+1;continue;}
   if(!clearOf(pts,taken,1.1)||taken.some(q=>polyDist(q,door[0],door[1])<1)||doors.some(o=>polyDist(pts,o[0],o[1])<1)){rejected.tent_crowded=(rejected.tent_crowded||0)+1;continue;}
   taken.push(pts);doors.push(door);n++;add({id:'tent-'+n,family:'tent',placeId:'tents',x,z,yaw,params:{w,d,poles:w>9?4:w>7.8?3:2}});}
  if(n<12)rejected.tent_short=12-n;}
 // ---- the market: two crooked rows of stalls facing a lane
 {const pl=place('market').poly,taken=[];let n=0;
  for(const [zr,yaw] of [[-37,0],[-23,N]])for(let x=-31;x<=2;x+=4.7){const w=rr(3.2,4),d=rr(2.4,3),xx=x+rr(-.4,.4),zz=zr+rr(-.5,.5),yy=yaw+rr(-.08,.08),pts=rectAt(xx,zz,w+.4,d+.8,yy);
   if(!inside(pl,pts)||!clearOf(pts,taken,.5)){rejected.stall=(rejected.stall||0)+1;continue;}taken.push(pts);n++;add({id:'stall-'+n,family:'stall',placeId:'market',x:xx,z:zz,yaw:yy,params:{w,d}});}}
 // ---- the cliff dwellings: along each run, blocks of 9-16 m with gaps, each turned to the
 //      foot as it actually runs (found by bisection on basinD) and set 0.6 m into the rock
 const footAt=(p,n)=>{let lo=-6,hi=6;for(let k=0;k<28;k++){const m=(lo+hi)/2;if(basinD(p[0]+n[0]*m,p[1]+n[1]*m)>0)lo=m;else hi=m;}return[p[0]+n[0]*hi,p[1]+n[1]*hi];};
 for(const C of CLIFF_RUNS){const a=C.a,b=C.b,L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=[(b[0]-a[0])/L,(b[1]-a[1])/L];let s0=rr(.5,2.5),k=0;
  while(s0<L-8){const len=Math.min(rr(9,16),L-s0-.5);if(len<8)break;
   const A=footAt([a[0]+t[0]*s0,a[1]+t[1]*s0],C.n),B=footAt([a[0]+t[0]*(s0+len),a[1]+t[1]*(s0+len)],C.n);
   const ex=B[0]-A[0],ez=B[1]-A[1],el=Math.hypot(ex,ez);let nx=-ez/el,nz=ex/el;if(nx*C.n[0]+nz*C.n[1]<0){nx=-nx;nz=-nz;}
   const back=.6+.5*Math.abs(((A[0]-B[0])*C.n[0]+(A[1]-B[1])*C.n[1]));
   const rows=C.rows===3&&R()<.65?3:2,storeys=rows===3?(R()<.5?4:3):3;
   add({id:C.id+'-'+(++k),family:'cliffpueblo',placeId:C.id,x:(A[0]+B[0])/2-nx*back,z:(A[1]+B[1])/2-nz*back,yaw:Math.atan2(nx,nz),params:{length:el,rows,storeys,cell:3.6,tower:C.tower}});
   s0+=len+rr(1.5,4);}}
 add({id:'gatehouse',family:'tower',placeId:'switchback_gate',x:36,z:-168,yaw:0,params:{storeys:5,round:true,radius:3.2}});
 add({id:'canyon-watch',family:'tower',placeId:'canyon_watch',x:120,z:-11.5,yaw:0,params:{storeys:3,round:false,radius:1.9}});
 return{plans:P,rejected};})();
