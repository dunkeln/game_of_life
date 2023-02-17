import './style.css'
import hashimeTheme, {
        fruityTheme, crystalTheme, deepSeaTheme,
        solarflareTheme, heatmapTheme, standard2Theme
    } from './utils/themes';

//                  GLOBAL VARIABLES
type Lokation = { x: number, y: number };
type EventLokation = { clientX: number, clientY: number };

const canvas = document.getElementById('gol') as HTMLCanvasElement;
const ctx = canvas!.getContext('2d');

const SIZE = 6;
const themes = [
    fruityTheme, solarflareTheme, crystalTheme,
    standard2Theme, deepSeaTheme, heatmapTheme, hashimeTheme
];
let theme = hashimeTheme;
let idx = 0;                     // current theme from the themes array

ctx!.canvas.width = window.innerWidth;
ctx!.canvas.height = window.innerHeight;
ctx!.fillStyle = theme.get('stilldead');
ctx!.fillRect(0, 0, canvas.width, canvas.height);

const width = canvas.width;
const height = canvas.height;

let isDrag = false;
let play = true;

const compose = (...fns: Function[]) => (x: unknown) => {
    for(const fn of fns) {
        x = fn(x);
        if(x === null) return;
    }
    return x;
}

const switchThemes = (idx: number) => {
    idx = idx % themes.length;
    return themes[idx];
}

const randomBool = () => Math.floor(Math.random() * 100) % 7 === 0;

let cells = Array.from({ length: width / SIZE }, () =>
  Array.from({ length: height / SIZE }, randomBool)
);

//                    END OF GLOBAL VARIABLES

const renderCell = (color: string) => (idx: number, jdx: number) => {
    ctx!.fillStyle = color;
    ctx!.fillRect(idx * SIZE, jdx * SIZE, SIZE, SIZE);
}

const renderPipeLine = (x: string) => 
    renderCell(theme.get(x));

// const renderGrid = (cells: Array<Array<boolean>>) => 
//     cells.forEach((row, idx) => 
//       row.forEach((cell, jdx) => cell 
//           ? renderPipeLine('nowAlive')(idx, jdx)
//           : renderPipeLine('nowdead')(idx, jdx))
//     );

// const renderHeatMap = 
//     (cells: Array<Array<boolean>>, prev: Array<Array<boolean>>) => 
//         cells.forEach((row, idx) =>
//              row.forEach((cell, jdx) => {
//                 if(cell && prev[idx][jdx]) stillAlive(idx, jdx)
//                 else if(cell && !prev[idx][jdx]) nowAlive(idx, jdx)
//                 else if(!cell && prev[idx][jdx]) nowDead(idx, jdx)
//                 else stillDead(idx, jdx)
//              }));

const costlyHeatMap =
    (cells: Array<Array<boolean>>
    , prev: Array<Array<boolean>>
    , grand:Array<Array<boolean>>) => 
        cells.forEach((row, idx) => 
            row.forEach((cell, jdx) => {
                if(cell && prev[idx][jdx] && grand[idx][jdx])
                    renderPipeLine('stillalive')(idx, jdx)
                else if(cell && prev[idx][jdx] && !grand[idx][jdx])
                    renderPipeLine('goinalive')(idx, jdx)
                else if(cell && !prev[idx][jdx] && !grand[idx][jdx])
                    renderPipeLine('nowalive')(idx, jdx)
                else if(!cell && !prev[idx][jdx] && !grand[idx][jdx])
                    renderPipeLine('stilldead')(idx, jdx)
                else if(!cell && !prev[idx][jdx] && grand[idx][jdx])
                    renderPipeLine('goindead')(idx, jdx)
                else
                    renderPipeLine('nowdead')(idx, jdx)
            })
         );

const getCoords = ({ clientX, clientY }: EventLokation): Lokation => ({
        x: Math.floor(clientX / SIZE),
        y: Math.floor(clientY / SIZE)
    })


const makeBunchAlive = ({x, y}: { x: number, y: number })  => {
    cells[x][y] = true;
    cells[x][y + 1] = true;
    cells[x][y - 1] = true;
    cells[x + 1][y] = true;
    cells[x + 1][y + 1] = true;
    cells[x + 1][y - 1] = true;
    cells[x - 1][y - 1] = true;
    cells[x - 1][y] = true;
    cells[x - 1][y + 1] = true;
    cells[x][y + 2] = true;
    cells[x][y - 2] = true;
    cells[x + 2][y] = true;
    cells[x + 2][y + 2] = true;
    cells[x + 2][y - 2] = true;
    cells[x - 2][y - 2] = true;
    cells[x - 2][y] = true;
    cells[x - 2][y + 2] = true;
}

const toggleLife = ({x, y}: Lokation) => cells[x][y] = !cells[x][y];

const setDrag = (val: boolean) => (x: MouseEvent) => { 
    isDrag = val;
    return x;
}

const checkClick = (e: MouseEvent) => {
    if(e.button === 0) return e;
    return null;
}

const checkDragTrue = (x: unknown) => !isDrag ? null : x;

const mouseDown = compose(checkClick, setDrag(true), getCoords, makeBunchAlive);
const precisionClick = compose(setDrag(false), getCoords, toggleLife);
const mouseDrag = compose(checkDragTrue, getCoords, makeBunchAlive)

document.addEventListener('contextmenu', precisionClick);
document.addEventListener('mousedown', mouseDown); 
document.addEventListener('mousemove', mouseDrag);
document.addEventListener('mouseup', setDrag(false));
document.addEventListener('keypress', (event: KeyboardEvent) => {
    if(event.key === ' ')
        play = !play;
    else if(event.key === '.')
        theme = switchThemes(idx++);
    else if(event.key === 'c')
        cells = Array.from({ length: width / SIZE }, () =>
              Array.from({ length: height / SIZE }, () => false)
        );
    else if(event.key === 'r')
        cells = Array.from({ length: width / SIZE }, () =>
              Array.from({ length: height / SIZE }, randomBool)
        );
});


const render = () => {
    let w = cells.length;
    let h = cells[0].length;

    const getStatus = (idx: number, jdx: number): boolean => {
        let i = idx === -1 ? w - 1 : idx % w;
        let j = jdx === -1 ? h - 1 : jdx % h;
        return cells[i][j];
    }


    const numberedStatus = 
        (idx: number, jdx: number): number => 
            Number(getStatus(idx, jdx));


    const neighbors = (idx: number, jdx: number): number => 
          numberedStatus(idx + 1, jdx    )
        + numberedStatus(idx + 1, jdx - 1)
        + numberedStatus(idx + 1, jdx + 1)
        + numberedStatus(idx - 1, jdx + 1)
        + numberedStatus(idx - 1, jdx - 1)
        + numberedStatus(idx - 1, jdx    )
        + numberedStatus(idx    , jdx - 1)
        + numberedStatus(idx    , jdx + 1)

    const updatedGrid = (cells: Array<Array<boolean>>): Array<Array<boolean>> => 
        cells.map((row: Array<boolean>, idx: number) => 
                  row.map((cell: boolean, jdx: number) => {
                      let n = neighbors(idx, jdx);
                      return (cell
                       && n >= 2
                       && n <= 3)
                       || !cell
                       && n === 3
                   }));
    
    let grand = cells.slice(0);
    let prev = cells.slice(0);

    const update = () => {
        if(play) {
            grand = prev;
            prev = cells;
            cells = updatedGrid(cells);
        }
        costlyHeatMap(cells, prev, grand);
        requestAnimationFrame(update);
    }

    update();
};

render();
