// ================================================================= THE FLASHING EYE — the site: the ground at 1:1, the places, the walls, the talus
// settlements/flashing-eye/PLAN.md sections 2 and 3; the layout (src/30-fe-layout.js) and its ground (src/31-fe-rules.js). The page's
// origin is the layout's: the middle of the Lip, scale-model px 881,1527.1; x east (the layout's v), z south (its u), y up from
// the bench (1,660 m). FE_P(u, v) = [v, u].
//   the ground   the scale model's cut round the cone (region/data, gen/39fe-world-data.js) through the open world's fields
//                (WORLD.H, openworld/isle-demo 41-world-fields.js, read in place), less the bench's 1,660 m, through
//                FLASHING_EYE.ground: the bench filled, the band's face, talus and apron cut in front of the Lip, the crater's
//                rampart and bowl; a pad under each building off the bench (its footprint and 3 m, at the mean under it)
//   the places   FE_PLACE: every building as a record {key, x, z, ry, o: {v, y, ...}, kind, id}, from the layout's parts
//   the talus    KRUBBLE heaps (core/terrain 37c) along the band's foot, records here, meshes in 90fe
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34461);
const FE_O=WORLD_DATA.meta.frame.origin_px,feWx=px=>(px-FE_O[0])*2000,feWz=py=>(py-FE_O[1])*2000;
const FE={L:FE_LAYOUT,BENCH:FE_LAYOUT.frame.ground};
FE.WX=feWx(FE.L.frame.px[0]);FE.WZ=feWz(FE.L.frame.px[1]);
const FE_P=(u,v)=>[v,u];
const feSm=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
WORLD.init(WORLD_R);
/* the model's ground in the page's y, and the layout's ground over it */
const feModel=(x,z,mw)=>WORLD.H(x+FE.WX,z+FE.WZ,mw==null?0:mw)-FE.BENCH;
const feBase=(x,z,mw)=>FLASHING_EYE.ground(FE.L,z,x,feModel(x,z,mw));
// ---------------------------------------------------------------- the pads (buildings off the bench)
const FE_PADS=[];
function feLevel(x0,z0,x1,z1){let s=0,n=0;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){s+=feBase(x0+(x1-x0)*i/4,z0+(z1-z0)*j/4);n++;}return Math.round(s/n*2)/2;}
function fePad(id,x0,z0,x1,z1,y,skirt){const P={id,x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),skirt:skirt==null?5:skirt};P.y=y==null?feLevel(P.x0,P.z0,P.x1,P.z1):y;FE_PADS.push(P);return P;}
function fePadAt(x,z){for(let i=FE_PADS.length-1;i>=0;i--){const p=FE_PADS[i];if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;}return null;}
const _feT={x:NaN,z:NaN,h:0};
terrainH=function(x,z){if(x===_feT.x&&z===_feT.z)return _feT.h;let h=feBase(x,z);
 for(const p of FE_PADS){const dx=Math.max(p.x0-x,0,x-p.x1),dz=Math.max(p.z0-z,0,z-p.z1);if(dx>=p.skirt||dz>=p.skirt)continue;const d=Math.hypot(dx,dz);if(d>=p.skirt)continue;h+=(p.y-h)*(1-feSm(0,p.skirt,d));}
 _feT.x=x;_feT.z=z;_feT.h=h;return h;};
// ---------------------------------------------------------------- the places, from the layout's parts
const FE_PLACE=[];
const fePart=id=>FE.L.parts.find(p=>p.id===id);
// a building at the plan's (u, v), its front turned by ry (0: south, to the Rift; PI/2: east; -PI/2: west; PI: north), o its options;
// pad: its own pad unless it stands on the bench (y 0) or o.y is given
function fePut(key,u,v,ry,o,kind,id,pad){const c=FE_P(u,v),D=VERN.defs[key];if(!D)throw new Error('flashing-eye: no def '+key);
 const q={key,x:c[0],z:c[1],ry,o:Object.assign({v:0},o||{}),kind,id,h:D.h==null?10:D.h,w:o&&o.w!=null?o.w:(D.fw==null?D.w:D.fw),d:o&&o.d!=null?o.d:(D.fd==null?D.d:D.fd)};
 if(pad&&q.o.y==null){const side=Math.abs(Math.sin(ry))>.5,hw=(side?q.d:q.w)/2+3,hd=(side?q.w:q.d)/2+3;q.pad=fePad('pad:'+q.id,q.x-hw,q.z-hd,q.x+hw,q.z+hd,null,6);q.o.y=q.pad.y;}
 if(q.o.y==null)q.o.y=0;FE_PLACE.push(q);return q;}
