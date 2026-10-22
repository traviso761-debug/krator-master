// ================================================================= THE SANCTUM — the plan (records)
// The Eternal State's capital arcology, the owner's form (2026-10-22; the spiral drum that was the Sanctum is now the
// Podium, targets/podium). From the ground up:
//   the PODIUM    a hexagon six storeys tall, a hexagonal gate in the middle of each face under a face sculpture; each
//                 gate opens on a hexagonal atrium, a ceremonial court open to the sky
//   the STALK     a hexagon a sixth of the podium's width, rising nine storeys from the podium's roof
//   the SOLID     on the stalk, a hexagon two thirds of the podium's width with rounded corners, turned 30 degrees so
//                 its corners stand over the middles of the podium's faces (over the gates): most of the mass. Its
//                 faces are bands of balconies every six storeys with great lancet windows between, the Eternian
//                 way; six hexagonal light wells pierce it from top to bottom
//   the ROOF      a garden, a tapering central tower under a hexagonal roof, six smaller towers at the corners
// [G data]: records with stable ids and plain functions, no three.js, no DOM. th is measured from +x toward +z (z is
// south): the front gate is south, th = 90 degrees. What varies (the garden's trees) draws from KRAND hashed by
// (seed, salt, index), never from how many draws came before.
const SANCTUM={};
SANCTUM.DIM=(function(){const SH=5,RP=400,YP=6*SH,RS=RP*2/3,RF=36;
 return {SH:SH,
  RP:RP,YP:YP,                       // the podium: corner radius, height (six storeys)
  RK:RP/6,YS0:YP+9*SH,               // the stalk: corner radius, the solid's underside (nine storeys of stalk)
  RS:RS,RF:RF,YS1:YP+9*SH+48*SH,     // the solid: corner radius, corner fillet, roof (48 storeys)
  GATE:14,GATED:17,                  // a gate: the hexagon's corner radius (28 m wide), the passage's depth
  ATC:300,ATR:34,                    // an atrium: its centre's distance, corner radius
  WC:150,WR:34,                      // a light well: its centre's distance (on a face's normal), corner radius
  BAND:30,WIN:9,                     // the solid's balcony bands every 30 m; nine great windows a face a band
  TOWER:{R0:48,R1:30,h:80,roof:30,ov:4},CORNER:{r:222,R0:13,R1:8,h:42,roof:12,ov:2}};})();
SANCTUM.METAL={gold:0xd8b24a,bronze:0x8c6a34,silver:0xc8ccd0};
/* the podium's corners sit at multiples of 60 degrees, so its faces (and gates, and atria) face 30 + 60k; the solid is
   turned 30 degrees: its corners at 30 + 60k, its faces (and wells) at 60k */
SANCTUM.FACE_P=k=>Math.PI/6+k*Math.PI/3;
SANCTUM.FACE_S=k=>k*Math.PI/3;
SANCTUM.hex=(cx,cz,R,a0)=>{const p=[];for(let i=0;i<6;i++){const a=a0+i*Math.PI/3;p.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]);}return p;};
/* the solid's outline: six fillets of radius RF, each an arc from one face's normal to the next through its corner,
   n segments (even, so the corner's bisector is a vertex), n + 1 points each from tangent point to tangent point:
   [[x, z, th]] in order of angle, corner 0's first; a face's straight run joins one arc's last point to the next's first */
SANCTUM.outline=(n)=>{const D=SANCTUM.DIM;n=n==null?8:n;const d=D.RS-D.RF/Math.sin(Math.PI/3),out=[];
 for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3,fx=d*Math.cos(a),fz=d*Math.sin(a);
  for(let i=0;i<=n;i++){const t=a-Math.PI/6+i/n*Math.PI/3;out.push([fx+D.RF*Math.cos(t),fz+D.RF*Math.sin(t),t]);}}
 return out;};
