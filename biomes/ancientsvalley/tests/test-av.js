#!/usr/bin/env node
/* The valley's data side (src/41-av-field.js) in node: the model's ground, the fields, the plan and the viaduct, each check with a
   negative. Run: node biomes/ancientsvalley/tests/test-av.js */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,JSON};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','biomes/ancientsvalley/src/41-av-field.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
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
{const f=P.towers.filter(t=>t.state==='intact').length/P.towers.length,tall=P.towers.filter(t=>/^(intact|gutted|crown)$/.test(t.state)).length/P.towers.length;ok('few intact, under a third standing tall ('+Math.round(f*100)+'%, '+Math.round(tall*100)+'%)',f>.02&&f<.15&&tall<.35);}
// the craters: on the page, apart, and the bowl below its rim
{const C=AV.craters({R:2800,n:12,seed:3,ok:(x,z,r)=>ground(x,z)>LAKE+10});ok('craters struck ('+C.length+')',C.length>=8&&C.every(c=>Math.hypot(c.x,c.z)<=2800));
 let apart=true;for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)if(Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z)<C[i].r+C[j].r)apart=false;ok('no two craters overlap',apart);
 const c=C[0];ok('a crater is a bowl under a rim',AV.craterH(C,c.x,c.z)<-c.depth*.9&&AV.craterH(C,c.x+c.r,c.z)>0&&AV.craterH(C,c.x+c.r*3,c.z)===0,AV.craterH(C,c.x+c.r*3,c.z)!==0);}
ok('a hero-only design never stands as a skeleton or fallen',P.towers.every(t=>t.family!=='terrace'||(t.state!=='skeleton'&&t.state!=='fallen')));
ok('the designs stand only round the eye',P.towers.every(t=>t.family!=='terrace'||Math.hypot(t.x-300,t.z+150)<400));
// the viaduct
const V=AV.viaduct([[2900,-520],[1400,-560],[300,-700]],{step:36,ground,deckY:(x,z,s)=>Math.max(ground(x,z)+16,LAKE+38)});
ok('the viaduct runs its length in decks and piers ('+V.decks.length+' decks)',V.decks.length>60&&V.piers.length===V.decks.length+1&&Math.abs(V.length-(1500.5+1109))<20);
ok('every deck is above its ground and every pier reaches it',V.decks.every(d=>d.y>ground(d.x,d.z)+10)&&V.piers.every(p=>p.y1>p.y0));
console.log(fails?fails+' FAILED of '+n:'all '+n+' passed');process.exit(fails?1:0);
