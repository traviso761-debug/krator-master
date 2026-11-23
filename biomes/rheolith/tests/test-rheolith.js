// node biomes/rheolith/tests/test-rheolith.js — unit tests + negative controls for RHEO_PHYS (PLAN.md sections 1, 4, 6.3a, 7)
'use strict';
const fs = require('fs');
const path = require('path');
const T = require('../../../tools/ktest.js')(__filename);

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', '40-rheolith-phys.js'), 'utf8');
const fn = new Function(SRC + '\nreturn { RHEO_PHYS: RHEO_PHYS, RHEO_SITES: RHEO_SITES };');
const { RHEO_PHYS: P, RHEO_SITES: SITES } = fn();

// ---- 1. Viability window (180-550 degC, concentrated acid / low water activity)
const wOpt = P.windowAt({ tempC: 310, waterActivity: 0.03, acidPh: 1.0 });
const wLava = P.windowAt({ tempC: 1100, waterActivity: 0.0, acidPh: 1.0 });
const wColdDry = P.windowAt({ tempC: 30, waterActivity: 0.08, acidPh: 2.0 });
const wRain = P.windowAt({ tempC: 28, waterActivity: 0.85, acidPh: 5.5 });
const wEdgeLo = P.windowAt({ tempC: 185, waterActivity: 0.05, acidPh: 1.4 });
const wEdgeHi = P.windowAt({ tempC: 540, waterActivity: 0.05, acidPh: 1.4 });

T.ok('optimal 310 degC vitriolic fumarole is active near peak k', wOpt.viable && wOpt.state === 'active' && wOpt.k > 0.9, JSON.stringify(wOpt));
T.ok('1100 degC molten basalt calcines siloxanes and collapses zeolites', !wLava.viable && wLava.state === 'calcined' && wLava.k === 0, JSON.stringify(wLava));
T.ok('30 degC dry ash vitrifies rheoliths into dormant glass', !wColdDry.viable && wColdDry.state === 'vitrified' && wColdDry.k === 0, JSON.stringify(wColdDry));
T.ok('28 degC monsoon rain hydrolyses siloxanes to dead opal', !wRain.viable && wRain.state === 'hydrolysed' && wRain.k === 0, JSON.stringify(wRain));
T.ok('310 degC optimum beats both 185 degC and 540 degC window margins', wEdgeLo.viable && wEdgeHi.viable && wOpt.k > wEdgeLo.k && wOpt.k > wEdgeHi.k, wEdgeLo.k + ' / ' + wOpt.k + ' / ' + wEdgeHi.k);
T.neg('viability rejects neutral wet surface water', x => P.windowAt(x).viable, { tempC: 45, waterActivity: 0.9, acidPh: 6.2 }, { tempC: 300, waterActivity: 0.04, acidPh: 1.1 });
T.neg('viability rejects magma contact above 600 degC', x => P.windowAt(x).viable, { tempC: 680, waterActivity: 0.01, acidPh: 1.0 }, { tempC: 340, waterActivity: 0.03, acidPh: 1.0 });

// ---- 2. Conduit throttling (chokecoral), gagging, over-gag blowout, and Andaru salt ambush
const vBase = { aperture: 0.30, pressure: 0.22, heatMW: 14, tempC: 350, graze: 0.1 };
const cOpen = P.choke({ aperture: 0.65, pressure: 0.1, tempC: 330 }, 2, {});
const cGagged = P.choke(vBase, 14, { gagCake: 1.0 });
const cBlowout = P.choke(vBase, 72, { gagCake: 1.2 });
const cAmbush = P.choke({ aperture: 0.12, pressure: 0.55, tempC: 340 }, 0.15, { fluxSalt: 0.9 });
const cPoison = P.choke(vBase, 12, { gagCake: 1.0, heavyDross: 1.2 });

