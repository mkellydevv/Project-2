
const SHOW_MODAL = 'sketchModal/SHOW_MODAL';
const SET_SKETCH_BOOK_ID = 'sketchModal/SET_SKETCH_ID';

export const showSketchModal = (val) => ({
    type: SHOW_MODAL,
    value: val
});

export const setSketchBookId = (val) => ({
    type: SET_SKETCH_BOOK_ID,
    value: val
});

const initialState = { modalState: false, sketchBookId: '' }

const sketchModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_MODAL:
            return { ...state, modalState: action.value };
        case SET_SKETCH_BOOK_ID:
            return { ...state, sketchBookId: action.value };
        default:
            return state;
    }
}

export default sketchModalReducer;
