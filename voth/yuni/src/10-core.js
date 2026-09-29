/* ============================== 1. CORE ==============================
   YUNI. Units are METRES. x runs east, z runs SOUTH (north is -z), y up.
   A person is 1.75 tall. The origin is the centre of the walled circle.
   CLOCK CONVENTION (the brief's): the butte is at 6 o'clock = due south.
   clock h  ->  angle a = (h*30 - 90) deg, direction (cos a, sin a) in (x,z):
   12 = north (-z), 3 = east (+x), 6 = south (+z), 9 = west (-x).           */
var TARGET = (typeof window!=='undefined' && window.YUNI_TARGET) || 'world';
/* 'world' | 'sheet' (buildings) | 'furn' (interior furniture catalogue) | 'flora' (plant catalogue).
   SHEET is true for every catalogue target: flat ground, no town, no terrain features.
   CATALOG names WHICH catalogue, so 70-sheet.js lays out buildings only on 'sheet'. */
var SHEET = TARGET!=='world';
var CATALOG = (TARGET==='furn' || TARGET==='flora') ? TARGET : null;

var SEED = 20260921;
var seed = SEED;
function rnd(){ seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }
function rr(a,b){ return a + (b-a)*rnd(); }
function ri(a,b){ return Math.floor(a + (b-a+1)*rnd()); }
function pick(a){ return a[Math.floor(rnd()*a.length)]; }
function chance(p){ return rnd() < p; }
function reseed(s){ seed = s; }
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }
function mix(a,b,t){ return a+(b-a)*t; }
function smin(a,b,k){ var h=clamp(0.5+0.5*(b-a)/k,0,1); return mix(b,a,h) - k*h*(1-h); }
var TAU = Math.PI*2;
function wrapPi(a){ while(a> Math.PI) a-=TAU; while(a<-Math.PI) a+=TAU; return a; }
function angDist(a,b){ return Math.abs(wrapPi(a-b)); }

/* value noise */
function h2(i,j){ var n=(i*374761393 + j*668265263)|0; n=(n^(n>>13))|0; n=Math.imul(n,1274126177); n=(n^(n>>16))>>>0; return n/4294967295; }
function vn(x,z){
  var i=Math.floor(x), j=Math.floor(z), fx=x-i, fz=z-j;
  var u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz);
  var a=h2(i,j), b=h2(i+1,j), c=h2(i,j+1), d=h2(i+1,j+1);
  return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
}
function fbm(x,z){
  return (0.5*vn(x,z) + 0.25*vn(x*2.03+11.3,z*2.01-7.1)
        + 0.125*vn(x*4.07-3.3,z*4.03+5.9) + 0.0625*vn(x*8.11+17,z*8.05+23)) / 0.9375;
}
function sig(x,z,f){ return (fbm(x*f, z*f) - 0.5) * 2; }   /* roughly -1 .. 1 */
/* deterministic position hash, 0..1 — NOT the rnd() stream */
function phash(x,y,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + y*37.719 + (salt||0)*93.9898) * 43758.5453;
  return v - Math.floor(v);
}

