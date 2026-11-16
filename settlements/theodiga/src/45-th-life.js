/* ================================================================= THEODIGA TODAY: people and lamps (records; draws nothing)
   [G data] T-life-1 (the owner, 2026-11-16: "do all remaining steps of build"; kits/ancients KNOWN_ISSUES "Nobody on the ways or in
   the works", "The town has no ... people, no lamps at night"). Who is out, and where the lamps stand, in the dam's frame:
     the town     townsfolk along the streets (core/city's ways), a figure for about every 25 of the census, never inside a
                  building's box; more on Gate Square, where the pilgrims gather at the head of the Stair of Descent
     the ways     pilgrims going down the Stair of Descent and along the Salvage and Silt Roads, salvagers on the Salvage Road
     the crest    pilgrims walking the middle kora (the promenade between the crest's blocks, 400 m) from the Pilgrims' Gate to
                  the Pilgrims' Stairs, and on the Dome's deck
     the works    salvagers in the yards, farmers in the silt fields, the Rare Devisers and their haulers at the bore
   Lamps: a post every 30 m along each street's side (alternating sides), at the corners of Gate Square, along the kora on the
   crest, and at the bore's mouth; each lit at night (the kit's night embers).
   Every draw is KRAND-hashed by the place's id and the slot's index, never by how many draws came before it.
   TH_LIFE.make(o) -> {people:[{id, role, x, y, z, ry}], lamps:[{id, x, y, z, h}]}
     o.ways [{id, w, cls, pts}] the town's streets; o.lots [{x, z, w, d, ry}] every building's box (town and works);
     o.ground(x, z) the town's; o.square {x0, x1, z0, z1, y}; o.census {people}; o.seed (2211)
     o.descent {stair, salvage, silt}: each {segs:[{a:[x,y,z], b, w}]}; o.kora {x0, x1, zc(x), y, z0, z1}: the promenade's
     band at x (z from zc(x)+z0 to zc(x)+z1) and its floor; o.deck {cx, cz, r, y, hall}: the Dome's deck
     o.works {fields, bore, track}, o.floor(x, z), o.bed(x, z) */
