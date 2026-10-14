# Validation — 2026-10-12

`node --test tests/*.test.cjs`: six passing tests. Covered malformed saved state,
duplicate IDs, task length/count limits, suspended-tab deadline calculation,
pause/resume and countdown formatting.

Browser workflow verified: load from localhost, create a task, choose five
minutes, start, pause, change to rain, reload, and confirm task, scene and
remaining time were preserved. Artwork loaded from local assets. Mobile widths of 360 and 414 CSS pixels
were checked in the browser; page width matched the viewport with no horizontal
overflow after correcting the phone preview grid.

This release has not been tested as a native mobile widget. There is no live
weather adapter, cloud sync or calendar API. Browser file-URL storage may vary.
Reduced-motion CSS and labeled controls are included; a full accessibility audit
has not been performed.
