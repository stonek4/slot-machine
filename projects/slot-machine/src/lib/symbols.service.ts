import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * @class A service class to handle getting symbols and calculating lucky spins
 */
export class SymbolsService {
  // Whether the current spin is a lucky spin
  luckySpin = false;
  // Whether the current spin is a super lucky spin
  superLuckySpin = false;
  // The lucky common symbol that appears more often on the wheel than other common symbols
  luckyCommonSymbolId = 0;
  // The lucky rare symbole that appears more often on the wheel than other rare symbols
  luckyRareSymbolId = 4;

  /**
   * A list of all of the symbols that can appear on the wheel
   * 
   * Currently 
   * J-A are common symbols
   * Vegetables are rare symbols
   * Onion is jackpot symbol
   */
  symbols: object = {
      0: new SlotSymbol({
          id: '0',
          styleClass: 'symbol-common',
          picture: 'assets/img/jack.png',
          value: 1,
      }),
      1: new SlotSymbol({
          id: '1',
          styleClass: 'symbol-common',
          picture: 'assets/img/queen.png',
          value: 2,
      }),
      2: new SlotSymbol({
          id: '2',
          styleClass: 'symbol-common',
          picture: 'assets/img/king.png',
          value: 3,
      }),
      3: new SlotSymbol({
          id: '3',
          styleClass: 'symbol-common',
          picture: 'assets/img/ace.png',
          value: 4,
      }),
      4: new SlotSymbol({
          id: '4',
          styleClass: 'symbol-rare symbol-yellow',
          picture: 'assets/img/potato.png',
          value: 5,
      }),
      5: new SlotSymbol({
          id: '5',
          styleClass: 'symbol-rare symbol-orange',
          picture: 'assets/img/carrot.png',
          value: 10,
      }),
      6: new SlotSymbol({
          id: '6',
          styleClass: 'symbol-rare symbol-pink',
          picture: 'assets/img/broccoli.png',
          value: 20,
      }),
      7: new SlotSymbol({
          id: '7',
          styleClass: 'symbol-rare symbol-teal',
          picture: 'assets/img/beets.png',
          value: 40,
      }),
      8: new SlotSymbol({
          id: '8',
          styleClass: 'symbol-jackpot symbol-rainbow',
          picture: 'assets/img/onion.png',
          value: 100,
      })
  };

  constructor() { }

  /**
   * Method to generate random integers between 0 and 99
   * 
   * @returns {number} and integer
   */
  getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }

  /**
   * Roll whether a spin is lucky or not, super lucky
   * spins are less common than lucky spins
   * 
   * Also determine the lucky symbols for the spin, lucky
   * symbols appear more often and allow a greater chance
   * of hitting a payline.  Without lucky symbols you would 
   * need a lot more paylines or a lot fewer symbols to make the
   * slot machine payout reasonably often.
   */
  rollLuckySpin(): void {
    const random: number = this.getRandomNumber();
    if (random < 8) {
      this.luckySpin = true;
    } else {
      this.luckySpin = false;
    }
    if (random < 2) {
      this.superLuckySpin = true;
    } else {
      this.superLuckySpin = false;
    }
    // Regardless of whether a spin is lucky, randomly pick a lucky common symbol
    // that appears more often
    this.luckyCommonSymbolId = random % 4;
    // And pick a rare symbol that appears more often
    this.luckyRareSymbolId = (random % 4) + 4;
  }

  /**
   * Get a new symbol based on the current lucky symbols and
   * whether or not it's a lucky spin.  Must be fast as 
   * it is called very frequently to "generate" a reel
   * full of symbols.
   * 
   * @returns {SlotSymbol} the slot symbols that was chosen
   */
  getNewSymbol(): SlotSymbol {
    const random: number = this.getRandomNumber();

    let id = 0;
    // Use the random number to pick a symbol
    if (random < 36) {
      id = this.luckyCommonSymbolId;
    } else if (random < 65) {
      id = this.luckyRareSymbolId;
    } else if (random < 83) {
      id = random % 4;
    } else if (random < 99) {
      id = random % 4 + 4;
    } else {
      id = 8;
    }
    // If the spin is super lucky, add 4 to common
    // symbols and add one to rare symbols
    if (this.superLuckySpin && id < 8) {
      if (id <= 3) {
        id += 4;
      } else {
        id += 1;
      }
    // If the spin is just lucky, add two to common
    // symbols
    } else if (this.luckySpin && id < 4) {
      id += 2;
    }

    return new SlotSymbol(Object.assign({}, this.symbols[id.toString()]));
  }
}

/**
 * @class Class representing a slot symbol on a reel
 */
export class SlotSymbol {
  // The path to the picture of the symbol
  public picture: string;
  // The id of the symbol
  public id: string;
  // The styling of the symbol (the CSS class defining the background colors)
  public styleClass: string;
  // The value of the symbol 
  public value: number;
  // Whether the symbol is part of a winning combination (will make the symbol animate)
  public won = false;

  constructor(data: Partial<SlotSymbol>){
      Object.assign(this, data);
  }
}
