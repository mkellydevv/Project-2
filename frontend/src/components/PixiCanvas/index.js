import React, { useEffect, useRef } from 'react';
import { csrfFetch } from '../../store/csrf';
import * as PIXI from "pixi.js";

let mouseDown = false;

const PixiCanvas = () => {
    const ref = useRef(null);

    useEffect(() => {
        let lastPos;
        let currPos;
        let line = null;
        let arr = [];
        let currArr = [];
        let savedArr = [];
        let doDraw = false;
        let i = 0;
        let j = 0;
        let linesPerUpdate = 1;
        let lineColor = '0x000000';

        const multiCall = (cb, amount) => {
            for (let i = 0; i < amount; i++)
                cb();
        }

        (async ()=>{
            const res = await fetch(`/api/sketches/${3}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            let data = await res.json();
            //arr = data[0].points;
            console.log(data.points);
            arr = unflattenArr(data.points);
        })()

        const flattenArr = (arr) => {
            let retArr = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++)
                    retArr.push([...arr[i][j]]);
                retArr.push([null, null]);
            }
            return retArr;
        }

        const unflattenArr = (arr) => {
            let retArr = [];
            let subArr = [];
            for (const tuple of arr) {
                console.log(tuple)
                if (tuple[0] === null) {
                    retArr.push(subArr);
                    subArr = [];
                }
                else {
                    subArr.push([...tuple]);
                }
            }
            return retArr;
        }

        const createNewSketch = async () => {
            const res = await csrfFetch(`/api/sketches`, {
                method: 'POST',
                body: JSON.stringify({
                    userId: 1,
                    sketchBookId: 1,
                    points: flattenArr(savedArr),
                    flagged: 0,
                    nsfw: false
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let data = await res.json();
            console.log(data);
        }

        const step = () => {
            const now = Date.now();
            const elapsed = now - timeStart;

            if (elapsed > frameRate) {
                timeStart = now - (elapsed % frameRate);
                if (mouseDown) {
                    let xThresh = Math.abs(lastPos[0] - currPos[0]);
                    let yThresh = Math.abs(lastPos[1] - currPos[1]);

                    if (xThresh > 3 || yThresh > 3) {

                        line.moveTo(...lastPos);
                        line.lineTo(...currPos);

                        lastPos = currPos;

                        currArr.push(currPos);
                    }
                }
                else {
                    multiCall(sketchRAF, linesPerUpdate);
                }
            }

            window.requestAnimationFrame(step);
        }
        let timeStart = Date.now();
        let frameRate = 1000 / 30;
        window.requestAnimationFrame(step);

        const mouseDownHandler = e => {
            lastPos = [e.offsetX, e.offsetY];
            currPos = [e.offsetX + 1, e.offsetY];
            mouseDown = true;
            line = new PIXI.Graphics();
            line.lineStyle(3, lineColor);
            app.stage.addChild(line);

            currArr.push(lastPos);
        };
        const mouseMoveHandler = e => {
            if (!mouseDown) return;

            currPos = [e.offsetX, e.offsetY];
        };
        const mouseUpHandler = e => {
            if (!mouseDown) return
            mouseDown = false;
            console.log(currArr.length)
            if (currArr.length > 1) {
                arr.push(currArr)
            }
            currArr = [];
            line = null;
        };

        const sketchLoop = () => {
            let line = new PIXI.Graphics();
            line.lineStyle(3, lineColor);
            app.stage.addChild(line);

            for (let i = 0; i < savedArr.length; i++) {
                let lastPoint = savedArr[i][0];
                for (let j = 1; j < savedArr[i].length; j++) {
                    line.moveTo(...lastPoint);
                    line.lineTo(...savedArr[i][j]);
                    lastPoint = savedArr[i][j];
                }
            }
        }

        const sketchRAF = () => {
            if (doDraw) {
                if (line === null) {
                    line = new PIXI.Graphics();
                    line.lineStyle(3, lineColor);
                    app.stage.addChild(line);
                }

                if (j === savedArr[i].length - 1) {
                    i++;
                    if (i === savedArr.length) {
                        doDraw = false;
                        line = null;
                        i = j = 0;
                        return;
                    }
                    j = 0;
                }

                line.moveTo(...savedArr[i][j]);
                line.lineTo(...savedArr[i][++j]);
            }
        }

        const sketchInterval = () => {
            const interval = setInterval(() => {
                if (savedArr.length > 0) {
                    if (line === null) {
                        line = new PIXI.Graphics();
                        line.lineStyle(3, lineColor);
                        app.stage.addChild(line);
                    }

                    line.moveTo(...savedArr[0][0]);
                    line.lineTo(...savedArr[0][1]);

                    savedArr[0].shift();
                    if (savedArr[0].length === 1)
                        savedArr.shift();
                    if (savedArr.length === 0) {
                        line = null;
                        clearInterval(interval);
                    }
                }
            }, 1);
        }

        const clearCanvas = () => {
            savedArr = arr.map(subArr => subArr.map(tuple => [...tuple]));
            console.log(savedArr)
            createNewSketch();
            doDraw = true;
            app.stage.removeChildren();
        }

        const app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: '0xe1e3dd'
        });
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
        redrawBtn.addEventListener('click', e => sketchLoop(i, j, 1));
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
