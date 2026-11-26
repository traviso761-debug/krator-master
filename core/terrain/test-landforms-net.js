// node core/terrain/test-landforms-net.js — the graben net and the flood ripples of 38d-core-landforms-net.js (LANDFORMS.md).
// Each check carries a negative that must fail (a broken input, another seed, or the plain ground).
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const R=KRELIEF;
ok('it refuses to load before 38c',throws(()=>eval(fs.readFileSync(path.join(__dirname,'38d-core-landforms-net.js'),'utf8'))),false);
eval(fs.readFileSync(path.join(__dirname,'38c-core-landforms.js'),'utf8'));

// ---- loading it moves nothing: every older kind answers exactly as before
const g0=(x,z)=>100-.02*z+3*Math.sin(x/90),sc=R.scarp({pts:[[0,0],[800,0]],h:120,run:200,seed:2}),P=R.stepcut({line:{pts:[[-500,-200],[0,100],[600,0]],w:30},depth:25,seed:11,head:{len:200}});
const probe=()=>{const o=[];for(let i=0;i<120;i++){const x=i*9-300,z=(i*37)%400-200;o.push(R.shape(sc,x,z,g0(x,z)),R.shape(P,x,z,g0(x,z)),JSON.stringify(R.at(sc,x,z)),JSON.stringify(R.at(P,x,z,g0(x,z))));}return JSON.stringify(o);};
const before=probe(),kinds0=R.kinds();
eval(fs.readFileSync(path.join(__dirname,'38d-core-landforms-net.js'),'utf8'));
ok('loaded, the older kinds answer exactly as before',probe()===before,false);
ok('kinds lists grabenNet and ripples after the others',JSON.stringify(R.kinds())===JSON.stringify(kinds0.concat(['grabenNet','ripples'])),false);
ok('loading it twice changes nothing',(()=>{const k=R.kinds().length;eval(fs.readFileSync(path.join(__dirname,'38d-core-landforms-net.js'),'utf8'));return R.kinds().length===k;})(),false);
const json=r=>JSON.parse(JSON.stringify(r)),y=(rec,x,z,g)=>R.shape(rec,x,z,g==null?0:g);

// ---- the graben net: the Labyrinth's three trends
const AZ=[.2,.2+Math.PI/3,.2+2*Math.PI/3],trends=AZ.map((az,i)=>({az,spacing:[900,1000,1100][i],w:[20,35],depth:[50,90]}));
const dome=(x,z)=>Math.hypot(x-4500,z-4500)>900,box=[0,0,6000,6000];
const N=R.grabenNet({box,world:7,id:'lab',trends,keep:dome,ground:()=>5000});
ok('a net of cuts on three trends ('+N.cuts.length+' cuts, '+N.nodes.length+' crossings, '+N.bastions.length+' bastions)',N.kind==='grabenNet'&&N.cuts.length>20&&[0,1,2].every(t=>N.cuts.some(c=>c.trend===t))&&N.nodes.length>5&&N.bastions.length>3,false);
const azOf=c=>{const p=c.line.pts;return Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]);},modPi=a=>((a%Math.PI)+Math.PI)%Math.PI;
ok('every cut runs at its trend\'s azimuth',N.cuts.every(c=>Math.abs(modPi(azOf(c))-modPi(AZ[c.trend]))<1e-9),N.cuts.every(c=>Math.abs(modPi(azOf(c))-modPi(AZ[(c.trend+1)%3]))<1e-9));
ok('each cut is a stepcut with tapered heads at both ends, its id <net>:<trend>:<line>,<segment>',N.cuts.every(c=>c.kind==='stepcut'&&c.head&&c.head.at==='both'&&/^lab:[0-2]:-?\d+,-?\d+(\/\d+)?$/.test(c.id))&&new Set(N.cuts.map(c=>c.id)).size===N.cuts.length,false);
ok('every cut\'s depth is within its trend\'s range, and its floor that deep',N.cuts.every(c=>c.depth>=50&&c.depth<=90&&c.line.w>=20&&c.line.w<=35)&&N.cuts.every(c=>{const p=c.line.pts,mx=(p[0][0]+p[1][0])/2,mz=(p[0][1]+p[1][1])/2;return Math.abs(y(c,mx,mz)+c.depth)<1e-9;}),
  R.grabenNet({box,world:7,trends:AZ.map(az=>({az,spacing:1000,depth:[200,300]}))}).cuts.every(c=>c.depth<=90));
