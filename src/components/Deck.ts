export type Card = { suit: string; value: string };

export default class Deck {
  static createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    return deck;
  }

  static shuffle(deck: Card[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  static dealCard(deck: Card[]) {
    return deck.pop();
  }
}
