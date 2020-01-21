'use strict';

// Getting started with Facebook Messaging Platform
// https://developers.facebook.com/docs/messenger-platform/quickstart

 const express = require('express');
 const request = require('superagent');
 const bodyParser = require('body-parser');
const https = require('https');
var schedule = require('node-schedule');

// Variables

let pageToken = "EAAJqIFJPgZBUBAL0Keee3q8WaGuCLg6lwePCqIQmmVYtLxbIHnbnLwgoNJ4JItNybDevMfWGtIePz7Nz7elAOnipTZAocRDdgTVETvmfUv6xIxOo70rViR4BAAatJg8ypLoIzaxoG8dMpztuzbwoE7vOe0TnQqNmZBBhmCvkWqcPbl4SJSV";
const verifyToken = "my_first_messenger_bot";
 const privkey = "/etc/letsencrypt/live/flirtnow.in/privkey.pem";
 const cert = "/etc/letsencrypt/live/flirtnow.in/cert.pem";
 const chain = "/etc/letsencrypt/live/flirtnow.in/chain.pem";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
var AWS = require('aws-sdk');
var request1 = require('request');


AWS.config.update({
  secretAccessKey: "WHz+4tXWR7KPrRBLHUiPTYgRMuE7YnCKX3ueGuDG",
  accessKeyId: "AKIAIBUXACQPSUDFK7MQ",
  region: "ap-south-1"
  });



var s3 = new AWS.S3();

const app = express();

const fs = require('fs');
const axios=require('axios');
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === verifyToken) {
        console.log("Hii");
        return res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook', function (req, res) {
    console.log("webshook recieved");
    var data = req.body;
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      console.log("message recieved");
      pageEntry.messaging.forEach(function(messagingEvent) {
        console.log("The messaging event is", messagingEvent);
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        }else if(messagingEvent.referral){
          recievedAdId(messagingEvent);
        }
        else if(messagingEvent.messaging_referral){
          console.log("messaging_referral recieved");
        }
         else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function recievedAdId(event){
var senderID= event.sender.id;
if(event.referral.ad_id){
  console.log("Ad id type one");
  var AdId= event.referral.ad_id;
}
else{
  console.log("Ad id type two");
var AdId= event.postback.referral.ad_id;
}
var newvalues;
var newvalues1;
console.log("recivied adID", event.referral.ad_id);
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var query = {SENDERID: senderID};
  var dbo= db.db("mydb");
  var dbo1= db.db("mydb");
  dbo1.collection("Users45").find(query).toArray(function(err, result) {
  console.log("Start chat, checking if user exists");
  if (err) throw err;
    if(result[0]!=null){
       newvalues = { $set: {SENDERID: senderID, RECIPIENTID: result[0].RECIPIENTID, GENDER: "MALE", SUBSCRIPTION: result[0].SUBSCRIPTION}};
       newvalues1 = { $set: {SENDERID: senderID, RECIPIENTID: result[0].RECIPIENTID, GENDER: "FEMALE",SUBSCRIPTION: result[0].SUBSCRIPTION } };
       if(AdId=="23843135525450281"){
        dbo.collection("Users45").updateOne(query, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
        //db.close();
        });
    }
    else if(AdId=="23843144767780281"){
        dbo.collection("Users45").updateOne(query, newvalues1, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
        //db.close();
        });
    }
    else
    console.log("Unknown Ad Id");
    console.log(AdId);
 }
 else
 {
 var myobj = {  SENDERID: senderID, RECIPIENTID: "new user", GENDER: "MALE", SUBSCRIPTION: "UNSUBSCRIBED"};
 var myobj1 = {  SENDERID: senderID, RECIPIENTID: "new user", GENDER: "FEMALE", SUBSCRIPTION: "SUBSCRIBED"};
 if(AdId=="23843135525450281"){

 dbo.collection("Users45").insertOne(myobj, function(err, res) {
  if (err) throw err;
  console.log("1 document updated1");
  //db.close();
  });
}
else if(AdId=="23843144767780281"){
  dbo.collection("Users45").insertOne(myobj1, function(err, res) {
    if (err) throw err;
    console.log("1 document updated1");
    //db.close();
    });
}
console.log("unknown adID");
}
});
});
}





var unix = Math.round(+new Date()/1000);
axios.get("/v1beta1/projects/abc/databases/123/indexes HTTP/1.1", {headers: {
  "alg": "RS256",
  "typ": "JWT",
  "kid": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8pZa2rH7m+F2r\nJINvtz4TKqtKJOKUbOoPC2zerbniY83rHnGDNnqfJ+quAp+yBWxJ01YING5OMfns\nZgt4iqr7Z22RaoR2gYCbgkpy7iFEwl1w3wgULc7oBTBNI20fCGgtIMRfMXPbHNLu\n0JfR97VZTlWKdwWa35gEHXC1GHPaQwu9tBNJoDulHi+/IzLbP5jQS5sANIaYwWlh\nV1kAG+kEVmthqEoW/NkDuyoK2e2sPed9ZA9nnT1gJ23/BKnWmfCXczvbqGScRfgJ\nZ2BxTQFx53v6z6Hq8KFU/50bKtiqJamyANjI614NKHgR4Ehi4NV9+z6hvqJnfn/h\nlmfm22/1AgMBAAECggEAAyU8rdeS9x1xjGK7uU9kHtQxjncuevyU64LMgisB5DM3\nUgIMMPylz0UOXe/nw0NhYpq+Pr1HEJE3QliSPOSNBMuc8VWGF2bB4vXpcWCkl92o\nyrLBUvrPjiFWBJdAYMnWWNhIxfCQZrkkkDxUp7jaYn6SoRAqfQJY6cqm4DIj7mHz\n+jImX3/2oJoejtjI7q3E7E//XLHny+PVuCmIgA9qQ9GR85S5lb9ymNS1PFJcP+H2\nZmgyCPXu7h3cS2ZsqRi4ifTjymhpd87z6IpwEzDtcbaebsRu/zcfqYvyp2Lea6DC\nDg9eqJfmNYzLF4raBX35n46sllTTc19fx0bef4mLuQKBgQDeQf3LN7Jsz0ohAh8X\n1q8MmthV4bYvdg38FWdeL0gNoJuBuuSCb4GE7XSETn13M/ZHeC23xn/LnXKg4H1D\nJt5nSQrxirkYBrYWLErG7ton8ldhegTBrJLzZitdnHwhWFmK+/SCgSPSiyd14DGy\nmBgVVY7wfxPmQP7dmxXTqdRXPQKBgQDZSVBber6/iKL/sb/PAVrRLrvLbbtPvs/d\ng2aKou4i55rfEuXx1FZKl6OyNCshyErWsdkOrQL/TqyBY3hzvf4JpTi73jYjAgxY\nwgfl6Q8TroT//5+ITGTadpBDKjjsQ/36FxzcSs+7bZ8qwvGDYT7p2cFe03HqqlE2\neafuR3FHGQKBgQCiuRIFbPvXKlUNoa3+GBIFWoE1L5HhYb+PZmRN0rQgNgxkiN6w\nmM7s8aUzEPxO/946KUTfnhcGjnnUS0eqmJSQbivy+CvX6WH7DeaZi1pxkL5lAZ7l\n5WGZjp4FZYKEL1kvppQ30DDX/0WeycvZA/3t8Lw8W+3H0KJIwTjTxS1PyQKBgHka\nupXyCMSZ9DdNK5nFqId0Y6jTRRYCRLqylQFqJA4CRjhUwSKS9XFnqQ4Ws3+FseiN\ngWwDk+sWP2FyPl1MJH3dv4w+IrBKYPVLV7mVtxiCKZDBOXpvEbsNYAR/UPCmSLUO\nEsDZVYSiaZccxh0yoy0VeAhRE2n2eYNCNQ3CdelpAoGANEtag+e2r3OBep7YkuBf\nNtvgUUY8hv1GZIqL8CBtaz9MbQFeGsR+aSNFs3cWD1UAbej7MXgu1NJBKz/25UM6\n81IcS3q9kal6qKknorHAHr68SdTFeqmLO1NtVOhGbIszVm3qO2QC2C8MrHoaDO1T\napmQLMlMhYHyToqS/n2OoQY=\n-----END PRIVATE KEY-----\n",
 "iss": "arjun-184@steam-lock-227416.iam.gserviceaccount.com",
  "sub": "arjun-184@steam-lock-227416.iam.gserviceaccount.com",
  "aud": "https://nbupayments.googleapis.com/v1/merchantPayments",
  "iat": unix,
  "exp": unix
}
  } )
        .then(function(response) {
        console.log("Payment authorization", response);
      //    console.log(response.data);
      //    console.log(response.status);
      //     console.log(response.statusText);
      //    console.log(response.headers);
      //     console.log(response.config);

      sendTextMessage(result[0].RECIPIENTID, `${response.data.first_name}:${messageText}`);

      }).catch(function(error) {
        console.log("Payment authorization", error)
    });


app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

function parseURLParams(url) {
  var queryStart = url.indexOf("?") + 1,
      queryEnd   = url.indexOf("#") + 1 || url.length + 1,
      query = url.slice(queryStart, queryEnd - 1),
      pairs = query.replace(/\+/g, " ").split("&"),
      parms = {}, i, n, v, nv;

  if (query === url || query === "") return;

  for (i = 0; i < pairs.length; i++) {
      nv = pairs[i].split("=", 2);
      n = decodeURIComponent(nv[0]);
      v = decodeURIComponent(nv[1]);

      if (!parms.hasOwnProperty(n)) parms[n] = [];
      parms[n].push(nv.length === 2 ? v : null);
  }
  return parms;
}


//creating database
try{
MongoClient.connect(url,  function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
}
catch(e){

  setTimeout(function(){
MongoClient.connect(url,  function(err, db) {
  if (err) throw err;
  console.log("Database created on error!");
  db.close();
});
  },5000);

}


//creating collection
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("Users45", function(err, res) {
  if (err) throw err;
  console.log("Collection created!");
  db.close();
  });
});

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   dbo.createCollection("Female", function(err, res) {
//   if (err) throw err;
//   console.log("Collection created!");
//   db.close();
//   });
// });



MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("Users45").ensureIndex( { SENDERID: 1 }, { unique:true, dropDups:true } );
});

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   dbo.collection("Female").ensureIndex( { record_id: "5bb4ebae29d7e5167af53307" }, { unique:true, dropDups:true } );
// });

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var query1 = {SENDERID: "to be assigned"};
//     dbo.collection("Users10").find(query1).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     var count = 0;
//     var i;
//     //console.log("heyyy");
//     for (i in result) {
//     if (result.hasOwnProperty(i)) {
//         count++;
//     }
//     }

