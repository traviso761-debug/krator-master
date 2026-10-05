// ================================================================= VERGE — the placement pass ([G data])
// WHERE every street and building of the two cities stands, as records, before anything is drawn (72 draws them).
// Each city has one placement raster (core/mask, KMASK: hard-edged, bit-exact in Godot) at 1.5 m: the ground a
// building may not use (water, steep, the trail and its banks, off the canyon floor or up the spur) is classified
// once from the terrain, then the highway, the plazas, the landmarks, the lanes and the plots are painted on it in
// that order, each tested against what is already there. Nothing is a coordinate typed by hand except the anchors a
// landmark is hunted near (one legal freedom: it slides and turns until it fits, and a miss is counted, not hidden).
//
// The two cities' streets are UNPLANNED: lanes branch off the highway at irregular spacing and meander until they
// meet the canyon wall, the river, a building or another street; alleys branch off the lanes the same way.
// Districts are rings of distance from each trailhead (the brief): warehouses close, then shops and workshops, then
// houses, inns and caravanserais further out. The upper city is packed tighter (smaller gaps and setbacks).
//
// Records: {id, uid, key, kit ('izv' Iziz vernacular | 'ykit' Yuni/Locus/Abyss | 'ancients'), city, district, x, z,
// y (floor), ry (three's rotation.y: the front, local +z, faces (sin ry, cos ry)), w, d, h, v (variant), wealth,
// culture, types, door [x, z], landmark (its role, or null), seed}. Every record is a core/tags 'building'.
const VERGE_PAINT={at:()=>null};
const PLACE=(function(){
const {clamp,mix,smooth}=VG;
const TAGS=KTAGS.page||(KTAGS.page=KTAGS.create({build:'verge'}));
const CELL=1.5,CODE={free:0,street:40,plaza:80,yard:120,building:160,blocked:200};
const S=KRAND.stream(KRAND.child(VG.SEED,'place'));
const OUT={cities:{},buildings:[],streets:[],bridges:[],plazas:[],missing:{},failed:[],rejected:{},pads:[]};
// ---------------------------------------------------------------- the kits' catalogue
// What a key is (footprint, types, culture) comes from its kit's own registry: Verge never restates a size.
function cat(key){
 if(typeof IZV!=='undefined'&&IZV.VERN.defs[key]){const D=IZV.VERN.defs[key];return{key,kit:'izv',w:D.w,d:D.d,h:D.h||8,name:D.name,types:[].concat(D.tags.type||[]),wealth:D.tags.wealth,culture:'iziz',family:D.family,variants:D.variants||2};}
 if(typeof YKIT!=='undefined'&&YKIT.ASSET_BY_KEY[key]){const A=YKIT.ASSET_BY_KEY[key];return{key,kit:'ykit',w:A.w,d:A.d,h:A.h||8,name:A.name,types:(A.types||[]).slice(),wealth:A.wealth?((A.wealth[0]+A.wealth[1])/2):.5,culture:A.culture||'yuni',family:A.family,variants:A.variants||1};}
 OUT.missing[key]=(OUT.missing[key]||0)+1;return null;}
// ---------------------------------------------------------------- a city's raster
function City(C){
 const [x0,x1,z0,z1]=C.box,nx=Math.ceil((x1-x0)/CELL),nz=Math.ceil((z1-z0)/CELL),cv=KMASK.canvas(nx,nz),ctx=cv.getContext('2d'),D=cv.data,H=new Float32Array(nx*nz);
 const X=i=>x0+(i+.5)*CELL,Z=j=>z0+(j+.5)*CELL;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=terrainH(X(i),Z(j));
 // the ground no building may use, from the terrain alone
 const img=ctx.createImageData(nx,nz),up=C.id==='upper';
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=X(i),z=Z(j),h=H[k];
  const hx=H[j*nx+Math.min(nx-1,i+1)]-H[j*nx+Math.max(0,i-1)],hz=H[Math.min(nz-1,j+1)*nx+i]-H[Math.max(0,j-1)*nx+i],sl=Math.hypot(hx,hz)/(2*CELL);
  let b=sl>.22||waterH(x,z)>h-.6;
  const L=VG.lipX(z);
  if(up){if(x>L-6||Math.abs(z-VG.canZ(x))>VG.canHW(x)-5)b=true;}
  else{if(x<L+40||h>VG.floorH(x,z)+7)b=true;}
  if(!b){const tn=VG.trailNear(x,z);if(tn&&tn.d<VG.TRAIL.bank+2)b=true;}
  if(!b&&VG.padAt(x,z))b=true;
  if(!b&&Math.abs(x-VG.FUNI.a[0])<60&&Math.abs(z-VG.FUNI.z)<26&&up)b=true;      // the funicular's upper station
  if(!b&&!up&&Math.abs(x-VG.FUNI.b[0])<60&&Math.abs(z-VG.FUNI.z)<24)b=true;      // and its lower one
  img.data[k*4]=b?CODE.blocked:0;img.data[k*4+3]=255;}
 ctx.putImageData(img,0,0);
 const city={C,x0,z0,nx,nz,cv,ctx,D,H,streets:[],buildings:[],plazas:[]};
 city.code=(x,z)=>{const i=Math.floor((x-x0)/CELL),j=Math.floor((z-z0)/CELL);return i<0||j<0||i>=nx||j>=nz?CODE.blocked:D[(j*nx+i)*4];};
 city.h=(x,z)=>{const i=clamp(Math.floor((x-x0)/CELL),0,nx-1),j=clamp(Math.floor((z-z0)/CELL),0,nz-1);return H[j*nx+i];};
 city.px=(x,z)=>[(x-x0)/CELL,(z-z0)/CELL];
 city.stroke=(pts,w,code)=>{ctx.strokeStyle='rgb('+code+',0,0)';ctx.lineWidth=w/CELL;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  pts.forEach((p,i)=>{const q=city.px(p[0],p[1]);if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);});ctx.stroke();};
 city.poly=(pts,code)=>{ctx.fillStyle='rgb('+code+',0,0)';ctx.beginPath();pts.forEach((p,i)=>{const q=city.px(p[0],p[1]);if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.fill();};
 city.disc=(x,z,r,code)=>{ctx.fillStyle='rgb('+code+',0,0)';ctx.beginPath();const q=city.px(x,z);ctx.arc(q[0],q[1],r/CELL,0,Math.PI*2);ctx.fill();};
 return city;}
// a rotated rectangle's corners: centre, half-extents along local x and z, three's yaw
function obb(x,z,hx,hz,ry){const c=Math.cos(ry),s=Math.sin(ry),P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];return[P(-hx,-hz),P(hx,-hz),P(hx,hz),P(-hx,hz)];}
const loc=(x,z,lx,lz,ry)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
// does a building of w x d fit at (x,z) turned ry? every sample of the box must be free, and the ground level enough
function fits(city,x,z,w,d,ry,o){o=o||{};const hx=w/2+(o.m||0),hz=d/2+(o.m||0),tol=o.tol||2.4,allow=o.allow||[CODE.free];let lo=1e9,hi=-1e9;
 for(let lz=-hz;lz<=hz+1e-6;lz+=Math.min(CELL,hz)){for(let lx=-hx;lx<=hx+1e-6;lx+=Math.min(CELL,hx)){const p=loc(x,z,lx,lz,ry),c=city.code(p[0],p[1]);
  if(allow.indexOf(c)<0)return{ok:false,why:c===CODE.blocked?'ground':c===CODE.street?'street':c===CODE.plaza?'plaza':'occupied'};
  const h=city.h(p[0],p[1]);if(h<lo)lo=h;if(h>hi)hi=h;}}
 if(hi-lo>tol)return{ok:false,why:'slope'};return{ok:true,y:lo,y1:hi};}
function why(k){OUT.rejected[k]=(OUT.rejected[k]||0)+1;}
let NB=0;
// a kit's own words in core/tags' vocabulary: Locus's 'abyssal-desert' is the East Abyss in its Locus style; a stall is a market
function tagsOf(K){const c=K.culture==='iziz-vernacular'?'iziz':K.culture,t={culture:c,types:K.types.map(x=>x==='prop'?'market':x),
 wealth:typeof K.wealth==='number'?K.wealth:K.wealth==='civic'?null:K.wealth};
 if(c==='abyssal-desert'){t.culture='eastabyss';t.style='abyssal-desert';}return t;}
function record(city,K,x,z,ry,y,o){o=o||{};const v=o.v!=null?o.v:(K.variants>1?S.int(0,K.variants-1):0);
 const front=loc(x,z,0,K.d/2+1.2,ry);
 const R={id:'vb_'+String(NB++).padStart(4,'0'),key:K.key,kit:o.kit||K.kit,name:K.name,city:city.C.id,district:o.district||null,x:+x.toFixed(3),z:+z.toFixed(3),y:+y.toFixed(3),
  ry:+ry.toFixed(5),w:K.w,d:K.d,h:K.h,v,wealth:K.wealth,culture:K.culture,types:K.types,door:[+front[0].toFixed(2),+front[1].toFixed(2)],landmark:o.landmark||null,
  seed:KRAND.hash(VG.SEED,NB,Math.floor(x),Math.floor(z))>>>8,params:o.params||null};
 const T=TAGS.add({class:'building',key:K.key,name:K.name+(o.landmark?' ('+o.landmark+')':''),at:[R.x,R.y,R.z],ry:R.ry,size:[K.w,K.d,K.h],
  tags:tagsOf(K)});
 R.tag=T.id;R.uid=T.uid;
 city.buildings.push(R);OUT.buildings.push(R);
 // paint the footprint, and a yard ring a little wider (chaotic: the gap to the next is the yard's own)
 const yard=o.yard!=null?o.yard:.6;
 if(yard>0)city.poly(obb(x,z,K.w/2+yard,K.d/2+yard,ry),CODE.yard);
 city.poly(obb(x,z,K.w/2,K.d/2,ry),CODE.building);
 return R;}
// hunt for a spot near an anchor: spiral out, several yaws; the first fit wins. A miss is counted, never silent.
function hunt(city,key,ax,az,yaws,o){o=o||{};const K=cat(key);if(!K)return null;
 const R0=o.radius||60,step=o.step||4;
 for(let r=0;r<=R0;r+=step){const n=r===0?1:Math.max(6,Math.round(2*Math.PI*r/step));
  for(let k=0;k<n;k++){const a=k/n*Math.PI*2+(r*.37),x=ax+Math.cos(a)*r,z=az+Math.sin(a)*r;
   for(const ry of yaws){const f=fits(city,x,z,K.w,K.d,ry,{m:o.m||1.5,tol:o.tol||2.6,allow:o.allow});if(f.ok)return record(city,K,x,z,ry,f.y,Object.assign({district:'landmark'},o));}}}
 OUT.failed.push({city:city.C.id,key,landmark:o.landmark||key,at:[ax,az]});return null;}
// a caravanserai's CAMEL YARD: a free rectangle beside it, reserved as yard before the streets and plots crowd in
// (the life layer puts each caravan's animals in its rows of slots)
function campYard(city,R){if(!R)return null;const tries=[];for(const side of [1,-1])for(const off of [0,6,12,20,30])for(const lz of [0,-8,8,-16])tries.push([side*(R.w/2+11+off),lz]);
 for(const off of [0,8,16])tries.push([0,-(R.d/2+10+off)]);
 for(const [lx,lz] of tries)for(const sz of [[24,22],[18,16]]){const c=loc(R.x,R.z,lx,lz,R.ry),f=fits(city,c[0],c[1],sz[0],sz[1],R.ry,{m:0,tol:2});
  if(f.ok){city.poly(obb(c[0],c[1],sz[0]/2,sz[1]/2,R.ry),CODE.yard);R.yard={x:+c[0].toFixed(2),z:+c[1].toFixed(2),y:+f.y.toFixed(2),ry:R.ry,w:sz[0],d:sz[1]};return R.yard;}}
 OUT.failed.push({city:city.C.id,key:'camel yard',landmark:'camel yard of '+R.id,at:[R.x,R.z]});return null;}
// ---------------------------------------------------------------- streets
function addStreet(city,pts,w,cls,o){o=o||{};const id='vs_'+String(OUT.streets.length).padStart(4,'0');
 const ys=pts.map(p=>terrainH(p[0],p[1]));const S0={id,city:city.C.id,cls,w,pts:pts.map((p,i)=>[+p[0].toFixed(2),+p[1].toFixed(2),+ys[i].toFixed(2)]),bridge:!!o.bridge};
 let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);S0.len=L;
 city.stroke(pts,w,CODE.street);city.streets.push(S0);OUT.streets.push(S0);return S0;}
