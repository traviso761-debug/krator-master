// ---------- ways joined end to end, quickly ----------
// The engine's joinChains looks through every remaining way for each join, which is fine for a city's few hundred
// arterials and far too slow for every street of Rome (thousands of ways: seconds of the load). This one keeps the
// ways' ends in a map, so each join is a lookup. tol: how near two ends must be (metres) to count as one point.
export function joinFast(lines,tol){const key=p=>Math.round(p[0]/tol)+','+Math.round(p[1]/tol),ends=new Map(),used=new Uint8Array(lines.length),out=[];
  lines.forEach((l,i)=>{if(l.length<2){used[i]=1;return;}for(const k of [key(l[0]),key(l[l.length-1])]){let a=ends.get(k);if(!a)ends.set(k,a=[]);a.push(i);}});
  const take=k=>{const a=ends.get(k);if(!a)return -1;while(a.length){const i=a.pop();if(!used[i])return i;}return -1;};
  for(let i=0;i<lines.length;i++){if(used[i])continue;used[i]=1;let tail=lines[i].slice(),head=[];
    for(;;){const k=key(tail[tail.length-1]),j=take(k);if(j<0)break;used[j]=1;const d=lines[j];if(key(d[0])===k)for(let q=1;q<d.length;q++)tail.push(d[q]);else for(let q=d.length-2;q>=0;q--)tail.push(d[q]);}
    for(;;){const k=key(head.length?head[head.length-1]:tail[0]),j=take(k);if(j<0)break;used[j]=1;const d=lines[j];   // grown backwards, then reversed onto the front
      if(key(d[d.length-1])===k)for(let q=d.length-2;q>=0;q--)head.push(d[q]);else for(let q=1;q<d.length;q++)head.push(d[q]);}
    out.push(head.reverse().concat(tail));}
  return out;}