const feC=b=>[(b[0]+b[1])/2,(b[2]+b[3])/2];
// a part drawn as a sized range: its long side along its front unless told; dress v (0 wash below and crimson above, 1 wash, 2 crimson)
function feRange(id,v,st,o){const P=fePart(id),b=P.box,c=feC(b),du=b[1]-b[0],dv=b[3]-b[2],turn=du>dv*1.4;
 const ry=o&&o.ry!=null?o.ry:(turn?Math.PI/2:0),w=turn?du:dv,d=turn?dv:du;
 return fePut('qb_fe_range',c[0],c[1],ry,Object.assign({v,st,w:w-.6,d:d-.6,name:P.name},o||{}),P.zone==='bench'?'house':'cap',id,P.zone!=='bench');}
// the bench (y 0: FLASHING_EYE.ground holds it level)
fePut('qb_fe_lip_range',-7,0,0,{len:120},'house','lip-range');
{const M=fePart('monastery');fePut('qb_monastery',M.host.centre[0],M.host.centre[1],0,{v:M.host.v},'sacred','red-monastery');}
fePut('qb_fe_ember',-118,0,0,{},'sacred','ember');
fePut('qb_fe_gate',-3,-75,0,{w:8,d:5,st:1,name:'The Gate of the Rift'},'gate','g.rift');
fePut('qb_fe_gate',-87,-90,Math.PI/2,{w:10,d:8,st:2,name:'The Mule Gate'},'gate','g.mule');
fePut('qb_fe_gate',-145,0,Math.PI,{w:10,d:10,st:2,name:'The Gate of Breath'},'gate','g.breath');
for(const [id,v,st] of[['granary',1,2],['infirmary',1,2],['kitchen',1,2],['refectory',1,1],['bath',1,1],['woodstore',1,1],['chapter',0,3],['novices',0,2],['school',0,2]])feRange(id,v,st);
{const c=feC(fePart('founders').box);fePut('qb_chorten',c[0],c[1],0,{v:0},'sacred','founders');}
// the cap (on pads), the rim and the apron
feRange('byres',1,1);feRange('woodlot',1,1);feRange('shelter',1,1,{ry:Math.PI/2});
for(const id of['ch.breath1','ch.breath2','ch.breath3','threshold','stairhead']){const c=feC(fePart(id).box);fePut('qb_chorten',c[0],c[1],0,{v:id==='threshold'?2:0},'sacred',id,true);}
{const c=feC(fePart('post').box);fePut('qb_fe_post',c[0],c[1],0,{},'rim','post',true);}
{const c=feC(fePart('hut').box);fePut('qb_fe_hut',c[0],c[1],0,{},'rim','hut',true);}
// the walls: the layout's, with a gap at each gate (on the bench, y 0)
const FE_WALLS=[];
for(const W of FE.L.walls){const g=FE.L.gates.filter(G=>G.wall===W.id),L=Math.hypot(W.b[0]-W.a[0],W.b[1]-W.a[1]),dir=[(W.b[0]-W.a[0])/L,(W.b[1]-W.a[1])/L];
 const cuts=g.map(G=>{const t=(G.at[0]-W.a[0])*dir[0]+(G.at[1]-W.a[1])*dir[1],hw=(G.id==='gate.rift'?8:10)/2;return[t-hw,t+hw];}).sort((a,b)=>a[0]-b[0]);
 let t0=0;const segs=[];for(const [c0,c1] of cuts){if(c0>t0+.5)segs.push([t0,c0]);t0=c1;}if(L>t0+.5)segs.push([t0,L]);
 for(const [s0,s1] of segs){const a=[W.a[0]+dir[0]*s0,W.a[1]+dir[1]*s0],b=[W.a[0]+dir[0]*s1,W.a[1]+dir[1]*s1],m=FE_P((a[0]+b[0])/2,(a[1]+b[1])/2);
  const alongX=Math.abs(dir[1])>Math.abs(dir[0]);FE_WALLS.push({id:'wall:'+W.id+':'+s0.toFixed(0),x:m[0],z:m[1],len:s1-s0,ry:alongX?0:Math.PI/2,h:W.h,parapet:!!W.parapet});}}
