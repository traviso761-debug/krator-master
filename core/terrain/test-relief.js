// node core/terrain/test-relief.js — the relief functions' contract, each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const R=KRELIEF;

// ranges
const rg=R.range({a:[0,0],b:[4000,0],h:1200,w:900,seed:5});
const spine=rg(2000,0),half=rg(2000,450),foot=rg(2000,880),out=rg(2000,1000);
ok('a range is highest on its spine and zero past its foot',spine>half&&half>foot&&out===0,out!==0);
ok('the sides are steep and the top broad (half way out keeps most of the height)',half/spine>.75,half/spine<.5);
ok('the foot eases into the plain',foot<spine*.2,foot>spine*.5);
ok('the ends taper',rg(-800,0)<spine*.1&&rg(4800,0)<spine*.1,rg(-800,0)>spine*.5);
ok('the crest is serrated, not flat',Math.abs(rg(1000,0)-rg(1300,0))>1,rg(1000,0)===rg(1300,0)&&false);
ok('the same seed gives the same range',R.range({a:[0,0],b:[4000,0],h:1200,w:900,seed:5})(1234,56)===rg(1234,56),R.range({a:[0,0],b:[4000,0],h:1200,w:900,seed:6})(1234,56)===rg(1234,56));
let threw=false;try{R.range({a:[0,0],b:[0,0],h:1,w:1});}catch(e){threw=true;}ok('a range of no length is refused',threw,false);

// joins
ok('a junction is the tallest plus a quarter of the rest',R.join([1000,800])===1200,R.join([1000,800])===1800);
ok('a lone range is unchanged',R.join([700,0,-5])===700,R.join([700,0,-5])!==700);

// volcano
const vo=R.volcano({c:[0,0],h:3000,r:9000,crater:{r:500,d:250},seed:4});
const rim=vo(500.1,0),mid=vo(4500,0),apron=vo(8000,0);
ok('the crater is sunk inside its rim',vo(0,0)<rim-200,vo(0,0)>=rim);
ok('the flank is concave: half way out is well under half the height',mid<1500&&mid>0,mid>=1500);
ok('the apron runs long and low',apron>0&&apron<300,apron===0);
let g=0;for(let a=0;a<64;a++){const t=a/64*Math.PI*2,v=vo(Math.cos(t)*2000,Math.sin(t)*2000);g=Math.max(g,v);}
let lo=Infinity;for(let a=0;a<64;a++){const t=a/64*Math.PI*2;lo=Math.min(lo,vo(Math.cos(t)*2000,Math.sin(t)*2000));}
ok('gullies cut the upper flank (heights vary round a circle)',g-lo>20,g-lo<1);

// fields
const F=R.fields({seed:9});
const a=F.at(100,100),b=F.at(105,103);
ok('a field is one kind across a few metres',a.id===b.id&&a.kind===b.kind,a.id!==b.id);
const seen=new Set();for(let x=0;x<3000;x+=150)for(let z=0;z<3000;z+=150)seen.add(F.at(x,z).kind);
ok('several kinds occur',seen.size>=2,seen.size<2);
const ids=new Set();for(let x=0;x<2000;x+=40)ids.add(F.at(x,700).id);
ok('fields are about 100-340 m across (a 2 km transect crosses 5-25)',ids.size>=5&&ids.size<=25,ids.size<3);
const H=F.hedges([0,1500,0,1500]);
ok('hedges come as polylines inside the box',H.length>4&&H.every(h=>h.pts.every(p=>p[0]>=0&&p[0]<=1500&&p[1]>=0&&p[1]<=1500)),H.length===0);
const full=R.fields({seed:9,drop:0}).hedges([0,1500,0,1500]).length;
ok('some hedges are missing, so fields merge',H.length<full,H.length>=full);
const mid0=H[0].pts[Math.floor(H[0].pts.length/2)],side=0.5;
const fa=F.at(mid0[0]+side,mid0[1]+side),fb=F.at(mid0[0]-side,mid0[1]-side);
ok('a hedge lies on a field boundary',fa.i!==fb.i||fa.j!==fb.j,false);
ok('the same seed gives the same fields',R.fields({seed:9}).at(777,333).id===F.at(777,333).id,false);

