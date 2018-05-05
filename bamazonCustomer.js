const inquirer = require('inquirer');
const mysql = require('mysql');
require('console.table');

var newQuantity;
var itemSelected;
var selectedQuantity;

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'test',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;
    listItems();
});

function listItems() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        console.clear();
        console.log('!!!!!!!!WELCOME TO BAMAZON!!!!!!!!\n');
        var values = [];
        for (var i = 0; i < res.length; i++) {
            var response = res[i];
            values.push(
                {
                    id: response.item_id,
                    item: response.product_name,
                    price: response.price
                }
            );

        }
        console.table(values);
        userPrompts();
    });
}

function userPrompts() {
    inquirer
        .prompt([{
            type: 'input',
            message: 'Please enter the ID of an item that you would like to purchase:',
            name: 'id',
        },
            {
                type: 'input',
                message: 'How many would you like to purchase?',
                name: 'amount',
            }])
        .then(function (answer) {
            itemSelected = answer.id;
            selectedQuantity = answer.amount;
            connection.query(
                'SELECT * FROM products WHERE ?',
                {
                    item_id: answer.id,
                },
                function (err, res) {
                    if (err) throw err;
                    newQuantity = res[0].stock_quantity - answer.amount;
                    if (newQuantity >= 1) {
                        updateStock();
                    } else {
                        console.log('insufficient amount');
                        userPrompts();
                    }

                }
            );
        });

}

function updateStock() {
    connection.query('UPDATE products SET ? WHERE ?',
        [
            {
                stock_quantity: newQuantity,
            },
            {
                item_id: itemSelected,
            }

        ],
        function (err) {
            if (err) throw err;
            console.log('Database updated');
            showPrice();
        }
    )
}

function showPrice() {
    connection.query('SELECT price FROM products WHERE ?',
        {
            item_id: itemSelected,
        },
        function (err, res) {
            if (err) throw err;
            console.log((res[0].price * selectedQuantity).toFixed(2));
            continueShopping();
        }
    )
}

function continueShopping() {
    inquirer
        .prompt({
            name: 'continue',
            type: 'rawlist',
            message: 'Would you like to continue shopping?',
            choices: ['YES', 'NO']
        })
        .then(function (answer) {
            if(answer.continue.toUpperCase() === 'YES') {
                listItems();
            }
            else if (answer.continue.toUpperCase() === 'NO') {
                connection.end();
            }
        })


}