function segDist(px,pz, ax,az, bx,bz){
  var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
  var L=vx*vx+vz*vz; var t = L>0 ? clamp((wx*vx+wz*vz)/L,0,1) : 0;
  var dx=px-(ax+vx*t), dz=pz-(az+vz*t);
  return Math.sqrt(dx*dx+dz*dz);
}
var _rv = { d:0, t:0, i:0, u:0 };
function polyNear(px,pz, pts, cum){
  var m=1e9, bt=0, bi=0, bu=0;
  for(var i=0;i<pts.length-1;i++){
    var ax=pts[i][0], az=pts[i][1], bx=pts[i+1][0], bz=pts[i+1][1];
    var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
    var LL=vx*vx+vz*vz, t = LL>0 ? clamp((wx*vx+wz*vz)/LL,0,1) : 0;
    var dx=px-(ax+vx*t), dz=pz-(az+vz*t), d=Math.sqrt(dx*dx+dz*dz);
    if(d<m){ m=d; bi=i; bu=t; bt = cum[i] + t*(cum[i+1]-cum[i]); }
  }
  _rv.d = m; _rv.t = bt; _rv.i = bi; _rv.u = bu; return _rv;   /* t is ARC LENGTH along the polyline */
}
function cumLen(pts){
  var c=[0];
  for(var i=1;i<pts.length;i++) c.push(c[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  return c;
}
function segCross(ax,az,bx,bz, cx,cz,dx,dz){
  function o(px,pz,qx,qz,rx,rz){ return (qx-px)*(rz-pz) - (qz-pz)*(rx-px); }
  var d1=o(ax,az,bx,bz,cx,cz), d2=o(ax,az,bx,bz,dx,dz);
  var d3=o(cx,cz,dx,dz,ax,az), d4=o(cx,cz,dx,dz,bx,bz);
  return ((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0));
}
/* local (lx,lz) about (x,z) rotated by ry -> world. Same convention as Voth:
   local +x points along world angle -ry. */
function loc(x,z,lx,lz,ry){
  return [ x + lx*Math.cos(ry) + lz*Math.sin(ry), z - lx*Math.sin(ry) + lz*Math.cos(ry) ];
}


function clockA(h){ return (h*30 - 90)*Math.PI/180; }
function clockOf(x,z){ var h = (Math.atan2(z,x)*180/Math.PI + 90)/30; return ((h%12)+12)%12; }   /* 0..12, 0 == 12 o'clock */
/* polar frame helper shared by the merged builder: P = {x,z,ry} */
function platXZ(P,r,a){ var t=a+(P.ry||0); return [P.x + r*Math.cos(t), P.z + r*Math.sin(t)]; }

/* ============================== 2. WORLD CONSTANTS ============================== */
var WORLD = 8000, HW = WORLD/2;
var CITY_EXT = CATALOG ? 300 : SHEET ? 1700 : 1400;              /* the detailed box: painted ground canvas + placement mask (metres, +-) */

var RW = 320;                      /* radius of the circular wall, centred on the origin */
var BUTTE = { x:0, z:572, H:400, rFoot:314, rTop:165 };    /* Devil's Tower x2 wide, x1.5 tall */
var VAULT = { zf:BUTTE.z-222, halfW:58, top:136, x:0 };             /* the slot cut into the butte's north face: facade plane z=zf */
var GROUND0 = 20;                  /* nominal ground level at the origin */

/* ---- the valley falls to the NORTH-WEST, and so does everything on it ----
   The mouth of the valley is the NW; the head, closed by the Outer Wall Mountains,
   is the SE. groundPlane is the bare tilted floor: gentle, 0.17% along the axis.
   Everything downstream of here (the river, the canal, the terrain walls, the
   painted horizon) agrees with that one direction.                          */
function groundPlane(x,z){ return GROUND0 + 0.0012*(x + z); }

/* ---- the river, listed UPSTREAM (the SE valley head) to DOWNSTREAM (out of the NW
        mouth). It comes out of the mountains at the head, swings round the EAST and
        NORTH of the city at about 1.2 km, and runs away NW past the market side. ---- */
var RIVER = (function(){
  var ctrl = [[1560,1180],[1420,900],[1330,640],[1280,380],[1250,120],[1210,-160],[1130,-440],[1000,-720],[820,-950],
              [560,-1130],[250,-1230],[-90,-1250],[-430,-1220],[-780,-1200],[-1150,-1260],[-1550,-1440],[-2000,-1740],
              [-2500,-2140],[-3100,-2640],[-3800,-3240]];
  var out=[];
  for(var i=0;i<ctrl.length-1;i++){
    var p0=ctrl[Math.max(0,i-1)], p1=ctrl[i], p2=ctrl[i+1], p3=ctrl[Math.min(ctrl.length-1,i+2)];
    for(var k=0;k<7;k++){
      var t=k/7, t2=t*t, t3=t2*t;
      out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3) + (i>0&&i<ctrl.length-2 ? 16*Math.sin(i*3.1+k*0.9) : 0),
                0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);
    }
  }
  out.push(ctrl[ctrl.length-1]);
  return out;
})();
var RIVER_CUM = cumLen(RIVER), RIVER_LEN = RIVER_CUM[RIVER_CUM.length-1];
var RIVER_HALF = 13;
function riverAt(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]);
  var dx=RIVER[lo+1][0]-RIVER[lo][0], dz=RIVER[lo+1][1]-RIVER[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(RIVER[lo][0],RIVER[lo+1][0],t), z:mix(RIVER[lo][1],RIVER[lo+1][1],t), tx:dx/L, tz:dz/L };
}
/* water level: strictly falling with arc length, riding 4 m below the bare plane */
var RIVER_LVL = (function(){ var out=[], m=1e9; for(var i=0;i<RIVER.length;i++){ var y=groundPlane(RIVER[i][0],RIVER[i][1]) - 4.0; m=Math.min(m,y); out.push(m - 0.0002*RIVER_CUM[i]); } return out; })();
function riverLevelBase(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  return mix(RIVER_LVL[lo], RIVER_LVL[lo+1], (s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]));
}
/* THE DIVERSION WEIR. A masonry dam across the river at the valley head, which ponds the
   water back for half a kilometre and lifts it just high enough to feed the canal. */
