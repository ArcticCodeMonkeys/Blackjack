import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ suit, rank }) => {
  // Determine the text color based on the suit
  const suitStyle = suit === 'Hearts' || suit === 'Diamonds' ? styles.redSuit : styles.blackSuit;
  return (
    <View style={styles.card}>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={[styles.suit, suitStyle]}>{suit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 120,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  suit: {
    fontSize: 16,
  },
  redSuit: {
    color: 'red', // Red for hearts and diamonds
  },
  blackSuit: {
    color: 'black', // Black for spades and clubs
  },
});

export default Card;