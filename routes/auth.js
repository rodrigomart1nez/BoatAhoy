const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')



router.get('/', (req, res) => {
    res.render('landing.ejs')
})



//==========
//AUTH routes
//==========

//Show register form
router.get('/register', (req, res) => {
    res.render('register.ejs')
})

//handle singup logic
router.post('/register', (req, res) => {
    const newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash('error', err.message)
            return res.redirect('/register')
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('succes', `Welcome to BoatAhoy ${user.username}`)
            res.redirect('/boats')
        })
    })
})

//show login form
router.get('/login', (req, res) => {
    res.render('login.ejs')
})
//handle login logic
router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/boats', 
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {

})

//logout route
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('info', 'Loged out')
    res.redirect('/boats')
})

module.exports = router