var CANAL_WEIR = { x:1330, z:640 };
var WEIR_S = polyNear(CANAL_WEIR.x, CANAL_WEIR.z, RIVER, RIVER_CUM).t, WEIR_LIFT = 2.4;
(function(){ var R=riverAt(WEIR_S); CANAL_WEIR.x=R.x; CANAL_WEIR.z=R.z; CANAL_WEIR.tx=R.tx; CANAL_WEIR.tz=R.tz; })();
function riverLevel(s){
  return riverLevelBase(s) + WEIR_LIFT*smooth(WEIR_S-680, WEIR_S-25, s)*(1 - smooth(WEIR_S+3, WEIR_S+30, s));
}
function riverHalfAt(s){ return RIVER_HALF + 3.0*Math.sin(s*0.006) + 1.5*Math.sin(s*0.017+1.3); }
function riverDist(x,z){ if(SHEET) return 1e6; var rv=polyNear(x,z,RIVER,RIVER_CUM); return rv.d - riverHalfAt(rv.t); }
function inRiver(x,z,margin){ return riverDist(x,z) < (margin||0); }

/* ============================== 2b. THE IRRIGATION CANAL ==============================
   Yuni's farmland is watered from a diversion weir on the river at the valley head.
   The canal takes off there, runs down the head reach to the city's east side, and then
   rings the town through the north at CANAL_R before ending in a walled basin on the
   market side. It is in cut where the ground is high (the head) and on a low embankment
   where the ground has fallen away (the north and west), which is what lets it command —
   water the land below it. The belt between the wall and the canal, and again between the
   canal and the river, is the farm land: nothing is built there yet.            */
var CANAL_R = 940;
var CANAL = (function(){
  var out=[[CANAL_WEIR.x,CANAL_WEIR.z],[1240,470],[1140,300],[1040,170]];
  for(var a=6; a>=-142.01; a-=4){
    var th=a*Math.PI/180, r=CANAL_R*(1 + 0.014*Math.sin(a*0.11) + 0.009*Math.sin(a*0.27+1.3));
    out.push([Math.cos(th)*r, Math.sin(th)*r]);
  }
  return out;
})();
var CANAL_CUM = cumLen(CANAL), CANAL_LEN = CANAL_CUM[CANAL_CUM.length-1];
var CANAL_HALF = 6.0, CANAL_FALL = 0.00045;
var CANAL_L0 = riverLevelBase(WEIR_S) + WEIR_LIFT - 0.15;      /* the head sill sits just under the weir crest */
var CANAL_END = CANAL[CANAL.length-1];
var CANAL_BASIN = (function(){
  var n=CANAL.length, tx=CANAL_END[0]-CANAL[n-2][0], tz=CANAL_END[1]-CANAL[n-2][1], L=Math.hypot(tx,tz)||1; tx/=L; tz/=L;
  return { x:CANAL_END[0]+tx*52, z:CANAL_END[1]+tz*52, w:116, d:76, ry:Math.atan2(-tz,tx), tx:tx, tz:tz, name:'The Basin' };
})();
function canalLevel(s){ return CANAL_L0 - CANAL_FALL*clamp(s,0,CANAL_LEN); }
function canalAt(s){
  s = clamp(s, 0, CANAL_LEN-0.01);
  var lo=0, hi=CANAL_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(CANAL_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-CANAL_CUM[lo])/(CANAL_CUM[lo+1]-CANAL_CUM[lo]);
  var dx=CANAL[lo+1][0]-CANAL[lo][0], dz=CANAL[lo+1][1]-CANAL[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(CANAL[lo][0],CANAL[lo+1][0],t), z:mix(CANAL[lo][1],CANAL[lo+1][1],t), tx:dx/L, tz:dz/L };
}
/* cheap guard first: the whole canal lies in this annulus about the town centre */
function nearCanalBox(x,z){ var r=Math.hypot(x,z); return r > 830 && r < 1760; }
function canalDist(x,z){ if(SHEET || !nearCanalBox(x,z)) return 1e6; return polyNear(x,z,CANAL,CANAL_CUM).d; }
/* the trapezoidal section: bed, inner slopes, a towpath crest each side, then back to grade */
var CANAL_CUT = 1.8, CANAL_CREST = 0.9, CANAL_W = [5.0, 11.0, 15.0, 28.0];
function canalShape(d, L, g){
  if(d >= CANAL_W[3]) return g;
  var bed=L-CANAL_CUT, crest=L+CANAL_CREST, y;
  if(d <= CANAL_W[0]) y = bed;
  else if(d <= CANAL_W[1]) y = mix(bed, crest, smooth(CANAL_W[0], CANAL_W[1], d));
  else if(d <= CANAL_W[2]) y = crest;
  else y = mix(crest, g, smooth(CANAL_W[2], CANAL_W[3], d));
  return y;
}

