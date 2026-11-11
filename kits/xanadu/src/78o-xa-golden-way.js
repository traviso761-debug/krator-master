// ================================================================= XANADU — the Golden Way: the descending court (2026-11-10) [G builder]
// The harem's covered way to the Sultan (settlements/xanadu/citadel/BLUEPRINT.md: E0, the Golden Way; principle 2, litter-wide),
// built where Erewhon's citadel leaves room for it: the slot between the Sultan's palace (its block at 153 m) and the Garden
// Pleasure Dome (171 m), 7.45 m from the curtain's foot to the Dome's north face, 18 m deep. The owner chose (2026-11-10) the Way
// as a court that descends the 18 m (settlements/xanadu/citadel/PLEASURE-DOME.md, "The Golden Way"). From the top:
//   the North Door     moved 4 m in, from the end of the vest's tunnel through the garden margin (z -57) to the Dome's north face
//                      (-53): the vest keeps its checkered orders and barrel, 4 m shorter (XPDOME, patched below for every page
//                      that takes the citadel; the rooms are the blueprint's). It opens on
//   the balcony        at the Dome's floor, 2.4 m deep along its face, carried over the gate court on one pointed arch of black
//                      and white voussoirs (19.5 m) and on east as a bridge over the Way's foot
//   the Eunuchs' Walk  level along the Dome's face past the eunuchs' court's door, to the Eunuchs' Gate (the first check)
//   the upper flights  two, east, down the Dome's face under a colonnade of black columns and gold capitals (refs 09, 12)
//   the turn           a landing across both lanes at the east end, a black planter and its tree
//   the lower flights  four, back west along the curtain under diaphragm arches (arches behind arches: STYLE.md rule 3)
//   the Golden Gate    at the foot (the palace guard's check), then under the great arch into
//   the gate court     before the gate iwan, open to the sky: the ceremonial door, where the Sultan's litter goes in; and on west
//   the postern court  past the Postern Gate (the household on foot) to the Harem Postern, the Way's own private door
// The dress narrows as the Way comes down (refs/citadel/STYLE.md rule 5): by height, the upper third the Dome's black and white
// pattern and gold (bands, crazy paving, Greek-key runners, alternating voussoirs, black stair treads with gold noses), the
// middle black and white marble under pointed arches, the lowest third the palace's red sandstone under white marble and cusped
// arches. Everything is the pattern system's (78a/78b) and the Moorish vocabulary's (78l/78m): no new texture.
// The Way's frame: x east, z south (the Dome's side), y up from the palace's block; its origin on the palace's axis at the gate
// iwan's face (the palace's local z 49.65). XGW is the data, xgwPlan(top) the flights, floors and gates as plain records (Godot
// reads the same); buildXaCitGoldenWay draws them and writes core/walk (floors, flight strips, blocks) and core/door (the three
// gates' leaves, unlocked); xgwReach() is the audit: from inside the North Door, every floor of the Way and the palace's gate and
// postern doors reached. Erewhon places it (87-er-layout GOLDEN_WAY, 90b) on the palace's block with o.top the Dome's floor above
// it; the kit's sheet draws it alone at Erewhon's height. Seed 33091.
//   XGW, xgwPlan(top), xgwSite(palaceBlock, domeBlock), buildXaCitGoldenWay, xgwReach(), window._xaGoldenWay
const XGW={IW:49.65,   // the gate iwan's face in the palace's frame (78n: xmIwan at z 49, its frame 1.2 deep, the band before it)
 // z: the curtain's face and foot, the lower lane's south face, the colonnade's line, the upper lane's north face, the balcony's
 // north edge, the Dome's north face, the west revetment's face, the back of the iwan's recess, the postern passage's inner end
 Z:{curtain:-4.65,foot:-3.05,low:.45,col:.825,up:.95,balc:2,dome:4.4,west:.3,recess:-5.65,postern:-8.65},
 // x: the iwan's half width (its pishtaq), the Dome's treasury's east wall, the bridge's east end (the Golden Gate), the Eunuchs'
 // Gate, the turn, the east end, the west end, the Harem Postern (78n: x -39) and its passage's half width, the recess's half width
 X:{iwan:7.5,treas:9.7,bridge:12,gate:33,turn0:48,turn1:50.4,west:-47,post:-39,ph:2.2,recess:4.5},
 TOP:18.3,BASE:.45,DOME0:.3,   // the Dome's floor over the palace's block (Erewhon: 171.3 - 153), the palace's floor, the Dome's floor over its ground
 RISE:.175,TREAD:.32,FOOT:3,   // a riser at most, a tread, the landing at the foot before the Golden Gate
 HL:5.4,HU:4.8,HW:8,           // the lower lane's roof over its floor, the upper's, the postern court's
 ARCH:[-14.5,-20,-25.5,-31,-35.8,-42.2],   // the postern court's diaphragm arches (clear of the postern's door, x -41.45..-36.55)
 key:'xa_cit_golden_way',tag:'interior:xa-goldenway'};