// a meandering lane from (x,z) heading ang: it stops at blocked ground, a building or the edge, and joins a street it meets
function growLane(city,x,z,ang,maxLen,w,o){o=o||{};const pts=[[x,z]],st=5,turn=o.turn||.3;let len=0,join=false,a=ang,cross=null;
 while(len<maxLen){a+=(S.next()-.5)*turn;const nx=x+Math.cos(a)*st,nz=z+Math.sin(a)*st;
  // look ahead a little further than one step, and to both sides
  const ahead=[0,-1,1].map(k=>city.code(nx+Math.cos(a)*(w/2+1)-Math.sin(a)*k*w/2,nz+Math.sin(a)*(w/2+1)+Math.cos(a)*k*w/2));
  if(ahead.some(c=>c===CODE.building||c===CODE.yard)){why('lane:building');break;}
  if(ahead.some(c=>c===CODE.blocked)){
   // a river: a bridge, if this lane may cross and the far bank is buildable within reach
   if(o.bridge&&!cross){let k=1,okFar=false;for(;k<=14;k++){const fx=nx+Math.cos(a)*st*k,fz=nz+Math.sin(a)*st*k;if(waterH(fx,fz)<-1e8&&city.code(fx,fz)===CODE.free){okFar=true;break;}}
    if(okFar&&waterH(nx+Math.cos(a)*st*2,nz+Math.sin(a)*st*2)>-1e8){const bx=nx+Math.cos(a)*st*k,bz=nz+Math.sin(a)*st*k;cross={a:[x,z],b:[bx,bz]};pts.push([bx,bz]);x=bx;z=bz;len+=st*k;continue;}}
   why('lane:ground');break;}
  if(len>10&&ahead.some(c=>c===CODE.street||c===CODE.plaza)){pts.push([nx,nz]);join=true;break;}
  // too close alongside another street: stop (a lane must leave room for a plot on each side)
  let near=false;for(const sgn of [-1,1])for(const dd of [o.gap||9]){const c=city.code(nx-Math.sin(a)*sgn*dd,nz+Math.cos(a)*sgn*dd);if(c===CODE.street&&len>14)near=true;}
  if(near){why('lane:parallel');break;}
  x=nx;z=nz;pts.push([x,z]);len+=st;}
 if(len<(o.min||18)){why('lane:short');return null;}
 const S0=addStreet(city,pts,w,o.cls||'lane');S0.join=join;
 if(cross){const B={id:'vbr_'+OUT.bridges.length,city:city.C.id,street:S0.id,a:cross.a,b:cross.b,w:w+1,y:Math.max(terrainH(cross.a[0],cross.a[1]),terrainH(cross.b[0],cross.b[1]))};OUT.bridges.push(B);S0.bridge=true;}
 return S0;}
