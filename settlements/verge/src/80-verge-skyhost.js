// ================================================================= VERGE — the sky's stage ([web])
// The lighting system of the Voth-lineage worlds (Locus, Girder, Mav's Refuge, Yuni, Voth) is taken whole: the Krator
// sky (81, a vendored copy of settlements/locus/src/21-sky.js: a background scene with the gas giant, the moving sun,
// the stars and the moons) and the day/night key light (82, a vendored copy of 82-daynight.js: sun by day, the giant
// by night, hemisphere and ambient floors, fog colour), with the Yuni-engine kit's night glow (YKIT.glow(): the
// night-light volume over the lower city, halos over every lamp, window panes lit on a staggered schedule).
// Those fragments expect the pieces Locus's 20-stage.js makes; this is Verge's version of those pieces:
// its own baked horizon dome (the plateau and the Inner Wall far to the west, the far shelf of the Abyss low in the
// east), the sun and moon sprites, the palette the sky reads (Locus's, with Verge's dry desert haze), and a reseed()
// that does nothing (the sky draws from its own private stream). The one clock is core/clock: 90 sets the sky's
// hour from CLOCK every frame, so the sun, the lamps and the life layer agree.
var PAL=Object.assign({},YKIT.PAL,{haze:0xd6c4a8,hazeNight:0x14161f,fogDensity:0.000082,hemiSky:0xc8d4e4,hemiGround:0x7a4a32,
 sky:Object.assign({},YKIT.PAL.sky,{zenHazy:0x8aa6c4,horHazy:0xdcccb2,horDeep:0xc4ccd2,soil:0xb07a52})});
function reseed(){}
var SUNDIR=new THREE.Vector3(-0.52,0.62,-0.29).normalize();
var MOONDIR=new THREE.Vector3(0.52,0.40,0.75).normalize();
// ---------------------------------------------------------------- the baked horizon dome (layer 0 of the sky)
// An equirectangular canvas on a sphere seen from inside: u = ((270 - azimuth)/360) mod 1 (azimuth from north,
// clockwise), the horizon at the middle row. The sky above the lowest ~7 degrees is the sky fragment's own gradient.
function vergeHorizon(){const W=FAST?2048:4096,H=W/2,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),HZ=H*.5,DEG=H/180;
 const R=KRAND.stream(KRAND.child(VG.SEED,'horizon'));
 const rgb=h=>[(h>>16)&255,(h>>8)&255,h&255],css=(c,a)=>'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+a+')',m3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const HZC=rgb(PAL.haze),ZEN=rgb(PAL.sky.zenHazy),HOR=rgb(PAL.sky.horHazy),FAR=[160,170,186];
 const grd=g.createLinearGradient(0,0,0,H);grd.addColorStop(0,css(m3(ZEN,[70,110,170],.5),1));grd.addColorStop(.3,css(ZEN,1));grd.addColorStop(.45,css(m3(ZEN,HOR,.7),1));
 grd.addColorStop(.49,css(HOR,1));grd.addColorStop(.5,css(m3(HOR,HZC,.5),1));grd.addColorStop(.54,css(HZC,1));grd.addColorStop(.66,css(m3(HZC,[176,128,96],.5),1));grd.addColorStop(1,css([128,92,70],1));
 g.fillStyle=grd;g.fillRect(0,0,W,H);
 const xOf=az=>(((270-az)/360)%1+1)%1*W;
 // a ridge line: heights (degrees) by azimuth, filled down to the horizon, drawn wrapping
 function ridge(az0,az1,hf,col,a){g.fillStyle=css(col,a);for(let w=-1;w<=1;w++){g.beginPath();const n=240;
   for(let k=0;k<=n;k++){const az=az0+(az1-az0)*k/n,x=xOf(az)+w*W,y=HZ-hf(az,k/n)*DEG;if(k)g.lineTo(x,y);else g.moveTo(x,y);}
   g.lineTo(xOf(az1)+w*W,HZ+2);g.lineTo(xOf(az0)+w*W,HZ+2);g.closePath();g.fill();}}
 const vn=(x,s)=>VG.vn(x,.5,s);
 // the Inner Wall: a great rampart far in the west, blue with distance, 3-7 degrees
 ridge(205,335,(az,t)=>Math.sin(Math.PI*t)*(3.2+2.4*vn(az*.08,3)+1.6*vn(az*.4,4)+.6*vn(az*2,5)),FAR,.85);
 ridge(215,325,(az,t)=>Math.sin(Math.PI*t)*(1.6+1.4*vn(az*.15,6)+.8*vn(az*.9,7)),m3(FAR,[150,120,104],.35),.8);
 // the plateau's own far mesas round the west and south, low and ochre-grey
 for(let i=0;i<9;i++){const az=R.range(170,360),w=R.range(1.5,4),h=R.range(.35,.9);ridge(az-w,az+w,(a,t)=>h*Math.min(1,Math.sin(Math.PI*t)*3),m3(FAR,[176,146,118],.5),.7);}
 // the far shelf of the Abyss: a pale level line low in the east, a wall the haze has almost eaten
 ridge(20,165,(az,t)=>Math.sin(Math.PI*t)**.3*(.9+.5*vn(az*.2,8)),[196,190,186],.55);
 // the horizon haze over it all
 const hz=g.createLinearGradient(0,HZ-6*DEG,0,HZ+4);hz.addColorStop(0,css(HZC,0));hz.addColorStop(1,css(HZC,.5));g.fillStyle=hz;g.fillRect(0,HZ-6*DEG,W,6*DEG+4);
 // a few high streaks of dust and cirrus
 for(let i=0;i<14;i++){const y=HZ-R.range(8,60)*DEG,x=R.range(0,W);g.fillStyle='rgba(246,240,230,'+(.03+.06*R.next()).toFixed(3)+')';
  for(let w=-1;w<=1;w++){g.beginPath();g.ellipse(x+w*W,y,R.range(160,700),R.range(3,10),0,0,Math.PI*2);g.fill();}}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;}
