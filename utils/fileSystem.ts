import { File, Directory, Paths } from "expo-file-system";

const receiptImagesDir = new Directory(Paths.document, "receipt-images");

/**
 * Copies a temporary image URI (from camera or gallery) to permanent
 * app storage. Returns the permanent path to store in the DB.
 *
 * @param tempUri - The temporary URI returned by the image picker
 * @param billId  - The bill ID, used to name the file uniquely
 */
export const saveReceiptImage = async (
    tempUri: string,
    billId: number,
): Promise<string> => {
    if (!receiptImagesDir.exists) {
        receiptImagesDir.create();
    }

    const timeStamp = new Date().getTime();
    const dest = new File(receiptImagesDir, `${billId}-${timeStamp}.jpg`);
    const src = new File(tempUri);
    src.move(dest);

    return dest.uri;
};

/**
 * Deletes the receipt image for a given bill, if it exists.
 * Call this when deleting a bill to avoid orphaned files.
 *
 * @param imagePath - The URI stored in the DB (as returned by saveReceiptImage)
 */
export const deleteReceiptImage = (imagePath: string): void => {
    const file = new File(imagePath);
    if (file.exists) {
        file.delete();
    }
};
