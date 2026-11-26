// ================================================================= THE RIFT RIM — trees
// The rim's five tree-scale species, each with its own builder, placed by zone from the host's climate fields and weighted by the
// rim the page is (RRIM.biome, 70). The zones are computed HERE from those fields, never from the host's map: a world that binds
// the same fields gets the same zoning. Beyond the LOD spine a tree is an impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=RRIM.SPECIES,PAL=RRIM.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=RRIM.C;
RRIM.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet, flow (near the water), slope, rock, cold (0 the warm basin, +16 degC; 1 the ice, under
// -14), barren (nothing grows: the ice cap, the airless crest), and three this kit reads when a host binds them (BIO.field: 0 when not):
// fog (the cloud belt the W rim lives in), snow, farm (Dalab's fields on the basin plain). The plan's zones (section 3):
//   shore    the warm lower edges and the great lake's basin plain (Csa, Csb, Cfa, under ~2.5 km)
//   montane  2.5-4.5 km (Dsb, Dsc): the glass forest (N), krummholz and carpets (S), the cloud belt (W)
//   alpine   4.5-6 km (ET): high meadow (N), the black barrens (S), fellfield over the cloud (W)
//   ice      over 6 km (EF): nothing roots
//   lake     a lake's or a river's banks (the flow field)
//   cliff    steep bare rock: nothing roots there; every zone above is multiplied by 1 - cliff
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),slope=F('slope'),rock=F('rock'),cold=F('cold'),barren=F('barren'),fog=F('fog'),snow=F('snow'),farm=F('farm');
 const cliff=smooth(.78,.95,slope)*smooth(.3,.6,rock),live=(1-barren)*(1-cliff)*(1-smooth(.5,.9,snow)),gentle=smooth(.6,.28,slope);
 return{wet,flow,slope,rock,cold,barren,fog,snow,farm,cliff,live,gentle,
  shore:live*smooth(.34,.24,cold)*(1-farm),
  montane:live*smooth(.24,.32,cold)*smooth(.64,.54,cold)*(1-rock*.5),
  alpine:live*smooth(.54,.62,cold)*smooth(.88,.8,cold)*(1-rock*.35),
  ice:Math.max(barren,smooth(.82,.92,cold)),
  lake:flow*live,
  tree:live*smooth(.66,.56,cold)};}   /* where a tree can stand at all: under the tree line */
RRIM.zones=zones;
RRIM.rimK=S=>S.rim[RRIM.rim]||0;   /* how much a species belongs to the page's rim (70: RRIM.biome) */
RRIM.standOf=(x,z,n,seed)=>BIO.standAt(x,z,n||2,.0024,seed||83);

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;const lm=RRIM.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
 MEAN={barkF:lm.barkF!=null?lin(lm.barkF):texMean(RRIM.BARKTEX[0]),barkM:lm.barkM!=null?lin(lm.barkM):texMean(RRIM.BARKTEX[0]),barkB:lm.barkB!=null?lin(lm.barkB):texMean(RRIM.BARKTEX[1]),
  barkL:lm.barkL!=null?lin(lm.barkL):texMean(RRIM.BARKTEX[2]),barkS:lm.barkS!=null?lin(lm.barkS):texMean(RRIM.BARKTEX[3]),rock:texMean(RRIM.ROCKTEX)};return MEAN;}
Object.assign(RRIM,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means()[S.fam]));};
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.04:dh,ds==null?.1:ds,dl==null?.07:dl),k==null?1.2:k);
RRIM.leafCol=leafCol;

// ---------------------------------------------------------------- helpers
const FJ=(p,o)=>BIO.flareJoin?BIO.flareJoin(p,o):p;   /* a limb's joint to its parent (core/biome 31j; BACKPORT.md's universal set) */
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
// a quaternion taking the item's +x to xv and +y to yv (both unit, near orthogonal): a card standing out from a column, its width round it
const _m4=new T3.Matrix4(),_vx=new T3.Vector3(),_vy=new T3.Vector3(),_vz=new T3.Vector3();
function qBasis(xv,yv){_vy.set(yv[0],yv[1],yv[2]).normalize();_vx.set(xv[0],xv[1],xv[2]);_vx.sub(_vy.clone().multiplyScalar(_vx.dot(_vy))).normalize();_vz.crossVectors(_vx,_vy);
 _m4.makeBasis(_vx,_vy,_vz);return new T3.Quaternion().setFromRotationMatrix(_m4);}
