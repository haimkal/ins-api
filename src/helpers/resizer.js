
const sharp = require ('sharp');

module.exports = async function resizeImage(imageBuffer, maxDimensionHeight, maxDimensionWidth) {
    const sharpImg = await sharp(imageBuffer);
    return sharpImg.resize({ 
        width: maxDimensionWidth,
        height: maxDimensionHeight, 
        fit: 'cover', 
        background: { r: 255, g: 255, b: 255, alpha: 0.5 } 
     })
        .jpeg ({quality: 80})
        .toBuffer();
}