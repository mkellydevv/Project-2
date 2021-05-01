
const SHOW_MODAL = 'sketch/SHOW_MODAL';
const HIDE_MODAL = 'sketch/HIDE_MODAL';

export const showSketchModal = () => ({
    type: SHOW_MODAL
});

export const hideSketchModal = () => ({
    type: HIDE_MODAL
});

const initialState = { modalState: false }

const sketchModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_MODAL:
            return { modalState: true };
        case HIDE_MODAL:
            return { modalState: false };
        default:
            return state;
    }
}

export default sketchModalReducer;