//     for(i=0;i<count;i++){
//       sendTextMessage(result[i],"");
//     }
//   });
// });


//  MongoClient.connect(url, function(err, db) {
//    var i;
//     if (err) throw err;
//     var dbo = db.db("mydb");
//     // var query1 = {SENDERID: "to be assigned"};
//     dbo.collection("Users10").find().toArray(function(err, result) {
//           if (err) throw err;
//           console.log(result);
//           var count = 0;
//           for (i in result) {
//                 if (result.hasOwnProperty(i)) {
//                     count++;
//                 }
//                 }
//       for(i=0;i<count;i++){
//         console.log(result[i].SENDERID);
//      sendTextMessage(result[i].SENDERID,"Hi, Thanks a lot for the patience. We are live again with much better performance. Type 'start chat' to start chatting again!!")
//       }
//   });
// });
/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.


 *
 */

//  function filterActiveUsers(){

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("mydb");
//   var query = {RECIPIENTID:"to be assigned"};

//   dbo.collection("Users10").find(query).toArray(function(err, result) {
//     console.log("i am here now");
//     if (err) throw err;
//   });
// });

//  }

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var query1 = {SENDERID: "2416060005106562"};
  var query2 = {SENDERID: "1949861935133015"};
  var query3 = {SENDERID: "2499132870103602"};
  var query4 = {SENDERID: "1930123073765581"};

  var datetime = new Date();


  var newvalues1 = { $set: {SENDERID: "2416060005106562",RECIPIENTID:"do not assign",  GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5} };
  var newvalues2 = { $set: {SENDERID: "1949861935133015", RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5} };
  var newvalues3 = { $set: {SENDERID: "2499132870103602",RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5} };
  var newvalues4 = { $set: {SENDERID: "1930123073765581",RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5} };
  var myobj = {SENDERID: "2416060005106562",RECIPIENTID:"do not assign",  GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5};
  var myobj1 = {SENDERID: "1949861935133015",RECIPIENTID:"do not assign",  GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5};
  var myobj2 = {SENDERID: "2499132870103602",RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5};
  var myobj3 = { SENDERID: "1930123073765581",RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED", TOS: 5};
  dbo.collection("Users45").find(query1).toArray(function(err, result) {
    console.log("Start chat, checking if user exists");
    if (err) throw err;
    if(result[0]!=null){
      dbo.collection("Users45").updateOne(query1, newvalues1, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
          });
    }
    else
    dbo.collection("Users45").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document updated1");
        });

  });
  dbo.collection("Users45").find(query2).toArray(function(err, result) {
    console.log("Start chat, checking if user exists");
    if (err) throw err;
    if(result[0]!=null){
      dbo.collection("Users45").updateOne(query2, newvalues2, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
          });
    }
    else
    dbo.collection("Users45").insertOne(myobj1, function(err, res) {
      if (err) throw err;
      console.log("1 document updated1");
        });

  });

  dbo.collection("Users45").find(query3).toArray(function(err, result) {
    console.log("Start chat, checking if user exists");
    if (err) throw err;
    if(result[0]!=null){
      dbo.collection("Users45").updateOne(query3, newvalues3, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
          });
    }
    else
    dbo.collection("Users45").insertOne(myobj2, function(err, res) {
      if (err) throw err;
      console.log("1 document updated1");
        });

  });
  dbo.collection("Users45").find(query4).toArray(function(err, result) {
    console.log("Start chat, checking if user exists");
    if (err) throw err;
    if(result[0]!=null){
      dbo.collection("Users45").updateOne(query4, newvalues4, function(err, res) {
        if (err) throw err;
        console.log("1 document updated1");
          });
    }
    else
    dbo.collection("Users45").insertOne(myobj3, function(err, res) {
      if (err) throw err;
      console.log("1 document updated1");
        });

  });

 });



function receivedMessage(event) {
var message = event.message;
var interval;
// try{
// var AdId= event.postback.referral.ad_id;
// console.log(event.postback.referral);
// }
// catch(e){
//   console.log(e);
// }
// console.log(AdId);




//   if ( message.is_echo) {
//     return;
// }
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;

  var messageText;

  console.log("messaging_referral:", event)

  //console.log(event);

  console.log("Received message for user %d and page %d at %d with message:",
  senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  //var isEcho = message.is_echo;
  //var messageId = message.mid;
  //var appId = message.app_id;
  //var metadata = message.metadata;

  // You may get a text or attachment but not both

//updateProfilePic(senderID);
// if(AdId=="x"){
// gender= "MALE";
// }
// else if(AdId=="y"){
// gender= "FEMALE";
// }



// axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=EAADoQika69kBAE2KIv5V0x09uLcJKEnnCHbUUsRmYAEeQeQgzvfC9B5xiqi8NfqumQw7tzX8RxE3EBwxMWjGTW75yKlwDW4nZB5z78B1EJxAe69JB8xJy4YO1sqwob4lHl3IlejBkBhro2DWkPKMs625dI5UF4elwyuhSEAZDZD`)
// .then(function(response) {
// console.log("api called");
// console.log(response.data);
// //     console.log(response.status);
// //     console.log(response.statusText);
// //    console.log(response.headers);
// //     console.log(response.config);


// setTimeout(function(){

//   put_from_url(response.data.profile_pic, 'profilepicturesfacebook',`${senderID}.png`, function(err, res) {
//     if (err)
//         throw err;
//         console.log('Uploaded data successfully!' + senderID);
//       });
//   }).catch(function(error) {
//     handleError(error, res);
//   });

//   console.log('test');
// }, 0);





if(message){
  messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;
}
else
  {
  messageText = event.postback.title;
  }


  //if (isEcho) {
    // Just logging message echoes to console
    //console.log("Received echo for message %s and app %d with metadata %s",
      //messageId, appId, metadata);
    //return;
  //} else if (quickReply) {
    //var quickReplyPayload = quickReply.payload;
    //console.log("Quick reply for message %s with payload %s",
      //messageId, quickReplyPayload);

    //sendTextMessage(senderID, "Quick reply tapped");
    //return;
  //}

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
    case 'start chat':
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var dbo1=db.db("mydb");
      var dbo2=db.db("mydb");
      var dbo3=db.db("mydb");
      var dbo4=db.db("mydb");
      var query1 = {SENDERID: senderID};
      dbo.collection("Users45").find(query1).toArray(function(err, result) {
      console.log("Start chat, checking if user exists");
      if (err) throw err;
      console.log("Start chat user", result);
      if (result[0]!=null){
          var recipientID= result[0].RECIPIENTID;
      if(recipientID=="to be assigned"||recipientID=="do not assign"||recipientID=="new user"||recipientID=="bot assigned"){

          sendButtonMessage4(senderID);
      var newvalues = {$set:{ SENDERID: senderID, RECIPIENTID: "to be assigned"}};
      dbo2.collection("Users45").updateOne(query1, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });
      checkPartnerAvailable(senderID);
      }
      else
      sendTextMessage(senderID, "You are already chatting with someone. Type 'end chat' to end current chat and then type 'start chat'.")
    }
    else
    {
  //   axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
    //     .then(function(response) {
    //     console.log("name api called");

    //   sendTextMessage(result[0].RECIPIENTID, `${response.data.first_name}:${messageText}`);

    //   }).catch(function(error) {
    //     handleError(error, res);
    //     sendTextMessage(result[0].RECIPIENTID,messageText)
    // });
//checkImageStatus(senderID);

sendButtonMessage20(senderID);


setTimeout(function(){
sendButtonMessage4(senderID);
  },1500);



      var myobj = { SENDERID: senderID, RECIPIENTID: "to be assigned"  };
      dbo3.collection("Users45").insertOne( myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
       checkPartnerAvailable(senderID);
    }
  });
  });
     break;

      case 'end chat':
      myStopFunction(interval);
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var dbo1 = db.db("mydb");
      var dbo2 = db.db("mydb");
      var dbo3 = db.db("mydb");
      var query = { SENDERID: senderID };
      sendQuickReplyMessage(senderID, "Your chat has ended. Type 'start chat' to chat with someone!", [
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },
      ]);
        dbo.collection("Users45").find(query).toArray(function(err, result) {
        console.log("End chat DB call");
        if (err) throw err;
        if(result[0]!=null){
        var query1={SENDERID: result[0].RECIPIENTID};
        var newvalues = { $set: {SENDERID: senderID, RECIPIENTID: "do not assign"} };
        dbo3.collection("Users45").updateOne(query, newvalues, function(err, res) {
        if (err) throw err;
        });
       // console.log(result);
        if(result[0].RECIPIENTID!="to be assigned"&&result[0].RECIPIENTID!="new user"){
        sendQuickReplyMessage(result[0].RECIPIENTID, "Your partner has disconnected. Type 'start chat' to chat with someone!", [
        {
              "content_type":"text",
              "title":"Start chat",
              "payload":"Start chat"
            },
          ]);

          dbo1.collection("Users45").find(query1).toArray(function(err, result1) {
            console.log("End chat DB call");
            if(result1[0]!=null){
            var newvalues1 = { $set: {SENDERID: result[0].RECIPIENTID, RECIPIENTID: "do not assign"} };
            if (err) throw err;
          dbo2.collection("Users45").updateOne(query1, newvalues1, function(err, res) {
            if (err) throw err;
           });
          }
          });
        }
      }
      else{

      //  checkImageStatus(senderID);

         sendButtonMessage20(senderID);

      setTimeout(function(){
      sendQuickReplyMessage(senderID, "Welcome to Hii! Click 'start chat' to chat with someone. Type 'end chat' to end current chat. Have fun chatting!", [
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },]);  },1500);
      }
        });
      });



     break;

    case  'command':
    case  'menu':
    case  'commands':
    sendTextMessage(senderID, "start chat-Finds somebody with whom you can chat with.\nend chat- Ends your chat.");


     break;

     case  'info':
     sendTextMessage(senderID, "Hii is a dating chatbot that helps you find someone to chat with based on . Casual or long term relationships, this is the place for you. Type 'start chat' to chat with someone!");

     break;

     case  'help':
     sendTextMessage(senderID, "Hii is a dating chatbot that helps you find someone to chat with based on. Casual or long term relationships, this is the place for you. Type 'start chat' to chat with someone!");
     break;

     case  'more':
     sendTextMessage(senderID, "Hii is a dating chatbot that helps you find someone to chat with based on gender, location and interests. Casual or long term relationships, this is the place for you. Type 'start chat' to chat with someone!");
     break;
     case 'subscribe':
     MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var query = { SENDERID: senderID };
      dbo.collection("Users45").find(query).toArray(function(err, result) {
      if (err) throw err;
        console.log(result);
      try{
        var gen= result[0].GENDER;
      }
      catch(e){
        var gen= null;
      }
    if(gen=="MALE"){

       setTimeout(function(){sendButtonMessage1(senderID)},3000);
      sendButtonMessage19(senderID);
    }
      else
      sendTextMessage(senderID, "You are already subscribed. Type 'start chat' to chat with someone!");
    });
  });
     break;
     case "male":
     MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var query = { SENDERID: senderID };

      sendQuickReplyMessage(senderID, "Your gender has been saved.Type 'start chat to chat with someone!" ,[
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },
      ]);
     var newvalues = { $set: {SENDERID: senderID, RECIPIENTID: "do not assign", GENDER: "MALE", SUBSCRIPTION: "UNSUBSCRIBED",TOS: "null"} };
     dbo.collection("Users45").updateOne(query, newvalues, function(err, res) {
     if (err) throw err;
     });
    });
      break;
      case "female":
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var query = { SENDERID: senderID };
      //checkImageStatus1(senderID);
      sendQuickReplyMessage(senderID, "Your gender has been saved.Type 'start chat to chat with someone!" ,[
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },
      ]);
      var newvalues = { $set: {SENDERID: senderID, RECIPIENTID: "do not assign", GENDER: "FEMALE", SUBSCRIPTION: "SUBSCRIBED", TOS: "null"} };
      dbo.collection("Users45").updateOne(query, newvalues, function(err, res) {
      if (err) throw err;
      });
    });
    break;
    case "show more":
     setTimeout(function(){sendButtonMessage1(senderID)},3000);
      sendButtonMessage19(senderID);
    break;
      default:
      console.log("default message recieved");
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");

      var query = { SENDERID: senderID };
      var myobj = { SENDERID: senderID, RECIPIENTID: "new user"};
      dbo.collection("Users45").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      //db.close();

      if(result[0]!=null){
        console.log(result[0].RECIPIENTID);
      if(result[0].RECIPIENTID=="to be assigned"){

        sendTextMessage(senderID, "Please wait we are connecting you to someone.")
  }
      else if (result[0].RECIPIENTID=="do not assign") {

      sendQuickReplyMessage(senderID, "Type 'start chat' to chat with someone" ,[
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },]);

      }

      else if (result[0].RECIPIENTID=="new user"){

        sendQuickReplyMessage(senderID, "Type 'start chat' to chat with someone!", [
          {
            "content_type":"text",
            "title":"Start chat",
            "payload":"Start chat"
          },])
      }

      else if (result[0].RECIPIENTID=="bot assigned"){
       console.log("mESSAGE RECIEVED")
      }
      else
      console.log("sending message to connected partner");
    //   axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
    //     .then(function(response) {
    //     console.log("name api called");

    //   sendTextMessage(result[0].RECIPIENTID, `${response.data.first_name}:${messageText}`);

    //   }).catch(function(error) {
    //     handleError(error, res);
    //     sendTextMessage(result[0].RECIPIENTID,messageText)
    // });
      sendTextMessage(result[0].RECIPIENTID,messageText)
       }

      else
      {
     //checkImageStatus(senderID);
      dbo.collection("Users45").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted newuser");
    //db.close();
      });
      //checkImageStatus(senderID);
      sendButtonMessage20(senderID);

      setTimeout(function(){
      sendQuickReplyMessage(senderID, "Welcome to Hii! Click 'start chat' to chat with someone. Type 'end chat' to end current chat. Have fun chatting!", [
        {
          "content_type":"text",
          "title":"Start chat",
          "payload":"Start chat"
        },]);  },1500);


    }

    });

    });
    }
  } else if (messageAttachments) {
  console.log(messageAttachments);
  console.log(messageAttachments[0].type);
  console.log(messageAttachments[0].payload.url);
  recievedAttachment(senderID, messageAttachments);
  }

  }