for(const W of FE_WALLS)FE_PLACE.push({key:'qb_wall',x:W.x,z:W.z,ry:W.ry,o:{v:1,len:W.len,y:0},kind:'wall',id:W.id,h:W.parapet?2.4:5});
// the ways (painted; 90fe): [kind, width, points (page)]
const FE_WAYS=FE.L.ways.filter(w=>w.id!=='kora.open'&&w.id!=='stair').map(w=>[w.id==='kora.lower'?'kora':w.id==='cleft'?'cleft':'way',w.id==='mule'?3.5:w.id==='breath'?3:2.4,w.pts.map(p=>FE_P(p[0],p[1]))]);
FE_WAYS.push(['way',3,FE.L.ways.find(w=>w.id==='stair').pts.filter(p=>p[0]<700).map(p=>FE_P(p[0],p[1]))]);
FE_WAYS.push(['rim',2,FE.L.ways.find(w=>w.id==='kora.open').pts.map(p=>FE_P(p[0],p[1]))]);
// the paved courts and the terraces' fields (page boxes)
const feBox=b=>[FE_P(b[0],b[2]),FE_P(b[1],b[3])];
const FE_PAVED=['court','mulecourt','pilgrims'].map(id=>feBox(fePart(id).box));
const FE_FIELDS=['terr.w','terr.e'].map(id=>feBox(fePart(id).box));
// ---------------------------------------------------------------- the talus: heaps of fallen columns along the band's foot
const FE_TALUS=[];
{const B=FE.L.band;for(let v=-640;v<=640;v+=80){if(Math.abs(v+75)<40)continue;   /* the cleft's foot stays clear for the stair */
  const jit=KRAND.unit(KRAND.hash(34462,v))-.5,vv=v+jit*30,u=FLASHING_EYE.lipU(FE.L,vv)+B.batter+B.talusRun*.45,c=FE_P(u,vv),t=1-feSm(B.halfLen-B.taper,B.halfLen,Math.abs(vv));
  if(t<.2)continue;FE_TALUS.push(KRUBBLE.heap({id:'talus:'+v,x:c[0],z:c[1],y0:feBase(c[0],c[1])-.5,rx:30*t+8,rz:18*t+6,ry:Math.atan(2*B.lipK*vv),h:9*t+2,
   lumps:4,blocks:16,size:[1.4,4.2],cover:3.2}));}}
// ---------------------------------------------------------------- the flora's mask and fields (the Vale of Xanadu's biome, the page's own)
// the cone's woods and meadows on the flanks and the cap (1), thinner toward the rim (the ash), none on the band's face (steep),
// the crater, the rim's bare ash within 120 m of it, the bench, a pad, a way, a court or a building; nothing off the fine ground
const FE_FINE={x0:-560,x1:560,z0:-300,z1:400,cell:4},FE_COARSE={x0:-1000,x1:1000,z0:-2800,z1:800,cell:10};
const feSegD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l?((x-a[0])*dx+(z-a[1])*dz)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);};
const FE_CR=FE_P(FE.L.crater.centre[0],FE.L.crater.centre[1]);
function feSlope(x,z){const e=4;return Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);}
function feBioMask(x,z){const B=FE_COARSE;if(x<B.x0+20||x>B.x1-20||z<B.z0+20||z>B.z1-20)return 0;
 const dc=Math.hypot(x-FE_CR[0],z-FE_CR[1]);if(dc<FE.L.crater.r+120)return 0;
 if(z>-150&&z<4&&Math.abs(x)<96)return 0;   /* the bench inside its wall */
 if(feSlope(x,z)>.75)return 0;
 for(const p of FE_PLACE){if(p.kind==='wall')continue;const r=Math.hypot(p.w==null?10:p.w,p.d==null?10:p.d)/2+3;if(Math.abs(x-p.x)<r&&Math.abs(z-p.z)<r&&Math.hypot(x-p.x,z-p.z)<r)return 0;}
 for(const b of FE_PAVED.concat(FE_FIELDS))if(x>=Math.min(b[0][0],b[1][0])-2&&x<=Math.max(b[0][0],b[1][0])+2&&z>=Math.min(b[0][1],b[1][1])-2&&z<=Math.max(b[0][1],b[1][1])+2)return 0;
 if(fePadAt(x,z))return 0;
 for(const [k,w,P] of FE_WAYS)for(let i=0;i+1<P.length;i++)if(feSegD(x,z,P[i],P[i+1])<w/2+2)return 0;
 for(const H of FE_TALUS)if(Math.hypot(x-H.x,z-H.z)<Math.max(H.rx,H.rz))return 0;
 return .35+.65*feSm(FE.L.crater.r+150,FE.L.crater.r+900,dc);}
if(typeof BIO!=='undefined'&&BIO.host)Object.assign(BIO.host,{mask:feBioMask,origin:[[0,-400],[0,300],[-600,-900],[600,-900]],center:[0,-500],
 fields:{wet:()=>.55,salt:()=>0,upland:(x,z)=>Math.max(0,Math.min(1,.55+terrainH(x,z)/600)),flow:()=>0,mist:(x,z)=>Math.max(0,Math.min(.35,(terrainH(x,z)+100)/500))}});
window._feSite={pads:FE_PADS.length,places:FE_PLACE.length,walls:FE_WALLS.length,talus:FE_TALUS.length,lip:+feBase(0,-1).toFixed(1),foot:+feBase(0,FE.L.band.batter+FE.L.band.talusRun).toFixed(1),
 model:{lip:+feModel(0,-1).toFixed(1),rim:+feModel(0,-1900).toFixed(1),summit:+feModel(0,-2200).toFixed(1),foot:+feModel(0,100).toFixed(1)}};
