import React, { useState } from "react";
import {
    View,
    TextInput,
    Button,
    StyleSheet,
    Text,
    Platform,
    TouchableNativeFeedback,
    KeyboardAvoidingView,
    SafeAreaView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewBill } from "@/models/bill"; // Replace with your actual path
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

const billSchema = z.object({
    name: z.string().min(1, "Bill name is required"),
    userEnteredTotal: z
        .number({
            invalid_type_error: "Total price must be a number",
        })
        .positive("Total price must be positive"),
    date: z.date({
        invalid_type_error: "Date is required",
    }),
    serviceCharge: z
        .number({
            invalid_type_error: "Service charge must be a number",
        })
        .nonnegative("Service charge cannot be negative"),
});

export default function NewBillPage() {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<NewBill>({
        defaultValues: {
            name: "",
            userEnteredTotal: 0,
            date: new Date(),
            serviceCharge: 0,
        },
        resolver: zodResolver(billSchema),
    });

    const onSubmit = (data: NewBill) => console.log(data);

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChangeDate = (
        event: DateTimePickerEvent,
        selectedDate: Date | undefined
    ) => {
        if (selectedDate) {
            setShow(Platform.OS === "ios");
            setDate(selectedDate);
            setValue("date", selectedDate);
        } else if (Platform.OS === "ios") {
            setShow(false);
        }
    };

    const showDatepicker = () => {
        setShow(true);
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: "space-between",

                paddingBottom: 40,
                paddingTop: 80,
                paddingHorizontal: 20,
                backgroundColor: Colors.pastel.red,
            }}
        >
            <KeyboardAvoidingView style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    Add New Bill
                </ThemedText>
                {/* Bill Name Input */}
                <Text style={styles.label}>Bill Name</Text>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                errors.name ? styles.inputError : undefined,
                            ]}
                            placeholder="Bill Name"
                            onBlur={onBlur}
                            onChangeText={onChange} // Update form state on text change
                            value={value} // Bind the value to the form state
                        />
                    )}
                />
                {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                )}

                {/* Total Amount Input */}
                <Text style={styles.label}>Total Price</Text>
                <Controller
                    control={control}
                    name="userEnteredTotal"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                errors.userEnteredTotal
                                    ? styles.inputError
                                    : undefined,
                            ]}
                            placeholder="Total Amount"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={(text) => onChange(Number(text))} // Convert text to number
                            value={value.toString()} // Convert number to string for display
                        />
                    )}
                />
                {errors.userEnteredTotal && (
                    <Text style={styles.errorText}>
                        {errors.userEnteredTotal.message}
                    </Text>
                )}

                {/* Date Picker */}
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={"date"}
                        is24Hour={true}
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                {/* Display Selected Date */}
                <Text style={styles.label}>Date</Text>
                <TouchableNativeFeedback onPress={showDatepicker}>
                    <View
                        style={[
                            styles.input,
                            errors.date ? styles.inputError : undefined,
                        ]}
                    >
                        <Controller
                            control={control}
                            name="date"
                            render={({ field: { value } }) => (
                                <TextInput
                                    placeholder="Date (YYYY-MM-DD)"
                                    value={value.toLocaleDateString()} // Format date for display
                                    editable={false}
                                />
                            )}
                        />
                    </View>
                </TouchableNativeFeedback>
                {errors.date && (
                    <Text style={styles.errorText}>{errors.date.message}</Text>
                )}

                {/* Service Charge Input */}
                <Text style={styles.label}>Service Charge</Text>
                <Controller
                    control={control}
                    name="serviceCharge"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                errors.serviceCharge
                                    ? styles.inputError
                                    : undefined,
                            ]}
                            placeholder="Service Charge"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={(text) => onChange(Number(text))} // Convert text to number
                            value={value.toString()} // Convert number to string for display
                        />
                    )}
                />
                {errors.serviceCharge && (
                    <Text style={styles.errorText}>
                        {errors.serviceCharge.message}
                    </Text>
                )}
            </KeyboardAvoidingView>

            {/* Submit Button */}
                <View style={styles.submitButtonOuter}>
            <TouchableNativeFeedback onPress={handleSubmit(onSubmit)}>
                <View style={styles.submitButtonInner}>
                    <ThemedText
                        type="defaultSemiBold"
                        style={styles.submitText}
                    >
                        Submit
                    </ThemedText>
                </View>
            </TouchableNativeFeedback>
                </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        paddingVertical: 40,
        backgroundColor: "white",
        borderWidth: 2,
        borderRadius: 20,
        elevation: 5,
    },
    title: {
        paddingBottom: 20,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        paddingTop: 20,
        paddingBottom: 5,
    },
    input: {
        height: 50,
        borderBottomWidth: 1,
        borderColor: "gray",
        paddingHorizontal: 10,
        backgroundColor: "white",
        justifyContent: "center",
    },
    inputError: {
        borderColor: "red",
        marginBottom: 0,
    },
    submitButtonOuter: {
        height: 70,
        borderWidth: 2,
        backgroundColor: "white",
        borderRadius: 20,
        elevation: 5,
        overflow: "hidden"

    },
    submitButtonInner: {
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    submitText: {
        fontSize: 20,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
});
