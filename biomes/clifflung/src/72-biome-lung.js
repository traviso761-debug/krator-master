// ================================================================= CLIFF LUNGS — the lungs drawn: rings, bores, sphincters, mouths, collars, combs, bells, fringes, husks,
// and the breath meadows (fall-out lawns, dew coils, rime caps). PLAN.md sections 6, 7, 12.
// The builders draw the records LUNG.layout made (41-biome-lung-data.js); they decide nothing about where. Every item is a unit geometry on the
// biome core (BIO.def / BIO.put), so the inspector, the LOD and the export see it as they see the trees.
// THE RINGS: a ring is drawn as sub-segments along the lung's centreline (10 m each, so the pipe follows the face), each an instance of one unit
// tube whose ribs climb in a helix, one sixth of a turn a unit, so consecutive segments meet rib to rib. A ring's instances carry its pressure
// band (LUNG.bandAt of its birth pressure) as their colour; the mirror lung's are drawn with x negated, so its helix turns left.
// THE BREATH, on core/biome's breath mode (BIO.animHook 'breath'), five states the host sets once a frame (89l-host-breath.js):
//   lungsheen  the condensation engine's share (LUNG.engines latent / .3): the skin wets and darkens as it passes each ring's lag, the lag rising
//              foot to tip, so the wet front climbs the lung through the morning and falls back toward dusk (the condensation ladder)
//   lungslack  the sphincters narrowing on the slack breath (LUNG.roleK 'sphincter')
//   lungdraw   the noon draw: the bells' fringe streams inward
//   lungcold   the cold breath: the outer fringe streams outward
//   lungdrip   the collars' drip
// NOTHING GLOWS (the owner, 2026-11-02): no item here is emissive or additive.
(function(){const {TAU,clamp,smooth,mix}=BIO.fn;
const T3=BIO.host.THREE;
BIO.kit('lung');
const LP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('lung',n):null;
const TX=n=>{const L=LP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4});[t.map,t.normalMap,t.roughnessMap].forEach(m=>{if(m){m.wrapS=m.wrapT=T3.RepeatWrapping;}});return t;};
const white=g=>{const n=g.attributes.position.count,c=new Float32Array(n*3).fill(1);g.setAttribute('color',new T3.BufferAttribute(c,3));return g;};
const RIBS=6,RIBAMP=.045;
const ridge=f=>{const c=.5+.5*Math.cos(TAU*f);return c*c*c;};
// ---------------------------------------------------------------- the unit tube: y 0..1 along the axis, radius 1 (outer) or 1 - wall (the bore)
function tube(R,nr,ny,inner,ribAmp){const pos=[],nor=[],uv=[],col=[],idx=[];
 for(let j=0;j<=ny;j++){const y=j/ny;for(let i=0;i<=nr;i++){const a=i/nr*TAU,f=RIBS*a/TAU+y,rg=ridge(f-Math.floor(f)),r=R*(1+(inner?-1:1)*ribAmp*rg);
  pos.push(Math.cos(a)*r,y,Math.sin(a)*r);nor.push(Math.cos(a)*(inner?-1:1),0,Math.sin(a)*(inner?-1:1));uv.push(i/nr*4,y*2);const c=inner?.7+.3*rg:.8+.2*rg;col.push(c,c,c);}}
 for(let j=0;j<ny;j++)for(let i=0;i<nr;i++){const a=j*(nr+1)+i,b=a+nr+1;if(inner)idx.push(a,a+1,b,b,a+1,b+1);else idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);return g;}
/* geometries joined as one non-indexed soup (position and normal; BIO.def welds and indexes it) */
function mergeNI(G){const P=[],N=[];G.forEach(g=>{P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);});
 const m=new T3.BufferGeometry();m.setAttribute('position',new T3.Float32BufferAttribute(P,3));m.setAttribute('normal',new T3.Float32BufferAttribute(N,3));return m;}
