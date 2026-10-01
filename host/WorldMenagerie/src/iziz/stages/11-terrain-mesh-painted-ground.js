// ---------- terrain mesh + painted ground/streets canvas ----------
const CS=1024,S=CS/WORLD,px=v=>(v+WORLD/2)*S;
const cv=document.createElement('canvas');cv.width=cv.height=CS;const c=cv.getContext('2d');
const mv=document.createElement('canvas');mv.width=mv.height=CS;const m=mv.getContext('2d');

function poly(ctx,pf,n,fill){ctx.beginPath();for(let i=0;i<=n;i++){const t=i/n*Math.PI*2,q=pf(t);if(i)ctx.lineTo(px(q[0]),px(q[1]));else ctx.moveTo(px(q[0]),px(q[1]));}ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function stroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=w*S;ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.stroke();}
function road(pts,w){stroke(c,pts,w,'#4a4846');stroke(m,pts,w+3,'#000');}
function disc(x,z,r,col,mcol){c.beginPath();c.arc(px(x),px(z),r*S,0,7);c.fillStyle=col;c.fill();m.beginPath();m.arc(px(x),px(z),r*S,0,7);m.fillStyle=mcol;m.fill();}

// ground
c.fillStyle='#1c4227';c.fillRect(0,0,CS,CS);
m.fillStyle='#fff';m.fillRect(0,0,CS,CS);
for(let i=0;i<900;i++){c.beginPath();c.arc(rnd()*CS,rnd()*CS,rr(6,40),0,7);c.fillStyle=pick(['rgba(20,80,40,.45)','rgba(50,120,60,.35)','rgba(30,60,50,.4)']);c.fill();}
const outer=t=>[(wallR(t)+46)*Math.cos(t),(wallR(t)+46)*Math.sin(t)];
const inner=t=>[(wallR(t)+4)*Math.cos(t),(wallR(t)+4)*Math.sin(t)];
poly(c,outer,120,'#3a2818');poly(m,outer,120,'#000');
poly(c,inner,120,'#70401f');poly(m,inner,120,'#fff');
c.save();c.beginPath();for(let i=0;i<=120;i++){const q=inner(i/120*Math.PI*2);i?c.lineTo(px(q[0]),px(q[1])):c.moveTo(px(q[0]),px(q[1]));}c.closePath();c.clip();
for(let i=0;i<700;i++){const x=rr(-270,270),z=rr(-270,270);c.beginPath();c.arc(px(x),px(z),rr(5,30),0,7);c.fillStyle=pick(['rgba(140,80,40,.45)','rgba(90,45,25,.5)','rgba(170,110,60,.3)','rgba(60,35,25,.4)']);c.fill();}
c.restore();
