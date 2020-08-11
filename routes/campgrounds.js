const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const { Router } = require('express')
const  Comment   = require('../models/comment')
const middleware = require('../middleware')


//INDEX - display a list of all camps
router.get('/', (req, res) => {
    // Get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err)
        } else {
            res.render('campgrounds/campgrounds.ejs', {campgrounds:allCampgrounds, currentUser:req.user})
        }
    })
})

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
    const name = req.body.name
    const image = req.body.image
    const price = req.body.price
    const desc = req.body.description
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newCampgorund = {name: name, image: image, price: price, description: desc, author:author}
    // Create new camp and save to DB
    Campground.create(newCampgorund, (err, newCamp) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/campgrounds')
        }
    })
})

//NEW - show form to create new camp
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs')
})

//SHOW - shows more info about one camp (must be declared after the new / to avoid cofusions)
router.get('/:id', (req, res) => {
    // find the camp with provided id
    Campground.findById(req.params.id).populate('comments').exec((err, foundCamp) => {
        if (err) {
            console.log(err)
        } else {
            // render show template with that camp
            res.render('campgrounds/show.ejs', {campground: foundCamp})
        }
    })
})

//EDIT CAMPRGOUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCamp) => {
        res.render('campgrounds/edit.ejs', {campground: foundCamp})
    })
})

//UPDATE CAMPGOUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCamp) => {
        if (err) {
            res.redirect('/campgrounds')
        } else {
            res.redirect(`/campgrounds/${req.params.id}`)
        }
    })
    //redirect
})

//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            res.redirect('/campgrounds')
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
                res.redirect('/campgrounds')
            }
            res.redirect('/campgrounds')
        })
    })
})

module.exports = router