const {body} = require('express-validator');
const User = require('../models/user');
exports.regValidators = [
  body('email')
    .isEmail().withMessage('Введите корректный email')
    .custom(async (value, {req})=>{
      try {
        const user = await User.findOne({email: value});
        if(user){
          return Promise.reject("Такой email уже существует!")
        }
      } 
      catch (error) {
        console.log(`Ошибка: ${error}`)
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль должен быть минимум 8 символов')
    .isLength({min:8, max:25}).isAlphanumeric(),
  body('confirm').custom((value, {req})=>{
    if(value !== req.body.password){
      throw new Error('Парoли не совпадают')
    }
    return true;
  }),
  body('name').isLength({min:3}).withMessage('Имя слишком короткое, минимум 3 символа')
];

exports.add_edit_Validators = [
  body('title')
    .isLength({min:3}).withMessage('Название книги слишком короткое, минимум 3 символа').trim(),
  body('image')
    .isURL().withMessage('Ссылка на картинку не действительная'),
  body('price')
    .isNumeric().withMessage('Введите корректную цену!').trim(),
];

exports.editValidators = [

]