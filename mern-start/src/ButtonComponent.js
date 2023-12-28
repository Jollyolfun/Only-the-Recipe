// ButtonComponent.js
import React from 'react';

const ButtonComponent = () => {
  const handleClick = async () => {
    try {
      const response = await fetch('/api/buttonClick', {
        method: 'POST', // Or 'GET' depending on your backend setup
        headers: {
          'Content-Type': 'application/json',
        },
        // You can send additional data in the body if needed
        // body: JSON.stringify({ key: value }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Log the response data from the backend
        // Perform actions with the received data, e.g., update state
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

export default ButtonComponent;
