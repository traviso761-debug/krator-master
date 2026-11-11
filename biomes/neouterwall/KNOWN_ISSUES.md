# neouterwall — known issues

Every station of PLAN.md section 7, built 2026-11-10 in a cloud session on the branch `claude/neouterwall-s1`: 1 Vitreous Hollow
(`dist/neouterwall.html`), 2 the Garnet-Mirror Cauldron (`-garnet`), 3 the Epidote Badlands (`-badlands`), 4 the Gate Shoulder (`-shoulder`),
5 the Epidote-Steam Tarn (`-steam`), 5a the Portal (`-portal`).

- [ ] **The real-GPU verify is owed.** The cloud has no GPU: both pages were checked with `verify.py --assert --all-views` in software
      GL (SwiftShader) only. Run it on the owner's machine before the merge (`python3 verify.py dist/neouterwall.html --assert --all-views`
      and the same for each `dist/neouterwall-<station>.html`, on either lane), and set the impostors' gain (`IMP_GAIN` in `src/89z-host-build.js`, 2.4 as the W outer wall's) against the near
      woods there. The page's frame cost and the tarn's look (its depth colour, the springs' ramps against the ground's sinter) are judged
      on the GPU only.
- [ ] **The skarn has no texture yet.** Station 2's garnet red is a tint over the stand-in (`SITE.rockTint`). The cauldron's walls are `rock.megabreccia` under KSTRATA's `megabreccia` recipe (the impact
      rim's host rock, which the plan puts under the skarn): honest for the rim, wrong for Korona's aureole. Owed: the texture
      `rock.skarn.banded` (`core/materials/PROMPTS-NEEDED.md`, section 48) and the plan's amendment 1, a skarn recipe for `KSTRATA`
      (lensing bands of epidote, garnet, magnetite and marble; `KSTRATA.vary` is CPU-only, so the shader cannot draw them yet).
- [ ] **Station 4's mirror scarps are a stand-in.** The slumps' head scarps are the `scarp` zone, drawn as the wall's rock darkened to
      near black: no gloss, no slickensides. Owed: the texture (`rock.pseudotachylite.mirror`, PROMPTS-NEEDED.md section 48) and the rock
      glaze (the plan's amendment 5). The citadel the outlandgate plan proposes on the shoulder is not drawn (that kit's and the owner's).
- [ ] **The Epidote Cave is walked at one place.** Station 5b is the Marble Hall and 400 m of cave round it (the cave page); the Inner
      Mouth (5) and the Portal (5a) are `KCARVE` alcoves 50 and 35 m deep that open onto nothing. The other 70 km of passage are the scale
      model's record only, and the three pages are not joined (no walk from the Portal to the hall to the tarn).
- [ ] **The cave's network is a hypogene maze round the hall, not the record's line.** `tube_epidote_16` is one passage from the Portal to
      the Inner Mouth; the page's `KKARST` network is a 1.8 km maze on the fault's strike, cropped round the hall. Its lower storey sits 80 m
      under the hall (the plan's lower level only falls toward the tarn under the cauldron's rim, 8 km south); that storey's water is warm
      (the pools read under 45 °C: none scalds) and its temperature, 14 °C rock cooled by meltwater, is the plan's proposal.
- [ ] **The cave page's marble and skarn are stand-ins.** `rock.marble.white` for the skarn's marble band, `rock.gossan` for its
      iron-stained bands round it (the skarn's own texture, section 48 of PROMPTS-NEEDED.md, is owed).
- [ ] **The cave page has no lamp-lit verify on the GPU yet**: its look (the haze, the lamp's reach in a 240 m hall, the gypsum's glow) is
      judged on the GPU only.
- [ ] **Station 5's walls are a 1 km bicubic face.** The tarn's ring rises ~4 km within one cell of the water: on the page a smooth
      75-degree face over the apron, not the stepped skarn cliffs; the Inner Mouth is cut in its foot. The tube's px (1340,336) is a
      2 km pixel; the mouth stands at the wall's foot nearest it.
- [ ] **Station 5a's ice is the snow cover.** The portal's ice (the tube record's "under the portal's ice") is not a `KGLACIER` body;
      the headwall is a 70 m `KRELIEF.scarp` on the model's 25-degree head. The model's climate here reads -8 °C and class Dfb (the
      plan says EF): the page takes the -8 °C (the `ice` zone: the warmest month under 0 °C).
- [ ] **The podocarps are not drawn.** The plan's cauldron forest is "tree ferns and podocarps". The tree fern is the kit's own (50);
      the conifers are the NW outer wall's larch and stone pine, read in place, at both stations. A podocarp (Podocarpus totara,
      Phyllocladus) wants swbay's conifer builder or a species of this kit's own; station 2 (Garnet-Mirror, the wettest) was built
      without it (the owner asked for the station, not the species): it is the next flora item.
- [ ] **The hazards are tags, not KHAZ records.** Each spring is registered with a `heat` hazard tag (as highrift's springs). The page
      does not load `core/hazard`: the night's CO₂ pools on the cauldron's floor (`KHAZ.poolK`, amendment 3), the breaking sinter crust
      (`sink`, amendment 4), the scalding pools' `heat` volumes and the tarn's `drown` are owed with those amendments.
- [ ] **The tarn reflects only the sky.** `WATER.mirror` (core/water ext 58) is not taken: the walls and the dikes do not show in the
      water. A probe-tier mirror over the tarn is the next step once the GPU verify has the frame's cost.
- [ ] **The model's shore is a 1 km grid.** The tarn's cells meet the wall's cells with no shore between them; the station's spring
      apron (44s) is the shore the page draws. Beyond the apron's reach (east of the box, round the tarn's far shores) the mid ground's
      220 m cells show the 1 km model's smooth bowl, and the far walls are the model's slopes with the far crags' noise (45: `farRough`),
      not cliffs. A scale-model edit or a KRELIEF scarp along the cauldron's rim would make them walls.
- [ ] **The page's y = 0 is the tarn, not the model at the pixel.** `region/far.py` takes the tarn's level for BASE ('level') and the
      tarn's WH cell for the climate ('clim'): the shore pixel's own bilinear height is half-way up the wall (3.47 km) and its cell is
      the wall's Dfc (+3 °C). Recorded in `station-vitreous.json` (`site.level`, `site.clim_px`).
- [ ] **Station 2's great wall is the model's slope.** The 4.8-6.3 km north-west wall stands 8-12 km off, on the mid ground's 220 m
      cells and the far land: the 1 km model's bowl with the far crags' noise, not the sheer garnet cliffs of the plan.
- [ ] **Station 3's camp and ore are stand-ins.** The prospectors' camp is a registered flat (no tents: `KCAMP.pitch` needs a culture's
      tent program, and who quarries the skarn is the owner's question, PLAN.md section 9); the magnetite outcrops are rock bodies
      (`KSTACKS.cluster`), not `kits/resources` ore nodes with a grade. The skarn's bands are one tint, not the lensing epidote, garnet,
      magnetite and marble the badlands are named for (the texture and the KSTRATA recipe, above). The gullies are dry (no snowmelt brook).
- [ ] **No fauna, no camps, no ore nodes** at the cauldrons (PLAN.md sections 4-5: the ibex on the dikes, the raptors on the thermals,
      the prospectors' camps and the skarn's nodes are stations 2-3's).
- [ ] **The plan's open questions are still open.** Station 1 settles none of section 9's (the cave's length and keeper, the crest's
      fumaroles, the air curve, the polygon's overlaps, who quarries the skarn, the Hum names): they are the owner's.
