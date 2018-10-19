const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Discount = require('../models/discounts')
const Template = require('../models/templates')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const pretty = require('pretty');
mongoose.set('useFindAndModify', false);

// mongoose.connect(db,{useNewUrlParser:true}, err => {
//     if(err){
//         console.log('Error' + err)
//     }else{
//         console.log('Connected')
//     }
// })

mongoose.connect(db,{useNewUrlParser:true})
    .then(() => {
        console.log('start')
      })
      .catch((err) => {
        console.log('Error on start: ' + err);
    })

function verifyToken(req, res, next){
    if (!req.headers.autorization) {
        return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.autorization.split(' ')[1];
    if (token === 'null'){
        return res.status(401).send('Unauthorized request');
    }
    let payload = jwt.verify(token, 'secretKey');
    if(!payload){
        return res.status(401).send('Unauthorized request');
    }
    req.userId = payload.subject
    next()
}

router.get('/', (req, res) => {
    res.send('From API route')
})

router.post('/register', (req, res) => {
    let userData = req.body;
    let user = new User(userData)
    user.save((error, registeredUser) => {
        if(error) {
            console.log(error)
        }else{
            let payload = { subject: registeredUser._id }
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
    })
})

router.get('/templates', (res, req) => {
    // let templateData = res.body.template
    let title = res.headers.pagetitle

    Template.findOne({'pageTitle': title}, (err, template) => {
        if(err){
            return res.status(500).send(err)
        }else{
            res.res.status(200).send(template)
        }
    })
})

router.put('/templates', (res, req) => {
    let templateData = res.body.template;
    let title = res.body.pageTitle 
    let templateObj = new Template(res.body)
    let opts = {
        upsert: true,
        new: true
      };

    Template.findOneAndUpdate({ pageTitle : title },
    { $set: { template : templateData } }, opts, function(err, template){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.res.status(200).send(template)
        }
    });
})
    // Template.findOneAndUpdate({'pageTitle': title},{$set:{'template':templateData}},opts)   
    // .then((docs)=>{
    //     if(docs) {
    //        resolve({success:true,template:docs});
    //     } else {
    //     //    reject({success:false,data:"no such user exist"});
    //     console.log('error');
    //     }
    // }).catch((err)=>{
    // //    reject(err);
    // console.log(err);
    // })
    // Template.findOneAndReplace({'pageTitle': title},{'template': templateData}, (error, template) => {
    //     if(error) {
    //         console.log(error);
    //     }else {
    //         if(!template){
                
    //             templateObj.save((error, savedTemplate) => {
    //                 if(error) {
    //                     console.log(error);
    //                 }else {
    //                     console.log( savedTemplate);
    //                     // templateObj.remove({pageTitle: title})
    //                     res.status(200).send(savedTemplate)
    //                 }
    //             })
    //         }
    //         else{
    //             templateObj.save((err, template) => {
    //                 if(err){
    //                     console.log(err);
    //                 }else{
    //                     Template.remove({pageTitle: title})
    //                     // res.status(200).send(template)
    //                 }
    //             })
    //             // res.status(200).send({templateData})
                
    //             // Template.remove({'pageTitle': title res.status(200).send(req.body)
    //         }
           
    //     }
    // })

    // try {
    //    Template.findOneAndUpdate(
    //     {pageTitle: title},{template: templateData}
    //     );
    //  }
    //  catch(e){
    //     console.log(e);
    //  }
    

        // Template.update(
        //     {'pageTitle': title}, {$set: {pages:2}}
        //     // { pageTitle : pageTitle },
        //     // { $set: { template : templateData } }
        //     // pageTitle, { template: templateData }, (err, res) =>{
        //     //     if(err){
        //     //         console.log(err);
        //     //     }
        //     //     else{
        //     //         console.log(res);
        //     //     }
        //     // }
        // )



router.post('/login', (req, res) => {
    let userData = req.body;

    User.findOne({email: userData.email}, (error, user) => {
        if(error){
            console.log(error)
        }else{
            if(!user){
                res.status(401).send('Invalid email')
            }else{
                if(user.password !== userData.password){
                    res.status(401).send('Invalid password')
                }else{
                    let payload = { subject: user._id}
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({token})
                }
            }
        }
    })
})

router.post('/discounts', (req, res) => { 
    let discountData = req.body;

    Discount.findOne({promoCode: discountData.promoCode}, (error, promoCode) => {
        if(error){
            console.log(error);
        }else{
            if(!promoCode){
                res.status(401).send('Invalid email')
            }else{
                res.status(200).send({promoCode})
            }
        }
    })
 })


//  router.post('/templates', (req, res) => {
//     let templateData = req.body;
   
 
    
//     let template = new Template(templateData)
   
//     template.save((error, savedTemplate) => {
//         if(error) {
//             console.log(error);
//         }else {
//             console.log( savedTemplate);
//             res.status(200).send(savedTemplate)
//         }
//     })
//  })

module.exports = router