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
const NewsCategory = require('../models/news_category')
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

router.get('/3_articles', (res, req) => {
    let prefix = res.headers.prefix;

    NewsCollection.find( { 'prefix': prefix }, { array: {$slice: 3 } }, (err, array) =>{
        if(err){
            return res.res.status(500).send(err)
        }else{
             res.res.status(200).send(array)
        }
    } ).sort({_id:-1});
})

router.get('/article', (req, res) => {
    let lang = req.headers.prefix;
    let id = req.headers.id;

    NewsCollection.findOne({'prefix': lang, 'id': id}, (err, template) => {
        if(err){
            return res.res.status(500).send(err)
        }else{
             res.status(200).send(template)
        }
    })
})

router.put('/article', (req, res) => {
    let lang = req.body.body.prefix;
    let newId = req.body.body.newId;
    let oldId =  req.body.body.oldId;
    let category =  req.body.body.category;
    let template = req.body.body.template;    
    let description = req.body.body.description;  
    let title =  req.body.body.title;  
    let image =  req.body.body.image;
    let date =  req.body.body.date;
    let opts = {
        upsert: true,
        new: true
      };

      NewsCollection.findOneAndUpdate({
        'prefix': lang,
        'id': oldId
    },
    { $set: { 'id': newId, 'template' : template , 'description': description, 'category': category, 'title': title, 'image': image, 'date': date  } },
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
            return res.res.status(500).send(err)
        }
    ).sort({_id:-1});
})

router.get('/news_by_category', (req, res) => {
    let prefix = req.headers.prefix
    let category = req.headers.category
    
    NewsCollection.find({'category': category,'prefix': prefix},(err, news_collection) => {
        res.status(200).send(news_collection)
        },
        (err) => {
            return res.res.status(500).send(err)
        }
    )
})



router.get('/lang_list', (req, res) => {
    // let prefix = req.body.prefix
    Lang_list.find({},(err, lang_list) => {
            res.status(200).send(lang_list)
        },
        (err) => {
            return res.res.status(500).send(err)
        }
    )   
})

router.get('/pageTitle', (res, req) => {
    let permalink = res.headers.permalink

    Permalink.findOne({'permalink': permalink}, (err, pageTitle) => {
        if(err){
            return res.res.status(500).send(err)
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
            return res.res.status(500).send(err)
        }else{
            res.res.status(200).send(permalink)
        }
    })
})


router.put('/permalink', verifyToken, (res, req) => {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                message: 'Permalink created',
                authData
            })
            
        }
    })

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

router.put('/news_category', (res, req) => {
    let prefix = res.body.body.prefix 
    let category =  res.body.body.category 

    let opts = {
        upsert: true,
        new: true
      };

    NewsCategory.findOneAndUpdate({
        'category' : category
    },
    { $set: { 'prefix' : prefix } }, opts, function(err, category){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.res.status(200).send(category)
        }
    });
})

router.get('/news_category', (req, res) => {
    let prefix = req.headers.prefix
    
    NewsCategory.find({'prefix': prefix},(err, news_category_collection) => {
        res.status(200).send(news_category_collection)
        },
        (err) => {
            return res.res.status(500).send(err)
        }
    )
})

