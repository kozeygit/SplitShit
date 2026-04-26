import { Bill, BillItem, NewBill, NewBillItem } from "@/models/bill";
import { Price } from "@/utils/priceUtils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertBill, insertBillItem } from "./insertData";
import { File } from 'expo-file-system';

const systemPrompt = `

### Receipt Data Extraction System Prompt

You are a deterministic data extraction tool. Your only task is to parse raw text from receipts or bills and return a valid JSON object that strictly follows the schema below.

JSON Structure (STRICT)
You MUST return exactly this structure and nothing else:

{
  "name": "string",
  "date": "string (ISO 8601 Date/Time)",
  "userEnteredTotal": number,
  "serviceCharge": number,
  "complete": false,
  "items": [
    {
      "id": number,
      "name": "string",
      "price": number,
      "quantity": number,
      "totalPrice": number
    }
  ]
}

Global Rules

- Return ONLY the JSON object.
- Do NOT include any explanations, text, or markdown.
- All numeric fields MUST be valid JSON numbers (not strings).
- Never return null, undefined, or missing fields.
- Trim whitespace from all string values.
- Normalize text by removing obvious OCR artifacts where possible.

Extraction & Sanitization Rules

1. OCR Correction
- Correct common OCR errors:
  - "0" ↔ "O", "1" ↔ "I", "5.O0" → "5.00"
  - "200Z" or "20OZ" → "20oz"
  - "E10" → "10.00"

2. Restaurant Name (name)
- Extract the business/restaurant name.
- Prefer the most prominent or header-style text.
- Default: "New Bill"

3. Date (date)
- Extract the transaction date and time.
- Convert to ISO 8601 format (UTC): YYYY-MM-DDTHH:mm:ss.000Z
- If format is ambiguous, assume DD/MM/YYYY
- If time is missing, use "00:00:00.000Z"
- Default: "2023-10-27T18:30:00.000Z"

4. Total (userEnteredTotal)
- Extract the final payable amount.
- Prefer values labeled:
  - "Total"
  - "Grand Total"
  - "Amount Due"
- Use the largest final amount if multiple totals exist.
- Strip all currency symbols.
- Must be a number.

5. Service Charge (serviceCharge)
- Extract tips or service charges.
- If shown as a percentage (e.g., "10%"):
  - Calculate using subtotal
  - If subtotal is missing, use sum of item totalPrice
- If not present, return 0

6. Items (items)

Each item must follow:

- id: Sequential integer starting at 1
- name: Cleaned item name
- quantity:
  - Extract if present
  - Default: 1
- price:
  - Per-unit price
  - If missing: totalPrice / quantity
- totalPrice:
  - Total cost for that item line

7. Item Grouping
- Merge identical items ONLY if:
  - Same name
  - Same unit price
- Sum their quantities and totalPrice
- Do NOT merge if:
  - Different modifiers
  - Different prices
  - Different descriptions

8. Mathematical Validation
- Ensure: price × quantity = totalPrice
- If inconsistent:
  - Trust totalPrice
  - Recalculate price = totalPrice / quantity

9. Missing Price Fallback
- If BOTH price and totalPrice are missing:
  - Assign price = 10.00
  - Compute totalPrice = price × quantity
- Only apply this if the item clearly exists but lacks pricing

10. Currency Handling
- Remove all currency symbols (e.g., £, $, €)
- Assume all values use the same currency
- Output only numeric values

11. Complete Field
- Always set "complete": false

12. Final Total Validation
- Compute: sum of all item totalPrice values + serviceCharge
- Compare this sum to userEnteredTotal

- If they match: no action needed

- If they do NOT match:
  - Do NOT modify item prices or quantities
  - Check if the difference is consistent with a common tax rate (e.g., approximately 5%, 10%, or 20%) applied to the item subtotal
  - If such a tax is likely, assume the discrepancy is due to tax not listed in items

- If the discrepancy cannot be reasonably explained:
  - Prioritize userEnteredTotal as the correct final value
  - Leave item values unchanged

Failure Mode

If the input does NOT resemble a receipt or contains no extractable data, return:

{
  "name": "Unknown",
  "date": "2023-10-27T00:00:00.000Z",
  "userEnteredTotal": 0,
  "serviceCharge": 0,
  "complete": false,
  "items": []
}

Strict Output Constraints

- Output MUST be valid JSON
- Do NOT include:
  - Markdown
  - Code blocks
  - Comments
  - Extra fields
- Do NOT include the keys:
  - assignedTo
  - payers

Example Input

Pepsi 200Z @ £4.10, WOKINGHAM BELLE, 25/05/2025 16:14:58, Apple Crumble £7.29, Apple Crumble £7.29, Total: £18.68

Example Output

{
  "name": "WOKINGHAM BELLE",
  "date": "2025-05-25T16:14:58.000Z",
  "userEnteredTotal": 18.68,
  "serviceCharge": 0,
  "complete": false,
  "items": [
    {
      "id": 1,
      "name": "Pepsi 20oz",
      "price": 4.1,
      "quantity": 1,
      "totalPrice": 4.1
    },
    {
      "id": 2,
      "name": "Apple Crumble",
      "price": 7.29,
      "quantity": 2,
      "totalPrice": 14.58
    }
  ]
}

`
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: systemPrompt,
  generationConfig: {
    temperature: 0.1,
    responseMimeType: "application/json",
  },
});

