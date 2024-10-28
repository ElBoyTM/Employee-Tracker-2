import express from 'express';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
          const sqlRoles = `
            SELECT role.id, role.title, role.salary, department.name AS department_name
            FROM role
            JOIN department ON role.department_id = department.id
          `;

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
          const sqlEmployees = `
            SELECT 
              employee.id, 
              employee.first_name, 
              employee.last_name, 
              role.title AS role, 
              manager.first_name || ' ' || manager.last_name AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN employee AS manager ON employee.manager = manager.id
          `;

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