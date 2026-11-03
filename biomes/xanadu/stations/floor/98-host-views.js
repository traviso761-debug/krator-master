// ================================================================= HOST - the views of THE RIFT FLOOR (station 5; replaces src/98-host-views.js)
// [cx, cy, cz, tx, ty, tz]. Found from the land's records: the front's line (FLOORLAND.front 0), each flora's end, the shore, the cataract on the skyline.
const VIEWS={
 'Over the floor':[-2600,620,2900,600,40,-600],
 'The lake from the shore':[-600,20,-300,1800,6,-2600],
 'The cataract on the skyline':[-900,30,-1100,2200,260,1700],
 'From the lake':[1600,24,-2300,-600,30,900],
};
(function(){const G=(x,z)=>terrainH(x,z),up=(x,z,h)=>Math.max(G(x,z),.5)+h;
 /* a point on the front's line near (x, z): walk along the front's gradient to its zero */
 const onFront=(x,z)=>{for(let k=0;k<40;k++){const f=FLOORLAND.front(x,z),e=8,gx=(FLOORLAND.front(x+e,z)-FLOORLAND.front(x-e,z))/(2*e),gz=(FLOORLAND.front(x,z+e)-FLOORLAND.front(x,z-e))/(2*e),g2=gx*gx+gz*gz||1;x-=f*gx/g2*.8;z-=f*gz/g2*.8;}return[x,z];};
 const land=(x,z)=>FLOORLAND.sd(x,z)>80;
 const F=onFront(300,1100);if(land(F[0],F[1])){
  VIEWS['The front from above']=[F[0]-260,up(F[0]-260,F[1]+320,180),F[1]+320,F[0],G(F[0],F[1])+20,F[1]];
  VIEWS['The front, in the stands']=[F[0]+40,up(F[0]+40,F[1]+60,4),F[1]+60,F[0]-60,G(F[0]-60,F[1]-40)+22,F[1]-40];}
 /* each flora's end: a point well into its side, near the LOD spine so the heroes are drawn */
 const side=(sign)=>{let best=null;for(const p of FLOOR_SPINE){const k=FLOOR.valeK(p[0],p[1]);const s=sign>0?k:1-k;if(land(p[0],p[1])&&(!best||s>best.s))best={p,s};}return best?best.p:null;};
 const V=side(1),R=side(-1);
 if(V)VIEWS['The Vale\'s tall trees']=[V[0]+120,up(V[0]+120,V[1]+90,6),V[1]+90,V[0],G(V[0],V[1])+28,V[1]];
 if(R)VIEWS['The Rift\'s own']=[R[0]+110,up(R[0]+110,R[1]-90,6),R[1]-90,R[0],G(R[0],R[1])+16,R[1]];
 /* the mixed middle: a spine point nearest the front's zero */
 let M=null;for(const p of FLOOR_SPINE){const k=Math.abs(FLOOR.valeK(p[0],p[1])-.5);if(land(p[0],p[1])&&(!M||k<M.k))M={p,k};}
 if(M)VIEWS['The mixed middle']=[M.p[0]-90,up(M.p[0]-90,M.p[1]+70,3),M.p[1]+70,M.p[0]+40,G(M.p[0]+40,M.p[1]-40)+14,M.p[1]-40];
 /* the shore at the front: where the front's line meets the water */
 const S=onFront(-300,-300);VIEWS['The shore at the front']=[S[0]-80,up(S[0]-80,S[1]+60,5),S[1]+60,S[0]+120,2,S[1]-160];
 /* a creek bed through the stands */
 VIEWS['A creek bed']=[-1600,up(-1600,1700,5),1700,-900,G(-900,600)+10,600];
 ['Over the floor','The lake from the shore','The cataract on the skyline','From the lake'].forEach(k=>{const v=VIEWS[k];v[1]=Math.max(v[1],G(v[0],v[2])+(k==='Over the floor'?300:4));});
})();
