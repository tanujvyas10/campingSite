//all the middleware goes here

var middlewareObj={};
var Campground=require("../models/campground.js");
var Comment=require("../models/comment.js")


middlewareObj.checkCampgroundOwnership=function(req,res,next){
      
    if(req.isAuthenticated()){
            
        Campground.findById(req.params.id,function(err,data){
            if(err){
            req.flash("error","Campground not found")
              res.redirect("back")
            }
            else
            {//does user own the data
              //  console.log("========**--"+data.author.id)//this is not a string just another object
                if(data.author.id.equals(req.user._id)){
                  next();       
                }
                else{  //else redirect to previous page
                    req.flash("error","You dont have permission to do that")
                  res.redirect("back");

                }
            }
    
        })
    }
    else{
        req.flash("error","You are not permitted to do so! please logged in from your id")
        res.redirect("back")
    }
}

middlewareObj.checkCommentOwnership=function(req,res,next){
    if(req.isAuthenticated()){
       Comment.findById(req.params.comment_id,function(err,foundComment)
       {
           if(err)
              res.redirect("back")
           else
           {
            if(foundComment.author.id.equals(req.user._id))
               next();
               else
               res.redirect("back") 
           }   
       })
    }
    else{
        req.flash("error","you need to be logged in to comment")
        res.redirect("back")
    }
}

middlewareObj.checkLoggedIn= function(req,res,next){
    if(req.isAuthenticated()){
        return next();//HERE "NEXT" IS THE CAMPGROUND
    }
    req.flash("error","Please login first")
    res.redirect("/login")
}

module.exports=middlewareObj;