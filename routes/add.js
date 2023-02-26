const {Router} = require('express');
const auth = require('../middleware/auth')
const Book = require('../models/book');
const {validationResult} = require('express-validator');
const { add_edit_Validators } = require('../utils/validator');
const router = Router();

router.get('/', auth, (req, res)=>{
  res.render('add', {
    title:'Добавить книгу',
    isAdd:true,
    error:req.flash('err')
  });
});

router.post('/', auth, add_edit_Validators,  async (req, res)=>{
  try{
    const {title, price, image} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      req.flash('err', errors.array()[0].msg);
      console.log("true");
      return res.status(422).render('add', {
        title:'Добавить книгу',
        isAdd:true,
        error:req.flash('err'),
        data:{
          title: req.body.title,
          price: req.body.price,
          image: req.body.image,
        }
      });
    }
    const books = new Book({
      title: title, 
      price: price, 
      image: image,
      userId: req.user._id}
    );
    await books.save();
    res.redirect('/books');
  }
  catch(err){console.log(`Ошибка: ${err}`);}
});


module.exports = router;