/* ============================== 3. THE BUTTE ==============================
   A columnar-jointed volcanic plug. butteR(theta,y) is the SHAFT radius about
   (BUTTE.x,BUTTE.z): flared concave foot, near-vertical fluted upper walls,
   slightly oval and lobed in plan. The Grand Vault's slot is cut into the
   north face here, so rock, facade and terrain all agree.                 */
function butteProfile(t){ return BUTTE.rTop + (BUTTE.rFoot-BUTTE.rTop)*Math.pow(1-clamp(t,0,1), 2.3); }
function butteRnat(th, y){
  var t = y/BUTTE.H, r = butteProfile(t);
  r *= 1 + 0.055*Math.cos(2*th+0.6) + 0.030*Math.cos(3*th-1.1) + 0.020*Math.cos(5*th+2.0);
  var cx=Math.cos(th), sz=Math.sin(th);
  r += 7*sig(cx*2.2+7, sz*2.2-3, 1) + 3.0*sig(cx*6+1+y*0.004, sz*6+9, 1);           /* buttress bundles */
  r += 1.6*Math.pow(0.5+0.5*Math.cos(th*46 + 0.8*Math.sin(y*0.013)), 1.5)*smooth(0.05,0.30,t);  /* column bundles */
  return r;
}
function vaultSlotTop(x){ var q=x/VAULT.halfW; return VAULT.top - 30*q*q*q*q; }
function butteR(th, y){
  var r = butteRnat(th, y), sn = Math.sin(th);
  if(sn < -0.5 && y < VAULT.top + 2){
    var rs = (BUTTE.z - VAULT.zf)/(-sn), xs = BUTTE.x + rs*Math.cos(th);
    if(Math.abs(xs) < VAULT.halfW && y < vaultSlotTop(xs) && rs < r) r = rs;
  }
  return r;
}
function butteTopY(x,z){ var d=Math.hypot(x-BUTTE.x,z-BUTTE.z); return BUTTE.H + 2.0*(1-smooth(60,170,d)) - 5*smooth(130,175,d) + 1.2*sig(x,z,0.02)*smooth(90,150,d) + 0.5*sig(x,z,0.09); }   /* the Ancients levelled the summit for their port */
/* true if (x,z) at height y is inside the rock */
function inButte(x,z,y,margin){
  if(SHEET) return false;
  var dx=x-BUTTE.x, dz=z-BUTTE.z, d=Math.hypot(dx,dz); if(d > BUTTE.rFoot*1.2+(margin||0)) return false;
  if(y > BUTTE.H+14) return false;
  return d < butteR(Math.atan2(dz,dx), Math.max(0,y-GROUND0)) + (margin||0);
}

/* ============================== 4. TERRAIN FIELD ==============================
   Uneven, a bit hilly; gentle under the town, rolling beyond it; the valley
   walls rise to the SE, SW and NW and the floor falls away to the NE mouth. */
