// ================================================================= HOST — STATION 3: THE OUTFALL on core/water (after 89w: the lake and the pool)
// The upper lake's one outlet (PLAN.md section 2, "The lip"): placid above, loud below.
//   THE NOTCH'S CHANNEL  the lake's water running across the lip to the rim (a WATER.flow along 44w's NOTCH from the lake's shore, 1,150 m, to the
//                        lip, 1,148.6 m), quickening toward the edge
//   THE FALL             over the Black Step (44w: FALLS; 45 made the record, fitted to its foot and following the face): ~900 m, a curtain that
//                        spreads and whitens as it drops, its spray at the plunge
//   THE RIVER            out of the pool, south-west across the floor (44w: RIVER_SPEC, KRELIEF.river's line: its surface never climbs downstream)
// 89w's skylight and lin() are reused; the drawn meshes carry the outfall's names for the inspector.
const OUTFALL=(function(){try{
 const S=STATION,lipY=S.LV-1.4,out={};
 out.notch=WATER.flow({name:'The notch\'s channel (the lake running to the Lip)',pts:[[720,40,S.LV-.02],[200,10,S.LV-.2],[-400,-10,S.LV-.5],[-850,-4,S.LV-.9],[-1058,0,lipY]],width:[44,40,40,40,40],speed:[.3,.6,1.2,2.4,4]});
 out.notchDraw=WATER.drawFlow(out.notch,{rapids:[.15,.35],shallow:lin(0x5a8c84),deep:lin(0x234a50),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.5,step:6,across:4,margin:1.2,renderOrder:2});
 out.fallDraw=FALL_RECS.map((F,i)=>{const d=WATER.drawFall(F,{color:lin(0xe2ecea),opacity:.9,rowStep:6,cols:14,spray:'drop',plungeR:S.POOL.r*.9,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
  [d.mesh,d.plunge].forEach(m=>{if(m){m.userData.inspectLabel=FALLS[i].name;m.userData.probeSkip=true;}});return d;});
 out.riverDraw=RIVER?WATER.drawFlow(RIVER,{rapids:[.12,.3],shallow:lin(0x6a8c80),deep:lin(0x2e4c4a),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.35,step:8,across:4,margin:1.6,renderOrder:2}):null;
 [out.notchDraw,out.riverDraw].forEach((d,k)=>{if(d&&d.mesh){d.mesh.userData.inspectLabel=k?RIVER_SPEC.name:out.notch.name;d.mesh.userData.probeSkip=true;}});
 window._outfall={fall:FALL_RECS.map(F=>Math.round(F.drop)+' m'),notch:!!out.notchDraw,river:!!out.riverDraw};
 return out;}catch(e){reportErr('the outfall: '+(e&&e.stack||e));return null;}})();
