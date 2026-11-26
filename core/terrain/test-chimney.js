// node core/terrain/test-chimney.js — the hollow KSTACKS kind (37-core-stacks.js, kind 'chimney'), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'39-core-cavern.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const K=KSTACKS,g0=(x,z)=>.04*x+1.5*Math.sin(z*.1);
const mk=o=>K.make(Object.assign({kind:'chimney',id:'c',x:20,z:-10,lean:0,seed:1234,y0:5},o));

// ---- the body
const P=mk({H:30,r:4,flare:0,taper:1});
const b0=P.beds[0];
ok('a chimney is a stack of beds up to H',Math.abs(P.top-35)<.01&&P.beds.length>=6,Math.abs(P.top-30)<.01);
ok('the lip answers topAt',Math.abs(K.topAt([P],20+3.4,-10)-35)<.5,K.topAt([P],20+3.4,-10)===-Infinity);
ok('over the bore topAt finds no top',K.topAt([P],20,-10)===-Infinity,K.topAt([P],20+3.4,-10)===-Infinity);
ok('off the wall topAt finds nothing',K.topAt([P],20+6,-10)===-Infinity,false);
ok('the bore keeps the wall thick all the way up',P.beds.every(b=>Math.abs(b.rx*Math.min(1,1)-b.bo-1.2)<.01),false);
ok('surface sees the hole too',K.surface([P],20,-10)===null,K.surface([P],20+3.4,-10)===null);
ok('foot: the signed distance to the wall\'s outside',K.foot([P],20+8,-10).d>3&&K.foot([P],20,-10).d<0,false);
ok('a wall no thinner than the radius and an unknown form and state are refused',throws(()=>mk({wall:5,r:4}))&&throws(()=>mk({bore:0,r:4}))&&throws(()=>mk({form:'pot'}))&&throws(()=>mk({state:'gone'})),false);
ok('a chimney needs no other kind\'s option; the kinds table names it',!throws(()=>K.make({kind:'chimney',id:'b'})),false);
ok('deterministic: same seed, same record and mesh; another seed differs',JSON.stringify(mk({}))===JSON.stringify(mk({}))&&K.hash(K.mesh(mk({})))===K.hash(K.mesh(mk({}))),K.hash(K.mesh(mk({})))===K.hash(K.mesh(mk({seed:9,r:4.4}))));
const J=K.load(JSON.parse(JSON.stringify(K.export([mk({mouths:2})]))))[0];
ok('the export loads to the same mesh',K.hash(K.mesh(J))===K.hash(K.mesh(mk({mouths:2}))),K.hash(K.mesh(J))===K.hash(K.mesh(P)));

// ---- the mesh: outward faces out, the bore faced inward
const windings=(m,part)=>{let out=0,n=0;const Px=m.pos,I=m.idx;for(let i=0;i<I.length;i+=3){const a=I[i],b=I[i+1],c=I[i+2];if(m.part[a]!==part)continue;
  const v=j=>[Px[3*j],Px[3*j+1],Px[3*j+2]],A=v(a),B=v(b),C=v(c),u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],w=[C[0]-A[0],C[1]-A[1],C[2]-A[2]],nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],l=Math.hypot(...nn);if(l<1e-9)continue;
  const cx=(A[0]+B[0]+C[0])/3-20,cz=(A[2]+B[2]+C[2])/3+10,dot=nn[0]*cx+nn[2]*cz;if(Math.abs(dot)<1e-9)continue;n++;if(dot>0)out++;}return out/n;};
const mP=K.mesh(P),rad=(m,i)=>Math.hypot(m.pos[3*i]-20,m.pos[3*i+2]+10);
ok('the outer wall faces out ('+windings(mP,0).toFixed(2)+')',windings(mP,0)>.98,windings(mP,0)<.5);
ok('the bore faces in ('+windings(mP,3).toFixed(2)+')',windings(mP,3)<.02,windings(mP,3)>.5);
let inner=0,hi=0;for(let i=0;i<mP.pos.length/3;i++){if(mP.part[i]===3&&mP.pos[3*i+1]>6){inner=Math.max(inner,rad(mP,i));}if(mP.part[i]===0)hi=Math.max(hi,rad(mP,i));}
ok('the bore is drawn inside the wall ('+inner.toFixed(2)+' m in a '+hi.toFixed(2)+' m body)',inner<=2.81&&hi>3.5,inner>3.2);
let plug=0;for(let i=0;i<mP.pos.length/3;i++)if(mP.part[i]===3&&mP.occ[i]<.06)plug++;
const open=K.mesh(P,{bore:'open'});let plugO=0;for(let i=0;i<open.pos.length/3;i++)if(open.part[i]===3&&open.occ[i]<.06)plugO++;
ok('the bore darkens down to a plug, which opt.bore:\'open\' leaves off for a kit\'s shaft',plug>0&&plugO<plug,plug===0);

