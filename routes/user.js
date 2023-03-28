const { response } = require("express");
var express = require("express");
const collections = require("../config/collections");
const variables = require("../config/variables");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
var router = express.Router();


//----------SET-VARIABLE----------//
var user_header = true;
//----------CHECK-USER-LOGIN----------//
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
//----------HOME-PAGE----------//
router.get("/", async function (req, res, next) {
  res.redirect('/home')
});

router.get("/about", async function (req, res, next) {
  res.render('user/about',{user_header,
    userData: req.session.user,})
});

router.get("/explore", async function (req, res, next) {
  res.redirect('/home')
});


router.get("/scores", async function (req, res, next) {
  console.log(req.session.user._id);
  let total_score = await userHelpers.getScore(req.session.user._id)
  total_score = total_score[0]

  res.render("user/scores", {
    user_header,
    userData: req.session.user,
    total_score,
  });

});



router.get("/clearScore", async function (req, res, next) {
  let total_score = await userHelpers.clearScore(req.session.user._id)
  total_score = total_score[0]

  res.redirect(`/scores`)

});
//----------HOME-PAGE----------//
router.get('/home', verifyLogin, async (req, res) => {
  userHelpers.AllDonationCatagories().then((response) => {
    if (response.status) {
      console.log(response);
      res.render("user/home", {
        user_header,
        userData: req.session.user,
        response,
      });
    } else {
      res.render("user/home", {
        user_header,
        userData: req.session.user,
        response: false
      });
    }
  })
})
//----------GET-SIGN-UP----------//
router.get("/signup", (req, res) => {
  res.render("user/signup", { user_part: true });
});
//----------POST-SIGN-UP----------//
router.post("/signup", (req, res) => {
  console.log(req.body);
  userHelpers.doSignup(req.body).then((response) => {
    if (response.login) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      res.render("user/signup", { EmailError: 'Email is already registered', user_part: true });
    }
  })
});
//----------GET-LOGIN----------//
router.get('/login', (req, res) => {
  res.render('user/login', {
    MESSAGE: req.session.MESSAGE,
    user_part: true
  })
  req.session.MESSAGE = null
  EmailError = req.session.EmailError = null
})
//----------POST-LOGIN----------//
router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.MESSAGE = {
        message: response.message,
        status: false,
      }
      res.redirect('/login')
    }
  });

});
//----------LOG-OUT----------//
router.get("/logout", (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = null;
  res.redirect("/login");
});
//----------GET-SUBCATEGORIES----------//
router.get('/getCollection/:url_end/:id', (req, res) => {
  req.session.ID_STORE = req.params.id
  req.session.URL_END_STORE = req.params.url_end 

    if(req.params.url_end==='donation'){

      userHelpers.getCollectionForUpdateOne(req.params.id,collections.DONATION_CATEGORY_COLLECTION).then((response)=>{
        console.log(response,'resss');
        res.render('user/donationFpage', {
      user_header,
      id: req.params.id,
      response,
      userData: req.session.user,})
    })
    
  }

    if(req.params.url_end==='orphanage'){
      userHelpers.getCollectionForUpdateOne(req.params.id,collections.CATEGORY_COLLECTION).then((response)=>{
        console.log(response,'resss');
        res.render('user/orphanage', {
            user_header,
            // id: req.params.id,
            response,
            userData: req.session.user,})
        })
      }
  // // //   //     
  // // userHelpers.getCollectionForUpdateOne(req.params.id).then((response)=>{
  // //   console.log(response,'response');
  // })
  console.log(req.params.id);
  console.log(req.body.donationCollectionID);// })
  console.log(req.params.url_end);
})
// -----------
router.get('/donationForm', verifyLogin, (req, res) => {
  res.render('user/donationForm', {
    user_header,
    userData: req.session.user,
    MESSAGE:req.session.MESSAGE
  })
  req.session.MESSAGE = null
})