// river
const ground=(x,z)=>(x<280?50-x*10/280:x<320?40-(x-280)*.5:20-(x-320)*4/280)+(x>150&&x<170?6:0);   // gentle, a 20 m fall at 280-320, gentle; a bump at 150-170
const pts=[];for(let x=0;x<=600;x+=10)pts.push([x,0]);
const W=R.river(pts,ground,{depth:1.5});
ok('the water never climbs downstream',W.every((p,i)=>i===0||p.y<=W[i-1].y),false);
ok('the water stays down over a bump in the bed',W.find(p=>p.x===160).y<=W.find(p=>p.x===140).y,ground(160,0)<=ground(140,0));
const steep=W.find(p=>p.x===300).slope,flat=W.find(p=>p.x===500).slope;
ok('slope is high at the fall and low on the flat (for foam)',steep>flat*5&&flat>=0,steep<=flat);
// ================================================================ the landform kinds (2026-10-26): records first, then the ground
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'30-core-field.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),throws=f=>{try{f();}catch(e){return true;}return false;};
ok('the kinds are listed',['wadi','pit','rille','tube','gap','stair'].every(k=>R.kinds().includes(k)),R.kinds().length<6);
ok('a record that is not a landform is refused',throws(()=>R.shape({kind:'hill'},0,0,0)),false);

// ---- meander
{const M=R.meander([0,0],[3000,0],{amp:200,wave:900,seed:3}),M2=R.meander([0,0],[3000,0],{amp:200,wave:900,seed:4});
 const sw=Math.max(...M.map(p=>Math.abs(p[1])));
 ok('a meander keeps its ends and swings about amp ('+sw.toFixed(0)+' m)',same(M[0],[0,0])&&Math.abs(M[M.length-1][0]-3000)<1e-6&&Math.abs(M[M.length-1][1])<1e-6&&sw>100&&sw<400,sw<20);
 ok('the seed sets the bends',!same(M,M2)&&same(M,R.meander([0,0],[3000,0],{amp:200,wave:900,seed:3})),same(M,M2));}

