# Skylark Drones Technical Assignment

### The problem statement is [here](./problem-statement.txt)
Node.js and ES6 are used for the code

## Architecture
- Main functionality is split into three modules in <b>lib/</b>
- [Module for getting geo coordinates from images](./lib/loc_from_image.js) <br>
- [Module for getting time and drone position from videos](./lib/pos_from_video.js) <br>
- [Module for finding distance between two geo coordinates](./lib/find_distance.js)
- Main starting point file [index.js](./index.js)
- The code is written asynchronously to save time by doing tasks like getting location from images or getting info from video and assets.csv while the user inputs data.
- Supports multiple video files
- Output csv files are saved in <b>output/</b>

### Instructions for use:
- All the geo tagged images are to be placed in images/
- All video subtitle files are to be placed in videos/
- POI csv data should be present in ./assets.csv
- Clone and cd into this repo
- Install node modules:
```
npm install
```
- Run code
```
npm start
```
#### Input and output example
```
ravi@predator-linux:~/skylark-tech-assignment$ npm start

> skylark-tech-assignment@1.0.0 start /home/ravi/skylark-tech-assignment
> node index.js

Enter distance range in meteres for video (Default: 35m, Press Enter to skip): 26
Enter distance range in meteres for POI (Default: 50m, Press Enter to skip): 45
NO_EXIF_SEGMENT in DJI_0061.JPG, DJI_0377.JPG, DJI_0452.JPG, DJI_0605.JPG
Images related to "DJI_0301.SRT" video saved in "output/DJI_0301.SRT_video_result.csv"
Images related to "new.srt" video saved in "output/new.srt_video_result.csv"
Images related to POI saved in "output/poi_result.csv"
```
