// ================================================================= HOST — the preset views
// Defined before the build so their cameras can be reserved: every camera
// position is an OBSTACLE (88) the flora grows round, or a dragon tree on the
// rim stands where the camera does. Every view is derived from the layout it
// shows (a view typed as numbers rots when the layout moves).
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const PC=id=>polyCentre(PLACES.find(p=>p.id===id).poly);
const SWmid=SWB.pts[Math.floor(SWB.pts.length*.55)];
const GD=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));
const VIEWS={
 'The basin from the lip':look(LIPX-40,zU(LIPX-40)+34,22,30,0,4),
 'The falls and the pool':[POOL.x+34,POOL.y+10,POOL.z+26,LIPX,POOL.y+22,0],
 'The carved face':look(PC('petra')[0]+12,PC('petra')[1]-44,10,PC('petra')[0],PC('petra')[1]+6,6),
 'The shrine wall':look(PC('shrine')[0]+75,PC('shrine')[1]+22,9,BASIN.x0,PC('shrine')[1],20),
 'The switchback':look((SWB.x0+SWB.x1)/2+20,-20,30,(SWB.x0+SWB.x1)/2,SWB.zEdge-SWB.W*.55,0),
 'On the switchback':[SWmid[0]+2,SWmid[2]+1.7,SWmid[1],10,14,10],
 'The canyon mouth':look(60,6,22,170,zC(170),6),
 'Down the slot canyon':look(170,zC(170),10,330,zC(330),4),
 'The oasis floor':look(-45,-6,6,40,4,3),
 'The market and the Khan':look(-5,-10,9,PC('khan')[0],PC('khan')[1],1),
 'From the gatehouse':look(PC('switchback_gate')[0],PC('switchback_gate')[1],26,10,10,0),
 'The hall in the carved face':[-30,TERR.FLOOR+9,30,-30,TERR.FLOOR+17,BASIN.z1],
 'The shrine by the falls':[-58,TERR.FLOOR+7,-14,BASIN.x0,TERR.FLOOR+12,-33],
 'The pueblo quarter':look(60,0,16,84,40,2),
 'The Khan gate':look(22,4,4,30,22,5),
 'The market':look(-28,-8,4,-12,-32,1.5),
 'The tent grounds':look(36,-12,6,74,-44,1),
 'The north cliff dwellings':look(-30,-40,6,-30,BASIN.z0,9),
 'The south cliff dwellings':look(50,40,8,50,BASIN.z1,9),
 'The gatehouse tower':look(10,-150,8,36,-168,8),
 'The upper stream':look(LIPX-130,zU(LIPX-130)+26,16,LIPX-10,zU(LIPX-10),-2),
 'Over the basin':look(-10,-260,190,15,0,0),
 'From afar':look(-460,420,210,10,0,10),
 'Krator rising':[20,gh(20,40,3),40,20+GD.x*1000,gh(20,40,3)+GD.y*1000,40+GD.z*1000],
};
// the reserved camera spots (88 pushes them into OBSTACLES before the biome runs)
const VIEW_CLEAR=Object.keys(VIEWS).map(k=>({x:VIEWS[k][0],z:VIEWS[k][2],r:16,y0:-1e9,y1:1e9,view:k}));
