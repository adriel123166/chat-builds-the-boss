# Chat Builds the Boss

A browser arena game for Twitch. Chat builds a boss, commands its attacks during the fight, and votes for a permanent mutation at half health.

## Run locally

Requires Node.js 20 or newer. No dependencies or build step.

    npm start

Open http://127.0.0.1:4174/ . To use a different port in PowerShell, set `$env:PORT` before starting. To run gameplay tests:

    npm test

## Round flow

1. Open voting: 30 seconds to choose attack, weakness, and appearance. Each viewer has one changeable vote per trait. Ties use the first listed choice. The host can lock voting early.
2. Enter the arena: 60 seconds of active combat. WASD/arrows move, hold Space to auto-aim and shoot, Shift plus a movement direction dashes. Dash recharges in two seconds. Touch buttons are available on touch devices.
3. During combat, chat votes `!laser`, `!orbit`, or `!charge` in successive ten-second windows. Each account gets one changeable vote per window. The winning attack replaces the pattern for the next window. No votes keeps the current attack. Ties prefer the current attack if tied, otherwise the first tied option. The HUD credits voters who selected the winning attack.
4. At 50% boss health, attacks clear and the arena pauses for an eight-second mutation ballot. Neither the combat timer nor the pending attack ballot advances. Damage is clamped at half health so a volley cannot skip the vote.
5. Mutation commands: `!split` adds six projectiles per attack that split into twelve; `!twin` echoes each attack once with its own warning; `!haste` shortens attack cooldowns by 25% and increases projectile/charge speed by 20%. The selected mutation lasts for the rest of the fight. Ties use the first tied option; an empty vote selects Splinter shots. Combat resumes with a warning buffer and brief player protection.
6. Defeat the boss to win. Running out of time or health gives chat the win. Community score = active combat seconds survived × 100 + damage to player × 25. Run it back starts a fresh round and clears all ballots and mutations.

## Twitch setup

The game reads the signed-in broadcaster's own channel, using a browser-only OAuth implicit flow and EventSub WebSocket transport.

1. Register a Public application in https://dev.twitch.tv/console/apps .
2. Open Connect Twitch in the game and copy its exact redirect URL into the application's OAuth Redirect URLs. Register both localhost and the deployed origin if using both.
3. Paste the application's public Client ID into the game. Never enter a client secret.
4. Authorize as the broadcaster. The only requested scope is `user:read:chat`.
5. Start a round and have another Twitch account send commands in your channel. The game does not post chat messages; explain the commands on stream.

Tokens remain in tab memory and are removed from the callback URL immediately. Refreshing requires signing in again. Client ID and a temporary CSRF state are stored in sessionStorage. The connector validates authorization, handles EventSub reconnects, deduplicates notification IDs, and checks token expiry. This release still needs a real broadcaster's end-to-end authorization/chat test.

Live rounds reject simulated and manual votes, even if Twitch disconnects. A connection drop cancels a build vote; during combat it clears unfinished live ballots. The fight continues and empty attack ballots keep the current pattern. An empty mutation ballot uses Splinter shots. Reconnecting resumes live voting. No raw chat HTML is rendered.

## Practice and streaming

Simulated chat is explicitly labeled and can be turned off between rounds. With it off, use the cards during the build phase and the live command buttons or command field during combat. Local test votes all belong to one viewer, `you`.

Use Stream view and OBS Window Capture on the same game window. This is not a synchronized separate OBS Browser Source. Keep the window focused for keyboard controls. Leaving the tab pauses combat and its ballots until Resume. Help and connection dialogs also pause combat.

Sound starts off. The game respects reduced-motion preferences by suppressing camera shake, particles, trails, hit flicker, damage floats, and decorative motion while retaining attack indicators.

## Source

- `dist/core.mjs`: deterministic combat model and ballots.
- `dist/app.js`: UI, practice crowd, input, original canvas artwork, sound and effects.
- `dist/twitch.js`: OAuth and Twitch EventSub client.
- `dist/index.html`, `dist/style.css`: responsive control desk and stream view.
- `test.mjs`: gameplay and voting regression tests.
- `serve.mjs`: dependency-free local server.

Fonts load from Google Fonts with system fallbacks. All game art is drawn locally with canvas; there are no image generation or runtime AI dependencies.