//schedule.scheduleJob('0 0 * * *', () => { checkSubscription() })


var j = schedule.scheduleJob('0 0 * * *', checkSubscription());

  // var interval1;
  // interval1 = setInterval(function(){checkSubscription()},300000);

function checkSubscription(){
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
     var query = {GENDER: "MALE", SUBSCRIPTION: "SUBSCRIBED"};

      var dbo = db.db("mydb");
        dbo.collection("Users45").find(query).toArray(function(err, result) {
        console.log("The subscribed users are",result[0], result[1], result[2], result.length, result);
        var i=0;
        var datetime = new Date();
        try{
        for(i=0;i<result.length;i++){
          if((result[i].TOS+5)==datetime.getDate()||(result[i].TOS+5)==0){
            var query1 = {SENDERID: result[i].SENDERID};
              var newvalues = { $set: {SENDERID: result[i].SENDERID, RECIPIENTID:"do not assign", GENDER: "MALE", SUBSCRIPTION: "UNSUBSCRIBED", TOS: "null"} };
           dbo.collection("Users45").updateOne(query1, newvalues, function(err, res) {
           if (err) throw err;
           console.log("1 document updated1");
           //db.close();
           });



           // setTimeout(function(){sendTextMessage(2068226386638501, "Your subscription is over. Please subscribe again.")},2000);

          // sendTextMessage(result[i].SENDERID, "Your subscription is over. Please subscribe again.")
          }
          else{
            console.log("Immmmhere");
            //sendTextMessage(2068226386638501, "Your subscription is over. Please subscribe again.")
             //setTimeout(function(){sendTextMessage(2068226386638501, "Your subscription is over. Please subscribe again.")},2000);
          }
        }
        }
        catch(e){
        console.log("Iamhere", e);
        }
        });
        });
}

function checkPartnerAvailable(senderID){

 // interval = setInterval(function(){findPartner(senderID,gender,interval, subscription)},300);
 findPartner(senderID);
  }
  function findPartner(senderID){
    AssignPartner(senderID);
   // checkSenderStatus(senderID);
  }
  function checkSenderStatus(senderID){
    var query1 = {SENDERID: senderID};
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

      dbo.collection("Users45").find(query1).toArray(function(err, result) {
        console.log(result);
          if(result[0]!=null){
            console.log("senderID query called to check if sender has already been assigned a partner", senderID);
            console.log(result[0].RECIPIENTID);
          if (err) throw err;
          if(result[0].RECIPIENTID!="to be assigned"){
          console.log("stopping the interval");

          }
          else {
            AssignPartner(senderID);
          }
          }
      });
  });
  }
  var m=0;
  function AssignPartner(senderID){
    console.log("Assign partner called")
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
    //   if(gender=="MALE"){
    //   var query = {RECIPIENTID:"to be assigned", GENDER:"FEMALE"};
    //   var dbo1 = db.db("mydb");
    //   dbo1.collection("Users13").find(query).toArray(function(err, result) {
    //     if(result[0]!=null){
    //   console.log("to be assigned query called", senderID);
    //   if (err) throw err;
    //   console.log(gender);
    //   console.log(senderID+ gender);
    //   //console.log("The result of the query is", result);
    //     var count = 0;
    //     var i;
    //     var a2;
    //     //console.log("heyyy");
    //     for (i in result) {
    //     if (result.hasOwnProperty(i)) {
    //         count++;
    //     }
    //     }
    //     var count11=count-1;
    //     console.log("The count is", count, count11);
    //     var random = Math.floor((Math.random() * count11) + 0);
    //     if(result[random].SENDERID!=senderID){
    //     var random1 = Math.floor((Math.random() * 10) + 0);
    //     if(subscription=="UNSUBSCRIBED"){
    //       if(random1>7){
    //         checkRecipientStatus(result[random].SENDERID, interval, senderID, gender, subscription);
    //       }
    //     }
    //     else
    //     {
    //       checkRecipientStatus(result[random].SENDERID, interval, senderID, gender, subscription);
    //     }
    //     }
    // }
    // });
    //   }

          var query=    { RECIPIENTID:"to be assigned"}


         var dbo1 = db.db("mydb");
         dbo1.collection("Users45").find(query).toArray(function(err, result) {
           if(result[0]!=null){
         console.log("to be assigned query called", senderID);
         if (err) throw err;
         //console.log("The result of the query is", result);
           var count = 0;
           var i;
           var a2;
           //console.log("heyyy");
           for (i in result) {
           if (result.hasOwnProperty(i)) {
               count++;
           }
           }
          //console.log( "The id iss", dbo1.findOne(query));

          var count11=count-1;
          if(m>count11){
            m=0;
          }
           console.log("The count is", count, count11);
           var random = Math.floor((Math.random() * count11) + 0);
           if(result[m].SENDERID!=senderID){
             console.log("The result1 is", result);

             console.log("The result is11",result[random].SENDERID, senderID);
            // var a1=new ObjectId(result[count11]._id);
            // console.log("The timestamp is", a1.getTimestamp());

           checkRecipientStatus(result[m].SENDERID, senderID);
           m++
           }
       }
       });

      // else{
      //   var query = {RECIPIENTID:"to be assigned", GENDER: null} ;
      // }
  });
  }


