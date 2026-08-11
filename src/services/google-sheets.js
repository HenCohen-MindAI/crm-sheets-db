import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let sheetsClient = null;
let authClient = null;

export async function initializeGoogleSheets() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '../../credentials.json');

  try {
    const key = JSON.parse(readFileSync(keyPath, 'utf8'));
    authClient = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    console.log('✅ Google Sheets API authenticated');
  } catch (error) {
    console.warn('⚠️  Google Sheets not configured yet');
    console.warn('   Create credentials.json from Google Cloud Console');
  }
}

export async function getSheets() {
  if (!sheetsClient) {
    throw new Error('Google Sheets not initialized');
  }
  return sheetsClient;
}

export async function readRange(spreadsheetId, range) {
  if (!sheetsClient) return { values: [] };

  try {
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data;
  } catch (error) {
    console.error('Error reading sheet:', error.message);
    throw error;
  }
}

export async function appendRows(spreadsheetId, range, values) {
  if (!sheetsClient) return null;

  try {
    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    return response.data;
  } catch (error) {
    console.error('Error appending rows:', error.message);
    throw error;
  }
}

export async function updateRange(spreadsheetId, range, values) {
  if (!sheetsClient) return null;

  try {
    const response = await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating range:', error.message);
    throw error;
  }
}

export async function clearRange(spreadsheetId, range) {
  if (!sheetsClient) return null;

  try {
    const response = await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing range:', error.message);
    throw error;
  }
}
