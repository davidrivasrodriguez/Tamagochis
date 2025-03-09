import { UI_BUILDER } from "./Ui.js";
import { ConnectionHandler } from "./services/ConnectionHandler.js";
import { Directions } from "./entities/Player.js";


export const UIv1 = UI_BUILDER.init();

const TILE_SIZE = 75;

UIv1.gameService = null;

UIv1.setGameService = (service) => {
    UIv1.gameService = service;
};

UIv1.initUI = () => {
    const base = document.getElementById(UIv1.uiElements.board);
    base.classList.add("board");
}

// UIv1.drawBoard = (board) => {
//     if (board !== undefined && board.elements !== undefined) {
//         const base = document.getElementById(UIv1.uiElements.board);
//         base.innerHTML = '';

//         base.style.gridTemplateColumns = `repeat(${board.size}, ${TILE_SIZE}px)`;
//         base.style.gridTemplateRows = `repeat(${board.size}, ${TILE_SIZE}px)`;

//         for (let y = 0; y < board.size; y++) {
//             for (let x = 0; x < board.size; x++) {
//                 const tile = document.createElement("div");
//                 tile.classList.add("tile");
//                 tile.dataset.x = x;
//                 tile.dataset.y = y;
//                 tile.dataset.occupied = 'false';

//                 const isBush = board.elements.some(element =>
//                     element.x === x && element.y === y
//                 );

//                 if (isBush) {
//                     tile.classList.add('bush');
//                 }

//                 base.appendChild(tile);
//                 anime({
//                     targets: tile,
//                     opacity: [0, 1],
//                     duration: (Math.random() * 8000) + 1000,
//                     easing: 'easeInOutQuad'
//                 });
//             }
//         }
//     }
// }


UIv1.drawBoard = (board) => {
    if (board !== undefined && board.elements !== undefined) {
        const base = document.getElementById(UIv1.uiElements.board);
        base.innerHTML = '';

        base.style.gridTemplateColumns = `repeat(${board.size}, ${TILE_SIZE}px)`;
        base.style.gridTemplateRows = `repeat(${board.size}, ${TILE_SIZE}px)`;

        for (let y = 0; y < board.size; y++) {
            for (let x = 0; x < board.size; x++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                // tile.dataset.x = x;
                // tile.dataset.y = y;
                // tile.dataset.occupied = 'false';

                const isBush = board.elements.some(element =>
                    element.x === x && element.y === y
                );

                if (isBush) {
                    tile.classList.add('bush');
                }

                base.appendChild(tile);
                anime({
                    targets: tile,
                    opacity: [0, 1],
                    duration: (Math.random() * 8000) + 1000,
                    easing: 'easeInOutQuad'
                });
            }
        }
    }
}


// UIv1.drawPlayer = (board, players) => {
//     const base = document.getElementById(UIv1.uiElements.board);

//     players.forEach(player => {
//         const playerElement = document.createElement("div");
//         playerElement.classList.add("player");
//         playerElement.style.position = "absolute";

//         const centerOffset = (TILE_SIZE - PLAYER_SIZE) / 2;

//         playerElement.style.left = `${(player.x * TILE_SIZE) + centerOffset}px`;
//         playerElement.style.top = `${(player.y * TILE_SIZE) + centerOffset}px`;

//         playerElement.style.width = `${PLAYER_SIZE}px`;
//         playerElement.style.height = `${PLAYER_SIZE}px`;
//         playerElement.style.backgroundImage = "url('./assets/img/player.png')";
//         playerElement.style.backgroundSize = 'cover';
//         playerElement.style.backgroundRepeat = 'no-repeat';
//         playerElement.style.backgroundPosition = 'center';
//         playerElement.style.zIndex = '2';

//         base.appendChild(playerElement);

//         anime({
//             targets: playerElement,
//             opacity: [0, 1],
//             duration: 1000,
//             easing: 'easeInOutQuad'
//         });
//     });
// }