// function checkRecipientStatus(recipientID, interval, senderID, gender, subscription){
//   console.log(recipientID, senderID);
//   var query1 = {SENDERID: recipientID};
//   var gender1;
//   var subscription1;
//   var status=0;
//   MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo3 = db.db("mydb");
//   var i;
//   for(i=0; i<2; i++){
//     console.log("The new value of i is ", i);
//   var dbo = db.db("mydb");
//   dbo.collection("Users12").find(query1).toArray(function(err, result) {
//   console.log("senderID query called to check if recipient has already been assigned a partner", senderID, result);
//   if (err) throw err;
//     if(result[0]!=null){
//       gender1=result[0].GENDER;
//       subscription1= result[0].SUBSCRIPTION;
//     if(result[0].RECIPIENTID!="to be assigned"){
//       status=0;
//     }
//     else
//     {
//     console.log("The newest status is", status)
//     status=1;
//     }
//   }
//   if(i==2&&status==1){
//     console.log("The value of i is", i)
//     myStopFunction(interval);
//      var newvalues1 = { $set: {SENDERID: senderID, RECIPIENTID: recipientID, GENDER: gender,SUBSCRIPTION: subscription } };
//      var query2 = {SENDERID: senderID};
//      var newvalues2 = { $set: {SENDERID: recipientID, RECIPIENTID: senderID, GENDER: gender1, SUBSCRIPTION:subscription1} };
//      dbo3.collection("Users12").updateOne(query1, newvalues2, function(err, res) {
//      if (err) throw err;
//      console.log("1 document updated for sender", recipientID);
//      //db.close();
//      });
//      dbo3.collection("Users12").updateOne(query2, newvalues1, function(err, res) {
//      if (err) throw err;
//      console.log("1 document updated for recipient", senderID);
//      //db.close();
//      });
//      sendGenericMessage(senderID, recipientID);
//      sendGenericMessage(recipientID, senderID);
//     }
//   });
//   console.log("The latest value of i and status is", i, status);

// }
// });
// }

function checkRecipientStatus(recipientID, senderID){
  console.log(recipientID, senderID);
  var query1 = {SENDERID: recipientID};
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo3 = db.db("mydb");
   var dbo = db.db("mydb");
  //   dbo.collection("Users43").find(query1).toArray(function(err, result) {
  //     console.log("senderID query called to check if recipient has already been assigned a partner", senderID, result);
  //     if (err) throw err;
  //       if(result[0]!=null){
  //           if(result[0].RECIPIENTID=="to be assigned"){
                var newvalues2 = { $set: {SENDERID: recipientID, RECIPIENTID: senderID } };
                var newvalues1 = { $set: {SENDERID: senderID, RECIPIENTID: recipientID} };

              var query2 = {SENDERID: senderID};

              dbo3.collection("Users45").updateOne(query1, newvalues2, {upsert: true}, function(err, res) {
                        if (err) throw err;
                        console.log("1 document updated for sender", recipientID);
                        //db.close();
                        });
                        dbo3.collection("Users45").updateOne(query2, newvalues1,{upsert: true}, function(err, res) {
                        if (err) throw err;
                        console.log("1 document updated for recipient", senderID);
                        //db.close();
                });
                  // sendGenericMessage(senderID, recipientID);
                  // sendGenericMessage(recipientID, senderID);
            sendTextMessage(senderID,"You are now chatting with someone. Say hi!");
            sendTextMessage(recipientID,"You are now chatting with someone. Say hi!");
     //        }



     //  }
     // });


});
}



function put_from_url(url, bucket, key, callback) {
  request1({
      url: url,
      encoding: null
  }, function(err, res, body) {
      if (err)
          return callback(err, res);

      s3.putObject({
          Bucket: bucket,
          Key: key,
          ContentType: res.headers['content-type'],
          ContentLength: res.headers['content-length'],
          Body: body // buffer
      }, callback);
  })
}



function updateProfilePic(senderID){
  console.log("checking profile pic");
  axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
  .then(function(response) {
  console.log("api called");
  console.log(response.data);
  //     console.log(response.status);
  //     console.log(response.statusText);
  //    console.log(response.headers);
  //     console.log(response.config);
  put_from_url(response.data.profile_pic, 'profilepicturesfacebook',`${senderID}.png`, function(err, res) {
    if (err)
        throw err;
        console.log('Uploaded data successfully!' + senderID);
      });
}).catch(function(error) {
    handleError(error, res);
});
}


  function recievedAttachment(senderID,messageAttachments){

    console.log("Recieved Attachment")
    //   MongoClient.connect(url, function(err, db) {
    //   if (err) throw err;
    //   var dbo = db.db("mydb");

    //   var query = { SENDERID: senderID };
    //   var myobj = { SENDERID: senderID, RECIPIENTID: "new user"};
    //   dbo.collection("Users40").find(query).toArray(function(err, result) {
    //   if (err) throw err;
    //   console.log(result);
    //   //db.close();

    //   if(result[0]!=null){

    //   if(result[0].RECIPIENTID=="to be assigned"){
    //   sendTextMessage(senderID, "Please wait we are connecting you to a partner");

    //   }
    //   else if (result[0].RECIPIENTID=="do not assign") {

    //     sendQuickReplyMessage(senderID, "Type 'start chat' to chat with someone!" ,[
    //       {
    //         "content_type":"text",
    //         "title":"Start chat",
    //         "payload":"Start chat"
    //       },]);

    //   }

    //   else if (result[0].RECIPIENTID=="new user"){

    //     sendQuickReplyMessage(senderID, "Type 'start chat' to chat with someone!" ,[
    //       {
    //         "content_type":"text",
    //         "title":"Start chat",
    //         "payload":"Start chat"
    //       },]);

    //   }
    //   else{
    //     console.log("I am here");

    //   //   sendMessage(result[0].RECIPIENTID, {
    //   //     attachment: {
    //   //         type: messageAttachments[0].type,
    //   //         payload: {
    //   //                 url: messageAttachments[0].payload.url,
    //   // }
    //   //     }
    //   // });
    //   }

    //    }

    //   else
    //   {
    //   dbo.collection("Users40").insertOne(myobj, function(err, res) {
    //   if (err) throw err;
    //   console.log("1 document inserted");
    // //db.close();
    //   });

    //    sendQuickReplyMessage(senderID, "Type 'start chat' to chat with someone!" ,[
    //     {
    //       "content_type":"text",
    //       "title":"Start chat",
    //       "payload":"Start chat"
    //     },]);

    // }

    // });

    // });


  }

function myStopFunction(interval) {
      console.log("myStopFunction called");
      clearInterval(interval);
     }

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      // console.log("Received delivery confirmation for message ID: %s",
      //   messageID);
    });
  }

  //console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  receivedMessage(event);
  try{
  if(event.postback.referral.ad_id){
   console.log("Thee ad id is", event.postback.referral.ad_id);
   var newvalues;
   var newvalues1;
   console.log("recivied adIDD", event.referral.ad_id);
     MongoClient.connect(url, function(err, db) {
     if (err) throw err;
     var query = {SENDERID: senderID};
     var dbo= db.db("mydb");
     var dbo1= db.db("mydb");
     dbo1.collection("Users45").find(query).toArray(function(err, result) {
     console.log("Start chat, checking if user exists");
     if (err) throw err;
       if(result[0]!=null){
          newvalues = { $set: {SENDERID: senderID, RECIPIENTID: result[0].RECIPIENTID, GENDER: "MALE", SUBSCRIPTION: result[0].SUBSCRIPTION, TOS: result[0].TOS}};
          newvalues1 = { $set: {SENDERID: senderID, RECIPIENTID: result[0].RECIPIENTID, GENDER: "FEMALE",SUBSCRIPTION: result[0].SUBSCRIPTION, TOS: result[0].TOS } };
          if(AdId=="23843135525450281"){
           dbo.collection("Users45").updateOne(query, newvalues, function(err, res) {
           if (err) throw err;
           console.log("1 document updated1");
           //db.close();
           });
       }
       else if(AdId=="23843144767780281"){
           dbo.collection("Users45").updateOne(query, newvalues1, function(err, res) {
           if (err) throw err;
           console.log("1 document updated1");
           //db.close();
           });
       }
       else
       console.log("Unknown Ad Id");
       console.log(AdId);
    }
    else
    {
    var myobj = {  SENDERID: senderID, RECIPIENTID: "new user", GENDER: "MALE", SUBSCRIPTION: "UNSUBSCRIBED"};
    var myobj1 = {  SENDERID: senderID, RECIPIENTID: "new user", GENDER: "FEMALE", SUBSCRIPTION: "SUBSCRIBED"};
    if(AdId=="23843135525450281"){

    dbo.collection("Users45").insertOne(myobj, function(err, res) {
     if (err) throw err;
     console.log("1 document updated1");
     //db.close();
     });
   }
   else if(AdId=="23843144767780281"){
     dbo.collection("Users45").insertOne(myobj1, function(err, res) {
       if (err) throw err;
       console.log("1 document updated1");
       //db.close();
       });
   }
   console.log("unknown adID");
   }
   });
   });
  }
  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  }
  catch(e){
  console.log(e);
  }
  //sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * If users came here through testdrive, they need to configure the server URL
 * in default.json before they can access local resources likes images/videos.
 */
function requiresServerURL(next, recipientId, args) {
  if (SERVER_URL === "to_be_set_manually") {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: `
We have static resources like images and videos available to test, but you need to update the code you downloaded earlier to tell us your current server url.
1. Stop your node server by typing ctrl-c
2. Paste the result you got from running "lt —port 5000" into your config/default.json file as the "serverURL".
3. Re-run "node app.js"
Once you've finished these steps, try typing “video” or “image”.
        `
      }
    }

    callSendAPI(messageData);
  } else {
    next.apply(this, recipientId, args);
  }
}

function sendHiMessage(recipientID) {
  console.log("Fuck you");
  var RECIPIENTID1;
  var query1 = {SENDERID: recipientID};
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

  dbo.collection("Users45").find(query1).toArray(function(err, result) {
    console.log("i am here");
    if (err) throw err;
    console.log(result);
    RECIPIENTID1=result[0].RECIPIENTID;
    console.log(RECIPIENTID1);

    axios.get(`https://graph.facebook.com/${RECIPIENTID1}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAFKDuXZAeKeEioMnvTULx7f8HqeMWcPoNsW6HIpZCRumFASvgzMJey9ZA671LZAnLKe5ysLZBSkxb4LmhC53PbilS7woJoL7VK2nnLI2v84To3XWb802cK0z05yVexy9q6Cp8eJdllrqJH1B7CYqj9x0NZBA8ZAMZAJsKVOrImQp`)
      .then(function(response) {
      console.log("api called");
       console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
       console.log(response.headers);
        console.log(response.config);

    sendTextMessage(recipientID, `You're now chatting with with ${response.data.first_name}. Say hi! Type 'end chat' to stop chatting. `);
      sendMessage(recipientID, {
            attachment: {
                type: 'image',
                payload: {
                        url: response.data.profile_pic,
        }
            }
        });
    }).catch(function(error) {
      handleError(error, res);
      sendMessage(recipientID,"You are now chatting with someone. Say hi!")
  });

  });

  });


  }



