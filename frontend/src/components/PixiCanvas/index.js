import React, { useEffect, useRef } from 'react';
import * as PIXI from "pixi.js";

let mouseDown = false;

const PixiCanvas = () => {
    const ref = useRef(null);


    useEffect(() => {
        let lastPos;
        let line = null;
        let arr = [];
        let currArr = [];
        let savedArr = [];
        let redraw = false;

        const mouseDownHandler = e => {
            lastPos = [e.offsetX, e.offsetY];
            mouseDown = true;
            line = new PIXI.Graphics();
            line.lineStyle(3, '0x00FF00');
            app.stage.addChild(line);

            currArr.push(lastPos);
        };
        const mouseMoveHandler = e => {
            if (!mouseDown) return;

            let currPos = [e.offsetX, e.offsetY];
            line.moveTo(...lastPos);
            line.lineTo(...currPos);

            lastPos = currPos;
            currArr.push(currPos);
        };
        const mouseUpHandler = e => {
            if (!mouseDown) return
            mouseDown = false;
            arr.push(currArr)
            currArr = [];
            line = null;
        };

        const update = () => {
            if (redraw && savedArr.length > 0) {
                if (line === null) {
                    line = new PIXI.Graphics();
                    line.lineStyle(3, '0x00FF00');
                    app.stage.addChild(line);
                }

                line.moveTo(...savedArr[0][0]);
                line.lineTo(...savedArr[0][1]);

                savedArr[0].shift();
                if (savedArr[0].length === 1)
                    savedArr.shift();
                if (savedArr.length === 0) {
                    redraw = false;
                    line = null;
                }
            }
        }


        const redrawCanvas = () => {
            redraw = true;
        }

        const clearCanvas = () => {
            savedArr = arr.map(subArr => subArr.map(tuple => [...tuple]));
            app.stage.removeChildren();
        }

        const app = new PIXI.Application({ width: 256, height: 256 });
        ref.current.appendChild(app.view);

        app.stage.interactive = true;

        app.view.addEventListener('mousedown', mouseDownHandler);
        app.view.addEventListener('pointermove', mouseMoveHandler);
        app.view.addEventListener('pointerup', mouseUpHandler);
        app.view.addEventListener('mouseout', mouseUpHandler);

        app.start();

        const clearBtn = document.createElement('button');
        clearBtn.addEventListener('click', clearCanvas);
        clearBtn.innerText = 'Clear'
        ref.current.appendChild(clearBtn);

        const redrawBtn = document.createElement('button');
        redrawBtn.addEventListener('click', e => redrawCanvas());
        redrawBtn.innerText = 'Redraw'
        ref.current.appendChild(redrawBtn);

        setInterval(update, 1000/60);

        return () => {
            app.destroy(true, true);
        }
    }, [])

    return (
        <>
            <div ref={ref} />
        </>
    );
}

export default PixiCanvas;
