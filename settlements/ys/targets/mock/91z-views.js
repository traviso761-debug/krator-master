// TARGET: mock — presets. [cx,cy,cz, tx,ty,tz, hour?, compass?, inside?]
const _mA=MOCK_A,_mB=MOCK_B;const _hy=2.6;
const _front=(hx,hz,d,up)=>[hx,_hy+1.7,hz+d,hx,_hy+(up||2.6),hz];
const _inside=(hx,hz)=>[hx+9,_hy+11,hz+10,hx,_hy+1.2,hz,null,null,true];
const VIEWS={
 'Mock — the drowned towers':[_mA.x+330,170,_mA.z+330,_mA.x,40,_mA.z-70],
 'Mock — from the water':[_mA.x-90,3,_mA.z+140,_mA.x,26,_mA.z],
 'Mock — the L1 pod and its landing':[_mA.x-46,17,_mA.z+26,_mA.x-22,13,_mA.z+1],   // between struts 9 and 10
 'Mock — on the bridge at L2':[_mA.x+.8,41,_mA.z-66,_mA.x+7,38,_mA.z-128],
 'Mock — the runners and the perch':[_mA.x-22,46,_mA.z-92,_mA.x,36,_mA.z-60],
 'Mock — the way in':[_mA.x,38.4,_mA.z-21,_mA.x,37.6,_mA.z-36],
 'Mock — the stair to the water':[_mA.x-70,7,_mA.z+50,_mA.x-20,5,_mA.z+18],
 'Mock — poor house':_front(-200,-10,20),
 'Mock — middle house':_front(-152,-8,24,3.2),
 'Mock — rich house':[-98+22,_hy+7.5,-12+26,-98,_hy+2.4,-12],
 'Mock — the three houses':[-150,22,60,-150,4,-10],
 'Mock — poor house inside':_inside(-200,-10),
 'Mock — middle house inside':_inside(-152,-8),
 'Mock — rich house inside':_inside(-98,-12),
 'Mock — night from the water':[_mA.x-90,3,_mA.z+140,_mA.x,26,_mA.z,22.2],
 'Mock — night at the houses':[-150,8,38,-150,4,-10,21.8],
};