function sendTextMessage(recipientID, messageText) {
    sendMessage(recipientID, {
      text: messageText
  });
  }
  function sendQuickReplyMessage(recipientID, messageText,quickReplies) {
    console.log("quick reply message");
    sendMessage(recipientID, {
      text: messageText,
      quick_replies: quickReplies
  });
  }

  function sendAttachment(recipientID, type){

    sendMessage(recipientID, {
      attachment: {
          type: 'image',
          payload: {
                  url: response.data.profile_pic,
  }
      }
  });

  }


/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Click 'Pay now' to subscribe for instant chatting within 1-2 seconds at just 30rs!",
        buttons:[{
          type: "web_url",
          // url: `https://dsdsd.co.in:8083/?senderID=${recipientId}`,
          url: `flirtnow.in:8083/?senderID=${recipientId}`,
          title: "Pay now"
        }]
      }
    }
  });
}


function checkImageStatus(senderID){
  console.log("The imagggg is 3", senderID);
  axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic&access_token=EAAJqIFJPgZBUBAM4NB4w1QWEZCecwl5UK0WQ87GZClZCX5Skj62hiV9KQkoRrvBcseledxmYFkQIYJCMiSA6Rjo6osGKqeK1URwaSYqPcrZB7Eu7ZAwk1b3VINn0TKwidTLSU0tNNI6a6ZAUTVAxb4qoj1pzFZCWZCqZBAwQbs0DANloVf0ZAxdPDDF`)
    .then(function(response) {
    console.log("The imagggg is 4", response);

    put_from_url(response.data.profile_pic, 'profilepiccc',`${senderID}.png`, function(err, res) {
      if (err)
        throw err;
          console.log('Image status 1' + senderID);
          detectImage(response.data.profile_pic,senderID, response.data.first_name);
      });

}).catch(function(error) {
console.log("The errorrr iss",error);
});
}

function checkImageStatus1(senderID){
  console.log("The imagggg is 3", senderID);
  axios.get(`https://graph.facebook.com/${senderID}?fields=first_name,last_name,profile_pic,gender&access_token=EAAJqIFJPgZBUBACIjLSeheeWQyKDB6PAKIeYxsJVECzYBfDz5c17TJRnG8gNHBpwvVwlChg9oMSX3x2rIeAoEj377hOHjnpngg6rTt3WCbZAas0IMUDZAtsZBi7yCV2d50SP8jfBn1tsri6aiMORCiWkC7iKFe4Ic377swaagubmK1K2JCZBK`)
    .then(function(response) {
    console.log("The imagggg is 4", response);

      put_from_url(response.data.profile_pic, 'profilepiccc',`${senderID}.png`, function(err, res) {
      if (err)
        throw err;
          console.log('Image status 1' + senderID);
          detectImage(response.data.profile_pic,senderID, response.data.first_name);
      });

   if(response.data.gender!="female"){
   var query = { SENDERID: senderID };
 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
        var newvalues = { $set: {SENDERID: senderID, RECIPIENTID: "do not assign", GENDER: "MALE", SUBSCRIPTION: "UNSUBSCRIBED", TOS: "null"} };
      dbo.collection("Users45").updateOne(query, newvalues, function(err, res) {
      if (err) throw err;
});
});

    }


}).catch(function(error) {
console.log("The errorrr iss",error);
});
}



function detectImage(imageurl,recipientID, name){
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: { /* required */
      //Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
      S3Object: {
        Bucket: 'profilepiccc',
        Name: `${recipientID}.png`,
       // Version: 'STRING_VALUE'
      }
    },
    MinConfidence: 0.0
  };
  // axios.get(`https://graph.facebook.com/${recipientID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
  //     .then(function(response) {
    rekognition.detectModerationLabels(params, function(err, data) {
    console.log("api called");
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);
    console.log("moderation labels", recipientID)
    try{
    console.log(data.ModerationLabels[0].Confidence)
            // successful response
    if(data.ModerationLabels[0].Confidence<40){
      console.log("The image url is", imageurl);
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = { SENDERID: recipientID, PROFILEPIC: imageurl, NAME: name};
          dbo.collection("profilepic11").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted newuser111", res);
        //db.close();
          });
      });
    }
    else
    {

    }
  }
  catch(e)
  {
  console.log(e)

}
});
// }).catch(function(error) {

// });
}




function sendButtonMessage20(recipientId) {
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "By using Hii chatbot you AGREE TO THE FOLLOWING TERMS AND CONDITIONS",
        buttons:[{
          type: "web_url",
          // url: `https://dsdsd.co.in:8083/?senderID=${recipientId}`,
          url: `http://termswebsite11.s3-website.ap-south-1.amazonaws.com`,
          title: "Terms and conditions"
        }]
      }
    }
  });
}


function sendButtonMessage1(recipientId) {
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Subscribe and enjoy INSTANT chatting, DIRECT messaging and PHOTO sharing with 10 REAL girls",
        buttons:[{
          type: "web_url",
          // url: `https://dsdsd.co.in:8083/?senderID=${recipientId}`,
          url: `flirtnow.in:8085/?senderID=${recipientId}`,
          title: "Subscribe"
        }]
      }
    }
  });
}

function sendButtonMessage2(recipientId) {
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Your instant chat subcription has ended. Click subscribe to subscribe to instant chatting to get matched within 2-3 seconds.",
        buttons:[{
          type: "web_url",
          // url: `https://dsdsd.co.in:8083/?senderID=${recipientId}`,
          url: `flirtnow.in:8083/?senderID=${recipientId}`,
          title: "Subscribe"
        }]
      }
    }
  });
}

function sendButtonMessage4(recipientId){
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Looking for someone you can chat with...",
          subtitle: "Hang tight, this shouldn't take long! Hit the like button to like us on facebook",
          buttons: [{
            type: "web_url",
            url: "https://www.facebook.com/Flurt-516229078782708/",
            title: "Like"
          }],
        },
      ]
    }
  }
});
}

function sendButtonMessage16(recipientId){
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "You have successfully subscribed for UNLIMITED chatting for 7 days.",
          subtitle: "Please be patient during the waiting time. Do not type end chat we will connect you. Thanks",
          buttons: [{
            type: "postback",
            title: "Start chat",
            payload: "Start chat",
          }],
        },
      ]
    }
  }
});
}



function sendButtonMessage3(recipientId) {
  console.log("I ammmmm")
  sendMessage(recipientId, {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        image_aspect_ratio:"square",
        elements: [{
          title: "Aayat",
          subtitle: "Online",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2586277688081484&width=1024&ext=1564403802&hash=AeSWjGuLekpaBxtH",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ],
        }, {
          title: "Krishna",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2620849904653555&width=1024&ext=1564403894&hash=AeSy1LiaZBcZ4ZYW",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Anamika",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1256764814448251&width=1024&ext=1564403933&hash=AeQvf4B17WLxQOU-",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          }]
        },
        {
          title: "Priya",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2182243278538322&width=1024&ext=1564404004&hash=AeSjw6kU-RM0oOfT",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Sneha",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2528348233860943&width=1024&ext=1564404067&hash=AeRZvQlkipWzGG2M",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Aamya",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2404543172898953&width=1024&ext=1564404127&hash=AeRLFYtMIfT7xSdb",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Priyanka",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2562328603837748&width=1024&ext=1564404166&hash=AeS28r5aPABnHSp6",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Saira",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2264024103660200&width=1024&ext=1564404200&hash=AeQO_iUEbb4I6nG_",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Kayra",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2464814790196360&width=1024&ext=1564404251&hash=AeTk5W_gKaqewak3",
          subtitle: "Online",
          buttons:[{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        },
        {
          title: "Purnima",
          image_url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2057396687642170&width=1024&ext=1564404293&hash=AeT4Tj5HHD5-hBmP",
          subtitle: "Online",
          buttons: [{
            type: "postback",
            title: "Show more",
            payload: "Show more",
          },{
            type: "web_url",
            url: `flirtnow.in:8085/?senderID=${recipientId}`,
            title: "Subscribe"
          } ]
        }]
      }
    }
  });


  // var array= new Array(10);
  // var array1= new Array(10);
  // console.log("I amm here");
  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("mydb");
  //   var query1 = {GENDER: "FEMALE"};
  //   dbo.collection("Users31").find(query1).toArray(function(err, result) {
  //     if (err) throw err;
  //     var i=0;
  //     var count=0;
  //     for (i in result) {
  //       if (result.hasOwnProperty(i)) {
  //           count++;
  //       }
  //       }
  //     var count12=count-30;
  //     var random = Math.floor((Math.random() * count12) + 0);
  //     var random5= random+20;
  //     var l=0;
  //     for(random;random<random5;random++){
  //       console.log("The result iss", result[random].SENDERID);
  //       var rekognition = new AWS.Rekognition();
  //       var params = {
  //       Image: { /* required */
  //           //Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
  //           S3Object: {
  //             Bucket: 'profilepicturesfacebook',
  //             Name: `${result[random].SENDERID}.png`,
  //            // Version: 'STRING_VALUE'
  //           }
  //         },
  //         MinConfidence: 0.0
  //       };
  //     axios.get(`https://graph.facebook.com/${result[random].SENDERID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAEixiwZCNw6W5psnYgbZAJDu2ZAlZCatj0HOIAc4KCAsTnn2QcO98J9HBMBKZCK0ZAhNvW2PD4id3B0dW5hSgpu1gvH2Wedj0TouHyL8e2r6cbT3X42E2rSLhEk5oNznBd0ZAZCjdqjK04jbcN7vjaolhZA1xPzDscmd4uBfKzwVN`)
  //     .then(function(response) {
  //     rekognition.detectModerationLabels(params, function(err, data) {
  //       console.log("api called");
  //          console.log(response.data);
  //       if (err) console.log(err, err.stack); // an error occurred
  //       else     console.log(data);
  //       console.log("moderation labels")
  //       try{
  //       console.log(data.ModerationLabels[0].Confidence)
  //               // successful response
  //       if(data.ModerationLabels[0].Confidence>50){

  //       }
  //       else
  //       {
  //         array1[l]=response.data.first_name
  //         array[l]=response.data.profile_pic;
  //         console.log("The profile pic iss", array[l], recipientId, l);
  //         if(l==9){
  //           console.log("Heyhi");

  //         }
  //         l++
  //       }
  //     }
  //     catch(e)
  //     {
  //     console.log(e)
  //     }
  //     });
  //     }).catch(function(error) {
  //     handleError(error, res);
  //     });
  //     }
  //     console.log("Start chat, checking if user exists");

  //   });
  // });


}


