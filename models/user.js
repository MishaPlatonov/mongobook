const {Schema, model} = require('mongoose');

const user = new Schema({
  email:{type:String, required:true},
  name:String,
  password:{type:String, required:true},
  resetToken:String,
  resetTokenExp:String,
  avatarUrl: String,
  cart:{
    items:[
      {
        count:{type:Number, required:true, default:0},
        bookId:{type: Schema.Types.ObjectId, required:true, ref: 'Book'}
      }
    ]
  }
},
{versionKey:false});

user.methods.addToCart = function(book){
  const cloneItems = this.cart.items.concat();
  const index = cloneItems.findIndex(b => b.bookId.toString() === book._id.toString());

  if(index >=0){
    // Книга уже в корзине, увеличиваем count
    cloneItems[index].count = cloneItems[index].count + 1;
  }
  else{
    // Книги в корзине нет, добавляем её в корзину:
    cloneItems.push({count:1, bookId: book._id})
  }
  this.cart = {items:cloneItems}
  return this.save();
}

user.methods.removeElement = function(id){
  let items = [...this.cart.items];
  const index = items.findIndex(b =>{
    return b.bookId.toString() === id.toString();
  });
  if(items[index].count === 1){
    // Удаляем книгу
    items = items.filter(b => b.bookId.toString() !== id.toString());
  }
  else{
    // Уменьшаем count на 1
    items[index].count--;
  }
  this.cart = {items: items}
  return this.save();
}

user.methods.clearCart = function(){
  this.cart = {items:[]};
  return this.save();
}

module.exports = model('User', user);