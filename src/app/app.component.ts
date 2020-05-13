import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slot-machine';
  numberOfReels = 5;
  numberOfSymbols = 7;
  reels = new Array<Reel>();
  spinning = false;
  stopIndex = 0;

  constructor() {
    for (let i = 0; i < this.numberOfReels; i++) {
      const symbols = new Array<Symbol>();
      for (let j = 0; j < this.numberOfSymbols; j++) {
        symbols.push(new Symbol({
          color: this.getRandomColor(),
          picture: j.toString(),
          value: j
        }))
      }
      this.reels.push(new Reel({
        symbols: symbols,
        column: i
      }));
    }
  }



  getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  spin(reel: Reel): void {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        reel.symbols.pop();
        reel.symbols.unshift(new Symbol({
          color: this.getRandomColor(),
          picture: "hi",
          value: 1
        }));
        if (this.spinning) {
          this.spin(reel);
        } else {
          if (this.stopIndex === reel.column) {
            setTimeout(() => {
              this.stopIndex += 1;
            }, 200);
          } else {
            this.spin(reel);
          }
        }
      }, 100);
    });
  }

  start(): void {
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
  public color: string;
  public value: number;

  constructor(data: Partial<Symbol>){
    Object.assign(this, data);
  }
}