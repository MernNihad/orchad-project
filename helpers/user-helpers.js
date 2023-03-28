var db = require("../config/connection");
var collection = require("../config/collections");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response, request } = require("express");
const { PRODUCT_COLLECTION } = require("../config/collections");
const variables = require("../config/variables");
const collections = require("../config/collections");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;
      let objData = {
        name: userData.name,
        email: userData.email,
        date: dateTime,
        password: userData.password,
        address:userData.address,
      }
      db.get().collection(collection.USER_COLLECTION).findOne({ email: objData.email }).then(async (response) => {
        if (response == null) {
          // objData.password = await bcrypt.hash(objData.password, 10);
          db.get().collection(collection.USER_COLLECTION).insertOne(objData).then((data) => {
            let proID = data.insertedId;
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(proID) }).then((user) => {
              response = {
                user: user,
                login: true
              }
              resolve(response);
            });
          });
        } else {
          resolve({ login: false,message:'email available ' })
        }
      })
    });
  },
  doLogin: (userData) => {
    console.log('start server');
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
      if (user) {
        if(user.password===userData.password){
          console.log('email password correct');
          db.get().collection(collections.USER_COLLECTION).findOne({_id:user._id}).then((user)=>{
            console.log(user);
            resolve({status:true,user})
          })
        }else{
          console.log('Password not correct');
        let message = 'Password not correct'
        resolve({ status: false, message });
        }
      } 
      else {
        console.log("Email not found ");
        let message = 'Email not found'
        resolve({ status: false, message });
      }
    });
  },
  getOrphanages: () => {
    
    return new Promise(async (resolve, reject) => {
      let result = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(result)
    })
  },
  getCollectionForUpdateOne: (CateId,collectionName) => {
    return new Promise(async (resolve, reject) => {


      // let result = await 
      console.log(collectionName);
      db.get().collection(`${collectionName}`).findOne({ _id: objectId(CateId) }).then((response)=>{
        resolve(response)
      })
    })
  },

  addUsersDonation: (userID,data) => {
    data.userID=userID
  
    return new Promise(async (resolve, reject) => {

            db.get().collection('user_donation_records').insertOne(data).then((response)=>{
              resolve(true)
            })
    })
  },

  addImageAndAddress: (data) => {
  
    return new Promise(async (resolve, reject) => {

            db.get().collection('user_image_upload_collection').insertOne(data).then((response)=>{
              resolve(response.insertedId)
            })
    })
  },

 // findOne({userID:userID,qstn_id:qstn_id}).then((response)=>{
    //           if(response==null){
    //             db.get().collection(collection.USER_ANSWER_COLLECTION)
    //               resolve({status:true,message:'successfully inserted'})
                // })
    //           }else{
    //             reject({status:false,message:'error'})
    //           }  
    //         })
  // console.log(userID,data);
    // let obj 
    //   if(type_answe==true){
    //     obj =
    //     {
    //       userID,
    //       score,
    //       qstn_id,
    //       typeOfQst,
    //       answer,
    //     }
    //   }else{
        // obj =
        // {
        //   userID,
        //   score,
        //   qstn_id,
        // }
      // }

  
  // getScore: () => {
  //   return new Promise(async (resolve, reject) => {
  //     // db.dummy.aggregate([{$group: {_id:null, sum_val:{$sum:"$price"}}}])

  //     let data = await db.get().collection(collection.USER_ANSWER_COLLECTION).aggregate(
  //       [
  //         {
  //           $group: {
  //             _id:null,
  //              total_score:{$sum:"$score"}
  //           }
  //         }
  //       ]
  //       ).toArray()
  //       // console.log(data);
  //       resolve(data)
     
  //   })
  // },


  // clearScore: (userID) => {
  //   return new Promise(async (resolve, reject) => {
  //     let data = await db.get().collection(collection.USER_ANSWER_COLLECTION).deleteMany({userID:userID})
  //   resolve(true)
  //   })
  // },



  AllDonationCatagories: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.DONATION_CATEGORY_COLLECTION).find().toArray()
      if(data.length>0){
        resolve({status:true,data})
      }else{
        resolve({status:false})
      }
    })
  },
  // getSubCategory: (CateId) => {
  //   return new Promise(async (resolve, reject) => {
  //     let result = await db.get().collection(collection).find({ category: objectId(CateId) }).toArray()
  //     resolve(result)
  //   })
  // },
  
  
  
}


