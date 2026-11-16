// ================================================================= HOST — STATION 2, the great river's gorge (PLAN-STATIONS.md; the final rebuild, 2026-11-02)
// klir Rivrh (r000; 5,744 m3/s) on scale model 5.1 between the Lake of Shim (the outlet's head, px 642,1121, 5.1's canvas) and the coast: at px 676,1077 the walls stand 750-900 m over the river within 4 km, 1,300 m
// at 16 km; at px 692,1043 they fall away toward the Ring Sea. The page compresses the reach into its 6 km as the kit's ideal type does: the walls rise from the gorge's mouth on the coast (s -1650) to 620 m at s 250,
// over a broad green river 110 m wide, rapids at each hard bed, and benches of riparian forest; oak and cork on the rims (rain 1,250 mm, Cfa to Csa). Shim's build reads this ground: `window._gorgeSite`.
// The springs on the benches are the gorge's own clear water; one meets the river in one surface (WATER.confluence). Not built: a tall fall off the rim (the ground mesh cannot hold a vertical face).
const STATION_FOG={falloff:1/620,sun:.35,sky:.35,mist:{density:.0016,y:0,depth:26,noise:.7}};
const STATION_STAGE=(function(){const {smooth,mix,clamp,fbm}=BIO.fn,S=stationStrata(8131);
 const Y=s=>Math.max(0,.0085*(s+1400))+[-850,-120,640,1500,2400].reduce((a,c)=>a+3.2*smooth(c-26,c+26,s),0)*smooth(-1500,-1200,s);   /* the surface: never climbing downstream, a rapid at each hard bed */
 const W=s=>mix(70,56,smooth(-1500,1500,s)),WALL=(x,z,s)=>620*smooth(-1650,250,s)*(.9+.2*fbm(s*.0009,3.1,811,2)),F=s=>170+120*fbm(s*.0013,7.7,812,2);
 const qOf=(x,z,s,d)=>clamp((d-F(s)-40*(fbm(x*.004,z*.004,813,2)-.5))/560,0,1);
 const prof=q=>.2*smooth(0,.26,q)+.42*smooth(.32,.6,q)+.38*smooth(.68,.94,q);
 function h(x,z){const s=sOf(x,z),t=tOf(x,z),d=Math.abs(t-RIVER_T(s)),w=W(s),y=Y(s),q=qOf(x,z,s,d);
  let g=y+5+24*smooth(w,F(s),d)+(1-smooth(0,.1,q))*5*(fbm(x*.006,z*.006,814,2)-.5)*2+WALL(x,z,s)*prof(q)+q*q*70*(fbm(x*.0016,z*.0016,815,3)-.5);
  if(S&&q>.02&&q<.98)g=S.terrace(x,z,g,.6);
  g=mix(g,y-3.6,smooth(w*1.35,w*.72,d));
  return stationSea(x,z,g,14);}
 const over=(x,z)=>h(x,z)-Y(sOf(x,z));
 const talus=(x,z)=>{const s=sOf(x,z),q=qOf(x,z,s,Math.abs(tOf(x,z)-RIVER_T(s)));return smooth(0,.06,q)*smooth(.2,.1,q)*smooth(-1400,-900,s);};
 return{groundTri:true,terrainH:h,riverY:Y,riverW:W,riverFrom:-1460,rapids:[.02,.09],riverLook:[0x3f8f78,0x12463e],feetOwed:123,springs:[[-160,1,190],[880,-1,210]],strata:S,
  fields:{tropic:(x,z)=>.55*smooth(-700,-1700,sOf(x,z)),dry:(x,z)=>.85*smooth(80,320,over(x,z)),wet:(x,z)=>mix(.84,.5,smooth(60,320,over(x,z))),upland:(x,z)=>clamp((over(x,z)-60)/320,0,1)},
  mask:(x,z)=>{const s=sOf(x,z),d=Math.abs(tOf(x,z)-RIVER_T(s));if(d<W(s)*1.25)return 0;const e=5,sl=Math.hypot(h(x+e,z)-h(x-e,z),h(x,z+e)-h(x,z-e))/(2*e);return sl>.62?0:1;},
  rock:(x,z,sl)=>Math.max(smooth(.55,1,sl),.5*smooth(.05,.3,qOf(x,z,sOf(x,z),Math.abs(tOf(x,z)-RIVER_T(sOf(x,z)))))*smooth(.6,.4,1-sl)),
  split:(x,z)=>{const s=sOf(x,z),d=Math.abs(tOf(x,z)-RIVER_T(s)),w=W(s);return d<w*1.9;},
  build:()=>({talus:stationBoulders(talus,{seed:8132,dens:.8,r:1.6,tint:0xb08068,label:'Talus under the walls'})}),
  region:{name:'The great gorge (klir Rivrh)',x:0,z:0,r:3000,h:900},
  site:()=>{window._gorgeSite={river:'r000',px:[676,1077],wall:620,note:'the ground Shim\'s build reads (settlements/shim/PLAN.md): RIVER_T, Y, W'};},
  views:()=>{const v=(s0,t0,h0,s1,t1,h1)=>{const a=xzOf(s0,RIVER_T(s0)+t0),b=xzOf(s1,RIVER_T(s1)+t1);return[a[0],h(a[0],a[1])+h0,a[1],b[0],h(b[0],b[1])+h1,b[1]];};
   return{'The gorge from the rim':v(600,760,46,-300,0,10),'On the river':v(900,0,16,300,0,14),'A rapid':v(-60,14,10,-200,0,2),'The riparian bench':v(300,150,3,520,120,10),'The walls':v(250,120,4,300,640,120),
    'The gorge mouth':v(-1950,0,90,-900,0,30),'The bench spring':v(-260,250,6,-160,190,2),'Oak on the rim':v(1500,800,3,1800,900,8),'The whole gorge':v(-2400,-1400,500,1000,0,100)};}};})();
const STATION_FAR={h:(x,z)=>STATION_STAGE.terrainH(x,z),label:'The gorge country past the map'};
