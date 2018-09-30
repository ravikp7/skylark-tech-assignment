const fs = require('fs')
const path = require('path')
const VID_EXT_NAME = `.srt` // Extension name for video subtitle files

/**
 * @description Get location and time info for each frame
 * @param {String} pathToVideo - Path to videos directory
 * @param {Function} callback - Callback function
 */
exports.getPosFromVideo = (pathToVideo, callback) => {
  fs.readdir(`${__dirname}/../${pathToVideo}`, (error, files) => {  // Read all video files present in directory
    if (!error) {
      const videos = files.filter(file => path.extname(file).toLowerCase() === VID_EXT_NAME)  // Filter video files with given extension name
      videos.forEach((video) => {
        fs.readFile(`${__dirname}/../${pathToVideo}${video}`, (error, data) => {
          if (!error) {
            const lines = data.toString().split(`\n`)
            let i = 1
            const dronePos = [] // Stores drone position with time

            // Get time and drone position from video file data
            while (i < lines.length) {
              const wholeTime = lines[i].split(` --> `)[0]  // Get 00:00:00,100
              const sepTime = wholeTime.split(`,`)
              const hms = sepTime[0].split(`:`)  // Seprate Hours, Minutes and Seconds
              const milisec = sepTime[1]  // Miliseconds
              const seconds = parseFloat(hms[0]) * 60 * 60 + parseFloat(hms[1]) * 60 + parseFloat(hms[2]) + parseFloat(milisec) * 0.001   // Change time to seconds\
              const geoLocation = lines[i + 1].split(`,`)  // Get geo location
              const latitude = geoLocation[1]
              const longitude = geoLocation[0]
              dronePos.push({ time: seconds, latitude: latitude, longitude: longitude })
              i = i + 4   // Move to next time in file
            }
            const output = [] // Parameter to be given to the callback function
            output.push(video)  // Video file name
            output.push(dronePos) // Array of objects conatining time and location for each frame
            callback(undefined, output);
          }
          else callback(error, undefined)
        })
      })
    }
    else callback(error, undefined)
  })
}