// ================================================================= THE AZURE DREAM — the summit's own building
// settlements/azure-dream/PLAN.md section 4e. The summit's other places are the Qiblai kit's (the Summit Chorten qb_chorten,
// the great wheel qb_great_wheel, the High Kora's sixteen qb_wheel_house, the pilgrims' shelter qb_hostel); this is the one it
// lacks. [G data] builder on the kit's contract (QB.def, seeds 34131-).
//   qb_ad_station_watch  the Station Watch: four monks keep the Station's passes and signal the monastery by lamp when it is
//                        due. A blue-dressed cube of two storeys round a small court, a stair tower at its south-east corner
//                        carrying a roof platform, and on it the signal lamp in a gilt cage (adLamp 'signal'), turned south
//                        toward the monastery 9 km down the Dream Road
function buildAdStationWatch(G,o){reseed(34131);const W=22,D=22,P=.7,hs=[3.2,3.0],wash=xC(xPick(XPAL.wash)),blue=xC(AD_BLUE),band=xC(AD_BAND),stone=xC(xPick(QSTONE)),
  g=xC(xPick(XPAL.gold)),red=xC(XPAL.red),dark=xC(0x3a2c22);
 vnReg('The Station Watch',0,0,13,P+16);
 qnPlinth(0,0,W+2,D+2,P,0,stone);
 // the range: three sides of a court open to the south, its rooms (the watch room, the four cells, the store of the passes)
 const Dr=6.4,range=(x,z,w,d,ry,ndoor)=>{const S1=qnStack(x,P,z,w,d,ry,[hs[0]],wash,'wash'),S2=qnStack(x,S1.y,z,S1.w,S1.d,ry,[hs[1]],blue,'wash');
  qnWins(x,P,z,w,d,ry,hs,S2.k,{pitch:2.6,ww:.6,wh:.9,kind:'glass',trim:blue,back:false});const top=qnRoof(x,S2.y,z,S2.w,S2.d,ry,blue,{band,parapet:.6});
  for(let i=0;i<ndoor;i++){const u=(i+.5)/ndoor*w-w/2,p=loc(x,z,u,d/2,ry);qnDoor(p[0],P,p[1],ry,1.1,2.1,{c:red,val:false,step:false});}return top;};
 const top=range(0,-D/2+Dr/2,W,Dr,0,2);for(const s of[-1,1])range(s*(W/2-Dr/2),Dr/2,Dr,D-Dr,-s*Math.PI/2,2);
 // the court's front wall and gate, the court paved
 for(const s of[-1,1])vB('xWashB',s*(W/4+1.5),P,D/2-.3,W/2-3,2.0,.5,0,wash);qnDoor(0,P,D/2-.05,0,2.4,2.4,{c:red,valC:blue,step:false});
 qnPave(0,1.5,W-2*Dr-.6,D-Dr-3,0,P);
 // the stair tower at the south-east corner: two storeys more, its roof the platform, a parapet round it
 const tx=W/2-3.2,tz=D/2-3.2,tw=6.4,S3=qnStack(tx,P,tz,tw,tw,0,[hs[0]+hs[1],3.4,3.2],blue,'wash');
 qnWins(tx,P,tz,tw,tw,0,[hs[0]+hs[1],3.4,3.2],S3.k,{pitch:3,ww:.6,wh:1,kind:'glass',trim:blue,back:true});
 const ptop=qnRoof(tx,S3.y,tz,S3.w,S3.d,0,blue,{band,parapet:1.0});
 // the signal lamp: a gilt cage on a stone drum, the lamp in it; the shutter leaves either side
 vB('vStone',tx,ptop,tz,1.6,.9,1.6,0,stone);
 for(const [a,b] of[[-1,-1],[-1,1],[1,-1],[1,1]])vPst('vPostB',tx+a*.6,ptop+.9,tz+b*.6,.06,1.5,g);
 vB('xGoldB',tx,ptop+2.4,tz,1.4,.12,1.4,0,g);kput('xDomeT',[tx,ptop+2.52,tz],null,[.75,.5,.75],g);vBall('xGold',tx,ptop+3.0,tz,.14,g);
 vB('adAzureB',tx,ptop+1.15,tz,.7,.9,.7,0);adLamp(tx,ptop+1.6,tz,'signal');
 for(const s of[-1,1])vB('vDarkB',tx+s*.75,ptop+1.0,tz+.55,.06,1.2,.5,0,dark);
 // a mast for the Station's flags on the back range, their line across the court to the tower's parapet; a wheel and deer
 // over the gate
 vPst('vPostB',-W/2+2,top,-D/2+2,.12,7,xC(0x5a4632));qnFlags([-W/2+2,top+6.8,-D/2+2],[tx-tw/2+.3,ptop+.9,tz-tw/2+.3]);
 qnWheelDeer(0,P+2.6,D/2+.05,0,.6,g);
 xnFolk(0,P,2,3,4);}
QB.def({key:'qb_ad_station_watch',name:'The Station Watch',family:'The Azure Dream — the summit',tags:QTAG('civic',['religious']),w:26,d:26,h:18,fw:24,fd:24,nv:1,build:buildAdStationWatch});
