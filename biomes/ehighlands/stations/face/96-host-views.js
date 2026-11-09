// ================================================================= HOST — station 2's preset views, its negatives' points, its own check (the wet face)
// Found on the map, not typed: the falls are the stream's lips (window._water, 89w), the plants the nearest built heroes (95v's helpers).
const LIPS=SPINE.slice(1).filter((p,i)=>i%2===0);   /* below each scarp's lip, on the stream (46: SPINE) */
const L0=LIPS[1]||[0,0],FX=L0[0]-HW-10,FZ=zr(FX);
const VIEWS={
 'The cloud forest, combed to the giant':(function(){const x=-600,z=zr(-600)+420;return[x,gh(x,z,3),z,x+GX*200,gh(x+GX*200,z+GZ*200,14),z+GZ*200];})(),
 'A combed laurel':(function(){const T=nearTree('laurel',300,zr(300)+350,14);return atTree(T,T.H*1.1,GAZ+Math.PI/2,3,.55);})(),
 'Under the laurels, looking up the giant side':(function(){const T=nearTree('laurel',-700,zr(-700)-300,14);const cx=T.x-Math.cos(GAZ)*6,cz=T.z-Math.sin(GAZ)*6;return[cx,gh(cx,cz,1.7),cz,T.x+Math.cos(GAZ)*4,T.y0+T.H*.85,T.z+Math.sin(GAZ)*4];})(),
 "Giant's tree ferns":(function(){const T=nearTree('treefern',-1000,zr(-1000)+120,4);return atTree(T,T.H*1.5,GAZ+Math.PI*.7,1.8,.75);})(),
 'The middle fall':(function(){const x=FX-260,z=FZ+30;return[x,gh(x,z,8),z,FX+120,bedH(FX+130)-30,zr(FX+130)];})(),
 'The slot below the fall':(function(){const x=FX-170,z=zr(FX-170);return[x,bedH(x)+3,z,FX+125,bedH(FX+125)+20,zr(FX+125)];})(),
 'A sag pond under the scarp':(function(){const Pq=POOLS.slice().sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];const x=Pq.x-Pq.r*3,z=Pq.z+Pq.r*1.5;return[x,gh(x,z,2.2),z,Pq.x,Pq.y+.5,Pq.z];})(),
 'The cloud bank on the face':look(-2300,zr(-2300)-500,30,1500,zr(1500),300),
 'From afar':look(-2500,-2500,320,600,500,120),
};
const NEG={wet:[-600,bedH(-600)-1.2,zr(-600)],   /* 1.8 m under the stream's level (bedH + .6): HCHK.dry wants more than 1 m (it read exactly 1 m at -.4: the negative passed, 2026-11-08) */
 cliff:(function(){let bx=0,bz=0,bs=-1;for(let z=-2400;z<=2400;z+=12)for(let x=-2400;x<=2400;x+=12){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[0,0],[-600,zr(-600)+200],[1000,zr(1000)-400]]};
/* the station's own check: the stream leaves each bench over a fall (89w: WATER.fallsOf on its flow), each drawn */
const FALLS_CHK=n=>({name:'the stream falls at each scarp (WATER.fallsOf, drawn)',ok:n>=3,detail:n+' falls drawn (3 scarps on the page)'});
STAGE.checks=[()=>FALLS_CHK((window._water||{}).falls||0)];
STAGE.negatives=[()=>Object.assign(FALLS_CHK(1),{name:'a stream with one fall'})];
