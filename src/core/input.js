// ---------- input: one set of controls for the whole site ----------
// Every page used to read the mouse and keyboard for itself, and the same gesture did different things from
// page to page: the starships turned the other way from the cities, G was fly in the City and a plan view in
// the Backrooms, F flipped the City's cutaway and flew the Flesh Pit, one page had no pinch, one no pan. This is
// the table they all read now, and the two trackers that implement it with the guards every page needs.
//
//   drag             orbit: the world follows the pointer (drag right, the scene turns right), ORBIT_RATE a pixel
//   right/Shift-drag pan;  two fingers: pinch to zoom and pan together;  wheel: zoom
//   W A S D, Q E     move; down and up.  Shift: five times as fast
//   F                fly, or the free camera, where a page has one
//   G                the overhead view, where a page has one
//   X, C             the cutaway on and off, and which side of it you see
//   Esc              close the panels
// Page-only keys stay the page's: the Backrooms' N, M and R, the City's K and P, Iziz's H.

export const BIND={fly:'f',overhead:'g',cut:'x',cutSide:'c',close:'escape',fast:'shift',
  move:{w:'forward',s:'back',a:'left',d:'right',q:'down',e:'up'}};
export const ORBIT_RATE=0.005;          // radians of orbit per pixel dragged
export const FAST=5;                    // what Shift multiplies movement by

// a key typed into a field belongs to the field
export const typingIn=t=>!!t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);

// The held keys, as a Set of lower-case key names (the movement keys and Shift). Any other key goes to
// onKey(k, event) once when pressed; Escape always does, even with a modifier. Keys are ignored while typing,
// and a key with Ctrl, Alt or Meta belongs to the browser. When the window loses focus every held key is
// dropped, because its keyup will never come and the camera would go on moving by itself.
export function trackKeys({onKey,held=['w','a','s','d','q','e','shift'],arrows=false}={}){
  const keys=new Set(),H=new Set(held);
  if(arrows)for(const k of ['arrowup','arrowdown','arrowleft','arrowright'])H.add(k);
  addEventListener('keydown',e=>{
    if(typingIn(e.target))return;
    const k=e.key.toLowerCase();
    if(k==='escape'){if(onKey)onKey(k,e);return;}
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(H.has(k)){keys.add(k);if(onKey&&k!=='shift')onKey(k,e,true);return;}
    if(onKey)onKey(k,e);});
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
  return keys;
}

// Pointers on the canvas. Callbacks, all optional:
//   down(e)                         a pointer went down (a page stops a tour, an animation)
//   drag(dx, dy, {pan, e})          one pointer moved; pan is true for the right button or with Shift
//   pinch(ratio, dx, dy)            two pointers: ratio is old spread / new (above 1 is pinching in: zoom out
//                                   by it), dx/dy how far their midpoint moved
//   wheel(deltaY, e)
//   click(x, y, e)                  a press and release of the main button that did not move
// Returns {active()}: how many pointers are down.
// A pointerup that never arrives (the frame was busy, the pointer left the window, focus went elsewhere
// mid-drag) would leave a pointer in the map that is not on the screen, and every later drag would be taken
// for the second finger of a pinch. So a move with no buttons down ends that pointer, and losing focus ends all.
export function trackPointers(el,{down,drag,pinch,wheel,click}={}){
  const ptrs=new Map();let two=null;
  const spread=()=>{const [a,b]=[...ptrs.values()];return {d:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2};};
  el.addEventListener('pointerdown',e=>{try{el.setPointerCapture(e.pointerId);}catch(_){}
    ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,sh:e.shiftKey,moved:0});
    two=ptrs.size===2?spread():null;if(down)down(e);});
  el.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;
    if(e.buttons===0&&e.pointerType!=='touch'){ptrs.delete(e.pointerId);two=null;return;}
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;p.moved+=Math.abs(dx)+Math.abs(dy);
    if(ptrs.size===2){const s=spread();if(two&&pinch)pinch(two.d/Math.max(1,s.d),s.x-two.x,s.y-two.y);two=s;return;}
    if(ptrs.size>2)return;
    if(drag)drag(dx,dy,{pan:p.b===2||p.sh||e.shiftKey,e});});
  const end=e=>{const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);if(ptrs.size<2)two=null;
    if(p&&click&&p.moved<6&&e.type==='pointerup'&&p.b===0)click(e.clientX,e.clientY,e);};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
  el.addEventListener('contextmenu',e=>e.preventDefault());
  if(wheel)el.addEventListener('wheel',e=>{e.preventDefault();wheel(e.deltaY,e);},{passive:false});
  const clear=()=>{ptrs.clear();two=null;};
  addEventListener('blur',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  return {active:()=>ptrs.size};
}