const segs=t=>N.cuts.filter(c=>c.trend===t).length;
ok('the segments stand en echelon: lines broken by gaps, several per line',[0,1,2].every(t=>{const m={};N.cuts.filter(c=>c.trend===t).forEach(c=>{m[c.lineNo]=(m[c.lineNo]||0)+1;});return Object.values(m).some(v=>v>1);})&&segs(0)>3,false);
const sameCut=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const N2=R.grabenNet({box,world:7,id:'lab',trends,keep:dome,ground:()=>5000});
ok('deterministic: the same world, the same net; another world, another',sameCut(N.cuts,N2.cuts)&&sameCut(N.bastions,N2.bastions)&&!sameCut(R.grabenNet({box,world:8,id:'lab',trends,keep:dome}).cuts,N.cuts),false);
const tile=[2000,1500,3500,3000],Nt=R.grabenNet({box:tile,world:7,id:'lab',trends,keep:dome,bastions:false});
const reaches=(c,b)=>{const p=c.line.pts,r=c.line.w+c.edge+4;return Math.max(p[0][0],p[1][0])+r>=b[0]&&Math.min(p[0][0],p[1][0])-r<=b[2]&&Math.max(p[0][1],p[1][1])+r>=b[1]&&Math.min(p[0][1],p[1][1])-r<=b[3];};
const byId=new Map(N.cuts.map(c=>[c.id,c]));
ok('a tile alone has the very cuts the whole box has there ('+Nt.cuts.length+' cuts)',Nt.cuts.length>3&&Nt.cuts.every(c=>byId.has(c.id)&&sameCut(c,byId.get(c.id)))&&N.cuts.filter(c=>reaches(c,tile)).every(c=>Nt.cuts.some(d=>d.id===c.id)),
  R.grabenNet({box:tile,world:9,id:'lab',trends,keep:dome,bastions:false}).cuts.every(c=>byId.has(c.id)&&sameCut(c,byId.get(c.id))));
let tileSame=true;for(let i=0;i<=30;i++)for(let j=0;j<=30;j++){const x=tile[0]+50*i,z=tile[1]+50*j;if(y(Nt,x,z,7)!==y(N,x,z,7))tileSame=false;}
ok('and draws the very same ground in the tile',tileSame,false);
let inDome=0,cutAny=0;for(let x=0;x<=6000;x+=20)for(let z=0;z<=6000;z+=20){const v=y(N,x,z);if(v<0){cutAny++;if(!dome(x,z))inDome++;}}
let nokeep=0;const Nk=R.grabenNet({box,world:7,id:'lab',trends,bastions:false});for(let x=3600;x<=5400;x+=20)for(let z=3600;z<=5400;z+=20)if(!dome(x,z)&&y(Nk,x,z)<0)nokeep++;
ok('keep is respected: no cut enters the dome ('+cutAny+' cut samples, '+inDome+' in it)',cutAny>1000&&inDome===0,nokeep===0);
let bastOK=true,bastN=0;N.bastions.forEach(B=>{
  const g=(x,z)=>5000;for(let i=0;i<40;i++){const ang=i*2.399,rr=Math.sqrt(B.area/Math.PI)*.4*((i%7)/7);const x=B.c[0]+Math.cos(ang)*rr,z=B.c[1]+Math.sin(ang)*rr;
    if(inPoly(B.pts,x,z)){bastN++;if(y(N,x,z,5000)!==5000||R.at(N,x,z,5000)!==null)bastOK=false;}}});
