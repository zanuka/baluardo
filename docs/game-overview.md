# Baluardo

**Baluardo** (Italian for *bulwark*) is a watchdesk game about judgment under delay. You are the duty officer on a long interplanetary Quest: triage sensor contacts, keep the spacecraft supplied, and reach the next docking station before the mission fails. Most space command games give you a perfect picture. Baluardo makes uncertainty the gameplay.

## The fantasy

Your craft moves through a sequence of waypoints: docking stations, anomalies, and star systems. At each stop you can restock, learn about where you are, and handle whatever the sensors throw at you. Between stops, consumables tick down: propellant, oxygen, rations, spare parts, and crew condition. Run out of something critical and the Quest ends.

The watchdesk never shows the full truth while you play. Sensors report **detections**: contacts with severity, confidence, and freshness. Some are real threats. Some are noise. You will not know for sure until the debrief.

## What you do

You sit at a command console and respond to a live detection feed while managing the journey. The primary input is a persistent command line, not a wall of buttons.

**Type your orders.** Baluardo deliberately echoes the feel of classic text-driven games: the resource pressure and landmark-to-landmark travel of *The Oregon Trail*, and the typed-command, parser-reply loop of adventure games like *Space Quest I*. You enter short commands (`ACK 42`, `STATUS`, `ADVANCE`, `DOCK`, `HUNT SIGNAL`, `QUERY Kepler-22b`) and the console answers in plain text: current supplies, what actions are available at this waypoint, what went wrong, and what you can try next. Structured verbs are always available for speed and clarity.

**Talk to the watchdesk.** As the Quest grows, free-text input works too. Type what you mean in natural language and a text parser (built on modern AI chat) interprets your intent, maps it to a valid game action, and replies with the same conversational back-and-forth those older games used: confirmation, clarification, or a short list of choices when your wording is ambiguous. An optional chat panel can serve lore queries, supply advice, or an in-character watch officer who faces the same latency and incomplete knowledge you do.

That chat layer is powered by [Strumentario](https://github.com/zanuka/strumentario), a sibling open-source project that exposes game knowledge and command intelligence through an MCP instrument server. Strumentario keeps the parser, knowledge tools, and chat surface aligned so typed commands and conversational input stay consistent. Game state still lives in Baluardo; Strumentario is the instrument layer that helps you speak to it.

**Triage contacts.** Each detection needs a decision: acknowledge it as real, reject it as a false positive, or override with a stronger call. Decisions are not instant. They travel to the edge on a delay that stands in for light-minutes. By the time your command arrives, the contact may have moved, faded, or changed confidence. A choice that looked right when you typed it can look wrong when it lands.

**Manage the journey.** Outfit the craft at the origin, then advance leg by leg. At waypoints you restock under budget, rest to recover crew, ration supplies, or hunt for signals. Short skill challenges (signal intercept, docking alignment, timed triage sprints) can gain or waste resources depending on how you perform.

**Learn as you go.** Facts about galaxies, systems, and planets unlock because you arrived, not because you opened a textbook. Query what you need when planning the next leg, but remember: the same incomplete picture that governs detections governs what you can know in the moment.

## Why it is hard (and fun)

Three pressures stack on every leg:

1. **Latency.** Your last command is still in flight while new contacts appear and supplies drain. Acting fast and waiting both have costs.
2. **Incomplete information.** Confidence rings and freshness fade are hints, not answers. Aggressive rejects and cautious ignores both punish you when you guess wrong.
3. **Resource pressure.** Panic burns consumables. Paralysis burns time. You cannot triage forever and still reach the next station.

The goal is not to click every red marker. It is to decide well enough, often enough, under delay, while keeping the craft alive.

## Strategy

**Prioritize before you commit.** Severity and freshness tell you what deserves attention first, but neither guarantees truth. A stale high-severity contact and a fresh ambiguous one can both be wrong in different ways.

**Account for command delay.** If the edge is minutes away, ask what the contact will look like when your ack arrives, not when you send it. Issuing the same command twice rarely helps; the game treats clear illegal moves as failures, not silent fixes.

**Balance the mission clock and the triage queue.** Some detections must be cleared before you can safely leave a waypoint. Leaving early saves supplies; staying too long burns them. The right call depends on what you still carry and how many legs remain.

**Spend knowledge deliberately.** Waypoint lore and query results help you anticipate hazards and plan restocks. They do not replace sensor judgment. Use them to inform ration levels and route choices, not to skip triage.

**Treat mini-games as supply bets.** Signal hunts and docking runs are optional gambles: skill for consumables, or mistakes for waste. Take them when you can afford a bad outcome; skip or rest when you cannot.

**Learn the parser, then trust your phrasing.** Structured commands are fastest when the triage queue is hot. Natural language shines when you are exploring (`what systems are within one jump?`) or weighing options the console can spell out. If the reply offers choices, pick one explicitly rather than repeating the same vague prompt.

## Winning, losing, and the debrief

A Quest ends when you reach the final station or when survival fails (oxygen depleted, insufficient propellant for the next leg, crew incapacitated, or similar). Short training runs may cover a single watch; full campaigns span several waypoints and take roughly 15 to 25 minutes.

Every session closes with a **debrief**: what was actually out there, what you decided, how delay and resource choices shaped the outcome, what you learned along the way, and a score that weighs survival, judgment, efficiency, and discovery. That after-action view is where the game tells you the truth.

## What Baluardo is not

Baluardo is not a real-time strategy clickfest or a defense-tech simulator. The aesthetic stays closer to an operations console than a cartoon fleet battle, but the input model is intentionally retro: type commands, read replies, choose your next move. Single-player Quests come first; shared watchdesks with other operators are planned once the core loop is solid.

If you want a game where the interesting moment is *deciding under an imperfect, delayed picture while the clock and the oxygen gauge both move*, you are in the right place.
