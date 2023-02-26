const {Schema, model} = require('mongoose');

const book = new Schema({
  title: {type: String, required:true},
  price: {type: Number, required:true},
  image:String,
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},
{versionKey:false});

module.exports = model('Book', book);