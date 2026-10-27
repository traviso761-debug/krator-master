// node core/biome/test-leafset.js: leaves held by the stem (31b-core-leafset.js), each check with a negative.
const path=require('path'),vm=require('vm'),fs=require('fs');
const F=require('./test-foliage.js');   /* its loader: three r128, the biome head, 30-core-foliage */
const D=__dirname;
function load(){const B=F.load(fs.readFileSync(path.join(D,'30-core-foliage.js'),'utf8')),ctx=B.__ctx;
 vm.runInContext(fs.readFileSync(path.join(D,'..','rand','08-core-rand.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'31b-core-leafset.js'),'utf8'),ctx);return B;}
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
const B=load(),T=B.host.THREE;
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9),len=v=>Math.hypot(v[0],v[1],v[2]),qlen=q=>Math.hypot(q[0],q[1],q[2],q[3]),dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const rot=(q,v)=>{const Q=new T.Quaternion(q[0],q[1],q[2],q[3]),V=new T.Vector3(v[0],v[1],v[2]).applyQuaternion(Q);return[V.x,V.y,V.z];};
// ---------------------------------------------------------------- the stem
check('leafStem: an upright card\'s stem is bottom-centre; a library meta record with anchor top hangs',
 JSON.stringify(B.leafStem())==='[0.5,0.96]'&&B.leafStem({processing:{options:{anchor:'top'}}})[1]===.04&&B.leafStem('bottom')[1]===.96&&B.leafStem([.3,.8])[0]===.3);
check('  negative: an anchor that only says where the subject sits (center) does not move the stem off the bottom',B.leafStem('center')[1]===.96);
// ---------------------------------------------------------------- the card pivots at its stem
{const g=B.geo.leafCard({stem:[.5,.9]}),P=g.attributes.position,U=g.attributes.uv;let ymin=1e9,ymax=-1e9,stemUV=null;
 for(let k=0;k<P.count;k++){ymin=Math.min(ymin,P.getY(k));ymax=Math.max(ymax,P.getY(k));}
 // the uv at the origin (interpolated along the card's centre line): u .5, v the stem's
 const vAt=y=>{for(let k=0;k<P.count;k++)if(near(P.getY(k),y,1e-6))return U.getY(k);return null;};
 check('leafCard: the stem at the origin, the blade up +y (the image\'s top at the tip)',near(ymin,-.1,1e-6)&&near(ymax,.9,1e-6)&&near(vAt(.9),0,1e-6)&&near(vAt(-.1),1,1e-6),'y '+ymin.toFixed(3)+'..'+ymax.toFixed(3));
 const gf=B.geo.leafCard({stem:[.5,.9],flipY:true}),Uf=gf.attributes.uv;check('  negative: a flipped texture (a CanvasTexture) gets the flipped v',near(Uf.getY(0),1-U.getY(0),1e-9));
 const s=B.geo.spray({stem:[.5,.96]}),c=B.geo.clump({stem:true}),t=B.geo.clump();
 check('spray (and clump({stem})): three cards from one stem at the origin',s.attributes.position.count===18&&c.attributes.position.count===18);
 check('  negative: clump() with no option is the old tripod (centred, not on the origin)',t.attributes.position.count===18&&Math.abs(t.attributes.position.getY(0))>.01);}
// ---------------------------------------------------------------- a sheet drawn a plant a quad (30-core-foliage BIO.geo.cells)
{const g=B.geo.cells(B.geo.clump(),{n:3}),U=g.attributes.uv,P=g.attributes.position,t=B.geo.clump(),Pt=t.attributes.position;
 const box=q=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(let v=0;v<6;v++){const k=q*6+v;a=Math.min(a,U.getX(k));b=Math.max(b,U.getX(k));c=Math.min(c,U.getY(k));d=Math.max(d,U.getY(k));}return[a,b,c,d];};
 const b0=box(0),b1=box(1),b2=box(2),inC=(b,cx,cy)=>b[0]>=cx/3-1e-9&&b[1]<=(cx+1)/3+1e-9&&b[2]>=cy/3-1e-9&&b[3]<=(cy+1)/3+1e-9;
 check('cells: each tripod quad takes its own cell (0, 4, 8: the diagonal), inside it',inC(b0,0,0)&&inC(b1,1,1)&&inC(b2,2,2),JSON.stringify([b0,b1,b2].map(b=>b.map(x=>+x.toFixed(2)))));
 const span=(G,q,ax)=>{let a=1e9,b=-1e9;for(let v=0;v<6;v++){const x=G.array[(q*6+v)*3+ax];a=Math.min(a,x);b=Math.max(b,x);}return b-a;};
 check('cells: each quad shrinks to .6 about its own centre',Math.abs(span(P,0,1)/span(Pt,0,1)-.6)<1e-6);
 const s=B.geo.cells(B.geo.spray({stem:[.5,.96]}),{n:3,about:'origin'}),Ps=s.attributes.position,So=B.geo.spray({stem:[.5,.96]}).attributes.position;
 check('cells about the origin: a spray stays held at its stem (scaled about it)',Math.abs(Ps.getY(0)-So.getY(0)*.6)<1e-6);
 const w=B.geo.clump().attributes.uv;check('  negative: a plain clump maps the whole sheet on every quad',Math.abs(w.getX(0)-0)<1e-6||Math.abs(w.getX(0)-1)<1e-6);
 /* rects: uneven boxes (a 3-across leaf sheet), each quad inside its own box, narrowed to the box's width over height */
 const RB=[[.02,.19,.35,.81],[.35,.19,.6,.81],[.6,.19,.98,.81]],gr=B.geo.cells(B.geo.clump(),{rects:RB}),Ur=gr.attributes.uv,Pr=gr.attributes.position;
 const boxR=q=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(let v=0;v<6;v++){const k=q*6+v;a=Math.min(a,Ur.getX(k));b=Math.max(b,Ur.getX(k));c=Math.min(c,Ur.getY(k));d=Math.max(d,Ur.getY(k));}return[a,b,c,d];};
 const inR=(b,r)=>b[0]>=r[0]-1e-9&&b[1]<=r[2]+1e-9&&b[2]>=r[1]-1e-9&&b[3]<=r[3]+1e-9;
 check('cells rects: each quad takes its own box of an uneven sheet, inside it',[0,1,2].every(q=>inR(boxR(q),RB[q])),JSON.stringify([0,1,2].map(q=>boxR(q).map(x=>+x.toFixed(3)))));
 /* a quad's edge along its own u (two corners on one v) and along its own v (two corners on one u), read from the source clump's uv */
 const Ut=Pt&&t.attributes.uv,edge=(G,q,along)=>{const p=k=>[G.getX(q*6+k),G.getY(q*6+k),G.getZ(q*6+k)],uu=k=>Ut.getX(q*6+k),vv=k=>Ut.getY(q*6+k);let m=0;
  for(let a=0;a<6;a++)for(let b=0;b<6;b++){const same=along==='u'?Math.abs(vv(a)-vv(b))<1e-9:Math.abs(uu(a)-uu(b))<1e-9;if(!same)continue;const A=p(a),C=p(b);m=Math.max(m,Math.hypot(A[0]-C[0],A[1]-C[1],A[2]-C[2]));}return m;};
 const wid=(G,q)=>edge(G,q,'u'),hgt=(G,q)=>edge(G,q,'v');
 check('cells rects: a quad takes its box\'s proportions (width over height)',Math.abs(wid(Pr,1)/hgt(Pr,1)-(RB[1][2]-RB[1][0])/(RB[1][3]-RB[1][1])*wid(Pt,1)/hgt(Pt,1))<.02,(wid(Pr,1)/hgt(Pr,1)).toFixed(3));
 const gn=B.geo.cells(B.geo.clump(),{rects:RB,aspect:false});check('  negative: aspect false leaves the quad square',Math.abs(wid(gn.attributes.position,1)/hgt(gn.attributes.position,1)-wid(Pt,1)/hgt(Pt,1))<1e-6);}
// ---------------------------------------------------------------- placement
const seg={a:[0,10,0],b:[4,11,0]},d=[4/Math.hypot(4,1),1/Math.hypot(4,1),0];
{const r=B.leafOn(seg,.5,{seed:7,i:3,droop:0,pitch:0,roll:0});
 check('leafOn: the stem lands on the twig at t',near(r.p[0],2)&&near(r.p[1],10.5)&&near(r.p[2],0));
 check('leafOn: the blade leaves the twig at the angle asked (no droop, no jitter)',near(dot(r.dir,d),Math.cos(.9),1e-9),dot(r.dir,d).toFixed(6));
 const y=rot(r.q,[0,1,0]),z=rot(r.q,[0,0,1]);check('leafOn: q turns the card\'s +y to the blade and +z to its face, orthonormal',near(dot(y,r.dir),1,1e-9)&&near(dot(z,r.n),1,1e-9)&&near(dot(r.n,r.dir),0,1e-9)&&near(qlen(r.q),1,1e-12));
 check('leafOn: the face turns to the sky (its normal has a positive up component)',r.n[1]>.3,r.n[1].toFixed(3));
 // the card's stem (the middle of its bottom edge sits 0.04 below it), put by q at p, lands on the twig
 const g=B.geo.leafCard({stem:[.5,.96],w:2,h:2}),P=g.attributes.position;let yb=1e9;for(let k=0;k<P.count;k++)yb=Math.min(yb,P.getY(k));
 const w=rot(r.q,[0,yb,0]),e=[w[0]+r.p[0],w[1]+r.p[1],w[2]+r.p[2]],u=dot([e[0],e[1]-10,e[2]],d)/Math.hypot(4,1),c=[4*u,10+u,0],best=Math.hypot(e[0]-c[0],e[1]-c[1],e[2]-c[2]);
 check('a placed 2 m card meets the twig at its stem (its bottom edge within 10 cm of the twig)',best<.1&&Math.abs(yb+.08)<1e-6,best.toFixed(4)+' m');
 const dr=B.leafOn(seg,.5,{seed:7,i:3,droop:.6,pitch:0,roll:0});check('droop pulls the blade down',dr.dir[1]<r.dir[1]);
 const rx=B.leafOn(seg,.5,{seed:7,i:3,axis:'x'}),x=rot(rx.q,[1,0,0]),yy=rot(rx.q,[0,1,0]);check('axis x (a frond): +x to the blade, +y to the face',near(dot(x,rx.dir),1,1e-9)&&near(dot(yy,rx.n),1,1e-9));}
// ---------------------------------------------------------------- phyllotaxy, determinism
{const az=(r)=>{const v=[r.dir[0]-d[0]*dot(r.dir,d),r.dir[1]-d[1]*dot(r.dir,d),r.dir[2]-d[2]*dot(r.dir,d)];return v;};
 const ang=(a,b)=>Math.acos(Math.max(-1,Math.min(1,dot(a,b)/len(a)/len(b))));
 const o={seed:3,droop:0,pitch:0,roll:0};
 const s0=B.leafOn(seg,.5,Object.assign({i:0},o)),s1=B.leafOn(seg,.5,Object.assign({i:1},o));
 check('spiral: consecutive leaves 137.5 degrees round the twig',near(ang(az(s0),az(s1))*180/Math.PI,180-(180-137.5),1e-6),(ang(az(s0),az(s1))*180/Math.PI).toFixed(3));
 const a0=B.leafOn(seg,.5,Object.assign({i:0,phyl:'alternate'},o)),a1=B.leafOn(seg,.5,Object.assign({i:1,phyl:'alternate'},o));
 check('alternate: 180 degrees',near(ang(az(a0),az(a1)),Math.PI,1e-6));
 const L=B.leafAlong(seg,6,Object.assign({phyl:'opposite'},o));check('leafAlong opposite: pairs share a node, the pairs crossed',L.length===6&&near(L[0].p[0],L[1].p[0])&&!near(L[0].p[0],L[2].p[0])&&near(ang(az(L[0]),az(L[2])),Math.PI/2,1e-6));
 const W=B.leafAlong(seg,6,Object.assign({phyl:'whorl',whorl:3},o));check('whorl of 3: 120 degrees within a node',near(ang(az(W[0]),az(W[1])),2*Math.PI/3,1e-6)&&near(W[0].p[0],W[2].p[0]));
 const r1=B.leafOn(seg,.4,{seed:11,i:5}),r2=load().leafOn(seg,.4,{seed:11,i:5});
 check('deterministic: the same seed and index give the same leaf on a fresh load',JSON.stringify(r1)===JSON.stringify(r2));
 const r3=B.leafOn(seg,.4,{seed:12,i:5});check('  negative: another tree\'s seed turns it differently',JSON.stringify(r3.q)!==JSON.stringify(r1.q));
 const z=B.leafOn({a:[1,1,1],b:[1,1,1]},.5,{seed:1});check('  negative: a twig of no length still gives a finite, orthonormal leaf (no NaN)',z.q.every(Number.isFinite)&&near(qlen(z.q),1,1e-9));
 const up=B.leafOn({a:[0,0,0],b:[0,1,0]},1,{seed:2,i:1});check('a vertical twig works (its frame from another reference)',up.q.every(Number.isFinite)&&near(len(up.dir),1,1e-9));}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
