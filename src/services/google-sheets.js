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

// One spreadsheet file, separate tabs per entity - created automatically on connect
export const LEADS_TASKS_SCHEMA = [
  {
    title: 'לידים',
    headers: ['ID', 'שם פרטי', 'שם משפחה', 'אימייל', 'טלפון', 'חברה', 'Pipeline', 'שלב', 'סטטוס', 'נוצר בתאריך']
  },
  {
    title: 'משימות',
    headers: ['ID', 'כותרת', 'תיאור', 'לקוח', 'עדיפות', 'סטטוס', 'תאריך יעד', 'הושלם בתאריך', 'נוצר בתאריך']
  }
];

export async function ensureSheetsStructure(spreadsheetId, schema) {
  if (!sheetsClient) {
    throw new Error('Google Sheets not initialized - upload credentials.json first');
  }

  const meta = await sheetsClient.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set((meta.data.sheets || []).map(s => s.properties.title));
  const missing = schema.filter(s => !existingTitles.has(s.title));

  if (missing.length > 0) {
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: missing.map(s => ({ addSheet: { properties: { title: s.title } } }))
      }
    });
  }

  for (const sheet of schema) {
    const range = `${sheet.title}!A1:${String.fromCharCode(64 + sheet.headers.length)}1`;
    const headerRow = await readRange(spreadsheetId, range);
    const hasHeaders = headerRow.values?.[0]?.length > 0;
    if (!hasHeaders) {
      await updateRange(spreadsheetId, range, [sheet.headers]);
    }
  }

  return true;
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
