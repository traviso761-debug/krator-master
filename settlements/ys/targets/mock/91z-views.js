// TARGET: mock — presets. [cx,cy,cz, tx,ty,tz, hour?, compass?, inside?]
const _mA=MOCK_A,_mB=MOCK_B;const _hy=2.6;
const _front=(hx,hz,d,up)=>[hx,_hy+1.7,hz+d,hx,_hy+(up||2.6),hz];
const _inside=(hx,hz)=>[hx+9,_hy+11,hz+10,hx,_hy+1.2,hz,null,null,true];
const VIEWS={
 'Mock — the drowned towers':[_mA.x+330,170,_mA.z+330,_mA.x,40,_mA.z-70],
 'Mock — from the water':[_mA.x-90,3,_mA.z+140,_mA.x,26,_mA.z],
 'Mock — the L1 pod and its landing':[_mA.x-62,16,_mA.z+26,_mA.x-24,13,_mA.z+2],
 'Mock — on the bridge, L2':[_mA.x+1.5,30.8,_mA.z-62,_mB.x,31,_mB.z+30],
 'Mock — the stair to the water':[_mA.x-70,7,_mA.z+50,_mA.x-20,5,_mA.z+18],
 'Mock — poor house':_front(-200,-10,20),
 'Mock — middle house':_front(-152,-8,24,3.2),
 'Mock — rich house':_front(-98,-12,30,3.8),
 'Mock — the three houses':[-150,22,60,-150,4,-10],
 'Mock — poor house, inside':_inside(-200,-10),
 'Mock — middle house, inside':_inside(-152,-8),
 'Mock — rich house, inside':_inside(-98,-12),
 'Mock — night from the water':[_mA.x-90,3,_mA.z+140,_mA.x,26,_mA.z,22.2],
 'Mock — night, the houses':[-150,8,38,-150,4,-10,21.8],
};
