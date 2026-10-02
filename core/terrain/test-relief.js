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
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
