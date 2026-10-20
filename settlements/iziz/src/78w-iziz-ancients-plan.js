// ================================================================= 78w. THE ANCIENT QUARTERS' OTHER BUILDINGS: their floor plans (2026-10-19)
// The skyscrapers' rules (78s; settlements/iziz/towers/BLUEPRINT.md) carried over to every other Ancient building the city
// places: a lobby at the foot, then slum cells in a reclaimed building (d 3: the first 12 storeys; junk above), rubble rooms
// in a ruined one (d 1), the partitions broken by the kit's hole rule, no rooms in fallen parts; storeys are the world's, on
// each building's own window rhythm. Plain data (no THREE, no DOM: [G data]); 78x draws it, towers/blueprint.py draws the
// same plans as sheets (towers/plan_dump.js runs this file in node with 78s and the kit's noise).
//   IZANC.plan(type, d, s, noise, extra) -> {type, name, d, s, masses:[{id, at:[x,z], plan}]} or null
//     type    a key of IZANC.T: the kit's aptsA, aptsC, honey, houseD, houseE, houseF, fuel, or a transplant family
//             (t_setback, t_setback2, t_pent, t_hept, t_wedge, t_barrel, t_midrise: the Ancient halves only)
//     d       the decay it was built at (1 ruined, 3 reclaimed); s its placement scale
//     extra   {top, floor}: a transplant's wreck cut, in kit units (the lowest the jagged cut comes over the footprint),
//             and the highest the ground comes inside it (its lots are not levelled: the lobby's floor stands there)
// Each mass is one IZTOWER.plan (78s) on the building's descriptor, its coordinates in world metres in the building's own frame
// (the builder's local x, z times s; y above the group's origin), the stair core at `at`. What each building is, from its
// builder (kits/ancients/src: 82-apartments, 64-houses-def, 84-fuel, 77z-iziz-style), at the city's scale:
//   aptsA    the terrace stack (0.385): the lobby in the hyperboloid stem's foot, a storey a tray (2.1 m: one window row)
//   aptsC    the column cluster (0.39): five drums 5 m across on stilts, a slim switchback across each, a room either side,
//            the first storey a lobby reached by steps from the plaza
//   honey    the honeycomb wall (0.6): a bar 7 m deep on an arc, 13 storeys, a corridor down it, the core at a third of
//            its length, the bite (upper storeys over its east third come down in the decayed states) left empty
//   houseD   the apse house (0.7): a corridor along the glass front, three rooms behind it under the dome
//   houseE   the bridge house (0.54): the glass box on its piers (its east half in a ruin), two rooms, the kit's stair
//   houseF   the terrace house (0.7): each tray a row of rooms, the first entered from the street, the next off its roof
//   fuel     the Well's kiosk (0.3): one room
//   t_*      the Ancients transplants (about 2 x): rings round the stair core like the towers, two or three storeys a
//            window row; the setback tower's body stands on struts, so a stair climbs to it from the ground
const IZANC=(function(){
 const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const circle=(cx,cz,R,n)=>{const o=[];n=n==null?48:n;for(let i=0;i<n;i++){const t=i/n*TAU;o.push([cx+R*Math.cos(t),cz+R*Math.sin(t)]);}return o;};
 const rect=(x0,x1,z0,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 // the part of a polygon with ax*x + az*z <= c
 function clip(P,ax,az,c){const out=[];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],sp=ax*p[0]+az*p[1]-c,sq=ax*q[0]+az*q[1]-c;
  if(sp<=0)out.push(p);if((sp<=0)!==(sq<=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;}
 // a sector of the disc (cx, cz, R) from bearing a to b
 const sector=(cx,cz,R,a,b,n)=>{const o=[[cx,cz]];n=n==null?8:n;for(let i=0;i<=n;i++){const t=a+(b-a)*i/n;o.push([cx+R*Math.cos(t),cz+R*Math.sin(t)]);}return o;};
 const se=(th,n)=>1/Math.pow(Math.pow(Math.abs(Math.cos(th)),n)+Math.pow(Math.abs(Math.sin(th)),n),1/n);
 // ---- the buildings: each a list of masses {id, at (kit units), K (78s's descriptor)}
 const T={};
 // APARTMENTS A: eight lobed trays (tray s at y 6 + 5.4 s, its centre swung 5 m off the stem, radius 24 - 1.6 s; in the
 // decayed states tray 6 is gone, so 7 hangs unreachable over the gap: no rooms in it) on a hyperboloid stem whose foot is the
 // lobby, its street door on +x (the builder's arch). The stair rises in the stem's axis through every tray.
 const stemR=y=>7*Math.sqrt(1+1.5*Math.pow((y-20)/20,2));
 T.aptsA={name:'Apartments A — the terrace stack',masses:d=>[{id:'stack',at:[0,0],K:{seed:700,body:0,top:()=>48.4,lobby:'body',door:0,openRooms:true,
  levels:()=>{const L=[{y:0,h:6,lobby:true,outline:circle(0,0,.92*stemR(3),40)}];
   for(let s=0;s<8;s++){if(d>0&&s>=6)break;L.push({y:6+s*5.4,h:s===7||d>0&&s===5?4.4:5.4,outline:circle(5*Math.sin(s*1.3),5*Math.cos(s*.9),.95*(24-s*1.6),48)});}return L;}}}]};
 // APARTMENTS C: five lobed drums (R 7.5, the lining at .82) from y 10 on a stilt each; column 1 is cut at half its height in
 // the decayed states. A storey every two window rows; each drum's door faces out of the cluster, steps down to the plaza.
 const COLS=[[0,0,48,1.28],[26,10,40,.47],[-22,14,36,2.43],[8,-26,44,-1.17],[-18,-18,30,-2.45]];
 T.aptsC={name:'Apartments C — the column cluster',masses:d=>COLS.map((c,i)=>({id:'col'+i,at:[340+c[0],c[1]],K:{seed:730+i,body:10,top:()=>d>0&&i===1?c[2]*.5:c[2],
  rows:{pitch:4,phase:10},lobby:'body',layout:'slim',door:c[3],outline:()=>circle(0,0,7.5*.82,32)},
  door:(E,S,s)=>{const th=Math.atan2(E.at[1],E.at[0]);doorToShell(E,7.5*(1+.3*(.5+.5*Math.cos(6*th)))*s);doorThreshold(E,7.5*.82*s,S.y,S);}}))};
 // APARTMENTS B, the honeycomb wall: two perforated skins 12 m apart on an arc of radius 110 about (150, -88), 60 high, 13
 // floors. The bite: over the east third the decayed block stands only to bite(u) (82-apartments.js, the same noise).
 const HB={c:[150,-88],R:104,hd:5.6,a0:-.54,a1:.54,core:.3,door:.36};
 const bite=(u,fbm)=>{const t=clamp(1-Math.abs(u-.72)/.24,0,1);return 60-(t>0?60*.55*Math.pow(t,.7)+6*(fbm(u*14,3.1,725,2)-.5)*Math.min(1,t*4):0);};
 const honeyOutline=()=>{const o=[],n=24;for(let i=0;i<=n;i++){const a=HB.a0+(HB.a1-HB.a0)*i/n;o.push([HB.c[0]+(HB.R+HB.hd)*Math.sin(a),HB.c[1]+(HB.R+HB.hd)*Math.cos(a)]);}
  for(let i=n;i>=0;i--){const a=HB.a0+(HB.a1-HB.a0)*i/n;o.push([HB.c[0]+(HB.R-HB.hd)*Math.sin(a),HB.c[1]+(HB.R-HB.hd)*Math.cos(a)]);}return o;};
 T.honey={name:'Apartments B — the honeycomb wall',masses:d=>[{id:'wall',at:[0,0],K:{seed:710,body:0,top:()=>60,rows:{pitch:60/13,phase:0},lobby:'body',lobbyMin:2.5,layout:'bar',
  outline:honeyOutline,bar:Object.assign({},HB,{alive:(u,y,fbm)=>!(d>0)||y<=bite(u,fbm)+.5})}}]};
 // HOUSE D, the apse: a half dome (radius 9, the liner at .94) open to +z behind a glass front, the floor the kit's slab
 // (top y .6). A corridor along the front, the street door in it at x 3 (steps only: in a decay the front is open);
// three rooms behind, cut by bearing.
 const houseD=()=>{const R=8.3,zc=-2.2,hw=Math.sqrt(R*R-zc*zc),rooms=[],walls=[],cuts=[Math.PI,4*Math.PI/3,5*Math.PI/3,TAU];
  for(let i=0;i<3;i++){const a=cuts[i],b=cuts[i+1],poly=clip(sector(0,0,R,a,b,10),0,1,zc),xs=poly.map(p=>p[0]),x0=Math.max(-hw,Math.min(...xs)),x1=Math.min(hw,Math.max(...xs)),dx=(x0+x1)/2;
   rooms.push({poly,door:[dx,zc]});walls.push({a:[x0,zc],b:[dx,zc],door:'b'},{a:[dx,zc],b:[x1,zc],door:'a'});
   if(i<2){const t=b,r0=Math.abs(zc/Math.sin(t));walls.push({a:[r0*Math.cos(t),r0*Math.sin(t)],b:[R*Math.cos(t),R*Math.sin(t)]});}}
  return{rooms,walls,corridors:[clip(clip(circle(0,0,R,48),0,-1,-zc),0,1,-.3)],entrance:{at:[3,-.1],th:Math.PI/2,leaf:false}};};
 T.houseD={name:'House D — the apse house',masses:d=>[{id:'apse',at:[25,0],K:{seed:150,body:.6,top:()=>9,layout:'rooms',
  levels:()=>[Object.assign({y:.6,h:4.5,noSlab:true,outline:clip(circle(0,0,8.3,48),0,1,-.3)},houseD())]}}]};
 // HOUSE E, the bridge house: the glass box on two piers (its floor's top 8.65, the roof's soffit 11.85); in a ruin only the
 // east half (x 65 to 78) stands. Two rooms, the door at the head of the kit's spiral stair round the east pier.
 const houseE=d=>{const bx=65,x0=d>0?bx+.3:bx-12.7,x1=bx+12.7,xm=d>0?bx+6.5:bx,rooms=[{poly:rect(x0,xm,-3.7,3.7),door:[xm,2.2]},{poly:rect(xm,x1,-3.7,3.7),door:[xm,2.2]}];
  const walls=[{a:[xm,-3.7],b:[xm,2.2],door:'b'},{a:[xm,2.2],b:[xm,3.7],door:'a'}],path=[];
  for(let k=0;k<8;k++){const a=Math.PI/2-(7-k)*.7;path.push([bx+9+4.5*Math.cos(a),k*1.05+.7,4.5*Math.sin(a)]);}path.push([bx+9,8.9,4.6]);
  return{rooms,walls,entrance:{at:[bx+9,3.8],th:Math.PI/2,steps:false,path}};};
 T.houseE={name:'House E — the bridge house',masses:d=>[{id:'box',at:[0,0],K:{seed:160,body:8.65,top:()=>12,layout:'rooms',
  levels:()=>[Object.assign({y:8.65,h:3.2,clear:3.2,noSlab:true,outline:rect(d>0?65.3:52.3,77.7,-3.7,3.7)},houseE(d))]}}]};
 // HOUSE F, the terrace house: three trays stepping up the slope (tray t at y 3.6 t, centred at z 6 - 5 t, w 16 - 3 t wide,
 // its floor's top y + .6, its roof's soffit y + 3.15, brick at the back and sides, glass at the front); in the decayed
 // states the top tray has gone. Each tray three rooms in a row, a door in each partition near the front; the street door
 // is in the first tray's east room, the second tray is entered from the first one's roof.
 const houseF=t=>{const fx=105,y=3.6*t,z=6-5*t,w=16-3*t,x0=fx-w/2+.5,x1=fx+w/2-.5,z0=z-3.35,z1=z+3.6,n=t<2?3:2,rooms=[],walls=[];
  for(let i=0;i<n;i++){const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n;rooms.push({poly:rect(a,b,z0,z1),door:[i?a:b,z1-1.1],hall:t===0&&i===n-1});
   if(i)walls.push({a:[a,z0],b:[a,z1-1.1],door:'b'},{a:[a,z1-1.1],b:[a,z1],door:'a'});}
  return{y:y+.6,h:3.6,clear:2.55,noSlab:true,outline:rect(x0,x1,z0,z1),rooms,walls,entrance:t===0?{at:[fx+4,z1+.1],th:Math.PI/2,leaf:false}:null};};
 T.houseF={name:'House F — the terrace house',masses:d=>[{id:'trays',at:[0,0],K:{seed:170,body:.6,top:()=>12,layout:'rooms',levels:()=>[0,1,2].filter(t=>!(d>0&&t===2)).map(houseF)}}]};
 // THE WELL's kiosk: a dome (radius 5, 7 high) at (34, -20) on the forecourt (top .6), its arch on -x. One room.
 T.fuel={name:'Fuel station — the kiosk',masses:()=>[{id:'kiosk',at:[0,0],door:(E,S)=>doorLanding(E,0,S.y),K:{seed:920,body:.6,top:()=>7,layout:'rooms',
  levels:()=>[{y:.6,h:5,clear:5,noSlab:true,outline:circle(34,-20,4.2,24),rooms:[{poly:circle(34,-20,4.2,24),door:[29.9,-20]}],walls:[],entrance:{at:[29.8,-20],th:Math.PI,w:.8,h:1.5}}]}}]};
 // ---- the Ancients transplants (77z-iziz-style.js: the Ancient halves; the city places them at about twice their size)
 // Each: its lining (the skin at .9 to .92 of the lathe's radius), its window rows, its top (the wreck's cut: extra.top).
 // the lining of a lathe with flutes (32-surfaces.js lathe: r * (1 + amp * (.5 + .5 cos(n th))^sharp)), at k of its radius
 const ring=(rFn,k,fl)=>y=>{const o=[],N=fl?fl[0]*8:48;for(let i=0;i<N;i++){const t=i/N*TAU,f=fl?1+fl[1]*Math.pow(.5+.5*Math.cos(t*fl[0]),fl[2]):1;o.push([rFn(y)*k*f*Math.cos(t),rFn(y)*k*f*Math.sin(t)]);}return o;};
 const TR={
  t_setback:{name:'Setback tower',seed:61,body:4.7,H:44,rows:{pitch:3.4,phase:1.5},shaft:{y0:0,r:()=>3,open:true},
   outline:ring(y=>{const t=clamp((y-4)/40,0,1);return 3.6+1.6*Math.pow(Math.abs(t-.4)/.6,1.6);},.9,[14,.09,2.5])},
  t_pent:{name:'Pentagon block',seed:63,body:0,H:20,rows:{pitch:4,phase:0},outline:ring(y=>5*(1-.12*y/20),.92,[5,.32,1])},
  t_hept:{name:'Heptagon block',seed:64,body:0,H:18,rows:{pitch:4,phase:1},outline:ring(y=>5*(1-.2*y/18),.92,[7,.3,1])},
  t_midrise:{name:'Midrise',seed:66,body:0,H:22,rows:{pitch:4.2,phase:0},outline:ring(y=>4.2*(1-.25*y/22),.92,[8,.3,1])},
  t_wedge:{name:'Wedge block',seed:65,body:0,H:22,rows:{pitch:22/9,phase:0},door:Math.PI/2,
   outline:y=>{const v=clamp(y/22,0,1),hx=5*(1-.45*v)-.45,zb=-7*(1-.05*v)+.3,zf=7*(1-.9*v)+.3*Math.sin(Math.PI*v)-.3;return rect(-hx,hx,zb,Math.max(zb+1,zf));}}};
 for(const k in TR){const D=TR[k];T[k]={name:D.name+' — Ancients transplant',masses:(d,extra)=>[{id:'body',at:[0,0],K:{seed:D.seed,body:Math.max(D.body,extra&&extra.floor!=null?extra.floor:0),top:()=>Math.min(D.H,extra&&extra.top!=null?extra.top:D.H),
  rows:D.rows,lobby:'body',door:D.door,openRooms:true,shaft:D.shaft,outline:(y,n)=>D.outline(y)}}]};}
 // the stepped setback tower: three tiers (radius 3.6, 2.5, 1.5; 24.8, 9.6 and 6.4 high, a 1.8 m glass band between), the
 // storeys of a tier between its floor and its roof; a tier's first floor is the roof of the one below (`floor`: the slab is
 // the wider outline)
 const TIERS=[[3.6,24.8],[2.5,9.6],[1.5,6.4]];
 T.t_setback2={name:'Setback tower (stepped) — Ancients transplant',masses:(d,extra)=>[{id:'body',at:[0,0],K:{seed:62,body:0,top:()=>Math.min(44.4,extra&&extra.top!=null?extra.top:44.4),lobby:'body',openRooms:true,
  levels:(dd,s)=>{const top=Math.min(44.4,extra&&extra.top!=null?extra.top:44.4),f0=extra&&extra.floor!=null?extra.floor:0,L=[];let y=0;
   TIERS.forEach((t,i)=>{const [r,hh]=t,y1=y+hh-.2,o=circle(0,0,r*.9*(1-.06),48),fo=i?circle(0,0,TIERS[i-1][0]*.9*(1-.06),48):null,n=Math.max(1,Math.round((y1-y)*s/3.1)),h=(y1-y)/n;
    for(let k=0;k<n;k++){const yy=!i&&!k?Math.max(y,f0):y+k*h,hh2=y+(k+1)*h-yy;if(yy+hh2>top+1e-6)break;L.push({y:yy,h:hh2,lobby:!i&&!k,outline:o,floor:!k&&fo?fo:null});}
    y+=hh+(i<2?1.8:0);});return L;}}}]};
 // the barrel house: a parabolic vault (7.2 wide, 6 high, 9.6 long) with a door arch in each end; storeys of 1.5 (3.9 m)
 // while the vault is wide enough
 T.t_barrel={name:'Barrel house — Ancients transplant',masses:(d,extra)=>[{id:'vault',at:[0,0],K:{seed:67,body:0,top:()=>Math.min(6,extra&&extra.top!=null?extra.top:6),lobby:'body',openRooms:true,
  levels:()=>{const top=Math.min(6,extra&&extra.top!=null?extra.top:6),f0=extra&&extra.floor!=null?extra.floor:0,L=[];for(let k=0;k<3;k++){const y=k?k*1.5:f0,hx=3.4*Math.sqrt(Math.max(0,1-(y+1.5)/5.75))-.2;if(y+1.5>top||hx<1.2)break;
   L.push({y,h:(k+1)*1.5-y,lobby:!k,outline:rect(-hx,hx,-4.5,4.5)});}return L;}}}]};
 // ================================================================= THE OWNER'S ROSTER (2026-10-19, on the interiors sheet)
 // "exile the ancient houses and terrace stack. bring in fin, bridge house, undulant house; star lab; bridge house can use a
 // rusty variant of the rehabilitated form. exile sky c (except toppled and tripod market). pull in undulant flatiron but do
 // quality pass ... we may need to make a version of the column cluster with larger, more intentionally designed-for-rooms
 // columns. pull in and make interior for cultural center and hotel." The alternates (kits/ancients 8aj, 8ak) are full
 // size; the city places them at 0.75 to 1, the flatiron at the towers' 0.3, the hotel and the cultural centre at about
 // half and a quarter.
 const CORE=[-1.6,1.6,-2.1,2.1],HOLE=[-1.1,1.1,-2.1,1.0],CELLW=3.4,SLUMN=12;
 const kindAt=(d,j,lobby,nLobby)=>lobby?'lobby':d!==3?'rubble':j-nLobby<SLUMN?'slum':'junk';
 const CK={slum:'cottage',junk:'store',rubble:'rubble',lobby:'hall'};
 // the kit's hole rule for a partition (78s's, so a plan here breaks its walls as the towers' do)
 const breaker=(fbm,d,s,seed,kind)=>{const thr=Math.min(.9,.34*d*(d===3?.55:1));return(u,yy)=>{if(kind==='slum'||kind==='lobby')return 0;
  const v=fbm(u*4.5*.35+seed*.31,yy/s*.028*3,seed,3);if(v>=thr)return 0;const f=v/thr;return f<.35?-1:clamp(.15+.7*(f-.35),.15,.85);};};
 const R3=v=>+v.toFixed(3),P3=p=>[R3(p[0]),R3(p[1])];
 // A STOREY ON AN ARC (the fin apartments, the hotel), in world metres: P(r, a) = c + r (sin a, cos a). o: {j, y, h, kind,
 // broke, c, a0, a1, rA, rB (the lining, inner and outer), corr [r0, r1] (the corridor; null: halls the whole depth),
 // core {a, r} (the stair core along the arc, its doors at both ends on the corridor), alive(u), floor [r0, r1] (the slab,
 // when wider than the lining), door {a, side: -1 (on rA) | 1 (on rB)}}
 function polar(o){const P=(r,a)=>[R3(o.c[0]+r*Math.sin(a)),R3(o.c[1]+r*Math.cos(a))],A=u=>o.a0+(o.a1-o.a0)*u,lobby=o.kind==='lobby';
  const ac=o.core.a,rc=o.core.r,dc=2.6/rc,inCore=(a,b)=>b>ac-dc&&a<ac+dc,cells=[],walls=[],cp=[];
  const band=(r0,r1)=>{const q=[],n=24;for(let i=0;i<=n;i++)q.push(P(r1,A(i/n)));for(let i=n;i>=0;i--)q.push(P(r0,A(i/n)));return q;};
  const rm=(o.rA+o.rB)/2,n=Math.max(2,Math.round(rm*(o.a1-o.a0)/(lobby?10:CELLW))),alive=u=>!o.alive||o.alive(u);
  const live=i=>i>=0&&i<n&&!inCore(A(i/n),A((i+1)/n))&&alive((i+.5)/n);
  const sides=lobby||!o.corr?[[o.rA,o.rB,'h',null]]:[[o.rA,o.corr[0],'i',o.corr[0]],[o.corr[1],o.rB,'o',o.corr[1]]].filter(b=>b[1]-b[0]>=1.8);
  for(const [r0,r1,tag,dr] of sides)for(let i=0;i<n;i++){if(!live(i))continue;const a=A(i/n),b=A((i+1)/n),m=(a+b)/2,g=(tag==='o'?0:300)+i,poly=[];
   for(let k=0;k<=3;k++)poly.push(P(r0,a+(b-a)*k/3));for(let k=3;k>=0;k--)poly.push(P(r1,a+(b-a)*k/3));
   const door=dr==null?P((r0+r1)/2,a):P(dr,m);cells.push({id:'s'+o.j+tag+i,poly,door,kind:lobby?'hall':CK[o.kind],open:lobby});
   if(dr!=null)walls.push({a:P(dr,a),b:door,kind:'front',broken:o.broke(g+.25,o.y),door:'b'},{a:door,b:P(dr,b),kind:'front',broken:o.broke(g+.75,o.y),door:'a'});
   if(i>0){if(dr==null){const mm=(r0+r1)/2;if(live(i-1))walls.push({a:P(r0,a),b:P(mm,a),kind:'radial',broken:0,door:'b'},{a:P(mm,a),b:P(r1,a),kind:'radial',broken:0,door:'a'});else walls.push({a:P(r0,a),b:P(r1,a),kind:'radial',broken:0});}
    else walls.push({a:P(r0,a),b:P(r1,a),kind:'radial',broken:o.broke(g,o.y)});}
   if(i<n-1&&!live(i+1))walls.push({a:P(r0,b),b:P(r1,b),kind:'radial',broken:dr==null?0:o.broke(g+1,o.y)});}
  if(o.corr&&!lobby)for(const [u0,u1] of[[o.a0,ac-dc],[ac+dc,o.a1]]){const q=[];for(let k=0;k<=8;k++)q.push(P(o.corr[0],u0+(u1-u0)*k/8));for(let k=8;k>=0;k--)q.push(P(o.corr[1],u0+(u1-u0)*k/8));cp.push(q);}
  const rot=Math.atan2(-Math.cos(ac),-Math.sin(ac)),at=P(rc,ac),cr=Math.cos(rot),sr=Math.sin(rot),Q=p=>[R3(at[0]+p[0]*cr-p[1]*sr),R3(at[1]+p[0]*sr+p[1]*cr)],C=CORE;
  walls.push({a:Q([C[0],C[2]]),b:Q([C[0],C[3]]),kind:'core',broken:0},{a:Q([C[1],C[2]]),b:Q([C[1],C[3]]),kind:'core',broken:0});
  for(const z of[C[2],C[3]])walls.push({a:Q([C[0],z]),b:Q([-.5,z]),kind:'core',broken:0},{a:Q([.5,z]),b:Q([C[1],z]),kind:'core',broken:0});
  let entrance=null;if(lobby&&o.door){const r=o.door.r!=null?o.door.r:o.door.side>0?o.rB:o.rA,a=o.door.a,nx=Math.sin(a)*o.door.side,nz=Math.cos(a)*o.door.side;entrance={at:P(r,a),w:2.0,ry:R3(Math.atan2(nx,nz))};}
  return{j:o.j,y:R3(o.y),h:R3(o.h),k:0,kind:o.kind,rot:R3(rot),at,doors:['+z','-z'],layout:'polar',outline:band(o.rA,o.rB),floorOutline:o.floor?band(o.floor[0],o.floor[1]):null,
   core:CORE.slice(),corridor:null,corridorPolys:cp,holes:o.j?[{r:HOLE.slice(),at,rot:R3(rot)}]:[],entrance,cells,walls};}
 // a plan of polar storeys: levels [{y, h, lobby, rA, rB, corr, floor, alive(u)}] in kit units about c (kit units)
 function polarPlan(D,d,s,fbm,levels){const L=levels.filter(l=>l),nL=L.filter(l=>l.lobby).length,storeys=[];
  L.forEach((l,j)=>{const kind=kindAt(d,j,l.lobby,nL);
   storeys.push(polar({j,y:l.y*s,h:l.h*s,kind,broke:breaker(fbm,d,s,D.seed,kind),c:[D.c[0]*s,D.c[1]*s],a0:D.a0,a1:D.a1,rA:l.rA*s,rB:l.rB*s,
    corr:l.corr?[l.corr[0]*s,l.corr[1]*s]:null,core:{a:D.core.a,r:D.core.r*s},alive:l.alive,floor:l.floor?[l.floor[0]*s,l.floor[1]*s]:null,door:D.door}));});
  storeys.forEach((S,i)=>{S.rise=R3((i+1<storeys.length?storeys[i+1].y:S.y+S.h)-S.y);});
  return{storeys,shafts:[],stairs:{core:CORE,hole:HOLE,storey:3.2}};}
 // ---- post-passes on a mass's plan: cells left out (a fallen part), a well added, the doors laid into their walls' planes
 const inPoly=(p,Q)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2,0,1):0;return[Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t),[a[0]+dx*t,a[1]+dz*t]];};
 const centroid=Q=>[Q.reduce((s,p)=>s+p[0],0)/Q.length,Q.reduce((s,p)=>s+p[1],0)/Q.length];
 // keep(cell, storey) false: the cell goes, and with it every wall that no longer bounds a cell
 function cull(P,keep){for(const S of P.storeys){const n0=S.cells.length;S.cells=S.cells.filter(c=>keep(c,S));if(S.cells.length===n0)continue;
  S.walls=S.walls.filter(w=>{if(w.kind==='core')return true;const m=[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2];
   return S.cells.some(c=>inPoly(m,c.poly)||c.poly.some((p,i)=>segD(m,p,c.poly[(i+1)%c.poly.length])[0]<.35));});}}
 // a street door in its wall's plane: on the nearest edge of the storey's outline, facing out along that edge's normal
 function doorsToGaps(P){for(const S of P.storeys){const gaps=S.walls.filter(w=>w.kind==='front'&&w.door==='b').map(w=>w.b);if(!gaps.length)continue;
  for(const c of S.cells){if(c.open)continue;if(gaps.some(g=>Math.hypot(g[0]-c.door[0],g[1]-c.door[1])<.3))continue;let best=null,bd=1e9;
   for(const g of gaps){let e=1e9;for(let i=0;i<c.poly.length;i++)e=Math.min(e,segD(g,c.poly[i],c.poly[(i+1)%c.poly.length])[0]);if(e>.35)continue;
    const dd=Math.hypot(g[0]-c.door[0],g[1]-c.door[1]);if(dd<bd){bd=dd;best=g;}}
   if(best)c.door=P3(best);}}}
 function doorsInPlane(P){doorsToGaps(P);const fix=(E,O)=>{if(!E||!O||O.length<3)return;const c=centroid(O);let best=null;
   for(let i=0;i<O.length;i++){const a=O[i],b=O[(i+1)%O.length],r=segD(E.at,a,b);if(!best||r[0]<best.d)best={d:r[0],p:r[1],a,b};}
   if(!best||best.d>3)return;let nx=best.b[1]-best.a[1],nz=-(best.b[0]-best.a[0]);const L=Math.hypot(nx,nz)||1;nx/=L;nz/=L;
   if(nx*(best.p[0]-c[0])+nz*(best.p[1]-c[1])<0){nx=-nx;nz=-nz;}E.at=P3(best.p);E.ry=R3(Math.atan2(nx,nz));};
  for(const S of P.storeys)fix(S.entrance,S.outline);}
 // a street door moved out along its bearing from the mass's centre to the shell at radius rs (world metres): the lining the
 // plan stands its rooms in is inside the shell, and a door belongs in the shell (the owner's door pass, 2026-10-19)
 const doorToShell=(E,rs)=>{const th=Math.atan2(E.at[1],E.at[0]);E.at=[R3(rs*Math.cos(th)),R3(rs*Math.sin(th))];return th;};
 // a door whose sill stands over a lower ground (the cultural centre's halls over their platform): a walk strip from the
 // ground 1.6 m out to the sill, [x, y, z] in the mass's frame (shift moves it with the mass)
 const doorLanding=(E,y0,y1)=>{const nx=Math.sin(E.ry),nz=Math.cos(E.ry);E.steps=false;E.path=[[R3(E.at[0]+nx*2.8),R3(y0),R3(E.at[1]+nz*2.8)],[R3(E.at[0]+nx*1.2),R3(y1),R3(E.at[1]+nz*1.2)],[R3(E.at[0]),R3(y1),R3(E.at[1])]];};
 // the threshold through a thick shell, from the door in the shell back to the lining the storey's floor stops at (rIn, world
 // metres from the mass's centre): a level walk strip, added to the door's path
 // (the lining's walk blocks are opened there: S.openings, which izIxDraw skips as it skips the street door)
 const doorThreshold=(E,rIn,y,S)=>{const th=Math.atan2(E.at[1],E.at[0]),r=rIn-.25,p=[R3(r*Math.cos(th)),R3(y),R3(r*Math.sin(th))];E.path=(E.path||[[R3(E.at[0]),R3(y),R3(E.at[1])]]).concat([p]);
  if(S)(S.openings=S.openings||[]).push({at:[R3(rIn*Math.cos(th)),R3(rIn*Math.sin(th))],w:R3(Math.max(1.2,E.w||1))});};
 // the cultural centre's: a level landing out of the door, then down across the platform (top 8.2) to its edge (radius 134
 // about the centre) and on down to the street; `c` the mass's centre in kit units
 const cultLanding=(E,S,s,c)=>{const nx=Math.sin(E.ry),nz=Math.cos(E.ry),gx=c[0]*s+E.at[0],gz=c[1]*s+E.at[1],R=134*s;
  const b=gx*nx+gz*nz,cc=gx*gx+gz*gz-R*R,t=Math.max(2,-b+Math.sqrt(Math.max(0,b*b-cc)));   /* how far along n to the platform's edge */
  const P=k=>[R3(E.at[0]+nx*k),0,R3(E.at[1]+nz*k)],Y=(p,y)=>[p[0],R3(y),p[2]];E.steps=false;
  E.path=[Y(P(t+3.2),0),Y(P(t),8.2*s),Y(P(1.2),S.y),Y(P(0),S.y)];};
 // ---- THE UNDULANT HOUSE (8ak adWave): a lobed superellipse 34 x 23 m, three storeys of 3.6 and an attic; its ground
 // floor's openings run to 2.9 m all round (the door is one, on +z). The ruin's east end has come down: a storey's cells
 // under the fallen top go. Floors, recess and arch are left out of the kit (IZS_HOLLOW.alt): ring round a stair core.
 const WA=17,WB=11.5,WH=3*3.6+.4,wRho=th=>se(th,2.6)*(1+.045*Math.cos(5*th+.6)),wPlan=(th,off)=>{const s=wRho(th),x=WA*s*Math.cos(th),z=WB*s*Math.sin(th),L=Math.hypot(x,z)||1;return[x+x/L*off,z+z/L*off];};
 const wFall=(th,brk)=>{if(!brk)return 0;let a=((th+Math.PI)%TAU+TAU)%TAU-Math.PI;const w=clamp(1-Math.abs(a+.25)/.95,0,1);return w>0?Math.pow(w,.6):0;};
 T.wave={name:'The Undulant house',masses:d=>[{id:'villa',at:[0,0],K:{seed:9850,body:.4,top:()=>WH,lobby:'body',openRooms:true,
  outline:()=>{const o=[];for(let i=0;i<64;i++)o.push(wPlan(i/64*TAU,-.7));return o;},
  levels:()=>[{y:.4,h:3.2,lobby:true},{y:3.6,h:3.6},{y:7.2,h:3.6}]},
  post:(P,s,fbm)=>{if(d!==1)return;const top=th=>WH-wFall(th,true)*(7.6+1.6*(fbm(th*3,1.1,9850,2)-.5));
   cull(P,(c,S)=>{const m=centroid(c.poly),th=Math.atan2(m[1]/WB,m[0]/WA);return S.y/s+S.h/s<=top(th)+.3;});}}]};
 // ---- THE BRIDGE HOUSE (8ak adBridge), always in its rehabilitated form (rusted in a ruined quarter): the six-sided tube,
 // 30 m long, its floor 5.05 up on the two wall-legs; four rooms either side of the stair hall over the glazed entrance box,
 // where a stair climbs from the street through the box (its roof left out) into the tube
 const bridgeRooms=()=>{const xs=[-14.2,-7.6,-1.8,1.8,7.6,14.2],z0=-4.5,z1=4.5,zd=2.9,rooms=[],walls=[];
  [[0,1],[1,2],[3,4],[4,5]].forEach(([i,k])=>rooms.push({poly:rect(xs[i],xs[k],z0,z1),door:[i<3?xs[k]:xs[i],zd]}));
  for(const x of[xs[1],xs[2],xs[3],xs[4]])walls.push({a:[x,z0],b:[x,zd],door:'b'},{a:[x,zd],b:[x,z1],door:'a'});
  return{rooms,walls,corridors:[rect(xs[2],xs[3],z0,z1)]};};
 T.bridge={name:'The Bridge house',masses:d=>[{id:'tube',at:[0,0],K:{seed:9855,body:5.05,top:()=>10.5,layout:'rooms',shaft:{y0:0,r:()=>2.8,open:true},
  levels:()=>[Object.assign({y:5.05,h:5.2,clear:5.2,outline:rect(-14.2,14.2,-4.5,4.5)},bridgeRooms())]},
  post:P=>{for(const S of P.storeys){S.holes=[{r:HOLE.slice(),at:[0,0],rot:0}];S.core=CORE.slice();}}}]};
 // ---- THE FIN APARTMENTS (8ak adFins): a slab 14 m deep on an arc of radius 150 about (0, 150), twelve storeys of 3.2,
 // its concave south face (r 150) the street's; a corridor down the middle, the core at the middle of the arc, cells either
 // side; the ruin's east third bitten to half height (the same noise as the kit's)
 T.fins={name:'The Fin apartments',custom:(d,s,fbm)=>{const brk=d===1,H=38.4,fall=ph=>{if(!brk)return 0;const t=clamp((ph-.06)/.16,0,1);return t*t*(3-2*t);},
   topY=ph=>H-fall(ph)*H*(.5+.12*(fbm(ph*14,2.2,9860,2)-.5)),D={seed:9860,c:[0,150],a0:Math.PI-.4,a1:Math.PI+.4,core:{a:Math.PI,r:157},door:{a:Math.PI-.06,side:-1}};
   const per=Math.max(1,Math.round(3.2/(3.2*s))),L=[],cw=.6/s;
   for(let f=0;f+per<=12;f+=per){const y=f*3.2,h=per*3.2;L.push({y,h,lobby:f===0,rA:150.9,rB:163.1,corr:[157-cw,157+cw],alive:u=>y+h<=topY(Math.PI-(D.a0+(D.a1-D.a0)*u))+.3});}
   return[{id:'slab',at:[0,0],plan:polarPlan(D,d,s,fbm,L)}];}};
 // ---- THE STAR LABORATORY (8ak adLab): the drum (radius 12, 18 high) on a plinth (top .6), four storeys round its stair
 // core, the third (8 m up) the lobby, which the ramp reaches through the portal on +z; six lobes 9 m square in section,
 // two rooms each, on the ground (floor .2) and lifted on piers (7.2), entered through doorways cut in the drum (IZS_HOLLOW.alt).
 // The ruin's south-east lifted lobe has fallen: no rooms in it.
 const lobeRooms=a=>{const c=Math.cos(a),s=Math.sin(a),T2=p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c],r0=11,r1=26.4,rm=19.4,w=4.1;
  return{rooms:[{poly:rect(r0,rm,-w,w).map(T2),door:T2([r0,0])},{poly:rect(rm,r1,-w,w).map(T2),door:T2([rm,1.6])}],walls:[{a:T2([rm,-w]),b:T2([rm,1.6]),door:'b'},{a:T2([rm,1.6]),b:T2([rm,w]),door:'a'}],outline:rect(r0,r1,-w,w).map(T2)};};
 T.adlab={name:'The Star laboratory',masses:d=>{const M=[{id:'drum',at:[0,0],K:{seed:9895,body:.6,top:()=>17.2,lobby:'body',openRooms:true,door:-Math.PI/2,outline:()=>circle(0,0,11,48),
   levels:()=>[{y:.6,h:3.7,lobby:true},{y:4.3,h:3.7},{y:8,h:4.6},{y:12.6,h:4.6}]},
   door:(E,S,s)=>{doorToShell(E,12*s);doorThreshold(E,11*s,S.y,S);},
   post:(P,s)=>{for(const S of P.storeys){const lv=Math.abs(S.y/s-.6)<.1?0:Math.abs(S.y/s-8)<.1?1:-1;if(lv<0)continue;S.openings=[];
    for(let i=0;i<6;i++){if(i%2!==lv||d===1&&i===5)continue;const a=Math.PI/2+Math.PI/6+i*Math.PI/3;S.openings.push({at:[R3(Math.cos(a)*11*s),R3(Math.sin(a)*11*s)],w:R3(2.6*s)});}}}}];
  for(let i=0;i<6;i++){if(d===1&&i===5)continue;const a=Math.PI/2+Math.PI/6+i*Math.PI/3,up=i%2===1,R=lobeRooms(a);
   M.push({id:'lobe'+i,at:[0,0],K:{seed:9896+i,body:up?8:.6,top:()=>up?16:9,layout:'rooms',levels:()=>[Object.assign({y:up?8:.6,h:4.4,clear:4.4},R)]},
    post:(P,s)=>{for(const S of P.storeys)S.openings=[{at:[R3(Math.cos(a)*11*s),R3(Math.sin(a)*11*s)],w:R3(2.6*s)}];}});}
  return M;}};
 // ---- THE UNDULANT FLATIRON (8aj adFlat): a filleted triangle (106 x 74 m; its prow at x 62) of 34 floors, the ground
 // floor 6.2 m (an arcade, the glass wall 3.4 m in), floors every 4.2; three floors a storey at the towers' 0.3. Ring round a
 // core at the triangle's centre (x -8.7). The ruin's prow is down to 50 m, the floors stepping back from the break.
 const FLAT=(()=>{const C=[[62,0],[-44,37],[-44,-37]],RAD=[8,13,13],o=[];
  for(let i=0;i<3;i++){const A=C[(i+2)%3],B=C[i],D=C[(i+1)%3],n=v=>{const L=Math.hypot(v[0],v[1]);return[v[0]/L,v[1]/L];};
   const u1=n([A[0]-B[0],A[1]-B[1]]),u2=n([D[0]-B[0],D[1]-B[1]]),ph=Math.acos(u1[0]*u2[0]+u1[1]*u2[1])/2,r=RAD[i];
   const bi=n([u1[0]+u2[0],u1[1]+u2[1]]),O=[B[0]+bi[0]*r/Math.sin(ph),B[1]+bi[1]*r/Math.sin(ph)],t=r/Math.tan(ph);
   const T1=[B[0]+u1[0]*t,B[1]+u1[1]*t],T2=[B[0]+u2[0]*t,B[1]+u2[1]*t];let a1=Math.atan2(T1[1]-O[1],T1[0]-O[0]),a2=Math.atan2(T2[1]-O[1],T2[0]-O[0]);
   while(a2<a1)a2+=TAU;if(a2-a1>Math.PI)a2-=TAU;for(let k=0;k<=6;k++){const a=a1+(a2-a1)*k/6;o.push([O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)]);}}return o;})();
 const FCX=-8.7,flatIn=k=>FLAT.map(p=>{const dx=p[0]-FCX,dz=p[1],L=Math.hypot(dx,dz);return[dx-dx/L*k,dz-dz/L*k];});
 T.flat={name:'The Undulant flatiron',masses:d=>[{id:'tower',at:[FCX,0],K:{seed:9830,body:0,top:()=>6.2+33*4.2,rows:{pitch:4.2,phase:6.2},lobby:'body',openRooms:true,
  outline:y=>flatIn(y<6.2?4.2:2.4)},
  post:(P,s)=>{if(d!==1)return;cull(P,(c,S)=>{const m=centroid(c.poly),ds=Math.hypot(m[0]/s+FCX-62,m[1]/s);if(ds>=46)return true;
   return (S.y+S.h)/s<=50+34*Math.pow(ds/46,1.6);});}}]};
 // ---- THE HOTEL (75-hotel, the Terraces): a crescent of radius 90 about (0, -63), fourteen storeys of 4.2 stepping back
 // up its court side (storey f's back wall at 90 - (34 - 1.9 f), the glass at 89.2); placed at about half size, a storey of
 // the world's is two of the hotel's (the slabs between kept only as the court's terraces: IZS_HOLLOW.hotel). A corridor
 // along the back wall, the rooms out to the glass, the core near the west horn; the lobby's door on the glass front. A
 // decayed hotel loses its top storeys (its cut is the kit's dice: the plan stops below the lowest), the ruin its east horn.
 T.hotel={name:'Hotel — the Terraces',custom:(d,s,fbm)=>{const R=90,depth=f=>34-f*1.9,WR=f=>R-depth(Math.min(f,13)),deckR=f=>f>0?WR(f-1)-1.2:WR(0)-2;
   const fl=u=>d===1&&u>.72?3+Math.floor((1-u)/.28*10*(.85+.3*fbm(u*9,1,2041,2))):99,D={seed:9250,c:[0,-63],a0:-.9,a1:.9,core:{a:-.76,r:R-5.5},door:{a:-.62,side:1,r:R-.8}};
   const L=[],last=d>0?8:12,cw=1.3/s;
   for(let f=0;f<=last;f+=2){const rA=WR(f+1)+.3;L.push({y:f*4.2,h:8.4,lobby:f===0,rA,rB:R-1.2,corr:[rA,rA+cw],floor:[deckR(f),R+1.5],alive:u=>f+1<fl(u)});}
   return[{id:'crescent',at:[0,0],plan:polarPlan(D,d,s,fbm,L)}];}};
 // ---- THE CULTURAL CENTRE (67-cultural, the Wheel), compact (IZS_HOLLOW.cultural): the great hall (a fluted dome of radius
 // 52 on the platform, its base 11 up) in storeys of 3.2 m round a stair core, its door on +z; and each hall of the first ring
 // the kit built (extra.halls: CULT_HALLS) a slim drum, its door facing out (the campaniles are too narrow for a stair)
 const gr=y=>52*Math.pow(clamp(1-Math.pow(y/64,2),0,1),.58);
 T.cultural={name:'Cultural centre — the Wheel',masses:(d,extra,s)=>{const M=[{id:'hall',at:[0,0],K:{seed:9391,body:11,top:()=>11+(d===1?64*.62:64),lobby:'body',openRooms:true,door:105*Math.PI/180,
   outline:y=>circle(0,0,Math.max(4,.86*gr(y-11)-1.5),64),
   levels:(dd,ss)=>{const h=3.2/ss,L=[];for(let y=11,k=0;;y+=h,k++){const top=y+h;if(top>11+(d===1?64*.62-3:60)||.86*gr(top-11)-1.5<6)break;L.push({y,h,lobby:!k});}return L;}},
   door:(E,S,s)=>{doorToShell(E,52*s);cultLanding(E,S,s,[0,0]);doorThreshold(E,(.86*gr(S.h/s)-1.5)*s,S.y,S);}}];   /* the dome's foot, over the platform (top 8.2) */
  ((extra&&extra.halls)||[]).forEach((H,i)=>{if(H.r*.8*(s||.25)<2.3)return;M.push({id:'drum'+i,at:[H.x,H.z],K:{seed:9393+i,body:H.py,top:()=>H.py+H.h-.5,lobby:'body',layout:'slim',door:H.a,
   outline:()=>circle(0,0,H.r*.8,32),levels:(dd,ss)=>{const n=Math.max(1,Math.floor((H.h-.8)*ss/2.9)),h=(H.h-.8)/n,L=[];for(let k=0;k<n;k++)L.push({y:H.py+k*h,h,lobby:!k});return L;}},
   door:(E,S,s)=>{const th=Math.atan2(E.at[1],E.at[0]);doorToShell(E,H.r*(1+.22*(.5+.5*Math.cos(6*th)))*s);cultLanding(E,S,s,[H.x,H.z]);doorThreshold(E,H.r*.8*s,S.y,S);}});});
  return M;}};
 // ---- APARTMENTS C2 (82-apartments buildAptsC2): four drums 30 m across from the ground, a storey every two window bands
 // (8 kit metres), a ring of cells round each one's stair core, a door at each foot facing out of the cluster
 const APC2=[[0,0,48],[38,10,36],[-34,16,40],[6,-38,32]];
 T.aptsC2={name:'Apartments C2 — the column cluster, rooms',masses:d=>APC2.map((c,i)=>({id:'col'+i,at:[c[0],c[1]],K:{seed:760+i,body:0,top:()=>d===1&&i===1?c[2]*.5:c[2],
  rows:{pitch:4,phase:0},lobby:'body',openRooms:true,door:Math.atan2(c[1]+3,c[0]-2.5),outline:()=>circle(0,0,15*.82,48)}}))};
 // ---- the plan
 function shift(P,at){if(!at[0]&&!at[1])return P;const m=p=>[+(p[0]+at[0]).toFixed(3),+(p[1]+at[1]).toFixed(3)],pm=q=>q.map(m);
  for(const S of P.storeys){S.at=m(S.at||[0,0]);S.outline=pm(S.outline);if(S.floorOutline)S.floorOutline=pm(S.floorOutline);S.corridorPolys=(S.corridorPolys||[]).map(pm);
   (S.holes||[]).forEach(H=>H.at=m(H.at));if(S.entrance){S.entrance.at=m(S.entrance.at);if(S.entrance.path)S.entrance.path=S.entrance.path.map(p=>[R3(p[0]+at[0]),p[1],R3(p[2]+at[1])]);}
   S.cells.forEach(c=>{c.poly=pm(c.poly);c.door=m(c.door);});S.walls.forEach(w=>{w.a=m(w.a);w.b=m(w.b);});}
  for(const sh of P.shafts||[])for(const st of sh){st.at=m(st.at);if(st.entrance)st.entrance.at=m(st.entrance.at);(st.cells||[]).forEach(c=>{c.poly=pm(c.poly);c.door=m(c.door);});}
  return P;}
 function plan(type,d,s,noise,extra){const B=T[type];if(!B||!(s>0))return null;const masses=[];
  // a building of storeys on arcs plans itself (polarPlan), in world metres already
  if(B.custom){for(const M of B.custom(d,s,noise||((x,y,z)=>.5),extra)){if(!M.plan.storeys.length)continue;doorsInPlane(M.plan);masses.push(M);}return masses.length?{type,name:B.name,d,s,masses}:null;}
  for(const M of B.masses(d,extra,s)){const P=IZTOWER.plan(type+'.'+M.id,d,s,noise,M.K);if(!P||!P.storeys.length)continue;
   if(M.post)M.post(P,s,noise||((x,y,z)=>.5));
   doorsInPlane(P);if(M.door)for(const S of P.storeys)if(S.entrance)M.door(S.entrance,S,s);
   // the house levels' clear height (under a roof the kit draws) and the floor a tier's first storey stands on
   const lv=M.K.levels?M.K.levels(d,s):null;
   if(lv)P.storeys.forEach((S,i)=>{const L=lv[i];if(!L)return;if(L.clear)S.clear=+(L.clear*s).toFixed(3);if(L.floor)S.floorOutline=L.floor.map(p=>[+(p[0]*s).toFixed(3),+(p[1]*s).toFixed(3)]);
    if(L.entrance&&L.entrance.path&&S.entrance)S.entrance.path=L.entrance.path.map(p=>[+(p[0]*s).toFixed(3),+(p[1]*s).toFixed(3),+(p[2]*s).toFixed(3)]);});
   masses.push({id:M.id,at:[+(M.at[0]*s).toFixed(3),+(M.at[1]*s).toFixed(3)],plan:shift(P,[M.at[0]*s,M.at[1]*s])});}
  return masses.length?{type,name:B.name,d,s,masses}:null;}
 return{plan,T,TYPES:Object.keys(T)};})();
