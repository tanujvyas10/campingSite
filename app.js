var express=require("express");
var app=express();

var bodyParser=require("body-parser");
var methodOverride=require("method-override")
var mongoose=require("mongoose"),
passport               =require("passport"),
LocalStrategy          =require("passport-local"),
passportLocalMongoose  =require("passport-local-mongoose")
var User=require("./models/user")
var middleware=require("./middleware/index.js")//index is chosen as name of js file so that now if we dont even write the name of file to access we still get the index.js automatically
var flash=require("connect-flash");
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(express.static(__dirname+"/public"))//to include the style.css in the public
console.log(__dirname);

app.use(flash());
var port=process.env.PORT || 8000
app.set("view engine","ejs");
//schema setup
var Campground=require("./models/campground");
var seedDB=require("./seed");
//seedDB();

var Comment=require("./models/comment");
/*var User=require("./models/user");*/
/*Campground.create(
    {name:"vays",
    image:"http://www.ambiencemalls.com/logos/05-42-31am_17-03-2016-UCB.png",
    description:"this is a pics"
},function(err,camp){
    if(err)
    {
        console.log(err);
    }
    else{
        console.log("NEWLY CREATED CAMPGROND");
        console.log(camp);
    }
});*/


app.use(bodyParser.urlencoded({extend:true}));
app.use(methodOverride("_method"))
/*var campground=[
       {name:"vays",image:"http://www.ambiencemalls.com/logos/05-42-31am_17-03-2016-UCB.png"},
         {name:"vays",image:"https://envato-shoebox-0.imgix.net/2a41/93b3-6f8b-4f1c-8767-cd9772b4ded7/kave+310.jpg?w=500&h=278&fit=crop&crop=edges&auto=compress%2Cformat&s=fbc0d75299d7cfda0b3c60ea52ba4aaf"},
       {name:"vays",image:"http://www.ambiencemalls.com/logos/05-42-31am_17-03-2016-UCB.png"}
]*/

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"this is a lorem",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function(req,res,next){//our own middleware
    res.locals.currentlyUser=req.user;
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success")
     next();//this whole shit is done so that (now this middleware will run for all routes)the current user can be send to call the routes and the currentUser condition in the header.ejs can be satisfies as now it will be a defined term
   })//next() is written so that the condition of currentlyUser = req.user can be valid for all the routes

   app.get("/",function(req,res){
    res.render("home"); 
})

app.get("/landing",function(req,res){
    res.render("landing")
})

app.get("/campgrounds",middleware.checkLoggedIn,function(req,res){
  //GET ALL DATA FROM DATA BASE
  console.log(req.user)
  Campground.find({},function(err,allcamp){
      if(err)
      {
          console.log(err);
      }
      else{
        res.render("campground/index",{campground:allcamp,currentlyUser:req.user})
      }
  })
     
})

//EDIT CAMPGROUND route
app.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
    //is the user logged in
  //  console.log("======="+req.user._id)//this is a string
     
        Campground.findById(req.params.id,function(err,data){
                
                       console.log("check this out:"+data)        
                       res.render("editing",{data:data});
                })
}); 




//UPDATE CAMPGROUND route
app.put("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
 Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updateData){
     if(err)
      console.log(err)
      else{
          res.redirect("/campgrounds/"+req.params.id)
      }
 })
    })
    

//DELETE A CAMPGROUND
app.get("/campgrounds/:id/delete",middleware.checkCampgroundOwnership,function(req,res){
   Campground.findByIdAndRemove(req.params.id,function(err){
       if(err)
       console.log(err)
       else
       {
        res.redirect("/campgrounds")
       }
    })
})

    
            app.post("/campgrounds",middleware.checkLoggedIn,function(req,res){
    //console.log("hahaha"+req.user);
    //get data form form and add to campground array and redirect
     var name=req.body.name;
     var image=req.body.image;
     var price=req.body.price;
     var description=req.body.description;
     var author={
         id:req.user._id,
         username:req.user.username
     }
     var obj={name:name,image:image,price:price,description:description,author:author};
   //campground.push(obj);
     //create a new campground and save to db
     Campground.create(obj,function(err,newcreate){
         if(err){
console.log(err);
         }
         else{
             console.log(newcreate)
            res.redirect("/campgrounds");
         }
     })
  
})

