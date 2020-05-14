import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaylineComponent } from './payline/payline.component';
import { paylines } from './paylines';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  stopIndex = 0;
  paylineValues = paylines;
  winnings = 50;
  @ViewChildren(PaylineComponent) paylineComponents: QueryList<PaylineComponent>;

  constructor() {
    for (let i = 0; i < this.numberOfReels; i++) {
      const symbols = new Array<Symbol>();
      for (let j = 0; j < this.numberOfSymbols; j++) {
        const id = this.getRandomNumber();
        const color = this.getColor(id);

        symbols.push(new Symbol({
          id: id.toString(),
          color: color,
          picture: j.toString(),
          value: id
        }))
      }
      this.reels.push(new Reel({
        symbols: symbols,
        column: i
      }));
    }
  }

  getColor(index: number) {
    switch(index) {
      case 0: {
        return "white";
      }
      case 1: {
        return "blue";
      }
      case 2: {
        return "green";
      }
      case 3: {
        return "yellow";
      }
      case 4: {
        return "purple";
      }
    }
  }

  getRandomNumber() {
    return Math.floor(Math.random() * 4);
  }

  spin(reel: Reel): void {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        const id = this.getRandomNumber();
        const color = this.getColor(id);
        reel.symbols.pop();
        reel.symbols.unshift(new Symbol({
          id: id.toString(),
          color: color,
          picture: "hi",
          value: id
        }));
        if (this.spinning) {
          this.spin(reel);
        } else {
          if (this.stopIndex === reel.column) {
            setTimeout(() => {
              this.stopIndex += 1;
            }, 200);

            if (this.stopIndex === this.numberOfReels - 1) {
              this.checkForWin();
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
          console.log(`WINNER! ${payline.winningRows}`);
          payline.show();
          setTimeout(() => {
            payline.hide();
          }, 2000);
          newWinnings += (1 + symbol.value) * 5;
        }
      }
    }
    this.winnings += newWinnings;
  }

  takePayment() {
    this.winnings -= 1;
  }

  start(): void {
    this.takePayment();
    this.spinning = true;

    for (let reel of this.reels) {
      this.spin(reel);
    }
  }

  stop(): void {
    this.stopIndex = 0;
    this.spinning = false; 
  }

  ngOnInit(): void {
    
  }
}

class Reel {
  public symbols: Symbol[];
  public column: number;

  constructor(data: Partial<Reel>){
    Object.assign(this, data);
  }
}

class Symbol {
  public picture: string;
  public id: string;
  public color: string;
  public value: number;

  constructor(data: Partial<Symbol>){
    Object.assign(this, data);
  }
}