var TERRAIN_MOUNDS = [];           /* [x, z, radius, height] */
var TERRAIN_PADS = [];             /* [x, z, rInner, rOuter, y] levelled sites (market circle, forecourt...) */
function terrainH(x,z){
  if(SHEET) return 0;
  var r0 = Math.hypot(x,z);
  var townK = 0.10 + 0.90*smooth(520, 1500, r0);
  var rv = polyNear(x,z,RIVER,RIVER_CUM), s = rv.t, d = rv.d, half = riverHalfAt(s);
  var nearRiver = smooth(30, 320, d);
  /* the irrigated belt is nearly level — that is WHY it is the irrigated belt: the big rolling
     hills are damped right through the farm ring and the canal corridor, and only the small
     noise survives, so the canal's banks never stand against a hillside. */
  var beltK = 1 - 0.88*smooth(710, 800, r0)*(1 - smooth(1180, 1340, r0));
  var h = groundPlane(x,z)
        + (34*sig(x+900, z-400, 0.0013)*beltK + 13*sig(x-300, z+700, 0.0042)*mix(1,0.45,1-beltK))*townK*nearRiver
        + 2.6*sig(x+50, z-90, 0.011)*(0.35+0.65*townK)*mix(1,0.65,1-beltK) + 0.5*sig(x, z, 0.05);
  /* THE VALLEY. u runs along its axis toward the NORTH-WEST mouth, v across it. The walls
     of the Outer Wall Mountains close the SE head and both flanks; the floor tips away NW. */
  var u = -(x + z)*0.70711, v = (x - z)*0.70711;
  var wall = smooth(1900, 4300, Math.abs(v) + 0.25*Math.max(0,-u)) + smooth(1700, 4200, -u);
  h += 620*wall*wall*(0.75+0.5*fbm(x*0.0009+3, z*0.0009-8)) + 60*wall*sig(x,z,0.004);
  h -= 26*smooth(1200, 4000, u);
  /* talus apron of the butte — cleared by the Ancients on the town side */
  var bx=x-BUTTE.x, bz=z-BUTTE.z, bd=Math.hypot(bx,bz);
  if(bd < 560){
    var toTown = angDist(Math.atan2(bz,bx), -Math.PI/2);            /* 0 = facing north, the town */
    var keep = smooth(0.95, 1.55, toTown);
    var tl = 1-smooth(250, 540, bd);
    h += 92*tl*tl*keep + 4*keep*tl*sig(x,z,0.03);
  }
  /* under the rock itself the ground is sunk out of the way of the tunnel and the antechamber */
  if(bd < BUTTE.rFoot*1.1){ var br = butteR(Math.atan2(bz,bx), 6); if(bd < br-10) h = mix(h, -70, smooth(br-10, br-22, bd)); }
  for(var p=0;p<TERRAIN_PADS.length;p++){
    var P=TERRAIN_PADS[p], pd=Math.hypot(x-P[0],z-P[1]);
    if(pd < P[3]) h = mix(P[4], h, smooth(P[2], P[3], pd));
  }
  /* the river channel */
  if(d < half + 70){
    var wl = riverLevel(s);
    var bed = wl - 2.2*(1 - smooth(half*0.3, half, d)) - 0.3;
    h = mix(bed, Math.max(h, wl+0.8), smooth(half-1.5, half+34, d));
  }
  /* the basin: a tank sunk behind a raised bund at the canal's end */
  if(Math.abs(x-CANAL_BASIN.x) < 150 && Math.abs(z-CANAL_BASIN.z) < 150){
    var bq=loc(0,0, x-CANAL_BASIN.x, z-CANAL_BASIN.z, -CANAL_BASIN.ry);
    var dB=Math.max(Math.abs(bq[0])-CANAL_BASIN.w/2, Math.abs(bq[1])-CANAL_BASIN.d/2), BL=canalLevel(CANAL_LEN);
    if(dB < 20){
      if(dB <= -2) h = BL-3.6;
      else if(dB <= 2) h = mix(BL-3.6, BL+1.6, smooth(-2,2,dB));
      else if(dB <= 7) h = BL+1.6;
      else h = mix(BL+1.6, h, smooth(7,20,dB));
    }
  }
  /* the canal: cut, banks and towpath (guarded, so most of the map never pays for it) */
  if(nearCanalBox(x,z)){
    var cv = polyNear(x,z,CANAL,CANAL_CUM), cd = cv.d, cs = cv.t;
    if(cd < CANAL_W[3]) h = canalShape(cd, canalLevel(cs), h);
  }
  for(var i=0;i<TERRAIN_MOUNDS.length;i++){
    var M=TERRAIN_MOUNDS[i], dx=x-M[0], dz=z-M[1], q=(dx*dx+dz*dz)/(M[2]*M[2]);
    if(q < 1){ var f=1-q; h += M[3]*f*f; }
  }
  return h;
}

/* per-frame callbacks: any fragment may TICKS.push(function(dt, hour, nightK){...}). */
var TICKS = [];
/* path-viz registry: {key,label,color,paths:function(){return [[[x,y,z],...],...];}} */
var PATHVIZ = [];
