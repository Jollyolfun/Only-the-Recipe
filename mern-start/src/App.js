/*
Author: Cole Perry

Description: The frontend of a webpage which takes a recipe webpage's URL
and extracts relevant information to the recipe.

Date of last update: 12/28/2023
*/

import React, { useState } from 'react';
import ReactLoading from 'react-loading';

import  './App.css';
function Recipe() {
  const [inputValue, setInputValue] = useState(''); 
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false); 


  const handleInputChange = (event) => {
    setInputValue(event.target.value); 
  };

  const handleSendToBackend = async () => {
    try {
      //Sets loading screen to visible
      setLoading(true);
      // Make a request to the backend with the input text
      const response = await fetch(`http://13.51.207.83:5000/processLink?url=${encodeURIComponent(inputValue)}`);


      if (response.ok) {
        
        //The string sent by the backend
        const data = await response.text();
        
        //Turning the string into a block of regular text
        const jsonObject = JSON.parse(data);
        const contentText = jsonObject.content;

        //Sending contentText to the backend to construct the strings we want
        const textResponse = await fetch(`http://13.51.207.83:5000/parseRecipeText?recipeText=${encodeURIComponent(contentText)}`);
        
        if (textResponse.ok) {
          //Taking the array from the backend and setting it to the ingredients div
          const parsedRecipeData = await textResponse.json();
          const linesIngredients = parsedRecipeData[0].split('\n');
          
          const formattedIngredients = linesIngredients.map((line, index) => (
            <div key={index}>{line}</div>
          ));
          //Sets the ingredients div to the resulting text
          setIngredients(formattedIngredients);

          const linesInstructions = parsedRecipeData[1].split('\n');
          // Mapping each line to a separate div element
          const formattedInstructions = linesInstructions.map((line, index) => (
            <div key={index}>{line}</div>
          ));
          //Sets the instructions div to the resulting text
          setInstructions(formattedInstructions);

        }
        

      } else {
        console.error('Issue in the backend');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      //Removes loading screen if the backend is finished processing
      setLoading(false);
    }
  };



  return (
    <div className="RecipeWrap">
    <div className={`Recipe ${loading ? 'blurred-content' : ''}`}>
        <h1 className="header1">Only the Recipe</h1>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            className="textBox"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter link..."
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                handleSendToBackend(); 
              }
            }}
          />
        </div>
      </div>
      <div className='ingredients'>
        {ingredients}
      </div>
      
      <div className='ingredients'>
        {instructions}
      </div>
      {loading && (
        <div className={`loading-overlay ${loading ? 'active' : ''}`}>
          <div className="loading-content">
            <ReactLoading className="load" type="spin" color="#68644a" height={50} width={50} />
            <p className="header1">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipe;
