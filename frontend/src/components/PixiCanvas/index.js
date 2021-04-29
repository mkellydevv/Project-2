import React, { useEffect, useRef, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import { csrfFetch } from '../../store/csrf';
import * as PIXI from "pixi.js-legacy";

// Helper Functions

function multiCall(cb, amount) {
    let result = null;
    for (let i = 0; i < amount; i++)
        result = cb();
    return result;
}

function flattenArr(arr) {
    const retArr = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++)
            retArr.push([...arr[i][j]]);
        retArr.push([null, null]);
    }
    return retArr;
}

function unflattenArr(arr) {
    const retArr = [];
    let subArr = [];
    for (const tuple of arr) {
        if (tuple[0] === null) {
            retArr.push(subArr);
            subArr = [];
        }
        else
            subArr.push([...tuple]);
    }
    return retArr;
}

class PixiCanvasClass {
    constructor(interactive = false) {
        this.interactive = interactive;

        if (this.interactive) {
            this.scale = 1;
            this.lineWidth = 3;
        }
        else {
            this.scale = .25;
            this.lineWidth = 5;
        }

        this.sketchBookId = '';

        this.w = 800;
        this.h = 600;
        this.lastPos = null;
        this.currPos = null;
        this.line = null;
        this.arr = [];
        this.currArr = [];
        this.savedArr = [];
        this.doDraw = false;
        this.i = 0;
        this.j = 0;
        this.linesPerUpdate = 1;
        this.lineColor = 0x000000;
        this.user = null;
        this.mouseDown = false;

        this.timeStart = Date.now();
        this.frameRate = 1000 / 30;
        this.raf = null;

        this.image = null;

        this.app = new PIXI.Application({
            width: this.w,
            height: this.h,
            backgroundColor: 0xE1E3DD,
            autoStart: true,
            forceCanvas: true,
            preserveDrawingBuffer: true
        });

        this.app.renderer.resize(this.w * this.scale, this.h * this.scale)
        this.app.stage.scale.set(this.scale, this.scale)
    }

    start() {
        this.raf = window.requestAnimationFrame(() => this.step());
        if (this.arr?.length) {
            this.loadSketch();
        }
    }

