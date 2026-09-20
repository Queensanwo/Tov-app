

# **TOV Product Requirements Document**

## *Safe and structured YouTube viewing for families and learners*

| Field | Details |
| ----- | ----- |
| Product | TOV |
| Document purpose | Define the first product version, user journeys, feature requirements, safety rules and recommended defaults |
| Version | 1.0 |
| Date | 19 September 2026 |
| Primary audience | Product designers, programme reviewers, partners and future development teams |

**Product decision**

TOV will help children use YouTube more safely, help parents remain involved from anywhere and help students learn without becoming overwhelmed by too many repetitive videos. YouTube should continue to feel familiar. TOV should guide, filter and organise the experience without creating unnecessary interruptions.

# **Document contents**

* 1 Product overview  
* 2 Problem and opportunity  
* 3 Product goals and boundaries  
* 4 Users and permissions  
* 5 Product principles  
* 6 First version scope  
* 7 Parent onboarding and controls  
* 8 Child viewing experience  
* 9 Student learning experience  
* 10 Television and multi device experience  
* 11 Content review and family preferences  
* 12 Dashboards notifications and activity  
* 13 Main user journeys  
* 14 Product requirements  
* 15 Recommended defaults  
* 16 Success measures  
* 17 Risks and safeguards  
* 18 Release priorities and open decisions

## **How to use this document**

Confirmed requirements reflect the product decisions made during feature planning. Recommendations provide a practical default where parents or students should still retain a choice. The document focuses on user experience and product behaviour. It does not prescribe technical architecture or implementation.

# **1 Product overview**

## **Product statement**

TOV is an AI assisted companion for YouTube. It helps children browse and watch with safety rules chosen by their parents, and it helps students turn scattered YouTube videos into an organised learning journey. Parents manage TOV from their own device, including when the child is watching YouTube on a television.

## **Core promise**

TOV helps children watch YouTube safely, keeps parents involved from anywhere and gives students a smooth learning journey without video overload.

## **Primary product modes**

| Mode | Purpose | Main experience |
| ----- | ----- | ----- |
| Parent Admin | Set safety rules and supervise family viewing | Create profiles, control viewing, review activity and manage the television experience remotely |
| Child Viewer | Enjoy YouTube within parent rules | Search, browse and watch normally while unsuitable content is handled quietly |
| Student Admin | Learn through an organised YouTube journey | Choose a learning goal and follow relevant videos from one level to the next |

## **Product recommendation**

TOV should begin with safety as the deciding principle, then preserve a familiar YouTube experience. The product should avoid turning every viewing decision into a warning or approval request. Parent rules should be set once, applied consistently and remain easy to change.

# **2 Problem and opportunity**

## **Problems for parents**

* Videos may appear child friendly because of their title, thumbnail or cartoon style but contain unsuitable scenes, language or messages later.  
* Parents cannot watch every minute of every video, especially on a television or when they are away from the child.  
* YouTube recommendations can move a child from an approved topic to unrelated content.  
* Existing viewing history may already contain content the parent dislikes, so history alone cannot be treated as approval.  
* Parents need control without repeatedly interrupting the child or turning family viewing into constant monitoring.

## **Problems for students**

* A search may return many videos that repeat the same lesson.  
* Students may not know which video matches their level or what to watch next.  
* Long lists and unrelated recommendations can make learning feel overwhelming.  
* Students need structure but still want the freedom to browse YouTube and change their learning path.

## **Product opportunity**

TOV can reduce unsafe discovery and unnecessary scrolling by applying family rules to each video and arranging learning videos around a clear goal. The opportunity is not to replace YouTube. It is to make the existing experience safer for children and more purposeful for learners.

# **3 Product goals and boundaries**

## **Product goals**

1\.  Allow children to search and watch YouTube normally while parent rules remain active.

2\.  Allow parents to supervise and control viewing from their own device, including television viewing.

