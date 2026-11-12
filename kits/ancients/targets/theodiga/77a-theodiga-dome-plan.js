// ================================================================= THEODIGA — the Dome on the Water: the plan (records)
// The owner, 2026-11-11 (option A of three): Theodiga is "the dome on earth", the stately pleasure-dome the Decree's
// Song names (LORE.md 6.13, the faith of the Decree and the Broken Wheel; kits/qiblai/PLAN.md section 2a). The Station,
// the broken wheel in the sky, is the dome in air; this is the one the Khan decreed on the ground, and the Sultan's
// Pleasure Dome of the Bay in Erewhon (a gold dome on an island) is the feasting copy of a dome that stands over water.
//
// THE FORM
//   the dome     240 m across, 112 m from the drum to the oculus, its crown about 548 m up: over the canyon rim (440 m),
//                so the valley sees it. Twenty-four white ribs and six tiers of blue glass panes, copper bands at every
//                tier, an open oculus ringed by a short lantern ("a sunny pleasure-dome")
//   the drum     16 m, an arcade all round it, the cyan strip lights at its head
//   the deck     the dome's floor, a disc 248 m across level with the crest blocks' roofs (H+20). Its centre stands 65 m
//                upstream of the crest's upstream face, so the crest carries only its downstream chord and the rest
//                stands on PIERS in the reservoir: an outer ring of 24 (r 114), an inner ring of 12 (r 62) and the core,
//                trumpet-flared under the deck and tied by two ring beams below the water. The dome's reflection lies
//                on the reservoir ("the shadow of the dome of pleasure / floated midway on the waves")
//   the hall     the old crest's fluted public dome, moved inside onto the deck: the dome within the dome
// The dam itself is unchanged: the same face, tunnels, outlets and reservoir level ("harnessed the cascade").
//
// THE RUIN (every d > 0, as the rest of buildDam): the reservoir is drawn down to 250 m, so the piers stand 166 m bare
// over the mud. One sector of the dome, upstream and west (the notch's side), has failed: its outer piers broke, the
// deck over them fell, and the dome above tore open nearly to the drum, a few of its ribs still standing (the broken
// dome, as the Station is the broken wheel). The glass is gone everywhere; the bands are verdigris. What fell lies on
// the mud under the gap and on the deck beside it.
//
// [G data]: no three.js, no DOM. Every number is a function of the plan's seed and a record's own ring and index
// (core/rand: KRAND.hash), never of how many draws came before it. Records carry stable ids (theodiga.dome.pier.outer.3);
// the ruin is a set of deltas on those records (broken piers, the sector). The drawing (77b) decides nothing.
const THEODOME={};
THEODOME.DIM={R:120,ZOFF:65,DECK:20,DECKT:3.5,DRUM:16,DH:112,OC:14,RIBS:24,TIERS:6,ARCADES:48,LIGHTS:48,
 PIER:{outer:{r:114,n:24,r0:4.5,r1:9},inner:{r:62,n:12,r0:4,r1:8},core:{r0:9,r1:15}},
 BEAMS:[300,345],
 // the failed sector: its centre angle (x = cos a, z = sin a: upstream is -z, west -x) and half-width
 SECTOR:{a0:-Math.PI/2-.75,w:.5},HALL_KEEP:58,
 WL:{intact:378,ruin:250},RUBBLE:40};
THEODOME.u=function(seed,a,b){return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0));};
THEODOME.angDiff=function(a,b){const T=2*Math.PI;let x=(a-b)%T;if(x>Math.PI)x-=T;if(x<-Math.PI)x+=T;return x;};
// the dam's arc in plan (buildDam's zc): the upstream face is zc(x)-2, the crest deck runs to zc(x)+CREST
THEODOME.zc=function(P,x){const s=x/(P.dam.SPAN/2);return -P.dam.BOW*(1-s*s);};
THEODOME.onDam=function(P,x,z,m){return Math.abs(x)<P.dam.SPAN/2&&z>THEODOME.zc(P,x)-2-(m==null?0:m);};
THEODOME.inSector=function(P,a,m){return !!P.sector&&Math.abs(THEODOME.angDiff(a,P.sector.a0))<P.sector.w+(m==null?0:m);};
// the bay (0..RIBS-1) an angle falls in; rib k stands at the bay's start
THEODOME.bay=function(P,a){const T=2*Math.PI,n=P.shell.ribs;let t=(a%T+T)%T;return Math.min(n-1,Math.floor(t/T*n));};
// the shell's radius at a height y over the drum
THEODOME.shellR=function(P,y){const S=P.shell,q=y/S.H;return S.R*Math.sqrt(Math.max(0,1-q*q));};
// is the shell gone at (angle, height)? the torn sector, above its ragged lower edge, except the ribs that stand
THEODOME.shellGone=function(P,a,y,isRib){if(!THEODOME.inSector(P,a))return false;const k=THEODOME.bay(P,a);
 if(y<=P.sector.jag[k])return false;const rb=P.sector.ribs[k];return !(isRib&&rb.keep&&y<rb.top);};
// is the deck gone at (angle, radius)? only over the broken outer piers, outside the hall
THEODOME.deckGone=function(P,a,r){if(!THEODOME.inSector(P,a))return false;return r>P.sector.deckR[THEODOME.bay(P,a)];};

