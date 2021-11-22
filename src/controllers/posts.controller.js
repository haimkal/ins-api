const AWS = require('aws-sdk');
const fs = require('fs').promises; //file system- for reading and writing files to the system (for base 64)
const Post = require('../models/post');
const keys = require('../keys/keys.js');
const s3Uploader = require('../helpers/s3ImageUpload');
const resizeImage = require('../helpers/resizer')
const User = require('../models/user');


const s3 = new AWS.S3({
    bucketName: keys.bucketName,
    signatureVersion: "v4",
    region: "eu-west-1"
});

class PostsController {

    static async feed(req, res) {
        try {
            const posts = await Post
                .find()
                .populate('user', ['username', 'avatar'])
                .sort({ createdAt: req.query.sort || 1 });
            res.send(posts);
        } catch (err) {
            console.log(err)
            res.sendStatus(500);
        }
    }



    static async create(req, res) {
        const fileName = req.file.filename;

        try {
            const fileContent = await fs.readFile('./public/posts/' + fileName);
            console.log(`Resizing ${fileName}`);
            const MAX_DIMENSION_HEIGHT = 1180;
            const MAX_DIMENSION_WIDTH = 856;
            let resized = await resizeImage(fileContent, MAX_DIMENSION_HEIGHT, MAX_DIMENSION_WIDTH);
            console.log(`resize test---- original: ${fileContent.length} bytes, resized: ${resized.length} bytes.`);

            console.log("create", fileName);
            const key = `${keys.folderPosts}/${fileName}` + '.jpg';
            s3Uploader(key, resized, (filePath) => {
                const post = new Post({
                    description: req.body.description,
                    image: filePath,
                    size: req.body.size,
                    user: req.user._id,
                    whereItIsNow: req.body.whereItIsNow
                })
                const newPost = post.save();
                res.status(201).send(newPost);
                console.log(post.description);
            })

        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        } finally {
            fs.rm('./public/posts/' + fileName)
        }
    }

    static async get(req, res) {
        try {
            const post = await Post
                .findById(req.params.id)
                .populate('user', ['username', 'avatar']);
            if (!post) {
                res.sendStatus(404);
                return;
            }
            res.send(post);
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }

    static async takenByMe(req, res) {
        const { id } = req.params;
        const { username } = req.params;
        const postToUpdate = {}

        postToUpdate.whereItIsNow = username;

        const newPost = await Post
            .findByIdAndUpdate(id, postToUpdate, { new: true })
            .populate('user', ['username']);


        res.status(201).send(newPost)
    }









}

module.exports = PostsController;