/* is (x, z) inside the solid's plan, inset by e? (the hexagon's faces, then the fillets at the corners) */
SANCTUM.inSolid=(x,z,e)=>{const D=SANCTUM.DIM,ap=D.RS*Math.cos(Math.PI/6),d=D.RS-D.RF/Math.sin(Math.PI/3);e=e==null?0:e;
 for(let k=0;k<6;k++){const a=SANCTUM.FACE_S(k);if(x*Math.cos(a)+z*Math.sin(a)>ap-e)return false;}
 for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3,fx=d*Math.cos(a),fz=d*Math.sin(a);
  if(x*Math.cos(a)+z*Math.sin(a)>d&&Math.hypot(x-fx,z-fz)>D.RF-e)return false;}
 return true;};
/* inside a hexagon of corner radius R about (cx, cz) whose faces point along a0 + 60k */
SANCTUM.inHex=(x,z,cx,cz,R,a0)=>{const ap=R*Math.cos(Math.PI/6);
 for(let k=0;k<6;k++){const a=a0+k*Math.PI/3;if((x-cx)*Math.cos(a)+(z-cz)*Math.sin(a)>ap)return false;}return true;};
/* the volume, from the plan: the podium less its atria and passages, the stalk, the solid less its wells, the towers */
SANCTUM.volume=()=>{const D=SANCTUM.DIM,H=r=>3*Math.sqrt(3)/2*r*r,fil=6*D.RF*D.RF*(1/Math.tan(Math.PI/3)-Math.PI/6);
 const pod=(H(D.RP)-6*H(D.ATR))*D.YP-6*(1.5*Math.sqrt(3)*D.GATE*D.GATE)*D.GATED;
 const stalk=H(D.RK)*(D.YS0-D.YP),solid=(H(D.RS)-fil-6*H(D.WR))*(D.YS1-D.YS0);
 const fr=(R0,R1,h)=>3*Math.sqrt(3)/2*h*(R0*R0+R0*R1+R1*R1)/3;
 return pod+stalk+solid+fr(D.TOWER.R0,D.TOWER.R1,D.TOWER.h)+6*fr(D.CORNER.R0,D.CORNER.R1,D.CORNER.h);};