RRIM.qBasis=qBasis;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
// a straight or leaning fluted column (the frills): rings up a gentle curve, the flutes in the radius; returns the axis points
function column(T,S,H,r0,r1,lean,la,lv,flutes){const n=lv===2?9:5,rings=[],ax=[];
 for(let k=0;k<=n;k++){const u=k/n,o=lean*H*u*u,x=T.x+Math.cos(la)*o,z=T.z+Math.sin(la)*o,y=T.y0-.3+(H+.3)*u,r=Math.max(.05,mix(r0,r1,Math.pow(u,.9))*(u<.05?1.25:1));
  rings.push({x,y,z,r,yy:u*H,col:barkCol(S,k)});ax.push({x,y,z,r});}
 rings.push({x:ax[n].x,y:T.y0+H+.2,z:ax[n].z,r:.03,yy:H,col:barkCol(S,0)});
 const st=BIO.lathe(S.fam,rings,lv===2?12:7,flutes,4,(Rg,a)=>Rg.r*(1+.07*Math.cos(a*flutes)),(Rg,a)=>.82+.18*Math.cos(a*flutes));
 return{ax,tris:st};}

// ---------------------------------------------------------------- the builders: (T, st, lv), T={x,z,y0,sp,H,rb,crownR,seed}, lv 2 near / 1 mid
const B=[];
// 0 THE FROST FRILL (N): a ribbed teal column 25-40 m with short stiff fins in whorls instead of branches; the fins translucent (the sun
// lights the column from inside: the fin material's back-light), shorter up the column so the tree reads as a spire over its lake; a
// violet bud at the tip. Kin of the Rift's frill tree (its column and fins), made subalpine.
B[0]=function(T,st,lv){const S=SP[0],H=T.H,R=T.crownR;const c=column(T,S,H,T.rb,T.rb*.22,rr(0,.015),rr(0,TAU),lv,10);st.trunk+=c.tris;
 const fc=C(pick(S.leaf)),step=lv===2?rr(1.1,1.5):rr(2.4,3.2);let n=0;
 for(let y=H*rr(.1,.16);y<H*.96;y+=step){const u=y/H,p=along(c.ax,u),nn=lv===2?ri(5,7):ri(3,4),a0=rr(0,TAU),L=(R*Math.pow(1-u,.75)+.7)*rr(.85,1.1);
  for(let k=0;k<nn;k++){const a=a0+k/nn*TAU+rr(-.15,.15),el=mix(.55,1.05,u)+rr(-.08,.08),d=dirOf(a,el);
   const x=p.x+Math.cos(a)*p.r*.8,z=p.z+Math.sin(a)*p.r*.8;
   BIO.put('fin',[x,p.y,z],qBasis([-Math.sin(a),0,Math.cos(a)],d),[L*.9,L,L],bright(vary(fc,.02,.06,.06),mix(.9,1.15,u)));n++;}}
 BIO.put('bud',[c.ax[c.ax.length-1].x,T.y0+H-.2,c.ax[c.ax.length-1].z],null,[.55,1.4,.55],bright(pick(PAL.frillBud),1.1));
 st.fins+=n;regTree(T,S,R+.6,H+1.4);};
// 1 THE BELL FIR (N): a pale trunk forking two or three times, each tip an inverted bell of pleated blue-green needles hung over it like an
// umbrella (the bell's stem at the tip, its skirt below). The bells close in winter (RRIM.WINTER: the closed card, the seed inside).
// Kin of the Rift's bell palm.
B[1]=function(T,st,lv){const S=SP[1],H=T.H,R=T.crownR,bc=C(pick(S.leaf)),win=!!RRIM.WINTER,tips=[];
 const fy=H*rr(.38,.5),trunk=grow({x:T.x,y:T.y0-.3,z:T.z},[rr(-.04,.04),1,rr(-.04,.04)],fy+.3,T.rb*1.15,T.rb*.7,lv===2?4:2,0,.03);
 st.trunk+=BIO.tube('barkB',trunk,barkCol(S,0),{seg:lv===2?8:5,cap:true});
 function fork(p,d,len,r,depth){const e=grow(p,d,len,r,r*.62,lv===2?3:2,-.02,.06);
  st.limb+=BIO.tube('barkB',FJ(e,{parentR:r*1.4}),barkCol(S,depth+1),{seg:lv===2?6:4,cap:r>.12});st.forks++;
  const end=e[e.length-1];
  if(depth<(lv===2?2:1)&&(depth===0||rng()<.75)){const n=ri(2,3),a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),el=rr(.95,1.25);fork(end,dirOf(a,el),len*rr(.62,.8),r*.62,depth+1);}}
  else tips.push(end);}
 const e0=trunk[trunk.length-1],n0=ri(2,3),a0=rr(0,TAU);
 for(let k=0;k<n0;k++){const a=a0+k/n0*TAU+rr(-.2,.2);fork(e0,dirOf(a,rr(.85,1.15)),(H-fy)*rr(.42,.55),T.rb*.6,0);}
 for(const t of tips){const bh=rr(1.6,2.6)*(R/4.5),bw=bh*rr(.9,1.15);
  BIO.put(win?'bellC':'bell',[t.x,t.y+bh*.12,t.z],qEuler(0,rr(0,TAU),0),[bw,bh,bw],bright(vary(bc,.02,.06,.05),rr(1,1.15)));st.clumps++;
  if(lv===2)for(let j=0,m=ri(1,3);j<m;j++){const a=rr(0,TAU),d=bw*rr(.25,.45),s=rr(.55,.75);
   BIO.put(win?'bellC':'bell',[t.x+Math.cos(a)*d,t.y-bh*rr(.05,.25),t.z+Math.sin(a)*d],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[bw*s,bh*s,bw*s],bright(vary(bc,.02,.06,.05),rr(.95,1.1)));st.clumps++;}}
 regTree(T,S,R*1.1,H+1);};
