const AWS = require('aws-sdk');
const fs = require('fs').promises; //file system- for reading and writing files to the system (for base 64)
const Post = require ('../models/post');
const keys = require ('../keys/keys.js');


const s3 = new AWS.S3({
    bucketName: keys.bucketName,
    signatureVersion: "v4",
    region: "eu-west-1" 
});


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
            const params = {
                Bucket : 'nechavot-style',
                Key: `${keys.folderPosts}/${fileName}` + '.jpg',
                Body: fileContent,
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