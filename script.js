const sentences = [
    "a variable stores a value that your program can use later.",
    "functions group reusable instructions into clear and focused tasks.",
    "an array keeps related values together in an ordered list.",
    "a loop repeats code while a condition remains true.",
    "use descriptive names so other developers can understand your code.",
    "testing small changes often makes bugs easier to find and fix.",
    "html provides structure while css controls the visual presentation.",
    "javascript responds to events and makes web pages interactive."
];

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
    
    const shuffledSentences = [...sentences].sort(() => 0.5 - Math.random());
    let sentenceIndex = 0;

    while (wordsArray.length < maxWords) {
        const sentenceWords = shuffledSentences[sentenceIndex % shuffledSentences.length].split(' ');
        wordsArray.push(...sentenceWords);
        sentenceIndex++;
    }

    wordsArray = wordsArray.slice(0, maxWords);
    
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
    
    caret.style.left = `${targetRect.left - wrapperRect.left - wordsWrapper.clientLeft}px`;
    caret.style.top = `${targetRect.top - wrapperRect.top - wordsWrapper.clientTop + 4}px`;
}

function handleLineScrolling(currentWordEl) {
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

    if (lastChar === ' ') {
        if (currentLetterIndex > 0) {
            currentWordIndex++;
            currentLetterIndex = 0;
        }
        hiddenInput.value = '';
        updateCaret();
        return;
    }

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

    hiddenInput.value = 'x'.repeat(currentLetterIndex);
    updateCaret();
}

function endTest() {
    clearInterval(timer);
    hiddenInput.blur();
    
    const elapsedMinutes = testDuration / 60;
    const wpm = Math.round((correctCharacters / 5) / elapsedMinutes);
    const accuracy = totalTypedCharacters > 0 ? Math.round((correctCharacters / totalTypedCharacters) * 100) : 0;
    
    uiWpm.innerText = wpm;
    uiAcc.innerText = `${accuracy}%`;
    
    wpmDisplay.classList.remove('hidden');
    accDisplay.classList.remove('hidden');
}

window.addEventListener('click', () => hiddenInput.focus());
hiddenInput.addEventListener('input', handleInput);
hiddenInput.addEventListener('keydown', (e) => {
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

initTest();
