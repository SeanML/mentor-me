var db    = require('../db/db.js');
var Sequelize   = require('sequelize');
var async = require('async');
var _     = require('lodash');

///////////////////////////////////////////////////
///////////    GETTING MENTORS       //////////////
///////////////////////////////////////////////////

exports.learnerSearchMentors = function(req, res, term){
  db.User.findAll({
    where: {
      $or: [
        {primary_role  : "1"},
        {secondary_role: "1"}
      ]
    },
    include : [{
      model : db.Skill
    },
    {
      model: db.Quality
    }]

  })
  .then(function(mentors){
    // console.log("line 58: list of found mentors by term", mentors);
    console.log("this is term", term);
    var filterMentor = _.map(mentors, function(mentor){
      var found = false;
      if(_.includes(mentor.username, term)){
        return mentor;
      }
      if(_.includes(mentor.firstnam, term)){
        return mentor;
      }
      if(_.includes(mentor.lastname, term)){
        return mentor;
      }
      if(_.includes(mentor.email   , term)){
        return mentor;
      }
      if(_.includes(mentor.phone   , term)){
        return mentor;
      }
      if(_.includes(mentor.descript, term)){
        return mentor;
      }

      _.each(mentor.Skills, function(skill){
        console.log('skill.tite: ', skill.title);
        if(_.includes(skill.title, term)){
          found = true;
        }
      })

      console.log('found: ', found);
      if(found){
        return mentor;
      }
    })
    if(!filterMentor[0]) {
      res.status(200).send([]) }
    else {
      res.status(200).send(filterMentor)
    }
    // _.each(filterMentor, function(mentor) {
    //   console.log("This is the filtered mentors ::", mentor.dataValues);
    // })

  })
  .catch(function(err){
    console.error('err', err.message);
    res.status(500).send(err.message);
  });
}


exports.learnerFetchMentors = function(req, res){
  db.User.findAll({
    where: {
      $or: [
        {primary_role  : "1"},
        {secondary_role: "1"}
      ]
    },
    include : [{
      model : db.Skill
    },
    {
      model: db.Quality
    }]

  })
  .then(function(mentors){
    console.log("line 81: user fetch mentors");
    res.status(200).send(mentors)
  })
  .catch(function(err){
    console.error(err.message);
    res.status(500).send(err.message);
  });



}

///////////////////////////////////////////////////
///////////    LEARNER CRUD          //////////////
///////////////////////////////////////////////////


exports.learnerFetchedById = function(req, res, userId){
    db.User.findById(userId)
        .then(function(user){
          console.log(user)
          res.status(200).send(user);
        })
        .catch(function (err) {
                console.error("learner Fetch by Id", err.message);
                res.status(500).send(err.message);

        });

}

///////////////////////////////////////////////////
///////////        PERFERENCES       //////////////
///////////////////////////////////////////////////


exports.learnerFetchPreferences = function(req, res, userId){
    db.User.findById(userId)
        .then(function(user){
          console.log(user)
          user.getPreference()
          .then(function(preference){
            res.status(200).send(preference);
          })
          .catch(function (err) {
                  console.error("learner Prefernces", err.message);
                  res.status(500).send(err.message);

          })
        })
        .catch(function (err) {
                console.error("learner Prefernces", err.message);
                res.status(500).send(err.message);

        });

}

exports.learnerUpdatePreferences = function(req, res, preferenceUpdate){
  var preId = preferenceUpdate.id
  db.Preference.update(preferenceUpdate,{ where: { id: preId }, returning:true})
    .then(function (result) {
        console.log("line 69:  model", JSON.stringify(result[1]));
        res.status(200).send(result[1]);
      });

}


///////////////////////////////////////////////////
///////////        APPOINTMENT       //////////////
///////////////////////////////////////////////////



exports.learnerScheduleAppointment = function(req, res, appointment){
  console.log("inside learnerScheduleAppointment", appointment)
  db.Appointment.create(appointment)
  .then(function(appointment){
    res.status(200).send(appointment)
  })
  .catch(function(err){
    console.error(err.message);
    res.status(500).send(err.message);
  })

}


