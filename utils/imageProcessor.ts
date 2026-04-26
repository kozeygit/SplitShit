import { createBillFromImage as geminiProcessor } from "./createBillFromImage";
// import { createBillFromImage as localProcessor } from "./localOcrProcessor";

const USE_CLOUD = true; // Toggle this to swap logic globally

export const processReceipt = async (uri: string) => {
  if (USE_CLOUD) {
    return await geminiProcessor(uri);
  } else {
    // return await localProcessor(uri);
    throw new Error("Local OCR not implemented yet");
  }
};