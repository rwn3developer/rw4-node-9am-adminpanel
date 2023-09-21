const express = require('express');

const passport = require('passport');

const routes = express.Router();

const registerTbl = require('../models/registerTbl');

const flash = require('connect-flash');

const multer = require('multer');

const cookieParser = require('cookie-parser');


routes.use(cookieParser());

routes.use(flash());


const categoryTbl = require('../models/categoryTbl');
const subcategoryTbl = require('../models/subcategoryTbl');
const productTbl = require('../models/product');

//file uploads

const storage = multer.diskStorage({
    destination : (req,res,cb)=>{
        cb(null,'./uploads')
    },
    filename : (req,file,cb)=>{
        cb(null,file.originalname);
    }
})

const fileUpload = multer({storage : storage}).single('productimage')




routes.use((req,res,next)=>{
    res.locals.message = req.flash();
    next();
})

routes.get('/',(req,res)=>{
    if(res.locals.users){
        return res.redirect('/dashboard');
    }
    return res.render('index');
})

routes.get('/register',(req,res)=>{
    return res.render('register');
})

routes.post('/loginData', passport.authenticate('local', { failureRedirect: '/' }),(req,res)=>{
    return res.redirect('/dashboard');
})

routes.post('/registerData',async(req,res)=>{
    try{
        const {name,email,password,cpassword} = req.body;
        if(password == cpassword){
            let user = await registerTbl.create({
                name : name,
                email : email,
                password : password
            })
            if(user){
                console.log("Record successfully insert");
                req.flash('success', 'Record successfully insert');
                return res.redirect('back');
            }else{
                console.log("Record not successfully insert");
                return res.redirect('back');
            }
        }else{
            console.log("Confirm password and password not match");
            req.flash('error',"Confirm password and password not match");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/dashboard',passport.checkAuthentication,(req,res)=>{
    return res.render('dashboard');
})

routes.get('/form',(req,res)=>{
    return res.render('form');
})
routes.get('/table',(req,res)=>{
    return res.render('table');
})

routes.get('/profile',passport.checkAuthentication,(req,res)=>{
    return res.render('profile');
})

routes.post('/profileUpdate',passport.checkAuthentication,async(req,res)=>{
    try{
        const {profileid,name,email,password} = req.body;
        let profile = await registerTbl.findByIdAndUpdate(profileid,{
            name : name,
            email : email,
            password : password
        });
        if(profile){
            console.log("Profile successfully update");
            return res.redirect('/dashboard');
        }else{
            console.log("Profile not successfully update");
            return false
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/changepassword',(req,res)=>{
    return res.render('changepassword');
})

routes.post('/postnewpassword',async(req,res)=>{
    try{
        const {id,npassword,cpassword} = req.body;
        console.log(id);
        console.log(npassword);
        console.log(cpassword);
        if(npassword == cpassword){
            let newpass = await registerTbl.findByIdAndUpdate(id,{
                password: npassword
            });
            if(newpass){
                console.log("Password successfully changed!!");
                return res.redirect('/dashboard');
            }else{
                console.log("Password not change!!");
                return false;
            }
        }else{
            console.log("New Password and Confirm Passwords not same!!");
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.log(err);
            return false;
        }
        return res.redirect('/');
    })
})

routes.post('/emailData',async(req,res)=>{
    try{
        let record = await registerTbl.findOne({email : req.body.emaildata});
        let nodemailer = require('nodemailer');
        if(record){
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'rwn3developer11@gmail.com',
                  pass: 'errfowpkwdibiofo'
                }
              });

              let otp = Math.floor(Math.random() * 100000);

              var mailOptions = {
                from: 'rwn3developer11@gmail.com',
                to: req.body.emaildata,
                subject: 'Sending Email using Node.js',
                text: 'Your otp :- '+otp
              };

              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  let obj = {
                        email : req.body.emaildata,
                        otp : otp
                  }
                  res.cookie('forgotpassword',obj);
                  return res.redirect('/otp');
                }
              });

        }else{
            console.log("Email not found");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/otp',(req,res)=>{
    return res.render('otp');
})

