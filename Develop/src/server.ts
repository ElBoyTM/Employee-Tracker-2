import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// -- Create functions -- //

// Create a department
const createDepartment = (req: express.Request, res: express.Response) => {
  const sql = `INSERT INTO department (name)
    VALUES ($1)`;
  const params = [req.body.name];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: req.body,
    });
    });
    };

    app.post('/api/new-department', createDepartment
);

// Create a role
const createRole = (req: express.Request, res: express.Response) => {
  const sql = `INSERT INTO role (title, salary, department_id)
    VALUES ($1, $2, $3)`;
  const params = [req.body.title, req.body.salary, req.body.department_id];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: req.body,
    });
  });
  };

  app.post('/api/new-role', createRole
);

// Create an employee
const createEmployee = (req: express.Request, res: express.Response) => {
  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager)
    VALUES ($1, $2, $3, $4)`;
  const params = [req.body.first_name, req.body.last_name, req.body.role_id, req.body.manager];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: req.body,
    });
  });
  };

  app.post('/api/new-employee', createEmployee
);

// -- Read functions -- //

// Read all departments
const getDepartments = (_req: express.Request, res: express.Response) => {
  const sql = `SELECT id, name FROM department`;

  pool.query(sql, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const { rows } = result;
    res.json({
      message: 'success',
      data: rows,
    });
  });

  app.get('/api/departments', getDepartments)
};

// Read all roles
const getRoles = (_req: express.Request, res: express.Response) => {
  const sql = `SELECT id, title, salary, department_id FROM role`;

  pool.query(sql, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const { rows } = result;
    res.json({
      message: 'success',
      data: rows,
    });
  });

  app.get('/api/roles', getRoles)
};

// Read all employees
const getEmployees = (_req: express.Request, res: express.Response) => {
  const sql = `SELECT id, first_name, last_name, role_id, manager FROM employee`;

  pool.query(sql, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const { rows } = result;
    res.json({
      message: 'success',
      data: rows,
    });
  });

  app.get('/api/employees', getEmployees)
};

// -- Update function -- //

// Update an employee's role
const updateEmployeeRole = (req: express.Request, res: express.Response) => {
  const sql = `UPDATE employee
    SET role_id = $1
    WHERE id = $2`;
  const paramsArr = [req.body.role_id, req.params.id];

  pool.query(sql, paramsArr, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Employee not found',
      });
    } else {
      res.json({
        message: 'success',
        changes: result.rowCount,
        id: req.params.id,
      });
    }
  });

  app.put('/api/update-employee-role/:id', updateEmployeeRole)
};

// --Inquirer-- //

const inquirerFunc = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['Add a department', 'Add a role', 'Add an employee', 'View all departments', 'View all roles', 'View all employees', 'Update an employee role', 'Exit'],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case 'Add a department':
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?',
              },
            ])
            .then((answers) => {
              const sql = `INSERT INTO department (name)
                VALUES ($1)`;
              const params = [answers.name];

              pool.query(sql, params, (err, _result) => {
                if (err) {
                  console.error(err.message);
                  return;
                }
                console.log('Department added successfully');
              });
              inquirerFunc();
            });
          break;
        case 'Add a role':
            // Fetch departments to provide as choices
            pool.query('SELECT id, name FROM department', (err, result) => {
            if (err) {
              console.error(err.message);
              return;
            }
            const departments = result.rows.map((row) => ({
              name: row.name,
              value: row.id,
            }));

            inquirer
              .prompt([
              {
                type: 'input',
                name: 'title',
                message: 'What is the title of the role?',
              },
              {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
              },
              {
                type: 'list',
                name: 'department_id',
                message: 'Which department does the role belong to?',
                choices: departments,
              },
              ])
              .then((answers) => {
              const sql = `INSERT INTO role (title, salary, department_id)
                VALUES ($1, $2, $3)`;
              const params = [answers.title, answers.salary, answers.department_id];

              pool.query(sql, params, (err, _result) => {
                if (err) {
                console.error(err.message);
                return;
                }
                console.log('Role added successfully');
                inquirerFunc();
              });
              });
            });
          break;
        case 'Add an employee':
            // Fetch roles and employees to provide as choices
            pool.query('SELECT id, title FROM role', (err, roleResult) => {
            if (err) {
              console.error(err.message);
              return;
            }
            const roles = roleResult.rows.map((row) => ({
              name: row.title,
              value: row.id,
            }));

            pool.query('SELECT id, first_name, last_name FROM employee', (err, employeeResult) => {
              if (err) {
              console.error(err.message);
              return;
              }
              const employees = employeeResult.rows.map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
              }));

                inquirer
                .prompt([
                {
                type: 'input',
                name: 'first_name',
                message: 'What is the first name of the employee?',
                },
                {
                type: 'input',
                name: 'last_name',
                message: 'What is the last name of the employee?',
                },
                {
                type: 'list',
                name: 'role_id',
                message: 'What is the role of the employee?',
                choices: roles,
                },
                {
                type: 'list',
                name: 'manager',
                message: 'Who is the manager of the employee?',
                choices: [...employees, { name: 'None', value: null }],
                },
                ])
                .then((answers) => {
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager)
                VALUES ($1, $2, $3, $4)`;
                const params = [answers.first_name, answers.last_name, answers.role_id, answers.manager];

                pool.query(sql, params, (err, _result) => {
                if (err) {
                  console.error(err.message);
                  return;
                }
                console.log('Employee added successfully');
                inquirerFunc();
                });
                });
            });
            });
          break;
        case 'View all departments':
          const sqlDepartments = `SELECT id, name FROM department`;

          pool.query(sqlDepartments, (err, result) => {
            if (err) {
              console.error(err.message);
              return;
            }
            console.table(result.rows);
          });
          inquirerFunc();
          break;
        case 'View all roles':
          const sqlRoles = `SELECT id, title, salary, department_id FROM role`;

          pool.query(sqlRoles, (err, result) => {
            if (err) {
              console.error(err.message);
              return;
            }
            console.table(result.rows);
          });
          inquirerFunc();
          break;
        case 'View all employees':
          const sqlEmployees = `SELECT id, first_name, last_name, role_id, manager FROM employee`;

          pool.query(sqlEmployees, (err, result) => {
            if (err) {
              console.error(err.message);
              return;
            }
            console.table(result.rows);
          });
          inquirerFunc();
          break;
        case 'Update an employee role':
            // Fetch employees and roles to provide as choices
            pool.query('SELECT id, first_name, last_name FROM employee', (err, employeeResult) => {
            if (err) {
              console.error(err.message);
              return;
            }
            const employees = employeeResult.rows.map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
            }));

            pool.query('SELECT id, title FROM role', (err, roleResult) => {
              if (err) {
              console.error(err.message);
              return;
              }
              const roles = roleResult.rows.map((row) => ({
              name: row.title,
              value: row.id,
              }));

              inquirer
              .prompt([
                {
                type: 'list',
                name: 'id',
                message: 'Which employee\'s role do you want to update?',
                choices: employees,
                },
                {
                type: 'list',
                name: 'role_id',
                message: 'What is the new role of the employee?',
                choices: roles,
                },
              ])
              .then((answers) => {
                const sql = `UPDATE employee
                SET role_id = $1
                WHERE id = $2`;
                const paramsArr = [answers.role_id, answers.id];

                pool.query(sql, paramsArr, (err, _result) => {
                if (err) {
                  console.error(err.message);
                  return;
                }
                console.log('Employee role updated successfully');
                inquirerFunc();
                });
              });
            });
            });
          break;
        case 'Exit':
          pool.end();
          break;
        default:
  }});
};

inquirerFunc();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });