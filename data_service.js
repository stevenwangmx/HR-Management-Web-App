const Sequelize = require('sequelize');

var sequelize = new Sequelize('d2j0i7liajs2t2', 'nqibnaqffrpeap', '25242b157a25144e20479e2837188b1659132ff656a69a968e452cd1a36956f2', {
    host: 'ec2-54-243-130-33.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    }
   });

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((err) => {
    console.log('Unable to connect to the database:', err);
});

var Employee = sequelize.define('Employee', {
    employeeNum:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

/**********************************************
initialize function to sync the database
**********************************************/
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function (Employee, Department) {
            resolve();
        }).catch(function (err) {
            reject("unable to sync the database");
        });
    });
};

/**********************************************
addEmployee function to 
add employee data to Employee table
**********************************************/
module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.create(employeeData)
            .then(function () {
                resolve();
            })
            .catch(function (err) {
                reject("unable to create employee");
            });
    });
}

/**********************************************
updateEmployee function to 
update employee data to Employee table
**********************************************/
module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.update(employeeData, {
            where: { employeeNum: employeeData.employeeNum } 
        })
            .then(function () {
                resolve();
            })
            .catch(function (err) {
                reject("unable to create employee");
            });
    });
};


/**********************************************
getAllEmployees function to 
return all employee data from Employee table
**********************************************/
module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll()
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                reject("no results returned");
            });
    });
}

/**********************************************
getEmployeeByNum function to 
retrun employee data from Employee table
by EmployeeNum
**********************************************/
module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeNum: num }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};

/**********************************************
getEmployeesByStatus function to 
retrun employee data from Employee table
by EmployeeStatus
**********************************************/
module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { status: status }
        }).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};

/**********************************************
getEmployeesByDepartment function to 
retrun employee data from Employee table
by Department
**********************************************/
module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { department: department }
        }).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};

/**********************************************
getEmployeesByManager function to 
retrun employee data from Employee table
by Manager
**********************************************/
module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeManagerNum: manager }
        }).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};

/**********************************************
getManagers function to 
retrun managers data from Employee table
**********************************************/
module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { isManager: true }
        }).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};

/**********************************************
deleteEmployeeByNum function to 
delete employee data from Employee table
by employeeNum
**********************************************/
module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: { employeeNum: empNum }
        }).then(function () {
            resolve();
        })
        .catch(function (err) {
            reject("unable to delete employee");
        });
    });
};

/**********************************************
getDepartments function to 
return department data from Department table
**********************************************/
module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll()
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                reject("no results returned");
            });
    });
};

/**********************************************
addDepartment function to 
add department data to Department table
**********************************************/
module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for (var prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }
        Department.create(departmentData)
        .then(function () {
            resolve();
        })
        .catch(function (err) {
            reject("unable to create department");
        });
    });
};

/**********************************************
updateDepartment function to 
update department data to Department table
by departmentId
**********************************************/
module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for (var prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }
        Department.update(departmentData, {
            where: { departmentId: departmentData.departmentId } 
        })
            .then(function () {
                resolve();
            })
            .catch(function (err) {
                reject("unable to update department");
            });
    });
};

/**********************************************
getDepartmentById function to 
return department data to Department table
by departmentId
**********************************************/
module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: { departmentId: id }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (err) {
            reject("no results returned");
        });
    });
};