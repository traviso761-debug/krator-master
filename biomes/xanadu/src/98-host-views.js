// ================================================================= HOST - the views of the Vale (a station's 98 replaces this fragment with its own VIEWS)
const VIEWS={
 'Over the Vale':[260,520,-3000,-80,60,700],
 'The pleasure dome':[-760,150,-640,-1000,110,-380],
 'The sacred river':[520,40,-160,300,20,300],
 'The vale':[-120,90,-40,-300,50,700],
 'The river bend':[40,120,1300,-200,80,1620],
 'The chasm':[-560,190,2080,-900,150,2040],
 'The fountain':[-1100,240,1840,-1350,190,2010],
 'The green flank':[-1700,160,-420,-2300,120,-100],
 'The garden ridge':[-800,260,1150,-1150,200,900],
 'The eastern plateau':[1300,300,500,1800,230,1000],
 'The island':[420,40,-1480,160,20,-1680],
 'The lake shore':[-300,14,-620,100,6,-760],
 'The river mouth':[760,20,-280,620,6,-420],
 'From the mountains':[-900,900,2900,0,100,0],
 'Krator rising':[-900,30,-600,1890,1300,-610],
};
// views found in the built scene: along the river, at a fairy ring, down a hornbeam alley, at the lotus trumpets and the redwoods in the water
(function(){const G=(x,z)=>terrainH(x,z);
 const riv=(f)=>{const i=Math.round(f*(RIV.P.length-1)),p=RIV.P[i],q=RIV.P[Math.max(0,i-8)];return{p,q,y:RIV.bed[i]+.65};};
 {const a=riv(.27),b=riv(.2);VIEWS['The chasm']=[a.p[0],a.y+9,a.p[1],b.p[0],b.y+14,b.p[1]];}
 {const a=riv(.05);VIEWS['The fountain']=[a.p[0],a.y+22,a.p[1],RIV.P[0][0],RIV.bed[0]+34,RIV.P[0][1]];}
 {const a=riv(.78),b=riv(.9),dx=b.p[0]-a.p[0],dz=b.p[1]-a.p[1],l=Math.hypot(dx,dz);VIEWS['The sacred river']=[a.p[0]-dx/l*40,a.y+16,a.p[1]-dz/l*40,b.p[0],b.y+4,b.p[1]];}
 const near=(list,f)=>{let best=null,bd=1e9;list.forEach(o=>{if(f&&!f(o))return;const d=BIO.lodD(o.x,o.z);if(d<bd){bd=d;best=o;}});return best;};
 const R=near(XANADU.RINGS);if(R){const a=.7,cx=R.x+Math.cos(a)*R.r*2.6,cz=R.z+Math.sin(a)*R.r*2.6;VIEWS['A fairy ring']=[cx,G(cx,cz)+7,cz,R.x,G(R.x,R.z)+3,R.z];}
 const A=near(XANADU.ARCHES);if(A){const ux=Math.cos(A.a),uz=Math.sin(A.a),L=(A.n/2+.6)*9.5,cx=A.x-ux*L,cz=A.z-uz*L;VIEWS['The hornbeam arches']=[cx,G(cx,cz)+2.2,cz,A.x+ux*L,G(A.x+ux*L,A.z+uz*L)+11,A.z+uz*L];}
 // a specimen view: the most open-standing hero of the species, from the side whose sightline no other crown crosses
 const HT=new Map();XANADU.TREES.forEach(T=>{const k=Math.floor(T.x/50)+','+Math.floor(T.z/50);(HT.get(k)||HT.set(k,[]).get(k)).push(T);});
 const around=(x,z,r)=>{const o=[];for(let i=Math.floor((x-r)/50);i<=Math.floor((x+r)/50);i++)for(let j=Math.floor((z-r)/50);j<=Math.floor((z+r)/50);j++){const L=HT.get(i+','+j);if(L)L.forEach(T=>{if(Math.hypot(T.x-x,T.z-z)<r)o.push(T);});}return o;};
 const blockedLine=(T,cx,cz,me)=>{for(const O of around((T.x+cx)/2,(T.z+cz)/2,Math.hypot(T.x-cx,T.z-cz)/2+12)){if(O===me)continue;const dx=cx-T.x,dz=cz-T.z,l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((O.x-T.x)*dx+(O.z-T.z)*dz)/l2));if(Math.hypot(T.x+dx*t-O.x,T.z+dz*t-O.z)<(O.crownR||3)*.8+1)return true;}return false;};
 const specimen=(k,dist,h)=>{const C=XANADU.TREES.filter(T=>T.sp===k&&T.lv===2&&BIO.clearOf(T.x,T.z,25));let best=null;
  C.slice(0,400).forEach(T=>{const crowd=around(T.x,T.z,dist+10).length;if(best&&crowd>=best.crowd)return;
   for(let q=0;q<16;q++){const a=q/16*TAU,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(G(cx,cz)<.5||blockedLine(T,cx,cz,T))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,Math.max(G(best.cx,best.cz),0)+h,best.cz,T.x,T.y0+T.H*.5,T.z];};
 [[2,'The lotus trumpets',34,7],[9,'Wisteria',26,3],[3,'A cloud pine',22,5],[4,'Cushion trees',26,4],[6,'The agate tree',34,4],[20,"Traveller's palm",22,4],[10,'Persian ironwood',28,5],[18,'Haze blossom',24,4],[31,'Flame cypress',30,6],[32,'Strawberry tree',16,3],[1,'A ginkgo',30,5],[16,'A bottle palm',14,3],[33,'A breaker crown',26,5],[34,'Braided cloud trees',28,5],[35,'Hive lilies',6,1.4]].forEach(v=>{const r=specimen(v[0],v[2],v[3]);if(r)VIEWS[v[1]]=r;});
 {const T=near(XANADU.TREES,T=>T.sp===0&&T.lv===2&&BIO.field('wet',T.x,T.z)>.84);if(T){const r=specimen(0,60,4);if(r)VIEWS['Dawn redwoods']=[r[0],r[1],r[2],T.x,T.y0+T.H*.45,T.z];}}
 {const Gv=XANADU.GROVE;if(Gv&&Gv.oak){let bA=0,bH=1e9;for(let q=0;q<24;q++){const a=q/24*TAU,h=G(Gv.oak[0]+Math.cos(a)*80,Gv.oak[1]+Math.sin(a)*80);if(h<bH){bH=h;bA=a;}}   /* from the lake side: the water below the grove */
  const cx=Gv.oak[0]+Math.cos(bA)*80,cz=Gv.oak[1]+Math.sin(bA)*80;VIEWS['The enchanted grove']=[cx,Math.max(G(cx,cz),0)+7,cz,Gv.oak[0],G(Gv.oak[0],Gv.oak[1])+9,Gv.oak[1]];}}
 {const x=-1000,z=-400,a=.9,cx=x+Math.cos(a)*95,cz=z+Math.sin(a)*95;VIEWS['The pleasure dome']=[cx,G(cx,cz)+26,cz,x,(DOME.y0||G(x,z))+9,z];}
 ['The vale','The lake shore','The garden ridge','The green flank'].forEach(k=>{const v=VIEWS[k];if(v)v[1]=Math.max(v[1],G(v[0],v[2])+(k==='The lake shore'?24:40));});
})();