T.ok('an unthrottled pipe stays open without blast', cOpen.state === 'open' && !cOpen.blast && cOpen.aperture > 0.5, JSON.stringify(cOpen));
T.ok('gag-cake throttles a 350 degC throat silent within 14 hours while charging pressure', cGagged.state === 'gagged' && cGagged.aperture < 0.08 && cGagged.pressure > vBase.pressure && !cGagged.blast, JSON.stringify(cGagged));
T.ok('leaving a gagged throat 72 hours shatters the collar in a phreatic blowout', cBlowout.state === 'blowout' && cBlowout.blast && cBlowout.heightScale > 2.0, JSON.stringify(cBlowout));
T.ok('salting a primed throat triggers an acid-steam surge within minutes with white SiF4 frost', cAmbush.state === 'salted-surge' && cAmbush.blast && cAmbush.frost > 0.7, JSON.stringify(cAmbush));
T.ok('heavy dross poisons zeolite pores so gag-cake cannot throttle the pipe shut', cPoison.state === 'poisoned' && cPoison.aperture > 0.2, JSON.stringify(cPoison));
T.neg('a gagged pipe must have aperture below 0.08', x => P.choke(vBase, x.t, x.d).state === 'gagged', { t: 1, d: {} }, { t: 14, d: { gagCake: 1.0 } });

// ---- 3. Basal lava-crust buoyancy (foamreef), bronze bell pitch, and seam sabotage
const bReef = P.buoyancy(60, 0.85, { hours: 12 });
const bBare = P.buoyancy(60, 0.0, { hours: 12 });
const bSalted = P.buoyancy(60, 0.85, { fluxSalt: 1.0, hours: 18 });
const bDross = P.buoyancy(60, 0.85, { heavyDross: 1.0, hours: 18 });

T.ok('foamreef keel triples safe crust load and raises staff-tap pitch to a bronze bell', bReef.state === 'buoyant' && bReef.loadKg > bBare.loadKg * 2.8 && bReef.ringPitchHz >= 160 && bBare.ringPitchHz <= 65, JSON.stringify({ bReef, bBare }));
T.ok('flux-salt rots the foamreef keel over 18 hours, dropping pitch and safe load', bSalted.effCover < 0.1 && bSalted.loadKg < bReef.loadKg * 0.4 && bSalted.ringPitchHz < 80, JSON.stringify(bSalted));
T.ok('heavy dross both kills foamreef and weights the crust below bare-plate load', bDross.loadKg < bBare.loadKg, bDross.loadKg + ' vs ' + bBare.loadKg);
T.neg('sabotaged crust fails the buoyant-lane load gate (>= 200 kg)', x => P.buoyancy(60, 0.85, x).loadKg >= 200, { fluxSalt: 1.1, hours: 20 }, { hours: 12 });

// ---- 4. Thermoelectric borehole & gallery sealing (wirevein / scarplug)
const sKnit = P.seal({ sealed01: 0.1, tempC: 300 }, 2.5, { gagCake: 1.0 });
const sDross = P.seal({ sealed01: 0.1, tempC: 300 }, 2.5, { gagCake: 1.0, heavyDross: 0.8 });
const sCold = P.seal({ sealed01: 0.8, tempC: 40 }, 2.0, {});

T.ok('feeding a 300 degC gallery crack gag-cake seals gas leaks past 85% in 2.5 hours', sKnit.state === 'sealed' && sKnit.sealed01 > 0.85 && sKnit.gasLeakK < 0.15 && !sKnit.brittle, JSON.stringify(sKnit));
T.ok('heavy dross turns wirevein brittle and blocks borehole self-healing (kills bit-rot)', sDross.brittle && sDross.sealed01 < 0.2, JSON.stringify(sDross));
T.ok('surface-cold scarplug (< 150 degC) snaps brittle under a pick', sCold.brittle, JSON.stringify(sCold));
T.neg('cold rock cannot self-knit a fresh borehole cut', x => P.seal({ sealed01: 0.05, tempC: x }, 3.0, { gagCake: 1.0 }).sealed01 > 0.5, 45, 310);

