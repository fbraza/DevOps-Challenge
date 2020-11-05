const client = require('../dbClient')

module.exports = {
  create: (user, callback) => {
    // Check parameters
    if(!user.username) return callback(new Error("Wrong user parameters"), null)
    // Create User schema
    const userObj = {
      firstname: user.firstname,
      lastname: user.lastname,
    }
    // Check if username exists
    client.exists(user.username, (err, res) => {
        if (res  ==1) {
            return callback(new Error("Warning: the user already exists"), null)
        } else {
            client.hmset(user.username, userObj, (error, response) => {
              if (err) return callback(error, null)
              callback(null, response)
          })
        }
    })
  },
  get: (username, callback) => {
    client.hgetall(username, (error, response) => {
      if (response) {
        callback(null, response)
        } else {
          callback(new Error("Warning: The user does not exist"), null)
        }
      })
    }
  }
