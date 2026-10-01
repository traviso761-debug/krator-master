// ================================================================= HYKKOUSOI — the Amphitriton (agent D, seeds 30600–30624)
// The seat of the Archon: the great assembly hall and refuge of the Hykkousoi on its own plinth island (DESIGN §1, §2;
// refs/civic.jpg A). Built in the local frame WITH its plinth: y = 0 is the island's foot (sea level once the city
// sinks it), +z faces the land and the drawbridge. The datums are local: the wet landing at +1, the L1 terrace and the
// great door at +12, the L2 gallery landings at +28. Four rimstone tiers step down from the top terrace to the water
// with ringed pools on the back and sides; a zigzag stair down the tiers' faces joins the wet landing to the top; the
// hall is a drum under a seven-petal vault (bone ribs, shell stretched between them, the petals rising to the spire);
// the Archon's chambers and the audience chamber are pods grown onto the drum's flanks, the shrine niche onto its
// back; a gate barnacle guards the drawbridge port. Every walkway people stand on carries a rail.
const HYK_AMPH_SM=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const HYK_AMPH_ANG=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));   // the signed angle from b to a
// an annulus sector at y between r0 and r1 over th0..th1 (x = r cos th, z = r sin th), normal up unless o.down
function hykAmphAnnulus(cx,cz,y,r0,r1,th0,th1,o){o=o||{};const nu=o.nu||Math.max(8,Math.round((th1-th0)*(r0+r1)*.5/2.2));
 return hykSurf((u,v)=>{const th=th0+(th1-th0)*u;let r=r0+(r1-r0)*v;if(o.lob)r*=1+o.lob.amp*Math.cos(o.lob.n*th);return [cx+r*Math.cos(th),y+(o.yFn?o.yFn(u,v):0),cz+r*Math.sin(th)];},nu,o.nv||2,{col:o.col,uS:(th1-th0)*(r0+r1)*.5/4,vS:(r1-r0)/4,flip:!o.down,hole:o.hole});}
// a wall band between y0 and y1 at radius rFn(th,y) over th0..th1: outward normals unless o.flip
function hykAmphBand(cx,cz,y0,y1,rFn,th0,th1,o){o=o||{};const nu=o.nu||Math.max(8,Math.round((th1-th0)*rFn(th0,y0)/2.2));
 return hykSurf((u,v)=>{const th=th0+(th1-th0)*u;const y=y0+(y1-y0)*v;const r=rFn(th,y);return [cx+r*Math.cos(th),y,cz+r*Math.sin(th)];},nu,o.nv||3,{col:o.col,uS:(th1-th0)*rFn(th0,y0)/4,vS:(y1-y0)/4,flip:o.flip,hole:o.hole});}
// a radial wall at bearing th between r0 and r1, y0 to y1; its normal faces +th unless o.flip
function hykAmphRadWall(cx,cz,th,r0,r1,y0,y1,o){o=o||{};return hykSurf((u,v)=>{const r=r0+(r1-r0)*u;return [cx+r*Math.cos(th),y0+(y1-y0)*v,cz+r*Math.sin(th)];},2,2,{col:o.col,flip:!o.flip});}
// a rail on posts along an arc of radius R about (cx,cz), height h over the floor y, open over gaps [[bearing, half-angle], ...]
function hykAmphRail(cx,y,cz,R,gaps,o){o=o||{};const col=o.col||hC(hPick(HPAL.bone));const h=o.h||1.1;const th0=o.th0||0,th1=o.th1!=null?o.th1:TAU;const n=Math.max(8,Math.round((th1-th0)*R/1.1));
 const inGap=a=>(gaps||[]).some(g=>Math.abs(HYK_AMPH_ANG(a,g[0]))<g[1]);let seg=[];
 const flush=()=>{if(seg.length>1){hykPut('hkBone',hykTube(seg,()=>.07,{seg:6,col}));kput('hkBall',seg[0],null,[.15,.12,.15],col);kput('hkBall',seg[seg.length-1],null,[.15,.12,.15],col);}seg=[];};
 for(let i=0;i<=n;i++){const a=th0+(th1-th0)*i/n;const p=[cx+R*Math.cos(a),y+h,cz+R*Math.sin(a)];if(inGap(a)){flush();continue;}seg.push(p);if(i%2===0)kput('hkPost',[p[0],y+h/2,p[2]],null,[.06,h,.06],col);}flush();}
// a lily-pad landing in the building frame. hykPad (62) takes world coordinates by its contract, but hykPut and kput
// apply the current building frame, so inside a builder it must be given LOCAL coordinates for its geometry to land
// (the mock grown pod's landing stands at twice its coordinates: reported, not edited here). Its deck record and its
// return value are then local; the record is set right here.
function hykAmphPad(lx,ly,lz,R,o){hykPad(lx,ly,lz,R,o);const w=hykW(lx,ly,lz);const d=NAV_EXTRA[NAV_EXTRA.length-1];if(d&&d.kind==='pad'){d.x0=w[0]-R;d.x1=w[0]+R;d.z0=w[2]-R;d.z1=w[2]+R;d.y=w[1];}return {x:lx,y:ly,z:lz,r:R,w};}
// pool water: one transparent lens mesh per building, a child of the building's group (so in local coordinates)
function hykAmphWater(G,geos){if(!geos.length)return null;const g=hykMerge(geos);const t=tcur();if(t){t.tris+=triOf(g);t.meshes++;}const m=new THREE.Mesh(g,MAT.hkLens);m.renderOrder=1;m.name='hyk-water';G.add(m);return m;}
// a lamp standard: a bone post rooted in a floor, a pearl (or a jar) on a bracket from its top
function hykAmphLampPost(lx,ly,lz,o){o=o||{};const col=hC(hPick(HPAL.bone));kput('hkPost',[lx,ly+.7,lz],null,[.08,1.4,.08],col);kput('hkBall',[lx,ly+.04,lz],null,[.22,.1,.22],col);
 hykLight(lx+.18,ly+1.72,lz,Object.assign({r:.2,nacre:!o.cool,bracket:[lx,ly+1.4,lz]},o));}
