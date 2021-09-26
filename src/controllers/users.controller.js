const md5 = require ('md5');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const fs = require ('fs').promises;
const { jwtSecret } = require('../config/environment/index');

class UsersController {

    static async create(req, res) {
        try {
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
        res.send(req.user);
        }

    
    
    static async editUser(req, res) {
        const { id } = req.params;
        const toUpdate = {}
        // if (req.file) {
        //     const fileName= req.file.filename;
        //     const imageBase64 = await fs.readFile('public/avatars' + fileName, {
        //         encoding: 'base64'
        //     });
        //     toUpdate.avatar = imageBase64;
        // }
        toUpdate.username = req.body.username;
        toUpdate.email = req.body.email;
        const newUser = await User.findByIdAndUpdate(id, toUpdate, {new: true})
        console.log(newUser);
        res.send(newUser)
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

        //     try {
        //         const fileContent = await fs.readFile('/public/avatars/' + fileName );
        //         const params = {
        //             Bucket : 'nechavot-style',
        //             Key: `${keys.folderPosts}/${fileName}` + '.jpg',
        //             Body: fileContent,
        //             ACL: 'public-read'
        //         };
        //         console.log("create", fileName);
        //         const uploadedFile = await s3.upload(params, (err, data) => {
        //            console.log('Img uploaded successfully')
        //         }).promises();
        //         let location = uploadedFile.location;
        //     }
        //     toUpdate = {
        //         avatar: location,
        //         password:

        //     }
                
        //     } catch(err) {
        //         console.log(err);
        //         res.sendStatus(400);
        //     } finally {
        //         fs.rm('/public/posts/' + fileName)
        //     }
            
        // }

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

 

        

      

                

    
}

module.exports = UsersController;