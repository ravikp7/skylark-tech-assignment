const fs = require('fs')
const Json2csvParser = require('json2csv').Parser
const csvtojson = require('csvtojson')
const EOL = require('os').EOL // End of LIne
const lib = require('./lib')

const VIDEOS_PATH = `videos/` // Path to .srt video subtitile file
const IMAGES_PATH = `images/` // Path to geo-tagged images
const VIDEO_RESULT= `video_result.csv` // Output file for Video
const POI_RESULT = `poi_result.csv` // Output file for POI
const OUTPUT_DIR = `output/`  // Directory for output files
const DEFAULT_VIDEO_DISTANCE = 35 // Distance range in meteres between images and drone (Taken from video)
const DEFAULT_POI_DISTANCE = 50 // Distance range in meteres between images and drone (Taken from POI file)
let output_result = ``  // Stores output string

/**
 * @description Promise which resolves after getting location from images
 */
const getLocFromImage = new Promise((resolve, reject) => {
  lib.getLocFromImage(IMAGES_PATH, (error, data) => {
    if (!error) {
      resolve(data[0])
      output_result += `NO_EXIF_SEGMENT in ${data[1].join(', ')}${EOL}`
    }
    else reject(error)
  })
})

/**
 * @description Promise that returns distance range for video from user input on resolution
 */
const getVideoDistance = new Promise((resolve) => {
  process.stdout.write(`Enter distance range in meteres for video (Default: 35m, Press Enter to skip): `)
  process.stdin.on('data', data => {
    const distance = parseInt(data.toString())
    if (data.toString() === EOL) {  // Default value
      resolve(DEFAULT_VIDEO_DISTANCE)
      process.stdin.removeAllListeners()
    }
    else if (!isNaN(distance)) {  // Valid number
      resolve(distance)
      process.stdin.removeAllListeners()
    }
    else process.stdout.write(`Enter valid distance in meters: `) // Invalid value
  })
})

// After getting distance for video from user input
getVideoDistance.then(distance_video => {
  /**
 * @description Get location from all video subtitile files present in VIDEO_PATH
 * Then for each frame position in each video, distance is compared with location in all images
 */
  lib.getPosFromVideo(VIDEOS_PATH, (error, data) => {
    const videoName = data[0] // Name of the video file
    const videoData = data[1] // Array containing Object for each video frame (every second in file)
    if (!error) {
      getLocFromImage.then(imageData => {
        const result = [] // Stores objects to be written in csv file
        videoData.forEach(frame => {
          const desiredImages = []  // Stores images for each frame
          imageData.forEach(image => {
            const distance = lib.findDistance(frame.latitude, frame.longitude, image.latitude, image.longitude) // Find distance
            if (distance <= distance_video) desiredImages.push(image.name)
          })
          result.push({
            time: frame.time,
            images: desiredImages.toString()
          })
        });

        // Prepare CSV data from objects
        const fields = [`time`, `images`] // Column heading for csv file
        const json2csvParser = new Json2csvParser({ fields })
        const csvData = json2csvParser.parse(result)

        // Write CSV data to file
        if (!fs.existsSync(`${__dirname}/${OUTPUT_DIR}`)) fs.mkdirSync(`${__dirname}/${OUTPUT_DIR}`) // Check if ./output directory is present
        fs.writeFile(`${__dirname}/${OUTPUT_DIR}${videoName}_${VIDEO_RESULT}`, csvData, (error) => {
          if (error) console.log(error)
          output_result += `Images related to "${videoName}" video saved in "${OUTPUT_DIR}${videoName}_${VIDEO_RESULT}"${EOL}`
        })
      }).catch(error => console.log(error))
    }
    else console.log(error)
  })
})

// After getting distance for video from user input
getVideoDistance.then(() => {
  /**
 * @description Promise that returns distance for POI from user input on resolution
 */
  const getPOIDistance = new Promise((resolve, reject) => {
    process.stdout.write(`Enter distance range in meteres for POI (Default: 50m, Press Enter to skip): `)
    process.stdin.on('data', data => {
      const distance = parseInt(data.toString())
      if (data.toString() === EOL) {
        resolve(DEFAULT_POI_DISTANCE)
        process.stdin.removeAllListeners()
      }
      else if (!isNaN(distance)) {
        resolve(distance)
        process.stdin.removeAllListeners()
      }
      else process.stdout.write(`Enter valid distance in meters: `)
    })
  })
  
  // After getting distance for POI from user input
  getPOIDistance.then(distance_poi => {
    /**
     * @description Open assets.csv file to get POI locations and compare distance with location from images
     */
    csvtojson().fromFile(`./assets.csv`).then(csvObj => {
      getLocFromImage.then(imageData => {
        const result = [] // Stores objects to be written in csv file
        csvObj.forEach(entry => {
          const desiredImages = []  // Stores images for each POI
          imageData.forEach(image => {
            const distance = lib.findDistance(entry.latitude, entry.longitude, image.latitude, image.longitude)
            if (distance <= distance_poi) desiredImages.push(image.name)
          })
          const csvEntry = Object.assign(entry, { image_names: desiredImages.toString() })  // Add image names to the existing object
          result.push(csvEntry)
        })

        // Write CSV data to file
        const fields = [`asset_name`, `longitude`, `latitude`, `image_names`] // Column heading for csv file
        const json2csvParser = new Json2csvParser({ fields })
        const csvData = json2csvParser.parse(result)
        if (!fs.existsSync(`${__dirname}/${OUTPUT_DIR}`)) fs.mkdirSync(`${__dirname}/${OUTPUT_DIR}`)
        fs.writeFile(`${__dirname}/${OUTPUT_DIR}${POI_RESULT}`, csvData, (error) => {
          if (error) console.log(error)
          output_result += `Images related to POI saved in "${OUTPUT_DIR}${POI_RESULT}"`
          process.stdout.write(output_result)
          process.stdin.pause()
        })
      }).catch(error => console.log(error))
    })
  })
})