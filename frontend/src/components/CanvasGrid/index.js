import { createRef, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCovers } from "../../store/sketchBooks";
import PixiCanvas, { PixiCanvasClass } from "../PixiCanvas";

import './CanvasGrid.css';

const CanvasGrid = () => {
    const dispatch = useDispatch();
    const sketchBooks = useSelector(state => state.sketchBooks);
    const sketchBooksArr = Object.values(sketchBooks);
    const pixiDOMArr = [];
    const buh = useRef([]);
    const pixiArr = sketchBooksArr.map((el, i) => {
        pixiDOMArr[i] = createRef();
        return new PixiCanvasClass(false)
    });

    // TEST ZONE
    const requestRef = useRef(null);
    const previousTimeRef = useRef(null);

    const animate = time => {
        //console.log(time)
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    // END TEST ZONE

    useEffect(() => {
        dispatch(getCovers());
    }, [dispatch])

    useEffect(() => {
        for (let i = 0; i < pixiArr.length; i++) {
            let pixiCanvas = pixiArr[i];
            let sketchBook = sketchBooksArr[i];
            const points = sketchBook?.Sketches[0].points;

            pixiCanvas.setArr(points);
            pixiDOMArr[i].current?.appendChild(pixiCanvas.getDOM());
            //buh.current = pixiCanvas.getDOM();
            pixiCanvas.start();
        }

        //console.log('buh',buh.children)
        console.log(pixiDOMArr)

        return () => {}
    }, [sketchBooks])

    useEffect(() => {


        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
    // Make sure the effect runs only once

    return (
        <>
            <h4>CanvasGrid</h4>
            {sketchBooksArr.map((sketchBook, i) => {
                return <div ref={pixiDOMArr[i]} key={sketchBook.id}/>
            })}
        </>
    )
}

export default CanvasGrid;
