import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCovers } from "../../store/sketchBooks";
import PixiCanvas from "../PixiCanvas";

import './CanvasGrid.css';

const CanvasGrid = () => {
    const dispatch = useDispatch();
    const sketchBooks = useSelector(state => state.sketchBooks);
    const sketchBooksArr = Object.values(sketchBooks);

    // TEST ZONE
    const requestRef = useRef(null);
    const previousTimeRef = useRef(null);

    const animate = time => {
        //console.log(time)
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Make sure the effect runs only once

    // END TEST ZONE

    useEffect(() => {
        dispatch(getCovers());
    }, [dispatch])

    return (
        <>
            <h4>CanvasGrid</h4>
            {sketchBooksArr.map(sketchBook => {
                return (<PixiCanvas ref={requestRef} key={sketchBook.id} interactive={false} sketchBook={sketchBook} />)
            })}
        </>
    )
}

export default CanvasGrid;
