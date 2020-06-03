import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaylineComponent } from './payline/payline.component';
import { paylines } from './paylines';
import { SymbolsService, SlotSymbol } from './symbols.service';

@Component({
  selector: 'lib-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss']
})
export class SlotMachineComponent {

  title = 'slot-machine';
  numberOfReels = 5;
  numberOfRows = 5;
  numberOfSymbols = this.numberOfRows + 1;
  reels = new Array<Reel>();
  spinning = false;
  stopping = false;
  stopIndex = 0;
  maxBetAmount = 1000;
  minimumBetAmount = 50;
  betAmount = this.minimumBetAmount
  paylineValues = paylines;
  winnings = 1000;
  stats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  @ViewChildren(PaylineComponent) paylineComponents: QueryList<PaylineComponent>;

  constructor(public symbolsService: SymbolsService) {
    for (let i = 0; i < this.numberOfReels; i++) {
      const symbols = new Array<SlotSymbol>();
      for (let j = 0; j < this.numberOfSymbols; j++) {
        symbols.push(this.symbolsService.getNewSymbol());
      }
      this.reels.push(new Reel({
        symbols,
        column: i
      }));
    }
  }

  getWinningsString(): string {
     return ('0000000' + this.winnings).slice(-7);
  }

  spin(reel: Reel): void {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        reel.symbols.pop();
        reel.symbols.unshift(this.symbolsService.getNewSymbol());
        if (this.spinning) {
          this.spin(reel);
        } else {
          if (this.stopIndex === reel.column) {
            setTimeout(() => {
              this.stopIndex += 1;
            }, 200);

            if (this.stopIndex === this.numberOfReels - 1) {
              this.checkForWin();
              this.stopping = false;
            }
          } else {
            this.spin(reel);
          }
        }
      }, 80);
    });
  }

  increaseBet() {
    if (this.betAmount < this.maxBetAmount) {
      this.betAmount += this.minimumBetAmount;
    }
  }

  decreaseBet() {
    if (this.betAmount > this.minimumBetAmount) {
      this.betAmount -= this.minimumBetAmount;
    }
  }

  checkForWin() {
    let newWinnings = 0;
    for (const payline of this.paylineComponents) {
      let symbol: SlotSymbol;
      const winningSymbols = [];
      for (let i = 0; i < this.numberOfReels; i++) {
        const paylineIndex: number = payline.winningRows[i];
        if (symbol === undefined) {
          symbol = this.reels[i].symbols[paylineIndex];
        } else if (symbol.id !== this.reels[i].symbols[paylineIndex].id) {
          break;
        }

        winningSymbols.push(this.reels[i].symbols[paylineIndex]);

        if (i === this.numberOfReels - 1) {
          for (const winningSymbol of winningSymbols) {
            winningSymbol.won = true;
          }
          this.stats[parseInt(symbol.id, 10)] += 1;
          payline.show();
          setTimeout(() => {
            payline.hide();
          }, 5000);
          newWinnings += (5 * symbol.value) + 3;
        }
      }
    }
    let jackpotSymbols = 0;
    const winningJackpotSymbols = [];
    for (let i = 0; i < this.numberOfReels; i++) {
      for (let j = 0; j < this.numberOfRows; j++) {
        if (this.reels[i].symbols[j].id === '8') {
          jackpotSymbols += 1;
          winningJackpotSymbols.push(this.reels[i].symbols[j]);
        }
      }
    }
    if (jackpotSymbols >= 3) {
      for (const winningSymbol of winningJackpotSymbols) {
        winningSymbol.won = true;
      }
    }
    this.winnings += newWinnings * (this.betAmount / this.minimumBetAmount);
  }

  takePayment() {
    this.winnings -= this.betAmount;
  }

  startStop(): void {
    if (this.spinning) {
      setTimeout(() => {
        this.stopIndex = 0;
        this.stopping = true;
        this.spinning = false;
      }, 100);
    } else {
      this.takePayment();
      this.symbolsService.rollLuckySpin();
      for (const payline of this.paylineComponents) {
        payline.hide();
      }
      setTimeout(() => {
        for (const reel of this.reels) {
          this.spin(reel);
        }
        this.spinning = true;
        this.stats[8] += 1;
      });
    }
  }
}

class Reel {
  public symbols: SlotSymbol[];
  public column: number;

  constructor(data: Partial<Reel>){
    Object.assign(this, data);
  }
}