// points along a polyline every `step` metres: [x, z, tangent angle]
function along(pts,step,off){const out=[];let acc=-(off||0);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;
  const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);let t=-acc;while(t<=L){out.push([a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L,ang]);t+=step;}acc=L-(t-step);}return out;}
// ---------------------------------------------------------------- districts and what grows in them
const POOLS={
 upper:{warehouse:[['vern_warehouse',7],['vern_workshop_a',1.5],['vern_shops',1],['vern_silos',.6],['vern_smithy',.8]],
  trade:[['vern_shops',5],['vern_workshop_a',2],['vern_workshop_b',2],['vern_smithy',1.6],['vern_tavern',1.6],['vern_house_mid_a',2.4],['vern_house_mid_b',2],['vern_warehouse',.8]],
  dwelling:[['vern_house_poor_a',3],['vern_house_poor_b',3],['vern_house_poor_c',3],['vern_house_mid_a',3],['vern_house_mid_b',2.2],['vern_house_mid_c',2],['vern_house_rich_a',.45],['vern_house_rich_b',.45],['vern_tavern',1.3],['vern_shops',.9]]},
 lower:{warehouse:[['abyss_warehouse',5],['locus_warehouse',4],['abyss_granary',1],['abyss_shop_salvage',1]],
  trade:[['abyss_shop_weapons',1],['abyss_shop_armor',1],['abyss_shop_general',2],['abyss_shop_food',2],['abyss_shop_alchemy',1],['abyss_shop_salvage',1],['abyss_shop_salt',1],['abyss_shop_sailmaker',1],
   ['trade_shop_house',2],['abyss_tavern',1.4],['trade_tavern',1],['stilt_mid',1],['mid_djenne_house',1.4],['trade_market_hall',.4]],
  dwelling:[['abyss_house_poor',3],['abyss_house_mid',3],['abyss_house_rich',.6],['stilt_poor',2],['stilt_mid',1.5],['poor_mud_house',2],['mid_courtyard_house',1],['mid_bluewash_townhouse',1],
   ['mid_round_tower_house',.8],['mid_djenne_house',1],['tent_pavilion',.8],['abyss_inn',1],['rich_merchant_palace',.3]]}};
