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

        const mouseDownHandler = e => {
            lastPos = [e.offsetX, e.offsetY];
            mouseDown = true;
            line = new PIXI.Graphics();
            line.lineStyle(2, '0x00FF00');
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
            console.log(currArr)
            arr.push(currArr)
            currArr = [];
        };

        const update = () => {

        }

        const redrawCanvas = async (savedArr) => {
            let line = new PIXI.Graphics();
            line.lineStyle(2, '0x00FF00');
            app.stage.addChild(line);

            function delay() {

            }

            for (let i = 0; i < savedArr.length; i++) {
                let lastPoint = savedArr[i][0];
                for (let j = 1; j < savedArr[i].length; j++) {
                    (function (n) {
                        setTimeout(() => {
                            console.log(savedArr)
                            line.moveTo(...lastPoint);
                            line.lineTo(...n);
                            lastPoint = n;
                        }, 1000 / 15);
                    })(savedArr[i][j]);
                }
            }

            arr = savedArr;
        }

        const clearCanvas = () => {
            savedArr = arr;
            arr = [];
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
        redrawBtn.addEventListener('click', e => redrawCanvas(savedArr));
        redrawBtn.innerText = 'Redraw'
        ref.current.appendChild(redrawBtn);

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
