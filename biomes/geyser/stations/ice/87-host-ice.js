// ================================================================= HOST — the ice field's own (station 5): ice towers and ice caves (core/terrain KGLACIER's drawer)
// ICE TOWERS: fumaroles that vent through the ice freeze their own steam into hollow chimneys, a ring of them on the ice round the hollow (KRAND by
// index: nothing hangs on draw order), each a fumarole's gas hazard. ICE CAVES: three steam-melted caves in the ice cliff, their mouths toward the hollow,
// lit blue from within. Steam rises from the towers' tops and the caves' mouths. Placed before the one bake (88: STATION_BUILD).
function STATION_BUILD(){const U=(i,s)=>KRAND.unit(KRAND.hash(7510,i,s)),out={towers:[],caves:[]},C3=h=>new THREE.Color(h),ICEC=[0xd8e8f4,0xc4dcee,0xb0d0ea,0xe4eef6];
 const ICEMAP=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('geyser','st.ice');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
 const MAT=BIO.solidMat(ICEMAP),GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:_onLight,camera,renderer,map:ICEMAP});
 GD.defTower(MAT,'Ice towers (fumaroles frozen round their steam)');
 const G=typeof KHAZ!=='undefined'&&KHAZ.GROUND;
 for(let i=0;i<60&&out.towers.length<16;i++){const a=U(i,1)*TAU,r=ICE_R*(1.06+.4*U(i,2)),x=ICE_C[0]+Math.cos(a)*r,z=ICE_C[1]+Math.sin(a)*r*.8;
  if(meltK(x,z)>.2||out.towers.some(t=>Math.hypot(t.x-x,t.z-z)<t.r+8))continue;const h=4+10*U(i,3),rt=1.6+1.8*U(i,4),y=terrainH(x,z);
  REGISTER({name:'An ice tower (a fumarole frozen round its steam)',x,z,y:y-1,r:rt+1,h:h+2,tags:{hazard:G?G.gasVent(rt+3,{danger:.6}):{kind:'gas',danger:.6}}});
  BIO.put('icetower',[x,y-.4,z],BIO.fn.qEuler((U(i,5)-.5)*.12,U(i,6)*TAU,(U(i,7)-.5)*.12),[rt,h,rt],C3(ICEC[i%ICEC.length]).multiplyScalar(.95+.1*U(i,8)));out.towers.push({x,z,r:rt,h});}
 for(let k=0;k<3;k++){const a=-1.6+k*2.1+(U(100+k,1)-.5)*.5;let x=0,z=0;for(let r=ICE_R*.7;r<ICE_R*1.6;r+=2){x=ICE_C[0]+Math.cos(a)*r;z=ICE_C[1]+Math.sin(a)*r*.8;if(meltK(x,z)<.25)break;}
  x+=Math.cos(a)*6;z+=Math.sin(a)*6;const R=12+8*U(100+k,2),face=Math.atan2(ICE_C[1]-z,ICE_C[0]-x);
  const C={x,z,R,H:R*(.7+.15*U(100+k,3)),face,mouth:.32+.1*U(100+k,4),floor:terrainH(x-Math.cos(a)*R*.6,z-Math.sin(a)*R*.6),name:'An ice cave (steam-melted; warm inside)',reg:{cave:k}};
  GD.cave(C);out.caves.push(C);}
 GD.steam(out.towers.map(t=>({x:t.x,z:t.z,y:terrainH(t.x,t.z)+t.h,n:10,size:3,rise:18,rate:.06})).concat(out.caves.map(c=>({x:c.x+Math.cos(c.face)*c.R,z:c.z+Math.sin(c.face)*c.R,y:c.floor+c.H*.5,n:8,size:4,rise:14,rate:.05}))));
 window._ice=out;return out;}