// the flights, landings, floors and gates for a Way whose top (the Dome's floor) stands `top` over the palace's block: plain records.
// segs [{lane 'up'|'low', kind 'flight'|'land', x0 < x1, y0 (at x0), y1 (at x1), n risers, name}], floors [{name, rect [x0,x1,z0,z1],
// y}], strips [{name, a [x,z,y], b, w}], gates [{name, x, z0, z1, y, w, h (the lane's roof there), dress}]
function xgwPlan(top){const P=XGW,X=P.X,Z=P.Z,b=P.BASE;top=top==null?P.TOP:top;
 const drop=top-b,N=Math.max(16,Math.ceil(drop/P.RISE)),r=drop/N,NU=2*Math.max(3,Math.round(N*.17)),NL=N-NU;
 const split=(n,k)=>{const a=[];for(let i=0;i<k;i++)a.push(Math.floor(n/k)+(i<n%k?1:0));return a;};
 const fu=split(NU,2),fl=split(NL,4),g=Math.min(P.TREAD,(X.turn0-X.gate-2)/NU,(X.turn0-X.bridge-P.FOOT-3*1.8)/NL);
 const segs=[];
 // the upper lane: the walk, then two flights down east
 segs.push({lane:'up',kind:'land',x0:X.bridge,x1:X.gate,y0:top,y1:top,name:"the Eunuchs' Walk"});
 let x=X.gate,y=top;const Lu=(X.turn0-X.gate)-NU*g;
 fu.forEach((n,i)=>{segs.push({lane:'up',kind:'flight',x0:x,x1:x+n*g,y0:y,y1:y-n*r,n,name:'the upper flight '+(i+1)});x+=n*g;y-=n*r;
  if(i<fu.length-1){segs.push({lane:'up',kind:'land',x0:x,x1:x+Lu,y0:y,y1:y,name:'the upper landing'});x+=Lu;}});
 const mid=y;
 // the lower lane: four flights down west from the turn, then the foot
 x=X.turn0;const Ll=((X.turn0-X.bridge-P.FOOT)-NL*g)/(fl.length-1);
 fl.forEach((n,i)=>{segs.push({lane:'low',kind:'flight',x0:x-n*g,x1:x,y0:y-n*r,y1:y,n,name:'the lower flight '+(i+1)});x-=n*g;y-=n*r;
  if(i<fl.length-1){segs.push({lane:'low',kind:'land',x0:x-Ll,x1:x,y0:y,y1:y,name:'the lower landing '+(i+1)});x-=Ll;}});
 segs.push({lane:'low',kind:'land',x0:X.bridge,x1:x,y0:b,y1:b,name:'the foot of the Way'});
 const zs=s=>s.lane==='up'?[Z.up,Z.dome]:[Z.foot,Z.low];
 const floors=[
  {name:"the North Door's balcony",rect:[-X.iwan,X.bridge,Z.balc,Z.dome+.6],y:top},
  {name:'the turn',rect:[X.turn0,X.turn1,Z.foot,Z.dome],y:mid},
  {name:'under the great arch',rect:[X.iwan,X.bridge+.05,Z.foot,Z.dome],y:b},
  {name:'the gate court',rect:[-X.iwan-.05,X.iwan+.05,0,Z.dome],y:b},
  {name:'the gate iwan',rect:[-X.recess,X.recess,Z.recess-1.2,.05],y:b},
  {name:'the corner',rect:[-X.treas-.05,-X.iwan,Z.foot,Z.balc],y:b},
  {name:'the postern court',rect:[X.west,-X.treas,Z.foot,Z.west],y:b},
  {name:'the Harem Postern',rect:[X.post-X.ph,X.post+X.ph,Z.postern,Z.foot+.05],y:b}];
 for(const s of segs)if(s.kind==='land'){const q=zs(s);floors.push({name:s.name,rect:[s.x0-.05,s.x1+.05,q[0],s.lane==='up'?q[1]+.35:q[1]],y:s.y0});}
 const strips=segs.filter(s=>s.kind==='flight').map(s=>{const q=zs(s);return{name:s.name,a:[s.x0-.3,(q[0]+q[1])/2,s.y0],b:[s.x1+.3,(q[0]+q[1])/2,s.y1],w:q[1]-q[0]-.2};});
 const gates=[
  {name:"the Eunuchs' Gate",x:X.gate-.45,z0:Z.up,z1:Z.dome,y:top,w:2.6,h:top+P.HU,dress:'dome'},
  {name:'the Golden Gate',x:X.bridge+.45,z0:Z.foot,z1:Z.low,y:b,w:2.6,h:b+P.HL,dress:'mixed'},
  {name:'the Postern Gate',x:-X.treas-2.5,z0:Z.foot,z1:Z.west,y:b,w:2.4,h:b+P.HW,dress:'mughal'}];
 return{N,r,g,top,mid,base:b,segs,floors,strips,gates};}
