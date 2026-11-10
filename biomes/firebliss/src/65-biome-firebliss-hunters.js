// ================================================================= FIREBLISS — the hunters' marks (every station that has them)
// FIREBLISS.hunters(site): what the Fellgang and Kimr hunters leave (PLAN.md section 3), all temporary:
//   THE CAMP      core/camp's pitch (KCAMP.pitch: the kit's culture row and program, 50) laid on the ground the host calls good, drawn here: each
//                 shelter an open hide cone on four poles crossing at its top, each rack an A-frame with hides stretched on it, the cache a low pile
//                 of stones, the hearth a ring of stones on its ash in the common. Every record registered (core/tags) before it is drawn
//   THE TRAIL     cairns along the site's trail, one every ~110 m (each its own hash), a people's mark at each end: the Fellgangs' stone sign or the
//                 Kimr's aurochs-horn marker
//   BUTCHERY      a site's bones in a scatter round where the kill was dressed
// The camp's records and the pitch are plain data (FIREBLISS.CAMP: its id, the records; the host reads it); the drawing is BIO.put. [G data] for the pitch
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const PAL=FIREBLISS.PAL,C=FIREBLISS.C,vary=FIREBLISS.vary;
const Y=(x,z)=>BIO.terrainH(x,z);
// a pole from foot a to top b ([x,y,z] each): the unit pole turned onto the line
function pole(a,b,r){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d);BIO.put('pole',a,qUp(d),[r==null?1:r,L,r==null?1:r],vary(C(pick(PAL.wood)),.01,.03,.05));}
FIREBLISS.hunters=function(site){const st={shelters:0,racks:0,caches:0,hearths:0,cairns:0,markers:0,bones:0,camp:null};BIO.cur='firebliss/hunters';
 const people=c=>/kimr/.test(c)?'kimr':'fellgang';
 // ---- the camp
 if(site.camp&&typeof KCAMP!=='undefined'&&KCAMP.CULTURES[site.camp.culture]){const S=site.camp,prog=FIREBLISS.PROGRAM[S.culture];
  const good=(x,z)=>BIO.mask(x,z)>.95&&BIO.field('slope',x,z)<.3&&BIO.field('therm',x,z)<.08&&BIO.field('hollow',x,z)<.05;
  const camp=KCAMP.pitch({id:S.id,world:4490,culture:S.culture,program:prog,site:{x:S.x,z:S.z},dims:FIREBLISS.DIMS,ground:{ok:good},way:S.way,gap:2.5,common:8});
  const chk=KCAMP.check(camp,{ok:good});st.camp={id:camp.id,records:camp.records.length,short:camp.short.length,overlaps:chk.overlaps,offGround:chk.offGround};FIREBLISS.CAMP=camp;
  const who=people(S.culture);
  BIO.register({name:(S.name||'A hunting camp')+' ('+(who==='kimr'?'the Kimr':'the Fellgangs')+')',kind:'camp',x:camp.hearth.x,z:camp.hearth.z,y:Y(camp.hearth.x,camp.hearth.z)-1,r:camp.R+6,h:6,
   tags:{culture:who,camp:{id:camp.id,culture:S.culture,records:camp.records.map(r=>r.id)}}});
  // the hearth in the common: its ash and a ring of stones
  {const hx=camp.hearth.x,hz=camp.hearth.z,hy=Y(hx,hz);BIO.put('hearthash',[hx,hy+.03,hz],qEuler(0,0,0),[.9,1,.9],C(pick(PAL.ash)));reseed(KRAND.hash(4491,0,0,1));
   for(let k=0;k<9;k++){const a=k/9*TAU,x=hx+Math.cos(a)*1.05,z=hz+Math.sin(a)*1.05,s=rr(.16,.26);BIO.put('hearthstone',[x,Y(x,z)+s*.25,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.8,s],vary(C(pick(PAL.stone)),.01,.03,.05));}
   st.hearths++;}
  camp.records.forEach((r,i)=>{reseed(KRAND.hash(4491,i+1,0,2));const y=Y(r.x,r.z);
   BIO.register({name:r.kind==='dwelling'?'A hide shelter':/_rack/.test(r.key)?'A drying rack':'A cache (gear under stones)',kind:'camp',x:r.x,z:r.z,y:y-.5,r:Math.hypot(r.w,r.d)/2+.4,h:r.h+1,tags:{culture:who,campRecord:r.id}});
   if(r.kind==='dwelling'){const D=Math.min(r.w,r.d)*.92;BIO.put('shelter',[r.x,y-.05,r.z],qEuler(0,r.ry,0),[D,r.h*.92,D],vary(C(pick(PAL.hide)),.02,.05,.06));
    for(let k=0;k<4;k++){const a=r.ry+k/4*TAU+.4,f=[r.x+Math.cos(a)*D*.46,y-.05,r.z+Math.sin(a)*D*.46],t=[r.x-Math.cos(a)*.18,y+r.h*1.12,r.z-Math.sin(a)*.18];pole(f,t);}
    st.shelters++;}
   else if(/_rack/.test(r.key)){const c=Math.cos(r.ry),s=Math.sin(r.ry),hw=r.w/2,H=r.h;   /* along the rack its local x: (cos ry, -sin ry) */
    for(const e of[-1,1]){const ex=r.x+c*hw*e,ez=r.z-s*hw*e;const ox=s*.6,oz=c*.6;pole([ex+ox,Y(ex+ox,ez+oz),ez+oz],[ex,y+H,ez]);pole([ex-ox,Y(ex-ox,ez-oz),ez-oz],[ex,y+H,ez]);}
    /* the ridge pole and two hides hung from it */
    pole([r.x-c*hw,y+H-.05,r.z+s*hw],[r.x+c*hw,y+H-.05,r.z-s*hw],.9);
    for(const e of[-.45,.45]){BIO.put('hide',[r.x+c*hw*e,y+H-1.35,r.z-s*hw*e],qEuler(0,r.ry,0),[1.3,1.25,1],vary(C(pick(PAL.hide)),.02,.05,.06));}
    st.racks++;}
   else{for(let k=0;k<5;k++){const a=rr(0,TAU),d=rr(0,.5),x=r.x+Math.cos(a)*d,z=r.z+Math.sin(a)*d,s=rr(.3,.55);BIO.put('cache',[x,Y(x,z)+s*.2,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.8,s],vary(C(pick(PAL.stone)),.01,.03,.05));}st.caches++;}});}
 // ---- the trail's cairns and the people's marks at its ends
 if(site.trail){const P=site.trail.pts,who=site.trail.people||'fellgang';let s0=0;
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   for(let s=Math.ceil(s0/110)*110-s0;s<L;s+=110){const h=KRAND.hash(4492,i,Math.round(s),3);reseed(h);const t=s/L,x=a[0]+(b[0]-a[0])*t+rr(-3,3),z=a[1]+(b[1]-a[1])*t+rr(-3,3);
    if(Math.abs(x)>2550||Math.abs(z)>2550||BIO.mask(x,z)<.9)continue;let y=Y(x,z);
    BIO.register({name:site.trail.name.replace(/\s*\(.*$/,'')+': a cairn',kind:'mark',x,z,y:y-.3,r:1.2,h:2.2,tags:{culture:who}});
    for(let k=0,n=ri(3,5);k<n;k++){const sz=(1-k/(n+1))*rr(.35,.5);BIO.put('cairnstone',[x+rr(-.06,.06),y+sz*.3,z+rr(-.06,.06)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[sz,sz*.8,sz],vary(C(pick(PAL.stone)),.01,.03,.05));y+=sz*.55;}
    st.cairns++;}
   s0+=L;}
  [P[0],P[P.length-1]].forEach((p,k)=>{let x=p[0]+(k?6:-6),z=p[1];x=clamp(x,-2540,2540);const y=Y(x,z);reseed(KRAND.hash(4493,k,0,4));if(BIO.mask(x,z)<.9)return;
   if(who==='kimr'){BIO.put('pole',[x,y-.3,z],qEuler(0,0,0),[2.2,1.9,2.2],vary(C(pick(PAL.wood)),.01,.03,.05));
    for(const e of[-1,1])BIO.put('horn',[x+e*.08,y+1.45,z],qEuler(0,e<0?Math.PI:0,0),[.9,.9,.9],vary(C(pick(PAL.horn)),.01,.03,.04));
    BIO.register({name:'A Kimr aurochs-horn marker (the Kimr\'s ground)',kind:'mark',x,z,y:y-.3,r:1,h:2.6,tags:{culture:'kimr'}});}
   else{BIO.put('signstone',[x,y-.25,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[1,rr(1.4,1.9),1],vary(C(pick(PAL.stone)),.01,.03,.05));
    BIO.register({name:'A Fellgang stone sign (the Fellgangs\' way)',kind:'mark',x,z,y:y-.3,r:1,h:2.4,tags:{culture:'fellgang'}});}
   st.markers++;});}
 // ---- butchery sites: bones round where the kill was dressed
 (site.butchery||[]).forEach((B,i)=>{reseed(KRAND.hash(4494,i,0,5));const y0=Y(B.x,B.z);
  BIO.register({name:B.name||'A butchery site',kind:'site',x:B.x,z:B.z,y:y0-.4,r:7,h:1.6});
  for(let k=0;k<18;k++){const a=rr(0,TAU),d=Math.sqrt(rng())*6,x=B.x+Math.cos(a)*d,z=B.z+Math.sin(a)*d,s=rr(.2,.7);if(BIO.mask(x,z)<.9)continue;
   BIO.put('bone',[x,Y(x,z)+.05,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*1.6,s*.4,s*.4],vary(C(pick(PAL.bone)),.01,.03,.05));st.bones++;}});
 BIO.cur=null;return st;};
// an outcrop of stained stone where the resource data puts a node (the host registers it: 89z): four stones, the first the largest, each from a hash
FIREBLISS.outcrop=function(x0,z0,s,col,salt){const c=C(col);
 for(let k=0;k<4;k++){const h=KRAND.hash(4510,k,0,salt|0),a=KRAND.unit(h)*TAU,d=k?1.2+KRAND.unit(KRAND.hash(h,1,0,1))*1.8:0,x=x0+Math.cos(a)*d,z=z0+Math.sin(a)*d;
  BIO.put('scoria',[x,Y(x,z)+s*.15,z],qEuler(.2,a,.1),[s*(k?.6:1),s*(k?.45:.7),s*(k?.6:1)],c);}};
})();
