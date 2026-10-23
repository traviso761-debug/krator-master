
 // ---------------------------------------------------------------- the API
 // LSSOCK.mark(culture, frame {x, y, z, ry}, sockets [[type, x, y, z, ry, o], ...], key): the sockets declared in the frame
 // (+z out of the wall, +x along it, y up), then filled by that culture's pack (core/sockets' CULT.packs), the pack the
 // page had restored after
 let count=0;
 function mark(cult,F,list,key){const keep=CULT.cur;CULT.cur=CULT.packs[cult]||CULT.generic;
  CMS.length=0;CMS.push(TF(F.x,F.y,F.z,F.ry||0));CM=CMS[0];CURKEY=key||cult;
  for(const s of list)sock(s[0],s[1],s[2],s[3],s[4]||0,s[5]);
  fillSockets();CULT.cur=keep;count+=list.length;}
 return {mark,CULT,SYMBOLS,get count(){return count;},get all(){return SOCK_ALL.length;}};})();
