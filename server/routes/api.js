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

//  =================  en templates ===================

router.get('/templates', (res, req) => {
    // let templateData = res.body.template
    let title = res.headers.pagetitle
    let prefix = res.headers.prefix;

    Template.findOne({'pageTitle': title, 'prefix': prefix}, (err, template) => {
        if(err){
            return res.status(500).send(err)
        }else{
            res.res.status(200).send(template)
        }
    })
})

router.put('/templates', (res, req) => {
    let templateData = res.body.body.template;
    let prefix = res.body.body.prefix;
    let title = res.body.body.pageTitle 
    let templateObj = new Template(res.body)
    let opts = {
        upsert: true,
        new: true
      };

      Template.findOneAndUpdate({
          prefix: prefix,
        pageTitle : title
    },
    { $set: { template : templateData } }, opts, function(err, template){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.res.status(200).send(template)
        }
    });
})

//  =============  end eng templates ===================


//  =======================  ru templates ===================

// router.get('/templates_ru', (res, req) => {
//     // let templateData = res.body.template
//     let title = res.headers.pagetitle

//     TemplateRu.findOne({'pageTitle': title}, (err, template) => {
//         if(err){
//             return res.status(500).send(err)
//         }else{
//             res.res.status(200).send(template)
//         }
//     })
// })

// router.put('/templates_ru', (res, req) => {
//     let templateData = res.body.template;
//     let title = res.body.pageTitle 
//     let templateObj = new TemplateRu(res.body)
//     let opts = {
//         upsert: true,
//         new: true
//       };

//       TemplateRu.findOneAndUpdate({ pageTitle : title },
//     { $set: { template : templateData } }, opts, function(err, template){
//         if(err){
//             console.log("Something wrong when updating data!"+ '</br>' + err);
//         }else{
//             res.res.status(200).send(template)
//         }
//     });
// })

// ============== end ru =================

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


module.exports = router