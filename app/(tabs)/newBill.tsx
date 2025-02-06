import React from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableNativeFeedback,
    TextInput,
} from "react-native";
import { Bill, NewBill } from "@/models/bill";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define your validation schema using Yup
const billSchema = yup.object().shape({
    name: yup.string().required("Bill name is required"),
    userEnteredTotal: yup
        .number()
        .typeError("Total amount must be a number")
        .required("Total amount is required")
        .positive("Total amount must be positive"),
    date: yup.date().required("Date is required"), // You might want a better date validation
    serviceCharge: yup
        .number()
        .typeError("Service charge must be a number")
        .required("Service charge is required")
        .positive("Service charge must be positive"),
    complete: yup.boolean().required(), // No required validation for boolean field
});

export default function BillCreationPage({ navigation }: { navigation: any }) {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
    } = useForm<NewBill>({
        defaultValues: {
            name: "",
            userEnteredTotal: 0,
            date: new Date("2025-01-01"),
            serviceCharge: 0,
            complete: false,
        },
        resolver: yupResolver(billSchema),
    });

    const handleCreateBill = async (bill: NewBill) => {
        console.log(bill);
        navigation.goBack(); // Navigate back after creating the bill
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingHorizontal: 10,
                backgroundColor: Colors.pastel.red,
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View>
                    <Image
                        source={require("@/assets/images/logo.png")}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText type="default">Bill Name:</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            errors.name ? styles.inputError : null,
                        ]}
                        placeholder="Enter bill name"
                        {...control.getFieldProps("name")}
                    />
                    {errors.name && (
                        <ThemedText style={styles.errorText}>
                            {errors.name.message}
                        </ThemedText>
                    )}

                    <ThemedText type="default">Total Amount:</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            errors.userEnteredTotal ? styles.inputError : null,
                        ]}
                        placeholder="Enter total amount"
                        {...control.getFieldProps("userEnteredTotal")}
                        keyboardType="numeric"
                    />
                    {errors.userEnteredTotal && (
                        <ThemedText style={styles.errorText}>
                            {errors.userEnteredTotal.message}
                        </ThemedText>
                    )}

                    <ThemedText type="default">Date:</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            errors.date ? styles.inputError : null,
                        ]}
                        placeholder="YYYY-MM-DD"
                        {...control.getFieldProps("date")}
                    />
                    {errors.date && (
                        <ThemedText style={styles.errorText}>
                            {errors.date.message}
                        </ThemedText>
                    )}

                    <ThemedText type="default">Service Charge:</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            errors.serviceCharge ? styles.inputError : null,
                        ]}
                        placeholder="Enter service charge"
                        {...control.getFieldProps("serviceCharge")}
                        keyboardType="numeric"
                    />
                    {errors.serviceCharge && (
                        <ThemedText style={styles.errorText}>
                            {errors.serviceCharge.message}
                        </ThemedText>
                    )}

                    {/* Complete Checkbox */}
                    <View style={styles.completeContainer}>
                        <ThemedText type="default">Complete:</ThemedText>
                        <TouchableNativeFeedback
                            onPress={() =>
                                setValue("complete", !getValues("complete"))
                            }
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    getValues("complete")
                                        ? styles.checkboxActive
                                        : null,
                                ]}
                            />
                        </TouchableNativeFeedback>
                    </View>
                </View>

                <ThemedView style={styles.createButtonOuter}>
                    <TouchableNativeFeedback
                        onPress={handleSubmit(handleCreateBill)}
                    >
                        <ThemedView style={styles.createButtonInner}>
                            <ThemedText type="defaultSemiBold">
                                Create Bill
                            </ThemedText>
                        </ThemedView>
                    </TouchableNativeFeedback>
                </ThemedView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    logo: {
        marginTop: 60,
        marginBottom: 30,
        width: "100%",
        resizeMode: "contain",
        height: 120,
    },
    inputContainer: {
        margin: 20,
    },
    input: {
        backgroundColor: "white",
        borderWidth: 2,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    inputError: {
        borderColor: "red",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
    createButtonOuter: {
        marginTop: 20,
        marginHorizontal: 20,
        borderWidth: 2,
        borderRadius: 50,
        elevation: 5,
        overflow: "hidden",
    },
    createButtonInner: {
        flexDirection: "row",
        gap: 10,
        borderRadius: 50,
        padding: 10,
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    createButtonIcon: {
        backgroundColor: Colors.pastel.blue,
        borderRadius: 50,
        borderWidth: 2,
        padding: 8,
    },
    completeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 3,
        marginLeft: 10,
    },
    checkboxActive: {
        backgroundColor: Colors.pastel.blue,
    },
});
