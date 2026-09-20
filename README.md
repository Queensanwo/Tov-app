# TOV — Safe and Structured YouTube Viewing for Families and Learners

TOV is an AI-assisted companion for YouTube. It helps children browse and watch safely within rules chosen by their parents, keeps parents involved from anywhere (including TV viewing), and helps students turn scattered YouTube videos into an organised learning journey.

> YouTube should continue to feel familiar. TOV guides, filters and organises the experience without creating unnecessary interruptions.

**Source spec:** `TOV PRD.docx.md` — Product Requirements Document v1.0, 19 September 2026.

## What TOV Is

TOV is a helper for YouTube, not a replacement video platform.

- Applies parent safety rules to searches, recommendations, and selected videos
- Reviews the full video — title, thumbnail, description, spoken words, transcript, visual scenes and themes — not just the title, creator, or opening section
- Skips unsuitable content quietly and continues with a suitable video
- Organises learning videos into levels from current knowledge to a defined goal, reducing repetition and scrolling
- Supports multiple profiles in one family account, with continuity across TV, phone and tablet
- Keeps routine activity on a dashboard; alerts only for what parents choose

Core principles:
1. Keep YouTube familiar
2. Protect quietly
3. Keep parents in control
4. Check every video — no permanent approval for a creator, channel, playlist, or history
5. Use a clean start — new child profile does not inherit old YouTube history
6. Reduce overload, make help optional

## The Problem It Solves

**For parents:**
- Child-friendly titles, thumbnails or cartoon styles can hide unsuitable scenes, language or messages later in the video
- Parents cannot watch every minute, especially on TV or when away
- YouTube recommendations can drift from an approved topic to unrelated content
- Existing viewing history may already contain disliked content, so history cannot be treated as approval
- Parents need control without constant interruption or monitoring

**For students:**
- Search returns many videos repeating the same lesson
- Hard to know which video matches your level or what to watch next
- Long lists and unrelated recommendations feel overwhelming
- Need structure but still want freedom to browse and change path

TOV addresses this by applying family rules per-video and arranging learning videos around a clear goal.

## Target Users

| User | What they can do | Key limit |
|------|------------------|------------|
| **Parent Admin** | Create profiles, choose safety rules, manage screen time, review activity, control TV viewing, invite trusted adult | Main Parent Admin controls permissions and family rules |
| **Child Viewer** | Search, browse, watch, choose approved topics, report uncomfortable content via `I do not like this` | Cannot change safety rules or approve rejected content |
| **Independent Student Admin** | Create/change learning journeys, choose settings, manage progress | Controls own learning and safety preferences |
| **Parent-managed Student** | Manage learning goals and progress | Parent retains safety control for minors |
| **Trusted Adult** | Only the viewing/supervision actions granted by Parent Admin (e.g. view activity, extend time, approve topic, stop playback) | Cannot exceed granted permissions |

## Three Main Modes

### 1. Parent Admin — Set rules and supervise
Create child/student profiles (name + age range), choose themes/words to avoid, choose action for unsuitable/uncertain videos, manage screen time (combined or per-device, weekday/weekend), permissions for Shorts, live, comments, and extra time.

Remotely from own device: see live video, device, active mode, remaining time; pause/stop, change mode, approve topic, extend time, send/save video for later, start a learning journey.

Default recommendation: quietly skip unsuitable video, play next safe video, record on dashboard. Alert for serious concerns only if enabled.

### 2. Child Viewer — Watch YouTube normally, protected quietly
Search (type/speak), browse, watch normally while active profile rules apply in background.

- Safe new topics appear immediately; restricted searches are hidden and recorded for parent
- Rejected video → next suitable video auto-plays, no parent-facing warning to child
- If no suitable video: show approved topics / previously approved videos, notify parent via dashboard
- `I do not like this` stops uncomfortable video, plays safe alternative, informs parent
- Can move between Child Mode and Learning Mode; parent can switch remotely and retains safety control

Special rules: long video unavailable until full review complete; live requires parent approval (unavailable in Child Mode by default); comments hidden unless approved; Shorts per-child rule; paid promotions allowed only if they follow parent rules.

### 3. Student Admin — Learn through an organised journey
Enter topic/goal + number of video options per level (default: 3 if skipped). TOV recommends starting level and creates path showing: starting level, next 3 steps, final goal, estimated time, full outline.

- Recommendations match goal, current level, length/time, teaching style, accuracy, and distinct purpose (no repetition)
- Student can: replace/remove/reorder/add videos, rebuild path, leave path to browse normally and return
- Added videos are checked for goal fit, level, repetition, placement — student decides
- Summaries, simpler explanations, questions, quizzes are optional / off until requested
- Progress shows: completed lessons/levels, next lesson, overall % and time remaining, optional summary/quiz/badge/next goal at end

## Current Development Status

**Status: Product definition complete (PRD v1.0). Pre-implementation — no code yet.**

Defined in this repo:
- [x] Product overview, goals, boundaries, principles
- [x] Users/permissions, onboarding flows, child/student/TV experiences
- [x] Content review rules, dashboards, user journeys
- [x] Formal requirements: PR 01-05, CS 01-08, SV 01-05, PC 01-06, SL 01-08
- [x] Defaults, success measures, risks/safeguards

Planned build order (from PRD §18):
1. Parent Quick Setup and child profiles
2. Video review rules and smooth child playback
3. Parent dashboard and TV controls from parent device
4. Screen time and multiple profile continuity
5. Student learning path creation and progress
6. Optional summaries, quizzes, trusted adult access, extended personalisation

Open decisions for V1:
- Exact age ranges for child profiles
- Which themes in Quick Setup vs More Options
- What qualifies as `serious` for immediate alert
- How many trusted adults per family
- Whether child can switch modes freely
- Which completion rewards in first Student release

> Limitation statement from PRD: TOV is a parent support tool, not a guarantee that every harmful idea will be detected. Decisions must stay understandable, follow family rules, and remain reviewable/correctable by the parent.