3\.  Review a full video rather than trusting only its title, thumbnail, creator or opening section.

4\.  Organise learning videos into levels that help students move from their current knowledge to a defined goal.

5\.  Reduce interruptions, repeated searching and long scrolling sessions.

6\.  Support multiple child and student profiles within one family account.

## **Product boundaries**

* TOV is a helper for YouTube, not a replacement video platform.  
* TOV should not become a general purpose chatbot in its first version.  
* A creator, channel, playlist or previous viewing history must never be treated as permanently safe.  
* TOV does not remove the parent from safety decisions. Parents choose the rules and may correct a decision.  
* Student structure should guide the learner without locking them into one path.

# **4 Users and permissions**

| User | What the user can do | Important limit |
| ----- | ----- | ----- |
| Parent Admin | Create profiles, choose safety rules, manage screen time, review activity, control television viewing and invite a trusted adult | The main Parent Admin controls permissions and family rules |
| Child Viewer | Search, browse, watch, choose approved topics and report uncomfortable content | Cannot change parent safety rules or approve rejected content |
| Independent Student Admin | Create and change learning journeys, choose settings and manage progress | Controls their own learning and safety preferences |
| Parent managed Student | Manage learning goals and progress | Parent retains safety control for the minor |
| Trusted Adult | Use only the viewing or supervision actions granted by the Parent Admin | Cannot exceed the permissions chosen by the Parent Admin |

## **Recommended permission rule**

Parents should control safety for minors, while students should control their learning choices. A trusted adult should receive only selected permissions, such as viewing activity, extending screen time, approving a topic, stopping playback or sending a video.

# **5 Product principles**

1\.  Keep YouTube familiar. Children and students should still feel that they are using YouTube.

2\.  Protect quietly. Rejected content should not create unnecessary warnings or pauses for the child.

3\.  Keep parents in control. Rules, exceptions and alerts should follow choices made by the parent.

4\.  Check every video. Approval of a creator or playlist does not automatically approve future content.

5\.  Use the full context. A video should be judged using its title, thumbnail, description, spoken words, transcript, visual scenes and themes across the full video.

6\.  Reduce overload. Student Mode should remove repetition and make the next step clear.

7\.  Make help optional. Summaries, quizzes and explanations should appear only when requested or enabled.

8\.  Use a clean start. A new child profile should not inherit unsafe assumptions from existing YouTube history.

# **6 First version scope**

| Priority | Capability | First version outcome |
| ----- | ----- | ----- |
| 1 | Child safety and automatic filtering | Apply parent rules to searches, recommendations and selected videos |
| 2 | Smooth YouTube and television viewing | Skip unsuitable content quietly and continue with an appropriate video |
| 3 | Parent dashboard and remote control | Show live activity and allow the parent to manage viewing from their device |
| 4 | Structured student learning paths | Recommend relevant videos by level and reduce repetition |
| 5 | Multiple profiles | Keep each child or student profile separate even when the family shares a YouTube account |

## **Recommended scope discipline**

The first version should prove that TOV can deliver safe, smooth viewing and useful learning structure. Optional social features, public sharing and broad tutoring features should wait until these core journeys work consistently.

# **7 Parent onboarding and controls**

## **Quick Setup**

Parent onboarding should ask only for the information required to begin safely.

1\.  Choose Parent Admin.

2\.  Connect the family YouTube account or choose separate accounts for profiles.

3\.  Create a child profile using the child name and age range.

4\.  Choose important themes and words to avoid.

5\.  Choose what should happen when a video is unsuitable or uncertain.

6\.  Begin viewing and complete optional settings later.

## **Recommended onboarding default**

TOV should recommend quietly skipping an unsuitable video, playing the next safe video and recording the rejected video on the Parent dashboard. Serious concerns may alert the parent when that option is enabled. Parents must be able to choose another action during setup and change it later.

## **Parent control choices**