// where the Way stands in a world whose citadel blocks are P (the palace) and D (the Pleasure Dome), each {x, z, y}: its origin
// (the iwan's face on the palace's axis), its level (the palace's block), its top (the Dome's floor over it) and the ground it cuts
// to the palace's level: the Way's x -50..50 (the terrain's vertices at x 48 in, 52 out: the Dome's garden walls keep their
// ground) and from the curtain's foot to 8.5 m inside the Dome's north face (the terrain's 4 m row there falls under its floors);
// built: the Way's own masonry, x and z (a world's retaining walls keep out of it)
function xgwSite(P,D){if(!P||!D)return null;const Z=XGW.Z,z=P.z+XGW.IW,y0=typeof XPDOME!=='undefined'?XPDOME.Y0:XGW.DOME0;
 const X=XGW.X;return{x:P.x,z,y:P.y,top:D.y+y0-P.y,cut:[P.x-50,P.x+50,z+Z.foot-1,z+8.5],built:[P.x+X.west-.6,P.x+X.turn1+.6,z+Z.foot-.5,z+Z.dome+.3]};}

// ---------------------------------------------------------------- the Pleasure Dome where the Way is built
// The North Door moves to the Dome's north face (above). 78d still draws the vest's barrel, its runner and its roof to the old door
// (z -57); while the Dome builds, every piece whose centre stands within the vest's width and that reaches north of the new door's
// wall (z -53.32) is cut back to it, so the barrel, the runner and the roof end at the face. Where the Way is built (o.gw: Erewhon's
// citadel) the north garden wall's run east of the vest goes too: the Way's upper lane takes that margin, its revetment and
// colonnade are the Dome's north edge there. A piece is cut only along z (the boxes and the tunnel's rings these are: unturned, or
// turned about z); a piece scaled by anything but [x, y, z] (the townsfolk) is left alone
{const D=XPDOME,v=D.rooms.find(q=>q.id==='vest'),d=D.doors.find(q=>q.lv===0&&q.at[0]===0&&q.at[1]===-57);
 if(v&&d&&!D._plan){D.ND=-53;v.rects=[[-7,7,D.ND,-40]];v.walk=[[-2,2,D.ND,-45.6],[-5.5,5.5,-45.6,-40]];d.at=[0,D.ND];}}
const XGW_CLIP={on:null,vest:{x:0,hx:7.3,z:-53.32},east:{x:29.95,hx:22,z:-54.2}};
{const k0=kput;kput=function(name,p,q,s,c){const K=XGW_CLIP.on;
  if(K&&p&&s&&s.length>2)for(const R of K){if(!(Math.abs(p[0]-R.x)<R.hx))continue;const z0=p[2]-s[2]/2,z1=p[2]+s[2]/2;if(!(z0<R.z))continue;if(z1<=R.z+.02)return;
   p=[p[0],p[1],(R.z+z1)/2];s=[s[0],s[1],z1-R.z];}
  return k0(name,p,q,s,c);};}
{const D=VERN.defs.xa_pleasure_dome;if(D&&XPDOME.ND!=null){const b0=D.build;D.build=function(G,o){XGW_CLIP.on=o&&o.gw?[XGW_CLIP.vest,XGW_CLIP.east]:[XGW_CLIP.vest];
  try{return b0(G,o);}finally{XGW_CLIP.on=null;}};}}

