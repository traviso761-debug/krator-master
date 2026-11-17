// ================================================================= HOST — after the atmosphere is bound (89a): the snow off the warm ground, the spray and the seeps' steam
// THE SNOW: snow that lies never lies on ground over 0 degC (KTHERM's snow mask), so the seeps stay bare. Before the bake (89z).
if(THERM&&ATMOS.snowBare){try{ATMOS.snowBare(THERM.snowMask({box:THERM_BOX,cell:8}));}catch(e){reportErr('snow bare: '+e.stack);}}
// THE SPRAY AND THE STEAM (core/atmos fx/smokegroups): the falls' mist over every riser over 25 m (the cataract's most), the seeps' breath on the middle bed
const SPRAY=(function(){const G={};
 (SITE.vents||[]).forEach((v,i)=>{const L0=[],n=v.reach>=100?5:3;for(let k=0;k<n;k++){const a=k/n*TAU+.4*i,r=k?Math.min(v.reach*.2,6+4*(k%3)):0,x=v.x+Math.cos(a)*r,z=v.z+Math.sin(a)*r;
  L0.push([x,terrainH(x,z)+.4,z,'steam']);}G['seep'+i]={emitters:L0,n:10,k:.6};});
 if(TREADS){const M=[];for(let i=0;i+1<SITE.chain.length;i++){const A=SITE.chain[i],B=SITE.chain[i+1];if(A.y-B.y<25)continue;const x=B.x0+4,z=axisZ(x),w=waterH(x,z);
   const n=A.y-B.y>90?4:2;for(let k=0;k<n;k++){const zz=z+(k-(n-1)/2)*12;M.push([x-k*5,(w>-1e8?w:terrainH(x,zz))+1.5,zz,'steam']);}}
  if(M.length)G.spray={emitters:M,n:SKEY==='riftmouth'?16:10,k:.55};}
 try{return Object.keys(G).length&&ATMOS.smokeGroups?ATMOS.smokeGroups(G):null;}catch(e){reportErr('spray: '+e.stack);return null;}})();
