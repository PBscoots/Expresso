// import and setup express router
const express = require('express');
const apiRouter = express.Router();

// import the various routers from different files
const employeesRouter = require('../routes/employees');
const menusRouter = require('../routes/menus');
const menuItemsRouter = require('../routes/menu-items');

// use all of these routes for the specified API request location
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);
// apiRouter.use('/menu-items', menuItemsRouter);

// export the apiRouter to be used in the server
module.exports = apiRouter;