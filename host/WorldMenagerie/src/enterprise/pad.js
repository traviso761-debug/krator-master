// ---------- Galaxy class: a gamepad at the helm ----------
// Original work. The Gamepad API, read once a frame while a pad is connected (the browser only lists one after a
// button on it has been pressed). Axes go through the helm's one analog input (W.helmAxes, helm.js), so a pad and
// the touch stick steer the same way as the keys; buttons press the helm strip's orders (W.helmAct) or the page's
// own keys, once per press.
//
//   Left stick     turn (side to side) and pitch (forward is nose down, as in any flight stick)
//   Right stick    impulse (up and down, by rate) and roll (side to side)
//   Triggers       impulse: right for more, left for less
//   A  B  X  Y     phasers, torpedo, scan, shields
//   LB  RB         hail (comms), energise (transporter)
//   Back / View    red alert
//   Start / Menu   take the helm; at the helm, the orders and the log
//   Stick clicks   standard orbit (left), the camera (right)
//   D-pad          dock (up), all stop (down), the star chart (left), stellar cartography (right)
const DZ=0.15;
const dz=a=>Math.abs(a)<DZ?0:(a-Math.sign(a)*DZ)/(1-DZ);
export function pad(W){
  const S=W.flight,key=k=>{for(const t of ['keydown','keyup'])dispatchEvent(new KeyboardEvent(t,{key:k}));};
  const BTN={0:()=>W.helmAct('ph'),1:()=>W.helmAct('tp'),2:()=>W.helmAct('scan'),3:()=>W.helmAct('sh'),4:()=>W.helmAct('hail'),5:()=>W.helmAct('beam'),
    8:()=>W.helmAct('red'),9:()=>{if(!S.on)W.startFlight&&W.startFlight();else key('j');},10:()=>key('o'),11:()=>key('v'),
    12:()=>W.helmAct('dock'),13:()=>W.allStop&&W.allStop(),14:()=>W.openNav&&W.openNav(),15:()=>key('p')};
  // the help overlay lists the pad's buttons with the keys
  if(W.keys)for(const [k,t] of [['L stick','Turn; pitch (forward is nose down)'],['R stick','Impulse (up, down); roll'],['LT RT','Less, more impulse'],
    ['A B X Y','Phasers, torpedo, scan, shields'],['LB RB','Hail, energise'],['Back','Red alert'],['Start','Take the helm; then the orders'],
    ['L3 R3','Standard orbit; the camera'],['D-pad','Dock, all stop, the star chart, cartography']])W.keys.add(k,t,'Gamepad');
  let n=0,was={},name='';
  addEventListener('gamepadconnected',e=>{n++;name=e.gamepad.id;W.toast&&W.toast('Helm',' A gamepad is at the helm: '+e.gamepad.id.replace(/\s*\(.*$/,'')+'. ? lists its buttons.');});
  addEventListener('gamepaddisconnected',()=>{n=Math.max(0,n-1);if(!n){W.helmAxes('pad',null);was={};}});
  W.animHooks.push(()=>{if(!n||!navigator.getGamepads)return;
    let gp=null;try{gp=[...navigator.getGamepads()].find(g=>g&&g.connected);}catch(e){return;}
    if(!gp){W.helmAxes('pad',null);return;}
    const ax=gp.axes,b=gp.buttons,v=i=>b[i]?(typeof b[i]==='object'?b[i].value:b[i]):0,p=i=>b[i]&&(b[i].pressed||v(i)>0.5);
    W.helmAxes('pad',{turn:-dz(ax[0]||0),pitch:dz(ax[1]||0),roll:dz(ax[2]||0),thr:-dz(ax[3]||0)+(gp.mapping==='standard'?v(7)-v(6):0)});
    const now={};for(const i in BTN){now[i]=p(+i);if(now[i]&&!was[i]){W.gesture&&W.gesture();W.audio&&W.audio();try{BTN[i]();}catch(e){console.error(e);}}}
    was=now;});
  return {state:()=>({pads:n,name})};
}
