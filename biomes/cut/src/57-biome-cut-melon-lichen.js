// ================================================================= THE CUT — measure melons and circle lichen: records, then drawing
// [draw] Two natives the stations' planners call (CUT.plan's o.melons and o.lichen):
//   CUT.planMelons(o)  the measure melon on terrace treads (o.tread(x,z): 0..1, o.ground, o.toBowl, o.box [x0,z0,x1,z1] or o.at+o.r):
//                      a vine every ~1.6 m along the treads, 2-4 fruit each, the fruit in EXACTLY three sizes (CUT.MELON_SIZES),
//                      a share (CUT.STUCK) stuck unripe at the smallest, green, for ever (the harvest record's `stuck`)
//   CUT.planLichen(o)  circle lichen on the bare cut faces (o.bare(x,z): 0..1, o.normal(x,z) the face's normal): one thallus a cell
//                      of a 2 m lattice, its circle inside its cell so no two touch; a share hold a second circle nested inside
//                      their own (nesting, overlapping, never touching: PLAN.md section 4)
//   CUT.planLichenPlain(o)  the same lichen where a neighbour reads it in place with the warp off (section 12, exchange 7): an
//                      ordinary map lichen on the host's rock points, round-ish and irregular, its thalli touching and merging
(function(){const TAU=Math.PI*2,mix=(a,b,t)=>a+(b-a)*t;
 const U=(a,b,c,salt)=>KRAND.unit(KRAND.hash(CUT.SEED,a|0,b|0,c|0,salt|0));
 CUT.MELON_SIZES=[.24,.34,.46];CUT.STUCK=.14;
 CUT.HARVEST.measuremelon.stuck=CUT.STUCK;CUT.HARVEST.measuremelon.sizes=CUT.MELON_SIZES.slice();
 CUT.planMelons=function(o){const out=[],cell=2.2,B=o.box||[o.at[0]-o.r,o.at[1]-o.r,o.at[0]+o.r,o.at[1]+o.r];
  for(let j=Math.floor(B[1]/cell);j*cell<B[3];j++)for(let i=Math.floor(B[0]/cell);i*cell<B[2];i++){
   const x=(i+.2+.6*U(i,j,1,81))*cell,z=(j+.2+.6*U(i,j,2,81))*cell;if(o.at&&Math.hypot(x-o.at[0],z-o.at[1])>o.r)continue;
   const t=o.tread(x,z);if(t<.5||U(i,j,3,81)>t*.85)continue;if(o.clear&&!o.clear(x,z,.6))continue;
   const b=o.toBowl(x,z),W=CUT.warp(b[0],b[1],{id:i*8191+j,salt:83,bites:false}),y=o.ground(x,z),nf=1+Math.floor(U(i,j,4,81)*3),fruit=[];
   for(let f=0;f<nf;f++){const a=U(i,j,10+f,81)*TAU,d=mix(.25,.7,U(i,j,20+f,81)),stuck=U(i,j,30+f,81)<CUT.STUCK,size=stuck?0:Math.floor(U(i,j,40+f,81)*3);
    fruit.push({x:x+Math.cos(a)*d,z:z+Math.sin(a)*d,size,stuck,d:CUT.MELON_SIZES[size]});}
   out.push({x,y,z,v:Math.floor(U(i,j,5,81)*3),yaw:U(i,j,6,81)*TAU,w:mix(1.2,1.7,U(i,j,7,81)),m:W.m,fruit});}
  return out;};
 CUT.drawMelons=function(L,st){if(!L||!L.length)return{};const C=h=>new BIO.host.THREE.Color(h),PAL=CUT.PAL;let m=0,f=0,s=0;
  for(const v of L){BIO.range=700;BIO.minRange=0;CUT.putM('melon'+v.v,CUT.M4(v.m,[v.x,v.y-.05,v.z],CUT.RS(v.yaw,v.w,.62,v.w)),C(0xffffff));m++;
   BIO.range=260;for(const q of v.fruit){const y=BIO.terrainH(q.x,q.z);CUT.putM('mfruit',CUT.M4([1,0,0,0,1,0,0,0,1],[q.x,y-.04,q.z],CUT.RS(v.yaw,q.d,q.d,q.d)),C(q.stuck?PAL.stuck[f%2]:PAL.melon[q.size]));f++;if(q.stuck)s++;}}
  BIO.range=null;return{melons:m,fruit:f,stuck:s};};
 // the check (verify.py --assert): every fruit one of the three sizes, the stuck ones the smallest, the stuck share near CUT.STUCK
 CUT.checkMelons=function(L){const F=(L||[]).flatMap(v=>v.fruit),bad=F.filter(q=>CUT.MELON_SIZES.indexOf(q.d)<0||(q.stuck&&q.d!==CUT.MELON_SIZES[0])).length,st=F.filter(q=>q.stuck).length,sh=F.length?st/F.length:0;
  const by=CUT.MELON_SIZES.map(d=>F.filter(q=>q.d===d).length);return{ok:F.length>200&&!bad&&sh>.06&&sh<.25,detail:F.length+' fruit on '+(L||[]).length+' vines: sizes '+by.join(' / ')+', '+st+' stuck ('+(sh*100).toFixed(0)+'%), '+bad+' off the three sizes'};};
 CUT.planLichen=function(o){const out=[],cell=2,R=o.r==null?220:o.r;
  for(const c of o.spine){for(let j=Math.floor((c[1]-R)/cell);j*cell<c[1]+R;j++)for(let i=Math.floor((c[0]-R)/cell);i*cell<c[0]+R;i++){
    const cx=(i+.5)*cell,cz=(j+.5)*cell;if(Math.hypot(cx-c[0],cz-c[1])>R)continue;
    let dup=false;for(const t of o.spine){if(t===c)break;if(Math.hypot(cx-t[0],cz-t[1])<=R){dup=true;break;}}if(dup)continue;
    const bare=o.bare(cx,cz);if(bare<.3||U(i,j,1,85)>bare*.42)continue;
    /* the circle stays inside its cell: no two thalli touch */
    const r=mix(.12,.82,Math.pow(U(i,j,2,85),1.6)),pad=r+.08,x=i*cell+pad+(cell-2*pad)*U(i,j,3,85),z=j*cell+pad+(cell-2*pad)*U(i,j,4,85);
    const n=o.normal(x,z),k=Math.floor(U(i,j,5,85)*5),rec={x,y:o.ground(x,z),z,r,n,c:k,nest:null};
    if(r>.4&&U(i,j,6,85)<.4)rec.nest={r:r*mix(.35,.6,U(i,j,7,85)),c:(k+2)%5,dx:(U(i,j,8,85)-.5)*r*.25,dz:(U(i,j,9,85)-.5)*r*.25};
    out.push(rec);}}
  return out;};
 // the check: no two thalli touch (a 4 m hash of their centres), every nested circle inside its own
 CUT.checkLichen=function(L){const H=new Map(),k=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);let touch=0,out=0;(L||[]).forEach(q=>{const kk=k(q.x,q.z);if(!H.has(kk))H.set(kk,[]);H.get(kk).push(q);});
  for(const q of L||[]){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=H.get((Math.floor(q.x/4)+a)+','+(Math.floor(q.z/4)+b));if(c)for(const o of c)if(o!==q&&Math.hypot(o.x-q.x,o.z-q.z)<o.r+q.r)touch++;}
   if(q.nest&&Math.hypot(q.nest.dx,q.nest.dz)+q.nest.r>=q.r)out++;}
  const nested=(L||[]).filter(q=>q.nest).length;return{ok:(L||[]).length>500&&!touch&&!out&&nested>0,detail:(L||[]).length+' thalli, '+nested+' with a circle nested inside; '+(touch/2)+' pairs touching, '+out+' nested circles past their rim'};};
 // a disc lying on the face: local z along the face's normal n
 const onFace=(n,r,p)=>{const z=n,ref=Math.abs(z[1])>.9?[1,0,0]:[0,1,0];let x=[ref[1]*z[2]-ref[2]*z[1],ref[2]*z[0]-ref[0]*z[2],ref[0]*z[1]-ref[1]*z[0]];const l=Math.hypot(...x);x=x.map(v=>v/l);
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];return[x[0]*r,x[1]*r,x[2]*r,0,y[0]*r,y[1]*r,y[2]*r,0,z[0],z[1],z[2],0,p[0],p[1],p[2],1];};
 CUT.drawLichen=function(L,st){if(!L||!L.length)return{};const C=h=>new BIO.host.THREE.Color(h),PAL=CUT.PAL;let n=0;BIO.range=320;BIO.minRange=0;
  for(const q of L){const lift=q.lift==null?.12:q.lift,p=[q.x+q.n[0]*lift,q.y+q.n[1]*lift,q.z+q.n[2]*lift];   /* over the polished face's mesh (48z: 6 cm up) */
   if(q.plain){/* a map lichen: an oval turned in the face's plane, its lobes overlapping it (planLichenPlain) */
    const F=onFace(q.n,1,[0,0,0]),X=[F[0],F[1],F[2]],Y=[F[4],F[5],F[6]],c=Math.cos(q.plain.rot),s=Math.sin(q.plain.rot);
    const a=[X[0]*c+Y[0]*s,X[1]*c+Y[1]*s,X[2]*c+Y[2]*s],b=[Y[0]*c-X[0]*s,Y[1]*c-X[1]*s,Y[2]*c-X[2]*s],disc=(r1,r2,o,k)=>{
     CUT.putM('lichen',[a[0]*r1,a[1]*r1,a[2]*r1,0,b[0]*r2,b[1]*r2,b[2]*r2,0,q.n[0],q.n[1],q.n[2],0,p[0]+a[0]*o[0]+b[0]*o[1],p[1]+a[1]*o[0]+b[1]*o[1],p[2]+a[2]*o[0]+b[2]*o[1],1],C(PAL.lichen[k]));n++;};
    disc(q.r*q.plain.ax,q.r,[0,0],q.c);for(const lb of q.plain.lobes)disc(lb.r,lb.r,[lb.u,lb.v],lb.c);continue;}
   CUT.putM('lichen',onFace(q.n,q.r,p),C(PAL.lichen[q.c]));n++;
   if(q.nest){const pn=[q.x+q.nest.dx+q.n[0]*.13,BIO.terrainH(q.x+q.nest.dx,q.z+q.nest.dz)+q.n[1]*.13,q.z+q.nest.dz+q.n[2]*.13];CUT.putM('lichen',onFace(q.n,q.nest.r,pn),C(PAL.lichen[q.nest.c]));n++;}}
  BIO.range=null;return{lichen:n};};
 // ---------------------------------------------------------------- the lichen outside the field (PLAN.md section 12, exchange 7)
 // CUT.planLichenPlain(o): circle lichen where a neighbour reads it in place with the warp off (s is 0: nhighlands' crags and pillars):
 // an ordinary map lichen, round-ish and irregular, its thalli touching and merging. o.points [{p:[x,y,z], n:[x,y,z], id}] the host's
 // bare rock (a lattice cell's index or a face sample's, stable: the colony is seeded by it, never by draw order), o.spread (.7 m),
 // o.lift (.12 m off the surface). A colony of one to four thalli a point, each an oval of radius r (.08-.5 m) with up to two lobes.
 CUT.planLichenPlain=function(o){const out=[],sp=o.spread==null?.7:o.spread,lift=o.lift==null?.12:o.lift;
  for(const P of o.points){const id=P.id|0,nt=1+Math.floor(U(id,0,1,87)*4);
   for(let k=0;k<nt;k++){const a=U(id,k,2,87)*TAU,d=k?sp*Math.sqrt(U(id,k,3,87)):0,r=mix(.08,.5,Math.pow(U(id,k,4,87),1.4)),nl=Math.floor(U(id,k,5,87)*3),lobes=[];
    for(let l=0;l<nl;l++){const b=U(id,k*4+l,6,87)*TAU;lobes.push({u:Math.cos(b)*r*.8,v:Math.sin(b)*r*.8,r:r*mix(.35,.65,U(id,k*4+l,7,87)),c:Math.floor(U(id,k*4+l,8,87)*5)});}
    /* the thallus's centre in the face's plane (the onFace basis), so a colony on a wall stays on the wall */
    const F=onFace(P.n,1,[0,0,0]),du=Math.cos(a)*d,dv=Math.sin(a)*d;
    out.push({x:P.p[0]+F[0]*du+F[4]*dv,y:P.p[1]+F[1]*du+F[5]*dv,z:P.p[2]+F[2]*du+F[6]*dv,r,n:P.n,c:Math.floor(U(id,k,9,87)*5),nest:null,lift,
     plain:{ax:mix(.7,1.3,U(id,k,10,87)),rot:U(id,k,11,87)*TAU,lobes}});}}
  return out;};
 // the check, the reverse of checkLichen's: away from the field the thalli touch and merge (pairs touching), and none is a perfect nest
 CUT.checkLichenPlain=function(L){const H=new Map(),k=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);let touch=0;(L||[]).forEach(q=>{const kk=k(q.x,q.z);if(!H.has(kk))H.set(kk,[]);H.get(kk).push(q);});
  for(const q of L||[])for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=H.get((Math.floor(q.x/4)+a)+','+(Math.floor(q.z/4)+b));if(c)for(const o of c)if(o!==q&&Math.hypot(o.x-q.x,o.y-q.y,o.z-q.z)<o.r+q.r)touch++;}
  const nested=(L||[]).filter(q=>q.nest).length;return{ok:(L||[]).length>200&&touch>0&&!nested,detail:(L||[]).length+' thalli, '+(touch/2)+' pairs touching, '+nested+' nested'};};
})();
