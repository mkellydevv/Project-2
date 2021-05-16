
const LOAD_SKETCH_BOOKS = 'sketches/LOAD_SKETCH_BOOKS';
const LOAD_NEWEST_SKETCH_BOOKS = 'sketches/LOAD_NEWEST_SKETCH_BOOKS';
const LOAD_SKETCHES = 'sketches/LOAD_SKETCHES';

const loadSketchBooks = data => ({
    type: LOAD_SKETCH_BOOKS,
    data
})

const loadNewestSketchBooks = data => ({
    type: LOAD_NEWEST_SKETCH_BOOKS,
    data
})

const loadSketches = data => ({
    type: LOAD_SKETCHES,
    data
})

export const getCovers = (newestId) => async dispatch => {
    let url = '/api/sketchbooks';
    if (newestId)
        url += `?after=${newestId}`;

    const res = await fetch(url);

    if (res.ok) {
        const data = await res.json();
        if (newestId) {
            if (data.sketchBooks && data.sketchBooks.length > 0)
                dispatch(loadNewestSketchBooks(data));
        }
        else
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
            });
            return { sketchBooksObj, currSketchType: action.data.sketchType};
        }
        case LOAD_NEWEST_SKETCH_BOOKS: {
            const sketchBooksObj = { ...state.sketchBooksObj };
            action.data.sketchBooks.forEach(sketchBook => {
                sketchBooksObj[sketchBook.id] = sketchBook;
            });
            return { sketchBooksObj, currSketchType: action.data.sketchType, newSketchBookCount: action.data.sketchBooks.length};
        }
        case LOAD_SKETCHES: {
            const sketchBooksObj = {};
            action.data.sketches[0].Sketches.forEach(sketchBook => {
                sketchBooksObj[sketchBook.id] = sketchBook;
            });
            return { sketchBooksObj, currSketchType: action.data.sketchType};
        }
        default:
            return state;
    }
}

export default sketchBookReducer;
