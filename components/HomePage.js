import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
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
  const [isGameActive, setIsGameActive] = useState(false);
  const [isDealerTurn, setIsDealerTurn] = useState(false);
  const [isBettingMode, setIsBettingMode] = useState(true);
  const [money, setMoney] = useState(2000); // Player's money
  const [betAmount, setBetAmount] = useState(0); // Current bet amount

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
      setIsGameActive(false);
      setIsDealerTurn(false);
      setIsBettingMode(true)
      setBetAmount(0);
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
        if(money <= 0) {
          setBetAmount(0);
          setIsGameActive(false);
          setIsBettingMode(false);
          setIsDealerTurn(false);
          setMessage('You\'re Bankrupt!');
        }
      }, 2000)

    } else if (playerTotal === 21) {
      setMessage('BLACKJACK');
      setMoney((betAmount * 2.5) + money);
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

  const handleBetChange = (value) => {
    if(value != '') {
      const bet = parseInt(value, 10);
      if (!isNaN(bet) && bet >= 1 && bet <= money) {
        setBetAmount(bet);
      }
    }
  };

  const handleBetSubmit = (value) => {
    if(betAmount > 0 && betAmount <= money) {
      setMoney(money - betAmount);
      setIsBettingMode(false);
      setIsGameActive(true);
    } else {
      setMessage('Invalid Bet Amount. Must be Between $1 and $' + money);
      setTimeout(() => {
        setMessage('');
      }, 2000)
    }
  }

  useEffect(() => {
    if (isDealerTurn) {
      const interval = setInterval(() => {
        // Adjust dealer's total if it exceeds 21
        if (dealerTotal < 17) {
          const newDeck = [...deck];
          const drawnCard = newDeck.pop();
          const updatedHand = [...dealerHand, drawnCard];
          const updatedTotal = calculateTotal(updatedHand); // Recalculate total
          setDeck(newDeck);
          setDealerHand(updatedHand);
          setDealerTotal(updatedTotal);
        }
        if (calculateTotal(dealerHand) >= 17) {
          clearInterval(interval);
          determineWinner();
        }
      }, 1000);
      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [isDealerTurn, dealerTotal]);

  const determineWinner = () => {
    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setMessage('Player Wins');
      setMoney((betAmount * 2) + money);
      setTimeout(() => {
        resetGame();
      }, 2000)
    } else if (playerTotal < dealerTotal) {
      setMessage('Dealer Wins');
      setTimeout(() => {
        resetGame();
        if(money <= 0) {
          setBetAmount(0);
          setIsGameActive(false);
          setIsBettingMode(false);
          setIsDealerTurn(false);
          setMessage('You\'re Bankrupt!');
        }
      }, 2000)
    } else {
      setMessage('Tie');
      setMoney(betAmount + money);
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
            rank={ (isDealerTurn || index === 0) && !isBettingMode && (isGameActive || isDealerTurn) ? card.rank : ''}
            suit={ (isDealerTurn || index === 0) && !isBettingMode && (isGameActive || isDealerTurn) ? card.suit : ''}
          />
        ))}
      </View>
      {/* Player's Hand */}
      <View style={styles.playerHandContainer}>
        {playerHand.map((card, index) => (
          <Card
            key={index}
            rank={ !isBettingMode && (isGameActive || isDealerTurn) ? card.rank : ''}
            suit={ !isBettingMode && (isGameActive || isDealerTurn) ? card.suit : ''}
          />
        ))}
      </View>
      {/* Buttons */}
      <Pressable onPress={handleHit} style={[styles.hitButton, !isGameActive && styles.disabledButton]} disabled={!isGameActive}>
        <Text style={styles.buttonText}>Hit</Text>
      </Pressable>
      <Pressable onPress={handleStand} style={[styles.standButton, !isGameActive && styles.disabledButton]} disabled={!isGameActive}>
        <Text style={styles.buttonText}>Stand</Text>
      </Pressable>
      <View style={styles.betContainer}>
        <Text style={styles.moneyText}>Money: ${money}</Text>
        <TextInput
          style={[styles.betInput, !isBettingMode && styles.disabledBetInput]} // Apply disabled style to the input if not in betting mode
          keyboardType="numeric"
          placeholder="Enter Bet Amount"
          onChangeText={handleBetChange}
          value={betAmount || ''} // Ensure the input can be empty
        />
        <Pressable
          onPress={handleBetSubmit}
          style={[styles.betButton, !isBettingMode && styles.disabledBet]} // Apply disabled style to the button if not in betting mode
          disabled={!isBettingMode} // Disable the button if not in betting mode
        >
          <Text style={styles.buttonText}>Place Bet</Text>
        </Pressable>
      </View>

      {/*Scores*/}
      <Text style={styles.playerScore}>{!isBettingMode && (money > 0 || betAmount > 0)? playerTotal : '???'}</Text>
      <Text style={styles.dealerScore}>{isDealerTurn ? dealerTotal : '???'}</Text>

      {/*Message*/}
      {message && <Text style={styles.message}>{message}</Text>}
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
    bottom: 75,
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
    bottom: 75,
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
  betContainer: {
    position: 'absolute',
    bottom: 65,
    alignItems: 'center',
  },
  moneyText: {
    fontSize: 24,
    marginBottom: 10,
  },
  betInput: {
    width: 250,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  betButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 8,
  },
  disabledBet: {
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 8,
  },
});