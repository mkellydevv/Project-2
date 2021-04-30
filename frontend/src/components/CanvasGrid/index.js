import { createRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCovers } from "../../store/sketchBooks";
import { PixiCanvasClass } from "../PixiCanvas";

import './CanvasGrid.css';

const CanvasGrid = () => {
    const dispatch = useDispatch();

    const [pix, setPix] = useState([]);
    const pixiApps = useRef(pix);
    const animCount = useRef(0);
    const pixiDOMRefs = [];

    const sketchBooks = useSelector(state => state.sketchBooks);
    const sketchBooksArr = Object.values(sketchBooks);

    for (let i in sketchBooksArr)
        pixiDOMRefs[i] = createRef();

    const requestRef = useRef(null);

    useEffect(() => {
        dispatch(getCovers());
    }, [dispatch])

    useEffect(() => {
        if (!sketchBooks) return;

        const len = sketchBooksArr.length;
        const newArr = new Array(len);

        for (let i = 0; i < len; i++) {
            newArr[i] = new PixiCanvasClass(false);
        };
        pixiApps.current = newArr;
        setPix(newArr);
        animCount.current = len;

        for (let i = 0; i < len; i++) {
            const pixiApp = pixiApps.current[i];
            const sketchBook = sketchBooksArr[i];

            pixiApp.setArr(sketchBook?.Sketches[0].points);
            pixiDOMRefs[i].current?.appendChild(pixiApp.getDOM());
            pixiApp.start();
        }

        return () => {};
    }, [sketchBooks])

    useEffect(() => {
        if (!pix) return;

        const step = time => {
            const newPix = [];
            for (let i = 0; i < pixiApps.current.length; i++) {
                let el = pixiApps.current[i];
                el.sketchRAF();
                if (el.doDraw === false) {
                    let imageSrc = el.image;
                    pixiDOMRefs[i].current?.removeChild(pixiDOMRefs[i].current.children[0]);
                    let img = document.createElement('img');
                    img.src = imageSrc;
                    pixiDOMRefs[i].current?.appendChild(img)
                }
                else {
                    newPix.push(el);
                }
            }

            if (newPix.length !== animCount.current) {
                animCount.current = newPix.length;
                setPix(newPix);
            }

            if (animCount.current > 0) {
                requestRef.current = requestAnimationFrame(step);
            }
        }

        requestRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(requestRef.current);
    }, [pix])

    return (
        <>
            <h4>CanvasGrid</h4>
            {sketchBooksArr?.map((sketchBook, i) => (
                <div ref={pixiDOMRefs[i]} key={sketchBook.id} />
            ))}
        </>
    )
}

export default CanvasGrid;
