const express = require('express');
const multer = require('multer');
const path = require('path');
const UsersController = require('../controllers/users.controller');
const PostsController = require('../controllers/posts.controller');
const auth = require('../middlewares/auth');
const routes = express.Router();
const upload = multer({
    dest: path.join(__dirname, 'public', 'posts'),
});
const avatar = multer({
    dest: path.join(__dirname, 'public', 'avatars'), limits: { fieldSize: 25 * 1024 * 1024 }
});

//user
routes.put('/user', UsersController.create);
routes.post('/user/login', UsersController.login);
routes.post('/user/me', auth, UsersController.me);
routes.get('/user/check', UsersController.check);
routes.get('/user/edit/check', UsersController.check);
routes.get('/user/:username/posts', auth, UsersController.posts);
routes.post('/user/edit/:id', auth, avatar.single('image'), UsersController.editUser);
routes.get('/user/:username', auth, UsersController.get);
routes.get('/users', auth, UsersController.getAllUsers);

//post
routes.get('/post', auth, PostsController.feed);
routes.put('/post', auth, upload.single('image'), PostsController.create);
routes.get('/post/:id', auth, PostsController.get);
routes.get('/post/taken/:id/:username', auth, PostsController.takenByMe);


// report if app in on Heroku
routes.get('/', (req, res) => res.send());

module.exports = routes;