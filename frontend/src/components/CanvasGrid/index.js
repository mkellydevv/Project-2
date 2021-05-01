import { createRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { PixiApp } from "../PixiCanvas";
import { getCovers, getSketches } from "../../store/sketchBooks";
import { showSketchModal, setSketchBookId } from '../../store/sketchModal';

import './CanvasGrid.css';

const CanvasGrid = ({ sketchType }) => {
    const refreshTime = 1000; // In seconds
    const { id: sketchBookId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const [pix, setPix] = useState([]);
    const pixiApps = useRef(pix);
    const animCount = useRef(0);
    const pixiDOMRefs = [];

    const data = useSelector(state => state.sketchBooks);
    const { sketchBooksObj: sketchBooks, currSketchType } = data;
    let sketchBooksArr = [];
    let sketchArr = [];

    if (sketchType === 'cover') {
        sketchBooksArr = sketchBooks ? Object.values(sketchBooks).reverse() : [];
        for (let i in sketchBooksArr)
            pixiDOMRefs[i] = createRef();
    }
    else if (sketchType === 'sketch') {
        sketchArr = sketchBooks ? Object.values(sketchBooks)[0]?.Sketches : [];
        for (let i in sketchArr)
            pixiDOMRefs[i] = createRef();
    }

    const requestRef = useRef(null);

    const getSketchBookData = () => {
        if (sketchType === 'cover') {
            dispatch(getCovers());
            console.log('dispatch get covers')
        }
        else if (sketchType === 'sketch' && sketchBookId){
            dispatch(getSketches(sketchBookId));
            console.log('dispatch get Sketches')
        }
        else
            console.log('Invalid CanvasGrid props, params, or queries');
    }

    useEffect(() => {
        let interval = setInterval(() => {
            getSketchBookData();
        }, 1000 * refreshTime);
        return () => { clearInterval(interval) };
    }, [])

    useEffect(() => {
        getSketchBookData();
    }, [dispatch])

    useEffect(() => {
        if (currSketchType !== sketchType) return;
        if (!sketchBooks || Object.keys(sketchBooks).length === 0) return;

        if (sketchType === 'cover') {
            const len = sketchBooksArr.length;
            const newArr = new Array(len);

            for (let i = 0; i < len; i++) {
                newArr[i] = new PixiApp(false);
            };
            pixiApps.current = newArr;
            setPix(newArr);
            animCount.current = len;

            for (let i = 0; i < len; i++) {
                const pixiApp = pixiApps.current[i];
                const sketchBook = sketchBooksArr[i];


                pixiApp.setArr(sketchBook?.Sketches[0].points);
                if (pixiDOMRefs[i].current?.children.length === 0)
                    pixiDOMRefs[i].current?.appendChild(pixiApp.getDOM());
                pixiApp.start();
            }
        }
        else if (sketchType === 'sketch') {
            const len = sketchArr.length;
            const newArr = new Array(len);

            console.log(`sketchBooks`, Object.values(sketchBooks)[0].id)

            for (let i = 0; i < len; i++) {
                newArr[i] = new PixiApp(false, Object.values(sketchBooks)[0].id);
            };
            pixiApps.current = newArr;
            setPix(newArr);
            animCount.current = len;

            for (let i = 0; i < len; i++) {
                const pixiApp = pixiApps.current[i];
                const sketch = sketchArr[i];

                pixiApp.setArr(sketch.points);
                if (pixiDOMRefs[i].current?.children.length === 0)
                    pixiDOMRefs[i].current?.appendChild(pixiApp.getDOM());
                pixiApp.start();
            }
        }
        else {
            console.log('Something went wrong in the sketchBooks useEffect')
        }

        return () => { };
    }, [sketchBooks])

    useEffect(() => {
        if (!pix) return;
        //console.log(pixiApps.current)

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

    useEffect(() => {
        //console.log('useEffect')
    }, [])

    const showModal = (val) => {
        dispatch(showSketchModal(val));
    }

    return (
        <>
            <h4>CanvasGrid</h4>
            <button onClick={e => getSketchBookData()}>Refresh</button>
            {sketchType === 'cover' && sketchBooksArr?.map((sketchBook, i) => (
                <div ref={pixiDOMRefs[i]} key={`sketchBookId-${sketchBook.id}`} onClick={e => {
                    dispatch(setSketchBookId(sketchBook.id));
                    history.push(`/sketchbook/${sketchBook.id}`)
                }} />
            ))}
            {sketchType === 'sketch' && sketchArr?.map((sketch, i) => (
                <div ref={pixiDOMRefs[i]} key={`sketchId-${sketch.id}`} onClick={e => {
                    dispatch(setSketchBookId(sketchBookId));
                    showModal(true);
                }} />
            ))}
        </>
    )
}

export default CanvasGrid;
