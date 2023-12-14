import * as global from "./lib/global.js";
const { update, initSocket, getMockups } = global;

const startButton = document.getElementById("startButton");
document.getElementById("gameCanvas").style.display = "none";

getMockups().then((data) => {
    window.mockups = data;
})

function startGame() {
  startButton.style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  
  window.socket = initSocket();
  
  update();
}

startButton.addEventListener("click", startGame);