UIv1.drawPlayer = (board, players) => {
    const base = document.getElementById(UIv1.uiElements.board);
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.remove('player');
        // tile.setAttribute('data-occupied', 'false');
    });


    // const rotations = {
    //     'UP': 270,
    //     'RIGHT': 0,
    //     'DOWN': 90,
    //     'LEFT': 180
    // };

    players.forEach(player => {
        const tileIndex = (player.y * board.size) + player.x;
        const tile = base.children[tileIndex];

        console.log("Player:", player);
        console.log("Visibildad: " + player.visibility);
        if (tile) {
            tile.classList.add('player');
            
            const currentRotation = Directions[player.prevDirection];
            const targetRotation = Directions[player.direction];
            let rotationDiff = targetRotation - currentRotation;

            const element = board.elements.find(tile => tile.x === player.x && tile.y === player.y);
            if (element) {
                element.occupied = true;
                element.player = player;

                console.log("Elemento ocupado", element);
            }



            if(player.visibility === false) {
                tile.classList.remove('player');

                if(player.name === ConnectionHandler.playerName) {
                    const messages = document.getElementById('messages');
                    const message = document.createElement('div');
                    messages.innerHTML = '';
                    message.innerHTML = "You are HIDDEN!!";
                    messages.appendChild(message);
                    messages.style.display = 'flex';
                }
            } else {
                if(player.name === ConnectionHandler.playerName) {
                    const messages = document.getElementById('messages');
                    messages.innerHTML = '';
                    messages.style.display = 'none';
                }
            }
            anime({
                targets: tile,
                rotate: [currentRotation, currentRotation + rotationDiff],
                duration: 300,
                easing: 'easeInOutQuad'
            });
        }


    });
};

UIv1.manageControllers = () => {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'game-controls';
    controlsContainer.style.cssText = `
        position: absolute;
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px;
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
    `;

    const moveButton = document.createElement('button');
    moveButton.innerHTML = '<i class="fa-solid fa-up"></i>';
    moveButton.classList.add("move-button");

    moveButton.addEventListener('click', () => {
        if (ConnectionHandler?.socket && UIv1.gameService) {
            UIv1.gameService.do_move({ action: 'FORWARD' });
        } else {
            console.log("No socket connection available");
        }
    });


    const rotateButton = document.createElement('button');
    rotateButton.innerHTML = '<i class="fa-regular fa-arrow-rotate-right"></i>';
    rotateButton.classList.add("rotate-button");

    rotateButton.addEventListener('click', () => {
        if (ConnectionHandler?.socket && UIv1.gameService) {
            UIv1.gameService.do_move({ action: 'ROTATE' });
            
            // const player = UIv1.gameService.findCurrentPlayer();
            // if (player) {
                // const directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
                // const currentIndex = directions.indexOf(player.direction);
                // const newIndex = (currentIndex + 1) % directions.length;
                // player.direction = directions[newIndex];


                // UIv1.gameService.do_move({ action: 'ROTATE' });

                // ConnectionHandler.socket.emit("message", {
                //     type: "ROTATE",
                //     content: { player }
                // });
            // } else {
            //     console.log("No se encontró el jugador actual");
            // }
        } else {
            console.log("No hay conexión disponible");
        }
    });

    const shootButton = document.createElement('button');
    shootButton.innerHTML = '<i class="fa-solid fa-raygun"></i>';
    shootButton.classList.add("shoot-button");

    shootButton.addEventListener('click', () => {
        if (ConnectionHandler?.socket && UIv1.gameService) {
            console.log("SHOOT forward action triggered");
            UIv1.gameService.do_move({ action: 'SHOOT' });
        } else {
            console.log("No socket connection available");
        }
    });


    [moveButton, rotateButton, shootButton].forEach(button => {
        button.style.cssText = `
            width: 50px;
            height: 50px;
            font-size: 24px;
            border: none;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: transform 0.1s;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    controlsContainer.appendChild(moveButton);
    controlsContainer.appendChild(rotateButton);
    controlsContainer.appendChild(shootButton);

    document.body.appendChild(controlsContainer);
};
