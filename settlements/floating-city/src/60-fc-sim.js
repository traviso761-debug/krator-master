// ================================================================= FLOATING CITY — Imperial Capital Economy & 30-Day SIM [G data]
// Models the 24,000-citizen metropolitan economy (16,500 on-screen, 3,800 households) across 4 polities,
// 5 regional workshop chains (`PLAN.md` §5.2), and 6 river/sea trade corridors (`Heartland`, `Upper Ria`,
// `East Bluff Suudme-Kuluuna / Suur-Neva`, `Double Delta`, `Battered Isle / Farport`, `Crookshore / Drownlands`).
const FC_SIM = (function () {
  'use strict';

  const CHAINS = [
    {
      id: 'pioneer-hydro-dynamo',
      polity: 'Pioneers (PN-12)',
      inputs: { superconductors: 1.2, silk: 2.4, sap_varnish: 1.5 },
      outputs: { electrics: 32.0, lenses: 4.2 }
    },
    {
      id: 'amber-seal-mint',
      polity: 'Court of the Amber Seal (AS-01)',
      inputs: { ria_amber: 5.5, nephrite_jade: 2.0, paktong: 1.6 },
      outputs: { seal_bonds: 14.0 }
    },
    {
      id: 'byssus-cordage-loft',
      polity: 'Lower Ria & Suudme Guilds',
      inputs: { sea_byssus: 8.0, timber: 3.0 },
      outputs: { cordage: 11.5, cloth: 6.5 }
    },
    {
      id: 'polychrome-glaze-kilns',
      polity: 'Lower Ria & Suudme Kilns',
      inputs: { clay: 14.0, silica: 6.0, coal: 7.5, electrics: 3.5 },
      outputs: { glazed_tile: 22.0 }
    },
    {
      id: 'delta-bitumen-shipyard',
      polity: 'Floating City Dockyards',
      inputs: { timber: 12.0, bitumen: 6.5, paktong: 2.2, cordage: 3.5 },
      outputs: { hull_repairs: 9.5 }
    }
  ];

  const TRADE_ROUTES = [
    { id: 'route_heartland_riwa',    partner: 'Heartland and Ma-Kou (Riwa-Wata)',       imports: { food: 48.0, ria_amber: 4.2, superconductors: 1.5, clay: 16.0 }, exports: { glazed_tile: 8.0, lenses: 1.2, seal_bonds: 4.0 } },
    { id: 'route_upper_ria_truce',   partner: 'Upper Ria and Springhollows',            imports: { silk: 3.5, sap_varnish: 2.0, food: 14.0 },                      exports: { seal_bonds: 2.5, cloth: 2.0 } },
    { id: 'route_suudme_suurneva',   partner: 'East Bluff Suudme-Kuluuna & Suur-Neva',  imports: { timber: 18.0, food: 22.0, coal: 9.0 },                          exports: { ria_amber: 0.0, glazed_tile: 6.0, electrics: 2.5 } },
    { id: 'route_double_delta',      partner: 'Double Delta Harvesters',                imports: { sea_byssus: 9.5, bitumen: 8.0, ria_amber: 3.0, silica: 7.5, food: 18.0 }, exports: { cordage: 3.0, hull_repairs: 3.5 } },
    { id: 'route_western_pincer',    partner: 'Battered Isle and Farport Coasters',     imports: { coal: 4.0, food: 8.0 },                                         exports: { lenses: 2.2, seal_bonds: 3.5, cloth: 3.0 } },
    { id: 'route_crook_drownlands',  partner: 'Crookshore (HK) and Drownlands (Arks)',  imports: { nephrite_jade: 2.8, paktong: 4.8, water_fresh: 0.0 },           exports: { cordage: 3.5, hull_repairs: 3.0, seal_bonds: 2.0 } }
  ];

  function createEconomy(opts) {
    opts = opts || {};
    const simUrbanPop = opts.simUrbanPop == null ? 24000 : opts.simUrbanPop;
    const onScreenPop = opts.onScreenPop == null ? 16500 : opts.onScreenPop;
    const households = opts.households == null ? 3800 : opts.households;

    const stocks = {
      food: 640.0,
      water_fresh: 920.0,
      electrics: 180.0,
      ria_amber: 85.0,
      paktong: 54.0,
      nephrite_jade: 32.0,
      superconductors: 22.0,
      silk: 36.0,
      sap_varnish: 28.0,
      sea_byssus: 64.0,
      timber: 140.0,
      clay: 160.0,
      silica: 90.0,
      coal: 120.0,
      bitumen: 75.0,
      lenses: 24.0,
      seal_bonds: 95.0,
      cordage: 58.0,
      cloth: 48.0,
      glazed_tile: 110.0,
      hull_repairs: 42.0
    };
    if (opts.sabotageKey) stocks[opts.sabotageKey] = -5000.0;

    /* Daily urban consumption + Crown Bluff reservoir & Riwa-Wata freshwater intake (+118 units/day) */
    const dailyFoodNeed = simUrbanPop / 250.0; /* 96 units/day vs 110 imported + local fish/terraces (+18) = +32/day net */
    const dailyWaterNeed = simUrbanPop / 220.0; /* 109 units/day vs +135 bluff aqueduct reservoir intake = +26/day net */

    function stepDay() {
      stocks.food += 18.0 - dailyFoodNeed;
      stocks.water_fresh += 135.0 - dailyWaterNeed;

      for (let r = 0; r < TRADE_ROUTES.length; r++) {
        const rt = TRADE_ROUTES[r];
        for (const k in rt.imports) stocks[k] = (stocks[k] == null ? 0 : stocks[k]) + rt.imports[k];
        for (const k in rt.exports) stocks[k] = (stocks[k] == null ? 0 : stocks[k]) - rt.exports[k];
      }
      for (let c = 0; c < CHAINS.length; c++) {
        const ch = CHAINS[c];
        for (const k in ch.inputs) stocks[k] = (stocks[k] == null ? 0 : stocks[k]) - ch.inputs[k];
        for (const k in ch.outputs) stocks[k] = (stocks[k] == null ? 0 : stocks[k]) + ch.outputs[k];
      }
      /* Civic & dockyard maintenance draw */
      stocks.electrics -= 18.5;
      stocks.hull_repairs -= 2.0;
    }

    function runDays(days) {
      for (let d = 0; d < days; d++) stepDay();
      let minKey = null, minVal = Infinity;
      for (const k in stocks) {
        if (stocks[k] < minVal) { minVal = stocks[k]; minKey = k; }
      }
      return {
        ok: minVal > 0,
        days: days,
        simUrbanPop: simUrbanPop,
        onScreenPop: onScreenPop,
        households: households,
        minKey: minKey,
        minVal: +minVal.toFixed(2),
        stocks: Object.assign({}, stocks)
      };
    }

    return {
      simUrbanPop: simUrbanPop,
      onScreenPop: onScreenPop,
      households: households,
      stocks: stocks,
      stepDay: stepDay,
      runDays: runDays
    };
  }

  function installOnSim(planOut) {
    const econ = createEconomy();
    const res30 = econ.runDays(30);
    if (typeof SIM !== 'undefined' && SIM && typeof SIM.create === 'function') {
      try {
        const world = SIM.create({ seed: 0xFC7000 });
        return { world: world, proof30: res30, chains: CHAINS, routes: TRADE_ROUTES };
      } catch (e) {
        return { world: null, proof30: res30, chains: CHAINS, routes: TRADE_ROUTES };
      }
    }
    return { world: null, proof30: res30, chains: CHAINS, routes: TRADE_ROUTES };
  }

  return {
    CHAINS: CHAINS,
    TRADE_ROUTES: TRADE_ROUTES,
    createEconomy: createEconomy,
    installOnSim: installOnSim
  };
})();
