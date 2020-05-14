import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: '[app-payline]',
  templateUrl: './payline.component.html',
  styleUrls: ['./payline.component.scss']
})
export class PaylineComponent implements OnInit {
  @Input() public winningRows: number[];
  @Input() public totalRows: number;
  public showLine: boolean = false;

  constructor() {

  }

  show() {
    this.showLine = true;
  }

  hide() {
    this.showLine = false;
  }

  get svgPath(): string {
    const totalColumns = this.winningRows.length;
    let path = "M"
    let x = Math.round((100 / totalColumns) / 2);
    let y = 0;

    for (let row of this.winningRows) {
      if (y !== 0) {
        path += " L"
      }

      y = Math.round((100 * ((row + 1) / this.totalRows)) - ((100 / this.totalRows) / 2));
      path += ` ${x},${y}`;
      x += Math.round(100 / totalColumns);
    }

    return path;
  }

  ngOnInit(): void {
  }

}