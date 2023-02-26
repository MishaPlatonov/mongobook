const {Router} = require('express');
const User = require('../models/user');
const argon2 = require('argon2');
const crypto = require('crypto');
const resetEmail = require("../emails/reset");
const emails = require('../emails/reg');
const {validationResult} = require('express-validator');
const {regValidators} = require('../utils/validator');
const router = Router();

router.get('/login', async (req, res)=>{
  res.render('auth/login', {
    title:'Авторизация',
    isLogin:true,
    error:req.flash('err'), 
    passErr:req.flash('pass-match'), 
    loginErr:req.flash('err-login'), 
    loginPassErr:req.flash('err-login-pass')});
})

// router.post('/login', async(req, res)=>{
//   req.session.isAuthenticated = true;
//   res.redirect('/')
// })

router.post('/login', async (req, res)=>{  
  try {
    const {email, password} = req.body;
    const visitor = await User.findOne({email});
    if(visitor){
     // const isSame = password === visitor.password;
      const isSame = await argon2.verify(visitor.password, password);
      if(isSame){
        req.session.user = visitor;
        req.session.isAuthenticated = true;
        req.session.save(err=>{
          if(err) throw err;
          res.redirect('/')
        })
      }
      else{
        req.flash('err-login-pass', 'Пароль не правильный');
        res.redirect('/auth/login#login');
        // res.redirect('/books')
      }
    }
    else{
      req.flash('err-login', 'Такого пользователя не существует')
      res.redirect('/auth/login#login')
    }
  } 
  catch (error) {
    console.log(`Ошибка: ${error}`)
  }

});


router.get('/logout', async (req, res)=>{
  req.session.destroy(()=>{
    res.redirect('/')
  })
})

router.post('/register', regValidators, async (req, res)=>{
  try{
    const {name, email, password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      req.flash('err', errors.array()[0].msg);
      console.log("true");
      return res.status(422).redirect('/auth/login#register');
    }
    const hashPass = await argon2.hash(password, {hashLength:10});
    const user = new User({
      email, name, password: hashPass, cart:{items:[]}
    });
    await user.save();
    res.redirect('/auth/login#login');
    await emails(email);
  }
  catch(err){console.log(`Ошибка: ${err}`)}
});

router.get('/reset', (req, res)=>{
  res.render('auth/reset', {title:'Восстановление пароля', 
    error:req.flash('error'),
  });
});

crypto

router.post('/reset', (req, res)=>{
  try {
    crypto.randomBytes(32, async (err, buffer)=>{
      if(err){
        req.flash('error', "Возникла какая-то непредвиденная ошибка, повторите попытку позже");
        return res.redirect('/auth/reset');
      }
      const token = buffer.toString('hex');
      const candidate = await User.findOne({email:req.body.email});
      if(candidate){
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now()+(3600*10);
        await candidate.save();
        await resetEmail(candidate.email, token);
        res.redirect('/auth/login');
      }
      else{
        req.flash('error', "Данный email не зарегестрирован в системе")
        res.redirect('/auth/reset'); 
      }
    })
  } 
  catch (error) {
    return error
  }
})


router.get('/password/:token', async (req,res)=>{
  if(!req.params.token){
    console.log("1")
    return res.redirect('/auth/login');
    
  }
  try{
    const user = await User.findOne({
      resetToken:req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if(!user){
      console.log("2")
      return res.redirect('/auth/login')
      
    }
    else {
      res.render('auth/password', {
        title:"Восстановление",
        error:req.flash('error'), 
        userId: user._id.toString(),
        token:req.params.token
      })
    }
  }
  catch(err){console.log(`Ошибка: ${err}`)}
})


router.post('/password', async(req,res)=>{
  try {
    const user = await User.findOne({
      _id:req.body.userId,
      resetToken:req.body.token,
      resetTokenExp:{$gt:Date.now()}
    })
    if(user){
      user.password = await argon2.hash(req.body.password, {hashLength:10})
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login#login')
      console.log("3")
    }
    else{
      req.flash('loginError', 'Время жизни токена истекло');
      res.redirect('/auth/login')
    }
  } 
  catch (error) {
    console.log(error)
  }
})

module.exports = router;