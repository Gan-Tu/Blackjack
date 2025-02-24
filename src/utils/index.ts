export const calculateHandValue = (hand: { suit: string; value: string }[]) => {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.value === 'A') {
      aces += 1;
      value += 1;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  for (let i = 0; i < aces; i++) {
    if (value + 10 <= 21) {
      value += 10;
    }
  }
  return value;
};