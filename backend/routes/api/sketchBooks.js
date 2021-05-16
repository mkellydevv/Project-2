const express = require('express');
const asyncHandler = require('express-async-handler');

const { SketchBook } = require('../../db/models');

const router = express.Router();

// GET sketch book ids and the first sketch of each
router.get('/', asyncHandler(async (req, res) => {
    let sketchBooks;
    if (req.query.after) {
        sketchBooks = await SketchBook.getLatestSketchBookCovers(req.query.after);
    }
    else {
        sketchBooks = await SketchBook.getSketchBookCovers();
    }
    return res.json(sketchBooks);
}));

// GET all the sketches from a sketchbook
router.get('/:id', asyncHandler(async (req, res) => {
    const sketchBooks = await SketchBook.getSketchBookSketches(req.params.id);
    return res.json(sketchBooks);
}));

module.exports = router;