function sendButtonMessage5(recipientId){
  var array=["2826190684118751", "2605766882828290", "2220813171295039", "1864057730362519", "2198616530184802", "2304904879567057", "2117290065025876", "2087672584674332", "2407006802664753", "2079235702132354", "2358640740823992","2790210104330487","2014995871951681", "2495671880466532", "1937836583012345", "2013263622129875", "2024849644291368", "2110606752358680","2227870083959133", "2124554474258347", "1933312110112720", "2649617635080570", "2610378509004403", "2715115561894329", "2077241932390530", "2540226196048239", "2139931246096742", "2376808379005219", "1931741350286201", "2760412390650444", "2149531201800196", "2123411641078586", "2099578666762212", "2171785752935465", "2070237033054684", "2391007627596260", "2380392585333849", "1793972267373721", "2520001331407674", "2236929013038595", "2594855283862884", "2165636123473473", "2044879555567362", "2075431319245245", "2112748965504933", "2111379462291699", "2102005106563003", "2355305151186897", "2087127984742727", "2072274136233683", "3083499378342771", "1938236642953156", "2308282832543208", "2236929013038595", "2379887505390041", "2249447425102137", "2402059569828904", "2124020284372638", "1917798024997612","2056654761114859", "2122014661220953", "2221108117948369", "2649736775053044", "2594855283862884", "2321304417989445", "2145152815577716", "34943106945348833"]
  var array10=["2649617635080570", "2715115561894329", "2077241932390530", "1753575478076141", "2215804848467173", "2183933441649681", "3099778950035979", "2139931246096742", "2093420214070800", "2376808379005219", "2514445711918492", "1931741350286201", "2232738350125526", "2236624589738773", "2149531201800196", "2321602977883303", "2378076268883398", "2171785752935465", "2070237033054684", "2053354724712424", "2391007627596260", "2112984392143016", "2206372542785690", "1933312110112720", "2977727735574586", "2341586349259317","2545050758842455", "2178177815592045", "2616764625003607", "1949898238470988", "1914762188635420","3095132390512620", "2233004166756269", "3033071280040173", "2627386867285459","1919389514856049","2247271742006241","1793972267373721", "1968619793266169", "2369908706375300", "2191526060947867", "2203233949741876", "2380392585333849" ,"1890718041032239", "1642625159173796", "2315791311784430", "2072346406213734", "2222194917831463", "2099578666762212", "2342916015773256", "2142370185844357", "2123411641078586", "2760412390650444", "2540226196048239", "1964030743707330", "2124554474258347", "2299728813381918", "2176883529061026", "2754486017902572", "2110606752358680", "2024849644291368", "2227870083959133", "2154296217999039", "2285076968180284", "1910593862378148", "2175332605889125", "2788471717837560", "1935835043212591", "2613754278697298", "2364896370227674", "2101590403288899", "2573678332703883", "2361783923867091", "2118440414918394", "1937836583012345", "2236764816366600", "2254788097875949"];
  var array3=["20","21","22","23","24","25","26","27","28"];
  var array11=["2145944335488121", "2410217269030036", "2264707900247021", "2138406639575274", "2428094883869889", "2130423080373427", "2616017521805424", "2196260220416763", "2264024103660200", "2562328603837748", "2196131180464470", "2160454414023997", "2464814790196360", "2057396687642170", "2614168521988126", "3064909563534874", "2244074098989168", "2015860185179560", "2269255413113440", "2609761672427854", "1892112324233998", "2348401805212208", "2075431319245245", "2072274136233683", "2249447425102137", "2580049088733606", "3253566804657368", "1991796347584584", "2101951223258552", "2120452001407082","2122084971209838","2802289389788679", "2111379462291699", "2474418019235110", "2476021429094314","2165636123473473" , "2018726671570258", "2373406292670454", "2079235702132354", "1910593862378148", "2044879555567362", "1949950981780427", "1980869162038562", "2050591358357617", "2018726671570258", "2213946812045666", "2655821501101667", "2197094250372349", "2540475299299355", "1314480032010424", "1910593862378148","1955370797919383", "2024849644291368", "2124554474258347", "2077241932390530", "2139931246096742", "2514445711918492", "2705842809456011", "2149531201800196", "2123411641078586","2099578666762212","2222194917831463", "2391007627596260", "2043757859074291", "2369908706375300", "3033071280040173", "2627386867285459", "1919389514856049"]

var array12=["2710309649001785", "2589343981104580", "2589343981104580", "2385348458247294"];

var name=["Ânkï", "Shivani", "Mahira", "Aananya","Rashi", "Ragini", "Lama", "सुजत", "Roza", "Poonam", "Varsha", "Jasmine", "Neha", "Him","Rubaiya", "Ernisa", "Khosh", "Gunjan", "Uzma", "Shiwani", "Twinkle", "Sonia", "Saumya", "Trisha","Trishali", "Sap" , "Barbie", "Deepika", "Anjila", "Swati", "Tapsi", "Tulica", "Krishna", "Urvashi", "Shraddha", "Bindu", "Honey", "Lubna", "Prakriti", "Saira", "Samanita", "Malika", "Chandrani", "Kayra", "Purnima", "Kajal", "Sabina", "सुर", "Debolina", "Arzoo", "Ankita", "Jyotika", "An", "Vaishnavi", "Ruhi", "Apila", "Sandra", "Ayesha", "Suriya", "Jyoti", "Pyushi", "Ameera", "Jelina", "Anjali", "Akshita", "سشمیتا", "Shreya", "Diksha", "Priyashree", "Sármīñ", "Aayat", "Divya", "Nishi", "Ãñjãlì", "Ishika", "Chhavi", "Lavie", "Neha", "शालिन","Puja"];



var profilepic=["https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1902497303189468&width=1024&ext=1567277840&hash=AeQ7x_XFT4tJhvxr", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2369908706375300&width=1024&ext=1567280874&hash=AeRZEwiTBnM2xrVQ", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2043757859074291&width=1024&ext=1567280931&hash=AeRHTdSfsUU57WDe", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2391007627596260&width=1024&ext=1567280958&hash=AeQRK3Cqss58xENv", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2072346406213734&width=1024&ext=1567280989&hash=AeTSLKrV7FTsCnhr", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2222194917831463&width=1024&ext=1567281013&hash=AeS8F_jl-UdyEvmL", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2099578666762212&width=1024&ext=1567281041&hash=AeS_r55sNcwcc-Xe", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2378076268883398&width=1024&ext=1567281100&hash=AeQkxJjETF5nd8NS", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2123411641078586&width=1024&ext=1567281271&hash=AeR-jhhZBP3Kc9I5", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2149531201800196&width=1024&ext=1567281299&hash=AeT1j1ROlCp7iJJK", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2245638458832413&width=1024&ext=1567281334&hash=AeTiuETN6-Sx75CJ", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2557124701028443&width=1024&ext=1567324058&hash=AeQOjrL_mmTUlzWm", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2077241932390530&width=1024&ext=1567324119&hash=AeTMKWPxP4A5oue6", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2178177815592045&width=1024&ext=1567324158&hash=AeQ3DvqWhpjMQSoj", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2124554474258347&width=1024&ext=1567324191&hash=AeS8b1CbAtCKzyvE", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2227870083959133&width=1024&ext=1567324325&hash=AeSa44t8So1KXDDR", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2024849644291368&width=1024&ext=1567324370&hash=AeQHyCrnSgAshDlo", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2110606752358680&width=1024&ext=1567324399&hash=AeSZ3kXD0kuXrxSi", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2254788097875949&width=1024&ext=1567324454&hash=AeQw2S64JDY2BdBJ", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1902497303189468&width=1024&ext=1567324526&hash=AeS2xCGITvxr53fT", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2495671880466532&width=1024&ext=1567324556&hash=AeQLiBSrpLGZpM4N", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2357959514248522&width=1024&ext=1567324593&hash=AeRXxu7ASstld2Ob", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2358640740823992&width=1024&ext=1567324623&hash=AeQ7LNH9G_7d7AuI", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2775290039178557&width=1024&ext=1567324651&hash=AeQv_Y4gRyvYYxWS", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2540475299299355&width=1024&ext=1567324688&hash=AeSkjDsMgFQePq7O", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2117290065025876&width=1024&ext=1567325290&hash=AeRQ1FoaYHMs2IDs", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2304904879567057&width=1024&ext=1567325321&hash=AeS0Lw5SgYWV1GdP", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2213946812045666&width=1024&ext=1567325346&hash=AeTxV8G2F41O60Tm","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2198616530184802&width=1024&ext=1567325374&hash=AeRWGqd04LrOOaxf", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2242553772506689&width=1024&ext=1567325404&hash=AeSfxkn6h4Iyv0D6", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2386327964765770&width=1024&ext=1567325448&hash=AeTs-NhTh5R-ZLbp", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2358717970873057&width=1024&ext=1567325474&hash=AeTmWS-6tPkIqK9e", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2145944335488121&width=1024&ext=1567325541&hash=AeTpY8ipmKFO0p06", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2620849904653555&width=1024&ext=1567325574&hash=AeTQDj6G5EUagnpU", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2264707900247021&width=1024&ext=1567325605&hash=AeRoBQHiHfeF62O9", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2130423080373427&width=1024&ext=1567325631&hash=AeSxmYneIi56wQzA", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2120447341386131&width=1024&ext=1567325659&hash=AeSj7e2NwqeoMHGA", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2616017521805424&width=1024&ext=1567325688&hash=AeR5QijipKOmliO6", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1941721629284370&width=1024&ext=1567325727&hash=AeSVCQbnqIrYc9SE", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2353782164672928&width=1024&ext=1567325758&hash=AeQc_eYjnw89XCxO", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2264024103660200&width=1024&ext=1567325797&hash=AeSZnWrlNhcvCQry", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2160454414023997&width=1024&ext=1567325856&hash=AeTlLPFrFC8z54mO", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2049809828450803&width=1024&ext=1567325890&hash=AeR9QQ3g7czu39hP","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2101951223258552&width=1024&ext=1567327283&hash=AeT0CcBfcdBFKOgv", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2464814790196360&width=1024&ext=1567327324&hash=AeRPrvZylw0RQGRF", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3064909563534874&width=1024&ext=1567327460&hash=AeRP-eo3H3q99xMa", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2505305649539983&width=1024&ext=1567327513&hash=AeTqQ6jOCp1rCobv", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2269255413113440&width=1024&ext=1567327559&hash=AeQjIhdXQ_vcqayt", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2609761672427854&width=1024&ext=1567327590&hash=AeTyHlACHM0crPd_", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2120480188047125&width=1024&ext=1567327638&hash=AeTnjNuRH-5f55yX", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2348401805212208&width=1024&ext=1567327667&hash=AeRp1kDZACQ22Lyt", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2122084971209838&width=1024&ext=1567327693&hash=AeQ96PFdLfQlu6ZV", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2075431319245245&width=1024&ext=1567327716&hash=AeSYgPVW6knOLXLH", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2698638920151762&width=1024&ext=1567327745&hash=AeQvr2drlIe_DOHL", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1938236642953156&width=1024&ext=1567327776&hash=AeTs-_FIKUxZXx4T", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2308282832543208&width=1024&ext=1567327808&hash=AeTnikHivK7Ocobi", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2555922677812493&width=1024&ext=1567327841&hash=AeRm9rtdffIdJUy-","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1917798024997612&width=1024&ext=1567327872&hash=AeRyPTQxIDCuobYX", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2649736775053044&width=1024&ext=1567327922&hash=AeRKI3rP6hGh7aCc", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2321304417989445&width=1024&ext=1567327953&hash=AeQ2zjTiUjK5TMBN", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2285144494885406&width=1024&ext=1567327989&hash=AeQDDL1N4b4O5Sxl", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2335757666476823&width=1024&ext=1567328018&hash=AeSqdzvQy5S5vERy", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2186615581423993&width=1024&ext=1567328046&hash=AeQNKHWYaj7RjHCA", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2348879701812881&width=1024&ext=1567328079&hash=AeRrRB0NyJ8JLYm-", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2165636123473473&width=1024&ext=1567328109&hash=AeRofEyZ2MzijVgs", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2044879555567362&width=1024&ext=1567328140&hash=AeRNQmZ2idjR62yP", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2555175707830060&width=1024&ext=1567328170&hash=AeSeBleqqsAwrbBQ", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2118119984891522&width=1024&ext=1567328206&hash=AeTNlj4U5w_nV3Sx", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2610511402333143&width=1024&ext=1567328238&hash=AeSljXXWlN9PBRJ7", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2573561372654748&width=1024&ext=1567328278&hash=AeRYGQHRhNsaQrjI", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2477306288988845&width=1024&ext=1567328307&hash=AeQmTycnnVhzZp7L", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2311950788920801&width=1024&ext=1567328336&hash=AeT4JesbKkzCcUZT", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2540311676019287&width=1024&ext=1567328366&hash=AeTMFQhRmEPEWfUl", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3408268132532473&width=1024&ext=1567328395&hash=AeSvgmtGVZxLUVz1", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2951590218216757&width=1024&ext=1567328422&hash=AeSNRarw6OVWbE1p", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2868104803259851&width=1024&ext=1567328455&hash=AeRIagmLAvDQwHFs", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2352139728198604&width=1024&ext=1567328481&hash=AeRNa-EzhWOdar1k", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2960662407340648&width=1024&ext=1567328511&hash=AeSKP9OmE1Qwj0d7", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2278542692261782&width=1024&ext=1567328536&hash=AeS5ChzKyaQ1HU9V", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2370805933005597&width=1024&ext=1567328641&hash=AeSHQyGo8-BnY-Ka", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1973665912733248&width=1024&ext=1567328667&hash=AeQXZyvr7sXlWbVt"];



  var count=0;
  var array1= new Array(10);
  var array2= new Array(10);
  var array4= new Array(10);
  var i=0;
  for (i in array12) {
    if (array12.hasOwnProperty(i)) {
        count++;
    }
    }
    var count12=count-12;
    var random = Math.floor((Math.random() * count12) + 0);
    var random5= random+11;
    var l=0;
    for(random;random<random5;random++){
      axios.get(`https://graph.facebook.com/${array12[random]}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
      .then(function(response) {
        var random1 = Math.floor((Math.random() * 9) + 20);
        array1[l]=response.data.first_name
          array2[l]=response.data.profile_pic;
          array4[l]=random1;
          console.log("The profile pic isss11", array12[l], recipientId, l, random1);
          if(l==9){
            console.log("Heyhii",array1[0]+","+array4[l]);
            sendMessage(recipientId, {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  image_aspect_ratio:"square",
                  elements: [{
                    title: array1[0]+", "+array4[0],
                    subtitle: "Less than 5 km from you",
                    image_url: array2[0],
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "http://m.me/FlirtinOfficial"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "http://m.me/FlirtinOfficial",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ],
                  }, {
                    title: array1[1]+", "+array4[1],
                    image_url: array2[1],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ]
                  },
                  {
                    title: array1[2]+", "+array4[2],
                    image_url: array2[2],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }]
                  },
                  {
                    title: array1[3]+", "+array4[3],
                    image_url: array2[3],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ]
                  },
                  {
                    title: array1[4]+", "+array4[4],
                    image_url: array2[4],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ]
                  },
                  {
                    title: array1[5]+", "+array4[5],
                    image_url: array2[5],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }]
                  },
                  {
                    title: array1[6]+", "+array4[6],
                    image_url: array2[6],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
                     ]
                  },
                  {
                    title: array1[7]+", "+array4[7],
                    image_url: array2[7],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ]
                  },
                  {
                    title: array1[8]+", "+array4[8],
                    image_url: array2[8],
                    subtitle: "Less than 5 km from you",
                    buttons:[{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              } ]
                  },
                  {
                    title: array1[9]+", "+array4[9],
                    image_url: array2[9],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    } ,
                    {
                "type": "element_share",
                "share_contents": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [
                        {
                          "title": "Chat with someone instantly.",
                          //"subtitle": "My result: Fez",
                          "default_action": {
                            "type": "web_url",
                            "url": "m.me/112504413433763"
                          },
                          "buttons": [
                            {
                              "type": "web_url",
                              "url": "m.me/112504413433763",
                              "title": "Message"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }]
                  }]
                }
              }
            });
          }
          l++
      }).catch(function(error) {
        console.log(error);
        });
    }
}




function sendButtonMessage19(recipientId){

  var girlsArray=["2194141360684169", "2844754738874051", "3201113729900610", "2300550933313620", "2182570208518876", "2426494297419135", "2398893633538121"]


  var array3=["20","21","22","23","24","25","26","27","28"];



  var name=["Rishbh", "Shirisha", "Sangeetha", "Ashmita", "Tapsi", "Aakriti", "Pria", "Deeksha", "Himanshi", "Sazia", "Nôüsheen", "Harshali", "Diksha", "Riya", "Mounika", "Reeta", "Bebo", "Renu", "Nikki", "Neha", "Shreya", "Jyoti", "Pooja", "Mousumi", "Salma", "Lavi", "Kajal", "Isha", "Hetal", "Edeline", "Anjali", "Rajni", "Naina", "Nimmi", "Rma", "Fatima","Rose", "Shrishti", "Pari", "Peehu", "Dipti","Mamta", "Shruti",




  "Ânkï", "Shivani", "Mahira", "Aananya","Rashi", "Ragini", "Lama", "सुजत", "Roza", "Poonam", "Varsha", "Jasmine", "Neha", "Arzoo", "Purnima", "Uzma", "Ameera", "Ankita", "Ayesha", "Deepika","Sabina", "Urvashi" , "Saira", "Malika", "Lubna","Saumya", "Priyashree", "Chhavi", "Tapsi"];


     // "Aananya", "Arzoo", "Ankita", "Malika", "Honey", "Ayesha", "Apila", "Urvashi", "Roza", "Mahira", "Purnima", "Shivani", "Deepika", "Sujata", "Vaishnavi", "Akshita", "Nishi", "Suriya","Ameera", "Ishika", "Pyushi", "Ruhi", "Sabina", "Sarmin", "Tapsi"];


  var profilepic=["https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3117902074951658&width=1024&ext=1572777168&hash=AeSEq38A_hH_PPx7", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2488743894535536&width=1024&ext=1572778166&hash=AeQoMKYD6piucNqw", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3340635139287930&width=1024&ext=1572778228&hash=AeT_WYOC5lEq06su", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2572926282774021&width=1024&ext=1572778336&hash=AeTJSB3L1I14W4ig", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2451773334940833&width=1024&ext=1572778384&hash=AeQh484l0DYSqhyU", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2290587361050093&width=1024&ext=1572778418&hash=AeT1dCYg7Br59RNf", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2660106007374061&width=1024&ext=1572778477&hash=AeSh60a71HXjoPRi","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2439977982751348&width=1024&ext=1572778548&hash=AeSyU3feUZ_AsAd3", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2505332759545987&width=1024&ext=1572778636&hash=AeShdH4sLgnybRwL", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2526991554023853&width=1024&ext=1572778682&hash=AeQAppz0DWjmriyO", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2914204151983235&width=1024&ext=1572778738&hash=AeScXSm275Eik8GT", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3118704671479703&width=1024&ext=1572778782&hash=AeTMVlIffyWOTDf3", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2228539750588406&width=1024&ext=1572778844&hash=AeRdQD337b8sM2bi", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2521406797946951&width=1024&ext=1572778974&hash=AeROFG86cx-bKVUH", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3611579998868122&width=1024&ext=1572779016&hash=AeRWPTTBS8zeWVH_", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2722055897805600&width=1024&ext=1572779127&hash=AeQU6XV1f2Q-V6W5", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2798900423462318&width=1024&ext=1572779247&hash=AeSMfMGRtJVESDpt", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2575762069111759&width=1024&ext=1572779281&hash=AeTHOKgKndBj4vqM", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3030684093670465&width=1024&ext=1572779310&hash=AeTGTyoDwA3WnNCt", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1315032295287602&width=1024&ext=1572779381&hash=AeQ3PODVHqHT8mB6", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2572066442861007&width=1024&ext=1572779497&hash=AeRpW9899QOisV9e", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2383517998370199&width=1024&ext=1572779587&hash=AeSFhieqjc7jw3hF", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3037860069619392&width=1024&ext=1572779627&hash=AeSSeXVThV50neK1", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2631138220249821&width=1024&ext=1572779666&hash=AeQNHn6ymWCtA7Cf", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2624371657583050&width=1024&ext=1572779741&hash=AeTq0yGVpRg7JM3Q", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1996498700451739&width=1024&ext=1572779780&hash=AeRSjIDRF1LsO647", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2661398493922377&width=1024&ext=1572779816&hash=AeT12YitzW4LjIbX", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2310999999011003&width=1024&ext=1572779853&hash=AeQsMXCbluNHfAeL", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=3034711159936211&width=1024&ext=1572779902&hash=AeRDjAENWJ8wthXk", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2528199607236548&width=1024&ext=1572779966&hash=AeRuku8MRWps1E1C", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2930624466953622&width=1024&ext=1572780001&hash=AeQMgtJcNh4WnIzj", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2414982601930478&width=1024&ext=1572780043&hash=AeR_dZSobt-MoZcb", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2511918518883711&width=1024&ext=1572780088&hash=AeSN6tETpEwg4Cuc", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2558867260816813&width=1024&ext=1572780133&hash=AeR-i_wAQbbuuSf6", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2384893601559786&width=1024&ext=1572780179&hash=AeSihsCTYKXx88KS", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2957954807613166&width=1024&ext=1572780227&hash=AeSjKtZUfT3Tt6Iq","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2437118546395647&width=1024&ext=1572843611&hash=AeRKTbnV960xchR-", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2300879760018786&width=1024&ext=1572843670&hash=AeQEnB6lKK0qsdN_", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2760996440599887&width=1024&ext=1572843835&hash=AeRj31xbx9DmDWuH", "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2653086408063559&width=1024&ext=1572843941&hash=AeT696nj_1cLJkGw","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2694876153913248&width=1024&ext=1573108468&hash=AeSGfX7ps9G4ZL0U","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2681157141904660&width=1024&ext=1573108554&hash=AeTXkjP8QfQ5vFO6","https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=1283035658487337&width=1024&ext=1573108769&hash=AeRSqi_37I_rLsDI",







"https://profilepic11222.s3.us-east-2.amazonaws.com/need/Anki.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Shivani.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Mahira.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Aananya.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Rashi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/need/Ragini.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Lama.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Sujata.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Roza.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Poonam.jpg","https://profilepic11222.s3.us-east-2.amazonaws.com/Varhsa.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Jasmine.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Neha.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Arzoo.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Purnima.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Uzma.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ameera.jpg","https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ankita.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ayesha.jpg","https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Deepika.jpg","https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Sabina.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Urvashi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Saira.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Malika.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Lubna.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Saumya.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Priyashree.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Chhavi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Tapsi.jpg"

  ];



  // ,"https://profilepic11222.s3.us-east-2.amazonaws.com/Aananya.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Arzoo.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ankita.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic12/Malika.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Honey.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ayesha.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic1/Apila.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Urvashi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Roza.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Mahira.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Purnima.jpg","https://profilepic11222.s3.us-east-2.amazonaws.com/Shivani.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Deepika.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/Sujata.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic1/Vaishnavi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic1/Akshita.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic1/Nishi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic1/Suriya.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ameera.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ishika.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Pyushi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Ruhi.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Sabina.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/S%C3%A1rm%C4%AB%C3%B1.jpg", "https://profilepic11222.s3.us-east-2.amazonaws.com/newpic/Tapsi.jpg"];


  var count=0;
  var i=0;
  for (i in name) {
    if (name.hasOwnProperty(i)) {
        count++;
    }
    }
    var count12=count-12;
    var random = Math.floor((Math.random() * count12) + 0);
  sendMessage(recipientId, {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  image_aspect_ratio:"square",
                  elements: [{
                    title: name[random],
                    subtitle: "Less than 5 km from you",
                    image_url: profilepic[random],
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }
                   ],
                  }, {
                    title:name[random+1],
                    image_url: profilepic[random+1],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                     {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                   ]
                  },
                  {
                    title: name[random+2],
                    image_url: profilepic[random+2],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                    ]
                  },
                  {
                    title: name[random+3],
                    image_url: profilepic[random+3],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    },
                     ]
                  },
                  {
                    title: name[random+4],
                    image_url: profilepic[random+4],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },{
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }
                     ]
                  },
                  {
                    title: name[random+5],
                    image_url: profilepic[random+5],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }
                   ]
                  },
                  {
                    title: name[random+6],
                    image_url: profilepic[random+6],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }

                     ]
                  },
                  {
                    title: name[random+7],
                    image_url: profilepic[random+7],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }
                    ]
                  },
                  {
                    title: name[random+8],
                    image_url: profilepic[random+8],
                    subtitle: "Less than 5 km from you",
                    buttons:[{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                    {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    }
                     ]
                  },
                  {
                    title: name[random+9],
                    image_url: profilepic[random+9],
                    subtitle: "Less than 5 km from you",
                    buttons: [{
                      type: "postback",
                      title: "Show more",
                      payload: "Show more",
                    },
                     {
                      type: "web_url",
                      url: `https://www.facebook.com/Qpid-121160839279528`,
                      title: "Like"
                    },
                    {
                      type: "web_url",
                      url: `flirtnow.in:8085/?senderID=${recipientId}`,
                      title: "Subscribe"
                    } ,
                   ]
                  }]
                }
              }
            });
}




