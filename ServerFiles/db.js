// to use mongoDB
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');


const bodyParser = require('body-parser');
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/authen", { useNewUrlParser: true, useUnifiedTopology:true });

const recordingSchema = new mongoose.Schema({
    date:      String,
    heartRate:  String,
    deviceID: String,
 });


const Recording = mongoose.model("Recording", recordingSchema);

const userSchema = new mongoose.Schema({
    username:      String,
    passwordHash:   String,
    devices: String,
    lastAccess:     { type: Date, default: Date.now },
 });


const User = mongoose.model("User", userSchema);

async function clearDatabase() {
  try {
    // Delete all documents in the 'Recordings' collection
    await Recording.deleteMany({});
    //console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
  try {
    // Delete all documents in the 'User' collection
    await User.deleteMany({});
    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } 
}

// Call the function to clear the database
//clearDatabase();

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/lab/status', async function (req, res) {
  const deviceID = req.query.deviceID;
  
  if (!deviceID) {
    return res.status(400).json({ error: 'A deviceID is required.' });
  }

  try {
    const entries = await Recording.find({ deviceID: deviceID });
    
    if (entries.length === 0) {
      return res.status(400).json({ error: 'Device does not exist in the database.' });
    }

        
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');

    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Endpoint to handle POST requests to /lab/register
app.post('/lab/register', async function (req, res) {
  const { date, heartRate, deviceID, apikey } = req.body;

  if (!date || !heartRate || !deviceID || !apikey) {
    console.log(req.body);
    return res.status(400).json({ error: 'Date, heartRate, ID, and apikey are required.' });
    
  }
  
  try {
    const newEntry = new Recording({ date, heartRate, deviceID });
    await newEntry.save();
    res.status(201).json({ response: 'Data recorded.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

const secret = fs.readFileSync(__dirname + '/keys/jwtkey').toString();


app.post("/users/signUp", function(req, res){
   User.findOne({username: req.body.username}, function (err, user) {
      if (err) res.status(401).json({success: false, err: err});
      else if (user) {
         res.status(401).json({success: false, msg: "This username already used"});
      }
      else {
         const passwordHash = bcrypt.hashSync(req.body.password, 10);
         const newUser = new User({
            username: req.body.username,
            passwordHash: passwordHash, 
	    devices: ""     
         });
               
         newUser.save(function(err, user) {
            if (err) {
               res.status(400).json({success: false, err: err});
            } 
            else {
               let msgStr = `User (${req.body.username}) account has been created.`;
               res.status(201).json({success: true, message: msgStr});
               console.log(msgStr);
            }
         });
       }
   });
});



app.post("/users/logIn", function(req, res){
   if (!req.body.username || !req.body.password) {
      res.status(401).json({ error: "Missing username and/or password"});
      return;
   }
   // Get user from the database
   User.findOne({username: req.body.username}, function(err, user) {
      if (err) {
         res.status(400).send(err);
      }
      else if (!user) {
         // Username not in the database
         res.status(401).json({ error: "Login failure!!"});
      }
      else {
         if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const token = jwt.encode({username: user.username}, secret);
               //update user's last access time
               user.lastAccess = new Date();
               user.save( (err, user) => {
                  console.log("User's LastAccess has been updated.");
               });
               // Send back a token that contains the user's username
               res.status(201).json({ success:true, token: token, username: user.username,devices: user.devices, msg: "Login success" });
         }
         else {
            res.status(401).json({ success:false, msg: "Username or password invalid."});
         }
      }
   });
});

app.put("/users/changePassword", function(req, res) {
   if (!req.body.username || !req.body.newPassword) {
      res.status(400).json({ error: "Missing username and/or new password" });
      return;
   }

   
   // Get user from the database
   User.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
         res.status(500).send(err);
      } else if (!user) {
         // Username not in the database
         res.status(401).json({ error: "User not found" });
      } else {
         // Update the password
         const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);
         user.passwordHash = newPasswordHash;

         user.save(function(err, updatedUser) {
            if (err) {
               res.status(500).json({ error: "Internal Server Error" });
            } else {
               res.status(200).json({ success: true, msg: "Password changed successfully" });
            }
         });
      }
   });
});

app.put("/users/updateDevices", function(req, res) {
   if (!req.body.username) {
      res.status(400).json({ error: "Missing username" });
      return;
   }

   
   // Get user from the database
   User.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
         res.status(500).send(err);
      } else if (!user) {
         // Username not in the database
         res.status(401).json({ error: "User not found" });
      } else {
         // Check if a device needs to be added
         if (req.body.addDevice) {
            // Add the new device to the end of the devices string with a comma
            user.devices = user.devices ? user.devices + ',' + req.body.addDevice : req.body.addDevice;
         }

         // Check if a device needs to be deleted
         if (req.body.deleteDevice) {
            // Remove the specified device from the devices string
            user.devices = user.devices.replace(new RegExp(req.body.deleteDevice + ',?', 'g'), '');
         }

         user.save(function(err, updatedUser) {
            if (err) {
               res.status(500).json({ error: "Internal Server Error" });
            } else {
               res.status(200).json({
                  success: true,
                  msg: "Devices updated successfully",
                  devices: updatedUser.devices.split(',') // Convert the devices string to an array
               });
            }
         });
      }
   });
});


app.listen(3000);

module.exports = mongoose;
