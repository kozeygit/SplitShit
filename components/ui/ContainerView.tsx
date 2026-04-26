import { View, StyleSheet, Text } from 'react-native'
import React, { ReactElement } from 'react'
import { Colors } from '@/constants/Colors'

const ContainerView = ({children}: {children?: ReactElement | (ReactElement | null)[]}) => {
  return (
      <View style={styles.container}>
        {children}
      </View>
  )
}

export default ContainerView

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    marginTop: 80,
    padding: 30,
    paddingBottom: 40,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
    flex: 1,
  },
})