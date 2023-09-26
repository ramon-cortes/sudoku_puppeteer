// http://five.websudoku.com/ (https://www.websudoku.com/)
/* tabla id='puzzle_grid'
input id='f00' - 'f80'
         'f08' - 'f88'
input class='bs' name='submit'
<input name="submit" type="submit" class="bs" value="How am I doing?" onclick="j12(); return j1();">
<input name="showstats" type="submit" value=" How good is my time? ">
...
*/

import puppeteer from "puppeteer";
import chalk from "chalk";

const url = 'http://five.websudoku.com/';
const size = {width: 1280, height: 720};

// ---------------Mi Algoritmo--------------------
// Resuelve "Easy" Sudokus (deterministic = no guessing)
function encuentraPosibilidades(puzzle, y, x) {  
  return [1,2,3,4,5,6,7,8,9].filter(e => puzzle[y].every(el => e !== el)).filter(e => puzzle.map(e => e.filter((el, i) => i === x)).flat().every(el => e !== el)).filter(e => puzzle.slice(Math.floor(y / 3) * 3, Math.floor(y / 3) * 3 + 3).map(e => e.filter((ee, i) => i >= (Math.floor(x / 3) * 3) && i  <= (Math.floor(x / 3) * 3 + 2))).flat().every(el => e !== el));
}
function resuelveSudoku(puzzle) {
  console.log(chalk.yellow(`Sudoku: ${JSON.stringify(puzzle)}`));
  let max = 100, solved = false, ciclo = 1, solution = [...puzzle];
  while (!solved && ciclo < max) {
    solved = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let solAqui = encuentraPosibilidades(puzzle, i, j);
        if (solAqui.length === 1 && !puzzle[i][j]) {
          solution[i][j] = solAqui[0];
          solved = false;
        }      
      }    
    }
    ciclo++;
  }
  console.log(ciclo);
  return solution;
}
// -------------Mi Algoritmo end--------------------

(async () => {
  // Abriendo headless Browser
  console.log(chalk.cyan('Opening Browser'));
  const browser = await puppeteer.launch({headless: false, args: ['--start-fullscreen']}); //"new"
  const page = await browser.newPage();

  // Abriendo página
  console.log(chalk.cyan(`Opening Sudoku page: ${url}`));
  await page.goto(url, {waitUntil: 'load', timeout: 75000});
  console.log(chalk.cyan(`Setting viewport size ${size.width} x ${size.height}`));
  await page.setViewport(size);
  
  // Obteniendo valores Sudoku
  // 'fxy' → [y][x]
  //console.log(chalk.cyan(`Obtaining puzzle values...`));
  const inputs = [], puzzle = [];
  for (let i = 0; i < 9; i++) {
    const line = [];
    inputs.push([]);
    //console.log(chalk.cyan(`${i+1} of 9...`));
    for (let j = 0; j < 9; j++) {
      inputs[i].push(await page.waitForSelector(`#f${j}${i}`));
      line.push(await inputs[i][j].evaluate(e => e.value === '' ? 0 : parseInt(e.value)));
    }
    puzzle.push(line);
  }
  
  // Obtiene solución
  const solution = resuelveSudoku(puzzle);
  console.log(chalk.green(`Solution: ${JSON.stringify(solution)}`));

  // Escribe resultados  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      await inputs[i][j].type(`${solution[i][j]}`);
    }    
  }

  console.log(chalk.cyan(`Taking ScreenShot and closing`));
  let fechaHora = new Date().toLocaleString().replaceAll(/[\s,.]/g, '_').replaceAll(/[\/\\:]/g, '-');
  await page.screenshot({path: `./ss/ss_${fechaHora}.png`});

  // Clic en "submit"
  await page.waitForSelector('input[name="submit"]');
  await page.click('input[name="submit"]');

  // Clic en "showstats"
  // await page.waitForSelector('input[name="showstats"]');
  // await page.click('input[name="showstats"]');

  let id = setTimeout(async () => {
    // Tomando foto y cerrando Browser    
    await browser.close();
  }, 8000);
  
})();

// await inputs[0][0].type(`${solution[0][0]}`);
// await inputs[0][1].type(`${solution[0][1]}`);
// await inputs[0][2].type(`${solution[0][2]}`);