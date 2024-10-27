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
app.post('/api/new-department', ({ body }, res) => {
  const sql = `INSERT INTO department (name)
    VALUES ($1)`;
  const params = [body.name];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: body,
    });
  });
});

// Create a role
app.post('/api/new-role', ({ body }, res) => {
  const sql = `INSERT INTO role (title, salary, department_id)
    VALUES ($1, $2, $3)`;
  const params = [body.title, body.salary, body.department_id];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: body,
    });
  });
});

// Create an employee
app.post('/api/new-employee', ({ body }, res) => {
  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ($1, $2, $3, $4)`;
  const params = [body.first_name, body.last_name, body.role_id, body.manager_id];

  pool.query(sql, params, (err, _result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: body,
    });
  });
});

// -- Read functions -- //

// Read all departments
app.get('/api/departments', (_req, res) => {
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
});

// Read all roles
app.get('/api/roles', (_req, res) => {
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
});

// Read all employees
app.get('/api/employees', (_req, res) => {
  const sql = `SELECT id, first_name, last_name, role_id, manager_id FROM employee`;

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
});

// -- Update function -- //

// Update an employee's role
app.put('/api/update-employee-role/:id', ({ body, params }, res) => {
  const sql = `UPDATE employee
    SET role_id = $1
    WHERE id = $2`;
  const paramsArr = [body.role_id, params.id];

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
        id: params.id,
      });
    }
  });
});

// --Inquirer-- //

inquirer
  .prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['Add a department', 'Add a role', 'Add an employee', 'View all departments', 'View all roles', 'View all employees', 'Update an employee role'],
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
          });
        break;
      case 'Add a role':
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
              type: 'input',
              name: 'department_id',
              message: 'What is the department ID of the role?',
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
            });
          });
        break;
      case 'Add an employee':
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
              type: 'input',
              name: 'role_id',
              message: 'What is the role ID of the employee?',
            },
            {
              type: 'input',
              name: 'manager_id',
              message: 'What is the manager ID of the employee?',
            },
          ])
          // .then((answers) => {
          //   const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)`
          // })
        }});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });