const UI = {
    drawBoard: () => { throw new TypeError('Debes cambiar este método para usarlo!') },
    drawPlayer: () => { throw new TypeError('Debes cambiar este método para usarlo!') },
    manageControllers: () => { throw new TypeError('Debes cambiar este método para usarlo!') },
    initUI: () => { throw new TypeError('Debes cambiar este método para usarlo!') },
    uiElements: {
        board: "board"
    }
}

export const UI_BUILDER = {
    init: () => ({ ...UI })
}