// ---- the bore and KCAVERN
const leaning=mk({H:24,r:3,lean:.08,toward:[1,0],flare:{from:.6,k:1.6}}),BR=K.bore(leaning,{depth:12});
const ground=()=>0,C=KCAVERN.create({ground,cell:.5,chunk:16,seed:1});
BR.shafts.forEach(s=>C.shaft(s));
const m2=K.mesh(leaning);let worst=0,N=0;for(let i=0;i<m2.pos.length/3;i++){if(m2.part[i]!==3||m2.occ[i]<.06)continue;const b=leaning.beds[m2.bed[i]],sd=C.voidSD(m2.pos[3*i],m2.pos[3*i+1]-.001,m2.pos[3*i+2]);worst=Math.max(worst,Math.abs(sd));N++;}
const lim=Math.max(...leaning.beds.map(b=>Math.hypot(b.tx,b.tz)))*.5+.08;
ok('the mesh\'s inner wall is on KCAVERN\'s shafts to '+worst.toFixed(2)+' m ('+N+' vertices; half a bed\'s lean '+lim.toFixed(2)+' m)',worst<=lim&&N>50,false);
const wider=K.bore(mk({H:24,r:3,lean:.08,toward:[1,0],bore:2.8,flare:0}),{depth:12});
const C2=KCAVERN.create({ground,cell:.5,chunk:16,seed:1});wider.shafts.forEach(s=>C2.shaft(s));
let w2=0;for(let i=0;i<m2.pos.length/3;i+=7){if(m2.part[i]!==3||m2.occ[i]<.06)continue;w2=Math.max(w2,Math.abs(C2.voidSD(m2.pos[3*i],m2.pos[3*i+1]-.001,m2.pos[3*i+2])));}
ok('(another chimney\'s shafts do not fit it: '+w2.toFixed(2)+' m)',w2>lim,false);
ok('a shaft goes on under the foot, and the opening stands at the foot',BR.shafts[0].y1===leaning.beds[0].y&&BR.shafts[0].y0===leaning.beds[0].y-12&&BR.opening.r===leaning.beds[0].bo,false);
ok('only a chimney has a bore; a fallen one has none',throws(()=>K.bore(K.make({kind:'spire',id:'s',H:10,r:3})))&&K.bore(mk({state:'fallen'})).shafts.length===0,false);

// ---- the top: flared, branching; the lean
const FL=mk({H:30,r:4,flare:{from:.7,k:2.4},taper:.75});
const last=FL.beds[FL.beds.length-1],R1=last.rx*last.tp;
ok('a flared mouth stands wider than its neck ('+R1.toFixed(1)+' m over '+(4*(1-.25*.7)).toFixed(1)+' m)',R1>5.5,mk({flare:0}).beds.at(-1).rx>5.5);
ok('topAt reaches the flared lip, past the neck',K.topAt([FL],20+R1-.3,-10)>34,false);
const M3=mk({H:40,r:6,mouths:3,fork:.6}),M1=mk({H:40,r:6});
const cols=new Set(M3.beds.map(b=>b.col));
ok('three mouths are three columns on one trunk',cols.size===4&&M3.cols===3,M1.cols===3);
const tops=[1,2,3].map(c=>M3.beds.filter(b=>b.col===c).at(-1)),tcs=tops.map(b=>[b.cx+b.tx,b.cz+b.tz]);
ok('the mouths part (their tops '+Math.min(...tcs.map((p,i)=>Math.hypot(p[0]-tcs[(i+1)%3][0],p[1]-tcs[(i+1)%3][1]))).toFixed(1)+' m apart)',tcs.every((p,i)=>Math.hypot(p[0]-tcs[(i+1)%3][0],p[1]-tcs[(i+1)%3][1])>6),false);
ok('each mouth is hollow: over its bore topAt never finds its lip',tcs.every((p,i)=>K.topAt([M3],p[0],p[1])<tops[i].y+tops[i].h-.5),false);
const L=mk({H:30,r:3,lean:.1,toward:[0,1],flare:0}),lb=L.beds.at(-1);
ok('the lean runs down the bearing it is given',Math.abs(lb.cz+lb.tz-(L.z+Math.tan(.1)*30))<.5&&Math.abs(lb.cx+lb.tx-L.x)<.01,Math.abs(lb.cz+lb.tz-L.z)<.5);

