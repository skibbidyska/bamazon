const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'test',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw (err);
    console.clear();
    managerDashboard();

});

function managerDashboard() {
    inquirer
        .prompt({
            name: 'options',
            type: 'list',
            message: 'Select from one of the options below: ',
            choices: ['View Products For Sale', 'View Low Inventory', 'Add To Inventory', 'Add New Product']

        })
        .then(function (answer) {

            switch (answer.options) {
                case ('View Products For Sale'):
                    console.log('View Products For Sale');
                    productsForSale();
                    break;

                case ('View Low Inventory'):
                    lowInventory();
                    break;

                case ('Add To Inventory'):
                    addToInventory();
                    break;

                case ('Add New Product'):
                    addNewProduct();
                    break;
            }
        });
}

function productsForSale() {
    connection.query('Select * FROM products', function (err, res) {
        if (err) throw err;
        console.clear();
        console.log("ITEMS")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].product_name);
        }
        managerDashboard();
    });

}

function lowInventory() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5', function (err, res) {
        if (err) throw (err);
        console.clear();
        console.log("")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].product_name);
        }
        managerDashboard();
    });
}

function addToInventory() {
    inquirer
        .prompt([
            {
                name: 'item_id',
                type: 'input',
                message: 'Which item would you like to add to?'
            },
            {
                name: 'stock_quantity',
                type: 'input',
                message: 'How many would you like to add?'
            }

        ])
        .then(function (answer) {

        })
}

function addNewProduct() {
    inquirer
        .prompt([
            {
                name: 'product_name',
                type: 'input',
                message: 'Enter the product name'
            },
            {
                name: 'department_name',
                type: 'input',
                message: 'Enter the associated department'
            },
            {
                name: 'price',
                type: 'input',
                message: 'Enter the price of the product'
            },
            {
                name: 'stock_quantity',
                type: 'input',
                message: 'Enter amount on hand'
            }
        ])
        .then(function (answer) {
            connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
                VALUES( '${answer.product_name}', '${answer.department_name}', ${parseFloat(answer.price)}, ${parseInt(answer.stock_quantity)})`,
                function (err, res) {
                    if (err) throw err;
                    console.log(`You have added ${answer.product_name} to your stock, you have ${answer.stock_quantity} remaining.`);
                    managerDashboard();
                });
        });

};

