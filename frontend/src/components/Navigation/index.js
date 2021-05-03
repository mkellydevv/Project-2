import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import LoginFormModal from '../LoginFormModal';
import './Navigation.css';
import CreateSketchModal from '../CreateSketchModal';
import { showSketchModal, setSketchBookId, setSketchData } from '../../store/sketchModal';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    const { sketchBookId } = useSelector(state => state.sketchModal);
    const dispatch = useDispatch();

    let sessionLinks;
    if (sessionUser) {
        sessionLinks = (
            <ProfileButton user={sessionUser} />
        );
    } else {
        sessionLinks = (
            <>
                <LoginFormModal />
                <NavLink to="/signup">Sign Up</NavLink>
            </>
        );
    }

    return (
        <div id='navbar'>
            <div className='navbar__section'>
                <NavLink exact to="/" onClick={e => {
                    dispatch(setSketchBookId(null));
                    dispatch(showSketchModal(false));
                    dispatch(setSketchData(null));
                }}>Home</NavLink>
            </div>
            <div className='navbar__section'>
                <h1>Sketch It</h1>
            </div>
            <div className='navbar__section'>
                {sessionUser && !sketchBookId && (
                    <button onClick={() => dispatch(showSketchModal(true))}>New Sketch!</button>
                )}
                {isLoaded && sessionLinks}
            </div>
            <CreateSketchModal />

        </div>
    );
}

export default Navigation;