router.get('/templates', (res, req) => {
    // let templateData = res.body.template
    let title = res.headers.pagetitle
    let prefix = res.headers.prefix.toLowerCase();

    
    Template.findOne({'pageTitle': title, 'prefix': prefix}, (err, template) => {
        if(err){
            return res.res.status(500).send(err)
        }else{
            if(template){
                Permalink.findOne({'pageTitle': title}, (err, permalink) => {
                    if(err){
                        return res.res.status(500).send(err)
                    }else{
                        let sendPermalink;
                        if(permalink){
                            if(err){
                                return res.res.status(500).send(err)
                            }else{
                                sendPermalink = permalink.permalink
                            }
                        }else{
                            Permalink.findOne({'permalink': title}, (err, pageTitle) => {
                                if(err){
                                    return res.res.status(500).send(err)
                                }else{
                                    if(pageTitle){
                                        sendPermalink = pageTitle.permalink
                                    }
                                }
                            })
                        }
                        
                        let body_send = {
                            'data': template,
                            'permalink': sendPermalink
                        }

                        res.res.status(200).send(body_send)
                    }
                })
            }else{
                Permalink.findOne({'permalink': title}, (err, pageTitle) => {
                    let returnedTitle = title;
                    if(err){
                        return res.res.status(500).send(err)
                    }else{
                        if(pageTitle){
                            let gotObj = pageTitle;
                            Template.findOne({'pageTitle': pageTitle.pageTitle, 'prefix': prefix}, (err, template) => {
                                if(err){
                                    return res.res.status(500).send(err)
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
                            Permalink.findOne({'pageTitle': returnedTitle}, (err, permalink) => {
                                let returnedPermalink = title;
                                if(err){
                                    return res.res.status(500).send(err)
                                }else{

                                    if(permalink){
                                        returnedPermalink = permalink.permalink
                                    }

                                    let body_send = {
                                        'data': {
                                            'permalink': returnedPermalink,
                                            'pageTitle': returnedTitle
                                        }
                                    }
                                    res.res.status(200).send(body_send)
                                }
                            })
                        }
                    }
                })
            }
        }
    })
})

router.put('/templates', (res, req) => {
    let templateData = res.body.body.template;
    let prefix = res.body.body.prefix.toLowerCase();
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

router.put('/navbar_items', (res, req) => {

    let prefix = res.body.prefix.toLowerCase();
    let navBarItem = res.body.navBarItem 
    let navBarItemLabel =  res.body.navBarItemLabel 

    let opts = {
        upsert: true,
        new: true
      };

    Navbar.findOneAndUpdate({
        prefix: prefix,
        navBarItem : navBarItem
    },
    { $set: { navBarItemLabel : navBarItemLabel } }, opts, function(err, template){
        if(err){
            console.log("Something wrong when updating data!"+ '</br>' + err);
        }else{
            res.res.status(200).send(template)
        }
    });
})

router.get('/navbar_items', (req, res) => {
    let prefix = req.headers.lang
    // let navbarItem = req.headers.navbarItem

    Navbar.find({'prefix': prefix}, (err, navbar) => {
        if(err){
            return res.res.status(500).send(err)
        }else{
             res.status(200).send(navbar)
        }
    })
})


router.get('/lang_panel', (req, res) => {
    // let prefix = req.body.prefix
    Language.find({},(err, panel) => {
            res.status(200).send(panel)
        },
        (err) => {
            return res.res.status(500).send(err)
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
            'prefix': prefix
        },
        { $set: { language: prefix } }, opts, function(err, lang){
            if(err){
                console.log('Somthing went wrong with language' + '</br>' + err);
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
    let userExemp = new User(userData)

    User.find({email: userData.email}, (err, user) => {
        if(user) {
            return res.status(409).json({
                message: 'User with this e-mail adress already exist!'
            })
        }else if(err){
            return res.res.status(500).send(err)
        }else{
            // res.status(201).json({
            //     message: 'User created'
            // })
            userExemp.save((error, registeredUser) => {
                if(error) {
                    console.log(error)
                }else{
                    let payload = { subject: registeredUser._id }
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({token})
                }
            })
        }
    })
    
})

function verifyToken(req, res, next){
    const bearerHeader = req.headers['autorization']
    if (!bearerHeader) {
        return res.status(401).send('Unauthorized request');
    }else{
        let token = bearerHeader.split(' ')[1];
        if (token === 'null'){
            return res.status(401).send('Unauthorized request');
        }
        next();
    }
  
    // let payload = jwt.verify(token, 'secretKey');
    // if(!payload){
    //     return res.status(401).send('Unauthorized request');
    // }
    // req.userId = payload.subject
    
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