'use strict';

module.exports = (sequelize, DataTypes) => {
    const SketchBook = sequelize.define('SketchBook', {}, {});
    SketchBook.associate = function (models) {
        SketchBook.hasMany(models.Sketch, {
            foreignKey: 'sketchBookId'
        })
    };
    SketchBook.createNewSketchBook = async function () {
        const sketchBook = await SketchBook.create();
        return sketchBook.id;
    };
    SketchBook.getSketchBookCovers = async function () {
        const sketchBooks = await SketchBook.findAll({
            include: {
                model: sequelize.models.Sketch,
                limit: 1,
                attributes: ['points']
            },
            order: [['id', 'DESC']]
        });
        return sketchBooks;
    };
    return SketchBook;
};
