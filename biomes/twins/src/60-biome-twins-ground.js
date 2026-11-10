// ================================================================= TWINS — the ground's loose stuff and the warm collars (the passes)
// Each pass walks a lattice of cells over the box; a cell's draws are KRAND.hash(world, cell i, cell j, salt) and the index within it, so
// a tile built alone draws what it draws in a full build (biomes/WORLD.md). Where things lie comes from the host's fields
// (BIO.host.fields): the scree, the obsidian, the talus, the faces, the warm collars, the trodden route (kept clear). Every pass sets its
// LOD range (BIO.range).
//   blocks   scree blocks over the shattered slopes, big ones rare (a power law); obsidian blocks on the coulee and its talus
//   field    a boulder field where the host gives one (F.blocks): frost-shattered blocks 0.3-1.4 m on 5 m cells, basalt and obsidian
//   stones   the small stones between them, sparse; none on the route
//   cairns   the guides' cairns along a route (opt.route: [[x,z],...]), every ~110 m, side to side; the cap daubed with sulphur
//   collar   fumarole-ferns and cinder-cushions in the warm breath of a skylight or a tube's mouth (the warm field), none in the snow;
//            walked only over warmBoxes ([[x0,z0,x1,z1],...]: the host's boxes round each warm place; its cells are 1.6 m)
TWINS.buildGround=function(R,q,box,route,warmBoxes){const K=KRAND,F=BIO.host.fields,H=BIO.host.terrainH,{clamp,smooth,mix,qEuler,TAU}=BIO.fn,P=TWINS.PAL,W=BIO.host.seed>>>0;
 q=q==null?1:q;box=box||[-R,-R,R,R];const st={blocks:0,bigBlocks:0,obsidian:0,stones:0,cairns:0,cairnStones:0,ferns:0,cushions:0};
 const u=(h,k)=>K.unit(K.hash(h,k));
 const pick=(a,h)=>a[Math.floor(u(h,99)*a.length)%a.length];
 const cells=(c,salt,fn,b)=>{b=b||box;for(let j=Math.floor(b[1]/c);j<Math.ceil(b[3]/c);j++)for(let i=Math.floor(b[0]/c);i<Math.ceil(b[2]/c);i++)fn(i,j,i*c,j*c,K.hash(W,i,j,salt));};
 const inBox=(x,z)=>x>box[0]+3&&x<box[2]-3&&z>box[1]+3&&z<box[3]-3&&BIO.mask(x,z)>0;
 // ---- blocks: up to 2 candidates a 20 m cell; basalt where the scree is, obsidian where the coulee sheds; size by a power law (to ~6 m)
 cells(20,0x7B15,(i,j,x0,z0,h)=>{for(let k=0;k<2;k++){const hk=K.hash(h,k),x=x0+20*u(hk,1),z=z0+20*u(hk,2);if(!inBox(x,z))continue;
   const fc=F.face(x,z);if(fc>.45||F.path(x,z)>.05||F.warm(x,z)>.5)continue;
   const ob=F.obsidian(x,z),w=Math.max(F.scree(x,z)*.3,F.talus(x,z),F.blocks?F.blocks(x,z):0),r=u(hk,3);if(r>w*.5*q)continue;
   const glass=u(hk,14)<ob*.85,s=(glass?.45:.4)*Math.pow(1-u(hk,4)*.985,-.55),big=s>2.2;BIO.range=big?2600:900;
   const y=H(x,z),name=glass?'obsidian':'boulder',c=glass?pick(P.obsidian,hk):u(hk,6)<.08?pick(P.oxid,hk):u(hk,7)<.35?pick(P.rubble,hk):pick(P.basalt,hk);
   BIO.put(name,[x,y+s*.2,z],qEuler((u(hk,8)-.5)*.6,u(hk,9)*TAU,(u(hk,10)-.5)*.6),[s*mix(.8,1.3,u(hk,11)),s*mix(.6,1,u(hk,12)),s*mix(.8,1.3,u(hk,13))],c);
   if(glass)st.obsidian++;else st.blocks++;if(big)st.bigBlocks++;}});
 // ---- the boulder field (PLAN.md section 3.1: the sprint across "a frost-shattered black obsidian boulder field"): where F.blocks is set
 if(F.blocks)cells(5,0xB0F1,(i,j,x0,z0,h)=>{const x=x0+5*u(h,1),z=z0+5*u(h,2);if(!inBox(x,z))return;const w=F.blocks(x,z);if(w<.02||u(h,2)>w*.42*q)return;
  if(F.face(x,z)>.4||F.path(x,z)>.05||F.warm(x,z)>.4||F.snow(x,z)>.6)return;
  const glass=u(h,3)<F.obsidian(x,z)*.8,s=mix(.3,1.4,Math.pow(u(h,4),1.8));BIO.range=s>.9?700:420;
  BIO.put(glass?'obsidian':'block',[x,H(x,z)+s*.2,z],qEuler((u(h,5)-.5)*.7,u(h,6)*TAU,(u(h,7)-.5)*.7),[s*mix(.8,1.3,u(h,8)),s*mix(.55,.95,u(h,9)),s*mix(.8,1.3,u(h,10))],glass?pick(P.obsidian,h):u(h,11)<.3?pick(P.rubble,h):pick(P.basalt,h));
  st.field=(st.field||0)+1;if(glass)st.obsidian++;else st.blocks++;});
 // ---- stones: the shattered surface's small stuff, none on the faces or the route
 cells(14,0x5705,(i,j,x0,z0,h)=>{const x=x0+14*u(h,1),z=z0+14*u(h,2);if(!inBox(x,z))return;
  const sl=F.slope(x,z);if(F.face(x,z)>.3||F.path(x,z)>.1||F.snow(x,z)>.65||u(h,3)>.24*q*smooth(.9,.3,sl))return;
  const s=mix(.1,.45,Math.pow(u(h,4),2));BIO.range=260;const ob=u(h,9)<F.obsidian(x,z)*.7;
  BIO.put(ob?'obsidian':'stone',[x,H(x,z)+s*.2,z],qEuler((u(h,5)-.5)*.4,u(h,6)*TAU,(u(h,7)-.5)*.4),[s,s,s],ob?pick(P.obsidian,h):u(h,8)<.3?pick(P.rubble,h):pick(P.basalt,h));
  if(ob)st.obsidian++;else st.stones++;});
 // ---- the cairns along the route: every ~110 m, 2.6 m to one side then the other, four to six stones stacked, the cap in sulphur
 if(route&&route.length>1){let acc=0,side=1,n=0;const sp=110;
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;const d=[(b[0]-a[0])/L,(b[1]-a[1])/L];
   for(let t=sp-acc;t<L;t+=sp){const hk=K.hash(W,n,0,0xCA12),x=a[0]+d[0]*t-d[1]*2.6*side,z=a[1]+d[1]*t+d[0]*2.6*side;side=-side;n++;
    if(BIO.mask(x,z)<=0)continue;let y=H(x,z);const k=4+Math.floor(u(hk,1)*3);BIO.range=1400;
    for(let m=0;m<k;m++){const s=mix(.62,.26,m/(k-1))*mix(.9,1.15,u(hk,10+m)),top=m===k-1;
     BIO.put('cairnstone',[x+(u(hk,20+m)-.5)*.12,y+s*.32,z+(u(hk,30+m)-.5)*.12],qEuler((u(hk,40+m)-.5)*.25,u(hk,50+m)*TAU,(u(hk,60+m)-.5)*.25),[s,s*.8,s],top?pick(P.sulphur,hk):pick(P.basalt,K.hash(hk,m)));
     y+=s*.5;st.cairnStones++;}
    st.cairns++;}
   acc=(acc+L)%sp;}}
 // ---- the warm collars: ferns in the warmest, damp ring; cushions round them and in the cracks further out
 (warmBoxes||[]).forEach(wb=>cells(1.6,0xC011,(i,j,x0,z0,h)=>{const x=x0+1.6*u(h,1),z=z0+1.6*u(h,2);const w=F.warm(x,z);if(w<.08||!inBox(x,z))return;
  if(F.path(x,z)>.2||F.face(x,z)>.55)return;const y=H(x,z);
  if(u(h,3)<smooth(.35,.85,w)*.55*q){const s=mix(.4,.95,u(h,4))*mix(.75,1,w);BIO.range=220;
   BIO.put('fern',[x,y+.02,z],qEuler((u(h,5)-.5)*.2,u(h,6)*TAU,(u(h,7)-.5)*.2),[s,s*mix(.8,1.15,u(h,8)),s],pick(P.fern,h));st.ferns++;}
  else if(u(h,9)<smooth(.08,.5,w)*.32*q){const s=mix(.12,.42,Math.pow(u(h,10),1.4));BIO.range=200;
   BIO.put('cushion',[x,y-.03,z],qEuler(0,u(h,11)*TAU,0),[s,s*mix(.7,1.1,u(h,12)),s*mix(.8,1.2,u(h,13))],pick(P.cushion,h));st.cushions++;}},wb));
 BIO.range=null;return st;};
