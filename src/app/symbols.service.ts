import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SymbolsService {

  luckySpin = false;
  superLuckySpin = false;
  luckyCommonSymbolId = 0;
  luckyRareSymbolId = 4;


  constructor() { }

  getRandomNumber() {
    return Math.floor(Math.random() * 100);
  }

  rollLuckySpin(): void {
    const random: number = this.getRandomNumber();
    console.log(random);
    if (random < 5) {
      this.luckySpin = true;
    } else {
      this.luckySpin = false;
    }
    if (random < 2) {
      this.superLuckySpin = true;
    } else {
      this.superLuckySpin = false;
    }
    this.luckyCommonSymbolId = random % 4;
    this.luckyRareSymbolId = (random % 4) + 4;
  }

  getNewSymbol(): Symbol {
    const random: number = this.getRandomNumber();
  
    let id: number = 0;
  
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
  
    if (this.superLuckySpin && id < 8) {
      if (id <= 3) {
        id += 4;
      } else {
        id += 1;
      }
    } else if (this.luckySpin && id < 4) {
      id += 1;
    }

  
    return new Symbol(Object.assign({}, this.symbols[id.toString()]));
  }

  symbols: Object = {
      '0': new Symbol({
          'id': "0",
          'styleClass': "symbol-common",
          'picture': "assets/img/jack.png",
          'value': 1,
      }),
      '1': new Symbol({
          'id': "1",
          'styleClass': "symbol-common",
          'picture': "assets/img/queen.png",
          'value': 2,
      }),
      '2': new Symbol({
          'id': "2",
          'styleClass': "symbol-common",
          'picture': "assets/img/king.png",
          'value': 3,
      }),
      '3': new Symbol({
          'id': "3",
          'styleClass': "symbol-common",
          'picture': "assets/img/ace.png",
          'value': 4,
      }),
      '4': new Symbol({
          'id': "4",
          'styleClass': "symbol-rare symbol-yellow",
          'picture': "assets/img/potato.png",
          'value': 5,
      }),
      '5': new Symbol({
          'id': "5",
          'styleClass': "symbol-rare symbol-orange",
          'picture': "assets/img/carrot.png",
          'value': 10,
      }),
      '6': new Symbol({
          'id': "6",
          'styleClass': "symbol-rare symbol-pink",
          'picture': "assets/img/broccoli.png",
          'value': 20,
      }),
      '7': new Symbol({
          'id': "7",
          'styleClass': "symbol-rare symbol-teal",
          'picture': "assets/img/beets.png",
          'value': 50,
      }),
      '8': new Symbol({
          'id': "8",
          'styleClass': "symbol-jackpot symbol-rainbow",
          'picture': "assets/img/onion.png",
          'value': 100,
      })
  };
}

export class Symbol {
  public picture: string;
  public id: string;
  public styleClass: string;
  public value: number;
  public won: boolean = false;

  constructor(data: Partial<Symbol>){
      Object.assign(this, data);
  }
}