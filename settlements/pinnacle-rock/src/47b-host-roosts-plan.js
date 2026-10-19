// ================================================================= HOST — the roost plan, made before the kits build
// PRR (43-pr-roosts.js) on this page's rock, here rather than with its drawing (89) so its ways (the Stair's path down the
// debris slope, the lift road) are cleared before anything grows or falls on them: PR.addWay takes each, and PR.forest,
// the necanyons kit's mask (88), the talus blocks (87) and PR.zoneAt keep off it.
const ROOST=(function(){try{const t0=performance.now(),P=PRR.plan({rock:ROCK,K:KSTACKS,PR,ground:groundH,footD:(x,z)=>NECANYONS.footD(x,z),talusW:TALUS.w,wallStep:{big:LAND.wallStep||6,small:2.5}});   /* the walls as 47 draws them */
 P.ms=Math.round(performance.now()-t0);P.ways.forEach(W=>PR.addWay(W));return P;}
 catch(e){reportErr('roosts: '+e.stack);return {decks:[],roosts:[],shelters:[],climbs:[],bridges:[],lifts:[],stair:null,roads:[],ways:[],why:{}};}})();
// a way's mask for the plants and the blocks: nothing within 3 m of its edge
const wayClear=(x,z,m)=>{const wa=PR.wayAt(x,z,(m==null?3:m)+2);return !wa||wa.d>(m==null?3:m);};

// THE ROAD'S BENCH IN THE GROUND: the lift road is laid out at its grade (PRR), so where it runs across the debris slope the
// slope is cut down (or built up) to the road's height across its line, blending back to the slope 12 m beyond its edges;
// the debris slope's height (LAND.talus, 45) takes it from here on (the plants, the blocks, terrainH), and the floor mesh,
// built before the plan, is re-seated there
const ROAD_BENCH=(function(){const R=(ROOST.roads||[])[0];if(!R)return null;const P=R.pts,hw=R.w/2,BL=12,C=[];
 for(let i=0;i+1<P.length;i+=16){const seg=P.slice(i,Math.min(P.length,i+17));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;seg.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);});C.push({seg,x0,x1,z0,z1});}
 // the nearest point of the road's line: its distance and the road's height there
 function at(x,z){let best=null;const m=hw+BL+2;for(const c of C){if(x<c.x0-m||x>c.x1+m||z<c.z0-m||z>c.z1+m)continue;
   for(let k=1;k<c.seg.length;k++){const a=c.seg[k-1],b=c.seg[k],dx=b[0]-a[0],dz=b[2]-a[2],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L2)),d=Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t);
    if(!best||d<best.d)best={d,y:a[1]+(b[1]-a[1])*t};}}
  return best;}
 const h0=TALUS.h;
 TALUS.h=(x,z,fd)=>{const t=h0(x,z,fd),b=at(x,z);if(!b||b.d>hw+BL)return t;const k=smooth(hw+BL,hw+1.5,b.d);return t+(b.y-floorH(x,z)-t)*k;};
 // the floor mesh re-seated round the road
 let n=0;scene.traverse(o=>{if(!o.isMesh||o.userData.inspectLabel!=='The canyon floor')return;const p=o.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),b=at(x,z);if(b&&b.d<hw+BL+12){p.setY(i,groundH(x,z));n++;}}
  p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();});
 return {at,hw,blend:BL,vertices:n};})();
_mark('roostplan');
