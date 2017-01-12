'use strict'
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodeadmin = require("nodeadmin");
const jwt = require("jwt-simple");
const Sequelize = require("sequelize");
const sequelize = new Sequelize('project_db', 'serbanbogdan', '');

const JWT_SECRET = "bigSecret";

let User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        required: true
    },
    password: {
        type: Sequelize.STRING,
        required: true
    },
    name: {
        type: Sequelize.STRING,
        required: true
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    token: {
        type: Sequelize.STRING,
    }
})

let Field = sequelize.define('field', {
    name: {
        type: Sequelize.STRING,
        unique: true,
        required: true
    },
    surface: {
        type: Sequelize.DOUBLE,
        required: true
    }
})

let Customer = sequelize.define('customer', {
    name: {
        type: Sequelize.STRING,
        required: true
    },
    personalNumber: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    idNumber: {
        type: Sequelize.STRING,
        required: true,
        unique: true
    },
    contractNumber: {
        type: Sequelize.STRING,
    }
})

let CustomerField = sequelize.define('customer_field', {
    area: {
        type: Sequelize.DOUBLE,
        required: true
    }
})

User.hasMany(Field, {
    foreignKey: 'userId'
})

Field.belongsTo(User, {
    foreignKey: 'userId'
})

CustomerField.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(CustomerField, {
    foreignKey: 'userId'
})

User.hasMany(Customer, {
    foreignKey: 'userId'
})

Customer.belongsTo(User, {
    foreignKey: 'userId'
})

Customer.belongsToMany(Field, {
    through: CustomerField,
    foreignKey: 'customerId'
})

Field.belongsToMany(Customer, {
    through: CustomerField,
    foreignKey: 'fieldId'
})



const port = process.env.PORT;

let app = express();
app.use(express.static(__dirname + "/app"));
app.use(bodyParser.json());
app.use(nodeadmin(app));
app.use(cors());

app.get('/create', (req, res) => {
    sequelize.sync({
            force: true
        })
        .then(() => {
            res.status(201).send('created')
        })
        .catch((error) => {
            console.warn(error)
            res.status(500).send('error')
        })
})

