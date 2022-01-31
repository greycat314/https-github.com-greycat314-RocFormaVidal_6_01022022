const bcrypt = require("bcrypt");

// The jsonwebtoken package allows to assign a token to a user when he connects
const jwt = require('jsonwebtoken');

const User = require("../models/user")

// We save a new user and we encrypt his password with a hash generated by bcrypt
exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Middleware to check if the user exists in the Mongo database and if he has the correct password
// exports.login = (req, res, next) => {
exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            // We encode the userID for the creation of new objects. Allows to apply the correct userID to objects and not modify the objects of others
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              // Token encryption key which can be made more complex in production
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};