function districtOf(city,x,z){const h=city.C.head,r=Math.hypot(x-h[0],z-h[1]);for(const g of city.C.rings)if(r>=g[0]&&r<g[1])return g[2];return'dwelling';}
function pickKey(pool){let sum=0;for(const p of pool)sum+=p[1];let u=S.next()*sum;for(const p of pool){u-=p[1];if(u<=0)return p[0];}return pool[pool.length-1][0];}
// fill both sides of a street with plots facing it
function frontage(city,S0,o){o=o||{};const dense=city.C.id==='upper';let placed=0;
 for(const side of [-1,1]){let s=S.range(0,5);const P=S0.pts;
  // a cumulative length table along the street
  const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const at=t=>{let i=1;while(i<P.length-1&&cum[i]<t)i++;const a=P[i-1],b=P[i],u=clamp((t-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),0,1);return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];};
  while(s<S0.len-4){const p=at(s),nx=-Math.sin(p[2])*side,nz=Math.cos(p[2])*side;let done=false;
   const dist=districtOf(city,p[0],p[1]),pool=(o.pool||POOLS[city.C.id][dist]);
   for(let tr=0;tr<4&&!done;tr++){const K=cat(pickKey(pool));if(!K)continue;
    const set=dense?S.range(.6,2.2):S.range(1.2,4.5),cx=p[0]+nx*(S0.w/2+set+K.d/2),cz=p[1]+nz*(S0.w/2+set+K.d/2);
    const ry=Math.atan2(-nx,-nz)+S.range(-.1,.1)*(dense?1:1.6);
    const f=fits(city,cx,cz,K.w,K.d,ry,{m:.4,tol:dense?2.2:1.8});
    if(f.ok){record(city,K,cx,cz,ry,f.y,{district:dist,yard:dense?S.range(.3,1.2):S.range(.8,2.6)});s+=K.w+(dense?S.range(.4,2):S.range(1.5,6));placed++;done=true;}
    else why('plot:'+f.why);}
   if(!done)s+=3;}}
 return placed;}
// ---------------------------------------------------------------- the back lots
// Chaotic, not planned: small houses and sheds squeezed into the free ground behind the frontages, each facing the
// nearest street it can see within 30 m (so it still has a way in), at any angle.
function infill(city,tries,keys){let placed=0;const B=city.C.box;
 for(let k=0;k<tries;k++){const x=S.range(B[0],B[1]),z=S.range(B[2],B[3]);if(city.code(x,z)!==CODE.free)continue;
  // the nearest street, by casting eight rays
  let best=null;for(let a=0;a<8;a++){const ang=a/8*Math.PI*2;for(let d=4;d<=30;d+=2){const c=city.code(x+Math.cos(ang)*d,z+Math.sin(ang)*d);if(c===CODE.street||c===CODE.plaza){if(!best||d<best.d)best={d,ang};break;}if(c===CODE.blocked)break;}}
  if(!best)continue;const K=cat(keys[S.int(0,keys.length-1)]);if(!K)continue;
  const ry=Math.atan2(Math.cos(best.ang),Math.sin(best.ang))+S.range(-.25,.25),f=fits(city,x,z,K.w,K.d,ry,{m:.5,tol:2});
  if(f.ok){record(city,K,x,z,ry,f.y,{district:districtOf(city,x,z),yard:S.range(.3,1)});placed++;}else why('infill:'+f.why);}
 return placed;}