// ---- the wadi: a dry river on a plain, leaving a wall's foot on to a lower plain (the fan)
{const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);},gr=(x,z)=>(x<2000?120-.01*x:100-14*sm(2000,2080,x)-.005*(x-2000))+(x>800&&x<900?3:0)+.3*Math.sin(z*.05);   // a bump at 800-900 m the floor must not climb over
 const P=R.meander([0,0],[2000,0],{amp:90,wave:600,seed:7}),W=R.wadi({pts:P,ground:gr,w:12,bank:2.5,seed:11,pools:1});
 ok('the floor never climbs downstream',W.pts.every((p,i)=>i===0||p.y<=W.pts[i-1].y),false);
 const raw=P.map(p=>gr(p[0],p[1])-2.5);ok('(the ground under it does climb, at the bump: the rule matters)',raw.some((y,i)=>i>0&&y>raw[i-1]+1),false);
 ok('the floor is cut bank metres under the ground',W.pts.every(p=>R.shape(W,p.x,p.z,gr(p.x,p.z))<=gr(p.x,p.z)-2.5+1.0),false);
 ok('80 m off the channel the ground is untouched',[[400,80],[1200,-90]].every(([x,z])=>{const q=W.pts.reduce((m,p)=>Math.min(m,Math.hypot(p.x-x,p.z-z)),1e9);return q<60||R.shape(W,x,z,gr(x,z))===gr(x,z);}),false);
 // a bend: the outer bank (cut) is steeper than the inner (the point bar)
 let bi=-1,bt=0;for(let i=2;i<W.pts.length-2;i++){const t=Math.abs(W.pts[i].bL-W.pts[i].bR);if(t>bt){bt=t;bi=i;}}
 const bp=W.pts[bi];ok('on a bend the cut bank is steep and the point bar gentle ('+Math.min(bp.bL,bp.bR).toFixed(1)+' vs '+Math.max(bp.bL,bp.bR).toFixed(1)+' m of run)',Math.max(bp.bL,bp.bR)>2.5*Math.min(bp.bL,bp.bR),bp.bL===bp.bR);
 let lift=0;for(let s=0;s<1900;s+=3){const i=W.pts.findIndex((p,k)=>k>0&&Math.hypot(p.x-P[0][0],p.z-P[0][1])>=s);if(i<1)continue;const p=W.pts[i];for(const q of [-8,-4,0,4,8]){const y=R.shape(W,p.x,p.z+q,gr(p.x,p.z+q));lift=Math.max(lift,y-p.y);}}
 const W0=R.wadi({pts:P,ground:gr,w:12,bank:2.5,seed:11,braids:0,pools:0});let lift0=0;W0.pts.forEach(p=>{const y=R.shape(W0,p.x,p.z,gr(p.x,p.z));lift0=Math.max(lift0,y-p.y);});
 ok('gravel bars braid the floor (up to '+lift.toFixed(2)+' m proud); braids 0 leaves it bare ('+lift0.toFixed(3)+')',lift>.2&&lift0<1e-9,lift<=.2);
 ok('pools sit in hollows of the drawn floor ('+W.pools.length+'): the hollow under the water, the water under the floor\'s rim',W.pools.length>=2&&W.pools.every(p=>{const y=R.shape(W,p.x,p.z,gr(p.x,p.z)),fy=p.y+p.d*.3;return y<p.y&&p.y<fy;}),W0.pools.length>0);
 const F=W.fan,ahead=[F.x+Math.cos(F.dir)*F.r*.3,F.z+Math.sin(F.dir)*F.r*.3],side=[F.x+Math.cos(F.dir+1.9)*F.r*.3,F.z+Math.sin(F.dir+1.9)*F.r*.3];
 const dep=R.shape(W,ahead[0],ahead[1],gr(ahead[0],ahead[1]))-gr(ahead[0],ahead[1]),Wn=R.wadi({pts:P,ground:gr,seed:11,fan:false});
 ok('a fan spreads at the mouth ('+dep.toFixed(2)+' m of fill ahead), none off its sector, none without a fan',dep>.5&&R.shape(W,side[0],side[1],gr(side[0],side[1]))===gr(side[0],side[1])&&R.shape(Wn,ahead[0],ahead[1],gr(ahead[0],ahead[1]))===gr(ahead[0],ahead[1]),dep<=0);
 const parts=new Set();for(let i=0;i<W.pts.length;i+=3){const p=W.pts[i];for(const q of [0,5,11,13,14,16])parts.add((R.at(W,p.x,p.z+q,gr(p.x,p.z+q))||{part:'-'}).part);}parts.add((R.at(W,ahead[0],ahead[1],gr(ahead[0],ahead[1]))||{}).part);
 ok('at() names the parts: '+[...parts].join(', '),['floor','bar','bank','fan'].every(k=>parts.has(k)),parts.size<3);
 ok('a wadi is plain data: JSON round-trips and draws the same',same(JSON.parse(JSON.stringify(W)),W)&&R.shape(JSON.parse(JSON.stringify(W)),W.pts[9].x,W.pts[9].z,50)===R.shape(W,W.pts[9].x,W.pts[9].z,50),false);
 ok('the same seed gives the same wadi, another another',same(R.wadi({pts:P,ground:gr,w:12,bank:2.5,seed:11,pools:1}),W),same(R.wadi({pts:P,ground:gr,w:12,bank:2.5,seed:12,pools:1}),W));
 ok('a wadi needs ground and a line',throws(()=>R.wadi({pts:P}))&&throws(()=>R.wadi({pts:[[0,0]],ground:gr})),false);
 // the pavement: flat old ground away from channels, patchy; never in the channel; KFIELD's cover grid
 const h=R.apply(gr,[W]),pv=R.pavement({h,ground:gr,wadis:[W],seed:3}),pvN=R.pavement({h,seed:3}),Fa=W.fan;let actN=0,actBare=0,actNo=0;
 for(let d=6;d<Fa.r*.7;d+=2)for(let da=-.6;da<=.6;da+=.05){const x=Fa.x+Math.cos(Fa.dir+da)*d,z=Fa.z+Math.sin(Fa.dir+da)*d,a=R.at(W,x,z,gr(x,z));if(!a||a.part!=='fan'||a.active<.95)continue;actN++;if(pv(x,z)===0)actBare++;if(pvN(x,z)>0)actNo++;}
 ok('no pavement down an active fan channel ('+actBare+'/'+actN+' bare; told of no wadis, '+actNo+' of them paved)',actN>10&&actBare===actN,actNo===0);
 let cov=0,tot=0;for(let x=50;x<1900;x+=37)for(let z=150;z<600;z+=41){tot++;if(pv(x,z)>.5)cov++;}
 ok('desert pavement covers part of the flat plain ('+(cov/tot).toFixed(2)+')',cov/tot>.2&&cov/tot<.85,cov===0);
 ok('none in the channel, none on a steep slope',W.pts.every(p=>pv(p.x,p.z)===0)&&R.pavement({h:(x,z)=>.5*x})(100,100)===0,false);
 const FF=KFIELD.create({x0:0,z0:100,step:20,nx:60,nz:20}),r1=R.paintCover(FF,'pavement',pv),r2=R.paintCover(FF,'sand',()=>1);
 ok('paintCover writes a class into a KFIELD\'s cover grid ('+r1.n+' cells), and a second class only over the first\'s gaps',FF.coverNames[r1.id]==='pavement'&&r1.n>100&&r2.n===FF.nx*FF.nz-r1.n&&FF.coverAt(FF.x0,FF.z0)!==0,R.paintCover(KFIELD.create({x0:0,z0:0,step:20,nx:4,nz:4}),'p',pv,{thr:2}).n>0);}

