import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../context/Modal';
import PixiCanvas from '../PixiCanvas';
import { showSketchModal, setSketchData } from '../../store/sketchModal';

function CreateSketchModal() {
    const { modalState } = useSelector(state => state.sketchModal);
    const dispatch = useDispatch();

    const showModal = (val) => {
        dispatch(showSketchModal(val));
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