// ---------------------------------------------------------------- the trailheads: a plaza, the toll gate and palisade
function trailGate(city,s,kGate,kPal,kToll,nPal){
 // the gate stands where the ground under its span is least below the trail (its ends may sink into a bank, never hang): searched 12 m either way of s
 const span=s=>{const p=VG.trailAt(s),q=VG.trailAt(s-6),a=Math.atan2(p[1]-q[1],p[0]-q[0]),G=cat(kGate);if(!G)return 0;
  return Math.max(...obb(p[0],p[1],G.w/2,G.d/2,Math.atan2(Math.cos(a),Math.sin(a))).map(c=>p[2]-VG.groundH(c[0],c[1])));};
 let best=s,bv=span(s);for(let d=-12;d<=12;d+=1.5){const t=Math.min(VG.TRAIL.len-7,Math.max(7,s+d)),v=span(t);if(v<bv-1e-6){bv=v;best=t;}}s=best;
 const p=VG.trailAt(s),a=Math.atan2(p[1]-VG.trailAt(s-6)[1],p[0]-VG.trailAt(s-6)[0]);   // the direction of travel downhill
 const ry=Math.atan2(Math.cos(a),Math.sin(a));                                         // the gate's +z along the trail
 const G=cat(kGate),P=cat(kPal),out={gate:null,palisade:[],toll:null};if(!G)return out;
 const glo=Math.min(...obb(p[0],p[1],G.w/2,G.d/2,ry).map(c=>VG.groundH(c[0],c[1])));   // sunk a little where a bank falls away
 out.gate=record(city,G,p[0],p[1],ry,Math.min(p[2]-.1,glo+.5),{landmark:'toll gate',yard:0});
 if(P){for(const side of [-1,1])for(let k=0;k<nPal;k++){const off=side*(G.w/2+P.w/2+k*P.w),q=loc(p[0],p[1],off,0,ry),h=terrainH(q[0],q[1]);
   // each segment stands on the lowest ground under it (its posts sunk at the high end); one on too steep a slope ends the run
   const gs=obb(q[0],q[1],P.w/2,P.d/2,ry).map(c=>terrainH(c[0],c[1])).concat([h]),lo=Math.min(...gs),hi=Math.max(...gs);
   if(Math.abs(h-p[2])>6||hi-lo>2.2)break;out.palisade.push(record(city,P,q[0],q[1],ry,lo-.1,{landmark:'palisade',yard:0}));}}
 if(kToll){const T=cat(kToll);if(T){// the toll house beside the gate, its +x (the toll window) toward the trail
   const q=loc(p[0],p[1],-(G.w/2+T.d/2+2.5),T.w/2+3,ry);const R=hunt(city,kToll,q[0],q[1],[ry-Math.PI/2,ry+Math.PI/2,ry],{landmark:'toll house',radius:24,m:.8,tol:3});out.toll=R;}}
 return out;}
// ---------------------------------------------------------------- UPPER VERGE
// ---------------------------------------------------------------- the funicular's plan (the Ancients kit, kits/ancients)
// planned before anything else, on the uncut ground; its cuttings and station floors then go into terrainH
const FUN=(typeof IZV!=='undefined'&&IZV.FUNICULAR)?IZV.FUNICULAR.plan({a:VG.FUNI.a,b:VG.FUNI.b,ground:VG.groundH0,seed:KRAND.child(VG.SEED,'funicular')>>>0,width:12,pierStep:30}):null;
if(FUN){VG.FUNI.rec=FUN;VG.CARVE.fn=(x,z,h)=>IZV.FUNICULAR.carveY(FUN,x,z,h);
 VG.CARVE.box=[Math.min(VG.FUNI.a[0],VG.FUNI.b[0])-90,Math.max(VG.FUNI.a[0],VG.FUNI.b[0])+90,VG.FUNI.z-60,VG.FUNI.z+60];
 OUT.funicular={spans:FUN.segments.length,breaks:FUN.breaks,car:FUN.car&&FUN.car.state,walk:FUN.walk.length,blocks:FUN.blocks.length};}
