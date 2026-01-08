import { useEffect, useState } from "react";
import "./App.css";
import CustomerForm from "./CustomerForm";

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //1.The function to fetch Data

    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://localhost:3000/invoices");
        const data = await response.json();
        console.log("Data from DB", data);
        setInvoices(data);
      } catch (err) {
        console.error("Error fetching Data:", err);
      } finally {
        setLoading(false);
      }
    };

    //2 Call it
    fetchInvoices();
  }, []); // empty array=run only on mount

  return (
    <div className="container">
      <h1>My Billing App</h1>
      <CustomerForm />
      {loading ? (
        <p>Loading Data...</p>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, index) => (
              <tr key={index}>
                <td>{inv?.customer}</td>
                <td>{inv?.product}</td>
                <td>{inv?.quantity}</td>
                <td>{inv?.price}</td>
                <td>{inv?.total_cost?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default App;
