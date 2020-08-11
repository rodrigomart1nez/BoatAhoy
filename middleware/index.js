const Campground = require('../models/campground')
const Comment = require('../models/comment')

//all the middleware goes here
const middlewareObj = {}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'Please Login First')
    res.redirect('/login')
}
middlewareObj.checkCommentOwnership = (req, res, next) => {
    //is user logged in
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                console.log(err)
            } else {
                //is user the owner
                if (foundComment.author.id.equals(req.user._id)) {
                    next()
                } else {
                    res.redirect('back')
                    req.flash('error', 'You don´t have permission to do that')
                }
            }
        })
    } else {
        req.flash('error', 'Please login before doing that')
        res.redirect('/login')
    }
}
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    //is user logged in
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCamp) => {
            if (err) {
                req.flash('error', 'Campground not found')
                console.log(err)
            } else {
                //is user the owner
                if (foundCamp.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash('error', 'You dont own this campground post')
                    res.redirect('back')
                }
            }
        })
    } else {
        req.flash('error', 'Please login before doing that')
        res.redirect('back')
    }
}



module.exports = middlewareObj