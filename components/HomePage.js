import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import Card from './Card'; // Custom Card component for rendering playing cards

// Function to initialize a new deck of cards
const initializeDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']; // Four card suits
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; // Card ranks
  const deck = [];
  suits.forEach(suit => ranks.forEach(rank => deck.push({ rank, suit }))); // Create a card for every suit and rank combination
  return deck;
};

// Function to shuffle the deck
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap cards
  }
};

// Function to get the value of a card
const getCardValue = (card) =>
  ['J', 'Q', 'K'].includes(card.rank) ? 10 : card.rank === 'A' ? 11 : parseInt(card.rank, 10);

// Function to calculate the total value of a hand
const calculateTotal = (hand) => {
  let total = 0;
  let aceCount = 0; // Count of Aces in the hand
  hand.forEach(card => {
    total += getCardValue(card);
    if (card.rank === 'A') aceCount++; // Track Aces for adjustments
  });
  // Adjust Ace values from 11 to 1 if total exceeds 21
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
};

// Main component for the game
const HomePage = () => {
  // State variables
  const [deck, setDeck] = useState([]); // The deck of cards
  const [playerHand, setPlayerHand] = useState([]); // Player's hand
  const [playerTotal, setPlayerTotal] = useState(0); // Player's total score
  const [dealerHand, setDealerHand] = useState([]); // Dealer's hand
  const [dealerTotal, setDealerTotal] = useState(0); // Dealer's total score
  const [message, setMessage] = useState(''); // Message to display
  const [isGameActive, setIsGameActive] = useState(false); // Player's Turn
  const [isDealerTurn, setIsDealerTurn] = useState(false); // Dealer's Turn
  const [isBettingMode, setIsBettingMode] = useState(true); // Betting Round
  const [money, setMoney] = useState(2000); // Player's Balance
  const [betAmount, setBetAmount] = useState(0); // Current bet amount
  const [isSplit, setIsSplit] = useState(false); // Track if the player has chosen to split
  const [splitHand, setSplitHand] = useState([]); // The second hand after splitting
  const [splitTotal, setSplitTotal] = useState(0); // Total value of the second hand
  const [currentHand, setCurrentHand] = useState(1); // Track which hand the player is playing (1 or 2)
  const [splitBet, setSplitBet] = useState(0); // Bet amount for the second hand
  const [showSplitOptions, setShowSplitOptions] = useState(false); // Show Yes/No buttons for split option
  const [disableButtons, setDisableButtons] = useState(false);
  const [allowedBusts, setAllowedBusts] = useState(1);

  // Function to reset game for a new round
  const resetGame = () => {
    const newDeck = initializeDeck(); // Create a new deck
    shuffleDeck(newDeck); // Shuffle the deck
    const playerCards = [newDeck.pop(), newDeck.pop()]; // Deal two cards to the player
    const dealerCards = [newDeck.pop(), newDeck.pop()]; // Deal two cards to the dealer
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setPlayerTotal(calculateTotal(playerCards));
    setDealerHand(dealerCards);
    setDealerTotal(calculateTotal(dealerCards));
    setSplitHand([]);
    setSplitTotal(0);
    setIsSplit(false);
    setCurrentHand(1);
    setSplitBet(0);
    setMessage(''); // Clear any previous messages
    setIsGameActive(false);
    setIsDealerTurn(false);
    setIsBettingMode(true); // Reset to betting mode
    setBetAmount(0); // Reset the bet amount
    setDisableButtons(false);
    setAllowedBusts(1);
  };

  // Initialize the game state
  useEffect(() => {
    resetGame();
  }, []);

  // React to changes in the player's total
  useEffect(() => {
    const currentTotal = currentHand === 1 ? playerTotal : splitTotal;

    if (isGameActive && currentTotal >= 21) {
      //Handle Message and Payout
      if(currentTotal === 21) {
        setMessage('BLACKJACK');
        setMoney(money + (2.5 * betAmount));
      } else {
        setMessage('BUST');
      }

      //Disable the buttons
      setDisableButtons(true);
      if(isSplit) {
        setIsGameActive(false);
      }
      //Move to next hand / dealers turn if splitting
      setTimeout(() => {
        if (isSplit && currentHand === 1) {
          // Move to second hand if split
          setCurrentHand(2);
          setMessage('Playing second hand');
          setIsGameActive(true); // Resume game for second hand
          setDisableButtons(false);
        } else if(!isSplit) {
          resetGame();
        } else {
          // Otherwise, end turn
          setIsDealerTurn(true);
          setMessage("Dealer's turn...");
        }
      }, 2000
);
    }
  }, [playerTotal, splitTotal, currentHand, isGameActive]);

  // Handle "Hit" button logic
  const handleHit = () => {
    const newDeck = [...deck];
    const drawnCard = newDeck.pop();
    setDeck(newDeck);

    if (isSplit && currentHand === 2) {
      // Update the split hand
      const updatedSplitHand = [...splitHand, drawnCard];
      setSplitHand(updatedSplitHand);
      setSplitTotal(calculateTotal(updatedSplitHand));
    } else {
      // Update the main hand
      const updatedHand = [...playerHand, drawnCard];
      setPlayerHand(updatedHand);
      setPlayerTotal(calculateTotal(updatedHand));
    }
  };

  // Handle "Stand" button logic
  const handleStand = () => {
    if (isSplit && currentHand === 1) {
      // Move to the second hand if split
      setCurrentHand(2);
      setMessage('Playing second hand');
    } else {
      // End the player's turn and start the dealer's turn
      setIsDealerTurn(true);
      setMessage("Dealer's turn...");
    }
  };

  useEffect(() => {
    if (!isBettingMode && playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank && !isSplit) {
      setMessage('Split?');
      setShowSplitOptions(true); // Show the split options
    }
  }, [playerHand, isBettingMode]);

  const handleSplit = () => {
    if (playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank) {

      const firstCard = playerHand[0];
      const secondCard = playerHand[1];
      const newDeck = [...deck];

      // Deal a new card to each hand
      const newCardForFirstHand = newDeck.pop();
      const newCardForSecondHand = newDeck.pop();

      // Set up hands and bets
      setPlayerHand([firstCard, newCardForFirstHand]);
      setSplitHand([secondCard, newCardForSecondHand]);
      setPlayerTotal(calculateTotal([firstCard, newCardForFirstHand]));
      setSplitTotal(calculateTotal([secondCard, newCardForSecondHand]));
      setSplitBet(betAmount); // Duplicate the bet for the split hand
      setMoney(money - betAmount); // Deduct the split bet from the player's money
      setDeck(newDeck);
      setAllowedBusts(2);

      // Update states
      setIsSplit(true);
      setCurrentHand(1); // Start with the first hand
      setMessage('Playing first hand');
      setShowSplitOptions(false); // Hide the split options
    }
  };

  // Handle "No" response for splitting
  const handleNoSplit = () => {
    setMessage('');
    setShowSplitOptions(false); // Revert the buttons
  };


  // Handle changes to the bet input field
  const handleBetChange = (value) => {
    if (value !== '') {
      const bet = parseInt(value, 10);
      if (!isNaN(bet) && bet >= 1 && bet <= money) {
        setBetAmount(bet); // Set the bet amount if valid
      }
    }
  };

  // Handle placing the bet
  const handleBetSubmit = () => {
    if (betAmount > 0 && betAmount <= money) {
      setMoney(money - betAmount); // Deduct bet amount from player's money
      setIsBettingMode(false); // Exit betting mode
      setIsGameActive(true); // Start the game
    } else {
      setMessage(`Invalid Bet Amount. Must be Between $1 and $${money}`);
      setTimeout(() => {
        setMessage('');
      }, 2000
);
    }
  };


  // Manage dealer's turn logic
  useEffect(() => {
    if (isDealerTurn) {
      const interval = setInterval(() => {
        if (dealerTotal < 17) {
          const newDeck = [...deck];
          const drawnCard = newDeck.pop(); // Dealer draws a card
          const updatedHand = [...dealerHand, drawnCard];
          const updatedTotal = calculateTotal(updatedHand);
          setDeck(newDeck);
          setDealerHand(updatedHand);
          setDealerTotal(updatedTotal);
        }
        if (calculateTotal(dealerHand) >= 17) {
          clearInterval(interval); // Stop drawing cards
          determineWinner(); // Determine the outcome
        }
      }, 1000); // Every second, draw a card
      return () => clearInterval(interval);
    }
  }, [isDealerTurn, dealerTotal]);

  // Determine the winner based on totals
  const determineWinner = () => {
    const results = [];

    // Evaluate the main hand
    if(!isSplit) {
      if (playerTotal > 21) {
        results.push('Bust');
      } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        results.push('Win');
        setMoney((betAmount * 2) + money);
      } else if (playerTotal < dealerTotal) {
        results.push('Lose');
      } else {
        results.push('Tie');
        setMoney(betAmount + money);
      }
    } else {
      if (playerTotal === 21) {
        results.push('Main hand: Blackjack');
      } else if (playerTotal > 21) {
        results.push('Main hand: Bust');
      } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        results.push('Main hand: Win');
        setMoney((betAmount * 2) + money);
      } else if (playerTotal < dealerTotal) {
        results.push('Main hand: Lose');
      } else {
        results.push('Main hand: Tie');
        setMoney(betAmount + money);
      }
      // Evaluate the split hand
      if (splitTotal === 21) {
        results.push('Split hand: BlackJack');
      } else if (splitTotal > 21) {
        results.push('Split hand: Bust');
      } else if (dealerTotal > 21 || splitTotal > dealerTotal) {
        results.push('Split hand: Win');
        setMoney((splitBet * 2) + money);
      } else if (splitTotal < dealerTotal) {
        results.push('Split hand: Lose');
      } else {
        results.push('Split hand: Tie');
        setMoney(splitBet + money);
      }
    }
    setMessage(results.join('\n'));
    setTimeout(() => {
      resetGame();
    }, 2000
);
  };


  return (
    <View style={styles.container}>
      {/* Dealer's Hand */}
      <View style={styles.dealerHandContainer}>
        {dealerHand.map((card, index) => (
          <Card
            key={index}
            rank={ (isDealerTurn || index === 0) && !isBettingMode && (isGameActive || isDealerTurn || disableButtons) ? card.rank : ''}
            suit={ (isDealerTurn || index === 0) && !isBettingMode && (isGameActive || isDealerTurn || disableButtons) ? card.suit : ''}
          />
        ))}
      </View>
      {/* Player's Hand */}
      <View style={styles.playerHandContainer}>
        {isSplit ? (
          <>
            {/* Display the current hand being played */}
            {(currentHand === 1 ? playerHand : splitHand).map((card, index) => (
              <Card
                key={index}
                rank={ !isBettingMode && (isGameActive || isDealerTurn || isSplit) ? card.rank : ''}
                suit={ !isBettingMode && (isGameActive || isDealerTurn || isSplit) ? card.suit : ''}
              />
            ))}
          </>
        ) : (
          playerHand.map((card, index) => (
            <Card
              key={index}
              rank={ !isBettingMode && (isGameActive || isDealerTurn || isSplit) ? card.rank : ''}
              suit={ !isBettingMode && (isGameActive || isDealerTurn || isSplit) ? card.suit : ''}
            />
          ))
        )}
      </View>
      {/* Buttons */}
      {showSplitOptions ? (
        <>
          <Pressable onPress={handleSplit} style={styles.splitConfirm}>
            <Text style={styles.buttonText}>Yes</Text>
          </Pressable>
          <Pressable onPress={handleNoSplit} style={styles.splitDeny}>
            <Text style={styles.buttonText}>No</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable onPress={handleHit} style={[styles.hitButton, (!isGameActive || disableButtons) && styles.disabledButton]} disabled={!isGameActive || disableButtons}>
            <Text style={styles.buttonText}>Hit</Text>
          </Pressable>
          <Pressable onPress={handleStand} style={[styles.standButton, (!isGameActive || disableButtons) && styles.disabledButton]} disabled={!isGameActive || disableButtons}>
            <Text style={styles.buttonText}>Stand</Text>
          </Pressable>
        </>
      )}
      <View style={styles.betContainer}>
        <Text style={styles.moneyText}>Money: ${money}</Text>
        <TextInput
          style={[styles.betInput, !isBettingMode]}
          keyboardType="numeric"
          placeholder="Enter Bet Amount"
          onChangeText={handleBetChange}
          value={betAmount || ''}
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
      <Text style={styles.playerScore}>
        {!isBettingMode && (money > 0 || betAmount > 0)
          ? currentHand === 1
            ? playerTotal
            : splitTotal
          : '???'}
      </Text>
      <Text style={styles.dealerScore}>{isDealerTurn ? dealerTotal : '???'}</Text>

      {/*Message*/}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Container for the PLayer's Hand
  playerHandContainer: {
    position: 'absolute',
    bottom: 225,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Container for the Dealer's Hand
  dealerHandContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Hit Button
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
  // Stand Button
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
  // Disabled Button
  disabledButton: {
    backgroundColor: 'gray',
  },
  // Button Text
  buttonText: {
    color: 'black',
    fontSize: 22,
  },
  // Player's Score
  playerScore: {
    position: 'absolute',
    top: 30,
    left: 20,
    color: 'black',
    fontSize: 32,
  },
  // Dealer's Score
  dealerScore: {
    position: 'absolute',
    top: 30,
    right: 20,
    color: 'black',
    fontSize: 32,
  },
  // Display Message
  message: {
    position: 'absolute',
    top: 325,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'blue',
  },
  // Betting Input Container
  betContainer: {
    position: 'absolute',
    bottom: 65,
    alignItems: 'center',
  },
  // Balance Text
  moneyText: {
    fontSize: 24,
    marginBottom: 10,
  },
  // Bet Text Field
  betInput: {
    width: 250,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  // Bet Button
  betButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 8,
  },
  // Disabled Bet Button
  disabledBet: {
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 8,
  },
  splitConfirm: {
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
    backgroundColor: 'yellow',
  },
  splitDeny: {
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
    backgroundColor: 'yellow',
  },
});