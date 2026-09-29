/* ============================== 99. START ============================== */
updateSky(); updateDayNight();
if(VIEWS.length) VIEWS[0][1](); else setView(260, 170, 420, 0, 10, 0);
frame();
document.getElementById('load').style.display = 'none';
window._ready = true;
