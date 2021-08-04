const AWS = require('aws-sdk');
const sharp = require ('sharp');
const fs = require('fs').promises; //file system- for reading and writing files to the system (for base 64)
const Post = require ('../models/post');
const keys = require ('../keys/keys.js');


const s3 = new AWS.S3({
    bucketName: keys.bucketName,
    signatureVersion: "v4",
    region: "eu-west-1" 
});

async function resizeImage(imageBuffer, maxDimensionHeight, maxDimensionWidth) {
    const sharpImg = await sharp(imageBuffer);
    return sharpImg.resize({ 
        width: maxDimensionWidth,
        height: maxDimensionHeight, 
        fit: 'contain', //'fill' 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
     })
        .jpeg ({quality: 100})
        .toBuffer();
}
class PostsController {

    static async feed(req, res) {
        try{
            const posts = await Post.find();
            res.send(posts);
            } catch (err) {
              console.log(err)
              res.sendStatus(500);
            }
          }
        
    

    static async create(req, res) {
        const fileName = req.file.filename;
        
        try {

            const fileContent = await fs.readFile('/public/posts/' + fileName );
            console.log(`Resizing ${fileName}`);
            const MAX_DIMENSION_HEIGHT = 455;
            const MAX_DIMENSION_WIDTH = 334;
            let resized = await resizeImage(fileContent, MAX_DIMENSION_HEIGHT, MAX_DIMENSION_WIDTH) ;
            console.log(`resize test---- original: ${fileContent.length} bytes, resized: ${resized.length} bytes.`);

            const params = {
                Bucket : 'nechavot-style',
                Key: `${keys.folderPosts}/${fileName}` + '.jpg',
                Body: resized,
                ACL: 'public-read'
              };
              console.log("create", fileName);
              const uploadedFile = await s3.upload(params, (err, data) => {
                const post = new Post({
                    description: req.body.description,
                    image: `https://nechavot-style.s3.amazonaws.com/${keys.folderPosts}/${fileName}.jpg`,
                    size: req.body.size,
                    user: req.user._id,
                    whereItIsNow: req.body.whereItIsNow
                });
                const newPost = post.save();
                res.status(201).send(newPost);
                console.log(post.description);
                
            });

            
        } catch(err) {
            console.log(err);
            res.sendStatus(400);
        } finally {
            fs.rm('/public/posts/' + fileName)
        }
    }
    
    
    


        


}

module.exports = PostsController;