var volcTex=(function(){const t=vergeHorizon();return{idle:t,active:t};})();
var skyMesh=new THREE.Mesh(new THREE.SphereGeometry(11000,54,34),new THREE.MeshBasicMaterial({map:volcTex.idle,side:THREE.BackSide,fog:false,depthWrite:false}));
skyMesh.renderOrder=-10;scene.add(skyMesh);          // 81 moves it into the background scene
// ---------------------------------------------------------------- the sun's glare and the two small moons (81 adopts them)
function vergeDiscTex(inner,outer,rays){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),grd=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
 grd.addColorStop(0,inner);grd.addColorStop(.26,inner);grd.addColorStop(.34,outer);grd.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grd;g.fillRect(0,0,S,S);
 if(rays){g.globalAlpha=.3;for(let i=0;i<rays;i++){const a=i/rays*Math.PI*2;g.strokeStyle=outer;g.lineWidth=3;g.beginPath();g.moveTo(S/2+Math.cos(a)*30,S/2+Math.sin(a)*30);g.lineTo(S/2+Math.cos(a)*118,S/2+Math.sin(a)*118);g.stroke();}g.globalAlpha=1;}
 return new THREE.CanvasTexture(c);}
function vergeDisc(dir,size,inner,outer,rays){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:vergeDiscTex(inner,outer,rays),fog:false,depthWrite:false,depthTest:false,transparent:true,blending:THREE.AdditiveBlending}));
 s.scale.set(size,size,1);s.renderOrder=-9;s.userData.dir=dir.clone();scene.add(s);return s;}
var sunSprite=vergeDisc(SUNDIR,300,'rgba(255,250,228,0.98)','rgba(255,224,164,0.42)',18);
var moonSprite=vergeDisc(MOONDIR,150,'rgba(232,236,246,0.70)','rgba(196,206,226,0.16)',0);
var moon2=vergeDisc(new THREE.Vector3(-0.80,0.19,0.30).normalize(),76,'rgba(238,214,206,0.42)','rgba(206,176,168,0.10)',0);