const lathe=(pts,seg)=>white(new T3.LatheGeometry(pts.map(p=>new T3.Vector2(p[0],p[1])),seg==null?20:seg));
// ---------------------------------------------------------------- materials
const BM=(key,o)=>BIO.animMat('lung:'+key,Object.assign({mode:'breath',vertexColors:true},o));
const skinT=TX('lung.skin'),boreT=TX('lung.bore'),collarT=TX('lung.collar'),huskT=TX('lung.husk'),combT=TX('lung.comb');
const withMaps=(m,t,ns)=>{if(t){if(t.normalMap){m.normalMap=t.normalMap;m.normalScale=new T3.Vector2(ns==null?.8:ns,ns==null?.8:ns);}if(t.roughnessMap)m.roughnessMap=t.roughnessMap;}return m;};
const M={
 skin:withMaps(BM('skin',{tex:skinT&&skinT.map,pbr:{roughness:.72},breath:{key:'lungsheen',shape:'bulge',amp:.012,albedo:.72,rough:-.42}}),skinT),
 bore:withMaps(BM('bore',{tex:boreT&&boreT.map,pbr:{roughness:.45},breath:{key:'lungsheen',shape:'bulge',amp:0,rough:-.3}}),boreT),
 joint:BM('joint',{pbr:{roughness:.6},breath:{key:'lungslack',shape:'bulge',amp:-.16}}),
 husk:withMaps(new T3.MeshStandardMaterial({vertexColors:true,map:huskT&&huskT.map,roughness:.95,metalness:0,side:T3.DoubleSide}),huskT,.6),
 huskbore:new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),
 mouth:withMaps(new T3.MeshStandardMaterial({vertexColors:true,map:skinT&&skinT.map,roughness:.6,metalness:0,side:T3.DoubleSide}),skinT),
 collar:withMaps(new T3.MeshStandardMaterial({vertexColors:true,map:collarT&&collarT.map,roughness:.22,metalness:0,side:T3.DoubleSide}),collarT,1),
 comb:withMaps(new T3.MeshStandardMaterial({vertexColors:true,map:combT&&combT.map,roughness:.3,metalness:0,side:T3.DoubleSide}),combT,1),
 drip:BM('drip',{pbr:{roughness:.08},breath:{key:'lungdrip',shape:'stream',amp:.6}}),
 fringe:BM('fringe',{breath:{key:'lungdraw',shape:'stream',amp:.9,top:1}}),
 fringeOut:BM('fringeout',{breath:{key:'lungcold',shape:'stream',amp:.9,top:1}}),
 hold:new T3.MeshLambertMaterial({vertexColors:true}),
 plant:new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),
};
/* a library map tiles the unit item: the skin about 3 m, the bore 2 m (their uv runs 4 round and 2 along a unit) */
// ---------------------------------------------------------------- the items
const ringG=tube(1,24,4,false,RIBAMP),boreG=tube(.7,16,2,true,.06),ringLoG=tube(1,10,1,false,0);
const jointG=lathe([[.98,-.06],[1.09,-.03],[1.12,0],[1.09,.03],[.98,.06],[.86,.02],[.84,-.02]],20);
const mouthG=lathe([[1,0],[1.02,.35],[1.12,.7],[1.32,.95],[1.5,1.08],[1.56,1.14],[1.46,1.16],[1.24,1.06],[.92,.92]],22);
const collarG=lathe([[.55,.55],[.85,.5],[1.15,.32],[1.35,.12],[1.42,-.05],[1.4,-.4]],24);
const combG=(function(){const g=tube(.86,16,1,true,0);g.translate(0,.15,0);g.scale(1,.75,1);return g;})();
const dripG=(function(){const g=new T3.SphereGeometry(1,6,4);g.scale(.5,1,.5);return white(g);})();
const bellG=lathe([[1,0],[1.06,.25],[1.22,.5],[1.55,.72],[2.05,.88],[2.55,1.0],[2.7,1.06],[2.58,1.1],[2.3,1.02]],24);
const fringeG=(function(){const g=new T3.PlaneGeometry(.35,1,1,4);g.translate(0,-.5,0);return white(g);})();
const holdG=(function(){const g=new T3.CylinderGeometry(.35,.6,1,6,1);g.translate(0,.5,0);return white(g);})();
/* the dew coil: a crozier that never unrolls, wound right-handed (the Wall's rule), beads of condensate along its curl */
const dewG=(function(){const P=[];for(let k=0;k<=10;k++)P.push(new T3.Vector3(0,k/10*.45,0));
 for(let k=1;k<=40;k++){const t=k/40,a=Math.PI-t*TAU*1.25,r=.2*(1-.78*t);P.push(new T3.Vector3(.2+Math.cos(a)*r,.45+Math.sin(a)*r,0));}
 const g=new T3.TubeGeometry(new T3.CatmullRomCurve3(P),48,.035,5,false);const parts=[g];
 [.3,.55,.8].forEach(t=>{const a=Math.PI-t*TAU*1.25,r=.2*(1-.78*t),s=new T3.SphereGeometry(.03,5,4);s.translate(.2+Math.cos(a)*r,.45+Math.sin(a)*r+.03,0);parts.push(s);});
 const m=mergeNI(parts.map(p=>p.index?p.toNonIndexed():p));
 const n=m.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++){const y=m.attributes.position.getY(i);const v=.75+.25*clamp(y/.6,0,1);c[i*3]=v;c[i*3+1]=v;c[i*3+2]=v;}
 m.setAttribute('color',new T3.BufferAttribute(c,3));return m;})();