// ---------------------------------------------------------------- the builder
function buildXaCitGoldenWay(G,o){reseed(33091);const P=XGW,X=P.X,Z=P.Z,top=o&&o.top!=null?o.top:P.TOP,L=xgwPlan(top),b=L.base,mid=L.mid,gr=top-P.DOME0,C=VERN.cur;
 xpBalance(XPAT.balance.citadel);
 const WK=(typeof KWALK!=='undefined'&&typeof IZDOOR!=='undefined'&&C&&(C.o.scale==null||C.o.scale===1))?KWALK:null,TAG=P.tag,kd0=typeof KDOOR!=='undefined'?KDOOR.list.length:0;
 const ST={floors:0,strips:0,blocks:0,steps:0,arches:0,gates:0,columns:0};
 const W3=(x,y,z)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};
 const wFloor=(q,y,name)=>{if(!WK)return;WK.poly({pts:[[q[0],q[2]],[q[1],q[2]],[q[1],q[3]],[q[0],q[3]]].map(p=>W3(p[0],y,p[1])),name:'Golden Way: '+name,tag:TAG});ST.floors++;};
 const wStrip=(S)=>{if(!WK)return;WK.strip({a:W3(S.a[0],S.a[2],S.a[1]),b:W3(S.b[0],S.b[2],S.b[1]),w:S.w,name:'Golden Way: '+S.name,tag:TAG});ST.strips++;};
 const wBlock=(x0,x1,z0,z1,y0,y1)=>{if(!WK||y1-y0<.05||x1-x0<.01||z1-z0<.01)return;const a=IZDOOR._w(x0,y0,z0),c=IZDOOR._w(x1,y1,z1);
  WK.block([Math.min(a[0],c[0]),Math.max(a[0],c[0]),Math.min(a[2],c[2]),Math.max(a[2],c[2]),Math.min(a[1],c[1]),Math.max(a[1],c[1])],TAG);ST.blocks++;};
 // a box in a material: a pattern of 78a (world-aligned), a stone of the pattern system ('B', 'W'), or a Moorish surface (78m: 'MarW' ...)
 const SAND=xC(0xc0644a),XPP=new Set(['band','bandFine','pave','checker','chevron','diamond']),lacq=xC(0x17171b);
 const bx=(m,x0,x1,y0,y1,z0,z1)=>{const w=x1-x0,h=y1-y0,d=z1-z0;if(w<.005||h<.005||d<.005)return;const cx=(x0+x1)/2,cz=(z0+z1)/2;
  if(XPP.has(m))xpBox(m,cx,y0,cz,w,h,d);else if(m==='B'||m==='W')xpStone(m,cx,y0,cz,w,h,d);else vB('xm'+m,cx,y0,cz,w,h,d,0,m==='Sand'?SAND:m==='Gold'?XM_C.gold:null);};
 // the three dresses, by height: the palace's (red sandstone under white marble, cusped arches), black and white marble (pointed
 // arches), the Dome's (its bands and paving, alternating voussoirs, black treads with gold noses)
 const DR={dome:{k:'dome',wall:'band',dado:null,floor:'pave',edge:'B',tread:'B',riser:'W',nose:true,runner:true},
  mixed:{k:'mixed',wall:'MarW',dado:'MarK',floor:'MarW',edge:'MarK',tread:'MarW',riser:'MarK',nose:true,runner:true,arch:'pointed',am:'MarK'},
  mughal:{k:'mughal',wall:'MarW',dado:'Sand',floor:'MarW',edge:'Sand',tread:'MarW',riser:'Sand',nose:false,runner:false,arch:'cusped',am:'MarW'}};
 const dressAt=y=>{const t=(y-b)/Math.max(1,top-b);return t<.3?DR.mughal:t<.62?DR.mixed:DR.dome;};
 const wall=(dr,x0,x1,y0,y1,z0,z1,yf)=>{if(!dr.dado){bx(dr.wall,x0,x1,y0,y1,z0,z1);return;}const yd=Math.min(y1,Math.max(y0,(yf==null?y0:yf)+1.2));
  bx(dr.dado,x0,x1,y0,yd,z0,z1);bx(dr.wall,x0,x1,yd,y1,z0,z1);};
 // a landing's finish over its fill: the field, its two edges along the lane, the Greek-key runner on the passages (STYLE.md rule 4)
 const finish=(dr,x0,x1,z0,z1,y,runner)=>{bx(dr.floor,x0,x1,y-.1,y,z0+.3,z1-.3);bx(dr.edge,x0,x1,y-.1,y+.004,z0,z0+.3);bx(dr.edge,x0,x1,y-.1,y+.004,z1-.3,z1);
  if(runner&&dr.runner&&x1-x0>1.2)xpRunner((x0+x1)/2,y+.02,(z0+z1)/2,Math.min(1.8,z1-z0-1),x1-x0-.4,Math.PI/2);};
 // a flight's steps (z0..z1), each a body in the riser's stone to its tread, the tread over it, a gold nose in the upper dresses
 const steps=(s,z0,z1)=>{const lowAtX0=s.y0<s.y1,xl=lowAtX0?s.x0:s.x1,dir=lowAtX0?1:-1,yl=Math.min(s.y0,s.y1),r=L.r,g=(s.x1-s.x0)/s.n;
  for(let k=0;k<s.n;k++){const xa=xl+dir*k*g,xb=xl+dir*(k+1)*g,yt=yl+(k+1)*r,dr=dressAt(yt),x0=Math.min(xa,xb),x1=Math.max(xa,xb);
   bx(dr.riser,x0,x1,0,yt-.06,z0,z1);bx(dr.tread,x0,x1,yt-.06,yt,z0,z1);if(dr.nose){const xn=dir>0?x0:x1-.04;bx('Gold',xn,xn+.04,yt-.05,yt+.005,z0,z1);}ST.steps++;}};
 // the height of a lane's floor at x (a flight: its tread there)
 const yAt=(s,x)=>{if(s.kind==='land')return s.y0;const lowAtX0=s.y0<s.y1,g=(s.x1-s.x0)/s.n,k=Math.min(s.n-1,Math.max(0,Math.floor((lowAtX0?x-s.x0:s.x1-x)/g)));return Math.min(s.y0,s.y1)+(k+1)*L.r;};
 // a diaphragm arch across a lane at x (z0..z1, its floor yf), its spandrel up to ytop: the Dome's voussoirs, or a Moorish head
 const diaphragm=(x,z0,z1,yf,ytop,dr)=>{const zc=(z0+z1)/2,S=z1-z0,w=S-.6,ys=yf+2.9;ST.arches++;
  if(dr.k==='dome'){xpSpandrel('band',x,ys,zc,Math.PI/2,w,'pointed',.5,ytop);xpVoussoirs(x,ys,zc,Math.PI/2,w,'pointed',.55,{vd:.3,len:.36,jamb:true,floor:yf});return;}
  const hh=2.4;for(const s of[-1,1]){const zz=s<0?z0:z1-.3;bx(dr.dado,x-.25,x+.25,yf,yf+1.2,zz,zz+.3);bx(dr.wall,x-.25,x+.25,yf+1.2,ys+hh,zz,zz+.3);}
  xmArchHead(dr.arch,x,ys,zc,Math.PI/2,w,hh,.5,dr.am,'Gold');bx(dr.wall,x-.25,x+.25,ys+hh,ytop,z0,z1);bx('Gold',x-.27,x+.27,ys+hh,ys+hh+.12,z0,z1);};
 // a gate across a lane: the wall to the lane's roof with an arched opening, its two leaves (core/door, unlocked), blocks either side
 const gate=(Gt)=>{const x=Gt.x,zc=(Gt.z0+Gt.z1)/2,w=Gt.w,y=Gt.y,hs=3.0,H=Gt.h,dr=DR[Gt.dress];ST.gates++;
  for(const s of[-1,1]){const za=s<0?Gt.z0:zc+w/2,zb=s<0?zc-w/2:Gt.z1;wall(dr,x-.3,x+.3,y,H,za,zb,y);wBlock(x-.3,x+.3,za,zb,y,H);}
  if(dr.k==='dome'){xpSpandrel('band',x,y+hs,zc,Math.PI/2,w,'horseshoe',.6,H);xpVoussoirs(x,y+hs,zc,Math.PI/2,w,'horseshoe',.65,{vd:.3,len:.34,jamb:true,floor:y});}
  else{const hh=2.2;xmArchHead(dr.arch,x,y+hs,zc,Math.PI/2,w,hh,.6,dr.am,'Gold');bx(dr.wall,x-.3,x+.3,y+hs+hh,H,zc-w/2,zc+w/2);}
  bx('Gold',x-.33,x+.33,y+hs-.06,y+hs+.02,zc-w/2,zc+w/2);
  if(typeof IZDOOR!=='undefined')IZDOOR.leaf(x,y,zc,Math.PI/2,w-.06,hs-.06,.08,lacq,{locked:false,pair:true});
  vnReg('The Golden Way — '+Gt.name,x,zc,1.8,H,{part:'gate'});};
 const segs=L.segs,up=segs.filter(s=>s.lane==='up'),low=segs.filter(s=>s.lane==='low');
 const roofL=s=>Math.max(s.y0,s.y1)+P.HL,roofU=s=>Math.max(s.y0,s.y1)+P.HU;
 // ---- the lower lane: west along the curtain from the turn, under its roof and diaphragm arches
 for(const s of low){const yf=Math.min(s.y0,s.y1),dr=dressAt(yf),R=roofL(s);
  wall(dr,s.x0,s.x1,0,R,Z.foot-.3,Z.foot+.1,yf);   // 0.1 m proud of the curtain's merlons and parapet (78-xa-palace xnXECurtain: their face at z -3.05)
  wall(dr,s.x0,s.x1,0,R,Z.low,Z.low+.25,yf);
  bx('W',s.x0,s.x1,R,R+.35,Z.foot-.45,Z.low+.25);bx('Gold',s.x0,s.x1,R-.14,R,Z.foot,Z.foot+.03);bx('Gold',s.x0,s.x1,R-.14,R,Z.low-.03,Z.low);
  if(s.kind==='land'){bx('W',s.x0,s.x1,0,s.y0-.1,Z.foot,Z.low);finish(dr,s.x0,s.x1,Z.foot,Z.low,s.y0,true);}else steps(s,Z.foot,Z.low);}
 // the diaphragm arches: one where the lane leaves the turn, one between every two of its segments (the foot's west end is the
 // Golden Gate). The lane runs west, so a segment's west end (x0) meets the next one's east end; its floor there is y0
 diaphragm(low[0].x1,Z.foot,Z.low,low[0].y1,Math.max(roofL(low[0]),mid+P.HL)+.35,dressAt(low[0].y1));
 for(let i=0;i+1<low.length;i++){const s=low[i];diaphragm(s.x0,Z.foot,Z.low,s.y0,Math.max(roofL(s),roofL(low[i+1]))+.35,dressAt(s.y0));}
 // ---- the upper lane: east along the Dome's face, its colonnade on the lower lane's side, its roof over it
 for(const s of up){const yf=Math.min(s.y0,s.y1),R=roofU(s);
  bx('W',s.x0,s.x1,R,R+.35,Z.low+.25,Z.dome);bx('Gold',s.x0,s.x1,R-.14,R,Z.low+.25,Z.low+.3);
  if(s.kind==='land'){bx('band',s.x0,s.x1,0,s.y0-.1,Z.low+.25,Z.dome);finish(DR.dome,s.x0,s.x1,Z.up,Z.dome,s.y0,true);bx('B',s.x0,s.x1,s.y0-.1,s.y0,Z.low+.25,Z.up);}
  else steps(s,Z.low+.25,Z.dome);
  const n=Math.max(1,Math.round((s.x1-s.x0)/3.6)),xs=[];for(let k=0;k<=n;k++)xs.push(s.x0+.35+(s.x1-s.x0-.7)*k/n);
  for(const x of xs){const y=yAt(s,x);xpBlackCol(x,y,Z.col,.2,R-y);ST.columns++;}
  for(let k=0;k<xs.length-1;k++)xpBalustrade([xs[k]+.25,Z.col],[xs[k+1]-.25,Z.col],yAt(s,xs[k]),yAt(s,xs[k+1]),{h:.95});}
 // the colonnade's block (a walker on the upper lane stays on it; the lower lane's south wall is under it)
 wBlock(X.bridge,X.turn0,Z.low,Z.up,0,top+P.HU);wBlock(X.bridge,X.turn1,Z.foot-.3,Z.foot,0,top+P.HU);
 // ---- the turn: a landing across both lanes, its end wall, a black planter and its olive
 {const R=mid+P.HL;bx('band',X.turn0,X.turn1,0,mid-.1,Z.foot,Z.dome);finish(DR.dome,X.turn0,X.turn1,Z.foot,Z.dome,mid,false);
  bx('band',X.turn1,X.turn1+.6,0,R+.35,Z.foot-.45,Z.dome+.25);bx('band',X.turn0,X.turn1,0,R,Z.foot-.3,Z.foot+.1);wBlock(X.turn1,X.turn1+.6,Z.foot-.45,Z.dome+.25,0,R);
  bx('W',X.turn0,X.turn1,R,R+.35,Z.foot-.45,Z.dome);bx('Gold',X.turn0,X.turn1,R-.14,R,Z.foot,Z.foot+.03);
  xpPlanter(X.turn1-.95,mid,Z.dome-.95,.7,.8,3.4);wBlock(X.turn1-1.7,X.turn1-.2,Z.dome-1.7,Z.dome-.2,mid,mid+1);xpChandelier((X.turn0+X.turn1)/2,R,Z.foot+1.6,.6,1.2);}
 // ---- the Dome's foot: the revetment under its north face from the gate court to the turn (its ground the Dome's: gr), and west of
 // the gate court the fill under its garden margin and the treasury, faced where the postern court and the corner stand before it
 bx('band',-X.iwan,X.turn1+.6,0,gr,Z.dome,Z.dome+.25);wBlock(-X.iwan,X.turn1,Z.dome,Z.dome+.25,0,gr);
 {const yw=b+P.HW+.35;for(const q of[[X.west-.6,-X.treas,Z.west],[-X.treas,-X.iwan,Z.balc]]){wall(DR.mughal,q[0],q[1],0,yw,q[2],Z.dome+.25,b);bx('band',q[0],q[1],yw,gr,q[2],Z.dome+.25);wBlock(q[0],q[1],q[2],Z.dome+.25,0,gr);}
  bx('MarW',X.west-.6,-20.3,gr,gr+.55,Z.west,Z.west+.35);bx('Gold',X.west-.6,-20.3,gr+.55,gr+.62,Z.west,Z.west+.35);   // the coping before the Dome's garden wall
  wall(DR.mughal,X.west-.6,X.west,0,yw,Z.foot-.2,Z.west,b);wBlock(X.west-.6,X.west,Z.foot-.2,Z.west,0,yw);}   // the west end
 xpBalustrade([-X.treas,Z.balc+.08],[-X.iwan,Z.balc+.08],gr,gr,{h:.95});
 // ---- the balcony and the bridge: the deck at the Dome's floor on the great arch (19.5 m, pointed, black and white voussoirs)
 {const x0=-X.iwan,x1=X.bridge,span=x1-x0,xa=(x0+x1)/2,zc=(Z.balc+Z.dome)/2,dep=Z.dome-Z.balc,rise=xpArchRise('pointed')*span,vd=.9,ys=top-.5-rise-vd-.1;
  xpSpandrel('band',xa,ys,zc,0,span,'pointed',dep,top-.5);xpVoussoirs(xa,ys,zc,0,span,'pointed',dep+.04,{vd,len:1.0,jamb:true,floor:b});ST.arches++;
  bx('band',x0,x1,top-.5,top-.1,Z.balc,Z.dome);bx('pave',x0,x1,top-.1,top,Z.balc,Z.dome);bx('Gold',x0,x1,top-.6,top-.5,Z.balc-.02,Z.balc+.1);
  xpRunner(xa,top+.02,zc+.2,1.6,span-.8,Math.PI/2);
  xpBalustrade([x0,Z.balc+.08],[x1,Z.balc+.08],top,top,{h:1.0});xpBalustrade([x0+.08,Z.balc+.1],[x0+.08,Z.dome-.1],top,top,{h:1.0});xpBalustrade([x1,Z.up+.1],[x1,Z.balc],top,top,{h:1.0});
  wBlock(x0,x1,Z.balc-.15,Z.balc+.12,top,top+1.1);wBlock(x0-.1,x0+.15,Z.balc,Z.dome,top,top+1.1);
  for(const s of[-1,1]){xpOrb(s*2.6,top,Z.balc+.6,.32,.85);wBlock(s*2.6-.35,s*2.6+.35,Z.balc+.25,Z.balc+.95,top,top+1.2);}}   // black spheres on white pedestals flanking the North Door (ref 08)
 // ---- the gate court: open to the sky before the gate iwan, the palace's marble and sandstone with the Dome's black border; the
 // iwan's recess paved; under the great arch, and the corner round the iwan's west pier to the postern court
 {bx('MarW',-X.iwan,X.iwan,0,b,0,Z.dome);bx('Sand',-X.iwan,X.iwan,b-.1,b+.006,0,.35);bx('B',-X.iwan,X.iwan,b-.1,b+.006,Z.dome-.45,Z.dome);
  for(const s of[-1,1])bx('Sand',s<0?-X.iwan:X.iwan-.35,s<0?-X.iwan+.35:X.iwan,b-.1,b+.006,.35,Z.dome-.45);
  xmBasin(0,b,Z.dome-1.0,.7);wBlock(-.75,.75,Z.dome-1.75,Z.dome-.25,b,b+.6);
  bx('MarW',-X.recess,X.recess,0,b,Z.recess,0);bx('Sand',-X.recess,X.recess,b-.1,b+.006,-.45,0);
  bx('MarW',X.iwan,X.bridge,0,b,Z.foot,Z.dome);bx('B',X.iwan,X.bridge,b-.1,b+.006,Z.dome-.45,Z.dome);
  bx('MarW',-X.treas,-X.iwan,0,b,Z.foot,Z.balc);}
 // ---- the postern court: west along the curtain to the Harem Postern, under diaphragm arches and a roof over the curtain's batter
 {const R=b+P.HW;bx('MarW',X.west,-X.treas,0,b-.1,Z.foot,Z.west);finish(DR.mughal,X.west,-X.treas,Z.foot,Z.west,b,false);
  bx('W',X.west-.6,-X.treas,R,R+.35,-4.25,Z.west+.3);bx('Gold',X.west,-X.treas,R-.14,R,Z.west-.03,Z.west);
  for(const x of P.ARCH)diaphragm(x,Z.foot,Z.west,b,R+.35,DR.mughal);
  bx('MarW',X.post-X.ph,X.post+X.ph,0,b,Z.postern+3.2,Z.foot);}
 for(const Gt of L.gates)gate(Gt);
 // ---- core/walk: the floors, the flights' strips
 for(const F of L.floors)wFloor(F.rect,F.y,F.name);for(const S of L.strips)wStrip(S);
 vnReg('The Golden Way',(X.bridge+X.turn1)/2,.7,(X.turn1-X.bridge)/2,top+P.HU);vnReg('The Golden Way — the gate court',0,2.2,6.5,top,{part:'court'});
 vnReg('The Golden Way — the postern court',(X.west-X.treas)/2,-1.4,(X.west+X.treas)/-2,b+P.HW,{part:'postern'});
 const doors=typeof KDOOR!=='undefined'?KDOOR.list.slice(kd0).filter(D=>!D.locked).length:0;window._hollowDoors=(window._hollowDoors|0)+doors;
 const W=(x,y,z)=>IZDOOR._w(x,y,z);
 window._xaGoldenWay=Object.assign(ST,{N:L.N,riser:+L.r.toFixed(3),tread:+L.g.toFixed(3),top:+top.toFixed(2),mid:+mid.toFixed(2),doors,walk:!!WK,erewhon:!!(o&&o.top!=null),tag:TAG,
  seed:W(0,top,Z.dome+3.5),gate:W(0,b,44-P.IW-.5),postern:W(X.post,b,41-P.IW-.5),box:[W(-56,0,-16),W(56,0,14)]});
 xpBalance(null);}
