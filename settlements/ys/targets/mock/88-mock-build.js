// ================================================================= YS MOCK — the stage: the drowned towers, the houses, the growth
// Runs from the scene's build hook, after the terrain and before the bake. Skyscraper A stands sunk ten metres and cut
// at its fifteenth storey; Skyscraper B stands north of it, cut lower. The three houses stand on the sandbar to the
// west. Pods are grown onto A at L1 (+12) and L2 (+28) and onto B at L2; a rib bridge joins the two L2 landings; a
// spiral stair joins A's L1 landing to a wet landing on the water with a skiff tied up. The tideline dresses both.
reseed(30200);
const MOCK_A={x:140,z:20,sink:-10,cut:120};const MOCK_B={x:140,z:-168,sink:-10,cut:104};
const YS_BUILD=[];
YS_BUILD.push(function(scene){
 // ---- host A: the Conocylinder. Its face at world y: the base cone (local 5..64 above the plinth) then the body.
 const rA=y=>{const yl=y-MOCK_A.sink;if(yl<5)return 110;if(yl<64)return 22-4*(yl-5)/64*1.0;const t=clamp((yl-64)/(420-64),0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);};
 const A=ysPlaceHost(scene,{key:'skyA',builder:buildSkyA,x:MOCK_A.x,z:MOCK_A.z,y:MOCK_A.sink,d:1,cutY:MOCK_A.cut,cap:{hw:112},rAt:rA,name:'The Conocylinder stump',floors:{y0:64,pitch:8},ring:1});
 // ---- host B: the Scallop Stack, lobed: its radius at the pod's bearing is a lobe crest
 const rB=y=>{const yl=y-MOCK_B.sink;if(yl<32)return 82;return (26+10*Math.pow(clamp((yl-32)/300,0,1),1.4))*1.28;};
 const B=ysPlaceHost(scene,{key:'skyB',builder:buildSkyB,x:MOCK_B.x,z:MOCK_B.z,y:MOCK_B.sink,d:1,cutY:MOCK_B.cut,cap:{hw:84},rAt:rB,name:'The Scallop stump',floors:{y0:32,pitch:8},ring:2});
 reseed(30210);
 hykTideline(A);hykTideline(B);
 // ---- growth on A: a middle pod at L1 facing the houses (west), a rich pod at L2 facing B (north), a poor one at L1 east
 const gA=hykAccrete(A,[{y:12,a:Math.PI,R:4.2,wealth:'middle',level:'L1'},{y:28,a:-Math.PI/2,R:4.6,wealth:'rich',level:'L2'},{y:13,a:.35,R:3.1,wealth:'poor',level:'L1'}]);
 const gB=hykAccrete(B,[{y:28,a:Math.PI/2,R:4.0,wealth:'middle',level:'L2'}]);
 // ---- the rib bridge at L2 between A's north landing and B's south landing
 const la=gA[1].pad,lb=gB[0].pad;hykBridge({x:la.x,y:la.y,z:la.z-la.r*.6},{x:lb.x,y:lb.y,z:lb.z+lb.r*.6},{w:2.6,own:'bridge A-B'});
 // ---- the spiral stair from A's L1 west landing down the face to a wet landing, and a skiff
 const l1=gA[0].pad;const st=hykStairSpiral(A.x,A.z,rA,l1.y-.1,1.1,{a0:Math.PI+.42,dir:1,w:1.1});
 const wr=rA(1)+.1+1.1+3.2;const wx=A.x+wr*Math.cos(st.a1),wz=A.z+wr*Math.sin(st.a1);
 const wet=hykPad(wx,1.05,wz,3.4,{stalk:true,own:'A wet landing'});hykPut('hkBone',hykTube([[A.x+(rA(1)+.1+1.1)*Math.cos(st.a1),.95,A.z+(rA(1)+.1+1.1)*Math.sin(st.a1)],[wx-1.2*Math.cos(st.a1),1.0,wz-1.2*Math.sin(st.a1)]],()=>.5,{seg:8,col:hC(hPick(HPAL.bone))}));
 ysMark({bld:null,key:'skyA',name:A.n,kind:'wetdoor',x:wx+2.4*Math.cos(st.a1),y:1.05,z:wz+2.4*Math.sin(st.a1),nx:Math.cos(st.a1),nz:Math.sin(st.a1),w:2.4,h:2.4,level:'wet'});
 WET_DOORS.push({host:A.n,x:wx,z:wz});BERTHS.push({host:A.n,x:wx+4.5*Math.cos(st.a1),z:wz+4.5*Math.sin(st.a1),heading:st.a1+Math.PI/2,kind:'skiff'});
 portSkiff(wx+4.6*Math.cos(st.a1+.6),wz+4.6*Math.sin(st.a1+.6),st.a1+.9,null,0);
 hykLight(wx+1.2,1.05+1.3,wz,{r:.2,cool:true,bare:true,level:'wet'});
 // ---- the three houses on the sandbar, facing south (+z) toward the camera presets
 TSTAT.cur='mock_poor_barnacle/0';HYK.place(scene,'mock_poor_barnacle',-200,-10,0,{y:2.6});
 TSTAT.cur='mock_mid_pod/0';HYK.place(scene,'mock_mid_pod',-152,-8,0,{y:2.6});
 TSTAT.cur='mock_rich_conch/0';HYK.place(scene,'mock_rich_conch',-98,-12,0,{y:2.6});TSTAT.cur=null;
 window._mock={A:{x:A.x,z:A.z,cut:A.cutY,floors:A.floors.length},B:{x:B.x,z:B.z,cut:B.cutY},pods:gA.length+gB.length,landings:A.landings.length+B.landings.length};
});