// ---- the forms: one kind, not three
const Bell=K.make({kind:'chimney',form:'bell',id:'b',x:0,z:0,seed:5,y0:0,lean:0}),St=K.make({kind:'chimney',form:'stalk',id:'s',x:0,z:0,seed:6,y0:0}),Si=K.make({kind:'chimney',form:'siphon',id:'w',x:0,z:0,seed:7,y0:0,lean:0});
const body=B=>B.beds.filter(b=>b.col<50),mouth=B=>{const b=body(B).at(-1);return b.rx*b.tp;};
ok('the Lungs\' bell: a flared mouth on holdfasts, thin-walled',Bell.kind==='chimney'&&mouth(Bell)>8&&Bell.beds.filter(b=>b.col>=50&&b.col<100).length===6&&Bell.wall<1,mouth(St)>8);
ok('the Hearths\' stalk: slender, hollow, broken by default',St.state==='broken'&&St.beds[0].rx<1.2&&St.beds[0].bo>.3&&St.beds.some(b=>b.jag),Bell.state==='broken');
ok('Siphon Pits\' trunk: a flared chimney',mouth(Si)>5&&Si.top>35,false);
const hf=Bell.beds.find(b=>b.col===50);
ok('a holdfast stands on the ground and leans in to the wall',hf.y<=0&&Math.hypot(hf.cx+hf.tx,hf.cz+hf.tz)<Math.hypot(hf.cx,hf.cz),false);
ok('with a ground the foot follows it',K.make({kind:'chimney',id:'g',x:40,z:0,H:20,r:5,ground:g0,seed:1,lean:0}).beds[0].gy.length>0,mk({}).beds[0].gy!=null);

// ---- the ledges
const LG=mk({H:30,r:4,flare:0,taper:1,ledges:[.5],ledgeW:.6}),edge=4-.3,yMid=K.ledge([LG],20+edge,-10),none=K.ledge([P],20+3.5,-10);
ok('a step gives a ledge ('+(yMid?yMid.w.toFixed(2):'none')+' m in)',yMid&&yMid.b.col===0,none!==null);
ok('over the ledge the ledge\'s height, not the top\'s',Math.abs(K.topAt([LG],20+edge,-10)-(5+yMid.b.y+yMid.b.h-5))<.5&&K.topAt([LG],20+edge,-10)<30,false);
ok('a ledge\'s lip is drawn',K.mesh(LG).part.filter(p=>p===1).length>K.mesh(P).part.filter(p=>p===1).length,false);