function inPoly(P,x,z){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
ok('the bastions are not cut: their interiors keep the ground ('+bastN+' samples)',bastOK&&bastN>50,N.bastions.length===0);
ok('a bastion is a closed outline with an area, a top and an id by its first cell',N.bastions.every(B=>B.pts.length>=4&&B.area>0&&B.top===5000&&/^lab:b:-?\d+,-?\d+$/.test(B.id))&&N.bastions.some(B=>!B.edge),false);
const crossOK=N.nodes.every(n=>{const a=byId.get(n.cuts[0]),b=byId.get(n.cuts[1]);return a.trend!==b.trend&&y(N,n.x,n.z)<=Math.min(-a.depth*(R.at(a,n.x,n.z)&&R.at(a,n.x,n.z).head?0:1),0)+1e-9;});
ok('nodes lie where two trends\' cuts cross',N.nodes.length>0&&N.nodes.every(n=>{const a=byId.get(n.cuts[0]),b=byId.get(n.cuts[1]);return a.trend!==b.trend&&R.at(a,n.x,n.z)&&R.at(b,n.x,n.z);})&&crossOK,false);
const n0=N.nodes.find(n=>{const a=byId.get(n.cuts[0]),b=byId.get(n.cuts[1]);return R.at(a,n.x,n.z).part==='floor'&&R.at(b,n.x,n.z).part==='floor'&&!R.at(a,n.x,n.z).head&&!R.at(b,n.x,n.z).head;});
ok('where cuts cross the net takes the deeper floor (applying the cuts one by one would add them)',!n0||(()=>{const a=byId.get(n0.cuts[0]),b=byId.get(n0.cuts[1]);return Math.abs(y(N,n0.x,n0.z)+Math.max(a.depth,b.depth))<1e-9&&R.apply(()=>0,[a,b])(n0.x,n0.z)<y(N,n0.x,n0.z)-10;})(),!n0);
const Nj=json(N);ok('the net is JSON-safe: its JSON draws the same ground and names the same parts',(()=>{for(let i=0;i<200;i++){const x=(i*397)%6000,z=(i*613)%6000;if(y(Nj,x,z,3)!==y(N,x,z,3)||JSON.stringify(R.at(Nj,x,z,3))!==JSON.stringify(R.at(N,x,z,3)))return false;}return true;})(),false);
const anyAt=(()=>{for(const c of N.cuts){const p=c.line.pts,mx=(p[0][0]+p[1][0])/2,mz=(p[0][1]+p[1][1])/2,a=R.at(N,mx,mz);if(a)return a;}return null;})();
ok('at names the cut and its part; waters lists nothing',anyAt&&anyAt.part==='floor'&&byId.has(anyAt.cut)&&R.waters(N,()=>0).length===0,false);
ok('heads: false gives square-ended cuts; bad nets throw',R.grabenNet({box,world:7,trends,heads:false,bastions:false}).cuts.every(c=>!c.head)&&throws(()=>R.grabenNet({box,trends:[{az:0}]}))&&throws(()=>R.grabenNet({trends}))&&throws(()=>R.grabenNet({box,trends:[]})),
  throws(()=>R.grabenNet({box,trends:[{az:0,spacing:500}],bastions:false})));

// ---- the flood ripples: a field 3 km down the flow (+x), 2 km across
const F=R.ripples({poly:[[0,0],[3000,0],[3000,2000],[0,2000]],flow:0,wl:100,h:8,seed:3}),F0=R.ripples({poly:[[0,0],[3000,0],[3000,2000],[0,2000]],flow:0,wl:100,h:8,seed:3,bif:0,sinuous:0,vary:0});
const prof=(rec,z,x0,x1,dx)=>{const o=[];for(let x=x0;x<=x1;x+=dx)o.push(y(rec,x,z));return o;};
const p0=prof(F0,1000,500,2500,.5);let up=0,down=0;for(let i=1;i<p0.length;i++){const s=(p0[i]-p0[i-1])/.5;if(s>up)up=s;if(-s>down)down=-s;}
ok('asymmetric: the stoss (upstream) face gentler than the lee ('+up.toFixed(3)+' against '+down.toFixed(3)+')',up>0&&down>2*up,(()=>{const q=prof(R.ripples({poly:F0.poly,flow:Math.PI,wl:100,h:8,seed:3,bif:0,sinuous:0,vary:0}),1000,500,2500,.5);let u=0,d=0;for(let i=1;i<q.length;i++){const s=(q[i]-q[i-1])/.5;if(s>u)u=s;if(-s>d)d=-s;}return d>2*u;})());
const crests=(rec,z)=>{const c=[];for(let x=500;x<=2500;x+=1){const a=R.at(rec,x,z);if(a&&a.part==='crest'&&(!c.length||x-c[c.length-1]>30))c.push(x);}return c;};
const sp=c=>(c[c.length-1]-c[0])/(c.length-1);let spAll=[];[400,800,1200,1600].forEach(z=>spAll.push(sp(crests(F,z))));
ok('crests about a wavelength apart ('+spAll.map(v=>v.toFixed(0)).join(', ')+' m for wl 100)',spAll.every(v=>Math.abs(v-100)<15),sp(crests(R.ripples({poly:F.poly,flow:0,wl:150,h:8,seed:3}),1000))<115);
ok('crests run across the flow: one level along a crest (z), changing along the flow (x)',(()=>{const x=crests(F0,1000)[3];return Math.abs(y(F0,x,900)-y(F0,x,1100))<1e-9&&Math.abs(y(F0,x,900)-y(F0,x+40,900))>2;})(),false);
const hRange=(()=>{let lo=1e9,hi=-1e9;p0.forEach(v=>{lo=Math.min(lo,v);hi=Math.max(hi,v);});return hi-lo;})();
ok('trough to crest is h ('+hRange.toFixed(2)+' m for 8), and the bedform is mean-free',Math.abs(hRange-8)<.05&&Math.abs(p0.reduce((a,b)=>a+b)/p0.length)<.1,false);
let outZ=true;for(const p of [[-10,500],[3010,500],[1500,-5],[1500,2005],[-500,-500]])if(y(F,p[0],p[1],7)!==7||R.at(F,p[0],p[1],7)!==null)outZ=false;
let edgeMax=0;for(let x=0;x<=3000;x+=7)edgeMax=Math.max(edgeMax,Math.abs(y(F,x,1)));
ok('zero outside the area, fading to nothing at its edge ('+edgeMax.toFixed(3)+' m a metre in)',outZ&&edgeMax<.1&&Math.abs(y(F,1500,1000))>0,false);
const Fs=R.ripples({poly:F.poly,flow:0,wl:100,h:8,seed:3,bif:0});let sw=0;for(let z=200;z<=1800;z+=50){const c=crests(Fs,z)[5];if(c!=null)sw=Math.max(sw,Math.abs(c-crests(Fs,1000)[5]));}
ok('sinuous: a crest wanders along its length ('+sw+' m)',sw>8&&sw<60,(()=>{let s=0;for(let z=200;z<=1800;z+=50)s=Math.max(s,Math.abs(crests(F0,z)[5]-crests(F0,1000)[5]));return s>8;})());
const along=(rec,z,x0,x1)=>{let n=0,last=-1e9;for(let x=x0;x<=x1;x+=1){const a=R.at(rec,x,z);if(a&&a.part==='crest'&&x-last>30){n++;last=x;}}return n;};
const forkY=rec=>{let hit=0,n=0;for(const Fk of F.forks){const mz=(Fk.a[1]+Fk.b[1])/2,ez=Fk.b[1]+150,x0=Fk.a[0]-400,x1=Fk.a[0]+400;if(x0<50||x1>2950||ez>1950)continue;n++;if(along(rec,mz,x0,x1)!==along(rec,ez,x0,x1))hit++;}return [hit,n];};
const fy=forkY(F),fy0=forkY(Fs);
ok('bifurcating: across each fork one crest more or fewer than beside it ('+fy[0]+' of '+fy[1]+' forks; '+fy0[0]+' of the same spans without forks)',F.forks.length>0&&fy[1]>2&&fy[0]>=.7*fy[1]&&fy0[0]<fy[0],R.ripples({poly:F.poly,flow:0,seed:3,bif:0}).forks.length>0);
let seam=0;for(const Fk of F.forks)for(let t=.1;t<.9;t+=.1){const x=Fk.a[0],z=Fk.a[1]+(Fk.b[1]-Fk.a[1])*t;seam=Math.max(seam,Math.abs(y(F,x-.01,z)-y(F,x+.01,z)));}
ok('a fork leaves no seam: the phase jumps a whole wavelength across the inserted crest ('+seam.toFixed(4)+' m over 2 cm)',seam<.05,false);
ok('at names crest, stoss, lee and trough',(()=>{const s=new Set();for(let x=500;x<700;x+=1)s.add(R.at(F0,x,1000).part);return ['crest','stoss','lee','trough'].every(p=>s.has(p));})(),false);
ok('deterministic and JSON-safe; another seed, another field',(()=>{const A=R.ripples({poly:F.poly,flow:0,wl:100,h:8,seed:3}),J=json(F);for(let i=0;i<100;i++){const x=(i*97)%3000,z=(i*61)%2000;if(y(A,x,z)!==y(F,x,z)||y(J,x,z)!==y(F,x,z))return false;}return true;})(),
  (()=>{const B=R.ripples({poly:F.poly,flow:0,wl:100,h:8,seed:4});for(let i=0;i<100;i++){const x=(i*97)%3000,z=(i*61)%2000;if(y(B,x,z)!==y(F,x,z))return false;}return true;})());
const Lr=R.ripples({line:{pts:[[0,0],[1000,400],[2200,300]],w:250},wl:80,h:5,seed:2,bif:0});
ok('a line form: the flow runs along the line, crests across it, nothing past its width',R.at(Lr,1000,400)&&y(Lr,1000,700,3)===3&&(()=>{let n=0;for(let s=0;s<600;s+=1){const a=R.at(Lr,1600+s,350);if(a&&a.part==='crest')n++;}return n>0;})(),false);
ok('bad ripples throw (no area, a poly without flow, stoss out of 0..1)',throws(()=>R.ripples({}))&&throws(()=>R.ripples({poly:F.poly}))&&throws(()=>R.ripples({poly:F.poly,flow:0,stoss:1.2})),throws(()=>R.ripples({poly:F.poly,flow:0})));
ok('KRELIEF.apply takes them with the older kinds',R.apply(g0,[sc,N,F])(1200,1200)===R.shape(F,1200,1200,R.shape(N,1200,1200,R.shape(sc,1200,1200,g0(1200,1200)))),false);
ok('the fragment uses no THREE, no DOM and no Math.random',!/THREE\.|document\.|window\.|Math\.random\(|getImageData/.test(fs.readFileSync(path.join(__dirname,'38d-core-landforms-net.js'),'utf8').replace("typeof window!=='undefined'?window:globalThis","")),!/Math\.random\(/.test('Math.random()'));

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
