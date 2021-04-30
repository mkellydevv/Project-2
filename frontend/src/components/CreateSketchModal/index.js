import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import PixiCanvas from '../PixiCanvas';

function CreateSketchModal() {
    const [showModal, setShowModal] = useState(false);

    const buh = () => {
        setShowModal(false)
    }

    return (
        <>
            <button onClick={() => setShowModal(true)}>New Sketch!</button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <PixiCanvas buh={buh} />
                </Modal>
            )}
        </>
    )
}

export default CreateSketchModal;