// ---- the collapse
const Br=mk({H:30,r:4,flare:0,state:'broken',cut:.5});
ok('broken: cut down, the lip jagged',Br.top<21&&Br.beds.filter(b=>b.col===0).at(-1).jag>0,P.beds.at(-1).jag>0);
const ys=[];for(let a=0;a<24;a++){const A=a/24*6.283;ys.push(K.topAt([Br],20+Math.cos(A)*3.4,-10+Math.sin(A)*3.4));}
const spread=Math.max(...ys)-Math.min(...ys);
ok('the broken lip rises and falls round the bore by '+spread.toFixed(2)+' m',spread>.3,false);
const mBr=K.mesh(Br);let lipOff=0;for(let i=0;i<mBr.pos.length/3;i++){if(mBr.part[i]!==1)continue;const b=Br.beds[mBr.bed[i]];if(b.col!==0)continue;lipOff=Math.max(lipOff,Math.abs(K.topH(b,mBr.pos[3*i],mBr.pos[3*i+2])-mBr.pos[3*i+1]));}
ok('the drawn lip is on topH to '+lipOff.toFixed(4)+' m',lipOff<1e-2,false);
ok('a break below the fork takes the mouths with it',mk({H:30,mouths:3,fork:.7,state:'broken',cut:.5}).beds.every(b=>b.col===0||b.col>=100),false);
const Ru=mk({H:30,r:4,state:'rubble',toward:[1,0]}),chunks=Ru.beds.filter(b=>b.col>=100);
ok('rubble: a stump and a fan of chunks down the bearing',Ru.beds.filter(b=>b.col===0).at(-1).y<9&&chunks.length>=3&&chunks.reduce((a,b)=>a+(b.cx>Ru.x?1:0),0)>chunks.length*.7,mk({H:30,r:4,state:'rubble',toward:[1,0],fan:false}).beds.some(b=>b.col>=100));
ok('a chunk answers topAt',chunks.some(c=>K.topAt([Ru],c.cx,c.cz)>4),false);
const Fa=K.make({kind:'chimney',id:'f',x:0,z:0,H:30,r:4,toward:[1,0],state:'fallen',seed:3,ground:g0,flare:0,fan:false});
ok('fallen: it lies along the bearing, its top a radius over the axis',Math.abs(K.topAt([Fa],15,0)-(Fa.fall.ay+Fa.fall.dy*15.0+Math.sqrt(9+0)))<3.2&&K.topAt([Fa],15,0)>g0(15,0)+1,K.topAt([P],15,0)>0);
ok('fallen: off the side and past the tip there is nothing; beyond the body nothing stands up',K.topAt([Fa],15,9)===-Infinity&&K.topAt([Fa],40,0)===-Infinity&&K.topAt([Fa],0,0)>-Infinity,K.topAt([Fa],15,0)===-Infinity);
ok('fallen: foot gives the distance to the body, ledge and ring nothing',K.foot([Fa],15,9).d>3&&K.ledge([Fa],15,0)===null&&K.ring(Fa,5)===null,K.foot([Fa],15,0).d>0);
const mF=K.mesh(Fa);let hiF=-1e9,xF=0;for(let i=0;i<mF.pos.length/3;i++){hiF=Math.max(hiF,mF.pos[3*i+1]);xF=Math.max(xF,mF.pos[3*i]);}
ok('fallen: the mesh lies down ('+xF.toFixed(0)+' m out, its top '+hiF.toFixed(1)+' m)',xF>26&&hiF<Math.max(g0(30,0),g0(0,0))+12,hiF>25);
const Ff=K.make({kind:'chimney',id:'f2',x:0,z:0,H:30,r:4,toward:[1,0],state:'fallen',seed:3,y0:0}),ch2=Ff.beds.filter(b=>b.col>=100);
ok('fallen: the rings lie past its tip, and answer topAt',ch2.length>=3&&ch2.every(b=>b.cx>10)&&K.topAt([Ff],ch2[0].cx,ch2[0].cz)>-1,false);

// ---- the ice dress
const Ic=mk({H:30,r:4,flare:0,taper:1,ice:{from:.5,thick:.4}}),mI=K.mesh(Ic),mN=K.mesh(mk({H:30,r:4,flare:0,taper:1}));
ok('the ice thickens the outline up from its line, and at() agrees',Ic.beds.at(-1).rx>P.beds.at(-1).rx+.3&&Math.abs(Ic.beds[0].rx-P.beds[0].rx)<.01&&K.topAt([Ic],20+4.2,-10)>30,K.topAt([P],20+4.2,-10)>30);
let iceHi=0,iceLo=0;for(let i=0;i<mI.ice.length;i++){if(mI.pos[3*i+1]>27)iceHi=Math.max(iceHi,mI.ice[i]);if(mI.pos[3*i+1]<9)iceLo=Math.max(iceLo,mI.ice[i]);}
ok('the mesh carries ice 0..1, up from its line ('+iceHi.toFixed(2)+' high, '+iceLo.toFixed(2)+' low)',iceHi>.4&&iceLo===0,mN.ice!=null);

// ---- nothing else moved: the other kinds' records carry no chimney field
const sp=K.make({kind:'spire',id:'s',H:40,r:8,seed:4,y0:0});
ok('another kind has no bore, jag or body',sp.beds.every(b=>b.bo==null&&b.jag==null)&&sp.body==null,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
