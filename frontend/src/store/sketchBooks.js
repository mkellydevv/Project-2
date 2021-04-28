
const LOAD_SKETCH_BOOKS = 'sketches/LOAD_SKETCHES';

const loadSketchBooks = list => ({
    type: LOAD_SKETCH_BOOKS,
    list
})

export const getCovers = () => async dispatch => {
    const res = await fetch(`/api/sketchbooks`);
    if (res.ok) {
        const list = await res.json();
        dispatch(loadSketchBooks(list));
    }
}

const initialState = {};

const sketchBookReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_SKETCH_BOOKS: {
            const sketchBooksObj = {};
            action.list.forEach(sketchBook => {
                sketchBooksObj[sketchBook.id] = sketchBook;
            })
            return sketchBooksObj;
        }
        default:
            return state;
    }
}

export default sketchBookReducer;
