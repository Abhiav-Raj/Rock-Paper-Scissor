const socket = io();

let roomUniqueId = null;
let player1 = false;
let yourScore = 0;
let opponentScore = 0;

// Function to create the game (Player 1)
function createGame() {
  player1 = true;
  socket.emit("createGame");
  document.getElementById("initial").style.display = "none";
}

// Function to join the game (Player 2)
function joinGame() {
  const inputRoomId = document.getElementById("roomUniqueId").value.trim();
  if (!inputRoomId) {
    console.error("Room ID is empty. Cannot join game.");
    return;
  }

  roomUniqueId = inputRoomId;
  console.log(`Joining room: ${roomUniqueId}`);
  socket.emit("joinGame", { roomUniqueId });
  document.getElementById("initial").style.display = "none";
}

// Handle game creation
socket.on("new game", (data) => {
  roomUniqueId = data.roomUniqueId;
  console.log(`New game created. Room ID: ${roomUniqueId}`);
  setupGameUI(`Waiting for opponent. Share this Room ID: ${roomUniqueId}`);
  document.getElementById("copyRoomBtn").style.display = "block";
});

// Handle player connection
socket.on("playerConnected", () => {
  document.getElementById("waitingArea").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("leaveButton").style.display = "block";
  document.getElementById("scoreboard").style.display = "block";
  document.getElementById("copyRoomBtn").style.display = "none";
});

// Handle opponent's move notification
socket.on("opponentPlayed", () => {
  document.getElementById("opponentState").innerText =
    "Your opponent played their move.";
});

// Handle game results
socket.on("result", (data) => {
    console.log("Result data received from server:", data); // Debugging: log server data
  
    const { winner, player1Choice, player2Choice, message } = data;
  
    // Determine your role and choices
    const yourChoice = player1 ? player1Choice : player2Choice;
    const opponentChoice = player1 ? player2Choice : player1Choice;
  
    // Check if you are the winner
    const isYouWinner = socket.id === winner;
  
    // Update the result message
    let resultMessage = "";
    if (!winner) {
      resultMessage = "It's a tie!";
    } else if (isYouWinner) {
      resultMessage = "You Won!";
      yourScore++;
    } else {
      resultMessage = "You Lose!";
      opponentScore++;
    }
  
    // Update UI with choices and result
    document.getElementById("winnerArea").innerHTML = `
      <h3>${resultMessage}</h3>
      <p>Opponent's choice:</p>
      <img src="/Images/${opponentChoice}.png" alt="${opponentChoice}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
    `;
  
    // Update scores
    document.getElementById("yourScore").innerText = yourScore;
    document.getElementById("opponentScore").innerText = opponentScore;
  
    // Show replay button
    document.getElementById("replayButton").style.display = "block";
  
    // Reset the opponent state
    document.getElementById("opponentState").innerText = "";
  });
  

// Handle game restart
socket.on("gameRestarted", () => {
  resetGameUI();
});

// Function to send player's choice
function sendChoice(rpsValue) {
  if (!roomUniqueId) {
    console.error("Room ID is not set. Cannot send choice.");
    return;
  }

  socket.emit("choiceEvent", { rpsValue, roomUniqueId });
  document.getElementById(
    "player1Choice"
  ).innerHTML = `<img src="/Images/${rpsValue}.png" alt="${rpsValue}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">`;
}

// Restart the game
function restartGame() {
  socket.emit("restartVote", { roomUniqueId });
  document.getElementById("replayButton").style.display = "none";
}

// Leave the game
function leaveGame() {
  const confirmation = confirm("Are you sure you want to leave the game?");
  if (confirmation) {
    window.location.reload();
  }
}

// Helper to set up the game UI
function setupGameUI(message) {
  document.getElementById("initial").style.display = "none";
  document.getElementById("gamePlay").style.display = "block";
  document.getElementById("waitingArea").innerText = message;
}

// Helper to reset the game UI
function resetGameUI() {
  document.getElementById("winnerArea").innerText = "";
  document.getElementById("player1Choice").innerHTML = `
    <button onclick="sendChoice('Rock')"><img src="/Images/Rock.png" alt="Rock" style="width: 100px; height: 100px;"></button>
    <button onclick="sendChoice('Paper')"><img src="/Images/Paper.png" alt="Paper" style="width: 100px; height: 100px;"></button>
    <button onclick="sendChoice('Scissors')"><img src="/Images/Scissors.png" alt="Scissors" style="width: 100px; height: 100px;"></button>
  `;
  document.getElementById("opponentChoice").innerHTML = "";
  document.getElementById("replayButton").style.display = "none";
  document.getElementById("opponentState").innerText =
    "Waiting for the opponent's move...";
}

// Copy room code to clipboard
function copyRoomCode() {
  const roomIdInput = document.createElement("input");
  roomIdInput.value = roomUniqueId;
  document.body.appendChild(roomIdInput);
  roomIdInput.select();
  document.execCommand("copy");
  document.body.removeChild(roomIdInput);
  showPopup("Room code copied to clipboard!");
}

// Popup helper functions
function showPopup(message) {
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.innerText = message;
  const popupOverlay = document.getElementById("popupOverlay");
  popupOverlay.style.display = "flex";
}

function closePopup() {
  const popupOverlay = document.getElementById("popupOverlay");
  popupOverlay.style.display = "none";
}
