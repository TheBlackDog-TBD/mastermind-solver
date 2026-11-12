🎯 Mastermind Assistant — 6 Colors

Mastermind Assistant is an intelligent Mastermind solver designed to help players find the secret code.

Using a Minimax-based algorithm, the application analyzes the feedback from each guess, eliminates impossible combinations, and automatically suggests the next combination to try.

This edition features a 6-color palette and several customizable settings to support different variations of the game.

🎯 Goal: Find the secret code in as few guesses as possible.

---

✨ Features

🧠 Intelligent Solver

- Automatic generation of all possible combinations.
- Feedback analysis after each guess.
- Elimination of incompatible combinations.
- Automatic calculation of the next suggested guess.
- Minimax algorithm to reduce the number of remaining possibilities.
- Display of the number of remaining possible solutions.
- Detection of inconsistent feedback.

🎨 6-Color Palette

The application includes 6 colors:

Color| Hex Code
🔴 Red| "#EF4444"
🔵 Blue| "#3B82F6"
🟢 Green| "#22A06B"
⚪ White| "#FFFFFF"
⚫ Black| "#171717"
🟡 Yellow| "#FACC15"

Colors can be enabled or disabled in the settings.

At least 2 colors must remain available.

⚙️ Customizable Settings

Several settings allow you to customize the game rules:

- Number of positions: 3, 4, 5, or 6.
- Repeated colors can be enabled or disabled.
- Custom selection of available colors.
- Maximum of 12 guesses per game.

📊 Game Management

- Display of the suggested combination.
- Input of black and white feedback pegs.
- Guess history.
- Undo the last response.
- Recalculation of possible solutions after undoing a response.
- Detection of impossible feedback.
- Automatic detection when the secret code is found.

🌙 User Interface

- Modern and minimalist design.
- Dark mode enabled by default.
- Light mode available.
- Responsive interface.
- Compatible with smartphones, tablets, and computers.
- Fully English interface.
- Visual indicators for easier interaction.

💾 Automatic Saving

Game data is saved using "localStorage":

- Game configuration.
- Guess history.
- Selected theme.

Data remains available after refreshing the browser, on the same device and in the same browser.

---

🧠 How the Solver Works

The solver relies on several complementary steps.

1. Combination Generation

The application generates all possible combinations according to the selected settings.

With the classic configuration:

- 6 colors;
- 4 positions;
- Repeated colors allowed.

The total number of combinations is:

6⁴ = 1,296 possibilities

Without repeated colors:

6 × 5 × 4 × 3 = 360 possibilities

2. Feedback Calculation

After each guess, the player enters the feedback received.

Feedback| Meaning
⚫ Black| Correct color, correct position
⚪ White| Correct color, wrong position

The calculation takes repeated colors into account to prevent the same match from being counted more than once.

3. Solution Filtering

The solver compares every remaining combination against the feedback provided.

All incompatible combinations are eliminated.

Only solutions consistent with all previous results are retained.

4. Minimax Algorithm

To determine the next suggested guess, the application uses a Minimax-based strategy.

The process works as follows:

1. Iterate through the candidate combinations.
2. Simulate the possible feedback for each guess.
3. Divide the remaining solutions into groups based on the resulting feedback.
4. Identify the group containing the largest number of possibilities.
5. Prefer the guess that minimizes the size of the largest group.
6. Use a secondary metric to break ties between equivalent guesses.

To limit computational overhead, the solver samples a maximum of 240 candidate guesses from the remaining solutions.

Important: This is a heuristic Minimax implementation because not every possible guess is evaluated systematically.

---

🚀 Installation

No dependency installation is required.

Requirements

- A modern web browser.
- A text editor (optional).

Local Installation

1. Clone the repository

git clone https://github.com/YOUR-USERNAME/mastermind-6-couleurs.git

2. Navigate to the project directory

cd mastermind-6-couleurs

3. Launch the application

Simply open the following file:

index.html

The application runs directly in your browser.

No backend server, framework, or build tools are required.

---

🎮 How to Use the Application

Step 1 — Start a Game

Click "New Game".

The solver automatically generates the first combination.

Step 2 — Play the Suggested Combination

Reproduce the suggested colors on your Mastermind board.

Step 3 — Enter the Feedback

Count the feedback pegs:

- ⚫ Black: correct color in the correct position.
- ⚪ White: correct color in the wrong position.

Enter the corresponding numbers using the "+" and "−" buttons.

Step 4 — Submit Your Feedback

Click "Submit my feedback".

The solver analyzes the feedback and eliminates all impossible combinations.

Step 5 — Continue Playing

A new combination is automatically suggested.

Repeat the process until the secret code is discovered.

---

🛠️ Technologies Used

Technology| Purpose
HTML5| Application structure
CSS3| Interface, responsive layout, and themes
Vanilla JavaScript| Application logic and calculations
LocalStorage| Local data persistence
Minimax| Guess optimization

No external libraries or dependencies are used.

---

🔒 Privacy

The application runs entirely in your browser.

- No account creation required.
- No remote server.
- No external APIs.
- No remote database.
- No game data transmission.

Settings and game history are stored locally using "localStorage".

---

📱 Compatibility

The application is designed to work with:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

It is compatible with Android, iOS, tablets, and desktop computers.

---

📂 Project Structure

mastermind-6-couleurs/
│
├── index.html
└── README.md

The project is fully self-contained: HTML, CSS, and JavaScript are all included in a single file.

---

🔮 Possible Future Improvements

Potential future enhancements include:

- Minimax algorithm optimization.
- Automatic simulation mode.
- Game statistics.
- Average number of guesses calculation.
- Game import and export.
- Progressive Web App (PWA) support.
- Comparison of solving strategies.
- Multiple game save slots.

---

📜 License

The terms of reuse and distribution can be defined in a "LICENSE" file added to the repository.

---

👨‍💻 Author

Mastermind Assistant — 6-Color Edition

Developed using HTML5, CSS3, and Vanilla JavaScript.

An intelligent solver combining logic, analysis, and optimization to help Mastermind players discover the secret code.

⭐ If you like this project, feel free to give it a star on GitHub!