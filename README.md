# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/oxizbinance-aox/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/oxizbinance-aox/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An unofficial, open-source, offline guide and tracker for all 55 PlayStation 5
trophies of Grand Theft Auto VI. Static files, no build step, no network: open
`app/index.html` in a desktop browser and it works with the network off.

## What it does

- **Checklist of all 55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze) with
  the official name, description and grade of each, a guide in our own words, and
  the sources each guide draws on, named beside it.
- **Tracker**: tick trophies off; progress is saved in the browser (localStorage)
  and can be exported to a file and imported back.
- **Filters** by kind (story, missable, collectibles, activities, online — the
  game has no online trophies), by grade, by earned/remaining, plus text search.
- **Spoiler setting**: hides the names and descriptions of story trophies until
  they are earned.
- **Roadmap to the platinum** in three stages (story ~60–80h, 100% completion
  ~100h, Strangers & Freaks and cleanup ~10h), built from the official
  descriptions and PowerPyx's roadmap.
- **Missables page**: the one trophy that can be missed (Positive Mental
  Attitude — the Chapter 1 balcony meditation) and why everything else is safe.

## Facts and honesty

The trophy list is the official PlayStation list as published before this bounty
opened (Exophase and PSNProfiles agree on every name, description and grade).
The game launched 19 November 2026, so guides are still being written: where
the exact trigger of a trophy is still being confirmed by the published guides
(Personal Best, Bad Luck I Guess, The Truth Is Out There, Capital Offense, and
parts of Challenging Tank and In The Beginning…), this guide says so instead of
inventing a method. Difficulty 4/10, about 200 hours, one playthrough, no
mission replay, cheats disable trophies and saving — per PowerPyx.

## Run it

Serve `app/` with any static server, or open `app/index.html` directly.
Progress is stored per browser. The `#shot=cover|roadmap|missable|spoiler`
hash loads a seeded demo state used for this entry's screenshots; the plain
page starts empty.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
`/output` and writes `/output/dossier.json` with the vendored make.fun library
(`vendor/makefun-frontend.ts`, unchanged from the kit):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

PowerPyx, PushSquare, KeenGamer, TechForNerd, Vi.ki, GTA Scoop, Exophase,
PSNProfiles — listed per trophy inside the app. Unofficial fan work, not
affiliated with Rockstar Games, Take-Two Interactive or Sony. No game art,
logos or screenshots are used; the look is our own.
