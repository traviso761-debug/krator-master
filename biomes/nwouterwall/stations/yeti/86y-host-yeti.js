// ================================================================= HOST — the capital by the frozen lake (kits/yeti, read in place)
// PLAN.md section 7, station 3: "the capital's pycrete halls". The Yeti's buildings are the culture kit's (kits/yeti/PLAN.md), read
// in place through biomes/nwouterwall/yeti_bundle.py (KratorYeti: its engine and buildings in one closure). This lays out a piece of
// the capital (Qoold Lheek, "the cold lake": PLAN.md section 10, proposed) on the shore plain between the fields and the lake: the
// High Chief's hall and the council's in the middle, the clan compound and the family clusters round them, poorer domes further
// out, the stores and the raised caches toward the fields, the pycrete works and the ice quarry at the lake's edge, the byre and
// the corral on the grazing, a watch tower and a signal cairn on the spur's foot. Pycrete is permanent here (a mean of -4 °C:
// NWOW.pyc), so the shells are the kit's pycrete and stone. Every building stands on the ground at its site (o.y); the trees and
// the plants keep clear of it (OBSTACLES). Without kits/yeti in the tree (it is on its own branch until merged) nothing is drawn
// and the page's error panel stays clean: YETI_TOWN.missing says why.
const YETI_TOWN=(function(){const out={sites:[],group:null,missing:null};
 if(typeof KratorYeti==='undefined'){out.missing='kits/yeti is not in the tree (claude/yeti-kit): the capital\'s halls are not drawn';return out;}
 KratorYeti.setError(m=>reportErr(m));
 const D=KratorYeti.DEFS,S=KratorYeti.SEASONS,v=S&&S.indexOf?Math.max(0,S.indexOf(SEASON)):0;
 // the shore: march from the station's middle toward the lake's nearest water cell until the ground goes under the lake's level
 const W=MODEL_WATER.slice().sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];if(!W||!MODEL_LAKE){out.missing='no lake on the model here';return out;}
 const L=Math.hypot(W.x,W.z),ux=W.x/L,uz=W.z/L;let s=0;for(;s<L;s+=10)if(groundH(ux*s,uz*s)<MODEL_LAKE.level+.4)break;
 const shore=[ux*s,uz*s],T=[ux*(s-300),uz*(s-300)],vx=-uz,vz=ux;   /* T the middle of the town, 300 m back from the water; v along the shore */
 const at=(a,b)=>[T[0]+ux*a+vx*b,T[1]+uz*a+vz*b],face=Math.atan2(-ux,-uz);   /* a, b: metres toward the lake and along the shore; the fronts face inland */
 const add=(key,p,ry,o)=>{if(!D[key])return;out.sites.push({key,x:p[0],z:p[1],ry:ry==null?face:ry,o:Object.assign({y:terrainH(p[0],p[1]),v},o||{})});};
 add('yt_chief_hall',at(0,0));add('yt_quunsul_hall',at(-10,48));add('yt_clan_compound',at(30,-58));
 [[-60,-20],[-40,-95],[55,40],[-75,70],[20,105],[70,-110]].forEach(q=>add('yt_family_cluster',at(q[0],q[1])));
 [[-120,10],[-110,-60],[-95,120],[95,90]].forEach(q=>add('yt_composite_house',at(q[0],q[1])));
 [[-160,-30],[-150,60],[-170,140],[-140,-120],[120,150],[110,-170],[-60,175]].forEach(q=>add('yt_dome',at(q[0],q[1])));
 add('yt_stone_dome',at(-30,-150));add('yt_store_dome',at(-200,-80));add('yt_store_dome',at(-210,-40));
 add('yt_raised_cache',at(-235,20));add('yt_raised_cache',at(-240,60));add('yt_frostroot_house',at(-190,10));add('yt_goldroot_house',at(-185,95));
 add('yt_ice_cellar',at(150,-40));add('yt_pycrete_works',at(200,40));add('yt_tea_house',at(90,10));add('yt_kitchen_house',at(60,-30));
 add('yt_ice_quarry',[shore[0]+ux*20,shore[1]+uz*20],face,{y:MODEL_LAKE.level});
 add('yt_muskox_byre',at(-60,-230));add('yt_caribou_corral',at(-20,-290));add('yt_clan_tomb',at(-260,-170));
 add('yt_watch_tower',[-560,-330]);add('yt_signal_cairn',[-820,-560]);
 out.T=T;out.shore=shore;
 // the town's larch is felled (timber, and the sawdust of its pycrete: PLAN.md section 5): the kit's trees keep out of it (55)
 NWOW.clearings=[{x:T[0]+ux*60,z:T[1]+uz*60,r:340}];
 try{out.group=KratorYeti.build(out.sites);out.group.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.yeti=true;}});scene.add(out.group);}
 catch(e){reportErr('yeti: '+(e&&e.stack||e));return out;}
 KratorYeti.REG().filter(r=>!r.parent).forEach(r=>{OBSTACLES.push({x:r.x,z:r.z,r:r.r+3,y0:r.y-2,y1:r.y+r.h});
  REGISTER({name:r.name+' (the Khaayken: kits/yeti)',key:'yeti.'+r.key,x:r.x,z:r.z,y:r.y-1,r:Math.max(2,r.r),h:r.h+1});});
 /* the kit's buildings are merged meshes, so the probe's box centres miss most houses: one point a record at its middle (core/host's probePoints;
    the group sits at the origin, the records are world positions) */
 out.group.userData.probePoints=[].concat(...KratorYeti.REG().filter(r=>!r.parent).map(r=>[r.x,r.y+r.h/2,r.z]));
 return out;})();
_mark('yeti');
