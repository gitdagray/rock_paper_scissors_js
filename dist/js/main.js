import GameObj from "./Game.js";
const Game = new GameObj();

const initApp = () => {
    initAllTimeData();
    updateScoreBoard();
    listenForPlayerChoice();
    listenForEnterKey();
    listenForPlayAgain();
    lockComputerGameBoardHeight();
    document.querySelector("h1").focus();
}

document.addEventListener("DOMContentLoaded", initApp);

const initAllTimeData = () => {
    Game.setP1AllTime(parseInt(localStorage.getItem("p1AllTime")) || 0);
    Game.setCpAllTime(parseInt(localStorage.getItem("cpAllTime")) || 0);
}

const updateScoreBoard = () => {
    const p1Ats = document.getElementById("p1_all_time_score");
    p1Ats.textContent = Game.getP1AllTime();
    p1Ats.ariaLabel = `Player One has ${Game.getP1AllTime()} all time wins.`;

    const cpAts = document.getElementById("cp_all_time_score");
    cpAts.textContent = Game.getCpAllTime();
    cpAts.ariaLabel = `Computer Player has ${Game.getCpAllTime()} all time wins.`;

    const p1s = document.getElementById("p1_session_score");
    p1s.textContent = Game.getP1Session();
    p1s.ariaLabel = `Player One has ${Game.getP1Session()} wins this session.`;

    const cps = document.getElementById("cp_session_score");
    cps.textContent = Game.getCpSession();
    cps.ariaLabel = `Computer Player has ${Game.getCpSession()} wins this session.`;
}

const listenForPlayerChoice = () => {
    const p1Images = document.querySelectorAll(".playerBoard .gameboard__square img");
    p1Images.forEach(img => {
        img.addEventListener("click", (event) => {
            if (Game.getActiveStatus()) return;
            Game.startGame();
            const playerChoice = event.target.parentElement.id;
            updateP1Message(playerChoice);
            p1Images.forEach(img => {
                if (img === event.target) {
                    img.parentElement.classList.add("selected");
                } else {
                    img.parentElement.classList.add("not-selected");
                }
            });
            computerAnimationSequence(playerChoice);
        });
    })
}

const listenForEnterKey = () => {
    window.addEventListener("keydown", (event) => {
        if (event.code === "Enter" && event.target.tagName === "IMG") {
            event.target.click();
        }
    });
}

const listenForPlayAgain = () => {
    document.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        resetBoard();
    })
}

const lockComputerGameBoardHeight = () => {
    const cpGameBoard = document.querySelector(".computerBoard .gameboard");
    const cpGBStyles = getComputedStyle(cpGameBoard);
    const height = cpGBStyles.getPropertyValue("height");
    cpGameBoard.style.minHeight = height;
}

const updateP1Message = (choice) => {
    let p1msg = document.getElementById("p1msg").textContent;
    p1msg += ` ${properCase(choice)}!`;
    document.getElementById("p1msg").textContent = p1msg;
}

const computerAnimationSequence = (playerChoice) => {
    let interval = 1000;
    setTimeout(() => computerChoiceAnimation("cp_rock", 1), interval);
    setTimeout(() => computerChoiceAnimation("cp_paper", 2), interval += 500);
    setTimeout(() => computerChoiceAnimation("cp_scissors", 3), interval += 500);
    setTimeout(() => countdownFade(), interval += 750);
    setTimeout(() => {
        deleteCountdown();
        finishGameFlow(playerChoice);
    }, interval += 1000);
    setTimeout(() => askUserToPlayAgain(), interval += 1000);

}

const computerChoiceAnimation = (elementId, number) => {
    const element = document.getElementById(elementId);
    element.firstElementChild.remove();
    const p = document.createElement("p");
    p.textContent = number;
    element.appendChild(p);
}

const countdownFade = () => {
    const countdown = document.querySelectorAll(".computerBoard .gameboard__square p");
    countdown.forEach(el => {
        el.className = "fadeOut";
    });
}

const deleteCountdown = () => {
    const countdown = document.querySelectorAll(".computerBoard .gameboard__square p");
    countdown.forEach(el => {
        el.remove();
    });
}

