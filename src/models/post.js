const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const Post = mongoose.model('Post', {
    user: { // why doesn't it work?
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    whoHasItNow: { 
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
    },
    image: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: ()=> new Date()
    }
});

module.exports = Post;


