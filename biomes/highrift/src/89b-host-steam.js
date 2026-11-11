// ================================================================= HOST — after the atmosphere is bound (89a): the snow off the hot ground, the steam, the Hearths' engine
// THE SNOW: snow that lies never lies on ground over 0 degC (KTHERM's snow mask: ATMOS.snowBare), so the vents' discs stay bare. Before the bake (89z).
if(ATMOS.snowBare){try{ATMOS.snowBare(THERM.snowMask({box:THERM_BOX,cell:8}));}catch(e){reportErr('snow bare: '+e.stack);}}
// THE STEAM (core/atmos fx/smokegroups): a ring of mouths round each vent, the Caldron's and the patch's breath over the water, the cataract's spray mist
const STEAM=(function(){const G={};
 SITE.vents.forEach((v,i)=>{const L0=[],n=v.reach>=300?9:v.reach>=150?6:3;for(let k=0;k<n;k++){const a=k/n*TAU+.4*i,r=k?Math.min(v.reach*.25,8+5*(k%3)):0,x=v.x+Math.cos(a)*r,z=v.z+Math.sin(a)*r,w=waterH(x,z);
  L0.push([x,Math.max(terrainH(x,z),w>-1e8?w:-1e9)+.4,z,'steam']);}G['v'+i]={emitters:L0,n:v.reach>=300?22:14,k:.7};});
 if(SKEY==='cataract'){const C=L.C,M=[];for(let k=0;k<6;k++){const s=C.L*(.28+.17*k*.8),x=C.A[0]+C.ux*s,z=C.A[1]+C.uz*s;M.push([x,terrainH(x,z)+2,z,'steam']);}G.spray={emitters:M,n:12,k:.5};}
 try{return ATMOS.smokeGroups?ATMOS.smokeGroups(G):null;}catch(e){reportErr('steam: '+e.stack);return null;}})();
// THE HEARTHS' ENGINE (HEARTH.work): the fans open flat by night and in an eclipse, fold into silver spindles by day; cloud closes them
const WORK={value:0};
if(typeof HEARTH!=='undefined')tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 WORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:SITE.atm});
 BIO.breathState('hearths').value=WORK.value;});