    async testFetch(id = 13) {
        const res = await fetch(`/api/sketches/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let data = await res.json();
        console.log(data.points);
        this.arr = unflattenArr(data.points);
    }

    async createNewSketch() {
        this.savedArr = this.arr.map(subArr => subArr.map(tuple => [...tuple]));
        const res = await csrfFetch(`/api/sketches`, {
            method: 'POST',
            body: JSON.stringify({
                userId: this.user.id,
                sketchBookId: this.sketchBookId,
                points: flattenArr(this.savedArr),
                nsfw: false
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
        console.log(data);
    }

    async updateSketch() {
        const res = await csrfFetch(`/api/sketches/${2}`, {
            method: 'PATCH',
            body: JSON.stringify({
                nsfw: true
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
    }

    step() {
        const now = Date.now();
        const elapsed = now - this.timeStart;
        let result = null;

        if (elapsed > this.frameRate) {
            this.timeStart = now - (elapsed % this.frameRate);
            if (this.mouseDown) {
                let xThresh = Math.abs(this.lastPos[0] - this.currPos[0]);
                let yThresh = Math.abs(this.lastPos[1] - this.currPos[1]);

                if (xThresh > 3 || yThresh > 3) {

                    this.line.moveTo(...this.lastPos);
                    this.line.lineTo(...this.currPos);

                    this.lastPos = this.currPos;

                    this.currArr.push([...this.currPos]);
                }
            }
            else {
                result = multiCall(this.sketchRAF.bind(this), this.linesPerUpdate);
            }
        }

        if (result === false)
            console.log('falseeeeeee')
        // else
        //     console.log('1')
        if (result !== false)
            this.raf = window.requestAnimationFrame(() => this.step());
    }

    mouseDownHandler(e) {
        this.lastPos = [e.offsetX, e.offsetY];
        this.currPos = [e.offsetX + 1, e.offsetY];
        this.mouseDown = true;
        this.line = new PIXI.Graphics();
        this.line.lineStyle(this.lineWidth, this.lineColor);
        this.app.stage.addChild(this.line);

        this.currArr.push([...this.lastPos]);
    };
    mouseMoveHandler(e) {
        if (!this.mouseDown) return;

        this.currPos = [e.offsetX, e.offsetY];
    };
    mouseUpHandler(e) {
        if (!this.mouseDown) return
        this.mouseDown = false;
        if (this.currArr.length > 1) {
            this.arr.push([...this.currArr]);
        }
        this.currArr = [];
        this.line = null;
    };

    sketchRAF() {
        if (this.doDraw) {
            if (this.line === null) {
                this.line = new PIXI.Graphics();
                this.line.lineStyle(this.lineWidth, this.lineColor);
                this.app.stage.addChild(this.line);
            }

            if (this.j === this.savedArr[this.i].length - 1) {
                this.i++;
                if (this.i === this.savedArr.length) {
                    this.doDraw = false;
                    this.line = null;
                    this.i = this.j = 0;
                    let id = this.raf;
                    while (id--) {
                        window.cancelAnimationFrame(id);
                    }
                    return false;
                }
                this.j = 0;
            }

            this.line.moveTo(...this.savedArr[this.i][this.j]);
            this.line.lineTo(...this.savedArr[this.i][++this.j]);
        }
    }

    getImage() {
        if (!this.arr || !this.arr.length)
            return;
        let arr = this.arr;
        let line = new PIXI.Graphics();
        line.lineStyle(this.lineWidth, this.lineColor);
        this.app.stage.addChild(line);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length - 1; j++) {
                line.moveTo(...arr[i][j]);
                line.lineTo(...arr[i][j + 1]);
            }
        }
        this.app.renderer.render(this.app.stage)
        this.image = this.app.view.toDataURL("image/png", 1);
        return this.image;
    }

    loadSketch() {
        this.app.stage.removeChildren();
        this.savedArr = this.arr;
        this.doDraw = true;
    }

    getDOM() {
        if (!this.interactive) {
            //const img = document.createElement('img');
            //img.src = this.getImage();
            //return img;
            return this.app.view;
        }

        this.app.view.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.app.view.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
        this.app.view.addEventListener('mouseup', this.mouseUpHandler.bind(this));
        this.app.view.addEventListener('mouseout', this.mouseUpHandler.bind(this));

        const clearBtn = document.createElement('button');
        clearBtn.addEventListener('click', function (e) {
            this.loadSketch();
        }.bind(this));
        clearBtn.innerText = 'Load Sketch'

        const btn2 = document.createElement('button');
        btn2.addEventListener('click', function (e) { this.createNewSketch() }.bind(this));
        btn2.innerText = 'Save Sketch';

        const redrawBtn = document.createElement('button');
        redrawBtn.addEventListener('click', function (e) { this.testFetch() }.bind(this));
        redrawBtn.innerText = 'Test Fetch';

        const container = document.createElement('div');
        container.appendChild(this.app.view);
        container.appendChild(clearBtn);
        container.appendChild(btn2);
        container.appendChild(redrawBtn);

        return container;
    }

    setUser(user) {
        this.user = user;
    }

    setArr(points) {
        if (points) this.arr = unflattenArr(points);
    }
}

const PixiCanvas = forwardRef(({ interactive, sketchBook }, ref) => {
    const points = sketchBook?.Sketches[0].points;
    const user = useSelector(state => state.session.user);
    const pixiCanvas = useRef(new PixiCanvasClass(interactive));
    const pixiDOM = useRef(null);

    useEffect(() => {
        pixiCanvas.current.setArr(points);
        pixiDOM.current.appendChild(pixiCanvas.current.getDOM());
        pixiCanvas.current.start();
    }, []);

    useEffect(() => {
        pixiCanvas.current.setUser(user);
    }, [user]);

    return (
        <div ref={pixiDOM}>id: {sketchBook?.id}</div>
    );
});

// ({ interactive, sketchBook }) => {
//     const points = sketchBook?.Sketches[0].points;
//     const user = useSelector(state => state.session.user);
//     const pixiCanvas = useRef(new PixiCanvasClass(interactive));
//     const pixiDOM = useRef(null);
//     const myRef = useRef(ref);
//     console.log('object', ref)

//     useEffect(() => {
//         pixiCanvas.current.setArr(points);
//         pixiDOM.current.appendChild(pixiCanvas.current.getDOM());
//         pixiCanvas.current.start();
//     }, []);

//     useEffect(() => {
//         pixiCanvas.current.setUser(user);
//     }, [user]);

//     return (
//         <div ref={pixiDOM}>id: {sketchBook?.id}</div>
//     );
// }

export default PixiCanvas;
