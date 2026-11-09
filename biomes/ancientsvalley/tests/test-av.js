#!/usr/bin/env node
/* The valley's data side (src/41-av-field.js) in node: the model's ground, the fields, the plan and the viaduct, each check with a
   negative. Run: node biomes/ancientsvalley/tests/test-av.js */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,JSON};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','biomes/ancientsvalley/src/41-av-field.js','biomes/ancientsvalley/src/41b-av-wrecks.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const RG=JSON.parse(fs.readFileSync(path.join(__dirname,'..','region','station-overlook.json'),'utf8'));
const AV=ctx.AV,KRAND=ctx.KRAND;
/* ok(name, c, neg): c the check on the real input (must hold); neg the same check on a broken input (must be false) */
let fails=0,n=0;const ok=(name,c,neg)=>{n++;const good=!!c&&(neg===undefined||neg===false);if(!good)fails++;console.log((good?' ok   ':' FAIL ')+name+(neg!==undefined?'  (negative '+(neg===false?'fails':'DID NOT FAIL')+')':''));};
// the model: the bicubic passes through the cell centres, and the water cells answer with their level
const M=AV.model(RG.grid),G=RG.grid;
{let worst=0;for(let j=1;j<G.nz-1;j++)for(let i=1;i<G.nx-1;i++){const v=M.at(G.x0+i*G.dx,G.z0+j*G.dz);worst=Math.max(worst,Math.abs(v-G.h[j][i]));}
 ok('the model passes through its cells ('+worst.toFixed(3)+' m off at worst)',worst<.01,Math.abs(M.at(G.x0+5*G.dx+1000,G.z0+5*G.dz)-G.h[5][5])<.01);}
{const w=G.water[0],lv=M.water(G.x0+w[0]*G.dx,G.z0+w[1]*G.dz);ok('a water cell answers with its level',lv===w[2]);
 let dry=null;for(let j=0;j<G.nz&&dry==null;j++)for(let i=0;i<G.nx;i++)if(!M.W[i+','+j]){dry=[i,j];break;}ok('a dry cell answers null',M.water(G.x0+dry[0]*G.dx,G.z0+dry[1]*G.dz)===null);}
ok('the bands: 50 m is the floor, 150 the shelf, 450 the terraces, 900 the forest',AV.band(50)==='floor'&&AV.band(150)==='shelf'&&AV.band(450)==='terraces'&&AV.band(900)==='forest',AV.band(50)==='shelf');
// the fields on the model's ground
const BASE=RG.site.base,LAKE=RG.lake.y,ground=(x,z)=>M.at(x,z)-BASE;
const F=AV.fields({ground,base:BASE,lakeY:LAKE,cities:RG.cities,basins:RG.basins,scars:[{x:1500,z:-200,rx:520,rz:330,yaw:.5}],seed:7});
{let vals=[0,0,0,0];const keys=['density','park','scar','feral','taint'];let bad=[];for(let x=-2800;x<=2800;x+=200)for(let z=-2800;z<=2800;z+=200)keys.forEach(k=>{const v=F[k](x,z);if(!(v>=0&&v<=1))bad.push(k);});
 ok('every field is in 0..1 over the page',!bad.length);}
