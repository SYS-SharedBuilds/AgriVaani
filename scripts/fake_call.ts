import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000';

async function runFakeCall() {
  console.log("=== AgriVaani Fake Call E2E Test ===");
  
  try {
    // 1. Inbound Call
    console.log("1. Simulating inbound call from farmer (9876543210)...");
    const inboundRes = await axios.post(`${API_URL}/v1/voice/inbound`, {
      From: '+919876543210'
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log("Inbound TwiML Response:");
    console.log(inboundRes.data);

    // Extract sessionId from the Gather action URL
    const match = inboundRes.data.match(/sessionId=([^&]+)/);
    if (!match) throw new Error("No session ID found in TwiML");
    const sessionId = match[1];

    console.log(`\n2. Extracted Session ID: ${sessionId}`);

    // 2. Farmer presses '2' for recommendation
    console.log("3. Simulating farmer pressing '2'...");
    const gatherRes = await axios.post(`${API_URL}/v1/voice/gather?sessionId=${sessionId}&lang=hi`, {
      Digits: '2'
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log("Gather TwiML Response:");
    console.log(gatherRes.data);

    console.log("\nFake call test completed successfully.");
  } catch (error: any) {
    console.error("Test failed:", error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

runFakeCall();