// ---- the talus: Korona's apron, against a heightfield wall and against a stack as drawn
{const T=R.talus({footD:(x,z)=>x,h:30,reach:55,seed:44});
 ok('the apron is highest at the wall and gone by reach',T(.5,0)>20&&T(30,0)<T(5,0)&&T(56,0)===0&&T(-1,0)>0,T(56,0)>0);
 const kor=(x,z)=>{const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};return 30*Math.pow(sm(55,0,x),1.6);};
 let dev=0;for(let x=0;x<55;x+=3)dev=Math.max(dev,Math.abs(T(x,7)/kor(x,7)-1));ok('it is Korona\'s talus (within its roughness, '+dev.toFixed(2)+')',dev<=.26,dev<.01);
 const K=KSTACKS,B=K.make({id:'b',kind:'butte',x:0,z:0,y0:-3,seed:8,tiers:[{h:80,r:60}]}),ap=R.talus({bodies:[B],h:15,reach:40}),bm=K.mesh(B),b0=B.beds[0];
 let worst=Infinity,above=0;for(let a=0;a<6.28;a+=.2){const w=K.wall(B,b0,a,0),R0=Math.hypot(w.x-b0.cx,w.z-b0.cz),px=b0.cx+Math.cos(a)*(R0+.3),pz=b0.cz+Math.sin(a)*(R0+.3),t=ap(px,pz);worst=Math.min(worst,t);if(w.y>t)above++;}
 const lifted=JSON.parse(JSON.stringify(B));lifted.beds.forEach(b=>b.y+=20);let fl=0;for(let a=0;a<6.28;a+=.2){const w=K.wall(lifted,lifted.beds[0],a,0);if(w.y>ap(w.x+Math.cos(a)*.3,w.z+Math.sin(a)*.3))fl++;}
 ok('against a stack the apron leans on the drawn wall: .3 m out it stands '+worst.toFixed(1)+' m or more, over the wall\'s drawn foot everywhere; a stack lifted 20 m would float',worst>8&&above===0,fl===0);
 ok('talus needs a foot',throws(()=>R.talus({})),false);}

