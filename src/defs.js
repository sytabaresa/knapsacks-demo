
export const delay = ms => new Promise((res) => setTimeout(res, ms))

export class Array1DTracer {

    steps = []
    counter = 0
    currentState = {
        values: [],
        selection: []
    }

    commit() {
        return structuredClone(this.currentState);
    }

    set(values) {
        this.currentState.values = values
        this.currentState.selection = [...Array(values.length)]
    }
    select(elemIndex) {
        this.currentState.selection[elemIndex] = 1
    }

    deselect(elemIndex) {
        this.currentState.selection[elemIndex] = 0
    }

    patch(i, v) {
        this.currentState.values[i] = v
        this.currentState.selection[i] = 2
    }

    depatch(i, v) {
        this.currentState.selection[i] = 0
    }
}

export class Array2DTracer {

    steps = []
    counter = 0
    currentState = {
        values: [],
        selection: []
    }

    commit() {
        return structuredClone(this.currentState);
    }

    set(values) {
        this.currentState.values = values
        this.currentState.selection = init2D(values.length, values[0].length)
        this.counter = 0
        this.steps = []
    }

    select(i, j) {
        this.currentState.selection[i][j] = 1
    }

    deselect(i, j) {
        this.currentState.selection[i][j] = 0
    }

    patch(i, j, v) {
        this.currentState.values[i][j] = v
        this.currentState.selection[i][j] = 2
    }

    depatch(i, j, v) {
        this.currentState.selection[i][j] = 0
    }
}


export function init2D(N, W) {
    let a = new Array(N + 1);

    for (let i = 0; i < N + 1; i++) {
        a[i] = new Array(W + 1);
        for (let j = 0; j < W + 1; j++) {
            a[i][j] = 0;
        }
    }

    return a
}
