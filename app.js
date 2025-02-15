"use strict";
const express = require("express");
const cookieParser = require("cookie-parser");
const serveConfig = require("./src/routes/sms.route.js");
const postMessage = require("./src/routes/sms.route.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PromptSync = require("prompt-sync");
const cryptoJS = require("crypto-js");
const APIError = require("./src/utils/APIError.js");

// Initialize express app
const app = express();

// Port
const PORT = 8800;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
// Use the route for getting config
app.use("/", serveConfig);
app.use("/send-sms", postMessage);

// Global variables
let apiKey;
let url;
let apiKeyFilePath;

// Perform Encryption
function encrypt(data, key) {
  return cryptoJS.AES.encrypt(data, key).toString();
}

// Initialize prompt-sync for user input
const prompt = PromptSync({ sigint: true });

// Function to ensure valid API key file
const getApiKeyFile = () => {
  let apiKeyFilePath;
  while (true) {
    apiKeyFilePath = prompt("Enter the path for API key: ").trim();
    // Remove extra quotes around path if they exist
    apiKeyFilePath = apiKeyFilePath.replace(/^['"]+|['"]+$/g, "");
    // Check if file exists
    if (!apiKeyFilePath) {
      continue;
    }
    try {
      apiKey = fs.readFileSync(apiKeyFilePath, "utf-8");
      break;
    } catch (err) {
      throw new APIError(500, err.message);
    }
  }
};

// Function to ensure valid URL input
const geturl = () => {
  while (true) {
    url = prompt("Enter API URL: ").trim();
    if (!url) {
      continue;
    }
    break;
  }
};

const setupConfiguration = async () => {
  // Get the API key file and URL
  getApiKeyFile();
  geturl();

  const config = { apiKey: apiKey, url: url };

  // For Production
  // Windows allows read and write to ProgramData after bundling your app with PKG
  // C:\ProgramData\sms-api-connect
  const configFilePath = path.join(
    "C:",
    "ProgramData",
    "sms-api-connect",
    "config",
    "config.txt"
  );

  // Ensure the config directory exists before writing the file
  const configDirectory = path.dirname(configFilePath);
  if (!fs.existsSync(configDirectory)) {
    // Create the directory recursively if it doesn't exist
    fs.mkdirSync(configDirectory, {
      recursive: true,
    });
  }

  // Encrypt and write the config data to the file
  try {
    fs.writeFileSync(
      configFilePath,
      encrypt(JSON.stringify(config), "secretKey")
    );
  } catch (err) {
    throw new APIError(500, err.message);
  }
};

const startServer = async () => {
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Check command line arguments
if (process.argv.includes("--config")) {
  setupConfiguration();
} else {
  startServer();
}
