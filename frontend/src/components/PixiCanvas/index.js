import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { csrfFetch } from '../../store/csrf';
import { getCovers, getSketches } from '../../store/sketchBooks';
import { showSketchModal, setSketchData } from '../../store/sketchModal';
import * as PIXI from "pixi.js-legacy";

const PADDING_OFFSET = 16;

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

export class PixiApp {
    constructor(interactive = false, sketchBookId = '', parentId = null) {
        this.interactive = interactive;
        this.sketchBookId = sketchBookId;
        this.parentId = parentId;

        if (this.interactive) {
            this.scale = 1;
            this.lineWidth = 3;
        }
        else {
            this.scale = .25;
            this.lineWidth = 5;
        }

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

        if (this.interactive) {
            this.app.view.addEventListener('mousedown', this.mouseDownHandler.bind(this));
            this.app.view.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
            this.app.view.addEventListener('mouseup', this.mouseUpHandler.bind(this));
            this.app.view.addEventListener('mouseout', this.mouseUpHandler.bind(this));
        }
    }

    start() {
        if (this.interactive) {
            this.raf = window.requestAnimationFrame(() => this.step());
        }

        if (this.arr.length) {
            this.startSketchDraw();
        }
    }

    startSketchDraw() {
        this.app.stage.removeChildren();
        this.savedArr = this.arr;
        this.doDraw = true;
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

    undo() {
        this.arr.pop();
        this.app.stage.removeChildAt(this.app.stage.children.length - 1);
    }

    async createNewSketch() {
        this.savedArr = this.arr.map(subArr => subArr.map(tuple => [...tuple]));
        const res = await csrfFetch(`/api/sketches`, {
            method: 'POST',
            body: JSON.stringify({
                userId: this.user.id,
                sketchBookId: this.sketchBookId,
                parentId: this.parentId,
                points: flattenArr(this.savedArr),
                nsfw: false
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
        console.log(data);
        return data;
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

        if (!this.mouseDown)
            multiCall(this.sketchRAF.bind(this), this.linesPerUpdate);

        if (elapsed > this.frameRate) {
            this.timeStart = now - (elapsed % this.frameRate);
            if (this.mouseDown) {
                const xThresh = Math.abs(this.lastPos[0] - this.currPos[0]);
                const yThresh = Math.abs(this.lastPos[1] - this.currPos[1]);

                if (xThresh > 2 || yThresh > 2) {

                    this.line.moveTo(...this.lastPos);
                    this.line.lineTo(...this.currPos);

                    this.lastPos = this.currPos;

                    this.currArr.push([...this.currPos]);
                }
            }
        }

        this.raf = window.requestAnimationFrame(() => this.step());
    }

    mouseDownHandler(e) {
        if (this.doDraw) {
            this.renderImage();
            return;
        }
        this.lastPos = [e.offsetX - PADDING_OFFSET, e.offsetY - PADDING_OFFSET];
        this.currPos = [...this.lastPos];
        this.mouseDown = true;
        this.line = new PIXI.Graphics();
        this.line.lineStyle(this.lineWidth, this.lineColor);
        this.app.stage.addChild(this.line);

        this.currArr.push([...this.lastPos]);
    };
    mouseMoveHandler(e) {
        if (!this.mouseDown) return;

        this.currPos = [e.offsetX - PADDING_OFFSET, e.offsetY - PADDING_OFFSET];
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
                    this.image = this.image = this.app.view.toDataURL("image/png", 1);
                    return true;
                }

                // Start a new line graphic
                this.line = new PIXI.Graphics();
                this.line.lineStyle(this.lineWidth, this.lineColor);
                this.app.stage.addChild(this.line);

                this.j = 0;
            }

            this.line.moveTo(...this.savedArr[this.i][this.j]);
            this.line.lineTo(...this.savedArr[this.i][++this.j]);
        }
        return false;
    }

    renderImage() {
        if (!this.arr || !this.arr.length) return;

        this.app.stage.removeChildren();

        for (let i = 0; i < this.arr.length; i++) {
            this.line = new PIXI.Graphics();
            this.line.lineStyle(this.lineWidth, this.lineColor);
            this.app.stage.addChild(this.line);

            for (let j = 0; j < this.arr[i].length - 1; j++) {
                this.line.moveTo(...this.arr[i][j]);
                this.line.lineTo(...this.arr[i][j + 1]);
            }

            this.line = null;
        }

        this.doDraw = false;
        this.i = this.j = 0;

        this.app.renderer.render(this.app.stage);
        this.image = this.app.view.toDataURL("image/png", 1);
    }

    getDOM() {
        return this.app.view;
    }

    getImage() {
        return this.image;
    }

    setUser(user) {
        this.user = user;
    }

    setSketchBookId(id) {
        this.sketchBookId = id;
    }

    setParentId(id) {
        this.parentId = id;
    }

    setArr(points) {
        if (points) this.arr = unflattenArr(points);
    }
}

const PixiCanvas = () => {
    const user = useSelector(state => state.session.user);
    const { sketchBookId, sketchData } = useSelector(state => state.sketchModal);
    const pixiApp = useRef(new PixiApp(true, sketchBookId));
    const pixiDOM = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!pixiApp || !pixiDOM) return;

        pixiDOM.current.appendChild(pixiApp.current.getDOM());
        pixiApp.current.start();
    }, []);

    useEffect(() => {
        if (!sketchBookId || !pixiApp) return;
        console.log(`sketchBookId`, sketchBookId)
        pixiApp.current.setSketchBookId(sketchBookId);
    }, [sketchBookId]);

    useEffect(() => {
        if (!sketchData || !pixiApp) return;
        console.log(`sketchData`, sketchData)
        pixiApp.current.setParentId(sketchData.id);
        pixiApp.current.setArr(sketchData.points);
        pixiApp.current.startSketchDraw();
    }, [sketchData]);

    useEffect(() => {
        if (!user || !pixiApp) return;
        pixiApp.current.setUser(user);
    }, [user]);

    return (
        <>
            <div ref={pixiDOM} />
            <button onClick={e => dispatch(showSketchModal(false))}>Close</button>
            <button onClick={e => pixiApp.current.undo()}>Undo</button>
            <button onClick={e => pixiApp.current.testFetch()}>Test Fetch</button>
            <button onClick={e => pixiApp.current.startSketchDraw()}>Draw Test</button>
            <button onClick={async e => {
                dispatch(showSketchModal(false));
                dispatch(setSketchData(null));
                await pixiApp.current.createNewSketch();
                if (sketchBookId) {
                    dispatch(getSketches(sketchBookId));
                    console.log('dispatch get sketches')
                }
                else
                    dispatch(getCovers());
            }}> Submit </button>
        </>
    );
};


export default PixiCanvas;
