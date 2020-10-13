const express = require('express')
const router = express.Router()
const Boat = require('../models/boat')
const { Router } = require('express')
const  Comment   = require('../models/comment')
const middleware = require('../middleware')


//INDEX - display a list of all boats
router.get('/', (req, res) => {
    // Get all boats from DB
    Boat.find({}, (err, allBoats) => {
        if (err) {
            console.log(err)
        } else {
            res.render('boats/boats.ejs', {boats:allBoats, currentUser:req.user})
        }
    })
})

//CREATE - add new boat to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
    const name = req.body.name
    const image = req.body.image
    const price = req.body.price
    const desc = req.body.description
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newBoatgorund = {name: name, image: image, price: price, description: desc, author:author}
    // Create new boat and save to DB
    Boat.create(newBoatgorund, (err, newBoat) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/boats')
        }
    })
})

//NEW - show form to create new boat
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('boats/new.ejs')
})

//SHOW - shows more info about one boat (must be declared after the new / to avoid cofusions)
router.get('/:id', (req, res) => {
    // find the boat with provided id
    Boat.findById(req.params.id).populate('comments').exec((err, foundBoat) => {
        if (err) {
            console.log(err)
        } else {
            // render show template with that boat
            res.render('boats/show.ejs', {boat: foundBoat})
        }
    })
})

//EDIT BOAT ROUTE
router.get('/:id/edit', middleware.checkBoatOwnership, (req, res) => {
    Boat.findById(req.params.id, (err, foundBoat) => {
        res.render('boats/edit.ejs', {boat: foundBoat})
    })
})

//UPDATEBOAT ROUTE
router.put('/:id', middleware.checkBoatOwnership, (req, res) => {
    //find and update the correct boat
    Boat.findByIdAndUpdate(req.params.id, req.body.boat, (err, updatedBoat) => {
        if (err) {
            res.redirect('/boats')
        } else {
            res.redirect(`/boats/${req.params.id}`)
        }
    })
    //redirect
})

//DESTROY BOAT ROUTE
router.delete('/:id', middleware.checkBoatOwnership, (req, res) => {
    Boat.findByIdAndRemove(req.params.id, (err, boatRemoved) => {
        if (err) {
            res.redirect('/boats')
        }
        Comment.deleteMany( {_id: { $in: boatRemoved.comments } }, (err) => {
            if (err) {
                res.redirect('/boats')
            }
            res.redirect('/boats')
        })
    })
})

module.exports = router