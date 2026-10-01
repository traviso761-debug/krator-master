// ---------- the address: state kept in location.hash ----------
// Every page keeps its view in the hash so a link brings it back, and several things share it: the camera, the
// hour, the wireframe, a page's own toggles. They used to write it whole - '#v=...&t=...' - and so each wiped
// what the others had put there (#wire=edges lasted until the camera next moved). Here a writer only sets
// its own keys and everything else in the address is kept.
//
// The format is URLSearchParams, with commas left readable and a key with an empty value written bare, so
// '#v=1,2,3&t=12&paused' round-trips as it always has.

export function readHash(){
  try{return new URLSearchParams(location.hash.slice(1));}catch(e){return new URLSearchParams();}
}

// the hash as a string for these params: '#a=1,2&flag', or '' when there is nothing
export function formatHash(q){
  const parts=[];
  for(const [k,v] of q)parts.push(v===''?encodeURIComponent(k):encodeURIComponent(k)+'='+encodeURIComponent(v).replace(/%2C/gi,','));
  return parts.length?'#'+parts.join('&'):'';
}

// Merge `set` into the address: a value replaces that key, null / undefined / false removes it, true or ''
// writes it bare. Keys not named are left alone. Returns the new hash. `order` names keys that go first, so a
// page's main state stays at the front of the address however the keys arrived.
export function mergeHash(set,order){
  const q=readHash();
  for(const [k,v] of Object.entries(set)){
    if(v===null||v===undefined||v===false)q.delete(k);
    else q.set(k,v===true?'':String(v));}
  if(order&&order.length){
    const all=[...q],first=[],rest=[];
    for(const e of all)(order.includes(e[0])?first:rest).push(e);
    first.sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0]));
    return formatHash(first.concat(rest));}
  return formatHash(q);
}

// Write it, without adding a history entry. Does nothing when the address would not change.
export function writeHash(set,order){
  const h=mergeHash(set,order);
  if(h===location.hash||(h===''&&location.hash===''))return h;
  try{history.replaceState(null,'',h||location.pathname+location.search);}catch(e){}
  return h;
}
