const express = require('express');
const asyncHandler = require('express-async-handler');

const { Sketch, SketchBook } = require('../../db/models');

const router = express.Router();

// GET all sketches
router.get('/', asyncHandler(async function(_req, res) {
    const sketches = await Sketch.getAllSketches();
    return res.json(sketches);
}));

// GET a sketch by id
router.get('/:id', asyncHandler(async function(req, res) {
    const sketch = await Sketch.getSketchById(req.params.id);
    return res.json(sketch);
}));

// POST a new sketch
router.post('/', asyncHandler(async function(req, res) {
    let { userId, sketchBookId, points, nsfw } = req.body;
    // Create a new sketch book if not passed a sketchbookId
    if (!sketchBookId) sketchBookId = await SketchBook.createNewSketchBook();
    const sketch = await Sketch.createNewSketch({ userId, sketchBookId, points, nsfw });
    return res.json(sketch);
}));

// PATCH a sketch
router.patch('/:id', asyncHandler(async function(req, res) {
    const sketch = await Sketch.updateSketch(req.params.id, req.body);
    return res.json(sketch);
}));


module.exports = router;
