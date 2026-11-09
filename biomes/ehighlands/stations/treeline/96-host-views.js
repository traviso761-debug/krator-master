// ================================================================= HOST — station 4's preset views, its negatives' points, its own check (the treeline)
const FIRS=f=>EHIGH.TREES.filter(T=>T.sp===SPI('fir')&&T.lv===2&&T.form===f);
const near=(L,x,z)=>L.slice().sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0]||{x,z,y0:gh(x,z),H:4,crownR:2};
const VIEWS={
 'The treeline from below':look(-1900,-200,4,1200,-200,40),
 'Flagged firs, every branch to the giant':(function(){const T=near(FIRS(1),900,-300);return atTree(T,Math.max(8,T.H*1.4),GAZ+Math.PI/2,1.8,.5);})(),
 'Krummholz under the crest':(function(){const T=near(FIRS(2),2000,0);return atTree(T,6,GAZ+Math.PI*.8,1.4,.3);})(),
 'Ragbark in the gully':(function(){const T=nearTree('ragbark',1200,WF.zs(1200),4);return atTree(T,12,GAZ+Math.PI/2,2,.5);})(),
 'The avalanche chute':look(-2200,-1500,6,-800,-1100,40),
 'Over the crest - the cushions come':look(2050,600,3,2600,700,0),
 'The tarn under the crest':(function(){const Pq=POOLS[0];return[Pq.x-Pq.r*4,gh(Pq.x-Pq.r*4,Pq.z+Pq.r,3),Pq.z+Pq.r,Pq.x,Pq.y+.5,Pq.z];})(),
 'From afar':look(-2500,-2500,240,600,400,100),
};
const NEG={wet:(function(){const x=-600,z=WF.zs(x);return[x,WF.bedH(x)-1.2,z];})(),   /* 1.7 m under the stream (bedH + .5): HCHK.dry wants more than 1 m (at -.3 the negative passed, 2026-11-08) */
 cliff:(function(){let bx=0,bz=0,bs=-1;for(let z=-2400;z<=2400;z+=12)for(let x=-2400;x<=2400;x+=12){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[0,0],[-1500,WF.zs(-1500)+300],[1400,WF.zs(1400)-300]]};
/* the station's own check: the fir takes all three forms here, upright low on the page, flagged, krummholz at the top (and upright below the flagged) */
const FORMS=T=>{const n=[0,0,0],y=[0,0,0];T.forEach(t=>{if(t.form!=null){n[t.form]++;y[t.form]+=t.y0;}});const ok=n.every(k=>k>=3)&&y[0]/n[0]<y[1]/n[1]&&y[1]/n[1]<y[2]/n[2];
 return{name:'the firs upright, flagged and krummholz, in that order up the face',ok,detail:'upright '+n[0]+', flagged '+n[1]+', krummholz '+n[2]+(n.every(k=>k)?' (mean heights '+y.map((v,i)=>(v/n[i]).toFixed(0)).join(', ')+')':'')};};
STAGE.checks=[()=>FORMS(EHIGH.TREES.filter(t=>t.sp===SPI('fir')))];
STAGE.negatives=[()=>Object.assign(FORMS(EHIGH.TREES.filter(t=>t.sp===SPI('fir')&&t.form!==2)),{name:'a treeline with no krummholz'})];
