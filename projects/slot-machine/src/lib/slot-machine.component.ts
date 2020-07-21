import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaylineComponent } from './payline/payline.component';
import { paylines } from './paylines';
import { SymbolsService, SlotSymbol } from './symbols.service';

@Component({
  selector: 'lib-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss']
})

/**
 * @class a class representing a slot machine
 */
export class SlotMachineComponent {
  // Name of the slot machine DOM object
  title = 'slot-machine';
  // Number of slot machine reels
  numberOfReels = 5;
  // Number of slot machine rows
  numberOfRows = 5;
  // Number of physical symbols per reel at any given time
  numberOfSymbols = this.numberOfRows + 1;
  // An array of slot machine reels
  reels = new Array<Reel>();
  // Whether or not the slot machine is currently spinning
  spinning = false;
  // Whether or not the slot machine is in the process of stopping
  stopping = false;
  // An index to keep track of which reel is next to stop where 0 is the first reel
  // and this.numberOfReels - 1 is the last reel
  stopIndex = 0;
  // Maximum amount that can be bet
  maxBetAmount = 1000;
  // Minimum amount that can be bet
  minimumBetAmount = 50;
  // Current amount being bet
  betAmount = this.minimumBetAmount;
  // An array of paylines used to calculate wins
  paylineValues = paylines;
  // Current user winnings (start with 1000)
  winnings = 1000;
  // Spinning speed in ms (must match css)
  spinSpeed = 80;
  // An array of child payline components, each one representing a payline in the GUI
  @ViewChildren(PaylineComponent) paylineComponents: QueryList<PaylineComponent>;


  /**
   * Constructor creates the slot machine reels, and adds
   * symbols to them to begin with.
   * @param symbolsService - a singleton service controlling
   * the allowed symbols for the slot machine
   */
  constructor(public symbolsService: SymbolsService) {
    // Generate each reel
    for (let i = 0; i < this.numberOfReels; i++) {
      // Generate the symbols for each reel
      const symbols = new Array<SlotSymbol>();
      for (let j = 0; j < this.numberOfSymbols; j++) {
        symbols.push(this.symbolsService.getNewSymbol());
      }
      // Add the reel to the list of all reels
      this.reels.push(new Reel({
        symbols,
        column: i
      }));
    }
  }

  /**
   * Simple method to get a "0" padded string to display
   * the winnings in the GUI
   * @returns {string} a zero padded string of the current user winnings
   */
  getWinningsString(): string {
     return ('0000000' + this.winnings).slice(-7);
  }

  /**
   * Method to spin a reel and generate new
   * symbols for it
   * @param reel - the reel to begin spinning
   */
  spin(reel: Reel): void {
    // Waiting for an animation frame to make spinning smoother
    // FIXME: optimize adding in new symbols and "spinning" the reels
    const frame = window.requestAnimationFrame(() => {
      // remove the last symbol
      reel.symbols.pop();
      // insert a new symbol to the front of the array, 
      // bindings will cause a new DOM symbol to be created
      reel.symbols.unshift(this.symbolsService.getNewSymbol());

      // If the slot machine is still spinning
      if (this.spinning) {
        setTimeout(() => {
          this.spin(reel);
        }, this.spinSpeed);
      // If the slot machine has stopped spinning
      } else {
        // This checks if the stop index matches the current
        // reel and if so stops the reel.  This gives the effect
        // of one reel stopping at a time.
        if (this.stopIndex === reel.column) {
          setTimeout(() => {
            this.stopIndex += 1;
          }, 200);
          // If the last reel is stopped, calculate whether a win has happened
          if (this.stopIndex === this.numberOfReels - 1) {
            this.checkForWin();
            this.stopping = false;
          }
        // If the reel hasn't hit its stop index, continue spinning it
        } else {
          setTimeout(() => {
            this.spin(reel);
          }, this.spinSpeed);
        }
      }
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
    if (jackpotSymbols >= 3) {
      this.symbolsService.audio['jp-win'].play();
    } else if (newWinnings > 0) {
      console.log(newWinnings);
      if (newWinnings <= this.betAmount) {
        this.symbolsService.audio['xs-win'].play();
      } else if (newWinnings <= this.betAmount * 2) {
        this.symbolsService.audio['sm-win'].play();
      } else if (newWinnings <= this.betAmount * 4) {
        this.symbolsService.audio['ms-win'].play();
      } else if (newWinnings <= this.betAmount * 8) {
        this.symbolsService.audio['ml-win'].play();
      } else if (newWinnings <= this.betAmount * 16) {
        this.symbolsService.audio['lg-win'].play();
      } else {
        this.symbolsService.audio['xl-win'].play();
      }
    }
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
