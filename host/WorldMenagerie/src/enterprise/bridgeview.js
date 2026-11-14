// ---------- Galaxy class: the view from the bridge ----------
// Fan work. Star Trek belongs to Paramount. The camera and its LCARS chrome are the shared ones
// (src/starship/bridge.js); this says where the Galaxy class's bridge is and what the foot of the screen reads.
//
// The eye is at the head of the bridge module's forward windows, on top of the saucer, looking out over the dish
// ahead and a little down, so the hull's curve is in the foot of the view and the stars fill the rest. At the
// turntable it is the page's own bridge view (drag to look round); at the helm, V cycles the helm's cameras and its
// bridge camera uses the same eye (W.bridgeEye), and the chrome goes up with either.
import {SAUCER} from './dims.js';
import {MODTOP} from './hull.js';
import {warpC} from './flight.js';

export function bridgeview(W){
  const {THREE,SAU,BANK}=W,S=W.flight,MD=SAUCER.module;
  const EYE=new THREE.Vector3(MD.x+MD.fore+1.2,MODTOP+0.2,0);
  W.bridgeEye=v=>SAU.localToWorld(v.copy(EYE));
  const readout=()=>{
    const h=W.heading(),hd=String(h.hd).padStart(3,'0'),red=W.redAlert&&W.redAlert();
    const sp=S.warp?'Warp '+S.warp+' · '+Math.round(warpC(S.warp)).toLocaleString('en')+' c':S.on?(S.v>=1000?(S.v/1000).toFixed(1)+' km/s':Math.round(S.v)+' m/s')+' · impulse '+Math.round(S.thr*100)+'%':'Station keeping';
    const o=W.orbitInfo&&W.orbitInfo(),pl=W.herePlace&&W.herePlace();
    const hull=W.damage?Math.round(W.damage().hull):100;
    return (red?'RED ALERT · ':'')+sp+' · heading '+hd+' mark '+h.mk+(o?' · orbit '+o.name+', '+o.h+' km':pl?' · '+pl.P.name:'')+(hull<100?' · hull '+hull+'%':'');
  };
  return {
    title:'USS Enterprise · NCC-1701-D · main viewer',down:0.045,
    eye:v=>W.bridgeEye(v),
    // the bank is between the course and the ship, so the bridge leans with her
    quat:o=>BANK.getWorldQuaternion(o),
    readout,
    active:()=>S.on&&S.cam==='bridge',
    // at the helm the helm's own bridge camera is the way in (it follows the turn and the bank as she flies)
    enter:()=>{if(!S.on)return false;S.cam='bridge';S.fb=null;S.shot=null;W.onCam&&W.onCam(S.cam);return true;}};
}
