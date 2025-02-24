"use client";

import { calculateHandValue } from "@/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Bet from "./Bet";
import Controls from "./Controls";
import Deck from "./Deck";
import Hand from "./Hand";
import Score from "./Score";

const Game = () => {
  const [deck, setDeck] = useState<{ suit: string; value: string }[]>([]);
  const [playerHands, setPlayerHands] = useState<
    { suit: string; value: string }[][]
  >([[]]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState<
    { suit: string; value: string }[]
  >([]);
  const [cash, setCash] = useState(2000);
  const [bet, setBet] = useState(0);
  const [lastBet, setLastBet] = useState(0);
  const [gameState, setGameState] = useState<
    "betting" | "playing" | "dealerTurn" | "roundOver" | "gameOver"
  >("betting");
  const [resultMessage, setResultMessage] = useState("");
  const [isDealingPlayer, setIsDealingPlayer] = useState(false);

  // Track whether each hand has been hit to enforce double-down rules
  const [hasHit, setHasHit] = useState<boolean[]>([]);

  useEffect(() => {
    const newDeck = Deck.createDeck();
    Deck.shuffle(newDeck);
    setDeck(newDeck);
  }, []);

  const dealInitialCards = (betAmount: number) => {
    const newDeck = [...deck];
    const playerCard1 = Deck.dealCard(newDeck);
    const dealerCard1 = Deck.dealCard(newDeck);
    const playerCard2 = Deck.dealCard(newDeck);
    const dealerCard2 = Deck.dealCard(newDeck);

    const initialPlayerHand = [playerCard1, playerCard2].filter(
      (card) => card !== undefined
    );
    const initialDealerHand = [dealerCard1, dealerCard2].filter(
      (card) => card !== undefined
    );

    setPlayerHands([initialPlayerHand]);
    setDealerHand(initialDealerHand);
    setDeck(newDeck);
    setBet(betAmount);
    setLastBet(betAmount);
    setHasHit([false]); // Initialize hasHit for one hand
    setIsDealingPlayer(true);

    setTimeout(() => {
      setIsDealingPlayer(false);
      const playerValue = calculateHandValue(initialPlayerHand);
      const dealerValue = calculateHandValue(initialDealerHand);
      if (playerValue === 21) {
        setGameState("roundOver");
        if (dealerValue === 21) {
          setResultMessage("Push! Both have Blackjack.");
        } else {
          setCash(cash + betAmount * 1.5);
          setResultMessage("Blackjack! You win!");
        }
      } else {
        setGameState("playing");
      }
    }, 1000);
  };

  const playerHit = () => {
    const newDeck = [...deck];
    const newCard = Deck.dealCard(newDeck);
    const newHands = [...playerHands];
    newHands[currentHandIndex] = [...newHands[currentHandIndex], newCard];
    const newHasHit = [...hasHit];
    newHasHit[currentHandIndex] = true; // Mark this hand as hit
    setPlayerHands(newHands);
    setHasHit(newHasHit);
    setDeck(newDeck);
    setIsDealingPlayer(true);

    setTimeout(() => {
      setIsDealingPlayer(false);
      if (calculateHandValue(newHands[currentHandIndex]) > 21) {
        if (currentHandIndex < playerHands.length - 1) {
          setCurrentHandIndex(currentHandIndex + 1);
        } else {
          setGameState("dealerTurn");
        }
      }
    }, 500);
  };

  const playerStand = () => {
    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
    } else {
      setGameState("dealerTurn");
    }
  };

  const playerDouble = () => {
    const currentHand = playerHands[currentHandIndex];
    if (
      cash >= bet &&
      currentHand.length === 2 &&
      !hasHit[currentHandIndex] // Only allow if no hits have occurred
    ) {
      const newDeck = [...deck];
      const newCard = Deck.dealCard(newDeck);
      const newHands = [...playerHands];
      newHands[currentHandIndex] = [...currentHand, newCard];
      setPlayerHands(newHands);
      setDeck(newDeck);
      setCash(cash - bet); // Subtract additional bet
      setBet(bet * 2); // Double the original bet
      setIsDealingPlayer(true);

      setTimeout(() => {
        setIsDealingPlayer(false);
        // After doubling, move to next hand or dealer turn (no more actions allowed)
        if (currentHandIndex < playerHands.length - 1) {
          setCurrentHandIndex(currentHandIndex + 1);
        } else {
          setGameState("dealerTurn");
        }
      }, 500);
    }
  };

  const playerSplit = () => {
    const currentHand = playerHands[currentHandIndex];
    if (
      cash >= bet &&
      currentHand.length === 2 &&
      currentHand[0].value === currentHand[1].value &&
      !hasHit[currentHandIndex]
    ) {
      const newDeck = [...deck];
      const newHands = [...playerHands];
      newHands[currentHandIndex] = [currentHand[0], Deck.dealCard(newDeck)];
      newHands.push([currentHand[1], Deck.dealCard(newDeck)]);
      const newHasHit = [...hasHit];
      newHasHit.push(false); // Add new hand with no hits
      setPlayerHands(newHands);
      setDeck(newDeck);
      setCash(cash - bet); // Subtract additional bet for the new hand
      setHasHit(newHasHit);
      setIsDealingPlayer(true);

      setTimeout(() => {
        setIsDealingPlayer(false);
      }, 1000);
    }
  };

  const dealerTurn = async () => {
    let currentHand = [...dealerHand];
    while (calculateHandValue(currentHand) < 17) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newCard = Deck.dealCard(deck);
      currentHand = [...currentHand, newCard];
      setDealerHand([...currentHand]);
    }
    determineWinner(currentHand);
  };

  const determineWinner = (
    finalDealerHand: { suit: string; value: string }[]
  ) => {
    const dealerValue = calculateHandValue(finalDealerHand);
    let newCash = cash;
    let messages: string[] = [];
    const handPrefix =
      playerHands.length > 1
        ? (index: number) => `Hand ${index + 1}: `
        : () => "";

    playerHands.forEach((hand, index) => {
      const playerValue = calculateHandValue(hand);
      const prefix = handPrefix(index);
      if (playerValue > 21) {
        newCash -= bet;
        messages.push(`${prefix}Bust! You lose.`);
      } else if (dealerValue > 21) {
        newCash += bet;
        messages.push(`${prefix}Dealer busts! You win!`);
      } else if (playerValue === 21 && hand.length === 2) {
        if (dealerValue === 21 && finalDealerHand.length === 2) {
          messages.push(`${prefix}Push! Both have Blackjack.`);
        } else {
          newCash += bet * 1.5;
          messages.push(`${prefix}Blackjack! You win!`);
        }
      } else if (dealerValue === 21 && finalDealerHand.length === 2) {
        newCash -= bet;
        messages.push(`${prefix}Dealer has Blackjack. You lose.`);
      } else if (playerValue > dealerValue) {
        newCash += bet;
        messages.push(`${prefix}You win!`);
      } else if (playerValue < dealerValue) {
        newCash -= bet;
        messages.push(`${prefix}You lose.`);
      } else {
        messages.push(`${prefix}Push!`);
      }
    });

    setCash(newCash);
    setResultMessage(messages.join(" "));
    if (newCash <= 0) {
      setGameState("gameOver");
    } else {
      setGameState("roundOver");
    }
  };

  const resetRound = () => {
    setCurrentHandIndex(0);
    setGameState("betting");
    if (deck.length < 20) {
      const newDeck = Deck.createDeck();
      Deck.shuffle(newDeck);
      setDeck(newDeck);
    }
    setHasHit([]); // Reset hit tracking
  };

  const resetGame = () => {
    setCash(2000);
    setPlayerHands([[]]);
    setDealerHand([]);
    setBet(0);
    setLastBet(0);
    setCurrentHandIndex(0);
    setResultMessage("");
    setIsDealingPlayer(false);
    setHasHit([]); // Reset hit tracking
    const newDeck = Deck.createDeck();
    Deck.shuffle(newDeck);
    setDeck(newDeck);
    setGameState("betting");
  };

  const replayWithLastBet = () => {
    if (lastBet > 0 && lastBet <= cash) {
      setPlayerHands([[]]);
      setDealerHand([]);
      dealInitialCards(lastBet);
    }
  };

  useEffect(() => {
    if (gameState === "dealerTurn") {
      dealerTurn();
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-800 to-emerald-400 p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-white mb-6"
      >
        Blackjack
      </motion.h1>
      <Score cash={cash} />
      {gameState === "betting" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Bet
            startGame={dealInitialCards}
            cash={cash}
            lastBet={lastBet}
            replayWithLastBet={replayWithLastBet}
          />
        </motion.div>
      )}
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-white text-center">
          Dealer
        </h2>
        <Hand
          hand={dealerHand}
          isDealer={true}
          revealAll={gameState === "roundOver" || gameState === "gameOver"}
        />
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-white text-center">
          Player
        </h2>
        {playerHands.map((hand, index) => (
          <div key={index} className="mb-4">
            <Hand hand={hand} isDealer={false} revealAll={true} />
          </div>
        ))}
      </div>
      {gameState === "playing" && !isDealingPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Controls
            hit={playerHit}
            stand={playerStand}
            double={playerDouble}
            split={playerSplit}
            canDouble={
              playerHands[currentHandIndex].length === 2 &&
              !hasHit[currentHandIndex] && // Only allow if no hits
              cash >= bet
            }
            canSplit={
              playerHands[currentHandIndex].length === 2 &&
              playerHands[currentHandIndex][0].value ===
                playerHands[currentHandIndex][1].value &&
              !hasHit[currentHandIndex] && // Only allow if no hits
              cash >= bet
            }
          />
        </motion.div>
      )}
      {(gameState === "roundOver" || gameState === "gameOver") &&
        !isDealingPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-center"
          >
            {resultMessage && (
              <motion.p
                className={`text-2xl font-bold mb-4 ${
                  resultMessage?.includes("lose")
                    ? "text-rose-500"
                    : "text-yellow-300"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {resultMessage}
              </motion.p>
            )}
            {gameState === "roundOver" && (
              <div className="flex space-x-4">
                <button
                  onClick={replayWithLastBet}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                >
                  Same Bet (${lastBet})
                </button>
                <button
                  onClick={resetRound}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  New Bet
                </button>
              </div>
            )}
            {gameState === "gameOver" && (
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Restart Game
              </button>
            )}
          </motion.div>
        )}
    </div>
  );
};

export default Game;
