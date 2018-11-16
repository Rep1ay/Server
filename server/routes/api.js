const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Discount = require('../models/discounts')
const Navbar = require('../models/navbar')
const Language = require('../models/language')
const Template = require('../models/templates')
const Permalink = require('../models/permalinks')
const Lang_list = require('../models/lang_list')
const NewsCollection = require('../models/news')
// const ArticlesCollection = require('../models/articles')

const mongoose = require('mongoose')
const db = 'mongodb://antwerk:antwerk18@ds040309.mlab.com:40309/antwerkdb'

const jwt = require('jsonwebtoken')
const pretty = require('pretty');
mongoose.set('useFindAndModify', false);

mongoose.connect(db,{useNewUrlParser:true})
    .then(() => {
        console.log('start api.js')
      })
      .catch((err) => {
        console.log('Error on start: ' + err);
    })

router.get('/', (req, res) => {
    res.send('From API route')
})

router.get('/article', (req, res) => {
    let lang = req.headers.prefix;
    let id = req.headers.id;

    NewsCollection.findOne({'prefix': lang, 'id': id}, (err, template) => {
        if(err){
            return res.status(500).send(err)
        }else{
             res.status(200).send(template)
        }
    })
})

router.put('/article', (req, res) => {
    let lang = req.body.body.prefix;
    let id = req.body.body.id;
    let category =  req.body.body.category;
    let template = req.body.body.template;    
    let discription = req.body.body.discription;  
    let title =  req.body.body.title;  
    let image =  req.body.body.image;
    let date =  req.body.body.date;
    let opts = {
        upsert: true,
        new: true
      };

      NewsCollection.findOneAndUpdate({
        'prefix': lang,
        'id': id
    },
    { $set: { 'template' : template , 'discription': discription, 'category': category, 'title': title, 'image': image, 'date': date  } },
     opts, 
     function(err, template){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.status(200).send(template)
        }
    });
})

router.get('/news', (req, res) => {
    let prefix = req.headers.prefix
    
    NewsCollection.find({'prefix': prefix},(err, news_collection) => {
        res.status(200).send(news_collection)
        },
        (err) => {
            return res.status(500).send(err)
        }
    )  
})

router.get('/navbar', (req, res) => {
    let lang = req.headers.lang

    Navbar.findOne({'lang': lang}, (err, navbar) => {
        if(err){
            return res.status(500).send(err)
        }else{
             res.status(200).send(navbar)
        }
    })
})

//  Place for navbar put

router.get('/lang_list', (req, res) => {
    // let prefix = req.body.prefix
    Lang_list.find({},(err, lang_list) => {
            res.status(200).send(lang_list)
        },
        (err) => {
            return res.status(500).send(err)
        }
    )   
})

router.get('/pageTitle', (res, req) => {
    let permalink = res.headers.permalink

    Permalink.findOne({'permalink': permalink}, (err, pageTitle) => {
        if(err){
            return res.status(500).send(err)
        }else{
             res.res.status(200).send(pageTitle)
        }
    })
})

router.get('/permalink', (res, req) => {
    // let templateData = res.body.template
    let title = res.headers.pagetitle

    Permalink.findOne({'pageTitle': title}, (err, permalink) => {
        if(err){
            return res.status(500).send(err)
        }else{
            res.res.status(200).send(permalink)
        }
    })
})


router.put('/permalink', (res, req) => {
    let title = res.body.pageTitle 
    let permalink =  res.body.permalink 

    let opts = {
        upsert: true,
        new: true
      };

    Permalink.findOneAndUpdate({
        pageTitle : title
    },
    { $set: { permalink : permalink } }, opts, function(err, permalink){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.res.status(200).send(permalink)
        }
    });
})


router.get('/templates', (res, req) => {
    // let templateData = res.body.template
    let title = res.headers.pagetitle
    let prefix = res.headers.prefix.toLowerCase();

    
    Template.findOne({'pageTitle': title, 'prefix': prefix}, (err, template) => {
        if(err){
            return res.status(500).send(err)
        }else{
            if(template){
                Permalink.findOne({'pageTitle': title}, (err, permalink) => {
                    if(err){
                        return res.status(500).send(err)
                    }else{
                        Permalink.findOne({'permalink': title}, (err, pageTitle) => {
                            if(err){
                                return res.status(500).send(err)
                            }else{
                                  let permalink;
                                  if(pageTitle){
                                      permalink = pageTitle.permalink
                                  }else{
                                    permalink = title
                                  }
                                let body_send = {
                                    'data': template,
                                    'permalink': permalink
                                }
                                res.res.status(200).send(body_send)
                            }
                        })
                    }
                })
            }
                // res.res.status(200).send(template)
            else{
                Permalink.findOne({'permalink': title}, (err, pageTitle) => {
                    if(err){
                        return res.status(500).send(err)
                    }else{
                        if(pageTitle){
                            let gotObj = pageTitle;
                            Template.findOne({'pageTitle': pageTitle.pageTitle, 'prefix': prefix}, (err, template) => {
                                if(err){
                                    return res.status(500).send(err)
                                }else{
                                    if(template){
                                        let body_send = {
                                            'data': template,
                                            'permalink': title
                                        } 
                                        res.res.status(200).send(body_send)
                                    }else{
                                        let body_send = {
                                            'data': gotObj
                                        }
                                        
                                        res.res.status(200).send(body_send)
                                    }
                                }
                            })
                        }else{
                            let body_send = null;
                            res.res.status(200).send(body_send)
                        }

                    }
                })
            }
        
        }
    })
})

router.put('/templates', (res, req) => {
    let templateData = res.body.body.template;
    let prefix = res.body.body.prefix;
    let title = res.body.body.pageTitle 
    let permalink =  res.body.body.permalink 
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

router.get('/lang_panel', (req, res) => {
    // let prefix = req.body.prefix
    Language.find({},(err, panel) => {
            res.status(200).send(panel)
        },
        (err) => {
            return res.status(500).send(err)
        }
    )   
})

router.put('/lang_panel', (req, res) => {
    let prefix = req.body.prefix
    if(prefix){
        let opts = {
            upsert: true,
            new: true
        };

        Language.findOneAndUpdate({
            prefix: prefix
        },
        { $set: { language: prefix } }, opts, function(err, lang){
            if(err){
                console.log('Somthing went wrong wuth language' + '</br>' + err);
            }else{
                res.status(200).send(lang)
            }
        }
        )
    }
})

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
// router.post('/discounts', (req, res) => { 
//     let discountData = req.body;

//     Discount.findOne({promoCode: discountData.promoCode}, (error, promoCode) => {
//         if(error){
//             console.log(error);
//         }else{
//             if(!promoCode){
//                 res.status(401).send('Invalid email')
//             }else{
//                 res.status(200).send({promoCode})
//             }
//         }
//     })
//  })


module.exports = router