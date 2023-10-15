require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

const chatCompletion = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": prompt }
      ]
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      let content = response.choices[0].message.content;
      console.log('Chat GPT response status:', response.status); // Displaying the response status
      return {
        status: 1,
        response: content
      };
    } else {
      console.error('Unexpected response structure:', response);
      return {
        status: 0,
        response: ''
      };
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('Chat GPT response status:', error.status); // Displaying the response status
      console.error(error.message);
      console.error(error.code);
      console.error(error.type);
    } else {
      console.error('Error in chatCompletion:', error);
    }
    return {
      status: 0,
      response: ''
    };
  }
};

module.exports = {
  chatCompletion
};
