const menuItemRouter = require('express').Router(
    {
        mergeParams :   true
    }
);

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// param handling
menuItemRouter.param('menuItemId', (req,res,next,menuItemId)=> {
    db.get(`SELECT * FROM MenuItem
            WHERE menuItem.id = $menuItemId`,
            {
                $menuItemId   :   menuItemId
            },
            (err, row)=>{
                if(row){
                    req.menuItem = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// const validity checks
const isValidMenuItem = (req,res,next) => {
    const menuItem = req.body.menuItem;
    if(!menuItem.name || !menuItem.description || !menuItem.inventory || !menuItem.price){
        res.sendStatus(400);
        return;
    } else {
        next();
    }
}

// get all menuItems
menuItemRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM menuItem
        WHERE menu_id = $menuId`,
        {
            $menuId   :   req.params.menuId
        },
        (err, menuItems)=>{
            if(err){
                res.sendStatus(404);
                return;
            } else {
                res.send({menuItems : menuItems});
            }
        });
});

// create a new menu Item
menuItemRouter.post('/', isValidMenuItem, (req,res,next)=>{
    const menuItem = req.body.menuItem;
    const param = req.params.menuId;
    db.run(`INSERT INTO MenuItem
        (name, description, inventory, price, menu_id)
        VALUES ($name, $description, $inventory, $price, $menuId);`,
        {
            $name         :   menuItem.name,
            $description   :   menuItem.description,
            $inventory    :   menuItem.inventory,
            $price        :   menuItem.price,
            $menuId       :   req.params.menuId
        },
        function(err){
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM MenuItem
                    WHERE id = $menuItemId;`,
                    {
                        $menuItemId   :   this.lastID
                    },
                    (err, menuItem)=>{
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(201).send({menuItem    :   menuItem});
                        }
                });
            }
        }
    );
});

// put update menuItem
menuItemRouter.put('/:menuItemId', isValidMenuItem, (req,res,next)=>{
    const menuItem = req.body.menuItem;
    db.run(`UPDATE MenuItem SET
        name = $name,
        description = $description,
        inventory = $inventory,
        price = $price,
        menu_id = $menuId
        WHERE menuItem.id = $menuItemId;`,
        {
            $name           :   menuItem.name,
            $description    :   menuItem.description,
            $inventory      :   menuItem.inventory,
            $price          :   menuItem.price,
            $menuId         :   req.params.menuId,
            $menuItemId     :   req.params.menuItemId
        },
        (err)=>{
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM MenuItem
                    WHERE id = $menuItemId`,
                    {
                        $menuItemId   :   req.params.menuItemId
                    },
                    (err, menuItem)=>{
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(200).send({menuItem    :   menuItem});
                        }
                    })
            }
        })
});

// delete an item 
menuItemRouter.delete('/:menuItemId',(req,res,next)=>{
    db.run(`DELETE FROM MenuItem
        WHERE id = $menuItemId;`,
        {
            $menuItemId   :   req.params.menuItemId
        },
        (err)=>{
            if(err){
                res.sendStatus(404);
            } else {
                db.get(`SELECT * FROM MenuItem
                    WHERE id = $menuItemId;`,
                    {
                        $menuItemId   :   req.params.menuItemId
                    },
                    (err,menuItem)=>{
                        if(err){
                            res.sendStatus(404);
                        } else {
                            res.sendStatus(204);
                        }
                    });
            }
        });
});

module.exports = menuItemRouter;