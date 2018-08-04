// declare router
const timesheetRouter = require('express').Router(
    {
        mergeParams :   true
    }
);

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// param handling middleware
timesheetRouter.param('timesheetId', (req,res,next,timesheetId)=> {
    db.get(`SELECT * FROM Timesheet
            WHERE timesheet.id = $timesheetId`,
            {
                $timesheetId   :   timesheetId
            },
            (err, row)=>{
                if(row){
                    req.timesheet = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// const validity check middleware
const isValidTimesheet = (req,res,next) => {

    const timesheet = req.body.timesheet;
    if(!timesheet.hours || !timesheet.rate || !timesheet.date){
        res.sendStatus(400);
    } else {
        next();
    }
}

// get all timesheets
timesheetRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Timesheet
        WHERE employee_id = $employeeId;`,
        {
            $employeeId   :   req.params.employeeId
        },
        (err, timesheets)=>{
            if(err){
                res.sendStatus(404);
                return;
            } else {
                res.send({timesheets : timesheets});
            }
        });
});

// create new timesheet
timesheetRouter.post('/', isValidTimesheet, (req,res,next)=>{
    const timesheet = req.body.timesheet;
    db.run(`INSERT INTO Timesheet
        (hours, rate, date, employee_id)
        VALUES ($hours, $rate, $date, $employeeId);`,
    {
        $hours      :   timesheet.hours,
        $rate       :   timesheet.rate,
        $date       :   timesheet.date,
        $employeeId :   req.params.employeeId
    },
    function(err){
        if(err){
            res.sendStatus(400);
        } else {
            db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId;',
            {
                $timesheetId : this.lastID
            },
            (err,timesheet)=>{
                if(timesheet){
                    res.status(201).send({timesheet : timesheet});
                } else if(err){
                    res.sendStatus(400);
                }
            });
        }

    });
});

// put update to timesheet
timesheetRouter.put('/:timesheetId', isValidTimesheet, (req,res,next)=>{
    const timesheet = req.body.timesheet;
    db.run(`UPDATE Timesheet SET
        hours = $hours,
        rate = $rate,
        date = $date,
        employee_id = $employeeId
        WHERE timesheet.id = $timesheetId;`,
        {
            $hours               :   timesheet.hours,
            $rate        :   timesheet.rate,
            $date   :   timesheet.date,
            $employeeId           :   req.params.employeeId,
            $timesheetId            :   req.params.timesheetId
        },
        (err)=>{
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Timesheet
                    WHERE id = $timesheetId`,
                    {
                        $timesheetId   :   req.params.timesheetId
                    },
                    (err, timesheet)=>{
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(200).send({timesheet    :   timesheet});
                        }
                    })
            }
        })
});

// delete a particular timesheet
timesheetRouter.delete('/:timesheetId',(req,res,next)=>{
    db.run(`DELETE FROM Timesheet
        WHERE id = $timesheetId;`,
        {
            $timesheetId   :   req.params.timesheetId
        },
        (err)=>{
            if(err){
                res.sendStatus(404);
            } else {
                db.get(`SELECT * FROM timesheet
                    WHERE id = $timesheetId;`,
                    {
                        $timesheetId   :   req.params.timesheetId
                    },
                    (err,timesheet)=>{
                        if(err){
                            res.sendStatus(404);
                        } else {
                            res.sendStatus(204);
                        }
                    });
            }
        });
});

module.exports = timesheetRouter;