app.post('/login', (req, res) => {
    User.find({
            attributes: ['id', 'username', 'password', 'token'],
            where: {
                username: req.body.username,
                password: req.body.password
            }
        })
        .then((user) => {
            if (user) {
                if (!user.token) {
                    user.token = jwt.encode(user, JWT_SECRET);
                    user.save()
                        .then(() => {
                            res.status(200).send(user.token);
                        })
                        .catch((error) => {
                            console.log("Some login errod: " + error);
                            res.status(500).send("A problem has been encountered. Please try again...");
                        })

                }
                else {
                    res.status(200).send(user.token);
                }
            }
            else {
                res.status(204).send("Incorect username/password");
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/signup', (req, res) => {
    User.find({
            attributes: ['username', 'password'],
            where: {
                username: req.body.username,
                password: req.body.password
            }
        })
        .then((user) => {
            if (user) {
                res.status(400).send("User already exists!");
            }
            else {
                let user = req.body;
                user.token = '';
                User.create(user)
                    .then((user) => {
                        res.status(201).send("User created...");
                    })

            }
        })
        .catch((error) => {
            res.status(500).send("Error while registering...Try again!");
            console.log(error)
        })
})

app.post('/logout', (req, res) => {
    User.find({
            where: {
                token: req.body.token
            }
        })
        .then((user) => {
            if (user) {
                user.token = '';
                user.save()
                    .then(() => {
                        res.status(200).send("Successfully logged out...");
                    })
                    .catch((error) => {
                        console.log('Logout error: ' + error);
                        res.status(500).send("A problem was encountered...");
                    })
            }
            else {
                res.status(200).send("You are logged out...");
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.get('/user', (req, res) => {
    // console.log(req.query);
    User.find({
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                res.status(200).send(user.name);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(404).status("User not found...");
        })
})

app.get('/fields', (req, res) => {
    console.log("token: " + req.query.token);
    User.find({
            attributes: ['id', 'name'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                Field.findAll({
                        attributes: ['id', 'name', 'surface'],
                        where: {
                            userId: user.id
                        }
                    })
                    .then((fields) => {
                        res.status(200).send({
                            name: user.name,
                            fields: fields
                        });
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/fields', (req, res) => {
    let token = req.query.token;
    User.find({
            attributes: ['id'],
            where: {
                token: token
            }
        })
        .then((user) => {
            if (user) {
                let field = req.body;
                field.userId = user.id;
                Field.create(field)
                    .then((field) => {
                        res.status(201).send("Added");
                    })
                    .catch((error) => {
                        res.status(500).send("Error while creating field...");
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            res.status(500).send("Error while creating field...");
            console.log(error);
        })
})

app.put('/fields/:id', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                Field.find({
                        attributes: ['id', 'name', 'surface'],
                        where: {
                            id: req.params.id,
                            userId: user.id
                        }
                    })
                    .then((field) => {
                        res.status(200).send("updated");
                        return field.updateAttributes(req.body);

                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).send('Error while updating field...');
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.delete('/fields/:id', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                Field.find({
                        where: {
                            userId: user.id,
                            id: req.params.id
                        }
                    })
                    .then((field) => {
                        field.destroy();
                        res.status(200).send('deleted');
                    })
                    .catch((error) => {
                        res.status(500).send('Error while deleting field...');
                        console.log(error);
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.get('/customers', (req, res) => {
    User.find({
            attributes: ['id', 'name'],
            where: {
                token: req.query.token
            },
            include: [Customer]
        })
        .then((user) => {
            if (user) {
                Customer.findAll({
                        where: {
                            userId: user.id,
                        },
                        include: [Field]
                    })
                    .then((customers) => {
                        res.status(200).send({
                            customers: customers,
                            name: user.name
                        });
                    })
            }
            else {
                res.status(404).send('User not found...');
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/customers', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                let customer = req.body;
                customer.userId = user.id;
                Customer.create(customer)
                    .then((customer) => {
                        res.status(201).send('created');
                    })
            }
            else {
                res.status(404).send('User not found...');
            }
        })
        .catch((error) => {
            res.status(500).send('Error while creating customer...');
            console.log(error);
        })
})

app.put('/customers/:id', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            },
            include: [Customer]
        })
        .then((user) => {
            Customer.find({
                    where: {
                        id: req.params.id,
                        userId: user.id
                    }
                })
                .then((customer) => {
                    res.status(200).send('updated');
                    return customer.updateAttributes(req.body);
                })
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error at update...')
        })
})

app.delete('/customers/:id', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                console.log(req.params)
                Customer.find({
                        where: {
                            id: req.params.id,
                            userId: user.id
                        }
                    })
                    .then((customer) => {
                        customer.destroy();
                        res.status(200).send('destroyed');
                    })
            }
            else {
                res.status(404).send('User not found...');
            }
        })
        .catch((error) => {
            res.status(500).send('Error encountered while deleting...');
            console.log(error);
        })
})

app.put('/customer_fields', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                Field.find({
                        attributes: ['id'],
                        where: {
                            userId: user.id,
                            name: req.body.name
                        }
                    })
                    .then((field) => {
                        CustomerField.find({
                                where: {
                                    customerId: req.body.customer_field.customerId,
                                    fieldId: field.id,
                                    userId: user.id
                                }
                            })
                            .then((customerField) => {
                                customerField.fieldId = field.id;
                                customerField.area = req.body.customer_field.area;
                                console.log(customerField)
                                customerField.save()
                                    .then(() => {
                                        res.status(200).send('Success');
                                    })
                            })
                    })
            }
            else {
                res.status(404).send('User not found...');
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error while updating customer fields...");
        })
})

app.delete('/customer_fields/:fieldId&:customerId', (req, res) => {
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                CustomerField.find({
                        where: {
                            userId: user.id,
                            customerId: req.params.customerId,
                            fieldId: req.params.fieldId
                        }
                    })
                    .then((field) => {
                        field.destroy()
                            .then(() => {
                                res.status(200).send('success');
                            })
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error while deleting customer field...');
        })
})

app.post('/customer_fields', (req, res) => {
    console.log(req.body);
    User.find({
            attributes: ['id'],
            where: {
                token: req.query.token
            }
        })
        .then((user) => {
            if (user) {
                Field.find({
                        attributes: ['id'],
                        where: {
                            name: req.body.field.name,
                            userId: user.id
                        }
                    })
                    .then((field) => {
                        let newCustomerField = {
                            userId: user.id,
                            customerId: req.body.customer.id,
                            fieldId: field.id,
                            area: req.body.field.area
                        }
                        CustomerField.create(newCustomerField)
                            .then(() => {
                                res.status(200).send('created');
                            })
                    })
            }
            else {
                res.status(404).send("User not found...");
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error while adding field to customer...');
        })
})

app.post('/checkUsername', (req, res) => {
    User.find({
            where: {
                username: req.body.username
            }
        })
        .then((user) => {
            if (user) {
                res.status(200).send({
                    exists: true
                });
            }
            else {
                res.status(200).send({
                    exists: false
                });
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.listen(process.env.PORT);
