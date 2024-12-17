Here’s an updated version of your README to reflect that the game uses **Socket.IO** for real-time communication:

---

# Rock Paper Scissors Game

This is a **Rock Paper Scissors** game built using **HTML**, **CSS**, **JavaScript**, and **Socket.IO**. The game allows two players to play against each other in real-time. Players can choose between rock, paper, or scissors, and the game will determine the winner based on the classic rules.

## Features
- **Real-time multiplayer**: Play against another player in real-time using Socket.IO.
- Easy-to-use interface with clear choices.
- Display results for each round (win, lose, or draw).
- Simple animations and interactions for a smooth user experience.

## Installation

To run the game locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rock-paper-scissors.git
   ```
2. Navigate to the project folder:
   ```bash
   cd rock-paper-scissors
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in two different browsers or tabs to start playing the game with another player.

## How to Play

1. Two players must join the game by opening the game in two different browsers or tabs.
2. Both players will choose one of the three options: **Rock**, **Paper**, or **Scissors** by clicking on the corresponding button.
3. The game will send the choices to the server via Socket.IO and the winner will be determined based on the following rules:
   - Rock beats Scissors.
   - Scissors beats Paper.
   - Paper beats Rock.
4. The result of the game (win, lose, or draw) will be displayed after each round.
5. Players can play as many rounds as they want.

## Technologies Used
- **HTML** for the structure of the game.
- **CSS** for styling the user interface.
- **JavaScript** for the game logic and interactivity.
- **Socket.IO** for real-time communication between players.

## Demo

You can view a live demo of the game here: [Live Demo](https://your-demo-link.com)

## Contributing

Feel free to fork the repository and submit pull requests. If you find any issues or have suggestions for improvements, please open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Let me know if you need more adjustments!
