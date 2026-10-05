/* ============================== 98. START ==============================
   The first view and the first frame, after every fragment has run. They used to close 80-camera.js, so the first frame
   drew before 82-88 and the shared atmosphere module (89, bound in 90) existed: the water shader includes the module's
   wave chunk, which only exists once ATMOS.init has run. Same order as Girder, Mav's Refuge, Locus and Yuni. */
VIEWS[0][1]();
frame();
document.getElementById('load').style.display = 'none';
window._ready = true;
