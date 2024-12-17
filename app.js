const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};
const restartVotes = {}; // Track restart votes for each room

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function makeId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

io.on("connection", (socket) => {
    // Handle game creation
    socket.on("createGame", () => {
        const roomUniqueId = makeId(6);
        rooms[roomUniqueId] = { scores: {}, choices: {} };
        rooms[roomUniqueId].scores[socket.id] = 0;

        socket.join(roomUniqueId);
        console.log(`Game created. Room ID: ${roomUniqueId}`);
        socket.emit("new game", { roomUniqueId });
    });

    // Handle game joining
    socket.on("joinGame", (data) => {
        const { roomUniqueId } = data;
        if (!rooms[roomUniqueId]) return socket.emit("error", { message: "Room not found" });

        rooms[roomUniqueId].scores[socket.id] = 0;
        socket.join(roomUniqueId);
        console.log(`Player joined room: ${roomUniqueId}`);
        io.to(roomUniqueId).emit("playerConnected");
    });

    // Handle player choices
    socket.on("choiceEvent", (data) => {
        const { roomUniqueId, rpsValue } = data;

        if (!rooms[roomUniqueId]) {
            console.error(`Room not found: ${roomUniqueId}`);
            return;
        }

        rooms[roomUniqueId].choices[socket.id] = rpsValue;
        console.log(`Player ${socket.id} in Room ${roomUniqueId} chose: ${rpsValue}`);

        socket.to(roomUniqueId).emit("opponentPlayed", { player: socket.id });

        // If both players made choices, calculate result
        if (Object.keys(rooms[roomUniqueId].choices).length === 2) {
            const winnerData = getWinner(roomUniqueId);

            // Get choices for both players
            const [p1, p2] = Object.keys(rooms[roomUniqueId].choices);
            const resultData = {
                winner: winnerData.winner,
                player1Choice: rooms[roomUniqueId].choices[p1],
                player2Choice: rooms[roomUniqueId].choices[p2],
                message: winnerData.message, // Additional message for debugging
            };

            console.log(`Result for Room ${roomUniqueId}:`, resultData);
            io.to(roomUniqueId).emit("result", resultData);

            // Reset choices for the next round
            rooms[roomUniqueId].choices = {};
        }
    });

    // Handle restart votes
    socket.on("restartVote", (data) => {
        const { roomUniqueId } = data;
        if (!restartVotes[roomUniqueId]) restartVotes[roomUniqueId] = new Set();

        restartVotes[roomUniqueId].add(socket.id);
        console.log(`Player ${socket.id} voted to restart Room ${roomUniqueId}`);

        if (restartVotes[roomUniqueId].size === 2) {
            restartVotes[roomUniqueId].clear();
            rooms[roomUniqueId].choices = {};
            console.log(`Game restarted in Room ${roomUniqueId}`);
            io.to(roomUniqueId).emit("gameRestarted");
        }
    });

    // Handle disconnects
    socket.on("disconnecting", () => {
        const roomUniqueId = Array.from(socket.rooms)[1];
        if (rooms[roomUniqueId]) {
            console.log(`Room ${roomUniqueId} deleted due to player disconnection`);
            delete rooms[roomUniqueId];
        }
        if (restartVotes[roomUniqueId]) delete restartVotes[roomUniqueId];
    });
});

function getWinner(roomUniqueId) {
    const choices = rooms[roomUniqueId]?.choices;

    if (!choices) {
        console.error(`Choices not found for Room ${roomUniqueId}`);
        return { winner: null, message: "No choices made yet" };
    }

    const players = Object.keys(choices);
    const [p1, p2] = players;

    console.log(`Choices for Room ${roomUniqueId}: Player 1 (${p1}) -> ${choices[p1]}, Player 2 (${p2}) -> ${choices[p2]}`);

    if (choices[p1] === choices[p2]) {
        return { winner: null, message: "It's a tie!" };
    }

    const winConditions = {
        Rock: "Scissors",
        Scissors: "Paper",
        Paper: "Rock",
    };

    const winner =
        winConditions[choices[p1]] === choices[p2]
            ? p1 // Player 1 wins
            : p2; // Player 2 wins

    return {
        winner,
        message: `Player ${winner === p1 ? 1 : 2} wins!`,
        choices,
    };
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});
