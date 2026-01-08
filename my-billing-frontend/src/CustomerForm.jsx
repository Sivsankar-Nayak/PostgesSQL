import { useState } from 'react';

function CustomerForm({ onNewCustomer }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page from refreshing

    try {
      // 1. Send data to Backend
      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setMessage(`✅ Success! Added ${newCustomer.name}`);
        
        // Clear the form
        setName('');
        setEmail('');

        // Notify the parent component (optional, we will use this later)
        if (onNewCustomer) onNewCustomer(newCustomer);
      } else {
        setMessage('❌ Failed to add customer');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server Error');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
      <h3>Add New Customer</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            Save Customer
          </button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CustomerForm;