exports.learnerFetchAppointment = function(req, res, userId){
  console.log("inside learnerFetchAppointment")
  db.Appointment.findAll({
        where: {learnerId: userId}
  })
  .then(function(appointments){
    res.status(200).send(appointments)
  })
  .catch(function(err){
    console.error(err.message);
    res.status(500).send(err.message);
  })

}
exports.learnerUpdateAppointment = function(req, res, appointment, appId){
    db.Appointment.update(appointment, {
      where: { id: appId }
    })
    .then(function() {
      res.status(200).send('Appointment '+ appId + ' update success');
    })
    .catch(function(err) {
      res.status(500).send('Appointment '+ appId + ' update failed');
    });

}

exports.learnerDeleteAppointment = function(req, res, appId){
    db.Appointment.findById(appId)
    .then(function(appRecord) {
      appRecord.destroy();
      res.status(200).send('Appointment '+ appId + ' deleted successfully');
    })
    .catch(function(err) {
      res.status(500).send('Appointment '+ appId + ' deleted failed');
    });

}


exports.learnerDeleteAppointment = function(req, res, appId){
    db.Appointment.findById(appId)
    .then(function(appRecord) {
      appRecord.destroy();
      res.status(200).send('Appointment '+ appId + ' deleted successfully');
    })
    .catch(function(err) {
      res.status(500).send('Appointment '+ appId + ' deleted failed');
    });

}


///////////////////////////////////////////////////
///////////          REVIEWS         //////////////
///////////////////////////////////////////////////

exports.learnerReviewMentor = function(req, res, review){

  db.Review.create(review)
  .then(function(review){
    res.status(200).send(review)
  })
  .catch(function(err){
    console.error(err.message);
    res.status(500).send(err.message);
  })

}




///////
exports.allMentors = function(req, res){
  var mentorsAll = [];
  db.User.findAll({
      where: {
        $or: [
          {primary_role  : "1"},
          {secondary_role: "1"}
        ]
      }
    })
    .then(function(mentors){
      // console.log("This is the mentors without skills", mentors)
        async.mapSeries(mentors, function(mentor, callback){

        var newMentor = mentor.dataValues;
        mentor.getSkills()
        .then(function(result) {

            newMentor.skills = result.map(function(skill){
              return skill.dataValues.title;
            });
            mentorsAll.push(newMentor);
            callback(null, mentorsAll);
         })

  },function(err, results) {
    // console.log("This is results in the 3rd arg of the MAP ", results[0]);
    res.status(200).send(results[0]);
  })
})
}



// db.User.findAll({})
//   .then(function(mentors){
//       // console.log("line 58: list of found mentors by term", mentors);
//       // res.status(200).send(mentors)
//   })
//   .catch(function(err){
//       console.error(err.message);
//       // res.status(500).send(err.message);
//   });

// db.Skill.findAll({
//   where: {
//     title: { $like: '%' + term + '%'}
//   }
// })
//   .then(function(data) {
//     _.map(data, function(item) {
//       // console.log('line 92 data: ', item.dataValues);
//     })
//   })
//
// db.User.findAll({
//     // where: {
//     //   $or: [
//     //     { username       : { $like: '%' + term + '%'}},
//     //     { firstname      : { $like: '%' + term + '%'}},
//     //     { lastname       : { $like: '%' + term + '%'}},
//     //     { email          : { $like: '%' + term + '%'}},
//     //     { phone          : { $like: '%' + term + '%'}},
//     //     { description    : { $like: '%' + term + '%'}},
//     //   ]
//     // },
//     include : [{
//                 model : db.Skill
//               }]
//   })




//
// exports.learnerCreate = function(req, res, newUser, skills, preferences) {
//     console.log("line 5: create learner", newUser);
//     db.User.create(newUser)
//       .then(function(user){
//         user.createPreference(preferences, user.id)
//         .then(function(preference){
//             // console.log("user perferences set", preference)
//           return user;
//         })
//         .then(function(user){
//           var token = user.generateToken('auth');
//           console.log("this after preferences :::::: ", token);
//           res.status(200)
//               .header('Auth', token)
//               .header('currentUser', user.id)
//               .send({token: token, currentUser: user.id})
//         })
//       })
//       .catch(function(err){
//           console.error(err.message);
//           res.status(500).send(err.message + " Username and Email must be unique");
//       });
// };
