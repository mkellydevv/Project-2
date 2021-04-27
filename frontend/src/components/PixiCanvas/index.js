import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { csrfFetch } from '../../store/csrf';
import * as PIXI from "pixi.js";

// Helper Functions

function multiCall(cb, amount) {
    for (let i = 0; i < amount; i++)
        cb();
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
    constructor(user = null) {
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
        this.lineColor = '0x000000';
        this.user = user;
        this.mouseDown = false;

        this.timeStart = Date.now();
        this.frameRate = 1000 / 30;

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: '0xe1e3dd'
        });
    }

    start () {
        window.requestAnimationFrame(() => this.step());
    }

    async testFetch(id = 3) {
        const res = await fetch(`/api/sketches/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let data = await res.json();
        //arr = data[0].points;
        console.log(data.points);
        this.arr = unflattenArr(data.points);
    }

    async createNewSketch() {
        console.log('user.id', this.user)
        const res = await csrfFetch(`/api/sketches`, {
            method: 'POST',
            body: JSON.stringify({
                userId: this.user.id,
                sketchBookId: 2,
                points: flattenArr(this.savedArr),
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
        console.log(data);
    }

    step() {
        const now = Date.now();
        const elapsed = now - this.timeStart;

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
                multiCall(() => {
                    this.sketchRAF()}, this.linesPerUpdate);
            }
        }

        window.requestAnimationFrame(() => this.step());
    }

    mouseDownHandler(e) {
        this.lastPos = [e.offsetX, e.offsetY];
        this.currPos = [e.offsetX + 1, e.offsetY];
        this.mouseDown = true;
        this.line = new PIXI.Graphics();
        this.line.lineStyle(3, this.lineColor);
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
        console.log(this.currArr.length)
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
                this.line.lineStyle(3, this.lineColor);
                this.app.stage.addChild(this.line);
            }

            if (this.j === this.savedArr[this.i].length - 1) {
                this.i++;
                if (this.i === this.savedArr.length) {
                    this.doDraw = false;
                    this.line = null;
                    this.i = this.j = 0;
                    return;
                }
                this.j = 0;
            }

            this.line.moveTo(...this.savedArr[this.i][this.j]);
            this.line.lineTo(...this.savedArr[this.i][++this.j]);
        }
    }

    clearCanvas() {
        this.savedArr = this.arr.map(subArr => subArr.map(tuple => [...tuple]));
        console.log(this.savedArr)
        this.createNewSketch();
        this.doDraw = true;
        this.app.stage.removeChildren();
    }

    getRef(ref) {
        this.app.stage.interactive = true;

        this.app.view.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.app.view.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
        this.app.view.addEventListener('mouseup', this.mouseUpHandler.bind(this));
        this.app.view.addEventListener('mouseout', this.mouseUpHandler.bind(this));

        this.app.start();

        const clearBtn = document.createElement('button');
        clearBtn.addEventListener('click', this.clearCanvas.bind(this));
        clearBtn.innerText = 'Clear'

        const redrawBtn = document.createElement('button');
        redrawBtn.addEventListener('click', function (e) {this.updateSketch()}.bind(this));
        redrawBtn.innerText = 'Button';

        const container = document.createElement('div');

        ref.current.appendChild(this.app.view);
        ref.current.appendChild(clearBtn);
        ref.current.appendChild(redrawBtn);
        console.log(container)
        return container;
    }

}

const PixiCanvas = () => {
    const ref = useRef(null);
    const user = useSelector(state => state.session.user);
    const pixiCanvas = new PixiCanvasClass(user);

    //pixiCanvas.start();
    //ref = ref.current.appendChild(pixiCanvas.getRef(ref));

    useEffect(() => {
        if (!user) return;

        pixiCanvas.getRef(ref);
        console.log(ref);
        pixiCanvas.start();

        return () => {
            pixiCanvas.destroy(true, true);
        }
    }, [user])

    return (
        <div ref={ref} />
    );
}

export default PixiCanvas;