const fileToGenerativePart = async (uri: string) => {
  const file = new File(uri);
  
  const base64Data = await file.base64();
  return {
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg",
    },
  };
};

export const createBillFromImage = async (uri: string): Promise<number> => {
  try {
    const imagePart = await fileToGenerativePart(uri);

    const result = await model.generateContent([
      imagePart,
      { text: "Extract the data from this receipt according to your instructions." }
    ]);

    const cleanJson = result.response.text().replace(/```json|```/gi, '').trim();
    const data = JSON.parse(cleanJson);

    const bill = verifyExtractedBill(data);
    if (typeof bill === "string") return -1;

    return await ingestBill(bill);
  } catch (error) {
    console.error("Error in Gemini Image Processing:", error);
    return -1;
  }
};

export const extractBillData = async (ocrText: string): Promise<any> => {

  try {
    const result = await model.generateContent(ocrText);
    const responseText = result.response.text().replace(/```json|```/gi, '').trim();
    
    console.log(responseText);

    return responseText ? JSON.parse(responseText) : undefined;
    
  } catch (error) {
    console.error("Error extracting receipt data:", error);
    return undefined;
  }
};

export const createBillFromJson = async (jsonString: string): Promise<number> => {
  try {
    const data = JSON.parse(jsonString);
    const bill = verifyExtractedBill(data);

    if (typeof bill === "string") {
      console.error("JSON Verification Error:", bill);
      return -1;
    }

    const newBillId = await ingestBill(bill);
    console.log("Successfully created bill from JSON. ID:", newBillId);
    return newBillId;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return -1;
  }
};

export const ingestBill = async (bill: Bill): Promise<number> => {
  // insert bill
  const newBill: NewBill = {
    name: bill.name,
    date: bill.date,
    serviceCharge: bill.serviceCharge,
    userEnteredTotal: bill.userEnteredTotal,
  };

  const newItems: NewBillItem[] = bill.items.map(
    (item, index) =>
      <NewBillItem>{
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        assignedTo: item.assignedTo,
      }
  );

  const newBillId = await insertBill(newBill);

  if (newBillId == -1) {
    console.log("Error in ingesting bill data:\n", newBill);
    return -1;
  }

  for (const newItem of newItems) {
    const newItemId = await insertBillItem(newItem, newBillId);
    if (newItemId == -1) {
      console.log("Error in ingesting item data:\n", newItem);
      return -1;
    }
  }

  return newBillId;
};

export const verifyExtractedBill = (extractedBill: any): Bill | string => {
  const requiredFields = [
    "name",
    "date",
    "userEnteredTotal",
    "serviceCharge",
    "complete",
    "items",
  ];
  const itemFields = ["id", "name", "price", "quantity", "totalPrice"];

  for (const field of requiredFields) {
    if (!(field in extractedBill)) {
      return `Missing required field: ${field}`;
    }
  }

  if (!Array.isArray(extractedBill.items)) {
    return "Items should be an array";
  }

  for (const item of extractedBill.items) {
    for (const field of itemFields) {
      if (!(field in item)) {
        return `Missing required field in items: ${field}`;
      }
    }
  }

  const parsedDate = new Date(extractedBill.date);
  const finalDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  try {
    const bill: Bill = {
      id: 0,
      name: extractedBill.name,
      date: finalDate,
      userEnteredTotal: Price.fromDecimal(extractedBill.userEnteredTotal),
      serviceCharge: Price.fromDecimal(extractedBill.serviceCharge ?? 0),
      complete: false,
      items: extractedBill.items.map(
        (item: any, index: number) =>
          <BillItem>{
            id: item.id,
            name: item.name,
            price: Price.fromDecimal(item.price),
            quantity: item.quantity,
            totalPrice: Price.fromDecimal(item.totalPrice),
            assignedTo: [],
          }
      ),
      payers: [],
    };
    return bill;
  } catch (error) {
    return `Error mapping to Bill model: ${error}`;
  }
};