* One rule for the whole family or a different rule for each child.  
* Different actions for different themes.  
* One combined screen time limit across devices or separate limits for each device.  
* Different weekday and weekend limits.  
* Permission for Shorts, live videos, comments and extra screen time.  
* A clean start or manually selected approved topics. Existing history should not be treated as approval.

## **Parent corrections**

When TOV rejects a suitable video, the parent should be able to:

* Allow the video once.  
* Approve that individual video for future viewing.  
* Change the related theme preference.  
* Ask TOV to review the video again.

# **8 Child viewing experience**

## **Normal viewing**

Child Mode should feel like normal YouTube. The child can type or speak a search, browse results, select new videos and continue watching. TOV applies the active child profile and parent rules in the background.

## **Approved and new topics**

* The parent may choose topics directly.  
* The child may choose from parent approved topics.  
* TOV may recommend age appropriate topics that follow the parent rules.  
* The child may search for a new topic when the parent is not nearby.  
* Safe results may appear immediately when the topic does not break a parent rule.  
* Restricted searches are hidden and recorded for the parent.

## **Smooth playback**

When a video is rejected, TOV should stop it and begin the next suitable video without showing a warning to the child. If no new suitable video is available, TOV should show other approved topics, offer previously approved videos and notify the parent through the dashboard.

## **Child safety action**

A visible I do not like this action should allow the child to stop an uncomfortable video. TOV should play a safe alternative and tell the parent. Similar videos should not be automatically rejected until the parent reviews the report.

## **Mode choice**

A child may move between normal Child Mode and a structured Learning Mode. The parent can also switch the active mode remotely. The parent remains responsible for the safety rules in both modes.

# **9 Student learning experience**

## **Student Quick Setup**

The student enters a learning topic or goal and chooses how many video options they want at each level. TOV recommends a starting level and creates a learning path immediately. If the student skips the video count, TOV should present three different choices per level.

## **Learning path**

The path overview should show:

* The recommended starting level.  
* The next three learning steps.  
* The final learning goal.  
* Estimated completion time.  
* All levels in a simple outline.

The current level and next three steps should be most prominent. The student should not face a large wall of videos.

## **Video recommendation rules**

A recommended learning video should match:

* The learning goal.  
* The student current level.  
* The preferred video length and available learning time when provided.  
* A clear teaching style.  
* Accurate lesson content.  
* A distinct learning purpose that does not unnecessarily repeat another lesson.

## **Student control**

* Replace or remove a recommended video.  
* Change the order of lessons.  
* Add a video found independently.  
* Ask TOV to rebuild the learning path.  
* Choose the next step when learning needs change.  
* Leave the learning path and browse YouTube normally.  
* Use general settings with changes for individual journeys.

## **Student added videos**

When a student adds a video, TOV should check whether it matches the goal, identify the appropriate level, warn about repetition and suggest where it belongs. The student makes the final decision and may add the video without changing the existing path.

## **Optional learning help**

TOV should recommend and organise videos by default. During onboarding, a student may choose transcript based summaries, simpler explanations, lesson questions or optional quizzes. These features should appear only when requested, after a difficult quiz or according to the student settings.

## **Progress and completion**

* Continue from the last video.  
* Show completed lessons and levels.  
* Show the next recommended lesson.  
* Show overall progress and estimated time remaining.  
* Offer an optional summary, final quiz, completion badge, next learning goal and saved lesson review at the end.

All end of journey features should be optional. The student should be able to skip them and continue without interruption.

# **10 Television and multi device experience**

## **Television behaviour**

TOV should work through the parent connected device and account while the child continues to use YouTube normally on the television. TOV should not require the child to learn a separate television interface.

* The parent selects the active child profile from their own device.  
* The selected profile applies its safety rules, approved themes and screen time limits to television viewing.  
* Unsuitable videos are rejected quietly and a suitable video plays next.  
* The parent can see the current video, device, active mode and remaining screen time.  
* The parent can pause or stop viewing, change mode, approve a topic or extend screen time remotely.  
* Viewing activity is recorded under the active child profile.  
* The television should not show unnecessary TOV warnings or setup screens.

