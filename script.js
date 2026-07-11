const wordsList = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"];

const maxWords = 60;
const testDuration = 30;

let timer = null;
let timeRemaining = testDuration;
let testStarted = false;

let wordsArray = [];
let currentWordIndex = 0;
let currentLetterIndex = 0;

let totalTypedCharacters = 0;
let correctCharacters = 0;

const wordsInside = document.getElementById('words-inside');
const wordsWrapper = document.getElementById('words-wrapper');
const caret = document.getElementById('caret');
const hiddenInput = document.getElementById('hidden-input');
const uiTimer = document.getElementById('ui-timer');
const uiWpm = document.getElementById('ui-wpm');
const uiAcc = document.getElementById('ui-acc');
const wpmDisplay = document.getElementById('wpm-display');
const accDisplay = document.getElementById('acc-display');
const restartBtn = document.getElementById('restart-btn');

function initTest() {
    clearInterval(timer);
    testStarted = false;
    timeRemaining = testDuration;
    currentWordIndex = 0;
    currentLetterIndex = 0;
    totalTypedCharacters = 0;
    correctCharacters = 0;
    
    uiTimer.innerText = timeRemaining;
    wpmDisplay.classList.add('hidden');
    accDisplay.classList.add('hidden');
    hiddenInput.value = '';
    
    wordsInside.innerHTML = '';
    wordsArray = [];
    
    // Shuffle words randomly
    const shuffled = [...wordsList].sort(() => 0.5 - Math.random());
    for(let i=0; i < maxWords; i++) {
        wordsArray.push(shuffled[i % shuffled.length]);
    }
    
    // Build DOM layout structure
    wordsArray.forEach((wordStr) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordStr.split('').forEach(char => {
            const letterSpan = document.createElement('letter');
            letterSpan.innerText = char;
            wordDiv.appendChild(letterSpan);
        });
        wordsInside.appendChild(wordDiv);
    });

    wordsInside.style.marginTop = "0px";
    
    // Small timeout ensures the DOM renders prior to calculating spatial offsets
    setTimeout(updateCaret, 10);
    hiddenInput.focus();
}

function updateCaret() {
    const currentWordEl = wordsInside.children[currentWordIndex];
    if (!currentWordEl) return;

    const wrapperRect = wordsWrapper.getBoundingClientRect();
    const targetEl = currentWordEl.children[currentLetterIndex];
    let targetRect;
    
    if (targetEl) {
        targetRect = targetEl.getBoundingClientRect();
    } else {
        // Put the caret immediately after the last typed letter.
        const lastLetter = currentWordEl.children[currentWordEl.children.length - 1];
        if (lastLetter) {
            const lastLetterRect = lastLetter.getBoundingClientRect();
            targetRect = {
                left: lastLetterRect.right,
                top: lastLetterRect.top
            };
        } else {
            targetRect = currentWordEl.getBoundingClientRect();
        }
    }
    
    // Updates both dimensions instantly. When the word wraps, 
    // the CSS transition will animate it down smoothly to the next row!
    // getBoundingClientRect gives page coordinates. Convert them to the
    // wrapper's coordinate system so the caret follows every letter and word,
    // including after a line wrap.
    caret.style.left = `${targetRect.left - wrapperRect.left - wordsWrapper.clientLeft}px`;
    caret.style.top = `${targetRect.top - wrapperRect.top - wordsWrapper.clientTop + 4}px`;
}

// Obsolete scrolling translation code removed to allow infinite downward stepping

function handleLineScrolling(currentWordEl) {
    // Shifts layout upward smoothly when typing drops to lower lines
    if (currentWordEl.offsetTop > 40) {
        wordsInside.style.marginTop = `-${currentWordEl.offsetTop - 6}px`;
    }
}

function startTimer() {
    testStarted = true;
    timer = setInterval(() => {
        timeRemaining--;
        uiTimer.innerText = timeRemaining;
        
        if(timeRemaining <= 0) {
            endTest();
        }
    }, 1000);
}

function handleInput() {
    if (timeRemaining <= 0) return;
    if (!testStarted) startTimer();

    const currentWordEl = wordsInside.children[currentWordIndex];
    if (!currentWordEl) return;
    
    const letters = currentWordEl.children;
    const inputVal = hiddenInput.value;
    const lastChar = inputVal[inputVal.length - 1];

    // Spacebar triggers jumping forward to the next index block
    if (lastChar === ' ') {
        if (currentLetterIndex > 0) {
            currentWordIndex++;
            currentLetterIndex = 0;
        }
        hiddenInput.value = '';
        updateCaret();
        return;
    }

    // Handles Backspacing character removals cleanly
    if (inputVal.length < currentLetterIndex) {
        if (currentLetterIndex > 0) {
            currentLetterIndex--;
            const letter = letters[currentLetterIndex];
            if (letter.classList.contains('correct')) correctCharacters--;
            if (letter.classList.contains('correct') || letter.classList.contains('incorrect')) {
                totalTypedCharacters--;
            }
            letter.classList.remove('correct', 'incorrect');
        }
        updateCaret();
        return;
    }

    // Process character entry validation mechanics
    if (currentLetterIndex < letters.length) {
        const targetLetter = letters[currentLetterIndex];
        totalTypedCharacters++;
        
        if (lastChar === targetLetter.innerText) {
            targetLetter.classList.add('correct');
            correctCharacters++;
        } else {
            targetLetter.classList.add('incorrect');
        }
        
        currentLetterIndex++;
        updateCaret();
    }
}

function returnToPreviousWord() {
    if (currentLetterIndex !== 0 || currentWordIndex === 0) return;

    currentWordIndex--;
    const previousWord = wordsInside.children[currentWordIndex];
    currentLetterIndex = previousWord.children.length;

    // The hidden input needs the same length as the word so its next
    // Backspace event removes the final letter normally.
    hiddenInput.value = 'x'.repeat(currentLetterIndex);
    updateCaret();
}

function endTest() {
    clearInterval(timer);
    hiddenInput.blur();
    
    const elapsedMinutes = testDuration / 60;
    // Telemetry formulation (5 character adjustments constitute 1 structural word unit)
    const wpm = Math.round((correctCharacters / 5) / elapsedMinutes);
    const accuracy = totalTypedCharacters > 0 ? Math.round((correctCharacters / totalTypedCharacters) * 100) : 0;
    
    uiWpm.innerText = wpm;
    uiAcc.innerText = `${accuracy}%`;
    
    wpmDisplay.classList.remove('hidden');
    accDisplay.classList.remove('hidden');
}

// Global Event Focus Bindings
window.addEventListener('click', () => hiddenInput.focus());
hiddenInput.addEventListener('input', handleInput);
hiddenInput.addEventListener('keydown', (e) => {
    // An empty input emits no input event on Backspace, so handle crossing a
    // word space here and place the cursor back in the previous word.
    if (e.key === 'Backspace' && hiddenInput.value.length === 0) {
        returnToPreviousWord();
    }
});
restartBtn.addEventListener('click', initTest);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        initTest();
    }
});

// Run application
initTest();
