#!/usr/bin/env node
/* The valley's data side (src/41-av-field.js) in node: the model's ground, the fields, the plan and the viaduct, each check with a
   negative. Run: node biomes/ancientsvalley/tests/test-av.js */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,JSON};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','biomes/ancientsvalley/src/41-av-field.js','biomes/ancientsvalley/src/41b-av-wrecks.js','biomes/ancientsvalley/src/41c-av-house.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
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
// the lake-front (the owner, 2026-11-09): with lakeK, tall and short, the tall family's share rises toward the lake and falls inland
{const mkL=(lk)=>AV.plan({R:3000,pitch:160,theta:.3,seed:5,ground,lakeY:LAKE,F,coreKeys:['spindle','ledger'],shelfKeys:['spindle','ledger'],lakeK:lk,tall:['spindle'],short:['ledger']});
 const share=(P,f)=>{const T=P.towers.filter(f);return T.length?T.filter(t=>t.family==='spindle').length/T.length:0;};
 const L=mkL((x,z)=>x>400?1:x<-400?0:.5),near=share(L,t=>t.x>400),far=share(L,t=>t.x<-400),L0=mkL(null),n0=share(L0,t=>t.x>400),f0=share(L0,t=>t.x<-400);
 ok('the tall family wins toward the lake and loses inland ('+Math.round(near*100)+'% by the lake, '+Math.round(far*100)+'% inland; '+Math.round(n0*100)+'% and '+Math.round(f0*100)+'% with no lake)',near>far+.25&&near>n0+.1&&far<f0-.1,Math.abs(n0-f0)>.25);}
// the kerb lines (the owner, 2026-11-09): the towers slide off their nodes to a kerb, the plinth gap metres behind the pavement, never across a street
{const ext=f=>f==='ledger'?[66,48]:[26,26],mkK=k=>AV.plan({R:3000,pitch:160,theta:.3,seed:5,ground,lakeY:LAKE,F,coreKeys:['spindle','ledger'],shelfKeys:['ledger'],kerb:k});
 const K=mkK({avenue:16.5,road:9,gap:3,corner:.35,R:2900,lineMax:2850,extent:ext}),N=mkK(null),p=160,c=Math.cos(.3),s=Math.sin(.3);let on=0,cross=0,corner=0,gapOk=0;
 K.towers.forEach(t=>{const e=ext(t.family),ang=t.yaw-.3,ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang)),ex=[ca*e[0]+sa*e[1],sa*e[0]+ca*e[1]],l=[t.x*c+t.z*s,-t.x*s+t.z*c],gs=[1e9,1e9];
  l.forEach((v,a)=>{if(Math.hypot(t.x,t.z)>2900)return;const k=Math.round(v/p-.5);if(Math.abs((k+.5)*p)>2850)return;const d=Math.abs(v-(k+.5)*p),hw=((k%3)+3)%3===1?16.5:9,g=d-ex[a]-hw;if(g<-.5)cross++;gs[a]=g;});
  if(!t.kerb)return;on++;if(t.kerb.corner)corner++;if(Math.abs(gs[t.kerb.axis]-3)<.01)gapOk++;});
 ok('the towers front the kerb lines ('+on+' of '+K.towers.length+', '+corner+' on corners, '+gapOk+' 3 m behind the pavement, '+cross+' plinths into a street)',on>K.towers.length*.6&&!cross&&gapOk===on&&corner>on*.15&&corner<on*.55,N.towers.filter(t=>t.kerb).length>N.towers.length*.6);
 ok('the kerb pass is deterministic',JSON.stringify(mkK({avenue:16.5,road:9,gap:3,corner:.35,R:2900,lineMax:2850,extent:ext}).towers)===JSON.stringify(K.towers));}
