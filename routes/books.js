const {Router} = require('express');
const Books = require('../models/book');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const { add_edit_Validators } = require('../utils/validator');
const router = Router();

function isOwner(books, req){
  return books.userId.toString() !== req.user._id.toString();
}

router.get('/', async (req, res)=>{
  try {
    const books = await Books.find()
      .populate('userId', 'email name')
      .select('title price image');
    res.render('books', {
      title:'Книги', 
      isBooks:true,
      userId: req.user ?req.user._id.toString() : null,
      books,
      csrf: req.csrfToken()
    });
  } 
  catch (error) {
    console.log(error)
  }

});

router.get('/:id', async (req, res)=>{
  try {
    const book = await Books.findById(req.params.id);
    res.render('books', {
      layout:'single-book',
      isBookSingle:true, 
      title:`Книга ${book.title}`,
      book
    });
  } 
  catch (error) {
    console.log(error);
  }
});

router.get('/:id/edit', auth, async (req, res)=>{
  if(!req.query.allow) return res.redirect('/');
  try {
    const books = await Books.findById(req.params.id);
    if(isOwner(books, req)){
      return res.redirect('/books')
    }
    res.render('books-edit', {
      isBookSingle:true, 
      title:`Редактировать ${books.title}`,
      books,
      error:req.flash('err')
    });
  } 
  catch (error) {
    console.log(error);
  }

});

router.post('/edit', auth, add_edit_Validators, async (req, res)=>{
  try {
    const {title, price, image} = req.body;
    const errors = validationResult(req);
    const id = req.body._id;
    const books = await Books.findById(id);
    if(!errors.isEmpty()){
      req.flash('err', errors.array()[0].msg);
      console.log("true");
      return res.status(422).redirect(`/books/${id}/edit?allow=true`);
    };
    if(isOwner(books, req)){
      return res.redirect('/books')
    }
    await Books.findByIdAndUpdate(id, { $set:{
      title: title, 
      price: price,
      image: image 
    }});
    res.redirect('/books');
  } 
  catch(err){console.log(`Ошибка: ${err}`);}  
});

router.post('/remove', auth, async (req, res)=>{
  try{
    await Books.deleteOne({
      _id: req.body._id,
      userId:req.user._id
    });
    res.redirect('/books');
  }
  catch(err){console.log(`Ошибка: ${err}`);}
});

module.exports = router;