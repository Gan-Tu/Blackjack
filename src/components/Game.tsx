"use client";

import { calculateHandValue } from "@/utils";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Bet from "./Bet";
import Controls from "./Controls";
import Deck, { type Card } from "./Deck";
import Hand from "./Hand";
import Score from "./Score";

const MIN_CARDS_BEFORE_SHUFFLE = 20;
const DEALER_REVEAL_DELAY_MS = 140;
const INITIAL_CARD_DELAY_MS = 220;
const PLAYER_CARD_DELAY_MS = 180;
const DEALER_DRAW_DELAY_MS = 220;
const CLEAR_TABLE_DELAY_MS = 220;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createShuffledDeck = () => {
  const newDeck = Deck.createDeck();
  Deck.shuffle(newDeck);
  return newDeck;
};

const Game = () => {
  const deckRef = useRef<Card[]>(createShuffledDeck());
  const dealerTurnInProgressRef = useRef(false);
  const [playerHands, setPlayerHands] = useState<Card[][]>([[]]);
  const playerHandsRef = useRef(playerHands);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const dealerHandRef = useRef(dealerHand);
  const [cash, setCash] = useState(2000);
  const cashRef = useRef(cash);
  const [bet, setBet] = useState(0);
  const betRef = useRef(bet);
  const [lastBet, setLastBet] = useState(0);
  const [gameState, setGameState] = useState<
    "betting" | "playing" | "dealerTurn" | "roundOver" | "gameOver" | "clearing"
  >("betting");
  const [resultMessage, setResultMessage] = useState("");
  const [isDealing, setIsDealing] = useState(false);
  const [hasHit, setHasHit] = useState<boolean[]>([]);
  const activeHand = playerHands[currentHandIndex] ?? [];
  const isRoundResolved = gameState === "roundOver" || gameState === "gameOver";
  const statusLabel =
    gameState === "betting"
      ? "Place your bet"
      : gameState === "playing"
        ? `Playing hand ${currentHandIndex + 1}`
        : gameState === "dealerTurn"
          ? "Dealer draws"
          : gameState === "clearing"
            ? "Clearing table"
            : "Round complete";

  useEffect(() => {
    playerHandsRef.current = playerHands;
  }, [playerHands]);

  useEffect(() => {
    dealerHandRef.current = dealerHand;
  }, [dealerHand]);

  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);

  useEffect(() => {
    betRef.current = bet;
  }, [bet]);

  const setPlayerHandsState = useCallback((hands: Card[][]) => {
    playerHandsRef.current = hands;
    setPlayerHands(hands);
  }, []);

  const setDealerHandState = useCallback((hand: Card[]) => {
    dealerHandRef.current = hand;
    setDealerHand(hand);
  }, []);

  const getWorkingDeck = useCallback(() => {
    return deckRef.current.length < MIN_CARDS_BEFORE_SHUFFLE
      ? createShuffledDeck()
      : [...deckRef.current];
  }, []);

  const commitDeck = useCallback((workingDeck: Card[]) => {
    deckRef.current = workingDeck;
  }, []);

  const dealRequiredCard = useCallback((workingDeck: Card[]) => {
    if (workingDeck.length === 0) {
      workingDeck.push(...createShuffledDeck());
    }

    const card = Deck.dealCard(workingDeck);
    if (!card) {
      throw new Error("Unable to deal a card from the deck.");
    }

    return card;
  }, []);

  const refreshDeckIfLow = useCallback(() => {
    if (deckRef.current.length < MIN_CARDS_BEFORE_SHUFFLE) {
      deckRef.current = createShuffledDeck();
    }
  }, []);

  // Deal cards one at a time with animation
  const dealInitialCards = async (betAmount: number) => {
    const newDeck = getWorkingDeck();
    setIsDealing(true);
    setBet(betAmount);
    setLastBet(betAmount);
    setHasHit([false]);

    // Dealer cards (set both at once)
    const dealerCard1 = dealRequiredCard(newDeck);
    const dealerCard2 = dealRequiredCard(newDeck);
    setDealerHandState([dealerCard1, dealerCard2]);
    await delay(DEALER_REVEAL_DELAY_MS);

    // Player card 1
    const playerCard1 = dealRequiredCard(newDeck);
    setPlayerHandsState([[playerCard1]]);
    await delay(INITIAL_CARD_DELAY_MS);

    // Player card 2
    const playerCard2 = dealRequiredCard(newDeck);
    setPlayerHandsState([[playerCard1, playerCard2]]);
    await delay(INITIAL_CARD_DELAY_MS);

    commitDeck(newDeck);
    setIsDealing(false);

    const playerValue = calculateHandValue([playerCard1, playerCard2]);
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2]);
    if (playerValue === 21) {
      setGameState("roundOver");
      if (dealerValue === 21) {
        setResultMessage("Push! Both have Blackjack.");
      } else {
        setCash((currentCash) => currentCash + betAmount * 1.5);
        setResultMessage(`Blackjack! You win! ${betAmount * 1.5}`);
      }
    } else {
      setGameState("playing");
    }
  };

  const playerHit = async () => {
    const newDeck = getWorkingDeck();
    const newCard = dealRequiredCard(newDeck);
    const newHands = [...playerHands];
    newHands[currentHandIndex] = [...newHands[currentHandIndex], newCard];
    const newHasHit = [...hasHit];
    newHasHit[currentHandIndex] = true;
    setIsDealing(true);
    setPlayerHandsState(newHands);
    setHasHit(newHasHit);
    commitDeck(newDeck);

    await delay(PLAYER_CARD_DELAY_MS);
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
      const newDeck = getWorkingDeck();
      const newCard = dealRequiredCard(newDeck);
      const newHands = [...playerHands];
      newHands[currentHandIndex] = [...currentHand, newCard];
      setIsDealing(true);
      setPlayerHandsState(newHands);
      commitDeck(newDeck);
      setBet(bet * 2);

      await delay(PLAYER_CARD_DELAY_MS);
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
      const newDeck = getWorkingDeck();
      const newHands = [...playerHands];
      newHands[currentHandIndex] = [
        currentHand[0],
        dealRequiredCard(newDeck),
      ];
      setPlayerHandsState(newHands);
      await delay(PLAYER_CARD_DELAY_MS);

      newHands.push([currentHand[1], dealRequiredCard(newDeck)]);
      setIsDealing(true);
      setPlayerHandsState(newHands);
      commitDeck(newDeck);
      setCash(cash - bet);
      const newHasHit = [...hasHit, false];
      setHasHit(newHasHit);

      await delay(PLAYER_CARD_DELAY_MS);
      setIsDealing(false);
    }
  };

  const determineWinner = useCallback(
    (
      finalDealerHand: Card[],
      finalPlayerHands: Card[][],
      roundBet: number,
      startingCash: number
    ) => {
      const dealerValue = calculateHandValue(finalDealerHand);
      let newCash = startingCash;
      const messages: string[] = [];
      const handPrefix =
        finalPlayerHands.length > 1
          ? (index: number) => `Hand ${index + 1}: `
          : () => "";

      finalPlayerHands.forEach((hand, index) => {
        const playerValue = calculateHandValue(hand);
        const prefix = handPrefix(index);
        if (playerValue > 21) {
          newCash -= roundBet;
          messages.push(`${prefix}Bust! You lose \$${roundBet}.`);
        } else if (dealerValue > 21) {
          newCash += roundBet;
          messages.push(`${prefix}Dealer busts! You win \$${roundBet}!`);
        } else if (playerValue === 21 && hand.length === 2) {
          if (dealerValue === 21 && finalDealerHand.length === 2) {
            // Both gets Natural blackjack
            messages.push(`${prefix}Push! Both have Blackjack.`);
          } else {
            // Natural blackjack beats everything else
            newCash += roundBet * 1.5;
            messages.push(`${prefix}Blackjack! You win \$${roundBet * 1.5}!`);
          }
        } else if (dealerValue === 21 && finalDealerHand.length === 2) {
          // Dealer Natural blackjack beats everything except player Natural blackjack
          newCash -= roundBet;
          messages.push(
            `${prefix}Dealer has a natural blackjack, which beats your non-blackjack 21. You lose \$${roundBet}.`
          );
        } else if (playerValue > dealerValue) {
          newCash += roundBet;
          messages.push(`${prefix}You win \$${roundBet}!`);
        } else if (playerValue < dealerValue) {
          newCash -= roundBet;
          messages.push(`${prefix}You lose \$${roundBet}.`);
        } else {
          messages.push(`${prefix}Push!`);
        }
      });

      setCash(newCash);
      setResultMessage(messages.join(" "));
      setGameState(newCash <= 0 ? "gameOver" : "roundOver");
    },
    []
  );

  const clearTable = async () => {
    setGameState("clearing");
    setIsDealing(true);
    await delay(CLEAR_TABLE_DELAY_MS);
    setPlayerHandsState([[]]);
    setDealerHandState([]);
    setCurrentHandIndex(0);
    setHasHit([]);
    setIsDealing(false);
    setGameState("betting");
    refreshDeckIfLow();
  };

  const resetGame = async () => {
    setCash(2000);
    setBet(0);
    setLastBet(0);
    setResultMessage("");
    await clearTable();
  };

  const replayWithLastBet = async () => {
    if (lastBet > 0 && lastBet <= cash) {
      await clearTable();
      await dealInitialCards(lastBet);
    }
  };

  useEffect(() => {
    if (gameState !== "dealerTurn" || dealerTurnInProgressRef.current) {
      return;
    }

    dealerTurnInProgressRef.current = true;
    let isCancelled = false;

    const runDealerTurn = async () => {
      try {
        let currentHand = [...dealerHandRef.current];
        const workingDeck = getWorkingDeck();

        while (calculateHandValue(currentHand) < 17) {
          await delay(DEALER_DRAW_DELAY_MS);
          if (isCancelled) {
            return;
          }

          currentHand = [...currentHand, dealRequiredCard(workingDeck)];
          setDealerHandState(currentHand);
        }

        commitDeck(workingDeck);

        if (!isCancelled) {
          determineWinner(
            currentHand,
            playerHandsRef.current,
            betRef.current,
            cashRef.current
          );
        }
      } catch (error) {
        console.error(error);
        setResultMessage(
          "Something went wrong while dealing. Starting a new round is safe."
        );
        setGameState("roundOver");
      } finally {
        dealerTurnInProgressRef.current = false;
      }
    };

    runDealerTurn();

    return () => {
      isCancelled = true;
      dealerTurnInProgressRef.current = false;
    };
  }, [
    commitDeck,
    dealRequiredCard,
    determineWinner,
    gameState,
    getWorkingDeck,
    setDealerHandState,
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#22543d_0%,#0f3a2a_42%,#111827_100%)] px-4 py-4 text-white sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col">
        <header className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-4xl font-bold tracking-normal text-white drop-shadow-lg sm:text-5xl"
            >
              Blackjack
            </motion.h1>
            <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-amber-200">
              {statusLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Score cash={cash} />
            <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Bet
              </p>
              <p className="text-2xl font-bold">${bet || lastBet || 0}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 shadow-lg backdrop-blur sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Shoe
              </p>
              <p className="text-2xl font-bold">{deckRef.current.length}</p>
            </div>
          </div>
        </header>
      {gameState === "betting" && !isDealing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-4"
        >
          <Bet
            startGame={dealInitialCards}
            cash={cash}
            lastBet={lastBet}
            replayWithLastBet={replayWithLastBet}
          />
        </motion.div>
      )}
        <section className="grid flex-1 gap-4 rounded-lg border border-amber-200/20 bg-emerald-950/45 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:p-5 lg:grid-cols-2">
          <div className="flex min-h-56 flex-col rounded-lg border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white drop-shadow-md">
                Dealer
              </h2>
              <span className="rounded-full bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                {isRoundResolved ? "Revealed" : "Hole card"}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <Hand
                hand={dealerHand}
                isDealer={true}
                revealAll={isRoundResolved}
              />
            </div>
          </div>
          <div className="flex min-h-56 flex-col rounded-lg border border-white/10 bg-black/15 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white drop-shadow-md">
                Player
              </h2>
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                {activeHand.length > 0 ? calculateHandValue(activeHand) : "Ready"}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center space-y-4">
              {playerHands.map((hand, index) => (
                <div
                  key={index}
                  className={
                    index === currentHandIndex && gameState === "playing"
                      ? "rounded-lg bg-white/10 p-3 ring-2 ring-amber-300"
                      : "rounded-lg p-3"
                  }
                >
                  <Hand hand={hand} isDealer={false} revealAll={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      {gameState === "playing" && !isDealing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="sticky bottom-3 z-10 mt-4 flex justify-center"
        >
          <Controls
            hit={playerHit}
            stand={playerStand}
            double={playerDouble}
            split={playerSplit}
            canDouble={
                activeHand.length === 2 &&
              !hasHit[currentHandIndex] &&
              cash >= bet
            }
            canSplit={
                activeHand.length === 2 &&
                activeHand[0]?.value === activeHand[1]?.value &&
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
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-lg border border-white/15 bg-slate-950/70 p-4 text-center shadow-xl"
          >
            {resultMessage && (
              <motion.p
                className={`mb-4 text-xl font-bold drop-shadow-md sm:text-2xl ${
                  resultMessage.includes("lose")
                    ? "text-rose-300"
                    : "text-yellow-300"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {resultMessage}
              </motion.p>
            )}
            {gameState === "roundOver" && (
              <div className="flex flex-wrap justify-center gap-3">
                <motion.button
                  onClick={replayWithLastBet}
                  className="min-h-12 rounded-lg bg-amber-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Same Bet (${lastBet})
                </motion.button>
                <motion.button
                  onClick={clearTable}
                  className="min-h-12 rounded-lg bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-400 cursor-pointer"
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
                className="min-h-12 rounded-lg bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Restart Game
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Game;