// ---- the pit: benches, spoil, adits
{const gr=(x,z)=>50+.01*x,Pt=R.pit({c:[0,0],r:120,depth:60,benches:6,e:1.2,ry:.4,ground:gr,seed:5,adits:2});
 const prof=[];for(let d=0;d<=125;d+=.5)prof.push(R.shape(Pt,Math.cos(1)*d,Math.sin(1)*d,gr(Math.cos(1)*d,Math.sin(1)*d)));
 ok('the floor is depth under the rim',Math.abs(prof[0]-(Pt.rimY-60))<1e-6,Math.abs(prof[0]-Pt.rimY)<1);
 let runs=0,inRun=false;for(let i=1;i<prof.length;i++){const flat=Math.abs(prof[i]-prof[i-1])<1e-9&&prof[i]<Pt.rimY-1;if(flat&&!inRun){runs++;inRun=true;}if(!flat)inRun=false;}
 ok('six benches step down (the floor a seventh flat: '+runs+')',runs===7,runs===6||runs===8);
 ok('the profile climbs outward all the way',prof.every((y,i)=>i===0||y>=prof[i-1]-1e-9),false);
 let ms=0;for(let i=1;i<prof.length;i++)ms=Math.max(ms,(prof[i]-prof[i-1])/.5);const msG=(()=>{const P2=R.pit({c:[0,0],r:120,depth:60,benches:6,face:45,ground:gr,seed:5});let m=0,p=null;for(let d=0;d<=125;d+=.5){const y=R.shape(P2,d,0,gr(d,0));if(p!=null)m=Math.max(m,(y-p)/.5);p=y;}return m;})();
 ok('a face stands at about its angle (steepest '+(Math.atan(ms)*180/Math.PI).toFixed(0)+' deg; asked 45, '+(Math.atan(msG)*180/Math.PI).toFixed(0)+')',ms>Math.tan(55*Math.PI/180)&&ms<Math.tan(75*Math.PI/180),msG>=ms);
 let rimStep=0;for(let a=0;a<6.28;a+=.3){let lo=0,hi=200;for(let it=0;it<40;it++){const m=(lo+hi)/2,x=Math.cos(a)*m,z=Math.sin(a)*m;if(R.shape(Pt,x,z,gr(x,z))<gr(x,z)-1e-9)lo=m;else hi=m;}
   const x=Math.cos(a)*(hi-.05),z=Math.sin(a)*(hi-.05);rimStep=Math.max(rimStep,gr(x,z)-R.shape(Pt,x,z,gr(x,z)));}
 ok('the rim has no step: 5 cm inside it the ground is down by '+rimStep.toFixed(2)+' m at most',rimStep<.2,false);
 ok('adits sit on the drawn face, looking into the pit ('+Pt.adits.length+')',Pt.adits.length===2&&Pt.adits.every(a=>{const y=R.shape(Pt,a.x,a.z,gr(a.x,a.z)),back=R.shape(Pt,a.x-a.nx*1.5,a.z-a.nz*1.5,gr(a.x,a.z)),fwd=R.shape(Pt,a.x+a.nx*1.5,a.z+a.nz*1.5,gr(a.x,a.z));return Math.abs(y-a.y)<.3&&back>y&&fwd<y;}),
   Pt.adits.some(a=>Math.abs(R.shape(Pt,a.x-a.nx*6,a.z-a.nz*6,gr(a.x,a.z))-a.y)<.3));
 ok('spoil heaps stand outside the rim, on the ground ('+Pt.spoil.length+')',Pt.spoil.length>=2&&Pt.spoil.every(s=>Math.abs(R.shape(Pt,s.x,s.z,gr(s.x,s.z))-gr(s.x,s.z)-s.h)<1e-6&&R.at(Pt,s.x,s.z,gr(s.x,s.z)).part==='spoil'),R.pit({c:[0,0],r:120,depth:60,benches:6,ground:gr,seed:5,spoil:false}).spoil.length>0);
 ok('benches that cannot fit are refused',throws(()=>R.pit({c:[0,0],r:60,depth:80,benches:20,ground:gr})),false);
 ok('the same seed gives the same pit',same(R.pit({c:[0,0],r:120,depth:60,benches:6,e:1.2,ry:.4,ground:gr,seed:5,adits:2}),Pt),same(R.pit({c:[0,0],r:120,depth:60,benches:6,e:1.2,ry:.4,ground:gr,seed:6,adits:2}),Pt));}

