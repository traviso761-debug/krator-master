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
//                      hash of the plant's cell and index: never a draw), toward ([x,z]: another bearing)}. From up it is
//                      EHIGH.toward's arithmetic exactly, so ehighlands moves onto it without moving a plant
//   BIO.leanQ(k, o)    the quaternion [x,y,z,w] that turns +y into leanTo(null, k, o)
//   BIO.leanOf(dir, toward)  the signed angle (radians) dir leans toward the giant: + toward, - away (a probe's check)
(function(root){
  'use strict';
  var BIO=root.BIO,D=Math.PI/180;if(!BIO)return;
  function bearing(o){var g=o&&o.toward?o.toward:BIO.GIANT,az=Math.atan2(g[1],g[0]);
    if(o&&o.jit){var j=o.jit,u=o.u==null?.5:o.u;az+=-j+(j-(-j))*u;}return az;}
  BIO.setGiant=function(azDeg){var a=azDeg*D;BIO.GIANT=[Math.sin(a),-Math.cos(a)];BIO.GIANT_AZ=azDeg;
    BIO.GIANT_YAW=Math.atan2(-BIO.GIANT[1],BIO.GIANT[0]);return BIO.GIANT;};
  BIO.giantFromSky=function(dir){var az=Math.atan2(dir[0],-dir[2])/D;az=(az%360+360)%360;BIO.setGiant(az);return az;};
  BIO.leanTo=function(dir,k,o){var az=bearing(o);
    if(!dir){var s=Math.sin(k);return[Math.cos(az)*s,Math.cos(k),Math.sin(az)*s];}
    // Rodrigues about the ground axis square to the bearing, a = up x b, which turns up toward b
    var bx=Math.cos(az),bz=Math.sin(az),ax=bz,az2=-bx,c=Math.cos(k),s2=Math.sin(k);
    var x=dir[0],y=dir[1],z=dir[2],cx=-az2*y,cy=az2*x-ax*z,cz=ax*y,d=ax*x+az2*z;   /* a x v, a . v (a's y is 0) */
    var r=[x*c+cx*s2+ax*d*(1-c),y*c+cy*s2,z*c+cz*s2+az2*d*(1-c)],l=Math.hypot(r[0],r[1],r[2])||1;
    return[r[0]/l,r[1]/l,r[2]/l];};
  BIO.leanQ=function(k,o){var az=bearing(o),h=Math.sin(k/2);return[Math.sin(az)*h,0,-Math.cos(az)*h,Math.cos(k/2)];};
  BIO.leanOf=function(dir,toward){var g=toward||BIO.GIANT,h=dir[0]*g[0]+dir[2]*g[1];return Math.atan2(h,dir[1]);};
  BIO.setGiant(BIO.GIANT_AZ==null?66:BIO.GIANT_AZ);
})(typeof window!=='undefined'?window:globalThis);