var TH_LIFE=(function(){
 const U=(seed,a,b)=>KRAND.unit(KRAND.hash(seed,a,b));
 /* a string id to a number for KRAND (FNV-1a) */
 const hid=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
 const inBox=(L,x,z,m)=>{const c=Math.cos(L.ry||0),s=Math.sin(L.ry||0),dx=x-L.x,dz=z-L.z,u=dx*c-dz*s,v=dx*s+dz*c;return Math.abs(u)<=L.w/2+m&&Math.abs(v)<=L.d/2+m;};
 function make(o){const seed=o.seed==null?2211:o.seed,people=[],lamps=[],lots=o.lots||[];
  const free=(x,z,m)=>!lots.some(L=>Math.abs(L.x-x)<L.w+L.d&&Math.abs(L.z-z)<L.w+L.d&&inBox(L,x,z,m));
  const near=(x,z,r)=>people.some(p=>Math.abs(p.x-x)<r&&Math.abs(p.z-z)<r&&Math.hypot(p.x-x,p.z-z)<r);
  const add=(role,id,x,y,z,ry)=>{people.push({id,role,x,y,z,ry});};
  /* a polyline's length, and the point and heading at distance s along it */
  const along=(P,s)=>{for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s<=l||i===P.length-1){const t=l?Math.min(1,s/l):0;
    return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,dx:(b[0]-a[0])/(l||1),dz:(b[1]-a[1])/(l||1)};}s-=l;}return null;};
  const lenOf=P=>{let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return L;};
  // ---- THE TOWN: townsfolk on the streets, about one figure for every 25 people, spread by each street's length ----------
  const ways=(o.ways||[]).filter(w=>w.pts&&w.pts.length>1),total=ways.reduce((s,w)=>s+lenOf(w.pts),0),want=Math.round((o.census&&o.census.people||0)/25);
  for(const w of ways){const L=lenOf(w.pts),n=Math.round(want*L/(total||1)),sid=hid(w.id);
   for(let k=0;k<n;k++){const s=U(seed,sid,k*3+1)*L,P=along(w.pts,s);if(!P)continue;const off=(U(seed,sid,k*3+2)-.5)*Math.max(1,w.w-1.2),x=P.x-P.dz*off,z=P.z+P.dx*off;
    if(!free(x,z,.6)||near(x,z,.9))continue;
    add('townsfolk',w.id+'.p'+k,x,o.ground(x,z),z,Math.atan2(P.dx,P.dz)+(U(seed,sid,k*3+3)<.5?0:Math.PI));}
   /* the lamps: a post every 30 m, alternating sides, a step in from the street's edge */
   for(let s=15,k=0;s<L;s+=30,k++){const P=along(w.pts,s),side=k%2?1:-1,off=side*(w.w/2-.4),x=P.x-P.dz*off,z=P.z+P.dx*off;
    if(!free(x,z,.4))continue;lamps.push({id:w.id+'.lamp'+k,x,y:o.ground(x,z),z,h:3.6});}}
  // ---- GATE SQUARE: pilgrims gathering at the head of the Stair of Descent, its four lamps -------------------------------
  if(o.square){const Q=o.square,sid=hid('square');
   for(let k=0;k<60;k++){const x=Q.x0+2+U(seed,sid,k*3+1)*(Q.x1-Q.x0-4),z=Q.z0+2+U(seed,sid,k*3+2)*(Q.z1-Q.z0-4);
    if(!free(x,z,.6)||near(x,z,1))continue;add(U(seed,sid,k*3+3)<.6?'pilgrim':'townsfolk','th.life.square.p'+k,x,o.ground(x,z),z,U(seed,sid,k*3+3)*2*Math.PI);}
   for(const [x,z] of [[Q.x0+1,Q.z0+1],[Q.x1-1,Q.z0+1],[Q.x1-1,Q.z1-1],[Q.x0+1,Q.z1-1]])if(free(x,z,.4))lamps.push({id:'th.life.square.lamp'+lamps.length,x,y:o.ground(x,z),z,h:4.2});}
  // ---- THE WAYS: pilgrims on the Stair of Descent and the roads, salvagers on the Salvage Road -------------------------
  if(o.descent)for(const [key,role2,n] of [['stair','pilgrim',24],['salvage','salvager',22],['silt','farmer',10]]){const D=o.descent[key];if(!D)continue;
   const segs=D.segs||[],sid=hid('way.'+key);
   for(let k=0;k<n&&segs.length;k++){const S=segs[Math.floor(U(seed,sid,k*4+1)*segs.length)],t=.1+.8*U(seed,sid,k*4+2),off=(U(seed,sid,k*4+3)-.5)*(S.w-1);
    const x=S.a[0]+(S.b[0]-S.a[0])*t+off,y=S.a[1]+(S.b[1]-S.a[1])*t,z=S.a[2]+(S.b[2]-S.a[2])*t;
    if(near(x,z,.9))continue;add(key==='salvage'&&U(seed,sid,k*4+4)<.4?'pilgrim':role2,'th.life.way.'+key+'.p'+k,x,y,z,Math.atan2(S.b[0]-S.a[0],S.b[2]-S.a[2])+(U(seed,sid,k*4+4)<.5?0:Math.PI));}}
  // ---- THE CREST: pilgrims walking the middle kora; lamps along it; pilgrims on the Dome's deck --------------------------
  if(o.kora){const K=o.kora,sid=hid('kora');
   for(let k=0;k<70;k++){const x=K.x0+U(seed,sid,k*3+1)*(K.x1-K.x0),zc=K.zc(x),z=zc+K.z0+.8+U(seed,sid,k*3+2)*(K.z1-K.z0-1.6);
    if(!free(x,z,.6)||near(x,z,1))continue;add('pilgrim','th.life.kora.p'+k,x,K.y,z,Math.PI/2*(U(seed,sid,k*3+3)<.7?-1:1));}
   for(let x=K.x0+10,k=0;x<K.x1;x+=22,k++){const z=K.zc(x)+(k%2?K.z1-.6:K.z0+.6);if(free(x,z,.3))lamps.push({id:'th.life.kora.lamp'+k,x,y:K.y,z,h:3.2});}}
  if(o.deck){const Dk=o.deck,sid=hid('deck');
   for(let k=0;k<50;k++){const a=U(seed,sid,k*3+1)*2*Math.PI,r=Dk.hall+3+U(seed,sid,k*3+2)*(Dk.r-Dk.hall-10),x=Dk.cx+r*Math.cos(a),z=Dk.cz+r*Math.sin(a);
    if((Dk.open&&Dk.open(x,z))||!free(x,z,.6)||near(x,z,1))continue;add('pilgrim','th.life.deck.p'+k,x,Dk.y,z,a+Math.PI);}}
  // ---- THE WORKS: salvagers in the yards, farmers in the fields, the Devisers and their haulers at the bore ------------
  if(o.works){const W=o.works,T=W.track,sid=hid('works');
   if(T)for(let k=0;k<26;k++){const x=T.b[0]+U(seed,sid,k*3+1)*(T.a[0]-T.b[0]),z=T.a[1]+(U(seed,sid,k*3+2)-.5)*44;
    if(!free(x,z,.6)||near(x,z,1)||(o.offFloor&&o.offFloor(x,z)))continue;add('salvager','th.life.yard.p'+k,x,o.floor(x,z),z,U(seed,sid,k*3+3)*2*Math.PI);}
   (W.fields||[]).forEach((F,fi)=>{const n=U(seed,hid(F.id),1)<.5?1:2;
    for(let k=0;k<n;k++){const a=U(seed,hid(F.id),k*2+2),b=U(seed,hid(F.id),k*2+3),C=F.corners,x=C[0][0]+(C[1][0]-C[0][0])*a+(C[3][0]-C[0][0])*b,z=C[0][1]+(C[1][1]-C[0][1])*a+(C[3][1]-C[0][1])*b;
     if(near(x,z,1))continue;add('farmer',F.id+'.p'+k,x,o.bed(x,z),z,a*6.283);}});
   if(W.bore){const B=W.bore,sid2=hid('bore');
    for(let k=0;k<10;k++){const inside=k<4,x=inside?B.x+4+U(seed,sid2,k*3+1)*(B.gate.at-8):B.x-30+U(seed,sid2,k*3+1)*26,z=B.z+(U(seed,sid2,k*3+2)-.5)*(inside?6:30);
     if(!free(x,z,.6)||near(x,z,1))continue;add(k%3?'hauler':'deviser','th.life.bore.p'+k,x,inside?.15:o.floor(x,z),z,(inside?Math.PI/2:-Math.PI/2)+(U(seed,sid2,k*3+3)-.5));}
    for(const s of [-1,1])lamps.push({id:'th.life.bore.lamp'+(s>0?1:0),x:B.x-4,y:o.floor(B.x-4,B.z+s*10),z:B.z+s*10,h:4});}}
  return {people,lamps};}
 return {make,inBox,hid};
})();