## v0.3 hard-mode tuning

Default difficulty now uses 750 HP for Glass core and 1080 HP for other bosses. Player shots have a 0.22-second cooldown. Initial windups are 0.5 seconds and mutation windups are 0.38 seconds. Attack-name warning popups and advance warning tones have been removed; faint, short targeting cues remain. Live vote choices and mutation announcements still appear.

Lasers sweep during their 0.72-second firing window. Bullet bloom fires 22 shots before mutation and two offset 26-shot rings afterward. Mutated charges leave perpendicular wake projectiles. Second-phase attack cooldowns shorten by another 18%, alongside the chosen mutation. Body squash/stretch, recoil, charge afterimages, projectile trails, and boss collapse animations honor reduced-motion preferences.

## v0.4 chat arsenal

A separate 12-second wildcard ballot runs alongside the 10-second attack ballot. Each viewer has one changeable vote in each. Commands: !rage (4s shorter cooldowns and 25% faster new projectiles/charges), !barrage (12 hostile bullets), !shield (4s half damage to boss), !scramble (2.5s reversed movement), !heal (one heart, two successful uses per round), !cleanse (clear hostile bullets and queued rings, two uses per round). Empty wildcard ballots do nothing; ties choose the first tied command in displayed order. A heal at full health does not consume a use. Both wildcard voting and active effects freeze during mutation and host pauses. Disconnects clear all unfinished ballots. Round resets clear effects and usage caps. Score now tracks cumulative hits, including hits later healed.

The command guide and practice buttons show the same rules. Simulated chat can vote on either ballot; real Twitch rounds accept only Twitch account votes. Real Twitch chat was tested with the broadcaster account.

## v0.5 duck evolution

The duck has three original forms: Angry Duck → Stormwing → Quacklord. Defaults are 8 and 16 unique voting viewers per round; edit Duck evolution goals before opening voting. Each account counts once after its first accepted command, including build votes carried into combat. Repeated commands, updated votes, invalid commands, late messages after results, and practice-form previews do not increase participation. In practice, demo viewer identities count distinctly and local test votes all count as one viewer. Real Twitch rounds continue to exclude practice votes.

Stormwing has feathered cyan wings and a crest, 10% shorter attack cooldowns and 8% faster new projectiles/charges. Quacklord has purple armored wings and a gold crown, 20% shorter attack cooldowns and 16% faster new projectiles/charges, plus six extra feather shots per attack. Forms never refill boss HP. Each combat evolution pauses the combat clock, ballots, and effects for two seconds and clears attacks for the reveal. Evolution waits until a mutation ballot ends, and multiple unlocked stages reveal in order. Dog and cat bodies evolve through their own three-stage lines. Reduced motion uses a static reveal without burst particles or expanding rings. The lobby has clearly labeled art previews that do not affect votes or the next fight. All goals, forms, and participation reset at the start of a new round.

## Outcome messages

Result presentation now distinguishes defeating the boss (STREAMER WINS), reaching the time limit alive (STREAMER SURVIVED, with the boss still undefeated), and losing all health (CHAT WINS by knockout). The result model stores explicit reason/outcome fields. Existing winner/scoring rules are retained, and survival does not play the boss-defeat animation. Headline, caption, activity-feed message, accent color and sound differ by outcome.

## v0.6 evolving creatures

Cosmic slime is replaced by Ruff Pup → Stormhound → Howlking (!dog); Scrap robot is replaced by Mischief Kit → Moonclaw → Astralynx (!cat). The duck remains available. Every species shares the configured 8/16 unique-voter goals, safe two-second evolution reveal, preserved HP and evolution combat bonuses. The form preview now has a species selector and all three forms per species. Legacy !slime and !bot body votes map to !dog and !cat, respectively. Live Twitch integration and outcome messages are retained. Refreshing the game to load the update requires reconnecting to Twitch because tokens remain in memory only.

## Evolution difficulty

Each unique chat participant counts once per round. At form II, attacks come 10% faster with shorter warnings, denser orbit rings, and four extra projectiles per attack. At form III, attacks come 20% faster, warnings shrink further, laser sweeps speed up, orbit rings grow denser, and every attack adds ten projectiles. Projectile and charge speed also increase by 8% and 16%. Evolution never refills boss health.