SANCTUM.plan=function(o){o=o||{};const seed=o.seed==null?12200:o.seed,D=SANCTUM.DIM,TAU=Math.PI*2,C=Math.cos,S=Math.sin;
 const P={id:'sanctum',seed:seed,gates:[],atria:[],wells:[],bands:[],windows:[],corners:[],add:[]};
 const apP=D.RP*C(Math.PI/6);
 P.podium={id:'sanctum.podium',R:D.RP,h:D.YP};
 for(let k=0;k<6;k++){const th=SANCTUM.FACE_P(k),front=k===1;
  /* the gate: a hexagon in the face, flat along the ground, its passage through to the atrium; the face above it */
  P.gates.push({id:'sanctum.gate.'+k,th:th,r:apP,R:D.GATE,depth:D.GATED,front:front,
   name:front?'The Gate of the Heirs':'The '+['south-east','south','south-west','north-west','north','north-east'][k]+' gate'});
  P.add.push({id:'sanctum.gate.'+k+'.face',kind:'head',at:[(apP-4)*C(th),D.YP,(apP-4)*S(th)],face:[C(th),0,S(th)],
   h:front?20:17,metal:'gold',color:SANCTUM.METAL.gold});
  /* the atrium behind it: a hexagonal court open to the sky, a face of it toward the gate; a pool, an ancestor */
  const ax=D.ATC*C(th),az=D.ATC*S(th);
  P.atria.push({id:'sanctum.atrium.'+k,th:th,c:[ax,az],R:D.ATR,pool:9});
  P.add.push({id:'sanctum.atrium.'+k+'.ancestor',kind:'figure',at:[ax,2.4,az],face:[C(th),0,S(th)],h:13,
   metal:front?'gold':'bronze',color:front?SANCTUM.METAL.gold:SANCTUM.METAL.bronze});}
 P.stalk={id:'sanctum.stalk',R:D.RK,y0:D.YP,y1:D.YS0};
 P.solid={id:'sanctum.solid',R:D.RS,rf:D.RF,y0:D.YS0,y1:D.YS1};
 for(let k=0;k<6;k++){const th=SANCTUM.FACE_S(k);P.wells.push({id:'sanctum.well.'+k,th:th,c:[D.WC*C(th),D.WC*S(th)],R:D.WR});
  for(let t=0;t*D.BAND<D.YS1-D.YS0;t++){const y=D.YS0+t*D.BAND;
   if(t>0)P.bands.push({id:'sanctum.band.'+k+'.'+t,face:k,th:th,y:y,depth:3.6});
   P.windows.push({id:'sanctum.windows.'+k+'.'+t,face:k,th:th,y:y+4,h:D.BAND-8,n:D.WIN,w:11});}}
 P.garden={id:'sanctum.garden',y:D.YS1};
 P.tower=Object.assign({id:'sanctum.tower',y0:D.YS1},D.TOWER);
 for(let k=0;k<6;k++){const th=Math.PI/6+k*Math.PI/3;
  P.corners.push(Object.assign({id:'sanctum.tower.'+k,th:th,c:[D.CORNER.r*C(th),D.CORNER.r*S(th)],y0:D.YS1},D.CORNER));}
 /* the roof garden's trees: a 14 m lattice, each node kept by a hash of (seed, node) and jittered by it; none in a
    well, on a path (the ring round the tower, the six spokes to the corner towers) or under a tower */
 const keep=(x,z,i,j,salt,p)=>KRAND.unit(KRAND.hash(seed,salt,i,j))<p;
 const nearPath=(x,z)=>{const r=Math.hypot(x,z);if(r>D.TOWER.R0+12&&r<D.TOWER.R0+24)return true;
  for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3,u=x*C(a)+z*S(a),v=-x*S(a)+z*C(a);if(u>0&&Math.abs(v)<6)return true;}return false;};
 let nt=0;
 for(let i=-20;i<=20;i++)for(let j=-20;j<=20;j++){
  const jx=(KRAND.unit(KRAND.hash(seed,71,i,j))-.5)*8,jz=(KRAND.unit(KRAND.hash(seed,72,i,j))-.5)*8,x=i*14+jx,z=j*14+jz;
  if(!SANCTUM.inSolid(x,z,10)||Math.hypot(x,z)<D.TOWER.R0+8||nearPath(x,z))continue;
  if(P.wells.some(w=>SANCTUM.inHex(x,z,w.c[0],w.c[1],w.R+8,w.th)))continue;
  if(P.corners.some(c=>Math.hypot(x-c.c[0],z-c.c[1])<c.R0+7))continue;
  if(!keep(x,z,i,j,73,.62))continue;
  P.add.push({id:'sanctum.garden.tree.'+i+'.'+j,kind:'tree',at:[x,D.YS1,z],h:9+KRAND.unit(KRAND.hash(seed,74,i,j))*7,formal:(i+j)%3===0});nt++;}
 /* the podium roof's trees: the ring outside the solid's shadow line, clear of the atria and the stalk */
 for(let i=-30;i<=30;i++)for(let j=-30;j<=30;j++){const x=i*16,z=j*16;
  if(!SANCTUM.inHex(x,z,0,0,D.RP-14,Math.PI/6)||SANCTUM.inSolid(x,z,-14))continue;
  if(P.atria.some(a=>SANCTUM.inHex(x,z,a.c[0],a.c[1],a.R+10,a.th)))continue;
  if(!keep(x,z,i,j,75,.5))continue;
  P.add.push({id:'sanctum.podium.tree.'+i+'.'+j,kind:'tree',at:[x,D.YP,z],h:8+KRAND.unit(KRAND.hash(seed,76,i,j))*5,formal:true});nt++;}
 /* the banners: one either side of each gate, the State's sign */
 for(const g of P.gates)for(const s of [-1,1]){const t=[-S(g.th),0,C(g.th)],r=apP+.6,off=g.R+9;
  P.add.push({id:g.id+'.banner.'+(s>0?'r':'l'),kind:'banner',at:[r*C(g.th)+t[0]*s*off,D.YP-2,r*S(g.th)+t[2]*s*off],face:[C(g.th),0,S(g.th)],w:7,h:22});}
 P.trees=nt;P.vol=SANCTUM.volume();
 return P;};
