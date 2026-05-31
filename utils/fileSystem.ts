import { File, Directory, Paths } from "expo-file-system";

const receiptImagesDir = new Directory(Paths.document, "receipt-images");
const payerImagesDir = new Directory(Paths.document, "payer-images");
const groupImagesDir = new Directory(Paths.document, "group-images");

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

export const deleteReceiptImage = (imagePath: string): void => {
    const file = new File(imagePath);
    if (file.exists) {
        file.delete();
    }
};

export const savePayerImage = async (
    tempUri: string,
    payerId: number,
): Promise<string> => {
    if (!payerImagesDir.exists) {
        payerImagesDir.create();
    }

    const timeStamp = new Date().getTime();
    const dest = new File(payerImagesDir, `${payerId}-${timeStamp}.jpg`);
    const src = new File(tempUri);
    src.move(dest);

    return dest.uri;
};

export const deletePayerImage = (imagePath: string): void => {
    const file = new File(imagePath);
    if (file.exists) {
        file.delete();
    }
};

export const saveGroupImage = async (
    tempUri: string,
    groupId: number,
): Promise<string> => {
    if (!groupImagesDir.exists) {
        groupImagesDir.create();
    }

    const timeStamp = new Date().getTime();
    const dest = new File(groupImagesDir, `${groupId}-${timeStamp}.jpg`);
    const src = new File(tempUri);
    src.move(dest);

    return dest.uri;
};

export const deleteGroupImage = (imagePath: string): void => {
    const file = new File(imagePath);
    if (file.exists) {
        file.delete();
    }
};