// 2 THE MIST FRILL (W): the frost frill's cousin in the cloud, shorter and leaning, its fins furred (the fins' card tinted copper-teal),
// fog drip hanging under the whorls and veil thread hung from them: the veiled rim's signature tree
B[2]=function(T,st,lv){const S=SP[2],H=T.H,R=T.crownR,la=rr(0,TAU);const c=column(T,S,H,T.rb,T.rb*.3,rr(.06,.14),la,lv,8);st.trunk+=c.tris;
 const fc=C(pick(S.leaf)),vc=C(pick(PAL.veil)),step=lv===2?rr(1.0,1.4):rr(2.2,3);let n=0;
 for(let y=H*rr(.18,.26);y<H*.95;y+=step){const u=y/H,p=along(c.ax,u),nn=lv===2?ri(4,6):3,a0=rr(0,TAU),L=(R*Math.pow(1-u,.6)+.6)*rr(.85,1.1);
  for(let k=0;k<nn;k++){const a=a0+k/nn*TAU+rr(-.2,.2),el=mix(.35,.8,u)+rr(-.1,.1),d=dirOf(a,el),x=p.x+Math.cos(a)*p.r*.8,z=p.z+Math.sin(a)*p.r*.8;
   BIO.put('finM',[x,p.y,z],qBasis([-Math.sin(a),0,Math.cos(a)],d),[L,L,L],bright(vary(fc,.03,.08,.06),mix(.85,1.1,u)));n++;
   const tx=x+d[0]*L*.55,ty=p.y+d[1]*L*.55,tz=z+d[2]*L*.55;   /* half way out the fin: its underside */
   if(lv===2&&rng()<.55)BIO.put('drip',[tx,ty-.05,tz],qEuler(0,a,0),[L*.45,rr(.5,1.1),1],bright(vary(fc,.02,.05,.05),1.1));
   if(lv===2&&rng()<.3){BIO.put('veil',[tx,ty,tz],qEuler(0,rr(0,TAU),0),[rr(.4,.7),rr(1.4,3.2),1],bright(vary(vc,.02,.06,.06),1.05));st.veils++;}}}
 st.fins+=n;regTree(T,S,R+.6,H+.8);};
