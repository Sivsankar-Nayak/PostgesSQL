const { Pool } = require("pg");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors()); // Allow frontend to talk to us
app.use(express.json()); // Allow us to read JSON bodies

//1. The Pool keeps the connection alive

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "learning_sql",
  password: "admin",
  port: 5432,
});

//2. The EndPoint(GET/Invoices)

app.get("/invoices", async (req, res) => {
  try {
    // we dont say client.connect() anymore.The pool handles it.
    const result = await pool.query(`
        SELECT customers.name as customer,products.name as product,order_items.quantity,products.price,(order_items.quantity*products.price) as total_cost FROM order_items JOIN orders ON order_items.order_id=orders.id JOIN customers ON orders.customer_id=customers.id JOIN products ON order_items.product_id=products.id;`);

    // send the rows back to the frontend as JSON
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// create a new customer
app.post("/customers", async (req, res) => {
  try {
    const { name, email } = req.body;
    const query = "INSERT INTO customers(name,email) VALUES($1,$2) RETURNING *";
    const values = [name, email];
    const result = await pool.query(query, values);
    // send back the new customer (including the auto-generated ID)
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/orders", async (req, res) => {
  const client = await pool.connect(); // get dedicated client

  try {
    const { customer_id, items } = req.body;
    //Expecting:{customer_id:1, items:[{product_id:1,quantity:2}]}

    //2.Start the Transaction
    await client.query("BEGIN");
    //3.Create the Order Header
    const orderRes = await client.query(
      "INSERT INTO orders(customer_id,order_date,amount) VALUES($1,NOW(),0) RETURNING *",
      [customer_id]
    );
    const orderId = orderRes.rows[0].id;

    //4.Create the order items(Loop through the list)
    let totalAmount = 0;

    for (const item of items) {
      //Get product price first(to calculate total)
      const productRes = await client.query(
        "SELECT price FROM products WHERE id=$1",
        [item.product_id]
      );
      const price = productRes.rows[0].price;

      //Insert line item

      await client.query(
        "INSERT INTO order_items(order_id,product_id,quantity) VALUES($1,$2,$3)",
        [orderId, item.product_id, item.quantity]
      );

      totalAmount += price * item.quantity;
    }

    //5. Update the total amount in the main Order table
    await client.query("UPDATE orders SET amount=$1 WHERE id=$2", [
      totalAmount,
      orderId,
    ]);

    //6.Commit(Save everything permanently)
    await client.query("COMMIT");

    res.json({
      message: "Order created successfully",
      orderId: orderId,
      total: totalAmount,
    });
  } catch (err) {
    //7. Rollback(Undo Everything if error)
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Transaction Failed" });
  } finally {
    // 8. Release the client back to the pool
    client.release();
  }
});
// 3. Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
