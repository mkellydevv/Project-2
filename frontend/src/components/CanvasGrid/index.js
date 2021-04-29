import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCovers } from "../../store/sketchBooks";
import PixiCanvas from "../PixiCanvas";

import './CanvasGrid.css';

const CanvasGrid = () => {
    const dispatch = useDispatch();
    const sketchBooks = useSelector(state => state.sketchBooks);
    const sketchBooksArr = Object.values(sketchBooks);

    useEffect(() => {
        dispatch(getCovers());
    }, [dispatch])

    return (
        <>
            <h4>CanvasGrid</h4>
            {sketchBooksArr.map(sketchBook => {
                return (<PixiCanvas key={sketchBook.id} interactive={false} sketchBook={sketchBook}/>)
            })}
        </>
    )
}

export default CanvasGrid;
