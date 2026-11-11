// ================================================================= HOST — the breath: the steam, the cap clouds, the cold breath, the hazards, the one tick (PLAN.md sections 3, 9, 12)
// Everything reads LUNG.breath(t, W) once a frame (t the host clock's day and hour, W the weather): the breath's five states on the items (72), the
// steam at the live mouths, the cap clouds over them at noon, the cold breath out of the bells on a winter night (core/atmos's particles in groups,
// fx/smokegroups: one scalar a group, no particle touched), the far lungs' darkness (85), and the hazards (core/hazard: KHAZ.STATES['LUNG.breath']
// reads LUNG.now). No steam at a husk: a husk has no emitter. Nothing glows: the steam is lit by the sky like any cloud.
// ---- the steam (core/atmos particles): two kinds of the kit's own beside the presets' (a host may add before it places, PRESETS' rule)
{const P=ATMOS.PRESETS.smoke;
 P.capcloud={index:3,n:10,rate:.025,rise:38,drift:14,wobble:6,size:[16,60],alpha:.42,rainDamp:0,color:[.95,.96,.97]};
 P.coldbreath={index:4,n:16,rate:.06,rise:-3,drift:5,wobble:3,size:[6,26],alpha:.38,rainDamp:0,color:[.82,.88,.94]};}
const mouthTop=M=>terrainH(M.x,M.z)-M.r*.25+M.r*1.5;
const LIVE_M=LUNG_L.mouths.filter(M=>M.live),LIVE_B=LUNG_L.bells.filter(B=>B.live);
const STEAM=ATMOS.smokeGroups?ATMOS.smokeGroups({
 mouths:{emitters:LIVE_M.map(M=>[M.x,mouthTop(M),M.z,'steam']),n:18,k:0},
 caps:{emitters:LIVE_M.map(M=>[M.x+M.lean[0]*12,mouthTop(M)+25,M.z+M.lean[1]*12,'capcloud']),k:0},
 back:{emitters:LIVE_M.map(M=>[M.x,mouthTop(M)-1,M.z,'steam']),n:8,k:0},
 bells:{emitters:LIVE_B.map(B=>[B.x,B.y+B.r*.8,B.z,'coldbreath']),k:0}}):null;
// ---- the clock and the weather the breath reads
const MIDWINTER=(function(){let bd=0,bs=2;for(let d=0;d<365;d++){const s=KCLOCK.season(d,0).summer;if(s<bs){bs=s;bd=d;}}return bd;})();
function lungClock(){const H=typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock,hour=H?H.hour:STN.hour,day=H&&H.day!=null?H.day:STN.day;
 const rain=ATMOS.U?ATMOS.U.rain.value:0,fog=ATMOS.U?ATMOS.U.fog.value:0;
 return [day+hour/24,{wet:.9,cloud:clamp(.12+.8*rain+.4*fog,0,1),wind:7,summer:KCLOCK.season(day,hour).summer}];}
LUNG.now=lungClock;
window._breath=null;
function breathTick(){const q=lungClock(),e=LUNG.engines(q[0],q[1]),b=e.b;
 BIO.breathState('lungsheen').value=clamp(e.latent/.27,0,1);
 BIO.breathState('lungslack').value=LUNG.roleK('sphincter',b).k;
 BIO.breathState('lungdraw').value=clamp(b,0,1);
 BIO.breathState('lungcold').value=clamp(-b/.2,0,1);
 BIO.breathState('lungdrip').value=clamp(b*2,0,1);
 if(STEAM){STEAM.set('mouths',Math.min(1,3*Math.max(b,0)));STEAM.set('caps',1.2*smooth(.45,.9,b));STEAM.set('back',.5*clamp(-b/.2,0,1));STEAM.set('bells',clamp(-b/.2,0,1));}
 if(FAR&&FAR.lines)FAR.lines.k.value=.3+.7*Math.max(b,0);
 window._breath={b:+b.toFixed(4),hour:+e.hour.toFixed(2),latent:+e.latent.toFixed(3),solar:+e.solar.toFixed(3),reverse:+e.reverse.toFixed(3),summer:+e.summer.toFixed(3),
  steam:STEAM?{mouths:STEAM.k('mouths'),caps:STEAM.k('caps'),back:STEAM.k('back'),bells:STEAM.k('bells')}:null};}
TICKS.push(breathTick);