// 3 THE LOBE LARCH (W): a stringy plum bole, three to five limbs forking once, each ending in pads of lobed leaves that turn violet and gold
// in autumn (RRIM.AUTUMN, or the tree's own early turn in a cold hollow) and fall. Kin of the Rift's lobe tree, made deciduous
B[3]=function(T,st,lv){const S=SP[3],H=T.H,R=T.crownR,aut=RRIM.AUTUMN||BIO.field('cold',T.x,T.z)>.5&&rng()<.25,lc=C(pick(aut?S.gold:S.leaf)),item=aut?'lobeA':'lobe';
 const trunk=grow({x:T.x,y:T.y0-.3,z:T.z},[rr(-.05,.05),1,rr(-.05,.05)],H*.82,T.rb,T.rb*.3,lv===2?5:3,0,.05);
 st.trunk+=BIO.tube('barkL',trunk,barkCol(S,0),{seg:lv===2?8:5,cap:true});
 const spots=[],nL=lv===2?ri(4,6):ri(2,3);
 for(let k=0;k<nL;k++){const u=mix(.35,.85,(k+rng())/nL),p=along(trunk,u),a=k*GOLD+rr(-.3,.3),el=rr(.25,.6),L=R*rr(.65,1.05)*(1.1-u*.4);
  const limb=grow(p,dirOf(a,el),L,p.r*.55,.05,lv===2?3:2,.08,.12);st.limb+=BIO.tube('barkL',FJ(limb,{parentR:p.r}),barkCol(S,k+1),{seg:lv===2?5:3});st.forks++;
  const e=limb[limb.length-1];spots.push(e,along(limb,.6));
  if(lv===2&&rng()<.8){const s2=grow(along(limb,.55),dirOf(a+rr(-.9,.9),el+.35),L*.5,.06,.03,2,.05,.1);st.limb+=BIO.tube('barkL',FJ(s2,{parentR:.08}),barkCol(S,k+2),{seg:3});spots.push(s2[s2.length-1]);}}
 spots.push(trunk[trunk.length-1]);
 for(const p of spots){const n=lv===2?ri(2,3):1;for(let j=0;j<n;j++){const s=R*rr(.28,.4);BIO.put(item,[p.x+rr(-.4,.4),p.y+rr(-.2,.3),p.z+rr(-.4,.4)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.55,s],
  bright(vary(lc,.03,.1,.07),rr(.95,1.15)),{n:[rr(-.3,.3),1,rr(-.3,.3)]});st.clumps++;}}
 regTree(T,S,R*1.1,H+1);};
// 4 THE LANTERN LOBELIA (S): a 3-5 m spike of hairy bracts over its rosette, the barrens' only tall thing; a core inside it glows faintly
// blue on cold nights (RRIM.night: the host's clock). The card is the whole plant; a stalk and the core stand inside it
B[4]=function(T,st,lv){const S=SP[4],H=T.H,R=T.crownR,c=leafCol(S.leaf,1.15,.02,.05,.05);
 const rings=[0,.5,1].map((u,k)=>({x:T.x,y:T.y0-.2+H*.3*u,z:T.z,r:T.rb*(1-.3*u),yy:u*H*.3,col:barkCol(S,k)}));st.trunk+=BIO.lathe('barkS',rings,lv===2?6:4,2,2,Rg=>Rg.r,null);
 const a=rr(0,TAU);BIO.put('lantern',[T.x,T.y0-.1,T.z],qEuler(0,a,0),[H*.42,H,H*.42],c);
 if(lv===2)BIO.put('lantern',[T.x,T.y0-.1,T.z],qEuler(0,a+.5,0),[H*.38,H*.96,H*.38],bright(c,.95));
 BIO.put('glow',[T.x,T.y0+H*.28,T.z],null,[T.rb*1.1,H*.55,T.rb*1.1],0xffffff);st.spikes++;
 regTree(T,S,R+.4,H+.5);};