/* the rime cap: a low grey cap with a whorl of folds, its crown crusted white (the rime) */
const rimeG=(function(){const g=new T3.SphereGeometry(1,14,6,0,TAU,0,Math.PI*.5);const p=g.attributes.position,n=p.count,c=new Float32Array(n*3);
 for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+.08*Math.cos(5*a+6*y);p.setXYZ(i,x*f,y*.42,z*f);const w=smooth(.55,.95,y),v=.55+.4*w;c[i*3]=v;c[i*3+1]=v;c[i*3+2]=v+.04*w;}
 g.setAttribute('color',new T3.BufferAttribute(c,3));g.computeVertexNormals();return g;})();
/* the fall-out lawn: a clump of jungle seedlings as geometry (three stalks, each with a pair of broad cotyledons), green at the top, the stalks paler.
   A GEOMETRY STAND-IN (KNOWN_ISSUES.md): card.fallout.lawn, the cut-out card the plan asks for, is owed (PROMPTS-NEEDED.md section 44) */
const lawnG=(function(){const P=[],Cc=[],tri=(a,b,c,ca,cb,cc)=>{P.push(...a,...b,...c);Cc.push(...ca,...cb,...cc);};const STEM=[.55,.62,.4],LEAF=[.75,1,.6],TIP=[.95,1,.75];
 for(let k=0;k<3;k++){const a=k*2.1+.4,ox=Math.cos(a)*.18*(k?1:0),oz=Math.sin(a)*.18*(k?1:0),h=.55+.25*k%2,lean=.08;
  const top=[ox+Math.cos(a)*lean,h,oz+Math.sin(a)*lean];tri([ox-.02,0,oz],[ox+.02,0,oz],top,STEM,STEM,STEM);
  for(const sd of[-1,1]){const dx=Math.cos(a+sd*1.4)*.32,dz=Math.sin(a+sd*1.4)*.32,px=-dz*.35,pz=dx*.35,tip=[top[0]+dx,top[1]+.06,top[2]+dz],m1=[top[0]+dx*.5+px,top[1]+.05,top[2]+dz*.5+pz],m2=[top[0]+dx*.5-px,top[1]+.02,top[2]+dz*.5-pz];
   tri(top,m1,tip,LEAF,LEAF,TIP);tri(top,tip,m2,LEAF,TIP,LEAF);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('color',new T3.Float32BufferAttribute(Cc,3));g.computeVertexNormals();return g;})();
M.lawn=new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide});
const A2=['aP0','aP1'];
BIO.def('lring',ringG,M.skin,{attrs:A2,label:'Lung ring (ringos): a coral-like colony\'s individual, banded by the pressure it was born at',cap:20000,capWhy:'a ring is drawn every 10 m of a 3 km lung'});
BIO.def('lringlo',ringLoG,M.skin,{attrs:A2,label:'Lung ring (ringos), far'});
BIO.def('lbore',boreG,M.bore,{attrs:A2,label:'The bore: the lung\'s ribbed inside, the film running down it'});
BIO.def('ljoint',jointG,M.joint,{attrs:A2,label:'A ring\'s joint: the sphincter that meters the bore'});
BIO.def('lhusk',ringG,M.husk,{label:'Husk (huscos): a dead lung, dry and pale, banded even dead'});
BIO.def('lhuskbore',boreG,M.huskbore,{label:'A husk\'s bore: a dry hollow road'});
BIO.def('lmouth',mouthG,M.mouth,{label:'Mouth (Uxomouđos): the lung\'s growing end on the lip'});
BIO.def('lcollar',collarG,M.collar,{label:'The weeping collar: wet black flesh dripping the day\'s condensate (Clivodeuos) into the well'});
BIO.def('lcomb',combG,M.comb,{label:'Throat comb (combos): wet black combs holding the film and the catch'});
BIO.def('ldrip',dripG,M.drip,{attrs:A2,label:'The collar\'s drip'});
BIO.def('lbell',bellG,M.mouth,{label:'Intake bell (Andemouđos): the lung\'s root end in the canopy, gaping north'});
BIO.def('lfringe',fringeG,M.fringe,{attrs:A2,label:'Strainer fringe: streams inward on the draw'});
BIO.def('lfringeout',fringeG,M.fringeOut,{attrs:A2,label:'Strainer fringe: streams outward on the cold breath'});
BIO.def('lhold',holdG,M.hold,{label:'A bell\'s holdfast: it grips and eats the rock'});
BIO.def('ldewcoil',dewG,M.plant,{label:'Dew coil (Deuocoilos): a crozier that never unrolls, holding the condensate in its curl'});
BIO.def('lrimecap',rimeG,M.plant,{label:'Rime cap: crusted white every night, wet every noon'});
BIO.def('lfallout',lawnG,M.lawn,{label:'Fall-out lawn (Gunglomagos): the hyperjungle\'s seedlings, sprouted in the exhale',cap:60000,capWhy:'a lawn of seedlings downwind of every live mouth'});
// ---------------------------------------------------------------- the drawing
const lin=c=>{const q=new T3.Color(c[0],c[1],c[2]);return q;};
const BONE=[.86,.83,.76],PALE=[.84,.8,.72];
const m4=new T3.Matrix4(),vx=new T3.Vector3(),vy=new T3.Vector3(),vz=new T3.Vector3(),q0=new T3.Quaternion();
/* a frame: y along the axis, z toward n (the face's outward normal) made square to it */
function frame(dir,n){vy.set(dir[0],dir[1],dir[2]).normalize();vz.set(n[0],n[1],n[2]);vz.addScaledVector(vy,-vz.dot(vy));if(vz.lengthSq()<1e-6)vz.set(0,0,1).addScaledVector(vy,-vy.z);vz.normalize();
 vx.crossVectors(vy,vz);m4.makeBasis(vx,vy,vz);return new T3.Quaternion().setFromRotationMatrix(m4);}
