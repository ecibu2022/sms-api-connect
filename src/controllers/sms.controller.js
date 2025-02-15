const fs = require("fs");
const path = require("path");
const AsyncHandler = require("../utils/AsyncHandler.js");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const APIResponse = require("../utils/APIResponse.js");
const APIError = require("../utils/APIError.js");

// Global variables
let apiKey;
let url;

// Decrypt function
function decrypt(cipherText, key) {
    try {
        // Decrypt the ciphertext using AES
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        if (bytes.sigBytes > 0) {
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return decryptedData;
        }
    } catch (error) {
        throw new APIError(500, error.message);
    }
}

// Config
const serveConfig = AsyncHandler(async (Request, Response) => { 
    Response.send('SMS API Configuration');
});

// Send POST request
const postMessage = AsyncHandler(async (Request, Response) => {
    try {
        // Connect to the path for ProgramData
        const configPath = path.join("C:", "ProgramData", "sms-api-connect", "config", "config.txt");

        console.log('Config: ', configPath);

        // Read the file path
        const fileContent = fs.readFileSync(configPath, "utf-8");
        // Decrypt
        const plainText = decrypt(fileContent, "secretKey");

        console.log('Decryted Config: ', plainText);

        // Parse the content (assuming it's JSON)
        const data = JSON.parse(plainText);

        console.log('JSON Config: ', data);

        // Extract apiKey and url from the config
        apiKey = data.apiKey;
        url = data.url;

        console.log('API Key: ', apiKey);
        console.log('URL: ', url);

    } catch (error) {
        throw new APIError(500, error.message);
    }

    // Request parameters
    const { to, message } = Request.body;

    try {
        const response = await axios.post(url, {
            messages: [
                {
                    from: 'InfoSMS',
                    destinations: [
                        {
                            to: to
                        }
                    ],
                    text: message
                }
            ]
        },
        {
            headers: {
                'Authorization': `App ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return Response.status(201).json(
            new APIResponse(200, response.data, "Message has been sent successfully", true)
        );
        
    } catch (error) {
        // throw new APIError(500, error.message);
        console.log('FAILED ', error)
    }
});

module.exports = { serveConfig, postMessage };
