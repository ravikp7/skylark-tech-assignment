/**
 * @description Convert angle from degree to radian
 * @param {Number} deg - Angle in degree
 * 
 * @returns {Number} Angle in Radian
 */
const deg2rad = deg => deg * (Math.PI / 180)

/**
 * @description Find distance between two geo locations using Haversine Formula
 * @param {Number} lat1  - Latitude 1
 * @param {Number} lon1  - Longitude 1
 * @param {Number} lat2  - Latitude 2
 * @param {Number} lon2  - Longitude 2
 * 
 * @returns {Number} Distance
 */
exports.findDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000   // Earth's radius in meteres
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}