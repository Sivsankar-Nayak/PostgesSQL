// run this with: node test-order.js
fetch("http://localhost:3000/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_id: 1, // Ensure Customer 1 exists
    items: [
      { product_id: 1, quantity: 1 }, // Ensure Product 1 exists
      { product_id: 2, quantity: 5 }, // Ensure Product 2 exists
    ],
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