// ---- Godstep: the god's stair, a rille cut through it, a tube with its pit chain, the columns
{const ST=R.stair({a:[0,0],b:[20000,0],w:4000,steps:[{y:2700,at:5000},{y:2000,at:10000},{y:1300,at:15000},{y:600,at:20000}],seed:9}),ST0=R.stair({a:[0,0],b:[20000,0],w:4000,steps:[{y:2700,at:5000},{y:2000,at:10000},{y:1300,at:15000},{y:600,at:20000}],seed:9,wrinkle:0});
 const y0=R.shape(ST,2000,0),y1=R.shape(ST,7000,300),y3=R.shape(ST,19000,0);
 ok('the steps are broad flats at their heights (2700, 2000, ... '+y0.toFixed(0)+', '+y1.toFixed(0)+')',Math.abs(y0-2700)<3.1&&Math.abs(y1-2000)<3.1&&Math.abs(y3-600)<3.1,Math.abs(y1-2700)<3.1);
 let fr=[];for(let q=-3000;q<=3000;q+=200){let s=4000;while(R.shape(ST,s,q)>2690)s+=10;fr.push(s);}
 ok('a front is lobate: its lip wanders across the valley ('+Math.min(...fr)+'..'+Math.max(...fr)+' m)',Math.max(...fr)-Math.min(...fr)>80,Math.max(...fr)-Math.min(...fr)<10);
 const tg=ST.steps[0].tongues[0],slopeAt=q=>{let m=0,p=null;for(let s=4500;s<9000;s+=5){const y=R.shape(ST,s,q);if(p!=null)m=Math.max(m,(p-y)/5);p=y;}return m;};
 const off=(()=>{for(let q=-3800;q<3800;q+=50)if(ST.steps[0].tongues.every(t=>Math.abs(q-t.q)>3*t.w))return q;return null;})();
 ok('a tongue is a frozen lava fall: the front runs out gently there (steepest '+slopeAt(tg.q).toFixed(2)+' vs '+slopeAt(off).toFixed(2)+' off it)',slopeAt(tg.q)<slopeAt(off)*.6,slopeAt(tg.q)>=slopeAt(off));
 const benches=S2=>{let n=0;for(let s=5000;s<7000;s+=2){const a=R.shape(S2,s,off),b=R.shape(S2,s+2,off);if(Math.abs(a-b)<.02&&a<2690&&a>2010)n++;}return n;},ben=benches(ST0),ben0=benches(R.stair({a:[0,0],b:[20000,0],w:4000,steps:[{y:2700,at:5000},{y:2000,at:10000},{y:1300,at:15000},{y:600,at:20000}],seed:9,wrinkle:0,riser:0}));
 ok('off the lava falls the front is terraced: a bench on the flows\' tops ('+ben*2+' m of benches in 2 km of front; riser 0: '+ben0*2+')',ben>100,ben0>100);
 ok('older ground standing above the flows stands out (a kipuka)',R.shape(ST,7000,0,2100)===2100&&R.shape(ST,7000,0,1500)<2100,R.shape(ST,7000,0,2100)!==2100);
 ok('the flows pile up to each step\'s floor',ST.flowTops.every((y,i)=>i===0||y>ST.flowTops[i-1])&&[2700,2000,1300,600].every(y=>ST.flowTops.some(t=>Math.abs(t-y)<1e-6)),false);
 const fa=R.flowAt(ST,ST.flowTops[3]-.1),fb=R.flowAt(ST,(ST.flowTops[2]+(ST.flowTops[3]-ST.flowTops[2])*.1));
 ok('flowAt: a flow\'s foot is colonnade, its top entablature',fa.part==='entablature'&&fb.part==='colonnade'&&fa.k===3,false);
 ok('steps out of order are refused',throws(()=>R.stair({a:[0,0],b:[1,0],steps:[{y:1,at:0},{y:2,at:1}]})),false);
 // the rille: through the steps, its walls a trap staircase on the flows
 const g=(x,z)=>R.shape(ST0,x,z),M=R.meander([1000,0],[9000,0],{amp:600,wave:2500,seed:2}),RL=R.rille({pts:M,ground:g,w:700,depth:220,tops:ST0.flowTops,seed:3});
 ok('a rille\'s floor never climbs downstream',RL.pts.every((p,i)=>i===0||p.y<=RL.pts[i-1].y),false);
 const p=RL.pts[Math.floor(RL.pts.length*.3)],q=RL.pts[Math.floor(RL.pts.length*.3)+1],ux=(q.x-p.x)/Math.hypot(q.x-p.x,q.z-p.z),uz=(q.z-p.z)/Math.hypot(q.x-p.x,q.z-p.z);
 const xs=[];for(let d=0;d<=720;d+=2)xs.push(R.shape(RL,p.x-uz*d,p.z+ux*d,g(p.x-uz*d,p.z+ux*d)));
 ok('across it: the floor, then the walls climbing to the rim at w ('+xs[0].toFixed(0)+' to '+xs[xs.length-1].toFixed(0)+')',Math.abs(xs[0]-p.y)<1e-6&&xs.every((y,i)=>i===0||y>=xs[i-1]-1e-6)&&Math.abs(xs[355]-g(p.x-uz*710,p.z+ux*710))<1e-6,false);
 const pts2=new Set();for(let d=0;d<700;d+=3){const a=R.at(RL,p.x-uz*d,p.z+ux*d,g(p.x-uz*d,p.z+ux*d));if(a)pts2.add(a.part);}
 const RL0=R.rille({pts:M,ground:g,w:700,depth:220,seed:3}),pts0=new Set();for(let d=0;d<700;d+=3){const a=R.at(RL0,p.x-uz*d,p.z+ux*d,g(p.x-uz*d,p.z+ux*d));if(a)pts0.add(a.part);}
 ok('its walls step back in benches on the flows\' tops (parts: '+[...pts2].join(', ')+'); without tops a plain cliff ('+[...pts0].join(', ')+')',['floor','talus','wall','bench'].every(k=>pts2.has(k)),pts0.has('bench')||!pts2.has('bench'));
 ok('beyond w the ground is untouched',R.shape(RL,p.x-uz*760,p.z+ux*760,123)===123,false);
 // the tube under the lowest step's flats, its pit chain
 const gt=(x,z)=>600+.004*(20000-x),TP=R.meander([15500,-1000],[19500,500],{amp:150,wave:900,seed:5}),TB=R.tube({pts:TP,ground:gt,r:5,roof:4,seed:8,p:.5});
 let worstRoof=Infinity;for(let i=0;i+1<TB.pts.length;i++)for(let t=0;t<1;t+=.25){const x=TB.pts[i].x+(TB.pts[i+1].x-TB.pts[i].x)*t,z=TB.pts[i].z+(TB.pts[i+1].z-TB.pts[i].z)*t,fy=TB.pts[i].y+(TB.pts[i+1].y-TB.pts[i].y)*t;worstRoof=Math.min(worstRoof,gt(x,z)-(fy+TB.passage.h));}
 ok('the tube runs under the ground with its roof on (the least rock over its crown '+worstRoof.toFixed(2)+' m)',worstRoof>=3.9,worstRoof<3);
 const pits=TB.pits.filter(Boolean),col=pits.filter(q=>q.kind==='collapse'),sky=pits.filter(q=>q.kind==='skylight');
 ok('a pit chain along it: '+col.length+' collapses, '+sky.length+' skylights, each an opening for the cavern',col.length>=3&&sky.length>=1&&TB.openings.length===pits.length,false);
 ok('a collapse falls to the breakdown inside the tube, a skylight only sags its rim',col.every(c=>{const y=R.shape(TB,c.x,c.z,gt(c.x,c.z));return y<gt(c.x,c.z)-TB.roof&&y>TB.pts[0].y-50;})&&sky.every(c=>gt(c.x,c.z)-R.shape(TB,c.x,c.z,gt(c.x,c.z))<1.6),false);
 const mid=TB.pts.find((pp,i)=>i>3&&!pits.some(c=>Math.hypot(c.x-pp.x,c.z-pp.z)<40));
 ok('a low ridge swells over the tube ('+(R.shape(TB,mid.x,mid.z,gt(mid.x,mid.z))-gt(mid.x,mid.z)).toFixed(2)+' m); ridge 0 none',R.shape(TB,mid.x,mid.z,gt(mid.x,mid.z))-gt(mid.x,mid.z)>1,R.shape(R.tube({pts:TP,ground:gt,ridge:0,seed:8,p:0}),mid.x,mid.z,gt(mid.x,mid.z))!==gt(mid.x,mid.z));
 ok('the passage is the floor, ready for KCAVERN.tube',TB.passage.pts.length===TB.pts.length&&TB.passage.pts.every((pp,i)=>pp[1]===TB.pts[i].y),false);
 // the columns
 const C=R.columns({w:1.6,seed:4}),ids=new Set();for(let x=0;x<32;x+=.2)for(let z=0;z<32;z+=.2)ids.add(C.cell(x,z).id);
 const hexA=1.6*1.6*Math.sqrt(3)/2;ok('columns are a hexagonal lattice ('+ids.size+' in 32x32 m; a hex of 1.6 m: '+(32*32/hexA).toFixed(0)+')',Math.abs(ids.size-32*32/hexA)<32*32/hexA*.12,ids.size<100);
 const a1=C.cell(5,5),a2=C.cell(a1.cx,a1.cz);ok('a column\'s centre is in its own cell, its joint where its neighbour begins',a2.id===a1.id&&a2.d>.4&&C.relief(a1.cx,a1.cz)!==C.relief(C.cell(a1.cx+1.6,a1.cz).cx,a1.cz),false);
 ok('another seed, other columns',C.cell(5,5).cx!==R.columns({w:1.6,seed:5}).cell(5,5).cx,false);}