// ---------------------------------------------------------------- impostors (the far canopy): ebadlands' recipe
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const cheap=BIO.lodD(T.x,T.z)>BIO.LOD().far;let tris=0;const kk=BIO._lodKey(T.x,T.z);
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const F=S.far||{poleU:.35},bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
 if(F.cone){const lc=bright(S.leaf[fi%S.leaf.length],.95).convertSRGBToLinear(),R=T.crownR*(F.narrow==null?1:F.narrow),n=cheap?2:F.cone,seg=cheap?5:7;
  const ring=(y,r,c)=>{const o=[];for(let s=0;s<seg;s++){const a=s/seg*TAU+fi;o.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),.35,Math.sin(a),c.r,c.g,c.b]);}return o;};
  const tri=(a,b,c)=>{vtx(...a);vtx(...b);vtx(...c);tris++;};
  const base=T.y0+T.H*.08,P0=ring(T.y0-.3,T.rb,bc),P1=ring(base+.5,T.rb*.7,bc);
  for(let s=0;s<seg;s++){const s1=(s+1)%seg;tri(P0[s],P1[s1],P1[s]);tri(P0[s],P0[s1],P1[s1]);}
  for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,y0=base+(T.H-T.H*.08)*u0*.82,y1=base+(T.H-T.H*.08)*Math.min(1,u1*1.05+.05),r0=R*Math.pow(1-u0*.85,.9),sh=.75+.25*u0;
   const c=new T3.Color(lc.r*sh,lc.g*sh,lc.b*sh),Rg=ring(y0,r0,c),tip=[T.x,y1,T.z,0,1,0,lc.r,lc.g,lc.b];
   for(let s=0;s<seg;s++){const s1=(s+1)%seg;tri(Rg[s],tip,Rg[s1]);tri(Rg[s],Rg[s1],[T.x,y0+.2,T.z,0,-1,0,c.r*.7,c.g*.7,c.b*.7]);}}
  for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;return;}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2)),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=cheap?4:6,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.2,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const o=b[5]||{};const y=T.y0+T.H*b[0],rx=R*b[1],ry=T.H*b[2];blob(T.x+Math.cos(a0)*(o.off?R*o.off:0),y,T.z+Math.sin(a0)*(o.off?R*o.off:0),rx,ry,colOf(b[3]),colOf(b[4]),fi+bi);});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('riftrim: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,forks:0,clumps:0,fins:0,veils:0,spikes:0,fruit:0,heroes:0,fars:0,byS:SP.map(()=>0)});
// keep-clear between trees: core/space (KSPACE), not a hash of the kit's own
let SPACE=null;const blocked=(x,z,pad)=>SPACE.some(x,z,pad+4,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
RRIM.blocked=(x,z,pad)=>!!SPACE&&blocked(x,z,pad||0);
RRIM.buildTrees=function(R,q,opt){const recOnly=!!(opt&&opt.records);reseed(750031);q=q==null?1:q;R=R||3000;means();
 const st=newStats(),TREES=RRIM.TREES;TREES.length=0;SPACE=KSPACE.create({cell:60});const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],rk=RRIM.rimK(S),opt=P.opt||{},pad=opt.pad==null?3:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  if(rk<=0)return 0;
  BIO.grid(P.cell,0,R,(x,z)=>{const Z=zones(x,z);const a=P.accept(Z,x,z)*rk;if(a<=0)return 0;return a*(opt.lodK?lerp(1,BIO.lod(x,z),opt.lodK):1)*q;},
   (x,y,z)=>{if(blocked(x,z,pad))return;const T=RRIM.make(sp,x,y,z);if(opt.size)opt.size(T,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);if(recOnly)delete T.lv;else if(T.lv===0&&!S.far)return;
    TREES.push(T);SPACE.insert({x,z,r:T.rb*1.4+1},x,z,T.rb*1.4+1);n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale==null?.01:opt.patchScale,pad:pad+2});
  return n;}
 RRIM.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(!recOnly){if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}}st.byS[T.sp]++;});
 RRIM.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,fins:st.fins,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
RRIM._canopyH=function(x,z){let h=0;for(const T of RRIM.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||4;};
RRIM.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of RRIM.TREES){if(T.sp!==sp||(T.lv!=null&&T.lv<2)||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The rim weight (SPECIES.rim, RRIM.rimK) multiplies each: a species of another rim grows nothing here.
const stand=(x,z,s)=>RRIM.standOf(x,z,2,s);
RRIM.PASSES=[
 // the glass forest: frost frills in stands over the lakes, bell firs between them (a stand is one or the other), thinning upslope to the
 // tree line; on the W rim the frills only where the glass forest meets the cloud
 {sp:0,cell:20,accept:(Z,x,z)=>(Z.montane*.62+Z.lake*.25*Z.tree)*(stand(x,z,61)===0?1:.35)*smooth(.62,.48,Z.cold)*(1-Z.fog*.4),opt:{pad:2.5,patch:.4,patchScale:.008}},
 {sp:1,cell:19,accept:(Z,x,z)=>(Z.montane*.55+Z.alpine*.12*smooth(.7,.58,Z.cold))*(stand(x,z,61)===1?1:.4),opt:{pad:2.5,patch:.45,patchScale:.008}},
 // the cloud belt: mist frills where the fog sits, lobe larches below and among them, down onto the basin plain's upper edge
 {sp:2,cell:17,accept:(Z)=>(Z.montane*.7+Z.shore*.08)*smooth(.15,.5,Z.fog),opt:{pad:2,patch:.45,patchScale:.01}},
 {sp:3,cell:22,accept:(Z)=>Z.montane*.32*(.4+.6*Z.fog)+Z.shore*.16*smooth(.15,.28,Z.cold)+Z.lake*.12*Z.tree,opt:{pad:2.5,patch:.55,patchScale:.01}},
 // the barrens' beacons: one lantern lobelia standing over a field, a few on the sheltered alpine flats
 {sp:4,cell:38,accept:(Z)=>Z.alpine*.3*Z.gentle+Z.montane*.06*smooth(.5,.6,Z.cold),opt:{pad:3,patch:.5,small:true,lodK:.3}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants; BIO.kin reads these)
RRIM.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
RRIM.grow=function(T,lv){means();const st=newStats();T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
