// ================================================================= HOST — the site (station 3: the Yeti Valley)
// PLAN.md section 7, station 3, after the model's 4.22 (the trough lowered ~800 m, a sheltered-valley correction): irrigated fields
// of the Three Gifts and open larch round the frozen lake, meltwater channels, the capital's pycrete halls (kits/yeti, read in place
// when it is in the tree: station.json), fellfield with woolly snowballs and cushions on the slopes, goldroot on the crags, the
// glaciers and the airless rim standing over it.
// On the model at px 141.5,175.5 (region/far.py): the lake's north-west shore plain at 5,716 m, 0.78 atm, ET on the model's classes,
// a mean of -4 °C, ~95 mm; the lake's level 5,680 m, its water a kilometre or two south-east; the range across it to 7,300 m. The
// valley's annual swing is wide (PLAN.md section 1: warmest ~+11 °C, coldest ~-19 °C round the mean of -4: a sun trap in summer,
// a cold pool in winter): SITE.amp. So the floor holds open larch and fields, the tree line stands ~400 m up the walls, and the
// fellfield ~1,150 m up.
// THE SPUR: the station's near ground climbs a spur of the north-western range to ~1,250 m over the floor within 2.5 km (the
// model's own walls are steeper beyond its ~4 km cells), so its tundra, its fellfield, its crags and a rock glacier are walkable.
const SITE={
 name:'yeti',title:'The Yeti Valley',R:2600,step:12,seed:4731,warm:0,amp:{warm:14,cold:15},
 spur:{a:[-450,-250],b:[-2900,-1900],h:1250,w:1150},
 beds:{c:[-40,-150],len:220,wid:70,ang:.55},pockets:{c:[-420,-120],rad:160,n:22},
 tors:{n:12,seed:4741,ring:[700,2400],maxG:.45,accept:(x,z)=>siteSpurK(x,z)>.18},
 gifts:['sweetroot','snowpotato','goldroot'],landforms:['rockglacier'],aspectCheck:false,larch:.16,
 lakeIce:{spring:true},
 snow:{autumn:[1150,1550],spring:[-2000,-1900],summer:[1500,2300],frozen:true},
 spine:[[0,0],[-40,-150],[296,326],[-1300,-850],[-2000,-1300]],
 eye:30,
 views:V=>({
  'The lake through the open larch':V([200,120,8],[1400,1500,-30]),
  'The Three Gifts by the channel':V([60,-80,5],[-60,-160,0]),
  'Snow-potato pockets at the spur\'s foot':V([-330,-40,5],[-420,-120,0]),
  'Fellfield, woolly snowballs and cushions':V([-2050,-1250,2],[-2150,-1350,0]),
  'A rock glacier below the spur':V([-700,-80,40],[-1300,-650,0]),
  'The valley from the spur':V([-1700,-1100,25],[900,1100,-60]),
  'The Yeti Valley from above':V([-300,-2600,700],[400,600,0]),
  ...(typeof YETI_TOWN!=='undefined'&&YETI_TOWN.T?(()=>{const T=YETI_TOWN.T,S=YETI_TOWN.shore,dx=S[0]-T[0],dz=S[1]-T[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
   return {'Qoold Lheek, the capital by the lake':V([T[0]-ux*330+uz*120,T[1]-uz*330-ux*120,45],[T[0]+ux*60,T[1]+uz*60,0]),
    'Among the domes':V([T[0]-ux*70+uz*40,T[1]-uz*70-ux*40,2],[T[0],T[1],4])};})():{})})
};
// the spur's share at a point (0 off it .. 1 on its crest), and its height
function siteSpurK(x,z){const S=SITE.spur,dx=S.b[0]-S.a[0],dz=S.b[1]-S.a[1],L=Math.hypot(dx,dz),t=((x-S.a[0])*dx+(z-S.a[1])*dz)/(L*L),
 px=S.a[0]+dx*clamp(t,0,1),pz=S.a[1]+dz*clamp(t,0,1),d=Math.hypot(x-px,z-pz)/S.w,q=1-d*d;return q>0?q*q*smooth(-.05,.35,t):0;}
// THE RELIEF (metres over the model): the floor's low swells; the spur rising up its line, its crest ragged and its flanks cut by
// couloirs (ridged noise on core/rand), steepening toward the range
function siteRelief(x,z){const S=SITE.spur,dx=S.b[0]-S.a[0],dz=S.b[1]-S.a[1],L=Math.hypot(dx,dz),t=clamp(((x-S.a[0])*dx+(z-S.a[1])*dz)/(L*L),0,1.2);
 const k=siteSpurK(x,z),cr=1-Math.abs(2*KRAND.fbm(x*.0021+1.3,z*.0021-2.2,0,4,4732)-1);
 const floor=6*(KRAND.fbm(x*.0012+.5,z*.0012-.7,0,3,4733)-.5)*2+2*(KRAND.fbm(x*.006,z*.006,0,2,4734)-.5)*2;
 return floor+k*(S.h*Math.pow(Math.min(1,t),.85)+90*(cr-.5)*Math.min(1,t*2));}
// the meltwater channel: off the spur's foot, through the fields, to the lake (the fields are watered by snow and glacier melt in
// channels: PLAN.md section 1, "as Ladakh farms barley on ~100 mm")
const SITE_STREAM={name:'A meltwater channel (snow and glacier melt off the spur, led through the fields to the lake)',from:-520,to:1500,step:12,width:1.6,
 at:x=>[x,-460+.62*(x+900)+60*Math.sin(x*.004)]};
function siteFloor(x,z){return 0;}
// THE LANDFORMS (KFROST): a ROCK GLACIER down the spur's south-east flank from its cirque; SOLIFLUCTION LOBES on the spur's tundra
// slopes; ICE-WEDGE POLYGONS over the frozen floor (permafrost everywhere here: a mean of -4 °C); AUFEIS on the channel in spring
SITE.frost=c=>({
 rockGlaciers:[{id:'rockglacier.spur',a:[-1650,-1150],b:[-950,-420],w:150,h:28,ridge:24}],
 lobes:{cell:30,h:1.2,where:(x,z)=>{const k=siteSpurK(x,z);return k>.05&&k<.85?1:0;}},
 polygons:{cell:15,trough:.4,rim:.09,width:.17,where:(x,z)=>{const G=c.grade(x,z);return smooth(.06,.02,G.g)*smooth(-1.4,-2.4,c.meanAt(x,z));}},
 aufeis:c.stream.length?[{id:'aufeis.channel',pts:c.stream,w:22,thick:1.6,seg:[120,300],gap:[160,420],cover:{spring:.9,summer:0,autumn:0}[SEASON]}]:[],
 alases:[],pingos:[]});
