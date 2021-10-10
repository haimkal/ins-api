const AWS = require('aws-sdk');
const md5 = require ('md5');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const fs = require ('fs').promises;
const keys = require ('../keys/keys.js');
const { jwtSecret } = require('../config/environment/index');
const  resizeImage = require ('../helpers/resizer');
const s3Uploader = require ('../helpers/s3ImageUpload')



const s3 = new AWS.S3({
    bucketName: keys.bucketName,
    signatureVersion: "v4",
    region: "eu-west-1" 
});

class UsersController {

    static async create(req, res) {
        try {
            // userService.createUser(req.body)- work on seperating app logic from http logic
            req.body.password = md5(req.body.password);
            const user = await new User(req.body);
            const newUser = await user.save();
            res.status(201).send(newUser)
        }
        catch(err) {
            console.log(err);
            res.status(400).send(err);
        }
    }

    static async login(req, res) {
        try {
            const user = await User.findOne({
                username: req.body.username,
                password: md5(req.body.password)
            })
            if(!user){
                res.sendStatus(401);
                return;
            }
            const payload = {
                _id: user._id,
                username: user.username
            };
            const token = jwt.sign(payload, jwtSecret );

            res.send({ token });
        }
       
        catch(err) {
            console.log(err);
            res.sendStatus(500);
        };
    }

    static check(req, res) {
        const {username, email} = req.query;

        if(!username && !email){
            res.sendStatus(400);
            return;
        }
        let property = email ? 'email' : 'username';

        try {
            User.exists ({
                [property]: req.query[property]
            }).then(isExist => {
                res.json(isExist);
            });
        }catch(err) {
            res.status(400).json(err);
        }
    }

    static async me(req, res) {
        const user = await User.findById(req.user._id);
        res.send(user);
    }

    
    
    static async editUser(req, res) {
        const fileName = req.file.filename;

            try {
                const fileContent = await fs.readFile('/public/avatars/' + fileName );
                console.log(`========Resizing ${fileName}============`);
                const MAX_DIMENSION_HEIGHT = 200;
                const MAX_DIMENSION_WIDTH = 200;
                let resized = await resizeImage(fileContent, MAX_DIMENSION_HEIGHT, MAX_DIMENSION_WIDTH) ;
                console.log(`resize test---- original: ${fileContent.length} bytes, resized: ${resized.length} bytes.`);
                const key = `${keys.folderAvatars}/${fileName}` + '.jpg';
                console.log("create", fileName);
                s3Uploader(key, resized, async (filePath) => {

                    const { id } = req.params;
                    const toUpdate = {}
                
                    if (req.body.username){
                        toUpdate.username = req.body.username;
                    }
                   
                    if (req.body.email){
                        toUpdate.email = req.body.email;
                    }
                    toUpdate.avatar = filePath
                    const newUser = await User.findByIdAndUpdate(id, toUpdate, {new: true})
                    res.status(201).send(newUser);
                    console.log(newUser);
                    
                  })
   
                
            } catch(err) {
                console.log(err);
                res.sendStatus(400);
            } finally {
                fs.rm('/public/avatars/' + fileName)
            }
        

        // const { id } = req.params;
        // const toUpdate = {}
      
        // toUpdate.username = req.body.username;
        // toUpdate.email = req.body.email;
        // const newUser = await User.findByIdAndUpdate(id, toUpdate, {new: true})
        // console.log(newUser);
        // res.send(newUser)
    }

    static async posts (req, res) {
        const { username } = req.params;
    
        try {
            const user = await User.findOne({
                username: username
            })
            if(!user){
                res.sendStatus(404);
                return;
            }
            console.log(user._id);
            const posts = await Post
                .find({ user: user._id})
                .populate('user', ['username', 'avatar']);
            res.json(posts);
        }catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }

        static async get (req, res) {
            const { username } = req.params;
        try {
            const user = await User.findOne({
                username: username
            })
            if(!user){
                res.sendStatus(404);
                return;
            } 
            const { _id, avatar, email } = user;
            return res.json ({_id, username, avatar, email});
        }catch (err) {
            console.log(err);
            res.sendStatus(500);
        }              
    }

    static async getAllUsers (req, res) {
        
        try {
            const users = await User.find({

            })
            // const { username } = req.params;
            console.log(users);
            return res.json(users.map(user => (
                {
                    username: user.username
                }
            )));
            

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

        
    }
}

module.exports = UsersController;