// ================================================================= HOST - the views of the high ranges (station 3; replaces src/98-host-views.js)
// [cx, cy, cz, tx, ty, tz]; heights from the ground under each point, so they follow the land
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),A=RAN.AMPH,T=RAN.TARN,v=(name,cx,cz,up,tx,tz,tup)=>{VIEWS[name]=[cx,G(cx,cz)+up,cz,tx,G(tx,tz)+tup,tz];};
 /* the treeline: where the ground crosses TREELINE on a north-south line at x */
 const tl=x=>{for(let z=TERR.Z0;z<TERR.Z1;z+=20)if(G(x,z)>TREELINE)return z;return 0;};
 VIEWS['Over the ranges']=[0,G(0,TERR.Z0)+1500,TERR.Z0-1200,0,G(0,600)+200,600];
 VIEWS['The chasm head']=[A.x-30,G(A.x-30,A.z-A.r*1.25)+25,A.z-A.r*1.25,A.x+10,A.floor+190,A.z+A.r*.9];
 VIEWS['The chasm head falls, from the pool']=[A.x-60,A.pool+6,A.z-A.r*.45,A.x+5,A.floor+150,A.z+A.r*.95];
 VIEWS['The conduit spring']=[A.x-A.r*1.15,G(A.x-A.r*1.15,A.z+30)+15,A.z+30,A.x+A.r*.86,A.floor+80,A.z+40];
 {const P=RAN.P,i=RAN.P.findIndex((p,k)=>RAN.S[k]>RAN.sA+450),q=P[Math.min(P.length-1,i+18)];if(i>0)VIEWS['Down the chasm']=[P[i][0],RAN.bed[i]+14,P[i][1],q[0],RAN.bed[Math.min(P.length-1,i+18)]+4,q[1]];}
 v('The agate pines (the Vale side)',-2350,-2850,6,-2000,-2500,10);
 v('The mist spruce (the boreal side)',2250,-2700,5,1900,-2300,12);
 {const z=tl(-1200);v('The treeline',-1200,z-260,4,-1150,z+180,6);}
 {const z=tl(1300)+120;v('Krummholz and the fell-field',1300,z-60,2.2,1250,z+200,1);}
 v('Cushions on the fell-field',-500,600,1.6,-470,640,.2);
 VIEWS['The cirque tarn']=[T.x-T.r*1.6,RAN.TARNL+18,T.z-T.r*1.6,T.x+T.r*.4,RAN.TARNL+30,T.z+T.r*.8];
 v('The glacier',-100,1700,12,0,2900,60);
 /* the vents' plumes, bearing 35 and 71 degrees, over the north-eastern ranges, from high on the shoulder */
 {const x=1300,z=2000,sx=.7986,cz=.6018;VIEWS['The vents\' plumes']=[x,G(x,z)+20,z,x+sx*4000,G(x,z)+520,z-cz*4000];}   /* toward az 53 (sin, cos of it) */
 /* a dwarf willow: the first of the ET band's near the tarn */
 {const s=window._station;VIEWS['Dwarf frost willows']=[T.x+T.r*1.5,RAN.TARNL+2.2,T.z+T.r*.2,T.x+T.r*1.2,RAN.TARNL+.2,T.z+T.r*.8];}
})();