const qUpTo=(d)=>new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),new T3.Vector3(d[0],d[1],d[2]).normalize());
LUNG.DRAWN={rings:[],segs:0,mouths:0,bells:0,husks:0,lawn:0,dew:0,rime:0};
LUNG.build=function(opt){opt=opt||{};const L=opt.layout,ground=opt.ground||BIO.terrainH,normal=opt.normal,deckY=opt.deckY==null?-1e9:opt.deckY,q=opt.quality==null?1:opt.quality;
 if(!L)throw new Error('LUNG.build: opt.layout (LUNG.layout\'s result)');
 const out={lungs:L.lungs.length,segs:0,tris:0};const D=LUNG.DRAWN;const k0=BIO.kitName;BIO.kit('lung');const r0=BIO.range;
 BIO.cur='lung/lungs';
 for(const l of L.lungs){const F=l.pts.slice().reverse(),acc=[0];for(let i=1;i<F.length;i++)acc.push(acc[i-1]+Math.hypot(F[i][0]-F[i-1][0],F[i][1]-F[i-1][1],F[i][2]-F[i-1][2]));
  const total=acc[acc.length-1];let ri=0;
  for(let i=0;i+1<F.length;i++){const a=F[i],b=F[i+1];if(a[1]<deckY-70&&b[1]<deckY-70)continue;const mid=(acc[i]+acc[i+1])/2;
   while(ri+1<l.rings.length&&acc[i]>=0&&mid>sumLen(l,ri+1))ri++;const R=l.rings[ri];
   const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(d[0],d[1],d[2]),mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,nn=normal?normal(mx,mz):[0,1,0];
   const Q=frame(d,nn),rr=R.r*(total-mid<25&&!l.dead?mix(.82,1,clamp((total-mid)/25,0,1)):1);
   const band=LUNG.bandAt(R.atm).col,tip=!l.dead&&total-mid<25?clamp(1-(total-mid)/25,0,1):0;
   let c=band.map((v,j)=>v+(PALE[j]-v)*tip*.8);if(l.dead)c=band.map((v,j)=>v+(BONE[j]-v)*.68);
   BIO.owner=[mx,mz];const lag=.85*clamp(mid/total,0,1);
   BIO.range=7000;
   if(l.dead){BIO.put('lhusk',a,Q,[rr*l.hand,len,rr],lin(c));BIO.range=500;BIO.put('lhuskbore',a,Q,[rr*l.hand,len,rr],lin([.42,.38,.32]));}
   else{BIO.put('lring',a,Q,[rr*l.hand,len,rr],lin(c),{aP0:[0,0,0,1],aP1:[lag,0,0,0],label:'Lung ring (ringos) '+(R.n+1)+' of '+l.rings.length+' of '+l.id});
    BIO.range=500;BIO.put('lbore',a,Q,[rr*l.hand,len,rr],lin([.82,.76,.72]),{aP0:[0,0,0,1],aP1:[lag,0,0,0]});}
   /* the joint at a ring's foot: its sphincter (a shelf the stair rests on every tenth) */
   const js=!l.dead?ringStart(l,acc,i):0;if(js){BIO.range=1600;BIO.put('ljoint',l.rings[js].a,Q,[rr,rr,rr],lin(c.map(v=>v*.82)),{aP0:[0,0,0,1],aP1:[0,0,0,0]});}
   out.segs++;}
  /* the mouth on the lip: standing up out of the pipe's end and leaning downwind, its collar round it on the ground, the comb inside */
  if(l.mouth){const Mo=L.mouths.find(m=>m.id===l.mouth),gy=ground(Mo.x,Mo.z),ax=[Mo.lean[0]*.42,1,Mo.lean[1]*.42],Q=qUpTo(ax),c=LUNG.bandAt(l.atm1).col.map((v,j)=>v+(PALE[j]-v)*.55);
   BIO.owner=[Mo.x,Mo.z];BIO.range=6000;const y0=gy-Mo.r*.25;
   BIO.put('lmouth',[Mo.x,y0,Mo.z],Q,[Mo.r,Mo.r*1.3,Mo.r],lin(l.dead?BONE:c));
   BIO.range=2500;BIO.put('lcollar',[Mo.x,gy-.2,Mo.z],null,[Mo.collar,Mo.r*.55,Mo.collar],lin(l.dead?[.55,.52,.46]:[.12,.11,.1]));
   if(!l.dead){BIO.range=400;BIO.put('lcomb',[Mo.x,y0,Mo.z],Q,[Mo.r,Mo.r*1.3,Mo.r],lin([.16,.15,.14]));
    BIO.range=300;for(let k=0;k<18;k++){const a=k/18*TAU,rx=Mo.collar*1.36,x=Mo.x+Math.cos(a)*rx,z=Mo.z+Math.sin(a)*rx;BIO.put('ldrip',[x,ground(x,z)+.25,z],null,.06,lin([.7,.74,.76]),{aP0:[0,-1,0,1],aP1:[KRAND.unit(KRAND.hash(0x1A6,k,D.mouths,0xD41))*.6,0,0,0]});}}
   D.mouths++;}
  /* the bell at the foot: flaring, gaping out from the face and up, on holdfasts, the strainer fringe across it */
  if(l.bell){const B=L.bells.find(b=>b.id===l.bell),out2=[B.face[0]*.75,.65,B.face[1]*.75],Q=qUpTo(out2),c=LUNG.bandAt(l.atm0).col;
   BIO.owner=[B.x,B.z];BIO.range=4000;const s=B.r/2.6;BIO.put('lbell',[B.x,B.y,B.z],Q,[s*l.hand,s*1.4,s],lin(l.dead?BONE:c));
   /* the holdfasts: round the bell's narrow base, from the rock up to its underside (never into its throat) */
   for(let k=0;k<4;k++){const a=k/4*TAU+.4,hx=B.x+Math.cos(a)*s*1.25,hz=B.z+Math.sin(a)*s*1.25,hy=ground(hx,hz);if(B.y-hy<.3)continue;BIO.range=1500;BIO.put('lhold',[hx,hy-.5,hz],null,[s*.5,B.y-hy+.5+s*.15,s*.5],lin([.36,.3,.28]));}
   if(!l.dead){const ax=new T3.Vector3(out2[0],out2[1],out2[2]).normalize(),lip=new T3.Vector3(),p=new T3.Vector3();BIO.range=900;
    for(let k=0;k<28;k++){const a=k/28*TAU;lip.set(Math.cos(a)*2.55*s,1.05*s*1.4,Math.sin(a)*2.55*s).applyQuaternion(Q);p.set(B.x,B.y,B.z).add(lip);
     const inw=lip.clone().multiplyScalar(-1).addScaledVector(ax,-.4).normalize(),outw=lip.clone().normalize().addScaledVector(ax,.6).normalize(),len=s*(1.6+.8*KRAND.unit(KRAND.hash(0x1A6,k,D.bells,0xF51)));
     const fq=new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,-1,0),new T3.Vector3(0,-1,0));
     BIO.put(k%2?'lfringeout':'lfringe',[p.x,p.y,p.z],fq,[s,len,s],lin(k%2?[.44,.32,.56]:[.38,.26,.5]),{aP0:k%2?[outw.x,outw.y,outw.z,1]:[inw.x,inw.y,inw.z,1],aP1:[0,0,0,0]});}}
   D.bells++;}
  if(l.dead)D.husks++;
  BIO.record({name:(l.dead?'Husk (huscos) ':l.mirror?'Mirror lung (Levtobređos) ':'Cliff lung (Clivobređos) ')+l.id+': '+l.rings.length+' rings, '+l.len+' m, '+l.atm0.toFixed(2)+' to '+l.atm1.toFixed(2)+' atm',kind:'lung',lung:l.id,
   x:l.pts[0][0],z:l.pts[0][2],y:l.pts[l.pts.length-1][1],r:l.r,h:l.pts[0][1]-l.pts[l.pts.length-1][1]});}
 D.segs+=out.segs;
 // ---- THE BREATH MEADOWS: the fall-out lawn downwind of each live mouth, dew coils in the lawn and on the collar's fan, rime caps at the edge
 BIO.cur='lung/meadow';
 for(const W of L.lawns){const n=Math.round(W.len*W.w/6*q),u=(k,c)=>KRAND.unit(KRAND.hash(0x1A6,W.lung.length*131+k,c,0x1A3));
  for(let k=0;k<n;k++){const a=(u(k,1)*2-1),b=(u(k,2)*2-1),qq=Math.hypot(a,b);if(qq>1.15)continue;const x=W.x+W.ax*a*W.len*.5-W.az*b*W.w*.5,z=W.z+W.az*a*W.len*.5+W.ax*b*W.w*.5;
   if(BIO.waterH(x,z)>-1e8)continue;const y=ground(x,z),edge=smooth(.55,1.1,qq);
   BIO.owner=[x,z];
   if(qq<1&&u(k,3)>.08){BIO.range=650;const s=.3+.35*u(k,4)*(1-.6*edge);
    const c=[.42+.35*edge*u(k,5),.62-.22*edge,.22+.05*edge];BIO.put('lfallout',[x,y-.02,z],BIO.fn.qEuler(0,u(k,6)*TAU,0),[s*1.4,s,s*1.4],lin(c));D.lawn++;}
   else if(qq<1.05&&u(k,3)<.08){BIO.range=300;const s=.5+.5*u(k,7);BIO.put('ldewcoil',[x,y,z],BIO.fn.qEuler(0,u(k,8)*TAU,0),s,lin([.58,.5,.44]));D.dew++;}
   else if(qq>=1){BIO.range=500;const s=.25+.35*u(k,9);BIO.put('lrimecap',[x,y-.05,z],BIO.fn.qEuler(0,u(k,10)*TAU,0),s,lin([.72,.74,.76]));D.rime++;}}}
 for(const Mo of L.mouths){if(!Mo.live)continue;for(let k=0;k<10;k++){const u=c=>KRAND.unit(KRAND.hash(0x1A6,k,c,Mo.lung.length*7+0x1D3)),a=u(1)*TAU,r=Mo.collar*(1.5+u(2)*1.4),x=Mo.x+Math.cos(a)*r,z=Mo.z+Math.sin(a)*r;
  if(BIO.waterH(x,z)>-1e8)continue;BIO.owner=[x,z];BIO.range=300;BIO.put('ldewcoil',[x,ground(x,z),z],BIO.fn.qEuler(0,u(3)*TAU,0),.6+.5*u(4),lin([.58,.5,.44]));D.dew++;}}
 BIO.owner=null;BIO.range=r0;BIO.cur=null;BIO.kit(k0||'');
 return Object.assign(out,{mouths:D.mouths,bells:D.bells,husks:D.husks,lawn:D.lawn,dew:D.dew,rime:D.rime});};
/* the arc length from the foot to the start of ring i */
function sumLen(l,i){let s=0;for(let k=0;k<i&&k<l.rings.length;k++)s+=l.rings[k].len;return s;}
/* the ring (its index, 1 on) whose foot joint falls in the segment acc[i]..acc[i+1]; 0 none */
function ringStart(l,acc,i){for(let k=1;k<l.rings.length;k++){const s=sumLen(l,k);if(s>=acc[i]-1e-6&&s<acc[i+1])return k;}return 0;}
LUNG.dress=function(){return null;};
LUNG.flues=function(L){return (L||LUNG.L||{lungs:[]}).lungs.filter(l=>l.live).map(l=>l.id);};
BIO.kitEnd(LUNG);
})();
