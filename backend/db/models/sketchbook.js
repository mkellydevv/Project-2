'use strict';
module.exports = (sequelize, DataTypes) => {
    const SketchBook = sequelize.define('SketchBook', {}, {});
    SketchBook.associate = function (models) {
        // associations can be defined here
    };
    SketchBook.createNewSketchBook = async function () {
        const sketchBook = await SketchBook.create();
        return sketchBook.id;
    };
    return SketchBook;
};