ok('the scar is 1 at its centre and 0 far from it',F.scar(1500,-200)===1&&F.scar(-2000,2000)===0,F.scar(-2000,2000)>0);
ok('nothing grows on the scar: feral 0, density 0 there',F.feral(1500,-200)===0&&F.density(1500,-200)===0);
{const wet=G.water[0],x=G.x0+wet[0]*G.dx,z=G.z0+wet[1]*G.dz;ok('no density and no feral under the lake',ground(x,z)<LAKE+1?F.density(x,z)===0&&F.feral(x,z)===0:true);}
ok('the taint is higher at a basin\'s rim than far from it',(()=>{const b=RG.basins[2];return F.taint(b.x+b.r*1.1,b.z)>F.taint(b.x+b.r*6,b.z);})());
// the halves (the owner, 2026-11-08): about half the dry land wild (overgrown), the rest foul; the feral depth follows the wild field
{const share=(FF)=>{let n=0,hi=0,fw=0,ff=0,nw=0,nf=0;for(let x=-2900;x<=2900;x+=100)for(let z=-2900;z<=2900;z+=100){if(Math.hypot(x,z)>3000||ground(x,z)<LAKE+.5)continue;n++;const w=FF.wild(x,z);if(w>.5){hi++;fw+=FF.feral(x,z);nw++;}else{ff+=FF.feral(x,z);nf++;}}return{s:hi/n,fw:nw?fw/nw:0,ff:nf?ff/nf:0};};
 const a=share(F),a2=share(AV.fields({ground,base:BASE,lakeY:LAKE,cities:RG.cities,basins:RG.basins,scars:[{x:1500,z:-200,rx:520,rz:330,yaw:.5}],seed:1104,R:3000})),b=share(AV.fields({ground,base:BASE,lakeY:LAKE,cities:RG.cities,basins:RG.basins,scars:[{x:0,z:0,rx:9000,rz:9000,yaw:0}],seed:7}));
 const good=r=>r.s>.4&&r.s<.65&&r.fw>r.ff*2;ok("the land is half wild, half foul for seed 7 and the page's ("+Math.round(a.s*100)+'% and '+Math.round(a2.s*100)+'% wild; feral '+a.fw.toFixed(2)+' there, '+a.ff.toFixed(2)+' in the foul)',good(a)&&good(a2),good(b));}
// the plan: deterministic, keyed, on dry ground, spaced, the ruin shares
const mk=seed=>AV.plan({R:3000,pitch:160,theta:.3,seed,ground,lakeY:LAKE,F,coreKeys:['spindle','ledger'],shelfKeys:['ledger'],near:{x:300,z:-150,r:400,keys:['terrace']},hero:['terrace']});
const P=mk(5),P2=mk(5),P3=mk(6);
ok('the plan is the same for the same seed',JSON.stringify(P)===JSON.stringify(P2));
ok('and different for another',JSON.stringify(P.towers.map(t=>t.key))!==JSON.stringify(P3.towers.map(t=>t.key)));
ok('towers were planned ('+P.towers.length+')',P.towers.length>100);
ok('none under the lake',P.towers.every(t=>t.y>=LAKE+1.5),P.towers.concat([{y:LAKE-1}]).every(t=>t.y>=LAKE+1.5));
ok('every tower has a key, a yaw and a kind',P.towers.every(t=>/^\w+\.\w+$/.test(t.key)&&isFinite(t.yaw)&&t.kind));
{let close=0;const S=new Map();P.towers.forEach(t=>{const k=Math.round(t.x/160)+','+Math.round(t.z/160);S.set(k,(S.get(k)||0)+1);});
 for(let i=0;i<P.towers.length;i++)for(let j=i+1;j<P.towers.length;j++)if(Math.hypot(P.towers[i].x-P.towers[j].x,P.towers[i].z-P.towers[j].z)<160*.95)close++;
 ok('no two towers closer than the pitch',close===0);}
{const f=P.towers.filter(t=>t.state==='intact').length/P.towers.length,tall=P.towers.filter(t=>/^(intact|gutted|crown)$/.test(t.state)).length/P.towers.length;ok('few intact, under a third standing tall ('+Math.round(f*100)+'%, '+Math.round(tall*100)+'%)',f>.005&&f<.15&&tall<.35);}
// the craters: on the page, apart, and the bowl below its rim
{const C=AV.craters({R:2800,n:12,seed:3,ok:(x,z,r)=>ground(x,z)>LAKE+10});ok('craters struck ('+C.length+')',C.length>=8&&C.every(c=>Math.hypot(c.x,c.z)<=2800));
 let apart=true;for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)if(Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z)<C[i].r+C[j].r)apart=false;ok('no two craters overlap',apart);
 const c=C[0];ok('a crater is a bowl under a rim',AV.craterH(C,c.x,c.z)<-c.depth*.9&&AV.craterH(C,c.x+c.r,c.z)>0&&AV.craterH(C,c.x+c.r*3,c.z)===0,AV.craterH(C,c.x+c.r*3,c.z)!==0);
 ok('the scorch is black at a crater and fades past 2.6 r',AV.scorch(C,c.x+c.r*1.2,c.z,3)>.8&&AV.scorch(C,c.x+c.r*2.7,c.z,3)<.9);
 const D=AV.debris({craters:C,R:2800,n:200,seed:5});ok('debris thrown ('+D.length+'), every slab with a size',D.length>200&&D.every(d=>d.sx>0&&d.sy>0&&d.sz>0&&isFinite(d.yaw)));
 ok('a leaning tower leans at most 5 degrees and never when whole',[0,1,2,3].every(i=>AV.lean(1,i,i,'broken')<=5)&&AV.lean(1,2,2,'intact')===0&&AV.lean(1,2,2,'fallen')===0,AV.lean(1,2,2,'intact')!==0);}