app.get("/campgrounds/new",middleware.checkLoggedIn,function(req,res){
    res.render("campground/new");
})

app.get("/campgrounds/:id",middleware.checkLoggedIn,function(req,res){
    
  Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
    if(err)    
      { 
         console.log(err)
      }
      else{
        console.log(foundCampground)
        res.render("campground/show",{campground:foundCampground});
      }
  })

   
    //res.send("this will be the show page")
})



//COMMENTS
app.get("/campgrounds/:id/comments/new",middleware.checkLoggedIn,function(req,res){
   // res.send("THE WILL BE THE COMMENTS SECTION")
   Campground.findById(req.params.id,function(err,campground){
       if(err)
       console.log(err)
       else
        res.render("comments/new",{campground:campground})
   })

})

app.post("/campgrounds/:id/comments",function(req,res){
    //lookup campground using ID
  
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        {
            console.log(err);
        res.redirect("/campgrounds")
        }
        else{
            console.log(req.body.comment)
            Comment.create(req.body.comment,function(err,comm){
                if(err){
                    req.flash("error","Something went wrong!!:(");
                console.log(err)
                }
                else{//add username and id to comment
                    console.log("New comment username will be-->"+req.user.username)
                    comm.author.id=req.user._id;
                    comm.author.username=req.user.username;
                    //save comment
                    comm.save();
                    campground.comments.push(comm);
                    campground.save();
                    req.flash("success","Successfully added comment")
                    res.redirect("/campgrounds/"+campground._id)
                }
            })
          
        }
    })
    //connect new comment using campground
    //redirect to campground showpage
})

//COMMENT EDITING
app.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
 //res.send("lets edit the commment")
 //console.log("=============")
 //console.log(req.params)
Comment.findById(req.params.comment_id,function(err,foundcomment){
    if(err)
    res.redirect("back")
    else{
        res.render("commentsEdit",{data_id:req.params.id,comment:foundcomment})
    }
})
  //
})
//UPDATE THE COMMENT
 app.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
console.log("you reached here")

Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updateData){
if(err)
   res.redirect("back")
   else{
       res.redirect("/campgrounds/"+req.params.id)
       }
   })  
})

//COMMENT DELETE
app.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
        res.redirect("back")
        }
      else
      {
        req.flash("success","Comment is deleted")
      res.redirect("/campgrounds/"+req.params.id)
      }
    })
  
})

//LOGIN THE USER
app.get("/login",function(req,res){
    res.render("login")
})

//LOGIN LOGICS
app.post("/login",passport.authenticate("local",{//app.post("/login",middleware that need for login authentication and processing,callback)
    successRedirect:"/campgrounds",
    failureRedirect:"/login"    
}),function(req,res){
})
//SIGNUP THE USER
app.get("/signup",function(req,res){
    res.render("signup")
})
//HANDLING SIGN UP LOGIC
app.post("/signup",function(req,res){
  var newUser=new User({username:req.body.username})
User.register(newUser,req.body.password,function(err,user){//user will provide username
    if(err)
   { console.log(err)
    req.flash("error",err.message)
    res.render("signup")
}
passport.authenticate("local")(req,res,function(){
    req.flash("success","hey "+ user.username+" ! you are successfully signed in")
    res.redirect("/campgrounds")
   })


    }) 
 })


//LOGOUT ROUTE 
 app.get("/logout",function(req,res){
     req.logout();
     req.flash("success","logged you out!");
     res.redirect("/")
 })




app.listen(port,function(){
    console.log("yelpcamp started");
})