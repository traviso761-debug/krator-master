// ================================================================= HOST — station 5's preset views, its negatives' points, its own check (the mixed belt)
const LIP=(function(){for(let x=-2400;x<=2400;x+=4){if(WF.bedH(x+6)-WF.bedH(x)>8)return x;}return 0;})();   /* the first fall's foot, found on the bed */
const NSCARP=2;
const VIEWS={
 'The cool rainforest, combed to the giant':(function(){const x=-200,z=WF.zs(-200)+420;return[x,gh(x,z,3),z,x+GX*200,gh(x+GX*200,z+GZ*200,16),z+GZ*200];})(),
 'A combed beech':(function(){const T=nearTree('beech',300,WF.zs(300)-400,16);return atTree(T,T.H*1.1,GAZ+Math.PI/2,3,.55);})(),
 'Under the beeches, looking up the giant side':(function(){const T=nearTree('beech',-600,WF.zs(-600)+300,16);const cx=T.x-Math.cos(GAZ)*6,cz=T.z-Math.sin(GAZ)*6;return[cx,gh(cx,cz,1.7),cz,T.x+Math.cos(GAZ)*4,T.y0+T.H*.85,T.z+Math.sin(GAZ)*4];})(),
 'The last laurels and tree ferns':(function(){const T=nearTree('laurel',-2000,0,10);return atTree(T,T.H*1.2,GAZ+Math.PI*.7,3,.5);})(),
 'A fall between the benches':(function(){const x=LIP-200,z=WF.zs(LIP)+40;return[x,gh(x,z,6),z,LIP+30,WF.bedH(LIP+20)-20,WF.zs(LIP+30)];})(),
 'The first firs above':(function(){const T=nearTree('fir',2200,0,6);return atTree(T,T.H*1.3,GAZ+Math.PI/2,2,.5);})(),
 'From afar':look(-2500,-2500,260,600,400,100),
};
const NEG={wet:(function(){const x=-600,z=WF.zs(x);return[x,WF.bedH(x)-1.2,z];})(),   /* 1.7 m under the stream (bedH + .5): HCHK.dry wants more than 1 m (at -.3 the negative passed, 2026-11-08) */
 cliff:(function(){let bx=0,bz=0,bs=-1;for(let z=-2400;z<=2400;z+=12)for(let x=-2400;x<=2400;x+=12){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[0,0],[-1500,WF.zs(-1500)+300],[1400,WF.zs(1400)-300]]};
const FALLS_CHK=n=>({name:'the stream falls at each scarp (WATER.fallsOf, drawn)',ok:n>=NSCARP,detail:n+' falls drawn ('+NSCARP+' scarps on the page)'});
STAGE.checks=[()=>FALLS_CHK((window._water||{}).falls||0)];
STAGE.negatives=[()=>Object.assign(FALLS_CHK(0),{name:'a stream with no fall'})];