/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */

function sendGenericMessage(senderID,recipientID) {

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var query ={SENDERID: recipientID}

dbo.collection("profilepic11").find(query).toArray(function(err, result) {
        console.log("i am hereee1",  result);
        if (err) throw err;

        // axios.get(`https://graph.facebook.com/${recipientID}?fields=first_name,last_name,profile_pic&access_token=EAAdZBIUGQ3SgBAKSHfxqisqnDcBz9tPgGPZB2GZAmSaRXaOSNBtGK27eqGmL3wp73U5ZCZCUJUlqSZCvDZBzwPhD0rNV1rvFVq3ydhVQObBjeVAS6YYOKZAnll5odEn1cQxfFja24Pqr8HXqZAnDzPeNhZARa8VIZAuaedNiHsWM8gCrwZDZD`)
        //   .then(function(response) {
  try{
          console.log("The image issss11233", result[0].PROFILEPIC);
          // sendTextMessage(senderID, `You're now chatting with with ${response.data.first_name}. Say hi! `);
          //sendTextMessage(senderID, `You're now chatting with with ${result[0].NAME}. Say hi!! `)
    console.log("The image issss112334", result[0].PROFILEPIC, result[0].NAME);
        sendMessage(senderID, {
              attachment: {
                  type: 'image',
                  payload: {
                          url: result[0].PROFILEPIC,
          }
              }
          });

  setTimeout(function(){
        sendQuickReplyMessage(senderID, `You're now chatting with with ${result[0].NAME}. Say hi!! `, [
        {
          "content_type":"text",
          "title":"End chat",
          "payload":"End chat"
        },
      ]);

  },2000);

          }


      catch(e){
sendTextMessage(senderID,"You are now chatting with someone. Say hi!");

      }
    // }).catch(function(error) {
    //   console.log("The error is sss", error);
    //   sendTextMessage(senderID,"You are now chatting with someone. Say hi!");
    // });


      });




  });
  }


