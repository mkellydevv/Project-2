import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../context/Modal';
import PixiCanvas from '../PixiCanvas';
import { showSketchModal, hideSketchModal } from '../../store/sketchModal';

function CreateSketchModal() {
    const { modalState } = useSelector(state => state.sketchModal);
    const dispatch = useDispatch();

    const showModal = () => {
        dispatch(showSketchModal());
    }

    const hideModal = () => {
        dispatch(hideSketchModal());
    }

    return (
        <>
            <button onClick={() => showModal()}>New Sketch!</button>
            {modalState && (
                <Modal onClose={() => hideModal()}>
                    <PixiCanvas />
                </Modal>
            )}
        </>
    )
}

export default CreateSketchModal;