routes.post('/postOtp',async(req,res)=>{
    try{
        let oldOtp = req.cookies['forgotpassword'];
        if(oldOtp.otp == req.body.otp){
            return res.redirect('/newpassword');
        }else{
            console.log("Otp is not match");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})


routes.get('/newpassword',(req,res)=>{
    return res.render('newpassword');
})

routes.post('/newpasswordPost',async(req,res)=>{
    try{
        const {newpass,cpass} = req.body;
        if(newpass == cpass){
            let email = req.cookies['forgotpassword'].email;
            let changePassword = await registerTbl.findOneAndUpdate({email : email},{
                password : newpass
            })
            if(changePassword){
                res.clearCookie('forgotpassword');
                return res.redirect('/');
            }else{
                console.log("Password not change");
                return res.redirect('back');
            }
        }else{
            console.log("newpassword and confirm not match");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/category',passport.checkAuthentication,async(req,res)=>{
    try{
        let viewcategory = await categoryTbl.find({});
        if(viewcategory){
            return res.render('category/category',{
                viewcategory
            });
        }else{
            console.log("Category not fetch");
            return false; 
        }
        
    }catch(err){
        return false;
    }
    
})
routes.get('/addcategory',passport.checkAuthentication,async(req,res)=>{
    return res.render('category/add_category');
})

routes.post('/postCategory',passport.checkAuthentication,async(req,res)=>{
    try{
        let category = req.body.category;
        let categorydata = await categoryTbl.create({
            category : category
        })
        if(categorydata){
            req.flash('success',"Category successfully insert");
            return res.redirect('back');
        }else{
            req.flash('error',"Category not successfully insert");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/deleteCategory/:id',passport.checkAuthentication,async(req,res)=>{
    try{
        let id = req.params.id;
        let deletecategory = await categoryTbl.findByIdAndDelete(id);
        if(deletecategory){
            req.flash('success',"Category successfully delete");
            return res.redirect('back');
        }else{
            req.flash('error',"Category not successfully delete");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/subcategory',passport.checkAuthentication,async(req,res)=>{
    try{
        const subcategory = await subcategoryTbl.find({}).populate('categoryId');
        return res.render('subcategory/subcategory',{
            subcategory
        })
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/add_subcategory',passport.checkAuthentication,async(req,res)=>{
    try{
        let category = await categoryTbl.find({});
        return res.render('subcategory/add_sub_category',{
            category
        });
    }catch(err){
        console.log(err);
        return false;
    } 
})

routes.post('/postSubCategory',passport.checkAuthentication,async(req,res)=>{
    try{
        const subcategory = await subcategoryTbl.create({
            categoryId : req.body.category,
            subcategory : req.body.subcategory
        });
        if(subcategory){
            req.flash('success',"Subcategory successfully insert");
            return res.redirect('back');
        }else{
            req.flash('error',"Subcategory not successfully insert");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/editsubcategory',passport.checkAuthentication,async(req,res)=>{
    try{
        let id = req.query.id;
        let category = await categoryTbl.find({});
        let editcategory = await subcategoryTbl.findById(id).populate('categoryId');
        return res.render('subcategory/edit_sub_category',{
            category,
            editcategory
        })
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.post('/postEditSubCategory',passport.checkAuthentication,async(req,res)=>{
    try{
        let editid = req.body.editid;
        const {category,subcategory} = req.body;
        let updateSubCategory = await subcategoryTbl.findByIdAndUpdate(editid,{
            categoryId : category,
            subcategory : subcategory
        });
        if(updateSubCategory){
           req.flash('success',"Record successfully Update");
            return res.redirect('back');
        }
        else{
            console.log("Record not update");
            return res.redirect('back');
        }
    }
    catch(err){
        console.log(err);
        return false;
    }
    
})

routes.get('/deletesubcategory',passport.checkAuthentication,async(req,res)=>{
    try{
        let editid = req.query.id;
        let deletecategory = await subcategoryTbl.findByIdAndDelete(editid);
        if(deletecategory){
            req.flash('success',"Category successfully delete");
            return res.redirect('back');
        }else{
            req.flash('error',"Category not successfully delete");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})

routes.get('/product',passport.checkAuthentication,async(req,res)=>{
    try{
        let product = await productTbl.find({}).populate('subcategoryId').populate('categoryId');
        console.log(product);
        return res.render('product/product',{
            product
        })
    }catch(err){
        console.log(err);
        return false;
    }
   
})

routes.get('/add_product',passport.checkAuthentication,async(req,res)=>{
    try{
        let category = await categoryTbl.find({});
        let subcategory = await subcategoryTbl.find({});
        return res.render('product/add_product',{
            category,
            subcategory
        })
    }catch(err){
        console.log(err);
        return false;
    }  
})

routes.post('/postProduct',passport.checkAuthentication,fileUpload,async(req,res)=>{
    try{
        const {category,subcategory,product,price,qty,description} = req.body;
        const productInsert = await productTbl.create({
            categoryId : category,
            subcategoryId : subcategory,
            product  :product,
            price : price,
            qty : qty,
            description : description,
            image : req.file.path
        })
        if(productInsert){
            req.flash('success',"Product successfully insert");
            return res.redirect('back');
        }else{
            req.flash('error',"Product not successfully insert");
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return false;
    }
})



module.exports = routes; 