// function sendGenericMessage(senderID,recipientID) {
//   sendTextMessage(senderID,"You are now chatting with someone. Say hi!");
//   // var rekognition = new AWS.Rekognition();
//   // var params = {
//   //   Image: { /* required */
//   //     //Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
//   //     S3Object: {
//   //       Bucket: 'profilepicturesfacebook',
//   //       Name: `${recipientID}.png`,
//   //      // Version: 'STRING_VALUE'
//   //     }
//   //   },
//   //   MinConfidence: 0.0
//   // };
// //   axios.get(`https://graph.facebook.com/${recipientID}?fields=first_name,last_name,profile_pic&access_token=EAADoQika69kBAE2KIv5V0x09uLcJKEnnCHbUUsRmYAEeQeQgzvfC9B5xiqi8NfqumQw7tzX8RxE3EBwxMWjGTW75yKlwDW4nZB5z78B1EJxAe69JB8xJy4YO1sqwob4lHl3IlejBkBhro2DWkPKMs625dI5UF4elwyuhSEAZDZD`)
// //       .then(function(response) {


// //   rekognition.detectModerationLabels(params, function(err, data) {
// //     console.log("api called");
// //        console.log(response.data);
// //     if (err) console.log(err, err.stack); // an error occurred
// //     else     console.log(data);
// //     console.log("moderation labels", recipientID)
// //     try{
// //     console.log(data.ModerationLabels[0].Confidence)
// //             // successful response
// //     if(data.ModerationLabels[0].Confidence>50){
// //       sendTextMessage(senderID, `You're now chatting with with ${response.data.first_name}. Say hi! `);
// //     }
// //     else
// //     {
// //     console.log("sending image message")
// //     sendTextMessage(senderID, `You're now chatting with with ${response.data.first_name}. Say hi! `);
// //     sendMessage(senderID, {
// //           attachment: {
// //               type: 'image',
// //               payload: {
// //                       url: response.data.profile_pic,
// //       }
// //           }
// //       });
// //     }
// //   }
// //   catch(e)
// //   {
// //   console.log(e)
// //   sendTextMessage(senderID, `You're now chatting with with ${response.data.first_name}. Say hi! `);
// // }
// // });


// // }).catch(function(error) {
// //   handleError(error, res);
// //   sendTextMessage(senderID,"You are now chatting with someone. Say hi!");
// // });


// }


/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */

function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}


function sendMessage (sender, message) {
console.log("sendMessage");
 request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
 .send({
            recipient: {
                id: sender
            },
            message: message
        })
        .end((err, res) => {
            if (err) {
                console.log('Error sending message: ', err);

            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
}


app.post('/token', (req, res) => {
    if (req.body.verifyToken === verifyToken) {
        pageToken = req.body.token;
        return res.sendStatus(200);
    }
    res.sendStatus(403);
});
app.get('/token', (req, res) => {
    if (req.body.verifyToken === verifyToken) {
        return res.send({token: pageToken});
    }
    res.sendStatus(403);
});

 https.createServer({
       key: fs.readFileSync(privkey),
       cert: fs.readFileSync(cert),
       ca: fs.readFileSync(chain)
    }, app).listen(55555, function () {
  console.log('App is ready on port 55555');
});

