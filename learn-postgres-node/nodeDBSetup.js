const { Client } = require("pg");
//1. Configuration

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "learning_sql",
  password: "admin",
  port: 5432,
});

async function run() {
  try {
    // 2.Connect
    await client.connect();
    console.log("Connected to the Database!");

    //Run a Query
    //Lets get the invoice data we wrote in the last step
    const res = await client.query(`
        SELECT customers.name as customer,products.name as product,order_items.quantity,products.price,(order_items.quantity*products.price) as total_cost FROM order_items JOIN orders ON order_items.order_id=orders.id JOIN customers ON orders.customer_id=customers.id JOIN products ON order_items.product_id=products.id;`);
    const customerName = "siv";
    const text = "SELECT * FROM customers WHERE name=$1";
    const values = [customerName];
    const res1 = await client.query(text, values);
    console.log("Found User: ", res1.rows[0]);
    //4.Print the results
    console.table(res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    // 5. close connection
    await client.end();
    console.log("Connection Closed");
  }
}

run();