## **Cross device continuity**

The following information should follow the profile across television, phone and tablet:

* Child safety preferences and restricted themes.  
* Approved and rejected topics.  
* Screen time progress according to the parent rule.  
* Student learning progress.  
* The last video and next learning step.

## **Remote parent involvement**

From the Parent dashboard, the parent should be able to:

* Send a video to play next.  
* Save a video for later.  
* Add a video to the child viewing list.  
* Use a video to start a learning journey.  
* Respond to a request for a new topic, extra time, help or a mode change.

# **11 Content review and family preferences**

## **Content categories**

Parents should choose individual themes rather than a broad spiritual label. Christian content should be allowed as normal content. Parents may separately restrict magic, witchcraft, Halloween, mermaids, ghosts, spells and other themes that matter to their family.

## **Full video rule**

A title, thumbnail, trusted creator or safe opening is not enough. A video should remain unavailable to a child until the full content has been reviewed. This is especially important for videos that last an hour or more.

## **Special content**

| Content type | Confirmed product rule | Recommended default |
| ----- | ----- | ----- |
| Uncertain video | Follow the rule chosen by the parent | Skip it, play a safer video and send it for review |
| One unsuitable section | Allow the parent to reject the video, skip the section, request review or set another rule | Reject the entire video |
| Long video | Keep unavailable until the full review is complete | Do not offer an unchecked substitute from the same creator |
| Live video | Require parent approval | Unavailable in Child Mode |
| Shorts | Follow the rule selected for each child | Allow the parent to permit, limit or block |
| Comments | Allow only with parent approval | Hidden in Child Mode |
| Paid promotion | Allow suitable promotions that follow the parent rules | Reject or hide promotions that break the rules |

## **Parent feedback on recommendations**

Each recommended video should give the parent quick actions to:

* Approve the video.  
* Reject the video.  
* Request more videos on the theme.  
* Stop recommending the theme.  
* Add a word or theme to avoid.

# **12 Dashboards notifications and activity**

## **Parent dashboard**

* Videos watched by each child.  
* Videos rejected by TOV.  
* Topics searched for by the child.  
* New topic and extra time requests.  
* Total and remaining screen time.  
* The video currently playing and device being used.  
* The active Child or Learning Mode.  
* Remote pause and stop controls.

## **Safety result display**

Parent Mode should show a small safety label on each video. Full details should appear only when the parent opens them. The explanation should include the title, thumbnail, reason for concern, relevant part of the video and a suitable alternative when available.

## **Notification approach**

Routine activity should remain in the dashboard and appear when the parent opens it. Immediate alerts should follow the parent choices for serious content, requests and rejected videos. Child viewing should remain free from parent facing warnings.

## **Student dashboard**

* Continue the current journey.  
* See completed lessons and levels.  
* See the next lesson.  
* Review progress and estimated time remaining.  
* Open optional summaries, quizzes, notes or help.

# **13 Main user journeys**

## **Parent and child setup journey**

1\.  The parent chooses Parent Admin and connects YouTube.

2\.  The parent creates a child profile with name, age range and important restrictions.

3\.  TOV recommends a default safety action and the parent accepts or changes it.

4\.  The parent selects the child profile when viewing begins on the television or another device.

5\.  The child searches and watches normally while TOV applies the profile rules.

6\.  The parent checks activity or controls viewing remotely when needed.

## **Child new topic journey**

1\.  The child searches for a new topic.

2\.  TOV applies the child age, parent rules and rejected themes.

3\.  Suitable results appear without waiting for the parent.

4\.  Restricted results remain hidden and the search is recorded.

5\.  The child continues watching without a warning screen.

## **Unsafe video journey**

1\.  TOV identifies content that breaks the active rule.

2\.  TOV applies the action chosen by the parent for that child or theme.

