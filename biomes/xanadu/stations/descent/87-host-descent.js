// ================================================================= HOST — STATION 4, THE DESCENT: the station's checks
// The flora is the kit's own (XANADU.zones on 45b's fields: the Vale's species on the lip, the chasm's in the cataract's spray, the crag's on the step's faces,
// the garrigue on the dry side ridges, the river's banks down to the floor). The floor's own competition (the Rift's natives against tall Xanadu forms) is the
// `floor` station's (the owner, 2026-11-03), so this station grows no neighbours.
// THE CATARACT (verify.py --assert reads hostChecks; each check with a broken input that must fail): one fall of the river over 200 m (the step's 265 m)
// whose foot (fallsOf's foot: [x, z, y]) lies in the plunge pool, and the pool's water over all of its carved bowl (the bowl's floor under the water's level
// at 64 points inside it); and the river reaches the floor's lake: its last water at the floor's level, its mouth past the floor's shore
function cataractCheck(falls,pool){const big=falls.filter(F=>F.drop>200);let foot=null,okFoot=false;
 if(big.length){const F=big[0];foot=F.foot?[F.foot[0],F.foot[1]]:null;okFoot=!!foot&&Math.hypot(foot[0]-pool.x,foot[1]-pool.z)<pool.r*1.3;}
 let dry=0;for(let k=0;k<64;k++){const a=k/64*Math.PI*2,r=pool.r*.85*((k%4)+1)/4,x=pool.x+Math.cos(a)*r,z=pool.z+Math.sin(a)*r;if(terrainH(x,z)>pool.y-.3)dry++;}
 return{ok:big.length===1&&okFoot&&dry===0,detail:'falls '+falls.map(F=>Math.round(F.drop)+' m').join(', ')+'; the cataract '+(big.length?Math.round(big[0].drop)+' m, its foot '+(foot?Math.round(Math.hypot(foot[0]-pool.x,foot[1]-pool.z))+' m from the pool\'s middle':'not found'):'MISSING')+'; the pool\'s bowl above its water at '+dry+' of 64 points'};}
function mouthCheck(lvl,mouth){const last=lvl[lvl.length-1],s=sOf(mouth[0],mouth[1]),past=s>seaShore(tOf(mouth[0],mouth[1]))-40;
 return{ok:Math.abs(last)<.5&&past,detail:'Ālph\'s last water at '+last.toFixed(2)+' m (the floor\'s lake at 0), its mouth '+(past?'on':'NOT on')+' the floor\'s shore; '+Math.round(lvl[0]-last)+' m from the Vale\'s lake'};}
function stationChecks(add){add('the cataract: one fall over 200 m into its plunge pool',cataractCheck(RIVER_FALLS,RIV.pool));add('Ālph reaches the floor\'s lake',mouthCheck(RIV.lvl,RIV.mouth));}
function stationNegatives(add){add('the cataract shortened to 150 m',cataractCheck(RIVER_FALLS.map(F=>Object.assign({},F,{drop:Math.min(F.drop,150)})),RIV.pool));
 add('the pool\'s water dropped under its bowl\'s floor',cataractCheck(RIVER_FALLS,Object.assign({},RIV.pool,{y:RIV.pool.y-30})));
 add('the river stopped 600 m short of the floor',mouthCheck(RIV.lvl.slice(0,RIV.lvl.length-50),RIV.P[RIV.P.length-51]));}