// ---------------------------------------------------------------- the builder
function buildHykAmph(G,o){reseed(30600+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),nac=hC(hPick(HPAL.nacre)),bone=hC(hPick(HPAL.bone)),teal=hC(hPick(HPAL.teal)),flo=hC(hPick(HPAL.floor)),poolC=hC(hPick(HPAL.teal),.85);
 const sm=HYK_AMPH_SM;const HX=0,HZ=-3;   // the hall's centre on the top terrace
 // ---- the plinth: four rimstone tiers. Each is a lathe, concave in its face with a lip proud at its rim, lobed and
 // fluted like travertine; a terrace on top (a walkway inside, the pool, the rim); the lowest tier is the sea face.
 const T=[{y0:0,y1:5,R:54},{y0:5,y1:8,R:49},{y0:8,y1:10.5,R:44.5},{y0:10.5,y1:12,R:40.5}];
 const LOB={n:11,amp:.03};const lobF=th=>1+LOB.amp*Math.cos(LOB.n*th);
 const tierL=k=>{const t=T[k];const H=t.y1-t.y0;return {H,yBase:t.y0,cx:0,cz:0,rFn:y=>t.R*(1-.035*Math.sin(Math.PI*clamp(y/H,0,1)))+.7*sm((y-(H-.9))/.9),lobes:LOB,flute:{n:30,amp:.022,sharp:1.2},noise:{amp:.02,su:6,sv:1.5,seed:31+k},nu:120,nv:8,col:k?colW:col};};
 const FRONT=.9;const A0=Math.PI/2+FRONT,A1=Math.PI/2+TAU-FRONT;   // pools and their lips keep off the front sector: the stair and the port are there
 // ---- the stair first (it fixes the wet door's bearing): zigzag flights down the tiers' faces on the front-right,
 // each flight on one tier's face, standing over the terrace below, landing on it; the last reaches the wet ledge
 let sa=Math.PI/2-.5,sdir=-1;const flights=[];
 for(let k=3;k>=0;k--){const t=T[k];const st=hykStairSpiral(0,0,()=>t.R+.35,t.y1,k?t.y0:1.2,{a0:sa,dir:sdir,w:1.2,col:bone});flights.push({k,a0:sa,a1:st.a1});sa=st.a1;sdir=-sdir;}
 const aFoot=sa;const aWet=aFoot+.17;   // the stair's foot and the wet door beside it
 // ---- the wet door into the vault, in the sea face at the wet datum (+1): a lipped hole with a tunnel to a domed chamber
 const L0=tierL(0);const wd=hykLatheAt(L0,aWet,2.36);const wetOp={p:wd.p,n:wd.n,r:1.2,ky:1.1,kind:'wetdoor'};L0.ops=[wetOp];
 const water=[];
 for(let k=0;k<4;k++){const L=k?tierL(k):L0;const t=T[k];hykPut('hkShell',hykLathe(L));
  const rTop=t.R+.7,rIn=k<3?T[k+1].R-.3:0,tc=k?colW:col;
  if(k<3){const r0=rIn+1.7,r1=rTop-1.0,py=t.y1;
   hykPut('hkShell',hykAmphAnnulus(0,0,py,rIn,r0,0,TAU,{col:tc,lob:LOB,nu:120}));          // the walkway inside the pool
   hykPut('hkShell',hykAmphAnnulus(0,0,py,r1,rTop,0,TAU,{col:tc,lob:LOB,nu:120}));         // the rim outside it
   hykPut('hkShell',hykAmphAnnulus(0,0,py,r0,r1,Math.PI/2-FRONT,Math.PI/2+FRONT,{col:tc,lob:LOB,nu:40}));   // the front sector: no pool
   // the pool: a trough sunk .7 m, mosaic basin and walls, rimstone lips on both edges, the water a hand below the rim
   hykPut('hkMosaic',hykAmphAnnulus(0,0,py-.7,r0,r1,A0,A1,{col:poolC,lob:LOB,nu:110}));
   hykPut('hkMosaic',hykAmphBand(0,0,py-.7,py+.02,th=>r0*lobF(th),A0,A1,{col:poolC,nv:2,nu:110}));
   hykPut('hkMosaic',hykAmphBand(0,0,py-.7,py+.02,th=>r1*lobF(th),A0,A1,{col:poolC,nv:2,nu:110,flip:true}));
   hykPut('hkMosaic',hykAmphRadWall(0,0,A0,r0*lobF(A0),r1*lobF(A0),py-.7,py+.02,{col:poolC,flip:true}));
   hykPut('hkMosaic',hykAmphRadWall(0,0,A1,r0*lobF(A1),r1*lobF(A1),py-.7,py+.02,{col:poolC}));
   water.push(hykAmphAnnulus(0,0,py-.22,r0,r1,A0,A1,{col:teal,lob:LOB,nu:110}));
   for(const rl of [r0-.1,r1+.1]){const pts=[];const n=Math.round((A1-A0)*rl/2.4);for(let i=0;i<=n;i++){const a=A0+(A1-A0)*i/n;const r=rl*lobF(a);pts.push([r*Math.cos(a),py+.1,r*Math.sin(a)]);}
    hykPut('hkNacre',hykTube(pts,(u,i)=>.27*(1+.22*Math.max(0,Math.cos(i*1.7))),{seg:7,col:nac}));}}
  else hykPut('hkShell',hykDisc(0,t.y1,0,rTop,{col,lobes:LOB,nu:120,nv:8}));}
 hykAmphWater(G,water);
 // ---- the wet ledge at the stair's foot, its rail, the wet landing on its stalk, the lamps
 const LR0=L0.rFn(1.0)-.4,LR1=T[0].R+3.2;const la0=aFoot-.24,la1=aWet+.3;
 hykPut('hkShell',hykAmphAnnulus(0,0,1.0,LR0,LR1,la0,la1,{col,lob:LOB,nu:24,nv:3}));
 hykPut('hkShell',hykAmphBand(0,0,-.6,1.0,th=>LR1*lobF(th),la0,la1,{col:colW,nu:24,nv:2}));
 hykPut('hkShell',hykAmphRadWall(0,0,la0,LR0*lobF(la0),LR1*lobF(la0),-.6,1.0,{col:colW,flip:true}));
 hykPut('hkShell',hykAmphRadWall(0,0,la1,LR0*lobF(la1),LR1*lobF(la1),-.6,1.0,{col:colW}));
 const aPad=aWet+.02,rPad=LR1*lobF(aPad)+3.7;const wetPad=hykAmphPad(rPad*Math.cos(aPad),1.0,rPad*Math.sin(aPad),4,{col,stalk:-1.5,own:'Amphitriton wet landing'});
 hykAmphRail(0,1.0,0,LR1-.15,[[aPad,Math.asin(3.6/LR1)]],{th0:la0+.02,th1:la1-.02,col:bone});
 hykAmphRail(wetPad.x,1.0,wetPad.z,3.6,[[aPad+Math.PI,.62],[aPad,.55]],{col:bone});   // open to the ledge and to the water
 hykAmphLampPost(wetPad.x+1.6*Math.cos(aPad+Math.PI/2),1.0,wetPad.z+1.6*Math.sin(aPad+Math.PI/2),{cool:true,bare:true,level:'wet'});
 hykDoor(wetOp,{level:'wet',kind:'wetdoor',nacre:true,depth:1.0,name:'the water gate'});
 {const an=hykLatheAt(L0,aWet+.09,3.9);hykLight(an.p[0]+an.n[0]*.42,an.p[1]+.1,an.p[2]+an.n[2]*.42,{r:.2,cool:true,level:'wet',bracket:an.p});}
 // the vault: a domed chamber hollowed in the sea tier behind the water gate, a tunnel from the gate, a floor, two jar lamps
 const VR=42,VC=[VR*Math.cos(aWet),VR*Math.sin(aWet)];const VCH=3.8;
 const vaultL={H:VCH,yBase:1.0,cx:VC[0],cz:VC[1],rFn:y=>8.2*Math.sqrt(Math.max(0,1-Math.pow(y/VCH,2.2)))+.1,nu:48,nv:12,rings:{n:5,amp:.02},noise:{amp:.02,su:4,sv:2,seed:7},flip:true,col:hC(hPick(HPAL.shell),.8)};
 hykPut('hkIn',hykLathe(vaultL),true);hykFloor(VC[0],VC[1],1.02,8.0,{col:flo,nu:40});
 {const n=[-Math.cos(aWet),0,-Math.sin(aWet)];const p0=[wd.p[0]-wd.n[0]*.2,2.36,wd.p[2]-wd.n[2]*.2];const p1=[VC[0]+Math.cos(aWet)*7.6,2.36,VC[1]+Math.sin(aWet)*7.6];
  hykPut('hkIn',hykTube([p0,[(p0[0]+p1[0])/2,2.36,(p0[2]+p1[2])/2],p1],()=>1.26,{seg:12,col:hC(hPick(HPAL.shell),.8),flip:true}),true);
  const ja=[VC[0]-n[0]*4.5,4.0,VC[1]-n[2]*4.5];for(const s of [-1,1]){const q=[VC[0]-Math.sin(aWet)*s*5.2,3.9,VC[1]+Math.cos(aWet)*s*5.2];hykLight(q[0],q[1]-.45,q[2],{r:.18,cool:true,bare:true,level:'wet',bracket:[q[0],q[1]+.2,q[2]]});}}
 const vault=hykRoom('vault',hykCirclePoly(VC[0],VC[1],6.8,16),1.02,3.6,{doors:[[wd.p[0],wd.p[2],2.4]],wealth:1});
 hykSpot(vault,'store',VC[0]-Math.cos(aWet)*3.6,VC[1]-Math.sin(aWet)*3.6,aWet,1.2,.7);hykSpot(vault,'store',VC[0]-Math.sin(aWet)*3.8,VC[1]+Math.cos(aWet)*3.8,aWet+Math.PI/2,1.2,.7);hykSpot(vault,'work',VC[0]+Math.sin(aWet)*3.8,VC[1]-Math.cos(aWet)*3.8,aWet-Math.PI/2,1.4,.8);
 // the terraces' rails: every walkway people stand on. The top terrace's rim rail opens at the stair head and the port;
 // the pools' inner walkways run free (the rimstone lip is their edge), the tier rims carry a rail on their outer edge
 for(let k=0;k<3;k++){const t=T[k];const rr=t.R+.45;const gaps=[];const f=flights.find(f=>f.k===k+1);   // the flight that lands on this terrace arrives at its a1
  if(f)gaps.push([f.a1,1.3/rr]);const f2=flights.find(f=>f.k===k);if(f2)gaps.push([f2.a0,1.3/rr]);   // the flight that leaves it
  hykAmphRail(0,t.y1,0,rr,gaps,{col:bone,h:1.05});}
 hykAmphRail(0,12,0,T[3].R+.45,[[flights[0].a0,1.3/41],[Math.PI/2,Math.asin(5/41)]],{col:bone,h:1.05});
 // ---- the hall: a lobed nacre drum from the terrace to the vault's springing, hollow (an inner skin 7 % in), the great
 // door at the front (a gate, 4.4 x 4.8), a side door into each flanking chamber, the back door into the shrine niche,
 // oval windows between; its own floor, a lobed dais at the back, a fillet onto the terrace, a cornice at the springing
 const DR=23,DH=8,DY=12;const drumL={H:DH,yBase:DY,cx:HX,cz:HZ,rFn:y=>DR+.6*Math.sin(Math.PI*y/DH),lobes:{n:14,amp:.025},noise:{amp:.015,su:5,sv:2,seed:3},nu:112,nv:14,col:nac};
 const dAt=(th,y,r,ky)=>Object.assign(hykLatheAt(drumL,th,y),{r,ky});
 const great=dAt(Math.PI/2,2.5,2.2,1.1),sideE=dAt(0,1.35,1.2,1.05),sideW=dAt(Math.PI,1.35,1.2,1.05),backD=dAt(-Math.PI/2,1.3,1.15,1.05);
 const wins=[];for(let i=0;i<12;i++){const th=i/12*TAU+Math.PI/12;if(Math.abs(HYK_AMPH_ANG(th,Math.PI/2))<.3)continue;wins.push(dAt(th,4.9,.95,1.25));}
 drumL.ops=[great,sideE,sideW,backD].concat(wins);hykPut('hkNacre',hykLathe(drumL));
 const WT=DR*.07;const inOps=drumL.ops.map(op=>({p:[op.p[0]-op.n[0]*WT,op.p[1],op.p[2]-op.n[2]*WT],r:op.r,ky:op.ky}));   // the inner skin's holes, a wall's thickness in
 hykPut('hkIn',hykLathe(Object.assign({},drumL,{rFn:y=>drumL.rFn(y)*.93,flip:true,col:hC(hPick(HPAL.shell),.9),ops:inOps})),true);
 hykFloor(HX,HZ,12.05,DR*.93-.1,{col:flo,nu:56});
 hykPut('hkFloor',hykDisc(HX,12.55,HZ-15,5.5,{col:nac,lobes:{n:9,amp:.06},nu:36}),true);hykPut('hkFloor',hykAmphBand(HX,HZ-15,12.05,12.55,th=>5.5*(1+.06*Math.cos(9*th)),0,TAU,{col:nac,nv:1,nu:36}),true);
 hykPut('hkNacre',hykFlare([HX,12.02,HZ],[0,1,0],DR*.99,3.2,{col:nac}));kput('hkLipN',[HX,DY+DH,HZ],qEuler(Math.PI/2,0,0),[DR+.5,DR+.5,2.6],nac);
 for(const w of wins)hykWin(w,{nacre:true,lit:true});
 // ---- the petal vault: seven petals spring from the drum's rim and lean in to the spire, each a shell stretched between
 // two edge ribs with a spine along its belly; they overlap at the base and at mid-height, so the vault is closed, and
 // taper to points that enter the calyx. The inner skin is the same petal 4.5 % in, wound inward.
 const NP=7,VY0=DY+DH,VH=24,R0=DR+.5,RT=7;const pitch=TAU/NP;
 const pr=u=>R0*(1-u)+RT*u+6*Math.sin(Math.PI*u),py=u=>VY0+VH*u,pa=u=>pitch*.64*(.8+.2*Math.sin(Math.PI*u))*Math.pow(1-Math.pow(u,3.5),.6),puff=u=>4.2*Math.sin(Math.PI*u);
 const petalP=(k,u,s,sc,off)=>{const ph=Math.PI/2+k*pitch;const rad=(pr(u)+puff(u)*(1-s*s))*sc+(off||0);const a=ph+s*pa(u);return [HX+rad*Math.cos(a),py(u),HZ+rad*Math.sin(a)];};
 const L2Y=28,L2K=[1,4];const uDoor=(L2Y+1.35-VY0)/VH;const DOORW=1.25,DOORK=1.1;
 const petalN=(k,u,s)=>{const p=petalP(k,u,s,1),pu=petalP(k,u+1e-3,s,1),ps=petalP(k,u,s+1e-3,1);const n=new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]).cross(new THREE.Vector3(ps[0]-p[0],ps[1]-p[1],ps[2]-p[2])).normalize();
  if(n.x*(p[0]-HX)+n.z*(p[2]-HZ)<0)n.negate();return {p,n:[n.x,n.y,n.z]};};
 const l2doors=[];
 for(let k=0;k<NP;k++){const hasDoor=L2K.indexOf(k)>=0;const hole=hasDoor?(u,v)=>Math.pow((u-uDoor)*29/(DOORW*DOORK),2)+Math.pow((2*v-1)*pa(uDoor)*pr(uDoor)/DOORW,2)<1:null;
  hykPut('hkNacre',hykSurf((u,v)=>petalP(k,u,2*v-1,1),36,24,{col:nac,uS:7,vS:5,flip:true,hole}));
  hykPut('hkIn',hykSurf((u,v)=>petalP(k,u,2*v-1,.955),36,24,{col:hC(hPick(HPAL.shell),.9),uS:7,vS:5,hole}),true);
  const ph=Math.PI/2+k*pitch;
  for(const s of [-1,0,1]){const runs=(hasDoor&&s===0)?[[0,uDoor-.1],[uDoor+.1,1]]:[[0,1]];   // the spine parts round an L2 door, knuckled at the break
   for(const [u0,u1] of runs){const pts=[];for(let i=0;i<=16;i++){const u=u0+(u1-u0)*i/16;pts.push(petalP(k,u,s,1,.14));}if(u1===1)pts.push([HX+(RT-1.3)*Math.cos(ph),VY0+VH+.7,HZ+(RT-1.3)*Math.sin(ph)]);
    hykPut('hkBone',hykTube(pts,t=>(s?.56:.82)*(1-.5*(u0+(u1-u0)*t))*(1+.18*Math.max(0,Math.cos(t*9*TAU*(u1-u0)))),{seg:8,col:bone}));
    if(u0>0)kput('hkBall',pts[0],null,[.72,.6,.72],bone);if(u1<1)kput('hkBall',pts[pts.length-1],null,[.82,.7,.82],bone);}}
  kput('hkBall',[HX+RT*Math.cos(ph),VY0+VH,HZ+RT*Math.sin(ph)],null,[.75,.6,.75],nac);
  // a small urchin spire grows from the cornice at each petal boundary
  const bth=ph+pitch/2;hykPut('hkNacre',hykLathe({H:9,cx:HX+23.0*Math.cos(bth),cz:HZ+23.0*Math.sin(bth),yBase:VY0-.2,rFn:y=>1.3*Math.pow(1-y/9,.9)+.06,nu:14,nv:9,flute:{n:7,amp:.14,sharp:1.3},twist:.6,col:nac}));
  if(hasDoor)l2doors.push({k,ph,op:Object.assign(petalN(k,uDoor,0),{r:DOORW,ky:DOORK})});}
 // the calyx the petal tips enter, the spire (fluted, twisted, ringed) and its finial with the beacon pearl
 const CY=VY0+VH-6;hykPut('hkNacre',hykLathe({H:9,yBase:CY,cx:HX,cz:HZ,rFn:y=>8.4-.3*y,lobes:{n:NP,amp:.07,ph:-Math.PI/2*NP},nu:42,nv:8,col:nac}));
 const SPH=60;hykPut('hkNacre',hykLathe({H:SPH,yBase:CY+8,cx:HX,cz:HZ,rFn:y=>5.9*Math.pow(1-y/SPH,.85)+.14,flute:{n:9,amp:.13,sharp:1.4},twist:.3,rings:{n:22,amp:.02},nu:28,nv:34,col:nac}));
 kput('hkBall',[HX,CY+8+SPH+.3,HZ],null,[.55,.8,.55],nac);hykLight(HX,CY+8+SPH+1.3,HZ,{r:.32,bare:true,level:'L2',bracket:[HX,CY+8+SPH+.9,HZ]});
 // ---- the gallery at L2 (+28): a ring floor inside the vault with a rail on its inner edge, a spiral stair down the
 // drum's inner wall to the hall floor (it starts at the gallery's edge, between the two L2 doors), a sill at each door
 const GY=L2Y-.1,GR0=19.2,GR1=22.0;const stA0=Math.PI/2+1.5*pitch;const stR=20.0;
 const stair=hykStairSpiral(HX,HZ,()=>stR,GY-.05,12.1,{a0:stA0,dir:1,w:1.2,col:bone});
 const stHole=(u,v,p)=>{const th=Math.atan2(p[2]-HZ,p[0]-HX),r=Math.hypot(p[0]-HX,p[2]-HZ);const d=HYK_AMPH_ANG(th,stA0);return d>-.06&&d<.4&&r>19.8&&r<21.6;};
 hykPut('hkFloor',hykAmphAnnulus(HX,HZ,GY,GR0,GR1,0,TAU,{col:flo,nu:120,nv:4,hole:stHole}),true);
 hykPut('hkFloor',hykAmphBand(HX,HZ,GY-.45,GY,()=>GR0,0,TAU,{col:nac,nv:1,nu:120,flip:true}),true);
 hykAmphRail(HX,GY,HZ,GR0+.2,[[stA0+.17,.24]],{col:bone,h:1.1});
 const gallery=hykRoom('landing',hykCirclePoly(HX,HZ,21,24),GY,8,{doors:l2doors.map(d=>[d.op.p[0]-d.op.n[0]*1.2,d.op.p[2]-d.op.n[2]*1.2,2.5,'bridge']),wealth:1});
 for(const d of l2doors){const ph=d.ph;hykPut('hkFloor',hykAmphAnnulus(HX,HZ,GY,GR1-.3,pr(uDoor)*.955+puff(uDoor)*.955+.2,ph-.08,ph+.08,{col:flo,nu:4,nv:2}),true);
  hykDoor(d.op,{level:'L2',nacre:true,depth:1.4,name:'L2 landing '+d.k,room:gallery.id});
  // the landing: a lily pad off the petal's belly at the door, on two ribs that spring from the drum's cornice; its rail
  // opens at the door and toward the bridge the city will hang from it; a lamp standard beside the door
  const PR=4.3;const pc=pr(uDoor)+puff(uDoor)-.35+PR;const px=HX+pc*Math.cos(ph),pz=HZ+pc*Math.sin(ph);
  hykAmphPad(px,L2Y,pz,PR,{col:nac,mat:'hkNacre',own:'Amphitriton L2 landing '+d.k});
  for(const s of [-1,1]){const a0=[HX+(DR+.4)*Math.cos(ph+s*.11),VY0-.2,HZ+(DR+.4)*Math.sin(ph+s*.11)];const b=[px-Math.cos(ph)*1.2-Math.sin(ph)*s*1.6,L2Y-.5,pz-Math.sin(ph)*1.2+Math.cos(ph)*s*1.6];
   hykPut('hkBone',hykRib(a0,b,{rise:1.4,r0:.55,r1:.32,knuckles:3,col:bone}));kput('hkBall',a0,null,[.6,.5,.6],bone);}
  hykAmphRail(px,L2Y,pz,PR*.9,[[ph+Math.PI,.62],[ph,.5]],{col:bone});
  hykAmphLampPost(px+2.4*Math.cos(ph+Math.PI/2),L2Y,pz+2.4*Math.sin(ph+Math.PI/2),{level:'L2'});}
 // ---- the flanking chambers: pods grown onto the drum's flanks at the terrace (the Archon's chambers east, the audience
 // chamber west), rooted into the drum and the terrace with fillets, lens-domed; each opens into the hall through the
 // drum's side door and onto its own L1 landing through an outer door
 const PODS=[{sx:1,name:'the Archon\'s chambers',kind:'bedroom',res:true},{sx:-1,name:'the audience chamber',kind:'hall',res:false}];
 for(const P of PODS){const cx=HX+P.sx*32,cz=HZ;const PA=9.5,PB=8.3,PC=10.2;const cy=DY+3.8;
  const thHall=P.sx>0?-Math.PI/2:Math.PI/2,thOut=-thHall;   // a pod's th runs from +z toward +x
  const elDoor=-Math.asin(Math.pow(2.5/PB,1/.95));
  const pod=hykPod({a:PA,b:PB,c:PC,e1:.95,e2:.92,cy,nu:64,nv:32,noise:{amp:.02,su:4,sv:3,seed:P.sx>0?5:9},col:nac,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)},
   openings:[{th:thHall,el:elDoor,r:1.2,ky:1.05,kind:'door',inner:true},{th:thOut,el:elDoor,r:1.2,ky:1.05,kind:'door'},{th:0,el:.1,r:.8,ky:1.25,kind:'window'},{th:Math.PI,el:.1,r:.8,ky:1.25,kind:'window'},{th:thOut+.75,el:.5,r:.6,kind:'window'},{th:thOut-.75,el:.5,r:.6,kind:'window'},{th:0,el:.8,r:.5,kind:'window'}]});
  pod.geo.translate(cx,0,cz);hykPut('hkNacre',pod.geo);pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);
  hykFloor(cx,cz,12.05,8.2,{col:flo,nu:40});
  hykPut('hkNacre',hykFlare([cx,12.02,cz],[0,1,0],8.9,2.2,{col:nac}));hykPut('hkNacre',hykFlare([HX+P.sx*(DR+.2),cy-.5,HZ],[P.sx,0,0],6.4,2.4,{col:nac}));
  let outDoor=null;for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='door'&&op.inner)continue;   // the hall side: the drum's side door is the opening
   if(op.kind==='door')outDoor=op;else hykWin(op,{nacre:true,lit:true});}
  const top=cy+PB*.97;hykPut('hkNacre',hykLathe({H:1.6,cx,cz,yBase:top-.9,rFn:y=>3.6*(1+.05*Math.sin(y*3)),nu:36,nv:5,rings:{n:3,amp:.03},col:nac}));
  hykPut('hkNacre',hykLathe({H:2.6,cx,cz,yBase:top+.7,rFn:y=>3.5*Math.sqrt(Math.max(0,1-Math.pow(y/2.6,2.3)))+.05,nu:36,nv:10,col:nac}));
  for(let i=0;i<10;i++){const a=i/10*TAU;kput('hkLens',[cx+3.3*Math.cos(a),top+1.6,cz+3.3*Math.sin(a)],null,.36,hC(hPick(HPAL.lens)));}
  hykPut('hkNacre',hykLathe({H:7,cx,cz,yBase:top+3.0,rFn:y=>.7*Math.pow(1-y/7,.85)+.05,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:.9,col:nac}));
  // the room, its spots, the lamps (a floor standard by the back wall, the sconce beside the outer door)
  const room=hykRoom(P.kind,hykCirclePoly(cx,cz,7.6,16),12.05,PB*1.1,{doors:[[HX+P.sx*DR,HZ,2.4,'hall'],[cx+P.sx*PA,cz,2.4,'landing']],residence:P.res,wealth:1});
  if(P.res){hykSpot(room,'bed',cx+P.sx*1.5,cz-4.6,0,2.1,1.0);hykSpot(room,'store',cx-P.sx*4.8,cz+3.2,Math.PI/2,1.2,.7);hykSpot(room,'food',cx+P.sx*4.6,cz+3.4,0,.8,.8);
   hykSpot(room,'hearth',cx,cz+5.2,0,1.0,1.0);hykSpot(room,'table',cx,cz+.6,0,1.6,1.2);hykSpot(room,'seat',cx-P.sx*3.6,cz-2.4,0,1.2,.9);hykSpot(room,'shrine',cx+P.sx*4.8,cz-2.6,-P.sx*Math.PI/2,.8,.6);}
  else{hykSpot(room,'table',cx,cz-2.2,0,2.2,1.2);for(const s of [-1,1])hykSpot(room,'seat',cx+s*3.8,cz+1.6,0,1.4,1.0);hykSpot(room,'seat',cx,cz+4.4,0,1.6,1.0);hykSpot(room,'store',cx-P.sx*5.2,cz-3.6,Math.PI/2,1.2,.7);}
  hykAmphLampPost(cx-P.sx*1.8,12.05,cz-6.0,{level:'L1'});
  {const an=pod.surf(((thOut+.4)/TAU%1+1)%1,clamp(.25/Math.PI+.5,.02,.98));const A=[an[0]+cx,an[1],an[2]+cz];const vx=A[0]-cx,vz=A[2]-cz,vl=Math.hypot(vx,vz)||1;
   hykLight(A[0]+vx/vl*.45,A[1]+.1,A[2]+vz/vl*.45,{r:.2,nacre:true,level:'L1',bracket:A});}
  // the outer door and its L1 landing: a lily pad beyond the terrace rim on a stalk to the tier below and two ribs
  // from the top tier's face; the rail opens at the door and toward the bridge
  hykDoor(outDoor,{level:'L1',nacre:true,depth:1.0,name:P.name+' landing door',room:room.id});
  const PR=4.0;const px=cx+P.sx*(PA+.3+PR),pz=cz;hykAmphPad(px,12.0,pz,PR,{col:nac,mat:'hkNacre',stalk:8.0,own:'Amphitriton L1 landing '+(P.sx>0?'E':'W')});
  for(const s of [-1,1]){const a0=[P.sx*(T[3].R-.2),10.9,HZ+s*2.6];hykPut('hkBone',hykRib(a0,[px-P.sx*1.4,11.5,pz+s*2.2],{rise:.4,r0:.5,r1:.3,knuckles:2,col:bone}));kput('hkBall',a0,null,[.55,.45,.55],bone);}
  const pb=P.sx>0?0:Math.PI;hykAmphRail(px,12.0,pz,PR*.9,[[pb+Math.PI,.62],[pb,.5]],{col:bone});hykAmphLampPost(px,12.0,pz+2.6,{level:'L1'});}
 // ---- the shrine niche: a small pod grown onto the drum's back, a bioluminescent jar within, the back L1 landing
 {const SA=4.6,SB=4.2,SC=4.6;const cx=HX,cz=HZ-DR-SC+1.0;const cy=DY+2.0;const elD=-Math.asin(Math.pow(.7/SB,1/.95));
  const pod=hykPod({a:SA,b:SB,c:SC,e1:.95,e2:.92,cy,nu:44,nv:24,noise:{amp:.025,su:4,sv:3,seed:12},col:nac,hollow:{t:.08,col:hC(hPick(HPAL.shell),.9)},
   openings:[{th:0,el:elD,r:1.15,ky:1.05,kind:'door',inner:true},{th:Math.PI,el:elD,r:1.15,ky:1.05,kind:'door'},{th:Math.PI/2,el:.3,r:.5,kind:'window'},{th:-Math.PI/2,el:.3,r:.5,kind:'window'}]});
  pod.geo.translate(cx,0,cz);hykPut('hkNacre',pod.geo);pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);hykFloor(cx,cz,12.05,3.9,{col:flo,nu:28});
  hykPut('hkNacre',hykFlare([cx,12.02,cz],[0,1,0],4.3,1.4,{col:nac}));hykPut('hkNacre',hykFlare([HX,cy-.3,HZ-DR-.2],[0,0,-1],3.2,1.6,{col:nac}));
  let backOut=null;for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='door'&&op.inner)continue;if(op.kind==='door')backOut=op;else hykWin(op,{nacre:true,lit:true});}
  hykPut('hkNacre',hykLathe({H:4.5,cx,cz,yBase:cy+SB*.9,rFn:y=>.5*Math.pow(1-y/4.5,.85)+.04,nu:12,nv:7,flute:{n:7,amp:.14,sharp:1.3},twist:1.1,col:nac}));
  const shrine=hykRoom('shrine',hykCirclePoly(cx,cz,3.5,14),12.05,3.6,{doors:[[cx,cz+SC,2.3,'hall'],[cx,cz-SC,2.3,'landing']],wealth:1});
  hykSpot(shrine,'shrine',cx+2.2,cz,-Math.PI/2,.8,.6);
  {const an=pod.surf(.5,clamp(.35/Math.PI+.5,.02,.98));const A=[an[0]+cx,an[1],an[2]+cz];hykLight(A[0],A[1]-.2,A[2]+.6,{r:.2,cool:true,level:'L1',bracket:A});}
  hykDoor(backOut,{level:'L1',nacre:true,depth:1.0,name:'the shrine landing door',room:shrine.id});
  const PR=4.0;const pz=cz-SC-.3-PR;hykAmphPad(cx,12.08,pz,PR,{col:nac,mat:'hkNacre',own:'Amphitriton L1 landing N'});
  hykAmphRail(cx,12.08,pz,PR*.9,[[Math.PI/2,.62],[-Math.PI/2,.5]],{col:bone});hykAmphLampPost(cx+2.6,12.08,pz,{level:'L1'});}
 // ---- the gate: a fluted barnacle on the top terrace's front edge, the drawbridge port through it (a gate, 3.8 x 4.4, with
 // a deep reveal) and a second door onto the court; its landing overhangs the rim on a stalk and two ribs
 const court=hykRoom('court',hykCirclePoly(0,25.6,5.0,14),12.04,30,{doors:[[0,HZ+DR,4.4,'hall'],[0,31.2,3.8,'gate']],wealth:1});
 for(const s of [-1,1])hykSpot(court,'seat',s*3.2,25.6,0,1.4,1.0);
 hykPut('hkMosaic',hykDisc(0,12.04,25.6,5.6,{col:colW,lobes:{n:9,amp:.05},nu:36}));
 {const gx=0,gz=35.5,GB=4.6,GTp=3.4,GH=8.0;const gL={H:GH,cx:gx,cz:gz,yBase:DY-.3,rFn:y=>GB+(GTp-GB)*Math.pow(clamp(y/GH,0,1),.8),nu:48,nv:14,flute:{n:18,amp:.07,sharp:1.5},rings:{n:8,amp:.02},noise:{amp:.03,su:5,sv:1.2,seed:21},tilt:{amp:.08,dir:-Math.PI/2},col:colW};
  const gf=Object.assign(hykLatheAt(gL,Math.PI/2,2.6),{r:1.9,ky:1.15}),gb=Object.assign(hykLatheAt(gL,-Math.PI/2,2.6),{r:1.9,ky:1.15});gL.ops=[gf,gb];
  hykPut('hkShell',hykLathe(gL));hykPut('hkIn',hykLathe(Object.assign({},gL,{rFn:y=>gL.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shell),.9),ops:[gf,gb].map(op=>({p:[op.p[0]-op.n[0]*.45,op.p[1],op.p[2]-op.n[2]*.45],r:op.r,ky:op.ky}))})),true);
  hykFloor(gx,gz,12.05,GB*.85,{col:flo,nu:30});hykPut('hkShell',hykFlare([gx,12.02,gz],[0,1,0],GB*.98,1.6,{col:colW}));
  const lidY=DY-.3+GH-.5;hykPut('hkShell',hykLathe({H:2.2,cx:gx,cz:gz,yBase:lidY,rFn:y=>3.6*Math.sqrt(Math.max(0,1-Math.pow(y/2.2,2.3)))+.05,nu:36,nv:9,col:colW}));
  for(let i=0;i<7;i++){const a=i/7*TAU;kput('hkLens',[gx+3.2*Math.cos(a),lidY+.9,gz+3.2*Math.sin(a)],null,.3,hC(hPick(HPAL.lens)));}
  hykPut('hkNacre',hykLathe({H:5,cx:gx,cz:gz,yBase:lidY+1.9,rFn:y=>.55*Math.pow(1-y/5,.85)+.04,nu:12,nv:7,flute:{n:7,amp:.14,sharp:1.3},twist:1.0,col:nac}));
  hykDoor(gf,{level:'L1',nacre:true,depth:1.3,name:'the drawbridge port'});hykDoor(gb,{level:'L1',nacre:true,depth:1.3,name:'the gate, court side',room:court.id});
  for(const s of [-1,1]){const an=hykLatheAt(gL,Math.PI/2+s*.5,4.3);hykLight(an.p[0]+an.n[0]*.45,an.p[1]+.1,an.p[2]+an.n[2]*.45,{r:.2,nacre:true,level:'L1',bracket:an.p});}
  const PR=4.5,pz=45.0;hykAmphPad(gx,12.0,pz,PR,{col:nac,mat:'hkNacre',stalk:10.5,own:'Amphitriton drawbridge port'});
  for(const s of [-1,1]){const a0=[s*3.0,9.4,T[2].R-.3];hykPut('hkBone',hykRib(a0,[s*3.0,11.5,pz+1.8],{rise:.5,r0:.5,r1:.3,knuckles:2,col:bone}));kput('hkBall',a0,null,[.55,.45,.55],bone);}
  hykAmphRail(gx,12.0,pz,PR*.9,[[-Math.PI/2,.6],[Math.PI/2,.5]],{col:bone});for(const s of [-1,1])hykAmphLampPost(gx+s*3.3,12.0,pz-.6,{level:'L1'});}
 // ---- the hall's doors, lamps, room and spots: the assembly sits in a ring about the dais
 const hall=hykRoom('hall',hykCirclePoly(HX,HZ,20.4,28),12.05,VY0+VH-DY,{doors:[[HX,HZ+DR,4.4,'court'],[HX+DR,HZ,2.4,'bedroom'],[HX-DR,HZ,2.4,'hall'],[HX,HZ-DR,2.3,'shrine']],wealth:1});
 hykDoor(great,{level:'L1',nacre:true,depth:1.9,name:'the great door',room:hall.id});hykDoor(sideE,{level:'L1',nacre:true,depth:1.75,name:'the east door',room:hall.id});
 hykDoor(sideW,{level:'L1',nacre:true,depth:1.75,name:'the west door',room:hall.id});hykDoor(backD,{level:'L1',nacre:true,depth:1.75,name:'the shrine door',room:hall.id});
 hykSpot(hall,'table',HX,HZ-14.4,0,2.4,1.2);hykSpot(hall,'hearth',HX,HZ+7.5,0,1.2,1.2);
 for(let i=0;i<6;i++){const a=.95+i*.86;hykSpot(hall,'seat',HX+9.5*Math.cos(a),HZ+9.5*Math.sin(a),-a+Math.PI/2,1.8,1.0);}
 for(const s of [-1,1]){const an=dAt(Math.PI/2+s*.17,4.0,0,1);hykLight(an.p[0]+an.n[0]*.45,an.p[1]+.1,an.p[2]+an.n[2]*.45,{r:.22,nacre:true,level:'L1',bracket:an.p});}
 for(let i=0;i<6;i++){const a=i/6*TAU+.4;const r=DR*.93;const A=[HX+r*Math.cos(a),16.5,HZ+r*Math.sin(a)];hykLight(A[0]-Math.cos(a)*.5,16.6,A[2]-Math.sin(a)*.5,{r:.22,nacre:true,level:'L1',bracket:A});}
 hykReg('The Amphitriton',0,0,62,108,{landmark:true});}
// the landmark budget (91's BUDGET.type is declared after this fragment and read only at probe time)
setTimeout(function(){if(typeof BUDGET!=='undefined'&&BUDGET.type)BUDGET.type.hyk_amphitriton='landmark';},0);
HYK.def({key:'hyk_amphitriton',name:'The Amphitriton',family:'civic',row:'Civic',w:108,d:110,h:108,r:62,inside:true,tags:{type:['civic'],wealth:'civic',lit:true,landmark:true},build:buildHykAmph});
