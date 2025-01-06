import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Card from './Card';

const initializeDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  suits.forEach(suit => ranks.forEach(rank => deck.push({ rank, suit })));
  return deck;
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};

const getCardValue = (card) => ['J', 'Q', 'K'].includes(card.rank) ? 10 : card.rank === 'A' ? 11 : parseInt(card.rank, 10);

const calculateTotal = (hand) => {
  let total = 0;
  let aceCount = 0;
  hand.forEach(card => {
    total += getCardValue(card);
    if (card.rank === 'A') aceCount++;
  });
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
};

const HomePage = () => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [isGameActive, setIsGameActive] = useState(true);
  const [isDealerTurn, setIsDealerTurn] = useState(false);


  const resetGame = () => {
    const newDeck = initializeDeck();
    shuffleDeck(newDeck);
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setPlayerTotal(calculateTotal(playerCards));
    setDealerHand(dealerCards);
    setDealerTotal(calculateTotal(dealerCards));
    setMessage('');
    setIsGameActive(true);
    setIsDealerTurn(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (playerTotal > 21) {
      setMessage('BUST');
      setIsGameActive(false);
      setTimeout(() => {
        resetGame();
      }, 2000)
    } else if (playerTotal === 21) {
      setMessage('BLACKJACK');
      setIsGameActive(false);
      setTimeout(() => {
        resetGame();
      }, 2000)
    }
  }, [playerTotal]);

  const handleHit = () => {
    const newDeck = [...deck];
    const drawnCard = newDeck.pop();
    const updatedHand = [...playerHand, drawnCard];
    setDeck(newDeck);
    setPlayerHand(updatedHand);
    setPlayerTotal(calculateTotal(updatedHand));
  };

  const handleStand = () => {
    setMessage("Dealer's turn...");
    setIsGameActive(false);
    setIsDealerTurn(true);
  };

  useEffect(() => {
    if (isDealerTurn) {
      const interval = setInterval(() => {
        if (dealerTotal < 17) {
          const newDeck = [...deck];
          const drawnCard = newDeck.pop();
          const updatedHand = [...dealerHand, drawnCard];
          setDeck(newDeck);
          setDealerHand(updatedHand);
          setDealerTotal(calculateTotal(updatedHand));
        } else {
          clearInterval(interval);
          determineWinner();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isDealerTurn, dealerTotal]);

  const determineWinner = () => {
    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setMessage('Player Wins');
      setTimeout(() => {
        resetGame();
      }, 2000)
    } else if (playerTotal < dealerTotal) {
      setMessage('Dealer Wins');
      setTimeout(() => {
        resetGame();
      }, 2000)
    } else {
      setMessage('Tie');
      setTimeout(() => {
        resetGame();
      }, 2000)
    }
  };

  return (
    <View style={styles.container}>
      {/* Dealer's Hand */}
      <View style={styles.dealerHandContainer}>
        {dealerHand.map((card, index) => (
          <Card
            key={index}
            rank={isDealerTurn || index === 0 ? card.rank : ''}
            suit={isDealerTurn || index === 0 ? card.suit : ''}
          />
        ))}
      </View>
      {/* Player's Hand */}
      <View style={styles.playerHandContainer}>
        {playerHand.map((card, index) => (
          <Card key={index} rank={card.rank} suit={card.suit} />
        ))}
      </View>
      {/* Buttons */}
      {message && <Text style={styles.message}>{message}</Text>}
      <Pressable onPress={handleHit} style={[styles.hitButton, !isGameActive && styles.disabledButton]} disabled={!isGameActive}>
        <Text style={styles.buttonText}>Hit</Text>
      </Pressable>
      <Pressable onPress={handleStand} style={[styles.standButton, !isGameActive && styles.disabledButton]} disabled={!isGameActive}>
        <Text style={styles.buttonText}>Stand</Text>
      </Pressable>

      {/*Scores*/}
      <Text style={styles.playerScore}>{playerTotal}</Text>
      <Text style={styles.dealerScore}>{isDealerTurn ? dealerTotal : '???'}</Text>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerHandContainer: {
    position: 'absolute',
    bottom: 225,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dealerHandContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hitButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  standButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'black',
    fontSize: 22,
  },
  playerScore: {
    position: 'absolute',
    top: 30,
    left: 20,
    color: 'black',
    fontSize: 32,
  },
  dealerScore: {
    position: 'absolute',
    top: 30,
    right: 20,
    color: 'black',
    fontSize: 32,
  },
  message: {
    position: 'absolute',
    top: 375,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'blue',
  },
});