// ---- the SW highlands: water and wind gaps through a ridge; the joints and the tableland
{const ridge=R.range({a:[0,-3000],b:[0,3000],h:600,w:900,seed:2}),base=(x,z)=>1000+ridge(x,z);
 const WG=R.gap({a:[-1200,0],b:[1200,0],w:420,floor:[1040,1000],seed:3}),wd=R.gap({a:[-1000,1800],b:[1000,1800],w:500,floor:1350,wind:true,seed:4});
 const h=R.apply(base,[WG,wd]);
 ok('a water gap cuts the ridge to its floor (the crest '+base(0,0).toFixed(0)+' m, the gap '+h(0,0).toFixed(0)+')',Math.abs(h(0,0)-1020)<5&&base(0,0)>1500,h(0,0)>1500);
 ok('its floor falls with the river, and the stream runs on it',WG.stream.every(s=>Math.abs(R.shape(WG,s[0],s[1],base(s[0],s[1]))-Math.min(base(s[0],s[1]),s[2]))<1e-6)&&WG.stream[0][2]>WG.stream[16][2],false);
 ok('a wind gap is a perched col: highest mid-ridge, far above the water gap, with no stream',wd.stream===null&&Math.abs(h(0,1800)-1350)<5&&h(-700,1800)<h(0,1800)&&h(0,1800)>h(0,0)+300,false);
 ok('a gap only lowers: the plain and the ridge away from it are untouched',h(-2500,0)===base(-2500,0)&&h(0,-2500)===base(0,-2500)&&R.shape(WG,0,0,0)===0,R.shape(WG,0,0,5000)===5000);
 ok('the sides climb as a V (water) or a U (wind)',(()=>{const v=R.shape(WG,0,200,5000)-R.shape(WG,0,0,5000),u=R.shape(wd,0,1800+200,5000)-R.shape(wd,0,1800,5000);return v>80&&u<20;})(),false);
 ok('a gap needs a floor',throws(()=>R.gap({a:[0,0],b:[1,0]})),false);
 const J=R.joints({world:3,angle:.3,sp:[30,60]}),bl=J.blocks([0,0,400,400]);
 ok('joints cut blocks 30-60 m across ('+bl.length+' in the box), each block its own joint cell',bl.length>30&&bl.every(b=>b.w>=30-1e-9&&b.w<=60+1e-9&&J.at(b.cx,b.cz).id===b.id),false);
 ok('on a joint the distance is zero, in a block positive',J.at(bl[0].cx,bl[0].cz).d>10,J.at(bl[0].cx,bl[0].cz).d<1);
 const zone=(x,z)=>Math.max(0,Math.min(1,x/1000)),tl=R.tableland({joints:J,zone,top:300,floor:(x,z)=>0,z0:.3});
 let slot=0,full=0;for(let x=0;x<250;x+=1.3)for(let z=0;z<200;z+=1.7){const y=tl(x,z);if(y<299)slot++;else full++;}
 ok('the table is cut by slots on its joints ('+(slot/(slot+full)*100).toFixed(0)+'% of it), ends in a cliff at the zone\'s edge, the floor beyond',slot>0&&slot<full&&tl(280,100)>250&&tl(320,100)===0,slot===0);
 ok('slots widen toward the rim',(()=>{let a=0,b=0,na=0,nb=0;for(let z=0;z<400;z+=.5){if(tl(20,z)<299)a++;na++;if(tl(270,z)<299)b++;nb++;}return b/nb>a/na*1.5;})(),false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
