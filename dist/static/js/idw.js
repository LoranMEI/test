import bbox from '@turf/bbox';
import hexGrid from '@turf/hex-grid';
import pointGrid from '@turf/point-grid';
import distance from '@turf/distance';
import centroid from '@turf/centroid';
import squareGrid from '@turf/square-grid';
import triangleGrid from '@turf/triangle-grid';
import clone from '@turf/clone';
import { featureCollection } from '@turf/helpers';
import { featureEach } from '@turf/meta';
import { collectionOf } from '@turf/invariant';

/**
 * Takes a set of points and estimates their 'property' values on a grid using the [Inverse Distance Weighting (IDW) method](https://en.wikipedia.org/wiki/Inverse_distance_weighting).
 *
 * @name interpolate
 * @param {FeatureCollection<Point>} points with known value
 * @param {number} cellSize the distance across each grid point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.gridType='square'] defines the output format based on a Grid Type (options: 'square' | 'point' | 'hex' | 'triangle')
 * @param {string} [options.property='elevation'] the property name in `points` from which z-values will be pulled, zValue fallbacks to 3rd coordinate if no property exists.
 * @param {string} [options.units='kilometers'] used in calculating cellSize, can be degrees, radians, miles, or kilometers
 * @param {number} [options.weight=1] exponent regulating the distance-decay weighting
 * @returns {FeatureCollection<Point|Polygon>} grid of points or polygons with interpolated 'property'
 * @example
 * var points = turf.randomPoint(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point
 * turf.featureEach(points, function(point) {
 *     point.properties.solRad = Math.random() * 50;
 * });
 * var options = {gridType: 'points', property: 'solRad', units: 'miles'};
 * var grid = turf.interpolate(points, 100, options);
 *
 * //addToMap
 * var addToMap = [grid];
 */
