const exif = require('exif').ExifImage
const fs = require('fs')
const path = require('path')
const IMG_EXT_NAME = `.jpg` // Extension name for images

/**
 * @description Get location from images
 * @param {String} pathtoImage - Path for images directory
 * @param {Function} callback - Callback function
 */
exports.getLocFromImage = (pathtoImage, callback) => {
  fs.readdir(`${__dirname}/../${pathtoImage}`, (error, files) => {  // Read all files in directory
    if (!error) {

      // Filter image files with given image extension
      const targetFiles = files.filter((file) => {
        return path.extname(file).toLowerCase() === IMG_EXT_NAME
      })
      const gpsDataAvailable = []  // Paramter to be given to callback function
      const gpsDataNotAvailable = []
      let i = 1 // Keeps count of image files

      // Get exif info for each image file
      targetFiles.forEach((file) => {
        new exif({ image: `${__dirname}/../${pathtoImage}${file}` }, (error, data) => {
          if (!error) {
            const gpsInfo = data.gps
            const latitude = gpsInfo.GPSLatitude
            const longitude = gpsInfo.GPSLongitude
            gpsDataAvailable.push({
              name: file,
              latitude: parseFloat(latitude[0]) + parseFloat(latitude[1] / 60 + parseFloat(latitude[2] / 3600)),  // Change minutes and seconds to degree
              longitude: parseFloat(longitude[0]) + parseFloat(longitude[1] / 60 + parseFloat(longitude[2] / 3600)),
            })
          }
          else gpsDataNotAvailable.push(file)
          i++
          if (i === targetFiles.length) {
            const output = []
            output.push(gpsDataAvailable)
            output.push(gpsDataNotAvailable)
            callback(undefined, output)  // Call callback function when all files are done
          }
        })
      })
    }
    else callback(error, undefined)
  })
}