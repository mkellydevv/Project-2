'use strict';
module.exports = (sequelize, DataTypes) => {
  const SketchBook = sequelize.define('SketchBook', {}, {});
  SketchBook.associate = function(models) {
    // associations can be defined here
  };
  return SketchBook;
};
