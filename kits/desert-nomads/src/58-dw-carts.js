// prefix: dw
// ================================================================= CARTS AND LITTERS (class prop): the desert nomads move by camel, now and then by cart
// No chariots. A two-wheeled cart between shafts behind a camel (for the wells and the markets, where there is a track), and
// the hawdaj: a canopied litter on a camel's back, the desert's way of carrying a household (the counterpart of the Scyvoi
// ger cart). The camels are the fauna kit's dromedary, drawn here in the cart's frame with a breast strap or the litter.
/* a spoked cart wheel standing in the y-z plane (axle along x) at (x, r, z): eight heavy spokes, a broad felloe */
function dwWheel(x,z,r,col){const y=r,c=col||P('woodD');
 ring('wood',x,y,z,r-.06,.06,c,0,0,PI/2,Math.max(16,Math.round(r*28)));ring('iron',x,y,z,r,.022,0x2e2a26,0,0,PI/2,Math.max(16,Math.round(r*28)));
 beam('wood',[x-.14,y,z],[x+.14,y,z],.13,c,true,10);
 for(let i=0;i<8;i++){const a=i/8*TAU;beam('wood',[x,y,z],[x,y+Math.cos(a)*(r-.07),z+Math.sin(a)*(r-.07)],.04,c,true,5);}}
/* a camel in the def's frame at (0,0,z), its life record, an optional strap on it */
function dwCamel(z,ry,v,job,extra){let e=null;W(0,0,z,ry||0,()=>{e=saFauna('dromedary',{variant:v|0,pose:'stand',seed:5700+(v|0)},'idle');const an=e.g.userData.anchors||{};
  if(extra)e.tack=saCapture(()=>extra(an));});
 saLife('dromedary',{job,activity:'WORK'});return e;}
defBuilding({key:'cart-camel',name:'Camel cart',seed:5801,cls:'prop',kind:'cart',w:2.6,d:7.6,h:2.5,budget:60000,front:{x:0,z:3.8,yaw:0},
 tags:{role:'transport'},note:'a two-wheeled cart between long shafts behind a camel: a bed of palm-rib slats, water jars and sacks, a hair-cloth cover over the back',
 build(o){const r=.72,ay=r;for(const s of [-1,1])dwWheel(s*1.0,-1.2,r);beam('wood',[-1.1,ay,-1.2],[1.1,ay,-1.2],.07,P('woodD'),true,8);
  box('wood',0,ay+.08,-1.3,1.7,.08,2.4,P('wood'));
  for(const s of [-1,1]){for(let i=0;i<9;i++)beam('wood',[s*.82,ay+.12,-2.4+i*.28],[s*.86,ay+.62,-2.4+i*.28],.025,P('palm'),true,4);beam('wood',[s*.84,ay+.62,-2.5],[s*.84,ay+.62,-.1],.035,P('woodD'),true,6);}
  for(const s of [-1,1])beam('wood',[s*.6,ay+.05,-.1],[s*.45,1.55,2.4],.06,P('woodD'),true,8);   // the shafts, up to the camel's shoulders
  psurf('hair',(u,v)=>{const a=(u-.5)*PI,z=-2.5+v*1.3;return [Math.sin(a)*.86,ay+.62+Math.cos(a)*.55,z];},8,3,P('hair'));
  FURNISH('nomad_water_jars',0,ay+.12,-1.6,0,{setting:'outdoor'});FURNISH('nomad_grain_sacks',0,ay+.12,-.6,PI/2,{setting:'outdoor'});
  dwCamel(3.05,0,1,'draught',an=>{const c=an.chest||[0,1.5,.7];const st=[];for(let i=0;i<=12;i++){const a=(i/12-.5)*2.4;st.push([Math.sin(a)*.42,c[1]+Math.cos(a)*.3,c[2]+.05]);}cord('hide',st,.04,0x5a3a22);
   for(const s of [-1,1])cord('hide',[[s*.42,c[1],c[2]],[s*.46,1.55,-.55]],.025,0x5a3a22);saDrape('patSadu',an.saddle,.36,.7,.45,null,{});});}});
defBuilding({key:'camel-litter',name:'Camel litter (hawdaj)',seed:5802,cls:'prop',kind:'litter',w:2.6,d:3.6,h:4.4,budget:60000,front:{x:0,z:1.6,yaw:0},
 tags:{role:'transport'},note:'the hawdaj: a canopied litter of bent poles and sadu cloth on a camel, a household carried across the sand (the Scyvoi move a whole ger on a cart)',
 build(o){dwCamel(0,0,2,'pack',an=>{const s=an.saddle,y=s[1]+.08;saDrape('patSadu',s,.36,1.1,.6,null,{tassels:.4});
   box('wood',0,y+.04,s[2],1.0,.08,1.2,P('woodD'));
   for(const [x,z] of [[-.48,-.56],[.48,-.56],[-.48,.56],[.48,.56]])pole('wood',[x,y,s[2]+z],[x*.7,y+1.0,s[2]+z*.7],.025,P('woodD'),5);
   for(let i=0;i<5;i++){const z=s[2]-.56+i*.28;const pts=[];for(let k=0;k<=8;k++){const a=(k/8-.5)*PI;pts.push([Math.sin(a)*.48,y+.55+Math.cos(a)*.55,z]);}cord('wood',pts,.02,P('woodD'));}
   psurf('patSadu',(u,v)=>{const a=(u-.5)*PI*1.05,z=s[2]-.6+v*1.2;return [Math.sin(a)*.52,y+.55+Math.cos(a)*.58,z];},10,4,null);
   tkTassels(Array.from({length:9},(_,i)=>{const z=s[2]-.6+i*.15;return [.53,y+.5,z];}),.15,0xe8dcc4,.18);
   tkTassels(Array.from({length:9},(_,i)=>{const z=s[2]-.6+i*.15;return [-.53,y+.5,z];}),.15,0x8e3a24,.18);
   W(0,y+1.15,s[2],0,()=>dkFinial(0));});}});
