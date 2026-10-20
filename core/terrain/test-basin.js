// node core/terrain/test-basin.js — the old water bodies' contract (40-core-basin.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'40-core-basin.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KBASIN,BAND=K.BAND;

// ---- the north basin's west lobe in small: a dam lake at 900 m (sill 700, its lake today at -81 m) and the flood lake
// that later filled it to 834 m (its lake today at 430 m); both cover x < 0, nothing covers x > 0
const inW=(x,z)=>x<0?1:0;
const dam={name:'dam',kind:'dam',level:900,sill:700,ring:30,remnant:-81,member:inW};
const flood={name:'flood lake',kind:'flood',level:834,remnant:430,member:inW};
const B=K.create({lakes:[dam,flood],seed:5,wind:[1,0]});
const A=K.create({lakes:[dam],seed:5,wind:[1,0]});
const s=(b,h,x)=>b.sample(x==null?-100:x,0,h,{});

ok('outside every basin nothing is marked',s(B,500,100).lake===-1&&s(B,500,100).bed===0,s(B,500,-100).lake===-1);
ok('above the old level nothing is under water',s(B,960).lake===-1&&s(B,960).bed===0,s(B,880).lake===-1);
ok('a dam lake: the bathtub ring under its level',s(A,885).band===BAND.ring&&s(A,885).ring>.9,s(A,850).band===BAND.ring);
ok('a dam lake: the fast drain between the ring and the sill',s(A,800).band===BAND.drain&&s(A,800).strand===0,s(A,600).band===BAND.drain);
ok('a dam lake: the slow recession under the sill',s(A,600).band===BAND.recession,s(A,800).band===BAND.recession);
ok('under its lake today: water',s(A,-90).band===BAND.water,s(A,-70).band===BAND.water);
ok('where the flood lake filled the dam basin, the later water decides (the high line, then the recession)',
   s(B,830).lake===1&&s(B,830).band===BAND.high&&s(B,780).lake===1&&s(B,780).band===BAND.recession,s(A,780).band!==BAND.drain);
ok('over the flood lake the dam lake still decides (its drain band)',s(B,860).lake===0&&s(B,860).band===BAND.drain,s(B,860).lake===1);

// ---- the strandlines
const st=B.lakes[0].strands,lv=st.map(S=>S.level);
ok('a dam lake\'s strandlines run from its sill down to its lake today, top to bottom',lv[0]<700&&lv[lv.length-1]>-81&&lv.every((v,i)=>!i||v<lv[i-1]),false);
const third=Math.floor(lv.length/3),gap=a=>(a[0]-a[a.length-1])/(a.length-1);
ok('they close up toward today\'s water',gap(lv.slice(-third))<gap(lv.slice(0,third))*.6,gap(lv.slice(-third))>gap(lv.slice(0,third)));
ok('a flood lake\'s start under its high line',B.lakes[1].strands[0].level<834-6&&B.lakes[1].strands[0].level>780,false);
const B2=K.create({lakes:[dam,flood],seed:5}),B3=K.create({lakes:[dam,flood],seed:6});
ok('the same seed gives the same strandlines; another seed others',JSON.stringify(B2.lakes[0].strands)===JSON.stringify(st),JSON.stringify(B3.lakes[0].strands)===JSON.stringify(st));
const S0=st[5];
ok('on a strandline the strand field is its strength; between two it is less',s(A,S0.level).strand>.99*S0.s&&Math.abs(s(A,S0.level).strandD)<1e-9,s(A,S0.level+S0.w*1.5).strand>=s(A,S0.level).strand);
ok('under the dam lake\'s sill its own strandlines, though the flood lake filled the basin',s(B,S0.level).lake===0&&s(B,S0.level).strand>.99*S0.s,s(B,S0.level).lake===1);
ok('there its water fell from the year the flood lake reached the sill',s(A,600).dry-s(B,600).dry>150&&s(A,600).dry-s(B,600).dry<250,s(B,600).dry===s(A,600).dry);
ok('the years: the drain band dried in the flood, the bottom of the recession last',s(A,800).dry===1000&&s(A,-70).dry<450&&s(A,300).dry>s(A,0).dry,s(A,300).dry<s(A,0).dry);
ok('a strandline\'s year falls between its neighbours\'',st[10].year>st[9].year&&st[10].year<st[11].year,st[10].year<st[9].year);

