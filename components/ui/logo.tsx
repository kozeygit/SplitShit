import { StyleSheet, Image } from "react-native";
import React from "react";

const Logo = () => {
    return (
        <Image
            source={require("@/assets/images/logo.png")}
            resizeMode="contain"
            style={styles.logo}
        />
    );
};

export default Logo;

const styles = StyleSheet.create({
    logo: {
        marginTop: 40,
        marginBottom: 10,
        width: "100%",
        resizeMode: "contain",
        height: 120,
    },
});
