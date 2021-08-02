
const fs = require('fs').promises; //file system- for reading and writing files to the system (for base 64)
const Post = require ('../models/post')

class PostsController {

    static async feed(req, res) {
        try{
            const posts = await Post.find();
            res.send(posts);
        }

        catch (err){
            console.log (err);
            res.sendStatus(err);
        }
    }

    static async create(req, res) {
        const fileName = req.file.filename;
        
        try {
            const imageBase64 = await fs.readFile('public/posts/' + fileName, { /*these two lines will be switched when moving to S3*/
                encoding: 'base64'
            });

            const post = new Post({
                description: req.body.description,
                image: imageBase64,
                size: req.body.size
            });

            const newPost = await post.save();
            res.status(201).send(newPost);
        } catch(err) {
            console.log(err);
            res.sendStatus(400);

        }
        
    }
}

module.exports = PostsController;