router.post('/donationForm', verifyLogin, (req, res) => {
  userHelpers.addUsersDonation(req.session.user._id,req.body).then((response)=>{
    req.session.MESSAGE = {
      message:'inserted',
      status:true
    }
      res.redirect('/donationForm')
  })
})

router.get('/orphanages/', verifyLogin, (req, res) => {
  userHelpers.getOrphanages().then((response) => {
    console.log(response);
    res.render('user/viewOrphanage', {
        user_header,
        response,
        userData: req.session.user,
        MESSAGE: req.session.MESSAGE,
      })
    //   if (response.typeOfQst === 'mcq_type') {
    // } else if (response.typeOfQst === 'true_or_false_type') {
    //   res.render('user/viewQstnForOne', {
    //     user_header,
    //     value: response,
    //     userData: req.session.user,
    //     MESSAGE: req.session.MESSAGE,
    //     TRUE_FALSE: true,
    //   })
    // }
    // if (response.typeOfQst === 'type_question_type') {
    //   res.render('user/viewQstnForOne', {
    //     user_header,
    //     value: response,
    //     userData: req.session.user,
    //     MESSAGE: req.session.MESSAGE,
    //     TYPE_QUESTION: true,
      // })
    // }
    // req.session.MESSAGE = null
  })
})



router.get('/addimage', verifyLogin, (req, res) => {
  res.render('user/viewimgpage', {
    user_header,
    // response,
    MESSAGE:req.session.MESSAGE,
    userData: req.session.user,
    // MESSAGE: req.session.MESSAGE,
  })
  req.session.MESSAGE = null
})

router.post('/uploadimage', verifyLogin, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  userHelpers.addImageAndAddress(req.body).then((response)=>{
    console.log(response);
    if(req.files.image){
      req.files.image.mv('public/user_images/'+response+'.jpg')
    }
    req.session.MESSAGE = {
      message:'inserted',
      status:true
    }
    res.redirect(`/addimage`)
  })
})


// //----------post-anser----------//
// router.post('/question_answer', verifyLogin, (req, res) => {
//   userHelpers.getQuestionForAttenOne(req.body._id).then((response) => {
//     if (response.typeOfQst === 'mcq_type') {
//       let answer = response.answer
//       if (response[answer] === req.body.__answer_select_user) {
//         let score = 1
//         userHelpers.addAnswerCollectionForUsers(req.session.user._id, score, req.body._id).then((response) => {
//           req.session.MESSAGE = {
//             message: 'Correct',
//             status: true
//           }
//           res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//         }).catch(() => {
//           req.session.MESSAGE = {
//             message: 'Error',
//             status: false
//           }
//           res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//         })
//       } else {
//         req.session.MESSAGE = {
//           message: 'Wrong answer',
//           status: false
//         }
//         res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//       }
//     } else if (response.typeOfQst === 'true_or_false_type') {
//       if (response.answer === req.body.__answer_select_user) {
//         let score = 1
//         userHelpers.addAnswerCollectionForUsers(req.session.user._id, score, req.body._id).then(() => {
//           req.session.MESSAGE = {
//             message: 'Correct',
//             status: true
//           }
//           res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//         }).catch(() => {
//           req.session.MESSAGE = {
//             message: 'Error',
//             status: false
//           }
//           res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//         })
//       } else {
//         req.session.MESSAGE = {
//           message: 'Wrong answer',
//           status: false
//         }
//         res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//       }
//     } else if (response.typeOfQst === 'type_question_type') {
//       userHelpers.addAnswerCollectionForUsers(req.session.user._id, score = 0, req.body._id, type_answe = true, req.body.__answer_select_user, response.typeOfQst).then(() => {
//         req.session.MESSAGE = {
//           message: 'Submited ',
//           status: true
//         }
//         res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//       }).catch(() => {
//         req.session.MESSAGE = {
//           message: 'Error ',
//           status: false
//         }
//         res.redirect(`/viewQuestion/${req.session.TEMPORARY_VALUE_ONE}`);
//       })
//     }
//   })
// })
module.exports = router;
