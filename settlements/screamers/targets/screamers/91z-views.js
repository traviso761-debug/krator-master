// This file loads AFTER 90-scene.js, so SCREAM is already populated and a
// preset can be aimed at something the builders actually placed rather than at
// a coordinate I guessed. Anything rejection-sampled -- the smithies, the
// ranch, the pen -- is looked up; the fixed geometry is written out.
const _S=(typeof SCREAM!=='undefined'&&SCREAM)?SCREAM:{};
// camera that stands off `d` metres from a point on bearing `b`, at height `h`
const AT=(p,b,d,h,ty)=>[p[0]+Math.cos(b)*d,h,p[2]+Math.sin(b)*d,p[0],ty==null?p[1]+8:ty,p[2]];
const _sm=(_S.smithies&&_S.smithies[0])||[300,12,300];
const _rn=_S.ranch||[-300,12,300,70];
const _pn=_S.pen?[_S.pen.x,_S.pen.y,_S.pen.z]:[-40,12,-330];
const _lb=_S.lobby||[0,12,-240];
const _gt=(_S.gates&&_S.gates[0])||[540,12,310];
const HALL=[-60,644,374], PALACE=[-63,620,626], PLZ=[-60,630,374];
// the salvage homes (71a-apoc-homes.js): SCREAM.homes carries each one's front door [x,y,z,yaw]; yaw 0 faces +z
const _hm=_S.homes||[];
const _home=k=>_hm.find(h=>h.key===k)||_hm[0]||{x:0,y:12,z:0,ry:0,door:null};
const _hd=h=>h.door||[h.x,h.y,h.z,h.ry];
const FRONT=(h,d,ht)=>{const D=_hd(h);return[D[0]+Math.sin(D[3])*d,h.y+ht,D[2]+Math.cos(D[3])*d,D[0],h.y+2,D[2]];};
// just inside the front door, looking across the room toward the plot's centre and beyond
const INSIDE=h=>{const D=_hd(h),ix=-Math.sin(D[3]),iz=-Math.cos(D[3]);
 return[D[0]+ix*1.3,D[1]+1.6,D[2]+iz*1.3,D[0]+ix*9,D[1]+1.0,D[2]+iz*9];};
const VIEWS={
 // --- the settlement -------------------------------------------------------
 'Hexahedron':[-300,620,-2600,180,470,240],
 'The village':[-1500,260,-1500,0,90,0],
 'Ground level':[-619,26,-760,0,60,0],
 'Main street':[-260,30,-470,120,40,120],
 'Plan from above':[60,2500,-950,180,480,240],
 // --- the life layer, aimed at what was actually placed --------------------
 'Arrival':AT(_gt,0.7,220,58,_gt[1]+6),
 'The gate':AT(_gt,0.5,95,26,_gt[1]+8),
 "The captives' pen":AT(_pn,-1.9,150,44,_pn[1]+10),
 'The ranch':AT(_rn,2.3,190,52,_rn[1]+8),
 'A smithy':AT(_sm,1.1,115,44,_sm[1]+8),   // 70 m at 22 m put the eye inside the roof
 'The lobby door':AT(_lb,-1.9,150,40,_lb[1]+14),
 'The lift':[260,180,-520,8,260,-262],
 'Harvest':[-480,44,120,-140,24,300],
 'Salvage homes':FRONT(_home('lg-bulkhead'),46,22),
 'A salvage home':FRONT(_home('dw-silo'),12,1.7),
 'Inside a salvage home':INSIDE(_home('lg-bulkhead')),
 'Inside the twin silo hall':INSIDE(_home('lg-twinsilo')),
 // --- the arcology ---------------------------------------------------------
 'The waist':[950,700,-1400,180,620,240],
 'The shear':[-266,470,640,-110,400,215],
 'The plaza':[-880,820,790,PLZ[0],PLZ[1],PLZ[2]],
 'The residence':[-430,690,520,HALL[0],HALL[1],HALL[2]],
 'Inside the residence':[-60,650,404,-60,646,374],
 "The chief's palace":[-440,700,900,PALACE[0],PALACE[1],PALACE[2]],
 // --- the sky and the country ---------------------------------------------
 'Krator rising':[-900,300,900,1900,900,-2100],
 'Volcano':[900,430,-2300,-900,560,2400],
 'The hyperjungle':[-1300,90,-1300,-300,120,-300],
 'From the forest':[1450,50,1150,200,300,300],
};
