const express = require("express");
const bodyParser = require("body-parser");
const { PinataSDK } = require("pinata-web3");
require("dotenv").config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require("cors"); // Import cors


const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.json());

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

// Middleware to check if JWT is available
const checkJwt = (req, res, next) => {
  if (!process.env.PINATA_JWT) {
    return res.status(500).json({ error: "Pinata JWT not configured." });
  }
  next();
};

app.post('/create-new-userfile', async (req, res) => {
  try {
    // Create an empty JSON object (or minimal content)
    
    const { publickey,  username, email, address } = req.body;

    const jsonData = {
      publickey: publickey,
      description: "This is a user file",
      username: username,
      email: email,
      address: address,
    };

    // Upload the empty JSON to Pinata
    const result = await pinata.upload.json(jsonData);

    res.json({
      success: true,
      message: 'Empty JSON uploaded and pinned successfully!',
      ipfsHash: result.IpfsHash
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading empty JSON file',
      error: error.message
    });
  }
});

// Function to fetch JSON from Pinata using CID
const fetchJsonFromPinata = async (cid) => {
  const url = "https://gateway.pinata.cloud/ipfs/" + cid;
  const response = await axios.get(url);
  console.log(response.data)
  return response.data;
};

app.post('/check-user', async (req, res) => {
  try {
    const { publickey } = req.body; // Assuming the public key is sent in the request body
    // console.log(req.body.json)
    // Fetch the JSON file from Pinata
    const jsonData = await fetchJsonFromPinata(process.env.CID_KEYPAIR);
    console.log(process.env.CID_KEYPAIR);
    console.log(jsonData);
    // Check if the JSON structure is as expected
    if (!jsonData.users || !Array.isArray(jsonData.users)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON structure from Pinata',
      });
    }

    // Check if any user object has a matching publickey
    const user = jsonData.users.find(user => user.publickey === publickey);

    if (user) {
      // User found, return the useraccountid
      res.json({
        success: true,
        userExists: true,
        message: 'User found',
        useraccountid: user.useraccountid, // Return the useraccountid
      });
    } else {
      // User not found
      res.json({
        success: true,
        userExists: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching or processing JSON from Pinata',
      error: error.message,
    });
  }
});


const uploadJsonToPinata = async (jsonData) => {
  const dataToUpload = {
    filename: "UserKeypair", // Add the filename as a property
    ...jsonData,
  };
  const result = await pinata.upload.json(dataToUpload);
  return result.IpfsHash;
};

app.post('/add-user', async (req, res) => {
  try {
    const { publickey, useraccountid } = req.body; // Expecting CID, publickey, and useraccountid in the request body

    // Fetch the existing JSON file from Pinata
    const jsonData = await fetchJsonFromPinata(process.env.CID_KEYPAIR);

    //   console.log(jsonData)
    // Check if the JSON structure is valid
    if (!jsonData.users || !Array.isArray(jsonData.users)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON structure from Pinata',
      });
    }

    // Add the new user to the users array
    jsonData.users.push({ publickey, useraccountid });
    // Upload the updated JSON back to Pinata
    const newCid = await uploadJsonToPinata(jsonData);
    const prevkeypair = process.env.CID_KEYPAIR;
    updateEnvVariable("CID_KEYPAIR", newCid);
    await pinata.unpin([prevkeypair]);
    res.json({
      success: true,
      message: 'User added successfully!',
      newCid, // Return the new CID for the updated JSON
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching or updating JSON from Pinata',
      error: error.message,
    });
  }
});
app.post('/updatekeypairfile', async (req, res) => {
  try {
    const jsonData = req.body; // Expecting CID, publickey, and useraccountid in the request body

    // Fetch the existing JSON file from Pinata
    // const jsonData = await fetchJsonFromPinata(process.env.CID_KEYPAIR);

      console.log(jsonData)
    // Check if the JSON structure is valid
    // if (!jsonData.users || !Array.isArray(jsonData.users)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid JSON structure from Pinata',
    //   });
    // }

 
    const newCid = await uploadJsonToPinata(jsonData);
    const prevkeypair = process.env.CID_KEYPAIR;
    updateEnvVariable("CID_KEYPAIR", newCid);
    await pinata.unpin([prevkeypair]);
    res.json({
      success: true,
      message: 'User added successfully!',
      newCid, // Return the new CID for the updated JSON
    });
    // res.json({
    //   success:true
    // })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching or updating JSON from Pinata',
      error: error.message,
    });
  }
});

app.post('/getuserbykey', async (req, res) => {
  const { publickey } = req.body;

  try {
    
    
    // let accountId = await getAccountIdByPublicKey(publickey);
    let accountId;
    try {
      // Fetch the existing JSON file from Pinata
      const jsonData = await fetchJsonFromPinata(process.env.CID_KEYPAIR);
      // console.log(jsonData)
      // Check if the JSON structure is valid
      if (!jsonData.users || !Array.isArray(jsonData.users)) {
        throw new Error('Invalid JSON structure from Pinata');
      }
  
      // Find the user with the matching public key
      const user = jsonData.users.find(user => user.publickey === publickey);
  
      // Return the user account ID if found, otherwise return null
      accountId = user ? user.useraccountid : null;
    } catch (error) {
      console.error('Error fetching user account ID:', error.message);
      throw error; // Rethrow the error for further handling if needed
    }

    if (accountId) {
      res.json({ success: true, accountId });
    } else {
      res.status(404).json({ success: false, message: 'Account ID not found for the given public key' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Route to retrieve a JSON file from IPFS using its hash
app.get("/get/:hash", checkJwt, async (req, res) => {
  try {
    const { hash } = req.params; // Get the IPFS hash from the URL parameter
    // console.log(hash);

    // Construct the IPFS gateway URL
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;

    // Fetch the file from the IPFS gateway
    const response = await axios.get(ipfsUrl);

    // console.log(response)
    // Ensure the content type is application/json
    if (response.headers['content-type'] !== 'application/json') {
      return res.status(400).json({ error: 'The retrieved file is not a JSON file.' });
    }

    // Send the JSON data as a response
    res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

const updateEnvVariable = (key, value) => {
  const envFilePath = path.join(__dirname, '.env');

  // Read the current .env file
  fs.readFile(envFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading .env file:', err);
      return;
    }

    // Update the variable
    const updatedData = data.split('\n').map(line => {
      if (line.startsWith(key)) {
        return `${key}=${value}`;
      }
      return line;
    }).join('\n');

    // Write the updated data back to the .env file
    fs.writeFile(envFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to .env file:', err);
      } else {
        console.log(`Updated ${key} to ${value} in .env file.`);
      }
    });
  });
};
// Start the server
app.listen(PORT, async () => {
  // updateEnvVariable("CID_KEYPAIR","QmehQtqCmwXwjLKU7axC2RaF716c5X4AY7XpkvQjMfhD83")
  //     const upload = await pinata.upload
  //   .json({
  //     name: "Pinnie NFT",
  //     description: " from Pinata",
  //     image: "ipfs://bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4"
  //   })
  //   .cidVersion(1)
  // console.log(await fetchJsonFromPinata(process.env.CID_KEYPAIR))
  console.log(`Server is running on http://localhost:${PORT}`);
});

