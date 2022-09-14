const User = require('../models/user')

const sendgridTransport = require('nodemailer-sendgrid-transport')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const { validationResult } = require('express-validator/check')

const nodemailer = require('nodemailer')



const transporter = nodemailer.createTransport(
    sendgridTransport({
    auth: {
        api_key: ''
    }
}))

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
} 

exports.postSignup = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;

   const errors = validationResult(req)
 if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {
            email: email,
            password: password,
            confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
    })
 }
   
  bcrypt.hash(password, 12)
      .then(hashedPassword => {
        //creates new user with a hashed password
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
        })
        return user.save();
       }).then(result => {
        res.redirect('/login')
            return transporter.sendMail({
            to: email,
            from: 'shop@classie.com',
            subject: 'Signup successful!',
            html: '<h1>You successfully signed up</h1>'
        }).catch(err => {
            console.log(err)
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
   }) 
} 



exports.getLogin = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInput: {
            email: '',
            password:  ''
        },
        validationErrors: []
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.boby.password

    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            path: 'login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({email: email})
    .then(user => {
        if(!user){
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            })
        }
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user
                return req.session.save(err => {
                    console.log(err)
                    res.redirect('/') 
                })
            }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: []
          })
        })
        .catch( err => {
            console.log(err)
            res.redirect('/login')
        })
    })
    .catch( err =>  {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}


exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.getReset =(req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) =>{
crypto.randomBytes(32, (err, buffer) => {
    if(err){
        console.log(err)
        return res.redirect('/reset');
    }
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user){
            req.flash('error', 'No account woth this email found!');
            res.redirect('/reset')
        }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 36000000;
          return user.save();
    }).then(result => {
        transporter.sendMail({
            to: req.body.email,
            from: 'shop@classie.com',
            subject: 'Password reset!',
            html: `<p>Click this <a href="http://localhost:3000/reset/${token}
            to set a new Password!
            </p>`
        })
    })
    .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
})
}



exports.getNewPassword = (req,res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render('auth/new-password', {
            pageTitle: 'New Password',
            path: '/new-password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        })
    })
    .catch( err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}



exports.postNewPassword =(req, res, next) => {
    const newpassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
         _id: userId
        })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newpassword, 12)
    }).then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login')
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}