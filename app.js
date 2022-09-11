const path = require('path');
const mongoose = require('mongoose')
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')

const errorController = require('./controllers/error');
const User = require('./models/user')


const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('trust proxy', 1) 


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true },
  store: store
}))
app.use(csrfProtection)
app.use(flash());


app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then((user) => {
    req.user = user;
    next();
  })
  .catch(err => {console.log(err)})
})

app.use((req, res, next) => {
res.locals.isAuthenticated = req.session.isLoggedIn;
res.locals.csrfToken = req.session.csrfToken();
next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose.connect(process.env.MONGODB_URL)
.then( result => {
    app.listen(3000, () => {
     console.log('champ')
    })
  }
  )
  .catch(err => {console.log(err)})