const finishGameFlow = (playerChoice) => {
    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);
    const actionMessage = buildActionMessage(
        winner, playerChoice, computerChoice
    );
    displayActionMessage(actionMessage);
    updateAriaResult(actionMessage, winner);
    updateScoreState(winner);
    updatePersistentData(winner);
    updateScoreBoard();
    updateWinnerMessage(winner);
    displayComputerChoice(computerChoice);
}

const getComputerChoice = () => {
    const randomNumber = Math.floor(Math.random() * 3);
    const rpsArray = ["rock", "paper", "scissors"];
    return rpsArray[randomNumber];
}

const determineWinner = (player, computer) => {
    if (player === computer) return "tie";
    if (
        player === "rock" && computer === "paper" ||
        player === "paper" && computer === "scissors" ||
        player === "scissors" && computer === "rock"
    ) return "computer";
    return "player";
}

const buildActionMessage = (winner, playerChoice, computerChoice) => {
    if (winner === "tie") return "Tie game!";
    if (winner === "computer") {
        const action = getAction(computerChoice);
        return `${properCase(computerChoice)} ${action} ${properCase(playerChoice)}.`;
    } else {
        const action = getAction(playerChoice);
        return `${properCase(playerChoice)} ${action} ${properCase(computerChoice)}.`;
    }
}

const getAction = (choice) => {
    return choice === "rock" ? "smashes" : choice === "paper" ? "wraps" : "cuts";
}

const properCase = (string) => {
    return `${string[0].toUpperCase()}${string.slice(1)}`;
}

const displayActionMessage = (actionMessage) => {
    const cpmsg = document.getElementById("cpmsg");
    cpmsg.textContent = actionMessage;
}

const updateAriaResult = (result, winner) => {
    const ariaResult = document.getElementById("playAgain");
    const winMessage =
        winner === "player"
            ? "Congratulations, you are the winner."
            : winner === "computer"
                ? "The computer is the winner."
                : "";
    ariaResult.ariaLabel = `${result} ${winMessage} Click or press enter to play again.`;
}

const updateScoreState = (winner) => {
    if (winner === "tie") return;
    winner === "computer" ? Game.cpWins() : Game.p1Wins();
}

const updatePersistentData = (winner) => {
    const store = winner === "computer" ? "cpAllTime" : "p1AllTime";
    const score = winner === "computer" ? Game.getCpAllTime() : Game.getP1AllTime();
    localStorage.setItem(store, score);
}

const updateWinnerMessage = (winner) => {
    if (winner === "tie") return;
    const message =
        winner === "computer"
            ? "🤖 Computer wins! 🤖"
            : "🏆🔥 You Win! 🔥🏆";
    const p1msg = document.getElementById("p1msg");
    p1msg.textContent = message;
}

const displayComputerChoice = (choice) => {
    const square = document.getElementById("cp_paper");
    createGameImage(choice, square);
}

const askUserToPlayAgain = () => {
    const playAgain = document.getElementById("playAgain");
    playAgain.classList.toggle("hidden");
    playAgain.focus();
}

const resetBoard = () => {
    const gameSquares = document.querySelectorAll(".gameboard div");
    gameSquares.forEach(el => {
        el.className = "gameboard__square";
    });
    const cpSquares = document.querySelectorAll(".computerBoard .gameboard__square");
    cpSquares.forEach(el => {
        if (el.firstElementChild) el.firstElementChild.remove();
        if (el.id === "cp_rock") createGameImage("rock", el);
        if (el.id === "cp_paper") createGameImage("paper", el);
        if (el.id === "cp_scissors") createGameImage("scissors", el);
    });
    document.getElementById("p1msg").textContent = "Player One Chooses...";
    document.getElementById("cpmsg").textContent = "Computer Chooses...";
    const ariaResult = document.getElementById("playAgain");
    ariaResult.ariaLabel = "Player One Chooses";
    document.getElementById("p1msg").focus();
    document.getElementById("playAgain").classList.toggle("hidden");
    Game.endGame();
}

const createGameImage = (icon, appendToElement) => {
    const image = document.createElement("img");
    image.src = `img/${icon}.png`;
    image.alt = icon;
    appendToElement.appendChild(image);
}

