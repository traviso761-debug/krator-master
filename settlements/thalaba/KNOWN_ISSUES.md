# settlements/thalaba: known issues

- [ ] **The Dalab mission is drawn as stand-ins.** The owner wants it in Dalab's style; no kit on Xanadu's page draws Dalab's
  buildings (Dalab's own build checks its copies against the Iziz Vernacular). Its three buildings (the genepriests' house, the
  seed and specimen house, the lodging for the hired men) are rendered boxes at their boxes, registered as stand-ins
  (`dalab_standin`), with a yard wall. To do: a Dalab piece set (or the Vernacular's, if Dalab's style is that) sealed into
  this page.
- [ ] **The people are estimates.** `TB_PEOPLE` in `targets/town/89zt-tb-site.js` gives each building a household; the town
  holds about 2,700 against the plan's 2,400 (`verify.py` reports it as a budget). To calibrate: the households, or the house
  blocks' density (the frontage-courts `garden`, `infill.yard` and `gaps` options).
- [ ] **The Siṭēps are on the riser's toe, not the riser.** The riser proper (4-7 %) is 4-8 km north of the pin, beyond the near
  ground; the page's terraces step the gentle ground north of the spring line (2 %), 1.8 m treads. The riser and the mouth are
  the far land's coarse mesh.
- [ ] **The springs are the plan's.** The spring line at the riser's foot is the owner's choice and the plan's reasoning (the
  river's water out of the mouth's gravels); the model carries no spring records.
- [ ] **The far land is one coarse mesh** (500 m cells, coloured by height and slope): the gorge's walls read as a pale snowy ridge
  in the haze; Gāḍz-Phōl is a white streak along the Āirã Siṭrīm's steep reach, not a core/water fall. The model's rivers there
  lie on the gorge's east flank, not in its trough (PLAN.md section 8).
- [ ] **The flora is the Vale of Xanadu's**, bound as its open vale (parkland, orchards) for the bench's Cfb at 1,500 m; the
  page's own sprinkling of figures is Xanadu's. Godshearth's Hearths are up in the caldera, not here.
- [ ] **Not yet:** interiors, the life layer on core/simulation, the Godot export, the gallery.
