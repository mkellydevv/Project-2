import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Footer from './components/Footer';

import CanvasGrid from "./components/CanvasGrid";

function App() {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dispatch(sessionActions.restoreUser())
            .then(() => setIsLoaded(true));
    }, [dispatch]);

    return (
        <>
            <Navigation isLoaded={isLoaded} />
            {isLoaded && (
                <Switch>
                    <Route path="/signup">
                        <SignupFormPage />
                    </Route>
                    <Route exact path='/' >
                        <CanvasGrid sketchType={'cover'}/>
                    </Route>
                    <Route path='/sketchbook/:id' key={`/sketchbook/:id`}>
                        <CanvasGrid sketchType={'sketch'}/>
                    </Route>
                </Switch>
            )}
            <Footer />
        </>
    );
}

export default App;
