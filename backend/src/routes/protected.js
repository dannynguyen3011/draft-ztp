const express = require('express');

module.exports = (keycloak) => {
  const router = express.Router();

  router.get('/protected', keycloak.protect(), (req, res) => {
    res.json({
      message: 'Access granted to protected route',
      user: req.kauth.grant.access_token.content
    });
  });

  return router;
};