// ---- the ground's fields
ok('salt rises toward today\'s water in the recession',s(A,0).salt>s(A,350).salt&&s(A,650).salt<.05&&s(A,800).salt===0,s(A,0).salt<=s(A,350).salt);
ok('the flood lake left fresher water than a dam lake at the same depth of fall',s(B,450).salt<s(A,-60).salt,false);
ok('silt lies thicker where the water stood deeper',s(A,500).silt>s(A,880).silt&&s(A,895).silt<.2,s(A,500).silt<=s(A,880).silt);
ok('the full level\'s line is marked either side of it',s(A,901).shore>.5&&s(A,899).shore>.5&&s(A,920).shore===0,s(A,920).shore>0);

// ---- the land
const flat=K.create({lakes:[dam,flood],seed:5,yardang:{h:0}});
let mono=true,prev=-1e9;for(let h=-100;h<=1100;h+=.05){const y=flat.land(-100,0,h);
  // the beach ridge over a dam lake's level is the one bump (a swale behind it is allowed); everything else is monotone
  if(!(h>899&&h<905)&&y<prev-1e-9)mono=false;prev=y;}
const hump=[],q=K.bench;let mono2=true,p2=-1e9;for(let u=-1;u<=1;u+=.001){const y=u+1.5*q(u);if(y<p2)mono2=false;p2=y;}
ok('the benches are a monotone map of the height: they make no new hollows',mono,mono2);
const S1=st.reduce((a,b)=>b.s>a.s&&b.level<650&&b.level>0?b:a,st[1]);
const dy=(flat.land(-100,0,S1.level+.05)-flat.land(-100,0,S1.level-.05))/.1;
ok('a strong strandline is a bench (the ground flattens across it)',dy<.6,(A.land(100,0,S1.level+.05)-A.land(100,0,S1.level-.05))/.1<.6);
ok('the beach ridge stands just over a long-held level',flat.land(-100,0,902)-902>1,flat.land(100,0,902)-902>1);
let yd=0;for(let x=-3000;x<-100;x+=7)yd=Math.max(yd,B.land(x,0,500)-flat.land(x,0,500));
let ydc=0;for(let z=0;z<3000;z+=7)ydc=Math.max(ydc,Math.abs(B.land(-1000,z,500)-B.land(-1000,z+3,500)));
let yda=0;for(let x=-3000;x<-100;x+=7)yda=Math.max(yda,Math.abs(B.land(x,1000,500)-B.land(x+3,1000,500)));
ok('yardangs rise in the dry silt, long along the wind and short across it',yd>2&&yda<ydc,yd===0);
ok('land is the same whatever was asked before (no state)',B.land(-500,20,333)===(B.land(-9000,0,12),B.land(-500,20,333)),false);

// ---- from region.json "palaeo"
const P={lakes:[{name:'dam',kind:'dam lake',level_m:900,sill_m:700,ring_m:30,bit:0,remnants:[{level_m:-81}]},
                {name:'flood lake',kind:'flood lake',level_m:834,bit:1,remnants:[{level_m:430}]}]};
const BR=K.fromRegion(P,(bit,x,z)=>x<0?1:0,{seed:5});
ok('fromRegion reads the extractor\'s lakes',BR.lakes.length===2&&BR.lakes[0].sill===700&&BR.lakes[1].kind==='flood'&&BR.lakes[1].remnant===430,BR.lakes[0].kind==='flood');
let threw=false;try{K.create({lakes:[{level:900,remnant:0,member:inW}]});}catch(e){threw=true;}
ok('a dam lake without its sill is refused',threw,false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
