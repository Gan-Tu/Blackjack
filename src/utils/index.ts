export const calculateHandValue = (hand: { suit: string; value: string }[]) => {
  let nonAceValue = 0;
  let aces = 0;

  // Count the non-ace value and number of aces
  for (const card of hand) {
    if (!card || !card.value) {
      continue;
    }
    if (card.value === 'A') {
      aces++;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      nonAceValue += 10;
    } else {
      nonAceValue += parseInt(card.value);
    }
  }

  // Start by counting all aces as 1
  let total = nonAceValue + aces;

  // Try to convert one ace from 1 to 11 if it won't bust
  // We can only count Ace as 11 once.
  if (aces > 0 && total + 10 <= 21) {
    total += 10; // Add 10 more to one ace (making it 11 instead of 1)
  }

  return total;
};