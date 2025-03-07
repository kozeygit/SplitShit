import { payers } from "@/db/schema";
import { Bill, BillItem, NewBill, NewBillItem } from "@/models/bill";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertBill, insertBillItem } from "./insertData";
import MlkitOcr from "react-native-mlkit-ocr";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
  generationConfig: {
    temperature: 0.1,
    responseMimeType: "application/json",
  },
});

const systemPrompt = `
You are an expert data extraction tool. Your sole task is to parse raw text extracted from receipts and bills and return the information as a JSON object. You MUST ONLY return a valid JSON object, and nothing else. Absolutely no additional text, explanations, markdown code blocks, or any other characters are allowed outside of the JSON.

This is the strict structure of the JSON object you must return:

{
  "name": "string",
  "date": "string (ISO 8601 Date/Time)",
  "userEnteredTotal": "number",
  "serviceCharge": "number",
  "complete": "boolean",
  "items": [
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "totalPrice": "number"
    },
    "..." // More items
  ]
}

Here is and example with data:
{
  "name": "Restaurant Bill",
  "date": "2023-10-27T18:30:00.000Z",
  "userEnteredTotal": 100.00,
  "serviceCharge": 10.00,
  "complete": false,
  "items": [
    {
      "id": 1,
      "name": "Pizza",
      "price": 15.00,
      "quantity": 2,
      "totalPrice": 30.00
    },
    {
      "id": 2,
      "name": "Salad",
      "price": 8.00,
      "quantity": 1,
      "totalPrice": 8.00
    },
    {
      "id": 3,
      "name": "Drinks",
      "price": 5.00,
      "quantity": 4,
      "totalPrice": 20.00
    }
  ]
}

Here are the rules to follow:

* 'name': Extract the name of the restaurant from the bill, or use 'New Bill' as default.
* 'date': Extract the seating date and format it as (ISO 8601 Date/Time), if no data is present on the bill, use "2023-10-27T18:30:00.000Z" as default.
* 'userEnteredTotal': Extract the final total amount of the bill.
* 'serviceCharge': this is the service charge / tip. This should always be in monetary value. If the service charge is given as 'X%', calculate the decimal value and use that as the monetary value.
* 'complete': This should always be false
* 'items': Extract a list of purchased items, including description, quantity, and price. If quantity is not present, default to 1.
    ** 'id': this should just be the index of the item in the bill you return
    ** 'name': This is the name of the item
    ** 'price': Extract the per unit price of each item, if there is none, calculate from the totalPrice and quantity
    ** 'totalPrice': Extract the total price for the items, e.g. 4x milkshake at 2.00 each, total price = 8.00
* Do not include the keys 'assignedToId' or 'payers' in the returned JSON.

If any field cannot be extracted, or if the LLM cannot parse a monetary value, set its value to null.

Your output MUST be a valid JSON object, and nothing else.
`;

export const createBillFromImage2 = async (uri: string): Promise<number> => {
  const resultFromUri = await MlkitOcr.detectFromUri(uri);

  const text = resultFromUri?.map((block) => block.text).toString() || "";

  if (text.length < 10) return -1;

  console.log(uri)
  console.log(text)

  return -1

}

export const createBillFromImage = async (uri: string): Promise<number> => {
  const resultFromUri = await MlkitOcr.detectFromUri(uri);

  const text = resultFromUri?.map((block) => block.text).toString() || "";

  if (text.length < 10) return -1;

  const out = await extractBillData(text);
  if (out == undefined) {
    return -1;
  }

  const bill = verifyExtractedBill(out);
  if (typeof bill === "string" || bill instanceof String)
    return -1

  const newBillId = await ingestBill(bill);
  console.log(newBillId);
  
  return newBillId;
};

export const extractBillData = async (ocrText: string): Promise<any> => {
  const prompt = `Here is the raw text to parse:\n\n${ocrText}`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n${prompt}`);
    const responseText = result.response.text();
    console.log(responseText);

    if (responseText) {
      return JSON.parse(responseText);
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error extracting receipt data:", error);
    return undefined;
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
        assignedToId: item.assignedToId,
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

  try {
    const bill: Bill = {
      id: 0,
      name: extractedBill.name,
      date: new Date(extractedBill.date),
      userEnteredTotal: extractedBill.userEnteredTotal,
      serviceCharge: extractedBill.serviceCharge ?? 0,
      complete: false,
      items: extractedBill.items.map(
        (item: any, index: number) =>
          <BillItem>{
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            assignedToId: [],
          }
      ),
      payers: [],
    };
    return bill;
  } catch (error) {
    return `Error mapping to Bill model: ${error}`;
  }
};
