import { Text, type TextProps, StyleSheet } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "grital"
    | "darkGrital"
    | "grey"
    | "darkgrey";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = lightColor;

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "grital" ? styles.grital : undefined,
        type === "darkGrital" ? styles.darkGrital : undefined,
        type === "grey" ? styles.grey : undefined,
        type === "darkgrey" ? styles.darkgrey : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  darkgrey: {
    fontSize: 16,
    lineHeight: 24,
    color: "darkgrey",
  },
  grey: {
    fontSize: 16,
    lineHeight: 24,
    color: "lightgrey",
  },
  grital: {
    fontSize: 16,
    lineHeight: 24,
    color: "lightgrey",
    fontStyle: "italic",
  },
  darkGrital: {
    fontSize: 16,
    lineHeight: 24,
    color: "darkgrey",
    fontStyle: "italic",
  },
});