// the House (41c): every threshold maps a doorway line onto its twin, the walker lands on a floor, the loop never ends, the descent keeps its slope
{const D={x:300,z:-150,y:12},H=AV.house({origin:[40000,3000,0],door:D,seed:7,visits:3}),X=40000,Y=3000,Z=0,st={},on=(p)=>AV.houseFloor(H,p[0],p[2])!=null;
 const go=(a,b)=>{const r=AV.houseCross(H,a,b,st);return r?{r,p:[b[0]+r.d[0],b[1]+r.d[1],b[2]+r.d[2]]}:null;};
 const i1=go([D.x,D.y,D.z-2],[D.x,D.y,D.z-1.45]),o1=go([X,Y,Z+.3],[X,Y,Z-.05]),back=go([D.x,D.y,D.z-1.4],[D.x,D.y,D.z-2]);
 ok('through the hut door into the foyer, and out of the foyer door to the hut (and not back the wrong way)',i1&&i1.r.id==='in'&&on(i1.p)&&Math.abs(i1.p[2]-(Z+.05))<1e-6&&o1&&o1.r.id==='out'&&Math.abs(o1.p[2]-(D.z-1.55))<1e-6&&!back&&st.inside===false,!!back);
 let p=[X,Y,Z+60+12*3.5],loops=0;for(let k=0;k<40;k++){const n=[p[0],p[1],p[2]+1];const r=go(p,n);p=r?r.p:n;if(r&&r.r.id==='loop')loops++;}
 ok('the north corridor never ends ('+loops+' loops in 40 m, still in it)',loops>=3&&on(p)&&p[2]<Z+60+12*7,loops===0);
 const rooms=new Set();for(let k=0;k<12;k++){const r=go([X+34.8,Y,H.doorZ],[X+35.2,Y,H.doorZ]);rooms.add(r.r.room);const bk=go([r.p[0]+.4,Y,H.doorZ],[r.p[0]-.2,Y,H.doorZ]);if(!bk||bk.r.id!=='back'||!on(bk.p))rooms.add('lost');}
 ok('the east door opens on '+rooms.size+' rooms by the visit, and every room leads back',rooms.size===3&&!rooms.has('lost'),rooms.size===1);
 const top=[X+602,AV.houseFloor(H,X+602,H.doorZ+73.8),H.doorZ+73.8],lv=go(top,[X+602,top[1],H.doorZ+74.2]),f0=AV.houseFloor(H,X+602,H.doorZ+74.2),f1=lv?AV.houseFloor(H,lv.p[0],lv.p[2]):NaN;
 ok('the descent has no bottom: its foot leads to the same place on the slope higher up (level '+st.depth+')',lv&&lv.r.id==='level'&&Math.abs((f0+lv.r.d[1])-f1)<1e-6&&st.depth===1,false);
 const H2=AV.house({origin:[40000,3000,0],door:D,seed:7,visits:4});ok('the west hallway is longer each visit ('+H.tape.toFixed(2)+' m, then '+H2.tape.toFixed(2)+' m)',H2.tape>H.tape&&H2.tape-H.tape<.1,H2.tape===H.tape);}
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
// the lobbies and climbs (41c, PLAN.md section 15): towers along streets of a flat lattice, the metropolis kit's families (46c loads as far as it can
// without its draw side: thirteen families), core/walk for the routes
{for(const f of ['core/walk/20-core-walk.js','kits/metropolis/src/40-mp-records.js','kits/metropolis/src/46-mp-designs.js','kits/metropolis/src/46c-mp-planned.js','biomes/ancientsvalley/src/41c-av-lobbies.js']){
  try{vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});}catch(e){if(!/46c/.test(f))throw e;}}
 vm.runInContext('this.__MP=MP;this.__KWALK=KWALK;',ctx);const MP=ctx.__MP,KWALK=ctx.__KWALK;
 const fams=['spindle','ledger','telescope','reed','stalk','organ','cupola','terrace'].filter(k=>MP.FAMILY[k]);
 const states=['stump','intact','broken','skeleton','crown','gutted','stump','fallen'];
 const skin=(F,y)=>{const fp=F.footprint||{};if(y<.25&&fp.shape==='rect')return{hw:fp.w/2,hd:fp.d/2};if(F.envR)return{r:F.envR(y)};if(F.id==='spindle')return{r:MP.spindleR(y)};return fp.r?{r:fp.r}:{hw:fp.w/2,hd:fp.d/2};};
 const ext=F=>{const fp=F.footprint||{};return fp.r?fp.r+6:fp.w/2+6;};
 const P=165,dB=13+3.5,TW=[];
 for(let i=0;i<96;i++){const fam=fams[i%fams.length],st=states[(i*5+Math.floor(i/8))%states.length],F=MP.FAMILY[fam],line=(i+1.5)*P,D0=dB+3+ext(F);
  TW.push({id:'t'+i,family:fam,state:st,x:line-D0,z:(i%3)*400,y:0,yaw:0,kerb:{axis:0,side:1,avenue:true}});}
 const street=(a,k)=>a===0?{levelAt:()=>-1.15,half:13,pave:3.5}:null;
 const mk=o=>AV.lobbies(Object.assign({towers:TW,family:k=>MP.FAMILY[k],ruin:(F,s)=>MP.ruin(F,s),skin,lattice:{c:1,s:0,pitch:P},street,seed:31,near:{x:TW[0].x,z:TW[0].z},fallen:AV.fallenBlocks(TW,k=>MP.FAMILY[k],(F,s)=>MP.debrisPlan(F,s))},o||{}));
 const LB=mk(),W=KWALK.create(),reg=AV.lobbyWalk(W,LB,TW);
 /* the ground: the street's level out to the pavement's back, then the plinth's; the approach's strip is a floor over it */
 /* the ground: the street's level out to the pavement's back, then the plinth's; under an approach its plane (46z folds them into ground()) */
 const ground=(x,z)=>{const ap=W.floorsAt(x,z).find(f=>f[1].tag==='approach');if(ap)return ap[0]-.03;const line=(Math.floor(x/P-.5)+1.5)*P;return line-x<dB?-1.15:0;};
 const D=LB.doors,byMode=m=>D.filter(d=>d.mode===m&&!d.cut);
 ok('every standing kerb tower has a door; the fallen none ('+D.length+' doors of '+TW.length+' towers)',D.length===TW.filter(t=>t.state!=='fallen').length&&!D.some(d=>d.state==='fallen'));
 ok('the approaches: foot on the pavement, head on the plinth, a slope under 0.6',D.every(d=>{const A=d.approach;return Math.abs(A.a[2]+1)<.25&&Math.abs(A.b[2]-d.y)<.01&&Math.abs(A.b[2]-A.a[2])/Math.max(.1,A.run)<.6;}));
 ok('open, door-blocked and stair-blocked all present ('+byMode('open').length+', '+byMode('door').length+', '+byMode('stair').length+')',byMode('open').length>=3&&byMode('door').length>=3&&byMode('stair').length>=1);
 const st=LB.counts.byState,sh=s=>st[s]?st[s].open/st[s].n:0;
 ok('stumps open the most (stump '+sh('stump').toFixed(2)+' against intact '+sh('intact').toFixed(2)+')',sh('stump')>sh('intact'));
 const walk=(d,Wx)=>AV.walkRoute(Wx||W,ground,d.route);
 {const bad=byMode('open').map(d=>[d,walk(d)]).filter(q=>!q[1].ok||q[1].y<q[0].y+q[0].climb.top-.75);
  ok('every open tower\'s route reaches its top from the pavement ('+byMode('open').length+' towers'+(bad.length?'; '+bad[0][0].id+' '+bad[0][0].family+' '+bad[0][0].state+': '+bad[0][1].why+' at '+bad[0][1].i:'')+')',!bad.length);}
 {const d=byMode('open')[0],W2=KWALK.create();AV.lobbyWalk(W2,LB,TW);const S=d.climb.stair,T=TW[d.ti],q=AV.doorWorld(T,S.su,S.sv);W2.block([q[0]-2,q[0]+2,q[1]-2,q[1]+2,T.y+d.climb.floors[1].y-1,T.y+d.climb.floors[1].y+3],'test');
  ok('a heap in an open tower\'s stair cuts its route',walk(d).ok&&!walk(d,W2).ok);}
 {const cut=(Wx,ds)=>ds.every(d=>!walk(d,Wx).ok),d=byMode('door')[0],W3=KWALK.create();AV.lobbyWalk(W3,{doors:LB.doors.map(x=>x===d?Object.assign({},x,{blocks:[]}):x)},TW);
  ok('every door-blocked tower\'s route stops at its rubble ('+byMode('door').length+'; the negative: one with its rubble taken away)',cut(W,byMode('door')),cut(W3,[d]));}
 {const S=byMode('stair'),res=S.map(d=>walk(d));ok('every stair-blocked tower\'s route stops on its stair, past the door ('+S.length+')',S.length&&res.every((r,i)=>!r.ok&&r.y>S[i].y+.5));}
 {const weakOK=ds=>ds.filter(d=>d.climb&&d.climb.weak).every(d=>AV.WEAK_STATES[d.state]),weak=D.filter(d=>d.climb&&d.climb.weak);
  ok('weak floors only in broken, crown-gone and skeleton towers ('+weak.length+' towers, '+reg.weak.length+' weak floors; the negative: one in an intact tower)',weak.length>0&&weakOK(D),weakOK(D.concat([{state:'intact',climb:{weak:1}}])));}
 {const mid=b=>[(b[0]+b[1])/2,(b[2]+b[3])/2,b[4]+1],shut=Wx=>LB.fallen.every(b=>{const m=mid(b);return !!Wx.blocked(m[0],m[2],m[1],.35,1.7);});
  ok('every fallen tower\'s shaft is blocked ('+LB.fallen.length+' boxes; the negative: a walk without them)',LB.fallen.length>0&&shut(W),shut(KWALK.create()));}
 /* the walls (41c AV.towerOutlines / towerWalls, from the records: the Spindle's skirt and fins, the slab families' rectangles) */
 {const WW=KWALK.create();AV.lobbyWalk(WW,LB,TW);const doorOf=new Map(D.map(d=>[d.ti,d]));let n=0;
  const wall=(Wx,shut)=>TW.forEach((T,ti)=>{if(T.state==='fallen')return;const F=MP.FAMILY[T.family],d=doorOf.get(ti),bx=AV.towerWalls(T,AV.towerOutlines(F,skin,null),shut&&d?Object.assign({},d,{mode:'door'}):d);bx.forEach(b=>Wx.block(b,'wall'));n+=bx.length;});
  wall(WW,false);const gr=(x,z)=>{const ap=WW.floorsAt(x,z).find(f=>f[1].tag==='approach');if(ap)return ap[0]-.03;const line=(Math.floor(x/P-.5)+1.5)*P;return line-x<dB?-1.15:0;};
  const O=byMode('open'),bad=O.filter(d=>{const r=AV.walkRoute(WW,gr,d.route);return !r.ok||r.y<TW[d.ti].y+d.climb.top-.75;});
  const W5=KWALK.create();AV.lobbyWalk(W5,LB,TW);wall(W5,true);const shutOut=O.every(d=>!AV.walkRoute(W5,gr,d.route).ok);
  if(bad.length)console.log('   walls cut: '+bad.slice(0,4).map(d=>{const r=AV.walkRoute(WW,gr,d.route);return d.id+' '+d.family+'.'+d.state+' '+r.why+' leg '+r.i+'/'+d.route.length+' tag '+r.tag;}).join('; '));
  ok('walls on every standing tower ('+n+' blocks); every open tower still climbable through its door (the negative: every door walled up)',!bad.length&&n>500,!shutOut);
  const T0=TW[O[0].ti],side=AV.doorWorld(T0,0,0);ok('a walker walking into a tower\'s side meets its wall',!AV.walkRoute(WW,gr,[[side[0]+300*0,T0.z+150],[T0.x,T0.z]]).ok);}
 ok('the same seed, the same doors; another seed, others',JSON.stringify(mk().doors.map(d=>d.mode))===JSON.stringify(D.map(d=>d.mode))&&JSON.stringify(mk({seed:32}).doors.map(d=>d.mode))!==JSON.stringify(D.map(d=>d.mode)));
}
/* the bucketed fields give the brute-force scan's numbers, bit for bit (AV.bucket, 2026-11-10: the build's time was the scan) */
{const C=AV.craters({R:3000,n:24,seed:5,rMin:35,rMax:150,ok:()=>true}),brute=(x,z)=>{let h=0;for(const c of C){const d=Math.hypot(x-c.x,z-c.z);if(d>c.r*1.6)continue;const u=d/c.r;if(u<1){const b=1-u*u;h-=c.depth*b*b;}h+=c.rim*AV.smooth(.6,1,u)*AV.smooth(1.6,1.1,u);}return h;};
 let diff=0,hit=0;for(let i=0;i<20000;i++){const x=(KRAND.unit(KRAND.hash(9,i,1,0))*2-1)*3200,z=(KRAND.unit(KRAND.hash(9,i,2,0))*2-1)*3200,a=AV.craterH(C,x,z),b=brute(x,z);if(a!==b)diff++;if(b)hit++;}
 ok('the bucketed craters give the scan\'s heights at 20,000 points ('+hit+' inside a crater\'s reach, '+diff+' different)',diff===0&&hit>100);
 const C2=C.map(c=>Object.assign({},c));C2._avB=AV.bucket(C2,c=>c.r*.5,128);let d2=0;for(let i=0;i<20000;i++){const x=(KRAND.unit(KRAND.hash(9,i,1,0))*2-1)*3200,z=(KRAND.unit(KRAND.hash(9,i,2,0))*2-1)*3200;if(AV.craterH(C2,x,z)!==brute(x,z))d2++;}
 ok('...and a bucket with too short a reach differs (the negative)',d2>0);}
console.log(fails?fails+' FAILED of '+n:'all '+n+' passed');process.exit(fails?1:0);
