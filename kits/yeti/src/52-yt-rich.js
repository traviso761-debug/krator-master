// prefix: yt
// ================================================================= THE RICH (PLAN.md section 6): the clan compound
// yt_clan_compound: the clan's household. A stone hall dome (the stone heart grown: corbelled slab under moss and turf,
// the mass heater stoked from its chamber off the entry, flues under the suspended platform), and round its front floor a
// ring of pycrete domes (two sleeping domes and a cold store) through short arched passages; serge at the door, where the
// caribou are tied. Inside, the first riches (the catalog culture file and the war loot come in Y5): appliqué hangings
// over the platform, an Amur band, a fur-mosaic rug, a beadwork panel on the platform's face, a serge column by the hearth.
const YT_CLAN_SATS=[['yt_sleep_dome',YT_SLEEP,.24],['yt_sleep_dome',YT_SLEEP,PI-.24],['yt_store_dome',YT_STORE,PI-.95]];
const [YT_CLAN,YT_CLAN_C]=ytDwellPair({Rr:3.2*YT_S,Ho:4.6,kind:'stone',pass:3.0,zPlat:-.45}).map(D=>ytClusterPlan(D,YT_CLAN_SATS));
/* the riches inside the hall, in its frame (centre at the origin) */
function ytClanRiches(D){const yP=D.yPlat+.07,cw=-PI/2,win=-PI/2+.5;
 /* the hangings behind the platform, either side of the chimney and clear of the ice lens */
 ytHanging('applique',D.Ri,D.Hi,yP+.35,yP+2.25,PI+.38,TAU+cw-.32);
 ytHanging('applique',D.Ri,D.Hi,yP+.35,yP+2.25,TAU+win+.3,TAU-.38);
 ytHanging('amur',D.Ri,D.Hi,yP+2.4,yP+2.9,PI+.38,TAU+cw-.32,.1);
 /* the platform's face: a beadwork panel; the front floor: a fur-mosaic rug; by the hearth: a serge column */
 const zf=D.zPlat-.05+.09;box('bead',0,D.yFl+.28,zf,2.6,.5,.02,P('ice'));
 ytRug('mosaic',0,D.yFl,D.zPlat+1.25,3.2,1.9,0);
 W(0,D.yFl,0,0,()=>ytSerge(-1.9,D.zPlat+.55,2.4));
 /* the household's goods, a cut above the common (catalog pieces until the khaayken file) */
 FURNISH('generic_strongbox',1.9,yP,-1.9,-.6);FURNISH('generic_spirits',-.9,yP,-.9,.2);FURNISH('generic_tea_set',.6,yP,-.8,0);}
defBuilding({key:'yt_clan_compound',name:"Clan compound (the rich household)",seed:9131,w:YT_CLAN.w,d:YT_CLAN.d,h:YT_CLAN.D.h,cut:true,budget:280000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'rich',role:'clan'},mouth:YT_CLAN_C.D.cz+YT_CLAN_C.D.z1,
 note:'a stone hall with its mass heater and a ring of pycrete domes; serge at the door; hangings, a fur-mosaic rug and beadwork inside',
 holes:o=>o.covered?ytClusterHoles(YT_CLAN_C,true):ytClusterHoles(YT_CLAN,false),
 build(o){const C=o.covered?YT_CLAN_C:YT_CLAN,D=C.D;ytClusterBuild(C,o);
  W(0,0,D.cz,0,()=>{ytClanRiches(D);for(const s of [-1,1])ytSerge(s*2.7,D.Ro+2.7,2.7);});
  CURREC.riches=['applique','amur','mosaic','bead','serge'];}});
