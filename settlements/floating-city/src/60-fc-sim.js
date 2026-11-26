// ================================================================= FLOATING CITY — Voth-Scale Imperial Capital Economy & 30-Day SIM [G data]
// Models the 44,000-citizen metropolitan economy (38,500+ on-screen capacity, 9,600+ households) across 4 polities,
// 6 regional workshop chains (including Indigo-Silk Dyeworks fed by the 20 Floating Chinampa Garden Rafts!),
// 16 Upland Terraced Farms, and 6 river/sea trade corridors.
const FC_SIM = (function () {
  'use strict';

  const CHAINS = [
    {
      id: 'pioneer-hydro-dynamo',
      polity: 'Pioneers (PN-12)',
      inputs: { superconductors: 1.2, silk: 2.4, sap_varnish: 1.5 },
      outputs: { electrics: 36.0, lenses: 4.2 }
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
      id: 'indigo-silk-dyeworks',
      polity: 'Chinampa Indigo & Suudme Silk Guilds',
      inputs: { silk: 5.5, dye_indigo: 8.5, electrics: 2.0 },
      outputs: { dyed_silk: 9.5, cloth: 4.5 }
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
    { id: 'route_heartland_riwa',   partner: 'Heartland and Ma-Kou (Riwa-Wata)',      imports: { food: 48.0, ria_amber: 4.2, superconductors: 1.5, clay: 16.0 }, exports: { glazed_tile: 8.0, lenses: 1.2, seal_bonds: 4.0 } },
    { id: 'route_upper_ria_truce',  partner: 'Upper Ria and Springhollows',           imports: { silk: 3.5, sap_varnish: 2.0, food: 14.0 },                      exports: { seal_bonds: 2.5, cloth: 2.0 } },
    { id: 'route_suudme_suurneva',  partner: 'East Bluff Suudme-Kuluuna & Suur-Neva', imports: { timber: 18.0, food: 22.0, coal: 9.0 },                          exports: { glazed_tile: 6.0, electrics: 2.5, dyed_silk: 3.5 } },
    { id: 'route_double_delta',     partner: 'Double Delta Harvesters',               imports: { sea_byssus: 9.5, bitumen: 8.0, ria_amber: 3.0, silica: 7.5, food: 18.0 }, exports: { cordage: 3.0, hull_repairs: 3.5 } },
    { id: 'route_western_pincer',   partner: 'Battered Isle and Farport Coasters',    imports: { coal: 4.0, food: 8.0 },                                         exports: { lenses: 2.2, seal_bonds: 3.5, cloth: 3.0, dyed_silk: 3.5 } },
    { id: 'route_crook_drownlands', partner: 'Crookshore (HK) and Drownlands (Arks)', imports: { nephrite_jade: 2.8, paktong: 4.8 },                             exports: { cordage: 3.5, hull_repairs: 3.0, seal_bonds: 2.0, cloth: 3.5 } }
  ];

  let _cachedHarvest = null;
  function measureFarmHarvest(plan) {
    if (!plan && _cachedHarvest) return _cachedHarvest;
    const P = plan || (typeof FC_CITY !== 'undefined' && FC_CITY.buildPlans ? FC_CITY.buildPlans() : null);
    let chinampaFood = 0, chinampaSilk = 0, chinampaDye = 0, chinampaCount = 0;
    let uplandFood = 0, uplandSilk = 0, uplandCount = 0;
    if (P && P.gardens) {
      chinampaCount = P.gardens.length;
      for (let i = 0; i < P.gardens.length; i++) {
        const H = P.gardens[i].harvest || {};
        chinampaFood += (H.food == null ? 0 : H.food);
        chinampaSilk += (H.silk == null ? 0 : H.silk);
        chinampaDye += (H.dye_indigo == null ? 0 : H.dye_indigo);
      }
    }
    if (P && P.uplandFarms) {
      uplandCount = P.uplandFarms.length;
      for (let i = 0; i < P.uplandFarms.length; i++) {
        const H = P.uplandFarms[i].harvest || {};
        uplandFood += (H.food == null ? 0 : H.food);
        uplandSilk += (H.silk == null ? 0 : H.silk);
      }
    }
    const res = {
      chinampaCount: chinampaCount,
      uplandCount: uplandCount,
      chinampaFood: +chinampaFood.toFixed(2),
      chinampaSilk: +chinampaSilk.toFixed(2),
      chinampaDye: +chinampaDye.toFixed(2),
      uplandFood: +uplandFood.toFixed(2),
      uplandSilk: +uplandSilk.toFixed(2)
    };
    if (!plan) _cachedHarvest = res;
    return res;
  }

  function createEconomy(opts) {
    opts = opts || {};
    const simUrbanPop = opts.simUrbanPop == null ? 44000 : opts.simUrbanPop;
    const onScreenPop = opts.onScreenPop == null ? 38500 : opts.onScreenPop;
    const households = opts.households == null ? 9600 : opts.households;
    const farmYield = opts.disableGardens
      ? { chinampaCount: 0, uplandCount: 0, chinampaFood: 0, chinampaSilk: 0, chinampaDye: 0, uplandFood: 0, uplandSilk: 0 }
      : measureFarmHarvest(opts.plan || null);

    const stocks = {
      food: 1250.0,
      water_fresh: 1680.0,
      electrics: 280.0,
      ria_amber: 120.0,
      paktong: 80.0,
      nephrite_jade: 48.0,
      superconductors: 32.0,
      silk: 64.0,
      dye_indigo: 52.0,
      dyed_silk: 44.0,
      sap_varnish: 38.0,
      sea_byssus: 90.0,
      timber: 195.0,
      clay: 225.0,
      silica: 120.0,
      coal: 175.0,
      bitumen: 98.0,
      lenses: 34.0,
      seal_bonds: 135.0,
      cordage: 82.0,
      cloth: 72.0,
      glazed_tile: 155.0,
      hull_repairs: 62.0
    };
    if (opts.sabotageKey) stocks[opts.sabotageKey] = -5000.0;

    /* Daily urban consumption + Floating Chinampa Gardens + Upland Terraces + Lagoon Fisheries for 44,000 citizens */
    const dailyFoodNeed = simUrbanPop / 220.0; /* 200.0/day vs 110 imported + 24 fisheries + ~77 Chinampas + ~50 Upland = +61/day net */
    const dailyWaterNeed = simUrbanPop / 200.0; /* 220.0/day vs +255 Bluff Aqueduct Reservoir intake = +35/day net */

    function stepDay() {
      stocks.food += 24.0 + farmYield.chinampaFood + farmYield.uplandFood - dailyFoodNeed;
      stocks.silk += farmYield.chinampaSilk + farmYield.uplandSilk;
      stocks.dye_indigo += farmYield.chinampaDye;
      stocks.water_fresh += 255.0 - dailyWaterNeed;

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
      /* Civic lighting, funicular eddy-brakes & dockyard maintenance draw */
      stocks.electrics -= 21.0;
      stocks.coal -= 3.5;
      stocks.glazed_tile -= 4.0;
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
        farmYield: farmYield,
        minKey: minKey,
        minVal: +minVal.toFixed(2),
        stocks: Object.assign({}, stocks)
      };
    }

    return {
      simUrbanPop: simUrbanPop,
      onScreenPop: onScreenPop,
      households: households,
      farmYield: farmYield,
      stocks: stocks,
      stepDay: stepDay,
      runDays: runDays
    };
  }

  function installOnSim(planOut) {
    const econ = createEconomy({ plan: planOut });
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
    measureFarmHarvest: measureFarmHarvest,
    createEconomy: createEconomy,
    installOnSim: installOnSim
  };
})();
