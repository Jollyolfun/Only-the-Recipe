/*
Author: Cole Perry

Description: The backend of a webpage which takes a recipe webpage's URL
and extracts relevant information to the recipe. Uses OpenAI API requests
to achieve the extraction.

Date of last update: 12/28/2023
*/
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const cors = require('cors');
app.use(cors());

const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: 'included in deployment'
});


// The default port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




const bodyParser = require('body-parser');
app.use(bodyParser.json());
// Taking the link and scanning HTML content from it
app.get('/processLink', async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: 'Must enter a URL' });
    }

    //Gathering the HTML text content from the url's page
    const response = await axios.get(url);
    const webpageContent = response.data.toString();

    //Sending the HTML text content into cheerio to extract text
    const $ = cheerio.load(webpageContent);

    //Gathering text content of the website (that is, the text which
    //appears on the website when looking at a recipe)
    var textContent = $('body').text(); 

    //Recipes are typically included in the first 13,000 characters,
    //so we only gather the first 13,000 characters as to not overload
    //the API request with too long of a query
    const maxLength = 13000;
    if (textContent.length > maxLength) {
        textContent = textContent.substring(0, maxLength)
    }

    //Here is where we will send the textContent to the API along with a 
    //query prompt
    const parsedRecipe = await parseRecipe(textContent);
    
    res.send(parsedRecipe);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch webpage content' });
  }
});

/*
Purpose: Makes an API request to OpenAI API and returns the result
of the chat.

Parameters: textHTML - The HTML content of the webpage

Return: The result of the API request
*/
async function parseRecipe(textHTML) {
    
    const query = "Take this text and tell me the ingredients, amounts, and directions with no extra information. You must include a section named 'Ingredients' and a section named 'Directions' or else it won't be good: " + textHTML;
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "user", "content": query}],
      });
      console.log(chatCompletion.choices[0].message);
      return chatCompletion.choices[0].message;

}

/*
Purpose: Endpoint which handles the processing of the
recipe recieved from the OpenAI API. It turns the string
into an array of 3 parts: Index 0 will be the ingredients,
index 1 will be the directions, and index 2 will be the 
nutritional information should it be important.
*/
app.get('/parseRecipeText', async (req, res) => {
    //recipeText is the text block ChatGPT sends back.
    const recipeText = req.query.recipeText;

    let finalArray = [];
    //Index 1 is the ingredients, index 2 is instructions.
    //I'll want to split by \n as to split each different section of
    //ingredients or directions
    let midArray = recipeText.split('Ingredients:');
    let midArrayNext = midArray[1].split("Directions:");

    let ingredientsArray = midArrayNext[0].split('\n');
    let ingredientsString = '';

    //Iterating over ingredients and constructing string of ingredients
    //which will be formatted
    for (let i = 0; i < ingredientsArray.length; i++) {
        if (ingredientsArray[i] === '' || ingredientsArray[i] === 'Directions') {
            continue;
        }
        if (i == ingredientsArray.length-1) {
            break;
        }
        ingredientsString += ingredientsArray[i] + '\n';

        
    }
    finalArray.push(ingredientsString);
    
    //iterating over the directions and constructing a string of directions
    let instructionsArray = midArrayNext[1].split('\n');
    let instructionsString = '';

    for (let i = 0; i < instructionsArray.length; i++) {
        if (instructionsArray[i] === '') {
            continue;
        }
        else {
            instructionsString += instructionsArray[i] + '\n';
        }
    }
    finalArray.push(instructionsString);

    res.send(finalArray);
});
