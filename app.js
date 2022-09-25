const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


require('dotenv').config()
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')
const multer  = require('multer')


const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const Auth = require('./middleware/is-auth')
const User = require('./models/user')


const app = express();

//user session definiton
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions'
});
store.on('error', function(error) {
  console.log(error);
});

const csrfProtection = csrf();

//file upload with multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
   cb(null, 'images')
  },
   filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
//file upload filter with multer
function fileFilter (req, file, cb) {
 if ( file.mimetype === 'images/png' ||
      file.mimetype === 'images/jpg' ||
      file.mimetype === 'images/jpeg'

 ){
  cb(null, true)
 }
  cb(null, false)
 
  cb(new Error('I don\'t have a clue!'))
}

//templete engine ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

//app routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


//default middlewares
app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('images') )

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
  secret: 'keyboard',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true },
  store: store
}))

app.use(flash());

//registering users on signup
app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then((user) => {
    if(!user){
      return next();
    }
    req.user = user;
    next();
  })
  .catch(err => { throw new Error(err)})
})

//session middleware
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next();
  });

app.post('/orders', Auth, shopController.postOrder)


app.use(csrfProtection)
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
  });
//middleware registration
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)
app.use(errorController.get404);

app.use((error, req, res, next) => {
  
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.isLoggedIn 
  });
})

//database connection
const port = process.env.PORT || 3000; 

mongoose.connect(process.env.MONGODB_URL)
.then( result => {
    app.listen(3000, () => {
      console.log(`Listening at port ${port}...`)
    })
  }
  )
  .catch(err => {console.log(err)})