function upper(){const C=VG.CITY.upper,city=City(C);OUT.cities.upper=city;
 // the highway along the canyon floor to the trailhead
 const hw=VG.HWY_U.filter(p=>p[0]>C.box[0]-20);addStreet(city,hw,10,'highway');
 const head=C.head;city.disc(head[0],head[1],22,CODE.plaza);OUT.plazas.push({id:'upper_trailhead',city:'upper',x:head[0],z:head[1],r:22,kind:'trailhead'});
 const MK=[head[0]-150,head[1]+40];city.disc(MK[0],MK[1],44,CODE.plaza);OUT.plazas.push({id:'upper_market',city:'upper',x:MK[0],z:MK[1],r:44,kind:'market'});
 const gate=trailGate(city,14,'vern_palisade_gate','vern_palisade','vern_toll_house',4);
 // the landmarks, hunted near their anchors (the order is the priority)
 const s=C.box;const southZ=x=>VG.canZ(x)+VG.canHW(x)-40;
 const L={};
 L.guard=hunt(city,'vern_guard_tower',C.edge[0]+40,C.edge[1]+34,[0,Math.PI,Math.PI/2],{landmark:'guard tower',radius:90});
 L.palace=hunt(city,'vern_governor_palace',-2120,southZ(-2120),[Math.PI,Math.PI*1.05,Math.PI*.95],{landmark:"governor's palace",radius:120,tol:3.2});
 L.barracks=hunt(city,'vern_barracks',-2480,southZ(-2480),[Math.PI,Math.PI/2],{landmark:'barracks',radius:120,tol:3});
 L.muster=hunt(city,'vern_mustering_ground',-2380,southZ(-2380)-20,[Math.PI,0],{landmark:'mustering ground',radius:140,tol:2.6});
 L.cara1=hunt(city,'vern_caravanserai',-2260,VG.HWY_U.find(p=>p[0]>-2262)[1]+34,[Math.PI],{landmark:'caravanserai',radius:90});
 L.cara2=hunt(city,'vern_caravanserai',-2580,VG.HWY_U.find(p=>p[0]>-2582)[1]+34,[Math.PI],{landmark:'caravanserai',radius:90});
 campYard(city,L.cara1);campYard(city,L.cara2);
 L.school=hunt(city,'vern_school',-1980,southZ(-1980)+10,[Math.PI,0],{landmark:'school',radius:140});
 L.hospital=hunt(city,'vern_hospital',-1760,southZ(-1760),[Math.PI,0],{landmark:'hospital',radius:140});
 L.watch=[];for(const [x,z] of [[head[0]-70,head[1]-40],[-1900,VG.rivUZ(-1900)+40],[-2400,VG.rivUZ(-2400)+40],[-2650,-60]])L.watch.push(hunt(city,'vern_watch_house',x,z,[0,Math.PI/2,Math.PI,-Math.PI/2],{landmark:'watch house',radius:60}));
 // the warehouses: close round the trailhead (the brief: porters carry from here up or down the trail)
 L.ware=[];for(let k=0;k<9;k++){const a=Math.PI*(.55+k*.11),r=60+(k%3)*42,x=head[0]+Math.cos(a)*r*1.3,z=head[1]+Math.sin(a)*r*.8;
  L.ware.push(hunt(city,k%4===3?'vern_workshop_a':'vern_warehouse',x,z,[Math.atan2(head[0]-x,head[1]-z),Math.atan2(head[0]-x,head[1]-z)+Math.PI/2],{landmark:'warehouse',radius:70,tol:3}));}
 // the market's canopies on the plaza
 const mk=[];for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4,x=MK[0]+Math.cos(a)*22,z=MK[1]+Math.sin(a)*22;mk.push(hunt(city,'vern_market',x,z,[a+Math.PI/2,a],{landmark:'market canopy',radius:14,allow:[CODE.plaza],m:.5}));}
 // the lanes: branching off the highway, then alleys off the lanes
 const lanes=[];
 for(const p of along(hw,1,0).filter((q,i)=>i%Math.round(S.range(34,58))===0)){if(p[0]>head[0]-30)continue;
  for(const side of [-1,1]){if(S.next()<.1)continue;const a=p[2]+side*(Math.PI/2+S.range(-.6,.6));
   const L0=growLane(city,p[0]+Math.cos(a)*7,p[1]+Math.sin(a)*7,a,S.range(80,260),S.range(4.5,6.5),{bridge:side<0&&S.next()<.5,turn:.35});if(L0)lanes.push(L0);}}
 // the market's streets and the trailhead's
 for(let k=0;k<5;k++){const a=k/5*Math.PI*2+.2;const L0=growLane(city,MK[0]+Math.cos(a)*46,MK[1]+Math.sin(a)*46,a,S.range(60,160),5,{turn:.4});if(L0)lanes.push(L0);}
 // lanes off the lanes, then alleys off everything
 for(const L0 of lanes.slice()){for(const p of along(L0.pts,S.range(50,80),20)){const side=S.next()<.5?-1:1;if(S.next()<.35)continue;const a=p[2]+side*(Math.PI/2+S.range(-.5,.5));
   const L1=growLane(city,p[0]+Math.cos(a)*(L0.w/2+1),p[1]+Math.sin(a)*(L0.w/2+1),a,S.range(60,180),S.range(4,5.5),{turn:.4,gap:8});if(L1)lanes.push(L1);}}
 const alleys=[];for(const L0 of lanes.slice()){for(const p of along(L0.pts,S.range(22,40),10)){for(const side of [-1,1]){if(S.next()<.3)continue;
   const a=p[2]+side*(Math.PI/2+S.range(-.5,.5));const A=growLane(city,p[0]+Math.cos(a)*(L0.w/2+1),p[1]+Math.sin(a)*(L0.w/2+1),a,S.range(30,110),S.range(3,4.2),{cls:'alley',turn:.45,gap:7,min:14});if(A)alleys.push(A);}}}
 // the plots: the highway's frontage, the lanes', the alleys'; then the back lots
 let n=0;for(const S0 of city.streets)n+=frontage(city,S0);
 infill(city,1400,['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c','vern_house_mid_a','vern_workshop_a','vern_shops']);
 // the city spills down the top of the trail: houses on little pads beside the first legs
 spill(city,[60,520],8,['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c','vern_house_mid_a'],'up');
 city.landmarks=Object.assign(L,{gate});return city;}
