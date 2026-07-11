# CloneType

A responsive, browser-based typing test built with HTML, CSS, and JavaScript.

## Features

- 30-second typing test with randomly shuffled words
- Live caret that follows each letter and moves across wrapped lines
- Correct letters, incorrect letters, WPM, and accuracy tracking
- Backspace support for returning to a previous word and fixing mistakes
- Responsive typing frame that works on desktop and mobile screens
- Restart the test with the restart button or the `Tab` key

## Run the project

No installation is needed.

1. Open `index.html` in a web browser.
2. Click inside the typing frame and start typing.
3. Press `Space` to move to the next word.
4. Press `Backspace` from an empty word to return to the previous word.

## Project files

- `index.html` — page structure
- `style.css` — responsive layout and visual styles
- `script.js` — typing test behavior, timer, scoring, and caret movement

## Controls

| Key or action | Result |
| --- | --- |
| Type a letter | Checks it against the active word |
| `Space` | Moves to the next word |
| `Backspace` | Deletes a letter or returns to the prior word |
| `Tab` | Restarts the test |

