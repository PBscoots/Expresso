// declare new router
const employeeRouter = require('express').Router();

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// param handling
employeeRouter.param('employeeId', (req,res,next,employeeId)=> {
    db.get(`SELECT * FROM Employee
            WHERE Employee.id = $employeeId`,
            {
                $employeeId   :   employeeId
            },
            (err, row)=>{
                if(row){
                    req.employee = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// validity checks
const isValidEmployee = (req,res,next) => {
    const employee = req.body.employee;
    if(!employee.name || !employee.position || !employee.wage){
        res.sendStatus(400);
    }
    employee.isCurrentEmployee = employee.isCurrentEmployee || '1';
    next();
}

// use the timesheets router for timesheets routes
const timesheetRouter = require('../routes/timesheets');
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

// get all employee
employeeRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Employee
            WHERE is_current_employee = 1`,
        (err, employees)=>{
            if(err){
                console.log(err);
                return;
            }
            res.body = {employees : employees};
            res.send(res.body);
        })
});

// create new employee
employeeRouter.post('/',isValidEmployee, (req,res,next)=>{
    const employee = req.body.employee;
    db.run(`INSERT INTO Employee
        (name, position, wage, is_current_employee)
        VALUES ($name, $position, $wage, $isCurrentEmployee);`,
    {
        $name                   :   employee.name,
        $position            :   employee.position,
        $wage              :   employee.wage,
        $isCurrentEmployee    :   employee.isCurrentEmployee
    },
    function(err){
        if(err){
            res.sendStatus(400);
        } else {
            db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId;',
            {
                $employeeId : this.lastID
            },
            (err,employee)=>{
                if(employee){
                    res.status(201).send({employee : employee});
                } else if(err){
                    res.sendStatus(400);
                }
            });
        }

    });
});

// get employee by ID
employeeRouter.get('/:employeeId',(req,res,next)=>{
    res.send({employee: req.employee});
});

// update an employee
employeeRouter.put('/:employeeId',isValidEmployee,(req,res,next)=>{
    const employee = req.body.employee;
    db.run(`UPDATE Employee SET
            name = $name,
            position = $position,
            wage = $wage,
            is_current_employee = $isCurrentEmployee
            WHERE employee.id = $employeeId;`,
            {
                $name                   :   employee.name,
                $position               :   employee.position,
                $wage                   :   employee.wage,
                $isCurrentEmployee      :   employee.isCurrentEmployee,
                $employeeId             :   req.params.employeeId
            },(err)=>{
                if(err){
                    res.sendStatus(400);
                } else {
                    db.get(`SELECT * FROM Employee
                            WHERE id = $employeeId`,
                            {
                                $employeeId   :   req.params.employeeId
                            },
                            (err,employee)=>{
                                if(employee){
                                    res.status(200).send({employee: employee});
                                } else {
                                    res.sendStatus(400);
                                }
                            });
                }
            }
    );
});

// delete an employee. Really we are just going to set currently-employed to 0
employeeRouter.delete('/:employeeId',(req,res,next)=>{
    db.run(`UPDATE Employee SET
        is_current_employee = 0
        WHERE id = $employeeId;`,
        {
            $employeeId   :   req.params.employeeId
        },
        (err)=>{
            if(err){
                res.sendStatus(404);
            } else {
                db.get(`SELECT * FROM Employee
                    WHERE id = $employeeId;`,
                    {
                        $employeeId   :   req.params.employeeId
                    },
                    (err,employee)=>{
                        if(err){
                            res.sendStatus(404);
                        } else {
                            res.status(200).send({employee :   employee});
                        }
                    });
            }
        });
});
module.exports = employeeRouter;