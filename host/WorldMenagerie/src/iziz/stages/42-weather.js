// ---------- weather: a rain shower most days (Auto), cloud shadows, wet ground that dries off ----------
// markets trade 07:00-18:30; every third evening (or when asked) is a festival night, 18:30-01:30
const marketF=h=>smooth(6.3,7.3,h)*(1-smooth(18.2,19.2,h));
const FEST={forceDay:null};
function festF(total){const d=Math.floor(total/24),h=total-d*24,day=h<3?d-1:d;const on=day%3===2||day===FEST.forceDay;if(!on)return 0;const hh=h<3?h+24:h;return smooth(18.5,19.2,hh)*(1-smooth(25,25.5,hh));}
ctx.fest=FEST;
const WEATHER={mode:'auto',target:0,MODES:['auto','clear','rain','fog','dust','windy']};
function dayWeather(day){const rain=rainPlan(day);return {rain,fog:day>0&&hash3(day,4,94)<0.3?{s:4.3,e:9.6}:null,dust:!rain&&day>0&&hash3(day,5,95)<0.14?{s:9,e:19}:null,windy:hash3(day,6,96)<0.28};}
function windowAt(w,hh,ramp){return w?smooth(w.s,w.s+ramp,hh)*(1-smooth(w.e-ramp,w.e,hh)):0;}
function rainPlan(day){if(day===0)return {s:19.5,e:22.0};if(hash3(day,1,91)>0.55)return null;const st=10+9*hash3(day,2,92);return {s:st,e:st+2.2+0.8*hash3(day,3,93)};}
function rainAt(total){const day=Math.floor(total/24),hh=total-day*24,w=rainPlan(day);return w?smooth(w.s,w.s+0.4,hh)*(1-smooth(w.e-0.4,w.e,hh)):0;}
await stage('weather');
section('weather',()=>{
const cloudTex=(()=>{const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,S,S);const R=mkRng(515);
  for(let i=0;i<140;i++){const x=R()*S,y=R()*S,r=10+R()*38,a=0.08+R()*0.16;
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const cx=x+ox*S,cy=y+oy*S,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r);}}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
ENV.izCloudMap.value=cloudTex;
let last=performance.now();
animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;
  const total=ctx.totalHours||15,M=WEATHER.mode,day=Math.floor(total/24),hh=total-day*24,plan=dayWeather(day);
  WEATHER.target=M==='rain'?1:M==='auto'?rainAt(total):0;
  const fogT=M==='fog'?1:M==='auto'?windowAt(plan.fog,hh,1.2):0,dustT=M==='dust'?1:M==='auto'?windowAt(plan.dust,hh,1.5):0,windT=M==='windy'?1:M==='auto'&&plan.windy?1:0;
  const ease=(k,t,rate)=>{ENV[k].value+=(t-ENV[k].value)*Math.min(1,dt*rate);};
  ease('izFog',fogT,0.8);ease('izDust',dustT,0.6);WEATHER.windy=(WEATHER.windy||0)+(windT-(WEATHER.windy||0))*Math.min(1,dt*0.5);
  ENV.izGust.value=1+WEATHER.windy*(1.4+0.5*Math.sin(now*0.00031)*Math.sin(now*0.00017));
  {const k=1+0.9*WEATHER.windy;ENV.izWind.value.set(0.82*k,0.36*k);}
  const r=ENV.izRain.value;ENV.izRain.value=r+(WEATHER.target-r)*Math.min(1,dt*1.5);
  const w=ENV.izWet.value;ENV.izWet.value=clamp(w+(dt/(DAY/24))*(ENV.izRain.value>0.15?2.0*ENV.izRain.value:-0.35),0,1);
  ENV.izTime.value=now/1000;});
});
