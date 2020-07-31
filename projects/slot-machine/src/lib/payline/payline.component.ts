import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: '[lib-payline]',
  templateUrl: './payline.component.html',
  styleUrls: ['./payline.component.scss']
})

/**
 * @class Simple component representing a payline
 */
export class PaylineComponent implements OnInit {
  // The an array of column rows that make up the payline ([0, 2] = column 0 row 0, column 1 row 2)
  @Input() public winningRows: number[];
  // The total number of rows in each column
  @Input() public totalRows: number;
  // Whether or not to display the payline
  public showLine = false;

  constructor() {}

  // Display the payline
  show() {
    this.showLine = true;
  }

  // Hide the payline
  hide() {
    this.showLine = false;
  }

  // Calculate the SVG path string to draw the line
  get svgPath(): string {
    const totalColumns = this.winningRows.length;
    let path = 'M';
    let x = Math.round((100 / totalColumns) / 2);
    let y = 0;

    for (const row of this.winningRows) {
      if (y !== 0) {
        path += ' L';
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
