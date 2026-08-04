export interface TitleFlasher {
  flash(text: string): Promise<void>;
}