// ---- 5. Deterministic byproduct zoning
const zLip = P.byproductAt({ distM: 1.8, tempC: 230, windDot: 0.2, recentFlux: 0.1, slope: 0.5 });
const zSkin = P.byproductAt({ distM: 4.5, tempC: 175, windDot: 0.2, recentFlux: 0.1, slope: 0.3 });
const zEtch = P.byproductAt({ distM: 4.0, tempC: 190, windDot: 0.0, recentFlux: 0.8, slope: 0.3 });
const zApron = P.byproductAt({ distM: 48, tempC: 28, windDot: 0.9, recentFlux: 0.0, slope: 0.1 });
const zCrust = P.byproductAt({ distM: 40, tempC: 45, recentFlux: 0.1, crust: 0.95 });

T.ok('throatcollar peaks right on the hot fumarole mouth', zLip.throatcollar > 0.8 && zLip.throatcollar > zApron.throatcollar, JSON.stringify(zLip));
T.ok('throatskin peaks in the warm 130-225 degC steam ring 3-8 m out', zSkin.throatskin > 0.7 && zSkin.throatskin > zApron.throatskin, JSON.stringify(zSkin));
T.ok('etchhalo blooms around actively flux-grazed vents', zEtch.etchhalo > 0.75 && zEtch.etchhalo > zLip.etchhalo, JSON.stringify(zEtch));
T.ok('staregg xenoliths concentrate on the downwind ballistic ejecta apron', zApron.staregg > 0.7 && zApron.throatcollar === 0, JSON.stringify(zApron));
T.ok('bellblister and combplate require persistent lava crust', zCrust.bellblister > 0.7 && zApron.bellblister === 0, JSON.stringify(zCrust));

// ---- 6. The Ranj volatile-siloxane distribution across East Throne, Zeydanin, Voth pockets, and Hykkousoi
const rEastRift = P.ranjViability({ throatTempC: 330, throatDistM: 38, zeoliteMulch: 0, rainMm: 950 });
const rZeydanin = P.ranjViability({ throatTempC: 28, throatDistM: 1400, zeoliteMulch: 0, rainMm: 3200 });
const rZeyAshOnly = P.ranjViability({ throatTempC: 28, throatDistM: 50, zeoliteMulch: 0, rainMm: 3200 });
const rVothPocket = P.ranjViability({ throatTempC: 275, throatDistM: 42, zeoliteMulch: 0, rainMm: 1550 });
const rVothOffFault = P.ranjViability({ throatTempC: 275, throatDistM: 220, zeoliteMulch: 0, rainMm: 1550 });
const rHykkousoi = P.ranjViability({ throatTempC: 290, throatDistM: 210, zeoliteMulch: 0.85, rainMm: 1750 });

T.ok('East/SE Throne rift seam bears wild Ranj resin abundantly', rEastRift.fruiting && rEastRift.vapour01 > 0.5, JSON.stringify(rEastRift));
T.ok('Zeydanin windward monsoon plantations without a rift throat fail completely', !rZeydanin.fruiting && !rZeyAshOnly.fruiting && rZeydanin.vapour01 === 0, JSON.stringify(rZeydanin));
T.ok('Voth succeeds on isolated ring-fault vent aprons (Spice Isle / Temora) but fails 220 m off the fault', rVothPocket.fruiting && !rVothOffFault.fruiting, JSON.stringify({ rVothPocket, rVothOffFault }));
T.ok('Hykkousoi geyser-dome aprons mulched with damp zeolite vent-sinter fruit reliably at 210 m', rHykkousoi.fruiting && rHykkousoi.vapour01 > rVothOffFault.vapour01 + 0.25, JSON.stringify(rHykkousoi));
T.neg('Ranj fails if planted right inside the scalding 3 m fumarole throat', x => P.ranjViability(x).fruiting, { throatTempC: 340, throatDistM: 3, rainMm: 950 }, { throatTempC: 340, throatDistM: 36, rainMm: 950 });

// ---- 7. Site record sanity (Station 1: The Breached Throat)
const st = SITES.throat;
T.ok('Station 1 site record carries {px, py} sky coordinates, breached pit, 5 vents, 2 acid springs, and crust bench', !!st && st.sky && Number.isFinite(st.sky.px) && Number.isFinite(st.sky.py) && st.pit.throatT > 300 && st.vents.length === 5 && st.springs.length === 2 && st.crustBench.reefCover > 0.5, JSON.stringify(st && st.sky));

T.done();