// ---------------------------------------------------------------- LOWER VERGE
function lower(){const C=VG.CITY.lower,city=City(C);OUT.cities.lower=city;
 const hw=VG.HWY_L.filter(p=>p[0]<C.box[1]+20);addStreet(city,hw,12,'highway');
 const head=C.head;city.disc(head[0],head[1],26,CODE.plaza);OUT.plazas.push({id:'lower_trailhead',city:'lower',x:head[0],z:head[1],r:26,kind:'trailhead'});
 const MK=[head[0]+150,head[1]-40];city.disc(MK[0],MK[1],58,CODE.plaza);OUT.plazas.push({id:'lower_market',city:'lower',x:MK[0],z:MK[1],r:58,kind:'market'});
 const gate=trailGate(city,VG.TRAIL.len-16,'abyss_palisade_gate','abyss_palisade','abyss_toll_house',4);
 const L={};const hz=x=>{const p=VG.HWY_L.find(q=>q[0]>=x)||VG.HWY_L[VG.HWY_L.length-1];return p[1];};
 L.guard=hunt(city,'abyss_guard_tower',C.edge[0]-40,hz(C.edge[0]-40)-30,[0,Math.PI,-Math.PI/2],{landmark:'guard tower',radius:90});
 L.mayor=hunt(city,'abyss_mayor_compound',520,hz(520)+70,[Math.PI,Math.PI*1.04],{landmark:"mayor's compound",radius:160,tol:3});
 L.chapter=hunt(city,'civic_chapter_house',-470,-410,[0,Math.PI*.5,-Math.PI*.5],{landmark:'chapterhouse of the Order of Historians',radius:200,tol:3});
 L.cara1=hunt(city,'abyss_caravanserai',900,hz(900)+46,[Math.PI],{landmark:'caravanserai',radius:110});
 L.cara2=hunt(city,'trade_caravanserai',1150,hz(1150)-44,[0],{landmark:'caravanserai',radius:110});
 campYard(city,L.cara1);campYard(city,L.cara2);
 L.temple=hunt(city,'abyss_temple',300,hz(300)+150,[Math.PI,0],{landmark:'temple of the altar',radius:150,tol:3});
 L.library=hunt(city,'abyss_library',-240,120,[Math.PI/2,Math.PI],{landmark:'library',radius:140});
 L.school=hunt(city,'abyss_school',700,hz(700)-120,[0,Math.PI],{landmark:'school',radius:150});
 L.watch=[];for(const [x,z] of [[head[0]+60,head[1]+50],[600,-220],[1150,hz(1150)+40]])L.watch.push(hunt(city,'abyss_barracks',x,z,[0,Math.PI/2,Math.PI],{landmark:'watch post',radius:70}));
 L.ware=[];for(let k=0;k<9;k++){const a=-Math.PI*.15+k*.42,r=70+(k%3)*45,x=head[0]+Math.cos(a)*r,z=head[1]+Math.sin(a)*r;
  L.ware.push(hunt(city,k%2?'locus_warehouse':'abyss_warehouse',x,z,[Math.atan2(head[0]-x,head[1]-z),Math.atan2(head[0]-x,head[1]-z)+Math.PI/2],{landmark:'warehouse',radius:80,tol:3}));}
 const mk=[];for(let k=0;k<7;k++){const a=k/7*Math.PI*2+.2,r=k%2?34:20,x=MK[0]+Math.cos(a)*r,z=MK[1]+Math.sin(a)*r;
  mk.push(hunt(city,k%2?'prop_market_tent':'prop_market_stall',x,z,[a+Math.PI/2,a],{landmark:'market stall',radius:12,allow:[CODE.plaza],m:.4}));}
 mk.push(hunt(city,'trade_market_hall',MK[0],MK[1]-70,[0,Math.PI],{landmark:'market hall',radius:50}));
 const lanes=[];
 for(const p of along(hw,1,0).filter((q,i)=>i%Math.round(S.range(70,120))===0)){if(p[0]<head[0]+30)continue;
  for(const side of [-1,1]){if(S.next()<.15)continue;const a=p[2]+side*(Math.PI/2+S.range(-.7,.7));
   const L0=growLane(city,p[0]+Math.cos(a)*8,p[1]+Math.sin(a)*8,a,S.range(100,320),S.range(5,7.5),{bridge:side<0&&S.next()<.4,turn:.3,gap:12});if(L0)lanes.push(L0);}}
 for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.5;const L0=growLane(city,MK[0]+Math.cos(a)*60,MK[1]+Math.sin(a)*60,a,S.range(80,220),5.5,{turn:.35,gap:11});if(L0)lanes.push(L0);}
 // toward the pool and the chapterhouse: a lane west along the river's south bank
 {const L0=growLane(city,head[0]-30,head[1]-60,Math.PI*1.05,620,6,{turn:.18,gap:10,min:40});if(L0)lanes.push(L0);}
 for(const L0 of lanes.slice()){for(const p of along(L0.pts,S.range(40,70),14)){for(const side of [-1,1]){if(S.next()<.5)continue;
   const a=p[2]+side*(Math.PI/2+S.range(-.5,.5));growLane(city,p[0]+Math.cos(a)*(L0.w/2+1),p[1]+Math.sin(a)*(L0.w/2+1),a,S.range(30,120),S.range(3.5,4.5),{cls:'alley',turn:.4,gap:9,min:14});}}}
 for(const S0 of city.streets)frontage(city,S0);
 infill(city,500,['abyss_house_poor','stilt_poor','poor_mud_house','abyss_house_mid','tent_pavilion']);
 spill(city,[VG.TRAIL.len-700,VG.TRAIL.len-60],10,['stilt_poor','abyss_house_poor','poor_mud_house','abyss_house_mid'],'down');
 city.landmarks=Object.assign(L,{gate});return city;}
