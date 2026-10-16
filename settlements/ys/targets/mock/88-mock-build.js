// ================================================================= YS MOCK — the stage: the drowned towers, the houses, the growth
// Runs from the scene's build hook, after the terrain and before the bake. Skyscraper A stands sunk 36 m: its first
// floor plate (the kit's local 72) at +36.35, the slab at the body's foot at +30.5 and the cornice collar at +31; its
// struts rise out of the sea at r≈76 to their heads at +31. Skyscraper B stands south-west of it sunk 25 m, its plates
// at 12+5k, its twelve legs standing in 7 m of water. Both on small podiums, 160 m apart. The three houses stand on
// the sandbar to the west. Pods are grown onto A at L1 (the cone, +12) and at its first plate (the way in, north) and
// onto B at its plate at +37.25 (the way in, in a lobe trough facing A); a backbone bridge joins the two way-in
// landings, sends runners to A's strut heads and branches to a perch on one of them; a spiral stair joins A's L1
// landing to a wet landing on the water with a skiff tied up. The tideline dresses both.
reseed(31970);
const MOCK_A={x:140,z:20,sink:-36,cut:120,podium:64};const MOCK_B={x:140,z:-140,sink:-25,cut:80,podium:52};
const YS_BUILD=[];
YS_BUILD.push(function(scene){
 // ---- host A: the Conocylinder. Its face at world y: the podium, the base cone (local 5..64) then the body.
 const rA=y=>{const yl=y-MOCK_A.sink;if(yl<5)return MOCK_A.podium;if(yl<64)return 22-4*(yl-5)/64;const t=clamp((yl-64)/(420-64),0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);};
 const A_L1=12,A_L2=36.35;   // L1 on the cone (no plate there: pods only); L2 is the first plate
 const A=ysPlaceHost(scene,{key:'skyA',builder:buildSkyA,x:MOCK_A.x,z:MOCK_A.z,y:MOCK_A.sink,d:1,cutY:MOCK_A.cut,podium:MOCK_A.podium,cap:{hw:66},rAt:rA,name:'The Conocylinder stump',
  floors:{y0:64,pitch:8,top:.35,first:2.5},ways:[{a:-Math.PI/2,y:A_L2,R:4.6}],ring:1});
 // ---- host B: the Scallop Stack, lobed: rAt takes the bearing (a crest is 1.3 x the trough); the core at the waterline
 const lobeB=a=>a==null?1.28:1+.3*(.5+.5*Math.cos(12*a));
 const rB=(y,a)=>{const yl=y-MOCK_B.sink;if(yl<32)return 16.5;return (26+10*Math.pow(clamp((yl-32)/300,0,1),1.4))*lobeB(a);};
 const B_L2=37.25,B_A=5*Math.PI/12;   // the plate nearest A's, in a lobe trough on the side facing A
 const B=ysPlaceHost(scene,{key:'skyB',builder:buildSkyB,x:MOCK_B.x,z:MOCK_B.z,y:MOCK_B.sink,d:1,cutY:MOCK_B.cut,podium:MOCK_B.podium,cap:{hw:56},rAt:rB,name:'The Scallop stump',
  floors:{y0:37,pitch:5,top:.25},ways:[{a:B_A,y:B_L2,R:4.0}],ring:2});
 reseed(31971);
 hykTideline(A);hykTideline(B);
 // ---- growth on A: a middle pod at L1 facing the houses (west), the rich way-in pod at the first plate (north), a poor one at L1 east
 const gA=hykAccrete(A,[{y:A_L1+4.2*.447,a:Math.PI,R:4.2,wealth:'middle',level:'L1'},{a:-Math.PI/2,R:4.6,wealth:'rich',level:'L2',into:true},{y:A_L1+3.1*.447+1,a:.35,R:3.1,wealth:'poor',level:'L1'}]);
 const gB=hykAccrete(B,[{a:B_A,R:4.0,wealth:'middle',level:'L2',into:true}]);
 // ---- the backbone bridge between the two way-in landings: runners to A's strut heads, a branch to a perch on head 17
 const la=gA[1].pad,lb=gB[0].pad;const dx=lb.x-la.x,dz=lb.z-la.z;const dl=Math.hypot(dx,dz);
 const P0={x:la.x+dx/dl*la.r*.6,y:la.y,z:la.z+dz/dl*la.r*.6},P1={x:lb.x-dx/dl*lb.r*.6,y:lb.y,z:lb.z-dz/dl*lb.r*.6};
 // the perch cantilevers OUT from strut head 17 along the strut's radial axis (the head pokes 2.7 m out of the skin; a
 // 3.4 m pad on its top would stand mostly inside the wall), a little west so it clears the pod, on a rib from the head's
 // outer face
 const head=A.members.find(m=>m.n==='strut head 17');const hu=head.u,hw=head.w;
 const perch={x:head.c[0]+hu[0]*3.4-hw[0]*1.2,y:head.c[1]+head.he[1]+.3,z:head.c[2]+hu[2]*3.4-hw[2]*1.2};
 const hf=[head.c[0]+hu[0]*head.he[0],head.c[1]+2.2,head.c[2]+hu[2]*head.he[0]];   // the centre of the head's outer face, high
 hykPut('hkBone',hykRib(hf,[perch.x,perch.y-.42,perch.z],{rise:-.6,r0:.4,r1:.28,knuckles:2,col:hC(hPick(HPAL.bone))}));
 const tp=clamp(((perch.x-P0.x)*dx+(perch.z-P0.z)*dz)/(dl*dl),.16,.9);   /* leaves far enough along to clear the landing */const sp=[P0.x+dx*tp,P0.z+dz*tp];let ux=sp[0]-perch.x,uz=sp[1]-perch.z;const ul=Math.hypot(ux,uz)||1;ux/=ul;uz/=ul;
 const PR=3.4;const br=hykBridge(P0,P1,{w:2.6,rise:3,own:'bridge A-B',runners:{members:A.members.concat(B.members),reach:14,every:6},branches:[{t:tp,to:{x:perch.x+ux*(PR-.4),y:perch.y,z:perch.z+uz*(PR-.4)},w:1.6,own:'strut perch branch'}]});
 hykPad(perch.x,perch.y,perch.z,PR,{own:'strut perch',rail:{a0:Math.atan2(uz,ux),gap:2*Math.asin(Math.min(1,1.1/PR))+.1}});hykLight(perch.x-ux*1.6,perch.y+1.4,perch.z-uz*1.6,{r:.2,cool:true,bare:true,level:'L2'});
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
 window._mock={A:{x:A.x,z:A.z,cut:A.cutY,floors:A.floors.length,members:A.members.length},B:{x:B.x,z:B.z,cut:B.cutY,floors:B.floors.length},pods:gA.length+gB.length,
  landings:A.landings.length+B.landings.length,ways:A.ways.length+B.ways.length,runners:br.runners,branches:br.branches};
});
