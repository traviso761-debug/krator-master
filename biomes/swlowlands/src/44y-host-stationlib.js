// ================================================================= HOST — what the stations share (PLAN-STATIONS.md; the final rebuild, 2026-11-02). Defines functions only: the page itself never calls them
// A station (stations/<name>/44z-host-*.js) is the same axis, sea, river line and kit on its own ground: it hands 45-host-stage.js STATION_STAGE. The heights are the page's (the water at y=0 at the coast);
// the model's real ones are in PLAN-STATIONS.md. The walls show KSTRATA's beds: S.terrace eases the ground to a bench at each bed, so the ledges a plant can root on ARE the beds the eye sees, and the talus at a
// wall's foot and the gravel bars are fields the placement reads (ChatGPT's second checklist line).
function stationStrata(seed,mat){if(typeof KSTRATA==='undefined'||!BIO.strata||new URLSearchParams(location.search).get('strata')==='0')return null;
 const S=BIO.strata({recipe:'canyon',seed,range:[-80,900],dip:[.6,-.8,.008],warp:[6,1.8],res:.25,private:true}),SAND=new THREE.Color(0xb5643a).convertSRGBToLinear(),SL='vec3('+[SAND.r,SAND.g,SAND.b].map(v=>v.toFixed(4)).join(',')+')';
 stationStrata.hook=m=>{const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);S.inject(sh);
   sh.fragmentShader=sh.fragmentShader.replace('/*KGROUND*/','/*KGROUND*/\n{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+SL+',vec3(0.45),vec3(1.7)),0.6*vGM.x);}');};};
 return S;}
// the sea's shelf, 45's own lines: a station's ground ends at the same shore
function stationSea(x,z,h,drop){const si=seaIn(x,z);if(si<30){const bed=-.4-1.6*BIO.fn.smooth(0,-160,si)-(drop==null?9:drop)*BIO.fn.smooth(-160,-700,si);h=BIO.fn.mix(h,Math.min(bed,-.25),BIO.fn.smooth(30,-12,si));}return h;}
// boulders on a field: KRAND cells, the kit's boulder item, on the drawn ground. `k(x,z)` 0..1
function stationBoulders(k,o){const cell=o.cell==null?26:o.cell,R=TERR.R-150,N=Math.ceil(R/cell),range=o.range==null?900:o.range;let n=0;const r0=BIO.range,c0=BIO.cur;BIO.cur='lowlands/floor';BIO.range=range;BIO.minRange=0;
 const pv=BIO.kit('swlowlands');
 try{for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(o.seed,i,j,0x71),u=q=>KRAND.unit(KRAND.hash(h,q,0,0x72)),x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.hypot(x,z)>R||u(3)>k(x,z)*(o.dens==null?.7:o.dens))continue;
   const r=(o.r==null?1.2:o.r)*(.6+1.6*u(4)*u(4)),y=drawnH(x,z);BIO.put('boulder',[x,y+r*.2,z],new THREE.Quaternion().setFromEuler(new THREE.Euler(u(5),u(6)*6.28,u(7))),[r*(.9+.5*u(8)),r*.7,r],o.tint==null?0xa08a78:o.tint,{label:o.label||'Fallen rock'});n++;}}
 finally{BIO.kit(pv);BIO.range=r0;BIO.cur=c0;}return n;}
