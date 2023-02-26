const express = require('express');
const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
require("dotenv").config({path:'./keys/index'});
const mongoose = require('mongoose');
const helmet = require("helmet");
const compression = require('compression');
const Handlebars = require('handlebars');
const exp_hbs = require('express-handlebars');
const session = require('express-session');
const MongoSS = require('connect-mongodb-session')(session);
const userMid = require('./middleware/user')
const app = express();
const User = require('./models/user');
const homeRoute = require('./routes/home');
const booksRoute = require('./routes/books');
const addRoute = require('./routes/add');
const cartRoute = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const sessionsMid = require('./middleware/session');
const errorURL = require('./middleware/error')
const fileMid = require('./middleware/file');
const keys = require('./keys')

const PORT = process.env.PORT || 3000;
//const HOST = process.env.host || '127.0.0.1';

async function start(){
  try{
    await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser:true, dbName: 'bookshop'});
    const visitor = User.findOne();
    app.listen(PORT, HOST, ()=>console.log(`Server works on port ${PORT}`));
  }
  catch(err){console.log(`Ошибка: ${err}`);}
}

start();

const hbs = exp_hbs.create({
  defaultLayout:'main',
  extname:'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
});


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

const store = new MongoSS({
  collection:'sessions',
  uri: keys.MONGODB_URI
})

//Static files
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/user-imgs', express.static(path.join(__dirname, 'user-imgs'))); 
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret: keys.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  store:store
}));

app.use(fileMid.single('avatar'))

app.use(csurf());
app.use(flash());
// app.use(helmet());
app.use(userMid);
app.use(compression());
app.use(sessionsMid);

//Routes
app.use('/', homeRoute);
app.use('/books', booksRoute);
app.use('/add', addRoute);
app.use('/cart', cartRoute);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes)
app.use(errorURL)

// connect-mongodb-session