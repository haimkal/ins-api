
const sharp = require ('sharp');

module.exports = async function resizeImage(imageBuffer, maxDimensionHeight, maxDimensionWidth) {
    const sharpImg = await sharp(imageBuffer);
    return sharpImg.resize({ 
        width: maxDimensionWidth,
        height: maxDimensionHeight, 
        fit: 'contain', //'fill' resi
        // background: { r: 255, g: 255, bresi: 255, alpha: 1 } 
     })
        .jpeg ({quality: 90})
        .toBuffer();
}