THEODOME.plan=function(o){o=o||{};const D=THEODOME.DIM,S=o.seed==null?9270:o.seed,U=THEODOME.u,dd=o.d>0;
 const dam=o.dam||{H:400,SPAN:640,BOW:140,CREST:50};
 const P={id:'theodiga.dome',seed:S,ruined:dd,dam:dam,cx:0,cz:0,piers:[],beams:[],lights:[],rubble:[],sector:null};
 P.cz=THEODOME.zc(P,0)-D.ZOFF;
 const deckY=dam.H+D.DECK,y0=deckY+D.DRUM,top=D.DH*Math.sqrt(1-(D.OC/D.R)*(D.OC/D.R));
 P.deck={id:'theodiga.dome.deck',y:deckY,t:D.DECKT,r:D.R+4};
 P.drum={id:'theodiga.dome.drum',y:deckY,h:D.DRUM,r:D.R,arcades:D.ARCADES};
 P.shell={id:'theodiga.dome.shell',y:y0,R:D.R,H:D.DH,top:top,ribs:D.RIBS,tiers:D.TIERS,oc:D.OC};
 P.lantern={id:'theodiga.dome.lantern',y:y0+top,r:D.OC+1.5,h:6};
 P.hall={id:'theodiga.dome.hall',r:44,h:26};
 P.top=y0+top+P.lantern.h;
 P.wl=dd?D.WL.ruin:D.WL.intact;
 // the ruin's sector first: the piers ask it which of them broke
 if(dd){const n=D.RIBS,sec={a0:D.SECTOR.a0,w:D.SECTOR.w,jag:[],ribs:[],deckR:[]};
  for(let k=0;k<n;k++){sec.jag.push(D.DH*(.04+.22*U(S,k,11)));
   sec.ribs.push({k:k,keep:U(S,k,12)>.4,top:D.DH*(.25+.55*U(S,k,13))});
   sec.deckR.push(D.HALL_KEEP+14*U(S,k,14));}
  P.sector=sec;}
 // the piers: two rings and the core, each down to the bed; where a ring crosses the dam the crest carries the deck
 const ring=(name,R,n,r0,r1,salt)=>{for(let i=0;i<n;i++){const a=(i+.5)/n*2*Math.PI,x=P.cx+R*Math.cos(a),z=P.cz+R*Math.sin(a);
  if(THEODOME.onDam(P,x,z,6))continue;
  const p={id:'theodiga.dome.pier.'+name+'.'+i,ring:name,i:i,a:a,x:x,z:z,r0:r0,r1:r1,top:deckY-D.DECKT,broken:false};
  /* an inner pier breaks only where the deck over it fell */
  if(dd&&THEODOME.inSector(P,a)&&(name==='outer'||THEODOME.deckGone(P,a,R))){p.broken=true;p.top=P.wl+8+U(S,i,salt)*80;}
  P.piers.push(p);}};
 ring('outer',D.PIER.outer.r,D.PIER.outer.n,D.PIER.outer.r0,D.PIER.outer.r1,21);
 ring('inner',D.PIER.inner.r,D.PIER.inner.n,D.PIER.inner.r0,D.PIER.inner.r1,22);
 P.piers.push({id:'theodiga.dome.pier.core',ring:'core',i:0,a:0,x:P.cx,z:P.cz,r0:D.PIER.core.r0,r1:D.PIER.core.r1,top:deckY-D.DECKT,broken:false});
 // the ring beams tie the outer ring under the water (bare over the mud in the ruin)
 D.BEAMS.forEach((y,i)=>P.beams.push({id:'theodiga.dome.beam.'+i,y:y,r:D.PIER.outer.r,h:4,dep:3}));
 // the drum's strip lights
 for(let i=0;i<D.LIGHTS;i++){const a=(i+.5)/D.LIGHTS*2*Math.PI;
  if(dd&&THEODOME.inSector(P,a,-.05))continue;
  P.lights.push({id:'theodiga.dome.light.'+i,a:a,lit:!dd||U(S,i,31)<.1});}
 // what fell: deck slabs, ribs and shell panels, on the mud under the gap and on the deck beside the hall
 if(dd)for(let i=0;i<D.RUBBLE;i++){const a=D.SECTOR.a0+(U(S,i,41)*2-1)*D.SECTOR.w*1.25,r=30+110*U(S,i,42),q=U(S,i,43);
  const kind=q<.45?'slab':q<.75?'rib':'panel',on=r<D.HALL_KEEP-4&&r>P.hall.r+4?'deck':'mud';
  if(on==='mud'&&r<P.hall.r+4)continue;
  const s1=U(S,i,44),s2=U(S,i,45),s3=U(S,i,46);
  const size=kind==='slab'?[10+16*s1,2.5+s2,8+10*s3]:kind==='rib'?[2.2,20+30*s1,2.2]:[8+8*s1,.8,6+6*s3];
  P.rubble.push({id:'theodiga.dome.rubble.'+i,kind:kind,on:on,x:P.cx+r*Math.cos(a),z:P.cz+r*Math.sin(a),
   ry:U(S,i,47)*2*Math.PI,tilt:(U(S,i,48)*2-1)*.35,size:size});}
 P.stats={piers:P.piers.length,broken:P.piers.filter(p=>p.broken).length,rubble:P.rubble.length,height:P.top};
 return P;};