function interpolate(points, cellSize, options) {
  // Optional parameters
  options = options || {};
  if (typeof options !== 'object') throw new Error('options is invalid');
  var gridType = options.gridType;
  var property = options.property;
  var weight = options.weight;
  var breaks = options.breaks;
  var breakProperties  = options.breakProperties;
  var colorProperty = options.colorProperty;

  // validation
  if (!points) throw new Error('points is required');
  collectionOf(points, 'Point', 'input must contain Points');
  if (!cellSize) throw new Error('cellSize is required');
  if (weight !== undefined && typeof weight !== 'number') throw new Error('weight must be a number');

  // default values
  property = property || 'elevation';
  gridType = gridType || 'square';
  weight = weight || 1;

  var box = bbox(points);
  var grid;
  switch (gridType) {
    case 'point':
    case 'points':
      grid = pointGrid(box, cellSize, options);
      break;
    case 'square':
    case 'squares':
      grid = squareGrid(box, cellSize, options);
      break;
    case 'hex':
    case 'hexes':
      grid = hexGrid(box, cellSize, options);
      break;
    case 'triangle':
    case 'triangles':
      grid = triangleGrid(box, cellSize, options);
      break;
    default:
      throw new Error('invalid gridType');
  }
  var results = [];
  featureEach(grid, function (gridFeature) {
    var zw = 0;
    var sw = 0;
    // calculate the distance from each input point to the grid points
    featureEach(points, function (point) {
      var gridPoint = (gridType === 'point') ? gridFeature : centroid(gridFeature);
      var d = distance(gridPoint, point, options);
      var zValue;
      // property has priority for zValue, fallbacks to 3rd coordinate from geometry
      if (property !== undefined) zValue = point.properties[property];
      if (zValue === undefined) zValue = point.geometry.coordinates[2];
      if (zValue === undefined) throw new Error('zValue is missing');

      if (d === 0) zw = zValue;
      var w = 1.0 / Math.pow(d, weight);
      sw += w;
      zw += w * zValue;
    });
    // write interpolated value for each grid point
    var newFeature = clone(gridFeature);
    newFeature.properties[property] = zw / sw;

    var breaks = options.breaks;
    var breakProperties  = options.breakProperties;
    var colorProperty = options.colorProperty;
    var order = 0;
    if (newFeature.properties[property] < 0){
      order =  (15 - Math.ceil((Math.abs(newFeature.properties[property]))/2));//负数取绝对值除以2并向上取整
    }else{
      order = Math.ceil(newFeature.properties[property]/2)+14;
    }
    newFeature.properties[colorProperty] = breakProperties[order].fillcolor;//
    results.push(newFeature);
  });
  return featureCollection(results);
};
function genSquareGrid(points, cellSize,options) {
  var box = bbox(points);
  var grid = squareGrid(box, cellSize, options);

  return grid;
};
function interpolate2(points, grid, options) {
  // Optional parameters
  options = options || {};
  if (typeof options !== 'object') throw new Error('options is invalid');
  var gridType = options.gridType;
  var property = options.property;
  var weight = options.weight;
  var breaks = options.breaks;
  var breakProperties  = options.breakProperties;
  var colorProperty = options.colorProperty;

  // validation
  if (!points) throw new Error('points is required');
  collectionOf(points, 'Point', 'input must contain Points');
/*  if (!cellSize) throw new Error('cellSize is required');*/
  if (weight !== undefined && typeof weight !== 'number') throw new Error('weight must be a number');

  // default values
  property = property || 'elevation';
  gridType = gridType || 'square';
  weight = weight || 1;

  var results = [];
  featureEach(grid, function (gridFeature) {
    var zw = 0;
    var sw = 0;
    // calculate the distance from each input point to the grid points
    featureEach(points, function (point) {
      var gridPoint = (gridType === 'point') ? gridFeature : centroid(gridFeature);
      var zValue;
      // property has priority for zValue, fallbacks to 3rd coordinate from geometry
      if (property !== undefined) zValue = point.properties[property];
      if (zValue === undefined) zValue = point.geometry.coordinates[2];
      if (zValue === undefined) throw new Error('zValue is missing');
      if (Math.abs(zValue) < options.valid) {
        var d = distance(gridPoint, point, options);
        if (d === 0) zw = zValue;
        var w = 1.0 / Math.pow(d, weight);
        sw += w;
        zw += w * zValue;
      }
    });
    // write interpolated value for each grid point
    var newFeature = clone(gridFeature);
    newFeature.properties[property] = zw / sw;

    var breaks = options.breaks;
    var breakProperties  = options.breakProperties;
    var colorProperty = options.colorProperty;
    var order = 0;
    if(property === "tem"){
      if (newFeature.properties[property] < 0){
        order =  (15 - Math.ceil((Math.abs(newFeature.properties[property]))/2));//负数取绝对值除以2并向上取整
      }else{
        order = Math.ceil(newFeature.properties[property]/2)+14;
      }
    }else if(property === "prs"){
      if(newFeature.properties[property] < 969 ){
        order = 0;
      }else if(newFeature.properties[property] > 1017){
        order = 16;
      }else{
        order = (Math.ceil((newFeature.properties[property] - 969)/3))-1;
      }
    }else if(property === "rhu"){
      if(newFeature.properties[property] <= 0){
        order = 0;
      }else if(newFeature.properties[property] > 100){
        order = 9
      }else{
        order = Math.ceil(newFeature.properties[property]/10)-1;
      }
    }else if( property === "winSMax"){
      if(newFeature.properties[property] <= 2.5){
        order = 0;
      }else if(newFeature.properties[property] <= 5.5){
        order = 1
      }else if(newFeature.properties[property] <= 5.5){
        order = 2
      }else if(newFeature.properties[property] <= 8.3){
        order = 3
      }else if(newFeature.properties[property] <= 11.1){
        order = 4
      }else if(newFeature.properties[property] <= 13.9){
        order = 5
      }else if(newFeature.properties[property] <= 17.4){
        order = 6
      }else if(newFeature.properties[property] <= 20.9){
        order = 7
      }else if(newFeature.properties[property] <= 24.5){
        order = 8
      }else if(newFeature.properties[property] <= 29){
        order = 9
      }else if(newFeature.properties[property] <= 33){
        order = 10
      }else if(newFeature.properties[property] <= 37){
        order = 11
      }else if(newFeature.properties[property] <= 42){
        order = 12
      }else if(newFeature.properties[property] <= 47){
        order = 13
      }else if(newFeature.properties[property] <= 51){
        order = 14
      }else if(newFeature.properties[property] <= 67){
        order = 15
      }else {
        order = 16
      }
    }else if( property === "pre1h"){
      if(newFeature.properties[property] <= 0.2){
        order = 0;
      }else if(newFeature.properties[property] <= 2){
        order = 1
      }else if(newFeature.properties[property] <= 4){
        order = 2
      }else if(newFeature.properties[property] <= 6){
        order = 3
      }else if(newFeature.properties[property] <= 8){
        order = 4
      }else if(newFeature.properties[property] <= 10){
        order = 5
      }else if(newFeature.properties[property] <= 20){
        order = 6
      }else if(newFeature.properties[property] <= 50){
        order = 7
      }else {
        order = 8
      }
    }
    if(breakProperties[order]){
      newFeature.properties[colorProperty] = breakProperties[order].fillcolor;
    }

    results.push(newFeature);
  });
  return featureCollection(results);
};

export default {
  interpolate,
  genSquareGrid,
  interpolate2
};
