// declare router
const menuRouter = require('express').Router();

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Middleware
// import nested router from  menuItems
const menuItemRouter = require('./menu-items');
menuRouter.use('/:menuId/menu-items', menuItemRouter);

// param handling
menuRouter.param('menuId', (req,res,next,menuId)=> {
    db.get(`SELECT * FROM Menu
            WHERE menu.id = $menuId`,
            {
                $menuId   :   menuId
            },
            (err, row)=>{
        
                if(row){
                    req.menu = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// validation
const isValidMenu = (req,res,next) => {
    const menu = req.body.menu
    if(!menu.title){
        res.sendStatus(400);
        return;
    } else {
        next();
    }
}

// ***REQUEST HANDLING***

// get all menu
menuRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Menu`,
        (err, menus)=>{
            if(err){
                console.log(err);
                return;
            }
            res.body = {menus : menus};
            res.send(res.body);
        });
});

// get a menu by the partular id
menuRouter.get(`/:menuId`,(req,res,next)=>{
    res.send({menu    :   req.menu})
});

menuRouter.post('/', isValidMenu, (req,res,next)=>{
    const menu = req.body.menu;
    db.run(`INSERT INTO Menu
        (title)
        VALUES ($title);`,
        {
            $title   :   menu.title
        },
        function(err){
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Menu
                    WHERE id = $menuId`,
                    {
                        $menuId   :   this.lastID
                    },
                (err, menu)=>{
                    if(err){
                        res.sendStatus(400);
                    } else {
                        res.status(201).send({menu    :   menu});
                    }
                });
            }
        }
    );
});

menuRouter.put('/:menuId', isValidMenu, (req,res,next)=>{
    const menu = req.body.menu;
    db.run(`UPDATE Menu SET
        title = $title
        WHERE menu.id = $menuId;`,
        {
            $title              :   menu.title,
            $menuId          :   req.params.menuId
        },
        (err)=>{
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Menu
                    WHERE id = $menuId`,
                    {
                        $menuId   :   req.params.menuId
                    },
                    (err, menu)=>{
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(200).send({menu    :   menu});
                        }
                    })
            }
        })
});

// needs work. Does not yet pass all tests
menuRouter.delete('/:menuId',(req,res,next)=>{
    db.all(`SELECT COUNT(*) as count FROM MenuItem
        WHERE menu_id = $menuId`,
        {
            $menuId   :   req.params.menuId
        },
        (err, menuItems)=>{
            const items = menuItems[0].count;
            if(items > 0){
                res.sendStatus(400);
                return;
            } else {
                db.run(`DELETE FROM Menu
                WHERE id = $menuId;`,
                {
                    $menuId   :   req.params.menuId
                },
                (err)=>{
                    if(err){
                        res.sendStatus(400); 
                        return;
                    } else {
                        res.sendStatus(204);
                        return;
                    }
                }
            );
            }
        }
    );
});


module.exports = menuRouter;