// ================================================================= ATMOS — fx: the night's katabatic wind and the day's valley breeze (2026-11-09; opt-in)
// [G data] + [web]. The shared amendment the basin plans list (biomes/godshearth/PLAN.md section 8, amendment 3; the Catch's walls; Firebliss, Mid Basin):
// on a clear night the walls' cold air drains down onto the floor (a katabatic wind: strongest before dawn, gone by mid-morning), and by day the
// warmed slopes draw a breeze back up (the valley or lake breeze, weaker). Cloud holds the night's cooling back, so an overcast night barely drains.
//   ATMOS.katabaticK(hour, cloud, o) -> {night, day}   the two shares now (pure, 0..1): night = rise(o.dusk) x fall(o.dawn) x (1 - cloud's share),
//        day = rise(o.morning) x fall(o.evening) x (1 - half the cloud's share). o: dusk [19, 23] (hours it builds over), dawn [6.5, 9.5] (hours it
//        dies over), morning [9.5, 12.5], evening [16, 19], cloudK [.25, .85] (the cloud cover over which the night's drainage fails)
//   ATMOS.katabaticWind(hour, cloud, o) -> [wx, wz]     the wind's base vector (pure): calm x (1 - night - day) + down x night x speed + up x day
//        x daySpeed. o adds: down [x, z] (where the cold air flows TO: downslope, toward the floor's lowest ground; normalised), up (the day's
//        breeze, default the reverse of down), speed (1.6: the base's units, core/atmos's wind preset is about .9), daySpeed (.7), calm ([.3, .15])
//   ATMOS.katabatic(o) -> K   the host, once, after ATMOS.init: each frame (ATMOS.hook) A.windBase is set from o.hour() (the host's clock) and
//        o.cloud() (default the weather's ATMOS.W.cloud), so every particle cloud, the gusts and the plumes drift with it. K {night, day, wind}: now
// It only adds: a page that does not list it, or does not call it, keeps its wind. Godot: the same arithmetic on the clock's hour.
(function(){'use strict';
 if(typeof ATMOS==='undefined')return;var A=ATMOS;
 function smooth(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
 function num(v,d){return v==null||!(v===v)?d:+v;}
 A.katabaticK=function(hour,cloud,o){o=o||{};var h=((num(hour,12)%24)+24)%24,c=Math.min(1,Math.max(0,num(cloud,0)));
  var dk=o.dusk||[19,23],dw=o.dawn||[6.5,9.5],mo=o.morning||[9.5,12.5],ev=o.evening||[16,19],ck=o.cloudK||[.25,.85];
  var night=h>=12?smooth(dk[0],dk[1],h):1-smooth(dw[0],dw[1],h),day=smooth(mo[0],mo[1],h)*(1-smooth(ev[0],ev[1],h)),cl=smooth(ck[0],ck[1],c);
  return{night:night*(1-cl),day:day*(1-.5*cl)};};
 A.katabaticWind=function(hour,cloud,o){o=o||{};var K=A.katabaticK(hour,cloud,o),d=o.down||[-1,0],l=Math.hypot(d[0],d[1])||1,dx=d[0]/l,dz=d[1]/l;
  var u=o.up||[-dx,-dz],lu=Math.hypot(u[0],u[1])||1,ux=u[0]/lu,uz=u[1]/lu,s=num(o.speed,1.6),sd=num(o.daySpeed,.7),c=o.calm||[.3,.15],r=Math.max(0,1-K.night-K.day);
  return[c[0]*r+dx*s*K.night+ux*sd*K.day,c[1]*r+dz*s*K.night+uz*sd*K.day];};
 A.katabatic=function(o){o=o||{};var hour=o.hour||function(){return 12;},cloud=o.cloud||function(){return A.W&&A.W.cloud!=null?A.W.cloud:0;};
  var K={night:0,day:0,wind:[0,0]};
  K.tick=function(){var h=hour(),c=cloud(),k=A.katabaticK(h,c,o);K.night=k.night;K.day=k.day;K.wind=A.katabaticWind(h,c,o);
   if(A.windBase&&A.windBase.set)A.windBase.set(K.wind[0],K.wind[1]);return K.wind;};
  K.tick();if(A.hook)A.hook(function(){K.tick();});
  if(A.rec)A.rec('katabatic',{down:o.down||[-1,0],up:o.up||null,speed:num(o.speed,1.6),daySpeed:num(o.daySpeed,.7)});
  A.katabaticNow=K;return K;};
})();
