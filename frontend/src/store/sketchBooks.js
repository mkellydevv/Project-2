
const LOAD_SKETCH_BOOKS = 'sketches/LOAD_SKETCH_BOOKS';
const LOAD_SKETCHES = 'sketches/LOAD_SKETCHES';

const loadSketchBooks = data => ({
    type: LOAD_SKETCH_BOOKS,
    data
})

const loadSketches = data => ({
    type: LOAD_SKETCHES,
    data
})

export const getCovers = () => async dispatch => {
    const res = await fetch(`/api/sketchbooks`);
    if (res.ok) {
        const data = await res.json();
        dispatch(loadSketchBooks(data));
    }
}

export const getSketches = (id) => async dispatch => {
    const res = await fetch(`/api/sketchBooks/${id}`);
    if (res.ok) {
        const data = await res.json();
        dispatch(loadSketches(data));
    }
}

const initialState = {};

const sketchBookReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_SKETCH_BOOKS: {
            const sketchBooksObj = {};
            action.data.sketchBooks.forEach(sketchBook => {
                sketchBooksObj[sketchBook.id] = sketchBook;
            })
            return { sketchBooksObj, currSketchType: action.data.sketchType};
        }
        case LOAD_SKETCHES: {
            const sketchBooksObj = {};
            action.data.sketches.forEach(sketchBook => {
                sketchBooksObj[sketchBook.id] = sketchBook;
            })

            return { sketchBooksObj, currSketchType: action.data.sketchType};
        }
        default:
            return state;
    }
}

export default sketchBookReducer;