// ---------------------------------------------------------------- THE OASES (stations 2 and 6: PLAN.md section 5's zonation round a vent)
// Placed by the ground's temperature (BIO.host.fields.heat: the station's KTHERM bake), never by a noise, over the boxes the station gives
// (opt.boxes [[x0,z0,x1,z1],...]); opt.dry(x, z) false where nothing grows (a spring, a pool, the sinter's middle). The zones (C of ground):
//   needles   brimstone needles on the fumaroles' sulphur (70 C and over, the sulph class)
//   sedge     bobby-sock sedge on the warm turf (15-35 C, the turf class), dense along the runoff
//   ferns     fumarole-ferns in the warm rock (12-30 C) where it is stony
//   cushions  cinder-cushions in the periglacial ring (3-15 C)
//   pines     dwarf agate-pine krummholz on the drier margins (8-18 C; opt.pines), flagged downwind (opt.wind [x, z])
TWINS.buildOasis=function(q,opt){const K=KRAND,F=BIO.host.fields,H=BIO.host.terrainH,{clamp,smooth,mix,qEuler,TAU}=BIO.fn,P=TWINS.PAL,W=BIO.host.seed>>>0;
 q=q==null?1:q;const st={sedge:0,oasisFerns:0,oasisCushions:0,pines:0,needles:0};if(!opt||!F.heat)return st;
 const u=(h,k)=>K.unit(K.hash(h,k)),pick=(a,h)=>a[Math.floor(u(h,99)*a.length)%a.length],X={};
 const dry=opt.dry||(()=>true),wind=opt.wind||[1,0],wa=Math.atan2(-wind[1],wind[0]);
 const cells=(c,salt,b,fn)=>{for(let j=Math.floor(b[1]/c);j<Math.ceil(b[3]/c);j++)for(let i=Math.floor(b[0]/c);i<Math.ceil(b[2]/c);i++)fn(i*c,j*c,K.hash(W,i,j,salt));};
 const ok=(x,z)=>BIO.mask(x,z)>0&&dry(x,z)&&F.path(x,z)<.3&&F.face(x,z)<.5;
 const cls=(x,z)=>{for(const k of TWINS.XKEYS)X[k]=0;F.cls(x,z,X);return X;};
 (opt.boxes||[]).forEach(b=>{
  // the brimstone needles
  cells(1.4,0x5A11,b,(x0,z0,h)=>{const x=x0+1.4*u(h,1),z=z0+1.4*u(h,2),t=F.heat(x,z);if(t==null||t<70||!ok(x,z))return;const c=cls(x,z);if(c.sulph<.3||u(h,3)>c.sulph*.6*q)return;
   const s=mix(.08,.26,u(h,4));BIO.range=140;BIO.put('needles',[x,H(x,z)-.01,z],qEuler((u(h,5)-.5)*.3,u(h,6)*TAU,(u(h,7)-.5)*.3),[s,s,s],pick(P.brim,h));st.needles++;});
  // the sedge on the warm turf, the ferns in the warm stones
  cells(1.1,0x5ED6,b,(x0,z0,h)=>{const x=x0+1.1*u(h,1),z=z0+1.1*u(h,2),t=F.heat(x,z);if(t==null||t<12||t>36||!ok(x,z))return;const c=cls(x,z);
   if(c.sinter>.45||c.mud>.3||c.mat>.5||c.sulph>.3)return;const y=H(x,z);
   if(c.turf>.2&&u(h,3)<c.turf*smooth(14,20,t)*smooth(36,30,t)*.6*q){const s=mix(.3,.6,u(h,4));BIO.range=180;
    BIO.put('sedge',[x,y+.01,z],qEuler((u(h,5)-.5)*.2,u(h,6)*TAU,(u(h,7)-.5)*.2),[s,s*mix(.85,1.2,u(h,8)),s],pick(P.sedge,h));st.sedge++;}
   else if(c.turf<.5&&u(h,9)<.12*q*smooth(12,18,t)*smooth(32,26,t)){const s=mix(.35,.8,u(h,10));BIO.range=200;
    BIO.put('fern',[x,y+.02,z],qEuler((u(h,11)-.5)*.2,u(h,12)*TAU,(u(h,13)-.5)*.2),[s,s,s],pick(P.fern,h));st.oasisFerns++;}});
  // the cushions in the periglacial ring
  cells(2.2,0xC05A,b,(x0,z0,h)=>{const x=x0+2.2*u(h,1),z=z0+2.2*u(h,2),t=F.heat(x,z);if(t==null||t<3||t>15||!ok(x,z))return;const c=cls(x,z);if(c.sinter>.3||c.mud>.2)return;
   if(u(h,3)>.32*q*smooth(3,6,t)*smooth(15,11,t))return;const s=mix(.15,.5,Math.pow(u(h,4),1.3));BIO.range=200;
   BIO.put('cushion',[x,H(x,z)-.03,z],qEuler(0,u(h,5)*TAU,0),[s,s*mix(.7,1.1,u(h,6)),s*mix(.8,1.2,u(h,7))],pick(P.cushion,h));st.oasisCushions++;});
  // the krummholz on the drier warm margins: a bole and its crown flagged downwind
  if(opt.pines)cells(5,0x91E5,b,(x0,z0,h)=>{const x=x0+5*u(h,1),z=z0+5*u(h,2),t=F.heat(x,z);if(t==null||t<8||t>18||!ok(x,z))return;const c=cls(x,z);
   if(c.sinter>.2||c.mud>.1||c.mat>.2||c.turf>.6||u(h,3)>.3*q*smooth(8,10,t)*smooth(18,15,t))return;
   const Hh=mix(1.8,3.8,u(h,4)),y=H(x,z),a=wa+(u(h,5)-.5)*.5,cr=mix(.9,1.6,u(h,6));BIO.range=600;
   BIO.put('kbole',[x,y-.1,z],qEuler(0,a,0),[Hh*.9,Hh,Hh*.9],pick(P.agate,h));
   BIO.put('kcrown',[x+Math.cos(a)*.35*cr,y+Hh*.92,z-Math.sin(a)*.35*cr],qEuler(0,a,0),[cr,cr*mix(.7,1,u(h,7)),cr],pick(P.needle,h));st.pines++;});});
 BIO.range=null;return st;};
