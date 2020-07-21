import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaylineComponent } from './payline/payline.component';
import { paylines } from './paylines';
import { SymbolsService, SlotSymbol } from './symbols.service';
import { animationFrameScheduler } from 'rxjs';

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
  minBetAmount = 50;
  // Current amount being bet
  betAmount = this.minBetAmount;
  // An array of paylines used to calculate wins
  paylineValues = paylines;
  // Current user winnings (start with 1000)
  winnings = 1000;
  // Spinning speed in ms (must match css)
  spinSpeed = 80;
  // An array of child payline components, each one representing a payline in the GUI
  @ViewChildren(PaylineComponent) paylineComponents: QueryList<PaylineComponent>;
  // List of song options
  audio: object = {
      "xs-win": new Audio('assets/aud/xs-win.wav'),
      "sm-win": new Audio('assets/aud/sm-win.wav'),
      "ms-win": new Audio('assets/aud/ms-win.wav'),
      "ml-win": new Audio('assets/aud/ml-win.wav'),
      "lg-win": new Audio('assets/aud/lg-win.wav'),
      "xl-win": new Audio('assets/aud/xl-win.wav'),
      "jp-win": new Audio('assets/aud/jp-win.wav')
  }


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

  /**
   * Method called by the GUI to increase the bet as long
   * as the betAmount doesn't exceed the maxBetAmount
   */
  increaseBet() {
    if (this.betAmount < this.maxBetAmount) {
      this.betAmount += this.minBetAmount;
    }
  }

  /**
   * Method called by the GUI to decrease the bet as long
   * as the betAmount doesn't fall below the minBetAmount
   */
  decreaseBet() {
    if (this.betAmount > this.minBetAmount) {
      this.betAmount -= this.minBetAmount;
    }
  }

  /**
   * Method to determine whether or not the current spin
   * is a win or not.
   */
  checkForWin() {
    // Amount that was won!
    let newWinnings = 0;
    // Iterate through each payline, and check whether the path
    // shows up on the reels.  In other words see all parts of
    // the payline fall on the same symbols.
    for (const payline of this.paylineComponents) {
      // Get the first symbol that the payline falls on to compare to the rest
      let symbolToMatch: SlotSymbol = this.reels[0].symbols[payline.winningRows[0]];
      // Keep a list of the symbols that won
      const winningSymbols = [symbolToMatch];
      // Start on the second reel and check if each matches the first symbol
      for (let i = 1; i < this.numberOfReels; i++) {
        // Check that the payline falls on the same symbol for each reel
        const paylineIndex: number = payline.winningRows[i];
        if (symbolToMatch.id !== this.reels[i].symbols[paylineIndex].id) {
          // If not, break
          break;
        }
        // Add each symbol to the list of winning symbols
        winningSymbols.push(this.reels[i].symbols[paylineIndex]);
        // If we reach the last reel, all of the symbols must have matched
        // therefore this spin is a win
        if (i === this.numberOfReels - 1) {
          // Mark each symbol 
          newWinnings += this.handlePaylineWin(winningSymbols, payline)
        }
      }
    }
    // If 3 or more jackpot symbols appear, a jackpot is triggered...
    // so here it's simply counting the number of jackpot symbols across
    // all of the reels.
    let jackpotSymbolsCount = 0;
    const winningJackpotSymbols = [];
    for (let i = 0; i < this.numberOfReels; i++) {
      for (let j = 0; j < this.numberOfRows; j++) {
        if (this.reels[i].symbols[j].id === '8') {
          jackpotSymbolsCount += 1;
          winningJackpotSymbols.push(this.reels[i].symbols[j]);
        }
      }
    }
    // If there are 3 or more jackpot symbols, trigger a jackpot
    if (jackpotSymbolsCount >= 3) {
      this.playWinningAudio(undefined, true);
      newWinnings += this.handleJackpotWin(winningJackpotSymbols);
      this.winnings += newWinnings * (this.betAmount / this.minBetAmount);
    } else {
      // Otherwise add the new winnings and play a song if applicable
      this.winnings += newWinnings * (this.betAmount / this.minBetAmount);
      this.playWinningAudio(newWinnings);
    }
  }

  /**
   * Helper method that handles what happens win a certain payline wins
   * @param winningSymbols - the list of symbols that won
   * @param payline - the payline that won
   * @returns {number} - the amount won from the payline
   */
  handlePaylineWin(winningSymbols: Array<SlotSymbol>, payline: PaylineComponent) {
    // Mark each winning symbol as a winner, this will make the symbol animate in the GUI
    for (const winningSymbol of winningSymbols) {
      winningSymbol.won = true;
    }
    // Display the payline then hide it after 5 seconds
    payline.show();
    setTimeout(() => {
      payline.hide();
    }, 5000);
    // Return the value of the win.
    return (7 * winningSymbols[0].value) + 3;
  }

  /**
   * Helper method that handles when a jackpot wins
   * @param winningSymbols - the list of jackpot symbols that appeared
   * @returns {number} - the amount won from the jackpot
   */
  handleJackpotWin(winningSymbols: Array<SlotSymbol>) {
    for (const winningSymbol of winningSymbols) {
      winningSymbol.won = true;
    }
    return (100 * winningSymbols[0].value);
  }

  /**
   * Method to determine and play the appropriate win audio
   * @param newWinnings - the amount that was won
   * @param jackpot - whether the jackpot was won
   */
  playWinningAudio(newWinnings: number = 0, jackpot: boolean = false) {
    if (jackpot) {
      this.audio['jp-win'].play();
    } else if (newWinnings > 0) {
      console.log(newWinnings);
      if (newWinnings <= this.betAmount) {
        this.audio['xs-win'].play();
      } else if (newWinnings <= this.betAmount * 2) {
        this.audio['sm-win'].play();
      } else if (newWinnings <= this.betAmount * 4) {
        this.audio['ms-win'].play();
      } else if (newWinnings <= this.betAmount * 8) {
        this.audio['ml-win'].play();
      } else if (newWinnings <= this.betAmount * 16) {
        this.audio['lg-win'].play();
      } else {
        this.audio['xl-win'].play();
      }
    }
  }

  /**
   * Very simple method to subtract the payment for each spin
   */
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
