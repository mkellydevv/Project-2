
const SHOW_MODAL = 'sketchModal/SHOW_MODAL';
const SET_SKETCH_BOOK_ID = 'sketchModal/SET_SKETCH_ID';
const SET_SKETCH_DATA = 'sketchModal/SET_SKETCH_DATA';

export const showSketchModal = (val) => ({
    type: SHOW_MODAL,
    value: val
});

export const setSketchBookId = (val) => ({
    type: SET_SKETCH_BOOK_ID,
    value: val
});

export const setSketchData = (val) => ({
    type: SET_SKETCH_DATA,
    value: val
});

const initialState = { modalState: false, sketchBookId: '', sketchData: null }

const sketchModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_MODAL:
            return { ...state, modalState: action.value };
        case SET_SKETCH_BOOK_ID:
            return { ...state, sketchBookId: action.value };
        case SET_SKETCH_DATA:
            return { ...state, sketchData: action.value };
        default:
            return state;
    }
}

export default sketchModalReducer;