3\.  The child moves to a suitable video without unnecessary interruption.

4\.  The decision and explanation appear on the Parent dashboard.

5\.  The parent may approve, reject, change the rule or request another review.

## **Student learning journey**

1\.  The student enters a learning topic or goal.

2\.  TOV recommends a starting level and creates a path.

3\.  The student chooses a video or accepts the recommended option.

4\.  TOV tracks progress and keeps the next step clear.

5\.  The student changes the path, requests help or browses YouTube normally when desired.

6\.  At completion, the student may review a summary, take a quiz or begin the next goal.

# **14 Product requirements**

## **Account and profile requirements**

**PR 01**  A family must be able to create multiple child and student profiles.

**PR 02**  The Parent Admin must be able to use one shared YouTube account or separate accounts for different profiles.

**PR 03**  Each profile must keep its own preferences, activity, screen time and progress.

**PR 04**  A Parent Admin must be able to grant selected permissions to a trusted adult.

**PR 05**  A parent managed student must control learning choices while the parent retains safety control.

## **Child safety requirements**

**CS 01**  TOV must apply the active child profile to searches, recommendations and selected videos.

**CS 02**  TOV must not treat a creator, channel, playlist or viewing history as permanent approval.

**CS 03**  A long video must remain unavailable to the child until the full review is complete.

**CS 04**  When TOV is uncertain, it must follow the rule chosen by the parent.

**CS 05**  The child must be able to report an uncomfortable video and move immediately to a safer option.

**CS 06**  Comments must remain unavailable unless the parent approves them.

**CS 07**  Live videos must require parent approval.

**CS 08**  Shorts must follow the rule selected for the individual child.

## **Smooth viewing requirements**

**SV 01**  Child viewing should feel like normal YouTube browsing and playback.

**SV 02**  An unsuitable video should be handled without displaying a parent facing warning to the child.

**SV 03**  When the selected rule permits, TOV should continue with the next suitable video automatically.

**SV 04**  If no suitable video remains, TOV should offer approved topics or previously approved videos.

**SV 05**  The television experience should not require a separate child setup journey.

## **Parent control requirements**

**PC 01**  The Parent dashboard must show current viewing, device, active mode and remaining screen time.

**PC 02**  The parent must be able to pause or stop viewing remotely.

**PC 03**  The parent must be able to approve or reject a video, topic or theme.

**PC 04**  The parent must be able to select screen time rules for each child.

**PC 05**  The parent must be able to change safety rules after onboarding.

**PC 06**  Routine activity must remain available on the dashboard without forcing frequent notifications.

## **Student learning requirements**

**SL 01**  A student must be able to begin with a learning topic or goal.

**SL 02**  TOV must recommend a starting level and show a structured path.

**SL 03**  The path must avoid unnecessary repetition between recommended videos.

**SL 04**  The student must be able to choose the number of video options per level.

**SL 05**  The student must be able to replace, remove, reorder or add videos.

**SL 06**  Learning help and feedback prompts must be optional and may be turned off.

**SL 07**  Progress must show the current level, completed lessons, next lesson and estimated time remaining.

**SL 08**  The student must be able to leave the structured path and return to normal YouTube browsing.

# **15 Recommended defaults**

| Area | Recommended default | Reason |
| ----- | ----- | ----- |
| Parent onboarding | Quick Setup with recommended choices | Parents are busy and should reach safe viewing quickly |
| New child profile | Clean start | Existing history may contain content the parent does not approve |
| Unsuitable video | Skip quietly, play a suitable alternative and record the action | Protects the child without interrupting the viewing session |
| Uncertain video | Apply the parent rule, with skip and review suggested | The parent keeps final control |
| Long unchecked video | Keep unavailable | A safe opening does not prove the full video is suitable |
| Live video | Require parent approval | The full content cannot be reviewed beforehand |
| Comments | Hidden | Comments may contain unrelated adult or harmful content |
| Student video count | Three different choices per level | Provides choice without creating overload |
| Student starting level | Recommend a level and allow later adjustment | Keeps onboarding short |
| Next step prompt | End of each learning level | Avoids interrupting every video |
| Learning help | Off until requested | Keeps TOV focused on organisation and smooth viewing |

# **16 Success measures**

The following measures are recommended for product testing. Final targets should be set after observing early users.

| Outcome | Suggested measure | What good performance means |
| ----- | ----- | ----- |
| Fast setup | Time from opening TOV to the first protected viewing session | Most parents complete Quick Setup without needing help |
| Safer viewing | Number and type of unsuitable videos prevented or sent for review | Parent rules are applied consistently |
| Smooth child experience | Unnecessary pauses or warning screens shown to the child | Rejected content is handled with minimal disruption |
| Parent confidence | Parent rating of control and clarity | Parents understand what happened and can change the rule |
| Less scrolling | Time spent searching before a suitable video begins | Children and students reach useful content sooner |
| Learning progress | Journey continuation and completion | Students can identify the next step and continue over time |
| Recommendation quality | Video rejection, replacement and not relevant feedback | Fewer irrelevant or repetitive recommendations appear |
| Cross device continuity | Successful continuation of profile rules and progress | Moving between television, phone and tablet does not reset the experience |

## **Recommended early validation targets**

* A parent should be able to complete Quick Setup in about three minutes during testing.  
* A child should reach an appropriate next video without returning to a long scrolling session.  
* A student should understand the starting level, next three steps and final goal without further explanation.  
* A parent should be able to find the reason for a rejected video in two actions or fewer.  
* No unchecked long video should be recommended to a Child Viewer.

# **17 Risks and safeguards**

| Risk | Why it matters | Product safeguard |
| ----- | ----- | ----- |
| A child friendly title hides unsuitable content | The parent may assume the video is safe | Review the full video and keep unchecked long videos unavailable |
| Over blocking suitable content | The child loses useful or harmless videos | Allow parent review, one time approval and theme correction |
| Under blocking uncertain content | The child may see content the parent would reject | Follow the parent rule and recommend a cautious default |
| Too many alerts | Parents may ignore TOV or turn it off | Keep routine activity in the dashboard and alert only according to parent choices |
| Too much student structure | The learner may feel trapped | Allow path edits, normal browsing and optional help |
| Shared history affects recommendations | One family member may influence another profile | Keep TOV profiles separate and begin child profiles with a clean start |
| A previously trusted creator changes direction | Future videos may no longer be suitable | Check each video independently |
| Television controls feel intrusive | The child experience becomes frustrating | Keep TOV activity on the parent device and preserve normal YouTube viewing on the TV |

## **Product limitation statement**

TOV should be presented as a parent support tool, not a guarantee that every harmful idea will be detected. The product should make its decisions understandable, follow the family rules and keep the parent able to review and correct outcomes.

# **18 Release priorities and open decisions**

## **Recommended release order**

1\.  Parent Quick Setup and child profiles.

2\.  Video review rules and smooth child playback.

3\.  Parent dashboard and television controls from the parent device.

4\.  Screen time and multiple profile continuity.

5\.  Student learning path creation and progress.

6\.  Optional summaries, quizzes, trusted adult access and extended personalisation.

## **Open product decisions**

* The exact age ranges shown during child profile creation.  
* Which content themes appear first in Quick Setup and which remain under More Options.  
* Which events qualify as serious enough for an immediate alert by default.  
* How many trusted adults a Parent Admin may add in the first version.  
* Whether a child may switch modes freely or only when the parent enables that choice.  
* Which optional completion rewards are included in the first Student release.

## **Final recommendation**

Build the first TOV experience around one clear test: a parent should be able to set simple rules once, allow a child to watch YouTube normally on the television and remain informed from their own device. Student Mode should use the same principle by giving learners enough structure to progress without turning YouTube into a restrictive classroom.