"use client";

import { calculateHandValue } from "@/utils";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
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
    "betting" | "playing" | "dealerTurn" | "roundOver" | "gameOver" | "clearing"
  >("betting");
  const [resultMessage, setResultMessage] = useState("");
  const [isDealing, setIsDealing] = useState(false); // Unified dealing state
  const [hasHit, setHasHit] = useState<boolean[]>([]);

  // Initialize deck on mount
  useEffect(() => {
    const newDeck = Deck.createDeck();
    Deck.shuffle(newDeck);
    setDeck(newDeck);
  }, []);

  const fillDeck = () => {
    if (deck.length < 20) {
      const newDeck = Deck.createDeck();
      Deck.shuffle(newDeck);
      setDeck(newDeck);
    }
  };

  // Deal cards one at a time with animation
  const dealInitialCards = async (betAmount: number) => {
    fillDeck();
    const newDeck = [...deck];
    setIsDealing(true);
    setBet(betAmount);
    setLastBet(betAmount);
    setHasHit([false]);

    // Dealer cards (set both at once)
    const dealerCard1 = Deck.dealCard(newDeck);
    const dealerCard2 = Deck.dealCard(newDeck);
    setDealerHand([dealerCard1, dealerCard2]);
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Player card 1
    const playerCard1 = Deck.dealCard(newDeck);
    setPlayerHands([[playerCard1]]);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Wait for both dealer cards to animate

    // Player card 2
    const playerCard2 = Deck.dealCard(newDeck);
    setPlayerHands([[playerCard1, playerCard2]]);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Wait for both dealer cards to animate

    setDeck(newDeck);
    setIsDealing(false);

    const playerValue = calculateHandValue([playerCard1, playerCard2]);
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2]);
    if (playerValue === 21) {
      setGameState("roundOver");
      if (dealerValue === 21) {
        setResultMessage("Push! Both have Blackjack.");
      } else {
        setCash(cash + betAmount * 1.5);
        setResultMessage(`Blackjack! You win! ${betAmount * 1.5}`);
      }
    } else {
      setGameState("playing");
    }
  };

  const playerHit = async () => {
    const newDeck = [...deck];
    const newCard = Deck.dealCard(newDeck);
    const newHands = [...playerHands];
    newHands[currentHandIndex] = [...newHands[currentHandIndex], newCard];
    const newHasHit = [...hasHit];
    newHasHit[currentHandIndex] = true;
    setIsDealing(true);
    setPlayerHands(newHands);
    setHasHit(newHasHit);
    setDeck(newDeck);

    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsDealing(false);

    if (calculateHandValue(newHands[currentHandIndex]) > 21) {
      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
      } else {
        setGameState("dealerTurn");
      }
    }
  };

  const playerStand = () => {
    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
    } else {
      setGameState("dealerTurn");
    }
  };

  const playerDouble = async () => {
    const currentHand = playerHands[currentHandIndex];
    if (cash >= bet && currentHand.length === 2 && !hasHit[currentHandIndex]) {
      const newDeck = [...deck];
      const newCard = Deck.dealCard(newDeck);
      const newHands = [...playerHands];
      newHands[currentHandIndex] = [...currentHand, newCard];
      setIsDealing(true);
      setPlayerHands(newHands);
      setDeck(newDeck);
      setBet(bet * 2);

      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsDealing(false);

      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
      } else {
        setGameState("dealerTurn");
      }
    }
  };

  const playerSplit = async () => {
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
      setPlayerHands(newHands);
      await new Promise((resolve) => setTimeout(resolve, 400)); // First split card

      newHands.push([currentHand[1], Deck.dealCard(newDeck)]);
      setIsDealing(true);
      setPlayerHands(newHands);
      setDeck(newDeck);
      setCash(cash - bet);
      const newHasHit = [...hasHit, false];
      setHasHit(newHasHit);

      await new Promise((resolve) => setTimeout(resolve, 400)); // Second split card
      setIsDealing(false);
    }
  };

  const dealerTurn = async () => {
    let currentHand = [...dealerHand];
    while (calculateHandValue(currentHand) < 17) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newCard = Deck.dealCard(deck);
      currentHand = [...currentHand, newCard];
      setDealerHand([...currentHand]);
    }
    determineWinner(currentHand);
  };

  const determineWinner = useCallback(
    (finalDealerHand: { suit: string; value: string }[]) => {
      const dealerValue = calculateHandValue(finalDealerHand);
      let newCash = cash;
      const messages: string[] = [];
      const handPrefix =
        playerHands.length > 1
          ? (index: number) => `Hand ${index + 1}: `
          : () => "";

      playerHands.forEach((hand, index) => {
        const playerValue = calculateHandValue(hand);
        const prefix = handPrefix(index);
        if (playerValue > 21) {
          newCash -= bet;
          messages.push(`${prefix}Bust! You lose \$${bet}.`);
        } else if (dealerValue > 21) {
          newCash += bet;
          messages.push(`${prefix}Dealer busts! You win \$${bet}!`);
        } else if (playerValue === 21 && hand.length === 2) {
          if (dealerValue === 21 && finalDealerHand.length === 2) {
            messages.push(`${prefix}Push! Both have Blackjack.`);
          } else {
            newCash += bet * 1.5;
            messages.push(`${prefix}Blackjack! You win \$${bet * 1.5}!`);
          }
        } else if (dealerValue === 21 && finalDealerHand.length === 2) {
          newCash -= bet;
          messages.push(`${prefix}Dealer has Blackjack. You lose \$${bet}.`);
        } else if (playerValue > dealerValue) {
          newCash += bet;
          messages.push(`${prefix}You win \$${bet}!`);
        } else if (playerValue < dealerValue) {
          newCash -= bet;
          messages.push(`${prefix}You lose \$${bet}.`);
        } else {
          messages.push(`${prefix}Push!`);
        }
      });

      setCash(newCash);
      setResultMessage(messages.join(" "));
      setGameState(newCash <= 0 ? "gameOver" : "roundOver");
    },
    [bet, cash, playerHands]
  );

  const clearTable = async () => {
    setGameState("clearing");
    setIsDealing(true); // Reuse for clearing animation
    await new Promise((resolve) => setTimeout(resolve, 800)); // Clearing animation duration
    setPlayerHands([[]]);
    setDealerHand([]);
    setCurrentHandIndex(0);
    setHasHit([]);
    setIsDealing(false);
    setGameState("betting");
    fillDeck();
  };

  const resetGame = async () => {
    setCash(2000);
    setBet(0);
    setLastBet(0);
    setResultMessage("");
    await clearTable();
  };

  const replayWithLastBet = () => {
    if (lastBet > 0 && lastBet <= cash) {
      clearTable().then(() => dealInitialCards(lastBet));
    }
  };

  useEffect(() => {
    if (gameState === "dealerTurn") {
      dealerTurn();
    }
  }, [dealerTurn, gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-800 to-emerald-400 p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-white mb-6 drop-shadow-lg"
      >
        Blackjack
      </motion.h1>
      <Score cash={cash} />
      {gameState === "betting" && !isDealing && (
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
        <h2 className="text-2xl font-semibold text-white text-center drop-shadow-md">
          Dealer
        </h2>
        <Hand
          hand={dealerHand}
          isDealer={true}
          revealAll={gameState === "roundOver" || gameState === "gameOver"}
        />
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-white text-center drop-shadow-md">
          Player
        </h2>
        {playerHands.map((hand, index) => (
          <div key={index} className="mb-4">
            <Hand hand={hand} isDealer={false} revealAll={true} />
          </div>
        ))}
      </div>
      {gameState === "playing" && !isDealing && (
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
              !hasHit[currentHandIndex] &&
              cash >= bet
            }
            canSplit={
              playerHands[currentHandIndex].length === 2 &&
              playerHands[currentHandIndex][0]?.value ===
                playerHands[currentHandIndex][1]?.value &&
              !hasHit[currentHandIndex] &&
              cash >= bet
            }
          />
        </motion.div>
      )}
      {(gameState === "roundOver" || gameState === "gameOver") &&
        !isDealing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-center"
          >
            {resultMessage && (
              <motion.p
                className={`text-2xl font-bold mb-4 drop-shadow-md ${
                  resultMessage.includes("lose")
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
                <motion.button
                  onClick={replayWithLastBet}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Same Bet (${lastBet})
                </motion.button>
                <motion.button
                  onClick={clearTable}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  New Bet
                </motion.button>
              </div>
            )}
            {gameState === "gameOver" && (
              <motion.button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Restart Game
              </motion.button>
            )}
          </motion.div>
        )}
    </div>
  );
};

export default Game;
