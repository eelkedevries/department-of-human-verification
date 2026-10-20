# Normal questions, unreasonable objects

**Design brief — 20 October 2026. Candidate sets only: no new artwork is published yet.**

The Department asks completely ordinary CAPTCHA questions. The images are a mixture of normal category members, contextually bizarre but recognisable category members, and borderline category cases. The question is the straight man; the images provide the humour. Photographic absurdity should look intentional and locally plausible, not like indiscriminate glitch art. All new grids use **“Select all…”** and allow multiple selections.

## Visual generation guidance

Use **realistic, object-appropriate natural environments** rather than neutral studio backgrounds by default. Keep the surrounding world unremarkable even when the object is absurd. Across each grid, aim for comparable soft lighting, framing, object scale, background clutter and image quality, while allowing logically different locations (a bicycle on a street, an exercise bike in a gym, a rocking horse in a nursery). Avoid extra category members in the background.

The full rules, **C01 background-by-background examples**, generation-prompt pattern, current 512 px pipeline specifications and manual review checklist are in [Stimulus photography and background guidelines](stimuli.md#stimulus-photography-and-background-guidelines). Apply these to all new candidate images before publication.

## Candidate grids (nine images per row)

Each row specifies **2 ordinary clear members (O), 2 bizarre but clear members (B), 3 borderline judgements (?) and 2 clear non-members (N)**. These labels are **design hypotheses** to be checked by independent raters, not assertions of universal correctness. Do not show the labels to players.

| ID | Ordinary CAPTCHA instruction | O: normal (2) | B: bizarre but still members (2) | ?: debatable (3) | N: non-members (2) | Useful dimensions |
|---|---|---|---|---|---|---|
| C01 | **Select all images containing a bicycle.** | Dutch bicycle; racing bicycle | Square-wheeled bicycle; bicycle with implausibly many saddles | Stationary exercise bike; real horse fitted with bicycle wheels and pedals; pedal-powered office chair | Rocking horse; motorcycle | Form, propulsion, transport, object fusion |
| C02 | **Select all images containing a chair.** | Dining chair; armchair | Chair made of smaller chairs; chair with an implausible number of legs | Toilet with chair back; tree stump with armrests; enormous hand-shaped seat | Floor lamp; chest of drawers | Purpose versus sitting affordance |
| C03 | **Select all images containing a duck.** | Mallard; white domestic duck | Duck in office attire; duck riding on bicycle wheels | Rubber duck; goose disguised as a duck; duck-shaped pedal boat | Swan; penguin | Animal identity versus representation |
| C04 | **Select all images containing a car.** | Hatchback; estate car | Car with horse legs instead of wheels; car with absurdly many doors | Foot-powered cartoon-style vehicle; shopping trolley with a tiny driving cabin; full-size toy car | Motorbike; bicycle | Appearance, driving function, scale |
| C05 | **Select all images containing a house.** | Terraced house; detached house | House on chicken legs; habitable shoe-shaped house | Dollhouse scaled for people; caravan on a giant tortoise; treehouse grown around a tree | Office tower; bus shelter | Habitation, portability, scale |
| C06 | **Select all images containing a lamp.** | Desk lamp; floor lamp | Reading lamp lit by an anglerfish; lamp grown from a tree | Glowing mushroom used as bedside light; miniature sun under a lampshade; candle in a desk-lamp housing | Vase; coffee grinder | Function versus manufactured object |
| C07 | **Select all images containing a shoe.** | Trainer; leather dress shoe | Boot with an unreasonable number of toes; shoe assembled from smaller shoes | Banana fitted with laces and sole; roller skate; shoe-shaped house | Handbag; bicycle helmet | Wearability and familiar form |
| C08 | **Select all images containing a clock.** | Wall clock; alarm clock | Clock with 27 hands; melted clock still showing time | Sundial with its own artificial sun; watch strapped to a clock-shaped potato; kitchen timer with no dial | Mirror; decorative plate | Timekeeping versus clock appearance |
| C09 | **Select all images containing a boat.** | Rowing boat; sailing boat | Yacht on walking legs; dinghy with far too many bows | Bathtub with outboard motor; duck-shaped pedal boat; bicycle mounted on a raft | Car; picnic table | Flotation, transport, conventional form |
| C10 | **Select all images containing a computer.** | Laptop; desktop computer | Computer built inside a loaf of bread; workstation with too many monitors | Potato connected to keyboard and screen; mechanical calculator with display; touchscreen typewriter | Radio; toaster | Computation versus user-interface cues |
| C11 | **Select all images containing a musical instrument.** | Violin; trumpet | Piano made of tiny working pianos; bicycle turned into pipe organ | Garden hose used as horn; vacuum-cleaner bagpipes; tuned kitchenware | Gardening spade; bicycle pump | Sound-producing function versus shape |
| C12 | **Select all images containing a vehicle.** | Bus; van | Office chair on tank tracks; limousine with too many axles | Shopping trolley with driver's seat; rideable robotic horse; powered suitcase | Wardrobe; bench | Transport, agency, prototypical form |
| C13 | **Select all images containing a hat.** | Bowler; baseball cap | Hat made of smaller hats; miniature house worn as headgear | Traffic cone worn as a hat; mushroom used as headwear; bicycle helmet | Teacup; table lampshade | Designed purpose versus improvised use |
| C14 | **Select all images containing a bridge.** | Stone footbridge; suspension bridge | Bridge looping through itself; bridge made of giant interlocking arms | Fallen tree across stream; stepping stones; connected boats forming a walkway | Tunnel; staircase | Crossing function versus structure |
| C15 | **Select all images containing a sandwich.** | Cheese sandwich; club sandwich | Sandwich enclosing an entire bicycle; nested sandwich of tiny sandwiches | Two bricks enclosing lettuce; pancake burger; lettuce leaves enclosing sliced bread | Pizza; soup | Bread boundary, construction, filling |

All pictures must have documented provenance and rights-cleared assets.

## Judgement mechanics

A grid is **not** a single-answer puzzle. It has three tile classes: `target` (clear member), `distractor` (clear non-member) and `borderline` (genuinely defensible either way). Only clear members and clear non-members contribute to the “verified” count. A borderline image is recorded as a player's category judgement whether selected or not; never call it wrong or display a red “Not a match” badge. Preserve the selection order and response time. The fictional Department may be disappointed by a horse being classified as a bicycle, but cannot claim an objective verdict on that case.

Example feedback: “The square-wheeled bicycle has been recognised. Its roadworthiness has not.” / “Your classification of the horse is under administrative review.” / “No policy currently exists for pedal-powered office furniture.”

## Design and manipulation principles

- **No funny instructions:** the prompts remain ordinary, literally interpretable and unchanged across image variants.
- **Blend in:** use a consistent realistic photographic look, scale, crop and lighting. An absurd object should be recognisable as the requested type or a plausible borderline case.
- **Separate axes:** visual resemblance to the category, functional resemblance, perceived bizarreness, and category-membership confidence are conceptually distinct. Rate them independently, rather than treating “AI weirdness” as one uniform feature.
- **Systematic comparisons:** construct alternate grids with the same clear members, number of borderline cases, instruction, image quality and appropriately balanced tile positions. Vary one target image property deliberately; do not assume changes from one arbitrary image to another constitute an experiment.
- **Pilot:** obtain human ratings of recognisability and category ambiguity, then reclassify or discard disputed “clear” cases. Extreme grotesquerie and gratuitous shock are not needed.
- **Source of truth:** store individual prompts, seeds, image hashes, labels and decisions in the existing stimulus pipeline. Generated images or edits must be manually reviewed before marking a grid `published`.
- **No V2 work:** the ordinary game does not use a webcam or transmit behavioural data.

## Migration from the current library

The current G01 bicycle grid remains playable until replacement assets exist. The unpublished G02–G10 drafts in `tools/stimuli/source.json` implement the earlier “one objectively correct target per odd task” concept; **do not publish those drafts unchanged**. Replace them with the new normal-instruction/multiple-category-member sets progressively. Once enough are published, show five distinct categories in a session instead of repeating the same bicycle grid. Do not invent image availability or mark a proposed concept as a rendered asset.
