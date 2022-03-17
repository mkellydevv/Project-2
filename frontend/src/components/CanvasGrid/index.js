import { createRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { PixiApp } from '../PixiCanvas';
import { getCovers, getSketches } from '../../store/sketchBooks';
import {
  showSketchModal,
  setSketchBookId,
  setSketchData,
} from '../../store/sketchModal';

import './CanvasGrid.css';

const CanvasGrid = ({ sketchType }) => {
  const refreshTime = 5; // In seconds
  const { id: sketchBookId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const [pix, setPix] = useState([]);
  const pixiApps = useRef(pix);
  const animCount = useRef(0);
  const newestId = useRef(null);
  const pixiDOMRefs = [];
  const obj = useRef({});

  console.log('renderingggggggggggggggggggggggggggg');

  const {
    sketchBooksObj: sketchBooks,
    currSketchType,
    newSketchBookCount,
  } = useSelector((state) => state.sketchBooks);
  let sketchBooksArr = [];
  let sketchArr = [];

  //console.log(`sketchBooks`, sketchBooks)
  if (sketchType === 'cover') {
    sketchBooksArr = sketchBooks ? Object.values(sketchBooks).reverse() : [];

    for (let i in sketchBooksArr) pixiDOMRefs[i] = createRef();
  } else if (sketchType === 'sketch') {
    sketchArr = sketchBooks ? Object.values(sketchBooks) : [];

    for (let i in sketchArr) pixiDOMRefs[i] = createRef();
  }

  const requestRef = useRef(null);

  const getSketchBookData = () => {
    if (sketchType === 'cover') {
      dispatch(getCovers());
    } else if (sketchType === 'sketch' && sketchBookId) {
      dispatch(getSketches(sketchBookId));
    } else console.log('Invalid CanvasGrid props, params, or queries');
  };

  useEffect(() => {
    let interval = setInterval(() => {
      //getSketchBookData();
      dispatch(getCovers(newestId.current));
    }, 1000 * refreshTime);

    return () => {
      clearInterval(interval);

      if (pixiApps.current) {
        for (let i = 0; i < pixiApps.current.length; i++) {
          pixiApps.current[i].destroy();
          pixiApps.current[i] = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    getSketchBookData();
  }, [dispatch]);

  // Dependencies: sketchBooks
  useEffect(() => {
    if (currSketchType !== sketchType) return;
    if (!sketchBooks || Object.keys(sketchBooks).length === 0) return;

    console.log('sketch books has changed ----------------------------');

    //console.log(`sketchBooks sketchType`, sketchBooks, sketchType)

    if (sketchType === 'cover') {
      console.log('sketchBooksArr', sketchBooksArr);
      if (newSketchBookCount && false) {
        for (let i = 0; i < newSketchBookCount; i++) {
          pixiApps.current.unshift(new PixiApp(false));
        }
        console.log('pixiApps.current', pixiApps.current);
        setPix(pixiApps.current);
        animCount.current = newSketchBookCount;
        newestId.current = sketchBooksArr[0].id;

        for (let i = 0; i < newSketchBookCount; i++) {
          const pixiApp = pixiApps.current[i];
          const sketchBook = sketchBooksArr[i];

          if (sketchBook.Sketches.length === 0) continue;

          pixiApp.setArr(sketchBook.Sketches[0].points);
          if (pixiDOMRefs[i].current?.children.length === 0)
            pixiDOMRefs[i].current?.appendChild(pixiApp.getDOM());

          pixiApp.start();
        }

        return;
      }

      const len = sketchBooksArr.length;
      const newArr = new Array(len);

      for (let i = 0; i < len; i++) {
        let s = sketchBooksArr[i];
        let newApp = new PixiApp(false);
        obj.current[s['id']] = {};
        obj.current[s['id']]['pixiApp'] = newApp;
        newApp.setArr(s.Sketches[0].points);
        obj.current[s['id']]['dom'] = newApp.getDOM();
        document
          .getElementById(`sketchBookId-${s.id}`)
          .appendChild(newApp.getDOM());
        newArr[i] = newApp;
      }
      console.log(obj);
      pixiApps.current = newArr;
      setPix(newArr);
      animCount.current = len;
      newestId.current = sketchBooksArr[0].id;

      for (let i = 0; i < len; i++) {
        const pixiApp = pixiApps.current[i];
        const sketchBook = sketchBooksArr[i];

        if (sketchBook.Sketches.length === 0) continue;

        pixiApp.setArr(sketchBook.Sketches[0].points);
        if (pixiDOMRefs[i].current?.children.length === 0) {
          pixiDOMRefs[i].current.appendChild(pixiApp.getDOM());
          //pixiDOMRefs[i].current = pixiApp // STORE THESE TWO TOGETHER?
        }
        pixiApp.start();
      }
    } else if (sketchType === 'sketch') {
      const len = sketchArr.length;
      const newArr = new Array(len);

      for (let i = 0; i < len; i++) {
        newArr[i] = new PixiApp(false, sketchArr[i].parentId);
      }
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
    } else {
      console.log('Something went wrong in the sketchBooks useEffect');
    }

    return () => {};
  }, [sketchBooks]);

  // Dependencies: pix
  useEffect(() => {
    if (!pix) return;

    const step = (time) => {
      const newPix = [];
      for (let i = 0; i < pixiApps.current.length; i++) {
        const pixiApp = pixiApps.current[i];

        pixiApp.sketchRAF();

        if (pixiApp.doDraw === false) {
          const imageSrc = pixiApp.getImage();
          if (imageSrc !== null) {
            const imgEle = document.createElement('img');
            imgEle.src = imageSrc;
            imgEle.draggable = false;
            pixiDOMRefs[i].current?.removeChild(
              pixiDOMRefs[i].current.children[0]
            );
            pixiDOMRefs[i].current?.appendChild(imgEle);
          }
        } else {
          newPix.push(pixiApp);
        }
      }

      if (newPix.length !== animCount.current) {
        animCount.current = newPix.length;
        setPix(newPix);
      }

      if (animCount.current > 0) {
        requestRef.current = requestAnimationFrame(step);
      }
    };

    requestRef.current = requestAnimationFrame(step);
    return () => {
      console.log('Finished animating');
      console.log(`obj`, obj);
      cancelAnimationFrame(requestRef.current);
    };
  }, [pix]);

  return (
    <div className="pixiGrid">
      {sketchType === 'cover' &&
        sketchBooksArr?.map((sketchBook, i) => {
          let b = (
            <div
              className="sketchMini"
              id={`sketchBookId-${sketchBook.id}`}
              key={`sketchBookId-${sketchBook.id}`}
              onClick={(e) => {
                dispatch(setSketchBookId(sketchBook.id));
                history.push(`/sketchbook/${sketchBook.id}`);
              }}
            />
          );
          return b;
        })}
      {sketchType === 'sketch' &&
        sketchArr?.map((sketch, i) => (
          <div
            className="sketchMini"
            ref={pixiDOMRefs[i]}
            key={`sketchId-${sketch.id}`}
            onClick={(e) => {
              dispatch(setSketchBookId(sketchBookId));
              dispatch(setSketchData(sketch));
              dispatch(showSketchModal(true));
            }}
          />
        ))}
    </div>
  );
};

export default CanvasGrid;