// the audit (core/walk's KWALK.reach): from inside the North Door, with the Way's, the Dome's and the palace's unlocked doors open,
// over the Way's floors and flights: {floors, reached, unreached: [names], gate, postern (the palace's door strips at the gate iwan and
// the Harem Postern reached), nodes, capped}
function xgwReach(){const S=window._xaGoldenWay;if(!S||!S.walk||typeof KWALK==='undefined')return null;
 for(const d of KDOOR.list)if(!d.locked&&(d.key===XGW.key||d.key==='xa_pleasure_dome'||d.key==='xa_cit_palace'))KDOOR.open(d.id,{by:'audit'});for(let k=0;k<40;k++)KDOOR.step(.25);
 const B=S.box,R=KWALK.reach([S.seed],{box:[Math.min(B[0][0],B[1][0]),Math.max(B[0][0],B[1][0]),Math.min(B[0][2],B[1][2]),Math.max(B[0][2],B[1][2])],cell:.4});
 const mine=f=>String(f.tag||'')===S.tag,un=R.unreached.filter(mine),re=R.reached.filter(mine),got=new Set(R.reached);
 const at=p=>KWALK.floorsAt(p[0],p[2]).some(e=>got.has(e[1])&&Math.abs(e[0]-p[1])<.6);
 return{floors:un.length+re.length,reached:re.length,unreached:un.map(f=>f.name),gate:at(S.gate),postern:at(S.postern),nodes:R.nodes,capped:!!R.capped};}
XA.def({key:'xa_cit_golden_way',name:'The Golden Way',family:'The Sultan',nv:1,tags:{type:['civic'],wealth:'civic',lit:false,landmark:true},
 w:108,d:11.3,h:24,fw:108,fd:11.3,build:buildXaCitGoldenWay});
