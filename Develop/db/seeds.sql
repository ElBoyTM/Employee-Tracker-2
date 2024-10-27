-- Departments
INSERT INTO department (name) VALUES 
('Engineering'),
('Human Resources'),
('Marketing'),
('Sales');

-- Roles
INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 80000, 1),
('HR Manager', 60000, 2),
('Marketing Specialist', 50000, 3),
('Sales Representative', 45000, 4);

-- Employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Emily', 'Jones', 3, 1),
('Michael', 'Brown', 4, 1);