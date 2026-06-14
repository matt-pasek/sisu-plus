# Sisu+

A Chrome browser extension that enhances the Sisu student portal used at Finnish universities. It overlays a richer UI
on top of Sisu and pulls in data from both the Sisu and Moodle APIs.

## Views

**Dashboard**: The home screen. Shows a customisable set of widgets summarising the student's academic progress (grades,
credits, upcoming workload, etc.). Layout is user-configurable.

**Registration**: Allows the student to enrol into active courses and track enrolment status. An active course is one
that has a current implementation (realisation) open for enrolment.

**Structure**: Shows the student's degree structure (modules and courses required to graduate) and allows editing —
adding elective courses, changing minors, rearranging the plan.

**Timeline**: Shows the student's study plan mapped across study periods and allows editing — moving courses between
periods to plan workload.

## Language

**Sisu**: The Finnish university student information system — the host website Sisu+ injects into. Sometimes called "OG
Sisu" to distinguish it from the extension. _Avoid_: The portal, the host, the platform

**Sisu+**: This Chrome extension. Layers a richer UI and additional data on top of Sisu. _Avoid_: The extension, the
app, the overlay

**Study Group**: A teaching subgroup within a course implementation that a student selects when enrolling — e.g. a
specific lecture group or language class. Not all courses require a study group selection; some courses have sub-groups
that are chosen outside Sisu (e.g. via Moodle) and do not sync back. _Avoid_: Group, section, class group

**Prerequisite**: A course or module that must be completed before a student can take another course. Shown in course
details and flagged in the Timeline when moving courses would create a prerequisite conflict. _Avoid_: Requirement,
dependency

**Grade Scale**: The set of valid grades for a course (e.g. 0–5, pass/fail, 1–3). Shown to students in course details.
"Grading scale" is an acceptable synonym. _Avoid_: Grading system, score range

**Grade**: An actual grade received by a student upon completing a course. Recorded in an attainment. _Avoid_: Score,
mark, result

**Completion Method**: A defined path for completing a course, consisting of specific assessment items and teaching
periods. A course can have multiple completion methods (e.g. exam vs project); the student selects one in the Structure
view and the choice is stored in their study plan. Often shortened to "completion". _Avoid_: Completion option, study
path, assessment track

**Implementation**: A scheduled offering of a course that students can enrol into. A course can have multiple
implementations (e.g. different teaching groups, exam vs lecture). Internally represented as a `CourseUnitRealisation`
from KORI. _Avoid_: Realisation (use only when referring to the raw KORI API type), offering, instance

**Course**: The catalogue definition of a course (name, credits, learning outcomes). Represented as `CourseUnit` in
KORI. _Avoid_: Course unit, subject, class

**Enrolment**: A student's registration for a specific offering of a course. Lives in ORI. _Avoid_: Registration,
sign-up, enrollment

**Module**: A named grouping of courses within a degree structure. Has three subtypes — DegreeProgramme (the top-level
degree), StudyModule (a thematic group of courses), and GroupingModule (a structural container) — but is usually
referred to simply as "module" regardless of subtype. _Avoid_: Degree programme, study module, grouping module (unless
the specific subtype matters)

**Study Plan**: A student's personal plan (HOPS in Finnish) mapping which courses and modules they intend to complete to
fulfil their degree requirements. Linked to a study right. _Avoid_: Plan, HOPS

**Study Right**: The formal permission granted to a student to pursue a specific degree programme. A student can have
multiple study rights. The study right ID also serves as the key for fetching related data (plans, enrolments, etc.)
from Sisu APIs. _Avoid_: StudyRight, enrollment permission, degree access

**Preferences**: The student's persisted settings for Sisu+, stored in Chrome sync storage. Includes locale,
active/inactive state, Moodle token, dashboard layout, onboarding progress, and university config. Often shortened to
"prefs". _Avoid_: Settings, config, user data

**Active / Inactive**: The two states of Sisu+. When active, Sisu+'s UI is shown instead of Sisu's. When inactive, the
original Sisu UI is restored. The student toggles between states via the Control Center. _Avoid_: Enabled/disabled,
on/off, Sisu+ mode/Sisu mode

**Control Center**: A floating action button (FAB) visible in both Sisu and Sisu+. Allows the student to switch between
Sisu and Sisu+, configure their Moodle token, and view author credits. Often abbreviated to CC. _Avoid_: Menu, overlay,
panel, toolbar

**Onboarding**: The two-part setup flow a student completes after installing Sisu+. Part 1 is a fullscreen first-run
flow where the student configures their university and grants required permissions. Part 2 happens in-Sisu and walks the
student through operating the Control Center, switching between Sisu and Sisu+, and optionally pasting in their Moodle
token. _Avoid_: Setup, installation, first-run

**University**: A Finnish university supported by Sisu+, identified by its Sisu and Moodle domains. Known universities
are pre-configured; others can be added by entering a custom Sisu domain. The student configures their university during
onboarding. _Avoid_: Institution, school, organisation

**Widget**: A configurable panel on the Dashboard displaying one aspect of a student's academic data. Widgets are
displayed in a grid and can be added, removed, resized, and reordered by the student. _Avoid_: Card, panel, tile

**Credits**: ECTS credit points earned by completing courses and modules. The primary measure of academic progress
toward a degree. "ECTS" is acceptable as a synonym for clarity. _Avoid_: Points, units, hours

**Study Period**: A fixed block of the academic year during which courses run. Students assign courses to study periods
in the Timeline to plan their workload. _Avoid_: Period, term, semester block

**Attainment**: A record that a student has completed something, including the grade and credit count. Comes in six
subtypes — CourseUnitAttainment, ModuleAttainment, DegreeProgrammeAttainment, AssessmentItemAttainment,
CustomCourseUnitAttainment, CustomModuleAttainment — which are worked with individually when the type matters. _Avoid_:
Grade, completion, result

**Moodle**: The learning management system used alongside Sisu at Finnish universities. Sisu+ pulls assignment data
(names, deadlines) from Moodle. Requires the student to provide a Moodle token. _Avoid_: LMS, Moodle API

**Moodle Token**: An API key the student manually provides to authorise Sisu+ to fetch their Moodle data. Without it,
assignment data is unavailable. _Avoid_: API key, access token

**ORI**: The student-facing Sisu API. Returns personalised data for the logged-in student: attainments, study rights,
enrolments. _Avoid_: ORI API, student API

**KORI**: The catalogue API. Returns university-wide data: course units, modules, degree programmes. _Avoid_: KORI API,
catalogue API

**Student**: A person enrolled at a Finnish university who uses Sisu to manage their studies and Sisu+ to get a better
view of that data. _Avoid_: User, person, account
