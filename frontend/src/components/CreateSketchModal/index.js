import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../context/Modal';
import PixiCanvas from '../PixiCanvas';
import { showSketchModal, setSketchData } from '../../store/sketchModal';

function CreateSketchModal() {
    const { modalState } = useSelector(state => state.sketchModal);
    const dispatch = useDispatch();

    const showModal = () => {
        dispatch(showSketchModal(false));
        dispatch(setSketchData(null));
    }

    return (
        <>
            {modalState && (
                <Modal onClose={() => showModal(false)}>
                    <PixiCanvas />
                </Modal>
            )}
        </>
    )
}

export default CreateSketchModal;
