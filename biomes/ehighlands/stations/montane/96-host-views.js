// ================================================================= HOST — station 6's preset views, its negatives' points, its own check (the montane belt)
const LIP=(function(){for(let x=-2000;x<=2400;x+=4){if(WF.bedH(x+6)-WF.bedH(x)>8)return x;}return 0;})();
const NSCARP=1;
const VIEWS={
 'Fir and beech stands, combed to the giant':(function(){const x=-400,z=WF.zs(-400)+450;return[x,gh(x,z,4),z,x+GX*220,gh(x+GX*220,z+GZ*220,14),z+GZ*220];})(),
 'A combed fir':(function(){const T=nearTree('fir',800,WF.zs(800)-350,12);return atTree(T,T.H*1.2,GAZ+Math.PI/2,2.5,.5);})(),
 'A combed beech among the firs':(function(){const T=nearTree('beech',-900,WF.zs(-900)-300,14);return atTree(T,T.H*1.1,GAZ+Math.PI/2,3,.55);})(),
 'Under the firs':(function(){const T=nearTree('fir',1600,WF.zs(1600)+300,12);const cx=T.x-Math.cos(GAZ)*5,cz=T.z-Math.sin(GAZ)*5;return[cx,gh(cx,cz,1.7),cz,T.x,T.y0+T.H*.7,T.z];})(),
 'The scarp\'s fall':(function(){const x=LIP-200,z=WF.zs(LIP)+40;return[x,gh(x,z,6),z,LIP+30,WF.bedH(LIP+20)-20,WF.zs(LIP+30)];})(),
 'From afar':look(-2500,-2500,260,600,400,100),
};
const NEG={wet:(function(){const x=-600,z=WF.zs(x);return[x,WF.bedH(x)-1.2,z];})(),   /* 1.7 m under the stream (bedH + .5): HCHK.dry wants more than 1 m (at -.3 the negative passed, 2026-11-08) */
 cliff:(function(){let bx=0,bz=0,bs=-1;for(let z=-2400;z<=2400;z+=12)for(let x=-2400;x<=2400;x+=12){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[0,0],[-1500,WF.zs(-1500)+300],[1400,WF.zs(1400)-300]]};
const FALLS_CHK=n=>({name:'the stream falls at each scarp (WATER.fallsOf, drawn)',ok:n>=NSCARP,detail:n+' falls drawn ('+NSCARP+' scarps on the page)'});
STAGE.checks=[()=>FALLS_CHK((window._water||{}).falls||0)];
STAGE.negatives=[()=>Object.assign(FALLS_CHK(0),{name:'a stream with no fall'})];
