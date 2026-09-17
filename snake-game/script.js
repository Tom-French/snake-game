// Grab DOM elements we'll interact with
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

// Game configuration
const GRID = 20; // size (px) of a single grid cell
const COLS = canvas.width / GRID; // number of columns in the grid
const ROWS = canvas.height / GRID; // number of rows in the grid

// Game state variables
let snake;      // array of {x,y} segments, head is snake[0]
let dir;        // current movement direction {x,y}
let nextDir;    // queued direction from input (applied on next step)
let food;       // food position {x,y}
let score;      // player's score
let running = false;
let tickInterval = 120; // milliseconds between game ticks (decreases as you eat)
let timer;      // interval timer id

/**
 * reset()
 * Initialize or reset the game state to a starting configuration.
 */
function reset() {
  // Start the snake in the center of the grid with a single segment
  snake = [ {x: Math.floor(COLS/2), y: Math.floor(ROWS/2)} ];
  dir = {x: 1, y: 0}; // initially moving right
  nextDir = dir;
  placeFood();
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
  running = true;
}

/**
 * placeFood()
 * Randomly place food on an empty cell (not overlapping the snake).
 */
function placeFood() {
  while (true) {
    const x = Math.floor(Math.random()*COLS);
    const y = Math.floor(Math.random()*ROWS);
    // ensure food does not appear on the snake
    if (!snake.some(s => s.x===x && s.y===y)) { food = {x,y}; break }
  }
}

/**
 * drawCell(x,y,color)
 * Draw a single grid cell at (x,y) using the provided color.
 */
function drawCell(x,y, color){
  ctx.fillStyle = color;
  // subtract 1px to create a thin grid line between cells
  ctx.fillRect(x*GRID, y*GRID, GRID-1, GRID-1);
}

/**
 * step()
 * Advance the game state by one tick: update snake position, check
 * collisions, handle eating food, and re-render.
 */
function step() {
  // Apply queued direction (prevents instant reversing)
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // Check wall collisions (game over)
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return gameOver();
  }

  // Check self-collision (running into own body)
  if (snake.some(s => s.x===head.x && s.y===head.y)) return gameOver();

  // Move: add new head position
  snake.unshift(head);

  // If we ate food, increase score and place new food; otherwise remove tail
  if (head.x===food.x && head.y===food.y) {
    score += 1;
    scoreEl.textContent = `Score: ${score}`;
    placeFood();
    // Gradually speed up the game (lower interval) to increase difficulty
    if (tickInterval > 40) { tickInterval -= 2; restartTimer() }
  } else {
    // remove the tail segment to keep the same length
    snake.pop();
  }

  render();
}

/**
 * render()
 * Draw the entire scene: clear canvas, draw food, then draw the snake.
 */
function render(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  // draw food
  drawCell(food.x, food.y, '#e11');
  // draw snake segments (head is visually distinct)
  for (let i=0;i<snake.length;i++){
    drawCell(snake[i].x, snake[i].y, i===0 ? '#7ef' : '#4ac');
  }
}

/**
 * gameOver()
 * Stop the game loop and display a simple 'Game Over' overlay.
 */
function gameOver(){
  running = false;
  clearInterval(timer);
  // semi-transparent overlay box
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over — press Restart', canvas.width/2, canvas.height/2);
}

/**
 * restartTimer()
 * Clear and re-create the interval timer according to `tickInterval`.
 */
function restartTimer(){
  clearInterval(timer);
  timer = setInterval(step, tickInterval);
}

// --- Input handling ---
// Listen for arrow keys or WASD and queue a direction change.
window.addEventListener('keydown', e => {
  const key = e.key;
  if (key === 'ArrowUp' || key === 'w') nextDir = {x:0,y:-1};
  if (key === 'ArrowDown' || key === 's') nextDir = {x:0,y:1};
  if (key === 'ArrowLeft' || key === 'a') nextDir = {x:-1,y:0};
  if (key === 'ArrowRight' || key === 'd') nextDir = {x:1,y:0};
  // Prevent reversing direction instantly (would collide with own head)
  if (nextDir.x === -dir.x && nextDir.y === -dir.y) nextDir = dir;
});

// Restart button handler: reset state and start the timer
restartBtn.addEventListener('click', () => {
  tickInterval = 120;
  reset();
  restartTimer();
});

// Initialize game on load
reset();
restartTimer();
render();
