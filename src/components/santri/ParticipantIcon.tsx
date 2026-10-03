import { SymbolView } from 'expo-symbols';
const symbols = {
  home: { ios: 'house', android: 'home', web: 'home' },
  book: { ios: 'book.closed', android: 'menu_book', web: 'menu_book' },
  classes: { ios: 'graduationcap', android: 'school', web: 'school' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  wallet: { ios: 'wallet.pass', android: 'account_balance_wallet', web: 'account_balance_wallet' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  arrow: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  back: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  check: { ios: 'checkmark.seal', android: 'verified', web: 'verified' },
} as const;
export type ParticipantIconName = keyof typeof symbols;
export default function ParticipantIcon({ name, size = 24, color = '#17654f' }: { name: ParticipantIconName; size?: number; color?: string }) {
  return <SymbolView name={symbols[name]} tintColor={color} size={size} style={{ width: size, height: size }} />;
}
