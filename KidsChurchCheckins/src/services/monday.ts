import axios from "axios";

/**
 * Placeholder Monday.com integration helper.
 * In production replace with full API client and proper error handling.
 */

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;

export async function uploadBackupToMonday(filePath: string, fileName?: string) {
  if (!MONDAY_API_KEY) {
    throw new Error("MONDAY_API_KEY not configured");
  }

  // This is a placeholder: Monday.com file uploads require the file to be multipart POSTed
  // to the correct endpoint tied to an item/board. Here we just log and return a fake URL.
  console.log("Uploading backup to Monday.com (stub)", { filePath, fileName });
  // Example axios call shape (replace URL and form data for real usage)
  // const resp = await axios.post('https://api.monday.com/v2/file', formData, { headers: {...} });

  return {
    success: true,
    message: "stub: backup recorded (implement Monday.com file upload)",
    url: `https://monday.com/fake-backup/${fileName || 'backup'}`
  };
}