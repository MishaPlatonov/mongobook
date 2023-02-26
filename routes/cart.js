const {Router} = require('express');
const router = Router();
const Book = require('../models/book');
const auth = require('../middleware/auth')

function mapCartItems(units){
  return units.items.map(b => ({...b.bookId._doc, count: b.count}));
}

function getCount(books){
  return books.reduce((total, book)=>total+= book.price * book.count, 0);
}

router.post('/add', auth, async (req, res)=>{
  const book = await Book.findById(req.body._id);
  await req.user.addToCart(book);
  res.redirect('/cart');
});

router.get('/', auth, async (req, res)=>{
  const user = await req.user.populate('cart.items.bookId');
  const books = mapCartItems(user.cart);
  res.render('cart', {title:'Корзина', isCart:true, books: books, price: getCount(books)});
});

router.delete('/remove/:id', auth, async (req, res)=>{
  req.user.removeElement(req.params.id);
  const user = await req.user.populate('cart.items.bookId');
  const books = mapCartItems(user.cart);
  const cart = {books, price: getCount(books)} 
  res.status(200).json(cart);
});

module.exports = router;

