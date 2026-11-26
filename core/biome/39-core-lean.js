// ================================================================= CORE — lean toward the giant  [G data]
// Krator is tidally locked: the gas giant hangs fixed in each place's sky, and in the eastern lands what grows leans and
// fans toward it (biomes/ehighlands, where this began as EHIGH.GIANT; hyperjungle PLAN-LANDS.md section 11, H4: the e and
// se rims' cousins, the leaning ferns, the cloud avocado's one-sided epiphytes). A kit applies it at placement: the
// direction a stem grows, the yaw that turns a cushion's steep side to the giant. Plain arithmetic on arrays: no THREE.
//
//   BIO.GIANT          [x, z] the unit vector on the ground toward the giant (x east, z south). Default azimuth 66 (canon,
//                      EHIGH.GIANT's), BIO.GIANT_AZ (degrees from north), BIO.GIANT_YAW (the yaw that turns +x to it:
//                      qEuler(0, yaw, 0) maps +x to (cos yaw, 0, -sin yaw))
//   BIO.setGiant(az)   set the bearing (degrees from north, clockwise)
//   BIO.giantFromSky(dir)  set it from a sky's giant direction [x, y, z] (core/atmos: ATMOS.skyState(site,h,d).giantDir);
//                      returns the azimuth. The sky's giant is per site and swings a few degrees a day (libration): pass
//                      the mean direction, or an hour's
//   BIO.leanTo(dir, k, o)  dir [x,y,z] (unit; null: straight up) tilted k radians toward the giant (k < 0: away), unit.
//                      o: {jit (radians of scatter in the bearing), u (a [0,1) number for that scatter, from KRAND.unit of a
//                      hash of the plant's cell and index: never a draw), toward (another bearing: [x,z], or {az, alt})}. From up
//                      it is EHIGH.toward's arithmetic exactly, so ehighlands moves onto it without moving a plant.
//                      toward {az (degrees from north, clockwise), alt (degrees over the horizon)} (2026-11-02): the sun's mean
//                      daily bearing (the Hearths' stalks), a prevailing wind (az the way it blows TO: Outland Gate's flagged
//                      trees). With alt a stem turns toward that point of the sky and stops on it: k never carries it past (alt
//                      90 is the zenith: a stem stays up, a bent one straightens). Without alt, the same as [x,z]
//   BIO.leanQ(k, o)    the quaternion [x,y,z,w] that turns +y into leanTo(null, k, o)
//   BIO.leanOf(dir, toward)  the signed angle (radians) dir leans toward the giant: + toward, - away (a probe's check)
//   BIO.bearingYaw(toward)   the yaw that turns +x to a bearing (any form of toward; none: the giant's, BIO.GIANT_YAW)
(function(root){
  'use strict';
  var BIO=root.BIO,D=Math.PI/180;if(!BIO)return;
  function vec(t){return t.az==null?t:[Math.sin(t.az*D),-Math.cos(t.az*D)];}
  function bearing(o){var g=o&&o.toward?vec(o.toward):BIO.GIANT,az=Math.atan2(g[1],g[0]);
    if(o&&o.jit){var j=o.jit,u=o.u==null?.5:o.u;az+=-j+(j-(-j))*u;}return az;}
  // the turn toward a point of the sky: along the great circle from dir to it, stopping on it (away: k < 0, not stopped)
  function skyward(dir,k,az,alt){var c=Math.cos(alt*D),T=[Math.cos(az)*c,Math.sin(alt*D),Math.sin(az)*c],v=dir||[0,1,0];
    var d=v[0]*T[0]+v[1]*T[1]+v[2]*T[2],a=Math.acos(d>1?1:d<-1?-1:d),s=Math.sin(a);if(s<1e-9)return[v[0],v[1],v[2]];
    var t=k>a?a:k,p=Math.sin(a-t)/s,q=Math.sin(t)/s,r=[v[0]*p+T[0]*q,v[1]*p+T[1]*q,v[2]*p+T[2]*q],l=Math.hypot(r[0],r[1],r[2])||1;return[r[0]/l,r[1]/l,r[2]/l];}
  function capped(k,o){var t=o&&o.toward;if(!t||t.alt==null)return k;var m=(90-t.alt)*D;return k>m?m:k;}
  BIO.setGiant=function(azDeg){var a=azDeg*D;BIO.GIANT=[Math.sin(a),-Math.cos(a)];BIO.GIANT_AZ=azDeg;
    BIO.GIANT_YAW=Math.atan2(-BIO.GIANT[1],BIO.GIANT[0]);return BIO.GIANT;};
  BIO.giantFromSky=function(dir){var az=Math.atan2(dir[0],-dir[2])/D;az=(az%360+360)%360;BIO.setGiant(az);return az;};
  BIO.leanTo=function(dir,k,o){var az=bearing(o);if(o&&o.toward&&o.toward.alt!=null)return skyward(dir,k,az,o.toward.alt);
    if(!dir){var s=Math.sin(k);return[Math.cos(az)*s,Math.cos(k),Math.sin(az)*s];}
    // Rodrigues about the ground axis square to the bearing, a = up x b, which turns up toward b
    var bx=Math.cos(az),bz=Math.sin(az),ax=bz,az2=-bx,c=Math.cos(k),s2=Math.sin(k);
    var x=dir[0],y=dir[1],z=dir[2],cx=-az2*y,cy=az2*x-ax*z,cz=ax*y,d=ax*x+az2*z;   /* a x v, a . v (a's y is 0) */
    var r=[x*c+cx*s2+ax*d*(1-c),y*c+cy*s2,z*c+cz*s2+az2*d*(1-c)],l=Math.hypot(r[0],r[1],r[2])||1;
    return[r[0]/l,r[1]/l,r[2]/l];};
  BIO.leanQ=function(k,o){k=capped(k,o);var az=bearing(o),h=Math.sin(k/2);return[Math.sin(az)*h,0,-Math.cos(az)*h,Math.cos(k/2)];};
  BIO.leanOf=function(dir,toward){var g=toward?vec(toward):BIO.GIANT,h=dir[0]*g[0]+dir[2]*g[1];return Math.atan2(h,dir[1]);};
  BIO.bearingYaw=function(toward){var g=toward?vec(toward):BIO.GIANT;return Math.atan2(-g[1],g[0]);};
  BIO.setGiant(BIO.GIANT_AZ==null?66:BIO.GIANT_AZ);
})(typeof window!=='undefined'?window:globalThis);
