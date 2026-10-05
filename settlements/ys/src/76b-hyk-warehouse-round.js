// ================================================================= HYKKOUSOI — the round warehouse (seeds 30990–30994)
// Travis (Oct 5 2026): a large roundish warehouse at the centre of each harbour mole. A lobed shell drum, 32 m across and
// 9.5 m high, its roof a low dome, three lipped cart doors round it and six open vents high up; inside one store room,
// the floor a shell disc, the store spots in a ring and a tally bench at the middle.
function hykIndWarehouseRound(G,o){reseed(30990+(o.v|0));const col=hC(hPick(HPAL.shell)),colIn=hC(hPick(HPAL.shellWarm),.9),bone=hC(hPick(HPAL.bone));const R=16,H=9.5;
 const L={H,cx:0,cz:0,yBase:-.3,rFn:y=>R*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,y-H*.45)/(H*.58),2.4)))+.1,nu:72,nv:22,lobes:{n:9,amp:.05},rings:{n:4,amp:.02},col};
 const DOORS=[Math.PI/2,Math.PI/2+TAU/3,Math.PI/2-TAU/3];const ops=[];
 for(const th of DOORS){const d=hykLatheAt(L,th,2.2);ops.push({p:d.p,n:d.n,r:1.7,ky:1.15,kind:'cart'});}
 for(let k=0;k<6;k++){const th=k/6*TAU+.5;const v=hykLatheAt(L,th,6.5);ops.push({p:v.p,n:v.n,r:.55,kind:'window'});}
 hykPut('hkShell',hykLathe(Object.assign({},L,{ops})));hykPut('hkIn',hykLathe(Object.assign({},L,{ops,flip:true,rFn:y=>L.rFn(y)*.96,col:colIn})),true);
 for(const op of ops){if(op.kind==='cart')hykDoor(op,{level:'ground',depth:.8,name:'cart door'});else hykWin(op,{open:true});}
 hykPut('hkFloor',hykDisc(0,.05,0,R*.95,{col:colIn}),true);
 kput('hkBall',[0,H+.2,0],null,[1.4,1.0,1.4],bone);
 for(let i=0;i<36;i++){const a=rr(0,TAU),r=.08+rng()*.14;kput('hkBarnB',[Math.cos(a)*(R+.1),rr(.05,.9),Math.sin(a)*(R+.1)],null,[r,r*.7,r],hC(hPick(HPAL.barnacle)));}
 const room=hykRoom('store',hykCirclePoly(0,0,R*.9,16),.05,H*.85,{doors:ops.filter(p=>p.kind==='cart').map(p=>[p.p[0],p.p[2],p.r*2]),wealth:.5});
 for(let k=0;k<12;k++){const a=k/12*TAU+.26;if(DOORS.some(d=>Math.abs(Math.atan2(Math.sin(a-d),Math.cos(a-d)))<.42))continue;hykSpot(room,'store',10.2*Math.cos(a),10.2*Math.sin(a),Math.PI/2-a,1.2,.7);}
 hykSpot(room,'work',0,0,0,1.4,.8);
 hykReg('Round warehouse',0,0,R+1,H+1.5);}
HYK.def({key:'hyk_warehouse_round',name:'Round warehouse',family:'industry',row:'Industry',w:34,d:34,h:10.5,inside:true,tags:{type:['industry'],wealth:'middle',lit:false},build:hykIndWarehouseRound});