ok('a hero-only design never stands as a skeleton or fallen',P.towers.every(t=>t.family!=='terrace'||(t.state!=='skeleton'&&t.state!=='fallen')));
ok('the designs stand only round the eye',P.towers.every(t=>t.family!=='terrace'||Math.hypot(t.x-300,t.z+150)<400));
// the viaduct
const V=AV.viaduct([[2900,-520],[1400,-560],[300,-700]],{step:36,ground,deckY:(x,z,s)=>Math.max(ground(x,z)+16,LAKE+38)});
ok('the viaduct runs its length in decks and piers ('+V.decks.length+' decks)',V.decks.length>60&&V.piers.length===V.decks.length+1&&Math.abs(V.length-(1500.5+1109))<20);
ok('every deck is above its ground and every pier reaches it',V.decks.every(d=>d.y>ground(d.x,d.z)+10)&&V.piers.every(p=>p.y1>p.y0));
// the wrecks (41b-av-wrecks.js): on the street lines of the lattice, in the roadway, clear of the crossings, where ok says, burnt where the ground is
{const th=17*Math.PI/180,LT={c:Math.cos(th),s:Math.sin(th),pitch:165,AW:14,SW:6},C=AV.craters({R:3000,n:24,seed:3,rMin:35,rMax:150,ok:(x,z,r)=>ground(x,z)>LAKE+10});
 const dens=(x,z)=>ground(x,z)>LAKE+2?1:0,okAt=(x,z)=>ground(x,z)>LAKE+1.5&&!C.some(c=>Math.hypot(x-c.x,z-c.z)<c.r*1.3+6);
 const forms={},formOf=(st,sd,k)=>({form:st==='wreck'?['crushed','skidded','nosedived'][(sd+k.length)%3]:null});
 const lake=(x,z)=>AV.smooth(2800,-2800,x);   /* the test's lake lies to the west: 1 at x -2800, 0 at x 2800 */
 const mkW=(seed,more)=>AV.wrecks(Object.assign({R:2800,lattice:LT,seed,scorch:(x,z)=>AV.scorch(C,x,z,seed),density:dens,lake,craters:C,ok:okAt,max:700,formOf},more||{}));
 const W=mkW(11),W2=mkW(11),W3=mkW(12);
 ok('the wrecks are the same for the same seed and differ for another ('+W.length+')',W.length>=150&&JSON.stringify(W)===JSON.stringify(W2)&&JSON.stringify(W.map(r=>r.id))!==JSON.stringify(W3.map(r=>r.id)));
 ok('the cap holds and is even (a smaller cap keeps a subset)',W.length<=700&&mkW(11,{max:200}).length===200&&mkW(11,{max:200}).every(r=>W.some(s=>s.id===r.id)),mkW(11,{max:200}).length===700);
 const lineOf=(v,p)=>{const k=Math.round(v/p-.5);return{k,d:Math.abs(v-(k+.5)*p),av:((k%3)+3)%3===1};};
 const inRoad=r=>{const lx=r.x*LT.c+r.z*LT.s,lz=-r.x*LT.s+r.z*LT.c,A=lineOf(lx,LT.pitch),B=lineOf(lz,LT.pitch),L=r.axis===0?A:B,X=r.axis===0?B:A;return L.d<=(L.av?LT.AW:LT.SW)-r.w/2+.01&&X.d>=(X.av?LT.AW:LT.SW)+7-.01;};
 ok('every street wreck lies in its roadway, clear of the crossings',W.filter(r=>!r.air).every(inRoad),inRoad(Object.assign({},W[0],{x:W[0].x+LT.pitch/2*LT.c,z:W[0].z+LT.pitch/2*LT.s})));
 ok('none where ok says no (the lake, a crater), nose or tail',W.every(r=>okAt(r.x,r.z)&&okAt(r.x+Math.sin(r.yaw)*r.d/2,r.z+Math.cos(r.yaw)*r.d/2)),mkW(11,{ok:()=>true}).every(r=>okAt(r.x,r.z)));
 ok('nothing in an avoid disc (the transit kit\'s blockades)',(()=>{const a={x:W[0].x,z:W[0].z,r:40};return mkW(11,{avoid:[a]}).every(r=>Math.hypot(r.x-a.x,r.z-a.z)>=a.r);})(),W.every(r=>Math.hypot(r.x-W[0].x,r.z-W[0].z)>=40));
 {const hot=W.filter(r=>AV.scorch(C,r.x,r.z,11)>.6),cold=W.filter(r=>AV.scorch(C,r.x,r.z,11)<.1),bh=hot.filter(r=>r.state==='burnt').length/Math.max(1,hot.length),bc=cold.filter(r=>r.state==='burnt').length/Math.max(1,cold.length);
  ok('most wrecks on scorched ground are burnt, few elsewhere ('+Math.round(bh*100)+'% of '+hot.length+' vs '+Math.round(bc*100)+'%)',hot.length>10&&bh>.7&&bc<.35,bc>.7);}
 ok('every record has a key, a variant, a state, a seed and a heading',W.every(r=>/^anc_\w+$/.test(r.key)&&r.variant>=0&&/^(weathered|burnt|wreck)$/.test(r.state)&&r.seed>=1&&isFinite(r.yaw)&&r.w>0&&r.d>0));
 ok('more wrecks on the avenues than on the streets, pods and saloons the most common',W.filter(r=>r.av).length>W.length/2&&W.filter(r=>/pod|saloon/.test(r.key)).length>W.length/2);
 {const tanks=W.filter(r=>r.key==='anc_tank');ok('the tanks are few and in the lakeward half ('+tanks.length+')',tanks.length>0&&tanks.length<W.length*.05&&tanks.every(t=>lake(t.x,t.z)>.5),mkW(11,{lake:(x,z)=>1-lake(x,z)}).filter(r=>r.key==='anc_tank').every(t=>lake(t.x,t.z)>.5));}
 {const ratio=L=>{const U=mkW(11,{max:5000,lake:L}),near=U.filter(r=>lake(r.x,r.z)>.5).length;return near/Math.max(1,U.length-near);},rl=ratio(lake),r0=ratio(null);
  ok('more wrecks toward the lake than away from it ('+rl.toFixed(2)+' lakeward to one, against '+r0.toFixed(2)+' with no lake)',rl>r0*1.5,ratio((x,z)=>1-lake(x,z))>r0*1.5);}
 ok('a wreck\'s form is the kit\'s when formOf is given, null without',W.filter(r=>r.state==='wreck').every(r=>r.form)&&mkW(11,{formOf:null}).every(r=>r.form===null));
 {const plazas=[{x:300,z:-150},{x:-500,z:100},{x:-200,z:300},{x:-900,z:-400}].filter(p=>okAt(p.x,p.z)),A=mkW(11,{air:{jet:true,helis:2,plazas}}),jet=A.find(r=>r.key==='anc_jet'),helis=A.filter(r=>r.key==='anc_heli');
  ok('an airliner skidded down an avenue and helicopters on the lakeward plazas ('+(jet?1:0)+' jet, '+helis.length+' helicopters)',!!jet&&jet.av&&jet.form==='skidded'&&helis.length===2&&helis.every(h=>plazas.some(p=>p.x===h.x&&p.z===h.z)&&lake(h.x,h.z)>.5),W.some(r=>r.air));}}
console.log(fails?fails+' FAILED of '+n:'all '+n+' passed');process.exit(fails?1:0);
