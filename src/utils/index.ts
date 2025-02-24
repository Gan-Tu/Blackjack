export const calculateHandValue = (hand: { suit: string; value: string }[]) => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (!card || !card.value) {
      continue;
    }
    if (card.value === 'A') {
      aces++;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  // Add Aces optimally: first as 11 if possible, otherwise as 1
  while (aces > 0) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
    aces--;
  }

  return value;
};
