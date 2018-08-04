const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// create Employee table
db.serialize(()=>{
    db.run('DROP TABLE IF EXISTS Employee');
    db.run(`CREATE TABLE Employee
            (id INTEGER NOT NULL,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            wage TEXT NOT NULL,
            is_current_employee INTEGER DEFAULT 1,
            PRIMARY KEY(id));`,
            (err)=>{
                if(err){
                    console.log(err);
                }
            });
});

// create Timesheet table
db.serialize(()=>{
    db.run('DROP TABLE IF EXISTS Timesheet');
    db.run(`CREATE TABLE Timesheet
            (id INTEGER NOT NULL PRIMARY KEY,
            hours INTEGER NOT NULL,
            rate INTEGER NOT NULL,
            date INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES Employee(id));`,
            (err)=>{
                if(err){
                    console.log(err);
                }
            });
});

// create Menu table
db.serialize(()=>{
    db.run('DROP TABLE IF EXISTS Menu');
    db.run(`CREATE TABLE Menu
            (id INTEGER NOT NULL PRIMARY KEY,
            title TEXT NOT NULL);`,
            (err)=>{
                if(err){
                    console.log(err);
                }
            });
});

// create MenuItem table
db.serialize(()=>{
    db.run('DROP TABLE IF EXISTS MenuItem');
    db.run(`CREATE TABLE MenuItem
            (id INTEGER NOT NULL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            inventory INTEGER NOT NULL,
            price INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            FOREIGN KEY (menu_id) REFERENCES Menu(id));`,
            (err)=>{
                if(err){
                    console.log(err);
                }
            });
});