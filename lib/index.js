const getPosFromVideo = require('./pos_from_video')
const getLocFromImage = require('./loc_from_image')
const findDistance = require('./find_distance')

module.exports = Object.assign({}, getPosFromVideo, getLocFromImage, findDistance)