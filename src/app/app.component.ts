import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaylineComponent } from './payline/payline.component';
import { paylines } from './paylines';
import { SymbolsService, Symbol } from './symbols.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slot-machine';
  numberOfReels = 5;
  numberOfRows = 5;
  numberOfSymbols = this.numberOfRows + 1;
  reels = new Array<Reel>();
  spinning = false;
  stopping = false;
  stopIndex = 0;
  paylineValues = paylines;
  winnings = 1000;
  stats = [0,0,0,0,0,0,0,0,0,0];

  @ViewChildren(PaylineComponent) paylineComponents: QueryList<PaylineComponent>;

  constructor(private symbolsService: SymbolsService) {
    for (let i = 0; i < this.numberOfReels; i++) {
      const symbols = new Array<Symbol>();
      for (let j = 0; j < this.numberOfSymbols; j++) {
        symbols.push(this.symbolsService.getNewSymbol());
      }
      this.reels.push(new Reel({
        symbols: symbols,
        column: i
      }));
    }
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

  checkForWin() {
    let newWinnings: number = 0;
    for (let payline of this.paylineComponents) {
      let symbol: Symbol = undefined;
      for (let i = 0; i < this.numberOfReels; i++) {
        const paylineIndex: number = payline.winningRows[i];
        if (symbol === undefined) {
          symbol = this.reels[i].symbols[paylineIndex];
        } else if (symbol.id !== this.reels[i].symbols[paylineIndex].id) {
          break;
        }

        if (i === this.numberOfReels - 1) {
          this.stats[parseInt(symbol.id)] += 1;
          payline.show();
          setTimeout(() => {
            payline.hide();
          }, 5000);
          newWinnings += (5 * symbol.value) + 3;
        }
      }
    }
    this.winnings += newWinnings;
  }

  takePayment() {
    this.winnings -= 30;
  }

  startStop(): void {
    if (this.spinning) {
      this.stopIndex = 0;
      this.stopping = true;
      this.spinning = false;
    } else {
      this.takePayment();
      this.symbolsService.rollLuckySpin();
      for (let payline of this.paylineComponents) {
        payline.hide();
      }
      setTimeout(() => {
        for (let reel of this.reels) {
          this.spin(reel);
        }
        this.spinning = true;
        this.stats[8] += 1;
      });
    }
  }

  ngOnInit(): void {
    // setInterval(() => {
    //   this.startStop();
    //   if (this.stats[5] % 100 === 0) {
    //     console.log(this.stats);
    //   }
    // }, 2000);
  }
}

class Reel {
  public symbols: Symbol[];
  public column: number;

  constructor(data: Partial<Reel>){
    Object.assign(this, data);
  }
}


