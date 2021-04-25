import React, { useEffect, useRef } from 'react';
import * as PIXI from "pixi.js";

let mouseDown = false;

const PixiCanvas = () => {
    const ref = useRef(null);


    useEffect(() => {
        let lastPos;
        let line = null;

        const mouseDownHandler = e => {
            lastPos = [e.offsetX, e.offsetY];
            mouseDown = true;
            line = new PIXI.Graphics();
            line.lineStyle(2,'0x00FF00');
            app.stage.addChild(line);
        };
        const mouseMoveHandler = e => {
            if (!mouseDown) return;

            let currPos = [e.offsetX, e.offsetY];
            line.moveTo(...lastPos);
            line.lineTo(...currPos);

            lastPos = currPos;
        };
        const mouseUpHandler = e => {
            mouseDown = false;
        };

        const app = new PIXI.Application({ width: 256, height: 256 });
        ref.current.appendChild(app.view);

        app.stage.interactive = true;

        app.view.addEventListener('mousedown', mouseDownHandler);
        app.view.addEventListener('pointermove', mouseMoveHandler);
        app.view.addEventListener('pointerup', mouseUpHandler);

        app.start();

        return () => {
            app.destroy(true, true);
        }
    }, [])

    return (
        <div ref={ref} />
    );
}

export default PixiCanvas;