// ---------------------------------------------------------------- spill: houses beside the trail's first (or last) legs
// Each stands on a small pad cut beside the trail (added to the terrain's pads before the ground is built), its front
// to the trail.
function spill(city,range,n,keys,dir){let placed=0;
 for(let tr=0;tr<n*8&&placed<n;tr++){const s=S.range(range[0],range[1]),p=VG.trailAt(s),q=VG.trailAt(s+3),a=Math.atan2(q[1]-p[1],q[0]-p[0]);
  const side=S.next()<.5?-1:1,K=cat(keys[S.int(0,keys.length-1)]);if(!K)continue;
  const off=VG.TRAIL.half+2.2+K.d/2,cx=p[0]-Math.sin(a)*side*off,cz=p[1]+Math.cos(a)*side*off;
  const ry=Math.atan2(Math.sin(a)*side,-Math.cos(a)*side);   // the front (+z) toward the trail
  // keep clear of the other legs and of every other spilt house
  let ok=true;const tn=VG.trailNear(cx+Math.sin(a)*side*(K.d/2+3),cz-Math.cos(a)*side*(K.d/2+3));if(tn&&tn.d<VG.TRAIL.bank&&Math.abs(tn.s-s)>30)ok=false;
  for(const P of OUT.pads)if(Math.hypot(P.x-cx,P.z-cz)<P.hx+K.w/2+3)ok=false;
  for(const r of VG.TRAIL.rest)if(Math.hypot(r.x-cx,r.z-cz)<30)ok=false;
  if(!ok){why('spill:clear');continue;}
  const pad={id:'spill_'+OUT.pads.length,x:cx,z:cz,hx:K.w/2+1.2,hz:K.d/2+1.2,y:p[2]+.1,blend:6,yaw:-ry};OUT.pads.push(pad);VG.PADS.push(pad);
  // the pad must hold the whole house: where the trail's next leg or its bank wins over a corner, take the pad back
  if(obb(cx,cz,K.w/2,K.d/2,ry).some(c=>Math.abs(VG.groundH(c[0],c[1])-pad.y)>.5)){OUT.pads.pop();VG.PADS.pop();why('spill:pad');continue;}
  const R=record(city,K,cx,cz,ry,p[2]+.1,{district:'trail',yard:0});R.spill=dir;placed++;}
 return placed;}
// ---------------------------------------------------------------- the trail's own structures
function trail(){
 const city={C:{id:'trail'},buildings:[],streets:[],poly(){},stroke(){}};OUT.cities.trail=city;
 for(const R of VG.TRAIL.rest){const K=cat('vern_rest_stop');if(!K)break;
  const rec=record(city,K,R.x,R.z,R.yaw,R.y,{v:R.variant,landmark:'rest stop at the '+R.mark+' m mark',district:'trail',yard:0});rec.rest=R.id;}
 return city;}
// ---------------------------------------------------------------- run
const U=upper(),Lw=lower(),T=trail();
// the paint the ground reads: the streets, the plazas and the yards of both cities
VERGE_PAINT.at=function(x,z){for(const c of [U,Lw]){const i=Math.floor((x-c.x0)/CELL),j=Math.floor((z-c.z0)/CELL);if(i<0||j<0||i>=c.nx||j>=c.nz)continue;
 const v=c.D[(j*c.nx+i)*4];if(v===CODE.street)return{kind:'street',k:1};if(v===CODE.plaza)return{kind:'plaza',k:1};if(v===CODE.yard||v===CODE.building)return{kind:'yard',k:.55};}return null;};
// the reserve the flora mask reads: streets, plazas, yards and buildings (1.5 m cells)
for(const c of [U,Lw]){const occ=new Uint8Array(c.nx*c.nz);for(let k=0;k<occ.length;k++){const v=c.D[k*4];occ[k]=(v>0&&v<CODE.blocked)?1:0;}
 VERGE_RESERVE.grids.push({x0:c.x0,z0:c.z0,cell:CELL,nx:c.nx,nz:c.nz,occ});}
OUT.masks={upper:KMASK.hash(U.cv),lower:KMASK.hash(Lw.cv)};
const count=c=>c.buildings.length;
window._place={funicular:OUT.funicular||null,upper:count(U),lower:count(Lw),trail:count(T),streets:OUT.streets.length,bridges:OUT.bridges.length,failed:OUT.failed.map(f=>f.city+':'+f.landmark),
 missing:OUT.missing,rejected:OUT.rejected,masks:OUT.masks,
 byKey:OUT.buildings.reduce((a,b)=>(a[b.key]=(a[b.key]||0)+1,a),{})};
OUT.CELL=CELL;OUT.CODE=CODE;OUT.cat=cat;OUT.obb=obb;OUT.loc=loc;
return OUT;})();
// the place under a point (the inspector; the life layer's places are built from these and the buildings)
function placeAt(x,z){for(const P of PLACE.plazas)if(Math.hypot(x-P.x,z-P.z)<P.r)return{name:{upper_trailhead:'The upper trailhead',upper_market:'The upper market',lower_trailhead:'The lower trailhead',lower_market:'The lower market'}[P.id]||P.id,
 activities:P.kind==='market'?['TRADE','SOCIALIZE']:['TRAVEL','PAY_TOLL'],capacity:P.kind==='market'?240:80,tags:{city:P.city,kind:P.kind}};return null;}
