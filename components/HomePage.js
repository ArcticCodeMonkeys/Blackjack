import {useState} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";

const HomePage = () => {
  const [email, setEmail] = useState('johndoe@email.com');

  const testFunction = (param1) => {
    console.log('Carter', email);
  }
  const testFunction2 = (param1) => {
    setEmail("other@email.com");
    console.log('Carter2', email);
  }


  return (
    <View>
      <Pressable onPress={testFunction}>
        <Text style={styles.test}>testButton</Text>
      </Pressable>
      <Pressable onPress={testFunction2}>
        <Text style={styles.test}>testButton2</Text>
      </Pressable>
    </View>
  );
}

export default HomePage;

const styles = StyleSheet.create({
  test: {
    color: 'red',
  }
});