# Image sources

The registry of where stimulus images are found: how each source can be reached from agent sessions, its licence model, where to verify an image, known pitfalls and what it has yielded. **Read it before every search. Before finishing, update it whenever a source proves useful or unusable, or its access or terms change.** The [search checklist](CHECKLISTS.md#search-and-selection-raw--suitable) requires both.

Every `source.provider` and `source.catalogue_record.provider` in `catalogue.json` must have an entry under [Evaluated sources](#evaluated-sources), headed with exactly that name. `npm run validate:collection` enforces this, so a new source cannot be registered without being documented here.

Rights checks are quick and proportionate (see [Rights checks during image searches](../docs/stimuli.md#rights-checks-during-image-searches)). A source's status does not replace the short check on each image's own page, but nothing beyond that check is needed. Sources under [Excluded sources](#excluded-sources) are never used; `npm run validate:collection` rejects images whose source or page URL is on an excluded domain.

## How to use the registry

1. Search the recommended sources first, in the order listed. Use index sources only to discover candidates, then trace each candidate to its original publisher.
2. Vary queries with the planned views, settings and colours (see the [set-level variety targets](../docs/stimuli.md#set-level-variety-targets)).
3. In the dated review document, record which sources and queries were searched and roughly how many results were screened.
4. If no source yields images that meet both the clarity standard and the variety targets, see [Generated and edited images](#generated-and-edited-images).
5. Before finishing, update the entries you used: status, access notes, pitfalls, yield and the date last checked. Move a candidate to Evaluated sources once it supplies a registered image, or note why it failed.

## Evaluated sources

### Unsplash

- **Status:** recommended; first choice.
- **Access:** the Unsplash connector (`search_photos`) returns the publisher's record: ID, creator, original dimensions and Unsplash+ (`premium`) flag. Previews download from `images.unsplash.com/<key>?w=1280`. Individual photo pages load through the web fetcher; direct requests to `unsplash.com` are challenged. Related-photo search returned HTTP 400.
- **Searching:** short queries work best; use the `orientation` and `color` filters; exclude `premium` (Unsplash+) results.
- **Licence:** [Unsplash License](https://unsplash.com/license): copy, modify and distribute, including commercially; no sale without significant modification; no compilation into a similar or competing service. The [terms](https://unsplash.com/terms) prohibit use in AI/ML datasets and exclude recognisable people, trademarks and artworks from the licence.
- **Verify on:** the photo page, which names the creator and states "Free to use under the Unsplash License"; its `photo-…` image key must match the reviewed preview URL.
- **Pitfalls:** the CDN may re-encode previews, so the hash changes; accept with `--accept-reencoded` only after visual comparison. Many landscape photographs are too wide for a square crop with margins. Clear three-quarter views are scarce.
- **Yield:** 21 of the 31 suitable bicycle-theme photographs registered directly (27 October 2026). The later search for three-quarter views in open settings screened about 600 further Unsplash results for 4 additions. For the concept pools of themes 2–15 (27 October 2026), about 9,900 Unsplash and Pexels results were screened, mostly from Unsplash, for 110 suitable photographs, 83 of them from Unsplash (three added when the computers theme was redone). Scarce on both sites: wooden decoys floating on water, rubber ducks on a pond, uncluttered free-standing coat stands, floor lamps without a chair beside them, lampshades on their own, saucepans set up as drums, bicycle floor pumps on their own, sundials on window sills, single unmodified shipping containers and side views of long objects (buses, ferries, trains, baguettes) that fit a square crop. Most hat photographs show the hat being worn. Photo pages no longer show original dimensions; take them from the connector record.
- **Last checked:** 27 October 2026.

### Pexels

- **Status:** recommended; second choice.
- **Access:** no connector. Search pages (`https://www.pexels.com/search/<query>/`) and photo pages load through the web fetcher; direct requests to `pexels.com` return HTTP 403. Previews download from `images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=1280` with the project's identifying `User-Agent`.
- **Licence:** [Pexels License](https://www.pexels.com/license/): free use and modification; no sale of unaltered copies; no redistribution on other stock or wallpaper platforms; no implied endorsement by people or brands. The [terms](https://www.pexels.com/terms-of-service/) prohibit standalone distribution (cropping or resizing does not change this) and scraping for machine learning.
- **Verify on:** the photo page, which names the photographer, shows the "Free" label linking to the licence, and gives the photo ID and original size; the ID must match the preview URL.
- **Pitfalls:** search pages return about 24 results per query and later pages are refused (HTTP 410), so run several queries. Alt texts are generic; judge the image itself.
- **Yield:** 5 of the 31 suitable bicycle-theme photographs (27 October 2026). 27 of the 110 suitable concept-pool photographs of themes 2–15 (27 October 2026). Searches for bicycle pumps return only people pumping tyres.
- **Last checked:** 27 October 2026.

### Wikimedia Commons

- **Status:** usable (owner's decision, 27 October 2026); good for documentary photographs and less common objects. Access from cloud agent sessions is limited.
- **Access:** use `tools/stimuli/commons_search.py "<query>"`. It follows Wikimedia's [rate-limit rules](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits): an identifying `User-Agent` with the project URL, one batched API call per page of results (licence, author and 1,280 px preview URL together), `maxlag`, `Retry-After` back-off and one request at a time. Previews, `candidates.json` and a numbered contact sheet are cached in `stimuli/.cache/commons/<query>/`. File pages (`https://commons.wikimedia.org/wiki/File:<name>`) also load through the web fetcher, which is useful for confirming a licence.
- **Cloud limits:** the cloud sessions' shared outbound address is heavily rate-limited. On 27 October 2026 the API answered HTTP 429 with `Retry-After` waits that grew with use (4 s, then 28 s). Image previews were throttled persistently: a 12-image test fetched 2 previews in 15 minutes, and even an already-cached thumbnail returned 429. In practice, previews cannot be downloaded from cloud sessions; use a faster route.
- **Faster routes:** (1) run the tool, or the whole search session, on a local machine, where identified clients get about 200 requests a minute; (2) authenticated requests with a Wikimedia account and a read-only bot password are limited per account (200 a minute for new accounts, 2,000 for established editors) rather than per shared address. Route 2 is not yet implemented; it needs the owner to create the account and add the credentials as environment secrets. It is not yet known whether authentication also lifts the limit on preview images, so route 1 is the dependable one. Never disguise the client (browser `User-Agent`, rotating addresses) and never put personal contact details in the `User-Agent`.
- **Licence:** Commons accepts only free licences: public domain, CC0, CC BY and CC BY-SA, among others. Record the author and licence for attribution; note share-alike (CC BY-SA) as a condition for publishing edited versions.
- **Check on:** the file page's summary and licensing sections. Where the stated author differs from the embedded metadata, record the author named in the summary.
- **Yield:** none yet.
- **Last checked:** 27 October 2026.

### Flickr

- **Status:** usable for Creative Commons and public-domain photographs; found through [Openverse](#openverse).
- **Access:** photo pages (`https://www.flickr.com/photos/<owner>/<id>`) load through the web fetcher. Previews download from `live.staticflickr.com` (the 1,024 px `_b.jpg` size that Openverse returns) with the project's identifying `User-Agent`. Larger sizes have different secret keys and are not returned by Openverse.
- **Licence:** per photograph. Accept any Creative Commons licence or public-domain mark; NonCommercial licences are fine while the project is non-commercial; avoid NoDerivatives for images to be edited. Never use photographs marked "All rights reserved".
- **Check on:** the photo page, which shows the owner and "Some rights reserved" with the licence name. Record the title, owner, licence and licence URL for attribution.
- **Pitfalls:** results are mostly event, travel and people photographs; few are clean single-object shots. Previews of 1,024 px leave little room for square crops of landscape frames (a crop side of at least 512 px is needed).
- **Yield:** 1 of the 31 suitable bicycle-theme photographs (27 October 2026), from about 630 Openverse results screened.
- **Last checked:** 27 October 2026.

### Openverse

- **Status:** index only; useful for discovering Flickr Creative Commons photographs.
- **Access:** the API (`https://api.openverse.org/v1/images/?q=<query>&license_type=modification&category=photograph`) works anonymously from cloud sessions within its limits (about 20 requests a minute and 200 a day); it answered HTTP 429, 500 and 503 at times, so retry with back-off. `source` and `excluded_source` cannot be combined in one request. Results are mostly Flickr, with some StockSnap and Rawpixel; Wikimedia Commons results link to throttled previews (see [Wikimedia Commons](#wikimedia-commons)).
- **Use:** candidate discovery only. Trace every image to its original page and confirm the licence there; the Openverse licence field is not evidence on its own.
- **Yield:** 1 registered photograph, via Flickr (27 October 2026).
- **Last checked:** 27 October 2026.

### Pixabay

- **Status:** limited; search only.
- **Access:** search pages load through the web fetcher, but direct requests to `pixabay.com` and to `cdn.pixabay.com` images return HTTP 403. Previews cannot be downloaded, reviewed or standardised from agent sessions.
- **Licence:** Pixabay Content License, with restrictions on standalone redistribution; content published before 9 January 2019 is CC0 under section 4 of the [terms](https://pixabay.com/service/terms/).
- **Verify on:** the photo page (creator, publication date, licence).
- **Yield:** 2 raw records from the first search, through Pexafy; none currently suitable.
- **Last checked:** 27 October 2026.

### Pexafy

- **Status:** index only.
- **Access:** thumbnails at `thumb.pexafy.com` use signed URLs; they fail without the signature and may expire.
- **Use:** candidate discovery only. Trace every photograph to its original Unsplash, Pexels or Pixabay page. Its `free` label is not evidence of rights.
- **Yield:** the first 20-image search (26 October 2026).
- **Last checked:** 26 October 2026.

### FLUX.2 [klein] 4B local generation

- **Status:** in use for edits and fully generated images (27 October 2026); `source.provider` of every generated asset.
- **Access:** `tools/stimuli/manipulate.py` runs [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) at the pinned revision `e7b7dc27f91deacad38e78976d1f2b499d76a294` on the CPU with Hugging Face diffusers (bfloat16 weights, float32 computation). About 2 minutes per 512 px image from a prompt and about 3 minutes per edit of a 512 px photograph on a 4-core cloud session. Nothing is sent to a service, and inputs are not used for training.
- **Licence:** the model is Apache-2.0; generated images are the project's own output. Edits keep the source photograph's licence and conditions.
- **Use:** impossible ("member-bizarre") and borderline ("member-debatable") objects that no photograph shows. Prefer editing a verified photograph when the edit is reliable; generate from a prompt when it is not. Record the prompt, seed, steps, revision and software (the render sidecar) through `tools/stimuli/register.py ai`, and review every output at tile size: reject accidental artefacts, extra objects and anything that is merely strange rather than readable at a glance.
- **Yield:** 78 registered manipulated masters for the fifteen concept pools (73 generated, 6 edits of photographs) from about 138 renders on 27 October 2026. About half of the first renders failed review (the joke missing, a person added, or extra category members) and were re-rendered once with prompts that name what must be absent; edits of photographs succeeded where generation normalised the object (horse legs on a car, a walking floor lamp, arms rowing a boat). Eight concept items still have no usable image after two attempts (the bicycle with six saddles and the knotted bicycle frame, the mobility scooter in a car body, the curling house wall, the anglerfish lamp, the top hat with a tree, the chain-of-boats bridge and the sandwich holding a roast dinner). The hosted Space (ZeroGPU) allowed about eight free runs a day.
- **Pitfalls:** prompts for impossible geometry (square wheels, six saddles, a knotted frame) tend to come out as ordinary objects, while an edit of a photograph follows the instruction better; "square wheels" tends to come out hexagonal; the word "frame" draws a border; text in images is unreliable; hands and legs need checking. A prompt that places the subject "among" real members of the category (a decoy among ducks) adds real members, which makes the image a plain target; render borderline objects alone. "Arms reading a newspaper" tends to add a person beside the subject, and "a lampshade on a table" a whole table lamp; say "no people" and name what must be absent. Generated images must be labelled as AI-generated (`content_origin: ai-generated`).
- **Last checked:** 27 October 2026.

### existing-repository-catalogue

- **Status:** internal; closed.
- **Use:** the project's own generated G01 images, imported once as a legacy snapshot and removed on the owner's decision of 27 October 2026; only tombstone records remain. Do not add new imports from it (see `AGENTS.md`).

## Excluded sources

Never use these, nor their previews, watermarked comps or images syndicated from them elsewhere. They are commercial stock or editorial agencies that enforce their licences actively. Add any similar agency here when you meet one. The validator reads the `domains:` lists.

- **Getty Images** (including iStock): domains: gettyimages.com, gettyimages.co.uk, gettyimages.nl, istockphoto.com
- **Shutterstock**: domains: shutterstock.com
- **Alamy**: domains: alamy.com
- **Adobe Stock**: domains: stock.adobe.com
- **Dreamstime, 123RF and Depositphotos**: domains: dreamstime.com, 123rf.com, depositphotos.com
- **News and editorial agencies** (for example Reuters, AP, AFP, ANP): no automatic domain list; never use news photographs.
- **Images without a licence statement**: search-engine results, social media, Pinterest and arbitrary websites.

## Unusable from agent sessions

Recorded so that later searches do not repeat failed attempts. Re-test occasionally and update this section.

- **StockSnap and Rawpixel** pages return HTTP 403 to the web fetcher (27 October 2026); their images appear in Openverse results, but licences cannot be confirmed on the image pages from cloud sessions.
- **Openverse API:** timed out once on 27 October 2026, then worked later that day; see [Openverse](#openverse).

## Candidate sources (not yet evaluated)

These are expected to be usable under the proportionate rights check; confirm access and yield, then move an entry to Evaluated sources when it supplies a registered image.

- **StockSnap** and **Burst**: free stock sites; terms not yet checked. StockSnap pages were not reachable from cloud sessions (see above).

## Generated and edited images

When no photograph meets both the clarity standard and the variety targets (for example, clear three-quarter views in settings other than walls), consider:

- **Fully generated images:** the local generator (`tools/stimuli/generate.py`, FLUX.2 [klein] 4B, Apache-2.0), recorded with `content_origin: ai-generated`. Add an evaluated entry here, named as its `source.provider`, before registering the first such image in the collection.
- **AI edits of verified photographs:** the `manipulated` level, recorded with `content_origin: ai-edited-photograph`, with full editing provenance and the source's restrictions on AI training respected.
